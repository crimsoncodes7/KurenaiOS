/* The manga panel (docs/japanese-plan.md §12): raster art with LIVE text on top. Bubbles are
   drawn in SVG (an ellipse and a tail, outlined as one shape) and their text is real, vertical
   (writing-mode: vertical-rl) Japanese, so it is selectable, carries furigana by mastery, can be
   heard in the speaker's voice, and can be blanked for a "fill the bubble" exercise.
   Throwaway slice code. */
(function () {
  "use strict";
  var JA = window.JA, X = JA.ex, el = X.el;
  var NS = "http://www.w3.org/2000/svg";
  var ART = "art/";

  function svg(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }
  // a tail: a wedge from inside the bubble out to the speaker
  function tailPath(b) {
    var cx = b.x, cy = b.y, tx = b.tail[0], ty = b.tail[1];
    var dx = tx - cx, dy = ty - cy, len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len, w = Math.min(b.rx, b.ry) * 0.35;
    // the base sits inside the ellipse, so the union outline is seamless
    var bx = cx + dx / len * Math.min(b.rx, b.ry) * 0.5, by = cy + dy / len * Math.min(b.rx, b.ry) * 0.5;
    return "M" + (bx + nx * w) + " " + (by + ny * w) + " L" + tx + " " + ty + " L" + (bx - nx * w) + " " + (by - ny * w) + " Z";
  }
  function voice(who, text) {
    if (!window.speechSynthesis) return;
    var c = (JA.cast || {})[who] || {};
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(X.plain(text).replace(/[\[\]]/g, "")); u.lang = "ja-JP"; u.pitch = c.pitch || 1; u.rate = c.rate || 0.92;
    var v = speechSynthesis.getVoices().filter(function (x) { return /^ja/i.test(x.lang); })[0]; if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  /* JA.mangaPanel(panel, opts) → node.
     panel: {img, w, h, alt, bubbles: [{who, ja, en, x, y, rx, ry, tail:[x, y], size}], sfx: [{ja, x, y, size, rot}]}
       — positions in % of the panel (x of its width, y of its height); `ja` breaks columns at "\n";
       "[これ]" marks a slot the quiz blanks.
     opts: {ruby(text) → node, mode: "read" | "quiz", onMine(line), onAnswer(verdicts)} */
  JA.mangaPanel = function (panel, opts) {
    opts = opts || {};
    var mode = opts.mode || "read";
    var fig = el("figure", { class: "manga", "data-mode": mode, style: "aspect-ratio:" + panel.w + " / " + panel.h });
    fig.appendChild(el("img", { class: "manga-art", src: ART + panel.img + ".webp", alt: panel.alt || "", draggable: "false" }));

    // the balloons: every stroke first, then every fill, so overlapping balloons and tails merge
    var g = svg("svg", { class: "manga-balloons", viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true" });
    var strokes = svg("g", { class: "b-stroke" }), fills = svg("g", { class: "b-fill" });
    panel.bubbles.forEach(function (b) {
      [strokes, fills].forEach(function (layer) {
        layer.appendChild(svg("ellipse", { cx: b.x, cy: b.y, rx: b.rx, ry: b.ry, "vector-effect": "non-scaling-stroke" }));
        if (b.tail) layer.appendChild(svg("path", { d: tailPath(b), "vector-effect": "non-scaling-stroke" }));
      });
    });
    g.appendChild(strokes); g.appendChild(fills);
    fig.appendChild(g);

    var slots = [];
    // manga order: right to left, top to bottom — the authored order IS the reading order
    panel.bubbles.forEach(function (b, k) {
      var text = el("p", { class: "b-text", lang: "ja", style: "font-size:" + (b.size || 2.6) + "cqw" });
      b.ja.split("\n").forEach(function (col, ci) {
        if (ci) text.appendChild(el("br"));
        col.split(/(\[[^\]]+\])/).forEach(function (part) {
          var m = /^\[([^\]]+)\]$/.exec(part);
          if (!m) { if (part) text.appendChild(opts.ruby ? opts.ruby(part) : document.createTextNode(X.plain(part))); return; }
          if (mode !== "quiz") { text.appendChild(document.createTextNode(m[1])); return; }
          var slot = el("button", { class: "b-slot", type: "button", "aria-label": "Blank " + (slots.length + 1) + " in " + ((JA.cast[b.who] || {}).name || b.who) + "'s bubble", text: "？" });
          var rec = { node: slot, answer: m[1], why: (b.why || {})[m[1]], pick: null, who: b.who };
          slot.addEventListener("click", function () { choose(rec); });
          slots.push(rec); text.appendChild(slot);
        });
      });
      var bub = el("div", { class: "b-bubble", style: "left:" + b.x + "%;top:" + b.y + "%", "data-who": b.who }, [
        text,
        el("button", { class: "b-hear", type: "button", "aria-label": "Hear " + ((JA.cast[b.who] || {}).name || b.who) + "'s line" + (b.en ? " (" + b.en + ")" : ""), onclick: function () { voice(b.who, b.ja); bub.classList.add("on"); setTimeout(function () { bub.classList.remove("on"); }, 1200); } }, ["▶"])
      ]);
      bub.title = b.en || "";
      fig.appendChild(bub);
    });
    (panel.sfx || []).forEach(function (s) {
      fig.appendChild(el("span", { class: "manga-sfx", lang: "ja", "aria-hidden": "true", text: s.ja,
        style: "left:" + s.x + "%;top:" + s.y + "%;font-size:" + (s.size || 9) + "cqw;transform:translate(-50%,-50%) rotate(" + (s.rot || 0) + "deg)" }));
    });

    var wrap = el("div", { class: "manga-wrap" }, [fig]);
    // the bar under the panel: hear it in order, English, and (quiz) the picker
    var en = el("ol", { class: "manga-en muted small", hidden: true }, panel.bubbles.map(function (b) {
      return el("li", {}, [el("b", { lang: "ja", text: ((JA.cast[b.who] || {}).name || b.who) + " " }), b.en || ""]);
    }));
    var picker = el("div", { class: "manga-pick", hidden: true, role: "group" });
    var verdict = el("p", { class: "verdict", "aria-live": "polite" });
    var tools = el("div", { class: "manga-tools" }, [
      el("button", { class: "btn", type: "button", onclick: function () { playAll(); } }, ["▶ Hear the panel"]),
      el("button", { class: "btn", type: "button", onclick: function (e) { en.hidden = !en.hidden; e.currentTarget.setAttribute("aria-pressed", String(!en.hidden)); }, "aria-pressed": "false" }, ["English"]),
      opts.onMine && mode === "read" ? el("button", { class: "btn", type: "button", onclick: function (e) { panel.bubbles.forEach(function (b) { opts.onMine({ ja: b.ja.replace(/\n/g, "").replace(/[\[\]]/g, ""), en: b.en, who: b.who, src: { kind: "manga", title: panel.img } }); }); e.currentTarget.textContent = "✓ Mined"; } }, ["Mine the lines"]) : null,
      mode === "quiz" ? el("button", { class: "btn primary", type: "button", onclick: check }, ["Check"]) : null
    ]);
    wrap.appendChild(picker); wrap.appendChild(tools); wrap.appendChild(verdict); wrap.appendChild(en);

    function playAll() {
      var i = 0;
      (function next() {
        if (i >= panel.bubbles.length || !window.speechSynthesis) return;
        var b = panel.bubbles[i++], node = fig.querySelectorAll(".b-bubble")[i - 1];
        voice(b.who, b.ja); node.classList.add("on");
        var t = setInterval(function () { if (!speechSynthesis.speaking) { clearInterval(t); node.classList.remove("on"); setTimeout(next, 350); } }, 150);
      })();
    }
    function choose(rec) {
      picker.hidden = false; picker.innerHTML = "";
      picker.setAttribute("aria-label", "Fill " + rec.node.getAttribute("aria-label"));
      slots.forEach(function (s) { s.node.classList.toggle("active", s === rec); });
      (panel.choices || ["これ", "それ", "あれ", "どれ"]).forEach(function (c) {
        picker.appendChild(el("button", { class: "btn", type: "button", lang: "ja", onclick: function () {
          rec.pick = c; rec.node.textContent = c; rec.node.classList.add("filled"); rec.node.classList.remove("active", "ok", "no");
          picker.hidden = true; verdict.textContent = ""; verdict.className = "verdict";
          var next = slots.filter(function (s) { return !s.pick; })[0];
          (next ? next.node : tools.querySelector(".primary")).focus();
        } }, [c]));
      });
      picker.firstChild.focus();
    }
    function check() {
      var open = slots.filter(function (s) { return !s.pick; });
      if (open.length) { verdict.className = "verdict"; verdict.textContent = "Fill every blank first (" + open.length + " left)."; open[0].node.focus(); return; }
      var res = slots.map(function (s) {
        var r = JA.valid.check("exact-kana", s.pick, { target: s.answer });
        s.node.classList.toggle("ok", r.verdict === "correct"); s.node.classList.toggle("no", r.verdict !== "correct");
        return { slot: s, verdict: r.verdict };
      });
      var bad = res.filter(function (r) { return r.verdict !== "correct"; });
      verdict.className = "verdict v-" + (bad.length ? "wrong" : "correct");
      verdict.innerHTML = "";
      verdict.appendChild(document.createTextNode(bad.length ? "✗ " + bad.length + " of " + res.length + " not quite. " : "✓ All " + res.length + " right. "));
      (bad.length ? bad : res).forEach(function (r) {
        if (r.slot.why) verdict.appendChild(el("span", { class: "why" }, [el("b", { lang: "ja", text: r.slot.answer }), " — " + r.slot.why + " "]));
      });
      if (opts.onAnswer) opts.onAnswer(res);
    }
    wrap._fig = fig; wrap._slots = slots; wrap._check = check;
    return wrap;
  };

  // lesson 1.1's two panels (art batch 5): authored over the art, never baked into it
  JA.panels = {
    kosoa1: {
      img: "ja.panel.kosoa.1", w: 1800, h: 1344,
      alt: "Manga panel in the café: Yōta holds a slice of cake close to himself; Akari, a couple of metres away, holds an iced drink; a framed cat poster hangs far behind them.",
      // right to left: Akari asks first (right), Yōta answers (left)
      bubbles: [
        { who: "akari", ja: "[それ]は\nなんですか。", en: "What's that (near you)?", x: 89, y: 20, rx: 8, ry: 17, tail: [80, 24], size: 2.7,
          why: { "それ": "the cake is near Yōta, the listener — so Akari says それ." } },
        { who: "yota", ja: "[これ]ですか？\nケーキです。", en: "This? It's cake.", x: 9, y: 25, rx: 8, ry: 20, tail: [21, 26], size: 2.7,
          why: { "これ": "the cake is in Yōta's own hands — near the speaker — so it is これ." } }
      ]
    },
    kosoa2: {
      img: "ja.panel.kosoa.2", w: 1380, h: 1800,
      alt: "Tall manga panel: Yōta points excitedly far into the distance, still holding the cake plate; Akari follows his finger with her eyes, amused. Speed lines behind his arm.",
      bubbles: [
        { who: "yota", ja: "[あれ]も\nケーキですか！？", en: "Is that over there cake too!?", x: 20, y: 17, rx: 13, ry: 14, tail: [36, 32], size: 4.2,
          why: { "あれ": "he points far from both of them — あれ." } },
        { who: "akari", ja: "いいえ、\n[あれ]は\nねこです。", en: "No, that over there is a cat.", x: 85, y: 86, rx: 12, ry: 11, tail: [89, 66], size: 3.6,
          why: { "あれ": "the poster is far from both of them, so Akari also says あれ — not それ." } }
      ],
      // the drawn squiggles under the arm become a real sound effect
      sfx: [{ ja: "ビシッ", x: 22, y: 74, size: 13, rot: -14 }]
    }
  };
})();
