/* Kurenai OS — data/routine-templates.js (AUTHORED)
   The routines a template card offers (docs/routines-plan.md §4.6, §17.7).
   "Use this" copies one into state.routines with fresh ids
   (KOS.routines.fromTemplate); the template itself never changes, and an
   install is never seeded with them unasked.

   step: [text, minutes, flags] — flags: "o" optional, "m" the minimum
   version, "n" checked the next morning (decision F); link: a view, Focus
   or a review the step opens. days: [] every day, null on demand (never
   scheduled, never a streak).                                              */
(function () {
  "use strict";
  window.KOS_ROUTINE_TEMPLATES = [
    { id: "morning", name: "Morning Routine", kind: "morning", mark: "朝", anchor: "review:morning",
      days: [1, 2, 3, 4, 5], window: { from: "06:45", to: "07:45" },
      blurb: "From waking up to the bus.",
      steps: [
        ["Wake up (no snooze)", 1],
        ["Shower", 10],
        ["Get dressed", 5],
        ["Brush teeth", 3],
        ["Breakfast", 15],
        ["Check timetable and essentials", 3, "", { kind: "view", to: "today" }],
        ["Leave for the bus", 2]
      ] },
    { id: "evening", name: "Evening Prep", kind: "evening", mark: "夜", anchor: "review:evening",
      days: [], window: { from: "21:30", to: "23:00" },
      blurb: "Set tomorrow up, then wind down.",
      steps: [
        ["Review the day", 3, "", { kind: "review", to: "evening" }],
        ["Check tomorrow's timetable", 2, "", { kind: "view", to: "tomorrow" }],
        ["Prepare clothes", 3],
        ["Pack bag and books", 5],
        ["Set distraction blockers (Opal)", 2],
        ["Put devices away", 1],
        ["Read a light novel", 20, "o", { kind: "view", to: "books" }],
        ["Bedtime plan", 1],
        ["Asleep by 00:00", 0, "on"]
      ] },
    { id: "study", name: "About to Study", kind: "study", mark: "始", anchor: "focus",
      days: null, window: null,
      blurb: "The pre-flight before Focus.",
      steps: [
        ["Select the task", 1],
        ["Define the first concrete action", 1],
        ["Open the materials", 1],
        ["Clear distractions", 1],
        ["Start the Focus timer", 0, "", { kind: "focus", to: "start" }],
        ["Begin", 0]
      ] },
    { id: "sunday", name: "Sunday reset", kind: "custom", mark: "週", anchor: null,
      days: [0], window: { from: "18:00", to: "19:00" },
      blurb: "Plan the week and clear the decks.",
      steps: [
        ["Look over next week's plan", 10, "", { kind: "view", to: "pacing" }],
        ["Clear the reminders inbox", 10, "", { kind: "view", to: "reminders" }],
        ["Check deadlines and exams", 5, "", { kind: "view", to: "exams" }],
        ["Pack Monday's bag", 5],
        ["Tidy the desk", 10, "o"]
      ] },
    { id: "exam", name: "Exam morning", kind: "custom", mark: "試", anchor: null,
      days: null, window: null,
      blurb: "Calm, fed and on time.",
      steps: [
        ["Breakfast and water", 15],
        ["Clear pencil case, calculator, ID", 3],
        ["Glance at the formula sheet or flashcards", 10, "o"],
        ["Leave early", 2]
      ] },
    { id: "afterschool", name: "After school", kind: "custom", mark: "帰", anchor: null,
      days: [1, 2, 3, 4, 5], window: { from: "16:00", to: "17:00" },
      blurb: "A short reset, then start.",
      steps: [
        ["Snack and a drink", 10],
        ["Ten-minute reset", 10, "m"],
        ["About to Study", 5, "", { kind: "focus", to: "start" }]
      ] }
  ];
})();
