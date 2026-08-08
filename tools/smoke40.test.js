/* Kurenai OS — smoke40.test.js
   Category 7 Phase A: the critical bugs found by the full UI/UX audit.

   Covered here (the cloud-sync half of Phase A — background pulls hijacking
   navigation, and cosmetics after a pull — lives in smoke17, which owns the
   sync engine's mocked Supabase boundary):

   1.  B-04 — opening a topic no longer scrolls past the page header. The
       note pager's scrollIntoView runs ONLY for a reader-initiated page
       change, never on first mount.
   2.  B-05 — the vault lazy loader no longer stalls. IntersectionObserver
       fires on a TRANSITION, so a sentinel that stays inside the root
       margin (what happens when you flick to the bottom and hold) used to
       stop the list dead at one batch. The area now keeps appending while
       the sentinel is still in range, observes the REAL scroll container
       (#main, not the viewport), and still drops superseded generations.
   3.  B-06 — the Mangaka view no longer builds the whole library at once:
       it rides the shared lazy area, one author per row, with a name
       search and an A–Z jump rail.
   4.  #app uses dvh with a vh fallback, and the phone tier reserves room
       for the bottom tab bar.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke40.test.js                                            */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
  json: () => Promise.resolve({}), text: () => Promise.resolve("") });

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

/* jsdom has no IntersectionObserver. The lazy area has a render-in-chunks
   fallback for exactly that, which would paint everything and hide the bug
   we are testing — so install a controllable fake that reports whatever
   intersection state a test asks for. */
const observers = [];
window.IntersectionObserver = function (cb, opts) {
  const self = { cb: cb, opts: opts || {}, targets: [], disconnected: false };
  self.observe = t => self.targets.push(t);
  self.unobserve = noop;
  self.disconnect = () => { self.disconnected = true; };
  self.fire = () => self.cb(self.targets.map(t => ({ target: t, isIntersecting: true })), self);
  observers.push(self);
  return self;
};

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
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 4000);
  while (Date.now() < deadline) { if (cond()) return true; await tick(25); }
  return cond();
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const css = fs.readFileSync(path.join(ROOT, "css", "main.css"), "utf8");
const main = () => document.getElementById("main");

/* ============ 1 · B-04: opening a topic starts at the top ============ */
console.log("== B-04: the note pager scrolls only when the reader turns a page ==");

/* find a subject/ref whose deep content splits into more than one note page —
   the paginated branch is the one that scrolled */
function findPagedRef() {
  for (const key of Object.keys(window.KOS_CONTENT || {})) {
    const c = window.KOS_CONTENT[key];
    if (!c || !c.notes) continue;
    if (KOS.content.splitPages(c.notes).length > 1) {
      const i = key.indexOf(":");
      return { subject: key.slice(0, i), ref: key.slice(i + 1) };
    }
  }
  return null;
}

step("a paginated topic exists to test against", async () => {
  const target = findPagedRef();
  assert(target, "no multi-page topic in the deep content — this suite cannot see the pager");
  window.__pagedRef = target;
});

step("first mount does NOT scroll the article into view", async () => {
  const target = window.__pagedRef;
  const calls = [];
  const realSIV = window.Element.prototype.scrollIntoView;
  window.Element.prototype.scrollIntoView = function (opts) { calls.push(this.className); };
  try {
    KOS.store.state.ui.tab = "notes";
    KOS.show("ref", target);
    await waitFor(() => main().querySelector(".note-pager"), 4000);
    assert(main().querySelector(".notes-article"), "the paginated notes did not render");
    assert(calls.indexOf("notes-article") === -1,
      "the article scrolled itself into view on first mount (calls: " + JSON.stringify(calls) + ")");
    assert(main().scrollTop === 0, "#main.scrollTop is " + main().scrollTop + " right after opening the topic");
  } finally { window.Element.prototype.scrollIntoView = realSIV; }
});

step("clicking a note-page pill DOES scroll to the section", async () => {
  const tabs = main().querySelectorAll(".note-page-tab");
  assert(tabs.length > 1, "expected more than one note page tab, got " + tabs.length);
  const calls = [];
  const realSIV = window.Element.prototype.scrollIntoView;
  window.Element.prototype.scrollIntoView = function () { calls.push(this.className); };
  try {
    tabs[1].click();
    assert(calls.indexOf("notes-article") !== -1,
      "turning to a note page did not scroll to it (calls: " + JSON.stringify(calls) + ")");
    assert(main().querySelectorAll(".note-page-tab")[1].classList.contains("active"),
      "the pill did not become active — the page did not actually turn");
  } finally { window.Element.prototype.scrollIntoView = realSIV; }
});

