/* Kurenai OS — smoke43.test.js
   Category 7 Phase C — the Study redesign (subject desk + topic shell).

   smoke37 defends CONSISTENCY across the Study surfaces (one derivation per
   statistic, one format, no contradictory pairs). This suite defends the
   things Phase C actually changed, and would otherwise regress silently:

     A · the spine owns section navigation — it inherited the retired
         ledger's bar and subsection tally, it reveals the topic you are on,
         and it is a dismissible drawer on the tiers where it is an overlay
     B · content first — one header row, one navigation layer, and the first
         word of revision material within 140px of the topic header
     C · one state surface — the Topic Status component lives in the
         inspector, mastery and the material counts each appear once, and the
         header's status control is the same store value as the field
     D · compact note-page navigation — a stepper by default, the full page
         list behind a disclosure, and B-04's scroll rule still honoured
     E · keyboard control of the flashcard and quiz engines (audit REF-8),
         including the guards that stop them stealing keys from a text field
         and the self-removal that stops them accumulating per tab switch
     F · touch targets and legible labels (REF-5, REF-7, REF-10)

   Run: node tools/smoke43.test.js                                        */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
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

step("the spine inherited the retired ledger's bar and subsection tally", () => {
  KOS.show("subject", SID);
  const tree = document.getElementById("tree");
  const bars = tree.querySelectorAll(".sec-head .sec-head-bar .bar-fill");
  assert(bars.length >= 8, "the spine has no per-section progress bars (" + bars.length + ")");
  /* the ledger's one genuinely extra reading was the per-SUBSECTION tally it
     revealed on expand; deleting the ledger must not have deleted that */
  const gp = tree.querySelectorAll(".grp-h .grp-pc");
  assert(gp.length >= 1, "no per-subsection tally on the spine's group rows");
  assert(/^\d+ \/ \d+$/.test(gp[0].textContent.trim()),
    "the group tally does not use the shared A / B format: " + gp[0].textContent);
});

step("the bar carries the same quantity as the count printed beside it", () => {
  KOS.show("subject", SID);
  const head = document.getElementById("tree").querySelector(".sec-head");
  const pc = head.querySelector(".pc").textContent.trim().split(" / ").map(Number);
  const width = head.querySelector(".sec-head-bar .bar-fill").style.width;
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
  const active = tree.querySelector(".leaf.active");
  assert(active, "no active leaf in the spine");
  const sec = active.closest(".sec");
  assert(sec && sec.classList.contains("open"), "the owning section did not open itself");
  assert(sec.classList.contains("here"), "the owning section is not marked as the one you are in");
  assert(KOS.store.state.ui.openSections[SID][sec.querySelector(".ref").textContent] === true,
    "the reveal did not go through the stored openSections");
});

step("the spine is a dismissible drawer on the tiers where it is an overlay", () => {
  /* #tree goes position:fixed at ≤860, but the default-closed rule only ran
     at ≤700 — so between 701 and 860 the spine simply covered the page it
     navigates, with no scrim and nothing to dismiss it */
  assert(/#tree \{ position: fixed/.test(css.slice(css.indexOf("@media (max-width: 860px)"))),
    "the 860 tier no longer floats the spine — this suite's premise is stale");
  mediaWidth = 820;
  KOS.store.state.ui.treeClosed = null;
  KOS.show("subject", SID);
  assert(document.getElementById("cols").classList.contains("tree-closed"),
    "at 820 the spine still defaults to open, covering the page");
  /* the page header carries the opener, so nothing floats over the content */
  const opener = $("#main .tree-open-btn");
  assert(opener, "no in-page opener for the drawer");
  click(opener);
  assert(!document.getElementById("cols").classList.contains("tree-closed"), "the opener did not open the drawer");
  const scrim = document.getElementById("tree-scrim");
  assert(scrim, "the drawer has no scrim element");
  click(scrim);
  assert(document.getElementById("cols").classList.contains("tree-closed"), "tapping the scrim did not close the drawer");
  click(opener);
  key("Escape");
  assert(document.getElementById("cols").classList.contains("tree-closed"), "Escape did not close the drawer");
  mediaWidth = 1440;
  KOS.store.state.ui.treeClosed = false;
});

