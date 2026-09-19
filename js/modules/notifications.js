/* Kurenai OS — modules/notifications.js
   The notification centre's two surfaces over core/notify.js:
   - the BELL in the global header: a KOS.ui.menu popover with the five
     most recent items, Mark as read, and the way through to the page;
   - the PAGE, under Archive: the whole feed, filtered by section, with the
     device-alert opt-in and the housekeeping actions.
   Both read the same ledger and repaint on KOS.notify.onChange, so a
   reminder read in the popover is read on the page and on every synced
   device. Presentation only — nothing here decides what is due.         */
(function () {
  "use strict";
  var el = KOS.ui.el;

  /* ---------------- shared row ---------------- */
  function kindMark(item) {
    var k = KOS.notify.KINDS[item.kind] || {};
    if (item.cover) {
      return el("span", { class: "nt-cover" }, [el("img", { src: item.cover, alt: "", loading: "lazy" })]);
    }
    return el("span", { class: "nt-glyph nt-k-" + item.kind, "aria-hidden": "true", text: k.glyph || "•" });
  }
  function row(item, opts) {
    opts = opts || {};
    var unread = !KOS.notify.isRead(item);
    var node = el("button", { type: "button", class: "nt-row" + (unread ? " is-unread" : "") + (opts.compact ? " is-compact" : ""),
      "aria-label": item.title + (unread ? " (unread)" : ""),
      onclick: function () { if (opts.before) opts.before(); KOS.notify.open(item); } }, [
      kindMark(item),
      el("span", { class: "nt-body" }, [
        el("span", { class: "nt-title", text: item.title }),
        el("span", { class: "nt-meta" }, [
          item.body ? el("span", { class: "nt-line", text: item.body }) : null,
          el("span", { class: "nt-ago", text: KOS.notify.ago(item.ts) })
        ].filter(Boolean))
      ]),
      unread ? el("span", { class: "nt-dot", "aria-hidden": "true" }) : null
    ].filter(Boolean));
    return node;
  }

  /* ---------------- the bell ---------------- */
  function mountBell() {
    var mount = document.getElementById("notify-mount");
    if (!mount || mount.firstChild) return;
    var bell = KOS.ui.menu({ label: "Notifications", className: "notify-bell", panelClass: "notify-panel",
      hint: "Notifications", align: "end",
      render: function (panel, close) {
        var items = KOS.notify.all().slice(0, 5);
        var unread = KOS.notify.unread();
        panel.appendChild(el("div", { class: "nt-pop-h" }, [
          el("b", { text: "Notifications" }),
          unread ? el("button", { type: "button", class: "nt-link", text: "✓ Mark as read",
            onclick: function () { KOS.notify.markAllRead(); close(); } }) : null
        ].filter(Boolean)));
        if (!items.length) {
          panel.appendChild(el("p", { class: "sub nt-pop-empty", text: "Nothing yet — reminders, deadlines, airing episodes and release days land here." }));
        } else {
          var list = el("div", { class: "nt-pop-list" });
          items.forEach(function (it) { list.appendChild(row(it, { compact: true, before: close })); });
          panel.appendChild(list);
        }
        panel.appendChild(el("button", { type: "button", class: "nt-pop-all", text: "View all notifications",
          onclick: function () { close(); KOS.show("notifications"); } }));
      } });
    /* an icon button: the primitive's label becomes the accessible name,
       the bell glyph is drawn, and the unread count rides a badge */
    bell.setAttribute("aria-label", "Notifications");
    bell.querySelector(".menu-btn-lbl").classList.add("sr-only");
    bell.querySelector(".menu-btn-caret").remove();
    bell.insertBefore(el("span", { class: "notify-bell-glyph", "aria-hidden": "true" }, [
      (function () {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", "18"); svg.setAttribute("height", "18");
        var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", "M12 3a6 6 0 0 0-6 6v3.2c0 .6-.2 1.2-.6 1.7L4 16h16l-1.4-2.1a3 3 0 0 1-.6-1.7V9a6 6 0 0 0-6-6zm-2.5 15a2.5 2.5 0 0 0 5 0h-5z");
        p.setAttribute("fill", "currentColor");
        svg.appendChild(p);
        return svg;
      })()
    ]), bell.firstChild);
    var badge = el("span", { class: "notify-badge", "aria-hidden": "true" });
    bell.appendChild(badge);
    function paint() {
      var n = KOS.notify.unread();
      badge.textContent = n > 9 ? "9+" : String(n);
      badge.classList.toggle("is-on", n > 0);
      bell.setAttribute("aria-label", n ? "Notifications, " + n + " unread" : "Notifications");
    }
    KOS.notify.onChange(paint);
    paint();
    mount.appendChild(bell);
  }

  /* ---------------- the page ---------------- */
  var FILTERS = [["all", "All"], ["study", "Study"], ["productivity", "Productivity"], ["collection", "Collection"]];
  KOS.views.notifications = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var filter = arg && typeof arg === "string" && FILTERS.some(function (f) { return f[0] === arg; }) ? arg : "all";

    var markAll = el("button", { class: "btn", text: "✓ Mark all as read", onclick: function () { KOS.notify.markAllRead(); } });
    main.appendChild(KOS.ui.pageHeader({
      kicker: "蔵 · Archive",
      title: "Notifications",
      sub: "Everything the app would have tapped you on the shoulder for, in one place.",
      actions: [markAll]
    }));

    /* device alerts: the per-device opt-in, stated honestly */
    var nat = KOS.notify.native;
    var devWrap = el("div", { class: "nt-device" });
    function paintDevice() {
      devWrap.innerHTML = "";
      var perm = nat.permission();
      var on = nat.enabled();
      var body, action = null;
      if (perm === "unsupported") {
        body = "This browser cannot show device notifications.";
      } else if (perm === "denied") {
        body = "Notifications are blocked for this site in the browser — allow them in the site settings to turn device alerts on.";
      } else if (on) {
        body = "Device alerts are on for this " + (/iPhone|iPad|Android/i.test(navigator.userAgent) ? "phone" : "computer") +
          ": a new reminder, deadline, aired episode or release day shows as a system notification while Kurenai is open in a tab or installed as an app.";
        action = el("button", { class: "btn", text: "Turn off", onclick: function () { nat.setEnabled(false); } });
      } else {
        body = "Get a system notification on this device when something new lands here — while Kurenai is open in a tab or installed as an app (there is no push server, so a closed app stays quiet).";
        action = el("button", { class: "btn primary", text: perm === "granted" ? "Turn on" : "Enable device alerts", onclick: function () {
          if (perm === "granted") { nat.setEnabled(true); return; }
          nat.request(function (ok) { if (!ok) KOS.ui.toast("Notifications were not allowed.", true); });
        } });
      }
      devWrap.appendChild(el("div", { class: "nt-device-txt" }, [
        el("b", { text: "Device alerts" }),
        el("p", { class: "sub", text: body })
      ]));
      if (action) devWrap.appendChild(action);
    }
    paintDevice();
    main.appendChild(devWrap);

    /* filter tabs + the list */
    var tabWrap = el("div", { class: "nt-tabs" });
    var list = el("div", { class: "nt-list" });
    function buildTabs() {
      var items = KOS.notify.all();
      return KOS.ui.tabs(FILTERS.map(function (f) {
        var n = f[0] === "all" ? items.length : items.filter(function (it) { return (KOS.notify.KINDS[it.kind] || {}).section === f[0]; }).length;
        return { label: f[1], count: n || null, active: filter === f[0], onSelect: function () {
          if (filter === f[0]) return;
          filter = f[0];
          tabWrap.innerHTML = ""; tabWrap.appendChild(buildTabs());
          paintList();
        } };
      }), { variant: "workspace", label: "Notification filters", className: "nt-tabs-list" });
    }
    function paintList() {
      list.innerHTML = "";
      var items = KOS.notify.all().filter(function (it) {
        return filter === "all" || (KOS.notify.KINDS[it.kind] || {}).section === filter;
      });
      markAll.disabled = !KOS.notify.unread();
      if (!items.length) {
        list.appendChild(KOS.ui.emptyState({
          compact: true, mark: "鈴",
          title: filter === "all" ? "Nothing yet" : "Nothing in " + FILTERS.filter(function (f) { return f[0] === filter; })[0][1].toLowerCase(),
          body: "Calendar and assignment alerts, reminders, an episode airing for a title you're watching and a Planner release day all land here as they happen."
        }));
        return;
      }
      /* grouped by day, newest first */
      var groups = [], byKey = {};
      items.forEach(function (it) {
        var d = new Date(it.ts), key = d.toDateString();
        if (!byKey[key]) {
          var today = new Date(), y = new Date(); y.setDate(y.getDate() - 1);
          var label = key === today.toDateString() ? "Today" : key === y.toDateString() ? "Yesterday"
            : d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
          byKey[key] = { label: label, items: [] }; groups.push(byKey[key]);
        }
        byKey[key].items.push(it);
      });
      groups.forEach(function (g) {
        list.appendChild(el("h3", { class: "nt-day", text: g.label }));
        g.items.forEach(function (it) { list.appendChild(row(it)); });
      });
    }
    tabWrap.appendChild(buildTabs());
    main.appendChild(tabWrap);
    main.appendChild(list);
    main.appendChild(el("div", { class: "nt-foot" }, [
      el("button", { class: "btn subtle", text: "Clear the feed", onclick: function () {
        KOS.ui.confirm({ title: "Clear every notification?", danger: true, confirm: "Clear",
          body: "The feed empties on every synced device. Nothing else changes — reminders, events and assignments stay exactly as they are." },
          function () { KOS.notify.clear(); });
      } })
    ]));
    paintList();

    /* repaint while mounted; the listener unhooks itself once the view is
       gone, so a hundred visits do not leave a hundred listeners */
    var off = KOS.notify.onChange(function () {
      if (!document.body.contains(list)) { off(); return; }
      tabWrap.innerHTML = ""; tabWrap.appendChild(buildTabs());
      paintList(); paintDevice();
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountBell);
  else mountBell();
})();
