/* Kurenai OS — smoke32.test.js
   Build 6.3: the Study → Files tab.

     A · a selectable file list; selecting opens that file's preview;
         PDF, image and unsupported-type handling each render correctly
     B · preview controls: fit width, fit page, zoom, expand/full screen,
         collapse, open externally, download
     C · notes live BENEATH the preview; the PDF frame carries no fixed
         pixel height (that is what clipped the embedded toolbar)
     D · metadata (name, type, size, added, topic, notes) and the actions
         view / open / rename / remove / replace
     E · IndexedDB persistence, backup/restore fidelity, missing and
         corrupt records, and reload behaviour
   Run: node tools/smoke32.test.js                                          */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;
if (!window.AbortController) window.AbortController = class { constructor() { this.signal = {}; } abort() {} };
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB; window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in this suite"));

/* jsdom has no object-URL plumbing; record every mint/release so the suite
   can also assert the module doesn't leak them */
let minted = [], revoked = [];
window.URL.createObjectURL = b => { const u = "blob:stub/" + (minted.length + 1); minted.push({ url: u, blob: b }); return u; };
window.URL.revokeObjectURL = u => { revoked.push(u); };
let opened = [];
window.open = (u, t) => { opened.push({ url: u, target: t }); return { focus() {} }; };

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
const steps = [];
const step = (n, f) => steps.push([n, f]);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const p = fn => new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v)));
const tick = ms => new Promise(r => setTimeout(r, ms || 40));
const btn = re => $$(".att-stage .mini-btn, .att-stage .btn").find(b => re.test(b.textContent));

function mkFile(name, mime, bytes) {
  return new window.File([new Uint8Array(bytes || [1, 2, 3, 4])], name, { type: mime });
}
const SID = "compsci", REF = "4.1.1.1";

async function mount(sid, ref) {
  const panel = document.getElementById("main");
  panel.innerHTML = "";
  KOS.attach.mountTab(panel, sid || SID, ref || REF);
  await tick(90);
}

