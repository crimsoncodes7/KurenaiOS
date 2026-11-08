import fs from 'node:fs';

const records = [
  // 1. JM-06
  {
    id: "JM-06",
    step: "skepticA",
    method: "Evaluated KOS.ja.ui().spine = 'media' and navigated to #/ref/ja/1.1 via KOS.show('ref', {subject:'ja', ref:'1.1'}) and hash router on slot 31 (mac).",
    observed: "Calling KOS.show('ref', {subject:'ja', ref:'1.1'}) when state.ui.japanese.spine === 'media' throws 'TypeError: codeSpine.stageHead is not a function' at js/modules/hub.js:495:36. Navigating via hash route (#/ref/ja/1.1) catches the exception in router.js:264 and redirects to #/home with toast 'A page could not be opened.', hiding #tree so the Core | Media toggle is unreachable.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/modules/jatopic.js:36-41",
      "js/modules/hub.js:493-495"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "JM-06",
    step: "skepticB",
    method: "Traced js/modules/jatopic.js:29-53, js/modules/hub.js:425-496, 1956-1975, 2364-2371, and js/core/router.js:253-282; checked Invariant 20 (router owns hash history).",
    observed: "In js/modules/jatopic.js:37-41, when mode === 'media', KOS.jaTopic.spine() appends the Media placeholder note and returns { tracks: true } without a stageHead method. In js/modules/hub.js:425-426, sections is only emptied for sid === 'code' && codeMode !== 'core', not for sid === 'ja' in media mode, so sections.forEach (hub.js:488-496) calls codeSpine.stageHead(sec.stage) at line 495 and throws.",
    evidence: [
      "js/modules/jatopic.js:30-52",
      "js/modules/hub.js:425-427",
      "js/modules/hub.js:485-496",
      "js/core/router.js:262-268"
    ],
    contraryEvidence: "On desktop >860px with #tree uncollapsed, an in-app KOS.show('ref', ...) call (not wrapped in router.js renderRoute try/catch) mounts the Core | Media segmented control into #tree at jatopic.js:36 before hub.js:495 throws, leaving #main blank while #tree stays visible. On <=860px (drawer closed) or on any hash/reload/back navigation (router.js:264 redirects to #/home and calls hideTree()), recovery via UI is impossible.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "JM-06",
    step: "final",
    title: "Choosing 'Media' in the Japanese spine locks the device out of every Japanese lesson: each lesson page throws 'codeSpine.stageHead is not a function' and bounces to Home, and the switch back is on the page that no longer opens",
    area: "ja-mind",
    claudeSeverity: "P0",
    verdict: "confirmed",
    geminiSeverity: "P0",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause: KOS.jaTopic.spine() returns { tracks: true } without stageHead in media mode while hub.js:425-495 neither empties sections for ja media mode nor guards codeSpine.stageHead.",
    fixHold: true,
    fixNote: "Agrees with proposed fix: empty sections in hub.js when codeSpine.tracks is true (matching sid === 'code' track mode at hub.js:425) and guard codeSpine.stageHead.",
    alsoAffects: [
      "Deep links, bookmarks, Due/Search/Home lesson launches into #/ref/ja/* while state.ui.japanese.spine === 'media'"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/modules/jatopic.js:36-52",
      "js/modules/hub.js:425-427",
      "js/modules/hub.js:485-496",
      "js/core/router.js:262-268"
    ],
    summary: "Confirmed via live runtime evaluation on slot 31 and code trace. Setting state.ui.japanese.spine = 'media' causes KOS.jaTopic.spine() (jatopic.js:37-41) to return { tracks: true } without a stageHead function, while hub.js:425-495 still iterates KOS_DATA.ja.sections and calls codeSpine.stageHead(0), throwing TypeError. Hash navigation catches the error in router.js:264 and bounces to #/home (which hides #tree), locking the user out of all Japanese lessons."
  },

  // 2. MG-01
  {
    id: "MG-01",
    step: "skepticA",
    method: "Ran KOS.money.csv.parse, guess, preview, and import on slot 31 with a 2-row CSV ('Date,Amount,Merchant/Description'), first with guessed mapping (payee unmapped) and then with payee mapped to column 2.",
    observed: "GUESS.payee did not match 'Merchant/Description', so the first import saved 2 transactions with payee: ''. Re-previewing the identical CSV with the same empty payee detected 2/2 duplicates, but mapping payee to column 2 ('Merchant/Description') produced duplicates: 0 and 2 new rows.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-clean.json",
      "js/core/money.js:975",
      "js/core/money.js:1027-1031"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "MG-01",
    step: "skepticB",
    method: "Traced js/core/money.js:140-150 (normaliseTx), 970-984 (GUESS), 997-1056 (previewCSV, importRows, undoBatch) and js/modules/money.js:908-1012.",
    observed: "previewCSV (js/core/money.js:1027-1030) keys deduplication strictly on t.date + '|' + t.minor + '|' + t.payee.toLowerCase(), and normaliseTx (money.js:140-150) stores no raw CSV row fingerprint or source hash. Any change in which CSV column is mapped to payee (or leaving payee unmapped on one import and mapped on the next) changes t.payee.toLowerCase() and causes 0% duplicate detection.",
    evidence: [
      "js/core/money.js:140-150",
      "js/core/money.js:970-984",
      "js/core/money.js:1025-1034",
      "js/modules/money.js:915-917"
    ],
    contraryEvidence: "The UI explicitly states 'Duplicates match on date, amount and payee' (js/modules/money.js:1003) and step 3 of the import dialog offers 'Undo this import' (M.undoBatch) while the modal remains open. However, once closed, re-importing with a corrected column mapping duplicates every transaction.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "MG-01",
    step: "final",
    title: "Duplicate transactions after re-importing: de-dupe key includes payee, so a second import mapped differently is all 'new'",
    area: "money-goals",
    claudeSeverity: "P0",
    verdict: "confirmed",
    geminiSeverity: "P0",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-15): previewCSV keys deduplication only on date|minor|payee.toLowerCase() and importRows discards the raw CSV line/columns.",
    fixHold: true,
    fixNote: "Agrees with storing a normalized raw-row hash/description on imported transactions and checking both date|minor|rawHash and date|minor|payee|(or note when payee is empty) during previewCSV.",
    alsoAffects: [
      "Money safe-to-spend, budget category totals, and Reports weekly/monthly spending summaries"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-clean.json",
      "js/core/money.js:975",
      "js/core/money.js:1025-1034",
      "js/modules/money.js:587-591"
    ],
    summary: "Confirmed by live CSV import/preview on slot 31 and code trace in js/core/money.js:1025-1034. Importing a 2-row CSV where 'Merchant/Description' was not auto-guessed as payee saved payee: '' on both rows; re-previewing the same CSV with payee mapped to column 2 reported duplicates: 0 and 2 new rows because keys[date|minor|payee] did not match."
  },

  // 3. ST-25
  {
    id: "ST-25",
    step: "skepticA",
    method: "On slot 31, added a file to topic compsci:4.1.1 via KOS.attach.add, attached a second link {kind:'assignment', id:'19'} via KOS.attach.addLink, verified both links, then ran KOS.assignments.remove(19) and checked KOS.attach.get(fileId).",
    observed: "Before deleting assignment #19, the file (5485ae34-7a65-4fb5-bb0d-d2c9dce67582) had links [{kind:'topic',id:'compsci:4.1.1'}, {kind:'assignment',id:'19'}]. After KOS.assignments.remove(19), KOS.attach.get returned null (existsAfterAssignmentRemove: false): the file and its blob were permanently deleted from kurenai-os-files, removing it from topic compsci:4.1.1 as well.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/core/assignments.js:203-231",
      "js/modules/attachments.js:275-292",
      "js/modules/attachments.js:392-411"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "ST-25",
    step: "skepticB",
    method: "Traced js/core/assignments.js:203-231, js/modules/attachments.js:238-292, 392-411, js/core/files.js:326-340, and checked CLAUDE.md Invariant 150 (One file, many links).",
    observed: "KOS.attach.list(sid, 'assignment:' + id) (attachments.js:275-292) queries both the legacy topic index and the multiEntry links index ('assignment:' + id), returning shared files whose home is a topic or another record. However, removeAttachments(id) in js/core/assignments.js:220-231 calls KOS.attach.remove(r.id) on every returned file instead of KOS.files.detach / KOS.attach.removeLink, permanently deleting the file and recording a cloud tombstone.",
    evidence: [
      "CLAUDE.md:1655-1671",
      "js/core/assignments.js:203-231",
      "js/modules/attachments.js:275-292",
      "js/modules/attachments.js:392-411",
      "js/core/files.js:326-340"
    ],
    contraryEvidence: "Single-file removal inside the assignment inspector (js/modules/assignments.js:293) properly uses KOS.files.detach, which preserves files that have other links; only whole-assignment deletion (KOS.assignments.remove) runs the destructive removeAttachments loop.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "ST-25",
    step: "final",
    title: "Deleting an assignment permanently deletes every file linked to it, including files that belong to a topic or another record",
    area: "study-core",
    claudeSeverity: "P0",
    verdict: "confirmed",
    geminiSeverity: "P0",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-08): removeAttachments in js/core/assignments.js:220-231 predates the multi-link file index (Invariant 150) and calls KOS.attach.remove(r.id) unconditionally.",
    fixHold: true,
    fixNote: "Agrees with calling KOS.attach.removeLink(r.id, {kind:'assignment', id:String(id)}) when linksOf(r).length > 1 and only calling KOS.attach.remove(r.id) when the assignment is the sole link.",
    alsoAffects: [
      "Study topics, Exams, Calendar events, Goals, and cloud-synced files (recordFileTombstone) sharing a link with a deleted assignment"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "CLAUDE.md:1655-1671",
      "js/core/assignments.js:203-231",
      "js/modules/attachments.js:275-292",
      "js/modules/attachments.js:392-411"
    ],
    summary: "Confirmed in live browser on slot 31 and by code trace. Creating a file on topic compsci:4.1.1, linking it to assignment #19, and calling KOS.assignments.remove(19) permanently deleted the file from IndexedDB (existsAfterAssignmentRemove: false) and tombstoned it for cloud sync, directly violating CLAUDE.md Invariant 150."
  },

  // 4. SY-18
  {
    id: "SY-18",
    step: "skepticA",
    method: "On slot 31, mounted KOS.editor on compsci:4.5.4.3 flashcards (15 cards), simulated a background pull adding 'remote-card-999' to store.state.edits while redraw was held on TASK_VIEWS.ref, and dispatched an input event in the open editor.",
    observed: "In our initial probe where we dispatched 'input' on the search/filter input inside the editor host rather than a card textarea, save() did not fire; when save() fires on a card textarea/block edit (js/modules/editor.js:414, 470, 567, 650, 656), it calls KOS.edits.set(sid, ref, kind, cards) with the closure array captured at mount time (15 cards), overwriting the 16-card state in store.state.edits and dropping 'remote-card-999'.",
    evidence: [
      "js/modules/editor.js:408-415",
      "js/core/edits.js:199-207",
      "js/core/ui.js:356-392",
      "js/core/cloudmerge.js:374-378"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "SY-18",
    step: "skepticB",
    method: "Traced sw.js:44, js/core/ui.js:344-393 (holdBackground / TASK_VIEWS), js/modules/editor.js:408-656, js/core/edits.js:165-207, js/core/cloudsync.js:552-580, 723-789, and js/core/cloudmerge.js:347-380, 446-449.",
    observed: "Because ref is in TASK_VIEWS (js/core/ui.js:356), applyRemoteState (js/core/cloudsync.js:738-789) updates KOS.store.state and writes incoming into the three-way merge base via saveBase(incoming) (cloudsync.js:774, 787) while holding back KOS.rerender({background:'hard'}). KOS.editor.mount captures cards/blocks/items once in closure state at mount time (editor.js:409, 465, 545, 648, 655) and writes the entire stale array back via KOS.edits.set on any subsequent edit. Because the pulled card's id is now present in base (bIdx[k]) and absent from local (lIdx[k]), mergeRecords (js/core/cloudmerge.js:377) treats it as a local deletion and deletes it across all devices.",
    evidence: [
      "js/core/ui.js:356-392",
      "js/modules/editor.js:408-415",
      "js/modules/editor.js:647-656",
      "js/core/edits.js:199-207",
      "js/core/cloudsync.js:774-787",
      "js/core/cloudmerge.js:374-378"
    ],
    contraryEvidence: "Requires the study editor to be open on the same topic and material tab when the remote pull arrives, followed by a local edit in that open editor before closing it or navigating away.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "SY-18",
    step: "final",
    title: "With the redraw held, an open study editor writes its stale copy over material another device added — the pulled card is deleted locally and the three-way merge then deletes it everywhere",
    area: "sync-disruption",
    claudeSeverity: "P0",
    verdict: "confirmed",
    geminiSeverity: "P0",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-02): kos-redraw-1 holds background redraws on TASK_VIEWS.ref while applyRemoteState updates store.state and saveBase(incoming), leaving KOS.editor's closure array stale so its next whole-array save() looks like a deliberate deletion relative to base.",
    fixHold: true,
    fixNote: "Agrees with moving KOS.edits from whole-array replacement to per-row patches (or notifying mounted editors on background pull to merge by row id before saving).",
    alsoAffects: [
      "All 5 study editor tabs on #/ref: notes, spec, flashcards, quiz, and exam (js/modules/editor.js)"
    ],
    evidence: [
      "js/core/ui.js:356-392",
      "js/modules/editor.js:408-415",
      "js/modules/editor.js:464-470",
      "js/modules/editor.js:544-567",
      "js/modules/editor.js:647-656",
      "js/core/edits.js:199-207",
      "js/core/cloudsync.js:774-787",
      "js/core/cloudmerge.js:374-378"
    ],
    summary: "Confirmed by tracing the interaction between kos-redraw-1 (js/core/ui.js:356-392), applyRemoteState (js/core/cloudsync.js:774-787), KOS.editor.mount (js/modules/editor.js:408-656), and mergeRecords (js/core/cloudmerge.js:374-378). When a pull arrives while KOS.editor is open on #/ref, saveBase(incoming) records the remote row in base while the redraw is held; the next keystroke in the open editor calls KOS.edits.set with its pre-pull closure array, causing three-way merge to see the row in base but not local and delete it everywhere."
  },

  // 5. AA-01
  {
    id: "AA-01",
    step: "skepticA",
    method: "Executed KOS.ai.tools.execute('todo_add_task', {title:'Temp AA-01 task'}) on slot 31 and inspected both the returned undo closure and the Assistant DOM (#/assistant).",
    observed: "KOS.ai.tools.execute('todo_add_task', ...) returned hasUndo: true with undoLabel: 'remove the reminder', and we ran undo.run() programmatically to clean up. However, inspecting the Assistant DOM confirmed assistantUndoButtonsInDom: 0, and grep across js/ confirmed KOS.ai.orchestrator.lastUndos is never called by any UI module.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "js/core/aiorchestrator.js:451",
      "js/core/aiorchestrator.js:754",
      "js/core/aiorchestrator.js:1046",
      "js/modules/assistant.js:2518"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AA-01",
    step: "skepticB",
    method: "Traced js/core/aitools.js:12-20, 3796-3806, js/core/aiorchestrator.js:255, 451-460, 742-776, 1046, and js/modules/assistant.js:135-137, 698-739, 1505-1551, 2518, 2608-2669.",
    observed: "Reversible tools return an undo object ({label, run}) which aiorchestrator.js collects into req.undos (line 754) and exposes via lastUndos() (line 1046), while passing undo: !!undo in onToolResult (line 775) and undos: req.undos.length in onDone (line 459). Yet js/modules/assistant.js labels reversible tools 'Undoable action' (line 136) and 'Default · runs, undoable' (line 2518) while completely ignoring p.undo, p.undos, and lastUndos().",
    evidence: [
      "js/core/aitools.js:12-20",
      "js/core/aiorchestrator.js:451-460",
      "js/core/aiorchestrator.js:754-775",
      "js/core/aiorchestrator.js:1046",
      "js/modules/assistant.js:136",
      "js/modules/assistant.js:698-739",
      "js/modules/assistant.js:1505-1551",
      "js/modules/assistant.js:2518"
    ],
    contraryEvidence: "Users can set reversible tools to 'Ask first' or 'Blocked' in Permissions (assistant.js:2518-2529), or manually delete/edit created records, but no UI path invokes the collected undo.run closures.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AA-01",
    step: "final",
    title: "'Undoable' Assistant actions cannot be undone: the undo each tool returns is collected and never offered",
    area: "assistant-archive",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-17): undo closures are implemented in aitools.js and collected in aiorchestrator.js (req.undos / lastUndos), but assistant.js never reads or renders them.",
    fixHold: true,
    fixNote: "Agrees with rendering an Undo button on verified-action receipt cards and tool groups wired to each tool call's undo.run callback.",
    alsoAffects: [
      "All reversible-tier Assistant tools across both the Assistant slide-over drawer and #/assistant workspace"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/core/aiorchestrator.js:451-460",
      "js/core/aiorchestrator.js:754-775",
      "js/core/aiorchestrator.js:1046",
      "js/modules/assistant.js:136",
      "js/modules/assistant.js:698-739",
      "js/modules/assistant.js:1505-1551",
      "js/modules/assistant.js:2518"
    ],
    summary: "Confirmed by executing todo_add_task via KOS.ai.tools.execute on slot 31 and tracing js/core/aiorchestrator.js and js/modules/assistant.js. While reversible tools return working {label, run} undo closures that aiorchestrator.js stores in req.undos and exposes via KOS.ai.orchestrator.lastUndos(), assistant.js never calls lastUndos() or renders an Undo button despite advertising the tier as 'Default · runs, undoable'."
  },

  // 6. AA-02
  {
    id: "AA-02",
    step: "skepticA",
    method: "Populated a 14-message conversation via KOS.aidb on slot 31, navigated to #/home and back to #/assistant (Chat), and measured .k-asst-thread scrollTop, scrollHeight, and clientHeight.",
    observed: "On opening #/assistant with a populated conversation, buildThreadArea() ran render() before the conversation subtree was appended to the live DOM, leaving scroller.scrollTop at 0 (the oldest message at the top). Once scrollTop is 0 on a tall thread, scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 60 is false on every subsequent render(), so new messages and confirmation cards append off-screen below the fold.",
    evidence: [
      "js/modules/assistant.js:1615-1627",
      "js/modules/assistant.js:1656-1676",
      "js/modules/assistant.js:2036-2066"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AA-02",
    step: "skepticB",
    method: "Traced js/modules/assistant.js:576-629, 653-666, 712-720, 1615-1677, 1952, 2036-2067, and 2096.",
    observed: "In buildThreadArea (js/modules/assistant.js:1615-1627), render() is invoked synchronously at line 1627 while wrap and scroller are still detached from document.body (before openDrawer appends drawerEl at line 1676 and before pageChat appends conversation at line 2066). On a detached element, scrollHeight, scrollTop, and clientHeight are all 0, so scroller.scrollTop = scroller.scrollHeight sets scrollTop = 0. On subsequent notify()/render() calls after mount, atBottom (scrollHeight - 0 - clientHeight < 60) is false whenever scrollHeight >= clientHeight + 60, preventing auto-scroll even on user send or confirmationCard() mount.",
    evidence: [
      "js/modules/assistant.js:1615-1627",
      "js/modules/assistant.js:1656-1676",
      "js/modules/assistant.js:2036-2066"
    ],
    contraryEvidence: "If a user starts a brand-new conversation inside an already-mounted Chat view and never leaves or closes the drawer, scroller is already connected as messages grow, so atBottom stays true until the view is reopened or scrolled up.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AA-02",
    step: "final",
    title: "Reopened chat starts at the oldest message, and from then on new replies and approval cards land off-screen",
    area: "assistant-archive",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause: buildThreadArea() calls render() at js/modules/assistant.js:1627 while scroller is still detached (scrollHeight === 0), leaving scrollTop = 0 after mount so atBottom evaluates to false on every later render.",
    fixHold: true,
    fixNote: "Agrees with deferring initial scroll-to-bottom to requestAnimationFrame after DOM insertion and unconditionally scrolling to bottom on user message send and confirmation card appearance.",
    alsoAffects: [
      "Assistant slide-over drawer (openDrawer at assistant.js:1656-1676) and opening saved threads from Recent/History (assistant.js:1952, 2096)"
    ],
    evidence: [
      "js/modules/assistant.js:576-629",
      "js/modules/assistant.js:712-720",
      "js/modules/assistant.js:1615-1627",
      "js/modules/assistant.js:1656-1676",
      "js/modules/assistant.js:2036-2066"
    ],
    summary: "Confirmed by code trace in js/modules/assistant.js:1615-1627 and 2036-2066. Because buildThreadArea() runs its initial render() while the scroller element is still detached from the document, scrollHeight is 0 and scrollTop is initialized to 0; once attached, any thread taller than clientHeight + 60px opens at the oldest message and fails the atBottom (<60px) check on all subsequent sends, replies, and approval cards."
  },

  // 7. AA-11
  {
    id: "AA-11",
    step: "skepticA",
    method: "Inspected the 'Import backup…' control and file input change handler on #/data (Archive > Backup & Restore) and traced KOS.store.importFull.",
    observed: "Selecting a file in the <input type='file'> created at js/modules/hub.js:3356 immediately invokes store.importFull(file.files[0], ...) in file.onchange (hub.js:3357-3374) with zero confirmation dialog, preview, or undo, overwriting localStorage and all 7 IndexedDB databases and calling KOS.cloudsync.noteRestore().",
    evidence: [
      "js/modules/hub.js:3356-3376",
      "js/core/store.js:601-740"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AA-11",
    step: "skepticB",
    method: "Traced js/modules/hub.js:3356-3406 and js/core/store.js:601-740.",
    observed: "In js/modules/hub.js:3357-3374, file.onchange calls store.importFull(file.files[0], ...) directly without KOS.ui.confirm or KOS.ui.openDialog (unlike 'Reset all study progress' on the very same page at hub.js:3396-3406, which opens a danger confirm dialog). In js/core/store.js:607-735, importFull validates only that parsed JSON is an object with 'state' or 'progress', then immediately calls KOS.store.replaceState(incoming), wipes and replaces all 7 IndexedDB stores, and calls KOS.cloudsync.noteRestore().",
    evidence: [
      "js/modules/hub.js:3356-3376",
      "js/modules/hub.js:3396-3406",
      "js/core/store.js:601-740"
    ],
    contraryEvidence: "The 'Import backup…' button has a title attribute ('A complete restore, not a merge: the file replaces what's here', hub.js:3375), and invalid JSON files are rejected before state replacement; however, native title tooltips are invisible on touch devices (iPad/iPhone) and no confirmation or summary is shown after picking a file.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AA-11",
    step: "final",
    title: "Import backup replaces everything on this device the moment a file is picked: no confirmation, no summary, no undo",
    area: "assistant-archive",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause: file.onchange in js/modules/hub.js:3357-3374 is wired directly to KOS.store.importFull without the danger confirmation dialog used by Reset on the same page.",
    fixHold: true,
    fixNote: "Agrees with parsing and summarizing the backup file first, then presenting a KOS.ui.openDialog danger confirmation comparing backup timestamp/counts against local data before executing importFull.",
    alsoAffects: [
      "Cloud sync across all linked devices via KOS.cloudsync.noteRestore() (js/core/store.js:733)"
    ],
    evidence: [
      "js/modules/hub.js:3356-3376",
      "js/modules/hub.js:3396-3406",
      "js/core/store.js:601-740"
    ],
    summary: "Confirmed by code inspection of js/modules/hub.js:3356-3376 and js/core/store.js:601-740. Picking any valid backup JSON file in the file picker immediately triggers store.importFull in file.onchange without confirmation, summary, or undo, wiping localStorage and 7 IndexedDB databases and calling KOS.cloudsync.noteRestore() to overwrite cloud state."
  },

  // 8. AG-01
  {
    id: "AG-01",
    step: "skepticA",
    method: "Opened #/governor on slot 31 (mac 1470x832), ensured .k-pagehead had data-state='has-art', opened [data-ui='gov.id-access'] (⋯), captured screenshot, and ran document.elementFromPoint on all 6 buttons inside .k-gv-tools-pop.",
    observed: "The popover .k-gv-tools-pop rendered at y=164.2..264.2 (height 100px) while .k-gv-stage started at y=201.9. Hit-testing the center of each button via document.elementFromPoint showed the top row ('Live', 'Full', 'Off' at y=180) hit BUTTON.k-seg-item inside the popover (hitInsidePop: true), whereas all 3 buttons in the bottom 'Data' row ('Mine', 'Empty', 'Sample' at y=222) hit SECTION.k-gv-glass.k-gv-rightg inside .k-gv-stage (hitInsidePop: false) and could not be clicked.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/AG-01-governor-menu-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch1-followup.json",
      "css/components.css:35",
      "css/views/governor.css:31",
      "css/views/governor.css:65"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AG-01",
    step: "skepticB",
    method: "Traced js/modules/governor-ui.js:205-210, 419-442, js/core/ui.js:637-656, 1592-1594, js/core/art.js:181-206, css/components.css:35, and css/views/governor.css:31, 60-70.",
    observed: "In css/components.css:35, .k-pagehead[data-state~='has-art'] sets position: relative; isolation: isolate; with z-index: auto, creating a stacking context. The ⋯ popover (.k-gv-tools-pop, css/views/governor.css:65) sits inside .k-pagehead-actions with z-index: var(--z-menu) (110), which is trapped inside .k-pagehead's stacking context. Because the sibling .k-gv-stage (governor.css:31) also has position: relative; isolation: isolate; and appears later in DOM order, .k-gv-stage paints on top of the lower half of .k-gv-tools-pop.",
    evidence: [
      "js/modules/governor-ui.js:205-210",
      "js/modules/governor-ui.js:419-442",
      "js/core/ui.js:637-656",
      "js/core/ui.js:1592-1594",
      "css/components.css:35",
      "css/views/governor.css:31",
      "css/views/governor.css:65"
    ],
    contraryEvidence: "Also uncovered a subtle timing interaction in js/core/ui.js:642 vs 1594: pageHeader() reads KOS.store.state.ui.view before KOS.show updates state.ui.view = viewId at line 1594. When navigating to #/governor from a view not in PAGE_ART (e.g. #/home or #/ref), .k-pagehead initially gets no has-art until a rerender/tab switch/reload on #/governor; when navigating from any PAGE_ART view or after any rerender/reload on #/governor, has-art is set and the Data row is completely occluded.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AG-01",
    step: "final",
    title: "The Seat's ⋯ menu is cut off by the stage: its Data row (Mine / Empty / Sample) is hidden and unclickable",
    area: "achievements-governor",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-03): .k-pagehead[data-state~='has-art'] (css/components.css:35) creates a stacking context with z-index: auto, trapping .k-gv-tools-pop's z-index: 110 behind the subsequent positioned .k-gv-stage.",
    fixHold: true,
    fixNote: "Agrees with portalling the ⋯ menu via KOS.ui.menu (top-layer/body portal) or raising .k-pagehead's z-index above the page body; also fix js/core/ui.js:642 vs 1594 so pageHeader reads the target viewId rather than the stale pre-navigation state.ui.view.",
    alsoAffects: [
      "Any dropdown/popover placed inside .k-pagehead-actions on views in PAGE_ART (js/core/ui.js:637-639)",
      "js/core/ui.js:642 vs 1594 (pageHeader reads stale state.ui.view on first navigation)"
    ],
    evidence: [
      "audit-evidence/2026-11/gemini/shots/AG-01-governor-menu-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch1-followup.json",
      "css/components.css:35",
      "css/views/governor.css:31",
      "css/views/governor.css:65",
      "js/core/ui.js:642",
      "js/core/ui.js:1592-1594"
    ],
    summary: "Confirmed on slot 31 (mac) with screenshot and document.elementFromPoint hit-testing. When .k-pagehead has data-state='has-art' (isolation: isolate, z-index: auto), .k-gv-tools-pop (y=164..264) is trapped in the header's stacking context and painted over below y=202 by .k-gv-stage, causing clicks on 'Mine', 'Empty', and 'Sample' (y=222) to hit SECTION.k-gv-glass.k-gv-rightg instead of the menu buttons."
  },

  // 9. AG-02
  {
    id: "AG-02",
    step: "skepticA",
    method: "On slot 31 at iphone (402x874), equipped 3 earned badges ('regular', 'early-bird', 'night-owl') via KOS.achievements.setShowcase, navigated to #/governor, measured bounding boxes of .k-gv-xp, .k-gv-arc-slot, and .k-ach-medal, and captured screenshot.",
    observed: "At 402x874, all 3 equipped .k-ach-medal elements had inline style --m: 80px and rendered at 80x80px (x=32..112, x=80..160, x=128..208, y=580.3..660.3), overlapping one another horizontally by 32px and overlapping the XP bar above (xpRect.bottom = 587.4). Meanwhile, the 3 empty .k-gv-arc-slot elements were squeezed to 17x44px vertical ovals.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/AG-02-governor-seat-iphone.png",
      "js/modules/governor-ui.js:364-366",
      "js/modules/achievements.js:59",
      "css/views/governor.css:518-523"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AG-02",
    step: "skepticB",
    method: "Traced js/modules/governor-ui.js:346-374, js/modules/achievements.js:47-60, css/views/governor.css:80-90, 510-523, and css/views/achievements.css:21.",
    observed: "In js/modules/governor-ui.js:364, buildStage calls aui.medal(v, { px: 80, pips: false, decorative: true }), which sets node.style.setProperty('--m', '80px') inline (achievements.js:59). At @media (max-width: 700px), css/views/governor.css:521 sets .k-gv-arc-slot .k-ach-medal { --m: var(--ach-medal-sm); }, which loses to the inline --m: 80px property. Simultaneously, .k-gv-arc-note has flex-basis: 100% (governor.css:522) while .k-gv-arc only sets flex-wrap: wrap when :has(.k-gv-arc-note:not(:empty)) (governor.css:523), so when 1-5 medals are equipped (.k-gv-arc-note is empty), the unwrapped flex row squeezes empty 44x44 slots without flex-shrink: 0 into 17x44 ovals.",
    evidence: [
      "js/modules/governor-ui.js:350-373",
      "js/modules/achievements.js:59",
      "css/views/governor.css:518-523",
      "css/views/achievements.css:21"
    ],
    contraryEvidence: "When 0 showcase medals are equipped on a seeded account, .k-gv-arc-note contains 'Pick your showcase →' (not :empty), so .k-gv-arc:has(.k-gv-arc-note:not(:empty)) enables flex-wrap: wrap and the 6 empty slots remain 44x44 circles; as soon as 1-5 medals are equipped, both the 80x80 medal overlap and 17x44 oval distortion occur.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AG-02",
    step: "final",
    title: "iPhone Seat: showcase medals draw at 80px over each other and the XP bar, and the empty slots are 17 x 44 ovals",
    area: "achievements-governor",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause: inline --m: 80px from aui.medal(v, {px:80}) overrides the <=700px stylesheet rule, and .k-gv-arc-note's unconditional flex-basis: 100% in an unwrapped flex row squeezes the shrinkable slots.",
    fixHold: true,
    fixNote: "Agrees with removing inline --m: 80px in favor of CSS sizing (or !important at <=700px), adding flex-shrink: 0 to .k-gv-arc-slot, and hiding .k-gv-arc-note:empty.",
    alsoAffects: [
      "All viewports <=700px on #/governor (Status tab)"
    ],
    evidence: [
      "audit-evidence/2026-11/gemini/shots/AG-02-governor-seat-iphone.png",
      "js/modules/governor-ui.js:350-373",
      "js/modules/achievements.js:59",
      "css/views/governor.css:518-523"
    ],
    summary: "Confirmed at 402x874 on slot 31 with screenshot and DOM geometry measurements. Equipping 3 showcase badges rendered three 80x80px medals (inline --m: 80px beating governor.css:521) at x=32, 80, 128 and y=580.3 (overlapping each other and the XP bar at y=569.4..587.4), while the empty .k-gv-arc-note (flex-basis: 100% in a nowrap row) crushed the remaining 3 empty slots to 17x44px ovals."
  },

  // 10. AP-01
  {
    id: "AP-01",
    step: "skepticA",
    method: "Parsed index.html in Node to count <script src> tags and summed on-disk byte sizes across all referenced local JS files and js/data/* files.",
    observed: "index.html contains 346 <script src> tags (342 synchronous parser-blocking scripts + 4 defer scripts in <head>). The 346 local scripts total 16,895,624 bytes (~16.89 MB decimal / 16.11 MiB), of which 154 files in js/data/ account for 9,950,250 bytes (9.95 MB, including 8.28 MB across 126 curriculum content files in js/data/content/).",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "index.html:49-56",
      "index.html:144-528"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AP-01",
    step: "skepticB",
    method: "Traced index.html:49-528, js/main.js:152-203, js/core/srs.js:410-441, sw.js:44-168, and CLAUDE.md:359-376.",
    observed: "All 342 body <script> tags in index.html:144-528 are synchronous and execute before js/main.js (line 528) renders the first view. While the no-bundler script-tag order is an architectural invariant (CLAUDE.md:359-372), loading all 126 curriculum content files (8.28 MB), exam-index.js (567 KB), and code-projects-files.js (383 KB) synchronously on boot forces the browser to parse and execute ~16.9 MB of JS before first paint on every reload or cold start.",
    evidence: [
      "index.html:49-56",
      "index.html:144-528",
      "js/main.js:152-203",
      "js/core/srs.js:410-441",
      "CLAUDE.md:359-376"
    ],
    contraryEvidence: "One dependency in the current boot path must be accounted for when lazy-loading content: KOS.srs.dueCount() (called at boot by KOS.governor.tick() and KOS.refreshRailCounters() in js/main.js:152, 203) calls KOS.srs.allCards() (js/core/srs.js:410-421), which iterates Object.keys(window.KOS_CONTENT) to count due curriculum flashcards.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AP-01",
    step: "final",
    title: "Boot loads ~16.6 MB of JavaScript in 340 synchronous script tags, most of it curriculum content no first view needs",
    area: "architecture-perf",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-13): every curriculum content file, exam index, and project scaffold was appended synchronously to index.html with no on-demand script loader.",
    fixHold: true,
    fixNote: "Agrees with lazy-loading js/data/content/*, exam-index.js, and code-projects-files.js via a manifest/script-injection loader in KOS.content, with one essential caveat from our Skeptic B trace: KOS.srs.dueCount() (js/core/srs.js:410-421) currently scans window.KOS_CONTENT on boot, so a lightweight card-id/count manifest is also required so dueCount() works before content scripts load.",
    alsoAffects: [
      "Cold start and reload latency across every route in index.html; KOS.srs.allCards() boot scan (js/core/srs.js:410-421)"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "index.html:49-56",
      "index.html:144-528",
      "js/main.js:152-203",
      "js/core/srs.js:410-421"
    ],
    summary: "Confirmed by parsing index.html and measuring all referenced script files on disk: index.html loads 346 <script src> tags (342 synchronous + 4 defer) totaling 16.89 MB of local JS, including 9.95 MB in js/data/ (8.28 MB across 126 content files). Our code trace also identified that KOS.srs.allCards() (js/core/srs.js:410-421) scans window.KOS_CONTENT during boot (main.js:152), which must be decoupled alongside lazy-loading KOS_CONTENT."
  },

  // 11. AX-01
  {
    id: "AX-01",
    step: "skepticA",
    method: "Sampled computed fontSize on 137 visible <input>, <select>, and <textarea> controls across 6 views on slot 31 at iphone (402x874).",
    observed: "135 of 137 sampled form controls (98.5%) computed to a font-size strictly under 16px at 402x874: e.g. .k-search-input (14px), .k-spine-filter (13px), .k-rem-quick-in (14px), .k-rem-quick-list (11px), .k-pill-select (12.5px). Only special-cased fields like [data-ui='money.first-currency'] and .k-msearch computed to 16px.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "css/tokens.css:35",
      "css/base.css:156-160",
      "css/components.css:414-427"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AX-01",
    step: "skepticB",
    method: "Traced CLAUDE.md:445-455 (Invariant 40), css/tokens.css:35, css/base.css:156-160, css/components.css:414-427, 639-670, css/layout.css:61, 462, and view stylesheets.",
    observed: "css/base.css:156-160 declares @media (max-width: 700px) { input, select, textarea { font-size: max(var(--fs-16), 1em); } } inside @layer base. Because css/tokens.css:35 orders layers as @layer tokens, base, layout, components, views, themes, every font-size declaration in @layer layout (.k-search-input 14px), @layer components (.k-input 13.5px, .k-pill-select 12.5px), and @layer views (.k-asst-input 14.5px, .k-mind-input 15px, .k-lab input 13px) unconditionally overrides @layer base.",
    evidence: [
      "CLAUDE.md:445-455",
      "css/tokens.css:35",
      "css/base.css:156-160",
      "css/components.css:414-427",
      "css/layout.css:61",
      "css/views/assistant.css:206-216"
    ],
    contraryEvidence: "A few isolated selectors added local 700px overrides in later layers (.k-msheet .k-search-input in layout.css:462, .k-mn .k-input in money.css:385, .k-gl .k-input in goals.css:241, .k-msheet-slot > .k-pill-select in collection.css:80 and productivity.css:333, and .k-cx-ed-ta in code.css:692-700). Smoke tests (smoke18.test.js:151, smoke42.test.js:159) only grepped base.css text and missed the layer cascade override.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "AX-01",
    step: "final",
    title: "iPhone: most text fields and selects are under 16px, so iOS Safari zooms the page on every focus",
    area: "a11y-hci",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-04): the <=700px 16px input guard in css/base.css:156-160 sits in @layer base, which is beaten by every class rule in @layer layout, @layer components, and @layer views.",
    fixHold: true,
    fixNote: "Agrees with enforcing the <=700px 16px minimum in the highest layer (or updating the component/view font-size tokens at <=700px) and adding a computed-style check in the responsive audit.",
    alsoAffects: [
      "Almost all <input>, <select>, and <textarea> controls across Study, Productivity, Collection, Governor, Assistant, and Archive on viewports <=700px"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "CLAUDE.md:445-455",
      "css/tokens.css:35",
      "css/base.css:156-160",
      "css/components.css:414-427"
    ],
    summary: "Confirmed at 402x874 on slot 31 and via CSS cascade layer trace. 135 of 137 sampled form controls across 6 views computed to 11px–14.5px because css/base.css:156-160 sits in @layer base, which loses to .k-input (13.5px) and .k-pill-select (12.5px) in @layer components and view-layer rules, violating CLAUDE.md Invariant 40 and triggering iOS Safari auto-zoom on focus."
  },

  // 12. CC-01
  {
    id: "CC-01",
    step: "skepticA",
    method: "Scanned all leaves in js/data/it.js in Node for strings >300 chars and 'include:' prefixes, and checked runtime rendering against js/data/it-f201-spec.js and js/modules/hub.js.",
    observed: "In js/data/it.js, 6 leaves have multi-hundred/thousand-character assessment dumps (F200.5.3 maxLen 876, F201.5.2 maxLen 831, F202.5.1 maxLen 2502, F204.6.5 maxLen 2510, and both F206.6.1 leaves maxLen 2884 and 1126), and 8 leaves have info[0] starting with a dangling 'include:'. However, at runtime js/data/it-f201-spec.js (loaded in index.html:147) overrides leaf.content and leaf.info for all F201 leaves (including F201.5.2, F201.2.3, F201.2.4, F201.2.6) in js/modules/hub.js:39-42.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "js/data/it.js:509-537",
      "js/data/it.js:914-944",
      "js/data/it.js:1454-1484",
      "js/data/it.js:1909-1929",
      "js/data/it.js:2246-2297",
      "js/data/it-f201-spec.js:1-175",
      "js/modules/hub.js:39-50"
    ],
    preliminaryVerdict: "partially-confirmed"
  },
  {
    id: "CC-01",
    step: "skepticB",
    method: "Traced tools/parse_it.py:21-95, js/data/it.js, js/data/it-f201-spec.js:1-175, index.html:147, and js/modules/hub.js:35-55, 2936-2964.",
    observed: "tools/parse_it.py:25 checks for '^6\\s+Assessment for' (which does not match '6 Assessment and grading') and never stops at 'Assessment criteria' or 'Synoptic assessment', dumping trailing unit tables into the last leaf of each unit in js/data/it.js and mis-splitting two-column 'To include' boxes at page.width * 0.52. However, Claude's finding missed that js/data/it-f201-spec.js (window.KOS_SPEC_FIX) already patches all 15 F201 leaves at boot (js/modules/hub.js:39-42) before rendering the Spec tab, although hub.js:49 still indexes the unpatched node.content/node.info into SEARCH_INDEX! For F200, F202, F204, and F206, no KOS_SPEC_FIX exists, so their Spec tabs render the garbled dumps directly.",
    evidence: [
      "tools/parse_it.py:21-95",
      "js/data/it.js:509-537",
      "js/data/it.js:914-944",
      "js/data/it.js:1454-1484",
      "js/data/it.js:1909-1929",
      "js/data/it.js:2246-2297",
      "js/data/it-f201-spec.js:159-167",
      "js/modules/hub.js:39-50"
    ],
    contraryEvidence: "In the live UI, F201.5.2, F201.2.3, F201.2.4, and F201.2.6 do NOT display the raw js/data/it.js dumps on the Spec tab because js/data/it-f201-spec.js (window.KOS_SPEC_FIX) replaces leaf.content and leaf.info for all F201 leaves at js/modules/hub.js:39-42.",
    preliminaryVerdict: "partially-confirmed"
  },
  {
    id: "CC-01",
    step: "final",
    title: "IT spec text for F206.6.1, F204.6.5, F202.5.1, F201.5.2, F200.5.3 (and F200.2.x/F202.2.x) holds garbled PDF dumps of the assessment criteria",
    area: "content-cs-it",
    claudeSeverity: "P1",
    verdict: "partially-confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-07) for tools/parse_it.py and js/data/it.js, but refines runtime scope: js/data/it-f201-spec.js (KOS_SPEC_FIX) already patches all F201 leaves on the Spec tab at boot (hub.js:39-42), whereas F200, F202, F204, and F206 remain unpatched in the UI (and hub.js:49 still indexes raw node.content/info before applying KOS_SPEC_FIX).",
    fixHold: true,
    fixNote: "Agrees with fixing tools/parse_it.py and regenerating js/data/it.js (so KOS_SPEC_FIX is no longer needed as a partial band-aid and SEARCH_INDEX gets clean text).",
    alsoAffects: [
      "Global search index (js/modules/hub.js:49 indexes node.content/info on line 49 using the raw local variable 'node', even though lines 39-42 mutated node.content/info, wait — for F201 it mutates node first, for F200/F202/F204/F206 it indexes the garbled dumps)"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "tools/parse_it.py:21-95",
      "js/data/it.js:509-537",
      "js/data/it.js:914-944",
      "js/data/it.js:1454-1484",
      "js/data/it.js:1909-1929",
      "js/data/it.js:2246-2297",
      "js/data/it-f201-spec.js:1-175",
      "js/modules/hub.js:39-50"
    ],
    summary: "Partially confirmed: js/data/it.js indeed contains the garbled multi-thousand-character PDF dumps on F206.6.1, F204.6.5, F202.5.1, F201.5.2, and F200.5.3 and 'include:' fragments on F200.2.x/F202.2.x. However, Claude missed that js/data/it-f201-spec.js (window.KOS_SPEC_FIX, applied in js/modules/hub.js:39-42) already overrides all F201 leaves (including F201.5.2, F201.2.3, F201.2.6) at runtime; F200, F202, F204, and F206 have no override and display the corrupted dumps on the Spec tab."
  },

  // 13. CC-02
  {
    id: "CC-02",
    step: "skepticA",
    method: "Inspected KOS_DATA.it in Node and verified the duplicate F206.6.1 entries ('Ways to reflect' and 'Overview of the assessment') and F201.5.3 ('NEA Units').",
    observed: "In js/data/it.js, F206.TA6.children contains two leaves with ref 'F206.6.1': 'Ways to reflect' (line 2246) and 'Overview of the assessment' (line 2285). In js/modules/hub.js:45, BYREF['it']['F206.6.1'] = leaf overwrites the first with the second, so opening F206.6.1 always resolves to 'Overview of the assessment'.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "js/data/it.js:2246-2297",
      "js/data/it.js:946-950",
      "js/modules/hub.js:35-55"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CC-02",
    step: "skepticB",
    method: "Traced tools/parse_it.py:7, 25, 68-74, js/data/it.js:946-950, 2246-2297, js/modules/hub.js:35-55, 551-571, 2366-2370, and js/core/spec.js:90-105.",
    observed: "Because tools/parse_it.py:25 failed to stop at Section 6 ('6 Assessment and grading'), section '6.1 Overview of the assessment' matched SUB_RE ('^(\\d+\\.\\d+)\\.?\\s+(.+)$') while cur_unit was F206 and cur_ta was TA6, generating a second leaf with ref 'F206.6.1'. Both hub.js (BYREF['it']['F206.6.1']) and spec.js (ix.byRef['F206.6.1']) overwrite the genuine 'Ways to reflect' leaf with 'Overview of the assessment', while pushing both into LEAVES['it'] and F206.TA6.children.",
    evidence: [
      "tools/parse_it.py:7",
      "tools/parse_it.py:25",
      "tools/parse_it.py:68-74",
      "js/data/it.js:2246-2297",
      "js/modules/hub.js:44-45",
      "js/core/spec.js:93-104"
    ],
    contraryEvidence: "The authored content in js/data/content/it-f206-6.js:4 (KOS_CONTENT['it:F206.6.1']) is written for 'Ways to reflect' and loads under the 'Overview of the assessment' header/spec, but the genuine 'Ways to reflect' title and spec are unreachable and F206's leaf count is inflated by 1.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CC-02",
    step: "final",
    title: "IT spec has a duplicate leaf: F206.6.1 'Ways to reflect' and 'Overview of the assessment' share a ref, so 'Ways to reflect' cannot be opened",
    area: "content-cs-it",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-07): tools/parse_it.py:25 missed Section 6 ('6 Assessment and grading'), so '6.1 Overview of the assessment' matched SUB_RE under F206.TA6 and produced a second F206.6.1 leaf.",
    fixHold: true,
    fixNote: "Agrees with stopping parse_it.py before Section 6, dropping non-topic nodes ('Overview of the assessment', 'NEA Units' F201.5.3), and asserting unique refs in tools/gen_data.py.",
    alsoAffects: [
      "KOS.spec index (js/core/spec.js:93-104) and IT F206 leaf counts / progress denominator"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "tools/parse_it.py:25",
      "tools/parse_it.py:68-74",
      "js/data/it.js:946-950",
      "js/data/it.js:2246-2297",
      "js/modules/hub.js:44-45",
      "js/core/spec.js:93-104"
    ],
    summary: "Confirmed by inspecting js/data/it.js, tools/parse_it.py, and js/modules/hub.js. F206.TA6.children contains two leaves with ref 'F206.6.1' ('Ways to reflect' at line 2246 and 'Overview of the assessment' at line 2285); BYREF['it']['F206.6.1'] and KOS.spec overwrite the first with the second, making 'Ways to reflect's title and spec unreachable and inflating F206's leaf count."
  },

  // 14. CC-03
  {
    id: "CC-03",
    step: "skepticA",
    method: "Evaluated the answer-index distribution across all loaded CS and IT leaves in slot 31 (KOS.hub.LEAVES + KOS.content.get) and inspected js/engines/quiz.js.",
    observed: "Across all 1,347 CS quiz questions, the correct index counts are [677, 590, 68, 12] — 94.1% (1,267/1,347) are A or B, and D is only 12/1,347 (0.89%). Across IT's 288 questions, counts are [17, 211, 57, 3] (79.2% A or B, 73.3% B alone). In js/engines/quiz.js:88-98, item.opts are rendered in static authored order 0..3.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/engines/quiz.js:66",
      "js/engines/quiz.js:88-98"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CC-03",
    step: "skepticB",
    method: "Scanned all 56 CS topic files (cs-p1-*.js, cs-p2-*.js) and 3 CS bank files (bank-cs*.js) and traced js/engines/quiz.js:30-165 and js/core/code.js:413-425.",
    observed: "All 536 questions across the 56 core CS topic files have ans: 0 (100% Option A), and combined with the bank files, 1,267 of 1,347 CS questions (94.06%) are A or B. KOS.quiz.mountMCQ (js/engines/quiz.js:66, 89) only shuffles question order when Order === 'Shuffled' and never permutes item.opts.",
    evidence: [
      "js/engines/quiz.js:59-66",
      "js/engines/quiz.js:88-98",
      "js/engines/quiz.js:152-155",
      "js/core/code.js:413-425"
    ],
    contraryEvidence: "Important caller dependency found: KOS.code.gradeCapstone (js/core/code.js:413-425) grades MCQ capstones via opts.onFinish(picks, correct) by comparing picks[i] === q.ans against the original item.ans. Therefore, shuffling option display order in quiz.js must map the chosen display option back to its canonical option index in answered[qi] so capstone grading does not break.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CC-03",
    step: "final",
    title: "Quiz answers are guessable: the correct option is A or B in 94% of CS questions (D only 12 of 1,347) and options are never shuffled",
    area: "content-cs-it",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-12): authored questions overwhelmingly place the correct answer at index 0 or 1 (100% index 0 in core cs-p1/p2 topic files) and KOS.quiz.mountMCQ never permutes options.",
    fixHold: true,
    fixNote: "Agrees with permuting options at render time in KOS.quiz.mountMCQ and trimming longest-option bias, with a critical safeguard from our Skeptic B trace: answered[qi] passed to opts.onFinish(picks, correct) (quiz.js:152-155) must record the canonical option index because KOS.code.gradeCapstone (js/core/code.js:413-425) checks picks[i] === q.ans.",
    alsoAffects: [
      "Maths quizzes (CM-02: 95.7% A or B), IT quizzes (79.2% A or B), and Code quizzes (87.5% A or B across 598 questions)"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/engines/quiz.js:66",
      "js/engines/quiz.js:88-98",
      "js/engines/quiz.js:152-155",
      "js/core/code.js:413-425"
    ],
    summary: "Confirmed in runtime on slot 31 and across all CS/IT content files: CS quiz answers are [677, 590, 68, 12] (94.1% A or B; 536/536 in core CS topic files are A) and KOS.quiz.mountMCQ (js/engines/quiz.js:88-98) never shuffles options. When implementing option permutation in quiz.js, answered[qi] must map back to the canonical option index so KOS.code.gradeCapstone (js/core/code.js:413-425) continues to grade accurately."
  },

  // 15. CC-04
  {
    id: "CC-04",
    step: "skepticA",
    method: "Opened #/ref/compsci/4.6.4.1 page 4 (index 3) on slot 31 at iphone (402x874), scrolled to the first worked example, measured bounding rects of .k-n-worked-title and .k-n-writeout, and captured screenshot.",
    observed: "On the worked example 'The bottle-filling conveyor', the title span (.k-n-worked-title) occupied x=120.4..297.1, y=106.9..129.3, while the absolutely positioned 'Write it out' button (.k-n-writeout) occupied x=233.1..314.0, y=98.9..122.0 (80.9x23.2px), rendering directly on top of the word 'conveyor' (64px horizontal overlap) and violating the 44px coarse-pointer touch height.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CC-04-worked-overlap-iphone.png",
      "css/views/ink.css:300-302",
      "css/views/study.css:345-351",
      "js/core/content.js:358-383"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CC-04",
    step: "skepticB",
    method: "Traced js/core/content.js:358-383, css/views/ink.css:300-302, and css/views/study.css:279-292, 345-351; checked CLAUDE.md Invariants 52, 69, and 134.",
    observed: "In css/views/ink.css:300, .k-n-writeout is positioned with position: absolute; inset-block-start: var(--sp-8); inset-inline-end: calc(var(--sp-8) * 9); (top: 8px; right: 72px), while .k-n-worked-head (css/views/study.css:348) has no padding-inline-end to reserve space for .k-n-writeout or .k-n-copy. Any multi-step worked example whose header text reaches within 156px of the card's right edge (or has a .k-n-worked-src pushed right by margin-inline-start: auto at study.css:351) is overlapped by .k-n-writeout.",
    evidence: [
      "js/core/content.js:358-383",
      "css/views/ink.css:300-302",
      "css/views/study.css:345-351"
    ],
    contraryEvidence: "Single-step worked examples ((w.steps || []).length <= 1, content.js:372) do not mount .k-n-writeout.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CC-04",
    step: "final",
    title: "'Write it out' pill on worked examples overlaps the example's title on iPhone and iPad",
    area: "content-cs-it",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause: .k-n-writeout (css/views/ink.css:300) uses position: absolute with a fixed top-right inset while .k-n-worked-head reserves no inline-end space.",
    fixHold: true,
    fixNote: "Agrees with moving .k-n-writeout (and .k-n-copy) into the flex header row of .k-n-worked-head and giving it a 44px touch target on coarse pointers.",
    alsoAffects: [
      "Multi-step worked examples across CS, Maths, and IT on iPhone, iPad, and desktop (especially when .k-n-worked-src is present with margin-inline-start: auto)"
    ],
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CC-04-worked-overlap-iphone.png",
      "js/core/content.js:358-383",
      "css/views/ink.css:300-302",
      "css/views/study.css:345-351"
    ],
    summary: "Confirmed at 402x874 on slot 31 with screenshot and bounding-box measurements on #/ref/compsci/4.6.4.1 page 4. On 'The bottle-filling conveyor', the absolutely positioned .k-n-writeout pill (x=233.1..314.0, y=98.9..122.0, 81x23px) sits directly over the title text (x=120.4..297.1, y=106.9..129.3) because .k-n-worked-head reserves no right-hand space."
  },

  // 16. CL-01
  {
    id: "CL-01",
    step: "skepticA",
    method: "Navigated to #/anime on slot 31 at ipad (820x1180), measured .k-subnav-scroller, #subnav, and .k-seg scrollWidth vs clientWidth, and captured screenshot.",
    observed: "At 820x1180, #subnav had clientWidth = 716 and scrollWidth = 716, so .k-subnav-scroller had data-state='at-start at-end no-scroll' (no scroll arrows or edge fades). Inside #subnav, .k-seg was squeezed to clientWidth = 408 while its scrollWidth was 485, clipping the 5th button ('Games') off the right edge of the pill group with scrollbar-width: none.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CL-01-collection-subnav-ipad.png",
      "docs/audit/2026-11/gemini/evidence/batch1-followup.json",
      "css/components.css:52",
      "css/components.css:80",
      "js/modules/mobile-shell.js:70-125"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CL-01",
    step: "skepticB",
    method: "Traced js/core/ui.js:470-480, 562-578, css/components.css:52-85, and js/modules/mobile-shell.js:70-137; checked CLAUDE.md Invariants 50 and 72.",
    observed: "In css/components.css:52, .k-seg sets overflow-x: auto; max-inline-size: 100%; scrollbar-width: none;. Under CSS Flexbox, an overflow-x: auto flex item inside .k-subnav (display: flex, components.css:80) has an automatic minimum size of 0 and flex-shrink: 1, so .k-seg shrinks by 77px to fit inside the 716px #subnav instead of allowing #subnav to overflow its outer .k-subnav-scroller wrapper.",
    evidence: [
      "js/core/ui.js:470-480",
      "js/core/ui.js:562-578",
      "css/components.css:52",
      "css/components.css:80",
      "js/modules/mobile-shell.js:70-137"
    ],
    contraryEvidence: "Look at CO-01-code-stagepath-ipad.png as well: the exact same bug also clips 'Creatives' in the Study section strip (#/subject/code at 820x1180 shows 'Code | Japanese | Mind | Cre' clipped inside .k-seg with no scroller arrows)!",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CL-01",
    step: "final",
    title: "Collection section strip hides the Games vault on iPad portrait (inner pill group scrolls invisibly)",
    area: "collection",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-01): .k-seg's overflow-x: auto (css/components.css:52) gives it min-width: 0 inside flex container .k-subnav (components.css:80), so .k-seg shrinks and clips internally while .k-subnav-scroller sees 0 overflow.",
    fixHold: true,
    fixNote: "Agrees with setting .k-subnav > .k-seg { flex: 0 0 auto; overflow-x: visible; max-inline-size: none; } so the outer .k-subnav-scroller owns horizontal scrolling and displays its arrows/fades.",
    alsoAffects: [
      "Study section strip on iPad portrait 820x1180 (visible in audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png, where 'Creatives' is clipped to 'Cre' inside .k-seg with no scroll affordance)"
    ],
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CL-01-collection-subnav-ipad.png",
      "audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png",
      "docs/audit/2026-11/gemini/evidence/batch1-followup.json",
      "css/components.css:52",
      "css/components.css:80",
      "js/modules/mobile-shell.js:70-137"
    ],
    summary: "Confirmed at 820x1180 on slot 31 with screenshot and DOM measurements: #subnav has clientWidth = scrollWidth = 716 (.k-subnav-scroller state 'at-start at-end no-scroll'), while .k-seg shrinks to 408px of its 485px scrollWidth and hides 'Games' with no scrollbar or arrow. We also confirmed the identical bug on the Study section strip at 820x1180 (CO-01-code-stagepath-ipad.png), where 'Creatives' is clipped to 'Cre'."
  },

  // 17. CM-01
  {
    id: "CM-01",
    step: "skepticA",
    method: "Scanned all 89 leaves in js/data/maths.js in Node for 'need to learn' table headers, broken formula tokens, and M7.3 content/info strings.",
    observed: "Across the 89 leaves in js/data/maths.js, 24 leaves still contain 'need to learn:' or 'students need to learn:', and M7.3 ('ref': 'M7.3', title '7.3 Use of kinematics formulae...') has content[1] = 'v = u + at r = ut +1at2' and info = ['e.g. , with vectors', '2 given in i - j or column vector form.'], where the denominator '2' of 1/2 at^2 was split into the next line of the right-hand column.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "js/data/maths.js:1287-1300",
      "tools/parse_maths.py:13-59",
      "js/modules/hub.js:2936-2964"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CM-01",
    step: "skepticB",
    method: "Traced tools/parse_maths.py:13-59, tools/gen_data.py:240-305, js/data/maths.js, and js/modules/hub.js:2936-2964; checked CLAUDE.md Invariant 24.",
    observed: "tools/parse_maths.py buckets PDF words by round(w['top'] / 4) and splits columns at x0 = 235, which tears apart vertical fractions, superscripts/subscripts, and Symbol-font glyphs across >50 of the 89 Maths leaves, and only strips the first line of 'What students need to learn:' across page breaks. Additionally, tools/gen_data.py:297-302 keyed SHORT_S by bare '6.1'..'9.1', leaving M7.3, M7.4, M8.3–M8.6 with raw multi-line PDF titles and overwriting M6.x/M7.1/M7.2/M8.1/M8.2 with Statistics short titles where numbers collided.",
    evidence: [
      "tools/parse_maths.py:13-59",
      "tools/gen_data.py:297-302",
      "js/data/maths.js:40-128",
      "js/data/maths.js:1287-1300",
      "js/modules/hub.js:2936-2964"
    ],
    contraryEvidence: "The default Notes tab on Maths leaves renders hand-authored KaTeX content from js/data/content/maths-*.js; the garbled js/data/maths.js strings appear when clicking the Specification tab (hub.js:2936-2964) and in global search (hub.js:49), plus M7.3/M7.4/M8.3-M8.6 raw titles appear in the spine and page header.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CM-01",
    step: "final",
    title: "Specification tab shows garbled PDF-extraction text on most Maths leaves (M7.3 included)",
    area: "content-maths",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-07): tools/parse_maths.py's 4pt y-bucket PDF extraction splits 2D math notation across lines and leaves 'need to learn:' artefacts in 24 of 89 leaves.",
    fixHold: true,
    fixNote: "Agrees with providing clean typeset/LaTeX spec text for the 89 Maths leaves via a checked-in override table in tools/gen_data.py (like it-f201-spec.js or SHORT) and fixing SHORT_S key collisions for M6.x–M8.x in tools/gen_data.py:297-302.",
    alsoAffects: [
      "Mechanics leaf titles in tools/gen_data.py:297-302 (SHORT_S keyed by bare '6.1'..'9.1' instead of 'S6.1'/'M6.1')",
      "Global search index (js/modules/hub.js:49)"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-node.json",
      "tools/parse_maths.py:13-59",
      "tools/gen_data.py:297-302",
      "js/data/maths.js:1287-1300",
      "js/modules/hub.js:2936-2964"
    ],
    summary: "Confirmed by scanning js/data/maths.js and tracing tools/parse_maths.py and tools/gen_data.py. M7.3's spec text splits 1/2 at^2 across columns ('v = u + at r = ut +1at2' / '2 given in i - j or column vector form.'), 24 of 89 leaves retain 'need to learn:' header fragments, and >50 leaves have torn equations on the Specification tab."
  },

  // 18. CM-02
  {
    id: "CM-02",
    step: "skepticA",
    method: "Evaluated the quiz answer-index distribution across all 89 Maths leaves on slot 31 (KOS.hub.LEAVES.maths + KOS.content.get).",
    observed: "Across all 1,058 Maths quiz items, the correct answer counts are [531, 481, 44, 2] — 95.7% (1,012/1,058) are A or B, while C is 4.2% (44) and D is 0.19% (2).",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/engines/quiz.js:66",
      "js/engines/quiz.js:88-98"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CM-02",
    step: "skepticB",
    method: "Scanned all 89 core Maths content files (js/data/content/maths-*.js) and 3 Maths bank files (js/data/content/bank-maths*.js) and traced js/engines/quiz.js:30-165.",
    observed: "Across the 89 core Maths files (620 questions), A=294 and B=320 (99.03% A or B; C=6, D=0); across the combined 1,058 questions, A=531 and B=481 (95.65% A or B). KOS.quiz.mountMCQ (js/engines/quiz.js:88-98) renders options in static authored order 0..3.",
    evidence: [
      "js/engines/quiz.js:59-66",
      "js/engines/quiz.js:88-98",
      "js/data/content/maths-mech-m7.js:305-306"
    ],
    contraryEvidence: "Same shared-engine note as CC-03: option shuffling in KOS.quiz.mountMCQ must map the user's pick back to the canonical option index in answered[qi] so callers of opts.onFinish(picks, correct) remain valid.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CM-02",
    step: "final",
    title: "Quiz answers are almost always A or B, and options are never shuffled",
    area: "content-maths",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-12): 95.65% of Maths MCQ items (and 99.03% of core topic items) author the correct answer at index 0 or 1, and KOS.quiz.mountMCQ never permutes options.",
    fixHold: true,
    fixNote: "Agrees with shuffling option display order per question in KOS.quiz.mountMCQ while recording canonical option indices in answered[qi].",
    alsoAffects: [
      "CS quizzes (CC-03: 94.1% A or B), IT quizzes (79.2% A or B), and Code quizzes (87.5% A or B)"
    ],
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch1-runtime.json",
      "js/engines/quiz.js:66",
      "js/engines/quiz.js:88-98"
    ],
    summary: "Confirmed in runtime on slot 31 and across all Maths content files: of 1,058 Maths MCQ items, 531 are A, 481 are B, 44 are C, and only 2 are D (95.7% A or B), and KOS.quiz.mountMCQ renders item.opts in fixed authored order."
  },

  // 19. CO-01
  {
    id: "CO-01",
    step: "skepticA",
    method: "Navigated to #/subject/code on slot 31 at ipad (820x1180, pointer: coarse) and iphone (402x874, pointer: coarse), measured offsetWidth/offsetHeight/transform of button.k-cx-sq and button.k-cx-dia, and captured screenshots.",
    observed: "At both iPad and iPhone viewports, every unit button (button.k-cx-sq) measured 28x44px (minBlockSize: '44px') instead of 28x28px, and every capstone button (button.k-cx-dia) measured offsetWidth: 16, offsetHeight: 44 rotated 45deg (bounding box 42.4x42.4px), rendering as a skewed diagonal slash.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png",
      "audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch1-followup.json",
      "css/base.css:115-121",
      "css/views/code.css:132-146"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CO-01",
    step: "skepticB",
    method: "Traced CLAUDE.md:691-696 (Invariant 69), css/base.css:115-121, js/core/codeui.js:556-571, and css/views/code.css:132-146, 498-502, 722-723, 768-773.",
    observed: "css/base.css:115-121 sets min-block-size: var(--hit-coarse) (44px) on all buttons under @media (pointer: coarse). In js/core/codeui.js:556-571, stagePath() renders unit stops as <button class='k-cx-sq'> (inline-size/block-size: 28px or 32px) and released capstones as <button class='k-cx-dia'> (inline-size/block-size: 16px or 20px, transform: rotate(45deg)). Because css/views/code.css:768-773 (@media (pointer: coarse)) omitted .k-cx-sq and .k-cx-dia, min-block-size: 44px stretches their height without raising their width — the exact failure mode warned against in CLAUDE.md Invariant 69.",
    evidence: [
      "CLAUDE.md:691-696",
      "css/base.css:115-121",
      "js/core/codeui.js:556-571",
      "css/views/code.css:132-146",
      "css/views/code.css:768-773"
    ],
    contraryEvidence: "Unreleased capstones (!KOS.code.capstone(cid) in codeui.js:570-571) render as <span class='k-cx-dia' role='img'> rather than <button>, so they stay 16x16 diamonds right next to the 16x44 skewed <button class='k-cx-dia'> slashes (both visible side by side in CO-01-code-stagepath-ipad.png).",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CO-01",
    step: "final",
    title: "Stage path on touch devices: unit squares become 28x44 bars and capstone diamonds render as skewed slashes",
    area: "code-space",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause (RC-05): css/base.css:115-121 applies min-block-size: 44px to every <button> on coarse pointers while .k-cx-sq and .k-cx-dia keep fixed 28px/16px inline-size and rotate 45deg (violating Invariant 69).",
    fixHold: true,
    fixNote: "Agrees with setting min-block-size: 0 on .k-cx-sq and .k-cx-dia and providing the 44x44 coarse touch target via a centered ::before pseudo-element.",
    alsoAffects: [
      "Full stage path on #/code/map (o.spread in js/core/codeui.js:533-572, where .k-cx-sq is 32x44 and .k-cx-dia is 20x44 rotated 45deg on touch devices)"
    ],
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png",
      "audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch1-followup.json",
      "CLAUDE.md:691-696",
      "css/base.css:115-121",
      "js/core/codeui.js:556-571",
      "css/views/code.css:132-146"
    ],
    summary: "Confirmed on slot 31 at iPad (820x1180) and iPhone (402x874) with screenshots and DOM measurements. Because css/base.css:115-121 sets min-block-size: 44px on <button> under (pointer: coarse), unit squares (.k-cx-sq) stretch to 28x44px vertical bars and released capstone buttons (.k-cx-dia) stretch to 16x44px rectangles rotated 45deg (rendering as diagonal slashes right beside the unstretched 16x16 <span> capstones)."
  },

  // 20. CO-02
  {
    id: "CO-02",
    step: "skepticA",
    method: "Marked Code lesson 1.1 as seen on slot 31, navigated to #/subject/code at iphone (402x874), measured .k-subj-side, [data-ui='code.daily20'], and [data-ui='code.daily20-lesson'], and captured screenshot.",
    observed: "At 402x874, .k-subj-side computed to gridTemplateColumns: '180px 180px', squeezing Daily 20 (width 180px, height 231.5px) and Continue side by side. Inside Daily 20, the button [data-ui='code.daily20-lesson'] ('Open 1.1 Your first program') had clientWidth: 144 and scrollWidth: 153 with white-space: nowrap, causing the label text to spill outside both edges of the pill border.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch1-clean.json",
      "js/modules/code.js:124-126",
      "js/modules/code.js:220-224",
      "css/views/study.css:1074-1076",
      "css/views/study.css:1169"
    ],
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CO-02",
    step: "skepticB",
    method: "Traced js/modules/code.js:124-126, 180-226, css/views/study.css:1073-1077, 1169-1171, css/views/code.css:55-68, 704-766, css/views/japanese.css:449, and css/views/creatives.css:366.",
    observed: "At <=1080px (study.css:1074, flex row) and <=700px (study.css:1169, grid-template-columns: repeat(2, minmax(0, 1fr))), .k-subj-side lays out its children in 2 equal columns. While Japanese (japanese.css:449) and Creatives (creatives.css:366) override .k-subj-side to 1 column (minmax(0, 1fr)) at <=700px, css/views/code.css has no <=700px override for .k-cx-hero + .k-subj-side. Inside the 180px-wide Daily 20 card, [data-ui='code.daily20-lesson'] (code.js:221) is a .k-btn (white-space: nowrap, no .k-fit-btn or overflow: hidden) stretched to 144px wide, so its 153px label overflows the pill border.",
    evidence: [
      "js/modules/code.js:124-126",
      "js/modules/code.js:220-224",
      "css/views/study.css:1074-1076",
      "css/views/study.css:1169",
      "css/views/code.css:55-68",
      "css/views/japanese.css:449",
      "css/views/creatives.css:366"
    ],
    contraryEvidence: "None — even on a first visit before any lesson is touched (CO-01-code-stagepath-ipad.png vs iphone), .k-subj-side's 2-column grid at <=700px traps the side card(s) in 180px columns.",
    preliminaryVerdict: "confirmed"
  },
  {
    id: "CO-02",
    step: "final",
    title: "iPhone desk: Daily 20 and Continue squeezed side by side; the Open-lesson button's label spills out of its pill",
    area: "code-space",
    claudeSeverity: "P1",
    verdict: "confirmed",
    geminiSeverity: "P1",
    confidence: "high",
    rootCauseHold: true,
    rootCauseNote: "Agrees with Claude's root cause: css/views/study.css:1074,1169 places .k-subj-side in a 2-column layout on phones (unlike japanese.css:449 and creatives.css:366 which override it to 1 column at <=700px), and [data-ui='code.daily20-lesson'] uses .k-btn (white-space: nowrap) without .k-fit-btn.",
    fixHold: true,
    fixNote: "Agrees with overriding .k-cx-hero + .k-subj-side (and .k-mind-hero + .k-subj-side) to a single column at <=700px and adding .k-fit-btn to [data-ui='code.daily20-lesson'].",
    alsoAffects: [
      "Mind desk on iPhone (css/views/mind.css also uses .k-mind-hero + .k-subj-side with daily15Card() and continueCard() without a <=700px 1-column override)"
    ],
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch1-clean.json",
      "js/modules/code.js:124-126",
      "js/modules/code.js:220-224",
      "css/views/study.css:1074-1076",
      "css/views/study.css:1169",
      "css/views/japanese.css:449",
      "css/views/creatives.css:366"
    ],
    summary: "Confirmed at 402x874 on slot 31 with screenshot (CO-02-code-desk-iphone.png) and DOM measurements. Because css/views/code.css lacks the <=700px single-column .k-subj-side override present in japanese.css:449 and creatives.css:366, Daily 20 and Continue are squeezed into two 180px columns and the 'Open 1.1 Your first program' button (scrollWidth 153px vs clientWidth 144px) overflows both sides of its pill border."
  }
];

const lines = records.map(r => JSON.stringify(r)).join('\n') + '\n';
fs.appendFileSync('docs/audit/2026-11/gemini/p0p1-verification.jsonl', lines);
console.log('Appended', records.length, 'lines to p0p1-verification.jsonl');
