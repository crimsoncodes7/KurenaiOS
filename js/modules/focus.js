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
   type:"media" awards 0 HP by the 3a contract in governor.onSession.       */
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
      book: cfg.book || null,                           // 3i: {id,title}|null — the linked vault entry
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

  function endEarly() {
    if (!S) return;
    KOS.ui.confirm({ title: "End early?", confirm: "End session",
      body: S.kind === "reading"
        ? "The time you read still gets logged — nothing is forfeited, reading is rest."
        : "It still gets logged — the data point matters — but the XP and gold award is forfeited." },
      function () { finish(false); });
  }
  function endComplete() {
    if (!S || !canComplete()) return;
    finish(true);
  }

  function finish(complete) {
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

    KOS.sessions.log({
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
        activities: counts,
        summary: summary
      }
    });

    /* calendar hook: a completed linked session can tick today's matching
       study block in the daily to-do */
    if (complete && sess.subject) offerBlockTick(sess);

    KOS.refreshHUD();
    if (KOS.refreshRailCounters) KOS.refreshRailCounters();
    /* if the user was sitting on the focus start view, refresh it */
    if (store.state.ui.view === "focus") KOS.show("focus", undefined, { _nav: true });
  }

  function offerBlockTick(sess) {
    var today = KOS.srs.todayISO();
    var blocks = KOS.calendar.eventsOn(today).filter(function (e) {
      return e.type === "study" && e.subject === sess.subject &&
        (!sess.ref || !e.ref || e.ref === sess.ref);
    });
    var t = store.state.todo;
    var open = blocks.find(function (e) { return !t.autoChecked[today + "|blk" + e.id]; });
    if (!open) return;
    KOS.ui.confirm({ title: "Study block done?", body: "Mark today's study block “" + open.title + "” as done?", confirm: "Mark done" }, function () {
      t.autoChecked[today + "|blk" + open.id] = true;
      store.save();
      KOS.ui.toast("Study block ticked off.");
    });
  }

  /* ---------------- deterrents ---------------- */
  /* native leave-confirmation while the clock is actually running */
  window.addEventListener("beforeunload", function (e) {
    if (S && S.state === "running") {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* unannounced tab-switch during a running WORK phase = distraction.
     Reading sessions are exempt WHOLESALE (3i): no logging, no HP nick —
     the Collection Matrix contract forbids this module's activities from
     ever touching HP, and rest doesn't owe anyone its attention. */
  document.addEventListener("visibilitychange", function () {
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
    stageEl.appendChild(el("div", { class: "fx-topic", text: topicLabel() }));
    stageEl.appendChild(el("div", { class: "fx-meta", text:
      (reading ? "Reading " : S.mode === "pomodoro" ? "Pomodoro " : "Custom ") + S.workMin + "/" + (S.breakMin || "–") +
      " · cycle " + (S.cycles + (S.phase === "work" && !paused ? 1 : 0)) +
      " · " + fmtLong(workSeconds()) + (reading ? " read" : " focused") }));
    stageEl.appendChild(reading
      ? el("div", { class: "fx-stats" }, [
          el("span", { text: "rest, not study — pause freely, no penalties" })
        ])
      : el("div", { class: "fx-stats" }, [
          el("span", { text: "pauses " + S.pauses + " (1 free)" }),
          el("span", { text: "distractions " + S.distractions.length + " (" + DISTRACT_FREE + " free)" })
        ]));
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
    if (S.subject && S.ref) {
      stageEl.appendChild(el("button", { class: "fx-open-topic", text: "Open " + S.ref + " and study →",
        onclick: function () { setMinimised(true); KOS.show("ref", { subject: S.subject, ref: S.ref }); } }));
    }
    stageEl.appendChild(el("p", { class: "fx-note", text: reading
      ? "Put the screen down and read. The clock logs to your reading heatmap and rest streak when it ends — HP and the study streak are never touched."
      : "Leaving the tab mid-focus counts as a distraction. Pausing is honest — the first is free." }));

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

  /* ---------------- start view (rail: Focus) ---------------- */
  KOS.views.focus = function (main) {
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

    var cfg = F().lastConfig;
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
    var subjSel = el("select", { class: "status-sel", onchange: function () { fillRefs(); } }, [
      el("option", { value: "", text: "General study — no link" }),
      el("option", { value: "compsci", text: "Computer Science" }),
      el("option", { value: "maths", text: "Mathematics" }),
      el("option", { value: "it", text: "IT · Data Analytics" })
    ]);
    var refSel = el("select", { class: "status-sel" });
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
    if (cfg.ref) refSel.value = cfg.ref;
    setup.appendChild(el("div", { class: "fx-link-row" }, [
      el("label", { class: "cal-field" }, [el("span", { text: "Link to subject" }), subjSel]),
      el("label", { class: "cal-field" }, [el("span", { text: "Topic (optional)" }), refSel])
    ]));

    setup.appendChild(el("button", { class: "btn primary fx-start", text: "◉ Start focus session", onclick: function () {
      var w = Math.max(1, Math.min(240, parseInt(work.value || "25", 10)));
      var b = Math.max(0, Math.min(60, parseInt(brk.value || "0", 10)));
      start({
        mode: mode,
        workMin: mode === "pomodoro" ? 25 : w,
        breakMin: mode === "pomodoro" ? 5 : b,
        subject: subjSel.value || null,
        ref: subjSel.value && refSel.value ? refSel.value : null
      });
    } }));

    /* --- right: the deal + your recent record --- */
    var side = el("aside", { class: "fx-setup-side" });
    grid.appendChild(side);

    /* the deal, stated plainly — friction only works when it's understood */
    side.appendChild(el("div", { class: "fx-deal" }, [
      el("h4", { text: "The deal" }),
      el("ul", { class: "insp-list" }, [
        el("li", {}, [el("span", { text: "Complete the session" }), el("strong", { text: "XP · gold · HP" })]),
        el("li", {}, [el("span", { text: "Pauses (first free)" }), el("strong", { text: "−15% each" })]),
        el("li", {}, [el("span", { text: "Tab-switches (first free)" }), el("strong", { text: "−2 HP each" })]),
        el("li", {}, [el("span", { text: "Ending early" }), el("strong", { text: "logged, no award" })])
      ])
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

  /* ---------------- reload restore ---------------- */
  (function restore() {
    var snap = F().active;
    if (!snap) return;
    S = snap;
    if (S.state === "running") {
      /* credit time up to the last heartbeat, then hold the clock */
      S.phaseAccum = Math.min(phaseTarget(),
        S.phaseAccum + Math.max(0, ((S.lastBeat || S.phaseStartTs) - S.phaseStartTs) / 1000));
      S.state = "paused";
    }
    store.save();
    enterMode();
    timer = setInterval(tick, 1000);
    KOS.ui.toast("Focus session restored — paused where you left it. ▶ to resume.");
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
    /* test helper: shift the phase clock backwards so suites can cross
       interval boundaries without waiting on wall time */
    _debugAdvance: function (sec) {
      if (!S) return;
      if (S.state === "running") S.phaseStartTs -= sec * 1000;
      else S.phaseAccum += sec;
    }
  };
})();
