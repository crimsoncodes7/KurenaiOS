/* KurenaiOS — tools/mobile_audit.mjs (Build 4b)
   Phone/tablet layout audit over CDP. Start the two long-running commands:
     python3 -m http.server 8765
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --remote-debugging-port=9222 \
       --user-data-dir=/tmp/kos-mobile-audit http://127.0.0.1:8765/index.html
   Then: node tools/mobile_audit.mjs
   For every major view at iPhone (390×844 @3x) and iPad (820×1180 @2x)
   metrics it reports document-level horizontal overflow and the widest
   offending elements, and writes screenshots to /tmp/kos-mobile/.        */
import { writeFile, mkdir } from "node:fs/promises";

const endpoint = process.env.KOS_CDP || "http://127.0.0.1:9222/json";
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

const DEVICES = [
  { name: "iphone", width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
  { name: "ipad", width: 820, height: 1180, deviceScaleFactor: 2, mobile: true }
];
const VIEWS = [
  ["home", null], ["subject", "compsci"], ["ref", "FIRSTLEAF"], ["review", null],
  ["focus", null], ["calendar", null], ["tasks", null], ["tracker", null],
  ["matrix", null], ["anime", null], ["books", null], ["vn", null], ["game", null],
  ["shrine", null], ["wishlist", null], ["goals", null], ["mediasync", null],
  ["aniprofile", null], ["vndbprofile", null], ["governor", null],
  ["data", null], ["help", null], ["personaldeck", null]
];
const SCREENSHOT = new Set(["home", "subject", "ref", "governor", "matrix", "wishlist", "data", "help", "calendar", "review", "game"]);

await mkdir("/tmp/kos-mobile", { recursive: true });
const findings = [];

const OVERFLOW_PROBE = `(() => {
  const iw = window.innerWidth;
  const docOver = Math.max(0, document.documentElement.scrollWidth - iw);
  const bad = [];
  if (docOver > 1) {
    for (const el of document.querySelectorAll("#main *, #topbar *, #subnav *")) {
      const r = el.getBoundingClientRect();
      if (r.width > 5 && (r.right > iw + 4 || r.left < -4) && !bad.some(b => el.contains(b.node))) {
        const path = [];
        let n = el;
        while (n && n.id !== "main" && path.length < 4) { path.unshift(n.className ? n.tagName.toLowerCase() + "." + String(n.className).split(" ")[0] : n.tagName.toLowerCase()); n = n.parentElement; }
        bad.push({ sel: path.join(">"), right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) });
        if (bad.length >= 4) break;
      }
    }
  }
  return { iw, docOver, bad: bad.map(({sel,right,left,w}) => ({sel,right,left,w})) };
})()`;

for (const dev of DEVICES) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: dev.width, height: dev.height, deviceScaleFactor: dev.deviceScaleFactor, mobile: dev.mobile
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: dev.mobile });
  await evaluate("location.reload(), 'reloading'");
  await sleep(2500);
  console.log(`== ${dev.name} ${dev.width}×${dev.height} ==`);
  for (const [view, arg] of VIEWS) {
    try {
      const nav = await evaluate(`(() => {
        if (!KOS.views["${view}"]) return "missing";
        let arg = ${JSON.stringify(arg)};
        if (arg === "FIRSTLEAF") {
          const walk = n => n.content && n.content.length ? n : (n.children || []).map(walk).find(Boolean);
          const leaf = KOS_DATA.compsci.sections.map(walk).find(Boolean);
          arg = { subject: "compsci", ref: leaf.ref };
        } else if ("${view}" === "subject") arg = "compsci";
        KOS.show("${view}", arg);
        return "ok";
      })()`);
      if (nav === "missing") { console.log(`  -    ${view}: no such view`); continue; }
      await sleep(600);
      const probe = await evaluate(OVERFLOW_PROBE);
      const status = probe.docOver > 1 ? `OVERFLOW +${probe.docOver}px ${JSON.stringify(probe.bad)}` : "ok";
      console.log(`  ${probe.docOver > 1 ? "!!" : "ok"}   ${view}: ${status}`);
      if (probe.docOver > 1) findings.push({ dev: dev.name, view, over: probe.docOver, bad: probe.bad });
      if (dev.name === "iphone" && SCREENSHOT.has(view)) {
        const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
        await writeFile(`/tmp/kos-mobile/${dev.name}-${view}.jpg`, Buffer.from(shot.data, "base64"));
      }
    } catch (e) {
      console.log(`  ERR  ${view}: ${e.message}`);
      findings.push({ dev: dev.name, view, error: e.message });
    }
  }
}

/* drawer + sheet states on the phone */
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await evaluate(`KOS.show("subject", "compsci"), "ok"`);
await sleep(500);
await evaluate(`(KOS.store.state.ui.treeClosed = false, KOS.store.save(), document.getElementById("cols").classList.remove("tree-closed"), "open")`);
await sleep(400);
let shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
await writeFile("/tmp/kos-mobile/iphone-tree-drawer.jpg", Buffer.from(shot.data, "base64"));
await evaluate(`(KOS.store.state.ui.treeClosed = true, document.getElementById("cols").classList.add("tree-closed"), "closed")`);
await evaluate(`(KOS.ui.confirm({ title: "Sheet check", body: "This confirm renders as a bottom sheet on phones.", confirm: "Looks right" }, () => {}), "confirm-open")`);
await sleep(400);
shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
await writeFile("/tmp/kos-mobile/iphone-confirm-sheet.jpg", Buffer.from(shot.data, "base64"));
await evaluate(`(document.querySelector(".confirm-ov .btn:not(.primary), .confirm-ov button")?.click(), "closed")`);

console.log("");
if (findings.length) {
  console.log("FINDINGS (" + findings.length + "):");
  findings.forEach(f => console.log("  - " + JSON.stringify(f)));
} else {
  console.log("No horizontal overflow detected on any audited view.");
}
console.log("screenshots → /tmp/kos-mobile/");
ws.close();
