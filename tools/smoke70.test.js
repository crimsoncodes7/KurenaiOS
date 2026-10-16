/* Kurenai OS — smoke70.test.js
   Reports, phase 3 (roadmap 5.1, design 24a, 25a–25d, 24g): the pages.

   The claims:

     A · THE REPORTS PAGE. With nothing saved it says when the first report
         arrives; with reports it lists them newest first ("Latest" on the
         first), selecting a row swaps the left column without navigating,
         and "Open the full report" goes to the week's own route.
     B · ONE WEEK (25a). The hero carries the saved words; the tiles leave
         out a supporting zero (no Plan tile without plan rows, no Earned
         tile when the awards were not recorded); every card that has a
         full overview links to it inside Reports, never to an app page.
     C · THE OVERVIEWS. Study lists every topic; Focus draws every block on
         the day it happened; Collection filters by medium, switches to a
         list and shows all on demand.
     D · LOW DATA (24g). Under three active days the activity chart is the
         week as seven day tiles, with the rule stated.
     E · ROUTES AND THE BELL. `#/reports/week/<start>/<section>` round-trips
         through the router; a week with no report says so; the `reports`
         notification opens its report; Home links to Reports.
     F · A RENDER WRITES NOTHING (invariant 102): the state document is the
         same before and after every Reports page renders.
     G · KURENAI'S WORDS (24f). The payload is totals only; ✦ Kurenai sends
         one structured request; Cancel ignores the late reply; a failure
         falls back in place with the switch on Template; written words are
         saved (facts untouched), kept when switching back, replaced by
         ↻ regenerate; "What is sent" prints the payload.
     H · THE STORY (25g). Its slides are the saved story list; ▶ Play and
         the chips open it; ← → move; the quiz waits, rings the right answer
         and marks a wrong pick; the recap's Share card opens the export.
     I · SHARE AND EXPORT (24k). Collection titles are off by default in
         every format; the primary button says what it will do.
     J · HOME AND SEARCH. A report from the last week is "New" on Home
         until "Read the report" (a click) marks it read; search finds it.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke70.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

let seq = 1;
function at(date, hh, mm) { const [y, m, d] = date.split("-").map(Number); return new Date(y, m - 1, d, hh, mm || 0).getTime(); }
function focus(date, endH, mins, sid, refs) {
  return { id: seq++, ts: at(date, endH), date, type: "focus", subject: sid || "compsci", ref: null, refs: refs || ["compsci:4.1.1.1"],
    dur: mins * 60, metrics: { complete: true, mode: "pomodoro" }, award: { xp: 10 + mins, gold: 3 } };
}
function cards(date, n, again) {
  return { id: seq++, ts: at(date, 12), date, type: "flashcards", subject: "compsci", ref: "4.1.1.2", refs: ["compsci:4.1.1.2"],
    metrics: { cards: n, again: again, hard: 0, good: n - again, easy: 0 }, award: { xp: 20, gold: 3 } };
}
const WEEK = { period: "week", id: "week:2026-09-07", start: "2026-09-07", end: "2026-09-13" };
const QUIET = { period: "week", id: "week:2026-08-31", start: "2026-08-31", end: "2026-09-06" };
function rows() {
  const t = (d, h) => at(d, h);
  return [
    { id: 1, syncId: "a1", module: "anime", title: "Frieren", status: "inProgress", score: 9, genres: ["Adventure"], extra: { duration: 24, country: "JP" },
      journal: [[t("2026-09-08", 20), "progress", 13, 16]] },
    { id: 2, syncId: "a2", module: "books", title: "Spice and Wolf", status: "completed", score: 10, genres: ["Romance"], extra: {},
      journal: [[t("2026-09-12", 15), "progress", 40, 44], [t("2026-09-12", 15), "status", "inProgress", "completed"]] },
    { id: 3, syncId: "a3", module: "anime", title: "Pupa", status: "dropped", score: 3, genres: ["Horror"], extra: {},
      journal: [[t("2026-09-09", 22), "progress", 3, 4], [t("2026-09-09", 22), "status", "inProgress", "dropped"]] },
    { id: 4, syncId: "a4", module: "anime", title: "Dandadan", status: "inProgress", score: 0, genres: ["Action"], extra: {},
      journal: [[t("2026-09-13", 11), "progress", 4, 8]] }
  ];
}
async function save(app, p, input) {
  const facts = app.KOS.report.compute(Object.assign({ ledger: [], rows: [], tally: {}, reminders: [], habits: [] }, input), p);
  const rep = { id: p.id, period: p.period, start: p.start, end: p.end, savedAt: at(p.end, 7) + 86400000, facts,
    words: { mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle" } };
  await p2(app, rep);
  return rep;
}
function p2(app, rep) { return p(cb => app.KOS.reportStore.putReport(rep, cb)); }
const main = (app) => app.document.getElementById("main");
async function show(app, arg) { app.KOS.show("reports", arg); await app.settle(); }
function snap(app) { const s = JSON.parse(JSON.stringify(app.KOS.store.state)); delete s.ui; return JSON.stringify(s); }

/* ============ A · the Reports page ============ */
step("A · empty, then a list newest first that swaps the left column", async (app) => {
  await show(app);
  assert(/first weekly report arrives on Monday/.test(main(app).textContent), "the empty state says when the first report comes");
  await save(app, QUIET, { ledger: [focus("2026-09-05", 19, 40)] });
  await save(app, WEEK, { ledger: [
    focus("2026-09-07", 19, 60), focus("2026-09-08", 20, 45, "maths", ["maths:3.3"]), focus("2026-09-09", 21, 30),
    focus("2026-09-10", 19, 50), focus("2026-09-11", 20, 35), cards("2026-09-08", 60, 6)], rows: rows() });
  await show(app);
  const rowsEls = [...main(app).querySelectorAll("[data-ui~='reports.row']")];
  assert(rowsEls.length === 2 && rowsEls[0].getAttribute("data-id") === WEEK.id, "two rows, newest first");
  assert(/Latest/.test(rowsEls[0].textContent) && !/Latest/.test(rowsEls[1].textContent), "Latest on the first row only");
  const sum = () => main(app).querySelector("[data-ui~='reports.summary']");
  assert(/7 Sep/.test(sum().getAttribute("aria-label")), "the newest report is open on the left");
  const hash = app.window.location.hash;
  rowsEls[1].click(); await app.settle();
  assert(/31 Aug/.test(sum().getAttribute("aria-label")), "selecting a row swaps the left column");
  assert(app.window.location.hash === hash, "…without navigating");
  assert(rowsEls[1].getAttribute("aria-pressed") === "true" && rowsEls[0].getAttribute("aria-pressed") === "false", "the chosen row is pressed");
  main(app).querySelector("[data-ui~='reports.open']").click(); await app.settle();
  assert(app.window.location.hash === "#/reports/week/2026-08-31", "Open the full report goes to the week's route: " + app.window.location.hash);
});

