import json, re
import pdfplumber

PDF = "/mnt/user-data/uploads/IT_AAQ_Specification.pdf"
UNIT_RE = re.compile(r"^(?:5\.\d\.\d\s+)?Unit (F20\d):? (.+)$")
TA_RE = re.compile(r"^Topic [Aa]rea (\d+): (.+)$")
SUB_RE = re.compile(r"^(\d+\.\d+)\.?\s+(.+)$")

def main():
    units = []
    cur_unit = cur_ta = cur_sub = None
    with pdfplumber.open(PDF) as pdf:
        # content tables live between printed pages ~28 and ~85; find page indices
        start = end = None
        for i, p in enumerate(pdf.pages):
            t = p.extract_text() or ""
            if start is None and "Topic Area 1: Understanding data" in t:
                start = i
            if "Assessment criteria" in t and start is not None and end is None and i > start + 30:
                pass
        # we'll just scan from start until '6 Assessment' section header
        for i in range(start, len(pdf.pages)):
            page = pdf.pages[i]
            txt = page.extract_text() or ""
            if re.search(r"^6\s+Assessment for", txt, re.M):
                break
            words = [w for w in page.extract_words() if 60 < w["top"] < 770]
            # column boundary: x of 'Breadth' or 'Exemplification' header, else mid
            boundary = None
            for w in words:
                if w["text"] in ("Breadth", "Exemplification"):
                    boundary = w["x0"] - 6
                    break
            if boundary is None:
                boundary = page.width * 0.52
            rows = {}
            for w in words:
                key = round(w["top"] / 3.2)
                rows.setdefault(key, []).append(w)
            for key in sorted(rows):
                ws = sorted(rows[key], key=lambda w: w["x0"])
                line = " ".join(w["text"] for w in ws).strip()
                if not line: continue
                if line.startswith(("Version 4", "© Cambridge", "Cambridge OCR Level 3")):
                    continue
                m = UNIT_RE.match(line)
                if m:
                    code = m.group(1)
                    existing = next((u for u in units if u["code"] == code), None)
                    if existing:
                        cur_unit = existing
                    else:
                        cur_unit = {"code": code, "title": m.group(2).strip().rstrip("."), "areas": []}
                        units.append(cur_unit)
                    cur_ta = cur_sub = None
                    continue
                if cur_unit is None: continue
                m = TA_RE.match(line)
                if m:
                    cur_ta = {"num": m.group(1), "title": m.group(2).strip(), "subs": []}
                    cur_unit["areas"].append(cur_ta)
                    cur_sub = None
                    continue
                if cur_ta is None: continue
                if line in ("Teaching content Breadth and depth", "Teaching content Exemplification",
                            "Teaching content", "Breadth and depth", "Exemplification"):
                    continue
                m = SUB_RE.match(line)
                left_ws = [w for w in ws if w["x0"] < boundary]
                if m and left_ws and left_ws[0]["x0"] < 120 and not line.startswith(("o ", "• ")):
                    # only treat as subtopic heading if entire line sits left or spans (heading rows have no right text usually)
                    cur_sub = {"ref": m.group(1), "title": " ".join(w["text"] for w in left_ws)[len(m.group(1)):].strip(),
                               "teach": [], "depth": []}
                    cur_ta["subs"].append(cur_sub)
                    rtxt = " ".join(w["text"] for w in ws if w["x0"] >= boundary).strip()
                    if rtxt: cur_sub["depth"].append(rtxt)
                    continue
                if cur_sub is None: continue
                ltxt = " ".join(w["text"] for w in ws if w["x0"] < boundary).strip()
                rtxt = " ".join(w["text"] for w in ws if w["x0"] >= boundary).strip()
                if ltxt: cur_sub["teach"].append(ltxt)
                if rtxt: cur_sub["depth"].append(rtxt)

    def reflow(lines):
        out = []
        for ln in lines:
            ln = re.sub(r"\s+", " ", ln).strip()
            if not ln: continue
            if ln.startswith(("□", "•", "o ", "To include", "Does not include")):
                out.append(ln)
            elif out:
                out[-1] += " " + ln
            else:
                out.append(ln)
        return out

    for u in units:
        for ta in u["areas"]:
            for s in ta["subs"]:
                s["teach"] = reflow(s["teach"])
                s["depth"] = reflow(s["depth"])

    json.dump(units, open("/home/claude/extract/it.json", "w"), indent=1)
    for u in units:
        print(u["code"], u["title"], "->", [(a["num"], a["title"][:34], len(a["subs"])) for a in u["areas"]])

main()
