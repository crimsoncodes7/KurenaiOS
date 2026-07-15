import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "js" / "data"
OUT.mkdir(parents=True, exist_ok=True)


def write(name, var, obj):
    """Emit readable JavaScript data without changing object key order."""
    has_manual_nea = name == "compsci" and any(
        section.get("ref") == "NEA" for section in obj.get("sections", [])
    )
    with (OUT / f"{name}.js").open("w", encoding="utf-8") as f:
        f.write("/* Kurenai OS — generated from the official specification PDF. */\n")
        if has_manual_nea:
            f.write("/* NEA section (below) is manually authored — preserved by the generator. */\n")
        f.write(f"window.KOS_DATA = window.KOS_DATA || {{}};\nwindow.KOS_DATA.{var} = ")
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write(";\n")


def read_generated(name, var):
    """Read the JSON payload from an existing generated assignment.

    This is intentionally layout-only: it does not invent or clean spec data,
    and lets a repository without the original extracted PDFs make the output
    readable while retaining manual additions such as Computer Science's NEA.
    """
    path = OUT / f"{name}.js"
    marker = f"window.KOS_DATA.{var} = "
    source = path.read_text(encoding="utf-8")
    if marker not in source:
        raise SystemExit(f"Could not find {marker!r} in {path}")
    payload = source.split(marker, 1)[1].strip()
    if not payload.endswith(";"):
        raise SystemExit(f"Expected a terminating semicolon in {path}")
    return json.loads(payload[:-1])


def format_existing():
    """Re-emit the checked-in generated data with stable, editable layout."""
    for name, var in (("compsci", "compsci"), ("maths", "maths"), ("it", "it")):
        write(name, var, read_generated(name, var))
    print("Reformatted existing generated data without changing its payload.")


if "--format-existing" in sys.argv:
    format_existing()
    raise SystemExit(0)

def clean(s):
    s = s.replace("\u2212", "-").replace("\ufb01", "fi").replace("\ufb02", "fl")
    s = re.sub(r"\s+", " ", s).strip()
    return s

# ---------- Computer Science (AQA 7517) ----------
nodes = json.load(open("/home/claude/extract/aqa.json"))
fixes = {
    "4.7": "Fundamentals of computer organisation and architecture",
    "4.8.1": "Individual (moral), social (ethical), legal and cultural issues and opportunities",
}
tree = []
index = {}
for n in nodes:
    ref = n["ref"]
    title = fixes.get(ref, n["title"])
    depth = ref.count(".")
    node = {"ref": ref, "title": clean(title)}
    if n["content"]:
        node["content"] = [clean(x) for x in n["content"]]
        node["info"] = [clean(x) for x in n["info"]]
    node["children"] = []
    index[ref] = node
    parent = ".".join(ref.split(".")[:-1])
    if depth == 1:
        tree.append(node)
    elif parent in index:
        index[parent]["children"].append(node)
    else:
        tree.append(node)

# paper mapping for AQA 7517
PAPER1 = {"4.1","4.2","4.3","4.4"}  # on-screen exam: programming, data structures, algorithms, theory
for s in tree:
    s["paper"] = 1 if s["ref"] in PAPER1 else 2

compsci = {
    "id": "compsci", "name": "Computer Science", "board": "AQA 7517",
    "labelL": "Content (spec wording)", "labelR": "Additional information",
    "sections": tree,
}
# The AQA parser intentionally stops before the manually authored NEA project.
# Preserve that section from the existing generated tree when doing a full PDF
# regeneration, rather than silently dropping user-maintained curriculum data.
existing_compsci = read_generated("compsci", "compsci")
manual_nea = [section for section in existing_compsci.get("sections", []) if section.get("ref") == "NEA"]
if manual_nea:
    compsci["sections"].extend(manual_nea)

# ---------- Mathematics (Edexcel 9MA0) ----------
m = json.load(open("/home/claude/extract/maths.json"))
def maths_group(group, prefix):
    out = []
    namefix = {"3": "Coordinate geometry in the (x, y) plane"}
    for t in group:
        name = namefix.get(t["num"], clean(t["name"]))
        topic = {"ref": prefix + t["num"], "title": name, "children": []}
        for ref in t["suborder"]:
            sub = t["subs"][ref]
            topic["children"].append({
                "ref": ref, "title": sub["content"][0][:80] + ("\u2026" if len(sub["content"][0]) > 80 else "") if sub["content"] else ref,
                "content": [clean(x) for x in sub["content"]],
                "info": [clean(x) for x in sub["guidance"]],
                "children": [],
            })
        out.append(topic)
    return out

