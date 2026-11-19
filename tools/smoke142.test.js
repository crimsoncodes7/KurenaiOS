/* Kurenai OS — smoke142.test.js
   Loading on first use (quality W2, finding AP-01; js/core/lazy.js).

   Boot used to parse every script the app has (17 MB). The curriculum
   content, the past-paper evidence and Code's lessons now sit in
   <template data-lazy> blocks of index.html and load the first time a page
   needs them; js/data/lazy-index.js (generated) stands in until then.

   Every other suite boots EAGER (a test loader evaluates every tag it finds
   in index.html), so this is the one that boots as a browser does.

   The claims:

     A · THE BOOT PAYLOAD. The scripts outside the lazy blocks stay under a
         budget that only goes down; every lazy file exists, sits in one
         bundle and is still a tag the service worker's precache finds.
     B · THE INDEX IS CURRENT. js/data/lazy-index.js is what
         tools/gen_lazy_index.mjs writes today.
     C · A LAZY BOOT IS QUIET. An empty account boots with nothing loaded
         and nothing read before its bundle; boot is timed (kos-boot-start,
         kos-interactive, the measure kos-boot).
     D · THE SAME ACCOUNT, EAGER AND LAZY. A full test account (cards rated
         in every exam subject, Code evidence, forks, real exams with their
         goals) rebooted both ways, background passes included: the lazy one
         loads nothing, reads nothing early, saves the SAME state and draws
         the same Home.
     E · THE STAND-INS KNOW THE STRUCTURE. Before and after its content
         loads: every card's schedule key in order, every Code lesson's
         evidence, every task, the Daily 20, each exam's readiness.
     F · OPENING A LESSON LOADS ITS CONTENT AND DRAWS IT, behind a short
         "Loading…"; only that subject is fetched; the page is named and
         focused once it is drawn, as a first draw and not a redraw.
     G · LEFT WHILE LOADING: the page opened next is the one on screen.
     H · OFFLINE: the page says it could not be loaded, and opens when the
         connection is back.
     I · NO FORK FROM A STAND-IN. KOS.edits.set refuses, a fork is not
         called stale, and both work once the content is in.
     J · THE PAGES THAT NAME WHAT THEY NEED never read early, each from a
         cold boot: a subject, a lesson, Code, Exams and one exam, Exams &
         Papers, Due today and a review run, Card stats.
     K · SEARCH AND THE ASSISTANT take everything in first: a search finds
         a card's words, and a tool runs with every bundle loaded.
     L · WARMING UP. After boot the bundles arrive in idle moments, the
         subject last studied first, and the saved state is still the eager
         boot's.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke142.test.js                                           */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const { seed, dump } = require("./lib/lazy-fixture");

const ROOT = path.join(__dirname, "..");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + String(JSON.stringify(a)).slice(0, 400) + ", want " + String(JSON.stringify(b)).slice(0, 400)); }

/* The budget for what boot parses, in bytes. It only goes DOWN: lower it
   when a batch takes more out of boot (the audit's aim is about 4 MB, which
   needs the page modules loaded on first use as well, a later batch). */
/* 17 Nov 2026 (kos-integrity-17): 8.7 → 8.85 MB for the Money import pages
   (moneyimp.js), held updates and the first open's welcome, released
   together; the page modules move to first use in AP-01 stage 2 */
/* 18 Nov 2026 (W8, AP-01 stage 2): 8.85 → 7.9 MB. Nine page bundles
   (Money, the Governor's Seat, Code's desk, Mind's and Japanese's desks,
   Help, the Shrine, Reports' long view and story, Sync's pages) took 0.91
   MB out of boot (8.78 → 7.87 MB). The rest of the aim needs the modules
   other code reads at boot (Focus, the Assistant, the calendar, the
   vaults, the labs) split into the part boot needs and the page. */
