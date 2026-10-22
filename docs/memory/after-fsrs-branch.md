---
name: after-fsrs-branch
description: "feat/after-fsrs (2026-10-22) — Focus mid-session switch, FSRS phase 3 optimiser, closed-app runner + Web Push, Code→GitHub App; built and pushed, NOT deployed; account setup still the user's"
metadata:
  node_type: memory
  type: project
  originSessionId: 1ca8ec6d-afd5-4683-8c40-1d961890b7fe
  modified: 2026-10-21T23:50:58.263Z
---

On 2026-10-22 the user asked for, in one go: roadmap 5.6 (they meant FSRS phase 3, the optimiser, built gated on 1,000 reviews), the server runner (5.7 item 1), Code → GitHub as a GitHub App (5.7 item 2), and a "small" extra: switching subject, topic or assignment mid-Focus-session. They chose: optimiser built now but gated; docs THEN build for the server work; Focus switch recorded as SEGMENTS (one session, paid once, time split per stretch).

All four are on branch `feat/after-fsrs` (from main `ced4eab`), pushed, gate 94 suites (smoke95 Focus, smoke96 FSRS3, smoke97 runner, smoke98 GitHub App). Migrations 20261022000001 (kos_reviews), …02 (kos_push), …03 (kos_github) are APPLIED to Supabase. RELEASED 2026-10-22 as 13cef94, sw kos-runner-2, https://3191f2e6.kurenai-os.pages.dev; main fast-forwarded to it.

Design facts worth keeping:
- Optimiser is pure JS `js/core/fsrsopt.js`, NOT fsrs-browser: that package's threaded WASM needs cross-origin isolation, which would block the app's hot-linked images.
- Runner rule (invariant 131): the DEVICE computes the outlook (each owner's forecast/notices), the server only delivers. Server-run schedules answer from a published brief with no tools. The runner has its own text-only model call (`runner/model.ts`) because ai-chat is JWT-verified for users.
- Web Push and the GitHub App JWT use WebCrypto only (no npm). Node 26 imports the .ts files directly in tests.

Done 2026-10-22: VAPID keys generated (public key in js/env.local.js; private only in function secrets), CRON_SECRET + VAPID_* secrets set, `runner` and `github-token` deployed with `--use-api` (Docker is not installed here) and probed. The user then ran the cron SQL (kos-runner job, 200 every 5 min) and created the App (slug kurenaios, secrets set, private key matched by digest). Not yet proven end to end: App ID/client ID/secret — the first Connect with GitHub tests them.

Gotcha: js/env.local.js is a DEFERRED script, so anything drawn at boot runs before KOS_ENV exists — read it lazily or redraw on DOMContentLoaded (fixed in both new cards, kos-runner-2). GitHub's install-time OAuth returns no `state`. Steps are in docs/server-runner-plan.md §8 and docs/github-app-plan.md §6.

**How to apply:** before merging or releasing, ask: the release needs a go-ahead ([[act-without-asking]]), a `sw.js` VERSION bump and the usual pre-deploy checks. Related: [[fsrs-scheduler]], [[project-branch-and-release-state]], [[code-study-space]].
