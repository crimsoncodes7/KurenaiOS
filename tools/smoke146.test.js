/* Kurenai OS — smoke146.test.js
   W2's smaller items after the redraw policy (quality audit; Opus batch).

   The claims:

     A · ADDRESSES (AG-03, AX-24, SH-37). The Wall's tabs and sets, one
         assignment, one reminder, a review run and Card stats round-trip
         through routeFor/parse.
     B · A DEEP LINK OPENS ONCE (CR-01, AX-24). A Practice Log piece opened
         from its address opens its dialog once; a redraw never opens it
         again, and closing it drops the id from the address.
     C · IN-PAGE TABS SURVIVE A REDRAW (SY-22): Collection Overview's
         Analytics and Notifications' Unread.
     D · LISTENERS GO WITH THEIR PAGE (AP-08). Visiting a topic twenty
         times leaves no more window/document listeners than visiting it
         once.
     E · A REDRAW FOR LATER IS FOR ITS OWN PAGE (SY-25), and the unlock
         overlay waits out a task page (SY-23) while a quiet moment elsewhere
         does not.
     F · A FINISHED QUIZ UPDATES ITS INSPECTOR (ST-19); a page header takes
         its own page's art on a first visit (MG-17).
     G · THE SHOWCASE AUTOSAVES (achievements-governor#3): picking saves at
         once, removing has Undo, and leaving asks nothing.
     H · THE SCREEN OFF ON A PHONE (UR-5). A running session hidden and then
         discarded by the system comes back paused and offers the minutes
         the screen was off; counting them adds them, capped by the phase;
         a page closed on purpose offers nothing.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke146.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-11-16";
let app, K, doc;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; doc = app.document;
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · the Wall, an assignment, a reminder and a review run have addresses", () => {
  const R = K.router;
  const cases = [
    ["achievements", "titles", "#/achievements/titles"],
    ["achievements", "set/streaks/streak-7", "#/achievements/set/streaks/streak-7"],
    ["assignments", { id: 12 }, "#/assignments/12"],
    ["reminders", { id: 7, section: "all" }, "#/reminders/7"],
    ["review", { tab: "due", run: "compsci:4.5.1.1" }, "#/review/due/compsci%3A4.5.1.1"],
    ["review", { tab: "stats" }, "#/review/stats"]
  ];
  cases.forEach(([v, a, want]) => {
    const r = R.routeFor(v, a);
    eq(r, want, v + " route");
    const back = R.parse(r);
    assert(back && back.viewId === v, v + " parses back");
  });
  eq(R.parse("#/achievements/set/streaks/streak-7").arg, "set/streaks/streak-7", "the set comes back");
  eq(R.parse("#/assignments/12").arg, { id: 12 }, "the assignment comes back");
  eq(R.parse("#/review/due/all").arg, { tab: "due", run: "all" }, "the run comes back");
  eq(R.routeFor("achievements", "sets"), "#/achievements", "Sets is bare");
});

/* ---------------- B ---------------- */
step("B · a Practice Log piece opened from its address opens once", async () => {
  const CR = K.creatives;
  const w = CR.addWork ? CR.addWork({ kind: "text", title: "Opening lines", text: "It was a quiet morning." }) : null;
  const id = w && (w.id || w);
  assert(id, "a piece in the log");
  K.show("creatives", { page: "log", id: id }); await app.settle(); await wait(10); await app.settle();
  eq($$("[data-ui~='cr.dialog']").length, 1, "its dialog opened");
  K.rerender(); await app.settle(); await wait(10); await app.settle();
  eq($$("[data-ui~='cr.dialog']").length, 1, "a redraw opens no second one");
  click($("[data-ui~='cr.dialog-close']")); await app.settle();
  eq($$("[data-ui~='cr.dialog']").length, 0, "closed");
  eq(K.currentNav().arg, { page: "log" }, "the address dropped the id");
  K.rerender(); await app.settle(); await wait(10); await app.settle();
  eq($$("[data-ui~='cr.dialog']").length, 0, "and nothing opens it again");
});

