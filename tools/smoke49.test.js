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
  assert(ws.length === 16, "week count " + ws.length);
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
  const topic = $(".pace-topic");
  assert(topic, "no plan rows rendered");
  topic.click();
  const ta = $(".modal.pace-dlg textarea");
  assert(ta, "the row dialog has no note field");
  ta.value = "carry this over";
  [...$$(".modal.pace-dlg .btn.primary")].pop().click();
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
  const tabs = $("#main .page-header .dh-actions .pace-tabs");
  assert(tabs, "the Week/Braid switcher is not in the page header's action slot");
  assert(tabs.classList.contains("profile-workspace-tabs"), "the switcher does not use the shared header-tab treatment");
  assert(!$("#main > .pace-tabs"), "a second tab strip is still under the title");

  /* every week-scoped action sits with the week it acts on */
  const acts = $$("#main .pace-week-header .section-header-actions .btn").map(b => b.textContent.trim());
  assert(acts.indexOf("+ Add row") !== -1, "Add row is not with the week: " + acts.join(", "));
  assert(acts.indexOf("Edit week") !== -1, "Edit week is not with the week: " + acts.join(", "));
  assert(!$$("#main .page-header .dh-actions .btn").length, "week actions are still in the page header");
});

step("the page description uses the shared sub-line treatment", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  const sub = $("#main .page-header .dh-sub .board");
  assert(sub, "the page description is not the canonical .dh-sub > .board");
  assert(sub.textContent.length < 90, "the description is a paragraph again: " + sub.textContent);
  assert(!/week N/.test(sub.textContent), "the offset rule belongs in Help & Guide, not the header");
});

step("the braid does not re-teach itself above the diagram", () => {
  KOS.show("pacing", { tab: "braid" });
  const heads = $$("#main h2").map(h => h.textContent.trim());
  assert(heads.indexOf("The braid") === -1, "the explanatory header is back: " + heads.join(", "));
  assert(heads.indexOf("Every merge, in words") !== -1, "the merges section lost its label");
  assert($$("#main .pace-legend-k").length === 4, "the legend that replaced the prose is missing");
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
  assert($$("#subnav .subnav-item").some(b => b.textContent.trim() === "Pacing"),
    "Pacing is not in the Productivity nav strip");
});

step("a deep link opens that week; an unknown week falls back to today's", () => {
  KOS.show("pacing", { wb: "2026-12-14" });
  assert($("#main .section-header h2").textContent.includes("14 Dec"), "the deep link opened the wrong week");
  KOS.show("pacing", { wb: "1999-01-01" });
  assert($("#main .section-header h2").textContent === KOS.pacing.currentWeek().label,
    "an unknown week did not fall back to the current one");
});

step("one page header, three subject columns, two registers each", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  assert($$("#main .page-header").length === 1, "not exactly one page header");
  assert($("#main h1").textContent === "Pacing", "the page is not named");
  const cols = $$("#main .pace-col");
  assert(cols.length === 3, "subject columns: " + cols.length);
  cols.forEach(c => {
    assert(c.querySelector(".pace-reg-class"), c.getAttribute("data-subject") + " has no class register");
    assert(c.querySelector(".pace-reg-mine"), c.getAttribute("data-subject") + " has no personal register");
    assert(c.getAttribute("aria-label"), "a column has no accessible name");
  });
});

step("the term ribbon declares its horizontal scroll", () => {
  const wrap = $("#main .u-scroller.pace-ribbon-wrap");
  assert(wrap, "the ribbon is not inside the shared scroller");
  assert(wrap.getAttribute("data-scroller") === "true", "the scroll is undeclared");
  const cells = $$("#main .pace-wk:not(.pace-wk-add)");
  assert(cells.length === KOS.pacing.weeks().length, "ribbon cells: " + cells.length);
  assert($$("#main .pace-wk-add").length === 1, "the ribbon lost its add-a-week cell");
  cells.forEach(c => {
    assert(c.tagName === "BUTTON", "a ribbon cell is not a native button");
    assert((c.getAttribute("aria-label") || "").indexOf("Week beginning") === 0,
      "a ribbon cell has no real accessible name: " + c.getAttribute("aria-label"));
  });
  assert($$("#main .pace-wk[aria-current]").length === 1, "the selected week is not marked");
  assert($$("#main .pace-wk.is-mock").length === 1 && $$("#main .pace-wk.is-break").length === 1,
    "the mock and half-term weeks are not flagged in the ribbon");
});

