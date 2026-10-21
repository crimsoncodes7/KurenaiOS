/* Kurenai OS — runner/model.ts
   One text-only request for a scheduled message answered on the server
   (docs/server-runner-plan.md §4, decision B). No tools: the brief is the
   message. Metered exactly like ai-chat: the atomic kos_ai_consume cap
   BEFORE the provider is called, a kos_ai_usage row after (metadata only,
   never content). The keys are read from Deno.env and never appear in a
   response, a log line or an error. */
import { serviceRest } from "../_shared/cors.ts";

const DAILY_CAP = (() => {
  const n = parseInt(Deno.env.get("AI_DAILY_CAP") ?? "", 10);
  return Number.isFinite(n) ? Math.max(1, Math.min(5000, n)) : 200;
})();
const TIMEOUT_MS = 90_000;
const KEY_ENV: Record<string, string> = { gemini: "GEMINI_API_KEY", deepseek: "DEEPSEEK_API_KEY" };

function todayUTC(): string { return new Date().toISOString().slice(0, 10); }

async function consume(userId: string, provider: string): Promise<boolean> {
  const res = await serviceRest("rpc/kos_ai_consume", {
    method: "POST",
    body: JSON.stringify({ p_user: userId, p_provider: provider, p_day: todayUTC(), p_cap: DAILY_CAP }),
  });
  if (!res.ok) throw new Error("metering unavailable");
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : rows;
  return !!row?.allowed;
}
async function record(userId: string, provider: string, model: string, outcome: string, p: number | null, c: number | null) {
  try {
    await serviceRest("kos_ai_usage", {
      method: "POST", headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ user_id: userId, provider, model, category: "scheduled", outcome,
        prompt_tokens: p, completion_tokens: c, rate_limited: outcome === "rate_limited", correlation_id: null }),
    });
  } catch { /* a metering write failure never breaks the run */ }
}

/* → {ok, text}; text is the reply, or a short, key-free reason */
export async function answer(userId: string, route: { provider?: string; model?: string } | null, system: string, user: string): Promise<{ ok: boolean; text: string }> {
  const provider = route?.provider === "deepseek" ? "deepseek" : route?.provider === "gemini" ? "gemini" : null;
  if (!provider) return { ok: false, text: "This schedule's model runs on your device (Ollama), so the server cannot answer it." };
  const model = String(route?.model || (provider === "gemini" ? "gemini-3.6-flash" : "deepseek-v4-flash"));
  const key = Deno.env.get(KEY_ENV[provider]);
  if (!key) return { ok: false, text: `The ${provider} key isn't configured on the server.` };
  let allowed = false;
  try { allowed = await consume(userId, provider); } catch { return { ok: false, text: "Metering was unavailable; it will try again." }; }
  if (!allowed) { await record(userId, provider, model, "rate_limited", null, null); return { ok: false, text: `The daily limit for ${provider} is reached.` }; }

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST", signal: ctl.signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
        }),
      });
      if (!res.ok) { await record(userId, provider, model, "provider_error", null, null); return { ok: false, text: `${provider} returned HTTP ${res.status}.` }; }
      const j = await res.json();
      const text = (j?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
      await record(userId, provider, model, "ok", j?.usageMetadata?.promptTokenCount ?? null, j?.usageMetadata?.candidatesTokenCount ?? null);
      return text ? { ok: true, text } : { ok: false, text: "No reply came back." };
    }
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, temperature: 0.4, max_tokens: 1200,
        messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    });
    if (!res.ok) { await record(userId, provider, model, "provider_error", null, null); return { ok: false, text: `${provider} returned HTTP ${res.status}.` }; }
    const j = await res.json();
    const text = String(j?.choices?.[0]?.message?.content ?? "").trim();
    await record(userId, provider, model, "ok", j?.usage?.prompt_tokens ?? null, j?.usage?.completion_tokens ?? null);
    return text ? { ok: true, text } : { ok: false, text: "No reply came back." };
  } catch (e) {
    const abort = e instanceof DOMException && e.name === "AbortError";
    await record(userId, provider, model, abort ? "timeout" : "provider_error", null, null);
    return { ok: false, text: abort ? `${provider} took too long to answer.` : "The provider request failed." };
  } finally {
    clearTimeout(timer);
  }
}
