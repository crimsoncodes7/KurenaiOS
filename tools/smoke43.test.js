/* Kurenai OS — smoke43.test.js
   Category 7 Phase C — the Study redesign (subject desk + topic shell) and
   the Home partial redesign.

   smoke37 defends CONSISTENCY across the Study surfaces (one derivation per
   statistic, one format, no contradictory pairs). This suite defends the
   things Phase C actually changed, and would otherwise regress silently:

     A · the spine owns section navigation — it inherited the retired
         ledger's bar and subsection tally, it reveals the topic you are on,
         and it is a dismissible drawer on the tiers where it is an overlay
     B · content first — one header row, one navigation layer, and the first
         word of revision material within 140px of the topic header
     C · one state surface — the Topic Status component lives in the
         inspector, and neither a status dropdown nor status glyph is repeated
         in the header
     D · compact note-page navigation — a direct previous / page picker / next
         reader control, with B-04's scroll rule still honoured
     E · keyboard control of the flashcard and quiz engines (audit REF-8),
         including the guards that stop them stealing keys from a text field
         and the self-removal that stops them accumulating per tab switch
     F · touch targets and legible labels (REF-5, REF-7, REF-10)
     G · Home — headline figures that describe activity rather than an
         unticked checklist, one decision surface, collapsing empty panels,
         the Collection card as the same component as its neighbours, and a
         hero whose text never depends on the banner artwork

   Run: node tools/smoke43.test.js                                        */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const { readCss, pending } = require("./lib/css");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = readCss();
const hubSrc = fs.readFileSync(path.join(ROOT, "js/modules/hub.js"), "utf8");
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
window.fetch = () => Promise.reject(new Error("network disabled in smoke43"));
/* jsdom has no matchMedia; the tree's overlay tier is decided by one, so the
   suite drives it explicitly rather than letting the code fall back. */
let mediaWidth = 1440;
window.matchMedia = q => {
  const m = /max-width:\s*(\d+)px/.exec(q);
  return { matches: m ? mediaWidth <= Number(m[1]) : false, media: q,
    addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop };
};