step("above the overlay tier Escape is left alone", () => {
  mediaWidth = 1440;
  KOS.store.state.ui.treeClosed = false;
  KOS.show("subject", SID);
  key("Escape");
  assert(!document.getElementById("cols").classList.contains("tree-closed"),
    "Escape collapsed the spine on a viewport where it is an ordinary column");
});

/* ============ B · content first ============ */
console.log("== B · content first ==");

step("the topic header is ONE row and absorbs the crumb path", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const main = document.getElementById("main");
  assert(!main.querySelector(".crumbs"), "the separate crumb row is back");
  const head = main.querySelector(".topic-head");
  assert(head && main.firstElementChild === head, "the topic header does not lead the page");
  assert(head.querySelector(".seal"), "no ref seal");
  assert(head.querySelector("h1"), "no title");
  const meta = head.querySelector(".th-meta").textContent;
  assert(meta.includes(window.KOS_DATA[SID].name), "the meta line dropped the subject the crumbs carried");
  assert(meta.includes(window.KOS_DATA[SID].board), "the meta line dropped the board");
  /* the one control used constantly rather than occasionally stays above */
  assert(head.querySelector(".th-ctl .status-sel"), "the compact status control is not in the header");
});

step("the page carries ONE study navigation layer, above the content", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const col = $(".study-col");
  const nav = col.querySelector(".study-nav");
  assert(nav && col.firstElementChild === nav, "the nav bar does not lead the content column");
  assert(nav.querySelector(".study-tabs-topic"), "the tab strip is not in the bar");
  /* the assistant strip used to sit on the path between the title and the
     first word of content; it is a side-of-desk affordance now */
  assert(!col.querySelector(".asst-ctx"), "the assistant strip is back on the content path");
  assert($(".study-inspector .asst-ctx"), "the assistant actions were dropped rather than moved");
  assert(/\.study-nav\s*\{[^}]*position:\s*sticky/s.test(css), "the nav bar does not stay reachable while reading");
});

step("nothing between the header and the content but that one bar", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const main = document.getElementById("main");
  const kids = [...main.children].map(n => n.className);
  assert(kids.length === 3, "the page has " + kids.length + " top-level blocks: " + kids.join(" | "));
  assert(/topic-head/.test(kids[0]), "first block is " + kids[0]);
  assert(/study-grid/.test(kids[1]), "second block is " + kids[1]);
  /* the 170px Topic Status band that used to sit here is in the inspector */
  assert(!main.firstElementChild.nextElementSibling.classList.contains("topic-status"),
    "the status band is back between the header and the content");
});

/* ============ C · one state surface ============ */
console.log("== C · one state surface ==");

step("the Topic Status component lives in the inspector", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const insp = $(".study-inspector");
  const ctl = insp.querySelector(".topic-status");
  assert(ctl, "the state component is not in the inspector");
  assert(insp.firstElementChild.nextElementSibling.firstElementChild === ctl ||
         insp.querySelector(".insp-body").firstElementChild === ctl,
    "the state component is not the inspector's first section");
  assert(ctl.querySelector(".ts-field-status .status-sel"), "the status field went missing in the move");
  assert(ctl.querySelectorAll(".ts-checkgrid input[type=checkbox]").length === 4, "the four checks went missing");
  assert(ctl.querySelector(".ts-field-conf .rag-picker"), "confidence went missing");
});

step("the header control and the inspector field are ONE store value", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const head = $("#th-status"), field = $("#ts-status");
  assert(head && field, "expected both status controls");
  assert(head.value === "none" && field.value === "none", "the controls did not open in step");
  head.value = "paused";
  head.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(KOS.store.getProgress(SID, REF).status === "paused", "the header control did not write");
  assert(field.value === "paused", "the inspector field did not follow the header");
  field.value = "started";
  field.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert(head.value === "started", "the header did not follow the inspector field");
  /* and the header's colour cue moves with them */
  assert($(".th-status").className === "th-status st-started",
    "the header glyph did not follow: " + $(".th-status").className);
});

