"""tools/lib/sql_ref.py — the native side of tools/sql_diff.mjs.

Reads a JSON list of {seed, src} on stdin and runs each on Python's own
SQLite (autocommit, so BEGIN/COMMIT mean what they say), one statement at a
time, printing exactly what js/labs/sql-run.js prints: a query as an aligned
table, a change as "N rows changed.", the first error ending the run.
Numbers are written the way JavaScript writes them (sql.js hands a REAL
2.0 back as 2). Writes a JSON list of {ok, stdout, error} to stdout.
Run with python3 -I.
"""
import json
import re
import sqlite3
import sys

MAX_ROWS = 200
CHANGE = re.compile(r"^\s*(?:--[^\n]*\n\s*|/\*[\s\S]*?\*/\s*)*(insert|update|delete|replace)\b", re.I)


def js_number(f):
    """ECMAScript Number::toString for a finite double."""
    if f != f:
        return "NaN"
    if f in (float("inf"), float("-inf")):
        return "Infinity" if f > 0 else "-Infinity"
    if f == 0:
        return "0"
    sign = "-" if f < 0 else ""
    r = repr(abs(f))
    if "e" in r:
        mant, exp = r.split("e")
        exp = int(exp)
    else:
        mant, exp = r, 0
    if "." in mant:
        ip, fp = mant.split(".")
    else:
        ip, fp = mant, ""
    digits = (ip + fp).lstrip("0")
    lead = len(ip + fp) - len((ip + fp).lstrip("0"))
    n = len(ip) + exp - lead            # the decimal point sits after n digits
    digits = digits.rstrip("0") or "0"
    k = len(digits)
    if k <= n <= 21:
        s = digits + "0" * (n - k)
    elif 0 < n <= 21:
        s = digits[:n] + "." + digits[n:]
    elif -6 < n <= 0:
        s = "0." + "0" * (-n) + digits
    else:
        e = n - 1
        es = ("+" if e >= 0 else "-") + str(abs(e))
        s = digits[0] + ("." + digits[1:] if k > 1 else "") + "e" + es
    return sign + s


def cell(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, float):
        return js_number(v)
    if isinstance(v, (bytes, bytearray, memoryview)):
        return "x'" + bytes(v).hex() + "'"
    return str(v)


def table(columns, rows):
    cells = [[cell(v) for v in r] for r in rows]
    w = [max([len(str(c))] + [len(r[i]) for r in cells]) for i, c in enumerate(columns)]

    def line(vals):
        return " | ".join(v if i == len(vals) - 1 else v + " " * (w[i] - len(v)) for i, v in enumerate(vals)).rstrip()

    out = [line([str(c) for c in columns]), "-+-".join("-" * n for n in w)]
    if not cells:
        out.append("(no rows)")
    out += [line(r) for r in cells[:MAX_ROWS]]
    if len(cells) > MAX_ROWS:
        out.append("… %d more rows" % (len(cells) - MAX_ROWS))
    return "\n".join(out)


def statements(src):
    buf = ""
    for ch in src:
        buf += ch
        if ch == ";" and sqlite3.complete_statement(buf):
            yield buf
            buf = ""
    rest = re.sub(r"--[^\n]*|/\*[\s\S]*?\*/", "", buf).strip()
    if rest:
        yield buf


def run(req):
    db = sqlite3.connect(":memory:", isolation_level=None)
    parts = []
    try:
        if req.get("seed"):
            try:
                db.executescript(req["seed"])
            except sqlite3.Error as e:
                return {"ok": False, "stdout": "", "error": {"kind": "seed", "msg": "The lesson's dataset did not load: " + str(e)}}
        for sql in statements(req.get("src") or ""):
            try:
                cur = db.execute(sql)
                rows = cur.fetchall() if cur.description else []
            except sqlite3.Error as e:
                return {"ok": False, "stdout": "\n".join(parts), "error": {"kind": "sql", "msg": str(e)}}
            if cur.description:
                parts.append(table([d[0] for d in cur.description], rows) + "\n")
            elif CHANGE.match(sql):
                n = cur.rowcount
                parts.append("%d %s" % (n, "row changed." if n == 1 else "rows changed."))
        return {"ok": True, "stdout": "\n".join(parts), "error": None}
    finally:
        db.close()


if __name__ == "__main__":
    reqs = json.load(sys.stdin)
    json.dump([run(r) for r in reqs], sys.stdout)
    print("\n" + sqlite3.sqlite_version, file=sys.stderr)
