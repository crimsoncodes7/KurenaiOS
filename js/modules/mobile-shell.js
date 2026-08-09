/* Kurenai OS — Category 7 Phase E: compact/mobile shell presentation.
   Routing, search ranking and the seven canonical rail buttons remain owned
   by ui.js/main.js/hub.js. This module only changes how those same controls
   are presented when the sanctioned compact tiers are active. */
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
  var topbarRight = document.querySelector(".topbar-right");
  if (!rail || !subnav || !main || !searchbox || !searchInput || !searchResults || !topbarRight) return;

  function listenMedia(query, fn) {
    if (query.addEventListener) query.addEventListener("change", fn);
    else if (query.addListener) query.addListener(fn);
  }

  function overlayFor(box, className) {
    var overlay = el("div", { class: "modal-ov mobile-shell-overlay " + className });
    overlay.appendChild(box);
    overlay.close = function () { overlay.remove(); };
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) overlay.close();
    });
    return overlay;
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
    subnavWrap.classList.toggle("at-start", subnav.scrollLeft <= 1 || max <= 1);
    subnavWrap.classList.toggle("at-end", subnav.scrollLeft >= max - 1 || max <= 1);
    subnavWrap.classList.toggle("no-scroll", max <= 1);
    subnavWrap.classList.toggle("hidden", subnav.classList.contains("hidden"));
  }

  function revealActiveSubnav() {
    var later = window.requestAnimationFrame || function (fn) { return setTimeout(fn, 0); };
    later(function () {
      if (!subnavWrap || !subnavWrap.isConnected) return;
      var active = subnav.querySelector(".subnav-item.active");
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
        class: "subnav-scroller",
        "data-scroller": "true"
      });
      subnavPrev = el("button", {
        type: "button", class: "u-scroller-arrow prev", text: "‹",
        "aria-label": "Earlier section destinations", tabindex: "-1"
      });
      subnavNext = el("button", {
        type: "button", class: "u-scroller-arrow next", text: "›",
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
    { section: "governor", label: "Governor", glyph: "守", hint: "Status, rewards and your avatar" },
    { section: "assistant", label: "Assistant", glyph: "助", hint: "Open the Kurenai Assistant workspace" },
    { section: "system", label: "Archive", glyph: "蔵", hint: "Backup, restore and help" }
  ].map(function (item) {
    item.button = rail.querySelector('[data-section="' + item.section + '"]');
    return item;
  });
  var productivityLabel = rail.querySelector('[data-section="productivity"] .lbl');
  var activeMoreOverlay = null;

  var moreButton = el("button", {
    id: "mobile-more",
    type: "button",
    class: "mobile-more",
    "aria-label": "More destinations",
    "aria-haspopup": "dialog",
    "aria-expanded": "false"
  }, [
    el("span", { class: "glyph", "aria-hidden": "true", text: "余" }),
    el("span", { class: "lbl", text: "More" })
  ]);
  rail.insertBefore(moreButton, rail.querySelector(".rail-foot"));

  function updateMoreState() {
    var active = hiddenRail.some(function (item) {
      return item.button && item.button.classList.contains("active");
    });
    moreButton.classList.toggle("active", active);
    if (active) moreButton.setAttribute("aria-current", "page");
    else moreButton.removeAttribute("aria-current");
  }

  function openMore() {
    if (!phone.matches || activeMoreOverlay) return;
    var first = null;
    var list = el("div", { class: "mobile-sheet-list" });
    hiddenRail.forEach(function (item) {
      if (!item.button) return;
      var current = item.button.classList.contains("active");
      var destinationAttrs = {
        type: "button",
        class: "mobile-sheet-destination" + (current ? " is-current" : ""),
        onclick: function () {
          activeMoreOverlay.close();
          item.button.click();
        }
      };
      if (current) destinationAttrs["aria-current"] = "page";
      var destination = el("button", destinationAttrs, [
        el("span", { class: "mobile-sheet-glyph", "aria-hidden": "true", text: item.glyph }),
        el("span", { class: "mobile-sheet-copy" }, [
          el("b", { text: item.label }),
          el("span", { text: item.hint })
        ]),
        current ? el("span", { class: "mobile-sheet-current", text: "Current" }) : null
      ].filter(Boolean));
      if (!first || current) first = destination;
      list.appendChild(destination);
    });
    var close = el("button", { type: "button", class: "mini-btn mobile-sheet-close", text: "Close" });
    var box = el("section", { class: "modal mobile-nav-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "mobile-sheet-head" }, [
        el("div", {}, [el("span", { class: "eyebrow", text: "Navigate" }), el("h2", { text: "More destinations" })]),
        close
      ]),
      list
    ]);
    var overlay = overlayFor(box, "mobile-more-overlay");
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
    if (item.button) railObserver.observe(item.button, { attributes: true, attributeFilter: ["class"] });
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
    class: "mobile-search-trigger",
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
      searchResults.classList.remove("open");
    }
  }

  function openSearch() {
    if (!phone.matches) return false;
    if (activeSearchOverlay) { searchInput.focus(); return true; }
    var close = el("button", { type: "button", class: "mini-btn mobile-sheet-close", text: "Close" });
    var slot = el("div", { class: "mobile-search-slot" });
    slot.appendChild(searchbox);
    var box = el("section", { class: "modal mobile-search-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "mobile-sheet-head" }, [
        el("div", {}, [el("span", { class: "eyebrow", text: "Find a topic" }), el("h2", { text: "Search" })]),
        close
      ]),
      slot
    ]);
    var overlay = overlayFor(box, "mobile-search-overlay");
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
  searchResults.addEventListener("click", function (event) {
    /* Close before hub.js activates the result. This lets the canonical
       navigation path choose the post-route focus instead of a delayed
       dialog teardown restoring the old trigger over it. */
    if (activeSearchOverlay && event.target.closest(".sr-item")) activeSearchOverlay.close();
  }, true);
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && searchResults.querySelector(".sr-item.sel") && activeSearchOverlay) {
      activeSearchOverlay.close();
    }
  }, true);
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
    var close = el("button", { type: "button", class: "mini-btn mobile-sheet-close", text: "Close" });
    var slot = el("div", { class: "mobile-sheet-slot " + opts.slotClass });
    slot.appendChild(node);
    var box = el("section", { class: "modal mobile-compact-sheet", "data-dialog-box": "true" }, [
      el("div", { class: "mobile-sheet-head" }, [
        el("div", {}, [el("span", { class: "eyebrow", text: opts.eyebrow }), el("h2", { text: opts.title })]),
        close
      ]),
      slot
    ]);
    var overlay = overlayFor(box, "mobile-compact-overlay");
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
      }
    });
  }

  function enhanceReminderDisclosure(grid) {
    if (grid.dataset.compactDisclosure) return;
    var side = grid.querySelector(":scope > .rem-side");
    if (!side) return;
    grid.dataset.compactDisclosure = "true";
    var trigger = el("button", {
      type: "button",
      class: "btn mobile-disclosure-trigger reminders-disclosure-trigger",
      text: "☷ Browse sections, lists & tags",
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
      onclick: function () {
        openMovedSheet({ node: side, trigger: trigger, eyebrow: "Reminders", title: "Browse reminders", slotClass: "reminder-sheet-slot" });
      }
    });
    grid.parentNode.insertBefore(trigger, grid);
  }

  function enhanceVaultDisclosure(layout) {
    if (layout.dataset.compactDisclosure) return;
    var side = layout.querySelector(":scope > .med-filter-rail");
    var mainCol = layout.querySelector(":scope > .med-main");
    if (!side || !mainCol) return;
    layout.dataset.compactDisclosure = "true";
    var trigger = el("button", {
      type: "button",
      class: "btn mobile-disclosure-trigger vault-disclosure-trigger",
      text: "☷ Status & lists",
      "aria-haspopup": "dialog",
      "aria-expanded": "false",
      onclick: function () {
        openMovedSheet({ node: side, trigger: trigger, eyebrow: "Vault filters", title: "Status & custom lists", slotClass: "vault-sheet-slot" });
      }
    });
    mainCol.insertBefore(trigger, mainCol.firstChild);
  }

  function enhanceCompactSurfaces() {
    if (activeCompactSheet && !activeCompactSheet.origin.isConnected) activeCompactSheet.overlay.close();
    main.querySelectorAll(".rem-grid").forEach(enhanceReminderDisclosure);
    main.querySelectorAll(".med-layout").forEach(enhanceVaultDisclosure);
  }
  var mainObserver = new MutationObserver(enhanceCompactSurfaces);
  mainObserver.observe(main, { childList: true, subtree: true });

  function syncShell() {
    var phoneChanged = lastPhoneMatch !== phone.matches;
    lastPhoneMatch = phone.matches;
    if (productivityLabel) productivityLabel.textContent = phone.matches ? "Focus" : "Productivity";
    if (!phone.matches) {
      if (activeMoreOverlay) activeMoreOverlay.close();
      if (activeSearchOverlay) activeSearchOverlay.close();
      restoreSearchbox();
    }
    if (!compact.matches && activeCompactSheet) activeCompactSheet.overlay.close();
    enhanceSubnav();
    enhanceCompactSurfaces();
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
    dialogObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }

  listenMedia(phone, syncShell);
  listenMedia(compact, syncShell);
  syncShell();
  /* CSS hides canonical compact side rails only after every enhancement
     above has mounted successfully. A missing/failed module therefore
     leaves the original filters visible and usable. */
  document.body.classList.add("mobile-shell-ready");
})();
