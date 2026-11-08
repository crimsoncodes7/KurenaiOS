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

// 1. Dismiss any open dialogs and test MG-01, AA-02, SY-18
out.logicProbes = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  if (KOS.achievements && KOS.achievements.suppressPopups) KOS.achievements.suppressPopups(true);

  // MG-01: parse -> guess -> previewCSV(parsed, mapping, opts, cb)
  const csvText = "Date,Amount,Merchant/Description\\n2026-11-01,-14.50,Pret A Manger\\n2026-11-02,-42.00,Waterstones";
  const parsed = KOS.money.csv.parse(csvText);
  const guessed = KOS.money.csv.guess(parsed.header);
  const p1 = await new Promise(res => KOS.money.csv.preview(parsed, guessed, {}, (e, r) => res(r)));
  const imp1 = await new Promise(res => KOS.money.csv.import(p1.rows, {}, (e, r) => res(r)));
  const p2SameEmptyPayee = await new Promise(res => KOS.money.csv.preview(parsed, guessed, {}, (e, r) => res(r)));
  const p3MappedPayee = await new Promise(res => KOS.money.csv.preview(parsed, { ...guessed, payee: 2 }, {}, (e, r) => res(r)));
  if (imp1 && imp1.batch) await new Promise(res => KOS.money.undoBatch(imp1.batch, () => res()));

  // AA-02: Assistant thread scrollTop when opening saved/populated conversation
  let aa02 = {};
  try {
    const convs = await new Promise(res => KOS.ai.db.listConversations(res));
    let cid = convs && convs[0] && convs[0].id;
    if (!cid) {
      const c = await new Promise(res => KOS.ai.db.createConversation({ title: "Scroll probe" }, res));
      cid = c.id;
    }
    for (let i = 0; i < 14; i++) {
      await new Promise(res => KOS.ai.db.appendMessage(cid, {
        role: i % 2 === 0 ? "user" : "assistant",
        content: "Message line " + i + " — ".repeat(25) + "end of message."
      }, res));
    }
    await new Promise(res => KOS.assistant.openConversation(cid, res));
    KOS.show("assistant", { tab: "chat" });
    await new Promise(r => setTimeout(r, 250));
    const scroller = document.querySelector(".k-asst-thread");
    aa02 = {
      found: !!scroller,
      scrollTopOnOpen: scroller && scroller.scrollTop,
      scrollHeight: scroller && scroller.scrollHeight,
      clientHeight: scroller && scroller.clientHeight,
      distanceFromBottom: scroller ? (scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight) : null
    };
  } catch (e) {
    aa02 = { err: String(e) };
  }

  return {
    MG01: {
      guessMappingOnCsv: guessed,
      importedCount: imp1 && imp1.added,
      reimportWithSameEmptyPayeeDuplicates: p2SameEmptyPayee.duplicates,
      reimportWithMappedPayeeDuplicates: p3MappedPayee.duplicates,
      reimportWithMappedPayeeNewRows: p3MappedPayee.rows.filter(r => !r.duplicate).length
    },
    AA02: aa02
  };
})()`, 'mac');

// 2. AG-01 on mac
out.AG01_mac = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  KOS.show("governor");
  await new Promise(r => setTimeout(r, 250));
  const menu = document.querySelector("[data-ui='gov.id-access']");
  if (menu) menu.open = true;
  await new Promise(r => setTimeout(r, 100));
  const pop = menu && menu.querySelector(".k-gv-tools-pop");
  const head = document.querySelector(".k-pagehead");
  const stage = document.querySelector(".k-gv-stage");
  const sampleBtn = pop && pop.querySelector("[data-ui='gov.preview-sample']");
  let hitAtSampleCenter = null;
  if (sampleBtn) {
    const r = sampleBtn.getBoundingClientRect();
    const elAtPoint = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    hitAtSampleCenter = elAtPoint ? (elAtPoint.tagName + "." + elAtPoint.className) : null;
  }
  return {
    headState: head && head.getAttribute("data-state"),
    headIsolation: head && getComputedStyle(head).isolation,
    stageIsolation: stage && getComputedStyle(stage).isolation,
    popZIndex: pop && getComputedStyle(pop).zIndex,
    popRect: pop && pop.getBoundingClientRect().toJSON(),
    stageRect: stage && stage.getBoundingClientRect().toJSON(),
    sampleBtnRect: sampleBtn && sampleBtn.getBoundingClientRect().toJSON(),
    elementFromPointAtSampleBtn: hitAtSampleCenter
  };
})()`, 'mac');

