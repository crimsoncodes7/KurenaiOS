(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);
KOS.show('ref',{subject:'compsci',ref:'4.5.2.1'});await w(600);
var m=document.getElementById('main');out.main={sh:m.scrollHeight,ch:m.clientHeight,ov:getComputedStyle(m).overflowY};var se=document.scrollingElement;out.doc={sh:se.scrollHeight,ch:se.clientHeight};
var sc=[].slice.call(document.querySelectorAll('*')).filter(e=>e.scrollHeight>e.clientHeight+50&&/auto|scroll/.test(getComputedStyle(e).overflowY)).map(e=>(e.id||'')+'.'+(e.className||'').toString().slice(0,40)+' '+e.scrollHeight+'/'+e.clientHeight);out.scrollers=sc;
m.scrollTop=900;await w(100);out.st1=m.scrollTop;KOS.rerender();await w(300);out.st2=m.scrollTop;
// due today
KOS.show('due');await w(600);var st=q('[data-ui~="fc.card"]');out.dueHas=!!st;if(st){var f=()=>q('[data-ui~="fc.front"]').textContent.slice(0,50);out.d0=f();for(var i=0;i<3;i++){q('[data-ui~="fc.card"]').click();await w(100);q('[data-ui~="fc.r"][data-rate="2"]').click();await w(200);}out.d3=f();out.d3life=q('[data-ui~="fc.life"]').textContent;KOS.rerender();await w(500);out.dAfter=f();out.dAfterLife=q('[data-ui~="fc.life"]').textContent;}
return JSON.stringify(out);})()
