const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const errors = [];
const dom = new JSDOM(html, {
  url: "http://localhost/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});
const { window } = dom;
const { document } = window;

window.addEventListener("error", (e) => errors.push("window error: " + e.message));

// ---- canvas stub (jsdom has no canvas impl) ----
const noop = () => {};
const ctxStub = new Proxy({}, {
  get(t, k) {
    if (k === "measureText") return () => ({ width: 10 });
    return typeof k === "string" ? noop : undefined;
  },
  set() { return true; },
});
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.cancelAnimationFrame = clearTimeout;
window.confirm = () => true; window.__kosAutoConfirm = true;
if (!window.navigator.clipboard) {
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText: () => Promise.resolve() },
  });
}

// ---- load scripts in document order ----
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  const code = fs.readFileSync(path.join(ROOT, src), "utf8");
  try {
    window.eval(code);
  } catch (e) {
    errors.push(`LOAD FAIL ${src}: ${e.message}`);
  }
}

// Build 2a: labs/sims are gold-gated behind the Behavioural Governor on a
// fresh store — own the whole catalog so the lab steps run unobstructed.
window.eval("KOS.governor.debugUnlockAll()");

function step(name, fn) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0,3).join(" | ")}`); console.log("FAIL  " + name); }
}
const KOS = window.KOS;
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const click = (n) => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

console.log("== boot ==");
step("KOS namespace exists", () => { if (!KOS || !KOS.views) throw new Error("no KOS"); });
step("node count rendered", () => {
  const t = $("#node-count").textContent;
  if (!/^\d+$/.test(t) || +t < 300) throw new Error("node count: " + t);
  console.log("       total spec points: " + t);
});

console.log("== hub views ==");
step("home view", () => { KOS.show("home"); if (!$(".home-hero")) throw new Error("no hero"); });
for (const sid of ["compsci", "maths", "it"]) {
  step("subject dashboard: " + sid, () => {
    KOS.show("subject", sid);
    if (!$(".dash-head")) throw new Error("no dash");
    if ($$("#tree .sec").length < 5) throw new Error("tree sections missing: " + $$("#tree .sec").length);
  });
}
step("open a CS section & click a leaf", () => {
  KOS.show("subject", "compsci");
  const sec = $$("#tree .sec-head").find(h => h.textContent.includes("4.2"));
  click(sec);
  const leaf = $$("#tree .leaf").find(l => l.textContent.includes("4.2.3.1"));
  if (!leaf) throw new Error("stack leaf not in tree");
  click(leaf);
  if (!$(".seal") || $(".seal").textContent !== "4.2.3.1") throw new Error("ref view didn't open");
  click($$(".study-tab").find(t => t.dataset.tab === "spec"));
  if (!$(".speccontent").textContent.includes("push")) throw new Error("spec content missing");
  if (!$(".intel-defs")) throw new Error("intel defs missing for stacks");
});
step("checklist drives status to done", () => {
  $$(".ctl-row input[type=checkbox]").forEach(cb => { cb.checked = true; cb.dispatchEvent(new window.Event("change", { bubbles: true })); });
  const p = KOS.store.state.progress["compsci:4.2.3.1"];
  if (p.status !== "done") throw new Error("status is " + p.status);
});
step("note persists", () => {
  KOS.store.setNote("compsci", "4.2.3.1", "LIFO!");
  if (KOS.store.state.progress["compsci:4.2.3.1"].note !== "LIFO!") throw new Error("note lost");
});
step("prev/next navigation", () => {
  const next = $$(".pn").pop();
  click(next);
  if ($(".seal").textContent === "4.2.3.1") throw new Error("didn't navigate");
});
step("maths ref view (5.7) renders intel on the spec tab", () => {
  KOS.show("ref", { subject: "maths", ref: "5.7" });
  click($$(".study-tab").find(t => t.dataset.tab === "spec"));
  if (!$(".intel-tips")) throw new Error("tips missing");
  if (!$(".speccontent").textContent.toLowerCase().includes("trigonometric")) throw new Error("content wrong");
});
step("it ref view (F200.1.1)", () => {
  KOS.show("ref", { subject: "it", ref: "F200.1.1" });
  if (!$(".speccontent").textContent.includes("knowledge")) throw new Error("content wrong");
});

console.log("== search ==");
step("search 'dijkstra' finds the algorithm", () => {
  const input = $("#search");
  input.value = "dijkstra";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  const items = $$("#search-results .sr-item");
  if (!items.length) throw new Error("no results");
  click(items[0]);
  if (!$(".seal").textContent.startsWith("4.3.6")) throw new Error("landed on " + $(".seal").textContent);
});
step("search 'binomial' spans subjects", () => {
  const input = $("#search");
  input.value = "binomial";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  const subs = new Set($$("#search-results .sr-sub").map(n => n.textContent));
  if (subs.size < 1) throw new Error("no results");
  $("#search").value = "";
});

console.log("== worked example engine ==");
for (const gid of ["quad", "diff", "trig", "logs", "bin", "float", "suvat"]) {
  step("generator: " + gid, () => {
    KOS.store.state.worked.last = gid;
    KOS.show("worked");
    const steps = $$(".step");
    if (steps.length < 3) throw new Error("only " + steps.length + " steps");
    // reveal all and check the answer line appears
    const all = $$(".btn.gold").find(b => b.textContent === "Reveal all");
    if (all) click(all);
    const ans = $(".answerline");
    if (!ans || ans.style.display === "none") throw new Error("no answer line");
    if (/NaN|undefined|Infinity/.test(ans.textContent)) throw new Error("bad answer: " + ans.textContent);
    console.log("       " + ans.textContent.slice(0, 76));
  });
}
step("generator validation rejects bad input", () => {
  KOS.store.state.worked.last = "quad";
  KOS.show("worked");
  const aField = $$(".lab-controls label").find(l => l.textContent.startsWith("a")).querySelector("input");
  aField.value = "0";
  click($$(".btn.primary").find(b => b.textContent === "Generate working"));
  // toast should show the validation message
  if (!$("#toast").textContent.includes("non-zero")) throw new Error("validation didn't fire: " + $("#toast").textContent);
});

console.log("== trace lab ==");
step("stack push/pop/overflow", () => {
  KOS.store.state.trace.tab = "stack";
  KOS.show("trace");
  const push = $$(".btn.primary").find(b => b.textContent === "Push");
  for (let i = 0; i < 9; i++) click(push); // 9th should overflow
  if (!$("#toast").textContent.includes("overflow")) throw new Error("no overflow guard");
  const pop = $$(".btn").find(b => b.textContent === "Pop");
  click(pop);
  const rows = $$(".trace-table tbody tr");
  if (!rows.length) throw new Error("no trace rows");
});
step("circular queue wraps with MOD", () => {
  KOS.store.state.trace.tab = "queue";
  KOS.show("trace");
  const enq = $$(".btn.primary").find(b => b.textContent === "Enqueue");
  const deq = $$(".btn").find(b => b.textContent === "Dequeue");
  for (let i = 0; i < 8; i++) click(enq);
  click(deq); click(deq);
  click(enq); // wraps to index 0
  const last = $$(".trace-table tbody tr").pop().textContent;
  if (!last.includes("MOD")) throw new Error("no MOD arithmetic shown: " + last);
});
step("linked list append + remove", (done) => {
  KOS.store.state.trace.tab = "list";
  KOS.show("trace");
  const valIn = $(".lab-controls input");
  valIn.value = "42";
  click($$(".btn.primary").find(b => b.textContent.includes("Append")));
  valIn.value = "7";
  click($$(".btn").find(b => b.textContent.includes("Prepend")));
  const rows = $$(".trace-table tbody tr");
  if (!rows.some(r => r.textContent.includes("7 → 42"))) throw new Error("list order wrong");
});
step("BST insert + in-order is sorted", () => {
  KOS.store.state.trace.tab = "tree";
  KOS.show("trace");
  const valIn = $(".lab-controls input");
  const ins = $$(".btn.primary").find(b => b.textContent === "Insert");
  for (const v of [50, 30, 70, 20, 60]) { valIn.value = String(v); click(ins); }
  click($$(".btn").find(b => b.textContent === "In-order"));
  const last = $$(".trace-table tbody tr").pop().textContent;
  if (!last.includes("20, 30, 50, 60, 70")) throw new Error("in-order wrong: " + last);
});

console.log("== oop sandbox ==");
step("seeded example transpiles with inheritance", () => {
  KOS.show("oop");
  const code = $("#oop-code pre").textContent;
  if (!code.includes("class Suspect : GameEntity")) throw new Error("no inheritance in code");
  if (!code.includes("public override void TakeDamage()")) throw new Error("no override");
  if (!code.includes("abstract class GameEntity")) throw new Error("no abstract");
});
step("add class + edit name re-transpiles", () => {
  click($$(".btn.primary").find(b => b.textContent === "+ Add class"));
  const cards = $$(".cls-card");
  const nameIn = cards[cards.length - 1].querySelector(".cls-h input");
  nameIn.value = "Interrogator";
  nameIn.dispatchEvent(new window.Event("input", { bubbles: true }));
  if (!$("#oop-code pre").textContent.includes("class Interrogator")) throw new Error("rename not reflected");
});
step("inheritance cycle is refused", () => {
  // GameEntity tries to inherit from Suspect (its own child) -> cycle
  const m = KOS.store.state.oop;
  const ge = m.classes.find(c => c.name === "GameEntity");
  const su = m.classes.find(c => c.name === "Suspect");
  const geCard = $(`.cls-card[data-cid="${ge.id}"]`);
  const setBase = [...geCard.querySelectorAll(".mini-btn")].find(b => b.textContent.includes("set base"));
  click(setBase);
  click($(`.cls-card[data-cid="${su.id}"]`));
  if (!$("#toast").textContent.includes("cycle")) throw new Error("cycle allowed! " + $("#toast").textContent);
  if (m.links.some(l => l.child === ge.id)) throw new Error("cycle link stored");
});

console.log("== persistence ==");
step("force a save flush", () => { window.eval("KOS.store.save()"); });

setTimeout(() => {
  const raw = window.localStorage.getItem("kurenai-os-v1");
  try {
    const st = JSON.parse(raw);
    if (st.progress["compsci:4.2.3.1"].note !== "LIFO!") errors.push("persisted note wrong");
    if (!st.oop.classes.length) errors.push("oop state not persisted");
    console.log("  ok  localStorage round-trip (" + (raw.length/1024).toFixed(1) + " KB state)");
  } catch (e) { errors.push("persist parse: " + e.message); }

  console.log("\n==============================");
  if (errors.length) {
    console.log("FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log(" • " + e));
    process.exit(1);
  } else {
    console.log("ALL SMOKE TESTS PASSED");
    // explicit exit: the app keeps a 30-min reminder interval alive (Build 2a),
    // so the event loop never drains on its own any more
    process.exit(0);
  }
}, 400);
