import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const NODE = '/usr/local/n/versions/node/24.18.0/bin/node';
const KOS = 'docs/audit/2026-11/harness/kos.mjs';
const SLOT = '31';

function runKos(args) {
  return execFileSync(NODE, [KOS, ...args], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
}

function evalInSlot(expr, size) {
  const args = ['eval', SLOT, expr];
  if (size) args.push('--size', size);
  const raw = runKos(args);
  const idx = raw.indexOf('\nconsole:\n');
  const jsonPart = idx >= 0 ? raw.slice(0, idx) : raw;
  try {
    return JSON.parse(jsonPart.trim());
  } catch {
    return { raw };
  }
}

const out = {};

out.logic = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());

  // 1. MG-01: CSV with dmy date 14/10/2026
  const csvText = "Date,Amount,Merchant/Description\\n14/10/2026,-14.50,Pret A Manger\\n15/10/2026,-42.00,Waterstones";
  const parsed = KOS.money.csv.parse(csvText);
  const guessed = KOS.money.csv.guess(parsed.header);
  const p1 = await new Promise(res => KOS.money.csv.preview(parsed, guessed, {}, (e, r) => res(r)));
  const imp1 = await new Promise(res => KOS.money.csv.import(p1.rows, {}, (e, r) => res(r)));
  const p2SameEmptyPayee = await new Promise(res => KOS.money.csv.preview(parsed, guessed, {}, (e, r) => res(r)));
  const p3MappedPayee = await new Promise(res => KOS.money.csv.preview(parsed, { ...guessed, payee: 2 }, {}, (e, r) => res(r)));
  if (imp1 && imp1.batch) await new Promise(res => KOS.money.undoBatch(imp1.batch, () => res()));

  // 2. AA-02: Assistant thread scrollTop when opening saved conversation
  let aa02 = {};
  try {
    const db = KOS.aidb || (KOS.ai && KOS.ai.db);
    const c = await new Promise(res => db.createConversation({ title: "Scroll probe" }, (e, r) => res(r || e)));
    const cid = c && c.id;
    for (let i = 0; i < 14; i++) {
      await new Promise(res => db.appendMessage(cid, {
        role: i % 2 === 0 ? "user" : "assistant",
        content: "Message line " + i + " — " + "testing scroll ".repeat(18)
      }, () => res()));
    }
    KOS.show("home");
    await new Promise(r => setTimeout(r, 100));
    KOS.show("assistant", { tab: "chat" });
    await new Promise(r => setTimeout(r, 300));
    const scroller = document.querySelector(".k-asst-thread");
    aa02 = {
      found: !!scroller,
      scrollTopOnOpen: scroller && scroller.scrollTop,
      scrollHeight: scroller && scroller.scrollHeight,
      clientHeight: scroller && scroller.scrollHeight ? scroller.clientHeight : null
    };
  } catch (e) {
    aa02 = { err: String(e) };
  }

  // 3. SY-18: Open study editor on compsci:4.5.4.3 flashcards, simulate remote card added to store.state, then trigger editor input
  let sy18 = {};
  try {
    KOS.show("ref", { subject: "compsci", ref: "4.5.4.3" });
    await new Promise(r => setTimeout(r, 200));
    const host = document.createElement("div");
    document.body.appendChild(host);
    KOS.editor.mount(host, "compsci", "4.5.4.3", "flashcards", () => {});
    const beforeCards = KOS.edits.material("compsci", "4.5.4.3", "flashcards").length;
    // Simulate remote pull adding a card into KOS.store.state while redraw is held
    const remoteCards = KOS.edits.material("compsci", "4.5.4.3", "flashcards").concat([{ id: "remote-card-999", q: "Remote Q", a: "Remote A" }]);
    KOS.edits.set("compsci", "4.5.4.3", "flashcards", remoteCards);
    const afterPullHasRemote = KOS.edits.material("compsci", "4.5.4.3", "flashcards").some(c => c.id === "remote-card-999");
    // Now user types a single character into the already-open editor's first textarea/input
    const inp = host.querySelector("textarea, input");
    if (inp) {
      inp.value = inp.value + " ";
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const afterLocalKeystrokeHasRemote = KOS.edits.material("compsci", "4.5.4.3", "flashcards").some(c => c.id === "remote-card-999");
    host.remove();
    KOS.edits.reset("compsci", "4.5.4.3", "flashcards");
    sy18 = {
      beforeCards,
      afterPullHasRemote,
      afterLocalKeystrokeHasRemote
    };
  } catch (e) {
    sy18 = { err: String(e) };
  }

  return {
    MG01: {
      guessMappingOnCsv: guessed,
      importedCount: imp1 && imp1.added,
      reimportWithSameEmptyPayeeDuplicates: p2SameEmptyPayee.duplicates,
      reimportWithMappedPayeeDuplicates: p3MappedPayee.duplicates,
      reimportWithMappedPayeeNewRows: p3MappedPayee.rows.filter(r => !r.duplicate).length
    },
    AA02: aa02,
    SY18: sy18
  };
})()`, 'mac');

// Re-take clean screenshots without .k-dialog-overlay
runKos(['shot', SLOT, '#/governor', 'mac', 'audit-evidence/2026-11/gemini/shots/AG-01-governor-menu-mac.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove()); const m=document.querySelector("[data-ui=\\"gov.id-access\\"]"); if(m) m.open=true;})()']);
runKos(['shot', SLOT, '#/anime', 'ipad', 'audit-evidence/2026-11/gemini/shots/CL-01-collection-subnav-ipad.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);
runKos(['shot', SLOT, '#/subject/code', 'ipad', 'audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// Equip 3 showcase medals for AG-02 on iphone, measure and shoot
out.AG02_equipped = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const prev = (KOS.store.state.achievements && KOS.store.state.achievements.showcase || []).slice();
  KOS.achievements.setShowcase(["streak_3", "sessions_10", "cards_50"]);
  KOS.show("governor");
  await new Promise(r => setTimeout(r, 300));
  const xp = document.querySelector(".k-gv-xp");
  const slots = Array.from(document.querySelectorAll(".k-gv-arc-slot"));
  const medals = Array.from(document.querySelectorAll(".k-gv-arc-slot .k-ach-medal"));
  return {
    prevShowcase: prev,
    xpRect: xp && xp.getBoundingClientRect().toJSON(),
    slots: slots.map(s => ({
      empty: s.hasAttribute("data-empty"),
      w: Math.round(s.getBoundingClientRect().width * 10) / 10,
      h: Math.round(s.getBoundingClientRect().height * 10) / 10,
      x: Math.round(s.getBoundingClientRect().x * 10) / 10,
      y: Math.round(s.getBoundingClientRect().y * 10) / 10
    })),
    medals: medals.map(m => ({
      inlineM: m.style.getPropertyValue("--m"),
      w: Math.round(m.getBoundingClientRect().width * 10) / 10,
      h: Math.round(m.getBoundingClientRect().height * 10) / 10,
      x: Math.round(m.getBoundingClientRect().x * 10) / 10,
      y: Math.round(m.getBoundingClientRect().y * 10) / 10
    }))
  };
})()`, 'iphone');

