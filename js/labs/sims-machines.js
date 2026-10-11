/* Kurenai OS — labs/sims-machines.js
   Machines on the lab system (design part 2, frame 20e): the Turing
   machine, the finite-state machine and the fetch–execute cycle.

   Machines share three parts: the tape or input as a row of cells across
   the top, with the head a crimson marker under the current cell and the
   state's name; the state diagram below, the current state filled
   crimson, accepting states double-ringed and the transition about to
   fire drawn crimson; and the transition table in the readout with the
   current row lit, so the diagram and the table always agree. A long
   tape scrolls under a fixed head, so the tape never widens the stage.
   Fetch–execute speaks the same language: registers and memory as cells,
   the bus in use as the crimson transition. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;
  function txtIn(v, w, on) { var i = el("input", { type: "text", value: v, spellcheck: "false", autocomplete: "off", style: "--w: " + (w || 90) + "px" }); if (on) i.addEventListener("input", on); return i; }
  function stepMeta(label, i, n) { return n > 1 ? label + " " + i + " of " + (n - 1) : null; }

  /* a row of tape cells with the head under the middle cell; `at` is the
     head's index, `cells(i)` gives a symbol and a tone */
  function tape(d, y, at, sym, o) {
    o = o || {};
    var CW = o.w || 46, G = 6, n = o.n || 15, mid = Math.floor(n / 2), x0 = 400 - (n * (CW + G) - G) / 2;
    for (var k = 0; k < n; k++) {
      var i = o.fixed ? k : at - mid + k, s = sym(i);
      if (s == null) continue;
      var x = x0 + k * (CW + G), tone = i === at ? "hot-ring" : s.tone || null;
      d.rect(x, y, CW, CW, { rx: 10, tone: tone });
      d.text(x + CW / 2, y + CW / 2 + 7, s.v, { size: 18, weight: "bold", tone: s.blank ? "mute" : i === at ? null : s.textTone || null });
    }
    var hx = o.fixed ? x0 + at * (CW + G) + CW / 2 : x0 + mid * (CW + G) + CW / 2;
    if (at >= 0) {
      d.el("path", { d: "M" + (hx - 8) + " " + (y + CW + 16) + " L" + hx + " " + (y + CW + 5) + " L" + (hx + 8) + " " + (y + CW + 16) + " Z", class: "k-sv-tip", "data-tone": "hot" });
      if (o.label) d.text(hx, y + CW + 36, o.label, { size: 14, weight: "bold", tone: "hot" });
    }
  }
  /* a state diagram: nodes on a line (≤ 4) or an ellipse; edges merged
     per pair, self-loops above; `hot` names the edge about to fire */
  function diagram(d, states, edges, o) {
    var pos = {}, n = states.length, cy = o.cy || 300, R = o.r || 30;
    states.forEach(function (s, i) {
      if (n <= 4) pos[s] = { x: 400 + (i - (n - 1) / 2) * Math.min(220, 640 / Math.max(1, n - 1)), y: cy };
      else { var a = Math.PI + (i / n) * 2 * Math.PI; pos[s] = { x: 400 + 290 * Math.cos(a), y: cy + 92 * Math.sin(a) }; }
    });
    var pairs = {};
    edges.forEach(function (e) { var k = e.from + ">" + e.to; (pairs[k] = pairs[k] || { from: e.from, to: e.to, labels: [], hot: false }).labels.push(e.label); if (e.hot) pairs[k].hot = true; });
    Object.keys(pairs).forEach(function (k) {
      var e = pairs[k], a = pos[e.from], b = pos[e.to], tone = e.hot ? "hot" : "mute", lab = e.labels.join(" · ");
      if (!a || !b) return;
      if (e.from === e.to) {
        var up = n > 4 && a.y > cy ? 1 : -1;
        d.path("M" + (a.x - 12) + " " + (a.y + up * R * 0.8) + " C" + (a.x - 34) + " " + (a.y + up * (R + 46)) + " " + (a.x + 34) + " " + (a.y + up * (R + 46)) + " " + (a.x + 12) + " " + (a.y + up * R * 0.85), { tone: tone, arrow: true });
        d.text(a.x, a.y + up * (R + 50) + (up < 0 ? 0 : 12), lab, { size: 14, tone: e.hot ? "hot" : "sub" });
        return;
      }
      var back = pairs[e.to + ">" + e.from], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      var bend = back ? 42 : 0, mx = (a.x + b.x) / 2 - uy * bend, my = (a.y + b.y) / 2 + ux * bend;
      var sx = a.x + ux * R, sy = a.y + uy * R, ex = b.x - ux * (R + 2), ey = b.y - uy * (R + 2);
      if (bend) { sx = a.x + (mx - a.x) / Math.hypot(mx - a.x, my - a.y) * R; sy = a.y + (my - a.y) / Math.hypot(mx - a.x, my - a.y) * R; ex = b.x + (mx - b.x) / Math.hypot(mx - b.x, my - b.y) * (R + 2); ey = b.y + (my - b.y) / Math.hypot(mx - b.x, my - b.y) * (R + 2); }
      d.path("M" + sx.toFixed(1) + " " + sy.toFixed(1) + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + ex.toFixed(1) + " " + ey.toFixed(1), { tone: tone, arrow: true });
      d.text(mx - uy * 14, my + ux * 14 + 5, lab, { size: 14, tone: e.hot ? "hot" : "sub" });
    });
    states.forEach(function (s) {
      var p = pos[s], cur = s === o.cur, acc = (o.accept || []).indexOf(s) >= 0;
      d.circle(p.x, p.y, R, { tone: cur ? "hot" : acc ? "done-ring" : null });
      if (acc) d.circle(p.x, p.y, R - 6, { tone: cur ? "hot" : "ghost" });
      d.text(p.x, p.y + 6, s, { size: s.length > 4 ? 14 : 16, weight: "bold", tone: cur ? "on" : null });
      if (s === o.start) {
        d.line(p.x - R - 52, p.y, p.x - R - 3, p.y, { tone: "sub", arrow: true });
        d.text(p.x - R - 54, p.y + 5, "start", { size: 14, tone: "mute", anchor: "end" });
      }
    });
  }

  /* =================== THE TURING MACHINE (20e, 1280 frame) =================== */
  var TM = {
    increment: { name: "Increment", tape: "1011", start: "q0", halt: ["halt"],
      rules: [["q0", "0", "0", "R", "q0"], ["q0", "1", "1", "R", "q0"], ["q0", "□", "□", "L", "q1"], ["q1", "1", "0", "L", "q1"], ["q1", "0", "1", "L", "halt"], ["q1", "□", "1", "L", "halt"]],
      says: { "q0": "q0 walks right over the number to the blank after it.", "q1": "The carry travels left until it meets a 0." } },
    unary: { name: "Unary add", tape: "111+11", start: "q0", halt: ["halt"],
      rules: [["q0", "1", "1", "R", "q0"], ["q0", "+", "1", "R", "q1"], ["q1", "1", "1", "R", "q1"], ["q1", "□", "□", "L", "q2"], ["q2", "1", "□", "L", "halt"]],
      says: { "q0": "Turn the + into a 1, joining the two blocks.", "q1": "Walk to the end of the second block.", "q2": "Rub out one 1, because the + added one too many." } },
    palin: { name: "Palindrome", tape: "abba", start: "S0", halt: ["YES", "NO"],
      rules: [["S0", "a", "□", "R", "A1"], ["S0", "b", "□", "R", "B1"], ["S0", "□", "□", "N", "YES"],
        ["A1", "a", "a", "R", "A1"], ["A1", "b", "b", "R", "A1"], ["A1", "□", "□", "L", "A2"], ["A2", "a", "□", "L", "BK"], ["A2", "b", "b", "N", "NO"], ["A2", "□", "□", "N", "YES"],
        ["B1", "a", "a", "R", "B1"], ["B1", "b", "b", "R", "B1"], ["B1", "□", "□", "L", "B2"], ["B2", "b", "□", "L", "BK"], ["B2", "a", "a", "N", "NO"], ["B2", "□", "□", "N", "YES"],
        ["BK", "a", "a", "L", "BK"], ["BK", "b", "b", "L", "BK"], ["BK", "□", "□", "R", "S0"]],
      says: { "S0": "Rub out the first symbol and remember it in the state.", "A1": "Carry an a to the right-hand end.", "B1": "Carry a b to the right-hand end.", "A2": "The last symbol must be an a.", "B2": "The last symbol must be a b.", "BK": "Walk back to the left-hand end." } }
  };
  KOS.sims.register({
    id: "turing-machine", title: "Turing machine", subject: "compsci", ref: "4.4.5.1",
    desc: "Step a Turing machine through δ(state, symbol) → (write, move, next): binary increment, unary addition and a palindrome check, with the tape scrolling under a fixed head and the rule that fires lit in the diagram and the table.",
    mount: function (panel) {
      var cur = "increment", rules = TM[cur].rules.map(function (r) { return r.slice(); }), editing = false, shown = null;
      var tapeIn = txtIn(TM[cur].tape, 90, function () { build(); });
      var editBtn = L.action("✎ Edit rules", function () { editing = !editing; editBtn.setAttribute("aria-pressed", String(editing)); render(shown); });
      editBtn.setAttribute("aria-pressed", "false");
      var lab = L.create(panel, { zoom: false, transport: true, speed: true, tick: 800, label: "A Turing machine: its tape, head and state diagram", readout: ["now", "tt", "tape", "edit", "legend"],
        controls: [L.choice(Object.keys(TM).map(function (k) { return [k, TM[k].name]; }), cur, function (k) { cur = k; tapeIn.value = TM[k].tape; rules = TM[k].rules.map(function (r) { return r.slice(); }); build(); }, "Program"),
          L.field("Tape", tapeIn), editBtn], onReset: function () { build(); } });
      lab.legend([["fill-hot", "current state"], ["ring-hot", "cell under the head"], ["line-hot", "rule about to fire"], ["ring-done", "halting state"]]);
      function build() {
        var p = TM[cur], t = {}, s = tapeIn.value.replace(/\s/g, "").slice(0, 30), head = 0, state = p.start, frames = [], steps = 0;
        for (var i = 0; i < s.length; i++) t[i] = s[i];
        function sym(i) { return t[i] === undefined ? "□" : t[i]; }
        function rule() { return rules.filter(function (r) { return r[0] === state && r[1] === sym(head); })[0]; }
        function snap(say) { var r = rule(); frames.push({ t: JSON.parse(JSON.stringify(t)), head: head, state: state, rule: p.halt.indexOf(state) >= 0 ? null : r, say: say, steps: steps }); }
        snap(["Start in " + p.start + " with the head on the first symbol. " + (p.says[p.start] || "")]);
        while (steps < 400) {
          if (p.halt.indexOf(state) >= 0) break;
          var r = rule();
          if (!r) { frames[frames.length - 1].say = ["No rule for (" + state + ", " + sym(head) + "): the machine ", ["halts and rejects", "hot"], "."]; break; }
          var was = state, read = sym(head);
          if (r[2] === "□") delete t[head]; else t[head] = r[2];
          head += r[3] === "R" ? 1 : r[3] === "L" ? -1 : 0;
          state = r[4]; steps++;
          snap(p.halt.indexOf(state) >= 0
            ? ["In " + was + " reading " + read + ": write " + r[2] + ", " + (r[3] === "N" ? "stay" : r[3] === "L" ? "move left" : "move right") + ", and ", [state === "NO" ? "reject" : "halt", state === "NO" ? "hot" : "done"], state === "YES" ? " — accepted: the input is a palindrome." : state === "NO" ? " — the ends differ, so it is not a palindrome." : "."]
            : ["In " + was + " reading " + read + ": write " + r[2] + ", " + (r[3] === "N" ? "stay" : r[3] === "L" ? "move left" : "move right") + (state === was ? ", stay in " + state + ". " : ", go to " + state + ". "), p.says[state] || ""]);
        }
        if (steps >= 400) frames[frames.length - 1].say = [["Stopped after 400 steps", "hot"], " — this rule set may never halt."];
        lab.steps(frames, render);
      }
      function tapeStr(t) { var ks = Object.keys(t).map(Number); if (!ks.length) return "(blank)"; var lo = Math.min.apply(null, ks), hi = Math.max.apply(null, ks), out = ""; for (var j = lo; j <= hi; j++) out += t[j] === undefined ? "□" : t[j]; return out; }
      function render(f, i, n) {
        if (!f) return;
        shown = f;
        var p = TM[cur];
        lab.draw(function (d) {
          tape(d, 26, f.head, function (k) { var v = f.t[k]; return { v: v === undefined ? "□" : v, blank: v === undefined }; }, { label: "head · " + f.state });
          var states = [];
          [p.start].concat(rules.map(function (r) { return r[0]; })).concat(rules.map(function (r) { return r[4]; })).forEach(function (s) { if (states.indexOf(s) < 0) states.push(s); });
          diagram(d, states, rules.map(function (r) { return { from: r[0], to: r[4], label: r[1] + "→" + r[2] + "," + r[3], hot: r === f.rule }; }), { cur: f.state, start: p.start, accept: p.halt.filter(function (h) { return h !== "NO"; }), cy: states.length > 4 ? 300 : 310 });
          return { w: 800, h: 450, note: "tape scrolls with the head" };
        });
        lab.now(f.say, i != null ? stepMeta("Step", i, n) : null);
        var live = rules.indexOf(f.rule);
        lab.section("tt", "Transition table δ", [lab.table(["state", "read", "write", "move", "next"], rules.map(function (r) { return r.slice(); }), live)], rules.length);
        lab.section("tape", "Tape", [el("dl", { class: "k-lab-kv" }, [el("dt", { text: "before" }), el("dd", { class: "k-mono", text: tapeIn.value.replace(/\s/g, "") || "(blank)" }),
          el("dt", { text: "now" }), el("dd", { class: "k-mono", "data-tone": "hot", text: tapeStr(f.t) + " · head at " + f.head }), el("dt", { text: "steps" }), el("dd", { class: "k-mono", text: String(f.steps) })])]);
        if (editing) {
          var ta = el("textarea", { class: "k-lab-note", "aria-label": "Rules, one per line: state read write move next", spellcheck: "false" });
          ta.value = rules.map(function (r) { return r.join(" "); }).join("\n");
          lab.section("edit", "Edit rules", [el("p", { class: "k-lab-work", text: "One rule per line: state read write move next. Move is L, R or N; □ is the blank." }), ta,
            L.action("Apply", function () {
              var rows = ta.value.split("\n").map(function (l) { return l.trim().split(/\s+/); }).filter(function (r) { return r.length === 5 && /^[LRN]$/.test(r[3]); });
              if (!rows.length) { lab.now([["No valid rules: each line needs five parts.", "hot"]]); return; }
              rules = rows; build();
            }, true)]);
        } else lab.section("edit", "Edit rules", null);
      }
      build();
    }
  });

  /* =================== THE FINITE-STATE MACHINE (20e, 720 frame) =================== */
  var FSM = {
    parity: { name: "Parity", states: ["Even", "Odd"], start: "Even", accept: ["Even"], alphabet: "01", input: "1101",
      d: { "Even,0": "Even", "Even,1": "Odd", "Odd,0": "Odd", "Odd,1": "Even" }, what: "accepts an even number of 1s" },
    ends01: { name: "Ends in 01", states: ["A", "B", "C"], start: "A", accept: ["C"], alphabet: "01", input: "11001",
      d: { "A,0": "B", "A,1": "A", "B,0": "B", "B,1": "C", "C,0": "B", "C,1": "A" }, what: "accepts strings ending in 01" },
    div3: { name: "Divisible by 3", states: ["r0", "r1", "r2"], start: "r0", accept: ["r0"], alphabet: "01", input: "110",
      d: { "r0,0": "r0", "r0,1": "r1", "r1,0": "r2", "r1,1": "r0", "r2,0": "r1", "r2,1": "r2" }, what: "accepts binary numbers divisible by 3 (the state is the remainder)" },
    vending: { name: "Vending", states: ["0p", "10p", "20p", "30p"], start: "0p", accept: ["30p"], alphabet: "12", input: "121",
      d: { "0p,1": "10p", "0p,2": "20p", "10p,1": "20p", "10p,2": "30p", "20p,1": "30p", "20p,2": "30p", "30p,1": "30p", "30p,2": "30p" }, what: "a 30p vending machine: 1 is a 10p coin, 2 a 20p coin; it accepts once 30p is in" }
  };
  KOS.sims.register({
    id: "fsm-lab", title: "Finite-state machine", subject: "compsci", ref: "4.4.2.1",
    desc: "Feed an input string through an acceptor one symbol at a time and watch the state hop: parity, ends in 01, divisible by 3 and a vending machine.",
    mount: function (panel) {
      var key = "parity";
      var input = txtIn(FSM[key].input, 100, function () { build(); });
      var lab = L.create(panel, { zoom: false, transport: true, tick: 900, label: "A finite-state machine and its input", readout: ["now", "result", "tt", "legend"],
        controls: [L.choice(Object.keys(FSM).map(function (k) { return [k, FSM[k].name]; }), key, function (k) { key = k; input.value = FSM[k].input; build(); }, "Machine"), L.field("Input", input)],
        onReset: function () { build(); } });
      lab.legend([["fill-hot", "current state"], ["ring-done", "accepting state"], ["line-hot", "transition about to fire"], ["fill-mute", "symbols read"]]);
      function build() {
        var m = FSM[key], s = input.value.split("").filter(function (c) { return m.alphabet.indexOf(c) >= 0; }).slice(0, 24), cur = m.start, frames = [];
        frames.push({ s: s, pos: 0, cur: cur, next: s.length ? m.d[cur + "," + s[0]] : null, say: ["Start in ", [cur, "hot"], ". This machine " + m.what + "."] });
        for (var i = 0; i < s.length; i++) {
          var nx = m.d[cur + "," + s[i]], last = i === s.length - 1, ok = m.accept.indexOf(nx) >= 0;
          var say = ["In " + cur + ", reading " + s[i] + (nx === cur ? " keeps it in " + cur + "." : " moves it to " + nx + ".")];
          if (last) say = say.concat([" End of input in " + nx + ": ", [ok ? "ACCEPTED" : "REJECTED", ok ? "done" : "hot"], ok ? " — an accepting state." : " — not an accepting state."]);
          else say.push(" " + (s.length - i - 1 === 1 ? "One symbol left." : (s.length - i - 1) + " symbols left."));
          cur = nx;
          frames.push({ s: s, pos: i + 1, cur: cur, next: last ? null : m.d[cur + "," + s[i + 1]], say: say, end: last, ok: ok });
        }
        if (!s.length) frames[0].say.push(" The input is empty, so it ends where it starts: " + (m.accept.indexOf(cur) >= 0 ? "ACCEPTED." : "REJECTED."));
        lab.steps(frames, render);
      }
      function render(f, i, n) {
        var m = FSM[key];
        lab.draw(function (d) {
          tape(d, 30, f.pos < f.s.length ? f.pos : -1, function (k) { return k < f.s.length ? { v: f.s[k], tone: k < f.pos ? "well" : null, textTone: k < f.pos ? "mute" : null } : null; }, { fixed: true, n: f.s.length, w: Math.min(46, 700 / Math.max(1, f.s.length) - 6) });
          diagram(d, m.states, Object.keys(m.d).map(function (k) { var p = k.split(","); return { from: p[0], to: m.d[k], label: p[1], hot: p[0] === f.cur && f.pos < f.s.length && p[1] === f.s[f.pos] }; }), { cur: f.cur, start: m.start, accept: m.accept, cy: 290, r: 36 });
          return { w: 800, h: 450 };
        });
        lab.now(f.say, stepMeta("Symbol", i, n));
        var verdict = f.end ? (f.ok ? "ACCEPTED ✓" : "REJECTED ✕") : "";
        lab.section("result", "Result so far", [el("dl", { class: "k-lab-kv" }, [el("dt", { text: "state" }), el("dd", { class: "k-mono", "data-tone": m.accept.indexOf(f.cur) >= 0 ? "done" : null, text: f.cur + (m.accept.indexOf(f.cur) >= 0 ? " · accepting" : "") }),
          el("dt", { text: "read" }), el("dd", { class: "k-mono", text: f.s.slice(0, f.pos).join("") || "nothing yet" })]),
          el("p", { class: "k-lab-now", "data-ui": "lab.message", "data-tone": f.end ? (f.ok ? "good" : "bad") : null, text: verdict ? "halted in " + f.cur + " → " + verdict : "" })]);
        var rows = Object.keys(m.d).map(function (k) { var p = k.split(","); return [p[0], p[1], m.d[k]]; }), live = -1;
        rows.forEach(function (r, j) { if (r[0] === f.cur && f.pos < f.s.length && r[1] === f.s[f.pos]) live = j; });
        lab.section("tt", "Transitions", [lab.table(["state", "input", "next"], rows, live)]);
      }
      build();
    }
  });

  /* =================== THE FETCH–EXECUTE CYCLE (20e, 720 frame) =================== */
  var PROGS = {
    "Add two numbers": { mem: ["LDA 4", "ADD 5", "STO 6", "HLT", "3", "9", "0", ""], start: 0 },
    "Load and store": { mem: ["LDA 4", "STO 5", "HLT", "", "7", "0", "", ""], start: 0 },
    "Running total": { mem: ["LDA 5", "ADD 6", "ADD 7", "STO 4", "HLT", "2", "4", "6"], start: 0 }
  };
  KOS.sims.register({
    id: "cpu-fetch-execute", title: "Fetch–execute cycle", subject: "compsci", ref: "4.7.3.1",
    desc: "Step a short program through fetch, decode and execute: values move between the PC, MAR, MDR, CIR, the accumulator and memory along the address and data buses.",
    mount: function (panel) {
      var prog = "Add two numbers", frames = [];
      var progSel = el("select", { style: "--w: 150px" }, Object.keys(PROGS).map(function (k) { return el("option", { value: k, text: k }); }));
      progSel.onchange = function () { prog = progSel.value; build(); };
      var phases = el("div", { class: "k-seg k-lab-seg", role: "group", "aria-label": "Phase: jump to the next" }, ["Fetch", "Decode", "Execute"].map(function (p) {
        return el("button", { type: "button", class: "k-seg-item", "data-v": p, "aria-pressed": "false", text: p, onclick: function () {
          var from = lab.frame();
          for (var k = from + 1; k < frames.length; k++) if (frames[k].phase === p) { lab.steps(frames, render, { at: k }); return; }
        } });
      }));
      var lab = L.create(panel, { zoom: false, transport: true, speed: true, tick: 1000, label: "The processor's registers, memory and buses", readout: ["now", "values", "legend"],
        controls: [phases, L.field("Program", progSel)], onReset: function () { build(); } });
      lab.legend([["ring-hot", "register being written"], ["line-hot", "bus in use"], ["fill-front", "memory cell addressed"]]);
      function b4(n) { var s = n.toString(2); while (s.length < 4) s = "0" + s; return s; }
      function build() {
        var mem = PROGS[prog].mem.slice(), r = { PC: 0, MAR: null, MDR: null, CIR: null, ACC: 0 }, out = [], guard = 0, cycle = 0;
        function snap(phase, step, write, bus, cell, say) {
          out.push({ phase: phase, step: step, write: write || [], bus: bus || null, cell: cell == null ? null : cell, say: say, r: JSON.parse(JSON.stringify(r)), mem: mem.slice(), cycle: cycle });
        }
        snap(null, 0, [], null, null, ["The PC holds 0000, the address of the first instruction. Step › to fetch it."]);
        while (guard++ < 40) {
          cycle++;
          r.MAR = r.PC; snap("Fetch", 1, ["MAR"], "PC→MAR", null, ["Fetch: copy the PC into the MAR. The MAR holds the address to read: " + b4(r.MAR) + "."]);
          r.MDR = mem[r.MAR]; snap("Fetch", 2, ["MDR"], "address", r.MAR, ["Fetch: the address in the MAR (" + b4(r.MAR) + ") goes out on the ", ["address bus", "hot"], "; the instruction there, " + r.MDR + ", comes back to the MDR on the data bus."]);
          r.PC = r.PC + 1; snap("Fetch", 3, ["PC"], null, null, ["Fetch: increment the PC to " + b4(r.PC) + ", ready for the next instruction."]);
          r.CIR = r.MDR; snap("Fetch", 4, ["CIR"], "MDR→CIR", null, ["Fetch: copy the MDR into the CIR, which holds the instruction being run."]);
          var m = /^(LDA|ADD|STO|HLT)\s*(\d*)$/.exec(r.CIR || ""), op = m ? m[1] : "HLT", n = m && m[2] ? +m[2] : null;
          snap("Decode", 1, [], "CIR→CU", null, ["Decode: the control unit splits " + r.CIR + " into the opcode, ", [op, "hot"], n != null ? ", and the operand, address " + b4(n) + "." : ", which has no operand."]);
          if (op === "HLT") { snap("Execute", 1, [], null, null, ["Execute: HLT stops the cycle. ", ["Halted", "done"], " after " + cycle + " instruction" + (cycle > 1 ? "s" : "") + "."]); break; }
          r.MAR = n; snap("Execute", 1, ["MAR"], "CIR→MAR", null, ["Execute: copy the operand, " + b4(n) + ", into the MAR."]);
          if (op === "STO") {
            r.MDR = r.ACC; snap("Execute", 2, ["MDR"], "ACC→MDR", null, ["Execute: copy the accumulator, " + r.ACC + ", into the MDR."]);
            mem[n] = String(r.MDR); snap("Execute", 3, [], "data", n, ["Execute: write the MDR to memory at " + b4(n) + " along the ", ["data bus", "hot"], "."]);
          } else {
            r.MDR = mem[n]; snap("Execute", 2, ["MDR"], "address", n, ["Execute: read memory at " + b4(n) + " into the MDR: " + r.MDR + "."]);
            var before = r.ACC;
            r.ACC = op === "LDA" ? +r.MDR || 0 : (+r.ACC || 0) + (+r.MDR || 0);
            snap("Execute", 3, ["ACC"], op === "LDA" ? "MDR→ACC" : "ALU", null, op === "LDA" ? ["Execute: load the MDR into the accumulator: ACC = " + r.ACC + "."] : ["Execute: the ALU adds the MDR to the accumulator: " + before + " + " + r.MDR + " = ", [String(r.ACC), "done"], "."]);
          }
        }
        frames = out;
        lab.steps(frames, render);
      }
      function box(d, x, y, w, name, val, hot) {
        d.text(x, y - 8, name, { size: 14, tone: hot ? "hot" : "mute", anchor: "start", weight: "bold" });
        d.rect(x, y, w, 44, { rx: 10, tone: hot ? "hot-ring" : null });
        d.text(x + 12, y + 28, val == null ? "—" : String(val), { size: 16, weight: "bold", anchor: "start", tone: val == null ? "mute" : null });
      }
      function render(f, i, n) {
        phases.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === f.phase)); });
        lab.draw(function (d) {
          var w = function (k) { return f.write.indexOf(k) >= 0; };
          box(d, 40, 60, 120, "PC", b4(f.r.PC), w("PC"));
          box(d, 190, 60, 120, "CIR", f.r.CIR, w("CIR"));
          box(d, 40, 160, 120, "MAR", f.r.MAR == null ? null : b4(f.r.MAR), w("MAR"));
          box(d, 190, 160, 120, "ACC", b4(f.r.ACC & 15) + " (" + f.r.ACC + ")", w("ACC"));
          box(d, 40, 260, 120, "MDR", f.r.MDR, w("MDR"));
          d.rect(190, 260, 120, 44, { rx: 10, tone: f.bus === "ALU" || f.bus === "CIR→CU" ? "hot-ring" : "well" });
          d.text(250, 288, "CU · ALU", { size: 15, weight: "bold", tone: f.bus === "ALU" || f.bus === "CIR→CU" ? "hot" : "sub" });
          /* memory */
          var MX = 560, MY = 44, MH = 40;
          d.text(MX, MY - 12, "Memory", { size: 14, tone: "mute", weight: "bold", anchor: "start" });
          f.mem.forEach(function (v, a) {
            var y = MY + a * (MH + 4), on = f.cell === a, pcHere = f.r.PC === a && !f.phase;
            d.rect(MX, y, 200, MH, { rx: 8, tone: on ? "front-wash" : pcHere ? "ink" : null });
            d.text(MX + 12, y + 26, b4(a), { size: 14, tone: "mute", anchor: "start" });
            d.text(MX + 76, y + 26, v || "", { size: 15, weight: "bold", anchor: "start", tone: on ? "front" : null });
          });
          /* the buses: address from the MAR, data to and from the MDR */
          var addrOn = f.bus === "address", dataOn = f.bus === "data" || f.bus === "address";
          d.line(160, 182, 520, 182, { tone: addrOn ? "hot" : "line" });
          d.text(340, 174, "address bus", { size: 14, tone: addrOn ? "hot" : "mute" });
          d.line(160, 282, 520, 282, { tone: dataOn ? "hot" : "line" });
          d.text(340, 274, "data bus", { size: 14, tone: dataOn ? "hot" : "mute" });
          if (f.cell != null) d.line(520, f.bus === "data" ? 282 : 182, MX - 4, MY + f.cell * (MH + 4) + MH / 2, { tone: "hot", arrow: true });
          if (f.bus && f.bus !== "address" && f.bus !== "data" && f.bus !== "ALU" && f.bus !== "CIR→CU") {
            var at = { PC: [100, 104], CIR: [250, 104], MAR: [100, 204], ACC: [250, 204], MDR: [100, 304] }, p = f.bus.split("→"), a = at[p[0]], b = at[p[1]];
            if (a && b) d.line(a[0] + (b[0] > a[0] ? 40 : b[0] < a[0] ? -40 : 0), a[1] + (b[1] > a[1] ? 0 : b[1] < a[1] ? -44 : 0), b[0], b[1] + (b[1] > a[1] ? -44 : b[1] < a[1] ? 0 : -22), { tone: "hot", arrow: true });
          }
          if (f.phase) d.text(40, 380, f.phase + (f.bus === "address" ? " · MDR ← [MAR]" : f.bus === "data" ? " · [MAR] ← MDR" : ""), { size: 16, weight: "bold", tone: "hot", anchor: "start" });
          return { w: 800, h: 450 };
        });
        lab.now(f.say, f.phase ? f.phase + " " + f.step + " · instruction " + f.cycle : null);
        lab.values([["PC", b4(f.r.PC), f.write.indexOf("PC") >= 0 ? "hot" : null], ["MAR", f.r.MAR == null ? "—" : b4(f.r.MAR)], ["MDR", f.r.MDR == null ? "—" : String(f.r.MDR), f.write.indexOf("MDR") >= 0 ? "hot" : null],
          ["CIR", f.r.CIR || "—"], ["ACC", String(f.r.ACC), f.write.indexOf("ACC") >= 0 ? "done" : null]]);
      }
      build();
    }
  });
})();
