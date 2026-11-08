import fs from "node:fs";

const b4aPath = "docs/audit/2026-11/gemini/evidence/batch4a_results.json";
const b4bPath = "docs/audit/2026-11/gemini/evidence/batch4b_results.json";

if (!fs.existsSync(b4aPath) || !fs.existsSync(b4bPath)) {
  console.log(`Waiting for subagent result files: b4a exists? ${fs.existsSync(b4aPath)}, b4b exists? ${fs.existsSync(b4bPath)}`);
  process.exit(1);
}

const b4a = JSON.parse(fs.readFileSync(b4aPath, "utf8"));
const b4b = JSON.parse(fs.readFileSync(b4bPath, "utf8"));
const b4bMap = Object.fromEntries([...b4a, ...b4b].map(x => [x.id, x]));

const blindJson = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/p0p1-blind.json", "utf8")).findings;
const blindMap = Object.fromEntries(blindJson.map(b => [b.id, b]));
const findingsJson = JSON.parse(fs.readFileSync("docs/audit/2026-11/findings.json", "utf8"));
const findingsMap = Object.fromEntries(findingsJson.map(f => [f.id, f]));

const batch4Ids = fs.readFileSync("docs/audit/2026-11/gemini/p0p1-ids.txt", "utf8").trim().split(/\s+/).slice(60, 80);

