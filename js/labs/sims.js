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
    "compsci:4.1.1.15": ["recursion-viz"],   /* stack frames in subroutine calls */
    "compsci:4.1.1.16": ["recursion-viz"],
    "compsci:4.2.4.1": ["dijkstra"],          /* graphs — show a weighted graph */
    "compsci:4.3.1.1": ["dijkstra"],          /* graph-traversal algorithms */
    "compsci:4.3.2.1": ["tl-tree"],           /* tree-traversal algorithms */
    "compsci:4.3.4.3": ["tl-tree"],           /* binary tree search */
    "compsci:4.3.5.2": ["sort-viz"],          /* merge sort (sort-viz does both) */
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
      /* explicit overrides (handles sims wired to >1 ref, e.g. binary-number
         on both 4.5.4.2 and 4.5.4.4) … */
      var out = (WIRE[sid + ":" + ref] || []).map(KOS.sims.get).filter(Boolean);
      /* … plus any sim that declares this exact subject:ref, so every sim is
         reachable from its own topic page and new sims auto-wire on register */
      REG.forEach(function (s) {
        if (s.subject === sid && s.ref === ref &&
            !out.some(function (x) { return x.id === s.id; })) out.push(s);
      });
      return out;
    },
    open: function (id) {
      var s = KOS.sims.get(id);
      if (!s) return;
      if (s.jump) { s.jump(); return; }
      KOS.show("sims", id);
    }
  };

  /* the four Trace Lab structures, mounted INLINE on their topic's Simulate
     tab (KOS.traceLabs lives in trace.js, which loads before this file) */
  [["tl-stack","Stack push / pop / peek","stack","compsci","4.2.3.1"],
   ["tl-queue","Linear & circular queue","queue","compsci","4.2.2.1"],
   ["tl-list","Linked list traversal","list","compsci","4.2.1.4"],
   ["tl-tree","BST insert & traversals","tree","compsci","4.2.5.1"]
  ].forEach(function (t) {
    KOS.sims.register({ id: t[0], title: t[1], subject: t[3], ref: t[4],
      desc: "Animated canvas with pointer arithmetic and a live trace table.",
      mount: function (panel) { KOS.traceLabs.mount(t[2], panel); } });
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
              crim:"#FF2E44", gold:"#F2C46D", jade:"#45d6a8", blue:"#7b9ef8", vio:"#c77bf2" };

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

  /* =================== 10. REVERSE POLISH EVALUATOR =================== */
  KOS.sims.register({
    id: "rpn-eval", title: "Reverse Polish (Postfix) Evaluator", subject: "compsci", ref: "4.3.3.1",
    desc: "Step through a postfix expression token by token and watch the stack push operands and collapse two-at-a-time on each operator.",
    mount: function (panel) {
      var exprIn = el("input", { type: "text", value: "3 4 + 5 2 - *", style: "width:240px", "aria-label": "Postfix expression" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["postfix (space-separated, + − × ÷)", exprIn]),
        el("button", { class: "btn primary", text: "Load", onclick: load }),
        el("button", { class: "btn", text: "Step ▸", onclick: step }),
        el("button", { class: "btn gold", text: "Run all", onclick: runAll }),
        msg
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 280);
      var tokens = [], pos = 0, stack = [], action = "", err = "";

      function norm(s) { return s.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-"); }
      function isOp(t) { return t === "+" || t === "-" || t === "*" || t === "/"; }
      function load() {
        tokens = norm(exprIn.value).trim().split(/\s+/).filter(Boolean);
        pos = 0; stack = []; err = ""; action = "loaded — press Step ▸"; draw();
      }
      function step() {
        if (err) return;
        if (pos >= tokens.length) {
          action = stack.length === 1 ? "finished ✓ result = " + stack[0]
            : "finished — malformed: " + stack.length + " values left on the stack";
          draw(); return;
        }
        var t = tokens[pos++];
        if (isOp(t)) {
          if (stack.length < 2) { err = "stack underflow at '" + t + "' — an operator needs two operands"; draw(); return; }
          var b = stack.pop(), a = stack.pop(), r;
          if (t === "+") r = a + b; else if (t === "-") r = a - b;
          else if (t === "*") r = a * b; else r = b === 0 ? NaN : a / b;
          r = Math.round(r * 1e6) / 1e6; stack.push(r);
          action = "operator " + t + " → pop " + b + ", pop " + a + ", push (" + a + " " + t + " " + b + ") = " + r;
        } else {
          var n = parseFloat(t);
          if (isNaN(n)) { err = "'" + t + "' is neither a number nor an operator"; draw(); return; }
          stack.push(n); action = "operand " + n + " → push onto the stack";
        }
        draw();
      }
      function runAll() {
        if (!tokens.length) load();
        var guard = 0;
        while (pos < tokens.length && !err && guard++ < 500) step();
        if (!err) step();
      }
      function wrap(ctx, text, x, y, maxW, lh) {
        var words = (text || "").split(" "), line = "", yy = y;
        words.forEach(function (w) {
          var test = line + w + " ";
          if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w + " "; yy += lh; }
          else line = test;
        });
        ctx.fillText(line, x, yy);
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        ctx.font = "13px 'SF Mono',Consolas,monospace"; ctx.textAlign = "left";
        ctx.fillStyle = COL.mute; ctx.fillText("tokens:", 16, 24);
        var tx = 84;
        tokens.forEach(function (t, i) {
          ctx.fillStyle = i < pos ? COL.faint : (i === pos ? COL.gold : COL.text);
          ctx.fillText(t, tx, 24); tx += ctx.measureText(t).width + 16;
        });
        var bx = 40, bw = 96, bh = 30, baseY = cv.H - 52;
        ctx.fillStyle = COL.mute; ctx.fillText("stack (top on left)", 16, baseY + 34);
        stack.forEach(function (v, i) {
          var y = baseY - i * (bh + 6);
          ctx.fillStyle = i === stack.length - 1 ? COL.crim : COL.line;
          ctx.fillRect(bx, y, bw, bh);
          ctx.fillStyle = COL.text; ctx.textAlign = "center"; ctx.fillText(String(v), bx + bw / 2, y + 20);
          ctx.textAlign = "left";
        });
        ctx.fillStyle = err ? COL.crim : COL.jade;
        ctx.font = "12px 'SF Mono',Consolas,monospace";
        wrap(ctx, err || action, 160, baseY - 8, cv.W - 175, 16);
      }
      load();
    }
  });

  /* =================== 11. BINARY SEARCH VISUALISER =================== */
  KOS.sims.register({
    id: "binary-search", title: "Binary Search Visualiser", subject: "compsci", ref: "4.3.4.2",
    desc: "Watch the search interval halve each step as the low, mid and high pointers close in on the target — O(log n).",
    mount: function (panel) {
      var targetIn = el("input", { type: "number", value: 42, style: "width:80px" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("button", { class: "btn gold", text: "⚄ New sorted array", onclick: reset }),
        el("label", {}, ["target", targetIn]),
        el("button", { class: "btn primary", text: "Set target", onclick: start }),
        el("button", { class: "btn", text: "Step ▸", onclick: step }),
        msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 200);
      var N = 15, arr = [], lo = 0, hi = 0, mid = -1, target = 42, done = false, found = -1, comps = 0;

      function reset() {
        arr = []; var v = Math.floor(Math.random() * 8) + 1;
        for (var i = 0; i < N; i++) { arr.push(v); v += Math.floor(Math.random() * 7) + 2; }
        target = arr[Math.floor(Math.random() * N)]; targetIn.value = target; start();
      }
      function start() {
        target = parseFloat(targetIn.value); lo = 0; hi = N - 1; mid = -1;
        done = false; found = -1; comps = 0; msg.textContent = "press Step ▸"; draw();
      }
      function step() {
        if (done) return;
        if (lo > hi) { done = true; mid = -1; msg.textContent = "not in the array — " + comps + " comparisons"; draw(); return; }
        mid = (lo + hi) >> 1; comps++;
        if (arr[mid] === target) { found = mid; done = true; msg.textContent = "found at index " + mid + " in " + comps + " comparison(s) ✓"; }
        else if (arr[mid] < target) { msg.textContent = "a[" + mid + "]=" + arr[mid] + " < " + target + " → discard left half"; lo = mid + 1; }
        else { msg.textContent = "a[" + mid + "]=" + arr[mid] + " > " + target + " → discard right half"; hi = mid - 1; }
        draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var cw = (cv.W - 40) / N, top = 74, ch = 44;
        ctx.font = "13px 'SF Mono',Consolas,monospace"; ctx.textAlign = "center";
        for (var i = 0; i < N; i++) {
          var x = 20 + i * cw, inRange = i >= lo && i <= hi;
          ctx.fillStyle = i === found ? COL.jade : i === mid ? COL.crim : inRange ? COL.line : COL.ink;
          ctx.fillRect(x + 2, top, cw - 4, ch);
          ctx.strokeStyle = COL.faint; ctx.strokeRect(x + 2, top, cw - 4, ch);
          ctx.fillStyle = (inRange || i === found) ? COL.text : COL.faint;
          ctx.fillText(String(arr[i]), x + cw / 2, top + 27);
          ctx.fillStyle = COL.faint; ctx.font = "9px monospace"; ctx.fillText(String(i), x + cw / 2, top + ch + 12);
          ctx.font = "13px 'SF Mono',Consolas,monospace";
        }
        function ptr(idx, label, col, dy) { if (idx < 0 || idx >= N) return; var x = 20 + idx * cw + cw / 2; ctx.fillStyle = col; ctx.fillText(label, x, top - 10 - dy); }
        ctx.font = "11px monospace";
        ptr(lo, "lo", COL.blue, 0); ptr(hi, "hi", COL.gold, 0); if (mid >= 0) ptr(mid, "mid", COL.crim, 15);
        ctx.textAlign = "left"; ctx.fillStyle = COL.mute; ctx.font = "12px monospace";
        ctx.fillText("target = " + target + "    comparisons = " + comps, 20, 26);
      }
      reset();
    }
  });

  /* =================== 12. BINOMIAL DISTRIBUTION EXPLORER =================== */
  KOS.sims.register({
    id: "binom-dist", title: "Binomial Distribution Explorer", subject: "maths", ref: "S4.1",
    desc: "Slide n and p to reshape X ~ B(n, p); read P(X = k), the cumulative probability, mean and variance straight off the bars.",
    mount: function (panel) {
      var nIn = el("input", { type: "range", min: 1, max: 30, value: 10, style: "width:150px" });
      var pIn = el("input", { type: "range", min: 1, max: 99, value: 30, style: "width:150px" });
      var kIn = el("input", { type: "range", min: 0, max: 30, value: 4, style: "width:150px" });
      var msg = el("span", { class: "sim-msg" });
      var lbl = el("div", { class: "sub", style: "margin:8px 0;font-family:var(--mono);font-size:11.5px" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["n", nIn]), el("label", {}, ["p (%)", pIn]), el("label", {}, ["k", kIn]), msg
      ]));
      panel.appendChild(lbl);
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 280);
      function nCr(n, r) { if (r < 0 || r > n) return 0; var x = 1; for (var i = 0; i < r; i++) x = x * (n - i) / (i + 1); return x; }
      function pmf(n, p, k) { return nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); }
      function draw() {
        var n = +nIn.value, p = +pIn.value / 100;
        kIn.max = n; var k = Math.min(+kIn.value, n);
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var bars = [], maxP = 0, j;
        for (j = 0; j <= n; j++) { var pr = pmf(n, p, j); bars.push(pr); if (pr > maxP) maxP = pr; }
        var bw = (cv.W - 50) / (n + 1), base = cv.H - 34;
        for (j = 0; j <= n; j++) {
          var h = maxP > 0 ? (base - 26) * bars[j] / maxP : 0, x = 34 + j * bw, y = base - h;
          ctx.fillStyle = j === k ? COL.crim : COL.blue; ctx.fillRect(x + 1, y, bw - 2, h);
          if (n <= 22) { ctx.fillStyle = j === k ? COL.crim : COL.faint; ctx.font = "9px monospace"; ctx.textAlign = "center"; ctx.fillText(String(j), x + bw / 2, base + 13); }
        }
        ctx.strokeStyle = COL.line; ctx.beginPath(); ctx.moveTo(34, base); ctx.lineTo(cv.W - 10, base); ctx.stroke();
        var mean = n * p, varr = n * p * (1 - p), cum = 0;
        for (j = 0; j <= k; j++) cum += bars[j];
        lbl.innerHTML = "X ~ B(" + n + ", " + p.toFixed(2) + ") &nbsp; <b style='color:var(--kurenai)'>P(X = " + k + ") = " + bars[k].toFixed(4) + "</b> &nbsp; P(X ≤ " + k + ") = " + cum.toFixed(4) +
          " &nbsp; mean np = " + mean.toFixed(2) + " &nbsp; var np(1−p) = " + varr.toFixed(2);
        msg.textContent = "n=" + n + "  p=" + p.toFixed(2) + "  k=" + k;
      }
      nIn.oninput = draw; pIn.oninput = draw; kIn.oninput = draw;
      draw();
    }
  });

  /* =================== 13. LINEAR SEARCH VISUALISER =================== */
  KOS.sims.register({
    id: "linear-search", title: "Linear Search Visualiser", subject: "compsci", ref: "4.3.4.1",
    desc: "Scan an UNsorted list left-to-right, comparing every element until the target is found or the end is reached — O(n).",
    mount: function (panel) {
      var targetIn = el("input", { type: "number", value: 7, style: "width:80px" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("button", { class: "btn gold", text: "⚄ New array", onclick: reset }),
        el("label", {}, ["target", targetIn]),
        el("button", { class: "btn primary", text: "Set target", onclick: start }),
        el("button", { class: "btn", text: "Step ▸", onclick: step }),
        msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 170);
      var N = 12, arr = [], i = -1, target = 7, done = false, found = -1, comps = 0;

      function reset() {
        arr = []; for (var k = 0; k < N; k++) arr.push(Math.floor(Math.random() * 20) + 1);
        target = arr[Math.floor(Math.random() * N)]; targetIn.value = target; start();
      }
      function start() { target = parseFloat(targetIn.value); i = -1; done = false; found = -1; comps = 0; msg.textContent = "press Step ▸"; draw(); }
      function step() {
        if (done) return;
        i++;
        if (i >= N) { done = true; i = -1; msg.textContent = "reached the end — not found (" + comps + " comparisons)"; draw(); return; }
        comps++;
        if (arr[i] === target) { found = i; done = true; msg.textContent = "found at index " + i + " after " + comps + " comparison(s) ✓"; }
        else msg.textContent = "a[" + i + "] = " + arr[i] + " ≠ " + target + " → keep scanning";
        draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var cw = (cv.W - 40) / N, top = 60, ch = 46;
        ctx.font = "13px 'SF Mono',Consolas,monospace"; ctx.textAlign = "center";
        for (var k = 0; k < N; k++) {
          var x = 20 + k * cw;
          ctx.fillStyle = k === found ? COL.jade : k === i ? COL.crim : k < i ? COL.ink : COL.line;
          ctx.fillRect(x + 2, top, cw - 4, ch);
          ctx.strokeStyle = COL.faint; ctx.strokeRect(x + 2, top, cw - 4, ch);
          ctx.fillStyle = (k === i || k === found) ? COL.text : (k < i ? COL.faint : COL.text);
          ctx.fillText(String(arr[k]), x + cw / 2, top + 27);
          ctx.fillStyle = COL.faint; ctx.font = "9px monospace"; ctx.fillText(String(k), x + cw / 2, top + ch + 12);
          ctx.font = "13px 'SF Mono',Consolas,monospace";
        }
        if (i >= 0 && i < N) { var px = 20 + i * cw + cw / 2; ctx.fillStyle = COL.crim; ctx.font = "11px monospace"; ctx.fillText("i", px, top - 10); }
        ctx.textAlign = "left"; ctx.fillStyle = COL.mute; ctx.font = "12px monospace";
        ctx.fillText("target = " + target + "    comparisons = " + comps, 20, 26);
      }
      reset();
    }
  });

  /* =================== 14. HASH TABLE (linear probing) =================== */
  KOS.sims.register({
    id: "hash-table", title: "Hash Table — insert & probe", subject: "compsci", ref: "4.2.6.1",
    desc: "Insert integer keys with h(k) = k mod 11, then watch linear probing step past collisions to the next free slot — O(1) average lookup.",
    mount: function (panel) {
      var SIZE = 11;
      var keyIn = el("input", { type: "number", value: 24, style: "width:90px" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["insert key", keyIn]),
        el("button", { class: "btn primary", text: "Insert", onclick: insert }),
        el("button", { class: "btn", text: "Find", onclick: find }),
        el("button", { class: "btn gold", text: "Reset", onclick: reset }),
        msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 230);
      var table = new Array(SIZE).fill(null), probe = [], hot = -1, count = 0;

      function reset() { table = new Array(SIZE).fill(null); probe = []; hot = -1; count = 0; msg.textContent = ""; draw(); }
      function insert() {
        var k = parseInt(keyIn.value, 10);
        if (isNaN(k)) { KOS.ui.toast("Enter an integer key.", true); return; }
        if (count >= SIZE) { msg.textContent = "table full"; return; }
        var h = ((k % SIZE) + SIZE) % SIZE, p = h; probe = [];
        while (table[p] !== null) {
          probe.push(p);
          if (table[p] === k) { hot = p; msg.textContent = "key " + k + " already present at slot " + p; draw(); return; }
          p = (p + 1) % SIZE;
        }
        probe.push(p); table[p] = k; hot = p; count++;
        msg.textContent = "h(" + k + ") = " + k + " mod " + SIZE + " = " + h +
          (probe.length > 1 ? "  →  collided, probed to slot " + p : "  →  slot " + p + " free");
        draw();
      }
      function find() {
        var k = parseInt(keyIn.value, 10);
        if (isNaN(k)) { KOS.ui.toast("Enter an integer key.", true); return; }
        var h = ((k % SIZE) + SIZE) % SIZE, p = h, steps = 0; probe = [];
        while (steps < SIZE) {
          probe.push(p);
          if (table[p] === null) { hot = -1; msg.textContent = "key " + k + " not found (hit an empty slot after " + (steps + 1) + " probe(s))"; draw(); return; }
          if (table[p] === k) { hot = p; msg.textContent = "found key " + k + " at slot " + p + " in " + (steps + 1) + " probe(s)"; draw(); return; }
          p = (p + 1) % SIZE; steps++;
        }
        hot = -1; msg.textContent = "key " + k + " not found"; draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var cw = Math.min(70, (cv.W - 40) / SIZE), x0 = (cv.W - cw * SIZE) / 2, y = 90, ch = 50;
        ctx.font = "13px 'SF Mono',Consolas,monospace";
        ctx.textAlign = "left"; ctx.fillStyle = COL.mute; ctx.fillText("h(k) = k mod " + SIZE + "    keys stored: " + count + "/" + SIZE, x0, 40);
        for (var s = 0; s < SIZE; s++) {
          var x = x0 + s * cw, probed = probe.indexOf(s) >= 0;
          ctx.fillStyle = s === hot ? COL.jade : probed ? COL.crim : table[s] !== null ? COL.line : COL.ink;
          ctx.fillRect(x + 1, y, cw - 2, ch);
          ctx.strokeStyle = COL.faint; ctx.strokeRect(x + 1, y, cw - 2, ch);
          ctx.textAlign = "center";
          ctx.fillStyle = table[s] !== null ? COL.text : COL.faint;
          ctx.fillText(table[s] !== null ? String(table[s]) : "·", x + cw / 2, y + 30);
          ctx.fillStyle = COL.faint; ctx.font = "9px monospace"; ctx.fillText(String(s), x + cw / 2, y + ch + 13);
          ctx.font = "13px 'SF Mono',Consolas,monospace";
        }
        if (probe.length) { ctx.textAlign = "left"; ctx.fillStyle = COL.crim; ctx.font = "11px monospace"; ctx.fillText("probe path: " + probe.join(" → "), x0, y + ch + 36); }
      }
      reset();
    }
  });

  /* =================== 15. DIJKSTRA'S SHORTEST PATH =================== */
  KOS.sims.register({
    id: "dijkstra", title: "Dijkstra's Shortest Path", subject: "compsci", ref: "4.3.6.1",
    desc: "Step through Dijkstra from A: each step settles the nearest unvisited node and relaxes its neighbours, with the distance table updating live.",
    mount: function (panel) {
      var NODES = [
        { id: 0, l: "A", x: 90, y: 150 }, { id: 1, l: "B", x: 250, y: 60 }, { id: 2, l: "C", x: 250, y: 240 },
        { id: 3, l: "D", x: 470, y: 60 }, { id: 4, l: "E", x: 470, y: 240 }, { id: 5, l: "F", x: 660, y: 150 }
      ];
      var EDGES = [
        [0, 1, 4], [0, 2, 2], [1, 2, 1], [1, 3, 5], [2, 4, 8], [2, 3, 10], [3, 4, 2], [3, 5, 3], [4, 5, 6]
      ];
      var adj = NODES.map(function () { return []; });
      EDGES.forEach(function (e) { adj[e[0]].push([e[1], e[2]]); adj[e[1]].push([e[0], e[2]]); });
      var INF = Infinity, dist, prev, visited, current, finished;
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("button", { class: "btn primary", text: "Step ▸", onclick: step }),
        el("button", { class: "btn gold", text: "Reset", onclick: reset }),
        msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 320);

      function reset() {
        dist = NODES.map(function () { return INF; }); prev = NODES.map(function () { return -1; });
        visited = NODES.map(function () { return false; }); dist[0] = 0; current = -1; finished = false;
        msg.textContent = "start: dist[A] = 0, all others ∞ — press Step ▸"; draw();
      }
      function step() {
        if (finished) return;
        var u = -1, best = INF;
        for (var k = 0; k < NODES.length; k++) if (!visited[k] && dist[k] < best) { best = dist[k]; u = k; }
        if (u === -1) { finished = true; current = -1; msg.textContent = "done — every reachable node settled. Shortest A→F = " + dist[5]; draw(); return; }
        visited[u] = true; current = u;
        var relaxed = [];
        adj[u].forEach(function (e) {
          var v = e[0], w = e[1];
          if (!visited[v] && dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; relaxed.push(NODES[v].l + "=" + dist[v]); }
        });
        msg.textContent = "settle " + NODES[u].l + " (dist " + dist[u] + ")" + (relaxed.length ? " → relax " + relaxed.join(", ") : " → no improvement");
        draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        EDGES.forEach(function (e) {
          var a = NODES[e[0]], b = NODES[e[1]];
          ctx.strokeStyle = COL.line; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.fillStyle = COL.gold; ctx.font = "11px 'SF Mono',monospace"; ctx.textAlign = "center";
          ctx.fillText(String(e[2]), (a.x + b.x) / 2, (a.y + b.y) / 2 - 4);
        });
        NODES.forEach(function (n) {
          ctx.beginPath(); ctx.arc(n.x, n.y, 22, 0, 7);
          ctx.fillStyle = n.id === current ? COL.crim : visited[n.id] ? "rgba(69,214,168,.18)" : COL.ink;
          ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = visited[n.id] ? COL.jade : COL.blue; ctx.stroke();
          ctx.fillStyle = COL.text; ctx.font = "600 14px 'SF Mono',monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(n.l, n.x, n.y);
          ctx.fillStyle = COL.mute; ctx.font = "10px monospace"; ctx.textBaseline = "alphabetic";
          ctx.fillText(dist[n.id] === INF ? "∞" : String(dist[n.id]), n.x, n.y + 36);
        });
        // distance table strip
        ctx.textAlign = "left"; ctx.font = "11px 'SF Mono',monospace"; ctx.textBaseline = "alphabetic";
        var row = NODES.map(function (n) { return n.l + ":" + (dist[n.id] === INF ? "∞" : dist[n.id]) + (visited[n.id] ? "✓" : ""); }).join("   ");
        ctx.fillStyle = COL.faint; ctx.fillText("dist  " + row, 16, cv.H - 12);
      }
      reset();
    }
  });

  /* =================== 16. DICTIONARY (associative array) =================== */
  KOS.sims.register({
    id: "dictionary", title: "Dictionary — key → value store", subject: "compsci", ref: "4.2.7.1",
    desc: "Set, look up and delete key/value pairs. Keys are unique; lookup by key is O(1) on average because a dictionary is backed by a hash table.",
    mount: function (panel) {
      var keyIn = el("input", { type: "text", placeholder: "key", maxlength: 10, style: "width:110px" });
      var valIn = el("input", { type: "text", placeholder: "value", maxlength: 12, style: "width:120px" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["key", keyIn]), el("label", {}, ["value", valIn]),
        el("button", { class: "btn primary", text: "Set", onclick: set }),
        el("button", { class: "btn", text: "Get", onclick: get }),
        el("button", { class: "btn", text: "Delete", onclick: del }),
        el("button", { class: "btn gold", text: "Reset", onclick: reset }),
        msg
      ]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 260);
      var keys = [], map = {}, hot = null;

      function seed() { keys = ["GBP", "USD", "JPY"]; map = { GBP: "1.00", USD: "1.27", JPY: "190" }; hot = null; }
      function reset() { seed(); msg.textContent = "seeded with a sample dictionary"; draw(); }
      function set() {
        var k = keyIn.value.trim(), v = valIn.value.trim();
        if (!k) { KOS.ui.toast("Type a key.", true); return; }
        if (map.hasOwnProperty(k)) { map[k] = v; msg.textContent = "key “" + k + "” already existed → value UPDATED (keys stay unique)"; }
        else { keys.push(k); map[k] = v; msg.textContent = "inserted “" + k + "” : “" + v + "”"; }
        hot = k; keyIn.value = ""; valIn.value = ""; draw();
      }
      function get() {
        var k = keyIn.value.trim();
        if (!k) { KOS.ui.toast("Type a key to look up.", true); return; }
        if (map.hasOwnProperty(k)) { hot = k; msg.textContent = "dict[“" + k + "”] = “" + map[k] + "”  (direct hash lookup, O(1) average)"; }
        else { hot = null; msg.textContent = "key “" + k + "” not in the dictionary"; }
        draw();
      }
      function del() {
        var k = keyIn.value.trim();
        if (!k) { KOS.ui.toast("Type a key to delete.", true); return; }
        if (map.hasOwnProperty(k)) { delete map[k]; keys = keys.filter(function (x) { return x !== k; }); hot = null; msg.textContent = "deleted key “" + k + "”"; }
        else msg.textContent = "key “" + k + "” not found";
        keyIn.value = ""; draw();
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        ctx.textAlign = "left"; ctx.font = "12px 'SF Mono',monospace"; ctx.fillStyle = COL.mute;
        ctx.fillText("{ key : value }   pairs: " + keys.length, 20, 26);
        var x = 20, y = 46, rh = 30, kw = 150, vw = 220;
        ctx.font = "13px 'SF Mono',Consolas,monospace";
        if (!keys.length) { ctx.fillStyle = COL.faint; ctx.fillText("empty dictionary", 20, y + 20); return; }
        keys.forEach(function (k, i) {
          var ry = y + i * (rh + 4), on = k === hot;
          ctx.fillStyle = on ? "rgba(69,214,168,.16)" : COL.ink; ctx.fillRect(x, ry, kw, rh);
          ctx.strokeStyle = on ? COL.jade : COL.line; ctx.strokeRect(x, ry, kw, rh);
          ctx.fillStyle = on ? COL.ink : COL.line; ctx.fillRect(x + kw + 30, ry, vw, rh);
          ctx.strokeStyle = on ? COL.jade : COL.line; ctx.strokeRect(x + kw + 30, ry, vw, rh);
          ctx.fillStyle = COL.gold; ctx.fillText("→", x + kw + 8, ry + 20);
          ctx.fillStyle = COL.text; ctx.fillText(k, x + 10, ry + 20);
          ctx.fillStyle = COL.text; ctx.fillText(map[k], x + kw + 40, ry + 20);
        });
      }
      seed(); draw();
    }
  });

  /* =================== 17. VECTOR LAB (2D) =================== */
  KOS.sims.register({
    id: "cs-vector", title: "Vector Lab — add, scale, dot product", subject: "compsci", ref: "4.2.8.1",
    desc: "Two 2-D vectors as arrows from the origin: see a + b (parallelogram rule), the scalar multiple k·a, the dot product a·b and a convex combination.",
    mount: function (panel) {
      function inp(v) { return el("input", { type: "number", value: v, step: "any", style: "width:62px" }); }
      var ax = inp(3), ay = inp(1), bx = inp(1), by = inp(2), kk = inp(2), lam = el("input", { type: "range", min: 0, max: 100, value: 50, style: "width:120px" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["a = (", ax, ay, ")"]), el("label", {}, ["b = (", bx, by, ")"]),
        el("label", {}, ["k", kk]), el("label", {}, ["λ (convex)", lam])
      ]));
      var lbl = el("div", { class: "sub", style: "margin:8px 0;font-family:var(--mono);font-size:11.5px" });
      panel.appendChild(lbl);
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 320);
      [ax, ay, bx, by, kk].forEach(function (f) { f.oninput = draw; }); lam.oninput = draw;
      function num(f, d) { var v = parseFloat(f.value); return isNaN(v) ? d : v; }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.clearRect) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var A = [num(ax, 0), num(ay, 0)], B = [num(bx, 0), num(by, 0)], k = num(kk, 1), L = +lam.value / 100;
        var ox = cv.W / 2, oy = cv.H / 2, U = 34; // pixels per unit
        function px(x) { return ox + x * U; } function py(y) { return oy - y * U; }
        // grid + axes
        ctx.strokeStyle = "rgba(58,45,82,.5)"; ctx.lineWidth = 1;
        for (var gx = -12; gx <= 12; gx++) { ctx.beginPath(); ctx.moveTo(px(gx), 0); ctx.lineTo(px(gx), cv.H); ctx.stroke(); }
        for (var gy = -6; gy <= 6; gy++) { ctx.beginPath(); ctx.moveTo(0, py(gy)); ctx.lineTo(cv.W, py(gy)); ctx.stroke(); }
        ctx.strokeStyle = COL.faint; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(0, oy); ctx.lineTo(cv.W, oy); ctx.moveTo(ox, 0); ctx.lineTo(ox, cv.H); ctx.stroke();
        function vec(v, col, lab) {
          ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(px(v[0]), py(v[1])); ctx.stroke();
          var ang = Math.atan2(-(py(v[1]) - oy), px(v[0]) - ox);
          var hx = px(v[0]), hy = py(v[1]);
          ctx.beginPath(); ctx.moveTo(hx, hy);
          ctx.lineTo(hx - 10 * Math.cos(ang - 0.4), hy + 10 * Math.sin(ang - 0.4));
          ctx.lineTo(hx - 10 * Math.cos(ang + 0.4), hy + 10 * Math.sin(ang + 0.4)); ctx.fill();
          if (lab) { ctx.font = "11px 'SF Mono',monospace"; ctx.fillText(lab, hx + 6, hy - 4); }
        }
        var sum = [A[0] + B[0], A[1] + B[1]], ka = [k * A[0], k * A[1]], conv = [(1 - L) * A[0] + L * B[0], (1 - L) * A[1] + L * B[1]];
        // parallelogram guide
        ctx.strokeStyle = "rgba(123,158,248,.35)"; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px(A[0]), py(A[1])); ctx.lineTo(px(sum[0]), py(sum[1])); ctx.lineTo(px(B[0]), py(B[1])); ctx.stroke();
        ctx.setLineDash([]);
        vec(ka, "rgba(226,178,63,.6)", "k·a");
        vec(A, COL.jade, "a"); vec(B, COL.blue, "b"); vec(sum, COL.crim, "a+b");
        ctx.fillStyle = COL.vio; ctx.beginPath(); ctx.arc(px(conv[0]), py(conv[1]), 4, 0, 7); ctx.fill();
        var dot = A[0] * B[0] + A[1] * B[1], magA = Math.sqrt(A[0]*A[0]+A[1]*A[1]), magB = Math.sqrt(B[0]*B[0]+B[1]*B[1]);
        var cosT = (magA && magB) ? dot / (magA * magB) : 0;
        lbl.innerHTML = "a + b = (" + sum[0] + ", " + sum[1] + ") &nbsp; " + k + "·a = (" + ka[0] + ", " + ka[1] + ") &nbsp; " +
          "<b style='color:var(--gold)'>a·b = " + dot.toFixed(2) + "</b> &nbsp; |a| = " + magA.toFixed(2) + " &nbsp; angle = " + (Math.acos(Math.max(-1, Math.min(1, cosT))) * 180 / Math.PI).toFixed(1) + "° &nbsp; convex λ=" + L.toFixed(2) + " → (" + conv[0].toFixed(2) + ", " + conv[1].toFixed(2) + ")";
      }
      draw();
    }
  });

  /* =================== 18. LOGIC GATES =================== */
  KOS.sims.register({
    id: "logic-gates", title: "Logic Gates — interactive", subject: "compsci", ref: "4.6.4.1",
    desc: "Pick a gate, flip inputs A and B, and watch the output and the highlighted truth-table row update live. Covers AND, OR, NOT, XOR, NAND and NOR.",
    mount: function (panel) {
      var GATES = {
        AND:  { f: function (a, b) { return a & b; }, sym: "A · B", unary: false },
        OR:   { f: function (a, b) { return a | b; }, sym: "A + B", unary: false },
        NOT:  { f: function (a) { return a ? 0 : 1; }, sym: "¬A", unary: true },
        XOR:  { f: function (a, b) { return a ^ b; }, sym: "A ⊕ B", unary: false },
        NAND: { f: function (a, b) { return (a & b) ? 0 : 1; }, sym: "¬(A · B)", unary: false },
        NOR:  { f: function (a, b) { return (a | b) ? 0 : 1; }, sym: "¬(A + B)", unary: false }
      };
      var sel = el("select", {}, Object.keys(GATES).map(function (g) { return el("option", { value: g, text: g }); }));
      var aBtn = el("button", { class: "btn", onclick: function () { A ^= 1; draw(); } });
      var bBtn = el("button", { class: "btn", onclick: function () { B ^= 1; draw(); } });
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["gate", sel]),
        el("span", {}, ["input A "]), aBtn, el("span", {}, ["input B "]), bBtn
      ]));
      sel.onchange = draw;
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 250);
      var tbl = el("div", { style: "margin-top:10px" }); panel.appendChild(tbl);
      var A = 0, B = 0;
      function lvl(on) { return on ? COL.jade : COL.faint; }
      function draw() {
        var g = GATES[sel.value], out = g.unary ? g.f(A) : g.f(A, B);
        aBtn.textContent = "A = " + A; bBtn.textContent = "B = " + B;
        bBtn.style.opacity = g.unary ? ".35" : "1"; bBtn.disabled = g.unary;
        var ctx = cv.ctx;
        if (ctx && ctx.clearRect) {
          ctx.clearRect(0, 0, cv.W, cv.H);
          var gx = cv.W / 2 - 60, gy = 70, gw = 120, gh = 90;
          // input wires
          ctx.lineWidth = 3;
          ctx.strokeStyle = lvl(A); ctx.beginPath(); ctx.moveTo(gx - 90, gy + 25); ctx.lineTo(gx, gy + 25); ctx.stroke();
          if (!g.unary) { ctx.strokeStyle = lvl(B); ctx.beginPath(); ctx.moveTo(gx - 90, gy + gh - 25); ctx.lineTo(gx, gy + gh - 25); ctx.stroke(); }
          // gate body
          ctx.fillStyle = COL.ink; ctx.strokeStyle = COL.blue; ctx.lineWidth = 2;
          ctx.fillRect(gx, gy, gw, gh); ctx.strokeRect(gx, gy, gw, gh);
          ctx.fillStyle = COL.text; ctx.font = "600 20px 'SF Mono',monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(sel.value, gx + gw / 2, gy + gh / 2 - 8);
          ctx.fillStyle = COL.mute; ctx.font = "12px 'SF Mono',monospace"; ctx.fillText(g.sym, gx + gw / 2, gy + gh / 2 + 16);
          // output wire + lamp
          ctx.strokeStyle = lvl(out); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx + gw, gy + gh / 2); ctx.lineTo(gx + gw + 90, gy + gh / 2); ctx.stroke();
          ctx.fillStyle = out ? COL.jade : COL.ink; ctx.strokeStyle = lvl(out);
          ctx.beginPath(); ctx.arc(gx + gw + 108, gy + gh / 2, 14, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = out ? COL.ink : COL.faint; ctx.font = "600 14px 'SF Mono',monospace"; ctx.fillText(String(out), gx + gw + 108, gy + gh / 2);
          // labels
          ctx.fillStyle = lvl(A); ctx.textAlign = "right"; ctx.font = "12px 'SF Mono',monospace"; ctx.fillText("A=" + A, gx - 96, gy + 25);
          if (!g.unary) { ctx.fillStyle = lvl(B); ctx.fillText("B=" + B, gx - 96, gy + gh - 25); }
        }
        // truth table
        var rows = g.unary ? [[0], [1]] : [[0,0],[0,1],[1,0],[1,1]];
        var head = g.unary ? "<th>A</th><th>Q</th>" : "<th>A</th><th>B</th><th>Q</th>";
        var body = rows.map(function (r) {
          var q = g.unary ? g.f(r[0]) : g.f(r[0], r[1]);
          var live = g.unary ? (r[0] === A) : (r[0] === A && r[1] === B);
          var cells = r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "<td>" + q + "</td>";
          return "<tr class='" + (live ? "live" : "") + "'>" + cells + "</tr>";
        }).join("");
        tbl.innerHTML = "<h4 class='n-h' style='margin:0 0 6px'>" + sel.value + " truth table</h4>" +
          "<table class='n-table logic-tt'><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table>";
      }
      draw();
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
      var locked = KOS.governor && !KOS.governor.simAccess(s.id).ok;
      tabs.appendChild(el("button", { class: "lab-tab" + (s.id === current ? " active" : ""),
        onclick: function () {
          current = s.id;
          tabs.querySelectorAll(".lab-tab").forEach(function (b, i) {
            b.classList.toggle("active", withMount[i].id === current); });
          open(s);
        } }, [(locked ? "◈ " : "") + s.title]));
    });
    main.appendChild(tabs);
    main.appendChild(panel);
    function open(s) {
      panel.innerHTML = "";
      /* gold-locked sims stay locked inside this view too, not just at entry */
      var acc = KOS.governor ? KOS.governor.simAccess(s.id) : { ok: true };
      if (!acc.ok) { KOS.governor.lockPanel(panel, acc); return; }
      panel.appendChild(el("p", { class: "sub", style: "margin-top:0", text: s.desc }));
      panel.appendChild(el("div", { style: "font-family:var(--mono);font-size:10.5px;color:var(--faint);margin-bottom:12px",
        text: (s.subject === "maths" ? "Edexcel 9MA0 · " : "AQA 7517 · ") + s.ref }));
      s.mount(panel);
    }
    open(KOS.sims.get(current));
  };
})();
