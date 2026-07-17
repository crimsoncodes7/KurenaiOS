/* KurenaiOS — tools/gen_icons.mjs (Build 4b)
   Renders the PWA icon set from the app's own brand language (the 紅 seal
   on Atelier Dawn parchment) via headless Chrome canvas — no image
   dependencies. Start Chrome first:

     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --remote-debugging-port=9223 \
       --user-data-dir=/tmp/kos-icon-gen about:blank

   Then: node tools/gen_icons.mjs
   Writes icons/icon-192.png, icon-512.png, icon-maskable-512.png,
   apple-touch-icon.png (180). Kanji renders with the local Mincho serif —
   the same family the app's --jp token falls back to. */
import { writeFile, mkdir } from "node:fs/promises";
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

async function draw(size, maskable) {
  const expr = `(() => {
    const S = ${size}, mask = ${maskable};
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const g = c.getContext("2d");
    /* Atelier Dawn */
    const parchment = "#EFE7D6", panel = "#F8F3E6", irisHi = "#7A87BE", irisLo = "#48548C";
    if (mask) {
      /* maskable: full-bleed iris, glyph well inside the 80% safe zone */
      const grad = g.createLinearGradient(0, 0, S, S);
      grad.addColorStop(0, irisHi); grad.addColorStop(1, irisLo);
      g.fillStyle = grad; g.fillRect(0, 0, S, S);
    } else {
      /* standard: parchment ground + the brand's off-round seal */
      g.fillStyle = parchment; g.fillRect(0, 0, S, S);
      const r = S * 0.335, cx = S / 2, cy = S / 2;
      const grad = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      grad.addColorStop(0, irisHi); grad.addColorStop(1, irisLo);
      g.fillStyle = grad;
      g.beginPath();
      /* the seal's 50%/46%/50%/48% irregularity, as radii per quadrant */
      g.ellipse(cx, cy, r * 1.0, r * 0.97, 0.06, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = Math.max(1, S * 0.008);
      g.strokeStyle = "rgba(255,255,255,.28)";
      g.stroke();
    }
    g.fillStyle = panel;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "600 " + Math.round(S * (mask ? 0.42 : 0.40)) + "px 'Shippori Mincho','Hiragino Mincho ProN',serif";
    g.fillText("\\u7d05", S / 2, S / 2 + S * 0.015);
    return c.toDataURL("image/png").split(",")[1];
  })()`;
  const out = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.text || "draw failed");
  return Buffer.from(out.result.value, "base64");
}

await mkdir(resolve(ROOT, "icons"), { recursive: true });
await writeFile(resolve(ROOT, "icons/icon-192.png"), await draw(192, false));
await writeFile(resolve(ROOT, "icons/icon-512.png"), await draw(512, false));
await writeFile(resolve(ROOT, "icons/icon-maskable-512.png"), await draw(512, true));
await writeFile(resolve(ROOT, "icons/apple-touch-icon.png"), await draw(180, false));
console.log("icons written: icon-192, icon-512, icon-maskable-512, apple-touch-icon");
ws.close();