for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (e) { errors.push("LOAD FAIL " + match[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const key = (k, target) => (target || document).dispatchEvent(
  new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const steps = [];
const step = (n, f) => steps.push([n, f]);
function assert(ok, message) { if (!ok) throw new Error(message); }

const SID = "compsci";
const REF = "4.2.3.1";                 // an enriched leaf: notes, cards, quiz, exam, sim
/* a leaf whose deep content is paginated, for the note-pager steps */
const PAGED = (() => {
  for (const k of Object.keys(window.KOS_CONTENT)) {
    const c = window.KOS_CONTENT[k];
    if (!c || !c.notes) continue;
    if (KOS.content.splitPages(c.notes).length > 1) {
      return { subject: k.slice(0, k.indexOf(":")), ref: k.slice(k.indexOf(":") + 1) };
    }
  }
  return null;
})();

/* ============ A · the spine owns section navigation ============ */
console.log("== A · the spec spine ==");

/* Graphite (frame 8a): the desk carries no spine; these read it on the
   topic page, the one place it is drawn */
step("the spine inherited the retired ledger's bar and subsection tally", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const tree = document.getElementById("tree");
  const bars = tree.querySelectorAll("[data-ui~='ui.section-head'] [data-ui~='ui.section-bar'] [data-ui~='study.bar-fill']");
  assert(bars.length >= 8, "the spine has no per-section progress bars (" + bars.length + ")");
  /* the ledger's one genuinely extra reading was the per-SUBSECTION tally it
     revealed on expand; deleting the ledger must not have deleted that */
  const gp = tree.querySelectorAll("[data-ui~='study.spine-group'] [data-ui~='study.spine-group-pct']");
  assert(gp.length >= 1, "no per-subsection tally on the spine's group rows");
  assert(/^\d+ \/ \d+$/.test(gp[0].textContent.trim()),
    "the group tally does not use the shared A / B format: " + gp[0].textContent);
});

step("the bar carries the same quantity as the count printed beside it", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const head = document.getElementById("tree").querySelector("[data-ui~='ui.section-head']");
  const pc = head.querySelector("[data-ui~='part.percent']").textContent.trim().split(" / ").map(Number);
  const width = head.querySelector("[data-ui~='ui.section-bar'] [data-ui~='study.bar-fill']").style.width;
  const want = pc[1] ? Math.round(100 * pc[0] / pc[1]) : 0;
  assert(width === want + "%", "bar says " + width + ", the count beside it says " + want + "%");
});

step("opening a topic reveals it in the spine instead of hiding it", () => {
  /* the active leaf used to sit inside a COLLAPSED section, so .leaf.active
     was display:none and scrollIntoView on it was a no-op — the spine could
     not answer "where am I", which is disqualifying for the one control that
     now owns section navigation */
  KOS.store.state.ui.openSections = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const tree = document.getElementById("tree");
  const active = tree.querySelector("[data-ui~='study.spine-leaf'][data-state~='active']");
  assert(active, "no active leaf in the spine");
  const sec = active.closest("[data-ui~='part.section']");
  assert(sec && sec.matches('[data-state~="open"]'), "the owning section did not open itself");
  assert(sec.matches('[data-state~="here"]'), "the owning section is not marked as the one you are in");
  assert(KOS.store.state.ui.openSections[SID][sec.querySelector("[data-ui~='part.ref']").textContent] === true,
    "the reveal did not go through the stored openSections");
});

step("the spine is a dismissible drawer on the tiers where it is an overlay", () => {
  /* #tree goes position:fixed at ≤860, but the default-closed rule only ran
     at ≤700 — so between 701 and 860 the spine simply covered the page it
     navigates, with no scrim and nothing to dismiss it */
  if (!pending("layout", "the spine floats as a drawer at the 860 tier"))
    assert(/#tree \{ position: fixed/.test(css.slice(css.indexOf("@media (max-width: 860px)"))),
      "the 860 tier no longer floats the spine — this suite's premise is stale");
  mediaWidth = 820;
  KOS.store.state.ui.treeClosed = null;
  KOS.show("ref", { subject: SID, ref: REF });
  assert((document.getElementById("cols").getAttribute("data-tree") === "closed"),
    "at 820 the spine still defaults to open, covering the page");
  /* the page header carries the opener, so nothing floats over the content */
  const opener = $("#main [data-ui~='study.spine-open']");
  assert(opener, "no in-page opener for the drawer");
  click(opener);
  assert(!(document.getElementById("cols").getAttribute("data-tree") === "closed"), "the opener did not open the drawer");
  const scrim = document.getElementById("tree-scrim");
  assert(scrim, "the drawer has no scrim element");
  click(scrim);
  assert((document.getElementById("cols").getAttribute("data-tree") === "closed"), "tapping the scrim did not close the drawer");
  click(opener);
  key("Escape");
  assert((document.getElementById("cols").getAttribute("data-tree") === "closed"), "Escape did not close the drawer");
  mediaWidth = 1440;
  KOS.store.state.ui.treeClosed = false;
});

step("above the overlay tier Escape is left alone", () => {
  mediaWidth = 1440;
  KOS.store.state.ui.treeClosed = false;
  KOS.show("ref", { subject: SID, ref: REF });
  key("Escape");
  assert(!(document.getElementById("cols").getAttribute("data-tree") === "closed"),
    "Escape collapsed the spine on a viewport where it is an ordinary column");
});

/* ============ B · content first ============ */
console.log("== B · content first ==");

step("the topic header is ONE row and absorbs the crumb path", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const main = document.getElementById("main");
  assert(!main.querySelector("[data-ui~='ui.crumbs']"), "the separate crumb row is back");
  /* Graphite (frame 8b): the header leads the content column; the inspector
     runs the page's full height beside it */
  const head = main.querySelector("[data-ui~='topic.head']");
  assert(head && head.parentElement.matches("[data-ui~='study.col']") && head.parentElement.firstElementChild === head,
    "the topic header does not lead the page");
  assert(head.querySelector("[data-ui~='gov.seal']"), "no ref seal");
  assert(head.querySelector("h1"), "no title");
  const meta = head.querySelector("[data-ui~='topic.head-meta']").textContent;
  assert(meta.includes(window.KOS_DATA[SID].name), "the meta line dropped the subject the crumbs carried");
  assert(/Paper \d|NEA|Pure/.test(meta), "the path line dropped the paper");
  assert(!head.querySelector("[data-ui~='ui.status-select'], .th-status"), "topic status is duplicated in the header");
});

step("the page carries ONE study navigation layer, above the content", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const col = $("[data-ui~='study.col']");
  const nav = col.querySelector("[data-ui~='topic.nav']");
  assert(nav && col.firstElementChild.nextElementSibling === nav, "the nav bar does not sit between the header and the content");
  assert(nav.querySelector("[data-ui~='topic.tabs']"), "the tab strip is not in the bar");
  /* the assistant strip used to sit on the path between the title and the
     first word of content; it is a side-of-desk affordance now */
  assert(!col.querySelector("[data-ui~='asst.ctx']"), "the assistant strip is back on the content path");
  assert($("[data-ui~='topic.inspector'] [data-ui~='asst.ctx']"), "the assistant actions were dropped rather than moved");
  /* the bar is static by decision: a sticky strip sat over the first line
     of every paragraph the reader scrolled to */
});

