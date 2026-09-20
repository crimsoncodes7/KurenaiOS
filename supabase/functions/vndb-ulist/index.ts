/* Kurenai OS — Edge Function: vndb-ulist
   The VNDB write relay. VNDB's Kana API takes list writes as
   PATCH /ulist/<id>, but its CORS preflight answers only
   "POST, GET, OPTIONS" (re-verified 2026-09-20) — so no browser page can
   send the write, whatever the token's permissions. This function is the
   one server hop that turns the browser's POST into VNDB's PATCH.

   POST { vndbId: "v17", token: "<the user's own VNDB token>",
          body: { vote?, labels_set?, labels_unset? } }
   → 200 { ok: true }
   → 400 invalid input · 401 no/invalid JWT
   → VNDB's own status (401/403/429/…) with { error, upstream: status }

   The VNDB token is the user's personal token, passed through for this
   one request and never stored or logged here; the caller's Supabase JWT
   (verify_jwt is ON) is what stops the relay being an open proxy. The
   payload allow-list mirrors KOS.vndb.setUlist — nothing else reaches VNDB. */
import { json, preflight, requireUserId } from "../_shared/cors.ts";

const VNDB = "https://api.vndb.org/kana";

function labelList(v: unknown): number[] | null {
  if (v === undefined) return null;
  if (!Array.isArray(v) || v.length > 20) throw new Error("labels must be a short array");
  return v.map((n) => {
    if (typeof n !== "number" || !Number.isInteger(n) || n < 1 || n > 1000) throw new Error("bad label id");
    return n;
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync to push changes to VNDB." }, 401);

  let input: { vndbId?: unknown; token?: unknown; body?: unknown };
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }

  const vndbId = typeof input.vndbId === "string" && /^v\d{1,9}$/.test(input.vndbId) ? input.vndbId : null;
  if (!vndbId) return json({ error: "A VNDB id like v17 is required." }, 400);
  const token = typeof input.token === "string" ? input.token.trim() : "";
  if (!token || token.length > 200 || /[\s"]/.test(token)) return json({ error: "A VNDB token is required." }, 400);

  const src = (input.body && typeof input.body === "object") ? input.body as Record<string, unknown> : {};
  const body: Record<string, unknown> = {};
  try {
    const set = labelList(src.labels_set), unset = labelList(src.labels_unset);
    if (set) body.labels_set = set;
    if (unset) body.labels_unset = unset;
    if (src.vote !== undefined) {
      if (typeof src.vote !== "number" || !Number.isInteger(src.vote) || src.vote < 10 || src.vote > 100) {
        throw new Error("vote must be 10–100");
      }
      body.vote = src.vote;
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Bad payload." }, 400);
  }
  if (!Object.keys(body).length) return json({ ok: true, noop: true });

  try {
    const res = await fetch(`${VNDB}/ulist/${vndbId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Token ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.status === 204 || res.ok) return json({ ok: true });
    const text = (await res.text().catch(() => "")).slice(0, 200);
    const retryAfter = res.headers.get("Retry-After");
    const payload: Record<string, unknown> = { error: text || `VNDB returned HTTP ${res.status}.`, upstream: res.status };
    if (retryAfter) payload.retryAfter = parseInt(retryAfter, 10) || 30;
    /* 401/403/429 pass through so the client keeps its own wording per
       kind; anything else is VNDB misbehaving → 502 */
    const status = [401, 403, 429].includes(res.status) ? res.status : 502;
    return json(payload, status);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "VNDB is unreachable from the relay." }, 502);
  }
});
