/* Kurenai OS — core/figures.js
   Declarative study diagrams. A content block

     { fig: { x:[-1,7], y:[-1.5,1.5], axes:{pi:true},
              items:[ {fn:"sin(x)", label:"y = sin x"} ], cap:"…" } }

   becomes an inline SVG that takes every colour from the theme tokens, so
   the same figure is right on Atelier Dawn and Dusk. Notes, worked-example
   steps and exam questions all use it (content.js renders the block; a
   worked step may carry `fig` beside its working).

   Coordinates are DATA coordinates when `x`/`y` ranges are given (a graph)
   and raw pixels otherwise (a free diagram: triangle, circle, forces).

   Items — every one takes c (colour token: accent | accent2 | accent3 |
   good | danger | muted | text, or a hex), w (stroke width), dash:
     {fn:"expr in x", from, to, label, at, n}        curve y = f(x)
     {param:{x:"expr in t", y:"expr in t"}, t:[a,b]} parametric curve
     {shade:{fn, fn2?, from, to}, alpha}             area between curve(s)/axis
     {line:[[x1,y1],[x2,y2]], arrow:true|"both", label, lpos, loff}
     {poly:[[x,y],…], fill, alpha, close}
     {circle:[cx,cy,r], fill}                        r in x-units
     {arc:[cx,cy,rPx,deg1,deg2], label, fill}        angle mark (px radius)
     {rangle:[corner,[x,y],[x,y]]}                   right-angle mark
     {pt:[x,y], label, pos, r, open}                 point with label
     {text:[x,y], t, pos, size, i, b}                free text
     {vline:x} {hline:y}                             dashed guide/asymptote
     {ticks:[[x1,y1],[x2,y2]], n}                    equal-length marks on a side
   Expressions are a tiny whitelisted language (sin cos tan sec cosec cot
   exp ln log sqrt abs pi e, + - * / ^ and brackets) — nothing else runs. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };
  var SCOPE = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    sec: function (v) { return 1 / Math.cos(v); }, cosec: function (v) { return 1 / Math.sin(v); }, cot: function (v) { return 1 / Math.tan(v); },
    sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
    exp: Math.exp, ln: Math.log, log: Math.log10, sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor, ceil: Math.ceil,
    pi: Math.PI, e: Math.E, pow: Math.pow, max: Math.max, min: Math.min, sign: Math.sign
  };
  var cache = {};
  /* compile "2*sin(x)^2" into a function of the named variables; any
     identifier outside SCOPE/vars refuses the whole expression */
  function compile(expr, vars) {
    var key = vars.join(",") + "|" + expr;
    if (cache[key] !== undefined) return cache[key];
    var ok = true;
    var js = String(expr).replace(/[A-Za-z_][A-Za-z_0-9]*/g, function (id) {
      if (vars.indexOf(id) >= 0) return id;
      if (Object.prototype.hasOwnProperty.call(SCOPE, id)) return "M." + id;
      ok = false; return id;
    }).replace(/\^/g, "**");
    /* a unary minus directly before an exponent (`-(x-2)^2`, `-x^2`) is a
       JavaScript syntax error; rewrite every unary minus as (0-1)* — the
       mathematical reading, since ^ binds tighter than the sign */
    js = js.replace(/(^|[(,+\-*\/]\s*)-\s*/g, "$1(0-1)*");
    if (!ok || /[^0-9A-Za-z_.+\-*/()\s,]/.test(js)) return (cache[key] = null);
    var f = null;
    try {
      var fn = new Function("M", vars.join(","), "return (" + js + ");");
      f = function () { return fn.apply(null, [SCOPE].concat([].slice.call(arguments))); };
      f(0, 0);
    } catch (e) { f = null; }
    return (cache[key] = f);
  }

  var TOKENS = { accent: 1, accent2: 1, accent3: 1, good: 1, danger: 1, muted: 1, text: 1, text2: 1, line: 1, warning: 1 };
  function col(c, dflt) {
    if (!c) c = dflt || "accent";
    if (TOKENS[c]) return "var(--" + c + ")";
    if (c === "cs" || c === "maths" || c === "it") return "var(--c-" + c + ")";
    return c;
  }
  function num(v, d) { return (typeof v === "number" && isFinite(v)) ? v : d; }
  function fmt(v) { return Math.round(v * 100) / 100; }

  /* a nice tick step for a range spanning `span` with ~n ticks */
  function niceStep(span, n) {
    var raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / p;
    var s = r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10;
    return s * p;
  }
  var PI_LABELS = { 0: "0", 1: "π/2", 2: "π", 3: "3π/2", 4: "2π", 5: "5π/2", 6: "3π", 7: "7π/2", 8: "4π", "-1": "−π/2", "-2": "−π", "-3": "−3π/2", "-4": "−2π" };
  function piLabel(v) {
    var k = Math.round(v / (Math.PI / 2));
    if (Math.abs(k * Math.PI / 2 - v) > 1e-6) return fmt(v);
    return PI_LABELS[k] !== undefined ? PI_LABELS[k] : (k % 2 ? k + "π/2" : (k / 2) + "π");
  }
  function tickLabel(v, pi) {
    if (pi) return piLabel(v);
    var s = fmt(v).toString();
    return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
  }

  function render(spec) {
    if (!spec || typeof spec !== "object") return "";
    var W = num(spec.w, spec.x ? 520 : 360), H = num(spec.h, spec.x ? 320 : 240);
    var graph = !!(spec.x && spec.y);
    var axes = spec.axes === undefined ? graph : spec.axes;
    if (axes === true) axes = {};
    var padN = axes ? 34 : 8;
    var pad = typeof spec.pad === "number" ? { l: spec.pad, r: spec.pad, t: spec.pad, b: spec.pad }
      : Object.assign({ l: padN, r: axes ? 22 : 8, t: axes ? 18 : 8, b: padN }, spec.pad || {});
    var pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;

    /* data → pixel mapping (identity for a free diagram) */
    var x0, x1, y0, y1;
    if (graph) {
      x0 = spec.x[0]; x1 = spec.x[1]; y0 = spec.y[0]; y1 = spec.y[1];
      if (spec.aspect === "equal") {
        var sx = pw / (x1 - x0), sy = ph / (y1 - y0);
        if (sx > sy) { var cx = (x0 + x1) / 2, hx = pw / sy / 2; x0 = cx - hx; x1 = cx + hx; }
        else if (sy > sx) { var cy = (y0 + y1) / 2, hy = ph / sx / 2; y0 = cy - hy; y1 = cy + hy; }
      }
    }
    var X = graph ? function (v) { return pad.l + (v - x0) / (x1 - x0) * pw; } : function (v) { return v; };
    var Y = graph ? function (v) { return pad.t + (y1 - v) / (y1 - y0) * ph; } : function (v) { return v; };
    var SX = graph ? pw / (x1 - x0) : 1, SY = graph ? ph / (y1 - y0) : 1;
    var P = function (p) { return X(p[0]).toFixed(2) + "," + Y(p[1]).toFixed(2); };

    var id = "fg" + Math.random().toString(36).slice(2, 8);
    var out = [], defs = [];
    var font = 'font-family:var(--sans);font-size:12.5px;fill:var(--text2)';
    function text(px, py, t, o) {
      o = o || {};
      var pos = o.pos || "n", dx = 0, dy = 0, anchor = "middle", base = "middle";
      var off = num(o.off, 9);
      if (pos.indexOf("n") >= 0) { dy -= off; base = "auto"; }
      if (pos.indexOf("s") >= 0) { dy += off; base = "hanging"; }
      if (pos.indexOf("e") >= 0) { dx += off; anchor = "start"; }
      if (pos.indexOf("w") >= 0) { dx -= off; anchor = "end"; }
      if (pos === "c") { dx = 0; dy = 0; }
      var style = font + ";font-size:" + num(o.size, 12.5) + "px" + (o.i ? ";font-style:italic" : "") + (o.b ? ";font-weight:600" : "") +
        (o.c ? ";fill:" + col(o.c) : "");
      var halo = o.halo === false ? "" : ';paint-order:stroke;stroke:var(--surface-card, var(--bg1));stroke-width:3px;stroke-linejoin:round';
      return '<text x="' + (px + dx + num(o.dx, 0)).toFixed(1) + '" y="' + (py + dy + num(o.dy, 0)).toFixed(1) + '" text-anchor="' + anchor +
        '" dominant-baseline="' + base + '" style="' + style + halo + '">' + esc(t) + "</text>";
    }
    function arrowHead(ax, ay, bx, by, c, w) {
      var ang = Math.atan2(by - ay, bx - ax), L = 7 + 2 * (w || 1.6), A = 0.42;
      var p1 = [bx - L * Math.cos(ang - A), by - L * Math.sin(ang - A)], p2 = [bx - L * Math.cos(ang + A), by - L * Math.sin(ang + A)];
      return '<polygon points="' + bx.toFixed(1) + "," + by.toFixed(1) + " " + p1[0].toFixed(1) + "," + p1[1].toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1) +
        '" style="fill:' + c + '"/>';
    }
    function strokeStyle(it, dflt, dw) {
      return "stroke:" + col(it.c, dflt) + ";stroke-width:" + num(it.w, dw) + ";fill:none;stroke-linecap:round;stroke-linejoin:round" +
        (it.dash ? ";stroke-dasharray:" + (it.dash === true ? "5 5" : it.dash) : "");
    }
    /* sample a curve into path segments, breaking at asymptotes and NaNs */
    function curvePath(f, a, b, n, isParam) {
      var segs = [], cur = [], prev = null, span = graph ? (y1 - y0) : H;
      var lo = graph ? y0 - span : -H, hi = graph ? y1 + span : 2 * H;
      for (var i = 0; i <= n; i++) {
        var t = a + (b - a) * i / n, px, py;
        try { var r = f(t); px = isParam ? r[0] : t; py = isParam ? r[1] : r; } catch (e) { py = NaN; }
        var bad = !isFinite(px) || !isFinite(py) || py < lo || py > hi;
        var jump = prev && !bad && Math.abs(py - prev[1]) > span * 1.5;
        if (bad || jump) { if (cur.length > 1) segs.push(cur); cur = bad ? [] : [[px, py]]; prev = bad ? null : [px, py]; continue; }
        cur.push([px, py]); prev = [px, py];
      }
      if (cur.length > 1) segs.push(cur);
      return segs.map(function (s) { return "M" + s.map(P).join("L"); }).join(" ");
    }

    /* ---- axes ---- */
    if (axes && graph) {
      var axC = "var(--line)", axInk = "var(--muted)";
      var xs = axes.xt, ys = axes.yt, pi = !!axes.pi;
      if (!xs) { var st = pi ? Math.PI / 2 : niceStep(x1 - x0, 7); xs = []; for (var v = Math.ceil(x0 / st) * st; v <= x1 + 1e-9; v += st) xs.push(v); }
      if (!ys) { var st2 = niceStep(y1 - y0, 5); ys = []; for (var v2 = Math.ceil(y0 / st2) * st2; v2 <= y1 + 1e-9; v2 += st2) ys.push(v2); }
      var ax = Math.min(Math.max(0, x0), x1), ay = Math.min(Math.max(0, y0), y1);
      var axPx = X(ax), ayPx = Y(ay);
      if (axes.grid !== false) {
        xs.forEach(function (v) { var vv = typeof v === "object" ? v.v : v; if (Math.abs(vv - ax) < 1e-9) return; out.push('<line x1="' + X(vv).toFixed(1) + '" y1="' + pad.t + '" x2="' + X(vv).toFixed(1) + '" y2="' + (pad.t + ph) + '" style="stroke:var(--line2);stroke-width:1"/>'); });
        ys.forEach(function (v) { var vv = typeof v === "object" ? v.v : v; if (Math.abs(vv - ay) < 1e-9) return; out.push('<line x1="' + pad.l + '" y1="' + Y(vv).toFixed(1) + '" x2="' + (pad.l + pw) + '" y2="' + Y(vv).toFixed(1) + '" style="stroke:var(--line2);stroke-width:1"/>'); });
      }
      out.push('<line x1="' + pad.l + '" y1="' + ayPx.toFixed(1) + '" x2="' + (pad.l + pw + 8) + '" y2="' + ayPx.toFixed(1) + '" style="stroke:' + axC + ';stroke-width:1.4"/>');
      out.push(arrowHead(pad.l, ayPx, pad.l + pw + 8, ayPx, axC, 1));
      out.push('<line x1="' + axPx.toFixed(1) + '" y1="' + (pad.t + ph) + '" x2="' + axPx.toFixed(1) + '" y2="' + (pad.t - 8) + '" style="stroke:' + axC + ';stroke-width:1.4"/>');
      out.push(arrowHead(axPx, pad.t + ph, axPx, pad.t - 8, axC, 1));
      xs.forEach(function (v) {
        var vv = typeof v === "object" ? v.v : v, lab = typeof v === "object" ? v.label : tickLabel(vv, pi);
        if (Math.abs(vv - ax) < 1e-9 && Math.abs(ay) < 1e-9) return;
        out.push('<line x1="' + X(vv).toFixed(1) + '" y1="' + (ayPx - 3).toFixed(1) + '" x2="' + X(vv).toFixed(1) + '" y2="' + (ayPx + 3).toFixed(1) + '" style="stroke:' + axC + ';stroke-width:1.2"/>');
        out.push(text(X(vv), ayPx + 4, lab, { pos: "s", size: 11, c: "muted", halo: false }));
      });
      ys.forEach(function (v) {
        var vv = typeof v === "object" ? v.v : v, lab = typeof v === "object" ? v.label : tickLabel(vv, false);
        if (Math.abs(vv - ay) < 1e-9) return;
        out.push('<line x1="' + (axPx - 3).toFixed(1) + '" y1="' + Y(vv).toFixed(1) + '" x2="' + (axPx + 3).toFixed(1) + '" y2="' + Y(vv).toFixed(1) + '" style="stroke:' + axC + ';stroke-width:1.2"/>');
        out.push(text(axPx - 5, Y(vv), lab, { pos: "w", size: 11, c: "muted", halo: false, off: 4 }));
      });
      if (Math.abs(ax) < 1e-9 && Math.abs(ay) < 1e-9) out.push(text(axPx - 4, ayPx + 4, "O", { pos: "sw", size: 11, c: "muted", halo: false, off: 3 }));
      out.push(text(pad.l + pw + 8, ayPx - 6, axes.x === undefined ? "x" : axes.x, { pos: "n", size: 12.5, i: true, c: "text2", off: 4 }));
      out.push(text(axPx + 8, pad.t - 6, axes.y === undefined ? "y" : axes.y, { pos: "e", size: 12.5, i: true, c: "text2", off: 2 }));
      defs.push('<clipPath id="' + id + 'c"><rect x="' + pad.l + '" y="' + pad.t + '" width="' + pw + '" height="' + ph + '"/></clipPath>');
    }

    /* ---- items ---- */
    var clipped = [], free = [];
    (spec.items || []).forEach(function (it) {
      if (!it || typeof it !== "object") return;
      var s = "";
      if (it.fn != null || it.param) {
        var isParam = !!it.param, f;
        if (isParam) {
          var fx = compile(it.param.x, ["t"]), fy = compile(it.param.y, ["t"]);
          if (!fx || !fy) return;
          f = function (t) { return [fx(t), fy(t)]; };
        } else { f = compile(it.fn, ["x"]); if (!f) return; }
        var a = isParam ? num(it.t && it.t[0], 0) : num(it.from, graph ? x0 : 0);
        var b = isParam ? num(it.t && it.t[1], 2 * Math.PI) : num(it.to, graph ? x1 : W);
        s += '<path d="' + curvePath(f, a, b, num(it.n, 240), isParam) + '" style="' + strokeStyle(it, "accent", 2.2) + '"/>';
        clipped.push(s);
        if (it.label) {
          var lx = isParam ? a : num(it.at, a + (b - a) * 0.8), lp;
          try { lp = isParam ? f(lx) : [lx, f(lx)]; } catch (e) { lp = null; }
          if (lp && isFinite(lp[1])) free.push(text(X(lp[0]), Y(lp[1]), it.label, { pos: it.pos || "ne", c: it.c || "accent", i: false, b: true, dx: it.dx, dy: it.dy }));
        }
        return;
      }
      if (it.shade) {
        var sh = it.shade, f1 = compile(sh.fn, ["x"]), f2 = sh.fn2 != null ? compile(sh.fn2, ["x"]) : null;
        if (!f1) return;
        var a2 = num(sh.from, x0), b2 = num(sh.to, x1), n2 = num(it.n, 120), top = [], bot = [];
        for (var i = 0; i <= n2; i++) { var t = a2 + (b2 - a2) * i / n2; top.push([t, f1(t)]); bot.push([t, f2 ? f2(t) : 0]); }
        var d = "M" + top.map(P).join("L") + "L" + bot.reverse().map(P).join("L") + "Z";
        clipped.push('<path d="' + d + '" style="fill:' + col(it.c, "accent") + ';fill-opacity:' + num(it.alpha, 0.18) + ';stroke:none"/>');
        return;
      }
      if (it.line || it.vec) {
        var ln = it.line || it.vec, p1 = ln[0], p2 = ln[1], c = col(it.c, it.vec ? "accent2" : "text2"), w = num(it.w, it.vec ? 2.2 : 1.6);
        var ax1 = X(p1[0]), ay1 = Y(p1[1]), bx1 = X(p2[0]), by1 = Y(p2[1]);
        s += '<line x1="' + ax1.toFixed(1) + '" y1="' + ay1.toFixed(1) + '" x2="' + bx1.toFixed(1) + '" y2="' + by1.toFixed(1) + '" style="' + strokeStyle(it, it.vec ? "accent2" : "text2", w) + '"/>';
        if (it.arrow || it.vec) s += arrowHead(ax1, ay1, bx1, by1, c, w);
        if (it.arrow === "both") s += arrowHead(bx1, by1, ax1, ay1, c, w);
        if (it.label) {
          var lp2 = num(it.lpos, 0.5), mx = ax1 + (bx1 - ax1) * lp2, my = ay1 + (by1 - ay1) * lp2;
          var nx = -(by1 - ay1), ny = (bx1 - ax1), nl = Math.hypot(nx, ny) || 1, offv = num(it.loff, 10);
          s += text(mx + nx / nl * offv, my + ny / nl * offv, it.label, { pos: "c", c: it.lc || it.c || (it.vec ? "accent2" : "text2"), i: it.i !== false, b: !!it.vec, size: it.size });
        }
        free.push(s); return;
      }
      if (it.poly) {
        var d2 = "M" + it.poly.map(P).join("L") + (it.close === false ? "" : "Z");
        free.push('<path d="' + d2 + '" style="' + (it.fill ? "fill:" + col(it.fill) + ";fill-opacity:" + num(it.alpha, 0.16) + ";" : "fill:none;") +
          "stroke:" + col(it.c, "text2") + ";stroke-width:" + num(it.w, 1.8) + ";stroke-linejoin:round" + (it.dash ? ";stroke-dasharray:" + (it.dash === true ? "5 5" : it.dash) : "") + '"/>');
        return;
      }
      if (it.circle) {
        var cc = it.circle, rx = cc[2] * SX, ry = cc[2] * SY;
        free.push('<ellipse cx="' + X(cc[0]).toFixed(1) + '" cy="' + Y(cc[1]).toFixed(1) + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" style="' +
          (it.fill ? "fill:" + col(it.fill) + ";fill-opacity:" + num(it.alpha, 0.14) + ";" : "fill:none;") + "stroke:" + col(it.c, "text2") + ";stroke-width:" + num(it.w, 1.8) + (it.dash ? ";stroke-dasharray:" + (it.dash === true ? "5 5" : it.dash) : "") + '"/>');
        return;
      }
      if (it.arc) {
        var ar = it.arc, acx = X(ar[0]), acy = Y(ar[1]), r = ar[2], a1 = ar[3] * Math.PI / 180, a2r = ar[4] * Math.PI / 180;
        if (a2r < a1) a2r += 2 * Math.PI;
        var sxp = acx + r * Math.cos(a1), syp = acy - r * Math.sin(a1), exp = acx + r * Math.cos(a2r), eyp = acy - r * Math.sin(a2r);
        var large = (a2r - a1) > Math.PI ? 1 : 0;
        var dArc = (it.fill ? "M" + acx.toFixed(1) + "," + acy.toFixed(1) + "L" : "M") + sxp.toFixed(1) + "," + syp.toFixed(1) + "A" + r + "," + r + " 0 " + large + " 0 " + exp.toFixed(1) + "," + eyp.toFixed(1) + (it.fill ? "Z" : "");
        free.push('<path d="' + dArc + '" style="' + (it.fill ? "fill:" + col(it.fill) + ";fill-opacity:" + num(it.alpha, 0.22) + ";" : "fill:none;") + "stroke:" + col(it.c, "accent2") + ";stroke-width:" + num(it.w, 1.5) + '"/>');
        if (it.label) { var am = (a1 + a2r) / 2, lr = r + num(it.loff, 11); free.push(text(acx + lr * Math.cos(am), acy - lr * Math.sin(am), it.label, { pos: "c", c: it.lc || it.c || "accent2", i: true, size: it.size })); }
        return;
      }
      if (it.rangle) {
        var ra = it.rangle, c0 = [X(ra[0][0]), Y(ra[0][1])], u = [X(ra[1][0]) - c0[0], Y(ra[1][1]) - c0[1]], v3 = [X(ra[2][0]) - c0[0], Y(ra[2][1]) - c0[1]];
        var ul = Math.hypot(u[0], u[1]) || 1, vl = Math.hypot(v3[0], v3[1]) || 1, sz = num(it.size, 10);
        u = [u[0] / ul * sz, u[1] / ul * sz]; v3 = [v3[0] / vl * sz, v3[1] / vl * sz];
        free.push('<path d="M' + (c0[0] + u[0]).toFixed(1) + "," + (c0[1] + u[1]).toFixed(1) + "L" + (c0[0] + u[0] + v3[0]).toFixed(1) + "," + (c0[1] + u[1] + v3[1]).toFixed(1) + "L" + (c0[0] + v3[0]).toFixed(1) + "," + (c0[1] + v3[1]).toFixed(1) + '" style="fill:none;stroke:' + col(it.c, "text2") + ';stroke-width:1.3"/>');
        return;
      }
      if (it.pt) {
        var pp = it.pt, pr = num(it.r, 3.6), pc = col(it.c, "accent2");
        s += '<circle cx="' + X(pp[0]).toFixed(1) + '" cy="' + Y(pp[1]).toFixed(1) + '" r="' + pr + '" style="' + (it.open ? "fill:var(--surface-card, var(--bg1));" : "fill:" + pc + ";") + "stroke:" + pc + ';stroke-width:1.8"/>';
        if (it.label) s += text(X(pp[0]), Y(pp[1]), it.label, { pos: it.pos || "ne", c: it.lc || it.c || "text", i: it.i !== false, b: it.b, size: it.size, dx: it.dx, dy: it.dy });
        free.push(s); return;
      }
      if (it.text) {
        free.push(text(X(it.text[0]), Y(it.text[1]), it.t, { pos: it.pos || "c", c: it.c || "text2", i: it.i, b: it.b, size: it.size, dx: it.dx, dy: it.dy, off: it.off }));
        return;
      }
      if (it.vline != null || it.hline != null) {
        var isV = it.vline != null, vv2 = isV ? X(it.vline) : Y(it.hline);
        var ln2 = isV ? '<line x1="' + vv2.toFixed(1) + '" y1="' + pad.t + '" x2="' + vv2.toFixed(1) + '" y2="' + (pad.t + ph) + '"'
          : '<line x1="' + pad.l + '" y1="' + vv2.toFixed(1) + '" x2="' + (pad.l + pw) + '" y2="' + vv2.toFixed(1) + '"';
        free.push(ln2 + ' style="stroke:' + col(it.c, "danger") + ";stroke-width:" + num(it.w, 1.3) + ";stroke-dasharray:" + (it.dash === false ? "none" : "4 4") + '"/>');
        if (it.label) free.push(isV ? text(vv2, pad.t + 4, it.label, { pos: "e", c: it.c || "danger", i: true, size: 11.5 }) : text(pad.l + pw - 4, vv2, it.label, { pos: "n", c: it.c || "danger", i: true, size: 11.5, dx: -10 }));
        return;
      }
      if (it.ticks) {
        var tk = it.ticks, tp1 = [X(tk[0][0]), Y(tk[0][1])], tp2 = [X(tk[1][0]), Y(tk[1][1])], cnt = num(it.n, 1);
        var dxT = tp2[0] - tp1[0], dyT = tp2[1] - tp1[1], lenT = Math.hypot(dxT, dyT) || 1, nxT = -dyT / lenT * 5, nyT = dxT / lenT * 5;
        for (var k = 0; k < cnt; k++) {
          var tt = 0.5 + (k - (cnt - 1) / 2) * 0.06, cxT = tp1[0] + dxT * tt, cyT = tp1[1] + dyT * tt;
          free.push('<line x1="' + (cxT - nxT).toFixed(1) + '" y1="' + (cyT - nyT).toFixed(1) + '" x2="' + (cxT + nxT).toFixed(1) + '" y2="' + (cyT + nyT).toFixed(1) + '" style="stroke:' + col(it.c, "text2") + ';stroke-width:1.4"/>');
        }
        return;
      }
    });

    var body = (defs.length ? "<defs>" + defs.join("") + "</defs>" : "") + out.join("") +
      (clipped.length ? '<g clip-path="url(#' + id + 'c)">' + clipped.join("") + "</g>" : "") + free.join("");
    var alt = spec.alt || spec.cap || "diagram";
    var svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(alt) + '" style="width:100%;max-width:' + W + 'px;height:auto;display:block;margin:0 auto;overflow:visible">' + body + "</svg>";
    return '<figure class="k-n-fig">' + svg + (spec.cap ? "<figcaption>" + (window.KOS.content ? KOS.content.inline(spec.cap) : esc(spec.cap)) + "</figcaption>" : "") + "</figure>";
  }

  KOS.figures = { render: render, compile: compile };
})();
