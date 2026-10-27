/* Kurenai OS — core/jaui.js (KOS.jaUI)
   Japanese's shared components (design 28·kit), built once and used by every page:
     furi(markup, o)        furigana text: "{駅|えき}へ行きます" → ruby by Reading mastery (28·type)
     skill(s, o)            the R · L · W · S chip
     say(text, o)           a line spoken: its pre-rendered file when there is one, else the browser's
                            Japanese voice, marked "synthetic voice"
     line(o)                the audio player row: speaker, text, ▶ Hear and ▶ Slow (28·kit)
     verdict(res, o)        the exercise verdict card: Correct · Accepted · Near · Wrong · Understood ·
                            Not understood · Say it again · Self-marked — an icon AND a word, never
                            the subject hue (pass and fail keep green and alarm red)
     stagePath(o)           the stage path with emblem kanji always beside the English name
     mediaPath(tl, o)       the stepping stones (飛び石); every date a range
     radar(o)               the skill radar; calibrating draws axes only
     meter(o)               a requirement meter, value / target
     seal(o)                the hanko seal (合) on a passed checkpoint
     pad(o)                 the genkō-yōshi writing square in KanjiVG's 109 × 109 space
   Pure presentation: reads through KOS.ja and writes nothing.                                  */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var NS = "http://www.w3.org/2000/svg";
  var CAST = {
    akari: { name: "Akari", full: "白石 灯", initial: "灯", pitch: 1.12, rate: 0.95 },
    yota: { name: "Yōta", full: "朝日 陽太", initial: "陽", pitch: 0.85, rate: 1 },
    makoto: { name: "Makoto", full: "小林 誠", initial: "誠", pitch: 0.7, rate: 0.92 },
    narrator: { name: "Narrator", full: "", initial: "N", pitch: 1, rate: 0.95 }
  };
  function reduced() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function svg(tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }

  /* ---------------- furigana ---------------- */
  /* plain(markup) → the text without readings */
  function plain(t) { return String(t || "").replace(/\{([^|}]+)\|[^}]+\}/g, "$1"); }
  /* furi(markup, { mode, known(word) }) → <span lang="ja"> with <ruby> where the mode wants one.
     mode: "all" | "unknown" (only words whose Reading facet is not stable) | "none" */
  function furi(t, o) {
    o = o || {};
    var mode = o.mode || (KOS.ja ? KOS.ja.peek().settings.furigana : "unknown");
    var out = el("span", { class: "k-ja-text" + (o.vertical ? " k-ja-text--v" : ""), lang: "ja", "data-ui": "ja.furigana" });
    String(t || "").split(/(\{[^}]+\})/).forEach(function (part) {
      var m = /^\{([^|}]+)\|([^}]+)\}$/.exec(part);
      if (!m) { if (part) out.appendChild(document.createTextNode(part)); return; }
      var known = o.known || (KOS.ja && KOS.ja.knows);
      var show = mode === "all" || (mode === "unknown" && !(known && known(m[1])));
      out.appendChild(show ? el("ruby", {}, [m[1], el("rt", { text: m[2] })]) : document.createTextNode(m[1]));
    });
    return out;
  }

  /* ---------------- the skill chip ---------------- */
  var SKILL = { R: "Reading", L: "Listening", W: "Writing", S: "Speaking", H: "Handwriting" };
  function skill(s, o) {
    o = o || {};
    return el("span", { class: "k-ja-skill", "data-skill": s, "data-ui": "ja.skill", title: SKILL[s] || s }, [
      el("b", { "aria-hidden": "true", text: s }),
      o.label === false ? el("span", { class: "sr-only", text: SKILL[s] || s }) : el("span", { text: SKILL[s] || s })
    ]);
  }

  /* ---------------- voices ---------------- */
  /* KOS_JA_AUDIO (generated with the audio packs) maps a line's text to its file per speaker;
     until a pack is on the device the browser's Japanese voice speaks it, said to be synthetic */
  var audio = null, playing = null;
  function voiceFile(text, who) {
    var A = window.KOS_JA_AUDIO;
    var k = (who || "narrator") + "|" + plain(text).replace(/\n/g, "");
    return A && A[k] ? "assets/ja/audio/" + A[k] : null;
  }
  function jaVoice() {
    if (!window.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^ja/i.test(v.lang); });
    return vs.filter(function (v) { return /Kyoko|O-ren|Google/i.test(v.name); })[0] || vs[0] || null;
  }
  function stop() {
    if (audio) { try { audio.pause(); } catch (e) { /* already stopped */ } }
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (playing) { KOS.ui.state(playing, "playing", false); playing = null; }
  }
  /* say(text, { who, slow, node }) → { synthetic, ok } */
  function say(text, o) {
    o = o || {};
    stop();
    var who = CAST[o.who] ? o.who : "narrator", file = voiceFile(text, who);
    if (o.node) { playing = o.node; KOS.ui.state(o.node, "playing", true); }
    function done() { if (o.node && playing === o.node) { KOS.ui.state(o.node, "playing", false); playing = null; } if (o.onEnd) o.onEnd(); }
    if (file) {
      audio = new Audio(file);
      audio.playbackRate = o.slow ? 0.75 : 1;
      audio.onended = done; audio.onerror = done;
      audio.play().catch(done);
      return { synthetic: false, ok: true };
    }
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") { done(); return { synthetic: true, ok: false }; }
    var u = new SpeechSynthesisUtterance(plain(text));
    u.lang = "ja-JP"; u.pitch = CAST[who].pitch; u.rate = CAST[who].rate * (o.slow ? 0.72 : 1);
    var v = jaVoice(); if (v) u.voice = v;
    u.onend = done; u.onerror = done;
    speechSynthesis.speak(u);
    return { synthetic: true, ok: true };
  }
  function synthetic(text, who) { return !voiceFile(text, who); }

  /* line({ who, ja, en, speaker: false }) — the audio player row (28·kit) */
  function line(o) {
    var who = CAST[o.who] ? o.who : "narrator", c = CAST[who];
    var row = el("div", { class: "k-ja-line", "data-ui": "ja.line", "data-who": who });
    var hear = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.hear", text: "▶ Hear",
      "aria-label": "Hear " + (o.speaker === false ? "" : c.name + ": ") + plain(o.ja),
      onclick: function () { say(o.ja, { who: who, node: row }); announce((o.speaker === false ? "" : c.name + ": ") + plain(o.ja)); } });
    var slow = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "ja.slow", text: "▶ Slow",
      "aria-label": "Hear it slowly", onclick: function () { say(o.ja, { who: who, slow: true, node: row }); } });
    if (o.speaker !== false) row.appendChild(el("span", { class: "k-ja-who", "data-who": who }, [
      el("span", { class: "k-ja-who-i", lang: "ja", "aria-hidden": "true", text: c.initial }),
      el("span", { class: "k-ja-who-t" }, [el("b", { text: c.name }), c.full ? el("small", { lang: "ja", text: c.full }) : null].filter(Boolean))
    ]));
    /* enHidden: a reading line keeps its English behind a press (the graded passage, §6) */
    var enNode = o.en ? el("small", { class: "k-ja-line-en", text: o.en, hidden: o.enHidden ? true : null }) : null;
    var enBtn = o.en && o.enHidden ? el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "ja.line-english", "aria-pressed": "false", text: "EN",
      "aria-label": "Show the English", onclick: function (e) { enNode.hidden = !enNode.hidden; e.currentTarget.setAttribute("aria-pressed", String(!enNode.hidden)); } }) : null;
    row.appendChild(el("span", { class: "k-ja-line-t" }, [furi(o.ja, { known: o.known }), enNode].filter(Boolean)));
    row.appendChild(el("span", { class: "k-ja-line-btns" }, [hear, slow, enBtn,
      synthetic(o.ja, who) ? el("small", { class: "k-ja-synth", "data-ui": "ja.synthetic", text: "synthetic voice" }) : null].filter(Boolean)));
    return row;
  }

  /* ---------------- the verdict card ---------------- */
  var VERDICT = {
    correct: { mark: "✓", word: "Correct", tone: "pass" },
    accepted: { mark: "✓", word: "Accepted", tone: "pass" },
    near: { mark: "≈", word: "Near", tone: "near" },
    wrong: { mark: "✗", word: "Wrong", tone: "fail" },
    understood: { mark: "✓", word: "Understood", tone: "pass" },
    notUnderstood: { mark: "↻", word: "Not understood — try again", tone: "near" },
    sayAgain: { mark: "↻", word: "Say it again", tone: "near" },
    selfMarked: { mark: "◐", word: "Self-marked", tone: "self" }
  };
  /* verdict({ verdict, answer, note, diagnosis }, { grade, next }) */
  function verdict(res, o) {
    o = o || {};
    var v = VERDICT[res.verdict] || VERDICT.wrong;
    var why = res.diagnosis && res.diagnosis.explain || res.note || o.note || "";
    return el("div", { class: "k-ja-verdict", "data-ui": "ja.verdict", "data-tone": v.tone, "data-state": res.verdict }, [
      el("div", { class: "k-ja-verdict-h" }, [
        el("span", { class: "k-ja-verdict-m", "aria-hidden": "true", text: v.mark }),
        el("b", { text: v.word }),
        res.answer ? el("span", { class: "k-ja-verdict-a", lang: "ja" }, [furi(res.answer, { mode: "all" })]) : null
      ].filter(Boolean)),
      why ? el("p", { class: "k-ja-verdict-why", text: why }) : null,
      o.grade ? el("p", { class: "k-ja-verdict-g", "data-ui": "ja.grade" }, [el("span", { class: "k-muted", text: "Grade, from your answer · " }), el("b", { text: o.grade }), o.next ? " · next " + o.next : ""]) : null
    ].filter(Boolean));
  }
  /* the words a verdict announces (one polite region per runner) */
  function verdictWords(res) {
    var v = VERDICT[res.verdict] || VERDICT.wrong;
    var why = res.diagnosis && res.diagnosis.explain || res.note || "";
    return v.word + "." + (why ? " " + why : "") + (res.verdict === "near" ? " One retry." : "");
  }

  /* ---------------- the stage path (28·kit) ---------------- */
  /* o: { onUnit(id), onCheckpoint(id) } — Code's spread path (26a): one grid column per stop,
     so the stops share the width evenly and every row lines up; each stage spans its stops under
     one heading (emblem kanji, name), a line joins each stop to the next. Unit squares are
     done · current · later; the checkpoint after each unit shows 合 when passed; a stage still to
     come holds one dashed stop. */
  function stagePath(o) {
    o = o || {};
    var J = window.KOS_JA, stages = J ? J.STAGES : [];
    var row = el("div", { class: "k-ja-path", "data-ui": "ja.stage-path", role: "group", "aria-label": "Core path", tabindex: "0" });
    function stops(st) { return st.units.length ? st.units.reduce(function (n, u) { return n + (u.checkpoint ? 2 : 1); }, 0) : 2; }
    var n = stages.reduce(function (a, st) { return a + stops(st); }, 0), at = 0;
    row.style.setProperty("--n", n);
    function node(x) { at++; return el("span", { class: "k-ja-node", "data-state": at === n ? "last" : null }, [x]); }
    stages.forEach(function (st) {
      var g = el("div", { class: "k-ja-stage", "data-ui": "ja.stage", "data-state": st.units.length ? null : "later", style: "--span: " + stops(st) });
      g.appendChild(el("div", { class: "k-ja-stage-h", title: st.name + (st.units.length ? "" : " · coming later") }, [
        el("span", { class: "k-ja-emblem", lang: "ja", "aria-hidden": "true", text: st.kanji }),
        el("b", { text: st.name })
      ]));
      var marks = el("div", { class: "k-ja-stage-m" });
      st.units.forEach(function (u) {
        var us = KOS.ja.unitState(u.id);
        marks.appendChild(node(el("button", { type: "button", class: "k-ja-sq", "data-ui": "ja.path-unit", "data-state": us.state, tabindex: "-1",
          "aria-label": u.name + ": " + (us.state === "later" ? "recommended later" : us.done + " of " + us.total + " done"),
          text: us.state === "done" ? "✓" : u.id, onclick: function () { if (o.onUnit) o.onUnit(u.id); } })));
        if (u.checkpoint) {
          var cs = KOS.ja.checkpointState(u.checkpoint);
          marks.appendChild(node(el("button", { type: "button", class: "k-ja-cp", "data-ui": "ja.path-checkpoint", "data-state": cs, tabindex: "-1",
            "aria-label": u.name + " checkpoint: " + (cs === "passed" ? "passed" : cs === "next" ? "next" : "recommended later"),
            text: cs === "passed" ? "合" : "", lang: "ja", onclick: function () { if (o.onCheckpoint) o.onCheckpoint(u.checkpoint); } })));
        }
      });
      if (!st.units.length) marks.appendChild(node(el("span", { class: "k-ja-sq", "data-state": "future", role: "img", "aria-label": st.name + ": coming later" })));
      g.appendChild(marks);
      row.appendChild(g);
    });
    row.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var sq = [].slice.call(row.querySelectorAll("button"));
      var i = sq.indexOf(document.activeElement);
      var j = i < 0 ? 0 : Math.max(0, Math.min(sq.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
      if (sq[j]) { e.preventDefault(); sq[j].focus(); }
    });
    return row;
  }

  /* ---------------- the media path (28·kit) ---------------- */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function monthYear(iso) { var d = new Date(iso + "T12:00:00"); return MON[d.getMonth()] + " " + d.getFullYear(); }
  /* range(from, to) → "Feb – Apr 2027" (one year), "Nov 2027 – Mar 2028" or "2029" */
  function range(from, to) {
    if (!from || !to) return "Calibrating";
    var a = new Date(from + "T12:00:00"), b = new Date(to + "T12:00:00");
    if (a.getFullYear() === b.getFullYear()) return a.getMonth() === b.getMonth() ? monthYear(from) : MON[a.getMonth()] + " – " + MON[b.getMonth()] + " " + b.getFullYear();
    if (b.getFullYear() - a.getFullYear() > 1) return a.getFullYear() + " – " + b.getFullYear();
    return monthYear(from) + " – " + monthYear(to);
  }
  function stoneWhen(m, tl) {
    if (m.done) return "Done";
    if (tl.calibrating) return "Calibrating";
    if (m.unit === "kana") return Math.round(100 * m.have / m.need) + "% there";
    return range(m.from, m.to);
  }
  /* mediaPath(timeline, { large, selected, onSelect(id) }) */
  function mediaPath(tl, o) {
    o = o || {};
    var next = tl.milestones.filter(function (m) { return !m.done; })[0];
    var row = el("div", { class: "k-ja-stones", "data-ui": "ja.media-path", role: o.onSelect ? "radiogroup" : "list", "aria-label": "Media path" });
    if (o.large) KOS.ui.state(row, "large", true);
    tl.milestones.forEach(function (m) {
      var state = m.done ? "done" : m === next ? "next" : "later";
      var pct = Math.min(100, Math.round(100 * m.have / Math.max(1, m.need)));
      var label = m.title + ". " + (m.done ? "Done." : pct + "% there. " + (tl.calibrating ? "Calibrating." : "Projected " + stoneWhen(m, tl) + "."));
      var stone = el(o.onSelect ? "button" : "div", { class: "k-ja-stone", "data-ui": "ja.stone", "data-state": state, "data-id": m.id,
        role: o.onSelect ? "radio" : "listitem", type: o.onSelect ? "button" : null,
        "aria-checked": o.onSelect ? String(o.selected === m.id) : null, tabindex: o.onSelect ? (o.selected === m.id ? "0" : "-1") : null,
        "aria-label": label, onclick: o.onSelect ? function () { o.onSelect(m.id); } : null }, [
        el("span", { class: "k-ja-stone-dot", "aria-hidden": "true", text: m.done ? "✓" : state === "next" ? pct + "%" : "" }),
        el("span", { class: "k-ja-stone-t", text: m.title }),
        el("small", { class: "k-mono", text: stoneWhen(m, tl) })
      ]);
      row.appendChild(stone);
    });
    if (o.onSelect) row.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var b = [].slice.call(row.querySelectorAll("[role=radio]")), i = b.indexOf(document.activeElement);
      var j = Math.max(0, Math.min(b.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
      if (b[j]) { e.preventDefault(); b[j].focus(); o.onSelect(b[j].getAttribute("data-id")); }
    });
    /* a declared scroller (invariant 50): the stones are as wide as their
       longest word, so a phone scrolls them; a pick redraws the page and
       keeps the strip where it was, first showing the chosen stone */
    if (KOS.ui && KOS.ui.scroller) return KOS.ui.scroller(row, { keepRole: !!o.onSelect, label: "Media path", keep: "ja-path",
      reveal: function (n) { var s = n.querySelector("[aria-checked=true]") || n.querySelector("[data-state=next]"); return s ? s.offsetLeft - n.clientWidth / 2 + s.offsetWidth / 2 : null; } });
    return row;
  }

  /* ---------------- the radar (28·kit) ---------------- */
  /* radar({ values: {R, L, S, W} 0–100, previous?, calibrating }) — labels carry the numbers, so the
     shape is never the only signal */
  function radar(o) {
    var axes = ["R", "L", "S", "W"], ang = { R: -90, L: 0, S: 90, W: 180 };
    var box = svg("svg", { viewBox: "-60 -60 120 120", class: "k-ja-radar", role: "img",
      "aria-label": o.calibrating ? "Skills calibrating" : axes.map(function (a) { return SKILL[a] + " " + Math.round(o.values[a] || 0); }).join(", ") });
    [1, 0.66, 0.33].forEach(function (r) {
      box.appendChild(svg("polygon", { class: "k-ja-radar-ring", points: axes.map(function (a) { var t = ang[a] * Math.PI / 180; return (Math.cos(t) * 44 * r).toFixed(1) + "," + (Math.sin(t) * 44 * r).toFixed(1); }).join(" ") }));
    });
    axes.forEach(function (a) { var t = ang[a] * Math.PI / 180; box.appendChild(svg("line", { class: "k-ja-radar-axis", x1: 0, y1: 0, x2: (Math.cos(t) * 44).toFixed(1), y2: (Math.sin(t) * 44).toFixed(1) })); });
    function poly(vals, cls) {
      return svg("polygon", { class: cls, points: axes.map(function (a) { var t = ang[a] * Math.PI / 180, r = 44 * Math.max(0.04, (vals[a] || 0) / 100); return (Math.cos(t) * r).toFixed(1) + "," + (Math.sin(t) * r).toFixed(1); }).join(" ") });
    }
    if (!o.calibrating) {
      if (o.previous) box.appendChild(poly(o.previous, "k-ja-radar-prev"));
      box.appendChild(poly(o.values, "k-ja-radar-now"));
    }
    axes.forEach(function (a) {
      var t = ang[a] * Math.PI / 180, tx = svg("text", { class: "k-ja-radar-l", x: (Math.cos(t) * 53).toFixed(1), y: (Math.sin(t) * 53 + 3).toFixed(1), "text-anchor": a === "L" ? "start" : a === "W" ? "end" : "middle" });
      tx.textContent = a + (o.calibrating ? "" : " " + Math.round(o.values[a] || 0));
      box.appendChild(tx);
    });
    return box;
  }

  /* ---------------- the requirement meter ---------------- */
  function meter(o) {
    var pct = Math.max(0, Math.min(100, Math.round(100 * (o.value || 0) / Math.max(1, o.target))));
    return el("div", { class: "k-ja-meter", "data-ui": "ja.meter" }, [
      el("div", { class: "k-ja-meter-top" }, [el("span", { text: o.label }), el("span", { class: "k-mono", text: KOS.ui.num(o.value || 0) + " / " + KOS.ui.num(o.target) + (o.unit || "") })]),
      el("span", { class: "k-bar", role: "img", "aria-label": o.label + ": " + (o.value || 0) + " of " + o.target, style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")])
    ]);
  }

  /* ---------------- the hanko seal ---------------- */
  function seal(o) {
    o = o || {};
    return el("span", { class: "k-ja-seal", "data-ui": "ja.seal", lang: "ja", role: "img", "aria-label": o.label || "Passed", "data-size": o.small ? "sm" : null, text: "合" });
  }

  /* ---------------- the genkō square ---------------- */
  /* pad({ ch, size: "lg"|"md"|"sm", model, onChange(n) }) → { node, strokes(), setStrokes(),
     clear(), undo(), mark(result), animate(onEnd), lock() } — pointer or stylus; the model glyph
     sits beside it in Klee One (the caller places it) */
  function pad(o) {
    o = o || {};
    var paths = (window.KOS && KOS.jaStrokes && KOS.jaStrokes[o.ch]) || [];
    var box = svg("svg", { viewBox: "0 0 109 109", class: "k-ja-pad", "data-ui": "ja.pad", "data-size": o.size || "lg", role: "img",
      "aria-label": o.label || "Writing square for " + o.ch });
    box.appendChild(svg("rect", { x: 1, y: 1, width: 107, height: 107, rx: 3, class: "k-ja-pad-frame" }));
    box.appendChild(svg("path", { d: "M54.5 4V105M4 54.5H105", class: "k-ja-pad-guide" }));
    var ref = svg("g", { class: "k-ja-pad-ref" }); paths.forEach(function (d) { ref.appendChild(svg("path", { d: d })); }); box.appendChild(ref);
    var anim = svg("g", { class: "k-ja-pad-anim" }); box.appendChild(anim);
    var ink = svg("g", { class: "k-ja-pad-ink" }); box.appendChild(ink);
    var marks = svg("g", { class: "k-ja-pad-marks" }); box.appendChild(marks);
    var strokes = [], cur = null, curEl = null, locked = false;
    function pt(e) {
      var m = box.getScreenCTM && box.getScreenCTM();
      if (!m) return [0, 0];
      var p = box.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      var q = p.matrixTransform(m.inverse()); return [Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10];
    }
    function d(points) { return points.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(""); }
    /* a pen's first touch must not wait while iPadOS checks for Scribble
       handwriting (roadmap 6.7, as the ink engine does) */
    box.addEventListener("touchstart", function (e) {
      if ([].some.call(e.changedTouches || [], function (t) { return t.touchType === "stylus"; })) e.preventDefault();
    }, { passive: false });
    box.addEventListener("pointerdown", function (e) {
      if (locked || (e.pointerType === "touch" && e.width > 40)) return; // a palm is ignored
      e.preventDefault(); if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
      cur = [pt(e)]; curEl = svg("path", { d: d(cur) }); ink.appendChild(curEl);
    });
    box.addEventListener("pointermove", function (e) { if (!cur) return; var p = pt(e), l = cur[cur.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 0.8) { cur.push(p); curEl.setAttribute("d", d(cur)); } });
    function up() { if (!cur) return; if (cur.length > 1) strokes.push(cur); else ink.removeChild(curEl); cur = null; curEl = null; if (o.onChange) o.onChange(strokes.length); }
    box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);
    function redraw() { ink.innerHTML = ""; strokes.forEach(function (st) { ink.appendChild(svg("path", { d: d(st) })); }); }
    return {
      node: box,
      strokes: function () { return strokes.slice(); },
      setStrokes: function (list) { strokes = list.map(function (x) { return x.slice(); }); redraw(); },
      clear: function () { strokes = []; marks.innerHTML = ""; anim.innerHTML = ""; locked = false; KOS.ui.state(box, "marked", false); redraw(); if (o.onChange) o.onChange(0); },
      undo: function () { strokes.pop(); redraw(); if (o.onChange) o.onChange(strokes.length); },
      lock: function () { locked = true; },
      /* after a check: each stroke marked by its result (amber where it needs attention), and the
         model's numbered starts */
      mark: function (res) {
        KOS.ui.state(box, "marked", true);
        [].forEach.call(ink.children, function (p, i) { var ps = res.perStroke && res.perStroke[i]; p.setAttribute("data-state", ps && ps.ok ? "ok" : "attn"); });
        marks.innerHTML = "";
        paths.forEach(function (dd, i) {
          var p0 = KOS.jaStroke.parse(dd)[0];
          marks.appendChild(svg("circle", { cx: p0[0], cy: p0[1], r: 4.2 }));
          var t = svg("text", { x: p0[0], y: p0[1] + 2.4 }); t.textContent = String(i + 1); marks.appendChild(t);
        });
      },
      /* the stroke-order animation; reduced motion draws the finished glyph at once */
      animate: function (onEnd) {
        anim.innerHTML = "";
        var total = 0;
        paths.forEach(function (dd, i) {
          var p = svg("path", { d: dd }); anim.appendChild(p);
          if (reduced() || !p.getTotalLength) return;
          var L = p.getTotalLength();
          p.style.setProperty("--len", L);
          p.style.setProperty("--dur", Math.max(0.35, L / 120) + "s");
          p.style.setProperty("--delay", (i * 0.75) + "s");
          total = Math.max(total, i * 0.75 + Math.max(0.35, L / 120));
        });
        KOS.ui.state(box, "animating", true);
        setTimeout(function () { KOS.ui.state(box, "animating", false); if (onEnd) onEnd(); }, reduced() ? 0 : total * 1000 + 100);
      }
    };
  }

  /* ---------------- the media moment: a VN scene and a manga panel (§12) ---------------- */
  /* Raster art under LIVE text: the art never carries words (§12.1), so every line is real
     Japanese with furigana by mastery, heard in its speaker's voice, its English one press away. */
  var IMG = "assets/ja/img/";
  var FACES = ["neutral", "happy", "surprised", "troubled", "thinking"];
  function faceSrc(who, face) { return IMG + (face && face !== "neutral" ? "ja.face." + who + "." + face : "ja.base." + who + ".a") + ".webp"; }
  /* scene({ title, bg, left, right, lines: [{ who, face, ja, en, other }] }) → node.
     A click, Enter or Space moves on; a reaction cross-fades the face only (the importer keeps the
     body's pixels), so nothing but the face moves. */
  function scene(sc, o) {
    o = o || {};
    var i = -1;
    var stage = el("div", { class: "k-ja-vn", "data-ui": "ja.scene", role: "group", "aria-label": "Scene: " + (sc.title || "") });
    stage.appendChild(el("img", { class: "k-ja-vn-bg", src: IMG + sc.bg + ".webp", alt: sc.alt || "" }));
    var slots = {};
    [["left", sc.left], ["right", sc.right]].forEach(function (p) {
      if (!p[1]) return;
      var a = el("img", { src: faceSrc(p[1]), alt: "", "data-state": "on" }), b = el("img", { src: faceSrc(p[1]), alt: "" });
      var wrap = el("div", { class: "k-ja-vn-chara", "data-side": p[0], "data-who": p[1] }, [a, b]);
      stage.appendChild(wrap);
      slots[p[1]] = { wrap: wrap, imgs: [a, b], face: "neutral" };
      FACES.forEach(function (f) { var pre = new Image(); pre.src = faceSrc(p[1], f); });
    });
    var plate = el("div", { class: "k-ja-vn-name", lang: "ja" });
    var text = el("div", { class: "k-ja-vn-text", "aria-live": "polite" });
    var en = el("div", { class: "k-ja-vn-en", hidden: true });
    var voiceBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.scene-voice", text: "▶ Voice", onclick: function (e) { e.stopPropagation(); speak(); } });
    var enBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.scene-english", "aria-pressed": "false", text: "English",
      onclick: function (e) { e.stopPropagation(); en.hidden = !en.hidden; e.currentTarget.setAttribute("aria-pressed", String(!en.hidden)); } });
    var againBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.scene-again", text: "↺ From the start", onclick: function (e) { e.stopPropagation(); show(0); } });
    var box = el("div", { class: "k-ja-vn-box", tabindex: "0", role: "button", "aria-label": "Next line (click, Enter or Space)" }, [
      plate, text, en, el("div", { class: "k-ja-vn-tools" }, [voiceBtn, enBtn, againBtn]), el("span", { class: "k-ja-vn-more", "aria-hidden": "true", text: "▼" })]);
    stage.appendChild(box);
    function face(who, f) {
      var sl = slots[who]; if (!sl || !f || sl.face === f) return;
      var nx = sl.imgs[0].getAttribute("data-state") === "on" ? 1 : 0;
      sl.imgs[nx].src = faceSrc(who, f);
      var swap = function () { sl.imgs[nx].setAttribute("data-state", "on"); sl.imgs[1 - nx].removeAttribute("data-state"); };
      if (sl.imgs[nx].complete) swap(); else sl.imgs[nx].onload = swap;
      sl.face = f;
    }
    function speak() { var ln = sc.lines[i]; if (ln) say(ln.ja, { who: ln.who, node: voiceBtn }); }
    function show(k) {
      i = k; var ln = sc.lines[i];
      KOS.ui.state(box, "ended", false);
      Object.keys(slots).forEach(function (w) { KOS.ui.state(slots[w].wrap, "dim", w !== ln.who); });
      face(ln.who, ln.face);
      if (ln.other) Object.keys(ln.other).forEach(function (w) { face(w, ln.other[w]); });
      plate.textContent = (CAST[ln.who] || {}).full || (CAST[ln.who] || {}).name || ln.who;
      en.textContent = ln.en || "";
      text.innerHTML = ""; text.appendChild(furi(ln.ja, { known: o.known }));
      speak();
      if (o.onLine) o.onLine(i, ln);
    }
    function next() {
      if (i + 1 < sc.lines.length) show(i + 1);
      else { KOS.ui.state(box, "ended", true); announce("End of the scene."); if (o.onEnd) o.onEnd(); }
    }
    box.addEventListener("click", next);
    box.addEventListener("keydown", function (e) { if (e.target === box && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); } });
    /* the first line shows without speaking: a page that opens never talks on its own */
    (function first() {
      i = 0; var ln = sc.lines[0];
      Object.keys(slots).forEach(function (w) { KOS.ui.state(slots[w].wrap, "dim", w !== ln.who); });
      face(ln.who, ln.face);
      plate.textContent = (CAST[ln.who] || {}).full || ln.who;
      en.textContent = ln.en || "";
      text.appendChild(furi(ln.ja, { known: o.known }));
    })();
    return stage;
  }
  /* panel({ img, w, h, alt, bubbles: [{ who, ja, en, x, y, rx, ry, tail: [x, y], size }], sfx }) →
     node. Positions are % of the panel; "\n" breaks a vertical column; manga reads right to left,
     so the authored order is the reading order. */
  function tailPath(b) {
    var dx = b.tail[0] - b.x, dy = b.tail[1] - b.y, len = Math.hypot(dx, dy) || 1, r = Math.min(b.rx, b.ry);
    var nx = -dy / len, ny = dx / len, w = r * 0.35, bx = b.x + dx / len * r * 0.5, by = b.y + dy / len * r * 0.5;
    return "M" + (bx + nx * w) + " " + (by + ny * w) + " L" + b.tail[0] + " " + b.tail[1] + " L" + (bx - nx * w) + " " + (by - ny * w) + " Z";
  }
  function panel(pn, o) {
    o = o || {};
    var fig = el("figure", { class: "k-ja-manga", "data-ui": "ja.panel", style: "--ar: " + pn.w + " / " + pn.h });
    fig.appendChild(el("img", { class: "k-ja-manga-art", src: IMG + pn.img + ".webp", alt: pn.alt || "", draggable: "false" }));
    var g = svg("svg", { class: "k-ja-manga-balloons", viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": "true" });
    var strokes = svg("g", { class: "k-ja-manga-stroke" }), fills = svg("g", { class: "k-ja-manga-fill" });
    pn.bubbles.forEach(function (b) {
      [strokes, fills].forEach(function (layer) {
        layer.appendChild(svg("ellipse", { cx: b.x, cy: b.y, rx: b.rx, ry: b.ry, "vector-effect": "non-scaling-stroke" }));
        if (b.tail) layer.appendChild(svg("path", { d: tailPath(b), "vector-effect": "non-scaling-stroke" }));
      });
    });
    g.appendChild(strokes); g.appendChild(fills); fig.appendChild(g);
    var nodes = pn.bubbles.map(function (b) {
      var t = el("p", { class: "k-ja-manga-text", style: "--fs: " + (b.size || 2.6) }, []);
      b.ja.split("\n").forEach(function (col, ci) { if (ci) t.appendChild(el("br")); t.appendChild(furi(col, { known: o.known })); });
      var bub = el("button", { type: "button", class: "k-ja-manga-bubble", "data-ui": "ja.panel-bubble", style: "--x: " + b.x + "%; --y: " + b.y + "%",
        "aria-label": ((CAST[b.who] || {}).name || b.who) + ": " + plain(b.ja).replace(/\n/g, "") + (b.en ? " (" + b.en + ")" : ""), title: b.en || "",
        onclick: function () { say(b.ja.replace(/\n/g, ""), { who: b.who, node: bub }); } }, [t]);
      fig.appendChild(bub);
      return bub;
    });
    (pn.sfx || []).forEach(function (x) {
      fig.appendChild(el("span", { class: "k-ja-manga-sfx", lang: "ja", "aria-hidden": "true", text: x.ja, style: "--x: " + x.x + "%; --y: " + x.y + "%; --fs: " + (x.size || 9) + "; --rot: " + (x.rot || 0) + "deg" }));
    });
    var enList = el("ol", { class: "k-ja-manga-en", hidden: true }, pn.bubbles.map(function (b) { return el("li", {}, [el("b", { text: ((CAST[b.who] || {}).name || b.who) + " " }), b.en || ""]); }));
    function playAll(btn) {
      var k = 0;
      (function next() {
        if (k >= pn.bubbles.length) return;
        var b = pn.bubbles[k], node = nodes[k]; k++;
        say(b.ja.replace(/\n/g, ""), { who: b.who, node: node, onEnd: function () { setTimeout(next, 300); } });
      })();
    }
    var tools = el("div", { class: "k-ja-manga-tools" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.panel-hear", text: "▶ Hear the panel", onclick: function () { playAll(); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.panel-english", "aria-pressed": "false", text: "English",
        onclick: function (e) { enList.hidden = !enList.hidden; e.currentTarget.setAttribute("aria-pressed", String(!enList.hidden)); } }),
      el("small", { class: "k-muted", text: "Tap a balloon to hear it. Manga reads right to left." })
    ]);
    return el("div", { class: "k-ja-manga-wrap" }, [fig, tools, enList]);
  }

  KOS.jaUI = {
    CAST: CAST, SKILL: SKILL, plain: plain, furi: furi, skill: skill, say: say, stop: stop, synthetic: synthetic, line: line,
    verdict: verdict, verdictWords: verdictWords, stagePath: stagePath, mediaPath: mediaPath, range: range, radar: radar,
    meter: meter, seal: seal, pad: pad, scene: scene, panel: panel, IMG: IMG
  };
})();