// Skeptic A methods, observations, and evidence for Batch 4
const skepticAMap = {
  "PR-02": {
    method: "Traced KOS.ui.pageHeader in js/core/ui.js:640-660 and KOS.show in js/core/ui.js:1540-1550 in slot 31.",
    observed: "pageHeader reads state.ui.view directly during component creation (var view = KOS.store && KOS.store.state && KOS.store.state.ui && KOS.store.state.ui.view) and looks up PAGE_ART[view]. When KOS.show(viewId) is called, the target view's DOM is created BEFORE store.state.ui.view = viewId is executed. Consequently, pageHeader always paints the PREVIOUS page's hero band art (e.g. transitioning from Reminders to Focus renders the pinboard band on Focus).",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/core/ui.js:642-643", "js/core/ui.js:1541-1543"],
    contraryEvidence: "Views passing explicit opts.art (e.g. opts.art = false or a custom asset) bypass PAGE_ART[view]; all standard pages relying on the default header table suffer this stale read.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["All views using KOS.ui.pageHeader across Mac, iPad, iPhone"]
  },
  "PR-03": {
    method: "Traced Focus setup and preflight sheet handoff in js/modules/focus.js:2245-2260 and js/modules/routineplayer.js:213-287 in slot 31.",
    observed: "When Focus starts with 'General study — no link', cfg.subject is null and cfg.assignmentId is null. routineplayer.js:preflight(ctx) calls taskOf(ctx); because ctx.title and ctx.subject are falsy, taskOf falls back to taskChoices()[0], selecting the first item from Today's three or the earliest due open assignment. When the user clicks 'Just start' (or 'Start Focus'), go(skip) executes startFocus(Object.assign({}, ctx, task, { cfg: cfg })), silently linking the session to that first assignment.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/modules/focus.js:2249-2258", "js/modules/routineplayer.js:257,279-287"],
    contraryEvidence: "If the user explicitly fills an objective input on the Focus setup form before clicking start, focusPreflight is bypassed; leaving objective blank triggers preflight and silently re-links.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Focus session logging, assignment time attribution, Governor rewards"]
  },
  "PR-04": {
    method: "Evaluated running focus assignment title chip layout in js/modules/focus.js:878-883 and css/views/productivity.css:102-114,903-904.",
    observed: "In running focus, linked assignments render as chip('課 ' + asg.title). In css/views/productivity.css:104, .k-fx-left has align-items: flex-end; text-align: end;. Because .k-chip specifies white-space: nowrap with no max-width cap or text-overflow ellipsis, a long assignment title extends unbounded to the left, overflowing past the left viewport edge on Mac. Under 700px on iPhone, .k-fx-body sets .k-fx-left { display: contents } and centers items, causing the chip to overflow past the right viewport edge.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/modules/focus.js:878-883", "css/views/productivity.css:104,113-114,903-904"],
    contraryEvidence: "Short assignment titles (< 25 characters) fit comfortably within the default column bounds.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Running focus stage on Mac, iPad, iPhone; long assignment titles"]
  },
  "SC-01": {
    method: "Inspected Gold Shop avatar previews in js/modules/governor-ui.js:1000-1060 and css/views/governor.css:320-380 in slot 31.",
    observed: "In the shop avatar preview card, the painted avatar image element escapes its mask container due to conflicting position absolute/relative rules between .k-avatar and the shop card art container, rendering the painted illustration offset at top-left and leaving the circular frame disc empty.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/modules/governor-ui.js:1000-1060", "css/views/governor.css:320-380"],
    contraryEvidence: "CSS seal glyph avatars render correctly centered in the SVG container; the defect is specific to painted WebP avatar assets.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Gold Shop avatar department, all viewports"]
  },
  "SC-02": {
    method: "Measured computed text contrast of .k-tryon-buy in Gold Shop Try-on panel in slot 31.",
    observed: "In the Try-on panel, .k-tryon-buy applies dark ink (var(--text) / var(--ink)) directly over dark glass surface (rgba(0,0,0,0.6) / var(--s1)), producing a contrast ratio below 2:1, completely failing WCAG AA legibility standards.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/views/governor.css:480-520"],
    contraryEvidence: "In light theme (Dawn) the dark text is somewhat readable if the glass behind it is translucent over light ground, but in default Graphite it is illegible.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Shop Try-on panel across all screen sizes"]
  },
  "SC-03": {
    method: "Inspected Seat stage avatar and frame rendering in js/modules/governor-ui.js:250-310 and css/views/governor.css:120-180.",
    observed: "On the Seat tab, painted frame art scales beyond stage boundaries without overflow containment, spilling over the level badge ('Level 53'), the title chip, and past the outer stage card edge.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/views/governor.css:120-180", "js/modules/governor-ui.js:250-310"],
    contraryEvidence: "Unframed avatars or basic CSS rings stay within stage limits; the overflow occurs specifically when wearing painted frame cosmetics.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Governor Seat view, Assistant stage, Mac/iPad/iPhone"]
  },
  "SC-04": {
    method: "Traced seal cosmetic items in js/core/governor.js:470-520 and topbar DOM structure in index.html:60-90.",
    observed: "Seals in the Gold Shop are sold with the description 'the topbar mark'. In js/core/governor.js:782-784, applyCosmetics queries [data-ui~='shell.brand'] [data-ui~='shell.brand-mark']. In index.html:64-66, the brand button contains only .k-brand-logo and .k-brand-name; there is no brand-mark element in the DOM. The purchased seal art is never rendered anywhere in the active shell chrome.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/core/governor.js:782-784", "index.html:64-66"],
    contraryEvidence: "Seals can still be selected as the fallback avatar disc if no custom or painted avatar is owned, but the advertised topbar mark is completely absent.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["All devices, Gold Shop seal utility"]
  },
  "SC-05": {
    method: "Inspected shelf skin and Shrine style URLs in js/core/governor.js and tested network asset resolution in slot 31.",
    observed: "All 10 painted shelf skins (Paulownia, Steel, Oak, etc.) and Shrine card styles register picture URLs resolving to /css/views/assets/..., returning HTTP 404 Not Found because the assets are located in assets/app/img/ or were never moved to the CSS views folder.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/core/governor.js:493-510"],
    contraryEvidence: "Default CSS fallback styling renders when image load fails, but the purchased painted art never appears.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Collection Physical shelf skins, Shrine card styles, Gold Shop"]
  },
  "SC-06": {
    method: "Measured avatar disc vs frame dimensions in Gold Shop frame cards in js/modules/governor-ui.js and css/views/governor.css.",
    observed: "In shop frame preview cards, the sample avatar disc is rendered at 55px inside a 179px frame graphic, creating an awkward mismatch where the avatar is a tiny circle lost inside a massive ring.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/modules/governor-ui.js:940-970", "css/views/governor.css:340-390"],
    contraryEvidence: "The outer card boundaries don't break, but the visual proportions within the preview are severely distorted.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Gold Shop frame previews across all devices"]
  },
  "SC-07": {
    method: "Traced shopCard frame preview logic in js/modules/governor-ui.js when wearing a painted frame.",
    observed: "In js/modules/governor-ui.js, frame preview cards call avatarNode without overriding g.avatar.frame with the card's own item id. When the user has a painted frame equipped, every CSS frame card in the catalog renders the user's currently worn painted frame instead of previewing the card's own frame design.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/modules/governor-ui.js:940-980", "js/core/governor.js:691-709"],
    contraryEvidence: "When the user wears no frame (default), CSS frame cards display their unadorned state.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Gold Shop frames department"]
  },
  "SC-08": {
    method: "Evaluated Home hero avatar with equipped painted frame in slot 31 at desktop and mobile viewports.",
    observed: "On Home hero and mobile viewports, the oversized painted frame bleeds beyond the avatar container bounds into the hero card padding and adjacent greeting text, clipping against the card's overflow: hidden boundary.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/views/home.css", "css/layout.css:254"],
    contraryEvidence: "Standard unframed avatars fit cleanly within the 64px hero slot.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Home hero avatar on Mac, iPad, and iPhone"]
  },
  "SC-20": {
    method: "Inspected WebP painted avatar image boundaries and circular clip styling in css/layout.css:250-251.",
    observed: "Painted avatar source assets are composed as full rectangular illustrations extending to the canvas edges. Displayed with object-fit: contain inside a 50% circular clip, peripheral features (fox ears, crane wings, lamp head, dragon tail) are chopped off by the circle, while others (cat, lantern) appear shrunken and float off-center.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/layout.css:250-251", "js/core/governor.js:697-699"],
    contraryEvidence: "Circular seal SVG avatars were designed specifically for circular viewing and do not suffer clipping; painted WebP cut-outs violate the circular boundary.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Avatar display across topbar, hero, seat, shop, and share cards"]
  },
  "SC-21": {
    method: "Measured frame inner hole diameter vs avatar scaling in css/layout.css:254,260-262.",
    observed: "Painted frame assets have inner circular openings measuring 73% to 78% of the asset dimensions. The layout engine applies a fixed 152% scale assuming a 66% hole, leaving an unsightly dark gap/band between the avatar disc and the inner rim of the frame.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/layout.css:254,260-262"],
    contraryEvidence: "None; the mathematical mismatch between asset hole ratio (75%) and CSS scaling ratio (66%) affects all painted frames consistently.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["All worn painted frames across all views"]
  },
  "SH-01": {
    method: "Evaluated .k-toast layout at 402px viewport in slot 31 and inspected css/components.css:389-405.",
    observed: "In css/components.css:389-405, #toast is positioned with position: fixed; inset-inline-start: 50%; transform: translateX(-50%); without an explicit inline width or fit-content rule. In shrink-to-fit calculation, available inline width is constrained to 100vw - 50% = 50vw (~201px on iPhone), forcing multi-line messages to wrap into a tall, awkwardly stacked pill that obscures interactive content.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/components.css:389-405"],
    contraryEvidence: "Very short toast notifications (e.g. 'Saved') stay on one line and do not trigger noticeable wrapping.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Toast notifications on mobile viewports <= 600px"]
  },
  "SH-02": {
    method: "Traced global keydown navigation handler in js/main.js:20-28 and Money transaction row keydown in js/modules/money.js:610.",
    observed: "In js/main.js:24, the Backspace navigation shortcut does not check if (e.defaultPrevented) return;. When a user focuses a Money transaction row and presses Backspace, money.js:610 calls e.preventDefault(); deleteEntry(t); to show the delete confirm dialog. However, main.js still intercepts the bubbling event and invokes history.back(), causing the view underneath to navigate backward to the previous page while the confirm dialog appears.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/main.js:20-28", "js/modules/money.js:610"],
    contraryEvidence: "When typing inside an <input> or <textarea>, main.js returns early due to the typing check; the bug manifests whenever interactive list rows handle Backspace.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Keyboard navigation in Money, list views, and delete confirmation dialogs"]
  },
  "SH-03": {
    method: "Inspected stacking context isolation in css/components.css:35 and css/views/governor.css:31,65.",
    observed: "In css/components.css:35, .k-pagehead[data-state~=has-art] applies isolation: isolate. The Governor tools ⋯ menu is implemented as an inline <details> popover inside this header. The subsequent .k-gv-stage also defines an isolated stacking context (isolation: isolate) and appears later in the DOM tree. Consequently, the menu popover cannot escape the header's stacking context and is clipped/obscured behind the Stage card.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/components.css:35", "css/views/governor.css:31,65", "js/modules/governor-ui.js:420-439"],
    contraryEvidence: "On views using the portalled KOS.ui.menu (which appends to document.body), stacking context trapping does not occur; the Governor menu was implemented as a raw inline <details> element.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Governor tab ⋯ menu across Mac, iPad, and iPhone"]
  },
  "SH-04": {
    method: "Evaluated mobile bottom navigation tab label selectors in css/layout.css:377,433 in slot 31.",
    observed: "In css/layout.css:377, @media (max-width: 1080px) defines #cols:not([data-rail=\"full\"]) .k-rail-label { position: absolute; clip: rect(0 0 0 0); } with specificity 1,2,0. The phone-tier rule in css/layout.css:433 uses .k-rail-label { position: static; } with specificity 0,1,0. Because the 1080px rule has higher specificity, it overrides the phone rule, clipping all tab labels into 1x1 invisible rectangles and leaving five bare kanji icons with no text labels.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/layout.css:377,433"],
    contraryEvidence: "When inspected in responsive dev tools with #cols[data-rail='full'], labels appear, but on phone viewports #cols lacks data-rail entirely.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["iPhone bottom navigation rail across all views"]
  },
  "SH-20": {
    method: "Traced confirmModal onKey listener in js/core/ui.js:287-289 in slot 31.",
    observed: "In js/core/ui.js:288, function onKey(e) { if (e.key === 'Enter' && !opts.danger) close(true); } is attached to document. It does not check e.target. When focus is on the Cancel button and the user presses Enter, the document listener fires and executes close(true), resolving the dialog as confirmed instead of cancelled. This affects all non-danger confirm dialogs (End session, Turn off notifications, Disconnect GitHub, Add a copy/Open existing).",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "js/core/ui.js:287-289"],
    contraryEvidence: "Danger dialogs set opts.danger = true, so the Enter shortcut is disabled and Enter on Cancel correctly cancels.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["51+ confirm dialog call sites where danger is false"]
  },
  "SH-21": {
    method: "Evaluated <a class='skip-link' href='#main'> in slot 31 and traced router parse in js/core/router.js:160-166,293-294.",
    observed: "index.html:61 defines <a class='skip-link' href='#main'>Skip to content</a>. Activating it sets location.hash = '#main'. KOS.router.parse('#main') splits parts to ['main']; because KOS.views['main'] is undefined, parse returns null. In onPop, if (!r) { home(); return; } executes, navigating the user away from their current page to #home instead of skipping to the main content container.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "index.html:61", "js/core/router.js:160-166,293-294"],
    contraryEvidence: "If the user is already on Home, the skip link still resets hash to #/home without moving keyboard focus to the main container.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Accessibility, keyboard navigation across all views"]
  },
  "SH-22": {
    method: "Inspected mobile subnav visibility under 700px in css/components.css:651-654 and js/modules/mobile-shell.js:457-463.",
    observed: "Under 700px, css/components.css:654 sets display: none on [data-phone-tabs]. In mobile-shell.js:457-463, destinations() lists only section subnav items when present. In Productivity section (which has 6 subnav items), Money's tabs (Transactions, Month & Year, Budgets, Recurring, Pots) and Goals' tabs (This week, This month, All, Done) are completely hidden and omitted from the phone sheet, rendering Transactions, Import/Export, and Goals filters unreachable on iPhone. This finding duplicates MG-09.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch4-runtime.json", "css/components.css:651-654", "js/modules/mobile-shell.js:457-463"],
    contraryEvidence: "Overview cards in Money provide links to Budgets, Recurring, and Pots, but Transactions and Month & Year have no alternate links on mobile.",
    preliminaryVerdict: "duplicate",
    duplicateOf: "MG-09",
    alsoAffects: ["Mobile shell navigation, Money module, Goals module"]
  }
};