/* ============ 2 · B-05: the lazy loader keeps going ============ */
console.log("== B-05: the vault lazy loader does not stall ==");

/* Drive resultsArea directly: the stall is a property of the area, not of any
   one vault view, and every vault builds on this one toolkit. */
function makeArea(host, rectFor) {
  /* give the fake layout engine something to measure: the sentinel sits just
     below the last rendered row, and #main is a 800px-tall box — i.e. exactly
     the "flicked to the bottom, sentinel parked inside the margin" case. */
  const area = KOS.medview.resultsArea(host, (row, i) => {
    const d = document.createElement("div");
    d.className = "med-card";
    d.textContent = String(row);
    return d;
  });
  area.sentinel.getBoundingClientRect = () => rectFor(area);
  return area;
}

step("a sentinel that never leaves the root margin still renders the whole list", async () => {
  const host = document.createElement("div");
  main().innerHTML = "";
  main().appendChild(host);
  main().getBoundingClientRect = () => ({ top: 0, bottom: 800, height: 800, left: 0, right: 400, width: 400 });
  /* the sentinel is ALWAYS in range — one intersection callback, no further
     transitions. Before the fix this rendered exactly one batch. */
  const area = makeArea(host, () => ({ top: 10, bottom: 20, height: 10, left: 0, right: 400, width: 400 }));
  const rows = Array.from({ length: 692 }, (_, i) => "row-" + i);
  area.start(rows);
  const io = observers[observers.length - 1];
  assert(io, "no IntersectionObserver was created");
  io.fire();
  assert(area.holder.children.length === rows.length,
    "the list stalled at " + area.holder.children.length + " of " + rows.length);
});

step("the observer watches #main, not the viewport", async () => {
  const io = observers[observers.length - 1];
  assert(io.opts.root === main(),
    "the lazy observer's root is " + (io.opts.root === null ? "the viewport" : String(io.opts.root)) + ", not #main");
  assert(/600/.test(String(io.opts.rootMargin)), "unexpected rootMargin: " + io.opts.rootMargin);
});

step("a sentinel clear of the margin renders exactly one batch", async () => {
  const host = document.createElement("div");
  main().innerHTML = "";
  main().appendChild(host);
  main().getBoundingClientRect = () => ({ top: 0, bottom: 800, height: 800, left: 0, right: 400, width: 400 });
  /* far below the container + its 600px margin: one batch, then wait for the
     next real scroll — the lazy contract is intact, not defeated */
  const area = makeArea(host, () => ({ top: 5000, bottom: 5010, height: 10, left: 0, right: 400, width: 400 }));
  area.start(Array.from({ length: 300 }, (_, i) => "row-" + i));
  assert(area.holder.children.length === 60, "start() should paint the first batch");
  observers[observers.length - 1].fire();
  assert(area.holder.children.length === 120,
    "expected exactly one further batch per intersection, got " + area.holder.children.length);
});

step("the generation guard still drops a superseded batch", async () => {
  const host = document.createElement("div");
  main().innerHTML = "";
  main().appendChild(host);
  main().getBoundingClientRect = () => ({ top: 0, bottom: 800, height: 800, left: 0, right: 400, width: 400 });
  const area = makeArea(host, () => ({ top: 5000, bottom: 5010, height: 10, left: 0, right: 400, width: 400 }));
  area.start(Array.from({ length: 300 }, (_, i) => "old-" + i));
  const stale = observers[observers.length - 1];
  area.clear();                       // the caller moved to another lens
  stale.fire();                       // the old observer fires late
  assert(area.holder.children.length === 0,
    "a superseded generation painted " + area.holder.children.length + " rows");
});

/* ============ 3 · B-06: Mangaka stops rendering the whole library ============ */
console.log("== B-06: Mangaka is lazy, searchable and jumpable ==");

step("seed a large Books library", async () => {
  const existing = await p(cb => KOS.mediadb.query({ module: "books" }, cb));
  for (const e of existing) await p(cb => KOS.mediadb.remove(e.id, cb, { skipTombstone: true }));
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let i = 0; i < 900; i++) {
    await p(cb => KOS.mediadb.add({ module: "books", title: "Series " + i,
      author: A[i % 26] + "uthor " + i, status: "inProgress" }, cb));
  }
  const rows = await p(cb => KOS.mediadb.query({ module: "books" }, cb));
  assert(rows.length === 900, "seed failed: " + rows.length);
});

