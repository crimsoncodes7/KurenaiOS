/* Kurenai OS — core/mindui.js (KOS.mindUI)
   Mind's shared components (design 32·kit), built once and used on every Mind page:
     ladder(lad, o)          a concept's ladder: four rising bars (small) or four rungs with their
                             evidence (o.large) — Recall · Explain · Apply · Evaluate, never a percentage
     pathLadder(counts, n)   how many concepts reach each rung, as four bars
     evidenceTag(tag, o)     Robust · Debated · Failed to replicate — a shape and a word, one neutral style
     finding(b)              an evidence card: the tag, the finding, one calm line, its source
     strip(plan, o)          the Daily 15 strip: three parts in proportion to their minutes
     kind(k, o)              a Journal kind: one glyph and the word, always together
     stories(text, o)        "For your stories" in the reading face, with Save to Journal
     slider(o)               the confidence slider, 50–99 %
     bullets(o)              the bullet box ("Bullets are fine. No word count.")
     argmap(o)               the Argument Mapper: an indented tree of claims joined by because · but ·
                             therefore; read-only as a figure, editable on a checkpoint
     std(o)                  an argument in standard form (numbered premises, ∴ the conclusion)
     scene(tree, o)          a Socratic dialogue in the VN scene (Kurenai and Ren over the art)
     avatar(who, face)       a speaker's face, cropped from the sprite
     sheet(o)                a Mind sheet dialog through KOS.ui.openDialog
   Pure presentation: reads through KOS.mind and writes nothing itself; callers own the writes.  */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var RUNG = ["Recall", "Explain", "Apply", "Evaluate"], RUNG_S = ["R", "E", "A", "Ev"];
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function reduced() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }

  /* ---------------- the ladder ---------------- */
  function ladderBars(level, o) {
    return el("span", { class: "k-mind-bars", "data-level": String(level), "aria-hidden": "true", "data-size": o && o.size || null }, [0, 1, 2, 3].map(function (i) {
      return el("i", { "data-state": i < level ? "on" : null });
    }));
  }
  function ladder(lad, o) {
    o = o || {};
    var level = lad ? lad.level : 0, name = level ? RUNG[level - 1] : "Not started";
    if (!o.large) {
      return el("span", { class: "k-mind-ladder", "data-ui": "mind.ladder", "data-level": String(level), role: "img", "aria-label": name + (lad && level ? ": the highest rung whose evidence holds" : "") }, [
        ladderBars(level), o.label === false ? null : el("span", { class: "k-mind-ladder-t", text: name })
      ].filter(Boolean));
    }
    var ev = [
      lad && lad.rungs[0] ? "cards holding" : lad && lad.rated ? lad.rated + " of " + lad.cards + " cards rated" : "cards from tomorrow",
      lad && lad.explain ? (lad.explain.of ? "explain-back, " + lad.explain.ticked + " of " + lad.explain.of + " points" : "checkpoint synthesis") : "an explain-back",
      lad && lad.apply ? lad.apply + (lad.apply === 1 ? " scenario right" : " scenarios right") : "a scenario answered",
      lad && lad.evaluate ? (lad.evaluate.lesson ? "a position with an objection answered" : "a checkpoint judgement") : "a position with an objection answered"
    ];
    return el("ol", { class: "k-mind-rungs", "data-ui": "mind.ladder-large", "aria-label": "Ladder: " + name }, RUNG.map(function (r, i) {
      var on = !!(lad && lad.rungs[i]);
      return el("li", { class: "k-mind-rung", "data-state": on ? "on" : null }, [
        el("b", {}, [el("span", { "aria-hidden": "true", text: on ? "✓ " : (i + 1) + " " }), r, el("span", { class: "sr-only", text: on ? ": reached" : ": not yet" })]),
        el("small", { text: ev[i] })
      ]);
    }));
  }
  function pathLadder(counts, n, o) {
    o = o || {};
    counts = counts || [0, 0, 0, 0];
    var max = Math.max(1, n || 0);
    return el("span", { class: "k-mind-pladder", "data-ui": "mind.path-ladder", role: "img",
      "aria-label": RUNG.map(function (r, i) { return counts[i] + " of " + (n || 0) + " at " + r; }).join(", ") },
      RUNG_S.map(function (s, i) {
        return el("span", { class: "k-mind-pladder-c" }, [
          el("i", { style: "--h: " + Math.round(100 * counts[i] / max) + "%" }),
          o.labels === false ? null : el("small", { "aria-hidden": "true", text: s })
        ].filter(Boolean));
      }));
  }

  /* ---------------- evidence tags (invariant 141) ---------------- */
  var TAGS = { robust: { t: "Robust", g: "■" }, debated: { t: "Debated", g: "◑" }, failed: { t: "Failed to replicate", g: "⊘" } };
  function evidenceTag(tag) {
    var T = TAGS[tag] || TAGS.debated;
    return el("span", { class: "k-mind-tag", "data-ui": "mind.evidence-tag", "data-tag": tag }, [el("span", { "aria-hidden": "true", text: T.g }), T.t]);
  }
  function finding(b) {
    return el("section", { class: "k-mind-finding", "data-ui": "mind.finding", "aria-label": (TAGS[b.tag] || TAGS.debated).t + ": " + b.t }, [
      el("div", { class: "k-mind-finding-h" }, [evidenceTag(b.tag), el("b", { text: b.t })]),
      el("p", { text: b.body }),
      b.src ? el("small", { class: "k-mind-finding-src", text: b.src }) : null
    ].filter(Boolean));
  }

  /* ---------------- the Daily 15 strip ---------------- */
  /* strip(plan, { done: { reviews, sitting, question }, now: "sitting" }) */
  function strip(plan, o) {
    o = o || {};
    var done = o.done || {};
    var parts = plan.exam ? [["reviews", "Reviews", 5]] : [["reviews", "Reviews", 4], ["sitting", "One sitting", 8], ["question", "One question", 3]];
    return el("div", { class: "k-mind-strip", "data-ui": "mind.daily-strip", role: "img",
      "aria-label": parts.map(function (p) { return p[1] + " " + p[2] + " minutes" + (done[p[0]] ? ", done" : o.now === p[0] ? ", now" : ""); }).join("; ") },
      parts.map(function (p) {
        var st = done[p[0]] ? "done" : o.now === p[0] ? "now" : null;
        return el("span", { class: "k-mind-strip-p", "data-part": p[0], "data-state": st, style: "--w: " + p[2] }, [
          el("i"), el("span", { class: "k-mind-strip-t" }, [st === "done" ? "✓ " : "", p[1], " ", el("span", { class: "k-mono", text: p[2] + "′" })])
        ]);
      }));
  }

  /* ---------------- Journal kinds ---------------- */
  var KINDS = { insight: ["✦", "Insight"], quote: ["❝", "Quote"], question: ["?", "Question"], position: ["◆", "Position"], reflection: ["≋", "Reflection"] };
  function kind(k, o) {
    var K = KINDS[k] || KINDS.insight;
    return el("span", { class: "k-mind-kind", "data-ui": "mind.kind", "data-kind": k }, [el("span", { class: "k-mind-kind-g", "aria-hidden": "true", text: K[0] }), o && o.word === false ? el("span", { class: "sr-only", text: K[1] }) : K[1]]);
  }

  /* ---------------- "For your stories" ---------------- */
  function stories(text, o) {
    o = o || {};
    var saved = !!o.saved;
    var btn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "mind.stories-save", text: saved ? "In your Journal ›" : "✦ Save to Journal",
      onclick: function () {
        if (saved) { KOS.show("mind", { page: "journal" }); return; }
        if (o.onSave) o.onSave(function () { saved = true; btn.textContent = "In your Journal ›"; announce("Saved to your Journal as an Insight."); });
      } });
    return el("aside", { class: "k-mind-stories", "data-ui": "mind.stories", "aria-label": "For your stories" }, [
      el("div", { class: "k-mind-stories-h" }, [el("i", { text: "For your stories" }), btn]),
      el("p", { class: "k-mind-read", text: text })
    ]);
  }

  /* ---------------- the confidence slider (50–99: no 100%, F2 says why) ---------------- */
  function slider(o) {
    o = o || {};
    var v = Math.max(50, Math.min(99, +o.value || 70));
    var out = el("strong", { class: "k-mind-slider-v k-mono", text: v + "%" });
    var input = el("input", { type: "range", min: "50", max: "99", step: "1", class: "k-mind-slider-in", "data-ui": "mind.confidence",
      "aria-label": "How sure are you?", "aria-valuetext": v + " percent",
      oninput: function () { v = +input.value; out.textContent = v + "%"; input.setAttribute("aria-valuetext", v + " percent"); if (o.onChange) o.onChange(v); } });
    input.value = String(v);
    return el("div", { class: "k-mind-slider", "data-ui": "mind.slider" }, [
      el("div", { class: "k-mind-slider-h" }, [el("span", { text: "How sure are you?" }), out]),
      input,
      el("div", { class: "k-mind-slider-s k-mono", "aria-hidden": "true" }, [el("span", { text: "50 · a coin flip" }), el("span", { text: "75" }), el("span", { text: "99 · near certain" })])
    ]);
  }

  /* ---------------- the bullet box ---------------- */
  /* bullets({ value: [..], onChange(list), label, placeholder }) → { node, value(), focus() } */
  function bullets(o) {
    o = o || {};
    var list = el("ul", { class: "k-mind-bullets", "data-ui": "mind.bullets", role: "list", "aria-label": o.label || "Bullets" });
    function rows() { return [].map.call(list.querySelectorAll("textarea"), function (t) { return t.value; }); }
    function emit() { if (o.onChange) o.onChange(rows().map(function (x) { return x.trim(); }).filter(Boolean)); }
    function fit(t) { t.style.blockSize = "auto"; t.style.blockSize = t.scrollHeight + "px"; }
    function add(text, after, focus) {
      var t = el("textarea", { class: "k-mind-bullet-in", rows: "1", "aria-label": "Bullet", placeholder: after || list.children.length ? "" : (o.placeholder || "Start with one bullet"),
        oninput: function () { fit(t); emit(); },
        onkeydown: function (e) {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add("", li, true); emit(); }
          else if (e.key === "Backspace" && !t.value && list.children.length > 1) { e.preventDefault(); var prev = li.previousElementSibling || li.nextElementSibling; li.remove(); emit(); if (prev) prev.querySelector("textarea").focus(); }
        } });
      t.value = text || "";
      var li = el("li", { class: "k-mind-bullet" }, [el("span", { class: "k-mind-bullet-d", "aria-hidden": "true", text: "•" }), t]);
      if (after && after.nextSibling) list.insertBefore(li, after.nextSibling); else list.appendChild(li);
      requestAnimationFrame(function () { fit(t); });
      if (focus) t.focus();
      return t;
    }
    (o.value && o.value.length ? o.value : [""]).forEach(function (b) { add(b); });
    var node = el("div", { class: "k-mind-bulletbox" }, [list,
      el("div", { class: "k-mind-bulletbox-f" }, [el("small", { class: "k-muted", text: "Bullets are fine. No word count." }),
        el("button", { type: "button", class: "k-link", text: "Enter new bullet", onclick: function () { add("", list.lastElementChild, true); } })])]);
    return { node: node, value: function () { return rows().map(function (x) { return x.trim(); }).filter(Boolean); }, focus: function () { var t = list.querySelector("textarea"); if (t) t.focus(); } };
  }

  /* ---------------- the argument tree (32r) ---------------- */
  var JOINT = { because: ["↳", "because"], but: ["↯", "but"], therefore: ["∴", "therefore"] };
  /* argmap({ rows: [{ t, j, d }], edit, onChange(rows), caption }) — rows in reading order; d is the
     depth (0 = a conclusion), j how a row joins its parent. Editing: drag or Space-lift a row
     (KOS.ui.reorder), Tab / Shift-Tab indent, J cycles the joint; on touch, tap a row and use
     Up · Down · Out · In. A row with no parent is a second conclusion, and the map says so. */
  function argmap(o) {
    o = o || {};
    var rows = (o.rows || []).map(function (r, i) { return { id: r.id || "r" + i, t: r.t, j: r.d ? (r.j || "because") : null, d: Math.max(0, r.d | 0) }; });
    var box = el("div", { class: "k-mind-map", "data-ui": "mind.argmap", "data-state": o.edit ? "edit" : null });
    var sel = null;
    function emit() { if (o.onChange) o.onChange(rows.map(function (r) { return { id: r.id, t: r.t, j: r.j, d: r.d }; })); }
    function clampDepths() { rows.forEach(function (r, i) { var max = i ? rows[i - 1].d + 1 : 0; r.d = Math.max(0, Math.min(r.d, max)); r.j = r.d ? (r.j || "because") : null; }); }
    function say(r) { return r.d === 0 ? "a conclusion" : JOINT[r.j][1] + ", under \"" + parentOf(r).t.slice(0, 40) + "\""; }
    function parentOf(r) { var i = rows.indexOf(r); for (var k = i - 1; k >= 0; k--) if (rows[k].d < r.d) return rows[k]; return null; }
    function draw(focusId) {
      clampDepths();
      box.innerHTML = "";
      var list = el("ol", { class: "k-mind-map-list", role: o.edit ? "list" : null, "aria-label": o.caption || "Argument map" });
      rows.forEach(function (r) {
        var j = r.j ? JOINT[r.j] : null;
        var li = el("li", { class: "k-mind-map-row", "data-rid": r.id, "data-depth": String(r.d), style: "--d: " + r.d, "data-state": sel === r.id ? "selected" : null }, [
          o.edit ? el("button", { type: "button", class: "k-mind-map-grip", "data-reorder": "", "aria-label": "Move: " + r.t, text: "⠿" }) : null,
          j ? el("span", { class: "k-mind-map-j", "data-joint": r.j }, [el("span", { "aria-hidden": "true", text: j[0] + " " }), j[1]]) : el("span", { class: "k-mind-map-j", "data-joint": "conclusion", text: "conclusion" }),
          o.edit ? el("button", { type: "button", class: "k-mind-map-t", "aria-pressed": String(sel === r.id), text: r.t,
            onclick: function () { sel = sel === r.id ? null : r.id; draw(r.id); },
            onkeydown: function (e) { key(e, r); } }) : el("span", { class: "k-mind-map-t", text: r.t })
        ].filter(Boolean));
        list.appendChild(li);
      });
      box.appendChild(list);
      var tops = rows.filter(function (r) { return r.d === 0; }).length;
      if (o.edit && tops > 1) box.appendChild(el("p", { class: "k-mind-map-warn", role: "note", text: "Two conclusions: is that right? Indent a row (Tab, or → In) to make it a reason." }));
      if (o.edit) {
        var cur = rows.filter(function (r) { return r.id === sel; })[0];
        box.appendChild(el("div", { class: "k-mind-map-tools", role: "group", "aria-label": cur ? "Move: " + cur.t : "Select a claim to move it" }, [
          el("span", { class: "k-mind-map-hint", text: cur ? "Moving: \"" + cur.t.slice(0, 48) + (cur.t.length > 48 ? "…" : "") + "\"" : "Tap a claim, then move it. Keys: Tab / ⇧Tab indent · Alt ↑↓ move · J joint." }),
          btn("↑ Up", function () { move(cur, -1); }, !cur), btn("↓ Down", function () { move(cur, 1); }, !cur),
          btn("← Out", function () { indent(cur, -1); }, !cur), btn("→ In", function () { indent(cur, 1); }, !cur),
          btn(cur && cur.j ? "Joint: " + JOINT[cur.j][1] : "Joint", function () { joint(cur); }, !cur || !cur.d)
        ]));
        KOS.ui.reorder(list, { rows: "[data-rid]", label: function (row) { var r = byId(row.getAttribute("data-rid")); return r ? r.t : "Claim"; },
          onDrop: function (row, l, index) { var r = byId(row.getAttribute("data-rid")); rows.splice(rows.indexOf(r), 1); rows.splice(index, 0, r); emit(); draw(r.id); } });
      }
      if (o.caption) box.appendChild(el("p", { class: "k-mind-map-cap", text: o.caption }));
      if (focusId) { var f = box.querySelector("[data-rid='" + focusId + "'] .k-mind-map-t"); if (f && f.focus) f.focus(); }
    }
    function btn(t, fn, dis) { return el("button", { type: "button", class: "k-btn k-btn--sm", disabled: dis ? "" : null, text: t, onclick: fn }); }
    function byId(id) { return rows.filter(function (r) { return r.id === id; })[0]; }
    function move(r, dir) {
      if (!r) return; var i = rows.indexOf(r), j = i + dir; if (j < 0 || j >= rows.length) return;
      rows.splice(i, 1); rows.splice(j, 0, r); emit(); draw(r.id); announce("Moved to " + (j + 1) + " of " + rows.length + ", " + say(r) + ".");
    }
    function indent(r, dir) {
      if (!r) return; var i = rows.indexOf(r), max = i ? rows[i - 1].d + 1 : 0;
      var d = Math.max(0, Math.min(max, r.d + dir)); if (d === r.d) return;
      r.d = d; if (d && !r.j) r.j = "because"; emit(); draw(r.id); announce("Now " + say(r) + ".");
    }
    function joint(r) {
      if (!r || !r.d) return; var order = ["because", "but", "therefore"];
      r.j = order[(order.indexOf(r.j) + 1) % order.length]; emit(); draw(r.id); announce("Joint changed to " + r.j + ".");
    }
    function key(e, r) {
      if (e.key === "Tab") { e.preventDefault(); indent(r, e.shiftKey ? -1 : 1); }
      else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); move(r, e.key === "ArrowUp" ? -1 : 1); }
      else if (e.key === "j" || e.key === "J") { e.preventDefault(); joint(r); }
    }
    draw();
    box.value = function () { return rows.map(function (r) { return { id: r.id, t: r.t, j: r.j, d: r.d }; }); };
    return box;
  }
  function std(o) {
    var n = 0;
    return el("figure", { class: "k-mind-std", "data-ui": "mind.std" }, [
      el("ol", { class: "k-mind-std-p" }, (o.premises || []).map(function (p) { n++; return el("li", {}, [el("span", { class: "k-mono", text: "P" + n }), p]); })
        .concat(o.hidden ? [el("li", { "data-state": "hidden" }, [el("span", { class: "k-mono", text: "P" + (n + 1) }), el("span", {}, [o.hidden, el("small", { text: " the hidden premise" })])])] : [])),
      el("p", { class: "k-mind-std-c" }, [el("span", { class: "k-mono", "aria-hidden": "true", text: "∴" }), el("span", { class: "sr-only", text: "Therefore: " }), o.conclusion])
    ]);
  }

  /* ---------------- the speakers ---------------- */
  var IMG = "assets/mind/img/";
  var CAST = { kurenai: { name: "Kurenai", faces: ["neutral", "thinking", "pleased", "curious"] },
    ren: { name: "Ren", full: "藤宮 蓮", faces: ["neutral", "amused", "thinking", "sceptical", "surprised", "conceding", "serious", "pleased"] } };
  function faceSrc(who, face) { return IMG + (face && face !== "neutral" && CAST[who] && CAST[who].faces.indexOf(face) > 0 ? "mind.face." + who + "." + face : "mind.base." + who + ".a") + ".webp"; }
  function avatar(who, face) {
    return el("span", { class: "k-mind-avatar", "data-who": who, "aria-hidden": "true" }, [el("img", { src: faceSrc(who, face), alt: "", loading: "lazy" })]);
  }

  /* ---------------- the Socratic dialogue in the VN scene (32i–32j) ----------------
     scene(tree, { at, path, onTurn(state), onEnd(summary, path), bg }) — the place (node and the
     path taken) is the caller's to keep (per device), so leaving mid-tree resumes at that turn. */
  function scene(tree, o) {
    o = o || {};
    var T = KOS.mindTree, at = o.at && tree.nodes[o.at] ? o.at : tree.start, path = (o.path || []).slice();
    var lines = [];
    var stage = el("div", { class: "k-mind-vn", "data-ui": "mind.scene", role: "group", "aria-label": "Dialogue: " + (tree.title || "") });
    stage.appendChild(el("img", { class: "k-mind-vn-bg", src: IMG + (o.bg || "mind.bg.study") + ".webp", alt: "" }));
    var slots = {};
    ["kurenai", "ren"].forEach(function (who) {
      var used = Object.keys(tree.nodes).some(function (k) { return tree.nodes[k].who === who; });
      if (!used) return;
      var a = el("img", { src: faceSrc(who), alt: "", "data-state": "on" }), b = el("img", { src: faceSrc(who), alt: "" });
      var w = el("div", { class: "k-mind-vn-chara", "data-who": who, "data-side": who === "kurenai" ? "left" : "right" }, [a, b]);
      stage.appendChild(w);
      slots[who] = { wrap: w, imgs: [a, b], face: "neutral" };
    });
    var plate = el("div", { class: "k-mind-vn-name" });
    var text = el("p", { class: "k-mind-vn-text k-mind-read", "aria-live": "polite" });
    var choices = el("div", { class: "k-mind-vn-choices", role: "group", "aria-label": "Your answer" });
    var box = el("div", { class: "k-mind-vn-box" }, [plate, text]);
    var tools = el("div", { class: "k-mind-vn-tools" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "mind.scene-backlog", "aria-expanded": "false", text: "Backlog", onclick: function (e) {
        var open = backlog.hidden; backlog.hidden = !open; e.currentTarget.setAttribute("aria-expanded", String(open)); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "mind.scene-skip", text: "Skip to summary", onclick: function () { finish(true); } })
    ]);
    var backlog = el("ol", { class: "k-mind-vn-backlog", hidden: "" });
    var wrap = el("div", { class: "k-mind-dialogue", "data-ui": "mind.dialogue" }, [stage, el("div", { class: "k-mind-vn-under" }, [choices, tools]), backlog]);
    stage.appendChild(box);
    function face(who, f) {
      var sl = slots[who]; if (!sl) return; f = f || "neutral"; if (sl.face === f) return;
      var nx = sl.imgs[0].getAttribute("data-state") === "on" ? 1 : 0;
      sl.imgs[nx].src = faceSrc(who, f);
      var swap = function () { sl.imgs[nx].setAttribute("data-state", "on"); sl.imgs[1 - nx].removeAttribute("data-state"); };
      if (sl.imgs[nx].complete) swap(); else sl.imgs[nx].onload = swap;
      sl.face = f;
    }
    function logLine(who, t) { lines.push([who, t]); backlog.appendChild(el("li", {}, [el("b", { text: (who === "you" ? "You" : CAST[who].name) + ": " }), t])); }
    function show(id, quiet) {
      at = id;
      var n = tree.nodes[id];
      Object.keys(slots).forEach(function (w) { KOS.ui.state(slots[w].wrap, "dim", w !== n.who); });
      face(n.who, n.face);
      plate.textContent = CAST[n.who].name;
      text.textContent = n.say;
      logLine(n.who, n.say);
      choices.innerHTML = "";
      if (!quiet) announce(CAST[n.who].name + ": " + n.say);
      if (n.end) { finish(false); return; }
      n.choices.forEach(function (c, i) {
        choices.appendChild(el("button", { type: "button", class: "k-mind-vn-choice", "data-ui": "mind.scene-choice", onclick: function () { pick(i, c.t); } }, [
          el("span", { class: "k-mono", "aria-hidden": "true", text: String(i + 1) }), c.t]));
      });
      var typed = el("input", { type: "text", class: "k-mind-vn-typed", "aria-label": "Type your own answer", placeholder: "✎ Type your own",
        oninput: function () { var m = T.match(n, typed.value); closest.textContent = typed.value.trim() ? (m ? "Closest: \"" + n.choices[m.index].t + "\"" : "Closest: none of these") : ""; },
        onkeydown: function (e) { if (e.key === "Enter" && typed.value.trim()) { e.preventDefault(); var m = T.match(n, typed.value); pick(m ? m.index : -1, typed.value.trim()); } } });
      var closest = el("small", { class: "k-mind-vn-closest", "aria-live": "polite" });
      choices.appendChild(el("div", { class: "k-mind-vn-type" }, [typed, el("button", { type: "button", class: "k-btn k-btn--sm", text: "Use it",
        onclick: function () { if (!typed.value.trim()) { typed.focus(); return; } var m = T.match(n, typed.value); pick(m ? m.index : -1, typed.value.trim()); } }), closest]));
    }
    function pick(i, said) {
      logLine("you", said);
      announce("You: " + said);
      path.push({ node: at, index: i });
      var next = T.step(tree, at, i);
      if (o.onTurn) o.onTurn({ at: next, path: path.slice() });
      show(next);
    }
    function finish(skipped) {
      choices.innerHTML = "";
      tools.hidden = true;
      var sum = T.summary(tree, path);
      if (o.onEnd) o.onEnd(sum, path.slice(), skipped);
    }
    /* a resumed dialogue redraws its earlier lines into the backlog without speaking them */
    path.forEach(function (p) { var n = tree.nodes[p.node], c = T.choiceAt(tree, p.node, p.index); if (n) logLine(n.who, n.say); if (c) logLine("you", c.t || "(your own words)"); });
    show(at, true);
    return wrap;
  }

  /* ---------------- a Mind sheet ---------------- */
  /* sheet({ title, kicker, body: [nodes], foot: [nodes], wide, onClose }) → { overlay, box, close } */
  function sheet(o) {
    var title = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: o.title });
    var closeBtn = el("button", { type: "button", class: "k-iconbtn", "aria-label": "Close", text: "✕" });
    var box = el("div", { class: "k-dialog k-mind-sheet", "data-ui": "mind.sheet " + (o.hook || ""), "data-size": o.wide ? "wide" : null }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("div", {}, [o.kicker ? el("span", { class: "k-kicker", text: o.kicker }) : null, title].filter(Boolean)), closeBtn]),
      el("div", { class: "k-mind-sheet-body" }, o.body || []),
      o.foot ? el("div", { class: "k-dialog-foot" }, o.foot) : null
    ].filter(Boolean));
    var overlay = el("div", { class: "k-dialog-overlay", onclick: function (e) { if (e.target === overlay && o.scrimCloses !== false) close(); } }, [box]);
    var done = false;
    function close() { if (done) return; done = true; overlay.remove(); if (o.onClose) o.onClose(); }
    overlay.close = close;
    closeBtn.onclick = close;
    KOS.ui.openDialog(overlay, { labelledBy: title, initialFocus: o.initialFocus || null });
    return { overlay: overlay, box: box, close: close };
  }

  KOS.mindUI = { RUNG: RUNG, RUNG_S: RUNG_S, TAGS: TAGS, KINDS: KINDS, JOINT: JOINT, CAST: CAST, IMG: IMG,
    ladder: ladder, ladderBars: ladderBars, pathLadder: pathLadder, evidenceTag: evidenceTag, finding: finding, strip: strip, kind: kind,
    stories: stories, slider: slider, bullets: bullets, argmap: argmap, std: std, avatar: avatar, faceSrc: faceSrc, scene: scene, sheet: sheet };
})();