/* 18 Nov 2026 (W7 goals, GO-03…GO-27, MG-30): 7.9 → 7.92 MB. The goals
   engine's judgement fixes (part periods, grid changes, breaches, the
   re-baseline, Money's evidence span) are read at boot by Home and the
   Morning Review, so they add about 14 KB to boot. */
/* 19 Nov 2026 (W1/W7 rest merged: search, Home · Reports, study spaces,
   batch F): 7.92 → 7.90 MB. Their fixes added about 40 KB at boot; the
   routine player (page-player) and the report share card (page-share)
   moved to first use, 52 KB, so boot reads 7.897 MB. */
/* 19 Nov 2026 (the spaces join the OS: JM-21, MI-10, HR-04, JM-26):
   7.90 → 7.89 MB. Their reads at boot added about 9 KB; Card stats
   (cardstats.js, page-cardstats) moved to first use, 23 KB. */
/* 19 Nov 2026 (1A): 7.89 → 7.87 MB. 1A's fixes added about 9 KB at boot
   (the toast queue, the review-log reads, the in-place replace, the
   server-error reading); the sample account (sample.js, its own bundle
   `sample`, fetched only in an unseeded Sample namespace) left boot, 25 KB,
   so boot reads 7.870 MB (8,251,901 bytes). */
const BOOT_BUDGET = 7.87 * 1024 * 1024;

/* jsdom has no User Timing: a small recorder, set before the app's scripts */
function timing(win) {
  const seen = [];
  win.performance.mark = (name) => { seen.push(["mark", name]); };
  win.performance.measure = (name, a, b) => { seen.push(["measure", name, a, b]); };
  win.__timing = seen;
}
function diff(a, b, p, out) {
  if (out.length > 20 || a === b) return;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") { out.push(p + ": " + String(JSON.stringify(a)).slice(0, 80) + " ≠ " + String(JSON.stringify(b === undefined ? "∅" : b)).slice(0, 80)); return; }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) diff(a[k], b[k], p + "." + k, out);
}
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
function bundles() {
  const out = {};
  for (const m of html.matchAll(/<template data-lazy="([^"]+)">([\s\S]*?)<\/template>/g)) {
    (out[m[1]] = out[m[1]] || []).push(...[...m[2].matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]));
  }
  return out;
}
const stateOf = (app, storage) => JSON.parse(dump(app.window)[Object.keys(storage).find((k) => /sample-v1$/.test(k))]);
const mainText = (app) => app.document.getElementById("main").textContent;
const waiting = (app) => app.document.querySelector("[data-ui='lazy.wait']");
const pendingOf = (app) => app.KOS.lazy.pending(app.KOS.lazy.names());
async function lazyBoot(fx, more) {
  const app = await boot(Object.assign({ storage: fx.storage, indexedDB: fx.indexedDB, lazy: true, lazyTrace: true }, more || {}));
  await app.settle();
  return app;
}

let fxA, fxB;

