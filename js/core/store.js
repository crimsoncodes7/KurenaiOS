/* Kurenai OS — core/store.js
   Single-object state persisted to localStorage on every mutation. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---- the data namespace (Graphite review aid) ----
     "Mine" is the real account. "Empty" and "Sample" are two separate
     namespaces — their own localStorage key and their own IndexedDB
     databases (mediadb.js and attachments.js read `suffix`) — so looking at
     the empty or the full app never touches the real data, and cloud sync
     and provider sync stay off outside "Mine" (cloud.js, main.js). Switching
     reloads the page; the choice is per device. */
  var MODE_KEY = "kurenai-os-data-mode";
  var MODE = "";
  try { MODE = localStorage.getItem(MODE_KEY) || ""; } catch (e) { MODE = ""; }
  if (MODE !== "empty" && MODE !== "sample") MODE = "";
  KOS.dataMode = {
    mode: MODE,
    suffix: MODE ? "-" + MODE : "",
    set: function (next) {
      next = next === "empty" || next === "sample" ? next : "";
      if (next === MODE) return;
      try {
        if (next) localStorage.setItem(MODE_KEY, next); else localStorage.removeItem(MODE_KEY);
      } catch (e) { return; }
      if (KOS.store && KOS.store.flush) KOS.store.flush();
      window.location.reload();
    }
  };

  var KEY = MODE ? "kurenai-os-" + MODE + "-v1" : "kurenai-os-v1";

  var DEFAULTS = {
    v: 1,
    created: Date.now(),
    progress: {},          // "subject:ref" -> {status, check:[c,s,q,u], note}
    ui: { subject: "compsci", view: "dash", openSections: {}, lastRef: {}, railOpen: true,
          /* Code (roadmap 5.3): per-device choices and unsaved drafts */
          code: { drafts: {} },
          /* Japanese (roadmap 5.5): per-device view choices */
          japanese: {},
          /* Creatives (roadmap 5.7 item 3): the Daily Creative's days, Momentum, the open draft */
          creatives: {},
          /* Mind (roadmap 5.9): the reading mode and place, a dialogue's turn, the Daily 15 */
          mind: {} },
    oop: { classes: [], links: [], nextId: 1 },
    /* Code (roadmap 5.3, core/code.js): evidence, task passes, proofs and
       the retrieval schedule — keyed maps throughout, so the cloud merge
       folds two devices per key */
    code: { v: 1, tasks: {}, lessons: {}, proven: {}, cards: {}, practice: {}, later: {} },
    /* Japanese (roadmap 5.5, core/ja.js): facets (item × skill, on KOS.fsrs), lesson and
       checkpoint evidence, mined lines, input tallies and settings — keyed maps throughout */
    japanese: { v: 1, facets: {}, lessons: {}, checkpoints: {}, mined: {}, input: {},
      settings: { furigana: "unknown", dailyMin: 40, speech: false }, fluency: {} },
    /* Creatives (core/creatives.js): reading evidence, works (records only; their files are in
       kurenai-os-creatives), projects, pay-once keys and Firsts — keyed maps throughout */
    creatives: { v: 1, lessons: {}, works: {}, projects: {}, paid: {}, firsts: {} },
    /* Mind (roadmap 5.9, core/mind.js): concept cards (on KOS.fsrs), lesson evidence, the one
       written prompt, versioned positions, checkpoints — keyed maps throughout */
    mind: { v: 1, cards: {}, lessons: {}, explains: {}, positions: {}, parked: {}, checkpoints: {}, tensions: {}, bq: {}, paths: {} },
    /* Achievements (roadmap 5.16, core/achievements.js): the tiers earned (never taken back), the
       ledger's monthly rollup, the showcase and the title — progress itself is never stored */
    achievements: { v: 1, earned: {}, months: {}, showcase: [], title: null },
    /* one-off repairs (core/repairs.js, quality W1): a receipt per repair that has run —
       {at, hash, checkpoint, summary} — so no device runs one twice; a keyed map */
    repairs: {},
    worked: { last: null },
    trace: {},

    /* ---- Build 2a: the Behavioural Governor ---- */
    custom: { nextId: 1, cards: [] },
    /* user-created flashcards: {id, sid, ref, q, a, created:"YYYY-MM-DD"} */

    srs: {},
    /* the schedule per card key ("sid:ref:i" curriculum, "u<id>" custom),
       FSRS since roadmap 5.6 (core/fsrs.js):
       {s, d, fl:"YYYY-MM-DD" (the day FSRS last moved it), ivl, reps,
        due:"YYYY-MM-DD", last:"YYYY-MM-DD", views, lapses, lastRating,
        ef (SM-2's ease, frozen at the switch; read only to convert)} */
    srsCfg: { retention: 0.9, examRetention: 0.95 },
    /* the flashcard scheduler's settings, synced: the recall it aims for
       at each due date (0.80–0.95) and on the day of a real exam (0 off,
       0.90–0.98), both set on Card stats */

    sessions: [],
    /* study session log — the data backbone streaks/HP/XP/RAG read from:
       {id, ts, date:"YYYY-MM-DD", type:"flashcards|due-review|quiz|exam|todo|focus",
        subject, ref, refs?:["sid:ref"], dur (seconds|null), metrics:{...}} */

    governor: {
      hp: 100, gold: 0, xp: 0,
      owned: [],                       // purchased catalog item ids
      theme: "kurenai",                // active OS theme variant
      seal: "kurenai",                 // active kanji seal variant
      avatar: { kind: "seal", id: "seal-ember", img: null, crop: null, frame: null },
      banner: null, bannerImg: null, bannerCrop: null,
      /* the one identity blurb (Build 6): a short status line and a few
         lines of "about". Every surface that shows who you are — the
         Governor hero, the Home profile band, the topbar popover — reads
         these two fields, so they can never drift apart. */
      status: "", about: "",
      shelfSkin: null,                 // Build 3j — Books Physical-tab shelf cosmetic
      shrineStyle: null,               // Build 3j — Shrine card border cosmetic
      themeFollow: false,              // design 21h — Atelier Dawn by day, the chosen dark theme by night
      lastTick: null,                  // "YYYY-MM-DD" of the last HP day-tick
      lastBacklogDrain: null           // "YYYY-MM-DD" the backlog penalty last applied
    },

    /* ---- Build 6.6: the calendar event, one record per thing ----
       There is NO global reminder threshold any more: alerts[] lives on each
       event, in the same minute-offset vocabulary reminders and assignments
       use. The v1 branch (a single `notifyDays` + a per-event `notify` day
       count) migrates once, on first access, in modules/calendar.js.
       Assignments are NEVER events — the grid reads them from
       state.assignments through KOS.assignments.forDate(). */
    /* `v` is deliberately absent here: DEFAULTS are deep-merged UNDER the
       stored state, so defaulting it to 2 would stamp a legacy branch as
       already-migrated and the one-time pass would never run. The migration
       writes it. */
    calendar: {
      nextId: 1, seeded: false,
      events: [],
      /* {id, v, title, date:"YYYY-MM-DD", allDay,
          time:"HH:MM"|null,            // start (kept as `time` since 2a)
          endTime:"HH:MM"|null,
          type:"exam|deadline|study|lesson|personal",
          subject:null|sid, ref:null, description, location,
          colour:""|palette id,         // "" = inherit the type's hue
          recur:"none|daily|weekly|fortnightly|monthly|yearly",
          recurUntil:null|"YYYY-MM-DD",
          alerts:[minutes before],
          paper, room, refs:["sid:ref"],         // exam (1.1: was topics pairs)
          durationMins:null|int,                 // exam + study block
          priority:0-3, status, showInCountdown,  // deadline
          assignmentId:null|int,                 // study block → assignment LINK
          created, updatedAt} */
      notified: {}                     // "date|eventId|occurrence|mins" -> fired
    },

    todo: {
      nextId: 1,
      manual: [],                      // LEGACY: emptied by the 6.2 migration into state.reminders
      autoChecked: {}                  // "YYYY-MM-DD|autoKey" -> true (per-day auto item ticks)
    },

    /* ---- Build 6.4: the Assignment Tracker (core/assignments.js) ----
       The canonical assignment record. Calendar chips, Countdown rows, the
       Home urgent card and Focus-session links are all DERIVED from this
       array — nothing else stores an assignment, so deleting one removes
       every surface it appeared on. Rides the normal state export. */
    assignments: {
      v: 1,
      nextId: 1,
      items: []
      /* {id,title,subject,type,description,assigned,due,dueTime,status,
          progress,priority,estimateMins,actualMins,subtasks[{id,text,done}],
          notes,refs["sid:ref"],alerts[minutes],alerted{},
          showInCalendar,showInCountdown,rewarded,created,updatedAt,
          submittedAt,completedAt} */
    },

    /* ---- Build 6.2: the Reminders store (core/reminders.js) ----
       Lists are containers (one per item); tags are cross-list labels (many).
       Smart sections are derived, never stored. Rides the normal state export
       so backup/restore carries every reminder, list and tag. */
    reminders: {
      v: 1,
      nextId: 1,
      items: [],
      /* {id,title,notes,done,completedAt,due,dueTime,priority,listId,tags[],
          subs[{id,text,done}],recur,alerts[minutes],alerted{},lastRewardedOn,
          created,updatedAt} */
      lists: [],                       // {id, name, colour}
      rewardLog: {},                   // "YYYY-MM-DD" -> rewarded completions (anti-farming cap)
      migrated: false                  // the one-time todo.manual → reminders move
    },

    focus: {
      active: null,                    // running-session snapshot (survives reload → restored paused)
      nextId: 1,
      lastConfig: { mode: "pomodoro", workMin: 25, breakMin: 5, subject: "", ref: "", refs: [] },
      penalizeDistractions: true       // tab-switch HP nick, opt-out in Focus Timer setup
    },

    /* ---- The integrated weekly plan (core/pacing.js) ----
       School scheme of work, both personal curriculums and IT F201 in ONE
       week-indexed plan, imported once from Notion (js/data/pacing.js is
       the seed; `seeded` makes that a one-time copy). Rows link to the
       generated specification leaves they cover, which is what lets the
       Pacing view compare what class is teaching against what my own plan
       has already been through.

       No progress lives here. A row's coverage is read from state.progress
       through those leaf refs, so pacing can never disagree with the topic
       page it links to, and pacing writes nothing to the Governor. The only
       stored per-row state is a note. Rides the normal state export. */
    pacing: {
      v: 1,
      seeded: false,
      importedOn: null,
      nextId: 1,
      offset: { schoolMinusPersonal: 1 },
      weeks: [],
      /* {wb:"YYYY-MM-DD", label, schoolWk|null, personalWk|null, note} */
      entries: []
      /* {id, source:"school"|"personal", subject, wk, wb, kind, area, paper,
          title, detail, refs:[specRef], note} */
    },

    /* ---- the editable curriculum (core/edits.js) ----
       One fork per topic and kind — notes, spec, flashcards, quiz, exam —
       replacing the shipped material for that topic while it exists. The
       shipped files are never written; deleting the fork restores them.
       Rides the normal state export and the cloud document. */
    edits: { v: 1, topics: {} },

    /* ---- Build 2c: tracking completion ---- */
    tracker: {
      nextId: 1,
      entries: []
      /* exam/paper records (FR-3.4/3.5 share one shape, discriminated by kind):
         {id, kind:"exam"|"paper", subject, refs:["sid:ref"], ref|null, topic,
          paper, marks, max, grade, date:"YYYY-MM-DD", well, badly, notes,
          reviewed:bool, added, updatedAt} — core/tracker.js is the gate;
          subject/ref are derived from refs (roadmap 1.1) */
    },

    /* ---- roadmap 5.8: the Exams & Deadlines hub ----
       One assessment record per exam, mock, test or deadline, keyed by a
       random string id (invariant 120); core/exams.js is the gate. */
    exams: { v: 1, assessments: {}, prefs: {} },

    resources: {
      nextId: 1,
      items: []                        // {id, subject, ref|null, name, url}
    },

    /* ---- Build 3a: Collection Matrix ----
       View preferences ONLY. Media entries live in IndexedDB
       ("kurenai-os-media"), never here — see js/core/mediadb.js. */
    media: { layout: "grid", sort: "updated" },
    /* progress entries additionally carry rag: null|"r"|"a"|"g" (manual
       confidence — separate concept from completion status) */

    /* ---- Build 3g: Purchase / Budget Planner (Collection Matrix) ----
       Wishlist items across Books, Games and Visual Novels, against ONE
       shared monthly budget pool (not per-module limits). This module is
       pure logistics — it DELIBERATELY never touches the Governor: no
       sessions, no XP/gold/HP. Buying things is not media engagement, so
       it stays outside the reward loop, consistent with HP never touching
       leisure. Release dates are entered by hand (no viable automated
       cross-media source exists). Lives in localStorage so it rides the
       standard backup (exportFull serialises the whole state object). */
    wishlist: {
      nextId: 1,
      budget: { monthlyLimit: 0, currency: "£", history: [] },
      /* history: [{ month:"YYYY-MM", spent,
                     items:[{id,title,module,price,currency,purchasedAt}] }] */
      items: []
      /* {id, module:"books"|"vn"|"game", title, coverUrl, coverCrop, price, currency,
          retailer, retailerUrl, priority, releaseDate:"YYYY-MM-DD"|null,
          status:"wantToBuy"|"waitingForRelease"|"purchased"|"cancelled",
          linkedEntryId:null|entryId, notes, addedAt, purchasedAt } */
    },

    /* ---- Collection Goals v2 ----
       Automatic goals derive from the local vault/wishlist; manual goals keep
       their own counter. Completion is recorded once but never creates a
       second Governor payout — the underlying Collection activity already
       paid through its canonical session. LocalStorage rides full backup. */
    goals: {
      v: 2,
      nextId: 1,
      items: [],
      completionLedger: {}
      /* {id,title,description,notes,type,target,current,module,linkedEntryId,
          filterKind,filterValue,startDate,deadline,
          status:"active"|"completed"|"failed",
          progress,lastCurrent,createdAt,updatedAt,completedAt,failedAt,
          completionRecordedAt}; completionLedger[id] is the anti-farming mark. */
    }
  };

  function deepMerge(base, extra) {
    if (extra === null || typeof extra !== "object" || Array.isArray(extra)) return extra;
    var out = Array.isArray(base) ? [] : Object.assign({}, base);
    Object.keys(extra).forEach(function (k) {
      if (base && typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], extra[k]);
      } else {
        out[k] = extra[k];
      }
    });
    return out;
  }

  /* fields older saves/backups may still carry but nothing reads:
     `streak` (streaks derive from the sessions log since 2a) and the
     never-used `notes` reserve. Scrubbed on load and on import so they
     stop riding into saves and backup files. */
  function scrubLegacy(s) {
    delete s.streak;
    delete s.notes;
    return renameRefs(s);
  }

  /* Specification refs that were renamed. Edexcel numbers Paper 3 as one
     run (Statistics 1–5, Mechanics 6–9) and the generator gave the whole
     paper the prefix "S", so Kinematics read "S7" as if it were
     Statistics. Mechanics keeps its section numbers and takes "M": S6–S9
     became M6–M9 on 1 Oct 2026 (tools/gen_data.py MECH_SECTIONS).
     Stored state names topics in many places — "sid:ref" keys (progress,
     SRS card keys, forks, quick notes), "sid:ref" strings (refs lists),
     and bare refs beside a subject (plan rows, ledger entries, lastRef).
     This gate is the one every document passes through — boot, backup
     import, cloud pull — so a copy written by a device that has not
     updated yet is folded in when it arrives. Idempotent; when both the
     old and the new key exist, the new one is kept. Returns the count. */
  var REF_RENAMES = { maths: /^S([6-9])(?=[.:]|$)/ };
  /* Computer Science sub-points taught as one topic (9 Oct 2026,
     tools/gen_data.py CS_MERGES): the folded leaf's ref becomes the kept
     leaf's. Exact refs only — a card key "compsci:4.5.1.3:5" must keep its
     old suffix, because the merged deck's cards still carry those keys.
     Where the kept leaf already has a record the kept leaf's wins, as for
     every rename. */
  var REF_ALIASES = {
    compsci: {
      "4.5.1.2": "4.5.1.1", "4.5.1.3": "4.5.1.1", "4.5.1.4": "4.5.1.1", "4.5.1.5": "4.5.1.1", "4.5.1.6": "4.5.1.1", "4.5.1.7": "4.5.1.1",
      "4.4.1.4": "4.4.1.3", "4.4.1.5": "4.4.1.3", "4.4.1.6": "4.4.1.3", "4.4.1.7": "4.4.1.3", "4.4.1.8": "4.4.1.3",
      "4.4.1.10": "4.4.1.9", "4.4.1.11": "4.4.1.9",
      "4.4.4.5": "4.4.4.4", "4.4.4.7": "4.4.4.6",
      "4.5.3.2": "4.5.3.1", "4.5.4.2": "4.5.4.1",
      "4.5.4.6": "4.5.4.5", "4.5.4.9": "4.5.4.5",
      "4.5.5.2": "4.5.5.1", "4.5.6.2": "4.5.6.1", "4.5.6.3": "4.5.6.1",
      "4.5.6.5": "4.5.6.4", "4.5.6.6": "4.5.6.4",
      "4.1.1.4": "4.1.1.3", "4.1.1.5": "4.1.1.3"
    }
  };
  function renamedRef(sid, ref) {
    if (typeof ref !== "string") return null;
    var al = REF_ALIASES[sid];
    if (al && Object.prototype.hasOwnProperty.call(al, ref)) return al[ref];
    var re = REF_RENAMES[sid];
    return re && re.test(ref) ? ref.replace(re, "M$1") : null;
  }
  function renamedKey(k) {
    var i = typeof k === "string" ? k.indexOf(":") : -1;
    if (i < 0) return null;
    var r = renamedRef(k.slice(0, i), k.slice(i + 1));
    return r == null ? null : k.slice(0, i + 1) + r;
  }
  function renameRefs(s) {
    var n = 0;
    function walk(o, bareSid) {
      if (Array.isArray(o)) {
        for (var i = 0; i < o.length; i++) {
          var v = o[i];
          if (typeof v === "string") {
            var r = renamedKey(v) || (bareSid ? renamedRef(bareSid, v) : null);
            if (r != null) { o[i] = r; n++; }
          } else if (v && typeof v === "object") walk(v, null);
        }
        return;
      }
      var sid = typeof o.subject === "string" ? o.subject : typeof o.sid === "string" ? o.sid : null;
      Object.keys(o).forEach(function (k) {
        var v = o[k];
        if (typeof v === "string") {
          var r = renamedKey(v) || (k === "ref" && sid ? renamedRef(sid, v) : null) || renamedRef(k, v);
          if (r != null) { o[k] = r; n++; }
        } else if (Array.isArray(v)) walk(v, k === "refs" ? sid : null);
        else if (v && typeof v === "object") walk(v, null);
        var nk = renamedKey(k);
        if (nk != null) {
          if (!Object.prototype.hasOwnProperty.call(o, nk)) o[nk] = o[k];
          delete o[k]; n++;
        }
      });
    }
    if (s && typeof s === "object") walk(s, null);
    return n;
  }

  /* ================= THE STATE DOCUMENT'S STORAGE (quality W1, RC5; DI-04, DI-10) =================

     TWO TABS. Every tab keeps its own in-memory copy of the document and
     used to write the WHOLE of it 120 ms after a change, so the next save
     in one tab erased what the other had written (a Focus session was lost
     this way on 1 November 2026). Now:

     - localStorage holds a monotonic REV beside the document (REV_KEY). A
       tab remembers its BASE: the last document it read from or wrote to
       localStorage (`lsJson`, `lsRev`).
     - The debounced save takes the Web Lock `kos-state-write<suffix>` (no
       lock where the browser has none). Inside it, if the stored document
       is not the base (another tab wrote, or an older copy of the app that
       writes no rev), the stored document is merged in THREE WAYS —
       KOS.cloudmerge.merge(base, memory, stored) — before anything is
       written, and the result goes into memory in place (the
       KOS.store.state object is kept, and so is every top-level domain the
       merge did not change). The rev is written FIRST and the document
       second: an interrupted write leaves a moved rev over an unchanged
       document, which the next merge finds to be a no-op, never a new
       document under an old rev.
     - Another tab hears of a write through the `storage` event on the
       document's key (fired once the new value is visible to it): with no
       unsaved changes it adopts the stored document, otherwise it merges
       it in and saves; then it redraws in the background
       (KOS.rerender({background: true})). No BroadcastChannel: the storage
       event already carries the news, after the value is readable.
     - flush() (pagehide) cannot wait for a lock: the same check, merge and
       write, synchronously.

     THE TAB MERGE'S RULES, BY DOMAIN — cloudmerge's own, unchanged (the
     per-device paths `ui` and `focus.active` are NOT stripped between tabs:
     a three-way merge keeps the path only one tab changed):
       sessions, calendar.events, reminders.items/lists, assignments.items,
       tracker.entries, resources.items, wishlist.items, goals.items,
       pacing.weeks/entries, custom.cards/quizzes, todo.manual/habits,
       routines.items, notify.items, assistant.schedules, money.categories/
       rules/pots, oop.classes ........ records BY ID: additions on both
                                        sides kept, a deletion wins, a same-id
                                        collision RE-KEYED (refs rewritten),
                                        a record edited on both merged field
                                        by field (later updatedAt wins a
                                        field both changed)
       *.nextId counters .............. the larger
       governor.gold / xp / hp ........ ADDITIVE: base + Δthis + Δother — and,
                                        between tabs only (TAB_MERGE.sumEqual),
                                        also when both earned the SAME amount,
                                        which the cloud's rule takes as one
       governor.owned ................. a set (union, a removal on either wins)
       refs/include/exclude/workOn/completions inside a record ... sets
       achievements.earned/months ..... monotonic (never taken back)
       japanese.facets, mind.cards .... the one reviewed later, whole
       media.shrine.order, srsCfg.fit.w  whole lists (one leaf)
       progress, srs, code, japanese, creatives, mind, edits, exams,
       routines.log, dayReview, money (settings), ext, notify.read, repairs,
       ui, focus, and every other map ...... per key, recursively; a leaf
                                        changed differently in both tabs
                                        keeps THIS tab's value (the save
                                        that merges)
     The last rule is the only last-write-wins case: a number or a list of
     plain values (not a set above) changed in BOTH tabs keeps one tab's
     value — e.g. a tally counted up in both (assistant.tally) or the
     showcase reordered in both. Records, money, pay and badges never take it.

     QUARANTINE. A stored document that does not parse is copied aside
     (QUARANTINE_KEY in localStorage when it fits, else the IndexedDB
     mirror) BEFORE anything may overwrite it; until the copy is confirmed,
     no save writes the document's key. The user is told by a persistent
     notice until they dismiss it.

     THE MIRROR (DI-10). After a localStorage write the document and its rev
     go to IndexedDB `kurenai-os-statemirror<suffix>` too, coalesced to at
     most one write every 2 s and at once when the page is hidden. At boot
     the synchronous read stays localStorage's; the mirror is read next and,
     when its rev is NEWER (or localStorage held nothing usable), it wins:
     adopted over an empty store, otherwise merged in three ways against the
     loaded document (a copy of which is kept in the mirror first). If
     localStorage is FULL, the mirror is the primary for the session, with a
     persistent notice; a save that fails in both stores is reported as a
     failure, never as saved. KOS.store.health() is the read-only status. */
  var REV_KEY = KEY + ".rev";
  var QUARANTINE_KEY = KEY + ".quarantine";
  var QUARANTINE_META = KEY + ".quarantine.meta";
  var LOCK_NAME = "kos-state-write" + KOS.dataMode.suffix;
  var MIRROR_DB = "kurenai-os-statemirror" + KOS.dataMode.suffix;
  var MIRROR_GAP = 2000;
  var TAB_MERGE = { sumEqual: true };   // see cloudmerge: equal gold earned in two tabs is summed

  var health = { primary: "localStorage", lastSaveOk: null, lastError: null, rev: 0, bytes: 0,
    mirroredRev: 0, merges: 0, quarantine: null, recovered: null };
  var lsJson = null, lsRev = 0;     // the base: the last document read from or written to localStorage
  var lastRev = 0, revFloor = 0;    // the highest rev this tab wrote anywhere; the mirror's at boot
  var loadedJson = null, loadRev = 0;
  var hold = false;                 // a quarantine copy not yet confirmed: never overwrite KEY
  var quarantinedRaw = null;
  var notices = [];

  function jclone(v) { return JSON.parse(JSON.stringify(v)); }
  function parseDoc(raw) {
    if (typeof raw !== "string") return null;
    try { var d = JSON.parse(raw); return d && typeof d === "object" && !Array.isArray(d) ? d : null; }
    catch (e) { return null; }
  }
  function readRev() {
    try { var n = parseInt(localStorage.getItem(REV_KEY), 10); return n > 0 ? n : 0; } catch (e) { return 0; }
  }
  function isQuota(e) {
    return !!e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014);
  }
  function errText(e) { return String((e && (e.message || e.name)) || e || "unknown error"); }

  /* ---- persistent notices (KOS.ui.banner; queued until ui.js has loaded) ---- */
  function notice(id, opts) {
    notices = notices.filter(function (n) { return n.id !== id; });
    notices.push({ id: id, opts: opts });
    showNotices();
  }
  function showNotices() {
    if (!KOS.ui || !KOS.ui.banner || !document.body) return;
    var list = notices; notices = [];
    list.forEach(function (n) { KOS.ui.banner(n.id, n.opts); });
  }

  /* ---- the IndexedDB mirror: one store `doc`, records {id, rev, json, at} ---- */
  function mirrorOpen(cb) {
    var idb = null;
    try { idb = window.indexedDB; } catch (e) { idb = null; }
    if (!idb) return cb(new Error("IndexedDB unavailable"));
    var req;
    try { req = idb.open(MIRROR_DB, 1); } catch (e) { return cb(e); }
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains("doc")) db.createObjectStore("doc", { keyPath: "id" });
    };
    req.onsuccess = function () { cb(null, req.result); };
    req.onerror = function () { cb(req.error || new Error("mirror open failed")); };
  }
  function mirrorGet(id, cb) {
    mirrorOpen(function (err, db) {
      if (err) return cb(err);
      try {
        var r = db.transaction("doc", "readonly").objectStore("doc").get(id);
        r.onsuccess = function () { db.close(); cb(null, r.result || null); };
        r.onerror = function () { db.close(); cb(r.error || new Error("mirror read failed")); };
      } catch (e) { db.close(); cb(e); }
    });
  }
  /* newerOnly: never put an older rev over a newer one (another tab's) */
  function mirrorPut(rec, newerOnly, cb) {
    mirrorOpen(function (err, db) {
      if (err) return cb(err);
      var done = false;
      function end(e) { if (done) return; done = true; try { db.close(); } catch (x) {} cb(e || null); }
      try {
        var tx = db.transaction("doc", "readwrite"), os = tx.objectStore("doc");
        tx.oncomplete = function () { end(null); };
        tx.onerror = function () { end(tx.error || new Error("mirror write failed")); };
        tx.onabort = function () { end(tx.error || new Error("mirror write aborted")); };
        if (!newerOnly) os.put(rec);
        else {
          var g = os.get(rec.id);
          g.onsuccess = function () {
            var cur = g.result;
            if (!cur || !(cur.rev > rec.rev)) os.put(rec);
          };
        }
      } catch (e) { end(e); }
    });
  }
  var mirrorReady = false, mirrorTimer = null, mirrorDirty = false;
  function mirrorSoon() {
    mirrorDirty = true;
    if (!mirrorReady || mirrorTimer || health.primary !== "localStorage") return;
    /* trailing, one write per MIRROR_GAP at most (and at once on hide) */
    mirrorTimer = setTimeout(function () { mirrorTimer = null; mirrorNow(); }, MIRROR_GAP);
  }
  /* the localStorage document as last read or written, to the mirror now */
  function mirrorNow(cb) {
    clearTimeout(mirrorTimer); mirrorTimer = null;
    if (!mirrorReady || !mirrorDirty || health.primary !== "localStorage" || lsJson == null || !parseDoc(lsJson)) {
      if (cb) cb(null);
      return;
    }
    mirrorDirty = false;
    var rec = { id: "state", rev: lsRev, json: lsJson, at: Date.now() };
    mirrorPut(rec, true, function (err) {
      if (err) { mirrorDirty = true; health.mirrorError = errText(err); }
      else { health.mirroredRev = Math.max(health.mirroredRev, rec.rev); health.mirrorError = null; }
      if (cb) cb(err);
    });
  }

  /* ---- quarantine: an unreadable stored document is copied aside first ---- */
  function quarantineNotice(meta) {
    notice("store-quarantine", {
      tone: "danger",
      text: "Your saved data could not be read, so KurenaiOS set it aside — nothing was deleted — and started fresh." +
        (meta.where === "pending" ? " It is still being set aside; nothing will be saved over it until that is done." :
         meta.where === "failed" ? " It could not be set aside, so nothing will be saved over it this session; export a backup." : ""),
      actions: [
        quarantinedRaw ? { label: "Download the copy", run: function () {
          try {
            var a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([quarantinedRaw], { type: "application/json" }));
            a.download = "kurenai-os-unreadable-" + new Date(meta.at).toISOString().slice(0, 10) + ".json";
            document.body.appendChild(a); a.click(); a.remove();
          } catch (e) { /* the copy stays where it was set aside */ }
        } } : null,
        { label: "Got it", run: function () {
          meta.told = true;
          try { localStorage.setItem(QUARANTINE_META, JSON.stringify(meta)); } catch (e) {}
          if (KOS.ui && KOS.ui.banner) KOS.ui.banner("store-quarantine", null);
        } }
      ].filter(Boolean)
    });
  }
  function quarantine(raw, why) {
    var at = Date.now(), key = QUARANTINE_KEY;
    quarantinedRaw = raw;
    try { var prev = localStorage.getItem(QUARANTINE_KEY); if (prev != null && prev !== raw) key = QUARANTINE_KEY + "." + at; } catch (e) {}
    var meta = { at: at, why: errText(why), where: "localStorage", key: key, told: false };
    try {
      localStorage.setItem(key, raw);
      if (localStorage.getItem(key) !== raw) throw new Error("the copy did not read back");
      try { localStorage.setItem(QUARANTINE_META, JSON.stringify(meta)); } catch (e) {}
      health.quarantine = meta;
      quarantineNotice(meta);
      return true;
    } catch (e) {
      hold = true;
      meta.where = "pending"; meta.key = "quarantine-" + at;
      health.quarantine = meta;
      quarantineNotice(meta);
      mirrorPut({ id: meta.key, rev: 0, json: raw, at: at, why: meta.why }, false, function (err) {
        if (err) {
          meta.where = "failed";
          health.lastError = "The unreadable copy could not be set aside: " + errText(err);
          quarantineNotice(meta);
          return;
        }
        meta.where = "indexeddb";
        try { localStorage.setItem(QUARANTINE_META, JSON.stringify(meta)); } catch (x) {}
        quarantineNotice(meta);
        hold = false;
        save();
      });
      return false;
    }
  }

  /* ---- the merge into memory ---- */
  /* replace the document in place, as replaceState does, but keep every
     top-level domain the new document leaves equal (its object identity) */
  function applyDoc(doc) {
    var next = deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), doc);
    scrubLegacy(next);
    var eq = KOS.cloudmerge ? KOS.cloudmerge.deepEqual : function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
    Object.keys(state).forEach(function (k) { if (!Object.prototype.hasOwnProperty.call(next, k)) delete state[k]; });
    Object.keys(next).forEach(function (k) { if (!eq(jclone({ v: state[k] }).v, next[k])) state[k] = next[k]; });
  }
  function mergeIn(other, raw, rev) {
    var base = lsJson != null ? parseDoc(lsJson) : null;
    var res = KOS.cloudmerge.merge(base, jclone(state), other, TAB_MERGE);
    applyDoc(res.doc);
    lsJson = raw; lsRev = rev;
    health.merges++;
    return res;
  }
  function memoryIsBase() {
    var b = lsJson != null ? parseDoc(lsJson) : null;
    return !!b && !!KOS.cloudmerge && KOS.cloudmerge.deepEqual(jclone(state), b);
  }

  /* ---- the write ---- */
  function saved(json, rev) {
    health.lastSaveOk = true; health.lastError = null;
    health.rev = rev; health.bytes = json.length * 2;   // UTF-16, as the browsers count it
    if (KOS.ui && KOS.ui.flashSaved) KOS.ui.flashSaved();
    return true;
  }
  function failed(e, both) {
    health.lastSaveOk = false; health.lastError = errText(e);
    console.error("Kurenai OS: save failed", e);
    if (both) {
      notice("store-failed", { tone: "danger",
        text: "KurenaiOS could not save your latest changes — the browser's storage and its backup store both refused. Export a backup now (Archive › Storage)." });
    }
    if (KOS.ui && KOS.ui.toast) KOS.ui.toast("Save failed — storage may be full. Export your data.", true);
    return false;
  }
  function toMirror(e) {
    health.primary = "indexeddb";
    health.quotaAt = Date.now();
    clearTimeout(mirrorTimer); mirrorTimer = null;
    console.warn("Kurenai OS: localStorage is full; saving to IndexedDB for this session", e);
    notice("store-quota", { tone: "danger",
      text: "This browser's storage for KurenaiOS is full, so your changes are being saved to its backup store (IndexedDB) for this session. Free some space or export a backup.",
      actions: [{ label: "Open Storage", run: function () { if (KOS.show) KOS.show("storage"); } }] });
  }
  /* returns true (written), false (failed or held) or null (the mirror's write is under way) */
  function writeNow(how) {
    if (hold) {
      health.lastSaveOk = false;
      health.lastError = "Held: the unreadable copy is still being set aside";
      return false;
    }
    var storedRaw = null, storedRev = readRev();
    try { storedRaw = localStorage.getItem(KEY); } catch (e) { storedRaw = null; }
    if (storedRaw != null && storedRaw !== lsJson && storedRaw !== quarantinedRaw) {
      var other = parseDoc(storedRaw);
      if (!other) { if (!quarantine(storedRaw, new Error("unreadable when saving"))) return false; }
      else if (KOS.cloudmerge) mergeIn(other, storedRaw, storedRev);
      else if (how === "save") { save(); return false; }   // the merge is not loaded yet: shortly
    }
    var json = JSON.stringify(state);
    if (health.primary === "localStorage") {
      var rev = Math.max(storedRev, lsRev, lastRev, revFloor) + 1;
      try {
        localStorage.setItem(REV_KEY, String(rev));   // FIRST (see above)
        localStorage.setItem(KEY, json);
        lsJson = json; lsRev = rev; lastRev = rev;
        mirrorSoon();
        return saved(json, rev);
      } catch (e) {
        try { if (storedRev) localStorage.setItem(REV_KEY, String(storedRev)); else localStorage.removeItem(REV_KEY); } catch (x) {}
        if (!isQuota(e)) return failed(e, false);
        toMirror(e);
      }
    }
    /* the mirror is the primary: its rev passes localStorage's, so the next
       boot takes it (recovery precedence) */
    var mrev = Math.max(readRev(), lsRev, lastRev, revFloor) + 1;
    lastRev = mrev;
    mirrorPut({ id: "state", rev: mrev, json: json, at: Date.now() }, false, function (err) {
      if (err) return failed(err, true);
      health.mirroredRev = Math.max(health.mirroredRev, mrev);
      saved(json, mrev);
    });
    return null;
  }

  var state;
  var raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
  var loaded = raw != null ? parseDoc(raw) : null;
  try {
    state = loaded ? deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), loaded)
                   : JSON.parse(JSON.stringify(DEFAULTS));
  } catch (e) {
    loaded = null;
    state = JSON.parse(JSON.stringify(DEFAULTS));
  }
  loadRev = readRev();
  lastRev = loadRev;
  health.rev = loadRev;
  if (loaded) { loadedJson = raw; lsJson = raw; lsRev = loadRev; }
  else if (raw != null) {
    console.warn("Kurenai OS: stored state unreadable — set aside, starting fresh.");
    quarantine(raw, new Error("unreadable at load"));
    lsRev = loadRev;
  } else {
    /* nothing stored yet: the defaults are what "nothing" means */
    lsJson = null;
  }
  /* a quarantine from an earlier boot not yet acknowledged */
  if (!health.quarantine) {
    try {
      var qm = parseDoc(localStorage.getItem(QUARANTINE_META));
      if (qm && !qm.told && qm.where !== "pending") {
        health.quarantine = qm;
        try { if (qm.where === "localStorage") quarantinedRaw = localStorage.getItem(qm.key); } catch (e) {}
        quarantineNotice(qm);
      }
    } catch (e) {}
  }
  var renamedAtLoad = scrubLegacy(state);

  var saveTimer = null, lockQueued = false;
  if (renamedAtLoad) save();
  function save() {
    /* Build 4a — nudge cloud sync (debounced + no-op when absent/signed
       out; dirtiness is DERIVED by hashing, so a missed nudge is only a
       missed shortcut, never lost data) */
    if (window.KOS && KOS.cloudsync && KOS.cloudsync.noteChange) KOS.cloudsync.noteChange("state");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; underLock(function () { return writeNow("save"); }); }, 120);
  }
  /* one writer at a time across tabs; a write already queued for the lock
     takes the latest memory when it runs, so a second is not queued */
  function underLock(fn) {
    var L = null;
    try { L = navigator.locks; } catch (e) { L = null; }
    if (!L || typeof L.request !== "function") { fn(); return; }
    if (lockQueued) return;
    lockQueued = true;
    var p;
    try {
      p = L.request(LOCK_NAME, function () { lockQueued = false; fn(); });
    } catch (e) { lockQueued = false; fn(); return; }
    if (p && p.catch) p.catch(function () { if (lockQueued) { lockQueued = false; fn(); } });
  }

  /* Build 6.5 — an IMMEDIATE, synchronous write. The 120 ms debounce above is
     a batching nicety, not a durability contract: at `pagehide` there is no
     later tick to run it in, so a refresh could drop the last fraction of a
     second of state. The Focus Timer calls this when the page is going away
     so a reload can never cost a running session the time it had banked.
     It cannot wait for the lock: the same check, merge and write, at once. */
  function flush() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try { writeNow("flush"); }
    catch (e) { console.error("Kurenai OS: flush failed", e); }
  }

  /* another tab wrote the document */
  function otherTabWrote() {
    if (hold || !KOS.cloudmerge) return;
    var now = null;
    try { now = localStorage.getItem(KEY); } catch (e) { return; }
    if (now == null || now === lsJson) return;
    var other = parseDoc(now);
    if (!other) return;                 // the next save sets it aside
    var rev = readRev();
    if (memoryIsBase()) { applyDoc(other); lsJson = now; lsRev = rev; health.merges++; }
    else { mergeIn(other, now, rev); save(); }
    lastRev = Math.max(lastRev, rev);
    health.rev = Math.max(health.rev, rev);
    mirrorSoon();
    if (KOS.rerender) { try { KOS.rerender({ background: true }); } catch (e) { /* a redraw is not data */ } }
  }
  window.addEventListener("storage", function (e) {
    if (e.key !== KEY) return;
    otherTabWrote();
  });
  function leaving() {
    if (saveTimer || lockQueued) flush();
    mirrorNow();
  }
  window.addEventListener("pagehide", leaving);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") leaving(); });

  /* the mirror at boot: read before it is ever written, and win when newer */
  function recoverFromMirror(done) {
    mirrorGet("state", function (err, rec) {
      mirrorReady = true;
      function finish(r) { mirrorSoon(); if (done) done(r || null); }
      if (err || !rec || typeof rec.json !== "string") return finish();
      var doc = parseDoc(rec.json);
      if (!doc) return finish();
      revFloor = Math.max(revFloor, rec.rev || 0);
      health.mirroredRev = Math.max(health.mirroredRev, rec.rev || 0);
      var lsEmpty = loadedJson == null;
      if (!lsEmpty && !((rec.rev || 0) > loadRev)) return finish();
      function apply() {
        if (lsEmpty || !KOS.cloudmerge) applyDoc(doc);
        else applyDoc(KOS.cloudmerge.merge(parseDoc(loadedJson), jclone(state), doc, TAB_MERGE).doc);
        health.recovered = { from: "indexeddb", rev: rec.rev || 0, at: rec.at || null, merged: !lsEmpty };
        save();
        if (KOS.rerender) { try { KOS.rerender({ background: true }); } catch (e) {} }
        finish(health.recovered);
      }
      /* the loaded document is kept in the mirror before the newer copy is merged over it */
      if (lsEmpty) apply();
      else mirrorPut({ id: "before-recovery", rev: loadRev, json: loadedJson, at: Date.now() }, false, function (e2) {
        if (e2) { health.lastError = "Recovery skipped: " + errText(e2); return finish(); }
        apply();
      });
    });
  }
  var recovery = new Promise(function (res) { recoverFromMirror(res); });

  KOS.store = {
    state: state,
    save: save,
    flush: flush,
    /* the storage's read-only status (RC5) for the Storage page:
       {primary: "localStorage" | "indexeddb", lastSaveOk, lastError, rev,
       bytes (UTF-16 size of the last document written), mirroredRev,
       merges, quarantine, recovered} */
    health: function () { return JSON.parse(JSON.stringify(health)); },
    /* the mirror written now (a page going away does this itself); a promise */
    mirrorFlush: function () { return new Promise(function (res) { mirrorDirty = true; mirrorNow(function (e) { res(!e); }); }); },
    /* settles once the boot's mirror read has run (null, or what it recovered) */
    recovery: recovery,
    _showNotices: showNotices,

    progressKey: function (subjectId, ref) { return subjectId + ":" + ref; },
    /* the renamed-ref table (S6–S9 → M6–M9) for stores outside the state
       document — topic attachments in IndexedDB use it at boot */
    renamedRef: renamedRef,

    getProgress: function (subjectId, ref) {
      var k = this.progressKey(subjectId, ref);
      if (!state.progress[k]) {
        state.progress[k] = { status: "none", check: [false, false, false, false], note: "" };
      }
      return state.progress[k];
    },

    peekProgress: function (subjectId, ref) {
      return state.progress[this.progressKey(subjectId, ref)] || null;
    },

    setStatus: function (subjectId, ref, status) {
      this.getProgress(subjectId, ref).status = status;
      save();
      if (KOS.achievements) KOS.achievements.onProgress(subjectId);
    },

    setCheck: function (subjectId, ref, i, val) {
      var p = this.getProgress(subjectId, ref);
      p.check[i] = !!val;
      // all four checks complete -> mark completed automatically
      if (p.check.every(Boolean)) p.status = "done";
      else if (p.status === "done") p.status = "started";
      // …and a topic carrying any check at all cannot still read "Not started":
      // the Topic Status component shows the status and the check-derived
      // mastery side by side, and the two must never contradict each other.
      else if (p.status === "none" && p.check.some(Boolean)) p.status = "started";
      save();
      if (KOS.achievements) KOS.achievements.onProgress(subjectId);
    },

    setNote: function (subjectId, ref, text) {
      this.getProgress(subjectId, ref).note = text;
      save();
    },

    exportJSON: function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "kurenai-os-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    },

    importJSON: function (file, done) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var incoming = JSON.parse(reader.result);
          if (!incoming || typeof incoming !== "object" || !("progress" in incoming)) {
            throw new Error("Not a Kurenai OS backup file");
          }
          Object.keys(state).forEach(function (k) { delete state[k]; });
          Object.assign(state, deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), incoming));
          scrubLegacy(state);
          save();
          done && done(null);
        } catch (e) { done && done(e); }
      };
      reader.onerror = function () { done && done(new Error("Could not read file")); };
      reader.readAsText(file);
    },

    /* --- R3 fix: unified full-coverage backup/restore ---
       Combines localStorage state + the media vault (entries + non-token KV)
       + document attachments into one JSON file. AniList/VNDB tokens are
       deliberately excluded — a backup file may be copied, shared, or stored
       in less-secure locations than the browser itself; after a restore the
       user reconnects services the same way they did originally.            */
    /* Build the complete backup object WITHOUT downloading it — the R3
       serializer, shared by the backup export and the Build 4a first-time
       cloud migration so there is exactly one representation of "all of
       the user's data". cb(err, result). */
    snapshotFull: function (cb) {
      var result = {
        kos_backup_version: 2,
        exportedAt: Date.now(),
        state: JSON.parse(JSON.stringify(state)),
        mediaEntries: [],
        mediaKV: [],
        attachments: []
      };

      var steps = 0, completed = 0, hadError = false;
      function stepDone(err) {
        if (hadError) return;
        if (err) { hadError = true; cb(err); return; }
        if (++completed >= steps) cb(null, result);
      }

      if (window.KOS && KOS.mediadb && KOS.mediadb.available()) {
        steps++;
        KOS.mediadb.exportAll(function (err, data) {
          if (!err) { result.mediaEntries = data.entries; result.mediaKV = data.kv; }
          stepDone(err);
        });
      }
      if (window.KOS && KOS.attach && KOS.attach.available()) {
        steps++;
        KOS.attach.exportAll(function (err, items) {
          if (!err) result.attachments = items;
          stepDone(err);
        });
      }
      /* Money's transactions (roadmap 5.4) live in their own IndexedDB */
      if (window.KOS && KOS.money && KOS.money.available()) {
        steps++;
        KOS.money.exportAll(function (err, dump) {
          if (!err) result.money = dump;
          stepDone(err);
        });
      }
      /* the review log (roadmap 5.6) lives in its own IndexedDB */
      if (window.KOS && KOS.reviewLog && KOS.reviewLog.available()) {
        steps++;
        KOS.reviewLog.exportAll(function (err, rows) {
          if (!err) result.reviews = rows;
          stepDone(err);
        });
      }
      /* Mind's Journal (roadmap 5.9, invariant 139) lives in its own IndexedDB */
      if (window.KOS && KOS.mindJournal && KOS.mindJournal.available()) {
        steps++;
        KOS.mindJournal.exportAll(function (err, dump) {
          if (!err && dump) result.mind = dump;
          stepDone(err);
        });
      }
      /* handwriting (roadmap 6.1) lives in its own IndexedDB */
      if (window.KOS && KOS.ink && KOS.ink.available()) {
        steps++;
        KOS.ink.exportAll(function (err, dump) {
          if (!err && dump) result.ink = dump;
          stepDone(err);
        });
      }
      /* Creatives' files (roadmap 5.7 item 3) live in their own IndexedDB */
      if (window.KOS && KOS.creatives && KOS.creatives.files.available()) {
        steps++;
        KOS.creatives.files.exportAll(function (err, dump) {
          if (!err && dump) result.creatives = dump;
          stepDone(err);
        });
      }
      if (steps === 0) cb(null, result);
    },

    exportFull: function (done) {
      this.snapshotFull(function (err, result) {
        if (err) { done && done(err); return; }
        var blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "kurenai-os-full-backup-" + new Date().toISOString().slice(0, 10) + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
        done && done(null);
      });
    },

    importFull: function (file, done) {
      var reader = new FileReader();
      reader.onload = function () {
        var backup, incoming;
        try {
          var parsed = JSON.parse(reader.result);
          if (parsed && typeof parsed === "object" && "state" in parsed) {
            backup = parsed;
            incoming = parsed.state;
          } else if (parsed && typeof parsed === "object" && "progress" in parsed) {
            /* legacy format: the whole file IS the state object */
            incoming = parsed;
            backup = { kos_backup_version: 1, state: incoming };
          } else {
            return done && done(new Error("Not a Kurenai OS backup file"));
          }
          if (!incoming || typeof incoming !== "object" || !("progress" in incoming)) {
            return done && done(new Error("Not a Kurenai OS backup file"));
          }
        } catch (e) { return done && done(e); }

        /* Restore localStorage state */
        KOS.store.replaceState(incoming);

        var version = backup.kos_backup_version || 1;
        var report = { restoredSections: ["study & governor data"], missingSections: [] };

        if (version < 2) {
          report.missingSections.push(
            "media vault (not in this backup — re-sync from AniList/VNDB to restore)",
            "attachments (not in this backup — attach files again manually)"
          );
          return done && done(null, report);
        }

        function restoreMedia(next) {
          if (!window.KOS || !KOS.mediadb || !KOS.mediadb.available()) {
            report.missingSections.push("media vault (IndexedDB unavailable)");
            return next();
          }
          var data = { entries: backup.mediaEntries || [], kv: backup.mediaKV || [] };
          KOS.mediadb.importAll(data, function (err) {
            if (err) report.missingSections.push("media vault (error: " + err.message + ")");
            else report.restoredSections.push("media vault (" + data.entries.length + " entries)");
            next();
          });
        }

        function restoreFiles(next) {
          var items = backup.attachments || [];
          if (!items.length) return next();
          if (!window.KOS || !KOS.attach || !KOS.attach.available()) {
            report.missingSections.push("attachments (IndexedDB unavailable)");
            return next();
          }
          KOS.attach.importAll(items, function (err) {
            if (err) report.missingSections.push("attachments (error: " + err.message + ")");
            else report.restoredSections.push("attachments (" + items.length + " files)");
            next();
          });
        }

        function restoreMoney(next) {
          if (!backup.money) return next();
          if (!window.KOS || !KOS.money || !KOS.money.available()) {
            report.missingSections.push("money transactions (IndexedDB unavailable)");
            return next();
          }
          KOS.money.importAll(backup.money, function (err, out) {
            if (err) report.missingSections.push("money transactions (error: " + err.message + ")");
            else report.restoredSections.push("money transactions (" + out.tx + ")");
            next();
          });
        }

        function restoreReviews(next) {
          if (!backup.reviews) return next();
          if (!window.KOS || !KOS.reviewLog || !KOS.reviewLog.available()) {
            report.missingSections.push("review log (IndexedDB unavailable)");
            return next();
          }
          KOS.reviewLog.importAll(backup.reviews, function (err, out) {
            if (err) report.missingSections.push("review log (error: " + err.message + ")");
            else report.restoredSections.push("review log (" + out.rows + " reviews)");
            next();
          });
        }

        function restoreInk(next) {
          if (!backup.ink) return next();
          if (!window.KOS || !KOS.ink || !KOS.ink.available()) {
            report.missingSections.push("handwriting (IndexedDB unavailable)");
            return next();
          }
          KOS.ink.importAll(backup.ink, function (err, out) {
            if (err) report.missingSections.push("handwriting (error: " + err.message + ")");
            else report.restoredSections.push("handwriting (" + out.pages + " pages)");
            next();
          });
        }

        function restoreCreatives(next) {
          if (!backup.creatives) return next();
          if (!window.KOS || !KOS.creatives || !KOS.creatives.files.available()) {
            report.missingSections.push("creative work (IndexedDB unavailable)");
            return next();
          }
          KOS.creatives.files.importAll(backup.creatives, function (err, out) {
            if (err) report.missingSections.push("creative work (error: " + err.message + ")");
            else report.restoredSections.push("creative work (" + out.files + " files)");
            next();
          });
        }

        function restoreMind(next) {
          if (!backup.mind) return next();
          if (!window.KOS || !KOS.mindJournal || !KOS.mindJournal.available()) {
            report.missingSections.push("Mind's Journal (IndexedDB unavailable)");
            return next();
          }
          KOS.mindJournal.importAll(backup.mind, function (err, out) {
            if (err) report.missingSections.push("Mind's Journal (error: " + err.message + ")");
            else report.restoredSections.push("Mind's Journal (" + out.entries + " entries)");
            next();
          });
        }

        restoreMedia(function () { restoreFiles(function () { restoreMoney(function () { restoreReviews(function () { restoreInk(function () { restoreCreatives(function () { restoreMind(function () {
          /* Build 4a — a restore is authoritative for this account: cloud
             sync must re-baseline (push everything, tombstone remote rows
             the backup no longer carries) instead of trusting stale
             watermarks. No-op when cloud sync is absent or signed out. */
          if (window.KOS && KOS.cloudsync && KOS.cloudsync.noteRestore) KOS.cloudsync.noteRestore();
          done && done(null, report);
        }); }); }); }); }); }); });
      };
      reader.onerror = function () { done && done(new Error("Could not read file")); };
      reader.readAsText(file);
    },

    /* Replace the whole state document in place (restore + Build 4a cloud
       pull share this path): defaults merged under, legacy fields scrubbed,
       every existing reference to KOS.store.state stays valid. */
    replaceState: function (incoming) {
      Object.keys(state).forEach(function (k) { delete state[k]; });
      Object.assign(state, deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), incoming));
      scrubLegacy(state);
      save();
    },

    reset: function () {
      Object.keys(state).forEach(function (k) { delete state[k]; });
      Object.assign(state, JSON.parse(JSON.stringify(DEFAULTS)));
      save();
    }
  };
})();
