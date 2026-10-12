/* Kurenai OS — labs/sandboxes.js
   Three sandboxes on the lab system's text kind (lab.js `work`): the
   editor and its result fill the stage's column, the readout beside them
   holds the answer, the working and the reference.
     sql-sandbox   (4.10.4)  — SELECT on a sample table, with the query plan
     regex-sandbox (4.4.2.3) — a regular expression, every match marked
     lmc-sandbox   (4.7.3.5) — Little Man Computer: assemble once, then the
                               lab transport steps the fetch–execute run
   (base-sandbox moved to sims-bits.js, on the bits archetype.)
   Loaded after lab.js and sims.js. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;
  function txtIn(v, w, label) { return el("input", { type: "text", value: v, class: "k-mono", spellcheck: "false", autocomplete: "off", style: "--w: " + w + "px", "aria-label": label }); }
  function tagOf(pane) { return pane.querySelector("[data-ui~='lab.pane-tag']"); }

  /* ============================ 1. SQL SANDBOX ============================ */
  var COLS = ["ID", "Name", "Subject", "Grade", "Age"];
  var DATA = [
    { ID: 1, Name: "Aiko",   Subject: "CompSci", Grade: 88, Age: 17 },
    { ID: 2, Name: "Ben",    Subject: "Maths",   Grade: 72, Age: 18 },
    { ID: 3, Name: "Chiara", Subject: "CompSci", Grade: 91, Age: 17 },
    { ID: 4, Name: "Deng",   Subject: "Physics", Grade: 64, Age: 18 },
    { ID: 5, Name: "Esme",   Subject: "Maths",   Grade: 95, Age: 16 },
    { ID: 6, Name: "Femi",   Subject: "CompSci", Grade: 58, Age: 17 }
  ];
  var QUERIES = [
    ["all", "Every row", "SELECT * FROM Student"],
    ["filter", "CompSci over 60", "SELECT Name, Grade FROM Student WHERE Subject = 'CompSci' AND Grade > 60 ORDER BY Grade DESC"],
    ["top", "Top three", "SELECT Name, Subject, Grade FROM Student ORDER BY Grade DESC LIMIT 3"]
  ];
  KOS.sims.register({
    id: "sql-sandbox", title: "SQL Sandbox — query a live table", subject: "compsci", ref: "4.10.4",
    desc: "Run real SELECT queries against a sample Student table: WHERE, AND/OR, ORDER BY and LIMIT all work. Read the result set update as you change the query.",
    mount: function (panel) {
      var q = L.editor("SQL query", "SELECT Name, Subject, Grade FROM Student WHERE Grade >= 70 ORDER BY Grade DESC", { rows: 3 });
      var result = el("div", { class: "k-lab-tablewrap", "data-ui": "lab.sql-result" });
      var resultPane = L.pane("Result", [L.scrollTable(result)], { tag: "" });
      var picks = L.choice(QUERIES.map(function (x) { return [x[0], x[1]]; }), null, function (v) {
        q.value = QUERIES.filter(function (x) { return x[0] === v; })[0][2]; run();
      }, "Example queries");
      var lab = L.create(panel, {
        zoom: false,
        work: [L.pane("Query", [q], { tag: "⌘/Ctrl + Enter runs it" }), resultPane],
        readout: ["now", "plan", "values"],
        controls: [L.action("Run query", run, true), L.sep(), picks]
      });
      lab.values([["table", "Student"], ["columns", COLS.join(", ")], ["rows", String(DATA.length)]], "Table");
      q.addEventListener("input", function () { picks.set(null); });
      q.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); run(); } });

      function cmp(a, op, b) {
        switch (op) { case "=": case "==": return a == b; case "!=": case "<>": return a != b;   // eslint-disable-line eqeqeq
          case ">": return a > b; case "<": return a < b; case ">=": return a >= b; case "<=": return a <= b; }
        return false;
      }
      function val(tok) {
        tok = tok.trim();
        if (/^'.*'$/.test(tok) || /^".*"$/.test(tok)) return tok.slice(1, -1);
        var n = parseFloat(tok); return isNaN(n) ? tok : n;
      }
      function testRow(row, where) {
        if (!where) return true;
        /* OR binds loosest, then AND */
        return where.split(/\s+OR\s+/i).some(function (orPart) {
          return orPart.split(/\s+AND\s+/i).every(function (cond) {
            var m = cond.trim().match(/^(\w+)\s*(<=|>=|<>|!=|==|=|<|>)\s*(.+)$/);
            if (!m) throw new Error("I can't read the condition “" + cond.trim() + "”.");
            if (COLS.indexOf(m[1]) < 0) throw new Error("There is no column called " + m[1] + ".");
            return cmp(row[m[1]], m[2], val(m[3]));
          });
        });
      }
      function fail(msg) {
        result.innerHTML = "";
        tagOf(resultPane).textContent = "";
        lab.answer("Result", "SQL error", msg, null, "hot");
        lab.section("plan", "Plan", null);
      }
      function run() {
        var sql = q.value.replace(/;\s*$/, "").trim();
        var m = sql.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)(\s+ASC|\s+DESC)?)?(?:\s+LIMIT\s+(\d+))?$/i);
        if (!m) { fail("The shape is SELECT columns FROM Student [WHERE …] [ORDER BY column [ASC|DESC]] [LIMIT n]."); return; }
        try {
          if (!/^student$/i.test(m[2])) throw new Error("Only the Student table exists here.");
          var cols = m[1].trim() === "*" ? COLS.slice() : m[1].split(",").map(function (c) { return c.trim(); });
          cols.forEach(function (c) { if (COLS.indexOf(c) < 0) throw new Error("There is no column called " + c + "."); });
          var plan = [["FROM Student", DATA.length + " rows"]];
          var rows = DATA.filter(function (r) { return testRow(r, m[3]); });
          if (m[3]) plan.push(["WHERE " + m[3].trim(), rows.length + " kept"]);
          if (m[4]) {
            if (COLS.indexOf(m[4]) < 0) throw new Error("There is no column called " + m[4] + " to order by.");
            var desc = /DESC/i.test(m[5] || "");
            rows = rows.slice().sort(function (a, b) { return (a[m[4]] > b[m[4]] ? 1 : a[m[4]] < b[m[4]] ? -1 : 0) * (desc ? -1 : 1); });
            plan.push(["ORDER BY " + m[4] + (desc ? " DESC" : " ASC"), desc ? "largest first" : "smallest first"]);
          }
          if (m[6]) { rows = rows.slice(0, parseInt(m[6], 10)); plan.push(["LIMIT " + m[6], rows.length + " left"]); }
          plan.push(["SELECT " + (m[1].trim() === "*" ? "*" : cols.join(", ")), cols.length + " column" + (cols.length === 1 ? "" : "s")]);
          result.innerHTML = "";
          result.appendChild(lab.table(cols, rows.map(function (r) { return cols.map(function (c) { return String(r[c]); }); }), null, { hook: "lab.sql-rows" }));
          tagOf(resultPane).textContent = rows.length + " row" + (rows.length === 1 ? "" : "s");
          lab.answer("Result", rows.length + " row" + (rows.length === 1 ? "" : "s"), "returned from " + DATA.length + ", in the order the plan below runs it.");
          lab.section("plan", "Plan", [lab.table(null, plan)]);
        } catch (e) { fail(e.message); }
      }
      run();
    }
  });

  /* ============================ 2. REGEX SANDBOX ============================ */
  var META = [[".", "any one character"], ["*", "0 or more of the last"], ["+", "1 or more"], ["?", "0 or 1"], ["|", "either side"],
    ["[a-z]", "one from the set"], ["( )", "a group"], ["^ $", "start · end"]];
  KOS.sims.register({
    id: "regex-sandbox", title: "Regex Sandbox — match & highlight", subject: "compsci", ref: "4.4.2.3",
    desc: "Type a regular expression and a test string; every match is highlighted live. Covers the metacharacters in the spec: . * + ? | [] () and anchors.",
    mount: function (panel) {
      var pat = txtIn("[A-Z][a-z]+", 220, "Regular expression");
      var g = true, ci = false;
      var text = L.editor("Test text", "The Quick brown Fox jumps over 12 lazy Dogs in 2024.", { rows: 3, mono: false });
      var marked = L.out("lab.regex-marked");
      var hitPane = L.pane("Matches", [marked], { tag: "" });
      var lab = L.create(panel, {
        zoom: false,
        work: [L.pane("Test text", [text]), hitPane],
        readout: ["now", "values", "meta"],
        controls: [L.field("/ pattern /", pat), L.toggle("g · every match", g, function (on) { g = on; run(); }), L.toggle("i · ignore case", ci, function (on) { ci = on; run(); })]
      });
      lab.section("meta", "Metacharacters", [lab.table(null, META)]);
      [pat, text].forEach(function (f) { f.addEventListener("input", run); });
      var esc = KOS.ui.esc;
      function run() {
        var flags = (g ? "g" : "") + (ci ? "i" : ""), re;
        try { re = new RegExp(pat.value, flags.indexOf("g") >= 0 ? flags : flags + "g"); }
        catch (e) {
          marked.textContent = text.value;
          tagOf(hitPane).textContent = "";
          lab.answer("Matches", "Invalid", e.message.replace(/^Invalid regular expression: /, ""), null, "hot");
          lab.values([]);
          return;
        }
        var src = text.value, html = "", last = 0, found = [], m, guard = 0;
        while ((m = re.exec(src)) !== null && guard++ < 5000) {
          if (m.index >= last) {
            html += esc(src.slice(last, m.index)) + "<mark class='k-lab-rx-hit'>" + esc(m[0] || "") + "</mark>";
            last = m.index + (m[0].length || 0);
            found.push([m.index, m[0]]);
          }
          if (m[0] === "") re.lastIndex++;       /* a zero-width match must still move on */
          if (!g) break;
        }
        html += esc(src.slice(last));
        marked.innerHTML = html;
        tagOf(hitPane).textContent = found.length + " match" + (found.length === 1 ? "" : "es");
        lab.answer("Matches", String(found.length), !g && found.length ? "Without g the search stops at the first match." : found.length ? null : "Nothing in the text fits /" + pat.value + "/.");
        lab.values(found.slice(0, 10).map(function (f) { return ["at " + f[0], "“" + f[1] + "”", "front"]; }), found.length > 10 ? "First ten" : "Each match");
      }
      run();
    }
  });

  /* ====================== 3. LITTLE MAN COMPUTER (assembly) ====================== */
  var OPS = { ADD: 1, SUB: 2, STA: 3, LDA: 5, BRA: 6, BRZ: 7, BRP: 8 };
  var LMC_DEFAULT = "        INP\n        STA  A\n        INP\n        ADD  A\n        OUT\n        HLT\nA       DAT";
  var MAX_STEPS = 500;
  function fmtInstr(v) {
    var op = Math.floor(v / 100), arg = v % 100;
    if (v === 0) return "HLT"; if (v === 901) return "INP"; if (v === 902) return "OUT";
    var nm = Object.keys(OPS).filter(function (k) { return OPS[k] === op; })[0];
    return nm ? nm + " " + arg : "DAT " + v;
  }
  /* two passes: labels, then 3-digit codes. {mem, lines} or {error} */
  function assemble(source) {
    var labels = {}, prog = [];
    source.split("\n").map(function (l) { return l.replace(/\/\/.*$/, "").replace(/\s+$/, ""); }).forEach(function (line) {
      if (!line.trim()) return;
      var toks = line.trim().split(/\s+/), label = null;
      if (/^\S/.test(line) && !OPS[toks[0].toUpperCase()] && !/^(INP|OUT|HLT|DAT)$/i.test(toks[0])) label = toks.shift();
      if (label) labels[label] = prog.length;
      prog.push({ mnem: (toks[0] || "").toUpperCase(), operand: toks[1], text: line.trim() });
    });
    var mem = [];
    for (var i = 0; i < prog.length; i++) {
      var p = prog[i], code;
      if (p.mnem === "HLT" || p.mnem === "COB") code = 0;
      else if (p.mnem === "INP") code = 901;
      else if (p.mnem === "OUT") code = 902;
      else if (p.mnem === "DAT") code = p.operand !== undefined ? (parseInt(p.operand, 10) || 0) : 0;
      else if (OPS[p.mnem] !== undefined) {
        if (p.operand === undefined) return { error: p.mnem + " needs an operand (“" + p.text + "”)." };
        var addr = Object.prototype.hasOwnProperty.call(labels, p.operand) ? labels[p.operand] : parseInt(p.operand, 10);
        if (isNaN(addr)) return { error: "Unknown label or address “" + p.operand + "”." };
        code = OPS[p.mnem] * 100 + addr;
      } else return { error: "Unknown mnemonic “" + p.mnem + "”." };
      mem.push(code);
    }
    while (mem.length % 10 || !mem.length) mem.push(0);
    return { mem: mem, count: prog.length };
  }
  /* the whole run as frames, once (the lab transport replays them) */
  function execute(mem0, inbox) {
    var mem = mem0.slice(), ACC = 0, PC = 0, IN = inbox.slice(), OUT = [], frames = [];
    function snap(extra) {
      frames.push(Object.assign({ mem: mem.slice(), acc: ACC, pc: PC, inbox: IN.slice(), outbox: OUT.slice() }, extra));
    }
    snap({ say: ["Assembled. PC = 0: the first fetch reads mailbox 0."], halted: false });
    for (var n = 0; n < MAX_STEPS; n++) {
      if (PC < 0 || PC >= mem.length) { snap({ say: [["The PC ran off the end of memory — halted.", "hot"]], halted: true }); break; }
      var at = PC, instr = mem[PC], op = Math.floor(instr / 100), arg = instr % 100, say, halt = false, wrote = null;
      PC++;
      if (instr === 0) { halt = true; say = "HLT — the program stops."; }
      else if (op === 1) { ACC = (ACC + (mem[arg] || 0)) % 1000; say = "ADD " + arg + ": ACC + mailbox " + arg + " = " + ACC + "."; }
      else if (op === 2) { ACC = ACC - (mem[arg] || 0); say = "SUB " + arg + ": ACC − mailbox " + arg + " = " + ACC + (ACC < 0 ? " (negative: BRP will not branch)." : "."); }
      else if (op === 3) { mem[arg] = ((ACC % 1000) + 1000) % 1000; wrote = arg; say = "STA " + arg + ": ACC stored in mailbox " + arg + "."; }
      else if (op === 5) { ACC = mem[arg] || 0; say = "LDA " + arg + ": mailbox " + arg + " loaded into ACC (" + ACC + ")."; }
      else if (op === 6) { PC = arg; say = "BRA " + arg + ": PC set to " + arg + "."; }
      else if (op === 7) { if (ACC === 0) PC = arg; say = "BRZ " + arg + ": ACC is " + ACC + (ACC === 0 ? ", so branch to " + arg + "." : ", so carry on."); }
      else if (op === 8) { if (ACC >= 0) PC = arg; say = "BRP " + arg + ": ACC is " + ACC + (ACC >= 0 ? ", so branch to " + arg + "." : ", so carry on."); }
      else if (instr === 901) {
        if (IN.length) { ACC = IN.shift(); say = "INP: " + ACC + " taken from the INBOX into ACC."; }
        else { halt = true; say = [["INP with an empty INBOX — halted.", "hot"]]; }
      }
      else if (instr === 902) { OUT.push(ACC); say = "OUT: " + ACC + " written to the OUTBOX."; }
      else { halt = true; say = [["Illegal instruction " + instr + " — halted.", "hot"]]; }
      snap({ say: typeof say === "string" ? [say] : say, executed: at, instr: instr, wrote: wrote, halted: halt });
      if (halt) break;
    }
    if (frames.length > MAX_STEPS) frames[frames.length - 1].say = [["Stopped after " + MAX_STEPS + " steps — is there a loop with no way out?", "hot"]];
    return frames;
  }

  KOS.sims.register({
    id: "lmc-sandbox", title: "Little Man Computer — assembly", subject: "compsci", ref: "4.7.3.5",
    desc: "Write LMC assembly, assemble it to 3-digit machine code, then single-step the fetch–execute cycle watching the accumulator, program counter, memory and output change.",
    mount: function (panel) {
      var src = L.editor("LMC assembly", LMC_DEFAULT, { rows: 8 });
      var inbox = txtIn("8, 5", 110, "INBOX values, left to right");
      var grid = el("div", { class: "k-lab-mem", "data-ui": "lab.lmc-memory" });
      var progPane = L.pane("Program", [src], { tag: "" }), memPane = L.pane("Memory", [el("div", { class: "k-lab-pane-body" }, [grid])], { tag: "mailbox · machine code" });
      var frames = [], stale = false;
      var lab = L.create(panel, {
        zoom: false, transport: true, speed: true, tick: 700,
        work: [progPane, memPane],
        readout: ["now", "values", "legend"],
        nowTitle: "Fetch–execute",
        controls: [L.field("INBOX", inbox), L.action("Assemble", load, true)],
        onReset: function () { lab.steps(frames, render); }
      });
      lab.legend([["ring-front", "the PC: the next fetch"], ["fill-done", "a mailbox just written"], ["fill-mute", "an empty mailbox"]]);
      src.addEventListener("input", function () { stale = true; lab.now([["The program changed — Assemble to run the new version.", "front"]]); });
      function load() {
        stale = false;
        var a = assemble(src.value);
        if (a.error) {
          frames = [];
          tagOf(progPane).textContent = "";
          lab.steps([], render);
          grid.innerHTML = "";
          lab.now([["Assemble error: " + a.error, "hot"]]);
          lab.values([]);
          return;
        }
        tagOf(progPane).textContent = a.count + " instruction" + (a.count === 1 ? "" : "s");
        frames = execute(a.mem, inbox.value.split(/[\s,]+/).filter(Boolean).map(Number).filter(function (x) { return !isNaN(x); }));
        lab.steps(frames, render);
      }
      function render(f) {
        grid.innerHTML = "";
        f.mem.forEach(function (v, i) {
          var st = [i === f.pc && !f.halted ? "current" : "", i === f.wrote ? "written" : "", v ? "" : "empty"].join(" ").trim();
          grid.appendChild(el("div", { class: "k-lab-mem-cell k-mono", "data-state": st || null, title: fmtInstr(v) }, [
            el("div", { class: "k-lab-mem-i", text: String(i) }),
            el("div", { text: ("00" + v).slice(-3) })
          ]));
        });
        if (!stale) lab.now(f.say);
        lab.values([
          ["ACC", String(f.acc), "front"],
          ["PC", String(f.pc), "ink"],
          f.instr != null ? ["executed", f.executed + ": " + fmtInstr(f.instr)] : null,
          ["INBOX", f.inbox.join(" ") || "—"],
          ["OUTBOX", f.outbox.join(" ") || "—", f.outbox.length ? "done" : null],
          ["state", f.halted ? "halted" : "running", f.halted ? "hot" : null]
        ], "Registers");
      }
      load();
    }
  });

})();