/* ---------------- A ---------------- */
step("A · boot parses under the budget, and every lazy file is one tag in one bundle", () => {
  const B = bundles(), held = new Map();
  Object.keys(B).forEach((name) => B[name].forEach((src) => {
    assert(!held.has(src), src + " is in two bundles");
    held.set(src, name);
  }));
  assert(Object.keys(B).length >= 7, "the lazy bundles are declared: " + Object.keys(B));
  const all = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]).filter((s) => !/^https?:/.test(s));
  const count = {};
  all.forEach((s) => { count[s] = (count[s] || 0) + 1; });
  let bootBytes = 0, lazyBytes = 0;
  all.forEach((src) => {
    if (src === "js/env.local.js") return;             /* local configuration, untracked */
    assert(fs.existsSync(path.join(ROOT, src)), "missing script " + src);
    const z = fs.statSync(path.join(ROOT, src)).size;
    if (held.has(src)) { lazyBytes += z; assert(count[src] === 1, src + " is also loaded at boot"); } else bootBytes += z;
  });
  held.forEach((name, src) => assert(all.indexOf(src) !== -1, "the precache would not find " + src));
  assert(bootBytes <= BOOT_BUDGET, "boot parses " + (bootBytes / 1048576).toFixed(2) + " MB, over the budget of " + (BOOT_BUDGET / 1048576).toFixed(2) + " MB");
  assert(lazyBytes > 8 * 1024 * 1024, "at least 8 MB is left for first use: " + (lazyBytes / 1048576).toFixed(2) + " MB");
  /* the loader is the first of the app's scripts, and the index follows the
     registries it fills and comes before every page module */
  const local = all.filter((s) => !/^js\/(vendor\/|env\.)/.test(s));
  eq(local[0], "js/core/lazy.js", "the loader runs first");
  assert(all.indexOf("js/data/lazy-index.js") > all.indexOf("js/data/code.js"), "the index follows js/data/code.js");
  assert(all.indexOf("js/data/lazy-index.js") < all.findIndex((s) => /^js\/modules\//.test(s)), "the index comes before the page modules");
  /* the service worker reads the same tags */
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  assert(sw.indexOf("/<script[^>]*\\ssrc=\"([^\"]+)\"/g") !== -1, "sw.js still derives its precache from every script tag");
});

/* ---------------- B ---------------- */
step("B · js/data/lazy-index.js is what the generator writes today", async () => {
  const { build } = await import("./gen_lazy_index.mjs");
  const want = await build();
  const have = fs.readFileSync(path.join(ROOT, "js/data/lazy-index.js"), "utf8");
  assert(have === want, "js/data/lazy-index.js is stale: run node tools/gen_lazy_index.mjs");
});

/* ---------------- C ---------------- */
step("C · an empty account boots lazily with nothing loaded, nothing read early, and boot timed", async () => {
  const app = await boot({ lazy: true, lazyTrace: true, longTimers: true, before: timing });
  await app.settle(); await app.settle();
  eq(app.errors, [], "boot errors");
  eq(app.KOS.lazy.mode, "lazy", "the mode");
  eq(app.lazy.loaded, [], "nothing fetched at boot");
  eq(app.lazy.misses.map((m) => m.split("\n")[0]), [], "nothing read before its bundle");
  eq(pendingOf(app).length, app.KOS.lazy.names().length, "every bundle still to load");
  const t = app.window.__timing.map((x) => x.join(" "));
  assert(t.indexOf("mark kos-boot-start") === 0, "kos-boot-start is the first mark: " + t);
  assert(t.indexOf("mark kos-interactive") > 0, "kos-interactive is marked: " + t);
  assert(t.indexOf("measure kos-boot kos-boot-start kos-interactive") > 0, "the measure kos-boot: " + t);
  /* an eager boot (every other suite) is unchanged: nothing is a stand-in */
  const eager = await boot({});
  eq(eager.KOS.lazy.mode, "eager", "a test loader is eager");
  eq(eager.KOS.lazy.pending(eager.KOS.lazy.names()), [], "eager: everything is in");
  assert(!eager.KOS.lazy.isStub(eager.window.KOS_CONTENT["compsci:4.5.1.1"]), "eager: real content");
});

/* ---------------- D ---------------- */
let E, L;
step("D · the same account eager and lazy: nothing loaded, nothing read early, the same saved state and Home", async () => {
  fxA = await seed(); fxB = await seed();
  assert(fxA.made.cards >= 20 && fxA.made.lessons === 4 && fxA.made.forks === 3 && fxA.made.exams === 2 && fxA.made.goals >= 6, "the account is full: " + JSON.stringify(fxA.made));
  eq(fxA.storage, fxB.storage, "two seeds are one account");
  E = await boot({ storage: fxA.storage, indexedDB: fxA.indexedDB, longTimers: true }); await E.settle(); await E.settle();
  L = await lazyBoot(fxB, { longTimers: true }); await L.settle(); await L.settle();
  eq(E.errors, [], "eager errors"); eq(L.errors.concat(L.consoleErrors), [], "lazy errors");
  eq(L.lazy.loaded, [], "the background passes fetched nothing");
  eq(L.lazy.misses.map((m) => m.split("\n").slice(0, 4).join(" < ")), [], "nothing read before its bundle");
  await E.KOS.store.flush(); await L.KOS.store.flush();
  const out = [];
  diff(stateOf(E, fxA.storage), stateOf(L, fxB.storage), "state", out);
  eq(out, [], "the saved state differs");
  assert(mainText(E).length > 1500, "Home drew");
  eq(mainText(L), mainText(E), "Home's words");
});