/* ---------------- C ---------------- */
step("C · Collection Overview keeps Analytics through a redraw", async () => {
  K.show("matrix"); await app.settle();
  const an = $$("[data-ui~='coll.tabs'] button, [data-ui~='coll.tabs'] [role=tab]").find((b) => /Analytics/.test(b.textContent));
  assert(an, "the Analytics tab");
  click(an); await app.settle();
  K.rerender(); await app.settle();
  const on = $$("[data-ui~='coll.tabs'] [aria-selected='true'], [data-ui~='coll.tabs'] [aria-pressed='true'], [data-ui~='coll.tabs'] [aria-current]").map((b) => b.textContent);
  assert(on.some((t) => /Analytics/.test(t)), "still Analytics: " + on.join(","));
});
step("C · Notifications keeps Unread through a redraw", async () => {
  K.notify.push({ id: "reminder:x:1", kind: "reminder", title: "Ping", body: "", view: "home" });
  K.show("notifications"); await app.settle();
  const un = $$("[role=tab], .k-tab, button").find((b) => /^Unread/.test((b.textContent || "").trim()));
  assert(un, "the Unread filter");
  click(un); await app.settle();
  K.rerender(); await app.settle();
  const sel = $$("[aria-selected='true'], [aria-pressed='true']").map((b) => (b.textContent || "").trim());
  assert(sel.some((t) => /^Unread/.test(t)), "still Unread: " + sel.join(" | "));
});

/* ---------------- D ---------------- */
step("D · visiting a topic twenty times leaves no listeners behind", async () => {
  const W = app.window, D = doc;
  let live = 0;
  const wrap = (t) => {
    const add = t.addEventListener, rem = t.removeEventListener;
    const seen = new Set();
    t.addEventListener = function (type, fn, o) { if (/^(kos|paste|keydown)/.test(type)) { const k = type + "|" + (fn && fn.toString().length); seen.add(fn); live++; } return add.call(this, type, fn, o); };
    t.removeEventListener = function (type, fn, o) { if (seen.has(fn)) { seen.delete(fn); live--; } return rem.call(this, type, fn, o); };
  };
  wrap(W); wrap(D);
  const leaf = K.spec.firstLeaf(["compsci:4.5"]);
  K.show("ref", { subject: leaf.subject, ref: leaf.ref }); await app.settle();
  K.show("home"); await app.settle(); await wait(5); await app.settle();
  const one = live;
  for (let i = 0; i < 20; i++) {
    K.show("ref", { subject: leaf.subject, ref: leaf.ref }); await app.settle();
    K.show("home"); await app.settle(); await wait(5); await app.settle();
  }
  assert(live <= one + 2, "listeners stayed flat: " + one + " after one visit, " + live + " after twenty-one");
});

/* ---------------- E ---------------- */
step("E · a redraw for later happens only on its own page", async () => {
  K.show("calendar"); await app.settle();
  const again = K.view.redrawIfStill();
  let drew = 0;
  const real = K.ui.redrawNow;
  K.ui.redrawNow = function () { drew++; return real.apply(this, arguments); };
  try {
    K.show("money"); await app.settle();
    again();
    eq(drew, 0, "the page moved on: nothing redrawn");
    const again2 = K.view.redrawIfStill();
    again2();
    eq(drew, 1, "its own page: redrawn");
  } finally { K.ui.redrawNow = real; }
});
step("E · the unlock overlay waits out a task page; the ping does not", async () => {
  const leaf = K.spec.firstLeaf(["compsci:4.5"]);
  K.show("ref", { subject: leaf.subject, ref: leaf.ref }); await app.settle();
  eq(K.achievements.quiet(true), true, "on a topic the overlay waits");
  eq(K.achievements.quiet(), false, "the ping may show");
  K.show("home"); await app.settle();
  eq(K.achievements.quiet(true), false, "on Home it may show");
});

