# Claude's review of Gemini 4 Argon's audit work (8 Nov 2026)

Reviewed: branch `audit/gemini-2026-11` at `4bb30f0`, which exists only on this Mac and
was never pushed. It was built on `894a407`, whose app code is the same as
`kos-redraw-1`. The review followed HANDOFF §10.3. I did not repeat Gemini's
investigation. Instead I ran mechanical checks over its files myself, then sent
agents to re-check its claims in the code:
- two independent checks of each of its 6 proposed findings, one for novelty and
  severity and one trying to refute it;
- one agent on the completeness report;
- three agents re-checking 18 of its 96 verdicts. The sample included every
  verdict that was not "confirmed" (SY-01…05, SY-08, CC-01, SH-22), all four P0s
  and six other confirmed findings.

The agents' raw output is in
`~/.claude/projects/-Users-fj-Developer-KurenaiOS---Web/083a292e-…/subagents/workflows/wf_74b5f402-1f9/`
and `…/wf_eddec91e-25b/`.

## Recommendation

**(2) Accept with specific follow-ups, for workstream B only. Workstream A's
proposals should be rejected.**

- **Workstream B, the re-check of the 96 P0/P1 findings.** The verdicts are mostly
  right. In 17 of the 18 sampled, my agents reached the same verdict. Gemini found
  no false positives in Claude's P0/P1 list, and our checks agree.

  The verdicts should count as **corroboration, not independent verification**.
  The "runtime" step was usually not a runtime check, about half of the
  "own analysis" is Claude's text copied back, and the headline agreement
  figures were partly filled in by a script (details below).
- **Workstream A, the completeness critic.** None of its 6 new findings holds
  as written:
  - 4 are false at the lines it cites;
  - 1 duplicates DI-04;
  - 1 describes intended behaviour, inflated to P0.

  Its coverage ratings also contradict the handoff, and it invents features and
  numbers. Worth keeping: `ORIENTATION.md`, one clarification to root cause 2,
  dates around the clock change (DST) as a gap in testing, and GEM-001 as a P3
  question for the user.

## 1. Usefulness of the completeness report (A)

Of the six gaps it names, **none is a real gap stated correctly**.

| Proposal | Claimed severity | Verdict (two independent checks each) |
|---|---|---|
| GEM-001: sign-out keeps local data, and the next account's sign-in merges it | P0 | **Partly real, but intended behaviour.** It is invariant 34's automatic first link: the sync metadata and merge base are per user id, so a new account goes through `firstLinkMerge`. That is not an unvalidated pull, and the `pullRemote()` it cites does not exist. The app has one user. **At most P3:** warn, or offer "start empty", when a device last linked to account A signs in as B. Worth asking you once whether a shared browser is a real case for you. |
| GEM-002: a worker crash freezes the Run button for good | P1 | **False.** Each run's watchdog timer (`coderun.js:230-236`, `:199-204`) is never cleared, so the run resolves with TIMEOUT after 4–8 s. Later runs fall back to running in the page, or return SQL_UNAVAILABLE. What remains is an error message that names the wrong cause, which CO-19 already covers. |
| GEM-003: the achievement unlock overlay bypasses `openDialog` | P1 | **False.** It is opened with `KOS.ui.openDialog` (`js/modules/achievements.js:672`) and held back while any dialog is open (`quiet()` → `topDialog()`). The cited lines hold unrelated ledger code, and the cited "Invariant 13" is about AniList/VNDB push payloads (the dialog rule is 49). |
| GEM-004: shop swatches and rail buttons have no accessible names | P1 | **False.** The rail tabs carry text labels. The swatches are decorative spans inside buttons labelled "Preview <name>", and the theme chips carry `aria-label`. The cited lines are the catalogue table, not markup. |
| GEM-005: DST opens the morning review twice | P2 | **False.** `shouldPrompt()` does not exist. Reviews are keyed by routine day and slot (invariants 145 and 148), and a morning review is not due at 01:30 anyway. A real side point: no inventory mentions DST or time zones, so it is fair to record as a gap in testing. |
| GEM-006: two tabs across an update overwrite the migrated schema | P1 | **Duplicate of DI-04.** The `SCHEMA_VERSION` it cites does not exist; migration runs again, idempotently, at every boot. One nuance is worth adding to DI-04 as a note: `pwa.js:90-91` reloads only the tab that confirmed the update. |

**Coverage ratings that contradict the handoff or the code:**
- **Money rated "Deep, comprehensive".** MG has no inventory, and budgets,
  recurring rules, pots, `kos_money` sync, Hide amounts and the money tools all
  remain (§5.5).
- **"Comprehensive coverage across 42 CS leaves".** CS has 131 leaves, and the
  162-leaf CS/IT worklist is not done.
- **Collection rated "shallow: no dense vault testing".** CL was inventoried on
  the 1,880-title seed, which Gemini's own ORIENTATION shows.