step("nothing between the header and the content but that one bar", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const col = $("[data-ui~='study.col']");
  const kids = [...col.children].map(n => n.getAttribute("data-ui") || n.tagName.toLowerCase());
  assert(kids.length === 3, "the column has " + kids.length + " blocks: " + kids.join(" | "));
  assert(/(^| )topic\.head( |$)/.test(kids[0]), "first block is " + kids[0]);
  assert(/(^| )topic\.nav( |$)/.test(kids[1]), "second block is " + kids[1]);
  assert(/(^| )study\.panel( |$)/.test(kids[2]), "third block is " + kids[2]);
  /* the 170px Topic Status band that used to sit here is in the inspector */
  assert(!col.querySelector("[data-ui~='topic.status']"), "the status band is back between the header and the content");
});

/* ============ C · one state surface ============ */
console.log("== C · one state surface ==");

step("the Topic Status component lives in the inspector", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const insp = $("[data-ui~='topic.inspector']");
  const ctl = insp.querySelector("[data-ui~='topic.status']");
  assert(ctl, "the state component is not in the inspector");
  assert(insp.firstElementChild.nextElementSibling.firstElementChild === ctl ||
         insp.querySelector("[data-ui~='topic.inspector-body']").firstElementChild === ctl,
    "the state component is not the inspector's first section");
  assert(ctl.querySelector("[data-ui~='topic.status-field-status'] [data-ui~='ui.status-select']"), "the status field went missing in the move");
  assert(ctl.querySelectorAll("[data-ui~='topic.checkgrid'] input[type=checkbox]").length === 4, "the four checks went missing");
  assert(ctl.querySelector("[data-ui~='topic.status-field-conf'] [data-ui~='rag.picker']"), "confidence went missing");
});

step("the Inspector is the only topic-status control", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const field = $("#ts-status");
  assert(field, "the Inspector status control is missing");
  assert(!$("#th-status") && !$(".th-status"), "the removed header status UI is back");
  assert(field.value === "none", "the Inspector control did not open at the stored value");
  field.value = "paused";
  field.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.store.getProgress(SID, REF).status === "paused", "the Inspector control did not write");
  field.value = "started";
  field.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.store.getProgress(SID, REF).status === "started", "the Inspector control did not update a second time");
});

step("ticking a check updates the Inspector and spec spine", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const box = $$("[data-ui~='topic.checkgrid'] input[type=checkbox]")[0];
  box.checked = true;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert($("[data-ui~='topic.status-pct']").textContent === "25%", "mastery: " + $("[data-ui~='topic.status-pct']").textContent);
  assert($("#ts-status").value === "started", "the inspector status did not follow the check");
  const active = document.getElementById("tree").querySelector("[data-ui~='study.spine-leaf'][data-state~='active'] [data-ui~='part.status']");
  assert(active.getAttribute("data-status") === "started", "the spine did not follow the check");
});

/* ============ D · compact note-page navigation ============ */
console.log("== D · note pages ==");

step("a paginated topic opens on one direct reader control in the nav", () => {
  assert(PAGED, "no multi-page topic in the deep content — this suite cannot see the pager");
  KOS.show("ref", PAGED);
  const reader = $("[data-ui~='topic.nav'] [data-ui~='topic.pager']");
  const select = $("[data-ui~='topic.reader-page-select']");
  assert(reader && select, "no reader control in the nav bar");
  assert(select.options.length > 1, "expected several named pages, got " + select.options.length);
  assert(select.value === "0" && /^Page 1 of \d+ — \S/.test(select.options[0].textContent), "the first page is not selected and named");
  assert(!$(".np-pill"), "the retired wall of page pills returned");
});

step("the page picker turns the page, and the footer repeats the neighbours as cards", () => {
  const select = $("[data-ui~='topic.reader-page-select']");
  select.value = "1";
  select.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(select.value === "1", "the page picker did not turn the page");
  const foot = $("[data-ui~='topic.note-foot']");
  assert(foot, "no footer pager under the article");
  assert(foot.querySelectorAll("[data-ui~='topic.page']").length === 2, "the footer does not offer both neighbours from a middle page");
  assert(/Page 2 of/.test($("[data-ui~='topic.note-count']").textContent), "the footer count is wrong: " + $("[data-ui~='topic.note-count']").textContent);
});

step("the reader controls turn pages and stop at both ends", () => {
  KOS.show("ref", PAGED);
  const total = $("[data-ui~='topic.reader-page-select']").options.length;
  const [prev, next] = $$("[data-ui~='topic.reader-step']");
  assert(prev.disabled, "the back step is live on the first page");
  click(next);
  assert($("[data-ui~='topic.reader-page-select']").value === "1", "the forward step did not turn the page");
  assert(!prev.disabled, "the back step stayed disabled off the first page");
  for (let i = 2; i < total; i++) click(next);
  assert($("[data-ui~='topic.reader-page-select']").value === String(total - 1), "could not reach the last page");
  assert(next.disabled, "the forward step is live on the last page");
});

