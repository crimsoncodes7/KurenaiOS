/* Kurenai OS — Edge Function: ai-chat (Category 6 Phase A)
   The ONLY path to the external AI providers (Gemini, DeepSeek). Raw
   fetch() against each provider's documented REST endpoint — no SDKs. The
   API keys live ONLY in function secrets (GEMINI_API_KEY, DEEPSEEK_API_KEY)
   and never appear in any response, log line, or error message.

   This function owns: caller authentication (JWT), the concurrency-safe
   per-user daily cap (kos_ai_consume — service role, the documented
   metering exception), the provider request/response translation, usage
   recording (kos_ai_usage — metadata only, never message content), and
   safe error normalisation. It NEVER executes tools and NEVER touches user
   KurenaiOS data tables — tool validation and execution are client-side,
   inside the user's own RLS session.

   POST { action:"health" }
     → { providers:{gemini:{configured,used},deepseek:{configured,used}},
         cap }
   POST { provider, model, category?, messages[], system?, tools?,
          structured?, temperature?, maxTokens?, correlationId? }
     → 200 { text, toolCalls, usage:{prompt,completion}, finishReason,
             provider, model, correlationId, remaining }
     → 400 invalid · 401 no/invalid JWT · 429 cap reached (kind:"rate")
     · 502 provider failure · 503 provider key not configured
   Normalised message shape (client → here):
     { role:"user"|"assistant"|"tool", content?, toolCalls?[{id,name,args}],
       toolCallId?, name? }                                                */
import { json, preflight, requireUserId, serviceRest } from "../_shared/cors.ts";

const DAILY_CAP = clampInt(Deno.env.get("AI_DAILY_CAP"), 1, 5000, 200);
const PROVIDER_TIMEOUT_MS = 90_000;
const MAX_MESSAGES = 80;
const MAX_CONTENT_CHARS = 60_000;
const MAX_TOOLS = 96;

function clampInt(v: string | undefined, min: number, max: number, dflt: number): number {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : dflt;
}

type NormMessage = {
  role: "user" | "assistant" | "tool";
  content?: string;
  toolCalls?: { id: string; name: string; args: Record<string, unknown> }[];
  toolCallId?: string;
  name?: string;
};
type NormTool = { name: string; description: string; parameters: Record<string, unknown> };

const KEY_ENV: Record<string, string> = { gemini: "GEMINI_API_KEY", deepseek: "DEEPSEEK_API_KEY" };

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/* ---------------- metering ---------------- */

async function consume(userId: string, provider: string): Promise<{ allowed: boolean; used: number }> {
  const res = await serviceRest("rpc/kos_ai_consume", {
    method: "POST",
    body: JSON.stringify({ p_user: userId, p_provider: provider, p_day: todayISO(), p_cap: DAILY_CAP }),
  });
  if (!res.ok) throw new Error(`metering unavailable (${res.status})`);
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return { allowed: !!row?.allowed, used: row?.used ?? 0 };
}

async function usedToday(userId: string, provider: string): Promise<number> {
  const res = await serviceRest(
    `kos_ai_daily?user_id=eq.${userId}&provider=eq.${provider}&day=eq.${todayISO()}&select=used`,
  );
  if (!res.ok) return 0;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0].used : 0;
}

async function recordUsage(row: {
  userId: string; provider: string; model: string; category: string | null;
  outcome: string; promptTokens: number | null; completionTokens: number | null;
  rateLimited: boolean; correlationId: string | null;
}): Promise<void> {
  try {
    await serviceRest("kos_ai_usage", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: row.userId,
        provider: row.provider,
        model: row.model,
        category: row.category,
        outcome: row.outcome,
        prompt_tokens: row.promptTokens,
        completion_tokens: row.completionTokens,
        rate_limited: row.rateLimited,
        correlation_id: row.correlationId,
      }),
    });
  } catch { /* metering write failure must not break the user's request */ }
}

/* ---------------- Gemini translation ----------------
   POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent
   Auth via the x-goog-api-key HEADER (documented alternative to the ?key=
   query param — deliberately chosen so the key can never land in a URL
   log). contents[] roles are user|model; tool results ride functionResponse
   parts; structured output via generationConfig.responseJsonSchema.      */

