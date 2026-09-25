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
  function phaseTarget() { return (S.phase === "work" ? S.workMin : S.breakMin) * 60; }
  function phaseElapsed() {
    return S.phaseAccum + (S.state === "running" ? (now() - S.phaseStartTs) / 1000 : 0);
  }
  function workSeconds() {
    if (!S) return 0;
    var cur = S.phase === "work" ? Math.min(phaseElapsed(), S.workMin * 60) : 0;
    return Math.floor(S.workAccum + cur);
  }
  function canComplete() {
    /* a Pomodoro (or custom-with-break) session may end ✓ at any point after
       the first completed work interval; custom no-break auto-completes */
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
    if (s.assignmentId === undefined) s.assignmentId = null;
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
    var mins = Math.round(workSeconds() / 60);
    return KOS.governor.focusAward({
      complete: canComplete(), mins: mins, pauses: S.pauses
    });
  }

  function start(cfg) {
    if (S) { KOS.ui.toast("A " + (S.kind === "reading" ? "reading" : "focus") + " session is already running.", true); return; }
    var f = F();
    S = f.active = {
      id: "f" + f.nextId++,
      kind: cfg.kind === "reading" ? "reading" : "study",   // 3i: one machine, two contracts
      mode: cfg.mode,                                   // "pomodoro" | "custom"
      workMin: cfg.workMin,
      breakMin: cfg.breakMin,                           // 0 = single interval
      subject: cfg.subject || null,
      ref: cfg.ref || null,
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
      startedAt: now()
    };
    if (S.kind === "reading") {
      f.lastReading = { workMin: cfg.workMin, bookId: cfg.book ? cfg.book.id : null };
    } else {
      f.lastConfig = { mode: cfg.mode, workMin: cfg.workMin, breakMin: cfg.breakMin,
        subject: cfg.subject || "", ref: cfg.ref || "" };
    }
    store.save();
    enterMode();
    timer = setInterval(tick, 1000);
    KOS.ui.toast(S.kind === "reading"
      ? "Reading session started — " + cfg.workMin + " min" + (cfg.book ? " with “" + cfg.book.title + "”" : "") + ". 読書."
      : "Focus session started — " + cfg.workMin + " min" +
        (cfg.breakMin ? " / " + cfg.breakMin + " min break" : "") + ". 集中.");
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

  function tick() {
    if (!S || S.state !== "running") return;
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
      subject: sess.subject, ref: sess.ref,
      dur: dur,
      metrics: {
        complete: complete,
        mode: sess.mode,
        mins: Math.round(dur / 60),
        cycles: sess.cycles,
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
  function hue(sid) { return "var(--c-" + sid + ")"; }
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
      if (S.ref) topic.appendChild(chip(S.ref + (KOS.hub.BYREF[S.subject] && KOS.hub.BYREF[S.subject][S.ref] ? " " + KOS.hub.BYREF[S.subject][S.ref].title : "")));
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
    var col = el("div", { class: "k-fx-col k-fx-notes" }, [el("div", { class: "k-kicker", text: "Quick notes" })]);
    var notes = S.notes || [];
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
    col.appendChild(el("p", { class: "k-fx-caption", text: "Kept with this session. File them when it ends." }));
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

  /* the same quick note, from the dock */
  function promptNote() {
    if (!S) return;
    var input = el("input", { type: "text", class: "k-input", maxlength: String(NOTE_LEN),
      placeholder: "Quick note…", "aria-label": "Quick note",
      onkeydown: function (ev) { if (ev.key === "Enter") save(); } });
    var overlay = dialogShell("Quick note", [
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Kept with this session — file it when it ends" }), input])
    ], [
      el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { overlay.close(); } }),
      el("button", { type: "button", class: "k-btn k-btn--primary", text: "Keep", onclick: save })
    ]);
    function save() {
      if (addNote(input.value)) { KOS.ui.toast("Note kept with the session."); render(); }
      overlay.close();
    }
    KOS.ui.openDialog(overlay);
    input.focus();
  }

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
    if (stageEl) { stageEl.remove(); stageEl = null; }
    if (dockEl) { dockEl.remove(); dockEl = null; }
    document.title = "Kurenai OS — Study Atelier";
  }
  function setMinimised(v) {
    minimised = v;
    if (document.documentElement.hasAttribute("data-focus"))
      document.documentElement.setAttribute("data-focus", v ? "minimised" : "stage");
    /* the setup page under a live session says so instead of offering a second start */
    if (v && store.state.ui.view === "focus") KOS.rerender();
  }

  function render() {
    if (!S || !stageEl) return;
    var paused = S.state === "paused";
    var onBreak = S.phase === "break";
    var reading = S.kind === "reading";
    var phase = paused ? "paused" : onBreak ? "break" : "work";
    var cycleNo = S.cycles + (S.phase === "work" ? 1 : 0);
    var phaseName = paused ? "Paused" : onBreak ? "Break" : reading ? "Reading" : "Focus · cycle " + cycleNo;
    var modeName = reading ? "Reading" : S.mode === "pomodoro" ? "Pomodoro" : "Custom";

    /* ---- full stage ---- */
    stageEl.innerHTML = "";
    stageEl.setAttribute("data-phase", phase);
    stageEl.setAttribute("data-kind", reading ? "reading" : "study");

    stageEl.appendChild(el("div", { class: "k-fx-top" }, [
      el("img", { class: "k-fx-logo", src: "assets/brand/kurenai-bloom.png", alt: "" }),
      el("span", { class: "k-fx-top-t", text: (reading ? "Reading session · " : "Focus session · ") + modeName + " " + S.workMin + " / " + (S.breakMin || "–") }),
      el("span", { class: "k-spacer" }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "focus.minimise", text: "⤡ Minimise",
        title: reading ? "Minimise the clock" : "Minimise the timer and study in the app",
        onclick: function () { setMinimised(true); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm k-fx-end", "data-ui": "focus.end-early", text: "End early",
        title: reading ? "Logs the time read — nothing forfeited" : "Logs the session but forfeits the award", onclick: function () { endEarly(); } })
    ]));

    /* ---- left: what this hour is for ---- */
    var left = el("div", { class: "k-fx-col k-fx-left" });
    if (!reading) {
      left.appendChild(el("div", { class: "k-kicker", text: "Objective" }));
      left.appendChild(S.objective
        ? el("button", { type: "button", class: "k-fx-objective", "data-ui": "focus.objective", title: "Edit the objective",
            onclick: promptObjective, text: S.objective })
        : el("button", { type: "button", class: "k-fx-objective", "data-ui": "focus.objective", "data-state": "empty",
            text: "＋ Set an objective", onclick: promptObjective }));
    }
    left.appendChild(contextNode());
    var stats = [[String(cycleNo || S.cycles), "Cycle"], [String(S.pauses), "Pauses"]];
    if (!reading) stats.push([String(S.distractions.length), "Tab switches"]);
    if ((S.marks || []).length) stats.push([String(S.marks.length), "Marked"]);
    left.appendChild(el("dl", { class: "k-fx-stats" }, stats.map(function (s) {
      return el("div", { class: "k-fx-stat" }, [el("dt", { text: s[1] }), el("dd", { class: "k-mono", text: s[0] })]);
    })));
    if (!reading) left.appendChild(eligibilityNode());
    if (S.subject && S.ref) {
      left.appendChild(el("button", { type: "button", class: "k-link", "data-ui": "focus.open-topic", text: "Open " + S.ref + " and study →",
        onclick: function () { setMinimised(true); KOS.show("ref", { subject: S.subject, ref: S.ref }); } }));
    }

    /* ---- centre: the ring ---- */
    var remain = phaseTarget() - phaseElapsed();
    var ring = el("div", { class: "k-fx-ring", "data-ui": "focus.fill" }, [
      el("div", { class: "k-fx-ring-in" }, [
        el("span", { class: "k-kicker", text: phaseName }),
        el("span", { class: "k-fx-clock", "data-ui": "focus.clock", role: "timer", "aria-label": "Time left", text: fmt(remain) }),
        el("span", { class: "k-fx-at", text: paused ? "paused — " + fmtLong(workSeconds()) + (reading ? " read" : " focused")
          : onBreak ? "focus at " + clockAt(remain)
          : S.breakMin > 0 ? "break at " + clockAt(remain) : "ends at " + clockAt(remain) })
      ])
    ]);
    var ctl = el("div", { class: "k-fx-controls" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary k-fx-big", "data-ui": paused ? "focus.resume" : "focus.pause",
        text: paused ? "▶ Resume" : "⏸ Pause", onclick: paused ? resume : pause }),
      canComplete() ? el("button", { type: "button", class: "k-btn k-fx-big", "data-ui": "focus.end-complete", text: "✓ End session",
        title: "Bank the completed cycles — full award", onclick: function () { endComplete(); } }) : null,
      reading ? null : el("button", { type: "button", class: "k-btn", "data-ui": "focus.mark", text: "Distraction +1",
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
    if (!reading) stageEl.appendChild(progressNode());
    if (!reading) stageEl.appendChild(el("p", { class: "k-fx-foot", text: F().penalizeDistractions === false
      ? "Leaving the tab mid-focus is logged but costs nothing — the HP penalty is off. A refresh costs nothing either way."
      : "Leaving the tab mid-focus counts as a distraction. Pausing is honest — the first is free. A refresh costs nothing." }));

    /* ---- docked bar ---- */
    dockEl.innerHTML = "";
    dockEl.setAttribute("data-phase", phase);
    dockEl.appendChild(el("span", { class: "k-fx-dot", "aria-hidden": "true" }));
    dockEl.appendChild(el("span", { class: "k-fx-dock-clock k-mono", "data-ui": "focus.dock-clock", text: fmt(remain) }));
    dockEl.appendChild(el("span", { class: "k-fx-dock-phase", text: phaseName }));
    dockEl.appendChild(el("span", { class: "k-fx-dock-topic", text: topicLabel() }));
    var dctl = el("span", { class: "k-fx-dock-ctl" });
    dctl.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: paused ? "▶" : "⏸",
      "aria-label": paused ? "Resume" : "Pause", onclick: paused ? resume : pause }));
    /* the note stays reachable while you study minimised — that is exactly
       when something worth writing down turns up */
    if (!reading) dctl.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✎",
      "aria-label": "Add a quick note", title: "Quick note", onclick: promptNote }));
    if (KOS.srs.dueCount()) dctl.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "Due " + KOS.srs.dueCount(),
      onclick: function () { KOS.show("due"); } }));
    dctl.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "⤢ Stage", "aria-label": "Expand the timer",
      onclick: function () { setMinimised(false); } }));
    if (canComplete()) dctl.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "✓ End", onclick: function () { endComplete(); } }));
    dctl.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-fx-end", text: "✕", "aria-label": "End early", onclick: function () { endEarly(); } }));
    dockEl.appendChild(dctl);
    updateClock();
  }

  function updateClock() {
    if (!S) return;
    var remain = fmt(phaseTarget() - phaseElapsed());
    var pct = Math.min(100, Math.round(100 * phaseElapsed() / phaseTarget()));
    if (stageEl) {
      var c = stageEl.querySelector("[data-ui~='focus.clock']");
      if (c) c.textContent = remain;
      var f = stageEl.querySelector("[data-ui~='focus.fill']");
      if (f) f.style.setProperty("--pct", pct + "%");
      var live = stageEl.querySelector(".k-fx-seg[data-live]");
      if (live) live.style.setProperty("--pct", pct + "%");
    }
    if (dockEl) {
      var dc = dockEl.querySelector("[data-ui~='focus.dock-clock']");
      if (dc) dc.textContent = remain;
    }
    document.title = (S ? remain + " · " : "") + "Kurenai OS — Study Atelier";
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

    /* --- 1. what happened --- */
    var facts = [
      ["Focused", fmtLong(entry.dur || 0)],
      ["Cycles", String(sess.cycles || 0)],
      ["Pauses", String(sess.pauses || 0)],
      ["Tab switches", String((sess.distractions || []).length)]
    ];
    if ((sess.marks || []).length) facts.push(["Self-marked", String(sess.marks.length)]);
    if (sess.restores) facts.push(["Recovered", sess.restores + (sess.restores === 1 ? " time" : " times")]);
    body.appendChild(el("dl", { class: "k-fx-rev-facts", "data-ui": "focus.rev-facts" }, facts.map(function (f) {
      return el("div", { class: "k-fx-stat" }, [el("dt", { text: f[0] }), el("dd", { class: "k-mono", text: f[1] })]);
    })));

    /* --- 2. what it paid, from the governor's own record --- */
    var paid = complete && award && (award.xp || award.gold);
    body.appendChild(el("div", { class: "k-fx-rev-award", "data-ui": "focus.rev-award", "data-state": paid ? null : "muted" }, paid
      ? [
          el("b", { text: "+" + award.xp + " XP · +" + award.gold + " gold" + (award.hp ? " · +" + award.hp + " HP" : "") }),
          el("span", { text: (award.notes && award.notes.length) ? award.notes.join(" · ") : "paid in full" }),
          award.levelUp ? el("span", { class: "k-fx-rev-level", text: "Level " + award.level + " reached" }) : null
        ].filter(Boolean)
      : [
          el("b", { text: complete ? "No award was due" : "Award forfeited — ended early" }),
          el("span", { text: "The session is still in the log, on the topic and in the Governor's chronicle." })
        ]));

    function revBlock(h, kids) {
      return el("section", { class: "k-fx-rev-block" }, [el("h3", { class: "k-kicker", text: h })].concat(kids));
    }

    /* --- 3. the objective, and whether it landed --- */
    var result = null;
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
      body.appendChild(revBlock("Objective", [el("p", { class: "k-fx-rev-obj", text: sess.objective }), btns]));
    }

    /* --- 4. one line of reflection --- */
    var reflectIn = el("textarea", { class: "k-input", "data-ui": "focus.rev-reflect", rows: "2",
      maxlength: "400", placeholder: "How did it actually go? (optional)",
      "aria-label": "Quick reflection" });
    body.appendChild(revBlock("Reflection", [reflectIn]));

    /* --- 5. the notes you kept, and where they should live --- */
    var noteDest = "none";
    var destOptions = [["none", "Keep them in the session record only"]];
    if (sess.subject && sess.ref) destOptions.push(["topic", "Add to the " + sess.ref + " topic note"]);
    if (asg) destOptions.push(["assignment", "Add to “" + asg.title + "”"]);
    var destSel = el("select", { class: "k-input", "aria-label": "Where to file these notes" },
      destOptions.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    destSel.addEventListener("change", function () { noteDest = destSel.value; });
    var noteKids = [];
    if ((sess.notes || []).length) {
      noteKids.push(el("ul", { class: "k-fx-note-list" }, sess.notes.map(function (n) {
        return el("li", { class: "k-fx-note", text: n.text });
      })));
    } else {
      noteKids.push(el("p", { class: "k-muted", text: "No notes were jotted. A reflection alone can still be filed." }));
    }
    if (destOptions.length > 1) noteKids.push(destSel);
    body.appendChild(revBlock("Notes", noteKids));

    /* --- 6. the linked assignment: move it on --- */
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

    /* --- 7. today's study block, folded in rather than stacked on --- */
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

    overlay.appendChild(el("div", { class: "k-dialog k-fx-review-dialog", "data-ui": "ui.dialog focus.review-modal" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: complete ? "Session complete" : "Session ended early" }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })
      ]),
      body,
      el("div", { class: "k-dialog-foot" }, [
        el("span", { class: "k-muted", text: "Already recorded — this only adds to it." }),
        el("button", { type: "button", class: "k-btn", text: "Close", onclick: function () { overlay.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save review", onclick: save })
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
    var mode = cfg.mode || "pomodoro";
    var work = el("input", { type: "number", min: 1, max: 240, class: "k-input", "data-ui": "ui.number-input", "aria-label": "Work minutes" });
    var brk = el("input", { type: "number", min: 0, max: 60, class: "k-input", "data-ui": "ui.number-input", "aria-label": "Break minutes" });
    work.value = String(cfg.workMin || 25);
    brk.value = String(cfg.breakMin != null ? cfg.breakMin : 5);

    var hero = el("section", { class: "k-fx-hero", "data-ui": "focus.setup", "aria-label": "New session" });
    var side = el("aside", { class: "k-fx-side", "data-ui": "focus.setup-side" });
    main.appendChild(el("div", { class: "k-fx-setup" }, [hero, side]));

    /* --- the dial: the duration you are about to commit to --- */
    var dialTime = el("span", { class: "k-fx-dial-time k-mono" });
    var dialSub = el("span", { class: "k-fx-dial-sub" });
    function plannedMins() {
      if (mode === "pomodoro") return 25;
      return Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
    }
    function nudge(d) {
      var m = Math.max(5, Math.min(240, plannedMins() + d));
      if (mode === "pomodoro") setMode("custom");
      work.value = String(m);
      sync();
    }
    var dial = el("div", { class: "k-fx-dial" }, [
      el("div", { class: "k-fx-ring k-fx-ring--full" }, [el("div", { class: "k-fx-ring-in" }, [dialTime, dialSub])]),
      el("div", { class: "k-cluster" }, [
        el("button", { type: "button", class: "k-btn k-btn--sm k-mono", "data-ui": "focus.nudge", "aria-label": "Five minutes shorter", text: "−5", onclick: function () { nudge(-5); } }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-mono", "data-ui": "focus.nudge", "aria-label": "Five minutes longer", text: "+5", onclick: function () { nudge(5); } })
      ])
    ]);

    /* --- the form --- */
    var form = el("div", { class: "k-fx-form" });
    var modeRow = el("div", { class: "k-seg k-seg--quiet", role: "group", "aria-label": "Session type" });
    var customFields = el("div", { class: "k-fx-pair", "data-ui": "focus.custom" }, [
      el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: "Work (min)" }), work]),
      el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: "Break (min, 0 = none)" }), brk])
    ]);
    [["pomodoro", "Pomodoro 25 / 5"], ["custom", "Custom"], ["reading", "Reading"]].forEach(function (m) {
      modeRow.appendChild(el("button", { type: "button", class: "k-seg-item", "data-ui": "focus.mode", "data-mode": m[0],
        "aria-pressed": String(mode === m[0]), text: m[1], onclick: function () { setMode(m[0]); sync(); } }));
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

    /* optional subject/topic link */
    var subjSel = el("select", { class: "k-input", "aria-label": "Link to subject", onchange: function () { fillRefs(); fillAssignments(); } }, [
      el("option", { value: "", text: "General study — no link" }),
      el("option", { value: "compsci", text: "Computer Science" }),
      el("option", { value: "maths", text: "Mathematics" }),
      el("option", { value: "it", text: "IT · Data Analytics" })
    ]);
    var refSel = el("select", { class: "k-input", "aria-label": "Topic" });
    /* Build 6.4 — the open assignments a session can be spent on. Read from
       the canonical store; the option list narrows with the subject. */
    var asgSel = el("select", { class: "k-input", "aria-label": "Link to an assignment" });
    function fillAssignments() {
      var keep = asgSel.value;
      asgSel.innerHTML = "";
      asgSel.appendChild(el("option", { value: "", text: "No assignment" }));
      if (!KOS.assignments) { asgSel.disabled = true; return; }
      var rows = KOS.assignments.linkable(subjSel.value || null);
      rows.forEach(function (a) {
        asgSel.appendChild(el("option", { value: String(a.id),
          text: a.title + (a.due ? " · due " + a.due : "") }));
      });
      asgSel.disabled = !rows.length;
      if (keep && rows.some(function (a) { return String(a.id) === keep; })) asgSel.value = keep;
    }
    function fillRefs() {
      refSel.innerHTML = "";
      refSel.appendChild(el("option", { value: "", text: "Whole subject" }));
      var sid = subjSel.value;
      if (!sid) { refSel.disabled = true; return; }
      refSel.disabled = false;
      KOS.hub.LEAVES[sid].forEach(function (l) {
        refSel.appendChild(el("option", { value: l.ref, text: l.ref + " " + l.title }));
      });
    }
    subjSel.value = cfg.subject || "";
    fillRefs();
    fillAssignments();
    /* deep link from an assignment's "Focus on this" — preselect its subject
       and the assignment itself so the session is linked before it starts */
    if (arg && arg.assignmentId != null && KOS.assignments) {
      var linked = KOS.assignments.get(arg.assignmentId);
      if (linked) {
        if (linked.subject) { subjSel.value = linked.subject; fillRefs(); }
        fillAssignments();
        asgSel.value = String(linked.id);
      }
    }
    if (cfg.ref) refSel.value = cfg.ref;
    function field(label, control, wide) {
      return el("label", { class: "k-field" + (wide ? " k-fx-wide" : ""), "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: label }), control]);
    }
    var linkRow = el("div", { class: "k-fx-pair", "data-ui": "focus.link-row" }, [
      field("Link to subject", subjSel), field("Topic (optional)", refSel), field("Assignment (optional)", asgSel, true)
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
      penIn, el("span", { text: "Penalise tab-switches away from the app (−" + DISTRACT_HP + " HP after the first)" })
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
    form.appendChild(el("div", { class: "k-cluster k-fx-go" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary k-fx-start", "data-ui": "focus.start", text: "▶ Start focus", onclick: function () {
        var w = Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
        var b = Math.max(0, Math.min(60, parseInt(brk.value || "0", 10)));
        if (mode === "reading") {
          start({ kind: "reading", mode: "custom", workMin: w, breakMin: 0, book: null });
          return;
        }
        start({
          mode: mode,
          workMin: mode === "pomodoro" ? 25 : w,
          breakMin: mode === "pomodoro" ? 5 : b,
          subject: subjSel.value || null,
          ref: subjSel.value && refSel.value ? refSel.value : null,
          assignmentId: asgSel.value ? parseInt(asgSel.value, 10) : null,
          objective: objIn.value
        });
      } }),
      todayBlock ? el("button", { type: "button", class: "k-btn", "data-ui": "focus.from-plan", text: "From today's plan",
        title: todayBlock.title, onclick: function () {
          if (mode === "reading") setMode("pomodoro");
          if (todayBlock.subject) { subjSel.value = todayBlock.subject; fillRefs(); }
          fillAssignments();
          if (todayBlock.ref) refSel.value = todayBlock.ref;
          if (todayBlock.assignmentId != null) asgSel.value = String(todayBlock.assignmentId);
          if (!objIn.value) objIn.value = todayBlock.title || "";
          sync();
          objIn.focus();
        } }) : null
    ].filter(Boolean)));

    hero.appendChild(dial);
    hero.appendChild(form);

    /* --- right: the record + the deal --- */
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
    side.appendChild(el("section", { class: "k-card" }, [
      el("h2", { class: "k-card-title", text: "Your record" }),
      el("ul", { class: "k-fx-kvs" }, [
        kv("Focused today", todaySecs ? fmtLong(todaySecs) : "—"),
        kv("This week", weekSecs ? fmtLong(weekSecs) : "—"),
        lastText ? kv("Last session", lastText) : null,
        kv("Sessions logged", String(focusSessions.length))
      ].filter(Boolean))
    ]));

    /* the deal, stated plainly — friction only works when it's understood.
       Build 6.5: the top line is QUOTED from governor.focusAward for the
       duration actually selected, so the number on screen is the number
       paid. It re-reads whenever the mode or the custom minutes change. */
    var dealList = el("ul", { class: "k-fx-kvs", "data-ui": "focus.deal-list" });
    var dealFoot = el("p", { class: "k-fx-caption", "data-ui": "focus.deal-foot" });
    function drawDeal() {
      dealList.innerHTML = "";
      if (mode === "reading") {
        [["Reading logs as rest", "rest streak · heatmap", "good"],
         ["Pauses and tab-switches", "never charged", "muted"],
         ["HP and the study streak", "untouched", "muted"]].forEach(function (r) { dealList.appendChild(kv(r[0], r[1], r[2])); });
        dealFoot.textContent = "Refreshing or navigating away costs nothing: the clock is banked and restored paused.";
        return;
      }
      var mins = plannedMins();
      var a = KOS.governor.focusAward({ complete: true, mins: mins, pauses: 0 });
      var twoPauses = KOS.governor.focusAward({ complete: true, mins: mins, pauses: 2 });
      [
        ["One completed " + mins + "-min cycle", "+" + a.xp + " XP · +" + a.gold + " gold · +" + a.hp + " HP", "good"],
        ["Each pause after the first", "−15% award", "bad", twoPauses.xp + " XP at two pauses"],
        ["Each tab-switch after the first", F().penalizeDistractions === false ? "free — off" : "−" + DISTRACT_HP + " HP",
          F().penalizeDistractions === false ? "muted" : "bad"],
        ["Marking a distraction yourself", "free", "muted", "recorded, never charged"],
        ["Ending before a full cycle", "award forfeited", "warn", "the session is still logged in full"]
      ].forEach(function (r) { dealList.appendChild(kv(r[0], r[1], r[2], r[3])); });
      dealFoot.textContent = "Refreshing or navigating away costs nothing: the clock is banked and " +
        "restored paused. Core revision never locks, whatever your HP does.";
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
    function sync() {
      var reading = mode === "reading";
      var mins = plannedMins();
      var b = Math.max(0, Math.min(60, parseInt(brk.value || "0", 10)));
      dialTime.textContent = fmt(mins * 60);
      dialSub.textContent = reading ? "reading · no penalties"
        : mode === "pomodoro" ? "auto-cycling · 5 min breaks"
        : b ? "auto-cycling · " + b + " min breaks" : "one interval";
      customFields.hidden = mode !== "custom" && !reading;
      brk.closest(".k-field").hidden = reading;
      linkRow.hidden = reading;
      objField.hidden = reading;
      penField.hidden = reading;
      drawDeal();                     // the quoted award follows the choice
    }
    setMode(mode);
    sync();
    work.addEventListener("input", sync);
    brk.addEventListener("input", sync);
  };

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
    /* test helper: shift the phase clock backwards so suites can cross
       interval boundaries without waiting on wall time */
    _debugAdvance: function (sec) {
      if (!S) return;
      if (S.state === "running") S.phaseStartTs -= sec * 1000;
      else S.phaseAccum += sec;
    }
  };
})();
