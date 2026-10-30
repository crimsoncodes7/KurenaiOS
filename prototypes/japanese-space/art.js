/* Art prompt sheet and contact sheet — throwaway slice tool (docs/japanese-plan.md §12.1).
   Reads art-source/ja/manifest.json, shows each asset's full Gemini prompt with the files to
   attach, and checks art-source/ja/inbox/ for what has been made. Review marks are per browser. */
(function () {
  "use strict";
  // another space's sheet sets window.ART_CFG before loading this script (prototypes/mind-space/art.html)
  var CFG = window.ART_CFG || {};
  var DIR = CFG.dir || "art-source/ja/";
  var ART = "../../" + DIR;
  var KEY = CFG.key || "ja-art-review", VIEW = KEY.replace(/review$/, "view");
  var M = null, have = {}, report = {}, view = localStorage.getItem(VIEW) || "todo", compare = null;
  var app = document.getElementById("app"), live = document.getElementById("live");

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function say(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }
  function review() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function setReview(id, v) {
    var r = review(); if (r[id] === v) delete r[id]; else r[id] = v;
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) {}
  }

  function file(a) { return a.id + ".png"; }
  function probe(path) {
    return new Promise(function (res) {
      var i = new Image();
      i.onload = function () { res({ w: i.naturalWidth, h: i.naturalHeight }); };
      i.onerror = function () { res(null); };
      i.src = ART + path + "?t=" + Date.now();
    });
  }
  function probeAll() {
    var paths = {};
    M.assets.forEach(function (a) { paths["inbox/" + file(a)] = 1; a.attach.forEach(function (p) { paths[p] = 1; }); });
    var list = Object.keys(paths);
    return Promise.all(list.map(probe)).then(function (rs) {
      have = {}; list.forEach(function (p, i) { if (rs[i]) have[p] = rs[i]; });
    });
  }

  function state(a) {
    if (have["inbox/" + file(a)]) return "done";
    var missing = a.attach.filter(function (p) { return !have[p]; });
    return missing.length ? "wait" : "ready";
  }
  function fullPrompt(a) {
    var body = a.prompt.replace(/\{look:(\w+)\}/g, function (_, w) { return M.cast[w].look; });
    var parts = [];
    if (a.style) parts.push(M.styles[a.style]);
    parts.push(body);
    if (a.aspect && a.aspect !== "same") parts.push("Aspect ratio " + a.aspect + (a.aspect === "2:3" || a.aspect === "3:4" ? " (portrait)." : " (landscape)."));
    if (!a.edit) parts.push(M.rules[0]);
    return parts.join("\n\n");
  }
  function copy(text, what) {
    var done = function () { say(what + " copied"); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() {
      var t = el("textarea", {}, []); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); done(); } catch (e) {} t.remove();
    }
  }

  function thumb(path, label) {
    var ok = have[path];
    return el("figure", { class: "att" + (ok ? "" : " missing") }, [
      ok ? el("a", { href: ART + path, target: "_blank", rel: "noopener" }, [el("img", { src: ART + path, alt: label, loading: "lazy" })])
         : el("div", { class: "ph-img", "aria-hidden": "true", text: "not made yet" }),
      el("figcaption", { class: "mono", text: path.replace(/^inbox\//, "") })
    ]);
  }

  // made, but the import (report.json) says to make it again: a "redo" grade or a low-resolution
  // draft — unless you have approved it by hand
  function importRedo(a) {
    var rep = report[a.id];
    // or the manifest's own review asks for it (`redo`: the reason, with the prompt rewritten)
    if (a.redo && review()[a.id] !== "ok") return true;
    return !!rep && review()[a.id] !== "ok" && (rep.grade === "redo" || /low resolution/.test(rep.note || ""));
  }
  function assetCard(a) {
    var st = state(a), rv = review()[a.id] || (importRedo(a) ? "redo" : undefined);
    var chip = st === "done" ? (rv === "redo" ? el("span", { class: "chip bad", text: "✗ Redo" }) : rv === "ok" ? el("span", { class: "chip done", text: "✓ Approved" }) : el("span", { class: "chip done", text: "✓ Made" }))
      : st === "ready" ? el("span", { class: "chip ready", text: "Ready to generate" })
      : el("span", { class: "chip wait", text: "Waiting for " + a.attach.filter(function (p) { return !have[p]; }).map(function (p) { return p.replace(/^inbox\/|\.png$/g, ""); }).join(", ") });
    var prompt = fullPrompt(a);
    var out = have["inbox/" + file(a)], rep = report[a.id];
    return el("article", { class: "card asset", "data-state": st, id: a.id }, [
      el("header", { class: "a-head" }, [
        el("div", {}, [
          el("h3", { class: "mono", text: a.id }),
          el("div", { class: "a-meta" }, [
            el("span", { text: a.kind + (a.who ? " · " + a.who : "") + " · " + (a.aspect === "same" ? "same size as the base" : a.aspect) }),
            a.edit ? el("span", { class: "chip", text: "Edit an image" }) : null
          ]),
          // a manifest may say where the image lands (the app-wide sheet, roadmap 5.13)
          a.where ? el("p", { class: "a-meta", text: "Where it goes: " + a.where + (a.size ? " · " + a.size : "") }) : null,
          a.redo ? el("p", { class: "a-meta", text: "Why it is redone: " + a.redo }) : null
        ]),
        chip
      ]),
      el("div", { class: "a-body" }, [
        el("div", { class: "a-steps" }, [
          el("ol", {}, [
            el("li", {}, [a.edit ? "Upload the image below to Gemini and ask it to edit it:" : "Attach these to a new Gemini chat:"]),
            el("li", {}, ["Paste the prompt, generate, and keep the best result."]),
            el("li", {}, ["Save it into ", el("code", { class: "mono", text: DIR + "inbox/" }), " as ",
              el("button", { class: "btn mini", type: "button", onclick: function () { copy(file(a), "File name"); }, "aria-label": "Copy file name " + file(a) }, [el("span", { class: "mono", text: file(a) }), " ⧉"])])
          ]),
          el("div", { class: "atts" }, a.attach.map(function (p) { return thumb(p, p); })),
          el("div", { class: "prompt" }, [
            el("pre", { class: "mono", text: prompt }),
            el("button", { class: "btn primary", type: "button", onclick: function () { copy(prompt, "Prompt for " + a.id); } }, ["Copy prompt"])
          ])
        ]),
        el("div", { class: "a-out" }, [
          out ? el("a", { href: ART + "inbox/" + file(a), target: "_blank", rel: "noopener" }, [el("img", { src: ART + "inbox/" + file(a) + "?t=" + Date.now(), alt: a.id })]) : el("div", { class: "ph-img big", text: "Result appears here once saved" }),
          out ? el("div", { class: "a-dims mono", text: out.w + " × " + out.h }) : null,
          rep && rep.grade ? el("div", { class: "a-dims" }, [el("span", { class: "chip " + (rep.grade === "ok" ? "done" : rep.grade === "slight" ? "ready" : "bad"), text: "body drift " + rep.bodyDrift + " · " + rep.grade })]) : null,
          rep && rep.note ? el("p", { class: "muted small", text: rep.note }) : null,
          out ? el("div", { class: "a-rev", role: "group", "aria-label": "Review " + a.id }, [
            el("button", { class: "btn ok", type: "button", "aria-pressed": String(rv === "ok"), onclick: function () { setReview(a.id, "ok"); render(); } }, ["✓ Approve"]),
            el("button", { class: "btn no", type: "button", "aria-pressed": String(rv === "redo"), onclick: function () { setReview(a.id, "redo"); render(); } }, ["✗ Redo"])
          ]) : null
        ])
      ])
    ]);
  }

  /* Contact sheet: each character's base with its expressions, plus a compare viewer that
     lays a face over the base so any drift in the body shows up before import. */
  /* an outfit is a base of its own ("kurenai-winter"), compared with its character's base */
  function baseOf(a) {
    var who = a.kind === "base" && !M.cast[a.who] ? a.who.split("-")[0] : a.who;
    return M.assets.filter(function (b) { return b.kind === "base" && b.who === who; })[0];
  }
  function contact() {
    var whos = Object.keys(M.cast);
    M.assets.forEach(function (a) { if (a.kind === "base" && whos.indexOf(a.who) === -1) whos.push(a.who); });
    var rows = whos.map(function (who) {
      var base = M.assets.filter(function (a) { return a.kind === "base" && a.who === who; })[0];
      var faces = M.assets.filter(function (a) { return a.kind === "face" && a.who === who; });
      // a character's row also carries its outfits; an outfit's own row appears once its faces do
      var outfits = M.cast[who] ? M.assets.filter(function (a) { return a.kind === "base" && a.who.split("-")[0] === who && a.who !== who; }) : [];
      var items = [base].concat(faces, outfits).filter(function (a) { return a && have["inbox/" + file(a)]; });
      if (!items.length || (!M.cast[who] && items.length < 2)) return null;
      var c = M.cast[who] || M.cast[who.split("-")[0]];
      var name = c ? c.name.split(" (") : [who, ""];
      return el("div", { class: "cs-row" }, [
        el("h4", {}, [el("span", { lang: "ja", text: name[0] }), " ", el("span", { class: "muted", text: M.cast[who] ? "(" + name[1] : "(" + who.split("-").slice(1).join(" ") + " outfit)" })]),
        el("div", { class: "cs-strip" }, items.map(function (a) {
          var isBase = a === base, against = baseOf(a);
          return el("button", { class: "cs-item", type: "button", "aria-pressed": String(compare === a.id), disabled: isBase || !against || !have["inbox/" + file(against)] ? true : null,
            onclick: function () { compare = compare === a.id ? null : a.id; render(); } }, [
            el("img", { src: ART + "inbox/" + file(a), alt: "" }),
            el("span", { text: isBase ? "base" : a.kind === "base" ? a.id.split(".").pop() + " outfit" : a.id.split(".").pop() })
          ]);
        }))
      ]);
    }).filter(Boolean);
    if (!rows.length) return null;
    var cmp = null;
    if (compare) {
      var f = M.assets.filter(function (a) { return a.id === compare; })[0];
      var b = baseOf(f), what = f.kind === "base" ? "the " + f.id.split(".").pop() + " outfit" : f.id.split(".").pop();
      var top = el("img", { class: "cmp-top", src: ART + "inbox/" + file(f), alt: "" });
      var flick = null;
      cmp = el("div", { class: "cmp card" }, [
        el("div", { class: "cmp-stage" }, [el("img", { src: ART + "inbox/" + file(b), alt: "Base pose" }), top]),
        el("div", { class: "cmp-ctl" }, [
          el("p", { text: f.kind === "base" ? "Slide between the base and " + what + ". Only the clothes should change; if the face, hair or pose move, the outfit's faces will drift with it, so a big change is worth a redo." : "Slide between the base and " + what + ". Only the face should change; if the hair, hands or outline move, the import keeps the base body and swaps the head alone, but a big drift is worth a redo." }),
          el("label", {}, ["Face opacity ", el("input", { type: "range", min: "0", max: "100", value: "100", oninput: function (e) { top.style.opacity = e.target.value / 100; } })]),
          el("button", { class: "btn", type: "button", onclick: function (e) {
            if (flick) { clearInterval(flick); flick = null; top.style.opacity = 1; e.target.textContent = "Flicker"; return; }
            flick = setInterval(function () { top.style.opacity = top.style.opacity === "0" ? 1 : 0; }, 450); e.target.textContent = "Stop";
          } }, ["Flicker"])
        ])
      ]);
    }
    return el("section", { class: "contact", "aria-labelledby": "cs-h" }, [
      el("h2", { id: "cs-h", text: "Contact sheet" }),
      el("div", { class: "cs-grid" }, [el("div", {}, rows), cmp])
    ]);
  }

  function render() {
    var total = M.assets.length, made = M.assets.filter(function (a) { return state(a) === "done"; }).length;
    var next = M.assets.filter(function (a) { return state(a) === "ready"; })[0];
    app.innerHTML = "";
    app.appendChild(el("header", { class: "ph" }, [
      el("div", {}, [
        el("h1", {}, [el("span", { class: "seal", lang: "ja", "aria-hidden": "true", text: "絵" }), "Art prompt sheet"]),
        el("div", { class: "sub", text: (CFG.what || "The vertical slice's art") + ": " + made + " of " + total + " made. Generate in the Gemini app, save into " + DIR + "inbox/, then Refresh." })
      ]),
      el("div", { class: "ph-act" }, [
        next ? el("a", { class: "btn primary", href: "#" + next.id, text: "Next: " + next.id }) : null,
        el("button", { class: "btn", type: "button", onclick: function () { probeAll().then(function () { render(); say("Refreshed"); }); } }, ["Refresh"])
      ])
    ]));

    app.appendChild(el("section", { class: "cast" }, Object.keys(M.cast).map(function (w) {
      var c = M.cast[w];
      return el("div", { class: "card cast-c" }, [
        el("h3", {}, [el("span", { lang: "ja", text: c.name.split(" (")[0] }), " ", el("span", { class: "muted", text: "(" + c.name.split(" (")[1] })]),
        el("p", { class: "role", text: c.role }),
        el("p", { class: "look", text: c.look })
      ]);
    }).concat([el("div", { class: "card cast-c rules" }, [el("h3", { text: "Every image" }), el("ul", {}, M.rules.map(function (r) { return el("li", { text: r }); }))])])));

    var cs = contact(); if (cs) app.appendChild(cs);

    var tabs = [["todo", "To do"], ["all", "All"], ["done", "Made"]];
    app.appendChild(el("div", { class: "tabs", role: "group", "aria-label": "Show" }, tabs.map(function (t) {
      return el("button", { class: "btn", type: "button", "aria-pressed": String(view === t[0]), onclick: function () { view = t[0]; try { localStorage.setItem(VIEW, view); } catch (e) {} render(); } }, [t[1]]);
    })));

    M.batches.forEach(function (b) {
      var list = M.assets.filter(function (a) {
        if (a.batch !== b.n) return false;
        var st = state(a);
        return view === "all" || (view === "done" ? st === "done" : st !== "done" || review()[a.id] === "redo" || importRedo(a));
      });
      if (!list.length) return;
      app.appendChild(el("section", { class: "batch" }, [
        el("div", { class: "b-head" }, [el("h2", { text: b.n + " · " + b.title }), el("p", { class: "muted", text: b.why })]),
        el("div", { class: "assets" }, list.map(assetCard))
      ]));
    });
  }

  fetch(ART + "manifest.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (m) {
    M = m;
    // the import's findings (art_import.py → art/report.json), when it has run
    return fetch("art/report.json?t=" + Date.now()).then(function (r) { return r.ok ? r.json() : { assets: {} }; }, function () { return { assets: {} }; })
      .then(function (r) { report = r.assets || {}; return probeAll(); });
  }).then(render).catch(function (e) {
    app.textContent = "Could not read " + DIR + "manifest.json — open this page through the dev server (" + e.message + ").";
  });
})();