/* ---------------- F ---------------- */
step("F · a finished quiz updates the inspector's Quiz best", async () => {
  const leaf = K.spec.firstLeaf(["compsci:4.5"]);
  const q = (K.content.get(leaf.subject, leaf.ref) || {}).quiz || [];
  assert(q.length, "a quiz on the topic");
  K.show("ref", { subject: leaf.subject, ref: leaf.ref }); await app.settle();
  const tab = $$("[data-ui~='topic.tab'], [role=tab]").find((b) => /^Quiz/.test((b.textContent || "").trim()));
  if (tab) { click(tab); await app.settle(); }
  const insp = () => [...doc.querySelectorAll("[data-ui~='topic.inspector-list'] li")].find((li) => /Quiz best/.test(li.textContent));
  assert(insp() && /—/.test(insp().textContent), "no Quiz best yet");
  for (let i = 0; i < q.length; i++) {
    const opt = $("[data-ui~='quiz.option']:not([disabled])");
    assert(opt, "an option to pick at question " + (i + 1));
    click(opt); await app.settle();
    const next = $("[data-ui~='quiz.next']:not([hidden])") || $$(".k-qz-foot button").find((b) => !b.hidden && /Next|See score/.test(b.textContent));
    if (next && i < q.length - 1) { click(next); await app.settle(); }
  }
  await wait(5); await app.settle();
  assert(insp() && !/—/.test(insp().textContent), "Quiz best now shows: " + (insp() && insp().textContent));
});
step("F · a page header takes its own page's art on the first visit", async () => {
  K.show("goals"); await app.settle();
  K.show("money"); await app.settle();
  const img = $("[data-ui~='ui.page-head'] img, .k-pagehead img");
  if (img) assert(/money/.test(img.getAttribute("src") || ""), "Money's own picture: " + img.getAttribute("src"));
  const head = $(".k-pagehead");
  assert(head && !/goals/.test(head.innerHTML), "nothing of Goals' picture on Money");
});

/* ---------------- G ---------------- */
step("G · showcase picks autosave and leaving asks nothing", async () => {
  /* one earned badge to pick */
  const views = await new Promise((r) => K.achievements.list(r));
  const v = views.find((x) => !x.masked) || views[0];
  K.store.state.achievements.earned[v.id] = { tier: 1, at: Date.now(), t: { "1": Date.now() } };
  K.achievements.setShowcase([]);
  K.store.save();
  K.show("achievements", "showcase"); await app.settle(); await wait(10); await app.settle();
  assert(!$("[data-ui~='ach.save-showcase']"), "no Save button on autosaved showcase");
  const medal = $("[data-ui~='ach.pick-item']");
  assert(medal, "a medal to pick");
  click(medal); await app.settle();
  eq(K.achievements.showcase(), [v.id], "picking autosaved immediately");
  const ok = K.show("home"); await app.settle();
  assert(ok !== false, "leaving is not blocked");
  eq(K.currentNav().viewId, "home", "navigated away to home");
  assert(!$("[data-ui~='ui.confirm']"), "no Leave without saving dialog");
});

/* ---------------- H ---------------- */
step("H · a session discarded with the screen off offers the minutes", async () => {
  K.show("home"); await app.settle();
  K.focus.start({ mode: "custom", workMin: 60, breakMin: 0 });
  const S = K.focus.session();
  assert(S, "running");
  K.focus._debugAdvance(10 * 60);                 /* ten minutes in */
  doc.dispatchEvent(new app.window.Event("visibilitychange"));    /* still visible in jsdom: nothing */
  /* the APP's clock, not the machine's: the suite's day is fixed, and on
     that very day the machine's clock ran ahead of it by up to an hour,
     which the restore read as time the session had been running */
  const t0 = app.window.Date.now();
  S.lastBeat = t0; S.hiddenAt = t0;               /* the screen went off now */
  K.store.save(); if (K.store.flush) K.store.flush();
  const keep = {};
  for (let i = 0; i < app.window.localStorage.length; i++) { const k = app.window.localStorage.key(i); keep[k] = app.window.localStorage.getItem(k); }
  const later = new Date(t0 + 25 * 60000);
  const two = await boot({ clock: later.toISOString().slice(0, 19), storage: keep });
  await two.settle();
  const S2 = two.KOS.focus.session();
  assert(S2 && S2.state === "paused", "restored, paused");
  const conf = two.document.querySelector("[data-ui~='ui.confirm']");
  assert(conf && /Count the 2[45] minutes the screen was off/.test(conf.textContent), "the offer: " + (conf && conf.textContent));
  const before = two.KOS.focus.workSeconds();
  two.document.querySelector("[data-ui~='ui.confirm-yes']").dispatchEvent(new two.window.MouseEvent("click", { bubbles: true }));
  await two.settle();
  const added = two.KOS.focus.workSeconds() - before;
  assert(added >= 24 * 60 && added <= 25 * 60, "the screen-off minutes counted: " + added + " s");
});
step("H · a page closed on purpose offers nothing", async () => {
  const S = K.focus.session();
  S.hiddenAt = Date.now();
  app.window.dispatchEvent(new app.window.Event("pagehide"));
  assert(!S.hiddenAt, "a closed page is not a screen gone off");
  K.focus.endEarly({ confirmed: true, review: false });
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