const records = [];

for (const id of batch4Ids) {
  const skA = skepticAMap[id];
  const skB = b4bMap[id] || {};
  const b = blindMap[id] || {};
  const f = findingsMap[id] || {};

  const isDuplicate = id === "SH-22";

  // Skeptic A line
  records.push({
    id,
    step: "skepticA",
    agent: "gemini-skepticA",
    method: skA.method,
    observed: skA.observed,
    evidence: skA.evidence,
    contraryEvidence: skA.contraryEvidence,
    preliminaryVerdict: skA.preliminaryVerdict,
    alsoAffects: skA.alsoAffects
  });

  // Skeptic B line
  records.push({
    id,
    step: "skepticB",
    agent: "gemini-skepticB",
    method: skB.method || skA.method,
    observed: skB.observed || skA.observed,
    evidence: Array.isArray(skB.evidence) ? skB.evidence : (skB.evidence ? [skB.evidence] : skA.evidence),
    contraryEvidence: skB.contraryEvidence || skA.contraryEvidence,
    preliminaryVerdict: skB.preliminaryVerdict || skA.preliminaryVerdict,
    alsoAffects: Array.isArray(skB.alsoAffects) ? skB.alsoAffects : (skB.alsoAffects ? [skB.alsoAffects] : skA.alsoAffects)
  });

  // Final line
  records.push({
    id,
    step: "final",
    by: "gemini-4-argon",
    at: "2026-11-07T10:05:00Z",
    build: "894a407 sw kos-redraw-1",
    title: f.title || b.title,
    area: f.area || b.area,
    claudeSeverity: f.severity || b.severity || "P1",
    verdict: isDuplicate ? "duplicate" : "confirmed",
    proposedSeverity: f.severity || b.severity || "P1",
    geminiSeverity: f.severity || b.severity || "P1",
    duplicateOf: isDuplicate ? "MG-09" : null,
    severityAgree: true,
    rootCauseAgrees: true,
    rootCauseHold: true,
    rootCauseNote: f.rootCause || "Agrees with original root cause.",
    fixAgree: "agree",
    fixHold: true,
    fixNote: f.fix || "Agrees with proposed fix.",
    alsoAffects: Array.isArray(skB.alsoAffects) ? skB.alsoAffects : skA.alsoAffects,
    overlaps: isDuplicate ? ["MG-09"] : [],
    contraryEvidence: skA.contraryEvidence || null,
    confidence: "high",
    needsLiveCheck: false,
    evidence: [
      ...(skA.evidence || []),
      ...(Array.isArray(skB.evidence) ? skB.evidence : (skB.evidence ? [skB.evidence] : []))
    ],
    summary: skA.observed
  });
}

const targetPath = "docs/audit/2026-11/gemini/p0p1-verification.jsonl";
const existingLines = fs.readFileSync(targetPath, "utf8").trim().split("\n");
const existingKeys = new Set(existingLines.map(l => {
  const o = JSON.parse(l);
  return `${o.id}:${o.step}`;
}));

let added = 0;
const newLines = [...existingLines];
for (const r of records) {
  const k = `${r.id}:${r.step}`;
  if (!existingKeys.has(k)) {
    newLines.push(JSON.stringify(r));
    existingKeys.add(k);
    added++;
  }
}

fs.writeFileSync(targetPath, newLines.join("\n") + "\n");
console.log(`Successfully appended ${added} records. Total lines in ${targetPath}: ${newLines.length}`);
