---
name: money-goals
description: Money & Goals (roadmap 5.4) on branch feat/money-goals (worktree .claude/worktrees/money-goals); Money core + Goals engine built (smoke84–85), pages wait on design prompt 11 frames 27a–27s
metadata:
  type: project
---

Started 19 October 2026 from the second account while the first account works on other things. The user asked for the design prompt plus everything that needs no design.

State: branch `feat/money-goals` from `main` at 771e967, in the worktree `.claude/worktrees/money-goals` so the main checkout and the other account's branch stay untouched. Not merged, not deployed.
- Design prompt 11 revised (docs/design-prompts.md §11): frames 27a–27s; the user pastes it into the Claude Design project that holds the earlier handover packages and the linked GitHub repo. Japanese stays 28a+.
- Built: `js/core/money.js` (KOS.money), `js/core/goals.js` (KOS.goals engine), `js/core/goals-collection.js` (the 14 Collection types moved unchanged); `js/modules/goals.js` is now UI only. smoke84 (Money), smoke85 (Goals). smoke38 expects goals v3.
- Smokes 80–83 are RESERVED for the Japanese release (plan §17), so this branch's gate is `for i in "" {2..79} 84 85`.

Decisions taken (as the roadmap recommended, decision B): small part in `state.money` (string ids, no counters, so the cloud merge never re-keys), transactions in IndexedDB `kurenai-os-money`, integer pence (`minor`). The wishlist → Money migration is a live MIRROR (`wl:<item>:<purchasedAt>`), not a one-time copy; the Collection budget reads `wishlist.budget.monthlyLimit`.

**Why:** the user wants design and build to run in parallel, and the other account must not be disturbed.
**How to apply:** when the 27a–27s handoff arrives, build phase 2 (Money pages) and phase 4 (Goals pages, Home card, `goal` notification kind) on this branch. Also built (smoke86): kos_money replication (migration 20261019000001 written, NOT applied — the user applies it), the Assistant's money_* tools and goals_types/goals_add for every domain, f.money/f.goals in Reports facts (payload totals only), the goal notification kind. Gate: for i in "" {2..79} 84 85 86. Placement decision (Productivity strip vs a new rail group) comes from frame 27a. Related: [[project-branch-and-release-state]], [[two-account-workflow]], [[no-dead-space-layout]].
