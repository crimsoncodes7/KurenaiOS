---
name: money-goals
description: Money & Goals (roadmap 5.4) on branch feat/money-goals (worktree .claude/worktrees/money-goals); BUILT WHOLE to design 27a–27s on 20 Oct 2026 (smoke84–87); not merged or deployed
metadata:
  node_type: memory
  type: project
  originSessionId: 2e2dc728-9366-4708-9ad8-6718d38edac2
  modified: 2026-10-20T16:07:21.588Z
---

Started 19 October 2026 from the second account while the first account works on other things. Branch `feat/money-goals` from `main` at 771e967, in the worktree `.claude/worktrees/money-goals`, so the main checkout and the other account's branch stay untouched. Not merged, not deployed.

State on 20 October 2026: everything is built to the design handoff (frames 27a–27s, from /Users/fj/Downloads/design_handoff_kurenaios_money_goals/).
- Core: `js/core/money.js`, `js/core/goals.js`, `js/core/goals-collection.js`.
- Pages: `js/modules/money.js` (six views), `js/modules/goals.js` (page, detail, picker, form), `css/views/money.css` and `css/views/goals.css`.
- Joins: Home's Upcoming | Goals switch (hub.js), the Wishlist (Planner renamed, "Mark purchased" dialog), Calendar's derived chips, Reports' Money and Goals cards, the goal and money notification filters.
- Placement (27a): Money and Goals are on the Productivity strip; the Collection keeps the Wishlist.
- Tests: smoke84 (Money), smoke85 (Goals), smoke86 (joins), smoke87 (pages). smoke56 now covers the six Money views; deliberate moves are recorded in render-purity.renames.json.
- Smokes 80–83 are RESERVED for Japanese, so this branch's gate is `for i in "" {2..79} 84 85 86 87`.
- kos_money migration 20261019000001 is applied.

Decisions: the small part lives in `state.money` with string ids. Transactions live in IndexedDB `kurenai-os-money`, in integer pence. The wishlist → Money link is a live MIRROR (`wl:<item>:<purchasedAt>`), and the Collection budget IS `wishlist.budget.monthlyLimit`.

**Why:** the user wants design and build to run in parallel, and the other account must not be disturbed.

**How to apply:**
- Next is the user's review of the pages, then a release, but only when they ask (deploy needs a go-ahead, see [[act-without-asking]]).
- Screenshot checks use a headless-Chrome CDP driver over file://.
- Seed in the same run as the shots, and use a fresh `--profile` each time: a killed Chrome leaves the old profile locked.

Related: [[project-branch-and-release-state]], [[two-account-workflow]], [[no-dead-space-layout]].
