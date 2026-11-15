/* Kurenai OS — smoke148.test.js
   W6's smaller items (quality audit, 15 November 2026) and the Seasonal
   view's episodes-behind badge.

     A · EX-25: a predicted CS Paper 2 is the board paper's 100 marks and
         its own 2 h 30, never a mark and a minute short.
     B · EX-33: "Mark it yourself" prints each scheme line with its own
         chips under the question, and no link that throws the ticks away.
     C · JM-10, JM-11: a new word's Reading comes before its Listening, and
         a facet whose sibling was reviewed today waits for another day.
     D · JM-16, JM-20: after its first meeting a kana is written from its
         reading (the model is a hint); a checkpoint's Listening asks six
         different pairs and its Writing shows no model.
     E · CC-12, CC-13, CM-12, CM-24: AQA shorthand reads in words, Haskell
         and assembly are named, "5 m s$^{-1}$" is one piece of maths, and
         a "key" callout is a Key idea.
     F · MI-03, JM-04: a Mind concept's ladder knows which rungs it can
         reach and the desk counts only those; Y3's units are Y3.U1–U3.
     G · The Seasonal card's "N behind": episodes out and not watched.
     I · CC-05: a bank item that repeats a worked card's past-paper
         question (same level, year, paper and number) is dropped, and the
         rest keep their original positions as keys.
     H · CM-04: a fork remembers the shipped version it was made from; when
         the curriculum moves the tab says so and offers the new version,
         the new version with your additions, or keeping yours.

   Run: node tools/smoke148.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc;
const $ = (s, r) => (r || doc).querySelector(s);
const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
});

/* ---------------- A ---------------- */
let real, paper;
step("A · EX-25: a predicted paper is the board paper's marks and time", () => {
  const X = K.exams;
  real = X.add({ preset: "aqa-7517-2", tier: "real_exam", subject: "compsci", date: "2027-06-10", title: "CS Paper 2", scope: { include: ["compsci:Paper 2"] } });
  const bad = [];
  for (let seed = 1; seed <= 6; seed++) {
    const p = K.examPaper.build(real, seed);
    if (p.marks !== p.blueprint.marks) bad.push(seed + ": " + p.marks + " marks");
    else if (p.mins !== p.blueprint.mins) bad.push(seed + ": " + p.mins + " min");
  }
  eq(bad, [], "every predicted paper is 100 marks in 2 h 30");
  paper = K.examPaper.build(real, 1);
  eq([paper.marks, paper.mins], [100, 150], "the numbers themselves");
});

/* ---------------- B ---------------- */
step("B · EX-33: the tally shows the scheme beside its chips", async () => {
  const ov = K.examPaperView.tally(real, paper, { timed: false });
  await app.settle();
  const dlg = $("[data-ui~='exams.tally-dialog']") || doc.body;
  const rows = $$("[data-ui~='exams.tally-row']", dlg);
  assert(rows.length >= paper.questions.length, "a row a part");
  const lines = $$("[data-ui~='exams.tally-line']", dlg);
  assert(lines.length > rows.length, "scheme lines are printed");
  assert(lines.some((l) => l.querySelector("[data-ui~='exams.mchip']") && l.textContent.replace(/[○✓\s\d]/g, "").length > 8), "a line carries its text and its chips");
  assert(!$$("button", dlg).some((b) => /Mark schemes/.test(b.textContent)), "no button that leaves and loses the ticks");
  ov.close(); await app.settle();
});

/* ---------------- C ---------------- */
step("C · JM-10: Reading first among new facets of equal standing", () => {
  const S = K.jaSrs, today = "2026-11-16";
  const f = { "w:これ|L": { due: today, isNew: true }, "w:これ|R": { due: today, isNew: true }, "w:それ|L": { due: today, isNew: true }, "w:それ|R": { due: today, isNew: true } };
  const q = S.queue(f, today, null);
  eq(q.filter((k) => /これ/.test(k)), ["w:これ|R"], "これ is read first");
  eq(q.filter((k) => /それ/.test(k)), ["w:それ|R"], "それ too");
});
step("C · JM-11: a sibling reviewed today buries the other facet until tomorrow", () => {
  const S = K.jaSrs, today = "2026-11-16";
  const f = { "w:これ|R": { due: "2026-11-26", last: today, reps: 1, s: 5, d: 5 }, "w:これ|L": { due: today, isNew: true }, "w:かさ|L": { due: today, isNew: true } };
  const q = S.queue(f, today, null);
  assert(q.indexOf("w:これ|L") === -1, "これ|L waits: " + JSON.stringify(q));
  assert(q.indexOf("w:かさ|L") !== -1, "another item is still asked");
  const late = { "w:これ|R": { due: "2026-11-26", last: today, reps: 1, s: 5, d: 5 }, "w:これ|L": { due: "2026-11-10", reps: 2, s: 2, d: 5, last: "2026-11-01" } };
  assert(S.queue(late, today, null).indexOf("w:これ|L") !== -1, "a facet more than two days overdue still comes");
});