/* ---------------- E ---------------- */
step("E · the stand-ins know the structure: keys, evidence, tasks, the day's plan, readiness", async () => {
  const snap = async (app) => {
    const K = app.KOS;
    const badges = await new Promise((res) => K.achievements.list(res));
    return {
      cards: K.srs.allCards().map((c) => c.key),
      due: K.srs.dueCards().map((c) => c.key + "@" + c.overdue),
      leeches: K.srs.leeches().map((c) => c.key),
      lessons: K.code.lessons().map((l) => [l.ref, K.code.hasLesson(l.ref), K.code.studied(l.ref), K.code.evidence(l.ref)]),
      units: K.code.units().map((u) => [u.ref, K.code.released(u.ref), K.code.unitState(u.ref)]),
      tasks: K.code.allTasks().map((t) => [t.id, t.lesson, t.tier, (t.concepts || []).join("+")]),
      codeCards: K.code.allCards().map((c) => c.id),
      plan: (() => { const p = K.code.planDay(); return [p.task && p.task.id, p.lesson && p.lesson.ref, p.done, p.review]; })(),
      memory: ["compsci", "maths", "it"].map((sid) => Object.keys(app.window.KOS_CONTENT).filter((k) => k.indexOf(sid + ":") === 0).slice(0, 12)
        .map((k) => { const m = K.srs.topicMemory(sid, k.slice(sid.length + 1)); return [k, m && m.recall, m && m.rework, m && m.held]; })),
      ready: K.exams.all().map((a) => { const r = K.exams.readiness(a); return [a.id, r && r.band && (r.band.id || r.band.label || r.band), r && r.detail && r.detail.leaves, r && r.detail && r.detail.weights ? JSON.stringify(r.detail.weights).length : 0]; }),
      year2: [K.exams.normalise({ preset: "aqa-7516-2" }).scope.exclude.length, K.exams.normalise({ preset: "edexcel-8ma0-1" }).scope.exclude.length],
      deep: Object.keys(app.window.KOS_EXAMS.deep).map((pid) => [pid, Object.keys(app.window.KOS_EXAMS.deep[pid].leaves).length]),
      ach: badges.map((b) => [b.id, b.tier, Math.round((b.p || 0) * 1000), b.value])
    };
  };
  /* saved reports are written by a slow background tick, a week at a time:
     let both boots finish that before a badge that counts them is read */
  const weeks = (app) => new Promise((res) => app.KOS.reportStore.list("week", (e, l) => res(e ? -1 : (l || []).length)));
  const drain = async (app) => {
    for (let i = 0, same = 0, last = -2; i < 90 && same < 14; i++) {   /* a week takes about eight rounds */
      await app.settle();
      const n = await weeks(app);
      same = n === last ? same + 1 : 0; last = n;
    }
    return weeks(app);
  };
  const savedL = await drain(L), savedE = await drain(E);
  assert(savedE >= 3, "the eager boot saved its weeks: " + savedE);
  eq(savedL, savedE, "both boots saved the same weeks");
  const before = await snap(L);
  eq(L.lazy.loaded, [], "reading the structure fetched nothing");
  eq(L.lazy.misses.map((m) => m.split("\n").slice(0, 4).join(" < ")), [], "reading the structure read nothing early");
  assert(before.cards.length > 4000 && before.due.length >= 50 && before.leeches.length === 2, "cards: " + before.cards.length + " " + before.due.length + " " + before.leeches.length);
  assert(before.lessons.filter((l) => l[2]).length === 3, "three Code lessons covered: " + before.lessons.filter((l) => l[2]).map((l) => l[0]));
  assert(before.ready.filter((r) => r[3] > 1000).length >= 2, "readiness has each board paper's weights: " + before.ready.map((r) => r[0] + " " + r[3]));
  assert(before.year2[0] > 0 || before.year2[1] > 0, "a preset's A-level-only leaves are known: " + before.year2);
  assert(before.ach.length > 200, "every badge measured: " + before.ach.length);
  const same = (a, b, m) => { const out = []; diff(a, b, "", out); eq(out, [], m); };
  same(before, await snap(E), "lazy against eager");
  await L.KOS.lazy.all();
  eq(pendingOf(L), [], "everything loaded");
  same(await snap(L), before, "after the content loaded");
  /* and loading wrote nothing */
  await L.settle(); await L.KOS.store.flush(); await E.KOS.store.flush();
  const out = [];
  diff(stateOf(E, fxA.storage), stateOf(L, fxB.storage), "state", out);
  eq(out, [], "the saved state after loading");
});

