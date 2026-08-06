/* Kurenai OS — core/ai.js (Category 6 Phase A)
   The normalized model-provider layer for the Kurenai Assistant.

   Three providers behind ONE interface:
     ollama   — the user's own machine, client-side transport (an Edge
                Function can never reach localhost). Availability is checked
                on demand, never assumed — especially not on phones.
     gemini   — via the ai-chat Edge Function (JWT + server-side key,
                server-enforced daily cap). Raw REST, no SDK, server-side.
     deepseek — same Edge Function path.

   Routing is PER TASK CATEGORY (tutor / crud / generation / complex), not
   one global model. Fallback to another provider happens ONLY when the
   user explicitly configured one for that category — a local→billable
   switch is never silent: the result carries usedFallback and the UI says
   so. Config lives in state.assistant (created lazily, like state.study);
   it holds NO secrets — the provider keys exist only as Edge Function
   secrets, and Ollama needs none.

   Boundary notes:
   - This file never executes tools and never touches domain data; it moves
     messages. The orchestrator (Phase C) owns tools/confirmation/audit.
   - A failed provider call never breaks anything local — errors are
     normalized {kind, message, retryable, correlationId} with kinds
     config | auth | rate | network | provider | timeout | cancelled.
   - Retries: ONE automatic retry, network-kind failures only (the request
     never reached a provider, so it cannot double-bill or double-run).
     Everything else surfaces. Callers can pass noRetry:true (the
     orchestrator does, after any turn in which a tool executed).          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var CATEGORIES = ["tutor", "crud", "generation", "complex"];
  var DEFAULT_ROUTING = {
    tutor:      { provider: "gemini",   model: "gemini-3.5-flash" },
    crud:       { provider: "ollama",   model: "" },   // model = the user's pulled model
    generation: { provider: "deepseek", model: "deepseek-v4-flash" },
    complex:    { provider: "gemini",   model: "gemini-3.5-flash" }
  };
  var DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";
  var REQUEST_TIMEOUT = 120000;   // whole-call ceiling, ms
  var OLLAMA_HEALTH_TIMEOUT = 2500;

  /* capability flags per provider. Ollama's real tool/structured support
     depends on which model the user pulled — modelDependent flags that. */
  var CAPABILITIES = {
    gemini:   { toolCalling: true, structuredOutput: true, streaming: false, systemPrompt: true, modelDependent: false },
    deepseek: { toolCalling: true, structuredOutput: true, streaming: false, systemPrompt: true, modelDependent: false },
    ollama:   { toolCalling: true, structuredOutput: true, streaming: false, systemPrompt: true, modelDependent: true }
  };

  /* ---------------- config (lazily created, no secrets) ---------------- */
  function cfg() {
    var s = store.state;
    if (!s.assistant) s.assistant = {};
    var a = s.assistant;
    if (!a.routing) a.routing = JSON.parse(JSON.stringify(DEFAULT_ROUTING));
    if (!a.fallback) a.fallback = { tutor: null, crud: null, generation: null, complex: null };
    if (!a.ollama) a.ollama = { url: DEFAULT_OLLAMA_URL };
    if (!a.ollamaUsage) a.ollamaUsage = { day: null, count: 0 };
    return a;
  }
  function setRouting(category, provider, model) {
    if (CATEGORIES.indexOf(category) === -1) return false;
    if (!CAPABILITIES[provider]) return false;
    cfg().routing[category] = { provider: provider, model: String(model || "") };
    store.save();
    return true;
  }
  function setFallback(category, spec) {
    if (CATEGORIES.indexOf(category) === -1) return false;
    if (spec && !CAPABILITIES[spec.provider]) return false;
    cfg().fallback[category] = spec ? { provider: spec.provider, model: String(spec.model || "") } : null;
    store.save();
    return true;
  }
  function setOllamaUrl(url) {
    url = String(url || "").trim().replace(/\/+$/, "");
    cfg().ollama.url = url || DEFAULT_OLLAMA_URL;
    store.save();
  }

  /* ---------------- errors + correlation ---------------- */
  var seq = 0;
  function newCorrelationId() {
    return "kos-" + Date.now().toString(36) + "-" + (++seq) + "-" + Math.random().toString(36).slice(2, 8);
  }
  function mkErr(kind, message, retryable, correlationId) {
    var e = new Error(message);
    e.kind = kind;
    e.retryable = !!retryable;
    e.correlationId = correlationId || null;
    return e;
  }

  /* in-flight registry → cancellation */
  var inflight = {};   // correlationId -> AbortController
  function cancel(correlationId) {
    var c = inflight[correlationId];
    if (c) { c.abort(); delete inflight[correlationId]; return true; }
    return false;
  }

  /* test seams: injectable fetch (Ollama transport + health) and edge
     invoke (the ai-chat path) so the smoke suites run with zero network */
  var _fetch = null;   // (url, opts) -> Promise<Response-like>
  var _invoke = null;  // (body, cb(err, data, status))
  function doFetch(url, opts) { return (_fetch || window.fetch)(url, opts); }

  /* ---------------- edge transport (gemini / deepseek) ---------------- */
  function edgeReady() {
    return !!(KOS.cloud && KOS.cloud.available() && KOS.cloud.userId());
  }
  function edgeNotReadyError(correlationId) {
    if (!KOS.cloud || !KOS.cloud.configured()) {
      return mkErr("config", "Online assistant models need cloud sync, which isn't configured on this device (see Archive → Account & Cloud Sync).", false, correlationId);
    }
    return mkErr("auth", "Sign in to cloud sync first (Archive → Account & Cloud Sync) — the online assistant models authenticate through your account.", false, correlationId);
  }
  function invokeEdge(body, cb) {
    if (_invoke) { _invoke(body, cb); return; }
    var client = KOS.cloud.client();
    client.functions.invoke("ai-chat", { body: body }).then(function (res) {
      if (!res.error) { cb(null, res.data, 200); return; }
      var ctx = res.error.context;
      if (ctx && typeof ctx.json === "function") {
        var status = ctx.status || 0;
        ctx.json().then(function (payload) {
          cb(new Error((payload && payload.error) || res.error.message || "The assistant server failed."),
            payload || null, status);
        }).catch(function () {
          cb(new Error(res.error.message || "The assistant server failed."), null, status);
        });
      } else {
        cb(new Error(res.error.message || "The assistant server failed — network?"), null, 0);
      }
    }).catch(function (e) {
      cb(new Error((e && e.message) || "The assistant server is unreachable — network?"), null, 0);
    });
  }
  function edgeKind(status, payload) {
    if (payload && payload.kind) return payload.kind;
    if (status === 401) return "auth";
    if (status === 429) return "rate";
    if (status === 400) return "provider";
    if (status === 503) return "config";
    if (status === 0) return "network";
    return "provider";
  }
  function chatEdge(provider, model, request, correlationId, cb) {
    if (!edgeReady()) { cb(edgeNotReadyError(correlationId)); return; }
    var body = {
      provider: provider,
      model: model,
      category: request.category || null,
      messages: request.messages,
      system: request.system || undefined,
      tools: request.tools && request.tools.length ? request.tools : undefined,
      structured: request.structured || undefined,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      correlationId: correlationId
    };
    invokeEdge(body, function (err, data, status) {
      if (err) {
        var kind = edgeKind(status, data);
        cb(mkErr(kind, err.message, kind === "network", correlationId));
        return;
      }
      cb(null, {
        text: (data && data.text) || "",
        toolCalls: (data && data.toolCalls) || [],
        usage: (data && data.usage) || { prompt: null, completion: null },
        finishReason: (data && data.finishReason) || "stop",
        provider: provider,
        model: model,
        correlationId: correlationId,
        remaining: data ? data.remaining : null
      });
    });
  }

  /* ---------------- Ollama transport (client-side, local) ----------------
     The user's own machine: http://127.0.0.1:11434 by default. Browsers
     enforce CORS here — Ollama must be started with OLLAMA_ORIGINS allowing
     this app's origin (the Help/settings UI explains the exact value).
     Connection refused / timeout are NORMAL states (app on a phone, Ollama
     not running) and must fail into a clear message, never a hang.        */
  function ollamaMessages(request) {
    var out = [];
    if (request.system) out.push({ role: "system", content: request.system });
    (request.messages || []).forEach(function (m) {
      if (m.role === "tool") {
        out.push({ role: "tool", content: m.content || "" });
      } else if (m.role === "assistant") {
        var msg = { role: "assistant", content: m.content || "" };
        if (m.toolCalls && m.toolCalls.length) {
          msg.tool_calls = m.toolCalls.map(function (tc) {
            return { function: { name: tc.name, arguments: tc.args } };
          });
        }
        out.push(msg);
      } else {
        out.push({ role: "user", content: m.content || "" });
      }
    });
    return out;
  }
  /* Ollama tool-parameter sanitizer (client-side analogue of the Gemini
     adapter's geminiSchema): the model needs only the STRUCTURAL + semantic
     keywords to SELECT a tool — validation-only keywords (additionalProperties,
     length/range bounds, pattern, format, …) are dead weight in the payload
     and inflate the local model's tiny context window. Ollama accepts them,
     but stripping them shrinks the request. The client keeps the FULL strict
     schema for Phase B validation (KOS.ai.tools.validate reads the registry,
     not this transmitted copy) — this only trims what's sent to the model.
     Whitelist, so anything unknown is dropped. */
  var OLLAMA_SCHEMA_KEYS = { type: 1, description: 1, enum: 1, properties: 1, required: 1, items: 1, anyOf: 1 };
  function ollamaSchema(schema) {
    if (Array.isArray(schema)) return schema.map(ollamaSchema);
    if (!schema || typeof schema !== "object") return schema;
    var out = {};
    Object.keys(schema).forEach(function (k) {
      if (!OLLAMA_SCHEMA_KEYS[k]) return;
      if (k === "properties" && schema[k] && typeof schema[k] === "object") {
        var cleaned = {};
        Object.keys(schema[k]).forEach(function (p) { cleaned[p] = ollamaSchema(schema[k][p]); });
        out[k] = cleaned;
      } else if (k === "items" || k === "anyOf") {
        out[k] = ollamaSchema(schema[k]);
      } else {
        out[k] = schema[k];
      }
    });
    return out;
  }
  /* extract the safe, redacted human message from an Ollama error body:
     Ollama returns {"error":"..."} or {"error":{"message":"..."}} */
  function ollamaErrorText(bodyText) {
    if (!bodyText) return "";
    var msg = "";
    try {
      var j = JSON.parse(bodyText);
      msg = (j && j.error && (j.error.message || j.error)) || "";
      if (typeof msg !== "string") msg = JSON.stringify(msg);
    } catch (e) { msg = bodyText; }
    /* never echo long token-like blobs, cap length */
    return String(msg).replace(/[A-Za-z0-9_-]{25,}/g, "…").slice(0, 200);
  }

  function chatOllama(model, request, correlationId, cb) {
    if (!model) {
      cb(mkErr("config", "No Ollama model is configured — set one in Assistant settings (e.g. a small tool-capable model you've pulled).", false, correlationId));
      return;
    }
    var a = cfg();
    var controller = new AbortController();
    inflight[correlationId] = controller;
    var timeoutMs = request.timeoutMs || REQUEST_TIMEOUT;
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    var hasTools = !!(request.tools && request.tools.length);
    var body = {
      model: model,
      messages: ollamaMessages(request),
      stream: false
    };
    if (hasTools) {
      body.tools = request.tools.map(function (t) {
        return { type: "function", function: { name: t.name, description: t.description, parameters: ollamaSchema(t.parameters) } };
      });
    }
    /* omit structured `format` on a tool-selection turn — a local model given
       both `tools` and a forced `format` conflicts (it can't emit a tool_call
       AND satisfy the JSON schema). format is for pure generation turns. */
    if (request.structured && !hasTools) body.format = request.structured.schema;
    /* Ollama runtime options: num_ctx enlarges the local context window (the
       orchestrator sizes history to fit it); num_predict reserves output. */
    var options = null;
    if (request.temperature != null) { options = options || {}; options.temperature = request.temperature; }
    if (request.numCtx) { options = options || {}; options.num_ctx = request.numCtx; }
    if (options) body.options = options;

    doFetch(a.ollama.url + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    }).then(function (res) {
      if (!res.ok) {
        if (res.status === 404) {
          throw mkErr("config", "Ollama doesn't know that model — pull it first (ollama pull <model>).", false, correlationId);
        }
        /* surface Ollama's real (redacted) error body, not just the status */
        return (res.text ? res.text() : Promise.resolve("")).then(function (t) {
          var detail = ollamaErrorText(t);
          throw mkErr("provider",
            "Ollama returned HTTP " + res.status + (detail ? ": " + detail : "") + ".", false, correlationId);
        });
      }
      return res.json();
    }).then(function (data) {
      clearTimeout(timer);
      delete inflight[correlationId];
      var msg = (data && data.message) || {};
      var toolCalls = [];
      (msg.tool_calls || []).forEach(function (tc, i) {
        var fn = tc["function"] || {};
        toolCalls.push({
          id: "o" + i,
          name: fn.name || "",
          args: (fn["arguments"] && typeof fn["arguments"] === "object") ? fn["arguments"] : {}
        });
      });
      /* local visibility counter — never treated as spend */
      var today = KOS.srs.todayISO();
      if (a.ollamaUsage.day !== today) { a.ollamaUsage.day = today; a.ollamaUsage.count = 0; }
      a.ollamaUsage.count++;
      store.save();
      cb(null, {
        text: typeof msg.content === "string" ? msg.content : "",
        toolCalls: toolCalls,
        usage: {
          prompt: typeof data.prompt_eval_count === "number" ? data.prompt_eval_count : null,
          completion: typeof data.eval_count === "number" ? data.eval_count : null
        },
        finishReason: data.done_reason || "stop",
        provider: "ollama",
        model: model,
        correlationId: correlationId,
        remaining: null
      });
    }).catch(function (e) {
      clearTimeout(timer);
      delete inflight[correlationId];
      if (e && e.kind) { cb(e); return; }
      if (e && e.name === "AbortError") {
        cb(mkErr(inflight._cancelled === correlationId ? "cancelled" : "timeout",
          "Ollama didn't answer in time — is it running?", false, correlationId));
        return;
      }
      cb(mkErr("network",
        "Couldn't reach Ollama at " + a.ollama.url + " — it isn't running, or its CORS origins don't allow this app (start it with OLLAMA_ORIGINS set; see Assistant settings).",
        true, correlationId));
    });
  }

  /* ---------------- health / availability ---------------- */
  function health(provider, cb) {
    if (provider === "ollama") {
      var a = cfg();
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, OLLAMA_HEALTH_TIMEOUT);
      doFetch(a.ollama.url + "/api/tags", { method: "GET", signal: controller.signal })
        .then(function (res) {
          clearTimeout(timer);
          if (!res.ok) { cb(null, { provider: "ollama", available: false, reason: "HTTP " + res.status }); return; }
          return res.json().then(function (data) {
            var models = ((data && data.models) || []).map(function (m) { return m.name || m.model || ""; }).filter(Boolean);
            cb(null, { provider: "ollama", available: true, models: models, url: a.ollama.url });
          });
        })
        .catch(function () {
          clearTimeout(timer);
          cb(null, {
            provider: "ollama", available: false, url: a.ollama.url,
            reason: "unreachable (not running, or OLLAMA_ORIGINS doesn't allow this app's origin)"
          });
        });
      return;
    }
    if (provider === "gemini" || provider === "deepseek") {
      if (!edgeReady()) { cb(null, { provider: provider, available: false, reason: "cloud sign-in required" }); return; }
      invokeEdge({ action: "health" }, function (err, data) {
        if (err) { cb(null, { provider: provider, available: false, reason: err.message }); return; }
        var p = data && data.providers && data.providers[provider];
        cb(null, {
          provider: provider,
          available: !!(p && p.configured),
          reason: p && p.configured ? null : "server key not configured",
          used: p ? p.used : null,
          cap: data ? data.cap : null
        });
      });
      return;
    }
    cb(new Error("Unknown provider: " + provider));
  }

  /* ---------------- the normalized chat entry points ---------------- */
  /* chatWith: one provider, one attempt policy (single network-kind retry
     unless noRetry). request: {messages, system?, tools?, structured?,
     temperature?, maxTokens?, category?, timeoutMs?, noRetry?}            */
  function chatWith(provider, model, request, cb) {
    var correlationId = newCorrelationId();
    var attempts = 0;
    function attempt() {
      attempts++;
      var done = function (err, res) {
        if (err && err.kind === "network" && err.retryable && attempts < 2 && !request.noRetry) {
          setTimeout(attempt, 600);
          return;
        }
        cb(err, res);
      };
      if (provider === "ollama") chatOllama(model, request, correlationId, done);
      else if (provider === "gemini" || provider === "deepseek") chatEdge(provider, model, request, correlationId, done);
      else cb(mkErr("config", "Unknown provider: " + provider, false, correlationId));
    }
    attempt();
    return correlationId;
  }

  /* chat: route by task category, honouring the user's routing table and
     EXPLICIT fallback only. Never a silent switch: a fallback result
     carries usedFallback + fellBackFrom for the UI to state plainly.      */
  function chat(category, request, cb) {
    if (CATEGORIES.indexOf(category) === -1) {
      cb(mkErr("config", "Unknown task category: " + category, false, null));
      return null;
    }
    var a = cfg();
    var route = a.routing[category] || DEFAULT_ROUTING[category];
    request = request || {};
    request.category = category;
    return chatWith(route.provider, route.model, request, function (err, res) {
      if (!err) { cb(null, res); return; }
      var fb = a.fallback[category];
      var fallbackable = err.kind === "network" || err.kind === "config" ||
                         err.kind === "timeout" || err.kind === "provider";
      if (fb && fallbackable && !request.noFallback) {
        chatWith(fb.provider, fb.model, request, function (err2, res2) {
          if (err2) { err2.fellBackFrom = route.provider; cb(err2); return; }
          res2.usedFallback = true;
          res2.fellBackFrom = route.provider;
          cb(null, res2);
        });
        return;
      }
      cb(err);
    });
  }

  /* ---------------- usage visibility ---------------- */
  function usage(cb) {
    var a = cfg();
    var out = { ollama: { usedToday: a.ollamaUsage.day === KOS.srs.todayISO() ? a.ollamaUsage.count : 0, billable: false } };
    if (!edgeReady()) { cb(null, out); return; }
    invokeEdge({ action: "health" }, function (err, data) {
      if (!err && data && data.providers) {
        Object.keys(data.providers).forEach(function (p) {
          out[p] = { usedToday: data.providers[p].used, cap: data.cap, configured: data.providers[p].configured, billable: true };
        });
      }
      cb(null, out);
    });
  }

  KOS.ai = {
    CATEGORIES: CATEGORIES,
    DEFAULT_ROUTING: DEFAULT_ROUTING,
    capabilities: function (provider) { return CAPABILITIES[provider] || null; },
    config: cfg,
    setRouting: setRouting,
    setFallback: setFallback,
    setOllamaUrl: setOllamaUrl,
    health: health,
    chat: chat,
    chatWith: chatWith,
    cancel: function (correlationId) {
      inflight._cancelled = correlationId;
      return cancel(correlationId);
    },
    usage: usage,
    edgeReady: edgeReady,
    /* test seams — smoke20 injects transports so no test touches a network */
    _config: function (opts) {
      opts = opts || {};
      if ("fetch" in opts) _fetch = opts.fetch;
      if ("invoke" in opts) _invoke = opts.invoke;
    }
  };
})();
