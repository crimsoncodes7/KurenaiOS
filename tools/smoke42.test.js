/* Kurenai OS — smoke42.test.js
   Category 7 Phase B: the shared breakpoint system and the UI primitives.

   Covered here:

   1.  The FIVE breakpoints. Only 1240/1080/860/700/560 may appear as a
       max-width anywhere in css/main.css, and no component may write a
       narrower tier ABOVE a wider one for the same declaration — that
       ordering bug is what made half the Governor seat's phone rules and
       24 assistant declarations dead on arrival.
   2.  The Dialog primitive: role, aria-modal, an accessible name taken from
       the visible heading, focus trap, body scroll lock, focus restoration,
       Escape — and the destructive-confirmation safety rules (Cancel takes
       focus, Enter does not confirm).
   3.  The source contract that keeps it true: no modal overlay may enter
       the document by any route other than KOS.ui.openDialog.
   4.  The Tabs primitive and its three variants, with the subnav, the
       workspace switchers and the Books lens cards all resolving to it.
   5.  EmptyState, StatTile (zero suppression), the scroll-affordance
       contract, locale number formatting, and the cover loading state.
   6.  The skip link.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke42.test.js                                            */
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
window.confirm = () => true;
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
  json: () => Promise.resolve({}), text: () => Promise.resolve("") });
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.IntersectionObserver = function () {
  return { observe: noop, unobserve: noop, disconnect: noop };
};

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const css = fs.readFileSync(path.join(ROOT, "css", "main.css"), "utf8");
const el = KOS.ui.el;

/* ============ 1 · the five breakpoints ============ */
console.log("== the shared breakpoint system ==");

const TIERS = [1240, 1080, 860, 700, 560];

/* every @media block in the stylesheet, with its width (or null) and the
   selector/property pairs it declares — the same parse the consolidation
   was driven from */
function mediaBlocks() {
  const lines = css.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^@media\s+(.+?)\s*\{/);
    if (!m) continue;
    let depth = 0, j = i;
    for (; j < lines.length; j++) {
      for (const ch of lines[j]) { if (ch === "{") depth++; else if (ch === "}") depth--; }
      if (depth === 0) break;
    }
    const mw = m[1].match(/max-width:\s*(\d+)px/);
    const inner = lines.slice(i, j + 1).join("\n");
    out.push({
      line: i + 1, cond: m[1], w: mw ? +mw[1] : null,
      rules: [...inner.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map(r => ({
        sels: r[1].trim().replace(/\s+/g, " ").split(",").map(s => s.trim()).filter(Boolean),
        props: [...r[2].matchAll(/([-a-z]+)\s*:/g)].map(p => p[1])
      }))
    });
    i = j;
  }
  return out;
}
const BLOCKS = mediaBlocks();

step("every max-width query is one of the five sanctioned tiers", () => {
  const widths = [...new Set(BLOCKS.filter(b => b.w).map(b => b.w))].sort((a, b) => b - a);
  assert(widths.length, "no width media queries found — did the parse break?");
  const stray = widths.filter(w => TIERS.indexOf(w) === -1);
  assert(!stray.length,
    "unsanctioned breakpoint(s) " + stray.join(", ") + "px. The five tiers are "
    + TIERS.join(" / ") + " — a component that needs its own collapse point should "
    + "reflow intrinsically (auto-fit/minmax, flex-wrap, min-width:0) instead.");
  assert(widths.length === TIERS.length,
    "expected all five tiers in use, found " + widths.join(", "));
});

step("no min-width or width-range query reintroduces a sixth point", () => {
  const ranged = BLOCKS.filter(b => /min-width:\s*\d+px/.test(b.cond));
  assert(!ranged.length,
    "width-range media queries are back at line(s) " + ranged.map(b => b.line).join(", ")
    + " — a band between two bespoke widths is a breakpoint by another name.");
});

