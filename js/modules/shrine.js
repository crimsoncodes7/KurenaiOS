/* Kurenai OS — modules/shrine.js
   祠 The Shrine: a module-agnostic Hall of Fame for favourite Collection
   entries (frame 11g), with an exportable crop-aware share card (11k). */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  /* ---------------- export-safe cover resolution ----------------
     The visible vault may already have cached a remote cover without CORS.
     Fetching its bytes with cache:"reload" and decoding a local blob avoids
     poisoning the export canvas. Hosts that genuinely deny CORS get an
     honest module-mark fallback. */
  function exportable(img) {
    try {
      var c = document.createElement("canvas");
      c.width = 8; c.height = 8;
      c.getContext("2d").drawImage(img, 0, 0);
      c.toDataURL("image/png");
      return true;
    } catch (taint) { return false; }
  }
  function loadImage(url, crossOrigin, cb) {
    var img = new Image(), settled = false;
    function done(ok) {
      if (settled) return;
      settled = true;
      cb(ok ? img : null);
    }
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = function () { done(img.naturalWidth > 0 && img.naturalHeight > 0); };
    img.onerror = function () { done(false); };
    img.src = url;
    if (img.complete && img.naturalWidth > 0) done(true);
  }
  function hostOf(url) {
    try { return new URL(url, location.href).hostname; }
    catch (e) { return "the cover host"; }
  }
  function fetchAsImage(url, cb) {
    if (typeof fetch !== "function" || typeof URL === "undefined" || !URL.createObjectURL) {
      cb(null);
      return;
    }
    var objectUrl = null;
    fetch(url, { mode: "cors", credentials: "omit", cache: "reload" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.blob();
      })
      .then(function (blob) {
        if (!blob || !/^image\//i.test(blob.type || "")) throw new Error("not an image");
        objectUrl = URL.createObjectURL(blob);
        loadImage(objectUrl, false, function (img) {
          if (!img) {
            URL.revokeObjectURL(objectUrl);
            cb(null);
            return;
          }
          cb(img, function () { URL.revokeObjectURL(objectUrl); });
        });
      })
      .catch(function () {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        cb(null);
      });
  }
  function resolveCover(entry, cb) {
    var url = String(entry.coverUrl || "").trim();
    if (!url) {
      cb(null, { reason: "none" });
      return;
    }
    if (/^(data|blob):/i.test(url)) {
      loadImage(url, false, function (img) {
        cb(img && exportable(img) ? img : null, img && exportable(img) ? { source: "local" } : { reason: "unreadable" });
      });
      return;
    }
    fetchAsImage(url, function (img, release) {
      if (img && exportable(img)) {
        cb(img, { source: "remote", release: release });
        return;
      }
      if (release) release();
      loadImage(url, true, function (corsImage) {
        if (corsImage && exportable(corsImage)) {
          cb(corsImage, { source: "remote" });
          return;
        }
        loadImage(url, false, function (plainImage) {
          cb(null, plainImage
            ? { reason: "cors", host: hostOf(url) }
            : { reason: "unreachable", host: hostOf(url) });
        });
      });
    });
  }
  /* the card sets its type in the app's own faces (index.html loads them);
     a canvas paints with whatever is resolved, so wait for them first */
  function whenFontsReady(cb) {
    if (!document.fonts || !document.fonts.ready) {
      cb();
      return;
    }
    var done = false;
    function go() {
      if (done) return;
      done = true;
      cb();
    }
    var requested = [document.fonts.ready];
    if (document.fonts.load) {
      requested.push(document.fonts.load("800 33px 'Shippori Mincho'"));
      requested.push(document.fonts.load("600 11px 'JetBrains Mono'"));
      requested.push(document.fonts.load("italic 400 14px 'Newsreader'"));
    }
    Promise.all(requested).then(go).catch(go);
    setTimeout(go, 1800);
  }

  /* ---------------- the share card (frame 11k) ----------------
     A 1080 × 1350 portrait with a foil edge, the 殿堂入り mark and a
     medallion score, in one of three styles. The palette is tokens
     (--card-*): the card is an export, so it keeps its own colours
     whatever the app theme, but it takes them from the one place colour
     lives. Every block can be switched off from the dialog. */
  var CARD_W = 1080, CARD_H = 1350, S = 2.5;
  var STYLES = [
    { id: "gold", label: "Gold" },
    { id: "crimson", label: "Crimson" },
    { id: "ink", label: "Ink" }
  ];
  var SHOW = [
    ["score", "Score"], ["rank", "Rank"], ["cover", "Cover"],
    ["message", "Message"], ["date", "Date added"], ["progress", "Progress"]
  ];
  var MINCHO = "'Shippori Mincho', 'Hiragino Mincho ProN', 'Yu Mincho', serif";
  var MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
  var READ = "'Newsreader', Georgia, serif";

  function token(name) {
    try { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
    catch (e) { return ""; }
  }
  /* the same colour at an alpha: oklch(L C H) → oklch(L C H / a) */
  function alpha(colour, a) {
    if (!colour || colour.indexOf("/") !== -1) return colour;
    return colour.replace(/\)\s*$/, " / " + a + ")");
  }
  function palette(look) {
    var id = STYLES.some(function (s) { return s.id === look; }) ? look : "gold";
    return {
      id: id,
      accent: token("--card-" + id + "-accent"),
      bg: token("--card-" + id + "-bg"),
      foil: [1, 2, 3, 4, 5, 1].map(function (n) { return token("--card-foil-" + n); }),
      ivory: token("--card-ivory"),
      meta: token("--card-meta"),
      quote: token("--card-quote"),
      faint: token("--card-faint"),
      shadow: token("--card-shadow")
    };
  }
  function spacing(ctx, em, size) {
    if ("letterSpacing" in ctx) ctx.letterSpacing = (em * size).toFixed(2) + "px";
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
  function lineSet(ctx, text, maxWidth) {
    var words = String(text || "").trim().split(/\s+/), lines = [], line = "";
    words.forEach(function (word) {
      var next = line ? line + " " + word : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    if (line) lines.push(line);
    return lines;
  }
  /* one line, shrunk to fit and then ellipsised */
  function fitLine(ctx, text, weight, family, size, min, maxWidth) {
    text = String(text || "");
    while (size > min) {
      ctx.font = weight + " " + size + "px " + family;
      if (ctx.measureText(text).width <= maxWidth) return text;
      size -= 2;
    }
    ctx.font = weight + " " + min + "px " + family;
    while (text.length > 1 && ctx.measureText(text + "…").width > maxWidth) text = text.slice(0, -1);
    return ctx.measureText(text).width <= maxWidth ? text : text + "…";
  }
  /* a cover into a box, honouring the stored crop (invariant 26c) */
  function drawCrop(ctx, entry, img, x, y, width, height) {
    var sourceW = img.naturalWidth || img.width || 0, sourceH = img.naturalHeight || img.height || 0;
    if (!sourceW || !sourceH) return;
    var crop = KOS.imageCrop.value(entry.coverCrop);
    var scale = Math.max(width / sourceW, height / sourceH) * crop.zoom;
    var sampleW = Math.min(sourceW, width / scale), sampleH = Math.min(sourceH, height / scale);
    ctx.drawImage(img, (sourceW - sampleW) * crop.x / 100, (sourceH - sampleH) * crop.y / 100,
      sampleW, sampleH, x, y, width, height);
  }
  function pad2(n) { return String(n).padStart(2, "0"); }
  function pad3(n) { return String(n).padStart(3, "0"); }
  function defaultMessage(entry) {
    return "“" + entry.title + "” earned its place in my KurenaiOS Hall of Fame.";
  }
  function creatorOf(entry) {
    return entry.author || entry.developer || (entry.extra && entry.extra.studio) || "";
  }
  function addedOn(entry) {
    if (!entry.createdAt) return null;
    var d = new Date(entry.createdAt);
    return isNaN(d) ? null : d;
  }
  /* "Anime · Madhouse · 28 / 28 ep · Completed" */
  function cardMeta(entry, withProgress) {
    var mod = KOS.media.module(entry.module);
    return [mod.label, creatorOf(entry),
      withProgress ? KOS.media.progressText(entry) : "",
      KOS.media.STATUS_LABEL[entry.status] || ""].filter(Boolean).join(" · ");
  }

  /* opts: { rank, total, message, look, show: {score, rank, cover,
     message, date, progress} } — a missing show key means shown */
  function renderCard(entry, coverImage, opts, cb) {
    opts = opts || {};
    var show = {};
    SHOW.forEach(function (s) { show[s[0]] = !opts.show || opts.show[s[0]] !== false; });
    var pal = palette(opts.look), mod = KOS.media.module(entry.module);
    var canvas = document.createElement("canvas");
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    var ctx = canvas.getContext("2d");
    var W = CARD_W, H = CARD_H, edge = 3 * S, inner = { x: edge, y: edge, w: W - edge * 2, h: H - edge * 2 };

    /* the foil edge: Gold is the iridescent sweep, the others one ink */
    var foil = pal.id === "gold" && ctx.createConicGradient ? ctx.createConicGradient(200 * Math.PI / 180, W / 2, H / 2) : null;
    if (foil) pal.foil.forEach(function (c, i, all) { foil.addColorStop(i / (all.length - 1), c); });
    roundRect(ctx, 0, 0, W, H, 22 * S);
    ctx.fillStyle = foil || pal.accent;
    ctx.fill();

    ctx.save();
    roundRect(ctx, inner.x, inner.y, inner.w, inner.h, 20 * S);
    ctx.clip();
    ctx.fillStyle = pal.bg;
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);

    /* the upper band: the cover, blurred and dimmed, under a glow */
    var bandH = inner.h * 0.62;
    if (show.cover && coverImage) {
      ctx.save();
      if ("filter" in ctx) ctx.filter = "blur(" + (8 * S) + "px)";
      ctx.globalAlpha = 0.5;
      drawCrop(ctx, entry, coverImage, inner.x, inner.y, inner.w, bandH);
      ctx.restore();
    }
    var glow = ctx.createRadialGradient(inner.x + inner.w * 0.7, inner.y + bandH * 0.3, 0,
      inner.x + inner.w * 0.7, inner.y + bandH * 0.3, 120 * S);
    if (glow) {
      glow.addColorStop(0, alpha(pal.accent, 0.22));
      glow.addColorStop(1, alpha(pal.accent, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(inner.x, inner.y, inner.w, bandH);
    }
    var fade = ctx.createLinearGradient(0, inner.y, 0, inner.y + bandH);
    fade.addColorStop(0, pal.bg);
    fade.addColorStop(0.18, alpha(pal.bg, 0));
    fade.addColorStop(0.45, alpha(pal.bg, 0));
    fade.addColorStop(1, pal.bg);
    ctx.fillStyle = fade;
    ctx.fillRect(inner.x, inner.y, inner.w, bandH);

    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    /* the rank numerals, outlined, behind the poster */
    if (show.rank) {
      ctx.font = "800 " + (112 * S) + "px " + MINCHO;
      spacing(ctx, -0.04, 112 * S);
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1.5 * S;
      ctx.strokeText(pad2(opts.rank || 1), 14 * S, 186 * S);
      spacing(ctx, 0, 0);
    }

    /* the poster */
    if (show.cover) {
      var px = 168 * S, py = 64 * S, pw = 150 * S, ph = 214 * S;
      ctx.save();
      ctx.shadowColor = pal.shadow;
      ctx.shadowBlur = 40 * S;
      ctx.shadowOffsetY = 18 * S;
      roundRect(ctx, px, py, pw, ph, 12 * S);
      ctx.fillStyle = pal.bg;
      ctx.fill();
      ctx.restore();
      ctx.save();
      roundRect(ctx, px, py, pw, ph, 12 * S);
      ctx.clip();
      if (coverImage) drawCrop(ctx, entry, coverImage, px, py, pw, ph);
      else {
        ctx.fillStyle = alpha(pal.accent, 0.12);
        ctx.fillRect(px, py, pw, ph);
        ctx.fillStyle = alpha(pal.accent, 0.4);
        ctx.font = "700 " + (72 * S) + "px " + MINCHO;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(mod.kanji, px + pw / 2, py + ph / 2);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
      }
      ctx.restore();
      roundRect(ctx, px, py, pw, ph, 12 * S);
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2 * S;
      ctx.stroke();
    }

    /* 殿堂入り, set vertically down the right edge */
    ctx.fillStyle = pal.accent;
    ctx.font = "700 " + (15 * S) + "px " + MINCHO;
    ctx.textAlign = "center";
    "殿堂入り".split("").forEach(function (ch, i) {
      ctx.fillText(ch, W - 16 * S - 7.5 * S, 20 * S + i * 15 * S * 1.35);
    });
    ctx.textAlign = "left";

    /* the hall line */
    ctx.font = "600 " + (9.5 * S) + "px " + MONO;
    spacing(ctx, 0.24, 9.5 * S);
    ctx.fillText("✿  KURENAI · PRIVATE HALL", 24 * S, 22 * S);
    spacing(ctx, 0, 0);

    /* the lower block, laid out from the bottom edge up */
    var left = 24 * S, right = W - 24 * S, rowBottom = H - 22 * S;
    var medal = show.score ? 78 * S : 0;
    var rowTop = rowBottom - Math.max(medal, 40 * S);
    var hairY = rowTop - 14 * S;
    var metaTop = hairY - 14 * S - 15 * S;
    var titleTop = metaTop - 6 * S - 35 * S;
    var rankTop = titleTop - 8 * S - 13 * S;

    if (show.rank) {
      ctx.fillStyle = pal.accent;
      ctx.font = "600 " + (11 * S) + "px " + MONO;
      spacing(ctx, 0.22, 11 * S);
      var no = opts.total ? " · NO. " + pad3(opts.rank || 1) + " / " + pad3(opts.total) : "";
      ctx.fillText("◆ RANK " + pad2(opts.rank || 1) + no, left, rankTop);
      spacing(ctx, 0, 0);
    }
    ctx.fillStyle = pal.ivory;
    ctx.fillText(fitLine(ctx, entry.title, "800", MINCHO, 33 * S, 20 * S, right - left), left, titleTop);
    ctx.fillStyle = pal.meta;
    ctx.fillText(fitLine(ctx, cardMeta(entry, show.progress), "400", "'Onest', system-ui, sans-serif", 11.5 * S, 9 * S, right - left), left, metaTop);

    var hair = ctx.createLinearGradient(left, 0, right, 0);
    hair.addColorStop(0, pal.accent);
    hair.addColorStop(1, alpha(pal.accent, 0));
    ctx.fillStyle = hair;
    ctx.fillRect(left, hairY, right - left, Math.max(1, S * 0.6));

    /* the message and the date, bottom-aligned beside the medallion */
    var textRight = right - (medal ? medal + 14 * S : 0);
    var lines = [], lineH = 14 * S * 1.45, dateH = show.date && addedOn(entry) ? 10 * S + 9 * S : 0;
    if (show.message) {
      ctx.font = "italic 400 " + (14 * S) + "px " + READ;
      /* a message is set in quotes unless it already opens with one (the
         default quotes the title) */
      var said = String(opts.message || defaultMessage(entry));
      lines = lineSet(ctx, /^["“]/.test(said) ? said : "“" + said + "”", textRight - left);
      if (lines.length > 3) {
        lines = lines.slice(0, 3);
        lines[2] = lines[2].replace(/[.,;:”]*$/, "…”");
      }
    }
    var y = rowBottom - lines.length * lineH - dateH;
    ctx.fillStyle = pal.quote;
    lines.forEach(function (line, i) { ctx.fillText(line, left, y + i * lineH); });
    if (dateH) {
      var d = addedOn(entry);
      ctx.fillStyle = pal.faint;
      ctx.font = "500 " + (8.5 * S) + "px " + MONO;
      spacing(ctx, 0.14, 8.5 * S);
      ctx.fillText("ADDED " + pad2(d.getDate()) + " · " + pad2(d.getMonth() + 1) + " · " + d.getFullYear() + " · KURENAIOS",
        left, rowBottom - 9 * S);
      spacing(ctx, 0, 0);
    }

    /* the medallion: a ring of ticks round the score */
    if (show.score) {
      var cx = right - medal / 2, cy = rowBottom - medal / 2, r = medal / 2;
      ctx.fillStyle = pal.accent;
      for (var a = 0; a < 360; a += 12) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, (a - 90) * Math.PI / 180, (a + 4 - 90) * Math.PI / 180);
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = pal.bg;
      ctx.fill();
      var score = Number(entry.score || 0);
      ctx.textAlign = "center";
      ctx.fillStyle = pal.accent;
      ctx.font = "600 " + (28 * S) + "px " + MONO;
      ctx.fillText(score ? String(score) : "—", cx, cy - 18 * S);
      ctx.fillStyle = pal.faint;
      ctx.font = "500 " + (6.5 * S) + "px " + MONO;
      spacing(ctx, 0.16, 6.5 * S);
      ctx.fillText("SCORE / 10", cx, cy + 13 * S);
      spacing(ctx, 0, 0);
      ctx.textAlign = "left";
    }
    ctx.restore();
    cb(canvas);
  }

  function saveCard(dataUrl, entry) {
    if (!dataUrl) {
      KOS.ui.toast("Could not render the image.", true);
      return;
    }
    var a = el("a", { href: dataUrl, download: "shrine_" + entry.title.replace(/[^\w]+/g, "_").slice(0, 40) + ".png" });
    document.body.appendChild(a);
    a.click();
    a.remove();
    KOS.ui.toast("Saved.");
  }
  function toBlobSafe(canvas, cb) {
    if (!canvas) {
      cb(null);
      return;
    }
    try { canvas.toBlob(function (blob) { cb(blob || null); }); }
    catch (err) { cb(null); }
  }
  function copyCard(canvas) {
    if (!navigator.clipboard || !window.ClipboardItem) {
      KOS.ui.toast("Copy is not supported here — use Save instead.", true);
      return;
    }
    toBlobSafe(canvas, function (blob) {
      if (!blob) {
        KOS.ui.toast("Could not copy.", true);
        return;
      }
      navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })])
        .then(function () { KOS.ui.toast("Card copied to the clipboard."); })
        .catch(function () { KOS.ui.toast("Copy blocked by the browser — use Save.", true); });
    });
  }
  function shareCard(canvas, entry, message) {
    toBlobSafe(canvas, function (blob) {
      if (!blob) {
        KOS.ui.toast("Could not render for sharing.", true);
        return;
      }
      var file = new File([blob], "shrine_" + entry.title.replace(/[^\w]+/g, "_").slice(0, 30) + ".png", { type: "image/png" });
      var data = { title: entry.title + " — Kurenai Shrine", text: message || defaultMessage(entry) };
      if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      navigator.share(data).catch(function () {});
    });
  }
  /* the share dialog (frame 11k): the card on the left, its controls on
     the right. Style, message and the Show switches are this card's
     choices, not preferences — nothing is written until Save, Copy or
     Share, and none of those touches the store. */
  function shrineCardModal(entry, rank, total) {
    var closed = false, release = null, coverImage = null, coverInfo = null;
    var currentCanvas = null, currentDataUrl = null, renderTimer = null;
    var choice = { look: "gold", show: {} };
    SHOW.forEach(function (s) { choice.show[s[0]] = true; });
    var mod = KOS.media.module(entry.module);
    var overlay = KOS.medview.modalOverlay(function () {
      closed = true;
      if (renderTimer) clearTimeout(renderTimer);
      if (release) release();
    });
    var preview = el("div", { class: "k-shr-preview", "aria-live": "polite" }, [
      el("p", { class: "k-muted", text: "Rendering your card…" })
    ]);
    var notice = el("div", { class: "k-shr-notice", "data-ui": "shrine.card-notice" });
    var message = el("textarea", { class: "k-input", "data-ui": "shrine.message", maxlength: "140", rows: "2" });
    message.value = defaultMessage(entry);
    function actionButton(text, cls, onclick) {
      return el("button", { type: "button", class: "k-btn" + (cls ? " " + cls : ""), text: text, disabled: "true", onclick: onclick });
    }
    var shareButton = navigator.share
      ? actionButton("⇪ Share", "", function () { shareCard(currentCanvas, entry, message.value); })
      : null;
    var copyButton = actionButton("Copy image", "", function () { copyCard(currentCanvas); });
    var saveButton = actionButton("⤓ Save PNG", "k-shr-gold", function () { saveCard(currentDataUrl, entry); });

    var styleGroup = el("div", { class: "k-shr-styles", role: "group", "aria-label": "Card style" },
      STYLES.map(function (s) {
        return el("button", { type: "button", class: "k-shr-style", "data-ui": "shrine.style", "data-style": s.id,
          "aria-pressed": String(s.id === choice.look), onclick: function () {
            choice.look = s.id;
            styleGroup.querySelectorAll("button").forEach(function (b) {
              b.setAttribute("aria-pressed", String(b.getAttribute("data-style") === s.id));
            });
            paint();
          } }, [
          el("span", { class: "k-shr-swatch", "aria-hidden": "true" }, [
            el("span", { class: "k-shr-swatch-num", text: pad2(rank || 1) })
          ]),
          el("span", { class: "k-shr-style-name", text: s.label })
        ]);
      }));
    var showGroup = el("div", { class: "k-shr-shows", role: "group", "aria-label": "Show on the card" },
      SHOW.map(function (s) {
        return el("button", { type: "button", class: "k-shr-show", "data-ui": "shrine.show",
          "aria-pressed": "true", text: s[1], onclick: function (ev) {
            choice.show[s[0]] = !choice.show[s[0]];
            ev.currentTarget.setAttribute("aria-pressed", String(choice.show[s[0]]));
            paint();
          } });
      }));

    overlay.appendChild(el("div", { class: "k-dialog k-shr-share", "data-ui": "ui.dialog shrine.share-dialog" }, [
      preview,
      el("div", { class: "k-shr-controls" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
          el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Share card" }),
          el("span", { class: "k-mchip", text: CARD_W + " × " + CARD_H }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close share card", onclick: overlay.close })
        ]),
        el("p", { class: "k-shr-lede", text: "A foil-edged card for rank " + pad2(rank || 1) + " · " + mod.label +
          ". Nothing leaves the device until you save, copy or share it." }),
        el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Style" }), styleGroup]),
        KOS.medview.field("Message on card", message),
        el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Show" }), showGroup]),
        notice,
        el("div", { class: "k-shr-share-foot", "data-ui": "shrine.card-actions" }, [
          el("button", { type: "button", class: "k-btn k-btn--quiet", text: "Use a local cover…", onclick: function () {
            overlay.close();
            openEntry(entry);
          } }),
          el("span", { class: "k-shr-spacer" }),
          copyButton, shareButton, saveButton
        ].filter(Boolean))
      ])
    ]));
    KOS.ui.openDialog(overlay);

    function renderNotice(info) {
      notice.innerHTML = "";
      if (!info || info.source || info.reason === "none" || !choice.show.cover) return;
      notice.appendChild(el("p", { class: "k-muted", text: info.reason === "cors"
        ? "The cover can be displayed, but " + info.host + " does not permit its pixels in an exported card. The module mark is used instead."
        : info.reason === "unreachable"
          ? "The cover URL did not load, so the module mark is used instead."
          : "The cover could not be read, so the module mark is used instead." }));
    }
    function paint() {
      if (closed || !coverInfo) return;
      renderCard(entry, coverImage, {
        rank: rank || 1, total: total, look: choice.look, show: choice.show,
        message: message.value.trim() || defaultMessage(entry)
      }, function (canvas) {
        if (closed) return;
        var dataUrl = null;
        try { dataUrl = canvas.toDataURL("image/png"); }
        catch (taint) {
          if (coverImage) {
            coverImage = null;
            coverInfo = { reason: "cors", host: hostOf(entry.coverUrl || "") };
            paint();
            return;
          }
        }
        currentCanvas = canvas;
        currentDataUrl = dataUrl;
        preview.innerHTML = "";
        preview.appendChild(dataUrl
          ? el("img", { class: "k-shr-card-img", "data-ui": "shrine.card-image", src: dataUrl, alt: entry.title + " Hall of Fame share card" })
          : el("p", { class: "k-muted", text: "This browser could not render an exportable image." }));
        renderNotice(coverInfo);
        [shareButton, saveButton, copyButton].filter(Boolean).forEach(function (button) { button.disabled = !dataUrl; });
      });
    }
    message.addEventListener("input", function () {
      if (renderTimer) clearTimeout(renderTimer);
      renderTimer = setTimeout(paint, 160);
    });
    whenFontsReady(function () {
      if (closed) return;
      resolveCover(entry, function (img, info) {
        coverImage = img;
        coverInfo = info || { reason: "none" };
        release = coverInfo.release || null;
        paint();
      });
    });
  }

  KOS.shrineResolveCover = resolveCover;
  KOS.shrineRenderCard = renderCard;
  KOS.shrineCard = shrineCardModal;

  /* ---------------- the Hall of Fame (frame 11g) ---------------- */
  var RANK_KANJI = ["壱", "弐", "参"];
  var MODULES = ["anime", "books", "vn", "game"];

  /* the pref is read, never created, on render (render purity); the
     first real change writes it */
  function prefs() {
    var p = store.state.media && store.state.media.shrine;
    return { module: (p && p.module) || "", sort: (p && p.sort) || "score", description: (p && p.description) || "" };
  }
  function persist(patch) {
    var cur = prefs();
    if (Object.keys(patch).every(function (k) { return cur[k] === patch[k]; })) return;
    store.state.media = store.state.media || {};
    var p = store.state.media.shrine = store.state.media.shrine || { module: "", sort: "score", description: "" };
    Object.keys(patch).forEach(function (k) { p[k] = patch[k]; });
    store.save();
  }
  function redraw() { KOS.show("shrine", undefined, { _nav: true }); }
  function openEntry(entry) { KOS.mediaEditor(entry, redraw); }

  function shrineStats(entries) {
    var scored = entries.filter(function (entry) { return Number(entry.score) > 0; });
    var average = scored.length ? scored.reduce(function (sum, entry) { return sum + Number(entry.score); }, 0) / scored.length : 0;
    var modules = {};
    entries.forEach(function (entry) { modules[entry.module] = (modules[entry.module] || 0) + 1; });
    return {
      average: average ? average.toFixed(1) : "—",
      completed: entries.filter(function (entry) { return entry.status === "completed"; }).length,
      modules: modules
    };
  }
  function scoreText(entry) { return entry.score ? String(entry.score) : "—"; }
  /* the shared vault cover: lazy image over the title-hue wash (invariant 61) */
  function coverBox(entry, mod, cls) {
    return el("span", { class: cls }, [KOS.medview.cover(entry, mod.kanji)]);
  }
  function moduleLabel(mod, module) {
    var n = el("span", { class: "k-shr-module", "data-module": module, text: mod.label });
    n.style.setProperty("--vh-accent", mod.accent);
    return n;
  }
  function shareButton(entry, rank, total, cls) {
    return el("button", { type: "button", class: cls || "k-iconbtn k-iconbtn--sm", "data-ui": "shrine.card-button",
      title: "Create share card", "aria-label": "Create share card for rank " + rank, text: "✦",
      onclick: function (ev) { ev.stopPropagation(); KOS.shrineCard(entry, rank, total); } });
  }
  function titleButton(entry, cls) {
    return el("button", { type: "button", class: cls, title: entry.title, text: entry.title,
      onclick: function (ev) { ev.stopPropagation(); openEntry(entry); } });
  }

  /* rank one: the hero. The article keeps the pointer shortcut; its
     keyboard path is the Edit button (a card holding buttons is not an
     ARIA button, invariant 67). */
  function feature(first, total) {
    var mod = KOS.media.module(first.module), added = addedOn(first);
    var progress = KOS.media.progressText(first, { long: true });
    var hero = el("article", { class: "k-shr-hero", "data-ui": "shrine.feature", onclick: function () { openEntry(first); } }, [
      el("span", { class: "k-shr-hero-scrim", "aria-hidden": "true" }),
      el("span", { class: "k-shr-hero-mark", lang: "ja", "aria-hidden": "true", text: RANK_KANJI[0] }),
      el("div", { class: "k-shr-hero-grid" }, [
        el("div", { class: "k-shr-hero-body", "data-ui": "shrine.feature-body" }, [
          el("div", { class: "k-shr-hero-rank" }, [
            el("span", { class: "k-shr-rank-tag", "data-ui": "shrine.feature-rank", text: "◆ Rank 01" }),
            el("span", { class: "k-shr-rule", "aria-hidden": "true" }),
            el("span", { class: "k-shr-hall", text: "Hall of fame" })
          ]),
          el("h2", { class: "k-shr-hero-title", text: first.title }),
          el("p", { class: "k-shr-hero-meta", text: cardMeta(first, false) }),
          first.notes && String(first.notes).trim()
            ? el("blockquote", { class: "k-shr-hero-quote", text: "“" + String(first.notes).trim().split(/\n/)[0] + "”" })
            : null,
          el("div", { class: "k-shr-hero-actions", "data-ui": "shrine.feature-actions" }, [
            el("button", { type: "button", class: "k-btn k-shr-gold", "data-ui": "shrine.card-button", text: "Create share card",
              onclick: function (ev) { ev.stopPropagation(); KOS.shrineCard(first, 1, total); } }),
            el("button", { type: "button", class: "k-btn k-shr-glass", text: "Edit entry",
              onclick: function (ev) { ev.stopPropagation(); openEntry(first); } })
          ])
        ].filter(Boolean)),
        el("div", { class: "k-shr-hero-cover" }, [coverBox(first, mod, "k-shr-hero-poster")]),
        el("dl", { class: "k-shr-hero-facts" }, [
          el("div", { class: "k-shr-hero-score" }, [
            el("dt", { text: "Personal score / 10" }),
            el("dd", { "data-ui": "shrine.score", text: scoreText(first) })
          ]),
          added ? el("div", { class: "k-shr-fact" }, [
            el("dt", { text: "In collection since" }),
            el("dd", { text: added.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) })
          ]) : null,
          el("div", { class: "k-shr-fact" }, [
            el("dt", { text: KOS.media.STATUS_LABEL[first.status] || "In collection" }),
            progress ? el("dd", { text: progress }) : null
          ].filter(Boolean))
        ].filter(Boolean))
      ])
    ]);
    hero.style.setProperty("--vh-accent", mod.accent);
    if (first.coverUrl) KOS.imageCrop.background(hero, first.coverUrl, first.coverCrop, { className: "k-shr-hero-art" });
    return hero;
  }
  /* ranks two and three: the podium cards */
  function podiumCard(entry, rank, total) {
    var mod = KOS.media.module(entry.module);
    return el("article", { class: "k-shr-pod", "data-ui": "shrine.rank-card", "data-rank": String(rank),
      onclick: function () { openEntry(entry); } }, [
      coverBox(entry, mod, "k-shr-pod-cover"),
      el("div", { class: "k-shr-pod-body" }, [
        el("span", { class: "k-shr-pod-rank", "data-ui": "shrine.rank", text: "Rank " + pad2(rank) }),
        el("h3", { class: "k-shr-pod-title" }, [titleButton(entry, "k-shr-title")]),
        moduleLabel(mod, entry.module)
      ]),
      el("div", { class: "k-shr-pod-foot", "data-ui": "shrine.row-foot" }, [
        el("span", { class: "k-shr-pod-score", "data-ui": "shrine.row-score", text: scoreText(entry) }),
        shareButton(entry, rank, total)
      ])
    ]);
  }
  /* four onward: the poster wall */
  function tile(entry, rank, total) {
    var mod = KOS.media.module(entry.module);
    return el("article", { class: "k-shr-tile", "data-ui": "shrine.rank-card", onclick: function () { openEntry(entry); } }, [
      el("div", { class: "k-shr-tile-cover" }, [
        coverBox(entry, mod, "k-shr-tile-img"),
        el("span", { class: "k-shr-tile-rank", "data-ui": "shrine.rank", text: pad2(rank) }),
        shareButton(entry, rank, total, "k-iconbtn k-iconbtn--sm k-shr-tile-share")
      ]),
      titleButton(entry, "k-shr-tile-title"),
      el("div", { class: "k-shr-tile-foot", "data-ui": "shrine.row-foot" }, [
        moduleLabel(mod, entry.module),
        el("span", { class: "k-shr-tile-score", "data-ui": "shrine.row-score", text: scoreText(entry) })
      ])
    ]);
  }
  function hallLedger(entries) {
    var stats = shrineStats(entries);
    function line(label, value) {
      return el("div", { class: "k-shr-ledger-line", "data-ui": "shrine.ledger-line" }, [
        el("dt", { text: label }), el("dd", { class: "k-mono", text: value })
      ]);
    }
    var bar = el("div", { class: "k-shr-ledger-bar", role: "img", "aria-label": MODULES.filter(function (m) { return stats.modules[m]; })
      .map(function (m) { return KOS.media.module(m).label + " " + stats.modules[m]; }).join(", ") });
    MODULES.forEach(function (m) {
      if (!stats.modules[m]) return;
      var seg = el("span", { class: "k-shr-ledger-seg", title: KOS.media.module(m).label + " · " + stats.modules[m] });
      seg.style.setProperty("--n", String(stats.modules[m]));
      seg.style.setProperty("--vh-accent", KOS.media.module(m).accent);
      bar.appendChild(seg);
    });
    return el("aside", { class: "k-shr-ledger", "data-ui": "shrine.ledger", "aria-label": "Hall statistics" }, [
      el("h3", { class: "k-shr-ledger-h", text: "Hall ledger" }),
      el("dl", { class: "k-shr-ledger-lines", "data-ui": "shrine.ledger-lines" }, [
        line("Enshrined", String(entries.length)),
        line("Average score", stats.average),
        line("Completed", String(stats.completed))
      ]),
      bar
    ]);
  }
  function descriptionEditor(done) {
    var overlay = KOS.medview.modalOverlay();
    var input = el("textarea", { class: "k-input", "data-ui": "shrine.description-input", rows: "5", maxlength: "500",
      placeholder: "What earns a place in your Hall of Fame?" });
    input.value = prefs().description;
    KOS.medview.dialogBox(overlay, "shrine.note-dialog", "Hall note", "Optional · shown only at the top of your Shrine",
      el("div", { class: "k-dialog-body" }, [KOS.medview.field("Description", input, true)]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { overlay.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save note", onclick: function () {
          persist({ description: input.value.trim() });
          overlay.close();
          done();
        } })
      ]));
    KOS.ui.openDialog(overlay);
    input.focus();
  }

  KOS.views.shrine = function (main) {
    KOS.shell.tree("none");
    var current = prefs();
    var filters = KOS.medview.addHook(KOS.ui.tabs([
      ["All media", ""], ["Anime", "anime"], ["Books", "books"], ["VN", "vn", "Visual novels"], ["Games", "game"]
    ].map(function (f) {
      return { label: f[2] || f[0], short: f[0], hook: "shrine.filter", active: current.module === f[1],
        onSelect: function () { persist({ module: f[1] }); redraw(); } };
    }), { variant: "card", label: "Filter Shrine by media type" }), "shrine.filters");
    var sortSelect = el("select", { class: "k-pill-select", "data-ui": "ui.status-select", "aria-label": "Sort Shrine" }, [
      ["score", "Sort: personal score"], ["updated", "Sort: recently updated"], ["title", "Sort: title"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sortSelect.value = current.sort;
    sortSelect.onchange = function () { persist({ sort: sortSelect.value }); redraw(); };
    main.appendChild(KOS.ui.pageHeader({
      kicker: "祠 · Hall of fame",
      title: "The Shrine",
      sub: "The works that stayed with you, ranked by your own score.",
      actions: [
        filters,
        el("label", { class: "k-shr-sort", "data-ui": "shrine.sort" }, [sortSelect]),
        el("button", { type: "button", class: "k-btn", "data-ui": "shrine.note-button",
          text: current.description ? "Edit hall note" : "Add hall note",
          onclick: function () { descriptionEditor(redraw); } })
      ]
    }));
    if (KOS.medview.unavailable(main)) return;
    if (current.description) main.appendChild(el("blockquote", { class: "k-shr-note", "data-ui": "shrine.description", text: current.description }));

    KOS.mediadb.query({
      favourite: true,
      module: current.module || undefined,
      sort: current.sort
    }, function (err, favourites) {
      if (err) {
        main.appendChild(KOS.ui.emptyState({ body: "Could not read the vault: " + err.message }));
        return;
      }
      if (!favourites.length) {
        main.appendChild(KOS.medview.addHook(KOS.ui.emptyState({
          className: "k-shr-empty",
          mark: "祠",
          title: current.module ? "No favourites in this wing" : "Your Hall of Fame is waiting",
          body: current.module ? "Try another media type, or mark a title as a favourite." : "Mark any Collection title as a favourite and it will be ranked here automatically.",
          action: current.module
            ? el("button", { type: "button", class: "k-btn", text: "Show all media", onclick: function () { persist({ module: "" }); redraw(); } })
            : el("button", { type: "button", class: "k-btn k-btn--primary", text: "Open Collection", onclick: function () { KOS.show("matrix"); } })
        }), "shrine.empty"));
        return;
      }

      var total = favourites.length;
      /* a Gold Shop shrine style (shrine-gilded / -ink / -neon) is one
         attribute on the hall; the stylesheet does the rest */
      var skin = KOS.governor.shrineStyle && KOS.governor.shrineStyle();
      var hall = el("section", { class: "k-shr", "data-ui": "shrine.hall", "data-skin": skin || null,
        "data-single": total === 1 ? "" : null, "aria-label": "Ranked Hall of Fame" });
      hall.appendChild(feature(favourites[0], total));

      var podium = el("div", { class: "k-shr-podium", "data-ui": "shrine.stage" });
      favourites.slice(1, 3).forEach(function (entry, i) { podium.appendChild(podiumCard(entry, i + 2, total)); });
      podium.style.setProperty("--podium-n", String(Math.min(2, total - 1)));
      podium.appendChild(hallLedger(favourites));
      hall.appendChild(podium);

      if (total > 3) {
        var wall = el("div", { class: "k-shr-wall", "data-ui": "shrine.ranked" });
        favourites.slice(3).forEach(function (entry, i) { wall.appendChild(tile(entry, i + 4, total)); });
        hall.appendChild(wall);
      }
      main.appendChild(hall);
      main.appendChild(el("p", { class: "k-shr-count k-muted", "data-ui": "shrine.count",
        text: total + (total === 1 ? " enshrined title" : " enshrined titles") + " · ranks follow the selected sort." }));
    });
  };
})();
