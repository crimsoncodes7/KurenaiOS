/* Kurenai OS — labs/sandboxes.js
   Free-form interactive sandboxes, registered as sims so they mount INLINE on
   their topic's Simulate tab:
     sql-sandbox   (4.10.4)  — run SELECT queries on a sample table
     regex-sandbox (4.4.2.3) — test a regular expression, highlight matches
     base-sandbox  (4.5.2.1) — convert a value between denary/binary/octal/hex
     lmc-sandbox   (4.7.3.5) — Little Man Computer: assemble + step machine code
   Loaded after sims.js so KOS.sims.register exists. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  function controls(children) { return el("div", { class: "lab-controls" }, children); }
  function mono(node, css) { node.style.cssText = "font-family:var(--mono);" + (css || ""); return node; }

  /* ============================ 1. SQL SANDBOX ============================ */
  KOS.sims.register({
    id: "sql-sandbox", title: "SQL Sandbox — query a live table", subject: "compsci", ref: "4.10.4",
    desc: "Run real SELECT queries against a sample Student table: WHERE, AND/OR, ORDER BY and LIMIT all work. Read the result set update as you change the query.",
    mount: function (panel) {
      var COLS = ["ID", "Name", "Subject", "Grade", "Age"];
      var DATA = [
        { ID: 1, Name: "Aiko",  Subject: "CompSci", Grade: 88, Age: 17 },
        { ID: 2, Name: "Ben",   Subject: "Maths",   Grade: 72, Age: 18 },
        { ID: 3, Name: "Chiara",Subject: "CompSci", Grade: 91, Age: 17 },
        { ID: 4, Name: "Deng",  Subject: "Physics", Grade: 64, Age: 18 },
        { ID: 5, Name: "Esme",  Subject: "Maths",   Grade: 95, Age: 16 },
        { ID: 6, Name: "Femi",  Subject: "CompSci", Grade: 58, Age: 17 }
      ];
      panel.appendChild(el("p", { class: "sub", style: "margin-top:0" },
        ["Table ", mono(el("b", {}, ["Student(ID, Name, Subject, Grade, Age)"])), " — 6 rows. Try ",
         mono(el("code", {}, ["SELECT Name, Grade FROM Student WHERE Subject = 'CompSci' AND Grade > 60 ORDER BY Grade DESC"]), "font-size:11px")]));
      var q = el("textarea", { class: "note-area", style: "min-height:64px;font-family:var(--mono);font-size:12.5px" });
      q.value = "SELECT Name, Subject, Grade FROM Student WHERE Grade >= 70 ORDER BY Grade DESC";
      panel.appendChild(q);
      panel.appendChild(controls([
        el("button", { class: "btn primary", text: "Run query", onclick: run }),
        el("button", { class: "btn gold", text: "Reset", onclick: function () {
          q.value = "SELECT * FROM Student"; run(); } })
      ]));
      var out = el("div", { style: "margin-top:12px" });
      panel.appendChild(out);

      function cmp(a, op, b) {
        switch (op) { case "=": case "==": return a == b; case "!=": case "<>": return a != b;
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
        // split on OR (lowest precedence), then AND
        return where.split(/\s+OR\s+/i).some(function (orPart) {
          return orPart.split(/\s+AND\s+/i).every(function (cond) {
            var m = cond.trim().match(/^(\w+)\s*(<=|>=|<>|!=|==|=|<|>)\s*(.+)$/);
            if (!m) throw new Error("bad condition: " + cond.trim());
            if (COLS.indexOf(m[1]) < 0) throw new Error("unknown column: " + m[1]);
            return cmp(row[m[1]], m[2], val(m[3]));
          });
        });
      }
      function run() {
        out.innerHTML = "";
        var sql = q.value.replace(/;\s*$/, "").trim();
        var m = sql.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)(\s+ASC|\s+DESC)?)?(?:\s+LIMIT\s+(\d+))?$/i);
        if (!m) { out.appendChild(el("div", { class: "n-call n-call-warn", text: "Couldn't parse that. Shape: SELECT cols FROM Student [WHERE …] [ORDER BY col [ASC|DESC]] [LIMIT n]" })); return; }
        try {
          var table = m[2];
          if (!/^student$/i.test(table)) throw new Error("only the Student table exists");
          var cols = m[1].trim() === "*" ? COLS.slice() : m[1].split(",").map(function (c) { return c.trim(); });
          cols.forEach(function (c) { if (COLS.indexOf(c) < 0) throw new Error("unknown column: " + c); });
          var rows = DATA.filter(function (r) { return testRow(r, m[3]); });
          if (m[4]) {
            if (COLS.indexOf(m[4]) < 0) throw new Error("unknown ORDER BY column: " + m[4]);
            var desc = /DESC/i.test(m[5] || "");
            rows = rows.slice().sort(function (a, b) {
              return (a[m[4]] > b[m[4]] ? 1 : a[m[4]] < b[m[4]] ? -1 : 0) * (desc ? -1 : 1); });
          }
          if (m[6]) rows = rows.slice(0, parseInt(m[6], 10));
          var head = "<thead><tr>" + cols.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead>";
          var body = "<tbody>" + rows.map(function (r) {
            return "<tr>" + cols.map(function (c) { return "<td>" + r[c] + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody>";
          out.appendChild(el("div", { html: "<table class='n-table'>" + head + body + "</table>" }));
          out.appendChild(el("div", { class: "sub", style: "margin-top:6px", text: rows.length + " row" + (rows.length === 1 ? "" : "s") + " returned" }));
        } catch (e) {
          out.appendChild(el("div", { class: "n-call n-call-warn", text: "SQL error: " + e.message }));
        }
      }
      run();
    }
  });

  /* ============================ 2. REGEX SANDBOX ============================ */
  KOS.sims.register({
    id: "regex-sandbox", title: "Regex Sandbox — match & highlight", subject: "compsci", ref: "4.4.2.3",
    desc: "Type a regular expression and a test string; every match is highlighted live. Covers the metacharacters in the spec: . * + ? | [] () and anchors.",
    mount: function (panel) {
      var pat = mono(el("input", { type: "text", value: "[A-Z][a-z]+", style: "width:240px" }));
      var gFlag = el("input", { type: "checkbox" }); gFlag.checked = true;
      var iFlag = el("input", { type: "checkbox" });
      panel.appendChild(controls([
        el("label", {}, ["/", pat, "/"]),
        el("label", { class: "chk" }, [gFlag, "g (global)"]),
        el("label", { class: "chk" }, [iFlag, "i (ignore case)"])
      ]));
      var text = el("textarea", { class: "note-area", style: "min-height:80px;font-family:var(--mono);font-size:13px" });
      text.value = "The Quick brown Fox jumps over 12 lazy Dogs in 2024.";
      panel.appendChild(text);
      var out = el("div", { style: "margin-top:12px" });
      panel.appendChild(out);
      [pat, gFlag, iFlag, text].forEach(function (f) { f.addEventListener("input", run); f.addEventListener("change", run); });

      var esc = KOS.ui.esc;   // canonical — the old local copy didn't escape quotes
      function run() {
        out.innerHTML = "";
        var flags = "" + (gFlag.checked ? "g" : "") + (iFlag.checked ? "i" : "");
        var re;
        try { re = new RegExp(pat.value, flags); }
        catch (e) { out.appendChild(el("div", { class: "n-call n-call-warn", text: "Invalid regex: " + e.message })); return; }
        var src = text.value, html = "", last = 0, matches = [], m, guard = 0;
        var reG = new RegExp(pat.value, flags.indexOf("g") >= 0 ? flags : flags + "g");
        while ((m = reG.exec(src)) !== null && guard++ < 5000) {
          if (m.index >= last) {
            html += esc(src.slice(last, m.index)) + "<mark class='rx-hit'>" + esc(m[0] || "") + "</mark>";
            last = m.index + (m[0].length || 0);
            matches.push(m[0]);
          }
          if (m[0] === "") reG.lastIndex++;       // avoid zero-width infinite loop
          if (flags.indexOf("g") < 0) break;
        }
        html += esc(src.slice(last));
        out.appendChild(el("div", { class: "n-code", style: "white-space:pre-wrap;padding:12px", html: html }));
        out.appendChild(el("div", { class: "sub", style: "margin-top:8px",
          text: matches.length + " match" + (matches.length === 1 ? "" : "es") + (matches.length ? ":  " + matches.slice(0, 12).join("  ·  ") : "") }));
      }
      run();
    }
  });

  /* ============================ 3. BASE CONVERTER ============================ */
  KOS.sims.register({
    id: "base-sandbox", title: "Number Base Converter", subject: "compsci", ref: "4.5.2.1",
    desc: "Type a value in any base — denary, binary, octal or hex — and the others update live, with the repeated-division and place-value working shown.",
    mount: function (panel) {
      var BASES = [["Denary", 10], ["Binary", 2], ["Octal", 8], ["Hex", 16]];
      var fields = {};
      var row = controls([]);
      BASES.forEach(function (b) {
        var f = mono(el("input", { type: "text", value: b[1] === 10 ? "214" : "", style: "width:150px" }));
        f.addEventListener("input", function () { update(b[1]); });
        fields[b[1]] = f;
        row.appendChild(el("label", {}, [b[0] + " (base " + b[1] + ")", f]));
      });
      panel.appendChild(row);
      var work = el("div", { style: "margin-top:12px" });
      panel.appendChild(work);

      function clean(s) { return s.replace(/\s+/g, "").toUpperCase(); }
      function update(fromBase) {
        var raw = clean(fields[fromBase].value);
        if (raw === "") { Object.keys(fields).forEach(function (b) { if (+b !== fromBase) fields[b].value = ""; }); work.innerHTML = ""; return; }
        var n = parseInt(raw, fromBase);
        var valid = raw.split("").every(function (ch) { return parseInt(ch, fromBase) < fromBase && !isNaN(parseInt(ch, fromBase)); });
        if (!valid || isNaN(n)) { work.innerHTML = "<div class='n-call n-call-warn'>“" + raw + "” isn't a valid base-" + fromBase + " number.</div>"; return; }
        BASES.forEach(function (b) {
          if (b[1] !== fromBase) fields[b[1]].value = n.toString(b[1]).toUpperCase();
        });
        // working: denary -> binary by repeated division
        var steps = [], q = n;
        if (n === 0) steps.push("0 ÷ 2 = 0 r 0");
        while (q > 0) { steps.push(q + " ÷ 2 = " + Math.floor(q / 2) + " r " + (q % 2)); q = Math.floor(q / 2); }
        var bin = n.toString(2);
        var place = bin.split("").map(function (bit, i) {
          var p = bin.length - 1 - i; return bit === "1" ? "2^" + p + "(" + Math.pow(2, p) + ")" : null;
        }).filter(Boolean).join(" + ");
        work.innerHTML =
          "<div class='n-call n-call-tip'><b>" + n + " (denary) → binary</b> by repeated division by 2, reading remainders bottom-up:<br>" +
          "<span style='font-family:var(--mono);font-size:11.5px'>" + steps.join("<br>") + "</span><br>→ <b style='font-family:var(--mono)'>" + bin + "</b></div>" +
          "<div class='sub' style='margin-top:8px;font-family:var(--mono)'>place values: " + (place || "0") + " = " + n + "</div>";
      }
      update(10);
    }
  });

  /* ====================== 4. LITTLE MAN COMPUTER (assembly) ====================== */
  KOS.sims.register({
    id: "lmc-sandbox", title: "Little Man Computer — assembly", subject: "compsci", ref: "4.7.3.5",
    desc: "Write LMC assembly, assemble it to 3-digit machine code, then single-step the fetch–execute cycle watching the accumulator, program counter, memory and output change.",
    mount: function (panel) {
      var OPS = { ADD: 1, SUB: 2, STA: 3, LDA: 5, BRA: 6, BRZ: 7, BRP: 8 };
      var DEFAULT = "        INP\n        STA  A\n        INP\n        ADD  A\n        OUT\n        HLT\nA       DAT";
      var src = el("textarea", { class: "note-area", style: "min-height:150px;font-family:var(--mono);font-size:12.5px" });
      src.value = DEFAULT;
      var inbox = mono(el("input", { type: "text", value: "8, 5", style: "width:120px" }));
      var msg = el("span", { class: "sim-msg" });
      panel.appendChild(el("p", { class: "sub", style: "margin-top:0",
        text: "Mnemonics: INP OUT LDA STA ADD SUB BRA BRZ BRP HLT DAT. Labels in the first column; INBOX is read left-to-right." }));
      panel.appendChild(src);
      panel.appendChild(controls([
        el("label", {}, ["INBOX", inbox]),
        el("button", { class: "btn primary", text: "Assemble", onclick: assemble }),
        el("button", { class: "btn", text: "Step ▸", onclick: step }),
        el("button", { class: "btn gold", text: "Run", onclick: runAll }),
        msg
      ]));
      var regWrap = el("div", { style: "display:flex;gap:18px;flex-wrap:wrap;margin:12px 0;font-family:var(--mono)" });
      panel.appendChild(regWrap);
      var memWrap = el("div", { style: "margin-top:6px" });
      panel.appendChild(memWrap);

      var mem = [], labels = {}, ACC = 0, PC = 0, IN = [], OUT = [], halted = true, srcLine = [];

      function assemble() {
        mem = []; labels = {}; srcLine = []; ACC = 0; PC = 0; OUT = []; halted = false;
        IN = inbox.value.split(/[\s,]+/).filter(Boolean).map(Number);
        var lines = src.value.split("\n").map(function (l) { return l.replace(/\/\/.*$/, "").replace(/\s+$/, ""); });
        var prog = [];
        // pass 1: collect labels + tokenise
        lines.forEach(function (line) {
          if (!line.trim()) return;
          var leadingLabel = /^\S/.test(line);
          var toks = line.trim().split(/\s+/);
          var label = null;
          if (leadingLabel && !OPS[toks[0].toUpperCase()] && !/^(INP|OUT|HLT|DAT)$/i.test(toks[0])) { label = toks.shift(); }
          var mnem = (toks[0] || "").toUpperCase(), operand = toks[1];
          if (label) labels[label] = prog.length;
          prog.push({ mnem: mnem, operand: operand, addr: prog.length, text: line.trim() });
        });
        // pass 2: encode
        try {
          prog.forEach(function (p) {
            var code;
            if (p.mnem === "HLT" || p.mnem === "COB") code = 0;
            else if (p.mnem === "INP") code = 901;
            else if (p.mnem === "OUT") code = 902;
            else if (p.mnem === "DAT") code = p.operand !== undefined ? (parseInt(p.operand, 10) || 0) : 0;
            else if (OPS[p.mnem] !== undefined) {
              var a = p.operand;
              if (a === undefined) throw new Error(p.mnem + " needs an operand (line: " + p.text + ")");
              var addr = labels.hasOwnProperty(a) ? labels[a] : parseInt(a, 10);
              if (isNaN(addr)) throw new Error("unknown label/address “" + a + "”");
              code = OPS[p.mnem] * 100 + addr;
            } else throw new Error("unknown mnemonic “" + p.mnem + "”");
            mem.push(code); srcLine.push(p.text);
          });
          while (mem.length < Math.max(mem.length, (Math.ceil(mem.length / 10) * 10) || 10)) mem.push(0);
          msg.textContent = "assembled " + prog.length + " instructions — press Step ▸"; halted = false;
        } catch (e) { msg.textContent = "assemble error: " + e.message; halted = true; }
        draw();
      }
      function step() {
        if (halted) return;
        if (PC < 0 || PC >= mem.length) { halted = true; msg.textContent = "PC ran off the end — halted"; draw(); return; }
        var instr = mem[PC], op = Math.floor(instr / 100), arg = instr % 100, executed = PC;
        PC++;
        if (instr === 0) { halted = true; msg.textContent = "HLT at " + executed; }
        else if (op === 1) ACC = (ACC + (mem[arg] || 0)) % 1000;
        else if (op === 2) { ACC = ACC - (mem[arg] || 0); }
        else if (op === 3) mem[arg] = ((ACC % 1000) + 1000) % 1000;
        else if (op === 5) ACC = mem[arg] || 0;
        else if (op === 6) PC = arg;
        else if (op === 7) { if (ACC === 0) PC = arg; }
        else if (op === 8) { if (ACC >= 0) PC = arg; }
        else if (instr === 901) { if (IN.length) { ACC = IN.shift(); } else { halted = true; msg.textContent = "INBOX empty — halted"; } }
        else if (instr === 902) { OUT.push(ACC); }
        else { halted = true; msg.textContent = "illegal opcode " + instr + " — halted"; }
        if (!halted && msg.textContent.indexOf("error") < 0) msg.textContent = "executed mailbox " + executed + " (" + fmtInstr(instr) + ")";
        draw();
      }
      function runAll() { var g = 0; while (!halted && g++ < 1000) step(); if (g >= 1000) msg.textContent = "stopped after 1000 steps (infinite loop?)"; }
      function fmtInstr(v) {
        var op = Math.floor(v / 100), arg = v % 100;
        if (v === 0) return "HLT"; if (v === 901) return "INP"; if (v === 902) return "OUT";
        var nm = Object.keys(OPS).filter(function (k) { return OPS[k] === op; })[0];
        return nm ? nm + " " + arg : "DAT " + v;
      }
      function chip(label, value, accent) {
        return el("div", { style: "min-width:84px;padding:8px 12px;border:1px solid var(--glass-edge);border-radius:8px;background:var(--glass-fill)" }, [
          el("div", { class: "sub", style: "font-size:9.5px;letter-spacing:.1em", text: label }),
          el("div", { style: "font-size:18px;color:" + (accent || "var(--text)"), text: String(value) })
        ]);
      }
      function draw() {
        regWrap.innerHTML = "";
        regWrap.appendChild(chip("ACC", ACC, "var(--gold)"));
        regWrap.appendChild(chip("PC", PC, "var(--c-compsci)"));
        regWrap.appendChild(chip("INBOX", IN.join(" ") || "—"));
        regWrap.appendChild(chip("OUTBOX", OUT.join(" ") || "—", "var(--kurenai)"));
        regWrap.appendChild(chip("STATE", halted ? "halted" : "ready"));
        // memory grid
        memWrap.innerHTML = "";
        if (!mem.length) return;
        var grid = el("div", { style: "display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-width:680px" });
        mem.forEach(function (v, i) {
          var cur = (i === PC && !halted);
          var cell = el("div", {
            style: "padding:6px 2px;text-align:center;border-radius:6px;font-family:var(--mono);font-size:11px;" +
              "border:1px solid " + (cur ? "var(--gold)" : "var(--line)") + ";" +
              "background:" + (cur ? "rgba(242,196,109,.15)" : "var(--raise)") + ";" +
              "color:" + (v ? "var(--text)" : "var(--faint)")
          }, [
            el("div", { style: "font-size:8.5px;color:var(--faint)", text: String(i) }),
            el("div", { text: ("00" + v).slice(-3) })
          ]);
          grid.appendChild(cell);
        });
        memWrap.appendChild(el("div", { class: "sub", style: "margin-bottom:4px", text: "memory (mailbox : 3-digit machine code) — current PC highlighted" }));
        memWrap.appendChild(grid);
      }
      assemble();
    }
  });

})();
