# FSRS — one scheduler for every card (plan, revision 2)

Asked for on 20 October 2026: should flashcards move from SM-2 to FSRS, and
what about the other spaced-repetition parts of the app? About 200 cards are
already on SM-2. They must move across without losing their history or
starting again.

> **Status (20 October 2026):** decisions A–G are taken (§9). Phase 1 is
> built on `feat/fsrs` and held by smoke88 and `tools/fsrs_check.mjs`
> (2,993 of 2,993 review steps match py-fsrs 6.3.2; 100 of 100 SM-2
> conversions hold). Invariant 111. Phase 2 is next.

Short answer: **yes.**
- Build ONE pure FSRS-6 core (`js/core/fsrs.js`, `KOS.fsrs`).
- Move flashcards and Code's retrieval cards onto it.
- The Japanese facets use the same core when they arrive.
- Convert each SM-2 card's state the way Anki does. Every card keeps its
  due date, its lapses and its view count, and the next on-time Good review
  lands exactly where SM-2 would have put it.
- Start keeping a review log now, so FSRS can later be fitted to your own
  memory.

---

## 1. What is there today

| Scheduler | Where | State | Grades |
|---|---|---|---|
| Flashcards (curriculum, custom, AI, personal) | `js/core/srs.js` `step()` | `state.srs[key] = {ef, ivl, reps, due, last, views, lapses, lastRating}` | Again / Hard / Good / Easy, chosen by you |
| Code retrieval cards | `js/core/code.js` `schedule` (≈ line 636), its own copy | `state.code.cards[id] = {due, ivl, ef, reps, lapses, last, n, grade}` | again / hard / good / easy, **derived** from tries, hints and time (invariant 107) |
| Japanese facets (planned, slice only) | `prototypes/japanese-space/jasrs.js` | `{s, d, due, reps, lapses, last}` | derived, 1–4 |

The Japanese slice already runs an FSRS-4.5 model. Shipping it as planned
would give the app three schedulers with three sets of rules.

**What is NOT kept:** a per-card review log. A rating overwrites the card's
state, and the session ledger keeps only each session's totals
(`metrics: {cards, again, hard, good, easy}`). So the history that can be
moved across is each card's current state. A replay of its past reviews
isn't possible. That's why §4 starts a log.

Quiz questions, exam questions and the topic bands have no schedule at all
(§7).

## 2. Why FSRS

- **SM-2's interval is ease × the last interval.** The ease drifts down a
  little with every Hard or Again and almost never recovers ("ease hell").
  It ignores how late you were: a card reviewed 20 days overdue and
  remembered is treated the same as one reviewed on the day.
- **FSRS models each card's memory with two numbers:**
  - **stability S**: the days until recall falls to 90%;
  - **difficulty D**: from 1 to 10.
  It predicts the chance you remember the card today (retrievability R),
  and schedules the next review for when R falls to the retention you ask
  for (default 90%).
- **A late success counts for more.** The stability gain depends on R at the
  moment you answer.
- **On the open benchmark** (millions of Anki reviews), FSRS predicts
  recall far better than SM-2. Users commonly report the same retention
  with noticeably fewer reviews, though how much depends on the deck.
- **It is the current standard:**
  - Anki has shipped it since 23.10 (fsrs-rs 6.6.1 in Anki 26.08);
  - FSRS-6 (21 parameters) is the version in fsrs-rs, py-fsrs and ts-fsrs;
  - FSRS-7 is still in progress and is not targeted here.
- **The exam angle:** it can schedule to a retention target before a date
  (§6, decision E). SM-2 has nothing like that.

## 3. Migrating the 200 cards (the important part)

### 3.1 The conversion

fsrs-rs ships `memory_state_from_sm2(ease, interval, sm2_retention)` for
exactly this. Anki runs it when a deck switches to FSRS without a usable
review log. It assumes the SM-2 interval was set so that recall would be
`sm2_retention` (0.9 by default) at the due date, and solves for S and D:

```
decay  = -w[20]                         (FSRS-6 default 0.1542)
factor = 0.9^(1/decay) - 1
S = max(ivl, S_MIN) · factor / (r^(1/decay) - 1)        → S = ivl when r = 0.9
D = 11 - (ease - 1) / (e^w[8] · S^-w[9] · (e^((1-r)·w[10]) - 1))   clamped 1..10
```

Source: `fsrs-rs/src/model_v6.rs` `memory_state_from_sm2_scalar`, read on
20 October 2026.

**What that gives your cards.** Computed with the FSRS-6 defaults and r = 0.9:

| SM-2 card | → S, D | Next on-time review: Hard / Good / Easy | SM-2's Good |
|---|---|---|---|
| ease 2.50, 6 days | 6, 7.25 | 11 / **15** / 23 | 15 |
| ease 2.60, 15 days | 15, 6.34 | 29 / **39** / 60 | 39 |
| ease 2.36, 6 days | 6, 7.60 | 11 / **14** / 21 | 14 |
| ease 2.18, 3 days | 3, 8.37 | 5 / **7** / 10 | 7 |
| ease 1.70, 4 days | 4, 9.36 | 6 / **7** / 9 | 7 |
| ease 1.30, 2 days | 2, 10.0 | 3 / **3** / 4 | 3 |