/* ---------------- F ---------------- */
step("F · opening a lesson shows Loading…, fetches only its subject, then draws, names and focuses the page", async () => {
  const app = await lazyBoot(fxB);
  const K = app.KOS, B = bundles();
  const ref = Object.keys(E.window.KOS_CONTENT).filter((k) => k.indexOf("maths:") === 0 && E.window.KOS_CONTENT[k].notes)[0].slice(6);
  let redrawAtDraw = null;
  const inner = K.views.ref;
  K.views.ref = function (main, arg) { redrawAtDraw = K.ui.redrawing; return inner(main, arg); };
  K.show("ref", { subject: "maths", ref });
  const box = waiting(app);
  assert(box, "the page waits");
  eq([box.getAttribute("role"), box.getAttribute("aria-busy"), box.textContent], ["status", "true", "Loading…"], "the waiting line");
  eq(redrawAtDraw, null, "the lesson is not drawn before its content");
  assert(K.lazy.waiting(), "the loader says it is waiting");
  await app.settle(); await app.settle();
  assert(!waiting(app), "the wait is over");
  eq(redrawAtDraw, false, "the page's first draw is a first draw, not a redraw");
  eq(app.lazy.loaded.slice().sort(), B["content-maths"].slice().sort(), "only Maths was fetched");
  eq(app.lazy.misses, [], "nothing read early");
  const h1 = app.document.querySelector("#main h1");
  assert(h1 && h1.textContent.trim(), "the lesson has its title");
  assert(mainText(app).length > 800, "the lesson drew: " + mainText(app).length);
  await new Promise((r) => setTimeout(r, 80));
  eq(app.document.getElementById("kos-live-polite").textContent, h1.textContent.trim(), "the page is named once it is drawn");
  eq(app.document.activeElement && app.document.activeElement.id, "main", "focus moved into the page");
  eq(K.router.routeFor("ref", { subject: "maths", ref }), app.window.location.hash, "the address is the lesson's");
  /* opened again: no wait */
  K.show("home"); K.show("ref", { subject: "maths", ref });
  assert(!waiting(app), "a loaded subject opens at once");
  /* a Code lesson: the same, and its evidence did not move */
  const cref = K.code.coreLessons()[0].ref, ev = JSON.stringify(K.code.evidence(cref));
  K.show("ref", { subject: "code", ref: cref });
  assert(waiting(app), "Code waits for its content");
  await app.settle(); await app.settle();
  assert(!waiting(app) && mainText(app).length > 800, "the Code lesson drew");
  eq(JSON.stringify(K.code.evidence(cref)), ev, "its evidence is the same with the real lesson");
  eq(app.lazy.misses, [], "nothing read early");
  eq(app.errors.concat(app.consoleErrors), [], "no errors");
});

