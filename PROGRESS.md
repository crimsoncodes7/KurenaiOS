# Content Progress

## Completed (deep content exists — DO NOT rewrite)
(All deep content for CS is 100% complete. Every single sub-topic (176 entries) has undergone a "True Exhaustive" audit, meaning zero aliases remain. Each point has unique notes, boxed terminology, interactive diagrams, and robust code coverage.)
maths: 1.1
maths: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11
maths: 3.1, 3.2, 3.3, 3.4
maths: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
maths: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9
maths: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
maths: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
maths: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
maths: 9.1, 9.2, 9.3, 9.4, 9.5
maths: 10.1, 10.2, 10.3, 10.4, 10.5
maths: S1.1, S2.x, S3.x, S4.x, S5.x, S6.x, S7.x, S8.x, S9.x

## Notes for Gemini (content authoring)
- **Massive Pure Maths Push Complete**: All Pure Mathematics topics (P1–P10) are now implemented with exhaustive, boxed content.
- **Applied Maths Push Complete**: All Statistics (S1–S5) and Mechanics (S7–S8) topics are now implemented with exhaustive, boxed content.
- **True Exhaustive Audit 100% Complete (CS)**: Removed all aliases and deepened every point.
- **Spec Data Sanitized**: Fixed structural errors in `compsci.js` and `maths.js`.
- **Diagrams Wired**: Multiple interactive simulations linked to relevant CS and Maths topics.

## Queued — Maths (Gemini to write)
(All Mathematics topics are complete)

- **Maths Applied Complete**: Final pass complete, including fixing the S9.1 formula markdown.
- **IT F201 100% Visual Audit**: Every sub-topic in F201 has been meticulously refactored to eliminate plain text lists. Everything is contained in high-impact callouts, steps, or tables.
- **Enhanced IT Code**: Added JSON, XML, Hadoop, and ML logic blocks to F201.

## Queued — IT (Final Note)
(Gemini build for IT concluded with F201 as requested. No further IT units will be implemented.)


## Build 2.0 — "Higanbana" UI/UX overhaul (Claude Code, 2026-06-13)
Full visual rewrite of `css/main.css` to a premium near-black dark theme, plus
supporting wiring. No engine/data-model behaviour changed — every class name and
DOM structure the views/engines/tests rely on was preserved.
- **Design tokens**: complete `:root` system (surfaces, hairlines, brand, status,
  subject hues, type, spacing scale, radii, elevation, motion curves).
- **Fonts** (Google Fonts): Inter (UI/body), Space Grotesk (display chrome),
  JetBrains Mono (refs/code), Shippori Mincho (紅 mark + verbatim spec wording).
- **Ambient flora**: lycoris-radiata (spider-lily) petals drift behind the OS via
  the `.bg-flora` layer in `index.html` + CSS keyframes; corner crimson/violet
  glow washes. Fully disabled under `prefers-reduced-motion`.
- Glassmorphism on topbar/rail/tree/toast/modal (backdrop-blur), accent glow rails,
  3D flashcard flip, animated obi progress, staggered callout entrances, view
  transitions, restyled buttons/tabs/cards/sims, full responsive pass (no h-scroll).
- **New**: copy-to-clipboard button + language tag on every `{code}` block
  (delegated handler in `js/core/content.js`); the topic status/checklist row is
  now a sticky frosted control.
- KaTeX `<script>`s now use `defer` (faster paint; also stops smoke2's naive
  `<script src>` regex from trying to read the CDN URLs as local files).

## Fixes applied this turn (were breaking load / smoke2)
- **Syntax**: 6 callouts across `cs-theory-computation.js` /
  `cs-theory-computation-2.js` were missing their closing `}` (`body: "…"` then a
  lone `},`). These threw on load — fixed to `… }},`. (See AGENTS.md pitfall note.)
- **Orphan content**: `it:F201.5.3` ("NEA Units") is a non-leaf header with no child
  leaves, so its "Big Data case studies" content was unreachable AND failed smoke2.
  Disabled (commented, verbatim) in `it-f201.js` — **GEMINI: re-home it to a real leaf.**
- **Wiring**: `maths:2.3` now declares `gens:["quad"]` so the matching worked-example
  generator (which already targets ref 2.3) appears on its Notes page.
- **Stale test fixture**: smoke2's "plain ref" check used `it:F201.2.1`, which Gemini
  later enriched; repointed to `it:F200.1.1` (still genuinely plain). Intent unchanged.

Both `tools/smoke.test.js` and `tools/smoke2.test.js` now pass clean.

## For Gemini — content follow-ups
- Re-key the disabled `it:F201.5.3` case-study content onto an actual content leaf.
- New `{code}` blocks automatically get a copy button + language tag — no action needed.
- Reminder: every `{callout:{…}}` must close with **two** braces. Validate with
  `node --check FILENAME` (catches the missing-brace error instantly).

## Claude Code backlog (app features)
- Build 2 (gamification): Behavioural Governor (avatar, focus timer, SM-2 engine)
- More simulations (Karnaugh maps, projectile motion)
- Build 3: Kurenai Collection Matrix
