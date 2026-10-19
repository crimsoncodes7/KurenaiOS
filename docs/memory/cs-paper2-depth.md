---
name: cs-paper2-depth
description: "CS Paper 2 at-depth rewrite — worktree, branch, pipeline, and which sections are done (all of 4.5–4.13 done; RELEASED 2026-10-02 with Paper 1 as 87ee60c)"
metadata:
  node_type: memory
  type: project
  originSessionId: 2974d7b7-ecb2-4f87-8ac1-1b275ace1c1d
  modified: 2026-10-01T23:16:48.512Z
---

CS Paper 2 (AQA 4.5–4.13) was rewritten at exam depth on branch **feat/cs-p2-depth** (worktree `/Users/fj/Developer/KurenaiOS-cs-p2`, now removable). It is finished, merged and RELEASED (see below); this note records the method.

Done and committed: 4.5 (cs-p2-45a/45b/455/456a/456b), 4.6 (cs-p2-46a/46b, commit c584e8c) 4.7 (cs-p2-47a/47b/47c, commit a383843; cs-architecture.js retired) and 4.8 + 4.9 (cs-p2-48/49a/49b/49c, commit f8adfe7; cs-networking-ethics.js retired) 4.10 (cs-p2-410a/410b, commit 71f550e) 4.11 (cs-p2-411, commit c13c956), 4.12 (cs-p2-412a/412b, commit c090f93; cs-advanced.js retired) and 4.13 (cs-p2-413). That is all 88 Paper 2 leaves, all guarded by `tools/smoke65.test.js` DONE/KEEP.

Released 2026-10-02 together with Paper 1 and the NEA (see [[cs-paper1-nea]]): main 87ee60c, service worker kos-cs-depth-1, gate 66.

Pipeline for each section:
1. Dump the past-paper packs from `~/Downloads/A-level/Topic Practice/Computer Science — our compilation/` with pymupdf. Render pages to PNG, because the text loses overbars and figures.
2. Verify every answer by program.
3. Write the new file, then strip the old entries with `scratchpad strip_entries.py`.
4. Add a script tag after the previous cs-p2 file.
5. Update smoke65.
6. Check in the browser: preview "kurenai-alt" on port 8125, which needs two reloads because of the service worker. Render the figures in an overlay grid.
7. Commit by name.

Underlined keys use KaTeX `$\\underline{\\textsf{…}}$` (the U() helper in cs-p2-410a.js); a worked step can carry its own `fig`. Boolean expressions use KaTeX `$\\overline{...}$`. Pixel-mode figures come from `{fig:{w,h,items}}` with no x/y.

**Why:** the user asked for the [[maths-notes-depth-rewrite]]-style exhaustive depth for CS, Paper 2 first.
**How to apply:** Paper 2 is finished; next is release work on request, or Paper 1 (4.1–4.4) at the same depth if the user asks. The topic compilation truncates long mark schemes and drops some figures — read the originals in `Past Papers/Computer Science (AQA)/A-level/Paper 2/YYYY-06 MS.pdf`. Check every new leaf's counts before running smoke65 (≥3 worked cards, ≥8 flashcards, ≥4 quiz) — short leaves are easy to miss. kv blocks close `] },`. Scratchpad `aqa.py` is an AQA assembly interpreter and `packs.py` filters the pack dumps (both are session scratch, so recreate them if they are gone). Update the docs (gate 65, PROGRESS/ROADMAP) only at release, and merge, push or deploy only when the user asks.
