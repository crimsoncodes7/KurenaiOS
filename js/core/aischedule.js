/* Kurenai OS — core/aischedule.js
   Scheduled prompts: "every morning at 07:00, tell me the plan for today".
   A schedule is a message the user wrote once and Kurenai sends for them
   at its time; the reply lands in its own conversation and in the
   notification centre (kind "assistant"), and as a device alert where the
   user allowed them.

   The honest boundary (invariant 98): there is no push server, and the
   Assistant runs inside the app — its tools read this device's data. So a
   schedule runs at its time when the app is open, or the first time the
   app is open later THAT day (a 07:00 plan read at 08:15 is still today's
   plan). A day the app never opened is skipped, not caught up tomorrow.

   Contract:
   - `state.assistant.schedules` is the one record list (synced; cloudmerge
     keys it on `id`, random strings, so two devices never mint the same).
     { id, prompt, name, time "HH:MM", days [0..6] (0 = Sunday), enabled,
       createdAt, updatedAt, lastRun "YYYY-MM-DD"|null,
       last: { date, at, ok, text, conversationId } | null }
   - A run is READ-ONLY and ISOLATED (aiorchestrator `readOnly`,
     `isolated`): nobody is there to approve a change, and the user's live
     conversation keeps its own context. Navigation is not a read tool, so a
     run never moves the screen.
   - One run at a time, and never while the user's own request is running.
   - Two open devices: the run is CLAIMED (lastRun = today, pushed) after a
     sync and before the model is called, so the second device sees the
     claim. Best effort — two devices opened in the same second can both
     run; each run is one ordinary metered request.
   - The reply is kept on the schedule (`last`, text capped) as well as in
     the conversation, so a signed-out device still shows it.            */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  KOS.ai = KOS.ai || {};
  var store = KOS.store;
  var MAX = 20, PROMPT_MAX = 1000, NAME_MAX = 60, TEXT_KEEP = 4000;
  var TICK_MS = 30000;
  var HM = /^([01]\d|2[0-3]):([0-5]\d)$/;
  var running = null, timer = null, listeners = [];

  function list() {
    var a = store.state.assistant = store.state.assistant || {};
    if (!Array.isArray(a.schedules)) a.schedules = [];
    return a.schedules;
  }
  function peek() {
    var a = store.state.assistant;
    return a && Array.isArray(a.schedules) ? a.schedules : [];
  }
  function today(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function emit() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* a listener must not break the ticker */ } }); }
  function onChange(fn) {
    listeners.push(fn);
    return function () { var i = listeners.indexOf(fn); if (i !== -1) listeners.splice(i, 1); };
  }

  /* ---------------- the record gate ---------------- */
  function normaliseDays(days) {
    var out = [];
    (Array.isArray(days) ? days : [0, 1, 2, 3, 4, 5, 6]).forEach(function (d) {
      d = Number(d);
      if (d >= 0 && d <= 6 && Math.floor(d) === d && out.indexOf(d) === -1) out.push(d);
    });
    return out.sort();
  }
  function validate(fields) {
    var prompt = String(fields.prompt == null ? "" : fields.prompt).trim();
    if (!prompt) return "Write the message Kurenai should send.";
    if (prompt.length > PROMPT_MAX) return "Keep the message under " + PROMPT_MAX + " characters.";
    if (!HM.test(String(fields.time || ""))) return "Pick a time (HH:MM).";
    if (!normaliseDays(fields.days).length) return "Pick at least one day.";
    return null;
  }
  function add(fields) {
    fields = fields || {};
    var bad = validate(fields);
    if (bad) return { ok: false, error: bad };
    var all = list();
    if (all.length >= MAX) return { ok: false, error: "Up to " + MAX + " scheduled prompts." };
    var now = Date.now();
    var rec = {
      id: "sch-" + now.toString(36) + "-" + Math.random().toString(36).slice(2, 7),
      prompt: String(fields.prompt).trim(),
      name: String(fields.name || "").trim().slice(0, NAME_MAX),
      time: String(fields.time),
      days: normaliseDays(fields.days),
      enabled: fields.enabled !== false,
      createdAt: now, updatedAt: now,
      /* a schedule made after today's time waits for tomorrow, rather than
         firing the moment it is saved */
      lastRun: isPast(String(fields.time), new Date()) ? today() : null,
      last: null
    };
    all.push(rec);
    store.save();
    emit();
    return { ok: true, schedule: rec };
  }
  function update(id, patch) {
    var rec = get(id);
    if (!rec) return { ok: false, error: "No such schedule." };
    var next = Object.assign({}, rec, patch || {});
    var bad = validate(next);
    if (bad) return { ok: false, error: bad };
    if (patch.prompt != null) rec.prompt = String(patch.prompt).trim();
    if (patch.name != null) rec.name = String(patch.name).trim().slice(0, NAME_MAX);
    if (patch.time != null) rec.time = String(patch.time);
    if (patch.days != null) rec.days = normaliseDays(patch.days);
    if (patch.enabled != null) rec.enabled = !!patch.enabled;
    rec.updatedAt = Date.now();
    store.save();
    emit();
    return { ok: true, schedule: rec };
  }
  function remove(id) {
    var all = list(), i = all.findIndex(function (s) { return s.id === id; });
    if (i === -1) return false;
    all.splice(i, 1);
    store.save();
    emit();
    return true;
  }
  function get(id) { return peek().filter(function (s) { return s.id === id; })[0] || null; }

  /* ---------------- when ---------------- */
  function minutesOf(hm) { var p = String(hm).split(":"); return +p[0] * 60 + +p[1]; }
  function isPast(hm, d) { return d.getHours() * 60 + d.getMinutes() >= minutesOf(hm); }
  /* due: on today's list of days, its time has passed today, not yet run
     today. Only TODAY is caught up (see the header). */
  function isDue(s, d) {
    d = d || new Date();
    return !!(s && s.enabled && HM.test(s.time) && (s.days || []).indexOf(d.getDay()) !== -1 &&
      isPast(s.time, d) && s.lastRun !== today(d));
  }
  function due(d) { return peek().filter(function (s) { return isDue(s, d); }); }
  /* the next time a schedule will be sent, for the page */
  function nextAt(s, from) {
    if (!s || !s.enabled || !(s.days || []).length) return null;
    from = from || new Date();
    for (var k = 0; k < 8; k++) {
      var d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + k, 0, 0, 0, 0);
      if (s.days.indexOf(d.getDay()) === -1) continue;
      var at = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, minutesOf(s.time), 0, 0).getTime();
      if (k === 0) {
        if (s.lastRun === today(from)) continue;             /* today's has run */
        if (at <= from.getTime()) return from.getTime();      /* due now: the next tick sends it */
      }
      return at;
    }
    return null;
  }

  /* ---------------- running one ---------------- */
  function busy() {
    return !!running || !!(KOS.ai.orchestrator && KOS.ai.orchestrator.isBusy && KOS.ai.orchestrator.isBusy());
  }
  function clampText(t, n) { t = String(t || ""); return t.length > n ? t.slice(0, n - 1) + "…" : t; }
  function plain(md) {
    return String(md || "").replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`|]/g, "").replace(/\s+/g, " ").trim();
  }
  function titleFor(s, d) {
    return (s.name || clampText(s.prompt, 48)) + " · " + d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }

  /* run(id, {manual}) — a manual "Run now" ignores the day and the time
     and does not claim the day (the 07:00 run still happens) */
  function run(id, opts, cb) {
    opts = opts || {}; cb = cb || function () {};
    var s = get(id);
    if (!s) { cb(new Error("No such schedule.")); return false; }
    if (busy()) { cb(new Error("Kurenai is busy — it will try again shortly.")); return false; }
    if (!KOS.ai.orchestrator) { cb(new Error("The assistant is not available.")); return false; }
    var now = new Date(), date = today(now), prevRun = s.lastRun;
    running = { id: s.id, startedAt: now.getTime() };
    emit();
    if (!opts.manual) { s.lastRun = date; s.updatedAt = Date.now(); store.save(); pushSoon(); }

    function finish(ok, text, conversationId) {
      var rec = get(id);
      running = null;
      if (rec) {
        rec.last = { date: date, at: Date.now(), ok: !!ok, text: clampText(text, TEXT_KEEP), conversationId: conversationId || null, manual: !!opts.manual };
        rec.updatedAt = Date.now();
        store.save();
        if (KOS.notify && KOS.notify.push) {
          KOS.notify.push({
            id: "asst:" + rec.id + ":" + date + (opts.manual ? ":" + Date.now().toString(36) : ""),
            kind: "assistant",
            title: ok ? "Kurenai · " + (rec.name || clampText(rec.prompt, 60)) : "Kurenai couldn't send “" + clampText(rec.name || rec.prompt, 50) + "”",
            body: clampText(plain(text), 280),
            view: "assistant",
            arg: { tab: "scheduled", run: rec.id }
          });
        }
      }
      emit();
      cb(ok ? null : new Error(text), rec);
    }

    function send(conversationId) {
      var reply = "", failed = null;
      var reqId = KOS.ai.orchestrator.send({
        userText: s.prompt,
        conversationId: conversationId || null,
        conversationKey: "sched:" + s.id + ":" + date,
        category: "complex",
        readOnly: true,
        isolated: true,
        scheduled: { id: s.id, time: s.time, name: s.name || null }
      }, {
        onText: function (p) { reply = p.text || reply; },
        onError: function (p) { failed = p.message || "The request failed."; },
        /* read-only: a confirmation can only mean a misconfigured tool —
           decline it rather than leave a request waiting on nobody */
        onConfirmationNeeded: function (card) {
          if (card && KOS.ai.orchestrator.reject) KOS.ai.orchestrator.reject(card.confirmationId, function () {});
        },
        onDone: function (p) {
          if (p.status === "complete" && reply) finish(true, reply, conversationId);
          else finish(false, failed || (p.status === "cancelled" ? "Cancelled." : "No reply came back."), conversationId);
        }
      });
      if (reqId === null) {
        /* the user's own request started in between: give the day back */
        if (!opts.manual) { s.lastRun = prevRun; store.save(); }
        running = null;
        emit();
        cb(new Error("Kurenai is busy — it will try again shortly."));
      }
    }

    var persist = KOS.ai.convo && KOS.ai.convo.available && KOS.ai.convo.available().persist;
    if (persist) {
      KOS.ai.convo.create(titleFor(s, now), function (err, convo) { send(!err && convo ? convo.id : null); });
    } else send(null);
    return true;
  }

  /* push the claim at once, so a second open device sees today is taken */
  function pushSoon() {
    if (KOS.cloudsync && KOS.cloudsync.noteChange) { try { KOS.cloudsync.noteChange(); } catch (e) { /* offline is fine */ } }
  }

  /* ---------------- the server's runs (roadmap 5.7, docs/server-runner-plan.md §4) ----
     With `state.notifyCloud.serverRuns` on, the server owns every
     schedule's run: a device never runs one itself (one owner, so a reply
     can never come twice) and takes the server's result in here — the
     day claimed, `last` kept, and the same `asst:` notification the push
     already showed, so the ledger and the push share one id. */
  function serverOwned() {
    var c = store.state.notifyCloud;
    return !!(c && c.on && c.serverRuns);
  }
  function applyServerRun(r) {
    var rec = get(r && r.schedule_id);
    if (!rec || !r.day || !r.text) return false;
    if (rec.last && rec.last.date === r.day && rec.last.server && rec.last.text === r.text) return false;
    if (!rec.lastRun || rec.lastRun < r.day) rec.lastRun = r.day;
    rec.last = { date: r.day, at: Date.parse(r.updated_at) || Date.now(), ok: !!r.ok, text: clampText(r.text, TEXT_KEEP), conversationId: null, server: true };
    rec.updatedAt = Date.now();
    store.save();
    if (KOS.notify && KOS.notify.push) {
      KOS.notify.push({
        id: "asst:" + rec.id + ":" + r.day, kind: "assistant",
        title: r.ok ? "Kurenai · " + (rec.name || clampText(rec.prompt, 60)) : "Kurenai couldn't send “" + clampText(rec.name || rec.prompt, 50) + "”",
        body: clampText(plain(r.text), 280), view: "assistant", arg: { tab: "scheduled", run: rec.id },
        ts: Date.parse(r.updated_at) || Date.now()
      });
    }
    emit();
    return true;
  }

  /* ---------------- the ticker ---------------- */
  function tick() {
    if (busy() || serverOwned()) return;
    var next = due()[0];
    if (!next) return;
    var signedIn = KOS.cloud && KOS.cloud.userId && KOS.cloud.userId() && KOS.cloudsync && KOS.cloudsync.syncNow;
    if (!signedIn) { run(next.id); return; }
    /* pull first: another device may already have claimed today */
    running = { id: next.id, syncing: true };
    KOS.cloudsync.syncNow(function () {
      running = null;
      if (isDue(get(next.id))) run(next.id);
    });
  }
  function start() {
    if (timer) return;
    timer = setInterval(tick, TICK_MS);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") setTimeout(tick, 1500); });
    }
    setTimeout(tick, 4000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  KOS.ai.schedule = {
    MAX: MAX,
    list: function () { return peek().slice(); },
    get: get, add: add, update: update, remove: remove,
    run: function (id, cb) { return run(id, { manual: true }, cb); },
    due: due, isDue: isDue, nextAt: nextAt, today: today,
    running: function () { return running; },
    tick: tick, start: start, stop: stop, onChange: onChange,
    serverOwned: serverOwned, applyServerRun: applyServerRun
  };
})();