step("the token block documents the tiers it enforces", () => {
  TIERS.forEach(w => assert(new RegExp("\\b" + w + "\\b[\\s\\S]{0,40}(workspace|compact rail|compact|phone|small)").test(css),
    "the token comment does not describe the " + w + "px tier"));
});

step("no component writes a narrower tier above a wider one", () => {
  const bad = [];
  for (let a = 0; a < BLOCKS.length; a++) {
    for (let b = a + 1; b < BLOCKS.length; b++) {
      const A = BLOCKS[a], B = BLOCKS[b];
      if (!A.w || !B.w || !(A.w < B.w)) continue;   /* A narrower AND earlier */
      for (const ra of A.rules) for (const rb of B.rules) {
        const sel = rb.sels.filter(s => ra.sels.indexOf(s) !== -1);
        if (!sel.length) continue;
        const props = ra.props.filter(p => rb.props.indexOf(p) !== -1);
        if (!props.length) continue;
        bad.push(`L${A.line}(≤${A.w}) before L${B.line}(≤${B.w}) — ${sel[0]} { ${props[0]} }`);
      }
    }
  }
  assert(!bad.length,
    bad.length + " tier ordering inversion(s); the narrower rule loses to its own wider "
    + "sibling and never applies:\n      " + bad.slice(0, 6).join("\n      "));
});

