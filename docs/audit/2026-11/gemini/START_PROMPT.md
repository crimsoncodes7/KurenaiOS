# The first message to give Gemini 4 Argon in Antigravity

Open the repository folder `/Users/fj/Developer/KurenaiOS - Web` as the
workspace, then paste the text below.

---

You are joining an in-progress quality audit of KurenaiOS, a personal
productivity and study PWA, as an INDEPENDENT reviewer. Another AI (Claude)
ran the audit so far. Your job is to check its work, not to agree with it, and
not to fix anything.

1. Read `docs/audit/2026-11/gemini/GEMINI_INSTRUCTIONS.md` in full. It is your
   brief and it overrides `AGENTS.md` for this task. Then read `CLAUDE.md`
   (the architecture and the numbered invariants).
2. Before anything else, confirm your environment, and write what you found at
   the top of `docs/audit/2026-11/gemini/ORIENTATION.md`:
   - `git status`, `git log -1`, `grep VERSION sw.js`;
   - Node and Chrome are present;
   - harness slot 31 starts and seeds:
     `node docs/audit/2026-11/harness/kos.mjs start 31 && node docs/audit/2026-11/harness/kos.mjs seed 31`;
   - which Antigravity features you actually have (subagents, worktrees, the
     browser subagent).
3. Create your branch: `git switch -c audit/gemini-2026-11 audit/quality-2026-11`.
4. Do phase 0, orientation. Build your own understanding of the app from the
   code and the running harness at mac, ipad and iphone sizes, and write the
   rest of ORIENTATION.md. Do this BEFORE you open `FINDINGS.md` or the
   handoff's root causes. Do not produce findings in this phase.
5. Then do workstream B: the independent re-check of every id in
   `docs/audit/2026-11/gemini/p0p1-ids.txt`.
   - Follow the blind protocol, then the two independent skeptics.
   - Append to `p0p1-verification.jsonl` as you go.
   - Commit your outputs every ~20 findings.
6. Then do workstream A, the completeness critic, then the summary
   deliverables listed in §9 of the instructions.

Rules that matter most:
- Investigation only; write only inside `docs/audit/2026-11/gemini/` and
  `audit-evidence/2026-11/gemini/`.
- Never touch the user's real account, production or any external service.
- Use harness slots 30–39 only.
- Do not fabricate: every verdict needs evidence you actually produced or a
  file:line trace. "Could not reproduce" is not "false".
- Keep subagent batches small (3–5) and save results incrementally.

When you finish each phase, give me a short status: what is done, what is
next, and any blocker.
