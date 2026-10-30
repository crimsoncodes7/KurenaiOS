/* Kurenai OS — smoke93.test.js
   The Exams & Deadlines hub, phase 5 (roadmap 5.8, docs/exams-plan.md
   §4.2, §13.1, §13.3–13.5, §16.4, §16.7, §16.10; design turn 29: 29o, 29r,
   29s, 29t, 29u, 29ac): the assembled Companion, the playbooks, trend and
   likelihood, the paper engine, the revision pack and accessibility.

   The claims:

     A · THE ARCHETYPE CATALOGUE IS MEASURED: every indexed question is
         tagged with an archetype or is unique (its tag text the reason);
         at least 99% are tagged; every row is used, its id is unique and
         its leaves are real spec leaves. The tagging is pure (Node).
     B · THE REPORT NOTES are generated from our own paraphrase and are
         current; each note's leaf is a real leaf and its question is in
         the index for that series.
     C · THE PLAYBOOK has, for each board, a decoder (asks, loses, an
         example), answer habits, conventions and notation; OCR and AQA
         carry levels; Edexcel the FX-991CW from Casio's guide.
     D · THE GUIDE IS ASSEMBLED, never stored: a tile for every leaf, the
         command words its items use (counted), the booklet and memorise
         from the notes' callouts, traps from the reports (cited) and the
         notes, labs, items, the cram deck; an empty section is left out.
     E · THE RAPID DRILL: 15 questions, seeded so it replays, mixed cards
         and short items; self-marked — nothing rated; its misses open as
         a Review run of those cards.
     F · THE DRAWER filters to the scope it came from; the blacklist says
         where each item came from (yours, a report, your notes); a
         question calls up its board's answer habit.
     G · TREND AND LIKELIHOOD: marks by topic and sitting, the core half
         (fewest shapes to half the paper), yield words, due by pattern,
         discriminators from the reports (AQA) or the index (Edexcel), and
         "too few sittings to say" under four.
     H · THE PAPER ENGINE (invariant 127): a blueprint from the index; a
         paper reproducible from its seed, to the marks, short to long, at
         most two items a leaf; mark-point chips where a dM or an A needs
         its M; the tally logs ONE attempt with marks by question, its
         source the seed, and nothing beyond the attempt's own tracker
         session (invariant 129).
     I · ACCESSIBILITY: extra time reaches the paper's minutes (an
         assessment's own allowance wins); large print and rest breaks are
         kept; large print raises the pack's page count.
     J · RENDERS WRITE NOTHING: the Companion at every tier, trend, the
         paper, its pages and every dialog draw without writing the state
         or erroring (a timed session is per device, and only on Start).

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke93.test.js                                            */
"use strict";
const path = require("path");
const { execFileSync } = require("child_process");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const TODAY = "2026-10-20";

/* ---------------- A · in Node ---------------- */
let ix, raw, S;
step("A · every indexed question has an archetype or is unique", () => {
  global.window = global.window || {};
  require(path.join(__dirname, "..", "js", "data", "exam-index.js"));
  require(path.join(__dirname, "..", "js", "data", "exam-archetypes.js"));
  S = require(path.join(__dirname, "..", "js", "core", "examstats.js"));
  ix = global.window.KOS_EXAMS.index; raw = global.window.KOS_EXAMS.archetypes;
  const t = S.tagArchetypes(ix, raw);
  eq(Object.keys(t.of).length + t.unique.length, ix.questions.length, "tagged or unique, every one");
  assert(Object.keys(t.of).length / ix.questions.length >= 0.99, "at least 99% tagged: " + Object.keys(t.of).length);
  assert(t.unique.every((q) => q[6] && q[6].length > 8), "a unique question's reason is its own tag text");
  const ids = raw.map((r) => r[0]);
  eq(ids.length, new Set(ids).size, "ids are unique");
  const used = new Set(Object.values(t.of));
  eq(ids.filter((id) => !used.has(id)), [], "every row is used");
  assert(raw.every((r) => /^(compsci|maths)$/.test(r[1]) && r[3] && (() => { try { new RegExp(r[4], "i"); return true; } catch (e) { return false; } })()), "rows are well formed");
  const st = S.archetypeStats(ix, t, "edexcel-9ma0-1");
  const c = S.coreHalf(st);
  assert(c && c.share >= 0.5 && c.items.length >= 3 && c.items.every((a) => !a.unique), "the core half is the fewest shapes to half the paper");
  assert(st.list[0].appear <= st.list[0].of && st.list[0].instances.length, "frequency and instances");
});

