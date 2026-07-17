/* Kurenai OS — smoke19.test.js
   Build 4c suite: IGDB search + verified Steam import for the Games module.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke19.test.js

   TESTED PROPERTIES:
   1. gameapi: loads inert; with no cloud session every call returns a clear
      error through the callback — no throw, no network request.
   2. The Games vault renders its new ⊕ Find new / ◆ Steam actions; using
      them signed-out explains instead of fetching (manual entry untouched).
   3. applySteamImport merge law: new rows create Planned drafts with the
      appId + playtime; an entry already carrying the appId is GAP-FILLED
      ONLY (a manual playtime survives a different Steam value; notes/tier
      survive); an exact-title id-less entry adopts the appId; a same-title
      entry with a DIFFERENT appId is left completely alone; the whole
      import logs exactly ONE governor session, and an import that changes
      nothing logs none; zero network from the apply path.
   4. mediasearch grew the game branch (STATUS_WORDS, IGDB naming).
   5. Edge Function sources: all three exist; secrets are read only via
      Deno.env.get and never logged; steam-auth performs the server-side
      check_authentication with an is_valid gate and the strict 17-digit
      claimed_id pattern, consumes the nonce single-use; steam-owned-games
      never parses a client-supplied SteamID (no request body is read at
      all); config.toml disables platform JWT verification ONLY for
      steam-auth (the Steam redirect can't carry a JWT — it validates JWTs
      itself for every POST action).                                        */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;

let netLog = [];
window.fetch = (url, opts) => {
  netLog.push({ url: String(url) });
  return Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });
};

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

/* ============ 1 · gameapi inert without a session ============ */
console.log("== gameapi: graceful without cloud ==");

step("every gameapi call fails cleanly through the callback, zero network", async () => {
  assert(KOS.gameapi, "KOS.gameapi missing");
  assert(KOS.gameapi.ready() === false, "ready() should be false without a session");
  const net0 = netLog.length;
  for (const call of [
    cb => KOS.gameapi.igdbSearch("zelda", null, cb),
    cb => KOS.gameapi.steamStatus(cb),
    cb => KOS.gameapi.steamBegin(cb),
    cb => KOS.gameapi.steamOwnedGames(cb)
  ]) {
    const err = await new Promise(res => call((e) => res(e)));
    /* note: jsdom Errors are another realm's — check shape, not instanceof */
    assert(err && typeof err.message === "string" && /cloud/i.test(err.message),
      "expected a cloud-signin explanation, got: " + err);
  }
  assert(netLog.length === net0, "a signed-out gameapi call emitted network traffic");
});

/* ============ 2 · the vault UI stays manual-first ============ */
console.log("== games vault: new actions, manual baseline ==");

step("the toolbar renders Find new + Steam; signed-out Find new toasts, no fetch", async () => {
  KOS.show("game");
  await tick(80);
  const btns = [...window.document.querySelectorAll("#main button")].map(b => b.textContent);
  assert(btns.some(t => t.includes("Find new")), "⊕ Find new missing from the games toolbar");
  assert(btns.some(t => t.includes("Steam")), "◆ Steam missing from the games toolbar");
  assert(btns.some(t => t.includes("Bulk add")), "manual Bulk add must remain");
  assert(btns.some(t => t.includes("+ Add")), "manual + Add must remain");
  const net0 = netLog.length;
  [...window.document.querySelectorAll("#main button")].find(b => b.textContent.includes("Find new")).click();
  await tick(30);
  assert(netLog.length === net0, "signed-out Find new fetched something");
  assert(!window.document.querySelector(".msch-modal"), "search modal should not open signed-out");
});

step("the Steam modal opens signed-out with an explanation, not a request", async () => {
  const net0 = netLog.length;
  [...window.document.querySelectorAll("#main button")].find(b => b.textContent.includes("Steam")).click();
  await tick(30);
  const modal = window.document.querySelector(".gm-steam-modal");
  assert(modal, "Steam modal missing");
  assert(/cloud account|sign in/i.test(modal.textContent), "signed-out explanation missing");
  assert(netLog.length === net0, "signed-out Steam modal fetched something");
  modal.parentElement.remove();
});

/* ============ 3 · applySteamImport merge law ============ */
console.log("== applySteamImport ==");

