/* Kurenai OS — smoke78.test.js
   Code (roadmap 5.3), part 6: Bridge B and the Rider workflow v1
   (docs/code-plan.md §9; frames 26m–26n). The reports here are REAL: the
   validator wrote them (tools/validator_check.mjs → tools/fixtures/).

     A · EXPORT. The scaffold is the project's files, the validator and a
         kurenai.project.json whose protected hashes are those files'
         SHA-256; the zip reads back with every file under the folder.
     B · THE IMPORT MATRIX (§9.4, 26n). Accepted; practice only (a shipped
         test changed); and rejected — too large, not JSON, not a report,
         another project, an unknown scaffold, a validator too old, dated
         in the future — each naming its cause; the same report twice is
         "already imported" and changes nothing. A check never writes.
     C · PAY ONCE, PASSES STAY. Applying the solved report passes every
         milestone, pays the project's reward once through the ledger,
         ticks its lessons' task check and starts their retrieval; a later
         failing report takes nothing back.
     D · THE PAGES. The hub's four tabs, a Bridge lesson and a command
         card draw without writing to the store.
     F · T1B. Contacts on SQLite's real report passes its four milestones
         and pays once; the hub names Track T1 · T1B.
     G · T1C. The Lending Library on EF Core's real report (a real dotnet ef
         migration, acceptance tests on SQLite in memory) passes all seven
         milestones and pays once, under Track T1 · T1C.
     H · T2A. Your first window's real report (Avalonia driven headless)
         passes its four milestones and pays once, under Track T2 · T2A.
     I · T2B–T2D. The Reading List, Markdown notes and Focus timer: each
         real report passes every milestone and pays once, under its part.
     J · T1D–T1E. The Weather client (HttpClient against a fake server) and
         Loopback chat (real TcpClients over loopback): each real report
         passes every milestone and pays once, under Track T1.
     E · UNIT 10. The Lending Library's real report (validator 1.1.0: own
         tests, planted bugs, warnings, source checks) passes all six
         milestones and pays once; a Bridge report from validator 1.0.0 is
         still accepted, and the unit 10 project refuses 1.0.0.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke78.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const ROOT = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
/* the harness keeps its own clock: each real report is dated an hour before it */
let SOLVED, TAMPERED, BROKEN, LEGACY, LIBRARY, CONTACTS, EFCORE, WINDOW;
function dated(file, app, minutes) {
  const j = JSON.parse(read(file)), now = app.window.Date.now();
  j.startedAt = new Date(now - minutes * 60000 - 30000).toISOString().slice(0, 19) + "Z";
  j.finishedAt = new Date(now - minutes * 60000).toISOString().slice(0, 19) + "Z";
  return JSON.stringify(j, null, 1);
}
const ID = "rp-bridge-hello";

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const edit = (text, fn) => { const j = JSON.parse(text); fn(j); return JSON.stringify(j); };

step("A · the export: files, hashes and the zip", async (app) => {
  const K = app.KOS, P = K.codeProject;
  const files = await P.files(ID), spec = K.code.project(ID);
  assert(files[".kurenai/validate.cs"] && files["kurenai.project.json"] && files["HelloKurenai.sln"] && files["tests/Hello.Acceptance/Milestone2.cs"], "the scaffold, the validator and the manifest");
  const man = JSON.parse(files["kurenai.project.json"]);
  assert(man.id === ID && man.validator === "1.1.1" && man.milestones.length === spec.milestones.length, "the manifest names the project, the validator and the milestones");
  spec.protected.forEach((p) => assert(man.protected[p] === K.codeZip.sha256(files[p]), "protected hash for " + p));
  const sol = JSON.parse(SOLVED);
  Object.keys(man.protected).forEach((p) => assert(sol.protected.files[p] === man.protected[p], "the validator computed the same hash for " + p));
  const z = await P.zip(ID), back = K.codeZip.read(z.bytes);
  assert(z.name === "hello-kurenai.zip" && back.length === Object.keys(files).length && back.every((f) => f.path.indexOf("hello-kurenai/") === 0), "the zip holds every file under the folder");
  assert(back.find((f) => f.path === "hello-kurenai/src/Hello/Program.cs").text === files["src/Hello/Program.cs"], "a file reads back unchanged");
});

