# Home and Reports: feature inventory (batch 4, slot 2)

Source: js/modules/hub.js (KOS.views.home 1041-1730, homeRoutines 967, focusPlan 754, homeThree 939),
js/modules/reports.js (views 1613, home card 1505), js/modules/reportlong.js, reportstory.js, reportshare.js,
js/core/report.js, reportwords.js, reportstore.js. Status: B4 = this run, A = earlier interrupted auditor (findings in the jsonl).

## Home
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| Hero: ring/avatar, date, greeting, streak | mac/ipad/ipadl/iphone, Dawn | streak vs ledger | OK |
| Hero: level line, XP bar, "N XP to L", HP | iphone measured | - | B4 XP-row finding (P2) |
| Hero: Daily goal list (directives, count) | all sizes | tick/untick/re-tick pays | B4 P1 farm; A: count 5 vs 3 shown; A: iPad portrait hidden; A: season chip covers count (also seen at mac by B4 scan) |
| Hero: Today's three / Recovery / Start focus | ipad portrait | - | A (hidden 701-1080) |
| Hero: season/picture chip | mac, ipadl | - | A |
| Routines card: routine due now + Start, habits, review line | mac with 5 habits + routine fixture | caps | B4 P3 hidden habits; empty state OK |
| Reminders card: 2 rows, count, ticks | mac | tick pays, no undo | B4 P2 no undo; milestone repay P1 found via this tick |
| Due/Focus card: Focus/Review switch, 25/50/90, Start focus | mac | 90m -> custom 90 min session, subject it | OK; exam rung after exam P2; label match P3 |
| Up next ladder rungs (block, exam lead time, deadline at risk, start-by, assignment, next exam, plan) | - | exam rung fixture at 09:00/15:00/23:30 | B4 P2; other rungs NOT fixture-tested (budget) |
| Today card | all sizes | - | A empty-space; OK otherwise |
| Upcoming card + Goals switch | mac | caps, subjects | A cap 3; B4 raw ids P3; A goals ring unit P3 |
| Study hours: total, delta, chart, goal line, split, facts | mac | Code/ja fixture | B4 P2 split; A P1 vs Reports |
| Week in review (Reports card): New / N new, Read the report | mac | read state | OK (read marks the week; month then shown New, as designed); empty-account P2 |
| Week's plan card | all | ticks | A header wrap; B4 tick 18x18 touch P2 |
| Continue desks (subjects, Code, ja, Mind, Creatives, Collection) | mac/ipad/iphone | started() + order | A P1 (Mind/Creatives off-screen, started() reads lessons only) |
| Collection desk async fill | mac | redraw | B4 P3 jump |
| Background redraw scroll keep | mac | rerender({background}) | mid-page kept OK; bottom P3 |
| Empty account Home | mac/ipad/iphone | - | scan clean; report card P2 |
| Cross-system "what next" (Code, ja, Mind, Creatives, Money) | - | - | A P1 |
| Themes: Graphite, Dawn (iphone), Celestial Duality (report) | looked | - | OK (harness note: app sets data-theme on body) |

## Reports
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| Index (#/reports), period switch Weekly/Monthly/Termly/Yearly | mac/ipad/iphone scan | - | touch-target P2 |
| Earlier reports list + sparklines | iphone full | - | A frozen-quiet P1 |
| Words switch Template / Kurenai, failure path, Try again | mac | no Assistant -> calm note, template kept | OK |
| What is sent | - | - | A (whatissent.png) |
| Week page: hero, stories strip, tiles, Study/Focus/Plan/Governor cards | mac (Celestial), iphone | - | B4 P2 dead space; P3 sessions/days wording |
| Full overviews: study, focus, collection | 3 sizes scan | - | A heat-map 23-07 P2, persona P3; scan clean otherwise |
| Month page | 3 sizes scan | - | OK in scan |
| Term / Year pages | NOT in this seed (no term saved) | - | A shots r-term/r-year |
| Story player | - | - | A (controls P3) |
| Share / Export dialog | - | - | A (stays open across navigation P2) |
| Subject naming in words for Code/ja/Mind/Creatives | - | build+template fixture | B4 P1 'undefined' |
| Empty account backfill | mac | reset | B4 P2 |
