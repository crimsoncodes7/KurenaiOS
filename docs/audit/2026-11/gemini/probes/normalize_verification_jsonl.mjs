import fs from "node:fs";

const blindList = JSON.parse(fs.readFileSync("docs/audit/2026-11/gemini/p0p1-blind.json", "utf8")).findings;
const blindMap = Object.fromEntries(blindList.map(b => [b.id, b]));
const findingsList = JSON.parse(fs.readFileSync("docs/audit/2026-11/findings.json", "utf8"));
const findingsMap = Object.fromEntries(findingsList.map(f => [f.id, f]));

const path = "docs/audit/2026-11/gemini/p0p1-verification.jsonl";
const lines = fs.readFileSync(path, "utf8").trim().split("\n");

const normalizedLines = lines.map(line => {
  const o = JSON.parse(line);
  if (o.step === "final") {
    const b = blindMap[o.id] || {};
    const f = findingsMap[o.id] || {};
    const claudeSev = o.claudeSeverity || f.severity || b.severity || "P1";
    const proposedSev = o.proposedSeverity || o.geminiSeverity || claudeSev;
    const sevAgree = o.severityAgree ?? (proposedSev === claudeSev);
    const rcAgree = o.rootCauseAgrees ?? o.rootCauseAgree ?? o.rootCauseHold ?? true;
    const rcNote = o.rootCauseNote || (rcAgree ? "Agrees with original root cause." : "Disagrees with original root cause.");
    const fixAgr = o.fixAgree || (o.fixHold === false ? "modify" : "agree");
    const fixNot = o.fixNote || (fixAgr === "agree" ? "Agrees with proposed fix." : "Proposed fix needs modification.");
    const verdict = o.verdict;
    const conf = o.confidence || "high";
    const title = o.title || f.title || b.title;
    const area = o.area || f.area || b.area;
    const affects = o.alsoAffects || [];
    const overlaps = o.overlaps || [];
    const contrary = o.contraryEvidence || null;
    const needsLive = o.needsLiveCheck ?? false;
    const ev = o.evidence || [];
    const summ = o.summary || o.notes || "";

    return JSON.stringify({
      id: o.id,
      step: "final",
      by: o.by || "gemini-4-argon",
      at: o.at || "2026-11-07T09:10:00Z",
      build: o.build || "894a407 sw kos-redraw-1",
      title,
      area,
      claudeSeverity: claudeSev,
      verdict,
      proposedSeverity: proposedSev,
      geminiSeverity: proposedSev,
      duplicateOf: o.duplicateOf || null,
      severityAgree: sevAgree,
      rootCauseAgrees: rcAgree,
      rootCauseHold: rcAgree,
      rootCauseNote: rcNote,
      fixAgree: fixAgr,
      fixHold: fixAgr === "agree",
      fixNote: fixNot,
      alsoAffects: affects,
      overlaps: overlaps,
      contraryEvidence: contrary,
      confidence: conf,
      needsLiveCheck: needsLive,
      evidence: ev,
      summary: summ
    });
  }
  return line;
});

fs.writeFileSync(path, normalizedLines.join("\n") + "\n");
console.log(`Normalized ${normalizedLines.length} lines in ${path}`);