runKos(['shot', SLOT, '#/governor', 'iphone', 'audit-evidence/2026-11/gemini/shots/AG-02-governor-seat-iphone.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// CO-02 on iphone with a touched Code lesson so Daily 20 + Continue render side by side
out.CO02_active = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.store.state.code = KOS.store.state.code || {};
  KOS.store.state.code.lessons = KOS.store.state.code.lessons || {};
  const had11 = KOS.store.state.code.lessons["1.1"];
  KOS.store.state.code.lessons["1.1"] = { seen: true, updatedAt: Date.now() };
  KOS.show("subject", "code");
  await new Promise(r => setTimeout(r, 250));
  const side = document.querySelector(".k-subj-side");
  const d20 = document.querySelector("[data-ui='code.daily20']");
  const cont = document.querySelector("[data-ui='code.continue']");
  const btn = document.querySelector("[data-ui='code.daily20-lesson'], [data-ui='code.daily20-start']");
  const res = {
    sideGrid: side && getComputedStyle(side).gridTemplateColumns,
    d20Rect: d20 && d20.getBoundingClientRect().toJSON(),
    contRect: cont && cont.getBoundingClientRect().toJSON(),
    btnRect: btn && btn.getBoundingClientRect().toJSON(),
    btnScrollW: btn && btn.scrollWidth,
    btnClientW: btn && btn.clientWidth,
    btnText: btn && btn.textContent
  };
  return res;
})()`, 'iphone');

runKos(['shot', SLOT, '#/subject/code', 'iphone', 'audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// CC-04 on iphone: find a topic page/subpage with .k-n-writeout
out.CC04_active = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("ref", { subject: "compsci", ref: "4.6.4.1" });
  await new Promise(r => setTimeout(r, 250));
  // Click page 4 in topic reader if present
  const pageBtns = Array.from(document.querySelectorAll("[data-ui='study.topic-page'], .k-topic-page-btn, .k-topic-pager button"));
  for (let i = 0; i < 6; i++) {
    if (document.querySelector(".k-n-writeout")) break;
    const nextBtn = Array.from(document.querySelectorAll("button")).find(b => /Next page|→/i.test(b.textContent || "") || b.getAttribute("data-ui") === "study.page-next");
    if (nextBtn) { nextBtn.click(); await new Promise(r => setTimeout(r, 150)); }
  }
  const writeout = document.querySelector(".k-n-writeout");
  const worked = writeout && writeout.closest(".k-n-worked");
  if (worked) worked.scrollIntoView({ block: "center" });
  await new Promise(r => setTimeout(r, 100));
  const title = worked && worked.querySelector(".k-n-worked-title");
  const src = worked && worked.querySelector(".k-n-worked-src");
  return {
    found: !!writeout,
    titleText: title && title.textContent,
    titleRect: title && title.getBoundingClientRect().toJSON(),
    srcRect: src && src.getBoundingClientRect().toJSON(),
    writeoutRect: writeout && writeout.getBoundingClientRect().toJSON()
  };
})()`, 'iphone');

runKos(['shot', SLOT, '-', 'iphone', 'audit-evidence/2026-11/gemini/shots/CC-04-worked-overlap-iphone.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove()); const w=document.querySelector(".k-n-writeout"); if(w) w.closest(".k-n-worked").scrollIntoView({block:"center"});})()']);

fs.writeFileSync('docs/audit/2026-11/gemini/evidence/batch1-clean.json', JSON.stringify(out, null, 2));
console.log('Saved docs/audit/2026-11/gemini/evidence/batch1-clean.json');
