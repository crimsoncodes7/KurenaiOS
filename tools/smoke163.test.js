/* Kurenai OS — smoke163.test.js
   Design turn 40: Home reads every study space, and Focus minimised.

   The claims:

     A · THE SPACES' DAILIES ARE RUNGS. KOS.today.spaces() lists only the
         spaces that have been started, in the ladder's order (Code's Daily
         20, Japanese, Mind's Daily 15, the Daily Creative); Home's Up next
         takes the first one not done after an assignment due within a week
         and before the next exam within six weeks, says "Then" for the
         rest, and opens the space itself (its own session, never Focus).
     B · THE REVIEW SIDE IS SPLIT BY SPACE. One row a queue — Japanese,
         Code's retrieval, Mind's cards — each opening its own review; the
         tab counts them all.
     C · TODAY'S THREE TAKES A SPACE. A pick of kind "space" resolves from
         the space (done read, never ticked), draws its mark and opens the
         space; the review's suggestions offer the open ones.
     D · MONEY SPEAKS ONLY WITH A NOTICE, inside Upcoming: none without
         one, Hide amounts leaves the figure out, a muted Money kind says
         nothing.
     E · FOCUS, MINIMISED. #/focus under a running session draws the live
         card (clock, objective, notes, Switch…, End early, Return to the
         stage) beside the record and the deal, live; the mini-player hides
         on this page and comes back on leaving.
     F · READS WRITE NOTHING: drawing Home and the spaces' rows leaves the
         state document as it was.
     G · THE WARDROBE FITS WHAT YOU OWN (40c): no cell for a kind owned
         none of — its word sits on "Not owned yet", which ends "Gold Shop
         →"; Frames is a kind ("No frame" and the owned ones, the worn one
         pressed); Theme is one cell with its swatches and Follow the
         system, whose line follows the switch.
     H · EDIT YOUR SEAT SAVES ONLY A CHANGE (40d–40e): Save is disabled
         until the draft differs from what is saved.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke163.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-11-16";               // a Monday
let app, K, doc, W;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
const text = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
async function home() { K.show("home"); await app.settle(); }
function view() { return K.store.state.ui.view; }

/* a Japanese facet due today, a Mind card due today, Code begun */
function startSpaces() {
  const J = K.store.state.japanese;
  /* two items: two facets of one item never share a day (invariant 113) */
  const items = Object.keys(W.KOS_JA.ITEMS).slice(0, 2);
  J.facets[items[0] + "|R"] = { due: TODAY, s: 2, d: 5, reps: 2, lapses: 0, last: K.srs.addDays(TODAY, -3) };
  J.facets[items[1] + "|R"] = { due: TODAY, s: 2, d: 5, reps: 2, lapses: 0, last: K.srs.addDays(TODAY, -3) };
  const cid = Object.keys(W.KOS_MIND.CONCEPTS).filter((c) => K.mind.cardKeys(c).length)[0];
  K.store.state.mind.cards[K.mind.cardKeys(cid)[0]] = { due: TODAY, reps: 1, lapses: 0, firstAt: K.srs.addDays(TODAY, -2), s: 1, d: 5 };
  K.store.state.code.lessons["1.1"] = { pages: { 0: Date.now() } };
  K.store.save();
}

step("boot", async () => {
  app = await boot({ clock: TODAY + "T16:40:00" });
  K = app.KOS; doc = app.document; W = app.window;
  /* the boot's sample exams sit inside their lead time and outrank every
     later rung: this suite's day has none */
  K.store.state.calendar.events = K.store.state.calendar.events.filter((e) => e.type !== "exam");
  const AS = K.store.state.exams.assessments;
  Object.keys(AS).forEach((k) => { delete AS[k]; });
  K.store.save();
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · no space started: no rung, no row", async () => {
  eq(K.today.spaces(), [], "nothing started");
  await home();
  assert(K.homeFocusPlan().kind !== "space", "no space rung");
  assert(!$("[data-ui~='home.review-row'][data-sid='ja']"), "no Japanese row");
});
step("A · started spaces are rungs, in the ladder's order", async () => {
  startSpaces();
  const sp = K.today.spaces();
  eq(sp.map((s) => s.sid), ["code", "ja", "mind"], "only the started spaces, in order");
  eq(sp.map((s) => s.mark), ["碼", "語", "心"], "each space's mark");
  const p = K.homeFocusPlan();
  eq([p.kind, p.space, p.own], ["space", "code", true], "Code's Daily 20 first");
  assert(/finish 1\.1 first/.test(p.label), "nothing covered: the lesson to finish — " + p.label);
  eq(p.then.map((t) => t.sid), ["ja", "mind"], "Then: the rest");
  K.store.state.ui.homeMode = null;
  await home();
  click($$("[data-ui~='home.next'] [role='tab']")[0]); await app.settle();
  assert($("[data-ui~='home.next-label'] .k-space-mark"), "the rung draws its mark");
  assert(/語/.test(text($("[data-ui~='home.next-then']"))), "the Then row");
  const go = $("[data-ui~='home.next-go']");
  assert(/Open the Daily 20/.test(text(go)), "the space's own button: " + text(go));
  click(go); await app.settle();
  eq(view(), "ref", "it opens the lesson, not Focus");
});
step("A · an assignment due in a week outranks a space; a space outranks a later exam", async () => {
  const a = K.assignments.add({ title: "Stats homework", subject: "maths", due: K.srs.addDays(TODAY, 3), estimateMins: 45 });
  eq(K.homeFocusPlan().kind, "assignment", "the assignment first");
  K.assignments.remove ? K.assignments.remove(a.id) : K.assignments.setStatus(a.id, "complete");
  K.calendar.addEvent({ title: "CS mock", type: "exam", date: K.srs.addDays(TODAY, 30), subject: "compsci" });
  eq(K.homeFocusPlan().kind, "space", "the space before an exam a month out");
});