/* ============ B · one week ============ */
step("B · the week: saved words, tiles without supporting zeros, overview links", async (app) => {
  await show(app, { period: "week", start: WEEK.start });
  const m = main(app);
  const rep = await p(cb => app.KOS.reportStore.getReport(WEEK.id, cb));
  const w = app.KOS.reportWords.current(rep);
  assert(m.querySelector("[data-ui~='reports.hero'] h2").textContent === w.headline, "the hero carries the saved headline");
  const labels = [...m.querySelectorAll("[data-ui~='reports.tiles'] [data-ui~='part.label']")].map(n => n.textContent);
  assert(labels.indexOf("Studied") === 0 && labels.indexOf("Focus") !== -1 && labels.indexOf("Collection") !== -1, "the tiles that have something: " + labels);
  assert(labels.indexOf("Plan") === -1, "no Plan tile without plan rows");
  assert(labels.indexOf("Earned") !== -1, "Earned, from the recorded awards");
  const links = [...m.querySelectorAll("[data-ui~='reports.overview-link']")];
  assert(links.length === 3, "Study, Focus and Collection link to their overviews: " + links.length);
  links[2].click(); await app.settle();
  assert(app.window.location.hash === "#/reports/week/2026-09-07/collection", "a card opens its overview inside Reports: " + app.window.location.hash);
});

