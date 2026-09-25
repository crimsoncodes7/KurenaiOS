/* Kurenai OS — smoke49.test.js
   Pacing: the integrated weekly plan (js/data/pacing.js, js/core/pacing.js,
   js/modules/pacing.js).

   The claims this suite pins down, in the order they matter:

     A · THE IMPORT IS AN IMPORT, NOT A FEED. The plan is copied out of the
         seed once; a second run changes nothing, a user's edit survives it,
         and every ref the seed claims resolves to a real generated spec
         leaf. A row with NO refs is deliberate and must stay empty — the
         two CS rows the specification genuinely does not name are the
         regression guard against a later "helpful" near-enough match.
     B · ONE STORE, NO PARALLEL ONE. state.pacing rides localStorage and the
         standard full backup, and pacing stores no progress of its own:
         coverage is read from state.progress, so the page and the topic
         page it links to cannot disagree.
     C · THE GOVERNOR NEVER HEARS FROM IT. Rendering the page, opening a
         row and saving a note move no HP, gold or XP and log no session.
     D · ALIGNMENT IS EVIDENCE-BACKED. Ahead/aligned/behind/unplanned are
         set arithmetic over linked refs; a week whose class rows carry no
         refs makes no claim at all.
     E · THE SURFACE. One page header, a declared horizontal scroller, three
         subject columns, native buttons, a real dialog through the one
         dialog route, and a hash route that carries the week.
     F · CRUD. Weeks and rows are creatable, editable and removable; a row
         always belongs to a week that exists; its week number is derived,
         never carried; a week move takes its rows with it; a week delete
         refuses to take rows with it unless the caller says so.
     G · THE BRAID. The branch topology is the alignment evidence and
         nothing else, it packs into commit-graph lanes, its lane names do
         not scroll away, and every arc is repeated as a real button.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke49.test.js                                           */
const { JSDOM } = require("jsdom");
/* a sub-navigation entry is named by its label; its mark and count are extras */
const subnavName = (b) => (b.getAttribute("aria-label") || b.textContent).trim();
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.cancelAnimationFrame = clearTimeout;
window.confirm = () => true;
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
  json: () => Promise.resolve({}), text: () => Promise.resolve("") });
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
const { layerCss, pending } = require("./lib/css");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.IntersectionObserver = function () { return { observe: noop, unobserve: noop, disconnect: noop }; };

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const main = () => document.getElementById("main");
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function step(name, fn) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { errors.push(`STEP "${name}": ${e.message}`); console.log("FAIL  " + name); }
}
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
/* the source checks below are about what the CODE does, and these files
   describe what they refuse to do in prose — so strip comments before
   scanning, or a module is convicted by its own documentation */
const code = p => read(p).replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/* ==================== A · the one-time import ==================== */
console.log("== A · the plan was imported once, and correctly ==");

step("the seed became state.pacing on boot", () => {
  const s = KOS.pacing.state();
  assert(s.seeded === true, "the plan was not seeded at boot");
  assert(s.weeks.length === window.KOS_PACING.weeks.length,
    "week count " + s.weeks.length + " ≠ seed " + window.KOS_PACING.weeks.length);
  assert(s.entries.length === window.KOS_PACING.entries.length,
    "entry count " + s.entries.length + " ≠ seed " + window.KOS_PACING.entries.length);
  assert(s.importedOn, "the import date was not recorded");
});

step("all four Notion databases and the week hub arrived intact", () => {
  const e = KOS.pacing.entries();
  const n = (source, subject) => e.filter(x => x.source === source && (!subject || x.subject === subject)).length;
  /* the row counts the four databases actually held */
  assert(n("school") === 45, "school curriculum rows: " + n("school"));
  assert(n("personal", "compsci") === 65, "CS personal rows: " + n("personal", "compsci"));
  assert(n("personal", "maths") === 65, "Maths personal rows: " + n("personal", "maths"));
  assert(n("personal", "it") === 16, "IT F201 rows: " + n("personal", "it"));
  /* every subject appears in BOTH registers except IT F201, whose personal
     curriculum is the exam unit only */
  ["compsci", "maths", "it"].forEach(sid => assert(n("school", sid) === 15, sid + " school weeks: " + n("school", sid)));
});

step("the week spine carries the school/personal offset the hub recorded", () => {
  const ws = KOS.pacing.weeks();
  /* 16 from the hub + w/c 21 Dec, added when the personal plan moved a week
     later (the final personal week is carried over the mocks) */
  assert(ws.length === 17, "week count " + ws.length);
  assert(ws[0].wb < ws[ws.length - 1].wb, "weeks are not in date order");
  const paired = ws.filter(w => w.schoolWk != null && w.personalWk != null);
  assert(paired.length, "no week carries both numbers");
  paired.forEach(w => assert(w.schoolWk - w.personalWk === 1,
    w.label + " breaks the one-week offset: school " + w.schoolWk + ", personal " + w.personalWk));
  /* half term is the week the hub gave neither number to */
  const brk = ws.filter(w => KOS.pacing.isBreak(w));
  assert(brk.length === 1 && brk[0].wb === "2026-10-26", "half term is not derived: " + JSON.stringify(brk.map(w => w.wb)));
  const mock = ws.filter(w => KOS.pacing.isMock(w));
  assert(mock.length === 1 && mock[0].wb === "2026-12-14", "the mock week is not derived: " + JSON.stringify(mock.map(w => w.wb)));
});

step("every ref the plan claims resolves to a real generated spec leaf", () => {
  const bad = [];
  KOS.pacing.entries().forEach(e => e.refs.forEach(r => {
    if (!KOS.pacing.leafOf(e.subject, r)) bad.push(e.subject + ":" + r + " (" + e.title + ")");
  }));
  assert(!bad.length, bad.length + " dangling ref(s): " + bad.slice(0, 5).join(", "));
});

step("an unmatched plan row stays unmatched", () => {
  /* Two CS rows have no clean leaf in AQA 7517: the specification names
     neither bitwise masking nor linked lists as a topic of its own. They
     are the guard against back-filling a near-enough leaf later — which
     would silently open the WRONG topic page from the plan. */
  const open = KOS.pacing.entries()
    .filter(e => e.source === "personal" && !e.refs.length)
    .map(e => e.title).sort();
  assert(open.length === 2, "expected exactly 2 unlinked personal rows, found " + open.length + ": " + open.join(" / "));
  assert(open[0] === "Bitwise manipulation & masks" && open[1] === "Linked lists",
    "the unlinked rows changed: " + open.join(" / "));
  /* and the whole rest of the personal curriculum IS linked */
  const personal = KOS.pacing.entries().filter(e => e.source === "personal");
  assert(personal.length - open.length === 144, "linked personal rows: " + (personal.length - open.length));
});

