---
name: cs-paper1-nea
description: "CS Paper 1 (4.1–4.4) at depth with C# code, and the NEA as a project companion — RELEASED 2026-10-02 as 87ee60c (immutable https://bfb13afc.kurenai-os.pages.dev, sw kos-cs-depth-1)"
metadata:
  node_type: memory
  type: project
  originSessionId: 2974d7b7-ecb2-4f87-8ac1-1b275ace1c1d
  modified: 2026-10-02T16:51:48.152Z
---

Requested 2026-10-02: Paper 1 (4.1–4.4, 63 leaves) at the same depth as Paper 2, **C# for all code**; the NEA "done differently, in a suitable manner since it's a project".

**Status: released 2026-10-02.** feat/cs-p1-nea (which carried Paper 2) was merged with main's UI review fixes (8daa00f, another session's work, committed at the user's request) and fast-forwarded into main as release 87ee60c, then the docs baseline e4a48bc; pushed and deployed (https://bfb13afc.kurenai-os.pages.dev, service worker kos-cs-depth-1, smoke gate 66). The worktree `/Users/fj/Developer/KurenaiOS-cs-p2` can be removed.

**Commits:**
- NEA: a06b106;
- 4.1.1: 012969c and ba76bc2;
- 4.1.2: f5c352e;
- 4.2: c3d5867;
- 4.3: eccf318;
- Paper 2 / NEA bare-paragraph conversion: 5a58913;
- 4.4.1: 850bd7b;
- 4.4.2–4.4.3: f9b0d06;
- 4.4.4–4.4.5: fc9116c.

**Files:**
- Paper 1 is cs-p1-411a, 411b, 412, 42a–d, 43a–c, 441, 442 and 444.js.
- Every pre-rewrite CS content file has been retired: cs-programming, cs-databases-sys, cs-datastructures, cs-algorithms(-2), cs-theory, cs-theory-computation(-2).
- The bank-cs-*.js extensions are kept as supplementary items.

**NEA.**
- The NEA section in `js/data/compsci.js` is hand-authored and follows the AQA 4.14 criteria, with NEA.0 added.
- NEA.1 and NEA.2 must stay, because the pacing seed links them.
- Each leaf in `cs-nea.js` is a project guide with no exam items.
- Two free labs in the "NEA project" area (`js/labs/nea-tools.js`): nea-objectives and nea-marks.

**Guards (smoke66):**
- A: every leaf is paged; has ≥3 worked cards, a mnemonic (t:"mnemonic"), a misconception callout (t:"miscon"), a "Synoptic links" tip, an "Exam toolkit" page, ≥8 flashcards and ≥4 quiz items.
- B: exam items derive from the cards. NOT_EXAMINED = 4.4.1.5, 4.4.1.6 and 4.4.4.1; such a leaf needs a "How AQA examines it" callout and no exam cards.
- C: all 63 Paper 1 leaves are covered.
- D: KEEP lists the labs (tl-*, fsm-lab).
- No exam item is filed twice; a moved item leaves a "Worked elsewhere" pointer.
- There are no top-level bare strings: `tools/validate_content.js` reports 0 errors for cs-*.
- smoke43 now picks a topic with 3+ pages.

**Method:**
- Original papers are in scratchpad `p1/{AL,AS}_YYYY-06_{QP,MS}.txt`; packs come from packs.py.
- C# is verified with `dotnet run file.cs` in scratchpad `p1cs/`.
- Diagrams lost from a paper are redrawn so the mark scheme's labels hold, and the caption says so.

**smoke56 drift.** The seed (tools/lib/seed.js) reviews the first 40 CS leaves. The three rename rules at the top of tools/baselines/render-purity.renames.json map 203/158 to **210/163**. Recompute these if Paper 1 flashcards change (scratchpad due.js).

**Why:** the user wants exhaustive exam depth, plus NEA support shaped like a project.

**How to apply:** this work is done and live. Any further CS content edits go to the cs-p1-*/cs-p2-*/cs-nea files under the smoke65/66 contract. The smoke7 "lastSyncedAt not updated" flake was fixed on 2026-10-02 (the test now polls the stored record instead of reading it once).