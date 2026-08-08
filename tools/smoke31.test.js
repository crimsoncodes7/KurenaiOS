/* Kurenai OS — smoke31.test.js
   Governor v5 UI/UX regression suite.
   Covers the presentation contract only: core Governor/session/cropper
   semantics remain guarded by smoke3, smoke15 and smoke16. */
const { JSDOM } = require("jsdom");
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
window.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({ data: {} }), text: () => Promise.resolve("") });
const noop = () => {};
window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : noop, set: () => true });

const errors = [];
window.addEventListener("error", e => errors.push(e.message));
for (const src of [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1])) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
const steps = [];
function step(name, fn) { steps.push([name, fn]); }

step("Status uses one identity hero and five non-duplicated instruments", async () => {
  KOS.show("governor");
  await tick(40);
  const main = document.getElementById("main");
  if (!main.querySelector(".gov-seat-hero .id-access")) throw new Error("useful Governor access panel missing");
  if (main.querySelector(".gov-seat-hero .id-side")) throw new Error("telemetry duplicated in hero");
  const vitals = main.querySelectorAll(".gov-instruments .vital");
  if (vitals.length !== 5) throw new Error(`expected 5 instruments, got ${vitals.length}`);
  const labels = [...vitals].map(v => v.querySelector(".gstat-k").textContent);
  for (const label of ["HP", "XP", "Gold", "Review queue", "Study streak"])
    if (!labels.includes(label)) throw new Error(`missing instrument ${label}`);
});

step("Each Governor tab owns its page heading and Status can preview both HP sides without mutating HP", async () => {
  const g = KOS.store.state.governor;
  const hp0 = g.hp;
  const main = document.getElementById("main");
  const off = main.querySelector('.hp-preview-btn[aria-pressed="false"]:last-child') || [...main.querySelectorAll('.hp-preview-btn')].find(b => b.textContent === "Off");
  off.click();
  if (KOS.store.state.governor.hp !== hp0) throw new Error("HP preview mutated the Governor economy");
  if (!document.querySelector(".gov-status.gov-critical .gov-recovery")) throw new Error("critical preview did not expose recovery UI");
  KOS.show("governor", "avatar", { _nav: true });
  await tick(40);
  if (document.querySelector(".gov-head h1").textContent !== "Avatar & profile") throw new Error("Avatar kept the global Status title");
  KOS.show("governor", undefined, { _nav: true });
  await tick(40);
  [...document.querySelectorAll('.hp-preview-btn')].find(b => b.textContent === "Live").click();
});

step("Cadence is exactly 13 weeks / 91 days and never claims a year", async () => {
  const main = document.getElementById("main");
  const heat = main.querySelector(".b-heat");
  if (!/last 90 days/i.test(heat.textContent)) throw new Error("90-day label missing");
  if (/last (12 months|year)/i.test(heat.textContent)) throw new Error("year cadence copy survived");
  const cells = heat.querySelectorAll(".heat-svg svg rect");
  if (cells.length !== 91) throw new Error(`expected 91 heat cells, got ${cells.length}`);
});

step("Primary ledger keeps milestones and hides low-signal/system traffic", async () => {
  KOS.sessions.log({ type: "media", metrics: { module: "anime", action: "sync-reward", entries: 3 } });
  KOS.sessions.log({ type: "media", metrics: { title: "Quiet Show", action: "progress" } });
  KOS.sessions.log({ type: "focus", dur: 600, metrics: { complete: false, mins: 10 } });
  KOS.sessions.log({ type: "focus", dur: 1500, metrics: { complete: true, mins: 25 } });
  KOS.sessions.log({ type: "todo", metrics: { item: "Finish assignment" } });
  KOS.show("governor", undefined, { _nav: true });
  await tick(40);
  const text = document.querySelector(".b-ledger").textContent;
  if (!/Focus session completed/.test(text) || !/Finish assignment/.test(text)) throw new Error("meaningful acts missing");
  if (/sync completed|Progress saved|ended early/i.test(text)) throw new Error("low-signal event leaked into primary ledger");
});

step("Recovery is one prescriptive dispatch, not a three-row route map", async () => {
  const g = KOS.store.state.governor;
  g.hp = 40;
  KOS.show("governor", undefined, { _nav: true });
  await tick(40);
  const rec = document.querySelector(".gov-recovery");
  if (!rec || !rec.querySelector(".gov-rec-go")) throw new Error("recovery dispatch/action missing");
  if (rec.querySelectorAll(".gov-rec-item").length) throw new Error("legacy recovery rows survived");
  if (!/review queue is clear|card.*ready now/i.test(rec.textContent)) throw new Error("state-aware recovery copy missing");
  g.hp = 100; KOS.store.save();
});

