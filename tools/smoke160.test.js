/* Kurenai OS — smoke160.test.js
   Every notes page draws (17 November 2026). The F201 notes of
   kos-integrity-14 wrote 29 callouts with ONE block as their body
   (`body: {ul: […]}`) where every reader takes a string or a list; the
   renderer threw on 15 pages, so the page stayed as it was when "Next
   page" was pressed, and a topic that remembered such a page drew no notes.

     A · every page of every topic's shipped notes renders: no throw, and
         something drawn.
     B · a body written as one block is that block (the renderer never
         fails over a notes shape), and a string or a list as before.
     C · no shipped callout has one block as its body, and the validator
         refuses one.
     D · in the app: every IT topic's notes step from the first page to the
         last with "Next page", each page saying where it is; a remembered
         page opens; nothing is thrown.

   Run: node tools/smoke160.test.js */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, C;
const withNotes = () => Object.keys(C).filter((k) => C[k] && Array.isArray(C[k].notes) && C[k].notes.length);

step("boot", async () => {
  app = await boot();
  K = app.KOS; C = app.window.KOS_CONTENT;
  await app.settle();
  assert(!app.errors.filter((e) => /LOAD FAIL/.test(e)).length, "scripts load");
});

step("A · every page of every topic's notes renders", async () => {
  const bad = [];
  let pages = 0;
  const keys = withNotes();
  keys.forEach((k) => {
    let ps;
    try { ps = K.content.splitPages(C[k].notes); } catch (e) { bad.push(k + ": " + e.message); return; }
    ps.forEach((p, i) => {
      pages++;
      try { if (!K.content.renderBlocks(p.blocks)) bad.push(k + " p" + (i + 1) + ": nothing drawn"); }
      catch (e) { bad.push(k + " p" + (i + 1) + ": " + e.message); }
    });
  });
  assert(keys.length > 400 && pages > 2500, "the whole curriculum was walked: " + keys.length + " topics, " + pages + " pages");
  eq(bad.slice(0, 8), [], bad.length + " page(s) do not draw");
});

step("B · a body written as one block is that block", async () => {
  const R = K.content.renderBlocks;
  const one = R([{ callout: { t: "warn", h: "Pairs", body: { ul: ["alpha", "beta"] } } }]);
  const list = R([{ callout: { t: "warn", h: "Pairs", body: [{ ul: ["alpha", "beta"] }] } }]);
  eq(one, list, "one block draws as a list of one");
  assert(/alpha/.test(one) && /beta/.test(one) && /<li/.test(one), "and its items are there");
  assert(/just words/.test(R([{ callout: { t: "tip", body: "just words" } }])), "a string body as before");
  eq(R(null), "", "nothing is nothing");
  assert(/<li/.test(R({ ul: ["x"] })), "a single block handed to the renderer is drawn");
});

step("C · no shipped callout has one block as its body, and the validator refuses one", async () => {
  const odd = [];
  withNotes().forEach((k) => {
    (function walk(bs) {
      (Array.isArray(bs) ? bs : []).forEach((b) => {
        if (!b || !b.callout) return;
        const body = b.callout.body;
        if (body != null && typeof body !== "string" && !Array.isArray(body)) odd.push(k + " · " + (b.callout.h || b.callout.t));
        walk(body);
      });
    })(C[k].notes);
  });
  eq(odd, [], "every callout body is a string or a list");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kos-smoke160-"));
  const file = path.join(dir, "bad.js");
  fs.writeFileSync(file, 'window.KOS_CONTENT = window.KOS_CONTENT || {};\nwindow.KOS_CONTENT["it:F201.9.9"] = { notes: [{ h: "A page" }, { callout: { t: "warn", h: "Pairs", body: { ul: ["a", "b"] } } }] };\n');
  const run = spawnSync(process.execPath, [path.join(__dirname, "validate_content.js"), file], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  assert(/has one block as its body/.test(run.stdout + run.stderr), "the validator names it: " + (run.stdout + run.stderr).slice(0, 300));
  assert(run.status !== 0, "and fails the file");
});

step("D · in the app: every IT topic's notes step to their last page", async () => {
  const d = app.document, before = app.errors.length;
  const refs = withNotes().filter((k) => k.indexOf("it:") === 0).map((k) => k.slice(3));
  assert(refs.filter((r) => /^F201\./.test(r)).length >= 15, "the F201 topics are there");
  let walked = 0;
  const bad = [];
  for (const ref of refs) {
    K.show("ref", { subject: "it", ref });
    await app.settle();
    const tab = Array.from(d.querySelectorAll("#main [role=tab]")).find((t) => /^Notes/.test(t.textContent.trim()));
    if (!tab) continue;   // a unit not on the spine (not taken) has no page
    if (tab.getAttribute("aria-selected") !== "true") { tab.click(); await app.settle(); }
    const sel = d.querySelector('[data-ui="topic.reader-page-select"]');
    const n = sel ? sel.options.length : 1;
    for (let i = 1; i < n; i++) {
      const next = d.querySelector('[data-ui="topic.page"][data-state="next"]');
      if (!next) { bad.push(ref + " p" + (i + 1) + ": no Next page"); break; }
      next.click();
      const said = (d.querySelector('[data-ui="topic.note-count"]') || {}).textContent;
      if (said !== "Page " + (i + 1) + " of " + n) { bad.push(ref + " p" + (i + 1) + ": the page says " + said); break; }
      if ((d.querySelector('[data-ui~="topic.notes"]') || { textContent: "" }).textContent.trim().length < 40) bad.push(ref + " p" + (i + 1) + ": an empty page");
    }
    walked += n;
    /* the last page is remembered: coming back opens on it, drawn */
    if (n > 1) {
      K.show("ref", { subject: "it", ref });
      await app.settle();
      const back = (d.querySelector('[data-ui="topic.note-count"]') || {}).textContent;
      if (back && back !== "Page " + n + " of " + n) bad.push(ref + ": came back to " + back);
    }
  }
  eq(bad.slice(0, 8), [], bad.length + " step(s) failed");
  assert(walked > 200, "the IT notes were walked: " + walked + " pages");
  eq(app.errors.slice(before), [], "nothing was thrown");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke160: " + failed + " failed" : "smoke160: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
