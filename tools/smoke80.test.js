/* Kurenai OS — smoke80.test.js
   Japanese (roadmap 5.5), the platform release: the registry and the pages.

     A · THE REGISTRY. Five subjects, Japanese the fifth and not an exam
         subject (invariant 112); the --ja hue (Sango) and its ink are tokens
         in Graphite and in every theme block; the spine carries Stage 0's
         sixteen lessons as leaves.
     B · THE ROUTES. #/subject/ja (the desk, 28a), #/ref/ja/<lesson> (the
         lesson, 28e) and every #/japanese/<page> render their own hooks with
         no error; Study is lit on the rail, and the subject pills are Code and
         Japanese alone (the A-level subjects keep their own group).
     C · LANG. Every Japanese run on a lesson page says lang="ja", so its
         glyphs are Japanese and not a Chinese variant.
     D · A RENDER WRITES NOTHING. Drawing the desk and every reading page
         leaves the state document as it was (invariant 116: reads write
         nothing).

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke80.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

step("A · six subjects; Japanese is not an exam subject", async (app) => {
  const S = app.KOS.subjects;
  assert(JSON.stringify(S.ids()) === JSON.stringify(["compsci", "maths", "it", "code", "ja", "mind", "creatives"]), "ids (Mind the sixth, smoke110; Creatives the seventh, smoke108): " + S.ids());
  assert(S.ids("exam").indexOf("ja") < 0, "Japanese is not an exam subject");
  assert(S.hue("ja") === "var(--ja)", "Japanese's hue is the --ja role");
  const lessons = Object.keys(app.window.KOS_JA.LESSONS).length;
  assert(lessons >= 22 && app.KOS.hub.LEAVES.ja.length === lessons, "every released lesson (Stage 0's sixteen and each Stage 1 unit's) is a leaf, got " + app.KOS.hub.LEAVES.ja.length + " of " + lessons);
  assert(app.KOS.spec.node("ja", "1.1") && app.KOS.spec.level("ja", "1.1") === "leaf", "the spec index knows Stage 1's lessons");
  assert(app.KOS.spec.node("ja", "H1") && app.KOS.spec.level("ja", "H1") === "leaf", "the spec index knows Japanese's lessons");
});
step("A · the --ja hue is a token in Graphite and every theme", () => {
  const tokens = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  assert(/--ja: oklch\(0\.73 0\.14 30\)/.test(tokens), "Graphite's --ja is Sango");
  assert(/--ja-ink:/.test(tokens) && /--font-ja:/.test(tokens) && /--font-hand:/.test(tokens), "the ink and the two Japanese families are tokens");
  const themes = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const blocks = themes.match(/:root\[data-theme="[\w-]+"\][^{]*\{[^}]*\}/g) || [];
  assert(blocks.length >= 25, "theme blocks found: " + blocks.length);
  blocks.forEach((b) => assert(/--ja:/.test(b) && /--ja-ink:/.test(b), "a theme without --ja: " + b.slice(0, 60)));
  assert(/data-theme="atelier-dawn"[^{]*\{[^}]*--ja: oklch\(0\.54 0\.16 28\)/.test(themes), "Dawn uses the deep Sango");
});
step("B · routes: the desk, a lesson and every Japanese page", async (app) => {
  const K = app.KOS;
  for (const [v, a, id] of [["subject", "ja", "ja.hero"], ["ref", { subject: "ja", ref: "H1" }, "ja.checks"], ["ref", { subject: "ja", ref: "1.1" }, "ja.media-moment"],
    ["japanese", { page: "session", id: "learn-1.2" }, "ja.meet"],
    ["japanese", { page: "path" }, "ja.media-path"], ["japanese", { page: "skills" }, "ja.skill-units"],
    ["japanese", { page: "kana" }, "ja.kana-chart"], ["japanese", { page: "reviews" }, "ui.page-head"],
    ["japanese", { page: "checkpoints" }, "ja.checkpoint"], ["japanese", { page: "settings" }, "ja.settings"],
    ["japanese", { page: "licences" }, "ui.page-head"], ["japanese", { page: "session", id: "learn-H1" }, "ja.runner"]]) {
    K.show(v, a); await app.settle();
    assert(app.document.querySelector('[data-ui~="' + id + '"]'), v + " " + JSON.stringify(a) + " did not render " + id);
    assert(app.document.querySelector('[data-ui~="shell.rail-item"][data-section="study"][aria-current="page"]'), v + " " + JSON.stringify(a) + " does not light Study");
    const pills = [...app.document.querySelectorAll("#subnav [data-ui~='shell.subnav-item']")].map((b) => b.textContent.trim());
    assert(pills.some((t) => /Japanese/.test(t)) && pills.some((t) => /Code/.test(t)) && !pills.some((t) => /Maths|Mathematics|Computer Science/.test(t)), v + ": the subject pills are not Code and Japanese alone: " + pills.join(", "));
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
  assert(app.window.location.hash === "#/japanese/session/learn-H1", "the session has its own route: " + app.window.location.hash);
});
step("C · every Japanese run on a lesson page is lang=ja", async (app) => {
  const K = app.KOS;
  for (const ref of ["H1", "H6", "H8", "K2"]) {
    K.show("ref", { subject: "ja", ref }); await app.settle();
    const runs = [...app.document.querySelectorAll('[data-ui~="ja.furigana"]')];
    assert(runs.length > 0, ref + " shows Japanese text");
    runs.forEach((r) => assert(r.closest('[lang="ja"]'), ref + ": a Japanese run without lang=ja: " + r.textContent));
  }
});
step("D · drawing the desk and the reading pages writes nothing", async (app) => {
  const K = app.KOS;
  K.show("home"); await app.settle();
  const before = JSON.stringify(K.store.state.japanese);
  for (const [v, a] of [["subject", "ja"], ["japanese", { page: "path" }], ["japanese", { page: "skills" }],
    ["japanese", { page: "reviews" }], ["japanese", { page: "checkpoints" }], ["japanese", { page: "licences" }]]) {
    K.show(v, a); await app.settle();
    assert(JSON.stringify(K.store.state.japanese) === before, v + " " + JSON.stringify(a) + " changed the Japanese record");
  }
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE80 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE80 PASS — Japanese's registry, routes and pages (" + steps.length + " steps).");
})();
