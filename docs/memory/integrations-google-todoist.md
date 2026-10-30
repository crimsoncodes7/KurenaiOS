---
name: integrations-google-todoist
description: "Roadmap 5.15 Google Calendar/Tasks + Todoist sync — RELEASED 2026-10-30 (sw kos-connect-1, d47701df); smoke112"
metadata:
  node_type: memory
  type: project
  originSessionId: ebc08035-fc0a-4294-b5f4-d8d69f4eaf61
  modified: 2026-10-29T20:02:59.751Z
---

Google Calendar two-way (primary), one-way "KurenaiOS" export calendar for derived items, Reminders lists ↔ Todoist projects / Google Tasks lists. Built 2026-10-29 on branch `feat/integrations` from main, in worktree `/Users/fj/Developer/KurenaiOS-integrations` (dev server `kurenai-integrations`, port 8151). smoke112 (108 Creatives, 109–111 Mind), invariants 157–160 (Creatives took 154–156), sw `kos-connect-1`, plan `docs/integrations-plan.md`.

User decisions: Todoist/Tasks completions = activity only, no XP/gold; derived items one-way to a secondary calendar; alerts mapped to popups; sign-in like the GitHub App (ext-token Edge Function keeps refresh tokens in `kos_ext`).

**Why:** asked 2026-10-29 after a feasibility write-up.
**Released** 2026-10-30: main f38c14e, ext-token v1 deployed, kos_ext applied, secrets set. Not yet tried end to end with a real sign-in.
**How to apply (history):** it needed the user to create the Google Cloud OAuth client (consent screen In production, not Testing — 7-day token expiry) and a Todoist app, set the four secrets, deploy `ext-token` and push migration `20261030000001`. Merging with feat/creatives needs the gate list and CLAUDE.md gate line reconciled. Related: [[project-branch-and-release-state]], [[act-without-asking]].
