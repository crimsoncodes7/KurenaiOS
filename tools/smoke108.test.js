/* Kurenai OS — smoke108.test.js
   Creatives (roadmap 5.7 item 3, docs/creatives-plan.md revision 2, design turn 31): the platform.

     A · THE REGISTRY. Six subjects, Creatives the sixth and not an exam subject; the --cr hue
         (Moegi) and its ink are tokens in Graphite and in every theme block; the spine carries
         every released lesson as a leaf, and every lesson holds its contract (studies with a
         given 80% and one variable, a check with "Good for this unit" and the later skills
         struck, notes pages with an expected beginner output, theory cards).
     B · THE ROUTES. The desk, a lesson, and every #/creatives/<page> render their own hooks with
         no error; Study is lit, and the subject pills are the study spaces alone.
     C · A RENDER WRITES NOTHING. Drawing the desk and every reading page leaves the state as it
         was (invariant 154: reads write nothing).
     D · EVIDENCE, NOT CLAIMS (invariant 154). Reading every page ticks Notes; saving each study
         ticks Studies; a check is self-marked, "Not yet" ticks nothing and pays nothing, a pass
         ticks the check and pays 8 XP and 1 gold ONCE per study; a theory card rated ticks the
         fourth check and the lesson is done.
     E · PROJECTS AND DRILLS PAY ONCE. Every milestone pays the project once (150/40/+10); a
         drill batch pays 6 XP once a day per type; promoting pays nothing.
     F · PRIVATE BY DEFAULT (invariant 156). The desk never draws the Practice Log, only its link;
         the Portfolio holds only promoted work; files stay in kurenai-os-creatives and ride the
         full backup, never the state document.
     G · THE DAILY CREATIVE. Computed, never stored: it names the next study, rests on a day not
         chosen, and pauses in Exam Season (on by default).
     H · THE WRITING DESK. The word diff is exact; a study opens a draft with its setup written.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke108.test.js                                           */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const SID = "creatives";