- **Invented features:** Creatives project export and chapters, multi-year term
  goals, and "a 2.5 s+ compile on iPads" (AP never measured iPad timing).
- **Invariant numbers wrong:** "Invariants 5, 6, 7 and 13 probed across
  streaks/gold/XP" (6, 7 and 13 are media schema, stores and push payloads).

**Errors in the executive summary:**
- It names Claude's auditor as `claude-3-5-sonnet`.
- It calls `894a407` "the stopgap commit"; that is a docs commit, and the stopgap
  is `4c3fc33`.
- It describes CO-02 as "C# crashes without Roslyn WASM". CO-02 is the iPhone
  Daily 20 layout, and Gemini's own final record for it says so.

**Proposed root causes:**
- RC-1 split in three and RC-10: restate §6 and SC-21.
- RC-2 (`isolation: isolate` on `.k-pagehead[data-state~="has-art"]`,
  `css/components.css:35`): a correct sharpening, worth a line in §6.2.
- RC-22 to RC-25: each rests on a false GEM finding or duplicates RC-5.
- Several re-summaries mislabel finding ids: AP-15 for view lifecycle; DI-01 as
  "tab desync" (it is a Todoist duplicate); DI-04 as "multi-account".

**Unresolved questions:**
- Worth asking you:
  - the unfinished-session policy (root cause 18);
  - where seals should appear (SC-04);
  - whether a shared browser is a case at all (GEM-001);
  - real-device checks for AX-01 and the iOS keyboard.
- Not worth asking:
  - Santander (already answered in §1.6);
  - the redraw design (already set in §6.1);
  - worker blob URLs (no evidence);
  - the 04:00-versus-midnight question (rests on misread invariants 4, 148 and 5a).

**Omissions:**
- It never notices the four areas still without an inventory (MG, CR, CM, CC).
- No content correctness at all: maths sampling, generators, the M-ref renames,
  CS merged leaves and card keys, `NOT_EXAMINED`, the Exam Companion, IT F201 and
  F206, and whether the C# in the notes compiles.
- It skips Creatives' remaining scope and the handoff's own "not covered" items:
  offline use, Edge Functions, the Google round trip, the Dawn theme in the harness.

## 2. Are the new findings new?

- **Truly new and real:** 0.
- **New, but intended behaviour (P3 question):** GEM-001.
- **Duplicates:** GEM-006 (DI-04), and GEM-002's leftover (CO-19).
- **False:** GEM-002 as stated, GEM-003, GEM-004 and GEM-005.

## 3. Evidence (B), spot-checked on 18 ids

**Verdicts.** In 17 of the 18, my agents reached the same final verdict.

The exception is **SY-01**. Gemini says "partially confirmed, P1". In fact the
stopgap's `scrollers()` (`ui.js:375-377`, `402-406`) keeps scroll everywhere
Claude measured, except the lazily loaded Collection vaults, and those are
already SY-19. So the right verdict is "resolved by the stopgap, with the
remainder in SY-19". Its runtime evidence measured no scroll position at all.
It took the dialog scroll lock (`#stage` overflow hidden) to be the shell.

**SkepticA (the "runtime" step).** It was genuinely runtime in only 5 of 18:
MG-01, AX-01, CO-02, ST-25 and JM-06. In the rest it is a reworded code reading
(the cited `evidence/*.json` has no entry for the id: SY-02, SY-03, SY-04) or
unsupported:
- **GO-23:** the probe errored, and the quoted return shapes do not match `auto()`.
- **SY-18:** its own measurement shows the card survived, yet the step is
  recorded as runtime confirmation.
- **SY-08:** its observed text contradicts its own probe.

**Cited files and lines.** Errors recur:
- `js/engines/exam.js` does not exist (SY-04).
- `store.js:429-434` is the export object, not pagehide handlers (DI-04).
- `router.js:243-245` does not save state (DI-04).
- HR-16 says XP is paid too; only gold is (`governor.js:337`).
- The stopgap is dated `894a407` throughout the SY records.

**Mechanical checks (run myself):**
- **Copied text.** In **56 of the 96** final records, `rootCauseNote` and
  `fixNote` are Claude's own `rootCause`/`fix` copied word for word
  (similarity 1.0).
- **Figures filled in by a script.** `probes/normalize_verification_jsonl.mjs`
  **defaults** `rootCauseAgrees`, `severityAgree` and `fixAgree` to agreement
  when a record left them blank, and stamps a missing time as `09:10:00Z`. So
  "Severity agreement 96/96 (100%)" and "Root cause 95/96" are partly defaults,
  not judgements.
- **Timestamps.** Every blind step is stamped `07:36:00Z` or `07:36:30Z`, and the
  skeptic records carry no `at` or `by`. Blind-first order therefore cannot be
  shown from the data. The blind text itself does read as written before the
  originals: it predicts mechanisms, some wrongly.
