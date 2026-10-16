#!/usr/bin/env node
/* tools/validator_check.mjs — Spike V (docs/code-plan.md §12.1): the Rider
   workflow end to end with the real .NET SDK. The scaffold is built by the
   app's own code (KOS.codeProject.files, as the export zips it), unpacked
   into a temporary folder, and the validator (assets/code/validator/
   validate.cs) runs four times:
     fresh     the untouched scaffold: it builds (m1), nothing else passes
     solved    the milestones done (code, the bug fix, the package, a Git
               commit): every milestone passes, exit 0
     tampered  a shipped test edited: protected.ok is false (practice only)
     broken    a compile error: the build fails, the tests are not run
   The solved, tampered and broken reports are saved to tools/fixtures/ for
   smoke78's import matrix. Needs the .NET 10 SDK, NuGet and git; outside
   the jsdom gate. macOS here; Windows and Linux are still to be run.
     node tools/validator_check.mjs                                          */
import { createRequire } from "module";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

global.window = global;
window.KOS_CONTENT = {}; window.KOS_DATA = {}; window.KOS = {};
for (const f of ["js/data/code.js", "js/data/content/code-ub.js", "js/data/content/code-projects-files.js", "js/core/codezip.js", "js/core/codeproj.js"]) require(path.join(ROOT, f));
const K = window.KOS_CODE;
window.KOS.code = { project: (id) => K.PROJECTS[id] || null };
window.KOS.codeProject._setValidator(fs.readFileSync(path.join(ROOT, "assets/code/validator/validate.cs"), "utf8"));

const ID = "rp-bridge-hello";
const files = await window.KOS.codeProject.files(ID);
function fresh() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kos-validator-"));
  for (const [p, t] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.writeFileSync(path.join(dir, p), t); }
  return dir;
}
const sh = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: 600000, env: Object.assign({}, process.env, { DOTNET_CLI_TELEMETRY_OPTOUT: "1", DOTNET_NOLOGO: "1" }) });
function validate(dir) {
  const r = sh("dotnet", ["run", ".kurenai/validate.cs"], dir);
  const reps = fs.readdirSync(path.join(dir, ".kurenai/reports")).sort();
  const text = fs.readFileSync(path.join(dir, ".kurenai/reports", reps[reps.length - 1]), "utf8");
  return { exit: r.status, out: r.stdout, text, rep: JSON.parse(text) };
}
const ms = (rep) => rep.milestones.filter((m) => m.ok).map((m) => m.id).join(",");
let bad = 0;
const expect = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) bad++; };

let d = fresh(), v = validate(d);
expect(v.exit === 1 && ms(v.rep) === "m1" && v.rep.protected.ok, "fresh: builds, only m1 passes, protected files match (" + ms(v.rep) + ")");

d = fresh();
fs.writeFileSync(path.join(d, "src/Greeter/Greetings.cs"), 'using Humanizer;\n\nnamespace Greeter;\n\npublic static class Greetings\n{\n    public static string For(string name, int hour)\n    {\n        string part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";\n        return $"Good {part}, {name}!";\n    }\n\n    public static string Describe(int hour)\n    {\n        int h = hour % 12 == 0 ? 12 : hour % 12;\n        return h.ToWords() + " o\'clock";\n    }\n}\n');
const prog = path.join(d, "src/Hello/Program.cs");
fs.writeFileSync(prog, fs.readFileSync(prog, "utf8").replace("Greetings.For(name, shown)", "Greetings.For(name, hour)"));
sh("dotnet", ["add", "src/Greeter/Greeter.csproj", "package", "Humanizer.Core", "--version", "3.0.10"], d);
sh("git", ["init", "-q"], d); sh("git", ["add", "-A"], d);
sh("git", ["-c", "user.email=kurenai@example.com", "-c", "user.name=Kurenai", "commit", "-qm", "Hello, Kurenai"], d);
v = validate(d);
expect(v.exit === 0 && ms(v.rep) === "m1,m2,m3,m4,m5" && v.rep.source.gitCommit && !v.rep.source.dirty, "solved: every milestone passes, exit 0, committed and clean (" + ms(v.rep) + ")");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/bridge-report-solved.json"), v.text);

fs.appendFileSync(path.join(d, "tests/Hello.Acceptance/Milestone2.cs"), "// changed\n");
v = validate(d);
expect(!v.rep.protected.ok && v.rep.protected.mismatched.includes("tests/Hello.Acceptance/Milestone2.cs"), "tampered: the changed test is reported, protected.ok false");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/bridge-report-tampered.json"), v.text);
sh("git", ["checkout", "-q", "tests/Hello.Acceptance/Milestone2.cs"], d);

const g = path.join(d, "src/Greeter/Greetings.cs");
fs.writeFileSync(g, fs.readFileSync(g, "utf8").replace("{name}!", "{nam}!"));
v = validate(d);
const build = v.rep.steps.find((s) => s.id === "build"), test = v.rep.steps.find((s) => s.id === "test");
expect(build.errors === 1 && v.rep.failures[0].build === "CS0103" && !test.ran && test.status === "not-run", "broken: CS0103 from SARIF, tests not run");
fs.writeFileSync(path.join(ROOT, "tools/fixtures/bridge-report-broken.json"), v.text);

console.log(bad ? "✗ " + bad + " check(s) failed" : "✓ the validator behaves on all four scenarios");
process.exit(bad ? 1 : 0);
