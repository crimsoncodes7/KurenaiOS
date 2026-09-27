/* Kurenai OS — modules/focus.js
   Build 2b: the Focus Timer (FR-5.1, FR-5.2, FR-5.3).

   State machine: idle → running ⇄ paused → completed | stopped-early,
   with the Pomodoro work/break auto-cycle as a sub-state (phase).

   Deterrent design (honest friction, not fake prevention):
   - beforeunload native confirm while the clock is RUNNING (not paused)
   - Page Visibility API: an unannounced tab-switch during a running WORK
     phase is a distraction — first is free, each further one nicks 2 HP
   - pause economy: first explicit pause free; each extra shaves 15% off the
     session's XP/gold (applied in governor.onSession)
   - ending early logs the session (marked incomplete) but forfeits the award

   Activity attribution: sessions.log tags entries created while a session is
   live with its focusId; the final focus entry summarises them (FR-3.2).

   Build 3i — READING SESSIONS reuse this exact state machine (kind:
   "reading", started from the Books module, optionally linked to a vault
   entry). Same clock, same pause/resume, same reload restore — but the
   GOVERNOR BOUNDARY flips to the Collection Matrix contract: the finished
   session logs type:"media" (module "books"), so it feeds the media XP/gold
   trickle, the rest streak and the reading heatmap, and NEVER the study
   streak. HP is untouched in either direction — the distraction HP nick is
   skipped entirely for reading (rest is allowed to be leisurely), and
   type:"media" awards 0 HP by the 3a contract in governor.onSession.

   Build 6.5 — THE SESSION, END TO END. Three surfaces around the same one
   state machine; nothing below changes what a session IS or what it pays.

     · Setup stays a short form: mode, duration, break, subject, topic,
       optional assignment, one objective line. The deal (award and every
       penalty) is quoted from KOS.governor.focusAward for the duration you
       actually picked, so the numbers on screen are the numbers you get.
     · Running keeps the clock dominant and adds only what a live session
       needs: the context it was started for, the objective, cycle progress,
       quick notes, a free self-marked distraction, and a live reward
       eligibility read. All of it lives in the persisted snapshot, so a
       reload restores the notes with the clock.
     · Completion opens a review AFTER the session has already been logged
       and paid. The record is never contingent on finishing the review:
       closing it, or never seeing it, loses nothing. It reports the real
       award (KOS.governor.lastAward), takes an objective result and one
       line of reflection, can move a linked assignment's progress, and can
       file the session's notes onto the topic or the assignment.

   FAIRNESS (the reason for store.flush + the unloading guard): a refresh or
   a navigation must never cost a session. On pagehide the live phase clock
   is banked and written synchronously, the unload's own visibilitychange is
   NOT counted as a distraction, and restore resumes paused with the time it
   had already run intact.                                                  */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var S = null;                 // the live session object (persisted snapshot)
  var timer = null;
  var stageEl = null, dockEl = null;
  var minimised = false;
  var pendingDistractToast = false;

  var DISTRACT_FREE = 1;        // unannounced tab-switches before HP nicks
  var DISTRACT_HP = 2;          // HP per distraction beyond the allowance
  var NOTE_CAP = 60;            // quick notes kept per session
  var NOTE_LEN = 400;           // characters kept per note
  /* roadmap 1.6 — the idle watch: a running study session nobody has
     touched for IDLE_WARN is warned about; IDLE_GRACE later, still
     untouched, it ends itself and credits only the focus that came before
     the last interaction */
  var IDLE_WARN = 30 * 60 * 1000;
  var IDLE_GRACE = 5 * 60 * 1000;
  var MODES = ["pomodoro", "custom", "stopwatch", "until"];
  var NUDGES = [0, 25, 50, 90];              // break nudge, minutes (0 = off)
  var LIMITS = [0, 60, 120, 180, 240];       // stopwatch self-stop, minutes (0 = none)

  /* Build 6.5 — set while the page is genuinely going away (refresh, close,
     an external navigation). The unload fires its own visibilitychange, and
     charging 2 HP for pressing F5 is exactly the kind of unfair loss the
     deterrent design is meant to avoid. */
  var unloading = false;

  function F() { return store.state.focus; }
  function now() { return Date.now(); }
  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function fmtLong(sec) {
    var m = Math.round(sec / 60);
    return m >= 60 ? Math.floor(m / 60) + "h " + (m % 60) + "m" : m + " min";
  }

  /* ---------------- state machine ---------------- */
  /* Stopwatch and Study-until have no interval: the work phase is open
     (a stopwatch ends on Stop, study-until at its clock time) */
  function openEnded(sess) { var x = sess || S; return !!x && (x.mode === "stopwatch" || x.mode === "until"); }
  function phaseTarget() {
    if (S.phase === "work" && openEnded()) return Infinity;
    return (S.phase === "work" ? S.workMin : S.breakMin) * 60;
  }
  function phaseElapsed() {
    return S.phaseAccum + (S.state === "running" ? (now() - S.phaseStartTs) / 1000 : 0);
  }
  function workSeconds() {
    if (!S) return 0;
    var cur = S.phase === "work" ? Math.min(phaseElapsed(), openEnded() ? Infinity : S.workMin * 60) : 0;
    return Math.floor(S.workAccum + cur);
  }
  function canComplete() {
    /* a Pomodoro (or custom-with-break) session may end ✓ at any point after
       the first completed work interval; custom no-break auto-completes.
       A stopwatch or a study-until session ends ✓ whenever you stop it —
       what it pays is the full 10-minute blocks it holds (invariant 4a). */
    if (!!S && openEnded()) return true;
    return !!S && S.cycles >= 1;
  }

  /* Build 6.5 — fill in fields a snapshot predating this build has no idea
     about. Restore reads whatever localStorage holds, so every consumer
     below can assume the arrays exist. */
  function hydrate(s) {
    if (!s) return s;
    if (typeof s.objective !== "string") s.objective = "";
    if (!Array.isArray(s.notes)) s.notes = [];
    if (!Array.isArray(s.marks)) s.marks = [];
    if (!Array.isArray(s.distractions)) s.distractions = [];
    if (typeof s.restores !== "number") s.restores = 0;
    if (typeof s.nudgeMin !== "number") s.nudgeMin = 0;
    if (typeof s.nudged !== "number") s.nudged = 0;
    if (typeof s.limitMin !== "number") s.limitMin = 0;
    if (s.assignmentId === undefined) s.assignmentId = null;
    /* roadmap 1.6: the idle watch's marks */
    if (typeof s.lastActiveTs !== "number") s.lastActiveTs = s.lastBeat || s.startedAt || now();
    if (typeof s.activeWork !== "number") s.activeWork = 0;
    if (typeof s.activeCycles !== "number") s.activeCycles = s.cycles || 0;
    if (s.idleWarnedAt === undefined) s.idleWarnedAt = null;
    /* roadmap 1.1: a snapshot from before topic links were a list */
    if (!Array.isArray(s.refs)) s.refs = s.subject && s.ref ? [s.subject + ":" + s.ref] : [];
    return s;
  }

  /* the live assignment record, resolved fresh every read — the session
     stores an id, never a copy, so a deleted assignment simply stops
     resolving instead of leaving a stale title on the stage */
  function linkedAssignment(sess) {
    var s = sess || S;
    if (!s || s.assignmentId == null || !KOS.assignments) return null;
    return KOS.assignments.get(s.assignmentId);
  }

  /* what completing RIGHT NOW would pay — the same arithmetic the governor
     pays from, asked without mutating anything */
  function eligibility() {
    if (!S || S.kind === "reading") return null;
    var secs = workSeconds();
    return KOS.governor.focusAward({
      complete: canComplete(), mins: Math.round(secs / 60), secs: secs, pauses: S.pauses,
      rule: KOS.governor.focusRule(S.mode), mode: S.mode
    });
  }

  /* roadmap 1.1: the topics a session is for. One subject per session
     (invariant 4a) — links outside it are dropped — and `ref` stays the
     first leaf they cover, which is what the ledger and the stage read. */
  function sessionLinks(cfg) {
    var raw = cfg.refs != null ? cfg.refs : (cfg.ref ? [cfg.ref] : []);
    var subject = cfg.subject || null;
    var refs = KOS.spec.normaliseRefs(raw, { subject: subject || undefined, max: 20 });
    if (!subject && refs.length) subject = KOS.spec.subjectsOf(refs)[0];
    refs = refs.filter(function (k) { return k.indexOf(subject + ":") === 0; });
    var first = KOS.spec.firstLeaf(refs);
    return { subject: subject, refs: refs, ref: first ? first.ref : null };
  }

  /* "HH:MM" → the next moment the clock reads it, at least a minute away
     (so 21:30 asked at 22:00 means tomorrow's 21:30 is NOT assumed — it is
     refused; asked at 23:00 for 01:00 it is the coming night). Pure. */
  function untilTarget(hhmm, fromTs) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
    if (!m || +m[1] > 23 || +m[2] > 59) return null;
    var from = fromTs != null ? fromTs : now();
    var d = new Date(from);
    d.setHours(+m[1], +m[2], 0, 0);
    var t = d.getTime();
    if (t - from < 60000) {
      /* earlier today: only a time after midnight rolls to tomorrow, and
         never more than 12 hours ahead — "study until" is not a schedule */
      d.setDate(d.getDate() + 1);
      t = d.getTime();
    }
    return t - from >= 60000 && t - from <= 12 * 3600000 ? t : null;
  }

  function start(cfg) {
    if (S) { KOS.ui.toast("A " + (S.kind === "reading" ? "reading" : "focus") + " session is already running.", true); return; }
    var f = F();
    var links = sessionLinks(cfg);
    var reading0 = cfg.kind === "reading";
    var mode = reading0 ? "custom" : (MODES.indexOf(cfg.mode) !== -1 ? cfg.mode : "pomodoro");
    var untilTs = null;
    if (mode === "until") {
      untilTs = untilTarget(cfg.until);
      if (!untilTs) { KOS.ui.toast("Pick a time between a minute and 12 hours from now.", true); return null; }
    }
    if (mode === "stopwatch" || mode === "until") { cfg.workMin = null; cfg.breakMin = 0; }
    /* frame 16a — the open-ended modes' two settings: a break NUDGE (a
       prompt every so often that never stops the clock) and, for the
       stopwatch, an optional limit so a forgotten one does not run all night */
    var nudgeMin = openEnded({ mode: mode }) && NUDGES.indexOf(+cfg.nudgeMin) !== -1 ? +cfg.nudgeMin : 0;
    var limitMin = mode === "stopwatch" && LIMITS.indexOf(+cfg.limitMin) !== -1 ? +cfg.limitMin : 0;
    S = f.active = {
      id: "f" + f.nextId++,
      kind: cfg.kind === "reading" ? "reading" : "study",   // 3i: one machine, two contracts
      mode: mode,                                       // "pomodoro" | "custom" | "stopwatch" | "until"
      until: mode === "until" ? String(cfg.until).trim() : null,
      untilTs: untilTs,                                 // study-until: the clock time it ends at
      workMin: cfg.workMin,
      breakMin: cfg.breakMin,                           // 0 = single interval
      nudgeMin: nudgeMin,                               // 0 = no break nudge
      nudged: 0,                                        // nudges already given
      limitMin: limitMin,                               // stopwatch: 0 = no limit
      subject: links.subject,
      ref: links.ref,
      refs: links.refs,
      /* Build 6.4 — the assignment this session is being spent on. Stored as
         an id only: the assignment record stays canonical, and a deleted
         assignment simply stops resolving rather than leaving a stale copy. */
      assignmentId: cfg.assignmentId != null ? cfg.assignmentId : null,
      book: cfg.book || null,                           // 3i: {id,title}|null — the linked vault entry
      /* Build 6.5 — the session's own working record. It rides the persisted
         snapshot, so a reload brings the notes back with the clock. */
      objective: String(cfg.objective || "").trim().slice(0, 200),
      notes: [],                                        // [{ts,text}] jotted while the clock ran
      marks: [],                                        // self-reported distractions — free, by design
      restores: 0,                                      // reload/navigation recoveries
      state: "running",
      phase: "work",
      phaseAccum: 0,
      phaseStartTs: now(),
      lastBeat: now(),
      workAccum: 0,
      cycles: 0,
      pauses: 0,
      distractions: [],
      startedAt: now(),
      /* roadmap 1.6 — the idle watch: the last interaction, and how much
         focus (and how many cycles) had been done by then */
      lastActiveTs: now(),
      activeWork: 0,
      activeCycles: 0,
      idleWarnedAt: null
    };
    if (S.kind === "reading") {
      f.lastReading = { workMin: cfg.workMin, bookId: cfg.book ? cfg.book.id : null };
    } else {
      var keepUntil = mode === "until" ? S.until : (f.lastConfig && f.lastConfig.until) || null;
      var prev = f.lastConfig || {};
      f.lastConfig = { mode: mode, workMin: cfg.workMin != null ? cfg.workMin : prev.workMin, breakMin: cfg.workMin != null ? cfg.breakMin : prev.breakMin,
        subject: links.subject || "", ref: links.ref || "", refs: links.refs };
      if (openEnded({ mode: mode })) f.lastConfig.nudgeMin = nudgeMin;
      else if (prev.nudgeMin != null) f.lastConfig.nudgeMin = prev.nudgeMin;
      if (mode === "stopwatch") f.lastConfig.limitMin = limitMin;
      else if (prev.limitMin != null) f.lastConfig.limitMin = prev.limitMin;
      /* the last study-until time is remembered, and only once there is one */
      if (keepUntil) f.lastConfig.until = keepUntil;
    }
    store.save();
    enterMode();
    timer = setInterval(tick, 1000);
    KOS.ui.toast(S.kind === "reading"
      ? "Reading session started — " + cfg.workMin + " min" + (cfg.book ? " with “" + cfg.book.title + "”" : "") + ". 読書."
      : mode === "stopwatch" ? "Stopwatch started — every full 10 minutes earns. 集中."
      : mode === "until" ? "Focus until " + S.until + " — every full 10 minutes earns. 集中."
      : "Focus session started — " + cfg.workMin + " min" +
        (cfg.breakMin ? " / " + cfg.breakMin + " min break" : "") + ". 集中.");
    return S;
  }

  function pause() {
    if (!S || S.state !== "running") return;
    S.phaseAccum = phaseElapsed();
    S.state = "paused";
    /* pause economy applies to focus time only — pausing a break is free */
    if (S.phase === "work") S.pauses++;
    store.save();
    render();
  }
  function resume() {
    if (!S || S.state !== "paused") return;
    S.phaseStartTs = now();
    S.lastBeat = now();
    S.state = "running";
    noteActivity(true);
    store.save();
    render();
  }

  /* ---------------- the session's working record (Build 6.5) ----------------
     Three small mutations on the live snapshot. None of them touches the
     governor: a note is a note, and owning up to a distraction must never
     cost more than staying quiet about it would. */
  function addNote(text) {
    if (!S) return null;
    var t = String(text || "").trim().slice(0, NOTE_LEN);
    if (!t) return null;
    S.notes = S.notes || [];
    S.notes.push({ ts: now(), text: t });
    if (S.notes.length > NOTE_CAP) S.notes.splice(0, S.notes.length - NOTE_CAP);
    store.save();
    return S.notes[S.notes.length - 1];
  }
  function removeNote(i) {
    if (!S || !S.notes || i < 0 || i >= S.notes.length) return;
    S.notes.splice(i, 1);
    store.save();
  }
  /* an honestly self-reported distraction. It is RECORDED but never charged:
     the HP nick exists to price an unannounced tab-switch, and pricing
     honesty as well would simply buy silence. */
  function markDistraction() {
    if (!S || S.kind === "reading") return;
    S.marks = S.marks || [];
    S.marks.push({ ts: now() });
    store.save();
    KOS.ui.toast("Noted — " + S.marks.length + " marked. No HP cost for owning it.");
    render();
  }
  function setObjective(text) {
    if (!S) return;
    S.objective = String(text || "").trim().slice(0, 200);
    store.save();
    render();
  }

  /* ---------------- the idle watch (roadmap 1.6) ----------------
     Any interaction with the app — a pointer, a key, a scroll, the tab
     coming back into view — restarts a 30-minute clock. A running study
     session that reaches it untouched is WARNED (a toast, and a "focus"
     notification that becomes a device alert when the page is not in
     front, invariant 98). Five minutes after the warning, still untouched,
     the session ENDS ITSELF and is logged and paid only for the focus done
     before the last interaction (`creditSecs`): the unattended 30 + 5
     minutes never count. Reading is rest and is never watched; a paused
     session accrues nothing and is not watched either. */
  function idleVerdict(at, lastActive, warnedAt) {
    if (warnedAt != null && at - warnedAt >= IDLE_GRACE) return "end";
    if (warnedAt == null && at - lastActive >= IDLE_WARN) return "warn";
    return "ok";
  }
  var lastNoted = 0;
  function noteActivity(force) {
    if (!S || S.kind === "reading") return;
    var t = now();
    /* a pointer sweep is one interaction — but nothing is throttled while a
       warning stands: the first sign of life must clear it */
    if (!force && S.idleWarnedAt == null && t - lastNoted < 5000) return;
    lastNoted = t;
    var warnId = S.idleWarnedAt != null ? "focus:idle:" + S.id + ":" + S.idleWarnedAt : null;
    S.lastActiveTs = t;
    S.activeWork = workSeconds();
    S.activeCycles = S.cycles;
    S.idleWarnedAt = null;
    if (warnId) {
      /* answered: the warning leaves the bell (frame 16k) and the stage
         carries on as if nothing happened */
      store.save();
      if (KOS.notify) KOS.notify.markRead(warnId);
      KOS.ui.toast("Still here — the focus clock carries on.");
      render();
    }
  }
  ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"].forEach(function (type) {
    document.addEventListener(type, function (e) {
      /* while the warning stands, only a deliberate act answers it: a
         sweep of the mouse towards "End now" must not dismiss it, and
         "End now" itself is not "I'm here" */
      if (S && S.idleWarnedAt != null) {
        if (type === "pointermove") return;
        var t = e.target;
        if (t && t.closest && t.closest("[data-ui~='focus.idle-end']")) return;
      }
      noteActivity(false);
    }, { capture: true, passive: true });
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") noteActivity(true);
  });
  /* one step of the watch; true when it ended the session */
  function idleCheck() {
    if (!S || S.kind === "reading" || S.state !== "running") return false;
    var v = idleVerdict(now(), S.lastActiveTs, S.idleWarnedAt);
    if (v === "warn") {
      S.idleWarnedAt = now();
      store.save();
      var mins = Math.round(IDLE_WARN / 60000), grace = Math.round(IDLE_GRACE / 60000);
      KOS.ui.toast("Still studying? Nothing has moved for " + mins + " minutes — the session ends in " + grace + " unless you touch the app.", true);
      render();
      if (KOS.a11y) KOS.a11y.announce("Focus session: no activity for " + mins + " minutes. It ends in " + grace + " minutes.", "assertive");
      if (KOS.notify) KOS.notify.push({ id: "focus:idle:" + S.id + ":" + S.idleWarnedAt, kind: "focus",
        title: "Still studying? Your focus session ends at " + hmOf(S.idleWarnedAt + IDLE_GRACE),
        body: MODE_LABEL[S.mode] + (S.subject ? " · " + shortName(S.subject) + (S.ref ? " " + S.ref : "") : "") + " · no activity since " + hmOf(S.lastActiveTs) });
      return false;
    }
    if (v === "end") {
      var sid = S.id, credit = S.activeWork;
      if (KOS.notify) {
        /* the warning above it is settled: marked read as the end lands */
        if (S.idleWarnedAt != null) KOS.notify.markRead("focus:idle:" + sid + ":" + S.idleWarnedAt);
        KOS.notify.push({ id: "focus:ended:" + sid, kind: "focus",
          title: "Focus session ended by the idle watch · paid " + fmtLong(credit),
          body: MODE_LABEL[S.mode] + " · " + hmOf(S.startedAt) + " → " + hmOf(now()) });
      }
      /* the review waits on screen for the return (frame 16j) */
      finish(true, { creditSecs: credit, creditCycles: S.activeCycles, ended: "idle" });
      return true;
    }
    return false;
  }

  function tick() {
    if (!S || S.state !== "running") return;
    /* study-until: the clock time is the end, whatever the pauses cost */
    if (S.mode === "until" && S.untilTs && now() >= S.untilTs) {
      S.phaseAccum += Math.max(0, (S.untilTs - S.phaseStartTs) / 1000);
      S.phaseStartTs = now();
      S.state = "paused";                 // the clock is banked; nothing more accrues
      finish(true, { ended: "until" });
      return;
    }
    if (idleCheck()) return;
    if (S.phase === "work" && openEnded()) {
      var w = workSeconds();
      /* a stopwatch with a limit stops itself there, paid like a Stop */
      if (S.limitMin && w >= S.limitMin * 60) { finish(true, { ended: "limit" }); return; }
      /* the break nudge: a chime and one line, never a stop */
      if (S.nudgeMin && Math.floor(w / (S.nudgeMin * 60)) > (S.nudged || 0)) {
        S.nudged = Math.floor(w / (S.nudgeMin * 60));
        chime();
        KOS.ui.toast(fmtLong(w) + " in — a short break? The clock keeps going until you pause.");
        store.save();
      }
    }
    if (phaseElapsed() >= phaseTarget()) {
      if (S.phase === "work") {
        S.workAccum += S.workMin * 60;
        S.cycles++;
        if (S.breakMin > 0) {
          S.phase = "break";
          S.phaseAccum = 0; S.phaseStartTs = now();
          chime();
          KOS.ui.toast("Cycle " + S.cycles + " complete — " + S.breakMin + " min break. End here to bank it, or keep going.");
          store.save();
          render();
        } else {
          /* the interval was just banked into workAccum — zero the live
             phase clock so workSeconds() doesn't count it twice */
          S.phaseAccum = 0; S.phaseStartTs = now();
          finish(true);                       // custom, no break: done at target
          return;
        }
      } else {
        S.phase = "work";
        S.phaseAccum = 0; S.phaseStartTs = now();
        chime();
        KOS.ui.toast("Break over — back to focus.");
        store.save();
        render();
      }
    }
    /* heartbeat so a reload can restore the clock to within ~10 s */
    if (now() - S.lastBeat > 10000) { S.lastBeat = now(); store.save(); }
    updateClock();
  }

  function endEarly(opts) {
    if (!S) return;
    /* Category 6: a caller that has ALREADY gathered the user's deliberate
       early-end decision (the assistant's explicit early:true) skips the
       modal — same finish path, no second ask. The UI keeps the modal. */
    if (opts && opts.confirmed) { finish(false, opts); return; }
    KOS.ui.confirm({ title: "End early?", confirm: "End session",
      body: S.kind === "reading"
        ? "The time you read still gets logged — nothing is forfeited, reading is rest."
        : KOS.governor.focusRule(S.mode) === "blocks"
          ? "It is logged, and you keep the award for every full 10 minutes already done."
          : "It still gets logged — the data point matters — but the XP and gold award is forfeited." },
      function () { finish(false, opts); });
  }
  function endComplete(opts) {
    if (!S || !canComplete()) return;
    finish(true, opts);
  }

  /* opts.review === false suppresses the completion review — for callers that
     are not the user at the stage (the assistant's tools report the outcome
     in the conversation instead). The session is logged and paid either way:
     the review is never the thing that makes a session count. */
  function finish(complete, opts) {
    opts = opts || {};
    /* capture everything BEFORE clearing the session, so the log entry the
       focus session writes doesn't attribute to itself */
    var sess = S;
    var dur = workSeconds();
    var cycles = sess.cycles;
    var endedAs = opts.ended || (complete ? "complete" : "early");
    /* the idle watch ended it: credit only what came before the last
       interaction — the untouched 30 + 5 minutes are not focus */
    if (opts.creditSecs != null) {
      dur = Math.min(dur, Math.max(0, Math.floor(opts.creditSecs)));
      if (opts.creditCycles != null) cycles = Math.min(cycles, opts.creditCycles);
      if (sess.mode === "pomodoro" || (sess.mode === "custom" && sess.breakMin > 0)) complete = cycles >= 1;
    }
    var rule = sess.kind === "reading" ? null : KOS.governor.focusRule(sess.mode);
    /* under the blocks rule the session is complete (streak-worthy) when it
       holds a full block, however it ended — ending early keeps them */
    if (rule === "blocks") complete = Math.floor(dur / KOS.governor.FOCUS_BLOCK.secs) >= 1;
    clearInterval(timer); timer = null;
    S = null;
    F().active = null;
    store.save();
    exitMode();

    /* 3i — reading sessions log under the COLLECTION MATRIX contract:
       type "media", module "books" (same shape as KOS.media.logActivity,
       plus the duration this timer actually measured). That single entry
       feeds the media trickle (+4 XP/+1 gold, 0 HP), the rest streak and
       the Books reading heatmap — and is invisible to the study streak
       and the HP day-drain by the sessions.js rules. No forfeit on an
       early end: rest is not study, there is no award to forfeit beyond
       the flat trickle. */
    if (sess.kind === "reading") {
      KOS.sessions.log({
        type: "media", subject: null, ref: null, dur: dur,
        metrics: {
          module: "books",
          entryId: sess.book ? sess.book.id : null,
          title: sess.book ? sess.book.title : null,
          action: "reading-session",
          mins: Math.round(dur / 60),
          complete: complete
        }
      });
      KOS.ui.toast("Reading session logged — " + fmtLong(dur) +
        (sess.book ? " with “" + sess.book.title + "”" : "") + ".");
      KOS.refreshHUD();
      if (KOS.refreshRailCounters) KOS.refreshRailCounters();
      if (store.state.ui.view === "books") KOS.show("books", undefined, { _nav: true });
      return;
    }

    /* activity attribution summary (FR-3.2's "activities done") */
    var acts = KOS.sessions.all().filter(function (e) { return e.focusId === sess.id; });
    var counts = { cards: 0, reviews: 0, quizzes: 0, exams: 0, todos: 0 };
    acts.forEach(function (e) {
      if (e.type === "flashcards" || e.type === "due-review") {
        counts.reviews++; counts.cards += (e.metrics.cards || 0);
      }
      else if (e.type === "quiz") counts.quizzes++;
      else if (e.type === "exam") counts.exams++;
      else if (e.type === "todo") counts.todos++;
    });
    var bits = [];
    if (counts.cards) bits.push(counts.cards + " flashcard" + (counts.cards === 1 ? "" : "s") + " reviewed");
    if (counts.quizzes) bits.push(counts.quizzes + " quiz attempt" + (counts.quizzes === 1 ? "" : "s"));
    if (counts.exams) bits.push(counts.exams + " exam Q self-marked");
    if (counts.todos) bits.push(counts.todos + " to-do item" + (counts.todos === 1 ? "" : "s"));
    var summary = bits.length ? bits.join(", ") : "timer only";

    /* Build 6.4 — a completed session linked to an assignment banks its
       minutes as actual effort. Only COMPLETE sessions count: an abandoned
       session forfeits its award, and it should not quietly inflate effort
       either. */
    if (complete && sess.assignmentId != null && KOS.assignments) {
      KOS.assignments.addEffort(sess.assignmentId, Math.round(dur / 60));
    }
    /* The record is written HERE, before any review is offered, and the
       governor pays off this one entry. Everything the review collects is a
       later annotation on it — never a second reward, and never a
       precondition for the session having happened. */
    var entry = KOS.sessions.log({
      type: "focus",
      subject: sess.subject, ref: sess.ref, refs: sess.refs,
      dur: dur,
      metrics: {
        complete: complete,
        mode: sess.mode,
        rule: rule,
        secs: dur,
        blocks: rule === "blocks" ? Math.floor(dur / KOS.governor.FOCUS_BLOCK.secs) : undefined,
        until: sess.until || undefined,
        ended: endedAs,
        mins: Math.round(dur / 60),
        cycles: cycles,
        pauses: sess.pauses,
        distractions: sess.distractions.length,
        /* deliberately NOT "marks": that key already means exam marks on
           tracker entries, and the Governor chronicle reads it generically */
        selfMarks: (sess.marks || []).length,
        restores: sess.restores || 0,
        notes: (sess.notes || []).length,
        objective: sess.objective || undefined,
        activities: counts,
        assignmentId: sess.assignmentId != null ? sess.assignmentId : undefined,
        summary: summary
      }
    });
    var award = KOS.governor.lastAward ? KOS.governor.lastAward() : null;

    KOS.refreshHUD();
    if (KOS.refreshRailCounters) KOS.refreshRailCounters();

    /* calendar hook: a completed linked session can tick today's matching
       study block in the daily to-do. When the review is on screen it is one
       of its checkboxes rather than a second stacked modal; when the review
       is suppressed the original confirm still asks. */
    var block = complete && sess.subject ? openStudyBlock(sess) : null;

    if (opts.review !== false && !window.__kosAutoConfirm) {
      reviewModal(sess, entry, award, block);
    } else {
      if (block) offerBlockTick(block);
      refreshAfterSession();
    }
  }

  function refreshAfterSession() {
    /* if the user was sitting on the focus start view, refresh it */
    if (store.state.ui.view === "focus") KOS.show("focus", undefined, { _nav: true });
  }

  /* today's un-ticked study block matching this session, if any */
  function openStudyBlock(sess) {
    if (!KOS.calendar || !KOS.calendar.eventsOn) return null;
    var today = KOS.srs.todayISO();
    var blocks = KOS.calendar.eventsOn(today).filter(function (e) {
      return e.type === "study" && e.subject === sess.subject &&
        (!sess.ref || !e.ref || e.ref === sess.ref);
    });
    var t = store.state.todo;
    return blocks.find(function (e) { return !t.autoChecked[today + "|blk" + e.id]; }) || null;
  }
  function tickStudyBlock(ev) {
    var today = KOS.srs.todayISO();
    store.state.todo.autoChecked[today + "|blk" + ev.id] = true;
    store.save();
  }
  function offerBlockTick(open) {
    KOS.ui.confirm({ title: "Study block done?", body: "Mark today's study block “" + open.title + "” as done?", confirm: "Mark done" }, function () {
      tickStudyBlock(open);
      KOS.ui.toast("Study block ticked off.");
    });
  }

  /* ---------------- deterrents ---------------- */
  /* Build 6.5 — bank the live phase clock and write it SYNCHRONOUSLY. The
     ordinary save is debounced by 120 ms and the page may not live that
     long, so without this a refresh could quietly shave the last seconds
     off a session. Deliberately NOT pause(): a reload is not a pause and
     must not be charged as one. */
  function bankForUnload() {
    unloading = true;
    if (!S) return;
    if (S.state === "running") {
      S.phaseAccum = phaseElapsed();
      S.phaseStartTs = now();
      S.lastBeat = now();
    }
    if (store.flush) store.flush(); else store.save();
  }
  /* native leave-confirmation while the clock is actually running */
  window.addEventListener("beforeunload", function (e) {
    bankForUnload();
    if (S && S.state === "running") {
      e.preventDefault();
      e.returnValue = "";
    }
  });
  /* pagehide fires where beforeunload does not (bfcache, mobile Safari). A
     page that comes back out of the bfcache is not unloading after all. */
  window.addEventListener("pagehide", bankForUnload);
  window.addEventListener("pageshow", function () { unloading = false; });

  /* unannounced tab-switch during a running WORK phase = distraction.
     Reading sessions are exempt WHOLESALE (3i): no logging, no HP nick —
     the Collection Matrix contract forbids this module's activities from
     ever touching HP, and rest doesn't owe anyone its attention.

     The HP nick itself is opt-out (F().penalizeDistractions, toggled in
     setup): switching to look something up — a video, an AI chat, a
     reference site — is not the same failure mode this deterrent was built
     for, and the browser can never tell one destination from another, so
     the honest fix is to let the user say whether the friction applies to
     them at all rather than fake a site-by-site distinction it can't make.
     The switch is still counted either way, just never charged when off. */
  document.addEventListener("visibilitychange", function () {
    /* Build 6.5 — the page going away fires this too. Charging HP for a
       refresh, a closed tab or an OS-level navigation is a penalty for
       something that isn't a distraction, so the unload is exempt. */
    if (unloading) return;
    if (!S || S.kind === "reading" || S.state !== "running" || S.phase !== "work") {
      pendingDistractToast = false;
      return;
    }
    if (document.visibilityState === "hidden") {
      S.distractions.push(now());
      var charge = F().penalizeDistractions !== false && S.distractions.length > DISTRACT_FREE;
      if (charge) KOS.governor.drainHp(DISTRACT_HP);
      pendingDistractToast = true;
      store.save();
    } else if (pendingDistractToast) {
      pendingDistractToast = false;
      var n = S.distractions.length;
      var willCharge = F().penalizeDistractions !== false;
      KOS.ui.toast("Distraction #" + n + " logged" +
        (!willCharge ? " — HP penalty is off" : n > DISTRACT_FREE ? " · −" + DISTRACT_HP + " HP" : " — first one's free"),
        willCharge && n > DISTRACT_FREE);
      render();
    }
  });

  function chime() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      chime.ctx = chime.ctx || new AC();
      var ctx = chime.ctx;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = 660;
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.75);
    } catch (e) { /* audio unavailable — the toast carries the signal */ }
  }

  /* ---------------- Focus Mode UI (FR-5.3) ----------------
     Graphite (frame 10b): the stage is three columns around one ring —
     what this hour is for on the left, the clock in the middle, the notes
     you keep on the right — with the cycles as a segmented bar beneath. */
  function subjectName(sid) { return KOS_DATA[sid] ? KOS_DATA[sid].name : sid; }
  function shortName(sid) { return ({ compsci: "CS", maths: "Maths", it: "IT" })[sid] || subjectName(sid); }
  function hue(sid) { return "var(--" + ({ compsci: "cs", maths: "maths", it: "it" }[sid] || "muted") + ")"; }
  function topicLabel() {
    if (S && S.kind === "reading") return S.book ? S.book.title : "Reading — no book linked";
    if (!S || !S.subject) return "General study";
    var name = subjectName(S.subject);
    if (S.ref && KOS.hub.BYREF[S.subject] && KOS.hub.BYREF[S.subject][S.ref]) {
      return name + " · " + S.ref + " " + KOS.hub.BYREF[S.subject][S.ref].title;
    }
    return name;
  }
  function clockAt(sec) {
    var d = new Date(now() + Math.max(0, sec) * 1000);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  /* the award ticks (frames 16a, 16c, 16f): n segments of 10 minutes,
     the first `full` earned, the next one `part`% of the way, labelled
     0, 10, 20 … under the row when `labels` */
  function tickRow(n, full, part, labels) {
    var row = el("div", { class: "k-fx-ticks", "data-ui": "focus.ticks", "aria-hidden": "true" });
    var bar = el("div", { class: "k-fx-tick-bar" });
    for (var i = 0; i < n; i++) {
      var seg = el("span", { class: "k-fx-tick" });
      if (i < full) KOS.ui.state(seg, "done", true);
      else if (i === full && part != null) { KOS.ui.state(seg, "live", true); seg.style.setProperty("--pct", Math.round(part) + "%"); }
      bar.appendChild(seg);
    }
    row.appendChild(bar);
    if (labels) {
      var lab = el("div", { class: "k-fx-tick-lab k-mono" });
      for (var j = 0; j <= n; j++) lab.appendChild(el("span", { text: String(j * 10) }));
      row.appendChild(lab);
    }
    return row;
  }
  function chip(text, c, hook) {
    var n = el("span", { class: "k-chip", "data-ui": hook || null, text: text });
    if (c) n.style.setProperty("--chip-c", c);
    return n;
  }

  /* the context this session was started for: subject, topic, assignment */
  function contextNode() {
    var box = el("div", { class: "k-fx-ctx" });
    var topic = el("div", { class: "k-cluster", "data-ui": "focus.topic", "aria-label": topicLabel() });
    if (S.kind === "reading") topic.appendChild(chip(topicLabel()));
    else if (!S.subject) topic.appendChild(chip("General study"));
    else {
      topic.appendChild(chip(subjectName(S.subject), hue(S.subject)));
      /* the ref alone: the full title rides the label (frame 16c) */
      if (S.ref) {
        var rc = chip(S.ref);
        var leaf = KOS.hub.BYREF[S.subject] && KOS.hub.BYREF[S.subject][S.ref];
        if (leaf) rc.title = S.ref + " " + leaf.title;
        topic.appendChild(rc);
      }
    }
    box.appendChild(topic);
    var asg = linkedAssignment();
    if (asg) {
      box.appendChild(el("div", { class: "k-cluster", "data-ui": "focus.context" }, [
        chip("課 " + asg.title, "var(--amber)"),
        asg.due ? chip("due " + asg.due) : null
      ].filter(Boolean)));
    }
    return box;
  }

  /* the cycles as a segmented bar — banked, live, still to come */
  function progressNode() {
    var single = !(S.breakMin > 0);
    var live = S.phase === "work" ? 1 : 0;
    var count = single ? 1 : Math.min(12, Math.max(4, S.cycles + live));
    var bar = el("div", { class: "k-fx-segs", "aria-hidden": "true" });
    for (var i = 0; i < count; i++) {
      var seg = el("span", { class: "k-fx-seg" });
      if (i < S.cycles) KOS.ui.state(seg, "done", true);
      else if (i === S.cycles && live) { KOS.ui.state(seg, "live", true); seg.setAttribute("data-live", ""); }
      bar.appendChild(seg);
    }
    var banked = S.cycles
      ? S.cycles + " cycle" + (S.cycles === 1 ? "" : "s") + " banked"
      : (single ? "single interval" : "first cycle in progress");
    return el("div", { class: "k-fx-progress", "data-ui": "focus.progress", role: "status" }, [
      bar, el("span", { class: "sr-only", text: banked + (S.cycles > 12 ? " (+" + (S.cycles - 12) + ")" : "") })
    ]);
  }

  /* reward eligibility — the live read of the same arithmetic the governor
     pays from, so ending is never a guess */
  function eligibilityNode() {
    var e = eligibility();
    if (!e) return null;
    if (e.rule === "blocks" && !e.blocks) {
      return el("div", { class: "k-fx-elig", "data-ui": "focus.elig", role: "status" }, [
        el("b", { text: "Nothing banked yet" }),
        el("span", { text: "The first award lands at 10 minutes, then one every 10." })
      ]);
    }
    if (e.forfeited) {
      return el("div", { class: "k-fx-elig", "data-ui": "focus.elig", "data-state": "warn", role: "status" }, [
        el("b", { text: "Ending now forfeits the award" }),
        el("span", { text: S.breakMin > 0
          ? "Finish this " + S.workMin + "-minute cycle and it banks in full."
          : "Let the interval run out and it completes itself." })
      ]);
    }
    return el("div", { class: "k-fx-elig", "data-ui": "focus.elig", role: "status" }, [
      el("b", { text: "Ending now pays +" + e.xp + " XP · +" + e.gold + " gold · +" + e.hp + " HP" }),
      el("span", { text: e.extraPauses
        ? e.extraPauses + " extra pause" + (e.extraPauses > 1 ? "s" : "") + " already cost " + e.penaltyPct + "%"
        : "one pause is still free" })
    ]);
  }

  /* the right column: quick notes, kept with the session */
  function notesNode() {
    var notes = S.notes || [];
    var col = el("div", { class: "k-fx-col k-fx-notes" }, [el("div", { class: "k-kicker", text: "Quick notes" + (notes.length ? " · " + notes.length : "") })]);
    if (notes.length) {
      var list = el("ul", { class: "k-fx-note-list", "data-ui": "focus.notes", "aria-label": notes.length + " note" + (notes.length === 1 ? "" : "s") + " kept" });
      notes.forEach(function (n, i) {
        list.appendChild(el("li", { class: "k-fx-note" }, [
          el("span", { text: n.text }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "focus.remove-note", text: "✕", "aria-label": "Remove note",
            onclick: function () { removeNote(i); render(); } })
        ]));
      });
      col.appendChild(list);
    }
    var input = el("input", { type: "text", class: "k-input k-fx-note-in", "data-ui": "focus.note-in", maxlength: String(NOTE_LEN),
      placeholder: "Quick note…  (⏎ to keep)", "aria-label": "Quick note",
      onkeydown: function (ev) {
        if (ev.key !== "Enter") return;
        if (addNote(input.value)) { input.value = ""; render(); focusNoteInput(); }
      } });
    col.appendChild(input);
    return col;
  }
  function focusNoteInput() {
    var i = stageEl && stageEl.querySelector("[data-ui~='focus.note-in']");
    if (i) i.focus();
  }

  function dialogShell(title, body, foot) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    overlay.appendChild(el("div", { class: "k-dialog", "data-ui": "ui.dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })
      ]),
      el("div", { class: "k-dialog-body" }, body),
      el("div", { class: "k-dialog-foot" }, foot)
    ]));
    return overlay;
  }

  /* the objective — one line, editable at any point without stopping */
  function promptObjective() {
    if (!S) return;
    var input = el("input", { type: "text", class: "k-input", maxlength: "200",
      placeholder: "What is this session for?", "aria-label": "Session objective",
      onkeydown: function (ev) { if (ev.key === "Enter") save(); } });
    input.value = S.objective || "";
    var overlay = dialogShell("Session objective", [
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "One line — it rides the session record" }), input])
    ], [
      el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { overlay.close(); } }),
      el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save", onclick: save })
    ]);
    function save() { setObjective(input.value); overlay.close(); }
    KOS.ui.openDialog(overlay);
    input.focus();
  }

  /* the phone composes the running session differently (frames 15f, 16i):
     the stage stacks, and minimised it is a two-row dock over the tab bar
     rather than the floating player */
  var phoneMQ = window.matchMedia ? window.matchMedia("(max-width: 700px)") : null;
  function isPhone() { return !!(phoneMQ && phoneMQ.matches); }
  if (phoneMQ && phoneMQ.addEventListener) phoneMQ.addEventListener("change", function () { if (S) render(); });

  function enterMode() {
    /* the hook for "a session owns the screen": stage | minimised */
    document.documentElement.setAttribute("data-focus", "stage");
    minimised = false;
    stageEl = el("div", { class: "k-fx-stage", "data-ui": "focus.stage", role: "dialog", "aria-label": "Focus session" });
    dockEl = el("div", { class: "k-fx-dock", "data-ui": "focus.dock", role: "region", "aria-label": "Focus timer" });
    document.body.appendChild(stageEl);
    document.body.appendChild(dockEl);
    render();
  }
  function exitMode() {
    document.documentElement.removeAttribute("data-focus");
    document.documentElement.removeAttribute("data-fx-drag");
    if (stageEl) { stageEl.remove(); stageEl = null; }
    if (dockEl) { dockEl.remove(); dockEl = null; }
    if (dragUi) { dragUi.remove(); dragUi = null; }
    document.title = "Kurenai OS — Study Atelier";
  }
  function setMinimised(v) {
    minimised = v;
    if (document.documentElement.hasAttribute("data-focus"))
      document.documentElement.setAttribute("data-focus", v ? "minimised" : "stage");
    if (v) placeMini();
    /* the setup page under a live session says so instead of offering a second start */
    if (v && store.state.ui.view === "focus") KOS.rerender();
  }

  /* the clock, whatever the mode: a countdown to the interval's end, the
     time so far on a stopwatch (the ring fills towards the next 10-minute
     award), or the time left until a study-until session's clock time */
  function clockRead() {
    var el0 = phaseElapsed();
    var blk = KOS.governor.FOCUS_BLOCK.secs, w = workSeconds();
    var nextIn = blk - (w % blk);
    if (S.phase === "work" && S.mode === "stopwatch") {
      return { text: fmtClock(w), label: "Time so far", pct: Math.round(100 * (w % blk) / blk),
        at: "next award in " + fmt(nextIn), nextIn: nextIn };
    }
    if (S.phase === "work" && S.mode === "until") {
      var left = Math.max(0, (S.untilTs - now()) / 1000), span = Math.max(1, (S.untilTs - S.startedAt) / 1000);
      return { text: fmtClock(left), label: "Time left", pct: Math.min(100, Math.round(100 * (1 - left / span))),
        at: "ends at " + S.until + " · next award in " + fmt(nextIn), nextIn: nextIn };
    }
    var remain = phaseTarget() - el0;
    return { text: fmt(remain), label: "Time left", pct: Math.min(100, Math.round(100 * el0 / phaseTarget())), remain: remain,
      nextIn: paidRule() ? nextIn : null,
      at: S.phase === "break" ? "focus at " + clockAt(remain) : S.breakMin > 0 ? "break at " + clockAt(remain) : "ends at " + clockAt(remain) };
  }

  /* ---- small reads the three surfaces share ---- */
  function paidRule() { return !!S && S.kind !== "reading" && KOS.governor.focusRule(S.mode) === "blocks"; }
  var MODE_LABEL = { pomodoro: "Pomodoro", custom: "Custom", stopwatch: "Stopwatch", until: "Study until" };
  function modeLabel() { return S.kind === "reading" ? "Reading" : MODE_LABEL[S.mode] || "Focus"; }
  function hmOf(ts) { var d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  function awardText(e) { return "+" + e.xp + " XP · +" + e.gold + " gold"; }
  function nextAwardText() {
    var B = KOS.governor.FOCUS_BLOCK;
    return "+" + B.xp + " XP · +" + B.gold + " gold";
  }
  /* the idle watch's warning is live: a running study session, warned,
     not yet answered */
  function idleWarned() { return !!S && S.kind !== "reading" && S.state === "running" && S.idleWarnedAt != null; }
  function idleLeft() { return Math.max(0, (S.idleWarnedAt + IDLE_GRACE - now()) / 1000); }
  function idleLine() {
    return "Ends at " + hmOf(S.idleWarnedAt + IDLE_GRACE) + " · pays up to " + hmOf(S.lastActiveTs);
  }
  function idleWarnId() { return S && S.idleWarnedAt != null ? "focus:idle:" + S.id + ":" + S.idleWarnedAt : null; }
  function imHere() {
    var id = idleWarnId();
    noteActivity(true);
    if (id && KOS.notify) KOS.notify.markRead(id);
    render();
  }
  function idleEndNow() {
    if (!S) return;
    var id = idleWarnId();
    if (id && KOS.notify) KOS.notify.markRead(id);
    finish(true, { creditSecs: S.activeWork, creditCycles: S.activeCycles, ended: "idle" });
  }
  function stopNow() {
    if (!S) return;
    /* the time-paid modes: Stop keeps every full 10 minutes, as ending
       early always did under the blocks rule */
    finish(true);
  }
  function countdownRing(hook) {
    return el("div", { class: "k-fx-cd", "data-ui": hook, role: "timer", "aria-label": "Time before the session ends itself" }, [
      el("span", { class: "k-fx-cd-t k-mono", "data-ui": "focus.idle-left", text: fmt(idleLeft()) })
    ]);
  }

  /* earned so far, for the modes that pay by time: the total, this hour's
     six ticks and when the next award lands */
  var renderedBlocks = -1;
  function earnedNode(compact) {
    var e = eligibility() || { xp: 0, gold: 0, blocks: 0 };
    var w = workSeconds(), blk = KOS.governor.FOCUS_BLOCK.secs;
    var blocks = Math.floor(w / blk), base = Math.floor(blocks / 6) * 6;
    renderedBlocks = blocks;
    var nextAt = (blocks + 1) * blk;
    var box = el("div", { class: "k-fx-earned", "data-ui": "focus.elig focus.progress", role: "status" });
    box.appendChild(el("div", { class: "k-fx-earned-head" }, [
      el("span", { class: "k-kicker", text: "Earned so far" }),
      el("b", { class: "k-mono", text: blocks ? awardText(e) : "nothing yet" })
    ]));
    var ticks = tickRow(6, blocks - base, 100 * (w % blk) / blk, !compact);
    if (base && !compact) ticks.querySelectorAll(".k-fx-tick-lab > span").forEach(function (s, i) { s.textContent = String((base + i) * 10); });
    box.appendChild(ticks);
    box.appendChild(el("span", { class: "k-fx-earned-foot", text: blocks
      ? blocks + " award" + (blocks === 1 ? "" : "s") + " · the next lands at " + fmtClock(nextAt)
      : "the first award lands at " + fmtClock(nextAt) }));
    if (e.extraPauses) box.appendChild(el("span", { class: "k-fx-earned-foot", "data-tone": "warn", text: e.extraPauses + " extra pause" + (e.extraPauses > 1 ? "s" : "") + " · −" + e.penaltyPct + "%" }));
    return box;
  }
  /* a length of focus as the clock shows it: 50:00, 1:10:00 */
  function fmtClock(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600);
    return h ? h + ":" + fmt(sec - h * 3600) : fmt(sec);
  }

  function render() {
    if (!S || !stageEl) return;
    var paused = S.state === "paused";
    var onBreak = S.phase === "break";
    var reading = S.kind === "reading";
    var paid = paidRule();
    var open = openEnded();
    var warned = idleWarned();
    var phase = paused ? "paused" : onBreak ? "break" : "work";
    var cycleNo = S.cycles + (S.phase === "work" ? 1 : 0);
    var phaseName = paused ? "Paused" : onBreak ? "Break" : reading ? "Reading"
      : S.mode === "stopwatch" ? "Stopwatch · counting up"
      : S.mode === "until" ? "Study until " + S.until
      : paid && !(S.breakMin > 0) ? "Focus" : "Focus · cycle " + cycleNo;

    /* ---- full stage ---- */
    stageEl.innerHTML = "";
    stageEl.setAttribute("data-phase", phase);
    stageEl.setAttribute("data-kind", reading ? "reading" : "study");
    stageEl.setAttribute("data-rule", paid ? "blocks" : "cycle");
    if (warned) stageEl.setAttribute("data-idle", "warn"); else stageEl.removeAttribute("data-idle");

    var cr = clockRead();
    /* Stop for the open-ended modes; End early only where there is still
       a cycle to forfeit or an interval to cut short */
    var endEarlyBtn = open ? null : el("button", { type: "button", class: "k-btn k-btn--sm k-fx-end", "data-ui": "focus.end-early", text: "End early",
      title: reading ? "Logs the time read — nothing forfeited"
        : paid ? "Logs the session and keeps every full 10 minutes"
        : "Logs the session but forfeits the award", onclick: function () { endEarly(); } });
    stageEl.appendChild(el("div", { class: "k-fx-top" }, [
      el("img", { class: "k-fx-logo", src: "assets/brand/kurenai-bloom.png", alt: "" }),
      el("span", { class: "k-fx-top-t", text: (reading ? "Reading session · " : "Focus session · ") + modeLabel() +
        (S.mode === "pomodoro" || (S.mode === "custom" && !reading) ? " " + S.workMin + " / " + (S.breakMin || "–") : "") }),
      el("span", { class: "k-spacer" }),
      endEarlyBtn,
      el("button", { type: "button", class: "k-btn k-btn--sm k-fx-min", "data-ui": "focus.minimise",
        "aria-label": "Minimise the timer", title: reading ? "Minimise the clock" : "Minimise the timer and study in the app",
        onclick: function () { setMinimised(true); } }, [el("span", { "aria-hidden": "true", text: "⤡" }), el("span", { class: "k-btn-label", text: " Minimise" })])
    ].filter(Boolean)));

    /* ---- left: what this hour is for ---- */
    var left = el("div", { class: "k-fx-col k-fx-left" });
    var what = el("div", { class: "k-fx-what" });
    if (!reading) {
      what.appendChild(el("div", { class: "k-kicker", text: "Objective" }));
      what.appendChild(S.objective
        ? el("button", { type: "button", class: "k-fx-objective", "data-ui": "focus.objective", title: "Edit the objective",
            onclick: promptObjective, text: S.objective })
        : el("button", { type: "button", class: "k-fx-objective", "data-ui": "focus.objective", "data-state": "empty",
            text: "＋ Set an objective", onclick: promptObjective }));
    }
    what.appendChild(contextNode());
    left.appendChild(what);
    /* counts appear once they happen (frame 16c); the cycle always shows
       on a Pomodoro */
    var stats = [];
    if (!paid && !reading) stats.push([String(cycleNo || S.cycles), "Cycle"]);
    if (S.pauses || reading) stats.push([String(S.pauses), "Pauses"]);
    if (!reading && S.distractions.length) stats.push([String(S.distractions.length), "Tab switches"]);
    if ((S.marks || []).length) stats.push([String(S.marks.length), "Marked"]);
    if (stats.length) {
      left.appendChild(el("dl", { class: "k-fx-stats" }, stats.map(function (s) {
        return el("div", { class: "k-fx-stat" }, [el("dt", { text: s[1] }), el("dd", { class: "k-mono", text: s[0] })]);
      })));
    }
    if (paid) left.appendChild(earnedNode(false));
    else if (!reading) left.appendChild(eligibilityNode());
    if (S.subject && S.ref) {
      left.appendChild(el("button", { type: "button", class: "k-link", "data-ui": "focus.open-topic", text: "Open " + S.ref + " and study →",
        onclick: function () { setMinimised(true); KOS.show("ref", { subject: S.subject, ref: S.ref }); } }));
    }

    /* ---- centre: the ring ---- */
    var ring = el("div", { class: "k-fx-ring", "data-ui": "focus.fill" }, [
      el("div", { class: "k-fx-ring-in" }, [
        el("span", { class: "k-kicker", text: phaseName }),
        el("span", { class: "k-fx-clock", "data-ui": "focus.clock", role: "timer", "aria-label": cr.label, text: cr.text, "data-long": cr.text.length > 5 ? "" : null }),
        el("span", { class: "k-fx-at", "data-ui": "focus.at", text: paused ? "paused — " + fmtLong(workSeconds()) + (reading ? " read" : " focused") : cr.at })
      ])
    ]);
    var ctl = el("div", { class: "k-fx-controls" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary k-fx-big", "data-ui": paused ? "focus.resume" : "focus.pause",
        text: paused ? "▶ Resume" : "⏸ Pause", onclick: paused ? resume : pause }),
      open ? el("button", { type: "button", class: "k-btn k-fx-big", "data-ui": "focus.end-complete focus.stop", text: "■ Stop",
          title: "End the session — every full 10 minutes is paid", onclick: stopNow })
        : canComplete() ? el("button", { type: "button", class: "k-btn k-fx-big", "data-ui": "focus.end-complete", text: "✓ End session",
          title: "Bank the completed cycles — full award", onclick: function () { endComplete(); } }) : null,
      reading ? null : el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "focus.mark", text: "Distraction +1",
        "aria-label": "Mark a distraction — no HP cost", title: "Record it yourself — no HP cost", onclick: markDistraction })
    ].filter(Boolean));
    var centre = el("div", { class: "k-fx-centre" }, [ring, ctl]);

    /* ---- right: notes, or the reading promise ---- */
    var right = reading
      ? el("div", { class: "k-fx-col k-fx-notes" }, [
          el("div", { class: "k-kicker", text: "Rest, not study" }),
          el("p", { class: "k-fx-caption", text: "Pause freely. The clock logs to your reading heatmap and rest streak — HP and the study streak are never touched." })
        ])
      : notesNode();

    stageEl.appendChild(el("div", { class: "k-fx-body" }, [left, centre, right]));
    if (!reading && !paid) stageEl.appendChild(progressNode());
    else if (!reading && S.breakMin > 0) stageEl.appendChild(progressNode());
    var foot = [];
    if (paid) {
      if (S.nudgeMin) foot.push("Break nudge at " + fmtClock((S.nudged + 1) * S.nudgeMin * 60));
      if (S.limitMin) foot.push("stops itself at " + fmtClock(S.limitMin * 60));
      foot.push("started " + hmOf(S.startedAt));
    } else if (!reading) {
      foot.push(F().penalizeDistractions === false
        ? "Leaving the tab is logged but costs nothing. A refresh costs nothing either."
        : "Leaving the tab counts as a distraction; the first is free. A refresh costs nothing.");
    }
    if (foot.length) stageEl.appendChild(el("p", { class: "k-fx-foot", text: foot.join(" · ").replace(/^./, function (c) { return c.toUpperCase(); }) }));

    /* ---- the idle watch's warning (frame 16g) ---- */
    if (warned) {
      stageEl.appendChild(el("div", { class: "k-fx-idle", "data-ui": "focus.idle", role: "alertdialog", "aria-labelledby": "fx-idle-t", "aria-describedby": "fx-idle-d" }, [
        countdownRing("focus.idle-ring"),
        el("div", { class: "k-fx-idle-txt" }, [
          el("h2", { id: "fx-idle-t", class: "k-fx-idle-title", text: "Still studying?" }),
          el("p", { id: "fx-idle-d", class: "k-fx-idle-line" }, [
            "No activity since ", el("b", { text: hmOf(S.lastActiveTs) }),
            ". The session ends at " + hmOf(S.idleWarnedAt + IDLE_GRACE) + " unless you're here, and pays for the time up to " + hmOf(S.lastActiveTs) + "."
          ]),
          el("div", { class: "k-fx-idle-act" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "focus.im-here", text: "I'm here", onclick: imHere }),
            el("span", { class: "k-muted", text: "or press any key" }),
            el("span", { class: "k-spacer" }),
            el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "focus.idle-end", text: "End now", onclick: idleEndNow })
          ])
        ])
      ]));
    }

    renderDock(cr, phaseName, paused, reading, paid, open, warned);
    if (minimised) placeMini();
    updateClock();
  }

  /* ---- minimised: the floating player (frame 16d), or on a phone the
     two-row dock over the tab bar (frame 15f) ---- */
  function iconBtn(text, label, hook, onclick, primary) {
    return el("button", { type: "button", class: "k-iconbtn" + (primary ? " k-fx-mini-primary" : ""), "data-ui": hook, "aria-label": label, title: label, text: text, onclick: onclick });
  }
  function miniSize() {
    var r = store.state.ui && store.state.ui.focusMini;
    return r && r.w >= (MINI.compact + MINI.large) / 2 ? "large" : "compact";
  }
  function renderDock(cr, phaseName, paused, reading, paid, open, warned) {
    if (!dockEl) return;
    dockEl.innerHTML = "";
    var phone = isPhone();
    var size = phone ? "phone" : miniSize();
    dockEl.setAttribute("data-phase", paused ? "paused" : S.phase === "break" ? "break" : "work");
    dockEl.setAttribute("data-size", size);
    dockEl.setAttribute("data-rule", paid ? "blocks" : "cycle");
    if (warned) dockEl.setAttribute("data-idle", "warn"); else dockEl.removeAttribute("data-idle");
    var pauseBtn = iconBtn(paused ? "▶" : "⏸", paused ? "Resume" : "Pause", "focus.dock-pause", paused ? resume : pause, true);
    var expand = iconBtn("⤢", "Back to the full screen", "focus.expand", function () { setMinimised(false); });
    var clock = el("span", { class: "k-fx-dock-clock k-mono", "data-ui": "focus.dock-clock", role: "timer", "aria-label": cr.label, text: cr.text });
    var subj = S.subject ? shortName(S.subject) + (S.ref ? " " + S.ref : "") : reading ? topicLabel() : "General study";

    if (phone) {
      if (warned) {
        dockEl.appendChild(el("div", { class: "k-fx-dock-row" }, [
          countdownRing("focus.idle-ring"),
          el("div", { class: "k-fx-dock-txt" }, [
            el("b", { class: "k-fx-dock-title", text: "Still studying?" }),
            el("span", { class: "k-fx-dock-meta", text: idleLine() })
          ])
        ]));
        dockEl.appendChild(el("div", { class: "k-fx-dock-row" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary k-fx-dock-here", "data-ui": "focus.im-here", text: "I'm here", onclick: imHere }),
          el("button", { type: "button", class: "k-btn", "data-ui": "focus.idle-end", text: "End now", onclick: idleEndNow })
        ]));
        return;
      }
      dockEl.appendChild(el("div", { class: "k-fx-dock-row" }, [
        el("span", { class: "k-fx-dot", "aria-hidden": "true" }),
        el("div", { class: "k-fx-dock-txt" }, [
          el("span", { class: "k-fx-dock-phase", text: phaseName }),
          el("span", { class: "k-fx-dock-title", text: S.objective || topicLabel() })
        ]),
        clock
      ]));
      var line = el("div", { class: "k-fx-dock-line", "data-ui": "focus.dock-line", "aria-hidden": "true" });
      line.style.setProperty("--pct", cr.pct + "%");
      dockEl.appendChild(line);
      dockEl.appendChild(el("div", { class: "k-fx-dock-row" }, [
        el("span", { class: "k-fx-dock-meta", text: subj + " · " + (paused ? "paused" : cr.at) }),
        pauseBtn,
        reading ? null : iconBtn("+1", "Mark a distraction — no HP cost", "focus.dock-mark", markDistraction),
        expand
      ].filter(Boolean)));
      return;
    }

    /* the floating player: the grip moves it, the corner resizes it */
    var grip = el("button", { type: "button", class: "k-fx-grip", "data-ui": "focus.grip", "aria-label": "Move the timer (arrow keys)", text: "⠿" });
    wireDrag(grip);
    var resize = el("button", { type: "button", class: "k-fx-resize", "data-ui": "focus.resize",
      "aria-label": size === "large" ? "Make the timer smaller" : "Make the timer larger" });
    wireResize(resize);
    dockEl.appendChild(resize);
    if (size === "compact") {
      if (warned) {
        dockEl.appendChild(el("div", { class: "k-fx-mini-row" }, [
          grip, countdownRing("focus.idle-ring"),
          el("b", { class: "k-fx-mini-title", text: "Still studying?" }),
          el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "focus.im-here", text: "I'm here", onclick: imHere })
        ]));
        return;
      }
      var mring = el("span", { class: "k-fx-mini-ring", "data-ui": "focus.mini-ring", "aria-hidden": "true" });
      dockEl.appendChild(el("div", { class: "k-fx-mini-row" }, [grip, mring, clock, pauseBtn, expand]));
      return;
    }
    /* large */
    var head = el("div", { class: "k-fx-mini-head" }, [
      grip,
      el("span", { class: "k-fx-mini-mode", text: warned ? "Idle watch" : modeLabel() }),
      el("span", { class: "k-muted", text: (warned ? modeLabel() + " · " : "") + (S.subject ? shortName(S.subject) : reading ? "" : "General") }),
      el("span", { class: "k-spacer" }),
      expand,
      warned ? null : iconBtn("–", "Make the timer smaller", "focus.shrink", function () { setMiniSize("compact"); })
    ].filter(Boolean));
    dockEl.appendChild(head);
    if (warned) {
      dockEl.appendChild(el("div", { class: "k-fx-mini-row" }, [
        countdownRing("focus.idle-ring"),
        el("div", { class: "k-fx-dock-txt" }, [
          el("b", { class: "k-fx-mini-title", text: "Still studying?" }),
          el("span", { class: "k-fx-dock-meta", text: idleLine() })
        ])
      ]));
      dockEl.appendChild(el("div", { class: "k-fx-mini-act" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "focus.im-here", text: "I'm here", onclick: imHere }),
        el("button", { type: "button", class: "k-btn", "data-ui": "focus.idle-end", text: "End now", onclick: idleEndNow })
      ]));
      return;
    }
    var e = eligibility();
    dockEl.appendChild(el("div", { class: "k-fx-mini-time" }, [
      clock,
      paid && e && e.blocks ? el("b", { class: "k-fx-mini-earned k-mono", text: awardText(e) }) : null
    ].filter(Boolean)));
    dockEl.appendChild(el("span", { class: "k-fx-mini-topic", text: S.ref && KOS.hub.BYREF[S.subject] && KOS.hub.BYREF[S.subject][S.ref]
      ? S.ref + " " + KOS.hub.BYREF[S.subject][S.ref].title : S.objective || topicLabel() }));
    if (paid) {
      var w = workSeconds(), blk = KOS.governor.FOCUS_BLOCK.secs, blocks = Math.floor(w / blk);
      dockEl.appendChild(tickRow(6, blocks - Math.floor(blocks / 6) * 6, 100 * (w % blk) / blk, false));
      dockEl.appendChild(el("div", { class: "k-fx-mini-next" }, [
        el("span", { "data-ui": "focus.mini-next", text: paused ? "paused" : "next award in " + fmt(cr.nextIn) }),
        el("span", { class: "k-mono", text: nextAwardText() })
      ]));
    } else {
      var bar = el("div", { class: "k-fx-dock-line", "data-ui": "focus.dock-line", "aria-hidden": "true" });
      bar.style.setProperty("--pct", cr.pct + "%");
      dockEl.appendChild(bar);
      dockEl.appendChild(el("div", { class: "k-fx-mini-next" }, [el("span", { "data-ui": "focus.mini-next", text: paused ? "paused" : cr.at })]));
    }
    dockEl.appendChild(el("div", { class: "k-fx-mini-act" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "focus.dock-pause", text: paused ? "▶ Resume" : "⏸ Pause", onclick: paused ? resume : pause }),
      open || paid ? el("button", { type: "button", class: "k-btn", "data-ui": "focus.dock-stop", text: "■ Stop", onclick: stopNow })
        : el("button", { type: "button", class: "k-btn", "data-ui": "focus.dock-end", text: canComplete() ? "✓ End" : "End early",
            onclick: function () { if (canComplete()) endComplete(); else endEarly(); } })
    ]));
  }

  function updateClock() {
    if (!S) return;
    var cr = clockRead(), remain = cr.text, pct = cr.pct;
    if (stageEl) {
      var c = stageEl.querySelector("[data-ui~='focus.clock']");
      if (c) { c.textContent = remain; c.toggleAttribute("data-long", remain.length > 5); }
      var at = stageEl.querySelector("[data-ui~='focus.at']");
      if (at && S.state === "running") at.textContent = cr.at;
      var f = stageEl.querySelector("[data-ui~='focus.fill']");
      if (f) f.style.setProperty("--pct", pct + "%");
      var live = stageEl.querySelector(".k-fx-seg[data-live]");
      if (live) live.style.setProperty("--pct", pct + "%");
      /* the earned ticks move on at each award; between them only the
         live tick grows */
      var tick = stageEl.querySelector("[data-ui~='focus.elig'] .k-fx-tick[data-state~='live']");
      var blk = KOS.governor.FOCUS_BLOCK.secs, w = workSeconds();
      if (tick) tick.style.setProperty("--pct", Math.round(100 * (w % blk) / blk) + "%");
      if (paidRule() && Math.floor(w / blk) !== renderedBlocks) {
        /* an award just landed: redraw the earned block alone, so a note
           being typed keeps its focus */
        if (minimised) { render(); return; }
        var old = stageEl.querySelector(".k-fx-earned");
        if (old) old.replaceWith(earnedNode(false));
      }
    }
    if (dockEl) {
      var dc = dockEl.querySelector("[data-ui~='focus.dock-clock']");
      if (dc) dc.textContent = remain;
      var mr = dockEl.querySelector("[data-ui~='focus.mini-ring']");
      if (mr) mr.style.setProperty("--pct", (paidRule() ? Math.round(100 * (workSeconds() % KOS.governor.FOCUS_BLOCK.secs) / KOS.governor.FOCUS_BLOCK.secs) : pct) + "%");
      var dl = dockEl.querySelector("[data-ui~='focus.dock-line']");
      if (dl) dl.style.setProperty("--pct", pct + "%");
      var mn = dockEl.querySelector("[data-ui~='focus.mini-next']");
      if (mn && S.state === "running") mn.textContent = cr.nextIn != null && paidRule() ? "next award in " + fmt(cr.nextIn) : cr.at;
      var mt = dockEl.querySelector(".k-fx-mini-row .k-fx-tick[data-state~='live'], .k-fx-dock > .k-fx-ticks .k-fx-tick[data-state~='live']");
      if (mt) mt.style.setProperty("--pct", Math.round(100 * (workSeconds() % KOS.governor.FOCUS_BLOCK.secs) / KOS.governor.FOCUS_BLOCK.secs) + "%");
    }
    /* the idle countdown, wherever it is showing */
    if (idleWarned()) {
      var left = idleLeft(), share = Math.round(100 * left / (IDLE_GRACE / 1000));
      document.querySelectorAll("[data-ui~='focus.idle-left']").forEach(function (n) { n.textContent = fmt(left); });
      document.querySelectorAll(".k-fx-cd").forEach(function (n) { n.style.setProperty("--pct", share + "%"); });
    }
    document.title = (S ? remain + " · " : "") + "Kurenai OS — Study Atelier";
  }

  /* ---------------- the floating player: drag, snap, resize (16d, 16e) ----
     The grip lifts the player and the page dims; guides show the edge it
     will land on and a ghost where. Release within MINI.corner of a corner
     and it docks there; anywhere else it snaps to the nearest edge at the
     drop position — clampMini() is that one rule, shared with the stored
     place. The clock keeps running and the buttons stay live throughout. */
  var dragUi = null;
  function miniBounds() {
    var rail = document.getElementById("rail"), top = document.getElementById("topbar");
    var r = rail && rail.getBoundingClientRect(), t = top && top.getBoundingClientRect();
    return { left: r && r.width && r.right < window.innerWidth / 2 ? Math.round(r.right) : 0, top: t ? Math.round(t.bottom) : 0 };
  }
  function defaultMini(size) {
    var w = size === "large" ? MINI.large : MINI.compact;
    var h = dockEl ? Math.round(dockEl.getBoundingClientRect().height) || 60 : 60;
    return { x: window.innerWidth - MINI.margin - w, y: window.innerHeight - MINI.margin - h, w: w, h: h };
  }
  function placeMini() {
    if (!dockEl || isPhone()) return;
    var stored = store.state.ui && store.state.ui.focusMini;
    var h = Math.round(dockEl.getBoundingClientRect().height) || 60;
    var r = stored ? clampMini(Object.assign({}, stored, { h: h }), window.innerWidth, window.innerHeight, miniBounds())
      : clampMini(defaultMini("compact"), window.innerWidth, window.innerHeight, miniBounds());
    if (!r) return;
    /* hold the docked corner: a player whose contents grew (the idle
       warning, a wider state) grows away from the edges it sits on */
    var right = r.x + r.w / 2 >= window.innerWidth / 2, bottom = r.y + r.h / 2 >= window.innerHeight / 2;
    var b = dockEl.getBoundingClientRect();
    dockEl.style.setProperty("--mini-x", (right ? r.x + r.w - Math.round(b.width || r.w) : r.x) + "px");
    dockEl.style.setProperty("--mini-y", (bottom ? r.y + r.h - Math.round(b.height || r.h) : r.y) + "px");
    dockEl.setAttribute("data-dock", (right ? "right" : "left") + " " + (bottom ? "bottom" : "top"));
  }
  window.addEventListener("resize", function () { if (minimised) placeMini(); });
  function currentRect() {
    var b = dockEl.getBoundingClientRect();
    return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) };
  }
  function setMiniSize(size) {
    if (!dockEl) return;
    var r = currentRect(), dock = (dockEl.getAttribute("data-dock") || "right bottom").split(" ");
    var w = size === "large" ? MINI.large : MINI.compact;
    store.state.ui.focusMini = { x: r.x, y: r.y, w: w, h: r.h };
    render();                                   // re-lay the contents at the new size
    var h = Math.round(dockEl.getBoundingClientRect().height) || r.h;
    /* grow away from the edges it is docked to */
    var x = dock[0] === "right" ? r.x + r.w - w : r.x;
    var y = dock[1] === "bottom" ? r.y + r.h - h : r.y;
    setMiniRect({ x: x, y: y, w: w, h: h }, window.innerWidth, window.innerHeight, miniBounds());
    placeMini();
  }
  function paintGuides(target, bounds) {
    if (!dragUi) {
      dragUi = el("div", { class: "k-fx-drag", "aria-hidden": "true" }, [
        el("span", { class: "k-fx-drag-ghost" }),
        el("span", { class: "k-fx-drag-guide", "data-edge": "x" }),
        el("span", { class: "k-fx-drag-guide", "data-edge": "y" })
      ]);
      ["lt", "rt", "lb", "rb"].forEach(function (c) { dragUi.appendChild(el("span", { class: "k-fx-drag-corner", "data-corner": c })); });
      document.body.appendChild(dragUi);
    }
    var vw = window.innerWidth, vh = window.innerHeight, m = MINI.margin;
    var L = bounds.left + m, T = bounds.top + m, R = vw - m, B = vh - m;
    var g = dragUi.querySelector(".k-fx-drag-ghost");
    g.style.setProperty("--gx", target.x + "px"); g.style.setProperty("--gy", target.y + "px");
    g.style.setProperty("--gw", target.w + "px"); g.style.setProperty("--gh", target.h + "px");
    var gx = dragUi.querySelector("[data-edge='x']"), gy = dragUi.querySelector("[data-edge='y']");
    var onLeft = target.x <= L + 1, onRight = target.x + target.w >= R - 1, onTop = target.y <= T + 1, onBottom = target.y + target.h >= B - 1;
    gx.hidden = !(onLeft || onRight);
    gx.style.setProperty("--at", (onLeft ? L : R) + "px");
    gy.hidden = !(onTop || onBottom);
    gy.style.setProperty("--at", (onTop ? T : B) + "px");
    var pos = { lt: [L, T], rt: [R, T], lb: [L, B], rb: [R, B] };
    dragUi.querySelectorAll(".k-fx-drag-corner").forEach(function (n) {
      var p = pos[n.getAttribute("data-corner")];
      n.style.setProperty("--cx", p[0] + "px"); n.style.setProperty("--cy", p[1] + "px");
    });
  }
  function wireDrag(grip) {
    var start = null;
    grip.addEventListener("pointerdown", function (e) {
      if (!dockEl || e.button !== 0) return;
      e.preventDefault();
      grip.setPointerCapture(e.pointerId);
      var r = currentRect();
      start = { px: e.clientX, py: e.clientY, r: r, bounds: miniBounds() };
      document.documentElement.setAttribute("data-fx-drag", "");
    });
    grip.addEventListener("pointermove", function (e) {
      if (!start) return;
      var x = start.r.x + e.clientX - start.px, y = start.r.y + e.clientY - start.py;
      dockEl.style.setProperty("--mini-x", x + "px"); dockEl.style.setProperty("--mini-y", y + "px");
      var t = clampMini({ x: x, y: y, w: start.r.w, h: start.r.h }, window.innerWidth, window.innerHeight, start.bounds);
      if (t) paintGuides(t, start.bounds);
    });
    function drop(e) {
      if (!start) return;
      var s = start; start = null;
      document.documentElement.removeAttribute("data-fx-drag");
      if (dragUi) { dragUi.remove(); dragUi = null; }
      var x = s.r.x + e.clientX - s.px, y = s.r.y + e.clientY - s.py;
      setMiniRect({ x: x, y: y, w: s.r.w, h: s.r.h }, window.innerWidth, window.innerHeight, s.bounds);
      placeMini();
    }
    grip.addEventListener("pointerup", drop);
    grip.addEventListener("pointercancel", drop);
    /* the keyboard route: arrows jump to the next corner */
    grip.addEventListener("keydown", function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d || !dockEl) return;
      e.preventDefault();
      var r = currentRect();
      var x = d[0] ? (d[0] < 0 ? 0 : window.innerWidth) : r.x, y = d[1] ? (d[1] < 0 ? 0 : window.innerHeight) : r.y;
      setMiniRect({ x: x, y: y, w: r.w, h: r.h }, window.innerWidth, window.innerHeight, miniBounds());
      placeMini();
      grip.focus();
    });
  }
  function wireResize(handle) {
    var start = null;
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      start = { px: e.clientX, py: e.clientY };
    });
    function up(e) {
      if (!start) return;
      var dx = e.clientX - start.px, dy = e.clientY - start.py;
      start = null;
      var dock = (dockEl.getAttribute("data-dock") || "right bottom").split(" ");
      /* outward is away from the docked corner */
      var out = (dock[0] === "right" ? -dx : dx) + (dock[1] === "bottom" ? -dy : dy);
      var size = miniSize();
      if (Math.abs(out) < 6) setMiniSize(size === "large" ? "compact" : "large");      // a click toggles
      else if (out > 24 && size === "compact") setMiniSize("large");
      else if (out < -24 && size === "large") setMiniSize("compact");
    }
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", function () { start = null; });
    handle.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      setMiniSize(miniSize() === "large" ? "compact" : "large");
    });
  }

  /* ================= the completion review (Build 6.5) =================
     Opened AFTER the session has been logged and paid. Everything it
     collects is an annotation on a record that already exists, so closing
     it, dismissing it, or never seeing it costs nothing. */

  var OBJ_RESULTS = [
    { v: "met", label: "Met it" },
    { v: "partly", label: "Partly" },
    { v: "missed", label: "Missed it" }
  ];

  /* the text a session files onto a topic or an assignment */
  function sessionNoteText(sess, entry, result, reflection) {
    var lines = [];
    lines.push("◉ Focus session · " + (entry.date || KOS.srs.todayISO()) +
      " · " + fmtLong(entry.dur || 0) +
      (entry.metrics && entry.metrics.complete ? "" : " · ended early"));
    if (sess.objective) {
      var r = OBJ_RESULTS.find(function (o) { return o.v === result; });
      lines.push("Objective: " + sess.objective + (r ? " — " + r.label.toLowerCase() : ""));
    }
    (sess.notes || []).forEach(function (n) { lines.push("· " + n.text); });
    if (reflection) lines.push("Reflection: " + reflection);
    return lines.join("\n");
  }

  function appendToTopicNote(sid, ref, text) {
    var p = store.getProgress(sid, ref);
    store.setNote(sid, ref, (p.note ? p.note.replace(/\s+$/, "") + "\n\n" : "") + text);
  }
  function appendToAssignmentNote(id, text) {
    var rec = KOS.assignments.get(id);
    if (!rec) return false;
    KOS.assignments.update(id, {
      notes: (rec.notes ? rec.notes.replace(/\s+$/, "") + "\n\n" : "") + text
    });
    return true;
  }

  function reviewModal(sess, entry, award, block) {
    var complete = !!(entry.metrics && entry.metrics.complete);
    var m = entry.metrics || {};
    var asg = linkedAssignment(sess);
    var overlay = el("div", { class: "k-dialog-overlay" });
    var closed = false;
    overlay.close = function () {
      if (closed) return;
      closed = true;
      overlay.remove();
      refreshAfterSession();
    };

    var body = el("div", { class: "k-dialog-body k-fx-review" });
    var dur = entry.dur || 0, endTs = entry.ts || now();
    var idle = m.ended === "idle";
    var paidRule0 = m.rule === "blocks";
    var blk = KOS.governor.FOCUS_BLOCK.secs;
    var where = [sess.subject ? subjectName(sess.subject) : "General study"];
    if (sess.ref && KOS.hub.BYREF[sess.subject] && KOS.hub.BYREF[sess.subject][sess.ref]) where.push(sess.ref + " " + KOS.hub.BYREF[sess.subject][sess.ref].title);

    /* --- 1. the time it measured (or, ended by the idle watch, the time it
       paid) leads, with the span it covers (frames 16f, 16j) --- */
    body.appendChild(el("header", { class: "k-fx-rev-hero", "data-rule": paidRule0 ? "blocks" : "cycle" }, [
      el("span", { class: "k-kicker", text: (complete ? "Session complete" : "Session ended early") + " · " + (MODE_LABEL[sess.mode] || "Focus") }),
      el("span", { class: "k-fx-rev-time k-mono", "data-ui": "focus.rev-time", text: fmtClock(dur) }),
      el("span", { class: "k-fx-rev-span", text: (idle
        ? "paid, from " + hmOf(sess.startedAt) + " to " + hmOf(sess.lastActiveTs || endTs)
        : hmOf(sess.startedAt) + " → " + hmOf(endTs)) + " · " + where.join(" · ") })
    ]));

    /* --- 2. one card of results, from the governor's own record --- */
    var card = el("section", { class: "k-fx-rev-card" });
    body.appendChild(card);
    if (idle) {
      var after = Math.max(0, Math.round((endTs - (sess.lastActiveTs || endTs)) / 60000));
      card.appendChild(el("p", { class: "k-fx-rev-why", "data-ui": "focus.rev-why" }, [
        el("span", { class: "k-fx-dot", "aria-hidden": "true" }),
        el("span", { text: "Ended by the idle watch: no activity after " + hmOf(sess.lastActiveTs) + ". The " + after +
          " minutes after that aren't paid; everything before them is." })
      ]));
      /* the rule, drawn: paid to the last activity, hatched after it */
      var span = Math.max(1, endTs - sess.startedAt);
      var at = function (ts) { return Math.max(0, Math.min(100, 100 * (ts - sess.startedAt) / span)).toFixed(1) + "%"; };
      var tl = el("div", { class: "k-fx-rev-tl", "aria-hidden": "true" });
      tl.style.setProperty("--paid", at(sess.lastActiveTs));
      var marks = el("div", { class: "k-fx-rev-tl-lab k-mono" }, [
        el("span", { text: hmOf(sess.startedAt) + " start" })
      ]);
      [[sess.lastActiveTs, "last activity"], [sess.idleWarnedAt, "warned"], [endTs, "ended"]].forEach(function (p) {
        if (!p[0]) return;
        var mk = el("span", { class: "k-fx-rev-tl-mark" });
        mk.style.setProperty("--at", at(p[0]));
        tl.appendChild(mk);
        /* the warning sits five minutes before the end: marked, and named
           only when there is room between them */
        if (p[1] === "warned" && (endTs - p[0]) / span < 0.2) return;
        var lab = el("span", { class: "k-fx-rev-tl-at", text: hmOf(p[0]) + " " + p[1] });
        lab.style.setProperty("--at", at(p[0]));
        marks.appendChild(lab);
      });
      card.appendChild(el("div", { class: "k-fx-rev-tlbox" }, [tl, marks]));
    }
    var paid = complete && award && (award.xp || award.gold);
    var blocks = paidRule0 ? Math.floor(dur / blk) : 0;
    var figs = el("dl", { class: "k-fx-rev-facts", "data-ui": "focus.rev-facts" });
    function fig(v, k, tone, hook) {
      return el("div", { class: "k-fx-rev-fig", "data-tone": tone || null, "data-ui": hook || null }, [
        el("dt", { text: k }), el("dd", { class: "k-mono", text: v })
      ]);
    }
    figs.appendChild(fig(fmtLong(dur), idle ? "Paid focus" : "Focused"));
    figs.appendChild(paidRule0 ? fig(String(blocks), blocks === 1 ? "Award" : "Awards") : fig(String(sess.cycles || 0), sess.cycles === 1 ? "Cycle" : "Cycles"));
    var awardBox = el("div", { class: "k-fx-rev-award", "data-ui": "focus.rev-award", "data-state": paid ? null : "muted" });
    if (paid) {
      awardBox.appendChild(fig("+" + award.xp + " XP", "Earned", "teal"));
      awardBox.appendChild(fig("+" + award.gold + " gold", "Gold", "gold"));
    } else {
      awardBox.appendChild(el("p", { class: "k-fx-rev-none", text: complete
        ? (paidRule0 ? "Under 10 minutes — no award was due" : "No award was due")
        : "Award forfeited — ended before a full cycle" }));
    }
    figs.appendChild(awardBox);
    card.appendChild(figs);
    if (paidRule0 && dur >= 60) {
      var n = Math.max(1, Math.ceil(dur / blk));
      card.appendChild(tickRow(n, blocks, blocks < n ? 100 * (dur % blk) / blk : null, n <= 12));
    }
    /* only the counts that happened (frame 16f) */
    var counts = [];
    if (sess.pauses) counts.push(sess.pauses + (sess.pauses === 1 ? " pause" : " pauses"));
    if ((sess.distractions || []).length) counts.push(sess.distractions.length + (sess.distractions.length === 1 ? " tab switch" : " tab switches"));
    if ((sess.marks || []).length) counts.push(sess.marks.length + " self-marked");
    if (sess.restores) counts.push("recovered after " + (sess.restores === 1 ? "a reload" : sess.restores + " reloads"));
    var left = paidRule0 && blocks ? Math.floor((dur % blk) / 60) : 0;
    if (left) counts.push(left + " min after the last award don't count");
    if (award && award.notes && award.notes.length && paid) counts.push(award.notes.join(" · "));
    var foot = el("div", { class: "k-fx-rev-foot", "data-ui": "focus.rev-counts" }, [
      el("span", { text: counts.join(" · ") }),
      paid && award.hp ? el("span", { class: "k-fx-rev-hp", text: "HP +" + award.hp }) : null,
      paid && award.levelUp ? el("span", { class: "k-fx-rev-level", text: "Level " + award.level + " reached" }) : null
    ].filter(Boolean));
    if (counts.length || (paid && (award.hp || award.levelUp))) card.appendChild(foot);

    /* --- 3. the objective, and whether it landed; then the notes --- */
    var result = null;
    var obj = el("section", { class: "k-fx-rev-card" });
    body.appendChild(obj);
    if (sess.objective) {
      var btns = el("div", { class: "k-seg k-seg--quiet", role: "group", "aria-label": "Objective result" });
      OBJ_RESULTS.forEach(function (o) {
        var b = el("button", { type: "button", class: "k-seg-item", "data-ui": "focus.review-choice", "aria-pressed": "false", text: o.label, onclick: function () {
          result = result === o.v ? null : o.v;
          btns.querySelectorAll("[data-ui~='focus.review-choice']").forEach(function (x) {
            KOS.ui.state(x, "active", false); x.setAttribute("aria-pressed", "false");
          });
          if (result) { KOS.ui.state(b, "active", true); b.setAttribute("aria-pressed", "true"); }
        } });
        btns.appendChild(b);
      });
      obj.appendChild(el("div", { class: "k-fx-rev-q" }, [
        el("h3", { class: "k-fx-rev-qt", text: "Did you meet the objective?" }),
        el("span", { class: "k-fx-rev-obj", text: sess.objective })
      ]));
      obj.appendChild(btns);
    }
    var reflectIn = el("textarea", { class: "k-input k-fx-rev-reflect", "data-ui": "focus.rev-reflect", rows: "1",
      maxlength: "400", placeholder: "One line on how it went (optional)",
      "aria-label": "Quick reflection" });
    obj.appendChild(reflectIn);

    /* the notes kept, and where they should live */
    var noteDest = "none";
    var destOptions = [["none", "Keep in the session record"]];
    if (sess.subject && sess.ref) destOptions.push(["topic", "File to " + sess.ref + " notes"]);
    if (asg) destOptions.push(["assignment", "File to “" + asg.title + "”"]);
    var destSel = el("select", { class: "k-pill-select", "aria-label": "Where to file these notes" },
      destOptions.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    destSel.addEventListener("change", function () { noteDest = destSel.value; });
    var notes = sess.notes || [];
    if (notes.length) {
      obj.appendChild(el("div", { class: "k-fx-rev-notes", "data-ui": "focus.rev-notes" }, [
        el("b", { text: notes.length ? notes.length + (notes.length === 1 ? " quick note" : " quick notes") : "No quick notes" }),
        el("span", { class: "k-fx-rev-note-t", text: notes.map(function (x) { return x.text; }).join(" · ") }),
        destOptions.length > 1 ? destSel : null
      ].filter(Boolean)));
    }

    function revBlock(h, kids) {
      return el("section", { class: "k-fx-rev-card k-fx-rev-block" }, [el("h3", { class: "k-kicker", text: h })].concat(kids));
    }

    /* --- 4. the linked assignment: move it on --- */
    var progIn = null, statusSel = null, subBoxes = [], progTouched = false;
    if (asg) {
      var kids = [];
      kids.push(el("p", { class: "k-fx-rev-asg" }, [
        el("b", { text: asg.title }),
        el("span", { class: "k-muted", text: complete
          ? "+" + Math.round((entry.dur || 0) / 60) + " min banked · " + (asg.actualMins || 0) + " min total"
          : "effort is not banked from a session that ended early" })
      ]));
      var open = (asg.subtasks || []).filter(function (s) { return !s.done; }).slice(0, 8);
      if (open.length) {
        var subWrap = el("div", { class: "k-fx-rev-subs", "data-ui": "focus.rev-subs" });
        open.forEach(function (s) {
          var cb = el("input", { type: "checkbox", class: "k-box", id: "fxsub" + s.id });
          subBoxes.push({ box: cb, sub: s });
          subWrap.appendChild(el("label", { class: "k-fx-check" }, [cb, el("span", { text: s.text })]));
        });
        kids.push(subWrap);
      }
      progIn = el("input", { type: "range", min: "0", max: "100", step: "5",
        value: String(asg.progress || 0), class: "k-fx-range", "aria-label": "Assignment progress" });
      var progOut = el("b", { class: "k-mono", text: (asg.progress || 0) + "%" });
      progIn.addEventListener("input", function () {
        progTouched = true;
        progOut.textContent = progIn.value + "%";
      });
      kids.push(el("div", { class: "k-row" }, [el("span", { class: "k-muted", text: "Progress" }), progIn, progOut]));
      statusSel = el("select", { class: "k-input", "aria-label": "Assignment status" },
        KOS.assignments.STATUSES.map(function (st) {
          return el("option", { value: st.v, text: st.label });
        }));
      statusSel.value = asg.status;
      kids.push(el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Status" }), statusSel]));
      body.appendChild(revBlock("Assignment", kids));
    }

    /* --- 5. today's study block, folded in rather than stacked on --- */
    var blockBox = null;
    if (block) {
      blockBox = el("input", { type: "checkbox", class: "k-box", id: "fxblk", checked: "checked" });
      body.appendChild(revBlock("Today's plan", [
        el("label", { class: "k-fx-check" }, [blockBox, el("span", { text: "Mark the study block “" + block.title + "” as done" })])
      ]));
    }

    function save() {
      var reflection = reflectIn.value.trim();

      /* the session entry gains its annotations — never a second award */
      entry.metrics = entry.metrics || {};
      if (result) entry.metrics.objectiveResult = result;
      if (reflection) entry.metrics.reflection = reflection;

      /* the assignment moves, through its own API */
      if (asg) {
        subBoxes.forEach(function (b) {
          if (b.box.checked) KOS.assignments.subToggle(asg.id, b.sub.id, true);
        });
        var wanted = statusSel.value;
        if (wanted !== asg.status) KOS.assignments.setStatus(asg.id, wanted);
        var terminal = wanted === "complete" || wanted === "submitted";
        if (progTouched && !terminal) {
          KOS.assignments.update(asg.id, { progress: parseInt(progIn.value, 10) });
        }
      }

      /* the notes are filed where the user asked for them */
      var text = sessionNoteText(sess, entry, result, reflection);
      var filed = null;
      if (noteDest === "topic" && sess.subject && sess.ref) {
        appendToTopicNote(sess.subject, sess.ref, text);
        filed = sess.ref;
      } else if (noteDest === "assignment" && asg && appendToAssignmentNote(asg.id, text)) {
        filed = asg.title;
      }
      if (filed) entry.metrics.notesFiledTo = filed;

      if (blockBox && blockBox.checked && block) tickStudyBlock(block);

      store.save();
      KOS.refreshHUD();
      KOS.ui.toast(filed ? "Session reviewed — notes added to " + filed + "." : "Session reviewed.");
      overlay.close();
    }

    /* the session is already in the log (invariant 4b): Save adds the
       review to it, Close leaves it as it is */
    overlay.appendChild(el("div", { class: "k-dialog k-fx-review-dialog", "data-ui": "ui.dialog focus.review-modal",
      "aria-label": complete ? "Session complete" : "Session ended early" }, [
      el("h2", { class: "sr-only", "data-ui": "ui.dialog-title", text: complete ? "Session complete" : "Session ended early" }),
      body,
      el("div", { class: "k-dialog-foot k-fx-rev-act" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary k-fx-big", text: "Save review", onclick: save }),
        el("button", { type: "button", class: "k-btn k-btn--quiet", text: "Close", onclick: function () { overlay.close(); } })
      ])
    ]));
    KOS.ui.openDialog(overlay);
    var first = overlay.querySelector("[data-ui~='focus.review-choice'], [data-ui~='focus.rev-reflect']");
    if (first) first.focus();
    return overlay;
  }

  /* ---------------- start view (rail: Focus) ----------------
     Graphite (frame 10a): the dial and the form share one hero card; the
     record and the deal stand beside it, the last sessions beneath. */
  function sessionWhen(s) {
    var today = KOS.srs.todayISO();
    var t = s.ts ? new Date(s.ts) : null;
    var hm = t ? String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0") : "";
    if (s.date === today) return "Today" + (hm ? " " + hm : "");
    if (s.date >= KOS.srs.addDays(today, -6) && t) return t.toLocaleDateString("en-GB", { weekday: "short" }) + " " + hm;
    return s.date || "";
  }
  function sessionLabel(s) {
    if (s.subject && s.ref && KOS.hub.BYREF[s.subject] && KOS.hub.BYREF[s.subject][s.ref]) {
      return s.ref + " " + KOS.hub.BYREF[s.subject][s.ref].title;
    }
    if (s.metrics && s.metrics.objective) return s.metrics.objective;
    return s.subject ? subjectName(s.subject) : "General study";
  }
  var RESULT = { met: ["Met it", "var(--green)"], partly: ["Partly", "var(--amber)"], missed: ["Missed it", "var(--red-soft)"] };
  function sessionResult(s) {
    var m = s.metrics || {};
    if (RESULT[m.objectiveResult]) return RESULT[m.objectiveResult];
    return m.complete ? ["Complete", "var(--text-2)"] : ["Ended early", "var(--muted)"];
  }

  KOS.views.focus = function (main, arg) {
    KOS.shell.tree("none");
    main.appendChild(KOS.ui.pageHeader({ kicker: "The quiet hour", title: "Focus Timer",
      sub: "The session records what you actually did while the clock ran." }));

    if (S) {
      main.appendChild(el("div", { class: "k-card k-fx-live", "data-ui": "focus.live" }, [
        el("span", {}, [el("b", { text: "Session in progress" }), " — " + topicLabel()]),
        el("button", { type: "button", class: "k-btn k-btn--primary", text: "Return to the stage →", onclick: function () { setMinimised(false); } })
      ]));
      return;
    }

    var cfg = Object.assign({}, F().lastConfig);
    /* Contextual entry points (such as Compare Topics) prefill the existing
       subject/topic controls without changing the user's saved configuration
       until they deliberately start a session. */
    if (arg && arg.subject) { cfg.subject = arg.subject; cfg.ref = arg.ref || ""; }
    var mode = MODES.indexOf(cfg.mode) !== -1 ? cfg.mode : "pomodoro";
    var BLK = KOS.governor.FOCUS_BLOCK;
    var work = el("input", { type: "number", min: 1, max: 240, class: "k-input", "data-ui": "ui.number-input", "aria-label": "Work minutes" });
    var brk = el("input", { type: "number", min: 0, max: 60, class: "k-input", "data-ui": "ui.number-input", "aria-label": "Break minutes" });
    work.value = String(cfg.workMin || 25);
    brk.value = String(cfg.breakMin != null ? cfg.breakMin : 5);

    var hero = el("section", { class: "k-fx-hero", "data-ui": "focus.setup", "aria-label": "New session" });
    var side = el("aside", { class: "k-fx-side", "data-ui": "focus.setup-side" });
    main.appendChild(el("div", { class: "k-fx-setup" }, [hero, side]));

    function reading() { return subjSel.value === "reading"; }
    function timePaid() { return !reading() && KOS.governor.focusRule(mode) === "blocks"; }

    /* --- the dial: the duration you are about to commit to --- */
    var dialKicker = el("span", { class: "k-fx-dial-sub" });
    var dialTime = el("span", { class: "k-fx-dial-time k-mono" });
    var dialSub = el("span", { class: "k-fx-dial-sub" });
    function plannedMins() {
      if (mode === "pomodoro" && !reading()) return 25;
      return Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
    }
    function nudge(d) {
      var m = Math.max(5, Math.min(240, plannedMins() + d));
      if (mode === "pomodoro") setMode("custom");
      work.value = String(m);
      sync();
    }
    var steppers = el("div", { class: "k-cluster" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm k-mono", "data-ui": "focus.nudge", "aria-label": "Five minutes shorter", text: "−5", onclick: function () { nudge(-5); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm k-mono", "data-ui": "focus.nudge", "aria-label": "Five minutes longer", text: "+5", onclick: function () { nudge(5); } })
    ]);
    var dialNote = el("p", { class: "k-fx-caption k-fx-dial-note", text: "Each full turn of the ring is 10 minutes: one award." });
    var dialRing = el("div", { class: "k-fx-ring k-fx-ring--full", "data-ui": "focus.dial" }, [el("div", { class: "k-fx-ring-in" }, [dialKicker, dialTime, dialSub])]);
    var dial = el("div", { class: "k-fx-dial" }, [dialRing, steppers, dialNote]);

    /* --- the form --- */
    var form = el("div", { class: "k-fx-form" });
    var modeRow = el("div", { class: "k-seg k-seg--quiet k-seg--grid", role: "group", "aria-label": "Session type" });
    var customFields = el("div", { class: "k-fx-pair", "data-ui": "focus.custom" }, [
      el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: "Work (min)" }), work]),
      el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: "Break (min, 0 = none)" }), brk])
    ]);
    [["pomodoro", "Pomodoro 25 / 5"], ["custom", "Custom"], ["stopwatch", "Stopwatch"], ["until", "Study until"]].forEach(function (m) {
      modeRow.appendChild(el("button", { type: "button", class: "k-seg-item", "data-ui": "focus.mode", "data-mode": m[0],
        "aria-pressed": String(mode === m[0]), text: m[1], onclick: function () {
          if (reading() && m[0] !== "custom") return;
          setMode(m[0]); sync();
        } }));
    });
    function setMode(id) {
      mode = id;
      modeRow.querySelectorAll("[data-ui~='focus.mode']").forEach(function (b) {
        var on = b.getAttribute("data-mode") === id;
        b.setAttribute("aria-pressed", String(on));
        KOS.ui.state(b, "active", on);
      });
    }
    form.appendChild(modeRow);
    form.appendChild(customFields);

    /* frame 16a — the stopwatch's two settings */
    function pick(label, hook, options, value) {
      var sel = el("select", { class: "k-input", "data-ui": hook, "aria-label": label },
        options.map(function (o) { return el("option", { value: String(o[0]), text: o[1] }); }));
      sel.value = String(value);
      if (sel.selectedIndex < 0) sel.value = String(options[0][0]);
      sel.addEventListener("change", sync);
      return sel;
    }
    var nudgeOpts = NUDGES.map(function (n) { return [n, n ? "Every " + n + " min" : "Off"]; });
    var limitOpts = LIMITS.map(function (n) { return [n, n ? "After " + n / 60 + " h" : "No limit"]; });
    var nudgeSel = pick("Break nudge", "focus.nudge-sel", nudgeOpts, cfg.nudgeMin != null ? cfg.nudgeMin : 50);
    var limitSel = pick("Stop on its own", "focus.limit-sel", limitOpts, cfg.limitMin || 0);
    function field(label, control, wide) {
      return el("label", { class: "k-field" + (wide ? " k-fx-wide" : ""), "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: label }), control]);
    }
    var nudgeField = field("Break nudge", nudgeSel);
    var limitField = field("Stop on its own (optional)", limitSel);
    var openFields = el("div", { class: "k-fx-pair", "data-ui": "focus.open-fields" }, [nudgeField, limitField]);

    /* frame 16b — study until: one clock time, in 5-minute steps */
    function hm(ts) { var d = new Date(ts); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
    function halfHourAfter(ts) { var d = new Date(ts); d.setSeconds(0, 0); d.setMinutes(d.getMinutes() < 30 ? 30 : 60); return d.getTime(); }
    var untilH = 0, untilM = 0;
    (function seedUntil() {
      var t = cfg.until && untilTarget(cfg.until);
      if (!t || t - now() < 10 * 60000) t = halfHourAfter(now() + 60 * 60000);
      var d = new Date(t); untilH = d.getHours(); untilM = Math.floor(d.getMinutes() / 5) * 5;
    })();
    function untilText() { return String(untilH).padStart(2, "0") + ":" + String(untilM).padStart(2, "0"); }
    function untilTs() { return untilTarget(untilText()); }
    function stepField(which, label) {
      var out = el("input", { type: "text", inputmode: "numeric", maxlength: "2", class: "k-input k-fx-hm k-mono", "data-ui": "focus.until-" + which, "aria-label": label });
      function paint() { out.value = String(which === "h" ? untilH : untilM).padStart(2, "0"); }
      function step(d) {
        if (which === "h") untilH = (untilH + d + 24) % 24;
        else untilM = (untilM + d * 5 + 60) % 60;
        paint(); sync();
      }
      out.addEventListener("keydown", function (e) {
        if (e.key === "ArrowUp") { e.preventDefault(); step(1); }
        else if (e.key === "ArrowDown") { e.preventDefault(); step(-1); }
      });
      out.addEventListener("change", function () {
        var v = parseInt(out.value, 10);
        if (isFinite(v)) {
          if (which === "h") untilH = Math.max(0, Math.min(23, v));
          else untilM = Math.max(0, Math.min(55, Math.round(v / 5) * 5));
        }
        paint(); sync();
      });
      paint();
      stepField.paint = stepField.paint || [];
      stepField.paint.push(paint);
      return el("span", { class: "k-fx-hm-col" }, [
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": label + " later", text: "▲", onclick: function () { step(1); } }),
        out,
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": label + " earlier", text: "▼", onclick: function () { step(-1); } })
      ]);
    }
    function setUntil(ts) {
      var d = new Date(ts); untilH = d.getHours(); untilM = Math.floor(d.getMinutes() / 5) * 5;
      stepField.paint.forEach(function (p) { p(); });
      sync();
    }
    var hmPicker = el("span", { class: "k-fx-hm-pick", role: "group", "aria-label": "Study until" }, [
      stepField("h", "Hour"), el("span", { class: "k-fx-hm-sep", "aria-hidden": "true", text: ":" }), stepField("m", "Minute")
    ]);
    var untilChips = el("div", { class: "k-seg k-seg--quiet k-fx-until-chips", role: "group", "aria-label": "Quick times", "data-ui": "focus.until-chips" });
    var untilSum = el("p", { class: "k-fx-until-sum", "data-ui": "focus.until-sum", role: "status" });
    var untilFields = el("div", { class: "k-fx-until", "data-ui": "focus.until" }, [
      el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Study until" }), hmPicker]),
      el("div", { class: "k-fx-until-side" }, [untilChips, untilSum])
    ]);
    function paintUntilChips() {
      untilChips.innerHTML = "";
      var first = halfHourAfter(now() + 15 * 60000), picked = untilTs();
      for (var i = 0; i < 4; i++) {
        (function (t) {
          var on = picked && Math.abs(picked - t) < 60000;
          var b = el("button", { type: "button", class: "k-seg-item k-mono", "data-ui": "focus.until-chip", "aria-pressed": String(!!on), text: hm(t),
            onclick: function () { setUntil(t); } });
          KOS.ui.state(b, "active", !!on);
          untilChips.appendChild(b);
        })(first + i * 30 * 60000);
      }
      untilChips.appendChild(el("button", { type: "button", class: "k-seg-item k-mono", "data-ui": "focus.until-chip", text: "+30 min",
        onclick: function () { setUntil((untilTs() || now()) + 30 * 60000); } }));
    }
    form.appendChild(untilFields);
    form.appendChild(openFields);

    /* optional subject/topic link — Reading (rest, not study) rides here too */
    var subjSel = el("select", { class: "k-input", "aria-label": "Link to subject", onchange: function () {
      if (reading() && mode !== "custom") setMode("custom");
      topicPick.refresh(); fillAssignments(); sync();
    } }, [
      el("option", { value: "", text: "General study — no link" }),
      el("option", { value: "compsci", text: "Computer Science" }),
      el("option", { value: "maths", text: "Mathematics" }),
      el("option", { value: "it", text: "IT · Data Analytics" }),
      el("option", { value: "reading", text: "Reading — rest, no penalties" })
    ]);
    /* frame 17: the topic is the shared picker, single-select, locked to
       the subject (one subject per session, invariant 4a); picking a topic
       under General study takes its subject */
    var topicPick = KOS.topicPicker({ label: "Topic (optional)", multi: false, placeholder: "Whole subject",
      subject: function () { return subjSel.value && subjSel.value !== "reading" ? subjSel.value : null; },
      value: cfg.refs && cfg.refs.length ? cfg.refs : cfg.subject && cfg.ref ? [cfg.subject + ":" + cfg.ref] : [],
      onChange: function (refs) {
        var s0 = refs.length ? KOS.spec.subjectsOf(refs)[0] : null;
        if (s0 && subjSel.value !== s0) { subjSel.value = s0; fillAssignments(); sync(); }
      } });
    /* Build 6.4 — the open assignments a session can be spent on. Read from
       the canonical store; the option list narrows with the subject. */
    var asgSel = el("select", { class: "k-input", "aria-label": "Link to an assignment" });
    function fillAssignments() {
      var keep = asgSel.value;
      asgSel.innerHTML = "";
      asgSel.appendChild(el("option", { value: "", text: "No assignment" }));
      if (!KOS.assignments || reading()) { asgSel.disabled = true; return; }
      var rows = KOS.assignments.linkable(subjSel.value || null);
      rows.forEach(function (a) {
        asgSel.appendChild(el("option", { value: String(a.id),
          text: a.title + (a.due ? " · due " + a.due : "") }));
      });
      asgSel.disabled = !rows.length;
      if (keep && rows.some(function (a) { return String(a.id) === keep; })) asgSel.value = keep;
    }
    subjSel.value = cfg.subject || "";
    topicPick.refresh();
    fillAssignments();
    /* deep link from an assignment's "Focus on this" — preselect its subject
       and the assignment itself so the session is linked before it starts */
    if (arg && arg.assignmentId != null && KOS.assignments) {
      var linked = KOS.assignments.get(arg.assignmentId);
      if (linked) {
        if (linked.subject) { subjSel.value = linked.subject; topicPick.refresh(); }
        fillAssignments();
        asgSel.value = String(linked.id);
      }
    }
    var asgField = field("Assignment (optional)", asgSel, true);
    var linkRow = el("div", { class: "k-fx-pair", "data-ui": "focus.link-row" }, [
      field("Link to subject", subjSel), topicPick.el, asgField
    ]);
    form.appendChild(linkRow);

    /* Build 6.5 — the objective. One line, optional, and the last thing asked
       before starting: it is what the completion review reports back. */
    var objIn = el("input", { type: "text", class: "k-input", "data-ui": "focus.obj-in", maxlength: "200",
      placeholder: "e.g. finish the tree-traversal exam questions", "aria-label": "Session objective" });
    var objField = el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Objective (optional)" }), objIn]);
    form.appendChild(objField);

    /* Build 6.6 — the distraction penalty is opt-out, not fixed. A persisted
       preference (not part of this one session's cfg), so it carries into
       the next setup screen the same way lastConfig does. */
    var penIn = el("input", { type: "checkbox", role: "switch", class: "k-switch", id: "fxpen", "data-ui": "focus.penalty" });
    penIn.checked = F().penalizeDistractions !== false;
    penIn.addEventListener("change", function () {
      F().penalizeDistractions = penIn.checked;
      store.save();
      drawDeal();
    });
    var penField = el("label", { class: "k-fx-check", for: "fxpen" }, [
      penIn, el("span", { text: "Penalise tab-switches away from the app" })
    ]);
    form.appendChild(penField);

    /* "From today's plan": today's first unticked study block fills the
       form — its subject, topic, assignment and title — and starts nothing */
    var todayBlock = null;
    if (KOS.calendar && KOS.calendar.eventsOn) {
      var ticks = store.state.todo.autoChecked, today0 = KOS.srs.todayISO();
      todayBlock = KOS.calendar.eventsOn(today0).filter(function (e) {
        return e.type === "study" && !ticks[today0 + "|blk" + e.id];
      })[0] || null;
    }
    var startBtn = el("button", { type: "button", class: "k-btn k-btn--primary k-fx-start", "data-ui": "focus.start", text: "▶ Start focus", onclick: function () {
      var w = Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
      var b = Math.max(0, Math.min(60, parseInt(brk.value || "0", 10)));
      if (reading()) {
        start({ kind: "reading", mode: "custom", workMin: w, breakMin: 0, book: null });
        return;
      }
      if (mode === "until" && !untilTs()) return;
      start({
        mode: mode,
        workMin: mode === "pomodoro" ? 25 : w,
        breakMin: mode === "pomodoro" ? 5 : b,
        until: mode === "until" ? untilText() : undefined,
        nudgeMin: parseInt(nudgeSel.value, 10) || 0,
        limitMin: parseInt(limitSel.value, 10) || 0,
        subject: subjSel.value || null,
        refs: subjSel.value ? topicPick.value() : [],
        assignmentId: asgSel.value ? parseInt(asgSel.value, 10) : null,
        objective: objIn.value
      });
    } });
    form.appendChild(el("div", { class: "k-cluster k-fx-go" }, [
      startBtn,
      todayBlock ? el("button", { type: "button", class: "k-btn", "data-ui": "focus.from-plan", text: "From today's plan",
        title: todayBlock.title, onclick: function () {
          if (todayBlock.subject) { subjSel.value = todayBlock.subject; topicPick.refresh(); }
          fillAssignments();
          var blockRefs = Array.isArray(todayBlock.refs) && todayBlock.refs.length ? todayBlock.refs
            : todayBlock.subject && todayBlock.ref ? [todayBlock.subject + ":" + todayBlock.ref] : [];
          if (blockRefs.length) topicPick.set(blockRefs.slice(0, 1));
          if (todayBlock.assignmentId != null) asgSel.value = String(todayBlock.assignmentId);
          if (!objIn.value) objIn.value = todayBlock.title || "";
          sync();
          objIn.focus();
        } }) : null
    ].filter(Boolean)));

    hero.appendChild(dial);
    hero.appendChild(form);

    /* --- right: the record (or the rewards) + the deal --- */
    var focusSessions = KOS.sessions.all().filter(function (s) { return s.type === "focus"; });
    var today = KOS.srs.todayISO();
    var todaySecs = focusSessions.filter(function (s) { return s.date === today; })
      .reduce(function (a, s) { return a + (s.dur || 0); }, 0);
    var weekStart = KOS.srs.addDays(today, -6);
    var weekSecs = focusSessions.filter(function (s) { return s.date >= weekStart; })
      .reduce(function (a, s) { return a + (s.dur || 0); }, 0);
    var lastS = focusSessions[focusSessions.length - 1];
    function kv(k, v, tone, hint) {
      return el("li", { class: "k-fx-kv" }, [el("span", { text: k }), el("strong", { "data-tone": tone || null, title: hint || null, text: v })]);
    }
    var lastText = null;
    if (lastS) {
      lastText = fmtLong(lastS.dur || 0) + (lastS.subject ? " · " + shortName(lastS.subject) : "") + " · " +
        sessionResult(lastS)[0].toLowerCase();
    }
    var recordCard = el("section", { class: "k-card", "data-ui": "focus.record" }, [
      el("h2", { class: "k-card-title", text: "Your record" }),
      el("ul", { class: "k-fx-kvs" }, [
        kv("Focused today", todaySecs ? fmtLong(todaySecs) : "—"),
        kv("This week", weekSecs ? fmtLong(weekSecs) : "—"),
        lastText ? kv("Last session", lastText) : null,
        kv("Sessions logged", String(focusSessions.length))
      ].filter(Boolean))
    ]);
    /* frame 16a — the modes that pay by time show the award instead: one
       block, the six-tick hour and what an hour earns. The figures are
       the governor's own (FOCUS_BLOCK), never a copy. */
    var hour = KOS.governor.focusAward({ rule: "blocks", secs: 3600, pauses: 0 });
    var rewardMode = el("span", { class: "k-muted" });
    var rewardsCard = el("section", { class: "k-card k-fx-rewards", "data-ui": "focus.rewards" }, [
      el("div", { class: "k-card-head" }, [el("h2", { class: "k-card-title", text: "Rewards" }), rewardMode]),
      el("p", { class: "k-fx-rw-big" }, [
        el("b", { class: "k-mono", text: "+" + BLK.xp + " XP · +" + BLK.gold + " gold" }),
        el("span", { class: "k-muted", text: "every full 10 min" })
      ]),
      tickRow(6, 0, null, true),
      el("p", { class: "k-fx-caption", text: "An hour earns six awards: +" + hour.xp + " XP · +" + hour.gold + " gold · +" + hour.hp + " HP. Minutes after the last full ten don't count." })
    ]);
    side.appendChild(recordCard);
    side.appendChild(rewardsCard);

    /* the deal, stated plainly — friction only works when it's understood.
       Build 6.5: the top line is QUOTED from governor.focusAward for the
       duration actually selected, so the number on screen is the number
       paid. It re-reads whenever the mode or the custom minutes change. */
    var dealList = el("ul", { class: "k-fx-kvs", "data-ui": "focus.deal-list" });
    var dealFoot = el("p", { class: "k-fx-caption", "data-ui": "focus.deal-foot" });
    function tabRow() {
      return ["Each tab-switch after the first", F().penalizeDistractions === false ? "free — off" : "−" + DISTRACT_HP + " HP",
        F().penalizeDistractions === false ? "muted" : "bad"];
    }
    function drawDeal() {
      dealList.innerHTML = "";
      if (reading()) {
        [["Reading logs as rest", "rest streak · heatmap", "good"],
         ["Pauses and tab-switches", "never charged", "muted"],
         ["HP and the study streak", "untouched", "muted"]].forEach(function (r) { dealList.appendChild(kv(r[0], r[1], r[2])); });
        dealFoot.textContent = "Refreshing or navigating away costs nothing.";
        return;
      }
      if (timePaid()) {
        /* Custom, Stopwatch and Study until: every full 10 minutes earns,
           and stopping early keeps what was earned */
        var rows = [["Each full 10 minutes", "+" + BLK.xp + " XP · +" + BLK.gold + " gold · +" + BLK.hp + " HP", "good", "HP up to " + BLK.hpCap + " a session"]];
        var span = mode === "custom" ? plannedMins() * 60 : mode === "until" && untilTs() ? (untilTs() - now()) / 1000 : 0;
        if (span) {
          var full = KOS.governor.focusAward({ rule: "blocks", secs: span, pauses: 0 });
          rows.push([mode === "until" ? "Until " + untilText() : "The full " + plannedMins() + " min",
            "+" + full.xp + " XP · +" + full.gold + " gold · +" + full.hp + " HP", "good"]);
        }
        rows.push(["Each pause after the first", "−15% award", "bad"], tabRow(),
          ["Marking a distraction yourself", "free", "muted", "recorded, never charged"]);
        rows.forEach(function (r) { dealList.appendChild(kv(r[0], r[1], r[2], r[3])); });
        dealFoot.textContent = "Refreshing or navigating away costs nothing: the clock is banked.";
        return;
      }
      var mins = plannedMins();
      var a = KOS.governor.focusAward({ complete: true, mins: mins, pauses: 0 });
      var twoPauses = KOS.governor.focusAward({ complete: true, mins: mins, pauses: 2 });
      [
        ["One completed " + mins + "-min cycle", "+" + a.xp + " XP · +" + a.gold + " gold · +" + a.hp + " HP", "good"],
        ["Each pause after the first", "−15% award", "bad", twoPauses.xp + " XP at two pauses"],
        tabRow(),
        ["Marking a distraction yourself", "free", "muted", "recorded, never charged"],
        ["Ending before a full cycle", "award forfeited", "warn", "the session is still logged in full"]
      ].forEach(function (r) { dealList.appendChild(kv(r[0], r[1], r[2], r[3])); });
      dealFoot.textContent = "Refreshing or navigating away costs nothing.";
    }
    side.appendChild(el("section", { class: "k-card k-fx-deal" }, [
      el("h2", { class: "k-card-title", text: "The deal" }), dealList, dealFoot
    ]));

    /* --- the last sessions --- */
    var recent = focusSessions.slice(-5).reverse();
    if (recent.length) {
      main.appendChild(el("section", { class: "k-card k-fx-recent", "data-ui": "focus.recent" }, [
        el("div", { class: "k-card-head" }, [
          el("h2", { class: "k-card-title", text: "Recent sessions" }),
          el("button", { type: "button", class: "k-link", "data-ui": "focus.session-log", text: "Session log →",
            onclick: function () { KOS.show("governor", "history"); } })
        ]),
        el("ul", { class: "k-fx-rows" }, recent.map(function (s) {
          var r = sessionResult(s);
          var bar = el("span", { class: "k-fx-row-bar", "aria-hidden": "true" });
          if (s.subject) bar.style.setProperty("--row-hue", hue(s.subject));
          return el("li", { class: "k-fx-row" }, [
            el("span", { class: "k-mono k-muted", text: sessionWhen(s) }),
            bar,
            el("span", { class: "k-ellipsis", text: sessionLabel(s) }),
            el("span", { class: "k-mono", text: Math.max(1, Math.round((s.dur || 0) / 60)) + " min" }),
            chip(r[0], r[1])
          ]);
        }))
      ]));
    }

    /* one sync for everything the mode and the minutes drive */
    var MODE_NAME = { pomodoro: "Pomodoro", custom: "Custom", stopwatch: "Stopwatch", until: "Study until" };
    function sync() {
      var rd = reading(), paid = timePaid();
      var mins = plannedMins();
      var b = Math.max(0, Math.min(60, parseInt(brk.value || "0", 10)));
      modeRow.querySelectorAll("[data-ui~='focus.mode']").forEach(function (x) {
        var off = rd && x.getAttribute("data-mode") !== "custom";
        x.disabled = off;
      });
      hero.setAttribute("data-rule", paid ? "blocks" : "cycle");
      hero.setAttribute("data-mode", rd ? "reading" : mode);
      dialKicker.textContent = "";
      dialKicker.hidden = true;
      if (!rd && mode === "stopwatch") {
        dialTime.textContent = "0:00";
        dialSub.textContent = "counts up until you stop";
      } else if (!rd && mode === "until") {
        var t = untilTs();
        dialKicker.hidden = false;
        dialKicker.textContent = "until";
        dialTime.textContent = untilText();
        dialSub.textContent = t ? fmtLong((t - now()) / 1000) + " from now" : "pick a later time";
      } else {
        dialTime.textContent = fmt(mins * 60);
        dialSub.textContent = rd ? "reading · no penalties"
          : mode === "pomodoro" ? "auto-cycling · 5 min breaks"
          : b ? "auto-cycling · " + b + " min breaks" : "one interval";
      }
      var fixed = !rd && (mode === "stopwatch" || mode === "until");
      steppers.hidden = fixed;
      dialNote.hidden = !fixed;
      customFields.hidden = mode !== "custom" && !rd;
      brk.closest(".k-field").hidden = rd;
      openFields.hidden = rd || !fixed;
      limitField.hidden = mode !== "stopwatch";
      untilFields.hidden = rd || mode !== "until";
      topicPick.el.hidden = rd;
      asgField.hidden = rd;
      objField.hidden = rd;
      penField.hidden = rd;
      /* study until: the summary, or the one error that stops a start */
      var err = false;
      if (!rd && mode === "until") {
        var ts = untilTs();
        paintUntilChips();
        err = !ts;
        untilSum.setAttribute("data-state", err ? "warn" : "");
        untilSum.textContent = ts
          ? hm(now()) + " → " + untilText() + " · " + fmtLong((ts - now()) / 1000) + " · up to " +
            Math.floor((ts - now()) / 1000 / BLK.secs) + " award" + (Math.floor((ts - now()) / 1000 / BLK.secs) === 1 ? "" : "s")
          : "That time has passed. Pick a time after " + hm(now()) + ".";
      }
      startBtn.disabled = err;
      recordCard.hidden = paid;
      rewardsCard.hidden = !paid;
      rewardMode.textContent = MODE_NAME[mode] || "";
      drawDeal();                     // the quoted award follows the choice
    }
    setMode(mode);
    sync();
    work.addEventListener("input", sync);
    brk.addEventListener("input", sync);
  };

  /* ---------------- the mini-player's place (roadmap 1.6, frame 16d) -----
     The minimised player comes in two sizes, compact and large, with
     nothing in between, and is dragged by its grip. Where it sits and which
     size it is are this DEVICE's choice: state.ui.focusMini = {x, y, w, h}
     in CSS pixels from the viewport's top-left. clampMini() is the one
     rule for where it may be: MINI.margin in from the viewport and from
     the rail and header (`bounds`), at one of the two widths, and always
     docked — within MINI.corner of a corner it takes the corner, otherwise
     it snaps to the nearest edge at the drop position (on the top or bottom
     edge, within MINI.centre of the middle it centres). The phone dock
     (700px and under) never reads this (invariant 75). */
  var MINI = { margin: 20, corner: 64, centre: 8, compact: 236, large: 340, minH: 56, maxH: 360 };
  function clampMini(rect, vw, vh, bounds) {
    if (!rect || typeof rect !== "object") return null;
    var n = function (v) { v = Number(v); return isFinite(v) ? Math.round(v) : null; };
    var x = n(rect.x), y = n(rect.y), w = n(rect.w), h = n(rect.h);
    if (x === null || y === null || w === null || h === null) return null;
    vw = Math.max(0, Number(vw) || 0); vh = Math.max(0, Number(vh) || 0);
    var bl = bounds && Number(bounds.left) > 0 ? Math.round(bounds.left) : 0;
    var bt = bounds && Number(bounds.top) > 0 ? Math.round(bounds.top) : 0;
    var roomW = Math.max(0, vw - bl - 2 * MINI.margin), roomH = Math.max(0, vh - bt - 2 * MINI.margin);
    w = Math.min(w < (MINI.compact + MINI.large) / 2 ? MINI.compact : MINI.large, roomW);
    h = Math.max(Math.min(MINI.minH, roomH), Math.min(h, MINI.maxH, roomH));
    var L = bl + MINI.margin, T = bt + MINI.margin;
    var R = Math.max(L, vw - MINI.margin - w), B = Math.max(T, vh - MINI.margin - h);
    x = Math.max(L, Math.min(x, R));
    y = Math.max(T, Math.min(y, B));
    var dx = Math.min(x - L, R - x), dy = Math.min(y - T, B - y);
    var nx = x - L <= R - x ? L : R, ny = y - T <= B - y ? T : B;
    if (dx <= MINI.corner && dy <= MINI.corner) { x = nx; y = ny; }
    else if (dx <= dy) x = nx;
    else {
      y = ny;
      var mid = Math.round((L + R) / 2);
      if (Math.abs(x - mid) <= MINI.centre) x = mid;
    }
    return { x: x, y: y, w: w, h: h };
  }
  /* the stored place, clamped to the viewport it is read in (a window
     that shrank since never strands the player); null = the default dock */
  function miniRect(vw, vh, bounds) {
    var r = store.state.ui && store.state.ui.focusMini;
    if (!r) return null;
    return clampMini(r, vw != null ? vw : window.innerWidth, vh != null ? vh : window.innerHeight, bounds);
  }
  function setMiniRect(rect, vw, vh, bounds) {
    var ui = store.state.ui;
    if (rect == null) {
      if (ui.focusMini == null) return null;
      delete ui.focusMini;
      store.save();
      return null;
    }
    var c = clampMini(rect, vw != null ? vw : window.innerWidth, vh != null ? vh : window.innerHeight, bounds);
    if (!c) return null;
    ui.focusMini = c;
    store.save();
    return c;
  }

  /* ---------------- reload restore ----------------
     A refresh, a crash or a closed tab must never cost a session. The clock
     comes back holding the time it had already banked, and it comes back
     PAUSED rather than pretending the intervening hours were focus. The
     recovery is counted (and reported in the review) but never charged: it
     is not a pause and not a distraction. */
  (function restore() {
    var snap = F().active;
    if (!snap) return;
    S = hydrate(snap);
    if (S.state === "running") {
      /* credit time up to the last heartbeat, then hold the clock */
      S.phaseAccum = Math.min(phaseTarget(),
        S.phaseAccum + Math.max(0, ((S.lastBeat || S.phaseStartTs) - S.phaseStartTs) / 1000));
      S.state = "paused";
      S.restores = (S.restores || 0) + 1;
    }
    store.save();
    enterMode();
    timer = setInterval(tick, 1000);
    KOS.ui.toast("Focus session restored — " + fmtLong(workSeconds()) +
      " kept, paused where you left it. ▶ to resume.");
  })();

  KOS.focus = {
    start: start,
    pause: pause,
    resume: resume,
    endEarly: endEarly,
    endComplete: endComplete,
    tick: tick,
    activeId: function () { return S ? S.id : null; },
    session: function () { return S; },
    state: function () { return S ? S.state : "idle"; },
    kind: function () { return S ? S.kind || "study" : null; },
    workSeconds: workSeconds,
    canComplete: canComplete,
    /* Build 6.5 — the session's working record and the live deal */
    addNote: addNote,
    removeNote: removeNote,
    notes: function () { return S ? (S.notes || []).slice() : []; },
    markDistraction: markDistraction,
    marks: function () { return S ? (S.marks || []).length : 0; },
    setObjective: setObjective,
    objective: function () { return S ? S.objective || "" : ""; },
    assignment: function () { return linkedAssignment(); },
    eligibility: eligibility,
    /* roadmap 1.1 / 1.6 — the pure pieces a view or a tool reads */
    MODES: MODES.slice(),
    NUDGES: NUDGES.slice(),
    LIMITS: LIMITS.slice(),
    sessionLinks: sessionLinks,
    untilTarget: untilTarget,
    idleVerdict: idleVerdict,
    IDLE: { warn: IDLE_WARN, grace: IDLE_GRACE },
    noteActivity: function () { noteActivity(true); },
    idleCheck: idleCheck,
    clampMini: clampMini,
    MINI: MINI,
    miniRect: miniRect,
    setMiniRect: setMiniRect,
    /* test helper: shift the phase clock backwards so suites can cross
       interval boundaries without waiting on wall time */
    _debugAdvance: function (sec) {
      if (!S) return;
      if (S.state === "running") S.phaseStartTs -= sec * 1000;
      else S.phaseAccum += sec;
    }
  };
})();
