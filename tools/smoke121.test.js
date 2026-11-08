/* Kurenai OS — smoke121.test.js
   The service-worker update across two versions (quality programme W0,
   §A7; invariants 37 and 38, 105 and 152).

   sw.js runs in a Node vm with a mocked Cache Storage, clients and a
   "server" that serves a deploy's files; it is loaded twice, as VERSION A
   and then VERSION B, over the SAME Cache Storage, as a browser would.
   js/core/pwa.js runs in the app (tools/lib/app-harness.js) with a mocked
   ServiceWorkerContainer and registration, and the real confirm dialog.

   The claims:

     A · INSTALL A precaches index.html and every script and stylesheet
         index.html names (derived, never listed — js/core/backup.js
         included) and the extras, and never calls skipWaiting.
     B · ACTIVATE A deletes the previous version's kos-static/kos-runtime
         caches and an old SQLite/PDF build's, and keeps kos-csharp-*, the
         current kos-sqlite-* and kos-pdf-*, the share inbox and anything
         not the app's; it claims its clients.
     C · NAVIGATIONS serve the index.html of the worker's own version, from
         cache, without the network — even after B is deployed and while B
         waits; a local dev host stays network-first.
     D · INSTALL B fills its own cache and leaves A's alone; B never skips
         waiting by itself; SKIP_WAITING is the one way; ACTIVATE B removes
         A's caches and keeps the long-lived ones; B's navigations serve B.
     E · pwa.js: the first install prompts nothing; an update prompts
         "Update ready" and posts nothing until the user confirms; Cancel
         posts nothing; "Reload now" posts SKIP_WAITING exactly once; a
         worker already waiting at load is offered too.

   Run: node tools/smoke121.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SW_SRC = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const INDEX = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

/* ---------------- a Cache Storage shared by both workers ---------------- */
function makeCaches(origin) {
  const store = new Map();          // name → Map(url → Response)
  const key = (r) => new URL(typeof r === "string" ? r : r.url, origin + "/").href;
  function cacheOf(name) {
    if (!store.has(name)) store.set(name, new Map());
    const m = store.get(name);
    return {
      match: async (r) => { const v = m.get(key(r)); return v ? v.clone() : undefined; },
      put: async (r, res) => { m.set(key(r), res); },
      add: async (r) => { const res = await api._fetch(r); if (!res.ok) throw new Error("add failed " + res.status); m.set(key(r), res); },
      keys: async () => [...m.keys()],
      _map: m
    };
  }
  const api = {
    _store: store, _fetch: null,
    open: async (n) => cacheOf(n),
    keys: async () => [...store.keys()],
    delete: async (n) => store.delete(n),
    has: async (n) => store.has(n),
    match: async (r) => { for (const n of store.keys()) { const v = store.get(n).get(key(r)); if (v) return v.clone(); } return undefined; }
  };
  return api;
}

/* ---------------- the server: one deploy at a time ---------------- */
const ORIGIN = "https://kurenai-os.pages.dev";
const server = { version: "A", online: true, hits: [] };
function serverFetch(r) {
  const url = new URL(typeof r === "string" ? r : r.url, ORIGIN + "/");
  server.hits.push(url.pathname);
  if (!server.online) return Promise.reject(new TypeError("Failed to fetch"));
  if (url.origin !== ORIGIN && url.hostname !== "localhost") return Promise.resolve(new Response("{}", { status: 200 }));
  if (url.pathname === "/" || url.pathname === "/index.html")
    return Promise.resolve(new Response(INDEX.replace("<head>", "<head><!-- deploy " + server.version + " -->"), { status: 200, headers: { "content-type": "text/html" } }));
  if (url.pathname === "/js/env.local.js") return Promise.resolve(new Response("", { status: 404 }));
  return Promise.resolve(new Response("/* " + server.version + " " + url.pathname + " */", { status: 200 }));
}

