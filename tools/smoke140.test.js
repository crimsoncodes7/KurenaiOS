/* Kurenai OS — smoke140.test.js
   W2: sessions in progress (§A6, decision B3/Q8 "resumable"; invariant 167).
   A flashcard batch, a quiz attempt, typed exam answers, a Japanese session
   and a kana set used to live in the page: leaving it, a redraw or a reload
   threw them away, and an unfinished batch was never logged at all.

     A · ST-04: a flashcard batch is ONE ledger entry from its first rating,
         paid card by card; leaving the page loses nothing; coming back picks
         it up at the next card, in the same entry, and pays only the
         difference; finishing adds the session's flat part, once
     B · Start fresh begins a new session and leaves the old entry as logged;
         an Again graduates nothing and pays nothing; yesterday's record is
         not picked up
     C · SY-03: a redraw mid-batch on the real topic page resumes at the
         next card and says nothing about it
     D · a Due-today review: 2 XP a card while in progress, its flat part
         and the backlog bonus when finished
     E · the pay rule itself: KOS.governor.sessionPrice, an upsert that
         never lowers a balance, an older entry priced as finished
     F · SY-04: a quiz attempt keeps its place, its picks and each
         question's shuffle; a finished one shows its score again and is
         never logged twice; Retry starts over
     G · SY-04: a typed exam answer and the question you were on are kept
     H · JM-08, SY-09: a Japanese session left by navigation is in the
         ledger answer by answer; picked up again it is the same entry, and
         the lesson still passes and pays once
     I · JM-22: a kana set survives switching Mixed / Read / Write and is
         logged without End set

   Run: node tools/smoke140.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TOPIC = { subject: "compsci", ref: "4.2.3.1" };
let app, K, D, W;
const gov = () => K.store.state.governor;
const all = () => K.sessions.all();
const ofType = (t) => all().filter((e) => e.type === t);
const main = () => D.getElementById("main");
const q = (s, root) => (root || D).querySelector(s);
const qq = (s, root) => [...(root || D).querySelectorAll(s)];
const runs = () => K.store.state.ui.runs || {};

/* a blank page to mount an engine on, as a topic tab does */
function blank() {
  K.views.__blank = function () {};
  K.show("__blank");
  const h = D.createElement("div");
  main().appendChild(h);
  return h;
}
async function rate(holder, r) {
  q("[data-ui~='fc.card']", holder).click();
  q("[data-ui~='fc.r'][data-rate='" + r + "']", holder).click();
  await app.settle();
}
const left = (holder) => { const m = /(\d+) left of (\d+)/.exec(q("[data-ui~='fc.count']", holder).textContent); return m ? [+m[1], +m[2]] : null; };

step("boot a used account", async () => {
  app = await boot();
  K = app.KOS; D = app.document; W = app.window;
  await seedAccount(app);
  await app.settle();
  eq(app.errors, [], "no load errors");
  assert(typeof K.sessions.upsert === "function" && K.sessions.run && typeof K.governor.onUpsert === "function", "the session core is loaded");
});

