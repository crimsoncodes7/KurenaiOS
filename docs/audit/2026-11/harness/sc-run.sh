#!/bin/bash
# usage: sc-run.sh size "route1 route2 ..."
Q=/private/tmp/claude-501/-Users-fj-Developer-KurenaiOS---Web/083a292e-9158-4ad4-8d86-0c9b8abd3917/scratchpad/qa
M=$(cat $Q/sc-measure.js)
R=$(printf '%s\n' $2 | sed 's/.*/"&"/' | paste -sd, -)
node $Q/kos.mjs eval 5 "(async()=>{ $M ; const res={}; for(const h of [$R]){ location.hash=h; await new Promise(r=>setTimeout(r,1300)); const x=__meas(); res[h]={hash:x.hash,doc:x.docOverflow,main:x.main,n:x.issues.length,issues:x.issues}; } return res; })()" --size $1
