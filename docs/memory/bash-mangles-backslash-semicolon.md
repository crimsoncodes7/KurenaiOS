---
name: bash-mangles-backslash-semicolon
description: "The Bash tool turns `\\\\;` into `\\;` in commands (heredocs included) — breaks LaTeX `\\\\;` in content edits and perl/python regexes"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5836de0b-1c44-45f8-aa3d-83dc2da7b461
  modified: 2026-11-20T00:30:58.711Z
---

On 20 Nov 2026 a perl clean-up meant to fix LaTeX `\;` spacing put a backslash before every `;` in `js/data/content/maths-pure-p6.js`. The cause: the Bash tool rewrites the two characters `\\;` as `\;` anywhere in a command, quoted heredocs included. So `s/(?<!\\)\\;/.../` became "any `;`".

**Why:** the content files write LaTeX thin spaces as `\\;` in JS strings. Any edit script that types `\\;` gets one backslash fewer than intended.

**How to apply:**
- In shell-run scripts, build backslashes with `chr(92)` (python) and never type `\\;`.
- For content with `\\;`, prefer the Edit/Write tools.
- After any scripted content edit, count single-backslash semicolons (`(?<!\\)\\;` built with chr(92)) against HEAD.

Related: [[maths-notes-depth-rewrite]].
