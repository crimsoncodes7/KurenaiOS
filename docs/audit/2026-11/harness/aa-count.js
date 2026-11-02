(async()=>{const out={ls:{},state:{},idb:{}};
for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);out.ls[k]=localStorage.getItem(k).length;}
const s=KOS.store.state; for(const k of Object.keys(s)){out.state[k]=JSON.stringify(s[k]).length;}
const dbs=await indexedDB.databases();
for(const d of dbs){ out.idb[d.name]=await new Promise(res=>{const r=indexedDB.open(d.name);r.onsuccess=()=>{const db=r.result;const names=[...db.objectStoreNames];if(!names.length){db.close();res({});return}const tx=db.transaction(names,'readonly');const o={};let left=names.length;names.forEach(n=>{const q=tx.objectStore(n).count();q.onsuccess=()=>{o[n]=q.result;if(--left===0){db.close();res(o)}};q.onerror=()=>{o[n]='err';if(--left===0){db.close();res(o)}}})};r.onerror=()=>res('openerr')}); }
return out})()
