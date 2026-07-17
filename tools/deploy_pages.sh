#!/bin/bash
# Kurenai OS — tools/deploy_pages.sh (Build 4b)
# Stage ONLY the runtime application files into dist/ and deploy them to
# Cloudflare Pages by direct upload. The gitignored js/env.local.js ships
# from disk to the deployment WITHOUT ever being committed — the publishable
# key is browser-public by design (RLS is the boundary); no secret or
# service-role credential exists anywhere in this tree.
#
# Usage:
#   tools/deploy_pages.sh            stage + deploy (needs `npx wrangler login` once)
#   tools/deploy_pages.sh --stage    stage into dist/ only, no upload (inspection)
#
# Development-only material NEVER ships: tools/, tests, node_modules/,
# supabase/ (migrations), notes/context folders, markdown docs, mockups,
# parser scripts, package manifests, editor/VCS metadata.
set -euo pipefail
cd "$(dirname "$0")/.."

PROJECT="kurenai-os"
DIST="dist"

if [ ! -f js/env.local.js ]; then
  echo "ERROR: js/env.local.js is missing — the deployed app would have no cloud sync." >&2
  echo "Copy js/env.example.js to js/env.local.js and fill in the Supabase values first." >&2
  exit 1
fi

echo "== staging runtime files into $DIST/ =="
rm -rf "$DIST"
mkdir -p "$DIST"
cp index.html manifest.webmanifest sw.js "$DIST/"
cp -R css icons "$DIST/"
mkdir -p "$DIST/js"
# everything under js/ is runtime (data, content, core, engines, modules,
# labs, vendor, env.local.js) — copy wholesale
cp -R js/ "$DIST/js/"

# belt-and-braces: nothing development-only may have slipped in
for banned in tools node_modules supabase Context "Phase 3 Context" .git .idea .claude; do
  if [ -e "$DIST/$banned" ]; then echo "ERROR: $banned leaked into dist" >&2; exit 1; fi
done
if find "$DIST" -name "*.md" -o -name "*.py" -o -name "*.test.js" -o -name "package*.json" | grep -q .; then
  echo "ERROR: development files leaked into dist:" >&2
  find "$DIST" -name "*.md" -o -name "*.py" -o -name "*.test.js" -o -name "package*.json" >&2
  exit 1
fi

COUNT=$(find "$DIST" -type f | wc -l | tr -d " ")
SIZE=$(du -sh "$DIST" | cut -f1)
SWV=$(grep -o 'VERSION = "[^"]*"' sw.js | head -1)
echo "staged: $COUNT files, $SIZE — sw.js $SWV"
echo "REMINDER: bump the sw.js VERSION when deploying changed assets so old"
echo "caches clean up promptly (stale-while-revalidate refreshes regardless)."

if [ "${1:-}" = "--stage" ]; then
  echo "(stage-only run — nothing uploaded)"
  exit 0
fi

echo "== deploying to Cloudflare Pages ($PROJECT) =="
# --branch main = the project's production branch, so every run of this
# script IS a production deployment regardless of the local git branch
npx --yes wrangler@3 pages deploy "$DIST" --project-name "$PROJECT" --branch main --commit-dirty=true
echo "== done — the *.pages.dev URL above is the live deployment =="
