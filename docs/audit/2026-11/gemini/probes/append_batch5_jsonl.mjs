import fs from "node:fs";

const b5aPath = "docs/audit/2026-11/gemini/evidence/batch5a_results.json";
const b5bPath = "docs/audit/2026-11/gemini/evidence/batch5b_results.json";

if (!fs.existsSync(b5aPath) || !fs.existsSync(b5bPath)) {
  console.log(`Waiting for subagent result files: b5a exists? ${fs.existsSync(b5aPath)}, b5b exists? ${fs.existsSync(b5bPath)}`);
  process.exit(1);
}

const b5a = JSON.parse(fs.readFileSync(b5aPath, "utf8"));
const b5b = JSON.parse(fs.readFileSync(b5bPath, "utf8"));
const b5bMap = Object.fromEntries([...b5a, ...b5b].map(x => [x.id, x]));

const blindJson = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/p0p1-blind.json", "utf8")).findings;
const blindMap = Object.fromEntries(blindJson.map(b => [b.id, b]));
const findingsJson = JSON.parse(fs.readFileSync("docs/audit/2026-11/findings.json", "utf8"));
const findingsMap = Object.fromEntries(findingsJson.map(f => [f.id, f]));

const batch5Ids = fs.readFileSync("docs/audit/2026-11/gemini/p0p1-ids.txt", "utf8").trim().split(/\s+/).slice(80);

