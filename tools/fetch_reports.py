#!/usr/bin/env python3
"""tools/fetch_reports.py — fetch the boards' examiner's reports into YOUR folder
(roadmap 5.8, docs/exams-plan.md §4.4).

The reports are free from the boards, but they are copyright: they are saved
next to the papers in ~/Downloads/A-level (or KOS_ALEVEL / --root), never into
the repo or the deploy (invariant 125). What the app carries is the paraphrased
notes written from them, tools/exam-index/reports/<paper>.md, each point citing
its series and question.

Where they come from:
  AQA       filestore.aqa.org.uk/sample-papers-and-mark-schemes/<year>/june/
            AQA-<code>-WRE-JUN<yy>.PDF   (7517 papers 1–2, 7516 papers 1–2)
            AQA moved its newer files behind its own site; a year that answers
            with a redirect or a 404 is listed, not retried.
  Pearson   Principal Examiner Feedback has no stable pattern. Put one URL per
            line in tools/exam-index/report-urls.txt as
              <paper-id> <sitting> <url>     e.g. edexcel-9ma0-1 2024-06 https://…
            and this script fetches those too.

Idempotent: a file already there is skipped. Prints what it saved and what it
could not find. Nothing here runs at build time or in the app.

Usage:  python3 tools/fetch_reports.py [--root PATH] [--dry-run]
"""
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
URLS = os.path.join(HERE, "exam-index", "report-urls.txt")
AQA = [  # paper id, AQA component code, folder under Past Papers
    ("aqa-7517-1", "75171", "Computer Science (AQA)/A-level/Paper 1"),
    ("aqa-7517-2", "75172", "Computer Science (AQA)/A-level/Paper 2"),
    ("aqa-7516-1", "75161", "Computer Science (AQA)/AS-level/Paper 1"),
    ("aqa-7516-2", "75162", "Computer Science (AQA)/AS-level/Paper 2"),
]
FOLDER = {
    "edexcel-9ma0-1": "Maths (Edexcel)/A-level/Paper 1 - Pure",
    "edexcel-9ma0-2": "Maths (Edexcel)/A-level/Paper 2 - Pure",
    "edexcel-9ma0-3": "Maths (Edexcel)/A-level/Paper 3 - Statistics & Mechanics",
    "edexcel-8ma0-1": "Maths (Edexcel)/AS-level/Paper 1 - Pure",
    "edexcel-8ma0-2": "Maths (Edexcel)/AS-level/Paper 2 - Statistics & Mechanics",
}
FOLDER.update({p: f for p, _, f in AQA})
YEARS = [2017, 2018, 2019, 2022, 2023, 2024, 2025]   # no summer exams in 2020–21


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def get(url):
    opener = urllib.request.build_opener(NoRedirect)
    req = urllib.request.Request(url, headers={"User-Agent": "KurenaiOS revision index (personal use)"})
    with opener.open(req, timeout=30) as r:
        if r.status != 200:
            raise IOError("HTTP %d" % r.status)
        body = r.read()
    if not body.startswith(b"%PDF"):
        raise IOError("not a PDF")
    return body


def main(argv):
    root = os.environ.get("KOS_ALEVEL") or os.path.expanduser("~/Downloads/A-level")
    if "--root" in argv:
        root = argv[argv.index("--root") + 1]
    papers = os.path.join(root, "Past Papers")
    if not os.path.isdir(papers):
        sys.stderr.write("fetch_reports: no Past Papers folder at %s\n" % papers)
        return 2
    dry = "--dry-run" in argv
    jobs = []
    for pid, code, folder in AQA:
        for y in YEARS:
            jobs.append((pid, "%d-06" % y, "https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/%d/june/AQA-%s-WRE-JUN%02d.PDF" % (y, code, y % 100)))
    if os.path.exists(URLS):
        for line in open(URLS, encoding="utf8"):
            parts = line.split()
            if len(parts) == 3 and not line.startswith("#"):
                jobs.append(tuple(parts))
    saved, have, missing = [], 0, []
    for pid, sitting, url in jobs:
        folder = FOLDER.get(pid)
        if not folder:
            missing.append("%s %s: unknown paper id" % (pid, sitting))
            continue
        dest = os.path.join(papers, folder, "Examiner Reports", sitting + " ER.pdf")
        if os.path.exists(dest):
            have += 1
            continue
        if dry:
            print("would fetch", url, "→", os.path.relpath(dest, root))
            continue
        try:
            body = get(url)
        except Exception as e:
            missing.append("%s %s: %s" % (pid, sitting, e))
            continue
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "wb").write(body)
        saved.append(os.path.relpath(dest, root))
    print("fetch_reports: saved %d, already had %d, not found %d" % (len(saved), have, len(missing)))
    for s in saved:
        print("  +", s)
    for m in missing:
        print("  ·", m)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
