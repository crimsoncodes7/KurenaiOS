#!/usr/bin/env python3
"""Build the consolidated findings for the 2026-11 quality audit.

    python3 -I docs/audit/2026-11/harness/consolidate.py

Reads docs/audit/2026-11/findings/: for each area the final <area>.json
(written by an auditor that finished and re-checked its P0/P1s) wins; an
area with only <area>.jsonl (auditor interrupted, findings saved as it went)
uses those lines, marked PARTIAL. Writes FINDINGS.md (human), findings.json
(every finding with a stable id) and findings.csv next to this folder."""
import csv, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)
FD = os.path.join(BASE, "findings")

AREAS = [
    ("shell", "SH", "App shell, navigation, search, toasts, dialogs, Help & Guide"),
    ("home-reports", "HR", "Home and Reports"),
    ("achievements-governor", "AG", "Achievements / Badge Wall and the Governor's Seat"),
    ("shop-cosmetics", "SC", "Gold Shop and every cosmetic, themes"),
    ("study-core", "ST", "Study desks (CS/Maths/IT), topic page, Review, Assignments"),
    ("sync-disruption", "SY", "Background redraws / cloud sync disrupting work"),
    ("content-maths", "CM", "A-Level Maths content quality"),
    ("content-cs-it", "CC", "A-Level CS and OCR IT content quality"),
    ("code-space", "CO", "Code study space"),
    ("ja-mind", "JM", "Japanese and Mind study spaces"),
    ("creatives", "CR", "Creatives study space"),
    ("productivity", "PR", "Focus, Reminders, Routines, Daily Review, Calendar, Pacing"),
    ("money-goals", "MG", "Money (Santander import) and Goals"),
    ("exams-files-ink", "EX", "Exams hub, Files, ink/Pencil surfaces"),
    ("collection", "CL", "Collection vaults, Shrine, Wishlist, Sync"),
    ("assistant-archive", "AA", "Assistant, notifications, Archive (data, backups, storage, connections)"),
    ("data-integrity", "DI", "Reliability and data integrity (store, merge, sync, IndexedDB, integrations logic)"),
    ("architecture-perf", "AP", "Architecture, maintainability, performance, docs drift"),
    ("a11y-hci", "AX", "Cross-cutting accessibility and HCI sweep"),
]
SEV = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}


def norm(t):
    return re.sub(r"[^a-z0-9]+", " ", t.lower()).strip()[:80]


def read_jsonl(path):
    out = []
    for line in open(path):
        line = line.strip()
        if not line:
            continue
        try:
            out.append(json.loads(line))
        except Exception:
            pass
    return out


def load_area(area):
    final = os.path.join(FD, area + ".json")
    if area == "content-maths":
        final = os.path.join(FD, "content-maths.audit1.json")
    part = os.path.join(FD, area + ".jsonl")
    if os.path.exists(final):
        o = json.load(open(final))
        fs = list(o.get("findings", []))
        have = set(norm(f.get("title", "")) for f in fs)
        # a finding saved during the audit but absent from the final list: kept,
        # flagged — it was either dropped on the auditor's re-check or the final
        # list came from a continuation that listed only its own findings
        if os.path.exists(part):
            for f in read_jsonl(part):
                if norm(f.get("title", "")) not in have:
                    f = dict(f); f["notInFinal"] = True; fs.append(f); have.add(norm(f.get("title", "")))
        return "complete", o.get("summary", ""), o.get("coverage", ""), fs, o.get("qol", []), o.get("backlog", [])
    if os.path.exists(part):
        fs, seen = [], set()
        for line in open(part):
            line = line.strip()
            if not line:
                continue
            try:
                f = json.loads(line)
            except Exception:
                continue
            key = f.get("title", "")
            if key in seen:
                continue
            seen.add(key)
            fs.append(f)
        return "partial", "", "", fs, [], []
    return "not run", "", "", [], [], []


