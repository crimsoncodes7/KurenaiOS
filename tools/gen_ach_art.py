#!/usr/bin/env python3
"""Write js/data/achievements-art.js: the Badge Wall's art that has arrived (roadmap 5.16).

    python3 -I tools/gen_ach_art.py

Lists every badge and set panorama in assets/app/img/ (app.badge.* and app.ach.*), so the Wall
draws a picture only where one exists and the set's medallion everywhere else. Run it after the
art import (prototypes/japanese-space/art_import.py art-source/app assets/app/img).
"""
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
IMG = os.path.join(ROOT, "assets", "app", "img")
OUT = os.path.join(ROOT, "js", "data", "achievements-art.js")

ids = sorted(f[:-5] for f in os.listdir(IMG) if f.endswith(".webp") and (f.startswith("app.badge.") or f.startswith("app.ach.")))
with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("/* GENERATED from assets/app/img/ (the Badge Wall's art that has arrived; roadmap 5.16).\n"
             "   Regenerate after an import: python3 -I tools/gen_ach_art.py */\n")
    fh.write("window.KOS_ACH_ART = [\n" + ",\n".join('  "%s"' % i for i in ids) + "\n];\n")
print(len(ids), "images listed in", os.path.relpath(OUT, ROOT))
