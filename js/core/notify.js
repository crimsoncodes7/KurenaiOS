/* Kurenai OS — core/notify.js
   The notification centre's domain layer: ONE feed for the things that are
   about YOU — calendar alerts, reminders, assignment alerts, an episode
   airing for a title being watched, a Budget Planner item reaching its
   release day. Housekeeping (sync cycles, cloud state, repairs) is not a
   notification: it stays on its own page and in the toast.

   Shape of the contract (the same honesty as the alert tickers it joins):
   - The feed is a LEDGER of things that happened, `state.notify.items`,
     appended through push() by the surfaces that detect them. Nothing in
     here re-derives a due date: the calendar, reminders and assignments
     keep their own alert rules and their own once-only `notified` /
     `alerted` maps (invariant 42); they hand the fired alert here and the
     ledger dedupes on its deterministic id. So a reminder is never
     announced twice, and the feed never disagrees with the ticker.
   - The two things nobody else watched — an episode AIRING and a wishlist
     RELEASE — are watched here (tick), from data the app already holds:
     the airing cache (KOS.anime.recordAiring hands over the next-episode
     schedule of every watched title, kept small in `state.notify.airing`
     so the moment is remembered after the cache moves on) and the
     Planner's release dates.
   - read state is `state.notify.read[id] = ts`; both maps and the ledger
     ride the state document, so a notification read on the phone is read
     on the Mac (cloudmerge: natural-key array + keyed maps).
   - DEVICE alerts (the OS notification on a Mac, a PWA notification on a
     phone) are a per-device opt-in through the Notification permission —
     shown for a NEW item that arrived on this device while it was open,
     through the service-worker registration where one controls the page
     (that is what an installed phone app needs) and the plain
     constructor otherwise. There is no push server: an alert fires while
     the app is open, and the page says so.                               */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var CAP = 200;                       // ledger rows kept
  var RETAIN = 45 * 86400000;          // and no older than this
  var FRESH = 10 * 60 * 1000;          // an item this recent is "just happened" → device alert
  var listeners = [];

  var KINDS = {
    calendar:   { label: "Calendar",   glyph: "暦", section: "productivity", view: "calendar" },
    reminder:   { label: "Reminders",  glyph: "🔔", section: "productivity", view: "reminders" },
    assignment: { label: "Assignments", glyph: "課", section: "study", view: "assignments" },
    airing:     { label: "Airing",     glyph: "映", section: "collection", view: "anime" },
    wishlist:   { label: "Planner",    glyph: "購", section: "collection", view: "wishlist" },
    pacing:     { label: "Pacing",     glyph: "暦", section: "productivity", view: "pacing" }
  };

  function N() {
    var s = store.state;
    if (!s.notify || typeof s.notify !== "object") s.notify = {};
    if (!Array.isArray(s.notify.items)) s.notify.items = [];
    if (!s.notify.read || typeof s.notify.read !== "object") s.notify.read = {};
    if (!s.notify.airing || typeof s.notify.airing !== "object") s.notify.airing = {};
    return s.notify;
  }
  function emit() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) { /* a listener must not break the feed */ } });
  }
  function onChange(fn) {
    if (typeof fn !== "function") return function () {};
    listeners.push(fn);
    return function off() { var i = listeners.indexOf(fn); if (i !== -1) listeners.splice(i, 1); };
  }

  /* ---------------- the ledger ---------------- */
  function all() {
    var n = N();
    if (n.items.some(function (it) { return !it || !KINDS[it.kind]; })) { prune(n); store.save(); }
    return n.items.slice().sort(function (a, b) { return b.ts - a.ts; });
  }
  function isRead(item) { return !!N().read[item.id]; }
  function unread() {
    var n = N();
    return all().filter(function (it) { return !n.read[it.id]; }).length;
  }
  function prune(n) {
    var floor = Date.now() - RETAIN;
    /* rows of a kind this build no longer knows (the sync/system lines an
       earlier build wrote) leave with the old ones */
    n.items = n.items.filter(function (it) { return it && KINDS[it.kind] && it.ts >= floor; });
    if (n.items.length > CAP) {
      n.items.sort(function (a, b) { return b.ts - a.ts; });
      n.items.length = CAP;
    }
    var keep = {};
    n.items.forEach(function (it) { keep[it.id] = true; });
    Object.keys(n.read).forEach(function (id) { if (!keep[id]) delete n.read[id]; });
  }
  /* push({id, kind, title, body, ts, view, arg, cover}) → true when the
     item is new to the ledger. `id` must be deterministic for the event
     (kind:record:occurrence) — that is the whole dedupe. */
  function push(item) {
    if (!item || !item.id || !KINDS[item.kind]) return false;
    var n = N();
    if (n.items.some(function (it) { return it.id === item.id; })) return false;
    var rec = {
      id: String(item.id), kind: item.kind,
      title: String(item.title || "").slice(0, 200),
      body: String(item.body || "").slice(0, 300),
      ts: typeof item.ts === "number" ? item.ts : Date.now(),
      view: item.view || KINDS[item.kind].view || null,
      arg: item.arg === undefined ? null : item.arg,
      cover: item.cover || null
    };
    n.items.push(rec);
    prune(n);
    store.save();
    emit();
    if (Date.now() - rec.ts < FRESH) deviceAlert(rec);
    return true;
  }
  function markRead(ids) {
    var n = N(), now = Date.now(), changed = false;
    (Array.isArray(ids) ? ids : [ids]).forEach(function (id) {
      if (id && !n.read[id]) { n.read[id] = now; changed = true; }
    });
    if (changed) { store.save(); emit(); }
  }
  function markAllRead() { markRead(N().items.map(function (it) { return it.id; })); }
  function clear() {
    var n = N();
    n.items = []; n.read = {};
    store.save(); emit();
  }
  /* open the thing a notification is about, and count it read */
  function open(item) {
    markRead(item.id);
    if (item.view && KOS.views && KOS.views[item.view]) KOS.show(item.view, item.arg === null ? undefined : item.arg);
  }

  /* ---------------- the two watchers ---------------- */
  /* the Anime module hands over the airing cache after every refresh:
     remember the next episode of every WATCHED title so the moment it
     airs is announced even after the cache has moved on to the one after */
  function recordAiring(byId, rows) {
    var n = N(), changed = false;
    (rows || []).forEach(function (e) {
      if (e.status !== "inProgress" || !e.externalIds || !e.externalIds.anilistId) return;
      var a = byId[e.externalIds.anilistId];
      if (!a || !a.airingAt) return;
      var key = String(e.externalIds.anilistId);
      var cur = n.airing[key];
      if (cur && cur.ep === a.episode && cur.at === a.airingAt) return;
      n.airing[key] = { ep: a.episode, at: a.airingAt, title: e.title, entryId: e.id, cover: e.coverUrl || null };
      changed = true;
    });
    if (changed) store.save();
  }
  function tickAiring() {
    var n = N(), now = Math.floor(Date.now() / 1000), changed = false;
    Object.keys(n.airing).forEach(function (key) {
      var s = n.airing[key];
      if (!s || s.at > now) return;
      push({ id: "air:" + key + ":" + s.ep, kind: "airing",
        title: "Episode " + s.ep + " of " + s.title + " aired",
        body: "Airing schedule from AniList", ts: s.at * 1000,
        view: "anime", cover: s.cover });
      delete n.airing[key];
      changed = true;
    });
    if (changed) store.save();
  }
  function tickWishlist() {
    if (!KOS.wishlist || !KOS.srs) return;
    var today = KOS.srs.todayISO();
    KOS.wishlist.byStatus("waitingForRelease").forEach(function (it) {
      if (!it.releaseDate || it.releaseDate > today) return;
      /* the day it lands, or the first open after — a quiet ledger line,
         never a device alert for an old release (ts is the release day) */
      var p = it.releaseDate.split("-");
      var at = new Date(+p[0], +p[1] - 1, +p[2], 9, 0, 0, 0).getTime();
      push({ id: "wish:" + it.id + ":" + it.releaseDate, kind: "wishlist",
        title: it.title + " is out", body: "Release day — it was waiting on your Budget Planner",
        ts: at, view: "wishlist", cover: it.coverUrl || null });
    });
  }
  function tick() {
    try { tickAiring(); } catch (e) { /* never break the app for a feed line */ }
    try { tickWishlist(); } catch (e2) { /* ditto */ }
    try { if (KOS.pacing && KOS.pacing.noteRollover) KOS.pacing.noteRollover(); } catch (e3) { /* ditto */ }
  }

  /* ---------------- device alerts ---------------- */
  var native = {
    supported: function () { return typeof window !== "undefined" && "Notification" in window; },
    permission: function () { return native.supported() ? window.Notification.permission : "unsupported"; },
    /* the per-device opt-in: permission alone is not consent to be pinged
       (Chrome remembers permission across sites' whims); the switch is */
    enabled: function () {
      var ui = store.state.ui = store.state.ui || {};
      return !!ui.notifyDevice && native.permission() === "granted";
    },
    setEnabled: function (v) {
      var ui = store.state.ui = store.state.ui || {};
      ui.notifyDevice = !!v;
      store.save();
      emit();
    },
    /* request(cb(granted)) — must run from a user gesture */
    request: function (cb) {
      cb = cb || function () {};
      if (!native.supported()) { cb(false); return; }
      var done = function (perm) {
        var ok = perm === "granted";
        native.setEnabled(ok);
        cb(ok);
      };
      try {
        var r = window.Notification.requestPermission(done);
        if (r && typeof r.then === "function") r.then(done);
      } catch (e) { cb(false); }
    }
  };
  function deviceAlert(rec) {
    if (!native.enabled()) return;
    if (typeof document !== "undefined" && document.visibilityState === "visible" && document.hasFocus && document.hasFocus()) {
      /* the page is in front — the bell and the toast already say it */
      return;
    }
    var opts = { body: rec.body || "", tag: rec.id, icon: "icons/icon-192.png", badge: "icons/icon-192.png",
      data: { view: rec.view, arg: rec.arg } };
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(function (reg) {
          if (reg && reg.showNotification) reg.showNotification(rec.title, opts);
          else new window.Notification(rec.title, opts);
        }).catch(function () {});
        return;
      }
      var nt = new window.Notification(rec.title, opts);
      nt.onclick = function () { window.focus(); open(rec); };
    } catch (e) { /* a browser that lists the API but refuses it */ }
  }

  /* ---------------- formatting ---------------- */
  function ago(ts) {
    var d = Date.now() - ts;
    if (d < 0) d = 0;
    var m = Math.floor(d / 60000), h = Math.floor(d / 3600000), dd = Math.floor(d / 86400000);
    if (m < 1) return "just now";
    if (m < 60) return m + "m ago";
    if (h < 24) return h + "h ago";
    if (dd < 7) return dd + (dd === 1 ? " day ago" : " days ago");
    return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  }

  KOS.notify = {
    KINDS: KINDS,
    all: all, unread: unread, isRead: isRead,
    push: push, markRead: markRead, markAllRead: markAllRead, clear: clear, open: open,
    recordAiring: recordAiring, tick: tick, onChange: onChange,
    native: native, ago: ago,
    _state: N
  };
})();
