/* Kurenai OS — labs/sims.js
   Simulation registry + four interactive sims:
   logic-lab (Boolean), sort-viz (bubble/merge), fsm-lab, fn-transform.
   Trace-lab structures register here too so notes can deep-link them. */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var REG = [];
  /* sims wired straight onto spec refs — content files belong to Gemini,
     so the ref pages merge this map in at render time (KOS.sims.forRef) */
  var WIRE = {
    "compsci:4.1.1.16": ["recursion-viz"],
    "compsci:4.5.4.2": ["binary-number"],
    "compsci:4.5.4.4": ["binary-number"],
    "compsci:4.7.3.1": ["cpu-fetch-execute"],
    "maths:5.3": ["trig-circle"],
    "maths:8.3": ["integration-area"]
  };
  KOS.sims = {
    register: function (s) { REG.push(s); },
    get: function (id) { return REG.find(function (s) { return s.id === id; }); },
    all: function () { return REG.slice(); },
    forRef: function (sid, ref) {
      return (WIRE[sid + ":" + ref] || []).map(KOS.sims.get).filter(Boolean);
    },
    open: function (id) {
      var s = KOS.sims.get(id);
      if (!s) return;
      if (s.jump) { s.jump(); return; }
      KOS.show("sims", id);
    }
  };

  /* deep links into the trace lab */
  [["tl-stack","Stack push / pop / peek","stack","compsci","4.2.3.1"],
   ["tl-queue","Linear & circular queue","queue","compsci","4.2.2.1"],
   ["tl-list","Linked list traversal","list","compsci","4.2.1.4"],
   ["tl-tree","BST insert & traversals","tree","compsci","4.2.5.1"]
  ].forEach(function (t) {
    KOS.sims.register({ id: t[0], title: t[1], subject: t[3], ref: t[4],
      desc: "Animated canvas with pointer arithmetic and a live trace table.",
      jump: function () { KOS.store.state.trace.tab = t[2]; KOS.store.save(); KOS.show("trace"); } });
  });

  function dprCanvas(holder, h) {
    var c = el("canvas", { class: "labcanvas" });
    holder.appendChild(c);
    var dpr = window.devicePixelRatio || 1;
    var W = (holder.clientWidth || 880) - 2;
    c.width = W * dpr; c.height = h * dpr; c.style.height = h + "px";
    var ctx = c.getContext("2d");
    if (ctx && ctx.scale) ctx.scale(dpr, dpr);
    return { c: c, ctx: ctx, W: W, H: h };
  }
  var COL = { ink:"#120d1b", line:"#3a2d52", text:"#ece7f4", mute:"#a89dbf", faint:"#6f6488",
              crim:"#e8425a", gold:"#e2b23f", jade:"#45d6a8", blue:"#7b9ef8", vio:"#c77bf2" };

  /* =================== 1. LOGIC LAB =================== */
  KOS.sims.register({
    id: "logic-lab", title: "Boolean Logic Lab", subject: "compsci", ref: "4.6.2.1",
    desc: "Type any Boolean expression, flip the input switches, and watch the truth table highlight the live row.",
    mount: function (panel) {
      var exprIn = el("input", { type: "text", value: "A.B + ¬C", style: "width:260px",
        "aria-label": "Boolean expression" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["expression (use . + ¬ xor, or AND OR NOT)", exprIn]),
        el("button", { class: "btn primary", text: "Build", onclick: build }), msg
      ]));
      var switches = el("div", { class: "logic-switches" });
      var lamp = el("div", { class: "logic-lamp" });
      panel.appendChild(el("div", { class: "logic-live" }, [switches, lamp]));
      var tblWrap = el("div", {});
      panel.appendChild(tblWrap);

      /* parser: tokens -> recursive descent. Accepts: A-Z vars, NOT/¬/!, AND/./&,
         OR/+/|, XOR/^, NAND, NOR, parentheses. */
      function tokenize(s) {
        s = s.toUpperCase()
          .replace(/¬|!/g, " NOT ").replace(/\./g, " AND ").replace(/&+/g, " AND ")
          .replace(/\+/g, " OR ").replace(/\|+/g, " OR ").replace(/\^/g, " XOR ")
          .replace(/\(/g, " ( ").replace(/\)/g, " ) ");
        return s.trim().split(/\s+/).filter(Boolean);
      }
      function parse(tokens) {
        var pos = 0;
        function peek() { return tokens[pos]; }
        function eat(t) { if (tokens[pos] === t) { pos++; return true; } return false; }
        function atom() {
          if (eat("(")) { var e = orExpr(); if (!eat(")")) throw "missing )"; return e; }
          if (eat("NOT")) { var a = atom(); return { op: "NOT", a: a }; }
          var t = peek();
          if (/^[A-Z]$/.test(t || "")) { pos++; return { v: t }; }
          if (t === "1" || t === "0") { pos++; return { k: t === "1" }; }
          throw "expected a variable at \u201C" + (t || "end") + "\u201D";
        }
        function andExpr() {
          var a = atom();
          while (peek() === "AND" || peek() === "NAND") {
            var op = tokens[pos++]; a = { op: op, a: a, b: atom() };
          }
          return a;
        }
        function orExpr() {
          var a = andExpr();
          while (peek() === "OR" || peek() === "XOR" || peek() === "NOR") {
            var op = tokens[pos++]; a = { op: op, a: a, b: andExpr() };
          }
          return a;
        }
        var e = orExpr();
        if (pos < tokens.length) throw "unexpected \u201C" + tokens[pos] + "\u201D";
        return e;
      }
      function evalNode(n, env) {
        if (n.v !== undefined) return env[n.v];
        if (n.k !== undefined) return n.k;
        var a = evalNode(n.a, env), b = n.b !== undefined ? evalNode(n.b, env) : undefined;
        switch (n.op) {
          case "NOT": return !a;
          case "AND": return a && b;   case "NAND": return !(a && b);
          case "OR": return a || b;    case "NOR": return !(a || b);
          case "XOR": return a !== b;
        }
      }
      function vars(n, set) {
        set = set || {};
        if (n.v) set[n.v] = true;
        if (n.a) vars(n.a, set);
        if (n.b) vars(n.b, set);
        return set;
      }

      var ast = null, names = [], env = {};
      function build() {
        msg.textContent = "";
        try { ast = parse(tokenize(exprIn.value)); }
        catch (e) { msg.textContent = "Parse error: " + e; ast = null; tblWrap.innerHTML = ""; switches.innerHTML = ""; lamp.textContent = ""; return; }
        names = Object.keys(vars(ast)).sort();
        if (names.length > 5) { msg.textContent = "Keep it to 5 variables — that's already a 32-row table."; ast = null; return; }
        env = {}; names.forEach(function (n) { env[n] = false; });
        renderSwitches(); renderTable();
      }
      function renderSwitches() {
        switches.innerHTML = "";
        names.forEach(function (n) {
          var sw = el("button", { class: "logic-sw" + (env[n] ? " on" : ""),
            onclick: function () { env[n] = !env[n]; sw.classList.toggle("on", env[n]); sw.querySelector("b").textContent = env[n] ? "1" : "0"; renderTable(); } },
            [el("span", { text: n }), el("b", { text: env[n] ? "1" : "0" })]);
          switches.appendChild(sw);
        });
        if (!names.length) switches.appendChild(el("span", { class: "sim-msg", text: "constant expression" }));
      }
      function renderTable() {
        var out = evalNode(ast, env);
        lamp.className = "logic-lamp " + (out ? "on" : "off");
        lamp.innerHTML = "<b>Q = " + (out ? "1" : "0") + "</b>";
        var rows = [];
        var n = names.length;
        for (var i = 0; i < (1 << n); i++) {
          var e2 = {}, cells = [];
          for (var j = 0; j < n; j++) {
            var bit = (i >> (n - 1 - j)) & 1;
            e2[names[j]] = !!bit; cells.push(bit);
          }
          rows.push({ cells: cells, q: evalNode(ast, e2) ? 1 : 0,
            live: names.every(function (nm) { return e2[nm] === env[nm]; }) });
        }
        var html = '<table class="n-table logic-tt"><thead><tr>' +
          names.map(function (nm) { return "<th>" + nm + "</th>"; }).join("") +
          "<th>Q</th></tr></thead><tbody>" +
          rows.map(function (r) {
            return '<tr class="' + (r.live ? "live" : "") + '">' +
              r.cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") +
              '<td class="' + (r.q ? "q1" : "q0") + '">' + r.q + "</td></tr>";
          }).join("") + "</tbody></table>";
        tblWrap.innerHTML = "<h4 class='n-h'>Truth table — live row highlighted</h4>" + html;
      }
      build();
    }
  });

  /* =================== 2. SORT VISUALISER =================== */
  KOS.sims.register({
    id: "sort-viz", title: "Sorting Visualiser", subject: "compsci", ref: "4.3.5.1",
    desc: "Bubble vs merge on the same data — watch comparisons and swaps mount up, then quote the Big-O difference.",
    mount: function (panel) {
      var alg = el("select", {}, [
        el("option", { value: "bubble", text: "bubble sort — O(n²)" }),
        el("option", { value: "merge", text: "merge sort — O(n log n)" })
      ]);
      var speed = el("input", { type: "range", min: 1, max: 10, value: 6, style: "width:120px" });
      var stats = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["algorithm", alg]),
        el("label", {}, ["speed", speed]),
        el("button", { class: "btn primary", text: "▶ Sort", onclick: run }),
        el("button", { class: "btn gold", text: "⚄ New data", onclick: reset }),
        stats
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 300);
      var N = 28, data = [], comparisons = 0, swaps = 0, running = false;
      var hot = [-1, -1], sortedFrom = N, band = null;

      function reset() {
        if (running) return;
        data = [];
        for (var i = 0; i < N; i++) data.push(8 + Math.floor(Math.random() * 92));
        comparisons = 0; swaps = 0; hot = [-1, -1]; sortedFrom = N; band = null;
        stats.textContent = "";
        draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var bw = (cv.W - 40) / N;
        data.forEach(function (v, i) {
          var h = (cv.H - 60) * v / 100;
          var x = 20 + i * bw, y = cv.H - 30 - h;
          ctx.fillStyle = i === hot[0] || i === hot[1] ? COL.crim :
            (band && i >= band[0] && i <= band[1]) ? COL.vio :
            i >= sortedFrom ? COL.jade : COL.blue;
          ctx.fillRect(x, y, bw - 3, h);
        });
        ctx.fillStyle = COL.faint;
        ctx.font = "11px 'SF Mono',Consolas,monospace";
        ctx.textAlign = "left";
        ctx.fillText("comparisons: " + comparisons + "   swaps/writes: " + swaps, 20, 18);
      }
      function delay() { return 320 - speed.value * 30; }
      function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

      async function run() {
        if (running) return;
        running = true; comparisons = 0; swaps = 0; sortedFrom = N;
        if (alg.value === "bubble") await bubble(); else await merge(0, N - 1);
        hot = [-1, -1]; band = null; sortedFrom = 0; draw();
        stats.textContent = alg.value === "bubble"
          ? "n² growth: doubling n quadruples this."
          : "n log n: doubling n only ~doubles this.";
        running = false;
      }
      async function bubble() {
        for (var pass = 0; pass < N - 1; pass++) {
          var swapped = false;
          for (var i = 0; i < N - 1 - pass; i++) {
            hot = [i, i + 1]; comparisons++; draw(); await sleep(delay());
            if (data[i] > data[i + 1]) {
              var t = data[i]; data[i] = data[i + 1]; data[i + 1] = t;
              swaps++; swapped = true; draw(); await sleep(delay() / 2);
            }
          }
          sortedFrom = N - 1 - pass;
          if (!swapped) { sortedFrom = 0; break; }
        }
      }
      async function merge(lo, hi) {
        if (lo >= hi) return;
        var mid = (lo + hi) >> 1;
        await merge(lo, mid); await merge(mid + 1, hi);
        band = [lo, hi];
        var tmp = [], i = lo, j = mid + 1;
        while (i <= mid && j <= hi) {
          comparisons++; hot = [i, j]; draw(); await sleep(delay());
          tmp.push(data[i] <= data[j] ? data[i++] : data[j++]);
        }
        while (i <= mid) tmp.push(data[i++]);
        while (j <= hi) tmp.push(data[j++]);
        for (var k = 0; k < tmp.length; k++) {
          data[lo + k] = tmp[k]; swaps++; hot = [lo + k, -1]; draw(); await sleep(delay() / 2);
        }
        band = null;
      }
      reset();
    }
  });

  /* =================== 3. FSM LAB =================== */
  KOS.sims.register({
    id: "fsm-lab", title: "Finite State Machine Lab", subject: "compsci", ref: "4.4.2.1",
    desc: "Feed an input string through classic acceptor FSMs one symbol at a time and watch the state hop.",
    mount: function (panel) {
      var MACHINES = {
        even1s: { name: "even number of 1s", alphabet: "01",
          states: ["S0", "S1"], start: "S0", accept: ["S0"],
          d: { "S0,0": "S0", "S0,1": "S1", "S1,0": "S1", "S1,1": "S0" } },
        endsIn01: { name: "ends in 01", alphabet: "01",
          states: ["A", "B", "C"], start: "A", accept: ["C"],
          d: { "A,0": "B", "A,1": "A", "B,0": "B", "B,1": "C", "C,0": "B", "C,1": "A" } },
        div3: { name: "binary number divisible by 3", alphabet: "01",
          states: ["r0", "r1", "r2"], start: "r0", accept: ["r0"],
          d: { "r0,0": "r0", "r0,1": "r1", "r1,0": "r2", "r1,1": "r0", "r2,0": "r1", "r2,1": "r2" } }
      };
      var sel = el("select", {}, Object.keys(MACHINES).map(function (k) {
        return el("option", { value: k, text: MACHINES[k].name }); }));
      var input = el("input", { type: "text", value: "110110", style: "width:160px",
        placeholder: "string of 0s and 1s" });
      var verdict = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["machine (acceptor)", sel]),
        el("label", {}, ["input string", input]),
        el("button", { class: "btn primary", text: "▶ Run", onclick: run }),
        el("button", { class: "btn", text: "Step", onclick: stepOnce }),
        el("button", { class: "btn gold", text: "Reset", onclick: reset }),
        verdict
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 280);
      var tape = el("div", { class: "fsm-tape" });
      panel.appendChild(tape);

      var m, cur, pos, halted;
      function machine() { return MACHINES[sel.value]; }
      sel.onchange = reset;
      input.oninput = reset;

      function reset() {
        m = machine(); cur = m.start; pos = 0; halted = false;
        verdict.textContent = "";
        drawTape(); draw();
      }
      function stepOnce() {
        if (halted) return;
        var s = input.value.replace(/[^01]/g, "");
        if (pos >= s.length) { finish(s); return; }
        var sym = s[pos];
        var nxt = m.d[cur + "," + sym];
        cur = nxt; pos++;
        drawTape(); draw();
        if (pos >= s.length) finish(s);
      }
      function finish(s) {
        halted = true;
        var ok = m.accept.indexOf(cur) !== -1;
        verdict.textContent = "halted in " + cur + " → " + (ok ? "ACCEPTED ✓" : "REJECTED ✕");
        verdict.style.color = ok ? COL.jade : COL.crim;
        draw();
      }
      async function run() {
        reset();
        var s = input.value.replace(/[^01]/g, "");
        for (var i = 0; i < s.length; i++) {
          await new Promise(function (r) { setTimeout(r, 460); });
          stepOnce();
        }
      }
      function drawTape() {
        var s = input.value.replace(/[^01]/g, "");
        tape.innerHTML = "";
        s.split("").forEach(function (ch, i) {
          tape.appendChild(el("span", { class: "fsm-cell" + (i === pos ? " cur" : i < pos ? " done" : ""), text: ch }));
        });
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var n = m.states.length, R = 34;
        var cxs = m.states.map(function (_, i) { return cv.W / 2 + (i - (n - 1) / 2) * 200; });
        var cy = cv.H / 2;
        // transitions
        m.states.forEach(function (st, i) {
          "01".split("").forEach(function (sym) {
            var to = m.d[st + "," + sym];
            var j = m.states.indexOf(to);
            ctx.strokeStyle = COL.line; ctx.fillStyle = COL.mute;
            ctx.font = "11px 'SF Mono',Consolas,monospace"; ctx.textAlign = "center";
            if (i === j) { // self loop
              ctx.beginPath();
              ctx.arc(cxs[i], cy - R - 16, 15, 0.6, Math.PI - 0.6, false);
              ctx.stroke();
              ctx.fillText(sym, cxs[i] + (sym === "0" ? -22 : 22), cy - R - 30);
            } else {
              var dir = j > i ? 1 : -1, lift = j > i ? -1 : 1;
              var x1 = cxs[i] + dir * R, x2 = cxs[j] - dir * R;
              var midx = (x1 + x2) / 2, midy = cy + lift * 38;
              ctx.beginPath(); ctx.moveTo(x1, cy + lift * 8);
              ctx.quadraticCurveTo(midx, midy, x2, cy + lift * 8); ctx.stroke();
              var a = Math.atan2(cy + lift * 8 - midy, x2 - midx);
              ctx.beginPath();
              ctx.moveTo(x2, cy + lift * 8);
              ctx.lineTo(x2 - 8 * Math.cos(a - 0.4), cy + lift * 8 - 8 * Math.sin(a - 0.4));
              ctx.lineTo(x2 - 8 * Math.cos(a + 0.4), cy + lift * 8 - 8 * Math.sin(a + 0.4));
              ctx.fillStyle = COL.mute; ctx.fill();
              ctx.fillText(sym, midx, midy + (lift > 0 ? 14 : -7));
            }
          });
        });
        // states
        m.states.forEach(function (st, i) {
          ctx.beginPath(); ctx.arc(cxs[i], cy, R, 0, 7);
          ctx.fillStyle = st === cur ? "rgba(232,66,90,.16)" : COL.ink; ctx.fill();
          ctx.lineWidth = 2; ctx.strokeStyle = st === cur ? COL.crim : COL.blue; ctx.stroke();
          if (m.accept.indexOf(st) !== -1) {
            ctx.beginPath(); ctx.arc(cxs[i], cy, R - 6, 0, 7); ctx.stroke();
          }
          ctx.fillStyle = COL.text;
          ctx.font = "700 14px 'SF Mono',Consolas,monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(st, cxs[i], cy);
          if (st === m.start) {
            ctx.strokeStyle = COL.gold;
            ctx.beginPath(); ctx.moveTo(cxs[i] - R - 34, cy); ctx.lineTo(cxs[i] - R - 4, cy); ctx.stroke();
            ctx.fillStyle = COL.gold; ctx.font = "10px monospace";
            ctx.fillText("start", cxs[i] - R - 20, cy - 11);
          }
        });
        ctx.fillStyle = COL.faint; ctx.font = "10px 'SF Mono',monospace"; ctx.textAlign = "center";
        ctx.fillText("double ring = accepting state", cv.W / 2, cv.H - 12);
      }
      reset();
    }
  });

  /* =================== 4. FUNCTION TRANSFORMER =================== */
  KOS.sims.register({
    id: "fn-transform", title: "Graph Transformation Explorer", subject: "maths", ref: "2.9",
    desc: "Drag the four sliders of y = a·f(bx + c) + d and watch the curve move — with the exam-language description written for you.",
    mount: function (panel) {
      var FNS = {
        "x²": function (x) { return x * x; },
        "x³": function (x) { return x * x * x; },
        "sin x": Math.sin, "cos x": Math.cos,
        "|x|": Math.abs, "1/x": function (x) { return 1 / x; },
        "√x": function (x) { return x >= 0 ? Math.sqrt(x) : NaN; },
        "eˣ": Math.exp
      };
      var fsel = el("select", {}, Object.keys(FNS).map(function (k) {
        return el("option", { value: k, text: "f(x) = " + k }); }));
      function slider(min, max, step, val) {
        return el("input", { type: "range", min: min, max: max, step: step, value: val, style: "width:110px" });
      }
      var sa = slider(-3, 3, 0.5, 1), sb = slider(-3, 3, 0.5, 1),
          sc = slider(-5, 5, 0.5, 0), sd = slider(-5, 5, 0.5, 0);
      var eq = el("div", { class: "fn-eq" });
      var descr = el("div", { class: "fn-desc" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["base", fsel]),
        el("label", {}, ["a (stretch y)", sa]),
        el("label", {}, ["b (stretch x)", sb]),
        el("label", {}, ["c (shift in x)", sc]),
        el("label", {}, ["d (shift in y)", sd]),
        el("button", { class: "btn gold", text: "Reset", onclick: function () {
          sa.value = 1; sb.value = 1; sc.value = 0; sd.value = 0; draw(); } })
      ]));
      panel.appendChild(eq);
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 360);
      panel.appendChild(descr);
      [fsel, sa, sb, sc, sd].forEach(function (n) { n.oninput = draw; n.onchange = draw; });

      var XR = 8, YR = 6; // axis ranges
      function px(x) { return cv.W / 2 + x * (cv.W / (2 * XR)); }
      function py(y) { return cv.H / 2 - y * (cv.H / (2 * YR)); }

      function plot(fn, color, dashed) {
        var ctx = cv.ctx;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        if (dashed && ctx.setLineDash) ctx.setLineDash([5, 5]);
        ctx.beginPath();
        var pen = false;
        for (var sx = 0; sx <= cv.W; sx += 2) {
          var x = (sx - cv.W / 2) / (cv.W / (2 * XR));
          var y = fn(x);
          if (!isFinite(y) || Math.abs(y) > YR * 3) { pen = false; continue; }
          var sy = py(y);
          if (pen) ctx.lineTo(sx, sy); else { ctx.moveTo(sx, sy); pen = true; }
        }
        ctx.stroke();
        if (ctx.setLineDash) ctx.setLineDash([]);
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        var f = FNS[fsel.value];
        var a = +sa.value, b = +sb.value, c = +sc.value, d = +sd.value;
        ctx.clearRect(0, 0, cv.W, cv.H);
        // grid + axes
        ctx.strokeStyle = "#241b35"; ctx.lineWidth = 1;
        for (var gx = -XR; gx <= XR; gx++) { ctx.beginPath(); ctx.moveTo(px(gx), 0); ctx.lineTo(px(gx), cv.H); ctx.stroke(); }
        for (var gy = -YR; gy <= YR; gy++) { ctx.beginPath(); ctx.moveTo(0, py(gy)); ctx.lineTo(cv.W, py(gy)); ctx.stroke(); }
        ctx.strokeStyle = COL.faint; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(cv.W, py(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), cv.H); ctx.stroke();
        plot(f, COL.faint, true);
        plot(function (x) { return b === 0 ? NaN : a * f(b * x + c) + d; }, COL.crim, false);

        function n(v) { return (Math.round(v * 100) / 100).toString(); }
        eq.innerHTML = "y = " + (a === 1 ? "" : a === -1 ? "−" : n(a) + "·") + "f(" +
          (b === 1 ? "" : b === -1 ? "−" : n(b)) + "x" + (c ? (c > 0 ? " + " : " − ") + n(Math.abs(c)) : "") + ")" +
          (d ? (d > 0 ? " + " : " − ") + n(Math.abs(d)) : "") +
          '   <span style="color:var(--faint)">where f(x) = ' + fsel.value + "</span>";

        var parts = [];
        if (c) parts.push("translation by vector (" + n(-c / (b || 1)) + ", 0)" + (b !== 1 ? " — note c acts before the x-stretch is undone, so the shift is −c/b" : " (LEFT for +c)"));
        if (b !== 1 && b !== 0) parts.push(b === -1 ? "reflection in the y-axis" : "stretch ×" + n(1 / Math.abs(b)) + " parallel to the x-axis" + (b < 0 ? " plus a reflection in the y-axis" : ""));
        if (a !== 1) parts.push(a === -1 ? "reflection in the x-axis" : "stretch ×" + n(Math.abs(a)) + " parallel to the y-axis" + (a < 0 ? " plus a reflection in the x-axis" : ""));
        if (d) parts.push("translation by vector (0, " + n(d) + ")");
        descr.innerHTML = "<b>Exam wording:</b> " + (parts.length ? parts.join("; then ") + "." : "no transformation — this IS f(x).") +
          ' <span style="color:var(--faint)">Inside the bracket → x-direction, acts \u201Cbackwards\u201D. Outside → y-direction, acts as written.</span>';
      }
      draw();
    }
  });

  /* =================== 5. RECURSION VISUALISER =================== */
  KOS.sims.register({
    id: "recursion-viz", title: "Recursion Visualiser", subject: "compsci", ref: "4.1.1.16",
    desc: "Watch stack frames pile up until the base case, then values flow back down as the stack unwinds.",
    mount: function (panel) {
      var nIn = el("input", { type: "number", min: 1, max: 8, value: 4, style: "width:80px" });
      var fnSel = el("select", {}, [
        el("option", { value: "fact", text: "factorial(n)" }),
        el("option", { value: "fib", text: "fibonacci(n)" }),
        el("option", { value: "sum", text: "sum(1..n)" })
      ]);
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["function", fnSel]),
        el("label", {}, ["n (1–8)", nIn]),
        el("button", { class: "btn primary", text: "▶ Run", onclick: run }),
        el("button", { class: "btn gold", text: "Reset", onclick: reset }),
        msg
      ]));
      var stackCol = el("div", { class: "rec-stack" });
      var info = el("div", { class: "rec-info" }, [
        el("p", { text: "Every call pushes a frame holding its argument, its return address and space for the result. Nothing is computed until the base case returns — then the partial results cascade back up." })
      ]);
      var result = el("div", { class: "rec-result" });
      panel.appendChild(el("div", { class: "rec-wrap" }, [
        el("div", {}, [el("div", { class: "rec-h", text: "CALL STACK — top of stack uppermost" }), stackCol, result]),
        info
      ]));

      var timer = null;
      function build(kind, n) {
        var ev = [];
        var FNS = {
          fact: function fact(n, caller) {
            ev.push({ t: "call", label: "fact(" + n + ")", caller: caller, base: n <= 1 });
            var r = n <= 1 ? 1 : n * fact(n - 1, "fact(" + n + ")");
            ev.push({ t: "ret", value: r,
              expr: n <= 1 ? "base case → 1" : n + " × fact(" + (n - 1) + ") = " + r });
            return r;
          },
          fib: function fib(n, caller) {
            ev.push({ t: "call", label: "fib(" + n + ")", caller: caller, base: n <= 1 });
            var r = n <= 1 ? n : fib(n - 1, "fib(" + n + ")") + fib(n - 2, "fib(" + n + ")");
            ev.push({ t: "ret", value: r,
              expr: n <= 1 ? "base case → " + n : "fib(" + (n - 1) + ") + fib(" + (n - 2) + ") = " + r });
            return r;
          },
          sum: function sum(n, caller) {
            ev.push({ t: "call", label: "sum(" + n + ")", caller: caller, base: n <= 1 });
            var r = n <= 1 ? n : n + sum(n - 1, "sum(" + n + ")");
            ev.push({ t: "ret", value: r,
              expr: n <= 1 ? "base case → " + n : n + " + sum(" + (n - 1) + ") = " + r });
            return r;
          }
        };
        FNS[kind](n, "main()");
        return ev;
      }
      function reset() {
        clearInterval(timer);
        stackCol.innerHTML = ""; result.textContent = ""; msg.textContent = "";
      }
      function run() {
        reset();
        var n = Math.max(1, Math.min(8, parseInt(nIn.value || "4", 10) || 4));
        nIn.value = n;
        var ev = build(fnSel.value, n), i = 0;
        timer = setInterval(function () {
          if (i >= ev.length) {
            clearInterval(timer);
            msg.textContent = "stack empty — result handed back to main()";
            return;
          }
          var e = ev[i++];
          if (e.t === "call") {
            stackCol.insertBefore(el("div", { class: "rec-frame" + (e.base ? " base" : "") }, [
              el("b", { text: e.label }),
              el("span", { class: "ra", text: "return to: " + e.caller }),
              el("span", { class: "pr", text: e.base ? "base case ✓ — no deeper call" : "waiting on recursive call…" })
            ]), stackCol.firstChild);
            msg.textContent = "PUSH " + e.label + (e.base ? " — base case hit" : "");
          } else {
            var top = stackCol.firstElementChild;
            if (top) {
              top.querySelector(".pr").textContent = e.expr;
              top.classList.add("returning");
              (function (node) { setTimeout(function () { node.remove(); }, 380); })(top);
            }
            var parent = stackCol.children[1];
            if (parent) parent.querySelector(".pr").textContent = "received " + e.value + " from callee";
            msg.textContent = "POP — returns " + e.value;
            result.textContent = "last value returned: " + e.value;
          }
        }, 460);
      }
    }
  });

  /* =================== 6. BINARY REGISTER & CONVERTER =================== */
  KOS.sims.register({
    id: "binary-number", title: "Binary Register & Converter", subject: "compsci", ref: "4.5.4.2",
    desc: "Click the bits of an 8-bit register — denary, hex and two's complement update live. Addition mode shows the carry rippling through.",
    mount: function (panel) {
      var WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
      var mode = el("select", {}, [
        el("option", { value: "convert", text: "converter" }),
        el("option", { value: "add", text: "8-bit addition" })
      ]);
      var denIn = el("input", { type: "number", min: 0, max: 255, style: "width:90px" });
      var hexIn = el("input", { type: "text", maxlength: 2, style: "width:64px", placeholder: "FF" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["mode", mode]),
        el("label", {}, ["denary (0–255)", denIn]),
        el("label", {}, ["hex", hexIn]),
        msg
      ]));
      var body = el("div", {});
      panel.appendChild(body);

      var A = [0, 0, 0, 0, 0, 1, 0, 1], B = [0, 0, 0, 0, 0, 0, 1, 1];
      var addTimer = null;

      function toVal(bits) { return bits.reduce(function (a, b, i) { return a + b * WEIGHTS[i]; }, 0); }
      function toBits(v) { return WEIGHTS.map(function (w) { return (v & w) ? 1 : 0; }); }
      function binStr(bits) { return bits.join(""); }

      function bitRow(bits, onToggle, cls) {
        var row = el("div", { class: "bit-row " + (cls || "") });
        bits.forEach(function (b, i) {
          var btn = el("button", {
            class: "bit" + (b ? " on" : ""), text: String(b),
            "aria-label": "bit weight " + WEIGHTS[i],
            onclick: onToggle ? function () {
              bits[i] = 1 - bits[i];
              btn.classList.add("flip");
              setTimeout(function () { btn.classList.remove("flip"); }, 240);
              onToggle();
            } : undefined
          });
          if (!onToggle) btn.disabled = true;
          row.appendChild(btn);
        });
        return row;
      }
      function weightsRow() {
        return el("div", { class: "bit-row weights" }, WEIGHTS.map(function (w) {
          return el("span", { class: "bw", text: String(w) }); }));
      }

      function render() {
        clearInterval(addTimer);
        body.innerHTML = "";
        if (mode.value === "convert") {
          var v = toVal(A);
          denIn.value = v;
          hexIn.value = v.toString(16).toUpperCase().padStart(2, "0");
          body.appendChild(weightsRow());
          body.appendChild(bitRow(A, render));
          var signed = v >= 128 ? v - 256 : v;
          var tc = (256 - v) % 256;
          body.appendChild(el("dl", { class: "n-kv bin-read" }, [
            el("dt", { text: "binary" }), el("dd", { text: binStr(A) }),
            el("dt", { text: "denary (unsigned)" }), el("dd", { text: String(v) }),
            el("dt", { text: "denary (two's complement reading)" }), el("dd", { text: String(signed) }),
            el("dt", { text: "hex" }), el("dd", { text: "0x" + v.toString(16).toUpperCase().padStart(2, "0") }),
            el("dt", { text: "two's complement of this value (−" + v + ")" }),
            el("dd", { text: binStr(toBits(tc)) + "  (flip the bits, add 1)" })
          ]));
        } else {
          denIn.value = ""; hexIn.value = "";
          var carryRow = el("div", { class: "bit-row carry" }, WEIGHTS.map(function () {
            return el("span", { class: "bw cbit", text: "" }); }));
          var resBits = [0, 0, 0, 0, 0, 0, 0, 0];
          var rRow = bitRow(resBits, null, "result");
          var out = el("div", { class: "sim-msg", style: "display:block;margin-top:8px" });
          body.appendChild(el("div", { class: "bin-lbl", text: "carry" })); body.appendChild(carryRow);
          body.appendChild(el("div", { class: "bin-lbl", text: "A = " + toVal(A) })); body.appendChild(bitRow(A, render));
          body.appendChild(el("div", { class: "bin-lbl", text: "B = " + toVal(B) })); body.appendChild(bitRow(B, render));
          body.appendChild(el("div", { class: "bin-lbl", text: "A + B" })); body.appendChild(rRow);
          body.appendChild(el("div", { class: "lab-controls", style: "margin-top:10px" }, [
            el("button", { class: "btn primary", text: "▶ Add (watch the carry)", onclick: function () {
              clearInterval(addTimer);
              var col = 7, carry = 0;
              rRow.querySelectorAll(".bit").forEach(function (b) { b.textContent = "0"; b.classList.remove("on", "live"); });
              carryRow.querySelectorAll(".cbit").forEach(function (c) { c.textContent = ""; });
              out.textContent = "";
              addTimer = setInterval(function () {
                if (col < 0) {
                  clearInterval(addTimer);
                  var sum = toVal(A) + toVal(B);
                  out.textContent = toVal(A) + " + " + toVal(B) + " = " + (sum & 255) +
                    (carry ? "  — carry out of the MSB: unsigned overflow! (true answer " + sum + " needs 9 bits)" : "  — no carry out");
                  return;
                }
                var s = A[col] + B[col] + carry;
                resBits[col] = s & 1;
                carry = s >> 1;
                var cell = rRow.children[col];
                cell.textContent = String(s & 1);
                cell.classList.toggle("on", !!(s & 1));
                cell.classList.add("live");
                setTimeout(function () { cell.classList.remove("live"); }, 380);
                if (carry && col > 0) carryRow.children[col - 1].textContent = "1";
                col--;
              }, 420);
            } }),
            out
          ]));
        }
      }
      mode.onchange = render;
      denIn.oninput = function () {
        var v = Math.max(0, Math.min(255, parseInt(denIn.value || "0", 10) || 0));
        A = toBits(v);
        if (mode.value === "convert") render();
      };
      hexIn.oninput = function () {
        var v = parseInt(hexIn.value, 16);
        if (!isNaN(v) && v >= 0 && v <= 255) { A = toBits(v); if (mode.value === "convert") render(); }
      };
      render();
    }
  });

  /* =================== 7. FETCH–EXECUTE CYCLE =================== */
  KOS.sims.register({
    id: "cpu-fetch-execute", title: "Fetch–Execute Cycle", subject: "compsci", ref: "4.7.3.1",
    desc: "Step a toy program through fetch–decode–execute and watch data move between PC, MAR, MDR, CIR, the ALU and memory.",
    mount: function (panel) {
      var PROGS = {
        "load → store":    ["LDA 4", "STA 5", "HLT", "", "7", "0", "0", ""],
        "add two numbers": ["LDA 4", "ADD 5", "STA 6", "HLT", "3", "9", "0", ""],
        "running total":   ["LDA 5", "ADD 6", "ADD 7", "STA 4", "HLT", "2", "4", "6"]
      };
      var progSel = el("select", {}, Object.keys(PROGS).map(function (k) {
        return el("option", { value: k, text: k }); }));
      var desc = el("div", { class: "cpu-desc" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["program", progSel]),
        el("button", { class: "btn primary", text: "Step", onclick: stepOnce }),
        el("button", { class: "btn", text: "▶ Run", onclick: runAll }),
        el("button", { class: "btn gold", text: "Reset", onclick: reset })
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 330);
      panel.appendChild(desc);

      var mem, pc, mar, mdr, cir, acc, halted, hi, anim, runTimer = null;

      /* register box layout */
      function boxes() {
        var col1 = 30, col2 = cv.W * 0.36, memX = cv.W - 200;
        return {
          PC:  { x: col1, y: 40,  w: 110, h: 38, v: pc },
          MAR: { x: col1, y: 100, w: 110, h: 38, v: mar },
          MDR: { x: col1, y: 160, w: 110, h: 38, v: mdr },
          CIR: { x: col1, y: 220, w: 110, h: 38, v: cir },
          ALU: { x: col2, y: 130, w: 96,  h: 56, v: "ALU" },
          ACC: { x: col2, y: 40,  w: 96,  h: 38, v: acc },
          MEM: { x: memX, y: 24,  w: 170, h: 280, v: null }
        };
      }
      function centre(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }

      function decode(instr) {
        var m = /^(LDA|ADD|STA|HLT)\s*(\d*)$/.exec(instr || "");
        return m ? { op: m[1], n: m[2] === "" ? null : +m[2] } : null;
      }
      function execSteps(ins) {
        if (!ins || ins.op === "HLT") {
          return [{ d: "EXECUTE: HLT — the cycle stops here", a: null, hi: ["CIR"],
            f: function () { halted = true; } }];
        }
        if (ins.op === "LDA") return [
          { d: "EXECUTE LDA " + ins.n + ": operand placed in MAR", a: ["CIR", "MAR"], f: function () { mar = ins.n; } },
          { d: "EXECUTE: memory[" + ins.n + "] fetched into MDR", a: ["MEM", "MDR"], f: function () { mdr = mem[ins.n]; } },
          { d: "EXECUTE: MDR copied into the accumulator", a: ["MDR", "ACC"], f: function () { acc = +mdr || 0; } }
        ];
        if (ins.op === "ADD") return [
          { d: "EXECUTE ADD " + ins.n + ": operand placed in MAR", a: ["CIR", "MAR"], f: function () { mar = ins.n; } },
          { d: "EXECUTE: memory[" + ins.n + "] fetched into MDR", a: ["MEM", "MDR"], f: function () { mdr = mem[ins.n]; } },
          { d: "EXECUTE: ALU adds MDR to ACC → result back in ACC", a: ["ALU", "ACC"],
            f: function () { acc = (+acc || 0) + (+mdr || 0); } }
        ];
        /* STA */
        return [
          { d: "EXECUTE STA " + ins.n + ": operand placed in MAR", a: ["CIR", "MAR"], f: function () { mar = ins.n; } },
          { d: "EXECUTE: ACC copied into MDR", a: ["ACC", "MDR"], f: function () { mdr = acc; } },
          { d: "EXECUTE: MDR written to memory[" + ins.n + "]", a: ["MDR", "MEM"], f: function () { mem[ins.n] = String(mdr); } }
        ];
      }

      var queue = [];
      function stepOnce() {
        if (halted) { desc.textContent = "Halted. Reset to go again."; return; }
        if (!queue.length) {
          queue = [
            { d: "FETCH: contents of PC copied into MAR", a: ["PC", "MAR"], f: function () { mar = pc; } },
            { d: "FETCH: memory[MAR] copied into MDR along the data bus", a: ["MEM", "MDR"], f: function () { mdr = mem[mar]; } },
            { d: "FETCH: MDR copied into CIR; PC incremented", a: ["MDR", "CIR"], f: function () { cir = mdr; pc++; } },
            { d: "DECODE: control unit splits CIR into opcode + operand", hi: ["CIR"], f: function () {} },
            { exec: true }
          ];
        }
        var s = queue.shift();
        if (s.exec) {
          queue = execSteps(decode(cir)).concat(queue);
          s = queue.shift();
        }
        s.f();
        hi = s.hi || (s.a ? s.a.slice() : []);
        desc.textContent = s.d;
        if (s.a) startArrow(s.a[0], s.a[1]); else draw();
      }
      function runAll() {
        clearInterval(runTimer);
        runTimer = setInterval(function () {
          if (halted) { clearInterval(runTimer); return; }
          stepOnce();
        }, 700);
      }
      function reset() {
        clearInterval(runTimer);
        mem = PROGS[progSel.value].slice();
        pc = 0; mar = "—"; mdr = "—"; cir = "—"; acc = 0;
        halted = false; queue = []; hi = []; anim = null;
        desc.textContent = "Press Step to begin the fetch phase.";
        draw();
      }
      progSel.onchange = reset;

      function startArrow(from, to) {
        anim = { from: from, to: to, t: 0 };
        (function tick() {
          if (!anim) return;
          anim.t += 0.07;
          draw();
          if (anim.t < 1) requestAnimationFrame(tick);
          else { anim = null; draw(); }
        })();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var B = boxes();
        Object.keys(B).forEach(function (k) {
          var b = B[k];
          var active = hi && hi.indexOf(k) !== -1;
          ctx.strokeStyle = active ? COL.gold : COL.line;
          ctx.lineWidth = active ? 2.4 : 1.5;
          ctx.fillStyle = active ? "rgba(226,178,63,.08)" : COL.ink;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeRect(b.x, b.y, b.w, b.h);
          ctx.fillStyle = COL.faint;
          ctx.font = "10px 'SF Mono',Consolas,monospace";
          ctx.textAlign = "left"; ctx.textBaseline = "middle";
          ctx.fillText(k === "MEM" ? "MAIN MEMORY" : k, b.x + 2, b.y - 9);
          if (k === "MEM") {
            var cellH = (b.h - 10) / mem.length;
            mem.forEach(function (m, i) {
              var y = b.y + 5 + i * cellH;
              ctx.strokeStyle = (hi.indexOf("MEM") !== -1 && i === +mar) ? COL.gold : COL.line;
              ctx.lineWidth = 1.2;
              ctx.strokeRect(b.x + 34, y, b.w - 42, cellH - 4);
              ctx.fillStyle = COL.faint;
              ctx.textAlign = "right";
              ctx.fillText(String(i), b.x + 26, y + cellH / 2 - 2);
              ctx.fillStyle = COL.text;
              ctx.textAlign = "center";
              ctx.fillText(String(m), b.x + 34 + (b.w - 42) / 2, y + cellH / 2 - 2);
            });
          } else if (k !== "ALU") {
            ctx.fillStyle = active ? COL.gold : COL.text;
            ctx.font = "700 14px 'SF Mono',Consolas,monospace";
            ctx.textAlign = "center";
            ctx.fillText(String(b.v), b.x + b.w / 2, b.y + b.h / 2);
          } else {
            ctx.fillStyle = active ? COL.gold : COL.mute;
            ctx.font = "700 13px 'SF Mono',Consolas,monospace";
            ctx.textAlign = "center";
            ctx.fillText("ALU  +", b.x + b.w / 2, b.y + b.h / 2);
          }
        });
        if (halted) {
          ctx.fillStyle = COL.crim;
          ctx.font = "700 12px 'SF Mono',monospace";
          ctx.textAlign = "left";
          ctx.fillText("HALTED", 30, cv.H - 16);
        }
        /* animated data-movement arrow */
        if (anim) {
          var f = centre(B[anim.from]), t = centre(B[anim.to]);
          ctx.strokeStyle = COL.crim; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(t.x, t.y); ctx.stroke();
          var px2 = f.x + (t.x - f.x) * Math.min(1, anim.t);
          var py2 = f.y + (t.y - f.y) * Math.min(1, anim.t);
          ctx.fillStyle = COL.gold;
          ctx.beginPath(); ctx.arc(px2, py2, 5, 0, 7); ctx.fill();
        }
      }
      reset();
    }
  });

  /* =================== 8. UNIT CIRCLE EXPLORER =================== */
  KOS.sims.register({
    id: "trig-circle", title: "Unit Circle Explorer", subject: "maths", ref: "5.3",
    desc: "Drag the point around the unit circle — angle, sin, cos and tan update live, with a CAST overlay and the secondary solution shown.",
    mount: function (panel) {
      var castChk = el("input", { type: "checkbox", checked: "checked" });
      var relSel = el("select", {}, [
        el("option", { value: "sin", text: "sin θ = k → 180° − θ" }),
        el("option", { value: "cos", text: "cos θ = k → 360° − θ" }),
        el("option", { value: "tan", text: "tan θ = k → θ + 180°" })
      ]);
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", { class: "chk", style: "flex-direction:row;align-items:center;gap:6px" }, [castChk, "CAST overlay"]),
        el("label", {}, ["related angle for…", relSel]),
        el("span", { class: "sim-msg", text: "drag the point on the circle" })
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 380);
      var read = el("div", { class: "trig-read" });
      panel.appendChild(read);

      var theta = Math.PI / 6;
      var cx = cv.W / 2, cy = cv.H / 2, R = Math.min(cv.W, cv.H) / 2 - 46;

      function deg(t) { var d = t * 180 / Math.PI; d %= 360; if (d < 0) d += 360; return d; }
      function fmtN(x) { return (Math.round(x * 1000) / 1000).toFixed(3); }
      function secondary() {
        var d = deg(theta);
        if (relSel.value === "sin") return (180 - d + 360) % 360;
        if (relSel.value === "cos") return (360 - d) % 360;
        return (d + 180) % 360;
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        /* axes */
        ctx.strokeStyle = COL.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx - R - 24, cy); ctx.lineTo(cx + R + 24, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, cy - R - 24); ctx.lineTo(cx, cy + R + 24); ctx.stroke();
        /* circle */
        ctx.strokeStyle = COL.mute; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
        /* CAST */
        if (castChk.checked) {
          ctx.font = "700 16px 'SF Mono',monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = "rgba(226,178,63,.5)";
          ctx.fillText("A", cx + R * 0.62, cy - R * 0.62);
          ctx.fillText("S", cx - R * 0.62, cy - R * 0.62);
          ctx.fillText("T", cx - R * 0.62, cy + R * 0.62);
          ctx.fillText("C", cx + R * 0.62, cy + R * 0.62);
        }
        var px2 = cx + R * Math.cos(theta), py2 = cy - R * Math.sin(theta);
        /* angle arc */
        ctx.strokeStyle = COL.gold; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(cx, cy, 26, 0, -theta, theta > 0); ctx.stroke();
        /* secondary solution point */
        var s2 = secondary() * Math.PI / 180;
        ctx.fillStyle = "rgba(199,123,242,.65)";
        ctx.beginPath(); ctx.arc(cx + R * Math.cos(s2), cy - R * Math.sin(s2), 6, 0, 7); ctx.fill();
        /* radius + projections */
        ctx.strokeStyle = COL.text; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px2, py2); ctx.stroke();
        ctx.strokeStyle = COL.jade; ctx.lineWidth = 2.4; /* cos along x */
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px2, cy); ctx.stroke();
        ctx.strokeStyle = COL.crim; /* sin vertical */
        ctx.beginPath(); ctx.moveTo(px2, cy); ctx.lineTo(px2, py2); ctx.stroke();
        /* point */
        ctx.fillStyle = COL.gold;
        ctx.beginPath(); ctx.arc(px2, py2, 7, 0, 7); ctx.fill();

        var d = deg(theta), rad = theta < 0 ? theta + Math.PI * 2 : theta;
        var t = Math.abs(Math.cos(theta)) < 1e-3 ? "undefined (cos θ = 0)" : fmtN(Math.tan(theta));
        read.innerHTML =
          "<b>θ = " + d.toFixed(1) + "°</b> = " + fmtN(rad) + " rad (" + fmtN(rad / Math.PI) + "π)" +
          ' &nbsp;·&nbsp; <span style="color:' + COL.crim + '">sin θ = ' + fmtN(Math.sin(theta)) + "</span>" +
          ' &nbsp;·&nbsp; <span style="color:' + COL.jade + '">cos θ = ' + fmtN(Math.cos(theta)) + "</span>" +
          " &nbsp;·&nbsp; tan θ = " + t +
          '<br><span style="color:var(--paused)">secondary solution (' + relSel.value + "): " +
          secondary().toFixed(1) + "°</span>" +
          ' <span style="color:var(--faint)">— same ' + relSel.value + " value, the violet point</span>";
      }
      var dragging = false;
      function setFromEvent(e) {
        var r = cv.c.getBoundingClientRect();
        var x = e.clientX - r.left - cx, y = cy - (e.clientY - r.top);
        if (x || y) { theta = Math.atan2(y, x); if (theta < 0) theta += Math.PI * 2; draw(); }
      }
      cv.c.addEventListener("mousedown", function (e) { dragging = true; setFromEvent(e); });
      window.addEventListener("mousemove", function (e) { if (dragging) setFromEvent(e); });
      window.addEventListener("mouseup", function () { dragging = false; });
      cv.c.style.cursor = "crosshair";
      castChk.onchange = draw; relSel.onchange = draw;
      draw();
    }
  });

  /* =================== 9. INTEGRATION AREA EXPLORER =================== */
  KOS.sims.register({
    id: "integration-area", title: "Definite Integral Area Explorer", subject: "maths", ref: "8.3",
    desc: "Plot a polynomial, drag the two limit lines, and watch the shaded area update — toggle absolute area to see why regions below the axis need splitting.",
    mount: function (panel) {
      var polyIn = el("input", { type: "text", value: "x^2 - 4", style: "width:170px" });
      var aIn = el("input", { type: "number", value: -1, step: "0.5", style: "width:80px" });
      var bIn = el("input", { type: "number", value: 3, step: "0.5", style: "width:80px" });
      var absChk = el("input", { type: "checkbox" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["f(x) =", polyIn]),
        el("label", {}, ["lower limit a", aIn]),
        el("label", {}, ["upper limit b", bIn]),
        el("label", { class: "chk", style: "flex-direction:row;align-items:center;gap:6px" }, [absChk, "absolute area (|f|)"]),
        msg
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 340);
      var read = el("div", { class: "trig-read" });
      panel.appendChild(read);

      var XR = 6, YR = 10;
      var terms = null, A = -1, Bv = 3;
      function px(x) { return (x + XR) * cv.W / (2 * XR); }
      function xOf(p) { return p * 2 * XR / cv.W - XR; }
      function py(y) { return cv.H / 2 - y * cv.H / (2 * YR); }
      function f(x) { return KOS.worked.polyEval(terms, x); }
      function F(x) { /* antiderivative */
        return terms.reduce(function (a, t) { return a + t.c / (t.p + 1) * Math.pow(x, t.p + 1); }, 0);
      }
      function parse() {
        var t = KOS.worked.parsePoly(polyIn.value);
        if (!t || t.some(function (x) { return x.p < 0; })) {
          msg.textContent = "Couldn't read that — try something like 3x^2 - 2x + 1 (non-negative powers).";
          return false;
        }
        terms = t;
        msg.textContent = "";
        return true;
      }
      function areas() {
        var lo = Math.min(A, Bv), hiV = Math.max(A, Bv);
        var signed = F(Bv) - F(A);
        var absA = 0, N2 = 800, h = (hiV - lo) / N2;
        for (var i = 0; i < N2; i++) {
          var x0 = lo + i * h, x1 = x0 + h;
          absA += Math.abs((f(x0) + f(x1)) / 2) * h;
        }
        return { signed: signed, abs: absA };
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        /* grid + axes */
        ctx.strokeStyle = "#241b35"; ctx.lineWidth = 1;
        for (var gx = -XR; gx <= XR; gx++) { ctx.beginPath(); ctx.moveTo(px(gx), 0); ctx.lineTo(px(gx), cv.H); ctx.stroke(); }
        ctx.strokeStyle = COL.faint; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(cv.W, py(0)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), cv.H); ctx.stroke();
        /* shaded region */
        var lo = Math.min(A, Bv), hiV = Math.max(A, Bv);
        var useAbs = absChk.checked;
        for (var sx = px(lo); sx <= px(hiV); sx += 2) {
          var y = f(xOf(sx));
          if (!isFinite(y)) continue;
          var yc = Math.max(-YR * 1.5, Math.min(YR * 1.5, y));
          ctx.fillStyle = y >= 0 ? "rgba(69,214,168,.28)"
            : useAbs ? "rgba(69,214,168,.28)" : "rgba(232,66,90,.30)";
          var top = useAbs ? py(Math.abs(yc)) : Math.min(py(0), py(yc));
          var bot = useAbs ? py(0) : Math.max(py(0), py(yc));
          ctx.fillRect(sx, top, 2, Math.max(1, bot - top));
        }
        /* curve */
        ctx.strokeStyle = COL.blue; ctx.lineWidth = 2;
        ctx.beginPath();
        var pen = false;
        for (var s2 = 0; s2 <= cv.W; s2 += 2) {
          var yv = f(xOf(s2));
          if (!isFinite(yv) || Math.abs(yv) > YR * 3) { pen = false; continue; }
          if (pen) ctx.lineTo(s2, py(yv)); else { ctx.moveTo(s2, py(yv)); pen = true; }
        }
        ctx.stroke();
        /* limit lines */
        [["a", A], ["b", Bv]].forEach(function (L) {
          var x = px(L[1]);
          ctx.strokeStyle = COL.gold; ctx.lineWidth = 2;
          if (ctx.setLineDash) ctx.setLineDash([6, 4]);
          ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, cv.H - 8); ctx.stroke();
          if (ctx.setLineDash) ctx.setLineDash([]);
          ctx.fillStyle = COL.gold;
          ctx.font = "700 12px 'SF Mono',monospace"; ctx.textAlign = "center";
          ctx.fillText(L[0] + " = " + L[1], x, 16);
        });
        var ar = areas();
        read.innerHTML = "∫ from " + Math.min(A, Bv) + " to " + Math.max(A, Bv) + ":  " +
          "<b style='color:" + (useAbs ? "var(--ok)" : "var(--text)") + "'>" +
          (useAbs ? "absolute area = " + ar.abs.toFixed(3) : "signed value = " + ar.signed.toFixed(3)) + "</b>" +
          " &nbsp;·&nbsp; <span style='color:var(--faint)'>signed " + ar.signed.toFixed(3) +
          " · absolute " + ar.abs.toFixed(3) +
          " — they differ whenever the curve dips below the axis</span>";
      }
      function clampX(v) { return Math.max(-XR, Math.min(XR, Math.round(v * 2) / 2)); }
      function update() {
        if (!parse()) return;
        A = clampX(parseFloat(aIn.value) || 0);
        Bv = clampX(parseFloat(bIn.value) || 0);
        aIn.value = A; bIn.value = Bv;
        draw();
      }
      /* drag the limit lines */
      var dragging = null;
      cv.c.addEventListener("mousedown", function (e) {
        var r = cv.c.getBoundingClientRect(), x = e.clientX - r.left;
        dragging = Math.abs(x - px(A)) < Math.abs(x - px(Bv)) ? "a" : "b";
        if (Math.min(Math.abs(x - px(A)), Math.abs(x - px(Bv))) > 18) dragging = null;
      });
      window.addEventListener("mousemove", function (e) {
        if (!dragging) return;
        var r = cv.c.getBoundingClientRect();
        var v = clampX(xOf(e.clientX - r.left));
        if (dragging === "a") { A = v; aIn.value = v; } else { Bv = v; bIn.value = v; }
        draw();
      });
      window.addEventListener("mouseup", function () { dragging = null; });
      cv.c.style.cursor = "col-resize";
      polyIn.oninput = update; aIn.oninput = update; bIn.oninput = update;
      absChk.onchange = draw;
      update();
    }
  });

  /* =================== Simulations view =================== */
  KOS.views.sims = function (main, openId) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Simulations" }),
      el("p", { class: "sub", text: "Interactive models for the ideas that are easier to see than to read. Each one is linked from its spec point's Simulate tab." })
    ]));
    var withMount = REG.filter(function (s) { return s.mount; });
    var tabs = el("div", { class: "lab-tabs" });
    var panel = el("div", { class: "lab-panel lab-wrap" });
    var current = openId && KOS.sims.get(openId) && KOS.sims.get(openId).mount ? openId : withMount[0].id;
    withMount.forEach(function (s) {
      tabs.appendChild(el("button", { class: "lab-tab" + (s.id === current ? " active" : ""),
        onclick: function () {
          current = s.id;
          tabs.querySelectorAll(".lab-tab").forEach(function (b, i) {
            b.classList.toggle("active", withMount[i].id === current); });
          open(s);
        } }, [s.title]));
    });
    main.appendChild(tabs);
    main.appendChild(panel);
    function open(s) {
      panel.innerHTML = "";
      panel.appendChild(el("p", { class: "sub", style: "margin-top:0", text: s.desc }));
      panel.appendChild(el("div", { style: "font-family:var(--mono);font-size:10.5px;color:var(--faint);margin-bottom:12px",
        text: (s.subject === "maths" ? "Edexcel 9MA0 · " : "AQA 7517 · ") + s.ref }));
      s.mount(panel);
    }
    open(KOS.sims.get(current));
  };
})();
