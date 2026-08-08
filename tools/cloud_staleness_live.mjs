/* Kurenai OS — tools/cloud_staleness_live.mjs
   LIVE two-device verification of the Category 7 staleness guard, against
   the configured Supabase project. Companion to cloud_integration.mjs and
   to smoke41 (which mocks the API seam); this one uses the real database.

   Run (creates ONE throw-away auth user, cleans up its row afterwards):
     node tools/cloud_staleness_live.mjs

   What it proves that smoke41 cannot:
   - __seq survives a real Postgres jsonb round trip
   - the guard reads a genuinely server-generated updated_at / row
   - two independent devices, each with its own engine state and its own
     sync meta, reach the same conclusions against one real kos_state row
   - the reproduced 8 Aug incident does not recur end to end

   NOTE ON FIDELITY: both devices run the REAL cloudsync engine over the
   REAL database. The only substitution is the transport — the api seam is
   a plain-fetch implementation of exactly the calls realApi() makes, so
   the Supabase JS client itself is not exercised here. RLS, auth and the
   client library are covered by tools/cloud_integration.mjs.

   Cleanup: the kos_state row is deleted. The auth user cannot delete
   itself without a service-role key — remove it from the dashboard
   (Authentication → Users) if you want a spotless list.                  */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { IDBFactory, IDBKeyRange as FakeIDBKeyRange } from "fake-indexeddb";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envSrc = readFileSync(resolve(ROOT, "js/env.local.js"), "utf8");
const BASE = (envSrc.match(/SUPABASE_URL:\s*"([^"]+)"/) || [])[1];
const APIKEY = (envSrc.match(/SUPABASE_ANON_KEY:\s*"([^"]+)"/) || [])[1];
if (!BASE || !APIKEY) { console.error("Could not read js/env.local.js"); process.exit(1); }
const URLBASE = BASE.replace(/\/$/, "");

let failures = 0;
function ok(name, cond, detail) {
  console.log((cond ? "  ok   " : "  FAIL ") + name + (cond || !detail ? "" : " — " + detail));
  if (!cond) failures++;
}