/* ============ C · the overviews ============ */
step("C · Study lists every topic; Focus draws every block; Collection filters", async (app) => {
  await show(app, { period: "week", start: WEEK.start, section: "study" });
  let m = main(app);
  const trs = m.querySelectorAll("[data-ui~='reports.topics-table'] tbody tr");
  assert(trs.length >= 2, "every topic is a row: " + trs.length);
  assert(m.querySelector("[data-scroller]"), "the table scrolls through the shared scroller");
  await show(app, { period: "week", start: WEEK.start, section: "focus" });
  m = main(app);
  assert(m.querySelectorAll(".k-rp-tl-b").length === 5, "five blocks on the timeline");
  assert(/Evening Sprinter|Night Owl/.test(m.textContent), "the persona card");
  await show(app, { period: "week", start: WEEK.start, section: "collection" });
  m = main(app);
  const cells = () => m.querySelectorAll("[data-ui~='reports.cover-grid'] > li").length;
  assert(cells() === 4, "all four titles: " + cells());
  const books = [...m.querySelectorAll("[data-ui~='reports.titles'] [data-ui~='ui.tab']")].find(b => /Books/.test(b.textContent));
  books.click(); await app.settle();
  assert(cells() === 1, "the Books filter leaves one");
  const list = [...m.querySelectorAll("[data-ui~='reports.titles'] [data-ui~='ui.tab']")].find(b => /^List/.test(b.textContent));
  list.click(); await app.settle();
  assert(m.querySelector("[data-ui~='reports.title-list']"), "the list layout");
  assert(/ch 41–44/.test(m.textContent), "the week's progress under the title");
});

/* ============ D · low data ============ */
step("D · under three active days, seven day tiles and the rule", async (app) => {
  await show(app);
  [...main(app).querySelectorAll("[data-ui~='reports.row']")].find(b => b.getAttribute("data-id") === QUIET.id).click();
  await app.settle();
  const left = main(app).querySelector("[data-ui~='reports.summary']");
  assert(left.querySelectorAll("[data-ui~='reports.day-tiles'] li").length === 7, "seven day tiles");
  assert(/starts once there are 3 active days/.test(left.textContent), "the rule is stated");
});

/* ============ E · routes, the bell, Home ============ */
step("E · routes round-trip; a missing week says so; the bell and Home lead here", async (app) => {
  const KOS = app.KOS;
  app.window.location.hash = "#/reports/week/2026-09-07/focus";
  app.window.dispatchEvent(new app.window.HashChangeEvent("hashchange"));
  app.window.dispatchEvent(new app.window.PopStateEvent("popstate", { state: null }));
  await app.settle();
  assert(/Focus and plan/.test(main(app).textContent), "a deep link opens the Focus overview");
  await show(app, { period: "week", start: "2026-01-05" });
  assert(/No report for the week of 5 Jan/.test(main(app).textContent), "a week with no report says so");
  assert(KOS.notify.KINDS.reports && KOS.notify.KINDS.reports.view === "reports", "the bell knows the reports kind");
  KOS.show("reports", { period: "week", id: WEEK.id }); await app.settle();
  assert(main(app).querySelector("[data-ui~='reports.hero']"), "a notification's {period, id} opens its report");
  KOS.show("home"); await app.settle();
  const link = [...main(app).querySelectorAll("button")].find(b => /Weekly reports/.test(b.textContent));
  assert(link, "Home's Study hours card links to Reports");
  link.click(); await app.settle();
  assert(app.window.location.hash === "#/reports", "…to the Reports page");
});

