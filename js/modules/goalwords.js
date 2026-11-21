/* Kurenai OS — modules/goalwords.js
   How a goal's figure and pace are said, at boot (1F): Home's goal lines
   and the exams pages read these, and the Goals page (js/modules/goals.js,
   page-goals) extends KOS.goalsUI with its dialogs on first use. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function isMoney(g) { return /^[£$€¥]$|^[A-Z]{3}$/.test(g._unit || ""); }
  /* a figure in its own unit: hours as "7 h 40 m", money as an amount */
  function hm(hours) {
    var m = Math.round((hours || 0) * 60);
    return Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " m" : "");
  }
  function word(g, v) {
    if (v == null) return "–";
    if (isMoney(g)) return KOS.money && KOS.money.isHidden() ? "" : KOS.money.format(Math.round(v * 100));
    if (g._unit === "hours") return hm(v);
    return String(Math.round(v * 10) / 10) + (g._unit ? " " + g._unit : "");
  }
  /* the chip a goal shows: its pace, or why it has none */
  function paceKind(g) {
    if (g.archived) return "archived";
    if (g._unlinked) return null;
    if (g._displayOnly) return "display";
    /* a stay-under goal still running has no line: Under or Over */
    if (g._direction === "under" && g._status !== "completed" && g._status !== "failed") return g._pace || "under";
    if (g._status === "completed" || g._status === "met") return "met";
    if (g._status === "failed") return "missed";
    if (g.type === "code-capstone" && !g._current) return "notyet";
    return g._pace || (g._period || g.deadline ? null : "none");
  }
  KOS.goalsUI = { isMoney: isMoney, hm: hm, word: word, paceKind: paceKind };
})();