- **Evidence files.** All 215 evidence paths exist. There are 22 screenshots in
  `audit-evidence/2026-11/gemini/shots/`.

**Where Gemini added real value:**
- **CO-02:** its root cause is more accurate than Claude's. At 402 px the layout
  is the grid in `study.css:1169`, so the fix needs a `grid-template-columns`
  override like Japanese's and Creatives', not flex stacking.
- **SH-22:** marking it a duplicate of MG-09 is right, and Claude's SH-22 text is
  partly wrong. Money's phone FAB "Add entry" exists (`money.js:158-161`), and
  Overview links to Recurring and Pots.
- **CC-01:** "partially confirmed" is right. Claude's F201 items are covered on
  the Spec tab by `KOS_SPEC_FIX`. The faulty parser is `tools/parse_it.py`, not
  `gen_data.py`.
- **JM-06:** skepticB's note is accurate. Above 860 px on a direct `KOS.show`,
  the Core/Media switch is mounted before the throw, so a desktop recovery path
  exists. It still holds as P0.

## 4. Coverage of B

- All 96 ids in `p0p1-ids.txt` have blind, skepticA, skepticB and final records:
  384 rows, no missing finals and no extra ids.
- Final verdicts: 88 confirmed, 7 partially confirmed, 1 duplicate.
- Whether the skeptics were independent cannot be shown (no timestamps). Measured
  by content, the two read differently in about 13 of the 18 sampled.
- B2 (`--delta`) has not been produced yet, because the last top-ups (MG, CR, CM,
  CC) have not run.

## 5. Misunderstandings of the architecture

- **GEM-001:** misreads invariant 34 (first link) and 31 (local first) as a missing guard.
- **GEM-005:** misreads invariants 145 and 148 (keyed by routine day).
- **GEM-006:** assumes a versioned migration the store does not have.
- **SY-03:** calls same-day re-rating "corrupting scheduling", but invariant 111's
  short-term rule is intended.
- **SY-04:** applies the 15-second retry to task views, which the stopgap holds.
- **Harness versus real iOS:** keyboard and IME claims (SY-08) and iOS input zoom
  (AX-01) are reasoned, not measured on a device. That is fair to say, but they
  are not confirmed on a device.

## 6. Method

- The severity scale was used correctly, except GEM-001's P0, which assumes a
  multi-user threat model.
- The evidence standard was met for the confirmed P0s, but the runtime step was
  overstated in most records.
- Files were saved as it went, which was good, but a normalising script then
  rewrote the final records with default values. That should have been flagged
  rather than reported as measured agreement.

## Follow-ups if you accept (§10.4)

1. **Record Gemini's verdicts on the original findings** as `gverdict`,
   marked "corroboration". Leave severities as they are, except where noted below.
2. **SY-01:** mark "resolved by the stopgap, with the remainder carried by SY-19"
   (Claude's batch-6 re-check agrees). For SY-02, SY-03 and SY-04, the remaining
   severity is lower than P1; propose P2 when the plan is written.
3. **SH-22:** fold it into MG-09 and correct its text: the FAB and the Overview
   links exist.
4. **CO-02:** replace the fix with the grid override. **CC-01:** correct the F201
   items and the parser name. **HR-16:** gold only.
5. **DI-04:** add the update-with-two-tabs note (`pwa.js:90-91` reloads only the
   confirming tab).
6. **§6.2:** add the `isolation: isolate` detail. Add DST and time zones to the
   list of what is not covered.
7. **GEM-001:** ask you as a P3 product question. GEM-002 to GEM-006 are not
   filed.
8. **Before merging:** Gemini's branch is local only. If you accept, merge it
   (docs only, `gemini/`) into the audit branch, or I can copy just the
   deliverables. `consolidate.py` reads only `findings/`, so nothing leaks in.

## Gemini's role in the rest of the programme

**Proposal: no further verification or discovery role.** Possible uses, only
with Claude reviewing the output:
- **Not B2.** The delta will be small (a handful of ids from the MG, CR, CM and CC
  top-ups). Re-checking them myself is cheaper than reviewing another batch with
  this error rate.
- **Not content inventories.** The CM and CC areas need exact checking of facts
  and answers, and its error rate on cited lines (invented functions, wrong
  files) is too high for that.
- **Possible:** drafting a first pass of review-checklist items from FINDINGS.md
  (the user-facing checklist, §1.2 step 5). That is mechanical, easy to check,
  and Claude edits it anyway.
- **Possible:** after implementation, a run of the harness that only measures
  fixed P0/P1 items on its own slots (30–39), with raw outputs committed. Its
  genuine runtime measurements (MG-01, AX-01, CO-02, ST-25, JM-06) were good.
  Its prose was not.

You make the final decision. Nothing from Gemini has been copied into
`findings/`, and its branch is not merged.
