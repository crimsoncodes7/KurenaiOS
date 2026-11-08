import { execFileSync } from "node:child_process";
import fs from "node:fs";

const NODE = "/usr/local/n/versions/node/24.18.0/bin/node";
const KOS = "docs/audit/2026-11/harness/kos.mjs";
const SLOT = "31";

function kos(args) {
  return execFileSync(NODE, [KOS, ...args], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
}
function evalJs(expr, viewport = "mac") {
  const out = kos(["eval", SLOT, expr, "--size", viewport]).trim();
  const idx = out.indexOf("\nconsole:\n");
  const jsonPart = idx >= 0 ? out.slice(0, idx).trim() : out;
  try { return JSON.parse(jsonPart); } catch { return out; }
}
function shot(name, hash, viewport, js) {
  const p = `audit-evidence/2026-11/gemini/shots/${name}`;
  const args = ["shot", SLOT, hash, viewport, p, "--wait", "600"];
  if (js) args.push("--js", js);
  kos(args);
  return p;
}

const prev = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/evidence/batch2-followup.json", "utf8"));

// 1. CO-03: #/study/code renders KOS.codeDesk!
prev["CO-03"] = evalJs(`(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const st = KOS.store.state.code;
  const tasks = KOS.code.allTasks();
  const t0 = tasks[0];
  st.tasks = st.tasks || {};
  st.tasks[t0.id] = { passAt: Date.now() - 86400000, tries: 1 };
  KOS.show("study", "code");
  const d20 = KOS.code.planDay();
  const hero = document.querySelector(".k-cx-hero");
  const side = document.querySelector(".k-subj-side");
  const first = side ? side.firstElementChild : null;
  const next = document.querySelector(".k-subj-next");
  const txt = document.querySelector(".k-subj-next-txt");
  const kicker = next ? next.querySelector(".k-kicker") : null;
  const hRect = hero ? hero.getBoundingClientRect() : null;
  const sRect = side ? side.getBoundingClientRect() : null;
  const fRect = first ? first.getBoundingClientRect() : null;
  const nRect = next ? next.getBoundingClientRect() : null;
  const tRect = txt ? txt.getBoundingClientRect() : null;
  const kRect = kicker ? kicker.getBoundingClientRect() : null;
  return {
    d20HasTask: Boolean(d20 && d20.task),
    d20TaskId: d20 && d20.task ? d20.task.id : null,
    heroH: hRect ? Math.round(hRect.height * 10) / 10 : null,
    sideRect: sRect ? { h: Math.round(sRect.height * 10) / 10, top: Math.round(sRect.top * 10) / 10, bottom: Math.round(sRect.bottom * 10) / 10 } : null,
    firstRect: fRect ? { h: Math.round(fRect.height * 10) / 10, top: Math.round(fRect.top * 10) / 10, bottom: Math.round(fRect.bottom * 10) / 10 } : null,
    nextRect: nRect ? { h: Math.round(nRect.height * 10) / 10, top: Math.round(nRect.top * 10) / 10, bottom: Math.round(nRect.bottom * 10) / 10, clientH: next.clientHeight, scrollH: next.scrollHeight } : null,
    txtRect: tRect ? { h: Math.round(tRect.height * 10) / 10, top: Math.round(tRect.top * 10) / 10, bottom: Math.round(tRect.bottom * 10) / 10 } : null,
    kickerRect: kRect ? { top: Math.round(kRect.top * 10) / 10, bottom: Math.round(kRect.bottom * 10) / 10, clippedTop: nRect ? kRect.top < nRect.top : false } : null
  };
})()`, "mac");

shot("CO-03-code-continue-mac.png", "#/study/code", "mac", `(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const st = KOS.store.state.code;
  const tasks = KOS.code.allTasks();
  const t0 = tasks[0];
  st.tasks = st.tasks || {};
  st.tasks[t0.id] = { passAt: Date.now() - 86400000, tries: 1 };
  KOS.rerender();
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
})()`);

// 2. EX-03: open #/ref/compsci/4.1.1.1 on iPhone and click the Handwritten tab button
prev["EX-03"] = evalJs(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("ref", { subject: "compsci", ref: "4.1.1.1" });
  await new Promise(r => setTimeout(r, 200));
  const inkTab = [...document.querySelectorAll("[role='tab'], button")].find(b => /Handwritten/i.test(b.textContent || ""));
  if (inkTab) inkTab.click();
  await new Promise(r => setTimeout(r, 350));
  const pal = document.querySelector(".k-ink-pal");
  const r = pal ? pal.getBoundingClientRect() : null;
  const btns = pal ? [...pal.querySelectorAll("button")].map(b => {
    const br = b.getBoundingClientRect();
    return { text: (b.getAttribute("aria-label") || b.textContent || "").trim(), left: Math.round(br.left), right: Math.round(br.right), w: Math.round(br.width) };
  }) : [];
  return {
    vw: window.innerWidth,
    inkTabFound: Boolean(inkTab),
    palFound: Boolean(pal),
    palState: pal ? pal.getAttribute("data-state") : null,
    palRect: r ? { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height) } : null,
    overflowRightPx: r ? Math.round(r.right - window.innerWidth) : 0,
    offscreenButtons: btns.filter(b => b.right > window.innerWidth),
    allButtons: btns
  };
})()`, "iphone");

shot("EX-03-ink-palette-iphone.png", "#/ref/compsci/4.1.1.1", "iphone", `(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const inkTab = [...document.querySelectorAll("[role='tab'], button")].find(b => /Handwritten/i.test(b.textContent || ""));
  if (inkTab) inkTab.click();
})()`);

// 3. EX-28: find a full paper in KOS.examPaper.list("compsci") or "maths" and open in timed mode on iPad & iPhone
prev["EX-28"] = evalJs(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const list = [
    ...(KOS.examPaper.list ? KOS.examPaper.list("compsci") : []),
    ...(KOS.examPaper.list ? KOS.examPaper.list("maths") : [])
  ];
  let best = list[0];
  for (const p of list) {
    if ((p.questions || []).length > ((best && best.questions) || []).length) best = p;
  }
  const pid = best ? best.id : "pack-4.1.1";
  KOS.show("exams", { page: "paper", id: pid, mode: "timed" });
  await new Promise(r => setTimeout(r, 250));
  const tbar = document.querySelector(".k-ex-tbar");
  const scroller = document.querySelector(".k-ex-tbar .k-scroller");
  const nav = document.querySelector(".k-ex-tnav");
  const btns = [...document.querySelectorAll(".k-ex-tnav-b")];
  return {
    pid,
    qCount: btns.length,
    tbarW: tbar ? Math.round(tbar.getBoundingClientRect().width) : null,
    scrollerW: scroller ? Math.round(scroller.getBoundingClientRect().width) : null,
    navW: nav ? Math.round(nav.getBoundingClientRect().width) : null,
    btnWidths: btns.map(b => ({ text: b.textContent.trim(), w: Math.round(b.getBoundingClientRect().width * 10) / 10, h: Math.round(b.getBoundingClientRect().height * 10) / 10 }))
  };
})()`, "ipad");

shot("EX-28-paper-qnav-ipad.png", "#/exams/paper/" + (prev["EX-28"]?.pid || "pack-4.1.1") + "/timed", "ipad", `(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
})()`);

fs.writeFileSync("docs/audit/2026-11/gemini/evidence/batch2-followup.json", JSON.stringify(prev, null, 2));
console.log("Updated batch2-followup.json");