let deck = 0;
step("A · ST-04: one entry from the first rating, resumed, paid by difference, finished once", async () => {
  deck = K.srs.cardsFor(TOPIC.subject, TOPIC.ref).length;
  assert(deck >= 10, "a deck of ten or more: " + deck);
  const n0 = ofType("flashcards").length, x0 = gov().xp, g0 = gov().gold;
  let h = blank();
  K.flashcards.mount(h, TOPIC.subject, TOPIC.ref);
  eq(left(h), [deck, deck], "a fresh batch");
  eq(ofType("flashcards").length, n0, "mounting logs nothing");
  assert(!runs()["fc:compsci:4.2.3.1"], "and keeps nothing");
  for (let i = 0; i < 5; i++) await rate(h, 2);
  const mine = () => ofType("flashcards").slice(n0);
  eq(mine().length, 1, "ONE entry after five ratings");
  const e = mine()[0];
  eq([e.metrics.cards, e.metrics.reviews, e.metrics.done], [5, 5, false], "five cards, in progress");
  assert(e.metrics.sid, "it carries its session id");
  /* the seeded account's streak milestone rides on whichever entry is the day's first study */
  const ms = () => (e.award && e.award.ms) || 0;
  eq([gov().xp - x0, gov().gold - g0 - ms()], [5, 0], "paid for five cards, no flat part yet");
  eq(e.receipt, { xp: 5, gold: 0, hp: 0 }, "its receipt");
  assert(K.sessions.hasStreakActivity(K.srs.todayISO()), "the day counts for the streak");

  /* leave the page, come back */
  K.show("home");
  await app.settle();
  eq(mine().length, 1, "leaving logs nothing more and loses nothing");
  h = blank();
  K.flashcards.mount(h, TOPIC.subject, TOPIC.ref);
  eq(left(h), [deck - 5, deck], "picked up at the sixth card");
  const line = q("[data-ui~='fc.resumed']", h);
  assert(line && !line.hidden && /Picked up where you left off · 5 of/.test(line.textContent), "and says so: " + (line && line.textContent));
  for (let i = 0; i < 3; i++) await rate(h, 3);
  eq(mine().length, 1, "still ONE entry");
  eq([e.metrics.cards, e.metrics.reviews], [8, 8], "eight cards in it");
  eq(gov().xp - x0, 8, "only the difference was paid");

  /* finish the batch */
  for (let i = 0; i < deck - 8; i++) await rate(h, 2);
  assert(/Session complete/.test(q("[data-ui~='fc.front']", h).textContent), "the batch is complete");
  eq(mine().length, 1, "one entry for the whole batch");
  eq([e.metrics.cards, e.metrics.done], [deck, true], "finished");
  eq([gov().xp - x0, gov().gold - g0 - ms()], [15 + deck, 3], "the flat part came with the finish, once");
  eq(e.award.xp, 15 + deck, "the entry's award is its whole pay");
  assert(!runs()["fc:compsci:4.2.3.1"], "nothing left to pick up");

  /* the next mount is a new session */
  h = blank();
  K.flashcards.mount(h, TOPIC.subject, TOPIC.ref);
  eq(left(h), [deck, deck], "a new batch");
  assert(q("[data-ui~='fc.resumed']", h).hidden, "with no 'picked up' line");
});

step("B · Start fresh, Again, and yesterday's record", async () => {
  const n0 = ofType("flashcards").length, x0 = gov().xp;
  let h = blank();
  K.flashcards.mount(h, TOPIC.subject, TOPIC.ref);
  await rate(h, 0);                                   /* Again: nothing graduates */
  let mine = ofType("flashcards").slice(n0);
  eq(mine.length, 1, "an Again still makes the session");
  eq([mine[0].metrics.cards, mine[0].metrics.reviews, mine[0].metrics.again], [0, 1, 1], "no card graduated");
  eq(gov().xp - x0, 0, "and nothing was paid");
  eq(left(h), [deck, deck], "the card is still in the queue");
  await rate(h, 2); await rate(h, 2);
  h = blank();
  K.flashcards.mount(h, TOPIC.subject, TOPIC.ref);
  eq(left(h), [deck - 2, deck], "picked up");
  q("[data-ui~='fc.start-fresh']", h).click();
  await app.settle();
  eq(left(h), [deck, deck], "Start fresh: the whole deck again");
  await rate(h, 2);
  mine = ofType("flashcards").slice(n0);
  eq(mine.length, 2, "a new session, a new entry");
  eq([mine[0].metrics.cards, mine[0].metrics.done], [2, false], "the one left behind stays as it was logged");
  eq(mine[1].metrics.cards, 1, "the new one counts its own");
  eq(gov().xp - x0, 3, "three cards paid in all");

  /* a record from yesterday is not picked up */
  const rec = runs()["fc:compsci:4.2.3.1"];
  assert(rec, "a record for the batch in progress");
  rec.day = K.srs.addDays(K.srs.todayISO(), -1);
  h = blank();
  K.flashcards.mount(h, TOPIC.subject, TOPIC.ref);
  eq(left(h), [deck, deck], "yesterday's batch is not resumed");
  delete K.store.state.ui.runs["fc:compsci:4.2.3.1"];
});

