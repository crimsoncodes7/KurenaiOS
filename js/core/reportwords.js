/* Kurenai OS — core/reportwords.js
   Reports (roadmap 5.1): the words. TEMPLATE words are built here from a
   report's facts by rule (24f): the largest share first, then recall,
   moves to Green, the peak hour and carry-overs, then the Collection.
   Pure and deterministic — the same facts always read the same, offline
   and free. Kurenai's words (phase 4) replace the headline and narrative
   only, and fall back to these.

   The formatters live here too, so every surface prints a figure one way:
   hm(), the comparisons (rule 5: "▲ 18% on last week", "same as last
   week", "new this week", never a bare 0 or "+∞%"), and the subject and
   medium names.                                                          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var SUBJECT = { compsci: "Computer Science", maths: "Maths", it: "IT" };
  var SUBJECT_SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  var MEDIUM = { anime: "Anime", books: "Books", vn: "Visual novels", game: "Games" };
  var PERIOD_NOUN = { week: "week", month: "month", term: "term", year: "year" };

  function hm(mins) {
    mins = Math.round(mins || 0);
    var h = Math.floor(mins / 60), m = mins % 60;
    return h ? (m ? h + "h " + (m < 10 ? "0" : "") + m + "m" : h + "h") : m + "m";
  }
  function num(n) { return Math.round(n).toLocaleString("en-GB"); }
  function plural(n, one, many) { return num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function list(items) {
    if (items.length <= 1) return items.join("");
    return items.slice(0, -1).join(", ") + (items.length > 2 ? "," : "") + " and " + items[items.length - 1];
  }
  /* a comparison against an earlier figure: {dir: "up"|"down"|"same"|"new",
     text}. `kind` "mins" prints the difference as time, "pct" as points,
     anything else as a percentage of the earlier figure. */
  function compare(now, before, label, kind) {
    if (now == null || before == null) return null;
    if (now === before) return { dir: "same", text: "same as " + label };
    if (!before) return now ? { dir: "new", text: "new this " + label.replace(/^last /, "") } : null;
    var up = now > before, d = Math.abs(now - before);
    var amount = kind === "mins" ? hm(d) : kind === "pct" ? num(d) + " pts" : Math.round(100 * d / before) + "%";
    return { dir: up ? "up" : "down", text: (up ? "▲ " : "▼ ") + amount + " on " + label };
  }

  function largestShare(s) {
    var keys = Object.keys(s.bySubject || {}).filter(function (k) { return s.bySubject[k] > 0; });
    if (!keys.length) return null;
    keys.sort(function (a, b) { return s.bySubject[b] - s.bySubject[a]; });
    return keys[0];
  }

  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function parseISO(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function prevLabel(f) {
    if (f.period === "month") { var d = parseISO(f.start); d.setMonth(d.getMonth() - 1); return MON3[d.getMonth()]; }
    return "last " + (PERIOD_NOUN[f.period] || "period");
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  /* the longer periods lead with what the design leads with: the month
     against the one before, the term's results and the class plan, the
     year's records (24c–24e) */
  function longTemplate(f) {
    var s = f.study, g = f.gov || {}, pl = prevLabel(f), bits = [], out = [];
    var prev = f.prev;
    if (f.period === "month") {
      bits.push(s.mins ? hm(s.mins) + " studied" : "A quiet month for study");
      if (prev && prev.mins > 0 && s.mins >= 2 * prev.mins) bits.push("more than double " + pl);
      else if (prev && prev.mins > 0 && s.mins > prev.mins) bits.push(hm(s.mins - prev.mins) + " more than " + pl);
      if (prev && prev.recall != null && s.recall != null && s.recall > prev.recall) bits.push("with recall up " + (s.recall - prev.recall) + " points");
      else if (s.toGreen) bits.push(plural(s.toGreen, "topic") + " to Green");
    } else if (f.period === "term") {
      var r = f.results && f.results.best;
      if (r && r.grade) bits.push((/^[AEIOU]/.test(r.grade) ? "an " : "a ") + r.grade + " in " + r.title);
      (f.vsClass ? f.vsClass.rows : []).forEach(function (row) {
        var name = SUBJECT_SHORT[row.sid];
        bits.push(row.end.pos === "ahead" ? name + " ahead of class" : row.end.pos === "behind" ? name + " " + plural(row.end.n, "topic") + " behind" : name + " aligned with class");
      });
      if (!bits.length) bits.push(s.mins ? hm(s.mins) + " studied this term" : "A quiet term for study");
    } else {
      bits.push(s.mins ? hm(s.mins) + " of study" : "A quiet year for study");
      if (f.results && f.results.best && f.results.best.grade) bits.push("a best result of " + f.results.best.grade + " in " + f.results.best.title);
      if (f.records && f.records.streak && f.records.streak.days >= 7) bits.push((f.records.streak.days) + "-day streak");
    }
    if (bits.length > 3) bits = bits.slice(0, 3);
    if (f.period === "year" && bits.length > 1 && /streak$/.test(bits[bits.length - 1])) bits[bits.length - 1] = (/^(8|11(?!\d)|18(?!\d))/.test(bits[bits.length - 1]) ? "an " : "a ") + bits[bits.length - 1];
    var headline = cap(list(bits)) + ".";
    /* the narrative */
    var keys = Object.keys(s.bySubject || {}).filter(function (k) { return s.bySubject[k] > 0; }).sort(function (a, b) { return s.bySubject[b] - s.bySubject[a]; });
    if (s.mins) {
      out.push("You studied on " + s.days + " of " + s.of + " days for " + hm(s.mins) +
        (keys.length > 1 ? ": " + list(keys.map(function (k) { return SUBJECT[k] + " " + hm(s.bySubject[k]); })) : keys.length ? ", all " + SUBJECT[keys[0]] : "") + ".");
    } else if (s.days) out.push("You studied on " + s.days + " of " + s.of + " days, without a timed session.");
    if (prev && prev.mins != null && s.mins !== prev.mins && f.period === "month") {
      out.push(s.mins > prev.mins ? (prev.mins ? "That is " + hm(s.mins - prev.mins) + " more than " + pl + "." : "New this month: " + pl + " had no timed study.") : "That is " + hm(prev.mins - s.mins) + " less than " + pl + ".");
    }
    if (s.recall != null) {
      out.push(prev && prev.recall != null && prev.recall !== s.recall && f.period === "month"
        ? "Recall " + (s.recall > prev.recall ? "rose" : "moved") + " from " + prev.recall + "% to " + s.recall + "% across " + num(s.reviews) + " reviews" + (s.toGreen ? ", and " + plural(s.toGreen, "topic") + " moved to Green." : ".")
        : "Recall was " + s.recall + "% across " + num(s.reviews) + " reviews" + (s.toGreen ? ", and " + plural(s.toGreen, "topic") + " moved to Green." : "."));
    }
    if (s.busiest && s.days >= 2) {
      var bd = parseISO(s.busiest.date);
      out.push("Your busiest day was " + DOW_LONG[bd.getDay()] + " " + bd.getDate() + " " + MONTH_NAMES[bd.getMonth()] +
        (f.focus && f.focus.blocks && f.focus.peakHour != null ? ", and " + (f.focus.peakHour < 10 ? "0" : "") + f.focus.peakHour + ":00 was your peak hour." : "."));
    }
    if (f.vsClass && f.period !== "month") {
      var parts = f.vsClass.rows.map(function (row) { return SUBJECT_SHORT[row.sid] + " " + (row.end.pos === "aligned" ? "aligned" : plural(row.end.n, "topic") + " " + row.end.pos); });
      if (parts.length) out.push("Against the class plan, " + list(parts) + ".");
    }
    if (f.results && f.results.list.length && f.period !== "month") {
      var best = f.results.best;
      out.push(plural(f.results.list.length, "graded result") + (best ? ", the best " + best.title + " at " + best.pct + "%" + (best.grade ? " (" + best.grade + ")" : "") : "") + ".");
    }
    if (f.results && f.results.pending && f.period !== "month") out.push(list(f.results.pending.map(function (u) { return u.title.split(" · ")[0]; })) + " still to sit.");
    if (f.collection && f.collection.status && f.collection.status.finished) out.push(plural(f.collection.status.finished, "title was", "titles were") + " completed in the Collection.");
    if (!s.days && f.gov.rest) out.push("The rest streak reached " + plural(f.gov.rest, "day") + ".");
    return { headline: headline, narrative: out.join(" ") };
  }

  /* {headline, narrative} for any period's facts */
  function template(f) {
    if (f.period !== "week") return longTemplate(f);
    var noun = PERIOD_NOUN[f.period] || "period", s = f.study, fo = f.focus || {}, g = f.gov || {};
    /* the headline: what was studied, what moved, the streak */
    var bits = [];
    bits.push(s.mins ? hm(s.mins) + " studied" : "A quiet " + noun + " for study");
    if (s.toGreen) bits.push(plural(s.toGreen, "topic") + " to Green");
    else if (f.collection && f.collection.count && !s.mins) bits.push(plural(f.collection.count, "title") + " in the Collection");
    if (g.streak >= 2) bits.push("the streak at " + g.streak + " days");
    var headline = list(bits) + ".";
    headline = headline.charAt(0).toUpperCase() + headline.slice(1);

    var out = [];
    var top = largestShare(s);
    if (top && s.mins) {
      var keys = Object.keys(s.bySubject).filter(function (k) { return s.bySubject[k] > 0; });
      out.push(keys.length > 1
        ? SUBJECT[top] + " took the largest share, " + hm(s.bySubject[top]) + " of " + hm(s.mins) + ", across " + plural(s.sessions, "session") + " on " + s.days + " of " + s.of + " days."
        : "All " + hm(s.mins) + " went to " + SUBJECT[top] + ", across " + plural(s.sessions, "session") + ".");
    } else if (s.days) {
      out.push("You studied on " + s.days + " of " + s.of + " days, without a timed session.");
    }
    /* only an increase is worth a sentence; a quieter week is not an alarm
       (rule 4) and the tile already carries the comparison */
    if (f.prev && f.prev.mins > 0 && s.mins > f.prev.mins) out.push("That is " + hm(s.mins - f.prev.mins) + " more than last " + noun + ".");
    if (s.recall != null) out.push("Recall was " + s.recall + "% across " + num(s.reviews) + " reviews.");
    else if (s.reviews) out.push(plural(s.reviews, "card") + " reviewed.");
    if (s.toGreen) {
      var greens = (s.moves || []).filter(function (m) { return m.to === "g"; }).slice(0, 2)
        .map(function (m) { var t = (s.topics || []).filter(function (x) { return x.key === m.key; })[0]; return t ? t.title : null; })
        .filter(Boolean);
      out.push(greens.length ? list(greens) + (s.toGreen > greens.length ? " and " + (s.toGreen - greens.length) + " more" : "") + " moved to Green."
        : plural(s.toGreen, "topic") + " moved to Green.");
    }
    if (fo.blocks && fo.peakHour != null) out.push("Most Focus came around " + (fo.peakHour < 10 ? "0" : "") + fo.peakHour + ":00, with the longest block at " + fo.longest + " minutes.");
    if (f.plan) {
      out.push(f.plan.carried
        ? f.plan.ticked + " of " + f.plan.planned + " plan rows ticked; " + plural(f.plan.carried, "row") + " carried on."
        : "Every plan row was ticked.");
    }
    var c = f.collection;
    if (c && c.count) {
      var cs = [];
      if (c.status.finished) cs.push(num(c.status.finished) + " finished");
      if (c.status.started) cs.push(num(c.status.started) + " started");
      var whole = c.status.finished === c.count ? " finished" : c.status.started === c.count ? " started" : null;
      out.push("In the Collection, " + plural(c.count, "title") + (whole || (" moved" + (cs.length ? ", " + list(cs) : ""))) + ".");
    }
    return { headline: headline, narrative: out.join(" ") };
  }

  /* the headline and one sentence an overview page opens with (25b–25d),
     by rule from the same facts */
  function section(f, which) {
    var s = f.study, fo = f.focus || {}, c = f.collection, noun = PERIOD_NOUN[f.period] || "period";
    if (which === "study") {
      var keys = Object.keys(s.bySubject || {}).filter(function (k) { return s.bySubject[k] > 0; })
        .sort(function (a, b) { return s.bySubject[b] - s.bySubject[a]; });
      var lead = !keys.length ? "" : keys.length === 1 ? ", all " + SUBJECT_SHORT[keys[0]]
        : (s.bySubject[keys[0]] - s.bySubject[keys[1]]) <= 0.15 * s.bySubject[keys[0]]
          ? ", " + SUBJECT_SHORT[keys[0]] + " just ahead of " + SUBJECT_SHORT[keys[1]]
          : ", mostly " + SUBJECT_SHORT[keys[0]];
      return { headline: s.mins ? hm(s.mins) + " over " + plural(s.sessions, "session") + lead + "." : "No timed study this " + noun + ".",
        sentence: s.touched ? plural(s.touched, "topic") + " touched" + (s.reviews ? ", " + plural(s.reviews, "review") : "") + "." : "" };
    }
    if (which === "focus") {
      if (!fo.blocks) return { headline: "No Focus blocks this " + noun + ".", sentence: "" };
      var h = fo.hours || [], tot = h.reduce(function (a, b) { return a + b; }, 0) || 1;
      var share = function (a, b) { return h.slice(a, b).reduce(function (x, y) { return x + y; }, 0) / tot; };
      var when = share(18, 24) >= 0.5 ? ", most of them after 18:00" : share(4, 12) >= 0.5 ? ", most of them before noon" : ", the longest " + fo.longest + " minutes";
      return { headline: plural(fo.blocks, "Focus block") + when + ".", sentence: hm(fo.mins) + " in all, in blocks of about " + fo.typical + " minutes." };
    }
    if (which === "collection") {
      if (!c) return { headline: "Nothing moved in the Collection this " + noun + ".", sentence: "" };
      var mods = Object.keys(c.byModule).sort(function (a, b) { return c.byModule[b] - c.byModule[a]; });
      var mostly = mods.length > 1 && c.byModule[mods[0]] > c.count / 2 ? ", mostly " + MEDIUM[mods[0]].toLowerCase() : "";
      var weekend = "";
      if (c.dayTitles && c.dayTitles.length === 7) {
        var tot2 = 0, wk = 0;
        c.dayTitles.forEach(function (d, i) { var n = Object.keys(d).reduce(function (a, k) { return a + d[k]; }, 0); tot2 += n; if (i >= 5) wk += n; });
        if (tot2 >= 6 && wk / tot2 >= 0.45) weekend = " at the weekend";
      }
      var parts = mods.map(function (m) { return num(c.byModule[m]) + " " + (m === "anime" ? "anime" : m === "books" ? (c.byModule[m] === 1 ? "book" : "books") : m === "vn" ? (c.byModule[m] === 1 ? "visual novel" : "visual novels") : (c.byModule[m] === 1 ? "game" : "games")); });
      var sent = "You touched " + list(parts) + (c.estMins ? " for about " + hm(c.estMins) : "") + ".";
      if (c.genres && c.genres[0]) sent += " " + c.genres[0].name + " led the genres.";
      return { headline: plural(c.count, "title") + " in one " + noun + mostly + weekend + ".", sentence: sent };
    }
    return { headline: "", sentence: "" };
  }

  /* ---------------- Kurenai's words (24f) ----------------
     ONE request per report, made of the report's TOTALS: study minutes
     per subject, sessions, reviews, recall, topics touched and moved to
     Green, Focus blocks, longest, peak, plan ticked and carried, the
     Collection's counts per medium, XP, gold and streaks. Never notes,
     card text, topic or title names, or chat history (README "State",
     invariants 71, 71a). `payload()` is the whole of what is sent, and
     the "What is sent" panel prints exactly it. */
  var DAY3 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function payload(rep) {
    var f = rep.facts, s = f.study, fo = f.focus || {}, c = f.collection, g = f.gov || {}, out = {};
    out.period = f.period + " " + f.start;
    var sm = {};
    ["compsci", "maths", "it"].forEach(function (k) { if (s.bySubject[k]) sm[SUBJECT_SHORT[k].toLowerCase()] = s.bySubject[k]; });
    out.study_min = sm;
    out.sessions = s.sessions;
    out.study_days = s.days + "/" + s.of;
    if (s.reviews) out.reviews = s.reviews;
    if (s.recall != null) out.recall = Math.round(s.recall) / 100;
    if (s.touched) out.topics_touched = s.touched;
    if (s.toGreen != null) out.to_green = s.toGreen;
    if (s.quizzes) out.quizzes = s.quizzes;
    if (fo.blocks) {
      out.focus_blocks = fo.blocks;
      out.longest_min = fo.longest;
      var bd = fo.byDay || [], best = 0;
      bd.forEach(function (m, i) { if (m > bd[best]) best = i; });
      out.peak = (f.period === "week" ? DAY3[best] + " " : "") + (fo.peakHour < 10 ? "0" : "") + fo.peakHour;
    }
    if (f.code) {
      if (f.code.tasks) out.code_tasks_passed = f.code.tasks;
      if (f.code.skills) out.code_skills_proven = f.code.skills;
      if (f.code.retrieval) out.code_retrievals = (f.code.retrievalOk || 0) + "/" + f.code.retrieval;
      if (f.code.katas) out.code_katas = f.code.katas;
    }
    /* Money and Goals (5.4, "What Kurenai sees", 27o): totals in and out,
       the three biggest categories by amount, the subscriptions total, and
       how many goals were met or missed with their names. Never payees,
       notes, tags or the titles bought (invariant 102b). */
    if (f.money) {
      var m2 = function (n) { return Math.round(n) / 100; };
      if (f.money.outgoings) out.money_out = m2(f.money.outgoings);
      if (f.money.income) out.money_in = m2(f.money.income);
      if (f.money.toPots) out.money_saved = m2(f.money.toPots);
      if (f.money.top) out.money_top = f.money.top.map(function (c) { return c.name + " " + m2(c.spent); });
      if (f.money.subs) out.subscriptions_month = m2(f.money.subs);
      if (f.money.over) out.budgets_over = f.money.over.length;
    }
    if (f.goals) {
      var met = (f.goals.periodsMet || 0) + (f.goals.reached ? f.goals.reached.length : 0);
      var missed = (f.goals.periodsMissed || 0) + (f.goals.missed ? f.goals.missed.length : 0);
      if (met) out.goals_met = met;
      if (missed) out.goals_missed = missed;
      var names = function (l) { return (l || []).map(function (g) { return g.title; }); };
      if (f.goals.reached || f.goals.metNames) out.goals_met_names = names(f.goals.reached).concat(f.goals.metNames || []);
      if (f.goals.missed || f.goals.missedNames) out.goals_missed_names = names(f.goals.missed).concat(f.goals.missedNames || []);
    }
    if (f.plan) {
      out.plan = f.plan.ticked + "/" + f.plan.planned;
      if (f.plan.carried) {
        out.carried = f.plan.carried;
        var subs = [];
        (f.plan.rows || []).forEach(function (r) { if (!r.done && r.subject && subs.indexOf(SUBJECT_SHORT[r.subject].toLowerCase()) === -1) subs.push(SUBJECT_SHORT[r.subject].toLowerCase()); });
        if (subs.length) out.carried_in = subs;
      }
    }
    if (c) {
      var col = {}, u = c.units || {};
      Object.keys(c.byModule).forEach(function (m) { col[m + "_titles"] = c.byModule[m]; });
      if (u.ep) col.anime_eps = u.ep;
      if (u.ch) col.chapters = u.ch;
      if (u.vol) col.volumes = u.vol;
      if (u.route) col.vn_routes = u.route;
      if (u.hours) col.hours_played = Math.round(u.hours * 10) / 10;
      if (c.status.finished) col.finished = c.status.finished;
      if (c.status.started) col.started = c.status.started;
      out.collection = col;
    }
    if (g.xp != null) out.xp = g.xp;
    if (g.gold != null) out.gold = g.gold;
    if (g.streak) out.streak = g.streak;
    if (g.rest) out.rest = g.rest;
    if (f.prev && f.prev.mins != null) out.last_period_study_min = f.prev.mins;
    if (f.prev && f.prev.recall != null) out.last_period_recall = Math.round(f.prev.recall) / 100;
    if (f.period !== "week") {
      if (s.busiest) out.busiest_day_min = s.busiest.mins;
      if (f.tasks && f.tasks.reminders) out.reminders_done = f.tasks.reminders;
      if (f.tasks && f.tasks.habitDays) out.habit_days = f.tasks.habitDays;
      if (f.mastery) out.units_gaining_green = f.mastery.filter(function (u) { return u.green > 0; }).length;
      /* results as kind, percentage and grade only: never a paper's name */
      if (f.results && f.results.list.length) out.results = f.results.list.map(function (r) { return (r.kind || "result") + " " + (r.pct != null ? r.pct + "%" : "") + (r.grade ? " " + r.grade : ""); });
      if (f.results && f.results.pending) out.units_to_sit = f.results.pending.length;
      if (f.vsClass) out.vs_class = f.vsClass.rows.map(function (r) { return SUBJECT_SHORT[r.sid].toLowerCase() + " " + r.end.pos + (r.end.n ? " " + r.end.n : ""); });
      if (f.records && f.records.streak) out.longest_streak = f.records.streak.days;
    }
    if (f.rebuilt) out.rebuilt_from_history = true;
    return out;
  }
  /* the payload as the panel prints it: one line per field */
  function payloadLines(p) {
    return Object.keys(p).map(function (k) {
      var v = p[k];
      return k + ": " + (v && typeof v === "object" ? (Array.isArray(v) ? "(" + v.join(", ") + ")"
        : "{" + Object.keys(v).map(function (kk) { return kk + ": " + v[kk]; }).join(", ") + "}") : String(v));
    });
  }
  var SCHEMA = { type: "object", properties: { headline: { type: "string" }, narrative: { type: "string" } }, required: ["headline", "narrative"] };
  var SYSTEM = "You are Kurenai, the study companion inside KurenaiOS, an app for an A-level student. " +
    "Write the words for one saved period review from the TOTALS you are given, and nothing else. " +
    "Return JSON {\"headline\", \"narrative\"}. The headline is one sentence of at most 14 words. " +
    "The narrative is 3 to 5 sentences of plain prose in the second person and the past tense, in British English. " +
    "Use only the numbers given; never invent topics, titles, days or figures that are not there. " +
    "Rest and quiet days are facts, never failures; a lower figure than last time is not a warning. " +
    "Rewards are things that were earned, never promised. No markdown, no lists, no emoji.";
  function clean(s) { return String(s || "").replace(/[*_#`>]+/g, "").replace(/\s+/g, " ").trim(); }
  /* send the one request. cb(err, {headline, narrative}); returns the
     request's id, which cancel() takes. A reply that is not two sensible
     strings is a failure, never shown. */
  function write(rep, cb) {
    if (!KOS.ai || !KOS.ai.chat) { cb({ kind: "config", message: "The Assistant is not available." }); return null; }
    var noun = PERIOD_NOUN[rep.facts.period] || "period";
    return KOS.ai.chat("generation", {
      system: SYSTEM,
      messages: [{ role: "user", content: "The " + noun + "'s totals:\n" + JSON.stringify(payload(rep)) }],
      structured: { schema: SCHEMA },
      temperature: 0.7,
      maxTokens: 700
    }, function (err, res) {
      if (err) { cb(err); return; }
      var raw = null;
      try { raw = JSON.parse(res.text); } catch (e) { raw = null; }
      var h = raw && clean(raw.headline), n = raw && clean(raw.narrative);
      if (!h || !n || h.length > 160 || n.length < 30 || n.length > 1600) { cb({ kind: "invalid", message: "The reply was not usable words." }); return; }
      cb(null, { headline: h, narrative: n, provider: res.provider, model: res.model });
    });
  }
  /* the calm note a failure shows (24f ④) */
  function failNote(err) {
    var why = !err ? "something went wrong"
      : err.kind === "network" || err.kind === "timeout" ? "no connection"
      : err.kind === "config" || err.kind === "auth" ? "the Assistant isn't connected"
      : err.kind === "rate" ? "today's requests are used up"
      : err.kind === "invalid" ? "the reply wasn't usable"
      : "the provider didn't answer";
    return "Kurenai couldn't write this one (" + why + "). Showing the template words; nothing else on the page changed.";
  }

  /* the words a report shows: Kurenai's when written, else the template */
  function current(rep) {
    var w = rep && rep.words;
    if (w && w.mode === "kurenai" && w.headline && w.status !== "failed") return { headline: w.headline, narrative: w.narrative || "", byKurenai: true };
    var t = template(rep.facts);
    return { headline: t.headline, narrative: t.narrative, byKurenai: false };
  }

  KOS.reportWords = {
    SUBJECT: SUBJECT, SUBJECT_SHORT: SUBJECT_SHORT, MEDIUM: MEDIUM,
    hm: hm, num: num, plural: plural, list: list, compare: compare,
    template: template, section: section, current: current,
    payload: payload, payloadLines: payloadLines, write: write, failNote: failNote
  };
})();