step("creates drafts, gap-fills, adopts, and never overwrites manual data", async () => {
  /* the vault before the import */
  const manual = await p(cb => KOS.mediadb.add({ module: "game", title: "Hades", status: "inProgress",
    playtimeHours: 12, completionTier: "storyComplete", notes: "my notes",
    externalIds: { steamAppId: 1145360 } }, cb));
  const gapme = await p(cb => KOS.mediadb.add({ module: "game", title: "Celeste",
    externalIds: { steamAppId: 504230 } }, cb));                       // playtime null → fillable
  const adoptme = await p(cb => KOS.mediadb.add({ module: "game", title: "Outer Wilds" }, cb)); // no id → adoptable
  const clash = await p(cb => KOS.mediadb.add({ module: "game", title: "Portal 2",
    externalIds: { steamAppId: 999999 } }, cb));                       // DIFFERENT id → untouchable

  const sessions0 = KOS.store.state.sessions.length;
  const net0 = netLog.length;
  const rep = await p(cb => KOS.games.applySteamImport([
    { appId: 1145360, title: "Hades", playtimeHours: 40 },             // manual playtime must survive
    { appId: 504230, title: "Celeste", playtimeHours: 9.5 },           // gap-fill
    { appId: 753640, title: "Outer Wilds", playtimeHours: 20 },        // adopt by exact title
    { appId: 620, title: "Portal 2", playtimeHours: 3 },               // same title, other id → skipped (no dupe, no clobber)
    { appId: 1091500, title: "Cyberpunk 2077", playtimeHours: 0 }      // brand new
  ], cb));

  assert(rep.added === 1, "added: " + rep.added);       // Cyberpunk only
  assert(rep.updated === 2, "updated: " + rep.updated); // Celeste + Outer Wilds
  assert(rep.unchanged === 2, "unchanged: " + rep.unchanged); // Hades + Portal 2 (id clash)

  const hades = await p(cb => KOS.mediadb.get(manual.id, cb));
  assert(hades.playtimeHours === 12, "MANUAL PLAYTIME OVERWRITTEN: " + hades.playtimeHours);
  assert(hades.completionTier === "storyComplete" && hades.notes === "my notes", "manual fields lost");
  const celeste = await p(cb => KOS.mediadb.get(gapme.id, cb));
  assert(celeste.playtimeHours === 9.5, "gap-fill failed: " + celeste.playtimeHours);
  const outer = await p(cb => KOS.mediadb.get(adoptme.id, cb));
  assert(outer.externalIds.steamAppId === 753640, "adoption failed");
  assert(outer.playtimeHours === 20, "adopted entry not gap-filled");
  const portal = await p(cb => KOS.mediadb.get(clash.id, cb));
  assert(portal.externalIds.steamAppId === 999999, "clashing id was clobbered");
  assert(portal.playtimeHours == null, "clashing entry was modified");
  const portals = await p(cb => KOS.mediadb.query({ module: "game", search: "portal 2" }, cb));
  assert(portals.length === 1, "a same-title-different-id row must be skipped, not duplicated — found " + portals.length);
  const cp = await p(cb => KOS.mediadb.query({ module: "game", search: "cyberpunk" }, cb));
  assert(cp.length === 1 && cp[0].status === "planned" && cp[0].playtimeHours === null,
    "new draft wrong: " + JSON.stringify(cp.map(x => ({ s: x.status, h: x.playtimeHours }))));

  assert(KOS.store.state.sessions.length === sessions0 + 1, "expected exactly ONE session for the import");
  const last = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  assert(last.metrics && last.metrics.action === "steam-import" && last.metrics.count === 3, "session shape: " + JSON.stringify(last.metrics));
  assert(netLog.length === net0, "applySteamImport emitted network traffic");
});

step("a no-op import logs no session and is idempotent", async () => {
  const sessions0 = KOS.store.state.sessions.length;
  const rep = await p(cb => KOS.games.applySteamImport([
    { appId: 1145360, title: "Hades", playtimeHours: 40 }
  ], cb));
  assert(rep.added === 0 && rep.updated === 0 && rep.unchanged >= 1, JSON.stringify(rep));
  assert(KOS.store.state.sessions.length === sessions0, "a no-op import minted a session");
});

/* ============ 4 · mediasearch game branch ============ */
console.log("== mediasearch ==");

step("STATUS_WORDS gained the game vocabulary; branch names IGDB", () => {
  assert(KOS.mediaSearch.STATUS_WORDS.game && KOS.mediaSearch.STATUS_WORDS.game.inProgress === "Playing", "game status words missing");
  const src = read("js/modules/mediasearch.js");
  assert(src.includes('module === "game" ? "IGDB"'), "IGDB service naming missing");
  assert(src.includes("localFromIgdb"), "IGDB mapper missing");
  assert(src.includes("igdbSearch"), "gameapi wiring missing");
});

