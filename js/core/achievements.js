/* Kurenai OS — core/achievements.js
   Achievements, the Badge Wall (roadmap 5.16–5.17, docs/achievements-plan.md;
   invariants 161–163).

   A REGISTRY, like Goals' types (invariant 5b): every badge is registered by
   the catalogue (core/achcatalogue.js) with the domains whose records it
   reads, and its `measure` READS those records — the session ledger, the
   topic bands, Code's evidence, the vault — and returns a number. Progress
   is never stored: the one record is what was EARNED.

     def = { id, set, name, what (what counts, in words), unit,
             tiers: [n, …] — ascending thresholds; "all" is resolved by
               total(ctx) (every leaf, every eligible project); a one-off
               badge is [1],
             owners: ["ledger", "code", …] — the domains it reads; an owner
               event re-measures only the badges that list it,
             measure(ctx, cb) → cb(number | null) (null: no evidence or
               not released yet), or v(ctx) → number | null (sync),
             total(ctx) → number | null (for an "all" tier),
             hidden (a secret until earned), art (an image id, or null
               until its art is made), glyph (the medallion's kanji while
               it has no art), soon (true: the content is not released) }

   STATE (`state.achievements`, synced):
     earned[id] = { tier, at (first tier's time), t: {"1": ts, "2": ts …} }
       Merged MONOTONICALLY (cloudmerge: tiers max, times min): an earned
       tier is never taken away, even when its evidence is later deleted.
     months["YYYY-MM"] = { focus, focusSecs, cards, … } — the session
       ledger's monthly ROLLUP. The ledger keeps 2,000 entries (sessions.js
       CAP), so a lifetime count read from it alone would fall as old
       entries drop off. Every month before this one is folded here,
       field by field as the larger of what was stored and what the ledger
       holds now (merged by max), and a lifetime count is the sum of the
       months. Derived from the ledger only; nothing new is tracked.
     showcase [ids ≤ 6], title (a title id) — the Wall's choices.
   PER DEVICE (`state.ui`): achSeen[id] (the last value this device showed,
   so a pull from another device never pings), achInit (the silent first
   run has happened here), achPings ("auto" | "every" | "quarter" | "off").

   ZERO GOVERNOR TRAFFIC (invariant 161): a badge pays no XP, gold or HP —
   the work it recognises was paid by its own entry. A title is cosmetic.
   Reads write nothing: list()/view() are pure; only evaluate() writes, and
   only a tier that was not earned before.                                  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var DEFS = [], BY_ID = {}, SETS = [], SET_BY_ID = {}, TITLES = [];
  var SHOWCASE_MAX = 6;
  var PING_GAP = 10000;                   // one ping per badge per 10 s
  var EVERY_UNDER = 20;                   // "auto": every step for targets of 20 or fewer
  var SILENT_MS = 2 * 60 * 1000;          // a device's first sweep and the two minutes after it are silent
  var listeners = [];

  /* ---------------- dates ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function monthOf(dateIso) { return String(dateIso || "").slice(0, 7); }
  function thisMonth() { return iso(new Date()).slice(0, 7); }

  /* ---------------- state ---------------- */
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function normalise(raw) {
    var a = obj(raw), earned = {}, months = {};
    Object.keys(obj(a.earned)).forEach(function (id) {
      var e = obj(a.earned[id]), tier = Math.max(0, Math.floor(+e.tier || 0));
      if (!tier) return;
      var t = {};
      Object.keys(obj(e.t)).forEach(function (k) { var v = +e.t[k]; if (v > 0) t[k] = v; });
      earned[id] = { tier: tier, at: +e.at > 0 ? +e.at : (t["1"] || Date.now()), t: t };
    });
    Object.keys(obj(a.months)).forEach(function (m) {
      if (!/^\d{4}-\d{2}$/.test(m)) return;
      var row = {};
      Object.keys(obj(a.months[m])).forEach(function (k) { var v = +a.months[m][k]; if (isFinite(v) && v > 0) row[k] = v; });
      months[m] = row;
    });
    var showcase = (Array.isArray(a.showcase) ? a.showcase : []).filter(function (id, i, all) {
      return typeof id === "string" && all.indexOf(id) === i;
    }).slice(0, SHOWCASE_MAX);
    return { v: 1, earned: earned, months: months, showcase: showcase,
      title: typeof a.title === "string" ? a.title : null };
  }
  function S() {
    var st = store.state;
    if (!st.achievements || st.achievements.v !== 1 || !st.achievements.earned) st.achievements = normalise(st.achievements);
    if (!st.achievements.months) st.achievements.months = {};
    if (!Array.isArray(st.achievements.showcase)) st.achievements.showcase = [];
    return st.achievements;
  }
  /* a read that never writes: the stored record, or an empty one */
  function peek() { var a = store.state.achievements; return a && a.earned ? a : normalise(a); }
  function U() {
    var ui = store.state.ui || (store.state.ui = {});
    if (!ui.achSeen || typeof ui.achSeen !== "object") ui.achSeen = {};
    return ui;
  }
  function peekUi() { return store.state.ui || {}; }

  /* ---------------- the registry ---------------- */
  function defineSet(s) {
    if (SET_BY_ID[s.id]) return;
    SETS.push(s); SET_BY_ID[s.id] = s;
  }
  function register(def) {
    if (!def || !def.id || BY_ID[def.id]) return;
    if (!def.tiers || !def.tiers.length) def.tiers = [1];
    def.owners = def.owners || [];
    DEFS.push(def); BY_ID[def.id] = def;
  }
  function defineTitle(t) { TITLES.push(t); }
  function def(id) { return BY_ID[id] || null; }
  function defs() { return DEFS.slice(); }
  function sets() { return SETS.slice(); }
  function set(id) { return SET_BY_ID[id] || null; }
  function setDefs(id) { return DEFS.filter(function (d) { return d.set === id; }); }

  /* ================= the ledger: one pass, rolled up by month =================
     One walk of the session ledger, cached by its length and last entry, gives
     every month's figures; months before this one are folded into the stored
     rollup (max per field). SUM fields add across months; MAX fields take the
     largest month. */
  var SUM = ["focus", "focusSecs", "focusClean", "switched", "cards", "again", "quizQ", "todo", "routine",
    "gold", "days", "early", "late", "witch", "jan1", "codeDays", "codeRecall", "crDrillDays", "studyDays", "reminders"];
  var MAX = ["longest", "bestDay", "monthCards", "monthRecall"];
  var STUDY = { focus: 1, flashcards: 1, "due-review": 1, quiz: 1, exam: 1, tracker: 1, code: 1, ja: 1, mind: 1, creatives: 1 };
  function isStudy(e) {
    if (!STUDY[e.type]) return false;
    if (e.type === "focus") return !!(e.metrics && e.metrics.complete) && e.subject !== "media";
    return true;
  }
  var ledgerCache = null;
  function ledgerKey(L) { var last = L[L.length - 1]; return L.length + ":" + (last ? last.id + ":" + last.ts : ""); }
  function scanLedger() {
    var L = store.state.sessions || [], key = ledgerKey(L);
    if (ledgerCache && ledgerCache.key === key) return ledgerCache;
    var months = {}, dayFocus = {}, dayStudy = {}, dayAny = {}, dayCode = {}, dayDrill = {};
    var studyDays = {}, routineDays = {}, ledgerDays = {};
    function M(m) {
      var r = months[m];
      if (!r) { r = months[m] = {}; SUM.concat(MAX).forEach(function (k) { r[k] = 0; }); }
      return r;
    }
    L.forEach(function (e) {
      if (!e || !e.date) return;
      var m = monthOf(e.date), r = M(m), x = e.metrics || {};
      var h = e.ts ? new Date(e.ts).getHours() : null;
      if (!dayAny[e.date]) { dayAny[e.date] = 1; r.days++; }
      ledgerDays[e.date] = true;
      if (e.award && +e.award.gold > 0) r.gold += +e.award.gold;
      if (h === 3) r.witch++;
      if (e.type === "focus") {
        var secs = KOS.sessions && KOS.sessions.parts ? KOS.sessions.parts(e).reduce(function (n, p) { return n + (p.secs || 0); }, 0) : (+x.secs || 0);
        r.focusSecs += secs;
        if (x.complete) {
          r.focus++;
          if (!(+x.pauses > 0)) r.focusClean++;
          if (secs > r.longest) r.longest = secs;
          if (e.date.slice(5) === "01-01") r.jan1++;
        }
        if (Array.isArray(x.segments) && x.segments.length > 1) r.switched++;
        dayFocus[e.date] = (dayFocus[e.date] || 0) + secs;
        if (dayFocus[e.date] > r.bestDay) r.bestDay = dayFocus[e.date];
      }
      if (e.type === "flashcards" || e.type === "due-review") { r.cards += +x.cards || 0; r.again += +x.again || 0; }
      if (e.type === "quiz") r.quizQ += +x.total || 0;
      if (e.type === "todo") {
        r.todo++;
        if (x.routine) { r.routine++; routineDays[e.date] = true; }
        if (x.source === "reminder") r.reminders++;
      }
      if (e.type === "code" && x.kind === "task" && !x.seen && !x.topup && !dayCode[e.date]) { dayCode[e.date] = 1; r.codeDays++; }
      if (e.type === "code" && x.kind === "retrieval" && x.grade && x.grade !== "again") r.codeRecall++;
      if (e.type === "creatives" && x.kind === "drill" && !dayDrill[e.date]) { dayDrill[e.date] = 1; r.crDrillDays++; }
      if (isStudy(e)) {
        studyDays[e.date] = true;
        if (!dayStudy[e.date]) { dayStudy[e.date] = 1; r.studyDays++; }
        /* an entry is logged when it ends: its start is the end less its
           length. Early bird: started 04:00–06:59; night owl: ended 23:00–02:59 */
        var len = (+e.dur || +x.secs || 0) * 1000;
        var sh = e.ts ? new Date(e.ts - len).getHours() : null;
        if (sh != null && sh >= 4 && sh < 7) r.early++;
        if (h != null && (h === 23 || h < 3)) r.late++;
      }
    });
    /* a month's recall (Steady memory): the month's flashcard recall when it
       holds 200 reviews; a month under that makes no claim */
    Object.keys(months).forEach(function (m) {
      var r = months[m];
      r.monthCards = r.cards;
      r.monthRecall = r.cards >= 200 ? Math.round(100 * (r.cards - r.again) / r.cards) : 0;
    });
    ledgerCache = { key: key, months: months, studyDays: studyDays, routineDays: routineDays, days: ledgerDays };
    return ledgerCache;
  }
  /* fold every month before this one into the stored rollup (max per field);
     `all` (the ledger is about to cut entries) folds this month too, so its
     count is a high-water mark the cut cannot lower */
  function rollup(all) {
    var scan = scanLedger(), A = S(), cur = thisMonth(), moved = false;
    Object.keys(scan.months).forEach(function (m) {
      if (m >= cur && !all) return;
      var live = scan.months[m], row = A.months[m] || (A.months[m] = {});
      SUM.concat(MAX).forEach(function (k) {
        var v = live[k] || 0;
        if (v > (row[k] || 0)) { row[k] = v; moved = true; }
      });
    });
    return moved;
  }
  /* every month: the larger of the stored rollup and the ledger's own count */
  function monthRows() {
    var scan = scanLedger(), A = peek(), rows = {};
    Object.keys(A.months || {}).concat(Object.keys(scan.months)).forEach(function (m) {
      if (rows[m]) return;
      var a = A.months[m] || {}, b = scan.months[m] || {}, r = {};
      SUM.concat(MAX).forEach(function (k) { r[k] = Math.max(+a[k] || 0, +b[k] || 0); });
      rows[m] = r;
    });
    return rows;
  }
  function lifetime() {
    var rows = monthRows(), out = {};
    SUM.forEach(function (k) { out[k] = 0; });
    MAX.forEach(function (k) { out[k] = 0; });
    Object.keys(rows).forEach(function (m) {
      SUM.forEach(function (k) { out[k] += rows[m][k]; });
      MAX.forEach(function (k) { if (rows[m][k] > out[k]) out[k] = rows[m][k]; });
    });
    out.months = rows;
    return out;
  }

  /* ================= the measuring context =================
     One per evaluation: every expensive read happens at most once, however
     many badges ask for it. Async sources (the vault, Money, the review log)
     are fetched only when a measured badge needs them. */
  function makeCtx() {
    var memo = {}, waits = {};
    var ctx = {
      today: iso(new Date()),
      once: function (key, fn) { if (!(key in memo)) memo[key] = fn(); return memo[key]; },
      /* async once: fn(cb) is called the first time; every caller gets the value */
      later: function (key, fn, cb) {
        if (key in memo) { cb(memo[key]); return; }
        if (waits[key]) { waits[key].push(cb); return; }
        waits[key] = [cb];
        var done = false;
        try {
          fn(function (v) {
            if (done) return; done = true;
            memo[key] = v; var q = waits[key]; delete waits[key];
            q.forEach(function (f) { f(v); });
          });
        } catch (e) { if (!done) { done = true; memo[key] = null; var q2 = waits[key]; delete waits[key]; q2.forEach(function (f) { f(null); }); } }
      },
      life: function () { return ctx.once("life", lifetime); },
      scan: function () { return ctx.once("scan", scanLedger); },
      state: store.state
    };
    return ctx;
  }

  /* ================= tiers and progress ================= */
  /* the thresholds with "all" resolved; an unresolvable "all" is null */
  function thresholds(d, ctx) {
    var tot;
    return d.tiers.map(function (t) {
      if (t !== "all") return +t;
      if (tot === undefined) { try { tot = d.total ? d.total(ctx) : null; } catch (e) { tot = null; } }
      return tot && tot > 0 ? tot : null;
    });
  }
  function tierOf(ths, v) {
    var n = 0;
    if (v == null) return 0;
    for (var i = 0; i < ths.length; i++) { if (ths[i] != null && v >= ths[i]) n = i + 1; else break; }
    return n;
  }
  /* progress inside the CURRENT tier interval:
       (current − previousThreshold) / (nextThreshold − previousThreshold)
     a fully earned badge is 1 whatever its evidence says now (new content
     never dims it), and an unearned hidden badge is 0 (it leaks nothing) */
  function progressOf(d, ths, v, earnedTier) {
    var n = ths.length;
    if (earnedTier >= n) return 1;
    if (d.hidden && !earnedTier) return 0;
    var next = ths[earnedTier], prev = earnedTier ? ths[earnedTier - 1] : 0;
    if (next == null || v == null) return 0;
    var p = (v - prev) / Math.max(1e-9, next - prev);
    return Math.max(0, Math.min(1, p));
  }

  /* ================= measuring ================= */
  function measureOne(d, ctx, cb) {
    var sent = false;
    function out(v) {
      if (sent) return; sent = true;
      cb(typeof v === "number" && isFinite(v) ? v : v === true ? 1 : v === false ? 0 : null);
    }
    if (d.soon) { out(null); return; }
    try {
      if (d.measure) d.measure(ctx, out);
      else if (d.v) out(d.v(ctx));
      else out(null);
    } catch (e) { out(null); }
  }
  /* what a badge looks like now: a pure read (writes nothing) */
  function viewOf(d, ctx, v) {
    var e = peek().earned[d.id] || null, ths = thresholds(d, ctx);
    var tier = e ? Math.min(e.tier, ths.length) : 0;
    var full = tier >= ths.length;
    var p = progressOf(d, ths, v, tier);
    var next = full ? null : ths[tier];
    var prev = tier ? ths[tier - 1] : 0;
    var masked = !!d.hidden && !tier;
    /* soon: the content is not released (a badge's own `soon`/`soonIf`); a
       badge with no evidence yet is simply locked */
    var soon = !!d.soon;
    if (!soon && d.soonIf) { try { soon = !!d.soonIf(); } catch (e) { soon = true; } }
    var state = full ? "earned" : masked ? "hidden" : soon && !tier ? "soon"
      : p >= 0.9 ? "nearly" : p > 0 || tier ? "progress" : "locked";
    return { id: d.id, def: d, set: d.set, tier: tier, tiers: ths.length, thresholds: ths, value: v, p: p,
      next: next, prev: prev, full: full, masked: masked, state: state, earned: e,
      at: e ? e.at : null, lastAt: e ? Math.max.apply(null, Object.keys(e.t).map(function (k) { return e.t[k]; }).concat([e.at])) : null };
  }
  /* list(cb, {set, ids}) → every badge's view, measured now */
  function list(cb, opts) {
    opts = opts || {};
    var ctx = makeCtx();
    var ds = DEFS.filter(function (d) { return (!opts.set || d.set === opts.set) && (!opts.ids || opts.ids.indexOf(d.id) >= 0); });
    var out = new Array(ds.length), left = ds.length;
    if (!left) { cb([]); return; }
    ds.forEach(function (d, i) {
      measureOne(d, ctx, function (v) {
        out[i] = viewOf(d, ctx, v);
        if (--left === 0) cb(out);
      });
    });
  }
  /* the earned record alone, synchronously (the Governor's card, search) */
  function counts() {
    var A = peek(), owned = 0, tiers = 0, total = 0;
    DEFS.forEach(function (d) {
      total += d.tiers.length;
      var e = A.earned[d.id];
      if (e) { tiers += Math.min(e.tier, d.tiers.length); if (e.tier >= d.tiers.length) owned++; }
    });
    return { owned: owned, badges: DEFS.length, tiers: tiers, tiersTotal: total };
  }

  /* ================= evaluate: the one writer =================
     evaluate(domains | null, cb): re-measure the badges whose owners touch
     `domains` (null: every badge — the boot and the 30-minute tick), write
     any new tier, and return what changed:
       { earned: [{id, tier, prevTier}], pings: [{id, from, to, p}], silent }
     A first run on this device (achInit unset) is SILENT: what history
     already meets is earned with no overlay and no ping, and summarised once. */
  var running = false, pendingAll = false, pendingDomains = {}, inflight = {};
  function evaluate(domains, cb) {
    cb = cb || function () {};
    if (running) {
      if (!domains) pendingAll = true;
      else domains.forEach(function (d) { pendingDomains[d] = true; });
      cb(null);
      return;
    }
    running = true;
    /* silent: this device's first sweep, and the two minutes after it (a
       fresh device's first cloud pull lands then — its history is not news) */
    var ctx = makeCtx(), A = S(), ui = U(), silent = !ui.achInit || Date.now() - ui.achInit < SILENT_MS;
    var rolled = !domains && rollup();
    var ds = DEFS.filter(function (d) {
      if (!domains) return true;
      return d.owners.some(function (o) { return domains.indexOf(o) >= 0; });
    });
    var result = { earned: [], pings: [], silent: silent }, left = ds.length, now = Date.now(), wrote = !!rolled;
    function finish() {
      if (!ui.achInit) { ui.achInit = now; wrote = true; }
      if (wrote) store.save();
      running = false;
      emit(result);
      cb(result);
      if (pendingAll || Object.keys(pendingDomains).length) {
        var next = pendingAll ? null : Object.keys(pendingDomains);
        pendingAll = false; pendingDomains = {};
        setTimeout(function () { evaluate(next); }, 0);
      }
    }
    if (!left) { finish(); return; }
    ds.forEach(function (d) { inflight[d.id] = true; });
    ds.forEach(function (d) {
      measureOne(d, ctx, function (v) {
        delete inflight[d.id];
        try {
          var ths = thresholds(d, ctx), e = A.earned[d.id], had = e ? e.tier : 0;
          var tier = tierOf(ths, v);
          if (tier > had) {
            if (!e) e = A.earned[d.id] = { tier: 0, at: now, t: {} };
            for (var k = had + 1; k <= tier; k++) if (!e.t[k]) e.t[k] = now;
            e.tier = tier;
            wrote = true;
            result.earned.push({ id: d.id, tier: tier, prevTier: had });
          }
          /* a ping: the value moved on this device and no tier was earned */
          var seen = ui.achSeen[d.id];
          if (v != null && seen !== v) {
            if (seen != null && v > seen && tier === had && !d.hidden && !silent) {
              var cur = Math.min(tier, ths.length);
              if (cur < ths.length && ths[cur] != null) {
                result.pings.push({ id: d.id, from: seen, to: v, prev: cur ? ths[cur - 1] : 0, next: ths[cur],
                  p: progressOf(d, ths, v, cur), p0: progressOf(d, ths, seen, cur) });
              }
            }
            ui.achSeen[d.id] = v;
            wrote = true;
          }
        } catch (err) { /* one badge's failure never stops the rest */ }
        if (--left === 0) finish();
      });
    });
  }

  /* should a ping show? (decision 4; edge case: quarter steps are relative to
     the current tier interval, the same fraction the rim ring draws) */
  function pingRule(pg, mode) {
    mode = mode || peekUi().achPings || "auto";
    if (mode === "off") return false;
    var span = pg.next - pg.prev;
    var every = mode === "every" || (mode === "auto" && span <= EVERY_UNDER);
    if (every) return true;
    return Math.floor(pg.p * 4 + 1e-9) > Math.floor(pg.p0 * 4 + 1e-9);
  }
  var lastPing = {};
  function pingAllowed(pg, now) {
    now = now || Date.now();
    if (!pingRule(pg)) return false;
    if (lastPing[pg.id] && now - lastPing[pg.id] < PING_GAP) return false;
    lastPing[pg.id] = now;
    return true;
  }

  /* ---------------- owner events: only the affected badges ---------------- */
  var dirty = {}, timer = null, started = false;
  function touch(domain) {
    /* owner events wait for the boot's first full sweep (start) */
    if (!domain || !started) return;
    (Array.isArray(domain) ? domain : [domain]).forEach(function (d) { dirty[d] = true; });
    if (timer) return;
    timer = setTimeout(function () {
      timer = null;
      var ds = Object.keys(dirty); dirty = {};
      if (ds.length) evaluate(ds);
    }, 400);
  }
  /* the session ledger's entry types → the domains they feed */
  var TYPE_DOMAINS = { focus: ["ledger", "focus"], flashcards: ["ledger", "study"], "due-review": ["ledger", "study"],
    quiz: ["ledger", "study"], exam: ["ledger", "study"], tracker: ["ledger", "exams"], todo: ["ledger", "routines", "organise"],
    code: ["ledger", "code"], ja: ["ledger", "ja"], mind: ["ledger", "mind"], creatives: ["ledger", "creatives"] };
  function onSession(e) { touch((e && TYPE_DOMAINS[e.type]) || ["ledger"]); }
  /* a topic's progress record moved: the subject's own domain */
  function onProgress(sid) {
    var map = { code: "code", ja: "ja", mind: "mind", creatives: "creatives" };
    touch(map[sid] || "study");
  }

  /* ---------------- titles and the showcase ---------------- */
  function titles() {
    var A = peek();
    return TITLES.map(function (t) {
      var e = A.earned[t.badge], d = BY_ID[t.badge];
      return Object.assign({}, t, { unlocked: !!(e && d && e.tier >= t.tier) });
    });
  }
  function title() {
    var A = peek(), t = TITLES.filter(function (x) { return x.id === A.title; })[0];
    if (!t) return null;
    var e = A.earned[t.badge];
    return e && e.tier >= t.tier ? t : null;
  }
  function setTitle(id) {
    var t = id ? TITLES.filter(function (x) { return x.id === id; })[0] : null;
    if (id && (!t || !titles().filter(function (x) { return x.id === id && x.unlocked; }).length)) return false;
    S().title = t ? t.id : null;
    store.save();
    return true;
  }
  function showcase() {
    var A = peek();
    return (A.showcase || []).filter(function (id) { return BY_ID[id] && A.earned[id]; }).slice(0, SHOWCASE_MAX);
  }
  function setShowcase(ids) {
    var A = S();
    A.showcase = (ids || []).filter(function (id, i, all) { return BY_ID[id] && A.earned[id] && all.indexOf(id) === i; }).slice(0, SHOWCASE_MAX);
    store.save();
    return A.showcase.slice();
  }

  /* ---------------- quiet: never over Focus, the Exam Room or a dialog ---------------- */
  function quiet() {
    if (KOS.focus && KOS.focus.state && KOS.focus.state() !== "idle") return true;
    if (KOS.ui && KOS.ui.topDialog && KOS.ui.topDialog()) return true;
    var h = (window.location && window.location.hash) || "";
    if (/^#\/exams\/[^/]+\/room/.test(h)) return true;
    if (KOS.examPaperView && KOS.examPaperView.timing && KOS.examPaperView.timing()) return true;
    return false;
  }

  /* ---------------- Reports (102d): the tiers earned in a period ---------------- */
  /* earnedIn(start, end) → [{id, tier, at}] for every tier whose time falls in
     [start, end] (ISO days, inclusive); pure */
  function earnedIn(start, end) {
    var A = peek(), out = [];
    Object.keys(A.earned).forEach(function (id) {
      var e = A.earned[id];
      Object.keys(e.t).forEach(function (k) {
        var day = iso(new Date(e.t[k]));
        if (day >= start && day <= end) out.push({ id: id, tier: +k, at: e.t[k] });
      });
    });
    return out.sort(function (a, b) { return a.at - b.at; });
  }

  /* ---------------- the notification (kind `achievement`) ---------------- */
  function notify(ch) {
    if (!KOS.notify || !KOS.notify.push) return;
    var d = BY_ID[ch.id]; if (!d) return;
    var many = d.tiers.length > 1;
    KOS.notify.push({ id: "ach:" + ch.id + ":" + ch.tier, kind: "achievement",
      title: "Badge earned: " + d.name + (many ? " " + roman(ch.tier) : ""),
      body: d.hidden ? "A hidden badge" : d.what, view: "achievements", arg: "set/" + d.set, ts: Date.now() });
  }
  function roman(n) { return ["", "I", "II", "III", "IV", "V", "VI"][n] || String(n); }

  /* ---------------- boot ---------------- */
  function emit(r) { listeners.forEach(function (fn) { try { fn(r); } catch (e) { /* a listener must not break evaluation */ } }); }
  function onChange(fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  function start() {
    if (started) return;
    started = true;
    setTimeout(function () { evaluate(null); }, 2500);
    setInterval(function () { evaluate(null); }, 30 * 60 * 1000);
    ["kos-ink", "kos-files-index", "kos-mind-journal"].forEach(function (ev) {
      var dom = ev === "kos-ink" ? "ink" : ev === "kos-mind-journal" ? "mind" : "files";
      var tgt = ev === "kos-mind-journal" ? document : window;
      tgt.addEventListener(ev, function () { touch(dom); });
    });
  }

  KOS.achievements = {
    SHOWCASE_MAX: SHOWCASE_MAX, SUM: SUM, MAX: MAX,
    normalise: normalise, peek: peek,
    defineSet: defineSet, register: register, defineTitle: defineTitle,
    def: def, defs: defs, sets: sets, set: set, setDefs: setDefs,
    lifetime: lifetime, rollup: rollup, scan: scanLedger, isStudy: isStudy,
    thresholds: thresholds, tierOf: tierOf, progressOf: progressOf,
    makeCtx: makeCtx, list: list, counts: counts, viewOf: viewOf, measureOne: measureOne,
    evaluate: evaluate, touch: touch, onSession: onSession, onProgress: onProgress,
    pingRule: pingRule, pingAllowed: pingAllowed,
    titles: titles, title: title, setTitle: setTitle, showcase: showcase, setShowcase: setShowcase,
    quiet: quiet, earnedIn: earnedIn, notify: notify, roman: roman,
    onChange: onChange, start: start,
    _resetCache: function () { ledgerCache = null; lastPing = {}; },
    _inflight: function () { return { running: running, ids: Object.keys(inflight) }; },
    _started: function (on) { started = on !== false; },
    /* an evaluation running or queued (a test waits for it before it snapshots the state) */
    _busy: function () { return running || timer !== null || pendingAll || Object.keys(pendingDomains).length > 0; }
  };
})();
