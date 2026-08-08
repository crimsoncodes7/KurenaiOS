/* Kurenai OS — smoke37.test.js
   The Study overview + topic shell refinement.

   The claim this suite defends is CONSISTENCY, not layout taste: a number
   shown on two Study surfaces has to come from one derivation, a bar has to
   carry the same quantity as the value printed beside it, and a status has to
   agree with the mastery figure sitting next to it.

     A · subject overview — the balanced 2 x 4 analytics grid, one tile shape,
         the full-width action card BELOW the grid, countdowns kept out of the
         analytics block, and nothing in the column pinned with position:sticky
     B · statistic consistency — percentage / ratio formats, one empty state,
         one colour ramp, and no contradictory pairs (quiz "best" really is
         the best; a checked topic can no longer read "Not started")
     C · topic status — status, the four checks and confidence in ONE headed
         component with a live mastery readout
     D · inspector — collapses and persists; its numbers are the tab counts
     E · tabs & controls — full names, one chip geometry, and the retired
         Overview/Assignments switcher

   Run: node tools/smoke37.test.js                                        */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in smoke37"));

for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (e) { errors.push("LOAD FAIL " + match[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const steps = [];
const step = (n, f) => steps.push([n, f]);
function assert(ok, message) { if (!ok) throw new Error(message); }

const SID = "compsci";
const REF = "4.2.3.1";               // an enriched leaf: notes, cards, quiz, exam, sim

/* ============ A · the subject overview ============ */
console.log("== A · subject overview ==");

/* Cat 7 Phase C moved the analytics out of the 300px context column and into
   the desk's main column, where eight tiles get four across instead of two.
   The claim the suite defends is unchanged: one balanced grid, no hole. */
step("the desk carries the analytics grid, four across, with no hole", () => {
  KOS.show("subject", SID);
  const main = $(".subject-main");
  assert(main, "no desk column");
  const panel = main.querySelector(".subj-analytics");
  assert(panel, "no analytics panel on the desk");
  assert(!$(".subject-side .subj-analytics"), "the analytics are still in the context column");
  const tiles = panel.querySelectorAll(".sa-grid > .sa-tile");
  assert(tiles.length === 8, "expected 8 tiles, got " + tiles.length);
  assert(/\.sa-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s.test(css),
    "the grid is not four columns — 8 tiles must divide evenly");
});

step("every tile is the same shape: label, value, context, one track", () => {
  $$(".sa-grid > .sa-tile").forEach(t => {
    const k = t.querySelector(".k"), v = t.querySelector(".v"), s = t.querySelector(".s");
    assert(k && k.textContent.trim(), "a tile has no label");
    assert(v && v.textContent.trim(), "a tile has no value");
    assert(s && s.textContent.trim(), "a tile has no line of context");
    assert(t.querySelector(".sa-track"), "a tile has no track row — rows would fall off the baseline");
  });
});

step("the eight statistics are the named ones, each labelled once", () => {
  const want = ["Mastery", "Topics secure", "Topics started", "Cards due",
    "Cards reviewed", "Quiz best", "Exam questions", "Study streak"];
  const got = $$(".sa-grid > .sa-tile .k").map(n => n.textContent.trim());
  assert(got.join("|") === want.join("|"), "tile labels: " + got.join("|"));
});

/* The desk reads as one sentence: where you were → what the course is → how
   you are doing → what you can do about it. The continue card is the only
   element on the page that is an instruction rather than a report, so it
   leads; everything after it is context for it. */
step("Continue where you left off is the desk's FIRST element", () => {
  KOS.store.state.ui.lastRef[SID] = REF;
  KOS.show("subject", SID);
  const main = $(".subject-main");
  const card = main.querySelector(".continue-action");
  assert(card, "no action card");
  assert(main.firstElementChild === card, "the action card does not lead the desk");
  const kids = [...main.children];
  assert(kids.indexOf(card) < kids.indexOf(main.querySelector(".subj-analytics")),
    "the action card is not above the analytics");
  assert(card.querySelector(".d").textContent === "Continue where you left off", "wrong kicker");
  assert(card.textContent.includes(REF), "the card does not name the topic");
  assert(/\.continue-action\s*\{[^}]*width:\s*100%/s.test(css), "the action card is not full width");
  click(card);
  assert(KOS.store.state.ui.view === "ref", "the action card did not act");
});

step("a never-opened subject still gets an action card, with an honest kicker", () => {
  delete KOS.store.state.ui.lastRef.it;
  KOS.show("subject", "it");
  const card = $(".subject-main .continue-action");
  assert(card, "the empty state dropped the card entirely");
  assert(card.querySelector(".d").textContent === "Start here", "empty state kept the Continue wording");
});

/* Countdowns are dates, not subject analytics. With the analytics moved to
   the desk the context column holds only what genuinely is not a subject
   statistic — so the ruled break has nothing left to separate and is gone. */
step("countdowns stay out of the analytics block", () => {
  KOS.show("subject", SID);
  const side = $(".subject-side");
  assert(side.querySelector(".dl-widget"), "no countdown widget");
  assert(!$(".subj-analytics .dl-widget"), "countdowns leaked into the analytics panel");
  assert(!side.querySelector(".subj-analytics"), "the analytics are back in the date column");
});

/* audit SUBJ-1: the page rendered the spec tree's section list a second time,
   ~400px to its right. The spine is the one section list now. */
step("the section list appears exactly once, in the spine", () => {
  KOS.show("subject", SID);
  assert(!$("#main .sec-grid"), "the main-column section ledger is back");
  assert(!$("#main .sec-card"), "a duplicate section row survives in the main column");
  const spine = document.getElementById("tree");
  const heads = spine.querySelectorAll(".sec-head");
  assert(heads.length >= 8, "the spine lost its section list (" + heads.length + " rows)");
  /* it inherited what the ledger did that the spine did not: a bar and,
     one level down, the per-subsection tally */
  assert(spine.querySelector(".sec-head .sec-head-bar .bar-fill"),
    "the spine did not inherit the ledger's progress bar");
});

step("nothing in the context column or the inspector is pinned while the page scrolls", () => {
  assert(/\.subject-side\s*\{[^}]*position:\s*static/s.test(css), ".subject-side is not explicitly non-sticky");
  assert(!/\.subject-side\s*\{[^}]*position:\s*sticky/s.test(css), ".subject-side is sticky");
  assert(/\.study-inspector\s*\{[^}]*position:\s*static/s.test(css), ".study-inspector is still pinned");
});

/* ============ B · statistic consistency ============ */
console.log("== B · statistic consistency ==");

step("percentages are whole numbers with a %; part-of-whole is always A / B", () => {
  KOS.show("subject", SID);
  const vals = $$(".sa-grid > .sa-tile .v").map(n => n.textContent.trim());
  vals.forEach(v => {
    if (v.includes("%")) assert(/^\d+%$/.test(v), "malformed percentage: " + v);
    if (v.includes("/")) assert(/^\d+ \/ \d+$/.test(v), "malformed ratio: " + v);
  });
  /* the board band's per-paper columns carry the shared formats. The lead no
     longer restates the subject-wide secure ratio — audit SUBJ-2 counted
     that one figure four times on a single screen, and it belongs to the
     spine header (as navigation context) and to one analytics tile. */
  const band = $(".unit-stat small").textContent;
  assert(/^\d+ \/ \d+ secure · \d+%$/.test(band), "the desk band does not use the shared formats: " + band);
  assert(!/secure/.test($(".unit-lead").textContent), "the board lead restates the secure ratio again");
});

step("a bar is only drawn when it carries the same quantity as its value", () => {
  KOS.show("subject", SID);
  $$(".sa-grid > .sa-tile").forEach(t => {
    const v = t.querySelector(".v").textContent.trim();
    const track = t.querySelector(".sa-track");
    const drawn = !track.classList.contains("na");
    const ratioOrPct = /%/.test(v) || / \/ /.test(v);
    if (drawn) assert(ratioOrPct, "a bar was drawn for a bare count: " + v);
  });
});

step("one empty state everywhere: an em dash plus a sentence saying why", () => {
  KOS.store.state.study = { fc: {}, quiz: {} };
  KOS.show("subject", "maths");
  const quiz = $$(".sa-grid > .sa-tile").find(t => t.querySelector(".k").textContent === "Quiz best");
  assert(quiz.classList.contains("empty"), "an unattempted quiz tile is not marked empty");
  assert(quiz.querySelector(".v").textContent === "—", "empty value is not an em dash");
  assert(quiz.querySelector(".s").textContent === "no quiz attempts yet", "empty state does not explain itself");
});

step("colour semantics come from ONE ramp, shared with the section ledger", () => {
  ["low", "mid", "high"].forEach(t => {
    assert(new RegExp("\\.sec-card\\." + t + " \\.bar-fill").test(css), "the ledger lost its ." + t + " ramp");
    assert(new RegExp("\\.sa-tile\\." + t + " \\.sa-track i").test(css), "the tiles do not reuse ." + t);
  });
  assert(/\.sa-tile\.due/.test(css), "work waiting to be done has no distinct attention state");
});

step("'Quiz best' really is the best score, not the last one", () => {
  KOS.store.state.study = { fc: {}, quiz: {} };
  KOS.store.state.study.quiz[SID + ":" + REF] = { attempts: 3, best: 90, lastPct: 40 };
  KOS.show("subject", SID);
  const tile = $$(".sa-grid > .sa-tile").find(t => t.querySelector(".k").textContent === "Quiz best");
  assert(tile.querySelector(".v").textContent === "90%", "subject page shows " + tile.querySelector(".v").textContent + ", not the best");
  KOS.show("ref", { subject: SID, ref: REF });
  const row = $$(".study-inspector .insp-list li").find(li => li.querySelector("span").textContent === "Quiz best");
  assert(row.querySelector("strong").textContent === "90%", "the inspector disagrees with the subject page");
});

step("a topic carrying a progress check can never still read 'Not started'", () => {
  const ref = "4.2.3.2";
  KOS.store.state.progress = {};
  KOS.store.setCheck(SID, ref, 0, true);
  assert(KOS.store.getProgress(SID, ref).status === "started",
    "status stayed " + KOS.store.getProgress(SID, ref).status + " beside a non-zero mastery");
  KOS.store.setCheck(SID, ref, 1, true);
  KOS.store.setCheck(SID, ref, 2, true);
  KOS.store.setCheck(SID, ref, 3, true);
  assert(KOS.store.getProgress(SID, ref).status === "done", "the all-four rule regressed");
});

/* ============ C · the Topic Status component ============ */
console.log("== C · topic status ==");

step("status, the four checks and confidence are ONE headed component", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const c = $(".topic-status");
  assert(c, "no Topic Status component");
  assert(c.classList.contains("ctl-row"), "the component dropped the shared control-row contract");
  assert(c.querySelector(".ts-head .ts-k").textContent === "Topic status", "the component is unheaded");
  assert(c.querySelector(".ts-field-status .status-sel"), "the status dropdown is not a labelled field");
  const checks = c.querySelectorAll(".ts-checkgrid label.chk input[type=checkbox]");
  assert(checks.length === 4, "expected the four progress checks, got " + checks.length);
  assert(c.querySelector(".ts-field-conf .rag-picker"), "confidence is not part of the component");
  const labels = [...c.querySelectorAll(".ts-field > .ts-lbl")].map(n => n.textContent.trim());
  assert(labels.join("|") === "Status|Progress checks|Confidence", "field labels: " + labels.join("|"));
  assert(!c.querySelector(".ctl-sep"), "the loose hairline separators are back");
});

step("the four checks read as the full phrases, in order", () => {
  const got = [...$$(".ts-checkgrid label.chk")].map(n => n.textContent.trim());
  assert(got.join("|") === "Covered in class|Studied it|Done exam questions|Fully understood",
    "check labels: " + got.join("|"));
});

step("the component's mastery readout is live, and the status follows a check", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const c = $(".topic-status");
  assert(c.querySelector(".ts-pct").textContent === "0%", "opening readout is wrong");
  const box = c.querySelectorAll(".ts-checkgrid input[type=checkbox]")[0];
  box.checked = true;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(c.querySelector(".ts-pct").textContent === "25%", "mastery did not repaint: " + c.querySelector(".ts-pct").textContent);
  assert(c.querySelector(".ts-checks").textContent === "1 / 4 checks", "check count did not repaint");
  assert(c.querySelector(".ts-field-status .status-sel").value === "started", "the dropdown did not follow the check");
  assert(box.parentNode.classList.contains("on"), "the ticked chip does not read as ticked");
});

/* Marking a topic Completed makes it 100% by definition, which can outrun the
   checklist. The store is deliberately NOT rewritten (the assistant restores
   status and checks separately, so deriving one from the other would lose an
   undo) — instead both readouts explain the figure rather than printing a
   ratio that contradicts it. */
step("a Completed topic explains its 100% instead of contradicting the boxes", () => {
  const sel = $(".topic-status .ts-field-status .status-sel");
  sel.value = "done";
  sel.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert($(".topic-status .ts-pct").textContent === "100%", "mastery did not follow the status");
  assert($(".topic-status .ts-checks").textContent === "marked completed",
    "the header still prints a contradictory ratio: " + $(".topic-status .ts-checks").textContent);
  /* the header's compact control is the same store value as the component's
     field, so the two can never disagree about the status */
  assert($("#th-status").value === "done", "the header status control did not follow");
  /* and once the boxes catch up, the ordinary ratio returns */
  $$(".ts-checkgrid input[type=checkbox]").forEach(b => {
    if (b.checked) return;
    b.checked = true; b.dispatchEvent(new window.Event("change", { bubbles: true }));
  });
  assert($(".topic-status .ts-checks").textContent === "4 / 4 checks", "the ratio did not return");
});

/* ============ D · the inspector ============ */
console.log("== D · inspector ==");

step("the inspector collapses, says so, and persists the choice", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const grid = $(".study-grid");
  const toggle = grid.querySelector(".insp-toggle");
  assert(toggle, "no collapse control");
  assert(grid.querySelector(".study-inspector .insp-spine"), "the collapsed rail has no readable spine");
  click(toggle);
  assert(grid.classList.contains("insp-closed"), "collapse did not apply");
  assert(toggle.getAttribute("aria-expanded") === "false", "collapse is not announced");
  assert(KOS.store.state.ui.inspectorOpen === false, "collapsed state not persisted");
  click(toggle);
  assert(!grid.classList.contains("insp-closed"), "re-open failed");
  assert(KOS.store.state.ui.inspectorOpen === true, "open state not persisted");
  KOS.store.state.ui.inspectorOpen = false;
  KOS.show("ref", { subject: SID, ref: REF });
  assert($(".study-grid").classList.contains("insp-closed"), "persisted collapse ignored on render");
  KOS.store.state.ui.inspectorOpen = true;
});

