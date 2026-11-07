#!/usr/bin/env python3
"""Build Gemini's P0/P1 worklists from the consolidated findings.

Run (from the repo root) after every consolidate.py:
    python3 -I docs/audit/2026-11/harness/gemini_worklists.py

Writes, under docs/audit/2026-11/gemini/:
  p0p1-blind.json  — id, area, severity, category, devices and the TITLE only.
                     No detail, evidence, rootCause or fix: the verifier forms
                     its own assessment from this before reading the record.
  p0p1-ids.txt     — one id per line (the 'all N' the verification must cover).
Resolved findings (consolidate.py RESOLVED) are left out.
"""
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
src = os.path.join(ROOT, "findings.json")
out = os.path.join(ROOT, "gemini")
os.makedirs(out, exist_ok=True)

rows = json.load(open(src))
keep = [r for r in rows if r.get("severity") in ("P0", "P1") and not r.get("resolved")]
keep.sort(key=lambda r: (r["severity"], r["id"]))
blind = [{k: r.get(k) for k in ("id", "area", "severity", "category", "devices", "title")} for r in keep]
json.dump({"count": len(blind), "note": "Blind worklist: title only. Read the full record in ../findings.json ONLY after writing your independent assessment.", "findings": blind},
          open(os.path.join(out, "p0p1-blind.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(out, "p0p1-ids.txt"), "w").write("\n".join(r["id"] for r in keep) + "\n")
p0 = sum(r["severity"] == "P0" for r in keep)
print(f"{len(keep)} open P0/P1 (P0 {p0}, P1 {len(keep) - p0}) -> gemini/p0p1-blind.json")
