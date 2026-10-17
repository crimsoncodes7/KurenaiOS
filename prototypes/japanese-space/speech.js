/* Spike S — the speech measurement page (docs/japanese-plan.md §13). Each scripted item is recorded
   once; the browser recogniser listens live, Whisper transcribes the same recording, and word pairs
   also go through the acoustic check. The headline figure is FALSE ACCEPTANCE: how often a
   deliberate mistake is marked correct. Results (no audio) are kept in this browser. */
(function () {
  "use strict";
  var JA = window.JA, el = JA.ex.el;
  var KEY = "ja-spike-s-v1";
  var app = document.getElementById("app"), live = document.getElementById("live");
  function announce(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }

  // ---------- the script: 20 sentences and 20 words, half of each deliberate mistakes ----------
  var S = [
    ["これは本です", "これはほんです", ["これは本です"]], ["それはペンです", "それはぺんです", []], ["あれはねこです", "あれはねこです", ["あれは猫です"]],
    ["これはなんですか", "これはなんですか", ["これは何ですか"]], ["それはケーキです", "それはけーきです", []], ["おばあさんです", "おばあさんです", ["お婆さんです"]],
    ["きってをかいます", "きってをかいます", ["切手を買います", "切手をかいます"]], ["がっこうにいきます", "がっこうにいきます", ["学校に行きます", "学校にいきます"]],
    ["ちょっとまってください", "ちょっとまってください", ["ちょっと待ってください", "ちょっと待って下さい"]], ["ありがとうございます", "ありがとうございます", ["有難うございます"]]
  ];
  var items = [];
  S.forEach(function (x, i) { items.push({ id: "s" + (i + 1), kind: "sentence", target: x[1], written: x[0], alt: x[2], say: x[0], mistake: null }); });
  [[0, "これを本です", "particle を for は"], [4, "それはケキです", "long vowel ー dropped"], [5, "おばさんです", "long vowel dropped"], [6, "きてをかいます", "small っ dropped"],
   [7, "かっこうにいきます", "voicing が → か"], [8, "ちょとまってください", "small っ dropped"], [2, "あれはねごです", "voicing こ → ご"], [3, "これはなんですが", "voicing か → が"],
   [9, "ありがとございます", "long vowel dropped"], [1, "それはベンです", "voicing ぺ → べ"]].forEach(function (m, i) {
    var b = items[m[0]]; items.push({ id: "m" + (i + 1), kind: "sentence", target: b.target, written: b.written, alt: b.alt, say: m[1], mistake: m[2] });
  });
  var P = [["おばさん", "おばあさん"], ["きて", "きって"], ["かこ", "かっこ"], ["ここ", "こうこう"], ["いえ", "いいえ"]];
  var WRITE = { "おばさん": ["叔母さん", "伯母さん"], "おばあさん": ["お婆さん", "おばあちゃん"], "きて": ["来て", "着て"], "きって": ["切手", "切って"], "かこ": ["過去"], "かっこ": ["括弧", "格好", "かっこう"], "ここ": ["個々"], "こうこう": ["高校", "孝行"], "いえ": ["家"], "いいえ": [] };
  P.forEach(function (p, i) {
    [0, 1].forEach(function (w) {
      var t = p[w], o = p[1 - w];
      items.push({ id: "w" + (i + 1) + (w ? "b" : "a"), kind: "word", pair: p, target: t, alt: WRITE[t], say: t, mistake: null });
      items.push({ id: "x" + (i + 1) + (w ? "b" : "a"), kind: "word", pair: p, target: t, alt: WRITE[t], say: o, mistake: "said " + o });
    });
  });

  // ---------- state ----------
  var st = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  st.results = st.results || {}; st.mora = st.mora || null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var audio = {}; // id → blob, this visit only

  function verdict(text, it) {
    if (!text) return null;
    var r = JA.valid.check("dictation", text, { target: it.target, alt: (it.alt || []).concat(it.written ? [it.written] : []) });
    return r.verdict;
  }
  var accepted = function (v) { return v === "correct" || v === "accepted"; };

  // ---------- recording one item ----------
  async function run(it, row) {
    var btn = row.querySelector(".rec"), meter = row.querySelector(".meter span");
    if (btn.getAttribute("data-rec")) { btn._stop(); return; }
    btn.setAttribute("data-rec", "1"); btn.textContent = "■ Stop";
    var wl = JA.asr.web.available ? JA.asr.web.listen() : null;
    var rc = JA.audio.record({ maxMs: it.kind === "word" ? 3000 : 6000, onLevel: function (m) { meter.style.width = Math.min(100, m * 140) + "%"; } });
    btn._stop = function () { rc.stop(); if (wl) wl.stop(); };
    var r;
    try { r = await rc.done; } catch (e) { btn.removeAttribute("data-rec"); btn.textContent = "● Record"; announce("Microphone unavailable: " + e.message); return; }
    if (wl) wl.stop();
    btn.removeAttribute("data-rec"); btn.textContent = "● Again"; meter.style.width = "0";
    audio[it.id] = r.blob;
    if (JA.results) JA.results.putAudio(it.id, r.pcm); // kept for re-tuning on your voice (results.html)
    var res = { at: Date.now(), secs: r.pcm.length / 16000 };
    var an = JA.acoustic.analyse(r.pcm, 16000);
    res.contour = JA.acoustic.semitones(an.contour).filter(function (_, i) { return i % 2 === 0; }).map(function (p) { return [+p[0].toFixed(2), +p[1].toFixed(1)]; });
    res.runs = an.runs.map(function (x) { return [x.lab, +x.dur.toFixed(3)]; });
    if (it.kind === "word") {
      var d = JA.acoustic.decide(an, it.pair, { mora: st.mora });
      res.acoustic = { heard: d.heard, confident: d.confident, needsRate: d.needsRate, why: d.why };
    }
    var pcm = r.pcm;
    var jobs = [];
    if (wl) jobs.push(wl.done.then(function (w) { res.web = { text: w.alts[0] || "", alts: w.alts, ms: w.ms, error: w.error || null, v: verdict(w.alts[0], it) };
      // the best of its alternatives, as the app would use them
      var best = (w.alts || []).map(function (a) { return verdict(a, it); }).filter(Boolean).sort(function (a, b) { return rankV(b) - rankV(a); })[0];
      res.web.bestV = best || null; }));
    if (JA.asr.whisper.state === "ready") jobs.push(JA.asr.whisper.transcribe(pcm.slice()).then(function (w) {
      var pl = JA.asr.plausible(w.text, res.secs);
      res.whisper = { text: w.text, ms: w.ms, dropped: pl.ok ? null : pl.why, v: pl.ok ? verdict(w.text, it) : null };
    }, function (e) { res.whisper = { error: e.message }; }));
    row.querySelector(".out").textContent = "Transcribing…";
    await Promise.all(jobs);
    st.results[it.id] = res; save();
    drawRow(it, row); drawSummary();
    announce(it.id + " recorded");
  }
  function rankV(v) { return { correct: 3, accepted: 2, near: 1, wrong: 0 }[v] || 0; }

  // ---------- drawing ----------
  function chip(v, mistake) {
    if (!v) return el("span", { class: "chip wait", text: "—" });
    var acc = accepted(v), bad = mistake ? acc : !acc; // a mistake should NOT be accepted
    return el("span", { class: "chip " + (bad ? "bad" : "done"), title: mistake ? (acc ? "False acceptance: the mistake passed" : "Caught the mistake") : (acc ? "Accepted" : "False rejection"), text: v + (bad ? (mistake ? " · missed" : " · rejected") : "") });
  }
  function contourSvg(c) {
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 120 36"); svg.setAttribute("class", "contour"); svg.setAttribute("aria-hidden", "true");
    if (!c || c.length < 2) return svg;
    var t0 = c[0][0], t1 = c[c.length - 1][0] || t0 + 1;
    var pl = document.createElementNS(ns, "polyline");
    pl.setAttribute("points", c.map(function (p) { return (4 + (p[0] - t0) / (t1 - t0 || 1) * 112).toFixed(1) + "," + (18 - Math.max(-8, Math.min(8, p[1])) * 2).toFixed(1); }).join(" "));
    svg.appendChild(pl); return svg;
  }
  function drawRow(it, row) {
    var r = st.results[it.id], out = row.querySelector(".out");
    out.innerHTML = "";
    if (!r) { out.appendChild(el("span", { class: "muted", text: "Not recorded yet." })); return; }
    var cells = [];
    if (r.web) cells.push(el("div", { class: "eng" }, [el("b", { text: "Browser" }), " ", chip(r.web.bestV || r.web.v, it.mistake), " ", el("span", { lang: "ja", text: r.web.text || (r.web.error ? "(" + r.web.error + ")" : "(nothing)") })]));
    if (r.whisper) cells.push(el("div", { class: "eng" }, [el("b", { text: "Whisper" }), " ", chip(r.whisper.v, it.mistake), " ", el("span", { lang: "ja", text: r.whisper.text || r.whisper.error || "" }), r.whisper.dropped ? el("span", { class: "muted", text: " dropped: " + r.whisper.dropped }) : null, el("span", { class: "muted", text: " · " + r.whisper.ms + " ms" })]));
    if (r.acoustic) {
      var a = r.acoustic, ok = a.heard === it.say;
      cells.push(el("div", { class: "eng" }, [el("b", { text: "Acoustic" }), " ",
        el("span", { class: "chip " + (!a.confident ? "wait" : ok ? "done" : "bad"), text: !a.confident ? (a.needsRate ? "needs the pace calibration" : "unsure · say again") : "heard " + a.heard + (ok ? "" : " · wrong") }),
        el("span", { class: "muted", text: " " + a.why })]));
    }
    cells.push(contourSvg(r.contour));
    cells.forEach(function (c) { out.appendChild(c); });
    if (audio[it.id]) out.appendChild(el("button", { class: "btn mini", type: "button", onclick: function () { new Audio(URL.createObjectURL(audio[it.id])).play(); } }, ["▶ Mine"]));
  }

  function rate(list, engine, wantAccept) {
    var n = 0, k = 0;
    list.forEach(function (it) {
      var r = st.results[it.id]; if (!r) return;
      var v = engine === "web" ? r.web && (r.web.bestV || r.web.v) : engine === "whisper" ? r.whisper && r.whisper.v : null;
      if (engine === "acoustic") { if (!r.acoustic) return; n++; var acc = r.acoustic.confident && r.acoustic.heard === it.target; if (acc === wantAccept) k++; return; }
      if (!(engine === "web" ? r.web : r.whisper)) return;
      n++; if (accepted(v) === wantAccept) k++;
    });
    return n ? k + " / " + n : "—";
  }
  var summary = el("aside", { class: "card spike-sum", "aria-labelledby": "sum-h" });
  function drawSummary() {
    summary.innerHTML = "";
    summary.appendChild(el("h2", { id: "sum-h", text: "Results" }));
    var groups = [["Sentences", items.filter(function (i) { return i.kind === "sentence"; })], ["Words", items.filter(function (i) { return i.kind === "word"; })]];
    var t = el("table", { class: "sum" }, [el("thead", {}, [el("tr", {}, [el("th", { text: "" }), el("th", { text: "False accept" }), el("th", { text: "False reject" })])])]);
    var tb = el("tbody"); t.appendChild(tb);
    groups.forEach(function (g) {
      var mis = g[1].filter(function (i) { return i.mistake; }), ok = g[1].filter(function (i) { return !i.mistake; });
      ["web", "whisper"].concat(g[0] === "Words" ? ["acoustic"] : []).forEach(function (e) {
        tb.appendChild(el("tr", {}, [el("th", { text: g[0] + " · " + { web: "Browser", whisper: "Whisper", acoustic: "Acoustic" }[e] }), el("td", { text: rate(mis, e, true) }), el("td", { text: rate(ok, e, false) })]));
      });
    });
    summary.appendChild(t);
    summary.appendChild(el("p", { class: "muted small", text: "False accept: a deliberate mistake marked correct (lower is better; this is the number that decides). False reject: a correct utterance marked wrong. The acoustic check only judges words, and counts “unsure” as not accepted." }));
    var done = Object.keys(st.results).length;
    summary.appendChild(el("p", { text: done + " of " + items.length + " recorded." }));
    summary.appendChild(el("div", { class: "row wrap" }, [
      el("button", { class: "btn", type: "button", onclick: function () { navigator.clipboard.writeText(JSON.stringify({ when: new Date().toISOString(), ua: navigator.userAgent, whisper: JA.asr.whisper.model, device: JA.asr.whisper.device, mora: st.mora, results: st.results }, null, 1)).then(function () { announce("Results copied"); }); } }, ["Copy results (JSON)"]),
      el("button", { class: "btn danger", type: "button", onclick: function () { if (confirm("Clear every recorded result?")) { st.results = {}; save(); render(); } } }, ["Clear"])
    ]));
  }

  // ---------- engines card ----------
  function engines() {
    var wStatus = el("span", { class: "muted", text: whisperText() });
    var sel = el("select", { "aria-label": "Whisper model" }, [["onnx-community/whisper-base", "base (~200 MB on WebGPU)"], ["onnx-community/whisper-small", "small (~500 MB)"], ["onnx-community/whisper-tiny", "tiny (~100 MB)"], ["onnx-community/whisper-large-v3-turbo", "large-v3-turbo (~1 GB)"]].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    JA.asr.whisper.on(function (m) {
      if (m.type === "progress" && m.total) wStatus.textContent = "Downloading " + (m.loaded / 1048576).toFixed(0) + " of " + (m.total / 1048576).toFixed(0) + " MB…";
      else wStatus.textContent = whisperText(m);
      if (m.type === "ready") { announce("Whisper is ready"); }
    });
    var calOut = el("span", { class: "muted", text: st.mora ? "Your pace: " + Math.round(st.mora * 1000) + " ms a beat." : "Not calibrated: long-vowel words will say “needs the pace calibration”." });
    var calBtn = el("button", { class: "btn", type: "button", onclick: async function () {
      calBtn.disabled = true; calBtn.textContent = "■ Listening… say it once";
      var rc = JA.audio.record({ maxMs: 3500 });
      try { var r = await rc.done; var an = JA.acoustic.analyse(r.pcm, 16000); st.mora = JA.acoustic.calibrate(an); if (JA.results) JA.results.putAudio("calibration", r.pcm); save(); calOut.textContent = "Your pace: " + Math.round(st.mora * 1000) + " ms a beat."; announce("Calibrated"); }
      catch (e) { calOut.textContent = "Microphone unavailable: " + e.message; }
      calBtn.disabled = false; calBtn.textContent = "● Calibrate again";
    } }, [st.mora ? "● Calibrate again" : "● Calibrate"]);
    return el("section", { class: "engines" }, [
      el("div", { class: "card" }, [el("h2", { text: "Browser recogniser" }),
        el("p", { text: JA.asr.web.available ? "Available. In Chrome your audio goes to Google's servers for this; Safari may process it on the device." : "Not available in this browser." , class: JA.asr.web.available ? "" : "muted" })]),
      el("div", { class: "card" }, [el("h2", { text: "Whisper on this device" }), el("div", { class: "row wrap" }, [sel,
        el("button", { class: "btn primary", type: "button", onclick: function () { JA.asr.whisper.load(sel.value); wStatus.textContent = "Starting…"; } }, ["Download and load"])]), wStatus]),
      el("div", { class: "card" }, [el("h2", { text: "Your pace" }), el("p", { class: "muted small" }, ["Say ", el("b", { lang: "ja", text: "ありがとうございます" }), " once at your normal speed. Long vowels are judged against it."]), el("div", { class: "row wrap" }, [calBtn]), calOut])
    ]);
  }
  function whisperText(m) {
    var w = JA.asr.whisper;
    if (m && m.type === "error") return "Failed: " + m.message;
    return w.state === "ready" ? "Ready: " + w.model.split("/")[1] + " on " + w.device + "." : w.state === "loading" ? "Loading…" : "Not loaded. The browser recogniser still runs without it.";
  }

  function render() {
    app.innerHTML = "";
    app.appendChild(el("header", { class: "ph" }, [el("div", {}, [el("h1", { text: "Speech spike" }),
      el("div", { class: "sub", text: "Record each line. Some ask for a deliberate mistake: the question is whether each engine notices." })])]));
    app.appendChild(engines());
    var list = el("ol", { class: "spike" });
    items.forEach(function (it) {
      var row = el("li", { class: "card sp-item", "data-mistake": it.mistake ? "1" : null }, [
        el("div", { class: "sp-head" }, [
          el("span", { class: "mono muted", text: it.id }),
          el("div", { class: "sp-say" }, [
            it.mistake ? el("span", { class: "chip bad", text: "Deliberate mistake: " + it.mistake }) : el("span", { class: "chip", text: it.kind === "word" ? "Word" : "Sentence" }),
            el("div", { class: "say", lang: "ja" }, ["Say: ", el("b", { text: it.say })]),
            it.mistake ? el("div", { class: "muted small", lang: "ja", text: "The exercise expects: " + (it.written || it.target) }) : null
          ]),
          el("div", { class: "sp-act" }, [el("button", { class: "btn primary rec", type: "button", onclick: function () { run(it, row); } }, [st.results[it.id] ? "● Again" : "● Record"]), el("span", { class: "meter", "aria-hidden": "true" }, [el("span")])])
        ]),
        el("div", { class: "out" })
      ]);
      drawRow(it, row);
      list.appendChild(row);
    });
    app.appendChild(el("div", { class: "spike-wrap" }, [list, summary]));
    drawSummary();
  }
  render();
})();
