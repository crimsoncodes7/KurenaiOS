---
name: project-branch-and-release-state
description: "Which git branch is live, what is deployed, what is unpushed — check git before trusting this; it was true on 2026-10-20"
metadata:
  node_type: memory
  type: project
  originSessionId: 2e2dc728-9366-4708-9ad8-6718d38edac2
  modified: 2026-10-20T16:16:29.892Z
---

On 2026-10-20, `main` was fast-forwarded to `feat/money-goals` and pushed for the Money and Goals release, so `main` is now the line. `claude/roadmap-code-study-space` is still at `771e967`: it is behind `main` and has nothing of its own.

The production site (https://kurenai-os.pages.dev) is the release `fbea5d5`: FSRS, sw `kos-fsrs-1`, immutable https://a6e211c9.kurenai-os.pages.dev. On the same day `main` was fast-forwarded to `feat/fsrs`. Before it came `084a628` (Money and Goals, sw `kos-money-1`). The release was deployed from the worktree `.claude/worktrees/money-goals`, which needed a copy of the gitignored `js/env.local.js` from the main checkout.

The main checkout's LOCAL `main` ref was not moved (it belongs to that checkout). Run `git pull` there before working.

**Why:** releases are direct Cloudflare uploads (`tools/deploy_pages.sh`), and a git push does not deploy.

**How to apply:**
- Start every session with `git fetch`, `git status -sb` and `git log --oneline -5`.
- Branch new work from `main`.
- Commit and push freely, but deploy only when the user says go ([[act-without-asking]]).

Related: [[money-goals]], [[code-study-space]], [[japanese-study-space]], [[two-account-workflow]].


2026-10-21: main fast-forwarded to feat/exams-hub; release 3b39ae1 (Exams & Deadlines hub, phases 1–6 with CS Paper 2), sw kos-exams-1, https://e94eede7.kurenai-os.pages.dev.
2026-10-22: main fast-forwarded to feat/ipad; release 87f9437, sw kos-ipad-1, https://3191f2e6.kurenai-os.pages.dev — see [[after-fsrs-branch]].


2026-10-22: main fast-forwarded to feat/japanese; released d061169 (sw kos-japanese-1), https://6a6bcfa7.kurenai-os.pages.dev — the Japanese platform release.
2026-10-22: then ee1a746 (sw kos-japanese-2), https://0714e554.kurenai-os.pages.dev — the Japanese review fixes.

2026-10-23: main fast-forwarded to `feat/code-stage4` and released as `a1bc5c5` (sw `kos-code-19`, https://a53c4f26.kurenai-os.pages.dev): Code stage 4, the core path complete.

2026-10-23: main fast-forwarded to `feat/code-t1`, released as `07b3520` (sw `kos-code-20`, https://4eef907a.kurenai-os.pages.dev): the SQL sandbox and T1A.
2026-10-23: kos-code-22 (T2) and kos-code-23 (spine split) released from feat/code-t2; main fast-forwarded. The rest of T1 is on feat/code-t1-rest (not deployed).
2026-10-23: released the rest of T1 from feat/code-t1-rest (sw kos-code-24, https://f6ddf42e.kurenai-os.pages.dev); main fast-forwarded.
2026-10-23: main fast-forwarded to feat/japanese-s1; released Japanese F1, sw kos-japanese-3, https://40739699.kurenai-os.pages.dev.
2026-10-24: main fast-forwarded to feat/japanese-f2; released Japanese F2, sw kos-japanese-4, https://e424163d.kurenai-os.pages.dev.

- 2026-10-25: production is `8a092b7` (sw `kos-ink-2`, https://caffcf65.kurenai-os.pages.dev): iPad fixes + Handwritten side by side, from `feat/ipad-polish` in the worktree /Users/fj/Developer/KurenaiOS-ink; origin/main fast-forwarded to it.

2026-10-25 (later): `main` fast-forwarded to `feat/polish-1025` (1a3ad73), deployed as sw `kos-polish-3` (https://517b9344.kurenai-os.pages.dev): scroll-keeping strips, Home Today/goal, Productivity last page, closed-app push fix. Push presence now means in use; the runner (deployed) lets kind `test` through the hold.

2026-10-26: `feat/routines` (cut from feat/mind-plan, so it also carries the Mind plan docs) merged main in, deployed as sw `kos-routines-1` (https://5598f36e.kurenai-os.pages.dev), and `main` was fast-forwarded to it (ec95d06). Gate 104/104.
2026-10-26 (later): kos-routines-2 deployed from feat/routines (https://ff0df878.kurenai-os.pages.dev) with the runner Edge Function v6; main fast-forwarded again.
2026-10-26 (later): `feat/files` (worktree /Users/fj/Developer/KurenaiOS-ink) released as sw `kos-files-1`, https://445e2aae.kurenai-os.pages.dev — Files R1–R4, airing/release-day closed-app pushes (runner v7), CI-verified Rider evidence (github-token v4), habits several times a day. Gate 106/106. main fast-forwarded.

2026-10-27: `feat/pencil-fixes` released as sw `kos-pencil-1`, https://4e6dd91c.kurenai-os.pages.dev — the Pencil Pro day fixes (smoke107), review words back off, finished review kept on the chip (still usable, not read-only: the user wants to tick routine steps late), AI_DAILY_CAP 300 (ai-chat redeployed). Gate 107/107. main fast-forwarded (d629117).

2026-10-27 (later): kos-pencil-2 released, https://e2203d56.kurenai-os.pages.dev — marking reply fix (ai-chat think room), maths in What is sent, Paper on pads, Dock in palette menu; ai-chat redeployed. Spike D now loads instantly (user). Spike H still to run.

2026-10-27 (09:30): kos-pencil-3 released, https://f054551b.kurenai-os.pages.dev — busy-Gemini retries for marking, Start button ellipsis.

2026-10-27 (10:00): kos-pencil-4 released, https://0f3ac3cd.kurenai-os.pages.dev — marking reasons as maths, 274 lost LaTeX \; fixed in Pure notes. Spike H: first marks agree with the user (caught lost a=0 and dividing by a^2).

2026-10-27 (later): kos-japanese-5 released from main (40c375a + the Japanese path fix), https://fc302f55.kurenai-os.pages.dev — the media path labels at phone width; carries kos-pencil-4.

2026-10-29: `feat/mind` (worktree /Users/fj/Developer/KurenaiOS-mind) released as sw `kos-mind-1`, https://2f7e2aa8.kurenai-os.pages.dev — Mind platform + unit F1, plus the desk/tab-row clean-up across subjects; main fast-forwarded to cc2bc15. Gate 110 (2–107, 109–111). Not on main yet: feat/creatives (smoke108) and feat/integrations, whose smoke109 clashes with Mind's — renumber at merge.

2026-10-30: `feat/integrations` released as sw `kos-connect-1`, https://d47701df.kurenai-os.pages.dev — Google Calendar/Tasks + Todoist (5.15); its suite renumbered smoke112 and main merged in, main fast-forwarded to 5adc978, release note f38c14e. Gate 111 (2–107, 109–112). Still off main: feat/creatives (smoke108).
2026-10-30: main merged into feat/creatives (Connections, kos-connect-2), then main fast-forwarded to feat/creatives at f4fa493; release sw kos-creatives-1, https://1e058d00.kurenai-os.pages.dev (Creatives Platform 1 + Art 1–3; gate is now 112 suites).
