/* Kurenai OS — smoke195.test.js
   The quality audit's spaces batch, Home's half: the study spaces and
   Money join the day model, Home and the Assistant.

     A · HR-04  KOS.today.build carries each started space's daily and its
                reviews due (Code, Japanese, Mind, Creatives), in the
                ladder's order, for today only; nothing when none started.
     B · MI-10 (3) Mind's Daily 15, its cards due and a revisit due are in
                the day model.
     C · CREATIVES the Daily Creative is in the day; its theory cards are
                their own queue on Home's Review side (they leave the
                Flashcards row) and open a run of only those cards.
     D · HR-04  Money's day: null with no rules; the next bill and its
                notices; load() adds what is left this month. Home's one
                Money row in Upcoming: the next bill, else the notice, with
                left this month; Hide amounts masks it; a muted kind holds it.
     E · JM-26  the Assistant: ja_overview (stats, due by skill, today's
                plan, next lesson, the timeline as a range), ja_lesson
                (evidence, items held), today_overview reads the spaces and
                Money, a pick of today's three may be a space.
     F · reads write nothing: build, load, Home and every read tool leave
                the state document as it was.
     Z · no errors, no request.

   Run: node tools/smoke195.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const cbp = (fn) => new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v)));

const TODAY = "2026-11-16";               // a Monday
let app, K, D, W;
const $ = (s) => D.querySelector(s);
const $$ = (s) => [...D.querySelectorAll(s)];
const text = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
async function home() { K.show("home"); await app.settle(); await app.settle(); }
const tool = (n, a) => cbp((cb) => K.ai.tools.execute(n, a || {}, cb));
const snap = () => JSON.stringify(K.store.state);
let crKey;

step("boot", async () => {
  app = await boot({ clock: TODAY + "T16:40:00" });
  K = app.KOS; D = app.document; W = app.window;
  K.store.state.calendar.events = K.store.state.calendar.events.filter((e) => e.type !== "exam");
  const AS = K.store.state.exams.assessments;
  Object.keys(AS).forEach((k) => { delete AS[k]; });
  K.store.save();
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · HR-04 nothing started: no spaces, no Money in the day", async () => {
  const T = K.today.build();
  eq(T.spaces, [], "no space started");
  eq(T.money, null, "Money has no rules");
});

step("A · HR-04 each started space's daily and reviews are in the day", async () => {
  const J = K.store.state.japanese;
  const items = Object.keys(W.KOS_JA.ITEMS).slice(0, 2);
  J.facets[items[0] + "|R"] = { due: TODAY, s: 2, d: 5, reps: 2, lapses: 0, last: K.srs.addDays(TODAY, -3) };
  J.facets[items[1] + "|R"] = { due: TODAY, s: 2, d: 5, reps: 2, lapses: 0, last: K.srs.addDays(TODAY, -3) };
  const cid = Object.keys(W.KOS_MIND.CONCEPTS).filter((c) => K.mind.cardKeys(c).length)[0];
  K.store.state.mind.cards[K.mind.cardKeys(cid)[0]] = { due: TODAY, reps: 1, lapses: 0, firstAt: K.srs.addDays(TODAY, -2), s: 1, d: 5 };
  K.store.state.code.lessons["1.1"] = { pages: { 0: Date.now() } };
  const crl = K.creatives.lessons()[0].id;
  K.store.state.creatives.lessons[crl] = { pages: { 0: Date.now() } };
  crKey = K.creatives.cardKeys(crl)[0];
  K.store.state.srs[crKey] = { due: TODAY, reps: 1, s: 2, d: 5, lapses: 0 };
  K.store.save();
  const T = K.today.build();
  eq(T.spaces.map((s) => s.sid), ["code", "ja", "mind", "creatives"], "every started space, in the ladder's order");
  const ja = T.spaces.find((s) => s.sid === "ja");
  assert(ja.review && ja.review.n === 2 && /reading/.test(ja.review.sub), "Japanese reviews due by skill: " + JSON.stringify(ja.review));
  assert(/Japanese · 2 reviews/.test(ja.title) && /next H1/.test(ja.why), "Japanese's daily names the next lesson: " + ja.title + " / " + ja.why);
  const code = T.spaces.find((s) => s.sid === "code");
  assert(/Daily 20|finish/.test(code.title), "Code's Daily 20: " + code.title);
  eq(K.today.build(K.srs.addDays(TODAY, 1)).spaces, [], "another day carries no dailies (today only, as next)");
});

/* ---------------- B ---------------- */
step("B · MI-10 Mind's Daily 15, cards due and revisits are in the day", async () => {
  let mind = K.today.build().spaces.find((s) => s.sid === "mind");
  assert(mind && mind.daily === "Daily 15" && !mind.done, "the Daily 15, open: " + JSON.stringify(mind && mind.title));
  assert(mind.review && mind.review.n === 1, "Mind's cards due: " + JSON.stringify(mind.review));
  eq(mind.revisits, 0, "no revisit due yet");
  const lid = Object.keys(W.KOS_MIND.LESSONS || {}).find((id) => { const l = K.mind.lesson(id); return l && l.kind === "contested" && l.prompt; });
  assert(lid, "a contested lesson");
  assert(K.mind.takePosition(lid, { answer: 0, conf: 70 }), "a position taken");
  K.store.state.mind.positions[lid].revisit.due = TODAY;
  K.store.save();
  mind = K.today.build().spaces.find((s) => s.sid === "mind");
  eq(mind.revisits, 1, "a revisit due is counted");
  assert(/1 to revisit/.test(mind.why), "and said: " + mind.why);
});