function toGemini(body: {
  system?: string; messages: NormMessage[]; tools?: NormTool[];
  structured?: { schema: Record<string, unknown> }; temperature?: number; maxTokens?: number;
}): Record<string, unknown> {
  const contents = body.messages.map((m) => {
    if (m.role === "tool") {
      let parsed: unknown = m.content ?? "";
      try { parsed = JSON.parse(m.content ?? ""); } catch { /* keep the string */ }
      return {
        role: "user",
        parts: [{ functionResponse: { name: m.name ?? "tool", response: { result: parsed } } }],
      };
    }
    if (m.role === "assistant") {
      const parts: Record<string, unknown>[] = [];
      if (m.content) parts.push({ text: m.content });
      for (const tc of m.toolCalls ?? []) parts.push({ functionCall: { name: tc.name, args: tc.args } });
      return { role: "model", parts: parts.length ? parts : [{ text: "" }] };
    }
    return { role: "user", parts: [{ text: m.content ?? "" }] };
  });
  const out: Record<string, unknown> = { contents };
  if (body.system) out.systemInstruction = { parts: [{ text: body.system }] };
  if (body.tools?.length) {
    out.tools = [{
      functionDeclarations: body.tools.map((t) => ({
        name: t.name, description: t.description, parameters: t.parameters,
      })),
    }];
  }
  const gen: Record<string, unknown> = {};
  if (typeof body.temperature === "number") gen.temperature = body.temperature;
  if (typeof body.maxTokens === "number") gen.maxOutputTokens = body.maxTokens;
  if (body.structured) {
    gen.responseMimeType = "application/json";
    gen.responseJsonSchema = body.structured.schema;
  }
  if (Object.keys(gen).length) out.generationConfig = gen;
  return out;
}

function fromGemini(resp: Record<string, unknown>): {
  text: string; toolCalls: { id: string; name: string; args: Record<string, unknown> }[];
  finishReason: string; promptTokens: number | null; completionTokens: number | null;
} {
  const cand = (resp.candidates as Record<string, unknown>[] | undefined)?.[0];
  const parts = ((cand?.content as Record<string, unknown> | undefined)?.parts ?? []) as Record<string, unknown>[];
  let text = "";
  const toolCalls: { id: string; name: string; args: Record<string, unknown> }[] = [];
  parts.forEach((p, i) => {
    if (typeof p.text === "string") text += p.text;
    const fc = p.functionCall as { name?: string; args?: Record<string, unknown> } | undefined;
    if (fc?.name) toolCalls.push({ id: `g${i}`, name: fc.name, args: fc.args ?? {} });
  });
  const usage = resp.usageMetadata as Record<string, unknown> | undefined;
  return {
    text,
    toolCalls,
    finishReason: String(cand?.finishReason ?? "stop"),
    promptTokens: typeof usage?.promptTokenCount === "number" ? usage.promptTokenCount as number : null,
    completionTokens: typeof usage?.candidatesTokenCount === "number" ? usage.candidatesTokenCount as number : null,
  };
}

async function callGemini(
  key: string, model: string, body: Parameters<typeof toGemini>[0], signal: AbortSignal,
): Promise<ReturnType<typeof fromGemini>> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(toGemini(body)),
      signal,
    },
  );
  if (!res.ok) throw providerHttpError("gemini", res.status, await safeBodyText(res));
  return fromGemini(await res.json());
}

/* ---------------- DeepSeek translation ----------------
   POST https://api.deepseek.com/chat/completions — OpenAI-compatible.
   Structured output is response_format json_object + an explicit schema
   instruction (their documented requirement); the client re-validates
   locally regardless.                                                    */

function toDeepseek(model: string, body: Parameters<typeof toGemini>[0]): Record<string, unknown> {
  const messages: Record<string, unknown>[] = [];
  let system = body.system ?? "";
  if (body.structured) {
    system += (system ? "\n\n" : "") +
      "Respond ONLY with a single JSON object matching this JSON Schema exactly:\n" +
      JSON.stringify(body.structured.schema);
  }
  if (system) messages.push({ role: "system", content: system });
  for (const m of body.messages) {
    if (m.role === "tool") {
      messages.push({ role: "tool", tool_call_id: m.toolCallId ?? "", content: m.content ?? "" });
    } else if (m.role === "assistant") {
      const out: Record<string, unknown> = { role: "assistant", content: m.content ?? "" };
      if (m.toolCalls?.length) {
        out.tool_calls = m.toolCalls.map((tc) => ({
          id: tc.id, type: "function",
          function: { name: tc.name, arguments: JSON.stringify(tc.args) },
        }));
      }
      messages.push(out);
    } else {
      messages.push({ role: "user", content: m.content ?? "" });
    }
  }
  const out: Record<string, unknown> = { model, messages, stream: false };
  if (body.tools?.length) {
    out.tools = body.tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
  }
  if (body.structured) out.response_format = { type: "json_object" };
  if (typeof body.temperature === "number") out.temperature = body.temperature;
  if (typeof body.maxTokens === "number") out.max_tokens = body.maxTokens;
  return out;
}

