"use strict";
const REPO="/Users/fj/Developer/KurenaiOS - Web";
module.paths.unshift(REPO+"/node_modules");const { boot } = require(REPO+"/tools/lib/app-harness");const ACCESS = { google: "ya29.GOOGLEACCESS", todoist: "TODOISTACCESS1" };
function fakeTodoist() {
  const st = { seq: 0, items: {}, projects: [{ id: "P1", name: "School" }, { id: "P2", name: "Home" }], calls: [], uuids: {} };
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(JSON.stringify(json)) }); }
  st.put = (it) => { st.items[it.id] = Object.assign({ checked: false, is_deleted: false, priority: 1, labels: [], description: "", parent_id: null, child_order: 1 }, st.items[it.id] || {}, it, { seq: ++st.seq }); return st.items[it.id]; };
  st.fetch = (url, init) => {
    if ((init.headers || {}).Authorization !== "Bearer " + ACCESS.todoist) return res(401, {});
    const form = new URLSearchParams(init.body), out = {};
    if (form.get("commands")) {
      const cmds = JSON.parse(form.get("commands"));
      st.calls.push(cmds);
      out.sync_status = {}; out.temp_id_mapping = {};
      cmds.forEach((c) => {
        if (st.uuids[c.uuid]) { out.sync_status[c.uuid] = "ok"; Object.assign(out.temp_id_mapping, st.uuids[c.uuid]); return; }
        const a = c.args, map = {};
        const real = (id) => out.temp_id_mapping[id] || id;
        if (c.type === "item_add") { const id = "T" + (++st.seq); map[c.temp_id] = id; out.temp_id_mapping[c.temp_id] = id; st.put(Object.assign({}, a, { id, parent_id: a.parent_id ? real(a.parent_id) : null, project_id: a.parent_id ? (st.items[real(a.parent_id)]||{}).project_id : a.project_id, child_order: st.seq })); }
        else if (c.type === "item_update") st.put(Object.assign({}, a));
        else if (c.type === "item_close") st.put({ id: a.id, checked: true });
        else if (c.type === "item_uncomplete") st.put({ id: a.id, checked: false });
        else if (c.type === "item_delete") st.put({ id: a.id, is_deleted: true });
        else if (c.type === "item_move") st.put({ id: a.id, project_id: a.project_id });
        st.uuids[c.uuid] = map;
        out.sync_status[c.uuid] = "ok";
      });
      return res(200, out);
    }
    const tok = form.get("sync_token"), since = tok === "*" ? 0 : +tok.slice(1);
    const types = JSON.parse(form.get("resource_types") || "[]");
    if (types.indexOf("items") !== -1) out.items = Object.values(st.items).filter((i) => i.seq > since && (since || (!i.checked && !i.is_deleted)));
    if (types.indexOf("projects") !== -1) out.projects = st.projects;
    out.full_sync = tok === "*";
    out.sync_token = "t" + st.seq;
    return res(200, out);
  };
  return st;
}
let app,K,X,td; const log=(...a)=>console.log(...a);
async function tsync(){ const r=await X.syncProvider("todoist","t"); for(let i=0;i<4;i++) await app.settle(); return r; }
async function setup(){
  app=await boot({clock:"2026-10-29T10:00:00"}); K=app.KOS; X=K.ext;
  K.cloud.signedIn=()=>true; K.cloud.userId=()=>"u1";
  X._setEdge((b)=>{ if(b.action==="token") return Promise.resolve({token:ACCESS[b.provider],expires_at:new app.window.Date(app.window.Date.now()+3600e3).toISOString()}); if(b.action==="complete") return Promise.resolve({account:"Kai"}); return Promise.resolve({ok:true}); });
  td=fakeTodoist(); td.fail=null;
  const plain=app.window.fetch;
  app.window.fetch=(u,i)=>{ if(String(u).indexOf("https://api.todoist.com/")===0){ if(td.fail&&td.fail(i)) return Promise.resolve({ok:false,status:503,text:()=>Promise.resolve("{}")}); return td.fetch(u,i);} return plain(u,i); };
  app.window.sessionStorage.setItem("kos.ext.state","ext-todoist-abcdefabcdef12");
  await X.complete(new URLSearchParams("code=C&state=ext-todoist-abcdefabcdef12"));
}
(async()=>{
 const which=process.argv[2];
 await setup();
 const list=K.reminders.addList("School"); K.extTasks.link(list.id,"todoist",{id:"P1",name:"School"});
 if(which==="subs"){
   const r=K.reminders.add({title:"Essay",listId:list.id}); K.reminders.subAdd(r.id,"Plan"); K.reminders.subAdd(r.id,"Draft");
   log("before",JSON.stringify(K.reminders.get(r.id).subs)); await tsync(); let it=K.reminders.get(r.id); log("after1",JSON.stringify(it.subs), JSON.stringify(it.ext.base.subs)); log("remote",JSON.stringify(Object.values(td.items).map(i=>[i.id,i.content,i.parent_id,i.seq]))); const ores=td.fetch; td.fetch=(u,i)=>ores(u,i).then(r=>{return r.text().then(t=>{ return {ok:r.ok,status:r.status,text:()=>Promise.resolve(t)};});}); await tsync(); log("after2",JSON.stringify(K.reminders.get(r.id).subs)); const sx=it.subs[0].x;
   td.put({id:sx,checked:true}); await tsync(); log("after remote sub tick:",JSON.stringify(K.reminders.get(r.id).subs.map(s=>[s.text,s.done])));
   // trigger full sync: link a second list
   const l2=K.reminders.addList("Home"); K.extTasks.link(l2.id,"todoist",{id:"P2",name:"Home"});
   await tsync(); log("after full sync:",JSON.stringify(K.reminders.get(r.id).subs.map(s=>[s.text,s.done])));
   // now local edits sub
   K.reminders.subAdd(r.id,"Proofread"); td.calls.length=0; await tsync();
   log("cmds:",JSON.stringify(td.calls.map(c=>c.map(x=>x.type+":"+(x.args.content||x.args.id)))));
   log("remote children:",JSON.stringify(Object.values(td.items).filter(i=>i.parent_id).map(i=>[i.content,i.checked,i.is_deleted])));
 }
 if(which==="chunk"){
   for(let i=0;i<60;i++){ const r=K.reminders.add({title:"Task "+i,listId:list.id}); K.reminders.subAdd(r.id,"s"); }
   let n=0; td.fail=(init)=>{ const f=new URLSearchParams(init.body); if(f.get("commands")){ n++; return n===2; } return false; };
   const r1=await tsync(); log("cycle1",JSON.stringify(r1.ok),r1.why);
   log("remote items",Object.values(td.items).filter(i=>!i.parent_id).length,"local linked",K.reminders.all().filter(x=>x.ext&&x.ext.id).length,"local total",K.reminders.all().length);
   td.fail=null; const r2=await tsync(); log("cycle2",r2.ok,r2.why);
   const titles=K.reminders.all().map(x=>x.title); const dup=titles.filter((t,i)=>titles.indexOf(t)!==i);
   log("local total",titles.length,"dup local",dup.length,"remote parents",Object.values(td.items).filter(i=>!i.parent_id&&!i.is_deleted).length,"unlinked local",K.reminders.all().filter(x=>!(x.ext&&x.ext.id)).length);
 }
 if(which==="twodev"){
   const r=K.reminders.add({title:"Shared",listId:list.id}); await tsync(); // establish token
   const kvTok=await X.kv(X.key("todoist.sync")); const kvMir=await X.kv(X.key("todoist.mirror"));
   const r2=K.reminders.add({title:"Made on A",listId:list.id});
   const preB=JSON.parse(JSON.stringify(K.reminders.get(r2.id))); // B's copy (unlinked)
   await tsync(); // A pushes
   // become B: B's kv from before, B's state copy of r2 unlinked
   await X.setKv(X.key("todoist.sync"),kvTok); await X.setKv(X.key("todoist.mirror"),kvMir);
   X.inbound(()=>K.reminders.update(r2.id,{ext:null,subs:[]}));
   await tsync();
   log("local 'Made on A':",K.reminders.all().filter(x=>x.title==="Made on A").map(x=>[x.id,x.ext&&x.ext.id]));
   log("remote 'Made on A':",Object.values(td.items).filter(x=>x.content==="Made on A").map(x=>x.id));
 }
 if(which==="recur"){
   const r=K.reminders.add({title:"Water plants",listId:list.id,due:"2026-10-29",recur:"weekly"}); await tsync();
   td.calls.length=0; K.reminders.complete(r.id,true); await tsync();
   log("local due",K.reminders.get(r.id).due,"cmds",JSON.stringify(td.calls));
   // remote x-rule completed locally
   td.put({id:"T950",content:"Gym",project_id:"P1",due:{date:"2026-10-29",is_recurring:true,string:"every mon, fri"}}); await tsync();
   const g=K.reminders.all().find(x=>x.title==="Gym"); td.calls.length=0; K.reminders.complete(g.id,true); await tsync();
   log("gym local",JSON.stringify([g.id,K.reminders.get(g.id).done,K.reminders.get(g.id).due]),"cmds",JSON.stringify(td.calls.map(c=>c.map(x=>x.type))));
 }
 if(which==="replace"){
   const r=K.reminders.add({title:"To delete",listId:list.id}); await tsync();
   K.reminders.remove(r.id); log("queued",Object.keys(X.S().deletes));
   const of=td.fetch; let once=false; td.fetch=(u,i)=>{ if(!once){once=true; K.store.replaceState(JSON.parse(JSON.stringify(K.store.state)));} return of(u,i); };
   await tsync(); td.fetch=of;
   log("remote deleted",Object.values(td.items).filter(x=>x.content==="To delete").map(x=>x.is_deleted),"queue after",Object.keys(X.S().deletes));
   td.calls.length=0; await tsync(); log("next cycle cmds",JSON.stringify(td.calls.map(c=>c.map(x=>x.type))));
 }
 if(app.errors.length) log("errors",app.errors.slice(0,3));
 process.exit(0);
})();
