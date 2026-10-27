/* Kurenai OS — modules/dayreview.js · KOS.reviewSheet
   The Daily Review's overlay (roadmap 5.10, design turn 33, frames 33a–33i):
   one dialog of a few steps, opened by itself only on the first app open
   inside its slot (invariant 145), otherwise reached from the header chip,
   a notification, Routines › Today or Home.

   It reads KOS.dayReview.content(slot) and writes only through owners:
   KOS.dayReview (its own state), KOS.routines (ticks), each record's owner
   through KOS.dayReview.triage, KOS.calendar for a placed study block.
   Kurenai's words are decoration: the template shows first (invariant 146).
   Escape is Later. Skip review never penalises.                           */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var V = function () { return KOS.dayReview; };
  var R = function () { return KOS.routines; };
  var U = function () { return KOS.rtUI; };

  var MARK = { morning: "朝", afternoon: "昼", evening: "夜" };
  var FACE = { morning: "morning", afternoon: "attentive", evening: "evening" };
  var BG = { morning: "morning", afternoon: "afternoon", evening: "evening" };
  var NAMES = { lastNight: "Last night", routine: "Routine", today: "Today", three: "Three", start: "Start",
    sofar: "So far", still: "Still today", time: "Time left", next: "Next",
    numbers: "Today", unfinished: "Unfinished", tomorrow: "Tomorrow", prep: "Evening Prep", winddown: "Wind down" };
  var TRI = [["tomorrow", "Tomorrow"], ["week", "Later this week"], ["someday", "Someday"], ["done", "Done"], ["leave", "Leave it"]];
  var open = null;              // the sheet on screen: {slot, overlay, cur, steps, …}

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nowHm() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function ui() { var s = store.state.ui; s.review = s.review && typeof s.review === "object" ? s.review : {}; return s.review; }
  function peekUi() { return (store.state.ui && store.state.ui.review) || {}; }
  function muted(t) { return U().muted(t); }
  function stepName(s) { return s.id === "lastNight" && !s.first && !(s.routines || []).length && (s.yesterday || []).length ? "Yesterday, quickly" : s.id === "three" && s.folded ? "Three" : NAMES[s.id] || s.id; }
  function hue(sid) { return U().hue(sid); }
  function fmtTime(ts) { var d = new Date(ts); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }

  /* ================= the sheet ================= */
  function openSheet(slot, opts) {
    opts = opts || {};
    if (!V().enabled()) return;
    var due = V().due(), past = !due && V().recent();
    slot = slot || (due && due.slot) || (past && past.slot);
    if (!slot) { KOS.ui.toast("No review is waiting right now."); return; }
    if (open) close(true);
    /* a finished review opened again from the chip: still the whole review
       (tick steps on the bus, pick today's three late); only Skip goes */
    var again = !!(past && past.slot === slot && !(due && due.slot === slot));
    if (!again) V().markShown(slot);
    var u = ui();
    u.lastShown = u.lastShown || {};
    u.lastShown[R().routineDay() + "|" + slot] = Date.now();
    var resume = (u.minimised && u.minimised.slot === slot && u.minimised.day === R().routineDay()) ? u.minimised.step : 0;
    delete u.minimised;
    store.save();
    var st = { slot: slot, cur: opts.step != null ? opts.step : resume, skipped: {}, overlay: null, again: again };
    open = st;
    var panel = el("div", { class: "k-rv", "data-ui": "review.sheet", "data-slot": slot, "data-dialog-box": "" });
    var overlay = el("div", { class: "k-dialog-overlay k-dr-overlay" }, [panel]);
    overlay.close = function () { close(false); };
    st.overlay = overlay; st.panel = panel;
    paint();
    KOS.ui.openDialog(overlay, { label: V().LABEL[slot], onClose: function () { if (open === st) { open = null; minimise(st); } paintChip(); } });
    KOS.a11y && KOS.a11y.announce(V().LABEL[slot] + ". " + st.steps.length + " steps.");
    /* Kurenai's words, written ahead when they can be; the template meanwhile */
    if (V().cfg().words === "kurenai") {
      st.generating = !(V().day(R().routineDay()).words || {})[slot];
      if (st.generating) paintHead();
      V().ensureWords(slot, { byHand: true }, function (err) {
        if (open !== st) return;
        st.generating = false;
        st.offline = !!err;
        paintHead();
      });
    }
  }
  /* Later, Esc and ✕: keep the place; the chip carries it */
  function minimise(st) {
    var rec = V().day(R().routineDay())[st.slot] || {};
    if (rec.state === "done" || rec.state === "skipped") return;
    var u = ui();
    u.minimised = { slot: st.slot, day: R().routineDay(), step: st.cur };
    store.save();
    KOS.a11y && KOS.a11y.announce(V().LABEL[st.slot] + " minimised, " + Math.max(1, st.steps.length - st.cur) + " steps left.");
  }
  function close(silent) {
    var st = open;
    if (!st) return;
    open = null;
    if (!silent) minimise(st);
    if (st.overlay && st.overlay.parentNode) st.overlay.remove();
    paintChip();
    if (!silent && KOS.rerender) KOS.rerender();
  }
  function finish(how) {
    var st = open;
    if (!st) return;
    /* opened again: Done marks it done (a skipped one too); a done one
       is never skipped after the fact */
    if (!(st.again && how === "skipped")) V().finish(st.slot, how);
    open = null;
    if (st.overlay && st.overlay.parentNode) st.overlay.remove();
    paintChip();
    KOS.rerender();
  }

  function paint() {
    var st = open;
    st.content = V().content(st.slot);
    st.steps = st.content.steps;
    if (st.cur >= st.steps.length) st.cur = Math.max(0, st.steps.length - 1);
    var p = st.panel;
    p.innerHTML = "";
    var night = st.steps[st.cur] && st.steps[st.cur].id === "winddown";
    p.setAttribute("data-tint", night ? "night" : st.slot);
    st.head = el("header", { class: "k-dr-head" });
    p.appendChild(st.head);
    paintHead();
    if (isEmpty(st)) { p.appendChild(emptyBody(st)); return; }
    p.appendChild(strip(st));
    var body = el("div", { class: "k-dr-body", "data-ui": "review.body", "data-step": st.steps[st.cur].id });
    p.appendChild(body);
    renderStep(st, st.steps[st.cur], body);
    p.appendChild(foot(st));
  }
  function rvState(st) { return (V().day(R().routineDay())[st.slot] || {}).state; }
  function isEmpty(st) {
    var real = st.steps.filter(function (s) { return ["start", "next", "winddown"].indexOf(s.id) === -1; });
    var end = st.steps.filter(function (s) { return s.id === "start" || s.id === "next"; })[0];
    return !real.length && st.slot !== "evening" && !(end && (end.first || end.next));
  }

  /* the header: the slot's tint and art, her line, the template, the actions */
  function paintHead() {
    var st = open;
    if (!st || !st.head) return;
    var h = st.head, c = st.content, cfg = V().cfg();
    var w = V().words(st.slot, c), t = V().template(st.slot, c);
    var night = st.steps[st.cur] && st.steps[st.cur].id === "winddown";
    var face = night ? "evening" : st.slot === "morning" && st.steps[0] && stepName(st.steps[0]) === "Yesterday, quickly" ? "concerned" : FACE[st.slot];
    h.innerHTML = "";
    /* absolute: a relative url() in a custom property resolves against the stylesheet */
    h.style.setProperty("--rv-bg", "url(\"" + new URL(U().img("bg." + (night ? "night" : BG[st.slot])), location.href).href + "\")");
    var lineBox;
    if (cfg.words === "kurenai" && st.generating) lineBox = el("div", { class: "k-dr-skel", "aria-hidden": "true" }, [el("span"), el("span")]);
    else if (w.byKurenai) lineBox = el("p", { class: "k-dr-line", text: "“" + w.line + "”" });
    else lineBox = null;
    var d = new Date();
    h.appendChild(el("div", { class: "k-dr-head-txt" }, [
      el("div", { class: "k-dr-title" }, [U().tile(MARK[st.slot], st.slot), el("div", {}, [
        el("h2", { class: "k-dr-name", "data-ui": "review.title", text: V().LABEL[st.slot] }),
        el("span", { class: "k-dr-meta", text: (c.day !== KOS.srs.todayISO() ? U().dayLabel(c.day, { weekday: "long" }) + " evening · " : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + " · ") + nowHm() })
      ])]),
      lineBox,
      w.byKurenai ? el("div", { class: "k-dr-by" }, [el("b", { text: "✦ Kurenai" }), " · ", el("button", { type: "button", class: "k-link", text: "What is sent", onclick: U().whatIsSent })]) : null,
      el("p", { class: "k-dr-tpl", "data-ui": "review.words", text: w.byKurenai || st.generating ? t.text : w.text || t.text }),
      st.offline ? el("p", { class: "k-dr-quiet", text: "Kurenai's words aren't available right now." }) : null
    ]));
    if (cfg.portrait) h.appendChild(el("div", { class: "k-dr-portrait", "aria-hidden": "true" }, [el("img", { src: U().img("face.kurenai." + face), alt: "" })]));
    h.appendChild(el("div", { class: "k-dr-actions" }, [
      st.again ? el("span", { class: "k-dr-quiet", "data-ui": "review.again", text: rvState(st) === "skipped" ? "Skipped earlier · still open" : "Done earlier · still open" }) : null,
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.later", text: "Later", onclick: function () { close(false); } }),
      st.again ? null : el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm k-dr-skipbtn", "data-ui": "review.skip", text: "Skip review", onclick: function () { finish("skipped"); KOS.ui.toast(V().LABEL[st.slot] + " skipped"); } }),
      el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close (Later)", text: "✕", onclick: function () { close(false); } })
    ]));
  }
  /* the step strip: a tablist; ✓ done, – skipped, the current ringed */
  function strip(st) {
    var list = el("div", { class: "k-dr-strip", role: "tablist", "aria-label": "Steps", "data-ui": "review.steps" });
    st.steps.forEach(function (s, i) {
      var state = st.skipped[i] ? "skip" : i < st.cur ? "done" : i === st.cur ? "now" : s.folded ? "fold" : "next";
      var b = el("button", { type: "button", class: "k-dr-step", role: "tab", "aria-selected": String(i === st.cur), "data-state": state, "data-ui": "review.step-tab",
        onclick: function () { go(i); } }, [
        el("span", { class: "k-dr-dot", "aria-hidden": "true", text: state === "done" ? "✓" : state === "skip" ? "–" : String(i + 1) }),
        el("span", { text: stepName(s) }),
        state === "skip" ? muted("skipped") : s.folded ? muted("from this morning") : null
      ]);
      list.appendChild(b);
    });
    if (st.slot === "afternoon" && st.content.folded.indexOf("morning") !== -1) list.appendChild(el("span", { class: "k-dr-strip-note k-muted", text: "朝 Morning review folded here" }));
    list.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" && st.cur < st.steps.length - 1) { e.preventDefault(); go(st.cur + 1); }
      if (e.key === "ArrowLeft" && st.cur > 0) { e.preventDefault(); go(st.cur - 1); }
    });
    return list;
  }
  function go(i) {
    var st = open;
    if (!st) return;
    st.cur = Math.max(0, Math.min(st.steps.length - 1, i));
    paint();
    var h = st.panel.querySelector("[data-ui~='review.body'] h3");
    var tab = st.panel.querySelector("[aria-selected='true']");
    if (tab) tab.focus();
    if (h) KOS.a11y && KOS.a11y.announce(stepName(st.steps[st.cur]));
  }
  function foot(st) {
    var s = st.steps[st.cur], last = st.cur === st.steps.length - 1, next = st.steps[st.cur + 1];
    var f = el("footer", { class: "k-dr-foot" });
    if (st.cur > 0) f.appendChild(el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "review.back", text: "← Back", onclick: function () { go(st.cur - 1); } }));
    /* on a phone, Skip review sits here, in the thumb zone (the header keeps Later and ✕) */
    if (!st.again) f.appendChild(el("button", { type: "button", class: "k-btn k-btn--quiet k-dr-skipfoot", "data-ui": "review.skip-foot", text: "Skip review", onclick: function () { finish("skipped"); KOS.ui.toast(V().LABEL[st.slot] + " skipped"); } }));
    f.appendChild(el("span", { class: "k-dr-note", text: st.cur === 0 ? "Esc closes · Later keeps your place" : last ? "This is the last step." : "" }));
    if (!last) {
      f.appendChild(el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "review.skip-step", text: "Skip this step", onclick: function () { st.skipped[st.cur] = true; go(st.cur + 1); } }));
      f.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.next", text: next.id === "next" ? "Next" : "Next: " + stepName(next), onclick: function () { go(st.cur + 1); } }));
    } else if (s.id === "winddown") {
      f.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.goodnight", text: "☾ Good night", onclick: goodNight }));
    } else if (s.id !== "start" && s.id !== "next") {
      f.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.done", text: "Done", onclick: function () { finish("done"); } }));
    }
    return f;
  }

  /* ================= the steps ================= */
  function renderStep(st, s, body) {
    var fn = STEPS[s.id];
    if (fn) fn(st, s, body);
  }
  function card(children, cls) { return el("div", { class: "k-dr-card" + (cls ? " " + cls : "") }, children); }
  function hd(t, meta, right) { return el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: t }), meta ? el("span", { class: "k-rt-hd-m k-ellipsis", text: meta }) : null, el("span", { class: "k-rt-fill" }), right || null]); }
  function cols(a, b, cls) { return el("div", { class: "k-dr-cols" + (cls ? " " + cls : "") }, [a, b].filter(Boolean)); }
  function refRow(x, right) {
    return el("div", { class: "k-dr-row" }, [U().bar(hue(x.subject)), el("div", { class: "k-rt-grow" }, [
      el("div", { class: "k-dr-row-t k-ellipsis", text: x.title }),
      el("div", { class: "k-dr-row-s" }, [x.kind ? U().kind(x.kind === "exam" ? "▲ exam" : x.kind) : null, el("span", { class: "k-ellipsis", text: x.sub || "" })])
    ]), right || null]);
  }
  function dueSub(x) {
    var bits = [];
    if (x.overdue) bits.push("overdue");
    if (x.due) bits.push(x.due === R().routineDay() ? "today" + (x.dueTime ? " " + x.dueTime : "") : U().dayLabel(x.due, { weekday: "short", day: "numeric", month: "short" }) + (x.dueTime ? " " + x.dueTime : ""));
    if (x.estimateMins) bits.push("about " + U().hmText(x.estimateMins));
    if (x.why === "carried") bits.push("carried over" + (x.weeksLate ? " · " + x.weeksLate + " wk" : ""));
    if (x.why === "started") bits.push("started");
    if (x.why === "workOn") bits.push("a day to work on it");
    return bits.join(" · ");
  }
  function firstCard(f, big) {
    if (!f) return null;
    return card([hd("Your first task", "chosen last night"),
      el("div", { class: "k-dr-first" }, [U().bar(hue(f.subject)), el("div", {}, [el("div", { class: big ? "k-dr-first-t k-dr-first-t--big" : "k-dr-first-t", text: f.title }), f.due ? muted("due " + U().dayLabel(f.due, { weekday: "short", day: "numeric", month: "short" })) : null])]),
      f.action ? el("div", { class: "k-dr-action" }, [el("span", { class: "k-kicker", text: "First action · two minutes" }), el("div", { text: f.action })]) : null,
      el("p", { class: "k-dr-soft k-dr-card-foot", text: "The Start step opens About to Study with this filled in, and Home keeps it all day." })
    ], "k-dr-card--first");
  }

  var STEPS = {
    /* ---- the morning ---- */
    lastNight: function (st, s, body) {
      var left = [];
      if (s.first) left.push(firstCard(s.first, true));
      if ((s.yesterday || []).length) left.push(card([hd("Still open from yesterday", "choose for any, or none · Leave it is the default")].concat(s.yesterday.map(function (y) { return triageRow(y, st, true); }))));
      if (!left.length) left.push(el("p", { class: "k-dr-soft", text: "Nothing was set for this morning last night, and that's fine." }));
      var right = (s.routines || []).map(function (r) { return lastNightCard(r); });
      body.appendChild(cols(el("div", { class: "k-dr-stack" }, left), right.length ? el("div", { class: "k-dr-stack" }, right) : null));
    },
    routine: function (st, s, body) {
      var day = R().routineDay(), bag = KOS.today.bag(day);
      var T = KOS.today.build(day);
      var glance = T.timeline.filter(function (x) { return x.kind !== "routine" && x.kind !== "review"; }).slice(0, 5);
      var side = [];
      if (bag.length) side.push(card([hd("Before you go", "from today's timetable")].concat(bag.map(function (b) {
        return el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "鞄" }), el("span", { class: "k-rt-grow", text: b.text }), muted(b.why)]);
      }))));
      side.push(card([hd("Today at a glance", T.isSchoolDay ? "the timetable step opens the rest" : "no lessons today")].concat(glance.length ? timeline(glance, { kinds: false, now: false }) : [el("p", { class: "k-dr-soft", text: "Nothing timed today." })])));
      body.appendChild(cols(el("div", { class: "k-dr-stack" }, s.routines.map(function (x) { var r = R().get(x.id); return r ? card([U().checklist(r, { after: repaint })]) : null; })),
        el("div", { class: "k-dr-stack" }, side), "k-dr-cols--wide"));
    },
    today: function (st, s, body) {
      var nL = s.timeline.filter(function (x) { return x.kind === "lesson"; }).length;
      var tl = card([hd(U().dayLabel(R().routineDay(), { weekday: "long" }), s.isSchoolDay ? "school day · " + U().plural(nL, "lesson") : "no lessons today")]
        .concat(timeline(s.timeline)));
      body.appendChild(cols(tl, dueCard(s.due, s.warnings, s.goals)));
    },
    three: function (st, s, body) {
      var picked = (V().day(R().routineDay()).morning || {}).three || [];
      var list = el("div", { class: "k-dr-three", "data-ui": "review.three" });
      var resolved = picked.map(function (r) { var x = V().resolve(r); return x ? Object.assign({ ref: r }, x) : null; }).filter(Boolean);
      resolved.forEach(function (p, i) {
        list.appendChild(el("div", { class: "k-dr-three-row", "data-rid": p.ref.kind + ":" + p.ref.id, "data-ui": "review.three-row" }, [
          el("button", { type: "button", class: "k-grip", "data-reorder": "", "aria-label": "Move " + p.title, title: "Drag to move · Space lifts it", text: "⠿" }),
          el("span", { class: "k-dr-num k-mono", text: String(i + 1) }),
          U().bar(hue(p.subject)),
          el("div", { class: "k-rt-grow" }, [el("div", { class: "k-dr-row-t k-ellipsis", text: p.title }), muted(p.done ? "done" : p.ref.kind)]),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove " + p.title, "data-ui": "review.three-remove", text: "✕", onclick: function () { setThree(picked.filter(function (_, j) { return j !== i; })); } })
        ]));
      });
      /* nothing picked yet: the day's top three, offered, written only on a click */
      var offer = !resolved.length ? s.suggestions.slice(0, 3) : [];
      offer.forEach(function (x, i) {
        list.appendChild(el("div", { class: "k-dr-three-row k-dr-three-row--offer", "data-ui": "review.three-offer" }, [
          el("span", { class: "k-dr-num k-mono", text: String(i + 1) }), U().bar(hue(x.subject)),
          el("div", { class: "k-rt-grow" }, [el("div", { class: "k-dr-row-t k-ellipsis", text: x.title }), muted("suggested · " + x.why)])
        ]));
      });
      for (var k = Math.max(resolved.length, offer.length); k < 3; k++) list.appendChild(el("div", { class: "k-dr-three-empty", text: (k + 1) + " · optional" }));
      KOS.ui.reorder(list, { rows: "[data-rid]", label: function (row) { return row.querySelector(".k-dr-row-t").textContent; }, onDrop: function (row, l, index) {
        var key = row.getAttribute("data-rid"), from = picked.findIndex(function (r) { return r.kind + ":" + r.id === key; });
        var x = picked.splice(from, 1)[0]; picked.splice(index, 0, x); setThree(picked);
      } });
      var full = resolved.length >= 3;
      var sugg = card([hd(s.folded ? "Suggestions" : "Other suggestions", s.folded ? "for the time left" : "from the day")].concat(s.suggestions.slice(offer.length).map(function (x) {
        return refRow({ title: x.title, sub: x.why, kind: x.ref.kind, subject: x.subject }, el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.pick", text: full ? "⇄ Swap in" : "+ Pick", onclick: function () {
          var next = picked.slice();
          if (full) next[2] = x.ref; else next.push(x.ref);
          setThree(next);
          KOS.a11y && KOS.a11y.announce(full ? "Swapped in" : "Added, " + next.length + " of 3.");
        } }));
      })));
      body.appendChild(cols(el("div", { class: "k-dr-stack" }, [
        el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: s.folded ? "Pick up to three for the rest of today" : "Today's three" }), muted("up to three · fewer is fine · drag to reorder")]),
        list,
        offer.length ? el("div", { class: "k-cluster" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.three-use", text: offer.length === 3 ? "Use these three" : "Use these", onclick: function () { setThree(offer.map(function (x) { return x.ref; })); KOS.a11y && KOS.a11y.announce("Today's three set."); } }),
          muted("or pick your own from the suggestions")
        ]) : null,
        el("p", { class: "k-dr-soft", text: "Home shows these all day. Skipping this step leaves Home's own next step in charge." })
      ]), s.suggestions.length > offer.length ? sugg : null));
    },
    start: function (st, s, body) {
      var f = s.first, n = s.next;
      var title = f ? f.title : n ? n.title : null;
      body.appendChild(el("div", { class: "k-dr-start" }, [
        el("span", { class: "k-kicker", text: f ? "Your first task" : "A good first task" }),
        el("div", { class: "k-dr-start-t", text: title || "Nothing pressing" }),
        f && f.action ? el("div", { class: "k-dr-action" }, [el("span", { class: "k-kicker", text: "First concrete action" }), el("div", { text: f.action })]) : n && n.why ? muted(n.kicker + (n.why ? " · " + n.why : "")) : null,
        el("div", { class: "k-cluster k-dr-start-go" }, [
          title ? el("button", { type: "button", class: "k-btn k-btn--primary k-dr-big k-fit-btn", "data-ui": "review.start", title: "Start: " + title, onclick: function () {
            finish("done");
            startFocus(f, n);
          } }, [el("span", { class: "k-ellipsis", text: "▶ Start: " + title })]) : null,
          el("button", { type: "button", class: "k-btn", "data-ui": "review.not-yet", text: "Not yet", onclick: function () { finish("done"); } })
        ]),
        el("p", { class: "k-dr-soft", text: "Start opens About to Study with this filled in. Not yet closes the review; Home keeps this Start all day." })
      ]));
    },
    /* ---- the afternoon ---- */
    sofar: function (st, s, body) {
      var f = s.focus, subs = Object.keys(f.bySubject || {}).sort(function (a, b) { return f.bySubject[b] - f.bySubject[a]; });
      var max = Math.max(1, f.mins);
      var focusCard = card([hd("Focus", f.sessions ? U().plural(f.sessions, "session") : null),
        f.mins ? el("div", { class: "k-dr-fig" }, [el("b", { text: U().hmText(f.mins) }), muted("of Focus today")]) : el("p", { class: "k-dr-soft", text: "No Focus yet today, and there's time." })]
        .concat(subs.map(function (sid) {
          var m = KOS.subjects.meta(sid);
          return el("div", { class: "k-dr-sbar" }, [el("span", { class: "k-ellipsis", text: m ? m.short : sid }), el("span", { class: "k-dr-sbar-b", style: "--p: " + Math.round(100 * f.bySubject[sid] / max) + "%; --c: " + hue(sid) }), el("span", { class: "k-mono k-rt-small", text: f.bySubject[sid] + " m" })]);
        })));
      var three = s.three.length ? card([hd("Today's three")].concat(s.three.map(function (x) {
        var started = !x.done && startedOn(x);
        return refRow({ title: x.title, subject: x.subject, sub: x.done ? "done" : started ? "started" : "" }, stateChip(x.done ? "done" : started ? "started" : "untouched"));
      }))) : null;
      var ticks = card([
        s.habits.length ? el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "習" }), el("span", { class: "k-rt-grow", text: "Kept: " + s.habits.join(", ") }), muted(U().plural(s.habits.length, "habit"))]) : null,
        s.morningRoutine ? el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "朝" }), el("span", { class: "k-rt-grow k-rt-text2", text: s.morningRoutine.name + ": " + s.morningRoutine.n + " of " + s.morningRoutine.of + " this morning." })]) : null,
        s.ticks ? el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "済" }), el("span", { class: "k-rt-grow", text: U().plural(s.ticks, "task") + " ticked off" })]) : null
      ].filter(Boolean));
      body.appendChild(cols(focusCard, el("div", { class: "k-dr-stack" }, [three, ticks.children.length ? ticks : null].filter(Boolean))));
    },
    still: function (st, s, body) {
      var tl = card([hd("After now", "to the evening review"), U().nowMark(s.now)].concat(timeline(s.timeline)));
      var dl = s.due.length ? card([hd("Deadlines", "today, tomorrow, overdue")].concat(s.due.map(function (x) {
        return refRow(Object.assign({}, x, { sub: dueSub(x) }), el("span", { class: "k-chip", "data-tone": x.overdue ? "danger" : "muted", text: x.overdue ? "▲ Overdue" : x.due === KOS.srs.addDays(R().routineDay(), 1) ? "● Tomorrow" : "● Today" }));
      }))) : null;
      body.appendChild(cols(tl, dl));
    },
    time: function (st, s, body) {
      var total = s.free.reduce(function (m, b) { return m + b.mins; }, 0);
      body.appendChild(el("div", { class: "k-rt-hd" }, [el("b", { class: "k-dr-fig-sm", text: U().hmText(total) + " free" }), muted("in " + U().plural(s.free.length, "block") + ", from now to the evening review"), el("span", { class: "k-rt-fill" }), muted("Place puts a study block on the Calendar")]));
      body.appendChild(timeStrip(s.free));
      var rows = card(s.place.map(function (x) { return placeRow(x, s.free); }));
      if (!s.place.length) rows.appendChild(el("p", { class: "k-dr-soft", text: "Nothing open to place. The time is yours." }));
      body.appendChild(rows);
    },
    next: function (st, s, body) {
      var f = s.first, n = s.next, title = f ? f.title : n ? n.title : null;
      body.appendChild(el("div", { class: "k-dr-start" }, [
        el("span", { class: "k-kicker", text: "Next" }),
        el("div", { class: "k-dr-start-t", text: title || "The rest of the day is yours" }),
        n && !f ? muted(n.kicker + (n.why ? " · " + n.why : "")) : null,
        el("div", { class: "k-cluster k-dr-start-go" }, [
          title ? el("button", { type: "button", class: "k-btn k-btn--primary k-dr-big k-fit-btn", "data-ui": "review.start", title: "Start: " + title, onclick: function () { finish("done"); startFocus(f, n); } }, [el("span", { class: "k-ellipsis", text: "▶ Start: " + title })]) : null,
          el("button", { type: "button", class: "k-btn", "data-ui": "review.done", text: "Done for now", onclick: function () { finish("done"); } })
        ]),
        el("p", { class: "k-dr-soft", text: "The evening review still comes at " + (V().slotTime("evening", R().routineDay()) || "its time") + "." })
      ]));
    },
    /* ---- the evening ---- */
    numbers: function (st, s, body) {
      var f = s.facts, tiles = [];
      function tile(l, v, sub) { tiles.push(el("div", { class: "k-dr-num-t" }, [muted(l), el("b", { text: v }), sub ? el("span", { class: "k-rt-small k-rt-text2 k-ellipsis", text: sub }) : null])); }
      if (f.focusMins) tile("Focus", U().hmText(f.focusMins), U().plural(f.sessions, "session") + " · " + Object.keys(f.bySubject || {}).map(function (k) { var m = KOS.subjects.meta(k); return (m ? m.short : k) + " " + U().hmText(f.bySubject[k]); }).join(", "));
      if (f.cards) tile("Cards reviewed", String(f.cards));
      if (f.ticks) tile("Tasks done", String(f.ticks));
      if (f.lessons) tile("Lessons covered", String(f.lessons));
      if (f.routinesKept) tile("Routines kept", f.routinesKept + " of " + f.routinesOf);
      var cmp = f.weekAvgMins && f.focusMins ? (f.focusMins > f.weekAvgMins ? "▲ " + U().hmText(f.focusMins - f.weekAvgMins) + " more Focus" : f.focusMins < f.weekAvgMins ? "▼ " + U().hmText(f.weekAvgMins - f.focusMins) + " less Focus" : "The same Focus") + " than your average this week (" + U().hmText(f.weekAvgMins) + ")" : null;
      var numCard = card([el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "Today in numbers" }), muted(U().dayLabel(st.content.day, { weekday: "long", day: "numeric", month: "long" })), el("span", { class: "k-rt-fill" }),
        el("button", { type: "button", class: "k-link k-rt-small", text: "Full day →", onclick: function () { close(false); KOS.show("reports"); } })]),
        el("div", { class: "k-dr-nums" }, tiles),
        cmp ? el("div", { class: "k-dr-cmp", text: cmp }) : null]);
      var three = s.three && s.three.length ? card([hd("Today's three")].concat(s.three.map(function (x) {
        var started = !x.done && startedOn(x);
        return el("div", { class: "k-dr-row" }, [el("span", { class: "k-rt-grow k-ellipsis", text: x.title }), stateChip(x.done ? "done" : started ? "started" : "untouched")]);
      })).concat([el("p", { class: "k-dr-soft", text: "Started counts. The next step asks about anything still open, and Leave it is always an answer." })])) : null;
      body.appendChild(cols(numCard, three, "k-dr-cols--wide"));
    },
    unfinished: function (st, s, body) {
      body.appendChild(el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "Still open" }), muted("choose for any, or none")]));
      body.appendChild(card(s.items.map(function (x) { return triageRow(x, st, false); }), "k-dr-card--list"));
    },
    tomorrow: function (st, s, body) {
      var lessons = s.timeline.filter(function (x) { return x.kind === "lesson"; });
      var firstTimed = s.timeline.filter(function (x) { return x.start && x.kind !== "review" && x.kind !== "routine"; })[0];
      var timedLesson = s.timeline.filter(function (x) { return x.kind === "lesson" && x.start; })[0];
      var headline = s.exam ? "Exam " + (s.exam.time || "") + " · " + s.exam.title
        : timedLesson ? "First lesson " + timedLesson.start + " · " + (KOS.subjects.meta(timedLesson.subject) || {}).name
        : lessons.length ? "First lesson · " + (KOS.subjects.meta(lessons[0].subject) || {}).name
        : firstTimed ? firstTimed.title + " at " + firstTimed.start : "Nothing fixed tomorrow";
      var left = [];
      if (s.exam) left.push(examBlock(s.exam));
      var fixed = s.timeline.filter(function (x) { return x.kind !== "routine" && x.kind !== "review"; });
      left.push(card([el("span", { class: "k-kicker", text: U().dayLabel(s.date, { weekday: "long", day: "numeric", month: "long" }) }), el("div", { class: "k-dr-tm-h", text: headline })].concat(timeline(fixed.slice(0, 7), { kinds: false }))));
      if (s.bag.length && !s.exam) left.push(card([hd("Tomorrow's bag", "from tomorrow's timetable")].concat(s.bag.map(function (b) {
        return el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "鞄" }), el("span", { class: "k-rt-grow", text: b.text }), muted(b.why)]);
      }))));
      var right = [];
      if (s.due.length) right.push(card([hd("Within 3 days")].concat(s.due.map(function (x) { return refRow(Object.assign({}, x, { sub: dueSub(x) })); }))));
      right.push(firstPicker(s));
      body.appendChild(cols(el("div", { class: "k-dr-stack" }, left), el("div", { class: "k-dr-stack" }, right)));
    },
    prep: function (st, s, body) {
      var main = s.routines.map(function (x) { var r = R().get(x.id); return r ? card([U().checklist(r, { after: repaint })]) : null; }).filter(Boolean);
      var r0 = s.routines[0] && R().get(s.routines[0].id);
      var side = null;
      if (r0) {
        var day = R().routineDay(), p = day.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2], 12);
        var mon = KOS.srs.addDays(day, -((dt.getDay() + 6) % 7));
        var sum = R().summary(r0.id, mon, day);
        side = card([hd("Kept so far this week", r0.name), el("div", { class: "k-dr-fig" }, [el("b", { text: sum.kept + " of " + Math.max(sum.scheduled, sum.kept) }), muted("nights" + (R().streak(r0.id) ? " · 炎 " + R().streak(r0.id) + " in a row" : ""))]),
          el("p", { class: "k-dr-soft", text: "When the last required step is ticked, its reward shows once." }),
          el("p", { class: "k-dr-soft", text: "“Asleep by 00:00” is asked tomorrow morning, so it is not here." })]);
      }
      body.appendChild(cols(el("div", { class: "k-dr-stack" }, main), side, "k-dr-cols--wide"));
    },
    winddown: function (st, s, body) {
      var note = el("input", { type: "text", class: "k-input", value: s.note || "", placeholder: "One line about today…", "aria-label": "One line about today (private)", maxlength: 280, "data-ui": "review.note" });
      note.addEventListener("change", function () { V().setWindDown({ note: note.value }); });
      function scale(label, key, cur) {
        return el("div", { class: "k-dr-scale" }, [el("span", { class: "k-dr-scale-l", text: label }), el("div", { class: "k-dr-scale-n", role: "radiogroup", "aria-label": label }, [1, 2, 3, 4, 5].map(function (n) {
          return el("button", { type: "button", class: "k-dr-scale-b k-mono", role: "radio", "aria-checked": String(n === cur), "data-ui": "review." + key, text: String(n), onclick: function () {
            var v = {}; v[key] = n === cur ? null : n; V().setWindDown(v); repaint();
          } });
        })), muted("1 low · 5 high")]);
      }
      var quiet = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Hold alerts until the morning review" });
      quiet.checked = (store.state.ui || {}).reviewGoodNightQuiet !== false;
      quiet.addEventListener("change", function () { store.state.ui.reviewGoodNightQuiet = quiet.checked; store.save(); });
      body.appendChild(el("div", { class: "k-dr-wind" }, [
        el("p", { class: "k-dr-soft", text: "All optional. This stays in today's review, synced to your devices, never sent to Kurenai." }),
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "One line about today" }), note, el("span", { class: "k-field-hint", text: "private · only you see it" })]),
        scale("Mood", "mood", s.mood), scale("Energy", "energy", s.energy),
        el("div", { class: "k-dr-card k-rt-set" }, [quiet, el("div", { class: "k-rt-grow" }, [el("div", { text: "Hold alerts until the morning review" }), muted("device alerts only · tonight only")])])
      ]));
    }
  };

  function timeline(items, opts) {
    var nowShown = false, now = nowHm(), out = [];
    items.forEach(function (x) {
      if (!nowShown && x.start && x.start > now && R().routineDay() === KOS.srs.todayISO() && !(opts && opts.now === false) && open && open.slot !== "evening") { out.push(U().nowMark(now)); nowShown = true; }
      out.push(U().tlRow(x, opts));
    });
    return out.length ? out : [el("p", { class: "k-dr-soft", text: "Nothing timed." })];
  }
  /* Due: warnings first, then reminders and assignments, the plan's
     carried rows as ONE line (they are the plan's to show), pinned goals */
  function dueCard(due, warnings, goals) {
    var plan = due.filter(function (x) { return x.kind === "plan"; });
    var rest = due.filter(function (x) { return plan.indexOf(x) === -1; });
    var rows = (warnings || []).map(function (w) { return refRow({ kind: "exam", title: w.title, sub: w.body }); })
      .concat(rest.map(function (x) { return refRow(Object.assign({}, x, { sub: dueSub(x) })); }));
    if (plan.length) rows.push(el("button", { type: "button", class: "k-dr-row k-dr-rowbtn", "data-ui": "review.plan-carried", onclick: function () { close(false); KOS.show("pacing"); } }, [
      el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "計" }),
      el("span", { class: "k-rt-grow" }, [el("span", { class: "k-dr-row-t", text: U().plural(plan.length, "plan row") + " this week" + (plan.some(function (x) { return x.why === "carried"; }) ? " · " + plan.filter(function (x) { return x.why === "carried"; }).length + " carried over" : "") }), muted(plan.slice(0, 2).map(function (x) { return x.title; }).join(" · ") + (plan.length > 2 ? " …" : ""))]),
      muted("the plan ›")]));
    rows = rows.concat((goals || []).map(goalRow));
    return rows.length ? card([hd("Due", "today and the next 3 days")].concat(rows)) : null;
  }
  function goalRow(g) {
    var pct = g.target && g.current != null ? Math.round(100 * Math.min(1, g.current / g.target)) : null;
    return el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "標" }), el("div", { class: "k-rt-grow" }, [
      el("div", { class: "k-rt-hd" }, [el("span", { class: "k-dr-row-t k-ellipsis", text: g.title }), g.pace && KOS.ui.paceChip ? KOS.ui.paceChip(g.pace) : null]),
      muted((g.current != null ? g.current + " of " + g.target : "") + " · pinned"),
      pct != null ? el("span", { class: "k-bar", role: "img", "aria-label": pct + "%", style: "--p: " + pct + "%" }, [el("i")]) : null
    ])]);
  }
  function stateChip(k) {
    var t = { done: "✓ Done", started: "◐ Started", untouched: "○ Not started" }[k];
    return el("span", { class: "k-dr-state", "data-state": k, text: t });
  }
  function startedOn(x) {
    if (!x.ref) return false;
    if (x.ref.kind === "assignment") { var a = KOS.assignments.get(x.ref.id); return !!(a && (a.status === "inProgress" || a.progress > 0)); }
    return false;
  }
  function setThree(list) { V().setThree(list); repaint(); }
  function repaint() { if (open) { var c = open.cur; paint(); open.cur = c; } }

  /* triage (33c, 33f): Leave it is the default; each choice goes through the owner, with Undo */
  function triageRow(x, st, compact) {
    var cur = x.choice ? TRI.map(function (t) { return t[0]; }).indexOf(x.choice) : 4;
    var days = el("div", { class: "k-dr-days", hidden: true });
    var row = el("div", { class: "k-dr-tri", "data-ui": "review.triage" }, [
      U().bar(hue(x.subject)),
      el("div", { class: "k-rt-grow" }, [el("div", { class: "k-dr-row-t k-ellipsis", text: x.title }), muted({ three: "in today's three", overdue: "overdue", due: "due", block: "study block that did not run" }[x.why] || x.why || "")]),
      el("div", { class: "k-dr-tri-c" }, [U().choice(TRI.map(function (t) { return t[1]; }), cur, function (i) {
        var c = TRI[i][0];
        if (c === "week") { days.hidden = false; return; }
        apply(c);
      }, { label: "What to do with " + x.title, hook: "review.triage-choice" }), days])
    ]);
    /* the days left this week (to Sunday) */
    var day = R().routineDay(), p = day.split("-"), dow = new Date(+p[0], +p[1] - 1, +p[2], 12).getDay();
    var left = dow === 0 ? 0 : 7 - dow;
    var opts = [];
    for (var i = 2; i <= Math.max(2, left); i++) opts.push(KOS.srs.addDays(day, i));
    if (!opts.length) opts.push(KOS.srs.addDays(day, 2));
    days.appendChild(U().choice(opts.map(function (d) { return U().dayLabel(d); }), -1, function (i) { apply("week", opts[i]); }, { label: "Which day" }));
    function apply(c, d) {
      var res = V().triage(x.ref, c, { day: d });
      if (!res.ok) { KOS.ui.toast(res.why, true); return; }
      var said = { tomorrow: "moved to tomorrow", week: "moved to " + (d ? U().dayLabel(d, { weekday: "long" }) : "later this week"), someday: "moved to someday", done: "marked done", leave: "left as it is" }[c];
      if (res.note) said = res.note;
      if (c === "leave") KOS.a11y && KOS.a11y.announce(x.title + ", " + said);
      else KOS.ui.toast(x.title + " · " + said, false, { label: "Undo", run: function () { res.undo(); repaint(); } });
      repaint();
    }
    return row;
  }

  /* last night's routine (33a): its ticks, "Did it last night", Yes · No */
  function lastNightCard(r) {
    var rt = R().get(r.id);
    var rows = [];
    r.done.forEach(function (sx) { rows.push(el("div", { class: "k-dr-row" }, [U().check(true, sx.text + ", done", null, { disabled: true }), el("span", { class: "k-rt-grow k-rt-text2", text: sx.text })])); });
    r.left.forEach(function (sx) {
      rows.push(el("div", { class: "k-dr-row" }, [U().check(false, sx.text, null, { disabled: true }), el("span", { class: "k-rt-grow", text: sx.text }),
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.did-last-night", text: "Did it last night", onclick: function () {
          var res = R().tick(r.id, sx.id, true, { day: r.day });
          U().afterTick(rt, res);
          KOS.a11y && KOS.a11y.announce(sx.text + ", done for last night.");
          repaint();
        } })]));
    });
    r.check.forEach(function (sx) {
      rows.push(el("div", { class: "k-dr-row" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "眠" }), el("div", { class: "k-rt-grow" }, [el("div", { text: sx.text + "?" }), muted("asked this morning · optional")]),
        U().choice(["Yes", "No"], -1, function (i) {
          var res = i === 0 ? R().tick(r.id, sx.id, true, { day: r.day }) : R().answerNo(r.id, sx.id, { day: r.day });
          if (i === 0) U().afterTick(rt, res);
          repaint();
        }, { label: sx.text, hook: "review.morning-check" })]));
    });
    var n = r.done.length, of = r.done.length + r.left.length;
    return card([hd(r.name + " · last night", n + " of " + of + " required")].concat(rows).concat([el("p", { class: "k-dr-soft", text: "A tick here counts for last night." })]));
  }

  /* the exam tomorrow (33h) */
  function examBlock(x) {
    return el("div", { class: "k-dr-card k-dr-exam", role: "region", "aria-label": "Tomorrow's exam" }, [
      el("div", { class: "k-rt-hd" }, [el("span", { class: "k-dr-glyph", lang: "ja", "aria-hidden": "true", text: "試" }), el("span", { class: "k-kicker", text: "Tomorrow's exam" }), el("span", { class: "k-rt-fill" }),
        KOS.exams && KOS.exams.season && (KOS.exams.season() || {}).on ? el("span", { class: "k-chip", "data-tone": "muted", text: "Exam Season" }) : null]),
      el("div", { class: "k-dr-tm-h", text: x.title }),
      el("div", { class: "k-rt-text2", text: [x.time, x.room, x.seat ? "seat " + x.seat : null].filter(Boolean).join(" · ") }),
      x.open.length ? el("div", { class: "k-dr-exam-list" }, [muted("Checklist · " + x.open.length + " open")].concat(x.open.map(function (c) {
        return el("div", { class: "k-dr-row" }, [el("span", { "aria-hidden": "true", text: "·" }), el("span", { text: c.text })]);
      }))) : null
    ]);
  }
  /* tomorrow's first task: a radio row, then its two-minute action */
  function firstPicker(s) {
    var opts = s.suggestions.slice(0, 3);
    var cur = s.first ? opts.findIndex(function (o) { return o.ref.kind === s.first.ref.kind && String(o.ref.id) === String(s.first.ref.id); }) : -1;
    if (s.first && cur === -1) { opts.unshift({ ref: s.first.ref, title: s.first.title }); cur = 0; }
    var action = el("input", { type: "text", class: "k-input", value: (s.first && s.first.action) || "", maxlength: 160, "aria-label": "Its first two-minute action", placeholder: "Open it and do the first small thing", "data-ui": "review.first-action" });
    action.addEventListener("change", function () { if (cur >= 0) V().setFirst(opts[cur].ref, action.value, null, true); });
    if (!opts.length) return card([hd("Tomorrow's first task"), el("p", { class: "k-dr-soft", text: "Nothing is due soon, so tomorrow starts wherever you like." })]);
    return card([hd("Tomorrow's first task", "the morning review opens with it"),
      U().choice(opts.map(function (o) { return o.title; }), cur, function (i) { V().setFirst(opts[i].ref, action.value, null, true); KOS.a11y && KOS.a11y.announce("Tomorrow's first task: " + opts[i].title); repaint(); }, { label: "Tomorrow's first task", hook: "review.first-pick" }),
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Its first two-minute action" }), action, el("span", { class: "k-field-hint", text: "One line, in your words: something you could do in two minutes." })])
    ]);
  }

  /* the time-left strip (33d): free blocks outlined, fixed items hatched */
  function timeStrip(free) {
    var until = V().slotTime("evening", R().routineDay()) || "22:00";
    var from = Math.min.apply(null, [mins(nowHm())].concat(free.map(function (b) { return mins(b.from); })));
    var to = Math.max(mins(until), from + 60), span = to - from;
    var bar = el("div", { class: "k-dr-tstrip", role: "img", "aria-label": free.length ? "Free time: " + free.map(function (b) { return b.mins + " minutes from " + b.from; }).join(", ") : "No free time before the evening review" });
    free.forEach(function (b) {
      bar.appendChild(el("span", { class: "k-dr-tblock", style: "--l: " + (100 * (mins(b.from) - from) / span) + "%; --w: " + (100 * b.mins / span) + "%" }, [el("b", { class: "k-mono", text: U().hmText(b.mins) }), b.mins >= 45 ? el("span", { class: "k-rt-small k-muted", text: b.from + "–" + b.to }) : null]));
    });
    for (var t = Math.ceil(from / 60) * 60; t < to; t += 60) bar.appendChild(el("span", { class: "k-dr-ttick k-mono", style: "--l: " + (100 * (t - from) / span) + "%", text: pad(Math.floor(t / 60)) + ":00" }));
    bar.appendChild(el("span", { class: "k-dr-tend k-mono", text: until + " 夜" }));
    return bar;
  }
  function mins(hm) { var p = String(hm).split(":"); return +p[0] * 60 + +p[1]; }
  function placeRow(x, free) {
    var need = Math.min(90, x.estimateMins || 45);
    var fits = free.filter(function (b) { return b.mins >= Math.min(need, 25); });
    var place = fits.length ? KOS.ui.menu({ label: "Place in a free block", className: "k-btn--sm", hint: "Make a study block", items: fits.map(function (b) {
      var len = Math.min(need, b.mins), end = b.from.split(":"); var e = mins(b.from) + len;
      return { label: b.from + "–" + pad(Math.floor(e / 60)) + ":" + pad(e % 60), hint: U().hmText(b.mins) + " free", onSelect: function () {
        var ev = KOS.calendar.addEvent({ type: "study", title: x.title, date: R().routineDay(), time: b.from, durationMins: len, subject: x.subject || null,
          assignmentId: x.ref.kind === "assignment" ? x.ref.id : null });
        if (!ev) { KOS.ui.toast("Couldn't place it.", true); return; }
        KOS.ui.toast("Study block " + ev.time + " · " + x.title, false, { label: "Undo", run: function () { KOS.calendar.deleteEvent(ev.id); repaint(); } });
        repaint();
      } };
    }) }) : null;
    return el("div", { class: "k-dr-place", "data-ui": "review.place-row" }, [U().bar(hue(x.subject)), el("div", { class: "k-rt-grow" }, [el("div", { class: "k-dr-row-t k-ellipsis", text: x.title }), muted(dueSub(x))]),
      el("div", { class: "k-cluster" }, [place,
        el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Tomorrow", onclick: function () { var r = V().triage(x.ref, "tomorrow"); if (r.ok) KOS.ui.toast(x.title + " · moved to tomorrow", false, { label: "Undo", run: function () { r.undo(); repaint(); } }); else KOS.ui.toast(r.why, true); repaint(); } }),
        el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", "aria-label": "Done: " + x.title, text: "✓ Done", onclick: function () { var r = V().triage(x.ref, "done"); if (r.ok) KOS.ui.toast(x.title + " · marked done", false, { label: "Undo", run: function () { r.undo(); repaint(); } }); repaint(); } })
      ].filter(Boolean))]);
  }

  /* Start: About to Study, filled from the first task or the ladder's next */
  function startFocus(f, n) {
    var ctx = {};
    if (f && f.ref) {
      if (f.ref.kind === "assignment") ctx.assignmentId = f.ref.id;
      if (f.ref.kind === "topic") { var i = String(f.ref.id).indexOf(":"); ctx.subject = f.ref.id.slice(0, i); ctx.refs = [f.ref.id]; }
      ctx.title = f.title; ctx.objective = f.action || "";
      if (f.subject) ctx.subject = ctx.subject || f.subject;
    } else if (n) {
      ctx.title = n.title; ctx.subject = n.subject; ctx.refs = n.refs; ctx.assignmentId = n.assignmentId;
    }
    if (KOS.routinePlayer) KOS.routinePlayer.preflight(ctx); else KOS.show("focus");
  }

  /* Good night (33g): done, tonight's quiet window if allowed, one calm screen */
  function goodNight() {
    var st = open;
    if (!st) return;
    V().finish(st.slot, "done");
    var held = false;
    if ((store.state.ui || {}).reviewGoodNightQuiet !== false) {
      var tmr = KOS.srs.addDays(R().routineDay(), 1), to = V().slotTime("morning", tmr) || "07:00";
      var p0 = tmr.split("-"), t0 = to.split(":");
      store.state.ui.notifyHoldUntil = new Date(+p0[0], +p0[1] - 1, +p0[2], +t0[0], +t0[1]).getTime();
      store.save();
      held = to;
    }
    var first = V().day(R().routineDay()).evening && V().day(R().routineDay()).evening.tomorrow && V().day(R().routineDay()).evening.tomorrow.first;
    var p = st.panel;
    p.innerHTML = "";
    p.setAttribute("data-tint", "night");
    p.appendChild(el("div", { class: "k-dr-goodnight", "data-ui": "review.goodnight-screen" }, [
      V().cfg().portrait ? el("img", { class: "k-dr-gn-face", src: U().img("face.kurenai.evening"), alt: "" }) : null,
      el("h2", { class: "k-dr-gn-t", text: "Good night." }),
      el("p", { class: "k-dr-soft", text: (held ? "Alerts are held until the morning review at " + held + ". " : "") + (first ? "Tomorrow starts with " + (V().resolve(first) || {}).title + (first.action ? ": " + first.action : "") + "." : "") }),
      el("button", { type: "button", class: "k-btn", "data-ui": "review.close", text: "Close", onclick: function () { open = null; st.overlay.remove(); paintChip(); KOS.rerender(); } })
    ]));
    KOS.a11y && KOS.a11y.announce("Good night." + (held ? " Alerts held until " + held + "." : ""));
  }

  /* the empty review (33i): one sentence, one action */
  function emptyBody(st) {
    var evening = V().slotTime("evening", R().routineDay());
    return el("div", { class: "k-dr-empty", "data-ui": "review.empty" }, [
      el("img", { class: "k-dr-empty-art", src: U().img("spot.alldone"), alt: "" }),
      el("h3", { class: "k-dr-start-t", text: "Nothing pressing today" }),
      muted("No lessons and nothing due." + (evening ? " The evening review is at " + evening + "." : "")),
      el("div", { class: "k-cluster k-dr-start-go" }, [
        el("button", { type: "button", class: "k-btn", text: "Pick something", onclick: function () { finish("done"); if (KOS.routinePlayer) KOS.routinePlayer.preflight({}); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.close", text: "Close", onclick: function () { finish("done"); } })
      ])
    ]);
  }

  /* ================= the chip (33i) ================= */
  var chipMount = null;
  function chipState() {
    if (!V().enabled()) return null;
    var d = V().due();
    if (!d) {
      var p = V().recent();
      return p ? { slot: p.slot, sub: p.state === "done" ? "· done" : "· skipped", past: true } : null;
    }
    var mini = peekUi().minimised;
    var sub = mini && mini.slot === d.slot && mini.day === d.day ? "· " + Math.max(1, (open ? open.steps.length : 3) - mini.step) + " steps left"
      : KOS.focus && KOS.focus.state && KOS.focus.state() !== "idle" ? "· after Focus" : "· ready";
    if (mini && mini.slot === d.slot && mini.day === d.day) { var c = V().content(d.slot); sub = "· " + Math.max(1, c.steps.length - mini.step) + " steps left"; }
    return { slot: d.slot, sub: sub };
  }
  function paintChip() {
    if (!chipMount) {
      var bell = document.getElementById("notify-mount");
      if (!bell || !bell.parentNode) return;
      chipMount = el("span", { class: "k-dr-chipmount", "data-ui": "review.chip-mount" });
      bell.parentNode.insertBefore(chipMount, bell);
    }
    chipMount.innerHTML = "";
    var c = chipState();
    if (!c || open) return;
    var btn = KOS.ui.menu({ label: V().LABEL[c.slot] + " " + c.sub, className: "k-dr-chip", hint: V().LABEL[c.slot], items: c.past ? [
      { label: "Open again", hint: "tick, pick or change anything in it", onSelect: function () { openSheet(c.slot); } }
    ] : [
      { label: peekUi().minimised ? "Resume" : "Open", hint: c.sub.replace("· ", ""), onSelect: function () { openSheet(c.slot); } },
      { label: "Skip review", hint: "nothing else changes", onSelect: function () { V().finish(c.slot, "skipped"); delete ui().minimised; store.save(); paintChip(); KOS.rerender(); } }
    ] });
    if (c.past) KOS.ui.state(btn, "past", true);
    btn.setAttribute("data-ui", (btn.getAttribute("data-ui") || "") + " review.chip");
    btn.setAttribute("data-slot", c.slot);
    btn.insertBefore(el("span", { class: "k-dr-chip-k", lang: "ja", "aria-hidden": "true", text: MARK[c.slot] }), btn.firstChild);
    chipMount.appendChild(btn);
  }

  /* ================= auto-open (invariant 145) ================= */
  /* only on the first open inside the slot, and never over Focus, a dialog,
     the Exam Room or a deep link — then the chip is the way in */
  var bootHash = null, held = {};        // reviews held to the chip this session (a deep link, Focus…)
  function blocked() {
    if (KOS.focus && KOS.focus.state && KOS.focus.state() !== "idle") return true;
    if (KOS.ui.topDialog && KOS.ui.topDialog()) return true;
    var h = location.hash || "";
    if (/^#\/exams\/[^/]+\/room/.test(h)) return true;
    if (bootHash && !/^#\/?(home)?$/.test(bootHash)) return true;
    return false;
  }
  function maybeOpen() {
    if (!V().enabled()) return;
    paintChip();
    var d = V().due();
    if (!d || open) return;
    if (!V().cfg().autoOpen) return;
    /* the first time, it waits in the chip: it opens by itself only once a
       review has been opened at least once (on any device) */
    var rec = store.state.dayReview;
    if (!rec || !rec.days || !Object.keys(rec.days).length) return;
    var seen = (peekUi().lastShown || {})[d.day + "|" + d.slot];
    if (seen || peekUi().minimised || held[d.day + "|" + d.slot]) return;
    if (blocked()) { held[d.day + "|" + d.slot] = true; return; }
    openSheet(d.slot);
  }
  function start() {
    bootHash = location.hash || "";
    setTimeout(function () { maybeOpen(); bootHash = null; }, 1500);
    setInterval(function () { if (!open) paintChip(); }, 30000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") setTimeout(maybeOpen, 600); });
  }

  KOS.reviewSheet = { open: openSheet, close: close, chip: paintChip, maybeOpen: maybeOpen, start: start, isOpen: function () { return !!open; }, slot: function () { return open && open.slot; } };
})();