step("ticking a check moves every surface that reads the same derivation", () => {
  KOS.store.state.progress = {};
  KOS.show("ref", { subject: SID, ref: REF });
  const box = $$(".ts-checkgrid input[type=checkbox]")[0];
  box.checked = true;
  box.dispatchEvent(new window.Event("change", { bubbles: true }));
  assert($(".ts-pct").textContent === "25%", "mastery: " + $(".ts-pct").textContent);
  assert($("#th-status").value === "started", "the header status did not follow the check");
  assert($("#ts-status").value === "started", "the inspector status did not follow the check");
  const active = document.getElementById("tree").querySelector(".leaf.active .st");
  assert(active.className.includes("st-started"), "the spine did not follow the check");
});

/* ============ D · compact note-page navigation ============ */
console.log("== D · note pages ==");

step("a paginated topic opens on a stepper, not a row of pills", () => {
  assert(PAGED, "no multi-page topic in the deep content — this suite cannot see the pager");
  KOS.show("ref", PAGED);
  const stepper = $(".study-nav .note-stepper");
  assert(stepper, "no compact page stepper in the nav bar");
  assert($(".np-count").textContent === "1 / " + $$(".note-page-tab").length,
    "the stepper does not say where you are: " + $(".np-count").textContent);
  const pager = $(".note-pager");
  assert(pager && pager.hidden, "the full page list is not collapsed by default");
  assert($(".np-all").getAttribute("aria-expanded") === "false", "the disclosure is not announced as closed");
});

step("the disclosure reveals the full page list, and it still turns pages", () => {
  click($(".np-all"));
  assert(!$(".note-pager").hidden, "the page list did not open");
  assert($(".np-all").getAttribute("aria-expanded") === "true", "the disclosure state is not announced");
  const tabs = $$(".note-page-tab");
  assert(tabs.length > 1, "expected several page tabs, got " + tabs.length);
  click(tabs[1]);
  assert(tabs[1].classList.contains("active"), "the page did not turn");
  assert(tabs[1].getAttribute("aria-selected") === "true", "the turned page is not announced");
  assert($(".np-count").textContent.startsWith("2 / "), "the stepper did not follow the list");
});

step("the stepper turns pages and stops at both ends", () => {
  KOS.show("ref", PAGED);
  const total = $$(".note-page-tab").length;
  const [prev, next] = $$(".np-step");
  assert(prev.disabled, "the back step is live on the first page");
  click(next);
  assert($(".np-count").textContent === "2 / " + total, "the forward step did not turn the page");
  assert(!prev.disabled, "the back step stayed disabled off the first page");
  for (let i = 2; i < total; i++) click(next);
  assert($(".np-count").textContent === total + " / " + total, "could not reach the last page");
  assert(next.disabled, "the forward step is live on the last page");
});

step("B-04 holds: only a READER-initiated page turn scrolls (Phase A)", () => {
  const calls = [];
  const real = window.Element.prototype.scrollIntoView;
  window.Element.prototype.scrollIntoView = function () { calls.push(this.className); };
  try {
    KOS.show("ref", PAGED);
    assert(calls.indexOf("notes-article") === -1,
      "the article scrolled itself into view on first mount: " + JSON.stringify(calls));
    calls.length = 0;
    click($$(".np-step")[1]);
    assert(calls.indexOf("notes-article") !== -1, "turning a page did not scroll to it");
  } finally { window.Element.prototype.scrollIntoView = real; }
});

step("the page control is cleared when you leave the Notes tab", () => {
  KOS.show("ref", PAGED);
  assert($(".note-stepper"), "no stepper on the Notes tab");
  const spec = $$(".study-tabs-topic .study-tab").find(b => b.dataset.tab === "spec");
  click(spec);
  assert(!$(".note-stepper"), "the note stepper survived a tab change — it lives outside the panel");
  assert(!$(".note-page-tab"), "the page list survived a tab change");
});

