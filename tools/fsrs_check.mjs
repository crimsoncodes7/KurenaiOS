#!/usr/bin/env node
/* tools/fsrs_check.mjs — KOS.fsrs against the reference (docs/fsrs-plan.md §5).

   Replays seeded review sequences — every grade, same-day reviews, on-time,
   early and very late answers — through js/core/fsrs.js AND through py-fsrs
   (pinned, below) with no learning steps and no fuzz, and fails on any
   stability or difficulty more than 1e-4 apart (relative) or any interval
   that differs. It also holds two properties of the SM-2 conversion
   (fsrs-rs memory_state_from_sm2): at r = 0.9 the stability IS the SM-2
   interval, and an on-time Good multiplies it by the SM-2 ease (where the
   difficulty is not clamped), which is what makes the switch invisible.

   Not part of the jsdom smoke gate: it needs Python. It uses `python3`
   when py-fsrs is importable, else builds a venv in the OS temp folder.
   Run it after any change to js/core/fsrs.js:   node tools/fsrs_check.mjs */
import { createRequire } from "module";
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

const require = createRequire(import.meta.url);
const F = require("../js/core/fsrs.js");
const PY_FSRS = "6.3.2";

/* ---- a Python with py-fsrs ---- */
function python() {
  const has = (py) => {
    try { return execFileSync(py, ["-I", "-c", "import fsrs,importlib.metadata as m;print(m.version('fsrs'))"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() === PY_FSRS; }
    catch (e) { return false; }
  };
  if (has("python3")) return "python3";
  const venv = path.join(os.tmpdir(), "kos-fsrs-venv-" + PY_FSRS);
  const py = path.join(venv, "bin", "python3");
  if (!fs.existsSync(py)) execFileSync("python3", ["-m", "venv", venv], { stdio: "inherit" });
  if (!has(py)) execFileSync(py, ["-m", "pip", "install", "-q", "--disable-pip-version-check", "fsrs==" + PY_FSRS], { stdio: "inherit" });
  return py;
}

/* ---- seeded sequences ---- */
let seed = 20261020;
const rnd = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const seqs = [];
for (let n = 0; n < 400; n++) {
  const steps = [];
  const len = 2 + Math.floor(rnd() * 12);
  for (let i = 0; i < len; i++) {
    const g = pick([1, 2, 3, 3, 3, 4]);
    // the gap BEFORE this review: same day, short, or anything up to a year late
    const gap = i === 0 ? 0 : pick([0, 0, 1, 2, 3, 5, 8, 13, 30, 60, 120, 365]);
    steps.push([g, gap]);
  }
  seqs.push(steps);
}

/* ---- ours ---- */
const ours = seqs.map((steps) => {
  let prev = null;
  return steps.map(([g, gap]) => {
    const m = F.memory(prev, g, gap);
    prev = m;
    return [m.s, m.d, F.interval(m.s, 0.9)];
  });
});

/* ---- theirs ---- */
const PY = `
import json, sys
from datetime import datetime, timedelta, timezone
from fsrs import Scheduler, Card, Rating
sch = Scheduler(learning_steps=(), relearning_steps=(), enable_fuzzing=False, desired_retention=0.9)
out = []
for steps in json.load(sys.stdin):
    card = Card()
    t = datetime(2026, 1, 1, 12, tzinfo=timezone.utc)
    rows = []
    for g, gap in steps:
        t = t + timedelta(days=gap)
        card, _ = sch.review_card(card, Rating(g), t)
        rows.append([card.stability, card.difficulty, (card.due - t).days])
    out.append(rows)
print(json.dumps(out))
`;
const theirs = JSON.parse(execFileSync(python(), ["-I", "-c", PY], { input: JSON.stringify(seqs), maxBuffer: 64 << 20 }).toString());

let bad = 0, checked = 0;
const near = (a, b) => Math.abs(a - b) <= 1e-4 * Math.max(1, Math.abs(b));
seqs.forEach((steps, i) => steps.forEach((st, j) => {
  checked++;
  const [s, d, ivl] = ours[i][j], [S, D, IVL] = theirs[i][j];
  if (!near(s, S) || !near(d, D) || ivl !== IVL) {
    if (bad++ < 10) console.log(`seq ${i} step ${j} ${JSON.stringify(steps.slice(0, j + 1))}: ours s=${s} d=${d} ivl=${ivl}; py-fsrs s=${S} d=${D} ivl=${IVL}`);
  }
}));

/* ---- the SM-2 conversion ---- */
let convBad = 0, convChecked = 0;
for (const ef of [1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 2.7, 2.9, 3.1]) {
  for (const ivl of [1, 2, 3, 6, 10, 15, 30, 60, 120, 365]) {
    convChecked++;
    const c = F.fromSM2(ef, ivl, 0.9);
    const okS = near(c.s, ivl);
    const g = F.memory(c, 3, ivl).s / c.s;
    const clamped = c.d <= 1 || c.d >= 10;
    const okG = clamped || Math.abs(g - ef) < 1e-6;
    const okDue = F.interval(c.s, 0.9) === ivl;
    if (!okS || !okG || !okDue) {
      if (convBad++ < 10) console.log(`fromSM2(${ef}, ${ivl}): s=${c.s} d=${c.d} good×=${g} interval=${F.interval(c.s, 0.9)}`);
    }
  }
}

console.log(`fsrs_check: ${checked - bad}/${checked} review steps match py-fsrs ${PY_FSRS}; ${convChecked - convBad}/${convChecked} SM-2 conversions hold`);
process.exit(bad || convBad ? 1 : 0);
