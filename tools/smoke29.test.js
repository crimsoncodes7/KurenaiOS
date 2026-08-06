/* Kurenai OS — smoke29.test.js
   Category 6.1 assistant UI/UX acceptance gate.

   Covers the redesigned presentation without weakening Category 6 contracts:
   one controller across drawer/page, inert provider rendering, canonical
   confirmations, human activity copy, theme inheritance, focus containment,
   clean production assets, and the Phase E–F regression guardrails. */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;
const loadErrors = [];
window.addEventListener("error", e => loadErrors.push(e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : noop, set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (e) { loadErrors.push(`LOAD FAIL ${match[1]}: ${e.message}`); }
}

const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();
const A = KOS.assistant;
const ORCH = KOS.ai.orchestrator;
const tick = ms => new Promise(resolve => setTimeout(resolve, ms || 0));
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
function assert(condition, message) { if (!condition) throw new Error(message); }

const steps = [];
function step(name, fn) { steps.push([name, fn]); }

step("one shared controller drives drawer and page", async () => {
  assert(loadErrors.length === 0, "load errors: " + loadErrors.join(" | "));
  const shared = A.state();
  const trigger = doc.getElementById("assistant-trigger");
  trigger.focus();
  A.open();
  const drawer = doc.querySelector(".asst-drawer");
  assert(drawer && drawer.getAttribute("aria-modal") === "true", "drawer must be a modal dialog");
  const input = drawer.querySelector(".asst-composer-in");
  input.value = "shared draft";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  KOS.show("assistant", { tab: "chat" });
  await tick(20);
  assert(A.state() === shared, "page must not create a second controller");
  assert(doc.querySelector(".asst-page .asst-composer-in").value === "shared draft", "draft must move across surfaces");
  assert(doc.querySelectorAll(".asst-tabs .study-tab").length === 6, "six compatible destinations expected");
  A.close();
});

step("provider text stays inert and visually belongs to Kurenai", async () => {
  const originalSend = ORCH.send;
  const payload = `<img id="smoke29-x" src=x onerror="window.pwned=1">Safe text`;
  ORCH.send = function (request, callbacks) {
    setTimeout(() => { callbacks.onText({ text: payload }); callbacks.onDone({ status: "complete" }); }, 0);
    return "smoke29-safe";
  };
  A.newConversation();
  A.submit("render safely");
  await tick(30);
  assert(!doc.getElementById("smoke29-x") && !window.pwned, "provider HTML must never execute");
  const bubble = [...doc.querySelectorAll(".asst-assistant .asst-bubble")].pop();
  assert(bubble && bubble.textContent === payload, "provider output must render through textContent");
  assert(bubble.closest(".asst-assistant").querySelector(".asst-message-mark"), "assistant hierarchy needs a bloom identity mark");
  ORCH.send = originalSend;
});

step("tool activity leads with human copy and keeps the id secondary", async () => {
  const originalSend = ORCH.send;
  ORCH.send = function (request, callbacks) {
    setTimeout(() => {
      callbacks.onToolStart({ tool: "study_list_subjects", args: {} });
      callbacks.onToolResult({ tool: "study_list_subjects", ok: true });
      callbacks.onText({ text: "Here are your subjects." });
      callbacks.onDone({ status: "complete" });
    }, 0);
    return "smoke29-tool";
  };
  A.submit("show my subjects");
  await tick(30);
  KOS.show("assistant", { tab: "chat" });
  await tick(20);
  const tool = [...doc.querySelectorAll(".asst-tool")].pop();
  assert(tool && /Reading your subjects/.test(tool.textContent), "primary activity copy must be human-readable");
  assert(tool.querySelector(".asst-technical-id").textContent === "study_list_subjects", "raw id should remain secondary for diagnosis");
  assert(A.toolActivity("study_list_subjects") === "Reading your subjects", "display-label API drifted");
  ORCH.send = originalSend;
});

step("the exact canonical confirmation object is reviewed and confirmed", async () => {
  const originalSend = ORCH.send;
  const originalConfirm = ORCH.confirm;
  let confirmedId = null;
  let callbacks = null;
  const canonical = {
    confirmationId: "confirm-smoke29",
    tool: "collection_delete_entry",
    tier: "consequential",
    description: "Delete this collection entry.",
    target: "anime “Example”",
    args: { entryId: 29 },
    expiresAt: Date.now() + 120000
  };
  ORCH.send = function (request, cb) {
    callbacks = cb;
    setTimeout(() => cb.onConfirmationNeeded(canonical), 0);
    return "smoke29-confirm";
  };
  ORCH.confirm = function (id, cb) {
    confirmedId = id;
    cb(null);
    setTimeout(() => {
      callbacks.onReceipt({ tool: canonical.tool, target: canonical.target, summary: "Entry deleted." });
      callbacks.onDone({ status: "complete" });
    }, 0);
  };
  A.newConversation();
  A.open();
  A.submit("delete the example");
  await tick(25);
  const card = doc.querySelector(".asst-drawer .asst-confirm-card");
  assert(card && A.state().pending === canonical, "UI must retain the canonical object by identity");
  assert(/Delete entry/.test(card.textContent) && /anime “Example”/.test(card.textContent), "review card needs human action and target");
  assert(card.querySelector(".asst-confirm-args").textContent.includes('"entryId": 29'), "exact canonical args must remain reviewable");
  [...card.querySelectorAll("button")].find(button => /Confirm/.test(button.textContent)).click();
  await tick(30);
  assert(confirmedId === canonical.confirmationId, "only the canonical confirmation id may be submitted");
  assert(doc.querySelector(".asst-receipt") && /Verified action complete/.test(doc.querySelector(".asst-receipt").textContent), "verified receipt hierarchy missing");
  A.close();
  ORCH.send = originalSend;
  ORCH.confirm = originalConfirm;
});

step("theme inheritance and clean assets cover light and dark modes", async () => {
  for (const theme of ["spectral-rose", "scarlet-garden-night"]) {
    doc.documentElement.dataset.theme = theme;
    KOS.show("assistant", { tab: "chat" });
    await tick(15);
    assert(doc.documentElement.dataset.theme === theme && doc.querySelector(".asst-page"), theme + " assistant render failed");
  }
  const css = read("css/main.css");
  assert(/\.asst-page, \.asst-drawer[\s\S]{0,500}var\(--panel\)/.test(css), "assistant must inherit canonical theme tokens");
  assert(/prefers-reduced-motion[\s\S]{0,300}assistant-trigger/.test(css), "reduced-motion trigger coverage missing");
  assert(/prefers-reduced-motion[\s\S]{0,300}asst-mascot-img/.test(css), "reduced-motion mascot coverage missing");
  const stateFiles = Object.values(A.MASCOT_STATES).map(state => state.image);
  assert(new Set(stateFiles).size === 1, "states should use one approved render, not alternate portraits");
  const mascot = fs.readFileSync(path.join(ROOT, "assets/assistant", stateFiles[0]));
  const emblem = fs.readFileSync(path.join(ROOT, "assets/assistant/logo/whispering-bloom-emblem-production.png"));
  assert(mascot.readUInt8(25) === 6 && emblem.readUInt8(25) === 6, "production PNG assets must carry RGBA alpha");
});

step("drawer and assistant tabs keep keyboard focus predictable", async () => {
  const trigger = doc.getElementById("assistant-trigger");
  trigger.focus();
  A.open();
  const drawer = doc.querySelector(".asst-drawer");
  const composer = drawer.querySelector(".asst-composer-in");
  assert(doc.activeElement === composer, "drawer opening must focus the composer");
  const focusable = [...drawer.querySelectorAll("button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])")];
  focusable[focusable.length - 1].focus();
  drawer.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  assert(doc.activeElement === focusable[0], "Tab must wrap inside the modal");
  A.close();
  assert(doc.activeElement === trigger, "closing must restore trigger focus");
  KOS.show("assistant", { tab: "chat" });
  await tick(20);
  const tabs = [...doc.querySelectorAll(".asst-tabs .study-tab")];
  tabs[0].focus();
  doc.querySelector(".asst-tabs").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  assert(doc.activeElement === tabs[1], "ArrowRight should move to the next assistant tab");
});

step("Phase E–F safety regressions remain impossible from the UI", async () => {
  const source = read("js/modules/assistant.js");
  assert(!/tools\.execute/.test(source), "UI must never execute Phase B directly");
  assert(!/mediadb\.(put|add|remove)/.test(source), "assistant UI must not write collection data directly");
  assert(/orchestrator\.runTool/.test(source) && /orchestrator\.confirm/.test(source) && /orchestrator\.reject/.test(source), "single orchestrator paths must remain present");
  assert(!/\.text\.(match|includes|indexOf)\(/.test(source), "mascot state must not be inferred from prose");
  assert(/onProposal/.test(source) && /onReceipt/.test(source) && /pendingState/.test(source), "proposal/receipt/pending contracts regressed");
  for (const n of [24, 25, 26, 27, 28]) assert(fs.existsSync(path.join(ROOT, `tools/smoke${n}.test.js`)), `smoke${n} regression gate missing`);
});

(async () => {
  let passed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok ", name); passed++; }
    catch (e) { console.error("  FAIL", name + "\n      ", e && e.stack || e); process.exitCode = 1; }
  }
  if (!process.exitCode) {
    console.log("\n==============================");
    console.log(`SMOKE29 PASS — Category 6.1 assistant UI/UX verified (${passed} steps).`);
  }
  dom.window.close();
})();
