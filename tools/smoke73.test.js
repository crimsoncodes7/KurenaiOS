/* Kurenai OS — smoke73.test.js
   Code (roadmap 5.3), part 1: the subject registry, the in-app runner and
   the checker.

     A · THE REGISTRY. Four subjects, Code not an exam subject; the --code
         hue exists in tokens and in every theme block; Code reaches the
         spine, the topic picker's index and the router.
     B · THE INTERPRETER behaves like .NET on the cases that tripped it:
         banker's Math.Round on an exact .5 only, F2 ties to even, 64-bit
         long arithmetic, checked() overflow, and the compile errors unit 1
         teaches (CS0165, CS0128, CS0029, CS0266, CS0220, CS0019, CS1002).
     C · THE SANDBOX. The interpreter file closes the network inside a
         worker, and the service worker precaches it.
     D · THE CHECKER. Program cases, a compile error replacing the list, a
         runtime exception stopping the cases after it, a timeout, hidden
         cases and rules that speak only once the output is right.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke73.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");
const CSI = require("../js/labs/cs-interp.js");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const run = (src, stdin) => CSI.run({ files: [{ name: "Program.cs", src }], stdin: stdin || "" });
const out = (src, stdin) => { const r = run(src, stdin); if (!r.ok) throw new Error(src + " → " + JSON.stringify(r.error)); return r.stdout; };
const err = (src) => { const r = run(src); return r.ok ? null : r.error.code; };

step("A · four subjects; Code is not an exam subject", async (app) => {
  const S = app.KOS.subjects;
  assert(JSON.stringify(S.ids()) === JSON.stringify(["compsci", "maths", "it", "code"]), "ids: " + S.ids());
  assert(JSON.stringify(S.ids("exam")) === JSON.stringify(["compsci", "maths", "it"]), "exam ids: " + S.ids("exam"));
  assert(S.hue("code") === "var(--code)" && S.short("code") === "Code", "Code's hue and short name");
  assert(app.KOS.hub.LEAVES.code.length === 121, "121 core lessons on the spine, got " + app.KOS.hub.LEAVES.code.length);
  assert(app.KOS.spec.node("code", "1.1") && app.KOS.spec.level("code", "1.1") === "leaf", "the spec index knows Code's lessons");
});
step("A · the --code hue is a token in Graphite and every theme", () => {
  const tokens = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  assert(/--code: oklch\(0\.815 0\.095 224\)/.test(tokens), "Graphite's --code is Sky");
  const themes = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const blocks = themes.match(/:root\[data-theme="[\w-]+"\][^{]*\{[^}]*\}/g) || [];
  assert(blocks.length >= 25, "theme blocks found: " + blocks.length);
  blocks.forEach((b) => assert(/--code:/.test(b) && /--code-ink:/.test(b), "a theme without --code: " + b.slice(0, 60)));
  assert(/data-theme="atelier-dawn"[^{]*\{[^}]*--code: oklch\(0\.505 0\.095 224\)/.test(themes), "Dawn uses the deep Sky");
});
step("A · routes: #/subject/code, #/ref/code/1.1 and #/code/<page>", async (app) => {
  const K = app.KOS;
  for (const [v, a, id] of [["subject", "code", "code.hero"], ["ref", { subject: "code", ref: "1.1" }, "code.status"],
    ["code", { page: "map" }, "code.strand-filter"], ["code", { page: "skills" }, "code.band-tiles"],
    ["code", { page: "retrieval" }, "ui.empty"], ["code", { page: "settings" }, "code.setting-keybar"],
    ["code", { page: "task", id: "1.1-hello" }, "code.task"], ["code", { page: "track", id: "T3" }, "ui.page-head"]]) {
    K.show(v, a); await app.settle();
    assert(app.document.querySelector('[data-ui~="' + id + '"]'), v + " " + JSON.stringify(a) + " did not render " + id);
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("B · rounding and formatting match .NET", () => {
  assert(out("Console.WriteLine(Math.Round(2.345, 2));") === "2.35\n", "2.345 → 2.35 (2.345 * 100 is just over .5)");
  assert(out("Console.WriteLine(Math.Round(2.5));\nConsole.WriteLine(Math.Round(3.5));") === "2\n4\n", "banker's on an exact .5");
  assert(out('Console.WriteLine($"{0.125:F2} {0.375:F2} {2.345:F2}");') === "0.12 0.38 2.35\n", "F2 ties to even on exact values");
  assert(out("Console.WriteLine(0.1 + 0.2);") === "0.30000000000000004\n", "double shows its error");
  assert(out("Console.WriteLine(0.1m + 0.2m);") === "0.3\n", "decimal is exact");
});
step("B · long is 64-bit; int wraps; checked() throws", () => {
  assert(out("long big = int.MaxValue;\nbig = big + 1;\nConsole.WriteLine(big);") === "2147483648\n", "long does not wrap");
  assert(out("int a = int.MaxValue;\nlong c = a + 1;\nConsole.WriteLine(c);") === "-2147483648\n", "int arithmetic wraps before it is stored");
  assert(out("int a = 3000000;\nlong r = (long)a * 1000;\nConsole.WriteLine(r);") === "3000000000\n", "a cast to long first");
  assert(out("long x = (long)int.MaxValue * 2;\nConsole.WriteLine(x);") === "4294967294\n", "(long)int.MaxValue parses");
  const r = run("int z = int.MaxValue;\nConsole.WriteLine(checked(z + 1));");
  assert(!r.ok && r.error.code === "OverflowException", "checked overflow throws");
});
step("B · the compile errors unit 1 teaches", () => {
  const cases = {
    "int n;\nConsole.WriteLine(n);": "CS0165",
    "int s = 1;\nint s = 2;": "CS0128",
    'int age = "17";': "CS0029",
    "int age = Console.ReadLine();": "CS0029",
    "int p = 2.5;": "CS0266",
    "int x = 2147483647 + 1;": "CS0220",
    "decimal p = 4.99m;\ndouble r = 0.2;\nConsole.WriteLine(p * r);": "CS0019",
    'Console.WriteLine("One")\nConsole.WriteLine("Two");': "CS1002",
    'console.WriteLine("Hi");': "CS0103"
  };
  Object.keys(cases).forEach((src) => assert(err(src) === cases[src], JSON.stringify(src) + " gave " + err(src) + ", wanted " + cases[src]));
  /* definite assignment is conservative: assigned before reading is fine */
  assert(err("int n;\nn = 3;\nConsole.WriteLine(n);") === null, "assigned then read is fine");
  assert(err("int n;\nif (true) n = 1; else n = 2;\nConsole.WriteLine(n);") === null, "assigned in both branches is fine");
});