step("plan rows are native buttons, not ARIA cards", () => {
  const rows = $$("#main .pace-topic, #main .pace-class");
  assert(rows.length, "no rows rendered");
  rows.forEach(r => {
    assert(r.tagName === "BUTTON", "a row is a " + r.tagName + ", not a button");
    assert(!r.querySelector("button, a, select, input"), "a row button contains an interactive descendant");
  });
});

step("the row dialog goes through the one dialog route and links to the topic page", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  const row = $$("#main .pace-topic").find(b => /\d\/\d/.test(b.textContent));
  assert(row, "no row with linked spec points");
  row.click();
  const box = $(".modal.pace-dlg");
  assert(box, "no dialog opened");
  assert(box.getAttribute("role") === "dialog" && box.getAttribute("aria-modal") === "true",
    "the dialog is not a dialog");
  assert(box.getAttribute("aria-labelledby"), "the dialog has no accessible name");
  const refs = $$(".modal.pace-dlg .pace-dlg-ref");
  assert(refs.length, "the dialog lists no spec points");
  refs[0].click();
  assert(window.location.hash.indexOf("#/ref/") === 0, "the spec point did not open the topic page: " + window.location.hash);
  assert(!$(".modal.pace-dlg"), "the dialog stayed open behind the topic page");
});

step("a row with no spec point says so rather than linking somewhere near", () => {
  const row = KOS.pacing.entries().find(e => e.source === "personal" && !e.refs.length);
  const wk = KOS.pacing.weekAt(row.wb);
  KOS.show("pacing", { wb: wk.wb });
  const btn = $$("#main .pace-topic").find(b => b.textContent.includes(row.title));
  assert(btn, "the unlinked row did not render");
  btn.click();
  assert($(".modal.pace-dlg .empty-state.pace-nolink"), "no honest empty state for an unlinked row");
  assert(!$$(".modal.pace-dlg .pace-dlg-ref").length, "an unlinked row offered a spec point anyway");
  $(".modal.pace-dlg .modal-h .btn").click();
});

step("the week summary is a sub-line, and suppresses zero-only supporting facts", () => {
  /* the facts are the section header's own sub-line now — a row of
     card-sized boxes carrying one figure each was the wrong weight for
     three numbers, and the primitive is not used here any more */
  assert(!$("#main .pace-stats"), "the stat-card row came back");

  KOS.show("pacing", { wb: "2026-10-26" });            /* half term: nothing planned */
  const quiet = $("#main .pace-week-header .sub").textContent;
  assert(/0 topics planned/.test(quiet), "the primary count vanished at zero: " + quiet);
  assert(!/spec points? in class/.test(quiet), "a zero supporting fact was printed: " + quiet);
  assert(!/my plan has reached/.test(quiet), "a zero supporting fact was printed: " + quiet);
  assert(/Half term/.test(quiet), "half term is no longer named");

  KOS.show("pacing", { wb: "2026-11-02" });
  const full = $("#main .pace-week-header .sub").textContent;
  ["School week 9", "My week 8", "topics planned", "spec points in class", "my plan has reached"]
    .forEach(f => assert(full.indexOf(f) !== -1, "a busy week dropped “" + f + "”: " + full));
});

step("the styles are theme-derived and stay inside the five breakpoints", () => {
  const css = read("css/main.css");
  const block = css.slice(css.indexOf("PACING — the integrated weekly timeline"));
  assert(block, "the Pacing style block is missing");
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
  const adds = $$("#main .pace-add");
  assert(adds.length === 6, "expected an add control in each of the six registers, found " + adds.length);
  adds.forEach(b => assert(b.getAttribute("aria-label"), "an add control has no accessible name"));

  /* the second control is the CS column's "My plan" register */
  adds[1].click();
  const dlg = $(".modal.pace-dlg");
  assert(dlg && dlg.getAttribute("role") === "dialog" && dlg.getAttribute("aria-modal") === "true",
    "the add dialog is not a dialog");
  assert(dlg.querySelector(".pace-pick"), "the editor has no specification picker");
  const titleField = [...dlg.querySelectorAll("label.cal-field")]
    .find(l => l.querySelector("span").textContent === "Title");
  assert(titleField, "the editor has no Title field");
  titleField.querySelector("input").value = "Made by the editor";
  dlg.querySelectorAll(".pace-pick-row input")[0].click();
  [...dlg.querySelectorAll(".pace-dlg-actions .btn")].pop().click();
  const made = KOS.pacing.entries().find(e => e.title === "Made by the editor");
  assert(made, "the editor did not save the row");
  assert(made.refs.length === 1, "the picked spec point was not saved");
  assert(made.wb === "2026-11-02" && made.subject === "compsci" && made.source === "personal",
    "the editor lost the register it was opened from");

  KOS.show("pacing", { wb: "2026-11-02" });
  const row = $$("#main .pace-topic").find(b => b.textContent.includes("Made by the editor"));
  assert(row, "the new row did not render");
  row.click();
  const edit = $(".modal.pace-dlg");
  assert(edit.querySelector(".pace-dlg-refs"), "an existing row does not show its linked topic pages");
  const danger = edit.querySelector(".pace-dlg-danger .btn.danger");
  assert(danger, "the editor has no delete");
  assert(!edit.querySelector(".pace-dlg-actions .btn.danger"),
    "Delete shares a control group with Save");

  /* deliberately NOT auto-confirmed: deleting a plan row has to go through
     the real danger dialog, which is the one that focuses Cancel and
     refuses to confirm on Enter */
  danger.click();
  const ask = $(".modal-ov.confirm-ov .confirm-modal.danger");
  assert(ask, "deleting a row did not ask");
  assert(document.activeElement === ask.querySelector(".confirm-foot .btn:not(.danger)"),
    "the danger dialog did not put focus on Cancel");
  assert(KOS.pacing.entries().some(e => e.title === "Made by the editor"),
    "the row was deleted before the question was answered");
  ask.querySelector(".confirm-foot .btn.danger").click();
  assert(!KOS.pacing.entries().some(e => e.title === "Made by the editor"), "the row was not deleted");
  assert(!$(".modal.pace-dlg"), "the editor stayed open behind the delete");
});

