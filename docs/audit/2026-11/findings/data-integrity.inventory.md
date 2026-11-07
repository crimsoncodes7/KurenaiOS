# Data integrity — feature inventory (top-up, 7 Nov 2026, sw kos-redraw-1, HEAD 47e02c7)

Legend: P = presentation checked (sizes) · B = behaviour checked (fixture/result) · ids = finding titles (short)

## 1. The state document (js/core/store.js)
| Item | P | B | Result |
|---|---|---|---|
| Load + deepMerge(DEFAULTS) | – | reload drift test slot 19 (seeded, two reloads, diff of whole state minus ui = []) | OK, verified |
| Unreadable stored JSON → DEFAULTS | – | code (store.js:382-390) | 'An unreadable stored state…' holds |
| scrubLegacy / renameRefs at load | – | covered by drift test | OK |
| save() 120 ms debounce, flush() | – | stringify 1.1 ms, setItem 2.6 ms on 372,887-char dense state | OK |
| Quota exceeded | – | fill-to-quota experiment → 'save failed QuotaExceededError', write lost while full, kept in memory | 'The whole state lives in one localStorage key…' holds |
| Size: empty 96,139 chars (pacing seed 84,696); seeded 372,887 (srs 110k, pacing 85k, sessions 84k/600) | – | measured | headroom OK (~5 MB quota) |
| replaceState (restore, cloud pull) | – | round trip | OK; stale captured sub-objects: NOT checked (see backlog) |
| reset ('Reset everything') | mac | fixture: tx + ink + reminder → reset | NEW 'Reset everything only resets the state document…' |
| Two tabs (no storage event / BroadcastChannel / locks) | – | grep + earlier iframe repro | 'Two open tabs…' holds |
| KOS.dataMode namespaces (Mine/Empty/Sample) | – | grep every indexedDB.open name | NEW 'Creatives' file store is shared…' |

## 2. Backup and restore
| Item | P | B | Result |
|---|---|---|---|
| snapshotFull sections: state, mediaEntries, mediaKV, attachments, money, reviews, mind, ink, creatives | mac, ipad, iphone | browser fixture: one row in each store → backup counts 1/1/1/1/1 | OK |
| Not in backup: reports + snapshots, papers (by design), filetext (derived), credentials (by design) | – | bk has no 'reports' key (11 reports, 1 snapshot on device) | 'The full backup leaves out saved Reports…' holds |
| exportFull pretty-printed single string | – | 3,078,746 chars without attachments | holds (iPad risk with large files) |
| importFull replace semantics per store | – | after-backup ink page survived restore; media/money/reviews/mind/creatives cleared | NEW 'Restore is not authoritative for handwriting or files…' |
| Import confirmation / safety copy | mac | code + button title only | NEW 'Import backup replaces everything…' |
| Restore report text | – | report = {restoredSections:[7], missingSections:[]} — never mentions reports | folded into the above |
| 'What a backup covers' list | mac, ipad | screenshot | holds |
| Archive › Storage rows | mac | screenshot (0 KB rows; 47.4 MB unattributed) | holds |

## 3. Cloud state sync (cloudsync.js, cloudmerge.js)
| Item | B | Result |
|---|---|---|
| First link (assessLink, adopt, upload) | exp/cs.js re-run → local reminder + assignment gone, cloud never got them | P1 holds (+ push-side conflict() path :543-549 and pull guard :744-750 overwrite a 'not meaningful' remote) |
| Push CAS + 4 retries | smoke17 PASS (23 steps) | OK |
| Three-way merge, RECORDS, SET_FIELDS, ATOMIC, MONO, FACET | every object array in the seeded state is in RECORDS or id-keyed (walk) | OK; re-key refs gap holds (+ goals.links.eventId) |
| Re-key references | code | 'An assignment re-keyed…' holds, widened |
| Empty-remote guard, restore flag, fetchStateHead | smoke17 | OK |
| Remote apply redraw (background:'hard' under kos-redraw-1) | code | OK; held redraw = stale page longer (backlog) |
| DEVICE_PATHS | code | NEW 'Japanese mined lines are kept in the synced state…' (latent) |

