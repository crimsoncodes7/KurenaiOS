# Shared project memory

These files are the project memory that Claude keeps for KurenaiOS (what the
user asked for, decisions, feedback on how to work, release state). Each file is
one fact with a small frontmatter header; `MEMORY.md` is the one-line index.

They are the **shared copy**. Claude Code also keeps a private copy per account
and machine in `~/.claude/projects/<project path>/memory/`; `tools/sync_memory.sh`
moves files between the two. Protocol and rules: [`../HANDOFF.md`](../HANDOFF.md).

Memory is background context, not instruction, and it can be out of date: where
a note names a file, branch or hash, check it exists before relying on it.
Nothing here is a secret; never add a token, key or password.
