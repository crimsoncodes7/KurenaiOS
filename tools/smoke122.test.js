/* Kurenai OS — smoke122.test.js
   Offline fallbacks (quality programme W0, §A7; invariants 31, 37, 34, 36b).

   The claims:

     A · THE WORKER OFFLINE (sw.js in a Node vm, mocked Cache Storage): a
         navigation is answered with the cached shell when the network
         rejects — on a deployed host (cache first, no request) and on a
         local dev host (network first, the cache as the fallback); a
         cached static is served and an uncached one is a 504 "offline",
         never a thrown fetch; with nothing cached a navigation rejects
         rather than caching anything.
     B · NEVER CACHED (invariant 37): a non-GET is not intercepted; an API
         GET (Supabase, AniList, VNDB, Open Library) is not intercepted and
         nothing lands in any cache for it; a failed (404/500) static is
         not cached; the share target is the one POST answered and caches
         no request.
     C · THE APP BOOTS SIGNED OUT WITH NO NETWORK: every fetch rejects and
         navigator.onLine is false from the first script; the scripts load,
         Home renders, cloud is signed out, and nothing throws.
     D · SYNC FAILS SOFT: with the vendored supabase-js configured and
         every fetch rejecting, KOS.cloud.init is signed out (no error),
         signIn and invoke return an Error (no throw), a signed-in
         cloudsync cycle ends in status "error" with a message (the real
         api's network failure), offline reads "offline", and a local save
         still succeeds (invariant 31).

   Run: node tools/smoke122.test.js */
"use strict";
process.env.TZ = "Europe/London";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const SW_SRC = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const INDEX = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const unhandled = [];
process.on("unhandledRejection", (e) => unhandled.push(String(e && e.message || e)));

/* ---------------- the worker harness ---------------- */
function makeCaches(origin) {
  const store = new Map();
  const key = (r) => new URL(typeof r === "string" ? r : r.url, origin + "/").href;
  function cacheOf(name) {
    if (!store.has(name)) store.set(name, new Map());
    const m = store.get(name);
    return {
      match: async (r) => { const v = m.get(key(r)); return v ? v.clone() : undefined; },
      put: async (r, res) => { m.set(key(r), res); },
      add: async (r) => { const res = await api._fetch(r); if (!res.ok) throw new Error("add " + res.status); m.set(key(r), res); },
      _map: m
    };
  }
  const api = { _store: store, _fetch: null, open: async (n) => cacheOf(n), keys: async () => [...store.keys()], delete: async (n) => store.delete(n) };
  return api;
}
function allCachedUrls(caches) { const out = []; caches._store.forEach((m) => m.forEach((v, k) => out.push(k))); return out; }

const net = { online: true, hits: [] };
function serverFetch(r) {
  const url = new URL(typeof r === "string" ? r : r.url, "https://kurenai-os.pages.dev/");
  net.hits.push((r.method || "GET") + " " + url.href);
  if (!net.online) return Promise.reject(new TypeError("Failed to fetch"));
  if (/\/missing\.js$/.test(url.pathname)) return Promise.resolve(new Response("nope", { status: 404 }));
  if (/\/broken\.js$/.test(url.pathname)) return Promise.resolve(new Response("err", { status: 500 }));
  if (url.pathname === "/" || url.pathname === "/index.html") return Promise.resolve(new Response(INDEX.replace("<head>", "<head><!-- shell -->"), { status: 200 }));
  if (url.pathname === "/js/env.local.js") return Promise.resolve(new Response("", { status: 404 }));
  return Promise.resolve(new Response("/* " + url.pathname + " */", { status: 200 }));
}
function loadWorker(caches, origin) {
  const listeners = {};
  const self = {
    location: new URL(origin + "/sw.js"),
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
    skipWaiting: () => Promise.resolve(),
    clients: { claim: () => Promise.resolve(), matchAll: async () => [] },
    registration: { showNotification: async () => {} }
  };
  /* a worker resolves Response.redirect's relative URL against its own location; Node needs it absolute */
  class SWResponse extends Response { static redirect(u, s) { return Response.redirect(new URL(u, origin + "/").href, s); } }
  class SWRequest extends Request { constructor(u, i) { super(new URL(u, origin + "/").href, i); } }
  vm.runInContext(SW_SRC, vm.createContext({ self, caches, fetch: (r) => caches._fetch(r), Response: SWResponse, Request: SWRequest, Headers, URL, Set, Map, Promise, console, Date }), { filename: "sw.js" });
  async function lifecycle(type) { const w = []; (listeners[type] || []).forEach((fn) => fn({ waitUntil: (p) => w.push(p) })); await Promise.all(w); }
  async function fetchEvent(req) {
    let resp = null; const waits = [];
    const e = { request: req, respondWith: (p) => { if (!resp) resp = Promise.resolve(p); }, waitUntil: (p) => waits.push(p) };
    (listeners.fetch || []).forEach((fn) => fn(e));
    let response = null, error = null;
    if (resp) { try { response = await resp; } catch (x) { error = x; } }
    await Promise.all(waits.map((p) => Promise.resolve(p).catch(() => null)));
    return { handled: !!resp, response, error };
  }
  const R = (u, method, mode, extra) => Object.assign({ url: new URL(u, origin + "/").href, method: method || "GET", mode: mode || "no-cors", headers: new Headers() }, extra || {});
  return { install: () => lifecycle("install"), activate: () => lifecycle("activate"), fetch: fetchEvent, R };
}

