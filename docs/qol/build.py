#!/usr/bin/env python3
"""Builds docs/qol/qol-picks.html from qol-template.html and the checked lists.

Two parts, never mixed in one list:
  qol  quality of life        qol-checked.jsonl (your QoL requests + the auditors' QoL ideas)
  rm   backlog and roadmap    roadmap-requests.jsonl (your backlog/roadmap requests, the
                              programme's leftovers, the parked items) and
                              backlog-checked-*.jsonl (the auditors' bigger ideas, grouped
                              by area as "bk:<area>")
Run:  python3 docs/qol/build.py
"""
import glob, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
M = {"key": "k", "area": "a", "text": "t", "status": "s", "evidence": "e", "dup": "d", "size": "z", "needsDesign": "g", "note": "n"}


def rows(path):
    with open(path) as fh:
        return [json.loads(line) for line in fh if line.strip()]


def compact(r, part, area=None):
    out = {M[k]: r.get(k) for k in M}
    out["p"] = part
    if area:
        out["a"] = area
    return out


items = []
qol = rows(os.path.join(HERE, "qol-checked.jsonl"))
# your own requests first in the QoL part
items += [compact(r, "qol") for r in qol if r["area"] == "user-request"]
items += [compact(r, "qol") for r in qol if r["area"] != "user-request"]
items += [compact(r, "rm") for r in rows(os.path.join(HERE, "roadmap-requests.jsonl"))]
seen = set()
for path in sorted(glob.glob(os.path.join(HERE, "backlog-checked-*.jsonl"))):
    for r in rows(path):
        if r["key"] in seen:
            continue
        seen.add(r["key"])
        items.append(compact(r, "rm", "bk:" + r["area"]))

with open(os.path.join(HERE, "qol-template.html")) as fh:
    tpl = fh.read()
data = json.dumps(items, ensure_ascii=False).replace("</", "<\\/")
with open(os.path.join(HERE, "qol-picks.html"), "w") as fh:
    fh.write(tpl.replace("__DATA__", data))
by = {}
for x in items:
    by[x["p"]] = by.get(x["p"], 0) + 1
print("qol-picks.html:", by, "auditor backlog ideas:", len(seen))
