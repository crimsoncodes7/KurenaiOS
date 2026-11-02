(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);
KOS.show('ref',{subject:'compsci',ref:'4.5.4.3'});await w(600);var nx=q('[aria-label="Next note page"]');nx.click();nx.click();nx.click();await w(200);
out.before=q('[data-ui~="topic.note-count"]').textContent;out.due=JSON.stringify(KOS.dayReview.due&&KOS.dayReview.due(new Date()));
try{KOS.reviewSheet.open((KOS.dayReview.due(new Date())||{}).slot||'evening');}catch(e){out.err=String(e)}await w(800);out.open=KOS.reviewSheet.isOpen();
KOS.reviewSheet.close();await w(500);out.after=(q('[data-ui~="topic.note-count"]')||{}).textContent;
return JSON.stringify(out);})()