/* ---------------- G ---------------- */
step("G · leaving while a page loads: the next page is the one on screen", async () => {
  const app = await lazyBoot(fxB);
  const K = app.KOS;
  K.show("subject", "compsci");
  assert(waiting(app), "the subject waits");
  K.show("focus");
  assert(!waiting(app), "Focus needs nothing");
  const focusText = mainText(app);
  await app.settle(); await app.settle();
  eq(app.window.location.hash, "#/focus", "still on Focus");
  eq(mainText(app).slice(0, 200), focusText.slice(0, 200), "Focus was not drawn over");
  assert(K.lazy.ready("content-compsci"), "the content arrived anyway");
  await new Promise((r) => setTimeout(r, 80));
  assert(app.document.getElementById("kos-live-polite").textContent !== "Loading…", "nothing announced for the page that was left");
  eq(app.errors.concat(app.consoleErrors), [], "no errors");
});

/* ---------------- H ---------------- */
step("H · offline: the page says so, and opens once the connection is back", async () => {
  const app = await lazyBoot(fxB);
  const K = app.KOS;
  app.lazy.offline = true;
  K.show("subject", "it");
  await app.settle();
  const box = waiting(app);
  assert(box && /could not be loaded/.test(box.textContent) && !box.hasAttribute("aria-busy"), "the page says it could not load: " + (box && box.textContent));
  assert(!K.lazy.ready("content-it"), "nothing was marked loaded");
  eq(app.errors, [], "a failed fetch is not a page error");
  app.lazy.offline = false;
  K.show("subject", "it");
  await app.settle(); await app.settle();
  assert(!waiting(app) && mainText(app).length > 500, "it opens with the connection back");
  assert(K.lazy.ready("content-it"), "IT is in");
});

/* ---------------- I ---------------- */
step("I · no fork is made from a stand-in, and a fork is not called stale before its content is in", async () => {
  const app = await lazyBoot(fxB);
  const K = app.KOS, st = K.store.state;
  const forked = Object.keys(st.edits.topics).filter((k) => k.indexOf("compsci:") === 0);
  assert(forked.length === 2, "the account's forks: " + forked);
  const ref = Object.keys(E.window.KOS_CONTENT).filter((k) => k.indexOf("maths:") === 0 && E.window.KOS_CONTENT[k].quiz)[1].slice(6);
  const before = JSON.stringify(st.edits);
  eq(K.edits.set("maths", ref, "notes", [{ p: "only this" }]), null, "set refuses");
  eq(K.edits.set("maths", ref, "quiz", []), null, "set refuses a quiz");
  eq(JSON.stringify(st.edits), before, "nothing was written");
  forked.forEach((k) => ["notes", "flashcards"].forEach((kind) => eq(K.edits.stale("compsci", k.slice(8), kind), false, k + " " + kind + " is not called stale")));
  eq(K.edits.keepMine("compsci", forked[0].slice(8), "flashcards"), false, "Keep mine waits for the content");
  /* the forked topic still reads as the fork over a stand-in */
  const fc = forked.filter((k) => st.edits.topics[k].flashcards)[0].slice(8);
  const e = K.content.get("compsci", fc);
  assert(K.lazy.isStub(e) && e.flashcards.length === st.edits.topics["compsci:" + fc].flashcards.length, "the fork's cards over the stand-in");
  await app.settle(); await app.settle();          /* the refusals asked for the content */
  assert(K.lazy.ready("content-maths") && K.lazy.ready("content-compsci"), "the content was asked for");
  eq(forked.map((k) => ["notes", "flashcards"].map((kind) => K.edits.stale("compsci", k.slice(8), kind))), forked.map((k) => ["notes", "flashcards"].map((kind) => E.KOS.edits.stale("compsci", k.slice(8), kind))), "stale, as eager says");
  const made = K.edits.set("maths", ref, "notes", K.edits.material("maths", ref, "notes").concat([{ p: "mine" }]));
  assert(made && made.length > 1, "with the content in, the fork holds the shipped notes and mine");
  eq(app.errors.concat(app.consoleErrors), [], "no errors");
});

