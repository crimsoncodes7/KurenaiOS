---
name: maths-notes-depth-rewrite
description: "Project: every maths sub-topic rewritten to exhaustive A-level depth with mark-annotated worked examples and inline diagrams. Pure P1–P10 deployed (e9c6350); Statistics S1–S5 deployed 2026-10-01 (fdc954a); Mechanics M6–M9 deployed 2026-10-01 (9eac539, kos-mech-notes-1); Phase 4 content complete"
metadata:
  node_type: memory
  type: project
  originSessionId: 2974d7b7-ecb2-4f87-8ac1-1b275ace1c1d
  modified: 2026-10-01T12:53:59.720Z
---

The user found the maths notes "extremely light" and asked for every
Edexcel question variation per sub-topic explained AND worked (M1/A1/B1
marks), using the spec (`js/data/maths.js`), the past-paper packs in
`/Users/fj/Downloads/A-level/Topic Practice/Maths — our compilation/`
(QP/MS PDFs per sub-topic, `_manifest.csv`) and formulae-booklet
conventions.

**State on 2026-10-01:** Pure P1–P10 deployed (`e9c6350`). Statistics
S1–S5 merged and deployed 2026-10-01 (release `fdc954a`, service worker
`kos-stats-notes-1`, immutable https://2022f878.kurenai-os.pages.dev):
`js/data/content/maths-stats-s1.js` … `s5.js`,
64 pages, 137 worked examples, 125 derived exam items, smoke63 guards it.
Mechanics refs were renamed S6–S9 → **M6–M9** (user chose M6–M9 over
M1–M4 to keep Edexcel's Paper 3 section numbers): generator
`MECH_SECTIONS` / `--mech-refs`, stored state renamed in store.js
`scrubLegacy → renameRefs`, attachments via `KOS.attach.renameRefs`, old
routes mapped in router. **Mechanics M6–M9 deployed** 2026-10-01
(release `9eac539`, service worker `kos-mech-notes-1`, immutable
https://32db7dba.kurenai-os.pages.dev): `maths-mech-m7.js`
(M6.1+M7), `m8.js`, `m9.js`; 59 pages, 125 worked, 91 exam items;
`maths-applied.js` deleted; smoke63 covers Statistics + Mechanics. All of
Phase 4 content is then done.

**How it was built (repeat per section):**
- One file per spec section (`maths-pure-pN.js`, `maths-stats-sN.js`,
  `maths-mech-mN.js`), `C["maths:ref"] = {notes, flashcards, quiz}`,
  registered in index.html before the bank files. Each
  file ends by deriving `C[k].exam = …examFromWorked(C[k].notes)`; only
  exam-tagged worked cards with a string `q` and "· N marks" in `src` derive.
- Notes PAGED (`{page}`): Overview → concept pages → Exam toolkit.
  Worked `src` = "AS June 2019 · P2 Q1(a) · 3 marks" (P2 = AS Stats paper,
  P3 = A-level). Non-exam variants use tag "variation"/"example".
- Figures: write small helpers inside the file that build `{fig}` specs
  from the numbers (histFig, box, venn, tree, normFig, binomCR, tailFig).
  `accent` and `danger` look alike in Graphite — highlight with
  `accent2`/`accent3`, grey the rest with `muted`.
- Source reading: PyMuPDF text dumps of each pack (footers carry the
  source line). The dumps DROP superscripts and fractions ($t^{1/2}$ read
  as $t$, tan α = 3/4 read as "3") — render every question's expressions
  to PNG and check before computing. Verify every number with scipy/sympy.
- Pitfall: a `{ kv: [ … ] }` block closes `] },`, not `] } },` — syntax
  check each file with node before loading.
- Verify in the built-in browser (dev server `kurenai`, port 8123; the
  service worker serves stale scripts, so reload TWICE): a JS loop over
  the page select counting `.katex-error`, plus a figure grid overlay
  rendering every fig spec; then the full smoke gate (64 suites at the Stats release).

**Why:** the user learns from the app directly; minimal notes and
missing pictures send them elsewhere. See [[notes-layout-and-diagrams]].

- Never `git commit -a` here: the tree carries Live2D art and
  `.claude/launch.json` changes that must never be committed — stage files
  by name.

**How to apply:** all maths sections are now at depth. For any further
content release: bump `sw.js` VERSION with the CLAUDE.md line (smoke47),
`tools/deploy_pages.sh --stage` then deploy, and point
CLAUDE.md/PROGRESS.md/README at the new hash.