/* audit REF-4: the four material counts were printed twice — on the tab
   chips and again in an inspector "Materials" list about 200px away. They
   are printed ONCE, on the chips, where the number is what decides whether
   you press the tab. */
step("each material count appears exactly once, on its tab chip", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const chip = name => {
    const tab = $$(".study-tabs-topic .study-tab").find(b => b.textContent.startsWith(name));
    const n = tab && tab.querySelector(".tab-n");
    return n ? Number(n.textContent) : null;
  };
  ["Flashcards", "Quiz", "Exam questions", "Simulations"].forEach(name => {
    assert(chip(name) !== null, "no count chip on the " + name + " tab");
  });
  const insp = $(".study-inspector").textContent;
  assert(!/Materials/.test(insp), "the inspector still restates the material counts");
  assert(!/Quiz questions/.test(insp), "a Materials row survived in the inspector");
});

/* audit REF-3: mastery was printed in the status band above the content AND
   again in the inspector, ~280px apart. One readout now — the component's
   own head, in the inspector — and the header's status control moves with it
   because both read the one store value. */
step("mastery is printed exactly once, and it is live", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  assert(!$(".insp-mastery"), "the inspector's duplicate mastery block is back");
  assert($$(".ts-pct").length === 1, "expected one mastery readout, found " + $$(".ts-pct").length);
  const read = () => $(".ts-pct").textContent;
  assert(read() === "0%", "the readout opened at " + read());
  const box = $$(".ts-checkgrid input[type=checkbox]")[0];
  box.checked = true;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(read() === "25%", "the readout did not follow the check: " + read());
  assert($(".study-inspector .topic-status"), "the state component is not in the inspector");
});