step("B · the import matrix: every outcome, and a check writes nothing", async (app) => {
  const P = app.KOS.codeProject, before = JSON.stringify(app.KOS.store.state.code);
  const out = async (t, o) => P.check(t, o);
  const big = await out("x".repeat(256 * 1024 + 1));
  assert(big.outcome === "rejected" && big.code === "size", "too large");
  assert((await out("{not json")).code === "json", "not JSON");
  assert((await out(edit(SOLVED, (j) => { delete j.schema; }))).code === "shape", "not a report");
  const other = await out(edit(SOLVED, (j) => { j.project.id = "rp-someone-else"; }));
  assert(other.code === "project" && /does not match/.test(other.msg), "another project");
  assert((await out(edit(SOLVED, (j) => { j.project.scaffoldVersion = 9; }))).code === "scaffold", "an unknown scaffold");
  const old = await out(edit(SOLVED, (j) => { j.validator.version = "0.9.0"; }));
  assert(old.code === "validator" && /Export the project again/.test(old.msg), "a validator too old");
  const fut = new Date(app.window.Date.now() + 3 * 86400000).toISOString().slice(0, 19) + "Z";
  assert((await out(edit(SOLVED, (j) => { j.finishedAt = fut; }))).code === "future", "dated in the future");
  const legacy = await out(LEGACY);
  assert(legacy.outcome === "accepted" && !legacy.mismatched.length, "a report from validator 1.0.0 (an earlier export) is still accepted: " + JSON.stringify(legacy.mismatched || legacy.msg));
  const lib10 = await out(edit(LIBRARY, (j) => { j.validator.version = "1.0.0"; }));
  assert(lib10.code === "validator", "the unit 10 project needs validator 1.1.0");
  const pr = await out(TAMPERED);
  assert(pr.outcome === "practice" && pr.mismatched.includes("tests/Hello.Acceptance/Milestone2.cs") && !pr.changes.some((c) => c.becomes), "practice only: the changed file named, nothing will pass");
  const ok = await out(SOLVED);
  assert(ok.outcome === "accepted" && ok.changes.every((c) => c.becomes) && ok.completes && ok.reward.xp === 120, "accepted: every milestone will pass and the reward is shown");
  assert(JSON.stringify(app.KOS.store.state.code) === before, "checking wrote nothing");
});

step("C · apply: passes, pays once, ticks the lessons, starts retrieval; passes stay", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor;
  assert(!K.code.evidence("B.4").checks[2], "before: B.4's task check is open");
  const prac = P.apply(await P.check(TAMPERED));
  assert(prac.ok && prac.practice && prac.newly.length === 0, "a practice-only report marks nothing");
  const xp0 = g.xp, gold0 = g.gold;
  const r = P.apply(await P.check(SOLVED));
  assert(r.ok && r.newly.join() === "m1,m2,m3,m4,m5" && r.all && r.pay && r.pay.xp === 120, "every milestone passes and it pays: " + JSON.stringify(r.pay));
  assert(g.xp - xp0 === 120 && g.gold - gold0 === 30, "the Governor paid it once: +" + (g.xp - xp0));
  const e = K.sessions.all().slice(-1)[0];
  assert(e.type === "code" && e.metrics.kind === "project" && e.award.xp === 120, "one ledger entry with its award");
  const dup = await P.check(SOLVED);
  assert(dup.outcome === "duplicate", "the same report again: already imported");
  ["B.1", "B.4", "B.5", "B.8"].forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
  assert(K.code.state().proven.debugger && K.code.state().cards["ub-debug"], "the milestone proved B.4's concept and scheduled its card");
  const later = P.apply(await P.check(BROKEN));
  const v = K.code.projectView(ID);
  assert(later.ok && later.newly.length === 0 && v.done === 5 && !later.pay, "a later failing report takes nothing back and pays nothing");
  assert(g.xp - xp0 === 120, "still paid once");
});