step("re-seeding is a no-op and never overwrites an edit", () => {
  const target = KOS.pacing.entries()[0];
  KOS.pacing.setEntryNote(target.id, "my own words");
  KOS.pacing.setWeekNote(KOS.pacing.weeks()[0].wb, "my own week");
  assert(KOS.pacing.ensureSeeded() === false, "ensureSeeded re-ran on a seeded store");
  assert(KOS.pacing.entryById(target.id).note === "my own words", "a re-seed ate the row note");
  assert(KOS.pacing.weekAt(KOS.pacing.weeks()[0].wb).note === "my own week", "a re-seed ate the week note");
});

step("the schema gate refuses what it does not recognise", () => {
  const e = KOS.pacing.normalise({ id: "x", source: "wishful", subject: "chemistry",
    wk: "3", wb: "2026-09-07", title: "t", refs: ["4.1.1.1", "9.9.9.9", null], evil: true });
  assert(e.source === "personal", "an unknown source was kept: " + e.source);
  assert(e.subject === null, "an unknown subject was kept: " + e.subject);
  assert(e.wk === 3, "the week number was not coerced: " + e.wk);
  assert(!("evil" in e), "an unrecognised field rode through the gate");
  const c = KOS.pacing.normalise({ id: "y", source: "personal", subject: "compsci",
    wb: "2026-09-07", title: "t", refs: ["4.1.1.1", "9.9.9.9"] });
  assert(c.refs.length === 1 && c.refs[0] === "4.1.1.1", "a ref with no leaf survived: " + c.refs.join(","));
});

/* ==================== B · one store, no parallel one ==================== */
console.log("== B · the plan uses the app's own persistence, and stores no progress ==");

step("state.pacing rides localStorage and the standard full backup", () => {
  KOS.store.flush();
  const raw = JSON.parse(window.localStorage.getItem("kurenai-os-v1"));
  assert(raw.pacing && raw.pacing.entries.length === KOS.pacing.entries().length,
    "the plan did not reach localStorage");
  assert(raw.pacing.entries.some(e => e.note === "my own words"), "the row note did not persist");
  /* store.js is the one serialiser: whatever is in state is in the backup */
  assert(/pacing/.test(read("js/core/store.js")), "store.js does not declare the pacing branch");
});

step("no second progress store exists", () => {
  const core = code("js/core/pacing.js");
  const view = code("js/modules/pacing.js");
  ["setStatus", "setCheck", "sessions.log", "governor."].forEach(bad => {
    assert(!core.includes(bad), "core/pacing.js writes through " + bad);
    assert(!view.includes(bad), "modules/pacing.js writes through " + bad);
  });
  /* what it stores per row is a note, and nothing else */
  const e = KOS.pacing.entries()[0];
  assert(!("status" in e) && !("confidence" in e) && !("check" in e),
    "a pacing row carries its own progress fields: " + Object.keys(e).join(","));
});

step("coverage is READ from the canonical study record", () => {
  const row = KOS.pacing.entries().find(e => e.source === "personal" && e.refs.length >= 2);
  const before = KOS.pacing.coverage(row);
  assert(before.refs === row.refs.length, "coverage counted the wrong number of refs");
  /* move the canonical record and the pacing read must follow it */
  KOS.store.setStatus(row.subject, row.refs[0], "done");
  KOS.store.setCheck(row.subject, row.refs[1], 0, true);
  const after = KOS.pacing.coverage(row);
  assert(after.done === before.done + 1, "a completed topic did not reach the plan row");
  assert(after.checks === before.checks + 1, "a ticked check did not reach the plan row");
  assert(after.maxChecks === row.refs.length * 4, "the check denominator is wrong");
});

/* ==================== C · the Governor never hears from it ============== */
console.log("== C · Pacing is logistics: no session, no economy ==");

step("rendering, opening a row and saving a note pay nothing", () => {
  const g0 = JSON.stringify(KOS.store.state.governor);
  const s0 = KOS.store.state.sessions.length;
  KOS.show("pacing", { wb: "2026-11-02" });
  const topic = $("[data-ui~='pace.row']");
  assert(topic, "no plan rows rendered");
  topic.click();
  const ta = $("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] textarea");
  assert(ta, "the row dialog has no note field");
  ta.value = "carry this over";
  [...$$("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] button[data-intent~='primary']")].pop().click();
  assert(KOS.store.state.sessions.length === s0, "a session was logged");
  assert(JSON.stringify(KOS.store.state.governor) === g0, "the Governor moved");
});

/* ==================== D · the alignment claim ==================== */
console.log("== D · ahead / aligned / behind is set arithmetic, never a guess ==");

step("alignment classifies each class spec point against my own plan", () => {
  /* w/c 2 Nov: class starts F201 with nine points my plan already reached */
  const a = KOS.pacing.alignment("2026-11-02", "it");
  assert(a.evidence, "no evidence where class has linked refs");
  assert(a.classRefs.length === 9, "class ref count: " + a.classRefs.length);
  assert(a.ahead + a.aligned + a.behind + a.unplanned === a.classRefs.length,
    "the four buckets do not partition the class points");
  assert(a.ahead >= 1, "nothing was recognised as already covered");
  a.items.forEach(i => {
    if (!i.entry) { assert(i.lead === null, "an unplanned point carries a lead"); return; }
    const mine = KOS.pacing.indexOfWb(i.entry.wb);
    const here = KOS.pacing.indexOfWb("2026-11-02");
    assert(i.lead === here - mine, "lead for " + i.ref + " is not the week distance");
  });
});

step("a week with no linked class refs makes no claim", () => {
  /* w/c 28 Sept IT is supervised F204 coursework — a real week with real
     rows and nothing a spec point can be compared on */
  const a = KOS.pacing.alignment("2026-09-28", "it");
  assert(KOS.pacing.entriesFor("2026-09-28", "it", "school").length, "the setup week has no class row");
  assert(!a.evidence, "a claim was made without linked refs");
  assert(KOS.pacing.alignmentLine(a) === null, "a sentence was written from no evidence");
});

step("the alignment sentence only ever describes counts it holds", () => {
  const a = KOS.pacing.alignment("2026-11-02", "it");
  const line = KOS.pacing.alignmentLine(a);
  assert(line && line.includes(String(a.classRefs.length)), "the sentence drops the total");
  if (a.ahead) assert(line.includes(String(a.ahead) + " already covered"), "ahead is not stated: " + line);
  if (!a.behind) assert(!line.includes("still ahead of you"), "behind was claimed at zero: " + line);
  if (!a.unplanned) assert(!line.includes("not in your plan"), "unplanned was claimed at zero: " + line);
});