/* ============ E · tabs and controls ============ */
console.log("== E · tabs and controls ==");

step("every study tab carries its full name", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const names = $$(".study-tabs-topic .study-tab").map(b => b.firstChild.textContent.trim());
  ["Specification", "Notes", "Flashcards", "Quiz", "Exam questions", "Simulations", "Files"]
    .forEach(n => assert(names.includes(n), "missing tab: " + n + " (got " + names.join(", ") + ")"));
  assert(!names.some(n => n === "Exam Qs" || n === "Simulate" || n === "Worked"), "a clipped label survived: " + names.join(", "));
});

/* audit REF-6: the strip wrapped and orphaned "Files" onto a row of its own,
   under an assistant strip and above a second row of note-page pills — three
   levels of tab for one decision. It is one row now, and the row is a
   DECLARED scroller (Phase B invariant #50), which is what lets it stay one
   row at 390px as well as at 1920. */
step("count chips are one geometry, and the strip is one declared-scroller row", () => {
  assert(/\.study-tab \.tab-n[^{]*\{[^}]*min-width:\s*20px[^}]*height:\s*18px/s.test(css),
    "the count chip has no fixed geometry");
  assert(/\.study-tabs-topic\s*\{[^}]*flex-wrap:\s*nowrap/s.test(css), "the topic strip wraps again");
  const wrap = $(".study-tabs-topic").closest("[data-scroller]");
  assert(wrap, "the topic strip scrolls sideways without declaring itself a scroller");
  assert(wrap.querySelector(".u-scroller-arrow"), "the declared scroller has no arrow affordance");
  const heights = new Set($$(".study-tabs-topic .study-tab").map(b => window.getComputedStyle(b).minHeight));
  assert(heights.size === 1, "tabs do not share one height: " + [...heights].join(", "));
});

