(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);
KOS.show('home');await w(800);
var bell=q('#notify-mount button');bell.click();await w(300);var menuSel='[role=menu],[data-ui~="ui.menu-panel"],.k-menu-panel';out.menuOpen=!!q(menuSel);out.menuCls=(q(menuSel)||{}).className;
KOS.rerender();await w(300);out.menuAfter=!!q(menuSel);
// dialog: open calendar add event
KOS.show('calendar');await w(800);var add=[].slice.call(document.querySelectorAll('#main button, header button')).find(b=>/add|new event|\+/i.test(b.textContent));out.addBtn=add&&add.textContent.trim();if(add){add.focus();add.click();await w(500);var dlg=q('[role=dialog]');out.dlg=!!dlg;var inp=dlg&&dlg.querySelector('input[type=text],input:not([type])');if(inp){inp.value='Typed title';inp.dispatchEvent(new Event('input',{bubbles:true}));}
KOS.rerender();await w(400);var d2=q('[role=dialog]');out.dlgAfter=!!d2;out.inpAfter=d2&&(d2.querySelector('input[type=text],input:not([type])')||{}).value;
document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await w(400);out.dlgClosed=!q('[role=dialog]');out.focusAfterClose=document.activeElement&&(document.activeElement.id||document.activeElement.tagName+'.'+document.activeElement.className);out.openerConnected=add.isConnected;}
return JSON.stringify(out);})()
