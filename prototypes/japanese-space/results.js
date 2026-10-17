/* Your part: the three tests only you can do, their progress, and one Download that hands the
   results over (docs/japanese-plan.md §16). Reads what speech.html, trace.html and Your media keep
   in this browser; writes nothing. Throwaway slice code. */
(function () {
  "use strict";
  var JA = window.JA, R = JA.results, K = R.KEYS;
  var app = document.getElementById("app"), live = document.getElementById("live");
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
  var SPEECH_N = 40, TRACE_N = 25;

  // saved clips live in Your media's own database (same schema, so opening it never breaks it)
  function clipCount() {
    return new Promise(function (res) {
      var r = indexedDB.open("kurenai-ja-slice-media", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("clips", { keyPath: "id" }); };
      r.onsuccess = function () { try { var q = r.result.transaction("clips").objectStore("clips").count(); q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(0); }; } catch (e) { res(0); } };
      r.onerror = function () { res(0); };
    });
  }

  function bar(n, of) { return el("div", { class: "yp-bar", role: "img", "aria-label": n + " of " + of }, [el("span", { style: "width:" + Math.round(100 * Math.min(1, n / of)) + "%" })]); }
  function status(done, total) { return done >= total ? el("span", { class: "chip done", text: "✓ Done" }) : done ? el("span", { class: "chip ready", text: done + " of " + total }) : el("span", { class: "chip wait", text: "Not started" }); }
  function facts(rows) { return el("dl", { class: "facts" }, rows.map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: r[1] })]); })); }

  function render(audioIds, clips) {
    var sp = R.read(K.speech, {}), tr = R.read(K.trace, {}), me = R.read(K.media, null);
    var spDone = Object.keys(sp.results || {}).length, trDone = Object.keys(tr.samples || {}).length;
    app.innerHTML = "";
    app.appendChild(el("header", { class: "ph" }, [el("div", {}, [
      el("h1", {}, [el("span", { class: "seal", lang: "ja", "aria-hidden": "true", text: "試" }), "Your part"]),
      el("div", { class: "sub", text: "Three tests only you can do. Use Chrome on this Mac for all three, so the results land in one place, then download them once." })
    ])]));

    var grid = el("div", { class: "yp" });
    grid.appendChild(el("section", { class: "card yp-card", "aria-labelledby": "s-h" }, [
      el("h2", { id: "s-h" }, ["1 · Speech", status(spDone, SPEECH_N)]),
      bar(spDone, SPEECH_N),
      el("ol", {}, [
        el("li", { text: "Press “Download and load” for Whisper (base, about 200 MB, once)." }),
        el("li", {}, ["Calibrate: say ", el("b", { lang: "ja", text: "ありがとうございます" }), " once at your normal speed."]),
        el("li", { text: "Record all 40. Red cards ask for a deliberate mistake: say exactly the wrong version shown." }),
        el("li", { text: "A quiet room and your normal voice. About 15 minutes." })
      ]),
      facts([["Recorded", spDone + " of " + SPEECH_N], ["Pace calibrated", sp.mora ? Math.round(sp.mora * 1000) + " ms a beat" : "not yet"], ["Recordings kept", String(audioIds.length)]]),
      el("a", { class: "btn primary", href: "speech.html" }, ["Open the speech test"])
    ]));
    grid.appendChild(el("section", { class: "card yp-card", "aria-labelledby": "t-h" }, [
      el("h2", { id: "t-h" }, ["2 · Handwriting", status(trDone, TRACE_N)]),
      bar(trDone, TRACE_N),
      el("ol", {}, [
        el("li", { text: "Write each kana with a trackpad, mouse or finger. ▶ Model shows the order." }),
        el("li", { text: "The first 15 properly; the last 10 wrong in the way each card says." }),
        el("li", { text: "Press “Check and save” on each. About 10 minutes." })
      ]),
      facts([["Saved", trDone + " of " + TRACE_N]]),
      el("a", { class: "btn primary", href: "trace.html" }, ["Open the handwriting test"])
    ]));
    var mDone = (me ? 1 : 0) + (me && me.video ? 1 : 0) + (clips ? 1 : 0);
    grid.appendChild(el("section", { class: "card yp-card", "aria-labelledby": "m-h" }, [
      el("h2", { id: "m-h" }, ["3 · Real media", status(mDone, 3)]),
      bar(mDone, 3),
      el("ol", {}, [
        el("li", { text: "Best: one anime episode as a video file you have, plus its Japanese subtitle file (.srt or .ass) matching that release." }),
        el("li", { text: "Or: a YouTube link with Japanese captions, and its transcript pasted in (no clip saving)." }),
        el("li", { text: "Open them in Your media, play a few lines, try Dictation, and save one line." })
      ]),
      el("ul", { class: "yp-check" }, [
        [!!me, "Subtitles opened", me ? (me.source === "youtube" ? "YouTube · " : "") + me.lines + " lines · " + me.coverage.pct + "% known" : "Your media → Subtitles"],
        [!!(me && me.video), "Video playing with them", me && me.video ? (me.source === "youtube" ? "YouTube" : "file") : "Your media → Video (either order)"],
        [clips > 0, "A line saved", clips ? clips + " saved" : me && me.source === "youtube" ? "needs a video file, not YouTube" : "player → Save this line"]
      ].map(function (r) { return el("li", { "data-done": r[0] ? "1" : null }, [el("span", { "aria-hidden": "true", text: r[0] ? "✓" : "○" }), el("b", { text: r[1] }), el("span", { class: "muted small", text: r[2] })]); })),
      el("p", { class: "muted small", text: "Results only show here in the browser you used — this page reads that browser's own storage." }),
      el("a", { class: "btn primary", href: "index.html#/media" }, ["Open Your media"])
    ]));
    app.appendChild(grid);

    var any = spDone || trDone || me;
    app.appendChild(el("section", { class: "card yp-send", "aria-labelledby": "d-h" }, [
      el("div", {}, [el("h2", { id: "d-h", class: "h-s", text: "Send it" }),
        el("p", { text: "Download saves one file, ja-slice-results-<date>.json, to your Downloads folder: the results, your speech recordings and handwriting strokes, and the media figures with how the first 60 lines were split. It never contains the video. Then just say “results are in Downloads” in the chat." })]),
      el("div", { class: "row wrap" }, [
        el("label", { class: "btn", for: "imp-in", title: "Merge a results file downloaded in another browser into this one" }, ["Bring in from another browser…"]),
        el("input", { type: "file", id: "imp-in", class: "sr", accept: ".json,application/json", onchange: function (e) { var f = e.currentTarget.files[0]; if (f) importFile(f); } }),
        el("button", { class: "btn primary", type: "button", disabled: any ? null : true, onclick: download }, ["Download results"])
      ])
    ]));
    app.appendChild(el("p", { class: "muted small", text: "Started in another browser? Download results there, then use “Bring in from another browser…” here: its handwriting, speech and media results are merged (the newer of two attempts at the same item wins)." }));
  }

  function download(e) {
    var b = e.currentTarget; b.disabled = true; b.textContent = "Packing…";
    R.allAudio().then(function (rows) {
      return clipCount().then(function (clips) {
        var out = {
          kind: "kurenai-ja-slice-results", v: 1, when: new Date().toISOString(), ua: navigator.userAgent,
          speech: Object.assign({}, R.read(K.speech, {}), { audio: rows.map(function (r) { return { id: r.id, sr: r.sr, at: r.at, pcm16le: R.b64(r.pcm) }; }) }),
          trace: R.read(K.trace, {}),
          media: R.read(K.media, null), clipsSaved: clips
        };
        var blob = new Blob([JSON.stringify(out)], { type: "application/json" });
        var a = el("a", { href: URL.createObjectURL(blob), download: "ja-slice-results-" + new Date().toISOString().slice(0, 10) + ".json" });
        document.body.appendChild(a); a.click(); a.remove();
        b.disabled = false; b.textContent = "Download again"; announce("Results downloaded (" + Math.round(blob.size / 1024) + " KB)");
      });
    });
  }

  /* Merge a downloaded results file into this browser: per item, the newer attempt wins. */
  function importFile(file) {
    file.text().then(function (txt) {
      var d = JSON.parse(txt);
      if (d.kind !== "kurenai-ja-slice-results") throw new Error("not a results file from this page");
      var newer = function (a, b) { return !a || (b && (b.at || 0) > (a.at || 0)); };
      var tr = R.read(K.trace, {}); tr.samples = tr.samples || {};
      var n = { trace: 0, speech: 0, audio: 0, media: 0 };
      Object.keys((d.trace && d.trace.samples) || {}).forEach(function (id) { var x = d.trace.samples[id]; if (newer(tr.samples[id], x)) { tr.samples[id] = x; n.trace++; } });
      localStorage.setItem(K.trace, JSON.stringify(tr));
      var sp = R.read(K.speech, {}); sp.results = sp.results || {};
      var inSp = d.speech || {};
      Object.keys(inSp.results || {}).forEach(function (id) { var x = inSp.results[id]; if (newer(sp.results[id], x)) { sp.results[id] = x; n.speech++; } });
      if (!sp.mora && inSp.mora) sp.mora = inSp.mora;
      localStorage.setItem(K.speech, JSON.stringify(sp));
      var me = R.read(K.media, null);
      if (d.media && (!me || (!me.video && d.media.video) || (me.video === d.media.video && d.media.at > me.at))) { localStorage.setItem(K.media, JSON.stringify(d.media)); n.media = 1; }
      return R.allAudio().then(function (have) {
        var at = {}; have.forEach(function (r) { at[r.id] = r.at || 0; });
        return Promise.all((inSp.audio || []).filter(function (a) { return !(a.id in at) || (a.at || 0) > at[a.id]; }).map(function (a) {
          n.audio++;
          var bin = atob(a.pcm16le), u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
          return R.putAudio16(a.id, new Int16Array(u8.buffer), a.at);
        }));
      }).then(function () {
        announce("Brought in " + n.trace + " handwriting, " + n.speech + " speech and " + n.audio + " recordings" + (n.media ? ", and the media result" : ""));
        return Promise.all([R.audioIds(), clipCount()]).then(function (r) { render(r[0], r[1]); });
      });
    }).catch(function (e) { alert("Could not bring that file in: " + e.message); });
  }

  Promise.all([R.audioIds(), clipCount()]).then(function (r) { render(r[0], r[1]); });
})();