/* ---------------- C ---------------- */
step("C · Creatives: the Daily Creative in the day, theory cards their own queue", async () => {
  const cr = K.today.build().spaces.find((s) => s.sid === "creatives");
  assert(cr.daily === "Daily Creative" && /Creatives · the Daily Creative/.test(cr.title), "the Daily Creative: " + cr.title);
  assert(cr.review && cr.review.n === 1 && cr.review.label === "Creatives", "theory cards due: " + JSON.stringify(cr.review));
  await home();
  const rows = $$("[data-ui~='home.review-row']").map((n) => n.getAttribute("data-sid"));
  assert(rows.indexOf("creatives") !== -1, "a Creatives row on the Review side: " + rows);
  assert(rows.indexOf("cards") === -1, "its card left the Flashcards row (nothing else due): " + rows);
  const all = K.today.build().spaces.reduce((n, s) => n + (s.review ? s.review.n : 0), 0);
  const tab = $$("[data-ui~='home.next'] [role='tab']").map(text).find((t) => /^Review/.test(t));
  eq(tab, "Review " + all, "the tab counts every queue once");
  click($("[data-ui~='home.review-row'][data-sid='creatives']"));
  await app.settle();
  eq(K.store.state.ui.view, "review", "it opens the review");
  assert(/1 card · Creatives/.test(text($(".k-rv-runhead"))), "a run of only Creatives' cards: " + text($(".k-rv-runhead")));
});

/* ---------------- D ---------------- */
step("D · HR-04 Money's day: next bill, notices, left this month", async () => {
  const rid = K.money.addRule({ name: "Rent", amount: "420", kind: "out", cat: "bills", start: K.srs.addDays(TODAY, 9), every: { unit: "month", n: 1 } });
  K.store.save();
  let T = K.today.build();
  assert(T.money && T.money.next && T.money.next.name === "Rent" && T.money.next.days === 9 && T.money.next.minor === 42000, "the next bill: " + JSON.stringify(T.money));
  eq(T.money.notices, [], "nothing to notice nine days out");
  await cbp((cb) => K.money.addTx({ date: TODAY, amount: "1000", kind: "in", cat: "other-in" }, cb));
  await cbp((cb) => K.money.addTx({ date: TODAY, amount: "250", kind: "out", cat: "other" }, cb));
  T = await cbp((cb) => K.today.load(null, {}, cb));
  eq(T.money.left, 75000, "load adds what is left this month");
  await home();
  const row = $("[data-ui~='home.money-line']");
  assert(row && row.closest("[data-ui~='cal.countdowns']"), "one row inside Upcoming");
  assert(/Rent · Wed 25 Nov · £420\.00/.test(text(row)), "the next bill: " + text(row));
  assert(/£750\.00 left this month/.test(text(row)), "left this month: " + text(row));
  assert(!$("[data-ui~='home.money-note']"), "no notice, so not a notice row");
  K.store.state.ui.moneyHidden = true;
  await home();
  const hid = text($("[data-ui~='home.money-line']"));
  assert(!/420|750/.test(hid) && /left this month/.test(hid), "Hide amounts masks every figure: " + hid);
  K.store.state.ui.moneyHidden = false;
  K.notify.setMuted("money", true);
  await home();
  assert(!$("[data-ui~='home.money-line']") && !$("[data-ui~='home.money-note']"), "a muted Money kind holds it");
  K.notify.setMuted("money", false);
  K.money.addRule({ name: "Gym", amount: "30", kind: "out", cat: "bills", start: K.srs.addDays(TODAY, 2), every: { unit: "month", n: 1 } });
  K.store.save();
  T = K.today.build();
  assert(T.money.notices.some((n) => /Gym/.test(n.title)), "a bill two days out is a notice in the day: " + JSON.stringify(T.money.notices));
  await home();
  const note = $("[data-ui~='home.money-note']");
  assert(note && /Gym/.test(text(note)) && /left this month/.test(text(note)), "the notice takes the row: " + text(note));
  assert(!$("[data-ui~='home.money-line']"), "one Money row, never two");
  void rid;
});

