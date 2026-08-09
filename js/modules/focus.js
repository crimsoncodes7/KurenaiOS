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
     ever touching HP, and rest doesn't owe anyone its attention. */
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
      if (S.distractions.length > DISTRACT_FREE) KOS.governor.drainHp(DISTRACT_HP);
      pendingDistractToast = true;
      store.save();
    } else if (pendingDistractToast) {
      pendingDistractToast = false;
      var n = S.distractions.length;
      KOS.ui.toast("Distraction #" + n + " logged" +
        (n > DISTRACT_FREE ? " · −" + DISTRACT_HP + " HP" : " — first one's free"), n > DISTRACT_FREE);
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

  /* ---------------- Focus Mode UI (FR-5.3) ---------------- */
  function topicLabel() {
    if (S && S.kind === "reading") return S.book ? S.book.title : "Reading — no book linked";
    if (!S || !S.subject) return "General study";
    var name = KOS_DATA[S.subject] ? KOS_DATA[S.subject].name : S.subject;
    if (S.ref && KOS.hub.BYREF[S.subject] && KOS.hub.BYREF[S.subject][S.ref]) {
      return name + " · " + S.ref + " " + KOS.hub.BYREF[S.subject][S.ref].title;
    }
    return name;
  }

  /* ---------------- running-state pieces (Build 6.5) ----------------
     Each is small and each earns its place: nothing here is filler, and the
     clock stays the largest thing on the stage. */

  /* session progress — banked cycles as pips, plus where this one is going */
  function progressNode() {
    var live = S.phase === "work" ? 1 : 0;
    var shown = Math.min(S.cycles + live, 12);
    var pips = el("span", { class: "fx-pips", "aria-hidden": "true" });
    for (var i = 0; i < shown; i++) {
      pips.appendChild(el("i", { class: "fx-pip" + (i < S.cycles ? " done" : " live") }));
    }
    var banked = S.cycles
      ? S.cycles + " cycle" + (S.cycles === 1 ? "" : "s") + " banked"
      : (S.breakMin > 0 ? "first cycle in progress" : "single interval");
    var label = banked + (S.cycles > 12 ? " (+" + (S.cycles - 12) + ")" : "");
    return el("div", { class: "fx-progress", role: "status" }, [
      S.cycles || S.phase === "work" ? pips : null,
      el("span", { class: "fx-progress-t", text: label })
    ].filter(Boolean));
  }

  /* reward eligibility — the live read of the same arithmetic the governor
     pays from, so ending is never a guess */
  function eligibilityNode() {
    var e = eligibility();
    if (!e) return el("span");
    if (e.forfeited) {
      return el("div", { class: "fx-elig warn", role: "status" }, [
        el("b", { text: "Ending now forfeits the award" }),
        el("span", { text: S.breakMin > 0
          ? "Finish this " + S.workMin + "-minute cycle and it banks in full."
          : "Let the interval run out and it completes itself." })
      ]);
    }
    return el("div", { class: "fx-elig", role: "status" }, [
      el("b", { text: "Ending now pays +" + e.xp + " XP · +" + e.gold + " gold · +" + e.hp + " HP" }),
      el("span", { text: e.extraPauses
        ? e.extraPauses + " extra pause" + (e.extraPauses > 1 ? "s" : "") + " already cost " + e.penaltyPct + "%"
        : "one pause is still free" })
    ]);
  }

  /* the working row: a quick note and an honest distraction marker */
  function toolsNode() {
    var wrap = el("div", { class: "fx-tools" });
    var input = el("input", { type: "text", class: "todo-in fx-note-in", maxlength: String(NOTE_LEN),
      placeholder: "Quick note…  (⏎ to keep)", "aria-label": "Quick note",
      onkeydown: function (ev) {
        if (ev.key !== "Enter") return;
        if (addNote(input.value)) { input.value = ""; render(); }
      } });
    wrap.appendChild(input);
    wrap.appendChild(el("button", { class: "mini-btn", text: "⚑ Mark a distraction",
      title: "Record it yourself — no HP cost", onclick: markDistraction }));

    var notes = S.notes || [];
    if (notes.length) {
      var det = el("details", { class: "fx-notes" });
      det.appendChild(el("summary", { text: notes.length + " note" + (notes.length === 1 ? "" : "s") + " kept" }));
      var list = el("ul", { class: "fx-note-list" });
      notes.forEach(function (n, i) {
        list.appendChild(el("li", {}, [
          el("span", { text: n.text }),
          el("button", { class: "xbtn", text: "✕", "aria-label": "Remove note",
            onclick: function () { removeNote(i); render(); } })
        ]));
      });
      det.appendChild(list);
      wrap.appendChild(det);
    }
    return wrap;
  }

  /* the objective — one line, editable at any point without stopping */
  function promptObjective() {
    if (!S) return;
    var overlay = modalOverlay();
    var input = el("input", { type: "text", class: "todo-in", maxlength: "200",
      value: S.objective || "", placeholder: "What is this session for?",
      onkeydown: function (ev) { if (ev.key === "Enter") save(); } });
    function save() { setObjective(input.value); overlay.close(); }
    overlay.appendChild(el("div", { class: "modal modal-sm" }, [
      el("div", { class: "modal-h" }, [el("b", { text: "Session objective" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })]),
      el("div", { class: "med-form" }, [
        el("label", { class: "cal-field" }, [el("span", { text: "One line — it rides the session record" }), input])
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "Save", onclick: save })
      ])
    ]));
    KOS.ui.openDialog(overlay);
    input.focus();
  }

  /* the same quick note, from the dock */
  function promptNote() {
    if (!S) return;
    var overlay = modalOverlay();
    var input = el("input", { type: "text", class: "todo-in", maxlength: String(NOTE_LEN),
      placeholder: "Quick note…", "aria-label": "Quick note",
      onkeydown: function (ev) { if (ev.key === "Enter") save(); } });
    function save() {
      if (addNote(input.value)) { KOS.ui.toast("Note kept with the session."); render(); }
      overlay.close();
    }
    overlay.appendChild(el("div", { class: "modal modal-sm" }, [
      el("div", { class: "modal-h" }, [el("b", { text: "Quick note" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })]),
      el("div", { class: "med-form" }, [
        el("label", { class: "cal-field" }, [el("span", { text: "Kept with this session — file it when it ends" }), input])
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "Keep", onclick: save })
      ])
    ]));
    KOS.ui.openDialog(overlay);
    input.focus();
  }

  /* the shared modal shell, with a local fallback: focus.js loads before
     medview.js, and the timer must never depend on a vault module being
     present to close a session */
  function modalOverlay() {
    if (KOS.medview && KOS.medview.modalOverlay) return KOS.medview.modalOverlay();
    var ov = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === ov) ov.close(); } });
    ov.close = function () { ov.remove(); };
    return ov;
  }

  function enterMode() {
    document.body.classList.add("focus-mode");
    minimised = false;
    stageEl = el("div", { class: "fx-stage", role: "dialog", "aria-label": "Focus session" });
    dockEl = el("div", { class: "fx-dock" });
    document.body.appendChild(stageEl);
    document.body.appendChild(dockEl);
    render();
  }
  function exitMode() {
    document.body.classList.remove("focus-mode", "fx-minimised");
    if (stageEl) { stageEl.remove(); stageEl = null; }
    if (dockEl) { dockEl.remove(); dockEl = null; }
    document.title = "Kurenai OS — Study Atelier";
  }
  function setMinimised(v) {
    minimised = v;
    document.body.classList.toggle("fx-minimised", v);
  }

  function render() {
    if (!S || !stageEl) return;
    var paused = S.state === "paused";
    var onBreak = S.phase === "break";
    var reading = S.kind === "reading";
    var phaseName = paused ? "PAUSED" : onBreak ? "BREAK" : reading ? "READING" : "FOCUS";
    var phaseCls = paused ? "paused" : onBreak ? "break" : "work";

    /* ---- full stage ---- */
    stageEl.innerHTML = "";
    stageEl.className = "fx-stage fx-" + phaseCls + (reading ? " fx-reading" : "");
    stageEl.appendChild(el("div", { class: "fx-kanji", "aria-hidden": "true", text: onBreak ? "息" : reading ? "読書" : "集中" }));
    stageEl.appendChild(el("div", { class: "fx-phase", text: phaseName }));
    stageEl.appendChild(el("div", { class: "fx-clock", text: fmt(phaseTarget() - phaseElapsed()) }));
    stageEl.appendChild(el("div", { class: "fx-track" }, [el("span", { class: "fx-fill" })]));

    /* ---- the context this session was started for (Build 6.5) ---- */
    var asg = linkedAssignment();
    stageEl.appendChild(el("div", { class: "fx-topic", text: topicLabel() }));
    if (asg) {
      stageEl.appendChild(el("div", { class: "fx-context" }, [
        el("span", { class: "fx-ctx-chip", text: "課 " + asg.title }),
        asg.due ? el("span", { class: "fx-ctx-chip sub", text: "due " + asg.due }) : null
      ].filter(Boolean)));
    }

    /* ---- the objective, in its own line — the one thing this hour is for ---- */
    if (!reading) {
      stageEl.appendChild(S.objective
        ? el("button", { class: "fx-objective", title: "Edit the objective",
            onclick: promptObjective }, [
            el("span", { class: "fx-obj-k", "aria-hidden": "true", text: "◎" }),
            el("span", { class: "fx-obj-t", text: S.objective })
          ])
        : el("button", { class: "fx-objective ghost", text: "＋ Set an objective for this session",
            onclick: promptObjective }));
    }

    stageEl.appendChild(el("div", { class: "fx-meta", text:
      (reading ? "Reading " : S.mode === "pomodoro" ? "Pomodoro " : "Custom ") + S.workMin + "/" + (S.breakMin || "–") +
      " · cycle " + (S.cycles + (S.phase === "work" && !paused ? 1 : 0)) +
      " · " + fmtLong(workSeconds()) + (reading ? " read" : " focused") }));

    /* ---- session progress: one pip per banked cycle, plus the live one ---- */
    if (!reading) stageEl.appendChild(progressNode());

    stageEl.appendChild(reading
      ? el("div", { class: "fx-stats" }, [
          el("span", { text: "rest, not study — pause freely, no penalties" })
        ])
      : el("div", { class: "fx-stats" }, [
          el("span", { text: "pauses " + S.pauses + " (1 free)" }),
          el("span", { text: "tab switches " + S.distractions.length + " (" + DISTRACT_FREE + " free)" }),
          (S.marks || []).length ? el("span", { text: "marked " + S.marks.length }) : null
        ].filter(Boolean)));

    /* ---- what ending now would pay, stated before it is decided ---- */
    if (!reading) stageEl.appendChild(eligibilityNode());
    var ctl = el("div", { class: "fx-controls" });
    ctl.appendChild(el("button", { class: "btn primary fx-big", text: paused ? "▶ Resume" : "⏸ Pause",
      onclick: paused ? resume : pause }));
    if (canComplete()) ctl.appendChild(el("button", { class: "btn jade fx-big", text: "✓ End session",
      title: "Bank the completed cycles — full award", onclick: endComplete }));
    ctl.appendChild(el("button", { class: "btn gold", text: reading ? "⤓ Minimise the clock" : "⤓ Study while focused",
      title: "Minimise the timer and use the (chrome-free) app", onclick: function () { setMinimised(true); } }));
    ctl.appendChild(el("button", { class: "btn danger", text: "✕ End early",
      title: reading ? "Logs the time read — nothing forfeited" : "Logs the session but forfeits the award", onclick: endEarly }));
    stageEl.appendChild(ctl);

    /* ---- the working row: jot a note, own a distraction (Build 6.5) ---- */
    if (!reading) stageEl.appendChild(toolsNode());

    if (S.subject && S.ref) {
      stageEl.appendChild(el("button", { class: "fx-open-topic", text: "Open " + S.ref + " and study →",
        onclick: function () { setMinimised(true); KOS.show("ref", { subject: S.subject, ref: S.ref }); } }));
    }
    stageEl.appendChild(el("p", { class: "fx-note", text: reading
      ? "Put the screen down and read. The clock logs to your reading heatmap and rest streak when it ends — HP and the study streak are never touched."
      : "Leaving the tab mid-focus counts as a distraction. Pausing is honest — the first is free. A refresh costs nothing." }));

    /* ---- docked bar ---- */
    dockEl.innerHTML = "";
    dockEl.className = "fx-dock fx-" + phaseCls;
    dockEl.appendChild(el("span", { class: "fx-dot", "aria-hidden": "true" }));
    dockEl.appendChild(el("span", { class: "fx-dock-clock", text: fmt(phaseTarget() - phaseElapsed()) }));
    dockEl.appendChild(el("span", { class: "fx-dock-phase", text: phaseName }));
    dockEl.appendChild(el("span", { class: "fx-dock-topic", text: topicLabel() }));
    var dctl = el("span", { class: "fx-dock-ctl" });
    dctl.appendChild(el("button", { class: "mini-btn", text: paused ? "▶" : "⏸",
      "aria-label": paused ? "Resume" : "Pause", onclick: paused ? resume : pause }));
    /* the note stays reachable while you study minimised — that is exactly
       when something worth writing down turns up */
    if (!reading) dctl.appendChild(el("button", { class: "mini-btn", text: "✎",
      "aria-label": "Add a quick note", title: "Quick note", onclick: promptNote }));
    if (KOS.srs.dueCount()) dctl.appendChild(el("button", { class: "mini-btn", text: "Due " + KOS.srs.dueCount(),
      onclick: function () { KOS.show("due"); } }));
    dctl.appendChild(el("button", { class: "mini-btn", text: "⤢ Stage", "aria-label": "Expand the timer",
      onclick: function () { setMinimised(false); } }));
    if (canComplete()) dctl.appendChild(el("button", { class: "mini-btn", text: "✓ End", onclick: endComplete }));
    dctl.appendChild(el("button", { class: "mini-btn danger", text: "✕", "aria-label": "End early", onclick: endEarly }));
    dockEl.appendChild(dctl);
    updateClock();
  }

  function updateClock() {
    if (!S) return;
    var remain = fmt(phaseTarget() - phaseElapsed());
    var pct = Math.min(100, Math.round(100 * phaseElapsed() / phaseTarget()));
    if (stageEl) {
      var c = stageEl.querySelector(".fx-clock");
      if (c) c.textContent = remain;
      var f = stageEl.querySelector(".fx-fill");
      if (f) f.style.width = pct + "%";
    }
    if (dockEl) {
      var dc = dockEl.querySelector(".fx-dock-clock");
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
    var overlay = modalOverlay();
    var closed = false;
    var origClose = overlay.close;
    overlay.close = function () {
      if (closed) return;
      closed = true;
      origClose();
      refreshAfterSession();
    };

    var body = el("div", { class: "fx-review" });

    /* --- 1. what happened --- */
    var facts = [
      ["Focused", fmtLong(entry.dur || 0)],
      ["Cycles", String(sess.cycles || 0)],
      ["Pauses", String(sess.pauses || 0)],
      ["Tab switches", String((sess.distractions || []).length)]
    ];
    if ((sess.marks || []).length) facts.push(["Self-marked", String(sess.marks.length)]);
    if (sess.restores) facts.push(["Recovered", sess.restores + (sess.restores === 1 ? " time" : " times")]);
    body.appendChild(el("div", { class: "fx-rev-facts" }, facts.map(function (f) {
      return el("div", { class: "fx-rev-fact" }, [
        el("span", { class: "k", text: f[0] }), el("b", { text: f[1] })
      ]);
    })));

    /* --- 2. what it paid, from the governor's own record --- */
    body.appendChild(complete && award && (award.xp || award.gold)
      ? el("div", { class: "fx-rev-award" }, [
          el("b", { text: "+" + award.xp + " XP · +" + award.gold + " gold" +
            (award.hp ? " · +" + award.hp + " HP" : "") }),
          el("span", { text: (award.notes && award.notes.length)
            ? award.notes.join(" · ")
            : "paid in full" }),
          award.levelUp ? el("span", { class: "fx-rev-level", text: "Level " + award.level + " reached" }) : null
        ].filter(Boolean))
      : el("div", { class: "fx-rev-award muted" }, [
          el("b", { text: complete ? "No award was due" : "Award forfeited — ended early" }),
          el("span", { text: "The session is still in the log, on the topic and in the Governor's chronicle." })
        ]));

    /* --- 3. the objective, and whether it landed --- */
    var result = null;
    if (sess.objective) {
      var btns = el("div", { class: "fx-rev-choices", role: "group", "aria-label": "Objective result" });
      OBJ_RESULTS.forEach(function (o) {
        var b = el("button", { class: "fx-rev-choice", text: o.label, onclick: function () {
          result = result === o.v ? null : o.v;
          btns.querySelectorAll(".fx-rev-choice").forEach(function (x) { x.classList.remove("active"); });
          if (result) b.classList.add("active");
        } });
        btns.appendChild(b);
      });
      body.appendChild(revBlock("Objective", [
        el("p", { class: "fx-rev-obj", text: sess.objective }), btns
      ]));
    }

    /* --- 4. one line of reflection --- */
    var reflectIn = el("textarea", { class: "todo-in fx-rev-reflect", rows: "2",
      maxlength: "400", placeholder: "How did it actually go? (optional)",
      "aria-label": "Quick reflection" });
    body.appendChild(revBlock("Reflection", [reflectIn]));

    /* --- 5. the notes you kept, and where they should live --- */
    var noteDest = "none";
    var destOptions = [["none", "Keep them in the session record only"]];
    if (sess.subject && sess.ref) destOptions.push(["topic", "Add to the " + sess.ref + " topic note"]);
    if (asg) destOptions.push(["assignment", "Add to “" + asg.title + "”"]);
    var destSel = el("select", { class: "status-sel", "aria-label": "Where to file these notes" },
      destOptions.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    destSel.addEventListener("change", function () { noteDest = destSel.value; });
    var noteKids = [];
    if ((sess.notes || []).length) {
      noteKids.push(el("ul", { class: "fx-rev-notes" }, sess.notes.map(function (n) {
        return el("li", { text: n.text });
      })));
    } else {
      noteKids.push(el("p", { class: "sub", text: "No notes were jotted. A reflection alone can still be filed." }));
    }
    if (destOptions.length > 1) noteKids.push(destSel);
    body.appendChild(revBlock("Notes", noteKids));

    /* --- 6. the linked assignment: move it on --- */
    var progIn = null, statusSel = null, subBoxes = [], progTouched = false;
    if (asg) {
      var kids = [];
      kids.push(el("p", { class: "fx-rev-asg-h" }, [
        el("b", { text: asg.title }),
        el("span", { class: "sub", text: complete
          ? "+" + Math.round((entry.dur || 0) / 60) + " min banked · " + (asg.actualMins || 0) + " min total"
          : "effort is not banked from a session that ended early" })
      ]));
      var open = (asg.subtasks || []).filter(function (s) { return !s.done; }).slice(0, 8);
      if (open.length) {
        var subWrap = el("div", { class: "fx-rev-subs" });
        open.forEach(function (s) {
          var cb = el("input", { type: "checkbox", id: "fxsub" + s.id });
          subBoxes.push({ box: cb, sub: s });
          subWrap.appendChild(el("label", { class: "fx-rev-sub" }, [
            cb, el("span", { text: s.text })
          ]));
        });
        kids.push(subWrap);
      }
      progIn = el("input", { type: "range", min: "0", max: "100", step: "5",
        value: String(asg.progress || 0), class: "fx-rev-range", "aria-label": "Assignment progress" });
      var progOut = el("b", { class: "fx-rev-pct", text: (asg.progress || 0) + "%" });
      progIn.addEventListener("input", function () {
        progTouched = true;
        progOut.textContent = progIn.value + "%";
      });
      kids.push(el("div", { class: "fx-rev-prog" }, [
        el("span", { class: "k", text: "Progress" }), progIn, progOut
      ]));
      statusSel = el("select", { class: "status-sel", "aria-label": "Assignment status" },
        KOS.assignments.STATUSES.map(function (st) {
          return el("option", { value: st.v, text: st.label });
        }));
      statusSel.value = asg.status;
      kids.push(el("label", { class: "cal-field" }, [el("span", { text: "Status" }), statusSel]));
      body.appendChild(revBlock("Assignment", kids));
    }

    /* --- 7. today's study block, folded in rather than stacked on --- */
    var blockBox = null;
    if (block) {
      blockBox = el("input", { type: "checkbox", id: "fxblk", checked: "checked" });
      body.appendChild(revBlock("Today's plan", [
        el("label", { class: "fx-rev-sub" }, [
          blockBox, el("span", { text: "Mark the study block “" + block.title + "” as done" })
        ])
      ]));
    }

    function revBlock(h, kids) {
      return el("div", { class: "fx-rev-block" }, [el("h4", { text: h })].concat(kids));
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

    overlay.appendChild(el("div", { class: "modal modal-lg fx-review-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: complete ? "Session complete" : "Session ended early" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕",
          "aria-label": "Close", onclick: overlay.close })
      ]),
      body,
      el("div", { class: "lab-controls med-modal-foot" }, [
        el("span", { class: "sub", style: "flex:1", text: "Already recorded — this only adds to it." }),
        el("button", { class: "btn", text: "Close", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "Save review", onclick: save })
      ])
    ]));
    KOS.ui.openDialog(overlay);
    var first = overlay.querySelector(".fx-rev-choice, .fx-rev-reflect");
    if (first) first.focus();
    return overlay;
  }

  /* ---------------- start view (rail: Focus) ---------------- */
  KOS.views.focus = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "The quiet hour" }),
        el("h1", { text: "Focus Timer" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "The session records what you actually did while the clock ran." })
        ])
      ])
    ]));

    if (S) {
      main.appendChild(el("div", { class: "gov-banner warn" }, [
        el("span", { html: "<b>Session in progress</b> — " + KOS.hub.esc(topicLabel()) }),
        el("button", { class: "btn primary", text: "Return to the stage →", onclick: function () { setMinimised(false); } })
      ]));
      return;
    }

    var cfg = Object.assign({}, F().lastConfig);
    /* Contextual entry points (such as Compare Topics) prefill the existing
       subject/topic controls without changing the user's saved configuration
       until they deliberately start a session. */
    if (arg && arg.subject) { cfg.subject = arg.subject; cfg.ref = arg.ref || ""; }
    var mode = cfg.mode || "pomodoro";
    var work = el("input", { type: "number", min: 1, max: 240, class: "cal-in fx-num" });
    var brk = el("input", { type: "number", min: 0, max: 60, class: "cal-in fx-num" });
    work.value = String(cfg.workMin || 25);
    brk.value = String(cfg.breakMin != null ? cfg.breakMin : 5);

    var grid = el("div", { class: "fx-setup" });
    main.appendChild(grid);

    /* --- left: the session you're about to start --- */
    var setup = el("section", { class: "fx-setup-main" });
    grid.appendChild(setup);

    var modeRow = el("div", { class: "fx-modes" });
    var customFields = el("div", { class: "fx-custom", style: mode === "custom" ? "" : "display:none" }, [
      el("label", { class: "cal-field" }, [el("span", { text: "Work (min)" }), work]),
      el("label", { class: "cal-field" }, [el("span", { text: "Break (min, 0 = none)" }), brk])
    ]);
    function modeCard(id, kanji, title, desc) {
      var c = el("button", { class: "fx-mode-card" + (mode === id ? " active" : ""), onclick: function () {
        mode = id;
        modeRow.querySelectorAll(".fx-mode-card").forEach(function (b) { b.classList.remove("active"); });
        c.classList.add("active");
        customFields.style.display = id === "custom" ? "" : "none";
        drawDeal();                     // the quoted award follows the choice
      } }, [
        el("span", { class: "fx-mode-k", "aria-hidden": "true", text: kanji }),
        el("span", { class: "fx-mode-t" }, [el("b", { text: title }), el("span", { text: desc })])
      ]);
      return c;
    }
    modeRow.appendChild(modeCard("pomodoro", "波", "Pomodoro", "25 / 5, auto-cycling — end after any completed wave."));
    modeRow.appendChild(modeCard("custom", "灯", "Custom", "Your own duration, break optional."));
    setup.appendChild(modeRow);
    setup.appendChild(customFields);

    /* optional subject/topic link */
    var subjSel = el("select", { class: "status-sel", onchange: function () { fillRefs(); fillAssignments(); } }, [
      el("option", { value: "", text: "General study — no link" }),
      el("option", { value: "compsci", text: "Computer Science" }),
      el("option", { value: "maths", text: "Mathematics" }),
      el("option", { value: "it", text: "IT · Data Analytics" })
    ]);
    var refSel = el("select", { class: "status-sel" });
    /* Build 6.4 — the open assignments a session can be spent on. Read from
       the canonical store; the option list narrows with the subject. */
    var asgSel = el("select", { class: "status-sel", "aria-label": "Link to an assignment" });
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
        refSel.appendChild(el("option", { value: l.ref, text: l.ref + " — " + l.title }));
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
    setup.appendChild(el("div", { class: "fx-link-row" }, [
      el("label", { class: "cal-field" }, [el("span", { text: "Link to subject" }), subjSel]),
      el("label", { class: "cal-field" }, [el("span", { text: "Topic (optional)" }), refSel]),
      el("label", { class: "cal-field" }, [el("span", { text: "Assignment (optional)" }), asgSel])
    ]));

    /* Build 6.5 — the objective. One line, optional, and the last thing asked
       before starting: it is what the completion review reports back. */
    var objIn = el("input", { type: "text", class: "todo-in fx-obj-in", maxlength: "200",
      placeholder: "e.g. finish the tree-traversal exam questions",
      "aria-label": "Session objective" });
    setup.appendChild(el("label", { class: "cal-field fx-obj-field" }, [
      el("span", { text: "Objective (optional)" }), objIn
    ]));

    setup.appendChild(el("button", { class: "btn primary fx-start", text: "◉ Start focus session", onclick: function () {
      var w = Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
      var b = Math.max(0, Math.min(60, parseInt(brk.value || "0", 10)));
      start({
        mode: mode,
        workMin: mode === "pomodoro" ? 25 : w,
        breakMin: mode === "pomodoro" ? 5 : b,
        subject: subjSel.value || null,
        ref: subjSel.value && refSel.value ? refSel.value : null,
        assignmentId: asgSel.value ? parseInt(asgSel.value, 10) : null,
        objective: objIn.value
      });
    } }));

    /* --- right: the deal + your recent record --- */
    var side = el("aside", { class: "fx-setup-side" });
    grid.appendChild(side);

    /* the deal, stated plainly — friction only works when it's understood.
       Build 6.5: the top line is QUOTED from governor.focusAward for the
       duration actually selected, so the number on screen is the number
       paid. It re-reads whenever the mode or the custom minutes change. */
    var dealList = el("ul", { class: "insp-list fx-deal-list" });
    var dealFoot = el("p", { class: "fx-deal-foot" });
    function plannedMins() {
      if (mode === "pomodoro") return 25;
      return Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
    }
    function drawDeal() {
      var mins = plannedMins();
      var a = KOS.governor.focusAward({ complete: true, mins: mins, pauses: 0 });
      var twoPauses = KOS.governor.focusAward({ complete: true, mins: mins, pauses: 2 });
      dealList.innerHTML = "";
      [
        ["One completed " + mins + "-minute cycle", "+" + a.xp + " XP · +" + a.gold + " gold · +" + a.hp + " HP"],
        ["Each pause after the first", "−15% (" + twoPauses.xp + " XP at two)"],
        ["Each tab-switch after the first", "−" + DISTRACT_HP + " HP, charged as it happens"],
        ["Marking a distraction yourself", "free — recorded, never charged"],
        ["Ending before a full cycle", "logged in full, award forfeited"]
      ].forEach(function (row) {
        dealList.appendChild(el("li", {}, [
          el("span", { text: row[0] }), el("strong", { text: row[1] })
        ]));
      });
      dealFoot.textContent = "Refreshing or navigating away costs nothing: the clock is banked and " +
        "restored paused. Core revision never locks, whatever your HP does.";
    }
    drawDeal();
    work.addEventListener("input", drawDeal);
    side.appendChild(el("div", { class: "fx-deal" }, [
      el("h4", { text: "The deal" }), dealList, dealFoot
    ]));

    /* recent focus record */
    var focusSessions = KOS.sessions.all().filter(function (s) { return s.type === "focus"; });
    var today = KOS.srs.todayISO();
    var todaySecs = focusSessions.filter(function (s) { return s.date === today; })
      .reduce(function (a, s) { return a + (s.dur || 0); }, 0);
    var weekStart = KOS.srs.addDays(today, -6);
    var weekSecs = focusSessions.filter(function (s) { return s.date >= weekStart; })
      .reduce(function (a, s) { return a + (s.dur || 0); }, 0);
    var lastS = focusSessions[focusSessions.length - 1];
    side.appendChild(el("div", { class: "fx-deal" }, [
      el("h4", { text: "Your record" }),
      el("ul", { class: "insp-list" }, [
        el("li", {}, [el("span", { text: "Focused today" }), el("strong", { text: todaySecs ? fmtLong(todaySecs) : "—" })]),
        el("li", {}, [el("span", { text: "This week" }), el("strong", { text: weekSecs ? fmtLong(weekSecs) : "—" })]),
        lastS ? el("li", {}, [el("span", { text: "Last session" }), el("strong", { text: fmtLong(lastS.dur || 0) + (lastS.metrics && lastS.metrics.complete ? "" : " · early") })]) : null,
        el("li", {}, [el("span", { text: "Sessions logged" }), el("strong", { text: String(focusSessions.length) })])
      ].filter(Boolean))
    ]));
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