const PROD = "https://kurenai-os.pages.dev", DEV = "http://localhost:8765";
let P, D, pc, dc;

step("A · offline, the worker answers from its cache", async () => {
  pc = makeCaches(PROD); pc._fetch = serverFetch;
  dc = makeCaches(DEV); dc._fetch = (r) => serverFetch(typeof r === "string" ? new URL(r, DEV + "/").href : r);
  P = loadWorker(pc, PROD); D = loadWorker(dc, DEV);
  net.online = true;
  await P.install(); await P.activate();
  await D.install(); await D.activate();
  net.online = false; net.hits = [];
  /* deployed host: cache first, no request */
  const n = await P.fetch(P.R("/", "GET", "navigate"));
  assert(n.handled && n.response && /<!-- shell -->/.test(await n.response.text()), "the cached shell for a navigation");
  eq(net.hits.length, 0, "a deployed navigation does not touch the network");
  /* dev host: network first, the cache when it rejects */
  const d = await D.fetch(D.R("/#/home", "GET", "navigate"));
  assert(!d.error && d.response && /<!-- shell -->/.test(await d.response.text()), "dev host falls back to the cached shell");
  assert(net.hits.length === 1, "dev host tried the network first");
  /* statics */
  const s = await P.fetch(P.R("js/core/store.js"));
  assert(s.response && s.response.status === 200 && /store\.js/.test(await s.response.text()), "a cached script is served offline");
  const u = await P.fetch(P.R("js/not-precached.js"));
  assert(!u.error && u.response && u.response.status === 504 && u.response.statusText === "offline", "an uncached static is a 504 offline, not a throw");
  /* nothing cached at all */
  const empty = makeCaches(PROD); empty._fetch = serverFetch;
  const E = loadWorker(empty, PROD);
  const en = await E.fetch(E.R("/", "GET", "navigate"));
  assert(en.handled && en.error, "with no shell and no network a navigation rejects (the browser's own offline page)");
  eq(allCachedUrls(empty), [], "and nothing was cached");
});

