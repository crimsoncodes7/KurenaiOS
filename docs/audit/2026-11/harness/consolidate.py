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
    ("ja-mind", "JM", "Japanese study space (JM-01…05 predate the split and include two Mind findings)"),
    ("mind", "MI", "Mind study space"),
    ("creatives", "CR", "Creatives study space"),
    ("productivity", "PR", "Focus, Reminders, Routines, Daily Review, Calendar, Pacing"),
    ("money-goals", "MG", "Money (Santander import); Goals pages only"),
    ("goals", "GO", "Goals: every goal type's measurement, editor, notices, joins"),
    ("exams-files-ink", "EX", "Exams hub, Files, ink/Pencil surfaces"),
    ("collection", "CL", "Collection vaults, Shrine, Wishlist, Sync"),
    ("assistant-archive", "AA", "Assistant, notifications, Archive (data, backups, storage, connections)"),
    ("data-integrity", "DI", "Reliability and data integrity (store, merge, sync, IndexedDB, integrations logic)"),
    ("architecture-perf", "AP", "Architecture, maintainability, performance, docs drift"),
    ("a11y-hci", "AX", "Cross-cutting accessibility and HCI sweep"),
]
# every area ran on 56b1a8c (= production, sw kos-artshop-1) EXCEPT these,
# which ran after the audit branch was mistakenly based on a stale local main
BUILD_NOTE = {
    "architecture-perf": "First run on f4fa493 (sw kos-creatives-1, 23 commits before production). RE-CHECKED on main 6 Nov 2026 (sw kos-redraw-1): every carried-over finding has a 'Re-checked on kos-redraw-1' verdict; the Badge Wall, Seat, shop and art code were added.",
    "a11y-hci": "First run on f4fa493 (sw kos-creatives-1, 23 commits before production). RE-CHECKED on main 6 Nov 2026 (sw kos-redraw-1): every carried-over finding has a 'Re-checked on kos-redraw-1' verdict; the Badge Wall, Seat and shop pages were swept.",
}
# a top-up (re-check on main) that was stopped before writing its final file:
# the old final stands, the new incremental saves are added unflagged, and the
# area reads "partial" until a top-up finishes
TOPUP_PARTIAL = set()  # AP and AX top-ups finished 6 Nov
# findings a later re-check showed no longer reproduce: the id stays frozen and
# the finding stays listed, marked resolved, but leaves the open counts
RESOLVED = {
    "SH-05": "no longer reproduces on kos-redraw-1 (6 Nov, shell re-check): the stopgap's KOS.rerender keeps #stage's scroll (scrollTop 500 -> 500 on Home, Calendar and Reminders at mac and iPhone). SY-01 is the same defect from the sync side and should be re-checked with SY.",
    "SY-07": "no longer reproduces on kos-redraw-1 (7 Nov, SY re-check): sd11 rerun with background:'hard' at ipadl keeps both Side by side panes' scroll.",
    "SY-10": "no longer reproduces on kos-redraw-1 (7 Nov, SY re-check): an open KOS.ui.menu counts as a top dialog, so a background redraw is held while it is open.",
    "SY-15": "no longer reproduces on kos-redraw-1 (7 Nov, SY re-check): background redraws are held while a dialog is open (sd7 rerun).",
    "SY-01": "resolved by the stopgap kos-redraw-1 (Gemini B partially-confirmed it; Claude's review 8 Nov, gemini/CLAUDE_REVIEW.md §3): scrollers() keeps #stage's scroll everywhere measured except the lazily batched Collection vaults, which are SY-19.",
    "SH-22": "duplicate of MG-09 (Gemini B, reviewed by Claude 8 Nov). SH-22's own text is partly wrong: Money's phone FAB 'Add entry' exists (js/modules/money.js:158-161) and Overview links Budgets, Recurring and Pots (421, 446, 471); MG-09's wording is the accurate one.",
}
# Gemini 4 Argon's workstream B verdicts on the frozen 96 P0/P1 (accepted by
# the user 8 Nov 2026 as CORROBORATION, not independent verification — see
# gemini/CLAUDE_REVIEW.md); rendered on each finding as "Gemini B"
GV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "gemini", "gverdict.json")
GVERDICT = json.load(open(GV_PATH)) if os.path.exists(GV_PATH) else {}
# Batch B2 (new P0/P1 since the frozen list), re-checked by Claude 8 Nov instead of Gemini
B2_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "findings", "b2-claude-verification.json")
for _id, _v in (json.load(open(B2_PATH)) if os.path.exists(B2_PATH) else {}).items():
    GVERDICT[_id] = {"verdict": _v["verdict"] + " by Claude's independent re-check (B2, runtime + code)", "duplicateOf": None}
