import json, re
import pdfplumber

PDF = "/mnt/user-data/uploads/a-level-l3-mathematics-specification-issue4.pdf"
REF = re.compile(r"^\d{1,2}\.\d{1,2}$")

def parse_pages(pdf, idxs):
    topics = {}   # num -> {num,name,subs:{ref:{content,guidance}}}
    cur_topic = None
    cur_ref = None
    for i in idxs:
        page = pdf.pages[i]
        words = page.extract_words()
        rows = {}
        for w in words:
            key = round(w["top"] / 4)
            rows.setdefault(key, []).append(w)
        for key in sorted(rows):
            ws = sorted(rows[key], key=lambda w: w["x0"])
            tcol, rcol, ccol, gcol = [], [], [], []
            for w in ws:
                x = w["x0"]
                if x < 168: tcol.append(w["text"])
                elif x < 204: rcol.append(w["text"])
                elif x < 352: ccol.append(w["text"])
                else: gcol.append(w["text"])
            ttxt = " ".join(tcol).strip()
            rtxt = " ".join(rcol).strip()
            ctxt = " ".join(ccol).strip()
            gtxt = " ".join(gcol).strip()
            # furniture
            if ttxt.startswith(("Pearson", "Specification", "Topics")) or "What students" in ctxt:
                continue
            if ttxt in ("Content",) or ctxt == "Content" or gtxt == "Guidance":
                ctxt = "" if ctxt == "Content" else ctxt
                gtxt = "" if gtxt == "Guidance" else gtxt
            # topic column
            if ttxt:
                m = re.match(r"^(\d{1,2})$", ttxt)
                if m:
                    cur_topic = m.group(1)
                    topics.setdefault(cur_topic, {"num": cur_topic, "name": "", "subs": {}})
                elif cur_topic and not ttxt.endswith("continued") and ttxt != "continued":
                    t = topics[cur_topic]
                    nm = re.sub(r"\s*continued$", "", ttxt)
                    if nm and nm.lower() not in t["name"].lower():
                        t["name"] = (t["name"] + " " + nm).strip()
            # ref column
            if rtxt and REF.match(rtxt):
                cur_ref = rtxt
                if cur_topic:
                    topics[cur_topic]["subs"].setdefault(cur_ref, {"content": [], "guidance": []})
            elif rtxt == "cont.":
                pass
            if cur_topic and cur_ref and cur_ref in topics[cur_topic]["subs"]:
                node = topics[cur_topic]["subs"][cur_ref]
                if ctxt: node["content"].append(ctxt)
                if gtxt: node["guidance"].append(gtxt)
    return topics

def reflow(lines):
    out = []
    for ln in lines:
        ln = re.sub(r"\s+", " ", ln).strip()
        if not ln: continue
        if out and (out[-1].endswith((",", ";", "and", "or", "the", "of", "to", "a", "in", "with", "for", "be", "use", "are", "between", "from", "as", "by", "their", "is", "may", "an", "such", "including")) or (ln[0].islower() and not ln.startswith(("e.g", "i.e")))):
            out[-1] += " " + ln
        else:
            out.append(ln)
    return out

with pdfplumber.open(PDF) as pdf:
    pure = parse_pages(pdf, range(14, 28))     # pages 15-28
    sm = parse_pages(pdf, range(29, 38))       # pages 30-38

for group in (pure, sm):
    for t in group.values():
        for ref, node in t["subs"].items():
            node["content"] = reflow(node["content"])
            node["guidance"] = reflow(node["guidance"])

out = {"pure": list(pure.values()), "statsmech": list(sm.values())}
json.dump(out, open("/home/claude/extract/maths.json", "w"), indent=1)
for k, g in out.items():
    print(k, [(t["num"], t["name"], len(t["subs"])) for t in g])
