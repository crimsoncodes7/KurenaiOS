/* Kurenai OS — tools/validate_content.js
   The canonical deep-content validator (consolidates the former root-level
   validate_task.js / validate_data.js and the old per-task version of this
   file, which all hardcoded their file lists and, in two cases, absolute
   paths).

   Usage:
     node tools/validate_content.js                 # every js/data/content/*.js
     node tools/validate_content.js js/data/content/cs-algorithms.js …

   ERRORS (exit 1):
   - a file fails to eval or registers zero KOS_CONTENT keys
   - an entry has no notes array
   - a notes array contains a bare string block (invariant #25 — prose must
     be wrapped in callouts, never plain paragraphs)
   - a quiz item's `ans` index is out of range for its `opts`

   WARNINGS (informational — the depth-standard nudges the old validators
   printed; absence is not an error because not every leaf needs every block):
   - no table / no steps / no code block / no callout-wrapped kv in an entry */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "js", "data", "content");

const args = process.argv.slice(2);
const files = args.length
  ? args.map((f) => path.resolve(ROOT, f))
  : fs.readdirSync(CONTENT_DIR)
      .filter((f) => f.endsWith(".js"))
      .map((f) => path.join(CONTENT_DIR, f));

let errors = 0;
let warnings = 0;

function err(msg) { console.error("  ERROR   " + msg); errors++; }
function warn(msg) { console.warn("  warn    " + msg); warnings++; }

function validateFile(filePath) {
  const rel = path.relative(ROOT, filePath);
  console.log("Validating " + rel + " …");

  // fresh registry per file so keys can't bleed between files
  global.window = { KOS_CONTENT: {} };
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    err(rel + " — unreadable: " + e.message);
    return;
  }
  try {
    eval(content);
  } catch (e) {
    err(rel + " — failed to eval: " + e.message);
    return;
  }

  const keys = Object.keys(global.window.KOS_CONTENT);
  if (!keys.length) {
    err(rel + " — registered zero KOS_CONTENT keys");
    return;
  }
  console.log("  " + keys.length + " key" + (keys.length === 1 ? "" : "s") + ": " + keys.join(", "));

  keys.forEach((key) => {
    const entry = global.window.KOS_CONTENT[key];

    if (!entry.notes || !Array.isArray(entry.notes)) {
      err(key + " — missing notes array");
      return;
    }

    entry.notes.forEach((note) => {
      if (typeof note === "string") {
        err(key + ' — bare string paragraph in notes (wrap prose in a callout): "' +
          note.slice(0, 80) + (note.length > 80 ? "…" : "") + '"');
      }
    });

    (entry.quiz || []).forEach((q, i) => {
      if (!Array.isArray(q.opts) || q.ans == null || q.ans < 0 || q.ans >= q.opts.length) {
        err(key + " — quiz #" + (i + 1) + " has an out-of-range ans index");
      }
    });

    const hasCalloutKV = entry.notes.some((n) => n && n.callout && Array.isArray(n.callout.body) &&
      n.callout.body.some((b) => b && b.kv));
    const hasTable = entry.notes.some((n) => n && n.table);
    const hasSteps = entry.notes.some((n) => n && (n.steps || n.worked));
    const hasCode = entry.notes.some((n) => n && n.code);
    if (!hasCalloutKV) warn(key + " — no callout-wrapped kv (terminology box)");
    if (!hasTable) warn(key + " — no table");
    if (!hasSteps) warn(key + " — no steps/worked block");
    if (!hasCode) warn(key + " — no code block");
  });
}

files.forEach(validateFile);

console.log("\n" + files.length + " file(s) checked — " + errors + " error(s), " + warnings + " warning(s).");
if (errors) process.exit(1);
console.log("Validation successful.");
