/* Kurenai OS — tools/games_integration.mjs (Build 4c)
   LIVE verification of the game Edge Functions + Steam-table RLS. Plain
   fetch, no dependencies; reads the project URL/key from js/env.local.js.
   Creates ONE throw-away auth user. Never prints tokens or keys.

   Run: node tools/games_integration.mjs

   Proves:
   - unauthenticated requests are rejected on every function
   - igdb-search returns normalised live results for a JWT-bearing user, with
     no Twitch credential or token anywhere in the response
   - input validation (short query) rejects
   - steam-auth begin returns a steamcommunity.com OpenID URL bound to a
     fresh nonce; a forged callback fails verification; the nonce is
     single-use (the replay gets "unknown or already used")
   - steam-owned-games refuses an unlinked account with a clear message
   - RLS: kos_steam/kos_steam_auth accept no client writes; reads expose
     nothing that isn't the caller's own                                   */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envSrc = readFileSync(resolve(ROOT, "js/env.local.js"), "utf8");
const BASE = envSrc.match(/SUPABASE_URL:\s*"([^"]+)"/)[1].replace(/\/$/, "");
const APIKEY = envSrc.match(/SUPABASE_ANON_KEY:\s*"([^"]+)"/)[1];
const FN = `${BASE}/functions/v1`;

let failures = 0;
function ok(name, cond, detail) {
  console.log((cond ? "  ok   " : "  FAIL ") + name + (cond || !detail ? "" : " — " + detail));
  if (!cond) failures++;
}

async function req(url, opts = {}, token) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      apikey: APIKEY,
      ...(token ? { Authorization: "Bearer " + token } : {}),
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body, text };
}