# corrections from Claude's review of Gemini B (8 Nov 2026), accepted by the user
REVIEW_NOTE = {
    "CO-02": "Root cause and fix corrected: at 402px the desk is the grid at css/views/study.css:1169 (repeat(2, minmax(0,1fr))), not a flex row — the fix is a grid-template-columns single-column override for .k-cx-hero + .k-subj-side at <=700px, as japanese.css:449 and creatives.css:366 do (and Mind's desk), plus .k-fit-btn on the Open-lesson button.",
    "CC-01": "Partly wrong for F201: the hand-made KOS_SPEC_FIX covers 5.2, 2.3, 2.4, 2.6 and Factor analysis on the Spec tab. The faulty parser is tools/parse_it.py, not tools/gen_data.py.",
    "HR-16": "The repeated milestone bonus pays GOLD only (js/core/governor.js:337 gold += ms), no XP.",
    "DI-04": "Also triggered by an app update with two tabs open: js/core/pwa.js:90-91 reloads only the tab that confirmed the update, so the other tab keeps old code and its in-memory state and can save over the confirming tab's newer edits (Gemini's GEM-006, folded in here).",
    "SY-02": "Since the stopgap only plain KOS.rerender() stragglers (e.g. connections.js:70, examviews.js:265 timers firing after leaving) can reset the notes page; propose P2 in the plan.",
    "SY-03": "Since the stopgap background redraws are held on the review views; what remains is plain rerenders and finish()-only logging (root cause 18); propose P2 in the plan.",
    "SY-04": "Since the stopgap ref/exams are held as TASK_VIEWS and typing() holds too; only plain rerenders reset the quiz/exam; propose P2 in the plan.",
    "SY-18": "The hold for an open editor while typing predates kos-redraw-1; the stopgap made it indefinite on ref views, widening (not creating) the defect.",
    "DI-27": "HOTFIXED 8 Nov (sw kos-malfix-1, 9fecf63, smoke114): the cause is stopped. Clean-up of the 1,741 phantom ledger entries, the phantom XP/gold, the badge tiers and the two journals waits for the user's decision in the plan.",
    "MG-23": "Mitigation: each flagged row has an 'Import anyway' toggle, but Skip is pre-selected and the row claims to match an entry that is not in the store.",
    "MG-25": "Editing is still possible by scrolling past the whole list, so badly degraded rather than impossible; P2 is arguable.",
    "CM-14": "Also breaks invariant 135 (an A mark ticked without its M is accepted). Shares its root cause with CC-14/CC-17 (the Answer line is a tickable mark); 28 derived parts' [M/A/B] weights do not sum to their marks (cf. CM-21).",
    "JM-06": "Above 860px on a direct KOS.show the Core/Media switch is mounted into #tree before the throw, so a desktop recovery path exists; through a hash, reload, Back, or at drawer widths it does not. P0 holds.",
}
SEV = {"P0": 0, "P1": 1, "P2": 2, "P3": 3}


SELF_ID = re.compile(r"^(?!UR-|LA-)([A-Z]{2})-(\d{2,3})\s+")


def strip_id(t):
    # an auditor may number its own titles ("GO-02 UR-20 verified: …")
    return SELF_ID.sub("", t or "")


