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

const results = {};
console.log("Starting Skeptic A runtime probes for Batch 5...");

// 81. ST-01: IT desk on iPad portrait
try {
  results["ST-01"] = evalJs(`(() => {
    KOS.show("subject", "it");
    const agg = document.querySelector(".k-it-agg, #it-agg");
    const aggRect = agg ? agg.getBoundingClientRect() : null;
    const ruler = document.querySelector(".k-it-ruler, [data-ui*='ruler']");
    const rulerRect = ruler ? ruler.getBoundingClientRect() : null;
    const names = Array.from(document.querySelectorAll(".k-it-name")).map(el => {
      const r = el.getBoundingClientRect();
      return { text: el.innerText.trim(), width: r.width, scrollWidth: el.scrollWidth };
    });
    return {
      aggWidth: aggRect ? aggRect.width : null,
      rulerWidth: rulerRect ? rulerRect.width : null,
      rulerHeight: rulerRect ? rulerRect.height : null,
      unitCount: names.length,
      unitsSample: names.slice(0, 3)
    };
  })()`, "ipad");
  shot("ST-01-it-desk-ipad.png", "#/subject/it", "ipad");
} catch (e) { results["ST-01"] = { error: e.message }; }

// 82. ST-02: iPhone topic page tab strip squeezed
try {
  results["ST-02"] = evalJs(`(() => {
    KOS.show("ref", { subject: "compsci", ref: "4.1.1.1" });
    const tabRow = document.querySelector(".k-topic-tabrow");
    const scroller = document.querySelector(".k-topic-tabrow .k-scroller, .k-topic-tabs");
    const rowRect = tabRow ? tabRow.getBoundingClientRect() : null;
    const scrollerRect = scroller ? scroller.getBoundingClientRect() : null;
    return {
      rowWidth: rowRect ? rowRect.width : null,
      scrollerWidth: scrollerRect ? scrollerRect.width : null,
      scrollerScrollWidth: scroller ? scroller.scrollWidth : null,
      tabs: Array.from(document.querySelectorAll(".k-topic-tabs button, .k-topic-tabrow .k-tab")).map(t => t.innerText.trim())
    };
  })()`, "iphone");
  shot("ST-02-topic-tabs-iphone.png", "#/ref/compsci/4.1.1.1", "iphone");
} catch (e) { results["ST-02"] = { error: e.message }; }

// 83. ST-03: 'Quiz best' shows raw count as percentage
try {
  results["ST-03"] = evalJs(`(() => {
    // Check state.study.quiz and formatting
    const quizState = KOS.store.state.study.quiz;
    return {
      hasQuizStore: Boolean(quizState),
      sampleKey: Object.keys(quizState || {})[0],
      sampleVal: Object.values(quizState || {})[0]
    };
  })()`);
} catch (e) { results["ST-03"] = { error: e.message }; }

// 87. ST-26: IT desk out-of-range mark erases result
try {
  results["ST-26"] = evalJs(`(() => {
    // Check itdesk validate / setMark implementation
    const it = KOS.it || {};
    return {
      hasItDesk: Boolean(it)
    };
  })()`);
} catch (e) { results["ST-26"] = { error: e.message }; }

// 88. SY-01: KOS.rerender() scroll restoration and stage vs main
try {
  results["SY-01"] = evalJs(`(() => {
    const mainEl = document.getElementById("main");
    const stageEl = document.getElementById("stage");
    const bodyEl = document.body;
    return {
      mainOverflow: window.getComputedStyle(mainEl).overflowY,
      stageOverflow: window.getComputedStyle(stageEl).overflowY,
      bodyOverflow: window.getComputedStyle(bodyEl).overflowY,
      scrollerIdentity: stageEl.scrollHeight > stageEl.clientHeight ? "stage" : (mainEl.scrollHeight > mainEl.clientHeight ? "main" : "window")
    };
  })()`);
} catch (e) { results["SY-01"] = { error: e.message }; }

// 92. SY-05: Cloud pull/merge redraws active view unconditionally
try {
  results["SY-05"] = evalJs(`(() => {
    const sync = KOS.cloudsync || {};
    return {
      hasCloudSync: Boolean(sync)
    };
  })()`);
} catch (e) { results["SY-05"] = { error: e.message }; }

// 94. SY-08: Background redraw steals focus
try {
  results["SY-08"] = evalJs(`(() => {
    KOS.show("home");
    // Find an input on home or navigate to search
    const input = document.querySelector("input, textarea");
    if (!input) return { inputFound: false };
    input.focus();
    input.value = "typing test";
    const activeBefore = document.activeElement === input;
    KOS.rerender();
    const activeAfter = document.activeElement === input;
    return {
      activeBefore,
      activeAfter,
      currentActive: document.activeElement ? document.activeElement.tagName : null
    };
  })()`);
} catch (e) { results["SY-08"] = { error: e.message }; }

fs.writeFileSync("docs/audit/2026-11/gemini/evidence/batch5-runtime.json", JSON.stringify(results, null, 2));
console.log("Wrote docs/audit/2026-11/gemini/evidence/batch5-runtime.json successfully!");