step("the phone tier still re-homes the shell for touch", () => {
  /* Build 4b's contract survives the consolidation (invariant #40) */
  const phone = css.match(/@media \(max-width: 700px\) \{[\s\S]*?\n\}/g) || [];
  assert(phone.some(b => /#rail \{[\s\S]*position: fixed/.test(b)), "the bottom tab bar is gone");
  assert(phone.some(b => /padding-block-end|padding-bottom/.test(b) && /safe-area-inset-bottom/.test(b)),
    "#main no longer reserves room for the tab bar");
  assert(phone.some(b => /input, select, textarea \{ font-size: 16px/.test(b)),
    "the iOS focus-zoom guard is gone");
});

/* ============ 2 · the Dialog primitive ============ */
console.log("== the Dialog primitive ==");

function openTestDialog(opts) {
  const overlay = el("div", { class: "modal-ov" });
  const box = el("div", { class: "modal" }, [
    el("div", { class: "modal-h" }, [el("b", { text: (opts && opts.title) || "Test dialog" })]),
    el("input", { type: "text", class: "first-field" }),
    el("button", { class: "btn", text: "Cancel" }),
    el("button", { class: "btn danger", text: "Delete" })
  ]);
  overlay.appendChild(box);
  return KOS.ui.openDialog(overlay, opts);
}

step("a dialog is a real dialog: role, aria-modal and an accessible name", () => {
  const ov = openTestDialog({ title: "Edit the record" });
  const box = ov.querySelector(".modal");
  assert(box.getAttribute("role") === "dialog", "role is " + box.getAttribute("role"));
  assert(box.getAttribute("aria-modal") === "true", "aria-modal missing");
  const id = box.getAttribute("aria-labelledby");
  assert(id, "the dialog has no accessible name");
  assert(document.getElementById(id).textContent === "Edit the record",
    "the name is not the visible heading");
  ov.remove();
});

step("opening a dialog locks the page behind it and closing releases it", () => {
  assert(!document.body.classList.contains("modal-open"), "the lock leaked from an earlier step");
  const ov = openTestDialog();
  assert(document.body.classList.contains("modal-open"), "the page behind is still scrollable");
  ov.remove();
  assert(!document.body.classList.contains("modal-open"), "the lock survived the close");
  assert(/body\.modal-open[^{]*\{[^}]*overflow: hidden/.test(css),
    "modal-open has no scroll-lock rule in the stylesheet");
});

step("nested dialogs hold the lock until the last one closes", () => {
  const a = openTestDialog({ title: "Outer" });
  const b = openTestDialog({ title: "Inner" });
  b.remove();
  assert(document.body.classList.contains("modal-open"),
    "closing the inner dialog released the lock while the outer one is still open");
  a.remove();
  assert(!document.body.classList.contains("modal-open"), "the lock survived both closes");
});

step("focus moves into the dialog and never onto the destructive button", () => {
  const ov = openTestDialog();
  const box = ov.querySelector(".modal");
  assert(box.contains(document.activeElement), "focus stayed outside the dialog");
  assert(!document.activeElement.classList.contains("danger"),
    "the dialog opened with the destructive button focused (audit U-04)");
  ov.remove();
});

step("Tab wraps inside the dialog instead of escaping to the page behind", () => {
  const ov = openTestDialog();
  const box = ov.querySelector(".modal");
  const controls = [...box.querySelectorAll("input, button")];
  controls[controls.length - 1].focus();
  const fwd = new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
  document.activeElement.dispatchEvent(fwd);
  assert(fwd.defaultPrevented, "Tab from the last control was not intercepted");
  assert(document.activeElement === controls[0], "Tab did not wrap to the first control");
  const back = new window.KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
  document.activeElement.dispatchEvent(back);
  assert(document.activeElement === controls[controls.length - 1],
    "Shift+Tab did not wrap to the last control");
  ov.remove();
});

step("closing a dialog returns focus to whatever opened it", () => {
  const trigger = el("button", { class: "btn", text: "Open" });
  document.body.appendChild(trigger);
  trigger.focus();
  const ov = openTestDialog();
  assert(document.activeElement !== trigger, "focus never entered the dialog");
  ov.remove();
  assert(document.activeElement === trigger, "focus was not restored to the trigger");
  trigger.remove();
});

step("Escape closes a dialog", () => {
  const ov = openTestDialog();
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert(!document.body.contains(ov), "Escape did not close the dialog");
});

step("teardown runs even when the overlay is removed by its parent", () => {
  const ov = openTestDialog();
  assert(document.body.classList.contains("modal-open"), "not locked");
  ov.parentNode.removeChild(ov);
  return tick(20).then(() => {
    assert(!document.body.classList.contains("modal-open"),
      "removeChild bypassed teardown and left the page locked");
  });
});

/* ---- destructive confirmation ---- */
step("a danger confirmation focuses Cancel and Enter does not confirm", () => {
  window.__kosAutoConfirm = false;
  let yes = 0, no = 0;
  KOS.ui.confirm({ title: "Delete this record?", danger: true }, () => yes++, () => no++);
  const box = document.querySelector(".confirm-modal");
  assert(box, "the confirmation did not open");
  assert(box.getAttribute("role") === "alertdialog", "a destructive prompt should be an alertdialog");
  assert(document.activeElement.textContent === "Cancel",
    "focus is on '" + document.activeElement.textContent + "', not Cancel (audit G-11)");
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert(yes === 0, "Enter confirmed a destructive dialog — two keystrokes deleted data");
  assert(document.querySelector(".confirm-modal"), "Enter closed the dialog anyway");
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert(no === 1 && yes === 0, "Escape did not cancel cleanly (yes=" + yes + " no=" + no + ")");
});

step("a safe confirmation still takes Enter", () => {
  let yes = 0;
  KOS.ui.confirm({ title: "Apply the change?" }, () => yes++, noop);
  assert(!document.activeElement.classList.contains("danger"), "unexpected danger button");
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert(yes === 1, "Enter no longer confirms a non-destructive dialog");
  window.__kosAutoConfirm = true;
});

step("the confirm callbacks fire exactly once however the dialog closes", () => {
  window.__kosAutoConfirm = false;
  let no = 0;
  KOS.ui.confirm({ title: "Discard?", danger: true }, noop, () => no++);
  /* Escape is handled by the primitive AND, historically, by each modal's
     own document listener — the capture-phase stopPropagation is what keeps
     one keypress from running a close path twice */
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert(no === 1, "the cancel callback ran " + no + " times for one Escape");
  window.__kosAutoConfirm = true;
});

/* ---- the source contract ---- */
step("no modal enters the document except through openDialog", () => {
  const offenders = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) { if (f !== "vendor") walk(p); continue; }
      if (!f.endsWith(".js")) continue;
      const src = fs.readFileSync(p, "utf8");
      const rel = path.relative(ROOT, p);
      src.split("\n").forEach((line, i) => {
        if (/document\.body\.appendChild\(\s*(overlay|ov|modal|box|noteOverlay)\s*\)/.test(line)
            && rel !== "js/core/ui.js") {
          offenders.push(rel + ":" + (i + 1));
        }
      });
    }
  })(path.join(ROOT, "js"));
  assert(!offenders.length,
    "modal overlay(s) appended directly, bypassing focus management: " + offenders.join(", "));
});