/* ---------------- J ---------------- */
step("J · every page that names what it needs opens from cold without an early read", async () => {
  const exam = E.KOS.exams.all().filter((a) => a.preset === "aqa-7517-2")[0];
  const csRef = Object.keys(fxA.storage).length && Object.keys(E.KOS.store.state.edits.topics)[0].slice(8);
  const jobs = [
    ["subject", "compsci", ["content-compsci"]], ["subject", "it", ["content-it"]], ["subject", "code", ["content-code"]],
    ["ref", { subject: "compsci", ref: csRef }, ["content-compsci"]],
    ["code", undefined, ["content-code"]],
    ["exams", undefined, ["exam-index", "exams-deep", "content-compsci", "content-maths"]],
    ["exams", exam.id, ["exam-index", "exams-deep", "content-compsci"]],
    ["exams", "season", ["exam-index", "exams-deep"]],
    ["tracker", undefined, ["exam-index"]],
    ["due", undefined, ["content-compsci", "content-maths", "content-it"]],
    ["review", { tab: "due", run: "all" }, ["content-compsci", "content-maths", "content-it"]],
    ["cardstats", undefined, ["content-compsci", "content-maths", "content-it"]],
    /* W8 (AP-01 stage 2): page modules on first use */
    ["code", "units", ["content-code", "page-code"]], ["subject", "mind", ["page-mind"]], ["subject", "ja", ["page-ja"]],
    ["ref", { subject: "mind", ref: E.KOS.hub.LEAVES.mind[0].ref }, ["page-mind"]],
    ["money", undefined, ["page-money"]], ["governor", undefined, ["page-governor"]], ["mind", undefined, ["page-mind"]],
    ["japanese", undefined, ["page-ja"]], ["help", undefined, ["page-help"]], ["shrine", undefined, ["page-shrine"]],
    ["reports", undefined, ["page-reports"]], ["mediasync", undefined, ["page-sync"]]
  ];
  for (const [view, arg, want] of jobs) {
    const app = await lazyBoot(fxB);
    const name = view + " " + (JSON.stringify(arg) || "");
    app.KOS.show(view, arg);
    assert(waiting(app), name + " waits");
    await app.settle(); await app.settle();
    assert(!waiting(app), name + " drew");
    assert(mainText(app).length > 100, name + " has a page: " + mainText(app).length);
    want.forEach((b) => assert(app.KOS.lazy.ready(b), name + " has " + b));
    eq(app.lazy.misses.map((m) => m.split("\n").slice(0, 4).join(" < ")), [], name + " read nothing early");
    eq(app.errors.concat(app.consoleErrors), [], name + " errors");
    if (view === "review") assert(/\S/.test((app.document.querySelector("[data-ui~='fc.front'], [data-ui~='review.card'], .k-fc-q") || app.document.getElementById("main")).textContent), "the review shows a card");
    app.window.close();
  }
  /* pages that need nothing never wait */
  const app = await lazyBoot(fxB);
  ["home", "focus", "calendar", "reminders", "goals", "matrix", "assignments", "pacing", "achievements", "files", "data"].forEach((v) => {
    app.KOS.show(v);
    assert(!waiting(app), v + " opens at once");
  });
  await app.settle();
  eq(app.lazy.loaded, [], "none of them fetched anything");
  eq(app.lazy.misses.map((m) => m.split("\n").slice(0, 4).join(" < ")), [], "none of them read early");
  eq(app.errors.concat(app.consoleErrors), [], "no errors");
});

