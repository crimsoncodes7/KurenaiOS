#!/usr/bin/env node
/* Kurenai OS — tools/card_lint.mjs
   The flashcard quality pass (roadmap 5.21): a flashcard is quick recall,
   so its front must say what to recall and its back must be worth having.
   tools/quiz_bias.mjs does the same for quiz options.

   Boots the app (tools/lib/app-harness.js, every bundle eager) and reads
   every Computer Science, Maths and IT flashcard as the learner gets it —
   after the banks are merged and Maths' moved cards have left (5.19 item
   4) — under its schedule key (KOS.srs.shippedKey's rule). A card is
   FLAGGED for:

     label   a bare prompt: no question word, no yes/no opener and no
             instruction ("Name", "State", "Define", …), no formula to work
             on, and three words or fewer — or six or fewer with nothing
             relating them ("of", "vs", "for", ":", …). "Protocol?",
             "Read-ahead pattern?", "Wires crossing without a dot?".
     yesno   a bare yes/no: the back opens Yes / No / True / False and gives
             fewer than six words of reason. "Yes.", "No — not creditworthy."
     long    an over-long back: more than 35 words (about the 99th
             percentile; a formula counts as one word). Too much for quick
             recall: tighten it or split it.
     calc    (Computer Science) a worked calculation — a base conversion,
             binary arithmetic, a normalisation, a file size — which is
             practice for the quiz, not recall.

   A flag that was reviewed and is right as it is goes in
   tools/card_lint-allow.json with its reason:
     { "cards":  [{ "key": "<schedule key>", "rule": "<rule>", "front": "<front>", "why": "…" }],
       "leaves": [{ "leaf": "<sid:ref>", "why": "…" }] }
   A card entry holds only while the front is unchanged (a rewrite is
   reviewed again); a leaf entry covers every card in it.

     node tools/card_lint.mjs            per-subject counts and every flag
     node tools/card_lint.mjs --summary  the counts only
     node tools/card_lint.mjs --check    exit 1 when a flag is not allowed
     node tools/card_lint.mjs --json     the flags as JSON
     node tools/card_lint.mjs --all      also list the allowed flags

   smoke197 runs --check. */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ALLOW = path.join(ROOT, "tools/card_lint-allow.json");
export const SUBJECTS = ["compsci", "maths", "it"];
export const LONG = 35;

const WH = /\b(what|why|how|which|when|where|who|whose|whom)\b/i;
const AUX = /^(is|are|was|were|does|do|did|can|could|should|would|will|has|have|had|must|may|might|shall|true or false)\b/i;
const IMP = /^(name|state|give|define|explain|describe|list|identify|compare|contrast|distinguish|outline|write|convert|calculate|find|complete|order|match|fill|sketch|draw|show|prove|solve|evaluate|simplify|express|expand|factorise|differentiate|integrate|translate|recall|suggest|justify|interpret|trace|summarise|spot|correct|rewrite|classify|predict|estimate|work out|determine|use|apply|decide|choose|say|label|construct|derive|rearrange|sort|reduce|represent|encode|decode|normalise|add|subtract|multiply|divide|round|count|fix|rank|plot|split|pick|select|recognise)\b/i;
const CUE = /\b(of|vs|versus|for|in|between|from|to|on|with|by|after|before|if|when|per|than|as|at|into|under|over)\b|[:=—–,]/i;
const YESNO = /^(yes|no|true|false)\b([\s.,;:!—–-]*)([\s\S]*)$/i;
/* a CS number-representation sum: a conversion, binary arithmetic, a
   normalisation, a size worked out — a specific number (a bit pattern, a
   subscripted or hex value, a decimal fraction, a number of two digits or
   more) to be put into a representation, or an instruction to work one
   out. Recognising a form ("Is 11000000 normalised?"), a range, a limit
   or a place value is recall and stays. */
