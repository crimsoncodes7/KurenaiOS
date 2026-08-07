/* Kurenai OS — modules/shrine.js
   祠 The Shrine: a module-agnostic Hall of Fame for favourite Collection
   entries, with an exportable crop-aware share card. */
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
    document.fonts.ready.then(go).catch(go);
    setTimeout(go, 1200);
  }

  /* ---------------- share-card renderer ---------------- */
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = String(text || "").split(/\s+/), line = "", lines = [];
    words.forEach(function (word) {
      var test = line ? line + " " + word : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else line = test;
    });
    if (line) lines.push(line);
    var clipped = lines.length > maxLines;
    lines = lines.slice(0, maxLines);
    if (clipped && lines.length) lines[lines.length - 1] = lines[lines.length - 1].replace(/[.,;:]?$/, "…");
    lines.forEach(function (value, index) { ctx.fillText(value, x, y + index * lineHeight); });
  }
  function drawStars(ctx, x, y, score, accent) {
    var full = Math.round((Number(score) || 0) / 2);
    ctx.font = "30px serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (var i = 0; i < 5; i++) {
      ctx.fillStyle = i < full ? accent : "rgba(255,255,255,.2)";
      ctx.fillText("★", x + i * 35, y);
    }
  }
  function defaultMessage(entry) {
    return "“" + entry.title + "” earned its place in my KurenaiOS Hall of Fame.";
  }
  function cardMetadata(entry) {
    var out = [];
    if (entry.module === "anime") {
      if (entry.progress && (entry.progress.current || entry.progress.total)) {
        out.push(["EPISODES", (entry.progress.current || 0) + (entry.progress.total ? " / " + entry.progress.total : " watched")]);
      }
    } else if (entry.module === "books") {
      if (entry.author) out.push(["CREATOR", entry.author]);
      var read = entry.progress && entry.progress.volumes || 0;
      var total = entry.progress && entry.progress.totalVolumes || 0;
      if (read || total) out.push(["VOLUMES", read + (total ? " / " + total : " read")]);
    } else if (entry.module === "vn") {
      if (entry.developer) out.push(["STUDIO", entry.developer]);
      out.push(["ROUTES", String((entry.routes || []).filter(function (route) { return route.cleared; }).length) + " cleared"]);
    } else if (entry.module === "game") {
      if (entry.developer) out.push(["STUDIO", entry.developer]);
      if (entry.playtimeHours) out.push(["PLAYTIME", entry.playtimeHours + " hours"]);
      else if (entry.platform) out.push(["PLATFORM", KOS.media.PLATFORM_LABEL[entry.platform] || entry.platform]);
    }
    if (out.length < 2 && entry.genres && entry.genres[0]) out.push(["GENRE", entry.genres[0]]);
    if (!out.length) out.push(["STATUS", KOS.media.STATUS_LABEL[entry.status] || "In the collection"]);
    return out.slice(0, 2);
  }
  function renderCard(entry, coverImage, rank, message, cb) {
    var width = 900, height = 560, canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var mod = KOS.media.module(entry.module), accent = mod.accent || "#B08A3E";
    var bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#111722");
    bg.addColorStop(1, "#1B1720");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,.025)";
    roundRect(ctx, 24, 24, width - 48, height - 48, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.16)";
    ctx.lineWidth = 2;
    roundRect(ctx, 24, 24, width - 48, height - 48, 24);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = "700 15px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("KURENAI · HALL OF FAME", 50, 48);
    ctx.textAlign = "right";
    ctx.fillText("RANK " + String(rank || 1).padStart(2, "0"), width - 50, 48);

    var imageX = 50, imageY = 86, imageW = 288, imageH = 424;
    ctx.save();
    roundRect(ctx, imageX, imageY, imageW, imageH, 18);
    ctx.clip();
    var sourceW = coverImage ? (coverImage.naturalWidth || coverImage.width || 0) : 0;
    var sourceH = coverImage ? (coverImage.naturalHeight || coverImage.height || 0) : 0;
    if (coverImage && sourceW > 0 && sourceH > 0) {
      var crop = KOS.imageCrop.value(entry.coverCrop);
      var scale = Math.max(imageW / sourceW, imageH / sourceH) * crop.zoom;
      var sampleW = Math.min(sourceW, imageW / scale);
      var sampleH = Math.min(sourceH, imageH / scale);
      var sampleX = (sourceW - sampleW) * crop.x / 100;
      var sampleY = (sourceH - sampleH) * crop.y / 100;
      ctx.drawImage(coverImage, sampleX, sampleY, sampleW, sampleH, imageX, imageY, imageW, imageH);
    } else {
      ctx.fillStyle = "rgba(255,255,255,.055)";
      ctx.fillRect(imageX, imageY, imageW, imageH);
      ctx.fillStyle = "rgba(255,255,255,.13)";
      ctx.font = "180px 'Shippori Mincho', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mod.kanji, imageX + imageW / 2, imageY + imageH / 2);
    }
    ctx.restore();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    roundRect(ctx, imageX, imageY, imageW, imageH, 18);
    ctx.stroke();

    var bodyX = 382, bodyW = width - bodyX - 50;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = accent;
    ctx.font = "700 12px 'IBM Plex Mono', monospace";
    ctx.fillText(mod.label.toUpperCase() + " · PERSONAL ARCHIVE", bodyX, 100);
    ctx.fillStyle = "#F7F3EC";
    ctx.font = "600 38px 'Fraunces', Georgia, serif";
    wrapText(ctx, entry.title, bodyX, 130, bodyW, 43, 3);

    var score = Number(entry.score || 0);
    ctx.fillStyle = "#F7F3EC";
    ctx.font = "600 52px 'Fraunces', Georgia, serif";
    ctx.fillText(score ? String(score) : "—", bodyX, 276);
    ctx.fillStyle = "rgba(247,243,236,.55)";
    ctx.font = "14px 'IBM Plex Mono', monospace";
    ctx.fillText("/ 10  PERSONAL SCORE", bodyX + 74, 304);
    drawStars(ctx, bodyX, 340, score, accent);

    var metadata = cardMetadata(entry), metaX = bodyX + 228;
    metadata.forEach(function (item, index) {
      var y = 277 + index * 68;
      ctx.fillStyle = "rgba(255,255,255,.045)";
      roundRect(ctx, metaX, y, bodyW - 228, 54, 10);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.font = "700 10px 'IBM Plex Mono', monospace";
      ctx.fillText(item[0], metaX + 14, y + 9);
      ctx.fillStyle = "#F7F3EC";
      ctx.font = "600 15px 'Fraunces', Georgia, serif";
      ctx.fillText(String(item[1]).slice(0, 28), metaX + 14, y + 27);
    });

    ctx.fillStyle = "rgba(255,255,255,.045)";
    roundRect(ctx, bodyX, 410, bodyW, 72, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(247,243,236,.8)";
    ctx.font = "italic 16px 'Fraunces', Georgia, serif";
    wrapText(ctx, message || defaultMessage(entry), bodyX + 16, 426, bodyW - 32, 21, 2);
    ctx.fillStyle = "rgba(247,243,236,.42)";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("CURATED IN KURENAIOS", bodyX, 502);
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
  function shrineCardModal(entry, rank) {
    var closed = false, release = null, coverImage = null, coverInfo = null;
    var currentCanvas = null, currentDataUrl = null, renderTimer = null;
    var overlay = KOS.medview.modalOverlay(function () {
      closed = true;
      if (renderTimer) clearTimeout(renderTimer);
      if (release) release();
    });
    var preview = el("div", { class: "shrine-card-preview", "aria-live": "polite" }, [
      el("p", { class: "sub", text: "Rendering your card…" })
    ]);
    var notice = el("div", { class: "shrine-card-notice" });
    var message = el("textarea", { class: "form-in shrine-message", maxlength: "140", rows: "2", "aria-label": "Share message" });
    message.value = defaultMessage(entry);
    var shareButton = navigator.share
      ? el("button", { class: "btn primary", text: "⇪ Share", disabled: "true", onclick: function () { shareCard(currentCanvas, entry, message.value); } })
      : null;
    var saveButton = el("button", { class: "btn", text: "⤓ Save PNG", disabled: "true", onclick: function () { saveCard(currentDataUrl, entry); } });
    var copyButton = el("button", { class: "btn", text: "⧉ Copy image", disabled: "true", onclick: function () { copyCard(currentCanvas); } });
    overlay.appendChild(el("div", { class: "modal shrine-card-modal" }, [
      el("div", { class: "modal-h" }, [
        el("div", {}, [
          el("b", { text: "Shrine share card" }),
          el("p", { class: "sub shrine-modal-sub", text: "Rank " + (rank || 1) + " · " + KOS.media.module(entry.module).label })
        ]),
        el("button", { class: "mini-btn shrine-modal-close", text: "✕", "aria-label": "Close share card", onclick: overlay.close })
      ]),
      preview,
      notice,
      el("label", { class: "field shrine-message-field" }, [el("span", { text: "Message on card" }), message]),
      el("div", { class: "shrine-card-actions" }, [shareButton, saveButton, copyButton].filter(Boolean))
    ]));
    document.body.appendChild(overlay);

    function renderNotice(info) {
      notice.innerHTML = "";
      if (!info || info.source || info.reason === "none") return;
      var text = info.reason === "cors"
        ? "The cover can be displayed, but " + info.host + " does not permit its pixels in an exported card. The module mark is used instead."
        : info.reason === "unreachable"
          ? "The cover URL did not load, so the module mark is used instead."
          : "The cover could not be read, so the module mark is used instead.";
      notice.appendChild(el("p", { class: "sub", text: text }));
      notice.appendChild(el("button", { class: "btn subtle", text: "Use a local cover…", onclick: function () {
        overlay.close();
        KOS.mediaEditor(entry, function () { KOS.show("shrine", undefined, { _nav: true }); });
      } }));
    }
    function paint() {
      if (closed || !coverInfo) return;
      renderCard(entry, coverImage, rank || 1, message.value.trim() || defaultMessage(entry), function (canvas) {
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
          ? el("img", { class: "shrine-card-img", src: dataUrl, alt: entry.title + " Hall of Fame share card" })
          : el("p", { class: "fc-empty", text: "This browser could not render an exportable image." }));
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

  /* ---------------- Hall of Fame view ---------------- */
  function prefs() {
    store.state.media = store.state.media || {};
    store.state.media.shrine = store.state.media.shrine || { module: "", sort: "score", description: "" };
    return store.state.media.shrine;
  }
  function shrineMeta(entry) {
    var bits = [];
    if (entry.author || entry.developer) bits.push(entry.author || entry.developer);
    if (entry.module === "anime" && entry.progress && (entry.progress.current || entry.progress.total)) {
      bits.push((entry.progress.current || 0) + (entry.progress.total ? " / " + entry.progress.total : "") + " episodes");
    }
    if (entry.module === "books" && entry.progress && (entry.progress.volumes || entry.progress.totalVolumes)) {
      bits.push((entry.progress.volumes || 0) + (entry.progress.totalVolumes ? " / " + entry.progress.totalVolumes : "") + " volumes");
    }
    if (entry.module === "vn") bits.push((entry.routes || []).filter(function (route) { return route.cleared; }).length + " routes cleared");
    if (entry.module === "game" && entry.playtimeHours) bits.push(entry.playtimeHours + " hours");
    if (bits.length < 2 && entry.genres && entry.genres[0]) bits.push(entry.genres[0]);
    return bits.slice(0, 2);
  }
  function cover(entry, mod, className) {
    return el("div", { class: className }, [
      entry.coverUrl
        ? KOS.imageCrop.image(entry.coverUrl, { alt: "", loading: "lazy", decoding: "async" }, entry.coverCrop)
        : el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod.kanji })
    ]);
  }
  function descriptionEditor(done) {
    var current = prefs(), overlay = KOS.medview.modalOverlay();
    var input = el("textarea", { class: "form-in shrine-description-input", rows: "5", maxlength: "500", placeholder: "What earns a place in your Hall of Fame?" });
    input.value = current.description || "";
    overlay.appendChild(el("div", { class: "modal shrine-description-modal" }, [
      el("div", { class: "modal-h" }, [
        el("div", {}, [
          el("b", { text: "Hall note" }),
          el("p", { class: "sub shrine-modal-sub", text: "Optional · shown only at the top of your Shrine" })
        ]),
        el("button", { class: "mini-btn shrine-modal-close", text: "✕", "aria-label": "Close", onclick: overlay.close })
      ]),
      el("label", { class: "field" }, [el("span", { text: "Description" }), input]),
      el("div", { class: "med-modal-foot" }, [
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "Save note", onclick: function () {
          current.description = input.value.trim();
          store.save();
          overlay.close();
          done();
        } })
      ])
    ]));
    document.body.appendChild(overlay);
    input.focus();
  }
  function shrineFilter(label, value, current) {
    return el("button", {
      class: "shrine-filter" + (value === current ? " active" : ""),
      role: "tab",
      "aria-selected": String(value === current),
      text: label,
      onclick: function () {
        prefs().module = value;
        store.save();
        KOS.show("shrine", undefined, { _nav: true });
      }
    });
  }
  function openEntry(entry) {
    KOS.mediaEditor(entry, function () { KOS.show("shrine", undefined, { _nav: true }); });
  }

  KOS.views.shrine = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var current = prefs();
    main.appendChild(el("div", { class: "dash-head shrine-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "祠 · Hall of fame" }),
        el("h1", { text: "The Shrine" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "The works that stayed with you, ranked by your own score." })
        ])
      ]),
      el("button", { class: "btn subtle shrine-note-btn", text: current.description ? "Edit hall note" : "Add hall note", onclick: function () {
        descriptionEditor(function () { KOS.show("shrine", undefined, { _nav: true }); });
      } })
    ]));
    if (KOS.medview.unavailable(main)) return;

    var toolbar = el("div", { class: "shrine-toolbar" }, [
      el("div", { class: "shrine-filter-tabs", role: "tablist", "aria-label": "Filter Shrine by media type" }, [
        shrineFilter("All media", "", current.module),
        shrineFilter("Anime", "anime", current.module),
        shrineFilter("Books", "books", current.module),
        shrineFilter("Visual novels", "vn", current.module),
        shrineFilter("Games", "game", current.module)
      ]),
      el("label", { class: "shrine-sort" }, [
        el("span", { text: "Sort" }),
        el("select", { class: "form-in", "aria-label": "Sort Shrine" }, [
          el("option", { value: "score", text: "Personal score" }),
          el("option", { value: "updated", text: "Recently updated" }),
          el("option", { value: "title", text: "Title" })
        ])
      ])
    ]);
    var sortSelect = toolbar.querySelector("select");
    sortSelect.value = current.sort || "score";
    sortSelect.onchange = function () {
      current.sort = sortSelect.value;
      store.save();
      KOS.show("shrine", undefined, { _nav: true });
    };
    main.appendChild(toolbar);
    if (current.description) main.appendChild(el("blockquote", { class: "shrine-description", text: current.description }));

    KOS.mediadb.query({
      favourite: true,
      module: current.module || undefined,
      sort: current.sort || "score"
    }, function (err, favourites) {
      if (err) {
        main.appendChild(el("p", { class: "fc-empty", text: "Could not read the vault: " + err.message }));
        return;
      }
      if (!favourites.length) {
        main.appendChild(el("div", { class: "shrine-empty" }, [
          el("span", { class: "shrine-empty-mark", "aria-hidden": "true", text: "祠" }),
          el("div", {}, [
            el("h3", { text: current.module ? "No favourites in this wing" : "Your Hall of Fame is waiting" }),
            el("p", { text: current.module ? "Try another media type, or mark a title as a favourite." : "Mark any Collection title as a favourite and it will be ranked here automatically." })
          ]),
          current.module
            ? el("button", { class: "btn", text: "Show all media", onclick: function () {
              current.module = "";
              store.save();
              KOS.show("shrine", undefined, { _nav: true });
            } })
            : el("button", { class: "btn primary", text: "Open Collection", onclick: function () { KOS.show("matrix"); } })
        ]));
        return;
      }

      var style = KOS.governor.shrineStyle && KOS.governor.shrineStyle();
      var hall = el("section", {
        class: "shrine-hall" + (favourites.length === 1 ? " one" : "") + (style ? " " + style : ""),
        "aria-label": "Ranked Hall of Fame"
      });
      var first = favourites[0], firstMod = KOS.media.module(first.module);
      var firstMeta = shrineMeta(first);
      hall.appendChild(el("article", {
        class: "shrine-card shrine-feature top",
        tabindex: "0",
        role: "button",
        onclick: function () { openEntry(first); },
        onkeydown: function (ev) {
          if (ev.key === "Enter") {
            ev.preventDefault();
            openEntry(first);
          }
        }
      }, [
        el("span", { class: "shrine-rank", text: "#1" }),
        cover(first, firstMod, "shrine-feature-cover"),
        el("div", { class: "shrine-feature-body" }, [
          el("span", { class: "shrine-overline", text: firstMod.label + " · Featured favourite" }),
          el("h2", { text: first.title }),
          el("div", { class: "shrine-score-lockup" }, [
            el("span", { class: "shrine-score", text: first.score ? String(first.score) : "—" }),
            el("span", { text: "/ 10 personal score" })
          ]),
          el("div", { class: "shrine-feature-meta" }, firstMeta.map(function (value) { return el("span", { text: value }); })),
          el("p", { class: "shrine-feature-copy", text: "The highest-ranked work in your personal Collection." }),
          el("div", { class: "shrine-feature-actions" }, [
            el("button", { class: "btn primary", text: "✦ Create share card", onclick: function (ev) {
              ev.stopPropagation();
              KOS.shrineCard(first, 1);
            } }),
            el("button", { class: "btn", text: "Edit entry", onclick: function (ev) {
              ev.stopPropagation();
              openEntry(first);
            } })
          ])
        ])
      ]));

      if (favourites.length > 1) {
        var ranked = el("div", { class: "shrine-ranked-grid" });
        favourites.slice(1).forEach(function (entry, offset) {
          var rank = offset + 2, mod = KOS.media.module(entry.module), meta = shrineMeta(entry);
          ranked.appendChild(el("article", {
            class: "shrine-card shrine-rank-card" + (rank <= 3 ? " top" : ""),
            role: "button",
            tabindex: "0",
            onclick: function () { openEntry(entry); },
            onkeydown: function (ev) {
              if (ev.key === "Enter") {
                ev.preventDefault();
                openEntry(entry);
              }
            }
          }, [
            el("span", { class: "shrine-rank", text: "#" + rank }),
            cover(entry, mod, "shrine-rank-cover"),
            el("div", { class: "shrine-body" }, [
              el("span", { class: "shrine-overline", text: mod.label }),
              el("h3", { title: entry.title, text: entry.title }),
              el("div", { class: "shrine-row-meta" }, [
                el("span", { class: "shrine-row-score", text: entry.score ? entry.score + " / 10" : "Unrated" }),
                meta[0] ? el("span", { text: meta[0] }) : null
              ].filter(Boolean))
            ]),
            el("button", {
              class: "shrine-card-btn",
              title: "Create share card",
              "aria-label": "Create share card for rank " + rank,
              onclick: function (ev) {
                ev.stopPropagation();
                KOS.shrineCard(entry, rank);
              }
            }, [el("span", { text: "✦ Card" })])
          ]));
        });
        hall.appendChild(ranked);
      }
      main.appendChild(hall);
      main.appendChild(el("p", {
        class: "sub shrine-count",
        text: favourites.length + (favourites.length === 1 ? " enshrined title" : " enshrined titles") + " · ranks follow the selected sort."
      }));
    });
  };
})();