/* ---------------- B · the report notes ---------------- */
step("B · the report notes are current, and cite real questions", () => {
  execFileSync(process.execPath, [path.join(__dirname, "gen_exam_reports.mjs"), "--check"], { stdio: "pipe" });
  require(path.join(__dirname, "..", "js", "data", "exam-reports.js"));
  const R = global.window.KOS_EXAMS.reports;
  assert(Object.keys(R).length >= 4, "four AQA papers");
  let n = 0;
  Object.keys(R).forEach((pid) => {
    R[pid].notes.forEach((note) => {
      n++;
      assert(note.sitting && ix.papers[pid].sittings.indexOf(note.sitting) !== -1, pid + " " + note.q + ": a series of that paper");
      const top = note.q.replace(/^Q0*/, "");
      assert(ix.questions.some((q) => q[0] === pid && q[1] === note.sitting && q[3].replace(/^Q0*/, "").split(".")[0] === top.split(".")[0]) || !note.marks,
        pid + " " + note.sitting + " " + note.q + " is in the index");
    });
  });
  assert(n >= 100, "the notes: " + n);
});

let app, K, X, C, P;
step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; X = K.exams; C = K.examCompanion; P = K.examPaper;
  K.store.state.calendar.events = [];
  Object.keys(K.store.state.exams.assessments).forEach((id) => X.remove(id));
  app.window.print = () => { app.window.__printed = (app.window.__printed || 0) + 1; };
  eq(app.errors, [], "boot errors");
});

/* ---------------- C · the playbook ---------------- */
step("C · each board's playbook: decoder, habits, conventions, levels, calculator", () => {
  const PB = app.window.KOS_EXAMS.playbook;
  eq(Object.keys(PB).sort(), ["AQA", "Edexcel", "OCR"], "three boards");
  Object.keys(PB).forEach((b) => {
    assert(PB[b].commands.length >= 6 && PB[b].commands.every((c) => c.w && c.asks && c.loses && c.eg), b + ": every word asks, loses and shows");
    assert(PB[b].habits.length >= 3 && PB[b].habits.every((h) => h.words.length && h.steps.length >= 2), b + ": habits");
    assert(PB[b].conventions.length && PB[b].notation.length, b + ": conventions and notation");
  });
  assert(PB.OCR.levels && PB.OCR.levels.climb && PB.OCR.levels.check, "OCR levels, climbing a band, the checklist");
  assert(PB.AQA.levels, "AQA's extended answers");
  const calc = PB.Edexcel.calculator;
  assert(/Casio/.test(calc.source) && calc.setup.some((s) => /SETTINGS → Reset/.test(s)) && calc.checks.some((c) => /Func Analysis/.test(c[1])), "the FX-991CW from Casio's own guide");
});

/* ---------------- D · the guide ---------------- */
let topic, real, mock;
step("D · the guide is assembled from the scope's own material", () => {
  topic = X.add({ tier: "topic_test", subject: "maths", date: "2026-11-03", title: "Integration test", scope: { include: ["maths:P8"] } });
  real = X.add({ preset: "edexcel-9ma0-1", tier: "real_exam", date: "2027-06-02", title: "Maths Paper 1" });
  mock = X.add({ preset: "aqa-7517-2", tier: "mock", date: "2026-12-08", title: "CS Paper 2 mock" });
  const snap = JSON.stringify(K.store.state.exams);
  const g = C.guide(topic);
  eq(g.tiles.length, X.leaves(topic).length, "a tile per leaf");
  assert(g.commands.length >= 3 && g.commands.every((c) => c.n > 0 && c.asks), "the command words its items use, counted");
  assert(g.commands.find((c) => c.w === "Show that"), "Show that is found in its items");
  assert(g.booklet.length + g.memorise.length > 0, "booklet and memorise from the callouts");
  assert(g.items.length > 10 && g.cram.cards > 10, "items and the cram deck");
  const cs = C.guide(mock);
  assert(cs.traps.some((t) => t.from === "report" && /AQA/.test(t.cite)), "a trap from the examiner's report, cited");
  eq(g.sections.map((s) => s.id).indexOf("traps") === -1 ? g.traps.length : 1, g.traps.length ? 1 : 0, "an empty section is left out");
  eq(JSON.stringify(K.store.state.exams), snap, "assembling writes nothing");
});

