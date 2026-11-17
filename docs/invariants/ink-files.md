# The ink engine and Files

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### The ink engine (132–136)

132. ONE ENGINE (design turn 30, decision B). `KOS.ink` owns strokes,
    pages, tools, paper and undo; every place a pen writes is a mount of
    it (`KOS.inkUI.surface`) under a DOC KEY — `topic:<sid>:<ref>` (a
    topic's Handwritten tab), `answer:<pad>:<q>` (an answer pad, 30f),
    `review:<pad>:<card>` (a flashcard's Write strip, 30o),
    `work:<pad>:<tab>` (the Working page beside a tab), `drill:`/`blurt:`
    (30l–30n), `file:<fileId>:default` and `paper:<fileId>:<attempt>` (a
    file's layers, invariant 151) — and no surface keeps its own ink. A
    doc's `item` names what it answered, so EARLIER work is a link
    (`KOS.inkPad.earlierLink`), never the page a revision tool opens on:
    every pad, strip and Working page starts blank (asked for 26 October
    2026: no copying your own working into an answer). WIDENED for an
    attempt never marked (roadmap 5.19 item 4, design 44d): an answer
    pad's newest doc for its item with no `logged` is a DRAFT, offered
    above the blank pad ("Continue your answer from …", `KOS.inkPad.unmarked`);
    Continue opens that doc itself (`mount({resume})`) with its ink,
    editable, and Log marks it, after which it is a read-only link like
    any earlier answer.
    A page is 1000 units wide and 1414 tall (A4) unless it has its own
    `h` (a strip, a pad that grows, a PDF page at the PDF's proportions),
    whatever size it is drawn at; a
    stroke stores its points packed (`[x, y, pressure, dt…]`, tenths of a
    unit) and its outline is DERIVED on every draw (width from pressure
    only once the pen has reported pressure, else from speed), so a page
    redraws the same everywhere. INPUT: the pen and a mouse draw; a
    finger scrolls and pinches and never draws unless "Draw with a
    finger" is on (per device, `state.ui.ink.finger`; then one finger
    draws and two scroll and pinch), so the palm never draws; a pen's
    touchstart and pointerdown on the page are prevented, so iPadOS
    neither scrolls under it nor holds the stroke for Scribble — never on
    the selection's chips or a text box, whose taps must become clicks; a
    pen sample with no pressure mid-stroke, or one far from the nib and
    alone, is dropped (the "spike"); the live stroke paints once a frame;
    a two-finger TAP undoes only when both fingers go down and up within
    200 ms and move under 10 px. Undo is per page and per session. A page
    is never redrawn under the pen: `KOS.rerender` waits while
    `KOS.inkUI.busy()` (a stroke or text box open, or ink in the last
    1.5 s), and a redraw keeps a topic's open tab (`KOS.ui.redrawing`).
    Theme colours are read with the host in the document, and a reading
    from a detached host is never cached (it read every role as black).
    Every tool has OPTIONS in the bar's slot, so it never empties into a
    gap: colour where it leaves colour, three sizes (pen widths;
    `I.HL_WIDTHS`, `ERASER_SIZES`, `TEXT_SIZES`, the middle the old fixed
    size), and the eraser's and lasso's mode (`lasso`: free or box); a
    highlighter stroke keeps its `w` and a text box its `sz`. The
    tool, colour, sizes, eraser and lasso modes, Pen only and what the app saw of
    the pen are per device (`state.ui.ink`, normalised in place by
    `KOS.inkUI.prefs`); nothing about the pen syncs. Squeeze, barrel roll
    and hover are not used (decision F). THE TOOLBAR (30a–30b, 30r) docks
    on the page's top edge or FLOATS as a palette dragged by ⠿ that
    settles against the nearest edge and remembers where per orientation
    (`state.ui.ink.dock`, `.at`); under 700 it always floats, in one row.
    One palette at a time (the desk last written on owns it); inside a
    dialog it rides above the scrim. A long press (500 ms) names a tool,
    its mode and its gesture. The RULER: two fingers place and turn it
    (a mouse drags it), and a stroke started near its edge is laid along
    it. A picture pasted (⌘V) or dropped lands on the page in use.
133. ROLES, NOT COLOURS. A stroke's colour is a ROLE — pen ink, accent,
    teal, amber, green; highlighter amber, teal, bloom (36%, drawn under
    the ink) — read live from the theme (`KOS.inkUI.palette`, through a
    probe so `oklch(from …)` tokens reach the canvas as rgb), never a hex.
    Paper (blank, lined, squared 5 mm, dotted, Cornell, answer booklet)
    is CSS from the theme's `--line`, in page widths (cqw).
134. WRITING IS EVIDENCE, NEVER PAY. Pages, strokes and drills move no
    XP, gold or HP and log no session. "Pages written" (pages with ink
    and when the last was written, `KOS.ink.written`) is a line in the
    topic inspector printed only when there is one (invariant 77), and
    the Handwritten tab's count is the same number; neither is a Topic
    status check or moves RAG. The Handwritten tab is always present
    (invariant 89) and its empty state IS the page: opening it writes
    nothing, the first stroke saves page 1 (`KOS.ink.savePage` makes the
    notebook), a stroke past a page's bottom margin adds the next page.
    SIDE BY SIDE (30e) is a view of the tab offered above 1080 (landscape;
    portrait shows Page and keeps the choice, `state.ui.inkView`): the
    topic's effective notes, read-only, beside the notebook, each its own
    scroll region; it folds the spine and the inspector (which then opens
    over the panes) for the view only, never their saved choices. "Clip to
    page" copies a tapped figure, formula, table, worked step, callout or
    code block onto the page in view as a PICTURE (an image item with
    `clip: {sid, ref}`, PNG where the browser can read it back, else the
    SVG) — never text into the curriculum or a fork (invariant 86).
135. HANDWRITING IS READ ONLY WHEN ASKED (decision E, `KOS.inkAI`).
    Nothing appears until "Kurenai reads handwriting when asked" is on
    (Pen and ink, per device, `state.ui.inkRead`, off). Then "Mark with
    Kurenai" (30g), "Check my working" (30k) and "Compare with Kurenai"
    (30m) each show "What is sent" first — the picture of the page and
    the exact words, what is NOT sent, Cancel first and focused — and
    send ONE metered request to Gemini (`ai-chat` takes up to two images
    on a user message since version 6; DeepSeek refuses them). The reply
    only SUGGESTS: dashed teal until confirmed, an A never suggested
    without its M (re-checked on the device), and it writes nothing,
    rates nothing and logs nothing. An A mark cannot be ticked by hand
    before its M either (the exam engine's tally).
136. INK LIVES IN ITS OWN STORE. `kurenai-os-ink` (`docs` {key, pages
    in order, paper, inked counts, at}, `pages` {id, doc, paper, items})
    is never in the synced state document; it rides the full backup
    (`store.snapshotFull`/`importFull`). The notebook index is small and
    kept in memory (`KOS.ink.ready`) so the tab and the inspector read it
    synchronously; a change dispatches `kos-ink` {doc}. Only the pages
    near the view are drawn (an IntersectionObserver; the first two at
    once). Off screen a page's canvases are sized to nothing and removed
    (WebKit frees them only then), the pixel ratio is capped at 2 (1.5
    with two panes) and no backing store passes 4096 px. SYNC (30p,
    `KOS.inkSync`, migration `20261026000001`): pages and page orders
    replicate to the owner-only `kos_ink`, local first, merged PER STROKE
    against a `base` copy (a change on one side wins, additions on both
    survive, a deletion on either side wins and travels as a `dead`
    tombstone); the same stroke moved or erased on both sides keeps this
    device's and holds the other copy until the user chooses (Keep this
    device's, Keep the other, Keep both as two pages) — never discarded.
    A doc marked `local` (a paper's writing kept "this device only")
    never leaves. EXPORT (`KOS.inkExport`): a page as PNG, a notebook as
    PDF (pdf-lib, vendored in `assets/pdf/pdf-lib/`), on white with the
    ink in Atelier Dawn.

### Files (150–153; docs/files-plan.md revision 2, R0–R4 built)

150. ONE FILE, MANY LINKS. `KOS.files` is an INDEX over `kurenai-os-files`
    and `kurenai-os-papers` (decision A): no blob moved. A record carries
    its SHA-256 `hash`, `kind` (paper · scheme · worksheet · notes ·
    handout · photo · other), `aliases` and `links` [{kind: topic |
    assignment | exam | event | goal | paper, id}] — its subject/ref is the
    HOME link the older readers use, and `linkKeys` (a multiEntry index)
    lists them all, so a topic's or an assignment's list includes files
    linked there since. A file added again (the same hash) is LINKED, not
    stored: its `name` and `kind` are kept, the new name joins `aliases`,
    and `kind` only moves up (other < photo < handout < notes < worksheet
    < scheme < paper; a hand-picked kind may go down). A paper and an
    attachment with one hash show as ONE file and the attachment is
    promoted. "Attach to…" adds a link; "Remove" from one place removes
    the link, and deletes the file only when nothing else links it, after a
    confirm. Deleting an assignment follows the same rule (ST-25): a file
    linked anywhere else loses only that link, and the confirm names the
    files that go. A PROFILE record (`origin` `profile:…`) is nobody's
    attachment: no list, count, search or the Assistant names it, the same
    bytes added to a topic never link onto it, and it is released when no
    state references it (at once by the device that replaced it; after a
    week otherwise, `KOS.profilePics.sweep`) — unless something links to
    it, when it stays as an ordinary file. Its id is the hash of the
    picture's bytes. Freeing space (`KOS.attach.evict`, only for a file safe in the
    cloud) removes the binary only — never the record, its text index or
    its ink; opening it offers the download.
151. THE ORIGINAL IS NEVER CHANGED. Writing on a file is an ink layer:
    `file:<fileId>:default`, or one per ATTEMPT on a past paper,
    `paper:<fileId>:<attemptId>` (the layer menu: earlier attempts
    read-only unless reopened; "Start a fresh attempt" never copies ink). A
    picture is made into a one-page PDF IN MEMORY to take the same layer.
    Notes pinned to a page are the layer's `meta.pins` [{id, n, x, y, text}]
    (synced with the doc). "Save a copy with my writing" makes a new PDF.
    INK TRAVELS WITH A FILE (the user, 18 November 2026; smoke182): every
    Download and Share of a PDF or picture with writing on it — the Files
    page, a topic's Files tab, an assignment's attachments, the full-screen
    preview — gives a NEW PDF with the writing of its most recently written
    layer drawn on its pages (`KOS.files.withWriting`, through
    `KOS.inkExport.flattenPDF`, the viewer's own Save a copy), named
    "… (with my writing).pdf"; the original is always on offer ("Download
    the original"), and "Downloads include my writing" in Pen and ink (per
    device, `state.ui.exportInk`, on by default) turns it off.
152. ONE VIEWER. Every surface opens a file through `KOS.files.open` (or
    `openRec` for a raw store record): a past paper as the paper (layers,
    the clock, its scheme), a PDF or picture in `KOS.pdfView` (pdf.js
    6.3.289, vendored, cache-first in `kos-pdf-…`), anything else full
    screen with Share and Download. No surface builds its own viewer: a
    topic's Files tab previews a PDF as its first page, drawn by pdf.js.
    The viewer maps a paper's questions from its own text, marks a paper
    into ONE attempt (invariant 124), clips a region to a topic's notebook
    or — on a logged attempt — makes the page's question a redo item with
    the picture (ink doc `redo:<uid>:<q>`, shown on the card). "Ask Kurenai
    about this page" shows the page's text first and sends it in ONE
    request only on a press; flashcards it proposes wait for approval
    (71a, 86). TEXT INSIDE FILES is read on the device by pdf.js, one file
    at a time, a page per idle slice, into `kurenai-os-filetext`; search
    (`KOS.files.search`, the Files page, `KOS.search`) reads names, aliases
    and that text; a file still queued says Indexing…; no OCR. The
    Assistant reads files through `files_list` and `file_text` (read
    tools; at most 10 pages, 12,000 characters).
153. NOTHING IS SKIPPED SILENTLY. Every way in reports each file's outcome
    and why: the folder import (`KOS.examPapers.add`/`connect` → `report`:
    matched, added for matching by hand — a mock is added — or skipped as
    not a PDF, over 40 MB or already in the library), and `KOS.files.add`
    (added, linked because it was already here, or skipped: over 25 MB,
    empty). Getting files in: Add, drop on a topic, an assignment, an
    assessment or Files, paste, Scan pages (the device's camera, four
    corner handles, a projective warp, one PDF; no library), Share to
    KurenaiOS (the Web Share Target) and the folder import.
