/* The voice bake-off, listened to blind (voice/bake.mjs makes the audio). Each line plays as A, B, C
   in a shuffled order per line; you pick the best take and flag a wrong reading/accent or a voice
   that does not fit the character; Reveal shows which provider was which. Your picks stay in this
   browser; Download hands them over. Throwaway slice code. */
(function () {
  "use strict";
  var app = document.getElementById("app"), live = document.getElementById("live"), KEY = "ja-voice-bakeoff-v1";
  var NAMES = { voicevox: "VOICEVOX", elevenlabs: "ElevenLabs", gemini: "Gemini TTS" };
  var WHO = { akari: "灯 Akari", yota: "陽太 Yōta" };
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k]; if (v == null || v === false) return;
      if (k === "text") n.textContent = v; else if (k === "class") n.className = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? "" : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function announce(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }
  var st = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  st.best = st.best || {}; st.flags = st.flags || {}; st.fit = st.fit || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffle(a, seed) { a = a.slice(); var h = hash(seed); for (var i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; var j = h % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  var audio = new Audio(), playing = null;
  function play(src, btn) {
    if (playing) playing.removeAttribute("data-on");
    audio.pause(); audio.src = src + "?v=" + Date.now(); audio.play(); playing = btn; btn.setAttribute("data-on", "1");
    audio.onended = function () { btn.removeAttribute("data-on"); };
  }
  function browserVoice(text) {
    if (!window.speechSynthesis) return; speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "ja-JP"; u.rate = 0.92;
    var v = speechSynthesis.getVoices().filter(function (x) { return /^ja/i.test(x.lang); })[0]; if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  function render(lines, man) {
    var provs = Object.keys(NAMES).filter(function (p) { return man.providers[p] && Object.keys(man.providers[p].lines).some(function (id) { return !man.providers[p].lines[id].error; }); });
    app.innerHTML = "";
    app.appendChild(el("header", { class: "ph" }, [el("div", {}, [
      el("h1", {}, [el("span", { class: "seal", lang: "ja", "aria-hidden": "true", text: "声" }), "Voice bake-off"]),
      el("div", { class: "sub", text: "Each line plays as A, B and C — a different order every line, so you can't tell which provider is which. Use headphones. Pick the best take, flag what's wrong, then Reveal." })
    ])]));
    if (!provs.length) {
      app.appendChild(el("section", { class: "card vb-empty" }, [el("h2", { text: "Nothing baked yet" }),
        el("p", { text: "Run the bake script first (see the setup in the chat): node prototypes/japanese-space/voice/bake.mjs" })]));
      return;
    }
    var missing = Object.keys(NAMES).filter(function (p) { return provs.indexOf(p) < 0; });
    if (missing.length) app.appendChild(el("p", { class: "muted small", text: "Not baked yet: " + missing.map(function (p) { return NAMES[p]; }).join(", ") + ". The comparison works with what is there." }));

    var groups = {};
    lines.forEach(function (ln) { (groups[ln.group] = groups[ln.group] || []).push(ln); });
    var list = el("div", { class: "vb-list" });
    Object.keys(groups).forEach(function (g) {
      list.appendChild(el("h2", { class: "vb-group", text: g }));
      groups[g].forEach(function (ln) {
        var order = shuffle(provs, ln.id), letters = "ABCD";
        var takes = order.map(function (p, i) {
          var r = man.providers[p].lines[ln.id] || {}, letter = letters[i], fk = ln.id + "|" + p, f = st.flags[fk] || {};
          if (r.error || !r.file) return el("div", { class: "vb-take" }, [el("b", { text: letter }), el("span", { class: "muted small", text: "failed to bake" })]);
          var btn = el("button", { class: "btn vb-play", type: "button", "aria-label": "Play take " + letter, onclick: function (e) { play("voice/out/" + r.file, e.currentTarget); } }, ["▶ " + letter]);
          function flag(kind, label) {
            return el("label", { class: "chip vb-flag" }, [el("input", { type: "checkbox", checked: f[kind] ? true : null, onchange: function (e) { f[kind] = e.currentTarget.checked; st.flags[fk] = f; save(); } }), label]);
          }
          return el("div", { class: "vb-take", "data-best": st.best[ln.id] === p ? "1" : null }, [
            btn,
            el("button", { class: "btn mini", type: "button", "aria-pressed": String(st.best[ln.id] === p), onclick: function () { st.best[ln.id] = p; save(); render(lines, man); announce("Take " + letter + " marked best"); } }, ["Best"]),
            flag("reading", "Wrong reading/accent"), flag("fit", "Doesn't fit " + WHO[ln.who].split(" ")[1]),
            st.reveal ? el("span", { class: "vb-who", text: NAMES[p] + (r.accent ? " · pitch " + r.accent : "") }) : null
          ]);
        });
        list.appendChild(el("article", { class: "card vb-line" }, [
          el("div", { class: "vb-head" }, [
            el("span", { class: "chip", text: WHO[ln.who] }),
            el("b", { class: "vb-ja", lang: "ja", text: ln.ja }),
            el("span", { class: "muted small", text: ln.en + " · " + ln.mood }),
            el("button", { class: "btn mini", type: "button", onclick: function () { browserVoice(ln.ja); } }, ["▶ Current voice"])
          ]),
          el("div", { class: "vb-takes" }, takes)
        ]));
      });
    });

    // overall: how each provider fits each character, and the tally
    var tally = {}; provs.forEach(function (p) { tally[p] = { best: 0, reading: 0, fit: 0 }; });
    lines.forEach(function (ln) { var b = st.best[ln.id]; if (tally[b]) tally[b].best++; provs.forEach(function (p) { var f = st.flags[ln.id + "|" + p] || {}; if (f.reading) tally[p].reading++; if (f.fit) tally[p].fit++; }); });
    var side = el("aside", { class: "card vb-side" }, [
      el("h2", { text: "Overall" }),
      el("p", { class: "muted small", text: st.reveal ? "Rate each provider as each character: 1 = wrong for them, 5 = that's them." : "Pick and flag every line first, then Reveal to see which provider was which and rate each one as each character." }),
      el("table", { class: "vb-table" }, [
        el("thead", {}, [el("tr", {}, [el("th", { text: st.reveal ? "" : "Provider" })].concat(["Best picks", "Bad reading", "Bad fit"].map(function (h) { return el("th", { text: h }); })))]),
        el("tbody", {}, provs.map(function (p) { return el("tr", {}, [el("th", { text: st.reveal ? NAMES[p] : "(hidden)" }), el("td", { text: String(tally[p].best) }), el("td", { text: String(tally[p].reading) }), el("td", { text: String(tally[p].fit) })]); }))
      ]),
      st.reveal ? el("div", { class: "vb-fit" }, provs.map(function (p) {
        return el("div", {}, [el("b", { text: NAMES[p] })].concat(["akari", "yota"].map(function (w) {
          var k = p + "|" + w;
          return el("label", { class: "row" }, [el("span", { text: WHO[w] }), el("select", { "aria-label": NAMES[p] + " as " + WHO[w], onchange: function (e) { st.fit[k] = +e.currentTarget.value || null; save(); } },
            [""].concat([1, 2, 3, 4, 5]).map(function (v) { return el("option", { value: v, text: v === "" ? "—" : String(v), selected: st.fit[k] === v ? true : null }); }))]);
        })));
      })) : null,
      el("div", { class: "row wrap" }, [
        el("button", { class: "btn" + (st.reveal ? "" : " primary"), type: "button", onclick: function () { st.reveal = !st.reveal; save(); render(lines, man); } }, [st.reveal ? "Hide providers" : "Reveal providers"]),
        el("button", { class: "btn", type: "button", onclick: function () { download(lines, man); } }, ["Download picks"]),
        el("button", { class: "btn", type: "button", onclick: function () { if (confirm("Clear every pick?")) { st = { best: {}, flags: {}, fit: {} }; save(); render(lines, man); } } }, ["Clear"])
      ])
    ]);
    app.appendChild(el("div", { class: "vb-layout" }, [list, side]));
  }
  function download(lines, man) {
    var out = { kind: "kurenai-ja-voice-bakeoff", when: new Date().toISOString(), picks: st, voices: Object.keys(man.providers).reduce(function (o, p) { var l = man.providers[p].lines, k = Object.keys(l).find(function (id) { return l[id].voice; }); o[p] = k ? l[k].voice : null; return o; }, {}) };
    var a = el("a", { href: URL.createObjectURL(new Blob([JSON.stringify(out, null, 1)], { type: "application/json" })), download: "ja-voice-bakeoff-" + new Date().toISOString().slice(0, 10) + ".json" });
    document.body.appendChild(a); a.click(); a.remove(); announce("Picks downloaded");
  }

  Promise.all([
    fetch("voice/lines.json", { cache: "no-store" }).then(function (r) { return r.json(); }),
    fetch("voice/out/manifest.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : { providers: {} }; }, function () { return { providers: {} }; })
  ]).then(function (r) { render(r[0].lines, r[1]); });
})();
