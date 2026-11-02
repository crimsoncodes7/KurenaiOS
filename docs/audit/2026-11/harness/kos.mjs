#!/usr/bin/env node
/* QA harness for the KurenaiOS audit. One "slot" n = its own dev server
   (port 9100+n) and its own headless Chrome (CDP 9300+n, profile
   /tmp/kosqa-<n>), so each slot is an isolated origin with its own storage.

   node kos.mjs start <n>                 start server + chrome (idempotent)
   node kos.mjs stop <n>
   node kos.mjs seed <n>                  seed the dense sample account (responsive_audit's seeder)
   node kos.mjs reset <n>                 wipe storage (empty account) and reload
   node kos.mjs shot <n> <route> <size> <out.png> [opts]
        route: a hash like "#/money" or "-" to stay where you are
        size:  mac | ipad | ipadl | iphone | WxH
        opts:  --theme <id>  --full (whole page)  --wait <ms>  --js "<code run before the shot>"
   node kos.mjs eval <n> "<js expression>" [--size mac]   prints JSON result (awaits promises)
   node kos.mjs errors <n>                console errors/exceptions seen since start of this call's page
   Devices (CSS px): mac 1470x832 (MacBook Air 13" M4, Chrome viewport), ipad 820x1180 / ipadl 1180x820
   (iPad Air 11" M4), iphone 402x874 (iPhone 17; Safari viewport ~402x760). */
import { spawn, execSync } from "node:child_process";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const ROOT = "/Users/fj/Developer/KurenaiOS - Web";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [cmd, nStr, ...rest] = process.argv.slice(2);
const n = Number(nStr || 0);
const HTTP = 9100 + n, CDP = 9300 + n;
const URL0 = `http://127.0.0.1:${HTTP}/index.html`;
const SIZES = { mac: [1470, 832], ipad: [820, 1180], ipadl: [1180, 820], iphone: [402, 874], iphonesafari: [402, 760] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const opt = (name, d = null) => { const i = rest.indexOf("--" + name); return i < 0 ? d : (rest[i + 1] && !rest[i + 1].startsWith("--") ? rest[i + 1] : true); };

async function up(url) { try { const r = await fetch(url); return r.ok; } catch { return false; } }

async function start() {
  if (!await up(`http://127.0.0.1:${HTTP}/index.html`)) {
    spawn("python3", ["tools/dev_server.py", String(HTTP)], { cwd: ROOT, detached: true, stdio: "ignore" }).unref();
  }
  if (!await up(`http://127.0.0.1:${CDP}/json/version`)) {
    spawn(CHROME, ["--headless=new", `--remote-debugging-port=${CDP}`, `--user-data-dir=/tmp/kosqa-${n}`,
      "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", "--window-size=1470,832", URL0],
      { detached: true, stdio: "ignore" }).unref();
  }
  for (let i = 0; i < 120; i++) { if (await up(`http://127.0.0.1:${CDP}/json/version`) && await up(URL0)) break; await sleep(500); }
  const c = await connect();
  await bootWait(c);
  console.log(`slot ${n} ready: ${URL0} (CDP ${CDP})`);
  c.close();
}

async function connect() {
  const pages = await fetch(`http://127.0.0.1:${CDP}/json`).then(r => r.json());
  let page = pages.find(p => p.type === "page" && p.url.includes(`:${HTTP}/`)) || pages.find(p => p.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map(); let seq = 0; const logs = [];
  await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
  ws.addEventListener("message", ev => {
    const m = JSON.parse(String(ev.data));
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result || {}); }
    else if (m.method === "Runtime.exceptionThrown") logs.push("EXC " + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).slice(0, 400));
    else if (m.method === "Runtime.consoleAPICalled" && (m.params.type === "error" || m.params.type === "warning")) logs.push(m.params.type + " " + m.params.args.map(a => a.value ?? a.description ?? "").join(" ").slice(0, 400));
  });
  const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expr => {
    const o = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true, userGesture: true });
    if (o.exceptionDetails) throw new Error(o.exceptionDetails.exception?.description || o.exceptionDetails.text);
    return o.result?.value;
  };
  await send("Runtime.enable"); await send("Page.enable");
  return { send, evaluate, logs, close: () => ws.close() };
}
async function bootWait(c) {
  for (let i = 0; i < 100; i++) {
    const ok = await c.evaluate("document.readyState==='complete'&&typeof KOS==='object'&&!!KOS.show&&!!KOS.store").catch(() => false);
    if (ok) { await sleep(800); return true; }
    await sleep(300);
  }
  throw new Error("app did not boot");
}
async function setSize(c, size, touch) {
  const [w, h] = SIZES[size] || String(size).split("x").map(Number);
  const mobile = w < 1000 && size !== "mac";
  await c.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: Number(opt("dpr", 1)), mobile });
  const t = touch ?? (size === "ipad" || size === "ipadl" || size === "iphone" || size === "iphonesafari");
  await c.send("Emulation.setTouchEmulationEnabled", { enabled: !!t, maxTouchPoints: t ? 5 : 1 });
  await c.send("Emulation.setEmulatedMedia", { features: t ? [{ name: "hover", value: "none" }, { name: "pointer", value: "coarse" }] : [{ name: "hover", value: "hover" }, { name: "pointer", value: "fine" }] });
  return [w, h];
}

