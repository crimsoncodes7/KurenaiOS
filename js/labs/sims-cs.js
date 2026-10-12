/* Kurenai OS — labs/sims-cs.js
   Three Computer Science text labs on the lab system (lab.js `work`): the
   editor and its output fill the stage's column, the readout beside them
   carries the verdict, the figures and the why.
     bnf-checker (4.4.3.1)   compression-lab (4.5.6.9)   cipher-lab (4.5.6.10)
   The cipher lab's letter-frequency chart is an SVG drawn in theme tones,
   which retired the last canvas a lab used (KOS.sims.canvas / COL). */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;
  function txtIn(v, w, label) { return el("input", { type: "text", value: v, class: "k-mono", spellcheck: "false", autocomplete: "off", style: "--w: " + w + "px", "aria-label": label }); }
  function textLab(panel, o) { return L.create(panel, Object.assign({ zoom: false }, o)); }

  /* =================== BNF CHECKER =================== */
  var BNF_DEFAULT = "<sign> ::= + | -\n<digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9\n<integer> ::= <digit> | <digit><integer>\n<number> ::= <integer> | <sign><number> | <integer>.<integer>";
  var BNF_BATCH = ["3.14", "+7", "0-1", "12.", "007"];
  KOS.sims.register({
    id: "bnf-checker", title: "BNF Grammar Checker", subject: "compsci", ref: "4.4.3.1",
    desc: "Write production rules in Backus–Naur Form and test strings against them. Recursion (<integer> ::= <digit> | <digit><integer>) is what gives BNF unbounded strings — and what a regular expression or FSM cannot express when nesting must balance.",
    mount: function (panel) {
      var gIn = L.editor("BNF grammar", BNF_DEFAULT, { rows: 5 });
      var sIn = txtIn("-42.7", 150, "Test string"), startIn = txtIn("number", 96, "Start symbol");
      var lab = textLab(panel, {
        work: [L.pane("Grammar", [gIn], { tag: "" })],
        readout: ["now", "deriv", "batch", "habit"],
        controls: [L.field("Start ‹…›", startIn), L.field("Test", sIn), L.action("Check", check, true),
          L.action("Try " + BNF_BATCH.join(", "), batch)]
      });
      var tag = lab.work.querySelector("[data-ui~='lab.pane-tag']");
      [gIn, startIn].forEach(function (f) { f.addEventListener("input", check); });
      sIn.addEventListener("input", check);
      sIn.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
      lab.section("habit", "Exam habit", ["Terminals are literal characters; ‹non-terminals› expand by their rules. Check a string by writing the derivation top-down, one rule per line — exactly the list under Derivation."]);

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
      /* every position a non-terminal can END at, starting from pos */
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
      /* one parse tree for str[pos, end) from nt, or null */
      function parse(rules, nt, str, pos, end, depth, memo) {
        if (depth > 60) return null;
        var alts = rules[nt] || [];
        for (var a = 0; a < alts.length; a++) {
          var kids = matchSeq(rules, alts[a], 0, str, pos, end, depth, memo);
          if (kids) return { nt: nt, kids: kids };
        }
        return null;
      }
      function matchSeq(rules, seq, k, str, pos, end, depth, memo) {
        if (k === seq.length) return pos === end ? [] : null;
        var tok = seq[k], rest;
        if (tok.t !== undefined) {
          if (str.substr(pos, tok.t.length) !== tok.t) return null;
          rest = matchSeq(rules, seq, k + 1, str, pos + tok.t.length, end, depth, memo);
          return rest ? [{ t: tok.t }].concat(rest) : null;
        }
        var cands = ends(rules, tok.nt, str, pos, depth + 1, memo).filter(function (e) { return e <= end; }).sort(function (x, y) { return y - x; });
        for (var c = 0; c < cands.length; c++) {
          var sub = parse(rules, tok.nt, str, pos, cands[c], depth + 1, memo);
          if (!sub) continue;
          rest = matchSeq(rules, seq, k + 1, str, cands[c], end, depth, memo);
          if (rest) return [sub].concat(rest);
        }
        return null;
      }
      /* the leftmost derivation, one rule per line */
      function derivation(tree) {
        var form = [tree], lines = [];
        function show() { return form.map(function (x) { return x.nt ? "<" + x.nt + ">" : x.t; }).join(""); }
        lines.push(show());
        for (var guard = 0; guard < 60; guard++) {
          var i = form.findIndex(function (x) { return x.nt; });
          if (i === -1) break;
          form.splice.apply(form, [i, 1].concat(form[i].kids));
          lines.push(show());
        }
        return lines;
      }
      function test(str) {
        var rules = parseGrammar(), start = startIn.value.replace(/[<>‹›]/g, "").trim();
        tag.textContent = Object.keys(rules).length + " rule" + (Object.keys(rules).length === 1 ? "" : "s");
        if (!rules[start]) return { ok: false, why: "There is no rule for <" + start + ">." };
        var memo = {}, e = ends(rules, start, str, 0, 0, memo);
        if (e.indexOf(str.length) >= 0) return { ok: true, tree: parse(rules, start, str, 0, str.length, 0, memo) };
        return { ok: false, why: e.length ? "The longest prefix <" + start + "> can derive is " + Math.max.apply(null, e) + " character" + (Math.max.apply(null, e) === 1 ? "" : "s") + " (“" + str.slice(0, Math.max.apply(null, e)) + "”); the rest has no rule." : "No alternative of <" + start + "> matches the first character." };
      }
      function check() {
        var str = sIn.value, r = test(str), start = startIn.value.replace(/[<>‹›]/g, "").trim();
        lab.answer("Verdict", r.ok ? "VALID" : "INVALID",
          r.ok ? "“" + str + "” is derivable from <" + start + ">." : r.why, null, r.ok ? "done" : "hot");
        lab.section("deriv", "Derivation", r.ok && r.tree ? [el("ol", { class: "k-lab-deriv", "data-ui": "lab.derivation" }, derivation(r.tree).map(function (l) { return el("li", { text: l }); }))] : null,
          r.ok && r.tree ? derivation(r.tree).length - 1 + " steps" : null);
      }
      function batch() {
        lab.section("batch", "Five strings", [lab.table(["string", "verdict"], BNF_BATCH.map(function (s) {
          var r = test(s); return [s, [r.ok ? "valid" : "invalid", r.ok ? "done" : "hot"]];
        }))]);
      }
      check();
    }
  });

  /* =================== COMPRESSION LAB =================== */
  var PRESETS = [["mixed", "Mixed", "AAAAAABBBCCCCCCCCDAA the cat sat on the mat and the cat sat"],
    ["image", "Image-like row", "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW"],
    ["prose", "Prose", "to be or not to be that is the question whether tis nobler in the mind to suffer"]];
  KOS.sims.register({
    id: "compression-lab", title: "Compression — run-length & dictionary", subject: "compsci", ref: "4.5.6.9",
    desc: "Type text and watch run-length encoding and dictionary coding compress it (or fail to). Both are lossless; the read-out shows the ratio and where each method wins — repeated symbols for RLE, repeated words for dictionaries.",
    mount: function (panel) {
      var inp = L.editor("Text to compress", PRESETS[0][2], { rows: 3 });
      var rleOut = L.out("lab.rle"), dictBody = el("div", { class: "k-lab-pane-body" });
      var rlePane = L.pane("Run-length encoding", [rleOut], { tag: "" }), dictPane = L.pane("Dictionary", [dictBody], { tag: "" });
      var presets = L.choice(PRESETS.map(function (p) { return [p[0], p[1]]; }), "mixed", function (v) {
        inp.value = PRESETS.filter(function (p) { return p[0] === v; })[0][2]; run();
      }, "Sample text");
      var lab = textLab(panel, {
        work: [L.pane("Text", [inp], { tag: "1 byte per character" }), rlePane, dictPane],
        readout: ["now", "values", "why", "lossless"],
        controls: [presets]
      });
      inp.addEventListener("input", function () { presets.set(null); run(); });
      lab.section("lossless", "Lossless", ["Both rebuild the original exactly. Lossy compression (JPEG, MP3) discards detail the eye or ear will not miss and cannot be undone."]);
      function rle(s) { var out = [], i = 0; while (i < s.length) { var j = i; while (j < s.length && s[j] === s[i]) j++; out.push([j - i, s[i]]); i = j; } return out; }
      function dict(s) {
        var table = [], idx = {}, tokens = [];
        s.split(/\s+/).filter(Boolean).forEach(function (w) { if (idx[w] === undefined) { idx[w] = table.length; table.push(w); } tokens.push(idx[w]); });
        return { table: table, tokens: tokens };
      }
      function pct(b, raw) { return raw ? Math.round(100 * b / raw) + "%" : "—"; }
      function run() {
        var s = inp.value, raw = s.length;
        var r = rle(s), rleBytes = r.length * 2;
        var d = dict(s), tableBytes = d.table.join("").length + d.table.length, dictBytes = tableBytes + d.tokens.length;
        rleOut.textContent = r.map(function (p) { return p[0] + (p[1] === " " ? "␠" : p[1]); }).join(" ");
        rlePane.querySelector("[data-ui~='lab.pane-tag']").textContent = r.length + " (count, symbol) pairs";
        dictPane.querySelector("[data-ui~='lab.pane-tag']").textContent = d.table.length + " entries · " + d.tokens.length + " tokens";
        dictBody.innerHTML = "";
        dictBody.appendChild(L.scrollTable(el("div", {}, [lab.table(["#", "word"], d.table.slice(0, 24).map(function (w, i) { return [String(i), w]; }))])));
        if (d.table.length > 24) dictBody.appendChild(el("p", { class: "k-lab-sub", text: "… and " + (d.table.length - 24) + " more" }));
        dictBody.appendChild(el("p", { class: "k-lab-pane-out k-mono", text: "tokens: " + d.tokens.join(" ") }));
        var best = Math.min(rleBytes, dictBytes);
        var winner = best >= raw ? "Neither" : rleBytes <= dictBytes ? "Run-length" : "Dictionary";
        lab.answer("Smallest", winner, best >= raw ? "Both come out bigger than the " + raw + "-byte original." : winner + " stores it in " + best + " bytes, " + pct(best, raw) + " of the original.", null, best >= raw ? "hot" : null);
        lab.values([["original", raw + " B"],
          ["run-length", rleBytes + " B · " + pct(rleBytes, raw), rleBytes < raw ? "done" : "hot"],
          ["dictionary", dictBytes + " B · " + pct(dictBytes, raw), dictBytes < raw ? "done" : "hot"],
          ["  table + tokens", tableBytes + " + " + d.tokens.length]]);
        lab.section("why", "Why", [rleBytes >= raw
          ? "Run-length needs long runs: each run costs two bytes, so text whose symbols change every character doubles in size."
          : "Run-length wins on long runs of one symbol — a row of an image, a fax, silence in audio.",
          " ", dictBytes >= raw
          ? "A dictionary needs repeated words: each new word is stored once in the table, so text with few repeats pays for the table and the tokens."
          : "A dictionary wins when words repeat: each later use is one small token instead of the word."]);
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
      var txt = L.editor("Plaintext", "the quick brown fox jumps over the lazy dog and the sleepy cat watches", { rows: 3, mono: false });
      var cOut = L.out("lab.ciphertext");
      var chart = el("div", { class: "k-lab-chart", "data-ui": "lab.chart" });
      var sl = L.slider("Shift", 0, 25, 1, shift, function (v) { shift = v; run(); });
      var keyIn = txtIn(key, 200, "Pad key, letters A to Z");
      keyIn.addEventListener("input", function () { key = keyIn.value.toUpperCase().replace(/[^A-Z]/g, ""); run(); });
      var modes = L.choice([["caesar", "Caesar shift"], ["vernam", "Vernam pad"]], mode, function (v) { mode = v; run(); }, "Cipher");
      var keyField = L.field("Pad key", keyIn);
      var lab = textLab(panel, {
        work: [L.pane("Plaintext", [txt]), L.pane("Ciphertext", [cOut]), L.pane("Letter frequency", [chart], { tag: "plaintext · ciphertext" })],
        readout: ["now", "values", "why", "legend"],
        controls: [modes, sl.node, keyField, L.action("Random pad", function () {
          key = ""; for (var i = 0; i < 80; i++) key += String.fromCharCode(65 + Math.floor(Math.random() * 26));
          keyIn.value = key; run();
        })]
      });
      lab.legend([["ring-ink", "plaintext letters"], ["fill-hot", "ciphertext letters"]]);
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
      /* 26 pairs of bars in a 520 × 170 frame (the token's 52:17) */
      function draw(fp, fc) {
        var W = 520, H = 170, top = 10, base = 136, bw = W / 26, mx = Math.max(1, Math.max.apply(null, fp.concat(fc)));
        var kids = [];
        for (var i = 0; i < 26; i++) {
          var x = i * bw, hp = fp[i] / mx * (base - top), hc = fc[i] / mx * (base - top);
          if (fp[i]) kids.push(L.svg("rect", { x: x + 2, y: base - hp, width: bw / 2 - 2, height: hp, rx: 2, class: "k-sv-node", "data-tone": "ink" }));
          if (fc[i]) kids.push(L.svg("rect", { x: x + bw / 2, y: base - hc, width: bw / 2 - 2, height: hc, rx: 2, class: "k-sv-node", "data-tone": "hot" }));
          kids.push(L.svg("text", { x: x + bw / 2, y: base + 22, "font-size": 14, "text-anchor": "middle", class: "k-sv-t", "data-tone": "mute", text: String.fromCharCode(65 + i) }));
        }
        kids.push(L.svg("line", { x1: 0, y1: base, x2: W, y2: base, class: "k-sv-edge" }));
        chart.innerHTML = "";
        chart.appendChild(L.svg("svg", { class: "k-sv", viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "xMidYMid meet", role: "img",
          "aria-label": "Letter frequencies of the plaintext and the ciphertext" }, kids));
      }
      function run() {
        keyField.hidden = mode !== "vernam";
        sl.node.hidden = mode !== "caesar";
        var plain = txt.value, cipher = enc(plain), letters = plain.replace(/[^a-z]/gi, "").length;
        cOut.textContent = cipher;
        var fp = freq(plain), fc = freq(cipher);
        draw(fp, fc);
        var topP = fp.indexOf(Math.max.apply(null, fp)), topC = fc.indexOf(Math.max.apply(null, fc));
        if (mode === "caesar") {
          lab.answer("Key space", "25 keys", ["The commonest plaintext letter, ", lab.em(String.fromCharCode(65 + topP), "ink"), ", became ", lab.em(String.fromCharCode(65 + topC), "hot"),
            " — the peak slid " + ((topC - topP + 26) % 26) + " places, which is the key."]);
          lab.values([["shift", String(shift)], ["letters", String(letters)]]);
          lab.section("why", "Why it falls", ["Every letter moves the same number of places, so the whole histogram slides without changing shape. Try all 25 shifts, or line the tallest bar up with E."]);
        } else {
          var reuse = key.length && key.length < letters;
          lab.answer("Pad", reuse ? "Reused" : key.length ? "One-time" : "No key", reuse
            ? ["The key (" + key.length + " letters) is shorter than the message (" + letters + "), so it repeats — and repeated key patterns leak."]
            : key.length ? ["A random key at least as long as the message, used once: every plaintext is equally likely, so the bars flatten and analysis has nothing to hold."] : ["Type a key, or press Random pad."], null, reuse || !key.length ? "hot" : "done");
          lab.values([["key length", String(key.length), reuse ? "hot" : "done"], ["message letters", String(letters)]]);
          lab.section("why", "Why it holds", ["Each letter is combined with its own key letter (here adding modulo 26; with bits it is XOR). The security rests on the key being truly random, as long as the message, secret and never reused."]);
        }
      }
      run();
    }
  });

})();
