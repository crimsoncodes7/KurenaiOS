/* KurenaiOS — tools/phone_overflow.mjs (Category 7 Phase A)
   Machine-measures phone-tier overflow. The phone tier wraps content in
   overflow:hidden, so document.scrollWidth never grows — clipped content is
   INVISIBLE to a scrollWidth check. This walks every element instead and
   reports the ones whose right edge is past the viewport, plus the bottom
   tab bar's overlap with the last content row.

   Start these two first:
     python3 -m http.server 8765
     chromium --headless=new --remote-debugging-port=9222 \
       --user-data-dir=/tmp/kos-cdp http://127.0.0.1:8765/index.html
   Then:
     node tools/phone_overflow.mjs [view ...]                             */
const endpoint = process.env.KOS_CDP || "http://127.0.0.1:9222/json";
const VIEWS = process.argv.slice(2).length ? process.argv.slice(2)
  : ["subject", "home", "focus", "governor", "assistant"];

const pages = await fetch(endpoint).then(r => r.json());
const page = pages.find(p => p.type === "page" && /127\.0\.0\.1:8765/.test(p.url)) || pages.find(p => p.type === "page");
if (!page) throw new Error("No debuggable KurenaiOS page found.");

const ws = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let seq = 0;
await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
ws.addEventListener("message", ev => {
  const msg = JSON.parse(String(ev.data));
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result || {});
  }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const out = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
  return out.result?.value;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

await send("Emulation.setDeviceMetricsOverride", {
  width: 390, height: 844, deviceScaleFactor: 3, mobile: true
});
/* The service worker precaches the app shell and serves statics
   stale-while-revalidate, so without this a run happily measures the CSS
   from before the edit you are trying to check. */
await evaluate(`(async () => {
  if (!navigator.serviceWorker) return "no service worker";
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map(r => r.unregister()));
  const keys = await caches.keys();
  await Promise.all(keys.map(k => caches.delete(k)));
  return "cleared " + regs.length + " registration(s), " + keys.length + " cache(s)";
})()`).then(m => console.log("service worker: " + m)).catch(() => {});
await send("Page.enable");
await send("Page.reload", { ignoreCache: true });
/* wait for the app, not a fixed guess: the boot chain is ~90 script tags */
for (let i = 0; i < 60; i++) {
  await sleep(500);
  const ok = await evaluate("document.readyState === 'complete' && typeof window.KOS === 'object' && !!KOS.show").catch(() => false);
  if (ok) break;
}
await sleep(1500);

const PROBE = `(() => {
  const vw = window.innerWidth;
  const out = [], cut = [];
  const label = n => n.tagName.toLowerCase() + (n.className && typeof n.className === "string"
    ? "." + n.className.trim().split(/\\s+/).slice(0,3).join(".") : "");
  /* A box whose right edge is past the viewport is a FAILURE whichever way
     it got there: #app is overflow-hidden so it is simply gone, and an
     ancestor with overflow-x:auto only converts it into a sideways scroll
     nobody discovers (that is how Papers 2–3 became unreachable). Both are
     the bug. The one honest exception is decoration — a negative-z layer
     with no text and nothing to click cannot be "unreachable content". */
  const decorative = n => {
    if (+getComputedStyle(n).zIndex >= 0) return false;
    if ((n.textContent || "").trim()) return false;
    return !n.querySelector("a, button, input, select, textarea, [tabindex]");
  };
  document.querySelectorAll("#app *").forEach(n => {
    const s = getComputedStyle(n);
    if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return;
    const r = n.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (r.right > vw + 0.5 && !decorative(n)) {
      out.push({ sel: label(n), over: Math.round(r.right - vw), w: Math.round(r.width) });
    }
    /* amputation: real text cut by a hidden-overflow box with no ellipsis.
       .sr-only is the visually-hidden pattern — clipped to 1px on purpose. */
    const text = (n.textContent || "").trim();
    if (text && n.children.length === 0 && /hidden|clip/.test(s.overflowX)
        && !n.classList.contains("sr-only")
        && n.scrollWidth > n.clientWidth + 1 && s.textOverflow !== "ellipsis") {
      cut.push({ sel: label(n), lost: n.scrollWidth - n.clientWidth, text: text.slice(0, 40) });
    }
  });
  out.sort((a, b) => b.over - a.over);
  cut.sort((a, b) => b.lost - a.lost);
  const main = document.getElementById("main");
  const rail = document.getElementById("rail");
  const rr = rail ? rail.getBoundingClientRect() : null;
  /* how far the LAST content row is hidden behind the fixed tab bar when
     scrolled to the very bottom */
  let overlap = null;
  if (main && rr) {
    main.scrollTop = main.scrollHeight;
    const kids = [...main.children];
    const last = kids[kids.length - 1];
    if (last) {
      const lr = last.getBoundingClientRect();
      overlap = Math.round(Math.max(0, lr.bottom - rr.top));
    }
    main.scrollTop = 0;
  }
  return { vw, docScrollWidth: document.documentElement.scrollWidth,
           mainScrollHeight: main ? main.scrollHeight : 0,
           nodes: document.querySelectorAll("#main *").length,
           imgs: document.querySelectorAll("#main img").length,
           tabBarTop: rr ? Math.round(rr.top) : null,
           tabBarH: rr ? Math.round(rr.height) : null,
           overlap, count: out.length, worst: out.slice(0, 6),
           cutCount: cut.length, cutWorst: cut.slice(0, 6) };
})()`;

const results = {};
for (const view of VIEWS) {
  try {
    await evaluate(`KOS.show(${JSON.stringify(view)}${view === "subject" ? ', "compsci"' : ""})`);
  } catch (e) { console.log(`  ${view}: could not open — ${e.message}`); continue; }
  await sleep(1200);
  const r = await evaluate(PROBE);
  results[view] = r;
  console.log(`\n${view}  —  ${r.count} overflowing element(s)`
    + `   docScrollWidth ${r.docScrollWidth} / vw ${r.vw}`
    + `   #main scrollHeight ${r.mainScrollHeight}px, ${r.nodes} nodes, ${r.imgs} imgs`
    + `\n        tab bar top ${r.tabBarTop} h ${r.tabBarH}, last-row overlap ${r.overlap}px`);
  r.worst.forEach(w => console.log(`        SPILL +${w.over}px  ${w.sel}  (w ${w.w})`));
  if (r.cutCount) console.log(`        ${r.cutCount} amputated text node(s):`);
  r.cutWorst.forEach(c => console.log(`        CUT -${c.lost}px  ${c.sel}  "${c.text}"`));
}

console.log("\n--- summary ---");
for (const [v, r] of Object.entries(results)) {
  console.log(`${v.padEnd(12)} overflowing ${String(r.count).padStart(4)}   amputated text ${String(r.cutCount).padStart(3)}   tab-bar overlap ${String(r.overlap).padStart(4)}px`);
}
ws.close();