/* ============ A · the file list + selection ============ */
console.log("== A · file structure ==");
step("seed: a PDF, an image, a text file and an unsupported type", async () => {
  const existing = await p(cb => KOS.attach.list(SID, REF, cb));
  for (const r of existing) await p(cb => KOS.attach.remove(r.id, cb));
  await p(cb => KOS.attach.add(SID, REF, mkFile("markscheme.pdf", "application/pdf", [37, 80, 68, 70]), cb));
  await p(cb => KOS.attach.add(SID, REF, mkFile("diagram.png", "image/png"), cb));
  await p(cb => KOS.attach.add(SID, REF, mkFile("notes.txt", "text/plain"), cb));
  await p(cb => KOS.attach.add(SID, REF, mkFile("worksheet.docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), cb));
  const all = await p(cb => KOS.attach.list(SID, REF, cb));
  if (all.length !== 4) throw new Error("seed failed: " + all.length);
});

step("the tab renders a selectable list, one entry per file", async () => {
  await mount();
  const files = $$(".att-file");
  if (files.length !== 4) throw new Error("expected 4 list entries, got " + files.length);
  if (!files.every(f => f.getAttribute("role") === "option")) throw new Error("entries are not a listbox option set");
  const sel = files.filter(f => f.classList.contains("selected"));
  if (sel.length !== 1) throw new Error("exactly one file should be selected on mount, got " + sel.length);
  if (sel[0].getAttribute("aria-selected") !== "true") throw new Error("selection is not exposed to assistive tech");
});

step("selecting a file opens THAT file's preview", async () => {
  const pdfRow = $$(".att-file").find(f => /markscheme\.pdf/.test(f.textContent));
  click(pdfRow);
  await tick();
  if (!$$(".att-file").find(f => /markscheme\.pdf/.test(f.textContent)).classList.contains("selected")) throw new Error("clicking did not select");
  if ($$(".att-file.selected").length !== 1) throw new Error("selection is not exclusive");
  if (!/markscheme\.pdf/.test($(".att-stage-name").textContent)) throw new Error("the stage shows a different file");
  if (!$(".att-preview .att-pdf")) throw new Error("no PDF frame for a PDF");

  click($$(".att-file").find(f => /diagram\.png/.test(f.textContent)));
  await tick();
  if (!$(".att-preview .att-img")) throw new Error("no image element for an image");
  if ($(".att-preview .att-pdf")) throw new Error("the previous PDF frame survived the switch");
});

step("an unsupported type shows metadata plus Open/Download, not a broken frame", async () => {
  click($$(".att-file").find(f => /worksheet\.docx/.test(f.textContent)));
  await tick();
  if ($(".att-preview")) throw new Error("an unpreviewable file must not mount a preview frame");
  const card = $(".att-unusable");
  if (!card) throw new Error("no explanatory card for the unsupported type");
  if (!/Word/.test($(".att-meta").textContent)) throw new Error("the type is not reported in the metadata");
  if (!card.querySelector(".btn")) throw new Error("no Open/Download action offered");
  if (!/Open/.test(card.textContent) || !/Download/.test(card.textContent)) throw new Error("card actions: " + card.textContent);
});

/* ============ B · preview controls ============ */
console.log("== B · preview controls ==");
step("fit width / fit page / zoom each change how the document is laid out", async () => {
  click($$(".att-file").find(f => /diagram\.png/.test(f.textContent)));
  await tick();
  if (!$(".att-preview.fit-width")) throw new Error("fit width is not the default");

  click(btn(/Fit page/));
  await tick();
  if (!$(".att-preview.fit-page")) throw new Error("Fit page did not apply");

  click($$(".att-bar .mini-btn").find(b => b.textContent === "+"));
  await tick();
  if (!$(".att-preview.fit-zoom")) throw new Error("zooming did not switch the fit mode");
  if ($(".att-zoom").textContent === "100%") throw new Error("zoom level did not change");
  if (!($(".att-img").getAttribute("style") || "").includes("width")) throw new Error("zoom did not size the image");

  click($$(".att-bar .mini-btn").find(b => b.textContent === "−"));
  await tick();
  if ($(".att-zoom").textContent !== "100%") throw new Error("zoom out did not step back: " + $(".att-zoom").textContent);
});

step("a PDF's fit mode rides the viewer fragment, and the toolbar is never suppressed", async () => {
  click($$(".att-file").find(f => /markscheme\.pdf/.test(f.textContent)));
  await tick();
  const src = () => $(".att-pdf").getAttribute("src");
  click(btn(/Fit width/));                       // the previous step left zoom mode on
  await tick();
  if (!/#view=FitH$/.test(src())) throw new Error("fit width should request FitH, got " + src());
  click(btn(/Fit page/));
  await tick();
  if (!/#view=Fit$/.test(src())) throw new Error("fit page should request Fit, got " + src());
  click($$(".att-bar .mini-btn").find(b => b.textContent === "+"));
  await tick();
  if (!/#zoom=\d+$/.test(src())) throw new Error("zoom should request a zoom fragment, got " + src());
  if (/toolbar=0/.test(src())) throw new Error("the embedded PDF toolbar must never be suppressed");
});

step("collapse hides the preview and keeps everything else; expand restores it", async () => {
  const collapse = btn(/Collapse/);
  if (!collapse) throw new Error("no collapse control");
  click(collapse);
  await tick();
  if ($(".att-preview")) throw new Error("collapse did not remove the preview");
  if (!$(".att-collapsed")) throw new Error("no indication that the preview is hidden");
  if (!$(".att-notes")) throw new Error("collapsing the preview also hid the notes");
  if (!$(".att-meta")) throw new Error("collapsing the preview also hid the metadata");
  click(btn(/Expand/));
  await tick();
  if (!$(".att-preview")) throw new Error("expand did not bring the preview back");
});

step("full screen opens an overlay with its own preview and closes cleanly", async () => {
  click(btn(/Full screen/));
  await tick();
  const fs2 = $(".att-fs");
  if (!fs2) throw new Error("no full-screen overlay");
  if (!fs2.querySelector(".att-preview.is-full")) throw new Error("the overlay has no preview");
  if (!fs2.querySelector(".att-fs-bar")) throw new Error("the overlay has no control bar");
  document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await tick();
  if ($(".att-fs")) throw new Error("Escape did not close the overlay");
});

step("open externally and download are both offered and both act", async () => {
  opened = []; minted = [];
  click(btn(/Open/));
  await tick();
  if (!opened.length) throw new Error("Open did not hand the file to a new tab");
  if (!/^blob:/.test(opened[0].url)) throw new Error("Open did not use an object URL");
  const before = minted.length;
  click(btn(/Download/));
  await tick();
  if (minted.length <= before) throw new Error("Download did not mint a URL for the anchor");
});

/* ============ C · layout ============ */
console.log("== C · layout ==");
step("notes sit BENEATH the preview, inside the stage", async () => {
  const kids = [...$(".att-stage").children].map(n => n.className.split(" ")[0]);
  const iPrev = kids.findIndex(c => c === "att-preview" || c === "att-unusable" || c === "att-collapsed");
  const iNotes = kids.indexOf("att-notes");
  if (iNotes === -1) throw new Error("the notes field is not in the stage: " + kids.join(","));
  if (iPrev === -1 || iNotes < iPrev) throw new Error("notes must come after the preview: " + kids.join(","));
});

step("the inspector still collapses, and the file list is its own column", () => {
  const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
  if (!/\.study-grid\.insp-closed/.test(css)) throw new Error("the inspector collapse rule is gone");
  if (!/\.att-body\s*{[^}]*grid-template-columns/.test(css)) throw new Error("the Files tab is not a two-column layout");
});

step("no fixed pixel height on the PDF frame — that is what clipped its toolbar", () => {
  const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
  const rule = css.match(/\.att-pdf\s*{([^}]*)}/);
  if (!rule) throw new Error(".att-pdf has no rule");
  const height = (rule[1].match(/(?:^|[;\s])height:\s*([^;]+)/) || [])[1] || "";
  if (/^\s*\d+px\s*$/.test(height)) throw new Error("the PDF frame is back on a fixed pixel height: " + height);
  if (!/vh/.test(height)) throw new Error("the PDF frame height should be viewport-relative, got " + height);
  if (/\.att-viewer\s+iframe\s*{[^}]*height:\s*\d+px/.test(css)) throw new Error("the old fixed-height viewer rule is back");
});

/* ============ D · metadata + actions ============ */
console.log("== D · metadata and actions ==");
step("every required metadata field is shown", async () => {
  click($$(".att-file").find(f => /markscheme\.pdf/.test(f.textContent)));
  await tick();
  if (!/markscheme\.pdf/.test($(".att-stage-name").textContent)) throw new Error("filename missing");
  const meta = $(".att-meta").textContent;
  ["Type", "Size", "Added", "Topic"].forEach(k => {
    if (meta.indexOf(k) === -1) throw new Error("metadata is missing " + k + ": " + meta);
  });
  if (!/PDF/.test(meta)) throw new Error("file type not reported");
  if (!new RegExp(REF).test(meta)) throw new Error("linked topic not reported: " + meta);
  if (!$(".att-notes textarea")) throw new Error("notes field missing");
});

step("rename keeps the record's identity — id, fileId and notes all survive", async () => {
  const before = (await p(cb => KOS.attach.list(SID, REF, cb))).find(r => r.name === "markscheme.pdf");
  await p(cb => KOS.attach.setNote(before.id, "check Q7 working", cb));
  await p(cb => KOS.attach.rename(before.id, "markscheme-2024.pdf", cb));
  const after = await p(cb => KOS.attach.get(before.id, cb));
  if (after.name !== "markscheme-2024.pdf") throw new Error("rename did not apply");
  if (after.fileId !== before.fileId) throw new Error("rename changed the cloud identity — sync would see a delete + add");
  if (after.note !== "check Q7 working") throw new Error("rename dropped the note");
  if (after.size !== before.size) throw new Error("rename touched the payload");
});

step("replace swaps the binary but keeps identity, topic and notes", async () => {
  const before = (await p(cb => KOS.attach.list(SID, REF, cb))).find(r => /markscheme-2024/.test(r.name));
  await p(cb => KOS.attach.replace(before.id, mkFile("v2.pdf", "application/pdf", [1, 2, 3, 4, 5, 6, 7, 8]), cb));
  const after = await p(cb => KOS.attach.get(before.id, cb));
  if (after.size !== 8) throw new Error("the binary was not replaced: " + after.size);
  if (after.id !== before.id || after.fileId !== before.fileId) throw new Error("replace broke identity");
  if (after.note !== "check Q7 working") throw new Error("replace dropped the note — the note is about the document, not the upload");
  if (after.subject !== SID || after.ref !== REF) throw new Error("replace moved the topic link");
});

step("the stage offers rename, replace and remove", async () => {
  await mount();
  const labels = $$(".att-actions .mini-btn").map(b => b.textContent);
  ["Rename", "Replace", "Remove"].forEach(a => {
    if (!labels.some(l => l.indexOf(a) !== -1)) throw new Error("missing action " + a + " — got " + labels.join("|"));
  });
});

step("remove deletes the record and the selection falls back safely", async () => {
  const n0 = $$(".att-file").length;
  click($$(".att-actions .mini-btn").find(b => /Remove/.test(b.textContent)));
  await tick(140);
  const n1 = $$(".att-file").length;
  if (n1 !== n0 - 1) throw new Error(`remove: ${n0} -> ${n1}`);
  if ($$(".att-file.selected").length !== 1) throw new Error("after a delete the tab must reselect something");
});

/* ============ E · persistence ============ */
console.log("== E · persistence ==");
step("records persist in IndexedDB across a fresh mount", async () => {
  const before = await p(cb => KOS.attach.list(SID, REF, cb));
  await mount();
  const rows = $$(".att-file").length;
  if (rows !== before.length) throw new Error(`reload shows ${rows} of ${before.length}`);
});

/* NOTE: as smoke13 documents, a full exportAll round-trip is not testable
   under fake-indexeddb — its structuredClone strips the Blob prototype on
   retrieval, so nothing read back out of the store is encodable. What IS
   testable here is the disaster-recovery direction (importAll fidelity) plus
   the fail-fast guarantee below; the export path is verified in a real
   browser. */
step("restore returns every field a file carries, including renames and notes", async () => {
  const payload = [
    { id: 901, subject: SID, ref: REF, name: "renamed-paper.pdf", mime: "application/pdf", size: 5,
      note: "page 3 onwards", added: 1700000000000, fileId: "f-901",
      blobBase64: "data:application/pdf;base64,JVBERi0=" },
    { id: 902, subject: SID, ref: REF, name: "chart.png", mime: "image/png", size: 4,
      note: "", added: 1700000001000, fileId: "f-902",
      blobBase64: "data:image/png;base64,AQIDBA==" }
  ];
  await p(cb => KOS.attach.importAll(payload, cb));
  const back = await p(cb => KOS.attach.list(SID, REF, cb));
  if (back.length !== 2) throw new Error("restore count: " + back.length);
  const pdf = back.find(r => r.id === 901);
  if (!pdf) throw new Error("the record id did not survive");
  ["name", "mime", "size", "note", "added", "fileId"].forEach(k => {
    if (pdf[k] !== payload[0][k]) throw new Error(`restore lost ${k}: ${pdf[k]} vs ${payload[0][k]}`);
  });
  if (!pdf.blob) throw new Error("restore produced no binary");
  /* and the restored set drives the tab exactly like a live one */
  await mount();
  if ($$(".att-file").length !== 2) throw new Error("the restored files do not render");
  if (!$$(".att-file").some(f => /renamed-paper\.pdf/.test(f.textContent))) throw new Error("a restored rename is missing");
});

step("an unencodable attachment fails the export fast instead of hanging it", async () => {
  const rec = await p(cb => KOS.attach.add(SID, REF, mkFile("ok.png", "image/png"), cb));
  const err = await new Promise(res => {
    const t = setTimeout(() => res(new Error("TIMED OUT — the export hung")), 4000);
    KOS.attach.exportAll(e => { clearTimeout(t); res(e); });
  });
  if (err && /TIMED OUT/.test(err.message)) throw err;
  await p(cb => KOS.attach.remove(rec, cb));
});

step("a record with no binary is reported as living elsewhere, not as broken", async () => {
  await p(cb => KOS.attach.putRemoteMeta({ fileId: "elsewhere-1", subject: SID, ref: REF,
    name: "on-another-device.pdf", mime: "application/pdf", size: 4096, note: "", updatedAt: Date.now() }, cb));
  await mount();
  click($$(".att-file").find(f => /on-another-device/.test(f.textContent)));
  await tick();
  if ($(".att-preview")) throw new Error("a blob-less record must not mount a preview");
  const card = $(".att-unusable");
  if (!card || !/another device/i.test(card.textContent)) throw new Error("no honest explanation: " + (card && card.textContent));
  if (!$$(".att-bar .mini-btn").some(b => /cloud/i.test(b.textContent))) throw new Error("no cloud download offered");
});

step("a stored-but-empty record is called out as damaged, distinctly from a synced one", async () => {
  const id = await p(cb => KOS.attach.add(SID, REF, mkFile("truncated.pdf", "application/pdf", []), cb));
  await mount();
  const row = $$(".att-file").find(f => /truncated\.pdf/.test(f.textContent));
  if (!row) throw new Error("the damaged record is not listed");
  if (!row.classList.contains("degraded")) throw new Error("the list does not flag it");
  click(row);
  await tick();
  const card = $(".att-unusable");
  if (!card || !/empty/i.test(card.textContent)) throw new Error("damaged state not explained: " + (card && card.textContent));
  if (/another device/i.test(card.textContent)) throw new Error("a damaged file must not be confused with a synced-elsewhere one");
  await p(cb => KOS.attach.remove(id, cb));
});

step("an empty topic shows an empty state, not a broken stage", async () => {
  await mount("maths", "9.9.9");
  if ($$(".att-file").length) throw new Error("a topic with no files listed some");
  if (!$(".att-empty")) throw new Error("no empty state in the list");
  if (!$(".att-stage-empty")) throw new Error("no empty state on the stage");
  if ($(".att-preview")) throw new Error("an empty topic mounted a preview");
});

step("object URLs are released rather than leaked as the selection moves", async () => {
  await mount();
  revoked = [];
  for (const f of $$(".att-file").slice(0, 3)) { click(f); await tick(); }
  if (!revoked.length) throw new Error("switching files never revoked a previous object URL");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE32 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE32 PASS — Study Files tab verified (" + steps.length + " steps).");
  process.exit(0);
})();
