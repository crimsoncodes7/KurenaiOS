import { execFileSync } from 'child_process';
import fs from 'fs';

const SLOT = '31';
const KOS = 'docs/audit/2026-11/gemini/probes/kos.sh';

function runKos(args) {
  return execFileSync('sh', [KOS, ...args], { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
}

function evalInSlot(expr, size) {
  const args = ['eval', SLOT, expr];
  if (size) args.push('--size', size);
  const out = runKos(args).trim();
  const lines = out.split('\nconsole:\n');
  try {
    return { value: JSON.parse(lines[0]), console: lines[1] || '' };
  } catch {
    return { value: out, console: '' };
  }
}

const results = {};

console.log('Running in-page data & logic probes on slot 31...');
results.inPage = evalInSlot(`(async () => {
  const out = {};

  // JM-06
  try {
    const prev = KOS.ja.ui().spine;
    const firstLeaf = (KOS.hub.LEAVES.ja && KOS.hub.LEAVES.ja[0] && KOS.hub.LEAVES.ja[0].ref) || "1.1";
    KOS.ja.ui().spine = "media";
    let caught = null;
    try {
      const tmp = document.createElement("div");
      KOS.views.ref(tmp, { subject: "ja", ref: firstLeaf });
    } catch (e) {
      caught = String(e && e.stack || e);
    }
    KOS.show("ref", { subject: "ja", ref: firstLeaf });
    const bouncedView = KOS.store.state.ui.view;
    KOS.ja.ui().spine = prev || "core";
    KOS.store.save();
    out.JM06 = { firstLeaf, caught, bouncedView };
  } catch (e) {
    out.JM06 = { err: String(e) };
  }

  // MG-01
  try {
    const csv = "Date,Description,Reference,Amount\\n15/10/2026,TESCO STORES 1234,CARD PAYMENT,-19.99";
    const parsed = KOS.money.csv.parse(csv);
    const p1 = await new Promise(res => KOS.money.csv.preview(parsed.rows, { date: 0, payee: 1, note: 2, amount: 3, fmt: "dmy" }, (err, r) => res(r)));
    const imp = await new Promise(res => KOS.money.csv.import(p1.rows, {}, (err, r) => res(r)));
    const pSame = await new Promise(res => KOS.money.csv.preview(parsed.rows, { date: 0, payee: 1, note: 2, amount: 3, fmt: "dmy" }, (err, r) => res(r)));
    const pDiff = await new Promise(res => KOS.money.csv.preview(parsed.rows, { date: 0, payee: 2, note: 1, amount: 3, fmt: "dmy" }, (err, r) => res(r)));
    await new Promise(res => KOS.money.undoBatch(imp.batch, () => res()));
    out.MG01 = {
      importedAdded: imp.added,
      samePayeeDuplicates: pSame.duplicates,
      diffPayeeDuplicates: pDiff.duplicates,
      sameKey: pSame.rows[0].date + "|" + pSame.rows[0].minor + "|" + pSame.rows[0].payee.toLowerCase(),
      diffKey: pDiff.rows[0].date + "|" + pDiff.rows[0].minor + "|" + pDiff.rows[0].payee.toLowerCase()
    };
  } catch (e) {
    out.MG01 = { err: String(e && e.stack || e) };
  }

  // ST-25
  try {
    const asg = KOS.assignments.add({ title: "Temp ST-25 Assignment", subject: "compsci", due: "2026-12-01" });
    const blob = new Blob(["st25-test-content-" + Date.now()], { type: "text/plain" });
    blob.name = "topic-notes-st25.txt";
    const added = await new Promise(res => KOS.attach.add("compsci", "4.1.1", blob, (err, id, info) => res({ err, id, info }), {
      links: [{ kind: "topic", id: "compsci:4.1.1" }, { kind: "assignment", id: String(asg.id) }]
    }));
    const recBefore = await new Promise(res => KOS.attach.get(added.id, (e, r) => res(r)));
    const listedForAsg = await new Promise(res => KOS.attach.list("compsci", "assignment:" + asg.id, (e, list) => res(list)));
    KOS.assignments.remove(asg.id);
    await new Promise(r => setTimeout(r, 150));
    const recAfter = await new Promise(res => KOS.attach.get(added.id, (e, r) => res(r)));
    out.ST25 = {
      fileId: recBefore && recBefore.fileId,
      linksBefore: recBefore && recBefore.links,
      listedForAsgCount: listedForAsg ? listedForAsg.length : 0,
      existsAfterAssignmentRemove: !!recAfter
    };
  } catch (e) {
    out.ST25 = { err: String(e) };
  }

  // AA-01
  try {
    const toolRes = await new Promise(res => KOS.ai.tools.execute("todo_add_task", { text: "Temp AA-01 task" }, (err, r, undo) => res({ err, r, hasUndo: !!undo, undoLabel: undo && undo.label })));
    if (toolRes.r && toolRes.r.id) KOS.reminders.remove(toolRes.r.id);
    KOS.show("assistant");
    await new Promise(r => setTimeout(r, 100));
    const undoBtns = document.querySelectorAll("[data-ui*='undo']");
    out.AA01 = { toolRes, assistantUndoButtonsInDom: undoBtns.length };
  } catch (e) {
    out.AA01 = { err: String(e) };
  }

  // CC-03 & CM-02
  try {
    const dist = {};
    for (const sid of ["compsci", "maths", "it"]) {
      const counts = [0, 0, 0, 0];
      let total = 0;
      for (const l of (KOS.hub.LEAVES[sid] || [])) {
        const c = KOS.content.get(sid, l.ref);
        for (const q of (c && c.quiz || [])) {
          if (typeof q.ans === "number" && q.ans >= 0 && q.ans < 4) {
            counts[q.ans]++;
            total++;
          }
        }
      }
      dist[sid] = { total, counts, pctAB: total ? +(((counts[0] + counts[1]) / total) * 100).toFixed(1) : 0 };
    }
    out.quizDist = dist;
  } catch (e) {
    out.quizDist = { err: String(e) };
  }

  return out;
})()`, 'mac');

console.log('Probing AG-01 on mac...');
results.AG01_mac = evalInSlot(`(async () => {
  KOS.show("governor");
  await new Promise(r => setTimeout(r, 200));
  const menu = document.querySelector(".k-gov-more, [data-ui='gov.more'], details.k-menu");
  if (menu) menu.open = true;
  await new Promise(r => setTimeout(r, 100));
  const pop = menu && (menu.querySelector(".k-menu-pop, .k-gov-more-pop") || menu.children[1]);
  const stage = document.querySelector(".k-gov-stage, [data-ui='gov.stage']");
  const dataRow = pop && Array.from(pop.querySelectorAll("*")).find(el => /Mine|Sample|Empty/.test(el.textContent || ""));
  return {
    menuFound: !!menu,
    menuTag: menu && menu.tagName,
    menuClass: menu && menu.className,
    stageOverflow: stage && getComputedStyle(stage).overflow,
    stageRect: stage && stage.getBoundingClientRect().toJSON(),
    popRect: pop && pop.getBoundingClientRect().toJSON(),
    dataRowRect: dataRow && dataRow.getBoundingClientRect().toJSON()
  };
})()`, 'mac');
runKos(['shot', SLOT, '#/governor', 'mac', 'audit-evidence/2026-11/gemini/shots/AG-01-governor-menu-mac.png', '--js', 'const m = document.querySelector(".k-gov-more, [data-ui=\\"gov.more\\"], details.k-menu"); if (m) m.open = true;']);

console.log('Probing CL-01 and CO-01 on ipad...');
results.CL01_ipad = evalInSlot(`(async () => {
  KOS.show("anime");
  await new Promise(r => setTimeout(r, 200));
  const nav = document.querySelector("[data-ui='shell.subnav'], .k-secnav");
  const seg = nav && nav.querySelector(".k-seg");
  const gamesBtn = nav && Array.from(nav.querySelectorAll("button, a")).find(b => /Games/i.test(b.textContent || ""));
  return {
    navRect: nav && nav.getBoundingClientRect().toJSON(),
    navScrollW: nav && nav.scrollWidth,
    navClientW: nav && nav.clientWidth,
    segRect: seg && seg.getBoundingClientRect().toJSON(),
    segScrollW: seg && seg.scrollWidth,
    segClientW: seg && seg.clientWidth,
    segOverflowX: seg && getComputedStyle(seg).overflowX,
    gamesRect: gamesBtn && gamesBtn.getBoundingClientRect().toJSON()
  };
})()`, 'ipad');
runKos(['shot', SLOT, '#/anime', 'ipad', 'audit-evidence/2026-11/gemini/shots/CL-01-collection-subnav-ipad.png']);

results.CO01_ipad = evalInSlot(`(async () => {
  KOS.show("code");
  await new Promise(r => setTimeout(r, 200));
  const allBtns = Array.from(document.querySelectorAll(".k-cx-path button, [data-ui*='stage-path'] button"));
  return {
    allBtns: allBtns.slice(0, 8).map(b => ({
      text: b.textContent.trim(),
      className: b.className,
      dataUi: b.getAttribute("data-ui"),
      rect: b.getBoundingClientRect().toJSON(),
      transform: getComputedStyle(b).transform,
      minHeight: getComputedStyle(b).minHeight,
      minWidth: getComputedStyle(b).minWidth
    }))
  };
})()`, 'ipad');
runKos(['shot', SLOT, '#/code', 'ipad', 'audit-evidence/2026-11/gemini/shots/CO-01-code-stagepath-ipad.png']);

console.log('Probing AG-02, AX-01, CC-04, CO-02 on iphone...');
results.AG02_iphone = evalInSlot(`(async () => {
  KOS.show("governor");
  await new Promise(r => setTimeout(r, 250));
  const stage = document.querySelector("[data-ui='gov.stage'], .k-gov-stage");
  const medals = Array.from(document.querySelectorAll(".k-gov-stage .k-ach-medal, .k-gov-stage .k-ach-slot"));
  const xpBar = document.querySelector(".k-gov-stage .k-bar, .k-gov-xp");
  return {
    stageRect: stage && stage.getBoundingClientRect().toJSON(),
    xpBarRect: xpBar && xpBar.getBoundingClientRect().toJSON(),
    medals: medals.map(m => ({
      className: m.className,
      empty: m.hasAttribute("data-empty"),
      rect: m.getBoundingClientRect().toJSON(),
      mVar: getComputedStyle(m).getPropertyValue("--m")
    }))
  };
})()`, 'iphone');
runKos(['shot', SLOT, '#/governor', 'iphone', 'audit-evidence/2026-11/gemini/shots/AG-02-governor-seat-iphone.png']);

results.CO02_iphone = evalInSlot(`(async () => {
  KOS.show("code");
  await new Promise(r => setTimeout(r, 250));
  const side = document.querySelector(".k-subj-side");
  const d20 = document.querySelector("[data-ui='code.daily20']");
  const cont = document.querySelector("[data-ui='study.continue']");
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
runKos(['shot', SLOT, '#/code', 'iphone', 'audit-evidence/2026-11/gemini/shots/CO-02-code-desk-iphone.png']);

results.CC04_iphone = evalInSlot(`(async () => {
  let target = { subject: "compsci", ref: "4.1.1" };
  for (const sid of ["compsci", "maths"]) {
    for (const l of (KOS.hub.LEAVES[sid] || [])) {
      const c = KOS.content.get(sid, l.ref);
      if (c && c.notes && c.notes.some(b => b && b.worked)) {
        target = { subject: sid, ref: l.ref };
        break;
      }
    }
    if (target) break;
  }
  KOS.show("ref", target);
  await new Promise(r => setTimeout(r, 250));
  let found = null;
  for (let p = 0; p < 10; p++) {
    const w = document.querySelector(".k-n-worked");
    if (w) {
      const title = w.querySelector(".k-n-worked-t, .k-n-worked-h, strong, b");
      const btn = w.querySelector(".k-n-writeout, button");
      found = {
        target,
        page: p,
        workedRect: w.getBoundingClientRect().toJSON(),
        titleText: title && title.textContent,
        titleRect: title && title.getBoundingClientRect().toJSON(),
        btnText: btn && btn.textContent,
        btnRect: btn && btn.getBoundingClientRect().toJSON(),
        btnPos: btn && getComputedStyle(btn).position
      };
      break;
    }
    const nextBtn = document.querySelector("[data-ui='study.notes-next']");
    if (!nextBtn || nextBtn.disabled) break;
    nextBtn.click();
    await new Promise(r => setTimeout(r, 100));
  }
  return found;
})()`, 'iphone');
runKos(['shot', SLOT, '-', 'iphone', 'audit-evidence/2026-11/gemini/shots/CC-04-worked-overlap-iphone.png']);

results.AX01_iphone = evalInSlot(`(async () => {
  const views = ["home", "reminders", "money", "anime", "subject"];
  const samples = [];
  for (const v of views) {
    KOS.show(v, v === "subject" ? "compsci" : undefined);
    await new Promise(r => setTimeout(r, 120));
    const controls = Array.from(document.querySelectorAll("input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='file']):not([type='hidden']), select, textarea"));
    for (const c of controls) {
      const fs = parseFloat(getComputedStyle(c).fontSize);
      samples.push({
        view: v,
        tag: c.tagName,
        type: c.type || "",
        className: c.className,
        dataUi: c.getAttribute("data-ui") || "",
        fontSizePx: fs,
        under16: fs < 16
      });
    }
  }
  return {
    totalSampled: samples.length,
    under16Count: samples.filter(s => s.under16).length,
    examples: samples.slice(0, 15)
  };
})()`, 'iphone');

fs.writeFileSync('docs/audit/2026-11/gemini/evidence/batch1-runtime.json', JSON.stringify(results, null, 2));
console.log('Saved docs/audit/2026-11/gemini/evidence/batch1-runtime.json');