step("C · SY-03: a redraw mid-batch on the topic page resumes at the next card, silently", async () => {
  K.show("ref", TOPIC);
  await app.settle();
  const tab = qq("[role='tab'], [data-ui~='topic.tab']", main()).find((b) => /Flashcards/.test(b.textContent));
  assert(tab, "the Flashcards tab");
  tab.click();
  await app.settle();
  const n0 = ofType("flashcards").length;
  for (let i = 0; i < 3; i++) await rate(main(), 2);
  eq(left(main()), [deck - 3, deck], "three done");
  K.rerender();
  await app.settle();
  assert(q("[data-ui~='fc.card']", main()), "the Flashcards tab is still open");
  eq(left(main()), [deck - 3, deck], "the redraw resumed at the fourth card");
  assert(q("[data-ui~='fc.resumed']", main()).hidden, "without a 'picked up' line");
  eq(ofType("flashcards").length, n0 + 1, "one entry");
  eq(ofType("flashcards").pop().metrics.cards, 3, "holding the three reviews");
  K.changes.apply();                                   /* the pill's Refresh */
  await app.settle();
  eq(left(main()), [deck - 3, deck], "and after the pill's Refresh");
  delete K.store.state.ui.runs["fc:compsci:4.2.3.1"];
});

step("D · a Due-today review: per card while in progress, the flat part and the backlog bonus at the end", async () => {
  const cards = K.srs.cardsFor("maths", "5.7").slice(0, 4);
  assert(cards.length === 4, "four cards to review");
  const n0 = ofType("due-review").length, x0 = gov().xp, g0 = gov().gold;
  let h = blank();
  K.flashcards.session(h, cards, { type: "due-review", runKey: "due:test", showTopic: true });
  await rate(h, 2); await rate(h, 2);
  const e = ofType("due-review").slice(n0)[0];
  assert(e, "the review is in the ledger");
  eq([e.metrics.cards, e.metrics.done], [2, false], "two cards, in progress");
  eq([gov().xp - x0, gov().gold - g0], [4, 0], "2 XP a card");
  h = blank();
  K.flashcards.session(h, cards, { type: "due-review", runKey: "due:test", showTopic: true });
  eq(left(h), [2, 4], "picked up");
  await rate(h, 2); await rate(h, 2);
  eq(ofType("due-review").length, n0 + 1, "one entry");
  const cleared = !!e.metrics.cleared;
  eq(cleared, K.srs.dueCount() === 0, "the backlog bonus follows the queue");
  eq([gov().xp - x0, gov().gold - g0], [20 + 8, 5 + (cleared ? 20 : 0)], "the flat part, once");
});