function fromDeepseek(resp: Record<string, unknown>): ReturnType<typeof fromGemini> {
  const choice = (resp.choices as Record<string, unknown>[] | undefined)?.[0];
  const msg = choice?.message as Record<string, unknown> | undefined;
  const toolCalls: { id: string; name: string; args: Record<string, unknown> }[] = [];
  for (const tc of (msg?.tool_calls ?? []) as Record<string, unknown>[]) {
    const fn = tc.function as { name?: string; arguments?: string } | undefined;
    let args: Record<string, unknown> = {};
    try { args = JSON.parse(fn?.arguments ?? "{}"); } catch {
      throw { kind: "provider", message: "The model returned unreadable tool arguments — try again." };
    }
    toolCalls.push({ id: String(tc.id ?? `d${toolCalls.length}`), name: fn?.name ?? "", args });
  }
  const usage = resp.usage as Record<string, unknown> | undefined;
  return {
    text: typeof msg?.content === "string" ? msg.content : "",
    toolCalls,
    finishReason: String(choice?.finish_reason ?? "stop"),
    promptTokens: typeof usage?.prompt_tokens === "number" ? usage.prompt_tokens as number : null,
    completionTokens: typeof usage?.completion_tokens === "number" ? usage.completion_tokens as number : null,
  };
}

async function callDeepseek(
  key: string, model: string, body: Parameters<typeof toGemini>[0], signal: AbortSignal,
): Promise<ReturnType<typeof fromGemini>> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(toDeepseek(model, body)),
    signal,
  });
  if (!res.ok) throw providerHttpError("deepseek", res.status, await safeBodyText(res));
  return fromDeepseek(await res.json());
}

/* ---------------- shared error shaping ----------------
   Upstream bodies may carry anything; keep only a short, key-free summary. */

async function safeBodyText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 300).replace(/[A-Za-z0-9_-]{25,}/g, "…");   // never echo long token-like blobs
  } catch { return ""; }
}

function providerHttpError(provider: string, status: number, _detail: string) {
  if (status === 429) return { kind: "rate", status: 429, message: `${provider} is rate-limiting — try again shortly.` };
  if (status === 401 || status === 403) {
    return { kind: "config", status: 502, message: `${provider} rejected the server's credentials — the key needs attention.` };
  }
  if (status === 404) return { kind: "config", status: 502, message: `${provider} does not recognise that model id.` };
  return { kind: "provider", status: 502, message: `${provider} returned HTTP ${status}.` };
}

/* ---------------- validation ---------------- */

function validate(input: Record<string, unknown>): { error?: string; body?: {
  provider: string; model: string; category: string | null; correlationId: string | null;
  chat: Parameters<typeof toGemini>[0];
} } {
  const provider = typeof input.provider === "string" ? input.provider : "";
  if (!KEY_ENV[provider]) return { error: "Unknown provider." };
  const model = typeof input.model === "string" ? input.model.trim() : "";
  if (!model || model.length > 80 || !/^[A-Za-z0-9._:-]+$/.test(model)) return { error: "Invalid model id." };
  const category = typeof input.category === "string" ? input.category.slice(0, 24) : null;
  const correlationId = typeof input.correlationId === "string"
    ? input.correlationId.slice(0, 64).replace(/[^A-Za-z0-9_-]/g, "") : null;

  if (!Array.isArray(input.messages) || !input.messages.length) return { error: "messages[] required." };
  if (input.messages.length > MAX_MESSAGES) return { error: "Too many messages." };
  const messages: NormMessage[] = [];
  for (const raw of input.messages as Record<string, unknown>[]) {
    const role = raw?.role;
    if (role !== "user" && role !== "assistant" && role !== "tool") return { error: "Bad message role." };
    const content = typeof raw.content === "string" ? raw.content : undefined;
    if (content && content.length > MAX_CONTENT_CHARS) return { error: "A message is too long." };
    const m: NormMessage = { role, content };
    if (role === "tool") {
      m.toolCallId = typeof raw.toolCallId === "string" ? raw.toolCallId.slice(0, 64) : undefined;
      m.name = typeof raw.name === "string" ? raw.name.slice(0, 80) : undefined;
    }
    if (role === "assistant" && Array.isArray(raw.toolCalls)) {
      m.toolCalls = (raw.toolCalls as Record<string, unknown>[]).slice(0, 16).map((tc) => ({
        id: String(tc.id ?? "").slice(0, 64),
        name: String(tc.name ?? "").slice(0, 80),
        args: (tc.args && typeof tc.args === "object" ? tc.args : {}) as Record<string, unknown>,
      }));
    }
    messages.push(m);
  }

  let tools: NormTool[] | undefined;
  if (input.tools != null) {
    if (!Array.isArray(input.tools) || input.tools.length > MAX_TOOLS) return { error: "Bad tools list." };
    tools = (input.tools as Record<string, unknown>[]).map((t) => ({
      name: String(t.name ?? "").slice(0, 80),
      description: String(t.description ?? "").slice(0, 1000),
      parameters: (t.parameters && typeof t.parameters === "object" ? t.parameters : { type: "object" }) as Record<string, unknown>,
    }));
    if (tools.some((t) => !t.name)) return { error: "A tool is missing its name." };
  }

  let structured: { schema: Record<string, unknown> } | undefined;
  if (input.structured != null) {
    const s = input.structured as Record<string, unknown>;
    if (!s.schema || typeof s.schema !== "object") return { error: "structured.schema required." };
    structured = { schema: s.schema as Record<string, unknown> };
  }

  return {
    body: {
      provider, model, category, correlationId,
      chat: {
        system: typeof input.system === "string" ? input.system.slice(0, MAX_CONTENT_CHARS) : undefined,
        messages, tools, structured,
        temperature: typeof input.temperature === "number" ? Math.max(0, Math.min(2, input.temperature)) : undefined,
        maxTokens: typeof input.maxTokens === "number" ? Math.max(1, Math.min(32768, Math.floor(input.maxTokens))) : undefined,
      },
    },
  };
}

