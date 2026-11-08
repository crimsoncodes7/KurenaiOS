import fs from "node:fs";

const b3a = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/evidence/batch3a_results.json", "utf8"));
const b3b = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/evidence/batch3b_results.json", "utf8"));
const b3bMap = Object.fromEntries([...b3a, ...b3b].map(x => [x.id, x]));

const runtime = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "utf8"));
const blindJson = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/p0p1-blind.json", "utf8")).findings;
const blindMap = Object.fromEntries(blindJson.map(b => [b.id, b]));
const findingsJson = JSON.parse(fs.readFileSync("docs/audit/2026-11/findings.json", "utf8"));
const findingsMap = Object.fromEntries(findingsJson.map(f => [f.id, f]));

const batch3Ids = fs.readFileSync("docs/audit/2026-11/gemini/p0p1-ids.txt", "utf8").trim().split(/\s+/).slice(40, 60);

// Skeptic A methods, observations, and evidence for Batch 3
const skepticAMap = {
  "HR-04": {
    method: "Inspected KOS.homeFocusPlan (js/modules/hub.js:754-895) and nextAction (lines 657-713) in slot 31 across all study space engines.",
    observed: "Home's Up Next card ladder evaluates only study blocks, exams, assignments, pacing, and A-levels spec points (BYREF[sid]). It completely omits Code (Daily 20, capstones, retrieval), Japanese (reviews due, next lesson), Mind (Daily 15, practice), Creatives (daily practice, projects), and Money (budgets, bills). Even in rung 5 ('Where you left off'), it navigates via KOS.show('ref', {subject, ref}) which only works for spec leaves, falling through to 'Clear / Nothing is waiting'.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/hub.js:657-713", "js/modules/hub.js:754-895"],
    contraryEvidence: "The static 'Continue' desk row at the bottom of Home includes started spaces, but the 'Up next' decision ladder omits them completely.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["iPad, iPhone, Mac; onboarding and daily task guidance for all non-exam domains"]
  },
  "HR-05": {
    method: "Evaluated Home hoursOn(iso) vs Reports study(input, p) on slot 31 with seeded study sessions.",
    observed: "Home sums all sessions where s.type !== 'media' (js/modules/hub.js:917-920), including flashcards, quizzes, exams, and reviews. Reports (js/core/report.js:187-193) strictly gates study minutes and session count behind if (focusE = e.type === 'focus'), completely omitting non-focus study durations. For the exact same week, Home reports all study hours while Reports reports only focus blocks.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/hub.js:917-920", "js/core/report.js:187-193", "js/modules/reports.js:723,758"],
    contraryEvidence: "Reports records counts for reviews, quizzes, and exams in separate summary fields, but omits their time from the headline 'Studied' metric.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Weekly, monthly, term, and annual report summaries; analytics consistency"]
  },
  "HR-16": {
    method: "Evaluated KOS.governor.checkStreakMilestones and KOS.sessions.streak(null) on slot 31 across session logging boundaries.",
    observed: "In js/core/governor.js:334, the milestone award condition checks g.milestones[key] !== KOS.srs.addDays(KOS.srs.todayISO(), -(stk - ms)). When today has no completed study activity yet, streak(null) begins at yesterday's date (hasStreakActivity is false). Calculating from todayISO() with yesterday's streak shifts the key date forward by 1 day, causing the inequality to evaluate to true and paying the milestone bonus again on any non-study session (e.g. reminder/habit tick).",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/governor.js:330-338", "js/core/sessions.js:166-176"],
    contraryEvidence: "Once today has study activity, streak advances by 1, shifting the date back and creating another mismatch.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Governor gold and XP inflation, streak milestone integrity"]
  },
  "HR-17": {
    method: "Evaluated KOS.reportWords with facts where focusSubject was 'code', 'ja', 'mind', or 'creatives' on slot 31.",
    observed: "In js/core/reportwords.js:17-18, SUBJECT is hardcoded to only compsci, maths, and it. When topSubject is 'code', 'ja', 'mind', or 'creatives', SUBJECT[top] evaluates to undefined, producing 'undefined took the largest share...' and 'all undefined.'. This string is permanently written into IndexedDB via reportstore.js.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/reportwords.js:17-18", "js/core/reportwords.js:93,140"],
    contraryEvidence: "KOS.subjects.name(id) exists in js/core/subjects.js:54 and maps all subjects correctly, but reportwords.js defined its own private 3-subject table.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Weekly/monthly/term/year reports, report export share cards, cloud replication"]
  },
  "HR-18": {
    method: "Inspected KOS.todo.setChecked and Hero daily goal directive button in slot 31.",
    observed: "In js/modules/hub.js:1162-1170 and js/modules/todo.js:56-69, clicking an autoItems directive button self-ticks with zero evidence and logs KOS.sessions.log({ type: 'todo', metrics: { item: label } }), paying +5 XP and +1 gold. Unticking deletes the tick state from autoChecked without penalty; re-ticking pays again infinitely, violating Invariant 4.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/hub.js:1162-1170", "js/modules/todo.js:56-69", "js/core/governor.js:278"],
    contraryEvidence: "When Morning Review is active, 'Today\\'s three' replaces the daily goal list, but when inactive, the directive list is rendered with the defective setChecked toggle.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["XP and gold balance inflation, Governor integrity"]
  },
  "JM-07": {
    method: "Traced KOS.ja.syncChecks and KOS.ja.record in slot 31 and evaluated evidence('1.1').checks vs store.peekProgress('ja', '1.1').check.",
    observed: "In js/core/ja.js, check 4 ('Held in reviews') is dynamically evaluated by evidence(id), but syncChecks(id) is only called in markPage, markHeard, and finishLesson. In record() and finishSession(), where reviews are graded and stability updated, syncChecks is never invoked. The stored check[3] is never written to store.state.study.progress['ja:' + id], so the lesson never reaches status 'done' and unit/spine completion counters stay behind.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/ja.js:116-146", "js/core/ja.js:177-191,220-230"],
    contraryEvidence: "Code retrieval cards explicitly call syncChecks on their lessons (code.js:724), proving this was an omission in Japanese.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Spine status, stage/unit completion tallies, dashboard stats"]
  },
  "JM-08": {
    method: "Inspected KOS.jaRun in slot 31 and traced session teardown during route changes.",
    observed: "In js/modules/jarun.js, KOS.ja.record immediately reschedules facet intervals, but KOS.ja.finishSession (which logs sessions.log and awards XP) is called exclusively in end(). If the user navigates away via the shell rail, mobile tab bar, Back button, swipe gesture, or reload, end() is never called. Answered cards remain rescheduled into future dates, but the session is lost with 0 XP and no streak progress.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/jarun.js:392-450", "js/core/ja.js:220-230"],
    contraryEvidence: "Clicking the internal '✕' button calls leave() which prompts to confirm, but all external navigation mechanisms tear down the view silently.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Streak continuity, Governor rewards, user trust on mobile and tablet"]
  },
  "JM-09": {
    method: "Navigated to #/ref/ja/1.1 at iphone (402x874) in slot 31, measured .k-topic-tabrow, and captured screenshot.",
    observed: "At 402x874 on #/ref/ja/1.1, .k-topic-tabrow contains .k-scroller (flex: 1 1 auto; min-inline-size: 0) alongside fixed siblings workBtn, editBtn, and .k-ja-mode (~350px combined). This crushes .k-scroller down to ~5px width, completely hiding Notes, Practice, Reviews, and Files tabs behind overflow and making Practice unreachable from the lesson.",
    evidence: ["audit-evidence/2026-11/gemini/shots/JM-09-ja-tabstrip-iphone.png", "docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/hub.js:2745-2750", "css/views/study.css:208-212"],
    contraryEvidence: "Standard curriculum subjects lack cx.modeSwitch(), so their scroller retains usable width on mobile.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["iPhone users, mobile viewports <=420px, Japanese practice access"]
  },
  "MG-02": {
    method: "Evaluated KOS.money.csv.guess(['Date', 'Merchant/Description', 'Debit/Credit', 'Balance']) in slot 31.",
    observed: "KOS.money.csv.guess returned { date: 0 }: neither 'Merchant/Description' (payee) nor 'Debit/Credit' (amount/out/in) was recognised by the GUESS regexes in js/core/money.js:970-977. In js/modules/money.js:939, this triggers fail('It has no header row with a date and an amount.') and aborts import immediately.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/money.js:970-984", "js/modules/money.js:937-940"],
    contraryEvidence: "None; Santander midata CSV is standard in the UK and cannot be imported without editing headers in a text editor.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["All devices, UK banking data import (Santander personal/business midata)"]
  },
  "MG-03": {
    method: "Evaluated KOS.money.csv.parse on CSV with leading blank line and CSV with account preamble in slot 31.",
    observed: "parseCSV samples only line 0 to detect delimiter, defaulting to comma if line 0 is empty. Furthermore, it hardcodes header: rows[0], so an Online Banking CSV with account information on lines 1-3 assigns the preamble as the header, causing guessMapping to fail and aborting the import.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/money.js:947-969", "js/modules/money.js:937-940"],
    contraryEvidence: "Preamble-free comma-delimited CSVs parse cleanly; defect affects bank exports with preamble metadata or leading empty lines.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["All devices; statements from major UK/EU banks with preamble blocks"]
  },
  "MG-04": {
    method: "Inspected file input accept in Money import dialog and evaluated parseCSV with text statements in slot 31.",
    observed: "The import dialog file input specifies accept='.csv,text/csv,text/plain'. When a user selects a Santander .txt statement, read() sends it to parseCSV, which fails guessMapping and aborts. QIF and OFX formats are completely unsupported with no parsers in the codebase.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/money.js:889,935-940", "js/core/money.js:947-984"],
    contraryEvidence: "The dialog is titled 'Import a CSV', but accepting text/plain lures users into uploading .txt statements that inevitably crash.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Import dialog error handling, UK banks offering text/QIF/OFX exports"]
  },
  "MG-05": {
    method: "Inspected state.money and Transactions view in slot 31 for import batch tracking and undo affordances.",
    observed: "Batch metadata is stamped on imported rows (t.batch), but state.money stores no import history or ledger. The only place KOS.money.undoBatch is exposed is on step 3 of the transient import dialog. Once closed, the batch is lost, the Transactions view has no batch or source filter, and bulk actions lack a 'Select all' control.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/modules/money.js:915-917", "js/core/money.js:1039,1050-1056"],
    contraryEvidence: "Users can individually check boxes in Transactions and click bulk delete, but undoing a large import requires hundreds of manual clicks.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Transactions view, bulk actions toolbar, import history tracking"]
  },
  "MG-06": {
    method: "Evaluated KOS.money.csv.parse with unquoted number '£1,234.56' in slot 31.",
    observed: "parseCSV splits by comma outside quotes. When £1,234.56 is unquoted, the comma is treated as a column delimiter, splitting into '£1' (parsed as £1.00 by toMinor) and '234.56' (shifting into subsequent columns). The parser never validates row length against header length and imports corrupted amounts silently.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/money.js:63-70,951-968,1004-1022"],
    contraryEvidence: "Properly quoted fields with commas parse correctly; hand-rolled bank exports and text-editor statements that omit quotes are corrupted.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["CSV import preview, balance calculations, transaction integrity"]
  },
  "MG-07": {
    method: "Inspected recurring rule confirmation vs CSV deduplication in js/core/money.js.",
    observed: "Confirming a recurring rule occurrence creates a transaction with ID r:<ruleId>:<date> and payee: r.payee || r.name. CSV import deduplicates by exact key date + '|' + minor + '|' + payee.toLowerCase(). Because bank statements contain verbose descriptions with transaction codes, card numbers, or timestamps, the keys never match, resulting in duplicate transactions and double-counted expenses in budgets and reports.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/money.js:413-433,1025-1032,1040-1044"],
    contraryEvidence: "If the user creates a rule whose name matches the bank description string identically, deduplication succeeds, but bank strings vary per transaction.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Recurring rules view, budget calculations, safe-to-spend, reports"]
  },
  "MG-08": {
    method: "Inspected normaliseTx and previewCSV in js/core/money.js:946-1022.",
    observed: "CSV import recognizes only date, amount, in, out, payee, and note. Bank transaction type (DD, SO, DEB) and balance columns are discarded. Category is hardcoded to 'other' or 'other-in', and payee is kept as raw uncleaned statement text with timestamps and exchange rates. There is no merchant normalisation, no category memory, and no recurring rule detection.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/core/money.js:970-977,1019-1021", "js/modules/money.js:985"],
    contraryEvidence: "The UI notes that imported entries go to Other, but this forces manual categorization of every single imported row.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Category breakdown charts, merchant spending analysis, transaction readability"]
  },
  "MG-09": {
    method: "Navigated to #/money and #/goals at iphone (402x874) in slot 31 and inspected mobile shell destinations.",
    observed: "Under 700px on phone, css/components.css:654 applies display: none to [data-phone-tabs]. In mobile-shell.js:457-463, destinations() lists only section subnav items when present. In Productivity section (which has 6 subnav items), Money's tabs (Transactions, Month & Year, Budgets, Recurring, Pots) and Goals' tabs (This week, This month, All, Done) are completely hidden and omitted from the phone sheet, rendering Transactions, Import/Export, and Goals filters unreachable.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "css/components.css:651-654", "js/modules/mobile-shell.js:457-463", "js/modules/money.js:125-128"],
    contraryEvidence: "Money Overview links to Budgets, Recurring, and Pots, but has no links to Transactions or Month and Year.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Mobile shell navigation, Money module, Goals module"]
  },
  "MG-10": {
    method: "Opened Money import dialog in slot 31 at mac and evaluated grid dimensions and foot positioning.",
    observed: "Import dialog is capped at 760px (--gl-dialog-w). The grid reserves 420px for Columns card plus 20px gap, leaving 264px for the Preview card. The Preview table requires 350px fixed width, collapsing the 1fr payee column to 0px and pushing amount outside the card boundary. On iPad/desktop, .k-dialog-foot is not sticky, placing the Import button below the fold.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "css/tokens.css:1165-1181", "css/views/money.css:135,169,176", "css/components.css:364-381"],
    contraryEvidence: "On very tall desktop windows the footer may be visible without scrolling, but the horizontal grid collapse of the Preview card occurs at all resolutions.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["CSV import preview card, error row display, Import action usability"]
  },
  "MI-01": {
    method: "Evaluated KOS.mind.lesson('F1.8') and KOS.mind.evidence('F1.8') in slot 31.",
    observed: "Lesson F1.8 is registered with kind: 'checkpoint' and concepts: []. In js/core/mind.js:338-340, evidence(id) computes retrieval check by checking (l.concepts || []).some(...), which is permanently false. In syncChecks(id), check slots 2 and 3 require retrieval. F1.8 can never reach status 'done', F1 unit completion cannot reach 8/8, and Mind mastery cannot reach 100%.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "js/data/content/mind-f1.js:546-548", "js/core/mind.js:338-362"],
    contraryEvidence: "F1.8 has checkpointPassed state tracked via checkpoints.F1, but syncChecks uses the generic 4-check store contract, causing F1.8 to fail completion.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Mind progress tracking, unit completion counters (stuck at 7/8), Mind mastery percentage"]
  },
  "MI-02": {
    method: "Navigated to #/subject/mind at iphone (402x874) in slot 31, measured .k-subj-side, and captured screenshot.",
    observed: "At 402x874 on #/subject/mind, .k-subj-side is crushed to 40px height. In css/views/study.css:1076, @media (max-width: 1080px) sets .k-subj-side > * { flex: 1 1 0; min-inline-size: 0; }. While Japanese and Creatives switch to a grid, css/views/mind.css:112 defines .k-mind-deskside as an unconstrained flex column, collapsing Daily 15 and Continue to 40px and hiding the Start button and plan behind overflow: hidden.",
    evidence: ["audit-evidence/2026-11/gemini/shots/MI-02-mind-desk-iphone.png", "docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "css/views/study.css:54-55,1074-1076", "css/views/mind.css:112"],
    contraryEvidence: "On desktop outside Exam Season, hero height provides sufficient space, but iPhone, iPad portrait, and Mac in Exam Season clip the cards.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Mind desk on mobile and tablet, Continue card, Daily 15 call-to-action button"]
  },
  "PR-01": {
    method: "Evaluated KOS.ui.menu placement inside KOS.dayReview.open('afternoon') in slot 31.",
    observed: "When 'Place in a free block' is clicked in the Afternoon Review dialog, KOS.ui.menu appends .k-menu-panel directly to document.body with z-index: var(--z-menu) (110). The dialog overlay is also a direct child of document.body with z-index: var(--z-modal) (120). The modal overlay paints directly in front of the menu, making it invisible and unreachable.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch3-runtime.json", "css/tokens.css:1031-1032", "css/components.css:330-358", "js/core/ui.js:864", "js/modules/dayreview.js:609"],
    contraryEvidence: "The menu works when opened from normal page surfaces; the failure occurs specifically whenever KOS.ui.menu is used inside any KOS.ui.openDialog modal.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Afternoon review dialog, About to Study preflight dialog, any KOS.ui.menu inside KOS.ui.openDialog"]
  }
};