step("the specification picker never renders the whole specification", () => {
  KOS.show("pacing", { wb: "2026-11-02" });
  $$("#main .pace-add")[1].click();
  const dlg = $(".modal.pace-dlg");
  const rows = dlg.querySelectorAll(".pace-pick-row").length;
  assert(rows > 0 && rows <= 40, "the picker drew " + rows + " rows of a 156-leaf subject");
  assert(/showing 40 of \d+ matches/.test(dlg.querySelector(".pace-pick-count").textContent),
    "the picker does not say what it left out: " + dlg.querySelector(".pace-pick-count").textContent);
  dlg.querySelector(".modal-h .btn").click();
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
  const svg = $("#main .pace-braid-svg");
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
  const keys = $("#main .pace-braid-keys");
  assert(keys, "the braid has no fixed key column");
  assert(keys.getAttribute("aria-hidden") === "true", "the decorative key column is exposed twice");
  assert(!$("#main .pace-braid-wrap").contains(keys), "the key column is inside the scroller it exists to escape");
  const names = [...keys.querySelectorAll("text")].map(t => t.textContent);
  ["Computer Science", "Mathematics", "IT · Data Analytics", "In class", "My plan"]
    .forEach(n => assert(names.indexOf(n) !== -1, "the key column does not name " + n));
  assert(keys.getAttribute("height") === $("#main .pace-braid-svg").getAttribute("height"),
    "the key column and the graph are different heights, so the rows cannot line up");
});

step("every arc is repeated as a real button, and the diagram is one image", () => {
  KOS.show("pacing", { tab: "braid" });
  const model = KOS.pacing.braid();
  const total = model.lanes.reduce((a, l) => a + l.links.length, 0);
  assert($$("#main .pace-merge").length === total,
    "merge buttons " + $$("#main .pace-merge").length + " ≠ branches " + total);
  $$("#main .pace-merge").forEach(b => {
    assert(b.tagName === "BUTTON", "a merge row is not a native button");
    assert(/spec point/.test(b.getAttribute("aria-label") || ""), "a merge row has no real accessible name");
  });
  const svg = $("#main .pace-braid-svg");
  assert(svg.getAttribute("role") === "img" && svg.getAttribute("aria-label"),
    "the diagram is not a named image");
  assert(/listed as buttons below/.test(svg.getAttribute("aria-label")),
    "the image does not point at its text alternative");
  assert($("#main .u-scroller.pace-braid-wrap[data-scroller]"), "the braid's horizontal scroll is undeclared");
});

step("mine and class week numbers are never mixed up", () => {
  KOS.show("pacing", { tab: "braid" });
  const btn = $$("#main .pace-merge")[0];
  const sub = btn.querySelector(".sub").textContent;
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
  assert(!$("#main .pace-braid-svg"), "an evidence-free braid still drew a diagram");
  assert($("#main .empty-state"), "an evidence-free braid drew nothing and explained nothing");
  KOS.store.state.pacing.entries = keep;
  KOS.show("pacing", { tab: "braid" });
  assert($("#main .pace-braid-svg"), "the braid did not come back");
});

console.log("\n==============================");
if (errors.length) {
  console.log("FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log(" • " + e));
  process.exit(1);
}
console.log("ALL SMOKE TESTS PASSED");
process.exit(0);
