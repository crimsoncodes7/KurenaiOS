/* Kurenai OS — modules/notifications.js
   The notification centre's two surfaces over core/notify.js:
   - the BELL in the global header: a KOS.ui.menu popover with the five
     most recent items, Mark as read, and the way through to the page;
   - the PAGE, under Archive: the whole feed grouped by day, filtered by
     section, with the device-alert opt-in and the housekeeping actions.
   Both read the same ledger and repaint on KOS.notify.onChange, so a
   reminder read in the popover is read on the page and on every synced
   device. Presentation only — nothing here decides what is due.

   Graphite step 8 (frames 14b, 14b2). The frame's per-type toggles and
   quiet hours have no counterpart in notify.js — every kind that lands
   here is one the user already asked for on its own record (invariant 95)
   — so the side column says what lands here instead of offering switches
   that would switch nothing. Governor events are not notifications. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  /* the section a kind belongs to, marked like the main rail */
  var SECTION_MARK = { study: "学", productivity: "整", collection: "蒐" };
  var KIND_MARK = { wishlist: "円" };
  var KIND_TONE = { calendar: "amber", reminder: "amber", pacing: "amber", assignment: "teal", airing: "anime", wishlist: "books" };
  var SECTION_LABEL = { study: "Study", productivity: "Productivity", collection: "Collection" };

  function clock(ts) {
    return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  /* ---------------- shared row ---------------- */
  function kindMark(item) {
    var k = KOS.notify.KINDS[item.kind] || {};
    if (item.cover) {
      return el("span", { class: "k-nt-mark", "data-tone": KIND_TONE[item.kind] || null }, [el("img", { src: item.cover, alt: "", loading: "lazy" })]);
    }
    return el("span", { class: "k-nt-mark", "data-tone": KIND_TONE[item.kind] || null, lang: "ja", "aria-hidden": "true",
      text: KIND_MARK[item.kind] || SECTION_MARK[k.section] || "•" });
  }
  function row(item, opts) {
    opts = opts || {};
    var unread = !KOS.notify.isRead(item);
    var k = KOS.notify.KINDS[item.kind] || {};
    var node = el("button", { type: "button", class: "k-nt-row", "data-ui": "notify.row",
      "aria-label": item.title + (unread ? " (unread)" : ""),
      onclick: function () { if (opts.before) opts.before(); KOS.notify.open(item); } }, [
      kindMark(item),
      el("span", { class: "k-nt-txt" }, [
        el("span", { class: "k-nt-title", text: item.title }),
        el("span", { class: "k-nt-meta", text: [item.body, k.label].filter(Boolean).join(" · ") })
      ]),
      el("span", { class: "k-nt-when" }, [
        el("time", { datetime: new Date(item.ts).toISOString(), title: KOS.notify.ago(item.ts),
          text: opts.compact ? KOS.notify.ago(item.ts) : clock(item.ts) }),
        unread ? el("span", { class: "k-nt-dot", "aria-hidden": "true" }) : null
      ].filter(Boolean))
    ]);
    if (unread) KOS.ui.state(node, "is-unread", true);
    if (opts.compact) node.setAttribute("data-size", "compact");
    return node;
  }

  /* ---------------- the bell (frame 14b2) ---------------- */
  function mountBell() {
    var mount = document.getElementById("notify-mount");
    if (!mount || mount.firstChild) return;
    var bell = KOS.ui.menu({ label: "Notifications", className: "k-iconbtn", panelClass: "k-nt-pop",
      hint: "Notifications", align: "end",
      render: function (panel, close) {
        panel.setAttribute("data-ui", (panel.getAttribute("data-ui") || "") + " notify.panel");
        var items = KOS.notify.all().slice(0, 5);
        var unread = KOS.notify.unread();
        panel.appendChild(el("div", { class: "k-nt-pop-head" }, [
          el("b", { text: "Notifications" }),
          unread ? el("span", { class: "k-chip", "data-tone": "crimson", text: unread + " new" }) : null,
          unread ? el("button", { type: "button", class: "k-link k-nt-pop-mark", text: "✓ Mark all as read",
            onclick: function () { KOS.notify.markAllRead(); close(); } }) : null
        ].filter(Boolean)));
        if (!items.length) {
          panel.appendChild(el("p", { class: "k-nt-pop-empty", text: "Nothing yet. Reminders, deadlines, airing episodes and release days land here." }));
        } else {
          var list = el("div", { class: "k-nt-pop-list" });
          items.forEach(function (it) { list.appendChild(row(it, { compact: true, before: close })); });
          panel.appendChild(list);
        }
        panel.appendChild(el("button", { type: "button", class: "k-nt-pop-all", text: "View all notifications →",
          onclick: function () { close(); KOS.show("notifications"); } }));
      } });
    /* an icon button: the primitive's label becomes the accessible name,
       the bell glyph is drawn, and the unread count rides a badge */
    bell.setAttribute("aria-label", "Notifications");
    bell.querySelector("[data-ui~='ui.menu-label']").classList.add("sr-only");
    bell.querySelector("[data-ui~='ui.menu-caret']").remove();
    bell.setAttribute("data-ui", (bell.getAttribute("data-ui") || "") + " notify.bell");
    bell.insertBefore(el("span", { class: "k-bell-glyph", "aria-hidden": "true" }, [
      (function () {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "17"); svg.setAttribute("height", "17");
        var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", "M12 3a6 6 0 0 0-6 6v3.2c0 .6-.2 1.2-.6 1.7L4 16h16l-1.4-2.1a3 3 0 0 1-.6-1.7V9a6 6 0 0 0-6-6zm-2.5 15a2.5 2.5 0 0 0 5 0h-5z");
        p.setAttribute("fill", "currentColor");
        svg.appendChild(p);
        return svg;
      })()
    ]), bell.firstChild);
    var badge = el("span", { class: "k-dot k-bell-badge", "data-ui": "notify.badge", "aria-hidden": "true" });
    bell.appendChild(badge);
    function paint() {
      var n = KOS.notify.unread();
      badge.textContent = n > 9 ? "9+" : String(n);
      KOS.ui.state(badge, "is-on", n > 0);
      bell.setAttribute("aria-label", n ? "Notifications, " + n + " unread" : "Notifications");
    }
    KOS.notify.onChange(paint);
    paint();
    mount.appendChild(bell);
  }

  /* ---------------- the page (frame 14b) ---------------- */
  var FILTERS = [["all", "All"], ["unread", "Unread"], ["study", "Study"], ["productivity", "Productivity"], ["collection", "Collection"]];
  function matches(filter, it) {
    if (filter === "all") return true;
    if (filter === "unread") return !KOS.notify.isRead(it);
    return (KOS.notify.KINDS[it.kind] || {}).section === filter;
  }
  KOS.views.notifications = function (main, arg) {
    KOS.shell.tree("none");
    var filter = arg && typeof arg === "string" && FILTERS.some(function (f) { return f[0] === arg; }) ? arg : "all";

    var markAll = el("button", { type: "button", class: "k-btn", text: "✓ Mark all as read", onclick: function () { KOS.notify.markAllRead(); } });
    main.appendChild(KOS.ui.pageHeader({
      kicker: "The archive · 通",
      title: "Notifications",
      sub: "Everything the app would have tapped you on the shoulder for. Reading one here reads it on every device.",
      actions: [markAll]
    }));

    var feed = el("div", { class: "k-nt-feed" });
    var side = el("aside", { class: "k-nt-side", "aria-label": "Alerts" });
    main.appendChild(el("div", { class: "k-nt", "data-ui": "notify.page" }, [feed, side]));

    /* filter tabs + the list */
    var tabWrap = el("div", { class: "k-nt-tabs" });
    var list = el("div", { class: "k-nt-list", "data-ui": "notify.list" });
    feed.appendChild(tabWrap);
    feed.appendChild(list);
    function buildTabs() {
      var items = KOS.notify.all();
      return KOS.ui.tabs(FILTERS.map(function (f) {
        var n = items.filter(function (it) { return matches(f[0], it); }).length;
        return { label: f[1], count: n || null, countTone: f[0] === "unread" ? null : "neutral", active: filter === f[0], onSelect: function () {
          if (filter === f[0]) return;
          filter = f[0];
          paintTabs();
          paintList();
        } };
      }), { variant: "workspace", label: "Notification filters", className: "k-nt-tablist" });
    }
    function paintTabs() {
      tabWrap.innerHTML = "";
      var tabs = buildTabs();
      tabs.setAttribute("data-ui", (tabs.getAttribute("data-ui") || "") + " notify.tabs");
      tabWrap.appendChild(tabs);
    }
    function dayLabel(d) {
      var key = d.toDateString(), today = new Date(), y = new Date(); y.setDate(y.getDate() - 1);
      if (key === today.toDateString()) return "Today";
      if (key === y.toDateString()) return "Yesterday";
      return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    }
    function paintList() {
      list.innerHTML = "";
      var items = KOS.notify.all().filter(function (it) { return matches(filter, it); });
      markAll.disabled = !KOS.notify.unread();
      if (!items.length) {
        list.appendChild(KOS.ui.emptyState({
          compact: true, mark: "通",
          title: filter === "all" ? "Nothing yet" : filter === "unread" ? "All caught up" : "Nothing in " + SECTION_LABEL[filter].toLowerCase(),
          body: "Calendar and assignment alerts, reminders, an episode airing for a title you're watching and a Planner release day all land here as they happen."
        }));
        return;
      }
      /* grouped by day, newest first */
      var groups = [], byKey = {};
      items.forEach(function (it) {
        var d = new Date(it.ts), key = d.toDateString();
        if (!byKey[key]) { byKey[key] = { label: dayLabel(d), rows: el("div", { class: "k-nt-day-rows" }) }; groups.push(byKey[key]); }
        byKey[key].rows.appendChild(row(it));
      });
      groups.forEach(function (g) {
        list.appendChild(el("h3", { class: "k-nt-day", "data-ui": "notify.day", text: g.label }));
        list.appendChild(g.rows);
      });
    }

    /* device alerts: the per-device opt-in, stated honestly */
    var nat = KOS.notify.native;
    var device = el("section", { class: "k-card k-nt-card", "aria-label": "Device alerts" });
    function paintDevice() {
      device.innerHTML = "";
      var perm = nat.permission(), on = nat.enabled();
      var what = /iPhone|iPad|Android/i.test(navigator.userAgent) ? "phone" : "computer";
      device.appendChild(el("div", { class: "k-card-title", text: "Device alerts" }));
      device.appendChild(el("p", { class: "k-nt-card-p", text: perm === "unsupported" ? "This browser cannot show device notifications."
        : perm === "denied" ? "Notifications are blocked for this site in the browser. Allow them in the site settings to turn device alerts on."
        : "A system notification on this " + what + " when something new lands here, while Kurenai is open in a tab or installed as an app. There is no push server, so a closed app stays quiet." }));
      var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "notify.device-toggle",
        "aria-label": "Device alerts on this " + what });
      sw.checked = on;
      sw.disabled = perm === "unsupported" || perm === "denied";
      sw.addEventListener("change", function () {
        if (!sw.checked) { nat.setEnabled(false); return; }
        if (perm === "granted") { nat.setEnabled(true); return; }
        nat.request(function (ok) {
          if (!ok) { KOS.ui.toast("Notifications were not allowed.", true); sw.checked = false; }
        });
      });
      device.appendChild(el("label", { class: "k-nt-switch-row" }, [el("span", { text: "This " + what }), sw]));
    }
    var lands = el("section", { class: "k-card k-nt-card", "aria-label": "What lands here" });
    function paintLands() {
      lands.innerHTML = "";
      var items = KOS.notify.all(), K = KOS.notify.KINDS;
      lands.appendChild(el("div", { class: "k-card-title", text: "What lands here" }));
      lands.appendChild(el("p", { class: "k-nt-card-p", text: "Each alert is set on its own record: the event, the reminder, the assignment, the title you're watching." }));
      Object.keys(K).forEach(function (kind) {
        var n = items.filter(function (it) { return it.kind === kind; }).length;
        lands.appendChild(el("div", { class: "k-card-row" }, [
          el("span", { class: "k-card-row-k", text: K[kind].label }),
          el("span", { class: "k-card-row-v k-mono", text: n ? String(n) : "" })
        ]));
      });
    }
    side.appendChild(device);
    side.appendChild(lands);
    side.appendChild(el("button", { type: "button", class: "k-link k-nt-clear", text: "Clear the feed…", onclick: function () {
      KOS.ui.confirm({ title: "Clear every notification?", danger: true, confirm: "Clear",
        body: "The feed empties on every synced device. Nothing else changes: reminders, events and assignments stay exactly as they are." },
        function () { KOS.notify.clear(); });
    } }));

    paintTabs();
    paintList();
    paintDevice();
    paintLands();

    /* repaint while mounted; the listener unhooks itself once the view is
       gone, so a hundred visits do not leave a hundred listeners */
    var off = KOS.notify.onChange(function () {
      if (!document.body.contains(list)) { off(); return; }
      paintTabs(); paintList(); paintDevice(); paintLands();
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountBell);
  else mountBell();
})();
