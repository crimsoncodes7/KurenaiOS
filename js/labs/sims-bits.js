/* Kurenai OS — labs/sims-bits.js
   Bits and registers on the lab system (design part 2, frame 20d): the
   binary register, floating point, character codes, error checking, the
   bitmap, IP subnetting, number bases, and the two logic labs.

   Bit cells are the one component: rounded cells in the subject hue for 1
   and a quiet outline for 0, place values above in mono type, groups
   (nibbles, mantissa and exponent, octets) split by a gap and labelled
   with an underline in their own colour, and any marker (the binary point,
   a carry) in crimson. Each cell is a switch: click, or Tab to it and
   press Space. The decoded value leads the readout in large mono type,
   then the working, then checks. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;
  function pad(s, n, ch) { s = String(s); while (s.length < n) s = (ch || "0") + s; return s; }
  function txtIn(v, w, on) { var i = el("input", { type: "text", value: v, spellcheck: "false", autocomplete: "off", style: "--w: " + (w || 90) + "px" }); if (on) i.addEventListener("input", on); return i; }
  function bitsOf(v, n) { var out = []; for (var i = n - 1; i >= 0; i--) out.push((v >> i) & 1); return out; }
  function uval(bits) { return bits.reduce(function (a, b) { return a * 2 + b; }, 0); }
  function sval(bits) { var u = uval(bits); return bits[0] ? u - Math.pow(2, bits.length) : u; }
  function sup(n) { return String(n).replace(/[-\d]/g, function (c) { return "⁻⁰¹²³⁴⁵⁶⁷⁸⁹"["-0123456789".indexOf(c)]; }); }

  /* one row of bit cells; returns where each cell landed */
  function bitRow(d, x, y, bits, o) {
    o = o || {};
    var w = o.w || 56, h = o.h || w, gap = o.gap == null ? 8 : o.gap, xs = [], cx = x;
    bits.forEach(function (b, i) {
      if (i && o.split && o.split.indexOf(i) >= 0) cx += o.splitGap || 22;
      xs.push(cx);
      var tone = o.tone ? o.tone(i, b) : b ? "on" : null;
      var g = d.group({ "data-ui": o.hook || null });
      d.rect(cx, y, w, h, { rx: Math.min(12, w / 4), tone: tone }, g);
      var solid = tone === "on" || tone === "hot" || tone === "done";
      d.text(cx + w / 2, y + h / 2 + (o.size || 22) * 0.36, o.label ? o.label(i, b) : String(b), { size: o.size || 22, weight: "bold", tone: solid ? "on" : b ? null : "mute" }, g);
      if (o.place) d.text(cx + w / 2, y - 12, o.place[i], { size: o.placeSize || 14, tone: "mute" });
      if (o.flip) d.hit(g, (o.name ? o.name(i) : "bit " + i) + ", " + b, function () { o.flip(i); }, { role: "switch", checked: !!b, key: (o.key || "b") + i });
      cx += w + gap;
    });
    return { xs: xs, w: w, h: h, x: x, right: cx - gap, y: y };
  }
  /* a labelled underline under cells [i, j] of a row */
  function under(d, row, i, j, label, tone, dy) {
    var y = row.y + row.h + (dy || 14);
    d.line(row.xs[i], y, row.xs[j] + row.w, y, { tone: tone || "ink" });
    d.text((row.xs[i] + row.xs[j] + row.w) / 2, y + 22, label, { size: 14, tone: tone || "ink" });
  }
  function lab20d(panel, o) { return L.create(panel, Object.assign({ zoom: false, interactive: true }, o)); }

  /* =================== THE BINARY REGISTER (20d, 720 frame) =================== */
  KOS.sims.register({
    id: "binary-number", title: "Binary register", subject: "compsci", ref: "4.5.4.1",
    desc: "Flip the bits of an 8-bit register and read it as unsigned or two's complement, in denary and hex; shift it, or add a second register and watch the carry ripple.",
    mount: function (panel) {
      var A = bitsOf(107, 8), B = bitsOf(3, 8), signed = false, adding = false, shown = null;
      var denIn = txtIn("107", 64, function () { var v = parseInt(denIn.value, 10); if (isNaN(v)) return; if (signed ? v < -128 || v > 127 : v < 0 || v > 255) return; A = bitsOf(v & 255, 8); load(); }), hexIn = txtIn("6B", 48, function () { var v = parseInt(hexIn.value, 16); if (!isNaN(v) && v >= 0 && v <= 255 && /^[0-9a-f]{1,2}$/i.test(hexIn.value.trim())) { A = bitsOf(v, 8); load(true); } });
      var addBtn = L.action("Add…", function () { adding = !adding; addBtn.setAttribute("aria-pressed", String(adding)); load(); });
      addBtn.setAttribute("aria-pressed", "false");
      var lab = lab20d(panel, { label: "An 8-bit register; each bit is a switch", hint: "tap a bit to flip it", transport: true, tick: 700, readout: ["now", "values", "why", "legend"],
        controls: [L.choice([["u", "Unsigned"], ["s", "Two's complement"]], "u", function (v) { signed = v === "s"; load(); }, "Reading"), L.field("Denary", denIn), L.field("Hex", hexIn), L.sep(),
          addBtn, L.action("Shift ←", function () { shift(-1); }), L.action("Shift →", function () { shift(1); })],
        onReset: function () { load(); } });
      var PLACE = [128, 64, 32, 16, 8, 4, 2, 1];
      function place() { return PLACE.map(function (p, i) { return i === 0 && signed ? "−128" : String(p); }); }
      function read(bits) { return signed ? sval(bits) : uval(bits); }
      function shift(dir) {
        adding = false; addBtn.setAttribute("aria-pressed", "false");
        var lost = dir < 0 ? A[0] : A[7], before = read(A);
        A = dir < 0 ? A.slice(1).concat([0]) : [signed ? A[0] : 0].concat(A.slice(0, 7));
        load(false, [dir < 0 ? "Shift left: each bit moves up one place, so the value doubles: " : "Shift right: each bit moves down one place, so the value halves" + (signed ? " (the sign bit is copied in — an arithmetic shift): " : " (a logical shift brings in a 0): "),
          before + " → ", [String(read(A)), "ink"], lost ? ". A 1 fell off the end, so the result is no longer exactly " + (dir < 0 ? "double." : "half.") : "."]);
      }
      function load(fromHex, say) {
        lab.legend(adding ? [["fill-ink", "1"], ["ring-mute", "0"], ["ring-hot", "column being added"], ["fill-hot", "carry"]] : [["fill-ink", "1"], ["ring-mute", "0"], ["fill-front", "hex digit per nibble"]]);
        if (!adding) {
          var v = read(A);
          if (!fromHex) hexIn.value = pad(uval(A).toString(16).toUpperCase(), 2);
          if (document.activeElement !== denIn) denIn.value = String(v);
          lab.steps([{ say: say }], render);
          return;
        }
        /* addition: one frame per column, least significant first */
        var frames = [{ col: -1, res: [], carry: [], say: ["Add from the right-hand column. Each column is the two bits plus any carry: 1 + 1 = 10, write 0 and carry 1."] }];
        var res = [0, 0, 0, 0, 0, 0, 0, 0], carry = [0, 0, 0, 0, 0, 0, 0, 0, 0], c = 0;
        for (var col = 7; col >= 0; col--) {
          var s = A[col] + B[col] + c;
          res[col] = s & 1; c = s >> 1; carry[col] = c;
          frames.push({ col: col, res: res.slice(), carry: carry.slice(), done: 7 - col, say: ["Column " + (7 - col) + ": " + A[col] + " + " + B[col] + (col < 7 && carry[col + 1] ? " + carry 1" : "") + " = " + s.toString(2) + ": write ", [String(s & 1), "ink"], c ? " and carry 1." : "."] });
        }
        var sum = uval(A) + uval(B), sa = sval(A), sb = sval(B), ss = sval(res);
        frames.push({ col: -2, res: res, carry: carry, say: signed
          ? [sa + " + " + sb + " = ", [String(ss), (sa >= 0) === (sb >= 0) && (ss >= 0) !== (sa >= 0) ? "hot" : "ink"], (sa >= 0) === (sb >= 0) && (ss >= 0) !== (sa >= 0) ? ": overflow — two numbers of the same sign gave the other sign." : ". In two's complement a carry out of the top bit is discarded."]
          : [uval(A) + " + " + uval(B) + " = ", [String(sum & 255), c ? "hot" : "ink"], c ? ": overflow — the true answer, " + sum + ", needs 9 bits." : ", with no carry out of the top bit."] });
        lab.steps(frames, render);
      }
      function render(f) {
        shown = f;
        lab.draw(adding ? drawAdd : drawConvert);
        var v = read(A), u = uval(A);
        if (!adding) {
          lab.answer("Decoded", String(v), f.say || "denary · " + (signed ? "two's complement" : "unsigned"));
          lab.values([["binary", A.join("")], ["hex", pad(u.toString(16).toUpperCase(), 2), "front"], ["unsigned", String(u)], ["two's complement", String(sval(A))]]);
          lab.section("why", "Why", [A[0] ? "The top bit is 1: unsigned it is worth +128, in two's complement −128, so the two readings differ by 256." : "The top bit is 0, so both readings agree. Flip bit 7 to see " + (u - 128) + " in two's complement."]);
        } else {
          lab.now(f.say, f.done != null ? "Column " + f.done + " of 7" : null);
          lab.values([["A", A.join("") + " = " + read(A)], ["B", B.join("") + " = " + read(B)], ["A + B", (f.res.length ? f.res.join("") : "—") + (f.col === -2 ? " = " + read(f.res) : "")]]);
          lab.section("why", "Why", null);
        }
      }
      function drawConvert(d) {
        var row = bitRow(d, 137, 150, A, { place: place(), split: [4], flip: function (i) { A[i] ^= 1; load(); }, name: function (i) { return "bit " + (7 - i) + ", worth " + place()[i]; } });
        [0, 4].forEach(function (s0, k) {
          var nib = A.slice(s0, s0 + 4), x = (row.xs[s0] + row.xs[s0 + 3] + row.w) / 2;
          d.text(x, row.y + row.h + 44, uval(nib).toString(16).toUpperCase(), { size: 26, weight: "bold", tone: "front" });
        });
        var parts = []; A.forEach(function (b, i) { if (b) parts.push(i === 0 && signed ? "−128" : String(PLACE[i])); });
        d.text(400, row.y + row.h + 104, (parts.length ? parts.join(" + ").replace(/\+ −/g, "− ") : "0") + " = " + read(A), { size: 16, tone: "sub" });
        return { w: 800, h: 450 };
      }
      function drawAdd(d) {
        var f = shown, x0 = 170;
        var hot = function (i) { return f.col === i; };
        d.text(x0 - 24, 72, "carry", { size: 14, tone: "mute", anchor: "end" });
        var rA = bitRow(d, x0, 96, A, { w: 50, place: null, split: [4], key: "a", tone: function (i, b) { return hot(i) ? "hot-ring" : b ? "on" : null; }, flip: function (i) { A[i] ^= 1; load(); }, name: function (i) { return "A bit " + (7 - i); } });
        bitRow(d, x0, 160, B, { w: 50, split: [4], key: "c", tone: function (i, b) { return hot(i) ? "hot-ring" : b ? "on" : null; }, flip: function (i) { B[i] ^= 1; load(); }, name: function (i) { return "B bit " + (7 - i); } });
        d.text(x0 - 24, 128, "A", { size: 16, weight: "bold", anchor: "end" });
        d.text(x0 - 24, 192, "B", { size: 16, weight: "bold", anchor: "end" });
        d.text(x0 - 46, 192, "+", { size: 22, tone: "sub", anchor: "end" });
        d.line(x0 - 50, 226, rA.right + 10, 226, { tone: "sub" });
        rA.xs.forEach(function (x, i) {
          if (i > 0 && f.carry[i]) { d.circle(rA.xs[i - 1] + 25, 64, 13, { tone: "hot" }); d.text(rA.xs[i - 1] + 25, 70, "1", { size: 15, weight: "bold", tone: "on" }); }
          var known = f.col === -2 || (f.col >= 0 && i >= f.col);
          d.rect(x, 240, 50, 50, { rx: 12, tone: known ? (f.res[i] ? "on" : null) : "ghost" });
          if (known) d.text(x + 25, 273, String(f.res[i]), { size: 22, weight: "bold", tone: f.res[i] ? "on" : "mute" });
        });
        if (f.col === -2 && f.carry[0] && !signed) { d.circle(x0 - 50, 265, 14, { tone: "hot" }); d.text(x0 - 50, 271, "1", { size: 15, weight: "bold", tone: "on" }); d.text(x0 - 50, 312, "lost", { size: 14, tone: "hot" }); }
        d.text(rA.right + 24, 128, "= " + read(A), { size: 16, tone: "sub", anchor: "start" });
        d.text(rA.right + 24, 192, "= " + read(B), { size: 16, tone: "sub", anchor: "start" });
        if (f.col === -2) d.text(rA.right + 24, 273, "= " + read(f.res), { size: 16, weight: "bold", tone: "ink", anchor: "start" });
        return { w: 800, h: 450 };
      }
      load();
    }
  });

  /* =================== FLOATING POINT (20d, 1280 frame) =================== */
  KOS.sims.register({
    id: "float-bits", title: "Floating point", subject: "compsci", ref: "4.5.4.4",
    desc: "A two's complement mantissa and exponent, bit by bit: the value, the working and the normalisation check update as you flip; Normalise shows the shift that fixes a pattern, and Encode stores a denary value.",
    mount: function (panel) {
      var mb = 8, eb = 4, M = [0, 1, 0, 1, 1, 0, 0, 0], E = [0, 0, 1, 1], showPlace = true;
      function sel(vals, v, on) { var s = el("select", { style: "--w: 64px" }, vals.map(function (x) { return el("option", { value: x, text: String(x), selected: x === v ? "" : null }); })); s.onchange = function () { on(parseInt(s.value, 10)); }; return s; }
      var decIn = txtIn("5.5", 70);
      decIn.addEventListener("keydown", function (e) { if (e.key === "Enter") encode(); });
      var lab = lab20d(panel, { label: "A floating-point number: mantissa and exponent bits", hint: "tap a bit to flip it", readout: ["now", "work", "checks", "legend"],
        controls: [L.field("Mantissa bits", sel([4, 5, 6, 7, 8, 9, 10, 11, 12], mb, function (v) { M = resize(M, v, true); mb = v; draw(); })),
          L.field("Exponent bits", sel([3, 4, 5, 6], eb, function (v) { E = resize(E, v, false); eb = v; draw(); })),
          L.action("Normalise", normalise, true), L.action("Random", function () { M = M.map(function () { return Math.random() < 0.5 ? 1 : 0; }); E = E.map(function () { return Math.random() < 0.5 ? 1 : 0; }); draw(); }),
          L.field("Denary", decIn), L.action("Encode", encode), L.sep(), L.toggle("Show place values", showPlace, function (on) { showPlace = on; draw(); })] });
      lab.legend([["fill-ink", "1"], ["line-ink", "mantissa"], ["line-front", "exponent"], ["fill-hot", "binary point"]]);
      function resize(bits, n, isM) {
        /* keep the value's sign and leading bits; the mantissa grows on the right, the exponent on the left (sign-extended) */
        if (isM) return n >= bits.length ? bits.concat(new Array(n - bits.length).fill(0)) : bits.slice(0, n);
        var v = sval(bits), lo = -Math.pow(2, n - 1), hi = Math.pow(2, n - 1) - 1;
        return bitsOf(Math.max(lo, Math.min(hi, v)) & (Math.pow(2, n) - 1), n);
      }
      function mant(bits) { return bits.reduce(function (a, b, i) { return a + b * (i === 0 ? -1 : Math.pow(2, -i)); }, 0); }
      function frac(i) { var F = ["−1", "½", "¼", "⅛", "1⁄16", "1⁄32", "1⁄64", "1⁄128"]; return F[i] || "2" + sup(-i); }
      function isNorm() { return M[0] !== M[1]; }
      function normalise() {
        var m = mant(M), e = sval(E);
        if (m === 0) { lab.now([["Zero has no normalised form", "hot"], ": every mantissa bit is 0."]); return; }
        var shifts = 0;
        while (M[0] === M[1] && shifts < mb) { M = [M[0]].concat(M.slice(2)).concat([0]); e--; shifts++; }
        var lo = -Math.pow(2, eb - 1);
        if (e < lo) { lab.now([["Underflow", "hot"], ": normalising needs an exponent of " + e + ", below the smallest, " + lo + "."]); e = lo; }
        E = bitsOf(e & (Math.pow(2, eb) - 1), eb);
        draw(shifts ? ["Normalised: the mantissa moved " + shifts + " place" + (shifts > 1 ? "s" : "") + " left and the exponent fell by " + shifts + ", so the value is unchanged but the precision is the best this format allows."] : ["Already normalised: the first two mantissa bits differ."]);
      }
      function encode() {
        var v = Number(decIn.value.trim());
        if (!isFinite(v) || decIn.value.trim() === "") { lab.now([["Type a denary number to encode, such as 5.5 or −0.375.", "hot"]]); return; }
        if (v === 0) { M = M.map(function () { return 0; }); E = E.map(function () { return 0; }); draw(["Zero is all zeros."]); return; }
        var e = Math.floor(Math.log2(Math.abs(v))) + 1;
        if (v < 0 && Math.abs(v) === Math.pow(2, e - 1)) e -= 1;   /* −2ᵏ is exactly −1 × 2ᵏ */
        var lo = -Math.pow(2, eb - 1), hi = Math.pow(2, eb - 1) - 1, note = "";
        if (e > hi) { note = "Overflow: " + v + " needs an exponent of " + e + ", above the largest, " + hi + "."; e = hi; }
        if (e < lo) { note = "Underflow: " + v + " needs an exponent of " + e + ", below the smallest, " + lo + "."; e = lo; }
        var scale = Math.pow(2, mb - 1), q = Math.round(v / Math.pow(2, e) * scale);
        q = Math.max(-scale, Math.min(scale - 1, q));
        M = bitsOf(q & (Math.pow(2, mb) - 1), mb); E = bitsOf(e & (Math.pow(2, eb) - 1), eb);
        var stored = mant(M) * Math.pow(2, sval(E));
        draw(note ? [[note, "hot"]] : stored === v ? [v + " is stored exactly."] : [v + " is stored as ", [String(stored), "front"], ": the nearest value with " + (mb - 1) + " fraction bits. The difference, " + Number((v - stored).toPrecision(4)) + ", is the rounding error."]);
      }
      function draw(say) {
        var m = mant(M), e = sval(E), v = m * Math.pow(2, e);
        lab.draw(function (d) {
          /* a phone stacks the exponent under the mantissa, so the cells
             are drawn at half the frame's width rather than all of it */
          var narrow = lab.narrow(), w = mb + eb > 14 && !narrow ? 44 : 52, x0 = 40;
          var rm = bitRow(d, x0, 124, M, { w: w, place: showPlace ? M.map(function (_, i) { return frac(i); }) : null, key: "m", flip: function (i) { M[i] ^= 1; draw(); }, name: function (i) { return "mantissa bit, worth " + frac(i); } });
          var re = bitRow(d, narrow ? x0 : rm.right + 34, narrow ? 290 : 124, E, { w: w, place: showPlace ? E.map(function (_, i) { return i === 0 ? "−" + Math.pow(2, eb - 1) : String(Math.pow(2, eb - 1 - i)); }) : null, key: "e",
            flip: function (i) { E[i] ^= 1; draw(); }, name: function (i) { return "exponent bit, worth " + (i === 0 ? "−" + Math.pow(2, eb - 1) : Math.pow(2, eb - 1 - i)); } });
          var px = rm.xs[1] - 4;
          d.circle(px, rm.y + rm.h + 8, 5, { tone: "hot" });
          d.text(px - 8, rm.y + rm.h + 30, "binary point", { size: 14, tone: "hot", anchor: "start" });
          under(d, rm, 0, mb - 1, "Mantissa · " + mb + " bits, two's complement", "ink", 48);
          under(d, re, 0, eb - 1, "Exponent · " + eb + " bits", "front", narrow ? 14 : 48);
          /* the shift the exponent asks for */
          var digits = M.join(""), pt = 1 + e, shown;
          if (pt <= 0) shown = "0." + new Array(-pt + 1).join(M[0] ? "1" : "0") + digits;
          else if (pt >= digits.length) shown = digits + new Array(pt - digits.length + 1).join("0");
          else shown = digits.slice(0, pt) + "." + digits.slice(pt);
          var fx = narrow ? (x0 + rm.right) / 2 : 400, fy = narrow ? re.y + re.h + 84 : 300;
          d.text(fx, fy, M[0] + "." + M.slice(1).join("") + " × 2" + sup(e) + "  →  " + shown + " = " + Number(v.toPrecision(10)), { size: 20, weight: "bold" });
          d.text(fx, fy + 34, e === 0 ? "the point stays where it is" : "move the point " + Math.abs(e) + " place" + (Math.abs(e) > 1 ? "s" : "") + (e > 0 ? " right" : " left"), { size: 14, tone: "mute" });
          return { w: Math.max(800, re.right + 40), h: narrow ? Math.max(450, fy + 60) : 450 };
        });
        lab.answer("Decoded", String(Number(v.toPrecision(10))), say || null);
        lab.section("work", "Working", [el("dl", { class: "k-lab-kv" }, [
          el("dt", { text: "mantissa" }), el("dd", { class: "k-mono", text: M[0] + "." + M.slice(1).join("") + " = " + m }),
          el("dt", { text: "exponent" }), el("dd", { class: "k-mono", "data-tone": "front", text: E.join("") + " = " + e }),
          el("dt", { text: "value" }), el("dd", { class: "k-mono", text: m + " × 2" + sup(e) + " = " + Number(v.toPrecision(10)) })])]);
        var hiE = Math.pow(2, eb - 1) - 1, maxV = (1 - Math.pow(2, -(mb - 1))) * Math.pow(2, hiE);
        lab.section("checks", "Checks", [el("ul", { class: "k-lab-checks" }, [
          el("li", { "data-tone": isNorm() ? "done" : "hot", text: (isNorm() ? "✓ Normalised: the mantissa starts " : "✗ Not normalised: the mantissa starts ") + M[0] + M[1] }),
          el("li", { text: (M[0] ? "Negative: the sign bit is 1" : "Positive: the sign bit is 0") }),
          el("li", { text: "Precision: 2" + sup(-(mb - 1)) + " of the mantissa · largest " + Number(maxV.toPrecision(6)) })])]);
      }
      draw();
    }
  });

  /* =================== ASCII AND UNICODE =================== */
  KOS.sims.register({
    id: "char-codes", title: "ASCII and Unicode", subject: "compsci", ref: "4.5.5.1",
    desc: "Type text and pick a character: its code in denary, hex and binary, drawn as bit cells. ASCII covers 128 characters in 7 bits; beyond that, UTF-8 spends 2 to 4 bytes, and its header bits show how.",
    mount: function (panel) {
      var inp = txtIn("Hi! K é 漢 😀", 220, function () { at = Math.min(at, Math.max(0, chars().length - 1)); draw(); }), at = 4;
      var lab = lab20d(panel, { label: "A character's code as bits", hint: "pick a character above", readout: ["now", "values", "all", "legend"], controls: [L.field("Text", inp)] });
      lab.legend([["fill-ink", "1"], ["ring-mute", "0"], ["fill-front", "UTF-8 header bits"]]);
      function chars() { return Array.from(inp.value).slice(0, 20); }
      function utf8(cp) {
        if (cp < 0x80) return [pad(cp.toString(2), 8)];
        var b = cp.toString(2), n = cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4, payload = [5, 4, 3][n - 2], total = payload + 6 * (n - 1);
        b = pad(b, total);
        var out = [new Array(n + 1).join("1") + "0" + b.slice(0, payload)];
        for (var i = 0; i < n - 1; i++) out.push("10" + b.slice(payload + i * 6, payload + i * 6 + 6));
        return out;
      }
      function draw() {
        var cs = chars();
        if (!cs.length) { lab.draw(function (d) { d.text(400, 225, "Type some text.", { tone: "mute" }); return { w: 800, h: 450 }; }); lab.now(null); return; }
        at = Math.min(at, cs.length - 1);
        var ch = cs[at], cp = ch.codePointAt(0), bytes = utf8(cp), ascii = cp < 128;
        lab.draw(function (d) {
          var cw = Math.min(40, 740 / cs.length - 4), x0 = (800 - cs.length * (cw + 4)) / 2;
          cs.forEach(function (c, i) {
            var g = d.group({});
            d.rect(x0 + i * (cw + 4), 20, cw, 40, { rx: 8, tone: i === at ? "hot" : null }, g);
            d.text(x0 + i * (cw + 4) + cw / 2, 47, c === " " ? "␠" : c, { size: 18, tone: i === at ? "on" : null }, g);
            d.hit(g, "character " + (c === " " ? "space" : c), function () { at = i; draw(); }, { key: "ch" + i });
          });
          d.text(120, 230, ch === " " ? "␠" : ch, { size: 104 });
          d.text(120, 292, "U+" + pad(cp.toString(16).toUpperCase(), 4), { size: 16, tone: "sub", weight: "bold" });
          var rows = bytes.length > 2 ? [bytes.slice(0, 2), bytes.slice(2)] : [bytes], w = bytes.length > 1 ? 30 : 52, y = bytes.length > 2 ? 150 : bytes.length > 1 ? 196 : 176;
          rows.forEach(function (rb, r) {
            var bits = rb.join("").split("").map(Number), head = [];
            rb.forEach(function (byte, k) { var hdr = ascii ? 0 : (r === 0 && k === 0 ? bytes.length + 1 : 2); for (var j = 0; j < 8; j++) head.push(j < hdr); });
            var row = bitRow(d, 236, y + r * 120, bits, { w: w, h: w + 6, gap: 4, split: rb.length > 1 ? [8] : null, splitGap: 16, size: bytes.length > 1 ? 16 : 22,
              place: ascii ? ["128", "64", "32", "16", "8", "4", "2", "1"] : null, tone: function (i, b) { return head[i] ? (b ? "front-wash" : "ghost") : b ? "on" : null; } });
            rb.forEach(function (byte, k) {
              var i0 = k * 8, label = "byte " + (r * 2 + k + 1) + " · " + parseInt(byte, 2).toString(16).toUpperCase();
              under(d, row, i0, i0 + 7, label, k + r * 2 ? "sub" : "ink", 10);
            });
          });
          return { w: 800, h: 450 };
        });
        lab.answer("'" + ch + "'", ascii ? String(cp) : "U+" + pad(cp.toString(16).toUpperCase(), 4), ascii ? "denary · 7-bit ASCII, stored in one byte" : "a Unicode code point outside ASCII: " + bytes.length + " bytes in UTF-8");
        lab.values([["denary", String(cp)], ["hex", cp.toString(16).toUpperCase()], ["binary", cp.toString(2)], ["UTF-8 bytes", bytes.length + (ascii ? " (same as ASCII)" : ""), ascii ? null : "front"],
          ascii && cp >= 48 && cp <= 57 ? ["digit value", (cp - 48) + " = code − 48"] : ascii && /[A-Za-z]/.test(ch) ? ["other case", String.fromCharCode(cp ^ 32) + " = " + (cp ^ 32) + " (differs by 32)"] : null]);
        var total = 0;
        lab.section("all", "All characters", [lab.table(["", "denary", "hex", "bytes"], cs.map(function (c) { var p = c.codePointAt(0), n = utf8(p).length; total += n; return [c === " " ? "␠" : c, String(p), p.toString(16).toUpperCase(), String(n)]; }), at)], total + " bytes in UTF-8");
      }
      draw();
    }
  });

  /* =================== ERROR CHECKING =================== */
  KOS.sims.register({
    id: "error-check-lab", title: "Error checking", subject: "compsci", ref: "4.5.5.3",
    desc: "Flip bits in a transmitted byte and see which schemes catch it: parity detects an odd number of flipped bits and nothing else, majority voting corrects, a checksum guards a block, a check digit protects a typed number.",
    mount: function (panel) {
      var data = [1, 0, 1, 1, 0, 0, 1], parity = "even", sent, recv;
      var lab = lab20d(panel, { label: "A byte as sent and as received; flip received bits to corrupt them", hint: "tap a received bit to corrupt it", readout: ["now", "values", "other", "legend"],
        controls: [L.choice([["even", "Even parity"], ["odd", "Odd parity"]], parity, function (p) { parity = p; resend(); }, "Parity"),
          L.action("Resend clean", resend, true), L.action("Flip two", function () { var a = Math.floor(Math.random() * 8), b = (a + 1 + Math.floor(Math.random() * 7)) % 8; recv[a] ^= 1; recv[b] ^= 1; draw(); })] });
      lab.legend([["fill-ink", "1"], ["ring-front", "parity bit"], ["ring-hot", "corrupted in transit"]]);
      function pbit(bits) { var ones = bits.reduce(function (a, b) { return a + b; }, 0); return parity === "even" ? ones % 2 : 1 - ones % 2; }
      function resend() { sent = [pbit(data)].concat(data); recv = sent.slice(); draw(); }
      function draw() {
        var ones = recv.reduce(function (a, b) { return a + b; }, 0), ok = parity === "even" ? ones % 2 === 0 : ones % 2 === 1;
        var flipped = recv.filter(function (b, i) { return b !== sent[i]; }).length;
        var place = ["P", "d1", "d2", "d3", "d4", "d5", "d6", "d7"];
        lab.draw(function (d) {
          d.text(130, 108, "sent", { size: 15, weight: "bold", anchor: "end" });
          var rs = bitRow(d, 160, 80, sent, { place: place, split: [1], tone: function (i, b) { return i === 0 ? (b ? "front-wash" : "front") : b ? "on" : null; } });
          d.line(400, 150, 400, 210, { tone: "sub", arrow: true, dash: true });
          d.text(416, 186, "transmission", { size: 14, tone: "mute", anchor: "start" });
          d.text(130, 258, "received", { size: 15, weight: "bold", anchor: "end" });
          bitRow(d, 160, 230, recv, { split: [1], key: "r", tone: function (i, b) { return b !== sent[i] ? "hot-ring" : i === 0 ? (b ? "front-wash" : "front") : b ? "on" : null; },
            flip: function (i) { recv[i] ^= 1; draw(); }, name: function (i) { return "received " + place[i]; } });
          d.text(rs.right + 20, 330, ones + " ones → " + parity + " parity " + (ok ? "passes" : "fails"), { size: 16, weight: "bold", tone: ok ? (flipped ? "hot" : "done") : "hot", anchor: "end" });
          return { w: 800, h: 450 };
        });
        lab.answer("Parity check", ok ? "passes" : "error detected", flipped ? (ok ? "But " + flipped + " bits were corrupted: an even number of flips slips past parity." : flipped + " bit" + (flipped > 1 ? "s" : "") + " corrupted, and parity caught it. It cannot say which bit.") : "Nothing was corrupted.");
        var copies = [sent[1], recv[1], sent[1]], vote = copies.reduce(function (a, b) { return a + b; }, 0) >= 2 ? 1 : 0;
        lab.values([["ones received", String(ones)], ["bits corrupted", String(flipped), flipped ? "hot" : null], ["parity bit sent", String(sent[0]), "front"]]);
        var byteVal = parseInt(data.join(""), 2), block = [byteVal, 37, 200, 91], sum = block.reduce(function (a, b) { return a + b; }, 0) % 256;
        var isbn = "978014300723", cd = (10 - isbn.split("").reduce(function (a, dg, i) { return a + parseInt(dg, 10) * (i % 2 ? 3 : 1); }, 0) % 10) % 10;
        lab.section("other", "Other schemes", [el("dl", { class: "k-lab-kv" }, [
          el("dt", { text: "majority vote on d1" }), el("dd", { class: "k-mono", text: copies.join("") + " → " + vote + (vote === sent[1] ? " ✓" : "") }),
          el("dt", { text: "checksum (sum mod 256)" }), el("dd", { class: "k-mono", text: "[" + block.join(", ") + "] → " + sum }),
          el("dt", { text: "ISBN-13 check digit" }), el("dd", { class: "k-mono", text: isbn + " → " + cd })]),
          el("p", { class: "k-lab-work", text: "Parity and checksums detect; majority voting corrects, at three times the data." })]);
      }
      resend();
    }
  });

  /* =================== BITMAPS (20d, 720 frame) =================== */
  KOS.sims.register({
    id: "bitmap-lab", title: "Bitmap", subject: "compsci", ref: "4.5.6.4",
    desc: "Paint an 8×8 bitmap at 1, 2 or 4 bits per pixel and read each row's bits and hex as you go; the file size is resolution × colour depth before metadata.",
    mount: function (panel) {
      var N = 8, depth = 1, grid = [], colour = 1, R = 8, cursor = 0;
      /* the heart of frame 20d: one byte per row */
      [0x66, 0xFF, 0xFF, 0xFF, 0x7E, 0x3C, 0x18, 0x00].forEach(function (row) { bitsOf(row, 8).forEach(function (b) { grid.push(b); }); });
      /* the image's own colours (data, not theme), except 0 and 1, which
         are the stage and the accent so a 1-bit image reads in any theme */
      var PAL = ["var(--s1)", "var(--crimson)", "#d4606e", "#6f9a5e", "#5d6ba8", "#a97f2f", "#c0912f", "#7d9b76", "#d9a8bc", "#42c6d0", "#8b5cff", "#e67f74", "#87aaff", "#4d8d67", "#d16e67", "#726751"];
      var sizeSel = el("select", { style: "--w: 84px" }, [8, 16, 32, 64].map(function (r) { return el("option", { value: r, text: r + " × " + r }); }));
      sizeSel.onchange = function () { R = parseInt(sizeSel.value, 10); draw(); };
      var lab = lab20d(panel, { label: "An 8 by 8 bitmap; each pixel is a control, arrow keys move between them", readout: ["now", "values", "legend"],
        controls: [L.choice([["1", "1-bit"], ["2", "2-bit"], ["4", "4-bit"]], "1", function (v) { depth = +v; var mx = Math.pow(2, depth) - 1; grid = grid.map(function (x) { return Math.min(x, mx); }); colour = Math.min(Math.max(colour, 1), mx); draw(); }, "Colour depth"),
          L.field("Size", sizeSel), L.action("Clear", function () { grid = grid.map(function () { return 0; }); draw(); }), L.action("Invert", function () { var mx = Math.pow(2, depth) - 1; grid = grid.map(function (x) { return mx - x; }); draw(); })] });
      function hex(bitsStr) { var out = ""; for (var k = 0; k < bitsStr.length; k += 4) out += parseInt(bitsStr.slice(k, k + 4), 2).toString(16).toUpperCase(); return out; }
      function paint(k) { grid[k] = grid[k] === colour ? 0 : colour; cursor = k; draw(); }
      function draw() {
        var colours = Math.pow(2, depth);
        lab.draw(function (d) {
          var P = 34, G = 4, X0 = 30, Y0 = 52;
          d.text(X0, 36, "pixels", { size: 14, tone: "mute", anchor: "start" });
          grid.forEach(function (v, k) {
            var x = X0 + (k % N) * (P + G), y = Y0 + Math.floor(k / N) * (P + G), g = d.group({});
            var r = d.rect(x, y, P, P, { rx: 5, cls: "k-sv-px" }, g); r.setAttribute("style", "--c: " + PAL[v]);
            d.hit(g, "pixel row " + (Math.floor(k / N) + 1) + ", column " + (k % N + 1) + ", colour " + v, function () { paint(k); }, { key: "px" + k });
            if (k !== cursor) g.setAttribute("tabindex", "-1");
          });
          var SX = X0 + N * (P + G) + 18;
          d.text(SX, 36, "colour", { size: 14, tone: "mute", anchor: "start" });
          for (var c = 0; c < colours; c++) (function (c) {
            var x = SX + Math.floor(c / 8) * 74, y = Y0 + (c % 8) * (P + G), g = d.group({});
            var r = d.rect(x, y, P, P, { rx: 5, cls: "k-sv-px", tone: c === colour ? "hot-ring" : null }, g); r.setAttribute("style", "--c: " + PAL[c]);
            d.text(x + P + 6, y + 23, pad(c.toString(2), depth), { size: 14, tone: c === colour ? "hot" : "sub", anchor: "start" }, g);
            d.hit(g, "colour " + pad(c.toString(2), depth), function () { colour = c; draw(); }, { key: "c" + c, checked: c === colour, role: "radio" });
          })(c);
          var BX = SX + (colours > 8 ? 160 : 86);
          d.text(BX, 36, "row bits", { size: 14, tone: "mute", anchor: "start" });
          d.text(790, 36, "hex", { size: 14, tone: "mute", anchor: "end" });
          for (var r2 = 0; r2 < N; r2++) {
            var bits = grid.slice(r2 * N, r2 * N + N).map(function (v) { return pad(v.toString(2), depth); }).join("");
            var shown = depth === 1 ? bits : bits.match(new RegExp(".{" + depth * 2 + "}", "g")).join(" ");
            d.text(BX, Y0 + r2 * (P + G) + 23, shown, { size: depth === 4 ? 14 : 15, tone: "sub", anchor: "start" });
            d.text(790, Y0 + r2 * (P + G) + 23, hex(bits), { size: 15, weight: "bold", tone: "front", anchor: "end" });
          }
          return { w: 800, h: 450 };
        });
        var bitsTotal = R * R * depth;
        lab.answer("File size", bitsTotal.toLocaleString() + " bits", R + " × " + R + " pixels × " + depth + " bit" + (depth > 1 ? "s" : "") + " = " + (bitsTotal / 8).toLocaleString() + " bytes, before metadata. Each row of the 8 × 8 is " + (depth === 1 ? "one byte" : depth * N / 8 + " bytes") + ".");
        lab.values([["pixels", R + " × " + R + " = " + (R * R).toLocaleString()], ["colour depth", depth + " bit" + (depth > 1 ? "s" : "") + " → " + colours + " colours"],
          ["each row", depth === 1 ? "one byte" : depth * N / 8 + " bytes"], ["doubling the width", "quadruples the size"]]);
      }
      lab.stage.addEventListener("keydown", function (e) {
        var k = e.target && e.target.getAttribute && e.target.getAttribute("data-key");
        if (!k || k.indexOf("px") !== 0) return;
        var n = parseInt(k.slice(2), 10), mv = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -N, ArrowDown: N }[e.key];
        if (mv == null) return;
        e.preventDefault();
        var to = n + mv; if (to < 0 || to >= N * N || (Math.abs(mv) === 1 && Math.floor(to / N) !== Math.floor(n / N))) return;
        cursor = to; draw();
        var t = lab.stage.querySelector('[data-key="px' + to + '"]'); if (t) t.focus();
      });
      draw();
    }
  });

  /* =================== IP ADDRESSES AND SUBNET MASKS =================== */
  KOS.sims.register({
    id: "subnet-lab", title: "Subnet masks", subject: "compsci", ref: "4.9.4.4",
    desc: "Split an IPv4 address into network and host bits with a mask or /prefix, and AND a second address with the mask to see whether the two hosts share a subnet — the question a router asks.",
    mount: function (panel) {
      var ipIn = txtIn("192.168.10.77", 130), maskIn = txtIn("/26", 120), ip2In = txtIn("192.168.10.130", 130);
      [ipIn, maskIn, ip2In].forEach(function (i) { i.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); }); });
      var lab = lab20d(panel, { interactive: false, label: "An address, the mask, and the network they give, as 32 bits each", readout: ["now", "values", "legend"],
        controls: [L.field("IP", ipIn), L.field("Mask", maskIn), L.field("Second host", ip2In), L.action("Work it out", run, true)] });
      lab.legend([["fill-ink", "network bit"], ["ring-mute", "host bit"], ["line-hot", "prefix boundary"]]);
      function parseIp(s) { var p = s.trim().split("."); if (p.length !== 4) return null; var v = p.map(Number); if (v.some(function (x) { return !Number.isInteger(x) || x < 0 || x > 255; })) return null; return v; }
      function bits(o) { return o.reduce(function (a, x) { return a.concat(bitsOf(x, 8)); }, []); }
      function run() {
        var ip = parseIp(ipIn.value), ip2 = parseIp(ip2In.value), mask, prefix, m = /^\/?(\d{1,2})$/.exec(maskIn.value.trim());
        if (m) { prefix = parseInt(m[1], 10); if (prefix > 32) return lab.now([["A prefix is 0 to 32.", "hot"]]); mask = [0, 0, 0, 0]; for (var i = 0; i < prefix; i++) mask[Math.floor(i / 8)] |= 128 >> (i % 8); }
        else { mask = parseIp(maskIn.value); if (!mask) return lab.now([["A mask is dotted decimal (255.255.255.192) or a /prefix.", "hot"]]); var mb = bits(mask).join(""); if (!/^1*0*$/.test(mb)) return lab.now([["Not a valid mask: its 1s must be contiguous.", "hot"]]); prefix = mb.indexOf("0") < 0 ? 32 : mb.indexOf("0"); }
        if (!ip) return lab.now([["An IP address is four numbers from 0 to 255.", "hot"]]);
        var net = ip.map(function (o, i) { return o & mask[i]; }), bc = ip.map(function (o, i) { return o | (~mask[i] & 255); });
        var net2 = ip2 ? ip2.map(function (o, i) { return o & mask[i]; }) : null, same = net2 && net2.every(function (o, i) { return o === net[i]; });
        var hostBits = 32 - prefix, hosts = hostBits >= 2 ? Math.pow(2, hostBits) - 2 : hostBits === 1 ? 2 : 1;
        var first = net.slice(), last = bc.slice(); if (hostBits >= 2) { first[3] += 1; last[3] -= 1; }
        var rows = [["address", ip], ["mask /" + prefix, mask], ["AND → network", net]].concat(ip2 ? [["host 2 AND mask", net2]] : []);
        function tone(k, j, b) { return k === 1 ? (b ? "on" : null) : j < prefix ? (b ? "on" : "soft") : b ? "faint" : "ghost"; }
        function labelTone(k) { return k === 2 ? "ink" : k === 3 ? (same ? "done" : "hot") : null; }
        lab.draw(function (d) {
          /* a phone: each address is two lines of 16 bits under its name,
             so a cell is half the frame's width instead of a 32nd of it */
          if (lab.narrow()) {
            var NX = 40, nw = 26, ng = 3, span = 16 * (nw + ng) - ng + 10;
            d.text(NX, 22, "/" + prefix + " · network | host", { size: 14, weight: "bold", tone: "hot", anchor: "start" });
            rows.forEach(function (r, k) {
              var y = 56 + k * 124, b = bits(r[1]);
              d.text(NX, y, r[0], { size: 14, weight: "bold", anchor: "start", tone: labelTone(k) });
              d.text(NX + span, y, r[1].join("."), { size: 14, tone: "mute", anchor: "end" });
              [0, 16].forEach(function (s0, half) {
                var line = bitRow(d, NX, y + 14 + half * 40, b.slice(s0, s0 + 16), { w: nw, h: 30, gap: ng, split: [8], splitGap: 10, size: 14,
                  tone: function (i, v) { return tone(k, s0 + i, v); } });
                var at = prefix - s0;
                if (half ? at > 0 && at <= 16 : at >= 0 && at <= 16) {
                  var px = at === 16 ? line.right + 4 : line.xs[at] - (at % 8 ? ng / 2 : 5);
                  d.line(px, line.y - 4, px, line.y + line.h + 4, { tone: "hot", dash: true });
                }
              });
            });
            return { w: 800, h: Math.max(450, 56 + rows.length * 124) };
          }
          var X0 = 160, w = 17, gap = 2;
          rows.forEach(function (r, k) {
            var y = 60 + k * 86;
            d.text(X0 - 14, y + 18, r[0], { size: 14, weight: "bold", anchor: "end", tone: labelTone(k) });
            d.text(X0 - 14, y + 38, r[1].join("."), { size: 14, tone: "mute", anchor: "end" });
            var row = bitRow(d, X0, y, bits(r[1]), { w: w, h: 30, gap: gap, split: [8, 16, 24], splitGap: 10, size: 14,
              tone: function (i, b) { return tone(k, i, b); } });
            if (k === 0) {
              var px = prefix < 32 ? row.xs[Math.min(prefix, 31)] - (prefix % 8 ? gap / 2 : 5) : row.right + 4;
              d.line(px, 40, px, 60 + rows.length * 86 - 40, { tone: "hot", dash: true });
              d.text(px, 34, "/" + prefix, { size: 14, weight: "bold", tone: "hot" });
            }
          });
          return { w: 800, h: 450 };
        });
        lab.answer("Network ID", net.join(".") + "/" + prefix, "address AND mask, bit by bit: the 1s of the mask keep the network part.");
        lab.values([["usable hosts", hosts.toLocaleString() + " (2" + sup(hostBits) + " − 2)"], ["first – last", first.join(".") + " – " + last.join(".")], ["broadcast", bc.join(".")],
          ip2 ? ["second host", same ? "same subnet: deliver directly" : "different subnet: send via the router", same ? "done" : "hot"] : ["second host", "not a valid address", "hot"]]);
      }
      run();
    }
  });

  /* =================== NUMBER BASES =================== */
  KOS.sims.register({
    id: "base-sandbox", title: "Number bases", subject: "compsci", ref: "4.5.2.1",
    desc: "Type a value in denary, binary, octal or hex and the others follow, with the bits drawn under their place values, the hex digit under each nibble, and repeated division as the working.",
    mount: function (panel) {
      var BASES = [["Denary", 10, 64], ["Binary", 2, 150], ["Octal", 8, 70], ["Hex", 16, 56]], fields = {}, n = 214;
      BASES.forEach(function (b) { fields[b[1]] = txtIn(b[1] === 10 ? "214" : "", b[2], function () { update(b[1]); }); });
      var lab = lab20d(panel, { interactive: false, label: "The value as bits under their place values", readout: ["now", "values", "work", "legend"],
        controls: BASES.map(function (b) { return L.field(b[0], fields[b[1]]); }) });
      lab.legend([["fill-ink", "1"], ["ring-mute", "0"], ["fill-front", "hex digit per nibble"]]);
      function update(from) {
        var raw = fields[from].value.replace(/\s+/g, "").toUpperCase();
        if (!raw) return;
        var ok = raw.split("").every(function (c) { var v = parseInt(c, from); return !isNaN(v) && v < from; }), v = parseInt(raw, from);
        if (!ok || isNaN(v)) { lab.now([["\"" + raw + "\" is not a base-" + from + " number.", "hot"]]); return; }
        if (v > 65535) { lab.now([["Keep it to 16 bits: 65535 or less.", "hot"]]); return; }
        n = v;
        BASES.forEach(function (b) { if (b[1] !== from) fields[b[1]].value = n.toString(b[1]).toUpperCase(); });
        draw();
      }
      function draw() {
        var w = n > 255 ? 16 : 8, bs = bitsOf(n, w);
        lab.draw(function (d) {
          var cw = w > 8 ? 40 : 56, total = w * (cw + 6) + (w / 4 - 1) * 16, x0 = (800 - total) / 2;
          var row = bitRow(d, x0, 150, bs, { w: cw, h: cw + 4, gap: 6, split: w > 8 ? [4, 8, 12] : [4], splitGap: 16, size: w > 8 ? 18 : 22,
            place: bs.map(function (_, i) { return String(Math.pow(2, w - 1 - i)); }), placeSize: 14 });
          for (var k = 0; k < w; k += 4) d.text((row.xs[k] + row.xs[k + 3] + row.w) / 2, row.y + row.h + 44, uval(bs.slice(k, k + 4)).toString(16).toUpperCase(), { size: 26, weight: "bold", tone: "front" });
          var on = []; bs.forEach(function (b, i) { if (b) on.push(Math.pow(2, w - 1 - i)); });
          d.text(400, row.y + row.h + 100, (on.length ? on.join(" + ") : "0") + " = " + n, { size: 16, tone: "sub" });
          return { w: 800, h: 450 };
        });
        lab.answer("Denary", String(n), null);
        lab.values([["binary", n.toString(2), "ink"], ["octal", n.toString(8)], ["hex", n.toString(16).toUpperCase(), "front"], ["octal from bits", "groups of 3 from the right"]]);
        var steps = [], q = n;
        if (!n) steps.push(["0 ÷ 2", "0", "0"]);
        while (q > 0) { steps.push([q + " ÷ 2", String(Math.floor(q / 2)), String(q % 2)]); q = Math.floor(q / 2); }
        lab.section("work", "Repeated division", [lab.table(["", "quotient", "rem"], steps), el("p", { class: "k-lab-work", text: "Read the remainders bottom-up: " + n.toString(2) })]);
      }
      update(10);
    }
  });

  /* =================== BOOLEAN EXPRESSIONS =================== */
  KOS.sims.register({
    id: "logic-lab", title: "Boolean expressions", subject: "compsci", ref: "4.6.2.1",
    desc: "Type a Boolean expression and flip the inputs: the expression is drawn as a gate tree with live wires, and the truth table lights the row you are on.",
    mount: function (panel) {
      var exprIn = txtIn("A.B + ¬C", 180);
      exprIn.addEventListener("keydown", function (e) { if (e.key === "Enter") build(); });
      var lab = lab20d(panel, { label: "The expression as a tree of gates; the inputs are switches", readout: ["now", "tt", "legend"],
        controls: [L.field("Q =", exprIn), L.action("Build", build, true), el("span", { class: "k-lab-field", text: ". AND  + OR  ¬ NOT  xor" })] });
      lab.legend([["fill-ink", "signal 1"], ["ring-mute", "signal 0"], ["line-ink", "wire carrying 1"]]);
      function tokenize(s) {
        s = s.toUpperCase().replace(/¬|!/g, " NOT ").replace(/\./g, " AND ").replace(/&+/g, " AND ").replace(/\+/g, " OR ").replace(/\|+/g, " OR ").replace(/\^|⊕/g, " XOR ").replace(/\(/g, " ( ").replace(/\)/g, " ) ");
        return s.trim().split(/\s+/).filter(Boolean);
      }
      function parse(tokens) {
        var pos = 0;
        function peek() { return tokens[pos]; }
        function eat(t) { if (tokens[pos] === t) { pos++; return true; } return false; }
        function atom() {
          if (eat("(")) { var e = orExpr(); if (!eat(")")) throw "missing )"; return e; }
          if (eat("NOT")) return { op: "NOT", a: atom() };
          var t = peek();
          if (/^[A-Z]$/.test(t || "")) { pos++; return { v: t }; }
          if (t === "1" || t === "0") { pos++; return { k: t === "1" }; }
          throw "expected a variable at “" + (t || "the end") + "”";
        }
        function andExpr() { var a = atom(); while (peek() === "AND" || peek() === "NAND") { var op = tokens[pos++]; a = { op: op, a: a, b: atom() }; } return a; }
        function orExpr() { var a = andExpr(); while (peek() === "OR" || peek() === "XOR" || peek() === "NOR") { var op = tokens[pos++]; a = { op: op, a: a, b: andExpr() }; } return a; }
        var e = orExpr();
        if (pos < tokens.length) throw "unexpected “" + tokens[pos] + "”";
        return e;
      }
      function ev(n, env) {
        if (n.v !== undefined) return env[n.v];
        if (n.k !== undefined) return n.k;
        var a = ev(n.a, env), b = n.b !== undefined ? ev(n.b, env) : undefined;
        return n.op === "NOT" ? !a : n.op === "AND" ? a && b : n.op === "NAND" ? !(a && b) : n.op === "OR" ? a || b : n.op === "NOR" ? !(a || b) : a !== b;
      }
      function vars(n, set) { set = set || {}; if (n.v) set[n.v] = true; if (n.a) vars(n.a, set); if (n.b) vars(n.b, set); return set; }
      var ast = null, names = [], env = {};
      function build() {
        try { ast = parse(tokenize(exprIn.value)); }
        catch (e) { ast = null; lab.draw(function () { return { w: 800, h: 450 }; }); lab.now([["Could not read that: " + e + ".", "hot"]]); lab.section("tt", "Truth table", null); return; }
        names = Object.keys(vars(ast)).sort();
        if (names.length > 5) { ast = null; lab.now([["Keep it to five inputs — that is already 32 rows.", "hot"]]); return; }
        env = {}; names.forEach(function (n) { env[n] = false; });
        draw();
      }
      function draw() {
        var out = ev(ast, env);
        lab.draw(function (d) {
          /* inputs on the left as switches */
          var sx = 34, sh = 58, sy0 = Math.max(30, 225 - names.length * sh / 2);
          names.forEach(function (n, i) {
            var g = d.group({ "data-ui": "lab.logic-switch" }), y = sy0 + i * sh;
            d.rect(sx, y, 50, 46, { rx: 12, tone: env[n] ? "on" : null }, g);
            d.text(sx + 25, y + 31, env[n] ? "1" : "0", { size: 20, weight: "bold", tone: env[n] ? "on" : "mute" }, g);
            d.text(sx + 64, y + 30, n, { size: 18, weight: "bold", anchor: "start" }, g);
            d.hit(g, "input " + n + ", " + (env[n] ? 1 : 0), function () { env[n] = !env[n]; draw(); }, { role: "switch", checked: env[n], key: "in" + n });
          });
          /* the gate tree, output on the right */
          var leaves = 0, depth = 0;
          (function lay(n, dpt) { n.d = dpt; depth = Math.max(depth, dpt); if (n.v !== undefined || n.k !== undefined) { n.slot = leaves++; return; } lay(n.a, dpt + 1); if (n.b) lay(n.b, dpt + 1); n.slot = n.b ? (n.a.slot + n.b.slot) / 2 : n.a.slot; })(ast, 0);
          var X1 = 650, X0 = 190, gx = depth ? (X1 - X0) / depth : 0, gy = Math.min(70, 360 / Math.max(1, leaves)), Y0 = 225 - (leaves - 1) * gy / 2;
          function pos(n) { return { x: X1 - n.d * gx, y: Y0 + n.slot * gy }; }
          (function wire(n) {
            if (n.v !== undefined || n.k !== undefined) return;
            [n.a, n.b].forEach(function (c) { if (!c) return; var p = pos(n), q = pos(c), on = ev(c, env); d.path("M" + (q.x + 26) + " " + q.y + " H" + ((p.x + q.x) / 2) + " V" + p.y + " H" + (p.x - 34), { tone: on ? "ink" : "mute" }); wire(c); });
          })(ast);
          (function node(n) {
            var p = pos(n), on = ev(n, env);
            if (n.v !== undefined || n.k !== undefined) {
              d.rect(p.x - 24, p.y - 17, 50, 34, { rx: 17, tone: on ? "on" : null });
              d.text(p.x + 1, p.y + 6, n.v !== undefined ? n.v : n.k ? "1" : "0", { size: 15, weight: "bold", tone: on ? "on" : null });
              return;
            }
            d.rect(p.x - 34, p.y - 20, 68, 40, { rx: 10, tone: on ? "done-ring" : null });
            d.text(p.x, p.y + 6, n.op, { size: 14, weight: "bold", tone: on ? "done" : "sub" });
            node(n.a); if (n.b) node(n.b);
          })(ast);
          var r = pos(ast);
          d.line(r.x + 34, r.y, 712, r.y, { tone: out ? "ink" : "mute" });
          d.circle(740, r.y, 28, { tone: out ? "on" : null });
          d.text(740, r.y + 7, out ? "1" : "0", { size: 20, weight: "bold", tone: out ? "on" : "mute" });
          d.text(740, r.y + 50, "Q", { size: 15, weight: "bold" });
          return { w: 800, h: Math.max(450, Y0 + leaves * gy + 40, sy0 + names.length * sh + 20), count: names.length, noun: "input" };
        });
        lab.answer("Q", out ? "1" : "0", names.map(function (n) { return n + " = " + (env[n] ? 1 : 0); }).join(", ") || "a constant expression");
        var rows = [], live = -1, n = names.length;
        for (var i = 0; i < (1 << n); i++) {
          var e2 = {}, cells = [];
          for (var j = 0; j < n; j++) { var bit = (i >> (n - 1 - j)) & 1; e2[names[j]] = !!bit; cells.push(String(bit)); }
          if (names.every(function (nm) { return e2[nm] === env[nm]; })) live = i;
          rows.push(cells.concat([ev(ast, e2) ? "1" : "0"]));
        }
        lab.section("tt", "Truth table", [lab.table(names.concat(["Q"]), rows, live, { hook: "content.table lab.truth-table" })], "live row lit");
      }
      build();
    }
  });

  /* =================== LOGIC GATES =================== */
  KOS.sims.register({
    id: "logic-gates", title: "Logic gates", subject: "compsci", ref: "4.6.4.1",
    desc: "Pick a gate, flip inputs A and B, and watch the output and the truth-table row update: AND, OR, NOT, XOR, NAND and NOR, drawn as their symbols.",
    mount: function (panel) {
      var GATES = {
        AND: { f: function (a, b) { return a & b; }, sym: "A · B" }, OR: { f: function (a, b) { return a | b; }, sym: "A + B" },
        NOT: { f: function (a) { return a ? 0 : 1; }, sym: "¬A", unary: true }, XOR: { f: function (a, b) { return a ^ b; }, sym: "A ⊕ B" },
        NAND: { f: function (a, b) { return (a & b) ? 0 : 1; }, sym: "¬(A · B)" }, NOR: { f: function (a, b) { return (a | b) ? 0 : 1; }, sym: "¬(A + B)" }
      };
      var gate = "AND", A = 0, B = 0;
      var lab = lab20d(panel, { label: "A logic gate with switchable inputs", hint: "tap A or B", readout: ["now", "tt", "legend"],
        controls: [L.choice(Object.keys(GATES).map(function (k) { return [k, k]; }), gate, function (g) { gate = g; draw(); }, "Gate")] });
      lab.legend([["fill-ink", "1"], ["ring-mute", "0"], ["line-ink", "wire carrying 1"]]);
      function body(x, y) {
        /* the gate symbol, 120 × 96, its inputs on the left */
        if (gate === "NOT") return "M" + x + " " + y + " L" + (x + 96) + " " + (y + 48) + " L" + x + " " + (y + 96) + " Z";
        if (gate === "AND" || gate === "NAND") return "M" + x + " " + y + " H" + (x + 60) + " A48 48 0 0 1 " + (x + 60) + " " + (y + 96) + " H" + x + " Z";
        return "M" + x + " " + y + " Q" + (x + 34) + " " + (y + 48) + " " + x + " " + (y + 96) + " Q" + (x + 86) + " " + (y + 96) + " " + (x + 120) + " " + (y + 48) + " Q" + (x + 86) + " " + y + " " + x + " " + y + " Z";
      }
      function draw() {
        var g = GATES[gate], out = g.unary ? g.f(A) : g.f(A, B), gx = 330, gy = 177;
        lab.draw(function (d) {
          var ins = g.unary ? [["A", A, gy + 48]] : [["A", A, gy + 24], ["B", B, gy + 72]];
          ins.forEach(function (q) {
            var grp = d.group({ "data-ui": "lab.logic-switch" });
            d.rect(120, q[2] - 26, 52, 52, { rx: 12, tone: q[1] ? "on" : null }, grp);
            d.text(146, q[2] + 8, String(q[1]), { size: 22, weight: "bold", tone: q[1] ? "on" : "mute" }, grp);
            d.text(100, q[2] + 7, q[0], { size: 18, weight: "bold", anchor: "end" }, grp);
            d.hit(grp, "input " + q[0] + ", " + q[1], function () { if (q[0] === "A") A ^= 1; else B ^= 1; draw(); }, { role: "switch", checked: !!q[1], key: q[0] });
            d.line(172, q[2], gx + (gate === "OR" || gate === "NOR" || gate === "XOR" ? 16 : 0), q[2], { tone: q[1] ? "ink" : "mute" });
          });
          if (gate === "XOR") d.path("M" + (gx - 12) + " " + gy + " Q" + (gx + 22) + " " + (gy + 48) + " " + (gx - 12) + " " + (gy + 96), { tone: "sub" });
          d.el("path", { d: body(gx, gy), class: "k-sv-node", "data-tone": out ? "ink" : null });
          var tip = gate === "NOT" ? gx + 96 : gx + 120;
          if (gate === "NOT" || gate === "NAND" || gate === "NOR") { d.circle(tip + 9, gy + 48, 8, {}); tip += 18; }
          d.text(gx + (gate === "NOT" ? 34 : 50), gy + 54, gate, { size: 15, weight: "bold", tone: "sub" });
          d.line(tip, gy + 48, 580, gy + 48, { tone: out ? "ink" : "mute" });
          d.circle(612, gy + 48, 30, { tone: out ? "on" : null });
          d.text(612, gy + 56, String(out), { size: 22, weight: "bold", tone: out ? "on" : "mute" });
          d.text(612, gy + 104, "Q", { size: 16, weight: "bold" });
          return { w: 800, h: 450 };
        });
        lab.answer("Q = " + g.sym, String(out), g.unary ? "A = " + A : "A = " + A + ", B = " + B);
        var rows = g.unary ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]], live = -1;
        var tr = rows.map(function (r, i) { var q = g.unary ? g.f(r[0]) : g.f(r[0], r[1]); if (g.unary ? r[0] === A : r[0] === A && r[1] === B) live = i; return r.map(String).concat([String(q)]); });
        lab.section("tt", gate + " truth table", [lab.table(g.unary ? ["A", "Q"] : ["A", "B", "Q"], tr, live, { hook: "content.table lab.truth-table" })]);
      }
      draw();
    }
  });
})();