step("B-04 holds: only a READER-initiated page turn scrolls (Phase A)", () => {
  const calls = [];
  const real = window.Element.prototype.scrollIntoView;
  window.Element.prototype.scrollIntoView = function () { calls.push(this.getAttribute("data-ui") || ""); };
  try {
    KOS.show("ref", PAGED);
    assert(!calls.some(c => c.split(" ").includes("topic.notes")),
      "the article scrolled itself into view on first mount: " + JSON.stringify(calls));
    calls.length = 0;
    click($$("[data-ui~='topic.reader-step']")[1]);
    assert(calls.some(c => c.split(" ").includes("topic.notes")), "turning a page did not scroll to it");
  } finally { window.Element.prototype.scrollIntoView = real; }
});

step("the page control is cleared when you leave the Notes tab", () => {
  KOS.show("ref", PAGED);
  assert($("[data-ui~='topic.pager']"), "no reader control on the Notes tab");
  const spec = $$("[data-ui~='topic.tabs'] [data-ui~='ui.tab']").find(b => b.dataset.tab === "spec");
  click(spec);
  assert(!$("[data-ui~='topic.pager']"), "the reader control survived a tab change — it lives outside the panel");
  assert(!$("[data-ui~='topic.reader-page-select']"), "the page picker survived a tab change");
});

/* ============ E · keyboard control of the engines (audit REF-8) ============ */
console.log("== E · engine keyboard control ==");

function openCards() {
  KOS.show("ref", { subject: SID, ref: REF });
  click($$("[data-ui~='topic.tabs'] [data-ui~='ui.tab']").find(b => b.dataset.tab === "cards"));
}

step("Space flips the flashcard, in both directions", () => {
  openCards();
  const card = $("[data-ui~='fc.card']");
  assert(card, "no flashcard mounted");
  assert(!card.matches('[data-state~="flipped"]'), "the card opened face-up");
  key(" ");
  assert(card.matches('[data-state~="flipped"]'), "Space did not flip the card");
  key(" ");
  assert(!card.matches('[data-state~="flipped"]'), "Space did not flip it back");
});

step("1–4 grade a revealed card, and are ignored on a face-down one", () => {
  openCards();
  const before = $("[data-ui~='fc.front']").textContent;
  key("3");
  assert($("[data-ui~='fc.front']").textContent === before, "a face-down card was graded by a stray keypress");
  key(" ");
  key("3");
  assert($("[data-ui~='fc.front']").textContent !== before, "1–4 did not grade the revealed card");
});

step("→ reveals, then grades Good; ← hides the answer again", () => {
  openCards();
  const card = $("[data-ui~='fc.card']");
  key("ArrowRight");
  assert(card.matches('[data-state~="flipped"]'), "→ did not reveal the answer");
  key("ArrowLeft");
  assert(!card.matches('[data-state~="flipped"]'), "← did not hide the answer");
  key("ArrowRight");
  const before = $("[data-ui~='fc.front']").textContent;
  key("ArrowRight");
  assert($("[data-ui~='fc.front']").textContent !== before, "→ on a revealed card did not advance");
});

step("the keys are printed under the card, not buried in a help page", () => {
  openCards();
  const hint = $("[data-ui~='fc.keys']");
  assert(hint, "no keyboard legend");
  assert(/Space/.test(hint.textContent) && /flip/.test(hint.textContent), "the legend does not name the flip key");
  const rate = $("[data-ui~='fc.r'] [data-ui~='fc.r-key']");
  assert(rate && rate.textContent === "1", "the grading buttons do not carry their number key");
  assert($("[data-ui~='fc.r']").getAttribute("aria-keyshortcuts") === "1", "the shortcut is not exposed to assistive tech");
});

