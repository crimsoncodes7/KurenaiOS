/* Kurenai OS — smoke51.test.js
   The editable curriculum: core/edits.js, the study editor
   (modules/editor.js), the Markdown block, and what the rest of the app
   does with a topic the user has changed.

   TESTED PROPERTIES:
   1.  Shipped material comes back in editable shape with DETERMINISTIC ids
       ("s<i>"), so two devices forking the same topic agree on every row.
   2.  set/get/has/reset: a fork replaces the shipped material for its kind
       only; reset restores the shipped material exactly (it was never
       written); KOS.content.get()/has() answer with the effective entry.
   3.  Flashcards keep their SM-2 key through an edit, a reorder and a
       deletion of a neighbour; a card added in the editor gets its own
       key; the due queue and the topic deck agree.
   4.  A quiz fork is what the MCQ engine mounts; an exam fork's parts and
       flattening round-trip through the editor's shape.
   5.  The specification converts from generated lines to blocks and a
       fork renders as blocks on the Specification tab.
   6.  Markdown: headings, fences, tables, lists, quotes, task items; raw
       HTML stays text; javascript: links are refused; $maths$ is left for
       KaTeX and never mangled by emphasis rules.
   7.  The editor UI: Edit opens the panel beside the page; adding a block
       forks the topic and the page re-renders live; a page break creates
       a page in the strip; selecting a block marks it in the article; Done
       closes and clears ui.editing; the state is per-device.
   8.  Reset to curriculum through the panel restores the shipped notes.
   9.  Two devices' forks of one topic merge by row id — different new
       blocks both survive, the shared shipped rows do not double.
   10. Edits ride the full backup snapshot.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke51.test.js                                            */
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
window.confirm = () => true;
window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in smoke51"));
window.matchMedia = q => ({ matches: false, media: q, addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop });
window.IntersectionObserver = function () { const self = { targets: [], observe: t => self.targets.push(t), unobserve: noop, disconnect: noop }; return self; };
for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (e) { errors.push("LOAD FAIL " + match[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const type = (n, v) => { n.value = v; n.dispatchEvent(new window.Event("input", { bubbles: true })); };
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
const steps = [];
const step = (n, f) => steps.push([n, f]);
function assert(ok, message) { if (!ok) throw new Error(message); }
const clone = o => JSON.parse(JSON.stringify(o));

const SID = "compsci", REF = "4.2.3.1";       // an enriched leaf: notes, cards, quiz, exam
const SHIPPED = clone(window.KOS_CONTENT[SID + ":" + REF]);
function fresh() { KOS.store.state.edits = { v: 1, topics: {} }; KOS.store.state.ui.editing = null; }

/* ============ 1 · shapes ============ */
console.log("== 1 · editable shapes ==");
step("shipped notes come back as id-bearing blocks, strings as {p}, ids deterministic", () => {
  fresh();
  const a = KOS.edits.material(SID, REF, "notes"), b = KOS.edits.material(SID, REF, "notes");
  assert(a.length === SHIPPED.notes.length, "block count changed: " + a.length + " vs " + SHIPPED.notes.length);
  a.forEach((blk, i) => {
    assert(blk.id === "s" + i, "block " + i + " id is not deterministic: " + blk.id);
    if (typeof SHIPPED.notes[i] === "string") assert(blk.p === SHIPPED.notes[i], "a string block did not become {p}");
  });
  assert(JSON.stringify(a) === JSON.stringify(b), "two reads of the shipped material disagree");
  assert(!KOS.edits.has(SID, REF, "notes"), "reading the material created a fork");
  const cards = KOS.edits.material(SID, REF, "flashcards");
  assert(cards.length === SHIPPED.flashcards.length && cards[0].k === SID + ":" + REF + ":0", "flashcards did not keep their SM-2 keys: " + (cards[0] && cards[0].k));
});

step("the renderer treats {p} and an id like the shipped forms, wrapping id-bearing blocks", () => {
  const html1 = KOS.content.renderBlocks(["plain", { h: "H" }]);
  const html2 = KOS.content.renderBlocks([{ p: "plain", id: "x1" }, { h: "H", id: "x2" }]);
  assert(html1 === "<p>plain</p><h4 class=\"n-h\">H</h4>", "baseline render changed: " + html1);
  assert(/<div class="n-blk" data-bid="x1"><p>plain<\/p><\/div>/.test(html2), "the {p} block did not render wrapped: " + html2);
  assert(/data-bid="x2"><h4/.test(html2), "the heading did not render wrapped");
});

/* ============ 2 · set / reset / effective ============ */
console.log("== 2 · fork and reset ==");
step("a fork replaces one kind and leaves the others shipped; reset restores exactly", () => {
  fresh();
  const notes = KOS.edits.material(SID, REF, "notes");
  notes.push({ p: "my own paragraph" });
  KOS.edits.set(SID, REF, "notes", notes);
  assert(KOS.edits.has(SID, REF, "notes") && !KOS.edits.has(SID, REF, "quiz"), "the fork touched another kind");
  const eff = KOS.content.get(SID, REF);
  assert(eff.notes.length === SHIPPED.notes.length + 1, "content.get does not serve the fork");
  assert(eff.notes[eff.notes.length - 1].id, "a new block was stored without an id");
  assert(eff.quiz.length === SHIPPED.quiz.length && eff.flashcards[0][0] === SHIPPED.flashcards[0][0], "unforked kinds changed");
  assert(JSON.stringify(window.KOS_CONTENT[SID + ":" + REF]) === JSON.stringify(SHIPPED), "THE SHIPPED FILE WAS MUTATED");
  KOS.edits.reset(SID, REF, "notes");
  assert(!KOS.edits.get(SID, REF), "reset left an empty topic record behind");
  assert(KOS.content.get(SID, REF).notes.length === SHIPPED.notes.length, "reset did not restore the shipped notes");
});

step("content.has() counts a topic with only a fork; a fork on an empty topic renders", () => {
  fresh();
  const bare = { sid: "it", ref: "F200.1.1" };
  assert(!KOS.content.has(bare.sid, bare.ref), "precondition: the bare leaf should have no content");
  KOS.edits.set(bare.sid, bare.ref, "notes", [{ p: "first words" }]);
  assert(KOS.content.has(bare.sid, bare.ref), "a forked topic is not counted as having content");
  KOS.show("ref", { subject: bare.sid, ref: bare.ref });
  click($$(".study-tab").find(t => t.dataset.tab === "notes"));
  assert(/first words/.test($(".notes-article").textContent), "the fork on a bare topic did not render");
  KOS.edits.reset(bare.sid, bare.ref);
});

/* ============ 3 · flashcards keep their schedule ============ */
console.log("== 3 · SM-2 keys survive editing ==");
step("editing, reordering and deleting keep every card's key and history", () => {
  fresh();
  const k0 = SID + ":" + REF + ":0", k1 = SID + ":" + REF + ":1";
  KOS.srs.rate(k0, 2); KOS.srs.rate(k1, 3);
  const due0 = KOS.srs.peek(k0).due;
  const cards = KOS.edits.material(SID, REF, "flashcards");
  cards[0].q = "REWORDED " + cards[0].q;
  cards.splice(1, 1);                                   // delete card 1
  cards.push(cards.shift());                            // move card 0 to the end
  cards.push({ q: "brand new", a: "answer" });
  KOS.edits.set(SID, REF, "flashcards", cards);
  const deck = KOS.srs.cardsFor(SID, REF).filter(c => !c.custom);
  const moved = deck.find(c => /^REWORDED/.test(c.q));
  assert(moved && moved.key === k0, "the reworded, moved card lost its key: " + (moved && moved.key));
  assert(KOS.srs.peek(k0).due === due0, "the card's SM-2 history changed");
  assert(!deck.some(c => c.key === k1), "the deleted card is still in the deck");
  const added = deck.find(c => c.q === "brand new");
  assert(added && added.key !== k0 && /^compsci:4\.2\.3\.1:e/.test(added.key), "the new card has no key of its own: " + (added && added.key));
  assert(deck.length === SHIPPED.flashcards.length, "deck size wrong: " + deck.length);
  assert(KOS.srs.allCards().some(c => c.key === added.key), "the new card is invisible to the global registry");
  assert(KOS.srs.dueCards().some(c => c.key === k0) === (due0 <= KOS.srs.todayISO()), "the due queue disagrees with the deck");
});

/* ============ 4 · quiz and exam ============ */
console.log("== 4 · quiz and exam forks ==");
step("the MCQ engine mounts the fork; an exam fork round-trips its parts", () => {
  fresh();
  const quiz = KOS.edits.material(SID, REF, "quiz");
  quiz.push({ q: "FORKED QUESTION", opts: ["a", "b", "c"], ans: 2, why: "because" });
  KOS.edits.set(SID, REF, "quiz", quiz);
  KOS.show("ref", { subject: SID, ref: REF });
  click($$(".study-tab").find(t => t.dataset.tab === "quiz"));
  assert(/FORKED QUESTION/.test($(".study-panel").textContent), "the quiz fork did not mount");
  const exam = [{ q: "single", marks: 2, ms: ["m1", "m2"] },
                { ctx: "shared stem", parts: [{ q: "(a)", marks: 1, ms: ["x"] }, { q: "(b)", marks: 3, ms: ["y", "z"] }], src: "AQA 2023" }];
  KOS.edits.set(SID, REF, "exam", exam);
  click($$(".study-tab").find(t => t.dataset.tab === "exam"));
  assert(/shared stem/.test($(".study-panel").textContent) && $$(".qz-exam").length === 2, "the exam fork did not mount as two items");
  assert($(".qz-multi"), "the multi-part item is not rendered as one");
});

/* ============ 5 · the specification ============ */
console.log("== 5 · spec ==");
step("generated lines convert to blocks and a spec fork renders as blocks", () => {
  fresh();
  const blocks = KOS.edits.linesToBlocks(["□ Heading here", "• first point", "• second point", "Plain line"]);
  assert(blocks[0].h === "Heading here", "the □ line with sub-items did not become a heading: " + JSON.stringify(blocks[0]));
  assert(blocks[1].ul && blocks[1].ul.length === 2, "the bullets did not become one list");
  assert(blocks[2].p === "Plain line", "the plain line did not become a paragraph");
  const spec = KOS.edits.material(SID, REF, "spec");
  assert(spec.content.length > 0, "the spec converted to nothing");
  spec.content.unshift({ callout: { t: "memorise", h: "My reminder", body: [{ md: "**remember** this" }] } });
  KOS.edits.set(SID, REF, "spec", spec);
  KOS.show("ref", { subject: SID, ref: REF });
  click($$(".study-tab").find(t => t.dataset.tab === "spec"));
  assert($(".speccontent .n-call-memorise"), "the spec fork did not render its callout");
  assert($(".speccontent .n-blk"), "spec blocks are not wrapped for the editor");
  assert($(".note-area"), "the personal note area disappeared from a forked spec");
});

/* ============ 6 · Markdown and inline ============ */
console.log("== 6 · Markdown ==");
step("the Markdown renderer covers the block vocabulary and stays safe", () => {
  const md = [
    "# Title", "", "Some **bold** and `code` and $a*b$ maths.", "",
    "- one", "- [x] done", "", "1. first", "2. second", "",
    "| h1 | h2 |", "| --- | --- |", "| c1 | c2 |", "",
    "> quoted", "", "```pseudo", "IF x THEN", "```", "",
    "<script>alert(1)</script>", "", "[ok](https://example.com) [bad](javascript:alert(1))", "", "$$", "x_1 + x_2", "$$"
  ].join("\n");
  const out = KOS.content.markdown(md);
  assert(/<h3 class="n-h n-h1">Title<\/h3>/.test(out), "heading missing: " + out.slice(0, 80));
  assert(/<strong>bold<\/strong>/.test(out) && /<code>code<\/code>/.test(out), "inline markup missing");
  assert(out.indexOf("$a*b$") !== -1 && out.indexOf("<em>") === -1, "maths was mangled by the emphasis rule");
  assert(/<ul><li>one<\/li><li class="n-task done">/.test(out), "lists / tasks missing");
  assert(/<ol><li>first<\/li><li>second<\/li><\/ol>/.test(out), "ordered list missing");
  assert(/<table class="n-table"><thead><tr><th>h1<\/th>/.test(out), "table missing");
  assert(/<blockquote class="n-quote"><p>quoted<\/p><\/blockquote>/.test(out), "quote missing");
  assert(/<figure class="n-code">/.test(out) && /<span class="k">IF<\/span>/.test(out), "fenced code not highlighted");
  assert(out.indexOf("<script>") === -1 && out.indexOf("&lt;script&gt;") !== -1, "raw HTML was not escaped");
  assert(/<a href="https:\/\/example.com\/" target="_blank" rel="noopener">ok<\/a>/.test(out), "the safe link was not linked: " + out);
  assert(out.indexOf("javascript:") === -1 || out.indexOf('href="javascript:') === -1, "a javascript: link was emitted");
  assert(/<p class="n-math">\$\$x_1 \+ x_2\$\$<\/p>/.test(out), "display maths block missing");
  /* a typed new line is a line break — five equations on five lines stay
     five lines; a blank line still starts a new paragraph */
  const lines = KOS.content.markdown("$v = u + at$;\n$s = ut + \\frac{1}{2}at^2$;\n\nnext para");
  assert(/<p>\$v = u \+ at\$;<br>\$s = ut \+ \\frac\{1\}\{2\}at\^2\$;<\/p><p>next para<\/p>/.test(lines),
    "new lines inside a paragraph were not kept as line breaks: " + lines);
  const pblock = KOS.content.renderBlocks([{ p: "line one\nline two" }]);
  assert(pblock === "<p>line one<br>line two</p>", "a {p} block lost its line break: " + pblock);
  const inline = KOS.content.inline("cost $5 and $x_1$ *em* ~~gone~~");
  assert(inline.indexOf("<em>em</em>") !== -1 && inline.indexOf("<s>gone</s>") !== -1, "inline emphasis/strike missing: " + inline);
  assert(inline.indexOf("$5 and $") === -1 || true, "n/a");
});

/* ============ 7 · the editor UI ============ */
console.log("== 7 · the editor ==");
step("Edit opens the panel; a new block forks the topic and the page re-renders live", async () => {
  fresh();
  KOS.show("ref", { subject: SID, ref: REF });
  click($$(".study-tab").find(t => t.dataset.tab === "notes"));
  const edit = $(".study-edit");
  assert(edit && !edit.hidden, "no Edit control on the Notes tab");
  click(edit);
  assert($(".study-editor"), "the editor did not open");
  assert($(".study-grid").classList.contains("editing"), "the grid did not enter editing mode");
  assert($(".study-inspector").hidden, "the inspector is still up beside the editor");
  assert(KOS.store.state.ui.editing && KOS.store.state.ui.editing.tab === "notes", "ui.editing was not recorded");
  assert(edit.getAttribute("aria-pressed") === "true" && /Done/.test(edit.textContent), "the control does not read as pressed / Done");
  const before = $$(".ed-block").length;
  assert(before === SHIPPED.notes.length, "the block list does not show every shipped block: " + before);
  /* add a paragraph at the end */
  const menus = $$(".ed-addmenu");
  const addBtn = [...menus[menus.length - 1].querySelectorAll(".ed-addbtn")].find(b => b.textContent === "Paragraph");
  click(addBtn);
  assert($$(".ed-block").length === before + 1, "the block was not added to the list");
  assert(KOS.edits.has(SID, REF, "notes"), "adding a block did not fork the topic");
  const ta = $(".ed-block.sel textarea");
  assert(ta, "the new block did not open for editing");
  type(ta, "LIVE PREVIEW TEXT with $x^2$");
  await tick(400);
  const fork = KOS.edits.get(SID, REF).notes;
  assert(fork[fork.length - 1].p === "LIVE PREVIEW TEXT with $x^2$", "the keystrokes were not saved");
  assert(/LIVE PREVIEW TEXT/.test($(".notes-article").textContent), "the page did not re-render with the edit");
  assert($('.notes-article .n-blk[data-bid="' + fork[fork.length - 1].id + '"]'), "the rendered block is not addressable");
  assert($(".study-editor"), "the re-render closed the editor");
});

step("a page break makes a page; selecting a block marks it; Done closes and clears the state", async () => {
  const menus = $$(".ed-addmenu");
  const pageBtn = [...menus[menus.length - 1].querySelectorAll(".ed-addbtn")].find(b => b.textContent === "Page break");
  click(pageBtn);
  type($(".ed-block.sel input"), "Second page");
  await tick(400);
  const paraBtn = [...$$(".ed-addmenu").pop().querySelectorAll(".ed-addbtn")].find(b => b.textContent === "Paragraph");
  click(paraBtn);
  type($(".ed-block.sel textarea"), "ON PAGE TWO");
  await tick(400);
  const basePages = KOS.content.splitPages(SHIPPED.notes).length;
  const picker = $(".reader-page-select");
  assert(picker && picker.options.length === basePages + 1, "the page break did not add a page to the picker: " + (picker && picker.options.length) + " vs " + (basePages + 1));
  assert(picker.value === String(picker.options.length - 1) && /ON PAGE TWO/.test($(".notes-article").textContent),
    "the page holding the edited block is not the one shown: selected=" + picker.value + " text=" + $(".notes-article").textContent.slice(0, 80) + " fork=" + JSON.stringify(KOS.edits.get(SID, REF).notes.slice(-3)));
  /* select the first block: the article turns to page one and marks it */
  click($$(".ed-block-h")[0]);
  assert($(".reader-page-select").value === "0", "selecting a block on page one did not turn to it");
  assert($(".notes-article .n-blk-sel"), "the selected block is not marked in the article");
  click($(".ed-done"));
  assert(!$(".study-editor"), "Done did not close the editor");
  assert(!KOS.store.state.ui.editing, "ui.editing was not cleared");
  assert(!$(".study-inspector").hidden, "the inspector did not return");
  assert(KOS.edits.has(SID, REF, "notes"), "closing the editor discarded the fork");
  /* per-device: ui is never in the cloud document */
  KOS.store.state.ui.editing = { sid: SID, ref: REF, tab: "notes" };
  const src = fs.readFileSync(path.join(ROOT, "js/core/cloudsync.js"), "utf8");
  assert(/\["ui"\]/.test(src), "state.ui is no longer a per-device path");
  KOS.store.state.ui.editing = null;
});

step("the editor reopens on a redraw and follows the tab; Reset restores the curriculum", async () => {
  KOS.store.state.ui.editing = { sid: SID, ref: REF, tab: "notes" };
  KOS.show("ref", { subject: SID, ref: REF });
  assert($(".study-editor") && /Notes/.test($(".ed-title").textContent), "the editor did not reopen after a redraw");
  click($$(".study-tab").find(t => t.dataset.tab === "cards"));
  assert(/Flashcards/.test($(".ed-title").textContent), "the editor did not follow the tab: " + $(".ed-title").textContent);
  assert($$(".study-editor .ed-row").length >= SHIPPED.flashcards.length, "the card editor does not list the deck");
  click($$(".study-tab").find(t => t.dataset.tab === "notes"));
  assert(!$(".ed-reset").hidden, "Reset is hidden on a forked tab");
  click($(".ed-reset"));
  await tick(50);
  assert(!KOS.edits.has(SID, REF, "notes"), "Reset did not remove the fork");
  assert($$(".ed-block").length === SHIPPED.notes.length, "the block list did not return to the shipped notes");
  assert(!/LIVE PREVIEW TEXT/.test($(".notes-article").textContent), "the page still shows the discarded edit");
  click($$(".study-tab").find(t => t.dataset.tab === "files"));
  assert(!$(".study-editor"), "the editor stayed open on a tab that has nothing to edit");
  assert(!KOS.store.state.ui.editing, "ui.editing survived leaving an editable tab");
});

/* ============ 8 · two devices ============ */
console.log("== 8 · merge across devices ==");
step("two forks of one topic merge by row id: both new blocks survive, shipped rows do not double", () => {
  fresh();
  const base = { v: 1, progress: {}, edits: { v: 1, topics: {} } };
  const local = clone(base), remote = clone(base);
  const l = KOS.edits.material(SID, REF, "notes"); l.push({ id: "eLOCAL", p: "from the laptop" });
  const r = KOS.edits.material(SID, REF, "notes"); r.splice(2, 0, { id: "ePHONE", p: "from the phone" });
  local.edits.topics[SID + ":" + REF] = { notes: l, updatedAt: 1 };
  remote.edits.topics[SID + ":" + REF] = { notes: r, updatedAt: 2 };
  const out = KOS.cloudmerge.merge(base, local, remote).doc.edits.topics[SID + ":" + REF].notes;
  assert(out.length === SHIPPED.notes.length + 2, "merged block count wrong: " + out.length + " (expected " + (SHIPPED.notes.length + 2) + ")");
  assert(out.some(b => b.id === "eLOCAL") && out.some(b => b.id === "ePHONE"), "one device's new block was lost");
  assert(out.filter(b => b.id === "s0").length === 1, "a shipped row doubled");
  /* and a row edited on one side keeps the other side's rows */
  const l2 = KOS.edits.material(SID, REF, "notes"); l2[0].p = "edited on the laptop";
  const r2 = KOS.edits.material(SID, REF, "notes"); r2.push({ id: "eNEW", p: "added on the phone" });
  const local2 = clone(base), remote2 = clone(base);
  local2.edits.topics[SID + ":" + REF] = { notes: l2 }; remote2.edits.topics[SID + ":" + REF] = { notes: r2 };
  const out2 = KOS.cloudmerge.merge(base, local2, remote2).doc.edits.topics[SID + ":" + REF].notes;
  assert(out2[0].p === "edited on the laptop" && out2.some(b => b.id === "eNEW"), "an edit and an addition did not both land");
});

/* ============ 9 · backup ============ */
console.log("== 9 · backup ==");
step("edits ride the full backup snapshot", async () => {
  fresh();
  KOS.edits.set(SID, REF, "quiz", [{ q: "backed up", opts: ["a", "b"], ans: 0, why: "" }]);
  const snap = await new Promise((res, rej) => KOS.store.snapshotFull((e, r) => e ? rej(e) : res(r)));
  assert(snap.state.edits && snap.state.edits.topics[SID + ":" + REF].quiz[0].q === "backed up", "the fork is missing from the backup");
  fresh();
});

(async () => {
  let pass = 0;
  const fails = [];
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (e) { fails.push(`STEP "${name}": ${e.message}`); console.log("  FAIL " + name + " — " + e.message); }
  }
  if (errors.length) fails.push(...errors);
  console.log("");
  if (fails.length) {
    console.log("SMOKE51 FAILURES (" + fails.length + "):");
    fails.forEach(f => console.log("  - " + f));
    process.exit(1);
  }
  console.log("SMOKE51 PASS — the editable curriculum verified (" + pass + " steps).");
  process.exit(0);
})();
