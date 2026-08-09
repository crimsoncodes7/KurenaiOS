# Category 7 — Phase G pre-implementation findings

Baseline: `main@c65be20` (integrated Categories 7A–F). This inventory was recorded before any Phase G production-code change.

Evidence: the dense responsive audit completed 192 core cells (24 views × 4 widths × 2 themes) and 16 additional cells (four omitted views × 2 widths × 2 themes), with zero reported edge overflow, amputated text, or tab-bar overlap. The specialised visual audit also passed. Manual screenshot and live-browser review remains necessary because clipped descendants inside an `overflow:hidden` app shell are outside the geometry probe's document-width signal.

Severity at baseline: **P0 0 · P1 1 · P2 8 · P3 6**.

## Global consistency

- **P2 — suppress non-information statistics.** Card Stats, Goals, and Exams & Papers render zero or em-dash tiles that add weight without information. Keep meaningful totals; omit unavailable/zero secondary metrics and let the shared stat shape reflow.
- **P3 — converge remaining bespoke empty panels.** Card Stats, Personal Deck, Seasonal, and signed-out provider profiles still use ad-hoc `fc-empty` / `med-empty` compositions. Adopt `KOS.ui.emptyState` without changing the owning workflow.
- **Preserve.** Existing router, history, search controller, dialog, tabs, focus management, mobile shell, data schemas, and session/reward behavior are outside Phase G.

## Charts and data visualisation

- **P1 — Card Stats strip clips in a low-data 1440px state.** Seven `min-width` flex tiles can exceed the available main column while the app shell hides the spill. Convert this page's strip to a responsive minmax grid; dense 1920/1440 and compact 820/390 states must all remain legible.
- **P2 — low-data Card Stats has a false dashboard.** Seven mostly-zero tiles followed by plain prose implies analytical depth that does not exist. Show the in-scope card count as context and one shared empty state until review data exists.
- **P3 — chart microcopy is too small.** Keep the existing inline-SVG axes, gridlines, legends, and semantic labels, but bring visible captions to the practical 11px floor. Do not add a charting library or alter aggregation.

## Empty states

- **P2 — Seasonal reserves too much vertical space.** Its large dashed panel is disproportionate when filters and actions already remain on the page. Use a compact shared empty state with the existing Sync and Find actions.
- **P2 — Personal Deck is visually unfinished.** A lone centred paragraph leaves an unstructured blank workspace. Use one compact shared empty state and retain the canonical route to create/review cards.
- **P3 — provider profile guidance is incomplete.** Signed-out AniList/VNDB states should explain that credentials stay on this device, then point to the existing Sync & Import route.
- **Preserve.** The Assistant's character-led first-run composition and specialised media failure notices are deliberate branded surfaces, not generic empty states.

## Typography

- **P2 — visible micro-labels fall below 11px.** Priority examples are Goal summary labels, tracker metadata, Card Stats captions, Calendar event text, Governor instrument labels, and Focus “deal” headings. Raise visible prose/labels to at least 11px; leave purely decorative glyph geometry alone.
- **P3 — Focus economy prose uses identifier typography.** The “deal” panel reads like source output because values use the mono face. Reserve mono for codes, timestamps, and identifiers; render reward prose in the sans face with tabular numerals.
- **Preserve.** Shrine Display remains the expressive heading/display face; body copy remains the sans face; code and specification references remain mono.

## Spacing and surfaces

- **P2 — compact tab groups wrap accidentally.** Governor's four local tabs produce a 3+1 orphan on phone; tracker kind tabs form an uneven vertical pair. Give each a purposeful compact composition (2×2 Governor, one equal two-column tracker row).
- **P3 — some empty/signed-out panels are taller than their information.** Keep non-dominant empty states under roughly 120px of reserved body height where actions remain visible.
- **P3 — literal surface shadows remain.** Replace hard-coded warm/black shadows only where they describe UI elevation; retain art/image overlay shadows and focus rings.

## Iconography

- **P3 — Shrine missing-art presentation is blank rather than intentional.** Add a restrained branded fallback mark/wash inside the existing feature geometry; do not add or regenerate artwork.
- **Preserve.** Current kanji/glyph accents are part of the atelier identity. No icon-library migration or new raster asset is planned.

## Controls

- **P2 — Governor Gold is visualised as progress.** Gold is a balance, not a bounded completion metric; remove its progress bar while retaining the locale-formatted balance and affordability hint.
- **P3 — Shrine's “Add hall note” action lacks control prominence.** Strengthen the existing button's local styling without changing its editor or semantics.
- **P3 — Reminders' compact search hint is crowded.** Shorten the phone placeholder presentation while preserving the existing input and filtering behavior.

## Remaining POLISH pages

- Card Stats: responsive metric composition, honest low-data state, chart-caption floor.
- Goals: keep the active campaign summary; suppress zero-value secondary metrics and let the summary grid adapt.
- Exams & Papers: suppress unavailable secondary statistics and regularise the compact kind switcher.
- Governor: remove the Gold progress metaphor and regularise compact tabs.
- Focus: refine the deal-panel type treatment without touching timer state.
- Seasonal, Personal Deck, AniList/VNDB profiles: shared compact empty-state treatment and clearer guidance.
- Shrine: hall-note affordance and missing-cover fallback.

## Visual bugs and regressions

- **Confirmed:** Card Stats low-data metric strip can be visibly clipped despite a zero-overflow audit result.
- **Not reproduced:** theme-specific geometry drift, horizontal document overflow, amputated text, tab-bar content overlap, Focus setup/dock overflow, or Calendar breakpoint staleness.
- **Harness gap:** the default responsive view list omits Card Stats and four profile/specialised views; Phase G verification must include them explicitly.

## Implementation boundary

Phase G will make only scoped rendering/CSS/test/documentation changes for the findings above. It will not change navigation, browser history, search ranking/data, focus semantics, accessibility contracts, provider sync, rewards, generated curriculum data, or any `art-source/` / Krita file.
