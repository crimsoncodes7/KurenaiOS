/* Kurenai OS — labs/sims-cs.js
   Computer Science simulations (AQA 7517), registered on KOS.sims so each one
   mounts INLINE on its topic's Simulations tab and in the Simulations view:
     turing-machine (4.4.5.1)  bnf-checker (4.4.3.1)   big-o-plot (4.4.4.3)
     graph-traversal (4.3.1.1) float-bits (4.5.4.4)    char-codes (4.5.5.2)
     error-check-lab (4.5.5.3) adc-sampling (4.5.6.3)  bitmap-lab (4.5.6.4)
     compression-lab (4.5.6.9) cipher-lab (4.5.6.10)   subnet-lab (4.9.4.4)
   Loaded after sims.js (KOS.sims.canvas / KOS.sims.COL). */
(function () {
  "use strict";
  var el = KOS.ui.el, COL = KOS.sims.COL, canvas = KOS.sims.canvas;
  function A(c, a) { return KOS.labPalette().alpha(c, a); }
  function slider(label, min, max, step, val, onchange, show) {
    var inp = el("input", { type: "range", min: min, max: max, step: step, value: val, "aria-label": label });
    var out = el("b", { text: (show || String)(val) });
    inp.oninput = function () { var v = parseFloat(inp.value); out.textContent = (show || String)(v); onchange(v); };
    return { node: el("label", { class: "sim-slider" }, [el("span", {}, [label + " ", out]), inp]), input: inp };
  }
  function readout() { return el("div", { class: "sim-read" }); }
  function mono(text, extra) { return el("code", { text: text, style: "font-family:var(--mono);" + (extra || "") }); }
  function pad(s, n, ch) { s = String(s); while (s.length < n) s = (ch || "0") + s; return s; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function table(head, rows, cls) {
    return el("div", { class: "sim-tablewrap", html:
      '<table class="n-table sim-table ' + (cls || "") + '"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { var c = r.cls ? ' class="' + r.cls + '"' : ""; return "<tr" + c + ">" + (r.cells || r).map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>" });
  }

  /* =================== TURING MACHINE =================== */
  KOS.sims.register({
    id: "turing-machine", title: "Turing Machine — tape, head, transition table", subject: "compsci", ref: "4.4.5.1",
    desc: "Step a Turing machine through its transition function δ(state, symbol) → (write, move, next). Presets add one to a binary number, invert bits and check for a palindrome; edit the tape and watch the active transition light up.",
    mount: function (panel) {
      var PRESETS = {
        increment: { name: "binary increment", tape: "1011", start: "S0", halt: "H",
          rules: [["S0", "0", "0", "R", "S0"], ["S0", "1", "1", "R", "S0"], ["S0", "□", "□", "L", "S1"], ["S1", "1", "0", "L", "S1"], ["S1", "0", "1", "N", "H"], ["S1", "□", "1", "N", "H"]] },
        invert: { name: "invert every bit", tape: "10110", start: "S0", halt: "H",
          rules: [["S0", "0", "1", "R", "S0"], ["S0", "1", "0", "R", "S0"], ["S0", "□", "□", "N", "H"]] },
        palin: { name: "palindrome check (a/b)", tape: "abba", start: "S0", halt: "YES",
          rules: [["S0", "a", "□", "R", "A1"], ["S0", "b", "□", "R", "B1"], ["S0", "□", "□", "N", "YES"],
                  ["A1", "a", "a", "R", "A1"], ["A1", "b", "b", "R", "A1"], ["A1", "□", "□", "L", "A2"], ["A2", "a", "□", "L", "BK"], ["A2", "b", "b", "N", "NO"], ["A2", "□", "□", "N", "YES"],
                  ["B1", "a", "a", "R", "B1"], ["B1", "b", "b", "R", "B1"], ["B1", "□", "□", "L", "B2"], ["B2", "b", "□", "L", "BK"], ["B2", "a", "a", "N", "NO"], ["B2", "□", "□", "N", "YES"],
                  ["BK", "a", "a", "L", "BK"], ["BK", "b", "b", "L", "BK"], ["BK", "□", "□", "R", "S0"]] }
      };
      var cur = "increment", tape, head, state, steps, halted;
      var sel = el("select", {}, Object.keys(PRESETS).map(function (k) { return el("option", { value: k, text: PRESETS[k].name }); }));
      var tapeIn = el("input", { type: "text", value: PRESETS.increment.tape, style: "width:140px;font-family:var(--mono)" });
      var msg = el("span", { class: "sim-msg" });
      var timer = null;
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("label", {}, ["program", sel]), el("label", {}, ["tape", tapeIn]),
        el("button", { class: "btn primary", text: "Load", onclick: load }),
        el("button", { class: "btn", text: "Step", onclick: function () { step(); draw(); } }),
        el("button", { class: "btn gold", text: "▶ Run", onclick: function () { if (timer) { clearInterval(timer); timer = null; return; } timer = setInterval(function () { if (!step()) { clearInterval(timer); timer = null; } draw(); }, 350); } }),
        msg]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 120);
      var read = readout(); panel.appendChild(read);
      var tblWrap = el("div", {}); panel.appendChild(tblWrap);
      sel.onchange = function () { cur = sel.value; tapeIn.value = PRESETS[cur].tape; load(); };
      function load() {
        if (timer) { clearInterval(timer); timer = null; }
        var p = PRESETS[cur];
        tape = {}; var s = tapeIn.value.replace(/\s/g, "");
        for (var i = 0; i < s.length; i++) tape[i] = s[i];
        head = 0; state = p.start; steps = 0; halted = false; msg.textContent = "";
        draw();
      }
      function sym(i) { return tape[i] === undefined ? "□" : tape[i]; }
      function rule() { var p = PRESETS[cur]; return p.rules.find(function (r) { return r[0] === state && r[1] === sym(head); }); }
      function step() {
        if (halted) return false;
        var r = rule();
        if (!r) { halted = true; msg.textContent = "No transition for (" + state + ", " + sym(head) + ") — the machine halts (rejects)."; return false; }
        if (r[2] === "□") delete tape[head]; else tape[head] = r[2];
        head += r[3] === "R" ? 1 : r[3] === "L" ? -1 : 0;
        state = r[4]; steps++;
        var p = PRESETS[cur];
        if (state === p.halt || state === "NO" || state === "YES") { halted = true; }
        return !halted;
      }
      function draw() {
        var ctx = cv.ctx; if (ctx && ctx.beginPath) {
          ctx.clearRect(0, 0, cv.W, cv.H);
          var cell = 36, n = Math.floor(cv.W / cell), from = head - Math.floor(n / 2);
          ctx.font = "600 16px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          for (var i = 0; i < n; i++) {
            var idx = from + i, x = i * cell;
            ctx.strokeStyle = COL.line; ctx.fillStyle = idx === head ? A(COL.gold, .25) : COL.ink;
            ctx.fillRect(x + 2, 30, cell - 4, 40); ctx.strokeRect(x + 2, 30, cell - 4, 40);
            ctx.fillStyle = tape[idx] === undefined ? COL.faint : COL.text; ctx.fillText(sym(idx), x + cell / 2, 50);
            ctx.fillStyle = COL.faint; ctx.font = "9px 'IBM Plex Mono', monospace"; ctx.fillText(String(idx), x + cell / 2, 82); ctx.font = "600 16px 'IBM Plex Mono', monospace";
          }
          var hx = (head - from) * cell + cell / 2;
          ctx.fillStyle = COL.crim; ctx.beginPath(); ctx.moveTo(hx, 26); ctx.lineTo(hx - 8, 12); ctx.lineTo(hx + 8, 12); ctx.closePath(); ctx.fill();
          ctx.fillStyle = COL.text; ctx.font = "600 12px 'IBM Plex Mono', monospace"; ctx.textAlign = "left"; ctx.fillText("state " + state, 6, 104);
        }
        var p = PRESETS[cur], r = rule();
        var out = ""; var ks = Object.keys(tape).map(Number); if (ks.length) { var lo = Math.min.apply(null, ks), hi = Math.max.apply(null, ks); for (var j = lo; j <= hi; j++) out += sym(j); }
        read.innerHTML = "tape: <b>" + esc(out || "(blank)") + "</b> · head at " + head + " reading <b>" + esc(sym(head)) + "</b> · state <b>" + esc(state) + "</b> · steps " + steps +
          (halted ? " · <b style='color:var(--good)'>HALTED</b>" : r ? " · next: δ(" + state + ", " + esc(sym(head)) + ") = (" + esc(r[2]) + ", " + r[3] + ", " + r[4] + ")" : "") +
          "<br><span style='color:var(--muted)'>A Turing machine has a finite state set, an infinite tape, and a transition function; □ is the blank symbol. It is a model of computation, not a physical machine — anything computable can be computed by one.</span>";
        tblWrap.innerHTML = "";
        tblWrap.appendChild(table(["state", "read", "write", "move", "next"], p.rules.map(function (row) { return { cells: row.map(esc), cls: row === r && !halted ? "live" : "" }; }), "tm-table"));
      }
      load();
    }
  });

  /* =================== BNF CHECKER =================== */
  KOS.sims.register({
    id: "bnf-checker", title: "BNF Grammar Checker", subject: "compsci", ref: "4.4.3.1",
    desc: "Write production rules in Backus–Naur Form and test strings against them. Recursion (<integer> ::= <digit> | <digit><integer>) is what gives BNF unbounded strings — and what a regular expression or FSM cannot express when nesting must balance.",
    mount: function (panel) {
      var gIn = el("textarea", { class: "note-area", style: "min-height:130px;font-family:var(--mono);font-size:12.5px", "aria-label": "BNF grammar" });
      gIn.value = "<sign> ::= + | -\n<digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9\n<integer> ::= <digit> | <digit><integer>\n<number> ::= <integer> | <sign><number> | <integer>.<integer>";
      var sIn = el("input", { type: "text", value: "-42.7", style: "width:180px;font-family:var(--mono)" });
      var startIn = el("input", { type: "text", value: "number", style: "width:90px;font-family:var(--mono)" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(gIn);
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["start symbol <…>", startIn]), el("label", {}, ["test string", sIn]),
        el("button", { class: "btn primary", text: "Check", onclick: check }),
        el("button", { class: "btn", text: "Try 3.14, +7, 0-1, 12.", onclick: function () { batch(["3.14", "+7", "0-1", "12.", "007"]); } }), msg]));
      var read = readout(); panel.appendChild(read);
      sIn.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
      function parseGrammar() {
        var rules = {};
        gIn.value.split("\n").forEach(function (line) {
          var m = /^\s*<([^>]+)>\s*::=\s*(.*)$/.exec(line); if (!m) return;
          rules[m[1].trim()] = m[2].split("|").map(function (alt) {
            var seq = [], s = alt.trim(), i = 0;
            while (i < s.length) {
              if (s[i] === "<") { var j = s.indexOf(">", i); if (j < 0) { seq.push({ t: s.slice(i) }); break; } seq.push({ nt: s.slice(i + 1, j).trim() }); i = j + 1; }
              else if (s[i] === '"' || s[i] === "'") { var q = s[i], k = s.indexOf(q, i + 1); if (k < 0) k = s.length; seq.push({ t: s.slice(i + 1, k) }); i = k + 1; }
              else if (s[i] === " ") i++;
              else { seq.push({ t: s[i] }); i++; }
            }
            return seq;
          });
        });
        return rules;
      }
      function ends(rules, nt, str, pos, depth, memo) {
        var key = nt + "@" + pos;
        if (memo[key]) return memo[key] === "busy" ? [] : memo[key];
        if (depth > 60) return [];
        memo[key] = "busy";
        var out = {};
        (rules[nt] || []).forEach(function (seq) {
          var positions = [pos];
          seq.forEach(function (tok) {
            var next = {};
            positions.forEach(function (p) {
              if (tok.t !== undefined) { if (str.substr(p, tok.t.length) === tok.t) next[p + tok.t.length] = 1; }
              else ends(rules, tok.nt, str, p, depth + 1, memo).forEach(function (e) { next[e] = 1; });
            });
            positions = Object.keys(next).map(Number);
          });
          positions.forEach(function (p) { out[p] = 1; });
        });
        var res = Object.keys(out).map(Number);
        memo[key] = res; return res;
      }
      function test(str) {
        var rules = parseGrammar(), start = startIn.value.replace(/[<>]/g, "").trim();
        if (!rules[start]) return { ok: false, why: "no rule for <" + start + ">" };
        var e = ends(rules, start, str, 0, 0, {});
        return { ok: e.indexOf(str.length) >= 0, why: e.length ? "longest valid prefix: " + Math.max.apply(null, e) + " chars" : "no alternative matches from the first character" };
      }
      function check() { var r = test(sIn.value); msg.textContent = ""; read.innerHTML = "<b>" + esc(sIn.value) + "</b> → " + (r.ok ? "<b style='color:var(--good)'>VALID</b> — derivable from &lt;" + esc(startIn.value) + "&gt;" : "<b style='color:var(--danger)'>INVALID</b> (" + esc(r.why) + ")") + tail(); }
      function batch(list) { read.innerHTML = list.map(function (s) { var r = test(s); return "<b>" + esc(s) + "</b> → " + (r.ok ? "<span style='color:var(--good)'>valid</span>" : "<span style='color:var(--danger)'>invalid</span>"); }).join("<br>") + tail(); }
      function tail() { return "<br><span style='color:var(--muted)'>Terminals are literal characters; &lt;non-terminals&gt; expand by their rules. Exam habit: check a string by writing the derivation top-down, one rule per line.</span>"; }
      check();
    }
  });

  /* =================== BIG-O PLOT =================== */
  KOS.sims.register({
    id: "big-o-plot", title: "Big-O Growth Curves", subject: "compsci", ref: "4.4.4.3",
    desc: "Plot the standard complexity classes together and drag n to read how many steps each takes. Toggle the logarithmic scale to see why exponential and factorial algorithms are intractable long before n reaches 100.",
    mount: function (panel) {
      var FN = [
        ["O(1)", function () { return 1; }, "hash table lookup"],
        ["O(log n)", function (n) { return Math.log2(Math.max(2, n)); }, "binary search"],
        ["O(n)", function (n) { return n; }, "linear search"],
        ["O(n log n)", function (n) { return n * Math.log2(Math.max(2, n)); }, "merge sort"],
        ["O(n²)", function (n) { return n * n; }, "bubble sort"],
        ["O(2ⁿ)", function (n) { return Math.pow(2, n); }, "subset enumeration"],
        ["O(n!)", function (n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }, "travelling salesman (brute force)"]
      ];
      var n = 20, logScale = true, maxN = 60;
      var sl = slider("n", 1, maxN, 1, n, function (v) { n = v; draw(); });
      var chk = el("input", { type: "checkbox", checked: "checked" }); chk.onchange = function () { logScale = chk.checked; draw(); };
      panel.appendChild(el("div", { class: "lab-controls" }, [sl.node, el("label", { class: "chk", style: "flex-direction:row;align-items:center;gap:6px" }, [chk, "log scale"])]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 320);
      var read = readout(); panel.appendChild(read);
      var colours = [COL.mute, COL.jade, COL.blue, COL.gold, COL.vio, COL.crim, COL.text];
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var padL = 56, padB = 28, padT = 12, W = cv.W - padL - 12, H = cv.H - padT - padB;
        var yMax = logScale ? 40 : 2500;   /* log2 of steps, or steps */
        function Y(v) { var y = logScale ? Math.log2(Math.max(1, v)) : Math.min(v, yMax); return padT + H - y / yMax * H; }
        function X(k) { return padL + k / maxN * W; }
        ctx.strokeStyle = COL.grid; ctx.fillStyle = COL.mute; ctx.font = "10.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
        for (var g = 0; g <= 4; g++) { var yv = padT + H - g / 4 * H; ctx.beginPath(); ctx.moveTo(padL, yv); ctx.lineTo(padL + W, yv); ctx.stroke(); ctx.fillText(logScale ? "2^" + (g * 10) : String(g * yMax / 4), padL - 6, yv); }
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        for (var k = 0; k <= maxN; k += 10) ctx.fillText(String(k), X(k), padT + H + 4);
        FN.forEach(function (f, i) {
          ctx.strokeStyle = colours[i]; ctx.lineWidth = i === 6 ? 1.2 : 2; ctx.beginPath();
          for (k = 1; k <= maxN; k++) { var v = f[1](k); if (!isFinite(v)) break; var px = X(k), py = Y(v); if (py < padT) { ctx.lineTo(px, padT); break; } if (k === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
          ctx.stroke();
        });
        ctx.strokeStyle = COL.text; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(n), padT); ctx.lineTo(X(n), padT + H); ctx.stroke(); ctx.setLineDash([]);
        read.innerHTML = "n = <b>" + n + "</b>: " + FN.map(function (f, i) { var v = f[1](n); return "<span style='color:" + colours[i] + "'>" + f[0] + " ≈ " + (v > 1e15 ? v.toExponential(2) : Math.round(v).toLocaleString()) + "</span>"; }).join(" · ") +
          "<br><span style='color:var(--muted)'>" + FN.map(function (f) { return f[0] + " " + f[2]; }).join(" · ") + ". Polynomial (and better) = tractable; exponential and factorial = intractable — a heuristic gives a good-enough answer instead.</span>";
      }
      draw();
    }
  });

  /* =================== GRAPH TRAVERSAL =================== */
  KOS.sims.register({
    id: "graph-traversal", title: "Graph Traversal — BFS queue vs DFS stack", subject: "compsci", ref: "4.3.1.1",
    desc: "Step breadth-first and depth-first search over the same graph. The data structure driving each one is shown beside the picture: BFS dequeues from a queue and finds shortest paths in unweighted graphs; DFS pops a stack (or recurses) and goes deep first.",
    mount: function (panel) {
      var NODES = { A: [80, 60], B: [220, 40], C: [360, 70], D: [120, 180], E: [270, 170], F: [420, 190], G: [200, 290], H: [360, 300] };
      var EDGES = [["A", "B"], ["A", "D"], ["B", "C"], ["B", "E"], ["C", "F"], ["D", "E"], ["D", "G"], ["E", "F"], ["E", "H"], ["G", "H"], ["F", "H"]];
      var adj = {}; Object.keys(NODES).forEach(function (k) { adj[k] = []; });
      EDGES.forEach(function (e) { adj[e[0]].push(e[1]); adj[e[1]].push(e[0]); });
      Object.keys(adj).forEach(function (k) { adj[k].sort(); });
      var mode = "bfs", start = "A", frontier, visited, order, cur, done;
      var mSel = el("select", {}, [el("option", { value: "bfs", text: "breadth-first (queue)" }), el("option", { value: "dfs", text: "depth-first (stack)" })]);
      var sSel = el("select", {}, Object.keys(NODES).map(function (k) { return el("option", { value: k, text: "start at " + k }); }));
      mSel.onchange = function () { mode = mSel.value; reset(); }; sSel.onchange = function () { start = sSel.value; reset(); };
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["algorithm", mSel]), el("label", {}, ["start", sSel]),
        el("button", { class: "btn primary", text: "Step", onclick: function () { step(); draw(); } }),
        el("button", { class: "btn gold", text: "Run to end", onclick: function () { while (step()) {} draw(); } }),
        el("button", { class: "btn", text: "Reset", onclick: reset })]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 340);
      var read = readout(); panel.appendChild(read);
      function reset() { frontier = [start]; visited = {}; visited[start] = true; order = []; cur = null; done = false; draw(); }
      function step() {
        if (done) return false;
        if (!frontier.length) { done = true; return false; }
        cur = mode === "bfs" ? frontier.shift() : frontier.pop();
        order.push(cur);
        var ns = mode === "bfs" ? adj[cur] : adj[cur].slice().reverse();
        ns.forEach(function (n) { if (!visited[n]) { visited[n] = true; frontier.push(n); } });
        if (!frontier.length) done = true;
        return !done;
      }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var sx = Math.min(1, (cv.W - 200) / 480);
        function P(k) { return [NODES[k][0] * sx + 20, NODES[k][1] * sx + 10]; }
        EDGES.forEach(function (e) { var a = P(e[0]), b = P(e[1]); ctx.strokeStyle = COL.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); });
        Object.keys(NODES).forEach(function (k) {
          var p = P(k), idx = order.indexOf(k);
          ctx.fillStyle = k === cur ? COL.crim : idx >= 0 ? A(COL.jade, .35) : frontier.indexOf(k) >= 0 ? A(COL.gold, .35) : COL.ink;
          ctx.strokeStyle = idx >= 0 ? COL.jade : frontier.indexOf(k) >= 0 ? COL.gold : COL.line; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(p[0], p[1], 18, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = k === cur ? COL.ink : COL.text; ctx.font = "600 13px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(k, p[0], p[1]);
          if (idx >= 0) { ctx.fillStyle = COL.mute; ctx.font = "10px 'IBM Plex Mono', monospace"; ctx.fillText(String(idx + 1), p[0] + 22, p[1] - 14); }
        });
        /* structure panel */
        var x0 = cv.W - 160, y0 = 16;
        ctx.fillStyle = COL.text; ctx.font = "600 12px 'IBM Plex Mono', monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillText(mode === "bfs" ? "QUEUE (front → back)" : "STACK (top ↓)", x0, y0);
        var list = mode === "bfs" ? frontier : frontier.slice().reverse();
        list.forEach(function (k, i) { ctx.fillStyle = A(COL.gold, .3); ctx.strokeStyle = COL.gold; ctx.fillRect(x0, y0 + 22 + i * 26, 60, 22); ctx.strokeRect(x0, y0 + 22 + i * 26, 60, 22); ctx.fillStyle = COL.text; ctx.textBaseline = "middle"; ctx.fillText(k, x0 + 24, y0 + 33 + i * 26); ctx.textBaseline = "top"; });
        if (!list.length) { ctx.fillStyle = COL.faint; ctx.fillText("(empty)", x0, y0 + 24); }
        ctx.fillStyle = COL.text; ctx.fillText("visited: " + order.join(" "), x0, y0 + 22 + Math.max(list.length, 1) * 26 + 10);
        read.innerHTML = "<b>" + (mode === "bfs" ? "BFS" : "DFS") + " from " + start + "</b> · order so far: <b>" + (order.join(" → ") || "—") + "</b>" + (done ? " · <span style='color:var(--good)'>complete</span>" : "") +
          "<br><span style='color:var(--muted)'>" + (mode === "bfs" ? "Mark the start visited and enqueue it; repeatedly dequeue, then enqueue each unvisited neighbour (marking it). Visits in layers of increasing distance — the basis of shortest paths in unweighted graphs."
            : "Push the start; repeatedly pop, visit, and push unvisited neighbours. Equivalent to the recursive version, whose call stack does the same job. Neighbours are pushed in reverse so A's smallest neighbour is explored first.") + "</span>";
      }
      reset();
    }
  });

  /* =================== FLOATING POINT BITS =================== */
  KOS.sims.register({
    id: "float-bits", title: "Floating Point — mantissa & exponent bits", subject: "compsci", ref: "4.5.4.4",
    desc: "Click bits of an 8-bit two's complement mantissa and 4-bit two's complement exponent. The value, the working and the normalisation check update instantly — and a Normalise button shows the shift that fixes an un-normalised pattern.",
    mount: function (panel) {
      var M = [0, 1, 0, 1, 1, 0, 0, 0], E = [0, 0, 1, 1];
      var row = el("div", { class: "logic-switches", style: "margin:6px 0 12px" });
      var read = readout();
      panel.appendChild(el("div", { class: "lab-controls" }, [
        el("button", { class: "btn primary", text: "Normalise", onclick: normalise }),
        el("button", { class: "btn", text: "Largest positive", onclick: function () { M = [0, 1, 1, 1, 1, 1, 1, 1]; E = [0, 1, 1, 1]; render(); } }),
        el("button", { class: "btn", text: "Smallest positive", onclick: function () { M = [0, 1, 0, 0, 0, 0, 0, 0]; E = [1, 0, 0, 0]; render(); } }),
        el("button", { class: "btn", text: "Most negative", onclick: function () { M = [1, 0, 0, 0, 0, 0, 0, 0]; E = [0, 1, 1, 1]; render(); } }),
        el("span", { class: "sim-msg", text: "click a bit to flip it" })]));
      panel.appendChild(row); panel.appendChild(read);
      function twos(bits) { var v = 0; bits.forEach(function (b, i) { v += b * Math.pow(2, bits.length - 1 - i) * (i === 0 ? -1 : 1); }); return v; }
      function mant() { var v = 0; M.forEach(function (b, i) { v += b * Math.pow(2, -i) * (i === 0 ? -1 : 1); }); return v; }
      function render() {
        row.innerHTML = "";
        function group(bits, label, tint) {
          var g = el("div", { style: "display:flex;align-items:center;gap:4px;margin-right:14px" });
          g.appendChild(el("span", { class: "specref", text: label, style: "margin-right:4px" }));
          bits.forEach(function (b, i) {
            var btn = el("button", { class: "logic-sw" + (b ? " on" : ""), style: "min-width:34px;padding:6px 4px", onclick: function () { bits[i] = 1 - bits[i]; render(); } },
              [el("span", { text: i === 0 ? "−" + (label === "mantissa" ? "1" : String(Math.pow(2, bits.length - 1))) : (label === "mantissa" ? "2⁻" + i : String(Math.pow(2, bits.length - 1 - i))), style: "font-size:9px" }), el("b", { text: String(b), style: "font-size:16px" })]);
            g.appendChild(btn);
            if (label === "mantissa" && i === 0) g.appendChild(el("span", { text: ".", style: "font-size:20px;font-weight:700" }));
          });
          row.appendChild(g);
        }
        group(M, "mantissa"); group(E, "exponent");
        var m = mant(), e = twos(E), val = m * Math.pow(2, e);
        var normal = (M[0] === 0 && M[1] === 1) || (M[0] === 1 && M[1] === 0);
        read.innerHTML = "mantissa " + M.join("") + " = <b>" + m + "</b> (sign bit worth −1, then ½, ¼, …) · exponent " + E.join("") + " = <b>" + e + "</b>" +
          "<br>value = mantissa × 2<sup>exponent</sup> = " + m + " × 2<sup>" + e + "</sup> = <b>" + val + "</b>" +
          "<br>" + (normal ? "<span style='color:var(--good)'>normalised</span> — the first two bits differ (0.1… or 1.0…), so precision is maximised" : "<span style='color:var(--danger)'>not normalised</span> — the first two bits are the same; shift the mantissa and adjust the exponent") +
          "<br><span style='color:var(--muted)'>Range vs precision: more exponent bits widen the range; more mantissa bits sharpen the precision. Both are fixed by the format, so it is a trade-off.</span>";
      }
      function normalise() {
        var m = mant(), e = twos(E);
        if (m === 0) { KOS.ui.toast("Zero has no normalised form."); return; }
        var guard = 0;
        while (!((M[0] === 0 && M[1] === 1) || (M[0] === 1 && M[1] === 0)) && guard++ < 8) { M.splice(1, 1); M.push(0); e--; }
        if (e < -8 || e > 7) { KOS.ui.toast("Exponent out of range for 4 bits — underflow.", true); }
        E = [0, 0, 0, 0]; var v = e < 0 ? e + 16 : e; for (var i = 3; i >= 0; i--) { E[i] = v & 1; v >>= 1; }
        render();
      }
      render();
    }
  });

  /* =================== CHARACTER CODES =================== */
  KOS.sims.register({
    id: "char-codes", title: "ASCII & Unicode — see the codes", subject: "compsci", ref: "4.5.5.2",
    desc: "Type text and read each character's code in denary, hex and binary. ASCII covers 128 characters in 7 bits; anything beyond — accented letters, kana, emoji — needs Unicode, and UTF-8 shows how many bytes that costs.",
    mount: function (panel) {
      var inp = el("input", { type: "text", value: "Hi! 7 é 漢 😀", style: "width:300px", "aria-label": "text" });
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["text", inp])]));
      var out = el("div", {}); panel.appendChild(out);
      var read = readout(); panel.appendChild(read);
      function utf8len(cp) { return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4; }
      function render() {
        var chars = Array.from(inp.value), total = 0;
        var rows = chars.map(function (ch) {
          var cp = ch.codePointAt(0), bytes = utf8len(cp); total += bytes;
          var ascii = cp < 128;
          return { cells: [esc(ch === " " ? "␠" : ch), String(cp), "0x" + cp.toString(16).toUpperCase(), ascii ? pad(cp.toString(2), 8) : "U+" + pad(cp.toString(16).toUpperCase(), 4), ascii ? "ASCII" : "Unicode only", String(bytes)], cls: ascii ? "" : "live" };
        });
        out.innerHTML = ""; out.appendChild(table(["char", "denary", "hex", "binary / code point", "set", "UTF-8 bytes"], rows));
        read.innerHTML = chars.length + " characters · <b>" + total + " bytes in UTF-8</b> · " + chars.length + " bytes if every character were plain ASCII" +
          "<br><span style='color:var(--muted)'>ASCII: 7 bits, 128 codes; digits '0'–'9' are 48–57 so a digit's value is code − 48; 'A' = 65, 'a' = 97 (differ by 32, one bit). Unicode assigns a unique code point to every character in every writing system; UTF-8 encodes ASCII in one byte and other code points in 2–4.</span>";
      }
      inp.oninput = render; render();
    }
  });

  /* =================== ERROR CHECKING LAB =================== */
  KOS.sims.register({
    id: "error-check-lab", title: "Error Checking — parity, majority vote, checksum, check digit", subject: "compsci", ref: "4.5.5.3",
    desc: "Flip bits in a transmitted byte and see which schemes catch it. Parity detects an odd number of flipped bits and nothing else; majority voting corrects; a checksum guards a whole block; a check digit protects a typed-in number.",
    mount: function (panel) {
      var data = [1, 0, 1, 1, 0, 0, 1], parity = "even", sent, recv;
      var pSel = el("select", {}, [el("option", { value: "even", text: "even parity" }), el("option", { value: "odd", text: "odd parity" })]);
      pSel.onchange = function () { parity = pSel.value; resend(); };
      var wrap = el("div", { class: "logic-switches", style: "margin:6px 0 12px" });
      var read = readout();
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["scheme", pSel]),
        el("button", { class: "btn primary", text: "Resend clean", onclick: resend }),
        el("span", { class: "sim-msg", text: "click received bits to corrupt them" })]));
      panel.appendChild(wrap); panel.appendChild(read);
      function pbit(bits) { var ones = bits.reduce(function (a, b) { return a + b; }, 0); return parity === "even" ? ones % 2 : 1 - ones % 2; }
      function resend() { sent = [pbit(data)].concat(data); recv = sent.slice(); render(); }
      function render() {
        wrap.innerHTML = "";
        function group(bits, label, clickable) {
          var g = el("div", { style: "display:flex;align-items:center;gap:4px;margin-right:18px" });
          g.appendChild(el("span", { class: "specref", text: label, style: "margin-right:4px" }));
          bits.forEach(function (b, i) {
            var btn = el("button", { class: "logic-sw" + (b ? " on" : "") + (clickable && b !== sent[i] ? " flipped" : ""), style: "min-width:30px;padding:5px 3px" + (i === 0 ? ";border-style:dashed" : ""),
              onclick: clickable ? function () { recv[i] = 1 - recv[i]; render(); } : null },
              [el("span", { text: i === 0 ? "P" : "d" + i, style: "font-size:9px" }), el("b", { text: String(b), style: "font-size:15px" })]);
            g.appendChild(btn);
          });
          wrap.appendChild(g);
        }
        group(sent, "sent", false); group(recv, "received", true);
        var flipped = recv.filter(function (b, i) { return b !== sent[i]; }).length;
        var ones = recv.reduce(function (a, b) { return a + b; }, 0);
        var ok = parity === "even" ? ones % 2 === 0 : ones % 2 === 1;
        /* majority vote on three copies of bit d1 with the same flips applied to copy 2 only */
        var copies = [sent[1], recv[1], sent[1]], vote = copies.reduce(function (a, b) { return a + b; }, 0) >= 2 ? 1 : 0;
        var byteVal = parseInt(data.join(""), 2), block = [byteVal, 37, 200, 91], sum = block.reduce(function (a, b) { return a + b; }, 0) % 256;
        var isbn = "978014300723", cd = (10 - isbn.split("").reduce(function (a, d, i) { return a + parseInt(d, 10) * (i % 2 ? 3 : 1); }, 0) % 10) % 10;
        read.innerHTML = "received has " + ones + " ones → " + parity + " parity " + (ok ? "<b style='color:var(--good)'>passes</b>" : "<b style='color:var(--danger)'>FAILS — error detected</b>") +
          (flipped ? " · actually " + flipped + " bit(s) corrupted" + (ok ? " — <span style='color:var(--danger)'>an even number of flips slips past parity</span>" : "") : " · no corruption") +
          "<br>majority voting on d1 (three copies " + copies.join("") + ") → <b>" + vote + "</b>" + (vote === sent[1] ? " ✓ corrected/confirmed" : "") +
          " · checksum of block [" + block.join(", ") + "] = (sum mod 256) = <b>" + sum + "</b>, sent with the block and recomputed on arrival" +
          "<br>check digit: ISBN-13 prefix " + isbn + " → weights 1,3,1,3… → <b>" + cd + "</b> (catches a mistyped or transposed digit)" +
          "<br><span style='color:var(--muted)'>Parity and checksums detect; majority voting and more advanced codes correct. Parity adds one bit per byte; majority voting triples the data.</span>";
      }
      resend();
    }
  });

  /* =================== ADC SAMPLING =================== */
  KOS.sims.register({
    id: "adc-sampling", title: "Analogue → Digital — sample rate & resolution", subject: "compsci", ref: "4.5.6.3",
    desc: "An analogue wave is sampled at a rate you choose and quantised to a bit depth you choose. Watch the staircase reconstruction drift from the original as you cut either, and read the file size the settings imply (Nyquist: sample at twice the highest frequency).",
    mount: function (panel) {
      var rate = 12, bits = 3, freq = 1.5, secs = 30;
      var s1 = slider("sample rate (Hz)", 2, 60, 1, rate, function (v) { rate = v; draw(); });
      var s2 = slider("resolution (bits)", 1, 8, 1, bits, function (v) { bits = v; draw(); });
      var s3 = slider("signal frequency (Hz)", 0.5, 6, 0.5, freq, function (v) { freq = v; draw(); }, function (v) { return v.toFixed(1); });
      panel.appendChild(el("div", { class: "lab-controls" }, [s1.node, s2.node, s3.node]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 300);
      var read = readout(); panel.appendChild(read);
      function sig(t) { return 0.6 * Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2.7 * t + 1); }
      function draw() {
        var ctx = cv.ctx; if (!ctx || !ctx.beginPath) return;
        ctx.clearRect(0, 0, cv.W, cv.H);
        var padL = 40, W = cv.W - padL - 10, H = cv.H - 40, mid = 20 + H / 2, levels = Math.pow(2, bits);
        function X(t) { return padL + t / 2 * W; } function Y(v) { return mid - v * H / 2; }
        ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
        for (var l = 0; l < levels; l++) { var v = -1 + (l + 0.5) * 2 / levels; ctx.beginPath(); ctx.moveTo(padL, Y(v)); ctx.lineTo(padL + W, Y(v)); ctx.stroke(); }
        ctx.strokeStyle = COL.line; ctx.beginPath(); ctx.moveTo(padL, mid); ctx.lineTo(padL + W, mid); ctx.stroke();
        ctx.strokeStyle = A(COL.text, .55); ctx.lineWidth = 1.6; ctx.beginPath();
        for (var i = 0; i <= W; i++) { var t = i / W * 2, y = Y(sig(t)); if (i) ctx.lineTo(padL + i, y); else ctx.moveTo(padL + i, y); }
        ctx.stroke();
        var n = Math.floor(2 * rate), err = 0, prevY = null;
        ctx.strokeStyle = COL.crim; ctx.lineWidth = 2; ctx.beginPath();
        for (i = 0; i <= n; i++) {
          t = i / rate; if (t > 2) break;
          var s = sig(t), q = Math.max(0, Math.min(levels - 1, Math.floor((s + 1) / 2 * levels))), qv = -1 + (q + 0.5) * 2 / levels;
          err += Math.abs(qv - s);
          var x = X(t), y = Y(qv);
          if (prevY === null) ctx.moveTo(x, y); else { ctx.lineTo(x, prevY); ctx.lineTo(x, y); }
          prevY = y;
          ctx.fillStyle = COL.gold; ctx.fillRect(x - 2, y - 2, 4, 4);
        }
        ctx.lineTo(padL + W, prevY); ctx.stroke();
        ctx.fillStyle = COL.mute; ctx.font = "10.5px 'IBM Plex Mono', monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top"; ctx.fillText(levels + " levels (" + bits + "-bit)", padL + 4, 4);
        var size = rate * bits * secs;
        var maxF = freq * 2.7;
        read.innerHTML = "samples per second <b>" + rate + "</b> · <b>" + levels + "</b> quantisation levels · mean quantisation error " + (err / Math.max(1, n)).toFixed(3) +
          " · Nyquist: highest component " + maxF.toFixed(1) + " Hz needs ≥ " + (2 * maxF).toFixed(0) + " Hz " + (rate >= 2 * maxF ? "<span style='color:var(--good)'>✓</span>" : "<span style='color:var(--danger)'>✗ aliasing — the reconstruction invents a lower frequency</span>") +
          "<br>file size = sample rate × resolution × seconds = " + rate + " × " + bits + " × " + secs + " = <b>" + size.toLocaleString() + " bits</b> = " + (size / 8).toLocaleString() + " bytes for " + secs + " s (mono)" +
          "<br><span style='color:var(--muted)'>Grey: analogue signal. Red staircase: digital reconstruction. Higher rate → follows the shape; more bits → smaller steps. Both raise the file size linearly.</span>";
      }
      draw();
    }
  });

  /* =================== BITMAP LAB =================== */
  KOS.sims.register({
    id: "bitmap-lab", title: "Bitmap Lab — pixels, colour depth, file size", subject: "compsci", ref: "4.5.6.4",
    desc: "Paint an 8×8 bitmap at 1, 2 or 4 bits per pixel and read its bit pattern row by row. The file-size line shows why resolution × colour depth is the whole story (before metadata), and why a vector shape does not scale that way.",
    mount: function (panel) {
      var N = 8, depth = 1, grid = [], colour = 1;
      for (var i = 0; i < N * N; i++) grid.push(0);
      [[3, 3], [4, 3], [2, 4], [5, 4], [3, 5], [4, 5], [1, 2], [6, 2]].forEach(function (p) { grid[p[1] * N + p[0]] = 1; });
      var PAL = ["#f5f1e8", "#1c1a17", "#b5573f", "#6f9a5e", "#5d6ba8", "#a97f2f", "#c0912f", "#7d9b76", "#d9a8bc", "#42c6d0", "#8b5cff", "#e67f74", "#87aaff", "#4d8d67", "#d16e67", "#726751"];
      var dSel = el("select", {}, [1, 2, 4].map(function (d) { return el("option", { value: d, text: d + " bit" + (d > 1 ? "s" : "") + " per pixel (" + Math.pow(2, d) + " colours)" }); }));
      dSel.onchange = function () { depth = parseInt(dSel.value, 10); var mx = Math.pow(2, depth) - 1; grid = grid.map(function (v) { return Math.min(v, mx); }); colour = Math.min(colour, mx); render(); };
      var palRow = el("div", { class: "logic-switches", style: "margin:0 0 10px" });
      var res = el("select", {}, [8, 16, 32].map(function (r) { return el("option", { value: r, text: r + "×" + r + " for the size sum" }); }));
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["colour depth", dSel]), el("label", {}, ["resolution", res]), el("button", { class: "btn", text: "Clear", onclick: function () { grid = grid.map(function () { return 0; }); render(); } })]));
      panel.appendChild(palRow);
      var gridEl = el("div", { class: "bitmap-grid", style: "grid-template-columns:repeat(" + N + ", 28px)" });
      panel.appendChild(el("div", { style: "display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start" }, [gridEl, el("div", { style: "flex:1;min-width:220px" }, [readoutHolder()])]));
      var read = panel.querySelector(".sim-read");
      res.onchange = render;
      function readoutHolder() { return readout(); }
      function render() {
        palRow.innerHTML = "";
        for (var c = 0; c < Math.pow(2, depth); c++) (function (c) {
          palRow.appendChild(el("button", { class: "bitmap-swatch" + (c === colour ? " on" : ""), style: "background:" + PAL[c], title: "colour " + c + " = " + pad(c.toString(2), depth), onclick: function () { colour = c; render(); } }, [el("span", { text: pad(c.toString(2), depth) })]));
        })(c);
        gridEl.innerHTML = "";
        grid.forEach(function (v, i) {
          gridEl.appendChild(el("button", { class: "bitmap-px", style: "background:" + PAL[v], "aria-label": "pixel " + i, onclick: function () { grid[i] = grid[i] === colour ? 0 : colour; render(); } }));
        });
        var rows = [];
        for (var r = 0; r < N; r++) rows.push(grid.slice(r * N, r * N + N).map(function (v) { return pad(v.toString(2), depth); }).join(" "));
        var R = parseInt(res.value, 10), bitsTotal = R * R * depth;
        read.innerHTML = "<div style='font-size:11px;line-height:1.5'>" + rows.join("<br>") + "</div>" +
          "file size = width × height × colour depth = " + R + " × " + R + " × " + depth + " = <b>" + bitsTotal.toLocaleString() + " bits</b> = " + (bitsTotal / 8).toLocaleString() + " bytes (+ metadata: dimensions, depth, colour palette)" +
          "<br><span style='color:var(--muted)'>Doubling the resolution quadruples the size; adding a bit of depth doubles the colours but adds only one bit per pixel. A vector image stores shapes as instructions, so it scales without pixelation and its size depends on the number of objects, not the canvas.</span>";
      }
      render();
    }
  });

  /* =================== COMPRESSION LAB =================== */
  KOS.sims.register({
    id: "compression-lab", title: "Compression — run-length & dictionary", subject: "compsci", ref: "4.5.6.9",
    desc: "Type text and watch run-length encoding and dictionary coding compress it (or fail to). Both are lossless; the read-out shows the ratio and where each method wins — repeated symbols for RLE, repeated words for dictionaries.",
    mount: function (panel) {
      var inp = el("textarea", { class: "note-area", style: "min-height:70px;font-family:var(--mono);font-size:12.5px", "aria-label": "text to compress" });
      inp.value = "AAAAAABBBCCCCCCCCDAA the cat sat on the mat and the cat sat";
      panel.appendChild(inp);
      panel.appendChild(el("div", { class: "lab-controls" }, [el("button", { class: "btn primary", text: "Compress", onclick: run }),
        el("button", { class: "btn", text: "Image-like row", onclick: function () { inp.value = "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW"; run(); } }),
        el("button", { class: "btn", text: "Prose", onclick: function () { inp.value = "to be or not to be that is the question whether tis nobler in the mind to suffer"; run(); } })]));
      var read = readout(); panel.appendChild(read);
      inp.addEventListener("input", run);
      function rle(s) { var out = [], i = 0; while (i < s.length) { var j = i; while (j < s.length && s[j] === s[i]) j++; out.push((j - i) + s[i]); i = j; } return out; }
      function dict(s) {
        var words = s.split(/(\s+)/).filter(function (w) { return w.length; }), table = [], idx = {};
        var tokens = words.map(function (w) { if (/^\s+$/.test(w)) return null; if (idx[w] === undefined) { idx[w] = table.length; table.push(w); } return idx[w]; }).filter(function (t) { return t !== null; });
        return { table: table, tokens: tokens };
      }
      function run() {
        var s = inp.value, raw = s.length;
        var r = rle(s), rleTxt = r.join(""), rleBytes = r.length * 2;
        var d = dict(s), tableBytes = d.table.join("").length + d.table.length, tokenBytes = d.tokens.length, dictBytes = tableBytes + tokenBytes;
        function ratio(b) { return raw ? (100 * b / raw).toFixed(0) + "% of original" : "—"; }
        read.innerHTML = "original: <b>" + raw + " bytes</b> (1 byte per character)" +
          "<br><b>RLE</b> → " + esc(rleTxt.slice(0, 120)) + (rleTxt.length > 120 ? "…" : "") + " · " + r.length + " (count, symbol) pairs ≈ <b>" + rleBytes + " bytes</b> · " + ratio(rleBytes) + (rleBytes >= raw ? " <span style='color:var(--danger)'>— bigger! RLE needs long runs</span>" : " <span style='color:var(--good)'>✓</span>") +
          "<br><b>dictionary</b> → table [" + d.table.slice(0, 12).map(function (w, i) { return i + ":" + esc(w); }).join(" ") + (d.table.length > 12 ? " …" : "") + "] + tokens " + d.tokens.slice(0, 30).join(",") + (d.tokens.length > 30 ? "…" : "") +
          " ≈ <b>" + dictBytes + " bytes</b> (" + tableBytes + " table + " + tokenBytes + " tokens) · " + ratio(dictBytes) + (dictBytes >= raw ? " <span style='color:var(--danger)'>— no repeated words to exploit</span>" : " <span style='color:var(--good)'>✓</span>") +
          "<br><span style='color:var(--muted)'>Both are lossless: the original is rebuilt exactly. Lossy compression (JPEG, MP3) discards detail the eye or ear will not miss and cannot be undone.</span>";
      }
      run();
    }
  });

  /* =================== CIPHER LAB =================== */
  KOS.sims.register({
    id: "cipher-lab", title: "Cipher Lab — Caesar, Vernam & frequency analysis", subject: "compsci", ref: "4.5.6.10",
    desc: "Encrypt with a Caesar shift and watch the letter-frequency bars simply slide along — which is why it falls to frequency analysis. Switch to a Vernam one-time pad and the bars flatten: with a truly random key as long as the message, used once, it is perfectly secure.",
    mount: function (panel) {
      var mode = "caesar", shift = 3, key = "XMCKLQZBTPRVWJDG";
      var mSel = el("select", {}, [el("option", { value: "caesar", text: "Caesar shift" }), el("option", { value: "vernam", text: "Vernam (one-time pad, XOR-style)" })]);
      mSel.onchange = function () { mode = mSel.value; run(); };
      var sl = slider("shift", 0, 25, 1, shift, function (v) { shift = v; run(); });
      var keyIn = el("input", { type: "text", value: key, style: "width:200px;font-family:var(--mono)" });
      keyIn.oninput = function () { key = keyIn.value.toUpperCase().replace(/[^A-Z]/g, ""); run(); };
      var txt = el("textarea", { class: "note-area", style: "min-height:60px", "aria-label": "plaintext" });
      txt.value = "the quick brown fox jumps over the lazy dog and the sleepy cat watches";
      panel.appendChild(txt);
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["cipher", mSel]), sl.node, el("label", {}, ["pad key (A–Z)", keyIn]),
        el("button", { class: "btn", text: "Random pad", onclick: function () { key = ""; for (var i = 0; i < 80; i++) key += String.fromCharCode(65 + Math.floor(Math.random() * 26)); keyIn.value = key; run(); } })]));
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = canvas(holder, 170);
      var read = readout(); panel.appendChild(read);
      txt.addEventListener("input", run);
      function enc(s) {
        var ki = 0;
        return s.toUpperCase().split("").map(function (ch) {
          var c = ch.charCodeAt(0) - 65; if (c < 0 || c > 25) return ch;
          if (mode === "caesar") return String.fromCharCode(65 + (c + shift) % 26);
          var k = key.length ? key.charCodeAt(ki++ % key.length) - 65 : 0;
          return String.fromCharCode(65 + (c + k) % 26);
        }).join("");
      }
      function freq(s) { var f = []; for (var i = 0; i < 26; i++) f.push(0); s.toUpperCase().split("").forEach(function (ch) { var c = ch.charCodeAt(0) - 65; if (c >= 0 && c < 26) f[c]++; }); return f; }
      function run() {
        var plain = txt.value, cipher = enc(plain);
        var ctx = cv.ctx; if (ctx && ctx.beginPath) {
          ctx.clearRect(0, 0, cv.W, cv.H);
          var fp = freq(plain), fc = freq(cipher), mx = Math.max(1, Math.max.apply(null, fp.concat(fc)));
          var bw = (cv.W - 20) / 26;
          for (var i = 0; i < 26; i++) {
            var x = 10 + i * bw;
            ctx.fillStyle = A(COL.mute, .5); ctx.fillRect(x + 1, 70 - fp[i] / mx * 60, bw / 2 - 1, fp[i] / mx * 60);
            ctx.fillStyle = COL.crim; ctx.fillRect(x + bw / 2, 70 - fc[i] / mx * 60, bw / 2 - 1, fc[i] / mx * 60);
            ctx.fillStyle = COL.mute; ctx.font = "10px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillText(String.fromCharCode(65 + i), x + bw / 2, 74);
          }
          ctx.fillStyle = COL.text; ctx.textAlign = "left"; ctx.font = "11px 'IBM Plex Mono', monospace";
          ctx.fillText("grey: plaintext letter frequency   red: ciphertext", 10, 100);
          var reuse = mode === "vernam" && key.length && key.length < plain.replace(/[^a-z]/gi, "").length;
          ctx.fillStyle = reuse ? COL.crim : COL.mute; ctx.fillText(mode === "vernam" ? (reuse ? "key shorter than message → pad reused → patterns leak" : "key ≥ message length, random, used once → unbreakable") : "the whole histogram shifts by " + shift + " — E's peak gives the shift away", 10, 118);
        }
        read.innerHTML = "ciphertext: <b>" + esc(cipher) + "</b>" +
          "<br><span style='color:var(--muted)'>" + (mode === "caesar" ? "Caesar: each letter moves a fixed number of places; 25 possible keys, so brute force or frequency analysis breaks it in seconds." : "Vernam: each letter is combined with the corresponding key letter (here modulo-26 addition; with bits it is XOR). Security depends on the key being truly random, as long as the message, kept secret and never reused.") + "</span>";
      }
      run();
    }
  });

  /* =================== SUBNET LAB =================== */
  KOS.sims.register({
    id: "subnet-lab", title: "IP Addressing & Subnet Masks", subject: "compsci", ref: "4.9.4.4",
    desc: "Enter an IPv4 address and a mask (or /prefix) to split it into network and host parts, bit by bit. A second address tells you whether the two hosts share a subnet — the exact question the AND operation answers in a router.",
    mount: function (panel) {
      var ipIn = el("input", { type: "text", value: "192.168.10.77", style: "width:150px;font-family:var(--mono)" });
      var maskIn = el("input", { type: "text", value: "/26", style: "width:150px;font-family:var(--mono)" });
      var ip2In = el("input", { type: "text", value: "192.168.10.130", style: "width:150px;font-family:var(--mono)" });
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("div", { class: "lab-controls" }, [el("label", {}, ["IP address", ipIn]), el("label", {}, ["mask or /prefix", maskIn]), el("label", {}, ["second host", ip2In]),
        el("button", { class: "btn primary", text: "Work it out", onclick: run }), msg]));
      var out = el("div", {}); panel.appendChild(out);
      var read = readout(); panel.appendChild(read);
      [ipIn, maskIn, ip2In].forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); }); });
      function parseIp(s) { var p = s.trim().split("."); if (p.length !== 4) return null; var v = p.map(Number); if (v.some(function (x) { return !Number.isInteger(x) || x < 0 || x > 255; })) return null; return v; }
      function bin(o) { return o.map(function (x) { return pad(x.toString(2), 8); }); }
      function run() {
        msg.textContent = "";
        var ip = parseIp(ipIn.value), ip2 = parseIp(ip2In.value), mask, prefix;
        var m = /^\/?(\d{1,2})$/.exec(maskIn.value.trim());
        if (m) { prefix = parseInt(m[1], 10); if (prefix < 0 || prefix > 32) { msg.textContent = "prefix must be 0–32"; return; } mask = [0, 0, 0, 0]; for (var i = 0; i < 32; i++) if (i < prefix) mask[Math.floor(i / 8)] |= 128 >> (i % 8); }
        else { mask = parseIp(maskIn.value); if (!mask) { msg.textContent = "mask must be dotted decimal or /prefix"; return; } var bits = bin(mask).join(""); if (!/^1*0*$/.test(bits)) { msg.textContent = "not a valid mask — ones must be contiguous"; return; } prefix = bits.indexOf("0") < 0 ? 32 : bits.indexOf("0"); }
        if (!ip) { msg.textContent = "IP must be four numbers 0–255"; return; }
        var net = ip.map(function (o, i) { return o & mask[i]; }), bc = ip.map(function (o, i) { return o | (~mask[i] & 255); });
        var hostBits = 32 - prefix, hosts = hostBits >= 2 ? Math.pow(2, hostBits) - 2 : hostBits === 1 ? 2 : 1;
        var first = net.slice(), last = bc.slice(); if (hostBits >= 2) { first[3] += 1; last[3] -= 1; }
        function row(label, o, cls) { var b = bin(o).join(""); return { cells: [label, o.join("."), "<span class='subnet-net'>" + b.slice(0, prefix) + "</span><span class='subnet-host'>" + b.slice(prefix) + "</span>"], cls: cls || "" }; }
        out.innerHTML = ""; out.appendChild(table(["", "dotted decimal", "binary (network | host)"], [row("address", ip), row("mask /" + prefix, mask), row("AND → network", net, "live"), row("broadcast", bc)]));
        var same = ip2 ? ip2.every(function (o, i) { return (o & mask[i]) === net[i]; }) : null;
        read.innerHTML = "network ID <b>" + net.join(".") + "/" + prefix + "</b> · host part " + hostBits + " bits → <b>" + hosts.toLocaleString() + " usable hosts</b> (" + first.join(".") + " – " + last.join(".") + ") · broadcast " + bc.join(".") +
          "<br>second host " + (ip2 ? ip2.join(".") + " AND mask = " + ip2.map(function (o, i) { return o & mask[i]; }).join(".") + " → " + (same ? "<b style='color:var(--good)'>same subnet — deliver directly</b>" : "<b style='color:var(--danger)'>different subnet — send via the gateway/router</b>") : "invalid") +
          "<br><span style='color:var(--muted)'>The mask's 1s cover the network ID; the router ANDs a destination with the mask and compares. Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 — not routable on the public Internet (NAT translates them).</span>";
      }
      run();
    }
  });

})();
