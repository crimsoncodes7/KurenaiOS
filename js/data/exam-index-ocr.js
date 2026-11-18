/* Kurenai OS — data/exam-index-ocr.js
   OCR's IT papers for the past-paper index (the audit of 18 November 2026,
   U7). The generated index (js/data/exam-index.js, invariant 125) is built
   from the A-level folder, which holds AQA and Edexcel only; OCR's H119
   papers come from the user's own copy of OCR's Sample Assessment Material
   for F201 (Cambridge Advanced National in IT: Data Analytics, version 3.0,
   November 2024), read from its mark scheme's "Max mark" lines. Like the
   generated index it holds references and numbers only: the paper, the
   sitting, each part's label and its marks, never a word of the paper.
   KOS.examPapers merges it into KOS_EXAMS.index (and again whenever the
   index bundle loads). A new OCR sitting adds a row here.            */
window.KOS_EXAMS_OCR = {
  papers: {
    "ocr-f201": { subject: "it", board: "OCR", qual: "H119", level: "AN", paper: "F201",
      title: "OCR IT F201 · Big data and machine learning", marks: 60, sittings: ["specimen"] }
  },
  /* [paper, sitting, section, label, marks, leaves, why] as in the index;
     each part's F201 leaves read from what the SAM asks (its topic, not
     its words) */
  questions: [
    ["1(a)", 1, ["F201.1.1"]], ["1(b)", 2, ["F201.1.1"]], ["1(c)", 3, ["F201.2.2"]], ["1(d)", 3, ["F201.2.2"]],
    ["2(a)", 1, ["F201.4.1"]], ["2(b)", 2, ["F201.4.1"]], ["2(c)", 6, ["F201.4.1"]],
    ["3(a)", 1, ["F201.1.3", "F201.1.4"]], ["3(b)", 2, ["F201.1.4"]], ["3(c)", 2, ["F201.2.1"]],
    ["4(a)", 2, ["F201.2.4"]], ["4(b)", 2, ["F201.2.4"]], ["4(c)", 1, ["F201.2.4"]], ["5", 2, ["F201.3.1"]],
    ["6(a)", 1, ["F201.2.5"]], ["6(b)", 2, ["F201.2.5"]], ["6(c)", 9, ["F201.2.6"]], ["6(d)", 2, ["F201.2.6"]], ["6(e)", 4, ["F201.2.6"]],
    ["7(a)", 2, ["F201.4.2"]], ["7(b)(i)", 2, ["F201.4.2"]], ["7(b)(ii)", 4, ["F201.4.2"]], ["8", 4, ["F201.5.1"]]
  ].map(function (q) { return ["ocr-f201", "specimen", "", q[0], q[1], q[2].map(function (r) { return "it:" + r; }), ""]; })
};
