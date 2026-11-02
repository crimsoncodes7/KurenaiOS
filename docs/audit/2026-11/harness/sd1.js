(async function(){var w=t=>new Promise(r=>setTimeout(r,t));var out={};var q=s=>document.querySelector(s);
KOS.show('ref',{subject:'compsci',ref:'4.5.2.1'});await w(500);
q('[data-tab=quiz]').click();await w(400);
for(var i=0;i<2;i++){var o=q('[data-ui~="quiz.option"]');if(o)o.click();await w(150);var n=q('[data-ui~="quiz.next"]');if(n)n.click();await w(150);}
out.quizBefore=q('[data-ui~="quiz.counter"]').textContent;KOS.rerender();await w(400);out.quizTab=(q('[role=tab][aria-selected=true]')||{}).dataset;out.quizAfter=q('[data-ui~="quiz.counter"]').textContent;
q('[data-tab=exam]')&&q('[data-tab=exam]').click();await w(400);
var nb=q('[data-ui~="quiz.next"]');if(nb){nb.click();nb.click();}await w(200);out.examBefore=(q('[data-ui~="quiz.counter"]')||{}).textContent;
var ta=q('[data-ui~="study.panel"] textarea');if(ta){ta.value='my typed answer';ta.dispatchEvent(new Event('input',{bubbles:true}));}
out.examTA=!!ta;KOS.rerender();await w(400);out.examAfter=(q('[data-ui~="quiz.counter"]')||{}).textContent;var ta2=q('[data-ui~="study.panel"] textarea');out.examTAAfter=ta2&&ta2.value;
return JSON.stringify(out);})()
