/* Kurenai OS — core/subjects.js
   The ONE list of study subjects (roadmap 5.3, invariant 26).

   Three exam subjects shipped first and their ids were written out by hand
   in about twenty places. Code, the fourth space, is not an exam subject:
   it has no papers, no exam questions, no Pacing plan and no Exams &
   Papers record. So every reader asks this registry which subjects it
   needs:

     KOS.subjects.ids()           every subject whose data is loaded
     KOS.subjects.ids("exam")     the exam subjects (Pacing, Exams & Papers,
                                  the paper level, Reports' subject split)
     KOS.subjects.meta(id)        { id, name, short, hue, hex, exam }
     KOS.subjects.short(id) / hue(id) / name(id)

   A subject listed here whose generated or authored data is missing is
   skipped, so a reader never walks a subject that has no tree. Pure: no
   store, no DOM. Loaded right after the data files.                    */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var LIST = [
    { id: "compsci", name: "Computer Science", short: "CS", hue: "var(--cs)", hex: "#3D8E76", exam: true },
    { id: "maths", name: "Mathematics", short: "Maths", hue: "var(--maths)", hex: "#4C6DB3", exam: true },
    { id: "it", name: "IT · Data Analytics", short: "IT", hue: "var(--it)", hex: "#8A63A8", exam: true },
    { id: "code", name: "Code", short: "Code", hue: "var(--code)", hex: "#7AD0F0", exam: false },
    /* Japanese (roadmap 5.5): listed here, live once KOS_DATA.ja (its spine) is loaded */
    { id: "ja", name: "Japanese", short: "Japanese", hue: "var(--ja)", hex: "#F38372", exam: false }
  ];
  var BY = {};
  LIST.forEach(function (s) { BY[s.id] = s; });

  function loaded(s) { return !!(window.KOS_DATA && window.KOS_DATA[s.id]); }

  KOS.subjects = {
    ids: function (kind) {
      return LIST.filter(function (s) { return loaded(s) && (kind !== "exam" || s.exam); })
        .map(function (s) { return s.id; });
    },
    meta: function (id) { return BY[id] || null; },
    has: function (id) { return !!(BY[id] && loaded(BY[id])); },
    isExam: function (id) { return !!(BY[id] && BY[id].exam); },
    name: function (id) { return BY[id] ? BY[id].name : String(id || ""); },
    short: function (id) { return BY[id] ? BY[id].short : String(id || ""); },
    hue: function (id) { return BY[id] ? BY[id].hue : "var(--muted)"; },
    hex: function (id) { return BY[id] ? BY[id].hex : "#888888"; },
    /* { id: value } over every listed subject — for the maps the views keep */
    map: function (field) {
      var out = {};
      LIST.forEach(function (s) { out[s.id] = s[field]; });
      return out;
    }
  };
})();
