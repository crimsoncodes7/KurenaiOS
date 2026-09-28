/* Kurenai OS — Category 7 Phase E: compact/mobile shell presentation.
   Routing, search ranking and the seven canonical rail buttons remain owned
   by ui.js/main.js/hub.js. This module only changes how those same controls
   are presented when the sanctioned compact tiers are active.

   UI rebuild M14: the sheets are the shared Graphite dialog (k-dialog-
   overlay / k-dialog, a bottom sheet at the phone tier) and the section
   strip is the shared k-scroller; every node carries its own data-ui hook.

   Design part 2, frame 15a: the phone shell. A compact header (logo,
   search, bell, sync dot); five tabs, the fifth opening More (the profile
   row, then Governor, Assistant, Archive); a full-screen search sheet; and
   on every sectioned page a TITLE BAR — the section as its kicker, the
   current destination as the title, and ▾ opening a section-switch sheet
   that stands in for the section strip. A view lends the bar its tools by
   marking canonical nodes: [data-phone-action] rides the bar's right edge,
   [data-phone-more] goes into the bar's ⋯ sheet. Both are MOVED, never
   cloned, and go back when the phone tier ends (invariants 58, 72). */
(function () {
  "use strict";

  var el = KOS.ui.el;
  function media(query) {
    return window.matchMedia ? window.matchMedia(query) : {
      matches: false, addEventListener: function () {}, addListener: function () {}
    };
  }
  var phone = media("(max-width: 700px)");
  var compact = media("(max-width: 860px)");
  var rail = document.getElementById("rail");
  var subnav = document.getElementById("subnav");
  var main = document.getElementById("main");
  var searchbox = document.getElementById("searchbox");
  var searchInput = document.getElementById("search");
  var searchResults = document.getElementById("search-results");
  var topbarRight = document.querySelector("[data-ui~='shell.header-actions']");
  if (!rail || !subnav || !main || !searchbox || !searchInput || !searchResults || !topbarRight) return;

  function listenMedia(query, fn) {
    if (query.addEventListener) query.addEventListener("change", fn);
    else if (query.addListener) query.addListener(fn);
  }

  function overlayFor(box, sheet) {
    var overlay = el("div", { class: "k-dialog-overlay", "data-ui": "ui.dialog-overlay", "data-sheet": sheet });
    overlay.appendChild(box);
    overlay.close = function () { overlay.remove(); };
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) overlay.close();
    });
    return overlay;
  }
  /* a sheet's ✕ (15a: a 52px header with the close at its end) */
  function sheetClose(label) {
    return el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "shell.sheet-close",
      "aria-label": label || "Close", text: "✕" });
  }

  /* ------------------------------------------------------------------
     Compact secondary navigation: renderSubnav continues to own the
     canonical <nav> and buttons. The ordinary scroller helper cannot wrap
     a landmark without changing its role to "group", so this phase-local
     shell puts the intact nav inside the same declared data-scroller/fade
     contract. Phase F can therefore refine nav keyboard semantics without
     competing with a scrolling key handler on the landmark. */
  var subnavWrap = null;
  var subnavPrev = null;
  var subnavNext = null;

  function syncSubnavEdges() {
    if (!subnavWrap || !subnavWrap.isConnected) return;
    var max = subnav.scrollWidth - subnav.clientWidth;
    KOS.ui.state(subnavWrap, "at-start", subnav.scrollLeft <= 1 || max <= 1);
    KOS.ui.state(subnavWrap, "at-end", subnav.scrollLeft >= max - 1 || max <= 1);
    KOS.ui.state(subnavWrap, "no-scroll", max <= 1);
    subnavWrap.hidden = subnav.hidden;
  }

  function revealActiveSubnav() {
    var later = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 0); };
    later(function () {
      if (!subnavWrap || !subnavWrap.isConnected) return;
      var active = subnav.querySelector("[data-ui~='shell.subnav-item'][data-state~='active']");
      if (active) {
        var left = active.offsetLeft;
        var right = left + active.offsetWidth;
        var visibleLeft = subnav.scrollLeft + 8;
        var visibleRight = subnav.scrollLeft + subnav.clientWidth - 8;
        if (left < visibleLeft || right > visibleRight) {
          subnav.scrollLeft = Math.max(0, left - (subnav.clientWidth - active.offsetWidth) / 2);
        }
      }
      syncSubnavEdges();
    });
  }

  function unwrapSubnav() {
    if (!subnavWrap || subnav.parentNode !== subnavWrap) return;
    subnavWrap.parentNode.insertBefore(subnav, subnavWrap);
    subnavWrap.remove();
  }

  function enhanceSubnav() {
    if (!compact.matches) { unwrapSubnav(); return; }
    if (!subnavWrap) {
      subnavWrap = el("div", {
        class: "k-scroller k-subnav-scroller",
        "data-ui": "shell.subnav-scroller",
        "data-scroller": "true"
      });
      subnavPrev = el("button", {
        type: "button", class: "k-scroller-arrow", "data-ui": "ui.scroller-arrow", "data-edge": "start", text: "‹",
        "aria-label": "Earlier section destinations", tabindex: "-1"
      });
      subnavNext = el("button", {
        type: "button", class: "k-scroller-arrow", "data-ui": "ui.scroller-arrow", "data-edge": "end", text: "›",
        "aria-label": "Later section destinations", tabindex: "-1"
      });
      function page(direction) {
        subnav.scrollBy({ left: direction * Math.max(160, subnav.clientWidth * 0.8), behavior: "smooth" });
      }
      subnavPrev.addEventListener("click", function () { page(-1); });
      subnavNext.addEventListener("click", function () { page(1); });
      subnav.addEventListener("scroll", syncSubnavEdges, { passive: true });
      if (typeof window.ResizeObserver === "function") {
        try { new window.ResizeObserver(syncSubnavEdges).observe(subnav); } catch (error) { /* jsdom */ }
      }
    }
    if (subnav.parentNode !== subnavWrap) {
      subnav.parentNode.insertBefore(subnavWrap, subnav);
      subnavWrap.appendChild(subnavPrev);
      subnavWrap.appendChild(subnav);
      subnavWrap.appendChild(subnavNext);
    }
    revealActiveSubnav();
    setTimeout(revealActiveSubnav, 80);
  }

  var subnavObserver = new MutationObserver(enhanceSubnav);
  subnavObserver.observe(subnav, { childList: true });

  /* ------------------------------------------------------------------
     Phone primary navigation: four high-frequency destinations remain in
     the bar. Governor, Assistant and Archive stay as their original rail
     buttons and are activated through a bottom-sheet More surface. */
  var hiddenRail = [
    { section: "governor", label: "Governor", glyph: "守", hint: "Status, Gold Shop, Avatar, Session Log" },
    { section: "assistant", label: "Assistant", glyph: "助", hint: "Chat, History, Settings, Memory" },
    { section: "system", label: "Archive", glyph: "蔵", hint: "Notifications, Backup & Restore, Help & Guide",
      badge: function () { return KOS.notify && KOS.notify.unread ? KOS.notify.unread() : 0; } }
  ].map(function (item) {
    item.button = rail.querySelector('[data-section="' + item.section + '"]');
    return item;
  });
  var activeMoreOverlay = null;

  var moreButton = el("button", {
    id: "mobile-more",
    type: "button",
    class: "k-rail-item k-rail-more",
    "data-ui": "shell.rail-more",
    "aria-label": "More destinations",
    "aria-haspopup": "dialog",
    "aria-expanded": "false"
  }, [
    el("span", { class: "k-rail-tile", lang: "ja", "aria-hidden": "true", text: "余" }),
    el("span", { class: "k-rail-label", "data-ui": "part.text", text: "More" })
  ]);
  rail.insertBefore(moreButton, rail.querySelector("[data-ui~='shell.rail-foot']"));

  function updateMoreState() {
    var active = hiddenRail.some(function (item) {
      return item.button && item.button.matches('[data-state~="active"]');
    });
    KOS.ui.state(moreButton, "active", active);
    if (active) moreButton.setAttribute("aria-current", "page");
    else moreButton.removeAttribute("aria-current");
  }

  function openMore() {
    if (!phone.matches || activeMoreOverlay) return;
    var first = null;
    var list = el("div", { class: "k-msheet-list" });
    /* the profile chip from the rail's foot leads the sheet (15a) */
    if (KOS.governor && KOS.governor.profile) {
      var p = KOS.governor.profile();
      list.appendChild(el("button", { type: "button", class: "k-msheet-profile", "data-ui": "shell.more-profile",
        "aria-label": "Your profile — Level " + p.level + ", " + (p.hpLabel || p.hpState || "") + ", " + KOS.ui.num(p.gold) + " gold",
        onclick: function () { activeMoreOverlay.close(); KOS.show("governor"); } }, [
        KOS.governor.avatarNode ? KOS.governor.avatarNode(40) : null,
        el("span", { class: "k-msheet-copy" }, [
          el("b", { text: "Level " + p.level }),
          el("span", { class: "k-msheet-profile-meta" }, [
            el("span", { class: "k-msheet-hp", "data-hp": p.hpState || null, text: p.hpLabel || "" }),
            el("span", { class: "k-msheet-gold", text: "◆ " + KOS.ui.num(p.gold) })
          ])
        ]),
        el("span", { class: "k-msheet-chev", "aria-hidden": "true", text: "›" })
      ].filter(Boolean)));
    }
    hiddenRail.forEach(function (item) {
      if (!item.button) return;
      var current = item.button.matches('[data-state~="active"]');
      var destinationAttrs = {
        type: "button",
        class: "k-msheet-dest",
        "data-ui": "shell.mobile-sheet-destination",
        "data-state": current ? "current" : null,
        onclick: function () {
          activeMoreOverlay.close();
          item.button.click();
        }
      };
      if (current) destinationAttrs["aria-current"] = "page";
      var n = item.badge ? item.badge() : 0;
      var destination = el("button", destinationAttrs, [
        el("span", { class: "k-msheet-glyph", lang: "ja", "aria-hidden": "true", text: item.glyph }),
        el("span", { class: "k-msheet-copy" }, [
          el("b", { text: item.label }),
          el("span", { text: item.hint })
        ]),
        n ? el("span", { class: "k-msheet-badge", "aria-label": n + " unread", text: String(n) }) : null,
        el("span", { class: "k-msheet-chev", "aria-hidden": "true", text: "›" })
      ].filter(Boolean));
      if (!first || current) first = destination;
      list.appendChild(destination);
    });
    var close = sheetClose();
    var box = el("section", { class: "k-dialog k-msheet", "data-ui": "ui.dialog shell.mobile-nav-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "More" }),
        close
      ]),
      list
    ]);
    var overlay = overlayFor(box, "more");
    activeMoreOverlay = overlay;
    close.addEventListener("click", function () { overlay.close(); });
    moreButton.setAttribute("aria-expanded", "true");
    KOS.ui.openDialog(overlay, {
      initialFocus: first || close,
      onClose: function () {
        if (activeMoreOverlay === overlay) activeMoreOverlay = null;
        moreButton.setAttribute("aria-expanded", "false");
        updateMoreState();
      }
    });
  }
  moreButton.addEventListener("click", openMore);

  var railObserver = new MutationObserver(updateMoreState);
  hiddenRail.forEach(function (item) {
    if (item.button) railObserver.observe(item.button, { attributes: true, attributeFilter: ["class", "data-state"] });
  });

  /* ------------------------------------------------------------------
     Phone search: move—not clone—the existing global search node into a
     bottom sheet. hub.js keeps every listener, result and ranking rule. */
  var searchAnchor = document.createComment("mobile-search-home");
  searchbox.parentNode.insertBefore(searchAnchor, searchbox);
  var activeSearchOverlay = null;
  var searchTrigger = el("button", {
    id: "mobile-search-trigger",
    type: "button",
    class: "k-iconbtn",
    "data-ui": "shell.search-trigger",
    "aria-label": "Search",
    "aria-haspopup": "dialog",
    "aria-expanded": "false",
    title: "Search"
  }, [el("span", { "aria-hidden": "true", text: "⌕" })]);
  topbarRight.insertBefore(searchTrigger, topbarRight.firstChild);

  function restoreSearchbox() {
    if (searchAnchor.parentNode && searchbox.parentNode !== searchAnchor.parentNode) {
      searchAnchor.parentNode.insertBefore(searchbox, searchAnchor.nextSibling);
    }
    /* Phase F may attach asynchronous/global search state to the canonical
       controller. Prefer its cancel seam when present so closing this
       presentation also invalidates pending results and ARIA state. */
    if (KOS.hub && typeof KOS.hub.dismissSearch === "function") {
      KOS.hub.dismissSearch({ preserveQuery: true });
    } else {
      KOS.ui.state(searchResults, "open", false);
    }
  }

  function openSearch() {
    if (!phone.matches) return false;
    if (activeSearchOverlay) { searchInput.focus(); return true; }
    /* 15a: full screen — the canonical field with Cancel beside it, the
       domain chips and the grouped results under it (the same controller,
       the same eight domains) */
    var close = el("button", { type: "button", class: "k-link k-msearch-cancel", "data-ui": "shell.sheet-close", text: "Cancel" });
    var slot = el("div", { class: "k-msheet-slot" });
    slot.appendChild(searchbox);
    var box = el("section", { class: "k-dialog k-msheet k-msheet--full", "data-ui": "ui.dialog shell.search-sheet", "data-dialog-box": "true",
      "aria-label": "Search" }, [
      el("div", { class: "k-msearch-head" }, [slot, close])
    ]);
    var overlay = overlayFor(box, "search");
    activeSearchOverlay = overlay;
    close.addEventListener("click", function () { overlay.close(); });
    searchTrigger.setAttribute("aria-expanded", "true");
    KOS.ui.openDialog(overlay, {
      initialFocus: searchInput,
      onClose: function () {
        restoreSearchbox();
        if (activeSearchOverlay === overlay) activeSearchOverlay = null;
        searchTrigger.setAttribute("aria-expanded", "false");
      }
    });
    /* Closing a sheet deliberately hides the desktop result popover. If a
       query remains in the canonical input, rebuild that same result list
       after the opener click has finished bubbling through hub.js's
       outside-click guard. */
    if (searchInput.value.trim().length >= 2) setTimeout(function () {
      if (activeSearchOverlay === overlay) {
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 0);
    return true;
  }
  KOS.mobileShell = KOS.mobileShell || {};
  KOS.mobileShell.openSearch = openSearch;
  searchTrigger.addEventListener("click", openSearch);
  /* The sheet used to close by INTERCEPTING the result click and the Enter
     key ahead of the canonical controller. That was a race, and Enter lost
     it: closing ran restoreSearchbox → dismissSearch, which emptied the
     controller's option list before it could read the highlighted row, so
     the sheet closed and nothing navigated. The controller now announces
     the decision and this closes on being told — one order, both input
     methods, and the route change still happens last so it owns the
     post-navigation focus. */
  if (KOS.hub && typeof KOS.hub.onSearchChosen === "function") {
    KOS.hub.onSearchChosen(function () {
      if (activeSearchOverlay) activeSearchOverlay.close();
    });
  }
  function searchShortcutState(event) {
    var target = event.target;
    var typing = target && (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable);
    var modified = event.altKey || event.ctrlKey || event.metaKey;
    var dialogOpen = KOS.ui.topDialog && KOS.ui.topDialog();
    return { typing: typing, modified: modified, dialogOpen: dialogOpen };
  }
  /* Guard the older desktop shortcut from focusing a hidden input behind a
     dialog or consuming a modified browser shortcut. The bubble listener
     below reacts only after the canonical search controller accepts `/`;
     Phase F can therefore keep one shortcut owner. */
  document.addEventListener("keydown", function (event) {
    if (!phone.matches || event.key !== "/") return;
    var state = searchShortcutState(event);
    if (state.typing) return;
    if (state.dialogOpen) event.preventDefault();
    if (state.modified || state.dialogOpen) event.stopPropagation();
  }, true);
  document.addEventListener("keydown", function (event) {
    if (!phone.matches || event.key !== "/") return;
    var state = searchShortcutState(event);
    if (state.typing || state.modified || state.dialogOpen) return;
    if (!event.defaultPrevented && document.activeElement !== searchInput) return;
    /* hub.js has just focused the canonical desktop input; put the restore
       point on the visible phone trigger before openDialog snapshots it. */
    if (document.activeElement === searchInput) searchTrigger.focus();
    openSearch();
  });

  /* ------------------------------------------------------------------
     At the tablet tier, tall filter rails become explicit disclosure
     surfaces. Their existing nodes are moved into a dialog and restored on
     close, so module state and listeners remain canonical. */
  var activeCompactSheet = null;

  function openMovedSheet(opts) {
    if (!compact.matches || activeCompactSheet) return;
    var node = opts.node;
    var origin = node.parentNode;
    var next = node.nextSibling;
    var close = sheetClose();
    var slot = el("div", { class: "k-msheet-slot", "data-slot": opts.slot });
    slot.appendChild(node);
    var box = el("section", { class: "k-dialog k-msheet" + (opts.tall ? " k-msheet--tall" : ""), "data-ui": "ui.dialog shell.compact-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("div", {}, [el("span", { class: "k-kicker", text: opts.eyebrow }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: opts.title })]),
        close
      ]),
      slot
    ]);
    var overlay = overlayFor(box, "compact");
    activeCompactSheet = { overlay: overlay, origin: origin };
    close.addEventListener("click", function () { overlay.close(); });
    if (opts.trigger) opts.trigger.setAttribute("aria-expanded", "true");
    KOS.ui.openDialog(overlay, {
      initialFocus: node.querySelector("button, input, select, textarea") || close,
      onClose: function () {
        if (origin.isConnected) origin.insertBefore(node, next && next.parentNode === origin ? next : null);
        else node.remove();
        if (opts.trigger) opts.trigger.setAttribute("aria-expanded", "false");
        if (activeCompactSheet && activeCompactSheet.overlay === overlay) activeCompactSheet = null;
        if (opts.onClose) opts.onClose();
      }
    });
    return overlay;
  }
  /* a view lends a canonical node to a sheet (15h: Reminders' lists, sort
     and detail, Habits' directives); it goes back when the sheet closes */
  KOS.mobileShell.moveToSheet = openMovedSheet;

  function enhanceVaultDisclosure(layout) {
    if (layout.dataset.compactDisclosure) return;
    var side = layout.querySelector(":scope > [data-ui~='vault.filter-rail']");
    var mainCol = layout.querySelector(":scope > [data-ui~='vault.main']");
    if (!side || !mainCol) return;
    layout.dataset.compactDisclosure = "true";
    var trigger = el("button", {
      type: "button",
      class: "k-btn k-disclosure",
      "data-ui": "vault.disclosure-trigger",
      text: "☷ Status & lists",
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
      onclick: function () {
        openMovedSheet({ node: side, trigger: trigger, eyebrow: "Vault filters", title: "Status & custom lists", slot: "vault" });
      }
    });
    mainCol.insertBefore(trigger, mainCol.firstChild);
  }

  function enhanceCompactSurfaces() {
    if (activeCompactSheet && !activeCompactSheet.origin.isConnected) activeCompactSheet.overlay.close();
    if (activeToolsOverlay && activeToolsOverlay.stale()) activeToolsOverlay.close();
    main.querySelectorAll("[data-ui~='vault.layout']").forEach(enhanceVaultDisclosure);
  }
  var mainObserver = new MutationObserver(function () { enhanceCompactSurfaces(); syncTitleBar(); });
  mainObserver.observe(main, { childList: true, subtree: true });

  /* ------------------------------------------------------------------
     The phone title bar and its section switch (15a). The destinations
     are the canonical ones — the section strip's buttons, or a page's own
     workspace tabs where it has no strip (the Governor) — and choosing one
     clicks that button, so routing stays where it was. */
  var NO_TITLE = { home: 1, ref: 1, assistant: 1 };
  var titleBar = null, activeSectionOverlay = null, activeToolsOverlay = null;
  var moved = [];                            /* {node, parent, next} to put back */
  function sectionLabel() {
    var cur = rail.querySelector("[data-ui~='shell.rail-item'][aria-current='page'] [data-ui~='shell.rail-label']");
    return cur ? cur.textContent.trim() : "";
  }
  function destinations() {
    var items = Array.prototype.slice.call(subnav.querySelectorAll("[data-ui~='shell.subnav-item']"));
    var source = "subnav";
    if (!items.length) {
      var tabs = main.querySelector("[data-phone-tabs] [role='tab']") && main.querySelector("[data-phone-tabs]");
      if (tabs) { items = Array.prototype.slice.call(tabs.querySelectorAll("[role='tab']")); source = "tabs"; }
    }
    return items.map(function (b) {
      var count = b.querySelector(".k-seg-count");
      var label = b.getAttribute("aria-label") || (b.querySelector("[data-ui~='part.text']") || b).textContent.trim();
      return { button: b, label: label, count: count && !count.hidden ? count.textContent.trim() : "",
        current: source === "subnav" ? b.getAttribute("aria-current") === "page" : b.getAttribute("aria-selected") === "true" };
    });
  }
  /* a moved node goes back where its placeholder is — and only if the
     placeholder survived: a view that re-rendered its slot owns fresh
     nodes, so a stale one is dropped, never re-inserted beside them */
  function moveOut(n) {
    var mark = document.createComment("phone-home");
    n.parentNode.insertBefore(mark, n);
    moved.push({ node: n, mark: mark });
    return n;
  }
  function restoreMoved() {
    moved.forEach(function (m) {
      if (m.mark.isConnected) m.mark.parentNode.replaceChild(m.node, m.mark);
      else m.node.remove();
    });
    moved = [];
  }
  function openSection() {
    if (activeSectionOverlay) return;
    var list = destinations();
    var close = sheetClose();
    var first = null;
    var rows = el("div", { class: "k-msheet-list k-msheet-list--plain" }, list.map(function (d) {
      var row = el("button", { type: "button", class: "k-msheet-row", "data-ui": "shell.section-destination",
        "aria-current": d.current ? "page" : null,
        onclick: function () { activeSectionOverlay.close(); d.button.click(); } }, [
        el("span", { class: "k-msheet-row-l", text: d.label }),
        d.count ? el("span", { class: "k-msheet-count", text: d.count }) : null,
        d.current ? el("span", { class: "k-msheet-check", "aria-hidden": "true", text: "✓" }) : null
      ].filter(Boolean));
      if (!first || d.current) first = row;
      return row;
    }));
    var box = el("section", { class: "k-dialog k-msheet", "data-ui": "ui.dialog shell.section-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: sectionLabel() || "Go to" }), close]),
      rows
    ]);
    var overlay = overlayFor(box, "section");
    activeSectionOverlay = overlay;
    close.addEventListener("click", function () { overlay.close(); });
    KOS.ui.openDialog(overlay, { initialFocus: first || close, onClose: function () { if (activeSectionOverlay === overlay) activeSectionOverlay = null; } });
  }
  /* the page's ⋯ sheet: its [data-phone-more] nodes, moved in and back */
  function openTools(nodes, title) {
    if (activeToolsOverlay) return;
    var close = sheetClose();
    var slot = el("div", { class: "k-msheet-slot k-msheet-tools", "data-slot": "tools" });
    var homes = nodes.map(function (n) { var h = { node: n, parent: n.parentNode, next: n.nextSibling }; slot.appendChild(n); return h; });
    var box = el("section", { class: "k-dialog k-msheet", "data-ui": "ui.dialog shell.tools-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title }), close]),
      slot
    ]);
    var overlay = overlayFor(box, "tools");
    /* the tools belong to one page: once it is gone, so is the sheet */
    overlay.stale = function () { return homes.some(function (h) { return !h.parent.isConnected; }); };
    activeToolsOverlay = overlay;
    close.addEventListener("click", function () { overlay.close(); });
    KOS.ui.openDialog(overlay, { initialFocus: slot.querySelector("button, input, select, textarea") || close, onClose: function () {
      homes.forEach(function (h) {
        if (h.parent.isConnected) h.parent.insertBefore(h.node, h.next && h.next.parentNode === h.parent ? h.next : null);
      });
      if (activeToolsOverlay === overlay) activeToolsOverlay = null;
    } });
  }
  var titleBusy = false;
  function syncTitleBar() {
    if (titleBusy) return;
    titleBusy = true;
    try {
      var nav = KOS.currentNav && KOS.currentNav();
      var want = phone.matches && nav && !NO_TITLE[nav.viewId] && !main.querySelector("[data-phone-notitle]");
      if (!want) {
        if (titleBar) { restoreMoved(); titleBar.remove(); titleBar = null; }
        main.removeAttribute("data-phone-title");
        return;
      }
      var list = destinations();
      var cur = list.filter(function (d) { return d.current; })[0];
      var h1 = main.querySelector("h1");
      var title = (main.querySelector("[data-phone-title-text]") || {}).textContent || (cur ? cur.label : (h1 ? h1.textContent.trim() : ""));
      var key = [nav.viewId, sectionLabel(), title, list.length].join("|");
      /* a redraw can leave a fresh action behind the bar: move it too */
      var stray = Array.prototype.some.call(main.querySelectorAll("[data-phone-action]"), function (n) { return !titleBar || !titleBar.contains(n); });
      if (titleBar && titleBar.parentNode === main && main.firstChild === titleBar && titleBar.dataset.key === key && !stray) return;
      restoreMoved();
      if (titleBar) titleBar.remove();
      var tools = el("div", { class: "k-ptitle-tools" });
      var pageActions = document.getElementById("page-actions");
      Array.prototype.slice.call(main.querySelectorAll("[data-phone-action]"))
        .concat(pageActions ? Array.prototype.slice.call(pageActions.querySelectorAll("[data-phone-action]")) : []).forEach(function (n) {
        tools.appendChild(moveOut(n));
      });
      var more = Array.prototype.slice.call(main.querySelectorAll("[data-phone-more]"));
      if (more.length) tools.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "shell.page-tools",
        "aria-label": title + " tools", "aria-haspopup": "dialog", text: "⋯",
        onclick: function () { openTools(Array.prototype.slice.call(main.querySelectorAll("[data-phone-more]")), title); } }));
      titleBar = el("div", { class: "k-ptitle", "data-ui": "shell.phone-title", "data-key": key }, [
        el("div", { class: "k-ptitle-txt" }, [
          el("span", { class: "k-kicker", text: sectionLabel() }),
          el("div", { class: "k-ptitle-row" }, [
            el("h1", { class: "k-ptitle-h", text: title }),
            list.length > 1 ? el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-ptitle-switch", "data-ui": "shell.section-switch",
              "aria-label": "Switch within " + sectionLabel(), "aria-haspopup": "dialog", text: "▾", onclick: openSection }) : null
          ].filter(Boolean))
        ]),
        tools
      ]);
      main.insertBefore(titleBar, main.firstChild);
      main.setAttribute("data-phone-title", "");
    } finally { titleBusy = false; }
  }

  function syncShell() {
    var phoneChanged = lastPhoneMatch !== phone.matches;
    lastPhoneMatch = phone.matches;
    if (!phone.matches) {
      if (activeMoreOverlay) activeMoreOverlay.close();
      if (activeSearchOverlay) activeSearchOverlay.close();
      restoreSearchbox();
    }
    if (!compact.matches && activeCompactSheet) activeCompactSheet.overlay.close();
    enhanceSubnav();
    enhanceCompactSurfaces();
    syncTitleBar();
    updateMoreState();
    if (phoneChanged) refreshCalendarComposition();
  }

  /* Calendar deliberately has two different phone/desktop compositions.
     A mounted calendar must cross that breakpoint as cleanly as a freshly
     opened one (orientation changes do not route again). Defer the redraw
     while any dialog is open so an event editor keeps its live callback. */
  var lastPhoneMatch = phone.matches;
  var pendingCalendarRefresh = false;
  function calendarFocusSignature(node) {
    if (!node || !main.contains(node)) return null;
    return {
      label: node.getAttribute && node.getAttribute("aria-label"),
      text: (node.textContent || "").trim()
    };
  }
  function restoreCalendarFocus(signature, fallbackToMain) {
    if (!signature && !fallbackToMain) return;
    var buttons = Array.prototype.slice.call(main.querySelectorAll("button"));
    var target = signature && signature.label && buttons.find(function (button) {
      return button.getAttribute("aria-label") === signature.label;
    });
    if (!target && signature && signature.text) target = buttons.find(function (button) {
      return button.textContent.trim() === signature.text;
    });
    try { (target || main).focus({ preventScroll: true }); } catch (error) { (target || main).focus(); }
  }
  function refreshCalendarComposition() {
    var nav = KOS.currentNav && KOS.currentNav();
    if (!nav || nav.viewId !== "calendar") { pendingCalendarRefresh = false; return; }
    if (KOS.ui.topDialog && KOS.ui.topDialog()) { pendingCalendarRefresh = true; return; }
    var wasPending = pendingCalendarRefresh;
    var focus = calendarFocusSignature(document.activeElement);
    pendingCalendarRefresh = false;
    if (KOS.rerender) {
      KOS.rerender();
      /* Save/Delete can redraw once inside Calendar before this observer runs,
         detaching the opener that openDialog just restored. Only a deferred
         dialog crossing gets the #main fallback; ordinary resize never steals
         focus from the browser or another surface. */
      restoreCalendarFocus(focus, wasPending);
    }
  }
  if (typeof window.MutationObserver === "function") {
    var dialogObserver = new MutationObserver(function () {
      if (pendingCalendarRefresh && (!KOS.ui.topDialog || !KOS.ui.topDialog())) {
        refreshCalendarComposition();
      }
    });
    /* openDialog clears <html data-scroll-lock> as the last dialog closes */
    dialogObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scroll-lock"] });
  }

  listenMedia(phone, syncShell);
  listenMedia(compact, syncShell);
  syncShell();
  /* CSS hides canonical compact side rails only after every enhancement
     above has mounted successfully (:root[data-shell="ready"]). A
     missing/failed module therefore leaves the original filters visible
     and usable. */
  document.documentElement.setAttribute("data-shell", "ready");
})();