## 4. IndexedDB stores and their replication
| Store | Backup | Replication | Test | Result |
|---|---|---|---|---|
| kurenai-os-media (+kv) | yes (kv cleared on restore) | cloudsync media rows | smoke17 | OK; cursor finding holds |
| kurenai-os-files | yes (base64) | metadata + binaries | smoke106 PASS | OK |
| kurenai-os-filetext | derived | – | – | OK by design |
| kurenai-os-papers | no (by design) | 'Keep in my cloud' copy | – | NOT checked (Exams area) |
| kurenai-os-money | yes | kos_money | smoke86 PASS; delete-vs-edit converges (putRaw drops tombstone) | silent errors (NEW) |
| kurenai-os-reviews | yes | kos_reviews | smoke96 PASS | silent errors (NEW) |
| kurenai-os-ink | yes (merge on restore) | kos_ink per stroke | smoke100/105 PASS | restore finding (NEW) |
| kurenai-os-mind | yes | kos_mind | NO TEST | NEW 'Mind's Journal replication has no test…'; silent errors |
| kurenai-os-reports | NO | kos_reports | smoke72 PASS | backup finding holds |
| kurenai-os-creatives | yes | none (by design) | – | NEW namespace finding |
| All replicators' cursor (updated_at > max seen on now()) | – | – | – | holds (also push.js:90) |
| All replicators' error surfacing | – | callers pass no cb | – | NEW 'Money, the review log, Mind's Journal and saved Reports replicate with no error surfaced' |

## 5. Integrations (ext.js, exttasks.js, extgcal.js)
| Item | B (fixture, exp/td.js + exp/td2.js, fake Todoist) | Result |
|---|---|---|
| Create here → item_add, temp ids, sub-tasks | subs | OK |
| Two devices (state not yet pulled) | twodev → two local reminders on T3 | P1 holds |
| Chunk failure (90-command batches) | chunk → 45 duplicates | P1 holds |
| Full sync and completed sub-tasks | subs → completed sub dropped | P2 holds |
| Repeating (daily/weekly/monthly/yearly) completion | recur → item_update new due | P2 holds |
| 'every day at 9:30' | weekdayAt → daily 09:30 | OK |
| x-rule ('every 2 weeks', 'every mon, fri', 'every evening') kept as ext.rs, sent back unchanged | weekdayAt/xrule → item_close, date edit keeps string | OK |
| Fixed-timezone due ('…Z') | weekdayAt → 2026-10-29 23:30 local | OK (London TZ) |
| Remote completion → tick, one todo session priced 0 | remoteDone → done, session award {xp:0,gold:0} | OK |
| Uncomplete here → item_uncomplete | remoteDone | OK |
| Both sides edit title → this app's wins; other fields pulled | both | OK |
| Delete here vs remote edit | both → reminder reappears one cycle | NEW P3 |
| Remote move between linked projects | moveRemote → reverted by item_move | NEW P2 |
| Local move to unlinked / other-provider list | moveLocal → still linked; code for gtasks | NEW P2 |
| Delete queue survives replaceState mid-cycle | replace → OK | OK |
| Rejected command resent forever | code | P3 holds |
| 404 on update deletes local | code (extgcal.js:419-421, exttasks.js:~419) | P2 holds |
| Lease (per device id, 120 s, no renewal) | code + migration | NEW P2 |
| Google Tasks cycle, cross-list move (DELETE unchecked then create) | code | folded into the cross-provider finding |
| Google Calendar mapping (one day, five repeats, until/count, EXDATE skip, alerts, read-only copy, KurenaiOS calendar) | smoke112 PASS; code read of fromRemote/parseRule | OK as far as smoke112 D; not re-fuzzed |

## 6. Timers (background cycles)
main.js 20 s / 5 s / 30 min; cloudsync INTERVAL (15 min) + noteChange; autosync 30 min; ext 15 min + 20 s debounce; money/mind/reviews/reports/goals/achievements 30 min; inksync 10 min + online; push publish/beat/pull; dayreview 30 s; aischedule tick. Inventory only; each verified to exist; no overlap problem found beyond the two-tab/lease findings.

## NOT checked (and why)
- Real Todoist/Google servers (no live accounts): server-dependent behaviour is modelled by the fake.
- Stale sub-object captures after replaceState under the held-redraw build (needs a per-view audit; backlog).
- kurenai-os-papers 'Keep in my cloud' copy (Exams/Files area).
- Visual pass in Dawn and shop themes for Archive pages (UI areas).