/* ============ E · keyboard control of the engines (audit REF-8) ============ */
console.log("== E · engine keyboard control ==");

function openCards() {
  KOS.show("ref", { subject: SID, ref: REF });
  click($$(".study-tabs-topic .study-tab").find(b => b.dataset.tab === "cards"));
}

step("Space flips the flashcard, in both directions", () => {
  openCards();
  const card = $(".fc-card");
  assert(card, "no flashcard mounted");
  assert(!card.classList.contains("flipped"), "the card opened face-up");
  key(" ");
  assert(card.classList.contains("flipped"), "Space did not flip the card");
  key(" ");
  assert(!card.classList.contains("flipped"), "Space did not flip it back");
});

step("1–4 grade a revealed card, and are ignored on a face-down one", () => {
  openCards();
  const before = $(".fc-front").textContent;
  key("3");
  assert($(".fc-front").textContent === before, "a face-down card was graded by a stray keypress");
  key(" ");
  key("3");
  assert($(".fc-front").textContent !== before, "1–4 did not grade the revealed card");
});

step("→ reveals, then grades Good; ← hides the answer again", () => {
  openCards();
  const card = $(".fc-card");
  key("ArrowRight");
  assert(card.classList.contains("flipped"), "→ did not reveal the answer");
  key("ArrowLeft");
  assert(!card.classList.contains("flipped"), "← did not hide the answer");
  key("ArrowRight");
  const before = $(".fc-front").textContent;
  key("ArrowRight");
  assert($(".fc-front").textContent !== before, "→ on a revealed card did not advance");
});

step("the keys are printed under the card, not buried in a help page", () => {
  openCards();
  const hint = $(".fc-keys");
  assert(hint, "no keyboard legend");
  assert(/Space/.test(hint.textContent) && /flip/.test(hint.textContent), "the legend does not name the flip key");
  const rate = $(".fc-r .fc-r-key");
  assert(rate && rate.textContent === "1", "the grading buttons do not carry their number key");
  assert($(".fc-r").getAttribute("aria-keyshortcuts") === "1", "the shortcut is not exposed to assistive tech");
});

step("the engine never steals a key from a text field", () => {
  openCards();
  const card = $(".fc-card");
  const ta = document.createElement("textarea");
  $(".fc-wrap").appendChild(ta);
  ta.dispatchEvent(new window.KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
  assert(!card.classList.contains("flipped"), "Space in a textarea flipped the card");
  ta.remove();
});

step("the listener removes itself once its panel is gone", () => {
  openCards();
  const dead = $(".fc-card");
  /* leaving the tab replaces panel.innerHTML wholesale — there is no
     teardown callback, so the listener has to notice it has been orphaned */
  click($$(".study-tabs-topic .study-tab").find(b => b.dataset.tab === "spec"));
  key(" ");
  assert(!dead.classList.contains("flipped"), "an orphaned card still answers the keyboard");
  assert(!document.contains(dead), "the old card is somehow still in the document");
});

step("1–9 answer the first quiz question still open", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  click($$(".study-tabs-topic .study-tab").find(b => b.dataset.tab === "quiz"));
  const cards = $$(".qz-card");
  assert(cards.length > 1, "expected several quiz questions, got " + cards.length);
  assert(cards[0].querySelector(".qz-opt .qz-opt-key").textContent === "1",
    "the options do not carry their number key");
  key("1");
  assert(cards[0].querySelector(".qz-why"), "the first question was not answered");
  assert(!cards[1].querySelector(".qz-why"), "a second question was answered by one keypress");
  key("1");
  assert(cards[1].querySelector(".qz-why"), "the key did not move on to the next open question");
  assert(cards[0].querySelectorAll(".qz-why").length === 1, "an answered question was answered twice");
});

/* ============ F · targets and labels ============ */
console.log("== F · targets and labels ==");