(async () => {
  console.log("== auth setup ==");
  const email = `kos.test.games.${Date.now()}@example.com`;
  const su = await req(`${BASE}/auth/v1/signup`, { method: "POST", body: JSON.stringify({ email, password: "kos-games-test-1" }) });
  const token = su.body?.access_token;
  ok("throw-away user signs up", !!token, "status " + su.status);
  if (!token) process.exit(1);

  console.log("== unauthenticated rejection ==");
  let r = await fetch(`${FN}/igdb-search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  ok("igdb-search with no credentials at all → 401", r.status === 401, "status " + r.status);
  r = await req(`${FN}/steam-owned-games`, { method: "POST", body: "{}" });
  ok("steam-owned-games with anon key but no user JWT → 401", r.status === 401, "status " + r.status + " " + JSON.stringify(r.body).slice(0, 120));
  r = await req(`${FN}/steam-auth`, { method: "POST", body: JSON.stringify({ action: "begin" }) });
  ok("steam-auth begin with anon key but no user JWT → 401", r.status === 401, "status " + r.status + " " + JSON.stringify(r.body).slice(0, 120));

  console.log("== igdb-search live ==");
  r = await req(`${FN}/igdb-search`, { method: "POST", body: JSON.stringify({ query: "celeste" }) }, token);
  const results = r.body?.results;
  ok("authenticated search returns results", r.status === 200 && Array.isArray(results) && results.length > 0,
    "status " + r.status + " " + JSON.stringify(r.body).slice(0, 200));
  if (Array.isArray(results) && results.length) {
    const hit = results.find(x => /celeste/i.test(x.title)) || results[0];
    ok("results are normalised (title/genres/platforms/coverUrl shape)",
      typeof hit.title === "string" && Array.isArray(hit.genres) && Array.isArray(hit.platforms) &&
      ("coverUrl" in hit) && ("releaseDate" in hit) && ("igdbId" in hit),
      JSON.stringify(hit).slice(0, 200));
    ok("no Twitch credential or token leaks into the response",
      !/client_id|client_secret|access_token|bearer/i.test(r.text), r.text.slice(0, 160));
  }
  r = await req(`${FN}/igdb-search`, { method: "POST", body: JSON.stringify({ query: "a" }) }, token);
  ok("short query rejected (400)", r.status === 400, "status " + r.status);
  r = await req(`${FN}/igdb-search`, { method: "POST", body: JSON.stringify({ query: "zelda", platform: "switch" }) }, token);
  ok("platform-filtered search works", r.status === 200 && Array.isArray(r.body?.results), "status " + r.status);

  console.log("== steam-auth flow (up to the human sign-in) ==");
  r = await req(`${FN}/steam-auth`, { method: "POST", body: JSON.stringify({ action: "status" }) }, token);
  ok("status: fresh account is unlinked", r.status === 200 && r.body?.linked === false, JSON.stringify(r.body));
  r = await req(`${FN}/steam-auth`, { method: "POST", body: JSON.stringify({ action: "begin" }) }, token);
  const loginUrl = r.body?.url || "";
  ok("begin returns a steamcommunity OpenID URL", loginUrl.startsWith("https://steamcommunity.com/openid/login?"), loginUrl.slice(0, 90));
  const nonce = new URL(new URL(loginUrl).searchParams.get("openid.return_to")).searchParams.get("nonce");
  ok("the return_to carries a nonce bound server-side", !!nonce && /^[0-9a-f-]{36}$/.test(nonce || ""), String(nonce));
  ok("no API key appears in the login URL", !/key=|secret/i.test(loginUrl), loginUrl.slice(0, 120));

  /* forged callback: real nonce, fabricated assertion — Steam must refuse it */
  const cb = `${FN}/steam-auth?nonce=${nonce}` +
    `&openid.mode=id_res&openid.return_to=${encodeURIComponent(`${FN}/steam-auth?nonce=${nonce}`)}` +
    `&openid.claimed_id=${encodeURIComponent("https://steamcommunity.com/openid/id/76561190000000000")}` +
    `&openid.assoc_handle=x&openid.signed=x&openid.sig=forged`;
  r = await req(cb, { method: "GET" });
  ok("a forged assertion fails server-side verification", r.status === 400 && /could not be authenticated|failed/i.test(r.text), "status " + r.status + " " + r.text.slice(0, 120));
  r = await req(cb, { method: "GET" });
  ok("the nonce is single-use (replay refused as unknown/used)", r.status === 400 && /unknown|already used/i.test(r.text), r.text.slice(0, 120));
  r = await req(`${FN}/steam-auth?nonce=ffffffff-ffff-4fff-8fff-ffffffffffff&openid.mode=id_res`, { method: "GET" });
  ok("an unknown nonce is refused", r.status === 400 && /unknown|already used/i.test(r.text), r.text.slice(0, 120));

  console.log("== steam-owned-games guard ==");
  r = await req(`${FN}/steam-owned-games`, { method: "POST", body: "{}" }, token);
  ok("unlinked account → 409 with a clear message", r.status === 409 && /Link Steam/i.test(r.body?.error || ""), "status " + r.status + " " + JSON.stringify(r.body));
  ok("a client-supplied steamid is ignored structurally (same 409)",
    (await req(`${FN}/steam-owned-games`, { method: "POST", body: JSON.stringify({ steamid: "76561198000000000" }) }, token)).status === 409);

  console.log("== steam tables RLS ==");
  r = await req(`${BASE}/rest/v1/kos_steam?select=*`, {}, token);
  ok("kos_steam: own-select works and is empty for a fresh user", r.status === 200 && Array.isArray(r.body) && r.body.length === 0, "status " + r.status);
  r = await req(`${BASE}/rest/v1/kos_steam`, { method: "POST", body: JSON.stringify({ user_id: su.body.user.id, steam_id: "76561198000000001" }) }, token);
  ok("kos_steam: CLIENT INSERT IS DENIED (identity is server-verified only)", r.status === 401 || r.status === 403, "status " + r.status + " " + JSON.stringify(r.body).slice(0, 120));
  r = await req(`${BASE}/rest/v1/kos_steam_auth?select=*`, {}, token);
  ok("kos_steam_auth: invisible to clients", r.status !== 200 || (Array.isArray(r.body) && r.body.length === 0), "status " + r.status);
  r = await req(`${BASE}/rest/v1/kos_steam_auth`, { method: "POST", body: JSON.stringify({ nonce: "hack", user_id: su.body.user.id }) }, token);
  ok("kos_steam_auth: client insert denied", r.status === 401 || r.status === 403, "status " + r.status);

  console.log("");
  console.log("note: throw-away user " + email + " remains in Authentication → Users (dashboard delete at leisure).");
  if (failures) { console.log("GAMES INTEGRATION: " + failures + " FAILURE(S)"); process.exit(1); }
  console.log("GAMES INTEGRATION PASS — auth gates, IGDB live search, forged-assertion rejection, nonce single-use, unlinked guard and Steam-table RLS all verified against the deployed functions.");
})().catch(e => { console.error("Integration run crashed:", e.message); process.exit(1); });
