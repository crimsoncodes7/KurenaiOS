# Files: one file layer for the whole app (roadmap 5.11)

Revision 1 — drafted 26 October 2026, from your notes after the Routines
release. Nothing here is built. Decisions are proposed in §10 and wait
for you, as with the Routines plan.

## 1. Why

Files grew up in three places, each on its own:

| Where | Store | What you can do today | What goes wrong |
|---|---|---|---|
| A topic's **Files** tab | `kurenai-os-files` (25 MB a file); metadata syncs, the binary uploads only when asked (invariant 36) | upload, preview inline, full screen, open in a tab, download, a notes field per file | a PDF opens in the browser's own viewer: you can't write on it, highlight it or keep anything you change |
| An **assignment's** attachments | the same store, under the assignment's ref | attach, see the name, remove | the name is all you get. It doesn't open, preview or download |
| **Exams & Papers' library** | `kurenai-os-papers` (40 MB); never synced or backed up (invariant 125) | add PDFs or a folder, matched to a sitting by path or name; connect a folder (Chrome and Edge) | files are **skipped** silently: anything whose path says "mock" (a "Mocks" folder too), a model answer or examiner report, a non-PDF, over 40 MB, or a repeat. The message lumps all four reasons together, so you can't tell which applied |

There's no single place to see every file, find one, link one file to
more than one thing, or write on a PDF. Roadmap 6.4 ("Past papers and
PDFs") already plans an in-app viewer with ink for the Paper library.
This plan widens that to every file and puts it on one core.

## 2. The idea

**One file record, one viewer, one ink layer.** A file is stored once and
linked to as many places as you like: a topic, an assignment, an
assessment, a calendar event, a reminder, a goal, a routine step. Every
place opens the same in-app viewer, and anything you write on a file is
kept for good, as its own layer, so the original is never altered.

## 3. The core (`KOS.files`)

- **One record:** `{fileId, name, mime, size, hash (SHA-256), pages,
  added, links [{kind, id}], refs (topics, invariant 26e), kind
  (paper · scheme · notes · handout · worksheet · photo · other),
  sitting/paper (for past papers), note, origin}`.
- **Kept where it is:** the blobs stay in their stores (no big
  migration); `KOS.files` is an index over `kurenai-os-files` and
  `kurenai-os-papers`, so old readers keep working. A new file goes into
  `kurenai-os-files`, unless it's a past paper you've chosen to keep
  device-only (§7).
- **One copy:** a file added twice (same hash) is linked again, not
  stored again.
- **Links, not copies:** "Attach to…" on any file adds a link. Removing
  a link never deletes the file while another link uses it.
- **Text inside files:** pdf.js reads each PDF's text layer once, on the
  device, into a small search index (no OCR in v1; scans have no text).

## 4. The viewer (one, everywhere)

- **PDFs drawn by pdf.js in the app,** not the browser's viewer: pages as
  you scroll (only the pages near the view are drawn, as ink does),
  thumbnails, zoom, find in the text, page jump.
- **Images** with zoom, rotate and crop (`KOS.imageCrop`); **text and
  Markdown** rendered; **audio and video** in the native players. Word,
  PowerPoint and Excel files get a preview card with download (in-app
  rendering is in §9).
- **Two side by side:** a question paper and its mark scheme, or a
  handout and your notes. This reuses the Handwritten tab's Side by side
  (30e).
- **Always there:** Download, Share (the share sheet on iPad and phone),
  Open in a tab, and "Where it's linked".
- **Assignments get it at once:** the name becomes a card that opens the
  viewer, with a thumbnail and size.

## 5. Writing on files (the ink layer)

- **The ink engine (invariant 132), under the doc key `file:<fileId>`**
  (`paper:<fileId>` as already reserved for past papers): pen,
  highlighter, eraser, lasso, shapes and text boxes on each page, at the
  PDF's own page size (ipad-plan decision C).
- **Kept for good:** the ink lives in `kurenai-os-ink` and is in the full
  backup. When ink sync ships (6.1, 30p), it syncs per stroke, as
  planned. The PDF itself is never changed.
- **Notes pinned to a page:** a sticky note at a spot, listed in a side
  panel. Clicking one jumps to it.
- **Flattened export:** "Save a copy with my writing" (pdf-lib) makes a
  new PDF you can print or send to a teacher. It can be saved as a new
  file linked to the same places.
- **Clip to notes:** a region of a page can be copied onto a topic's
  Handwritten page as a picture, as Clip to page does today.

## 6. Getting files in

- **Drop anywhere:** dropping files onto a topic, assignment or
  assessment attaches them there. Dropping onto the Files page just adds
  them.
- **Paste** a screenshot or image straight from the clipboard.
- **Scan with the camera** (iPad and phone): photograph a page and the
  app straightens it (perspective crop) and builds a multi-page PDF from
  the shots. Teacher feedback photos (§16.6 of the exams plan) use the
  same capture.
- **Share to KurenaiOS** from other apps, through the Web Share Target
  API (Chrome on Android and desktop; iOS Safari doesn't offer it, so the
  iPad uses Files and the camera instead).
- **Folder import, honest:** the result lists each file with what
  happened: added, matched to a sitting, or skipped *and why*. A school
  **mock** paper is added and offered to an assessment, not skipped.
  Model answers and examiner reports are added as their own kinds,
  matched to their sitting. Anything unmatched is matched by hand from
  the list.
- **Connect a folder** (Chrome and Edge) as today, re-checked on open.

## 7. Storage and sync

- **Your choice per kind** (decision D), with a default:
  - **attachments and notes:** metadata syncs. The binary uploads to your
    private bucket (`kos-attachments`) **automatically** under a size
    limit, rather than only when asked, so a file attached on the Mac
    opens on the iPad;
  - **past papers:** device-only as today (invariant 125). You can opt a
    file in to your private bucket, but never the deploy;
  - **ink on any file:** syncs with ink (6.1).
- **A storage page in Settings:** use per store, the biggest files,
  duplicates, unlinked files, and "Free up space" (removes the local copy
  of a file that is safe in the cloud; it downloads again when opened).
- **Persistent storage** is requested once a library passes a size
  (invariant 39 still holds: asked sparingly, never promised).

## 8. The Files page and where files show

- **A Files page** (Archive, or Study; decision F): every file, searched
  by name and text, filtered by subject, kind, where it's linked and
  "has my writing", with recent files first and a grid or list view.
- **Each record shows its files:** an assignment's detail, an
  assessment's page (its papers, scheme and your marked copy), a topic's
  Files tab (unchanged in place), a calendar event, a goal.
- **Search** (`KOS.search`) finds files by name and text (invariant 71's
  disclosure rules apply: never a credential).
- **The Assistant** gets `files_list` and `file_text` (read tools).
  "Summarise this handout" or "make flashcards from page 3" send only
  that file's text, shown first in "What is sent". Flashcards go through
  the editor's fork (invariant 86) and wait for approval (71a).

## 9. Suggestions beyond what you asked

- **Exam paper → attempt in one go:** open a past paper, write your
  answers on it, then tally marks against the scheme beside it. That logs
  the attempt by question (invariant 124), which is roadmap 6.4 made
  real.
- **Redo items from a page:** lasso a question you got wrong. It becomes
  a redo review item (`x:<uid>:<q>`) with the picture attached.
- **Handout → topic:** the app suggests the topic a handout belongs to
  from its text (on the device, by matching the specification's
  wording), and you confirm.
- **Versions:** replacing a file keeps the previous version for 30 days.
- **Office files rendered in the app** (docx through a small converter,
  read-only) if the preview card isn't enough.
- **OCR for scans** (Tesseract in a worker, on demand), so scanned pages
  can be searched too. Later, since it is heavy.

## 10. Decisions (proposed)

| | Question | Proposal |
|---|---|---|
| A | One store or an index over the two? | **An index** (`KOS.files`) over both stores; no blob migration |
| B | Viewer engine | **pdf.js** (vendored, like sql.js), images and text native |
| C | Writing on PDFs | **The ink engine**, one layer per file, original untouched, flattened export with pdf-lib |
| D | Binary sync | **Automatic for attachments under 25 MB** to your private bucket; past papers device-only unless you opt a file in |
| E | Mocks and other skipped kinds | **Add them all;** the report says what each file became |
| F | Where the Files page lives | **Archive › Files**, with each record's own files where they belong |
| G | Assistant on files | **Read tools and opt-in requests,** the text shown first |
| H | Order | The quick fixes first (§11, R0), then the viewer, then ink |

## 11. Releases

- **R0 — the quick fixes (small, can ship alone):**
  - an assignment's attachments open in the existing viewer, with
    download;
  - the folder import's per-file report, mocks accepted;
  - the full-screen preview gets Share.
- **R1 — the core and the viewer:** `KOS.files`, pdf.js, links instead
  of copies, the Files page, drop, paste, search by name.
- **R2 — writing on files:** the ink layer on PDFs and images, pinned
  notes, flattened export, Clip to notes (with ipad-plan 6.4).
- **R3 — getting files in:** camera scan, Share Target, text search,
  the storage page, automatic binary sync.
- **R4 — the Assistant and the exam loop:** file tools, flashcards from
  a page, the paper → attempt tally, redo items from a lasso.

## 12. Invariants it would add (draft)

- **150. ONE FILE, MANY LINKS.** A file is stored once (by hash) and
  linked. A link's removal never deletes a file another link uses, and
  only an explicit Delete removes the file and its remote object
  (extends invariant 36).
- **151. THE ORIGINAL IS NEVER CHANGED.** Writing on a file is an ink
  layer under `file:<fileId>` (invariant 132). Export makes a new file.
- **152. ONE VIEWER.** Every surface opens a file through `KOS.files.open`.
  No surface builds its own iframe or object URL.
- **153. NOTHING IS SKIPPED SILENTLY.** An import reports each file's
  outcome and reason.

## 13. Design (Claude Design prompt, when you're ready)

- the viewer (desktop, iPad in both orientations, phone) with the ink
  toolbar and the side-by-side scheme;
- the Files page;
- the import report;
- the camera scan flow;
- the storage page.

Art: none needed beyond the existing empty-state spots.
