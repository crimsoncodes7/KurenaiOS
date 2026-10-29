/* Kurenai OS — core/extgcal.js · KOS.extGcal
   Google Calendar (roadmap 5.15, docs/integrations-plan.md §4,
   invariants 158–159).

   TWO-WAY with your PRIMARY Google calendar: the Calendar's own events.
     · A local event goes up under the Google id `KOS.ext.gcalId(uid)`, so
       two devices pushing the same event make ONE copy (a 409 links it).
     · Changes come down incrementally (Google's syncToken; a 410 starts a
       full read again). A linked event merges field by field against its
       `ext.g.base` (KOS.ext.merge3): title, when, the repeat, location,
       description, alerts. Every write a pull makes runs inside
       KOS.ext.inbound, which sets the base to what was written, so it is
       never pushed back.
     · What this calendar can hold: one day (all-day or timed), and the
       five repeats it knows (daily, weekly, fortnightly, monthly, yearly,
       with an end date or a count, read as an end date). A showing Google
       cancelled or moved is kept on the one record as a date it skips
       (`ext.g.skip`); the moved showing, and every event the calendar
       can't hold (another rule, several days), is READ-ONLY: this
       device's copy of its showings for the next six months, drawn as
       derived chips (kind "google"), never stored as events (43, 44).
     · Alerts map to Google's popup reminders; none is Google's default.
     · An event deleted here is deleted there through the queue
       (`state.ext.deletes`); one Google deletes is deleted here.
     · Events that ended over 30 days ago are neither imported nor sent.

   ONE-WAY to "KurenaiOS", a secondary calendar the app makes for itself
   (scope calendar.app.created): what the Calendar DERIVES — assessments,
   assignment due dates, start-by dates, class milestones from the plan,
   bills, goal deadlines — for the next 120 days. Each is named by a hash
   of its key, rewritten when it changes and removed when it goes. Edits
   made there are overwritten. Bills carry no amount.                     */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var API = "https://www.googleapis.com/calendar/v3";
  var FIELDS = ["title", "when", "rule", "location", "description", "alerts"];
  var PAST = 30, AHEAD = 180, EX_PAST = 7, EX_AHEAD = 120;
  var X = function () { return KOS.ext; };

  /* ---------------- dates ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hmOf(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function today() { return KOS.srs.todayISO(); }
  function addDays(iso, n) { return KOS.srs.addDays(iso, n); }
  function addMonths(iso, n) {
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, 1);
    d.setMonth(d.getMonth() + n);
    var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(+p[2], last));
    return isoOf(d);
  }
  function addMins(hm, m) {
    var p = String(hm).split(":"), t = Math.min(+p[0] * 60 + +p[1] + m, 23 * 60 + 59);
    return pad(Math.floor(t / 60)) + ":" + pad(t % 60);
  }
  function tz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"; } catch (e) { return "UTC"; } }
  function compact(iso) { return iso.replace(/-/g, ""); }
  function fromCompact(s) { return s.slice(0, 4) + "-" + s.slice(4, 6) + "-" + s.slice(6, 8); }
  /* an RFC 5545 date or UTC date-time → the local calendar date */
  function icsDate(v) {
    if (/^\d{8}T\d{6}Z$/.test(v)) {
      return isoOf(new Date(Date.UTC(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8), +v.slice(9, 11), +v.slice(11, 13), +v.slice(13, 15))));
    }
    return /^\d{8}/.test(v) ? fromCompact(v) : null;
  }

  /* ---------------- the mapping (pure) ---------------- */
  var BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  function dowOf(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); }
  function endOf(ev) { return ev.endTime || addMins(ev.time, ev.durationMins || 60); }
  /* a local event → the mapped fields */
  function fromLocal(ev) {
    return {
      title: ev.title || "",
      when: ev.allDay || !ev.time ? { date: ev.date, allDay: true } : { date: ev.date, allDay: false, time: ev.time, end: endOf(ev) },
      rule: ev.recur && ev.recur !== "none" ? { recur: ev.recur, until: ev.recurUntil || null } : null,
      location: ev.location || "",
      description: ev.description || "",
      alerts: (ev.alerts || []).map(Number).sort(function (a, b) { return a - b; })
    };
  }
  /* an RRULE this calendar has a word for → {recur, until}, else null */
  function parseRule(rr, date) {
    var parts = {};
    rr.split(";").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) parts[kv.slice(0, i).toUpperCase()] = kv.slice(i + 1).toUpperCase(); });
    var known = { FREQ: 1, INTERVAL: 1, UNTIL: 1, COUNT: 1, BYDAY: 1, BYMONTHDAY: 1, BYMONTH: 1, WKST: 1 };
    if (Object.keys(parts).some(function (k) { return !known[k]; })) return null;
    var iv = parts.INTERVAL ? +parts.INTERVAL : 1, day = +date.slice(8, 10), mon = +date.slice(5, 7);
    var dayOk = !parts.BYDAY || parts.BYDAY === BYDAY[dowOf(date)];
    var mdOk = !parts.BYMONTHDAY || +parts.BYMONTHDAY === day;
    var recur = null;
    if (parts.FREQ === "DAILY" && iv === 1 && !parts.BYDAY && !parts.BYMONTHDAY && !parts.BYMONTH) recur = "daily";
    else if (parts.FREQ === "WEEKLY" && (iv === 1 || iv === 2) && dayOk && !parts.BYMONTHDAY && !parts.BYMONTH) recur = iv === 1 ? "weekly" : "fortnightly";
    else if (parts.FREQ === "MONTHLY" && iv === 1 && !parts.BYDAY && mdOk && !parts.BYMONTH) recur = "monthly";
    else if (parts.FREQ === "YEARLY" && iv === 1 && !parts.BYDAY && mdOk && (!parts.BYMONTH || +parts.BYMONTH === mon)) recur = "yearly";
    if (!recur) return null;
    var until = null;
    if (parts.UNTIL) until = icsDate(parts.UNTIL);
    else if (parts.COUNT) {
      var n = Math.max(1, +parts.COUNT || 1) - 1;
      until = recur === "daily" ? addDays(date, n) : recur === "weekly" ? addDays(date, 7 * n) : recur === "fortnightly" ? addDays(date, 14 * n)
        : recur === "monthly" ? addMonths(date, n) : addMonths(date, 12 * n);
    }
    return { recur: recur, until: until };
  }
  function exdates(line) {
    var v = line.split(":").slice(1).join(":");
    return v.split(",").map(function (x) { return icsDate(x.trim()); }).filter(Boolean);
  }
  function alertsOf(rem) {
    if (!rem || rem.useDefault || !Array.isArray(rem.overrides)) return [];
    var out = [];
    rem.overrides.forEach(function (o) { var m = +o.minutes; if (m >= 0 && out.indexOf(m) === -1) out.push(m); });
    return out.sort(function (a, b) { return a - b; }).slice(0, 4);
  }
  /* a Google event → {f, skip, rx}, or null when this calendar can't hold it */
  function fromRemote(g) {
    if (!g || !g.start) return null;
    var when;
    if (g.start.date) {
      var e = g.end && g.end.date;
      if (e && e !== addDays(g.start.date, 1)) return null;          // several days
      when = { date: g.start.date, allDay: true };
    } else {
      var s = new Date(g.start.dateTime), en = new Date(g.end && g.end.dateTime || g.start.dateTime);
      if (isNaN(s.getTime()) || isNaN(en.getTime())) return null;
      var d = isoOf(s), t = hmOf(s), ed = isoOf(en), et = hmOf(en);
      if (ed !== d && !(ed === addDays(d, 1) && et === "00:00")) return null;   // past midnight
      if (ed !== d) et = "23:59";
      if (et <= t) et = addMins(t, 60);
      when = { date: d, allDay: false, time: t, end: et };
    }
    var rule = null, skip = [], rx = [];
    if (Array.isArray(g.recurrence) && g.recurrence.length) {
      var rr = null, other = false;
      g.recurrence.forEach(function (line) {
        if (/^RRULE:/i.test(line)) { if (rr) other = true; else rr = line.slice(6); }
        else if (/^EXDATE/i.test(line)) { rx.push(line); skip = skip.concat(exdates(line)); }
        else other = true;                                             // RDATE and the rest
      });
      if (!rr || other) return null;
      rule = parseRule(rr, when.date);
      if (!rule) return null;
    }
    return {
      f: { title: g.summary || "", when: when, rule: rule, location: g.location || "", description: g.description || "", alerts: alertsOf(g.reminders) },
      skip: skip, rx: rx
    };
  }
  function ruleLine(rule, when) {
    var freq = { daily: "FREQ=DAILY", weekly: "FREQ=WEEKLY", fortnightly: "FREQ=WEEKLY;INTERVAL=2", monthly: "FREQ=MONTHLY", yearly: "FREQ=YEARLY" }[rule.recur];
    var s = "RRULE:" + freq;
    if (rule.until) {
      if (when.allDay) s += ";UNTIL=" + compact(rule.until);
      else {
        var p = rule.until.split("-"), u = new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59);
        s += ";UNTIL=" + u.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      }
    }
    return s;
  }
  /* mapped fields → the parts of a Google event body they set */
  function toBody(f, fields, extra) {
    var b = {};
    fields.forEach(function (k) {
      if (k === "title") b.summary = f.title;
      else if (k === "location") b.location = f.location;
      else if (k === "description") b.description = f.description;
      else if (k === "alerts") b.reminders = f.alerts.length
        ? { useDefault: false, overrides: f.alerts.slice(0, 5).map(function (m) { return { method: "popup", minutes: Math.min(m, 40320) }; }) }
        : { useDefault: true };
      else if (k === "when" || k === "rule") {
        var w = f.when;
        if (w.allDay) { b.start = { date: w.date, dateTime: null }; b.end = { date: addDays(w.date, 1), dateTime: null }; }
        else { b.start = { dateTime: w.date + "T" + w.time + ":00", timeZone: tz(), date: null }; b.end = { dateTime: w.date + "T" + w.end + ":00", timeZone: tz(), date: null }; }
        b.recurrence = f.rule ? [ruleLine(f.rule, w)].concat((extra && extra.rx) || []) : [];
      }
    });
    return b;
  }
  /* an insert takes no nulls (a PATCH needs them, to clear the other kind of start) */
  function noNulls(b) {
    ["start", "end"].forEach(function (k) {
      if (!b[k]) return;
      Object.keys(b[k]).forEach(function (f) { if (b[k][f] === null) delete b[k][f]; });
    });
    if (Array.isArray(b.recurrence) && !b.recurrence.length) delete b.recurrence;
    return b;
  }
  /* mapped fields → a Calendar patch */
  function toPatch(f, fields) {
    var p = {};
    fields.forEach(function (k) {
      if (k === "title") p.title = f.title;
      else if (k === "location") p.location = f.location;
      else if (k === "description") p.description = f.description;
      else if (k === "alerts") p.alerts = f.alerts.slice();
      else if (k === "when") { p.date = f.when.date; p.allDay = !!f.when.allDay; p.time = f.when.allDay ? null : f.when.time; p.endTime = f.when.allDay ? null : f.when.end; }
      else if (k === "rule") { p.recur = f.rule ? f.rule.recur : "none"; p.recurUntil = f.rule ? f.rule.until : null; }
    });
    return p;
  }

  /* ---------------- the read-only copy (this device) ---------------- */
  var ro = { byMaster: {}, at: 0 };
  var roLoaded = false;
  function loadRo() {
    if (roLoaded || !KOS.mediadb) return Promise.resolve(ro);
    return X().kv(X().key("google.ro")).then(function (v) {
      roLoaded = true;
      if (v && v.byMaster) ro = v;
      return ro;
    });
  }
  function saveRo() { return X().setKv(X().key("google.ro"), ro); }
  function roOn(dateISO) {
    var out = [];
    Object.keys(ro.byMaster).forEach(function (k) {
      (ro.byMaster[k] || []).forEach(function (x) { if (x.date === dateISO) out.push(x); });
    });
    return out.sort(function (a, b) { return (a.time || "").localeCompare(b.time || ""); });
  }
  function hasRo() { return Object.keys(ro.byMaster).length > 0; }
  /* one Google showing → read-only entries, one a day it covers */
  function roEntries(g, master) {
    if (!g || g.status === "cancelled" || !g.start) return [];
    var base = { id: g.id, master: master || g.id, title: g.summary || "", location: g.location || "", link: g.htmlLink || null };
    var out = [];
    if (g.start.date) {
      var end = g.end && g.end.date ? g.end.date : addDays(g.start.date, 1), d = g.start.date, n = 0;
      while (d < end && n++ < 60) { out.push(Object.assign({ date: d }, base)); d = addDays(d, 1); }
    } else {
      var s = new Date(g.start.dateTime), e = new Date(g.end && g.end.dateTime || g.start.dateTime);
      var day = isoOf(s), last = isoOf(e), k = 0;
      while (day <= last && k++ < 60) {
        var first = day === isoOf(s), fin = day === last;
        if (!(fin && !first && hmOf(e) === "00:00")) out.push(Object.assign({ date: day, time: first ? hmOf(s) : null, endTime: fin ? hmOf(e) : null }, base));
        day = addDays(day, 1);
      }
    }
    return out;
  }

  /* ---------------- the two-way cycle ---------------- */
  function cal() { return KOS.store.state.calendar ? KOS.store.state.calendar.events : []; }
  function own() { return cal().filter(function (e) { return e && !e.migratedTo; }); }
  function linkOf(ev) { return ev.ext && ev.ext.g && ev.ext.g.id ? ev.ext.g : null; }
  function isOld(ev) {
    var cut = addDays(today(), -PAST);
    if (!ev.recur || ev.recur === "none") return ev.date < cut;
    return !!(ev.recurUntil && ev.recurUntil < cut);
  }
  function fIsOld(f) {
    var cut = addDays(today(), -PAST);
    return f.rule ? !!(f.rule.until && f.rule.until < cut) : f.when.date < cut;
  }
  function setLink(ev, g) {
    var ext = Object.assign({}, ev.ext || {});
    ext.g = Object.assign({}, ext.g || {}, g);
    X().inbound(function () { KOS.calendar.updateEvent(ev.id, { ext: ext }); });
  }
  function req(tok, method, path, body, headers) { return X().call(tok, method, API + path, body, headers); }

  function ensureUids() {
    var n = 0;
    own().forEach(function (ev) { if (!X().uidOk(ev.uid)) { ev.uid = X().legacyUid("ev", ev); n++; } });
    if (n) KOS.store.save();
  }
  /* two records linked to one Google event (a pull here before the cloud
     brought the other device's copy): keep the first made */
  function dedupe() {
    var seen = {}, drop = [];
    own().slice().sort(function (a, b) { return (a.created || 0) - (b.created || 0); }).forEach(function (ev) {
      var l = linkOf(ev);
      if (!l) return;
      if (seen[l.id]) drop.push(ev.id); else seen[l.id] = true;
    });
    X().inbound(function () { drop.forEach(function (id) { KOS.calendar.deleteEvent(id); }); });
    return drop.length;
  }
  function doDeletes(tok, counts) {
    var q = X().S().deletes;
    var keys = Object.keys(q).filter(function (k) { return q[k].p === "google" && q[k].kind === "gcal"; });
    return keys.reduce(function (chain, k) {
      return chain.then(function () {
        return req(tok, "DELETE", "/calendars/primary/events/" + encodeURIComponent(q[k].id)).then(function (r) {
          if (r.ok || r.status === 404 || r.status === 410) { delete q[k]; counts.deleted++; }
        });
      });
    }, Promise.resolve()).then(function () { if (keys.length) KOS.store.save(); });
  }

  function listAll(tok, syncToken) {
    var items = [];
    function page(pt) {
      var q = "?maxResults=250&showDeleted=true" + (syncToken ? "&syncToken=" + encodeURIComponent(syncToken) : "") + (pt ? "&pageToken=" + encodeURIComponent(pt) : "");
      return req(tok, "GET", "/calendars/primary/events" + q).then(function (r) {
        if (r.status === 410) return { gone: true };
        if (!r.ok) throw new Error("Google Calendar answered " + r.status + ".");
        items = items.concat(r.json.items || []);
        if (r.json.nextPageToken) return page(r.json.nextPageToken);
        return { items: items, next: r.json.nextSyncToken || null };
      });
    }
    return page(null);
  }

  function pull(tok, counts) {
    var K = X().key("google.sync");
    return X().kv(K).then(function (st) {
      var t = st && st.primary;
      return listAll(tok, t).then(function (r) {
        if (r.gone) return X().setKv(K, {}).then(function () { return listAll(tok, null); });
        return r;
      });
    }).then(function (r) {
      var byGid = {}, byUid = {};
      own().forEach(function (ev) { var l = linkOf(ev); if (l) byGid[l.id] = ev; if (ev.uid) byUid[ev.uid] = ev; });
      var instances = [], refetch = {};
      (r.items || []).forEach(function (g) {
        if (g.recurringEventId) { instances.push(g); return; }
        var local = byGid[g.id];
        if (g.status === "cancelled") {
          if (local) { X().inbound(function () { KOS.calendar.deleteEvent(local.id); }); counts.pulled++; }
          if (ro.byMaster[g.id]) { delete ro.byMaster[g.id]; counts.ro++; }
          return;
        }
        var conv = fromRemote(g);
        if (!conv) {
          /* Google holds it in a shape this calendar can't: read-only */
          if (local) X().inbound(function () { KOS.calendar.deleteEvent(local.id); });
          refetch[g.id] = g;
          return;
        }
        if (ro.byMaster[g.id]) { delete ro.byMaster[g.id]; counts.ro++; }
        var priv = (g.extendedProperties && g.extendedProperties.private) || {};
        if (!local && priv.kosUid) {
          local = byUid[priv.kosUid];
          if (!local) return;             // another device's, still on its way through the cloud
        }
        var link = { id: g.id, etag: g.etag, skip: conv.skip, rx: conv.rx, link: g.htmlLink || null };
        if (!local) {
          if (fIsOld(conv.f)) return;
          X().inbound(function () {
            var rec = KOS.calendar.addEvent(Object.assign(toPatch(conv.f, FIELDS), { type: "personal", ext: { g: Object.assign({ base: conv.f }, link) } }));
            byGid[g.id] = rec;
          });
          counts.pulled++;
          return;
        }
        var g0 = linkOf(local) || {}, B = g0.base || null;
        var m = X().merge3(fromLocal(local), conv.f, B, FIELDS, !B);
        var base = {};
        FIELDS.forEach(function (f) { base[f] = m.push.indexOf(f) !== -1 ? (B ? B[f] : conv.f[f]) : m.merged[f]; });
        X().inbound(function () {
          var ext = Object.assign({}, local.ext || {}, { g: Object.assign({}, g0, link, { base: base }) });
          KOS.calendar.updateEvent(local.id, Object.assign(toPatch(m.merged, m.pull), { ext: ext }));
        });
        if (m.pull.length) counts.pulled++;
      });
      /* a showing cancelled or moved: skipped on the one record; a moved
         one drawn read-only; a rule's showings when its master is read-only */
      var skips = {};
      instances.forEach(function (inst) {
        var masterId = inst.recurringEventId, ost = inst.originalStartTime || {};
        var orig = ost.date || (ost.dateTime ? isoOf(new Date(ost.dateTime)) : null);
        if (byGid[masterId]) {
          if (orig) (skips[masterId] = skips[masterId] || []).push(orig);
          delete ro.byMaster["i:" + inst.id];
          if (inst.status !== "cancelled") ro.byMaster["i:" + inst.id] = roEntries(inst, masterId);
          counts.ro++;
        } else refetch[masterId] = refetch[masterId] || { id: masterId };
      });
      Object.keys(skips).forEach(function (id) {
        var ev = byGid[id], l = linkOf(ev), cut = addDays(today(), -60);
        var all = (l.skip || []).concat(skips[id]).filter(function (d, i, a) { return d >= cut && a.indexOf(d) === i; }).sort().slice(-200);
        setLink(ev, { skip: all });
      });
      /* the read-only window moves on: refresh every master every 3 days */
      if (Date.now() - (ro.at || 0) > 3 * 86400e3) {
        Object.keys(ro.byMaster).forEach(function (k) { if (k.indexOf("i:") !== 0) refetch[k] = refetch[k] || { id: k }; });
        ro.at = Date.now();
      }
      return fetchRo(tok, refetch, counts).then(function () {
        return X().kv(K).then(function (st) { return X().setKv(K, Object.assign({}, st || {}, { primary: r.next })); });
      });
    });
  }
  function fetchRo(tok, masters, counts) {
    var ids = Object.keys(masters);
    var from = addDays(today(), -PAST), to = addDays(today(), AHEAD);
    return ids.reduce(function (chain, id) {
      return chain.then(function () {
        var g = masters[id];
        if (g.start && !(g.recurrence && g.recurrence.length)) { ro.byMaster[id] = roEntries(g); counts.ro++; return null; }
        var q = "?maxResults=250&timeMin=" + encodeURIComponent(from + "T00:00:00Z") + "&timeMax=" + encodeURIComponent(to + "T23:59:59Z");
        return req(tok, "GET", "/calendars/primary/events/" + encodeURIComponent(id) + "/instances" + q).then(function (r) {
          if (r.status === 404 || r.status === 410) { delete ro.byMaster[id]; return; }
          if (!r.ok) return;
          var list = [];
          (r.json.items || []).forEach(function (inst) { list = list.concat(roEntries(inst, id)); });
          ro.byMaster[id] = list;
          counts.ro++;
        });
      });
    }, Promise.resolve()).then(saveRo);
  }

  function push(tok, counts) {
    return own().reduce(function (chain, ev) {
      return chain.then(function () {
        var l = linkOf(ev), L = fromLocal(ev);
        if (l) {
          var diff = FIELDS.filter(function (f) { return !X().same(L[f], l.base ? l.base[f] : null); });
          if (!diff.length) return null;
          if (diff.indexOf("when") !== -1 && diff.indexOf("rule") === -1 && L.rule) diff.push("rule");     // a moved rule restates its UNTIL
          return req(tok, "PATCH", "/calendars/primary/events/" + encodeURIComponent(l.id), toBody(L, diff, { rx: l.rx }), l.etag ? { "If-Match": l.etag } : null).then(function (r) {
            if (r.ok) { setLink(ev, { etag: r.json.etag, base: L }); counts.pushed++; }
            else if (r.status === 404 || r.status === 410) { X().inbound(function () { KOS.calendar.deleteEvent(ev.id); }); }
            /* 412: changed there since the pull; the next pull merges it */
          });
        }
        if (isOld(ev)) return null;
        var id = X().gcalId(ev.uid);
        var body = Object.assign(noNulls(toBody(L, FIELDS)), { id: id, extendedProperties: { private: { kosUid: ev.uid, kosType: ev.type || "personal" } } });
        return req(tok, "POST", "/calendars/primary/events", body).then(function (r) {
          if (r.ok) { setLink(ev, { id: r.json.id, etag: r.json.etag, base: L, link: r.json.htmlLink || null }); counts.created++; return null; }
          if (r.status !== 409) return null;
          /* already there: another device made it, or an earlier try */
          return req(tok, "GET", "/calendars/primary/events/" + id).then(function (g) {
            if (!g.ok) return;
            if (g.json.status === "cancelled") { X().inbound(function () { KOS.calendar.deleteEvent(ev.id); }); return; }
            var conv = fromRemote(g.json);
            setLink(ev, { id: id, etag: g.json.etag, base: conv ? conv.f : null, link: g.json.htmlLink || null });
          });
        });
      });
    }, Promise.resolve());
  }

  /* ---------------- the one-way export (invariant 159) ---------------- */
  function exportItems() {
    var on = X().S().google.export, out = {};
    var from = addDays(today(), -EX_PAST), to = addDays(today(), EX_AHEAD);
    function add(key, title, date, time, end, what) {
      var b = { summary: title, description: "From KurenaiOS · " + what + ". Changes made here are replaced.", transparency: "transparent",
        reminders: { useDefault: false, overrides: [] }, extendedProperties: { private: { kosKey: key } } };
      if (time) { b.start = { dateTime: date + "T" + time + ":00", timeZone: tz() }; b.end = { dateTime: date + "T" + (end && end > time ? end : addMins(time, 60)) + ":00", timeZone: tz() }; }
      else { b.start = { date: date }; b.end = { date: addDays(date, 1) }; }
      out[X().gcalId(X().hashHex("export|" + key))] = { key: key, body: b, h: X().hashHex(JSON.stringify(b)) };
    }
    if (on.exams && KOS.exams && KOS.exams.eventViews) KOS.exams.eventViews().forEach(function (a) {
      if (a.date >= from && a.date <= to) add(a.id, a.title, a.date, a.time, a.endTime, a.type === "deadline" ? "a deadline in Exams" : "an assessment in Exams");
    });
    if (on.pacing && KOS.calendar.countdowns) KOS.calendar.countdowns().forEach(function (c) {
      if (c.kind === "pacing" && c.date >= from && c.date <= to) add("pc:" + c.entry.id, c.title + " (in class)", c.date, null, null, "a class milestone from the plan");
    });
    for (var d = from, n = 0; d <= to && n < 400; d = addDays(d, 1), n++) {
      if (on.assignments && KOS.assignments && KOS.assignments.forDate) KOS.assignments.forDate(d).forEach(function (a) {
        add("as:" + a.id, "Due · " + a.title, d, null, null, "an assignment");
      });
      KOS.calendar.derivedOn(d, { all: true }).forEach(function (x) {
        if (x.kind === "startby" && on.startby) add("sb:" + x.assessment.id, x.title, d, null, null, "the day to start revising");
        else if (x.kind === "money" && on.money && !x.income && x.rule.kind !== "transfer") add("mo:" + x.rule.id + ":" + d, (x.trial ? x.rule.name + " trial ends" : "Bill · " + x.rule.name), d, null, null, "Money");
        else if (x.kind === "goal" && on.goals) add("go:" + x.goal.id + ":" + d, x.title, d, null, null, "Goals");
      });
    }
    return out;
  }
  function ensureCal(tok) {
    var g = X().S().google;
    var check = g.exportCal ? req(tok, "GET", "/calendars/" + encodeURIComponent(g.exportCal)) : Promise.resolve({ status: 404 });
    return check.then(function (r) {
      if (r.ok) return g.exportCal;
      if (r.status !== 404 && r.status !== 410) throw new Error("Google Calendar answered " + r.status + " for the KurenaiOS calendar.");
      return req(tok, "POST", "/calendars", { summary: "KurenaiOS", description: "Deadlines, plan milestones and bills from KurenaiOS. It is rewritten from the app; changes made here are replaced.", timeZone: tz() }).then(function (c) {
        if (!c.ok) throw new Error("The KurenaiOS calendar could not be made (" + c.status + ").");
        g.exportCal = c.json.id;
        KOS.store.save();
        return g.exportCal;
      });
    });
  }
  function exportCycle(tok, counts) {
    var K = X().key("google.known");
    return ensureCal(tok).then(function (calId) {
      return X().kv(K).then(function (known) {
        if (!known || known.cal !== calId) known = { cal: calId, ids: {} };
        var want = exportItems(), base = "/calendars/" + encodeURIComponent(calId) + "/events/";
        var put = Object.keys(want).filter(function (id) { return known.ids[id] !== want[id].h; });
        var gone = Object.keys(known.ids).filter(function (id) { return !want[id]; });
        return put.reduce(function (chain, id) {
          return chain.then(function () {
            var body = Object.assign({ status: "confirmed" }, want[id].body);
            return req(tok, "PUT", base + id, body).then(function (r) {
              if (r.ok) { known.ids[id] = want[id].h; counts.exported++; return null; }
              if (r.status !== 404) return null;
              return req(tok, "POST", base.replace(/\/events\/$/, "/events"), Object.assign({ id: id }, body)).then(function (c) {
                if (c.ok) { known.ids[id] = want[id].h; counts.exported++; }
              });
            });
          });
        }, Promise.resolve()).then(function () {
          return gone.reduce(function (chain, id) {
            return chain.then(function () {
              return req(tok, "DELETE", base + id).then(function (r) {
                if (r.ok || r.status === 404 || r.status === 410) { delete known.ids[id]; counts.unexported++; }
              });
            });
          }, Promise.resolve());
        }).then(function () { return X().setKv(K, known); });
      });
    });
  }

  function cycle(tok) {
    var g = X().S().google, counts = { pulled: 0, pushed: 0, created: 0, deleted: 0, ro: 0, exported: 0, unexported: 0 };
    var two = g.cal ? Promise.resolve().then(loadRo).then(ensureUids).then(dedupe)
      .then(function () { return doDeletes(tok, counts); })
      .then(function () { return pull(tok, counts); })
      .then(function () { return push(tok, counts); }) : Promise.resolve();
    return two.then(function () { return g.export.on ? exportCycle(tok, counts) : null; }).then(function () { return counts; });
  }

  KOS.extGcal = {
    fromLocal: fromLocal, fromRemote: fromRemote, parseRule: parseRule, toBody: toBody, toPatch: toPatch, ruleLine: ruleLine,
    roOn: roOn, hasRo: hasRo, loadRo: loadRo, exportItems: exportItems, cycle: cycle, FIELDS: FIELDS,
    _ro: function () { return ro; }
  };
  if (KOS.ext) KOS.ext.register({ name: "calendar", provider: "google",
    on: function () { var g = KOS.ext.S().google; return g.on && (g.cal || g.export.on); }, cycle: cycle });
})();
