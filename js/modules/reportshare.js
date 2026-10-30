/* Kurenai OS — modules/reportshare.js
   Reports (roadmap 5.1, frame 24k): the share card and the export dialog.

   SHARE CARD. 1080 × 1350, the 22d finish the Shrine card wears: the gold
   conic rim (--card-foil-*), lacquer (--card-gold-bg), gold mono figures
   and the 週報 seal. Colours are tokens read from the one place colour
   lives; the card is an export, so it keeps them whatever the theme.

   EXPORT. One dialog (KOS.ui.openDialog; a sheet on the phone): Share card
   PNG (the default), PDF of the whole report (the browser's print, with
   the app's chrome hidden), Text, CSV. Include: Collection titles — OFF by
   default, a title list is the user's to share — Kurenai's words, level
   and streak. The primary button says what it will do. Everything is made
   on this device from the saved report: no request leaves it.          */
(function () {
  "use strict";
  var el = KOS.ui.el, W = KOS.reportWords;
  var CARD_W = 1080, CARD_H = 1350;
  var MINCHO = "'Shippori Mincho', 'Hiragino Mincho ProN', serif";
  var MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
  var UI = "Onest, system-ui, sans-serif";
  var SEAL = { week: "週報", month: "月報", term: "期報", year: "年報" };
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function token(name) {
    try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); } catch (e) { return ""; }
  }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function rangeText(start, end) {
    var a = parse(start), b = parse(end);
    return (a.getMonth() === b.getMonth() ? a.getDate() : a.getDate() + " " + MON3[a.getMonth()]) + " – " + b.getDate() + " " + MON3[b.getMonth()] + " " + b.getFullYear();
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function lines(ctx, text, maxW) {
    var words = String(text || "").split(/\s+/), out = [], line = "";
    words.forEach(function (w) {
      var next = line ? line + " " + w : w;
      if (line && ctx.measureText(next).width > maxW) { out.push(line); line = w; } else line = next;
    });
    if (line) out.push(line);
    return out;
  }
  /* the six figures a card (and the recap) shows, zero rule applied */
  function figures(f, opts) {
    var s = f.study, out = [[W.hm(s.mins), "studied"]];
    if (s.recall != null) out.push([s.recall + "%", "recall"]);
    if (f.collection && f.collection.count) out.push([W.num(f.collection.count), f.collection.count === 1 ? "title" : "titles"]);
    if (f.focus && f.focus.blocks) out.push([String(f.focus.blocks), "Focus blocks"]);
    if (f.plan) out.push([f.plan.ticked + "/" + f.plan.planned, "plan rows"]);
    if (opts.level !== false && f.gov.streak) out.push([String(f.gov.streak), "day streak"]);
    if (s.toGreen && out.length < 6) out.push([String(s.toGreen), "to Green"]);
    return out.slice(0, 6);
  }

  /* opts: {titles, words, level} → a canvas */
  function card(rep, opts) {
    opts = opts || {};
    var f = rep.facts, w = opts.words === false ? W.template(f) : W.current(rep);
    var canvas = document.createElement("canvas");
    canvas.width = CARD_W; canvas.height = CARD_H;
    var ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    var gold = token("--card-gold-accent"), bg = token("--card-gold-bg"), ivory = token("--card-ivory"),
      meta = token("--card-meta"), faint = token("--card-faint");
    var foil = [1, 2, 3, 4, 5, 1].map(function (n) { return token("--card-foil-" + n); });
    /* the rim */
    var rim = ctx.createConicGradient ? ctx.createConicGradient(200 * Math.PI / 180, CARD_W / 2, CARD_H / 2) : null;
    if (rim) foil.forEach(function (c, i, all) { rim.addColorStop(i / (all.length - 1), c); });
    roundRect(ctx, 0, 0, CARD_W, CARD_H, 60);
    ctx.fillStyle = rim || gold;
    ctx.fill();
    /* the lacquer */
    roundRect(ctx, 9, 9, CARD_W - 18, CARD_H - 18, 52);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.save();
    roundRect(ctx, 9, 9, CARD_W - 18, CARD_H - 18, 52);
    ctx.clip();
    var glow = ctx.createRadialGradient(CARD_W * 0.5, -80, 40, CARD_W * 0.5, -80, CARD_H * 0.7);
    glow.addColorStop(0, gold.replace(/\)\s*$/, " / 0.22)"));
    glow.addColorStop(1, gold.replace(/\)\s*$/, " / 0)"));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.restore();
    var L = 84, R = CARD_W - 84;
    ctx.textBaseline = "top";
    /* the seal */
    roundRect(ctx, L, 84, 128, 128, 26);
    ctx.fillStyle = gold;
    ctx.fill();
    ctx.fillStyle = bg;
    ctx.font = "800 54px " + MINCHO;
    ctx.textAlign = "center";
    var seal = SEAL[f.period] || "週報";
    ctx.fillText(seal.charAt(0), L + 64, 96);
    ctx.fillText(seal.charAt(1), L + 64, 150);
    ctx.textAlign = "left";
    ctx.fillStyle = gold;
    ctx.font = "600 26px " + MONO;
    ctx.fillText("KURENAIOS · " + (f.period === "week" ? "WEEK" : String(f.period).toUpperCase()) + " IN REVIEW", L + 160, 104);
    ctx.fillStyle = meta;
    ctx.font = "500 30px " + MONO;
    ctx.fillText(rangeText(f.start, f.end), L + 160, 148);
    /* the headline */
    ctx.fillStyle = ivory;
    ctx.font = "700 64px " + UI;
    var hl = lines(ctx, w.headline, R - L).slice(0, 4), y = 290;
    hl.forEach(function (ln) { ctx.fillText(ln, L, y); y += 78; });
    /* the figures */
    var figs = figures(f, opts), top = Math.max(y + 50, 640), colW = (R - L) / 2;
    figs.forEach(function (fg, i) {
      var x = L + (i % 2) * colW, yy = top + Math.floor(i / 2) * 150;
      ctx.fillStyle = gold;
      ctx.font = "500 72px " + MONO;
      ctx.fillText(fg[0], x, yy);
      ctx.fillStyle = faint;
      ctx.font = "500 24px " + MONO;
      ctx.fillText(fg[1].toUpperCase(), x, yy + 88);
    });
    var after = top + Math.ceil(figs.length / 2) * 150 + 10;
    /* the hairline, then earnings / titles */
    var hair = ctx.createLinearGradient(L, 0, R, 0);
    hair.addColorStop(0, gold);
    hair.addColorStop(1, gold.replace(/\)\s*$/, " / 0)"));
    ctx.fillStyle = hair;
    ctx.fillRect(L, after, R - L, 2);
    ctx.fillStyle = meta;
    ctx.font = "500 30px " + UI;
    var foot = [];
    if (opts.level !== false && f.gov.xp) foot.push("Earned +" + W.num(f.gov.xp) + " XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : ""));
    if (opts.level !== false && f.gov.level) foot.push("Level " + f.gov.level);
    if (foot.length) ctx.fillText(foot.join(" · "), L, after + 28);
    if (opts.titles && f.collection && f.collection.titles.length) {
      ctx.fillStyle = ivory;
      ctx.font = "500 28px " + UI;
      var ty = after + (foot.length ? 84 : 28);
      f.collection.titles.slice(0, Math.max(0, Math.floor((CARD_H - (opts.badges && showcaseDefs().length ? 290 : 150) - ty) / 40))).forEach(function (t) {
        var txt = t.title + (t.range ? " · " + t.range : "");
        while (txt.length > 4 && ctx.measureText(txt).width > R - L) txt = txt.slice(0, -2);
        ctx.fillText(txt, L, ty); ty += 40;
      });
    }
    /* the Badge Wall's showcase (roadmap 5.16): off by default, up to six */
    if (opts.badges) drawShowcase(ctx, L, R, CARD_H - 250, gold, bg, ivory);
    ctx.fillStyle = faint;
    ctx.font = "500 24px " + MONO;
    ctx.fillText("KURENAIOS", L, CARD_H - 96);
    return canvas;
  }

  /* the showcase's pictures, loaded once; a medal with no art yet (or not
     loaded) is drawn as a gold-rimmed disc with its glyph */
  var showImgs = {};
  function showcaseDefs() {
    var A = KOS.achievements;
    return A ? A.showcase().map(function (id) { return A.def(id); }).filter(Boolean) : [];
  }
  function loadShowcase(done) {
    var defs = showcaseDefs(), left = 0;
    defs.forEach(function (d) {
      var src = KOS.achUI && KOS.achUI.artSrc(d);
      if (!src || showImgs[d.id]) return;
      left++;
      var im = new window.Image();
      im.onload = im.onerror = function () { if (--left === 0 && done) done(); };
      im.src = src;
      showImgs[d.id] = im;
    });
    if (!left && done) done();
  }
  function drawShowcase(ctx, L, R, y, gold, bg, ivory) {
    var defs = showcaseDefs();
    if (!defs.length) return;
    var size = 120, gap = (R - L - size * 6) / 5, A = KOS.achievements;
    defs.forEach(function (d, i) {
      var x = L + i * (size + gap), cx = x + size / 2, cy = y + size / 2, im = showImgs[d.id];
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, size / 2, 0, Math.PI * 2); ctx.fillStyle = gold; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, size / 2 - 5, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
      if (im && im.complete && im.naturalWidth) {
        ctx.beginPath(); ctx.arc(cx, cy, size / 2 - 7, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(im, x + 7, y + 7, size - 14, size - 14);
      } else {
        var set = A && A.set(d.set);
        ctx.fillStyle = ivory; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "700 52px " + MINCHO;
        ctx.fillText(d.glyph || (set && set.glyph) || "章", cx, cy + 2);
        ctx.textAlign = "left"; ctx.textBaseline = "top";
      }
      ctx.restore();
    });
  }

  /* ---------------- text and CSV ---------------- */
  function asText(rep, opts) {
    var f = rep.facts, w = opts.words === false ? W.template(f) : W.current(rep), out = [];
    out.push("KurenaiOS · " + (f.period === "week" ? "Week" : f.period) + " in review · " + rangeText(f.start, f.end));
    out.push("");
    out.push(w.headline);
    if (w.narrative) { out.push(""); out.push(w.narrative); }
    out.push("");
    figures(f, opts).forEach(function (fg) { out.push(fg[1] + ": " + fg[0]); });
    if (f.study.topics.length) {
      out.push(""); out.push("Topics");
      f.study.topics.forEach(function (t) {
        out.push("- " + t.ref + " " + t.title + [t.mins ? W.hm(t.mins) : null, t.reviews ? t.reviews + " reviews" : null, t.recall != null ? t.recall + "% recall" : null].filter(Boolean).map(function (x) { return " · " + x; }).join(""));
      });
    }
    if (opts.titles && f.collection) {
      out.push(""); out.push("Collection");
      f.collection.titles.forEach(function (t) { out.push("- " + t.title + (t.range ? " · " + t.range : "") + (t.status && t.status !== "continued" ? " · " + t.status : "")); });
    }
    if (opts.level !== false && f.gov.xp) { out.push(""); out.push("Earned +" + f.gov.xp + " XP, +" + (f.gov.gold || 0) + " gold"); }
    if (rep.rebuilt) { out.push(""); out.push("Rebuilt from history."); }
    return out.join("\n") + "\n";
  }
  function csvCell(v) {
    var s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? "\"" + s.replace(/"/g, "\"\"") + "\"" : s;
  }
  function asCsv(rep, opts) {
    var f = rep.facts, s = f.study, rows = [["section", "item", "value"]];
    rows.push(["period", f.period, f.start + " to " + f.end]);
    rows.push(["study", "minutes", s.mins]);
    Object.keys(s.bySubject).forEach(function (k) { rows.push(["study", W.SUBJECT[k] + " minutes", s.bySubject[k]]); });
    rows.push(["study", "sessions", s.sessions]);
    rows.push(["study", "study days", s.days]);
    if (s.reviews) rows.push(["study", "reviews", s.reviews]);
    if (s.recall != null) rows.push(["study", "recall %", s.recall]);
    if (s.toGreen != null) rows.push(["study", "topics to Green", s.toGreen]);
    s.topics.forEach(function (t) { rows.push(["topic", t.ref + " " + t.title, [t.mins + " min", t.reviews + " reviews", t.recall != null ? t.recall + "%" : ""].filter(Boolean).join("; ")]); });
    if (f.focus.blocks) { rows.push(["focus", "blocks", f.focus.blocks]); rows.push(["focus", "minutes", f.focus.mins]); rows.push(["focus", "longest minutes", f.focus.longest]); }
    if (f.plan) { rows.push(["plan", "ticked", f.plan.ticked]); rows.push(["plan", "planned", f.plan.planned]); }
    if (f.collection) {
      rows.push(["collection", "titles", f.collection.count]);
      Object.keys(f.collection.byModule).forEach(function (m) { rows.push(["collection", m, f.collection.byModule[m]]); });
      if (opts.titles) f.collection.titles.forEach(function (t) { rows.push(["title", t.title, [t.module, t.range, t.status].filter(Boolean).join("; ")]); });
    }
    if (opts.level !== false) {
      if (f.gov.xp != null) rows.push(["governor", "XP earned", f.gov.xp]);
      if (f.gov.gold != null) rows.push(["governor", "gold earned", f.gov.gold]);
      if (f.gov.streak) rows.push(["governor", "study streak", f.gov.streak]);
    }
    return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\n") + "\n";
  }

  /* ---------------- saving ---------------- */
  function download(name, href) {
    var a = el("a", { href: href, download: name, class: "sr-only" });
    document.body.appendChild(a);
    try { a.click(); } catch (e) { /* a browser that will not follow it */ }
    a.remove();
  }
  function saveBlob(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type }));
    download(name, url);
    setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) { /* already gone */ } }, 4000);
  }
  function fileBase(rep) { return "kurenaios-" + rep.period + "-" + rep.start; }
  function printReport(rep) {
    var go = function () {
      document.documentElement.setAttribute("data-printing", "report");
      var done = function () { document.documentElement.removeAttribute("data-printing"); window.removeEventListener("afterprint", done); };
      window.addEventListener("afterprint", done);
      try { window.print(); } catch (e) { done(); }
    };
    var here = KOS.store.state.ui && KOS.store.state.ui.view === "reports" && /#\/reports\/[^/]+\/[^/]+$/.test(location.hash);
    if (!here) { KOS.show("reports", { period: rep.period, start: rep.start }); setTimeout(go, 600); } else go();
  }

  /* ---------------- the dialog (24k) ---------------- */
  var FORMATS = [
    { id: "png", label: "Share card", hint: "PNG · 1080 × 1350", action: "Save the share card" },
    { id: "pdf", label: "PDF", hint: "the whole report, printed", action: "Print or save as PDF" },
    { id: "text", label: "Text", hint: "plain text", action: "Save as text" },
    { id: "csv", label: "CSV", hint: "for a spreadsheet", action: "Save as CSV" }
  ];
  function dialog(rep, o) {
    var state = { format: (o && o.format) || "png", titles: false, words: true, level: true, badges: false };
    var overlay = el("div", { class: "k-dialog-overlay" });
    var box = el("div", { class: "k-dialog k-rp-export", "data-ui": "ui.dialog reports.export-dialog" });
    overlay.appendChild(box);
    var preview = el("div", { class: "k-rp-export-preview", "data-ui": "reports.export-preview" });
    var primary = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "reports.export-go", "data-intent": "primary", onclick: run });
    var formatList = el("div", { class: "k-rp-export-formats", role: "radiogroup", "aria-label": "Format" });
    function check(key, label, hint) {
      var input = el("input", { type: "checkbox", class: "k-rp-export-check", "data-ui": "reports.export-" + key });
      input.checked = state[key];
      input.addEventListener("change", function () { state[key] = input.checked; paint(); });
      return el("label", { class: "k-rp-export-opt" }, [input, el("span", {}, [el("b", { text: label }), hint ? el("span", { class: "k-rp-note", text: hint }) : null].filter(Boolean))]);
    }
    function paint() {
      formatList.textContent = "";
      FORMATS.forEach(function (fm) {
        var b = el("button", { type: "button", class: "k-rp-export-format", role: "radio", "aria-checked": String(state.format === fm.id), "data-ui": "reports.export-format",
          "data-format": fm.id, onclick: function () { state.format = fm.id; paint(); } }, [el("b", { text: fm.label }), el("span", { class: "k-rp-note", text: fm.hint })]);
        KOS.ui.state(b, "on", state.format === fm.id);
        formatList.appendChild(b);
      });
      primary.textContent = FORMATS.filter(function (fm) { return fm.id === state.format; })[0].action;
      preview.textContent = "";
      if (state.format === "png") {
        var c = card(rep, state), src = "";
        try { src = c.toDataURL("image/png"); } catch (e) { src = ""; }
        if (src) preview.appendChild(el("img", { class: "k-rp-export-img", src: src, alt: "The share card: " + (state.words ? W.current(rep) : W.template(rep.facts)).headline }));
      }
    }
    function run() {
      if (state.format === "png") {
        var src = "";
        try { src = card(rep, state).toDataURL("image/png"); } catch (e) { src = ""; }
        if (!src) { KOS.ui.toast("This browser could not draw the card."); return; }
        download(fileBase(rep) + ".png", src);
      } else if (state.format === "text") saveBlob(fileBase(rep) + ".txt", asText(rep, state), "text/plain;charset=utf-8");
      else if (state.format === "csv") saveBlob(fileBase(rep) + ".csv", asCsv(rep, state), "text/csv;charset=utf-8");
      else { overlay.remove(); printReport(rep); return; }
      KOS.a11y.announce("Saved.");
      overlay.remove();
    }
    box.appendChild(el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Share or export" })]));
    box.appendChild(el("div", { class: "k-dialog-body" }, [
      el("h3", { class: "k-rp-subhead", text: "Format" }), formatList,
      el("h3", { class: "k-rp-subhead", text: "Include" }),
      el("div", { class: "k-rp-export-checks" }, [
        check("titles", "Collection titles", "off by default: a title list is yours to share"),
        check("words", "Kurenai's words", "when Kurenai wrote them; otherwise the template's"),
        check("level", "Level and streak", null),
        /* the Badge Wall's showcase (5.16): only with one picked */
        KOS.achievements && KOS.achievements.showcase().length ? check("badges", "Showcase badges", "off by default: up to six from your Wall") : null
      ].filter(Boolean)),
      preview
    ]));
    box.appendChild(el("div", { class: "k-dialog-foot" }, [
      el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-close", text: "Cancel", onclick: function () { overlay.remove(); } }),
      primary
    ]));
    paint();
    loadShowcase(function () { if (state.badges) paint(); });
    KOS.ui.openDialog(overlay, { label: "Share or export", initialFocus: primary });
    return overlay;
  }

  KOS.reportShare = { card: card, asText: asText, asCsv: asCsv, dialog: dialog, figures: figures };
})();
