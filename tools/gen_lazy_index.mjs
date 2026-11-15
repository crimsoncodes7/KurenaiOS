/* Kurenai OS — tools/gen_lazy_index.mjs
   Generates js/data/lazy-index.js: the STRUCTURE of what the lazily loaded
   bundles register (quality W2, AP-01; js/core/lazy.js explains the design).

   It boots the whole app in jsdom (every bundle in, as a test boot is), reads
   the registries the lazy files fill, and writes for each object the light
   facts kept and the names of the heavy fields left out:

     KOS_CONTENT["<sid>:<ref>"] of a lazy subject
       p   pages (KOS.content.splitPages over the shipped notes)
       f   flashcards: a count, or [third elements] where any card carries one
           (a card's schedule key comes from it, invariant 87)
       q/e quiz and exam item counts
       r   Code: the ids of the runnable listings; pr its practice ids
       l   light fields kept whole (sims, gens, aqa, _examN)
       h   the heavy fields left out
     KOS_CODE.CONCEPTS / TASKS / CARDS / CAPSTONES / PROJECTS / DATASETS
     KOS_EXAMS.index (all but its topic packs) and KOS_EXAMS.deep (papers → leaves)

   Run after changing any file inside a <template data-lazy> block of
   index.html:   node tools/gen_lazy_index.mjs
   smoke142 fails when the checked-in file is stale:  --check               */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "js/data/lazy-index.js");
const { boot } = require("./lib/app-harness.js");

/* a field is LIGHT when it is small; the rest are named and left out */
const LIGHT_MAX = 400;
const size = (v) => (typeof v === "function" ? Infinity : (JSON.stringify(v) || "").length);

function lazyBundles(html) {
  const out = {};
  for (const m of html.matchAll(/<template data-lazy="([^"]+)">([\s\S]*?)<\/template>/g)) {
    (out[m[1]] = out[m[1]] || []).push(...[...m[2].matchAll(/<script src="([^"]+)"><\/script>/g)].map((x) => x[1]));
  }
  return out;
}