/* ---------------- D ---------------- */
step("D · JM-16: a met kana is written from its reading; the model is a hint", async () => {
  const host = doc.createElement("div"); doc.body.appendChild(host);
  const key = "k:あ|W";
  K.store.state.japanese.facets = K.store.state.japanese.facets || {};
  K.store.state.japanese.facets[key] = { due: "2026-11-16", reps: 3, s: 4, d: 5, last: "2026-11-12" };
  const ex = K.jaRun.exercise(key);
  let res = null;
  K.jaRun.mount(host, ex, (r) => { res = r; });
  await app.settle();
  const model = host.querySelector(".k-ja-model");
  assert(model && model.hidden, "the model is hidden");
  assert(/Write: a/.test(host.textContent), "the prompt is the reading");
  const peek = host.querySelector("[data-ui~='ja.show-model']");
  assert(peek, "Show the model is offered");
  peek.click();
  assert(!model.hidden && peek.disabled, "it shows the model once");
  host.remove(); void res;
});
step("D · JM-20: a checkpoint asks six different pairs and writes from memory", async () => {
  const cps = app.window.KOS_JA.CHECKPOINTS, id = Object.keys(cps).find((k) => cps[k].skills.indexOf("L") >= 0 && cps[k].skills.indexOf("W") >= 0) || "cp-H";
  K.show("japanese", { page: "checkpoints", id: id }); await app.settle();
  const run = $("[data-ui~='ja.checkpoint-run']");
  assert(run, "the checkpoint runs");
  const seen = [];
  for (let n = 0; n < 40; n++) {
    const head = run.querySelector(".k-ja-run-n").textContent;
    const host = run.querySelector(".k-ja-run-host");
    if (!host) break;
    if (/^Listening/.test(head)) {
      const opts = Array.from(host.querySelectorAll(".k-ja-opts button")).map((b) => b.textContent).sort().join("/");
      seen.push(opts);
    }
    if (/^Writing/.test(head)) {
      const m = host.querySelector(".k-ja-model");
      assert(!m || m.hidden, "no model in a checkpoint's Writing");
    }
    const skip = host.querySelector("[data-ui~='ja.type-instead']");
    /* answer anything to move on: a choice, a typed reading, or "Type instead" then Enter */
    const choice = host.querySelector(".k-ja-opts button");
    if (choice) choice.click();
    else {
      if (skip) { skip.click(); await app.settle(); }
      const inp = host.querySelector("input");
      if (inp) { inp.value = "x"; const chk = host.querySelector("[data-ui~='ja.check']"); if (chk) chk.click(); }
    }
    await app.settle();
    const next = Array.from(run.querySelectorAll("button")).find((b) => /Next/.test(b.textContent));
    if (!next) break;
    next.click(); await app.settle();
  }
  if (seen.length) eq(new Set(seen).size, seen.length, "no listening pair asked twice (" + seen.length + ")");
});

/* ---------------- E ---------------- */
step("E · CC-12, CC-13, CM-12, CM-24: the renderer reads the notation", () => {
  const C = K.content;
  eq(C.aqaWords("I. missing spaces; A. each digit on a new line"), "Ignore: missing spaces; Accept: each digit on a new line", "I. and A. in words");
  eq(C.aqaWords("R. a column with more than one value"), "Reject: a column with more than one value", "R. in words");
  assert(/don’t penalise twice/.test(C.aqaWords("DPT for the same error")), "DPT spelt out");
  eq(C.aqaWords("Answer: 2 marks for A and B"), "Answer: 2 marks for A and B", "a plain sentence is left alone");
  const code = C.renderBlocks([{ code: { lang: "haskell", src: "double x = x * 2 -- twice" } }, { code: { lang: "asm", src: "LDR R0, 100" } }]);
  assert(/>Haskell</.test(code) && />AQA assembly</.test(code), "the languages are named");
  assert(/data-t="com"/.test(code) && /data-t="kw"[^>]*>LDR/.test(code), "and highlighted");
  const u = C.inline("travels at 5 m s$^{-1}$ for 3 s");
  assert(/\$5\\ \\text\{m s\}\^\{-1\}\$/.test(u), "a unit is one piece of maths: " + u);
  const key = C.renderBlocks([{ callout: { t: "key", body: [{ p: "x" }] } }]);
  assert(/Key idea/.test(key) && /data-kind="key"/.test(key), "a key callout is a Key idea");
});