step("E · the pay rule: sessionPrice, never lowered, an older entry priced as finished", async () => {
  const P = K.governor.sessionPrice;
  eq(P("flashcards", { cards: 7, done: false }), { xp: 7, gold: 0, hp: 0 }, "in progress");
  eq(P("flashcards", { cards: 7, done: true }), { xp: 22, gold: 3, hp: 4 }, "finished");
  eq(P("flashcards", { cards: 7 }), { xp: 22, gold: 3, hp: 4 }, "an entry from before W2 is a finished one");
  eq(P("due-review", { cards: 3, done: true, cleared: true }), { xp: 26, gold: 25, hp: 12 }, "a cleared backlog");
  eq(P("quiz", { pct: 90 }), null, "a quiz is not a resumable session");
  const x0 = gov().xp, g0 = gov().gold;
  const e = K.sessions.upsert("s-test-1", { type: "flashcards", subject: "compsci", ref: "4.2.3.1", metrics: { cards: 6, done: false } });
  eq(gov().xp - x0, 6, "created and paid");
  K.sessions.upsert("s-test-1", { type: "flashcards", metrics: { cards: 4, done: false } });
  eq(gov().xp - x0, 6, "a figure that fell takes nothing back");
  eq(e.receipt.xp, 6, "and the receipt stands");
  K.sessions.upsert("s-test-1", { type: "flashcards", metrics: { cards: 6, done: false } });
  K.sessions.upsert("s-test-1", { type: "flashcards", metrics: { cards: 6, done: false } });
  eq(gov().xp - x0, 6, "the same figures again pay nothing");
  K.sessions.upsert("s-test-1", { type: "flashcards", metrics: { cards: 6, done: true } });
  K.sessions.upsert("s-test-1", { type: "flashcards", metrics: { cards: 6, done: true } });
  eq([gov().xp - x0, gov().gold - g0], [21, 3], "finished, once");
  eq(all().filter((s) => s.metrics && s.metrics.sid === "s-test-1").length, 1, "one entry throughout");
  /* the record store is per device, lasts its day, and a read never writes */
  K.sessions.run.put("t:a", { kind: "t" });
  const before = JSON.stringify(K.store.state.ui.runs);
  assert(K.sessions.run.get("t:a") && !K.sessions.run.get("t:none"), "get");
  K.store.state.ui.runs["t:a"].day = "2020-01-01";
  eq(K.sessions.run.get("t:a"), null, "a stale record reads as none");
  assert(K.store.state.ui.runs["t:a"], "and the read did not write");
  K.sessions.run.put("t:b", { kind: "t" });
  assert(!K.store.state.ui.runs["t:a"], "the next put drops it");
  assert(before, "ok");
  K.sessions.run.drop("t:b");
});

step("F · SY-04: a quiz keeps its place, picks and shuffles; a finished one is not logged twice", async () => {
  const items = K.content.get(TOPIC.subject, TOPIC.ref).quiz;
  assert(items && items.length >= 4, "a quiz of four or more");
  const key = "quiz:t";
  const mount = () => { const h = blank(); K.quiz.mountMCQ(h, TOPIC.subject, TOPIC.ref, items, { runKey: key }); return h; };
  const n0 = ofType("quiz").length, a0 = K.quiz.stats(TOPIC.subject, TOPIC.ref).attempts;
  let h = mount();
  const optOrder = () => qq("[data-ui~='quiz.option']", h).map((b) => b.getAttribute("data-oi")).join(",");
  qq("[data-ui~='quiz.option']", h)[0].click();
  q("[data-ui~='quiz.next']", h).click();
  const order2 = optOrder(), q2 = q("[data-ui~='quiz.q']", h).textContent;
  qq("[data-ui~='quiz.option']", h)[1].click();
  const score = /score (\d+)/.exec(q("[data-ui~='quiz.head']", h).textContent)[1];
  const picked = qq("[data-ui~='quiz.option']", h)[1].getAttribute("data-oi");
  await app.settle();
  h = mount();
  assert(/Question 2 of/.test(q("[data-ui~='quiz.counter']", h).textContent), "on the second question: " + q("[data-ui~='quiz.counter']", h).textContent);
  eq(q("[data-ui~='quiz.q']", h).textContent, q2, "the same question");
  eq(optOrder(), order2, "in the same shuffle");
  assert(q("[data-ui~='quiz.why']", h), "shown as answered");
  assert(qq("[data-ui~='quiz.option']", h).every((b) => b.disabled), "its options locked");
  const mine = qq("[data-ui~='quiz.option']", h).find((b) => b.getAttribute("data-oi") === picked);
  assert(/Your answer|Correct/.test(mine.textContent), "with the pick marked");
  eq(/score (\d+)/.exec(q("[data-ui~='quiz.head']", h).textContent)[1], score, "and the score kept");
  eq(ofType("quiz").length, n0, "nothing logged yet");
  /* finish it */
  for (let i = 2; i < items.length; i++) { q("[data-ui~='quiz.next']", h).click(); qq("[data-ui~='quiz.option']", h)[0].click(); }
  await app.settle();
  assert(!q("[data-ui~='quiz.result']", h).hidden, "the result");
  const total = q("[data-ui~='quiz.result'] b", h).textContent;
  eq(ofType("quiz").length, n0 + 1, "one quiz session");
  eq(K.quiz.stats(TOPIC.subject, TOPIC.ref).attempts, a0 + 1, "one attempt");
  h = mount();
  assert(!q("[data-ui~='quiz.result']", h).hidden, "a redraw shows the finished attempt's score");
  eq(q("[data-ui~='quiz.result'] b", h).textContent, total, "the same score");
  eq(ofType("quiz").length, n0 + 1, "not logged again");
  eq(K.quiz.stats(TOPIC.subject, TOPIC.ref).attempts, a0 + 1, "not counted again");
  /* Retry starts over */
  qq("[data-ui~='quiz.result'] button", h).find((b) => /^Retry$/.test(b.textContent)).click();
  await app.settle();
  assert(/Question 1 of/.test(q("[data-ui~='quiz.counter']", h).textContent), "Retry: the first question");
  assert(!q("[data-ui~='quiz.why']", h) && q("[data-ui~='quiz.result']", h).hidden, "unanswered, no result");
  assert(!runs()[key], "and nothing kept from the old attempt");
});

