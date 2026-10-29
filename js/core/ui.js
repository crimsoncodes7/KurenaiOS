/* Kurenai OS — core/ui.js */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ============================================================
     HOOKS AND STATE  (UI rebuild M1; the bridge retired at M14)

     Behaviour and tests find the DOM through data-ui / data-state /
     data-intent, never through a presentation class (docs/ui-rebuild/
     view-contracts.md §0.1). Every view writes its hooks itself; the
     legacy-class table (js/core/ui-hooks.js) that derived them for the
     pre-rebuild markup is gone. Each attribute is a space-separated token
     list, matched with [data-ui~="name"].
     ============================================================ */
  function tokens(v) { return v ? String(v).trim().split(/\s+/).filter(Boolean) : []; }
  /* className = … : sets the class (setAttribute: SVG's className is not a
     string); hooks are the markup's own and are left alone */
  function setClass(node, cls) {
    node.setAttribute("class", cls);
    return node;
  }
  /* a state word: the class (presentation) and the data-state token move
     together. Returns the state. */
  function state(node, word, on) {
    if (!node) return false;
    var val = node.classList.toggle(word, on === undefined ? undefined : !!on);
    var have = tokens(node.getAttribute("data-state")).filter(function (t) { return t !== word; });
    if (val) have.push(word);
    if (have.length) node.setAttribute("data-state", have.join(" "));
    else node.removeAttribute("data-state");
    return val;
  }
  function hasState(node, word) { return !!node && tokens(node.getAttribute("data-state")).indexOf(word) !== -1; }
  /* markup that arrived through innerHTML carries its own hooks; kept as a
     seam for callers, it derives nothing now */
  function hookify(root) { return root; }
  /* the selector for a hook — for code that queries: KOS.ui.hook("vault.card") */
  function hook(name) { return '[data-ui~="' + name + '"]'; }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else if (k === "style") node.setAttribute("style", attrs[k]);
        /* Phase F: `title: opts.hint || null` is the house idiom for an
           optional attribute, and setAttribute stringifies — so every tab
           and menu button without a hint was shipping title="null", which
           shows as a tooltip and joins the accessible description. An
           absent value now means an absent attribute. */
        else if (attrs[k] === null || attrs[k] === undefined) { /* omit */ }
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
  /* action (optional): {label, run} — one button in the toast ("View in
     Transactions", "Undo"), held for 8 seconds instead of 2.6. The spoken
     half is still the message alone; the button is a pointer convenience
     (the toast is aria-hidden), so whatever it does must also be reachable
     on the page. */
  function toast(msg, bad, action) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    if (action && action.label) {
      t.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-toast-act", tabindex: "-1", text: action.label,
        onclick: function () { t.removeAttribute("data-state"); action.run && action.run(); } }));
    }
    t.setAttribute("data-state", "show" + (bad ? " bad" : "") + (action ? " action" : ""));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.removeAttribute("data-state"); }, action ? 8000 : 2600);
    /* Phase F: #toast is the VISIBLE half and is aria-hidden; the spoken
       half goes through the one live region, so the same sentence twice
       running still announces twice and a failure interrupts rather than
       queueing behind a confirmation. */
    if (KOS.a11y) KOS.a11y.announce(msg, { assertive: !!bad });
  }

  var savedTimer = null;
  function flashSaved() {
    var s = document.getElementById("save-dot");
    if (!s) return;
    KOS.ui.state(s, "pulse", true);
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { KOS.ui.state(s, "pulse", false); }, 900);
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
    var box = overlay.querySelector("[data-ui~='ui.dialog'], [data-ui~='ui.confirm'], [data-dialog-box]") || overlay;
    var restoreTo = document.activeElement;
    /* every dialog gets the shared frame and its hooks, however it was
       built — idempotent for markup that already carries them */
    overlay.classList.add("k-dialog-overlay");
    if (box !== overlay) box.classList.add("k-dialog");
    /* the hooks every dialog carries, however it was built */
    function hook(n, h) { var v = n.getAttribute("data-ui") || ""; if ((" " + v + " ").indexOf(" " + h + " ") === -1) n.setAttribute("data-ui", (v + " " + h).trim()); }
    hook(overlay, "ui.dialog-overlay");
    if (box !== overlay) hook(box, "ui.dialog");

    box.setAttribute("role", box.getAttribute("role") || "dialog");
    box.setAttribute("aria-modal", "true");
    if (!box.hasAttribute("tabindex")) box.setAttribute("tabindex", "-1");
    if (!box.getAttribute("aria-labelledby") && !box.getAttribute("aria-label")) {
      var head = opts.labelledBy || box.querySelector("[data-ui~='ui.dialog-head'] b, [data-ui~='ui.dialog-title'], [data-ui~='ui.dialog-head'] h2, [data-ui~='ui.dialog-head'] h3, h2, h3");
      if (head) {
        if (!head.id) head.id = "kos-dlg-h" + (++dlgSeq);
        box.setAttribute("aria-labelledby", head.id);
      } else if (opts.label) {
        box.setAttribute("aria-label", opts.label);
      }
    }
    /* the page behind must not scroll under the scrim, and must not lose
       its scroll position when the dialog closes (that is why this is an
       attribute cleared with the last dialog, not an inline style stashed
       per dialog) */
    document.documentElement.setAttribute("data-scroll-lock", "");

    function onKey(e) {
      if (dialogStack[dialogStack.length - 1] !== rec) return;   /* topmost only */
      /* a popover open inside the dialog (the topic picker's panel) owns
         its own Escape and Tab until it closes */
      if ((e.key === "Escape" || e.key === "Tab") && e.target && e.target.closest && e.target.closest("[data-keys-local]")) return;
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
      if (!dialogStack.length) {
        document.documentElement.removeAttribute("data-scroll-lock");
      }
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
      var list = focusablesIn(box).filter(function (n) { return !n.matches('[data-intent~="danger"]'); });
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
    var overlay = el("div", { class: "k-dialog-overlay", "data-ui": "ui.dialog-overlay ui.confirm-overlay",
      onclick: function (e) { if (e.target === overlay) close(false); } });
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
    var cancelBtn = el("button", { type: "button", class: "k-btn", "data-ui": "ui.confirm-no",
      text: opts.cancel || "Cancel", onclick: function () { close(false); } });
    var confirmBtn = el("button", { type: "button", class: "k-btn " + (opts.danger ? "k-btn--danger" : "k-btn--primary"),
      "data-ui": "ui.confirm-yes", "data-intent": opts.danger ? "danger" : "primary",
      text: opts.confirm || (opts.danger ? "Delete" : "Confirm"), onclick: function () { close(true); } });
    var title = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: opts.title || (opts.danger ? "Are you sure?" : "Confirm") });
    var box = el("div", { class: "k-dialog", "data-ui": "ui.confirm", "data-intent": opts.danger ? "danger" : null }, [
      el("div", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: opts.mark || (opts.danger ? "消" : "問") }),
      title,
      opts.body ? el("p", { class: "k-dialog-body", text: opts.body }) : null,
      el("div", { class: "k-dialog-foot", "data-ui": "ui.confirm-foot" }, [el("span"), cancelBtn, confirmBtn])
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
    confirm: confirmModal, openDialog: openDialog, topDialog: topDialog, num: num,
    setClass: setClass, state: state, hasState: hasState, hookify: hookify, hook: hook };

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
  var redrawLater = null;
  KOS.rerender = function () {
    if (!navCur || !KOS.views[navCur.viewId]) return false;
    /* never under a pen: a background pull or a habit ticking itself
       redrew the page mid-stroke on the iPad. It waits for the pen to lift. */
    if (KOS.inkUI && KOS.inkUI.busy && KOS.inkUI.busy()) {
      clearTimeout(redrawLater);
      redrawLater = setTimeout(function () { redrawLater = null; KOS.rerender(); }, 1200);
      return true;
    }
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
    subject: "study", ref: "study", review: "study", due: "study", cardstats: "study", code: "study", japanese: "study", creatives: "study",
    tracker: "study", exams: "study", pacing: "study", personaldeck: "study", assignments: "study",
    worked: "study", trace: "study", oop: "study", sims: "study",
    focus: "productivity", calendar: "productivity", tasks: "productivity", routines: "productivity",
    reminders: "productivity", money: "productivity", goals: "productivity",
    matrix: "collection", anime: "collection", books: "collection",
    vn: "collection", game: "collection", seasonal: "collection",
    mangaka: "collection", wishlist: "collection", shrine: "collection",
    aniprofile: "collection", vndbprofile: "collection", mediasync: "collection",
    governor: "governor",
    assistant: "assistant",
    data: "system", help: "system", notifications: "system", pen: "system", files: "system", storage: "system"
  };
  /* subnav entries per section — null is the divider. The first group sits
     in the pill track; the groups after a divider are loose pills.
       label   the accessible name        short  the visible label
       dot     a hue token for the dot    mark   a kanji before the label
       count   the id of a live count     tone   "urgent" | "neutral" */
  var SUBNAV = {
    study: [
      { label: "Computer Science", short: "CS", view: "subject", arg: "compsci", dot: "var(--cs)", count: "pc-compsci", countHidden: true },
      { label: "Mathematics", short: "Maths", view: "subject", arg: "maths", dot: "var(--maths)", count: "pc-maths", countHidden: true },
      { label: "IT · Data Analytics", short: "IT", view: "subject", arg: "it", dot: "var(--it)", count: "pc-it", countHidden: true },
      { label: "Code", short: "Code", view: "subject", arg: "code", dot: "var(--code)", count: "pc-code", countHidden: true },
      { label: "Japanese", short: "Japanese", view: "subject", arg: "ja", dot: "var(--ja)", count: "pc-ja", countHidden: true },
      { label: "Creatives", short: "Creatives", view: "subject", arg: "creatives", dot: "var(--cr)", count: "pc-creatives", countHidden: true },
      null,
      { label: "Review", view: "review", count: "pc-review", tone: "neutral" },
      { label: "Assignments", view: "assignments", count: "pc-assign", tone: "urgent" },
      { label: "Exams & Papers", view: "exams" },
      { label: "Pacing", view: "pacing" }
    ],
    productivity: [
      { label: "Focus Timer", view: "focus" },
      { label: "Reminders", view: "reminders", count: "pc-rem", tone: "neutral" },
      { label: "Routines", view: "routines" },
      { label: "Calendar", view: "calendar" },
      /* 27a: Money and Goals join the strip; the rail keeps seven sections */
      { label: "Money", view: "money" },
      { label: "Goals", view: "goals" }
    ],
    collection: [
      { label: "Overview", view: "matrix" },
      { label: "Anime", view: "anime", dot: "var(--anime)" },
      { label: "Books", view: "books", dot: "var(--books)" },
      { label: "Visual Novels", view: "vn", dot: "var(--vn)" },
      { label: "Games", view: "game", dot: "var(--games)" },
      null,
      { label: "Shrine", view: "shrine", mark: "祠" },
      { label: "Wishlist", view: "wishlist", mark: "願" },
      { label: "Sync", view: "mediasync", mark: "同" }
    ],
    /* Archive opens on Backup, so Backup leads the strip (review A) */
    system: [
      { label: "Backup & Restore", view: "data", mark: "蔵" },
      { label: "Help & Guide", view: "help", mark: "導" },
      { label: "Notifications", view: "notifications", mark: "通", count: "pc-notify", tone: "urgent" },
      { label: "Files", view: "files", mark: "紙" },
      { label: "Storage", view: "storage", mark: "庫" },
      { label: "Pen and ink", view: "pen", mark: "筆" }
    ]
  };
  KOS.sectionOf = function (viewId) { return SECTION_OF[viewId] || null; };
  /* the landing view when a rail section button is pressed */
  KOS.sectionLanding = function (sec) {
    if (sec === "study") return ["subject", KOS.store.state.ui.subject || "compsci"];
    /* Productivity opens on the page last used in it, as Study opens on its
       last subject — Focus while a session is running */
    if (sec === "productivity") {
      var st = KOS.store.state, lp = st.ui.lastProd;
      if (st.focus && st.focus.active) return ["focus", undefined];
      if (lp && KOS.views[lp.view] && SECTION_OF[lp.view] === "productivity") return [lp.view, lp.arg == null ? undefined : lp.arg];
    }
    return [{ home: "home", productivity: "focus", collection: "matrix", governor: "governor",
      assistant: "assistant", system: "data" }[sec] || "home", undefined];
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
    primary:   { list: "k-subnav", item: "k-seg-item", nav: true, hook: "shell.subnav-item", countHook: "part.percent" },
    workspace: { list: "k-seg k-seg--quiet", item: "k-seg-item", hook: "ui.tab", listHook: "ui.tabs ui.workspace-tabs", countHook: "ui.tab-count" },
    card:      { list: "k-seg k-seg--quiet", item: "k-seg-item", hook: "ui.tab-card", listHook: "ui.tabs", countHook: "ui.tab-count" }
  };
  /* items: { label, short, hint, glyph, dot, active, onSelect, countId,
     count, countTone, sep, className }. `short` is the visible label when
     the design abbreviates (CS, Maths, IT); the full label stays the
     accessible name. The primary variant puts its first group in the pill
     track and every group after a `sep` as loose pills beside it. */
  function tabItem(shape, it) {
    var attrs = { type: "button", class: shape.item + (it.className ? " " + it.className : ""),
      "data-ui": shape.hook + (it.hook ? " " + it.hook : ""), title: it.hint || null,
      /* the name is the plain label: a kanji mark, a dot, an abbreviation
         or a live count must not become part of it (the count is the
         button's description instead) */
      "aria-label": (shape.nav || it.glyph || (it.short && it.short !== it.label)) ? it.label : null,
      "aria-describedby": it.countId || null,
      onclick: function (ev) { if (it.onSelect) it.onSelect(ev); } };
    if (!shape.nav) { attrs.role = "tab"; attrs["aria-selected"] = String(!!it.active); }
    else if (it.active) attrs["aria-current"] = "page";
    var btn = el("button", attrs);
    if (it.active) KOS.ui.state(btn, "active", true);
    if (it.dot) btn.appendChild(el("span", { class: "k-seg-dot", "aria-hidden": "true", style: "--dot: " + it.dot }));
    if (it.glyph) btn.appendChild(el("span", { class: "k-seg-mark", lang: "ja", "aria-hidden": "true", text: it.glyph }));
    btn.appendChild(el("span", { class: "k-seg-label", "data-ui": "part.text", text: it.short || it.label }));
    if (it.countId || it.count != null) {
      var c = el("span", { class: "k-seg-count", "data-ui": shape.countHook, "data-tone": it.countTone || null });
      if (it.countId) c.id = it.countId;
      if (it.count != null) c.textContent = String(it.count);
      if (it.countHidden) c.hidden = true;
      btn.appendChild(c);
    }
    return btn;
  }
  KOS.ui.tabs = function (items, opts) {
    opts = opts || {};
    var shape = TAB_SHAPE[opts.variant] || TAB_SHAPE.workspace;
    var list = el("div", { class: shape.list + (opts.className ? " " + opts.className : ""),
      "data-ui": shape.listHook || null, "aria-label": opts.label || "Sections", role: shape.nav ? null : "tablist" });
    var track = shape.nav ? el("div", { class: "k-seg" }) : list;
    if (shape.nav) list.appendChild(track);
    var loose = false;
    (items || []).forEach(function (it) {
      if (!it || it.sep) {
        (shape.nav ? list : track).appendChild(el("span", { class: "k-seg-sep", "data-ui": "ui.tab-sep", "aria-hidden": "true" }));
        loose = shape.nav;
        return;
      }
      (loose ? list : track).appendChild(tabItem(shape, it));
    });
    return opts.edge ? edgeTrack(list, opts.label) : list;
  };
  /* the shared edge-marked tab scroller (design 15n): a strip that does not
     fit never wraps; the side with hidden tabs shows a fade in the track's
     colour and a ‹ / › that scrolls one track width, both gone at that end,
     and the active tab is scrolled into view when it mounts */
  function edgeTrack(list, label) {
    var wrap = scroller(list, { keepRole: true, className: "k-scroller--track",
      prevLabel: "Earlier " + (label || "tabs").toLowerCase(), nextLabel: "Later " + (label || "tabs").toLowerCase(),
      /* a tab picked redraws the page: the strip keeps its scroll, and
         reveals the active tab only when it is out of sight */
      keep: "tabs:" + (label || ""),
      reveal: function () { return null; } });
    var later = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 0); };
    later(function () {
      var on = list.querySelector("[aria-selected='true'], [aria-current='page']");
      if (on && list.scrollWidth > list.clientWidth) {
        var left = on.offsetLeft - list.offsetLeft;
        if (left + on.offsetWidth > list.scrollLeft + list.clientWidth || left < list.scrollLeft) list.scrollLeft = Math.max(0, left - 8);
      }
      if (wrap.sync) wrap.sync();
    });
    return wrap;
  }

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
    /* 27a: the Planner's two pages left — Money and Goals are Productivity's
       now — so only Sync keeps a workspace switch here */
    var groups = {
      sync: [["AniList", "aniprofile"], ["VNDB", "vndbprofile"], ["Sync & Import", "mediasync"]]
    };
    if (!groups[area]) return null;
    var tabs = KOS.workspaceTabs(groups[area], current,
      area === "planner" ? "Planner pages" : "Sync pages");
    tabs.setAttribute("data-ui", tabs.getAttribute("data-ui") + " coll.workspace-tabs");
    return tabs;
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
    return el("div", { class: "k-pagehead" + (opts.className ? " " + opts.className : ""), "data-ui": "ui.page-head ui.page-header" }, [
      el("div", { class: "k-pagehead-txt" }, [
        opts.kicker ? el("div", { class: "k-kicker", "data-ui": "ui.page-kicker", text: opts.kicker }) : null,
        el("h1", { text: opts.title || "" }),
        /* invariant 50a: one line on the muted role, no paragraph */
        opts.sub ? el("div", { class: "k-pagehead-sub", "data-ui": "ui.page-sub" }, [el("span", { "data-ui": "part.board", text: opts.sub })]) : null
      ].filter(Boolean)),
      opts.actions && opts.actions.length
        ? el("div", { class: "k-pagehead-actions", "data-ui": "ui.page-actions" }, opts.actions.filter(Boolean)) : null
    ].filter(Boolean));
  }
  function sectionHeader(opts) {
    opts = opts || {};
    return el("div", { class: "k-sectionhead" + (opts.className ? " " + opts.className : ""), "data-ui": "ui.section-header" }, [
      el("h2", { text: opts.title || "" }),
      opts.sub ? el("span", { class: "k-sectionhead-sub", "data-ui": "part.sub", text: opts.sub }) : null,
      opts.actions && opts.actions.length
        ? el("div", { class: "k-sectionhead-actions", "data-ui": "ui.section-actions" }, opts.actions.filter(Boolean)) : null
    ].filter(Boolean));
  }

  /* ============================================================
     EMPTY STATE  (audit U-20 / REV-3 / REM-2)
     Two densities: `compact` is one quiet line with an inline action, for a
     page that has other content; the full form is a card for a page whose
     only content is the absence.
     ============================================================ */
  function emptyState(opts) {
    opts = opts || {};
    var node = el("div", { class: "k-empty" + (opts.className ? " " + opts.className : ""), "data-ui": "ui.empty" }, [
      opts.mark ? el("span", { class: "k-empty-mark", "data-ui": "ui.empty-mark", lang: "ja", "aria-hidden": "true", text: opts.mark }) : null,
      el("div", { class: "k-empty-txt" }, [
        opts.title ? el("b", { text: opts.title }) : null,
        opts.body ? el("p", { text: opts.body }) : null
      ].filter(Boolean)),
      opts.action ? el("div", { class: "k-empty-action", "data-ui": "ui.empty-action" }, [opts.action]) : null
    ].filter(Boolean));
    if (opts.compact) KOS.ui.state(node, "compact", true);
    return node;
  }

  /* ============================================================
     STAT  (audit U-17 / REV-1 / GOV-4 / MTX-5)
     A label over a figure. `suppressZero` returns null for a tile that
     would only say 0, so `.filter(Boolean)` drops it (invariant 77).
     ============================================================ */
  function statTile(opts) {
    opts = opts || {};
    var zero = opts.value === 0 || opts.value === "0" || opts.value == null || opts.value === "";
    if (opts.suppressZero && zero) return null;
    var node = el("div", { class: "k-stat" + (opts.className ? " " + opts.className : ""), "data-ui": "ui.stat",
      "data-tone": opts.tone || null }, [
      el("div", { class: "k-stat-label", "data-ui": "part.label", text: opts.label || "" }),
      el("div", { class: "k-stat-value", "data-ui": "part.value", text: zero && opts.emptyText ? opts.emptyText
        : (typeof opts.value === "number" ? num(opts.value) : String(opts.value == null ? "—" : opts.value)) }),
      opts.sub ? el("div", { class: "k-stat-sub", text: opts.sub }) : null
    ].filter(Boolean));
    if (zero) KOS.ui.state(node, "is-zero", true);
    return node;
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
  /* a strip redrawn by its own page (a week picked on the term ribbon, a
     subject toggled under the braid) keeps where it was scrolled: `keep`
     names it, and the memory lasts while the page stays on that view —
     leaving for another view forgets it, so a return opens on `reveal` */
  var scrollMemo = {};
  /* read every kept strip as the page is torn down: a scroll event may not
     have fired yet (a background tab paints no frames) */
  function noteScrolls(root) {
    if (!root || !root.querySelectorAll) return;
    [].forEach.call(root.querySelectorAll("[data-scroll-keep]"), function (n) { scrollMemo[n.getAttribute("data-scroll-keep")] = n.scrollLeft; });
  }
  function scroller(node, opts) {
    opts = opts || {};
    var wrap = el("div", { class: "k-scroller" + (opts.className ? " " + opts.className : ""),
      "data-ui": "ui.scroller", "data-scroller": "true" });
    var prev = el("button", { type: "button", class: "k-scroller-arrow", "data-ui": "ui.scroller-arrow", "data-edge": "start",
      text: "‹", "aria-label": opts.prevLabel || "Scroll left", tabindex: "-1" });
    var next = el("button", { type: "button", class: "k-scroller-arrow", "data-ui": "ui.scroller-arrow", "data-edge": "end",
      text: "›", "aria-label": opts.nextLabel || "Scroll right", tabindex: "-1" });
    node.classList.add("k-scroller-track");
    /* a tablist keeps its own role and keys (keepRole); anything else
       becomes one focusable, labelled group that arrow keys page */
    if (!opts.keepRole) {
      node.setAttribute("tabindex", "0");
      node.setAttribute("role", "group");
    }
    if (opts.label) node.setAttribute("aria-label", opts.label);
    wrap.appendChild(prev); wrap.appendChild(node); wrap.appendChild(next);

    function page(dir) { node.scrollBy({ left: dir * Math.max(160, node.clientWidth * 0.8), behavior: "smooth" }); }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    if (!opts.keepRole) node.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); page(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); page(-1); }
    });
    function sync() {
      var max = node.scrollWidth - node.clientWidth;
      var atStart = node.scrollLeft <= 1, atEnd = node.scrollLeft >= max - 1;
      KOS.ui.state(wrap, "at-start", atStart || max <= 1);
      KOS.ui.state(wrap, "at-end", atEnd || max <= 1);
      KOS.ui.state(wrap, "no-scroll", max <= 1);
      /* a block that only sometimes overflows (a notes table) is a tab
         stop only while there is something to scroll */
      if (opts.tabWhenScrolls && !opts.keepRole) node.setAttribute("tabindex", max > 1 ? "0" : "-1");
    }
    node.addEventListener("scroll", sync, { passive: true });
    if (typeof window.ResizeObserver === "function") { try { new window.ResizeObserver(sync).observe(node); } catch (e) { /* jsdom */ } }
    if (opts.keep) {
      node.setAttribute("data-scroll-keep", opts.keep);
      node.addEventListener("scroll", function () { scrollMemo[opts.keep] = node.scrollLeft; }, { passive: true });
      var place = function () {
        if (scrollMemo[opts.keep] != null) node.scrollLeft = scrollMemo[opts.keep];
        else if (typeof opts.reveal === "function") { var x = opts.reveal(node); if (x != null) node.scrollLeft = Math.max(0, x); }
        sync();
      };
      setTimeout(place, 0);   /* once mounted; before the tabs' reveal frame, and in a background tab too */
    }
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
    KOS.ui.state(m.btn, "is-open", false);
    if (restoreFocus && document.body.contains(m.btn)) m.btn.focus();
  }
  KOS.ui.closeMenu = function () { closeOpenMenu(false); };

  function menu(opts) {
    opts = opts || {};
    var btn = el("button", {
      type: "button",
      class: "k-btn" + (opts.className ? " " + opts.className : ""),
      "data-ui": "ui.menu-button",
      title: opts.hint || null,
      "aria-haspopup": opts.items ? "menu" : "true",
      "aria-expanded": "false"
    }, [
      el("span", { "data-ui": "ui.menu-label", text: opts.label || "More" }),
      opts.badgeId || opts.badge != null
        ? el("span", { class: "k-menu-count", "data-ui": "ui.menu-count", id: opts.badgeId || null,
            text: opts.badge != null ? String(opts.badge) : "" })
        : null,
      el("span", { class: "k-btn-caret", "data-ui": "ui.menu-caret", "aria-hidden": "true", text: "▾" })
    ].filter(Boolean));

    function place(panel) {
      var r = btn.getBoundingClientRect();
      var vw = window.innerWidth, vh = window.innerHeight;
      /* measured unseen at the origin, then placed: the position rides
         custom properties the menu layer reads */
      KOS.ui.state(panel, "measuring", true);
      panel.style.setProperty("--menu-x", "0px"); panel.style.setProperty("--menu-y", "0px");
      document.body.appendChild(panel);
      var pw = panel.offsetWidth, ph = panel.offsetHeight;
      var left = opts.align === "start" ? r.left : r.right - pw;
      left = Math.max(8, Math.min(left, vw - pw - 8));
      var top = r.bottom + 6;
      if (top + ph > vh - 8) top = Math.max(8, r.top - ph - 6);
      panel.style.setProperty("--menu-x", Math.round(left) + "px");
      panel.style.setProperty("--menu-y", Math.round(top) + "px");
      KOS.ui.state(panel, "measuring", false);
    }

    function open() {
      if (openMenu && openMenu.btn === btn) { closeOpenMenu(true); return; }
      closeOpenMenu(false);
      var panel = el("div", { class: "k-menu-panel" + (opts.panelClass ? " " + opts.panelClass : ""), "data-ui": "ui.menu-panel" });
      var focusables = [];
      if (opts.items) {
        panel.setAttribute("role", "menu");
        panel.setAttribute("aria-label", opts.label || "Menu");
        (opts.items || []).filter(Boolean).forEach(function (it) {
          if (it.sep) { panel.appendChild(el("div", { class: "k-menu-sep", role: "separator" })); return; }
          if (it.heading) { panel.appendChild(el("div", { class: "k-menu-heading", text: it.heading })); return; }
          var item = el("button", { type: "button", role: "menuitem", tabindex: "-1",
            class: "k-menu-item" + (it.className ? " " + it.className : ""),
            onclick: function (ev) { closeOpenMenu(false); if (it.onSelect) it.onSelect(ev); } }, [
            it.glyph ? el("span", { class: "k-menu-item-mark", lang: "ja", "aria-hidden": "true", text: it.glyph }) : null,
            el("span", {}, [
              el("span", { class: "k-menu-item-label", "data-ui": "ui.menu-item", text: it.label }),
              it.hint ? el("span", { class: "k-menu-item-hint", text: it.hint }) : null
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
      /* Phase F: the scroll listener is capture-phase on window, so it sees
         #main's scroll too — which is right, because the panel is fixed and
         would detach from its button. But focusing a control SCROLLS IT
         INTO VIEW, so a keyboard user tabbing to this button and pressing
         Enter could have the resulting scroll arrive just after the panel
         opened and dismiss it again. Ignore dismissals until the open has
         settled; a deliberate scroll is always later than that. */
      var settled = false;
      setTimeout(function () { settled = true; }, 0);
      function onDismiss(ev) {
        if (!settled) return;
        if (ev && ev.type === "scroll" && panel.contains(ev.target)) return;
        closeOpenMenu(false);
      }
      openMenu = { btn: btn, panel: panel, onKey: onKey, onDown: onDown, onDismiss: onDismiss };
      place(panel);
      btn.setAttribute("aria-expanded", "true");
      KOS.ui.state(btn, "is-open", true);
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
      var b = btn.querySelector("[data-ui~='ui.menu-count']");
      if (!b) return;
      b.textContent = n ? String(n) : "";
      b.hidden = !n;
    };
    btn.closeMenu = function () { if (openMenu && openMenu.btn === btn) closeOpenMenu(false); };
    return btn;
  }

  /* ---------------- reorder: the drag pattern (frame 23b) ----------------
     One interaction for every list the user ranks by hand — the study
     editor's blocks and rows, the Spec column break, the Shrine's tie
     order. Every row carries a handle (a real button, [data-reorder]):
       pointer   drag the handle: the row lifts and follows the pointer (a
                 float shadow, a slight tilt, 18px off), its old place stays
                 as a faded dashed ghost, and a crimson line with a dot marks
                 where it will land. Nothing else moves until the drop.
       keyboard  Space lifts, ↑ ↓ move one place, Space drops, Esc puts it
                 back; each step is announced ("moved to 3 of 6").
     Rows are the direct children of the containers matching `lists`
     (default: root) that match `rows`; a row may cross into another list of
     the same root. The caller owns the data: onDrop(row, list, index) gets
     the row, the list it lands in and its index there with the row taken
     out, and redraws; focus returns to the handle of the row with the same
     data-rid. The pointer path needs a pointer; jsdom-style tests drive the
     keyboard path. */
  function reorder(root, opts) {
    opts = opts || {};
    var rowsSel = opts.rows || "[data-rid]";
    function lists() {
      var l = opts.lists ? [].slice.call(root.querySelectorAll(opts.lists)) : [];
      return l.length ? l : [root];
    }
    function rowsIn(list) {
      return [].filter.call(list.children, function (c) { return c.matches && c.matches(rowsSel) && !c.hasAttribute("data-reorder-float"); });
    }
    function allRows() { var out = []; lists().forEach(function (l) { out = out.concat(rowsIn(l)); }); return out; }
    function nameOf(row) { return (opts.label && opts.label(row)) || "Item"; }
    function place(row) {
      var list = row.parentNode, rs = rowsIn(list);
      return { list: list, index: rs.indexOf(row), total: allRows().length, at: allRows().indexOf(row) };
    }
    function say(text) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(text); }
    function finish(row, list, index) {
      var rid = row.getAttribute("data-rid");
      if (opts.onDrop) opts.onDrop(row, list, index);
      if (rid == null) return;
      var same = [].filter.call(root.querySelectorAll("[data-rid]"), function (n) { return n.getAttribute("data-rid") === rid; })[0];
      var again = same && same.querySelector("[data-reorder]");
      if (again) again.focus();
    }

    /* ---- keyboard ---- */
    var lifted = null;          // {row, home: {list, next}}
    var moving = false;         // a DOM move blurs the handle; that is not leaving
    root.addEventListener("keydown", function (e) {
      var h = e.target.closest && e.target.closest("[data-reorder]");
      if (!h || !root.contains(h)) return;
      var row = h.closest(rowsSel);
      if (!row) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!lifted) {
          lifted = { row: row, home: { list: row.parentNode, next: row.nextSibling } };
          KOS.ui.state(row, "lifted", true);
          /* while a row is lifted, Escape is ours, not a dialog's */
          root.setAttribute("data-keys-local", "");
          var p = place(row);
          say(nameOf(row) + ", lifted. " + (p.at + 1) + " of " + p.total + ". Arrow keys move it, Space drops it, Escape puts it back.");
        } else {
          var r = lifted.row; lifted = null;
          root.removeAttribute("data-keys-local");
          KOS.ui.state(r, "lifted", false);
          var q = place(r);
          say(nameOf(r) + ", dropped at " + (q.at + 1) + " of " + q.total + ".");
          finish(r, q.list, q.index);
        }
      } else if (lifted && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        var all = allRows(), i = all.indexOf(row);
        var j = e.key === "ArrowUp" ? i - 1 : i + 1;
        if (j < 0 || j >= all.length) return;
        var other = all[j];
        moving = true;
        if (e.key === "ArrowUp") other.parentNode.insertBefore(row, other);
        else other.parentNode.insertBefore(row, other.nextSibling);
        h.focus();
        moving = false;
        var p2 = place(row);
        say(nameOf(row) + ", moved to " + (p2.at + 1) + " of " + p2.total + ".");
      } else if (lifted && e.key === "Escape") {
        e.preventDefault(); e.stopPropagation();
        var home = lifted.home; lifted = null;
        root.removeAttribute("data-keys-local");
        home.list.insertBefore(row, home.next && home.next.parentNode === home.list ? home.next : null);
        KOS.ui.state(row, "lifted", false);
        h.focus();
        say(nameOf(row) + ", put back.");
      }
    });
    root.addEventListener("focusout", function (e) {
      /* leaving a lifted row by Tab drops nothing and puts it back */
      if (!lifted || moving || lifted.row.contains(e.relatedTarget)) return;
      var home = lifted.home, row = lifted.row; lifted = null;
      root.removeAttribute("data-keys-local");
      home.list.insertBefore(row, home.next && home.next.parentNode === home.list ? home.next : null);
      KOS.ui.state(row, "lifted", false);
    });

    /* ---- pointer ---- */
    root.addEventListener("pointerdown", function (e) {
      var h = e.target.closest && e.target.closest("[data-reorder]");
      if (!h || !root.contains(h) || e.button !== 0) return;
      var row = h.closest(rowsSel);
      if (!row) return;
      e.preventDefault();
      try { h.setPointerCapture(e.pointerId); } catch (err) { /* no capture — the document listeners still see it */ }
      var box = row.getBoundingClientRect();
      var float = row.cloneNode(true);
      float.setAttribute("data-reorder-float", "");
      float.removeAttribute("data-rid");
      float.setAttribute("aria-hidden", "true");
      float.classList.add("k-reorder-float");
      float.style.setProperty("--rw", Math.round(box.width) + "px");
      document.body.appendChild(float);
      var line = el("span", { class: "k-reorder-line", "aria-hidden": "true" });
      document.body.appendChild(line);
      KOS.ui.state(row, "ghost", true);
      document.documentElement.setAttribute("data-reordering", "");
      var target = null;
      function move(ev) {
        float.style.setProperty("--rx", Math.round(ev.clientX + 18) + "px");
        float.style.setProperty("--ry", Math.round(ev.clientY + 18 - box.height / 2) + "px");
        /* the gap nearest the pointer, across every list */
        var best = null;
        lists().forEach(function (l) {
          var rs = rowsIn(l).filter(function (r) { return r !== row; });
          var lb = l.getBoundingClientRect();
          if (!rs.length) {
            var d0 = Math.abs(ev.clientY - (lb.top + 8));
            if (!best || d0 < best.d) best = { d: d0, list: l, index: 0, y: lb.top + 4, x: lb.left, w: lb.width };
          }
          rs.forEach(function (r, k) {
            var b = r.getBoundingClientRect();
            [[b.top, k], [b.bottom, k + 1]].forEach(function (g) {
              var d = Math.abs(ev.clientY - g[0]);
              if (!best || d < best.d) best = { d: d, list: l, index: g[1], y: g[0], x: b.left, w: b.width };
            });
          });
        });
        target = best;
        if (best) {
          line.style.setProperty("--lx", Math.round(best.x) + "px");
          line.style.setProperty("--ly", Math.round(best.y) + "px");
          line.style.setProperty("--lw", Math.round(best.w) + "px");
        }
      }
      function up(ev) {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", cancel);
        float.remove(); line.remove();
        KOS.ui.state(row, "ghost", false);
        document.documentElement.removeAttribute("data-reordering");
        if (!target || ev.type === "pointercancel") return;
        var p = place(row);
        /* the index with the row taken out of its own list */
        var idx = target.index;
        if (target.list === p.list && p.index < idx) idx--;
        if (target.list === p.list && idx === p.index) return;
        var rs = rowsIn(target.list).filter(function (r) { return r !== row; });
        target.list.insertBefore(row, rs[idx] || null);
        var q = place(row);
        say(nameOf(row) + ", moved to " + (q.at + 1) + " of " + q.total + ".");
        finish(row, q.list, q.index);
      }
      function cancel(ev) { target = null; up(ev); }
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", cancel);
      move(e);
    });
    return { refresh: function () {} };
  }
  /* drawn icons, for glyphs a font renders too small or off-centre (the
     "⌕" search mark sat at half the size of the bell beside it). Stroked
     in currentColor; the owning button sizes the svg. */
  var ICONS = {
    search: [["circle", { cx: "10.5", cy: "10.5", r: "6.5" }], ["path", { d: "M15.5 15.5L20 20" }]],
    /* glyphs like ‹ › ✕ ▶ ❚❚ sit on the font's baseline, not the button's
       centre (review after Reports: every round control looked off) */
    "chev-left": [["path", { d: "M14.5 6L8.5 12l6 6", "stroke-linejoin": "round" }]],
    "chev-right": [["path", { d: "M9.5 6l6 6-6 6", "stroke-linejoin": "round" }]],
    close: [["path", { d: "M6.5 6.5l11 11M17.5 6.5l-11 11" }]],
    play: [["path", { d: "M8 5.5v13l10.5-6.5z", fill: "currentColor", stroke: "none" }]],
    pause: [["path", { d: "M8.5 6v12M15.5 6v12", "stroke-width": "3" }]],
    "arrow-right": [["path", { d: "M5 12h13M13 6.5l5.5 5.5-5.5 5.5", "stroke-linejoin": "round" }]],
    share: [["path", { d: "M12 15V4M7.5 8.5L12 4l4.5 4.5", "stroke-linejoin": "round" }], ["path", { d: "M5 13v5.5h14V13", "stroke-linejoin": "round" }]],
    download: [["path", { d: "M12 4v11M7.5 10.5L12 15l4.5-4.5", "stroke-linejoin": "round" }], ["path", { d: "M5 19.5h14" }]]
  };
  function icon(name) {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2.2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "k-icon");
    (ICONS[name] || []).forEach(function (part) {
      var n = document.createElementNS(NS, part[0]);
      Object.keys(part[1]).forEach(function (k) { n.setAttribute(k, part[1][k]); });
      svg.appendChild(n);
    });
    return svg;
  }
  KOS.ui.icon = icon;
  KOS.ui.reorder = reorder;
  KOS.ui.pageHeader = pageHeader;
  /* The device, for WORDS only ("this iPad", "Add to the Home Screen"):
     layout never reads it (invariant 47). iPadOS Safari asks for desktop
     sites and calls itself a Mac, so an iPad is a "Mac" with a touch
     screen. */
  KOS.ui.device = function () {
    var ua = navigator.userAgent || "", touch = (navigator.maxTouchPoints || 0) > 1;
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch)) return { kind: "tablet", name: "iPad", ios: true };
    if (/iPhone|iPod/.test(ua)) return { kind: "phone", name: "iPhone", ios: true };
    if (/Android/.test(ua)) return /Mobile/.test(ua) ? { kind: "phone", name: "phone", ios: false } : { kind: "tablet", name: "tablet", ios: false };
    return { kind: "computer", name: "computer", ios: false };
  };
  KOS.ui.sectionHeader = sectionHeader;
  KOS.ui.emptyState = emptyState;
  KOS.ui.statTile = statTile;
  KOS.ui.scroller = scroller;
  KOS.ui.menu = menu;

  /* ============================================================
     MONEY AND GOALS PRIMITIVES  (design 27, "Primitives")
     Each built once here and in components.css; Money, Goals, the
     Wishlist, Home, Calendar and Reports compose them.
     ============================================================ */
  /* THE AMOUNT — JetBrains Mono, tabular, "£" and a true minus. Hide amounts
     (state.ui.moneyHidden, per device) keeps the exact text, transparent,
     under an --s2 mask, so the width never changes. opts: {size (a --fs-
     step: "12", "13-5", "24" …), tone ("in" | "out" | "transfer" | "muted"
     | "alarm"), plus (a + on income), w ("500"), hidden (override)} */
  function amount(minor, opts) {
    opts = opts || {};
    var text = typeof minor === "string" ? minor
      : (KOS.money ? KOS.money.format(minor, { sign: !!opts.plus, whole: !!opts.whole }) : String(minor));
    var hidden = opts.hidden != null ? opts.hidden : !!(KOS.money && KOS.money.isHidden());
    var node = el("span", { class: "k-amount" + (opts.className ? " " + opts.className : ""), "data-ui": "money.amount",
      "data-size": opts.size || null, "data-tone": opts.tone || null, "data-w": opts.w || null,
      "aria-label": hidden ? "amount hidden" : null, text: text });
    if (hidden) state(node, "hidden", true);
    return node;
  }
  /* THE AMOUNT FIELD — inputmode decimal; 23.4, £23.40 and 23,40 all read;
     the value is integer pence. field.value() → minor | null; validate()
     shows "✕ Enter an amount above £0.00" and returns false. */
  function amountField(opts) {
    opts = opts || {};
    var cur = KOS.money ? KOS.money.data().currency : "£";
    var input = el("input", { class: "k-amount-input", "data-ui": "money.amount-input", type: "text", inputmode: "decimal",
      autocomplete: "off", "aria-label": opts.label || "Amount", placeholder: "0.00" });
    if (opts.value != null) input.value = (Math.abs(opts.value) / 100).toFixed(2);
    var err = el("div", { class: "k-field-error", "data-ui": "money.amount-error", role: "alert", hidden: "" });
    var box = el("div", { class: "k-amount-field", "data-ui": "money.amount-field", "data-size": opts.size || null }, [
      el("span", { class: "k-amount-cur", "aria-hidden": "true", text: /^[A-Z]{3}$/.test(cur) ? cur : cur }), input]);
    var node = el("div", { class: "k-amount-wrap" }, [box, err]);
    function value() {
      var m = KOS.money ? KOS.money.toMinor(input.value) : Math.round(Number(input.value) * 100);
      return m == null || !isFinite(m) ? null : Math.abs(m);
    }
    function validate() {
      var v = value(), ok = v != null && v > 0;
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      state(box, "invalid", !ok);
      err.hidden = ok;
      err.textContent = ok ? "" : "✕ Enter an amount above " + (KOS.money ? KOS.money.format(0) : "£0.00");
      return ok;
    }
    input.addEventListener("input", function () {
      if (!err.hidden) validate();
      if (opts.onInput) opts.onInput(value());
    });
    if (opts.disabled) input.disabled = true;
    return { node: node, input: input, value: value, validate: validate };
  }
  /* THE CATEGORY BAR — spend against its budget, ALWAYS both figures.
     Over: the alarm fill, a --text tick where the budget ends, "▲ Over by".
     No budget: no bar, "Set a budget". opts: {name, tone, spent, budget,
     sub, note, left (override), foot (false hides the line), onSet} */
  function catBar(opts) {
    opts = opts || {};
    var spent = opts.spent || 0, budget = opts.budget;
    var over = budget != null && spent > budget;
    var node = el("div", { class: "k-catbar", "data-ui": "money.catbar", "data-cat-tone": opts.tone || "muted" });
    if (over) state(node, "over", true);
    node.appendChild(el("div", { class: "k-catbar-head" }, [
      el("span", { class: "k-catbar-dot", "aria-hidden": "true" }),
      el("span", { class: "k-catbar-name", text: opts.name || "" }),
      opts.sub ? el("span", { class: "k-catbar-sub", text: opts.sub }) : null,
      el("span", { class: "k-catbar-figs" }, budget != null
        ? [amount(spent), el("span", { class: "k-catbar-of", text: "of" }), amount(budget, { w: "500", tone: "muted" })]
        : [amount(spent)])
    ].filter(Boolean)));
    if (budget != null) {
      var bar = el("div", { class: "k-catbar-bar", "aria-hidden": "true" }, [el("i")]);
      bar.style.setProperty("--p", (budget > 0 ? Math.min(100, 100 * spent / budget) : (spent > 0 ? 100 : 0)).toFixed(1) + "%");
      if (over) {
        bar.style.setProperty("--tick", (100 * budget / spent).toFixed(1) + "%");
        bar.appendChild(el("b"));
      }
      node.appendChild(bar);
    }
    if (opts.foot !== false) {
      var foot = el("div", { class: "k-catbar-foot" });
      if (budget == null) {
        foot.appendChild(opts.onSet ? el("button", { type: "button", class: "k-link", "data-ui": "money.set-budget", text: "Set a budget", onclick: opts.onSet })
          : el("span", { text: "No budget set" }));
      } else if (over) {
        foot.appendChild(el("span", { class: "k-catbar-over" }, ["▲ Over by ", amount(spent - budget, { size: "12", tone: "alarm" })]));
      } else {
        foot.appendChild(el("span", { class: "k-catbar-left" }, [amount(budget - spent, { size: "12", w: "500", tone: "muted" }), " left"]));
      }
      if (opts.note) foot.appendChild(el("span", { class: "k-catbar-note", text: opts.note }));
      node.appendChild(foot);
    }
    return node;
  }
  /* THE PACE CHIP — an icon and a word, never colour alone; Behind, Missed
     and Over are the fixed alarm (data-tone="danger"). */
  var PACE_CHIP = {
    ahead: ["▲ Ahead", "teal"], "on-track": ["● On track", "green"], behind: ["▼ Behind", "danger"],
    early: ["◌ Too early to call", "muted"], met: ["✓ Met", "green"], missed: ["✕ Missed", "danger"],
    under: ["● Under", "green"], over: ["▲ Over", "danger"], notyet: ["○ Not started", "muted"],
    done: ["✓ Done", "green"], archived: ["▣ Archived", "muted"], display: ["Display only", "muted"], none: ["No pace", "muted"]
  };
  function paceChip(kind) {
    var p = PACE_CHIP[kind];
    if (!p) return null;
    return el("span", { class: "k-chip", "data-ui": "goal.pace", "data-state": kind, "data-tone": p[1], text: p[0] });
  }
  /* THE PERIOD-HISTORY STRIP — oldest first; met ✓ on teal, missed ✕ in an
     alarm outline, the open period outlined with its part done filled, a
     period before the goal existed as --s2. Each square is a list item
     read aloud ("Week of 17 Sep, met, 13.2 hours"). items: [{state:
     "met"|"missed"|"open"|"none", label, fill (0..1)}], opts: {size} */
  function periods(items, opts) {
    opts = opts || {};
    var list = el("ol", { class: "k-periods", "data-ui": "goal.periods", "data-size": opts.size || null,
      "aria-label": opts.label || "Every period" });
    (items || []).forEach(function (it) {
      var li = el("li", { class: "k-period", "data-state": it.state || "none", "aria-label": it.label || null,
        text: it.state === "met" ? "✓" : it.state === "missed" ? "✕" : "" });
      if (it.state === "open") li.style.setProperty("--fill", Math.round(100 * Math.max(0, Math.min(1, it.fill || 0))) + "%");
      list.appendChild(li);
    });
    return list;
  }
  /* THE GOAL RING — progress in the accent, the straight line's tick in
     --text, met in teal with ✓. Sizes 164 (hero), 96, 92 (phone).
     opts: {p (0..1), tick (0..1 | null), size, stroke, met, label} */
  function ring(opts, inner) {
    opts = opts || {};
    var NS = "http://www.w3.org/2000/svg";
    var size = opts.size || 96, sw = opts.stroke || (size >= 140 ? 14 : 9);
    var r = (size - sw) / 2, c = 2 * Math.PI * r, cx = size / 2;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("aria-hidden", "true");
    function circle(cls, dash) {
      var n = document.createElementNS(NS, "circle");
      n.setAttribute("class", cls);
      n.setAttribute("cx", cx); n.setAttribute("cy", cx); n.setAttribute("r", r);
      n.setAttribute("stroke-width", sw);
      if (dash) { n.setAttribute("stroke-dasharray", dash); n.setAttribute("transform", "rotate(-90 " + cx + " " + cx + ")"); }
      return n;
    }
    svg.appendChild(circle("k-ring-track"));
    var p = Math.max(0, Math.min(1, opts.p || 0));
    if (p > 0) svg.appendChild(circle("k-ring-fill", (c * p).toFixed(1) + " " + c.toFixed(1)));
    if (opts.tick != null && !opts.met) {
      var a = (Math.max(0, Math.min(1, opts.tick)) * 360 - 90) * Math.PI / 180, r1 = r - sw / 2 - 3, r2 = r + sw / 2 + 3;
      var t = document.createElementNS(NS, "line");
      t.setAttribute("class", "k-ring-tick");
      t.setAttribute("x1", (cx + r1 * Math.cos(a)).toFixed(1)); t.setAttribute("y1", (cx + r1 * Math.sin(a)).toFixed(1));
      t.setAttribute("x2", (cx + r2 * Math.cos(a)).toFixed(1)); t.setAttribute("y2", (cx + r2 * Math.sin(a)).toFixed(1));
      svg.appendChild(t);
    }
    var node = el("div", { class: "k-ring", "data-ui": "goal.ring", "data-size": String(size), role: opts.label ? "img" : null,
      "aria-label": opts.label || null }, [svg, el("div", { class: "k-ring-in" }, inner || [])]);
    if (opts.met) state(node, "met", true);
    return node;
  }
  /* THE PICTURE SLOT — the user's own picture through KOS.imageCrop:
     empty ("◫ Add a picture"), filled, placing. The source and {x,y,zoom}
     are stored apart by the owner (opts.save); nothing is ever fetched.
     opts: {pic: {src, crop} | null, label, aspect, save(pic|null), hue} */
  function pictureSlot(opts) {
    opts = opts || {};
    var node = el("div", { class: "k-pic", "data-ui": "money.picture" });
    function edit() {
      KOS.imageCrop.open({
        title: opts.title || "Picture", source: opts.pic ? opts.pic.src : "", crop: opts.pic ? opts.pic.crop : null,
        aspect: opts.aspect || 1, allowUrl: false, allowUpload: true,
        fileOptions: { maxWidth: 1200, maxHeight: 1200, maxBytes: 450 * 1024, quality: 0.84 },
        removeLabel: "Remove the picture",
        onRemove: opts.pic ? function () { opts.save && opts.save(null); } : null,
        onSave: function (res) { opts.save && opts.save({ src: res.source, crop: res.crop }); }
      });
    }
    if (opts.pic && opts.pic.src) {
      var img = KOS.imageCrop.image(opts.pic.src, { alt: opts.alt || "", class: "k-pic-img", draggable: "false" }, opts.pic.crop);
      node.appendChild(img);
      state(node, "filled", true);
      if (opts.save) node.appendChild(el("button", { type: "button", class: "k-pic-change", "data-ui": "money.picture-change",
        "aria-label": "Change picture", text: "◫", onclick: edit }));
    } else {
      state(node, "empty", true);
      if (opts.save) node.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-pic-add", "data-ui": "money.picture-add",
        text: "◫ Add a picture", onclick: edit }));
      if (opts.label) node.appendChild(el("span", { class: "k-pic-label", text: opts.label }));
    }
    return node;
  }
  /* a domain's wash with its kanji (a goal card's band when it has no picture) */
  function wash(mark, tone, opts) {
    opts = opts || {};
    return el("div", { class: "k-wash", "data-ui": "goal.wash", "data-tone": tone || null, "data-mono": opts.mono ? "" : null, "aria-hidden": "true" },
      [el("span", { class: "k-wash-mark", text: mark || "" })]);
  }
  KOS.ui.amount = amount;
  KOS.ui.amountField = amountField;
  KOS.ui.catBar = catBar;
  KOS.ui.paceChip = paceChip;
  KOS.ui.periods = periods;
  KOS.ui.ring = ring;
  KOS.ui.pictureSlot = pictureSlot;
  KOS.ui.wash = wash;

  /* ============================================================
     THE SPEC SPINE'S PRESENCE  (UI rebuild M1)

     Thirty-odd views each hid the spine with the same two class writes, and
     the Study views undid them by hand. One helper now owns it, and the
     state is an attribute — #cols[data-tree="none"|"open"|"closed"] — so
     readers never depend on a presentation class.

       KOS.shell.tree("none")    this view has no spine
       KOS.shell.tree("open")    the spine is shown and expanded
       KOS.shell.tree("closed")  the spine is present but collapsed
       KOS.shell.tree()          the current mode
     ============================================================ */
  KOS.shell = KOS.shell || {};
  /* the page's actions on the sub-navigation row (Graphite frame 8a). Every
     navigation clears the slot before the view renders; a view that has
     actions puts them back. Nothing = hidden. */
  KOS.shell.actions = function (nodes) {
    var slot = document.getElementById("page-actions");
    if (!slot) return null;
    slot.innerHTML = "";
    (nodes || []).filter(Boolean).forEach(function (n) { slot.appendChild(n); });
    slot.hidden = !slot.children.length;
    return slot;
  };
  /* a view that lays out its own full-height columns (the topic page) asks
     for the stage without padding and without the sub-navigation row
     (frame 8b); every navigation hands the stage back */
  KOS.shell.bleed = function (on) {
    var stage = document.getElementById("stage"), head = document.getElementById("stage-head");
    if (stage) { if (on) stage.setAttribute("data-bleed", ""); else stage.removeAttribute("data-bleed"); }
    if (head) head.hidden = !!on;
  };
  KOS.shell.tree = function (mode) {
    var cols = document.getElementById("cols");
    var tree = document.getElementById("tree");
    if (mode === undefined) return (cols && cols.getAttribute("data-tree")) || "none";
    if (mode !== "none" && mode !== "open" && mode !== "closed") mode = "none";
    var none = mode === "none";
    if (tree) tree.hidden = none;
    if (cols) cols.setAttribute("data-tree", mode);
    /* the rail has a separate remembered width beside the spine */
    if (KOS.shell.applyRail) KOS.shell.applyRail();
    return mode;
  };

  function renderSubnav(sec, viewId, arg) {
    var nav = document.getElementById("subnav");
    if (!nav) return;
    var items = SUBNAV[sec];
    /* inside Code the loose pills are Code's own (frame 26a): Retrieval,
       Skill map, Curriculum map — and Review, Assignments, Exams & Papers
       stay one tap away on every other subject */
    var inCode = sec === "study" && (viewId === "code" || (viewId === "subject" && arg === "code") || (viewId === "ref" && arg && arg.subject === "code"));
    /* inside Japanese the loose pills are its own pages: Reviews with its count, Kana, Skills,
       the path and the checkpoints (the desk is the subject pill itself) */
    var inJa = sec === "study" && (viewId === "japanese" || (viewId === "subject" && arg === "ja") || (viewId === "ref" && arg && arg.subject === "ja"));
    if (inJa) {
      var cutJ = items.indexOf(null);
      items = items.slice(0, cutJ).concat([null,
        { label: "Reviews", view: "japanese", arg: { page: "reviews" }, count: "pc-ja-due", tone: "neutral", page: "reviews" },
        { label: "Kana", view: "japanese", arg: { page: "kana" }, page: "kana" },
        { label: "Skills", view: "japanese", arg: { page: "skills" }, page: "skills" },
        { label: "Path", view: "japanese", arg: { page: "path" }, page: "path" },
        { label: "Checkpoints", view: "japanese", arg: { page: "checkpoints" }, page: "checkpoints" }]);
    }
    /* inside Creatives the loose pills are its own pages (31a): the tracks, the Writing Desk, the
       drills and the Portfolio; the Practice Log is private and opens only from its own links */
    var inCr = sec === "study" && (viewId === "creatives" || (viewId === "subject" && arg === "creatives") || (viewId === "ref" && arg && arg.subject === "creatives"));
    if (inCr) {
      var cutC = items.indexOf(null);
      items = items.slice(0, cutC).concat([null].concat((KOS.crPages || []).map(function (pg) {
        return { label: pg[1], view: "creatives", arg: { page: pg[0] }, page: pg[0] };
      })));
    }
    if (inCode) {
      var cut = items.indexOf(null);
      items = items.slice(0, cut).concat([null,
        { label: "Retrieval", view: "code", arg: { page: "retrieval" }, count: "pc-code-due", tone: "neutral", page: "retrieval" },
        { label: "Katas", view: "code", arg: { page: "kata" }, page: "kata" },
        { label: "Skill map", view: "code", arg: { page: "skills" }, page: "skills" },
        { label: "Curriculum map", view: "code", arg: { page: "map" }, page: "map" }]);
    }
    /* the subject pills show one group: the A-level subjects on their pages (and on Review,
       Assignments, Exams and Pacing), Code and Japanese on theirs */
    if (sec === "study" && items && KOS.subjects) {
      var here = viewId === "subject" ? arg : viewId === "ref" && arg ? arg.subject : inCode ? "code" : inJa ? "ja" : inCr ? "creatives" : "compsci";
      var grp = KOS.subjects.group(here), exam = KOS.subjects.isExam(here);
      var other = KOS.subjects.ids().filter(function (s) { return grp.indexOf(s) < 0; });
      items = items.filter(function (it) { return !it || it.view !== "subject" || grp.indexOf(it.arg) >= 0; });
      /* one pill reaches the other group: its subject last opened, else its first */
      if (other.length) {
        var to = other.indexOf(KOS.store.state.ui.subject) >= 0 ? KOS.store.state.ui.subject : other[0];
        var at = items.indexOf(null);
        items.splice(at < 0 ? items.length : at, 0, { label: exam ? "Study spaces" : "A-levels", view: "subject", arg: to, switchGroup: true });
      }
    }
    nav.innerHTML = "";
    if (!items) { nav.hidden = true; return; }
    nav.hidden = false;
    /* which entry is lit: the view itself, or the owning subject for ref pages */
    var activeView = viewId, activeArg = arg;
    if (viewId === "ref" && arg) { activeView = "subject"; activeArg = arg.subject; }
    if (viewId === "code") { activeView = arg && (arg.page === "retrieval" || arg.page === "skills" || arg.page === "map") ? "code" : "subject"; activeArg = activeView === "code" ? arg.page : "code"; }
    if (viewId === "japanese") { activeView = arg && ["reviews", "kana", "skills", "path", "checkpoints"].indexOf(arg.page) >= 0 ? "japanese" : "subject"; activeArg = activeView === "japanese" ? arg.page : "ja"; }
    if (viewId === "creatives") { activeView = arg && (KOS.crPages || []).some(function (pg) { return pg[0] === arg.page; }) ? "creatives" : "subject"; activeArg = activeView === "creatives" ? arg.page : "creatives"; }
    if (viewId === "seasonal" || viewId === "mangaka") activeView = "anime";
    if (viewId === "due" || viewId === "cardstats") activeView = "review";
    if (viewId === "tracker") activeView = "exams";
    if (["aniprofile", "vndbprofile"].indexOf(viewId) !== -1) activeView = "mediasync";
    /* built through the shared tabs primitive (variant "primary") so the
       section strip, the workspace switchers and the Books lens cards are
       one component with three variants rather than three components */
    var strip = KOS.ui.tabs(items.map(function (it) {
      if (!it) return { sep: true };
      return { label: it.label, short: it.short, dot: it.dot, glyph: it.mark,
        countId: it.count || null, countTone: it.tone || null, countHidden: !!it.countHidden,
        active: !it.switchGroup && it.view === activeView && (it.arg === undefined || it.arg === activeArg || (it.page && it.page === activeArg)),
        onSelect: function () { KOS.show(it.view, it.arg); } };
    }), { variant: "primary", label: "Section" });
    nav.setAttribute("class", strip.getAttribute("class"));
    while (strip.firstChild) nav.appendChild(strip.firstChild);
    if (KOS.refreshRailCounters) KOS.refreshRailCounters();
  }

  KOS.show = function (viewId, arg, opts) {
    opts = opts || {};
    /* roadmap 1.3: a quick-note draft files into its topic's Spec fork when
       the topic is left — every show except one of that same topic (a
       redraw keeps the draft where it is) */
    if (KOS.edits && KOS.edits.fileQuickNotes) {
      KOS.edits.fileQuickNotes(viewId === "ref" && arg && arg.subject ? arg.subject + ":" + arg.ref : null);
    }
    /* a shop "Try on" lasts only while the shop is on screen (frame 21h) */
    if (KOS.governor && KOS.governor.triedTheme && KOS.governor.triedTheme() && !(viewId === "governor" && arg === "shop")) {
      KOS.governor.tryTheme(null);
    }
    /* a fresh navigation (not Back/Forward) records history and abandons any
       forward trail — exactly like a browser address bar */
    if (!navCur || navCur.viewId !== viewId) scrollMemo = {};
    else noteScrolls(document.getElementById("main"));
    /* a redraw of the page already on screen (KOS.rerender, a cloud pull):
       a view keeps what the reader had open, such as a topic's tab */
    KOS.ui.redrawing = !!opts._nav && !!navCur && navKey(navCur) === navKey({ viewId: viewId, arg: arg });
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
    /* Japanese's pages are Study's, but its own tile (語) is the one lit there */
    var railSec = sec;
    document.querySelectorAll("[data-ui~='shell.rail-item']").forEach(function (b) {
      var lit = !!railSec && b.dataset.section === railSec;
      KOS.ui.state(b, "active", lit);
      if (lit) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    KOS.shell.bleed(false);
    renderSubnav(sec, viewId, arg);
    KOS.shell.actions(null);
    try { if (KOS.views[viewId]) KOS.views[viewId](main, arg); }
    finally { KOS.ui.redrawing = false; }
    KOS.store.state.ui.view = viewId;
    if (viewId === "subject") KOS.store.state.ui.subject = arg;
    if (sec === "productivity") KOS.store.state.ui.lastProd = { view: viewId, arg: typeof arg === "string" ? arg : null };
    KOS.store.save();
    updateNavBtns();
  };
})();