/* ---------------- E · the drill ---------------- */
step("E · the rapid drill replays from its seed and rates nothing", () => {
  const srs = JSON.stringify(K.store.state.srs);
  const d1 = C.drill(topic, 7), d2 = C.drill(topic, 7), d3 = C.drill(topic, 8);
  eq(d1.items.length, 15, "fifteen");
  eq(JSON.stringify(d1), JSON.stringify(d2), "the same seed, the same drill");
  assert(JSON.stringify(d1.items) !== JSON.stringify(d3.items), "another seed, another drill");
  assert(d1.items.some((x) => x.kind === "card") && d1.items.some((x) => x.kind === "item"), "cards and short items");
  eq(JSON.stringify(K.store.state.srs), srs, "nothing rated or rescheduled");
});
step("E · a drill's misses open as a Review run of those cards", async () => {
  const keys = C.drill(topic, 7).items.filter((x) => x.kind === "card").slice(0, 3).map((x) => x.key);
  K.show("review", { tab: "due", run: "cards:" + keys.join("|") }); await app.settle();
  const head = app.document.querySelector("[data-ui~='review.back']");
  assert(head && /3 cards · the drill's misses/.test(head.parentNode.textContent), "the run: " + (head && head.parentNode.textContent));
});

/* ---------------- F · the drawer ---------------- */
step("F · the drawer filters to its scope; the blacklist names its sources", () => {
  const scoped = C.playbook("Edexcel", topic), whole = C.playbook("Edexcel", null);
  const b1 = scoped.sections.find((s) => s.id === "booklet"), b2 = whole.sections.find((s) => s.id === "booklet");
  assert(scoped.scoped && b1.booklet.length + b1.memorise.length < b2.booklet.length + b2.memorise.length, "filtered to the scope");
  assert(whole.sections.some((s) => s.id === "calculator") && !C.playbook("AQA", null).sections.some((s) => s.id === "calculator"), "the calculator only where one is used");
  assert(C.playbook("OCR", null).sections.some((s) => s.id === "levels"), "OCR's levels");
  K.tracker.add({ kind: "paper", paper: "J23", subject: "compsci", marks: 40, max: 60, timed: true, date: TODAY, assessmentId: mock.id,
    questions: [{ q: "1", max: 6, got: 1, tags: ["command"], refs: ["compsci:4.5.2.1"] }, { q: "2", max: 6, got: 2, tags: ["working"], refs: ["compsci:4.5.2.1"] }] });
  const bl = C.blacklist("AQA", mock);
  assert(bl.some((r) => r.from === "yours") && bl.some((r) => r.from === "report" && r.cite), "yours and the report's, cited");
  eq(C.habitFor("Edexcel", "Show that the area is 32/3").type, "Show that", "a question calls up its habit");
  eq(C.commandIn("AQA", "Explain why hexadecimal is used").w, "Explain", "and its command word");
});

/* ---------------- G · trend and likelihood ---------------- */
step("G · trend and likelihood from the index, the reports where they exist", () => {
  const L = C.likelihood(real);
  assert(L.enough && L.heat.rows.length >= 6 && L.heat.rows.every((r) => r.cells.length === L.sittings.length), "topics × sittings");
  assert(L.heat.rows.every((r) => ["high", "medium", "low", "due"].indexOf(r.yield) !== -1), "a yield word on every topic");
  assert(L.core && L.core.share >= 0.5, "the core half");
  assert(L.discriminators.length && L.discriminators.every((d) => d.from === "index"), "Edexcel: the longest schemes, until Pearson's reports");
  const M = C.likelihood(mock);
  assert(M.discriminators.length && M.discriminators.every((d) => d.from === "report"), "AQA: from the reports");
  /* the rule, on a made-up paper: absent lately, regular before */
  const fake = { papers: { p: { sittings: ["2019-06", "2020-06", "2021-06", "2022-06", "2023-06", "2024-06"] } },
    questions: ["2019-06", "2020-06", "2021-06", "2022-06"].map((s) => ["p", s, "A", "Q1", 5, ["maths:1.1"], "x"]).concat(["2019-06", "2020-06", "2021-06", "2022-06", "2023-06", "2024-06"].map((s) => ["p", s, "A", "Q2", 5, ["maths:2.1"], "y"])) };
  const h = S.heat(fake, "p", (k) => k);
  eq(h.rows.find((r) => r.topic === "maths:1.1").yield, "due", "absent from the last two, present before");
  const thin = S.heat({ papers: { q: { sittings: ["2023-06", "2024-06"] } }, questions: [["q", "2023-06", "A", "Q1", 4, ["maths:1.1"], "x"]] }, "q", (k) => k);
  eq([thin.enough, thin.rows[0].yield], [false, null], "too few sittings to say");
});

/* ---------------- H · the paper engine ---------------- */
let paper;
step("H · a paper is reproducible from its seed, to the blueprint", () => {
  const bp = P.blueprint(real);
  eq([bp.paper, bp.marks, bp.mins], ["edexcel-9ma0-1", 100, 120], "the blueprint from the index and the preset");
  paper = P.build(real, 1);
  eq(JSON.stringify(P.build(real, 1)), JSON.stringify(paper), "the same seed, the same paper");
  assert(JSON.stringify(P.build(real, 2).questions.map((q) => q.id)) !== JSON.stringify(paper.questions.map((q) => q.id)), "another seed, another draw");
  assert(Math.abs(paper.marks - 100) <= 2, "to the marks: " + paper.marks);
  assert(paper.questions.every((q, i) => !i || q.marks >= paper.questions[i - 1].marks), "short to long");
  const per = {};
  paper.questions.forEach((q) => { per[q.key] = (per[q.key] || 0) + 1; });
  assert(Object.values(per).every((n) => n <= 2), "at most two from a leaf");
  assert(paper.questions.every((q) => q.parts.every((p) => p.chips.reduce((s, c) => s + c.value, 0) === p.marks)), "chips add up to each part's marks");
});
step("H · chips: a dM or an A needs its M; the tally logs one attempt", () => {
  const part = { marks: 4, ms: ["Sets up [M1]", "Correct [A1]", "Uses it [dM1]", "Answer [A1]"] };
  const ch = P.chips(part);
  eq(ch.map((c) => c.label), ["M1", "A1", "dM1", "A1"], "the codes");
  const t = {}; t[ch[1].id] = true; t[ch[2].id] = true;
  eq(P.partScore(Object.assign({ chips: ch }, part), t), 0, "no M, no A or dM");
  t[ch[0].id] = true;
  eq(P.partScore(Object.assign({ chips: ch }, part), t), 3, "with its M");
  eq(P.chips({ marks: 2, ms: ["a point (1)", "another (1)"] }).length, 2, "(1) marks");
  eq(P.chips({ marks: 3, ms: ["no codes here"] }).map((c) => c.label), ["1", "2", "3"], "one chip a mark when the scheme does not add up");
  const sessions = (K.store.state.sessions || []).length, n = K.tracker.all().length;
  const ticks = {};
  paper.questions.forEach((q) => { ticks[q.n] = {}; q.parts.forEach((p, j) => { ticks[q.n][j] = {}; p.chips.forEach((c, k) => { if (k % 2 === 0) ticks[q.n][j][c.id] = true; }); }); });
  const fields = P.toAttempt(paper, ticks, { timed: true, mins: 110, predicted: 60 });
  const e = K.tracker.add(fields);
  eq(K.tracker.all().length - n, 1, "one attempt");
  eq([e.source.kind, e.source.ref, e.assessmentId, e.timed, e.predicted], ["custom-mock", real.id + ":1", real.id, true, 60], "its source is the seed");
  eq(e.questions.length, paper.questions.reduce((s, q) => s + q.parts.length, 0), "marks by question");
  assert(e.marks > 0 && e.marks < e.max, "a score");
  eq((K.store.state.sessions || []).length - sessions, 1, "the attempt's own tracker session, as any attempt");
});

/* ---------------- I · accessibility ---------------- */
step("I · extra time, large print and rest breaks", () => {
  X.setPrefs({ extraTime: 25, largePrint: true, restBreaks: true });
  const p = X.prefs();
  eq([p.extraTime, p.largePrint, p.restBreaks], [25, true, true], "kept");
  eq(P.blueprint(real).allowed, 150, "120 minutes become 150");
  const own = X.update(real.id, { extraTime: 50 });
  eq(P.blueprint(own).allowed, 180, "an assessment's own allowance wins");
  X.update(real.id, { extraTime: 0 });
  const small = C.pack(topic, { large: false }), big = C.pack(topic, { large: true });
  const pages = (pk) => pk.parts.filter((x) => x.available).reduce((s, x) => s + x.pages, 0);
  assert(pages(big) > pages(small), "large print takes more pages");
  assert(!small.parts.find((x) => x.id === "variations").available, "worked variations wait for the full Companion");
  X.setPrefs({ extraTime: 0, largePrint: false, restBreaks: false });
});

/* ---------------- J · renders ---------------- */
step("J · the Companion, trend, the paper and its dialogs draw without writing", async () => {
  const quiz = X.add({ tier: "retrieval_test", subject: "compsci", date: "2026-10-22", title: "Quiz", scope: { include: ["compsci:4.5.2.1"] } });
  const snap = () => { const s = JSON.parse(JSON.stringify(K.store.state)); delete s.ui; return JSON.stringify(s); };
  /* the Badge Wall's evaluation after the setup's own writes lands first:
     it is not the page's write (roadmap 5.16, invariant 163) */
  for (let i = 0; i < 600 && K.achievements && K.achievements._busy(); i++) await app.settle();
  const before = snap();
  const pages = [["exams", "guide"], ["exams", { tab: "guide", sub: topic.id }], ["exams", { tab: "guide", sub: real.id }], ["exams", { tab: "guide", sub: mock.id }], ["exams", { tab: "guide", sub: quiz.id }],
    ["exams", { id: real.id, tab: "trend" }], ["exams", { id: topic.id, tab: "trend" }], ["exams", { id: real.id, tab: "paper", sub: "1" }], ["exams", real.id]];
  for (const [v, arg] of pages) {
    K.show(v, arg); await app.settle();
    assert(app.document.querySelector("#main").children.length, "drew " + JSON.stringify(arg));
  }
  K.show("exams", { tab: "guide", sub: real.id }); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.shape']"), "a real exam's question shapes");
  K.show("exams", { tab: "guide", sub: topic.id }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='exams.gsec']").length >= 6 && app.document.querySelector("[data-ui~='exams.note-tile']"), "the guide's sections");
  K.examGuide.playbook("Edexcel", topic); await app.settle();
  for (const b of app.document.querySelectorAll("[data-ui~='exams.pb-section']")) { b.click(); await app.settle(); }
  app.document.querySelector("[data-ui~='exams.drawer']").parentNode.close();
  K.examGuide.pack(topic); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='exams.pack-part']").length === 6, "the pack's parts (phase 6 added the subtopic packs)");
  app.document.querySelector("[data-ui~='exams.pack-print']").click(); await app.settle();
  assert(app.window.__printed === 1 && app.document.getElementById("k-ex-print"), "printed from its own root");
  app.document.querySelector("[data-ui~='exams.pack-dialog']").parentNode.close();
  K.examGuide.settings(); await app.settle(); app.document.querySelector("[data-ui~='exams.settings-dialog']").parentNode.close();
  K.examGuide.drill(topic); await app.settle(); app.document.querySelector("[data-ui~='exams.drill-dialog']").parentNode.close();
  eq(snap(), before, "no page or dialog wrote the state");
  /* timed mode: a per-device session, from Start only */
  K.show("exams", { id: real.id, tab: "paper", sub: "1" }); await app.settle();
  assert(!K.store.state.ui.examPaperSess, "no session from a render");
  app.document.querySelector("[data-ui~='exams.timed-start']").click(); await app.settle();
  assert(K.store.state.ui.examPaperSess && app.document.querySelector("[data-ui~='exams.timed']"), "timed");
  app.document.querySelector("[data-ui~='exams.tend']").click(); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.tally']"), "the tally");
  app.document.querySelector("[data-ui~='exams.tally-dialog']").parentNode.close();
  eq(snap(), before, "timed mode writes only the per-device session");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke93: " + failed + " failed" : "smoke93: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