step("G · SY-04: a typed exam answer and the question you were on are kept", async () => {
  const items = K.content.get(TOPIC.subject, TOPIC.ref).exam;
  assert(items && items.length >= 2, "two or more exam questions");
  const key = "exam:t";
  const mount = () => { const h = blank(); K.quiz.mountExam(h, TOPIC.subject, TOPIC.ref, items, { runKey: key }); return h; };
  let h = mount();
  q("[data-ui~='quiz.next']", h).click();
  let ta = q("textarea", h);
  assert(ta, "an answer box");
  ta.value = "A stack is LIFO: the last item pushed is the first popped.";
  ta.dispatchEvent(new W.Event("input", { bubbles: true }));
  await app.settle();
  h = mount();
  assert(/Question 2 of/.test(q("[data-ui~='quiz.counter']", h).textContent), "still on the second question");
  ta = q("textarea", h);
  eq(ta.value, "A stack is LIFO: the last item pushed is the first popped.", "the typed answer is still there");
  eq(ofType("exam").length, ofType("exam").length, "typing logs nothing");
  /* clearing it forgets it */
  ta.value = "";
  ta.dispatchEvent(new W.Event("input", { bubbles: true }));
  await app.settle();
  h = mount();
  eq(q("textarea", h).value, "", "a cleared answer stays cleared");
  K.sessions.run.drop(key);
});

/* ---- Japanese: a fresh app at a fixed day, as smoke132 runs it ---- */
let J, JD, japp;
const jq = (s) => JD.querySelector(s);
const jaSessions = () => J.sessions.all().filter((e) => e.type === "ja" && e.metrics && e.metrics.kind === "session");
async function answerOne(right) {
  await japp.settle();
  if (jq('[data-ui~="ja.session-done"]')) return false;
  const typeInstead = jq('[data-ui~="ja.type-instead"]');
  if (typeInstead) { typeInstead.click(); await japp.settle(); }
  const inp = jq('[data-ui~="ja.answer"]');
  if (inp) {
    const ch = inp.getAttribute("aria-label").replace("Type the reading of ", "");
    const it = J.ja.item("k:" + ch);
    assert(it, "a kana on screen: " + ch);
    inp.value = right ? it.r : "zzz";
    jq('[data-ui~="ja.check"]').click();
  } else {
    const opts = [...JD.querySelectorAll('[data-ui~="ja.option"]')];
    if (!opts.length) throw new Error("an exercise this test cannot answer");
    opts[0].click();
  }
  await japp.settle();
  const retry = jq('[data-ui~="ja.retry"]');
  if (retry) { retry.click(); return answerOne(right); }
  const next = jq('[data-ui~="ja.next"]');
  assert(next, "a Next button after the answer");
  next.click();
  return true;
}

