(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var q=s=>document.querySelector(s);
KOS.show('ref',{subject:'compsci',ref:'4.5.4.3'});await w(600);q('[data-tab=cards]').click();await w(400);q('[data-ui~="fc.card"]').click();await w(200);
var rr=q('[data-ui~="fc.rate"]');rr.scrollIntoView({block:'end'});await w(200);
KOS.ui.toast('Reminder done · something long enough to wrap maybe here',false,{label:'Undo',run:function(){}});await w(400);
var t=q('#toast').getBoundingClientRect();var r=rr.getBoundingClientRect();var tb=q('[data-ui~="shell.tabbar"], .k-tabbar, nav.k-mtabs');var tr=tb&&tb.getBoundingClientRect();
var ov=!(t.right<r.left||t.left>r.right||t.bottom<r.top||t.top>r.bottom);
return JSON.stringify({toast:[t.left,t.top,t.width,t.height].map(Math.round),rate:[r.left,r.top,r.width,r.height].map(Math.round),overlap:ov,pe:getComputedStyle(q('#toast')).pointerEvents,tab:tr&&[tr.top,tr.height].map(Math.round),vh:innerHeight});})()
