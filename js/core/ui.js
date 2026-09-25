/* Kurenai OS — core/ui.js */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ============================================================
     HOOKS AND STATE  (UI rebuild M1)

     Behaviour and tests find the DOM through data-ui / data-state /
     data-intent, never through a presentation class (docs/ui-rebuild/
     view-contracts.md §0.1). Legacy markup still carries classes, so these
     helpers derive the attributes from them through the tables in
     js/core/ui-hooks.js. Each attribute is a space-separated token list,
     matched with [data-ui~="name"].
     ============================================================ */
  function tokens(v) { return v ? String(v).trim().split(/\s+/).filter(Boolean) : []; }
  function derived(cls) {
    var hooks = [], states = [], intents = [];
    var H = KOS.ui.LEGACY_HOOKS || {}, S = KOS.ui.LEGACY_STATE || [], I = KOS.ui.LEGACY_INTENT || [];
    tokens(cls).forEach(function (c) {
      if (Object.prototype.hasOwnProperty.call(H, c)) hooks = hooks.concat(H[c]);
      if (S.indexOf(c) !== -1) states.push(c);
      if (I.indexOf(c) !== -1) intents.push(c);
    });
    return { "data-ui": hooks, "data-state": states, "data-intent": intents };
  }
  /* move a node's derived attributes from what oldCls implied to what newCls
     implies, leaving any token that was set explicitly untouched */
  function syncHooks(node, oldCls, newCls) {
    if (!node || node.nodeType !== 1) return node;
    var was = derived(oldCls), now = derived(newCls);
    ["data-ui", "data-state", "data-intent"].forEach(function (attr) {
      var drop = was[attr].filter(function (t) { return now[attr].indexOf(t) === -1; });
      var have = tokens(node.getAttribute(attr)).filter(function (t) { return drop.indexOf(t) === -1; });
      now[attr].forEach(function (t) { if (have.indexOf(t) === -1) have.push(t); });
      if (have.length) node.setAttribute(attr, have.join(" "));
      else node.removeAttribute(attr);
    });
    return node;
  }
  /* className = … for legacy code: sets the class and keeps the hooks true */
  function setClass(node, cls) {
    var old = node.getAttribute("class") || "";
    node.setAttribute("class", cls);   /* setAttribute: SVG's className is not a string */
    return syncHooks(node, old, cls);
  }
  /* classList.toggle(word, on) for a state word: the class (for the legacy
     stylesheet) and the data-state token move together. Returns the state. */
  function state(node, word, on) {
    if (!node) return false;
    var old = node.getAttribute("class") || "";
    var val = node.classList.toggle(word, on === undefined ? undefined : !!on);
    syncHooks(node, old, node.getAttribute("class") || "");
    if (val && (KOS.ui.LEGACY_STATE || []).indexOf(word) === -1) {
      /* a state word the table does not list still reaches data-state */
      var have = tokens(node.getAttribute("data-state"));
      if (have.indexOf(word) === -1) { have.push(word); node.setAttribute("data-state", have.join(" ")); }
    } else if (!val) {
      var rest = tokens(node.getAttribute("data-state")).filter(function (t) { return t !== word; });
      if (rest.length) node.setAttribute("data-state", rest.join(" ")); else node.removeAttribute("data-state");
    }
    return val;
  }
  function hasState(node, word) { return !!node && tokens(node.getAttribute("data-state")).indexOf(word) !== -1; }
  /* markup that arrived through innerHTML: derive hooks for the subtree */
  function hookify(root) {
    if (!root || !root.querySelectorAll) return root;
    if (root.nodeType === 1 && root.hasAttribute("class")) syncHooks(root, "", root.getAttribute("class"));
    root.querySelectorAll("[class]").forEach(function (n) { syncHooks(n, "", n.getAttribute("class")); });
    return root;
  }
  /* the selector for a hook — for code that queries: KOS.ui.hook("vault.card") */
  function hook(name) { return '[data-ui~="' + name + '"]'; }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    var cls = null, html = false;
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") { node.className = attrs[k]; cls = attrs[k]; }
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") { node.innerHTML = attrs[k]; html = true; }
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else if (k === "style") node.style.cssText = attrs[k];
        /* Phase F: `title: opts.hint || null` is the house idiom for an
           optional attribute, and setAttribute stringifies — so every tab
           and menu button without a hint was shipping title="null", which
           shows as a tooltip and joins the accessible description. An
           absent value now means an absent attribute. */
        else if (attrs[k] === null || attrs[k] === undefined) { /* omit */ }
        else node.setAttribute(k, attrs[k]);
      });
    }
    /* after the loop, so an explicit data-ui/data-state is extended, not lost */
    if (cls) syncHooks(node, "", cls);
    if (html) hookify(node);
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
    t.setAttribute("data-state", "show" + (bad ? " bad" : ""));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.removeAttribute("data-state"); }, 2600);
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
    /* UI rebuild bridge: a modal built by a view that is not rebuilt yet
       still arrives with legacy classes; give it the dialog frame so it is
       positioned and legible. Rebuilt dialogs already carry these. */
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
       its scroll position when the dialog closes (that is why this is a
       class and a counter, not an inline style stashed per dialog) */
    document.body.classList.add("modal-open");
    document.documentElement.setAttribute("data-scroll-lock", "");

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
      if (!dialogStack.length) {
        document.body.classList.remove("modal-open");
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
    reminders: "productivity", pacing: "productivity",
    matrix: "collection", anime: "collection", books: "collection",
    vn: "collection", game: "collection", seasonal: "collection",
    mangaka: "collection", wishlist: "collection", shrine: "collection",
    goals: "collection",
    aniprofile: "collection", vndbprofile: "collection", mediasync: "collection",
    governor: "governor",
    assistant: "assistant",
    data: "system", help: "system", notifications: "system"
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
      null,
      { label: "Review", view: "review", count: "pc-review", tone: "neutral" },
      { label: "Assignments", view: "assignments", count: "pc-assign", tone: "urgent" },
      { label: "Exams & Papers", view: "tracker" }
    ],
    productivity: [
      { label: "Focus Timer", view: "focus" },
      { label: "Reminders", view: "reminders", count: "pc-rem", tone: "neutral" },
      { label: "Habits", view: "tasks" },
      { label: "Calendar", view: "calendar" },
      { label: "Pacing", view: "pacing" }
    ],
    collection: [
      { label: "Overview", view: "matrix" },
      { label: "Anime", view: "anime", dot: "var(--anime)" },
      { label: "Books", view: "books", dot: "var(--books)" },
      { label: "Visual Novels", view: "vn", dot: "var(--vn)" },
      { label: "Games", view: "game", dot: "var(--games)" },
      null,
      { label: "Shrine", view: "shrine", mark: "祠" },
      { label: "Planner", view: "wishlist", mark: "円" },
      { label: "Sync", view: "mediasync", mark: "同" }
    ],
    system: [
      { label: "Notifications", view: "notifications", mark: "通", count: "pc-notify", tone: "urgent" },
      { label: "Backup & Restore", view: "data", mark: "蔵" },
      { label: "Help & Guide", view: "help", mark: "導" }
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
    return list;
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
  function scroller(node, opts) {
    opts = opts || {};
    var wrap = el("div", { class: "k-scroller" + (opts.className ? " " + opts.className : ""),
      "data-ui": "ui.scroller", "data-scroller": "true" });
    var prev = el("button", { type: "button", class: "k-scroller-arrow", "data-ui": "ui.scroller-arrow", "data-edge": "start",
      text: "‹", "aria-label": opts.prevLabel || "Scroll left", tabindex: "-1" });
    var next = el("button", { type: "button", class: "k-scroller-arrow", "data-ui": "ui.scroller-arrow", "data-edge": "end",
      text: "›", "aria-label": opts.nextLabel || "Scroll right", tabindex: "-1" });
    node.classList.add("k-scroller-track");
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
      KOS.ui.state(wrap, "at-start", atStart || max <= 1);
      KOS.ui.state(wrap, "at-end", atEnd || max <= 1);
      KOS.ui.state(wrap, "no-scroll", max <= 1);
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

  KOS.ui.pageHeader = pageHeader;
  KOS.ui.sectionHeader = sectionHeader;
  KOS.ui.emptyState = emptyState;
  KOS.ui.statTile = statTile;
  KOS.ui.scroller = scroller;
  KOS.ui.menu = menu;

  /* ============================================================
     THE SPEC SPINE'S PRESENCE  (UI rebuild M1)

     Thirty-odd views each hid the spine with the same two class writes, and
     the Study views undid them by hand. One helper now owns it, and the
     state is an attribute — #cols[data-tree="none"|"open"|"closed"] — so
     readers never depend on a presentation class. The legacy classes
     (#tree.hidden, #cols.no-tree, #cols.tree-closed) are still written
     alongside until the stylesheet that reads them is retired.

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
    if (tree) {
      tree.classList.toggle("hidden", none);
      tree.hidden = none;
    }
    if (cols) {
      cols.classList.toggle("no-tree", none);
      /* a hidden spine keeps its collapsed/expanded look for when it returns */
      if (!none) cols.classList.toggle("tree-closed", mode === "closed");
      cols.setAttribute("data-tree", mode);
    }
    return mode;
  };

  function renderSubnav(sec, viewId, arg) {
    var nav = document.getElementById("subnav");
    if (!nav) return;
    var items = SUBNAV[sec];
    nav.innerHTML = "";
    if (!items) { nav.hidden = true; return; }
    nav.hidden = false;
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
      return { label: it.label, short: it.short, dot: it.dot, glyph: it.mark,
        countId: it.count || null, countTone: it.tone || null, countHidden: !!it.countHidden,
        active: it.view === activeView && (it.arg === undefined || it.arg === activeArg),
        onSelect: function () { KOS.show(it.view, it.arg); } };
    }), { variant: "primary", label: "Section" });
    nav.setAttribute("class", strip.getAttribute("class"));
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
    document.querySelectorAll("[data-ui~='shell.rail-item']").forEach(function (b) {
      var lit = !!sec && b.dataset.section === sec;
      KOS.ui.state(b, "active", lit);
      if (lit) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    KOS.shell.bleed(false);
    renderSubnav(sec, viewId, arg);
    KOS.shell.actions(null);
    if (KOS.views[viewId]) KOS.views[viewId](main, arg);
    KOS.store.state.ui.view = viewId;
    if (viewId === "subject") KOS.store.state.ui.subject = arg;
    KOS.store.save();
    updateNavBtns();
  };
})();
