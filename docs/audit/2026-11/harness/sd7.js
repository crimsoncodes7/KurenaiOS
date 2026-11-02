(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);
KOS.show('assignments');await w(800);var add=[].slice.call(document.querySelectorAll('#main button')).find(b=>/new|add/i.test(b.textContent));out.add=add&&add.textContent.trim();add.focus();add.click();await w(500);
var dlg=q('[role=dialog]');out.dlg=!!dlg;var inp=dlg&&dlg.querySelector('input');if(inp){inp.value='Typed title';inp.dispatchEvent(new Event('input',{bubbles:true}));}
KOS.rerender();await w(400);var d2=q('[role=dialog]');out.dlgAfter=!!d2;out.inpAfter=d2&&d2.querySelector('input').value;out.openerConnected=add.isConnected;
var cancel=[].slice.call(d2.querySelectorAll('button')).find(b=>/cancel/i.test(b.textContent));cancel&&cancel.click();await w(400);
out.focusAfterClose=document.activeElement&&(document.activeElement.id||document.activeElement.tagName);
return JSON.stringify(out);})()
