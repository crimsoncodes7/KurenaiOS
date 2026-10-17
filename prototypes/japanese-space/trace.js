/* The handwriting test (docs/japanese-plan.md §16: "stroke diagnosis catches order and direction
   errors on 20 traced samples"). 15 kana written properly, then 10 written wrong on purpose, each
   mistake labelled with what the checker should say. Every sample's strokes are kept, so the
   thresholds can be re-tuned on your real handwriting. Results stay in this browser (results.html
   downloads them). Throwaway slice code. */
(function () {
  "use strict";
  var JA = window.JA, KEY = "ja-trace-v1";
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

  // ---------- the script ----------
  var ITEMS = "あいうえおかきくけこさしすせそ".split("").map(function (ch, i) { return { id: "k" + (i + 1), ch: ch, ask: "Write " + ch + " properly.", expect: null }; });
  [["あ", "Draw the long vertical (stroke 2) BEFORE the top horizontal (stroke 1), then the loop.", "order"],
   ["い", "Draw the left stroke from the BOTTOM up.", "direction"],
   ["け", "Draw the two horizontal-ish strokes first, then the left vertical last.", "order"],
   ["き", "Leave out the second horizontal stroke.", "count"],
   ["く", "Draw it from the bottom end up to the top.", "direction"],
   ["さ", "Draw the bottom curve (stroke 3) before the vertical (stroke 2).", "order"],
   ["こ", "Draw the bottom stroke from RIGHT to left.", "direction"],
   ["お", "Leave out the dot.", "count"],
   ["せ", "Draw the long horizontal LAST instead of first.", "order"],
   ["し", "Draw it from the bottom (the end of the hook) up to the top.", "direction"]].forEach(function (m, i) {
    ITEMS.push({ id: "e" + (i + 1), ch: m[0], ask: m[1], expect: m[2] });
  });

  var st = (function () { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } })();
  st.samples = st.samples || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  var ok = function (v) { return v === "correct" || v === "accepted"; };

  function item(it) {
    var rec = st.samples[it.id];
    var pad = JA.writePad({ ch: it.ch, guide: false, label: "Writing square: " + it.ask });
    var res = el("p", { class: "verdict", "aria-live": "polite" });
    function show(r) {
      if (!r) { res.className = "verdict"; res.textContent = ""; return; }
      var good = it.expect ? !ok(r.verdict) : ok(r.verdict);
      var said = { correct: "Correct", accepted: "Accepted", near: "Nearly", wrong: "Wrong" }[r.verdict] + (r.diagnosis ? " — " + r.diagnosis.explain : r.note ? " — " + r.note : "");
      var reason = it.expect && r.diagnosis ? (r.diagnosis.code === it.expect ? " (right reason)" : " (caught, but as “" + r.diagnosis.code + "”, not “" + it.expect + "”)") : "";
      res.className = "verdict v-" + (good ? "correct" : "wrong");
      res.textContent = (good ? (it.expect ? "✓ Caught: " : "✓ Passed: ") : (it.expect ? "✗ Missed — the checker said: " : "✗ Rejected: ")) + said + reason;
    }
    show(rec && rec.result);
    if (rec) { pad.setStrokes(rec.strokes); pad.mark(rec.result); }
    var card = el("li", { class: "card tr-item", "data-mistake": it.expect ? "1" : null, id: it.id }, [
      el("div", { class: "tr-head" }, [
        el("span", { class: "mono muted", text: it.id }),
        it.expect ? el("span", { class: "chip bad", text: "Deliberate mistake · " + it.expect }) : el("span", { class: "chip", text: "Proper" }),
        rec ? el("span", { class: "chip done", text: "✓ Saved" }) : null
      ]),
      el("p", { class: "tr-ask" }, [el("b", { class: "tr-ch", lang: "ja", text: it.ch }), " " + it.ask]),
      el("div", { class: "tr-pad" }, [pad.node]),
      el("div", { class: "row wrap" }, [
        el("button", { class: "btn", type: "button", onclick: function () { pad.animate(); } }, ["▶ Model"]),
        el("button", { class: "btn", type: "button", onclick: function () { pad.undo(); } }, ["Undo"]),
        el("button", { class: "btn", type: "button", onclick: function () { pad.clear(); show(null); } }, ["Clear"]),
        el("button", { class: "btn primary", type: "button", onclick: function () {
          var strokes = pad.strokes(); if (!strokes.length) { res.className = "verdict"; res.textContent = "Write it first."; return; }
          var r = JA.stroke.check(it.ch, strokes); pad.mark(r);
          st.samples[it.id] = { ch: it.ch, expect: it.expect, strokes: strokes, result: { verdict: r.verdict, diagnosis: r.diagnosis || null, note: r.note || null, perStroke: r.perStroke }, at: Date.now() };
          save(); show(st.samples[it.id].result); summary(); announce("Saved " + it.id);
          var head = card.querySelector(".tr-head"); if (!head.querySelector(".chip.done")) head.appendChild(el("span", { class: "chip done", text: "✓ Saved" }));
        } }, ["Check and save"])
      ]),
      res
    ]);
    return card;
  }

  var sum = el("section", { class: "card tr-sum", "aria-labelledby": "sum-h" });
  function summary() {
    sum.innerHTML = "";
    var proper = ITEMS.filter(function (i) { return !i.expect; }), wrong = ITEMS.filter(function (i) { return i.expect; });
    var got = function (l) { return l.filter(function (i) { return st.samples[i.id]; }); };
    var p = got(proper), w = got(wrong);
    var pass = p.filter(function (i) { return ok(st.samples[i.id].result.verdict); }).length;
    var caught = w.filter(function (i) { return !ok(st.samples[i.id].result.verdict); });
    var reason = caught.filter(function (i) { var d = st.samples[i.id].result.diagnosis; return d && d.code === i.expect; }).length;
    sum.appendChild(el("h2", { id: "sum-h", text: "So far" }));
    sum.appendChild(el("dl", { class: "facts" }, [
      ["Saved", (p.length + w.length) + " of " + ITEMS.length],
      ["Proper kana passed", p.length ? pass + " of " + p.length : "—"],
      ["Mistakes caught", w.length ? caught.length + " of " + w.length : "—"],
      ["…for the right reason", caught.length ? reason + " of " + caught.length : "—"]
    ].map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: r[1] })]); })));
    sum.appendChild(el("div", { class: "row wrap" }, [
      el("a", { class: "btn", href: "results.html" }, ["‹ Back to Your part"]),
      el("button", { class: "btn", type: "button", onclick: function () { if (confirm("Clear every saved sample?")) { st.samples = {}; save(); render(); } } }, ["Clear all"])
    ]));
  }

  function render() {
    app.innerHTML = "";
    app.appendChild(el("header", { class: "ph" }, [el("div", {}, [
      el("h1", {}, [el("span", { class: "seal", lang: "ja", "aria-hidden": "true", text: "書" }), "Handwriting test"]),
      el("div", { class: "sub", text: "Write with a mouse, trackpad or finger. ▶ Model shows the stroke order. The first 15 should be right; the last 10 are wrong on purpose." })
    ])]));
    var grid = el("div", { class: "tr-layout" });
    var list = el("ol", { class: "tr-list" }, ITEMS.map(item));
    summary();
    grid.appendChild(list); grid.appendChild(sum);
    app.appendChild(grid);
  }
  render();
})();
