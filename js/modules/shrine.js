/* Kurenai OS — modules/shrine.js
   祠 The Shrine: a module-agnostic Hall of Fame for favourite Collection
   entries, with an exportable crop-aware share card. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var SHARE_TEMPLATE_URL = "assets/shrine/private-hall-template-v1.png";
  var shareTemplate = null, templateLoading = false, templateWaiters = [];

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
  function loadShareTemplate(cb) {
    if (shareTemplate) {
      cb(shareTemplate);
      return;
    }
    templateWaiters.push(cb);
    if (templateLoading) return;
    templateLoading = true;
    loadImage(SHARE_TEMPLATE_URL, false, function (img) {
      shareTemplate = img;
      templateLoading = false;
      var waiters = templateWaiters.slice();
      templateWaiters.length = 0;
      waiters.forEach(function (done) { done(img); });
    });
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
    var requested = [document.fonts.ready];
    if (document.fonts.load) {
      requested.push(document.fonts.load("600 72px 'Shrine Display'"));
      requested.push(document.fonts.load("italic 500 34px 'Shrine Display'"));
      requested.push(document.fonts.load("600 20px 'Shrine Inscription'"));
    }
    Promise.all(requested).then(go).catch(go);
    setTimeout(go, 1800);
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
  function starPath(ctx, cx, cy, outer, inner) {
    ctx.beginPath();
    for (var point = 0; point < 10; point++) {
      var radius = point % 2 ? inner : outer;
      var angle = -Math.PI / 2 + point * Math.PI / 5;
      var x = cx + Math.cos(angle) * radius, y = cy + Math.sin(angle) * radius;
      if (!point) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  function drawStars(ctx, x, y, score, accent) {
    var full = Math.round((Number(score) || 0) / 2);
    for (var i = 0; i < 5; i++) {
      starPath(ctx, x + i * 31, y, 12, 5.2);
      ctx.fillStyle = i < full ? accent : "rgba(255,243,214,.16)";
      ctx.fill();
      ctx.strokeStyle = i < full ? "rgba(255,236,184,.8)" : "rgba(255,243,214,.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  function drawFlower(ctx, x, y, size, colour) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = colour;
    for (var i = 0; i < 5; i++) {
      ctx.save();
      ctx.rotate(i * Math.PI * 2 / 5);
      ctx.beginPath();
      ctx.ellipse(0, -size * .42, size * .22, size * .42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, size * .16, 0, Math.PI * 2);
    ctx.fillStyle = "#F8E3AA";
    ctx.fill();
    ctx.restore();
  }
  function drawCorner(ctx, x, y, sx, sy, accent) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.quadraticCurveTo(2, 4, 34, 0);
    ctx.moveTo(7, 27);
    ctx.quadraticCurveTo(15, 13, 29, 7);
    ctx.stroke();
    ctx.fillStyle = accent;
    [[9, 22, 3.2], [17, 13, 2.6], [27, 7, 2]].forEach(function (leaf) {
      ctx.beginPath();
      ctx.ellipse(leaf[0], leaf[1], leaf[2], leaf[2] * .55, -.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }
  function drawPetal(ctx, x, y, size, rotation, colour) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * .7, -size * .45, size * .55, size * .55, 0, size);
    ctx.bezierCurveTo(-size * .5, size * .35, -size * .6, -size * .45, 0, -size);
    ctx.fill();
    ctx.restore();
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
  function drawFittedTitle(ctx, text, x, y, maxWidth, maxHeight) {
    var size = 82, lines = [];
    while (size >= 46) {
      ctx.font = "600 " + size + "px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
      lines = lineSet(ctx, text, maxWidth);
      if (lines.length <= 3 && lines.length * size * 1.02 <= maxHeight) break;
      size -= 4;
    }
    if (lines.length > 3) {
      lines = lines.slice(0, 3);
      lines[2] = lines[2].replace(/[.,;:]?$/, "…");
    }
    var lineHeight = size * 1.02;
    lines.forEach(function (line, index) { ctx.fillText(line, x, y + index * lineHeight); });
  }
  function fittedValue(ctx, value, maxWidth, maxSize) {
    var size = maxSize;
    while (size > 22) {
      ctx.font = "600 " + size + "px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
      if (ctx.measureText(String(value)).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }
  function drawCrop(ctx, entry, coverImage, mod, x, y, width, height) {
    ctx.save();
    roundRect(ctx, x, y, width, height, 22);
    ctx.clip();
    var sourceW = coverImage ? (coverImage.naturalWidth || coverImage.width || 0) : 0;
    var sourceH = coverImage ? (coverImage.naturalHeight || coverImage.height || 0) : 0;
    if (coverImage && sourceW > 0 && sourceH > 0) {
      var crop = KOS.imageCrop.value(entry.coverCrop);
      var scale = Math.max(width / sourceW, height / sourceH) * crop.zoom;
      var sampleW = Math.min(sourceW, width / scale);
      var sampleH = Math.min(sourceH, height / scale);
      var sampleX = (sourceW - sampleW) * crop.x / 100;
      var sampleY = (sourceH - sampleH) * crop.y / 100;
      ctx.drawImage(coverImage, sampleX, sampleY, sampleW, sampleH, x, y, width, height);
    } else {
      var fallback = ctx.createLinearGradient(x, y, x + width, y + height);
      fallback.addColorStop(0, "#191222");
      fallback.addColorStop(1, "#30151F");
      ctx.fillStyle = fallback;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = "rgba(247,220,161,.16)";
      ctx.font = "240px 'Shippori Mincho', serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(mod.kanji, x + width / 2, y + height / 2);
    }
    ctx.restore();
  }
  function metadataGlyph(label) {
    return ({ CREATOR: "✦", STUDIO: "工", EPISODES: "話", VOLUMES: "冊", ROUTES: "路", PLAYTIME: "時", PLATFORM: "遊", GENRE: "類", STATUS: "録" })[label] || "✦";
  }
  function renderTemplateCard(entry, coverImage, rank, message, cb, template) {
    var width = 1536, height = 1024, canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var mod = KOS.media.module(entry.module), gold = "#DDAF58", paleGold = "#F4DDA1", ivory = "#FFF6E4";
    ctx.drawImage(template, 0, 0, width, height);

    /* The raster owns the ceremony and the apertures. Entry data is typeset
       into those apertures so it reads as one designed object, not a stack of
       dashboard panels composited over artwork. */
    drawCrop(ctx, entry, coverImage, mod, 128, 173, 463, 694);
    ctx.strokeStyle = "rgba(255,237,185,.8)";
    ctx.lineWidth = 2;
    roundRect(ctx, 128, 173, 463, 694, 22);
    ctx.stroke();

    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = paleGold;
    ctx.shadowColor = "rgba(226,155,51,.3)";
    ctx.shadowBlur = 8;
    ctx.font = "600 23px 'Shrine Inscription', Cinzel, serif";
    ctx.fillText("✿  KURENAI · PRIVATE HALL", 96, 72);
    ctx.shadowBlur = 0;

    ctx.fillStyle = gold;
    ctx.font = "600 20px 'Shrine Inscription', Cinzel, serif";
    ctx.fillText(mod.label.toUpperCase() + " · PERSONAL ARCHIVE", 668, 151);
    ctx.fillStyle = ivory;
    ctx.shadowColor = "rgba(0,0,0,.62)";
    ctx.shadowBlur = 12;
    drawFittedTitle(ctx, entry.title, 668, 192, 570, 176);
    ctx.shadowBlur = 0;

    ctx.textAlign = "center";
    ctx.fillStyle = gold;
    ctx.font = "600 18px 'Shrine Inscription', Cinzel, serif";
    ctx.fillText("RANK", 1353, 120);
    ctx.fillStyle = ivory;
    ctx.font = "600 70px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(String(rank || 1).padStart(2, "0"), 1353, 151);

    var score = Number(entry.score || 0), scoreText = score ? String(score) : "—";
    ctx.fillStyle = ivory;
    ctx.shadowColor = "rgba(226,155,51,.48)";
    ctx.shadowBlur = 18;
    ctx.font = "600 178px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(scoreText, 803, 409);
    ctx.shadowBlur = 0;
    ctx.fillStyle = gold;
    ctx.font = "600 15px 'Shrine Inscription', Cinzel, serif";
    ctx.fillText("PERSONAL SCORE / 10", 803, 580);
    drawStars(ctx, 741, 628, score, gold);

    var metadata = cardMetadata(entry), metaCenters = [477, 606];
    ctx.textAlign = "center";
    metadata.forEach(function (item, index) {
      var centerY = metaCenters[index];
      ctx.fillStyle = paleGold;
      ctx.font = "600 31px 'Shrine Inscription', Cinzel, serif";
      ctx.fillText(metadataGlyph(item[0]), 1012, centerY - 18);
      ctx.textAlign = "left";
      ctx.fillStyle = gold;
      ctx.font = "600 16px 'Shrine Inscription', Cinzel, serif";
      ctx.fillText(item[0], 1075, centerY - 35);
      ctx.fillStyle = ivory;
      var value = String(item[1]);
      var valueSize = fittedValue(ctx, value, 292, 35);
      ctx.font = "600 " + valueSize + "px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
      ctx.fillText(value, 1075, centerY - 6);
      ctx.textAlign = "center";
    });

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(221,175,88,.32)";
    ctx.font = "italic 500 72px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
    ctx.fillText("“", 684, 714);
    ctx.fillStyle = "rgba(255,246,228,.94)";
    ctx.font = "italic 500 34px 'Shrine Display', 'Cormorant Garamond', Georgia, serif";
    wrapText(ctx, message || defaultMessage(entry), 744, 745, 610, 40, 3);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(244,221,161,.74)";
    ctx.font = "500 16px 'Shrine Inscription', Cinzel, serif";
    ctx.fillText("CURATED IN KURENAIOS · PERSONAL COLLECTION", width / 2, 945);
    cb(canvas);
  }
  function renderCard(entry, coverImage, rank, message, cb, template) {
    if (template) {
      renderTemplateCard(entry, coverImage, rank, message, cb, template);
      return;
    }
    var width = 900, height = 560, canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var mod = KOS.media.module(entry.module), accent = mod.accent || "#B08A3E";
    var gold = "#D7A949", paleGold = "#F4DDA1", ivory = "#FFF5E2";
    var bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#090D19");
    bg.addColorStop(.52, "#130E1C");
    bg.addColorStop(1, "#2A101B");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    /* Ceremonial private-hall card: hand-drawn rails, a rank pennant and
       blossom work make the export feel earned rather than dashboard-like. */
    ctx.strokeStyle = paleGold;
    ctx.lineWidth = 2;
    roundRect(ctx, 12, 10, width - 24, height - 20, 18);
    ctx.stroke();
    ctx.strokeStyle = "rgba(215,169,73,.72)";
    ctx.lineWidth = 1;
    roundRect(ctx, 24, 22, width - 48, height - 44, 13);
    ctx.stroke();
    ctx.strokeStyle = "rgba(215,169,73,.32)";
    roundRect(ctx, 29, 27, width - 58, height - 54, 11);
    ctx.stroke();
    drawCorner(ctx, 29, 27, 1, 1, paleGold);
    drawCorner(ctx, width - 29, 27, -1, 1, paleGold);
    drawCorner(ctx, 29, height - 27, 1, -1, paleGold);
    drawCorner(ctx, width - 29, height - 27, -1, -1, paleGold);

    ctx.globalAlpha = .08;
    ctx.strokeStyle = gold;
    for (var arc = 0; arc < 6; arc++) {
      ctx.beginPath();
      ctx.arc(606, 308, 76 + arc * 34, Math.PI * 1.05, Math.PI * 1.93);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    drawPetal(ctx, 776, 214, 9, .8, "rgba(225,112,132,.72)");
    drawPetal(ctx, 82, 355, 7, -.6, "rgba(225,112,132,.54)");
    drawPetal(ctx, 822, 462, 10, .45, "rgba(225,112,132,.62)");

    drawFlower(ctx, 54, 52, 11, paleGold);
    ctx.fillStyle = paleGold;
    ctx.font = "600 13px 'Fraunces', Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("KURENAI · PRIVATE HALL", 75, 44);
    ctx.strokeStyle = "rgba(215,169,73,.66)";
    ctx.beginPath();
    ctx.moveTo(238, 52);
    ctx.lineTo(354, 52);
    ctx.stroke();
    ctx.fillStyle = paleGold;
    ctx.fillRect(351, 49, 6, 6);

    var imageX = 58, imageY = 94, imageW = 292, imageH = 408;
    ctx.fillStyle = "rgba(215,169,73,.32)";
    roundRect(ctx, imageX + 8, imageY + 8, imageW, imageH, 16);
    ctx.fill();
    ctx.save();
    roundRect(ctx, imageX, imageY, imageW, imageH, 16);
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
    ctx.strokeStyle = paleGold;
    ctx.lineWidth = 2;
    roundRect(ctx, imageX, imageY, imageW, imageH, 16);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,239,198,.62)";
    ctx.lineWidth = 1;
    roundRect(ctx, imageX + 5, imageY + 5, imageW - 10, imageH - 10, 12);
    ctx.stroke();
    drawFlower(ctx, imageX + imageW / 2, imageY - 2, 10, paleGold);

    var bodyX = 390, bodyW = width - bodyX - 52;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = gold;
    ctx.font = "700 10px 'IBM Plex Mono', monospace";
    ctx.fillText(mod.label.toUpperCase() + " · PERSONAL ARCHIVE", bodyX, 86);
    ctx.strokeStyle = "rgba(215,169,73,.56)";
    ctx.beginPath();
    ctx.moveTo(bodyX + 202, 92);
    ctx.lineTo(704, 92);
    ctx.stroke();
    ctx.fillStyle = ivory;
    ctx.font = "600 35px 'Fraunces', Georgia, serif";
    wrapText(ctx, entry.title, bodyX, 112, 350, 39, 3);

    /* The pennant owns rank; it never shares geometry with title or score. */
    var pennantX = 775, pennantY = 24, pennantW = 86, pennantH = 166;
    ctx.fillStyle = "rgba(74,21,32,.94)";
    ctx.beginPath();
    ctx.moveTo(pennantX, pennantY);
    ctx.lineTo(pennantX + pennantW, pennantY);
    ctx.lineTo(pennantX + pennantW, pennantY + pennantH - 22);
    ctx.lineTo(pennantX + pennantW / 2, pennantY + pennantH);
    ctx.lineTo(pennantX, pennantY + pennantH - 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = paleGold;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(215,169,73,.56)";
    ctx.beginPath();
    ctx.moveTo(pennantX + 6, pennantY + 6);
    ctx.lineTo(pennantX + pennantW - 6, pennantY + 6);
    ctx.lineTo(pennantX + pennantW - 6, pennantY + pennantH - 27);
    ctx.lineTo(pennantX + pennantW / 2, pennantY + pennantH - 8);
    ctx.lineTo(pennantX + 6, pennantY + pennantH - 27);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = paleGold;
    ctx.textAlign = "center";
    ctx.font = "700 10px 'IBM Plex Mono', monospace";
    ctx.fillText("RANK", pennantX + pennantW / 2, pennantY + 45);
    ctx.fillStyle = ivory;
    ctx.font = "600 38px 'Fraunces', Georgia, serif";
    ctx.fillText(String(rank || 1).padStart(2, "0"), pennantX + pennantW / 2, pennantY + 64);
    drawFlower(ctx, pennantX + pennantW / 2, pennantY + 128, 7, paleGold);

    var score = Number(entry.score || 0);
    var scoreX = bodyX, scoreY = 280, scoreW = bodyW, scoreH = 116;
    ctx.fillStyle = "rgba(10,11,24,.72)";
    roundRect(ctx, scoreX, scoreY, scoreW, scoreH, 18);
    ctx.fill();
    ctx.strokeStyle = "rgba(215,169,73,.72)";
    ctx.lineWidth = 1;
    roundRect(ctx, scoreX, scoreY, scoreW, scoreH, 18);
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillStyle = ivory;
    ctx.font = "600 54px 'Fraunces', Georgia, serif";
    ctx.fillText(score ? String(score) : "—", scoreX + 24, scoreY + 12);
    ctx.fillStyle = gold;
    ctx.font = "700 9px 'IBM Plex Mono', monospace";
    ctx.fillText("PERSONAL SCORE / 10", scoreX + 25, scoreY + 73);
    drawStars(ctx, scoreX + 28, scoreY + 100, score, gold);
    ctx.strokeStyle = "rgba(215,169,73,.28)";
    ctx.beginPath();
    ctx.moveTo(scoreX + 192, scoreY + 14);
    ctx.lineTo(scoreX + 192, scoreY + scoreH - 14);
    ctx.stroke();

    var metadata = cardMetadata(entry), metaX = scoreX + 214, metaW = scoreW - 232;
    metadata.forEach(function (item, index) {
      var y = scoreY + 14 + index * 47;
      if (index) {
        ctx.strokeStyle = "rgba(215,169,73,.28)";
        ctx.beginPath();
        ctx.moveTo(metaX, y - 7);
        ctx.lineTo(metaX + metaW, y - 7);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(metaX + 15, y + 16, 13, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(215,169,73,.1)";
      ctx.fill();
      ctx.strokeStyle = "rgba(215,169,73,.55)";
      ctx.stroke();
      ctx.fillStyle = gold;
      ctx.font = "700 10px 'IBM Plex Mono', monospace";
      ctx.fillText(item[0], metaX + 38, y + 1);
      ctx.fillStyle = ivory;
      ctx.font = "600 14px 'Fraunces', Georgia, serif";
      ctx.fillText(String(item[1]).slice(0, 26), metaX + 38, y + 18);
    });

    ctx.fillStyle = "rgba(37,20,35,.82)";
    roundRect(ctx, bodyX, 414, bodyW, 78, 15);
    ctx.fill();
    ctx.strokeStyle = "rgba(215,169,73,.66)";
    roundRect(ctx, bodyX, 414, bodyW, 78, 15);
    ctx.stroke();
    ctx.fillStyle = "rgba(215,169,73,.25)";
    ctx.font = "italic 42px 'Fraunces', Georgia, serif";
    ctx.fillText("“", bodyX + 18, 418);
    ctx.fillStyle = "rgba(255,245,226,.9)";
    ctx.font = "italic 15px 'Fraunces', Georgia, serif";
    wrapText(ctx, message || defaultMessage(entry), bodyX + 46, 432, bodyW - 64, 20, 2);
    ctx.fillStyle = "rgba(244,221,161,.62)";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CURATED IN KURENAIOS · PERSONAL COLLECTION", 594, 519);
    ctx.fillRect(468, 523, 252, 1);
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
    var templateImage = null, templateReady = false;
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
    KOS.ui.openDialog(overlay);

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
      if (closed || !coverInfo || !templateReady) return;
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
      }, templateImage);
    }
    message.addEventListener("input", function () {
      if (renderTimer) clearTimeout(renderTimer);
      renderTimer = setTimeout(paint, 160);
    });
    whenFontsReady(function () {
      if (closed) return;
      loadShareTemplate(function (img) {
        templateImage = img;
        templateReady = true;
        paint();
      });
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
  KOS.shrineLoadShareTemplate = loadShareTemplate;
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
  function shrineStats(entries) {
    var scored = entries.filter(function (entry) { return Number(entry.score) > 0; });
    var average = scored.length ? scored.reduce(function (sum, entry) { return sum + Number(entry.score); }, 0) / scored.length : 0;
    var modules = {};
    entries.forEach(function (entry) { modules[entry.module] = (modules[entry.module] || 0) + 1; });
    return {
      average: average ? average.toFixed(1) : "—",
      completed: entries.filter(function (entry) { return entry.status === "completed"; }).length,
      modules: modules,
      wings: Object.keys(modules).length
    };
  }
  function hallLedger(entries) {
    var stats = shrineStats(entries);
    var completion = entries.length ? Math.round(stats.completed / entries.length * 100) : 0;
    function line(label, detail, value, tone) {
      return el("div", { class: "wl-ledger-line shrine-ledger-line" + (tone ? " " + tone : "") }, [
        el("div", { class: "wl-ledger-copy" }, [
          el("span", { class: "wl-ledger-label", text: label }),
          el("span", { class: "wl-ledger-detail", text: detail })
        ]),
        el("b", { text: value })
      ]);
    }
    var represented = ["anime", "books", "vn", "game"].filter(function (module) { return stats.modules[module]; })
      .map(function (module) { return KOS.media.module(module).label; });
    return el("aside", { class: "wl-budget shrine-ledger", "aria-label": "Hall statistics" }, [
      el("div", { class: "wl-budget-head shrine-ledger-head" }, [
        el("div", {}, [el("span", { class: "wl-sum-h", text: "Hall ledger" }), el("h2", { class: "wl-budget-title", text: "Collection standing" })]),
        el("span", { class: "shrine-ledger-seal", "aria-hidden": "true", text: "祠" })
      ]),
      el("div", { class: "wl-allowance-main shrine-ledger-primary" }, [
        el("span", { class: "k", text: "Average personal score" }),
        el("b", { text: stats.average === "—" ? "—" : stats.average + " / 10" }),
        el("span", { class: "sub", text: entries.length + (entries.length === 1 ? " favourite defines" : " favourites define") + " this Hall of Fame." })
      ]),
      el("div", { class: "wl-ledger shrine-ledger-lines" }, [
        line("Enshrined", "Titles currently carrying favourite status.", String(entries.length)),
        line("Completed", "Finished works among the current ranks.", String(stats.completed), "is-actual"),
        line("Media wings", represented.join(" · ") || "No represented media yet.", String(stats.wings))
      ]),
      el("div", { class: "wl-meter-block shrine-ledger-meter" }, [
        el("div", { class: "wl-meter-copy" }, [
          el("span", { text: "Hall completion" }),
          el("b", { text: completion + "% complete" })
        ]),
        el("div", { class: "wl-meter" }, [el("span", { class: "wl-meter-fill", style: "width:" + completion + "%" })])
      ])
    ]);
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
    KOS.ui.openDialog(overlay);
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
        main.appendChild(KOS.ui.emptyState({
          className: "shrine-empty",
          mark: "祠",
          title: current.module ? "No favourites in this wing" : "Your Hall of Fame is waiting",
          body: current.module ? "Try another media type, or mark a title as a favourite." : "Mark any Collection title as a favourite and it will be ranked here automatically.",
          action: current.module
            ? el("button", { class: "btn", text: "Show all media", onclick: function () {
              current.module = "";
              store.save();
              KOS.show("shrine", undefined, { _nav: true });
            } })
            : el("button", { class: "btn primary", text: "Open Collection", onclick: function () { KOS.show("matrix"); } })
        }));
        return;
      }

      var style = KOS.governor.shrineStyle && KOS.governor.shrineStyle();
      var hall = el("section", {
        class: "shrine-hall" + (favourites.length === 1 ? " one" : "") + (style ? " " + style : ""),
        "aria-label": "Ranked Hall of Fame"
      });
      var first = favourites[0], firstMod = KOS.media.module(first.module);
      var firstMeta = shrineMeta(first);
      /* Phase F: the rank-one feature carries its own "Create share card"
         and "Edit entry" buttons, so it was an ARIA button wrapping two
         real ones. It keeps the pointer shortcut and drops the role — the
         keyboard path is the Edit button that was always there. */
      var feature = el("article", {
        class: "wl-hero wl-hero-feature shrine-feature" + (first.coverUrl ? " has-banner" : ""),
        style: "--accent:" + (firstMod.accent || "var(--accent2)"),
        onclick: function () { openEntry(first); }
      }, [
        el("div", { class: "wl-hero-badge shrine-feature-rank", text: "◆ Rank 01 · Hall of Fame" }),
        !first.coverUrl ? el("span", { class: "wl-hero-ph", text: firstMod.kanji }) : null,
        el("div", { class: "wl-hero-body shrine-feature-body" }, [
          el("div", { class: "wl-hero-status", text: "Featured favourite" }),
          el("div", { class: "wl-hero-tags" }, [
            el("span", { class: "wl-priority-pill", text: firstMod.kanji + " " + firstMod.label }),
            el("span", { class: "wl-priority-pill", text: "Personal rank #1" })
          ]),
          el("h2", { class: "wl-hero-title", text: first.title }),
          firstMeta[0] ? el("p", { class: "wl-hero-meta", text: firstMeta[0] }) : null,
          el("dl", { class: "wl-hero-facts" }, [
            el("div", {}, [el("dt", { text: "Personal score" }), el("dd", { class: "shrine-score", text: first.score ? String(first.score) + " / 10" : "Not scored" })]),
            el("div", {}, [el("dt", { text: "Progress" }), el("dd", { text: firstMeta[1] || (KOS.media.STATUS_LABEL[first.status] || "In collection") })])
          ]),
          el("div", { class: "wl-hero-actions shrine-feature-actions" }, [
            el("button", { class: "btn primary", text: "✦ Create share card", onclick: function (ev) {
              ev.stopPropagation();
              KOS.shrineCard(first, 1);
            } }),
            el("button", { class: "btn", text: "Edit entry", onclick: function (ev) {
              ev.stopPropagation();
              openEntry(first);
            } })
          ])
        ].filter(Boolean))
      ]);
      if (first.coverUrl) KOS.imageCrop.background(feature, first.coverUrl, first.coverCrop, {
        overlay: "linear-gradient(100deg, color-mix(in srgb, var(--bg0) 94%, transparent) 0%, color-mix(in srgb, var(--bg0) 74%, transparent) 52%, color-mix(in srgb, var(--bg0) 26%, transparent) 100%)"
      });
      hall.appendChild(el("div", { class: "shrine-stage" }, [feature, hallLedger(favourites)]));

      if (favourites.length > 1) {
        var ranked = el("div", { class: "shrine-ranked-grid" });
        favourites.slice(1).forEach(function (entry, offset) {
          var rank = offset + 2, mod = KOS.media.module(entry.module), meta = shrineMeta(entry);
          /* Phase F: a ranked card holds its own "Share card" button, so
             the card is not a button; its title is. */
          ranked.appendChild(el("article", {
            class: "shrine-card shrine-rank-card" + (rank <= 3 ? " top" : ""),
            onclick: function () { openEntry(entry); }
          }, [
            el("span", { class: "shrine-rank", text: "#" + rank }),
            cover(entry, mod, "shrine-rank-cover"),
            el("div", { class: "shrine-body" }, [
              el("span", { class: "shrine-overline", text: mod.label }),
              el("h3", {}, [el("button", { type: "button", class: "shrine-title-btn",
                title: entry.title, text: entry.title,
                onclick: function (ev) { ev.stopPropagation(); openEntry(entry); } })]),
              el("div", { class: "shrine-row-meta" }, [
                meta[0] ? el("span", { text: meta[0] }) : null,
                meta[1] ? el("span", { text: meta[1] }) : null
              ].filter(Boolean)),
              el("div", { class: "shrine-row-foot" }, [
                el("span", { class: "shrine-row-score" }, [
                  el("b", { text: entry.score ? String(entry.score) : "—" }),
                  el("span", { text: "/ 10" })
                ]),
                el("button", {
                  class: "shrine-card-btn",
                  title: "Create share card",
                  "aria-label": "Create share card for rank " + rank,
                  onclick: function (ev) {
                    ev.stopPropagation();
                    KOS.shrineCard(entry, rank);
                  }
                }, [el("span", { text: "✦ Share card" })])
              ])
            ])
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
