#!/usr/bin/env python3
"""tools/gen_badge_small.py — the Badge Wall's small medal art (1F,
architecture-perf#6).

The badge art (assets/app/img/app.ach.<id>.webp) is 384 px square, drawn
for the 120 and 208 px medals. The Wall's grid, the lists and the toasts
draw medals of 32 to 96 CSS px, which a 192 px copy covers at a pixel ratio
of 2. This writes that copy, assets/app/img/sm/app.ach.<id>.webp, for every
square badge (the set panoramas and spots are not medals and are left
alone); js/modules/achievements.js picks it for a medal of 96 px or less.

    python3 tools/gen_badge_small.py           write the copies that are missing or older
    python3 tools/gen_badge_small.py --check   every square badge has a current copy (exit 1 if not)

Needs Pillow with WebP (python3 -m pip install pillow). The copies are
derived files: regenerate after importing new badge art, never edit them.
"""
import os
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "assets", "app", "img")
OUT = os.path.join(SRC, "sm")
SIZE = 192
QUALITY = 82


def badges():
    out = []
    for name in sorted(os.listdir(SRC)):
        if not (name.startswith("app.ach.") and name.endswith(".webp")):
            continue
        if name.startswith("app.ach.pano.") or name.startswith("app.ach.spot."):
            continue
        out.append(name)
    return out


def stale(name):
    dst = os.path.join(OUT, name)
    return not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(os.path.join(SRC, name))


def main():
    check = "--check" in sys.argv
    names = badges()
    if check:
        missing = [n for n in names if not os.path.exists(os.path.join(OUT, n))]
        if missing:
            print("gen_badge_small: no small copy of " + ", ".join(missing) + " — run python3 tools/gen_badge_small.py")
            sys.exit(1)
        print("gen_badge_small: all %d badges have a %d px copy" % (len(names), SIZE))
        return
    from PIL import Image
    os.makedirs(OUT, exist_ok=True)
    made = 0
    for name in names:
        if not stale(name):
            continue
        with Image.open(os.path.join(SRC, name)) as im:
            im = im.convert("RGBA")
            w, h = im.size
            if max(w, h) <= SIZE:
                small = im.copy()
            else:
                scale = SIZE / float(max(w, h))
                small = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
            small.save(os.path.join(OUT, name), "WEBP", quality=QUALITY, method=6)
        made += 1
    before = sum(os.path.getsize(os.path.join(SRC, n)) for n in names)
    after = sum(os.path.getsize(os.path.join(OUT, n)) for n in names)
    print("gen_badge_small: wrote %d of %d; %.2f MB of badges, %.2f MB as %d px copies" % (made, len(names), before / 1048576.0, after / 1048576.0, SIZE))


if __name__ == "__main__":
    main()
