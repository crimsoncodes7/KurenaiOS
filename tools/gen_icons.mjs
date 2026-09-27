/* KurenaiOS — tools/gen_icons.mjs
   Renders the icon set from the header's own mark: the bloom
   (assets/brand/kurenai-bloom.png) on the Graphite ground (--bg), via
   headless Chrome canvas — no image dependencies. Start Chrome first:

     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --remote-debugging-port=9223 \
       --user-data-dir=/tmp/kos-icon-gen about:blank

   Then: node tools/gen_icons.mjs   (KOS_CDP=<json endpoint> for another port)
   Writes icons/icon-192.png and icon-512.png (a rounded Graphite tile),
   icon-maskable-512.png (full bleed, the bloom inside the 80% safe zone),
   apple-touch-icon.png (180, full bleed: iOS rounds it) and favicon.svg
   (the bloom alone, as the header draws it). The source is 265px, so the
   bloom is never drawn much above its own size. */
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const endpoint = process.env.KOS_CDP || "http://127.0.0.1:9223/json";
const pages = await fetch(endpoint).then(r => r.json());
const page = pages.find(p => p.type === "page");
if (!page) throw new Error("No debuggable page found.");

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

const BLOOM = (await readFile(resolve(ROOT, "assets/brand/kurenai-bloom.png"))).toString("base64");

/* kind: "tile" (rounded, transparent corners), "bleed" (square ground, the
   platform masks it), "mark" (no ground). fill: the bloom's share of the edge. */
async function draw(size, kind, fill) {
  const expr = `(async () => {
    const S = ${size}, kind = ${JSON.stringify(kind)}, fill = ${fill};
    const img = new Image();
    img.src = "data:image/png;base64,${BLOOM}";
    await img.decode();
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    /* Graphite --bg, lifted toward --s1 at the centre */
    const ground = () => {
      const grad = g.createRadialGradient(S / 2, S * 0.45, 0, S / 2, S / 2, S * 0.72);
      grad.addColorStop(0, "#23262d"); grad.addColorStop(1, "#16181d");
      g.fillStyle = grad;
    };
    if (kind === "bleed") { ground(); g.fillRect(0, 0, S, S); }
    if (kind === "tile") {
      const m = S * 0.04, r = S * 0.22, w = S - 2 * m;
      ground(); g.beginPath(); g.roundRect(m, m, w, w, r); g.fill();
    }
    const k = (S * fill) / Math.max(img.width, img.height);
    const w = img.width * k, h = img.height * k;
    g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
    return c.toDataURL("image/png").split(",")[1];
  })()`;
  const out = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.text || "draw failed");
  return Buffer.from(out.result.value, "base64");
}

await mkdir(resolve(ROOT, "icons"), { recursive: true });
await writeFile(resolve(ROOT, "icons/icon-192.png"), await draw(192, "tile", 0.66));
await writeFile(resolve(ROOT, "icons/icon-512.png"), await draw(512, "tile", 0.66));
await writeFile(resolve(ROOT, "icons/icon-maskable-512.png"), await draw(512, "bleed", 0.54));
await writeFile(resolve(ROOT, "icons/apple-touch-icon.png"), await draw(180, "bleed", 0.7));
const mark = (await draw(128, "mark", 1)).toString("base64");
await writeFile(resolve(ROOT, "icons/favicon.svg"),
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64">' +
  '<image width="64" height="64" href="data:image/png;base64,' + mark + '"/></svg>\n');
console.log("icons written: icon-192, icon-512, icon-maskable-512, apple-touch-icon, favicon.svg");
ws.close();
