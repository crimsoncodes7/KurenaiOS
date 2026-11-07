#!/usr/bin/env python3
"""Gemini's P0/P1 worklists, from the consolidated findings.

The main list is FROZEN at commit acd5b67 (7 Nov 2026, after batch 6): 96 ids
in gemini/p0p1-ids.txt + p0p1-blind.json. Never regenerate it while Gemini is
working — it verifies exactly that list on its own branch.

Run (from the repo root) after Claude's later batches:
    python3 -I docs/audit/2026-11/harness/gemini_worklists.py --delta

which writes gemini/p0p1-delta-ids.txt + p0p1-delta-blind.json ("Batch B2"):
every open P0/P1 not in the frozen list (new findings, or ones re-rated up),
plus a note of frozen ids that have since been resolved or re-rated down.
Only `--init` (re)writes the frozen list; it refuses if one exists.
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
out = os.path.join(ROOT, "gemini")
os.makedirs(out, exist_ok=True)
rows = json.load(open(os.path.join(ROOT, "findings.json")))
open_hi = [r for r in rows if r.get("severity") in ("P0", "P1") and not r.get("resolved")]
open_hi.sort(key=lambda r: (r["severity"], r["id"]))
blind = lambda rs: [{k: r.get(k) for k in ("id", "area", "severity", "category", "devices", "title")} for r in rs]
NOTE = "Blind worklist: title only. Read the full record in ../findings.json ONLY after writing your independent assessment."
ids_path = os.path.join(out, "p0p1-ids.txt")

if "--init" in sys.argv:
    if os.path.exists(ids_path):
        sys.exit("refusing: the frozen list exists (gemini/p0p1-ids.txt); use --delta")
    json.dump({"count": len(open_hi), "note": NOTE, "findings": blind(open_hi)},
              open(os.path.join(out, "p0p1-blind.json"), "w"), indent=1, ensure_ascii=False)
    open(ids_path, "w").write("\n".join(r["id"] for r in open_hi) + "\n")
    print(f"frozen {len(open_hi)} ids")
elif "--delta" in sys.argv:
    frozen = set(open(ids_path).read().split())
    delta = [r for r in open_hi if r["id"] not in frozen]
    byid = {r["id"]: r for r in rows}
    gone = sorted(i for i in frozen if i in byid and (byid[i].get("resolved") or byid[i].get("severity") not in ("P0", "P1")))
    json.dump({"count": len(delta), "note": NOTE + " Batch B2: open P0/P1 not in the frozen list.",
               "frozenSinceResolvedOrDowngraded": gone, "findings": blind(delta)},
              open(os.path.join(out, "p0p1-delta-blind.json"), "w"), indent=1, ensure_ascii=False)
    open(os.path.join(out, "p0p1-delta-ids.txt"), "w").write("".join(r["id"] + "\n" for r in delta))
    print(f"Batch B2: {len(delta)} ids; frozen ids since resolved/downgraded: {gone or 'none'}")
else:
    sys.exit("usage: gemini_worklists.py --delta   (or --init, only when no frozen list exists)")
