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
    "compsci:4.5.4.1": ["binary-number"],
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
         on both 4.5.4.1 and 4.5.4.4) … */
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

  /* two Trace Lab structures, mounted INLINE on their topic's Simulate tab
     (KOS.traceLabs lives in trace.js, which loads before this file); the
     linked list and the BST are 20a diagrams in sims-structures.js */
  [["tl-stack","Stack push / pop / peek","stack","compsci","4.2.3.1"],
   ["tl-queue","Linear & circular queue","queue","compsci","4.2.2.1"]
  ].forEach(function (t) {
    KOS.sims.register({ id: t[0], title: t[1], subject: t[3], ref: t[4], trace: true,
      desc: "Animated canvas with pointer arithmetic and a live trace table.",
      mount: function (panel) { KOS.traceLabs.mount(t[2], panel); } });
  });

  function dprCanvas(holder, h) {
    var c = el("canvas", { class: "k-lab-canvas" });
    holder.appendChild(c);
    var dpr = window.devicePixelRatio || 1;
    var W = (holder.clientWidth || 880) - 2;
    c.width = W * dpr; c.height = h * dpr; c.style.setProperty("--h", h + "px");
    var ctx = c.getContext("2d");
    if (ctx && ctx.scale) ctx.scale(dpr, dpr);
    return { c: c, ctx: ctx, W: W, H: h };
  }
  /* COL resolves against the live theme on every read (KOS.labPalette caches
     per theme), so a canvas repainted after a theme switch picks up the new
     ink instead of the old fixed dark palette. */
  var COL = {};
  ["ink","line","grid","text","mute","faint","crim","gold","jade","blue","vio","sage"].forEach(function (k) {
    Object.defineProperty(COL, k, { get: function () { return KOS.labPalette()[k]; } });
  });
  function wash(hex, a) { return KOS.labPalette().alpha(hex, a); }
  KOS.sims.canvas = dprCanvas;
  KOS.sims.COL = COL;

  /* =================== 1. LOGIC LAB =================== */
  KOS.sims.register({
    id: "logic-lab", title: "Boolean Logic Lab", subject: "compsci", ref: "4.6.2.1",
    desc: "Type any Boolean expression, flip the input switches, and watch the truth table highlight the live row.",
    mount: function (panel) {
      var exprIn = el("input", { type: "text", value: "A.B + ¬C", style: "--w: 260px",
        "aria-label": "Boolean expression" });
      var msg = el("span", { class: "k-lab-msg", "data-ui": "lab.message" });
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [
        el("label", {}, ["expression (use . + ¬ xor, or AND OR NOT)", exprIn]),
        el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "Build", onclick: build }), msg
      ]));
      var switches = el("div", { class: "k-lab-switches", "data-ui": "lab.logic-switches" });
      var lamp = el("div", { class: "k-lab-lamp" });
      panel.appendChild(el("div", { class: "k-lab-live" }, [switches, lamp]));
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
          var sw = el("button", { type: "button", class: "k-lab-switch", "data-ui": "lab.logic-switch", "data-state": env[n] ? "on" : null,
            onclick: function () { env[n] = !env[n]; KOS.ui.state(sw, "on", env[n]); sw.querySelector("b").textContent = env[n] ? "1" : "0"; renderTable(); } },
            [el("span", { text: n }), el("b", { text: env[n] ? "1" : "0" })]);
          switches.appendChild(sw);
        });
        if (!names.length) switches.appendChild(el("span", { class: "k-lab-msg", "data-ui": "lab.message", text: "constant expression" }));
      }
      function renderTable() {
        var out = evalNode(ast, env);
        KOS.ui.state(lamp, "on", !!out);
        KOS.ui.state(lamp, "off", !out);
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
        var html = '<table class="k-n-table k-lab-tt" data-ui="content.table lab.truth-table"><thead><tr>' +
          names.map(function (nm) { return "<th>" + nm + "</th>"; }).join("") +
          "<th>Q</th></tr></thead><tbody>" +
          rows.map(function (r) {
            return '<tr' + (r.live ? ' data-state="live"' : '') + '>' +
              r.cells.map(function (c) { return "<td>" + c + "</td>"; }).join("") +
              '<td data-q="' + r.q + '">' + r.q + "</td></tr>";
          }).join("") + "</tbody></table>";
        tblWrap.innerHTML = "<h4 class='k-lab-h'>Truth table — live row highlighted</h4>" + html;
        KOS.ui.hookify(tblWrap);
      }
      build();
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
      var input = el("input", { type: "text", value: "110110", style: "--w: 160px",
        placeholder: "string of 0s and 1s" });
      var verdict = el("span", { class: "k-lab-msg", "data-ui": "lab.message" });
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [
        el("label", {}, ["machine (acceptor)", sel]),
        el("label", {}, ["input string", input]),
        el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "▶ Run", onclick: run }),
        el("button", { class: "k-btn", text: "Step", onclick: stepOnce }),
        el("button", { class: "k-btn k-lab-alt", text: "Reset", onclick: reset }),
        verdict
      ]));
      var holder = el("div", {});
      panel.appendChild(holder);
      var cv = dprCanvas(holder, 280);
      var tape = el("div", { class: "k-lab-fsm-tape" });
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
        verdict.setAttribute("data-tone", ok ? "good" : "bad");
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
          tape.appendChild(el("span", { class: "k-lab-fsm-cell", "data-state": i === pos ? "current" : i < pos ? "done" : null, text: ch }));
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
          ctx.fillStyle = st === cur ? wash(COL.crim, .16) : COL.ink; ctx.fill();
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

  /* =================== 6. BINARY REGISTER & CONVERTER =================== */
  KOS.sims.register({
    id: "binary-number", title: "Binary Register & Converter", subject: "compsci", ref: "4.5.4.1",
    desc: "Click the bits of an 8-bit register — denary, hex and two's complement update live. Addition mode shows the carry rippling through.",
    mount: function (panel) {
      var WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
      var mode = el("select", {}, [
        el("option", { value: "convert", text: "converter" }),
        el("option", { value: "add", text: "8-bit addition" })
      ]);
      var denIn = el("input", { type: "number", min: 0, max: 255, style: "--w: 90px" });
      var hexIn = el("input", { type: "text", maxlength: 2, style: "--w: 64px", placeholder: "FF" });
      var msg = el("span", { class: "k-lab-msg", "data-ui": "lab.message" });
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [
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
        var row = el("div", { class: "k-lab-bit-row", "data-kind": cls || null });
        bits.forEach(function (b, i) {
          var btn = el("button", {
            type: "button", class: "k-lab-bit", "data-ui": "lab.bit", "data-state": b ? "on" : null, text: String(b),
            "aria-label": "bit weight " + WEIGHTS[i],
            onclick: onToggle ? function () {
              bits[i] = 1 - bits[i];
              KOS.ui.state(btn, "flip", true);
              setTimeout(function () { KOS.ui.state(btn, "flip", false); }, 240);
              onToggle();
            } : undefined
          });
          if (!onToggle) btn.disabled = true;
          row.appendChild(btn);
        });
        return row;
      }
      function weightsRow() {
        return el("div", { class: "k-lab-bit-row k-lab-weights" }, WEIGHTS.map(function (w) {
          return el("span", { class: "k-lab-bw", text: String(w) }); }));
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
          body.appendChild(el("dl", { class: "k-n-kv k-lab-bin-read", "data-ui": "content.kv" }, [
            el("dt", { text: "binary" }), el("dd", { text: binStr(A) }),
            el("dt", { text: "denary (unsigned)" }), el("dd", { text: String(v) }),
            el("dt", { text: "denary (two's complement reading)" }), el("dd", { text: String(signed) }),
            el("dt", { text: "hex" }), el("dd", { text: "0x" + v.toString(16).toUpperCase().padStart(2, "0") }),
            el("dt", { text: "two's complement of this value (−" + v + ")" }),
            el("dd", { text: binStr(toBits(tc)) + "  (flip the bits, add 1)" })
          ]));
        } else {
          denIn.value = ""; hexIn.value = "";
          var carryRow = el("div", { class: "k-lab-bit-row k-lab-carry" }, WEIGHTS.map(function () {
            return el("span", { class: "k-lab-bw k-lab-cbit", "data-ui": "lab.cbit", text: "" }); }));
          var resBits = [0, 0, 0, 0, 0, 0, 0, 0];
          var rRow = bitRow(resBits, null, "result");
          var out = el("div", { class: "k-lab-msg", "data-ui": "lab.message", "data-block": "" });
          body.appendChild(el("div", { class: "k-lab-bin-lbl", text: "carry" })); body.appendChild(carryRow);
          body.appendChild(el("div", { class: "k-lab-bin-lbl", text: "A = " + toVal(A) })); body.appendChild(bitRow(A, render));
          body.appendChild(el("div", { class: "k-lab-bin-lbl", text: "B = " + toVal(B) })); body.appendChild(bitRow(B, render));
          body.appendChild(el("div", { class: "k-lab-bin-lbl", text: "A + B" })); body.appendChild(rRow);
          body.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [
            el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "▶ Add (watch the carry)", onclick: function () {
              clearInterval(addTimer);
              var col = 7, carry = 0;
              rRow.querySelectorAll("[data-ui~='lab.bit']").forEach(function (b) { b.textContent = "0"; KOS.ui.state(b, "on", false); KOS.ui.state(b, "live", false); });
              carryRow.querySelectorAll("[data-ui~='lab.cbit']").forEach(function (c) { c.textContent = ""; });
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
                KOS.ui.state(cell, "on", !!(s & 1));
                KOS.ui.state(cell, "live", true);
                setTimeout(function () { KOS.ui.state(cell, "live", false); }, 380);
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
      var desc = el("div", { class: "k-lab-cpu-desc" });
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [
        el("label", {}, ["program", progSel]),
        el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "Step", onclick: stepOnce }),
        el("button", { class: "k-btn", text: "▶ Run", onclick: runAll }),
        el("button", { class: "k-btn k-lab-alt", text: "Reset", onclick: reset })
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
          ctx.fillStyle = active ? wash(COL.gold, .12) : COL.ink;
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
      var aBtn = el("button", { class: "k-btn", onclick: function () { A ^= 1; draw(); } });
      var bBtn = el("button", { class: "k-btn", onclick: function () { B ^= 1; draw(); } });
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [
        el("label", {}, ["gate", sel]),
        el("span", {}, ["input A "]), aBtn, el("span", {}, ["input B "]), bBtn
      ]));
      sel.onchange = draw;
      var holder = el("div", {}); panel.appendChild(holder);
      var cv = dprCanvas(holder, 250);
      var tbl = el("div", { class: "k-lab-out" }); panel.appendChild(tbl);
      var A = 0, B = 0;
      function lvl(on) { return on ? COL.jade : COL.faint; }
      function draw() {
        var g = GATES[sel.value], out = g.unary ? g.f(A) : g.f(A, B);
        aBtn.textContent = "A = " + A; bBtn.textContent = "B = " + B;
        bBtn.disabled = g.unary;
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
          return "<tr" + (live ? " data-state='live'" : "") + ">" + cells + "</tr>";
        }).join("");
        tbl.innerHTML = "<h4 class='k-lab-h'>" + sel.value + " truth table</h4>" +
          "<table class='k-n-table k-lab-tt' data-ui='content.table lab.truth-table'><thead><tr>" + head + "</tr></thead><tbody>" + body + "</tbody></table>";
        KOS.ui.hookify(tbl);
      }
      draw();
    }
  });

  /* =================== the lab system (design part 2, frame 20) ===================
     Every lab shares one header (its area as the kicker, the title with its
     spec point, and the way out), whether it stands on its own page or sits
     in a topic's Simulate tab; the index groups labs by AREA, drawn by the
     archetype each is built on, and a locked lab keeps its shape. */
  var AREAS = [
    { id: "programming", sid: "compsci", label: "Programming", re: /^4\.1\./ },
    { id: "structures", sid: "compsci", label: "Data structures", re: /^4\.2\./ },
    { id: "algorithms", sid: "compsci", label: "Algorithms", re: /^4\.3\./ },
    { id: "theory", sid: "compsci", label: "Theory of computation", re: /^4\.4\./ },
    { id: "representation", sid: "compsci", label: "Data representation", re: /^4\.5\./ },
    { id: "systems", sid: "compsci", label: "Computer systems", re: /^4\.[67]\./ },
    { id: "networking", sid: "compsci", label: "Networking", re: /^4\.9\./ },
    { id: "databases", sid: "compsci", label: "Databases", re: /^4\.1[01]\./ },
    { id: "pure", sid: "maths", label: "Pure", re: /^\d/ },
    { id: "statistics", sid: "maths", label: "Statistics", re: /^S\d\./ },
    { id: "mechanics", sid: "maths", label: "Mechanics", re: /^M\d\./ },
    { id: "project", sid: "compsci", label: "NEA project", re: /^NEA/ }   /* appended: AREAS[8] is the maths fallback */
  ];
  function areaOf(s) {
    return AREAS.filter(function (a) { return a.sid === s.subject && a.re.test(String(s.ref || "")); })[0]
      || (s.subject === "maths" ? AREAS[8] : AREAS[0]);
  }
  /* the archetype a lab is drawn on (20a–20e, plus code-shaped sandboxes) */
  var KIND_LABEL = { diagram: "Diagram", graph: "Graph", plot: "Plot", bits: "Bits", machine: "Machine", code: "Code" };
  var KIND_OF = {
    "dijkstra": "graph", "graph-traversal": "graph",
    "fsm-lab": "machine", "turing-machine": "machine", "cpu-fetch-execute": "machine", "lmc-sandbox": "code",
    "sql-sandbox": "code", "regex-sandbox": "code", "bnf-checker": "code", "cipher-lab": "code", "compression-lab": "code",
    "big-o-plot": "plot", "sort-viz": "diagram", "cs-vector": "plot", "adc-sampling": "plot",
    "logic-lab": "bits", "logic-gates": "bits", "subnet-lab": "bits",
    "nea-objectives": "code", "nea-marks": "diagram"
  };
  function kindOf(s) {
    if (KIND_OF[s.id]) return KIND_OF[s.id];
    if (s.subject === "maths") return "plot";
    var a = areaOf(s).id;
    return a === "representation" ? "bits" : a === "theory" ? "machine" : a === "algorithms" ? "diagram" : "diagram";
  }
  /* a small drawing of the archetype, in the subject's hue (classes only:
     the colours are the stylesheet's) */
  var THUMB = {
    diagram: '<rect class="k-th-n" x="24" y="40" width="40" height="28" rx="7"/><rect class="k-th-n" x="80" y="40" width="40" height="28" rx="7"/><rect class="k-th-n k-th-on" x="136" y="40" width="40" height="28" rx="7"/><path class="k-th-e" d="M64 54h16M120 54h16"/>',
    graph: '<path class="k-th-e" d="M40 76L84 32L140 48L166 80M84 32L104 84M40 76L104 84"/><circle class="k-th-n k-th-on" cx="40" cy="76" r="9"/><circle class="k-th-n k-th-on" cx="84" cy="32" r="9"/><circle class="k-th-n k-th-hot" cx="140" cy="48" r="9"/><circle class="k-th-n" cx="104" cy="84" r="9"/><circle class="k-th-n" cx="166" cy="80" r="9"/>',
    plot: '<path class="k-th-e" d="M34 16V90H180"/><path class="k-th-fill" d="M46 88C90 84 120 70 150 44V90H46Z"/><path class="k-th-line" d="M40 89C90 86 124 70 170 22"/>',
    bits: '<rect class="k-th-n" x="20" y="40" width="18" height="28" rx="4"/><rect class="k-th-n k-th-on" x="42" y="40" width="18" height="28" rx="4"/><rect class="k-th-n k-th-on" x="64" y="40" width="18" height="28" rx="4"/><rect class="k-th-n" x="86" y="40" width="18" height="28" rx="4"/><rect class="k-th-n k-th-on" x="114" y="40" width="18" height="28" rx="4"/><rect class="k-th-n" x="136" y="40" width="18" height="28" rx="4"/><rect class="k-th-n k-th-on" x="158" y="40" width="18" height="28" rx="4"/>',
    machine: '<rect class="k-th-n" x="30" y="20" width="22" height="22" rx="4"/><rect class="k-th-n" x="56" y="20" width="22" height="22" rx="4"/><rect class="k-th-n k-th-hot" x="82" y="20" width="22" height="22" rx="4"/><rect class="k-th-n" x="108" y="20" width="22" height="22" rx="4"/><rect class="k-th-n" x="134" y="20" width="22" height="22" rx="4"/><path class="k-th-head" d="M87 54h12l-6-8z"/><path class="k-th-e" d="M70 78h54"/><circle class="k-th-n" cx="60" cy="78" r="10"/><circle class="k-th-n k-th-hot" cx="134" cy="78" r="10"/>',
    code: '<path class="k-th-e" d="M30 28h70M42 44h96M42 60h60M30 76h40"/><rect class="k-th-fill" x="24" y="52" width="152" height="16" rx="4"/>',
    /* variants of an archetype, so a group of diagrams does not read as one card */
    tree: '<path class="k-th-e" d="M100 24L66 54L48 84M66 54L84 84M100 24L134 54L152 84"/><circle class="k-th-n k-th-on" cx="100" cy="24" r="9"/><circle class="k-th-n" cx="66" cy="54" r="9"/><circle class="k-th-n" cx="134" cy="54" r="9"/><circle class="k-th-n" cx="48" cy="84" r="9"/><circle class="k-th-n k-th-hot" cx="84" cy="84" r="9"/><circle class="k-th-n" cx="152" cy="84" r="9"/>',
    cells: '<rect class="k-th-n" x="18" y="42" width="22" height="26" rx="4"/><rect class="k-th-n k-th-on" x="44" y="42" width="22" height="26" rx="4"/><rect class="k-th-n k-th-on" x="70" y="42" width="22" height="26" rx="4"/><rect class="k-th-n" x="96" y="42" width="22" height="26" rx="4"/><rect class="k-th-n k-th-hot" x="122" y="42" width="22" height="26" rx="4"/><rect class="k-th-n k-th-on" x="148" y="42" width="22" height="26" rx="4"/>',
    bars: '<path class="k-th-e" d="M24 92H176"/><rect class="k-th-n k-th-on" x="34" y="56" width="16" height="34" rx="3"/><rect class="k-th-n k-th-on" x="58" y="40" width="16" height="50" rx="3"/><rect class="k-th-n k-th-hot" x="82" y="24" width="16" height="66" rx="3"/><rect class="k-th-n k-th-on" x="106" y="66" width="16" height="24" rx="3"/><rect class="k-th-n k-th-on" x="130" y="48" width="16" height="42" rx="3"/><rect class="k-th-n" x="154" y="34" width="16" height="56" rx="3"/>',
    stack: '<rect class="k-th-n" x="76" y="14" width="48" height="18" rx="4"/><rect class="k-th-n k-th-hot" x="76" y="36" width="48" height="18" rx="4"/><rect class="k-th-n k-th-on" x="76" y="58" width="48" height="18" rx="4"/><rect class="k-th-n k-th-on" x="76" y="80" width="48" height="18" rx="4"/><path class="k-th-head" d="M140 45l-10-6v12z"/>'
  };
  var THUMB_OF = { "nea-marks": "bars", "tl-tree": "tree", "tl-stack": "stack", "recursion-viz": "stack", "rpn-eval": "stack",
    "hash-table": "cells", "dictionary": "cells", "binary-search": "cells", "linear-search": "cells", "sort-viz": "bars" };
  function thumb(s) {
    var box = el("span", { class: "k-lab-thumb", "aria-hidden": "true", "data-kind": kindOf(s) });
    box.innerHTML = '<svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid meet">' + THUMB[THUMB_OF[s.id] || kindOf(s)] + "</svg>";
    return box;
  }
  function specLabel(s) { return (s.subject === "maths" ? "Edexcel 9MA0 · " : "AQA 7517 · ") + s.ref; }
  function leafTitle(s) {
    var leaf = KOS.hub && KOS.hub.BYREF[s.subject] && KOS.hub.BYREF[s.subject][s.ref];
    return leaf ? leaf.title : "";
  }
  /* the one lab header (20a): full page → "Open topic page", embedded →
     "Open full page" */
  function labHead(s, embedded) {
    var trace = !!s.trace;
    return el("header", { class: "k-lab-head", "data-ui": "lab.sim-head" }, [
      el("div", { class: "k-lab-head-t" }, [
        el("span", { class: "k-kicker", text: trace ? "Trace lab" : "Simulation · " + areaOf(s).label }),
        el(embedded ? "h2" : "h1", { class: "k-lab-title" }, [
          s.title + " ", el("span", { class: "k-lab-refpill k-mono", "data-subject": s.subject, title: specLabel(s), text: s.ref })
        ])
      ]),
      embedded
        ? el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "⤢ Open full page", onclick: function () { KOS.show("sims", s.id); } })
        : leafTitle(s) ? el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Open topic page →",
          onclick: function () { KOS.show("ref", { subject: s.subject, ref: s.ref }); } }) : null
    ].filter(Boolean));
  }
  /* 20i: a locked lab keeps its shape — the header, then its stage with a
     faint drawing of what it is and one panel on it. Gold is the one way
     in (the Governor's rule); core revision never locks. */
  function lockedLab(host, s, acc, embedded) {
    var g = KOS.store.state.governor || {};
    var price = acc.item ? acc.item.price : 0;
    var stage = el("div", { class: "k-lab-lockstage", "data-ui": "gov.lock lab.locked", "aria-label": s.title + " — locked" }, [
      el("span", { class: "k-lab-lock-ghost", "aria-hidden": "true" }, [thumb(s)]),
      el("div", { class: "k-lab-lock-card" }, [
        el("span", { class: "k-lab-lock-mark", "aria-hidden": "true", text: "◆" }),
        el("b", { class: "k-lab-lock-name", text: s.title }),
        el("span", { class: "k-lab-lock-by", text: "Locked by the Governor" }),
        el("span", { class: "k-lab-lock-price k-mono", text: "◆ " + KOS.ui.num(price) }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Open the Gold Shop",
          onclick: function () { KOS.show("governor", "shop"); } }),
        el("span", { class: "k-lab-lock-bal", text: "You have ◆ " + KOS.ui.num(g.gold || 0) + " · core revision stays free" })
      ])
    ]);
    host.appendChild(el("div", { class: "k-lab-lockwrap", "data-state": embedded ? "embedded" : null }, [
      stage,
      el("aside", { class: "k-lab-lock-side" }, [
        el("h3", { class: "k-kicker", text: "What it shows" }),
        el("p", { text: s.desc }),
        embedded ? null : el("h3", { class: "k-kicker", text: "How to open it" }),
        embedded ? null : el("p", { text: "A one-time unlock in the Gold Shop. Once open, it stays open." })
      ].filter(Boolean))
    ]));
  }
  /* a lab on a topic's Simulate tab (hub.js): the same header and lock */
  KOS.sims.embed = function (host, s) {
    var box = el("section", { class: "k-card k-topic-lab k-lab", "data-state": "embedded", "data-subject": s.subject, "aria-label": s.title }, [labHead(s, true)]);
    host.appendChild(box);
    var acc = KOS.governor ? KOS.governor.simAccess(s.id) : { ok: true };
    if (!acc.ok) { lockedLab(box, s, acc, true); return; }
    box.appendChild(el("p", { class: "k-lab-sub", "data-ui": "part.sub", text: s.desc }));
    s.mount(box);
  };
  KOS.sims.areaOf = areaOf;
  KOS.sims.kindOf = kindOf;

  /* =================== Simulations view (20h) ===================
     Areas on the left with their counts, by subject; the labs grouped by
     area as cards that draw their archetype; one subject switch and a
     search that spans everything and keeps the groups. An area with more
     than four labs shows its first row and "Show all N" under All areas.
     Deep links (#/sims/<id>) and the per-lab gold gate are unchanged. */
  KOS.views.sims = function (main, openId) {
    KOS.shell.tree("none");
    var withMount = REG.filter(function (s) { return s.mount; });
    var opened = openId && KOS.sims.get(openId) && KOS.sims.get(openId).mount ? KOS.sims.get(openId) : null;
    var st = KOS.store.state.ui = KOS.store.state.ui || {};
    var subj = st.simSubj === "compsci" || st.simSubj === "maths" ? st.simSubj : "all";
    var area = AREAS.some(function (a) { return a.id === st.simArea; }) ? st.simArea : "all";
    var query = "";

    if (!opened) {
      var search = el("input", { type: "search", class: "k-input k-lab-search", placeholder: "Search simulations, topics or specs", "aria-label": "Search simulations" });
      var seg = el("div", { class: "k-seg k-lab-subj", role: "group", "aria-label": "Subject" }, [["all", "All"], ["compsci", "CS"], ["maths", "Maths"]].map(function (c) {
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "lab.category", "data-subject": c[0],
          "aria-pressed": String(c[0] === subj), onclick: function () {
            subj = c[0]; st.simSubj = subj;
            if (area !== "all" && areaById(area).sid !== subj && subj !== "all") { area = "all"; st.simArea = area; }
            KOS.store.save(); paint();
          } }, [c[1]]);
      }));
      main.appendChild(KOS.ui.pageHeader({ kicker: "Study · Practice", title: "Simulations",
        sub: withMount.length + " labs across Computer Science and Mathematics",
        actions: [el("div", { class: "k-lab-toolbar", "data-ui": "lab.toolbar" }, [seg, search])] }));
      var rail = el("nav", { class: "k-lab-areas", "aria-label": "Areas" });
      var sections = el("div", { class: "k-lab-sections", "data-ui": "lab.sim-grid" });
      var empty = el("p", { class: "k-lab-msg", "data-ui": "lab.message", hidden: "", text: "Nothing matches — try a shorter word." });
      main.appendChild(el("div", { class: "k-lab-index" }, [KOS.ui.scroller(rail, { keepRole: true, label: "Areas", className: "k-lab-areas-scroll" }), el("div", { class: "k-lab-main" }, [sections, empty])]));
      search.oninput = function () { query = search.value.trim().toLowerCase(); paint(); };
      function areaById(id) { return AREAS.filter(function (a) { return a.id === id; })[0]; }
      function inSubj(s) { return subj === "all" || s.subject === subj; }
      function matches(s) { return (s.title + " " + s.desc + " " + s.ref + " " + leafTitle(s)).toLowerCase().indexOf(query) >= 0; }
      function card(s) {
        var acc = KOS.governor ? KOS.governor.simAccess(s.id) : { ok: true };
        var th = thumb(s);
        if (!acc.ok) th.appendChild(el("span", { class: "k-lab-price k-mono", text: "◆ " + KOS.ui.num(acc.item.price) }));
        return el("li", {}, [el("button", { type: "button", class: "k-lab-card", "data-ui": "lab.sim-card",
          "data-state": acc.ok ? null : "locked", "data-subject": s.subject, title: s.desc,
          "aria-label": s.title + (acc.ok ? "" : " — locked, " + acc.item.price + " gold"),
          onclick: function () { KOS.show("sims", s.id); } }, [
          th,
          el("b", { class: "k-lab-card-title", text: s.title }),
          el("span", { class: "k-lab-card-ref k-mono", text: s.ref + " · " + KIND_LABEL[kindOf(s)] })
        ])]);
      }
      function paint() {
        seg.querySelectorAll("[data-ui~='lab.category']").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-subject") === subj)); });
        rail.innerHTML = "";
        function areaBtn(id, label, n) {
          return el("button", { type: "button", class: "k-lab-area", "data-ui": "lab.area", "data-area": id,
            "aria-current": area === id ? "true" : null, onclick: function () { area = id; st.simArea = id; KOS.store.save(); paint(); } },
            [el("span", { text: label }), el("span", { class: "k-lab-area-n k-mono", text: String(n) })]);
        }
        rail.appendChild(areaBtn("all", "All areas", withMount.filter(inSubj).length));
        [["compsci", "Computer Science"], ["maths", "Mathematics"]].forEach(function (g) {
          if (subj !== "all" && subj !== g[0]) return;
          rail.appendChild(el("span", { class: "k-lab-area-h", "aria-hidden": "true", text: g[1] }));
          AREAS.forEach(function (a) {
            if (a.sid !== g[0]) return;
            var n = withMount.filter(function (s) { return areaOf(s) === a; }).length;
            if (n) rail.appendChild(areaBtn(a.id, a.label, n));
          });
        });
        sections.innerHTML = "";
        var total = 0;
        AREAS.forEach(function (a) {
          if (area !== "all" && a.id !== area) return;
          var list = withMount.filter(function (s) { return areaOf(s) === a && inSubj(s) && (!query || matches(s)); });
          if (!list.length) return;
          total += list.length;
          var collapse = area === "all" && !query && list.length > 4;
          sections.appendChild(el("section", { class: "k-lab-sec", "aria-label": a.label }, [
            el("div", { class: "k-lab-sec-h" }, [
              el("h2", { text: a.label }),
              el("span", { class: "k-lab-sec-n k-mono", text: String(list.length) }),
              collapse ? el("button", { type: "button", class: "k-link k-lab-sec-all", "data-ui": "lab.area-all",
                text: "Show all " + list.length + " →", onclick: function () { area = a.id; st.simArea = a.id; KOS.store.save(); paint(); } }) : null
            ].filter(Boolean)),
            el("ul", { class: "k-lab-grid" }, (collapse ? list.slice(0, 4) : list).map(card))
          ]));
        });
        empty.hidden = !!total;
      }
      paint();
      return;
    }

    /* an opened lab: the way back names the area; the header is the lab's */
    var s = opened, ar = areaOf(s);
    main.appendChild(el("nav", { class: "k-lab-crumbs", "aria-label": "Breadcrumb" }, [
      el("button", { type: "button", class: "k-link", "data-ui": "lab.back", text: "‹ Simulations", onclick: function () { KOS.show("sims"); } }),
      el("span", { "aria-hidden": "true", text: "·" }),
      el("button", { type: "button", class: "k-link", text: ar.label, onclick: function () { st.simArea = ar.id; KOS.store.save(); KOS.show("sims"); } })
    ]));
    var panel = el("section", { class: "k-lab k-card", "data-subject": s.subject, "aria-label": s.title }, [labHead(s, false)]);
    main.appendChild(panel);
    var acc = KOS.governor ? KOS.governor.simAccess(s.id) : { ok: true };
    if (!acc.ok) { lockedLab(panel, s, acc, false); return; }
    panel.appendChild(el("p", { class: "k-lab-sub", "data-ui": "part.sub", text: s.desc }));
    s.mount(panel);
    /* no "More in …" pill row (review A): the grid is one Back away */
  };
})();
