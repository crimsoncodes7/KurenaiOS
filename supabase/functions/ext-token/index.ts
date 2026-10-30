/* Kurenai OS — Edge Function: ext-token (roadmap 5.15,
   docs/integrations-plan.md, invariant 157). Google (Calendar and Tasks)
   and Todoist the way the GitHub App works: the long-lived credential stays
   here, a device only ever holds a one-hour access token in memory.

   POST { action:"start", provider, redirect, state }   (Supabase JWT)
     → 200 { url }  the provider's consent page for this app
   POST { action:"complete", provider, code, redirect }
     → exchanges the code (with the client secret, a function secret),
       stores the refresh token in kos_ext → 200 { account }
   POST { action:"token", provider }
     → a fresh access token from the stored refresh token (a rotated one
       is saved) → 200 { token, expires_at, account }
   POST { action:"status" } → 200 { google:{linked, account}, todoist:{…}, configured:{…} }
   POST { action:"lease", provider, holder, secs } → 200 { ok }  (one device syncs at a time)
   POST { action:"release", provider, holder } → 200 { ok:true }
   POST { action:"unlink", provider } → revokes (Google) and deletes the row
   → 400 bad input · 401 no/invalid JWT · 404 not connected · 409 the
     provider refused the stored token (connect again) · 503 not configured

   Secrets: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, TODOIST_CLIENT_ID,
   TODOIST_CLIENT_SECRET, PUBLIC_APP_URL. Nothing a provider returns is
   logged, and no access token is stored. */
import { json, preflight, requireUserId, serviceRest } from "../_shared/cors.ts";
import { accessOf, authorizeUrl, codeOk, emailFromIdToken, isProvider, PROVIDERS, redirectAllowed, stateOk, type Provider } from "./logic.ts";

function appUrl() { return Deno.env.get("PUBLIC_APP_URL") ?? "https://kurenai-os.pages.dev"; }
function cfg(p: Provider) {
  const pre = p === "google" ? "GOOGLE" : "TODOIST";
  const id = Deno.env.get(pre + "_CLIENT_ID"), secret = Deno.env.get(pre + "_CLIENT_SECRET");
  return id && secret ? { id, secret } : null;
}

type Row = { refresh_token: string; account: string };
async function rowOf(uid: string, p: Provider): Promise<Row | null> {
  const res = await serviceRest(`kos_ext?user_id=eq.${uid}&provider=eq.${p}&select=refresh_token,account`);
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] as Row : null;
}

async function tokenCall(p: Provider, body: Record<string, string>) {
  const res = await fetch(PROVIDERS[p].token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(body).toString(),
  }).catch(() => null);
  if (!res) return { status: 0, json: null };
  let j: Record<string, unknown> | null = null;
  try { j = await res.json(); } catch { j = null; }
  return { status: res.status, json: j };
}

async function todoistAccount(access: string): Promise<string> {
  const r = await fetch("https://api.todoist.com/api/v1/user", { headers: { Authorization: `Bearer ${access}` } }).catch(() => null);
  if (!r || !r.ok) return "";
  const u = await r.json().catch(() => null) as { email?: string; full_name?: string } | null;
  return u?.email || u?.full_name || "";
}

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await serviceRest(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) });
  return r.ok ? r.json().catch(() => null) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const uid = await requireUserId(req);
  if (!uid) return json({ error: "Sign in to cloud sync to connect Google or Todoist." }, 401);
  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }

  if (input.action === "status") {
    const out: Record<string, unknown> = { configured: { google: !!cfg("google"), todoist: !!cfg("todoist") } };
    for (const p of ["google", "todoist"] as Provider[]) {
      const r = await rowOf(uid, p);
      out[p] = r ? { linked: true, account: r.account } : { linked: false };
    }
    return json(out);
  }

  const p = input.provider;
  if (!isProvider(p)) return json({ error: "Unknown provider." }, 400);

  if (input.action === "lease") {
    const holder = typeof input.holder === "string" && /^[A-Za-z0-9-]{8,64}$/.test(input.holder) ? input.holder : "";
    if (!holder) return json({ error: "A device id is needed." }, 400);
    const ok = await rpc("kos_ext_lease", { p_user: uid, p_provider: p, p_holder: holder, p_secs: Number(input.secs) || 120 });
    return json({ ok: ok === true });
  }
  if (input.action === "release") {
    const holder = typeof input.holder === "string" ? input.holder : "";
    await rpc("kos_ext_release", { p_user: uid, p_provider: p, p_holder: holder });
    return json({ ok: true });
  }
  if (input.action === "unlink") {
    const r = await rowOf(uid, p);
    if (r && p === "google") {
      await fetch(`${PROVIDERS.google.revoke}?token=${encodeURIComponent(r.refresh_token)}`, { method: "POST" }).catch(() => null);
    }
    await serviceRest(`kos_ext?user_id=eq.${uid}&provider=eq.${p}`, { method: "DELETE" });
    return json({ ok: true });
  }

  const c = cfg(p);
  if (!c) return json({ error: (p === "google" ? "Google" : "Todoist") + " isn't configured on the server yet." }, 503);

  if (input.action === "start") {
    if (!redirectAllowed(input.redirect, appUrl())) return json({ error: "That address can't receive a sign-in." }, 400);
    if (!stateOk(input.state)) return json({ error: "The sign-in state is missing." }, 400);
    return json({ url: authorizeUrl(p, c.id, input.redirect as string, input.state as string) });
  }

  if (input.action === "complete") {
    if (!redirectAllowed(input.redirect, appUrl()) || !codeOk(input.code)) return json({ error: "The sign-in's details are missing." }, 400);
    const t = await tokenCall(p, { grant_type: "authorization_code", code: input.code, redirect_uri: input.redirect as string, client_id: c.id, client_secret: c.secret });
    const a = accessOf(t.json, Date.now());
    if (!a) return json({ error: "The provider did not confirm the sign-in. Try connecting again." }, 403);
    if (!a.refresh) return json({ error: p === "google"
      ? "Google sent no refresh token. Remove KurenaiOS at myaccount.google.com/permissions and connect again."
      : "This Todoist app has refresh tokens off. Turn them on in Todoist's App Management Console." }, 409);
    const account = p === "google" ? emailFromIdToken(t.json?.id_token) : await todoistAccount(a.token);
    const scopes = typeof t.json?.scope === "string" ? t.json.scope : "";
    const up = await serviceRest("kos_ext", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ user_id: uid, provider: p, refresh_token: a.refresh, scopes, account }),
    });
    if (!up.ok) return json({ error: "The connection could not be saved." }, 502);
    return json({ account, scopes });
  }

  if (input.action === "token") {
    const r = await rowOf(uid, p);
    if (!r) return json({ error: "Not connected." }, 404);
    const t = await tokenCall(p, { grant_type: "refresh_token", refresh_token: r.refresh_token, client_id: c.id, client_secret: c.secret });
    const a = accessOf(t.json, Date.now());
    if (!a) return json({ error: "The provider refused the saved sign-in. Connect again." }, t.status === 400 || t.status === 401 ? 409 : 502);
    /* a rotated refresh token replaces the old one */
    if (a.refresh && a.refresh !== r.refresh_token) {
      await serviceRest(`kos_ext?user_id=eq.${uid}&provider=eq.${p}`, { method: "PATCH", body: JSON.stringify({ refresh_token: a.refresh }) });
    }
    return json({ token: a.token, expires_at: a.expires_at, account: r.account });
  }
  return json({ error: "Unknown action." }, 400);
});
