/* Kurenai OS — core/reminders.js
   The Reminders domain (Build 6.2): a real task store, not a to-do strip.

   MODEL. One flat item array plus a separate list array. Lists and Tags are
   deliberately DIFFERENT things and never collapse into each other:
     · a LIST is a container — an item belongs to exactly one (or none);
     · a TAG is a cross-list label — an item carries any number.
   Smart sections (Today/Scheduled/Upcoming/Overdue/Completed) are pure
   derivations over the same array; they are never stored.

   GOVERNOR BOUNDARY. Completing a reminder pays the same sanctioned trickle
   every tick has always paid — through KOS.sessions.log({type:"todo"}), never
   by touching HP/XP/gold directly (invariant #1). Because full CRUD makes
   trivial-item farming easy, rewards are bounded three ways:
     · a per-day cap on rewarded completions (REWARD_CAP);
     · one reward per item per day (re-ticking pays nothing);
     · sub-task ticks pay NOTHING — they are progress inside one item, and
       paying per sub-task was the most farmable path of all.
   Everything else about the module is free: creating, editing, scheduling
   and deleting never move the economy.                                     */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var REWARD_CAP = 8;                 // rewarded completions per day
  var PRIORITIES = [
    { v: 0, label: "None", short: "" },
    { v: 1, label: "Low", short: "!" },
    { v: 2, label: "Medium", short: "!!" },
    { v: 3, label: "High", short: "!!!" }
  ];
  var RECUR = [
    { v: "", label: "Never" },
    { v: "daily", label: "Every day" },
    { v: "weekly", label: "Every week" },
    { v: "monthly", label: "Every month" },
    { v: "yearly", label: "Every year" }
  ];
  /* alert offsets in minutes before the due moment (0 = at the time) */
  var ALERTS = [
    { v: 0, label: "At the time" },
    { v: 10, label: "10 minutes before" },
    { v: 30, label: "30 minutes before" },
    { v: 60, label: "1 hour before" },
    { v: 1440, label: "1 day before" },
    { v: 10080, label: "1 week before" }
  ];

  function R() {
    var s = store.state.reminders;
    /* a restore from a pre-6.2 backup arrives without the branch */
    if (!s) { s = store.state.reminders = { v: 1, nextId: 1, items: [], lists: [], rewardLog: {}, migrated: false }; }
    if (!Array.isArray(s.items)) s.items = [];
    if (!Array.isArray(s.lists)) s.lists = [];
    if (!s.rewardLog || typeof s.rewardLog !== "object") s.rewardLog = {};
    if (typeof s.nextId !== "number") s.nextId = 1;
    return s;
  }
  function today() { return KOS.srs.todayISO(); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }

  /* ---------------- normalisation: the single schema gate ----------------
     Every write goes through here, so a field that is not listed cannot
     silently enter the store (and a field added here reaches every item). */
  function normalise(patch, base) {
    var b = base || {};
    var t = String(patch.title != null ? patch.title : b.title || "").trim();
    var tags = (patch.tags != null ? patch.tags : b.tags) || [];
    if (!Array.isArray(tags)) tags = String(tags).split(",");
    tags = tags.map(function (x) { return String(x).trim().replace(/^#/, ""); })
      .filter(Boolean)
      .filter(function (x, i, a) { return a.indexOf(x) === i; })
      .slice(0, 12);
    var pr = patch.priority != null ? patch.priority : b.priority;
    pr = Math.max(0, Math.min(3, parseInt(pr, 10) || 0));
    var due = patch.due !== undefined ? patch.due : b.due;
    due = due && /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null;
    var dueTime = patch.dueTime !== undefined ? patch.dueTime : b.dueTime;
    dueTime = due && dueTime && /^\d{2}:\d{2}$/.test(dueTime) ? dueTime : null;
    var recur = patch.recur !== undefined ? patch.recur : b.recur;
    recur = RECUR.some(function (r) { return r.v && r.v === recur; }) ? recur : null;
    /* a repeat with nothing to repeat from can never fire — clearing the
       date clears the schedule, exactly as it clears the time */
    if (!due) recur = null;
    var alerts = (patch.alerts != null ? patch.alerts : b.alerts) || [];
    if (!Array.isArray(alerts)) alerts = [];
    alerts = alerts.map(function (a) { return parseInt(a, 10); })
      .filter(function (a) { return !isNaN(a) && a >= 0; })
      .filter(function (x, i, arr) { return arr.indexOf(x) === i; })
      .sort(function (a, b2) { return a - b2; }).slice(0, 4);
    var subs = (patch.subs != null ? patch.subs : b.subs) || [];
    if (!Array.isArray(subs)) subs = [];
    return {
      id: b.id,
      title: t,
      notes: String(patch.notes != null ? patch.notes : b.notes || ""),
      done: !!(patch.done != null ? patch.done : b.done),
      completedAt: patch.completedAt !== undefined ? patch.completedAt : (b.completedAt || null),
      due: due,
      dueTime: dueTime,
      priority: pr,
      listId: (patch.listId !== undefined ? patch.listId : b.listId) || null,
      tags: tags,
      subs: subs,
      recur: recur,
      alerts: alerts,
      alerted: b.alerted || {},
      lastRewardedOn: b.lastRewardedOn || null,
      created: b.created || today(),
      updatedAt: Date.now()
    };
  }

  /* ---------------- CRUD ---------------- */
  function all() { return R().items; }
  function get(id) { return R().items.find(function (x) { return x.id === id; }) || null; }
  function add(patch) {
    var s = R();
    var item = normalise(patch || {});
    if (!item.title) return null;                     // a reminder needs words
    item.id = s.nextId++;
    s.items.push(item);
    store.save();
    return item;
  }
  function update(id, patch) {
    var s = R(), item = get(id);
    if (!item) return null;
    var next = normalise(patch || {}, item);
    next.id = item.id;
    s.items[s.items.indexOf(item)] = next;
    store.save();
    return next;
  }
  function remove(id) {
    var s = R(), i = s.items.findIndex(function (x) { return x.id === id; });
    if (i === -1) return false;
    s.items.splice(i, 1);
    store.save();
    return true;
  }

  /* ---------------- recurrence ---------------- */
  function addMonths(iso, n) {
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    var day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + n);
    /* clamp: 31 Jan + 1 month is the last day of February, not 3 March */
    var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, last));
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  /* the ONE occurrence strictly after `from` (default: the item's own due
     date). Pure — it advances exactly one step, so it stays testable. */
  function nextOccurrence(item, from) {
    if (!item.recur || !item.due) return null;
    var cur = from || item.due;
    if (item.recur === "daily") return KOS.srs.addDays(cur, 1);
    if (item.recur === "weekly") return KOS.srs.addDays(cur, 7);
    if (item.recur === "monthly") return addMonths(cur, 1);
    if (item.recur === "yearly") return addMonths(cur, 12);
    return null;
  }
  /* the occurrence a completed repeat should land on: the first one that is
     not already in the past, so ticking off a long-neglected weekly chore
     doesn't immediately reappear as overdue */
  function nextDueAfterCompletion(item) {
    var cur = nextOccurrence(item);
    var t = today(), guard = 0;
    while (cur && cur < t && guard < 4000) { cur = nextOccurrence(item, cur); guard++; }
    return cur;
  }

  /* ---------------- completion + the bounded reward ---------------- */
  function rewardedToday() {
    var s = R();
    var d = today();
    /* prune older days while we are here — this map must not grow forever */
    Object.keys(s.rewardLog).forEach(function (k) { if (k !== d) delete s.rewardLog[k]; });
    return s.rewardLog[d] || 0;
  }
  /* would completing this item pay anything right now? (also the UI's hint) */
  function rewardState(item) {
    if (!item || item.done) return { pays: false, reason: "done" };
    if (item.lastRewardedOn === today()) return { pays: false, reason: "already-paid-today" };
    if (rewardedToday() >= REWARD_CAP) return { pays: false, reason: "daily-cap" };
    return { pays: true, reason: null };
  }
  function complete(id, val) {
    var item = get(id);
    if (!item) return null;
    var s = R(), d = today();

    if (!val) {                                    // un-completing never pays
      item.done = false;
      item.completedAt = null;
      item.updatedAt = Date.now();
      store.save();
      return item;
    }

    var pays = rewardState(item).pays;

    if (item.recur && item.due) {
      /* a repeating reminder rolls forward instead of closing: the instance
         is done, the commitment is not */
      item.due = nextDueAfterCompletion(item);
      item.alerted = {};                           // a new occurrence re-arms
      item.done = false;
      item.completedAt = null;
      (item.subs || []).forEach(function (sub) { sub.done = false; });
    } else {
      item.done = true;
      item.completedAt = Date.now();
    }
    item.updatedAt = Date.now();

    if (pays) {
      item.lastRewardedOn = d;
      s.rewardLog[d] = (s.rewardLog[d] || 0) + 1;
      /* the ONE sanctioned path — governor prices it like any other tick */
      KOS.sessions.log({ type: "todo", metrics: { item: item.title, source: "reminder" } });
    } else {
      store.save();
    }
    return item;
  }

  /* ---------------- sub-tasks (never rewarded) ---------------- */
  function subAdd(id, text) {
    var item = get(id);
    if (!item || !String(text).trim()) return null;
    var s = R();
    item.subs = item.subs || [];
    item.subs.push({ id: s.nextId++, text: String(text).trim(), done: false });
    item.updatedAt = Date.now();
    store.save();
    return item;
  }
  function subToggle(id, subId, val) {
    var item = get(id);
    if (!item) return null;
    var sub = (item.subs || []).find(function (x) { return x.id === subId; });
    if (!sub) return null;
    sub.done = !!val;
    item.updatedAt = Date.now();
    store.save();          // deliberately no sessions.log — see the header
    return item;
  }
  function subRemove(id, subId) {
    var item = get(id);
    if (!item) return null;
    var i = (item.subs || []).findIndex(function (x) { return x.id === subId; });
    if (i !== -1) { item.subs.splice(i, 1); item.updatedAt = Date.now(); store.save(); }
    return item;
  }

  /* ---------------- lists (containers) ---------------- */
  function lists() { return R().lists; }
  function addList(name, colour) {
    name = String(name || "").trim();
    if (!name) return null;
    var s = R();
    var existing = s.lists.find(function (l) { return l.name.toLowerCase() === name.toLowerCase(); });
    if (existing) return existing;
    var l = { id: s.nextId++, name: name, colour: colour || null };
    s.lists.push(l);
    store.save();
    return l;
  }
  function renameList(id, name) {
    var l = lists().find(function (x) { return x.id === id; });
    if (!l || !String(name).trim()) return null;
    l.name = String(name).trim();
    store.save();
    return l;
  }
  /* deleting a list never deletes its reminders — they fall back to no list */
  function deleteList(id) {
    var s = R(), i = s.lists.findIndex(function (x) { return x.id === id; });
    if (i === -1) return false;
    s.lists.splice(i, 1);
    s.items.forEach(function (it) { if (it.listId === id) it.listId = null; });
    store.save();
    return true;
  }
  function listName(id) {
    var l = lists().find(function (x) { return x.id === id; });
    return l ? l.name : null;
  }

  /* ---------------- tags (cross-list labels) ---------------- */
  function tags() {
    var seen = {};
    all().forEach(function (it) { (it.tags || []).forEach(function (t) { seen[t] = (seen[t] || 0) + 1; }); });
    return Object.keys(seen).sort().map(function (t) { return { tag: t, count: seen[t] }; });
  }
  function renameTag(from, to) {
    to = String(to || "").trim().replace(/^#/, "");
    if (!to) return false;
    all().forEach(function (it) {
      var i = (it.tags || []).indexOf(from);
      if (i !== -1) {
        it.tags[i] = to;
        it.tags = it.tags.filter(function (x, j, a) { return a.indexOf(x) === j; });
      }
    });
    store.save();
    return true;
  }
  function deleteTag(tag) {
    all().forEach(function (it) {
      it.tags = (it.tags || []).filter(function (t) { return t !== tag; });
    });
    store.save();
    return true;
  }

  /* ---------------- smart sections ---------------- */
  /* the exact moment a dated reminder becomes late */
  function isOverdue(item) {
    if (item.done || !item.due) return false;
    var d = today();
    if (item.due < d) return true;
    if (item.due > d) return false;
    return !!(item.dueTime && item.dueTime < nowHM());
  }
  var SECTIONS = [
    { id: "all", label: "All", glyph: "全", match: function (i) { return !i.done; } },
    { id: "today", label: "Today", glyph: "今",
      match: function (i) { return !i.done && i.due === today(); } },
    { id: "scheduled", label: "Scheduled", glyph: "暦",
      match: function (i) { return !i.done && !!i.due; } },
    { id: "upcoming", label: "Upcoming", glyph: "先",
      match: function (i) { return !i.done && !!i.due && i.due > today(); } },
    { id: "overdue", label: "Overdue", glyph: "遅", match: isOverdue },
    { id: "completed", label: "Completed", glyph: "済", match: function (i) { return !!i.done; } }
  ];
  function section(id) { return SECTIONS.find(function (s) { return s.id === id; }) || SECTIONS[0]; }

  /* ---------------- query: sections + filters + search + sort ---------------- */
  var SORTS = [
    { v: "due", label: "Due date" },
    { v: "priority", label: "Priority" },
    { v: "title", label: "Title" },
    { v: "created", label: "Recently added" }
  ];
  function query(opts) {
    opts = opts || {};
    var sec = section(opts.section || "all");
    var rows = all().filter(sec.match);
    if (opts.listId != null) rows = rows.filter(function (i) { return i.listId === opts.listId; });
    if (opts.tag) rows = rows.filter(function (i) { return (i.tags || []).indexOf(opts.tag) !== -1; });
    if (opts.priority != null && opts.priority !== "") {
      var p = parseInt(opts.priority, 10);
      rows = rows.filter(function (i) { return i.priority === p; });
    }
    var q = String(opts.search || "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(function (i) {
        return i.title.toLowerCase().indexOf(q) !== -1 ||
          (i.notes || "").toLowerCase().indexOf(q) !== -1 ||
          (i.tags || []).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; }) ||
          (i.subs || []).some(function (s) { return s.text.toLowerCase().indexOf(q) !== -1; });
      });
    }
    var sort = opts.sort || "due";
    rows = rows.slice().sort(function (a, b) {
      if (sort === "priority") {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return dueKey(a) < dueKey(b) ? -1 : dueKey(a) > dueKey(b) ? 1 : 0;
      }
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "created") return (b.id || 0) - (a.id || 0);
      /* due: dated first (soonest), then undated by priority */
      var ka = dueKey(a), kb = dueKey(b);
      if (ka !== kb) return ka < kb ? -1 : 1;
      return b.priority - a.priority;
    });
    return rows;
  }
  function dueKey(i) { return i.due ? i.due + "T" + (i.dueTime || "99:99") : "9999-99-99"; }

  function counts() {
    var out = { sections: {}, lists: {}, tags: {} };
    SECTIONS.forEach(function (s) { out.sections[s.id] = all().filter(s.match).length; });
    lists().forEach(function (l) {
      out.lists[l.id] = all().filter(function (i) { return !i.done && i.listId === l.id; }).length;
    });
    tags().forEach(function (t) {
      out.tags[t.tag] = all().filter(function (i) { return !i.done && (i.tags || []).indexOf(t.tag) !== -1; }).length;
    });
    return out;
  }

  /* ---------------- alert rules (in-app, same shape as the calendar's) ----
     No push API and no service-worker scheduling: alerts fire while the app
     is open, once per offset per occurrence. */
  function dueMoment(item) {
    if (!item.due) return null;
    var p = item.due.split("-");
    var hm = (item.dueTime || "09:00").split(":");
    return new Date(+p[0], +p[1] - 1, +p[2], +hm[0], +hm[1], 0, 0).getTime();
  }
  function checkAlerts() {
    var fired = [];
    var now = Date.now();
    all().forEach(function (item) {
      if (item.done || !item.due || !(item.alerts || []).length) return;
      var moment = dueMoment(item);
      if (moment == null) return;
      item.alerted = item.alerted || {};
      item.alerts.forEach(function (mins) {
        var at = moment - mins * 60000;
        if (now < at) return;                       // not yet
        if (now - at > 12 * 3600000) return;        // stale — don't shout on reopen
        var key = item.due + "|" + (item.dueTime || "") + "|" + mins;
        if (item.alerted[key]) return;
        item.alerted[key] = true;
        fired.push({ item: item, minutes: mins });
      });
    });
    if (fired.length) store.save();
    return fired;
  }
  function alertLabel(mins) {
    var a = ALERTS.find(function (x) { return x.v === mins; });
    return a ? a.label : mins + " minutes before";
  }

  /* ---------------- integrations ---------------- */
  /* Calendar: dated, still-open reminders on a day. Deliberately NOT routed
     into KOS.calendar.deadlines() — an ordinary reminder must never become a
     major Countdown on Home. */
  function forDate(dateISO) {
    return all().filter(function (i) { return !i.done && i.due === dateISO; });
  }
  /* Home: a READ-ONLY digest. No mutation path is exposed from here. */
  function summary(limit) {
    var overdue = all().filter(isOverdue);
    var todays = all().filter(function (i) { return !i.done && i.due === today(); });
    var next = query({ section: "all", sort: "due" })
      .filter(function (i) { return i.due; })
      .slice(0, limit || 3);
    return {
      overdue: overdue.length,
      today: todays.length,
      open: all().filter(function (i) { return !i.done; }).length,
      completedToday: all().filter(function (i) {
        return i.done && i.completedAt && new Date(i.completedAt).toDateString() === new Date().toDateString();
      }).length,
      next: next
    };
  }

  /* ---------------- migration from the old simple to-do list ----------------
     state.todo.manual items were {id,text,done,created,date,category,subs}.
     category becomes a LIST (a container), which is the honest mapping — the
     old field held one value per item, exactly like a list membership. Runs
     once, then the legacy array is emptied so nothing is counted twice. */
  function migrate() {
    var s = R();
    if (s.migrated) return 0;
    var t = store.state.todo;
    var legacy = (t && Array.isArray(t.manual)) ? t.manual : [];
    var n = 0;
    legacy.forEach(function (m) {
      var listId = null;
      if (m.category) {
        var l = addList(m.category);
        listId = l ? l.id : null;
      }
      var item = normalise({
        title: m.text || "Untitled reminder",
        due: m.date || null,
        done: !!m.done,
        listId: listId,
        subs: (m.subs || []).map(function (x) { return { id: s.nextId++, text: x.text, done: !!x.done }; })
      });
      item.id = s.nextId++;
      item.created = m.created || today();
      if (item.done) item.completedAt = item.completedAt || Date.now();
      s.items.push(item);
      n++;
    });
    if (t) t.manual = [];                 // one home for reminders, not two
    s.migrated = true;
    store.save();
    return n;
  }

  KOS.reminders = {
    all: all, get: get, add: add, update: update, remove: remove,
    complete: complete,
    subAdd: subAdd, subToggle: subToggle, subRemove: subRemove,
    lists: lists, addList: addList, renameList: renameList, deleteList: deleteList, listName: listName,
    tags: tags, renameTag: renameTag, deleteTag: deleteTag,
    query: query, counts: counts, isOverdue: isOverdue, nextOccurrence: nextOccurrence,
    nextDueAfterCompletion: nextDueAfterCompletion,
    section: section, SECTIONS: SECTIONS, SORTS: SORTS,
    PRIORITIES: PRIORITIES, RECUR: RECUR, ALERTS: ALERTS, alertLabel: alertLabel,
    checkAlerts: checkAlerts, dueMoment: dueMoment,
    forDate: forDate, summary: summary,
    rewardState: rewardState, rewardedToday: rewardedToday, REWARD_CAP: REWARD_CAP,
    migrate: migrate, normalise: normalise
  };

  /* run the migration as soon as the store is up — before any view reads it */
  migrate();
})();
