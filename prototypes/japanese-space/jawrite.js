/* The writing pad: a genkō-yōshi square in KanjiVG's 109 × 109 space, drawn with any pointer.
   JA.writePad({ch, guide}) → {node, strokes(), clear(), undo(), mark(result), animate()}.
   Throwaway slice code (docs/japanese-plan.md §7.2 stroke, §14 motifs). */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};
  var NS = "http://www.w3.org/2000/svg";
  function s(tag, attrs) { var n = document.createElementNS(NS, tag); for (var k in attrs) n.setAttribute(k, attrs[k]); return n; }
  var reduce = G.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function writePad(opts) {
    var ch = opts.ch, paths = (JA.strokes && JA.strokes[ch]) || [];
    var svg = s("svg", { viewBox: "0 0 109 109", class: "pad", role: "img", "aria-label": opts.label || "Writing square for " + ch });
    // the manuscript square: a frame and dashed centre guides
    svg.appendChild(s("rect", { x: 1, y: 1, width: 107, height: 107, rx: 3, class: "pad-frame" }));
    svg.appendChild(s("path", { d: "M54.5 4V105M4 54.5H105", class: "pad-guide" }));
    var guide = s("g", { class: "pad-ref" + (opts.guide ? " show" : "") });
    paths.forEach(function (d) { guide.appendChild(s("path", { d: d })); });
    svg.appendChild(guide);
    var anim = s("g", { class: "pad-anim" }); svg.appendChild(anim);
    var ink = s("g", { class: "pad-ink" }); svg.appendChild(ink);
    var marks = s("g", { class: "pad-marks" }); svg.appendChild(marks);

    var strokes = [], cur = null, curEl = null;
    function pt(e) {
      var m = svg.getScreenCTM().inverse(), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      var q = p.matrixTransform(m); return [Math.round(q.x * 10) / 10, Math.round(q.y * 10) / 10];
    }
    function d(points) { return points.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + p[1]; }).join(""); }
    svg.addEventListener("pointerdown", function (e) {
      if (svg.getAttribute("data-locked")) return;
      e.preventDefault(); svg.setPointerCapture(e.pointerId);
      cur = [pt(e)]; curEl = s("path", { d: d(cur) }); ink.appendChild(curEl);
    });
    svg.addEventListener("pointermove", function (e) { if (!cur) return; var p = pt(e), l = cur[cur.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 0.8) { cur.push(p); curEl.setAttribute("d", d(cur)); } });
    function up() { if (!cur) return; if (cur.length > 1) strokes.push(cur); else ink.removeChild(curEl); cur = null; curEl = null; if (opts.onChange) opts.onChange(strokes.length); }
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    svg.style.touchAction = "none";

    function redraw() { ink.innerHTML = ""; strokes.forEach(function (st) { ink.appendChild(s("path", { d: d(st) })); }); }
    return {
      node: svg,
      strokes: function () { return strokes.slice(); },
      setStrokes: function (list) { strokes = list.map(function (x) { return x.slice(); }); redraw(); },
      clear: function () { strokes = []; marks.innerHTML = ""; anim.innerHTML = ""; svg.removeAttribute("data-locked"); redraw(); if (opts.onChange) opts.onChange(0); },
      undo: function () { strokes.pop(); redraw(); if (opts.onChange) opts.onChange(strokes.length); },
      lock: function () { svg.setAttribute("data-locked", "1"); },
      /* After a check: each stroke coloured by its result, the model's numbered starts shown. */
      mark: function (res) {
        guide.classList.add("show");
        Array.prototype.forEach.call(ink.children, function (p, i) { var ps = res.perStroke && res.perStroke[i]; p.setAttribute("data-ok", ps ? (ps.ok ? "1" : "0") : "0"); });
        marks.innerHTML = "";
        paths.forEach(function (dd, i) {
          var p0 = JA.stroke.parse(dd)[0];
          marks.appendChild(s("circle", { cx: p0[0], cy: p0[1], r: 4.2 }));
          var t = s("text", { x: p0[0], y: p0[1] + 2.4 }); t.textContent = String(i + 1); marks.appendChild(t);
        });
      },
      /* Stroke-order animation of the model; with reduced motion, the finished glyph at once. */
      animate: function () {
        anim.innerHTML = "";
        paths.forEach(function (dd, i) {
          var p = s("path", { d: dd }); anim.appendChild(p);
          if (reduce) return;
          var L = p.getTotalLength();
          p.style.strokeDasharray = L; p.style.strokeDashoffset = L;
          p.style.transition = "stroke-dashoffset " + Math.max(0.35, L / 120) + "s ease " + (i * 0.75) + "s";
          requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = 0; }); });
        });
      }
    };
  }
  JA.writePad = writePad;
})(typeof window !== "undefined" ? window : globalThis);
