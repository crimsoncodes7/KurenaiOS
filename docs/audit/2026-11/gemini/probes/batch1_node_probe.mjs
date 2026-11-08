import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = "/Users/fj/Developer/KurenaiOS - Web";

// 1. AP-01: count script tags in index.html and sum JS sizes
const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const scriptTags = [...indexHtml.matchAll(/<script\b([^>]*)>/gi)];
let syncCount = 0, deferCount = 0, totalBytes = 0, dataBytes = 0, dataCount = 0;
for (const m of scriptTags) {
  const attrs = m[1];
  const srcMatch = attrs.match(/\bsrc=["']([^"']+)["']/i);
  if (!srcMatch) continue;
  const src = srcMatch[1];
  const isDefer = /\bdefer\b/i.test(attrs);
  if (isDefer) deferCount++; else syncCount++;
  if (!/^https?:/i.test(src)) {
    const p = path.join(ROOT, src);
    if (fs.existsSync(p)) {
      const sz = fs.statSync(p).size;
      totalBytes += sz;
      if (src.startsWith("js/data/")) { dataBytes += sz; dataCount++; }
    }
  }
}

// Load data files into a VM context to inspect CC-01, CC-02, CC-03, CM-01, CM-02
const ctx = vm.createContext({ window: {}, document: { addEventListener() {} }, KOS: { ui: { esc: s => String(s) } }, KOS_DATA: {}, KOS_CONTENT: {} });
ctx.window = ctx;
for (const f of ["js/data/compsci.js", "js/data/maths.js", "js/data/it.js", "js/data/it-f201-spec.js", "js/core/content.js"]) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
}
const contentDir = path.join(ROOT, "js/data/content");
for (const f of fs.readdirSync(contentDir).sort()) {
  if ((f.startsWith("cs-") || f.startsWith("maths-") || f.startsWith("it-") || f.startsWith("bank-")) && f.endsWith(".js")) {
    vm.runInContext(fs.readFileSync(path.join(contentDir, f), "utf8"), ctx, { filename: f });
  }
}

// Helper to walk spec leaves
function leavesOf(subj) {
  const out = [];
  function walk(node, unitId) {
    if (!node) return;
    if (Array.isArray(node)) { node.forEach(n => walk(n, unitId)); return; }
    const u = node.id || unitId;
    if (node.children && node.children.length) node.children.forEach(c => walk(c, u));
    else if (node.topics && node.topics.length) node.topics.forEach(t => walk(t, u));
    else if (node.units && node.units.length) node.units.forEach(un => walk(un, un.id));
    else if (node.sections && node.sections.length) node.sections.forEach(s => walk(s, u));
    else if (node.ref) out.push({ unit: u, ref: node.ref, title: node.title, content: node.content, info: node.info });
  }
  walk(ctx.KOS_DATA[subj], null);
  return out;
}

const itLeaves = leavesOf("it");
// CC-02: check duplicate refs in IT
const itRefCounts = {};
for (const l of itLeaves) {
  itRefCounts[l.ref] = itRefCounts[l.ref] || [];
  itRefCounts[l.ref].push(l.title);
}
const itDuplicates = Object.entries(itRefCounts).filter(([, arr]) => arr.length > 1);

// CC-01: inspect IT spec text for F206.6.1, F204.6.5, F202.5.1, F201.5.2, F200.5.3
const cc01Targets = ["F206.6.1", "F204.6.5", "F202.5.1", "F201.5.2", "F200.5.3"];
const cc01Samples = {};
for (const l of itLeaves) {
  if (cc01Targets.includes(l.ref) || /^F20[02]\.2\./.test(l.ref)) {
    cc01Samples[l.ref + " (" + l.title + ")"] = {
      content: (l.content || []).slice(0, 3),
      info: (l.info || []).slice(0, 3)
    };
  }
}

// CM-01: inspect Maths spec text (including M7.3)
const mathsLeaves = leavesOf("maths");
let mathsGarbledCount = 0;
const cm01Samples = {};
for (const l of mathsLeaves) {
  const txt = JSON.stringify([l.content, l.info]);
  if (/[¬ˆ˜˙˚˛ˇ˘]|(?:\b[a-z]\s+[a-z]\s+[a-z]\b)|(?:Paper \d|Edexcel|Pearson|guidance|inery)/i.test(txt) || l.ref === "M7.3" || l.ref === "P1.1" || l.ref === "P2.1") {
    if (l.ref === "M7.3" || l.ref === "P1.1" || l.ref === "P2.3" || Object.keys(cm01Samples).length < 6) {
      cm01Samples[l.ref + " (" + l.title + ")"] = { content: l.content, info: l.info };
    }
  }
  // Check for broken PDF extraction lines (mid-word splits, column-merge artefacts, raw guidance headers)
  if ((l.content || []).some(c => typeof c === "string" && (c.length > 220 || /\b(Students should|Guidance| exemplification|E\.g\.|e\.g\.)/.test(c)))) {
    mathsGarbledCount++;
  }
}

// CC-03 & CM-02: quiz answer distributions for CS and Maths
function quizDist(prefix) {
  const dist = [0, 0, 0, 0];
  let total = 0;
  for (const [k, v] of Object.entries(ctx.KOS_CONTENT)) {
    if (!k.startsWith(prefix + ":")) continue;
    for (const q of (v.quiz || [])) {
      if (typeof q.ans === "number") {
        dist[q.ans] = (dist[q.ans] || 0) + 1;
        total++;
      }
    }
  }
  return { total, dist, abPct: total ? (((dist[0] + dist[1]) / total) * 100).toFixed(1) + "%" : "0%" };
}

const out = {
  AP_01: {
    syncScriptTags: syncCount,
    deferScriptTags: deferCount,
    totalMB: (totalBytes / (1024 * 1024)).toFixed(2),
    totalBytes,
    dataScriptCount: dataCount,
    dataMB: (dataBytes / (1024 * 1024)).toFixed(2)
  },
  CC_01: cc01Samples,
  CC_02: { totalItLeaves: itLeaves.length, duplicateRefs: itDuplicates },
  CC_03: quizDist("compsci"),
  CM_01: { totalMathsLeaves: mathsLeaves.length, longOrMergedGuidanceLeaves: mathsGarbledCount, samples: cm01Samples },
  CM_02: quizDist("maths")
};

fs.mkdirSync(path.join(ROOT, "docs/audit/2026-11/gemini/evidence"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/audit/2026-11/gemini/evidence/batch1-node.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
