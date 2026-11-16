/* Kurenai OS — core/exttasks.js · KOS.extTasks
   Reminders ↔ Todoist and Google Tasks (roadmap 5.15,
   docs/integrations-plan.md §5, invariants 158 and 160).

   A Reminders LIST links to ONE Todoist project or ONE Google Tasks list
   (`list.ext = {p, id, name}`), and "Reminders with no list" may link too
   (`state.ext.noList`). Never both providers for one list, so a change can
   never bounce between them. A linked list's reminders go up; the remote
   list's tasks come down.

     Todoist — title, notes (description), due date and time, the repeat
       (the four this app has; any other Todoist rule is kept as Todoist
       wrote it and sent back as it was), priority (0–3 ↔ 1–4), tags
       (labels), done, and sub-tasks (child tasks). Read through the Sync
       API's incremental token; written as one batch of commands, an add's
       command id derived from the reminder's uid so a second device's
       retry is the same command.
     Google Tasks — title, notes, due DATE, done and sub-tasks only; the
       time, repeat, priority and tags stay in this app (Google has no
       field for them). Read by `updatedMin` (Google's own timestamps).

   Every pulled write runs inside KOS.ext.inbound and sets the base, so it
   is never pushed back. A completion pulled is one `todo` session a
   cycle that pays nothing (invariant 160). Completed remote tasks are not
   imported; a linked reminder deleted on either side is deleted on both.

   RC6 (quality W1): the links travel with the lease (KOS.ext.runProvider),
   and under that the import knows its own (a queued deletion, a pending
   add, an unlinked twin, two reminders on one task folded); a full read
   only adds; a repeat Todoist owns is closed there, not re-dated; the list
   is three-way like every field; a reminder moved out of its service's
   lists takes its remote copy with it; "not found" unlinks and never
   deletes; a refused command is named and not sent again unchanged. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var X = function () { return KOS.ext; };
  var TD = "https://api.todoist.com/api/v1";
  var GT = "https://tasks.googleapis.com/tasks/v1";
  var FIELDS = { todoist: ["title", "notes", "when", "priority", "tags", "done", "subs"], gtasks: ["title", "notes", "due", "done", "subs"] };
  var PROV = { todoist: "todoist", gtasks: "google" };      // a task service → whose sign-in
  var LABEL = { todoist: "Todoist", gtasks: "Google Tasks" };

  function R() { return KOS.store.state.reminders || { items: [], lists: [] }; }
  function items() { return R().items || []; }
  function lists() { return R().lists || []; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------------- links ---------------- */
  function linkOfList(listId) {
    if (listId == null) { var nl = X().S().noList; return nl ? { p: nl.p, id: nl.id, name: nl.name || "" } : null; }
    var l = lists().filter(function (x) { return x.id === listId; })[0];
    return l && l.ext && l.ext.p && l.ext.id ? l.ext : null;
  }
  function remoteListsLinked(p) {
    var out = {};
    lists().forEach(function (l) { if (l.ext && l.ext.p === p && l.ext.id) out[l.ext.id] = l.id; });
    var nl = X().S().noList;
    if (nl && nl.p === p) out[nl.id] = null;
    return out;
  }
  /* link a list (null: the reminders with no list) to a remote list; the
     other service's link on it, if any, is replaced */
  function link(listId, p, remote) {
    var e = X().S();
    var val = remote ? { p: p, id: String(remote.id), name: remote.name || "" } : null;
    /* DI-17: the list leaves a service (unlinked, or linked to the other
       one). Its reminders are unlinked: kept here, kept there, and never
       left half-linked to a project their list no longer names. */
    var was = linkOfList(listId);
    if (was && (!val || val.p !== was.p)) unlinkList(listId, was.p);
    if (listId == null) e.noList = val;
    else {
      var l = lists().filter(function (x) { return x.id === listId; })[0];
      if (!l) return false;
      if (val) l.ext = val; else delete l.ext;
    }
    KOS.store.save();
    X().noteLocal("reminders");
    X().changed();
    return true;
  }
  function inScope(p, item) { var l = linkOfList(item.listId); return !!(l && l.p === p); }
  function sameList(a, b) { return String(a == null ? "" : a) === String(b == null ? "" : b); }
  /* what is left of a link once it is given up: only how many times this
     reminder has been unlinked. An add is named by the reminder's uid so
     two devices sending it make ONE task; sent again after an unlink it
     must be a new command (Todoist answers a command it has seen with what
     it did the first time, which was the task that is gone). */
  function unlinked(ext) { return { gen: ((ext && +ext.gen) || 0) + 1 }; }
  function genOf(item) { var g = item.ext && +item.ext.gen; return g ? "|g" + g : ""; }
  function clearExt(item) { X().inbound(function () { KOS.reminders.update(item.id, { ext: unlinked(item.ext) }); }); }
  /* every reminder of one list linked to service p loses its link (the
     records stay, and nothing is deleted there) */
  function unlinkList(listId, p) {
    var n = 0;
    items().slice().forEach(function (it) {
      if (!sameList(it.listId, listId) || !it.ext || (p && it.ext.p !== p)) return;
      clearExt(it); n++;
    });
    return n;
  }
  /* DI-17: ONE reminder moved to another list by hand. A list is a
     project, so leaving the list is leaving the project: inside one
     service the push moves the task; to a list with no link, or the other
     service's, the old copy is deleted there (the reminder lives on here,
     and the other service makes its own) — left in place it came back as a
     second reminder the next time it changed. Returns the link to keep. */
  function onMove(item, toListId) {
    var x = item.ext, lk = linkOfList(toListId);
    if (!x || !x.p) return x || null;
    if (lk && lk.p === x.p) return x;
    if (x.id) X().queueDelete(x.p, "task", { id: x.id, list: x.list || null });
    return unlinked(x);
  }
  /* a different account was connected (KOS.ext.forget): every link to
     service p goes, on reminders and on lists */
  function forget(p) {
    items().slice().forEach(function (it) { if (it.ext && it.ext.p === p) clearExt(it); });
    lists().forEach(function (l) { if (l.ext && l.ext.p === p) delete l.ext; });
    var e = X().S();
    if (e.noList && e.noList.p === p) e.noList = null;
    KOS.store.save();
  }

  /* ---------------- the mapping (pure) ---------------- */
  var RECUR_WORD = { daily: "day", weekly: "week", monthly: "month", yearly: "year" };
  function subsOf(item) { return (item.subs || []).map(function (s) { return { t: String(s.text || ""), d: !!s.done }; }); }
  function fromLocal(p, item) {
    var f = { title: item.title || "", notes: item.notes || "", done: !!item.done, subs: subsOf(item) };
    if (p === "todoist") {
      f.when = { due: item.due || null, time: item.due ? item.dueTime || null : null, recur: item.due ? item.recur || (item.ext && item.ext.rs) || null : null };
      f.priority = item.priority || 0;
      f.tags = (item.tags || []).slice().sort();
    } else f.due = item.due || null;
    return f;
  }
  /* a Todoist due → {due, time, recur}; a recurrence this app has no word
     for is kept whole as "x:<string>" */
  function tdWhen(due) {
    if (!due || !due.date) return { due: null, time: null, recur: null };
    var d = String(due.date), date, time = null;
    if (/Z$/.test(d)) { var t = new Date(d); date = t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate()); time = pad(t.getHours()) + ":" + pad(t.getMinutes()); }
    else { date = d.slice(0, 10); if (d.length > 10) time = d.slice(11, 16); }
    var recur = null;
    if (due.is_recurring) {
      var s = String(due.string || "").toLowerCase().trim();
      var m = /^(?:every!?\s+(?:1\s+)?(day|week|month|year)|(daily|weekly|monthly|yearly))(?:\s+at\s+[0-9:apm. ]+)?$/.exec(s);
      recur = m ? (m[1] ? { day: "daily", week: "weekly", month: "monthly", year: "yearly" }[m[1]] : m[2]) : "x:" + (due.string || "");
    }
    return { due: date, time: time, recur: recur };
  }
  function tdDue(w) {
    if (!w.due) return null;
    var o = { date: w.due + (w.time ? "T" + w.time + ":00" : ""), lang: "en" };
    if (w.recur) {
      o.string = w.recur.indexOf("x:") === 0 ? w.recur.slice(2) : "every " + RECUR_WORD[w.recur] + (w.time ? " at " + w.time : "");
      o.is_recurring = true;
    }
    return o;
  }
  function childrenOf(mirror, id, orderKey) {
    return Object.keys(mirror).map(function (k) { return mirror[k]; })
      .filter(function (c) { return c.parent_id === id || c.parent === id; })
      .filter(function (c) { return !c.is_deleted && !c.deleted; })
      .sort(function (a, b) { return String(a[orderKey] || "").localeCompare(String(b[orderKey] || ""), undefined, { numeric: true }); });
  }
  function fromTodoist(it, mirror) {
    return {
      title: it.content || "", notes: it.description || "", when: tdWhen(it.due),
      priority: Math.max(0, Math.min(3, (it.priority || 1) - 1)), tags: (it.labels || []).slice().sort(),
      done: !!it.checked && !(it.due && it.due.is_recurring),
      subs: childrenOf(mirror, it.id, "child_order").map(function (c) { return { t: c.content || "", d: !!c.checked }; })
    };
  }
  function fromGtask(t, mirror) {
    return {
      title: t.title || "", notes: t.notes || "", due: t.due ? String(t.due).slice(0, 10) : null, done: t.status === "completed",
      subs: childrenOf(mirror, t.id, "position").map(function (c) { return { t: c.title || "", d: c.status === "completed" }; })
    };
  }
  /* mapped fields → a Reminders patch */
  function toPatch(p, f, fields, item) {
    var o = {}, ext = item && item.ext ? Object.assign({}, item.ext) : null;
    fields.forEach(function (k) {
      if (k === "title") o.title = f.title;
      else if (k === "notes") o.notes = f.notes;
      else if (k === "priority") o.priority = f.priority;
      else if (k === "tags") o.tags = f.tags.slice();
      else if (k === "due") o.due = f.due;
      else if (k === "done") { o.done = f.done; o.completedAt = f.done ? (item && item.completedAt) || Date.now() : null; }
      else if (k === "when") {
        o.due = f.when.due; o.dueTime = f.when.time;
        var x = f.when.recur && f.when.recur.indexOf("x:") === 0;
        o.recur = x ? null : f.when.recur;
        if (ext) { if (x) ext.rs = f.when.recur; else delete ext.rs; o.ext = ext; }
      }
    });
    return o;
  }
  /* remote children → local subs, keeping each sub's own id */
  function subsFrom(children, item, nameKey, doneOf) {
    var st = R(), had = {};
    ((item && item.subs) || []).forEach(function (s) { if (s.x) had[s.x] = s; });
    return children.map(function (c) {
      var old = had[c.id];
      return { id: old ? old.id : st.nextId++, text: c[nameKey] || "", done: doneOf(c), x: c.id };
    });
  }

  /* ---------------- shared pieces ---------------- */
  function byLink(p) {
    var out = {};
    items().forEach(function (it) { if (it.ext && it.ext.p === p && it.ext.id) out[it.ext.id] = it; });
    return out;
  }
  /* DI-01, the floor under the lease: two reminders linked to ONE task
     (a device read the provider before the other device's link reached
     it) fold into one. Every device keeps the same one, the smaller uid,
     so two devices folding at once agree; the other's alerts and
     completions are kept on it. Nothing is deleted there. */
  function foldTwins(p) {
    var seen = {}, n = 0;
    items().slice().forEach(function (it) {
      if (!it.ext || it.ext.p !== p || !it.ext.id) return;
      var a = seen[it.ext.id];
      if (!a) { seen[it.ext.id] = it; return; }
      var first = String(a.uid || "") < String(it.uid || "") || (String(a.uid || "") === String(it.uid || "") && a.id < it.id);
      var keep = first ? a : it, drop = first ? it : a;
      X().inbound(function () {
        var patch = {}, cs = (keep.completions || []).concat(drop.completions || []).filter(function (x, i, arr) { return arr.indexOf(x) === i; }).sort(function (x, y) { return x - y; });
        if (!(keep.alerts || []).length && (drop.alerts || []).length) patch.alerts = drop.alerts.slice();
        if (cs.length !== (keep.completions || []).length) patch.completions = cs;
        if (Object.keys(patch).length) KOS.reminders.update(keep.id, patch);
        KOS.reminders.remove(drop.id);
      });
      seen[it.ext.id] = KOS.reminders.get(keep.id) || keep;
      n++;
    });
    return n;
  }
  /* a reminder still linked to a project NO list links any more (its list
     was unlinked before a list's unlinking cleared them): unlinked now */
  function orphans(p, linked) {
    items().slice().forEach(function (it) {
      if (!it.ext || it.ext.p !== p || !it.ext.list || linked.hasOwnProperty(it.ext.list)) return;
      var lk = linkOfList(it.listId);
      if (lk && lk.p === p) return;                  // its list moved to another project: the push moves it
      clearExt(it);
    });
  }
  /* DI-01: a reminder this app already holds, in the list this task
     belongs to, not linked yet and not finished, with the same title: the
     same thing, met from both sides (made here and pushed by another
     device whose link has not arrived; or made in both places before the
     list was linked). It is linked, never imported as a second one. */
  function unlinkedTwin(p, remote, listId) {
    return items().filter(function (it) {
      return !(it.ext && (it.ext.id || it.ext.pending)) && !it.done && sameList(it.listId, listId) &&
        it.title === remote.title && X().uidOk(it.uid);
    })[0] || null;
  }
  /* the twin's own sub-tasks take the ids of the remote ones they match */
  function adoptSubs(item, kids, nameKey) {
    var used = {};
    return (item.subs || []).map(function (sub) {
      var k = kids.filter(function (c) { return !used[c.id] && (c[nameKey] || "") === sub.text; })[0];
      if (k) used[k.id] = true;
      return Object.assign({}, sub, { x: k ? k.id : sub.x || null });
    });
  }
  function setExt(item, patch) {
    X().inbound(function () { KOS.reminders.update(item.id, { ext: Object.assign({}, item.ext || {}, patch) }); });
  }
  function rebase(f, fields, B, m) {
    var base = {};
    fields.forEach(function (k) { base[k] = m.push.indexOf(k) !== -1 ? (B ? B[k] : f[k]) : m.merged[k]; });
    return base;
  }
  function linkOf(item, p, rid, remote) {
    var o = { p: p, id: rid, list: remote.list, base: remote }, g = item.ext && +item.ext.gen;
    if (g) o.gen = g;
    return o;
  }
  /* pull one remote task into Reminders (create, merge or delete) */
  function reconcile(p, rid, remote, remoteDeleted, listId, local, counts, done, kids, nameKey, doneOf) {
    var fields = FIELDS[p];
    if (remoteDeleted) {
      if (local) { X().inbound(function () { KOS.reminders.remove(local.id); }); counts.pulled++; }
      return;
    }
    if (!local) {
      /* DI-23: deleted here, its deletion still waiting to be sent. An edit
         made there meanwhile must not bring it back for a cycle. */
      if (X().S().deletes[p + ":task:" + rid]) return;
      /* a reminder this device already SENT, whose add came back without an
         id (pending): this is it. Linked, never imported as a second one. */
      var pend = p === "todoist" ? items().filter(function (it) {
        /* by the title that was SENT (its base), or the one it has now */
        return it.ext && it.ext.p === p && it.ext.pending && !it.ext.id &&
          (((it.ext.base || {}).title === remote.title) || it.title === remote.title) &&
          String(it.listId == null ? "" : it.listId) === String(listId == null ? "" : listId);
      })[0] : null;
      if (pend) {
        X().inbound(function () {
          KOS.reminders.update(pend.id, { subs: subsFrom(kids, pend, nameKey, doneOf), ext: linkOf(pend, p, rid, remote) });
        });
        counts.pulled++;
        return;
      }
      if (remote.done) return;                       // finished there before the link: not imported
      var twin = unlinkedTwin(p, remote, listId);
      if (twin) {
        /* base = what is there: whatever differs here is this app's, and
           the push sends it */
        X().inbound(function () {
          KOS.reminders.update(twin.id, { subs: adoptSubs(twin, kids, nameKey), ext: linkOf(twin, p, rid, remote) });
        });
        counts.pulled++;
        return;
      }
      X().inbound(function () {
        var it = KOS.reminders.add(Object.assign(toPatch(p, remote, fields.filter(function (k) { return k !== "subs" && k !== "done"; }), { ext: {} }),
          { listId: listId, ext: { p: p, id: rid, list: remote.list, base: remote } }));
        if (it) KOS.reminders.update(it.id, { subs: subsFrom(kids, it, nameKey, doneOf), ext: Object.assign({}, it.ext, { rs: remote.when && remote.when.recur && remote.when.recur.indexOf("x:") === 0 ? remote.when.recur : undefined }) });
      });
      counts.pulled++;
      return;
    }
    var B = local.ext.base || null;
    var m = X().merge3(fromLocal(p, local), remote, B, fields, !B);
    if (m.pull.indexOf("done") !== -1 && remote.done && !local.done) done.push(local.title);
    /* DI-16: THE LIST IS THREE-WAY TOO. `ext.list` is the project both
       sides last agreed on. Moved there and not here: the reminder follows
       to the list that project is linked to. Moved here (or on both
       sides): this app's, and the push moves the task; the agreed project
       stays as it was until that is answered. */
    var agreed = local.ext.list || remote.list, here = linkOfList(local.listId);
    var movedHere = !!(here && here.p === p && here.id !== agreed);
    var movedThere = remote.list !== agreed && !movedHere;
    X().inbound(function () {
      var patch = toPatch(p, m.merged, m.pull.filter(function (k) { return k !== "subs"; }), local);
      if (m.pull.indexOf("subs") !== -1) patch.subs = subsFrom(kids, local, nameKey, doneOf);
      patch.ext = Object.assign({}, patch.ext || local.ext, { base: rebase(remote, fields, B, m), list: movedThere ? remote.list : agreed });
      if (movedThere) patch.listId = listId;
      KOS.reminders.update(local.id, patch);
    });
    if (m.pull.length || movedThere) counts.pulled++;
  }

  /* ---------------- Todoist ---------------- */
  function tdSync(tok, form) {
    var body = Object.keys(form).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(typeof form[k] === "string" ? form[k] : JSON.stringify(form[k])); }).join("&");
    return X().call(tok, "POST", TD + "/sync", body, { "Content-Type": "application/x-www-form-urlencoded" }).then(function (r) {
      if (!r.ok) throw new Error("Todoist answered " + r.status + ".");
      return r.json || {};
    });
  }
  /* a Todoist command's answer: null when it was done, else what was said */
  function tdErr(st) { return st === "ok" ? null : (st && typeof st === "object" ? st : { error: String(st) }); }
  function tdGone(e) { return !!e && (e.http_code === 404 || e.error_code === 22 || /not[ _]?found/i.test(String(e.error_tag || "") + " " + String(e.error || ""))); }
  function tdWhy(e) { return String((e && (e.error || e.error_tag)) || "Todoist refused it").slice(0, 140); }
  /* what a reminder would send, as one word: a refusal is remembered
     against it and not sent again until the reminder changes (DI-12) */
  function sigOf(L, lk, cn) { return X().hashHex(JSON.stringify(L) + "|" + (lk ? lk.id : "") + "|" + (cn || 0)); }
  var DAY = 24 * 3600 * 1000;

  /* DI-05, on a device that never read them: a whole read holds only what
     is open, so a sub-task this reminder has as DONE, with a task there
     that the read did not return, is taken to be there still and still
     done (it used to read as removed, and was deleted here and then on
     every other device). The sub-tasks keep this reminder's order, since
     a whole read cannot say where the missing ones stand. */
  function assumeDone(mirror, parent, item, kids) {
    var have = {};
    kids.forEach(function (c) { have[c.id] = c; });
    (item.subs || []).forEach(function (s) {
      if (!s.x || !s.done || have[s.x] || mirror[s.x]) return;
      have[s.x] = mirror[s.x] = { id: s.x, content: s.text, checked: true, parent_id: parent.id, project_id: parent.project_id, child_order: 0, assumed: true };
    });
    var out = [], used = {};
    (item.subs || []).forEach(function (s) { if (s.x && have[s.x] && !used[s.x]) { used[s.x] = true; out.push(have[s.x]); } });
    kids.forEach(function (c) { if (!used[c.id]) out.push(c); });
    return out;
  }

  function todoistCycle(tok) {
    var counts = { pulled: 0, pushed: 0, created: 0, deleted: 0 }, done = [];
    var KS = X().key("todoist.sync"), KM = X().key("todoist.mirror");
    var linked = remoteListsLinked("todoist");
    foldTwins("todoist");
    orphans("todoist", linked);
    var q = X().S().deletes;
    var delKeys = Object.keys(q).filter(function (k) { return q[k].p === "todoist"; });
    return Promise.all([X().kv(KS), X().kv(KM)]).then(function (a) {
      var st = a[0] || {}, mirror = (a[1] && a[1].items) || {};
      var linkSig = Object.keys(linked).sort().join(",");
      var token = st.token || null, projects = null, dead = {};
      /* what a project no list links any more left in the mirror */
      Object.keys(mirror).forEach(function (id) { if (!linked.hasOwnProperty(mirror[id].project_id)) delete mirror[id]; });
      /* take one answer in: the mirror, then each task that changed */
      function take(res) {
        if (res.projects && res.projects.length) projects = res.projects.filter(function (pr) { return !pr.is_deleted && !pr.is_archived; }).map(function (pr) { return { id: pr.id, name: pr.name }; });
        var changed = {};
        (res.items || []).forEach(function (it) {
          if (!linked.hasOwnProperty(it.project_id) && !mirror[it.id]) return;
          mirror[it.id] = it;
          changed[it.parent_id || it.id] = true;
        });
        var local = byLink("todoist"), whole = !!res.full_sync;
        Object.keys(changed).forEach(function (id) {
          var it = mirror[id];
          if (!it || it.parent_id) return;
          var gone = !!it.is_deleted || !linked.hasOwnProperty(it.project_id);
          var kids = childrenOf(mirror, id, "child_order");
          if (whole && !gone && local[id]) kids = assumeDone(mirror, it, local[id], kids);
          var f = gone ? null : fromTodoist(it, mirror);
          if (f) { f.list = it.project_id; f.subs = kids.map(function (c) { return { t: c.content || "", d: !!c.checked }; }); }
          reconcile("todoist", id, f, gone, gone ? null : linked[it.project_id], local[id], counts, done,
            kids, "content", function (c) { return !!c.checked; });
        });
        Object.keys(mirror).forEach(function (id) {
          if (mirror[id].is_deleted) { dead[id] = true; delete mirror[id]; }
          else if (!linked.hasOwnProperty(mirror[id].project_id)) delete mirror[id];
        });
        if (res.sync_token) token = res.sync_token;
      }
      function read(tk) { return tdSync(tok, { sync_token: tk, resource_types: ["items", "projects"] }).then(take); }
      /* DI-05: A FULL READ ONLY ADDS. Todoist's full read ("*") holds what
         is still open: a finished sub-task and a deleted task are simply
         not in it. The mirror used to be emptied for one (whenever a list
         was linked or unlinked), so every ticked sub-task read as removed
         and was deleted here, or sent again as a new one. Now the changes
         since the last cycle are read first, with the token this device
         holds (that answer does name what was deleted and finished); the
         full read that follows, needed to meet a newly linked project,
         only adds and updates. What it leaves out stays as it was. */
      var whole = !token || st.linkSig !== linkSig;
      return (token ? read(token) : Promise.resolve()).then(function () {
        return whole ? read("*") : null;
      }).then(function () {
        return projects ? X().setKv(X().key("todoist.lists"), projects) : null;
      }).then(function () {
        return tdPush(tok, mirror, linked, delKeys, counts, dead);
      }).then(function () {
        /* DI-06: a repeat closed there has a new date only Todoist knows:
           read it back now, not a cycle later */
        if (!counts.closed) return null;
        return X().heartbeat("todoist").then(function () { return read(token); });
      }).then(function () {
        return Promise.all([X().setKv(KS, { token: token, linkSig: linkSig }), X().setKv(KM, { items: mirror })]);
      });
    /* the pulled completions are activity whether or not the push that
       followed got through (a lost lease stops it): the next cycle finds
       them already ticked and would never log them */
    }).then(function () { X().logActivity("todoist", done); return counts; },
      function (e) { X().logActivity("todoist", done); throw e; });
  }
  function tdPush(tok, mirror, linked, delKeys, counts, dead) {
    var cmds = [], after = [], now = Date.now();
    dead = dead || {};
    function cmd(type, args, uuid, temp) {
      var c = { type: type, uuid: uuid || X().newUid().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5"), args: args };
      if (temp) c.temp_id = temp;
      cmds.push(c);
      return c;
    }
    /* DI-12: a change Todoist refused is counted and named on Connections,
       and not sent again until what would be sent changes */
    function refuse(why) { counts.refused = (counts.refused || 0) + 1; if (!counts.refusedWhy) counts.refusedWhy = why || "Todoist refused it"; }
    delKeys.forEach(function (k) {
      var q0 = X().S().deletes[k];
      if (!q0) return;
      /* a deletion it refused is asked again once a day, not every cycle */
      if (q0.refusedAt && now - q0.refusedAt < DAY) { refuse(q0.refused); return; }
      var c = cmd("item_delete", { id: q0.id });
      after.push({ c: c, done: function (errs) {
        var Q = X().S().deletes;
        if (!Q[k]) return;
        if (!errs.length) { delete Q[k]; counts.deleted++; }
        else if (tdGone(errs[0].e)) delete Q[k];              // already gone there
        else { Q[k].refused = tdWhy(errs[0].e); Q[k].refusedAt = Date.now(); refuse(Q[k].refused); }
      } });
    });
    var fields = FIELDS.todoist;
    items().forEach(function (it) {
      var lk = linkOfList(it.listId);
      var L = fromLocal("todoist", it);
      var sig = sigOf(L, lk, it.ext && it.ext.cn);
      if (!it.ext || it.ext.p !== "todoist" || !it.ext.id) {
        if (!lk || lk.p !== "todoist" || it.done) return;
        if (!X().uidOk(it.uid)) return;
        if (it.ext && it.ext.p === "todoist" && it.ext.refused === sig) { refuse(it.ext.why); return; }
        var gen = genOf(it), g0 = +(it.ext && it.ext.gen) || 0;
        var temp = X().uuidOf("temp|" + it.uid + gen);
        var args = { content: L.title, description: L.notes, project_id: lk.id, priority: L.priority + 1, labels: L.tags };
        var due = tdDue(L.when); if (due) args.due = due;
        var c = cmd("item_add", args, X().uuidOf("add|" + it.uid + gen), temp);
        var subCmds = (it.subs || []).map(function (s, i) {
          return cmd("item_add", { content: s.text, parent_id: temp }, X().uuidOf("add|" + it.uid + gen + "|" + i), X().uuidOf("temp|" + it.uid + gen + "|" + i));
        });
        var keepGen = function (o) { if (g0) o.gen = g0; return o; };
        after.push({ c: c, done: function (errs, map) {
          if (errs.length) {
            var why = tdWhy(errs[0].e);
            X().inbound(function () { KOS.reminders.update(it.id, { ext: keepGen({ p: "todoist", list: lk.id, refused: sig, why: why }) }); });
            refuse(why);
            return;
          }
          if (!map[temp]) {
            /* Todoist took the command and named no id for it (an add it had
               already applied): never a link to `undefined`. It is marked
               pending and the next pull links it to the task (reconcile). */
            X().inbound(function () { KOS.reminders.update(it.id, { ext: keepGen({ p: "todoist", pending: true, list: lk.id, base: L }) }); });
            return;
          }
          var subs = (it.subs || []).map(function (s, i) { return Object.assign({}, s, { x: map[subCmds[i].temp_id] || s.x || null }); });
          X().inbound(function () { KOS.reminders.update(it.id, { subs: subs, ext: keepGen({ p: "todoist", id: map[temp], list: lk.id, base: L }) }); });
          counts.created++;
        } });
        return;
      }
      var B = it.ext.base || {}, diff = fields.filter(function (k) { return !X().same(L[k], B[k]); });
      var moved = lk && lk.p === "todoist" && it.ext.list && lk.id !== it.ext.list;
      /* DI-06: A REPEAT TODOIST OWNS IS CLOSED THERE, NOT RE-DATED. Ticking
         one here counts a close (`ext.close`); the date this app rolled it
         to is not sent while it is still the rolled one (`closeDue`), and
         Todoist's own next date is read back after the push. Sending the
         rolled date as a new due string recorded no completion there and
         let Todoist re-anchor the rule to today. */
      var closes = Math.max(0, +it.ext.close || 0);
      if (closes && (it.ext.closeDue || null) === (it.due || null)) diff = diff.filter(function (k) { return k !== "when"; });
      if (!diff.length && !moved && !closes) return;
      if (it.ext.refused === sig) { refuse(it.ext.why); return; }
      var id = it.ext.id, up = { id: id }, any = false, cs = [];
      for (var n = 0; n < closes; n++) cs.push(cmd("item_close", { id: id }, X().uuidOf("close|" + it.uid + "|" + ((+it.ext.cn || closes) - closes + n + 1))));
      diff.forEach(function (k) {
        if (k === "title") { up.content = L.title; any = true; }
        else if (k === "notes") { up.description = L.notes; any = true; }
        else if (k === "priority") { up.priority = L.priority + 1; any = true; }
        else if (k === "tags") { up.labels = L.tags; any = true; }
        else if (k === "when") { up.due = tdDue(L.when); any = true; }
      });
      if (any) cs.push(cmd("item_update", up));
      if (diff.indexOf("done") !== -1) cs.push(cmd(L.done ? "item_close" : "item_uncomplete", { id: id }));
      if (moved) cs.push(cmd("item_move", { id: id, project_id: lk.id }));
      var newSubs = null;
      if (diff.indexOf("subs") !== -1) {
        var kids = childrenOf(mirror, id, "child_order"), byId = {}, keep = {};
        kids.forEach(function (k2) { byId[k2.id] = k2; });
        newSubs = (it.subs || []).map(function (s, i) {
          var s2 = Object.assign({}, s);
          if (s.x && byId[s.x]) {
            keep[s.x] = true;
            if (byId[s.x].content !== s.text) cs.push(cmd("item_update", { id: s.x, content: s.text }));
            if (!!byId[s.x].checked !== !!s.done) cs.push(cmd(s.done ? "item_close" : "item_uncomplete", { id: s.x }));
          } else if (s.x && !dead[s.x]) {
            /* DI-05: it has a task there that was not in what was read and
               was not said to be deleted: unknown, so left alone. Sent
               again as an add it became a second sub-task. */
          } else {
            var t = X().uuidOf("temp|" + it.uid + genOf(it) + "|" + s.id + "|" + i);
            s2._temp = t;
            cs.push(cmd("item_add", { content: s.text, parent_id: id }, X().uuidOf("add|" + it.uid + genOf(it) + "|" + s.id), t));
          }
          return s2;
        });
        kids.forEach(function (k2) { if (!keep[k2.id]) cs.push(cmd("item_delete", { id: k2.id })); });
      }
      after.push({ c: cs, done: function (errs, map) {
        var cur = KOS.reminders.get(it.id);
        if (!cur || !cur.ext || cur.ext.id !== id) return;
        /* the task itself is not there (deleted or out of this account's
           reach): the reminder is kept and unlinked, never deleted (DI-08);
           in a linked list it is sent again as a new task */
        if (errs.some(function (x) { return x.c.args.id === id && tdGone(x.e); })) {
          clearExt(cur);
          counts.unlinked = (counts.unlinked || 0) + 1;
          return;
        }
        /* a sub-task that is not there any more just loses its link */
        var lostSubs = {};
        errs = errs.filter(function (x) { if (x.c.args.id !== id && tdGone(x.e)) { lostSubs[x.c.args.id] = true; return false; } return true; });
        if (errs.length) {
          var why = tdWhy(errs[0].e);
          X().inbound(function () { KOS.reminders.update(cur.id, { ext: Object.assign({}, cur.ext, { refused: sig, why: why }) }); });
          refuse(why);
          return;
        }
        var ext = Object.assign({}, cur.ext, { base: L, list: lk && lk.p === "todoist" ? lk.id : cur.ext.list });
        delete ext.refused; delete ext.why;
        if (closes) {
          var left = Math.max(0, (+cur.ext.close || 0) - closes);
          if (left) ext.close = left; else { delete ext.close; delete ext.closeDue; }
          counts.closed = (counts.closed || 0) + closes;
        }
        var patch = { ext: ext };
        if (newSubs) patch.subs = newSubs.map(function (s) { var o = Object.assign({}, s); if (o._temp) { o.x = map[o._temp] || null; } delete o._temp; if (o.x && lostSubs[o.x]) o.x = null; return o; });
        X().inbound(function () { KOS.reminders.update(cur.id, patch); });
        counts.pushed++;
      } });
    });
    var chunks = [];
    for (var i = 0; i < cmds.length; i += 90) chunks.push(cmds.slice(i, i + 90));
    var status = {}, map = {}, settled = [];
    /* THE BOOKKEEPING FOLLOWS EACH CHUNK: a record whose commands have all
       been answered is linked, rebased, dequeued, unlinked or marked
       refused at once. It used to wait for the last chunk, so a lease lost
       (or the network gone) between two chunks left everything Todoist had
       already applied unrecorded, and the next cycle sent it all again. A
       command it did NOT do is read too (DI-12): it used to be dropped,
       so the same refused command went out every cycle for ever and
       Connections still said the cycle had succeeded. */
    function book() {
      after.forEach(function (a, i) {
        if (settled[i]) return;
        var list = Array.isArray(a.c) ? a.c : [a.c];
        if (!list.every(function (c) { return Object.prototype.hasOwnProperty.call(status, c.uuid); })) return;
        settled[i] = true;
        var errs = [];
        list.forEach(function (c) { var e = tdErr(status[c.uuid]); if (e) errs.push({ c: c, e: e }); });
        a.done(errs, map);
      });
      KOS.store.save();
    }
    if (!cmds.length) { book(); return Promise.resolve(); }
    return chunks.reduce(function (chain, ch) {
      return chain.then(function () {
        /* the lease is renewed between chunks; a lost one stops here (DI-19) */
        return X().heartbeat("todoist");
      }).then(function () {
        return tdSync(tok, { commands: ch }).then(function (r) {
          Object.assign(status, r.sync_status || {});
          Object.assign(map, r.temp_id_mapping || {});
          book();
        });
      });
    }, Promise.resolve());
  }

  /* ---------------- Google Tasks ---------------- */
  function gt(tok, method, path, body) { return X().call(tok, method, GT + path, body); }
  function gtasksCycle(tok) {
    var counts = { pulled: 0, pushed: 0, created: 0, deleted: 0 }, done = [];
    var KM = X().key("google.tasks");
    var linked = remoteListsLinked("gtasks");
    foldTwins("gtasks");
    orphans("gtasks", linked);
    return X().kv(KM).then(function (saved) {
      var mir = (saved && saved.lists) || {};
      Object.keys(mir).forEach(function (l) { if (!linked.hasOwnProperty(l)) delete mir[l]; });
      return Object.keys(linked).reduce(function (chain, l) {
        return chain.then(function () { return X().heartbeat("google"); }).then(function () {
          var m = mir[l] = mir[l] || { tasks: {}, since: null };
          var changed = {};
          function page(pt) {
            var qs = "?showCompleted=true&showHidden=true&showDeleted=true&maxResults=100" + (m.since ? "&updatedMin=" + encodeURIComponent(m.since) : "") + (pt ? "&pageToken=" + encodeURIComponent(pt) : "");
            return gt(tok, "GET", "/lists/" + encodeURIComponent(l) + "/tasks" + qs).then(function (r) {
              if (r.status === 404) { m.gone = true; return null; }
              if (!r.ok) throw new Error("Google Tasks answered " + r.status + ".");
              (r.json.items || []).forEach(function (t) {
                m.tasks[t.id] = t;
                changed[t.parent || t.id] = true;
                if (!m.since || t.updated > m.since) m.since = t.updated;
              });
              return r.json.nextPageToken ? page(r.json.nextPageToken) : null;
            });
          }
          return page(null).then(function () {
            var local = byLink("gtasks");
            Object.keys(changed).forEach(function (id) {
              var t = m.tasks[id];
              if (!t || t.parent) return;
              var f = t.deleted ? null : fromGtask(t, m.tasks);
              if (f) f.list = l;
              reconcile("gtasks", id, f, !!t.deleted, linked[l], local[id], counts, done,
                childrenOf(m.tasks, id, "position"), "title", function (c) { return c.status === "completed"; });
            });
            Object.keys(m.tasks).forEach(function (id) { if (m.tasks[id].deleted) delete m.tasks[id]; });
          });
        });
      }, Promise.resolve()).then(function () {
        return gtPush(tok, mir, counts);
      }).then(function () { return X().setKv(KM, { lists: mir }); });
    }).then(function () { X().logActivity("gtasks", done); return counts; },
      function (e) { X().logActivity("gtasks", done); throw e; });
  }
  function gtBody(f, fields) {
    var b = {};
    fields.forEach(function (k) {
      if (k === "title") b.title = f.title;
      else if (k === "notes") b.notes = f.notes;
      else if (k === "due") b.due = f.due ? f.due + "T00:00:00.000Z" : null;
      else if (k === "done") { b.status = f.done ? "completed" : "needsAction"; if (!f.done) b.completed = null; }
    });
    return b;
  }
  function gtPush(tok, mir, counts) {
    var q = X().S().deletes, fields = FIELDS.gtasks;
    var dels = Object.keys(q).filter(function (k) { return q[k].p === "gtasks"; });
    return dels.reduce(function (chain, k) {
      return chain.then(function () {
        return gt(tok, "DELETE", "/lists/" + encodeURIComponent(q[k].list || "@default") + "/tasks/" + encodeURIComponent(q[k].id)).then(function (r) {
          if (r.ok || r.status === 404 || r.status === 410) { delete q[k]; counts.deleted++; }
        });
      });
    }, Promise.resolve()).then(function () {
      return items().reduce(function (chain, it) {
        return chain.then(function () { return X().heartbeat("google"); }).then(function () {
          var lk = linkOfList(it.listId), L = fromLocal("gtasks", it);
          var linkedHere = it.ext && it.ext.p === "gtasks" && it.ext.id;
          /* moved to another list: Google Tasks has no move across lists here — delete, then add */
          if (linkedHere && lk && lk.p === "gtasks" && it.ext.list && it.ext.list !== lk.id) {
            var old = it.ext;
            return gt(tok, "DELETE", "/lists/" + encodeURIComponent(old.list) + "/tasks/" + encodeURIComponent(old.id)).then(function () {
              setExt(it, { id: null, base: null });
              return gtCreate(tok, KOS.reminders.get(it.id), lk, counts);
            });
          }
          if (!linkedHere) return lk && lk.p === "gtasks" && !it.done ? gtCreate(tok, it, lk, counts) : null;
          var B = it.ext.base || {}, diff = fields.filter(function (k) { return !X().same(L[k], B[k]); });
          if (!diff.length) return null;
          var list = it.ext.list, path = "/lists/" + encodeURIComponent(list) + "/tasks/";
          var top = diff.filter(function (k) { return k !== "subs"; });
          var p1 = top.length ? gt(tok, "PATCH", path + encodeURIComponent(it.ext.id), gtBody(L, top)) : Promise.resolve({ ok: true });
          return p1.then(function (r) {
            /* DI-08: "not found" on an update is NOT a deletion (another
               account, a list that moved): the reminder is kept and
               unlinked, and a pull that names it deleted is the only thing
               that deletes it here */
            if (r.status === 404) { clearExt(it); counts.unlinked = (counts.unlinked || 0) + 1; return null; }
            if (!r.ok) return null;
            if (diff.indexOf("subs") === -1) { setExt(it, { base: L }); counts.pushed++; return null; }
            return gtSubs(tok, list, it, (mir[list] && mir[list].tasks) || {}).then(function (subs) {
              X().inbound(function () { KOS.reminders.update(it.id, { subs: subs, ext: Object.assign({}, it.ext, { base: L }) }); });
              counts.pushed++;
            });
          });
        });
      }, Promise.resolve());
    }).then(function () { KOS.store.save(); });
  }
  function gtCreate(tok, it, lk, counts) {
    var L = fromLocal("gtasks", it), path = "/lists/" + encodeURIComponent(lk.id) + "/tasks";
    var b = gtBody(L, ["title", "notes", "due", "done"]);
    if (!b.due) delete b.due;
    delete b.completed;
    return gt(tok, "POST", path, b).then(function (r) {
      if (!r.ok) return null;
      var withId = Object.assign({}, it, { ext: { p: "gtasks", id: r.json.id, list: lk.id } });
      return gtSubs(tok, lk.id, withId, {}).then(function (subs) {
        X().inbound(function () { KOS.reminders.update(it.id, { subs: subs, ext: linkOf(it, "gtasks", r.json.id, Object.assign({ list: lk.id }, L)) }); });
        counts.created++;
      });
    });
  }
  /* a reminder's subs → its child tasks: add, update, delete */
  function gtSubs(tok, list, it, tasks) {
    var path = "/lists/" + encodeURIComponent(list) + "/tasks", parent = it.ext.id;
    var kids = childrenOf(tasks, parent, "position"), byId = {}, keep = {};
    kids.forEach(function (k) { byId[k.id] = k; });
    var out = [];
    return (it.subs || []).reduce(function (chain, s) {
      return chain.then(function () {
        if (s.x && byId[s.x]) {
          keep[s.x] = true;
          var k = byId[s.x], b = {};
          if (k.title !== s.text) b.title = s.text;
          if ((k.status === "completed") !== !!s.done) b.status = s.done ? "completed" : "needsAction";
          out.push(Object.assign({}, s));
          return Object.keys(b).length ? gt(tok, "PATCH", path + "/" + encodeURIComponent(s.x), b) : null;
        }
        return gt(tok, "POST", path + "?parent=" + encodeURIComponent(parent), { title: s.text, status: s.done ? "completed" : "needsAction" }).then(function (r) {
          out.push(Object.assign({}, s, { x: r.ok ? r.json.id : null }));
        });
      });
    }, Promise.resolve()).then(function () {
      return kids.filter(function (k) { return !keep[k.id]; }).reduce(function (chain, k) {
        return chain.then(function () { return gt(tok, "DELETE", path + "/" + encodeURIComponent(k.id)); });
      }, Promise.resolve());
    }).then(function () { return out; });
  }

  /* ---------------- the remote lists, for the link picker ---------------- */
  function remoteLists(p) {
    return X().token(PROV[p]).then(function (tok) {
      if (!tok) return { ok: false, why: "Connect " + (p === "todoist" ? "Todoist" : "Google") + " first." };
      if (p === "todoist") return tdSync(tok, { sync_token: "*", resource_types: ["projects"] }).then(function (r) {
        var ls = (r.projects || []).filter(function (pr) { return !pr.is_deleted && !pr.is_archived; }).map(function (pr) { return { id: pr.id, name: pr.name }; });
        return X().setKv(X().key("todoist.lists"), ls).then(function () { return { ok: true, lists: ls }; });
      }, function (e) { return { ok: false, why: e.message }; });
      return gt(tok, "GET", "/users/@me/lists?maxResults=100").then(function (r) {
        if (!r.ok) return { ok: false, why: "Google Tasks answered " + r.status + "." };
        var ls = (r.json.items || []).map(function (l) { return { id: l.id, name: l.title }; });
        return X().setKv(X().key("google.tasklists"), ls).then(function () { return { ok: true, lists: ls }; });
      });
    });
  }

  KOS.extTasks = {
    FIELDS: FIELDS, LABEL: LABEL, link: link, linkOfList: linkOfList, inScope: inScope, remoteLists: remoteLists,
    onMove: onMove, unlinkList: unlinkList, unlinked: unlinked, forget: forget, foldTwins: foldTwins,
    fromLocal: fromLocal, fromTodoist: fromTodoist, fromGtask: fromGtask, tdWhen: tdWhen, tdDue: tdDue, toPatch: toPatch,
    todoistCycle: todoistCycle, gtasksCycle: gtasksCycle
  };
  if (KOS.ext) {
    KOS.ext.register({ name: "todoist", provider: "todoist", on: function () { return KOS.ext.S().todoist.on; }, cycle: todoistCycle, forget: function () { forget("todoist"); } });
    KOS.ext.register({ name: "tasks", provider: "google", on: function () { var g = KOS.ext.S().google; return g.on && g.tasks; }, cycle: gtasksCycle, forget: function () { forget("gtasks"); } });
  }
})();
