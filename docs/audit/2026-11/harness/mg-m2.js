(async()=>{const routes=["#/money","#/money/transactions","#/money/budgets","#/money/recurring","#/money/pots","#/money/month","#/goals","#/goals/week","#/goals/month","#/goals/done"];const out={};const W=innerWidth;
for(const r of routes){location.hash=r;await new Promise(x=>setTimeout(x,1400));
const main=document.querySelector('#main');const res={sw:document.documentElement.scrollWidth>W+1?document.documentElement.scrollWidth:0,overflow:[],clipped:[],small:[],oval:[],tinyIcon:[]};
const els=[...main.querySelectorAll('*')];
for(const e of els){const b=e.getBoundingClientRect();if(!b.width||!b.height)continue;const cs=getComputedStyle(e);if(cs.visibility==='hidden')continue;
const name=(e.getAttribute('data-ui')||e.className||e.tagName).toString().slice(0,50)+':'+(e.textContent||'').trim().slice(0,30);
if(b.right>W+1&&!e.closest('.k-scroller,[data-scroll]'))res.overflow.push(name+' r='+Math.round(b.right));
if(e.children.length===0&&(cs.textOverflow==='ellipsis'||cs.overflow==='hidden')&&e.scrollWidth>e.clientWidth+1&&e.textContent.trim())res.clipped.push(name);
const inter=e.matches('button,a,input,select,[role=button],[role=tab],[tabindex="0"]');
if(inter&&(b.height<44||b.width<44)&&W<1100&&!e.matches('input[type=checkbox],input[type=radio]'))res.small.push(name+' '+Math.round(b.width)+'x'+Math.round(b.height));
if(cs.borderRadius.includes('50%')||parseFloat(cs.borderRadius)>=Math.min(b.width,b.height)/2&&parseFloat(cs.borderRadius)>4){if(Math.abs(b.width-b.height)>2&&Math.min(b.width,b.height)<60&&inter===false&&e.children.length<2&&b.width<80)res.oval.push(name+' '+Math.round(b.width)+'x'+Math.round(b.height));}
}
for(const k in res)if(Array.isArray(res[k])){res[k]=[...new Set(res[k])].slice(0,14)}
res.h=document.documentElement.scrollHeight;out[r]=res;}
return out})()
