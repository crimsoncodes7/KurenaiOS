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

// 1. HR-04: Home recommendation "what next"
results["HR-04"] = evalJs(`(() => {
  // Check KOS.hub.recommend / what-next logic
  const fn = KOS.hub && KOS.hub.recommendations ? KOS.hub.recommendations.toString() : null;
  const plan = KOS.hub && KOS.hub.homeFocusPlan ? KOS.hub.homeFocusPlan() : null;
  const deskCards = ["code", "ja", "mind", "creatives", "money"];
  // Check what subjects are handled in recommendation ladder
  return {
    hasHomeFocusPlan: Boolean(KOS.hub && KOS.hub.homeFocusPlan),
    planSample: plan,
    fnSnippet: fn ? fn.slice(0, 500) : null
  };
})()`);

// 2. HR-05: Home "Study hours" vs Reports "Studied"
results["HR-05"] = evalJs(`(() => {
  // Compute Home study hours vs ReportStore weekly hours
  const homeHoursText = document.querySelector(".k-home-study .k-stat-val, [data-ui='home.study-hours']")?.textContent || null;
  const rep = KOS.reportStore && KOS.reportStore.cached ? KOS.reportStore.cached() : null;
  const sessions = KOS.store.state.sessions || [];
  return {
    homeHoursText,
    reportCachedKeys: rep ? Object.keys(rep) : [],
    sessionCount: sessions.length
  };
})()`);

// 3. HR-16: Streak milestone bonus deduplication
results["HR-16"] = evalJs(`(() => {
  const gov = KOS.governor;
  const st = KOS.store.state.governor;
  const history = KOS.store.state.sessions;
  const milestonesFn = gov && gov.checkStreakMilestones ? gov.checkStreakMilestones.toString() : null;
  const streakFn = KOS.hub && KOS.hub.currentStreak ? KOS.hub.currentStreak.toString() : null;
  return {
    milestonesFn: milestonesFn ? milestonesFn.slice(0, 600) : null,
    streakFn: streakFn ? streakFn.slice(0, 600) : null,
    awardedMilestones: st.streakMilestones || []
  };
})()`);

// 4. HR-17: Report words subject lookup
results["HR-17"] = evalJs(`(() => {
  const repWords = KOS.reportWords;
  const testSubjects = ["code", "ja", "mind", "creatives", "compsci", "maths", "it"];
  const facts = {
    mins: 120,
    sessions: 4,
    bySubject: { code: 120 },
    topSubject: "code"
  };
  const narrative = repWords && repWords.weeklyHeadline ? repWords.weeklyHeadline(facts) : null;
  const narrative2 = repWords && repWords.narrative ? repWords.narrative(facts) : null;
  return {
    hasReportWords: Boolean(repWords),
    headlineCode: narrative,
    narrativeCode: narrative2
  };
})()`);

// 5. HR-18: Daily Goal self-tick XP/gold
results["HR-18"] = evalJs(`(() => {
  const xpBefore = KOS.store.state.governor.xp;
  const goldBefore = KOS.store.state.governor.gold;
  // Look for directive check buttons on Home
  const item = document.querySelector(".k-home-goal .k-check, [data-ui='home.goal-item'], .k-home-goal li");
  const tickBtn = document.querySelector(".k-home-goal button.k-check, .k-home-goal input[type='checkbox']");
  return {
    xpBefore,
    goldBefore,
    foundItem: Boolean(item),
    tickBtnTag: tickBtn ? tickBtn.tagName : null,
    tickBtnClass: tickBtn ? tickBtn.className : null
  };
})()`);

// 6. JM-07: Japanese 4th lesson check ("Held in reviews")
results["JM-07"] = evalJs(`(() => {
  const leafKey = "ja:1.1";
  const p = KOS.store.peekProgress ? KOS.store.peekProgress("ja", "1.1") : null;
  const ev = KOS.ja && KOS.ja.evidence ? KOS.ja.evidence("1.1") : null;
  return {
    progressRecord: p,
    evidence: ev,
    check3Stored: p ? p.check[3] : null,
    check3Evidence: ev ? ev.checks[3] : null
  };
})()`);

// 7. JM-08: Japanese review session early navigation
results["JM-08"] = evalJs(`(() => {
  const rFn = KOS.jaRun && KOS.jaRun.finish ? KOS.jaRun.finish.toString() : null;
  const logFn = KOS.sessions && KOS.sessions.log ? KOS.sessions.log.toString() : null;
  return {
    hasJaRun: Boolean(KOS.jaRun),
    hasFinish: Boolean(KOS.jaRun && KOS.jaRun.finish),
    finishSnippet: rFn ? rFn.slice(0, 400) : null
  };
})()`);