step("every modal overlay in the app routes through the primitive", () => {
  let sites = 0;
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) { if (f !== "vendor") walk(p); continue; }
      if (!f.endsWith(".js")) continue;
      sites += (fs.readFileSync(p, "utf8").match(/KOS\.ui\.openDialog\(/g) || []).length;
    }
  })(path.join(ROOT, "js"));
  /* 33 overlays were migrated in Phase B; the floor guards against a
     wholesale revert, not against adding or removing one modal */
  assert(sites >= 25, "only " + sites + " openDialog call sites — the migration has regressed");
});

/* ============ 3 · the Tabs primitive ============ */
console.log("== the Tabs primitive ==");

step("the primitive offers exactly the three documented variants", () => {
  const mk = v => KOS.ui.tabs([{ label: "One", active: true, onSelect: noop },
    { label: "Two", onSelect: noop }], { variant: v, label: "Test" });
  assert(mk("primary").querySelectorAll(".subnav-item").length === 2, "primary variant broken");
  assert(mk("workspace").querySelectorAll(".study-tab").length === 2, "workspace variant broken");
  assert(mk("card").querySelectorAll(".tab-card").length === 2, "card variant broken");
});

step("workspace tabs are a real tablist; the section strip is navigation", () => {
  const ws = KOS.ui.tabs([{ label: "A", active: true, onSelect: noop }], { variant: "workspace", label: "Pages" });
  assert(ws.getAttribute("role") === "tablist", "workspace tabs are not a tablist");
  assert(ws.querySelector(".study-tab").getAttribute("aria-selected") === "true", "aria-selected missing");
  const nav = KOS.ui.tabs([{ label: "A", active: true, onSelect: noop }], { variant: "primary", label: "Section" });
  assert(nav.getAttribute("role") !== "tablist",
    "the section strip is site navigation, not a tablist — it must not claim tab semantics");
  assert(nav.querySelector(".subnav-item").getAttribute("aria-current") === "page",
    "the active section is not marked aria-current");
});

step("KOS.workspaceTabs is an adapter over the primitive, not a second one", () => {
  const node = KOS.workspaceTabs([["Review", "review"], ["Assignments", "assignments"]], "review", "Study pages");
  assert(node.classList.contains("study-tabs"), "the workspace class changed");
  assert(node.getAttribute("role") === "tablist", "not a tablist");
  const tabs = node.querySelectorAll(".study-tab");
  assert(tabs.length === 2 && tabs[0].classList.contains("active"), "active tab not marked");
  assert(tabs[0].textContent === "Review", "label lost");
});

step("the section subnav is built by the primitive and keeps its counter ids", () => {
  KOS.show("subject", "compsci");
  const nav = document.getElementById("subnav");
  assert(nav.querySelectorAll(".subnav-item").length >= 6, "the section strip is empty");
  assert(nav.querySelector("#pc-compsci"), "the per-subject counter slot is gone");
  assert(nav.querySelector(".subnav-item.active"), "no active section entry");
  assert(nav.querySelector(".subnav-sep"), "the strip's divider is gone");
});