/* ---------------- F ---------------- */
step("F · MI-03: the ladder knows its reachable rungs", () => {
  const M = K.mind;
  eq(M.reach("premise"), [true, false, false, false], "premise has only Recall so far");
  eq(M.reach("induction"), [true, true, true, true], "induction has all four");
  const l = M.ladder("premise");
  eq(l.reach, [true, false, false, false], "the ladder carries it");
  const big = K.mindUI.ladder(l, { large: true });
  eq(Array.from(big.querySelectorAll("[data-state='none']")).length, 3, "three rungs drawn as not in this unit");
  const st = M.deskStats ? M.deskStats() : null; void st;
  const rc = M.reachCounts(["premise", "induction"]);
  eq(rc, [2, 1, 1, 1], "reach counts");
});
step("F · JM-04: Y3's units are numbered like the rest", () => {
  const ids = [];
  app.window.KOS_MIND.PATHS.forEach((p) => p.units.forEach((u) => ids.push(u.id)));
  eq(ids.filter((i) => /^Y3\./.test(i)), ["Y3.U1", "Y3.U2", "Y3.U3"], "Y3.U1–U3");
  eq(ids.filter((i) => /^[A-Z]\d\.\d+$/.test(i)), [], "no unit id is shaped like a lesson ref");
});

/* ---------------- H ---------------- */
step("H · CM-04: a fork made before the curriculum moved says so", async () => {
  const E = K.edits, sid = "maths", ref = "2.2", C = app.window.KOS_CONTENT[sid + ":" + ref];
  assert(C && C.flashcards && C.flashcards.length, "a shipped deck");
  const cards = E.material(sid, ref, "flashcards");
  cards.push({ q: "My own card", a: "mine" });
  E.set(sid, ref, "flashcards", cards);
  eq(E.stale(sid, ref, "flashcards"), false, "fresh fork: not stale");
  const saved = C.flashcards.slice();
  C.flashcards.push(["A card shipped later", "new"]);
  eq(E.stale(sid, ref, "flashcards"), true, "the shipped deck moved: stale");
  K.show("ref", { subject: sid, ref: ref }); await app.settle();
  const tab = $("[data-tab='cards']"); if (tab) { tab.click(); await app.settle(); }
  assert($("[data-ui~='topic.stale']"), "the tab says so");
  $("[data-ui~='topic.stale-merge']").click(); await app.settle();
  const now = E.material(sid, ref, "flashcards");
  assert(now.some((c) => c.q === "A card shipped later") && now.some((c) => c.q === "My own card"), "the new deck with my card");
  eq(E.stale(sid, ref, "flashcards"), false, "and no longer stale");
  assert(!$("[data-ui~='topic.stale']"), "the notice goes");
  C.flashcards.push(["Another later card", "x"]);
  E.keepMine(sid, ref, "flashcards");
  eq(E.stale(sid, ref, "flashcards"), false, "Keep mine counts this version as seen");
  /* a fork from before the stamp: judged by its shipped rows */
  const t = E.get(sid, ref); delete t.shipped;
  eq(E.stale(sid, ref, "flashcards"), true, "a legacy fork with fewer shipped rows than ship today");
  E.reset(sid, ref, "flashcards");
  C.flashcards.length = 0; saved.forEach((c) => C.flashcards.push(c));
  eq(E.get(sid, ref), null, "reset leaves nothing");
});

/* ---------------- I ---------------- */
step("I · CC-05: a past-paper question appears once in a leaf's exam questions", () => {
  const C = app.window.KOS_CONTENT, P = K.content.paperKey, dup = [];
  Object.keys(C).filter((k) => /^compsci:/.test(k)).forEach((k) => {
    const seen = {};
    (C[k].exam || []).forEach((it) => { const p = P(it); if (!p) return; if (seen[p]) dup.push(k + " " + p); seen[p] = 1; });
  });
  eq(dup.slice(0, 5), [], "no question twice in a leaf");
  const ex = C["compsci:4.2.6.1"].exam;
  eq(ex.map((it, i) => it.oi != null ? it.oi : i).filter((v, i, a) => a.indexOf(v) !== i), [], "every item keeps its own position key");
});

/* ---------------- G ---------------- */
step("G · Seasonal: episodes out and not watched", () => {
  const B = K.anime.episodesBehind;
  eq(B({ status: "inProgress", progress: { current: 3, total: 12 } }, { episode: 7 }), 3, "next is 7, seen 3 → 3 behind");
  eq(B({ status: "inProgress", progress: { current: 6, total: 12 } }, { episode: 7 }), 0, "up to date");
  eq(B({ status: "inProgress", progress: { current: 8, total: 12 } }, null), 4, "a finished run: the total");
  eq(B({ status: "planned", progress: { current: 0, total: 12 } }, { episode: 3 }), 2, "planned and two out");
  eq(B({ status: "completed", progress: { current: 12, total: 12 } }, { episode: 13 }), 0, "completed says nothing");
  eq(B({ status: "dropped", progress: { current: 2, total: 12 } }, { episode: 9 }), 0, "dropped says nothing");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
