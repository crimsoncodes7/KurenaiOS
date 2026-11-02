(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};
KOS.show('ref',{subject:'compsci',ref:'4.5.2.1'});await w(600);
var s=document.getElementById('stage');s.scrollTop=900;await w(100);out.st1=s.scrollTop;KOS.rerender();await w(300);out.st2=s.scrollTop;
KOS.show('home');await w(800);s.scrollTop=700;await w(100);out.h1=s.scrollTop;KOS.rerender();await w(500);out.h2=s.scrollTop;
KOS.show('anime');await w(1500);s.scrollTop=1500;await w(200);out.a1=s.scrollTop;out.cards1=document.querySelectorAll('#main [data-ui~="vault.card"], #main .k-vcard').length;KOS.rerender();await w(1500);out.a2=s.scrollTop;out.cards2=document.querySelectorAll('#main [data-ui~="vault.card"], #main .k-vcard').length;
return JSON.stringify(out);})()