step("A · seven subjects; Creatives is not an exam subject", async (app) => {
  const S = app.KOS.subjects;
  assert(JSON.stringify(S.ids()) === JSON.stringify(["compsci", "maths", "it", "code", "ja", "mind", "creatives"]), "ids: " + S.ids());
  assert(S.ids("exam").indexOf(SID) < 0, "Creatives is not an exam subject");
  assert(S.hue(SID) === "var(--cr)", "Creatives' hue is the --cr role");
  assert(JSON.stringify(S.group(SID)) === JSON.stringify(["code", "ja", "mind", "creatives"]), "the study spaces share one switch");
  const lessons = Object.keys(app.window.KOS_CR.LESSONS);
  assert(lessons.length >= 3 && app.KOS.hub.LEAVES.creatives.length === lessons.length, "every released lesson is a leaf");
  assert(app.KOS.spec.level(SID, "W1.1") === "leaf", "the spec index knows Creatives' lessons");
});
step("A · the --cr hue is a token in Graphite and every theme", () => {
  const tokens = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  assert(/--cr: oklch\(0\.85 0\.135 118\)/.test(tokens) && /--cr-ink:/.test(tokens), "Graphite's --cr is Moegi, with its ink");
  const themes = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const blocks = themes.match(/:root\[data-theme="[\w-]+"\][^{]*\{[^}]*\}/g) || [];
  assert(blocks.length >= 25, "theme blocks found: " + blocks.length);
  blocks.forEach((b) => assert(/--cr:/.test(b) && /--cr-ink:/.test(b), "a theme without --cr: " + b.slice(0, 60)));
  assert(/data-theme="atelier-dawn"[^{]*\{[^}]*--cr: oklch\(0\.53 0\.125 116\)/.test(themes), "Dawn uses the deep Moegi");
});
step("A · every released lesson holds the lesson contract", (app) => {
  const C = app.window.KOS_CR, K = app.window.KOS_CONTENT;
  Object.keys(C.LESSONS).forEach((id) => {
    const L = C.LESSONS[id], c = K[SID + ":" + id];
    assert(C.UNITS[L.unit] && C.UNITS[L.unit].lessons.indexOf(id) >= 0, id + ": not in its unit");
    assert(L.skill && L.studies.length >= 1, id + ": a skill and at least one study");
    L.studies.forEach((s) => {
      assert(s.id && s.t && s.min >= 5 && s.min <= 20, id + "·" + s.id + ": a micro-study is 5–20 minutes");
      assert(s.give && s.vary, id + "·" + s.id + ": what is given and the one variable");
      assert(s.tool !== "desk" || s.setup, id + "·" + s.id + ": a Writing Desk study opens with its setup written");
    });
    assert(L.check && L.check.rows.length >= 1 && L.check.rows.length <= 2, id + ": one or two check rows");
    assert(L.check.good && L.check.ignore.length >= 1, id + ": Good for this unit, with the later skills struck");
    assert(c && c.pages && c.pages.length >= 3, id + ": notes pages");
    assert(c.pages.some((p) => p.blocks.some((b) => b.beginner)), id + ": an expected beginner output");
    assert(c.flashcards && c.flashcards.length >= 4, id + ": theory cards");
  });
  Object.keys(C.UNITS).forEach((u) => { const U = C.UNITS[u]; if (U.project) assert(U.project.milestones.length >= 2 && C.LESSONS[U.project.after], u + ": a project needs milestones and the lesson it follows"); });
});

step("A · beside the hero, a study space's side column never sets the row's height", () => {
  const css = fs.readFileSync(path.join(ROOT, "css/views/study.css"), "utf8");
  assert(/\.k-subj-hero:is\([^)]*\.k-mind-hero[^)]*\.k-cr-hero[^)]*\) \+ \.k-subj-side \{ contain: size;/.test(css), "the study spaces' side column is size-contained beside the hero (30 October 2026)");
});
step("B · routes: the desk, a lesson and every Creatives page", async (app) => {
  const K = app.KOS;
  for (const [v, a, id] of [["subject", SID, "cr.hero"], ["ref", { subject: SID, ref: "W1.1" }, "cr.checks"],
    ["creatives", { page: "tracks" }, "cr.tracks"], ["creatives", { page: "write" }, "ui.page-head"], ["creatives", { page: "portfolio" }, "ui.page-head"],
    ["creatives", { page: "log" }, "ui.page-head"], ["creatives", { page: "project", id: "W1" }, "cr.project"],
    ["creatives", { page: "add", id: "W1.1.a" }, "cr.add"], ["creatives", { page: "settings" }, "cr.settings"]]) {
    K.show(v, a); await app.settle();
    assert(app.document.querySelector('[data-ui~="' + id + '"]'), v + " " + JSON.stringify(a) + " did not render " + id);
    assert(app.document.querySelector('[data-ui~="shell.rail-item"][data-section="study"][aria-current="page"]'), v + " does not light Study");
    const pills = [...app.document.querySelectorAll("#subnav [data-ui~='shell.subnav-item']")].map((b) => b.textContent.trim());
    assert(pills.some((t) => /Creatives/.test(t)) && pills.some((t) => /Japanese/.test(t)) && !pills.some((t) => /Mathematics|Computer Science/.test(t)), v + ": the pills are not the study spaces: " + pills.join(", "));
  }
  K.show("ref", { subject: SID, ref: "W1.2" }); await app.settle();
  const tabs = [...app.document.querySelectorAll('[data-ui~="topic.tabs"] [role="tab"]')].map((b) => b.textContent.replace(/\d+$/, "").trim());
  assert(tabs.join("|") === "Notes|Micro-studies|Theory cards|Project", "a lesson's tabs: " + tabs.join("|"));
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("C · drawing the desk and the pages writes nothing", async (app) => {
  const K = app.KOS;
  K.show("home"); await app.settle();
  const before = JSON.stringify(K.store.state.creatives), ui = JSON.stringify(K.store.state.ui.creatives || {});
  for (const [v, a] of [["subject", SID], ["creatives", { page: "tracks" }], ["creatives", { page: "portfolio" }], ["creatives", { page: "log" }],
    ["creatives", { page: "project", id: "W1" }], ["creatives", { page: "settings" }]]) {
    K.show(v, a); await app.settle();
    assert(JSON.stringify(K.store.state.creatives) === before, v + " " + JSON.stringify(a) + " changed the Creatives record");
  }
  assert(JSON.stringify(K.store.state.ui.creatives || {}) === ui, "a render changed the per-device choices");
});

function addText(app, rec, text) {
  return new Promise((res) => app.KOS.creatives.addWork(rec, { text }, res));
}
step("D · evidence, not claims: the four checks and pay once", async (app) => {
  const K = app.KOS, CR = K.creatives, L = CR.lesson("W1.1");
  const ev0 = CR.evidence("W1.1");
  assert(ev0.checks.every((c) => !c), "nothing is ticked before any work");
  CR.pagesOf("W1.1").forEach((_, i) => CR.markPage("W1.1", i));
  assert(CR.evidence("W1.1").checks[0] && !CR.evidence("W1.1").checks[1], "reading every page ticks Notes, and only Notes");
  assert(!CR.done("W1.1"), "reading alone never completes a lesson");
  const gold0 = K.store.state.governor.gold, xp0 = K.store.state.governor.xp;
  const w1 = await addText(app, { lesson: "W1.1", study: "a", kind: "text", title: "ten", words: 60 }, "The kettle hisses.");
  await app.settle();
  assert(!CR.evidence("W1.1").checks[1], "one study of two saved is not Studies");
  const r0 = CR.setCheck(w1, { rows: [true, false] });
  assert(!r0.pass && !r0.paid && K.store.state.governor.xp === xp0, "Not yet is a normal answer: no tick, no pay");
  const r1 = CR.setCheck(w1, { rows: [true, true], note: "fine" });
  assert(r1.pass && r1.paid === "study:W1.1.a", "a first pass pays: " + JSON.stringify(r1));
  assert(K.store.state.governor.gold === gold0 + 1 && K.store.state.governor.xp >= xp0 + 8, "8 XP and 1 gold");
  const w2 = await addText(app, { lesson: "W1.1", study: "a", kind: "text", title: "ten again" }, "Again.");
  const r2 = CR.setCheck(w2, { rows: [true, true] });
  assert(r2.pass && !r2.paid && K.store.state.governor.gold === gold0 + 1, "a second pass of the same study pays nothing");
  const w3 = await addText(app, { lesson: "W1.1", study: "b", kind: "text", title: "verbs" }, "He hurried.");
  CR.setCheck(w3, { rows: [true, true] });
  let ev = CR.evidence("W1.1");
  assert(ev.checks[0] && ev.checks[1] && ev.checks[2] && !ev.checks[3], "notes, studies and the check, not yet a card: " + JSON.stringify(ev.checks));
  K.srs.rate(CR.cardKeys("W1.1")[0], 2);
  CR.syncChecks("W1.1");
  ev = CR.evidence("W1.1");
  assert(ev.checks.every(Boolean) && CR.done("W1.1"), "a held card completes the lesson");
  const p = K.store.peekProgress(SID, "W1.1");
  assert(p && p.check.every(Boolean), "the shared progress record carries the four checks");
  assert(L.studies.length === 2 && K.store.state.sessions.filter((e) => e.type === SID && e.metrics.kind === "study" && e.metrics.first).length === 2, "one study entry per first pass");
});
step("D · the check page: Not yet, then a pass", async (app) => {
  const K = app.KOS, CR = K.creatives, doc = app.document;
  const w = await addText(app, { lesson: "W1.2", study: "a", kind: "text", title: "rhythm" }, "Short. Then a longer one that runs on.");
  K.show("creatives", { page: "check", id: w }); await app.settle();
  assert(doc.querySelector('[data-ui~="cr.calibration"]') && /varies?|vary/i.test(doc.querySelector('[data-ui~="cr.calibration"]').textContent), "the calibration shows");
  assert(doc.querySelector('[data-ui~="cr.calibration"] s'), "the later skills are struck through");
  const save = doc.querySelector('[data-ui~="cr.check-save"]');
  assert(save.disabled, "Save check waits for every row");
  const ch = [...doc.querySelectorAll('[data-ui~="cr.choice"]')];
  ch[1].click(); ch[2].click(); await app.settle();
  assert(!save.disabled, "every row answered enables Save check");
  save.click(); await app.settle();
  assert(doc.querySelector('[data-ui~="cr.check-notyet"]'), "Not yet shows the next step");
  ch[0].click(); await app.settle(); save.click(); await app.settle();
  assert(doc.querySelector('[data-ui~="cr.check-pass"]') && CR.studyPassed("W1.2", "a"), "a pass shows and is recorded");
});

step("E · projects and drills pay once; promoting pays nothing", async (app) => {
  const K = app.KOS, CR = K.creatives, g = K.store.state.governor;
  const xp0 = g.xp, gold0 = g.gold;
  CR.markMilestone("W1", 0); CR.markMilestone("W1", 1);
  assert(g.xp === xp0 && !CR.projectState("W1").done, "two of three milestones pay nothing");
  CR.markMilestone("W1", 2);
  assert(CR.projectState("W1").done && g.gold === gold0 + 40 && g.xp >= xp0 + 150, "every milestone pays the project once");
  CR.markMilestone("W1", 2, true); CR.markMilestone("W1", 2);
  assert(g.gold === gold0 + 40, "undoing and redoing a milestone does not pay twice");
  const xp1 = g.xp;
  assert(CR.logDrill("kerning") === true && g.xp === xp1 + 6, "a drill batch pays 6 XP");
  assert(CR.logDrill("kerning") === false && g.xp === xp1 + 6, "the same drill type again today pays nothing");
  const w = CR.works()[0].id, xp2 = g.xp;
  CR.promote(w, true);
  assert(g.xp === xp2 && CR.portfolio().length === 1, "promoting pays nothing and puts it in the Portfolio");
});

step("F · private by default; files in their own store and the full backup", async (app) => {
  const K = app.KOS, CR = K.creatives, doc = app.document;
  K.show("subject", SID); await app.settle();
  assert(doc.querySelector('[data-ui~="cr.log-link"]'), "the desk carries the private Practice Log link");
  assert(!doc.querySelector('[data-ui~="cr.work"]') && !doc.querySelector('[data-ui~="cr.log"]'), "the desk never draws the Practice Log");
  const rows = [...doc.querySelectorAll('[data-ui~="cr.portfolio-side"] .k-cr-portrow .k-day-title')].map((n) => n.textContent);
  assert(JSON.stringify(rows) === JSON.stringify(CR.portfolio().map((w) => w.title)), "the desk's side list is the Portfolio only: " + rows.join(", "));
  assert(JSON.stringify(K.store.state.creatives).indexOf("The kettle hisses") < 0, "no work's text is in the state document");
  const snap = await new Promise((res, rej) => K.store.snapshotFull((e, r) => (e ? rej(e) : res(r))));
  assert(snap.creatives && snap.creatives.files.some((f) => f.text === "The kettle hisses."), "the full backup carries the files");
  K.show("creatives", { page: "portfolio" }); await app.settle();
  assert(doc.querySelectorAll('[data-ui~="cr.piece"]').length === CR.portfolio().length, "the Portfolio shows promoted work only");
});

step("G · the Daily Creative: computed, rests, pauses in Exam Season", async (app) => {
  const K = app.KOS, CR = K.creatives;
  const before = JSON.stringify(K.store.state.creatives);
  const p = CR.planDay();
  assert(p.state === "today" && p.study && p.study.lesson === "W1.2", "it names the next study: " + JSON.stringify(p.study));
  assert(JSON.stringify(K.store.state.creatives) === before, "planning writes nothing");
  const dow = new Date(p.day + "T12:00:00").getDay(), days = [true, true, true, true, true, true, true];
  days[dow] = false;
  CR.setPrefs({ days });
  assert(CR.planDay().state === "rest" && CR.planDay().nextDay === (dow + 1) % 7, "a day not chosen rests and names the next");
  CR.setPrefs({ days: [true, true, true, true, true, true, true] });
  const orig = K.exams.season;
  K.exams.season = () => ({ on: true, last: { date: "2027-06-19" } });
  try {
    assert(CR.planDay().state === "paused", "Exam Season pauses it");
    CR.setPrefs({ examPause: false });
    assert(CR.planDay().state === "today", "the pause can be turned off");
    CR.setPrefs({ examPause: true });
    K.show("subject", SID); await app.settle();
    assert(app.document.querySelector('[data-ui~="cr.daily"][data-state="paused"]'), "the desk says it is paused");
  } finally { K.exams.season = orig; }
});

step("H · the Writing Desk: a study opens its setup; the diff is exact", async (app) => {
  const K = app.KOS, W = K.crWrite;
  const d = W.diff("The cat sat on the mat.", "The black cat sat on the mat today.");
  const ins = d.filter((p) => p.op === "ins").map((p) => p.t.trim()).filter(Boolean), del = d.filter((p) => p.op === "del").map((p) => p.t.trim()).filter(Boolean);
  assert(JSON.stringify(ins) === JSON.stringify(["black", "mat today."]) && JSON.stringify(del) === JSON.stringify(["mat."]), "diff: " + JSON.stringify(d));
  assert(d.filter((p) => p.op !== "ins").map((p) => p.t).join("") === "The cat sat on the mat.", "the old text is the same and the deleted parts");
  W.openStudy("W1.3", "b"); await app.settle(); await app.settle();
  assert(/#\/creatives\/write\//.test(app.window.location.hash), "a study opens a draft: " + app.window.location.hash);
  const paper = app.document.querySelector('[data-ui~="cr.paper"]');
  assert(paper && /lights go out/.test(paper.value), "the draft opens with the study's setup written");
  assert(app.document.querySelector('[data-ui~="cr.sprint"]') && app.document.querySelector('[data-ui~="cr.versions"]'), "sprint and versions beside it");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE108 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE108 PASS — Creatives' platform (" + steps.length + " steps).");
})();
