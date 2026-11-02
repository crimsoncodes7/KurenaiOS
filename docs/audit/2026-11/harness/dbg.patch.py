s=open('td.js').read()
s=s.replace('await tsync(); let it=K.reminders.get(r.id); const sx=it.subs[0].x;','log("before",JSON.stringify(K.reminders.get(r.id).subs)); await tsync(); let it=K.reminders.get(r.id); log("after1",JSON.stringify(it.subs), JSON.stringify(it.ext.base.subs)); await tsync(); log("after2",JSON.stringify(K.reminders.get(r.id).subs)); const sx=it.subs[0].x;')
open('td.js','w').write(s)
