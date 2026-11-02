(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);var txt=()=>(document.getElementById('main').innerText||'').slice(0,160).replace(/\s+/g,' ');
location.hash='#/japanese/session/reviews';await w(1200);out.ja0=txt();
var b=[].slice.call(document.querySelectorAll('#main button')).filter(x=>/start|begin|check|continue|next/i.test(x.textContent)).map(x=>x.textContent.trim()).slice(0,6);out.jaBtns=b;
// code lesson: find a code lesson ref
var lessons=Object.keys(KOS_CONTENT).filter(k=>k.indexOf('code:')===0);out.codeKey=lessons[0];
var ref=lessons[0].split(':')[1];KOS.show('ref',{subject:'code',ref:ref});await w(1000);
var ed=q('#main textarea, #main [contenteditable=true]');out.codeEditor=ed?ed.tagName:null;
if(ed&&ed.tagName==='TEXTAREA'){ed.value=ed.value+'\n// typed';ed.dispatchEvent(new Event('input',{bubbles:true}));KOS.rerender();await w(800);var ed2=q('#main textarea');out.codeKept=ed2&&/\/\/ typed/.test(ed2.value);}
return JSON.stringify(out);})()
