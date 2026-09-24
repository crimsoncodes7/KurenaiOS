/* tools/lib/app-harness.js — a deterministic jsdom boot of the whole app
   (UI rebuild M2).

   The older suites each inline their own boot. A suite that compares a
   run against a RECORDED baseline cannot: two runs a day apart, or on two
   machines, must see the same app. So this boot pins everything the app
   reads from its environment:

     clock      Date is a fixed instant (default 2026-09-24 10:00
                Europe/London) that advances only with the virtual timers
                below, so "today", the plan week, every countdown and every
                updatedAt tie-break are the same on every run;
     random     Math.random is a seeded PRNG, so minted ids are stable;
     timers     virtual. setInterval never fires, and neither does a
                setTimeout of a second or more: the boot's notification and
                reminder tickers would otherwise write the store at a moment
                that depends on how fast the machine is. Shorter timeouts
                and animation frames queue, and app.settle() runs them in
                due order between IndexedDB turns, so a click's deferred
                work always lands inside the settle that follows it;
     storage    fake-indexeddb, reset per boot;
     network    fetch resolves an empty 200 and is recorded.

     const app = await boot();       // { window, document, KOS, errors, fetches, settle }
     await app.settle();             // run queued timers and IndexedDB work out
     await seedAccount(app);         // tools/lib/seed.js
                                                                           */
"use strict";
process.env.TZ = "Europe/London";

const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const ROOT = path.join(__dirname, "..", "..");
const CLOCK = "2026-09-24T10:00:00";

function prng(seed) {
  let n = seed >>> 0;
  return () => (n = (n * 1664525 + 1013904223) >>> 0) / 4294967296;
}

async function boot(opts = {}) {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const errors = [];
  const consoleErrors = [];
  const vc = new VirtualConsole();
  vc.on("error", (...a) => consoleErrors.push(a.map(String).join(" ")));
  vc.on("jsdomError", (e) => {
    /* jsdom cannot navigate; a download link's click is not an app error */
    if (/Not implemented: navigation/.test(e.message)) return;
    consoleErrors.push("jsdom: " + e.message);
  });
  const dom = new JSDOM(html, {
    url: "http://localhost/index.html",
    runScripts: "outside-only",
    pretendToBeVisual: true,
    virtualConsole: vc
  });
  const { window } = dom;
  window.addEventListener("error", (e) => errors.push("window error: " + e.message));

  /* ---- the environment the app reads ---- */
  const RealDate = window.Date;
  const base = RealDate.parse(opts.clock || CLOCK);
  let vnow = 0;
  const now = () => base + vnow;
  class FixedDate extends RealDate {
    constructor(...a) { if (a.length) super(...a); else super(now()); }
    static now() { return now(); }
  }
  window.Date = FixedDate;
  window.Math.random = prng(opts.seed || 20260924);

  const timers = [];
  let timerSeq = 0;
  window.setInterval = () => 0;
  window.clearInterval = () => {};
  window.setTimeout = (fn, ms, ...a) => {
    if (+ms >= 1000) return 0;
    const id = ++timerSeq;
    timers.push({ id, fn, a, at: vnow + (+ms || 0) });
    return id;
  };
  window.clearTimeout = (id) => {
    const i = timers.findIndex((t) => t.id === id);
    if (i !== -1) timers.splice(i, 1);
  };
  const io = () => new Promise((r) => setImmediate(r));
  async function settle() {
    for (let guard = 0; guard < 400; guard++) {
      for (let k = 0; k < 4; k++) await io();
      if (!timers.length) return;
      timers.sort((x, y) => x.at - y.at || x.id - y.id);
      const t = timers.shift();
      vnow = Math.max(vnow, t.at);
      try { typeof t.fn === "function" ? t.fn(...t.a) : window.eval(String(t.fn)); }
      catch (e) { errors.push("timer error: " + e.message); }
    }
  }

  const noop = () => {};
  const ctx = new Proxy({}, {
    get: (t, k) => (k === "measureText" ? () => ({ width: 10 }) : typeof k === "string" ? noop : undefined),
    set: () => true
  });
  window.HTMLCanvasElement.prototype.getContext = () => ctx;
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,";
  window.requestAnimationFrame = (cb) => window.setTimeout(() => cb(vnow), 16);
  window.cancelAnimationFrame = noop;
  window.scrollTo = noop;
  window.Element.prototype.scrollIntoView = noop;
  window.Element.prototype.scrollTo = noop;
  window.Element.prototype.scrollBy = noop;
  window.open = () => null;
  window.confirm = () => false;
  window.alert = noop;
  window.prompt = () => null;
  window.IntersectionObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
  window.ResizeObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop });
  window.URL.createObjectURL = () => "blob:kos-test";
  window.URL.revokeObjectURL = noop;
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = noop;
  Object.defineProperty(window.navigator, "clipboard", { value: { writeText: () => Promise.resolve() }, configurable: true });

  const fetches = [];
  window.fetch = (url, init) => {
    fetches.push(((init && init.method) || "GET") + " " + String(url).replace(/\?.*$/, ""));
    return Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
      json: () => Promise.resolve({}), text: () => Promise.resolve(""), blob: () => Promise.resolve(new window.Blob([])) });
  };

  const fake = require("fake-indexeddb");
  window.indexedDB = new fake.IDBFactory();
  window.IDBKeyRange = fake.IDBKeyRange;

  /* ---- the app, in document order ---- */
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  for (const src of scripts) {
    try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
    catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
  }
  const KOS = window.KOS;
  if (KOS.autosync) KOS.autosync.stop();
  if (KOS.cloudsync) KOS.cloudsync.stop();
  await settle();
  return { window, document: window.document, KOS, errors, consoleErrors, fetches, settle };
}

module.exports = { boot, ROOT, CLOCK };