// 8. JM-09: iPhone Japanese lesson topic tab strip
results["JM-09"] = evalJs(`(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  if (KOS.store.state.ui.japanese) KOS.store.state.ui.japanese.spine = "core";
  KOS.show("ref", { subject: "ja", ref: "1.1" });
  const nav = document.querySelector(".k-study-nav");
  const scroller = document.querySelector(".k-study-nav .k-scroller, .k-study-nav .k-scroller-track");
  const tabs = document.querySelector(".k-tabs");
  const tabBtns = [...document.querySelectorAll(".k-study-nav [role='tab'], .k-study-nav button")].map(b => ({
    text: (b.getAttribute("aria-label") || b.textContent || "").trim(),
    w: Math.round(b.getBoundingClientRect().width * 10) / 10,
    h: Math.round(b.getBoundingClientRect().height * 10) / 10
  }));
  const nRect = nav ? nav.getBoundingClientRect() : null;
  const sRect = scroller ? scroller.getBoundingClientRect() : null;
  const tRect = tabs ? tabs.getBoundingClientRect() : null;
  return {
    vw: window.innerWidth,
    navRect: nRect ? { w: Math.round(nRect.width), h: Math.round(nRect.height) } : null,
    scrollerRect: sRect ? { w: Math.round(sRect.width), h: Math.round(sRect.height) } : null,
    tabsRect: tRect ? { w: Math.round(tRect.width), h: Math.round(tRect.height) } : null,
    tabBtns
  };
})()`, "iphone");

shot("JM-09-ja-tabstrip-iphone.png", "#/ref/ja/1.1", "iphone", `(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  if (KOS.store.state.ui.japanese) KOS.store.state.ui.japanese.spine = "core";
  KOS.rerender();
})()`);

// 9. MG-02: Santander midata headers
results["MG-02"] = evalJs(`(() => {
  const headers = ["Date", "Merchant/Description", "Debit/Credit", "Balance"];
  const guess = KOS.money && KOS.money.csv && KOS.money.csv.guess ? KOS.money.csv.guess(headers) : null;
  return {
    headers,
    guessedMapping: guess
  };
})()`);

// 10. MG-03: CSV parser leading blank line / preamble
results["MG-03"] = evalJs(`(() => {
  const raw1 = "\\nDate,Amount,Payee\\n2026-10-01,-12.50,Tesco\\n";
  const raw2 = "Account: 12345678\\nSort Code: 00-00-00\\nDate,Amount,Payee\\n2026-10-01,-12.50,Tesco\\n";
  const parse = KOS.money.csv.parse;
  const p1 = parse(raw1);
  const p2 = parse(raw2);
  return {
    blankLineHeader: p1 ? p1.header : null,
    preambleHeader: p2 ? p2.header : null,
    p1RowsCount: p1 && p1.rows ? p1.rows.length : 0,
    p2RowsCount: p2 && p2.rows ? p2.rows.length : 0
  };
})()`);

// 11. MG-04: Santander export file formats
results["MG-04"] = evalJs(`(() => {
  // Check file input in Money import dialog
  const inputAccept = ".csv,.txt"; // from inspection of code
  const txtContent = "2026-10-01\\t-12.50\\tTesco\\n";
  const parsedTxt = KOS.money.csv.parse(txtContent);
  return {
    parsedTxtHeader: parsedTxt ? parsedTxt.header : null,
    parsedTxtDelimiter: parsedTxt ? parsedTxt.delimiter : null
  };
})()`);

// 12. MG-05: Money import undo after modal close
results["MG-05"] = evalJs(`(() => {
  const hasUndoBatch = Boolean(KOS.money && KOS.money.undoBatch);
  const hasImportHistory = Boolean(KOS.store.state.money && KOS.store.state.money.imports);
  return {
    hasUndoBatch,
    hasImportHistory
  };
})()`);

// 13. MG-06: Unquoted thousands separators
results["MG-06"] = evalJs(`(() => {
  const raw = "Date,Amount,Payee\\n2026-10-01,£1,234.56,Rent\\n";
  const parsed = KOS.money.csv.parse(raw);
  return {
    raw,
    parsedRow: parsed && parsed.rows ? parsed.rows[0] : null
  };
})()`);

// 14. MG-07: Recurring rule Confirm vs import double count
results["MG-07"] = evalJs(`(() => {
  const rules = KOS.store.state.money && KOS.store.state.money.rules ? KOS.store.state.money.rules : [];
  const txs = KOS.store.state.money && KOS.store.state.money.txs ? KOS.store.state.money.txs : [];
  return {
    ruleCount: rules.length,
    txCount: txs.length
  };
})()`);

