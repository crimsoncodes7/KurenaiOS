# Mind — feature inventory (audit 2026-11, slot 11)

Source: js/data/mind.js, js/data/content/mind-f1.js, js/core/mind.js, mindtree.js, mindjournal.js, mindui.js, js/modules/mind.js, mindtopic.js, mindrun.js, aitools.js (mind_*), achcatalogue.js (mind sets).

## Routes / pages
- #/mind (= Path), #/mind/path, #/mind/journal[/id], #/mind/positions, #/mind/daily (modes: reviews, cards), #/subject/mind (desk), #/ref/mind/<lesson> (lesson topic page), F1.8 checkpoint page
## Content (released)
- 1 unit (F1): 8 lessons — F1.1–F1.6 explain (F1.5 no prompt), F1.7 contested, F1.8 checkpoint
- 16 concepts, 7 dialogues, 1 checkpoint (8 cards, 3 apply, map, synthesis rubric 4 rows), 0 tensions, 2 evidence findings (both Robust), F1.5 field-guide items (5)
- Path map: 4 headers, 19 paths, 34 planned units / 232 planned lessons
## Lesson page
- six-page contract (hook/idea/case/pushback/check/close); hook vote + Keep/Change on Close; check (items, apply scenarios, retry "come back to this", Go through again); Close: prompt card (Write it / Take a position / Later / Revise / Write it again), For your stories (Save to Journal), dialogue (Open), quick reference
- tabs: Lesson, Concepts, Cards, Sources (when findings), Journal, Files; Learn / Reference mode; page select, dots, ‹ ›, Next page/Next lesson foot; page read by 2.5 s dwell or Next after 1.5 s
- inspector: four checks, concepts with ladder state, evidence tags, Talk it through, Ask Kurenai (4 modes)
## Written prompt
- explain-back: step 1 bullets (Later, Done writing), step 2 key-point ticks (Edit, Ask Kurenai to check, Save), saved state with ladder
- position: options, confidence slider 50–99, reason, objection+reply (optional, unlocks Evaluate), What changed my mind (revise), Later, Ask Kurenai to push back, Take this position, changed-mind milestone
## Ladder (derived)
- Recall (all cards last rated ≥ Hard), Explain (explain-back ≥60% key points, or checkpoint rubric row), Apply (apply item right), Evaluate (position with objection+reply, or rubric Evaluate row)
## Cards / FSRS
- introduce on lesson finish / checkpoint (due tomorrow), rateCard, preview, review log src "mind", due cap 15, review pay +1 XP/passed max 15/day
## Positions
- versions (random keys), revisit 14/60/180, Keep / Revise / Retire, timeline (≥2 days), tensions (authored, none yet)
## Journal
- capture (insight, quote, question, reflection; source), kinds filter, concept filter, This month, search, entry actions (Make it the Big Question, Ask Kurenai, Delete with confirm), Big Question card (set / add line / Sunday close), commonplace Markdown export (all / by concept), IndexedDB kurenai-os-mind + tombstones, kos_mind sync, backup export/import
## Dialogues
- scene choices 2–4 + typed "other", Backlog, Skip to summary, summary (Save to Journal, Run it again), place remembered per device
## Ask Kurenai
- modes socratic/differently/push/mine (+check from explain-back), What is sent, extras (explain-back, position, Journal entry), Send (one request), offline queue, failure, reply → Save to Journal, follow-up
## Checkpoint
- intro / Retake, cards self-marked, 3 apply scenarios, argument mapper (+ model map), synthesis bullets + rubric ticks, Finish (pays once), done summary
## Daily 15
- planDay: reviews (≤15, ~4′), one sitting (pages to break, ~8′), one question (parked → revisit → tension → field (odd days) → Big Question); Exam Season = reviews only ~5′; Focus stopwatch start/stop; Just reviews; One more card set; resume welcome-back; done summary
## Pay / Governor
- lesson first finish 12/2/+2, checkpoint 50/12/+4, path 120/30/+8, reviews +1 XP ≤15/day, writing nothing, no Mind streak
## Desk
- hero (mastery ring, rung bars, order path), welcome / Daily card, Continue, Subject analytics (8 tiles + help), Journal card, Core path, Milestones
## Joins
- Achievements (mind set: evaluated, changed-my-mind, journal, big-questions; u-mind path badges), Assistant (mind_overview, mind_concept), Goals (study-hours by subject; cards/recall types), Reports, Home/Today, Focus
