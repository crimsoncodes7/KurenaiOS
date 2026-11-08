import fs from 'node:fs';

const filePath = process.argv[2] || "docs/audit/2026-11/gemini/p0p1-verification.jsonl";
const lines = fs.readFileSync(filePath, "utf8").trim().split("\n");

console.log(`Checking ${lines.length} lines in ${filePath}...`);

const validSteps = new Set(["blind", "skepticA", "skepticB", "final"]);
const validVerdicts = new Set([
  "confirmed", "partially-confirmed", "not-reproducible",
  "incorrectly-described", "incorrect-severity", "duplicate", "inconclusive"
]);
const validSeverities = new Set(["P0", "P1", "P2", "P3", null]);
const validConfidences = new Set(["high", "medium", "low"]);

let errors = 0;

lines.forEach((line, idx) => {
  let obj;
  try {
    obj = JSON.parse(line);
  } catch (e) {
    console.error(`Line ${idx + 1}: Invalid JSON - ${e.message}`);
    errors++;
    return;
  }

  if (!obj.id) {
    console.error(`Line ${idx + 1}: Missing id`);
    errors++;
  }
  if (!validSteps.has(obj.step)) {
    console.error(`Line ${idx + 1}: Invalid step '${obj.step}'`);
    errors++;
  }

  if (obj.step === "final") {
    if (!validVerdicts.has(obj.verdict)) {
      console.error(`Line ${idx + 1} (${obj.id}): Invalid verdict '${obj.verdict}'`);
      errors++;
    }
    if (!validSeverities.has(obj.proposedSeverity)) {
      console.error(`Line ${idx + 1} (${obj.id}): Invalid proposedSeverity '${obj.proposedSeverity}'`);
      errors++;
    }
    if (!validConfidences.has(obj.confidence)) {
      console.error(`Line ${idx + 1} (${obj.id}): Invalid confidence '${obj.confidence}'`);
      errors++;
    }
    if (typeof obj.rootCauseAgrees !== "boolean") {
      console.error(`Line ${idx + 1} (${obj.id}): rootCauseAgrees must be boolean, got ${typeof obj.rootCauseAgrees}`);
      errors++;
    }
    if (!Array.isArray(obj.evidence)) {
      console.error(`Line ${idx + 1} (${obj.id}): evidence must be array`);
      errors++;
    }
  }
});

if (errors === 0) {
  console.log(`All ${lines.length} lines are valid!`);
} else {
  console.error(`Found ${errors} errors.`);
  process.exit(1);
}