step("D · the hub, a Bridge lesson and a command card draw without writing", async (app) => {
  const K = app.KOS;
  K.show("subject", "compsci"); await app.settle();
  const snap = () => JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress) + JSON.stringify(K.store.state.governor);
  for (const [v, a] of [["code", { page: "project", id: ID }], ["code", { page: "project", id: ID, tab: "setup" }], ["code", { page: "project", id: ID, tab: "validation" }], ["code", { page: "project", id: ID, tab: "history" }], ["ref", { subject: "code", ref: "B.3" }]]) {
    const before = snap();
    K.show(v, a); await app.settle();
    assert(before === snap(), v + " " + JSON.stringify(a) + " wrote while drawing");
  }
  K.show("code", { page: "project", id: ID }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='code.project-badge']").length === 5, "five milestone cards");
  K.show("code", { page: "project", id: ID, tab: "history" }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='code.project-history'] tbody tr").length === 3, "three reports in the history");
  const cd = K.code.card("ub-git");
  assert(K.code.commandMatches({ accept: ["^git log --oneline$"] }, "  git   log --oneline ") && !K.code.commandMatches({ accept: ["^git log --oneline$"] }, "git log"), "a command card checks the typed command");
  assert(cd && cd.kind === "command", "Bridge cards are command cards");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("E · the unit 10 project: six milestones, own tests and planted bugs, paid once", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor, L = "rp-u10-library";
  const files = await P.files(L);
  const man = JSON.parse(files["kurenai.project.json"]);
  assert(man.milestones.length === 6 && man.milestones[1].checks[0].type === "mutants" && files["tests/Library.Acceptance/Milestone4.cs"], "the scaffold carries the mutants check and the acceptance tests");
  const res = await P.check(LIBRARY);
  assert(res.outcome === "accepted" && res.changes.every((c) => c.becomes) && res.completes && res.reward.xp === 150, "accepted, every milestone, the reward shown: " + JSON.stringify(res.mismatched || res.msg));
  const xp0 = g.xp, gold0 = g.gold;
  const r = P.apply(res);
  assert(r.ok && r.newly.join() === "m1,m2,m3,m4,m5,m6" && r.pay && g.xp - xp0 === 150 && g.gold - gold0 === 40, "paid 150 XP and 40 gold once");
  ["10.1", "10.3", "10.4", "10.5", "10.6", "10.7", "10.10"].forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
  K.show("code", { page: "project", id: L }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='code.project-badge']").length === 6 && /Unit 10/.test(app.document.querySelector("#main").textContent), "the hub draws six milestones under Unit 10");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("F · T1B's project: Contacts on SQLite, under its track", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor, id = "rp-t1b-contacts";
  const files = await P.files(id);
  assert(files["ContactsSqlite.sln"] && /SQLitePCLRaw\.bundle_e_sqlite3" Version="2\.1\.13"/.test(files["src/Contacts/Contacts.csproj"]), "the scaffold, with the native SQLite pinned past the advisory");
  const res = await P.check(CONTACTS);
  assert(res.outcome === "accepted" && res.completes && res.reward.xp === 120, "accepted with its reward: " + (res.msg || JSON.stringify(res.mismatched)));
  const xp0 = g.xp, r = P.apply(res);
  assert(r.ok && r.newly.join() === "m1,m2,m3,m4" && g.xp - xp0 === 120, "four milestones, paid once");
  ["T1.9", "T1.10", "T1.11"].forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
  K.show("code", { page: "project", id }); await app.settle();
  assert(/Track T1 · T1B/.test(app.document.querySelector("#main").textContent), "the hub names its track and part");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("G · T1C's project: The Lending Library on EF Core", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor, id = "rp-t1c-library";
  const files = await P.files(id);
  assert(files["LibraryEf.sln"] && /dotnet-ef/.test(files[".config/dotnet-tools.json"]) && /SQLitePCLRaw\.bundle_e_sqlite3" Version="2\.1\.13"/.test(files["src/Library.Data/Library.Data.csproj"]), "the scaffold: the solution, the pinned dotnet-ef and the patched native SQLite");
  assert(/foreach \(var m in db\.Members/.test(files["src/Library.Data/LibraryService.cs"]), "Members() ships as the N+1 milestone 6 fixes");
  const res = await P.check(EFCORE);
  assert(res.outcome === "accepted" && res.completes && res.reward.xp === 150, "accepted with its reward: " + (res.msg || JSON.stringify(res.mismatched)));
  const xp0 = g.xp, r = P.apply(res);
  assert(r.ok && r.newly.join() === "m1,m2,m3,m4,m5,m6,m7" && g.xp - xp0 === 150, "seven milestones, paid once");
  ["T1.12", "T1.13", "T1.14", "T1.15", "T1.16", "T1.17"].forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
  K.show("code", { page: "project", id }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='code.project-badge']").length === 7 && /Track T1 · T1C/.test(app.document.querySelector("#main").textContent), "the hub draws seven milestones under Track T1 · T1C");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("H · T2A's taster: Your first window, under Track T2", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor, id = "rp-t2a-window";
  const files = await P.files(id);
  assert(files["FirstWindow.sln"] && /Avalonia\.Headless\.XUnit" Version="12\.1\.4"/.test(files["tests/Tips.Acceptance/Tips.Acceptance.csproj"]) && /AvaloniaTestApplication/.test(files["tests/Tips.Acceptance/Headless.cs"]), "the scaffold: the solution and the headless test app");
  const res = await P.check(WINDOW);
  assert(res.outcome === "accepted" && res.completes && res.reward.xp === 100, "accepted with its reward: " + (res.msg || JSON.stringify(res.mismatched)));
  const xp0 = g.xp, r = P.apply(res);
  assert(r.ok && r.newly.join() === "m1,m2,m3,m4" && g.xp - xp0 === 100, "four milestones, paid once");
  ["T2.1", "T2.2", "T2.3"].forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
  K.show("code", { page: "project", id }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='code.project-badge']").length === 4 && /Track T2 · T2A/.test(app.document.querySelector("#main").textContent), "the hub draws four milestones under Track T2 · T2A");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("I · T2B–T2D: The Reading List, Markdown notes and Focus timer", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor;
  for (const [id, fixture, unit, ms, xp, lessons] of [
    ["rp-t2b-reading", "reading", "T2B", "m1,m2,m3,m4,m5", 120, ["T2.4", "T2.5", "T2.6", "T2.7"]],
    ["rp-t2c-notes", "notes", "T2C", "m1,m2,m3,m4", 140, ["T2.8", "T2.9", "T2.10", "T2.11"]],
    ["rp-t2d-timer", "timer", "T2D", "m1,m2,m3,m4,m5", 140, ["T2.12", "T2.13", "T2.14", "T2.15"]]
  ]) {
    const res = await P.check(dated("tools/fixtures/" + fixture + "-report-solved.json", app, 3));
    assert(res.outcome === "accepted" && res.completes && res.reward.xp === xp, id + ": accepted with its reward: " + (res.msg || JSON.stringify(res.mismatched)));
    const xp0 = g.xp, r = P.apply(res);
    assert(r.ok && r.newly.join() === ms && g.xp - xp0 === xp, id + ": every milestone, paid once");
    lessons.forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
    K.show("code", { page: "project", id }); await app.settle();
    assert(new RegExp("Track T2 · " + unit).test(app.document.querySelector("#main").textContent), id + ": the hub names Track T2 · " + unit);
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

step("J · T1D–T1E: the Weather client and Loopback chat, under Track T1", async (app) => {
  const K = app.KOS, P = K.codeProject, g = K.store.state.governor;
  for (const [id, fixture, unit, ms, xp, lessons] of [
    ["rp-t1d-weather", "weather", "T1D", "m1,m2,m3,m4,m5", 140, []],
    ["rp-t1e-chat", "chat", "T1E", "m1,m2,m3,m4", 120, ["T1.23", "T1.24", "T1.25"]]
  ]) {
    const files = await P.files(id);
    assert(files[K.code.project(id).solution] && files["tests/" + (unit === "T1D" ? "Weather" : "Chat") + ".Acceptance/Milestone1.cs"], id + ": the scaffold");
    const res = await P.check(dated("tools/fixtures/" + fixture + "-report-solved.json", app, 2));
    assert(res.outcome === "accepted" && res.completes && res.reward.xp === xp, id + ": accepted with its reward: " + (res.msg || JSON.stringify(res.mismatched)));
    const xp0 = g.xp, r = P.apply(res);
    assert(r.ok && r.newly.join() === ms && g.xp - xp0 === xp, id + ": every milestone, paid once");
    lessons.forEach((l) => assert(K.code.evidence(l).checks[2], l + ": the task check is ticked by its milestone"));
    K.show("code", { page: "project", id }); await app.settle();
    assert(new RegExp("Track T1 · " + unit).test(app.document.querySelector("#main").textContent), id + ": the hub names Track T1 · " + unit);
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

(async () => {
  let failed = 0;
  const app = await boot();
  app.KOS.codeProject._setValidator(read("assets/code/validator/validate.cs"));
  SOLVED = dated("tools/fixtures/bridge-report-solved.json", app, 60);
  TAMPERED = dated("tools/fixtures/bridge-report-tampered.json", app, 50);
  BROKEN = dated("tools/fixtures/bridge-report-broken.json", app, 40);
  LEGACY = dated("tools/fixtures/bridge-report-solved-1.0.0.json", app, 55);
  LIBRARY = dated("tools/fixtures/library-report-solved.json", app, 30);
  CONTACTS = dated("tools/fixtures/contacts-report-solved.json", app, 20);
  EFCORE = dated("tools/fixtures/efcore-report-solved.json", app, 10);
  WINDOW = dated("tools/fixtures/window-report-solved.json", app, 5);
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE78 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE78 PASS — Bridge B and the Rider workflow (" + steps.length + " steps).");
})();
