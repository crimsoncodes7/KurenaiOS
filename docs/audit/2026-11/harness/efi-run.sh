#!/bin/bash
# usage: efi-run.sh size "route1 route2 ..."
Q=/private/tmp/claude-501/-Users-fj-Developer-KurenaiOS---Web/083a292e-9158-4ad4-8d86-0c9b8abd3917/scratchpad/qa
M=$(cat $Q/sc-measure.js)
R=$(printf '%s\n' $2 | sed 's/.*/"&"/' | paste -sd, -)
node $Q/kos.mjs eval 14 "(async()=>{ $M ; const res={}; for(const h of [$R]){ location.hash=h; await new Promise(r=>setTimeout(r,1400)); const x=__meas(); const ttl=(document.querySelector('#main h1')||{}).textContent; res[h]={t:ttl,doc:x.docOverflow,main:x.main,n:x.issues.length,issues:x.issues.filter(i=>!/rail-label|skip-link|search-input|review.chip|rail-toggle|exams.season|Notifications|sr-only|k-ex-file|files.input|"More"/.test(i)).slice(0,10)}; } return res; })()" --size $1