step("B · non-GET and APIs are never intercepted or cached", async () => {
  net.online = true;
  const before = allCachedUrls(pc).length;
  const post = await P.fetch(P.R("js/core/store.js", "POST"));
  eq(post.handled, false, "a same-origin POST passes through");
  for (const api of ["https://abc.supabase.co/rest/v1/kos_state?select=*", "https://graphql.anilist.co/", "https://api.vndb.org/kana/ulist",
    "https://openlibrary.org/search.json?q=x", "https://www.googleapis.com/books/v1/volumes?q=x", "https://abc.supabase.co/functions/v1/ai-chat"]) {
    const g = await P.fetch(P.R(api, "GET"));
    eq(g.handled, false, "an API GET passes through: " + api);
    const p = await P.fetch(P.R(api, "POST"));
    eq(p.handled, false, "an API POST passes through: " + api);
  }
  const put = await P.fetch(P.R("index.html", "PUT"));
  eq(put.handled, false, "a PUT passes through");
  /* a failed static is passed on, never cached */
  const m = await P.fetch(P.R("js/missing.js"));
  eq(m.response && m.response.status, 404, "a 404 is passed on");
  const b = await P.fetch(P.R("js/broken.js"));
  eq(b.response && b.response.status, 500, "a 500 is passed on");
  const urls = allCachedUrls(pc);
  assert(!urls.some((x) => /missing\.js|broken\.js/.test(x)), "neither is cached");
  const API_HOSTS = /^(abc\.supabase\.co|graphql\.anilist\.co|api\.vndb\.org|openlibrary\.org|www\.googleapis\.com)$/;
  assert(!urls.some((x) => API_HOSTS.test(new URL(x).hostname)), "no API response is cached");
  eq(urls.length, before, "the caches did not grow");
  /* the CDN is the one cross-origin GET cached (runtime cache) */
  const cdn = await P.fetch(P.R("https://cdn.jsdelivr.net/npm/x@1.0.0/x.js"));
  assert(cdn.handled, "a CDN static is handled");
  /* the share target: the one POST answered, caching no request */
  const fd = new FormData();
  fd.append("files", new Blob(["hello"], { type: "text/plain" }), "a.txt");
  const share = await P.fetch(P.R("share-target", "POST", "navigate", { formData: async () => fd }));
  assert(share.handled && share.response.status === 303, "the share target redirects");
  const inbox = pc._store.get("kos-share-inbox");
  assert(inbox && inbox.size === 1 && [...inbox.keys()].every((k) => /share-inbox\//.test(k)), "the shared file is in the inbox, under its own key");
  assert(!allCachedUrls(pc).some((k) => /share-target/.test(k)), "the POST itself is never cached");
});

/* ---------------- the app with no network ---------------- */
let W, K, appErrors = [];
async function settle(n) { for (let i = 0; i < (n || 30); i++) await new Promise((r) => setImmediate(r)); }

step("C · the app boots signed out with no network", async () => {
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { if (!/Not implemented: (navigation|HTMLCanvasElement)/.test(e.message)) appErrors.push("jsdom: " + e.message); });
  const dom = new JSDOM(INDEX, { url: "https://kurenai-os.pages.dev/index.html", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
  W = dom.window;
  W.addEventListener("error", (e) => appErrors.push("window error: " + e.message));
  const noop = () => {};
  const ctx = new Proxy({}, { get: (t, k) => (k === "measureText" ? () => ({ width: 10 }) : /Gradient$/.test(String(k)) ? () => ({ addColorStop: noop }) : typeof k === "string" ? noop : undefined), set: () => true });
  W.HTMLCanvasElement.prototype.getContext = () => ctx;
  W.setInterval = () => 0;
  const realST = W.setTimeout.bind(W);
  /* long timers (tickers, retries' back-off) are shortened, never dropped:
     a dropped timer would leave a promise the test then waits on forever */
  W.setTimeout = (fn, ms, ...a) => realST(fn, Math.min(+ms || 0, 20), ...a);
  W.requestAnimationFrame = (cb) => realST(() => cb(0), 16);
  W.scrollTo = noop; W.Element.prototype.scrollIntoView = noop; W.Element.prototype.scrollTo = noop;
  W.matchMedia = (q) => ({ matches: false, media: q, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop });
  W.IntersectionObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
  W.ResizeObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
  W.HTMLMediaElement.prototype.play = () => Promise.resolve();
  W.HTMLMediaElement.prototype.pause = noop;
  Object.defineProperty(W.navigator, "onLine", { get: () => false, configurable: true });
  W.fetchCalls = 0;
  W.fetch = () => { W.fetchCalls++; return Promise.reject(new TypeError("Failed to fetch")); };
  const fake = require("fake-indexeddb");
  W.indexedDB = new fake.IDBFactory(); W.IDBKeyRange = fake.IDBKeyRange;
  const loadErrors = [];
  for (const m of INDEX.matchAll(/<script src="([^"]+)"><\/script>/g)) {
    try { W.eval(fs.readFileSync(path.join(ROOT, m[1]), "utf8")); } catch (e) { loadErrors.push(m[1] + ": " + e.message); }
  }
  K = W.KOS;
  if (K.autosync && K.autosync.stop) K.autosync.stop();
  await settle(60);
  eq(loadErrors, [], "every script loads offline");
  const main = W.document.getElementById("main");
  assert(main && main.textContent.trim().length > 50, "Home renders");
  eq(K.cloud.signedIn(), false, "signed out");
  const st = K.cloudsync.getStatus().state;
  assert(["unconfigured", "signedOut", "offline"].indexOf(st) !== -1, "the sync status is one the UI shows: " + st);
  eq(appErrors, [], "nothing threw while booting");
});

step("D · cloud and sync fail soft when every fetch rejects", async () => {
  /* the vendored supabase-js, configured for a project the network cannot reach */
  W.KOS_ENV = { SUPABASE_URL: "https://offline-test.supabase.co", SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiJ9.e30.public-anon-key-for-tests" };
  W.eval(fs.readFileSync(path.join(ROOT, "js/vendor/supabase.js"), "utf8"));
  assert(K.cloud.available(), "the client library is configured");
  let initOut = null;
  K.cloud.init((err, session) => { initOut = { err, session }; });
  await settle(60);
  assert(initOut && !initOut.err && initOut.session === null, "init: signed out, no error");
  let signIn = null;
  K.cloud.signIn("someone@example.com", "not-a-real-password", (err) => { signIn = err; });
  for (let i = 0; i < 40 && !signIn; i++) await settle(20);
  assert(signIn instanceof W.Error || (signIn && signIn.message), "signIn returns an Error");
  assert(signIn.message.length > 0, "with a message the form can show: " + signIn.message);
  let inv = null;
  K.cloud.invoke("ai-chat", {}, (err) => { inv = err; });
  assert(inv && /Sign in/.test(inv.message), "invoke signed out is an Error, never a request");
  /* a signed-in cycle over the REAL api (supabase-js) with no network */
  Object.defineProperty(W.navigator, "onLine", { get: () => true, configurable: true });
  K.cloudsync._config({ session: { userId: "00000000-0000-0000-0000-000000000001", email: "t@example.com" }, quiet: true });
  const seen = [];
  K.cloudsync.onStatus((s) => seen.push(s.state));
  let out = null;
  K.cloudsync.syncNow((err) => { out = { err }; });
  for (let i = 0; i < 200 && !out; i++) { await settle(5); await new Promise((r) => setTimeout(r, 10)); }
  if (!out && process.env.DEBUG) console.log("states", seen, "fetches", W.fetchCalls);
  assert(out, "the cycle finished");
  assert(out.err && out.err.message, "it reports an error: " + (out.err && out.err.message));
  eq(K.cloudsync.getStatus().state, "error", "status error");
  assert(K.cloudsync.getStatus().detail.length > 0, "with a detail the UI shows: " + K.cloudsync.getStatus().detail);
  assert(seen.indexOf("syncing") !== -1, "it went through syncing");
  eq(K.cloudsync.isRunning(), false, "and is not left running");
  /* offline is its own status */
  Object.defineProperty(W.navigator, "onLine", { get: () => false, configurable: true });
  let off = null;
  K.cloudsync.syncNow(() => { off = true; });
  await settle(10);
  assert(off, "the offline cycle returns");
  eq(K.cloudsync.getStatus().state, "offline", "status offline");
  /* a local save still works (invariant 31) */
  K.store.state.governor.gold = 4321; K.store.save(); K.store.flush && K.store.flush();
  const raw = Object.keys(W.localStorage).map((k) => W.localStorage.getItem(k)).join("");
  assert(/4321/.test(raw), "the local save landed");
  eq(appErrors, [], "nothing threw");
  eq(unhandled.filter((m) => !/Failed to fetch/.test(m)), [], "no unhandled rejection beyond the network's own");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke122: " + failed + " failed" : "smoke122: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