/* ---------------- one worker = one vm context ---------------- */
function loadWorker(version, caches, host) {
  const listeners = {};
  const calls = { skipWaiting: 0, claim: 0 };
  const self = {
    location: new URL((host || ORIGIN) + "/sw.js"),
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
    skipWaiting: () => { calls.skipWaiting++; return Promise.resolve(); },
    clients: { claim: () => { calls.claim++; return Promise.resolve(); }, matchAll: async () => [] },
    registration: { showNotification: async () => {} }
  };
  const ctx = vm.createContext({ self, caches, fetch: (r, i) => caches._fetch(r, i), Response, Request, Headers, URL, Set, Map, Promise, console, Date });
  const src = SW_SRC.replace(/var VERSION = "[^"]+";/, 'var VERSION = "' + version + '";');
  assert(src !== SW_SRC || /var VERSION = "/.test(SW_SRC), "sw.js declares VERSION");
  vm.runInContext(src, ctx, { filename: "sw.js" });
  async function lifecycle(type, data) {
    const waits = [];
    const e = { waitUntil: (p) => waits.push(p), data };
    (listeners[type] || []).forEach((fn) => fn(e));
    await Promise.all(waits);
  }
  async function fetchEvent(req) {
    let resp = null; const waits = [];
    const e = { request: req, respondWith: (p) => { if (!resp) resp = Promise.resolve(p); }, waitUntil: (p) => waits.push(p) };
    (listeners.fetch || []).forEach((fn) => fn(e));
    const r = resp ? await resp : null;
    await Promise.all(waits.map((p) => Promise.resolve(p).catch(() => null)));
    return { handled: !!resp, response: r };
  }
  const nav = (p) => ({ url: new URL(p || "/", (host || ORIGIN) + "/").href, method: "GET", mode: "navigate", headers: new Headers() });
  return {
    version, calls, ctx,
    install: () => lifecycle("install"),
    activate: () => lifecycle("activate"),
    message: (data) => lifecycle("message", data),
    fetch: fetchEvent, nav,
    get: (p) => ({ url: new URL(p, (host || ORIGIN) + "/").href, method: "GET", mode: "no-cors", headers: new Headers() })
  };
}

const caches = makeCaches(ORIGIN);
caches._fetch = serverFetch;
const A_VER = "kos-smoke-a", B_VER = "kos-smoke-b";
const SQLITE = /var SQLITE_CACHE = "([^"]+)"/.exec(SW_SRC)[1];
const PDF = /var PDF_CACHE = "([^"]+)"/.exec(SW_SRC)[1];
let A, B;
const shellOf = async (cacheName) => { const c = await caches.open(cacheName); const r = await c.match("index.html"); return r ? r.text() : null; };

step("A · install A precaches the shell index.html names", async () => {
  /* what a device already holds from earlier versions and other features */
  for (const n of ["kos-static-kos-old-9", "kos-runtime-kos-old-9", "kos-csharp-csw-1.1", SQLITE, "kos-sqlite-0.9.0", PDF, "kos-pdf-5.0-1.0",
    "kos-share-inbox", "someone-elses-cache"]) await caches.open(n);
  server.version = "A";
  A = loadWorker(A_VER, caches);
  await A.install();
  eq(A.calls.skipWaiting, 0, "install never skips waiting (invariant 38)");
  const c = caches._store.get("kos-static-" + A_VER);
  assert(c, "kos-static-" + A_VER + " exists");
  assert(/deploy A/.test(await shellOf("kos-static-" + A_VER)), "A's shell is the A deploy's index.html");
  const scripts = [...INDEX.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));
  const styles = [...INDEX.matchAll(/<link[^>]*\shref="([^"]+\.css)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));
  assert(scripts.length > 200 && styles.length > 3, "index.html names its scripts and styles");
  const missing = scripts.concat(styles).filter((u) => u !== "js/env.local.js" && !c.has(new URL(u, ORIGIN + "/").href));
  eq(missing, [], "every script and stylesheet index.html names is precached");
  assert(c.has(ORIGIN + "/js/core/backup.js"), "the backup safeguard is in the shell");
  assert(c.has(ORIGIN + "/manifest.webmanifest") && c.has(ORIGIN + "/js/labs/sql-worker.js"), "the extras are precached");
  assert(!c.has(ORIGIN + "/js/env.local.js"), "a missing env.local.js is tolerated, not cached");
});

step("B · activate A cleans the old version only", async () => {
  await A.activate();
  const names = [...caches._store.keys()].sort();
  eq(names, ["kos-csharp-csw-1.1", PDF, "kos-share-inbox", SQLITE, "kos-static-" + A_VER, "someone-elses-cache"].sort(),
    "old static/runtime and old SQLite/PDF builds gone; csharp, current sqlite/pdf, share inbox and foreign caches kept");
  eq(A.calls.claim, 1, "A claims its clients");
});

step("C · navigations serve the worker's own shell", async () => {
  server.hits = [];
  const r = await A.fetch(A.nav("/"));
  assert(r.handled, "a navigation is answered");
  assert(/deploy A/.test(await r.response.text()), "A's shell");
  eq(server.hits.filter((h) => h === "/" || h === "/index.html"), [], "without the network");
  server.version = "B";                               // a deploy lands
  const r2 = await A.fetch(A.nav("/#/home"));
  assert(/deploy A/.test(await r2.response.text()), "still A's shell after B is deployed (one version per page)");
  /* a script request is stale-while-revalidate from A's cache */
  const s = await A.fetch(A.get("js/core/store.js"));
  assert(/\/\* A /.test(await s.response.text()), "A's cached script is served");
  /* FINDING (recorded, not failed — invariant 37 says statics are SWR):
     the background refresh writes the NEW deploy's script into A's cache,
     so A's next page pairs A's shell with B's script until B activates. */
  const again = await A.fetch(A.get("js/core/store.js"));
  if (/\/\* B /.test(await again.response.text())) console.log("  note C: SWR put deploy B's js/core/store.js into kos-static-" + A_VER + " — A's shell now loads B's script (mixed version until the update is accepted)");
  /* the local dev host is network-first */
  const devCaches = makeCaches("http://localhost:8765");   // another origin, its own Cache Storage
  devCaches._fetch = serverFetch;
  const devOld = await devCaches.open("kos-static-" + A_VER);
  await devOld.put("index.html", new Response("<!-- deploy A -->"));
  const dev = loadWorker(A_VER, devCaches, "http://localhost:8765");
  const d = await dev.fetch(dev.nav("/"));
  assert(/deploy B/.test(await d.response.text()), "localhost reads index.html from the network");
});