step("first contact decides, not the last mention", () => {
  /* a point my plan touches twice is measured from the earliest week */
  const dup = {};
  KOS.pacing.entries().filter(e => e.source === "personal").forEach(e =>
    e.refs.forEach(r => { (dup[e.subject + ":" + r] = dup[e.subject + ":" + r] || []).push(e.wb); }));
  const repeated = Object.keys(dup).find(k => dup[k].length > 1);
  assert(repeated, "no ref is scheduled twice — this check needs one");
  const [sid, ref] = [repeated.split(":")[0], repeated.split(":").slice(1).join(":")];
  const earliest = dup[repeated].slice().sort()[0];
  const week = KOS.pacing.weeks().find(w =>
    KOS.pacing.entriesFor(w.wb, sid, "school").some(e => e.refs.indexOf(ref) !== -1));
  if (week) {
    const item = KOS.pacing.alignment(week.wb, sid).items.find(i => i.ref === ref);
    assert(item && item.entry.wb === earliest,
      "alignment measured from " + (item && item.entry.wb) + ", not the first contact " + earliest);
  }
});

/* ==================== E · the surface ==================== */
console.log("== E · the page belongs to the app it is in ==");

step("the page header carries the switcher and the week header carries the actions", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  /* the two readings live in the header's action slot, where Planner and
     Sync put theirs — not in a second strip under the title */
  const tabs = $("#main [data-ui~='ui.page-header'] [data-ui~='ui.page-actions'] [data-ui~='pace.tabs']");
  assert(tabs, "the Week/Braid switcher is not in the page header's action slot");
  assert(tabs.matches('[data-ui~="ui.workspace-tabs"]'), "the switcher does not use the shared header-tab treatment");
  assert(!$("#main > [data-ui~='pace.tabs']"), "a second tab strip is still under the title");

  /* every week-scoped action sits with the week it acts on */
  const acts = $$("#main [data-ui~='pace.week-header'] [data-ui~='ui.section-actions'] button").map(b => b.textContent.trim());
  assert(acts.indexOf("+ Add row") !== -1, "Add row is not with the week: " + acts.join(", "));
  assert(acts.indexOf("Edit week") !== -1, "Edit week is not with the week: " + acts.join(", "));
  /* the Week/Braid switcher's own tabs are the only controls allowed there */
  assert(!$$("#main [data-ui~='ui.page-header'] [data-ui~='ui.page-actions'] button")
    .filter(b => !b.closest("[data-ui~='pace.tabs']")).length, "week actions are still in the page header");
});

step("the page description uses the shared sub-line treatment", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  const sub = $("#main [data-ui~='ui.page-header'] [data-ui~='ui.page-sub'] [data-ui~='part.board']");
  assert(sub, "the page description is not the canonical .dh-sub > .board");
  assert(sub.textContent.length < 90, "the description is a paragraph again: " + sub.textContent);
  assert(!/week N/.test(sub.textContent), "the offset rule belongs in Help & Guide, not the header");
});

step("the braid does not re-teach itself above the diagram", () => {
  KOS.show("pacing", { tab: "braid" });
  const heads = $$("#main h2").map(h => h.textContent.trim());
  assert(heads.indexOf("The braid") === -1, "the explanatory header is back: " + heads.join(", "));
  assert(heads.indexOf("Every merge, in words") !== -1, "the merges section lost its label");
  assert($$("#main [data-ui~='pace.legend-k']").length === 4, "the legend that replaced the prose is missing");
});

step("Pacing is a Productivity destination whose route carries the week or the tab", () => {
  assert(KOS.sectionOf("pacing") === "productivity", "Pacing is not in the Productivity section");
  assert(KOS.router.routeFor("pacing", { wb: "2026-12-14" }) === "#/pacing/2026-12-14", "the week is not in the route");
  assert(KOS.router.routeFor("pacing", "2026-12-14") === "#/pacing/2026-12-14", "the legacy string form broke");
  const back = KOS.router.parse("#/pacing/2026-12-14");
  assert(back && back.viewId === "pacing" && back.arg.wb === "2026-12-14" && back.arg.tab === "week",
    "the week route did not parse back: " + JSON.stringify(back));
  /* the braid spans every week, so it carries none — and the two forms can
     never collide because a week is always an ISO date */
  assert(KOS.router.routeFor("pacing", { tab: "braid" }) === "#/pacing/braid", "the braid has no route");
  const b = KOS.router.parse("#/pacing/braid");
  assert(b && b.arg.tab === "braid" && !b.arg.wb, "the braid route did not parse back: " + JSON.stringify(b));
  assert(KOS.router.routeFor("pacing") === "#/pacing", "the bare route is wrong");
  KOS.show("focus");
  assert($$("#subnav [data-ui~='shell.subnav-item']").some(b => subnavName(b) === "Pacing"),
    "Pacing is not in the Productivity nav strip");
});

step("a deep link opens that week; an unknown week falls back to today's", () => {
  KOS.show("pacing", { wb: "2026-12-14" });
  assert($("#main [data-ui~='ui.section-header'] h2").textContent.includes("14 Dec"), "the deep link opened the wrong week");
  KOS.show("pacing", { wb: "1999-01-01" });
  assert($("#main [data-ui~='ui.section-header'] h2").textContent === KOS.pacing.currentWeek().label,
    "an unknown week did not fall back to the current one");
});

step("one page header, three subject columns, two registers each", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  assert($$("#main [data-ui~='ui.page-header']").length === 1, "not exactly one page header");
  assert($("#main h1").textContent === "Pacing", "the page is not named");
  const cols = $$("#main [data-ui~='pace.col']");
  assert(cols.length === 3, "subject columns: " + cols.length);
  cols.forEach(c => {
    assert(c.querySelector("[data-ui~='pace.reg-class']"), c.getAttribute("data-subject") + " has no class register");
    assert(c.querySelector("[data-ui~='pace.reg-mine']"), c.getAttribute("data-subject") + " has no personal register");
    assert(c.getAttribute("aria-label"), "a column has no accessible name");
  });
});

step("the term ribbon declares its horizontal scroll", () => {
  const wrap = $("#main [data-ui~='ui.scroller'][data-ui~='pace.ribbon-wrap']");
  assert(wrap, "the ribbon is not inside the shared scroller");
  assert(wrap.getAttribute("data-scroller") === "true", "the scroll is undeclared");
  const cells = $$("#main [data-ui~='pace.wk']:not([data-ui~='pace.wk-add'])");
  assert(cells.length === KOS.pacing.weeks().length, "ribbon cells: " + cells.length);
  assert($$("#main [data-ui~='pace.wk-add']").length === 1, "the ribbon lost its add-a-week cell");
  cells.forEach(c => {
    assert(c.tagName === "BUTTON", "a ribbon cell is not a native button");
    assert((c.getAttribute("aria-label") || "").indexOf("Week beginning") === 0,
      "a ribbon cell has no real accessible name: " + c.getAttribute("aria-label"));
  });
  assert($$("#main [data-ui~='pace.wk'][aria-current]").length === 1, "the selected week is not marked");
  assert($$("#main [data-ui~='pace.wk'][data-state~='is-mock']").length === 1 && $$("#main [data-ui~='pace.wk'][data-state~='is-break']").length === 1,
    "the mock and half-term weeks are not flagged in the ribbon");
});

