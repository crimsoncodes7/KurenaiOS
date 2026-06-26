r"""Parse AQA 7517 A-level Computer Science spec (section 4) into a JSON tree.

Strategy: pdfplumber per page; detect heading lines (^4(\.\d+)+ Title) spanning
full width; body words are split into Content (left) / Additional information
(right) columns using the x-position of the 'Additional' header on that page
(falling back to the previous known boundary).

2026-06-26: added running-header/page-footer skipping (page-number-prefixed
"NN Visit ..." footers and the "AQA AS and A-level Computer Science ... Version
X.Y <date>" header), which previously bled into content/info and reflow-merged
with real text. PDF path points at ./Context/.

⚠️ REGEN CAVEAT: under pdfplumber 0.11.x (this machine) some 4.1.1.x sub-headings
(e.g. 4.1.1.12) are NOT detected, so their content shifts up into the previous
ref. js/data/compsci.js currently holds CORRECT assignments (footer noise cleaned
in place). Before shipping any regenerated output, DIFF it against the committed
compsci.js per-ref — do not overwrite blindly.
"""
import json, re, sys
import pdfplumber

PDF = "/Users/fj/Downloads/KurenaiOS 2/Context/AQA-7516-7517-SP-2015.PDF"
HEAD_RE = re.compile(r"^(4(?:\.\d+){1,3})\s+(.+)$")

def lines_from_words(words):
    """Group words into lines by 'top' coordinate."""
    rows = {}
    for w in words:
        key = round(w["top"] / 3)  # 3pt tolerance
        rows.setdefault(key, []).append(w)
    out = []
    for key in sorted(rows):
        ws = sorted(rows[key], key=lambda w: w["x0"])
        out.append(ws)
    return out

def main():
    nodes = []  # list of dicts: ref, title, content, info
    with pdfplumber.open(PDF) as pdf:
        # Section 4 of the spec: find page where '4.1 Fundamentals of programming'
        # appears as a section-4 heading (after the AS section 3). The text dump
        # showed section 4 begins around text-line 1747; locate by scanning pages.
        start_page = None
        for i, page in enumerate(pdf.pages):
            txt = page.extract_text() or ""
            if re.search(r"^4\.1\.1\.1\s+Data types", txt, re.M):
                start_page = i
                break
        if start_page is None:
            sys.exit("Could not locate section 4 start")

        boundary = None
        current = None
        for i in range(start_page, len(pdf.pages)):
            page = pdf.pages[i]
            txt = page.extract_text() or ""
            # Stop at the NEA section
            if re.search(r"^4\.14\s+Non-exam assessment", txt, re.M):
                break
            words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
            # locate the 'Additional' header x as column boundary
            for w in words:
                if w["text"] == "Additional":
                    nxt = [v for v in words if abs(v["top"] - w["top"]) < 2 and v["x0"] > w["x0"]]
                    if any(v["text"].startswith("information") for v in nxt):
                        boundary = w["x0"] - 6
                        break
            if boundary is None:
                boundary = page.width * 0.55
            for line_words in lines_from_words(words):
                line_text = " ".join(w["text"] for w in line_words)
                line_text = line_text.strip()
                if not line_text:
                    continue
                # skip running header / page footer furniture. These otherwise bleed into
                # content/info (page-number-prefixed "NN Visit …" footers, and the wrapped
                # "AQA AS and A-level Computer Science … Version X.Y <date>" running header)
                # and reflow-merge with real text. Match by content, not position.
                if re.match(r"^(\d+\s+)?Visit\b", line_text):
                    continue
                if re.match(r"^(AQA )?AS and A-level Computer Science", line_text):
                    continue
                if re.match(r"^AQA AS and A-level", line_text):
                    continue
                if re.match(r"^(Content Additional information|Content$|Additional information$)", line_text):
                    continue
                if re.match(r"^\d+\s*$", line_text):
                    continue
                m = HEAD_RE.match(line_text)
                if m and line_words[0]["x0"] < 120:
                    if current:
                        nodes.append(current)
                    current = {"ref": m.group(1), "title": m.group(2).strip(),
                               "content": [], "info": []}
                    continue
                if current is None:
                    continue
                # title wrap line? (heading text continuing on next line, left aligned,
                # no body started yet, and not a sentence-like line)
                left = [w for w in line_words if w["x0"] < boundary]
                right = [w for w in line_words if w["x0"] >= boundary]
                if left:
                    seg = " ".join(w["text"] for w in left)
                    if seg.strip() not in ("Content", "Content Additional information"):
                        current["content"].append(seg)
                if right:
                    seg = " ".join(w["text"] for w in right)
                    if seg.strip() not in ("Additional information", "information"):
                        current["info"].append(seg)
        if current:
            nodes.append(current)

    # Reflow: join wrapped lines into paragraphs/bullets
    def reflow(lines):
        out = []
        for ln in lines:
            ln = ln.strip()
            if not ln:
                continue
            if ln.startswith("•") or ln.startswith("◦") or re.match(r"^o\s", ln):
                out.append(ln)
            elif out and not out[-1].endswith((".", ":", "?")) and not ln[0].isupper() and not ln.startswith("•"):
                out[-1] += " " + ln
            elif out and out[-1].endswith(("-",)):
                out[-1] = out[-1][:-1] + ln
            else:
                out.append(ln)
        return out

    for n in nodes:
        n["content"] = reflow(n["content"])
        n["info"] = reflow(n["info"])

    with open("/Users/fj/Downloads/KurenaiOS 2/tools/aqa.json", "w") as f:
        json.dump(nodes, f, indent=1)
    print(f"{len(nodes)} nodes")
    refs = [n["ref"] for n in nodes]
    tops = sorted(set(r.split(".")[1] for r in refs), key=int)
    print("Top sections:", tops)
    print("Sample:", json.dumps(nodes[0], indent=1)[:800])

main()