step("the four progress checks are a usable size (REF-5)", () => {
  const m = /\.ctl-row input\[type=checkbox\][^{]*\{([^}]*)\}/.exec(css);
  assert(m, "the progress-check rule is gone");
  const w = /width:\s*(\d+)px/.exec(m[1]);
  assert(w && Number(w[1]) >= 20, "the progress checks are still " + (w ? w[1] : "?") + "px");
});

step("confidence says what it means (REF-7)", () => {
  KOS.show("ref", { subject: SID, ref: REF });
  const picks = $$(".rag-picker .rag-pick");
  assert(picks.length === 3, "expected three confidence controls, got " + picks.length);
  const words = picks.map(p => p.querySelector(".rag-pick-l").textContent);
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

step("the rating sub-labels are legible (REF-10)", () => {
  const m = /\.fc-r-hint\s*\{([^}]*)\}/.exec(css);
  assert(m, "the rating sub-label rule is gone");
  const size = /font-size:\s*([\d.]+)px/.exec(m[1]);
  assert(size && Number(size[1]) >= 11, "the sub-labels are still " + (size ? size[1] : "?") + "px");
});

/* Exactly one way in at every tier: the 32px rail while the spine is a
   column, the page-header button while it is an overlay drawer, and never
   both. `.btn` is declared after the hide rule, so the hide has to out-weigh
   it — writing it as a bare class silently handed the display back and put
   two openers on a 1440 page. */
step("only one spine opener is reachable at a time", () => {
  assert(/button\.tree-open-btn \{ display: none/.test(css),
    "the opener's hide rule does not out-weigh .btn");
  const tier = css.slice(css.indexOf("@media (max-width: 860px)"));
  assert(/#cols\.tree-closed button\.tree-open-btn \{ display: inline-flex/.test(tier),
    "the opener never switches on for the overlay tiers");
  KOS.show("ref", { subject: SID, ref: REF });
  assert($$("#main .tree-open-btn").length === 1, "the topic page renders more than one opener");
  KOS.show("subject", SID);
  assert($$("#main .tree-open-btn").length === 1, "the subject desk renders more than one opener");
});

step("the floating spec-spine pill is retired, not merely re-widthed (SUBJ-4)", () => {
  /* Phase B fixed the pill's text wrap; the pill itself stayed fixed over
     the page, printing on whatever paragraph was under it. A right-edge
     pixel probe cannot see that, which is why it survived a whole phase. */
  const phone = css.slice(css.lastIndexOf("@media (max-width: 700px)"));
  assert(!/#cols\.tree-closed #tree > \.tree-reopen/.test(phone),
    "the floating pill is still rendered on phones");
  assert(/#cols\.tree-closed #tree \{ display: none/.test(css),
    "the closed spine still occupies the overlay tiers");
});

step("the desk's own analytics footnote collapses (SUBJ-6)", () => {
  KOS.show("subject", SID);
  const foot = $(".sa-foot");
  assert(foot && foot.tagName === "DETAILS", "the dense explanatory paragraph is back as body text");
  assert(!foot.open, "the definition is open by default");
  assert(/Deep revision content/.test(foot.querySelector(".sa-foot-fact").textContent),
    "the line that carries information every time was hidden with the definition");
});

step("a long deadline title wraps instead of losing 286px of itself (SUBJ-5)", () => {
  const m = /\.dl-title\s*\{([^}]*)\}/.exec(css);
  assert(m, "the deadline title rule is gone");
  assert(!/white-space:\s*nowrap/.test(m[1]), "the title is still a single nowrap line");
  assert(/line-clamp:\s*2/.test(m[1]), "the title has no two-line clamp");
});

step("the source keeps the retired ledger out of the desk", () => {
  assert(!/class: "sec-grid"/.test(hubSrc), "the section ledger is being rendered again");
  assert(!/class: "sec-card /.test(hubSrc), "a duplicate section row is being rendered again");
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
console.log("\nSMOKE43 PASS — Category 7 Phase C Study redesign verified (" + pass + " steps).");
process.exit(0);
