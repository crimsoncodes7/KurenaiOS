(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);
KOS.show('ref',{subject:'code',ref:'1.1'});await w(1000);
var eds=[].slice.call(document.querySelectorAll('#main textarea'));out.n=eds.length;out.where=eds.map(e=>{var p=e.closest('[data-ui]');return p&&p.getAttribute('data-ui')});
eds.forEach((ed,i)=>{ed.value=ed.value+'\n// typed'+i;ed.dispatchEvent(new Event('input',{bubbles:true}));});await w(900);
KOS.rerender();await w(900);out.kept=[].slice.call(document.querySelectorAll('#main textarea')).map(e=>/\/\/ typed/.test(e.value));
// tasks tab?
var tabs=[].slice.call(document.querySelectorAll('[role=tab]')).map(t=>t.dataset.tab);out.tabs=tabs;
return JSON.stringify(out);})()