step("the view mounts one lazy batch of authors, not 900", async () => {
  main().getBoundingClientRect = () => ({ top: 0, bottom: 800, height: 800, left: 0, right: 400, width: 400 });
  KOS.show("mangaka");
  await waitFor(() => main().querySelectorAll(".mk-card").length > 0, 6000);
  const cards = main().querySelectorAll(".mk-card").length;
  assert(cards <= 60, "Mangaka mounted " + cards + " author cards at once (the lazy batch is 60)");
  assert(main().querySelector(".med-sentinel"), "no lazy sentinel — the view is not on the shared area");
  const count = main().querySelector(".med-count");
  assert(count && /900 authors/.test(count.textContent), "unexpected count line: " + (count && count.textContent));
});

step("the author search box filters the directory", async () => {
  const search = main().querySelector(".mk-toolbar .med-search");
  assert(search, "no author search box");
  search.value = "uthor 12";
  search.dispatchEvent(new window.Event("input"));
  await waitFor(() => /\(filtered\)/.test(main().querySelector(".med-count").textContent), 3000);
  const names = [...main().querySelectorAll(".mk-name")].map(n => n.textContent);
  assert(names.length, "the search matched nothing");
  assert(names.every(n => n.toLowerCase().indexOf("uthor 12") !== -1),
    "the search let a non-matching author through: " + JSON.stringify(names.slice(0, 5)));
  search.value = "";
  search.dispatchEvent(new window.Event("input"));
  await waitFor(() => !/\(filtered\)/.test(main().querySelector(".med-count").textContent), 3000);
});

/* The rail FILTERS rather than scrolls: scrolling to Z would mean mounting
   every author above it, i.e. the whole wall this view was rewritten to
   avoid. Reachability is the requirement; a bounded DOM is the constraint. */
step("the A–Z rail reaches a late letter without mounting the whole wall", async () => {
  const keys = main().querySelectorAll(".mk-jump-key");
  assert(keys.length === 27, "expected A–Z plus #, got " + keys.length);
  const live = [...keys].filter(k => !k.disabled);
  assert(live.length >= 20, "only " + live.length + " letters are reachable");
  const z = [...keys].find(k => k.textContent === "Z");
  assert(z && !z.disabled, "Z should have authors in this library");
  z.click();
  await waitFor(() => /· Z/.test(main().querySelector(".med-count").textContent), 3000);
  const names = [...main().querySelectorAll(".mk-name")].map(n => n.textContent);
  assert(names.length, "the Z filter matched nothing");
  assert(names.every(n => n.charAt(0) === "Z"), "a non-Z author survived the letter filter");
  assert(main().querySelectorAll(".mk-card").length <= 60,
    "the letter jump mounted " + main().querySelectorAll(".mk-card").length + " cards");
  /* tapping the active letter again clears it */
  main().querySelectorAll(".mk-jump-key")[25].click();
  await waitFor(() => !/· Z/.test(main().querySelector(".med-count").textContent), 3000);
  assert(main().querySelectorAll(".mk-card").length <= 60, "clearing the letter mounted the whole wall");
});

/* ============ 4 · viewport + the bottom tab bar ============ */
console.log("== viewport units and phone-tier tab-bar clearance ==");

step("#app uses dvh with a vh fallback", async () => {
  const block = css.match(/#app\s*\{[^}]*\}/);
  assert(block, "no #app rule found");
  assert(/height:\s*100vh/.test(block[0]), "#app lost its 100vh fallback: " + block[0]);
  assert(/height:\s*100dvh/.test(block[0]), "#app does not use 100dvh: " + block[0]);
  assert(block[0].indexOf("100vh") < block[0].indexOf("100dvh"),
    "the dvh declaration must come AFTER the vh fallback to win where supported");
});

step("the phone tier reserves room below #main for the bottom tab bar", async () => {
  const phone = css.match(/@media \(max-width:\s*700px\)\s*\{[\s\S]*$/);
  assert(phone, "no phone tier found");
  assert(/#main\s*\{[^}]*padding-block-end/.test(phone[0]) ||
         /padding-block-end[^;]*rail-h/.test(phone[0]),
    "#main has no bottom padding in the phone tier — the tab bar overlaps content");
  assert(/env\(safe-area-inset-bottom/.test(phone[0]), "the reserved space ignores the safe-area inset");
});

/* ============ run ============ */
(async () => {
  let pass = 0;
  const fails = [];
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (e) { fails.push(`STEP "${name}": ${e.message}`); console.log("  FAIL " + name + " — " + e.message); }
  }
  if (errors.length) fails.push(...errors);
  console.log("");
  if (fails.length) {
    console.log("SMOKE40 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE40 PASS — Category 7 Phase A verified (" + pass + " steps).");
  process.exit(0);
})();