So the switch is invisible on the day:
- **Due dates don't move.** S = the interval, and FSRS at 90% schedules at
  S, so every card stays due when it was. Today's "0 due" stays 0.
- **The next on-time Good matches SM-2**, as the table shows.
- **After that, FSRS takes over.** Late answers, Hard and Easy all move the
  card the FSRS way.
- **Kept on every card:** `views`, `lapses`, `last`, `lastRating` and the
  SM-2 key (invariant 87).
- **Kept as a read-only record:** the old `ef` (§3.3).

### 3.2 The edge cases

| Card | Rule |
|---|---|
| Never rated (`views` 0 or no record) | New. It enters FSRS on its first rating (S = w[g-1], D = D0(g)). |
| Rated, interval ≥ 1 | The conversion above. |
| Lapsed and still due today (`ivl` 0 after Again) | Relearning: S = the FSRS "Again" stability for a converted card. That is `min(S_forget, S_converted)`, with S_converted taken from the interval it had before the lapse (or 1 day if unknown) and D from its ease. It stays due today, exactly as now. |
| Overdue at the switch | Unchanged. The elapsed days since `last` feed R when you next answer, so the late success is credited (SM-2 ignored it). |
| Rated more than once today (the in-session Again requeue) | The FSRS-6 same-day rule (`w[17..19]`), which py-fsrs and Anki use for reviews under a day apart. |

### 3.3 How it rolls out safely

- **One boot pass, `KOS.srs.migrate()` and `KOS.code.migrateCards()`** (in `main.js`, beside the other boot migrations) adds
  `s`, `d` and `fl` (the day FSRS last moved the card) to every rated card.
  It writes nothing else.
- **The old fields stay:**
  - `ef` is kept and no longer moved;
  - `ivl` keeps meaning "the current interval in days", so every reader of
    `ivl` still works;
  - `reps` keeps counting.
- **A card rated by an old copy of the app gets re-converted.** Another
  device can run the previous version until its service worker updates. If
  that copy rates a card, `last` moves and `fl` doesn't. Any card with
  `last ≠ fl` is re-converted from its `ef` and `ivl` before its next FSRS
  rating, so the two versions can't corrupt each other through the cloud
  merge. This also keeps every test fixture written with `ef` working.
- **A render writes nothing** (smoke56). Pages read S and D through
  `KOS.srs.peek()`, which converts on the fly for a card the boot pass
  hasn't reached. A write happens only on a rating or in the boot pass.
- **Rollback is free.** The previous release still reads `ef`, `ivl`, `reps`
  and `due` and simply carries on from there.
- **A backup taken before the switch** (`exportFull`) imports into the new
  version through the same converter.

### 3.4 The conversion retention (decision B: fixed 0.90)

The conversion asks what retention SM-2 gave you (`sm2_retention`). The
ledger could estimate it, but with about 200 cards that estimate is noisy.
**Decided: a fixed 0.90.** That gives strict `S = interval` parity on day
one, so every interval stays exactly predictable.

## 4. The review log (start collecting now)

- **The defaults come from about 700 million Anki reviews.** Fitting the 21
  parameters to your own reviews (the "optimiser") usually helps once there
  are about 1,000 reviews. The app has none, so the log starts on day one.
- **One row per rating:**
  - `{key, ts, day, g, elapsed, s0, d0, s1, d1, src}`;
  - `src` is `flashcards`, `due`, `code` or `ja`;
  - no card text, about 60 bytes a row.
- **Where (decision C):** recommended in a new IndexedDB database,
  `kurenai-os-reviews`, the way `kurenai-os-reports` holds derived data:
  - not the state document, because 10,000 rows would be too heavy to sync;
  - included in `exportFull`;
  - replicated to an owner-only Supabase table later, the same pattern as
    `kos_reports` (invariant 102e), so a second device's reviews join the
    fit.
- **The optimiser itself is phase 3:**
  - fsrs-rs is published as WebAssembly (`fsrs-browser`), so it can run on
    the device;
  - "Optimise" in the Review settings, with a "what changes" preview;
  - the fitted parameters sync in the state document.

## 5. The core

`js/core/fsrs.js` (`KOS.fsrs`), pure, also loadable in Node:

```js
KOS.fsrs = {
  W,                                // FSRS-6 defaults (21)
  retrievability(elapsedDays, s, w),
  review(card, g, day, opts)        // → next {s, d, due, reps, lapses, last}; g 1–4
  preview(card, g, day, opts)       // the interval each grade would give
  fromSM2(ease, ivl, r, w)          // §3.1
  interval(s, retention, w, opts)   // with the cap and fuzz of §6
}
```

- **Days are whole local days**, as `srs.js` uses now.
- **`srs.js` keeps everything that isn't scheduling.** That means keys, the
  card registry, the due queue and custom cards. Its `step()` and
  `preview()` call the core.
