#!/bin/bash
# usage: efi-run.sh size "route1 route2 ..."
Q=${QA:-audit-evidence/2026-11/qa}
M=$(cat $Q/sc-measure.js)
R=$(printf '%s\n' $2 | sed 's/.*/"&"/' | paste -sd, -)
node $Q/kos.mjs eval 14 "(async()=>{ $M ; const res={}; for(const h of [$R]){ location.hash=h; await new Promise(r=>setTimeout(r,1400)); const x=__meas(); const ttl=(document.querySelector('#main h1')||{}).textContent; res[h]={t:ttl,doc:x.docOverflow,main:x.main,n:x.issues.length,issues:x.issues.filter(i=>!/rail-label|skip-link|search-input|review.chip|rail-toggle|exams.season|Notifications|sr-only|k-ex-file|files.input|"More"/.test(i)).slice(0,10)}; } return res; })()" --size $1
