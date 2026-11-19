/* Kurenai OS — smoke194.test.js
   The study spaces join Reports and Goals (quality audit JM-21, MI-10
   parts 1 and 2, and the Creatives audit beside them).

     A · JM-21, MI-10 (1)  a new report carries Japanese facts (sessions,
                reviews and passes, by skill, lessons, checkpoints and gates)
                and Mind facts (reviews, lessons, checkpoints, paths,
                positions taken and changed, Journal entries as a COUNT);
                only the period's first passes; the words' payload carries
                totals only, never an entry or a position's words.
     B · the cards: the week page and a month page draw a Japanese and a
                Mind card; a report saved before (no f.ja / f.mind) has
                none and nothing is recomputed.
     C · JM-21 Goals  Japanese's types: reviews passed, lessons finished,
                kana held a week, words stable — each a read.
     D · MI-10 (2) Goals  Mind's types: reviews passed and lessons; the
                review/recall types count Mind and Japanese entries.
     E · Creatives  a projects goal; the goals page says what a Creatives,
                Japanese or Mind goal reads; Green and paper-score goals
                offer only the exam subjects they can measure; the type
                picker has a Japanese and a Mind group.
     Z · no errors, no request.

   Run: node tools/smoke194.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const p = (fn) => new Promise((res, rej) => fn((err, v) => (err ? rej(err) : res(v))));
let app, K, D, G;
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
const main = () => D.getElementById("main");
let nextSid = 94000;
function entry(date, type, metrics) {
  K.store.state.sessions.push({ id: nextSid++, ts: Date.parse(date + "T12:00:00"), date, type, subject: type, ref: null, dur: null, metrics: metrics || {}, award: { xp: 0, gold: 0 } });
}
async function row(id) { return (await p((cb) => G.compute(cb))).find((r) => r.id === id); }
const at = (d, h) => Date.parse(d + "T" + (h < 10 ? "0" : "") + h + ":00:00");
let week, facts;

step("boot on Wednesday 18 November 2026", async () => {
  app = await boot({ clock: "2026-11-18T10:00:00" });
  K = app.KOS; D = app.document; G = K.goals;
  await app.settle();
  week = K.report.week("2026-11-11");   // 9–15 November
});

step("A · JM-21, MI-10 (1): a new report carries Japanese and Mind facts, totals only", async () => {
  /* Japanese: two review sessions, a first lesson finish, a checkpoint and a gate; a
     session the week after and a lesson entry that is not a first finish count nothing */
  entry("2026-11-10", "ja", { kind: "session", n: 40, passed: 36, paid: 10, skills: { R: 30, W: 10 } });
  entry("2026-11-12", "ja", { kind: "session", n: 20, passed: 15, paid: 5, skills: { R: 12, L: 8 } });
  entry("2026-11-12", "ja", { kind: "lesson", id: "L1", first: true });
  entry("2026-11-13", "ja", { kind: "checkpoint", id: "C1", first: true });
  entry("2026-11-14", "ja", { kind: "gate", id: "G1", first: true });
  entry("2026-11-14", "ja", { kind: "lesson", id: "L2" });
  entry("2026-11-17", "ja", { kind: "session", n: 9, passed: 9, skills: { R: 9 } });
  /* Mind: a review block, a lesson, a checkpoint and a path */
  entry("2026-11-11", "mind", { kind: "reviews", cards: 12, passed: 10, pay: 10 });
  entry("2026-11-11", "mind", { kind: "lesson", id: "m1", first: true });
  entry("2026-11-13", "mind", { kind: "checkpoint", id: "u1", first: true });
  entry("2026-11-15", "mind", { kind: "path", id: "p1", first: true });
  /* positions: one taken this week, then revised to a new answer; one revised with the
     SAME answer (not a change); one taken the week before */
  K.store.state.mind = K.store.state.mind || {};
  K.store.state.mind.positions = {
    a: { versions: { v1: { at: at("2026-11-10", 9), answer: 0, reason: "PRIVATE-REASON" }, v2: { at: at("2026-11-12", 9), answer: 1 } } },
    b: { versions: { v1: { at: at("2026-11-11", 9), answer: 2 }, v2: { at: at("2026-11-13", 9), answer: 2 } } },
    c: { versions: { v1: { at: at("2026-11-02", 9), answer: 0 } } }
  };
  /* two Journal entries this week, one after it */
  const MJ = K.mindJournal;
  await p((cb) => MJ.put({ kind: "insight", title: "SECRET-TITLE", text: "SECRET-TEXT", at: at("2026-11-10", 20) }, cb));
  await p((cb) => MJ.put({ kind: "quote", title: "q", text: "SECRET-QUOTE", at: at("2026-11-14", 20) }, cb));
  await p((cb) => MJ.put({ kind: "question", title: "later", text: "x", at: at("2026-11-17", 20) }, cb));
  facts = await new Promise((res) => K.report.build(week, {}, res));
  eq(facts.ja, { sessions: 2, reviews: 60, passed: 51, lessons: 1, checkpoints: 2, skills: { R: 42, W: 10, L: 8 } }, "Japanese's facts");
  eq(facts.mind, { sessions: 1, reviews: 12, passed: 10, lessons: 1, checkpoints: 1, paths: 1, positions: 2, changed: 1, journal: 2 }, "Mind's facts");
  const pay = K.reportWords.payload({ facts });
  eq([pay.ja_passed, pay.ja_reviews, pay.ja_lessons, pay.ja_checkpoints, pay.mind_passed, pay.mind_positions, pay.mind_changed, pay.mind_journal],
    [51, 60, 1, 2, 10, 2, 1, 2], "the payload's totals");
  const text = JSON.stringify(pay) + JSON.stringify(facts);
  assert(!/SECRET|PRIVATE/.test(text), "no Journal entry or position's words reach the facts or the payload");
  assert(!("ja_skills" in pay), "the payload holds numbers only");
  /* no Japanese or Mind work: no section, no empty card */
  const quiet = K.report.compute({ ledger: [], rows: [], tally: {}, reminders: [], habits: [] }, K.report.week("2026-10-07"));
  assert(!quiet.ja && !quiet.mind, "a week without them has no Japanese or Mind facts");
});