runKos(['shot', SLOT, '#/governor', 'mac', 'audit-evidence/2026-11/gemini/shots/AG-01-governor-menu-mac.png', '--js', '(()=>{document.querySelectorAll("dialog[open]").forEach(d=>{d.close();d.remove()}); const m=document.querySelector("[data-ui=\\"gov.id-access\\"]"); if(m) m.open=true;})()']);

// 3. CL-01 on ipad
out.CL01_ipad = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  KOS.show("anime");
  await new Promise(r => setTimeout(r, 250));
  const scroller = document.querySelector(".k-subnav-scroller");
  const nav = document.getElementById("subnav");
  const seg = nav && nav.querySelector(".k-seg");
  const gamesBtn = nav && nav.querySelector("[data-subnav='games']");
  return {
    scrollerState: scroller && scroller.getAttribute("data-state"),
    navClientW: nav && nav.clientWidth,
    navScrollW: nav && nav.scrollWidth,
    segClientW: seg && seg.clientWidth,
    segScrollW: seg && seg.scrollWidth,
    segRect: seg && seg.getBoundingClientRect().toJSON(),
    gamesRect: gamesBtn && gamesBtn.getBoundingClientRect().toJSON()
  };
})()`, 'ipad');

runKos(['shot', SLOT, '#/anime', 'ipad', 'audit-evidence/2026-11/gemini/shots/CL-01-collection-subnav-ipad.png', '--js', 'document.querySelectorAll("dialog[open]").forEach(d=>{d.close();d.remove()});']);

// 4. CO-01 on ipad
out.CO01_ipad = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  KOS.show("subject", "code");
  await new Promise(r => setTimeout(r, 250));
  const sqs = Array.from(document.querySelectorAll("button.k-cx-sq")).slice(0, 4);
  const dias = Array.from(document.querySelectorAll("button.k-cx-dia, span.k-cx-dia")).slice(0, 4);
  return {
    unitButtons: sqs.map(b => ({
      tag: b.tagName,
      className: b.className,
      w: b.offsetWidth,
      h: b.offsetHeight,
      minBlockSize: getComputedStyle(b).minBlockSize
    })),
    capstoneStops: dias.map(d => ({
      tag: d.tagName,
      className: d.className,
      w: d.offsetWidth,
      h: d.offsetHeight,
      bbox: d.getBoundingClientRect().toJSON(),
      transform: getComputedStyle(d).transform
    }))
  };
})()`, 'ipad');

runKos(['shot', SLOT, '#/subject/code', 'ipad', 'audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png', '--js', 'document.querySelectorAll("dialog[open]").forEach(d=>{d.close();d.remove()});']);

