/* Kurenai OS — core/aimemory.js (Category 6 Phase D)
   Conversation persistence + cross-session memory over the Build 4a
   Supabase patterns. Two namespaces:

   KOS.ai.convo — conversations and messages (kos_assistant_conversations /
   kos_assistant_messages, owner-only RLS, client-minted UUIDs). Message
   ordering is DETERMINISTIC via a client seq (monotonic ms*1000+counter)
   stored in the content jsonb — server created_at alone can collide.
   assembleContext() is the bounded-context policy: never unlimited
   history; recent turns within a messages+chars budget; older turns fold
   into a compact running summary stored on the conversation row. Assembled
   history is TEXT ONLY — prior tool calls/results are rendered as short
   "[used tool: …]" lines, never as executable toolCalls structures, so
   resuming a conversation can never replay a past action. Summaries are
   labelled non-authoritative; they are conversation colour, not tool
   state.

   KOS.ai.memory — the deliberately simple notes-to-self store
   (kos_assistant_memory). EXPLICIT CONSENT ONLY: rows are written when the
   user asks directly (UI/manage surface) or approves a clearly presented
   proposal — the assistant-side write tools are consequential-tier, so
   Phase C's confirmation card IS the approval. Nothing is ever inferred
   and stored silently. A secrets screen refuses API keys, tokens,
   passwords and token-shaped blobs before anything persists. Everything
   is listable, editable and deletable — memory never becomes hidden
   profile state, and recalled content is DATA, never instructions.

   Signed out / offline: available() says so, writes fail with a clear
   error to the caller (nothing silently dropped), and the orchestrator
   keeps the CURRENT conversation working in memory while surfacing a
   persistence warning.                                                    */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  KOS.ai = KOS.ai || {};

  var LIMITS = {
    contextMessages: 30,      // most-recent turns sent to a provider
    contextChars: 24000,      // total serialized budget for history
    messageChars: 16000,      // one message's text ceiling
    toolLineChars: 200,       // a folded tool line in assembled history
    summaryChars: 2000,       // the stored running summary
    memoryChars: 2000,        // one memory row
    memoriesInPrompt: 20,     // memories surfaced to the model
    titleChars: 120
  };

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function clamp(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }

  /* deterministic client sequence — strictly monotonic in this session */
  var seqCounter = 0, lastSeqMs = 0;
  function nextSeq() {
    var ms = Date.now();
    if (ms === lastSeqMs) seqCounter++;
    else { lastSeqMs = ms; seqCounter = 0; }
    return ms * 1000 + seqCounter;
  }

  /* ---------------- data access (seam-able) ----------------
     _api implements {select(table, match, order, cb), insert(table, row,
     cb), update(table, match, patch, cb), remove(table, match, cb)} where
     match is an equality map. The real implementation rides the user's own
     Supabase session — RLS is the boundary; user_id is ALWAYS in the match
     so the client never even asks for another user's rows.               */
  var _api = null;
  function userId() { return KOS.cloud && KOS.cloud.userId ? KOS.cloud.userId() : null; }
  function persistAvailable() {
    if (_api) return { persist: true };
    if (!KOS.cloud || !KOS.cloud.configured()) return { persist: false, reason: "Cloud sync isn't configured on this device." };
    if (!KOS.cloud.available() || !userId()) return { persist: false, reason: "Sign in to cloud sync to keep assistant history across sessions." };
    return { persist: true };
  }
  function db() {
    if (_api) return _api;
    var client = KOS.cloud.client();
    return {
      select: function (table, match, order, cb) {
        var q = client.from(table).select("*");
        Object.keys(match).forEach(function (k) { q = q.eq(k, match[k]); });
        if (order) q = q.order(order.col, { ascending: !!order.asc });
        q.then(function (res) { cb(res.error ? new Error(res.error.message) : null, res.data || []); })
          .catch(function (e) { cb(new Error((e && e.message) || "Cloud request failed — network?")); });
      },
      insert: function (table, row, cb) {
        client.from(table).insert(row)
          .then(function (res) { cb(res.error ? new Error(res.error.message) : null); })
          .catch(function (e) { cb(new Error((e && e.message) || "Cloud request failed — network?")); });
      },
      update: function (table, match, patch, cb) {
        var q = client.from(table).update(patch);
        Object.keys(match).forEach(function (k) { q = q.eq(k, match[k]); });
        q.then(function (res) { cb(res.error ? new Error(res.error.message) : null); })
          .catch(function (e) { cb(new Error((e && e.message) || "Cloud request failed — network?")); });
      },
      remove: function (table, match, cb) {
        var q = client.from(table)["delete"]();
        Object.keys(match).forEach(function (k) { q = q.eq(k, match[k]); });
        q.then(function (res) { cb(res.error ? new Error(res.error.message) : null); })
          .catch(function (e) { cb(new Error((e && e.message) || "Cloud request failed — network?")); });
      }
    };
  }
  function requirePersist(cb) {
    var a = persistAvailable();
    if (!a.persist) { cb(new Error(a.reason)); return null; }
    var uid = _api ? (userId() || "test-user") : userId();
    return uid;
  }

  /* ================================================================
     CONVERSATIONS
     ================================================================ */
  function createConvo(title, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    var convo = { id: uuid(), user_id: uid, title: clamp(title || "New conversation", LIMITS.titleChars), summary: "" };
    db().insert("kos_assistant_conversations", convo, function (err) {
      cb(err, err ? null : { id: convo.id, title: convo.title, summary: "" });
    });
  }
  function listConvos(cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    db().select("kos_assistant_conversations", { user_id: uid }, { col: "updated_at", asc: false }, function (err, rows) {
      cb(err, (rows || []).map(function (r) {
        return { id: r.id, title: r.title, summary: r.summary, updatedAt: r.updated_at || null };
      }));
    });
  }
  function renameConvo(id, title, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    title = clamp(String(title || "").trim(), LIMITS.titleChars);
    if (!title) { cb(new Error("A conversation needs a title.")); return; }
    db().update("kos_assistant_conversations", { id: id, user_id: uid }, { title: title }, cb);
  }
  function removeConvo(id, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    /* messages cascade via the FK; delete the parent row */
    db().remove("kos_assistant_conversations", { id: id, user_id: uid }, cb);
  }
  function setSummary(id, summary, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    db().update("kos_assistant_conversations", { id: id, user_id: uid },
      { summary: clamp(summary, LIMITS.summaryChars) }, cb || function () {});
  }

  function msgSort(a, b) {
    var sa = a.content && a.content.seq, sb = b.content && b.content.seq;
    if (sa != null && sb != null && sa !== sb) return sa - sb;
    if (a.created_at !== b.created_at) return a.created_at < b.created_at ? -1 : 1;
    return String(a.id) < String(b.id) ? -1 : 1;
  }
  function getConvo(id, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    db().select("kos_assistant_conversations", { id: id, user_id: uid }, null, function (err, convos) {
      if (err) { cb(err); return; }
      if (!convos.length) { cb(new Error("That conversation doesn't exist (or isn't yours).")); return; }
      db().select("kos_assistant_messages", { conversation_id: id, user_id: uid },
        { col: "created_at", asc: true }, function (err2, msgs) {
          if (err2) { cb(err2); return; }
          msgs = (msgs || []).slice().sort(msgSort);
          cb(null, {
            conversation: { id: convos[0].id, title: convos[0].title, summary: convos[0].summary || "" },
            messages: msgs.map(function (m) { return { id: m.id, role: m.role, content: m.content, createdAt: m.created_at }; })
          });
        });
    });
  }

  /* append one message. msg: {role: "user"|"assistant"|"tool", text?,
     tools?:[{name, ok}], tool?, ok?, summary?}. Validated + size-capped —
     a malformed message saves NOTHING. */
  function appendMessage(conversationId, msg, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    if (!msg || typeof msg !== "object") { cb(new Error("Message must be an object.")); return; }
    if (["user", "assistant", "tool"].indexOf(msg.role) === -1) { cb(new Error("Bad message role.")); return; }
    var content = { seq: nextSeq() };
    if (msg.text != null) {
      if (typeof msg.text !== "string") { cb(new Error("Message text must be a string.")); return; }
      if (msg.text.length > LIMITS.messageChars) { cb(new Error("Message too long (max " + LIMITS.messageChars + " chars) — nothing was saved.")); return; }
      content.text = msg.text;
    }
    if (msg.role === "tool") {
      if (typeof msg.tool !== "string" || !msg.tool) { cb(new Error("A tool message needs its tool name.")); return; }
      content.tool = clamp(msg.tool, 80);
      content.ok = msg.ok !== false;
      if (msg.summary != null) content.summary = clamp(String(msg.summary), 400);
    }
    if (msg.role === "assistant" && Array.isArray(msg.tools)) {
      content.tools = msg.tools.slice(0, 8).map(function (t) {
        return { name: clamp(String(t.name || ""), 80), ok: t.ok !== false };
      });
    }
    if (msg.role !== "tool" && content.text == null) { cb(new Error("Message needs text.")); return; }
    db().insert("kos_assistant_messages", {
      id: uuid(), conversation_id: conversationId, user_id: uid,
      role: msg.role, content: content
    }, function (err) {
      /* touch the conversation so list ordering follows activity */
      if (!err) db().update("kos_assistant_conversations", { id: conversationId, user_id: uid }, {}, function () {});
      cb(err || null, err ? null : { seq: content.seq });
    });
  }

  /* ---------------- bounded context assembly ----------------
     Returns provider-shaped TEXT-ONLY history within the budget plus a
     summary line for whatever fell off the end. Prior tool activity is
     rendered inert:  "[used tool study_add_flashcard — ok]".             */
  function foldMessage(m) {
    var c = m.content || {};
    if (m.role === "tool") {
      return { role: "assistant", content: "[used tool " + (c.tool || "?") + (c.ok === false ? " — failed: " : " — ok") +
        (c.summary ? clamp(c.summary, LIMITS.toolLineChars) : "") + "]" };
    }
    var text = c.text || "";
    if (m.role === "assistant" && c.tools && c.tools.length) {
      text += (text ? "\n" : "") + c.tools.map(function (t) {
        return "[used tool " + t.name + (t.ok ? "]" : " — failed]");
      }).join(" ");
    }
    return { role: m.role, content: text };
  }
  function digestLine(m) {
    var c = m.content || {};
    if (m.role === "tool") return "tool " + (c.tool || "?") + (c.ok === false ? " failed" : " ok");
    return m.role + ": " + clamp((c.text || "").replace(/\s+/g, " "), 110);
  }
  function assembleContext(conversationId, opts, cb) {
    opts = opts || {};
    var maxMsgs = opts.maxMessages || LIMITS.contextMessages;
    var maxChars = opts.maxChars || LIMITS.contextChars;
    getConvo(conversationId, function (err, data) {
      if (err) { cb(err); return; }
      var all = data.messages;
      var kept = [], chars = 0;
      for (var i = all.length - 1; i >= 0; i--) {
        var folded = foldMessage(all[i]);
        var size = (folded.content || "").length + 20;
        if (kept.length >= maxMsgs || chars + size > maxChars) break;
        kept.unshift(folded);
        chars += size;
      }
      var droppedCount = all.length - kept.length;
      /* the summary is a PURE deterministic digest of everything outside
         the window — recomputing it is idempotent (no growth, no
         duplication); the conversation row's summary column just caches
         the latest value and is REPLACED whenever it changes. When the
         digest overflows its cap, the newest dropped lines win. */
      var summaryText = null;
      if (droppedCount > 0) {
        var lines = all.slice(0, droppedCount).map(digestLine);
        summaryText = lines.join(" · ");
        while (summaryText.length > LIMITS.summaryChars && lines.length > 1) {
          lines.shift();
          summaryText = "(…) " + lines.join(" · ");
        }
        summaryText = clamp(summaryText, LIMITS.summaryChars);
        if (summaryText !== data.conversation.summary) {
          setSummary(conversationId, summaryText, function () {});
        }
      } else if (data.conversation.summary) {
        /* nothing dropped this time (e.g. a caller passed a bigger budget)
           — the cached summary still describes older context */
        summaryText = data.conversation.summary;
      }
      cb(null, { messages: kept, summaryText: summaryText, dropped: droppedCount, total: all.length });
    });
  }

  KOS.ai.convo = {
    LIMITS: LIMITS,
    available: persistAvailable,
    create: createConvo,
    list: listConvos,
    get: getConvo,
    rename: renameConvo,
    remove: removeConvo,
    appendMessage: appendMessage,
    setSummary: setSummary,
    assembleContext: assembleContext,
    _config: function (o) { o = o || {}; if ("api" in o) _api = o.api; }
  };

  /* ================================================================
     CROSS-SESSION MEMORY — explicit consent only
     ================================================================ */
  /* the secrets screen: refuse anything credential-shaped BEFORE saving */
  var SECRET_PATTERNS = [
    /api[_\s-]?key/i, /secret/i, /passw(or)?d/i, /\btoken\b/i, /bearer\s/i,
    /\bsk-[A-Za-z0-9]{8,}/, /credential/i, /private[_\s-]?key/i,
    /[A-Za-z0-9+/_-]{32,}/                       // long unbroken token-shaped blob
  ];
  function screenMemory(content) {
    content = String(content == null ? "" : content).trim();
    if (!content) return { error: "Nothing to remember." };
    if (content.length > LIMITS.memoryChars) return { error: "That's too long for a memory (max " + LIMITS.memoryChars + " chars) — keep memories short and factual." };
    for (var i = 0; i < SECRET_PATTERNS.length; i++) {
      if (SECRET_PATTERNS[i].test(content)) {
        return { error: "That looks like it contains a secret, key, token or password — those are never stored as assistant memory." };
      }
    }
    return { content: content };
  }
  function memoryList(cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    db().select("kos_assistant_memory", { user_id: uid }, { col: "updated_at", asc: false }, function (err, rows) {
      cb(err, (rows || []).map(function (r) {
        return { id: r.id, content: r.content, origin: r.origin, createdAt: r.created_at || null, updatedAt: r.updated_at || null };
      }));
    });
  }
  /* origin is CONSTRAINED to the two consent paths — there is no code path
     that saves inferred content. */
  function memoryAdd(content, origin, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    if (origin !== "user" && origin !== "approved-proposal") {
      cb(new Error("Memory writes need explicit consent: origin must be 'user' or 'approved-proposal'.")); return;
    }
    var s = screenMemory(content);
    if (s.error) { cb(new Error(s.error)); return; }
    var row = { id: uuid(), user_id: uid, content: s.content, origin: origin };
    db().insert("kos_assistant_memory", row, function (err) {
      cb(err, err ? null : { id: row.id, content: row.content, origin: origin });
    });
  }
  function memoryUpdate(id, content, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    var s = screenMemory(content);
    if (s.error) { cb(new Error(s.error)); return; }
    db().update("kos_assistant_memory", { id: id, user_id: uid }, { content: s.content }, cb);
  }
  function memoryRemove(id, cb) {
    var uid = requirePersist(cb);
    if (!uid) return;
    db().remove("kos_assistant_memory", { id: id, user_id: uid }, cb);
  }

  KOS.ai.memory = {
    available: persistAvailable,
    screen: screenMemory,
    list: memoryList,
    add: memoryAdd,
    update: memoryUpdate,
    remove: memoryRemove,
    _config: function (o) { o = o || {}; if ("api" in o) _api = o.api; }
  };
})();
