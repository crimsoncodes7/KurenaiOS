/* Kurenai OS — modules/notifications.js
   The notification centre's two surfaces over core/notify.js:
   - the BELL in the global header: a KOS.ui.menu popover with the five
     most recent items, Mark as read, and the way through to the page;
   - the PAGE, under Archive: the whole feed grouped by day, filtered by
     section, with the device-alert opt-in and the housekeeping actions.
   Both read the same ledger and repaint on KOS.notify.onChange, so a
   reminder read in the popover is read on the page and on every synced
   device. Presentation only — nothing here decides what is due.

   Graphite step 8 (frames 14b, 14b2); review B brought the frame's side
   column back: Notification filters (a filtered kind leaves the feed, the
   bell and device alerts but stays in the ledger) and Quiet hours on the
   device-alert card (they hold device alerts only). Governor events are
   not notifications. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  /* the section a kind belongs to, marked like the main rail */
  var SECTION_MARK = { study: "学", productivity: "整", collection: "蒐", assistant: "助", reports: "録", governor: "守" };
  var KIND_MARK = { wishlist: "願", focus: "集", goal: "標", money: "円", achievement: "章" };
  var KIND_TONE = { calendar: "amber", reminder: "amber", pacing: "amber", assignment: "teal", airing: "anime", wishlist: "books", focus: "amber", reports: "teal", goal: "teal", money: "amber", achievement: "amber" };
  var SECTION_LABEL = { study: "Study", productivity: "Productivity", collection: "Collection", assistant: "Assistant", reports: "Reports", governor: "Badges" };

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
        /* the bell is an inbox: read items leave it (they stay in the
           full feed under Archive) — review A */
        var items = KOS.notify.all().filter(function (it) { return !KOS.notify.isRead(it); }).slice(0, 5);
        var unread = KOS.notify.unread();
        panel.appendChild(el("div", { class: "k-nt-pop-head" }, [
          el("b", { text: "Notifications" }),
          unread ? el("span", { class: "k-chip", "data-tone": "crimson", text: unread + " new" }) : null,
          unread ? el("button", { type: "button", class: "k-link k-nt-pop-mark", text: "✓ Mark all as read",
            onclick: function () { KOS.notify.markAllRead(); close(); } }) : null
        ].filter(Boolean)));
        if (!items.length) {
          panel.appendChild(el("p", { class: "k-nt-pop-empty", text: KOS.notify.all().length ? "You're all caught up." : "Nothing yet." }));
        } else {
          var list = el("div", { class: "k-nt-pop-list" });
          items.forEach(function (it) { list.appendChild(row(it, { compact: true, before: close })); });
          panel.appendChild(list);
        }
        /* Exam season's "Quiet the rest" (5.8): a quiet line says how many
           notices from outside study are waiting */
        var waiting = KOS.notify.held ? KOS.notify.held() : 0;
        if (waiting) panel.appendChild(el("p", { class: "k-nt-pop-empty", "data-ui": "notify.held", text: "Exam season · " + waiting + (waiting === 1 ? " notice waits" : " notices wait") + " until it ends." }));
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
  /* frame 16k: the Focus kind has its own chip, between Productivity and
     Collection */
  var FILTERS = [["all", "All"], ["unread", "Unread"], ["study", "Study"], ["exam", "Exams"], ["productivity", "Productivity"], ["focus", "Focus"], ["goal", "Goals"], ["money", "Money"], ["collection", "Collection"], ["assistant", "Assistant"], ["reports", "Reports"], ["achievement", "Badges"]];
  function matches(filter, it) {
    if (filter === "all") return true;
    if (filter === "unread") return !KOS.notify.isRead(it);
    if (filter === "focus" || filter === "goal" || filter === "money" || filter === "exam" || filter === "achievement") return it.kind === filter;
    return (KOS.notify.KINDS[it.kind] || {}).section === filter;
  }
  KOS.views.notifications = function (main, arg) {
    KOS.shell.tree("none");
    var filter = arg && typeof arg === "string" && FILTERS.some(function (f) { return f[0] === arg; }) ? arg : "all";

    /* 15m: on a phone Mark all as read is the ✓ beside the title, and the
       alert settings wait in the title bar's ⋯ */
    var markAll = el("button", { type: "button", class: "k-btn", "data-phone-action": "", title: "Mark all as read", onclick: function () { KOS.notify.markAllRead(); } },
      [el("span", { "aria-hidden": "true", text: "✓" }), el("span", { class: "k-btn-label", text: " Mark all as read" })]);
    main.appendChild(KOS.ui.pageHeader({
      kicker: "The archive · 通",
      title: "Notifications",
      sub: "Everything the app would have tapped you on the shoulder for. Reading one here reads it on every device.",
      actions: [markAll]
    }));

    var feed = el("div", { class: "k-nt-feed" });
    var side = el("aside", { class: "k-nt-side", "aria-label": "Alerts", "data-phone-more": "" });
    main.appendChild(el("div", { class: "k-nt", "data-ui": "notify.page" }, [feed, side]));

    /* filter tabs + the list */
    var tabWrap = el("div", { class: "k-nt-tabs" });
    var list = el("div", { class: "k-nt-list", "data-ui": "notify.list" });
    feed.appendChild(tabWrap);
    feed.appendChild(list);
    function buildTabs() {
      var items = KOS.notify.all();
      return KOS.ui.tabs(FILTERS.filter(function (f) {
        /* no assessments and no exam notice: no Exams chip (29w) */
        /* Badges, like Exams, only once there is one to show */
        if (f[0] === "achievement") return filter === "achievement" || items.some(function (it) { return it.kind === "achievement"; });
        return f[0] !== "exam" || filter === "exam" || items.some(function (it) { return it.kind === "exam"; }) || (KOS.exams && KOS.exams.all().length);
      }).map(function (f) {
        var n = items.filter(function (it) { return matches(f[0], it); }).length;
        return { label: f[1], count: n || null, countTone: f[0] === "unread" ? null : "neutral", active: filter === f[0], onSelect: function () {
          if (filter === f[0]) return;
          filter = f[0];
          paintTabs();
          paintList();
        } };
      }), { variant: "workspace", label: "Notification filters", className: "k-nt-tablist", edge: true });
    }
    function paintTabs() {
      tabWrap.innerHTML = "";
      /* an edge track: nine filters outrun an iPad in portrait */
      var tabs = buildTabs(), strip = tabs.querySelector("[role='tablist']") || tabs;
      strip.setAttribute("data-ui", (strip.getAttribute("data-ui") || "") + " notify.tabs");
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
          title: filter === "all" ? "Nothing yet" : filter === "unread" ? "All caught up" : "Nothing in " + (SECTION_LABEL[filter] || filter).toLowerCase(),
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
      var what = KOS.ui.device().name;
      device.appendChild(el("div", { class: "k-card-title", text: "Device alerts" }));
      /* one line (review A); invariant 98: these fire while the page is
         open — the card below is the closed-app path */
      device.appendChild(el("p", { class: "k-nt-card-p", text: perm === "unsupported" ? "Not supported in this browser."
        : perm === "denied" ? "Blocked in this site's browser settings."
        : "While Kurenai is open." }));
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
      /* quiet hours: a switch, then the window it keeps */
      var q = KOS.notify.quiet();
      var qsw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "notify.quiet-toggle", "aria-label": "Quiet hours" });
      qsw.checked = q.on;
      qsw.addEventListener("change", function () { KOS.notify.setQuiet({ on: qsw.checked }); });
      function time(key, label) {
        var t = el("input", { type: "time", class: "k-input k-nt-time", "data-ui": "notify.quiet-" + key, "aria-label": label });
        t.value = q[key];
        t.disabled = !q.on;
        t.addEventListener("change", function () { if (t.value) { var p = {}; p[key] = t.value; KOS.notify.setQuiet(p); } });
        return t;
      }
      device.appendChild(el("label", { class: "k-nt-switch-row" }, [el("span", { text: "Quiet hours" }), qsw]));
      device.appendChild(el("div", { class: "k-nt-quiet", "data-state": q.on ? null : "off" }, [
        time("from", "Quiet hours start"), el("span", { class: "k-muted", text: "to" }), time("to", "Quiet hours end")
      ]));
    }
    /* closed-app delivery (roadmap 5.7, docs/server-runner-plan.md): the
       device publishes its outlook and the runner pushes it while no
       device is open. This device's switch is its subscription; the
       schedules switch is the account's (synced). */
    var closed = el("section", { class: "k-card k-nt-card", "aria-label": "When the app is closed", "data-ui": "notify.closed" });
    function paintClosed() {
      closed.innerHTML = "";
      if (!KOS.push) return;
      var P = KOS.push, why = P.blocked(), c = P.config();
      var dev = KOS.ui.device(), what = dev.name, ios = dev.ios;
      closed.appendChild(el("div", { class: "k-card-title", text: "When the app is closed" }));
      closed.appendChild(el("p", { class: "k-nt-card-p", "data-ui": "notify.closed-why", text:
        why === "unconfigured" ? "Not set up on this server yet."
        : why === "signed-out" ? "Sign in to cloud sync to use it."
        : why === "review" ? "Off while you look at the empty or sample app."
        : why === "unsupported" ? (ios ? "On " + what + ", add Kurenai to the Home Screen first." : "This browser cannot receive push.")
        : "Alerts for the next 7 days reach you as notifications. They wait while Kurenai is open." }));
      var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "notify.closed-toggle",
        "aria-label": "Notifications on this " + what + " when the app is closed" });
      sw.disabled = !!why;
      P.subscribed(function (on) { sw.checked = on; });
      sw.addEventListener("change", function () {
        sw.disabled = true;
        (sw.checked ? P.subscribe : P.unsubscribe)(function (err) {
          sw.disabled = false;
          if (err) {
            sw.checked = !sw.checked;
            KOS.ui.toast(err.message === "permission" ? "Notifications were not allowed." : "That didn't work — " + err.message, true);
            return;
          }
          KOS.a11y.announce(sw.checked ? "This " + what + " will get notifications when Kurenai is closed." : "This " + what + " won't get them any more.");
          paintClosed();
        });
      });
      closed.appendChild(el("label", { class: "k-nt-switch-row" }, [el("span", { text: "This " + what }), sw]));
      var runs = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "notify.server-runs",
        "aria-label": "Scheduled messages sent from the server" });
      runs.checked = !!(c.on && c.serverRuns);
      runs.disabled = !!why || !c.on;
      runs.addEventListener("change", function () { P.setServerRuns(runs.checked); paintClosed(); });
      closed.appendChild(el("label", { class: "k-nt-switch-row" }, [el("span", { text: "Scheduled messages from the server" }), runs]));
      if (c.on && !why) {
        closed.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "notify.closed-test", text: "Send a test", onclick: function () {
          P.test(function (err, r) {
            if (err || !r || !r.published) { KOS.ui.toast("The test couldn't be sent — " + (err ? err.message : "sync is off."), true); return; }
            KOS.ui.toast("A test is on its way to every device switched on here. It arrives within five minutes.");
          });
        } }));
        closed.appendChild(el("button", { type: "button", class: "k-link", "data-ui": "notify.closed-off", text: "Turn off on every device…", onclick: function () {
          KOS.ui.confirm({ title: "Turn off closed-app notifications?", confirm: "Turn off",
            body: "The server stops sending them to every device, and scheduled messages run in the app again." },
            function () { P.turnOff(function () { paintClosed(); }); });
        } }));
      }
    }
    /* the frame's filters: one switch per kind */
    var FILTER_LABEL = { calendar: "Calendar", reminder: "Reminders", assignment: "Assignments", airing: "Airing episodes", wishlist: "Release days", pacing: "Weekly plan", focus: "Focus idle watch", exam: "Exams: start-by, milestones, tests", achievement: "Badges earned" };
    var lands = el("section", { class: "k-card k-nt-card", "aria-label": "Notification filters", "data-ui": "notify.filters" });
    function paintLands() {
      lands.innerHTML = "";
      var K = KOS.notify.KINDS;
      lands.appendChild(el("div", { class: "k-card-title", text: "Notification filters" }));
      Object.keys(K).forEach(function (kind) {
        var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "notify.filter", "data-kind": kind,
          "aria-label": (FILTER_LABEL[kind] || K[kind].label) + " notifications" });
        sw.checked = !KOS.notify.isMuted(kind);
        sw.addEventListener("change", function () { KOS.notify.setMuted(kind, !sw.checked); });
        lands.appendChild(el("label", { class: "k-nt-switch-row" }, [el("span", { text: FILTER_LABEL[kind] || K[kind].label }), sw]));
      });
    }
    side.appendChild(device);
    side.appendChild(closed);
    side.appendChild(lands);
    side.appendChild(el("button", { type: "button", class: "k-link k-nt-clear", text: "Clear the feed…", onclick: function () {
      KOS.ui.confirm({ title: "Clear every notification?", danger: true, confirm: "Clear",
        body: "The feed empties on every synced device. Nothing else changes: reminders, events and assignments stay exactly as they are." },
        function () { KOS.notify.clear(); });
    } }));

    paintTabs();
    paintList();
    paintDevice();
    paintClosed();
    paintLands();
    /* js/env.local.js is deferred: a first draw during boot runs before it,
       so the closed-app card reads the VAPID key again once it has loaded */
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paintClosed, { once: true });

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
