# Achievements & Governor — feature inventory (batch 5, continuing the interrupted run)

Sources: js/core/achievements.js (registry, evaluate, touch, rollup, titles, showcase, quiet, earnedIn), js/core/achcatalogue.js (15 sets + unit sets, 254 badges, 16 titles), js/modules/achievements.js (Wall tabs, set dialog, unlock overlay, ping, showcase picker, governorCard), js/modules/governor-ui.js (Seat tabs, ⋯ menu, Edit seat, Shop, Avatar, Session Log), js/core/governor.js (buy, try-on, recovery tasks, catalogue).

## Routes / tabs
- #/achievements — Sets (panels / List view switch / filter All·Earned·In progress·Locked / sort), Recent, Showcase, Titles; #/achievements/<tab>, #/achievements/set/<set>/<badge> (deep links)
- #/governor — Status (Stage: identity, title, motto, XP, ring→Avatar, showcase arc, Wall record, five states, rules, recovery dispatch, area cards, Study cadence Study/Rest rhythm, Milestone ledger), ⋯ menu (HP preview Live/Full/Off; Data Mine/Empty/Sample)
- #/governor/shop — gold stage, Try on panel (Buy all, Stop), department nav (17 groups: Outfits, Focus scenes, Shrine halls, Share-card finishes, Painted banners, Avatars, Frames, Seals, Themes, Shelf skins, Shrine cards, Notebook papers, Pen sets, Your own picture, Labs…), card states buy/try/owned/on/free, Buy, Try on, Use, Take off, "◈ N more", item sheet
- #/governor/avatar — live identity, Profile picture / banner / status, Wardrobe (9 kinds), Frames, Collection cosmetics (shelf skins, shrine styles), Theme (+ Follow the system), Decorative art switches
- #/governor/history — filters All/Study/Focus/Tasks/Papers/Collection/System, week stats, day groups, entry detail
- #/governor/edit — preview, summary, tabs Showcase / Background (upload, set panoramas) / Title / Sigil, Save, Discard

## Behaviours
badge measures (ledger scan, vault, money, reviews, ink, exams), tiers & thresholds incl. "all", hidden badges, soon badges, monotonic earned, rollup, silent first sweep + retro toast, unlock overlay (≤5 frames + summary, skip, reduced motion), progress pings (rule, 10 s), quiet (Focus, dialog, Exam Room), notifications ach:<badge>:<tier>, titles unlock/equip, showcase ≤6, try-on lifetime, purchases, recovery tasks.

## Matrix (this run; earlier run's findings in the .jsonl not repeated)
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| Wall Sets / List / filter | ipad, iphone measured | — | touch-target finding (filter 30px, switch 20px) |
| Wall Recent | iphone shot + measure | retro tiers listed | Recent grouping/phone layout finding |
| Wall Showcase | measured ipad/iphone | save-only draft read | leave-without-save finding |
| Wall Titles | iphone + ipad measured | tap → detail off-screen; equip via Edit seat verified | phone master-detail finding; lowercase titles finding |
| Set dialog | code read | keyboard/swipe present | earlier run's findings (oval ring, 3+1 wrap) |
| Unlock overlay | mac + iphone shots | 6-badge fixture, Next through summary, Close, queueing | overlay polish finding; queue behaves (second batch waits) OK |
| Pings | — | — | earlier run's findings; NOT re-checked |
| Monotonic earned | — | vault emptied with tiers kept (binge/episodes/player 0 value, tier 3 kept) | OK, verified |
| quiet() / holdTimer | code read | not exercised with Focus running | NOT checked live (time) |
| Seat Status | shop-theme shot | recovery tasks vs Governor payers | recovery-dispatch finding; access-copy finding; ⋯ menu P1 and iPhone arc P1 re-verified (hold) |
| Gold Shop | mac full, iphone, ipad measured; empty iphone | Buy (fixture), Try on theme then leave (ends, OK), item sheet | no-confirm/undo finding; phone sheet width finding; Frames/Seals tile finding |
| Avatar & profile | mac full; touch switch sizes | switches have 54–93px labels (OK) | Wardrobe/Theme dead-space finding |
| Session Log | mac + iphone, empty mac | logged focus/code/quiz fixture | rewards/types finding |
| Edit seat | measured 3 sizes | showcase toggle, title choose, Save writes title+showcase (OK); focus after choice | preview not inert finding; focus/radio finding |
| Badge measures | full dump of 254 views | streak, quiz, focus, reading-vs-focus reviewed | OK for those read; Japanese/Mind/Creatives/Code measures NOT exercised with fixtures |
| Dawn | --theme did not apply over the saved theme in this harness | — | earlier run's dawn_* shots cover it; not re-checked |
| Shop theme | spectral-rose (Wall, Seat) | try-on ends on leaving | OK |
