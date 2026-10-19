---
name: act-without-asking
description: "Commit, push, run tests, apply migrations and handle releases without asking — only a production DEPLOY needs the user's go-ahead"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2e2dc728-9366-4708-9ad8-6718d38edac2
  modified: 2026-10-19T18:29:51.448Z
---

Do commits, pushes, test runs, Supabase migrations and other release housekeeping on my own initiative as part of the work. Do not end a turn with "commit/push?" buttons or questions about these.

The one exception is DEPLOYING (tools/deploy_pages.sh to Cloudflare Pages, i.e. production): ask first.

**Why:** the user said on 19 Oct 2026 "you don't need to ask me for permission to do anything apart from deploying. commit/push/releasing/migration/test whatever just handle those things automatically."
**How to apply:** finish each unit of work with the gate, a commit (stage by name, see [[git-stage-by-name]]) and a push, and apply any new migration; then report what was done. Ask only before a production deploy. Related: [[run-tests-yourself]].
