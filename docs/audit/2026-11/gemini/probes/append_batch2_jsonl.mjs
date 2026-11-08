import fs from "node:fs";

const records = [
  // 21. CO-03
  {
    id: "CO-03",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Marked task '1.1-box' passed in slot 31 so KOS.code.planDay().task is populated, navigated to #/subject/code at mac (1470x832), measured .k-subj-side, .k-cx-d20, and .k-subj-next rects, and captured screenshot.",
    observed: "At 1470x832 on #/subject/code, .k-subj-side is locked to the hero height (292px). The first child (.k-cx-d20) renders at 239.125px tall (flex: 1 1 auto), crushing the second child (.k-subj-next Continue card, flex: 1 1 0; overflow: hidden) to 40.875px tall (clientHeight 41 vs scrollHeight 62). Inside .k-subj-next, .k-subj-next-txt is 51.25px tall (top 388.19 vs button top 393.38), clipping the top half of the 'CONTINUE' kicker.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CO-03-code-continue-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "css/views/study.css:50",
      "css/views/study.css:54-56"
    ],
    contraryEvidence: "When Daily 20 is in its locked state (!plan.task, before any lesson is covered), .k-cx-d20 is shorter (219.5px) and .k-subj-next is 60.5px tall (clientHeight 61 == scrollHeight 61), so clipping only happens once a real Daily 20 task is active.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "css/views/study.css:54-56 (.k-ja-hero, .k-mind-hero, .k-cr-hero + .k-subj-side)"
    ]
  },
  {
    id: "CO-03",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/code.js:116-288, css/views/study.css:1-120,1065-1190, and css/views/code.css:1-120; checked CLAUDE.md responsive and desk layout rules.",
    observed: "css/views/study.css:54-55 sets .k-subj-hero:is(.k-cx-hero, .k-ja-hero, .k-mind-hero, .k-cr-hero) + .k-subj-side { contain: size; min-block-size: 0; } and > * { min-block-size: 0; overflow: hidden; }, while line 50 gives .k-subj-side > :first-child flex: 1 1 auto and line 56 gives .k-subj-next flex: 1 1 0. When daily20Card renders a live task (5 stacked rows + padding), its auto flex-basis consumes ~239px of the 292px size-contained column, leaving ~41px for .k-subj-next.",
    evidence: [
      "js/modules/code.js:124-126",
      "js/modules/code.js:209-250",
      "js/modules/code.js:264-283",
      "css/views/study.css:48-56",
      "css/views/study.css:1073-1076"
    ],
    contraryEvidence: "At @media (max-width: 1080px) (css/views/study.css:1073-1076), .k-subj-side switches to a 2-column row with contain: none and > * { flex: 1 1 0 }, so iPad portrait (820px) and iPhone (402px) are unaffected.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/modules/japanese.js",
      "js/modules/mind.js",
      "js/modules/creatives.js"
    ]
  },
  {
    id: "CO-03",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Both runtime measurement on #/subject/code (40.875px height, clientHeight 41 vs scrollHeight 62, clipped CONTINUE label) and CSS flex-basis/contain:size trace confirm the finding.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/CO-03-code-continue-mac.png",
      "css/views/study.css:50",
      "css/views/study.css:54-56",
      "js/modules/code.js:124-126"
    ]
  },

  // 22. CO-04
  {
    id: "CO-04",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Navigated to #/code/task/2.9-guess in slot 31, inspected [data-ui='code.stdin'], and ran the canonical task.answer via KOS.codeRun.run with stdin.value vs full multi-line examples[0].stdin.",
    observed: "[data-ui='code.stdin'] is an <input type='text'> prefilled with '42' (the first line of examples[0].stdin '42\\n3\\n10\\n60\\n42'). Running task.answer with stdin.value ('42') returns ok: false with runtimeError 'ArgumentNullException: Value cannot be null. (Parameter \\'s\\')' at line 5, whereas running with full examples[0].stdin succeeds (ok: true, stdout 'Higher\\nLower\\nCorrect in 3\\n'). 158 tasks in KOS_CODE.TASKS have multi-line examples[0].stdin.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/code.js:633-635",
      "js/modules/code.js:654-660"
    ],
    contraryEvidence: "Clicking '✓ Check' runs KOS.codeRun.check(spec, ed.files()), which feeds each test case's full multi-line stdin directly and passes.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "CO-04",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/code.js:615-735, js/core/coderun.js:145-235, js/labs/cs-interp.js:1127-1131,2328-2336,2420-2508, and js/modules/codecap.js:227-235.",
    observed: "js/modules/code.js:633-635 builds stdin as <input type='text'> and explicitly splits examples[0].stdin on '\\n'[0]. HTML <input type='text'> strips newlines, so '▶ Run' can only ever pass one line of input. On the second Console.ReadLine(), js/labs/cs-interp.js:2328 returns null, causing int.Parse / double.Parse / DateTime.Parse to throw ArgumentNullException (lines 2329-2330, 2420-2440). Capstone runner in js/modules/codecap.js:228-230 uses a <textarea> instead.",
    evidence: [
      "js/modules/code.js:633-635",
      "js/modules/code.js:654-660",
      "js/labs/cs-interp.js:1129-1130",
      "js/labs/cs-interp.js:2328-2330",
      "js/modules/codecap.js:228-230"
    ],
    contraryEvidence: "Check button bypasses the stdin input box and uses the full test-case stdin from the task definition.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "CO-04",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed across 158 multi-line tasks in KOS_CODE.TASKS; replacing the single-line <input type='text'> with an auto-sizing or compact <textarea> (matching js/modules/codecap.js:228-230) and preserving full examples[0].stdin resolves the crash.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/code.js:633-635",
      "js/labs/cs-interp.js:2328-2330"
    ]
  },

  // 23. CR-01
  {
    id: "CR-01",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Created a work via KOS.creatives.addWork in slot 31, promoted it, navigated to #/creatives/log/<wid>, clicked 'Take out of Portfolio', and then invoked KOS.rerender().",
    observed: "Navigating to #/creatives/log/wmw65kjpi651iv7 opened the work dialog (.k-dialog-overlay count = 1). Clicking 'Take out of Portfolio' closed the dialog and called KOS.rerender(), which re-ran logPage(main, wid) -> setTimeout(() => openWork(wid), 0) and immediately reopened the work dialog (.k-dialog-overlay count = 1). Calling KOS.rerender() while the dialog was open stacked a second .k-dialog-overlay in document.body (stackedOverlaysAfterRerender = 2).",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-followup.json",
      "js/modules/creatives.js:542",
      "js/modules/creatives.js:559",
      "js/modules/creatives.js:567"
    ],
    contraryEvidence: "Opening #/creatives/log without an <id> parameter and clicking a table row calls openWork(w.id) without setting arg.id in the route, avoiding the loop.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "CR-01",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/creatives.js:46-55,300-315,436-568,610-633 and js/core/router.js:55,125,220-320.",
    observed: "In js/modules/creatives.js:567, logPage(main, wid) runs if (wid && CR().work(wid)) setTimeout(function () { openWork(wid); }, 0); on every render while the route remains #/creatives/log/<wid> (the landing route after logging work in creatives.js:620, crwrite.js:147, and crdrills.js:85). Every dialog action that calls KOS.rerender() (Take out of Portfolio at line 542, Promote at line 559, Critique close at line 508) re-runs logPage with wid still in the route and reopens or stacks the dialog.",
    evidence: [
      "js/modules/creatives.js:46-54",
      "js/modules/creatives.js:307",
      "js/modules/creatives.js:508",
      "js/modules/creatives.js:527-568",
      "js/modules/creatives.js:620"
    ],
    contraryEvidence: "Soft background rerenders (KOS.rerender({ background: 'soft' })) are deferred while a .k-dialog-overlay is mounted (js/core/router.js:272-276).",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "CR-01",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in both runtime and code trace: logPage triggers openWork(wid) as an idempotency-free render side effect without replacing the route to #/creatives/log on open or close.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-followup.json",
      "js/modules/creatives.js:542-568"
    ]
  },

  // 24. CR-02
  {
    id: "CR-02",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Navigated to #/subject/creatives and #/creatives/tracks at iphone (402x874) in slot 31 and inspected [data-ui='cr.settings-open'], [data-ui='cr.focus'], .k-stage-head, and .k-ptitle-tools.",
    observed: "At 402x874 on both #/subject/creatives and #/creatives/tracks, [data-ui='cr.settings-open'] and [data-ui='cr.focus'] are mounted inside #page-actions in .k-stage-head, which has computed display: 'none' (rect 0x0). Neither button has data-phone-action or data-phone-more, .k-ptitle-tools has 0 rescued buttons, and KOS.crPages (['tracks','write','drills','refs','portfolio']) has no Settings entry.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/creatives.js:38",
      "js/modules/creatives.js:68-71",
      "js/modules/creatives.js:88-91",
      "js/modules/creatives.js:293-295"
    ],
    contraryEvidence: "Direct hash navigation to #/creatives/settings works if typed manually, and Focus is reachable via the global Productivity -> Focus route without the pre-selected subject.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "CR-02",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/creatives.js:35-42,68-95,288-320,643-665, js/modules/mobile-shell.js:542-598, and css/layout.css:440-465; checked CLAUDE.md invariant 53a.",
    observed: "css/layout.css:445 hides .k-stage-head at @media (max-width: 700px). js/modules/mobile-shell.js:559-567 rescues #page-actions buttons into .k-ptitle-tools only when they carry [data-phone-action]. In js/modules/creatives.js:68-71, 88-91, and 293-295, neither settingsBtn(page) nor the 'Start focus' button sets data-phone-action, making Creatives settings unreachable from the phone UI.",
    evidence: [
      "js/modules/creatives.js:68-71",
      "js/modules/creatives.js:88-91",
      "js/modules/creatives.js:293-295",
      "js/modules/mobile-shell.js:559-567",
      "css/layout.css:445"
    ],
    contraryEvidence: "Above 700px (iPad and Mac), .k-stage-head is visible and both buttons are accessible.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "CR-02",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime at 402x874 and by code trace.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/creatives.js:68-71",
      "js/modules/mobile-shell.js:559-567",
      "css/layout.css:445"
    ]
  },

  // 25. DI-01
  {
    id: "DI-01",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Inspected KOS.extTasks, byLink, reconcile, and KOS.cloudMerge.mergeState in slot 31 and traced two-device Todoist sync ordering.",
    observed: "In js/core/exttasks.js:158-186 and 261-276, tdPush sends item_add without embedding it.uid in the remote item fields, and stores the returned remote id in local it.ext.id. When a second device (or second tab) runs todoistCycle before pulling the updated kos_state from cloud sync, byLink('todoist') finds no local reminder with ext.id === rid, so reconcile calls KOS.reminders.add(...) with a fresh random uid. When cloud sync later runs KOS.cloudMerge.mergeState (js/core/cloudmerge.js:233-308), sameOrigin checks a.uid === b.uid (false) and never checks a.ext.id === b.ext.id, preserving both copies.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/exttasks.js:158-186",
      "js/core/exttasks.js:261-276",
      "js/core/cloudmerge.js:233-308"
    ],
    contraryEvidence: "If Device A pushes kos_state to Supabase and Device B pulls kos_state before Device B runs todoistCycle, Device B already has ext.id === rid and byLink('todoist') matches it.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/exttasks.js:340-446 (Google Tasks gtasksCycle / gtCreate shares the exact same pattern)"
    ]
  },
  {
    id: "DI-01",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/exttasks.js:158-277,340-446, js/core/ext.js:113-131,268-308, js/core/reminders.js:114-141, and js/core/cloudmerge.js:18-27,230-310.",
    observed: "Confirmed the three-part interaction: (1) Todoist item_add commands only pass X().uuidOf('add|' + it.uid) as the command UUID, which Todoist does not expose on items fetched by other devices; (2) reconcile matches only by byLink('todoist')[r.id]; (3) cloudmerge.js sameOrigin(a, b, rec) at lines 233-239 compares a.uid === b.uid and never deduplicates records that share the same (ext.p, ext.id) pair. Google Tasks (gtasksCycle at lines 340-446) has the same vulnerability.",
    evidence: [
      "js/core/exttasks.js:158-186",
      "js/core/exttasks.js:228-237",
      "js/core/exttasks.js:261-276",
      "js/core/cloudmerge.js:233-267",
      "js/core/cloudmerge.js:285-308"
    ],
    contraryEvidence: "A 120s provider lease in kos_ext prevents simultaneous syncs, but does not force a cloud state pull before acquiring the provider lease.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/exttasks.js:340-446"
    ]
  },
  {
    id: "DI-01",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "modify",
    notes: "Confirmed. In addition to pulling cloud state / matching by content on import, KOS.cloudMerge (js/core/cloudmerge.js:233-239) should also treat two reminders with identical non-null (ext.p, ext.id) as sameOrigin so both Todoist and Google Tasks duplicates collapse cleanly on state merge.",
    evidence: [
      "js/core/exttasks.js:158-186",
      "js/core/exttasks.js:261-276",
      "js/core/cloudmerge.js:233-308"
    ]
  },

  // 26. DI-02
  {
    id: "DI-02",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Inspected tdPush chunking and promise chain in js/core/exttasks.js:248-336.",
    observed: "In js/core/exttasks.js:319-335, tdPush splits cmds into chunks of 90 and chains them with chunks.reduce(...), accumulating status and map across chunks, but only invokes after.forEach(fn => fn(status, map)) and KOS.store.save() in the final .then(...) after every chunk has succeeded. If chunk 1 succeeds and chunk 2 rejects (e.g. HTTP 503/network drop), chunk 1's remote items exist on Todoist while none of their temp_id_mapping entries are applied to local reminders. On the next cycle, the pull phase runs before tdPush and imports chunk 1's remote items as new duplicate local reminders.",
    evidence: [
      "js/core/exttasks.js:201-207",
      "js/core/exttasks.js:219-244",
      "js/core/exttasks.js:261-276",
      "js/core/exttasks.js:319-335"
    ],
    contraryEvidence: "Only triggers when a single push batch exceeds 90 commands (chunks.length >= 2) and a chunk after the first fails.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "DI-02",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/exttasks.js:201-336 and js/core/ext.js:126-130,309-323.",
    observed: "Confirmed: even though item_add uses deterministic command UUIDs (X().uuidOf('add|' + it.uid) at line 267) so Todoist's server wouldn't re-create them on a retry of tdPush, todoistCycle (lines 218-241) always runs pull + reconcile BEFORE tdPush. Because chunk 1's temp_id_mapping was discarded when chunk 2 failed, the next cycle's pull step sees chunk 1's items on the server while local reminders still have no ext.id, importing all of chunk 1's items as duplicates before tdPush ever runs.",
    evidence: [
      "js/core/exttasks.js:219-244",
      "js/core/exttasks.js:267-275",
      "js/core/exttasks.js:319-335"
    ],
    contraryEvidence: "Single-chunk pushes (<=90 commands) succeed or fail atomically at the HTTP request boundary.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "DI-02",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed: applying each chunk's status/temp_id_mapping and KOS.store.save() immediately inside the per-chunk .then() handler prevents partial-batch unlinked items.",
    evidence: [
      "js/core/exttasks.js:219-244",
      "js/core/exttasks.js:319-335"
    ]
  },

  // 27. DI-03
  {
    id: "DI-03",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Constructed a fresh default state in slot 31 with 1 reminder and 1 assignment and evaluated all 8 predicates of stateMeaningful(s) (js/core/cloudsync.js:235-249).",
    observed: "With 1 reminder in state.reminders.items and 1 assignment in state.assignments.items, all 8 predicates of stateMeaningful(s) evaluated to false (meaningful: false). In assessLink (js/core/cloudsync.js:975-995) and applyRemoteState (lines 759-778), localHas and dirty both evaluate to false, causing adoptRemote -> applyRemoteState to call KOS.store.replaceState(incoming) and silently wipe the local reminders and assignments.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/cloudsync.js:235-249",
      "js/core/cloudsync.js:759-778",
      "js/core/cloudsync.js:975-995"
    ],
    contraryEvidence: "If the user has logged any session, earned any XP/gold, added a calendar event, or stored media/files in IndexedDB, localHas is true.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/cloudsync.js:1096-1109 (firstLinkMerge also checks stateMeaningful(incoming) before merging remote state)"
    ]
  },
  {
    id: "DI-03",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/cloudsync.js:228-250,540-555,738-790,975-1015,1096-1120,1268-1310 and js/core/store.js:25-145.",
    observed: "stateMeaningful(s) (js/core/cloudsync.js:235-249) checks only study.progress, sessions, custom.cards, wishlist.items, tracker.entries, goals.items, calendar.events, and governor (xp/gold/owned). It completely ignores reminders, assignments, exams, routines, dayReview, code, japanese, creatives, mind, edits, resources, money, srs, itUnits, and achievements. Both local-adopt (assessLink -> adoptRemote -> applyRemoteState -> replaceState) and remote-overwrite (conflict at lines 543-549 and firstLinkMerge at line 1099) rely on stateMeaningful.",
    evidence: [
      "js/core/cloudsync.js:235-249",
      "js/core/cloudsync.js:543-549",
      "js/core/cloudsync.js:759-778",
      "js/core/cloudsync.js:975-1010",
      "js/core/cloudsync.js:1096-1109"
    ],
    contraryEvidence: "Once meta.state.lastPushedHash is non-null on an already-linked device, dirty is computed by comparing stateHash(KOS.store.state) !== meta.state.lastPushedHash (line 760) rather than stateMeaningful.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/cloudsync.js:543-549",
      "js/core/cloudsync.js:1096-1109"
    ]
  },
  {
    id: "DI-03",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime and code trace; 15 state domains added after the original stateMeaningful allowlist are invisible to first-link and conflict checks.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/cloudsync.js:235-249",
      "js/core/cloudsync.js:759-778",
      "js/core/cloudsync.js:975-995"
    ]
  },

  // 28. DI-04
  {
    id: "DI-04",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Inspected js/core/store.js:380-435 and js/core/router.js:220-285 and checked for cross-tab storage listeners or locks.",
    observed: "KOS.store loads localStorage.getItem('kurenai-os-v1') once at startup and writes the entire in-memory state via localStorage.setItem(KEY, JSON.stringify(state)) on every save() (120ms debounce) and flush() (pagehide and visibilitychange === 'hidden'). There is no window 'storage' listener, BroadcastChannel, or Web Lock. Furthermore, navigating in a second tab via KOS.show() (js/core/router.js:244) mutates state.ui.lastView and calls KOS.store.save(), causing even a passive second tab to overwrite saves from the first tab.",
    evidence: [
      "js/core/store.js:382-434",
      "js/core/router.js:243-245"
    ],
    contraryEvidence: "Data stored in separate per-record IndexedDB stores (Collection media, files, ink strokes, Mind journal entries, Money transactions) is not part of the kurenai-os-v1 localStorage blob.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/router.js:244"
    ]
  },
  {
    id: "DI-04",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/store.js:380-435 and js/core/router.js:220-285; checked CLAUDE.md persistence invariants.",
    observed: "Confirmed: store.js has no cross-tab synchronization or merge-before-write, and lines 429-434 register pagehide and visibilitychange === 'hidden' handlers that call flush() whenever a pending save timer exists, guaranteeing whole-document last-writer-wins clobbering across tabs.",
    evidence: [
      "js/core/store.js:382-434",
      "js/core/router.js:243-245"
    ],
    contraryEvidence: "None for the localStorage state document.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "DI-04",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed; additionally noted that KOS.show() mutating state.ui.lastView and calling KOS.store.save() (js/core/router.js:244) means merely switching routes in a stale second tab clobbers localStorage.",
    evidence: [
      "js/core/store.js:382-434",
      "js/core/router.js:243-245"
    ]
  },

  // 29. EX-01
  {
    id: "EX-01",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Opened #/exams/attempt/<uid>/marks in slot 31, clicked [data-ui='ex.q-add'] ('＋ Question'), and inspected the DOM controls rendered in the added .k-ex-qrow.",
    observed: "Clicking '＋ Question' appended a .k-ex-qrow containing only 1 input (<input type='number' class='k-input k-ex-gotin' aria-label='Q1 marks got'>), 0 <select> elements, a static '—' span for Max (q.max === null), and an empty static span for Topic (q.refs === []). There is no UI control to set Max or Topic on a manually added question.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/examprac.js:410",
      "js/modules/examprac.js:415-436"
    ],
    contraryEvidence: "Attempts created from an indexed past paper pre-populate initial question rows from KOS_EXAMS.index.questions via seedQuestions(e) (js/modules/examprac.js:368-381).",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/examstats.js:235,282,315"
    ]
  },
  {
    id: "EX-01",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/examprac.js:368-501 and js/core/examstats.js:232-320.",
    observed: "In js/modules/examprac.js:410, addRow() pushes { q: 'Q' + (rows.length + 1), max: null, got: null, refs: [], tags: [], redo: false, note: '' }, and draw() (lines 415-436) renders q.max and node.title (from q.refs[0]) as read-only spans. Because q.max remains null, 'Where the marks went' (line 461) and KOS.examStats.patterns / postMortem / compare (js/core/examstats.js:235, 282, 315) all skip manually added questions.",
    evidence: [
      "js/modules/examprac.js:410",
      "js/modules/examprac.js:415-436",
      "js/modules/examprac.js:460-467",
      "js/core/examstats.js:235",
      "js/core/examstats.js:282",
      "js/core/examstats.js:315"
    ],
    contraryEvidence: "Pre-seeded rows from indexed past papers have max and refs populated at creation.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/examstats.js:235,282,315"
    ]
  },
  {
    id: "EX-01",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime and code trace; manually added questions also fail to participate in 'Where the marks went' and KOS.examStats analytics because q.max stays null.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/examprac.js:410-436",
      "js/core/examstats.js:235,282,315"
    ]
  },

  // 30. EX-02
  {
    id: "EX-02",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Navigated to #/exams/room/<uid> at iphone (402x874) in slot 31, measured .k-exr-body, .k-exr-left, and .k-exr-bottom bounding rects, and captured screenshot.",
    observed: "At 402x874 on #/exams/room/ex_mmh620c1_8, .k-exr-body shrinks to height 550.75px (top 64, bottom 614.75) while its child .k-exr-left ('RAPID RECALL — LAST-WEEK MISTAKES') extends to bottom 991.5px (height 567.5px). The sibling .k-exr-bottom ('BEFORE YOU GO IN' checklist, top 614.75, bottom 842) paints directly on top of Rapid Recall items 2, 3, and 4 (227.25px vertical overlap).",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/EX-02-exam-room-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "css/views/exams.css:505-520",
      "css/views/exams.css:538-541"
    ],
    contraryEvidence: "On tall desktop viewports (>860px wide), the 3-column grid in .k-exr-body fits above .k-exr-bottom without overflowing.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "EX-02",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/examroom.js:42-145 and css/views/exams.css:504-548,861-864,882-886,933-939.",
    observed: ".k-exr (css/views/exams.css:505) is a fixed column flex container (position: fixed; inset: 0; display: flex; flex-direction: column; overflow-y: auto), and .k-exr-body (line 513) has flex: 1 1 auto; min-block-size: 0; with no overflow clipping. Below 860px (lines 882-885), .k-exr-body collapses to 1 column whose stacked height exceeds 100vh; flex-shrink: 1 + min-block-size: 0 shrinks .k-exr-body's layout box to fit 100vh while its grid children visually overflow underneath .k-exr-bottom.",
    evidence: [
      "js/modules/examroom.js:56-139",
      "css/views/exams.css:505-520",
      "css/views/exams.css:538-541",
      "css/views/exams.css:882-885"
    ],
    contraryEvidence: "None on viewports where .k-exr-body's content height exceeds the remaining viewport height.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "EX-02",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Visually and geometrically confirmed at 402x874 (227.25px overlap between .k-exr-bottom and .k-exr-left); setting flex: 1 0 auto (or min-block-size: auto) on .k-exr-body allows .k-exr to scroll normally.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/EX-02-exam-room-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "css/views/exams.css:505-520"
    ]
  },

  // 31. EX-03
  {
    id: "EX-03",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Opened #/ref/compsci/4.1.1.1 at iphone (402x874) in slot 31, clicked the Handwritten tab to mount the floating ink palette (.k-ink-pal), measured button rects, and captured screenshot.",
    observed: "At 402x874, .k-ink-pal (data-state='row icons') has rect { left: 20, right: 520, w: 500, h: 62 }, overflowing the 402px viewport by 118px to the right. 'Ink · Medium▾' (left 341, right 417, w 76) is partially clipped at the right edge, and 'Undo' (left 424, right 468, w 44) and 'Redo' (left 470, right 514, w 44) are completely off-screen.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/EX-03-ink-palette-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch2-followup.json",
      "js/core/inkui.js:1141-1175",
      "css/views/ink.css:191-203"
    ],
    contraryEvidence: "Restricted 3-tool answer pads (js/core/inkpad.js, opts.tools = ['pen','hl','eraser']) have only 3 tool buttons and fit within 402px.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/modules/inktab.js",
      "js/core/pdfview.js",
      "js/modules/crsketch.js"
    ]
  },
  {
    id: "EX-03",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/inkui.js:1136-1249,1358-1398, css/views/ink.css:189-205, and css/tokens.css:224-226,262-263.",
    observed: "Under 700px (PHONE_Q), dockable() forces the floating palette (.k-ink-pal) with data-state='row icons'. Each .k-ink-tool has min-inline-size: var(--hit-coarse) (44px), and the options menu button (.k-ink-pal-colour) keeps its text label inside .k-btn-label (~76px). Summing 1 grip (32px) + 6 tools (264px) + colour button (76px) + 2 history buttons (88px) + gaps/padding/borders = 500px. In place(x, y) (js/core/inkui.js:1223-1235), Math.max(20, Math.min(402 - 500 - 20, x)) clamps --pal-x to 20px, pushing x = 402..520 off-screen and making it impossible even to drag the palette left to reveal Undo/Redo.",
    evidence: [
      "js/core/inkui.js:1136-1175",
      "js/core/inkui.js:1223-1235",
      "css/views/ink.css:190-203",
      "css/tokens.css:224-226"
    ],
    contraryEvidence: "Above 700px, the ink toolbar docks by default inside a KOS.ui.scroller wrapper.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/modules/inktab.js",
      "js/core/pdfview.js",
      "js/modules/crsketch.js"
    ]
  },
  {
    id: "EX-03",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed visually and geometrically at 402x874 (500px palette clamped at left: 20px, pushing Undo at 424..468 and Redo at 470..514 completely off-screen and preventing even dragging left because Math.max(pad, ...) clamps x >= 20).",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/EX-03-ink-palette-iphone.png",
      "docs/audit/2026-11/gemini/evidence/batch2-followup.json",
      "js/core/inkui.js:1141-1235",
      "css/views/ink.css:191-203"
    ]
  },

  // 32. EX-28
  {
    id: "EX-28",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Opened #/exams/paper/pack-4.1.1/timed at ipad (820x1180) and iphone (402x874) in slot 31, measured .k-ex-tnav-b button rects, and captured screenshot.",
    observed: "Even on a 5-question pack (#/exams/paper/pack-4.1.1/timed), the .k-ex-tnav-b question navigator buttons are crushed to 14px–17px wide (14x30 on iPad, 14x44 on iPhone) instead of 30px squares (--ex-tnav-b: 30px).",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/EX-28-paper-qnav-ipad.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "css/views/exams.css:62",
      "css/views/exams.css:739-745"
    ],
    contraryEvidence: "None; occurs across all viewports (Mac, iPad, iPhone) and paper lengths.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "EX-28",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/exampaperview.js:181-200, css/views/exams.css:62,738-745, css/components.css:308-310, and css/tokens.css:1229.",
    observed: "Found a two-level flex interaction: (1) Inside .k-ex-tnav (css/views/exams.css:741-742), .k-ex-tnav-b sets inline-size: var(--ex-tnav-b) (30px) without flex-shrink: 0; (2) In the parent .k-ex-tbar (js/modules/exampaperview.js:194-200, css/views/exams.css:62,739), el('span', { class: 'k-ex-grow' }) has flex: 1 1 0 while the sibling KOS.ui.scroller(nav) (.k-scroller) has flex: 0 1 auto and its child .k-scroller-track (css/components.css:309) has flex: 1 1 0; min-inline-size: 0; overflow-x: auto;. Because .k-scroller-track has flex-basis: 0px, .k-scroller's intrinsic width collapses and .k-ex-grow absorbs all free space in .k-ex-tbar, crushing .k-scroller and every .k-ex-tnav-b inside it.",
    evidence: [
      "js/modules/exampaperview.js:181-200",
      "css/views/exams.css:62",
      "css/views/exams.css:739-745",
      "css/components.css:308-310"
    ],
    contraryEvidence: "None.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "EX-28",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: false,
    fixAgree: "modify",
    notes: "Confirmed, with an essential root-cause and fix refinement: .k-ex-tnav-b lacking flex-shrink: 0 is only half the bug. In .k-ex-tbar (js/modules/exampaperview.js:194-200), .k-ex-grow has flex: 1 1 0 while the sibling .k-scroller wraps .k-scroller-track { flex: 1 1 0; min-inline-size: 0 } (css/components.css:309), which gives .k-scroller a 0px flex-basis contribution so .k-ex-grow steals all available width. Both .k-ex-tnav-b { flex-shrink: 0 } AND sizing .k-ex-tbar > .k-scroller (or removing flex: 1 1 0 on .k-ex-grow) are required.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/EX-28-paper-qnav-ipad.png",
      "js/modules/exampaperview.js:181-200",
      "css/views/exams.css:62",
      "css/views/exams.css:739-745",
      "css/components.css:308-310"
    ]
  },

  // 33. GO-02
  {
    id: "GO-02",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Added a 'titles-completed' goal (target: 5, startDate: today) in slot 31 against the seeded vault (222 completed titles) and ran KOS.goals.compute().",
    observed: "Immediately upon creation and compute(), the goal evaluated to { current: 222, target: 5, status: 'completed' }, wrote a completion receipt in state.goals.completionLedger[g.id] with payout: 'activity-only', and unlocked Tier 1 of the 'goal-getter' badge in state.achievements.earned.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/goals-collection.js:49-96",
      "js/core/goals.js:303-317",
      "js/core/goals.js:438-450",
      "js/core/achcatalogue.js:461-462"
    ],
    contraryEvidence: "spend-below filters purchases by [g.startDate, g.deadline], and per Invariant 161 goal completion grants no Governor XP/gold/HP.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/goals.js:689-705 (code-skills, gold-target, and level-target also measure cumulative totals without a baseline)"
    ]
  },
  {
    id: "GO-02",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/goals-collection.js:1-104, js/core/goals.js:34-38,245-258,303-317,428-484,574-581,689-705, and js/core/achcatalogue.js:461-462.",
    observed: "10 of the 14 Collection goal types in js/core/goals-collection.js:49-96 read whole-vault cumulative totals with no [g.startDate, g.deadline] filter and no onCreate baseline (unlike topics-green at js/core/goals.js:576). Completing any goal writes completionLedger[g.id] with payout: 'activity-only' and touches 'goals' achievements, where 'goal-getter' (js/core/achcatalogue.js:461-462) counts ledger entries with payout !== 'none'.",
    evidence: [
      "js/core/goals-collection.js:8-9",
      "js/core/goals-collection.js:49-96",
      "js/core/goals.js:303-317",
      "js/core/goals.js:438-450",
      "js/core/achcatalogue.js:461-462"
    ],
    contraryEvidence: "specific-title, title-episodes, title-chapters, and spend-below are scoped to a single title or date window.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/goals.js:689-705"
    ]
  },
  {
    id: "GO-02",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime and code trace; also affects code-skills, gold-target, and level-target in js/core/goals.js:689-705.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/goals-collection.js:49-96",
      "js/core/goals.js:438-450",
      "js/core/achcatalogue.js:461-462"
    ]
  },

  // 34. GO-06
  {
    id: "GO-06",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Opened #/goals in slot 31, clicked [data-ui='goals.new'], selected 'routine-days' and 'routine-streak', and inspected all rendered form fields.",
    observed: "Selecting 'routine-days' or 'routine-streak' in the goal editor rendered only [Title, Target, Repeats, Starts, Deadline] with no routine picker. Saving the goal stores params: {} and KOS.goals.compute() returns current: null, meta: 'No routine linked'.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/routines.js:750-764",
      "js/modules/goals.js:828-883"
    ],
    contraryEvidence: "Programmatic KOS.goals.add({ type: 'routine-days', params: { routine: id } }) works in unit/smoke tests.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "GO-06",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/routines.js:748-765 and js/modules/goals.js:828-963.",
    observed: "routine-days and routine-streak are registered in js/core/routines.js:752-764 without a fields descriptor, and goalDialog() in js/modules/goals.js:828-883,945-963 has no branch to render or save a routine selector.",
    evidence: [
      "js/core/routines.js:748-765",
      "js/modules/goals.js:828-883",
      "js/modules/goals.js:945-963"
    ],
    contraryEvidence: "None in the UI.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "GO-06",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime and code trace.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/routines.js:748-765",
      "js/modules/goals.js:828-883",
      "js/modules/goals.js:945-963"
    ]
  },

  // 35. GO-07
  {
    id: "GO-07",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Created a habit via KOS.routines.add({ kind: 'habit', title: 'Audit Test Habit' }) in slot 31, opened #/goals -> New goal -> 'habit-streak', and inspected the habit <select> options.",
    observed: "While KOS.routines.habitsView() contained the habit in state.routines.items, state.todo.habits had 0 items and the 'habit-streak' <select> in the goal dialog rendered 0 <option> elements.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/goals.js:878-882",
      "js/core/routines.js:703-745"
    ],
    contraryEvidence: "Habits that existed in state.todo.habits prior to the one-time Routines migration remain in the frozen array and appear in the select.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "GO-07",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/goals.js:878-882,958, js/core/goals.js:638-655, and js/core/routines.js:703-745; checked CLAUDE.md invariant 142.",
    observed: "Per Invariant 142, habits now live in state.routines.items (kind: 'habit') and legacy readers must use KOS.routines.habitsView(). While habit-streak's measure function (js/core/goals.js:642-646) resolves via KOS.routines.resolve, the editor in js/modules/goals.js:878-882 reads directly from (store.state.todo && store.state.todo.habits) || [].",
    evidence: [
      "js/modules/goals.js:878-882",
      "js/core/goals.js:638-655",
      "js/core/routines.js:703-745",
      "CLAUDE.md:1848-1851"
    ],
    contraryEvidence: "Pre-migration legacy habits in state.todo.habits still appear.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "GO-07",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime and code trace; switching js/modules/goals.js:879 to KOS.routines.habitsView() aligns the editor with Invariant 142.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/goals.js:878-882",
      "js/core/routines.js:703-745"
    ]
  },

  // 36. GO-23
  {
    id: "GO-23",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Cleared flashcard/exam/manual RAG state oncompsci:4.1.1.1 in slot 31, recorded a single 0% quiz attempt (attempts: 1, lastPct: 0), and evaluated KOS.rag.auto and KOS.rag.effective.",
    observed: "Before the quiz, KOS.rag.auto('compsci', '4.1.1.1') returned { band: null, score: null }. After recording { attempts: 1, lastPct: 0 }, KOS.rag.auto returned { band: 'g', score: 75, label: 'Green' } because score starts at 100 and the quiz penalty is capped at 25 (100 - 25 = 75 >= 70 Green threshold).",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/rag.js:17",
      "js/modules/rag.js:30-91"
    ],
    contraryEvidence: "Topics that also have lapsed/low-recall flashcards or low exam tracker scores accumulate penalties across signals and drop below 70.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/achcatalogue.js:185-188 ('into-the-green' and unit mastery badges)",
      "js/core/exams.js (exam readiness coverage signal)",
      "js/core/reportstore.js (weekly report toGreen counts)"
    ]
  },
  {
    id: "GO-23",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/rag.js:17,29-103, js/engines/quiz.js:151-165, and js/core/goals.js:534-546,574-581.",
    observed: "In js/modules/rag.js:30-91, KOS.rag.auto initializes score = 100, hasData = false. A single 0% quiz sets hasData = true and subtracts Math.min(25, Math.round((100 - 0) * 0.25)) = 25, yielding score = 75 -> band(75) = 'g' (Green, >= 70). Even a single 0% exam attempt alone only subtracts Math.min(30, 30) = 30, yielding score = 70 -> 'g'. Five 0% quizzes on unrated leaves therefore complete 'Move topics to Green' (default target 5).",
    evidence: [
      "js/modules/rag.js:17",
      "js/modules/rag.js:30-91",
      "js/core/goals.js:534-540",
      "js/core/goals.js:574-581"
    ],
    contraryEvidence: "Manual RAG override takes precedence in KOS.rag.effective.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/achcatalogue.js:185-188",
      "js/core/exams.js",
      "js/core/reportstore.js"
    ]
  },
  {
    id: "GO-23",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime and code trace; in addition to quiz penalty cap 25 (score 75 = Green), a single 0% exam attempt also caps its penalty at 30 (score 70 = Green), and this feeds Goals, Achievements ('into-the-green'), Exams readiness, and Reports.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/rag.js:17",
      "js/modules/rag.js:30-91",
      "js/core/goals.js:534-581"
    ]
  },

  // 37. GO-25
  {
    id: "GO-25",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Queried KOS.mediadb.query({ status: 'inProgress', sort: 'title' }) in slot 31 and traced the goalDialog linked-title <select> population in js/modules/goals.js:864-872.",
    observed: "In the seeded vault, KOS.mediadb.query({ status: 'inProgress', sort: 'title' }) returned 85 in-progress entries, and .slice(0, 60) truncated 25 in-progress entries from the <select>. When editing a title goal whose linkedEntryId is among those 25 (or whose status changed from inProgress), no <option> matches g.linkedEntryId, so the <select> defaults to rows[0].id and saving silently overwrites linkedEntryId.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/goals.js:864-872",
      "js/modules/goals.js:954-959"
    ],
    contraryEvidence: "If g.linkedEntryId is still inProgress and within the first 60 alphabetical titles, o.selected = true preserves it.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "GO-25",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/goals.js:864-872,889-923,945-963 and js/core/goals-collection.js:58-77.",
    observed: "Confirmed: js/modules/goals.js:865-871 populates extra.linked from a single KOS.mediadb.query({ status: 'inProgress', sort: 'title' }) capped at .slice(0, 60) without fetching or prepending KOS.mediadb.get(g.linkedEntryId). Furthermore, if the user clicks Save before the async query callback fires, extra.linked.value is '' and line 955 sets linkedEntryId = null.",
    evidence: [
      "js/modules/goals.js:864-872",
      "js/modules/goals.js:954-959"
    ],
    contraryEvidence: "None when linkedEntryId is outside the first 60 alphabetical inProgress titles.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "GO-25",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed in runtime (85 in-progress titles in seeded vault, 25 truncated by .slice(0, 60)) and code trace.",
    evidence: [
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/modules/goals.js:864-872",
      "js/modules/goals.js:954-959"
    ]
  },

  // 38. HR-01
  {
    id: "HR-01",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Navigated to #/home at mac (1470x832) in slot 31 with subjects started, measured .k-desks and its child desk cards, and captured screenshot.",
    observed: ".k-desks has clientWidth 1210 and scrollWidth 1822 (6 cards, each 292px wide with 14px gap). The first 4 cards (Computer Science, Mathematics, IT: Data Analytics, Code) fill 100% of the 1210px container flush to the right edge (x = 236..1446), while Creatives (x = 1460..1752) and Collection (x = 1766..2058) sit completely off-screen to the right with no KOS.ui.scroller wrapper, no scroll arrows, no edge fade, and no peeking card edge.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/HR-01-home-desks-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch2-followup.json",
      "js/modules/hub.js:1558-1643",
      "css/views/home.css:183"
    ],
    contraryEvidence: "At @media (max-width: 700px) (css/views/home.css:246), .k-desks uses var(--home-desk-col) so the next card peeks on phones.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/modules/hub.js:1558-1635 (Japanese and Collection desk cards are also pushed off-screen after the first 4 subjects)"
    ]
  },
  {
    id: "HR-01",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/hub.js:1551-1643, css/views/home.css:179-219,246-248, and js/core/ui.js:741-792; checked CLAUDE.md invariants 50 and 53.",
    observed: "In js/modules/hub.js:1558-1642, Home's Continue row iterates SUBJECTS in fixed order without sorting by recent activity, and sets data-scroller='true' directly on div.k-desks instead of wrapping it in KOS.ui.scroller(desks) (to avoid smoke55's DOM-depth cap). In css/views/home.css:183 and 218, grid-auto-columns divides 100% into exactly 4 columns (>1240px) or 2 columns (<=1240px), leaving zero peek of off-screen cards and no arrow/fade affordance.",
    evidence: [
      "js/modules/hub.js:1551-1643",
      "css/views/home.css:183",
      "css/views/home.css:218",
      "js/core/ui.js:741-758"
    ],
    contraryEvidence: "Trackpad horizontal swipe still scrolls .k-desks if the user already knows more cards exist.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "HR-01",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Confirmed visually and geometrically on Mac and iPad.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/HR-01-home-desks-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch2-followup.json",
      "js/modules/hub.js:1558-1643",
      "css/views/home.css:183"
    ]
  },

  // 39. HR-02
  {
    id: "HR-02",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Inspected KOS.reportStore.cached() and the Home 'Week in review' card in slot 31 alongside KOS.store.state.sessions.",
    observed: "In slot 31, KOS.store.state.sessions has 19 study sessions (8.7 hours shown in the 'Study hours' card on Home), while the adjacent 'WEEK IN REVIEW · 26 OCT – 1 NOV' card displays 'A quiet week for study. 0m studied' and 'October 2026: A quiet month for study.' (cached in kurenai-os-reports with mins: 0 before sessions were seeded, and never recomputed).",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/HR-01-home-desks-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/reportstore.js:240-334",
      "js/core/reportstore.js:423-428"
    ],
    contraryEvidence: "Older weekly periods (!isLatest) are skipped when rebuilt && !hasContent(facts) (line 277), provided Pacing has no rows.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/reportstore.js:294-334 (month, term, and year reports in ensureLongReports have no hasContent check at all)"
    ]
  },
  {
    id: "HR-02",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/core/reportstore.js:162-346,418-429, js/core/report.js:175-263, and js/core/reportwords.js:64-88,123-134; checked CLAUDE.md invariant 102.",
    observed: "KOS.reportStore.start() (js/core/reportstore.js:423-428) runs tick() 8s after boot, before cloud sync or backup restore completes. In ensureReports() (line 277), the latest ended week (isLatest === true) is unconditionally saved even when !hasContent(facts), and ensureLongReports() (lines 294-334) saves ended months, terms, and years without any hasContent check. Once saved, getReport(p.id) (line 273) skips it forever, and mergeReport(local, remote) (lines 340-345) keeps whichever report has the EARLIER savedAt timestamp, so an empty report generated 8s after boot on a fresh device even beats a populated remote report!",
    evidence: [
      "js/core/reportstore.js:240-334",
      "js/core/reportstore.js:340-345",
      "js/core/reportstore.js:423-428",
      "js/core/reportwords.js:68",
      "js/core/reportwords.js:128"
    ],
    contraryEvidence: "None for the latest week or any ended month/term/year when the 8s boot timer fires before history arrives.",
    preliminaryVerdict: "confirmed",
    alsoAffects: [
      "js/core/reportstore.js:340-345 (mergeReport keeps earlier savedAt even when earlier report had 0 activity)"
    ]
  },
  {
    id: "HR-02",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "modify",
    notes: "Confirmed in runtime (visible in HR-01-home-desks-mac.png) and code trace. In addition to Claude's proposed fix, mergeReport (js/core/reportstore.js:340-345) must also prefer a report with hasContent(r.facts) over an empty report with an earlier savedAt so a fresh client's 8-second boot report does not win cloud replication.",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/HR-01-home-desks-mac.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "js/core/reportstore.js:240-345"
    ]
  },

  // 40. HR-03
  {
    id: "HR-03",
    step: "skepticA",
    agent: "gemini-skepticA",
    method: "Navigated to #/home at ipad (820x1180) in slot 31, measured .k-home-goal ([data-ui='habit.panel']) and [data-ui='home.start-focus'], and captured screenshot.",
    observed: "At 820x1180 on #/home, .k-home-goal ([data-ui='habit.panel']) has computed display: 'none' (rect 0x0), hiding the Daily goal panel, Today's three, Critical HP Recovery list, inline habit ticks, and the hero's 'Start focus →' button ([data-ui='home.start-focus']).",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/HR-03-home-ipad.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "css/views/home.css:221-223",
      "css/views/home.css:244"
    ],
    contraryEvidence: "Above 1080px (Mac, iPad landscape) and at <=700px (iPhone), .k-home-goal is display: flex.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "HR-03",
    step: "skepticB",
    agent: "gemini-skepticB",
    method: "Read js/modules/hub.js:1079-1180,1216-1305 and css/views/home.css:15-52,221-248.",
    observed: "In js/modules/hub.js:1104-1175, .k-home-goal is the sole container in the Home hero for Critical HP Recovery, Morning Review's Today's three, and Default mode's Daily goal + habits + 'Start focus →'. css/views/home.css:221-223 sets @media (max-width: 1080px) { .k-home-goal { display: none; } } and only restores it at @media (max-width: 700px) (line 244), leaving a 701px–1080px dead zone across iPad portrait and Split View.",
    evidence: [
      "js/modules/hub.js:1104-1175",
      "css/views/home.css:221-223",
      "css/views/home.css:235-245"
    ],
    contraryEvidence: "The 'Up next' card below the hero still has a 'Start focus' button for its single top recommendation, but Daily goal, Today's three, and Critical HP Recovery have no fallback on Home.",
    preliminaryVerdict: "confirmed",
    alsoAffects: []
  },
  {
    id: "HR-03",
    step: "final",
    verdict: "confirmed",
    confidence: "high",
    severityAgree: true,
    proposedSeverity: "P1",
    rootCauseAgree: true,
    fixAgree: "agree",
    notes: "Visually and geometrically confirmed at 820x1180 (iPad portrait).",
    evidence: [
      "audit-evidence/2026-11/gemini/shots/HR-03-home-ipad.png",
      "docs/audit/2026-11/gemini/evidence/batch2-runtime.json",
      "css/views/home.css:221-245",
      "js/modules/hub.js:1104-1175"
    ]
  }
];

const target = "docs/audit/2026-11/gemini/p0p1-verification.jsonl";
const existing = fs.readFileSync(target, "utf8").trim().split("\n");
const existingKeys = new Set(existing.map(line => {
  const o = JSON.parse(line);
  return `${o.id}:${o.step}`;
}));

let added = 0;
const outLines = [...existing];
for (const r of records) {
  const k = `${r.id}:${r.step}`;
  if (!existingKeys.has(k)) {
    outLines.push(JSON.stringify(r));
    existingKeys.add(k);
    added++;
  }
}

fs.writeFileSync(target, outLines.join("\n") + "\n");
console.log(`Appended ${added} records. Total lines: ${outLines.length}`);