/* ---------------- handler ---------------- */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync to use the assistant's online models." }, 401);

  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }

  if (input.action === "health") {
    const providers: Record<string, unknown> = {};
    for (const p of Object.keys(KEY_ENV)) {
      providers[p] = { configured: !!Deno.env.get(KEY_ENV[p]), used: await usedToday(userId, p) };
    }
    return json({ providers, cap: DAILY_CAP });
  }

  const v = validate(input);
  if (v.error || !v.body) return json({ error: v.error ?? "Invalid request." }, 400);
  const { provider, model, category, correlationId, chat } = v.body;

  const key = Deno.env.get(KEY_ENV[provider]);
  if (!key) return json({ error: `The ${provider} key isn't configured on the server yet.`, kind: "config" }, 503);

  let meter: { allowed: boolean; used: number };
  try { meter = await consume(userId, provider); } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Metering unavailable.", kind: "provider" }, 502);
  }
  if (!meter.allowed) {
    await recordUsage({
      userId, provider, model, category, outcome: "rate_limited",
      promptTokens: null, completionTokens: null, rateLimited: true, correlationId,
    });
    return json({
      error: `Daily limit reached for ${provider} (${DAILY_CAP} requests). It resets at midnight UTC.`,
      kind: "rate", used: meter.used, cap: DAILY_CAP,
    }, 429);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    const out = provider === "gemini"
      ? await callGemini(key, model, chat, controller.signal)
      : await callDeepseek(key, model, chat, controller.signal);
    await recordUsage({
      userId, provider, model, category, outcome: "ok",
      promptTokens: out.promptTokens, completionTokens: out.completionTokens,
      rateLimited: false, correlationId,
    });
    return json({
      text: out.text,
      toolCalls: out.toolCalls,
      usage: { prompt: out.promptTokens, completion: out.completionTokens },
      finishReason: out.finishReason,
      provider, model, correlationId,
      remaining: Math.max(0, DAILY_CAP - meter.used),
    });
  } catch (e) {
    const isAbort = e instanceof DOMException && e.name === "AbortError";
    const known = (e && typeof e === "object" && "kind" in e)
      ? e as { kind: string; status?: number; message: string }
      : null;
    const outcome = isAbort ? "timeout" : known?.kind === "rate" ? "rate_limited" : "provider_error";
    await recordUsage({
      userId, provider, model, category, outcome,
      promptTokens: null, completionTokens: null, rateLimited: known?.kind === "rate", correlationId,
    });
    if (isAbort) return json({ error: `${provider} took too long to answer — try again.`, kind: "timeout" }, 502);
    if (known) return json({ error: known.message, kind: known.kind }, known.status ?? 502);
    return json({ error: "The provider request failed — network?", kind: "provider" }, 502);
  } finally {
    clearTimeout(timer);
  }
});