// 15. MG-08: Imported row fields
results["MG-08"] = evalJs(`(() => {
  const norm = KOS.money && KOS.money.normaliseTx ? KOS.money.normaliseTx.toString() : null;
  return {
    normaliseSnippet: norm ? norm.slice(0, 400) : null
  };
})()`);

// 16. MG-09: iPhone Money unreachable tabs & Goals unreachable filters
results["MG-09"] = evalJs(`(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("money");
  const moneyNav = document.querySelectorAll("#page-actions button, .k-money-nav button, .k-stage-head button");
  KOS.show("goals");
  const goalsNav = document.querySelectorAll("#page-actions button, .k-goals-nav button, .k-stage-head button");
  return {
    vw: window.innerWidth,
    moneyButtonsCount: moneyNav.length,
    goalsButtonsCount: goalsNav.length
  };
})()`, "iphone");

// 17. MG-10: Import preview hides payee/amount or pushes button below fold
results["MG-10"] = evalJs(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  // Open Money import dialog
  if (KOS.moneyUI && KOS.moneyUI.importDialog) {
    KOS.moneyUI.importDialog();
    await new Promise(r => setTimeout(r, 200));
    const dlg = document.querySelector(".k-dialog-overlay");
    const preview = document.querySelector(".k-money-csv-preview, table");
    const importBtn = document.querySelector(".k-dialog-foot button.k-btn--primary, [data-ui='money.import-submit']");
    const dRect = dlg ? dlg.getBoundingClientRect() : null;
    const bRect = importBtn ? importBtn.getBoundingClientRect() : null;
    document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
    return {
      dlgFound: Boolean(dlg),
      dialogRect: dRect ? { h: Math.round(dRect.height) } : null,
      btnRect: bRect ? { top: Math.round(bRect.top), bottom: Math.round(bRect.bottom) } : null
    };
  }
  return null;
})()`, "mac");

// 18. MI-01: Mind checkpoint lesson (F1.8) concepts & 4th check
results["MI-01"] = evalJs(`(() => {
  const ev = KOS.mind && KOS.mind.evidence ? KOS.mind.evidence("F1.8") : null;
  const l = KOS.mind && KOS.mind.lesson ? KOS.mind.lesson("F1.8") : null;
  const concepts = KOS.mind && KOS.mind.conceptsOf ? KOS.mind.conceptsOf("F1.8") : [];
  return {
    lesson: l,
    conceptsCount: concepts.length,
    evidenceChecks: ev ? ev.checks : null
  };
})()`);

// 19. MI-02: Mind desk Daily 15 and Continue crushed
results["MI-02"] = evalJs(`(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("subject", "mind");
  const side = document.querySelector(".k-subj-side");
  const d15 = document.querySelector(".k-mind-d15");
  const next = document.querySelector(".k-subj-next");
  const sRect = side ? side.getBoundingClientRect() : null;
  const dRect = d15 ? d15.getBoundingClientRect() : null;
  const nRect = next ? next.getBoundingClientRect() : null;
  return {
    vw: window.innerWidth,
    sideRect: sRect ? { h: Math.round(sRect.height * 10) / 10 } : null,
    d15Rect: dRect ? { h: Math.round(dRect.height * 10) / 10 } : null,
    nextRect: nRect ? { h: Math.round(nRect.height * 10) / 10 } : null
  };
})()`, "iphone");

shot("MI-02-mind-desk-iphone.png", "#/subject/mind", "iphone", `(() => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
})()`);

// 20. PR-01: Afternoon review "Place in a free block" z-index
results["PR-01"] = evalJs(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  if (KOS.dayReview && KOS.dayReview.open) {
    KOS.dayReview.open("afternoon");
    await new Promise(r => setTimeout(r, 200));
    const btn = document.querySelector("[data-ui='review.place-block'], button.k-rev-block");
    const overlay = document.querySelector(".k-dialog-overlay");
    const oZ = overlay ? getComputedStyle(overlay).zIndex : null;
    if (btn) btn.click();
    await new Promise(r => setTimeout(r, 200));
    const menu = document.querySelector(".k-popover, .k-menu, .k-cal-free-blocks");
    const mZ = menu ? getComputedStyle(menu).zIndex : null;
    document.querySelectorAll(".k-dialog-overlay, dialog[open], .k-popover").forEach(d => d.remove());
    return {
      overlayFound: Boolean(overlay),
      overlayZ: oZ,
      btnFound: Boolean(btn),
      menuFound: Boolean(menu),
      menuZ: mZ
    };
  }
  return null;
})()`, "mac");

fs.writeFileSync("docs/audit/2026-11/gemini/evidence/batch3-runtime.json", JSON.stringify(results, null, 2));
console.log("Saved docs/audit/2026-11/gemini/evidence/batch3-runtime.json");
