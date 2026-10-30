/* Kurenai OS — modules/connections.js · KOS.views.connections
   Archive › Connections (roadmap 5.15, docs/integrations-plan.md §6):
   Google Calendar, Google Tasks and Todoist.

     · Google: connect (one sign-in for Calendar and Tasks), two-way with
       the primary calendar, the one-way "KurenaiOS" calendar and what it
       carries, Google Tasks on or off, Sync now, the last cycle;
     · Todoist: connect, Sync now, the last cycle;
     · Reminders lists: each list (and the reminders with no list) linked
       to one Todoist project or one Google Tasks list, or to nothing.

   The page only READS when drawn (KOS.ext.view, the kv); every change
   is a click.                                                           */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function el() { return KOS.ui.el.apply(null, arguments); }
  function X() { return KOS.ext; }
  function ago(ts) {
    if (!ts) return "";
    var m = Math.round((Date.now() - ts) / 60000);
    return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago";
  }
  function summary(st) {
    if (!st) return "Not synced on this device yet.";
    if (!st.ok) return "Last try " + ago(st.at) + ": " + (st.why || "it didn't finish.");
    var c = st.counts || {}, n = { in: 0, out: 0 };
    Object.keys(c).forEach(function (k) { var x = c[k] || {}; n.in += (x.pulled || 0); n.out += (x.pushed || 0) + (x.created || 0) + (x.deleted || 0) + (x.exported || 0) + (x.unexported || 0); });
    return "Synced " + ago(st.at) + (n.in || n.out ? " · " + [n.in ? n.in + " in" : null, n.out ? n.out + " out" : null].filter(Boolean).join(", ") : " · nothing new");
  }

  KOS.views.connections = function (main) {
    main.appendChild(KOS.ui.pageHeader({ kicker: "Settings · 繋", title: "Connections", sub: "Google Calendar, Google Tasks and Todoist, kept in step with Calendar and Reminders." }));
    var grid = el("div", { class: "k-st-grid", "data-ui": "cx.page" });
    main.appendChild(grid);
    var busy = {};

    function card(title, hook, kids) {
      return el("section", { class: "k-card k-st-card", "data-ui": "cx." + hook, "aria-label": title }, [el("div", { class: "k-card-title", text: title })].concat(kids || []));
    }
    function sw(label, hook, checked, onchange, disabled) {
      var box = el("input", { type: "checkbox", class: "k-switch", "data-ui": "cx." + hook, "aria-label": label });
      box.checked = !!checked;
      box.disabled = !!disabled;
      box.addEventListener("change", function () { onchange(box.checked); });
      return el("label", { class: "k-card-row k-cx-toggle" }, [el("span", { class: "k-cx-toggle-t", text: label }), box]);
    }
    function setting(fn) {
      return function (v) { fn(X().S(), v); KOS.store.save(); X().noteLocal("settings"); paint(); };
    }
    function btn(text, hook, onclick, primary, disabled) {
      return el("button", { type: "button", class: "k-btn k-btn--sm" + (primary ? " k-btn--primary" : ""), "data-ui": "cx." + hook, text: text, disabled: disabled ? "" : null, onclick: onclick });
    }
    function connectBtn(p, on) {
      if (on) return btn("Disconnect", p + "-disconnect", function () {
        KOS.ui.confirm({ title: "Disconnect " + X().NAME[p] + "?", body: "Nothing is deleted on either side. Linked records keep their links, so connecting again carries on.", confirm: "Disconnect", danger: true, mark: "繋" }, function () {
          X().disconnect(p).then(function () { KOS.ui.toast(X().NAME[p] + " disconnected."); paint(); });
        });
      });
      return btn("Connect " + X().NAME[p], p + "-connect", function () {
        X().connect(p).then(function (r) { if (!r.ok) KOS.ui.toast(r.why, true); });
      }, true);
    }
    function syncBtn(p, on) {
      return btn(busy[p] ? "Syncing…" : "Sync now", p + "-sync", function () {
        busy[p] = true; paint();
        X().syncProvider(p, "button").then(function (r) {
          busy[p] = false;
          KOS.ui.toast(r.waiting ? "Another device is syncing; this one goes next." : r.ok ? X().NAME[p] + " is in step." : r.why || "It didn't finish.", !r.ok);
          KOS.rerender();
        });
      }, false, !on || busy[p]);
    }
    function statusLine(p, node) {
      X().status(p).then(function (st) { node.textContent = summary(st); });
      return node;
    }

    function paint() {
      grid.innerHTML = "";
      var v = X().view(), why = X().blocked();
      if (why) grid.appendChild(card("Before you connect", "blocked", [
        el("p", { class: "k-st-note", text: why === "file" ? "Open KurenaiOS from its web address: a sign-in can't come back to a file." : "Connections go through your cloud account, so sign in to cloud sync first." }),
        why === "signed-out" ? el("div", { class: "k-cx-btns" }, [btn("Open Backup & cloud", "cloud", function () { KOS.show("data"); }, true)]) : null
      ].filter(Boolean)));

      /* Google */
      var g = v.google;
      grid.appendChild(card("Google", "google", [
        el("p", { class: "k-st-big", "data-ui": "cx.google-who", text: g.on ? "Connected" + (g.account ? " as " + g.account : "") : "Not connected" }),
        g.on ? statusLine("google", el("p", { class: "k-st-note", "data-ui": "cx.google-status", text: "…" })) : el("p", { class: "k-st-note", text: "One sign-in for Calendar and Tasks." }),
        g.on ? sw("Two-way with my primary Google calendar", "google-cal", g.cal, setting(function (e, x) { e.google.cal = x; })) : null,
        g.on ? sw("Send deadlines, plan milestones and bills to a “KurenaiOS” calendar", "google-export", g.export.on, setting(function (e, x) { e.google.export.on = x; })) : null,
        g.on && g.export.on ? el("div", { class: "k-cx-kinds", "data-ui": "cx.google-kinds" }, [
          ["exams", "Exams and deadlines"], ["assignments", "Assignments due"], ["startby", "Start-by dates"],
          ["pacing", "Class milestones"], ["money", "Bills (no amounts)"], ["goals", "Goal deadlines"]
        ].map(function (k) {
          var box = el("input", { type: "checkbox", "data-ui": "cx.google-kind", "aria-label": k[1] });
          box.checked = g.export[k[0]] !== false;
          box.addEventListener("change", setting(function (e) { e.google.export[k[0]] = box.checked; }));
          return el("label", { class: "k-cx-kind" }, [box, el("span", { text: k[1] })]);
        })) : null,
        g.on ? sw("Google Tasks for Reminders", "google-tasks", g.tasks, setting(function (e, x) { e.google.tasks = x; })) : null,
        g.on ? null : el("ul", { class: "k-cx-facts" }, [
          "Your events two-way with your primary Google calendar",
          "Deadlines, plan milestones and bills in a “KurenaiOS” calendar",
          "Google Tasks for Reminders, if you want it"
        ].map(function (t) { return el("li", { text: t }); })),
        el("div", { class: "k-cx-btns" }, [connectBtn("google", g.on), syncBtn("google", g.on)])
      ].filter(Boolean)));

      /* Todoist */
      var t = v.todoist;
      grid.appendChild(card("Todoist", "todoist", [
        el("p", { class: "k-st-big", "data-ui": "cx.todoist-who", text: t.on ? "Connected" + (t.account ? " as " + t.account : "") : "Not connected" }),
        t.on ? statusLine("todoist", el("p", { class: "k-st-note", "data-ui": "cx.todoist-status", text: "…" })) : el("p", { class: "k-st-note", text: "Reminders lists linked to Todoist projects." }),
        el("ul", { class: "k-cx-facts" }, [
          "Title, notes, due date and time, and repeats",
          "Priority, labels and sub-tasks",
          "Ticked in Todoist counts as today's activity, without XP or gold"
        ].map(function (x) { return el("li", { text: x }); })),
        el("div", { class: "k-cx-btns" }, [connectBtn("todoist", t.on), syncBtn("todoist", t.on)])
      ]));

      /* Reminders lists */
      var linkCard = card("Reminders lists", "lists", [el("p", { class: "k-st-note", text: "Each list goes to one Todoist project or one Google Tasks list." })]);
      linkCard.classList.add("k-cx-wide");
      grid.appendChild(linkCard);
      var services = [];
      if (t.on) services.push("todoist");
      if (g.on && g.tasks) services.push("gtasks");
      if (!services.length) { linkCard.appendChild(el("p", { class: "k-st-note", text: "Connect Todoist, or turn on Google Tasks, to link a list." })); return; }
      Promise.all([X().kv(X().key("todoist.lists")), X().kv(X().key("google.tasklists"))]).then(function (a) {
        var remote = { todoist: a[0] || [], gtasks: a[1] || [] };
        var rows = [{ id: null, name: "No list" }].concat(KOS.reminders.lists());
        var ul = el("ul", { class: "k-cx-links", "data-ui": "cx.links" });
        rows.forEach(function (l) {
          var cur = KOS.extTasks.linkOfList(l.id);
          var sel = el("select", { class: "k-pill-select", "data-ui": "cx.link", "aria-label": "Link " + l.name + " to" });
          sel.appendChild(el("option", { value: "", text: "Not linked" }));
          services.forEach(function (p) {
            var opts = remote[p].slice();
            if (cur && cur.p === p && !opts.some(function (o) { return String(o.id) === String(cur.id); })) opts.push({ id: cur.id, name: cur.name || "(linked)" });
            if (!opts.length) return;
            var grp = el("optgroup", { label: KOS.extTasks.LABEL[p] });
            opts.forEach(function (o) { grp.appendChild(el("option", { value: p + "|" + o.id, text: o.name })); });
            sel.appendChild(grp);
          });
          sel.value = cur ? cur.p + "|" + cur.id : "";
          sel.addEventListener("change", function () {
            if (!sel.value) { KOS.extTasks.link(l.id, null, null); paint(); return; }
            var i = sel.value.indexOf("|"), p = sel.value.slice(0, i), id = sel.value.slice(i + 1);
            var o = remote[p].filter(function (x) { return String(x.id) === id; })[0] || { id: id, name: "" };
            KOS.extTasks.link(l.id, p, o);
            KOS.ui.toast(l.name + " → " + KOS.extTasks.LABEL[p] + ": " + o.name + ". It syncs in a moment.");
            paint();
          });
          ul.appendChild(el("li", { class: "k-cx-link" }, [el("span", { class: "k-cx-link-t", text: l.name }), sel]));
        });
        linkCard.appendChild(ul);
        linkCard.appendChild(el("div", { class: "k-cx-btns" }, services.map(function (p) {
          return btn("Load " + KOS.extTasks.LABEL[p] + " lists", "load-" + p, function () {
            KOS.extTasks.remoteLists(p).then(function (r) { if (!r.ok) KOS.ui.toast(r.why, true); else paint(); });
          });
        })));
      });
    }
    paint();
    current = { grid: grid, paint: paint };
  };
  /* one listener for the page's whole life: a sync or sign-in redraws it */
  var current = null, queued = false;
  if (KOS.ext) KOS.ext.onChange(function () {
    if (queued || !current || !document.body.contains(current.grid)) return;
    queued = true;
    setTimeout(function () { queued = false; if (current && document.body.contains(current.grid)) current.paint(); }, 50);
  });
})();