step("the engine never steals a key from a text field", () => {
  openCards();
  const card = $("[data-ui~='fc.card']");
  const ta = document.createElement("textarea");
  $("[data-ui~='fc.wrap']").appendChild(ta);
  ta.dispatchEvent(new window.KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
  assert(!card.matches('[data-state~="flipped"]'), "Space in a textarea flipped the card");
  ta.remove();
});

step("the listener removes itself once its panel is gone", () => {
  openCards();
  const dead = $("[data-ui~='fc.card']");
  /* leaving the tab replaces panel.innerHTML wholesale — there is no
     teardown callback, so the listener has to notice it has been orphaned */
  click($$("[data-ui~='topic.tabs'] [data-ui~='ui.tab']").find(b => b.dataset.tab === "spec"));
  key(" ");
  assert(!dead.matches('[data-state~="flipped"]'), "an orphaned card still answers the keyboard");
  assert(!document.contains(dead), "the old card is somehow still in the document");
});

step("1–9 answer the first quiz question still open", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  click($$("[data-ui~='topic.tabs'] [data-ui~='ui.tab']").find(b => b.dataset.tab === "quiz"));
  const cards = $$("[data-ui~='quiz.card']");
  assert(cards.length > 1, "expected several quiz questions, got " + cards.length);
  assert(cards[0].querySelector("[data-ui~='quiz.option'] [data-ui~='quiz.option-key']").textContent === "1",
    "the options do not carry their number key");
  key("1");
  assert(cards[0].querySelector("[data-ui~='quiz.why']"), "the first question was not answered");
  assert(!cards[1].querySelector("[data-ui~='quiz.why']"), "a second question was answered by one keypress");
  key("1");
  assert(cards[1].querySelector("[data-ui~='quiz.why']"), "the key did not move on to the next open question");
  assert(cards[0].querySelectorAll("[data-ui~='quiz.why']").length === 1, "an answered question was answered twice");
});

/* ============ F · targets and labels ============ */
console.log("== F · targets and labels ==");

/* UI rebuild M2: "the four progress checks are a usable size (REF-5)"
   read the legacy .ctl-row rule; target sizes are the components layer's
   32px/44px contract now (smoke45). */
step("confidence says what it means (REF-7)", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const picks = $$("[data-ui~='rag.picker'] [data-ui~='rag.pick']");
  assert(picks.length === 3, "expected three confidence controls, got " + picks.length);
  const words = picks.map(p => p.querySelector("[data-ui~='rag.option-label']").textContent);
  assert(words.join("|") === "struggling|shaky|solid", "confidence labels: " + words.join("|"));
  picks.forEach(p => {
    assert(p.getAttribute("aria-pressed") === "false", "the pressed state is not announced");
    assert(/—/.test(p.getAttribute("aria-label")), "the control has no accessible name");
  });
  click(picks[0]);
  assert(picks[0].getAttribute("aria-pressed") === "true", "pressing did not announce itself");
  assert(KOS.rag.manual(SID, REF) === "r", "the press did not reach the store");
  click(picks[0]);
  assert(KOS.rag.manual(SID, REF) === null, "pressing again did not clear it");
});

/* UI rebuild M2: "the rating sub-labels are legible (REF-10)" read the
   legacy .fc-r-hint rule; the 11px label floor is a stylesheet-wide guard
   now (smoke47). */
/* Exactly one way in at every tier: the 32px rail while the spine is a
   column, the page-header button while it is an overlay drawer, and never
   both. `.btn` is declared after the hide rule, so the hide has to out-weigh
   it — writing it as a bare class silently handed the display back and put
   two openers on a 1440 page. */
step("only one spine opener is reachable at a time", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  assert($$("#main [data-ui~='study.spine-open']").length === 1, "the topic page renders more than one opener");
  KOS.show("subject", SID);
  assert($$("#main [data-ui~='study.spine-open']").length === 0, "the desk offers a spine it does not draw");
});

step("a closed spine takes no space on the overlay tiers (SUBJ-4)", () => {
  /* Phase B fixed the pill's text wrap; the pill itself stayed fixed over
     the page, printing on whatever paragraph was under it. A right-edge
     pixel probe cannot see that, which is why it survived a whole phase. */
  /* M2: the spine's open/closed state is #cols[data-tree] (KOS.shell.tree),
     which the layout layer may select; the legacy .tree-closed rules and
     their floating-pill negative check went with main.css */
  if (pending("layout", "a closed spine takes no space")) return;
  assert(/#cols\[data-tree="closed"\] #tree \{[^}]*display:\s*none/.test(css),
    "the closed spine still occupies the overlay tiers");
});

step("the desk's own analytics footnote collapses (SUBJ-6)", () => {
  KOS.show("subject", SID);
  const foot = $("[data-ui~='study.analytics-foot']");
  assert(foot && foot.tagName === "DETAILS", "the dense explanatory paragraph is back as body text");
  assert(!foot.open, "the definition is open by default");
  assert(/Deep revision content/.test(foot.querySelector("[data-ui~='study.analytics-foot-fact']").textContent),
    "the line that carries information every time was hidden with the definition");
});

/* UI rebuild M2: "a long deadline title wraps (SUBJ-5)" read the legacy
   .dl-title rule and is retired with it (Home is rebuilt in M6). */