def norm(t):
    t = strip_id(t)
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
    if area == "content-maths" and not os.path.exists(final):
        # the first Maths audit saved its result under this name; from 7 Nov a
        # copy is content-maths.json (so the inventory top-up finds it), and the
        # original stays as the pre-inventory backup
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
                    f = dict(f)
                    if area not in TOPUP_PARTIAL:
                        f["notInFinal"] = True
                    fs.append(f); have.add(norm(f.get("title", "")))
        if area in TOPUP_PARTIAL:
            return "partial", o.get("summary", ""), o.get("coverage", ""), fs, o.get("qol", []), o.get("backlog", [])
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
        taken = set(v for (a, t), v in prev.items() if a == area)
        # an auditor's own id (title prefix) is kept when it is new to this area,
        # so its cross-references in summaries and details stay right
        for f in fs:
            m = SELF_ID.match(f.get("title", ""))
            if m and m.group(1) == pre and not prev.get((area, norm(f["title"]))):
                own = "%s-%s" % (pre, m.group(2))
                if own not in taken:
                    taken.add(own); f["_own"] = own
        nxt = max([nxt] + [int(v.split("-")[1]) + 1 for v in taken])
        for f in fs:
            f = dict(f)
            fid = prev.get((area, norm(f.get("title", "")))) or f.pop("_own", None)
            f.pop("_own", None)
            if not fid:
                while "%s-%02d" % (pre, nxt) in taken:
                    nxt += 1
                fid = "%s-%02d" % (pre, nxt); nxt += 1
                taken.add(fid)
            f["title"] = strip_id(f.get("title", ""))
            f["id"] = fid
            f["area"] = area
            f["areaStatus"] = st
            if fid in RESOLVED:
                f["resolved"] = RESOLVED[fid]; f.pop("notInFinal", None)
            g = GVERDICT.get(fid)
            if g:
                f["gverdict"] = g["verdict"] + (" (of %s)" % g["duplicateOf"] if g.get("duplicateOf") else "") + ("" if "B2" in g["verdict"] else "; corroboration only, reviewed by Claude 8 Nov")
            if fid in REVIEW_NOTE:
                f["reviewNote"] = REVIEW_NOTE[fid]
            rows.append(f)
        status[area] = (pre, label, st, summary, cov, fs, qol, backlog)

    cnt = lambda fs, s: sum(1 for f in fs if f.get("severity") == s)
    md.append("# KurenaiOS quality audit — consolidated findings (2026-11)\n")
    md.append("Generated by `harness/consolidate.py` from `findings/`. Do not hand-edit; re-run the script.\n")
    md.append("Status: **complete** = the auditor finished and re-checked its P0/P1 findings; **partial** = the auditor was cut off by the usage limit — its findings are real (each was saved with evidence) but the area is NOT fully covered; **not run** = the area has not been audited at all (no findings does NOT mean it passed).\n")
    md.append("\n| ID | Area | Status | P0 | P1 | P2 | P3 | Total |\n|---|---|---|---|---|---|---|---|")
    tot = [0, 0, 0, 0]
    for area, (pre, label, st, summary, cov, fs, qol, backlog) in status.items():
        live = [r for r in rows if r["area"] == area and not r.get("resolved")]
        c = [cnt(live, s) for s in ("P0", "P1", "P2", "P3")]
        tot = [a + b for a, b in zip(tot, c)]
        md.append("| %s | %s | %s | %d | %d | %d | %d | %d |" % (pre, label, st, c[0], c[1], c[2], c[3], len(live)))
    md.append("| | **All** | | %d | %d | %d | %d | %d |\n" % (tot[0], tot[1], tot[2], tot[3], sum(tot)))
    md.append("Plus the live-account checks in `findings/live-account.md` (production, read via the app's own APIs; ids LA-n) and the user's own reports in `findings/user-reports-2026-11-02.md` (UR-n).\n")

    md.append("\n## All P0 and P1 findings at a glance\n")
    for f in rows:
        if f.get("severity") in ("P0", "P1") and not f.get("resolved"):
            md.append("- **%s** [%s] %s" % (f["id"], f["severity"], f.get("title", "")))

    for area, (pre, label, st, summary, cov, fs, qol, backlog) in status.items():
        md.append("\n---\n\n## %s — %s (%s)\n" % (pre, label, st))
        if summary:
            md.append("**Auditor's summary.** " + summary + "\n")
        if cov:
            md.append("**Coverage.** " + cov + "\n")
        if area in BUILD_NOTE:
            md.append("> **Build audited:** " + BUILD_NOTE[area] + "\n")
        if st == "partial":
            md.append("_Interrupted auditor: coverage notes were not written. Treat everything not listed below as unaudited._\n")
        if st == "not run":
            md.append("_Not audited yet._\n")
        for f in rows:
            if f["area"] != area:
                continue
            md.append("### %s · %s · %s — %s\n" % (f["id"], f.get("severity", "?"), f.get("category", "?"), f.get("title", "")))
            for k, lab in (("resolved", "RESOLVED"), ("recheck", "Re-checked on kos-redraw-1"), ("gverdict", "Independent check"), ("reviewNote", "Review note (8 Nov)"), ("devices", "Devices"), ("detail", "Detail / repro"), ("evidence", "Evidence"), ("rootCause", "Root cause"), ("fix", "Proposed fix")):
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
        cols = ["id", "area", "areaStatus", "notInFinal", "resolved", "recheck", "gverdict", "reviewNote", "severity", "category", "title", "devices", "effort", "needsDesign", "needsArt", "evidence", "rootCause", "fix", "detail"]
        w.writerow(cols)
        for f in rows:
            w.writerow([f.get(c, "") for c in cols])
    print("findings:", len(rows), "| by severity:", tot)
    for area, v in status.items():
        print("  %-22s %-8s %d" % (area, v[2], len(v[5])))


if __name__ == "__main__":
    main()
