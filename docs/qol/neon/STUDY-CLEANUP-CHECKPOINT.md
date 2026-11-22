# Study Content, Layout & Deduplication Cleanup — Checkpoint (`neon/study-cleanup-1`)

> **User-Authorised Study Cleanup Branch:** Cut cleanly from `origin/main` (`f26102f5`). Completely independent of `neon/qol-batch-6` and `neon/user-custom-1`. Explicit user permission to edit study renderers, CSS, canonical content source files (`js/data/content/*.js`), build scripts, and `tools/smoke200.test.js`. Never hand-edit generated spec outputs (`js/data/compsci.js`, `maths.js`, `it.js`) or touch `smoke198.test.js` / `smoke199.test.js`.

## Batch Status

| Batch | Scope | Status | Commit | Key Gates |
|---|---|---|---|---|
| **Batch 1** | Renderer, CSS & `examFromWorked` fixes + `tools/smoke200.test.js` | **DONE** | `770a5ed1` | `smoke200` 4/4, `smoke55` 14/14, `smoke56` pass, `smoke142` 12/12, `smoke153` 8/8, `smoke155` 10/10, `smoke197` 4/4 |
| **Batch 2** | Computer Science Part 1 (`4.1–4.4`: `cs-p1-*.js`, `bank-cs-41..44*.js`) | **DONE** | `ed30b976` | `srs_guard` 0 shifts (`-45` FC, `-16` Qz), `validate_content` 0 errs, `card_lint` 0 flagged, `smoke65`, `smoke66`, `smoke153`, `smoke155`, `smoke197`, `smoke200`, `smoke142` |
| **Batch 3** | Computer Science Part 2 (`4.5–4.13`, `cs-m-*.js`, `cs-nea.js`, `bank-cs-45..413.js`) | **DONE** | `8e367105` | `srs_guard` 0 shifts (`-61` FC, `-18` Qz, `-13` Ex), `validate_content` 0 errs, `card_lint` 0 flagged, `smoke65`, `smoke66`, `smoke153`, `smoke155`, `smoke197`, `smoke200`, `smoke142` |
| **Batch 4** | Mathematics Part 1 (Pure: `maths-pure-*.js`, `bank-maths-pure-*.js`) | **DONE** | `657f56ad` | `srs_guard` 0 shifts (`-74` FC, `-79` Qz, `-10` Ex), `gen_moved_cards --check` 78 cards, `fill_check` OK, `card_lint` 0 flagged, `smoke116`, `smoke138`, `smoke142`, `smoke153`, `smoke155`, `smoke197`, `smoke200` |
| **Batch 5** | Mathematics Part 2 (Stats & Mechanics: `maths-stats-*.js`, `maths-mech-*.js`, `bank-maths-stats.js`, `bank-maths-mech.js`) | **DONE** | *(pending commit)* | `srs_guard` 0 shifts (`-78` FC, `-67` Qz, `-5` Ex), `gen_moved_cards --check` 78 cards, `fill_check` OK, `card_lint` 0 flagged, `smoke116`, `smoke138`, `smoke142`, `smoke153`, `smoke155`, `smoke197`, `smoke200` |
| **Batch 6** | IT: Data Analytics (`it-*.js`) | **NEXT** | — | `fill_check.mjs`, `card_lint.mjs --check`, `smoke153`, `smoke156`, `smoke197`, `smoke200` + SRS key-stability check |
| **Batch 7** | Other Study Spaces (Code, Japanese, Mind, Creatives) | Pending | — | `code_unit_check.js`, `ja_valid_check.mjs`, `mind_tree_check.mjs`, `smoke74`, `smoke76`, `smoke92`, `smoke100`, `smoke105`, `smoke108`, `smoke200` |
| **Batch 8** | Cross-Topic Final Deduplication Pass, Before/After Counts & Full `SMOKE_JOBS=3 npm test` Gate | Pending | — | Full release gate (181/181) + final boot bytes |

## Baseline Inventory (Start of `neon/study-cleanup-1`, `f26102f5`)

| Subject / Space | Topics | Flashcards | Quizzes | Exam Qs |
|---|---:|---:|---:|---:|
| Computer Science | 131 | 2,000 | 1,419 | 994 |
| Mathematics | 89 | 1,485 | 1,074 | 969 |
| IT: Data Analytics | 49 | 698 | 343 | 194 |
| Code | 179 | 1,077 | 568 | — (258 tasks / 135 cards) |
| Japanese | 28 | — | — | — |
| Mind | — | — | — | — |
| Creatives | 24 | 118 | 0 | 0 |

## Boot Bytes Log

- **End of Batch 1:** `5,359,385` B (`5.1111 MB`) against `5,400,166` B (`5.15 MB`) cap — **`39.83 KB` free**.
- **End of Batch 4:** `5,359,380` B (`5.1111 MB`) against `5,400,166` B (`5.15 MB`) cap — **`39.83 KB` free**.
- **End of Batch 5:** `5,152,600` B (`4.9139 MB`) against `5,400,166` B (`5.15 MB`) cap — **`241.76 KB` free**.