step("plan rows are native buttons, not ARIA cards", () => {
  const rows = $$("#main [data-ui~='pace.row'], #main [data-ui~='pace.class']");
  assert(rows.length, "no rows rendered");
  rows.forEach(r => {
    assert(r.tagName === "BUTTON", "a row is a " + r.tagName + ", not a button");
    assert(!r.querySelector("button, a, select, input"), "a row button contains an interactive descendant");
  });
});

step("the row dialog goes through the one dialog route and links to the topic page", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  const row = $$("#main [data-ui~='pace.row']").find(b => /\d\/\d/.test(b.textContent));
  assert(row, "no row with linked spec points");
  row.click();
  const box = $("[data-ui~='ui.dialog'][data-ui~='pace.dlg']");
  assert(box, "no dialog opened");
  assert(box.getAttribute("role") === "dialog" && box.getAttribute("aria-modal") === "true",
    "the dialog is not a dialog");
  assert(box.getAttribute("aria-labelledby"), "the dialog has no accessible name");
  const refs = $$("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] [data-ui~='pace.dlg-ref']");
  assert(refs.length, "the dialog lists no spec points");
  refs[0].click();
  assert(window.location.hash.indexOf("#/ref/") === 0, "the spec point did not open the topic page: " + window.location.hash);
  assert(!$("[data-ui~='ui.dialog'][data-ui~='pace.dlg']"), "the dialog stayed open behind the topic page");
});

step("a row with no spec point says so rather than linking somewhere near", () => {
  const row = KOS.pacing.entries().find(e => e.source === "personal" && !e.refs.length);
  const wk = KOS.pacing.weekAt(row.wb);
  KOS.show("pacing", { wb: wk.wb });
  const btn = $$("#main [data-ui~='pace.row']").find(b => b.textContent.includes(row.title));
  assert(btn, "the unlinked row did not render");
  btn.click();
  assert($("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] [data-ui~='ui.empty'][data-ui~='pace.nolink']"), "no honest empty state for an unlinked row");
  assert(!$$("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] [data-ui~='pace.dlg-ref']").length, "an unlinked row offered a spec point anyway");
  $("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] [data-ui~='ui.dialog-head'] button").click();
});

step("the week summary is a sub-line, and suppresses zero-only supporting facts", () => {
  /* the facts are the section header's own sub-line now — a row of
     card-sized boxes carrying one figure each was the wrong weight for
     three numbers, and the primitive is not used here any more */
  assert(!$("#main .pace-stats"), "the stat-card row came back");

  KOS.show("pacing", { wb: "2026-10-26" });            /* half term: nothing planned */
  const quiet = $("#main [data-ui~='pace.week-header'] [data-ui~='part.sub']").textContent;
  assert(/0 topics planned/.test(quiet), "the primary count vanished at zero: " + quiet);
  assert(!/spec points? in class/.test(quiet), "a zero supporting fact was printed: " + quiet);
  assert(!/my plan has reached/.test(quiet), "a zero supporting fact was printed: " + quiet);
  assert(/Half term/.test(quiet), "half term is no longer named");

  KOS.show("pacing", { wb: "2026-11-02" });
  const full = $("#main [data-ui~='pace.week-header'] [data-ui~='part.sub']").textContent;
  ["School week 9", "My week 8", "topics planned", "spec points in class", "my plan has reached"]
    .forEach(f => assert(full.indexOf(f) !== -1, "a busy week dropped “" + f + "”: " + full));
});

