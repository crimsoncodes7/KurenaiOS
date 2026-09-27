/* Kurenai OS — js/data/it-grades.js
   OCR Cambridge Advanced National in IT: Data Analytics (H019 / H119):
   the units being taken, their mark scales and the grade boundaries, in ONE
   table (roadmap 1.2). KOS.itUnits stores the marks; the hub derives every
   grade, aggregate and "marks needed" figure from this table.

   WHAT IS KNOWN (27 September 2026):
     · every unit is worth 60 UMS (uniform marks);
     · the exam units (F200, F201) are marked out of 60 raw, 1 raw = 1 UMS;
     · the NEA units (F202, F204, F206) are marked out of 24 raw,
       1 raw = 2.5 UMS;
     · the Extended Certificate (H119) is the sum of five units, 300 UMS, and
       270 / 300 is a Distinction*.
     The raw → UMS rule is the linear one above. OCR publishes a conversion
     per series; when a result arrives as UMS, the stored UMS is used as-is
     and the linear rule is never consulted.

   WHAT IS A PLACEHOLDER: every boundary marked `confirmed: false`. They
   follow the usual 40 / 60 / 80 / 90 % pattern of the uniform scale and
   MUST be checked against OCR's published boundaries. Change a value and
   set `confirmed: true` — nothing else needs to move.

   F203 and F205 are not taken and are not listed (they are not in the
   generated specification either, tools/gen_data.py IT_NOT_TAKEN).        */
window.KOS_IT_GRADES = {
  v: 1,
  board: "OCR Cambridge Advanced National · IT: Data Analytics",

  /* the grades, best first — the order every derivation walks */
  grades: ["Distinction*", "Distinction", "Merit", "Pass"],

  units: {
    F200: { kind: "exam", rawMax: 60, umsMax: 60 },
    F201: { kind: "exam", rawMax: 60, umsMax: 60 },
    F202: { kind: "nea", rawMax: 24, umsMax: 60 },
    F204: { kind: "nea", rawMax: 24, umsMax: 60 },
    F206: { kind: "nea", rawMax: 24, umsMax: 60 }
  },

  /* a unit's grade from its UMS (out of 60) — minimum UMS for each grade */
  unitBoundaries: [
    { grade: "Distinction*", ums: 54, confirmed: false },
    { grade: "Distinction", ums: 48, confirmed: false },
    { grade: "Merit", ums: 36, confirmed: false },
    { grade: "Pass", ums: 24, confirmed: false }
  ],

  qualifications: {
    /* Year 1: the Certificate, graded Distinction (the student's record) */
    H019: {
      name: "Certificate",
      units: ["F200", "F202"],
      umsMax: 120,
      boundaries: [
        { grade: "Distinction*", ums: 108, confirmed: false },
        { grade: "Distinction", ums: 96, confirmed: false },
        { grade: "Merit", ums: 72, confirmed: false },
        { grade: "Pass", ums: 48, confirmed: false }
      ]
    },
    /* Year 2: the Extended Certificate, the qualification being finished */
    H119: {
      name: "Extended Certificate",
      units: ["F200", "F201", "F202", "F204", "F206"],
      umsMax: 300,
      boundaries: [
        { grade: "Distinction*", ums: 270, confirmed: true },
        { grade: "Distinction", ums: 240, confirmed: false },
        { grade: "Merit", ums: 180, confirmed: false },
        { grade: "Pass", ums: 120, confirmed: false }
      ]
    }
  },

  /* the qualification the IT desk counts towards */
  current: "H119"
};
