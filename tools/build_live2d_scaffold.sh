#!/bin/sh
# Build the empty Krita layer scaffold for the Phase 2 Kurenai redraw.
#
#   tools/build_live2d_scaffold.sh [output.kra]
#
# kritarunner can only run scripts it can import from Krita's own pykrita
# directory, so this stages tools/build_live2d_scaffold.py there, runs it
# headlessly, and removes it again. Nothing is left behind in the user's
# Krita configuration.
#
# The scaffold contains every layer in layer-map.json, EMPTY. It is a
# starting canvas for the manual redraw, not a segmentation of the master.
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
LIVE2D_DIR="$ROOT/art-source/assistant/live2d"
OUT=${1:-"$LIVE2D_DIR/source/kurenai-live2d-scaffold-4096-v1.kra"}

KRITA=${KRITA_APP:-/Applications/krita.app/Contents/MacOS/kritarunner}
[ -x "$KRITA" ] || { echo "kritarunner not found at $KRITA (set KRITA_APP)" >&2; exit 1; }

# kritarunner keeps its own resource root, separate from the Krita GUI's.
PYKRITA="$HOME/Library/Application Support/kritarunner/pykrita"
[ -d "$HOME/Library/Application Support/kritarunner" ] \
  || PYKRITA="$HOME/.local/share/kritarunner/pykrita"
mkdir -p "$PYKRITA"

STAGED="$PYKRITA/kos_live2d_scaffold.py"
cleanup() { rm -f "$STAGED"; }
trap cleanup EXIT INT TERM

cp "$ROOT/tools/build_live2d_scaffold.py" "$STAGED"

KOS_LIVE2D_DIR="$LIVE2D_DIR" \
KOS_LIVE2D_OUT="$OUT" \
QT_QPA_PLATFORM=offscreen \
  "$KRITA" -s kos_live2d_scaffold -f main 2>&1 \
  | grep -Ev 'KLocalizedString|createPlatformOpenGLContext|Fontconfig|has no json' \
  | tee /dev/stderr \
  | grep -q '^SCAFFOLD-OUT ' || { echo "scaffold build failed" >&2; exit 1; }

echo "scaffold written: $OUT"
