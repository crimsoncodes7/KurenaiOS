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
   imported; a linked reminder deleted on either side is deleted on both. */
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
  function setExt(item, patch) {
    X().inbound(function () { KOS.reminders.update(item.id, { ext: Object.assign({}, item.ext || {}, patch) }); });
  }
  function rebase(f, fields, B, m) {
    var base = {};
    fields.forEach(function (k) { base[k] = m.push.indexOf(k) !== -1 ? (B ? B[k] : f[k]) : m.merged[k]; });
    return base;
  }
  /* pull one remote task into Reminders (create, merge or delete) */
  function reconcile(p, rid, remote, remoteDeleted, listId, local, counts, done, kids, nameKey, doneOf) {
    var fields = FIELDS[p];
    if (remoteDeleted) {
      if (local) { X().inbound(function () { KOS.reminders.remove(local.id); }); counts.pulled++; }
      return;
    }
    if (!local) {
      if (remote.done) return;                       // finished there before the link: not imported
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
    X().inbound(function () {
      var patch = toPatch(p, m.merged, m.pull.filter(function (k) { return k !== "subs"; }), local);
      if (m.pull.indexOf("subs") !== -1) patch.subs = subsFrom(kids, local, nameKey, doneOf);
      patch.ext = Object.assign({}, patch.ext || local.ext, { base: rebase(remote, fields, B, m), list: remote.list });
      KOS.reminders.update(local.id, patch);
    });
    if (m.pull.length) counts.pulled++;
  }

  /* ---------------- Todoist ---------------- */
  function tdSync(tok, form) {
    var body = Object.keys(form).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(typeof form[k] === "string" ? form[k] : JSON.stringify(form[k])); }).join("&");
    return X().call(tok, "POST", TD + "/sync", body, { "Content-Type": "application/x-www-form-urlencoded" }).then(function (r) {
      if (!r.ok) throw new Error("Todoist answered " + r.status + ".");
      return r.json || {};
    });
  }
  function todoistCycle(tok) {
    var counts = { pulled: 0, pushed: 0, created: 0, deleted: 0 }, done = [];
    var KS = X().key("todoist.sync"), KM = X().key("todoist.mirror");
    var linked = remoteListsLinked("todoist");
    var q = X().S().deletes;
    var delKeys = Object.keys(q).filter(function (k) { return q[k].p === "todoist"; });
    return Promise.all([X().kv(KS), X().kv(KM)]).then(function (a) {
      var st = a[0] || {}, mirror = (a[1] && a[1].items) || {};
      /* the linked projects changed since the last cycle: read them whole */
      var linkSig = Object.keys(linked).sort().join(",");
      var token = st.linkSig === linkSig && st.token ? st.token : "*";
      return tdSync(tok, { sync_token: token, resource_types: ["items", "projects"] }).then(function (res) {
        if (res.full_sync) mirror = {};
        var projects = (res.projects || []).filter(function (pr) { return !pr.is_deleted && !pr.is_archived; }).map(function (pr) { return { id: pr.id, name: pr.name }; });
        var changed = {};
        (res.items || []).forEach(function (it) {
          if (!linked.hasOwnProperty(it.project_id) && !mirror[it.id]) return;
          mirror[it.id] = it;
          changed[it.parent_id || it.id] = true;
        });
        var local = byLink("todoist");
        Object.keys(changed).forEach(function (id) {
          var it = mirror[id];
          if (!it || it.parent_id) return;
          var gone = !!it.is_deleted || !linked.hasOwnProperty(it.project_id);
          var f = gone ? null : fromTodoist(it, mirror);
          if (f) f.list = it.project_id;
          reconcile("todoist", id, f, gone, gone ? null : linked[it.project_id], local[id], counts, done,
            childrenOf(mirror, id, "child_order"), "content", function (c) { return !!c.checked; });
        });
        Object.keys(mirror).forEach(function (id) { if (mirror[id].is_deleted) delete mirror[id]; });
        var saveProjects = res.projects && res.projects.length ? X().setKv(X().key("todoist.lists"), projects.length || token === "*" ? projects : null) : Promise.resolve();
        return saveProjects.then(function () {
          return tdPush(tok, mirror, linked, delKeys, counts).then(function () {
            return Promise.all([X().setKv(KS, { token: res.sync_token || token, linkSig: linkSig }), X().setKv(KM, { items: mirror })]);
          });
        });
      });
    }).then(function () { X().logActivity("todoist", done); return counts; });
  }
  function tdPush(tok, mirror, linked, delKeys, counts) {
    var q = X().S().deletes, cmds = [], after = [];
    function cmd(type, args, uuid, temp) {
      var c = { type: type, uuid: uuid || X().newUid().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5"), args: args };
      if (temp) c.temp_id = temp;
      cmds.push(c);
      return c;
    }
    delKeys.forEach(function (k) { var c = cmd("item_delete", { id: q[k].id }); after.push({ c: c, ok: function () { delete q[k]; counts.deleted++; } }); });
    var fields = FIELDS.todoist;
    items().forEach(function (it) {
      var lk = linkOfList(it.listId);
      var L = fromLocal("todoist", it);
      if (!it.ext || it.ext.p !== "todoist" || !it.ext.id) {
        if (!lk || lk.p !== "todoist" || it.done) return;
        if (!X().uidOk(it.uid)) return;
        var temp = X().uuidOf("temp|" + it.uid);
        var args = { content: L.title, description: L.notes, project_id: lk.id, priority: L.priority + 1, labels: L.tags };
        var due = tdDue(L.when); if (due) args.due = due;
        var c = cmd("item_add", args, X().uuidOf("add|" + it.uid), temp);
        var subCmds = (it.subs || []).map(function (s, i) {
          return cmd("item_add", { content: s.text, parent_id: temp }, X().uuidOf("add|" + it.uid + "|" + i), X().uuidOf("temp|" + it.uid + "|" + i));
        });
        after.push({ c: c, ok: function (map) {
          var subs = (it.subs || []).map(function (s, i) { return Object.assign({}, s, { x: map[subCmds[i].temp_id] || s.x || null }); });
          X().inbound(function () { KOS.reminders.update(it.id, { subs: subs, ext: { p: "todoist", id: map[temp], list: lk.id, base: L } }); });
          counts.created++;
        } });
        return;
      }
      var B = it.ext.base || {}, diff = fields.filter(function (k) { return !X().same(L[k], B[k]); });
      var moved = lk && lk.p === "todoist" && it.ext.list && lk.id !== it.ext.list;
      if (!diff.length && !moved) return;
      var id = it.ext.id, up = { id: id }, any = false, cs = [];
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
          } else {
            var t = X().uuidOf("temp|" + it.uid + "|" + s.id + "|" + i);
            s2._temp = t;
            cs.push(cmd("item_add", { content: s.text, parent_id: id }, X().uuidOf("add|" + it.uid + "|" + s.id), t));
          }
          return s2;
        });
        kids.forEach(function (k2) { if (!keep[k2.id]) cs.push(cmd("item_delete", { id: k2.id })); });
      }
      after.push({ c: cs, ok: function (map) {
        var patch = { ext: Object.assign({}, it.ext, { base: L, list: lk && lk.p === "todoist" ? lk.id : it.ext.list }) };
        if (newSubs) patch.subs = newSubs.map(function (s) { var o = Object.assign({}, s); if (o._temp) { o.x = map[o._temp] || null; } delete o._temp; return o; });
        X().inbound(function () { KOS.reminders.update(it.id, patch); });
        counts.pushed++;
      } });
    });
    if (!cmds.length) return Promise.resolve();
    var chunks = [];
    for (var i = 0; i < cmds.length; i += 90) chunks.push(cmds.slice(i, i + 90));
    var status = {}, map = {};
    return chunks.reduce(function (chain, ch) {
      return chain.then(function () {
        return tdSync(tok, { commands: ch }).then(function (r) {
          Object.assign(status, r.sync_status || {});
          Object.assign(map, r.temp_id_mapping || {});
        });
      });
    }, Promise.resolve()).then(function () {
      after.forEach(function (a) {
        var list = Array.isArray(a.c) ? a.c : [a.c];
        if (list.every(function (c) { return status[c.uuid] === "ok"; })) a.ok(map);
      });
      KOS.store.save();
    });
  }

  /* ---------------- Google Tasks ---------------- */
  function gt(tok, method, path, body) { return X().call(tok, method, GT + path, body); }
  function gtasksCycle(tok) {
    var counts = { pulled: 0, pushed: 0, created: 0, deleted: 0 }, done = [];
    var KM = X().key("google.tasks");
    var linked = remoteListsLinked("gtasks");
    return X().kv(KM).then(function (saved) {
      var mir = (saved && saved.lists) || {};
      Object.keys(mir).forEach(function (l) { if (!linked.hasOwnProperty(l)) delete mir[l]; });
      return Object.keys(linked).reduce(function (chain, l) {
        return chain.then(function () {
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
    }).then(function () { X().logActivity("gtasks", done); return counts; });
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
        return chain.then(function () {
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
            if (r.status === 404) { X().inbound(function () { KOS.reminders.remove(it.id); }); return null; }
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
        X().inbound(function () { KOS.reminders.update(it.id, { subs: subs, ext: { p: "gtasks", id: r.json.id, list: lk.id, base: L } }); });
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
    fromLocal: fromLocal, fromTodoist: fromTodoist, fromGtask: fromGtask, tdWhen: tdWhen, tdDue: tdDue, toPatch: toPatch,
    todoistCycle: todoistCycle, gtasksCycle: gtasksCycle
  };
  if (KOS.ext) {
    KOS.ext.register({ name: "todoist", provider: "todoist", on: function () { return KOS.ext.S().todoist.on; }, cycle: todoistCycle });
    KOS.ext.register({ name: "tasks", provider: "google", on: function () { var g = KOS.ext.S().google; return g.on && g.tasks; }, cycle: gtasksCycle });
  }
})();
