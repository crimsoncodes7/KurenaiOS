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

// 1. CO-03 (mac): Desk side column with a real Daily 20 task crushes Continue card to 41px
console.log('Probing CO-03 & CO-04 on mac...');
out.CO03_CO04_mac = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  // Mark Unit 1 lessons seen so KOS.code.daily20() includes a real task
  KOS.store.state.code = KOS.store.state.code || {};
  KOS.store.state.code.lessons = KOS.store.state.code.lessons || {};
  ["1.1", "1.2", "1.3", "1.4", "1.5"].forEach(r => {
    KOS.store.state.code.lessons[r] = { read: true, ran: true, pages: [0,1,2,3], updatedAt: Date.now() };
  });
  KOS.show("subject", "code");
  await new Promise(r => setTimeout(r, 300));
  const d20 = document.querySelector("[data-ui='code.daily20']");
  const cont = document.querySelector("[data-ui='code.continue']");
  const contKick = cont && cont.querySelector(".k-kicker");
  const co03 = {
    planHasTask: !!(KOS.code && KOS.code.daily20 && KOS.code.daily20().task),
    d20Rect: d20 && d20.getBoundingClientRect().toJSON(),
    contRect: cont && cont.getBoundingClientRect().toJSON(),
    contClientH: cont && cont.clientHeight,
    contScrollH: cont && cont.scrollHeight,
    contOverflow: cont && getComputedStyle(cont).overflow,
    kickerRect: contKick && contKick.getBoundingClientRect().toJSON()
  };

  // CO-04: Check task runner stdin input element and run a 2-line Console.ReadLine() program with 1 line of input
  KOS.show("code", { page: "task", id: "1.3-t1" });
  await new Promise(r => setTimeout(r, 300));
  const stdinEl = document.querySelector("[data-ui='code.task-stdin'], .k-cx-stdin");
  let runRes = null;
  try {
    runRes = await KOS.codeRun.run(
      "using System; class P { static void Main() { int a = int.Parse(Console.ReadLine()); int b = int.Parse(Console.ReadLine()); Console.WriteLine(a + b); } }",
      "10"
    );
  } catch (e) {
    runRes = { err: String(e) };
  }
  const co04 = {
    stdinTag: stdinEl && stdinEl.tagName,
    stdinType: stdinEl && stdinEl.type,
    singleLineRunOnTwoReadLines: runRes
  };
  return { co03, co04 };
})()`, 'mac');

runKos(['shot', SLOT, '#/subject/code', 'mac', 'audit-evidence/2026-11/gemini/shots/CO-03-code-continue-mac.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// 2. CR-01 & CR-02
console.log('Probing CR-01 (mac) and CR-02 (iphone)...');
out.CR01_mac = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const works = KOS.creatives && KOS.creatives.works ? KOS.creatives.works() : [];
  let wid = works[0] && works[0].id;
  let created = false;
  if (!wid && KOS.creatives && KOS.creatives.addWork) {
    const w = KOS.creatives.addWork({ title: "Audit probe sketch", track: "draw" });
    wid = w && w.id;
    created = true;
  }
  KOS.show("creatives", { page: "log", id: wid });
  await new Promise(r => setTimeout(r, 250));
  const dialogsAfterOpen = document.querySelectorAll("[data-ui='cr.dialog'], .k-dialog-overlay").length;
  KOS.rerender();
  await new Promise(r => setTimeout(r, 200));
  const dialogsAfterRerender1 = document.querySelectorAll("[data-ui='cr.dialog']").length;
  KOS.rerender();
  await new Promise(r => setTimeout(r, 200));
  const dialogsAfterRerender2 = document.querySelectorAll("[data-ui='cr.dialog']").length;
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  return {
    workId: wid,
    dialogsAfterOpen,
    dialogsAfterRerender1,
    dialogsAfterRerender2
  };
})()`, 'mac');