step("Session Log has accessible category filters and expandable details", async () => {
  KOS.show("governor", "history", { _nav: true });
  await tick(40);
  const main = document.getElementById("main");
  const tabs = [...main.querySelectorAll('.log-filterbar [role="tab"]')];
  const ids = tabs.map(t => t.dataset.cat);
  for (const id of ["all", "study", "focus", "tasks", "collection", "papers", "system"])
    if (!ids.includes(id)) throw new Error(`missing history filter ${id}`);
  if (tabs.filter(t => t.getAttribute("aria-selected") === "true").length !== 1) throw new Error("history selected state invalid");
  if (main.querySelectorAll(".gov-history-stats .gov-history-stat").length !== 3) throw new Error("history overview statistics missing");
  if (!main.querySelector(".gov-day-group > .led-day + .gov-day-events")) throw new Error("history date groups are not structurally aligned");
  const rows = main.querySelectorAll(".gov-log details.gov-log-event");
  if (!rows.length || !rows[0].querySelector("summary.gov-log-summary")) throw new Error("expandable history rows missing");
  rows[0].open = true;
  if (!rows[0].querySelector(".gov-event-details")) throw new Error("expanded detail body missing");
});

step("System traffic is hidden by default and coalesced in its own filter", async () => {
  const main = document.getElementById("main");
  if (/sync completed/i.test(main.querySelector(".gov-log").textContent)) throw new Error("sync visible in All activity");
  main.querySelector('.log-cat[data-cat="system"]').click();
  const rows = main.querySelectorAll(".gov-log .is-routine");
  if (rows.length !== 1) throw new Error(`expected one coalesced system row, got ${rows.length}`);
  if (!/sync completed/i.test(rows[0].textContent)) throw new Error("system row wording missing");
});

step("History paginates in 30-entry increments and keeps date groups", async () => {
  for (let i = 0; i < 36; i++) KOS.sessions.log({ type: "todo", metrics: { item: "History item " + i } });
  KOS.show("governor", "history", { _nav: true });
  await tick(40);
  const main = document.getElementById("main");
  const before = main.querySelectorAll(".gov-log details.gov-log-event").length;
  const more = main.querySelector(".gov-log-more");
  if (before !== 30 || !more) throw new Error(`initial page should be 30 with pager, got ${before}`);
  more.click();
  const after = main.querySelectorAll(".gov-log details.gov-log-event").length;
  if (after <= before) throw new Error("Show more did not extend history");
  if (!main.querySelector(".gov-timeline .led-day small")) throw new Error("date group count missing");
});

step("Gold Shop separates tools, simulations and cosmetics with contextual previews", async () => {
  KOS.show("governor", "shop", { _nav: true });
  await tick(40);
  const main = document.getElementById("main");
  if (main.querySelectorAll(".shop-dept").length !== 4) throw new Error("department filter incomplete");
  if (main.querySelector('.shop-dept[aria-selected="true"]')?.dataset.dept !== "all") throw new Error("Gold Shop should open on All wares");
  if ([...main.querySelectorAll(".shop-sec")].some(s => s.hidden)) throw new Error("All wares should show every shop section by default");
  if (main.querySelectorAll('#shop-sec-tools .shop-card').length !== 2) throw new Error("learning tools not separated");
  if (main.querySelectorAll('#shop-sec-simulations .shop-card').length !== 6) throw new Error("simulations not separated");
  if (main.querySelectorAll(".shop-lab-scene").length !== 8) throw new Error("functional mini-scenes missing");
  if (!main.querySelector(".sp-seal-brand") || !main.querySelector(".sp-shelf") || !main.querySelector(".sp-shrine")) throw new Error("cosmetic context previews missing");
  if (main.querySelector(".sp-theme-shell") || main.querySelector(".sp-banner-card")) throw new Error("meaningless preview overlays survived");
  if (main.querySelector(".shop-pv-glyph")) throw new Error("legacy isolated glyph preview survived");
  if (!/Core revision stays free/.test(main.querySelector("#shop-sec-tools").textContent)) throw new Error("essential-study access copy missing");
  main.querySelector('.shop-dept[data-dept="tools"]').click();
  const visible = [...main.querySelectorAll(".shop-sec")].filter(s => !s.hidden);
  if (visible.length !== 1 || visible[0].dataset.domain !== "tools") throw new Error("department filtering failed");
});

step("Avatar workshop uses the shared cropper and preserves seal/frame choices", async () => {
  KOS.show("governor", "avatar", { _nav: true });
  await tick(40);
  const main = document.getElementById("main");
  if (!main.querySelector(".avatar-studio > .identity-stage + .av-controls")) throw new Error("avatar preview and controls are not aligned siblings");
  if (main.querySelector(".av-workshop-head")) throw new Error("duplicate Avatar title survived inside the page");
  if (main.querySelectorAll(".seal-grid .seal-card").length !== KOS.governor.seals().length) throw new Error("seal library incomplete");
  const add = [...main.querySelectorAll(".av-mc .btn")].find(b => /Add|Edit/.test(b.textContent));
  add.click();
  if (!document.querySelector(".cropper-modal")) throw new Error("avatar did not open shared cropper");
  document.querySelector(".cropper-modal .cropper-foot .btn").click();
});

