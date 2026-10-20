/* Kurenai OS — js/data/boundaries.js
   Grade boundaries for the exam papers (roadmap 5.8, docs/exams-plan.md
   §4.3, decision H). One row per board, qualification and series: the raw
   mark needed for each grade. IT stays on js/data/it-grades.js (UMS).

   `confirmed: true` means the row was read from the board's own published
   document; `false` means it comes from secondary tables and is shown as
   provisional, like an unconfirmed IT boundary (invariant 26f). A
   predicted grade says which series it used.

   SOURCES
     AQA 7517 — "Subject grade boundaries – June 2023 / June 2024"
       (filestore.aqa.org.uk, AQA-A-LEVEL-GDE-BDY-JUN-2023/2024.PDF): the
       subject boundaries out of 375 (each paper's 100 raw marks scaled to
       150, plus the NEA's 75) and the NOTIONAL component boundaries AQA
       prints for illustration. Paper 1 is the C# option (all languages
       share the boundaries). The June 2025 file was not reachable when
       this was written (20 October 2026); add it when it is.
     AQA 7516 (AS) — June 2024 document: Paper 2 only.
     Edexcel 9MA0 — subject boundaries out of 300 (three papers of 100),
       June 2023, 2024, 2025, from MathsGenie, Save My Exams and Cognito,
       which agree; not yet checked against Pearson's own document, so
       unconfirmed. Pearson publishes no per-paper grades, so a paper's
       percentage is read against the subject's percentages.          */
window.KOS_BOUNDARIES = {
  v: 1,
  grades: ["A*", "A", "B", "C", "D", "E"],
  rows: [
    /* AQA A-level Computer Science, subject (out of 375) */
    { board: "AQA", qual: "7517", component: "subject", series: "2024-06", max: 375, marks: { "A*": 298, A: 239, B: 194, C: 149, D: 104, E: 60 }, confirmed: true },
    { board: "AQA", qual: "7517", component: "subject", series: "2023-06", max: 375, marks: { "A*": 296, A: 237, B: 191, C: 146, D: 101, E: 56 }, confirmed: true },
    /* notional component boundaries, raw marks (AQA: "for illustrative purposes only") */
    { board: "AQA", qual: "7517", component: "Paper 1", series: "2024-06", max: 100, marks: { "A*": 79, A: 63, B: 50, C: 37, D: 25, E: 13 }, confirmed: true, notional: true },
    { board: "AQA", qual: "7517", component: "Paper 1", series: "2023-06", max: 100, marks: { "A*": 76, A: 58, B: 46, C: 34, D: 22, E: 11 }, confirmed: true, notional: true },
    { board: "AQA", qual: "7517", component: "Paper 2", series: "2024-06", max: 100, marks: { "A*": 74, A: 54, B: 43, C: 33, D: 23, E: 13 }, confirmed: true, notional: true },
    { board: "AQA", qual: "7517", component: "Paper 2", series: "2023-06", max: 100, marks: { "A*": 76, A: 58, B: 46, C: 34, D: 23, E: 12 }, confirmed: true, notional: true },
    { board: "AQA", qual: "7517", component: "NEA", series: "2024-06", max: 75, marks: { "A*": 68, A: 63, B: 52, C: 41, D: 31, E: 21 }, confirmed: true, notional: true },
    { board: "AQA", qual: "7517", component: "NEA", series: "2023-06", max: 75, marks: { "A*": 68, A: 63, B: 52, C: 41, D: 31, E: 21 }, confirmed: true, notional: true },
    /* AQA AS Computer Science (no A* at AS) */
    { board: "AQA", qual: "7516", component: "Paper 2", series: "2024-06", max: 75, marks: { A: 57, B: 50, C: 43, D: 36, E: 30 }, confirmed: true, notional: true },
    /* Edexcel A-level Mathematics, subject (out of 300) */
    { board: "Edexcel", qual: "9MA0", component: "subject", series: "2025-06", max: 300, marks: { "A*": 258, A: 214, B: 178, C: 142, D: 106, E: 71 }, confirmed: false },
    { board: "Edexcel", qual: "9MA0", component: "subject", series: "2024-06", max: 300, marks: { "A*": 251, A: 205, B: 167, C: 130, D: 93, E: 56 }, confirmed: false },
    { board: "Edexcel", qual: "9MA0", component: "subject", series: "2023-06", max: 300, marks: { "A*": 244, A: 196, B: 158, C: 121, D: 84, E: 47 }, confirmed: false }
  ]
};