step("C · the sandbox: no network in the worker, and it is precached", () => {
  const src = fs.readFileSync(path.join(ROOT, "js/labs/cs-interp.js"), "utf8");
  assert(/self\.fetch = undefined/.test(src) && /XMLHttpRequest = undefined/.test(src) && /WebSocket = undefined/.test(src), "the worker closes the network");
  assert(!/\b(document|localStorage|indexedDB|KOS)\b\./.test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")), "the interpreter reads no DOM, storage or app state");
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  assert(/js\/labs\/cs-interp\.js/.test(sw), "sw.js precaches the interpreter (EXTRA_PRECACHE)");
});

step("D · the checker: pass, compile error, exception, timeout, rules", async (app) => {
  app.window.eval(fs.readFileSync(path.join(ROOT, "js/labs/cs-interp.js"), "utf8"));
  const R = app.KOS.codeRun;
  const spec = { mode: "program", cases: [{ stdin: "2", out: "4" }, { stdin: "5", out: "10" }, { stdin: "0", out: "0", hidden: true }] };
  const good = await R.check(spec, [{ name: "P.cs", src: "int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(n * 2);" }]);
  assert(good.passed && good.pass === 3 && good.results.length === 3, "all pass: " + JSON.stringify(good));
  const off = await R.check(spec, [{ name: "P.cs", src: "int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(n + 2);" }]);
  assert(!off.passed && off.pass === 1 && off.results[2].hidden && off.results[0].ok && !off.results[1].ok, "a wrong answer fails case by case");
  const ce = await R.check(spec, [{ name: "P.cs", src: "Console.WriteLine(totl);" }]);
  assert(ce.compile && ce.compile.code === "CS0103" && ce.results.length === 0, "a compile error replaces the list");
  const ex = await R.check(spec, [{ name: "P.cs", src: "int n = int.Parse(Console.ReadLine());\nConsole.WriteLine(10 / (n - 2));" }]);
  assert(ex.stopped && ex.stopped.at === 0 && ex.results[1].skipped && ex.results[2].skipped, "an exception stops the cases after it");
  const to = await R.check({ mode: "program", cases: [{ stdin: "", out: "" }] }, [{ name: "P.cs", src: "int i = 0;\nwhile (i < 1) { }" }]);
  assert(to.stopped && to.stopped.error.kind === "timeout", "an endless loop is stopped: " + JSON.stringify(to.stopped));
  const rule = { mode: "program", cases: [{ stdin: "", out: "9 4" }], rules: [{ id: "x", test: (s) => !/temp/.test(s), msg: "no temp" }] };
  const rb = await R.check(rule, [{ name: "P.cs", src: "int a = 4, b = 9;\nint temp = a; a = b; b = temp;\nConsole.WriteLine(a + \" \" + b);" }]);
  assert(!rb.passed && rb.rule && rb.rule.msg === "no temp" && rb.pass === 1, "a rule speaks once the output is right");
  assert(R.explain({ code: "CS0103", kind: "compile", msg: "m", line: 2 }).plain, "the decoder explains CS0103");
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE73 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE73 PASS — Code's registry, runner and checker (" + steps.length + " steps).");
})();
