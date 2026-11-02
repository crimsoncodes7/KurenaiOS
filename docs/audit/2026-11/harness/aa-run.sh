#!/bin/bash
# aa-run.sh size label
Q=/private/tmp/claude-501/-Users-fj-Developer-KurenaiOS---Web/083a292e-9158-4ad4-8d86-0c9b8abd3917/scratchpad/qa
M=$(cat $Q/sc-measure.js)
node $Q/kos.mjs eval 16 "(async()=>{ $M ; const V=[['assistant',{tab:'chat'}],['assistant',{tab:'history'}],['assistant',{tab:'settings'}],['assistant',{tab:'memory'}],['assistant',{tab:'scheduled'}],['assistant',{tab:'permissions'}],['assistant',{tab:'activity'}],['notifications'],['data'],['storage'],['connections'],['pen'],['help']]; const res={}; for(const v of V){ KOS.show(v[0],v[1]); await new Promise(r=>setTimeout(r,1200)); const x=__meas(); res[v[0]+(v[1]?'/'+v[1].tab:'')]={hash:x.hash,doc:x.docOverflow,main:x.main,n:x.issues.length,issues:x.issues}; } return res; })()" --size $1 > $Q/aa-$2-$1.json
