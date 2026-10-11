/* Kurenai OS — labs/sims-cs.js
   Computer Science simulations (AQA 7517), registered on KOS.sims so each one
   mounts INLINE on its topic's Simulations tab and in the Simulations view:
     turing-machine (4.4.5.1)  bnf-checker (4.4.3.1)   float-bits (4.5.4.4)
     char-codes (4.5.5.1)      error-check-lab (4.5.5.3) bitmap-lab (4.5.6.4)
     compression-lab (4.5.6.9) cipher-lab (4.5.6.10)   subnet-lab (4.9.4.4)
   (graph-traversal lives in sims-algorithms.js; big-o-plot and
   adc-sampling in sims-plots.js, on the lab system)
   Loaded after sims.js (KOS.sims.canvas / KOS.sims.COL). */
(function () {
  "use strict";
  var el = KOS.ui.el, COL = KOS.sims.COL, canvas = KOS.sims.canvas;
  function A(c, a) { return KOS.labPalette().alpha(c, a); }
  function slider(label, min, max, step, val, onchange, show) {
    var inp = el("input", { type: "range", min: min, max: max, step: step, value: val, "aria-label": label });
    var out = el("b", { text: (show || String)(val) });
    inp.oninput = function () { var v = parseFloat(inp.value); out.textContent = (show || String)(v); onchange(v); };
    return { node: el("label", { class: "k-lab-slider" }, [el("span", {}, [label + " ", out]), inp]), input: inp };
  }
  function readout() { return el("div", { class: "k-lab-read", "data-ui": "lab.readout" }); }
  function mono(text) { return el("code", { class: "k-mono", text: text }); }
  function pad(s, n, ch) { s = String(s); while (s.length < n) s = (ch || "0") + s; return s; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function table(head, rows, cls) {
    return el("div", { class: "k-lab-tablewrap", html:
      '<table class="k-n-table k-lab-table" data-ui="content.table"' + (cls ? ' data-kind="' + cls + '"' : "") + '><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { var c = r.cls ? ' data-state="' + r.cls + '"' : ""; return "<tr" + c + ">" + (r.cells || r).map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>" });
  }

  /* =================== BNF CHECKER =================== */
  KOS.sims.register({
    id: "bnf-checker", title: "BNF Grammar Checker", subject: "compsci", ref: "4.4.3.1",
    desc: "Write production rules in Backus–Naur Form and test strings against them. Recursion (<integer> ::= <digit> | <digit><integer>) is what gives BNF unbounded strings — and what a regular expression or FSM cannot express when nesting must balance.",
    mount: function (panel) {
      var gIn = el("textarea", { class: "k-input k-lab-note", "data-ui": "ui.note-area", "data-mono": "", style: "--h: 130px", "aria-label": "BNF grammar" });
      gIn.value = "<sign> ::= + | -\n<digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9\n<integer> ::= <digit> | <digit><integer>\n<number> ::= <integer> | <sign><number> | <integer>.<integer>";
      var sIn = el("input", { type: "text", value: "-42.7", class: "k-mono", style: "--w: 180px" });
      var startIn = el("input", { type: "text", value: "number", class: "k-mono", style: "--w: 90px" });
      var msg = el("span", { class: "k-lab-msg", "data-ui": "lab.message" });
      panel.appendChild(gIn);
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [el("label", {}, ["start symbol <…>", startIn]), el("label", {}, ["test string", sIn]),
        el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "Check", onclick: check }),
        el("button", { class: "k-btn", text: "Try 3.14, +7, 0-1, 12.", onclick: function () { batch(["3.14", "+7", "0-1", "12.", "007"]); } }), msg]));
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
      function check() { var r = test(sIn.value); msg.textContent = ""; read.innerHTML = "<b>" + esc(sIn.value) + "</b> → " + (r.ok ? "<b class='k-lab-good'>VALID</b> — derivable from &lt;" + esc(startIn.value) + "&gt;" : "<b class='k-lab-bad'>INVALID</b> (" + esc(r.why) + ")") + tail(); }
      function batch(list) { read.innerHTML = list.map(function (s) { var r = test(s); return "<b>" + esc(s) + "</b> → " + (r.ok ? "<span class='k-lab-good'>valid</span>" : "<span class='k-lab-bad'>invalid</span>"); }).join("<br>") + tail(); }
      function tail() { return "<br><span class='k-lab-aside'>Terminals are literal characters; &lt;non-terminals&gt; expand by their rules. Exam habit: check a string by writing the derivation top-down, one rule per line.</span>"; }
      check();
    }
  });

  /* =================== COMPRESSION LAB =================== */
  KOS.sims.register({
    id: "compression-lab", title: "Compression — run-length & dictionary", subject: "compsci", ref: "4.5.6.9",
    desc: "Type text and watch run-length encoding and dictionary coding compress it (or fail to). Both are lossless; the read-out shows the ratio and where each method wins — repeated symbols for RLE, repeated words for dictionaries.",
    mount: function (panel) {
      var inp = el("textarea", { class: "k-input k-lab-note", "data-ui": "ui.note-area", "data-mono": "", style: "--h: 70px", "aria-label": "text to compress" });
      inp.value = "AAAAAABBBCCCCCCCCDAA the cat sat on the mat and the cat sat";
      panel.appendChild(inp);
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "Compress", onclick: run }),
        el("button", { class: "k-btn", text: "Image-like row", onclick: function () { inp.value = "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW"; run(); } }),
        el("button", { class: "k-btn", text: "Prose", onclick: function () { inp.value = "to be or not to be that is the question whether tis nobler in the mind to suffer"; run(); } })]));
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
          "<br><b>RLE</b> → " + esc(rleTxt.slice(0, 120)) + (rleTxt.length > 120 ? "…" : "") + " · " + r.length + " (count, symbol) pairs ≈ <b>" + rleBytes + " bytes</b> · " + ratio(rleBytes) + (rleBytes >= raw ? " <span class='k-lab-bad'>— bigger! RLE needs long runs</span>" : " <span class='k-lab-good'>✓</span>") +
          "<br><b>dictionary</b> → table [" + d.table.slice(0, 12).map(function (w, i) { return i + ":" + esc(w); }).join(" ") + (d.table.length > 12 ? " …" : "") + "] + tokens " + d.tokens.slice(0, 30).join(",") + (d.tokens.length > 30 ? "…" : "") +
          " ≈ <b>" + dictBytes + " bytes</b> (" + tableBytes + " table + " + tokenBytes + " tokens) · " + ratio(dictBytes) + (dictBytes >= raw ? " <span class='k-lab-bad'>— no repeated words to exploit</span>" : " <span class='k-lab-good'>✓</span>") +
          "<br><span class='k-lab-aside'>Both are lossless: the original is rebuilt exactly. Lossy compression (JPEG, MP3) discards detail the eye or ear will not miss and cannot be undone.</span>";
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
      var keyIn = el("input", { type: "text", value: key, class: "k-mono", style: "--w: 200px" });
      keyIn.oninput = function () { key = keyIn.value.toUpperCase().replace(/[^A-Z]/g, ""); run(); };
      var txt = el("textarea", { class: "k-input k-lab-note", "data-ui": "ui.note-area", style: "--h: 60px", "aria-label": "plaintext" });
      txt.value = "the quick brown fox jumps over the lazy dog and the sleepy cat watches";
      panel.appendChild(txt);
      panel.appendChild(el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, [el("label", {}, ["cipher", mSel]), sl.node, el("label", {}, ["pad key (A–Z)", keyIn]),
        el("button", { class: "k-btn", text: "Random pad", onclick: function () { key = ""; for (var i = 0; i < 80; i++) key += String.fromCharCode(65 + Math.floor(Math.random() * 26)); keyIn.value = key; run(); } })]));
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
          "<br><span class='k-lab-aside'>" + (mode === "caesar" ? "Caesar: each letter moves a fixed number of places; 25 possible keys, so brute force or frequency analysis breaks it in seconds." : "Vernam: each letter is combined with the corresponding key letter (here modulo-26 addition; with bits it is XOR). Security depends on the key being truly random, as long as the message, kept secret and never reused.") + "</span>";
      }
      run();
    }
  });

})();