step("Corner identity stays concise and the full profile anchors status beside the portrait", async () => {
  KOS.governor.setProfileText({ status: "Deep work until noon", about: "A small profile note." });
  KOS.refreshHUD();
  if (!document.querySelector("#hud .hud-profile-name") || !document.querySelector("#hud .hud-profile-meta")) throw new Error("compact HUD identity missing");
  if (document.querySelector("#hud .hud-bars") || document.querySelector("#hud .hud-status")) throw new Error("dashboard detail leaked into the compact HUD");
  const pop = KOS.governor.openProfilePopover();
  if (!pop.querySelector(".pc-identity-row .pc-status.profile-speech")) throw new Error("popover status is not anchored beside the portrait");
  const labels = [...pop.querySelectorAll(".pc-foot .pc-action")].map(b => b.textContent);
  if (labels.join("|") !== "Edit profile|Open Governor →") throw new Error("compact profile actions wrong: " + labels.join("|"));
  KOS.governor.closeProfilePopover();
});

step("Responsive and reduced-motion Governor rules are present", () => {
  const css = fs.readFileSync(path.join(ROOT, "css", "main.css"), "utf8");
  /* The Governor's compact tier used to be a bespoke 760px query. Category 7
     Phase B folded it into the sanctioned 860px "compact" tier — assert the
     tier, not a magic number, so the next consolidation does not have to
     rewrite this line again. smoke42 owns the "only five widths" rule. */
  if (!/@media \(max-width: 860px\)[\s\S]*\.gov-seat-hero/.test(css)) throw new Error("mobile Governor rules missing");
  if (!/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.shop-card/.test(css)) throw new Error("reduced-motion rules missing");
  /* Guard the rule that ACTUALLY renders, and guard its uniqueness: the
     previous assertion matched a copy that a later rule overrode, so it
     passed while the geometry it described had no effect. */
  const heatRules = css.match(/^\.heat-svg svg \{[^}]*\}/gm) || [];
  if (heatRules.length !== 1) throw new Error("expected exactly one .heat-svg svg rule, found " + heatRules.length);
  if (!/width: 100% !important/.test(heatRules[0]) || !/max-width: 400px/.test(heatRules[0]) ||
      !/display: block/.test(heatRules[0]) || !/margin: 0 auto 0 0/.test(heatRules[0]))
    throw new Error("heatmap geometry rule changed: " + heatRules[0]);
});

step("Merged Governor classes retain their styling contracts and the assistant dot is state-only", () => {
  const css = fs.readFileSync(path.join(ROOT, "css", "main.css"), "utf8");
  for (const selector of [".gov-seat-hero .id-access", ".hp-preview", ".hud-profile-meta", ".pc-identity-row", ".av-pv-identity"])
    if (!css.includes(selector)) throw new Error(`missing integration style ${selector}`);
  if (!/\.gov-head \{ margin-bottom: 0; \}/.test(css) || !/\.gov-workspace \{[\s\S]*?padding-top: 18px;/.test(css))
    throw new Error("Governor header-to-content spacing regressed");
  const idleDot = css.match(/\.assistant-trigger \.at-dot \{[^}]*\}/);
  if (!idleDot || !/opacity: 0/.test(idleDot[0]) || !/border: 2px solid transparent/.test(idleDot[0]))
    throw new Error("idle assistant state dot is visible");
  if (!/\.assistant-trigger\.is-busy \.at-dot \{[^}]*opacity: 1/.test(css) ||
      !/\.assistant-trigger\.is-confirm \.at-dot \{[^}]*opacity: 1/.test(css))
    throw new Error("assistant lifecycle states no longer reveal the dot");
  if (/sp-theme-shell|sp-banner-card/.test(css)) throw new Error("obsolete shop overlays survived");
});

(async () => {
  let pass = 0;
  for (const [name, fn] of steps) {
    try { await fn(); pass++; console.log("  ok ", name); }
    catch (e) { console.error("  FAIL", name, "\n      " + e.message); }
  }
  if (errors.length) errors.forEach(e => console.error("  WINDOW", e));
  const failed = steps.length - pass + errors.length;
  console.log(`\nSMOKE31 ${failed ? "FAIL" : "PASS"} — ${pass}/${steps.length} Governor v5 checks passed.`);
  process.exit(failed ? 1 : 0);
})();
