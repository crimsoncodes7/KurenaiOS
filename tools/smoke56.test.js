/* Kurenai OS — smoke56.test.js
   UI rebuild M2: render purity and action-dispatch parity.

   The presentation rebuild rewrites every view's markup. This suite is the
   proof that it rewrites ONLY markup: that no rebuilt view reads or writes
   data differently, and that every control does what it did before.

   It boots the app deterministically (tools/lib/app-harness.js: fixed
   clock, seeded ids, no background tickers), seeds a used account
   (tools/lib/seed.js), then for every surface — each view, with the args
   that select a genuinely different page — it:

     1. renders the surface twice from the same snapshot, and diffs the store
        (outside state.ui, which KOS.show and per-device preferences own)
        and the media database across each render;
     2. dispatches a click on every control the surface renders, one at a
        time, each from a freshly restored snapshot, and records what the
        click DID: the route it navigated to, the dialog or menu it opened,
        the store paths and media records it wrote, the announcement and
        toast it made, the requests it sent and the errors it raised.

   A control is identified by its own data-ui hooks and its accessible name
   (tools/lib/ui-query.js), never by a class or its position in the tree.

   The baseline in tools/baselines/render-purity.json was recorded from the
   M1 tree, where every view still rendered its legacy markup, BEFORE the
   stylesheet was deleted. Every run compares against it:

     - every recorded control must still exist (hooks may be added, never
       lost) and produce the same effects;
     - a surface may not write anything on render that it did not write in
       the baseline, a second render must write nothing, and the Governor
       ledger (sessions, XP, gold, HP) is never written by a render;
     - a view listed in tools/ui-migration.json "views" (rebuilt) must
       render with ZERO data writes outside state.ui (view-contracts §0.2.3).

     node tools/smoke56.test.js              compare with the baseline
     node tools/smoke56.test.js --record     re-record it (a deliberate act:
                                             say why in the commit)       */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, CLOCK } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");
const { accessibleName, CONTROL } = require("./lib/ui-query");

const BASELINE = path.join(__dirname, "baselines", "render-purity.json");
/* Deliberate renames. A rebuilt control may change its accessible name only
   by a rule here, each with the milestone and the reason; the baseline key
   is rewritten before the control is looked up, and its effects must still
   match exactly. A rule selects controls by `surface` (an anchored
   pattern over surface ids), `hooks`, `from` (the name) and `navTo` (a
   pattern over the recorded navigation).

   A rule with `"retire": true` excuses a control's ABSENCE, never a change
   in what it does: the approved design dropped it (a capped list, a panel
   the design folds elsewhere). With `"reachable": true` as well, some
   control still on that surface must produce exactly its recorded effects;
   `via` names the root to look in when that control lives outside the
   replayed regions (the spine's subject switch, in #tree).

   `whenDialog` narrows a rule to controls whose recorded effect opened a
   dialog of that (pattern) name. `rewriteEffects` ({effect: [pattern,
   replacement]}) renames an effect value on BOTH sides — a dialog renamed
   with the design, or a field write folded into its record.
   `dropEffects` ({effect: pattern}) takes named side effects out of the
   contract on BOTH sides of the comparison (a spine the desk no longer
   draws writes openSections at a different depth, or not at all); `expect` replaces the recorded effects outright where a
   control deliberately does something else now (an inline form became a
   dialog). Both carry their `why` like every other rule. */
const RENAMES_FILE = path.join(__dirname, "baselines", "render-purity.renames.json");
const MIGRATION = path.join(__dirname, "ui-migration.json");
const RECORD = process.argv.includes("--record");

/* every view, with the args that select a different page */
const SURFACES = [
  ["home"],
  ["subject", "compsci"], ["subject", "maths"], ["subject", "it"],
  ["ref", { subject: "compsci", ref: "4.2.3.1" }],
  ["ref", { subject: "maths", ref: "5.7" }],
  ["ref", { subject: "it", ref: "F200.1.1" }],
  ["review"], ["due"], ["cardstats"], ["personaldeck"], ["assignments"], ["tracker"],
  ["focus"], ["reminders"], ["tasks"], ["calendar"], ["pacing"], ["pacing", { tab: "braid" }],
  ["matrix"], ["anime"], ["seasonal"], ["books"], ["mangaka"], ["vn"], ["game"],
  ["shrine"], ["wishlist"], ["goals"], ["mediasync"], ["aniprofile"], ["vndbprofile"],
  ["governor"], ["assistant"], ["notifications"], ["data"], ["help"],
  ["sims"], ["worked"], ["trace"], ["oop"]
];
/* regions whose controls belong to the surface; the shell's own chrome is
   one extra surface (#topbar, #rail) rendered on Home */