const CALC_VERB = /^(Convert|Normalise|Calculate|Work out|Add|Subtract|Multiply|Divide|Compute|Represent)\b/;
const CALC_NUM = /(?<![\w.])[−-]?(?:[01]{4,}(?:\.[01]+)?|[0-9A-F]+[₂₁₀₆]+|\d+\.\d+|\d{2,}|[0-9A-F]{2,}(?= hex))(?!\w)/;
const CALC_TO = /\b(hex|hexadecimal|denary|decimal|binary|two's complement|floating point|fixed point|normalised|mantissa|unsigned|MB|kB|KiB|MiB|GiB|bytes|file size|duration)\b|\(\d,\s?\d\)/i;
const CALC_NOT = /\b(range|most negative|smallest|highest|largest|place value|how many|why|which|subnet|what might|what happens)\b|^(is|are|does|can)\b/i;
export function isCalc(q) {
  const t = String(q);
  if (/`/.test(t) || !/\d/.test(t)) return false;
  return CALC_VERB.test(t) || (CALC_NUM.test(t) && CALC_TO.test(t) && !CALC_NOT.test(t));
}

function plain(s) { return String(s).replace(/\$[^$]*\$/g, " x ").replace(/\s+/g, " ").trim(); }
export function words(s) { return plain(s).split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w)).length; }

/* the rules for one card: a list of { rule, why } */
export function lint(sid, q, a) {
  const out = [];
  q = String(q).trim(); a = String(a).trim();
  const t = String(q).replace(/\$[^$]*\$/g, " ").replace(/\s+/g, " ").trim();
  const asks = WH.test(t) || AUX.test(t) || IMP.test(t);
  if (!asks && q.indexOf("$") < 0) {
    const n = t.replace(/[?….\s]+$/, "").split(" ").filter((w) => /\p{L}/u.test(w)).length;
    if (n <= 3 || (n <= 6 && !CUE.test(t))) out.push({ rule: "label", why: "a label, not a question" });
  }
  const m = YESNO.exec(a);
  if (m && (AUX.test(t) || m[2].trim() || !m[3].trim()) && words(m[3]) < 6) out.push({ rule: "yesno", why: "a bare yes/no" });
  if (words(a) > LONG) out.push({ rule: "long", why: words(a) + " words" });
  if (sid === "compsci" && isCalc(q)) out.push({ rule: "calc", why: "a worked calculation" });
  return out;
}

export function shippedKey(sid, ref, c, i) {
  const k = c[2];
  if (k == null) return sid + ":" + ref + ":" + i;
  return typeof k === "string" && k.indexOf(":") >= 0 ? k : sid + ":" + ref + ":" + k;
}

export function readAllow(file = ALLOW) {
  const j = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
  return { cards: j.cards || [], leaves: j.leaves || [] };
}

/* every card of the three subjects, linted, each flag marked allowed or not */
export async function run(opts = {}) {
  const { boot } = require("./lib/app-harness.js");
  const app = await boot({ clock: "2026-11-16T10:00:00" });
  await app.settle();
  const C = app.window.KOS_CONTENT;
  const allow = readAllow(opts.allow);
  const byCard = {}, byLeaf = {}, used = new Set();
  allow.cards.forEach((e, i) => { byCard[e.key + "|" + e.rule] = { e, i }; });
  allow.leaves.forEach((e) => { byLeaf[e.leaf] = e; });
  const cards = {}, flags = [];
  SUBJECTS.forEach((s) => { cards[s] = 0; });
  for (const topic of Object.keys(C).sort((a, b) => a.localeCompare(b, "en", { numeric: true }))) {
    const sid = topic.slice(0, topic.indexOf(":")), ref = topic.slice(sid.length + 1);
    if (SUBJECTS.indexOf(sid) < 0) continue;
    (C[topic].flashcards || []).forEach((c, i) => {
      cards[sid]++;
      const key = shippedKey(sid, ref, c, i);
      lint(sid, c[0], c[1]).forEach((f) => {
        let allowed = null;
        const hit = byCard[key + "|" + f.rule];
        if (hit && hit.e.front === String(c[0])) { allowed = hit.e.why; used.add(hit.i); }
        else if (byLeaf[topic]) allowed = byLeaf[topic].why;
        flags.push({ sid, topic, key, rule: f.rule, why: f.why, q: String(c[0]), a: String(c[1]), allowed });
      });
    });
  }
  const stale = allow.cards.filter((e, i) => !used.has(i));
  return { cards, flags, stale };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const r = await run();
  const open = r.flags.filter((f) => !f.allowed);
  if (args.includes("--json")) { console.log(JSON.stringify(args.includes("--all") ? r.flags : open, null, 1)); process.exit(0); }
  for (const s of SUBJECTS) {
    const fs_ = r.flags.filter((f) => f.sid === s), op = fs_.filter((f) => !f.allowed);
    const per = {};
    op.forEach((f) => { per[f.rule] = (per[f.rule] || 0) + 1; });
    console.log(s.padEnd(8), String(r.cards[s]).padStart(5), "cards ·", op.length, "flagged", Object.keys(per).length ? "(" + Object.entries(per).map(([k, v]) => k + " " + v).join(", ") + ")" : "", "·", fs_.length - op.length, "allowed");
  }
  if (!args.includes("--summary")) {
    (args.includes("--all") ? r.flags : open).forEach((f) => console.log("  " + f.rule.padEnd(6) + f.key + (f.allowed ? " [allowed]" : "") + "  " + f.q.slice(0, 70) + "  →  " + f.a.slice(0, 60)));
  }
  if (r.stale.length) console.log("card_lint: " + r.stale.length + " allowlist entr" + (r.stale.length === 1 ? "y matches" : "ies match") + " no flag (the card changed or is gone):\n" + r.stale.map((e) => "  " + e.key + " " + e.rule).join("\n"));
  if (args.includes("--check")) {
    if (open.length || r.stale.length) { console.log("card_lint: " + open.length + " flag(s) not allowed, " + r.stale.length + " stale allowlist entr(ies)"); process.exit(1); }
    console.log("card_lint: clean (" + r.flags.length + " allowed)");
  }
  process.exit(0);
}
