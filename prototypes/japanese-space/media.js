/* Your media (docs/japanese-plan.md §10.3 and §12): open an episode's subtitles (and, if you like,
   the video), see how much of it you already know, mine the lines with exactly one new word,
   and practise single lines — loop, slow, subtitles hidden, dictation, shadowing. Saved lines are
   short clips kept in this browser's IndexedDB: nothing is uploaded, synced or committed.
   Throwaway slice code. */
(function () {
  "use strict";
  var JA = window.JA, X = JA.ex, el = X.el, K = JA.kana;

  // ---------- subtitles ----------
  function secs(t) { var m = /(?:(\d+):)?(\d+):(\d+)[.,](\d+)/.exec(t); if (!m) return 0; return (+m[1] || 0) * 3600 + +m[2] * 60 + +m[3] + +("0." + m[4]); }
  function clean(s) { return s.replace(/\{[^}]*\}/g, "").replace(/<[^>]+>/g, "").replace(/\\[Nn]/g, " ").replace(/\s+/g, " ").trim(); }
  /* parseSubs(text) → [{start, end, text}] from SRT, WebVTT or ASS/SSA. */
  function parseSubs(text) {
    var cues = [];
    if (/^\s*\[Script Info\]/m.test(text) || /^Dialogue:/m.test(text)) {
      text.split(/\r?\n/).forEach(function (l) {
        if (!/^Dialogue:/.test(l)) return;
        var f = l.slice(9).split(","), t = clean(f.slice(9).join(","));
        if (t) cues.push({ start: secs(f[1]), end: secs(f[2]), text: t });
      });
    } else {
      text.replace(/\r/g, "").split(/\n\n+/).forEach(function (b) {
        var ls = b.split("\n"), i = ls.findIndex(function (l) { return /-->/.test(l); });
        if (i < 0) return;
        var tm = ls[i].split("-->"), t = clean(ls.slice(i + 1).join(" "));
        if (t) cues.push({ start: secs(tm[0]), end: secs(tm[1]), text: t });
      });
    }
    return cues.filter(function (c) { return /[぀-ヿ㐀-鿿]/.test(c.text); }).sort(function (a, b) { return a.start - b.start; });
  }

  // ---------- the word splitter (Lindera + UniDic in a worker, Spike T) ----------
  var worker = null, seq = 0, waits = {}, ready = null;
  /* parseTranscript(text) → cues, from YouTube's "Show transcript" panel copied as text:
     a time ("1:05") on its own line or at the start of one, the words after it. Lines that are
     only the panel's spoken time ("1 minute, 5 seconds") or English are dropped. A pasted SRT/VTT
     is read as one. */
  function parseTranscript(text) {
    var asSubs = parseSubs(text); if (asSubs.length) return asSubs;
    var TS = /^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\s+(.*))?$/, cues = [], cur = null;
    String(text).split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim(); if (!line) return;
      var m = TS.exec(line);
      if (m) { cur = { start: (+m[1] || 0) * 3600 + +m[2] * 60 + +m[3], text: "" }; cues.push(cur); if (m[4]) cur.text = m[4]; return; }
      if (/^\d+\s+(hours?|minutes?|seconds?)(,\s*\d+\s+(minutes?|seconds?))*$/i.test(line)) return;
      if (cur) cur.text += (cur.text ? " " : "") + line;
    });
    cues = cues.filter(function (c) { return /[぀-ヿ㐀-鿿]/.test(c.text); }).map(function (c) { return { start: c.start, text: clean(c.text) }; });
    cues.forEach(function (c, i) { var n = cues[i + 1]; c.end = n ? Math.min(n.start, c.start + 8) : c.start + 5; });
    return cues;
  }
  function ytId(s) { var m = /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{11})/.exec(s || "") || /^([\w-]{11})$/.exec((s || "").trim()); return m ? m[1] : null; }

  function splitter() {
    if (ready) return ready;
    ready = new Promise(function (resolve, reject) {
      worker = new Worker("ja-token-worker.js?v=" + Date.now(), { type: "module" });
      worker.onmessage = function (e) {
        var m = e.data;
        if (m.type === "ready") resolve(m); else if (m.type === "error") { ready = null; reject(new Error(m.message)); }
        else if (m.type === "result") { waits[m.id](m.out); delete waits[m.id]; }
      };
      worker.postMessage({ type: "load" });
    });
    return ready;
  }
  function split(lines) { return splitter().then(function () { return new Promise(function (r) { var id = ++seq; waits[id] = r; worker.postMessage({ type: "tokenize", id: id, lines: lines }); }); }); }

  // ---------- coverage ----------
  var FN = { "助詞": 1, "助動詞": 1, "補助記号": 1, "記号": 1, "空白": 1, "接尾辞": 1, "接頭辞": 1 };
  function isContent(t) { return !FN[t.pos] && t.pos2 !== "固有名詞" && t.pos2 !== "数詞" && /[぀-ヿ㐀-鿿]/.test(t.s); }

  /* What you know: every word whose reading review has begun to hold (R stability ≥ 3 days) plus
     the words you have listed yourself. Matched by written form, dictionary form or reading. */
  function knownSet() {
    var st = JA.app.state(), set = new Set();
    Object.keys(st.facets).forEach(function (k) {
      var p = JA.srs.split(k), f = st.facets[k], it = JA.items[p.item];
      if (p.skill !== "R" || !it || !(it.kind === "word" || it.kind === "kanji") || !(f.reps && f.s >= 3)) return;
      set.add(it.w); set.add(it.r);
    });
    (st.knownExtra || []).forEach(function (w) { set.add(w); set.add(K.toHiragana(w)); });
    return set;
  }
  function knows(set, t) { return set.has(t.s) || set.has(t.base) || set.has(t.lemma) || (t.reading && set.has(t.reading)); }

  /* coverage(cues, split, known) → running-word coverage, the unknown words by frequency, and the
     i+1 lines (exactly one new word): the best sentences to mine (plan §2, principle 8). */
  function coverage(cues, out, known) {
    var total = 0, hit = 0, freq = {}, lines = [], names = {};
    cues.forEach(function (c, i) {
      var r = out[i], cover = {}, unknown = {}, name = {};
      r.merged.forEach(function (m) { if (m.pos === "name") { for (var k = m.from; k < m.to; k++) name[k] = m.s; names[m.s] = (names[m.s] || 0) + 1; } });
      r.merged.filter(function (m) { return m.pos !== "name"; }).sort(function (a, b) { return (b.to - b.from) - (a.to - a.from); }).forEach(function (m) {
        for (var k = m.from; k < m.to; k++) if (!cover[k]) cover[k] = m;
      });
      var counted = new Set();
      r.tokens.forEach(function (t, k) {
        if (!isContent(t) || name[k]) return;
        var m = cover[k], key = m ? m.s : t.base, ok = known.has(key) || knows(known, t);
        if (m) { if (counted.has(m)) return; counted.add(m); } // a compound or phrase counts once, particles inside or not
        total++; if (ok) hit++; else { unknown[key] = 1; freq[key] = (freq[key] || 0) + 1; }
      });
      lines.push({ i: i, unknown: Object.keys(unknown) });
    });
    var words = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a] || (a < b ? -1 : 1); });
    return { total: total, known: hit, pct: total ? hit / total : 0, freq: freq, words: words, lines: lines,
      names: Object.keys(names).sort(function (a, b) { return names[b] - names[a]; }),
      iPlus1: lines.filter(function (l) { return l.unknown.length === 1; }), clear: lines.filter(function (l) { return !l.unknown.length; }) };
  }

  /* A line's kana for dictation: particles as written (は, を, へ), everything else as said. */
  function kanaOf(r) {
    var spelled = "", said = "";
    r.tokens.forEach(function (t) {
      if (t.pos === "補助記号" || t.pos === "記号" || t.pos === "空白") return;
      var p = t.pron || K.toHiragana(t.s);
      said += p; spelled += t.pos === "助詞" && /^[ぁ-ん]+$/.test(t.s) ? t.s : p;
    });
    return { target: spelled, alt: said !== spelled ? [said] : [] };
  }

  // ---------- clips on this device (IndexedDB) ----------
  var DB = "kurenai-ja-slice-media";
  function db() { return new Promise(function (res, rej) { var r = indexedDB.open(DB, 1); r.onupgradeneeded = function () { r.result.createObjectStore("clips", { keyPath: "id" }); }; r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; }); }
  function tx(mode, fn) { return db().then(function (d) { return new Promise(function (res, rej) { var t = d.transaction("clips", mode), s = t.objectStore("clips"), out = fn(s); t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); }; t.onerror = function () { rej(t.error); }; }); }); }
  var clips = { all: function () { return tx("readonly", function (s) { return s.getAll(); }); }, put: function (c) { return tx("readwrite", function (s) { s.put(c); }); }, del: function (id) { return tx("readwrite", function (s) { s.delete(id); }); } };
  JA.clipIndex = {};
  function indexClips() {
    return clips.all().then(function (list) {
      Object.keys(JA.clipIndex).forEach(function (k) { URL.revokeObjectURL(JA.clipIndex[k].url); });
      JA.clipIndex = {};
      list.forEach(function (c) { JA.clipIndex[c.id] = { text: c.text, kana: c.kana, alt: c.alt, url: URL.createObjectURL(c.blob), from: c.from }; });
      return list;
    }).catch(function () { return []; });
  }
  var ready0 = indexClips();

  /* Record one line out of the playing video: seek, play to its end, capture the element's own
     stream. The result is a few seconds of WebM — the episode itself is never stored. */
  function captureLine(video, cue) {
    return new Promise(function (resolve, reject) {
      var stream = (video.captureStream || video.mozCaptureStream).call(video), chunks = [];
      var rec = new MediaRecorder(stream), stopAt = cue.end + 0.25;
      rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
      rec.onstop = function () { resolve(new Blob(chunks, { type: rec.mimeType || "video/webm" })); };
      video.currentTime = Math.max(0, cue.start - 0.15);
      video.addEventListener("seeked", function go() {
        video.removeEventListener("seeked", go);
        rec.start(); video.play().catch(reject);
        // a timer, not requestAnimationFrame: that stops in a background tab and the clip never ends
        var watch = setInterval(function () { if (video.currentTime >= stopAt || video.ended) { clearInterval(watch); video.pause(); rec.stop(); } }, 40);
      });
    });
  }

  // ---------- the page ----------
  var session = null; // this visit's episode: {name, cues, out, cov, videoUrl}
  function view(m) {
    var api = JA.app, st = api.state();
    m.appendChild(api.header("Your media", "Subtitles and video you open here stay on this device."));
    var grid = el("div", { class: "media" });
    var main = el("div", { class: "col" }), side = el("div", { class: "col side" });
    grid.appendChild(main); grid.appendChild(side); m.appendChild(grid);

    // open an episode
    var subIn = el("input", { type: "file", accept: ".srt,.ass,.ssa,.vtt", id: "sub-in", class: "sr" });
    var vidIn = el("input", { type: "file", accept: "video/*,audio/*", id: "vid-in", class: "sr" });
    var status = el("p", { class: "muted small", "aria-live": "polite", text: session ? "Open: " + session.name : "Choose a subtitle file. Add the video too if you want to practise lines." });
    var open = el("section", { class: "card", "aria-labelledby": "o-h" }, [
      el("h2", { id: "o-h", text: "Open an episode" }),
      el("div", { class: "row wrap" }, [
        el("label", { class: "btn primary", for: "sub-in" }, ["Subtitles (.srt, .ass, .vtt)"]), subIn,
        el("label", { class: "btn", for: "vid-in" }, ["Video (optional)"]), vidIn
      ]), status,
      el("p", { class: "muted small", text: "Splitting needs the word splitter (about 55 MB, this computer only; loaded on first use)." })
    ]);
    main.appendChild(open);

    // or a YouTube video: the embed plays it, the transcript you paste gives the lines
    var ytUrl = el("input", { type: "url", class: "ans", placeholder: "https://www.youtube.com/watch?v=…", "aria-label": "YouTube link", value: (session && session.yt && "https://youtu.be/" + session.yt) || "" });
    var ytText = el("textarea", { rows: 4, lang: "ja", "aria-label": "Transcript", placeholder: "Paste the transcript here (on YouTube: ⋯ under the video → Show transcript, select it all, copy)." });
    var ytStatus = el("p", { class: "muted small", "aria-live": "polite" });
    main.appendChild(el("section", { class: "card", "aria-labelledby": "yt-h" }, [
      el("h2", { id: "yt-h", text: "Or a YouTube video" }),
      el("p", { class: "muted small", text: "Coverage, the line list, looping, 0.75× and dictation all work. Saving a line as a clip needs a video file (an embed cannot be cut)." }),
      ytUrl, ytText,
      el("div", { class: "row wrap" }, [el("button", { class: "btn primary", type: "button", onclick: function () {
        var id = ytId(ytUrl.value); if (!id) { ytStatus.textContent = "That doesn't look like a YouTube link."; return; }
        var cues = parseTranscript(ytText.value);
        if (!cues.length) { ytStatus.textContent = "No Japanese lines with times found. Copy the transcript with its timestamps on."; return; }
        openCues("YouTube " + id, cues, { yt: id }, ytStatus);
      } }, ["Open the video"])]), ytStatus
    ]));

    function openCues(name, cues, extra, out) {
      out.textContent = "Splitting " + cues.length + " lines into words… (first time: loading the splitter)";
      return split(cues.map(function (c) { return c.text; })).then(function (res) {
        if (session && session.videoUrl && (extra.videoUrl || extra.yt)) URL.revokeObjectURL(session.videoUrl);
        session = Object.assign({ name: name, cues: cues, out: res }, extra);
        api.draw();
      });
    }
    var pending = { sub: null, vid: null };
    function go() {
      if (!pending.sub) return;
      status.textContent = "Reading the subtitles…";
      pending.sub.text().then(function (txt) {
        var cues = parseSubs(txt);
        if (!cues.length) { status.textContent = "No Japanese lines found in that file."; return; }
        var keep = session && !session.yt ? session : null;
        return openCues(pending.sub.name, cues, { videoUrl: pending.vid ? URL.createObjectURL(pending.vid) : keep && keep.videoUrl, videoName: pending.vid ? pending.vid.name : keep && keep.videoName }, status);
      }).catch(function (e) { status.textContent = "Could not read it: " + e.message; });
    }
    subIn.addEventListener("change", function () { pending.sub = subIn.files[0]; go(); });
    vidIn.addEventListener("change", function () {
      pending.vid = vidIn.files[0]; if (!pending.vid) return;
      // subtitles already open (in either order): attach the video to them
      if (session && !session.yt) { if (session.videoUrl) URL.revokeObjectURL(session.videoUrl); session.videoUrl = URL.createObjectURL(pending.vid); session.videoName = pending.vid.name; api.draw(); }
      else status.textContent = "Video chosen: " + pending.vid.name + ". Now the subtitles.";
    });
    JA.media._open = function (subFile, vidFile) { pending.sub = subFile; pending.vid = vidFile || null; go(); }; // used by the test harness

    if (session) {
      var known = knownSet(), cov = session.cov = coverage(session.cues, session.out, known);
      if (session.videoUrl || session.yt) main.insertBefore(player(session, cov, known), open);
      record(session, cov);
      main.appendChild(lineList(session, cov));
      side.appendChild(coverageCard(session, cov));
    }
    side.appendChild(knownCard());
    ready0.then(function () { side.appendChild(clipsCard()); });
  }

  /* What results.html hands over: the figures, the 30 commonest unknown words, and how the first
     60 lines were split (to judge the splitter on real speech). Never the video. */
  function record(s, cov) {
    var sum = { at: Date.now(), source: s.yt ? "youtube" : "file", name: s.name, videoId: s.yt || null, video: !!(s.videoUrl || s.yt), lines: s.cues.length,
      coverage: { words: cov.total, known: cov.known, pct: Math.round(cov.pct * 1000) / 10 }, iPlus1: cov.iPlus1.length, clear: cov.clear.length,
      names: cov.names.slice(0, 20), unknownTop: cov.words.slice(0, 30).map(function (w) { return [w, cov.freq[w]]; }),
      sample: s.cues.slice(0, 60).map(function (c, i) { return { t: Math.round(c.start * 10) / 10, text: c.text, tokens: s.out[i].tokens.map(function (t) { return [t.s, t.pos, t.pos2, t.base, t.kana]; }), merged: (s.out[i].merged || []).map(function (m) { return m.s; }) }; }) };
    try { localStorage.setItem("ja-media-result-v1", JSON.stringify(sum)); } catch (e) {}
  }

  function coverageCard(s, cov) {
    var pct = Math.round(cov.pct * 1000) / 10;
    var verdict = cov.pct >= 0.98 ? "Comfortable without lookups." : cov.pct >= 0.95 ? "Comfortable with a few lookups." : cov.pct >= 0.9 ? "Hard going: a new word every " + Math.round(1 / (1 - cov.pct)) + " words." : "Not yet: about " + Math.round((1 - cov.pct) * 100) + " in every 100 words are new to you.";
    var st = JA.app.state();
    return el("section", { class: "card cov", "aria-labelledby": "c-h" }, [
      el("h2", { id: "c-h", text: "How much you know" }),
      el("p", { class: "cov-big" }, [el("b", { text: pct + "%" }), " of the words in ", el("span", { text: s.name })]),
      el("div", { class: "cov-bar", role: "img", "aria-label": pct + "% known; comfortable reading starts near 95 to 98%" }, [el("span", { style: "width:" + Math.min(100, pct) + "%" }), el("i", { style: "left:90%", title: "90%" }), el("i", { style: "left:95%", title: "95%" }), el("i", { style: "left:98%", title: "98%" })]),
      el("p", { class: "muted small", text: verdict + " (" + cov.known + " of " + cov.total + " words; names and numbers not counted.)" }),
      el("dl", { class: "facts" }, [["Lines", s.cues.length], ["Different new words", cov.words.length], ["Lines you can read already", cov.clear.length], ["Lines with exactly one new word", cov.iPlus1.length]].filter(function (r, i) { return i < 2 || r[1]; }).map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: String(r[1]) })]); })),
      cov.words.length ? el("h3", { text: "Most frequent new words" }) : null,
      cov.words.length ? el("ol", { class: "freq", lang: "ja" }, cov.words.slice(0, 24).map(function (w) { return el("li", {}, [el("span", { text: w }), el("span", { class: "muted", text: "×" + cov.freq[w] })]); })) : null,
      cov.words.length ? el("button", { class: "btn", type: "button", onclick: function (e) {
        st.targets = st.targets || []; var have = {}; st.targets.forEach(function (t) { have[t.w] = 1; });
        cov.words.slice(0, 30).forEach(function (w) { if (!have[w]) st.targets.push({ w: w, n: cov.freq[w], from: s.name }); });
        JA.app.save(); e.currentTarget.textContent = "✓ In your target pack (" + st.targets.length + ")"; e.currentTarget.disabled = true;
      } }, ["Add the top 30 to a target pack"]) : null,
      st.targets && st.targets.length ? el("p", { class: "muted small", text: "Target pack: " + st.targets.length + " words. They become reviews once the generated dictionary gives them meanings (plan §4.3)." }) : null
    ]);
  }

  function knownCard() {
    var st = JA.app.state(), ta = el("textarea", { lang: "ja", rows: 4, "aria-label": "Words you already know" });
    ta.value = (st.knownExtra || []).join("\n");
    var n = knownSet().size;
    return el("section", { class: "card", "aria-labelledby": "k-h" }, [
      el("h2", { id: "k-h", text: "Words you already know" }),
      el("p", { class: "muted small", text: "Coverage counts the words your reviews hold, plus any you list here (one per line, any spelling) — useful while the slice has only a few lessons." }),
      ta,
      el("div", { class: "row between" }, [el("span", { class: "muted small", text: n + " spellings known" }), el("button", { class: "btn", type: "button", onclick: function () {
        st.knownExtra = ta.value.split(/[\s,、]+/).map(function (w) { return w.trim(); }).filter(Boolean); JA.app.save(); JA.app.draw();
      } }, ["Save and recount"])])
    ]);
  }

  /* The line list: every subtitle with its new-word count; i+1 lines marked for mining. */
  function lineList(s, cov) {
    var filter = s.filter || "all";
    var tabs = el("div", { class: "row wrap", role: "group", "aria-label": "Show lines" }, [["all", "All lines"], ["one", "Exactly one new word"], ["clear", "Already readable"]].map(function (f) {
      return el("button", { class: "btn mini", type: "button", "aria-pressed": String(filter === f[0]), onclick: function () { s.filter = f[0]; JA.app.draw(); } }, [f[1]]);
    }));
    var list = el("ol", { class: "cues" });
    cov.lines.forEach(function (l) {
      if (filter === "one" && l.unknown.length !== 1) return;
      if (filter === "clear" && l.unknown.length) return;
      var c = s.cues[l.i];
      list.appendChild(el("li", { "data-i": l.i, "data-one": l.unknown.length === 1 ? "1" : null }, [
        el("button", { class: "cue", type: "button", disabled: s.videoUrl ? null : true, onclick: function () { if (s.seek) s.seek(l.i); } }, [
          el("span", { class: "mono muted", text: fmt(c.start) }),
          el("span", { class: "ja", lang: "ja", text: c.text }),
          l.unknown.length ? el("span", { class: "chip" + (l.unknown.length === 1 ? " ready" : ""), lang: "ja", text: l.unknown.length === 1 ? "new: " + l.unknown[0] : l.unknown.length + " new" }) : el("span", { class: "chip done", text: "✓ readable" })
        ])
      ]));
    });
    if (!list.children.length) list.appendChild(el("li", { class: "muted", text: "No lines in this view." }));
    return el("section", { class: "card", "aria-labelledby": "ln-h" }, [el("div", { class: "today-head" }, [el("h2", { id: "ln-h", text: "Lines" }), tabs]), list]);
  }
  function fmt(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ":" + String(s).padStart(2, "0"); }

  /* The player: one line at a time. Subtitles drawn by the page (so they can hide, and carry
     furigana only on words you do not know yet). */
  /* The player's source: a local video file or a YouTube embed, behind one small interface. */
  function fileSource(url) {
    var v = el("video", { src: url, preload: "auto", playsinline: true });
    return { node: v, time: function () { return v.currentTime; }, paused: function () { return v.paused; }, seek: function (t) { v.currentTime = t; },
      play: function () { v.play(); }, pause: function () { v.pause(); }, rate: function (r) { v.playbackRate = r; }, onTick: function (fn) { v.addEventListener("timeupdate", fn); } };
  }
  var ytApi = null;
  function loadYt() {
    if (ytApi) return ytApi;
    return (ytApi = new Promise(function (res) {
      if (window.YT && YT.Player) return res(YT);
      window.onYouTubeIframeAPIReady = function () { res(YT); };
      document.head.appendChild(el("script", { src: "https://www.youtube.com/iframe_api" }));
    }));
  }
  function ytSource(id) {
    var host = el("div", { class: "yt-host" }), box = el("div"), p = null, queued = [];
    host.appendChild(box);
    loadYt().then(function (YT) {
      p = new YT.Player(box, { videoId: id, width: "100%", height: "100%", playerVars: { rel: 0, playsinline: 1, iv_load_policy: 3, cc_load_policy: 0, modestbranding: 1 },
        events: { onReady: function () { queued.forEach(function (f) { f(); }); queued = []; } } });
    });
    function call(f) { if (p && p.getPlayerState) f(); else queued.push(f); }
    return { node: host,
      time: function () { return p && p.getCurrentTime ? p.getCurrentTime() : 0; },
      paused: function () { return !(p && p.getPlayerState && p.getPlayerState() === 1); },
      seek: function (t) { call(function () { p.seekTo(t, true); }); }, play: function () { call(function () { p.playVideo(); }); },
      pause: function () { call(function () { p.pauseVideo(); }); }, rate: function (r) { call(function () { p.setPlaybackRate(r); }); },
      onTick: function (fn) { var t = setInterval(function () { if (!host.isConnected && p) { clearInterval(t); return; } fn(); }, 150); } };
  }

  function player(s, cov, known) {
    var st = JA.app.state(), m = s.yt ? ytSource(s.yt) : fileSource(s.videoUrl), video = m.node;
    var sub = el("div", { class: "sub-line", lang: "ja", "aria-live": "off" });
    var cur = s.cur || 0, loop = false, subs = s.subs || "show", answered = {};
    function cue() { return s.cues[cur]; }
    function rubyLine(i) {
      var frag = el("span"), r = s.out[i];
      r.tokens.forEach(function (t) {
        var hasKanji = /[㐀-鿿]/.test(t.s), unknownWord = isContent(t) && !knows(known, t);
        if (hasKanji && (st.furigana === "all" || (st.furigana !== "none" && unknownWord)))
          frag.appendChild(el("ruby", {}, [t.s, el("rt", { text: t.kana || t.pron || "" })]));
        else frag.appendChild(document.createTextNode(t.s));
      });
      return frag;
    }
    function showSub() {
      var now = m.time() - off(), inCue = function (c) { return now >= c.start - 0.05 && now <= c.end + 0.3; };
      var i = cue() && inCue(cue()) ? cur : s.cues.findIndex(inCue); // the line being practised wins an overlap
      sub.innerHTML = "";
      if (i < 0 && m.paused() && answered[cur]) i = cur; // keep an answered line on screen
      if (i < 0) return;
      if (subs === "hide" || (subs === "dictation" && !answered[i])) { sub.appendChild(el("span", { class: "muted", text: subs === "dictation" ? "(type what you hear below)" : "" })); return; }
      sub.appendChild(rubyLine(i));
    }
    function playLine(i) {
      cur = Math.max(0, Math.min(s.cues.length - 1, i)); s.cur = cur;
      m.seek(Math.max(0, cue().start + off() - 0.15)); m.play();
      lineInfo(); dict.reset();
    }
    s.seek = function (i) { playLine(i); video.scrollIntoView({ block: "nearest" }); };
    m.onTick(function () {
      showSub();
      var c = cue(); if (!c || m.paused()) return;
      if (m.time() - off() > c.end + 0.25) { if (loop) m.seek(Math.max(0, c.start + off() - 0.15)); else m.pause(); }
    });
    // subtitles from another release run early or late: nudge them (kept for this episode only)
    function off() { return s.offset || 0; }
    var offOut = el("span", { class: "mono muted small", "aria-live": "polite" });
    function offText() { offOut.textContent = "Subs " + (off() >= 0 ? "+" : "") + off().toFixed(1) + " s"; }
    var nudge = el("div", { class: "row", role: "group", "aria-label": "Subtitle timing" }, [
      el("button", { class: "btn mini", type: "button", "aria-label": "Subtitles earlier by half a second", onclick: function () { s.offset = off() - 0.5; offText(); showSub(); } }, ["− 0.5 s"]),
      offOut,
      el("button", { class: "btn mini", type: "button", "aria-label": "Subtitles later by half a second", onclick: function () { s.offset = off() + 0.5; offText(); showSub(); } }, ["+ 0.5 s"])
    ]);
    offText();
    var info = el("div", { class: "line-info" });
    function lineInfo() {
      info.innerHTML = "";
      var l = cov.lines[cur];
      info.appendChild(el("span", { class: "mono muted", text: "Line " + (cur + 1) + " of " + s.cues.length + " · " + fmt(cue().start) }));
      if (l.unknown.length) info.appendChild(el("span", { class: "chip" + (l.unknown.length === 1 ? " ready" : ""), lang: "ja", text: "new: " + l.unknown.join("、") }));
    }
    var speed = el("button", { class: "btn mini", type: "button", "aria-pressed": "false", onclick: function (e) { var slow = e.currentTarget.getAttribute("aria-pressed") !== "true"; m.rate(slow ? 0.75 : 1); e.currentTarget.setAttribute("aria-pressed", String(slow)); } }, ["0.75×"]);
    var loopBtn = el("button", { class: "btn mini", type: "button", "aria-pressed": "false", onclick: function (e) { loop = !loop; e.currentTarget.setAttribute("aria-pressed", String(loop)); if (loop && m.paused()) playLine(cur); } }, ["Loop line"]);
    var subsGroup = el("div", { class: "row", role: "group", "aria-label": "Subtitles" }, [["show", "Subtitles"], ["hide", "Hidden"], ["dictation", "Dictation"]].map(function (o) {
      return el("button", { class: "btn mini", type: "button", "aria-pressed": String(subs === o[0]), onclick: function () { subs = s.subs = o[0]; Array.prototype.forEach.call(subsGroup.children, function (b, k) { b.setAttribute("aria-pressed", String(k === ["show", "hide", "dictation"].indexOf(o[0]))); }); dict.node.hidden = subs !== "dictation"; showSub(); } }, [o[1]]);
    }));

    // dictation on the current line: hear it, type it, the sub appears once answered
    var dict = (function () {
      var inp = el("input", { type: "text", class: "ans", lang: "ja", autocomplete: "off", "aria-label": "What did they say?" }), res = el("div", { class: "verdict", role: "status" });
      function check() {
        if (!inp.value.trim()) return;
        var k = kanaOf(s.out[cur]), r = JA.valid.check("dictation", inp.value, { target: k.target, alt: k.alt.concat([s.cues[cur].text]) });
        var v = { correct: "✓ Correct", accepted: "✓ Accepted", near: "≈ Nearly", wrong: "✗ Not quite" }[r.verdict];
        res.className = "verdict v-" + r.verdict; res.innerHTML = "";
        res.appendChild(el("b", { text: v })); if (r.diagnosis) res.appendChild(el("p", { text: r.diagnosis.explain }));
        res.appendChild(el("p", { lang: "ja", text: s.cues[cur].text }));
        answered[cur] = true; showSub();
      }
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
      var node = el("div", { class: "dict", hidden: subs !== "dictation" }, [el("div", { class: "row" }, [inp, el("button", { class: "btn primary", type: "button", onclick: check }, ["Check"])]), res]);
      return { node: node, reset: function () { inp.value = ""; res.innerHTML = ""; res.className = "verdict"; } };
    })();

    // shadowing: record yourself right after the line, then compare by ear
    var mine = null;
    var shadowBtn = el("button", { class: "btn mini", type: "button", onclick: function (e) {
      var b = e.currentTarget; if (!JA.audio) return;
      b.textContent = "■ Recording…"; b.setAttribute("data-rec", "1");
      var c = cue(), rc = JA.audio.record({ maxMs: (c.end - c.start + 1.5) * 1000 });
      rc.done.then(function (r) { mine = URL.createObjectURL(r.blob); b.textContent = "● Shadow again"; b.removeAttribute("data-rec"); mineBtn.disabled = false; }, function (err) { b.textContent = "Microphone unavailable"; b.removeAttribute("data-rec"); });
    } }, ["● Shadow"]);
    var mineBtn = el("button", { class: "btn mini", type: "button", disabled: true, onclick: function () { if (mine) new Audio(mine).play(); } }, ["▶ Mine"]);

    var canCut = !!(video.captureStream || video.mozCaptureStream);
    var saveBtn = el("button", { class: "btn mini", type: "button", disabled: s.yt || !canCut ? true : null, title: s.yt ? "Saving a line needs a video file: an embed cannot be cut" : !canCut ? "This browser can't cut clips (Safari can't) — use Chrome" : null, onclick: function (e) {
      var b = e.currentTarget, c = cue(), k = kanaOf(s.out[cur]);
      if (s.yt) { b.textContent = "Clips need a video file"; return; }
      if (!(video.captureStream || video.mozCaptureStream)) { b.textContent = "This browser can't cut clips — use Chrome"; return; }
      b.disabled = true; b.textContent = "Saving the line…"; loop = false; loopBtn.setAttribute("aria-pressed", "false");
      captureLine(video, { start: c.start + off(), end: c.end + off() }).then(function (blob) {
        var id = "c" + Date.now().toString(36);
        return clips.put({ id: id, text: c.text, kana: k.target, alt: k.alt, blob: blob, from: { name: s.videoName || s.name, start: c.start, end: c.end }, at: Date.now() });
      }).then(indexClips).then(function () { b.textContent = "✓ Saved"; JA.app.announce("Line saved on this device"); setTimeout(function () { JA.app.draw(); }, 600); }, function (err) { b.disabled = false; b.textContent = "Could not save: " + err.message; });
    } }, ["Save this line"]);

    var ctrls = el("div", { class: "pctrl" }, [
      el("button", { class: "btn", type: "button", "aria-label": "Previous line", onclick: function () { playLine(cur - 1); } }, ["⏮"]),
      el("button", { class: "btn primary", type: "button", onclick: function () { playLine(cur); } }, ["▶ Line"]),
      el("button", { class: "btn", type: "button", "aria-label": "Next line", onclick: function () { playLine(cur + 1); } }, ["⏭"]),
      loopBtn, speed, subsGroup, shadowBtn, mineBtn, saveBtn, nudge
    ]);
    setTimeout(lineInfo, 0);
    return el("section", { class: "card player", "aria-label": "Player" }, [el("div", { class: "screen" }, [video, sub]), info, ctrls, dict.node]);
  }

  /* Saved lines: practise them, add them to reviews (a listening facet), or delete them. */
  function clipsCard() {
    var st = JA.app.state(), ids = Object.keys(JA.clipIndex);
    var box = el("section", { class: "card", "aria-labelledby": "cl-h" }, [el("h2", { id: "cl-h", text: "Saved lines" })]);
    if (!ids.length) { box.appendChild(el("p", { class: "muted small", text: "Lines you save from an episode appear here, ready to review by ear." })); return box; }
    box.appendChild(el("ul", { class: "clips" }, ids.map(function (id) {
      var c = JA.clipIndex[id], fk = "x:" + id + "|L", inReviews = !!st.facets[fk];
      return el("li", {}, [
        el("div", { class: "ja", lang: "ja", text: c.text }),
        el("div", { class: "muted small", text: c.from ? c.from.name + " · " + fmt(c.from.start) : "" }),
        el("div", { class: "row wrap" }, [
          el("button", { class: "btn mini", type: "button", onclick: function () { new Audio(c.url).play(); } }, ["▶ Play"]),
          el("button", { class: "btn mini", type: "button", disabled: inReviews ? true : null, onclick: function () { st.facets = JA.srs.introduce(st.facets, "x:" + id, JA.app.today()); JA.app.save(); JA.app.draw(); } }, [inReviews ? "✓ In reviews" : "Add to reviews"]),
          el("button", { class: "btn mini danger", type: "button", onclick: function () {
            if (!confirm("Delete this saved line from this device?")) return;
            clips.del(id).then(indexClips).then(function () { Object.keys(st.facets).forEach(function (k) { if (k.indexOf("x:" + id + "|") === 0) delete st.facets[k]; }); JA.app.save(); JA.app.draw(); });
          } }, ["Delete"])
        ])
      ]);
    })));
    return box;
  }

  JA.media = { view: view, parseSubs: parseSubs, parseTranscript: parseTranscript, ytId: ytId, coverage: coverage, kanaOf: kanaOf, split: split, ready: ready0, clips: clips };
})();