/* ============ F · render purity ============ */
step("F · rendering any Reports page writes nothing", async (app) => {
  const args = [undefined, { period: "week", start: WEEK.start }, { period: "week", start: WEEK.start, section: "study" },
    { period: "week", start: WEEK.start, section: "focus" }, { period: "week", start: WEEK.start, section: "collection" }];
  for (const a of args) {
    const before = snap(app);
    await show(app, a);
    assert(snap(app) === before, "a render wrote state: " + JSON.stringify(a));
  }
});

/* ============ G · Kurenai's words (24f) ============ */
step("G · ✦ Kurenai writes from totals only; written, cancelled, failed, regenerated", async (app) => {
  const KOS = app.KOS;
  const real = KOS.ai.chat;
  let sent = null, reply = null, held = null;
  KOS.ai.chat = (cat, req, cb) => { sent = { cat, req }; if (reply === "hold") { held = cb; return "c1"; } app.window.setTimeout(() => cb(reply.err || null, reply.err ? null : { text: JSON.stringify(reply), provider: "stub", model: "stub" }), 0); return "c1"; };
  const realCancel = KOS.ai.cancel;
  let cancelled = null;
  KOS.ai.cancel = (id) => { cancelled = id; return true; };
  try {
    await show(app, { period: "week", start: WEEK.start });
    const words = () => main(app).querySelector("[data-ui~='reports.hero'] [data-ui~='reports.words']");
    const tab = (name) => [...words().querySelectorAll("[data-ui~='ui.tab']")].find(b => b.getAttribute("aria-label") === name || b.textContent.trim() === name);
    /* the payload: totals, never a title or a topic name */
    const rep = await p(cb => KOS.reportStore.getReport(WEEK.id, cb));
    const pay = JSON.stringify(KOS.reportWords.payload(rep));
    assert(!/Frieren|Spice|Pupa|Dandadan/.test(pay), "no title is sent: " + pay);
    assert(!rep.facts.study.topics.some(t => pay.indexOf(t.title) !== -1), "no topic name is sent");
    assert(/"study_min"/.test(pay) && /"focus_blocks":5/.test(pay), "the totals are: " + pay);
    /* cancel while writing */
    reply = "hold";
    tab("Kurenai").click(); await app.settle();
    assert(words().getAttribute("aria-busy") === "true" && /Kurenai is writing from this week's totals/.test(words().textContent), "generating: skeleton and the line");
    assert(sent.cat === "generation" && sent.req.structured && /totals/.test(sent.req.messages[0].content), "one structured generation request");
    words().querySelector("[data-ui~='reports.words-cancel']").click(); await app.settle();
    assert(cancelled === "c1" && !words().getAttribute("aria-busy"), "Cancel stops the request and returns to the template");
    held(null, { text: JSON.stringify({ headline: "Too late.", narrative: "This arrived after the cancel and must not be shown at all." }) }); await app.settle();
    assert(!/Too late/.test(words().textContent), "a cancelled reply is ignored");
    /* a failure falls back in place */
    reply = { err: { kind: "network", message: "offline" } };
    tab("Kurenai").click(); await app.settle();
    assert(words() && words().querySelector("[data-ui~='reports.words-failed']") && /no connection/.test(words().textContent), "the calm failure note: " + app.window.location.hash + " " + main(app).textContent.slice(0, 300));
    assert(tab("Template").getAttribute("aria-selected") === "true", "the switch returns to Template");
    assert(words().querySelector("[data-ui~='reports.headline']").textContent.length > 3, "the page never shows an empty headline");
    /* written */
    reply = { headline: "A Maths-heavy week that kept the streak alive.", narrative: "Most of the week went to CS, with Maths on Tuesday. Recall held across sixty cards." };
    words().querySelector("[data-ui~='reports.words-retry']").click(); await app.settle();
    assert(words().querySelector("[data-ui~='reports.headline']").textContent === reply.headline, "Kurenai's headline");
    assert(/Written by Kurenai/.test(words().textContent) && words().querySelector("[data-ui~='reports.words-regenerate']"), "the mark and ↻ regenerate");
    let saved = await p(cb => KOS.reportStore.getReport(WEEK.id, cb));
    assert(saved.words.mode === "kurenai" && saved.words.headline === reply.headline && saved.facts.study.mins === rep.facts.study.mins, "the saved report keeps the words, facts untouched");
    /* back to Template keeps the written words for later, without a request */
    sent = null;
    tab("Template").click(); await app.settle();
    saved = await p(cb => KOS.reportStore.getReport(WEEK.id, cb));
    assert(saved.words.mode === "template" && saved.words.headline === reply.headline, "Template keeps Kurenai's words stored");
    tab("Kurenai").click(); await app.settle();
    assert(sent === null && words().querySelector("[data-ui~='reports.headline']").textContent === reply.headline, "switching back needs no new request");
    reply = { headline: "A second take on the same week.", narrative: "The same totals, told again in different words for the same week." };
    words().querySelector("[data-ui~='reports.words-regenerate']").click(); await app.settle();
    assert(words().querySelector("[data-ui~='reports.headline']").textContent === reply.headline, "↻ regenerate replaces the words");
    /* the What is sent panel prints the payload */
    words().querySelector("[data-ui~='reports.words-sent']").click(); await app.settle();
    const dlg = app.document.querySelector("[data-ui~='reports.sent']");
    assert(dlg && /study_min:/.test(dlg.textContent) && /No notes, card text, titles/.test(dlg.textContent), "the panel shows the payload");
    dlg.querySelector("[data-ui~='ui.dialog-close']").click(); await app.settle();
    /* garbage is a failure, never shown */
    reply = { headline: "", narrative: "x" };
    words().querySelector("[data-ui~='reports.words-regenerate']").click(); await app.settle();
    assert(/wasn't usable/.test(words().textContent), "an unusable reply is a failure");
  } finally { KOS.ai.chat = real; KOS.ai.cancel = realCancel; }
});

/* ============ H · the story (25g) ============ */
step("H · the story: slides from the facts, moving, the quiz, the recap", async (app) => {
  const KOS = app.KOS, doc = app.document;
  const rep = await p(cb => KOS.reportStore.getReport(WEEK.id, cb));
  const sl = KOS.reportStory.slides(rep);
  assert(sl.map(x => x.id).join() === rep.facts.stories.join(), "the slides are the saved story list: " + sl.map(x => x.id));
  assert(sl[0].t === "intro" && sl[sl.length - 1].t === "summary", "intro first, the recap last");
  const quiz = sl.find(x => x.t === "quiz");
  assert(quiz && quiz.opts[quiz.ans].label === "Monday", "the quiz's answer is the day with the most Focus (" + (quiz && quiz.opts.map(o => o.label)) + ")");
  await show(app, { period: "week", start: WEEK.start });
  const thumbs = main(app).querySelectorAll("[data-ui~='reports.thumb']");
  assert(thumbs.length === sl.length, "a thumbnail per story");
  main(app).querySelector("[data-ui~='reports.play']").click();
  const stage = () => doc.querySelector("[data-ui~='reports.story-stage']");
  doc.querySelector("[data-ui~='reports.story-pause']").click();   // hold the clock for the checks
  await app.settle();
  assert(stage() && /Your week, /.test(stage().textContent), "▶ Play opens the intro");
  assert(doc.querySelectorAll("[data-ui~='reports.story-chip']").length === sl.length, "a chip per story");
  doc.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })); await app.settle();
  assert(/You studied for/.test(stage().textContent), "→ moves to the next story");
  doc.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true })); await app.settle();
  assert(/Your week, /.test(stage().textContent), "← moves back");
  const qi = sl.indexOf(quiz);
  doc.querySelectorAll("[data-ui~='reports.story-chip']")[qi].click(); await app.settle();
  assert(/Tap a day to guess/.test(stage().textContent), "a chip jumps to the quiz, which waits");
  const opts = [...stage().querySelectorAll("[data-ui~='reports.story-option']")];
  const wrong = opts.findIndex((o, i) => i !== quiz.ans);
  opts[wrong].click(); await app.settle();
  const after = [...stage().querySelectorAll("[data-ui~='reports.story-option']")];
  assert(after[quiz.ans].getAttribute("data-state") === "right" && after[wrong].getAttribute("data-state") === "wrong", "the right answer is ringed, the wrong pick marked");
  assert(/^Not quite\. Monday: /.test(stage().querySelector("[data-ui~='reports.story-reveal']").textContent), "Not quite, then the fact");
  doc.querySelectorAll("[data-ui~='reports.story-chip']")[sl.length - 1].click(); await app.settle();
  assert(stage().querySelector("[data-ui~='reports.story-share']"), "the recap offers the share card");
  stage().querySelector("[data-ui~='reports.story-share']").click(); await app.settle();
  const ex = doc.querySelector("[data-ui~='reports.export-dialog']");
  assert(ex && ex.querySelector("[data-format='png'][aria-checked='true']"), "Share card opens the export dialog on PNG");
  ex.querySelector("[data-ui~='ui.dialog-close']").click(); await app.settle();
  doc.querySelector("[data-ui~='reports.story-close']").click(); await app.settle();
  assert(!stage(), "✕ closes the story");
});