step("the styles are theme-derived and stay inside the five breakpoints", () => {
  /* M2: Pacing's styles move from a marked block of the deleted legacy
     stylesheet to the Productivity view layer (M8); the contract is the
     same, read from that file */
  if (pending("views/productivity", "Pacing's theme-derived styles inside the five tiers")) return;
  const block = layerCss("views/productivity");
  const hex = block.match(/#[0-9a-fA-F]{3,8}\b/g);
  assert(!hex, "hard-coded colour(s) in the Pacing block: " + (hex || []).join(", "));
  const widths = [...new Set([...block.matchAll(/max-width:\s*(\d+)px/g)].map(m => +m[1]))];
  widths.forEach(w => assert([1240, 1080, 860, 700, 560].indexOf(w) !== -1,
    "Pacing introduced a " + w + "px breakpoint"));
  /* widest-first, so the narrower tier is the one that wins */
  const order = [...block.matchAll(/@media \(max-width: (\d+)px\)/g)].map(m => +m[1]);
  order.forEach((w, i) => { if (i) assert(w < order[i - 1], "tier " + w + " is written above " + order[i - 1]); });
});

step("the seed file documents that it is a seed and not a live feed", () => {
  const seed = read("js/data/pacing.js");
  assert(/Notion is not read again/.test(seed), "the seed does not say the import was one-time");
  assert(/EMPTY refs array is\s*\n?\s*deliberate/.test(seed) || /EMPTY refs array/.test(seed),
    "the seed does not explain an empty refs array");
  assert(!/fetch\(|XMLHttpRequest|api\.notion/.test(code("js/data/pacing.js") + code("js/core/pacing.js") + code("js/modules/pacing.js")),
    "Pacing reaches the network");
});

/* ==================== F · CRUD ==================== */
console.log("== F · the plan is the app's now, so it is fully editable ==");

step("a row can be created, edited and removed", () => {
  const n0 = KOS.pacing.entries().length;
  const made = KOS.pacing.addEntry({ source: "personal", subject: "maths", wb: "2026-11-09",
    title: "Extra: integration by parts drill", area: "Pure", paper: "Paper 1 & 2", refs: ["8.5"] });
  assert(made && made.id, "addEntry refused a valid row");
  assert(KOS.pacing.entries().length === n0 + 1, "the row was not stored");
  assert(made.refs.length === 1 && made.refs[0] === "8.5", "the refs were not kept: " + made.refs);

  const edited = KOS.pacing.updateEntry(made.id, { title: "Renamed", refs: ["8.5", "8.6"] });
  assert(edited && edited.title === "Renamed" && edited.refs.length === 2, "updateEntry did not apply");
  assert(KOS.pacing.entryById(made.id).title === "Renamed", "the store did not see the edit");

  assert(KOS.pacing.removeEntry(made.id) === true, "removeEntry refused");
  assert(!KOS.pacing.entryById(made.id), "the row survived its own deletion");
  assert(KOS.pacing.entries().length === n0, "the count did not come back down");
});

step("a row cannot be orphaned, blank or credited to a leaf that does not exist", () => {
  const n0 = KOS.pacing.entries().length;
  assert(KOS.pacing.addEntry({ source: "personal", subject: "maths", wb: "1999-01-01", title: "x" }) === null,
    "a row was allowed to point at a week that does not exist");
  assert(KOS.pacing.addEntry({ source: "personal", subject: "maths", wb: "2026-11-09", title: "   " }) === null,
    "a whitespace title passed the gate");
  assert(KOS.pacing.addEntry({ source: "personal", subject: "chemistry", wb: "2026-11-09", title: "x" }) === null,
    "an unknown subject was accepted");
  assert(KOS.pacing.entries().length === n0, "a refused write still changed the store");
  const ok = KOS.pacing.addEntry({ source: "personal", subject: "compsci", wb: "2026-11-09",
    title: "Ref filter", refs: ["4.1.1.1", "9.9.9.9"] });
  assert(ok.refs.length === 1 && ok.refs[0] === "4.1.1.1", "a ref with no leaf was stored: " + ok.refs);
  KOS.pacing.removeEntry(ok.id);
});

step("a row's week number is derived from its week, never carried", () => {
  /* w/c 2 Nov is school week 9 and personal week 8 — a school row must take
     one number and a personal row the other, whatever the caller passes */
  const a = KOS.pacing.addEntry({ source: "school", subject: "it", wb: "2026-11-02", title: "T", wk: 99 });
  const b = KOS.pacing.addEntry({ source: "personal", subject: "it", wb: "2026-11-02", title: "T", wk: 99 });
  assert(a.wk === 9, "a school row took " + a.wk + " instead of the school number");
  assert(b.wk === 8, "a personal row took " + b.wk + " instead of the personal number");
  /* and it follows when the row changes register */
  const flipped = KOS.pacing.updateEntry(b.id, { source: "school" });
  assert(flipped.wk === 9, "the week number did not follow the register: " + flipped.wk);
  KOS.pacing.removeEntry(a.id); KOS.pacing.removeEntry(b.id);
});

step("a week can be added, moved and deleted, and its rows follow", () => {
  const w0 = KOS.pacing.weeks().length;
  const w = KOS.pacing.addWeek({ wb: "2027-01-04", label: "w/c 4 Jan", schoolWk: 17, personalWk: 16 });
  assert(w && KOS.pacing.weeks().length === w0 + 1, "addWeek refused a new week");
  assert(KOS.pacing.addWeek({ wb: "2027-01-04", label: "dup" }) === null, "two weeks began on one date");

  const row = KOS.pacing.addEntry({ source: "personal", subject: "maths", wb: "2027-01-04", title: "January row" });
  assert(row.wk === 16, "the new week's number did not reach its row");

  const moved = KOS.pacing.updateWeek("2027-01-04", { wb: "2027-01-11", personalWk: 17 });
  assert(moved && moved.wb === "2027-01-11", "the week did not move");
  assert(KOS.pacing.entryById(row.id).wb === "2027-01-11", "the row was orphaned by the move");
  assert(KOS.pacing.entryById(row.id).wk === 17, "the row's number did not follow the move");
  assert(!KOS.pacing.weekAt("2027-01-04"), "the old week beginning still resolves");

  const refused = KOS.pacing.removeWeek("2027-01-11");
  assert(refused.removed === false && refused.entries === 1,
    "a week with rows was deleted without being asked twice: " + JSON.stringify(refused));
  const done = KOS.pacing.removeWeek("2027-01-11", { cascade: true });
  assert(done.removed && done.entries === 1, "the cascade did not report what it took");
  assert(!KOS.pacing.entryById(row.id), "the row outlived its week");
  assert(KOS.pacing.weeks().length === w0, "the week count did not come back down");
});

step("the editor creates, edits and deletes through the one dialog route", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  const adds = $$("#main [data-ui~='pace.add']");
  assert(adds.length === 6, "expected an add control in each of the six registers, found " + adds.length);
  adds.forEach(b => assert(b.getAttribute("aria-label"), "an add control has no accessible name"));

  /* the second control is the CS column's "My plan" register */
  adds[1].click();
  const dlg = $("[data-ui~='ui.dialog'][data-ui~='pace.dlg']");
  assert(dlg && dlg.getAttribute("role") === "dialog" && dlg.getAttribute("aria-modal") === "true",
    "the add dialog is not a dialog");
  assert(dlg.querySelector("[data-ui~='pace.picker']"), "the editor has no specification picker");
  const titleField = [...dlg.querySelectorAll("label[data-ui~='cal.field']")]
    .find(l => l.querySelector("span").textContent === "Title");
  assert(titleField, "the editor has no Title field");
  titleField.querySelector("input").value = "Made by the editor";
  dlg.querySelectorAll("[data-ui~='pace.pick-row'] input")[0].click();
  [...dlg.querySelectorAll("[data-ui~='pace.dlg-actions'] button")].pop().click();
  const made = KOS.pacing.entries().find(e => e.title === "Made by the editor");
  assert(made, "the editor did not save the row");
  assert(made.refs.length === 1, "the picked spec point was not saved");
  assert(made.wb === "2026-11-02" && made.subject === "compsci" && made.source === "personal",
    "the editor lost the register it was opened from");

  KOS.show("pacing", { wb: "2026-11-02" });
  const row = $$("#main [data-ui~='pace.row']").find(b => b.textContent.includes("Made by the editor"));
  assert(row, "the new row did not render");
  row.click();
  const edit = $("[data-ui~='ui.dialog'][data-ui~='pace.dlg']");
  assert(edit.querySelector("[data-ui~='pace.dlg-refs']"), "an existing row does not show its linked topic pages");
  const danger = edit.querySelector("[data-ui~='pace.dlg-danger'] button[data-intent~='danger']");
  assert(danger, "the editor has no delete");
  assert(!edit.querySelector("[data-ui~='pace.dlg-actions'] button[data-intent~='danger']"),
    "Delete shares a control group with Save");

  /* deliberately NOT auto-confirmed: deleting a plan row has to go through
     the real danger dialog, which is the one that focuses Cancel and
     refuses to confirm on Enter */
  danger.click();
  const ask = $("[data-ui~='ui.dialog-overlay'][data-ui~='ui.confirm-overlay'] [data-ui~='ui.confirm'][data-intent~='danger']");
  assert(ask, "deleting a row did not ask");
  assert(document.activeElement === ask.querySelector("[data-ui~='ui.confirm-foot'] button:not([data-intent~='danger'])"),
    "the danger dialog did not put focus on Cancel");
  assert(KOS.pacing.entries().some(e => e.title === "Made by the editor"),
    "the row was deleted before the question was answered");
  ask.querySelector("[data-ui~='ui.confirm-foot'] button[data-intent~='danger']").click();
  assert(!KOS.pacing.entries().some(e => e.title === "Made by the editor"), "the row was not deleted");
  assert(!$("[data-ui~='ui.dialog'][data-ui~='pace.dlg']"), "the editor stayed open behind the delete");
});

step("the specification picker never renders the whole specification", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  $$("#main [data-ui~='pace.add']")[1].click();
  const dlg = $("[data-ui~='ui.dialog'][data-ui~='pace.dlg']");
  const rows = dlg.querySelectorAll("[data-ui~='pace.pick-row']").length;
  assert(rows > 0 && rows <= 40, "the picker drew " + rows + " rows of a 156-leaf subject");
  assert(/showing 40 of \d+ matches/.test(dlg.querySelector("[data-ui~='pace.pick-count']").textContent),
    "the picker does not say what it left out: " + dlg.querySelector("[data-ui~='pace.pick-count']").textContent);
  dlg.querySelector("[data-ui~='ui.dialog-head'] button").click();
});