maths = {
    "id": "maths", "name": "Mathematics", "board": "Edexcel 9MA0",
    "labelL": "Content (spec wording)", "labelR": "Guidance",
    "sections": (
        [dict(s, paper="Pure (P1+P2)") for s in maths_group(m["pure"], "P")] +
        [dict(s, paper="Paper 3") for s in maths_group(m["statsmech"], "S")]
    ),
}
# nicer subtopic titles for maths (first clause of content)
SHORT = {
 "1.1":"Methods of proof","2.1":"Laws of indices","2.2":"Surds","2.3":"Quadratic functions & discriminant",
 "2.4":"Simultaneous equations","2.5":"Linear & quadratic inequalities","2.6":"Polynomials & factor theorem",
 "2.7":"Graphs of functions & proportion","2.8":"Composite & inverse functions","2.9":"Graph transformations",
 "2.10":"Partial fractions","2.11":"Functions in modelling","3.1":"Straight lines","3.2":"Circles",
 "3.3":"Parametric equations","3.4":"Parametric modelling","4.1":"Binomial expansion","4.2":"Sequences & recurrence",
 "4.3":"Sigma notation","4.4":"Arithmetic sequences & series","4.5":"Geometric sequences & series","4.6":"Series in modelling",
 "5.1":"Sine/cosine rules, radians, arcs & sectors","5.2":"Small angle approximations","5.3":"Trig graphs & exact values",
 "5.4":"Reciprocal & inverse trig functions","5.5":"Trig identities","5.6":"Addition/double angle & R-form",
 "5.7":"Trig equations","5.8":"Trig proofs","5.9":"Trig in context","6.1":"Exponential functions & e^x",
 "6.2":"Gradient of e^kx","6.3":"Logarithms & ln x","6.4":"Laws of logarithms","6.5":"Solving a^x = b",
 "6.6":"Logarithmic graphs & estimation","6.7":"Exponential growth & decay","7.1":"Derivative as gradient; first principles",
 "7.2":"Differentiating x^n, e^kx, trig, ln x","7.3":"Tangents, normals, maxima & minima","7.4":"Product, quotient & chain rules",
 "7.5":"Implicit & parametric differentiation","7.6":"Constructing differential equations","8.1":"Fundamental Theorem of Calculus",
 "8.2":"Integrating standard functions","8.3":"Definite integrals & areas","8.4":"Integration as limit of a sum",
 "8.5":"Substitution & by parts","8.6":"Integration with partial fractions","8.7":"Separable differential equations",
 "8.8":"Interpreting DE solutions","9.1":"Change of sign root location","9.2":"Iterative methods; cobweb/staircase",
 "9.3":"Newton-Raphson","9.4":"Trapezium rule","9.5":"Numerical methods in context","10.1":"Vectors in 2D & 3D",
 "10.2":"Magnitude & direction","10.3":"Vector addition & scalars","10.4":"Position vectors & distance","10.5":"Vector problems",
}
SHORT_S = {
 "1.1":"Sampling techniques","2.1":"Single-variable diagrams & histograms","2.2":"Scatter diagrams, regression & correlation",
 "2.3":"Central tendency, variance & standard deviation","2.4":"Outliers & cleaning data","3.1":"Mutually exclusive & independent events",
 "3.2":"Conditional probability","3.3":"Modelling with probability","4.1":"Discrete distributions & binomial",
 "4.2":"Normal distribution","4.3":"Selecting a distribution","5.1":"Hypothesis testing language & correlation",
 "5.2":"Binomial hypothesis tests","5.3":"Normal mean hypothesis tests","6.1":"Quantities & SI units",
 "7.1":"Language of kinematics","7.2":"Kinematics graphs","7.3":"suvat (constant acceleration)","7.4":"Calculus in kinematics",
 "7.5":"Projectiles","8.1":"Forces & Newton's first law","8.2":"Newton's second law","8.3":"Weight & gravity",
 "8.4":"Newton's third law, pulleys & connected particles","8.5":"Resultant forces","8.6":"Friction F \u2264 \u03bcR",
 "9.1":"Moments & equilibrium of rigid bodies",
}
for s in maths["sections"]:
    table = SHORT if s["ref"].startswith("P") else SHORT_S
    for c in s["children"]:
        if c["ref"] in table:
            c["title"] = table[c["ref"]]

# ---------- IT (OCR Cambridge Advanced National, Data Analytics) ----------
units = json.load(open("/home/claude/extract/it.json"))
it_sections = []
for u in units:
    sec = {"ref": u["code"], "title": clean(u["title"]), "paper": "Exam" if u["code"] in ("F200", "F201") else "NEA", "children": []}
    for a in u["areas"]:
        area = {"ref": f'{u["code"]}.TA{a["num"]}', "title": clean(a["title"]), "children": []}
        for s in a["subs"]:
            area["children"].append({
                "ref": f'{u["code"]}.{s["ref"]}', "title": clean(s["title"]),
                "content": [clean(x) for x in s["teach"]],
                "info": [clean(x) for x in s["depth"]],
                "children": [],
            })
        sec["children"].append(area)
    it_sections.append(sec)

it = {"id": "it", "name": "IT: Data Analytics", "board": "OCR AAQ H019/H119",
      "labelL": "Teaching content", "labelR": "Breadth & depth / Exemplification",
      "sections": it_sections}

write("compsci", "compsci", compsci)
write("maths", "maths", maths)
write("it", "it", it)

import subprocess
print(subprocess.run(["ls", "-la", str(OUT)], capture_output=True, text=True).stdout)
def count(sections):
    n = 0
    def walk(x):
        nonlocal n
        if x.get("content"): n += 1
        for c in x.get("children", []): walk(c)
    for s in sections: walk(s)
    return n
print("leaves:", count(compsci["sections"]), count(maths["sections"]), count(it["sections"]))
