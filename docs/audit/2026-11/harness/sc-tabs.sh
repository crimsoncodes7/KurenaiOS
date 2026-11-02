#!/bin/bash
# usage: sc-tabs.sh size route
Q=${QA:-audit-evidence/2026-11/qa}
M=$(cat $Q/sc-measure.js)
node $Q/kos.mjs eval 5 "(async()=>{ $M ; const W=t=>new Promise(r=>setTimeout(r,t)); location.hash='$2'; await W(1500); const res={}; const names=[...document.querySelectorAll('[role=tab]')].filter(t=>t.closest('#main')).map(t=>t.textContent.trim()); for(const n of names){ const t=[...document.querySelectorAll('#main [role=tab]')].find(x=>x.textContent.trim()===n); if(!t) continue; t.click(); await W(1000); const x=__meas(); res[n]={doc:x.docOverflow,main:x.main,issues:x.issues.filter(i=>!/ 1x1 |rail|spine|part.lead|sr-only|menu-label/.test(i)).slice(0,30)}; } return res; })()" --size $1
