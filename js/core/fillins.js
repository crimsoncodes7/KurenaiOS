/* Kurenai OS — core/fillins.js
   Roadmap 5.19 item 3, design turn 43: the parts of a worked example (or a
   notes page, a quiz or exam item) the learner fills in and the app marks.
   A content block names one; content.js renders a placeholder
   (`[data-ui~='content.fill']`, the spec as JSON) and typeset() mounts it:

     {grid:  {code?, lang?, cols:[…], rows:[[…]], given?:[[r,c]…], cap?}}
             a table to complete — a TRACE TABLE when it carries the code,
             an IT data table without. Every cell not in `given` is typed;
             "" expects it left blank. Check marks each cell, names the first
             wrong row, and Show expected fills the rest in.
     {trace: …}  the same as grid (the name a trace table is written with).
     {sql:   {setup, answer, starter?, ordered?, cap?}}
             SQL run on the question's own small database (`setup`: CREATE
             and INSERT statements) in Code's sealed SQLite worker (Spike S),
             shown beside the answer's result: "Same rows" (order ignored
             unless `ordered`). A blank result says so.
     {gates: {inputs:["A","B"], gates:[{id, type, in:[…]}], out, pick?, fill?}}
             a logic circuit. `pick` names a gate whose type is hidden and
             chosen from the six; `fill` asks for the output column instead.
             The inputs switch, the truth table fills as rows are tried, and
             Check compares every row.
     {predict: {code, lang?, expect?}}
             C#: type what it prints, then Run unlocks (the in-app runner).
     {lab: "simId"}   a lab embedded at the reading measure (KOS.sims.embed).

   Nothing here is stored or paid: a fill-in is practice beside the notes.
   Pure helpers (`gateEval`, `cellSame`, `sameRows`, `circuit`) are exported
   for the tests. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = function () { return KOS.ui.el.apply(null, arguments); };
  function inline(s) { return KOS.content && KOS.content.inline ? KOS.content.inline(String(s == null ? "" : s)) : String(s == null ? "" : s); }

  /* ---------------- pure ---------------- */
  /* a typed cell against the expected one: trimmed, case and quotes ignored,
     numbers by value ("4.0" is 4), "-" or "—" for blank */
  function cellNorm(v) {
    var s = String(v == null ? "" : v).trim().replace(/^["'](.*)["']$/, "$1").trim().toLowerCase();
    return s === "-" || s === "—" ? "" : s;
  }
  function cellSame(typed, exp) {
    var a = cellNorm(typed), b = cellNorm(exp);
    if (a === b) return true;
    if (a !== "" && b !== "" && !isNaN(+a) && !isNaN(+b)) return +a === +b;
    return false;
  }
  /* two SQL result sets: the same rows (as a multiset unless ordered) */
  function rowKey(r) { return r.map(function (c) { return c == null ? "NULL" : typeof c === "number" ? String(+c) : String(c); }).join("␟"); }
  function sameRows(got, exp, ordered) {
    if (!got || !exp) return false;
    if (got.columns.length !== exp.columns.length || got.rows.length !== exp.rows.length) return false;
    var a = got.rows.map(rowKey), b = exp.rows.map(rowKey);
    if (!ordered) { a.sort(); b.sort(); }
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  var OPS = {
    AND: function (v) { return v.every(Boolean) ? 1 : 0; },
    OR: function (v) { return v.some(Boolean) ? 1 : 0; },
    NOT: function (v) { return v[0] ? 0 : 1; },
    NAND: function (v) { return v.every(Boolean) ? 0 : 1; },
    NOR: function (v) { return v.some(Boolean) ? 0 : 1; },
    XOR: function (v) { return v.reduce(function (a, b) { return a ^ (b ? 1 : 0); }, 0); },
    XNOR: function (v) { return v.reduce(function (a, b) { return a ^ (b ? 1 : 0); }, 0) ? 0 : 1; }
  };
  var PICK = ["AND", "OR", "NOT", "NAND", "NOR", "XOR"];
  /* every node's value for one row of inputs; `types` overrides gate types */
  function gateEval(spec, inputs, types) {
    var val = {}, byId = {};
    spec.inputs.forEach(function (n) { val[n] = inputs[n] ? 1 : 0; });
    spec.gates.forEach(function (g) { byId[g.id] = g; });
    function of(id) {
      if (val[id] !== undefined) return val[id];
      var g = byId[id];
      if (!g) return 0;
      var t = (types && types[g.id]) || g.type, f = OPS[t];
      val[id] = f ? f(g.in.map(of)) : 0;
      return val[id];
    }
    spec.gates.forEach(function (g) { of(g.id); });
    return val;
  }
  /* every row of the truth table: inputs, the wanted output */
  function truth(spec) {
    var n = spec.inputs.length, out = [];
    for (var m = 0; m < (1 << n); m++) {
      var ins = {};
      spec.inputs.forEach(function (name, i) { ins[name] = (m >> (n - 1 - i)) & 1; });
      out.push({ ins: ins, want: gateEval(spec, ins)[spec.out] });
    }
    return out;
  }
  /* the circuit laid out by depth: inputs in a column, each gate a column
     to the right of its deepest input, at the mean height of its inputs */
  function circuit(spec) {
    var pos = {}, depth = {}, byId = {}, STEP_Y = 56, COL = 140, X0 = 56;
    spec.gates.forEach(function (g) { byId[g.id] = g; });
    spec.inputs.forEach(function (n, i) { pos[n] = { x: X0, y: 36 + i * STEP_Y }; depth[n] = 0; });
    function d(id) {
      if (depth[id] !== undefined) return depth[id];
      depth[id] = 1 + Math.max.apply(null, byId[id].in.map(d));
      return depth[id];
    }
    spec.gates.forEach(function (g) { d(g.id); });
    var maxD = 0;
    spec.gates.slice().sort(function (a, b) { return depth[a.id] - depth[b.id]; }).forEach(function (g) {
      var ys = g.in.map(function (i) { return pos[i].y; });
      pos[g.id] = { x: X0 + 40 + depth[g.id] * COL, y: ys.reduce(function (a, b) { return a + b; }, 0) / ys.length };
      maxD = Math.max(maxD, depth[g.id]);
    });
    /* two gates on one spot: nudge the later one down */
    spec.gates.forEach(function (g, i) {
      spec.gates.slice(0, i).forEach(function (h) {
        if (Math.abs(pos[h.id].x - pos[g.id].x) < 1 && Math.abs(pos[h.id].y - pos[g.id].y) < 48) pos[g.id].y = pos[h.id].y + 52;
      });
    });
    var h = Math.max.apply(null, Object.keys(pos).map(function (k) { return pos[k].y; })) + 36;
    return { pos: pos, w: X0 + 40 + maxD * COL + 96, h: Math.max(h, 96) };
  }

  /* ---------------- shared bits ---------------- */
  function verdict(tone, head, words) {
    return el("div", { class: "k-fill-verdict", "data-ui": "fill.verdict", "data-tone": tone, role: "status" }, [
      el("b", { text: head }), words ? el("span", { text: words }) : null].filter(Boolean));
  }
  function code(src, lang) {
    return el("div", { class: "k-prose k-fill-code", html: KOS.content.renderBlocks([{ code: { src: src, lang: lang || "pseudo" } }]) });
  }
  function shell(kind, kids, cap) {
    return el("section", { class: "k-fill", "data-ui": "fill.part", "data-kind": kind }, [
      cap ? el("p", { class: "k-fill-cap", html: inline(cap) }) : null].concat(kids).filter(Boolean));
  }

  /* ---------------- a table to complete (trace tables, IT tables) ---------------- */
  function grid(spec) {
    var cols = spec.cols || [], rows = spec.rows || [];
    var given = {};
    (spec.given || []).forEach(function (rc) { given[rc[0] + "," + rc[1]] = true; });
    var inputs = [], showing = false;
    var tbl = el("div", { class: "k-fill-grid", role: "table", "aria-label": spec.code ? "Trace table" : "Table to complete" });
    tbl.style.setProperty("--fill-cols", String(cols.length));
    tbl.appendChild(el("div", { class: "k-fill-tr k-fill-th", role: "row" }, cols.map(function (c) { return el("span", { role: "columnheader", html: inline(c) }); })));
    rows.forEach(function (r, ri) {
      var tr = el("div", { class: "k-fill-tr", role: "row", "data-row": String(ri) });
      r.forEach(function (exp, ci) {
        if (given[ri + "," + ci]) { tr.appendChild(el("span", { class: "k-fill-cell k-mono", role: "cell", "data-state": "given", text: String(exp) })); return; }
        var inp = el("input", { class: "k-fill-cell k-fill-in k-mono", type: "text", autocomplete: "off", spellcheck: "false",
          "aria-label": "Row " + (ri + 1) + ", " + String(cols[ci] || "column " + (ci + 1)).replace(/\$/g, "") });
        inp.addEventListener("input", function () { inp.removeAttribute("data-state"); });
        inputs.push({ inp: inp, r: ri, c: ci, exp: exp });
        tr.appendChild(el("span", { class: "k-fill-cellwrap", role: "cell" }, [inp, el("em", { class: "k-fill-exp k-mono", hidden: "", text: String(exp) === "" ? "—" : String(exp) })]));
      });
      tbl.appendChild(tr);
    });
    var out = el("div", { class: "k-fill-out", "aria-live": "polite" });
    var showBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "fill.show", hidden: "", text: "Show expected", onclick: function () {
      showing = !showing;
      showBtn.textContent = showing ? "Hide expected" : "Show expected";
      inputs.forEach(function (x) { var e = x.inp.parentNode.querySelector(".k-fill-exp"); if (e) e.hidden = !showing || x.inp.getAttribute("data-state") !== "wrong"; });
    } });
    function check() {
      var right = 0, firstWrong = -1;
      inputs.forEach(function (x) {
        var ok = cellSame(x.inp.value, x.exp);
        x.inp.setAttribute("data-state", ok ? "right" : "wrong");
        if (ok) right++; else if (firstWrong < 0 || x.r < firstWrong) firstWrong = x.r;
      });
      tbl.querySelectorAll("[data-row]").forEach(function (tr) { KOS.ui.state(tr, "first", +tr.getAttribute("data-row") === firstWrong); });
      out.innerHTML = "";
      var all = right === inputs.length;
      var lead = firstWrong >= 0 && rows[firstWrong] ? String(cols[0] || "").replace(/\$/g, "") + " = " + rows[firstWrong][0] : "";
      out.appendChild(verdict(all ? "good" : "warn", all ? "✓ Every cell right" : right + " of " + inputs.length + " cells",
        all ? null : "First mistake: row " + (firstWrong + 1) + (lead ? " (" + lead + ")" : "")));
      showBtn.hidden = all;
      if (showing) { showing = false; showBtn.click(); }
    }
    var acts = el("div", { class: "k-fill-acts" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "fill.clear", text: "Clear", onclick: function () {
        inputs.forEach(function (x) { x.inp.value = ""; x.inp.removeAttribute("data-state"); var e = x.inp.parentNode.querySelector(".k-fill-exp"); if (e) e.hidden = true; });
        out.innerHTML = ""; showBtn.hidden = true; showing = false; showBtn.textContent = "Show expected";
        tbl.querySelectorAll("[data-row]").forEach(function (tr) { KOS.ui.state(tr, "first", false); });
      } }),
      showBtn,
      el("span", { class: "k-fill-gap" }),
      el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "fill.check", text: "Check", onclick: check })
    ]);
    var body = spec.code ? el("div", { class: "k-fill-split" }, [code(spec.code, spec.lang), tbl]) : tbl;
    return shell(spec.code ? "trace" : "grid", [body, acts, out], spec.cap);
  }

  /* ---------------- SQL on the question's own database ---------------- */
  function tablesOf(setup) {
    var out = [], re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi, m;
    while ((m = re.exec(setup))) {
      var depth = 0, cur = "", parts = [];
      for (var i = 0; i < m[2].length; i++) {
        var ch = m[2][i];
        if (ch === "(") depth++; else if (ch === ")") depth--;
        if (ch === "," && !depth) { parts.push(cur); cur = ""; } else cur += ch;
      }
      parts.push(cur);
      var cols = parts.map(function (p) { return p.trim().split(/\s+/)[0].replace(/["`]/g, ""); })
        .filter(function (c) { return c && !/^(PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT)$/i.test(c); });
      out.push({ name: m[1], cols: cols });
    }
    return out;
  }
  function resultTable(set) {
    if (!set) return el("p", { class: "k-muted", text: "No result." });
    var t = el("table", { class: "k-n-table k-fill-res" }, [
      el("thead", {}, [el("tr", {}, set.columns.map(function (c) { return el("th", { text: c }); }))]),
      el("tbody", {}, set.rows.slice(0, 50).map(function (r) {
        return el("tr", {}, r.map(function (c) { return el("td", { class: "k-mono", text: c == null ? "NULL" : String(c) }); }));
      }))
    ]);
    return el("div", { class: "k-n-tablewrap k-fill-reswrap" }, [t]);
  }
  function lastSet(r) { return r && r.sets && r.sets.length ? r.sets[r.sets.length - 1] : null; }
  function sql(spec) {
    var R = KOS.codeRun;
    var ta = el("textarea", { class: "k-input k-mono k-fill-sqlin", "data-ui": "fill.sql-input", rows: "5", spellcheck: "false",
      "aria-label": "Your SQL", placeholder: "SELECT …" });
    ta.value = spec.starter || "";
    var mine = el("div", { class: "k-fill-rescol" }, [el("span", { class: "k-kicker", text: "Your result" }), el("p", { class: "k-muted", text: "Run your query to see its rows." })]);
    var want = el("div", { class: "k-fill-rescol" }, [el("span", { class: "k-kicker", text: "Expected" })]);
    var out = el("div", { class: "k-fill-out", "aria-live": "polite" });
    var data = el("div", { class: "k-fill-data", hidden: "" });
    var expected = null;
    function expect() {
      if (expected) return expected;
      expected = R.run({ lang: "sql", src: spec.answer, seed: spec.setup });
      return expected;
    }
    var run = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "fill.run", text: "▶ Run", onclick: function () {
      if (!R) return;
      run.disabled = true;
      Promise.all([R.run({ lang: "sql", src: ta.value, seed: spec.setup }), expect()]).then(function (rs) {
        run.disabled = false;
        var got = rs[0], exp = lastSet(rs[1]);
        mine.innerHTML = ""; mine.appendChild(el("span", { class: "k-kicker", text: "Your result" }));
        want.innerHTML = ""; want.appendChild(el("span", { class: "k-kicker", text: "Expected" })); want.appendChild(resultTable(exp));
        out.innerHTML = "";
        if (!got.ok) {
          mine.appendChild(el("p", { class: "k-fill-err k-mono", text: (got.error && got.error.msg) || "The query did not run." }));
          out.appendChild(verdict("warn", "Not yet", "the query stopped with an error"));
          return;
        }
        var set = lastSet(got);
        if (set && !set.rows.length) mine.appendChild(el("div", { class: "k-fill-empty" }, [el("b", { text: "0 rows" }),
          el("span", { text: "Nothing matched: check the WHERE condition's values and types against the data." })]));
        else mine.appendChild(resultTable(set));
        var same = sameRows(set, exp, spec.ordered);
        out.appendChild(verdict(same ? "good" : "warn", same ? "✓ Same rows" : "Not yet",
          same ? (spec.ordered ? "in order · " : "order ignored · ") + exp.rows.length + " of " + exp.rows.length
            : exp ? exp.rows.length + (exp.rows.length === 1 ? " row" : " rows") + " expected" + (set ? ", " + set.rows.length + " returned" : "") : null));
      });
    } });
    var tabs = tablesOf(spec.setup || "");
    var dataBtn = el("button", { type: "button", class: "k-link", "data-ui": "fill.data", text: "Show the data", onclick: function () {
      data.hidden = !data.hidden;
      dataBtn.textContent = data.hidden ? "Show the data" : "Hide the data";
      if (data.hidden || data.childNodes.length || !R) return;
      R.run({ lang: "sql", src: tabs.map(function (t) { return "SELECT * FROM " + t.name + ";"; }).join("\n"), seed: spec.setup }).then(function (r) {
        (r.sets || []).forEach(function (s, i) { data.appendChild(el("div", { class: "k-fill-rescol" }, [el("span", { class: "k-kicker", text: tabs[i] ? tabs[i].name : "" }), resultTable(s)])); });
      });
    } });
    var schema = el("div", { class: "k-fill-schema" }, tabs.map(function (t) {
      return el("span", { class: "k-fill-tblchip" }, [el("b", { text: t.name }), el("span", { class: "k-mono", text: t.cols.join(", ") })]);
    }).concat([dataBtn]));
    var editor = el("div", { class: "k-fill-editor" }, [el("div", { class: "k-fill-edhead" }, [el("span", { class: "k-kicker", text: "Your answer · SQL" }), run]), ta]);
    return shell("sql", [schema, data, editor, el("div", { class: "k-fill-res" }, [mine, want]), out], spec.cap);
  }

  /* ---------------- logic gates ---------------- */
  var NS = "http://www.w3.org/2000/svg";
  function sv(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { if (attrs[k] != null) n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { if (k) n.appendChild(typeof k === "string" ? document.createTextNode(k) : k); });
    return n;
  }
  function gateShape(type, x, y) {
    var g = [], bubble = type === "NAND" || type === "NOR" || type === "NOT" || type === "XNOR";
    var L = x - 28, R = x + 22;
    if (type === "AND" || type === "NAND") g.push(sv("path", { d: "M" + L + " " + (y - 22) + " H" + x + " A22 22 0 0 1 " + x + " " + (y + 22) + " H" + L + " Z" }));
    else if (type === "NOT") g.push(sv("path", { d: "M" + (L + 4) + " " + (y - 18) + " L" + (R - 4) + " " + y + " L" + (L + 4) + " " + (y + 18) + " Z" }));
    else if (type === "OR" || type === "NOR" || type === "XOR" || type === "XNOR") {
      g.push(sv("path", { d: "M" + L + " " + (y - 22) + " Q" + (x + 2) + " " + (y - 22) + " " + R + " " + y + " Q" + (x + 2) + " " + (y + 22) + " " + L + " " + (y + 22) + " Q" + (L + 12) + " " + y + " " + L + " " + (y - 22) + " Z" }));
      if (type === "XOR" || type === "XNOR") g.push(sv("path", { d: "M" + (L - 7) + " " + (y - 22) + " Q" + (L + 5) + " " + y + " " + (L - 7) + " " + (y + 22), fill: "none" }));
    } else g.push(sv("rect", { x: L, y: y - 22, width: 50, height: 44, rx: 10, "data-hidden": "" }));
    if (bubble) g.push(sv("circle", { cx: R + 4, cy: y, r: 4 }));
    return { nodes: g, out: R + (bubble ? 8 : 0), inX: L };
  }
  function gates(spec) {
    var lay = circuit(spec), rows = truth(spec), byId = {};
    spec.gates.forEach(function (g) { byId[g.id] = g; });
    var cur = {}, tried = {}, pick = null;
    spec.inputs.forEach(function (n) { cur[n] = 0; });
    var svg = sv("svg", { viewBox: "0 0 " + lay.w + " " + lay.h, class: "k-fill-svg", role: "img",
      "aria-label": "A logic circuit with inputs " + spec.inputs.join(", ") + " and output " + (spec.outName || "Q") });
    var tbody = el("div", { class: "k-fill-grid k-fill-tt", role: "table", "aria-label": "Truth table" });
    var wantCol = spec.fill ? null : "Q wanted";
    var head = spec.inputs.concat([spec.outName || "Q"]).concat(spec.fill ? [] : ["Q now"]);
    tbody.style.setProperty("--fill-cols", String(head.length));
    var fillIns = [];
    function types() { var t = {}; if (spec.pick) t[spec.pick] = pick || "?"; return t; }
    function paint() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var vals = gateEval(spec, cur, spec.pick ? types() : null);
      var outX = {};
      spec.inputs.forEach(function (n) { outX[n] = lay.pos[n].x + 18; });
      var shapes = {};
      spec.gates.forEach(function (g) { var t = spec.pick === g.id ? (pick || "?") : g.type; shapes[g.id] = gateShape(t, lay.pos[g.id].x, lay.pos[g.id].y); outX[g.id] = shapes[g.id].out; });
      /* wires first, so the gates sit over them */
      spec.gates.forEach(function (g) {
        var p = lay.pos[g.id], k = g.in.length;
        g.in.forEach(function (src, j) {
          var py = k === 1 ? p.y : p.y - 11 + j * (22 / Math.max(1, k - 1));
          var sx = outX[src], sy = lay.pos[src].y, mx = (sx + shapes[g.id].inX) / 2 + (j - (k - 1) / 2) * 6;
          svg.appendChild(sv("path", { class: "k-fill-wire", "data-on": vals[src] ? "" : null,
            d: "M" + sx + " " + sy + " H" + mx + " V" + py + " H" + shapes[g.id].inX }));
        });
      });
      spec.inputs.forEach(function (n) {
        var p = lay.pos[n];
        svg.appendChild(sv("text", { x: p.x - 30, y: p.y + 5, class: "k-fill-svgt" }, [n]));
        svg.appendChild(sv("circle", { cx: p.x + 6, cy: p.y, r: 8, class: "k-fill-pin", "data-on": vals[n] ? "" : null }));
        svg.appendChild(sv("text", { x: p.x + 6, y: p.y - 13, class: "k-fill-svgv", "text-anchor": "middle" }, [String(vals[n])]));
      });
      spec.gates.forEach(function (g) {
        var hid = spec.pick === g.id;
        var grp = sv("g", { class: "k-fill-gate", "data-hidden": hid ? "" : null }, shapes[g.id].nodes);
        svg.appendChild(grp);
        svg.appendChild(sv("text", { x: lay.pos[g.id].x - 4, y: lay.pos[g.id].y + 4, class: "k-fill-svgt k-fill-svgsm", "text-anchor": "middle" }, [hid ? (pick || "?") : g.type]));
      });
      var o = lay.pos[spec.out], ox = outX[spec.out];
      svg.appendChild(sv("path", { class: "k-fill-wire", "data-on": vals[spec.out] ? "" : null, d: "M" + ox + " " + o.y + " H" + (ox + 34) }));
      svg.appendChild(sv("circle", { cx: ox + 48, cy: o.y, r: 13, class: "k-fill-pin k-fill-pin--out", "data-on": vals[spec.out] && !(spec.pick && !pick) ? "" : null }));
      svg.appendChild(sv("text", { x: ox + 48, y: o.y + 5, class: "k-fill-svgt k-fill-svgsm", "text-anchor": "middle" }, [spec.outName || "Q"]));
      /* the table */
      var key = spec.inputs.map(function (n) { return cur[n]; }).join("");
      tried[key] = true;
      tbody.querySelectorAll("[data-row]").forEach(function (tr) {
        var r = rows[+tr.getAttribute("data-row")], k2 = spec.inputs.map(function (n) { return r.ins[n]; }).join("");
        KOS.ui.state(tr, "now", k2 === key);
        var nowCell = tr.querySelector("[data-now]");
        if (nowCell) nowCell.textContent = tried[k2] && (!spec.pick || pick) ? String(gateEval(spec, r.ins, spec.pick ? types() : null)[spec.out]) : tried[k2] ? "?" : "";
      });
      triedN.textContent = Object.keys(tried).length + " of " + rows.length + " rows tried";
    }
    tbody.appendChild(el("div", { class: "k-fill-tr k-fill-th", role: "row" }, head.map(function (h) { return el("span", { role: "columnheader", text: h }); })));
    rows.forEach(function (r, i) {
      var cells = spec.inputs.map(function (n) { return el("span", { class: "k-fill-cell k-mono", role: "cell", text: String(r.ins[n]) }); });
      if (spec.fill) {
        var inp = el("input", { class: "k-fill-cell k-fill-in k-mono", type: "text", inputmode: "numeric", maxlength: "1", "aria-label": "Row " + (i + 1) + ", " + (spec.outName || "Q") });
        fillIns.push({ inp: inp, exp: r.want });
        cells.push(el("span", { class: "k-fill-cellwrap", role: "cell" }, [inp]));
      } else {
        cells.push(el("span", { class: "k-fill-cell k-mono", role: "cell", text: String(r.want) }));
        cells.push(el("span", { class: "k-fill-cell k-mono", role: "cell", "data-now": "" }));
      }
      tbody.appendChild(el("div", { class: "k-fill-tr", role: "row", "data-row": String(i) }, cells));
    });
    var switches = el("div", { class: "k-fill-switches", role: "group", "aria-label": "Inputs" }, spec.inputs.map(function (n) {
      var b = el("button", { type: "button", class: "k-btn k-btn--sm k-fill-switch", "aria-pressed": "false", "data-ui": "fill.input", text: n + " = 0", onclick: function () {
        cur[n] = cur[n] ? 0 : 1; b.setAttribute("aria-pressed", cur[n] ? "true" : "false"); b.textContent = n + " = " + cur[n]; paint();
      } });
      return b;
    }));
    var picker = spec.pick ? el("div", { class: "k-fill-switches k-fill-pick", role: "radiogroup", "aria-label": "The missing gate" }, PICK.map(function (t) {
      var b = el("button", { type: "button", class: "k-btn k-btn--sm k-fill-gatebtn", role: "radio", "aria-checked": "false", "data-ui": "fill.gate", "data-gate": t, text: t, onclick: function () {
        pick = t;
        picker.querySelectorAll("[role=radio]").forEach(function (x) { x.setAttribute("aria-checked", x === b ? "true" : "false"); KOS.ui.state(x, "active", x === b); });
        out.innerHTML = ""; paint();
      } });
      return b;
    })) : null;
    var out = el("div", { class: "k-fill-out", "aria-live": "polite" });
    var triedN = el("span", { class: "k-muted k-fill-small" });
    function check() {
      out.innerHTML = "";
      if (spec.fill) {
        var right = 0, first = -1;
        fillIns.forEach(function (x, i) { var ok = cellSame(x.inp.value, x.exp); x.inp.setAttribute("data-state", ok ? "right" : "wrong"); if (ok) right++; else if (first < 0) first = i; });
        out.appendChild(verdict(right === fillIns.length ? "good" : "warn", right === fillIns.length ? "✓ Every row right" : right + " of " + fillIns.length + " rows",
          first >= 0 ? "First mistake: " + spec.inputs.map(function (n) { return n + " = " + rows[first].ins[n]; }).join(", ") : null));
        return;
      }
      if (!pick) { out.appendChild(verdict("warn", "Pick a gate first", null)); return; }
      var bad = rows.filter(function (r) { return gateEval(spec, r.ins, types())[spec.out] !== r.want; })[0];
      out.appendChild(bad ? verdict("warn", "Not this one", spec.inputs.map(function (n) { return n + " = " + bad.ins[n]; }).join(", ") + " gives " + (bad.want ? 0 : 1) + ", wanted " + bad.want)
        : verdict("good", "✓ Matches every row", pick));
    }
    paint();
    var acts = el("div", { class: "k-fill-acts" }, [triedN, el("span", { class: "k-fill-gap" }),
      el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "fill.check", text: "Check", onclick: check })]);
    var box = el("div", { class: "k-fill-gatebox" }, [el("div", { class: "k-fill-svgwrap" }, [svg]), switches, picker].filter(Boolean));
    return shell("gates", [el("div", { class: "k-fill-split", "data-kind": "gates" }, [box, tbody]), acts, out], spec.cap);
  }

  /* ---------------- predict, then Run ---------------- */
  function predict(spec) {
    var R = KOS.codeRun;
    var ta = el("textarea", { class: "k-input k-mono k-fill-predict", "data-ui": "fill.predict-input", rows: "3", spellcheck: "false",
      "aria-label": "What it prints", placeholder: "What does it print?" });
    var outBox = el("pre", { class: "k-fill-stdout k-mono" }, [el("span", { class: "k-muted", text: "Run after you answer" })]);
    var out = el("div", { class: "k-fill-out", "aria-live": "polite" });
    var run = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "fill.run", disabled: "", text: "▶ Run", onclick: function () {
      if (!R) return;
      run.disabled = true;
      R.run({ files: [{ name: "Program.cs", src: spec.code }], stdin: spec.stdin || "" }).then(function (r) {
        run.disabled = !ta.value.trim();
        outBox.textContent = r.ok ? (r.stdout || "(nothing printed)") : ((r.error && r.error.msg) || "It did not run.");
        out.innerHTML = "";
        var real = spec.expect != null ? spec.expect : r.stdout;
        var same = R.norm(ta.value) === R.norm(real);
        out.appendChild(verdict(same ? "good" : "warn", same ? "✓ Right" : "Not quite", same ? "trailing spaces ignored" : "compare it line by line with the output"));
      });
    } });
    ta.addEventListener("input", function () { run.disabled = !ta.value.trim(); });
    return shell("predict", [code(spec.code, spec.lang || "csharp"),
      el("div", { class: "k-fill-res" }, [
        el("div", { class: "k-fill-rescol" }, [el("span", { class: "k-kicker", text: "Your answer" }), ta]),
        el("div", { class: "k-fill-rescol" }, [el("span", { class: "k-kicker", text: "Output" }), outBox])]),
      el("div", { class: "k-fill-acts" }, [el("span", { class: "k-fill-gap" }), run]), out], spec.cap);
  }

  /* ---------------- a lab in the notes ---------------- */
  function lab(id) {
    var host = el("div", { class: "k-fill-lab", "data-ui": "fill.lab", "data-sim": id });
    var sim = KOS.sims && KOS.sims.get(id);
    if (!sim) { host.appendChild(el("p", { class: "k-muted", text: "This lab is not available here." })); return host; }
    var start = function () { if (host.getAttribute("data-mounted") != null) return; host.setAttribute("data-mounted", ""); try { KOS.sims.embed(host, sim); } catch (e) { host.appendChild(el("p", { class: "k-muted", text: "The lab could not start here; open it from Labs." })); } };
    if (typeof IntersectionObserver === "function") {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); } });
      io.observe(host);
    } else setTimeout(start, 0);
    return host;
  }

  var MAKE = { grid: grid, trace: grid, sql: sql, gates: gates, predict: predict, lab: lab };
  function mount(root) {
    if (!root || !root.querySelectorAll) return;
    [].forEach.call(root.querySelectorAll("[data-ui~='content.fill']:not([data-mounted])"), function (ph) {
      ph.setAttribute("data-mounted", "");
      var kind = ph.getAttribute("data-kind"), spec;
      try { spec = JSON.parse(ph.getAttribute("data-spec") || "null"); } catch (e) { spec = null; }
      if (!MAKE[kind] || spec == null) return;
      try { ph.appendChild(MAKE[kind](spec)); }
      catch (e) { ph.appendChild(el("p", { class: "k-muted", text: "This part could not be drawn." })); }
    });
  }

  KOS.fillIns = { KINDS: Object.keys(MAKE), mount: mount, cellSame: cellSame, sameRows: sameRows, gateEval: gateEval,
    truth: truth, circuit: circuit, tablesOf: tablesOf };
})();
