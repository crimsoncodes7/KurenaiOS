/* Kurenai OS — modules/help.js
   The in-app guide: what every tab and feature does, in a paragraph or less. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var SECTIONS = [
    ["Getting around", [
      ["Overview", "The home dashboard: overall completion ring, today's to-do, deadline countdowns, streaks, flagged topics, and the entry point for focus sessions. Click a subject card to open its dashboard."],
      ["Subjects (rail)", "Each subject shows its spec tree on the left. Click any leaf to open the topic page. The % next to each subject is spec points marked Completed."],
      ["Search (topbar)", "Press / anywhere to search every spec point and flashcard across all three subjects. Arrow keys + Enter to jump."],
      ["Back / Forward", "The ‹ › buttons (or Alt+←/→, Backspace) step through your page history like a browser."]
    ]],
    ["The topic page", [
      ["Specification", "The verbatim board wording, split into content and guidance columns, plus examiner intel (definitions, tips, pitfalls) and your personal note box."],
      ["Notes", "The deep revision content — paginated sections, worked processes, callouts, tables and code. This is the main study surface."],
      ["Flashcards", "Reviews the topic's deck with the 4-point SM-2 scale (Again / Hard / Good / Easy). Again retests the card in the same session AND reschedules it. ⚙ Manage cards lets you add, edit and delete your own custom cards and see each card's full history (ⓘ)."],
      ["Quiz / Exam Qs", "Instant-feedback multiple choice, and exam-style questions with reveal-the-mark-scheme self-marking. Both log to your session history."],
      ["Worked / Simulate", "Worked-example generators with your own numbers, and interactive simulations. Sims are part of the enrichment layer — some are gold unlocks."],
      ["Files", "Attach documents (PDFs, images, anything) to this topic. Stored in the browser's IndexedDB; images and PDFs preview inline, and every file has its own notes field."],
      ["Status, checklist & confidence", "The status dropdown and four checkboxes track completion. The R/A/G confidence dots are separate — how solid the topic feels. The app also computes its own R/A/G from your data and shows when it disagrees with you."]
    ]],
    ["Study systems", [
      ["Due Today", "The global SM-2 queue: every card whose review date has arrived, across all subjects, most-overdue first. Cards join the schedule the first time you rate them. Clearing this daily is the single highest-value habit."],
      ["Focus Timer", "Pomodoro (25/5) or custom timed sessions, with an optional subject/topic link. Starting one enters a minimal focus mode; “Study while focused” brings back the sidebar so you can work through pages while the clock runs. Everything you complete during the session is attributed to it. First pause is free; extra pauses shave the reward; switching tabs mid-focus is logged and costs HP after the first; ending early keeps the log but forfeits the award."],
      ["Calendar", "Month/week grid for exams, deadlines, study blocks, lessons (weekly repeat supported) and personal events. Exams and deadlines drive the countdown widgets and in-app reminders — set the reminder threshold at the top."],
      ["Today's directives", "The auto-generated daily list on the home page: due cards, near deadlines and today's study blocks, plus anything you add yourself. Ticks earn XP."],
      ["Exams & Papers", "Log every exam, assessment and practice paper: marks, grade, what went well, what didn't, mistakes, and a reviewed checkbox. Topic-linked results feed the RAG flags."],
      ["Card Stats", "The flashcard analytics dashboard: reviews per day, due forecast, ease distribution, rating mix, and a per-topic breakdown sorted by lapses."],
      ["Recommended next", "The flagged-topics panel on the home and subject dashboards — your manual R/A/G plus the computed one, worst first. That's the app telling you what to study next."],
      ["Resources", "Each subject dashboard has a link table for reference sheets, textbook PDFs and useful sites, optionally tagged to a topic."]
    ]],
    ["The Behavioural Governor", [
      ["HP", "Health drains on days with zero study and when the due-card backlog piles up (past " + (KOS.governor ? KOS.governor.BACKLOG_LIMIT : 30) + "). Below 60 the enrichment layer (labs, sims, shop) suspends; below 30 you're in Recovery Mode. Core revision — spec, notes, cards, quizzes, exam Qs — never locks, ever."],
      ["Gold", "Earned from sessions, streak milestones, quiz scores ≥80% and clearing the due queue. Spent in the Governor's shop on permanent lab/sim unlocks and cosmetics (themes, kanji seals, avatar frames)."],
      ["XP & level", "A pure progress meter — it gates nothing except the avatar seal library, which unlocks by level. The HUD in the topbar shows avatar, level, gold, HP and XP at a glance; click it for the full panel."],
      ["Avatar", "Pick a procedural seal or upload your own image (auto-cropped to a circle and compressed before storing)."],
      ["Streaks", "Consecutive days with at least one completed session — overall and per subject. Early-stopped focus sessions don't count; everything else does."]
    ]],
    ["Data & housekeeping", [
      ["Backup & Restore", "Everything except attached files lives in one localStorage JSON — export it regularly and when moving machines. Attachments live separately in IndexedDB and are NOT in the backup file."],
      ["Autosave", "Every change saves automatically (the AUTOSAVE dot pulses). There is no save button anywhere."],
      ["Sample data", "Calendar events marked SAMPLE are placeholders — edit or delete them and add your real dates."]
    ]]
  ];

  KOS.views.help = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Help & Guide" }),
      el("p", { class: "sub", text: "What everything is and how to use it — one short description per feature." })
    ]));
    SECTIONS.forEach(function (sec) {
      main.appendChild(el("h3", { class: "n-h", text: sec[0] }));
      var grid = el("div", { class: "help-grid" });
      sec[1].forEach(function (item) {
        grid.appendChild(el("div", { class: "help-card" }, [
          el("b", { text: item[0] }),
          el("p", { text: item[1] })
        ]));
      });
      main.appendChild(grid);
    });
    main.appendChild(el("p", { class: "sub", style: "margin-top:20px", text:
      "Shortcuts: /  search · Alt+← / Alt+→ (or Backspace)  history · Esc  close search/modals." }));
  };
})();