step("the source keeps the retired ledger out of the desk", () => {
  assert(!/class: "sec-grid"/.test(hubSrc), "the section ledger is being rendered again");
  assert(!/class: "sec-card /.test(hubSrc), "a duplicate section row is being rendered again");
});

/* ============ G · Home (Cat 7 Phase C part 2) ============ */
console.log("== G · home ==");

/* The account these steps run against is the shape the audit found: real
   activity (sessions, a streak, a level) and NOT ONE ticked progress check.
   That is precisely the account the old hero told "0% covered · 0 mastered". */
function activeButUnticked() {
  KOS.store.state.progress = {};
  KOS.store.state.sessions = [];
  const day = 86400000, now = Date.now();
  for (let i = 0; i < 24; i++) {
    const ts = now - (i % 6) * day - i * 3600000;
    KOS.store.state.sessions.push({ id: i + 1, ts, date: new Date(ts).toISOString().slice(0, 10),
      type: i % 4 === 0 ? "focus" : "flashcards", subject: "compsci", ref: REF,
      dur: 1800, metrics: { complete: true } });
  }
  KOS.store.state.sessions.sort((a, b) => a.ts - b.ts);
}

step("the headline figures describe activity, not an unticked checklist", () => {
  activeButUnticked();
  KOS.show("home");
  /* Graphite (frame 7a): hours this week became the Study hours card's own
     headline, so the facts beneath its chart are the streak and the cards */
  const tiles = $$("[data-ui~='home.facts'] [data-ui~='home.fact']");
  assert(tiles.length === 2, "expected two figures under the week, got " + tiles.length);
  const labels = tiles.map(t => t.querySelector("[data-ui~='part.label']").textContent);
  assert(/^days?\|due$/.test(labels.join("|")), "week figures: " + labels.join("|"));
  /* the retired ones, by name: they read 0 for this account */
  const hero = $("[data-ui~='home.id']").textContent;
  assert(!/Spec points/.test(hero), "the hero still leads with a spec-point tally");
  assert(!/Mastered/.test(hero), "the hero still leads with a mastered count");
  assert(!$("[data-ui~='home.hero'] [data-ui~='home.ring']"), "the 0%-COVERED ring is back on the hero");
  /* and at least one of the three is genuinely non-zero for this account */
  const values = tiles.map(t => t.querySelector("[data-ui~='part.value']").textContent);
  assert(values.some(v => v !== "0" && v !== "0.0"), "every headline figure still reads zero: " + values.join("|"));
});

step("a headline figure that goes somewhere is a native button; the rest are not controls", () => {
  KOS.show("home");
  const tiles = $$("[data-ui~='home.facts'] [data-ui~='home.fact']");
  const due = tiles.find(t => /Card/.test(t.querySelector("[data-ui~='part.caption']").textContent));
  assert(due && due.tagName === "BUTTON" && due.getAttribute("type") === "button",
    "the Cards due figure is not a native button");
  assert(!due.hasAttribute("role") && !due.hasAttribute("tabindex"),
    "the figure still carries the role/tabindex a div needed");
  tiles.filter(t => t !== due).forEach(t => {
    assert(t.tagName !== "BUTTON" && !t.hasAttribute("role") && !t.hasAttribute("tabindex"),
      "a figure that goes nowhere is exposed as a control");
  });
  due.click();
  assert(KOS.store.state.ui.view === "due", "the Cards due figure no longer opens Due Today");
});

step("every headline figure explains what it means, so a zero is an answer", () => {
  KOS.show("home");
  $$("[data-ui~='home.facts'] [data-ui~='home.fact']").forEach(t => {
    const s = t.querySelector("[data-ui~='part.caption']");
    assert(s && s.textContent.trim(), "a headline figure carries no line of context");
  });
  /* coverage kept its place — on the subject desks, where it belongs: the
     ring and the Topics done / total row */
  $$("[data-ui~='home.desk'][data-sid]").forEach(c => {
    assert(c.querySelector("[data-ui~='home.ring'][role='img']"), "a subject desk lost its completion ring");
    assert(/Topics\s*\d+ \/ \d+/.test(c.textContent), "coverage was dropped rather than demoted to the subject desks");
  });
});

step("the page leads with one decision, one reason and one primary action", () => {
  KOS.show("home");
  const main = document.getElementById("main");
  const next = main.querySelector("[data-ui~='home.next']");
  assert(next, "no decision surface");
  /* Graphite (frame 7a): the hero and the routines/reminders pair sit
     above; Up next leads the working column beneath them */
  assert(next.parentElement.firstElementChild === next, "the decision surface does not lead its column");
  assert(next.querySelector("[data-ui~='home.next-kicker']").textContent.trim(), "the statement has no kicker");
  assert(next.querySelector("[data-ui~='home.next-label']").textContent.trim(), "the statement is empty");
  assert(next.querySelector("[data-ui~='home.next-why']").textContent.trim(), "the statement gives no reason");
  /* at most one primary per surface: the daily goal's "Start focus" in the
     hero (frame 7a) and Up next's own action — never a third, and never on
     the greeting line itself */
  const primaries = [...main.querySelectorAll("button[data-intent~='primary']")];
  assert(primaries.length === 2, "expected the goal's and Up next's primaries, found " + primaries.length);
  assert(primaries.filter(b => next.contains(b)).length === 1, "Up next does not carry exactly one primary");
  assert(primaries.filter(b => b.closest("[data-ui~='home.hero'] [data-ui~='habit.panel']")).length === 1,
    "the hero's primary is not the daily goal's");
  assert(!main.querySelector("[data-ui~='home.hero'] h1 button"), "the greeting line is competing with a CTA again");
});

step("the decision surface picks the most perishable thing first", () => {
  /* due cards outrank a dated item, which outranks a directive, which
     outranks carrying on — and each branch hands off to the view that
     already owns the work rather than doing anything itself */
  KOS.store.state.srs = {};
  KOS.store.state.calendar = { v: 2, nextId: 1, seeded: true, events: [], notified: {} };
  KOS.store.state.assignments = { v: 1, nextId: 1, items: [] };
  /* the weekly plan feeds the ladder too (class milestones, carry-over) — emptied here */
  if (KOS.store.state.pacing) KOS.store.state.pacing.entries = [];
  KOS.store.state.ui.lastRef.compsci = REF;
  KOS.show("home");
  assert($("[data-ui~='home.next-kicker']").textContent === "Where you left off",
    "with nothing pressing it should offer to continue, got: " + $("[data-ui~='home.next-kicker']").textContent);
  assert($("[data-ui~='home.next-label']").textContent.indexOf(REF) === 0, "it did not name the topic");

  /* now make a card due — recall decay outranks carrying on */
  const card = KOS.srs.cardsFor(SID, REF)[0];
  assert(card, "no card to schedule");
  KOS.store.state.srs[card.key] = { ef: 2.5, ivl: 1, reps: 1, due: "2000-01-01",
    last: "1999-12-31", views: 1, lapses: 0, lastRating: 2 };
  KOS.show("home");
  assert($("[data-ui~='home.next-kicker']").textContent === "Due today", "a due card did not take priority");
  assert($("[data-ui~='home.next-label']").textContent === "Review 1 due card", "wrong statement: " + $("[data-ui~='home.next-label']").textContent);
  $("[data-ui~='home.next-go']").click();
  assert(KOS.store.state.ui.view === "due", "the action did not reach the review queue");
});

step("a running session outranks everything", () => {
  const real = KOS.focus.state;
  KOS.focus.state = () => "running";
  try {
    KOS.show("home");
    assert($("[data-ui~='home.next-kicker']").textContent === "In progress", "a running session was not the first answer");
    assert($("[data-ui~='home.next']").matches('[data-state~="live"]'), "the running state is not marked");
  } finally { KOS.focus.state = real; }
});

step("empty Directives and Countdowns collapse to one line, not two boxes", () => {
  KOS.store.state.srs = {};
  KOS.store.state.calendar = { v: 2, nextId: 1, seeded: true, events: [], notified: {} };
  KOS.store.state.reminders = { v: 2, nextId: 1, migrated: true, items: [], lists: [], rewardLog: {} };
  KOS.store.state.assignments = { v: 1, nextId: 1, items: [] };
  if (KOS.store.state.pacing) KOS.store.state.pacing.entries = [];
  KOS.show("home");
  assert(!$("[data-ui~='home.today']"), "the two-column row is still rendered with nothing in it");
  const quiet = $("[data-ui~='home.quiet']");
  assert(quiet, "no collapsed row");
  assert(quiet.querySelector("[data-ui~='ui.empty'][data-state~='compact']"), "the collapsed row is not the compact empty state");
  assert(quiet.querySelector("[data-ui~='ui.empty-action'] button"), "the collapsed row offers no way to fix it");
  assert(!$("[data-ui~='home.path-card']"), "the directives box survived");
  assert(!$("[data-ui~='cal.countdowns']"), "the countdowns box survived");
});

step("one populated panel takes the full width rather than sitting beside a hole", () => {
  /* 20 days out: far enough to be a countdown but NOT to generate a
     directive (autoItems only raises exams inside five days), so exactly one
     of the two panels has content */
  KOS.store.state.calendar = { v: 2, nextId: 2, seeded: true, notified: {},
    events: [{ id: 1, type: "exam", title: "Paper 1", date: new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10),
      time: "09:00", dur: 60, subject: SID, colour: "", recur: "", alerts: [], alerted: {},
      showInCountdown: true, notes: "" }] };
  KOS.show("home");
  const row = $("[data-ui~='home.today']");
  assert(row, "the row disappeared with content on it");
  assert(row.matches('[data-state~="one-up"]'), "a single populated panel did not take the full width");
  assert($("[data-ui~='cal.countdowns']"), "the countdown panel is missing");
  assert(!$("[data-ui~='home.path-card']"), "an empty directives box is back beside it");
});