out.CR02_iphone = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("subject", "creatives");
  await new Promise(r => setTimeout(r, 250));
  const actions = document.querySelector(".k-pagehead-actions");
  const gear = document.querySelector("[data-ui='cr.settings-open']");
  const focusBtn = document.querySelector("[data-ui='cr.focus']");
  const phoneMore = document.querySelector("[data-ui='shell.phone-more']");
  return {
    actionsDisplay: actions && getComputedStyle(actions).display,
    gearFound: !!gear,
    gearPhoneMoreAttr: gear && gear.getAttribute("data-phone-more"),
    gearRect: gear && gear.getBoundingClientRect().toJSON(),
    focusPhoneMoreAttr: focusBtn && focusBtn.getAttribute("data-phone-more"),
    focusRect: focusBtn && focusBtn.getBoundingClientRect().toJSON(),
    phoneMoreHidden: phoneMore ? phoneMore.hidden : null
  };
})()`, 'iphone');

// 3. DI-03, GO-02, GO-06, GO-07, GO-23, GO-25, HR-02 logic probes
console.log('Probing DI-03, GO-*, HR-02...');
out.dataAndGoals = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());

  // GO-02: Create a media_completed goal starting today and check computed progress
  let go02 = {};
  try {
    const today = KOS.srs.todayISO();
    const g = KOS.goals.add({
      title: "Temp Audit Goal",
      type: "anime-completed",
      target: 3,
      period: "month",
      start: today
    });
    await new Promise(r => setTimeout(r, 350));
    const ev = KOS.goals.evaluate ? KOS.goals.evaluate(g) : (KOS.goals.get && KOS.goals.get(g.id));
    go02 = {
      goalId: g && g.id,
      evaluated: ev ? { cur: ev._cur ?? ev.cur, target: ev.target, status: ev._status ?? ev.status, metAt: ev.metAt } : null
    };
    if (g && g.id) KOS.goals.remove(g.id);
  } catch (e) {
    go02 = { err: String(e) };
  }

  // GO-23: Check if a 0% quiz turns a topic Green in KOS.store.ragOf
  let go23 = {};
  try {
    const testRef = "4.1.1.1";
    const prevProg = JSON.parse(JSON.stringify(KOS.store.getProg("compsci", testRef)));
    const prevRag = KOS.store.state.rag && KOS.store.state.rag["compsci:" + testRef];
    if (KOS.store.state.rag) delete KOS.store.state.rag["compsci:" + testRef];
    KOS.store.setProg("compsci", testRef, { notes: false, cards: false, exam: false, quiz: { done: true, best: 0, attempts: 1, total: 10 } });
    const ragAfterZeroQuiz = KOS.store.ragOf("compsci", testRef);
    KOS.store.setProg("compsci", testRef, prevProg);
    if (prevRag) KOS.store.state.rag["compsci:" + testRef] = prevRag;
    go23 = { ragAfterZeroQuiz };
  } catch (e) {
    go23 = { err: String(e) };
  }

  return { go02, go23 };
})()`, 'mac');

// 4. EX-02, EX-03, EX-28
console.log('Probing EX-02, EX-03 (iphone) and EX-28 (ipad)...');
out.EX02_iphone = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const list = KOS.exams && KOS.exams.all ? KOS.exams.all() : [];
  const ex = list[0];
  if (!ex) return { noExam: true };
  KOS.show("exams", { id: ex.id, tab: "room" });
  await new Promise(r => setTimeout(r, 350));
  const left = document.querySelector(".k-exr-left");
  const bottom = document.querySelector(".k-exr-bottom");
  const firstThing = document.querySelector(".k-exr-thing");
  const firstTick = document.querySelector(".k-exr-tick");
  return {
    examId: ex.id,
    leftRect: left && left.getBoundingClientRect().toJSON(),
    bottomRect: bottom && bottom.getBoundingClientRect().toJSON(),
    firstThingRect: firstThing && firstThing.getBoundingClientRect().toJSON(),
    firstTickRect: firstTick && firstTick.getBoundingClientRect().toJSON(),
    bottomPos: bottom && getComputedStyle(bottom).position
  };
})()`, 'iphone');

runKos(['shot', SLOT, '-', 'iphone', 'audit-evidence/2026-11/gemini/shots/EX-02-exam-room-iphone.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// EX-03: Floating ink palette on iPhone
out.EX03_iphone = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  // Open a worked example write-out or sketch surface with floating ink palette
  KOS.store.state.ui.ink = Object.assign({}, KOS.store.state.ui.ink, { floating: true });
  KOS.show("creatives", { page: "sketch" });
  await new Promise(r => setTimeout(r, 350));
  let bar = document.querySelector(".k-ink-bar, [data-ui*='ink.bar'], .k-ink-palette");
  if (!bar) {
    KOS.show("ref", { subject: "compsci", ref: "4.6.4.1" });
    await new Promise(r => setTimeout(r, 250));
    const sel = document.querySelector(".k-topic-page-select");
    if (sel && sel.options.length > 3) { sel.selectedIndex = 3; sel.dispatchEvent(new Event("change", { bubbles: true })); await new Promise(r => setTimeout(r, 200)); }
    const wo = document.querySelector(".k-n-writeout");
    if (wo) { wo.click(); await new Promise(r => setTimeout(r, 250)); }
    const floatBtn = Array.from(document.querySelectorAll("button")).find(b => /Float/i.test(b.getAttribute("aria-label") || b.title || b.textContent || ""));
    if (floatBtn) { floatBtn.click(); await new Promise(r => setTimeout(r, 150)); }
    bar = document.querySelector(".k-ink-bar, [data-ui*='ink.bar'], .k-ink-palette");
  }
  const undoBtn = bar && Array.from(bar.querySelectorAll("button")).find(b => /Undo/i.test(b.getAttribute("aria-label") || b.title || b.textContent || ""));
  const redoBtn = bar && Array.from(bar.querySelectorAll("button")).find(b => /Redo/i.test(b.getAttribute("aria-label") || b.title || b.textContent || ""));
  return {
    barFound: !!bar,
    barClass: bar && bar.className,
    barRect: bar && bar.getBoundingClientRect().toJSON(),
    undoRect: undoBtn && undoBtn.getBoundingClientRect().toJSON(),
    redoRect: redoBtn && redoBtn.getBoundingClientRect().toJSON()
  };
})()`, 'iphone');