step("the selected tab is announced, and switching keeps exactly one selected", () => {
  const tabs = $$(".study-tabs-topic .study-tab");
  assert(tabs.filter(b => b.getAttribute("aria-selected") === "true").length === 1, "no single selected tab");
  click(tabs.find(b => b.dataset.tab === "quiz"));
  const now = $$(".study-tabs-topic .study-tab");
  assert(now.filter(b => b.classList.contains("active")).length === 1, "more than one active tab");
  assert(now.find(b => b.dataset.tab === "quiz").getAttribute("aria-selected") === "true", "aria-selected did not move");
});

step("the Overview/Assignments switcher is gone; the tracker keeps its subnav entry", () => {
  KOS.show("subject", SID);
  assert(!$(".subject-workspace-tabs"), "the desk tab switcher is back");
  assert(!$(".subject-side .stat-strip"), "the old seven-tile stat strip is back");
  assert(KOS.sectionOf("assignments") === "study", "assignments must stay owned by Study");
  const entry = $$("#subnav .subnav-item").find(b => b.textContent.trim() === "Assignments");
  assert(entry, "Assignments is not in the Study subnav");
  click(entry);
  assert(KOS.store.state.ui.view === "assignments", "the subnav entry did not open the tracker");
});

/* ---- run ---- */
let pass = 0;
for (const [name, fn] of steps) {
  try { fn(); console.log("  ok  " + name); pass++; }
  catch (e) { errors.push('STEP "' + name + '": ' + (e.message || e)); console.log("FAIL  " + name); }
}

if (errors.length) {
  console.log("\nSMOKE37 FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log("  - " + e));
  process.exit(1);
}
console.log("\nSMOKE37 PASS — Study overview + topic shell refinement verified (" + pass + " steps).");
process.exit(0);