const REGIONS = ["#subnav", "#page-actions", "#main"];
const SHELL_REGIONS = ["#topbar", "#rail"];
/* Back/Forward replay the router's history stack, which one control's
   navigation leaves for the next; router.js owns them and smoke45 covers
   them, so they are not replayed here */
const HISTORY = ["nav-back", "nav-fwd"];
/* the Governor ledger — a render must never touch it (invariant 1) */
const LEDGER = /^(sessions|governor\.(xp|gold|hp|log|history))/;

const failures = [];
const fail = (msg) => failures.push(msg);

/* ---------------- snapshots and diffs ---------------- */
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function stateOf(KOS) {
  const s = clone(KOS.store.state);
  const ui = s.ui; delete s.ui;
  return { data: s, ui };
}
function normKey(k) { return String(k).replace(/\d{10,}/g, "<ts>"); }
/* the changed paths between two JSON values: object keys to depth 4,
   arrays collapsed to key[] */
function diffPaths(a, b, pre = "", depth = 0, out = []) {
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  if (Array.isArray(a) || Array.isArray(b)) { out.push(pre + "[]"); return out; }
  if (!isObj(a) || !isObj(b) || depth >= 4) { out.push(pre || "(root)"); return out; }
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  for (const k of keys) diffPaths(a[k], b[k], (pre ? pre + "." : "") + normKey(k), depth + 1, out);
  return out;
}
function uniq(a) { return [...new Set(a)].sort(); }

function mediaOf(KOS) {
  return new Promise((r) => KOS.mediadb.exportAll((e, d) => r(d ? clone(d) : { entries: [], kv: [] })));
}
function mediaDiff(a, b) {
  const out = [];
  const byId = (list) => new Map(list.map((e) => [e.id, e]));
  const A = byId(a.entries), B = byId(b.entries);
  for (const [id, e] of B) {
    if (!A.has(id)) out.push("entry+" + e.module);
    else {
      const f = diffPaths(A.get(id), e).map((p) => p.split(".")[0]);
      if (f.length) out.push("entry~" + uniq(f).join(","));
    }
  }
  for (const [id, e] of A) if (!B.has(id)) out.push("entry-" + e.module);
  const K = (list) => new Map(list.map((x) => [x.key, JSON.stringify(x.value)]));
  const KA = K(a.kv), KB = K(b.kv);
  for (const [k, v] of KB) if (KA.get(k) !== v) out.push("kv:" + normKey(k).replace(/\.\d+$/, ".#"));
  for (const k of KA.keys()) if (!KB.has(k)) out.push("kv-:" + normKey(k));
  return uniq(out);
}