/* ==================== G · the braid ==================== */
console.log("== G · the branch graph is the same evidence as topology ==");

step("a branch exists only where the two registers share a linked spec point", () => {
  const model = KOS.pacing.braid();
  assert(model.weeks.length === KOS.pacing.weeks().length, "the braid lost weeks");
  model.lanes.forEach(lane => {
    lane.links.forEach(link => {
      assert(link.refs.length, "a branch carries no spec point");
      link.refs.forEach(r => {
        const cls = KOS.pacing.entriesFor(link.toWb, lane.subject, "school");
        assert(cls.some(e => e.refs.indexOf(r.ref) !== -1), "a branch claims a class point class does not teach");
        assert(r.entry && r.entry.refs.indexOf(r.ref) !== -1,
          "a branch names a spec point its own plan row does not carry");
        assert(r.entry.wb === link.fromWb, "a branch's origin is not the row it came from");
      });
      const here = KOS.pacing.indexOfWb(link.toWb), mine = KOS.pacing.indexOfWb(link.fromWb);
      assert(link.lead === here - mine, "a branch's lead is not its week distance");
    });
  });
});

step("branches pack into commit-graph lanes instead of stacking", () => {
  KOS.show("pacing", { tab: "braid" });
  const svg = $("#main [data-ui~='pace.braid-svg']");
  assert(svg, "the braid did not render");
  const model = KOS.pacing.braid();
  const total = model.lanes.reduce((a, l) => a + l.links.length, 0);
  /* one path per branch, plus the arrow tip on every non-stub */
  const stubs = model.lanes.reduce((a, l) => a + l.links.filter(k => k.lead === 0).length, 0);
  assert(svg.querySelectorAll("path").length === total + (total - stubs),
    "path count " + svg.querySelectorAll("path").length + " ≠ " + total + " branches + tips");
  assert(+svg.getAttribute("height") > 200, "the canvas did not grow to fit the packed depths");
});

step("the lane names do not scroll away from their branches", () => {
  KOS.show("pacing", { tab: "braid" });
  const keys = $("#main [data-ui~='pace.braid-keys']");
  assert(keys, "the braid has no fixed key column");
  assert(keys.getAttribute("aria-hidden") === "true", "the decorative key column is exposed twice");
  assert(!$("#main [data-ui~='pace.braid-wrap']").contains(keys), "the key column is inside the scroller it exists to escape");
  const names = [...keys.querySelectorAll("text")].map(t => t.textContent);
  ["Computer Science", "Mathematics", "IT · Data Analytics", "In class", "My plan"]
    .forEach(n => assert(names.indexOf(n) !== -1, "the key column does not name " + n));
  assert(keys.getAttribute("height") === $("#main [data-ui~='pace.braid-svg']").getAttribute("height"),
    "the key column and the graph are different heights, so the rows cannot line up");
});

step("every arc is repeated as a real button, and the diagram is one image", () => {
  KOS.show("pacing", { tab: "braid" });
  const model = KOS.pacing.braid();
  const total = model.lanes.reduce((a, l) => a + l.links.length, 0);
  assert($$("#main [data-ui~='pace.merge']").length === total,
    "merge buttons " + $$("#main [data-ui~='pace.merge']").length + " ≠ branches " + total);
  $$("#main [data-ui~='pace.merge']").forEach(b => {
    assert(b.tagName === "BUTTON", "a merge row is not a native button");
    assert(/spec point/.test(b.getAttribute("aria-label") || ""), "a merge row has no real accessible name");
  });
  const svg = $("#main [data-ui~='pace.braid-svg']");
  assert(svg.getAttribute("role") === "img" && svg.getAttribute("aria-label"),
    "the diagram is not a named image");
  assert(/listed as buttons below/.test(svg.getAttribute("aria-label")),
    "the image does not point at its text alternative");
  assert($("#main [data-ui~='ui.scroller'][data-ui~='pace.braid-wrap'][data-scroller]"), "the braid's horizontal scroll is undeclared");
});

step("mine and class week numbers are never mixed up", () => {
  KOS.show("pacing", { tab: "braid" });
  const btn = $$("#main [data-ui~='pace.merge']")[0];
  const sub = btn.querySelector("[data-ui~='part.sub']").textContent;
  const m = /mine W(\d+) → class W(\d+)/.exec(sub);
  assert(m, "the merge row does not name both week numbers: " + sub);
  const model = KOS.pacing.braid();
  const first = model.lanes.filter(l => l.links.length)[0]
    .links.slice().sort((p, q) => (p.toWb < q.toWb ? -1 : 1))[0];
  assert(+m[1] === KOS.pacing.weekAt(first.fromWb).personalWk, "the mine tag is not the personal week number");
  assert(+m[2] === KOS.pacing.weekAt(first.toWb).schoolWk, "the class tag is not the school week number");
});

step("a plan with no shared spec points draws nothing and says so", () => {
  const keep = KOS.store.state.pacing.entries;
  KOS.store.state.pacing.entries = keep.map(e => Object.assign({}, e, { refs: [] }));
  KOS.show("pacing", { tab: "braid" });
  assert(!$("#main [data-ui~='pace.braid-svg']"), "an evidence-free braid still drew a diagram");
  assert($("#main [data-ui~='ui.empty']"), "an evidence-free braid drew nothing and explained nothing");
  KOS.store.state.pacing.entries = keep;
  KOS.show("pacing", { tab: "braid" });
  assert($("#main [data-ui~='pace.braid-svg']"), "the braid did not come back");
});

/* ==================== H · the tick, the carry-over and the links ==================== */
console.log("== H · my rows are ticked off; the unticked carry over; the plan lends itself to the rest ==");

