# User reports, 2 Nov 2026 (after the handoff) — ids UR-n

Reported by the user in chat with four screenshots (Google Calendar vs the
KurenaiOS calendar on the iPad; an iPad topic page in Side by side scrolled
to an empty notes pane; the avatar badge with half an HP ring). Status:
**reported, not yet verified unless marked.** Check each against the code
and the app before planning.

## Integrations (the user allowed testing on all of them on their account)
- **UR-1 Google Calendar: single-occurrence edits not reflected.** Monday and
  Tuesday repeating events changed "just for today" in Google Calendar did
  not appear in KurenaiOS, even after a manual resync; later they DID show on
  the iPad. Suspect: exceptions (moved/cancelled instances) only land on the
  device that holds the lease / the read-only copy `ext.g.skip` + `roOn`
  is per device (media kv), and the pull is per device — so devices disagree
  for a while. Screenshots: Google shows "Commute Home / Reset 3:35–4:30" etc.;
  KurenaiOS shows the series' times. See LA notes for verification.
- **UR-2 Todoist sections → Inbox.** Two Todoist projects, Admin and NEA, had
  sections. On linking them to Reminders, every task was moved out to the
  Inbox. The user moved them back into their projects and sections twice; each
  next sync moved them back to the Inbox. See LA-24 for the root cause.
- **UR-3** Device continuity: a review completed on one device must still be
  done on the other (the review state does not carry across, or the other
  device offers it anyway).

## Focus / sessions
- **UR-4 (data loss, P0 candidate) A completed Focus session was removed from
  the Session log and the session resurrected paused.** On 1 Nov the first
  account's audit opened the app in a second Chrome tab while the user's own
  tab had a paused Focus session; the audit minimised the overlay in its tab.
  The user then resumed and COMPLETED the session in their own tab. When they
  later closed the audit's tab and returned to theirs, the timer was back,
  paused where the audit tab had left it, and the completed session was gone
  from the Session log. This is DI-04 (two tabs, whole-document
  last-writer-wins) causing real loss of a paid session; the audit's tab was
  the stale writer. Priority for W1.
- **UR-5** iPhone: a Focus timer may stop when the screen turns off (seen
  about a month ago, not re-tested). Check wake/visibility handling and how
  elapsed time is recomputed on return.
- **UR-6 QoL** Continuity across devices: a Focus timer or routine timer
  started on one device can be picked up on another (optional setting).

## Ink / Handwritten (iPad)
- **UR-7 Bug** Clip to page from a notes block: the clipped picture
  DUPLICATES the block's text in places and sometimes does not capture the
  whole block.
- **UR-8 Bug** Side by side: the notes pane can scroll past its content into
  empty space ("The three laws" heading, then nothing; screenshot).
- **UR-9 QoL** Lasso/move across pages; lasso parts of an image; lasso is
  "iffy" in general.
- **UR-10 QoL** Paste an image directly onto the Handwritten tab on the iPad
  (⌘V works on the Mac only?).
- **UR-11 QoL** Add/delete pages directly on the Handwritten tab (today a page
  is added only by writing past the bottom margin).
- **UR-12 QoL** More formatting: tables and Word-like features in notes/ink.
- **UR-13 QoL** Copy/paste of text is awkward in general.
- **UR-14 Backlog** Folders for notes that do not belong to a topic (and maybe
  topic notes too), to keep random notes organised.

## UI
- **UR-15 Bug** The rail's avatar badge (bottom-left) shows only half its HP
  ring (cut off at the top/bottom; screenshot shows the top cut by the banner
  crop on the Seat as well).
- **UR-16 Bug** Assistant view: when Kurenai floats higher her head is cut off
  (iPad, maybe elsewhere); the oval aura behind her is not centred; she is not
  centred and has a lot of empty space above her.
- **UR-17 Bug (systemic)** On the phone and iPad many things that should be
  circles render as ovals (squeezed). Cf. AG-06, AG-15, AG-02, CR-07,
  CO-01, invariant 69 (round controls must raise width with the 44px height).
- **UR-18 QoL** A toggle to collapse Kurenai's drawer in the Assistant view.

## Pacing
- **UR-19 QoL** Easier migration: when class runs a week ahead of the plan,
  shift the plan (class and/or "My plan") by N weeks in one action instead of
  moving rows by hand (the user has asked Claude to do it twice before).

## Added later on 2 Nov
- **UR-20 (P1, root cause read from code) Goals: "Complete a number of titles" from Mon 2 Nov to Sun 8 Nov was "Met" at once with "666 titles of 3", and paid a badge.** `titles-completed` (js/core/goals-collection.js:49-53) returns the vault's whole completed count; the file's own header says the Collection types "measure the vault as it stands (not a date range), so none of them repeats" — yet the editor offers a start date and a deadline, and the line ("0.4 titles by today") is drawn as if it were a range. Same for episodes-watched, chapters-read, volumes-read and filtered-completed. Consequences: an instantly met goal, a goal-completion receipt, and an Achievements badge that invariant 162 never takes back. Fix: measure the PERIOD — completions (and episodes/chapters/volumes) whose journal event (`journal` [ts, kind, from, to], mediadb.js:443+) falls inside [start, deadline] — or, for a "state" goal, record the baseline at creation and count from it; refuse dates on a type that cannot read a range; let repeats work for these types. Then decide with the user whether the badge earned by this goal is revoked (it would need an explicit exception to invariant 162) — screenshot in chat (Goals › Collection, "Met", milestones 1/2 reached).
- **UR-21 (P1, hypothesis to verify) Collection "Recently updated" and Reports list titles untouched for years (e.g. Death Note manga, read 2–3 years ago).** Evidence that fits: the last autosync (LA-28) reported anime "updated 713" against 711 local rows and paid a status reward for "Death Note → on hold, 0 units" and "Aku no Kyouten → completed" — rewards should only follow a real change. Hypothesis: two AniList list entries fold onto ONE local row (shared MAL id / title claim, or a manga and its one-shot), so each pull overwrites that row with the other entry's status/progress: the merge restamps `updatedAt`, the journal gains status events (Reports read them as activity), and the reward watermark pays again. Verify: in the user's app, list rows whose `journal` has status/progress events on every recent sync day; for Death Note, compare `anilistId`/`malId` with the user's AniList entries; then read `bulkUpsert`'s merge and `foldLocal` (mediadb.js ~1012–1100) and invariants 11, 17, 36a, 90, 93. Also check whether rows are restamped without any material change (invariant 36a) — the "updated 713" count alone does not prove it.
