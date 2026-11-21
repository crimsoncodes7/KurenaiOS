/* Kurenai OS — modules/reminders.js
   祝 Reminders — the boot part of the dedicated page (Build 6.2): the one
   tick (KOS.reminderTick) and the formatters. The page itself is
   js/modules/reminderspage.js (page-reminders, 1F).

   Three-column workspace: a sidebar of smart sections / lists / tags, the
   reminder list in the middle, and a side inspector on the right that owns
   every detail of the selected item (notes, sub-tasks, recurrence, alerts).
   Graphite (frame 10c) groups the list by when: Overdue, Today, Upcoming.
   Lists and Tags stay visibly separate in the sidebar because they ARE
   separate: a list contains, a tag labels.                                 */
(function () {
  "use strict";
  var el = KOS.ui.el, R = function () { return KOS.reminders; };

  /* view state survives re-renders within a visit; the section survives
     navigation through the store's ui branch so returning feels stable */
  function prefs() {
    var u = KOS.store.state.ui;
    u.reminders = u.reminders || { section: "all", sort: "due", listId: null, tag: null, priority: "" };
    return u.reminders;
  }

  function fmtDue(item) {
    if (!item.due) return null;
    var t = KOS.srs.todayISO();
    var d = item.due;
    var label;
    if (d === t) label = "Today";
    else if (d === KOS.srs.addDays(t, 1)) label = "Tomorrow";
    else if (d === KOS.srs.addDays(t, -1)) label = "Yesterday";
    else {
      var p = d.split("-");
      var dt = new Date(+p[0], +p[1] - 1, +p[2]);
      label = dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
        (p[0] !== String(new Date().getFullYear()) ? " " + p[0] : "");
    }
    return label + (item.dueTime ? " · " + item.dueTime : "");
  }
  function priorityMark(p) {
    var spec = R().PRIORITIES[p];
    return spec && spec.short ? spec.short : "";
  }

  /* a list's dot: its stored colour is a calendar hue name, else one is
     dealt from the calendar palette by id (invariant 46's hues) */
  var LIST_HUES = ["jade", "brass", "iris", "clay", "sage", "plum", "sky", "slate"];
  function listHue(l) {
    /* a string id (bk:data-integrity#2) deals by its characters, so it keeps one hue */
    var id = l && l.id, n = typeof id === "number" ? id : String(id || "").split("").reduce(function (h, ch) { return (h * 31 + ch.charCodeAt(0)) % 9973; }, 0);
    var name = l && LIST_HUES.indexOf(l.colour) !== -1 ? l.colour : LIST_HUES[n % LIST_HUES.length];
    return "var(--cal-" + name + ")";
  }
  var PRIO_TONE = { 1: "muted", 2: "amber", 3: "crimson" };

  /* one tick for every reminder checkbox (HR-21, PR-27): completing says
     what it paid and offers Undo, which puts the reminder back exactly as
     it was — a repeating one on its old date — and takes the pay back
     through one correction entry. Unticking pays and takes nothing. */
  function tickItem(id, on, after) {
    var redraw = after || function () { KOS.rerender(); };
    if (!on) { R().complete(id, false); redraw(); return null; }
    var res = R().completeUndoable(id);
    if (!res) return null;
    var a = res.entryId != null && KOS.governor && KOS.governor.lastAward ? KOS.governor.lastAward() : null;
    var paid = a && (a.xp || a.gold) ? " · +" + a.xp + " XP · +" + a.gold + " gold" : "";
    var title = res.item.title;
    var said = res.item.recur && !res.item.done ? " · next " + (fmtDue(res.item) || "time") : " · done";
    KOS.ui.toast(title + said + paid, false, { label: "Undo", run: function () {
      res.undo();
      KOS.ui.toast(title + " · undone");
      redraw();
    } });
    redraw();
    return res;
  }
  KOS.reminderTick = tickItem;

  /* ---------------- alert ticker (at boot: it runs whatever page is open) ----------------
     In-app only, same honesty as the calendar's: fires while the app is open,
     never claims to be a background push. */
  function tick() {
    if (!KOS.reminders) return;
    KOS.reminders.checkAlerts().forEach(function (f) {
      var when = f.minutes === 0 ? "now" : KOS.reminders.alertLabel(f.minutes).replace(" before", " to go");
      KOS.ui.toast("🔔 " + f.item.title + " — " + when, f.minutes === 0);
      if (KOS.notify) KOS.notify.push(KOS.reminders.notice(f.item, f.minutes));
    });
  }
  setTimeout(function () {
    tick();
    setInterval(tick, 60000);
  }, 6000);

  /* what the Reminders page (js/modules/reminderspage.js, page-reminders, 1F) reads */
  KOS.reminderTick._k = { prefs: prefs, fmtDue: fmtDue, listHue: listHue, PRIO_TONE: PRIO_TONE };
})();