- **Code's scheduler calls the same core.** Its grades already map 1:1, and
  its first exposure stays "due in two days" (FSRS-6's Good S0 is 2.3, so
  that's almost the same).
- **`jasrs.js`, when Japanese is built, uses the core** instead of its own
  FSRS-4.5 copy, and keeps its facet, burying and load-control logic. The
  Japanese plan §9 gets a line saying so.
- **Checked against the reference:** `tools/fsrs_check.mjs` replays fixed
  review sequences through `KOS.fsrs` and through py-fsrs (pinned to a
  version), and fails on any difference beyond 1e-4. It's the same idea as
  `cs_diff.mjs` for C#.

## 6. Scheduling choices (decisions A, D, E, F)

- **A — target retention:** 0.90 by default, set in the Review settings
  (0.80–0.95, with the forecast workload beside it). Recommended: 0.90.
- **D — the ease figures on screen become FSRS figures:**
  - the card info panel shows Difficulty, Stability and "recall today ≈ 87%"
    instead of "Ease factor";
  - Card Stats' "Ease distribution" becomes a Difficulty distribution plus a
    retrievability histogram;
  - RAG (`rag.js`) reads difficulty and R instead of the ease sum.
- **E — exam-aware cap (phase 2, decided with a safeguard):** for an exam
  subject, an interval that would end after that subject's next real exam
  is considered against the exam date:
  - **If the card's predicted recall ON the exam date is already at or
    above the target, it is left uncapped.** For example, S = 90 days with
    the exam in 30 days needs no extra look.
  - **Otherwise it is capped into a 7–14 day window before the exam**, at a
    day picked by the same deterministic hash as the fuzz. The capped
    reviews are spread across the window rather than piled up the day
    before.
  - It reads "the next real exam" per subject (the calendar's real exams
    today; an Exams section could own it later).
  - Code (not an exam subject) has no cap.
- **F — fuzz:** the standard FSRS fuzz (±5–15% from 2.5 days up), taken
  from a hash of the card key and the day rather than `Math.random`. The
  pick floors where py-fsrs rounds: py-fsrs's rounding can land one day
  past its own window, and the floor keeps it uniform and inside. The
  preview then always matches the rating, and two devices agree. It stops
  200 cards learnt on one evening from falling due on the same day forever.

## 7. The other spaced-repetition parts (later phases, each optional)

1. **Topic memory.** A topic's recall today is the mean R of its rated
   cards. Home's "what next" and the RAG score can then say "Hashing: recall
   down to 71%" rather than counting overdue cards. This is a read only, so
   it adds no state.
2. **Missed questions get a schedule.** A quiz or exam item you get wrong
   becomes a review item (`q:<sid:ref:i>`) on the same core, shown in Review
   beside flashcards. This is a new source with keys, not a new scheduler.
3. **Leeches.** A card with 8 lapses (the Japanese plan's rule) is suspended
   into a "Rework" list that offers its topic's notes, instead of drilling it
   again.
4. **Load control.** The Review page forecasts the next 7 days' minutes, as
   the Japanese plan does, and can cap new cards a day.

## 8. Releases and gates

| Phase | What | Gate |
|---|---|---|
| 1 | `KOS.fsrs` core; `tools/fsrs_check.mjs` against py-fsrs; flashcards and Code on the core; the boot pass (`KOS.srs.migrate`, `KOS.code.migrateCards`); the stale-copy rule; the review log; the UI figures (D); fuzz (F) — **built** | new smoke88 (conversion table, edge cases, render purity, cloud-merge of a mixed old/new card, Code grades), the full gate, `fsrs_check` |
| 2 | Exam-aware cap (E); topic memory (§7.1); leeches (§7.3) | smoke88 extended |
| 3 | The optimiser (WASM) once the log holds about 1,000 reviews; log replication | smoke89 |
| later | Missed-question deck (§7.2); load control (§7.4) | — |

**What changes in CLAUDE.md, in the same commits:**
- a new invariant, "one scheduler", at the next free number (the
  Japanese drafts, 111–117, are not built yet and renumber after it);
- invariant 87 is reworded from "SM-2 key" to "schedule key";
- invariant 107 notes that Code's retrieval scheduling uses `KOS.fsrs`;
- the ownership map gains `js/core/fsrs.js`.

No Governor traffic changes: a rating still pays exactly what it pays now.

## 9. Decisions (taken 20 October 2026)

| | Question | Decided |
|---|---|---|
| A | Target retention | 0.90 by default, adjustable 0.80–0.95 on Card stats (the Review workspace's settings card), with the reviews a day each target asks for |
| B | The retention used to convert the SM-2 cards | **a fixed 0.90**: strict `S = interval` parity on day one |
| C | Where the review log lives | local IndexedDB `kurenai-os-reviews` and the full backup now, Supabase replication in phase 3 |
| D | Replace the ease figures with difficulty, stability and recall | yes: the card panel, Card stats and RAG |
| E | Cap intervals at the next real exam | phase 2, exam subjects only, with the safeguard in §6 |
| F | Deterministic fuzz | yes (key + day) |
| G | Code's retrieval cards on the same core in phase 1 | yes |
