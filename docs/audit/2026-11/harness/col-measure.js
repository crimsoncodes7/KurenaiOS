window.__meas = function(){
  const out={hash:location.hash,vw:innerWidth,docOverflow:document.documentElement.scrollWidth-innerWidth,issues:[]};
  const touch=matchMedia('(pointer:coarse)').matches;
  const desc=e=>{const r=e.getBoundingClientRect();return (e.dataset.ui||e.tagName.toLowerCase()+'.'+(e.className+'').split(' ')[0])+' "'+(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,30).replace(/\n/g,' ')+'" '+Math.round(r.x)+','+Math.round(r.y)+' '+Math.round(r.width)+'x'+Math.round(r.height)};
  const root=document.querySelector('#main')||document.body;
  const all=[...root.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden'});
  for(const e of all){
    const cs=getComputedStyle(e); const r=e.getBoundingClientRect();
    if(r.right>innerWidth+1 && !e.closest('.k-scroller,[data-scroll],[style*="overflow"]')){ let p=e.parentElement,sc=false; while(p){const o=getComputedStyle(p).overflowX; if(o==='auto'||o==='scroll'||o==='hidden'){sc=true;break} p=p.parentElement} if(!sc) out.issues.push('OFFRIGHT '+desc(e)); }
    if((cs.overflow==='hidden'||cs.overflowX==='hidden') && e.scrollWidth>e.clientWidth+2 && e.children.length===0 && cs.textOverflow!=='ellipsis' && e.innerText) out.issues.push('CLIP '+desc(e)+' sw'+e.scrollWidth);
    if(cs.textOverflow==='ellipsis' && e.scrollWidth>e.clientWidth+1) out.issues.push('ELLIP '+desc(e));
    const br=parseFloat(cs.borderTopLeftRadius); if(br>0 && br>=Math.min(r.width,r.height)/2-1 && Math.abs(r.width-r.height)>2 && r.width<80 && r.height<80 && e.children.length<=1 && !(e.innerText||'').trim().length>3) out.issues.push('OVAL '+desc(e));
    if(e.matches('button,a[href],[role=button],[role=tab],input,select,summary') && touch){ if((r.height<43.5||r.width<24) && !e.closest('.k-cal')) out.issues.push('SMALL '+desc(e)); }
    if(e.matches('button,[role=button]') && r.width>=32){ const svg=e.querySelector('svg'); if(svg && e.innerText.trim()===''){const s=svg.getBoundingClientRect(); if(s.width<r.width*0.3) out.issues.push('TINYICON '+desc(e)+' icon '+Math.round(s.width)); const cx=s.x+s.width/2-(r.x+r.width/2), cy=s.y+s.height/2-(r.y+r.height/2); if(Math.abs(cx)>1.5||Math.abs(cy)>1.5) out.issues.push('OFFCENTRE '+desc(e)+' d '+cx.toFixed(1)+','+cy.toFixed(1));} }
  }
  // dead space: main children
  const m=document.querySelector('#main'); if(m){const mr=m.getBoundingClientRect(); out.main=[Math.round(mr.width),m.scrollHeight]; }
  out.issues=[...new Set(out.issues)].slice(0,60);
  return out;
};
