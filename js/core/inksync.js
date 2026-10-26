/* Kurenai OS — core/inksync.js · KOS.inkSync
   Ink sync (roadmap 6.1, docs/ipad-plan.md decision D, design 30p). Local
   first, replicated after: every pen writes to `kurenai-os-ink` on the
   device, and this engine replicates pages and page orders to the
   owner-only table `kos_ink` (migration 20261026000001).

   THE MERGE IS PER STROKE (the three-way merge of invariant 33): every
   item has its own id, so two devices adding to one page merge with
   nothing to ask. Against the page as cloud and device last agreed (the
   `base` store): an item changed on one side takes that side; added on
   either side is kept; deleted on either side, and unchanged on the other,
   goes. Only when the SAME item was erased or moved on both sides is it a
   clash, and a clash never discards: the merged page keeps this device's
   version, and the other copy waits beside it until you choose (30p): Keep
   this device's, Keep the other, or Keep both as two pages. A deletion of
   a whole page or doc wins on either side (as in invariant 33). A doc
   marked `local` (a past paper kept "this device only") never leaves.

   Status, for the chip: "synced", "syncing", "offline" (saved here),
   "conflict" (two copies wait); signed out, none at all. Zero Governor
   traffic; ink never goes in the state document.                         */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink;

  /* ================= the merge (pure; also in Node) ================= */
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function byId(list) { var m = {}; (list || []).forEach(function (it) { if (it && it.id) m[it.id] = it; }); return m; }
  /* items: base, local, remote → {items, clash: [ids]} */
  function mergeItems(base, local, remote) {
    var B = byId(base), L = byId(local), R = byId(remote), out = [], clash = [], seen = {};
    function take(id) {
      if (seen[id]) return;
      seen[id] = 1;
      var b = B[id], l = L[id], r = R[id];
      if (l && r) {
        if (same(l, r)) out.push(l);
        else if (b && same(l, b)) out.push(r);
        else if (b && same(r, b)) out.push(l);
        else { out.push(l); clash.push(id); }
        return;
      }
      if (l && !r) {
        if (!b) { out.push(l); return; }              // added here
        if (same(l, b)) return;                         // deleted there
        out.push(l); clash.push(id);                    // moved here, erased there
        return;
      }
      if (r && !l) {
        if (!b) { out.push(r); return; }              // added there
        if (same(r, b)) return;                         // deleted here
        out.push(r); clash.push(id);                    // erased here, moved there
      }
    }
    (local || []).forEach(function (it) { take(it.id); });
    (remote || []).forEach(function (it) { take(it.id); });
    return { items: out, clash: clash };
  }
  /* a page: its items merged, its paper and height from the side that
     changed them */
  function mergePage(base, local, remote) {
    var m = mergeItems(base && base.items, local.items, remote.items);
    var out = Object.assign({}, local, { items: m.items, at: Math.max(local.at || 0, remote.at || 0) });
    ["paper", "h"].forEach(function (k) {
      if (base && same(local[k], base[k]) && !same(remote[k], base[k])) out[k] = remote[k];
    });
    return { page: out, clash: m.clash };
  }
  /* a page order: this device's order, the other's additions placed after
     their neighbour, removals on either side applied */
  function mergeOrder(base, local, remote) {
    var b = base || [], inB = {}, inL = {}, inR = {};
    b.forEach(function (x) { inB[x] = 1; }); local.forEach(function (x) { inL[x] = 1; }); remote.forEach(function (x) { inR[x] = 1; });
    var out = local.filter(function (x) { return !(inB[x] && !inR[x]); });
    remote.forEach(function (x, i) {
      if (out.indexOf(x) >= 0 || (inB[x] && !inL[x])) return;
      var prev = i ? remote[i - 1] : null, at = prev ? out.indexOf(prev) + 1 : 0;
      out.splice(at > 0 ? at : (prev ? out.length : 0), 0, x);
    });
    return out;
  }

  /* ================= the replication ================= */
  var cloudApi = null, syncing = false, soonT = null, timer = null;
  var state = { status: null, page: null, conflicts: [] };
  var PAGE = 300;
  function realCloud() {
    function c() { return KOS.cloud.client(); }
    function run(b, cb) {
      b.then(function (res) { res.error ? cb(new Error(res.error.message || "Ink sync failed.")) : cb(null, res.data); })
        .catch(function (e) { cb(new Error((e && e.message) || "Ink sync failed — network?")); });
    }
    return {
      since: function (iso, offset, cb) {
        var q = c().from("kos_ink").select("id, kind, doc, data_json, deleted, updated_at");
        if (iso) q = q.gt("updated_at", iso);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + PAGE - 1), cb);
      },
      upsert: function (rows, cb) { run(c().from("kos_ink").upsert(rows, { onConflict: "user_id,id" }), cb); }
    };
  }
  function cloud() { return cloudApi || realCloud(); }
  function signedIn() { return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn()); }
  function canSync() {
    return signedIn() && I.available() && KOS.mediadb && KOS.mediadb.available() && !(KOS.dataMode && KOS.dataMode.mode);
  }
  function setStatus(st, page) {
    if (!signedIn()) st = null;
    if (state.conflicts.length && st === "synced") st = "conflict";
    if (state.status === st && state.page === page) return;
    state.status = st; state.page = page || null;
    try { window.dispatchEvent(new CustomEvent("kos-ink-sync-status", { detail: { status: st, page: page || null } })); } catch (e) { /* no events */ }
  }
  function docRow(d) { return { key: d.key, pages: d.pages, paper: d.paper, title: d.title || null, at: d.at || 0, meta: d.meta || null }; }

  function syncCloud(cb) {
    cb = cb || function () {};
    if (syncing) { cb(null, { skipped: true }); return; }
    if (!canSync()) { setStatus(signedIn() ? "offline" : null); cb(null, { skipped: true }); return; }
    if (typeof navigator !== "undefined" && navigator.onLine === false) { setStatus("offline"); cb(null, { skipped: true }); return; }
    syncing = true;
    setStatus("syncing");
    var uid = KOS.cloud.userId(), kvKey = "ink.sync." + uid, out = { pushed: 0, pulled: 0, clashes: 0 };
    function finish(err) {
      syncing = false;
      setStatus(err ? "offline" : "synced");
      cb(err || null, out);
    }
    I.ready(function () {
      KOS.mediadb.getKV(kvKey, function (e0, meta) {
        meta = meta && typeof meta === "object" ? meta : {};
        I.syncRead(function (e1, local) {
          if (e1) { finish(e1); return; }
          var rows = [], offset = 0, cursor = meta.cursor || null;
          (function pull() {
            cloud().since(meta.cursor || null, offset, function (e2, got) {
              if (e2) { finish(e2); return; }
              got = got || [];
              got.forEach(function (r) { if (!cursor || r.updated_at > cursor) cursor = r.updated_at; });
              rows = rows.concat(got);
              if (got.length === PAGE) { offset += PAGE; pull(); return; }
              apply(local, rows, meta, uid, out, function (e3, push) {
                if (e3) { finish(e3); return; }
                meta.cursor = cursor;
                sendAll(push, uid, out, function (e4) {
                  KOS.mediadb.setKV(kvKey, meta, function () { finish(e4); });
                });
              });
            });
          })();
        });
      });
    });
  }

  /* fold the pulled rows into this device, and list what to push */
  function apply(local, rows, meta, uid, out, cb) {
    var pages = byId(local.pages), docs = {}, base = byId(local.base), dead = {}, w = { pages: [], base: [], docs: [], dead: [], dropPages: [], dropDocs: [], dropBase: [] };
    (local.docs || []).forEach(function (d) { docs[d.key] = d; });
    (local.dead || []).forEach(function (x) { dead[x.id] = x; });
    state.conflicts = (local.base || []).filter(function (b) { return /^conflict:/.test(b.id); }).map(function (b) { return b.id.slice(9); });
    var remotePages = {}, remoteDocs = {};
    rows.forEach(function (r) {
      if (r.kind === "page") remotePages[r.id] = r; else remoteDocs[r.doc] = r;
    });
    var touchedDocs = {};
    /* pages */
    Object.keys(remotePages).forEach(function (id) {
      var r = remotePages[id], l = pages[id], b = base[id] && base[id].data;
      if (r.deleted) {
        if (l) { w.dropPages.push(id); delete pages[id]; touchedDocs[r.doc] = 1; }
        w.dropBase.push(id); dead[id] = { id: id, kind: "page", doc: r.doc, at: Date.now(), sent: 1 }; w.dead.push(dead[id]);
        return;
      }
      if (dead[id]) return; /* deleted here: the deletion is pushed below and wins */
      var rp = r.data_json;
      if (!rp || !Array.isArray(rp.items)) return;
      out.pulled++;
      if (!l) { pages[id] = rp; w.pages.push(rp); w.base.push({ id: id, data: rp }); touchedDocs[rp.doc] = 1; return; }
      if (same(l, rp)) { w.base.push({ id: id, data: rp }); return; }
      if (b && same(l, b)) { pages[id] = rp; w.pages.push(rp); w.base.push({ id: id, data: rp }); touchedDocs[rp.doc] = 1; return; }
      var m = mergePage(b, l, rp);
      pages[id] = m.page; w.pages.push(m.page);
      w.base.push({ id: id, data: rp });
      touchedDocs[rp.doc] = 1;
      if (m.clash.length) {
        out.clashes++;
        w.base.push({ id: "conflict:" + id, data: rp, at: Date.now() });
        if (state.conflicts.indexOf(id) < 0) state.conflicts.push(id);
      }
    });
    /* docs */
    Object.keys(remoteDocs).forEach(function (key) {
      var r = remoteDocs[key], l = docs[key], bk = "doc:" + key, b = base[bk] && base[bk].data;
      if (r.deleted) {
        if (l) { w.dropDocs.push(key); delete docs[key]; (l.pages || []).forEach(function (id) { if (pages[id]) { w.dropPages.push(id); delete pages[id]; } }); }
        w.dropBase.push(bk);
        dead[bk] = { id: bk, kind: "doc", doc: key, at: Date.now(), sent: 1 }; w.dead.push(dead[bk]);
        return;
      }
      if (dead[bk]) return;
      var rd = r.data_json;
      if (!rd || !Array.isArray(rd.pages)) return;
      if (l && l.local) return;
      var merged = l ? Object.assign({}, l, { pages: mergeOrder(b && b.pages, l.pages, rd.pages), title: l.title || rd.title || undefined })
        : Object.assign({ inked: {} }, rd);
      if (b && l && same(l.paper, b.paper)) merged.paper = rd.paper;
      docs[key] = merged;
      w.base.push({ id: bk, data: rd });
      touchedDocs[key] = 1;
    });
    /* a doc's counts follow its pages */
    Object.keys(touchedDocs).forEach(function (key) {
      var d = docs[key];
      if (!d) {
        /* pages arrived before their doc's row: make the doc from them */
        var mine = Object.keys(pages).filter(function (id) { return pages[id].doc === key; });
        if (!mine.length) return;
        d = docs[key] = { key: key, pages: mine, paper: pages[mine[0]].paper || "lined", inked: {}, at: 0 };
      }
      d.pages = d.pages.filter(function (id) { return !!pages[id]; });
      Object.keys(pages).forEach(function (id) { if (pages[id].doc === key && d.pages.indexOf(id) < 0) d.pages.push(id); });
      d.inked = {};
      d.pages.forEach(function (id) { var n = (pages[id].items || []).length; if (n) d.inked[id] = n; d.at = Math.max(d.at || 0, pages[id].at || 0); });
      w.docs.push(d);
    });
    I.syncWrite(w, function (err) {
      if (err) { cb(err); return; }
      /* what this device has that the cloud has not agreed: pages and docs
         whose JSON differs from their base, and tombstones not sent */
      var baseNow = byId(local.base);
      w.base.forEach(function (x) { baseNow[x.id] = x; });
      w.dropBase.forEach(function (id) { delete baseNow[id]; });
      var push = [], localDoc = {};
      Object.keys(docs).forEach(function (k) { if (docs[k].local) localDoc[k] = 1; });
      Object.keys(pages).forEach(function (id) {
        var p = pages[id];
        if (localDoc[p.doc]) return;
        if (!baseNow[id] || !same(baseNow[id].data, p)) push.push({ row: { id: id, kind: "page", doc: p.doc, data_json: p, deleted: false }, base: { id: id, data: p } });
      });
      Object.keys(docs).forEach(function (k) {
        var d = docs[k];
        if (d.local) return;
        var row = docRow(d), bk = "doc:" + k;
        if (!baseNow[bk] || !same(baseNow[bk].data, row)) push.push({ row: { id: bk, kind: "doc", doc: k, data_json: row, deleted: false }, base: { id: bk, data: row } });
      });
      Object.keys(dead).forEach(function (id) {
        var x = dead[id];
        if (x.sent || localDoc[x.doc]) return;
        push.push({ row: { id: id, kind: x.kind, doc: x.doc, data_json: null, deleted: true }, dead: Object.assign({}, x, { sent: 1 }) });
      });
      cb(null, push);
    });
  }
  function sendAll(push, uid, out, cb) {
    var j = 0;
    (function chunk() {
      if (j >= push.length) { cb(null); return; }
      var slice = push.slice(j, j + 50);
      j += 50;
      var pg = slice.filter(function (x) { return x.row.kind === "page"; })[0];
      if (pg) setStatus("syncing", (I.doc(pg.row.doc) ? I.doc(pg.row.doc).pages.indexOf(pg.row.id) + 1 : null) || null);
      cloud().upsert(slice.map(function (x) { return Object.assign({ user_id: uid }, x.row); }), function (err) {
        if (err) { cb(err); return; }
        out.pushed += slice.length;
        I.syncWrite({ base: slice.filter(function (x) { return x.base; }).map(function (x) { return x.base; }),
          dead: slice.filter(function (x) { return x.dead; }).map(function (x) { return x.dead; }) }, function () { chunk(); });
      });
    })();
  }

  /* ---------------- a clash, settled (30p) ---------------- */
  function conflicts() { return state.conflicts.slice(); }
  function resolve(pageId, choice, cb) {
    cb = cb || function () {};
    I.syncRead(function (err, local) {
      if (err) { cb(err); return; }
      var c = (local.base || []).filter(function (b) { return b.id === "conflict:" + pageId; })[0];
      var mine = (local.pages || []).filter(function (p) { return p.id === pageId; })[0];
      if (!c || !mine) { state.conflicts = state.conflicts.filter(function (x) { return x !== pageId; }); cb(null); return; }
      var w = { dropBase: ["conflict:" + pageId], pages: [], docs: [] };
      if (choice === "other") w.pages.push(Object.assign({}, mine, { items: c.data.items, paper: c.data.paper, h: c.data.h, at: Date.now() }));
      if (choice === "both") {
        var copy = Object.assign({}, c.data, { id: I.uid(), doc: mine.doc, at: Date.now(), created: Date.now() });
        copy.items = copy.items.map(function (it) { return Object.assign({}, it, { id: I.uid() }); });
        w.pages.push(copy);
        var d = I.doc(mine.doc);
        if (d) {
          d = JSON.parse(JSON.stringify(d));
          d.pages.splice(d.pages.indexOf(pageId) + 1, 0, copy.id);
          d.inked[copy.id] = copy.items.length;
          w.docs.push(d);
        }
      }
      I.syncWrite(w, function (e2) {
        state.conflicts = state.conflicts.filter(function (x) { return x !== pageId; });
        setStatus("synced");
        soon();
        cb(e2 || null);
      });
    });
  }
  /* the dialog (30p): only for a real clash; Escape leaves both in place */
  function resolveDialog(pageId, n, cb) {
    var el = KOS.ui.el;
    KOS.inkUI.dialog({ title: "Page " + (n || "") + " has two copies", className: "k-ink-conflict", render: function (body, close, foot) {
      body.appendChild(el("p", { text: "The same strokes were erased or moved on this device and on another. Nothing has been lost: choose which to keep." }));
      var row = el("div", { class: "k-ink-conflict-acts" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "ink.keep-mine", text: "Keep this device's", onclick: function () { close(); resolve(pageId, "mine", function () { KOS.a11y.announce("Kept this device's page " + (n || "") + "."); if (cb) cb(); }); } }),
        el("button", { type: "button", class: "k-btn", "data-ui": "ink.keep-other", text: "Keep the other", onclick: function () { close(); resolve(pageId, "other", function () { KOS.a11y.announce("Kept the other copy."); if (cb) cb(); }); } }),
        el("button", { type: "button", class: "k-btn", "data-ui": "ink.keep-both", text: "Keep both as two pages", onclick: function () { close(); resolve(pageId, "both", function () { KOS.a11y.announce("Kept both copies as two pages."); if (cb) cb(); }); } })
      ]);
      foot.appendChild(row);
    } });
  }

  /* the chip (30p): ✓ Synced, ⟳ Syncing page n, ○ Offline · saved here,
     ◆ Two copies. Signed out: nothing. */
  function chip(docKey, onConflict) {
    var el = KOS.ui.el;
    var c = el("button", { type: "button", class: "k-chip k-ink-sync", "data-ui": "ink.sync-chip" });
    function paint() {
      var st = state.status;
      var mine = state.conflicts.filter(function (id) { var d = I.doc(docKey); return d && d.pages.indexOf(id) >= 0; });
      c.hidden = !st;
      c.disabled = !mine.length;
      KOS.ui.state(c, "warn", !!mine.length || st === "offline");
      if (mine.length) {
        var n = I.doc(docKey).pages.indexOf(mine[0]) + 1;
        c.textContent = "◆ Two copies of page " + n;
        c.onclick = function () { resolveDialog(mine[0], n, paint); };
        if (onConflict) onConflict(mine);
        return;
      }
      c.onclick = null;
      c.textContent = st === "syncing" ? "⟳ Syncing" + (state.page ? " page " + state.page : "") : st === "offline" ? "○ Offline · saved here" : "✓ Synced";
    }
    function onSt() { if (!c.isConnected && c.__mounted) { window.removeEventListener("kos-ink-sync-status", onSt); return; } c.__mounted = true; paint(); }
    window.addEventListener("kos-ink-sync-status", onSt);
    paint();
    return c;
  }

  function soon() {
    if (!canSync()) return;
    clearTimeout(soonT);
    soonT = setTimeout(function () { soonT = null; syncCloud(); }, 20000);
  }
  function start() {
    if (timer) return;
    setTimeout(function () { syncCloud(); }, 12000);
    timer = setInterval(function () { syncCloud(); }, 10 * 60 * 1000);
    window.addEventListener("kos-ink", function () { soon(); });
    window.addEventListener("online", function () { syncCloud(); });
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") soon(); });
  }

  KOS.inkSync = {
    mergeItems: mergeItems, mergePage: mergePage, mergeOrder: mergeOrder,
    syncCloud: syncCloud, start: start, soon: soon, status: function () { return state.status; },
    conflicts: conflicts, resolve: resolve, resolveDialog: resolveDialog, chip: chip,
    /* test seam: a fake kos_ink API (since, upsert) */
    _setCloudApi: function (a) { cloudApi = a || null; }
  };
})();