/* ============ I · share and export (24k) ============ */
step("I · export: titles off by default, the button says what it does", async (app) => {
  const KOS = app.KOS, doc = app.document;
  const rep = await p(cb => KOS.reportStore.getReport(WEEK.id, cb));
  const text = KOS.reportShare.asText(rep, { titles: false, words: true, level: true });
  assert(!/Frieren|Spice and Wolf/.test(text), "text leaves the Collection's titles out by default");
  assert(/Frieren/.test(KOS.reportShare.asText(rep, { titles: true })), "…and includes them when asked");
  const csv = KOS.reportShare.asCsv(rep, { titles: false });
  assert(/^section,item,value\n/.test(csv) && /study,minutes,/.test(csv) && !/Frieren/.test(csv), "the CSV: totals, no titles");
  KOS.reportShare.dialog(rep, { format: "png" }); await app.settle();
  const ex = doc.querySelector("[data-ui~='reports.export-dialog']");
  assert(ex.querySelector("[data-ui~='reports.export-titles']").checked === false, "Collection titles: off by default");
  const go = ex.querySelector("[data-ui~='reports.export-go']");
  assert(go.textContent === "Save the share card", "PNG: " + go.textContent);
  ex.querySelector("[data-format='csv']").click(); await app.settle();
  assert(go.textContent === "Save as CSV", "the label follows the format");
  go.click(); await app.settle();
  assert(!doc.querySelector("[data-ui~='reports.export-dialog']"), "saving closes the dialog");
});