step("D · install B, wait, SKIP_WAITING, activate B", async () => {
  server.version = "B";
  B = loadWorker(B_VER, caches);
  await B.install();
  eq(B.calls.skipWaiting, 0, "B does not skip waiting by itself");
  assert(/deploy B/.test(await shellOf("kos-static-" + B_VER)), "B's cache holds B's shell");
  assert(/deploy A/.test(await shellOf("kos-static-" + A_VER)), "A's cache still holds A's shell");
  const w = await A.fetch(A.nav("/"));
  assert(/deploy A/.test(await w.response.text()), "while B waits, A's pages are A's");
  await B.message({ type: "SOMETHING_ELSE" });
  eq(B.calls.skipWaiting, 0, "only SKIP_WAITING skips");
  await B.message({ type: "SKIP_WAITING" });
  eq(B.calls.skipWaiting, 1, "SKIP_WAITING skips waiting once");
  await B.activate();
  const names = [...caches._store.keys()].sort();
  assert(!names.includes("kos-static-" + A_VER), "A's static cache removed");
  ["kos-csharp-csw-1.1", SQLITE, PDF, "kos-share-inbox", "someone-elses-cache", "kos-static-" + B_VER].forEach((n) => assert(names.includes(n), "kept: " + n));
  const nb = await B.fetch(B.nav("/"));
  assert(/deploy B/.test(await nb.response.text()), "B's navigations serve B");
});

/* ---------------- pwa.js in the app ---------------- */
let app, W;
function mockContainer(opts) {
  const posted = [], listeners = {};
  function worker(state) {
    const wl = {};
    return { state, posted, postMessage: (m) => posted.push(m), addEventListener: (t, fn) => { (wl[t] = wl[t] || []).push(fn); },
      _to(s) { this.state = s; (wl.statechange || []).forEach((fn) => fn()); } };
  }
  const regL = {};
  const reg = { waiting: opts.waiting ? worker("installed") : null, installing: null, sync: { register: () => Promise.resolve() },
    addEventListener: (t, fn) => { (regL[t] = regL[t] || []).push(fn); },
    _update() { const w = worker("installing"); this.installing = w; (regL.updatefound || []).forEach((fn) => fn()); return w; } };
  const container = { controller: opts.controller ? {} : null, register: () => Promise.resolve(reg),
    addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); }, _emit: (t, e) => (listeners[t] || []).forEach((fn) => fn(e || {})) };
  Object.defineProperty(W.navigator, "serviceWorker", { value: container, configurable: true });
  return { posted, reg, container, worker };
}
function startPwa() { W.eval(fs.readFileSync(path.join(ROOT, "js/core/pwa.js"), "utf8")); }
const dialog = () => W.document.querySelector('[data-ui~="ui.confirm"]');
const btn = (ui) => W.document.querySelector('[data-ui~="' + ui + '"]');

step("E · pwa.js posts SKIP_WAITING only after the user confirms", async () => {
  const { boot } = require("./lib/app-harness");
  app = await boot({ clock: "2026-10-20T12:00:00" });
  W = app.window;
  /* a first install: nothing controls the page yet */
  let m = mockContainer({ controller: false });
  startPwa(); await app.settle();
  let w = m.reg._update(); w._to("installed"); await app.settle();
  assert(!dialog(), "the first install prompts nothing");
  eq(m.posted, [], "and posts nothing");
  /* an update: Cancel */
  m = mockContainer({ controller: true });
  startPwa(); await app.settle();
  w = m.reg._update();
  w._to("installing"); await app.settle();
  assert(!dialog(), "no prompt before the new worker has installed");
  w._to("installed"); await app.settle();
  assert(dialog(), "an update prompts");
  assert(/Update ready/.test(dialog().textContent) && /Reload now/.test(btn("ui.confirm-yes").textContent), "it says so: Update ready · Reload now");
  eq(m.posted, [], "nothing posted while the prompt waits");
  btn("ui.confirm-no").click(); await app.settle();
  assert(!dialog(), "Cancel closes it");
  eq(m.posted, [], "Cancel posts nothing");
  /* an update: Reload now */
  w = m.reg._update(); w._to("installed"); await app.settle();
  assert(dialog(), "the next update prompts again");
  btn("ui.confirm-yes").click(); await app.settle();
  eq(m.posted, [{ type: "SKIP_WAITING" }], "Reload now posts SKIP_WAITING exactly once");
  /* a worker already waiting when the page loads */
  m = mockContainer({ controller: true, waiting: true });
  startPwa(); await app.settle(); await app.settle();
  assert(dialog(), "a waiting worker is offered at load");
  eq(m.posted, [], "and posts nothing before the answer");
  btn("ui.confirm-yes").click(); await app.settle();
  eq(m.posted, [{ type: "SKIP_WAITING" }], "posted to the waiting worker on confirm");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke121: " + failed + " failed" : "smoke121: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