export async function build() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const bundles = lazyBundles(html);
  const app = await boot();
  if (app.errors.length) throw new Error("the app did not boot clean: " + app.errors[0]);
  const w = app.window, KOS = app.KOS;
  /* ORDER IS KEPT everywhere (never sorted): the due queue, a deck and a
     task list break ties by the order their registry was filled in */
  const ix = { v: 1, content: [], code: {}, exams: {} };

  /* ---- curriculum content, by subject bundle ---- */
  const C = w.KOS_CONTENT;
  Object.keys(C).forEach((key) => {
    const sid = key.slice(0, key.indexOf(":"));
    const bundle = "content-" + sid;
    if (!bundles[bundle]) return;                    /* an eager subject */
    const e = C[key], row = {};
    if (e.notes) row.p = KOS.content.splitPages(e.notes).length;
    if (e.flashcards) {
      const third = e.flashcards.map((c) => (c[2] == null ? null : c[2]));
      row.f = third.some((x) => x != null) ? third : third.length;
    }
    if (e.quiz) row.q = e.quiz.length;
    if (e.exam) row.e = e.exam.length;
    if (sid === "code") {
      const runs = [];
      (function walk(blocks) {
        (blocks || []).forEach((b) => {
          if (!b || typeof b !== "object") return;
          if (b.run) runs.push(b.run.id);
          if (b.callout && Array.isArray(b.callout.body)) walk(b.callout.body);
        });
      })(e.notes);
      if (runs.length) row.r = runs;
      if (e.practice) {
        const pr = {};
        ["predict", "fill", "bug"].forEach((k) => { if (e.practice[k] && e.practice[k].length) pr[k] = e.practice[k].map((it) => it.id); });
        row.pr = pr;
      }
    }
    const light = {}, heavy = [];
    Object.keys(e).forEach((k) => {
      if (["notes", "flashcards", "quiz", "exam", "practice"].includes(k) || size(e[k]) > LIGHT_MAX) heavy.push(k);
      else light[k] = e[k];
    });
    if (Object.keys(light).length) row.l = light;
    row.h = heavy.join(",");
    ix.content.push([key, bundle, row]);
  });

  /* ---- Code's registries ---- */
  const K = w.KOS_CODE;
  const KEEP = {
    CONCEPTS: null,                                   /* whole: every field is small */
    TASKS: ["id", "lesson", "tier", "concepts", "title", "requires", "minutes", "phone", "db"],
    CARDS: null,
    CAPSTONES: null,
    PROJECTS: null
  };
  const BIG_OK = { PROJECTS: { milestones: true } };  /* structure the evidence reads */
  Object.keys(KEEP).forEach((reg) => {
    const rows = {};
    Object.keys(K[reg] || {}).forEach((id) => {
      const o = K[reg][id], light = {}, heavy = [];
      Object.keys(o).forEach((k) => {
        const keep = KEEP[reg] ? KEEP[reg].includes(k) : size(o[k]) <= LIGHT_MAX || (BIG_OK[reg] && BIG_OK[reg][k]);
        if (keep && typeof o[k] !== "function") light[k] = o[k]; else heavy.push(k);
      });
      const row = { l: light };
      if (heavy.length) row.h = heavy.join(",");
      /* a project's scaffold files are their own bundle */
      if (reg === "PROJECTS" && heavy.includes("files")) row.hb = { files: "code-projects" };
      rows[id] = row;
    });
    ix.code[reg] = rows;
  });
  ix.code.DATASETS = Object.keys(K.DATASETS || {});

  /* ---- the Exams hub's evidence ---- */
  const X = w.KOS_EXAMS || {};
  /* the index's papers, questions and A-level-only leaves stay at boot:
     readiness, a scope and a goal are computed from them. The topic-pack
     list (two thirds of the file) is the part left out. */
  if (bundles["exam-index"] && X.index) {
    const light = {};
    Object.keys(X.index).forEach((k) => { if (k !== "packs") light[k] = X.index[k]; });
    ix.exams.index = { l: light, h: "packs" };
  }
  if (bundles["exams-deep"]) {
    ix.exams.deep = {};
    Object.keys(X.deep || {}).forEach((pid) => {
      const P = X.deep[pid], light = {}, heavy = [];
      Object.keys(P).forEach((k) => {
        if (k === "leaves") return;
        if (size(P[k]) <= LIGHT_MAX) light[k] = P[k]; else heavy.push(k);
      });
      const leaves = {};
      Object.keys(P.leaves || {}).forEach((ref) => { leaves[ref] = Object.keys(P.leaves[ref]).join(","); });
      ix.exams.deep[pid] = { l: light, h: heavy.join(","), leaves };
    });
  }

  const body = JSON.stringify(ix);
  return "/* GENERATED by tools/gen_lazy_index.mjs — do not edit by hand.\n" +
    "   The structure of what the lazily loaded bundles register (W2, AP-01):\n" +
    "   which topics have content, card keys, page and listing counts, Code's\n" +
    "   tasks, concepts and cards. js/core/lazy.js turns each row into a stub\n" +
    "   until its bundle loads. Regenerate after changing a lazy file. */\n" +
    "window.KOS_LAZY_INDEX = " + body + ";\n" +
    "if (window.KOS && window.KOS.lazy) window.KOS.lazy.install(window.KOS_LAZY_INDEX);\n";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const text = await build();
  if (process.argv.includes("--check")) {
    const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (have !== text) { console.error("js/data/lazy-index.js is stale: run node tools/gen_lazy_index.mjs"); process.exit(1); }
    console.log("lazy-index.js is current (" + Math.round(text.length / 1024) + " KB)");
  } else {
    fs.writeFileSync(OUT, text);
    console.log("wrote js/data/lazy-index.js (" + Math.round(text.length / 1024) + " KB)");
  }
  process.exit(0);
}
