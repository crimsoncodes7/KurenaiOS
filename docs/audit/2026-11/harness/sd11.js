(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var q=s=>document.querySelector(s);var out={};
KOS.show('ref',{subject:'compsci',ref:'4.5.4.3'});await w(600);var t=q('[data-tab=ink]');out.inkTab=!!t;if(t){t.click();await w(800);}
var side=[].slice.call(document.querySelectorAll('#main button,[role=radio]')).find(b=>/side by side/i.test(b.textContent));out.side=!!side;if(side){side.click();await w(1000);}
var sc=[].slice.call(document.querySelectorAll('#main *')).filter(e=>e.scrollHeight>e.clientHeight+80&&/auto|scroll/.test(getComputedStyle(e).overflowY));out.scrollers=sc.map(e=>(e.getAttribute('data-ui')||e.className)+' '+e.scrollHeight+'/'+e.clientHeight);
sc.forEach(e=>e.scrollTop=600);await w(200);out.before=sc.map(e=>e.scrollTop);KOS.rerender();await w(1200);
var sc2=[].slice.call(document.querySelectorAll('#main *')).filter(e=>e.scrollHeight>e.clientHeight+80&&/auto|scroll/.test(getComputedStyle(e).overflowY));out.after=sc2.map(e=>(e.getAttribute('data-ui')||e.className)+' '+e.scrollTop);
return JSON.stringify(out);})()