/* ============ J · Home and search ============ */
step("J · the Home card, then search finds Reports", async (app) => {
  const KOS = app.KOS;
  /* a report saved this week (the harness clock is Thu 24 Sep) */
  const NOW = { period: "week", id: "week:2026-09-14", start: "2026-09-14", end: "2026-09-20" };
  const rep = await save(app, NOW, { ledger: [focus("2026-09-15", 19, 50), focus("2026-09-16", 19, 40), focus("2026-09-17", 20, 30)] });
  rep.savedAt = app.window.Date.now() - 3 * 864e5;
  await p2(app, rep);
  KOS.show("home"); await app.settle();
  let card = main(app).querySelector("[data-ui~='reports.home-card']");
  assert(card && !card.hasAttribute("hidden") && /New/.test(card.textContent), "Home shows the new report");
  card.querySelector("[data-ui~='reports.home-open']").click(); await app.settle();
  assert(app.window.location.hash === "#/reports/week/2026-09-14", "Read the report opens it");
  assert(KOS.notify.isRead({ id: "reports:" + NOW.id }), "…and marks it read");
  KOS.show("home"); await app.settle();
  card = main(app).querySelector("[data-ui~='reports.home-card']");
  assert(card && !card.hasAttribute("hidden") && !/\bNew\b/.test(card.textContent) && card.querySelector(".k-rp-home-h") && card.querySelector("[data-ui~='reports.home-open']"),
    "read: the same full card without New (it never shrinks to a row)");
  let groups = null;
  KOS.search.run("week in review", (g) => { groups = g; });
  assert(groups && groups.some(g => g.id === "reports"), "search finds Reports");
});

