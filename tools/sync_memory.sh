#!/usr/bin/env bash
# Sync the shared project memory (docs/memory/, in Git) with this machine's
# Claude auto-memory directory. Never deletes. See docs/HANDOFF.md.
#
#   tools/sync_memory.sh status   # what differs (default)
#   tools/sync_memory.sh pull     # repo -> local   (start of a session)
#   tools/sync_memory.sh push     # local -> repo   (after saving a memory)
#
# Override the local directory with CLAUDE_MEMORY_DIR=/path/to/memory.
set -euo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
shared="$repo/docs/memory"
# Claude Code keys a project's memory by its path with every non-alphanumeric
# character replaced by "-".
key="$(printf '%s' "$repo" | sed 's/[^A-Za-z0-9]/-/g')"
local_dir="${CLAUDE_MEMORY_DIR:-$HOME/.claude/projects/$key/memory}"

mode="${1:-status}"
mkdir -p "$shared" "$local_dir"

list() { (cd "$1" && ls *.md 2>/dev/null | grep -v '^README\.md$' || true); }

diff_files() {   # prints files that differ or exist on one side only
  { list "$shared"; list "$local_dir"; } | sort -u | while read -r f; do
    [ -n "$f" ] || continue
    if [ ! -f "$shared/$f" ]; then echo "only local : $f"
    elif [ ! -f "$local_dir/$f" ]; then echo "only repo  : $f"
    elif ! cmp -s "$shared/$f" "$local_dir/$f"; then echo "differs    : $f"
    fi
  done
}

copy_all() {     # copy_all FROM TO
  list "$1" | while read -r f; do
    [ -n "$f" ] || continue
    if [ ! -f "$2/$f" ] || ! cmp -s "$1/$f" "$2/$f"; then
      if [ -f "$2/$f" ]; then cp "$2/$f" "$2/$f.bak"; fi
      cp "$1/$f" "$2/$f"
      echo "copied $f"
    fi
  done
}

case "$mode" in
  status)
    echo "repo : $shared"; echo "local: $local_dir"
    out="$(diff_files)"
    if [ -z "$out" ]; then echo "in sync"; else echo "$out"; fi ;;
  pull) copy_all "$shared" "$local_dir"
        echo "pulled. A .bak beside a file is the version it replaced." ;;
  push) copy_all "$local_dir" "$shared"
        echo "pushed. Review with: git diff --stat -- docs/memory ; stage by name." ;;
  *) echo "usage: $0 [status|pull|push]" >&2; exit 2 ;;
esac
