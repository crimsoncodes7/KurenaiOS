(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);var R=KOS.routines;
out.enabled=R.enabled();var h=R.addHabit('QA auto study');var id=h&&(h.id||h);var rec=R.get(id);out.hid=rec&&rec.id;
R.update(rec.id,{auto:{src:'focus',n:1},days:[0,1,2,3,4,5,6]});out.auto=JSON.stringify(R.get(rec.id).auto);
KOS.show('ref',{subject:'compsci',ref:'4.5.4.3'});await w(600);q('[data-tab=quiz]').click();await w(300);
for(var i=0;i<2;i++){var o=q('[data-ui~="quiz.option"]');if(o)o.click();await w(100);var n=q('[data-ui~="quiz.next"]');if(n)n.click();await w(100);}
out.before=q('[data-ui~="quiz.counter"]').textContent;
// another device / a Focus end logs a focus session (here: a session landing via the ledger)
KOS.sessions.log({type:'focus',subject:'compsci',ref:'4.5.4.3',metrics:{mins:5,secs:300,complete:true,rule:'custom'}});
await w(800);out.after=(q('[data-ui~="quiz.counter"]')||{}).textContent;out.ticked=JSON.stringify(R.entry(rec.id,R.routineDay(Date.now())));
R.remove(rec.id);return JSON.stringify(out);})()