step("the Books lens cards are the third variant, not a fourth idiom", () => {
  assert(/variant: "card"/.test(fs.readFileSync(path.join(ROOT, "js/modules/books.js"), "utf8")),
    "books.js no longer builds its lens switcher through KOS.ui.tabs");
  assert(!/^\.bk-tab \{/m.test(css),
    "the bespoke .bk-tab styling is back — it should resolve to .tab-card");
  assert(/\.tab-card \{/.test(css), "the shared card-tab styling is missing");
});

/* ============ 4 · the remaining primitives ============ */
console.log("== EmptyState · StatTile · scrollers · numbers ==");

step("the empty state has a compact form that does not reserve a card", () => {
  const full = KOS.ui.emptyState({ mark: "澄", title: "Queue clear", body: "Nothing is due." });
  assert(full.classList.contains("empty-state"), "wrong class");
  assert(full.querySelector(".empty-state-mark").textContent === "澄", "the mark is missing");
  const compact = KOS.ui.emptyState({ title: "No reminders", compact: true,
    action: el("button", { class: "btn", text: "Add" }) });
  assert(compact.classList.contains("compact"), "no compact modifier");
  assert(compact.querySelector(".empty-state-action .btn"), "the inline action is missing");
  assert(/\.empty-state\.compact[^{]*\{[^}]*min-height: 0/.test(css),
    "the compact form still reserves a card-sized box (audit U-20)");
});

step("the vault empty state routes through the shared one", () => {
  const node = KOS.medview.emptyState("Nothing here yet.", []);
  assert(node.classList.contains("med-empty"), "the vault class changed");
  assert(node.querySelector(".empty-state"), "the vault still builds its own empty state");
  assert(/Nothing here yet\./.test(node.textContent), "the message was lost");
});

step("a stat tile is a .stat-card and suppresses a zero that carries nothing", () => {
  const kept = KOS.ui.statTile({ label: "Cards due", value: 0, emptyText: "None" });
  assert(kept.classList.contains("stat-card"), "the primitive invented a fifth card surface");
  assert(kept.classList.contains("is-zero"), "a zero is not marked");
  assert(kept.querySelector(".v").textContent === "None", "emptyText ignored");
  assert(KOS.ui.statTile({ label: "IT", value: 0, suppressZero: true }) === null,
    "a zero-value split tile was rendered anyway (audit U-17)");
  assert(KOS.ui.statTile({ label: "IT", value: 3, suppressZero: true }),
    "suppressZero dropped a tile that carries information");
});

step("Review no longer shows six tiles all reading zero", () => {
  KOS.show("due");
  const cards = [...document.getElementById("main").querySelectorAll(".stat-strip .stat-card")];
  assert(cards.length >= 2, "the summary strip vanished entirely");
  const labels = cards.map(c => c.querySelector(".k").textContent);
  assert(labels.indexOf("Cards due") !== -1 && labels.indexOf("Overdue") !== -1,
    "the two figures the page is actually about are missing: " + labels.join(", "));
  const zeros = cards.filter(c => /^(0|None)$/.test(c.querySelector(".v").textContent));
  assert(zeros.length <= 2,
    zeros.length + " zero tiles on an empty account — the per-subject splits should suppress");
});

step("a horizontal scroller declares itself and is reachable by keyboard", () => {
  const track = el("div", {}, [el("span", { text: "one" }), el("span", { text: "two" })]);
  const wrap = KOS.ui.scroller(track, { label: "Currently consuming" });
  assert(wrap.getAttribute("data-scroller") === "true",
    "the scroller is not declared — tools/responsive_audit.mjs counts an undeclared "
    + "sideways scroll as unreachable content, and it is right to");
  assert(wrap.querySelectorAll(".u-scroller-arrow").length === 2, "no arrow controls");
  assert(track.getAttribute("tabindex") === "0", "the track cannot be focused");
  assert(track.getAttribute("aria-label") === "Currently consuming", "the scroller is unlabelled");
  assert(/\.u-scroller::(before|after)/.test(css), "no edge fades");
  assert(/\.u-scroller\.at-start::before/.test(css),
    "the fades do not react to scroll position, so they lie at the ends");
});

step("the two deliberate scrollers in the app use it", () => {
  const matrix = fs.readFileSync(path.join(ROOT, "js/modules/matrix.js"), "utf8");
  const hub = fs.readFileSync(path.join(ROOT, "js/modules/hub.js"), "utf8");
  assert(/KOS\.ui\.scroller\(strip/.test(matrix), "the Collection cover strip has no affordance (audit MTX-1)");
  assert(/KOS\.ui\.scroller\(uwrap/.test(hub), "the subject unit band has no affordance (audit SUBJ-3)");
});

step("large numbers are locale-formatted", () => {
  assert(KOS.ui.num(12476) === (12476).toLocaleString(undefined, { maximumFractionDigits: 0 }),
    "num() did not format: " + KOS.ui.num(12476));
  assert(KOS.ui.num(0) === "0", "zero formatted oddly: " + KOS.ui.num(0));
  const gov = fs.readFileSync(path.join(ROOT, "js/core/governor.js"), "utf8");
  assert(/hud-gold", text: "◈ " \+ KOS\.ui\.num\(/.test(gov),
    "the HUD still prints a raw integer balance (audit U-27)");
});

step("covers show the module mark while loading, not an empty box", () => {
  const box = KOS.medview.cover({ coverUrl: "https://example.invalid/x.jpg", coverCrop: null }, "書");
  const ph = box.querySelector(".med-cover-ph");
  assert(ph, "no placeholder at first paint — a lazy grid opens as empty boxes (audit G-24)");
  assert(ph.classList.contains("behind"), "the placeholder is not layered behind the image");
  assert(box.querySelector("img.is-loading"), "the image is not held transparent while it loads");
  assert(/\.med-cover \{[^}]*position: relative/.test(css),
    ".med-cover is not positioned, so the placeholder cannot sit behind the image");
});

/* ============ 5 · the skip link ============ */
step("a visible-on-focus skip link reaches the content", () => {
  const link = document.querySelector(".skip-link");
  assert(link, "no skip link (audit G-12/U-05)");
  assert(link.getAttribute("href") === "#main", "the skip link does not target #main");
  const target = document.getElementById("main");
  assert(target && target.getAttribute("tabindex") === "-1",
    "#main is not programmatically focusable, so the skip link goes nowhere");
  assert(/\.skip-link:focus/.test(css), "the skip link never becomes visible");
  assert(/\.skip-link \{[\s\S]*?transform: translateY\(-/.test(css),
    "the skip link is not hidden off-screen when unfocused");
});

step("the toast layer sits above every modal", () => {
  assert(/--z-modal:\s*\d+/.test(css) && /--z-toast:\s*\d+/.test(css),
    "the layer scale is missing — 'which is on top' is a grep again");
  const modal = +css.match(/--z-modal:\s*(\d+)/)[1];
  const toast = +css.match(/--z-toast:\s*(\d+)/)[1];
  assert(toast > modal, "the toast layer (" + toast + ") is not above modals (" + modal + ")");
  assert(/\.toast \{[\s\S]*?z-index: var\(--z-toast\)/.test(css),
    "the toast does not use the layer scale (audit B-10/G-26)");
});

/* ============ run ============ */
(async () => {
  let pass = 0;
  const fails = [];
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (e) { fails.push(`STEP "${name}": ${e.message}`); console.log("  FAIL " + name + " — " + e.message); }
  }
  if (errors.length) fails.push(...errors);
  console.log("");
  if (fails.length) {
    console.log("SMOKE42 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE42 PASS — Category 7 Phase B breakpoints and primitives verified (" + pass + " steps).");
  process.exit(0);
})();
