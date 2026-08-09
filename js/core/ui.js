/* Kurenai OS — core/ui.js */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else if (k === "style") node.style.cssText = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  var toastTimer = null;
  function toast(msg, bad) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2600);
  }

  var savedTimer = null;
  function flashSaved() {
    var s = document.getElementById("save-dot");
    if (!s) return;
    s.classList.add("pulse");
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { s.classList.remove("pulse"); }, 900);
  }

  /* the canonical HTML escaper — every hand-built HTML string goes through
     this one (content.js, hub.js and the labs alias it; do not redefine) */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* the canonical trailing-edge debounce — search boxes, autosaving inputs */
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  /* ============================================================
     THE DIALOG PRIMITIVE  (Category 7 Phase B — audit G-10/G-11/U-03/U-04)

     Before this, every one of the app's ~30 modals was a bare <div> on a
     scrim: no role="dialog", no aria-modal, no accessible name, no focus
     trap (Tab from the last control walked off into the page behind), no
     body scroll lock, and no focus restoration on close. Screen-reader
     users could not tell a modal had opened; keyboard users fell behind
     the scrim and could not get back.

     openDialog() is now the ONE way a modal enters the document. It takes
     an overlay the caller has already built — the visual design of each
     modal stays exactly where it was — and adds the behaviour every dialog
     must have. There is deliberately no styling here.

     opts:
       label        accessible name when the modal has no visible heading
       labelledBy   an element to name it from (default: the first
                    .modal-h b / h2 / h3 / .confirm-title found)
       initialFocus element to focus on open (default: the first control
                    that is not destructive, else the box itself)
       escape       false to opt out of Escape-closes (a nested cropper)
       onClose      run when the dialog leaves the document, however it left
     ============================================================ */
  var dialogStack = [];
  var dlgSeq = 0;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]),' +
    ' select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

  function focusablesIn(root) {
    return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (n) {
      if (n.closest("[hidden]")) return false;
      /* offsetParent is null for display:none — jsdom reports 0 for
         everything, so fall back to "not explicitly hidden" there */
      if (typeof n.offsetParent === "undefined") return true;
      return !!(n.offsetParent || n.getClientRects().length || !document.body.offsetParent);
    });
  }

  function openDialog(overlay, opts) {
    opts = opts || {};
    var box = overlay.querySelector(".modal, .confirm-modal, [data-dialog-box]") || overlay;
    var restoreTo = document.activeElement;

    box.setAttribute("role", box.getAttribute("role") || "dialog");
    box.setAttribute("aria-modal", "true");
    if (!box.hasAttribute("tabindex")) box.setAttribute("tabindex", "-1");
    if (!box.getAttribute("aria-labelledby") && !box.getAttribute("aria-label")) {
      var head = opts.labelledBy || box.querySelector(".modal-h b, .confirm-title, .modal-h h2, .modal-h h3, h2, h3");
      if (head) {
        if (!head.id) head.id = "kos-dlg-h" + (++dlgSeq);
        box.setAttribute("aria-labelledby", head.id);
      } else if (opts.label) {
        box.setAttribute("aria-label", opts.label);
      }
    }
    /* the page behind must not scroll under the scrim, and must not lose
       its scroll position when the dialog closes (that is why this is a
       class and a counter, not an inline style stashed per dialog) */
    document.body.classList.add("modal-open");

    function onKey(e) {
      if (dialogStack[dialogStack.length - 1] !== rec) return;   /* topmost only */
      if (e.key === "Escape" && opts.escape !== false) {
        e.preventDefault();
        /* several modals still carry their own document-level Escape
           handler; this listener is in the capture phase, so stopping
           propagation here keeps a close path from running twice */
        e.stopPropagation();
        closeIt();
        return;
      }
      if (e.key !== "Tab") return;
      var list = focusablesIn(box);
      if (!list.length) { e.preventDefault(); box.focus(); return; }
      var first = list[0], last = list[list.length - 1];
      var active = document.activeElement;
      if (e.shiftKey && (active === first || active === box || !box.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (active === last || !box.contains(active))) {
        e.preventDefault(); first.focus();
      }
    }
    function closeIt() {
      if (typeof overlay.close === "function") overlay.close();
      else overlay.remove();
    }
    function teardown() {
      var i = dialogStack.indexOf(rec);
      if (i === -1) return;
      dialogStack.splice(i, 1);
      document.removeEventListener("keydown", onKey, true);
      if (!dialogStack.length) document.body.classList.remove("modal-open");
      if (restoreTo && restoreTo.focus && document.contains(restoreTo)) {
        try { restoreTo.focus(); } catch (e) { /* detached input */ }
      }
      if (opts.onClose) opts.onClose();
    }

    var rec = { overlay: overlay, box: box, teardown: teardown };
    dialogStack.push(rec);
    document.addEventListener("keydown", onKey, true);

    /* teardown must run however the dialog left: overlay.remove(), a
       parent removeChild, or a whole-subtree replacement. One observer on
       body catches all three; the remove() wrapper keeps it synchronous
       for the common path (and for jsdom, where observers are async). */
    var nativeRemove = overlay.remove;
    overlay.remove = function () { teardown(); overlay.remove = nativeRemove; return nativeRemove.call(overlay); };
    if (typeof window.MutationObserver === "function") {
      var mo = new window.MutationObserver(function () {
        if (!document.contains(overlay)) { mo.disconnect(); teardown(); }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    document.body.appendChild(overlay);

    var target = opts.initialFocus;
    if (!target) {
      /* never the destructive button — see U-04. A dialog that opens with
         Delete focused is one keystroke from data loss. */
      var list = focusablesIn(box).filter(function (n) { return !n.classList.contains("danger"); });
      target = list[0] || box;
    }
    try { target.focus(); } catch (e) { /* jsdom detached */ }
    return overlay;
  }

  /* the dialog currently on top — used by the toast layer so a status
     message is never rendered under a scrim (audit B-10/G-26) */
  function topDialog() { return dialogStack.length ? dialogStack[dialogStack.length - 1].overlay : null; }

  /* ---- the in-app confirm modal ----
     Native window.confirm is banned in this app — every destructive action
     asks through this. Callback-based (can't be synchronous like the native
     one). opts: {title, body, confirm, cancel, danger}. Test hook:
     window.__kosAutoConfirm === true resolves onYes immediately (headless).

     Phase B: Enter no longer confirms a `danger` dialog and initial focus
     is Cancel. Two keystrokes used to delete (audit G-11/U-04) — the
     Enter-to-confirm shortcut survives only where the answer is safe. */
  function confirmModal(opts, onYes, onNo) {
    if (typeof opts === "string") opts = { body: opts };
    opts = opts || {};
    if (window.__kosAutoConfirm) { onYes && onYes(); return; }
    var overlay = el("div", { class: "modal-ov confirm-ov", onclick: function (e) { if (e.target === overlay) close(false); } });
    var settled = false;
    function close(yes) {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKey);
      overlay.remove();
      if (yes) { onYes && onYes(); } else { onNo && onNo(); }
    }
    /* Escape is handled by openDialog; only the affirmative shortcut lives
       here, and only when saying yes cannot destroy anything */
    function onKey(e) { if (e.key === "Enter" && !opts.danger) close(true); }
    document.addEventListener("keydown", onKey);
    overlay.close = function () { close(false); };
    var cancelBtn = el("button", { class: "btn", text: opts.cancel || "Cancel", onclick: function () { close(false); } });
    var confirmBtn = el("button", { class: "btn " + (opts.danger ? "danger" : "primary"),
      text: opts.confirm || (opts.danger ? "Delete" : "Confirm"), onclick: function () { close(true); } });
    var title = el("h3", { class: "confirm-title", text: opts.title || (opts.danger ? "Are you sure?" : "Confirm") });
    var box = el("div", { class: "modal confirm-modal" + (opts.danger ? " danger" : "") }, [
      el("div", { class: "confirm-glyph", "aria-hidden": "true", text: opts.danger ? "⚠" : "?" }),
      title,
      opts.body ? el("p", { class: "confirm-body", text: opts.body }) : null,
      el("div", { class: "confirm-foot" }, [cancelBtn, confirmBtn])
    ].filter(Boolean));
    box.setAttribute("role", "alertdialog");
    overlay.appendChild(box);
    openDialog(overlay, { labelledBy: title, initialFocus: opts.danger ? cancelBtn : confirmBtn });
  }

  /* ---- number formatting (audit U-27) ----
     "12344 gold" everywhere. One helper, used by the HUD, the hero and the
     Gold Shop, so a balance never reads as a raw integer again. */
  function num(n) {
    var v = Number(n);
    if (!isFinite(v)) return String(n);
    return v.toLocaleString(undefined, { maximumFractionDigits: Math.abs(v) < 10 && v % 1 ? 1 : 0 });
  }

  KOS.ui = { el: el, toast: toast, flashSaved: flashSaved, esc: esc, debounce: debounce,
    confirm: confirmModal, openDialog: openDialog, topDialog: topDialog, num: num };

  // ---- view registry: each module registers render functions ----
  KOS.views = {};

  /* ---- navigation history: Back/Forward like a browser ---- */
  var navHist = [];   // pages behind the current one
  var navFwd = [];    // pages we've stepped Back from (cleared on a fresh nav)
  var navCur = null;  // the view currently on screen
  function navKey(v) { return v.viewId + "::" + JSON.stringify(v.arg === undefined ? null : v.arg); }
  function updateNavBtns() {
    var b = document.getElementById("nav-back");
    if (b) b.disabled = navHist.length === 0;
    var f = document.getElementById("nav-fwd");
    if (f) f.disabled = navFwd.length === 0;
  }
  KOS.canBack = function () { return navHist.length > 0; };
  KOS.canForward = function () { return navFwd.length > 0; };
  /* what is ACTUALLY on screen, as opposed to state.ui.view (which is the
     last saved intent and can lag a redraw). Background work that wants to
     refresh the page without moving the user reads this. */
  KOS.currentNav = function () { return navCur ? { viewId: navCur.viewId, arg: navCur.arg } : null; };
  /* redraw the current page in place: no history entry, no forward-trail
     reset, and the reader keeps their scroll position. */
  KOS.rerender = function () {
    if (!navCur || !KOS.views[navCur.viewId]) return false;
    var main = document.getElementById("main");
    var top = main ? main.scrollTop : 0;
    KOS.show(navCur.viewId, navCur.arg, { _nav: true });
    if (main) main.scrollTop = top;
    return true;
  };
  KOS.back = function () {
    if (!navHist.length) return;
    navFwd.push(navCur);
    var prev = navHist.pop();
    KOS.show(prev.viewId, prev.arg, { _nav: true });
  };
  KOS.forward = function () {
    if (!navFwd.length) return;
    navHist.push(navCur);
    var next = navFwd.pop();
    KOS.show(next.viewId, next.arg, { _nav: true });
  };

  /* ---- sections: seven rail entries, each owning a family of views.
     The rail carries the section; the subnav (in-page, above #main)
     carries the views inside it. ---- */
  var SECTION_OF = {
    home: "home",
    subject: "study", ref: "study", review: "study", due: "study", cardstats: "study",
    tracker: "study", personaldeck: "study", assignments: "study",
    worked: "study", trace: "study", oop: "study", sims: "study",
    focus: "productivity", calendar: "productivity", tasks: "productivity",
    reminders: "productivity",
    matrix: "collection", anime: "collection", books: "collection",
    vn: "collection", game: "collection", seasonal: "collection",
    mangaka: "collection", wishlist: "collection", shrine: "collection",
    goals: "collection",
    aniprofile: "collection", vndbprofile: "collection", mediasync: "collection",
    governor: "governor",
    assistant: "assistant",
    data: "system", help: "system"
  };
  /* subnav entries per section: [label, viewId, arg, pcId] — null = divider */
  var SUBNAV = {
    study: [
      ["Computer Science", "subject", "compsci", "pc-compsci"],
      ["Mathematics", "subject", "maths", "pc-maths"],
      ["IT · Data Analytics", "subject", "it", "pc-it"],
      null,
      ["Review", "review"],
      ["Assignments", "assignments"],
      ["Exams & Papers", "tracker"],
    ],
    productivity: [
      ["Focus Timer", "focus"],
      ["Reminders", "reminders"],
      ["Habits", "tasks"],
      ["Calendar", "calendar"]
    ],
    collection: [
      ["Overview", "matrix"],
      ["Anime", "anime"],
      ["Books", "books"],
      ["Visual Novels", "vn"],
      ["Games", "game"],
      ["Shrine", "shrine"],
      null,
      ["Planner", "wishlist"],
      ["Sync", "mediasync"]
    ],
    system: [
      ["Backup & Restore", "data"],
      ["Help & Guide", "help"]
    ]
  };
  KOS.sectionOf = function (viewId) { return SECTION_OF[viewId] || null; };
  /* the landing view when a rail section button is pressed */
  KOS.sectionLanding = function (sec) {
    if (sec === "study") return ["subject", KOS.store.state.ui.subject || "compsci"];
    return [{ home: "home", productivity: "focus", collection: "matrix", governor: "governor",
      assistant: "assistant", system: "data" }[sec] || "home", undefined];
  };
  KOS.collectionCrumbs = function (area, page) {
    return el("div", { class: "crumbs collection-crumbs", "aria-label": "Collection navigation" }, [
      "Collection", " / ", el("b", { text: area }),
      page ? [" / ", el("b", { text: page })] : null
    ].flat().filter(Boolean));
  };
  /* ============================================================
     THE TABS PRIMITIVE  (Category 7 Phase B — audit G-23/U-12)

     Three idioms were doing one job: .subnav-item (the section nav),
     .study-tab (KOS.workspaceTabs — Review, Planner, Sync, Governor, the
     ref-page strip) and the bespoke Books "Digital / Physical Vault" cards.
     Users had to learn the same control three times, and on Reminders two
     of them sat 60px apart offering the same three destinations.

     One builder, three VARIANTS — because the three do have genuinely
     different jobs and forcing them to look identical would be worse:

       "primary"    the section nav strip under the topbar. Navigation, so
                    it stays a <nav> of links-as-buttons, not a tablist.
       "workspace"  the compact in-page switcher. A real tablist.
       "card"       a two-line switcher with a kanji mark and a hint, for
                    the few places where the choice needs explaining.

     items: [{ label, hint, glyph, active, onSelect, countId, count, sep }]
     opts:  { variant, label, className }
     ============================================================ */
  var TAB_SHAPE = {
    primary:   { list: "tabs-primary subnav-strip", item: "subnav-item", nav: true },
    workspace: { list: "study-tabs", item: "study-tab" },
    card:      { list: "tabs-cards", item: "tab-card" }
  };
  KOS.ui.tabs = function (items, opts) {
    opts = opts || {};
    var shape = TAB_SHAPE[opts.variant] || TAB_SHAPE.workspace;
    var attrs = { class: shape.list + (opts.className ? " " + opts.className : ""),
      "aria-label": opts.label || "Sections" };
    if (!shape.nav) attrs.role = "tablist";
    return el("div", attrs, (items || []).map(function (it) {
      if (!it || it.sep) return el("span", { class: "subnav-sep", "aria-hidden": "true" });
      var btn = el("button", { type: "button",
        class: shape.item + (it.active ? " active" : "") + (it.className ? " " + it.className : ""),
        title: it.hint || null,
        onclick: function (ev) { if (it.onSelect) it.onSelect(ev); } });
      if (!shape.nav) {
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", String(!!it.active));
      } else if (it.active) {
        btn.setAttribute("aria-current", "page");
      }
      if (shape.item === "tab-card") {
        if (it.glyph) btn.appendChild(el("span", { class: "tab-card-k", "aria-hidden": "true", text: it.glyph }));
        btn.appendChild(el("span", { class: "tab-card-txt" }, [
          el("b", { text: it.label }),
          it.hint ? el("span", { class: "sub tab-card-hint", text: it.hint }) : null
        ].filter(Boolean)));
      } else {
        btn.appendChild(el("span", { class: "lbl", text: it.label }));
        if (it.countId || it.count != null) {
          var c = el("span", { class: shape.nav ? "pc" : "tab-n" });
          if (it.countId) c.id = it.countId;
          if (it.count != null) c.textContent = String(it.count);
          btn.appendChild(c);
        }
      }
      return btn;
    }));
  };

  /* Shared compact workspace switcher. Planner, Sync and Study Review use the
     same semantics and visual rhythm without forcing their page content alike.
     Now a thin adapter over KOS.ui.tabs — the legacy [label, view, arg, id]
     tuple shape is preserved because a dozen call sites speak it. */
  KOS.workspaceTabs = function (items, current, label, className) {
    return KOS.ui.tabs((items || []).map(function (item) {
      return { label: item[0], active: (item[3] || item[1]) === current,
        onSelect: function () { KOS.show(item[1], item[2]); } };
    }), { variant: "workspace", label: label, className: className });
  };
  KOS.collectionWorkspaceTabs = function (area, current) {
    var groups = {
      planner: [["Budget Planner", "wishlist"], ["Goals", "goals"]],
      sync: [["AniList", "aniprofile"], ["VNDB", "vndbprofile"], ["Sync & Import", "mediasync"]]
    };
    return KOS.workspaceTabs(groups[area], current,
      area === "planner" ? "Planner pages" : "Sync pages", "collection-workspace-tabs");
  };

  /* ============================================================
     PAGE AND SECTION HEADERS  (audit §8 "Section headers")

     Three patterns existed: .dh-kicker + h1 + .dh-sub, ALL-CAPS --muted
     mini-headers, and a bare h2/h3. These two builders emit the first
     pattern, which is the one the good pages already use — the class names
     are unchanged so every existing .dh-* rule and every test that keys
     off them keeps working.
     ============================================================ */
  function pageHeader(opts) {
    opts = opts || {};
    return el("div", { class: "dash-head page-header" + (opts.className ? " " + opts.className : "") }, [
      el("div", { class: "dh-txt" }, [
        opts.kicker ? el("div", { class: "dh-kicker", text: opts.kicker }) : null,
        el("h1", { text: opts.title || "" }),
        opts.sub ? el("p", { class: "dh-sub", text: opts.sub }) : null
      ].filter(Boolean)),
      opts.actions && opts.actions.length
        ? el("div", { class: "dh-actions" }, opts.actions.filter(Boolean)) : null
    ].filter(Boolean));
  }
  function sectionHeader(opts) {
    opts = opts || {};
    return el("div", { class: "section-header" + (opts.className ? " " + opts.className : "") }, [
      el("div", { class: "section-header-txt" }, [
        el("h2", { text: opts.title || "" }),
        opts.sub ? el("p", { class: "sub", text: opts.sub }) : null
      ].filter(Boolean)),
      opts.actions && opts.actions.length
        ? el("div", { class: "section-header-actions" }, opts.actions.filter(Boolean)) : null
    ].filter(Boolean));
  }

  /* ============================================================
     EMPTY STATE  (audit U-20 / REV-3 / REM-2)

     "Empty states occupy card-sized boxes rather than collapsing" — the app
     could look emptier when full than when it was blank. One builder, two
     densities: `compact` is a single line with an inline action, which is
     what a page with other content on it should use; the full form is for
     a page whose ONLY content is the absence.
     ============================================================ */
  function emptyState(opts) {
    opts = opts || {};
    var node = el("div", { class: "empty-state" + (opts.compact ? " compact" : "")
      + (opts.className ? " " + opts.className : "") }, [
      opts.mark ? el("span", { class: "empty-state-mark", "aria-hidden": "true", text: opts.mark }) : null,
      el("div", { class: "empty-state-txt" }, [
        opts.title ? el("b", { text: opts.title }) : null,
        opts.body ? el("p", { text: opts.body }) : null
      ].filter(Boolean)),
      opts.action ? el("div", { class: "empty-state-action" }, [opts.action]) : null
    ].filter(Boolean));
    return node;
  }

  /* ============================================================
     STAT TILE  (audit U-17 / REV-1 / GOV-4 / MTX-5)

     At least three "stat tile" variants existed, and the app happily
     rendered six cards all reading 0 to an active user. `suppressZero`
     lets a caller ask for the tile only when it carries information;
     it returns null, so `.filter(Boolean)` drops it from the row.
     ============================================================ */
  function statTile(opts) {
    opts = opts || {};
    var zero = opts.value === 0 || opts.value === "0" || opts.value == null || opts.value === "";
    if (opts.suppressZero && zero) return null;
    /* invariant #26: reuse the existing class names — .stat-card is what
       every view, stylesheet rule and test already speaks. The primitive
       adds behaviour (zero suppression, locale formatting, the shared
       low/mid/high tone ramp), not a fifth card surface. */
    return el("div", { class: "stat-card" + (opts.tone ? " tone-" + opts.tone : "")
      + (zero ? " is-zero" : "") + (opts.className ? " " + opts.className : "") }, [
      el("div", { class: "v", text: zero && opts.emptyText ? opts.emptyText
        : (typeof opts.value === "number" ? num(opts.value) : String(opts.value == null ? "—" : opts.value)) }),
      el("div", { class: "k", text: opts.label || "" }),
      opts.sub ? el("div", { class: "stat-card-sub", text: opts.sub }) : null
    ].filter(Boolean));
  }

  /* ============================================================
     SCROLL AFFORDANCE  (audit MTX-1 / U-29 / SUBJ-3)

     The app has two deliberate horizontal scrollers — Collection's
     "Currently consuming" cover strip and the subject desk's unit band.
     Both were bare `overflow-x: auto`: no arrows, no edge fade, and the
     last card sliced by the container edge, which reads as a rendering
     bug rather than an invitation. The responsive probe counts every card
     past the viewport as unreachable content, and it is right to — until
     the scroller says out loud that it scrolls.

     scroller(node) wraps a scrolling element in that contract: edge fades
     that appear only on the side there is more content, arrow buttons that
     page by ~80% of the visible width, and real keyboard access. It sets
     data-scroller on the wrapper, which is the marker the probe honours —
     so an undeclared sideways scroll still fails the audit.
     ============================================================ */
  function scroller(node, opts) {
    opts = opts || {};
    var wrap = el("div", { class: "u-scroller" + (opts.className ? " " + opts.className : ""),
      "data-scroller": "true" });
    var prev = el("button", { type: "button", class: "u-scroller-arrow prev", text: "‹",
      "aria-label": opts.prevLabel || "Scroll left", tabindex: "-1" });
    var next = el("button", { type: "button", class: "u-scroller-arrow next", text: "›",
      "aria-label": opts.nextLabel || "Scroll right", tabindex: "-1" });
    node.classList.add("u-scroller-track");
    node.setAttribute("tabindex", "0");
    node.setAttribute("role", "group");
    if (opts.label) node.setAttribute("aria-label", opts.label);
    wrap.appendChild(prev); wrap.appendChild(node); wrap.appendChild(next);

    function page(dir) { node.scrollBy({ left: dir * Math.max(160, node.clientWidth * 0.8), behavior: "smooth" }); }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    node.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); page(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); }
    });
    function sync() {
      var max = node.scrollWidth - node.clientWidth;
      var atStart = node.scrollLeft <= 1, atEnd = node.scrollLeft >= max - 1;
      wrap.classList.toggle("at-start", atStart || max <= 1);
      wrap.classList.toggle("at-end", atEnd || max <= 1);
      wrap.classList.toggle("no-scroll", max <= 1);
    }
    node.addEventListener("scroll", sync, { passive: true });
    if (typeof window.ResizeObserver === "function") { try { new window.ResizeObserver(sync).observe(node); } catch (e) { /* jsdom */ } }
    sync();
    setTimeout(sync, 60);   /* after images and lazy rows land */
    wrap.sync = sync;
    return wrap;
  }

  /* ============================================================
     MENU BUTTON  (audit VLT-3 / U-13, Category 7 Phase D)

     Books stacked seventeen controls in three rows before a single cover;
     Anime eleven, Games nine, VN eleven. Nothing had priority, so nothing
     was discoverable — "Profile" sat beside "+ Add", "Seasonal" beside
     "List". The fix is not smaller buttons: it is that a vault shows the
     three controls you use on every visit (search, sort, layout) and puts
     the rest behind two named groups.

     This is the primitive those groups are made of, and it is deliberately
     ONE implementation for both shapes a group needs:

       items:   a real `role="menu"` of commands (the Actions ▾ group) with
                arrow/Home/End roving focus and type-ahead-free simplicity.
       content: a labelled panel of arbitrary controls (the Filters ▾
                group, which holds selects — a select is not a menuitem and
                pretending otherwise lies to a screen reader).

     Both forms share the button contract (`aria-haspopup`, `aria-expanded`),
     the dismissal contract (Escape, outside pointer, scroll of an ancestor,
     Tab out) and focus restoration to the button. The panel is
     position:fixed and flipped to stay on screen, because #app is
     overflow:hidden and an absolutely-positioned panel would be clipped.

     It is NOT a dialog: openDialog (invariant #49) traps focus and locks
     body scroll, which is correct for a modal and wrong for a menu you
     dismiss by looking away. Modals still go through openDialog.
     ============================================================ */
  var openMenu = null;
  function closeOpenMenu(restoreFocus) {
    if (!openMenu) return;
    var m = openMenu;
    openMenu = null;
    document.removeEventListener("keydown", m.onKey, true);
    document.removeEventListener("pointerdown", m.onDown, true);
    window.removeEventListener("resize", m.onDismiss, true);
    window.removeEventListener("scroll", m.onDismiss, true);
    if (m.panel.parentNode) m.panel.parentNode.removeChild(m.panel);
    m.btn.setAttribute("aria-expanded", "false");
    m.btn.classList.remove("is-open");
    if (restoreFocus && document.body.contains(m.btn)) m.btn.focus();
  }
  KOS.ui.closeMenu = function () { closeOpenMenu(false); };

  function menu(opts) {
    opts = opts || {};
    var btn = el("button", {
      type: "button",
      class: "btn menu-btn" + (opts.className ? " " + opts.className : ""),
      title: opts.hint || null,
      "aria-haspopup": opts.items ? "menu" : "true",
      "aria-expanded": "false"
    }, [
      el("span", { class: "menu-btn-lbl", text: opts.label || "More" }),
      opts.badgeId || opts.badge != null
        ? el("span", { class: "menu-btn-n", id: opts.badgeId || null,
            text: opts.badge != null ? String(opts.badge) : "" })
        : null,
      el("span", { class: "menu-btn-caret", "aria-hidden": "true", text: "▾" })
    ].filter(Boolean));

    function place(panel) {
      var r = btn.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      panel.style.visibility = "hidden";
      panel.style.left = "0px"; panel.style.top = "0px";
      document.body.appendChild(panel);
      var pw = panel.offsetWidth, ph = panel.offsetHeight;
      var left = opts.align === "start" ? r.left : r.right - pw;
      left = Math.max(8, Math.min(left, vw - pw - 8));
      var top = r.bottom + 6;
      if (top + ph > vh - 8) top = Math.max(8, r.top - ph - 6);
      panel.style.left = Math.round(left) + "px";
      panel.style.top = Math.round(top) + "px";
      panel.style.visibility = "";
    }

    function open() {
      if (openMenu && openMenu.btn === btn) { closeOpenMenu(true); return; }
      closeOpenMenu(false);
      var panel = el("div", { class: "menu-panel" + (opts.panelClass ? " " + opts.panelClass : "") });
      var focusables = [];
      if (opts.items) {
        panel.setAttribute("role", "menu");
        panel.setAttribute("aria-label", opts.label || "Menu");
        (opts.items || []).filter(Boolean).forEach(function (it) {
          if (it.sep) { panel.appendChild(el("div", { class: "menu-sep", role: "separator" })); return; }
          if (it.heading) { panel.appendChild(el("div", { class: "menu-heading", text: it.heading })); return; }
          var item = el("button", { type: "button", role: "menuitem", tabindex: "-1",
            class: "menu-item" + (it.className ? " " + it.className : ""),
            onclick: function (ev) { closeOpenMenu(false); if (it.onSelect) it.onSelect(ev); } }, [
            it.glyph ? el("span", { class: "menu-item-k", "aria-hidden": "true", text: it.glyph }) : null,
            el("span", { class: "menu-item-txt" }, [
              el("span", { class: "menu-item-lbl", text: it.label }),
              it.hint ? el("span", { class: "menu-item-hint", text: it.hint }) : null
            ].filter(Boolean))
          ].filter(Boolean));
          focusables.push(item);
          panel.appendChild(item);
        });
      } else {
        panel.setAttribute("role", "group");
        panel.setAttribute("aria-label", opts.label || "Options");
        if (opts.content) panel.appendChild(opts.content);
        if (opts.render) opts.render(panel, function () { closeOpenMenu(true); });
      }

      function onKey(ev) {
        if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); closeOpenMenu(true); return; }
        if (ev.key === "Tab") {
          /* let focus leave, but do not leave a floating panel behind */
          setTimeout(function () {
            if (openMenu && !panel.contains(document.activeElement) && document.activeElement !== btn) closeOpenMenu(false);
          }, 0);
          return;
        }
        if (!focusables.length) return;
        var i = focusables.indexOf(document.activeElement);
        if (ev.key === "ArrowDown") { ev.preventDefault(); focusables[(i + 1 + focusables.length) % focusables.length].focus(); }
        else if (ev.key === "ArrowUp") { ev.preventDefault(); focusables[(i - 1 + focusables.length) % focusables.length].focus(); }
        else if (ev.key === "Home") { ev.preventDefault(); focusables[0].focus(); }
        else if (ev.key === "End") { ev.preventDefault(); focusables[focusables.length - 1].focus(); }
      }
      function onDown(ev) {
        if (panel.contains(ev.target) || btn.contains(ev.target)) return;
        closeOpenMenu(false);
      }
      function onDismiss(ev) {
        if (ev && ev.type === "scroll" && panel.contains(ev.target)) return;
        closeOpenMenu(false);
      }
      openMenu = { btn: btn, panel: panel, onKey: onKey, onDown: onDown, onDismiss: onDismiss };
      place(panel);
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("is-open");
      document.addEventListener("keydown", onKey, true);
      document.addEventListener("pointerdown", onDown, true);
      window.addEventListener("resize", onDismiss, true);
      window.addEventListener("scroll", onDismiss, true);
      if (focusables.length) focusables[0].focus();
      else {
        var first = panel.querySelector("input, select, textarea, button, [tabindex]:not([tabindex='-1'])");
        if (first) first.focus();
      }
    }

    btn.addEventListener("click", function (ev) { ev.preventDefault(); ev.stopPropagation(); open(); });
    btn.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" && !openMenu) { ev.preventDefault(); open(); }
    });
    btn.setBadge = function (n) {
      var b = btn.querySelector(".menu-btn-n");
      if (!b) return;
      b.textContent = n ? String(n) : "";
      b.classList.toggle("hidden", !n);
    };
    btn.closeMenu = function () { if (openMenu && openMenu.btn === btn) closeOpenMenu(false); };
    return btn;
  }

  KOS.ui.pageHeader = pageHeader;
  KOS.ui.sectionHeader = sectionHeader;
  KOS.ui.emptyState = emptyState;
  KOS.ui.statTile = statTile;
  KOS.ui.scroller = scroller;
  KOS.ui.menu = menu;

  function renderSubnav(sec, viewId, arg) {
    var nav = document.getElementById("subnav");
    if (!nav) return;
    var items = SUBNAV[sec];
    nav.innerHTML = "";
    if (!items) { nav.classList.add("hidden"); return; }
    nav.classList.remove("hidden");
    /* which entry is lit: the view itself, or the owning subject for ref pages */
    var activeView = viewId, activeArg = arg;
    if (viewId === "ref" && arg) { activeView = "subject"; activeArg = arg.subject; }
    if (viewId === "seasonal" || viewId === "mangaka") activeView = "anime";
    if (viewId === "due" || viewId === "cardstats") activeView = "review";
    if (["goals"].indexOf(viewId) !== -1) activeView = "wishlist";
    if (["aniprofile", "vndbprofile"].indexOf(viewId) !== -1) activeView = "mediasync";
    /* built through the shared tabs primitive (variant "primary") so the
       section strip, the workspace switchers and the Books lens cards are
       one component with three variants rather than three components */
    var strip = KOS.ui.tabs(items.map(function (it) {
      if (!it) return { sep: true };
      return { label: it[0], countId: it[3] || null,
        active: it[1] === activeView && (it[2] === undefined || it[2] === activeArg),
        onSelect: function () { KOS.show(it[1], it[2]); } };
    }), { variant: "primary", label: "Section" });
    while (strip.firstChild) nav.appendChild(strip.firstChild);
    if (KOS.refreshRailCounters) KOS.refreshRailCounters();
  }

  KOS.show = function (viewId, arg, opts) {
    opts = opts || {};
    /* a fresh navigation (not Back/Forward) records history and abandons any
       forward trail — exactly like a browser address bar */
    if (navCur && !opts._nav) {
      if (navKey(navCur) !== navKey({ viewId: viewId, arg: arg })) {
        navHist.push(navCur);
        if (navHist.length > 60) navHist.shift();
      }
      navFwd = [];
    }
    navCur = { viewId: viewId, arg: arg };

    /* A menu panel is position:fixed on document.body, so clearing #main
       does not remove it: without this, navigating with a menu open left a
       floating popover over the new page, still wired to controls that no
       longer exist. (Found by smoke11, where a stale Filters panel from a
       previous mount kept answering queries for the current one.) */
    closeOpenMenu(false);

    var main = document.getElementById("main");
    main.innerHTML = "";
    main.scrollTop = 0;
    /* subject views set a per-subject --accent on #main; without this reset
       it leaks into every later view (vault bars picked up the last subject
       hue). Views that want an accent set it themselves. */
    main.style.removeProperty("--accent");
    /* exactly one rail section lit: the one owning this view. Views outside
       any section (none today) highlight nothing. */
    var sec = SECTION_OF[viewId] || null;
    document.querySelectorAll(".rail-item").forEach(function (b) {
      b.classList.toggle("active", !!sec && b.dataset.section === sec);
    });
    renderSubnav(sec, viewId, arg);
    if (KOS.views[viewId]) KOS.views[viewId](main, arg);
    KOS.store.state.ui.view = viewId;
    if (viewId === "subject") KOS.store.state.ui.subject = arg;
    KOS.store.save();
    updateNavBtns();
  };
})();