/* ---------------- the app ---------------- */
async function main() {
  const app = await boot();
  const { window, document, KOS } = app;
  await seedAccount(app);

  const show = KOS.show;                               /* the harness navigates with the real one */
  const announced = [];
  const realAnnounce = KOS.a11y.announce;
  KOS.a11y.announce = function (msg) { announced.push(String(msg)); return realAnnounce.apply(this, arguments); };

  const SNAP = { state: clone(KOS.store.state), media: await mediaOf(KOS) };
  async function restore(mediaDirty) {
    const s = KOS.store.state;
    Object.keys(s).forEach((k) => delete s[k]);
    Object.assign(s, clone(SNAP.state));
    KOS.store.flush();
    if (mediaDirty) await new Promise((r) => KOS.mediadb.importAll(clone(SNAP.media), () => r()));
  }
  function closeOverlays() {
    for (let i = 0; i < 6; i++) {
      const open = document.querySelector('[aria-modal="true"]');
      if (!open) break;
      open.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    }
    document.querySelectorAll('[aria-modal="true"]').forEach((n) => {
      const ov = n.closest('[data-ui~="ui.dialog-overlay"]') || n;
      ov.remove();
    });
    document.documentElement.removeAttribute("data-scroll-lock");
  }
  const dialogs = () => [...document.querySelectorAll('[aria-modal="true"], [role="dialog"], [role="alertdialog"]')];
  const menus = () => [...document.querySelectorAll('[data-ui~="ui.menu-panel"]')].filter((m) => !m.hidden);
  const errCount = () => app.errors.length + app.consoleErrors.length;
  const newErrors = (n) => app.errors.concat(app.consoleErrors).slice(n).map((e) => String(e).slice(0, 160));

  function controlsIn(selectors) {
    const seen = new Set();
    const out = [];
    for (const sel of selectors) {
      const root = document.querySelector(sel);
      if (!root) continue;
      for (const node of root.querySelectorAll(CONTROL + ', input[type="checkbox"], input[type="radio"], summary')) {
        if (node.disabled || node.closest("[hidden]") || node.closest("[inert]")) continue;
        if (HISTORY.includes(node.id)) continue;
        const href = node.getAttribute("href");
        if (node.tagName === "A" && href && !href.startsWith("#")) continue;   /* leaves the app */
        const key = keyOf(node);
        const id = key.ctx + ">" + key.hooks + "|" + key.name;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({ node, key });
      }
    }
    return out;
  }
  function hooksOf(node) {
    return (node.getAttribute("data-ui") || "").split(/\s+/).filter(Boolean).sort();
  }
  function keyOf(node) {
    const anc = node.parentElement && node.parentElement.closest("[data-ui]");
    const name = accessibleName(node).replace(/\s+/g, " ").trim().slice(0, 80);
    return { ctx: anc ? hooksOf(anc)[0] : "", hooks: hooksOf(node).join(" "), name, tag: node.tagName.toLowerCase() };
  }
  /* find a recorded control in the current DOM: same accessible name, its
     recorded hooks still present (more are fine), the same context when
     several match, else the same occurrence among them */
  function findControl(selectors, key, occurrence) {
    const want = key.hooks ? key.hooks.split(" ") : [];
    const cands = [];
    for (const sel of selectors) {
      const root = document.querySelector(sel);
      if (!root) continue;
      for (const node of root.querySelectorAll(CONTROL + ', input[type="checkbox"], input[type="radio"], summary')) {
        if (node.disabled || node.closest("[hidden]") || node.closest("[inert]")) continue;
        const k = keyOf(node);
        if (k.name !== key.name) continue;
        const have = hooksOf(node);
        if (!want.every((h) => have.includes(h))) continue;
        cands.push({ node, k });
      }
    }
    const same = cands.filter((c) => c.k.ctx === key.ctx);
    return (same[0] || cands[occurrence] || cands[0] || {}).node || null;
  }

  async function render(view, arg) {
    closeOverlays();
    show(view, arg);
    await app.settle();
  }

  async function effectsOf(view, arg, selectors, key, occurrence) {
    await restore(true);
    await render(view, arg);
    const node = findControl(selectors, key, occurrence);
    if (!node) return null;
    const before = { st: stateOf(KOS), media: await mediaOf(KOS), hash: window.location.hash,
      dialogs: dialogs().length, menus: menus().length, ann: announced.length,
      toast: (document.getElementById("toast") || {}).textContent || "", err: errCount(), fetch: app.fetches.length };
    node.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
    await app.settle();
    const after = stateOf(KOS);
    const media = await mediaOf(KOS);
    const toast = (document.getElementById("toast") || {}).textContent || "";
    const eff = {};
    if (window.location.hash !== before.hash) eff.nav = window.location.hash;
    const opened = dialogs().slice(before.dialogs);
    if (opened.length) eff.dialog = opened.map((d) => accessibleName(d).replace(/\s+/g, " ").slice(0, 60));
    if (menus().length > before.menus) eff.menu = true;
    const sp = uniq(diffPaths(before.st.data, after.data));
    if (sp.length) eff.state = sp;
    const up = uniq(diffPaths(before.st.ui, after.ui)).filter((p) => p !== "view" && !/^lastView/.test(p));
    if (up.length) eff.ui = up;
    const md = mediaDiff(before.media, media);
    if (md.length) eff.media = md;
    if (announced.length > before.ann) eff.announce = announced.slice(before.ann).map((t) => t.slice(0, 80));
    if (toast && toast !== before.toast) eff.toast = toast.slice(0, 80);
    if (app.fetches.length > before.fetch) eff.fetch = uniq(app.fetches.slice(before.fetch));
    if (errCount() > before.err) eff.errors = newErrors(before.err);
    closeOverlays();
    return eff;
  }

  /* ---------------- run ---------------- */
  const migration = fs.existsSync(MIGRATION) ? JSON.parse(fs.readFileSync(MIGRATION, "utf8")) : {};
  const migrated = new Set(Object.keys(migration.views || {}));
  const baseline = RECORD ? null : JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  const renames = fs.existsSync(RENAMES_FILE) ? JSON.parse(fs.readFileSync(RENAMES_FILE, "utf8")).rules : [];
  function applies(r, c, surfId) {
    if (r.surface && !new RegExp("^(?:" + r.surface + ")$").test(surfId)) return false;
    if (r.navTo && !(c.effects && c.effects.nav && new RegExp(r.navTo).test(c.effects.nav))) return false;
    if (r.whenDialog && !(c.effects && c.effects.dialog && c.effects.dialog.some((d) => new RegExp(r.whenDialog).test(d)))) return false;
    return !(r.hooks && !c.key.hooks.split(" ").includes(r.hooks));
  }
  function renamed(c, surfId) {
    for (const r of renames) {
      if (r.retire || r.to == null || !applies(r, c, surfId)) continue;
      const re = new RegExp(r.from);
      if (re.test(c.key.name)) return Object.assign({}, c, { key: Object.assign({}, c.key, { name: c.key.name.replace(re, r.to) }) });
    }
    return c;
  }
  /* the effects a control is held to, after the deliberate changes that
     apply to it; `drop` is applied to whatever it is compared with too */
  function without(eff, drops) {
    if (!eff || !drops.length) return eff;
    const out = JSON.parse(JSON.stringify(eff));
    for (const [k, re] of drops) {
      if (!Array.isArray(out[k])) continue;
      out[k] = out[k].filter((x) => !re.test(x));
      if (!out[k].length) delete out[k];
    }
    return out;
  }
  function rewrite(eff, rewrites) {
    if (!eff || !rewrites.length) return eff;
    const out = JSON.parse(JSON.stringify(eff));
    for (const [k, re, to] of rewrites) if (Array.isArray(out[k])) out[k] = uniq(out[k].map((x) => x.replace(re, to)));
    return out;
  }
  function contract(c, surfId) {
    let eff = c.effects;
    const drops = [], rewrites = [];
    for (const r of renames) {
      if (!(r.dropEffects || r.expect || r.rewriteEffects) || !applies(r, c, surfId)) continue;
      if (r.from && !new RegExp(r.from).test(c.key.name)) continue;
      if (r.expect) { eff = r.expect; continue; }
      if (r.rewriteEffects) {
        for (const k of Object.keys(r.rewriteEffects)) rewrites.push([k, new RegExp(r.rewriteEffects[k][0]), r.rewriteEffects[k][1]]);
        continue;
      }
      for (const k of Object.keys(r.dropEffects)) drops.push([k, new RegExp(r.dropEffects[k])]);
    }
    return { eff: without(rewrite(eff, rewrites), drops), drops, rewrites };
  }
  const record = { recordedFrom: null, clock: null, surfaces: {} };

  const all = SURFACES.map((s) => ({ id: s[0] + (s[1] == null ? "" : ":" + JSON.stringify(s[1])), view: s[0], arg: s[1], regions: REGIONS }))
    .concat([{ id: "shell", view: "home", arg: undefined, regions: SHELL_REGIONS }]);

  let actions = 0;
  for (const surf of all) {
    const out = { render: {}, controls: [] };
    /* 1 · render purity */
    await restore(true);
    const e0 = errCount();
    const s0 = stateOf(KOS), m0 = await mediaOf(KOS);
    await render(surf.view, surf.arg);
    const s1 = stateOf(KOS), m1 = await mediaOf(KOS);
    await render(surf.view, surf.arg);
    const s2 = stateOf(KOS), m2 = await mediaOf(KOS);
    out.render.first = uniq(diffPaths(s0.data, s1.data)).concat(mediaDiff(m0, m1));
    out.render.second = uniq(diffPaths(s1.data, s2.data)).concat(mediaDiff(m1, m2));
    out.render.errors = newErrors(e0);
    if (!document.querySelector("#main").children.length) fail(`${surf.id}: rendered nothing into #main`);

    /* 2 · every control, from a fresh snapshot */
    const list = controlsIn(surf.regions);
    const occ = {};
    for (const { key } of list) {
      const o = occ[key.hooks + "|" + key.name] = (occ[key.hooks + "|" + key.name] || 0);
      occ[key.hooks + "|" + key.name]++;
      if (RECORD) {
        const eff = await effectsOf(surf.view, surf.arg, surf.regions, key, o);
        out.controls.push({ key, occurrence: o, effects: eff || { missing: true } });
        actions++;
      }
    }
    record.surfaces[surf.id] = out;

    if (RECORD) continue;
    /* ---- compare ---- */
    const base = baseline.surfaces[surf.id];
    if (!base) { fail(`${surf.id}: no baseline — record it deliberately`); continue; }
    const isMigrated = migrated.has(surf.view);
    const ledger = out.render.first.concat(out.render.second).filter((p) => LEDGER.test(p));
    if (ledger.length) fail(`${surf.id}: a render wrote the Governor ledger: ${ledger.join(", ")}`);
    if (out.render.second.length) fail(`${surf.id}: the second render wrote data: ${out.render.second.join(", ")}`);
    const extra = out.render.first.filter((p) => !base.render.first.includes(p));
    if (extra.length) fail(`${surf.id}: renders now write ${extra.join(", ")} (baseline: ${base.render.first.join(", ") || "nothing"})`);
    if (isMigrated && out.render.first.length) fail(`${surf.id}: a rebuilt view must render without writing data (§0.2.3): ${out.render.first.join(", ")}`);
    const newErr = out.render.errors.filter((e) => !base.render.errors.includes(e));
    if (newErr.length) fail(`${surf.id}: render errors ${newErr.join(" / ")}`);

    /* every current control's effects, replayed once and only when a
       reachable retirement asks for them */
    const current = {};
    async function reachable(want, via) {
      const regions = via ? [via] : surf.regions;
      const id = regions.join(",");
      if (!current[id]) {
        current[id] = [];
        /* replaying the whole page must not leave its last toast behind:
           a later control whose toast repeats it would read as silent */
        const toastEl = document.getElementById("toast");
        const toastWas = toastEl ? toastEl.textContent : "";
        const seen = {};
        const pool = via ? (await render(surf.view, surf.arg), controlsIn(regions)) : list;
        for (const { key } of pool) {
          const k = key.hooks + "|" + key.name;
          const o = seen[k] = (seen[k] || 0); seen[k]++;
          current[id].push(await effectsOf(surf.view, surf.arg, regions, key, o));
          actions++;
        }
        if (toastEl) toastEl.textContent = toastWas;
      }
      const target = JSON.stringify(want.eff);
      return current[id].some((e) => JSON.stringify(without(rewrite(e, want.rewrites), want.drops)) === target);
    }
    function retirement(c0, c) {
      return renames.find((r) => r.retire && applies(r, c0, surf.id) && applies(r, c, surf.id) &&
        (new RegExp(r.from).test(c0.key.name) || new RegExp(r.from).test(c.key.name)));
    }

    for (const c0 of base.controls) {
      const c = renamed(c0, surf.id);
      const eff = await effectsOf(surf.view, surf.arg, surf.regions, c.key, c.occurrence);
      actions++;
      const label = `${surf.id} › ${c.key.hooks || c.key.tag} "${c.key.name}"`;
      if (c.effects.missing) continue;
      if (!eff) {
        const r = retirement(c0, c);
        if (!r) { fail(`${label}: the control is gone (hooks and accessible name are the contract)`); continue; }
        if (r.reachable && !(await reachable(contract(c, surf.id), r.via))) fail(`${label}: retired as reachable, but nothing on the page still does ${JSON.stringify(contract(c, surf.id).eff)}`);
        continue;
      }
      const want = contract(c, surf.id);
      const a = JSON.stringify(without(rewrite(eff, want.rewrites), want.drops)), b = JSON.stringify(want.eff);
      if (a !== b) fail(`${label}: effects changed\n      was ${b}\n      now ${a}`);
    }
  }

  if (RECORD) {
    record.recordedFrom = process.env.KOS_BASELINE_REV || "working tree";
    record.clock = CLOCK + " Europe/London";
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify(record, null, 1) + "\n");
    console.log(`recorded ${Object.keys(record.surfaces).length} surfaces, ${actions} controls → ${path.relative(process.cwd(), BASELINE)}`);
    process.exit(0);
  }

  console.log(`smoke56: ${all.length} surfaces, ${actions} controls replayed, ${migrated.size} rebuilt view(s)`);
  if (failures.length) {
    console.log(failures.map((f) => "FAIL  " + f).join("\n"));
    console.log(`\n${failures.length} FAILURE(S)`);
    process.exit(1);
  }
  console.log("ALL PASS");
  process.exit(0);
}

main().catch((e) => { console.error(e.stack || e); process.exit(1); });