/* ---------------- throw-away account ---------------- */
async function rest(path, opts = {}, token) {
  const r = await fetch(URLBASE + path, {
    ...opts,
    headers: {
      apikey: APIKEY,
      Authorization: "Bearer " + (token || APIKEY),
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  const text = await r.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: r.status, body };
}

const email = `kos-stale-${Date.now()}@example.com`;
const password = "kos-throwaway-" + Math.random().toString(36).slice(2, 12);
const signup = await rest("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password }) });
const token = signup.body && signup.body.access_token;
const userId = signup.body && signup.body.user && signup.body.user.id;
if (!token || !userId) {
  console.error("sign-up did not return a session — is email confirmation on?", signup.status, signup.body);
  process.exit(1);
}
console.log("throw-away user:", email, "\n");

/* the api seam, exactly the calls realApi() makes for kos_state */
function liveApi() {
  const noRows = (cb) => cb(null, []);
  return {
    fetchState: (cb) => rest(`/rest/v1/kos_state?select=state_json,updated_at&user_id=eq.${userId}`, {}, token)
      .then(r => cb(null, Array.isArray(r.body) && r.body[0] ? r.body[0] : null))
      .catch(e => cb(e)),
    upsertState: (json, cb) => rest("/rest/v1/kos_state?on_conflict=user_id",
      { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ user_id: userId, state_json: json }) }, token)
      .then(r => {
        const row = Array.isArray(r.body) ? r.body[0] : r.body;
        if (!row || !row.updated_at) { cb(new Error("upsert returned no row: " + JSON.stringify(r.body))); return; }
        cb(null, { updated_at: row.updated_at });
      }).catch(e => cb(e)),
    fetchMediaSince: (i, o, cb) => noRows(cb), upsertMedia: (r, cb) => noRows(cb),
    countMedia: cb => cb(null, 0), listMediaIds: (o, cb) => noRows(cb),
    fetchFilesSince: (i, o, cb) => noRows(cb), upsertFiles: (r, cb) => noRows(cb),
    listFileIds: (o, cb) => noRows(cb), markUploaded: (f, cb) => cb(null, [{}]),
    uploadBinary: (a, b, c, cb) => cb(null, {}), downloadBinary: (a, cb) => cb(new Error("none")),
    removeBinary: (a, cb) => cb(null)
  };
}

/* ---------------- one independent "device" ---------------- */
const html = readFileSync(resolve(ROOT, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
function makeDevice(name) {
  const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const noop = () => {};
  const ctx = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.requestAnimationFrame = cb => setTimeout(cb, 0);
  window.confirm = () => true; window.__kosAutoConfirm = true;
  window.fetch = globalThis.fetch;
  /* each device gets its OWN IDBFactory, so their sync metas are genuinely
     independent — this is what makes them two devices rather than two tabs */
  window.indexedDB = new IDBFactory();
  window.IDBKeyRange = FakeIDBKeyRange;
  window.IntersectionObserver = function (cb, opts) {
    const self = { cb, opts: opts || {}, targets: [], observe: t => self.targets.push(t), unobserve: noop, disconnect: noop };
    return self;
  };
  for (const src of scripts) {
    try { window.eval(readFileSync(resolve(ROOT, src), "utf8")); } catch (e) { /* labs/canvas noise */ }
  }
  const KOS = window.KOS;
  if (KOS.autosync) KOS.autosync.stop();
  KOS.cloudsync.stop();
  KOS.cloudsync._config({ api: liveApi(), session: { userId, email }, quiet: true,
    pushDebounce: 10 * 60 * 1000, minPullGap: 0, bootDelay: 0 });
  return { name, KOS, sync: () => new Promise((res, rej) => KOS.cloudsync.syncNow(e => e ? rej(e) : res())) };
}

const RICH = () => ({
  v: 1, progress: { "compsci:4.1.1.1": { status: "done", check: [true, true, true, true], note: "" } },
  sessions: Array.from({ length: 300 }, (_, i) => ({ id: "s" + i, ts: 1, date: "2026-08-08", type: "media", dur: 60, metrics: {} })),
  governor: { hp: 1, gold: 12476, xp: 72312, owned: ["theme-celestial-duality"], theme: "celestial-duality",
    avatar: { kind: "img", id: "a", img: "LAPTOP-AVATAR", crop: null, frame: "f4" }, banner: "LAPTOP-BANNER" },
  wishlist: { nextId: 9, budget: { monthlyLimit: 60, currency: "GBP", history: [] }, items: [{ id: 1, module: "books", title: "planned" }] }
});
const STALE = () => ({
  v: 1, progress: {},
  sessions: Array.from({ length: 40 }, (_, i) => ({ id: "old" + i, ts: 1, date: "2026-07-22", type: "focus", dur: 60, metrics: {} })),
  governor: { hp: 60, gold: 3000, xp: 20000, owned: [], theme: "",
    avatar: { kind: "none", id: "", img: "", crop: null, frame: "" }, banner: "" },
  wishlist: { nextId: 1, budget: { monthlyLimit: 0, currency: "GBP", history: [] }, items: [] }
});
const cloudRow = async () => {
  const r = await rest(`/rest/v1/kos_state?select=state_json,updated_at&user_id=eq.${userId}`, {}, token);
  return Array.isArray(r.body) && r.body[0] ? r.body[0] : null;
};

console.log("== live two-device staleness verification ==");
try {
  const phone = makeDevice("phone");
  const laptop = makeDevice("laptop");

  /* 1 · the phone establishes the account, weeks ago */
  phone.KOS.store.replaceState(STALE());
  await phone.sync();
  if (phone.KOS.cloudsync.linkStatus() === "localOnly")
    await new Promise((r, j) => phone.KOS.cloudsync.migrateUp(e => e ? j(e) : r()));
  let row = await cloudRow();
  ok("the phone's document reaches real Postgres", row && row.state_json.governor.gold === 3000,
    row ? "gold " + row.state_json.governor.gold : "no row");
  ok("__seq survives the jsonb round trip", row && typeof row.state_json.__seq === "number",
    row ? "__seq " + row.state_json.__seq : "no row");
  ok("updated_at is server-generated", !!(row && row.updated_at), row && row.updated_at);

  /* 2 · the laptop catches up, then works for weeks */
  laptop.KOS.store.replaceState(STALE());
  await laptop.sync();                                  // adopt the account
  if (laptop.KOS.cloudsync.linkStatus() === "both")
    await new Promise((r, j) => laptop.KOS.cloudsync.resolveBoth("cloud", e => e ? j(e) : r()));
  laptop.KOS.store.replaceState(RICH());
  laptop.KOS.store.save();
  for (let i = 0; i < 3; i++) {
    laptop.KOS.store.state.progress["compsci:laptop" + i] = { status: "done", check: [true, true, true, true], note: "" };
    laptop.KOS.store.save();
    await laptop.sync();
  }
  row = await cloudRow();
  const laptopSeq = row && row.state_json.__seq;
  ok("the laptop's later work is the cloud copy", row && row.state_json.governor.gold === 12476,
    row ? "gold " + row.state_json.governor.gold + ", __seq " + laptopSeq : "no row");

  /* 3 · THE INCIDENT — the dormant phone is reopened and edits once */
  phone.KOS.store.replaceState(STALE());
  phone.KOS.store.state.progress["compsci:one-real-edit"] = { status: "started", check: [false, false, false, false], note: "" };
  phone.KOS.store.save();
  await phone.sync();

  row = await cloudRow();
  ok("THE INCIDENT: the stale phone does not overwrite the laptop", row && row.state_json.governor.gold === 12476,
    row ? "cloud gold is " + row.state_json.governor.gold : "no row");
  ok("the session ledger is intact", row && row.state_json.sessions.length === 300,
    row ? row.state_json.sessions.length + " sessions" : "no row");
  ok("the avatar and banner survive", row && row.state_json.governor.avatar.img === "LAPTOP-AVATAR" && row.state_json.governor.banner === "LAPTOP-BANNER");
  ok("the Budget Planner survives", row && row.state_json.wishlist.items.length === 1);

  const st = phone.KOS.cloudsync.staleStatus();
  ok("the phone raises a conflict instead", !!st && st.remoteSeq > st.localSeq, JSON.stringify(st));

  /* 4 · the user resolves it the recommended way */
  await new Promise((r, j) => phone.KOS.cloudsync.resolveStale("cloud", e => e ? j(e) : r()));
  ok("resolveStale('cloud') clears the conflict", !phone.KOS.cloudsync.staleStatus());
  ok("the phone now holds the laptop's data", phone.KOS.store.state.governor.gold === 12476,
    "phone gold " + phone.KOS.store.state.governor.gold);

  /* 5 · and the phone can push again, in step */
  phone.KOS.store.state.progress["compsci:after-resolve"] = { status: "started", check: [false, false, false, false], note: "" };
  phone.KOS.store.save();
  await phone.sync();
  row = await cloudRow();
  ok("the phone is back in step and pushes normally", row && !!row.state_json.progress["compsci:after-resolve"]);
  ok("its push landed after the laptop's in the sequence", row && row.state_json.__seq > laptopSeq,
    row ? "__seq " + row.state_json.__seq + " vs " + laptopSeq : "no row");
} catch (e) {
  ok("harness completed", false, e && e.message);
  console.error(e);
}

/* ---------------- cleanup ---------------- */
await rest(`/rest/v1/kos_state?user_id=eq.${userId}`, { method: "DELETE" }, token);
const left = await cloudRow();
ok("test row cleaned up", !left);

console.log("");
if (failures) { console.log(`LIVE STALENESS: ${failures} FAILURE(S)`); process.exit(1); }
console.log("LIVE STALENESS PASS — the guard holds against the real database.");
console.log("(the throw-away auth user " + email + " remains; delete it from the dashboard if you like)");
process.exit(0);