/* ---------------- B ---------------- */
step("B · the Review side: a row a queue, each opening its review", async () => {
  await home();
  const tabs = $$("[data-ui~='home.next'] [role='tab']");
  const revTab = tabs[1];
  const ja = K.today.space("ja").review.n, mi = K.today.space("mind").review.n;
  assert(ja === 2 && mi === 1, "the queues: " + ja + ", " + mi);
  const due = K.srs.dueCards().length;
  eq(text(revTab), "Review " + (due + ja + mi), "the tab counts every queue");
  click(revTab); await app.settle();
  const rows = $$("[data-ui~='home.review-row']");
  eq(rows.filter((r) => r.getAttribute("data-sid") !== "cards").map((r) => r.getAttribute("data-sid")), ["ja", "mind"], "Japanese and Mind rows");
  const jr = rows.filter((r) => r.getAttribute("data-sid") === "ja")[0];
  assert(/2 reading/.test(text(jr)), "the Japanese row says its count by skill: " + text(jr));
  click(jr); await app.settle();
  eq(view(), "japanese", "the Japanese row opens Japanese's reviews");
  await home();
  click($$("[data-ui~='home.review-row']").filter((r) => r.getAttribute("data-sid") === "mind")[0]); await app.settle();
  eq(view(), "mind", "the Mind row opens Mind's cards");
});

/* ---------------- C ---------------- */
step("C · Today's three takes a space, read and opened, never ticked", async () => {
  K.dayReview.enable(true);
  K.dayReview.setThree([{ kind: "space", id: "ja" }]);
  const r = K.dayReview.resolve({ kind: "space", id: "ja" });
  assert(r && /^Japanese · 2 reviews/.test(r.title) && r.done === false, "resolved from the space: " + JSON.stringify(r));
  await home();
  const row = $("[data-ui~='home.three']");
  assert(row && row.querySelector(".k-space-mark") && /語/.test(text(row)), "the row draws its mark");
  const before = JSON.stringify(K.store.state.japanese);
  click(row); await app.settle();
  eq(view(), "japanese", "a space pick opens the space");
  eq(JSON.stringify(K.store.state.japanese), before, "nothing ticked");
  K.dayReview.setThree([]);
  const st = (K.dayReview.content("morning").steps || []).filter((x) => x.id === "three")[0];
  assert(st, "the morning review has its three step");
  const offered = st.suggestions.filter((x) => x.ref.kind === "space").map((x) => x.ref.id);
  assert(offered.indexOf("ja") !== -1 && offered.indexOf("mind") !== -1, "the review offers the open dailies: " + JSON.stringify(offered));
});

/* ---------------- D ---------------- */
step("D · Money speaks only with a notice, masked by Hide amounts", async () => {
  await home();
  assert(!$("[data-ui~='home.money-note']"), "no notice, no row");
  K.money.addRule({ name: "Rent", amount: "420", kind: "out", cat: "bills", start: K.srs.addDays(TODAY, 2), every: { unit: "month", n: 1 } });
  K.store.save();
  await home();
  const m = $("[data-ui~='home.money-note']");
  assert(m && /Rent/.test(text(m)) && /420/.test(text(m)), "the notice inside Upcoming: " + text(m));
  assert(m.closest("[data-ui~='cal.countdowns']"), "inside Upcoming, no new card");
  K.store.state.ui.moneyHidden = true;
  await home();
  assert(!/420|£/.test(text($("[data-ui~='home.money-note']"))), "Hide amounts leaves the figure out");
  K.store.state.ui.moneyHidden = false;
  K.notify.setMuted("money", true);
  await home();
  assert(!$("[data-ui~='home.money-note']"), "a muted Money kind says nothing");
  K.notify.setMuted("money", false);
});