def main():
    rows, md, status = [], [], {}
    # ids are FROZEN once issued (the handoff and plan cite them): an earlier
    # findings.json maps (area, title) -> id; new findings take the next number
    prev = {}
    pj = os.path.join(BASE, "findings.json")
    if os.path.exists(pj):
        for f in json.load(open(pj)):
            prev[(f["area"], norm(f.get("title", "")))] = f["id"]
    for area, pre, label in AREAS:
        st, summary, cov, fs, qol, backlog = load_area(area)
        fs = sorted(fs, key=lambda f: SEV.get(f.get("severity"), 9))
        used = [int(v.split("-")[1]) for (a, t), v in prev.items() if a == area]
        nxt = max(used) + 1 if used else 1
        for f in fs:
            f = dict(f)
            fid = prev.get((area, norm(f.get("title", ""))))
            if not fid:
                fid = "%s-%02d" % (pre, nxt); nxt += 1
            f["id"] = fid
            f["area"] = area
            f["areaStatus"] = st
            rows.append(f)
        status[area] = (pre, label, st, summary, cov, fs, qol, backlog)

    cnt = lambda fs, s: sum(1 for f in fs if f.get("severity") == s)
    md.append("# KurenaiOS quality audit — consolidated findings (2026-11)\n")
    md.append("Generated by `harness/consolidate.py` from `findings/`. Do not hand-edit; re-run the script.\n")
    md.append("Status: **complete** = the auditor finished and re-checked its P0/P1 findings; **partial** = the auditor was cut off by the usage limit — its findings are real (each was saved with evidence) but the area is NOT fully covered; **not run** = the area has not been audited at all (no findings does NOT mean it passed).\n")
    md.append("\n| ID | Area | Status | P0 | P1 | P2 | P3 | Total |\n|---|---|---|---|---|---|---|---|")
    tot = [0, 0, 0, 0]
    for area, (pre, label, st, summary, cov, fs, qol, backlog) in status.items():
        c = [cnt(fs, s) for s in ("P0", "P1", "P2", "P3")]
        tot = [a + b for a, b in zip(tot, c)]
        md.append("| %s | %s | %s | %d | %d | %d | %d | %d |" % (pre, label, st, c[0], c[1], c[2], c[3], len(fs)))
    md.append("| | **All** | | %d | %d | %d | %d | %d |\n" % (tot[0], tot[1], tot[2], tot[3], sum(tot)))
    md.append("Plus the live-account checks in `findings/live-account.md` (production, read via the app's own APIs; ids LA-n).\n")

    md.append("\n## All P0 and P1 findings at a glance\n")
    for f in rows:
        if f.get("severity") in ("P0", "P1"):
            md.append("- **%s** [%s] %s" % (f["id"], f["severity"], f.get("title", "")))

    for area, (pre, label, st, summary, cov, fs, qol, backlog) in status.items():
        md.append("\n---\n\n## %s — %s (%s)\n" % (pre, label, st))
        if summary:
            md.append("**Auditor's summary.** " + summary + "\n")
        if cov:
            md.append("**Coverage.** " + cov + "\n")
        if st == "partial":
            md.append("_Interrupted auditor: coverage notes were not written. Treat everything not listed below as unaudited._\n")
        if st == "not run":
            md.append("_Not audited yet._\n")
        for f in rows:
            if f["area"] != area:
                continue
            md.append("### %s · %s · %s — %s\n" % (f["id"], f.get("severity", "?"), f.get("category", "?"), f.get("title", "")))
            for k, lab in (("devices", "Devices"), ("detail", "Detail / repro"), ("evidence", "Evidence"), ("rootCause", "Root cause"), ("fix", "Proposed fix")):
                if f.get(k):
                    md.append("- **%s:** %s" % (lab, str(f[k]).replace("\n", " ")))
            extra = []
            if f.get("effort"):
                extra.append("effort " + f["effort"])
            if f.get("needsDesign"):
                extra.append("needs a design prompt")
            if f.get("needsArt"):
                extra.append("needs art (Gemini sheet)")
            if f.get("notInFinal"):
                extra.append("saved during the audit but NOT in the auditor's final re-checked list — re-verify before acting")
            if extra:
                md.append("- **Flags:** " + ", ".join(extra))
            md.append("")
        if qol:
            md.append("**QoL ideas from this auditor:**\n" + "\n".join("- " + q for q in qol) + "\n")
        if backlog:
            md.append("**Backlog ideas from this auditor:**\n" + "\n".join("- " + q for q in backlog) + "\n")

    open(os.path.join(BASE, "FINDINGS.md"), "w").write("\n".join(md) + "\n")
    json.dump(rows, open(os.path.join(BASE, "findings.json"), "w"), indent=1)
    with open(os.path.join(BASE, "findings.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        cols = ["id", "area", "areaStatus", "notInFinal", "severity", "category", "title", "devices", "effort", "needsDesign", "needsArt", "evidence", "rootCause", "fix", "detail"]
        w.writerow(cols)
        for f in rows:
            w.writerow([f.get(c, "") for c in cols])
    print("findings:", len(rows), "| by severity:", tot)
    for area, v in status.items():
        print("  %-22s %-8s %d" % (area, v[2], len(v[5])))


if __name__ == "__main__":
    main()
