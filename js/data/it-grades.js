/* Kurenai OS — js/data/it-grades.js
   OCR Cambridge Advanced National in IT: Data Analytics (H019 / H119):
   the units being taken, their mark scales and the grade boundaries, in ONE
   table (roadmap 1.2). KOS.itUnits stores the marks; the hub derives every
   grade, aggregate and "marks needed" figure from this table.

   SOURCE: the specification, "Calculating the qualification grades"
   (Version 4, September 2025, p. 91), confirmed 27 September 2026:
     · every unit is worth 60 UMS. An exam unit's (F200, F201) uniform mark
       comes from its raw mark (out of 60); an NEA unit's (F202, F204, F206)
       from the number of criteria achieved (out of 24);
     · a UNIT is graded Distinction 48, Merit 36, Pass 24 (UMS). There is no
       unit Distinction* — that grade exists only for the qualification;
     · the Certificate (H019: F200 + F202, 120 UMS) is D* 108, D 96, M 72,
       P 48; the Extended Certificate (H119: five units, 300 UMS) is D* 270,
       D 240, M 180, P 120.
     OCR converts raw marks (or criteria) to UMS pro rata BETWEEN each
     series' grade boundaries, which are published per series. The table
     cannot know those, so a raw mark is converted on the straight
     line (exam 1 : 1, NEA 1 : 2.5) and the result is flagged an ESTIMATE;
     a UMS from a results slip is stored as-is and always wins.

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

  /* a unit's grade from its UMS (out of 60) — the minimum UMS for each.
     A unit has no Distinction*. */
  unitBoundaries: [
    { grade: "Distinction", ums: 48, confirmed: true },
    { grade: "Merit", ums: 36, confirmed: true },
    { grade: "Pass", ums: 24, confirmed: true }
  ],

  qualifications: {
    /* Year 1: the Certificate (84 raw/criteria, 120 UMS), graded
       Distinction — the student's record */
    H019: {
      name: "Certificate",
      units: ["F200", "F202"],
      umsMax: 120,
      boundaries: [
        { grade: "Distinction*", ums: 108, confirmed: true },
        { grade: "Distinction", ums: 96, confirmed: true },
        { grade: "Merit", ums: 72, confirmed: true },
        { grade: "Pass", ums: 48, confirmed: true }
      ]
    },
    /* Year 2: the Extended Certificate, the qualification being finished
       (the specification's totals — 192 raw/criteria — include F203 and
       F205; the five units taken are 300 UMS either way) */
    H119: {
      name: "Extended Certificate",
      units: ["F200", "F201", "F202", "F204", "F206"],
      umsMax: 300,
      boundaries: [
        { grade: "Distinction*", ums: 270, confirmed: true },
        { grade: "Distinction", ums: 240, confirmed: true },
        { grade: "Merit", ums: 180, confirmed: true },
        { grade: "Pass", ums: 120, confirmed: true }
      ]
    }
  },

  /* the qualification the IT desk counts towards */
  current: "H119"
};