step("the Collection card is the same component as the subject cards", () => {
  KOS.show("home");
  const med = $("[data-ui~='home.collection-desk']");
  assert(med, "no Collection card");
  assert(med.matches('[data-ui~="home.desk"]'), "it is not the subject-card component");
  /* the four things it lacked: a ring, a track, a meta line and a Continue */
  assert(med.querySelector("[data-ui~='study.subject-card-top'] [data-ui~='home.ring'][role='img']"), "no completion ring");
  assert(med.querySelector("[data-ui~='media.bar'] [data-ui~='media.bar-fill']"), "no progress track");
  assert(med.querySelector("[data-ui~='part.meta']").textContent.trim(), "no meta line");
  /* Phase F strengthened the shared-card contract: the container may grow
     interactive descendants, so it must not impersonate a button. The title
     is the named keyboard control instead. */
  assert(med.getAttribute("role") !== "button" && !med.hasAttribute("tabindex"),
    "the card container is still an ARIA button");
  const open = med.querySelector("button[data-ui~='home.desk-open']");
  assert(open && open.textContent.trim(), "the Collection title is not a named keyboard control");
});

step("Home does not open the media vault on its render pass", () => {
  /* mediadb.stats is a full-table cursor scan (~1,900 rows on a real
     account). It runs when the card is on screen, not when Home boots —
     jsdom has no IntersectionObserver, so this is also what keeps the
     migration fixtures in smoke5/smoke6 owning their own database. */
  assert(typeof window.IntersectionObserver !== "function",
    "jsdom grew an IntersectionObserver — this step no longer proves anything");
  assert(/IntersectionObserver/.test(hubSrc.slice(hubSrc.indexOf("fillCollectionCard"))),
    "the Collection card's scan is not gated on visibility");
  KOS.show("home");
  assert(/Anime · books · visual novels · games/.test($("[data-ui~='home.collection-desk'] [data-ui~='part.meta']").textContent),
    "the card fetched its figures during render");
});