/* ============ 5 · Edge Function source contracts ============ */
console.log("== edge functions ==");

step("all three functions exist; secrets only via Deno.env.get, never logged", () => {
  const files = ["supabase/functions/igdb-search/index.ts",
    "supabase/functions/steam-auth/index.ts",
    "supabase/functions/steam-owned-games/index.ts",
    "supabase/functions/_shared/cors.ts"];
  for (const f of files) {
    const src = read(f);
    assert(!/console\.log/.test(src), f + " contains console.log — secrets risk");
    /* no literal credential shapes anywhere */
    assert(!/(sk_|sb_secret|service_role_key\s*[:=]\s*["'])/i.test(src), f + " may contain a literal secret");
  }
  const igdb = read("supabase/functions/igdb-search/index.ts");
  ["TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"].forEach(k =>
    assert(igdb.includes(`Deno.env.get("${k}")`), "igdb-search must read " + k + " from env"));
  const owned = read("supabase/functions/steam-owned-games/index.ts");
  assert(owned.includes('Deno.env.get("STEAM_API_KEY")'), "owned-games must read STEAM_API_KEY from env");
});

step("steam-auth: server-side check_authentication, strict identity, single-use nonce", () => {
  const src = read("supabase/functions/steam-auth/index.ts");
  assert(src.includes("check_authentication"), "no check_authentication round-trip");
  assert(/is_valid\\s\*:\\s\*true|is_valid\\s*:\\s*true/.test(src) || src.includes("is_valid"), "no is_valid gate");
  assert(src.includes("\\d{17}"), "claimed_id must be matched as exactly 17 digits");
  assert(src.indexOf("DELETE") !== -1 && src.indexOf("kos_steam_auth?nonce=eq.") !== -1, "nonce must be consumed");
  /* the nonce is deleted BEFORE the verification result is honoured — anchor
     on the code call, not the header comment's mention */
  const verifyCall = src.indexOf('verify.set("openid.mode", "check_authentication")');
  assert(verifyCall !== -1, "verification call missing");
  assert(src.indexOf('method: "DELETE"') < verifyCall, "nonce must be single-use even on failed verification");
  assert(src.includes("requireUserId"), "begin/status/unlink must validate the JWT");
});

step("steam-owned-games never reads a client-supplied SteamID", () => {
  const src = read("supabase/functions/steam-owned-games/index.ts");
  assert(!src.includes("req.json"), "owned-games must not parse a request body at all");
  assert(src.includes("kos_steam?user_id=eq."), "identity must come from the verified kos_steam row");
  assert(src.includes("requireUserId"), "JWT validation missing");
});

step("config.toml: verify_jwt off ONLY for steam-auth", () => {
  const cfg = read("supabase/config.toml");
  const igdbOn = /\[functions\.igdb-search\]\s*\nverify_jwt = true/.test(cfg);
  const authOff = /\[functions\.steam-auth\]\s*\nverify_jwt = false/.test(cfg);
  const ownedOn = /\[functions\.steam-owned-games\]\s*\nverify_jwt = true/.test(cfg);
  assert(igdbOn && authOff && ownedOn, "per-function verify_jwt wrong: " + JSON.stringify({ igdbOn, authOff, ownedOn }));
});

step("the new migration creates kos_steam with owner-read-only RLS", () => {
  const sql = read("supabase/migrations/20260717000001_kos_steam.sql");
  assert(sql.includes("create table public.kos_steam"), "kos_steam missing");
  assert(sql.includes("create table public.kos_steam_auth"), "kos_steam_auth missing");
  assert((sql.match(/enable row level security/g) || []).length === 2, "RLS must be enabled on both tables");
  assert(sql.includes("for select to authenticated using (auth.uid() = user_id)"), "owner select policy missing");
  assert(!/for (insert|update|delete)/.test(sql), "no client write policy may exist on the steam tables");
});

/* ============ run ============ */
(async () => {
  let pass = 0;
  const fails = [];
  for (const [name, fn] of steps) {
    try {
      await fn();
      console.log("  ok  " + name);
      pass++;
    } catch (e) {
      fails.push(`STEP "${name}": ${e.message}`);
      console.log("  FAIL " + name + " — " + e.message);
    }
  }
  if (errors.length) fails.push(...errors);
  console.log("");
  if (fails.length) {
    console.log("SMOKE19 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE19 PASS — Build 4c IGDB + verified Steam verified (" + pass + " steps).");
  process.exit(0);
})();
