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

step("the right column leads with a balanced 2 x 4 analytics grid", () => {
  KOS.show("subject", SID);
  const side = $(".subject-side");
  assert(side, "no context column");
  const panel = side.querySelector(".subj-analytics");
  assert(panel, "no analytics panel");
  assert(side.firstElementChild === panel, "the stat area is not first in the column");
  const tiles = panel.querySelectorAll(".sa-grid > .sa-tile");
  assert(tiles.length === 8, "expected 8 tiles (a balanced 2 x 4), got " + tiles.length);
  assert(/\.sa-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s.test(css),
    "the grid is not two columns — 8 tiles must not leave a hole");
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

step("Continue where you left off is a full-width action card BELOW the stat area", () => {
  KOS.store.state.ui.lastRef[SID] = REF;
  KOS.show("subject", SID);
  const side = $(".subject-side");
  const kids = [...side.children];
  const panel = side.querySelector(".subj-analytics");
  const card = side.querySelector(".continue-action");
  assert(card, "no action card");
  assert(kids.indexOf(card) > kids.indexOf(panel), "the action card is not below the stat area");
  assert(card.querySelector(".d").textContent === "Continue where you left off", "wrong kicker");
  assert(card.textContent.includes(REF), "the card does not name the topic");
  assert(/\.continue-action\s*\{[^}]*width:\s*100%/s.test(css), "the action card is not full width");
  click(card);
  assert(KOS.store.state.ui.view === "ref", "the action card did not act");
});

step("a never-opened subject still gets an action card, with an honest kicker", () => {
  delete KOS.store.state.ui.lastRef.it;
  KOS.show("subject", "it");
  const card = $(".subject-side .continue-action");
  assert(card, "the empty state dropped the card entirely");
  assert(card.querySelector(".d").textContent === "Start here", "empty state kept the Continue wording");
});

step("countdowns stay separate from subject analytics", () => {
  KOS.show("subject", SID);
  const side = $(".subject-side");
  assert(side.querySelector(".dl-widget"), "no countdown widget");
  assert(!side.querySelector(".subj-analytics .dl-widget"), "countdowns leaked into the analytics panel");
  const kids = [...side.children];
  assert(kids.some(n => n.classList.contains("side-div")), "no ruled break before the date panels");
  assert(kids.indexOf(side.querySelector(".side-div")) < kids.indexOf(side.querySelector(".dl-widget")),
    "the break does not separate analytics from countdowns");
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
  const band = $(".unit-lead small").textContent;
  assert(/^\d+ \/ \d+ secure · \d+%$/.test(band), "the desk band does not use the shared formats: " + band);
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
  assert($(".insp-mastery span").textContent === "marked completed", "the inspector still contradicts itself");
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

step("tab counts and inspector statistics are the SAME numbers", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const chip = name => {
    const tab = $$(".study-tabs-topic .study-tab").find(b => b.textContent.startsWith(name));
    const n = tab && tab.querySelector(".tab-n");
    return n ? Number(n.textContent) : 0;
  };
  const insp = name => {
    const li = $$(".study-inspector .insp-list li").find(x => x.querySelector("span").textContent === name);
    return li ? Number(li.querySelector("strong").textContent) : null;
  };
  [["Flashcards", "Flashcards"], ["Quiz", "Quiz questions"], ["Exam questions", "Exam questions"],
   ["Simulations", "Simulations"]].forEach(([tab, row]) => {
    const a = chip(tab), b = insp(row);
    assert(b !== null, "the inspector has no Materials row for " + row);
    assert(a === b, row + ": tab says " + a + ", inspector says " + b);
  });
});

step("the inspector's mastery repaints with the Topic Status component", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const read = () => $(".insp-mastery strong").textContent;
  assert(read() === "0%", "inspector opened at " + read());
  const box = $$(".ts-checkgrid input[type=checkbox]")[0];
  box.checked = true;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(read() === "25%", "the inspector did not follow the check: " + read());
  assert(read() === $(".topic-status .ts-pct").textContent, "the two mastery readouts disagree");
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

step("count chips are one geometry, and the strip wraps rather than hiding a tab", () => {
  assert(/\.study-tab \.tab-n[^{]*\{[^}]*min-width:\s*20px[^}]*height:\s*18px/s.test(css),
    "the count chip has no fixed geometry");
  assert(/\.study-tabs-topic\s*\{[^}]*flex-wrap:\s*wrap/s.test(css), "the topic strip still hides tabs behind a scroll");
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