step("the week chart says what it is (HOME-6)", () => {
  /* Graphite (frame 7a): the seven pips became the Study hours chart; the
     contract carries over — seven dated days, announced as one image */
  KOS.show("home");
  const chart = $("[data-ui~='home.week']");
  assert(chart && chart.getAttribute("role") === "img", "the week chart is not one image");
  assert(/^Study hours this week/.test(chart.getAttribute("aria-label")), "the chart is not announced to assistive tech");
  const days = $$("[data-ui~='home.week-day']");
  assert(days.length === 7, "expected seven days, got " + days.length);
  days.forEach(d => assert(/^\d{4}-\d\d-\d\d$/.test(d.getAttribute("title")), "a day carries no date"));
});

step("the hero's text never depends on the banner artwork (HOME-2)", () => {
  /* the figures used to be bare text on the side the band's gradient
     deliberately leaves transparent — legibility was a property of whichever
     image the user had uploaded */
  assert(/scrim === "hero"/.test(fs.readFileSync(path.join(ROOT, "js/core/governor.js"), "utf8")),
    "the hero scrim was removed from applyBanner");
  assert(/applyBanner\(band, \{ scrim: "hero" \}\)/.test(hubSrc), "Home no longer asks for its scrim");
});

step("the status pill is a real control, not a decorative focus stop (HOME-7)", () => {
  KOS.store.state.governor.status = "Deep work until noon";
  KOS.show("home");
  const pill = $("[data-ui~='home.status']");
  if (!pill) return;                       /* no status set — nothing to check */
  assert(pill.tagName === "BUTTON", "the status pill is not a button");
  assert(pill.getAttribute("title"), "a focusable control with no accessible name");
});

/* ---- run ---- */
let pass = 0;
for (const [name, fn] of steps) {
  try { fn(); console.log("  ok  " + name); pass++; }
  catch (e) { errors.push('STEP "' + name + '": ' + (e.message || e)); console.log("FAIL  " + name); }
}

if (errors.length) {
  console.log("\nSMOKE43 FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log("  - " + e));
  process.exit(1);
}
console.log("\nSMOKE43 PASS — Category 7 Phase C (Study + Home) verified (" + pass + " steps).");
process.exit(0);
