#!/bin/bash
Q=${QA:-audit-evidence/2026-11/qa}
M=$(cat $Q/col-measure.js)
R=$(printf '%s\n' $2 | sed 's/.*/"&"/' | paste -sd, -)
node $Q/kos.mjs eval 15 "(async()=>{ $M ; const res={}; for(const h of [$R]){ const t0=performance.now(); location.hash=h; await new Promise(r=>setTimeout(r,1800)); const x=__meas(); res[h]={doc:x.docOverflow,main:x.main,n:x.issues.length,issues:x.issues}; } return res; })()" --size $1