/* ---------------- E ---------------- */
step("E · JM-26 ja_overview and ja_lesson read Japanese", async () => {
  assert(K.ai.tools.get("ja_overview").read && K.ai.tools.get("ja_lesson").read, "read tier only");
  eq([K.ai.tools.get("ja_overview").tier, K.ai.tools.get("ja_lesson").tier], ["read", "read"], "read tier");
  const o = await tool("ja_overview");
  eq(o.reviewsDue, 2, "reviews due");
  eq(o.dueBySkill, { reading: 2 }, "due by skill");
  assert(o.today.reviews === 2 && o.today.learn && o.today.learn.lesson === "H1", "today's plan: " + JSON.stringify(o.today));
  eq(o.nextLesson.id, "H1", "the next lesson");
  assert(o.timeline.calibrating === true && o.timeline.wordsPerWeek === null && o.timeline.milestones.length > 3, "the timeline is a range, calibrating: " + JSON.stringify(o.timeline).slice(0, 200));
  const l = await tool("ja_lesson", { id: "H1" });
  assert(l.title && l.checks && "held" in l.checks && /\/\d+/.test(l.itemsHeld), "the evidence: " + JSON.stringify(l).slice(0, 200));
  assert(l.items.length && "held" in l.items[0] && l.items[0].reading, "each item, held or not");
  let err = null;
  try { await tool("ja_lesson", { id: "ZZ9" }); } catch (e) { err = e; }
  assert(err, "an unknown lesson is an error");
});

step("E · today_overview reads the spaces and Money; a pick may be a space", async () => {
  K.dayReview.enable(true);
  const t = await tool("today_overview");
  eq(t.spaces.map((s) => s.space), ["Code", "Japanese", "Mind", "Creatives"], "every space");
  const ja = t.spaces.find((s) => s.space === "Japanese");
  eq(ja.reviewsDue, 2, "Japanese reviews due");
  eq(t.spaces.find((s) => s.space === "Mind").revisitsDue, 1, "Mind's revisit");
  assert(t.money && t.money.nextBill && t.money.nextBill.name && t.money.leftThisMonth === "£750.00", "Money's day: " + JSON.stringify(t.money));
  assert(t.money.notices.some((n) => /Gym/.test(n)), "its notices");
  const r = await tool("review_set_three", { refs: [{ kind: "space", id: "ja" }] });
  assert(r.three.length === 1 && /Japanese/.test(r.three[0].title), "a space as one of today's three: " + JSON.stringify(r.three));
  const c = await tool("creatives_overview");
  eq(c.today.done, false, "creatives_overview says today's Daily Creative is not done");
});

/* ---------------- F ---------------- */
step("F · reads write nothing", async () => {
  await home();
  const before = snap();
  K.today.build(); K.today.build(K.srs.addDays(TODAY, 1));
  await cbp((cb) => K.today.load(null, {}, cb));
  K.rerender(); await app.settle(); await app.settle();
  for (const n of ["ja_overview", "creatives_overview", "today_overview"]) await tool(n);
  await tool("ja_lesson", { id: "H1" });
  await app.settle();
  eq(snap() === before, true, "the state document is as it was");
});

/* ---------------- Z ---------------- */
step("Z · no errors, no request", async () => {
  await app.settle();
  eq(app.errors, [], "errors");
  eq(app.fetches.length, 0, "requests");
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke195: all " + steps.length + " steps passed");
  process.exit(0);
})();
