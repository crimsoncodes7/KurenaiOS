# Collection — feature inventory (audit 2026-11, slot 17)

Routes / views: #/matrix (Overview + Analytics tab), #/anime, #/seasonal, #/books (lenses Digital/Physical; layouts grid/list/shelf), #/mangaka, #/vn, #/game, #/shrine, #/wishlist (#/planner alias), #/mediasync, #/aniprofile, #/vndbprofile.

Shared vault shell (js/modules/medview.js): search, sort (updated/title/score/progress), layout toggle (grid/list + extras), Filters ▾ facets (genre, tags, platform, lists, favourite...), filter sheet on phone (Reset / Show N), status pills (All + 5 statuses), results area (60-row lazy batches, IntersectionObserver), empty state, cover placeholder hue, Spotlight hero (choose spotlight, banner add/reposition/automatic/title banner/cover art), progress bar (progressBar), favourite toggle, status-change menu, +1 bump (Log the next one), quote log (add, cloze flashcard, delete), custom lists (new/rename/delete, add to list), record section (local record, delete entry), editor sections (List state / Your layer / Quote log / Record), "The numbers" dialog, Find new titles…, Sync & Import link, More menu.

Anime editor: Status, Episodes seen, Score /10, Custom lists, Tags, Cover position, Notes; AniList facts read-only.
Seasonal: season prev/next, season/year select, Which titles (in progress / all), Art (choose a picture / shipped scenery), credit.
Books editor: Reading state, Physical vault (volumes from–to bulk, per-volume condition/price/date/cover/status/book type/ISBN/score/dates/note, remove), Shelves & tags, Quote log, Identity (title, cover position); lenses Digital/Physical; shelf layout with move buttons; Look up book/ISBN; Start a reading session.
Mangaka: sort authors, jump to letter, author cards with spend.
VN editor: progress mode (routes/chapters/hours/%), routes (add, rename, clear, remove), chapters (bulk from–to, owned/platform/price/date/art, per chapter status/hours/dates/score/notes), Title/Developer/VNDB id/Ownership/Cover URL/Status/Score/Started/Finished/Favourite/Genres/Tags.
Games editor: Title, Developer, Publisher, Platform, Ownership, Steam App ID, Cover URL, Favourite, Status, Completion tier, Score, Playtime, Started, Finished, Genres, Tags, Backlog priority, Custom lists, Notes; View on Steam; Paste a list… (Create drafts); Steam library (link, check link, select all/none, import selected, unlink).
Shrine: filter by medium, sort (score/updated/title), tied-score order (reorder, reset to date enshrined), hall note add/edit, share card (styles Crimson/Gold/Ink brush/Neon/Gilded torii; show options; message; copy/save), hall statistics, hall ledger.
Wishlist: Want to buy / release watch / purchase history / cancelled; add/edit item (type, module, title, author, price, retailer, link, release date, priority, notes, cover, link to vault entry); priority drag; Mark purchased dialog (paid, date) → Money + Collection handoff; Move to buy; simulate buying; budget (Collection budget from Money), spend chart, collection split; search/sort purchase queue.
Sync (#/mediasync): AniList (client id, token, connect, disconnect, module, sync mode mirror/manual, autonomous 15 min), VNDB (token, save & verify, read-only vs read&write), Steam (cloud sign-in, baseline), XML import (mode Replace / Update & add), enrichment (covers & metadata), scan for duplicates, recent activity log (30 most recent), one-time repair notes.
Profiles: #/aniprofile (hero, stat bands, analytics, avatar), #/vndbprofile.
Schema: mediadb.normalise v8; manual layer; QoL candidate field "where I watch/read" link.

## Coverage matrix (run 3, slot 17, sw kos-redraw-1)
See collection.json "coverage" for the item → presentation → behaviour → finding matrix.