/* ---------------- K ---------------- */
step("K · search and the Assistant's tools take everything in first", async () => {
  const app = await lazyBoot(fxB);
  const K = app.KOS, doc = app.document;
  /* a word that is only in a card's answer: find one from the eager boot */
  const C = E.window.KOS_CONTENT;
  const want = E.KOS.hub.search("two's complement");
  assert(want.length > 0, "the eager search finds something");
  const box = doc.getElementById("search");
  box.focus(); box.value = "two's complement";
  box.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  await app.settle(); await app.settle();
  ["content-compsci", "content-maths", "content-it", "content-code"].forEach((b) => assert(K.lazy.ready(b), "search took in " + b));
  eq(K.hub.search("two's complement").map((r) => r.subject + ":" + r.ref), want.map((r) => r.subject + ":" + r.ref), "the same results as eager");
  eq(app.errors.concat(app.consoleErrors), [], "no errors");
  assert(Object.keys(C).length > 300, "content is there");

  const two = await lazyBoot(fxB);
  const ref = Object.keys(C).filter((k) => k.indexOf("maths:") === 0 && C[k].quiz && C[k].notes)[0].slice(6);
  const got = await new Promise((res) => {
    const seen = [];
    two.KOS.ai.orchestrator.runTool("study_get_topic", { subject: "maths", ref }, {
      onToolResult: (r) => seen.push(r), onError: (e) => res({ error: e }), onDone: () => res({ seen })
    });
  });
  assert(got.seen && got.seen.length === 1 && got.seen[0].ok, "the tool ran: " + JSON.stringify(got));
  eq(pendingOf(two), [], "every bundle was in before it ran");
  eq(two.lazy.misses, [], "it read nothing early");
  const direct = await new Promise((res) => two.KOS.ai.tools.execute("study_get_topic", { subject: "maths", ref }, (err, r) => res(err || r)));
  assert(direct.content && direct.content.hasNotes && direct.content.quizQuestions > 0, "the tool sees the lesson: " + JSON.stringify(direct.content));
});

/* ---------------- L ---------------- */
step("L · after boot the bundles arrive in idle moments, the last subject first, and the state is the eager one", async () => {
  const fx = await seed();
  const app = await lazyBoot(fx, { longTimers: true, lazyWarm: true });
  for (let i = 0; i < 12 && pendingOf(app).length; i++) await app.settle();
  eq(pendingOf(app), [], "everything arrived");
  const B = bundles(), sid = app.KOS.store.state.ui.subject;
  assert(B["content-" + sid].indexOf(app.lazy.loaded[0]) !== -1, "the subject last studied (" + sid + ") came first: " + app.lazy.loaded[0]);
  eq(app.lazy.misses, [], "nothing read early");
  eq(app.errors.concat(app.consoleErrors), [], "no errors");
  /* AP-19: Week by week hears each report saved (achSeen), so this boot
     finishes its slow report tick too, as step D let E finish its own */
  const weeksL = () => new Promise((res) => app.KOS.reportStore.list("week", (e, l) => res(e ? -1 : (l || []).length)));
  for (let i = 0, same = 0, last = -2; i < 90 && same < 14; i++) { await app.settle(); const n = await weeksL(); same = n === last ? same + 1 : 0; last = n; }
  await app.settle(); await app.KOS.store.flush(); await E.KOS.store.flush();
  const out = [];
  /* a goal's lastMeasuredAt is WHEN its figure last changed, read off the
     clock as KOS.goals.compute finishes. compute waits for its IndexedDB
     reads, and the harness gives IndexedDB four turns per virtual timer, so
     a warm-up that queues more timers (W8, AP-01 stage 2: nine page
     bundles) finishes it at an earlier virtual second. The figures
     themselves (lastCurrent, progress) are still compared. */
  const unstamp = (st) => { ((st.goals && st.goals.items) || []).forEach((g) => { delete g.lastMeasuredAt; }); return st; };
  diff(unstamp(stateOf(E, fxA.storage)), unstamp(stateOf(app, fx.storage)), "state", out);
  eq(out, [], "the saved state after warming up");
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
