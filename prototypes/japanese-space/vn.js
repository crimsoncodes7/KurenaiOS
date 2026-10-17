/* The VN scene (docs/japanese-plan.md §12): a background, the cast as sprites, a text box with a
   name plate, typewriter text, furigana by your mastery, a voice per line and a backlog.
   A reaction swaps the sprite for the same pose with another face (art_import.py keeps the body
   pixels identical), cross-faded, so only the face changes. Throwaway slice code. */
(function () {
  "use strict";
  var JA = window.JA, X = JA.ex, el = X.el;
  var ART = "art/";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  JA.cast = {
    akari: { name: "灯", full: "白石 灯", sprite: "ja.base.akari.a", faces: { neutral: "ja.base.akari.a", happy: "ja.face.akari.happy", surprised: "ja.face.akari.surprised", troubled: "ja.face.akari.troubled", thinking: "ja.face.akari.thinking" }, pitch: 1.15, rate: 0.92 },
    yota: { name: "陽太", full: "朝日 陽太", sprite: "ja.base.yota.a", faces: { neutral: "ja.base.yota.a", happy: "ja.face.yota.happy", surprised: "ja.face.yota.surprised", troubled: "ja.face.yota.troubled", thinking: "ja.face.yota.thinking" }, pitch: 0.85, rate: 0.98 }
  };

  /* scene(script, opts) → node. script: {bg, left, right, lines: [{who, face, ja, en}]}.
     opts: {ruby(text) → node, onLine(i), onEnd(), onMine(line)} */
  JA.vnScene = function (script, opts) {
    opts = opts || {};
    var i = -1, typing = null, log = [];
    var stage = el("div", { class: "vn", role: "group", "aria-label": "Scene: " + (script.title || "") });
    var bg = el("img", { class: "vn-bg", src: ART + script.bg + ".webp", alt: "" });
    stage.appendChild(bg);
    var slots = {};
    [["left", script.left], ["right", script.right]].forEach(function (p) {
      if (!p[1]) return;
      var c = JA.cast[p[1]], wrap = el("div", { class: "vn-chara vn-" + p[0], "data-who": p[1] });
      var a = el("img", { src: ART + c.faces.neutral + ".webp", alt: "", class: "on" }), b = el("img", { src: ART + c.faces.neutral + ".webp", alt: "" });
      wrap.appendChild(a); wrap.appendChild(b); stage.appendChild(wrap);
      slots[p[1]] = { wrap: wrap, imgs: [a, b], face: "neutral" };
      Object.keys(c.faces).forEach(function (f) { var pre = new Image(); pre.src = ART + c.faces[f] + ".webp"; }); // preload every face
    });
    var plate = el("div", { class: "vn-name", lang: "ja" });
    var text = el("div", { class: "vn-text", lang: "ja", "aria-live": "polite" });
    var en = el("div", { class: "vn-en", hidden: true });
    var tools = el("div", { class: "vn-tools" }, [
      el("button", { class: "btn mini", type: "button", onclick: function (e) { e.stopPropagation(); speak(); } }, ["▶ Voice"]),
      el("button", { class: "btn mini", type: "button", onclick: function (e) { e.stopPropagation(); en.hidden = !en.hidden; } }, ["English"]),
      el("button", { class: "btn mini", type: "button", onclick: function (e) { e.stopPropagation(); if (opts.onMine && i >= 0) { opts.onMine(script.lines[i]); e.currentTarget.textContent = "✓ Mined"; } } }, ["Mine this line"]),
      el("button", { class: "btn mini", type: "button", onclick: function (e) { e.stopPropagation(); backlog.hidden = !backlog.hidden; drawLog(); } }, ["Backlog"])
    ]);
    var box = el("div", { class: "vn-box", tabindex: "0", role: "button", "aria-label": "Next line (click, Enter or Space)" }, [plate, text, en, tools, el("span", { class: "vn-more", "aria-hidden": "true", text: "▼" })]);
    var backlog = el("div", { class: "vn-log", hidden: true, role: "dialog", "aria-label": "Backlog" });
    stage.appendChild(box); stage.appendChild(backlog);

    function face(who, f) {
      var s = slots[who]; if (!s || !f || s.face === f) return;
      var c = JA.cast[who], next = s.imgs[0].classList.contains("on") ? 1 : 0;
      s.imgs[next].src = ART + (c.faces[f] || c.faces.neutral) + ".webp";
      var swap = function () { s.imgs[next].classList.add("on"); s.imgs[1 - next].classList.remove("on"); };
      if (s.imgs[next].complete) swap(); else s.imgs[next].onload = swap;
      s.face = f;
    }
    function speak() {
      var ln = script.lines[i]; if (!ln || !window.speechSynthesis) return;
      var c = JA.cast[ln.who] || {};
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(X.plain(ln.ja)); u.lang = "ja-JP"; u.pitch = c.pitch || 1; u.rate = c.rate || 0.95;
      var v = speechSynthesis.getVoices().filter(function (x) { return /^ja/i.test(x.lang); })[0]; if (v) u.voice = v;
      speechSynthesis.speak(u);
    }
    function show(k) {
      i = k; var ln = script.lines[i];
      Object.keys(slots).forEach(function (w) { slots[w].wrap.classList.toggle("dim", w !== ln.who); });
      face(ln.who, ln.face);
      if (ln.other) Object.keys(ln.other).forEach(function (w) { face(w, ln.other[w]); });
      plate.textContent = (JA.cast[ln.who] || {}).name || ln.who;
      en.textContent = ln.en || ""; en.hidden = true;
      var node = opts.ruby ? opts.ruby(ln.ja) : document.createTextNode(X.plain(ln.ja));
      text.innerHTML = ""; text.appendChild(node);
      log.push(ln);
      tools.querySelector(".btn:nth-child(3)").textContent = "Mine this line";
      // typewriter: reveal the characters in order (whole at once with reduced motion)
      if (!reduce) {
        var chars = []; (function walk(n) { n.childNodes.forEach(function (c) { if (c.nodeType === 3) { chars.push(c); } else if (c.tagName !== "RT") walk(c); }); })(text);
        var full = chars.map(function (c) { return c.textContent; }), shown = 0, total = full.join("").length;
        chars.forEach(function (c) { c.textContent = ""; });
        clearInterval(typing);
        typing = setInterval(function () {
          shown++; var left = shown;
          chars.forEach(function (c, k) { var take = Math.max(0, Math.min(full[k].length, left)); c.textContent = full[k].slice(0, take); left -= full[k].length; });
          if (shown >= total) { clearInterval(typing); typing = null; }
        }, 45);
        text._finish = function () { clearInterval(typing); typing = null; chars.forEach(function (c, k) { c.textContent = full[k]; }); };
      }
      speak();
      if (opts.onLine) opts.onLine(i);
    }
    function next() {
      if (typing && text._finish) { text._finish(); return; }
      if (i + 1 < script.lines.length) show(i + 1);
      else { box.classList.add("ended"); if (opts.onEnd) opts.onEnd(); }
    }
    function drawLog() {
      backlog.innerHTML = "";
      backlog.appendChild(el("h3", { text: "Backlog" }));
      log.forEach(function (ln) { backlog.appendChild(el("p", { lang: "ja" }, [el("b", { text: ((JA.cast[ln.who] || {}).name || ln.who) + "  " }), opts.ruby ? opts.ruby(ln.ja) : X.plain(ln.ja)])); });
      backlog.appendChild(el("button", { class: "btn mini", type: "button", onclick: function () { backlog.hidden = true; box.focus(); } }, ["Close"]));
    }
    box.addEventListener("click", next);
    box.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); next(); } });
    stage._start = function () { show(0); };
    stage._next = next;
    stage._face = face;
    setTimeout(function () { if (i < 0) show(0); }, 300);
    return stage;
  };

  // the slice's scene: the reader passage, acted out (lesson 1.1)
  JA.cafeScene = {
    title: "In the café", bg: "ja.bg.cafe", left: "yota", right: "akari",
    lines: [
      { who: "yota", face: "thinking", ja: "これはなんですか。", en: "What is this?" },
      { who: "akari", face: "happy", ja: "それはケーキです。", en: "That is cake." },
      { who: "yota", face: "happy", ja: "あれもケーキですか。", en: "Is that over there cake too?" },
      { who: "akari", face: "troubled", ja: "いいえ、あれはねこです。", en: "No, that over there is a cat." },
      { who: "yota", face: "surprised", ja: "ねこ！？", en: "A cat!?", other: { akari: "happy" } }
    ]
  };
})();
