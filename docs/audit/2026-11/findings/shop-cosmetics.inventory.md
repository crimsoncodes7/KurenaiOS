# Shop & cosmetics — feature inventory (from js/core/governor.js CATALOG, js/modules/governor-ui.js SHOP_GROUPS, js/core/art.js SLOTS, js/modules/artslot.js)

Legend: P = presentation checked (sizes), B = behaviour checked (fixture -> result), F = finding(s). Runs: earlier auditor (batches 1-3, 28 findings) + this run (b4).

## Catalogue (131 items, 4 retired)
| Group | Items | P | B | Result |
|---|---|---|---|---|
| Outfits (7: winter, yukata, exam, rain, newyear, dayoff, gala) | 7 | mac/ipad/iphone shop; Assistant mac/ipadl/ipad/iphone | buy/use/try-on; skin + 35 face files exist | F: try-on Buy illegible (P1 earlier), no mannequin when none worn (earlier), iPad portrait shows no Kurenai (b4), 2 descriptions wrong (b4) |
| Focus scenes (6, library free) | 6 | Focus stage earlier | wear, drawer rotation | F: First snow legibility (earlier), drawer-vs-shop two truths (earlier), rotation ignores content (b4) |
| Shrine halls (3) | 3 | Shrine earlier | wear, rotation | F: rotation (b4), try-on ends on leaving shop (earlier) |
| Share-card finishes (3) | 3 | share card earlier | wear | F: earlier (Washi muddy, finish only on Reports card) |
| Painted banners (6) + 4 retired CSS | 10 | Seat/Avatar stage earlier (b3) | use, retired hidden unless owned (verified) | OK verified; upload bypass (b4) |
| Avatars (12) | 12 | shop cards, avatarNode montage | buy/use/take off | F: preview escapes disc (P1, re-verified this run), clipped/inconsistent (P1), prevKind loses photo (P2) |
| Frames (4 CSS + 6 painted) | 10 | shop, Seat, Home, Avatar | wear | F: 4 earlier P1s + bloom squares P3 |
| Seals (6 glyph + 6 stamp) | 12 | Wardrobe, ring | wear | F: no topbar mark (P1), wardrobe tiles/truncation (P2) |
| Themes (2 free + 27 paid) | 29 | all 29 contact sheets; contrast computed per token | use, take off, follow system | F: 10 near-copies (keep/remove list), swatches lie, Washi alarm contrast (b4), default theme dead Take off (b4) |
| Shelf skins (3 CSS + 5 painted) | 8 | Books shelf earlier | wear | F: painted 404 (P1), repainted art unused (P2) |
| Shrine cards (3 CSS + 5 painted) | 8 | Shrine earlier | wear | F: as shelf skins |
| Notebook papers (6) | 6 | ink page Graphite/Dawn earlier | list grows when owned (verified ink.js:53-56), new notebook default | F: toolbar says 'Lined' (earlier) |
| Pen sets (3) | 3 | wardrobe | palette resolved per set (b4) | F: Study set no-op (earlier), Exam/Sketch near-identical, mislabelled, recolour old ink (b4) |
| Your own picture unlocks (6) | 6 | shop iphone, drawer | canUpload per area | F: green text block (earlier), Edit-seat upload bypass (b4) |
| Labs (8) | 8 | sims index + lock page mac | buy -> owns, 0 locked (seeded); empty: 7 locked | F: lock flow (b4) |

## Shop page states
| Item | P | B | Result |
|---|---|---|---|
| Stage: balance, owned chips (first 5 kinds only), Saving-for pin, Try on panel | mac seeded/empty | pin/unpin code read, buy updates HUD+balance (verified) | owned-chip truncation noted in qol; glyph inconsistency F (b4) |
| Department rail (All + 15 groups + Labs) | mac/ipad/iphone measured | select hides sections | OK verified |
| Card states buy / try / owned / on / free | measured 3 sizes | Buy, Use, Take off, Try on clicked | scroll kept OK; focus lost F (b4); no confirm F (earlier) |
| Preview sheet | earlier | owned = dead end (earlier) | F earlier |
| Pin as a goal | code | setPinned/pinned | not linked to Goals (qol) |

## Profile surfaces
| Item | P | B | Result |
|---|---|---|---|
| Avatar & profile (#/governor/avatar): identity, Wardrobe (12 kinds), Frames, Collection cosmetics, Theme, Decorative art | empty mac/iphone, seeded mac/ipad/iphone measured | chips click -> shop (no dept) | F: truncation (earlier), empty layout + links (b4) |
| Edit your seat (#/governor/edit): Showcase, Background (upload, panoramas, focus point), Title, Sigil, preview | empty mac; seeded 3 sizes measured | upload gating, preview focusables | F: bypass (b4), preview not inert (b4) |
| Picture drawer (home, focus, shrine, banner): one / rotate (time: day, week, season, tod; condition: exam, streak, weekend) / shuffle / own | earlier b3 home mac/iphone | rotated() for dates/hours, condition fallback (b4) | F (b4) |
| Decorative art switch + Reduced data | read code art.js:27-36 | off -> layer() returns null | OK by code; NOT exercised visually (paid scenes/halls also vanish when off, by design) |

## NOT checked
- Cloud merge of artSlots / g.owned across two devices (no second device in harness).
- Real file upload through imageCrop (headless file chooser); bypass shown by code path + visible control.
- Every one of the 29 themes on every page (one contact sheet per theme only).