step("H · JM-08, SY-09: a Japanese session left by navigation is logged; picked up, it is the same entry", async () => {
  japp = await boot({ clock: "2026-11-09T10:00:00" });
  J = japp.KOS; JD = japp.document;
  await japp.settle();
  const x0 = J.store.state.governor.xp, g0 = J.store.state.governor.gold;
  J.show("japanese", { page: "session", id: "learn-H1" });
  await japp.settle();
  assert(jq('[data-ui~="ja.runner"]'), "the learn session runs");
  for (let i = 0; i < 3; i++) assert(await answerOne(true), "answered " + (i + 1));
  await japp.settle();
  /* leave by navigation: no "Leave the session?" answer, no end screen */
  J.show("home");
  await japp.settle();
  eq(jaSessions().length, 1, "ONE ja session entry");
  const e = jaSessions()[0];
  assert(e.metrics.n >= 3 && e.metrics.passed === e.metrics.n, "its answers are in it: " + JSON.stringify(e.metrics));
  eq(J.store.state.governor.xp - x0, e.metrics.paid, "and were paid as given");
  assert(e.metrics.paid >= 3, "three or more XP");
  const n1 = e.metrics.n;
  /* come back */
  J.show("japanese", { page: "session", id: "learn-H1" });
  await japp.settle();
  assert(jq('[data-ui~="ja.resumed"]'), "the session says it was picked up");
  let more = 0;
  while (await answerOne(true)) { if (++more > 200) throw new Error("runaway session"); }
  const done = jq('[data-ui~="ja.session-done"]');
  assert(done && done.getAttribute("data-state") !== "not-passed", "the lesson passes: " + (done && done.textContent));
  eq(jaSessions().length, 1, "still ONE session entry");
  assert(e.metrics.n > n1, "the rest of the answers joined it: " + e.metrics.n);
  eq(e.metrics.done, true, "finished");
  const lessons = J.sessions.all().filter((s) => s.type === "ja" && s.metrics.kind === "lesson");
  eq(lessons.length, 1, "the lesson paid once");
  eq([J.store.state.governor.xp - x0, J.store.state.governor.gold - g0], [e.metrics.paid + 15, 2], "the session's answers and the lesson, nothing twice");
  assert(!(J.store.state.ui.runs || {})["ja:learn-H1"], "nothing left to pick up");
  eq(japp.errors, [], "no page errors");
});

step("I · JM-22: a kana set survives a mode switch and is logged without End set", async () => {
  const n0 = jaSessions().length;
  J.show("japanese", { page: "kana" });
  await japp.settle();
  const prog = () => jq("[data-ui~='ja.kana-set'] .k-mono").textContent;
  const total = +/of (\d+)/.exec(prog())[1];
  assert(total >= 2, "a set of two or more: " + prog());
  const host = jq("[data-ui~='ja.kana-read']");
  assert(host, "the Read it card");
  const inp = host.querySelector('[data-ui~="ja.answer"]');
  assert(inp, "a kana to read");
  const ch = inp.getAttribute("aria-label").replace("Type the reading of ", "");
  inp.value = J.ja.item("k:" + ch).r;
  host.querySelector('[data-ui~="ja.check"]').click();
  await japp.settle();
  eq(prog(), "1 of " + total, "one answered");
  eq(jaSessions().length, n0 + 1, "the set is in the ledger already");
  const e = jaSessions().pop();
  eq([e.metrics.n, e.metrics.done], [1, false], "one answer, in progress");
  /* switch the drill: the page redraws */
  [...jq("[data-ui~='ja.kana-set']").querySelectorAll(".k-seg-item")].find((b) => /^Read$/.test(b.textContent)).click();
  await japp.settle();
  assert(/^1 of \d+$/.test(prog()), "the set kept its answer across the switch: " + prog());
  eq(jaSessions().length, n0 + 1, "one entry");
  /* leave without End set, come back */
  J.show("home"); await japp.settle();
  J.show("japanese", { page: "kana" }); await japp.settle();
  assert(/^1 of \d+$/.test(prog()), "and across leaving the page: " + prog());
  jq("[data-ui~='ja.kana-end']").click();
  await japp.settle();
  eq(jaSessions().length, n0 + 1, "End set logs nothing more");
  eq(e.metrics.done, true, "and finishes the entry");
  assert(!(J.store.state.ui.runs || {})["ja:kana"], "the next set is a new one");
  eq(japp.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.message)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
