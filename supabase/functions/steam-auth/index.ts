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
import { handler, json, preflight, requireUserId, serviceRest, corsHeaders } from "../_shared/cors.ts";

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

/* The callback's answer is a redirect back into the app with a short code
   (`/?steam=linked`, `?steam=expired`, …), never a page of its own: the
   platform serves HTML from *.supabase.co as text/plain, so a page here was
   shown as raw source. The app reads the code once at boot, says what it
   means (KOS.gameapi.STEAM_RESULT) and opens Games, as the Google and
   Todoist returns do. 303, so the browser fetches the app with GET. */
type SteamResult = "linked" | "malformed" | "unknown" | "expired" | "cancelled" | "endpoint" | "unreachable" | "refused" | "identity" | "store";
function backToApp(code: SteamResult): Response {
  return new Response(null, { status: 303, headers: { ...corsHeaders, Location: `${appUrl()}/?steam=${code}` } });
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
  if (!/^[0-9a-f-]{36}$/.test(nonce)) return backToApp("malformed");

  /* consume the nonce FIRST — single-use even when verification fails */
  const sel = await serviceRest(`kos_steam_auth?nonce=eq.${nonce}&select=user_id,created_at`);
  const rows = sel.ok ? await sel.json() : [];
  await serviceRest(`kos_steam_auth?nonce=eq.${nonce}`, { method: "DELETE" });
  if (!rows.length) {
    return backToApp("unknown");
  }
  if (Date.now() - Date.parse(rows[0].created_at) > NONCE_TTL_MS) {
    return backToApp("expired");
  }
  const userId: string = rows[0].user_id;

  if (url.searchParams.get("openid.mode") !== "id_res") {
    return backToApp("cancelled");
  }
  const returnTo = url.searchParams.get("openid.return_to") ?? "";
  if (!returnTo.startsWith(callbackUrl() + "?nonce=")) {
    return backToApp("endpoint");
  }

  /* THE verification: hand the whole assertion back to Steam and let STEAM
     say whether it issued it. Server-side, so the answer is readable. */
  const verify = new URLSearchParams();
  for (const [k, v] of url.searchParams) {
    if (k.startsWith("openid.")) verify.set(k, v);
  }
  verify.set("openid.mode", "check_authentication");
  /* EF-07 (1A): Steam unreachable says so (back in the app), not the runtime's
     bare 500 (the nonce is spent, so the way back is Link Steam again) */
  let vres: Response, vtext: string;
  try {
    vres = await fetch(STEAM_OPENID, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verify.toString(),
    });
    vtext = await vres.text();
  } catch {
    return backToApp("unreachable");
  }
  if (!vres.ok || !/is_valid\s*:\s*true/.test(vtext)) {
    return backToApp("refused");
  }

  const claimed = url.searchParams.get("openid.claimed_id") ?? "";
  const m = claimed.match(/^https:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
  if (!m) return backToApp("identity");
  const steamId = m[1];

  const up = await serviceRest("kos_steam?on_conflict=user_id", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, steam_id: steamId, verified_at: new Date().toISOString() }),
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });
  if (!up.ok) return backToApp("store");

  return backToApp("linked");
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

Deno.serve(handler(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method === "GET") return callback(req);
  if (req.method !== "POST") return json({ error: "Unsupported method" }, 405);
  let body: { action?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  if (body.action === "begin") return begin(req);
  if (body.action === "status") return status(req);
  if (body.action === "unlink") return unlink(req);
  return json({ error: "Unknown action." }, 400);
}));