async function main() {
  if (cmd === "start") return start();
  if (cmd === "stop") { try { execSync(`pkill -f "remote-debugging-port=${CDP}"`); } catch {} try { execSync(`pkill -f "dev_server.py ${HTTP}"`); } catch {} return; }
  const c = await connect();
  try {
    if (cmd === "seed") {
      c.close();
      execSync(`node tools/responsive_audit.mjs --seed --views home --sizes 1470x832 --themes atelier-dusk --out /tmp/kosqa-seed-${n}.json`,
        { cwd: ROOT, env: { ...process.env, KOS_CDP: `http://127.0.0.1:${CDP}/json` }, stdio: "inherit" });
      return;
    }
    if (cmd === "reset") {
      await c.evaluate(`(async()=>{localStorage.clear();sessionStorage.clear();const dbs=await indexedDB.databases();await Promise.all(dbs.map(d=>new Promise(r=>{const q=indexedDB.deleteDatabase(d.name);q.onsuccess=q.onerror=q.onblocked=()=>r()})));const regs=await navigator.serviceWorker?.getRegistrations()||[];await Promise.all(regs.map(r=>r.unregister()));for(const k of await caches.keys())await caches.delete(k);return dbs.length})()`);
      await c.send("Page.navigate", { url: URL0 }); await sleep(800); await bootWait(c); console.log("reset ok"); return;
    }
    if (cmd === "shot") {
      const [route, size, out] = rest;
      const [w, h] = await setSize(c, size);
      const theme = opt("theme");
      if (theme) await c.evaluate(`document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)})`);
      if (route && route !== "-") {
        await c.evaluate(`(location.hash===${JSON.stringify(route)}?KOS.rerender&&KOS.rerender():location.hash=${JSON.stringify(route)}, true)`);
      }
      await sleep(Number(opt("wait", 1400)));
      const js = opt("js"); if (js) { console.log("js:", JSON.stringify(await c.evaluate(js))); await sleep(700); }
      const full = !!opt("full");
      let clip;
      if (full) { const H = await c.evaluate("Math.max(document.documentElement.scrollHeight, (document.querySelector('#main')||document.body).scrollHeight)"); await c.send("Emulation.setDeviceMetricsOverride", { width: w, height: Math.min(H, 6000), deviceScaleFactor: 1, mobile: w < 1000 }); await sleep(600); }
      const shot = await c.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false, clip });
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, Buffer.from(shot.data, "base64"));
      console.log("saved", out, c.logs.length ? "\nconsole:\n" + c.logs.join("\n") : "");
      return;
    }
    if (cmd === "eval") {
      const size = opt("size"); if (size) await setSize(c, size);
      const v = await c.evaluate(rest[0]); await sleep(200);
      console.log(JSON.stringify(v, null, 1)?.slice(0, 20000));
      if (c.logs.length) console.log("console:\n" + c.logs.join("\n"));
      return;
    }
    console.log("unknown command");
  } finally { c.close(); }
}
main().then(() => process.exit(0), e => { console.error("ERR", e.message); process.exit(1); });
