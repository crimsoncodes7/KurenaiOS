(async (routes) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const out = {};
  for (const r of routes) {
    location.hash = r; await sleep(1200);
    const main = document.querySelector('#main'); const res = { errs: [] };
    const mw = main.getBoundingClientRect();
    res.mainW = Math.round(mw.width); res.scrollW = document.documentElement.scrollWidth; res.vw = innerWidth;
    const issues = [];
    main.querySelectorAll('*').forEach(e => {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const b = e.getBoundingClientRect(); if (!b.width || !b.height) return;
      const id = (e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName) + (e.getAttribute('data-ui') ? '[' + e.getAttribute('data-ui') + ']' : '');
      const txt = (e.innerText || '').trim().slice(0, 40);
      // overflow out of viewport
      if (b.right > innerWidth + 1 && !e.closest('.k-scroller,[data-ui="ui.scroller"]') ) issues.push(['offright', id, Math.round(b.right), txt]);
      // text clipped
      if ((cs.overflow.includes('hidden') || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 2 && e.children.length < 3 && txt) issues.push(['clipX', id, e.scrollWidth + '>' + e.clientWidth, txt]);
      if (cs.overflowY === 'hidden' && e.scrollHeight > e.clientHeight + 2 && txt && e.clientHeight > 0) issues.push(['clipY', id, e.scrollHeight + '>' + e.clientHeight, txt]);
      // circles
      if (parseFloat(cs.borderTopLeftRadius) >= Math.min(b.width, b.height) / 2 - 1 && Math.abs(b.width - b.height) > 2 && b.width < 64 && b.height < 64 && cs.borderTopLeftRadius.indexOf('%') < 0 && parseFloat(cs.borderTopLeftRadius) < 500 && Math.min(b.width,b.height) > 10 && !txt) issues.push(['oval', id, Math.round(b.width) + 'x' + Math.round(b.height)]);
      // touch targets
      if ((e.tagName === 'BUTTON' || e.tagName === 'A' || e.getAttribute('role') === 'button' || e.tagName==='SELECT' || (e.tagName==='INPUT'&&e.type!=='hidden')) && (b.height < 44 || b.width < 44) && matchMedia('(pointer:coarse)').matches) issues.push(['touch', id, Math.round(b.width) + 'x' + Math.round(b.height), txt]);
    });
    // overlapping siblings text
    const texts = [...main.querySelectorAll('h1,h2,h3,h4,p,span,strong,button,a,li,label')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && e.children.length === 0 && e.innerText.trim(); });
    for (let i = 0; i < texts.length && i < 600; i++) for (let j = i + 1; j < texts.length && j < 600; j++) {
      const a = texts[i].getBoundingClientRect(), c = texts[j].getBoundingClientRect();
      if (texts[i].contains(texts[j]) || texts[j].contains(texts[i])) continue;
      const ox = Math.min(a.right, c.right) - Math.max(a.left, c.left), oy = Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top);
      if (ox > 4 && oy > 4) issues.push(['overlap', texts[i].innerText.trim().slice(0, 25), texts[j].innerText.trim().slice(0, 25)]);
    }
    const counts = {}; res.issues = issues.filter(x => { const k = x[0] + x[1]; counts[k] = (counts[k] || 0) + 1; return counts[k] <= 3; });
    res.h1 = (main.querySelector('h1') || {}).innerText;
    out[r] = res;
  }
  return out;
})