/* ---------------- E ---------------- */
step("E · Focus, minimised: the live card, the record and the deal", async () => {
  K.focus.start({ mode: "pomodoro", subject: "compsci", workMin: 25, breakMin: 5, objective: "Q4–6 array stack", minimised: true });
  await app.settle();
  K.show("focus"); await app.settle();
  const live = $("[data-ui~='focus.live']");
  assert(live, "the live card");
  assert(!$("[data-ui~='focus.setup']"), "no second set-up under a live session");
  assert(/On the mini-player/i.test(text(live)), "it says where the player is");
  assert(/Q4–6 array stack/.test(text(live)), "the objective");
  for (const h of ["focus.live-clock", "focus.live-switch", "focus.live-end", "focus.live-return", "focus.note-in"]) assert(live.querySelector("[data-ui~='" + h + "']"), "has " + h);
  assert($("[data-ui~='focus.record']") && $("[data-ui~='focus.live-deal']"), "the record and the deal stay");
  assert($("[data-ui~='focus.live-sofar']"), "the deal's live line");
  assert(doc.documentElement.hasAttribute("data-fx-page"), "the mini-player steps aside on this page");
  const n = live.querySelector("[data-ui~='focus.note-in']");
  n.value = "isFull before push";
  n.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await app.settle();
  eq(K.focus.notes().map((x) => x.text), ["isFull before push"], "a note kept from the page");
  assert(/isFull before push/.test(text($("[data-ui~='focus.live']"))), "and drawn");
  await home();
  assert(!doc.documentElement.hasAttribute("data-fx-page"), "the mini-player returns on leaving");
  K.focus.endEarly({ confirmed: true, review: false });
  await app.settle();
});

/* ---------------- F ---------------- */
step("F · reads write nothing", async () => {
  await home();
  const before = JSON.stringify(K.store.state);
  K.today.spaces(); K.homeFocusPlan();
  K.dayReview.resolve({ kind: "space", id: "mind" });
  await home();
  eq(JSON.stringify(K.store.state), before, "Home and the spaces' reads leave the state as it was");
  eq(app.errors, [], "no page errors");
});

/* ---------------- G ---------------- */
step("G · the Wardrobe: cells only for owned kinds, Frames a kind, Theme one cell", async () => {
  K.show("governor", "avatar"); await app.settle();
  const none = $("[data-ui~='gov.wardrobe-none']");
  assert(none && /^Not owned yet:/.test(text(none)) && /Gold Shop →$/.test(text(none)), "the not-owned line: " + text(none));
  const notOwned = [...none.querySelectorAll("[data-kind]")].map((n) => n.getAttribute("data-kind"));
  assert(notOwned.indexOf("frame") !== -1, "no frame owned: Frames is a word on the line");
  notOwned.forEach((k) => assert(!$(".k-gv-ward-row[data-kind='" + k + "']"), "no cell for " + k));
  const theme = $("[data-ui~='gov.theme-section']");
  assert(theme && theme.querySelector("[data-ui~='gov.theme-grid']") && theme.querySelector("[data-ui~='gov.theme-follow']"), "Theme is one cell: swatches and the switch");
  const st0 = text(theme.querySelector("[data-ui~='gov.theme-follow-state']"));
  const sw = theme.querySelector("[data-ui~='gov.theme-follow']");
  sw.checked = !sw.checked; sw.dispatchEvent(new app.window.Event("change", { bubbles: true })); await app.settle();
  const st1 = text($("[data-ui~='gov.theme-follow-state']"));
  assert(st0 !== st1, "the switch's line follows it: " + st0 + " → " + st1);
  const sw2 = $("[data-ui~='gov.theme-follow']");
  sw2.checked = !sw2.checked; sw2.dispatchEvent(new app.window.Event("change", { bubbles: true })); await app.settle();
  /* own a frame: Frames becomes a cell, No frame first and pressed */
  const fr = K.governor.catalog().filter((c) => c.kind === "frame" && !c.retired)[0] || K.governor.catalog().filter((c) => c.kind === "frame")[0];
  K.store.state.governor.owned = (K.store.state.governor.owned || []).concat([fr.id]);
  K.store.save();
  K.show("governor", "avatar"); await app.settle();
  const cell = $(".k-gv-ward-row[data-kind='frame']");
  assert(cell, "an owned frame makes Frames a cell");
  const chips = [...cell.querySelectorAll("[data-ui~='gov.frame-grid'] button")];
  assert(chips.length === 2 && /No frame/.test(text(chips[0])) && chips[0].getAttribute("aria-pressed") === "true", "No frame first, worn: " + chips.map(text));
  assert(!$("[data-ui~='gov.wardrobe-none'] [data-kind='frame']"), "and leaves the not-owned line");
});

/* ---------------- H ---------------- */
step("H · Edit your seat: Save only once something changed", async () => {
  K.show("governor", "edit"); await app.settle();
  const save = $("[data-ui~='gov.seat-save']");
  assert(save && save.disabled, "Save is disabled with nothing changed");
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