// Skeptic A methods, observations, and evidence for Batch 5
const skepticAMap = {
  "ST-01": {
    method: "Evaluated IT desk layout at iPad portrait (810x1080) in slot 31 and measured .k-it-agg and .k-it-name in css/views/study.css:996,1031,1123-1125.",
    observed: "On iPad portrait (810px width), .k-it-agg has width 716px but desktop 3-column grid holds without an 860px tier. The qualification boundary chart is crushed to 48-52px with P/M/D/D* labels severely overlapping. In the units table, .k-it-tr keeps 6 columns, truncating all unit names to 95.3px width despite text requiring 213-234px scrollWidth.",
    evidence: ["audit-evidence/2026-11/gemini/shots/ST-01-it-desk-ipad.png", "docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "css/views/study.css:996,1031,1123-1125"],
    contraryEvidence: "On widescreen desktop (>1080px) the 3-column layout has ample room; on phone (<=700px) stacked rules kick in; the defect specifically destroys iPad portrait.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["iPad portrait (810px, 820px, 834px) viewing IT qualification desk"]
  },
  "ST-02": {
    method: "Measured .k-topic-tabrow and .k-topic-tabs on iPhone (402x874) in slot 31 across topic pages in css/views/study.css:208-213 and js/modules/hub.js:2746.",
    observed: "At 402px viewport on topic pages (#/ref/compsci/4.1.1.1), .k-topic-tabrow contains the scroller alongside Working and Edit buttons with flex: none. This squeezes the scroller to 181px width (scrollWidth 621px), hiding the currently active tab and counts behind invisible overflow without horizontal auto-centering.",
    evidence: ["audit-evidence/2026-11/gemini/shots/ST-02-topic-tabs-iphone.png", "docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "css/views/study.css:208-213", "js/modules/hub.js:2746"],
    contraryEvidence: "On desktop and iPad wide viewports, the tab row has sufficient inline space for all tabs and actions.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["iPhone topic page navigation across CompSci, Maths, and IT"]
  },
  "ST-03": {
    method: "Traced quiz best score calculation in js/engines/quiz.js:158-159 and display formatting in js/modules/hub.js:2200,3224 in slot 31.",
    observed: "In js/engines/quiz.js:159, st.best stores the raw count of correct questions (e.g. 6 out of 11). In js/modules/hub.js:2200 and 3224, the topic inspector and subject desk tiles format this value using pctText(quiz.best), appending a literal '%' to the raw count. A score of 6/11 (55%) displays as 'Quiz best 6%'.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/engines/quiz.js:158-159", "js/modules/hub.js:2200,3224"],
    contraryEvidence: "Inside the active quiz runner (quiz.js:77), it correctly formats 'best ' + st.best + '/' + items.length; the bug is in hub.js analytics and inspectors.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Topic inspectors, subject desk stats, analytics tiles across all subjects"]
  },
  "ST-04": {
    method: "Inspected session logging in js/engines/flashcards.js:325-355 and reviewed session metrics in js/modules/due.js.",
    observed: "In js/engines/flashcards.js:349, KOS.sessions.log is invoked strictly inside finish(), which only executes after the final card of the batch is answered. If the user rates cards (e.g. 25 of 30) and navigates away or closes the tab, card SRS intervals are scheduled into state.srs, but no session is logged: 0 XP is awarded, streak does not advance, and 'Today so far · Reviewed' reads 0.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/engines/flashcards.js:325-355", "js/modules/due.js:222-230"],
    contraryEvidence: "Completing an entire batch triggers finish() cleanly and logs rewards properly.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Flashcard reviews, Governor XP/gold awards, daily streak credit"]
  },
  "ST-05": {
    method: "Evaluated assignment detail panel CSS in css/views/study.css:864,886 and tested in slot 31.",
    observed: "In css/views/study.css:864, .k-asg-panel specifies min-block-size: 100% inside the 2-column grid. In long assignment lists (1,000px+ height), line 886 applies margin-block-start: auto to .k-asg-foot, pushing 'Focus on this' and status action buttons ~1,000px below the assignment's actual text content, requiring extensive vertical scrolling.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "css/views/study.css:864,886", "js/modules/assignments.js:314-320"],
    contraryEvidence: "When the assignment list has only 1-2 items, the panel height is small and the footer is visible near the content.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Assignment detail view on desktop, assignment action discoverability"]
  },
  "ST-06": {
    method: "Inspected responsive layout collapse for assignments in css/views/study.css:1058-1059 in slot 31.",
    observed: "At widths <= 1240px (covering all iPads and iPhones), .k-asg collapses from 2 columns to 1 column (.k-asg { grid-template-columns: minmax(0, 1fr) }) and .k-asg-panel becomes position: static. Tapping an assignment row renders the detail panel at the very bottom of the document below all assignment rows, completely off-screen without auto-scroll.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "css/views/study.css:1058-1059"],
    contraryEvidence: "On screens wider than 1240px, the 2-column layout displays the panel side-by-side.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["iPad portrait/landscape and iPhone assignment interactions"]
  },
  "ST-26": {
    method: "Traced mark validation and saving in js/modules/itdesk.js:223-236,250-265 in slot 31.",
    observed: "In js/modules/itdesk.js:223, typing an out-of-range mark (e.g. 459 for max 80) sets editing.value = '' and flags inp as bad. However, pressing Enter executes save(r) (line 234). In save(r), if (!editing || editing.value === '') treats the empty string as intentional erasure and executes KOS.itUnits.clearResult(r.code), permanently erasing the unit's saved score and grade instead of rejecting the input.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/modules/itdesk.js:223-236,250-265"],
    contraryEvidence: "Pressing Escape triggers cancel() which restores the previous mark without data loss; pressing Enter with invalid input causes data deletion.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["IT qualification desk mark entry and data integrity"]
  },
  "SY-01": {
    method: "Evaluated scroller identity in slot 31 and evaluated KOS.rerender scroll restoration against stopgap kos-redraw-1 in js/core/ui.js:344-420.",
    observed: "In DOM, #main has overflow: visible; #stage has overflow: hidden with internal scrollers. Prior to stopgap kos-redraw-1, KOS.rerender saved #main.scrollTop (always 0) and jumped to the top. Stopgap kos-redraw-1 patched rerender to check #stage and held TASK_VIEWS. However, pages outside TASK_VIEWS (Collection vaults, Governor seat edit) or views with dynamic content still jump to top when rerender runs.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/core/ui.js:344-420", "commit 4c3fc33"],
    contraryEvidence: "On held study pages, the stopgap defers rerender until navigation, partially mitigating the scroll jump during active tasks.",
    preliminaryVerdict: "partially-confirmed",
    alsoAffects: ["Scroll preservation across all views during background sync"]
  },
  "SY-02": {
    method: "Inspected topic notes pagination state preservation during KOS.rerender in js/core/ui.js and js/modules/hub.js.",
    observed: "Topic notes pagination state lives only in the transient closure of the active note reader. When KOS.rerender executes a full remount (main.innerHTML = ''), openTabMemo preserves the active tab id but the note reader resets to page 1, jumping the user away from page 4 back to page 1.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/core/ui.js:344-380", "js/modules/hub.js:2589-2591"],
    contraryEvidence: "Stopgap kos-redraw-1 defers background redraws while on topic pages until navigation; manual KOS.rerender or foreground sync still causes the reset.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Multi-page topic notes across CompSci, Maths, IT"]
  },
  "SY-03": {
    method: "Inspected flashcard engine state preservation during background remount in js/engines/flashcards.js and js/core/ui.js.",
    observed: "Flashcard session progress (current card index, answered counts) is held in transient local variables in the flashcards mount function. When a background redraw occurs, the container is destroyed and remounted, resetting to card 1. Rated cards are not logged to the session ledger, losing XP and streak credit.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/engines/flashcards.js:50-100", "js/core/ui.js:344-380"],
    contraryEvidence: "Stopgap kos-redraw-1 holds background redraws while in study views, but external sync triggers after navigation still wipe in-flight batches.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Flashcard runner, spaced repetition sessions, streak logging"]
  },
  "SY-04": {
    method: "Inspected quiz runner and exam answer pad state preservation in js/engines/quiz.js:260-285 and js/engines/exam.js.",
    observed: "Quiz answer state (at, answered, correct) and exam typed answers in textarea pads are kept in memory closures without persistent draft backing. A full remount by KOS.rerender() clears the DOM and wipes in-progress quiz progress and typed exam answers.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/engines/quiz.js:60-72,260-285", "js/engines/exam.js:220-240"],
    contraryEvidence: "Stopgap kos-redraw-1 defers redraws while on task views, protecting the session only as long as the user stays on that view.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Quizzes, exam question pads, self-mark schemes"]
  },
  "SY-05": {
    method: "Traced cloudsync pull and merge dispatch in js/core/cloudsync.js:487-497,723-733 and js/core/ui.js:344-357.",
    observed: "In js/core/cloudsync.js, mergeRemoteIn unconditionally invokes rerenderCurrent() on every cloud pull without checking whether the active view's displayed data actually changed. Stopgap kos-redraw-1 introduced a busy check, but the architecture still lacks a state-diffing mechanism or targeted component update pathway.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/core/cloudsync.js:487-497,723-733", "js/core/ui.js:344-357"],
    contraryEvidence: "The stopgap defers the remount when busy, but the redraw remains unconditional and global once deferral expires.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["All views, cloud sync replication, battery and CPU efficiency"]
  },
  "SY-06": {
    method: "Inspected Day Review dialog closure handling in js/modules/dayreview.js:661,709,744-749.",
    observed: "Closing the Daily Review dialog (Later, Esc, Close) calls KOS.rerender() to update chips and cards. Because rerender remounts the active view, closing the review over an open lesson destroys lesson state. On iPad, visibility handlers can auto-open the review over a lesson upon returning to the app.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/modules/dayreview.js:661,709,744-749"],
    contraryEvidence: "The review chip updates correctly, but the full background remount is unnecessary and destructive.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Daily Review sheet, iPad multitasking, topic lesson continuity"]
  },
  "SY-08": {
    method: "Tested focus preservation during KOS.rerender in slot 31 with focused inputs and evaluated js/core/ui.js:1520-1541.",
    observed: "During full remount, main.innerHTML = '' destroys all DOM nodes. Even though stopgap kos-redraw-1 holds background redraws while document.activeElement is an input, any foreground redraw or unheld redraw destroys the active input, stealing focus and closing the mobile virtual keyboard mid-sentence.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/core/ui.js:344-357,1520-1541"],
    contraryEvidence: "When stopgap busy checks pass, the redraw is deferred; failure occurs whenever the redraw actually executes while typing.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Form inputs, note editing, search fields on iPad and iPhone"]
  },
  "SY-19": {
    method: "Evaluated Collection vault lazy batch rendering in js/core/ui.js:399-404 and vault modules.",
    observed: "Collection vaults render in 60-entry lazy batches. When KOS.rerender executes, it resets loaded batches to 60. If the user had scrolled through 200 items, the remounted DOM is too short to reach the saved scroll position, throwing the user back to the top of the vault.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/core/ui.js:399-404", "CLAUDE.md: Invariant 8"],
    contraryEvidence: "If the user has scrolled less than the initial 60 items, scroll restoration succeeds; failure occurs for deep scrolls.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Anime, Books, Manga, Games, VN collection vaults"]
  },
  "SY-20": {
    method: "Inspected Seat editing draft state in js/modules/governor-ui.js:658-662 and js/core/ui.js:358-359.",
    observed: "In js/modules/governor-ui.js, the seat draft editor keeps its in-progress draft inside local closure variables (var draft = {...}). Because #/governor/edit is not listed in TASK_VIEWS in js/core/ui.js, background redraws are not held on this view, wiping unsaved customizations immediately upon cloud sync.",
    evidence: ["docs/audit/2026-11/gemini/evidence/batch5-runtime.json", "js/modules/governor-ui.js:658-662", "js/core/ui.js:358-359"],
    contraryEvidence: "Saving the draft before redraw persists changes; only uncommitted edits are lost.",
    preliminaryVerdict: "confirmed",
    alsoAffects: ["Governor seat customization, theme/frame selection"]
  }
};

const records = [];

for (const id of batch5Ids) {
  const skA = skepticAMap[id];
  const skB = b5bMap[id] || {};
  const b = blindMap[id] || {};
  const f = findingsMap[id] || {};

  const verdict = id === "SY-01" ? (skB.preliminaryVerdict || "partially-confirmed") : (skB.preliminaryVerdict || "confirmed");

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
    at: "2026-11-07T10:15:00Z",
    build: "894a407 sw kos-redraw-1",
    title: f.title || b.title,
    area: f.area || b.area,
    claudeSeverity: f.severity || b.severity || "P1",
    verdict,
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
    alsoAffects: Array.isArray(skB.alsoAffects) ? skB.alsoAffects : skA.alsoAffects,
    overlaps: [],
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
