"use strict";
const REPO="/Users/fj/Developer/KurenaiOS - Web";
module.paths.unshift(REPO+"/node_modules");const { boot } = require(REPO+"/tools/lib/app-harness");
function makeServer(startMs) {
  return {
    clock: startMs || Date.parse("2026-07-16T00:00:00Z"),
    state: null,            // {state_json, updated_at}
    media: new Map(),       // entry_id → row
    files: new Map(),       // file_id → row
    storage: new Map(),     // path → blob
    calls: { upsertState: 0, upsertMedia: 0, upsertFiles: 0, uploadBinary: 0 }
  };
}
function makeApi(sv) {
  const clone = o => JSON.parse(JSON.stringify(o));
  const stamp = () => new Date(sv.clock += 1000).toISOString();
  const since = (map, iso) => [...map.values()]
    .filter(r => !iso || Date.parse(r.updated_at) > Date.parse(iso))
    .sort((a, b) => Date.parse(a.updated_at) - Date.parse(b.updated_at));
  sv.stamp = stamp;
  return {
    fetchState: cb => cb(null, sv.state ? clone(sv.state) : null),
    /* compare-and-set on __seq, as the real row filter behaves */
    upsertState: (json, expected, cb) => {
      sv.calls.upsertState++;
      if (expected !== null && expected !== undefined) {
        const cur = sv.state ? (sv.state.state_json.__seq || 0) : 0;
        if (expected === 0 ? !!sv.state : cur !== expected) { cb(null, null); return; }
      }
      sv.state = { state_json: clone(json), updated_at: stamp() };
      cb(null, { updated_at: sv.state.updated_at });
    },
    fetchMediaSince: (iso, offset, cb) => cb(null, since(sv.media, iso).slice(offset, offset + 500).map(clone)),
    upsertMedia: (rows, cb) => {
      sv.calls.upsertMedia++;
      cb(null, rows.map(r => {
        const rec = Object.assign(clone(r), { updated_at: stamp() });
        sv.media.set(r.entry_id, rec);
        return { entry_id: r.entry_id, updated_at: rec.updated_at };
      }));
    },
    countMedia: cb => cb(null, [...sv.media.values()].filter(r => !r.deleted).length),
    listMediaIds: (offset, cb) => cb(null, [...sv.media.values()].filter(r => !r.deleted).slice(offset, offset + 1000).map(r => ({ entry_id: r.entry_id }))),
    fetchFilesSince: (iso, offset, cb) => cb(null, since(sv.files, iso).slice(offset, offset + 500).map(clone)),
    upsertFiles: (rows, cb) => {
      sv.calls.upsertFiles++;
      cb(null, rows.map(r => {
        const prev = sv.files.get(r.file_id);
        const rec = Object.assign(clone(r), {
          binary_uploaded: prev ? !!prev.binary_uploaded : false,
          updated_at: stamp()
        });
        sv.files.set(r.file_id, rec);
        return { file_id: r.file_id, updated_at: rec.updated_at };
      }));
    },
    listFileIds: (offset, cb) => cb(null, [...sv.files.values()].filter(r => !r.deleted).slice(offset, offset + 1000).map(r => ({ file_id: r.file_id }))),
    markUploaded: (fileId, cb) => {
      const r = sv.files.get(fileId);
      if (r) { r.binary_uploaded = true; r.updated_at = stamp(); }
      cb(null, [{ updated_at: r ? r.updated_at : null }]);
    },
    uploadBinary: (p2, blob, mime, cb) => { sv.calls.uploadBinary++; sv.storage.set(p2, blob); cb(null, {}); },
    downloadBinary: (p2, cb) => sv.storage.has(p2) ? cb(null, sv.storage.get(p2)) : cb(new Error("object not found")),
    removeBinary: (paths, cb) => { paths.forEach(x => sv.storage.delete(x)); cb(null); }
  };
}


(async()=>{
  const app=await boot({clock:"2026-10-29T10:00:00"}); const K=app.KOS;
  if(K.cloudsync.stop) K.cloudsync.stop();
  // the account's cloud copy: another device's data (sessions etc.)
  const remote=JSON.parse(JSON.stringify(K.store.state));
  remote.sessions=[{id:1,ts:Date.parse("2026-10-20T10:00:00Z"),type:"focus",mins:30,subject:"cs"}]; remote.governor.xp=500; remote.__seq=3;
  const sv=makeServer(); sv.state={state_json:remote,updated_at:new Date(sv.clock).toISOString()};
  K.cloudsync._config({api:makeApi(sv),session:{userId:"user-1",email:"a@b"},quiet:true,pushDebounce:600000,minPullGap:0,bootDelay:0});
  // this new device: used before signing in, but only for reminders, an assignment and a routine
  K.reminders.add({title:"LOCAL ONLY reminder"});
  if(K.assignments&&K.assignments.add) K.assignments.add({title:"LOCAL ONLY assignment",due:"2026-11-10"});
  const before={rem:K.store.state.reminders.items.length,asg:(K.store.state.assignments.items||[]).length};
  await new Promise(r=>K.cloudsync.syncNow(e=>{ if(e) console.log("sync err",e.message); r(); }));
  for(let i=0;i<6;i++) await app.settle();
  const after={rem:K.store.state.reminders.items.map(x=>x.title),asg:(K.store.state.assignments.items||[]).map(x=>x.title),xp:K.store.state.governor.xp};
  console.log(JSON.stringify({before,after,cloudHasLocal:JSON.stringify(sv.state.state_json).indexOf("LOCAL ONLY")>=0}));
  process.exit(0);
})();
