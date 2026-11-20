/* Kurenai OS — modules/inktex.js · KOS.inkTeX
   Copy maths as TeX (1C, UR-13, decision D2), loaded on first use (the
   ink-tex bundle). The selection goes out as a picture with a ready prompt
   for Claude or Gemini on the web; their reply comes back, is cleaned
   (KOS.ink.geo.cleanTex), and is kept only once the app's own KaTeX renders
   it. No model in the app reads ink (invariant 135). */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink, G = I.geo;
  function el() { return KOS.ui.el.apply(null, arguments); }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  var dialog = function (o) { return KOS.inkUI.dialog(o); };
  function selectionPicture(page, ids, cb) {
    var set = {}; ids.forEach(function (id) { set[id] = 1; });
    var items = (page.items || []).filter(function (it) { return set[it.id]; });
    var box = G.boxOf(items, items.map(function (x) { return x.id; }));
    if (!box || !KOS.inkExport) { cb(null); return; }
    KOS.inkExport.pageCanvas({ id: "tex", items: items, paper: "blank", h: I.pageH(page) }, { px: 1654 }, function (c) {
      var k = c.width / I.W, pad = 24;
      var sx = Math.max(0, (box.x - pad) * k), sy = Math.max(0, (box.y - pad) * k);
      var sw = Math.min(c.width - sx, (box.w + 2 * pad) * k), sh = Math.min(c.height - sy, (box.h + 2 * pad) * k);
      var out = document.createElement("canvas"), x = out.getContext && out.getContext("2d");
      if (!x || sw < 2 || sh < 2) { cb(null); return; }
      out.width = Math.round(sw); out.height = Math.round(sh);
      x.drawImage(c, sx, sy, sw, sh, 0, 0, out.width, out.height);
      KOS.inkExport.canvasBlob(out, "image/png").then(function (b) { cb(b, out.toDataURL("image/png")); }, function () { cb(null); });
    });
  }
  function texCheck(tex) {
    if (!tex) return { ok: false, why: "Paste the TeX reply first." };
    if (!window.katex || !window.katex.renderToString) return { ok: false, why: "The maths renderer hasn't loaded (it needs the network once)." };
    try { return { ok: true, html: window.katex.renderToString(tex, { throwOnError: true, displayMode: true, output: "html" }) }; }
    catch (e) { return { ok: false, why: "It doesn't render: " + String(e && e.message || e).replace(/^KaTeX parse error:\s*/, "") }; }
  }
  function texDialog(sf, ids) {
    var page = sf.page, picBlob = null;
    dialog({ title: "Copy as TeX", className: "k-ink-tex-dialog", hook: "ink.tex", wide: true, render: function (body, close, foot) {
      var pic = el("img", { class: "k-ink-tex-pic", alt: "The selected writing", "data-ui": "ink.tex-pic" });
      var picNote = el("p", { class: "k-ink-pop-note", text: "Making the picture…" });
      function copied(ok, what) { KOS.ui.toast(ok ? what + " copied." : "That couldn't be copied here; use Save picture instead.", !ok); }
      var copyPic = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ink.tex-copy-pic", text: "Copy picture", disabled: "", onclick: function () {
        if (!picBlob) return;
        if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) navigator.clipboard.write([new window.ClipboardItem({ "image/png": picBlob })]).then(function () { copied(true, "Picture"); }, function () { copied(false); });
        else copied(false);
      } });
      var savePic = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ink.tex-save-pic", text: "Save picture", disabled: "", onclick: function () { if (picBlob) KOS.inkExport.deliver(picBlob, "maths.png"); } });
      var copyPrompt = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ink.tex-copy-prompt", text: "Copy the prompt", onclick: function () {
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(G.TEX_PROMPT).then(function () { copied(true, "Prompt"); }, function () { copied(false); });
        else copied(false);
      } });
      body.appendChild(el("p", { class: "k-kicker", text: "1 · Send it" }));
      body.appendChild(el("p", { class: "k-ink-pop-note", text: "Give Claude or Gemini on the web this picture and the prompt. Nothing in the app reads your writing." }));
      body.appendChild(el("div", { class: "k-ink-tex-row" }, [pic, el("div", { class: "k-cluster" }, [copyPic, savePic, copyPrompt])]));
      body.appendChild(picNote);
      var reply = el("textarea", { class: "k-input k-ink-tex-in", rows: "4", "aria-label": "The TeX reply", placeholder: "Paste the reply here", "data-ui": "ink.tex-reply" });
      var preview = el("div", { class: "k-ink-tex-out", "data-ui": "ink.tex-preview", "aria-live": "polite" });
      var keep = el("button", { type: "button", class: "k-btn", "data-ui": "ink.tex-keep", text: "Keep it on the page", disabled: "" });
      var copyTex = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "ink.tex-copy", text: "Copy TeX", disabled: "" });
      var good = null;
      function check() {
        var tex = G.cleanTex(reply.value), r = texCheck(tex);
        preview.innerHTML = "";
        good = r.ok ? tex : null;
        if (r.ok) preview.innerHTML = r.html;
        else if (reply.value.trim()) preview.appendChild(el("p", { class: "k-ink-tex-err", "data-ui": "ink.tex-error", text: r.why }));
        [keep, copyTex].forEach(function (b) { if (good) b.removeAttribute("disabled"); else b.setAttribute("disabled", ""); });
      }
      /* KaTeX is quick: each keystroke checks at once */
      reply.addEventListener("input", check);
      body.appendChild(el("p", { class: "k-kicker", text: "2 · Paste the reply" }));
      body.appendChild(reply);
      body.appendChild(preview);
      copyTex.addEventListener("click", function () {
        if (!good) return;
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(good).then(function () { copied(true, "TeX"); close(); }, function () { copied(false); });
        else copied(false);
      });
      keep.addEventListener("click", function () {
        if (!good) return;
        var set = {}; ids.forEach(function (id) { set[id] = 1; });
        var box = G.boxOf(page.items, ids) || { x: 60, y: 60, w: 0, h: 0 };
        sf.addItems([{ id: I.uid(), k: "text", tex: true, role: "ink", x: Math.round(box.x), y: Math.round(Math.min(I.pageH(page) - 40, box.y + box.h + 16)), s: good, sz: 16 }]);
        announce("The TeX is on the page under the writing.");
        close();
      });
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Close", onclick: close }));
      foot.appendChild(keep); foot.appendChild(copyTex);
      body._check = check;
      selectionPicture(page, ids, function (blob, url) {
        picBlob = blob;
        if (!blob) { picNote.textContent = "The picture couldn't be made here; copy the prompt and send a screenshot instead."; return; }
        pic.src = url; picNote.remove();
        copyPic.removeAttribute("disabled"); savePic.removeAttribute("disabled");
      });
    } });
  }
  KOS.inkTeX = { open: texDialog, check: texCheck, picture: selectionPicture };
})();
