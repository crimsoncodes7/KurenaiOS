/* Kurenai OS — Edge Function: steam-auth (Build 4c)
   The secure Steam OpenID 2.0 flow the browser alone could not complete
   (Build 3e post-mortem: check_authentication is unreadable cross-origin).
   This function is the server half:

   POST {action:"begin"}  (JWT required)
     → mints a single-use 10-minute nonce BOUND to the authenticated user
       (kos_steam_auth, service role) and returns the Steam login URL whose
       return_to points back at this function.
   GET  ?nonce=…&openid.*  (the Steam redirect — necessarily unauthenticated,
       which is why verify_jwt is OFF for this function in config.toml; every
       other action still validates the JWT itself)
     → consumes the nonce, POSTs the full assertion back to Steam with
       openid.mode=check_authentication SERVER-SIDE, requires is_valid:true,
       validates return_to and the claimed_id shape, and only then stores the
       SteamID64 for the nonce's user (kos_steam, service role). Responds
       with a small human HTML page. NO client-supplied SteamID is ever
       accepted anywhere.
   POST {action:"status"} (JWT) → { linked, steamId }
   POST {action:"unlink"} (JWT) → deletes the caller's own row.               */
import { json, preflight, requireUserId, serviceRest, corsHeaders } from "../_shared/cors.ts";

const STEAM_OPENID = "https://steamcommunity.com/openid/login";
const NONCE_TTL_MS = 10 * 60 * 1000;

function appUrl(): string {
  return Deno.env.get("PUBLIC_APP_URL") ?? "https://kurenai-os.pages.dev";
}
function callbackUrl(): string {
  /* The function's PUBLIC URL. Deliberately built from SUPABASE_URL rather
     than req.url: the gateway strips the /functions/v1 prefix before
     invoking the function, so req.url would yield
     https://<ref>.supabase.co/steam-auth — a path the gateway refuses
     ("requested path is invalid"), which is exactly where the first real
     sign-in died. The callback stays on the base function URL with the
     nonce as a QUERY parameter — no sub-path routing anywhere. */
  const base = (Deno.env.get("SUPABASE_URL") ?? "").replace(/\/$/, "");
  return `${base}/functions/v1/steam-auth`;
}

function htmlPage(title: string, body: string, ok: boolean): Response {
  const home = appUrl();
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<style>body{font:16px/1.6 Georgia,serif;background:#EFE7D6;color:#332C20;display:grid;place-items:center;min-height:100vh;margin:0}
main{max-width:420px;padding:32px;background:#F8F3E6;border-radius:14px;box-shadow:0 12px 32px rgba(46,36,18,.12);text-align:center}
h1{font-size:22px}a{color:#5D6BA8}</style></head><body><main>
<h1>${ok ? "✓" : "✕"} ${title}</h1><p>${body}</p>
<p><a href="${home}">Return to Kurenai OS</a> — then reopen the Steam panel.</p>
</main></body></html>`,
    { status: ok ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
  );
}

/* ---------------- begin: mint the bound nonce ---------------- */
async function begin(req: Request): Promise<Response> {
  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync first." }, 401);

  const nonce = crypto.randomUUID();
  const ins = await serviceRest("kos_steam_auth", {
    method: "POST",
    body: JSON.stringify({ nonce, user_id: userId }),
    headers: { Prefer: "return=minimal" },
  });
  if (!ins.ok) return json({ error: "Could not start the Steam link." }, 500);

  const returnTo = `${callbackUrl()}?nonce=${nonce}`;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.return_to": returnTo,
    "openid.realm": new URL(callbackUrl()).origin,
  });
  return json({ url: `${STEAM_OPENID}?${params.toString()}` });
}

/* ---------------- callback: verify server-side, then store ---------------- */
async function callback(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const nonce = url.searchParams.get("nonce") ?? "";
  if (!/^[0-9a-f-]{36}$/.test(nonce)) return htmlPage("Steam link failed", "Malformed request.", false);

  /* consume the nonce FIRST — single-use even when verification fails */
  const sel = await serviceRest(`kos_steam_auth?nonce=eq.${nonce}&select=user_id,created_at`);
  const rows = sel.ok ? await sel.json() : [];
  await serviceRest(`kos_steam_auth?nonce=eq.${nonce}`, { method: "DELETE" });
  if (!rows.length) {
    return htmlPage("Steam link failed", "This link request is unknown or was already used. Start again from the Steam panel.", false);
  }
  if (Date.now() - Date.parse(rows[0].created_at) > NONCE_TTL_MS) {
    return htmlPage("Steam link expired", "The request took longer than 10 minutes. Start again from the Steam panel.", false);
  }
  const userId: string = rows[0].user_id;

  if (url.searchParams.get("openid.mode") !== "id_res") {
    return htmlPage("Steam link cancelled", "Steam did not complete the sign-in.", false);
  }
  const returnTo = url.searchParams.get("openid.return_to") ?? "";
  if (!returnTo.startsWith(callbackUrl() + "?nonce=")) {
    return htmlPage("Steam link failed", "The response was addressed to a different endpoint.", false);
  }

  /* THE verification: hand the whole assertion back to Steam and let STEAM
     say whether it issued it. Server-side, so the answer is readable. */
  const verify = new URLSearchParams();
  for (const [k, v] of url.searchParams) {
    if (k.startsWith("openid.")) verify.set(k, v);
  }
  verify.set("openid.mode", "check_authentication");
  const vres = await fetch(STEAM_OPENID, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: verify.toString(),
  });
  const vtext = await vres.text();
  if (!vres.ok || !/is_valid\s*:\s*true/.test(vtext)) {
    return htmlPage("Steam link failed", "Steam refused to verify the sign-in (the response could not be authenticated).", false);
  }

  const claimed = url.searchParams.get("openid.claimed_id") ?? "";
  const m = claimed.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
  if (!m) return htmlPage("Steam link failed", "Steam returned an unrecognised identity.", false);
  const steamId = m[1];

  const up = await serviceRest("kos_steam?on_conflict=user_id", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, steam_id: steamId, verified_at: new Date().toISOString() }),
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });
  if (!up.ok) return htmlPage("Steam link failed", "Verified, but the identity could not be stored — try again.", false);

  return htmlPage("Steam account linked", "Your Steam identity was verified by Steam itself and is now attached to your Kurenai account.", true);
}

/* ---------------- status / unlink ---------------- */
async function status(req: Request): Promise<Response> {
  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync first." }, 401);
  const sel = await serviceRest(`kos_steam?user_id=eq.${userId}&select=steam_id,verified_at`);
  const rows = sel.ok ? await sel.json() : [];
  return json(rows.length
    ? { linked: true, steamId: rows[0].steam_id, verifiedAt: rows[0].verified_at }
    : { linked: false });
}
async function unlink(req: Request): Promise<Response> {
  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync first." }, 401);
  await serviceRest(`kos_steam?user_id=eq.${userId}`, { method: "DELETE" });
  return json({ linked: false });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method === "GET") return callback(req);
  if (req.method !== "POST") return json({ error: "Unsupported method" }, 405);
  let body: { action?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  if (body.action === "begin") return begin(req);
  if (body.action === "status") return status(req);
  if (body.action === "unlink") return unlink(req);
  return json({ error: "Unknown action." }, 400);
});
