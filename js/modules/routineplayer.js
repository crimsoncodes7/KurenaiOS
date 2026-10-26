/* Kurenai OS — modules/routineplayer.js · KOS.routinePlayer
   The routine player (frames 33o–33p), About to Study before Focus (33q)
   and the timetable sheet a linked step opens.

   The player and the checklist write the same log (plan §4.4) through
   KOS.routines; the clock is a guide, never a limit: the ring fills to the
   estimate and then simply keeps counting, never red. Nothing pays until
   the routine is kept, and then once (invariant 143).

   About to Study writes nothing of its own: Start Focus hands the task,
   its topics and the first action to KOS.focus.start, which stays the one
   owner of a session (invariant 4a). It is on per device
   (state.ui.focusPreflight); "Just start" skips it once.                  */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var R = function () { return KOS.routines; };
  var U = function () { return KOS.rtUI; };
  var NS = "http://www.w3.org/2000/svg";

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function clockText(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + pad(s % 60); }
  function dialog(cls, label, children) {
    var box = el("div", { class: "k-dialog " + cls, role: "dialog", "aria-label": label }, children);
    return el("div", { class: "k-dialog-overlay" }, [box]);
  }

  /* ================= the player ================= */
  function open(id, opts) {
    opts = opts || {};
    var r = R().get(id);
    if (!r) return;
    var day = opts.day || R().routineDay();
    var steps = r.steps.filter(function (s) { return !s.checkMorning; });
    var e0 = R().entry(r.id, day), ticked = (e0 && e0.steps) || {};
    var i = steps.findIndex(function (s) { return !ticked[s.id]; });
    var st = { r: r, day: day, steps: steps, i: i === -1 ? 0 : i, started: Date.now(), stepStart: Date.now(), skipped: {}, done: false, award: null, timer: null, lock: null };
    var main = el("div", { class: "k-pl-main" });
    var side = el("aside", { class: "k-pl-side", "aria-label": "The routine" });
    var overlay = dialog("k-pl", r.name + ", the player", [main, side]);
    overlay.close = function () { finish(); };
    st.main = main; st.side = side; st.overlay = overlay;
    function finish() {
      clearInterval(st.timer);
      if (st.lock && st.lock.release) { try { st.lock.release(); } catch (e) { /* gone */ } }
      R().setMins(r.id, (Date.now() - st.started) / 60000, { day: day });
      if (overlay.parentNode) overlay.remove();
      KOS.rerender();
    }
    st.finish = finish;
    paint(st);
    KOS.ui.openDialog(overlay, { label: r.name, initialFocus: main.querySelector("[data-ui~='player.done']") });
    st.timer = setInterval(function () { paintClock(st); }, 1000);
    if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request("screen").then(function (l) { st.lock = l; }, function () {});
    overlay.addEventListener("keydown", function (ev) {
      if (st.done || ev.target.closest("input, select, textarea")) return;
      if (ev.key === "ArrowRight") { ev.preventDefault(); next(st, true); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); back(st); }
      else if (ev.key === "s" || ev.key === "S") { ev.preventDefault(); next(st, false); }
    });
  }
  function current(st) { return st.steps[st.i]; }
  function paint(st) {
    var r = st.r, s = current(st), w = R().windowOn(r, st.day);
    var e = R().entry(r.id, st.day), ticked = (e && e.steps) || {};
    st.main.innerHTML = "";
    st.main.setAttribute("data-tint", U().toneOf(r) || "afternoon");
    if (st.done) { paintDone(st); paintSide(st, ticked); return; }
    var left = st.steps.slice(st.i + 1).filter(function (x) { return !ticked[x.id]; });
    var leftMins = left.reduce(function (m, x) { return m + (x.mins || 0); }, 0);
    st.ring = ring();
    st.clockT = el("b", { class: "k-mono k-pl-clock-t" });
    st.clockS = el("span", { class: "k-muted k-rt-small" });
    st.main.appendChild(el("div", { class: "k-pl-top" }, [
      el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close (your ticks are kept)", "data-ui": "player.close", text: "✕", onclick: st.finish }),
      el("div", { class: "k-pl-top-t" }, [el("b", { text: r.name }), w && r.anchor === "review:morning" ? el("span", { class: "k-mono k-rt-small k-rt-text2", text: "Leave by " + w.to }) : null]),
      el("span", { class: "k-mono k-rt-small k-muted", text: (st.i + 1) + "/" + st.steps.length })
    ]));
    st.main.appendChild(el("div", { class: "k-rt-progress", "aria-hidden": "true" }, st.steps.map(function (x, j) { var p = el("span"); if (ticked[x.id]) KOS.ui.state(p, "on", true); else if (j === st.i) KOS.ui.state(p, "now", true); return p; })));
    var linkFocus = s.link && s.link.kind === "focus";
    st.main.appendChild(el("div", { class: "k-pl-step", "data-ui": "player.step" }, [
      el("span", { class: "k-kicker", text: "Step " + (st.i + 1) + " of " + st.steps.length + (s.optional ? " · optional" : "") }),
      el("h2", { class: "k-pl-name", text: s.text }),
      s.mins ? el("div", { class: "k-pl-clock", role: "timer", "aria-live": "off" }, [st.ring.svg, el("div", { class: "k-pl-clock-in" }, [st.clockT, st.clockS])])
        : el("div", { class: "k-pl-clock k-pl-clock--plain" }, [st.clockT, st.clockS]),
      s.link && !linkFocus ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "player.link", text: "↗ " + U().linkLabel(s.link), onclick: function () { U().openLink(s.link, r, s); } }) : null,
      el("div", { class: "k-pl-left k-rt-small k-muted", text: left.length ? "Still to do · " + left.length + (leftMins ? " · about " + leftMins + " min" : "") : "The last step" })
    ]));
    var nextStep = st.steps[st.i + 1];
    st.main.appendChild(el("div", { class: "k-pl-go" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary k-pl-done", "data-ui": "player.done",
        text: linkFocus ? "▶ Start Focus" : nextStep ? "Done · next: " + nextStep.text : "Done",
        onclick: function () { if (linkFocus) { tickHere(st); st.finish(); preflight({}); return; } next(st, true); } }),
      el("div", { class: "k-cluster k-pl-sub" }, [
        el("button", { type: "button", class: "k-btn", "data-ui": "player.back", text: "← Back", disabled: st.i === 0 ? true : null, onclick: function () { back(st); } }),
        el("button", { type: "button", class: "k-btn", "data-ui": "player.skip", text: "Skip step", onclick: function () { next(st, false); } })
      ])
    ]));
    paintSide(st, ticked);
    paintClock(st);
  }
  function paintSide(st, ticked) {
    st.side.innerHTML = "";
    st.side.appendChild(el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "The routine" }), el("span", { class: "k-rt-fill" }),
      el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Close", onclick: st.finish })]));
    st.steps.forEach(function (x, j) {
      var on = !!ticked[x.id];
      var row = el("div", { class: "k-rt-step" + (j === st.i && !st.done ? " k-pl-now" : "") }, [
        U().check(on, (on ? "Untick " : "Tick ") + x.text, function () { R().tick(st.r.id, x.id, !on, { day: st.day }); paint(st); }),
        el("span", { class: "k-rt-step-t k-ellipsis", text: x.text }),
        st.skipped[x.id] && !on ? el("span", { class: "k-muted", text: "–" }) : null,
        x.mins ? el("span", { class: "k-mono k-rt-step-m", text: x.mins + "′" }) : null
      ]);
      if (on) KOS.ui.state(row, "done", true);
      st.side.appendChild(row);
    });
    st.side.appendChild(el("p", { class: "k-muted k-rt-small k-pl-side-f", text: "Started " + new Date(st.started).toTimeString().slice(0, 5) + " · the clock is a guide, not a limit." }));
  }
  function ring() {
    var size = 100, sw = 6, rr = (size - sw) / 2, c = 2 * Math.PI * rr;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("class", "k-pl-ring");
    svg.setAttribute("aria-hidden", "true");
    var track = document.createElementNS(NS, "circle"), fill = document.createElementNS(NS, "circle");
    [track, fill].forEach(function (n) { n.setAttribute("cx", 50); n.setAttribute("cy", 50); n.setAttribute("r", rr); n.setAttribute("fill", "none"); n.setAttribute("stroke-width", sw); });
    track.setAttribute("class", "k-pl-ring-track");
    fill.setAttribute("class", "k-pl-ring-fill");
    fill.setAttribute("stroke-linecap", "round");
    fill.setAttribute("stroke-dasharray", "0 " + c);
    svg.appendChild(track); svg.appendChild(fill);
    return { svg: svg, fill: fill, c: c };
  }
  function paintClock(st) {
    if (st.done || !st.clockT) return;
    var s = current(st), secs = (Date.now() - st.stepStart) / 1000;
    st.clockT.textContent = clockText(secs);
    if (s.mins) {
      var p = Math.min(1, secs / (s.mins * 60));
      st.ring.fill.setAttribute("stroke-dasharray", (st.ring.c * p).toFixed(1) + " " + st.ring.c.toFixed(1));
      st.clockS.textContent = p >= 1 ? "about " + s.mins + " min · no rush" : "of about " + s.mins + " min";
    } else st.clockS.textContent = "since this step began";
  }
  function tickHere(st) {
    var s = current(st);
    var res = R().tick(st.r.id, s.id, true, { day: st.day });
    if (res && res.award) st.award = res.award;
    return res;
  }
  function next(st, tick) {
    var s = current(st);
    if (tick) tickHere(st); else st.skipped[s.id] = true;
    var e = R().entry(st.r.id, st.day), ticked = (e && e.steps) || {};
    var j = st.steps.findIndex(function (x, k) { return k > st.i && !ticked[x.id] && !st.skipped[x.id]; });
    if (j === -1) j = st.steps.findIndex(function (x) { return !ticked[x.id] && !st.skipped[x.id]; });
    if (j === -1) { st.done = true; KOS.a11y && KOS.a11y.announce(st.r.name + (R().verdict(st.r, R().entry(st.r.id, st.day)).done ? " kept." : " finished.") + (st.award ? " " + U().rewardText(st.award) : "")); }
    else {
      st.i = j;
      KOS.a11y && KOS.a11y.announce((tick ? s.text + ", done. " : "") + "Next, " + st.steps[j].text + (st.steps[j].mins ? ", about " + st.steps[j].mins + " minutes" : ""));
    }
    st.stepStart = Date.now();
    paint(st);
    var d = st.main.querySelector("[data-ui~='player.done'], [data-ui~='player.close-done']");
    if (d) d.focus();
  }
  function back(st) {
    if (st.i === 0) return;
    st.i--;
    st.stepStart = Date.now();
    paint(st);
  }
  function paintDone(st) {
    var v = R().verdict(st.r, R().entry(st.r.id, st.day));
    var mins = Math.round((Date.now() - st.started) / 60000);
    var kept = v.done || v.min;
    var award = st.award || (kept ? null : null);
    st.main.appendChild(el("div", { class: "k-pl-step k-pl-fin", "data-ui": "player.finished" }, [
      el("img", { class: "k-pl-spot", src: U().img(kept ? "spot.alldone" : "face.kurenai.attentive"), alt: "" }),
      el("h2", { class: "k-pl-name", text: kept ? st.r.name + " kept" : st.r.name }),
      el("p", { class: "k-rt-text2", text: v.n + " of " + v.of + (mins ? " · " + mins + " min" : "") + (kept ? "" : " · partial") }),
      award ? U().reward(award) : null,
      kept && st.r.days !== null && R().streak(st.r.id) ? el("span", { class: "k-muted k-rt-small", text: "炎 " + R().streak(st.r.id) + " days" }) : null,
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "player.close-done", text: "Close", onclick: st.finish })
    ]));
  }

  /* ================= the timetable sheet (33p) ================= */
  function daySheet(offset, r, s) {
    var day = KOS.srs.addDays(R().routineDay(), offset || 0);
    var T = KOS.today.build(day), bag = KOS.today.bag(day);
    var title = el("h2", { class: "k-dialog-title", text: (offset ? "Tomorrow's" : "Today's") + " timetable and bag" });
    var rows = T.timeline.filter(function (x) { return x.kind !== "review" && x.kind !== "routine"; }).map(function (x) { return U().tlRow(x, { kinds: false }); });
    var box = el("div", { class: "k-dialog k-pl-sheet", "data-ui": "player.day-sheet" }, [
      el("div", { class: "k-dialog-head" }, [title]),
      el("div", { class: "k-dialog-body" }, [
        rows.length ? el("div", {}, rows) : el("p", { class: "k-muted", text: T.holiday ? "A holiday: no lessons." : "No lessons." }),
        bag.length ? el("p", { class: "k-rt-text2 k-rt-small", text: "鞄 " + bag.map(function (b) { return b.text; }).join(" · ") }) : el("p", { class: "k-muted k-rt-small", text: "Set each subject's kit in Routines › Settings and the bag fills in." })
      ]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn", text: "Close", onclick: function () { overlay.remove(); } }),
        r && s ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "player.sheet-tick", text: "Looks right · tick this step", onclick: function () {
          var res = R().tick(r.id, s.id, true);
          U().afterTick(r, res);
          overlay.remove();
          KOS.rerender();
        } }) : null
      ])
    ]);
    var overlay = el("div", { class: "k-dialog-overlay" }, [box]);
    KOS.ui.openDialog(overlay, { labelledBy: title });
  }

  /* ================= About to Study (33q) ================= */
  /* ctx: {title, subject, refs, assignmentId, objective, cfg (the Focus
     page's own settings), onStart} — every field optional */
  function preflight(ctx) {
    ctx = ctx || {};
    if (KOS.focus && KOS.focus.state && KOS.focus.state() !== "idle") { KOS.show("focus"); return; }
    if ((store.state.ui || {}).focusPreflight === false) { startFocus(ctx, ctx.objective || ""); return; }
    var task = taskOf(ctx);
    var title = el("h2", { class: "k-dialog-title", text: "About to Study" });
    var taskBox = el("div", { class: "k-pl-task" });
    var action = el("input", { type: "text", class: "k-input", value: ctx.objective || "", maxlength: 200, placeholder: suggestAction(task), "aria-label": "First concrete action, two minutes", "data-ui": "preflight.action" });
    var clear = { on: false };
    var mode = el("select", { class: "k-input", "aria-label": "Mode" }, [["pomodoro", "Pomodoro"], ["custom", "Custom"], ["stopwatch", "Stopwatch"]].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var len = el("select", { class: "k-input", "aria-label": "Length" }, [25, 30, 45, 50, 60, 90].map(function (m) { return el("option", { value: m, text: m + " min" }); }));
    var lc = (store.state.focus && store.state.focus.lastConfig) || {};
    if (ctx.cfg && ctx.cfg.mode) mode.value = ctx.cfg.mode; else if (lc.mode && lc.mode !== "until") mode.value = lc.mode;
    if (ctx.cfg && ctx.cfg.workMin) len.value = String(ctx.cfg.workMin); else if (lc.workMin) len.value = String(lc.workMin);
    function paintTask() {
      taskBox.innerHTML = "";
      taskBox.appendChild(U().bar(U().hue(task.subject)));
      taskBox.appendChild(el("div", { class: "k-rt-grow" }, [el("b", { text: task.title || "Pick a task, or just study" }), task.sub ? el("span", { class: "k-muted k-rt-small", text: task.sub }) : null]));
      var choices = taskChoices();
      if (choices.length) taskBox.appendChild(KOS.ui.menu({ label: "Change", className: "k-btn--quiet k-btn--sm", items: choices.map(function (c) {
        return { label: c.title, hint: c.sub, onSelect: function () { task = c; if (!action.value) action.placeholder = suggestAction(task); paintTask(); paintMaterials(); } };
      }) }));
    }
    var mats = el("div", { class: "k-cluster" });
    function paintMaterials() {
      mats.innerHTML = "";
      materials(task).forEach(function (m) { mats.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "↗ " + m.label, onclick: function () { overlay.remove(); m.go(); } })); });
      if (!mats.children.length) mats.appendChild(el("span", { class: "k-muted k-rt-small", text: "Nothing linked to open." }));
    }
    paintTask(); paintMaterials();
    var clearBtn = U().check(false, "Clear distractions", function () { clear.on = !clear.on; clearBtn.setAttribute("aria-checked", String(clear.on)); clearBtn.textContent = clear.on ? "✓" : ""; });
    var dontAsk = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Don't ask before Focus", "data-ui": "preflight.dont-ask" });
    function go(skip) {
      if (dontAsk.checked) { store.state.ui.focusPreflight = false; store.save(); }
      var cfg = Object.assign({}, ctx.cfg || {}, { mode: mode.value, workMin: +len.value, breakMin: mode.value === "pomodoro" ? 5 : 0 });
      overlay.remove();
      /* the About to Study routine day, when it exists and every step was met */
      if (!skip) {
        var pre = R().all().filter(function (r) { return r.anchor === "focus"; })[0];
        if (pre) R().tickAll(pre.id);
      }
      startFocus(Object.assign({}, ctx, task, { cfg: cfg }), skip ? (ctx.objective || "") : action.value || "");
    }
    var box = el("div", { class: "k-dialog k-pl-pre", "data-ui": "preflight.sheet" }, [
      el("div", { class: "k-dialog-head" }, [el("span", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: "始" }), el("div", {}, [title, el("span", { class: "k-muted k-rt-small", text: "four quick things, already filled in" })])]),
      el("div", { class: "k-dialog-body k-pl-pre-b" }, [
        taskBox,
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "First concrete action · two minutes" }), action, el("span", { class: "k-field-hint", text: "becomes the session's objective" })]),
        el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Open materials" }), mats]),
        el("div", { class: "k-rt-set" }, [clearBtn, el("div", { class: "k-rt-grow" }, [el("div", { text: "Clear distractions" }), el("span", { class: "k-muted k-rt-small", text: "phone face down, tabs closed, Opal on" })])]),
        el("div", { class: "k-rt-2col" }, [el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Mode" }), mode]), el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Length" }), len])])
      ]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "preflight.just-start", text: "Just start", onclick: function () { go(true); } }),
        el("span", { class: "k-rt-fill" }),
        el("label", { class: "k-cluster k-rt-small k-muted" }, ["Don't ask before Focus", dontAsk]),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "preflight.start", text: "▶ Start Focus", onclick: function () { go(false); } })
      ])
    ]);
    var overlay = el("div", { class: "k-dialog-overlay" }, [box]);
    action.addEventListener("keydown", function (e) { if (e.key === "Enter") go(false); });
    KOS.ui.openDialog(overlay, { labelledBy: title, initialFocus: action });
  }
  function taskOf(ctx) {
    if (ctx.assignmentId != null) {
      var a = KOS.assignments.get(ctx.assignmentId);
      if (a) return { title: a.title, subject: a.subject, assignmentId: a.id, refs: KOS.assignments.refsOf(a), sub: "Assignment" + (a.due ? " · due " + U().dayLabel(a.due, { weekday: "short", day: "numeric", month: "short" }) : "") };
    }
    if (ctx.title || ctx.subject) return { title: ctx.title || (KOS.subjects.meta(ctx.subject) || {}).name, subject: ctx.subject, refs: ctx.refs || [], sub: ctx.refs && ctx.refs.length ? (KOS.spec && KOS.spec.label ? KOS.spec.label(ctx.refs[0]) : ctx.refs[0]) : "" };
    var three = taskChoices()[0];
    return three || { title: "", subject: null, refs: [] };
  }
  /* Today's three, then open assignments due soonest, then the ladder's next */
  function taskChoices() {
    var out = [], seen = {};
    function push(t) { var k = (t.assignmentId != null ? "a" + t.assignmentId : t.title); if (seen[k] || !t.title) return; seen[k] = 1; out.push(t); }
    var V = KOS.dayReview;
    var three = V && V.enabled() ? ((V.day(R().routineDay()).morning || {}).three || []) : [];
    three.forEach(function (ref) {
      var x = V.resolve(ref); if (!x || x.done) return;
      push({ title: x.title, subject: x.subject, assignmentId: ref.kind === "assignment" ? ref.id : null, refs: ref.kind === "topic" ? [ref.id] : [], sub: "from Today's three" });
    });
    (KOS.assignments ? KOS.assignments.all() : []).filter(function (a) { return KOS.assignments.isOpen(a) && a.due; })
      .sort(function (a, b) { return a.due < b.due ? -1 : 1; }).slice(0, 5)
      .forEach(function (a) { push({ title: a.title, subject: a.subject, assignmentId: a.id, refs: KOS.assignments.refsOf(a), sub: "Assignment · due " + U().dayLabel(a.due, { weekday: "short", day: "numeric", month: "short" }) }); });
    var n = KOS.today ? KOS.today.build().next : null;
    if (n && n.title) push({ title: n.title, subject: n.subject, assignmentId: n.assignmentId, refs: n.refs || [], sub: n.kicker });
    return out;
  }
  function suggestAction(task) {
    if (!task || !task.title) return "Open the material and do the first small thing";
    if (task.assignmentId != null) {
      var a = KOS.assignments.get(task.assignmentId), sub = a && KOS.assignments.nextSubtask ? KOS.assignments.nextSubtask(a) : null;
      if (sub) return sub.text;
      return "Open " + task.title + " and write one sentence";
    }
    return "Open the notes for " + task.title + " and read the first heading";
  }
  function materials(task) {
    var out = [];
    if (task.assignmentId != null) out.push({ label: "The assignment", go: function () { if (KOS.assignmentDetail) KOS.assignmentDetail(task.assignmentId); else KOS.show("assignments"); } });
    (task.refs || []).slice(0, 2).forEach(function (k) {
      var i = String(k).indexOf(":");
      if (i < 0) return;
      var sid = k.slice(0, i), ref = k.slice(i + 1);
      var leaf = KOS.spec && KOS.spec.firstLeaf ? KOS.spec.firstLeaf([k]) : { subject: sid, ref: ref };
      if (leaf) out.push({ label: (KOS.spec.label ? KOS.spec.label(leaf.subject + ":" + leaf.ref) : leaf.ref), go: function () { KOS.show("ref", { subject: leaf.subject, ref: leaf.ref }); } });
    });
    return out;
  }
  function startFocus(ctx, objective) {
    var cfg = Object.assign({ mode: "pomodoro", workMin: 25, breakMin: 5 }, ctx.cfg || {});
    cfg.subject = ctx.subject || cfg.subject || null;
    cfg.refs = (ctx.refs && ctx.refs.length ? ctx.refs : cfg.refs) || [];
    if (ctx.assignmentId != null) cfg.assignmentId = ctx.assignmentId;
    cfg.objective = objective || cfg.objective || "";
    if (ctx.onStart) { ctx.onStart(cfg); return; }
    KOS.show("focus");
    if (KOS.focus && KOS.focus.start) KOS.focus.start(cfg);
    KOS.rerender();
  }

  KOS.routinePlayer = { open: open, preflight: preflight, daySheet: daySheet, taskChoices: taskChoices };
})();
