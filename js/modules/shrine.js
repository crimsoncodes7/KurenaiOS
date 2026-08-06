/* Kurenai OS — modules/shrine.js
   祠 The Shrine (Build 3a) — the hall of fame, carried over from the old
   manga tracker but module-agnostic from day one: it works off ANY vault
   entry's favourite flag, whichever module it belongs to. Only Anime has
   real data this phase; Books/VN/Games entries will simply appear here the
   moment their modules land, no changes needed.                            */
(function () {
  "use strict";
  var el = KOS.ui.el;

  /* ---- the collector card: a canvas render, shareable / saveable ----
     Drawn entirely in canvas so it exports cleanly.

     COVER RESOLUTION (all verified live in-browser, 2026-08):

     · A stored local cover is a data: URL — same-origin, never taints,
       always exportable. Tried FIRST.
     · THE ROOT CAUSE of the blank card: the Shrine list renders every cover
       as an ordinary <img> (no crossOrigin) BEFORE you press ✦ Card. That
       puts a non-CORS response in the HTTP cache, and a later
       crossOrigin="anonymous" load of the SAME url is then served from that
       cached response — which carries no Access-Control-Allow-Origin, so it
       fails outright. Measured: a never-before-requested AniList url loads
       clean under crossOrigin; the identical url after one plain load
       errors. AniList/Open Library DO send the header — the cache was
       eating it.
       The cure is to fetch the bytes ourselves with cache:"reload" and
       decode from a blob: url, which is same-origin and therefore always
       exportable.
     · VNDB (t.vndb.org) genuinely sends no CORS header at all, so neither
       fetch nor a crossOrigin image can read it. That cover can be shown on
       screen but never baked into an exportable PNG, so it is deliberately
       NOT drawn: an honest placeholder plus a one-click remedy beats a card
       whose Save/Copy/Share are all broken.

     Order: local → fetched remote → crossOrigin remote → diagnose →
     placeholder. */

  /* does this canvas still allow readback? cheap 8x8 probe */
  function exportable(img) {
    try {
      var c = document.createElement("canvas");
      c.width = 8; c.height = 8;
      c.getContext("2d").drawImage(img, 0, 0);
      c.toDataURL("image/png");
      return true;
    } catch (taint) { return false; }
  }
  function loadImage(url, useCrossOrigin, cb) {
    var img = new Image();
    var settled = false;
    function done(ok) { if (settled) return; settled = true; cb(ok ? img : null); }
    if (useCrossOrigin) img.crossOrigin = "anonymous";
    img.onload = function () {
      /* a decoded image with no intrinsic size draws nothing and would make
         the source-rect maths divide by zero */
      done(img.naturalWidth > 0 && img.naturalHeight > 0);
    };
    img.onerror = function () { done(false); };
    img.src = url;
    /* an image already in cache can complete before the handlers attach */
    if (img.complete && img.naturalWidth > 0) done(true);
  }
  function hostOf(url) {
    try { return new URL(url, location.href).hostname; } catch (e) { return "that host"; }
  }
  /* fetch the bytes and decode from a blob: url. cache:"reload" is the whole
     point — it steps over the non-CORS entry the Shrine list already put in
     the HTTP cache. The blob is same-origin, so the canvas never taints. */
  function fetchAsImage(url, cb) {
    if (typeof fetch !== "function" || typeof URL === "undefined" || !URL.createObjectURL) { cb(null); return; }
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
          if (!img) { URL.revokeObjectURL(objectUrl); cb(null); return; }
          /* the caller releases the url once the card has been drawn */
          cb(img, function () { URL.revokeObjectURL(objectUrl); });
        });
      })
      .catch(function () {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        cb(null);
      });
  }

  /* cb(img|null, info) — info.reason is why there is no usable image;
     info.release, when present, must be called once the card is drawn */
  function resolveCover(e, cb) {
    var url = String(e.coverUrl || "").trim();
    if (!url) { cb(null, { reason: "none" }); return; }

    /* 1 — a stored local/cached image: no network, no CORS, always exportable */
    if (/^data:/i.test(url) || /^blob:/i.test(url)) {
      loadImage(url, false, function (img) {
        if (img && exportable(img)) { cb(img, { source: "local" }); return; }
        cb(null, { reason: "unreadable" });
      });
      return;
    }

    /* 2 — fetch the remote bytes ourselves (cache-proof, taint-proof) */
    fetchAsImage(url, function (img, release) {
      if (img && exportable(img)) { cb(img, { source: "remote", release: release }); return; }
      if (release) release();
      /* 3 — no fetch (or it was blocked): a crossOrigin image can still
             succeed when nothing has poisoned the cache yet */
      loadImage(url, true, function (co) {
        if (co && exportable(co)) { cb(co, { source: "remote" }); return; }
        /* 4 — say WHY: does the url load at all without the CORS request? */
        loadImage(url, false, function (plain) {
          cb(null, plain ? { reason: "cors", host: hostOf(url) } : { reason: "unreachable", host: hostOf(url) });
        });
      });
    });
  }
  /* the exported PNG should use the app's own typefaces, not whatever the
     canvas falls back to before the webfonts land */
  function whenFontsReady(cb) {
    if (!document.fonts || !document.fonts.ready) { cb(); return; }
    var done = false;
    function go() { if (done) return; done = true; cb(); }
    document.fonts.ready.then(go).catch(go);
    setTimeout(go, 1200);          // never block the card on a slow font
  }
  function drawStars(ctx, x, y, score, accent) {
    var full = Math.round((score || 0) / 2);   // /10 → /5
    ctx.font = "34px serif"; ctx.textAlign = "left"; ctx.textBaseline = "middle";
    for (var i = 0; i < 5; i++) {
      ctx.fillStyle = i < full ? accent : "rgba(255,255,255,.22)";
      ctx.fillText("★", x + i * 40, y);
    }
  }
  function renderCard(e, coverImg, cb) {
    var W = 640, H = 900, cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    var mod = KOS.media.module(e.module);
    var accent = mod.accent || "#B08A3E";
    /* background: deep gradient in the module hue */
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#16130D"); bg.addColorStop(1, "#241C12");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    /* holo border */
    var pad = 22;
    var holo = ctx.createLinearGradient(0, 0, W, H);
    holo.addColorStop(0, accent); holo.addColorStop(0.4, "#35D7FF"); holo.addColorStop(0.7, "#FF6FA6"); holo.addColorStop(1, "#EFC77E");
    ctx.lineWidth = 4; ctx.strokeStyle = holo;
    roundRect(ctx, pad, pad, W - pad * 2, H - pad * 2, 26); ctx.stroke();
    /* header */
    ctx.fillStyle = accent; ctx.font = "700 15px 'IBM Plex Mono', monospace"; ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText("KURENAI SHRINE", pad + 26, pad + 24);
    ctx.textAlign = "right"; ctx.fillText("COLLECTOR'S CARD", W - pad - 26, pad + 24);
    /* cover / kanji art panel */
    var ax = pad + 26, ay = pad + 62, aw = W - (pad + 26) * 2, ah = 440;
    ctx.save(); roundRect(ctx, ax, ay, aw, ah, 16); ctx.clip();
    var iw = coverImg ? (coverImg.naturalWidth || coverImg.width || 0) : 0;
    var ih = coverImg ? (coverImg.naturalHeight || coverImg.height || 0) : 0;
    if (coverImg && iw > 0 && ih > 0) {
      var crop = KOS.imageCrop.value(e.coverCrop);
      var scale = Math.max(aw / iw, ah / ih) * crop.zoom;
      var sw = Math.min(iw, aw / scale), sh = Math.min(ih, ah / scale);
      var sx = (iw - sw) * crop.x / 100;
      var sy = (ih - sh) * crop.y / 100;
      ctx.drawImage(coverImg, sx, sy, sw, sh, ax, ay, aw, ah);
    } else {
      var g2 = ctx.createLinearGradient(ax, ay, ax, ay + ah);
      g2.addColorStop(0, "rgba(255,255,255,.08)"); g2.addColorStop(1, "rgba(0,0,0,.2)");
      ctx.fillStyle = g2; ctx.fillRect(ax, ay, aw, ah);
      ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.font = "220px 'Shippori Mincho', serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(mod.kanji, ax + aw / 2, ay + ah / 2);
    }
    ctx.restore();
    /* title + author */
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.fillStyle = "#F6F1E6"; ctx.font = "600 30px 'Fraunces', Georgia, serif";
    wrapText(ctx, e.title, W / 2, ay + ah + 24, aw, 34, 2);
    if (e.author || e.developer) {
      ctx.fillStyle = "rgba(246,241,230,.7)"; ctx.font = "italic 17px 'Fraunces', serif";
      ctx.fillText(e.author || e.developer, W / 2, ay + ah + 92);
    }
    /* stars */
    drawStars(ctx, W / 2 - 100, ay + ah + 132, e.score, accent);
    /* chips */
    var chips = [];
    if (e.genres && e.genres[0]) chips.push(["GENRE", e.genres[0]]);
    if (e.module === "books") { var vols = (e.physical && e.physical.volumes) ? e.physical.volumes.length : (e.progress && e.progress.totalVolumes) || 0; if (vols) chips.push(["VOLUMES", String(vols)]); chips.push(["FORMAT", KOS.media.FORMAT_LABEL && KOS.media.FORMAT_LABEL[e.format] || "Manga"]); }
    else if (e.module === "vn") { chips.push(["ROUTES", String((e.routes || []).filter(function (r) { return r.cleared; }).length)]); }
    else if (e.module === "game") { if (e.playtimeHours) chips.push(["HOURS", String(e.playtimeHours)]); if (e.platform) chips.push(["PLATFORM", KOS.media.PLATFORM_LABEL && KOS.media.PLATFORM_LABEL[e.platform] || e.platform]); }
    else { if (e.progress && e.progress.total) chips.push(["EPISODES", String(e.progress.total)]); }
    chips = chips.slice(0, 3);
    var cy = ay + ah + 180, cw = 150, gap = 16, totalW = chips.length * cw + (chips.length - 1) * gap;
    chips.forEach(function (c, i) {
      var cx = W / 2 - totalW / 2 + i * (cw + gap);
      ctx.fillStyle = "rgba(255,255,255,.06)"; roundRect(ctx, cx, cy, cw, 56, 12); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = 1; roundRect(ctx, cx, cy, cw, 56, 12); ctx.stroke();
      ctx.fillStyle = accent; ctx.font = "700 10px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText(c[0], cx + cw / 2, cy + 10);
      ctx.fillStyle = "#F6F1E6"; ctx.font = "600 16px 'Fraunces', serif";
      ctx.fillText(String(c[1]).slice(0, 12), cx + cw / 2, cy + 26);
    });
    /* footer */
    ctx.fillStyle = "rgba(246,241,230,.4)"; ctx.font = "11px 'IBM Plex Mono', monospace"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
    ctx.fillText("KURENAI · PERSONAL COLLECTION", W / 2, H - pad - 24);
    cb(cv);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxW, lh, maxLines) {
    var words = String(text).split(" "), line = "", lines = [];
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxW - 40 && line) { lines.push(line); line = words[i]; } else line = test;
    }
    lines.push(line);
    lines = lines.slice(0, maxLines);
    if (lines.length === maxLines && words.length > lines.join(" ").split(" ").length) lines[maxLines - 1] += "…";
    lines.forEach(function (ln, i) { ctx.fillText(ln, x, y + i * lh); });
  }

  function shrineCardModal(e) {
    var overlay = KOS.medview.modalOverlay();
    var preview = el("div", { class: "shrine-card-preview" }, [el("p", { class: "sub", text: "Rendering…" })]);
    var notice = el("div", { class: "shrine-card-notice" });
    var actions = el("div", { class: "shrine-card-actions" });
    var closed = false;
    overlay.appendChild(el("div", { class: "modal shrine-card-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: "祠 Shrine card" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })
      ]),
      preview, notice, actions
    ]));
    var innerClose = overlay.close;
    overlay.close = function () { closed = true; innerClose(); };
    document.body.appendChild(overlay);

    function build(coverImg, info) {
      if (closed) return;
      renderCard(e, coverImg, function (cv) {
        /* the pixels are on the canvas now — the blob url has done its job */
        if (info && info.release) { info.release(); info.release = null; }
        if (closed) return;
        var dataUrl = null;
        try { dataUrl = cv.toDataURL("image/png"); }
        catch (taint) {
          /* belt and braces: resolveCover already proves exportability, so
             reaching here means something else tainted the canvas */
          if (coverImg) { build(null, { reason: "cors", host: hostOf(e.coverUrl || "") }); return; }
        }
        preview.innerHTML = "";
        if (dataUrl) {
          preview.appendChild(el("img", { class: "shrine-card-img", src: dataUrl, alt: e.title + " collector card" }));
        } else {
          preview.appendChild(el("p", { class: "fc-empty", text: "This browser would not let the card be rendered to an image." }));
        }
        renderNotice(info);
        actions.innerHTML = "";
        var msgIn = el("input", { type: "text", class: "todo-in", placeholder: "Add a message to share (optional)…" });
        actions.appendChild(msgIn);
        var btns = el("div", { class: "lab-controls" }, [
          navigator.share ? el("button", { class: "btn primary", text: "⇪ Share", onclick: function () { shareCard(cv, e, msgIn.value); } }) : null,
          el("button", { class: "btn", text: "⤓ Save to device", onclick: function () { saveCard(dataUrl, e); } }),
          el("button", { class: "btn", text: "⧉ Copy", onclick: function () { copyCard(cv); } })
        ].filter(Boolean));
        if (!dataUrl) btns.querySelectorAll(".btn").forEach(function (b) { b.disabled = true; });
        actions.appendChild(btns);
      });
    }

    /* say plainly why a cover is missing, and offer the one thing that fixes
       it — storing the image locally, which is exportable forever after */
    function renderNotice(info) {
      notice.innerHTML = "";
      if (!info || info.source) return;                 // a cover was used
      var msg;
      if (info.reason === "none") return;               // no cover set: placeholder is correct, silently
      else if (info.reason === "cors") msg = "The cover loads on screen but " + info.host + " won't let another site read its pixels, so it can't be baked into a shareable image.";
      else if (info.reason === "unreachable") msg = "The cover URL didn't load, so the card is using the module mark.";
      else msg = "That cover couldn't be read, so the card is using the module mark.";
      notice.appendChild(el("p", { class: "sub", text: msg }));
      notice.appendChild(el("button", { class: "btn subtle", text: "⌖ Use a local cover…", onclick: function () {
        overlay.close();
        KOS.mediaEditor(e, function () { KOS.show("shrine", undefined, { _nav: true }); });
      } }));
    }

    whenFontsReady(function () {
      if (closed) return;
      resolveCover(e, function (img, info) { build(img, info); });
    });
  }
  function saveCard(dataUrl, e) {
    if (!dataUrl) { KOS.ui.toast("Could not render the image.", true); return; }
    var a = el("a", { href: dataUrl, download: "shrine_" + e.title.replace(/[^\w]+/g, "_").slice(0, 40) + ".png" });
    document.body.appendChild(a); a.click(); a.remove();
    KOS.ui.toast("Saved.");
  }
  /* toBlob on a tainted canvas throws SecurityError rather than yielding null */
  function toBlobSafe(cv, cb) {
    try { cv.toBlob(function (blob) { cb(blob || null); }); }
    catch (err) { cb(null); }
  }
  function copyCard(cv) {
    if (!navigator.clipboard || !window.ClipboardItem) { KOS.ui.toast("Copy isn't supported here — use Save instead.", true); return; }
    toBlobSafe(cv, function (blob) {
      if (!blob) { KOS.ui.toast("Could not copy.", true); return; }
      navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })])
        .then(function () { KOS.ui.toast("Card copied to the clipboard."); })
        .catch(function () { KOS.ui.toast("Copy blocked by the browser — use Save.", true); });
    });
  }
  function shareCard(cv, e, msg) {
    toBlobSafe(cv, function (blob) {
      if (!blob) { KOS.ui.toast("Could not render for sharing.", true); return; }
      var file = new File([blob], "shrine_" + e.title.replace(/[^\w]+/g, "_").slice(0, 30) + ".png", { type: "image/png" });
      var data = { title: e.title + " — Kurenai Shrine", text: msg || (e.title + " is enshrined in my Kurenai collection.") };
      if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
      navigator.share(data).catch(function () {});
    });
  }
  /* exposed for the suites: the resolution order is a contract, not a detail */
  KOS.shrineResolveCover = resolveCover;
  KOS.shrineCard = shrineCardModal;

  KOS.views.shrine = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "祠 · Hall of fame" }),
        el("h1", { text: "The Shrine" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Everything you've marked ♥, ranked by your own scores." })
        ])
      ])
    ]));

    if (KOS.medview.unavailable(main)) return;

    KOS.mediadb.query({ favourite: true, sort: "score" }, function (err, favs) {
      if (err) { main.appendChild(el("p", { class: "fc-empty", text: "Could not read the vault: " + err.message })); return; }
      if (!favs.length) {
        main.appendChild(el("div", { class: "med-empty" }, [
          el("p", { class: "fc-empty", text: "The Shrine is empty. Tap the ♥ on any entry — anime, books, visual novels or games — and it takes its place here." }),
          el("div", { class: "lab-controls", style: "justify-content:center" }, [
            el("button", { class: "btn primary", text: "映 Open the Anime vault", onclick: function () { KOS.show("anime"); } })
          ])
        ]));
        return;
      }

      /* card border style (3j): a purchased Shrine cosmetic sets one class
         on the hall — the default look is the absence of it */
      var style = KOS.governor.shrineStyle && KOS.governor.shrineStyle();
      var hall = el("div", { class: "shrine-hall" + (style ? " " + style : "") });
      favs.forEach(function (e, i) {
        var mod = KOS.media.module(e.module);
        var card = el("div", { class: "shrine-card" + (i < 3 ? " top" : ""), role: "button", tabindex: "0",
          onclick: function () { KOS.mediaEditor(e, function () { KOS.show("shrine", undefined, { _nav: true }); }); },
          onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); KOS.mediaEditor(e, function () { KOS.show("shrine", undefined, { _nav: true }); }); } }
        }, [
          el("span", { class: "shrine-rank", text: String(i + 1) }),
          el("div", { class: "med-cover" }, [
            e.coverUrl
              ? KOS.imageCrop.image(e.coverUrl, { alt: "", loading: "lazy", decoding: "async" }, e.coverCrop)
              : el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod.kanji })
          ]),
          el("div", { class: "shrine-body" }, [
            el("div", { class: "med-title", title: e.title, text: e.title }),
            el("div", { class: "med-meta" }, [
              el("span", { class: "med-chip", style: "--chip:" + (mod.accent || "#8C7CFF"), text: mod.label }),
              e.score ? el("span", { class: "med-score", text: "★ " + e.score }) : el("span", { class: "sub", text: "unrated" })
            ])
          ]),
          el("button", {
            class: "shrine-card-btn", title: "Generate collector card", "aria-label": "Generate collector card",
            onclick: function (ev) { ev.stopPropagation(); KOS.shrineCard(e); }
          }, [el("span", { text: "✦ Card" })])
        ]);
        hall.appendChild(card);
      });
      main.appendChild(hall);
      main.appendChild(el("p", { class: "sub", style: "margin-top:10px", text: favs.length + (favs.length === 1 ? " enshrined title." : " enshrined titles.") }));
    });
  };
})();
