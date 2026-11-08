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

console.log("Starting Skeptic A runtime probes for Batch 4...");

// 61. PR-02: Every page header shows previous page's painted band
try {
  results["PR-02"] = evalJs(`(() => {
    // Check pageHeader in js/core/ui.js
    const src = KOS.ui.pageHeader.toString();
    const readsStateView = src.includes("state.ui.view");
    return {
      readsStateView,
      snippet: src.slice(0, 400)
    };
  })()`);
} catch (e) { results["PR-02"] = { error: e.message }; }

// 62. PR-03: Focus general study overridden by About to Study
try {
  results["PR-03"] = evalJs(`(() => {
    // Check preflight / abouttostudy logic
    const preflightSrc = (KOS.preflight && KOS.preflight.open) ? KOS.preflight.open.toString() : null;
    return {
      hasPreflight: Boolean(preflightSrc),
      preflightSnippet: preflightSrc ? preflightSrc.slice(0, 400) : null
    };
  })()`);
} catch (e) { results["PR-03"] = { error: e.message }; }

// 64. SC-01: Shop avatar previews escape disc
try {
  results["SC-01"] = evalJs(`(() => {
    KOS.show("cosmetics");
    const discs = Array.from(document.querySelectorAll(".k-shop-avatar, .k-cosm-avatar, [data-ui*='avatar']"));
    return {
      discCount: discs.length
    };
  })()`);
} catch (e) { results["SC-01"] = { error: e.message }; }

// 68. SC-05: Painted shelf skins 404
try {
  results["SC-05"] = evalJs(`(async () => {
    const list = (KOS.cosmetics && KOS.cosmetics.catalog) ? KOS.cosmetics.catalog : [];
    const missingUrls = [];
    for (const c of list) {
      const u = c.art || c.src || c.url || c.preview;
      if (u && (u.includes("assets/") || u.includes("/css/"))) {
        try {
          const r = await fetch(u);
          missingUrls.push({ id: c.id, url: u, status: r.status });
        } catch (err) {
          missingUrls.push({ id: c.id, url: u, error: err.message });
        }
      }
    }
    return { checkedCount: list.length, missingUrls };
  })()`);
} catch (e) { results["SC-05"] = { error: e.message }; }

// 74. SH-01: Toast wraps at half viewport width on phones
try {
  results["SH-01"] = evalJs(`(() => {
    KOS.toast("A reasonably long notification message to test wrapping behaviour on phone");
    const toast = document.querySelector(".k-toast, [data-ui*='toast']");
    if (!toast) return { found: false };
    const rect = toast.getBoundingClientRect();
    const style = window.getComputedStyle(toast);
    return {
      found: true,
      width: rect.width,
      maxWidth: style.maxWidth,
      maxInlineSize: style.maxInlineSize,
      windowWidth: window.innerWidth,
      ratio: rect.width / window.innerWidth
    };
  })()`, "iphone");
} catch (e) { results["SH-01"] = { error: e.message }; }

// 77. SH-04: iPhone bottom tab bar lost labels
try {
  results["SH-04"] = evalJs(`(() => {
    KOS.show("home");
    const nav = document.querySelector("nav.k-mobile-nav, [data-ui='shell.mobile-nav'], .k-mobile-shell nav");
    const links = Array.from(document.querySelectorAll("nav.k-mobile-nav a, [data-ui='shell.mobile-nav'] a"));
    return {
      navFound: Boolean(nav),
      links: links.map(l => ({
        text: l.innerText.trim(),
        html: l.innerHTML,
        ariaLabel: l.getAttribute("aria-label")
      }))
    };
  })()`, "iphone");
} catch (e) { results["SH-04"] = { error: e.message }; }

// 78. SH-20: Enter on focused Cancel button confirms non-danger dialog
try {
  results["SH-20"] = evalJs(`(async () => {
    let resolvedWith = null;
    KOS.ui.confirm({ title: "Test Confirm", message: "Testing enter key", danger: false })
      .then(res => { resolvedWith = res; });
    
    await new Promise(r => setTimeout(r, 60));
    const cancelBtn = document.querySelector(".k-dialog-foot .k-btn-ghost, [data-ui='dialog.cancel']");
    if (cancelBtn) {
      cancelBtn.focus();
      const event = new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true });
      cancelBtn.dispatchEvent(event);
    }
    await new Promise(r => setTimeout(r, 100));
    return {
      cancelBtnFound: Boolean(cancelBtn),
      resolvedWith
    };
  })()`);
} catch (e) { results["SH-20"] = { error: e.message }; }

// 79. SH-21: Skip to content navigates to Home
try {
  results["SH-21"] = evalJs(`(async () => {
    await KOS.show("settings");
    const startHash = location.hash;
    const skipLink = document.querySelector(".skip-link, [data-ui='shell.skip-link']");
    if (skipLink) {
      skipLink.click();
    }
    await new Promise(r => setTimeout(r, 150));
    const endHash = location.hash;
    const currentView = KOS.store.state.ui.view;
    return {
      skipLinkFound: Boolean(skipLink),
      startHash,
      endHash,
      currentView
    };
  })()`);
} catch (e) { results["SH-21"] = { error: e.message }; }

// 80. SH-22: On iPhone, Money & Goals tabs unreachable
try {
  results["SH-22"] = evalJs(`(() => {
    KOS.show("money");
    const phoneTabs = document.querySelector("[data-phone-tabs], .k-phone-tabs");
    const phoneTabsStyle = phoneTabs ? window.getComputedStyle(phoneTabs).display : null;
    const subTabs = Array.from(document.querySelectorAll(".k-tab, .k-tabs button")).map(t => t.innerText.trim());
    return {
      phoneTabsFound: Boolean(phoneTabs),
      phoneTabsDisplay: phoneTabsStyle,
      subTabs
    };
  })()`, "iphone");
} catch (e) { results["SH-22"] = { error: e.message }; }

fs.writeFileSync("docs/audit/2026-11/gemini/evidence/batch4-runtime.json", JSON.stringify(results, null, 2));
console.log("Wrote docs/audit/2026-11/gemini/evidence/batch4-runtime.json successfully!");
