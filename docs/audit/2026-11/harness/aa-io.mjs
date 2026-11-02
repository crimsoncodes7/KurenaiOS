// node aa-io.mjs get <file>   : writes window.__bk to file
// node aa-io.mjs put <file>   : sets window.__bk from file
import { readFileSync, writeFileSync } from "node:fs";
const [mode, file] = process.argv.slice(2);
const pages = await fetch("http://127.0.0.1:9316/json").then(r => r.json());
const page = pages.find(p => p.type === "page" && p.url.includes(":9116/"));
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r, { once: true }));
let seq = 0; const pend = new Map();
ws.addEventListener("message", ev => { const m = JSON.parse(String(ev.data)); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
const send = (method, params) => new Promise(r => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
if (mode === "get") {
  const o = await send("Runtime.evaluate", { expression: "window.__bk", returnByValue: true });
  writeFileSync(file, o.result.result.value); console.log("wrote", o.result.result.value.length);
} else {
  const txt = readFileSync(file, "utf8");
  const o = await send("Runtime.evaluate", { expression: "window.__bk=" + JSON.stringify(txt) + ";window.__bk.length", returnByValue: true });
  console.log("set", JSON.stringify(o.result));
}
ws.close();
