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
    /* no 2D context (a locked-down browser, a headless test): hand back the
       blank canvas and the dialog says it could not render an image */
    if (!ctx) { cb(canvas); return; }
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

    /* FULL ART (review B, "think Pokémon V"): the cover is the whole card,
       sharp, with a dark band across the top for the name and the score
       and a translucent text box at the foot. No cover: the palette and
       the medium's kanji fill the frame. */
    if (show.cover && coverImage) drawCrop(ctx, entry, coverImage, inner.x, inner.y, inner.w, inner.h);
    else {
      var wash = ctx.createLinearGradient(0, inner.y, 0, inner.y + inner.h);
      wash.addColorStop(0, alpha(pal.accent, 0.18));
      wash.addColorStop(1, pal.bg);
      ctx.fillStyle = wash;
      ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
      ctx.fillStyle = alpha(pal.accent, 0.16);
      ctx.font = "700 " + (220 * S) + "px " + MINCHO;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mod.kanji, W / 2, H * 0.46);
      ctx.textAlign = "left";
    }
    var topFade = ctx.createLinearGradient(0, inner.y, 0, inner.y + 150 * S);
    topFade.addColorStop(0, alpha(pal.bg, 0.92));
    topFade.addColorStop(0.62, alpha(pal.bg, 0.55));
    topFade.addColorStop(1, alpha(pal.bg, 0));
    ctx.fillStyle = topFade;
    ctx.fillRect(inner.x, inner.y, inner.w, 150 * S);
    var footFade = ctx.createLinearGradient(0, H * 0.5, 0, H);
    footFade.addColorStop(0, alpha(pal.bg, 0));
    footFade.addColorStop(1, alpha(pal.bg, 0.94));
    ctx.fillStyle = footFade;
    ctx.fillRect(inner.x, H * 0.5, inner.w, H * 0.5);

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    var left = 24 * S, right = W - 24 * S;

    /* the hall line, then the name across the top — the card's "name bar" */
    ctx.fillStyle = pal.accent;
    ctx.font = "600 " + (9.5 * S) + "px " + MONO;
    spacing(ctx, 0.24, 9.5 * S);
    ctx.fillText("✿  KURENAI · PRIVATE HALL", left, 22 * S);
    spacing(ctx, 0, 0);
    var medal = show.score ? 70 * S : 0;
    var nameRight = right - (medal ? medal + 12 * S : 0);
    var y0 = 44 * S;
    if (show.rank) {
      ctx.fillStyle = pal.accent;
      ctx.font = "600 " + (11 * S) + "px " + MONO;
      spacing(ctx, 0.22, 11 * S);
      var no = opts.total ? " · NO. " + pad3(opts.rank || 1) + " / " + pad3(opts.total) : "";
      ctx.fillText("◆ RANK " + pad2(opts.rank || 1) + no, left, y0);
      spacing(ctx, 0, 0);
      y0 += 20 * S;
    }
    ctx.fillStyle = pal.ivory;
    ctx.shadowColor = alpha(pal.bg, 0.8);
    ctx.shadowBlur = 12 * S;
    ctx.fillText(fitLine(ctx, entry.title, "800", MINCHO, 34 * S, 20 * S, nameRight - left), left, y0);
    ctx.shadowBlur = 0;

    /* the score medallion where a card prints its HP */
    if (show.score) {
      var cx = right - medal / 2, cy = 22 * S + medal / 2, r = medal / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = alpha(pal.bg, 0.78);
      ctx.fill();
      ctx.fillStyle = pal.accent;
      for (var a = 0; a < 360; a += 12) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, (a - 90) * Math.PI / 180, (a + 4 - 90) * Math.PI / 180);
        ctx.arc(cx, cy, r * 0.86, (a + 4 - 90) * Math.PI / 180, (a - 90) * Math.PI / 180, true);
        ctx.closePath();
        ctx.fill();
      }
      var score = Number(entry.score || 0);
      ctx.textAlign = "center";
      ctx.fillStyle = pal.accent;
      ctx.font = "600 " + (25 * S) + "px " + MONO;
      ctx.fillText(score ? String(score) : "—", cx, cy - 16 * S);
      ctx.fillStyle = pal.faint;
      ctx.font = "500 " + (6.5 * S) + "px " + MONO;
      spacing(ctx, 0.16, 6.5 * S);
      ctx.fillText("SCORE / 10", cx, cy + 12 * S);
      spacing(ctx, 0, 0);
      ctx.textAlign = "left";
    }

    /* 殿堂入り, set vertically down the right edge under the medallion */
    ctx.fillStyle = pal.accent;
    ctx.font = "700 " + (15 * S) + "px " + MINCHO;
    ctx.textAlign = "center";
    "殿堂入り".split("").forEach(function (ch, i) {
      ctx.fillText(ch, right - 8 * S, 22 * S + medal + 14 * S + i * 15 * S * 1.35);
    });
    ctx.textAlign = "left";

    /* the text box at the foot: meta, the message, the date */
    var lines = [], lineH = 14 * S * 1.45;
    var boxW = right - left, pad = 14 * S;
    if (show.message) {
      ctx.font = "italic 400 " + (14 * S) + "px " + READ;
      var said = String(opts.message || defaultMessage(entry));
      lines = lineSet(ctx, /^["“]/.test(said) ? said : "“" + said + "”", boxW - pad * 2);
      if (lines.length > 3) {
        lines = lines.slice(0, 3);
        lines[2] = lines[2].replace(/[.,;:”]*$/, "…”");
      }
    }
    var d = show.date ? addedOn(entry) : null;
    var boxH = pad + 15 * S + (lines.length ? 10 * S + lines.length * lineH : 0) + (d ? 12 * S + 9 * S : 0) + pad;
    var boxY = H - 22 * S - boxH;
    ctx.save();
    roundRect(ctx, left, boxY, boxW, boxH, 14 * S);
    ctx.fillStyle = alpha(pal.bg, 0.72);
    ctx.fill();
    ctx.strokeStyle = alpha(pal.accent, 0.55);
    ctx.lineWidth = 1.2 * S;
    ctx.stroke();
    ctx.restore();
    var ty = boxY + pad;
    ctx.fillStyle = pal.meta;
    ctx.fillText(fitLine(ctx, cardMeta(entry, show.progress), "500", "'Onest', system-ui, sans-serif", 11.5 * S, 9 * S, boxW - pad * 2), left + pad, ty);
    ty += 15 * S;
    if (lines.length) {
      ty += 10 * S;
      ctx.font = "italic 400 " + (14 * S) + "px " + READ;
      ctx.fillStyle = pal.quote;
      lines.forEach(function (line, i) { ctx.fillText(line, left + pad, ty + i * lineH); });
      ty += lines.length * lineH;
    }
    if (d) {
      ty += 12 * S;
      ctx.fillStyle = pal.faint;
      ctx.font = "500 " + (8.5 * S) + "px " + MONO;
      spacing(ctx, 0.14, 8.5 * S);
      ctx.fillText("ADDED " + pad2(d.getDate()) + " · " + pad2(d.getMonth() + 1) + " · " + d.getFullYear() + " · KURENAIOS", left + pad, ty);
      spacing(ctx, 0, 0);
    }
    /* the rank numerals, outlined, riding just above the box */
    if (show.rank) {
      ctx.font = "800 " + (96 * S) + "px " + MINCHO;
      spacing(ctx, -0.04, 96 * S);
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1.5 * S;
      ctx.textBaseline = "bottom";
      ctx.strokeText(pad2(opts.rank || 1), left - 2 * S, boxY - 2 * S);
      ctx.textBaseline = "top";
      spacing(ctx, 0, 0);
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
  /* clicking a Shrine card opens its SHARE card (review B): editing a
     record belongs to its vault, and the hero keeps an explicit Edit. The
     title button is the same action's keyboard route. */
  function titleButton(entry, cls, rank, total) {
    return el("button", { type: "button", class: cls, title: "Share card — " + entry.title, text: entry.title,
      "aria-label": "Open the share card for " + entry.title,
      onclick: function (ev) { ev.stopPropagation(); KOS.shrineCard(entry, rank, total); } });
  }

  /* rank one: the hero. The article keeps the pointer shortcut; its
     keyboard path is the Edit button (a card holding buttons is not an
     ARIA button, invariant 67). */
  function feature(first, total) {
    var mod = KOS.media.module(first.module), added = addedOn(first);
    var progress = KOS.media.progressText(first, { long: true });
    var hero = el("article", { class: "k-shr-hero", "data-ui": "shrine.feature", onclick: function () { KOS.shrineCard(first, 1, total); } }, [
      el("span", { class: "k-shr-hero-scrim", "aria-hidden": "true" }),
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
  /* ranks two and three: the podium (review B — they were a plain row).
     Each is a small hero of its own: the cover as dimmed art behind, the
     rank as an outlined numeral in its metal (silver, bronze), the poster
     tilted, the title and its facts, and the score in a medallion. */
  function podiumCard(entry, rank, total) {
    var mod = KOS.media.module(entry.module);
    /* review B, second pass: no outlined numeral (the rank tag says it)
       and no ✦ button (the card itself opens the share card); everything
       else larger so the two read as the hero's runners-up */
    var card = el("article", { class: "k-shr-pod", "data-ui": "shrine.rank-card", "data-rank": String(rank),
      onclick: function () { KOS.shrineCard(entry, rank, total); } }, [
      el("span", { class: "k-shr-pod-scrim", "aria-hidden": "true" }),
      coverBox(entry, mod, "k-shr-pod-cover"),
      el("div", { class: "k-shr-pod-body" }, [
        el("span", { class: "k-shr-pod-rank", "data-ui": "shrine.rank", text: "◆ Rank " + pad2(rank) }),
        el("h3", { class: "k-shr-pod-title" }, [titleButton(entry, "k-shr-title", rank, total)]),
        el("p", { class: "k-shr-pod-meta" }, [moduleLabel(mod, entry.module), creatorOf(entry) ? " · " + creatorOf(entry) : ""])
      ]),
      el("div", { class: "k-shr-pod-foot", "data-ui": "shrine.row-foot" }, [
        el("span", { class: "k-shr-pod-medal" }, [
          el("span", { class: "k-shr-pod-score", "data-ui": "shrine.row-score", text: scoreText(entry) }),
          el("small", { text: "/ 10" })
        ])
      ])
    ]);
    card.style.setProperty("--vh-accent", mod.accent);
    if (entry.coverUrl) KOS.imageCrop.background(card, entry.coverUrl, entry.coverCrop, { className: "k-shr-pod-art" });
    return card;
  }
  /* four onward: the poster wall */
  function tile(entry, rank, total) {
    var mod = KOS.media.module(entry.module);
    return el("article", { class: "k-shr-tile", "data-ui": "shrine.rank-card", onclick: function () { KOS.shrineCard(entry, rank, total); } }, [
      el("div", { class: "k-shr-tile-cover" }, [
        coverBox(entry, mod, "k-shr-tile-img"),
        el("span", { class: "k-shr-tile-rank", "data-ui": "shrine.rank", text: pad2(rank) })
      ]),
      titleButton(entry, "k-shr-tile-title", rank, total),
      el("div", { class: "k-shr-tile-foot", "data-ui": "shrine.row-foot" }, [
        moduleLabel(mod, entry.module),
        el("span", { class: "k-shr-tile-score", "data-ui": "shrine.row-score", text: scoreText(entry) })
      ])
    ]);
  }
  /* the ledger (review B): the hall in two figures, then what it is
     made of — a bar and a legend with each medium's count and share */
  function hallLedger(entries) {
    var stats = shrineStats(entries);
    var n = entries.length;
    var bar = el("div", { class: "k-shr-ledger-bar", role: "img", "aria-label": MODULES.filter(function (m) { return stats.modules[m]; })
      .map(function (m) { return KOS.media.module(m).label + " " + stats.modules[m]; }).join(", ") });
    var legend = el("ul", { class: "k-shr-ledger-legend", "data-ui": "shrine.ledger-lines" });
    MODULES.forEach(function (m) {
      if (!stats.modules[m]) return;
      var mod = KOS.media.module(m);
      var seg = el("span", { class: "k-shr-ledger-seg", title: mod.label + " · " + stats.modules[m] });
      seg.style.setProperty("--n", String(stats.modules[m]));
      seg.style.setProperty("--vh-accent", mod.accent);
      bar.appendChild(seg);
      var li = el("li", { class: "k-shr-ledger-row", "data-ui": "shrine.ledger-line" }, [
        el("span", { class: "k-shr-ledger-dot", "aria-hidden": "true" }),
        el("span", { class: "k-shr-ledger-k", title: mod.label, text: { vn: "VN" }[m] || mod.label }),
        el("b", { class: "k-mono", text: String(stats.modules[m]) }),
        el("span", { class: "k-mono k-shr-ledger-pct", text: Math.round(100 * stats.modules[m] / n) + "%" })
      ]);
      li.style.setProperty("--vh-accent", mod.accent);
      legend.appendChild(li);
    });
    return el("aside", { class: "k-shr-ledger", "data-ui": "shrine.ledger", "aria-label": "Hall statistics" }, [
      el("h3", { class: "k-shr-ledger-h", text: "Hall ledger" }),
      el("div", { class: "k-shr-ledger-figs" }, [
        el("div", { class: "k-shr-ledger-fig" }, [el("b", { class: "k-mono", text: String(n) }), el("span", { text: "enshrined" })]),
        el("div", { class: "k-shr-ledger-fig", "data-tone": "gold" }, [el("b", { class: "k-mono", text: stats.average }), el("span", { text: "average score" })]),
        stats.completed ? el("div", { class: "k-shr-ledger-fig" }, [el("b", { class: "k-mono", text: String(stats.completed) }), el("span", { text: "completed" })]) : null
      ].filter(Boolean)),
      bar,
      legend
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

      /* ranked by score, titles that share one follow the user's own order
         for that tier (roadmap 1.5); a newly tied title joins its end */
      if (current.sort === "score") favourites = KOS.media.shrineOrder.apply(favourites);
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