runKos(['shot', SLOT, '-', 'iphone', 'audit-evidence/2026-11/gemini/shots/EX-03-ink-palette-iphone.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// EX-28: Timed paper question navigator on iPad
out.EX28_ipad = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  const list = KOS.exams && KOS.exams.all ? KOS.exams.all() : [];
  const ex = list[0];
  if (ex) {
    KOS.show("exams", { id: ex.id, tab: "paper", sub: "1" });
    await new Promise(r => setTimeout(r, 300));
    const startBtn = document.querySelector("[data-ui='exams.timed-start']");
    if (startBtn) { startBtn.click(); await new Promise(r => setTimeout(r, 300)); }
  }
  const tnav = document.querySelector("[data-ui='exams.tnav']");
  const btns = tnav ? Array.from(tnav.querySelectorAll(".k-ex-tnav-b")) : [];
  return {
    btnCount: btns.length,
    sampleWidths: btns.slice(0, 6).map(b => ({ text: b.textContent, w: Math.round(b.getBoundingClientRect().width * 10) / 10, h: Math.round(b.getBoundingClientRect().height * 10) / 10 }))
  };
})()`, 'ipad');

runKos(['shot', SLOT, '-', 'ipad', 'audit-evidence/2026-11/gemini/shots/EX-28-paper-qnav-ipad.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

// 5. HR-01 & HR-03 on mac and ipad
console.log('Probing HR-01 & HR-03 on mac and ipad...');
out.HR01_mac = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("home");
  await new Promise(r => setTimeout(r, 300));
  const contStrip = document.querySelector(".k-home-subjects, [data-ui='home.subjects']");
  const cards = contStrip ? Array.from(contStrip.children) : [];
  return {
    stripFound: !!contStrip,
    stripClientW: contStrip && contStrip.clientWidth,
    stripScrollW: contStrip && contStrip.scrollWidth,
    parentClass: contStrip && contStrip.parentElement && contStrip.parentElement.className,
    cards: cards.map(c => ({
      text: (c.textContent || "").trim().slice(0, 30),
      rect: c.getBoundingClientRect().toJSON()
    }))
  };
})()`, 'mac');

out.HR03_ipad = evalInSlot(`(async () => {
  document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d => d.remove());
  KOS.show("home");
  await new Promise(r => setTimeout(r, 300));
  const goalPanel = document.querySelector(".k-home-goal, [data-ui='habit.panel']");
  return {
    goalFound: !!goalPanel,
    goalDisplay: goalPanel && getComputedStyle(goalPanel).display,
    goalRect: goalPanel && goalPanel.getBoundingClientRect().toJSON()
  };
})()`, 'ipad');

runKos(['shot', SLOT, '#/home', 'ipad', 'audit-evidence/2026-11/gemini/shots/HR-03-home-ipad.png', '--js', '(()=>{document.querySelectorAll(".k-dialog-overlay, dialog[open]").forEach(d=>d.remove());})()']);

fs.writeFileSync('docs/audit/2026-11/gemini/evidence/batch2-runtime.json', JSON.stringify(out, null, 2));
console.log('Saved docs/audit/2026-11/gemini/evidence/batch2-runtime.json');