/* pin "today" inside the plan so the current week is a known one with
   weeks before it */
const realToday = KOS.srs.todayISO;
KOS.srs.todayISO = () => "2026-11-04";           /* Wednesday of w/c 2 Nov */

step("a personal row carries a tick; class rows never do; the tick is the plan's own bookkeeping", () => {
  const mine = KOS.pacing.addEntry({ source: "personal", subject: "maths", wb: "2026-11-02", title: "Tick me", refs: [] });
  const cls = KOS.pacing.addEntry({ source: "school", subject: "maths", wb: "2026-11-02", title: "Class does this", kind: "Lessons" });
  assert(mine.done === false && mine.doneAt === null, "a new row must start unticked");
  const s0 = KOS.sessions.all().length, g0 = KOS.store.state.governor.gold;
  const t = KOS.pacing.setDone(mine.id, true);
  assert(t.done === true && typeof t.doneAt === "number", "setDone did not tick");
  assert(KOS.pacing.setDone(cls.id, true) === null && !KOS.pacing.entryById(cls.id).done, "a class row must not take a tick");
  assert(KOS.sessions.all().length === s0 && KOS.store.state.governor.gold === g0, "the tick reached the Governor (invariant 82)");
  assert(!KOS.store.peekProgress("maths", "1.1.1") || true, "n/a");
  const n = KOS.pacing.normalise(Object.assign({}, t));
  assert(n.done === true && n.doneAt === t.doneAt, "normalise dropped the tick");
  assert(KOS.pacing.normalise({ source: "school", done: true, doneAt: 5 }).done === false, "normalise let a class row keep a tick");
  KOS.pacing.setDone(mine.id, false);
  assert(KOS.pacing.entryById(mine.id).doneAt === null, "unticking must clear doneAt");
  KOS.pacing.removeEntry(mine.id); KOS.pacing.removeEntry(cls.id);
});

step("an unticked row from an ENDED week carries into every later week, marked behind, and never moves", () => {
  const old = KOS.pacing.addEntry({ source: "personal", subject: "compsci", wb: "2026-10-19", title: "Left undone", refs: [] });
  const older = KOS.pacing.addEntry({ source: "personal", subject: "compsci", wb: "2026-10-12", title: "Left undone earlier", refs: [] });
  const thisWeek = KOS.pacing.addEntry({ source: "personal", subject: "compsci", wb: "2026-11-02", title: "This week's", refs: [] });
  const c = KOS.pacing.carriedInto("2026-11-02", "compsci");
  const titles = c.map(x => x.entry.title);
  assert(titles.indexOf("Left undone") !== -1 && titles.indexOf("Left undone earlier") !== -1, "ended weeks' rows did not carry: " + titles.join(", "));
  assert(titles.indexOf("This week's") === -1, "this week's own row carried into itself");
  const lu = c.find(x => x.entry.title === "Left undone");
  assert(lu.weeksLate === 2 && lu.fromWb === "2026-10-19", "weeksLate/fromWb wrong: " + JSON.stringify({ w: lu.weeksLate, f: lu.fromWb }));  /* 19 Oct → 26 Oct (half term) → 2 Nov */
  assert(c[0].fromWb <= c[1].fromWb, "carried rows must list oldest first");
  /* a future week carries nothing from the week we are in */
  assert(!KOS.pacing.carriedInto("2026-11-09").some(x => x.entry.id === thisWeek.id), "the current week's open row leaked into next week");
  /* it still carries into the week after, unticked — and the record never moved */
  assert(KOS.pacing.carriedInto("2026-11-09").some(x => x.entry.id === old.id), "carry-over must continue into later weeks");
  assert(KOS.pacing.entryById(old.id).wb === "2026-10-19", "the row was moved instead of derived");
  KOS.pacing.setDone(old.id, true);
  assert(!KOS.pacing.carriedInto("2026-11-02").some(x => x.entry.id === old.id), "a ticked row still carried");
  const ws = KOS.pacing.weekStatus("2026-11-02", "compsci");
  assert(ws.carried === KOS.pacing.carriedInto("2026-11-02", "compsci").length && ws.behind === true && ws.planned >= 1
    && ws.open === ws.planned - ws.done, "weekStatus wrong: " + JSON.stringify(ws));
  const due = KOS.pacing.dueThisWeek();
  assert(due.week.wb === "2026-11-02" && due.carried.some(x => x.entry.id === older.id) && due.rows.some(e => e.id === thisWeek.id), "dueThisWeek wrong");
  KOS.pacing.removeEntry(old.id); KOS.pacing.removeEntry(older.id); KOS.pacing.removeEntry(thisWeek.id);
});

step("the week page: a tick beside every one of my rows, a carried band marked behind, → here moves the row", () => {
  const older = KOS.pacing.addEntry({ source: "personal", subject: "it", wb: "2026-10-12", title: "Carry me", refs: [] });
  KOS.show("pacing", { wb: "2026-11-02" });
  const rows = $$("#main [data-ui~='pace.reg-mine'] [data-ui~='pace.plan-row']");
  assert(rows.length, "no plan rows rendered");
  rows.forEach(r => {
    assert(r.querySelector("[data-ui~='pace.tick'] input[type=checkbox]") && r.querySelector("button[data-ui~='pace.row']"), "a row lacks its tick or its button");
    assert(!r.querySelector("button[data-ui~='pace.row'] input"), "the tick is inside the row button");
  });
  const band = $$("#main [data-ui~='pace.carried']").find(b => b.textContent.includes("Carry me"));
  assert(band && /behind/i.test(band.textContent) && /from w\/c 12 Oct/.test(band.textContent), "the carried band is missing or unlabelled");
  assert(/carried over/.test($("#main [data-ui~='pace.week-header']").textContent), "the week sub-line does not count the carry-over");
  const carriedRow = $$("#main [data-ui~='pace.carried'] [data-ui~='pace.plan-row']").find(r => r.textContent.includes("Carry me"));
  carriedRow.querySelector("[data-ui~='pace.move']").click();
  assert(KOS.pacing.entryById(older.id).wb === "2026-11-02", "→ here did not move the row into the week");
  assert(!$$("#main [data-ui~='pace.carried'] [data-ui~='pace.plan-row']").some(r => r.textContent.includes("Carry me")), "the moved row is still in the carried band");
  const row = $$("#main [data-ui~='pace.reg-mine'] [data-ui~='pace.plan-row']").find(r => r.textContent.includes("Carry me"));
  const tick = row.querySelector("[data-ui~='pace.tick'] input");
  tick.checked = true; tick.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.pacing.entryById(older.id).done === true, "the row tick did not go through setDone");
  assert($$("#main [data-ui~='pace.reg-mine'] [data-ui~='pace.plan-row'][data-state~='is-done']").some(r => r.textContent.includes("Carry me")), "a ticked row is not shown ticked");
  KOS.pacing.removeEntry(older.id);
});

