(()=>{const ids=KOS.governor.catalog().filter(c=>c.kind==='theme').map(c=>c.theme);
const cv=document.createElement('canvas');cv.width=cv.height=1;const ctx=cv.getContext('2d',{willReadFrequently:true});
const probe=document.createElement('div');document.body.appendChild(probe);
function rgb(css){ctx.clearRect(0,0,1,1);ctx.fillStyle='#000';ctx.fillStyle=css;ctx.fillRect(0,0,1,1);const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2]]}
function lum(c){const a=c.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2]}
function cr(a,b){const l1=lum(a),l2=lum(b);return +( (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2)}
const toks=['--bg','--s1','--s2','--text','--text-2','--muted','--crimson','--crimson-ink','--teal','--gold','--line','--cs','--maths','--it','--alarm'];
const prev=document.documentElement.getAttribute('data-theme');const sb=document.body.getAttribute('data-theme');document.body.removeAttribute('data-theme');const out={};
for(const id of ids){document.documentElement.setAttribute('data-theme',id);const v={};for(const t of toks){probe.style.color='var('+t+')';v[t]=rgb(getComputedStyle(probe).color)}
out[id]={textOnS1:cr(v['--text'],v['--s1']),text2OnS1:cr(v['--text-2'],v['--s1']),mutedOnS1:cr(v['--muted'],v['--s1']),mutedOnBg:cr(v['--muted'],v['--bg']),btn:cr(v['--crimson-ink'],v['--crimson']),accentOnS1:cr(v['--crimson'],v['--s1']),tealOnS1:cr(v['--teal'],v['--s1']),goldOnS1:cr(v['--gold'],v['--s1']),lineOnS1:cr(v['--line'],v['--s1']),s1vsBg:cr(v['--s1'],v['--bg']),alarmOnS1:cr(v['--alarm'],v['--s1']),csOnS1:cr(v['--cs'],v['--s1']),bg:v['--bg'].join(','),accent:v['--crimson'].join(',')}}
document.documentElement.setAttribute('data-theme',prev||'');document.body.setAttribute('data-theme',sb||'');probe.remove();return out})()