step("B · the week and month pages draw a Japanese and a Mind card; an older report none", async () => {
  const rep = { id: week.id, period: "week", start: week.start, end: week.end, savedAt: at("2026-11-16", 8), facts,
    words: { mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle" } };
  await p((cb) => K.reportStore.putReport(rep, cb));
  K.show("reports", { period: "week", start: week.start }); await app.settle(); await app.settle();
  const ja = q("[data-ui~='reports.ja']"), mi = q("[data-ui~='reports.mind']");
  assert(ja && mi, "both cards on the week page");
  assert(/Reviews passed\s*51 of 60/.test(ja.textContent) && /Checkpoints passed\s*2/.test(ja.textContent), "Japanese's rows: " + ja.textContent);
  assert(/Reading/.test(ja.textContent) && /Listening/.test(ja.textContent), "reviewed by skill");
  assert(/Positions taken\s*2/.test(mi.textContent) && /Journal entries\s*2/.test(mi.textContent) && /Changed your mind\s*1 time/.test(mi.textContent), "Mind's rows: " + mi.textContent);
  assert(!/SECRET/.test(main().textContent), "no entry is quoted on the page");
  /* a month */
  const month = K.report.month("2026-11-11");
  const mf = K.report.compute({ ledger: K.store.state.sessions.slice(), rows: [], tally: {}, reminders: [], habits: [] }, month);
  await p((cb) => K.reportStore.putReport({ id: month.id, period: "month", start: month.start, end: month.end, savedAt: Date.now(), facts: mf,
    words: { mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle" } }, cb));
  K.show("reports", { period: "month", start: month.start }); await app.settle(); await app.settle();
  assert(q("[data-ui~='reports.ja']") && q("[data-ui~='reports.mind']"), "both cards on the month page");
  /* a report saved before they existed is drawn as it was saved: no card, nothing recomputed */
  const old = K.report.week("2026-10-28");
  const of = JSON.parse(JSON.stringify(facts)); delete of.ja; delete of.mind;
  Object.assign(of, { id: old.id, start: old.start, end: old.end });
  await p((cb) => K.reportStore.putReport({ id: old.id, period: "week", start: old.start, end: old.end, savedAt: at("2026-11-02", 8), facts: of,
    words: { mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle" } }, cb));
  K.show("reports", { period: "week", start: old.start }); await app.settle(); await app.settle();
  assert(!q("[data-ui~='reports.ja']") && !q("[data-ui~='reports.mind']"), "an older report has no Japanese or Mind card");
  const back = await p((cb) => K.reportStore.getReport(old.id, cb));
  assert(!back.facts.ja && !back.facts.mind, "…and its facts are untouched");
});

step("C · JM-21: Japanese's goal types read the ledger and the facets", async () => {
  ["ja-reviews", "ja-lessons", "ja-kana-held", "ja-words-stable"].forEach((id) => eq(G.typeDef(id).id, id, id + " is registered"));
  eq(G.typeDef("ja-reviews").domain, "ja", "registered by Japanese");
  entry("2026-11-16", "ja", { kind: "session", n: 30, passed: 25, skills: { R: 30 } });
  entry("2026-11-17", "ja", { kind: "lesson", id: "L3", first: true });
  const rv = G.add({ title: "JA reviews", type: "ja-reviews", target: 100, repeat: "week" });
  const ls = G.add({ title: "JA lessons", type: "ja-lessons", target: 3, repeat: "week" });
  eq((await row(rv.id))._current, 34, "reviews passed this week: 25 + 9");
  eq((await row(ls.id))._current, 1, "lessons finished this week");
  /* kana held a week (a basic kana's Reading held) and words stable (21+ days) */
  const J = K.store.state.ja = K.ja.normalise(K.store.state.ja);
  const held = { reps: 3, s: 10, firstAt: "2026-11-01", last: "2026-11-12", d: 5, due: "2026-11-25" };
  J.facets["k:あ|R"] = held; J.facets["k:い|R"] = held; J.facets["k:う|R"] = Object.assign({}, held, { s: 3 });
  const st = { reps: 4, s: 30, firstAt: "2026-10-01", last: "2026-11-10", d: 5, due: "2026-12-20" };
  J.facets["w:猫|R"] = st; J.facets["w:犬|R"] = st; J.facets["w:鳥|R"] = Object.assign({}, st, { s: 5 });
  const kh = G.add({ title: "Kana", type: "ja-kana-held", target: 92 });
  const ws = G.add({ title: "Words", type: "ja-words-stable", target: 300 });
  eq((await row(kh.id))._current, 2, "two kana held a week");
  eq((await row(ws.id))._current, 2, "two words stable");
  [rv, ls, kh, ws].forEach((g) => G.remove(g.id));
});

step("D · MI-10 (2): Mind's goal types, and the review/recall types count Mind and Japanese", async () => {
  ["mind-reviews", "mind-lessons"].forEach((id) => eq(G.typeDef(id).domain, "mind", id + " is registered by Mind"));
  entry("2026-11-17", "mind", { kind: "reviews", cards: 20, passed: 18, pay: 15 });
  entry("2026-11-17", "mind", { kind: "lesson", id: "m2", first: true });
  entry("2026-11-18", "mind", { kind: "lesson", id: "m2" });
  const rv = G.add({ title: "Mind reviews", type: "mind-reviews", target: 50, repeat: "week" });
  const ls = G.add({ title: "Mind lessons", type: "mind-lessons", target: 2, repeat: "week" });
  eq((await row(rv.id))._current, 18, "Mind reviews passed");
  eq((await row(ls.id))._current, 1, "a first finish only");
  const cr = G.add({ title: "Mind cards", type: "cards-reviewed", target: 50, repeat: "week", links: { subject: "mind" } });
  const jr = G.add({ title: "JA cards", type: "cards-reviewed", target: 50, repeat: "week", links: { subject: "ja" } });
  eq((await row(cr.id))._current, 20, "Review flashcards · Mind reads Mind's review blocks");
  eq((await row(jr.id))._current, 39, "Review flashcards · Japanese reads Japanese's sessions");
  [rv, ls, cr, jr].forEach((g) => G.remove(g.id));
});

step("E · Creatives and the goals page", async () => {
  eq(G.typeDef("cr-projects").domain, "creatives", "a Creatives projects goal");
  entry("2026-11-17", "creatives", { kind: "project", unit: "u1", key: "k", first: true });
  const pr = G.add({ title: "Projects", type: "cr-projects", target: 2, repeat: "week" });
  eq((await row(pr.id))._current, 1, "a finished project counts");
  const ja = G.add({ title: "JA reviews", type: "ja-reviews", target: 100, repeat: "week" });
  K.show("goals", { id: pr.id }); await app.settle(); await app.settle();
  assert(/Read from Creatives/.test(main().textContent) && !/Read from the Collection/.test(main().textContent), "a Creatives goal says what it reads");
  K.show("goals", { id: ja.id }); await app.settle(); await app.settle();
  assert(/Read from Japanese/.test(main().textContent), "a Japanese goal says what it reads");
  K.show("goals"); await app.settle(); await app.settle();
  const pill = qa("[data-ui~='goal.domain']").map((b) => b.textContent);
  assert(pill.some((t) => /^Japanese/.test(t)), "the domain filter offers Japanese: " + pill);
  /* the type picker */
  const add = qa("button").find((b) => /New goal/.test(b.textContent));
  assert(add, "New goal");
  add.click(); await app.settle();
  const groups = qa(".k-gl-typegroup").map((g) => g.getAttribute("aria-label"));
  assert(groups.includes("Japanese") && groups.includes("Mind"), "Japanese and Mind groups: " + groups);
  const tg = qa("[role='dialog'] button").find((b) => /Move topics to Green/.test(b.textContent));
  assert(tg, "Move topics to Green in the picker");
  tg.click(); await app.settle();
  const subj = q("[role='dialog'] select[aria-label='Subject']");
  assert(subj, "the subject picker");
  const opts = Array.from(subj.options).map((o) => o.value).filter(Boolean);
  eq(opts, K.subjects.ids("exam"), "only the exam subjects, which Green can measure");
  qa("[role='dialog'] button").filter((b) => /Cancel|Close/.test(b.textContent || b.getAttribute("aria-label") || "")).forEach((b) => b.click());
  await app.settle();
  [pr, ja].forEach((g) => G.remove(g.id));
});

step("Z · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke194: all " + steps.length + " steps passed");
  process.exit(0);
})();
