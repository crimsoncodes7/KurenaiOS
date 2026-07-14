/* Kurenai OS — core/imagecrop.js
   One non-destructive image-positioning contract for avatars, heroes and
   covers. Sources remain URLs/data URLs; the companion crop is always:
     { x: 0..100, y: 0..100, zoom: 1..3 }
   Missing metadata deliberately means centred cover-fit for old records. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var el = KOS.ui.el;
  var CENTRE = { x: 50, y: 50, zoom: 1 };

  function number(v, fallback) {
    v = Number(v);
    return isFinite(v) ? v : fallback;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function value(crop) {
    crop = crop && typeof crop === "object" ? crop : {};
    return {
      x: clamp(number(crop.x, CENTRE.x), 0, 100),
      y: clamp(number(crop.y, CENTRE.y), 0, 100),
      zoom: clamp(number(crop.zoom, CENTRE.zoom), 1, 3)
    };
  }
  /* Persist null for untouched legacy/default positioning; otherwise return
     a fresh, clamped object so callers never retain a modal's working state. */
  function normalise(crop) {
    if (!crop || typeof crop !== "object") return null;
    var v = value(crop);
    return { x: round(v.x, 2), y: round(v.y, 2), zoom: round(v.zoom, 3) };
  }
  function round(v, places) {
    var p = Math.pow(10, places || 0);
    return Math.round(v * p) / p;
  }
  function same(a, b) {
    a = value(a); b = value(b);
    return a.x === b.x && a.y === b.y && a.zoom === b.zoom;
  }

  function setVars(node, crop) {
    var v = value(crop);
    node.style.setProperty("--crop-x", v.x + "%");
    node.style.setProperty("--crop-y", v.y + "%");
    node.style.setProperty("--crop-zoom", String(v.zoom));
    return node;
  }
  function apply(node, crop) {
    if (!node) return node;
    node.classList.add("crop-media");
    return setVars(node, crop);
  }
  function image(source, attrs, crop) {
    attrs = attrs || {};
    attrs.src = source;
    var node = el("img", attrs);
    return apply(node, crop);
  }

  /* Wide-image surfaces use a real child layer, not a destructively cropped
     canvas. That makes zoom behave identically for remote URLs and uploads. */
  function background(host, source, crop, opts) {
    opts = opts || {};
    clearBackground(host);
    if (!source) return null;
    host.classList.add("image-crop-host");
    var cls = "image-crop-bg" + (opts.className ? " " + opts.className : "");
    var layer = el("span", { class: cls, "aria-hidden": "true" });
    layer.appendChild(image(String(source), { alt: "", draggable: "false" }, crop));
    if (opts.overlay) {
      var shade = el("span", { class: "image-crop-shade" });
      shade.style.background = opts.overlay;
      layer.appendChild(shade);
    }
    host.insertBefore(layer, host.firstChild);
    return layer;
  }
  function clearBackground(host) {
    if (!host) return;
    var old = Array.prototype.slice.call(host.children || []).find(function (child) {
      return child.classList && child.classList.contains("image-crop-bg");
    });
    if (old) old.remove();
    host.classList.remove("image-crop-host");
  }

  /* Resize an upload as a whole image so localStorage/IndexedDB stays sane.
     This is compression, not cropping: every source pixel remains available
     for later focal/zoom changes. */
  function prepareFile(file, opts, cb) {
    opts = opts || {};
    if (!file || (file.type && !/^image\//.test(file.type))) {
      cb(new Error("Choose an image file.")); return;
    }
    var reader = new FileReader();
    reader.onerror = function () { cb(new Error("Could not read the image.")); };
    reader.onload = function () {
      var img = new Image();
      img.onerror = function () { cb(new Error("That file is not a readable image.")); };
      img.onload = function () {
        try {
          var maxW = Math.max(64, opts.maxWidth || 1800);
          var maxH = Math.max(64, opts.maxHeight || 1800);
          var scale = Math.min(1, maxW / img.width, maxH / img.height);
          var w = Math.max(1, Math.round(img.width * scale));
          var h = Math.max(1, Math.round(img.height * scale));
          var maxBytes = Math.max(40 * 1024, opts.maxBytes || 700 * 1024);
          var quality = clamp(number(opts.quality, 0.84), 0.45, 0.94);
          var mime = opts.mime || ((file.type === "image/png" || file.type === "image/webp") ? file.type : "image/jpeg");
          var data = "";
          for (var pass = 0; pass < 7; pass++) {
            var cv = document.createElement("canvas");
            cv.width = w; cv.height = h;
            var ctx = cv.getContext("2d");
            if (!ctx) throw new Error("Image processing is unavailable in this browser.");
            if (mime === "image/jpeg" && opts.background) {
              ctx.fillStyle = opts.background;
              ctx.fillRect(0, 0, w, h);
            }
            ctx.drawImage(img, 0, 0, w, h);
            data = cv.toDataURL(mime, quality);
            if (data.length <= maxBytes * 1.37 || (w <= 320 && h <= 320)) break;
            if (mime === "image/jpeg" && quality > 0.56) quality -= 0.09;
            else { w = Math.max(1, Math.round(w * 0.82)); h = Math.max(1, Math.round(h * 0.82)); }
          }
          cb(null, data, { width: w, height: h });
        } catch (e) { cb(e); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function open(opts) {
    opts = opts || {};
    var sourceAtOpen = String(opts.source || "");
    var cropAtOpen = value(opts.crop);
    var source = sourceAtOpen;
    var crop = value(cropAtOpen);
    var aspect = number(opts.aspect, 1);
    if (!(aspect > 0)) aspect = 1;
    var ready = false;
    var closed = false;
    var dragging = false;
    var dragBasis = null;
    var activeAtOpen = document.activeElement;

    var overlay = el("div", { class: "modal-ov cropper-ov", role: "dialog", "aria-modal": "true",
      "aria-label": opts.title || "Position image" });
    var modal = el("div", { class: "modal cropper-modal" });
    var preview = el("div", { class: "cropper-preview" + (opts.shape === "circle" ? " is-circle" : "") });
    preview.style.aspectRatio = String(aspect);
    var previewImg = el("img", { alt: "Crop preview", draggable: "false" });
    var marker = el("span", { class: "cropper-focus", "aria-hidden": "true" });
    var empty = el("div", { class: "cropper-empty", text: "Choose an image to begin." });
    var status = el("p", { class: "cropper-status", role: "status" });
    preview.appendChild(previewImg);
    preview.appendChild(marker);
    preview.appendChild(empty);

    function range(label, key, min, max, step) {
      var out = el("output", { class: "cropper-value" });
      var input = el("input", { type: "range", min: String(min), max: String(max), step: String(step),
        "aria-label": label });
      input.addEventListener("input", function () {
        crop[key] = Number(input.value);
        sync(false);
      });
      var row = el("label", { class: "cropper-range" }, [
        el("span", { text: label }), out, input
      ]);
      row.input = input; row.output = out;
      return row;
    }
    var zoomR = range("Zoom", "zoom", 1, 3, 0.01);
    var xR = range("Horizontal position", "x", 0, 100, 0.1);
    var yR = range("Vertical position", "y", 0, 100, 0.1);

    var saveBtn = el("button", { class: "btn primary", text: opts.saveLabel || "Save image", onclick: save });
    var urlInput = null;
    var fileInput = null;

    function setSource(next, resetCrop) {
      source = String(next || "");
      if (resetCrop !== false) crop = value(null);
      ready = false;
      previewImg.removeAttribute("src");
      if (!source) { sync(true); return; }
      status.textContent = "Loading preview…";
      previewImg.onload = function () {
        ready = true;
        status.textContent = "Drag or click the preview to set its focal point.";
        sync(false);
      };
      previewImg.onerror = function () {
        ready = false;
        status.textContent = "This image could not be loaded. Check the URL or choose another file.";
        sync(false);
      };
      previewImg.src = source;
      sync(false);
    }
    function sync(skipImage) {
      crop = value(crop);
      zoomR.input.value = String(crop.zoom);
      xR.input.value = String(crop.x);
      yR.input.value = String(crop.y);
      zoomR.output.textContent = round(crop.zoom, 2) + "×";
      xR.output.textContent = Math.round(crop.x) + "%";
      yR.output.textContent = Math.round(crop.y) + "%";
      apply(previewImg, crop);
      marker.style.left = crop.x + "%";
      marker.style.top = crop.y + "%";
      empty.hidden = !!source;
      previewImg.hidden = !source;
      marker.hidden = !source;
      saveBtn.disabled = !source || !ready;
      if (!source) status.textContent = "Choose an image to begin.";
      if (!skipImage && urlInput && document.activeElement !== urlInput && opts.allowUrl) urlInput.value = source;
    }
    /* Convert a displayed point back into the source image's percentage
       space. object-fit cover can hide source pixels before zoom, so preview
       percentages are not generally source percentages. The saved x/y then
       remain a true focal point at every destination aspect ratio. */
    function pointBasis() {
      var rect = preview.getBoundingClientRect();
      var nw = previewImg.naturalWidth || 0, nh = previewImg.naturalHeight || 0;
      if (!rect.width || !rect.height || !nw || !nh) return null;
      var fit = Math.max(rect.width / nw, rect.height / nh);
      return {
        rect: rect,
        crop: value(crop),
        width: nw * fit,
        height: nh * fit
      };
    }
    function point(e, basis) {
      if (!source || !basis) return;
      var rect = basis.rect;
      if (!rect.width || !rect.height) return;
      var qx = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      var qy = clamp((e.clientY - rect.top) / rect.height, 0, 1);
      var px = basis.crop.x / 100, py = basis.crop.y / 100;
      crop.x = clamp(100 * (px + (qx - px) * rect.width / (basis.width * basis.crop.zoom)), 0, 100);
      crop.y = clamp(100 * (py + (qy - py) * rect.height / (basis.height * basis.crop.zoom)), 0, 100);
      sync(false);
    }
    preview.addEventListener("pointerdown", function (e) {
      dragging = true;
      dragBasis = pointBasis();
      if (preview.setPointerCapture && e.pointerId != null) preview.setPointerCapture(e.pointerId);
      point(e, dragBasis);
    });
    preview.addEventListener("pointermove", function (e) { if (dragging) point(e, dragBasis); });
    preview.addEventListener("pointerup", function () { dragging = false; dragBasis = null; });
    preview.addEventListener("pointercancel", function () { dragging = false; dragBasis = null; });

    function restore() {
      crop = value(cropAtOpen);
      setSource(sourceAtOpen, false);
      if (urlInput) urlInput.value = sourceAtOpen;
    }
    function centre() { crop = value(null); sync(false); }
    function save() {
      if (!source || !ready) return;
      var result = {
        source: source,
        crop: normalise(crop),
        sourceChanged: source !== sourceAtOpen
      };
      close(true);
      if (opts.onSave) opts.onSave(result);
    }
    function close(saved) {
      if (closed) return;
      closed = true;
      document.removeEventListener("keydown", onKey, true);
      overlay.remove();
      if (activeAtOpen && document.contains(activeAtOpen) && activeAtOpen.focus) activeAtOpen.focus();
      if (!saved && opts.onCancel) opts.onCancel();
    }
    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        close(false);
      }
    }
    /* Capture keeps Escape scoped to the top cropper when it sits above an
       existing media editor; the parent modal must remain open on cancel. */
    document.addEventListener("keydown", onKey, true);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(false); });

    var sourceControls = el("div", { class: "cropper-source" });
    if (opts.allowUpload !== false) {
      fileInput = el("input", { type: "file", accept: "image/*", class: "cropper-file" });
      fileInput.addEventListener("change", function () {
        if (!fileInput.files || !fileInput.files[0]) return;
        status.textContent = "Preparing image…";
        saveBtn.disabled = true;
        prepareFile(fileInput.files[0], opts.fileOptions || {}, function (err, data) {
          if (closed) return;
          fileInput.value = "";
          if (err) {
            /* A failed replacement must not invalidate the image that was
               already loaded when the cropper opened. Re-sync first so Save
               reflects that source's ready state, then keep the useful error. */
            sync(false);
            status.textContent = err.message;
            return;
          }
          setSource(data, true);
        });
      });
      var upload = el("button", { class: "btn", text: source ? "Choose another file…" : "Choose image…",
        onclick: function () { fileInput.click(); } });
      sourceControls.appendChild(fileInput);
      sourceControls.appendChild(upload);
    }
    if (opts.allowUrl) {
      urlInput = el("input", { type: "url", class: "todo-in cropper-url", value: source,
        placeholder: "https://…", "aria-label": "Image URL" });
      urlInput.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        e.preventDefault();
        setSource(urlInput.value.trim(), true);
      });
      sourceControls.appendChild(urlInput);
      sourceControls.appendChild(el("button", { class: "btn", text: "Use URL", onclick: function () {
        setSource(urlInput.value.trim(), true);
      } }));
    }
    if (opts.originalSource && String(opts.originalSource) !== sourceAtOpen) {
      sourceControls.appendChild(el("button", { class: "btn subtle", text: opts.originalLabel || "Use original image",
        onclick: function () {
          crop = value(opts.originalCrop);
          setSource(String(opts.originalSource), false);
          if (urlInput) urlInput.value = String(opts.originalSource);
        } }));
    }
    if (opts.onRemove && sourceAtOpen) {
      sourceControls.appendChild(el("button", { class: "btn danger", text: opts.removeLabel || "Remove image",
        onclick: function () { close(true); opts.onRemove(); } }));
    }

    modal.appendChild(el("div", { class: "modal-h cropper-head" }, [
      el("div", {}, [
        el("span", { class: "modal-kicker", text: opts.kicker || "Image position" }),
        el("h3", { text: opts.title || "Position image" })
      ]),
      el("button", { class: "icon-btn", text: "✕", title: "Cancel", "aria-label": "Cancel image editing",
        onclick: function () { close(false); } })
    ]));
    if (opts.description) modal.appendChild(el("p", { class: "cropper-intro", text: opts.description }));
    modal.appendChild(sourceControls);
    modal.appendChild(el("div", { class: "cropper-work" }, [
      el("div", { class: "cropper-canvas" }, [preview, status]),
      el("div", { class: "cropper-controls" }, [
        zoomR, xR, yR,
        el("p", { class: "sub", text: "The crosshair is the focal point kept visible when this image adapts to different screen widths." }),
        el("div", { class: "cropper-small-actions" }, [
          el("button", { class: "mini-btn", text: "Centre image", onclick: centre }),
          el("button", { class: "mini-btn", text: "Reset changes", onclick: restore })
        ])
      ])
    ]));
    modal.appendChild(el("div", { class: "modal-foot cropper-foot" }, [
      el("button", { class: "btn", text: "Cancel", onclick: function () { close(false); } }),
      saveBtn
    ]));
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.cropperApi = {
      close: function () { close(false); },
      reset: restore,
      centre: centre,
      setSource: setSource,
      getValue: function () { return { source: source, crop: normalise(crop) }; }
    };
    setSource(source, false);
    var focus = sourceControls.querySelector("button, input:not(.cropper-file)") || zoomR.input;
    if (focus) focus.focus();
    return overlay;
  }

  KOS.imageCrop = {
    CENTRE: { x: 50, y: 50, zoom: 1 },
    value: value,
    normalise: normalise,
    same: same,
    apply: apply,
    image: image,
    background: background,
    clearBackground: clearBackground,
    prepareFile: prepareFile,
    open: open
  };
})();
