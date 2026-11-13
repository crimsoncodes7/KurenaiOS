/* Kurenai OS — js/core/jamined.js · KOS.jaMined
   Japanese mined lines, kept on THIS DEVICE (quality programme W1, RC5;
   DI-25, invariant 115: personal media never leaves the device).

   A mined line is a line from your own media ({id, text, reading, en, src,
   at}). It used to sit in the synced state document (state.japanese.mined)
   and so went to the cloud with it. It now lives in its own IndexedDB,
   `kurenai-os-ja-mined` + the data namespace's suffix, rides the full
   backup (store.snapshotFull → `jaMined`, importFull) and is never pushed:
   `japanese.mined` is also a per-device path in cloudsync (DEVICE_PATHS),
   so an older device that still writes it there cannot send it either.
   The line's facet (`x:<id>` in state.japanese.facets) carries no text.

   A small in-memory copy is loaded at start, so the Badge Wall's count
   reads synchronously (count()).

   THE MOVE of lines already in the state is the automatic repair
   "ja-mined-to-local" (KOS.repairs, invariant 1a): due while the state has
   a `mined` key; it copies every line into the store, reads each back the
   same, and only then removes the key (an empty key is simply removed).
   On any failure the state is left as it was. It re-plans from the data
   (`repeat`), so running twice changes nothing more.

     put(line)  → Promise<id>   (idempotent by id: a line already here
                                  keeps what it has and gains what it lacks)
     take(map)  → Promise<n>    lines from a cloud document an OLDER version
                                  wrote ({id: line}); only those not here yet
     all()      → Promise<[lines]>
     count()    → number (the in-memory copy)
     exportAll(cb), importAll(rows, cb)                                    */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var DB_NAME = "kurenai-os-ja-mined" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1, STORE = "lines";
  var dbp = null, mem = {};

  function available() { return !!window.indexedDB; }
  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!available()) { rej(new Error("IndexedDB unavailable")); return; }
      var rq = window.indexedDB.open(DB_NAME, DB_VER);
      rq.onupgradeneeded = function () {
        var d = rq.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: "id" });
      };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { dbp = null; rej(rq.error || new Error("The mined lines could not open.")); };
    });
    return dbp;
  }
  function clean(id, l) {
    l = l && typeof l === "object" ? l : {};
    return { id: String(id || l.id), text: String(l.text || ""), reading: l.reading || null, en: l.en || null,
      src: l.src && typeof l.src === "object" ? JSON.parse(JSON.stringify(l.src)) : {}, at: +l.at || Date.now() };
  }
  function putMany(rows) {
    if (!rows.length) return Promise.resolve(0);
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, "readwrite"), os = t.objectStore(STORE);
        rows.forEach(function (r) { os.put(r); });
        t.oncomplete = function () { rows.forEach(function (r) { mem[r.id] = r; }); res(rows.length); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error || new Error("aborted")); };
      });
    });
  }
  /* read-then-write in ONE transaction: a line already stored is never
     overwritten (its first `at`, and a reading or translation it has,
     stay); `fill` lets a new copy supply what the stored one lacks.
     → Promise<[rows written]> */
  function addMissing(rows, fill) {
    if (!rows.length) return Promise.resolve([]);
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction(STORE, "readwrite"), os = t.objectStore(STORE), wrote = [];
        rows.forEach(function (r) {
          var g = os.get(r.id);
          g.onsuccess = function () {
            var have = g.result, next = r;
            if (have) {
              if (!fill) return;
              next = { id: have.id, text: have.text || r.text, reading: have.reading || r.reading, en: have.en || r.en,
                src: have.src && Object.keys(have.src).length ? have.src : r.src, at: have.at || r.at };
              if (JSON.stringify(next) === JSON.stringify(have)) { mem[have.id] = have; return; }
            }
            os.put(next);
            wrote.push(next);
          };
        });
        t.oncomplete = function () { wrote.forEach(function (r) { mem[r.id] = r; }); res(wrote); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error || new Error("aborted")); };
      });
    });
  }
  function put(line) { var r = clean(line.id, line); return addMissing([r], true).then(function () { return r.id; }); }
  function take(map) {
    var rows = Object.keys(map && typeof map === "object" ? map : {}).map(function (id) { return clean(id, map[id]); })
      .filter(function (r) { return r.id && r.text; });
    return addMissing(rows, false).then(function (wrote) { return wrote.length; });
  }
  function get(id) {
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var rq = d.transaction(STORE, "readonly").objectStore(STORE).get(id);
        rq.onsuccess = function () { res(rq.result || null); };
        rq.onerror = function () { rej(rq.error); };
      });
    });
  }
  function all() {
    if (!available()) return Promise.resolve([]);
    return open().then(function (d) {
      return new Promise(function (res, rej) {
        var rq = d.transaction(STORE, "readonly").objectStore(STORE).getAll();
        rq.onsuccess = function () { res(rq.result || []); };
        rq.onerror = function () { rej(rq.error); };
      });
    });
  }
  function has(id) { return !!mem[id]; }
  function count() { return Object.keys(mem).length; }
  function load() {
    return all().then(function (rows) { mem = {}; rows.forEach(function (r) { mem[r.id] = r; }); return rows.length; }, function () { return 0; });
  }
  function exportAll(cb) { all().then(function (rows) { cb(null, rows); }, function (e) { cb(e); }); }
  function importAll(rows, cb) {
    rows = Array.isArray(rows) ? rows : [];
    open().then(function (d) {
      var t = d.transaction(STORE, "readwrite"), os = t.objectStore(STORE), next = {};
      os.clear();
      rows.forEach(function (l) { if (l && l.id) { var r = clean(l.id, l); os.put(r); next[r.id] = r; } });
      t.oncomplete = function () { mem = next; cb && cb(null, { lines: Object.keys(next).length }); };
      t.onerror = function () { cb && cb(t.error); };
    }, function (e) { cb && cb(e); });
  }

  /* ---------------- the move (repair) ---------------- */
  var REPAIR = "ja-mined-to-local";
  function J() { var st = KOS.store && KOS.store.state; return st && st.japanese && typeof st.japanese === "object" ? st.japanese : null; }
  function due() { var j = J(); return !!(j && Object.prototype.hasOwnProperty.call(j, "mined")); }
  function plan() {
    var j = J(), m = due() && j.mined && typeof j.mined === "object" && !Array.isArray(j.mined) ? j.mined : {};
    var ids = due() ? Object.keys(m) : [];
    return Promise.resolve({
      needed: due(),
      summary: { lines: ids.length },
      items: ids.map(function (id) { return { id: id, chars: String((m[id] && m[id].text) || "").length }; }),
      apply: function () { return move(ids.map(function (id) { return clean(id, m[id]); })); }
    });
  }
  function move(rows) {
    var seen = JSON.stringify(rows);
    return putMany(rows).then(function () {
      return Promise.all(rows.map(function (r) { return get(r.id); }));
    }).then(function (back) {
      var ok = back.every(function (b, i) { return b && JSON.stringify(b) === JSON.stringify(rows[i]); });
      if (!ok) throw new Error("A mined line did not read back the same, so the state was left as it was.");
      var j = J();
      /* only if the state still holds exactly what was copied */
      var now = j && j.mined && typeof j.mined === "object" ? Object.keys(j.mined).map(function (id) { return clean(id, j.mined[id]); }) : [];
      now.forEach(function (r, i) { r.at = rows[i] ? rows[i].at : r.at; });
      if (JSON.stringify(now) !== seen) throw new Error("The mined lines changed while they were being moved; the state was left as it was.");
      delete j.mined;
      if (KOS.store.save) KOS.store.save();
      return { moved: rows.length };
    });
  }
  if (KOS.repairs) KOS.repairs.register(REPAIR, {
    title: "Keep your mined Japanese lines on this device only",
    consent: false, repeat: true, plan: plan, ready: due
  });

  KOS.jaMined = { name: DB_NAME, available: available, put: put, take: take, all: all, has: has, count: count, load: load,
    exportAll: exportAll, importAll: importAll, REPAIR: REPAIR, plan: plan };
  if (available()) load();
})();