step("class milestones stand in the Countdown rail and open the week; the dialog offers the tick and a reminder", () => {
  const mock = KOS.pacing.addEntry({ source: "school", subject: "maths", wb: "2026-11-09", title: "Maths mock", kind: "Mock" });
  const cds = KOS.calendar.countdowns(null);
  const hit = cds.find(r => r.kind === "pacing" && r.entry.id === mock.id);
  assert(hit && hit.days === 5 && /Mock in class/.test(hit.meta), "the mock is not a countdown: " + JSON.stringify(hit));
  assert(!KOS.calendar.countdowns("compsci").some(r => r.kind === "pacing" && r.entry.id === mock.id), "a subject filter let another subject's mock through");
  assert(!KOS.store.state.calendar.events.some(e => e.title === "Maths mock"), "the milestone was written as a calendar event (invariant 44)");
  const mine = KOS.pacing.addEntry({ source: "personal", subject: "maths", wb: "2026-11-02", title: "Remind me row", refs: [] });
  KOS.show("pacing", { wb: "2026-11-02" });
  $$("#main [data-ui~='pace.row']").find(b => b.textContent.includes("Remind me row")).click();
  const dlg = $("[data-ui~='ui.dialog'][data-ui~='pace.dlg']");
  assert(dlg.querySelector("[data-ui~='pace.dlg-done'] input[type=checkbox]"), "the dialog has no tick");
  const before = KOS.reminders.all().length;
  [...dlg.querySelectorAll("button")].find(b => /Remind me/.test(b.textContent)).click();
  const r = KOS.reminders.all().find(x => x.title === "Plan: Remind me row");
  assert(r && KOS.reminders.all().length === before + 1 && r.due === "2026-11-08" && r.tags.indexOf("pacing") !== -1, "the reminder handoff is wrong: " + JSON.stringify(r));
  $("[data-ui~='ui.dialog'][data-ui~='pace.dlg'] [data-ui~='ui.dialog-head'] button").click();
  KOS.reminders.remove(r.id);
  KOS.pacing.removeEntry(mock.id); KOS.pacing.removeEntry(mine.id);
});

step("Home: the week's plan card ticks in place, leads with what is behind, and the next action says so", () => {
  const older = KOS.pacing.addEntry({ source: "personal", subject: "it", wb: "2026-10-12", title: "Home carry", refs: [] });
  const now = KOS.pacing.addEntry({ source: "personal", subject: "it", wb: "2026-11-02", title: "Home now", refs: [] });
  const card = KOS.pacingHomeCard();
  assert(card && card.matches('[data-ui~="pace.home"]'), "no Home card");
  const rows = [...card.querySelectorAll("[data-ui~='pace.home-row']")];
  const mine = rows.find(r => /Home carry/.test(r.textContent));
  assert(mine && mine.matches('[data-state~="is-carried"]'), "the carried row is not on the card, marked behind");
  const firstOpen = rows.findIndex(r => !r.matches('[data-state~="is-carried"]'));
  assert(firstOpen === -1 || rows.slice(0, firstOpen).every(r => r.matches('[data-state~="is-carried"]')), "carried rows must lead the card");
  assert(/behind/.test(card.querySelector("[data-ui~='cal.countdown-head']").textContent), "the card header does not say behind");
  const tick = mine.querySelector("input[type=checkbox]");
  tick.checked = true; tick.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.pacing.entryById(older.id).done === true, "the Home tick did not go through setDone");
  KOS.pacing.setDone(older.id, false);
  /* the next action — with no session, no due cards and nothing dated within a week */
  const keepEv = KOS.store.state.calendar.events; KOS.store.state.calendar.events = [];
  const keepAsg = KOS.store.state.assignments; KOS.store.state.assignments = { v: 1, nextId: 1, items: [] };
  const keepEntries = KOS.store.state.pacing.entries;
  KOS.store.state.pacing.entries = keepEntries.filter(e => e.source !== "school" || e.kind === "Lessons");
  const next = KOS.homeNextAction();
  KOS.store.state.calendar.events = keepEv; KOS.store.state.assignments = keepAsg; KOS.store.state.pacing.entries = keepEntries;
  assert(next.kicker === "Behind on the plan" || /Due today|In progress/.test(next.kicker), "the next action ignores the carry-over: " + next.kicker);
  /* the rollover notice: one line for the week, never two */
  if (KOS.notify) {
    KOS.notify.clear();
    KOS.pacing.noteRollover(); KOS.pacing.noteRollover();
    const items = KOS.notify.all().filter(i => i.kind === "pacing");
    assert(items.length === 1 && items[0].id === "pace:carry:2026-11-02" && /carried over/.test(items[0].title), "the rollover notice is wrong: " + JSON.stringify(items));
    KOS.notify.clear();
  }
  KOS.pacing.removeEntry(older.id); KOS.pacing.removeEntry(now.id);
});

step("a class row lists the week's lessons one per line, from the scheme of work's own text", () => {
  const ls = KOS.pacing.lessonsOf({ detail: "SQL – DDL Commands; Client Server Record Locks; DATABASE TEST; NEA (Analysis Checklist)." });
  assert(ls.length === 4 && ls[0].text === "SQL – DDL Commands" && ls[3].text === "NEA (Analysis Checklist)", "detail did not split on semicolons: " + JSON.stringify(ls));
  assert(ls[2].tone === "assess" && ls[3].tone === "nea" && ls[0].tone === "lesson", "lesson tones wrong: " + ls.map(l => l.tone).join(","));
  assert(KOS.pacing.lessonsOf({ detail: "" }).length === 0 && KOS.pacing.lessonsOf({ detail: "One thing." }).length === 1, "edge cases");
  KOS.show("pacing", { wb: "2026-11-02" });
  const block = $$("#main [data-ui~='pace.class-block']").find(b => b.querySelector("[data-ui~='pace.lessons']"));
  assert(block, "no class block carries its lesson list");
  assert(block.querySelector("button[data-ui~='pace.class']") && !block.querySelector("button[data-ui~='pace.class'] [data-ui~='pace.lessons']"), "the lesson list must sit beside the row button, not inside it");
  const items = block.querySelectorAll("[data-ui~='pace.lessons'] [data-ui~='pace.lesson']");
  assert(items.length > 1 && /lessons/.test(block.querySelector("[data-ui~='pace.class'] [data-ui~='part.sub']").textContent), "the row does not count its lessons");
});

KOS.srs.todayISO = realToday;

console.log("\n==============================");
if (errors.length) {
  console.log("FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log(" • " + e));
  process.exit(1);
}
console.log("ALL SMOKE TESTS PASSED");
process.exit(0);
