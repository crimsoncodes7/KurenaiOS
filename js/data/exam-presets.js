/* Kurenai OS — js/data/exam-presets.js
   The board papers an assessment can start from (roadmap 5.8,
   docs/exams-plan.md §6.2): what each paper covers, its marks and time,
   whether a calculator is allowed, and how its sections are laid out.
   A preset fills a new assessment's fields and its scope; every field
   stays editable on the assessment, which keeps the preset id only as a
   link back here (marks, sections, the index's papers).

   SOURCES. The marks and times are the boards' own assessment tables:
     AQA 7517 (A-level CS) Paper 1 and Paper 2: 100 marks, 2 h 30 each;
       Paper 1 is on screen, with the Skeleton Program and Preliminary
       Material released beforehand. Its Section A is the theory and short
       programs over 4.1–4.4; Sections B–D are the programming sections
       (write a program, questions on the Skeleton Program, modify it).
     AQA 7516 (AS CS) Paper 1 and Paper 2: 75 marks, 1 h 30 each.
     Edexcel 9MA0 (A-level Maths) Papers 1–3: 100 marks, 2 h each; Papers
       1 and 2 are pure, Paper 3 is statistics (A) and mechanics (B).
     Edexcel 8MA0 (AS Maths) Paper 1 (pure): 100 marks, 2 h; Paper 2
       (statistics and mechanics): 60 marks, 1 h 15.
     OCR F201 (Cambridge Advanced National in IT): 60 raw marks (the
       table in js/data/it-grades.js); its time is left to the board's
       timetable, never guessed.
   `index` names the paper in the generated past-paper index
   (js/data/exam-index.js), which is where measured section marks come
   from: a section the index does not cover (CS Paper 1's B–D) is listed
   here with no marks, and the index's own totals say what is left.     */
window.KOS_EXAM_PRESETS = {
  v: 1,
  papers: [
    { id: "aqa-7517-1", subject: "compsci", board: "AQA", qual: "7517", level: "A", paper: "Paper 1",
      title: "AQA Computer Science · Paper 1", marks: 100, mins: 150, calculator: "none",
      include: ["compsci:Paper 1"], index: "aqa-7517-1", onScreen: true, skeleton: true,
      sections: [
        { id: "A", title: "Section A · theory and short programs (4.1–4.4)", indexed: true },
        { id: "B", title: "Section B · write a program", archetype: "program" },
        { id: "C", title: "Section C · questions on the Skeleton Program", archetype: "skeleton-read" },
        { id: "D", title: "Section D · modify the Skeleton Program", archetype: "skeleton-modify" }
      ] },
    { id: "aqa-7517-2", subject: "compsci", board: "AQA", qual: "7517", level: "A", paper: "Paper 2",
      title: "AQA Computer Science · Paper 2", marks: 100, mins: 150, calculator: "none",
      include: ["compsci:Paper 2"], index: "aqa-7517-2",
      sections: [{ id: "all", title: "Written paper (4.5–4.12)", indexed: true }] },
    { id: "aqa-7516-1", subject: "compsci", board: "AQA", qual: "7516", level: "AS", paper: "Paper 1",
      title: "AQA AS Computer Science · Paper 1", marks: 75, mins: 90, calculator: "none",
      include: ["compsci:Paper 1"], excludeYear2: true, index: "aqa-7516-1", onScreen: true, skeleton: true,
      sections: [
        { id: "A", title: "Section A · theory and short programs", indexed: true },
        { id: "B", title: "Section B · write a program", archetype: "program" },
        { id: "C", title: "Section C · questions on the Skeleton Program", archetype: "skeleton-read" },
        { id: "D", title: "Section D · modify the Skeleton Program", archetype: "skeleton-modify" }
      ] },
    { id: "aqa-7516-2", subject: "compsci", board: "AQA", qual: "7516", level: "AS", paper: "Paper 2",
      title: "AQA AS Computer Science · Paper 2", marks: 75, mins: 90, calculator: "none",
      include: ["compsci:Paper 2"], excludeYear2: true, index: "aqa-7516-2",
      sections: [{ id: "all", title: "Written paper", indexed: true }] },
    { id: "edexcel-9ma0-1", subject: "maths", board: "Edexcel", qual: "9MA0", level: "A", paper: "Paper 1",
      title: "Edexcel Maths · Paper 1 (Pure)", marks: 100, mins: 120, calculator: "allowed",
      include: ["maths:Pure"], index: "edexcel-9ma0-1",
      sections: [{ id: "all", title: "Pure mathematics", indexed: true }] },
    { id: "edexcel-9ma0-2", subject: "maths", board: "Edexcel", qual: "9MA0", level: "A", paper: "Paper 2",
      title: "Edexcel Maths · Paper 2 (Pure)", marks: 100, mins: 120, calculator: "allowed",
      include: ["maths:Pure"], index: "edexcel-9ma0-2",
      sections: [{ id: "all", title: "Pure mathematics", indexed: true }] },
    { id: "edexcel-9ma0-3", subject: "maths", board: "Edexcel", qual: "9MA0", level: "A", paper: "Paper 3",
      title: "Edexcel Maths · Paper 3 (Statistics and Mechanics)", marks: 100, mins: 120, calculator: "allowed",
      include: ["maths:Statistics", "maths:Mechanics"], index: "edexcel-9ma0-3",
      sections: [
        { id: "Statistics", title: "Section A · statistics", indexed: true },
        { id: "Mechanics", title: "Section B · mechanics", indexed: true }
      ] },
    { id: "edexcel-8ma0-1", subject: "maths", board: "Edexcel", qual: "8MA0", level: "AS", paper: "Paper 1",
      title: "Edexcel AS Maths · Paper 1 (Pure)", marks: 100, mins: 120, calculator: "allowed",
      include: ["maths:Pure"], excludeYear2: true, index: "edexcel-8ma0-1",
      sections: [{ id: "all", title: "Pure mathematics", indexed: true }] },
    { id: "edexcel-8ma0-2", subject: "maths", board: "Edexcel", qual: "8MA0", level: "AS", paper: "Paper 2",
      title: "Edexcel AS Maths · Paper 2 (Statistics and Mechanics)", marks: 60, mins: 75, calculator: "allowed",
      include: ["maths:Statistics", "maths:Mechanics"], excludeYear2: true, index: "edexcel-8ma0-2",
      sections: [
        { id: "Statistics", title: "Section A · statistics", indexed: true },
        { id: "Mechanics", title: "Section B · mechanics", indexed: true }
      ] },
    { id: "ocr-f201", subject: "it", board: "OCR", qual: "H119", level: "AN", paper: "F201",
      title: "OCR IT · F201", marks: 60, mins: null, calculator: null,
      include: ["it:F201"], itUnit: "F201", lowEvidence: true,
      sections: [{ id: "all", title: "Written paper", indexed: false }] }
  ]
};
