(async()=>{
 const out={};
 const J=KOS.ja, st=KOS.store.state.japanese;
 const done=['H1','H2','H3','H4','H5','H6','H7','H8','K1','K2','K3','1.1','1.2'];
 const res=[];
 for(const id of done){ J.startLesson(id); const n=((J.content(id)||{}).pages||[]).length; for(let i=0;i<n;i++) J.markPage(id,i);
   const l=J.lesson(id); for(const it of l.items){ for(const sk of ['R','L','W']){ const r=J.record(it+'|'+sk,{verdict:'correct',hints:0,ms:2000}); if(r.grade) res.push({key:it+'|'+sk,grade:r.grade}); } }
   J.finishLesson(id); }
 J.finishSession(res,{});
 // make half due, some lapses
 const ks=Object.keys(st.facets); const y=new Date(Date.now()-86400000*2).toISOString().slice(0,10);
 ks.forEach((k,i)=>{ if(i%2===0) st.facets[k].due=y; if(i%17===0) st.facets[k].lapses=5; });
 J.recordCheckpoint('cp-H',{R:0.9,W:0.85,L:0.9});
 J.addInput && J.addInput({kind:'anime',mins:25,title:'Yotsuba'});
 out.facets=ks.length; out.due=J.due().length;
 // Mind
 const M=KOS.mind;
 for(const id of ['F1.1','F1.2','F1.3','F1.4','F1.7']){ const n=M.pages(id).length; for(let i=0;i<n;i++) M.markPage(id,i); M.checkItems(id).forEach((c,qi)=>M.answerCheck(id,qi,c.a)); }
 for(const id of ['F1.1','F1.2']){ const l=M.lesson(id); const kp=(M.concept(l.main)||{}).keyPoints||[]; const t={}; kp.forEach((_,i)=>t[i]=true); M.saveExplain(id,['A claim needs reasons','The conclusion follows'],t); }
 M.takePosition('F1.7',{answer:0,conf:70,reason:'Steelmanning makes disagreement productive',objection:'It can waste time',reply:'Only for arguments worth having'});
 ['argument','premise','conclusion'].forEach(c=>{ try{M.introduce(c)}catch(e){} });
 const ms=KOS.store.state.mind; Object.keys(ms.cards).forEach(k=>ms.cards[k].due=y);
 KOS.store.save();
 out.cards=Object.keys(ms.cards).length; out.mdue=M.due().length;
 await new Promise(r=>KOS.mindJournal.ready(r));
 const kinds=['insight','quote','question','reflection'];
 for(let i=0;i<8;i++){ await new Promise(r=>KOS.mindJournal.add({kind:kinds[i%4],text:'Entry '+i+': an argument is only as strong as its weakest premise, and the long sentence keeps going to test wrapping across the card width.',title:'Entry '+i,concept:i%2?'premise':null},r)); }
 M.setBq('Is every disagreement an argument?');
 out.j=KOS.mindJournal.counts ? KOS.mindJournal.counts() : null;
 return out;
})()
