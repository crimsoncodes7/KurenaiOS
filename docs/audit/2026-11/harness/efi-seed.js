(async()=>{
 const X=KOS.exams, T=KOS.tracker, d=n=>{const t=new Date();t.setDate(t.getDate()+n);return t.toISOString().slice(0,10)};
 const out={};
 const p2=X.add({title:"CS Paper 2",tier:"real_exam",preset:"aqa-7517-2",subject:"compsci",date:d(40),time:"09:00",durationMins:150,marks:100,location:"Sports hall",seat:"14"},{quiet:true});
 const p1=X.add({title:"CS Paper 1",tier:"real_exam",preset:"aqa-7517-1",subject:"compsci",date:d(35),time:"13:30",durationMins:150,marks:100},{quiet:true});
 const mp=X.add({title:"Maths Pure mock",tier:"mock",preset:"edexcel-9ma0-1",subject:"maths",date:d(-6),durationMins:120,marks:100},{quiet:true});
 const tt=X.add({title:"Graph traversal topic test with a very long title to test wrapping",tier:"topic_test",subject:"compsci",date:d(3),include:["compsci:Paper 2"]},{quiet:true});
 const dl=X.add({title:"NEA write-up draft",tier:"deadline",subject:"compsci",date:d(12)},{quiet:true});
 const rq=X.add({title:"Retrieval quiz: stats",tier:"retrieval_test",subject:"maths",date:d(1)},{quiet:true});
 out.ids={p2:p2.id,p1:p1.id,mp:mp.id,tt:tt.id};
 for(let i=0;i<6;i++){ T.add({kind:"paper",subject:"compsci",paper:"AQA 7517/2 June "+(2018+i),marks:40+i*7,max:100,date:d(-40+i*6),assessmentId:p2.id,role:"practice",timed:i%2==0,mins:150,predicted:50+i*5,
   questions:[{q:"1",max:6,got:4,tags:["misread"]},{q:"2",max:9,got:3,tags:["knowledge"],redo:true},{q:"3",max:12,got:10},{q:"4",max:8,got:2,tags:["time"]}]}); }
 T.add({kind:"exam",subject:"maths",paper:"Pure mock",marks:61,max:100,date:d(-6),assessmentId:mp.id,role:"result"});
 // files: a small PDF via pdf-lib if available
 try{
  const lib = KOS.inkExport && KOS.inkExport.pdfLib ? await new Promise((r,j)=>KOS.inkExport.pdfLib((e,l)=>e?j(e):r(l))) : window.PDFLib;
  out.lib=!!lib;
  if(lib){ const mk=async(t,pages)=>{const doc=await lib.PDFDocument.create(); const f=await doc.embedFont(lib.StandardFonts.Helvetica); for(let p=0;p<pages;p++){const pg=doc.addPage([595,842]); pg.drawText(t+" page "+(p+1)+" — Dijkstra shortest path, binary trees, hashing",{x:50,y:780,size:14,font:f});} return new File([await doc.save()],t+".pdf",{type:"application/pdf"});};
   const fs=[await mk("Graphs worksheet",3),await mk("Very long file name for a mark scheme that goes on and on 2023 June Paper 2",2),await mk("Hashing notes",1)];
   out.add=await new Promise(r=>KOS.files.add(fs,{},(e,res)=>r(e?String(e):res&&res.map(x=>x.outcome||x.status))));
  }
 }catch(e){out.err=String(e)}
 // a picture
 const c=document.createElement('canvas');c.width=400;c.height=300;const g=c.getContext('2d');g.fillStyle='#c33';g.fillRect(50,50,300,200);
 const png=await new Promise(r=>c.toBlob(r,'image/png'));
 await new Promise(r=>KOS.files.add([new File([png],"whiteboard photo.png",{type:"image/png"})],{link:{kind:"topic",id:"compsci:4.10.1"}},()=>r()));
 out.files=KOS.files.all().length;
 return out;
})()
