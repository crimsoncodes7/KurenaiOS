/* Kurenai OS — smoke36.test.js
   Shared media detail + editor refinement. Verifies that Anime, Books,
   Visual Novels and Games use the same sectioned, internally scrolling
   record editor; Notes finish the form at full width; destructive and save
   actions remain separate; compact physical ranges are labelled; and the
   obsolete bottom statistics/chart components are no longer constructed.
   Run: node tools/smoke36.test.js                                      */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const { readCss } = require("./lib/css");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const css = readCss();
const src = name => fs.readFileSync(path.join(ROOT, "js/modules", name + ".js"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in smoke36"));

for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (e) { errors.push("LOAD FAIL " + match[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

function assert(ok, message) { if (!ok) throw new Error(message); }
function labels(modal) {
  return [...modal.querySelectorAll("[data-ui~='ui.field'] > [data-ui~='part.label']")].map(n => n.textContent.trim()).filter(Boolean);
}
function close(modal) {
  const button = modal.querySelector("button[aria-label='Close']");
  if (button) button.click();
}
function inspectEditor(name, open, entry, expected) {
  open(entry, noop);
  const modal = document.querySelector("[data-ui~='vault.editor']");
  assert(modal, name + " did not open the shared record modal");
  const sections = [...modal.querySelectorAll(":scope > [data-ui~='ui.form'] > [data-edit-section]")];
  const ids = sections.map(n => n.dataset.editSection);
  ["identity", "progress", "ownership", "dates", "taxonomy", "lists", "source", "notes"].forEach(id =>
    assert(ids.includes(id), name + " is missing the " + id + " section"));
  assert(ids[ids.length - 1] === "notes", name + " Notes is not the final full-width section");
  assert(sections[sections.length - 1].querySelector("[data-ui~='vault.span-2'] textarea"), name + " Notes is not full width");
  assert(modal.querySelector("[data-ui~='vault.source']"), name + " has no human-readable source/sync summary");
  const actualLabels = labels(modal);
  expected.forEach(label => assert(actualLabels.includes(label), name + " is missing field: " + label));
  assert(modal.querySelector("[data-ui~='vault.delete-actions'] [data-intent~='danger']"), name + " edit mode has no separated Delete action");
  assert(modal.querySelector("[data-ui~='vault.save-actions'] button[data-intent~='primary']"), name + " edit mode has no separated Save action");
  assert(!modal.querySelector("[data-ui~='vault.delete-actions'] button[data-intent~='primary']"), name + " Save leaked into the destructive action group");
  close(modal);
}

/* the AniList MIRROR editors (mirror release): Anime always, Books when the
   row is AniList's. Identity is read-only, there is no Delete, list state
   and the personal layer still edit. */
function inspectMirrorEditor(name, open, entry, expected, readOnly) {
  open(entry, noop);
  const modal = document.querySelector("[data-ui~='vault.editor']");
  assert(modal, name + " did not open the shared record modal");
  assert(modal.matches('[data-ui~="anime.mirror-dialog"]'), name + " is not marked as a mirror record");
  const ids = [...modal.querySelectorAll(":scope > [data-ui~='ui.form'] > [data-edit-section]")].map(n => n.dataset.editSection);
  ["identity", "progress", "source"].forEach(id => assert(ids.includes(id), name + " is missing the " + id + " section"));
  const actualLabels = labels(modal);
  expected.forEach(label => assert(actualLabels.includes(label), name + " is missing field: " + label));
  readOnly.forEach(label => {
    const field = [...modal.querySelectorAll("[data-ui~='ui.field']")].find(f => f.querySelector("[data-ui~='part.label']").textContent.trim() === label);
    assert(field && field.querySelector("[data-ui~='vault.ro']") && !field.querySelector("input, select, textarea"), name + ": " + label + " must be read-only (AniList's)");
  });
  assert(!modal.querySelector("[data-ui~='vault.delete-actions'] [data-intent~='danger']"), name + " must not offer Delete — removal happens on AniList");
  assert(modal.querySelector("[data-ui~='vault.save-actions'] button[data-intent~='primary']"), name + " has no Save action");
  assert(/mirror/i.test(modal.querySelector("[data-ui~='vault.source']").textContent), name + " does not say it mirrors AniList");
  close(modal);
}

try {
  assert(KOS.medview && KOS.medview.editorSection && KOS.medview.sourceInfo, "shared editor helpers are not exported");
  inspectMirrorEditor("Anime", KOS.mediaEditors.anime, { id: 901, module: "anime", title: "Example", genres: ["Drama"], dates: { started: "2026-01-01", finished: null } },
    ["Title", "Genres", "Status", "Episodes seen", "Score /10", "Favourite ♥", "Tags", "Cover position", "Custom lists", "Notes"],
    ["Title", "Genres", "Started"]);
  /* an empty AniList fact is omitted, not printed as a dash (invariant 77) */
  assert(!labels(document.querySelector("[data-ui~='vault.editor']") || document.body).includes("Finished"), "an empty read-only fact was printed");
  assert(KOS.mediaEditors.anime(null, noop) === null && !document.querySelector("[data-ui~='vault.editor']"),
    "Anime must refuse a manual add — the vault mirrors AniList");
  inspectMirrorEditor("Books (AniList row)", KOS.booksEditor, { id: 905, module: "books", title: "Example", author: "Abe", format: "manga",
      genres: ["Drama"], progress: { current: 1, total: 60, totalVolumes: 7 }, syncSource: "anilist", externalIds: { anilistId: 1 } },
    ["Title", "Author / mangaka", "Status", "Chapters read / 60", "Volumes read / 7", "Rating", "DNF — did not finish", "Favourite ♥", "Mood", "Shelves", "Tags", "Notes"],
    ["Title", "Author / mangaka", "Format", "Chapters", "Volumes", "Genres"]);
  inspectEditor("Books", KOS.booksEditor, { id: 902, module: "books", title: "Example" },
    ["Title", "Author / mangaka", "Cover URL", "Status", "Chapters read", "Chapters total", "Volumes read", "Volumes total", "Rating", "DNF — did not finish", "Started", "Finished", "Favourite ♥", "Notes"]);
  inspectEditor("Visual Novels", KOS.vnEditor, { id: 903, module: "vn", title: "Example" },
    ["Title", "Developer", "Cover URL", "Status", "Score /10", "Ownership", "Started", "Finished", "Genres", "Tags", "Content warnings", "Custom lists", "Notes"]);
  inspectEditor("Games", KOS.gamesEditor, { id: 904, module: "game", title: "Example" },
    ["Title", "Developer", "Publisher", "Cover URL", "Status", "Completion tier", "Playtime (hours)", "Score /10", "Backlog priority", "Platform", "Ownership", "Started", "Finished", "Genres", "Tags", "Custom lists", "Steam App ID (optional)", "Notes"]);

  KOS.booksEditor(null, noop);
  const bookModal = document.querySelector("[data-ui~='books.dialog']");
  assert(bookModal.querySelector("[data-ui~='books.range']"), "Books has no compact physical range grid");
  ["From volume", "To volume", "Condition", "Purchase date", "Price each"].forEach(label =>
    assert(labels(bookModal).includes(label), "Physical Vault range is missing label: " + label));
  assert(bookModal.querySelector("[data-ui~='books.range-submit'] button"), "Physical Vault has no explicit Add range action");
  close(bookModal);

  assert(/\.med-record-modal\s*>\s*\.med-form\s*\{[^}]*overflow-y:\s*auto/s.test(css), "record body is not internally scrollable");
  assert(/\.med-edit-section\s*\{[^}]*grid-template-columns:\s*minmax\(132px, 160px\)\s+minmax\(0, 1fr\)/s.test(css), "desktop section index/body grid is missing");
  assert(/\.med-edit-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,/s.test(css), "shared two-column field grid is missing");
  assert(/@media \(max-width: 700px\)[\s\S]*?\.med-edit-grid\s*\{\s*grid-template-columns:\s*1fr/s.test(css), "mobile editor does not collapse to one column");

  const moduleSource = ["anime", "books", "vn", "games"].map(src).join("\n");
  assert(!/class:\s*["'](?:bk-stats|vn-stats|gm-stats|gm-charts)/.test(moduleSource), "an obsolete bottom stats/chart component is still constructed");
  assert(!/function\s+analyticsCards\s*\(/.test(moduleSource), "the obsolete Games analytics builder still exists");
  ["anime", "books", "vn", "games"].forEach(name =>
    assert(/statsModal\(/.test(src(name)), name + " lost its dedicated Stats surface"));
} catch (e) {
  errors.push(e.stack || e.message);
}

if (errors.length) {
  console.log("SMOKE36 FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log("  - " + e));
  process.exit(1);
}
console.log("SMOKE36 PASS — shared media detail/editor refinement verified.");
process.exit(0);
