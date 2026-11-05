# Japanese study space — feature inventory and check matrix (audit 2026-11, slot 10)

Sizes: mac 1470x832, ipad 820x1180, ipadl 1180x820, iphone 402x874. "F#" = finding title keyword in ja-mind.jsonl.
Earlier auditor (interrupted) covered a DOM sweep of every route at mac/ipad(l)/iphone, empty + seeded (jm-*.json) and mac screenshots (e-*/s-*).

## Routes / pages
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| #/subject/ja desk (hero, Today, Continue, Rework, analytics, core path, media path, input) | mac (dark, Dawn), iphone empty, ipad (sweep) | Today plan, Start routing, figures vs evidence | F: hero heights differ; Today Input/Output blocks; Input card dead; stage labels ellipsised (prior); checkpoint ovals; Rework inert |
| #/japanese/path (media path) | mac with thin fixture | timeline() thin evidence | F: absurd projection ranges, kana 'Calibrating', 'Next stone' dead space |
| #/japanese/skills | mac | Rework, radar calibrating, fluency | F: Rework inert/leech; fluency rows mono text (P3, noted in leech finding context) |
| #/japanese/kana | iphone | drill, mode switch, chart | F: chart overflow hidden; mode switch loses results |
| #/japanese/reviews | sweep only (prior) | due count, start | OK (sweep); not re-shot |
| #/japanese/checkpoints, /cp-<id> | mac, iphone run | recordCheckpoint pass/pay/retake, question selection | F: passed + 10% contradiction; layout; duplicated listening; model shown |
| #/japanese/settings | sweep (prior), code | furigana all/unknown/none (verified by eval), daily minutes (planDay), speech switch | furigana OK; speech switch no effect (F dead promises); slider touch (prior) |
| #/japanese/licences | prior mac shot | content | F: JMdict/KANJIDIC2/Tatoeba 'arrives with Stage 1' |
| #/japanese/session/reviews | mac, ipad, iphone end | every step, verdict, grade, Next, Finish, leave | F: navigation loses ledger; correct option not marked; family codes; empty card space |
| #/japanese/session/learn-<id> | mac | order of facets, meet card, finish pay, practise again | F: listening-first; all-wrong pays; Practise again dead end |
| #/ref/ja/<lesson> topic page (Stage 0 H1–K8, Stage 1 1.1–2.6) | mac, ipad, ipadl, iphone | page dwell, checks, inspector, tabs | F: held check never synced (P1); iPhone tabs 5 px (P1); Media spine lockout (P0); Reference inspector; Practice copy; '0 of 1 sessions' (prior) |
| Spine Core / Media | mac | switching | F: P0 lockout |
| Learn / Reference | mac | switching | F: inspector replaced |

## Exercise kinds (js/modules/jarun.js)
| Kind | Checked | Result |
|---|---|---|
| kana-read | UI (ipad), typed romaji | OK; Easy on first fast answer (F unlock/hold) |
| kana-write (stroke pad, stroke order, undo, clear, type instead) | UI ipad; validator by eval (straight/shift/scale) | F: model shown; accepted→correct + lenient tolerance; Type instead passes W. Real pen input NOT checked (synthetic pointer events cannot take pointer capture in headless Chrome) |
| minimal-pair | UI ipad | F: styling glued 'ケキ2 beats' |
| meet (new item card) | code + session | OK |
| word-meaning, meaning-word, kanji-reading | meaning-word UI (typed 'pen' → correct) | OK |
| listen-pick, read-meaning, listen-meaning, particle-pick | read-meaning UI mac | F: correct option not marked |
| build (order-graph) | code read | not exercised in UI (time); validator code read: no 'near' path, OK |
| translate (dictation) | code read | not exercised in UI |
| fallback 'not available yet' | code | unreachable for current data (eval: no null exercise in any checkpoint unit) |

## Scheduler / invariants
| Rule | Fixture | Result |
|---|---|---|
| 113 grade derived (verdict/hints/time) | record() wrong/slow, correct/fast, hint (type instead) | wrong→Again, hint→Hard, fast correct→Easy; retry after near can be Easy (F) |
| 113 R/L first, W/S only once R holds a week | one fast R answer on a production word/pattern | F: W unlocked immediately (s 8.3 ≥ 7) |
| 113 sibling rule | startLesson 1.1; review L then due() | F: R buried by alphabetical tie-break; sibling due same day after first review |
| 113 leech at 8 lapses | lapses 8 vs 5 | leech excluded from queue (OK); no way back (F) |
| 114 four verdicts | stroke/particle/order/reading code + eval | OK in validators; runner upgrades accepted (F) |
| 116 pay once: review +1/passed, cap 30/day | 4-answer session +4 XP; cap logic code | OK; ledger written only on explicit end (F P1) |
| 116 lesson first finish 15/2/+3 | all-wrong learn session | F: pays and ticks 'Passed' |
| 116 checkpoint 80% every skill, once | 0.8/0.79/1 fail; 0.8/0.8/0.83 pass paid; retake no pay | OK; scores overwritten (F) |
| 116 stage gate | code read (gate flag absent in data) | NOT exercised: no checkpoint carries gate:true in current data |
| 117 timeline calibrating <2 weeks then range | 1 word met 10 d ago + kana 20 d ago | F: decades-wide ranges |
| 118 stroke data attribution | licences page | OK |
| 107-style checks → progress record | reviews holding all items | F P1: never synced |

## Audio pack / art
| Item | Check | Result |
|---|---|---|
| KOS_JA_AUDIO files exist | node over 759 entries | OK, 0 missing |
| voiced lines without audio (synthetic) | 314 lines across all lessons | OK, 0 synthetic |
| VN scene (advance by click/Enter/Space, English, From the start) | eval ipad | works; F: role=button with nested buttons |
| manga panel balloons live text | DOM | OK (SVG + live bubbles) |
| furigana modes | eval | OK |

## Joins
| Join | Check | Result |
|---|---|---|
| Goals | registry grep | F: no Japanese goal type |
| Reports | report.js grep | F: no f.ja |
| Assistant | aitools grep | F: no ja tools |
| Today / reviews (KOS.today) | grep | F: no Japanese |
| Routines auto-track ('A Japanese review session') | code | works off ledger, so affected by the navigation-loss P1 |
| Achievements | catalogue + live unlock overlay | F: unearnable badges, no touch on reviews, overlay wording |
| Home desk listing (started()) | code hub.js:1561 | OK by code; not screenshot |

## NOT checked
- Real Apple Pencil / touch stroke input on the pad (headless synthetic pointer capture fails).
- build and translate exercises through the UI (validators read only).
- Shop theme spot-check for Japanese pages (time); Dawn checked on the desk.
- Cloud merge of facets (WHOLE merge) — not exercised.