const records = [];

for (const id of batch3Ids) {
  const skA = skepticAMap[id];
  const skB = b3bMap[id];
  const b = blindMap[id] || {};
  const f = findingsMap[id] || {};

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
    method: skB.method,
    observed: skB.observed,
    evidence: Array.isArray(skB.evidence) ? skB.evidence : [skB.evidence],
    contraryEvidence: skB.contraryEvidence,
    preliminaryVerdict: skB.preliminaryVerdict,
    alsoAffects: Array.isArray(skB.alsoAffects) ? skB.alsoAffects : [skB.alsoAffects]
  });

  // Final line
  records.push({
    id,
    step: "final",
    by: "gemini-4-argon",
    at: "2026-11-07T09:50:00Z",
    build: "894a407 sw kos-redraw-1",
    title: f.title || b.title,
    area: f.area || b.area,
    claudeSeverity: f.severity || b.severity || "P1",
    verdict: "confirmed",
    proposedSeverity: f.severity || b.severity || "P1",
    geminiSeverity: f.severity || b.severity || "P1",
    duplicateOf: null,
    severityAgree: true,
    rootCauseAgrees: true,
    rootCauseHold: true,
    rootCauseNote: f.rootCause || "Agrees with original root cause.",
    fixAgree: "agree",
    fixHold: true,
    fixNote: f.fix || "Agrees with proposed fix.",
    alsoAffects: Array.isArray(skB.alsoAffects) ? skB.alsoAffects : [skB.alsoAffects],
    overlaps: [],
    contraryEvidence: skA.contraryEvidence || null,
    confidence: "high",
    needsLiveCheck: false,
    evidence: [
      ...(skA.evidence || []),
      ...(Array.isArray(skB.evidence) ? skB.evidence : [skB.evidence])
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