/* ============ Code in a report (invariant 110's ledger) ============ */
step("Code: a week's proofs from the ledger, a card and a tile; none without code", async (app) => {
  const CW = { period: "week", id: "week:2026-09-21", start: "2026-09-21", end: "2026-09-27" };
  const code = (date, h, ref, metrics, dur) => ({ id: "c" + date + h, ts: at(date, h), date, type: "code", subject: "code", ref, dur: dur || null, metrics });
  const ledger = [
    code("2026-09-21", 18, "1.1", { kind: "task", id: "1.1-box", tier: "warm-up", proved: ["toplevel", "writeline"] }),
    code("2026-09-21", 19, "1.1", { kind: "task", id: "1.1-two", seen: true }),
    code("2026-09-22", 18, "1.2", { kind: "retrieval", id: "u1-x", grade: "good", paid: true, proved: ["types"] }),
    code("2026-09-23", 18, "1.2", { kind: "retrieval", id: "u1-y", grade: "again", paid: false, proved: [] }),
    code("2026-09-24", 18, "1.1", { kind: "kata", id: "k1", right: 4, total: 5 }, 420),
    code("2026-09-24", 19, "1.1", { kind: "practice", id: "1.1:p1", proved: ["writeline"] })
  ];
  const f = app.KOS.report.compute({ ledger, rows: [], tally: {}, reminders: [], habits: [] }, CW);
  const c = f.code;
  assert(c && c.tasks === 1 && c.skills === 3 && c.retrieval === 2 && c.retrievalOk === 1 && c.katas === 1 && c.kataRight === 4 && c.practice === 1,
    "the week counts first passes (not a seen answer), skills, retrieval, katas and practice: " + JSON.stringify(c));
  assert(!("capstones" in c) && c.lessons[0].ref === "1.1", "zero facts are absent; lessons ranked");
  assert(!app.KOS.report.compute({ ledger: [], rows: [], tally: {}, reminders: [], habits: [] }, CW).code, "no code, no section");
  const payload = app.KOS.reportWords.payload({ facts: f });
  assert(payload.code_tasks_passed === 1 && payload.code_retrievals === "1/2", "Kurenai's words get the totals only");
  await save(app, CW, { ledger });
  await show(app, { period: "week", start: CW.start });
  const card = main(app).querySelector("[aria-label='Code'][data-ui~='reports.card']");
  assert(card && /Tasks passed/.test(card.textContent) && card.querySelector("[data-ui~='reports.code-lesson']"), "the week page has a Code card");
  assert([...main(app).querySelectorAll("[data-ui~='ui.stat']")].some(t => /Code/.test(t.textContent)), "…and a Code tile");
});

(async () => {
  const app = await boot();
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.message)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE70: " + fails + " failure(s)" : "\nSMOKE70: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