// 5. AG-02 on iphone
out.AG02_iphone = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  KOS.show("governor");
  await new Promise(r => setTimeout(r, 250));
  const xp = document.querySelector(".k-gv-xp");
  const arc = document.querySelector(".k-gv-arc");
  const slots = Array.from(document.querySelectorAll(".k-gv-arc-slot"));
  const medals = Array.from(document.querySelectorAll(".k-gv-arc-slot .k-ach-medal"));
  return {
    xpRect: xp && xp.getBoundingClientRect().toJSON(),
    arcRect: arc && arc.getBoundingClientRect().toJSON(),
    arcFlexWrap: arc && getComputedStyle(arc).flexWrap,
    slots: slots.map(s => ({
      empty: s.hasAttribute("data-empty"),
      w: Math.round(s.getBoundingClientRect().width * 10) / 10,
      h: Math.round(s.getBoundingClientRect().height * 10) / 10,
      top: Math.round(s.getBoundingClientRect().top * 10) / 10
    })),
    medals: medals.map(m => ({
      inlineM: m.style.getPropertyValue("--m"),
      w: Math.round(m.getBoundingClientRect().width * 10) / 10,
      h: Math.round(m.getBoundingClientRect().height * 10) / 10,
      top: Math.round(m.getBoundingClientRect().top * 10) / 10,
      bottom: Math.round(m.getBoundingClientRect().bottom * 10) / 10
    }))
  };
})()`, 'iphone');

runKos(['shot', SLOT, '#/governor', 'iphone', 'audit-evidence/2026-11/gemini/shots/AG-02-governor-seat-iphone.png', '--js', 'document.querySelectorAll("dialog[open]").forEach(d=>{d.close();d.remove()});']);

// 6. CO-02 on iphone
out.CO02_iphone = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  KOS.show("subject", "code");
  await new Promise(r => setTimeout(r, 250));
  const side = document.querySelector(".k-subj-side");
  const d20 = document.querySelector("[data-ui='code.daily20']");
  const cont = document.querySelector("[data-ui='code.continue']");
  const btn = document.querySelector("[data-ui='code.daily20-lesson'], [data-ui='code.daily20-start']");
  return {
    sideGrid: side && getComputedStyle(side).gridTemplateColumns,
    d20Rect: d20 && d20.getBoundingClientRect().toJSON(),
    contRect: cont && cont.getBoundingClientRect().toJSON(),
    btnRect: btn && btn.getBoundingClientRect().toJSON(),
    btnScrollW: btn && btn.scrollWidth,
    btnClientW: btn && btn.clientWidth,
    btnText: btn && btn.textContent
  };
})()`, 'iphone');

runKos(['shot', SLOT, '#/subject/code', 'iphone', 'audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png', '--js', 'document.querySelectorAll("dialog[open]").forEach(d=>{d.close();d.remove()});']);

// 7. CC-04 on iphone
out.CC04_iphone = evalInSlot(`(async () => {
  document.querySelectorAll("dialog[open]").forEach(d => { try { d.close(); d.remove(); } catch {} });
  KOS.show("ref", { subject: "compsci", ref: "4.1.1.1" });
  await new Promise(r => setTimeout(r, 300));
  const worked = document.querySelector(".k-n-worked");
  if (worked) worked.scrollIntoView({ block: "center" });
  await new Promise(r => setTimeout(r, 100));
  const head = worked && worked.querySelector(".k-n-worked-head");
  const title = worked && worked.querySelector(".k-n-worked-title");
  const src = worked && worked.querySelector(".k-n-worked-src");
  const writeout = worked && worked.querySelector(".k-n-writeout");
  return {
    workedFound: !!worked,
    headRect: head && head.getBoundingClientRect().toJSON(),
    titleRect: title && title.getBoundingClientRect().toJSON(),
    srcRect: src && src.getBoundingClientRect().toJSON(),
    writeoutRect: writeout && writeout.getBoundingClientRect().toJSON(),
    titleText: title && title.textContent,
    srcText: src && src.textContent
  };
})()`, 'iphone');

runKos(['shot', SLOT, '#/ref/compsci/4.1.1.1', 'iphone', 'audit-evidence/2026-11/gemini/shots/CC-04-worked-overlap-iphone.png', '--js', '(()=>{document.querySelectorAll("dialog[open]").forEach(d=>{d.close();d.remove()}); const w=document.querySelector(".k-n-worked"); if(w) w.scrollIntoView({block:"center"});})()']);

fs.writeFileSync('docs/audit/2026-11/gemini/evidence/batch1-followup.json', JSON.stringify(out, null, 2));
console.log('Saved docs/audit/2026-11/gemini/evidence/batch1-followup.json');
