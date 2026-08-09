/* Kurenai OS — smoke45.test.js
   Category 7 Phase F: accessibility, interaction and routing.

   Covered here:

   A · HISTORY. Every view has a hash route; a navigation pushes; browser
       Back and Forward move WITHIN the app; a `_nav` redraw — which is
       what KOS.rerender and therefore every cloud pull passes — creates
       no entry and does not touch the URL; an unknown route fails to
       Home instead of rendering a broken page.
   B · LIVE REGIONS. One polite region, one assertive; the toast mirrors
       into it rather than being one itself, so the same sentence twice
       announces twice; the sync chip announces the transitions that need
       the user and stays silent through the syncing/synced/pending churn
       that made it the noisiest thing in the app.
   C · NAMES AND SEMANTICS. No focusable control anywhere without an
       accessible name; no div[role=button] holding interactive
       descendants; role="button" honours Space as well as Enter; a null
       attribute is an absent attribute, not title="null".
   D · DIALOGS AND MENUS. Phase B's contract is unchanged (role,
       aria-modal, trap, restore, danger-safe), and a menu is still not a
       dialog.
   E · SEARCH. Grouped, cross-domain, keyboard-navigable, correctly
       routed — and carrying nothing private.
   F · TOUCH TARGETS. The contract as it can be machine-read.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke45.test.js                                          */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const src = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const css = src("css/main.css");
const cssRules = css.replace(/\/\*[\s\S]*?\*\//g, "");
const uiSrc = src("js/core/ui.js");
const routerSrc = src("js/core/router.js");
const searchSrc = src("js/core/search.js");
const cloudUiSrc = src("js/modules/cloudui.js");

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
window.matchMedia = q => ({ matches: false, media: q, addListener: noop, removeListener: noop,
  addEventListener: noop, removeEventListener: noop });
window.fetch = () => Promise.reject(new Error("network disabled in smoke45"));
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.IntersectionObserver = function () {
  const self = { targets: [], observe: t => self.targets.push(t), unobserve: noop, disconnect: noop };
  return self;
};

for (const m of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(src(m[1])); }
  catch (e) { errors.push("LOAD FAIL " + m[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const main = () => document.getElementById("main");
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const key = (k, t) => (t || document).dispatchEvent(new window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
const p = fn => new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out)));
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const steps = [];
const step = (n, f) => steps.push([n, f]);

/* the accessible name, to the depth this DOM can answer for: aria-label,
   aria-labelledby, an associated or wrapping <label>, then content, then
   title. A PLACEHOLDER is deliberately not a name — it disappears the
   moment there is text in the field, which is exactly when a name is
   needed — so it is reported separately. */
function accName(n) {
  const al = n.getAttribute("aria-label");
  if (al && al.trim()) return al.trim();
  const lb = n.getAttribute("aria-labelledby");
  if (lb) {
    const t = lb.split(/\s+/).map(id => { const e = document.getElementById(id); return e ? e.textContent : ""; }).join(" ").trim();
    if (t) return t;
  }
  if (n.id) {
    const lab = $$("label[for]").find(l => l.getAttribute("for") === n.id);
    if (lab && lab.textContent.trim()) return lab.textContent.trim();
  }
  const wrap = n.closest("label");
  if (wrap && wrap.textContent.trim()) return wrap.textContent.trim();
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) {
    const t = n.getAttribute("title");
    return t && t.trim() ? t.trim() : "";
  }
  const txt = (n.textContent || "").replace(/\s+/g, " ").trim();
  if (txt) return txt;
  const t2 = n.getAttribute("title");
  if (t2 && t2.trim()) return t2.trim();
  const img = n.querySelector("img[alt]");
  if (img && img.getAttribute("alt").trim()) return img.getAttribute("alt").trim();
  return "";
}
/* display:none / hidden controls are not in the tab order or the
   accessibility tree — a hidden file input triggered by a visible button
   is correct, not a defect */
function reallyFocusable(n) {
  if (n.disabled) return false;
  if (n.type === "hidden") return false;
  if (n.closest("[hidden]")) return false;
  let e = n;
  while (e && e.nodeType === 1) {
    const st = e.getAttribute && e.getAttribute("style");
    if (st && /display\s*:\s*none/.test(st)) return false;
    e = e.parentElement;
  }
  const ti = n.getAttribute("tabindex");
  if (ti !== null && +ti < 0) return false;
  return true;
}
const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]';

const VIEWS = ["home", "subject", "review", "due", "cardstats", "tracker", "personaldeck", "assignments",
  "focus", "calendar", "tasks", "reminders", "matrix", "anime", "books", "vn", "game", "seasonal",
  "mangaka", "wishlist", "shrine", "goals", "aniprofile", "vndbprofile", "mediasync",
  "governor", "assistant", "data", "help"];

/* ============ seed: the app must be audited with content in it ============
   An empty account hides most of this — a vault card cannot be wrong about
   its role until a vault card exists. */
step("seed media, reminders, assignments, calendar events and a topic note", async () => {
  const existing = await p(cb => KOS.mediadb.query({}, cb));
  for (const e of existing) await p(cb => KOS.mediadb.remove(e.id, cb, { skipTombstone: true }));
  const plan = [["anime", 8], ["books", 8], ["vn", 4], ["game", 6]];
  let i = 0;
  for (const [module, n] of plan) {
    for (let k = 0; k < n; k++, i++) {
      await p(cb => KOS.mediadb.add({
        module, title: "Wandering Lantern " + i,
        coverUrl: i % 3 === 0 ? "" : "/icons/icon-192.png",
        status: ["planned", "inProgress", "completed"][i % 3],
        favourite: i % 4 === 0,
        author: module === "books" ? "Aoyama " + (k % 3) : "",
        playtimeHours: module === "game" ? 10 + i : null,
        progress: { current: i % 12, total: module === "game" ? null : 24 },
        routes: module === "vn" ? [{ name: "Common", cleared: true }] : []
      }, cb));
    }
  }
  KOS.reminders.add({ title: "Lantern festival tickets", notes: "before they sell out", tags: ["errand"] });
  KOS.assignments.add
    ? KOS.assignments.add({ title: "Lantern coursework", subject: "compsci", due: KOS.srs.todayISO() })
    : null;
  KOS.calendar.addEvent({ title: "Lantern exam", type: "exam", date: KOS.srs.todayISO(), room: "Hall B" });
  KOS.store.state.progress["compsci:4.1.1.1"] = { status: "started", check: [true, false, false, false],
    note: "A lantern is the mnemonic I use for this." };
  KOS.store.save();
  const rows = await p(cb => KOS.mediadb.query({}, cb));
  assert(rows.length === 26, "seed failed: " + rows.length);
  assert(KOS.reminders.all().length >= 1, "no reminder seeded");
});

/* ==================== A · HISTORY AND ROUTING ==================== */
console.log("== A · browser history is the app's history ==");

step("boot stamped a route onto the current entry", async () => {
  assert(/^#\//.test(window.location.hash), "boot left no route: " + window.location.hash);
  assert(window.history.state && window.history.state.kos, "the boot entry is not one of ours");
});

step("every view has a route, and the route round-trips", () => {
  for (const v of VIEWS) {
    const route = KOS.router.routeFor(v);
    assert(route === "#/" + v, v + " routed to " + route);
    const back = KOS.router.parse(route);
    assert(back && back.viewId === v, v + " did not parse back");
  }
  /* the five views whose ARGUMENT is part of the page's identity */
  assert(KOS.router.routeFor("subject", "maths") === "#/subject/maths", "subject arg not encoded");
  assert(KOS.router.routeFor("governor", "shop") === "#/governor/shop", "governor tab not encoded");
  assert(KOS.router.routeFor("assistant", { tab: "chat" }) === "#/assistant/chat", "assistant tab not encoded");
  const ref = KOS.router.parse("#/ref/compsci/4.1.1.1");
  assert(ref && ref.viewId === "ref" && ref.arg.subject === "compsci" && ref.arg.ref === "4.1.1.1",
    "ref deep link did not parse: " + JSON.stringify(ref));
});

step("a navigation pushes an entry and the URL follows the view", async () => {
  KOS.show("home"); await tick();
  const d0 = KOS.router.depth();
  KOS.show("review"); await tick();
  assert(window.location.hash === "#/review", "URL did not follow: " + window.location.hash);
  assert(KOS.router.depth() === d0 + 1, "no history entry was pushed");
  KOS.show("subject", "maths"); await tick();
  assert(window.location.hash === "#/subject/maths", "subject URL wrong: " + window.location.hash);
});

step("browser Back and Forward navigate inside KurenaiOS", async () => {
  KOS.show("home"); await tick();
  KOS.show("calendar"); await tick();
  KOS.show("governor", "shop"); await tick();
  assert(window.location.hash === "#/governor/shop", "setup wrong");

  window.history.back(); await tick(80);
  assert(window.location.hash === "#/calendar", "Back did not reach the previous view: " + window.location.hash);
  assert(KOS.store.state.ui.view === "calendar", "Back changed the URL but not the page");
  assert(KOS.canForward(), "Forward should now be available");

  window.history.forward(); await tick(80);
  assert(window.location.hash === "#/governor/shop", "Forward did not return: " + window.location.hash);
  assert(KOS.store.state.ui.view === "governor", "Forward changed the URL but not the page");
});

step("the topbar arrows drive the same one stack", async () => {
  KOS.show("home"); await tick();
  KOS.show("help"); await tick();
  assert(KOS.canBack(), "Back should be live after two navigations");
  KOS.back(); await tick(80);
  assert(window.location.hash === "#/home", "the in-app arrow did not move browser history");
  const b = document.getElementById("nav-back"), f = document.getElementById("nav-fwd");
  assert(f && !f.disabled, "the Forward arrow should be enabled");
  /* and they agree with the browser, because there is only one stack */
  assert(b.disabled === !KOS.canBack(), "the Back arrow disagrees with the stack");
});

step("a cloud-driven redraw creates NO history entry and moves no URL", async () => {
  KOS.show("matrix"); await tick(30);
  const d0 = KOS.router.depth(), h0 = window.location.hash, max0 = KOS.router.maxDepth();
  /* this is exactly the call cloudsync's rerenderCurrent makes */
  KOS.rerender(); await tick(30);
  assert(KOS.router.depth() === d0, "a redraw pushed a history entry (" + d0 + " → " + KOS.router.depth() + ")");
  assert(KOS.router.maxDepth() === max0, "a redraw truncated the forward trail");
  assert(window.location.hash === h0, "a redraw changed the URL");
  /* and the source contract behind it: the router only pushes when the
     caller did NOT mark the render as navigation-internal */
  assert(/opts\._nav[\s\S]{0,400}pushEntry/.test(routerSrc) || /if \(opts\._nav\)/.test(routerSrc),
    "router.js no longer distinguishes a redraw from a navigation");
});

step("an unknown or malformed route fails safe to Home", async () => {
  KOS.show("home"); await tick();
  assert(KOS.router.parse("#/notaview") === null, "an unknown view id parsed");
  assert(KOS.router.parse("#/subject/notasubject") === null, "a bogus subject parsed");
  assert(KOS.router.parse("#/ref/compsci") === null, "a ref with no identity parsed");
  assert(KOS.router.parse("") === null && KOS.router.parse("#") === null, "an empty hash parsed");
  window.location.hash = "#/notaview/xyz"; await tick(90);
  assert(KOS.store.state.ui.view === "home", "a bad route did not fall back to Home");
  assert(window.location.hash === "#/home", "the bad route was left in the address bar");
});

step("routing is hash-based, so file:// and a static host both work", () => {
  assert(/#\//.test(routerSrc) && /pushState/.test(routerSrc), "the router does not use pushState over hash routes");
  assert(!/history\.pushState\([^)]*,\s*["']\//.test(routerSrc), "a path route would 404 on refresh on Pages");
  assert(/location\.hash/.test(routerSrc), "there is no fallback for a host that refuses pushState");
});

/* ==================== B · LIVE REGIONS ==================== */
console.log("== B · what the app says out loud ==");

step("there is one polite region and one assertive region", () => {
  const pol = document.getElementById("kos-live-polite");
  const ass = document.getElementById("kos-live-assertive");
  assert(pol && ass, "the live regions are missing");
  assert(pol.getAttribute("aria-live") === "polite", "the polite region is not polite");
  assert(ass.getAttribute("aria-live") === "assertive", "the assertive region is not assertive");
  assert(pol.className.includes("sr-only") && ass.className.includes("sr-only"),
    "a live region is visible on screen");
});

step("#toast is the visible half only — it is not a second live region", () => {
  const t = document.getElementById("toast");
  assert(t, "no toast node");
  assert(!t.hasAttribute("aria-live") && t.getAttribute("role") !== "status",
    "the toast is still its own live region, so every message is announced twice");
  assert(t.getAttribute("aria-hidden") === "true", "the toast should be hidden from the a11y tree");
});

step("a toast announces, and the same sentence twice announces twice", async () => {
  const pol = document.getElementById("kos-live-polite");
  KOS.ui.toast("Saved to the vault.");
  await tick(80);
  assert(pol.textContent === "Saved to the vault.", "nothing was announced: " + JSON.stringify(pol.textContent));
  /* the region is cleared before it is refilled; without that, setting the
     same string is a no-op and the second event is silent */
  await tick(500);
  KOS.ui.toast("Saved to the vault.");
  await tick(20);
  assert(pol.textContent === "", "the region was not cleared before the repeat");
  await tick(80);
  assert(pol.textContent === "Saved to the vault.", "the repeat did not announce");
});

step("a failure interrupts; a confirmation waits its turn", async () => {
  const pol = document.getElementById("kos-live-polite");
  const ass = document.getElementById("kos-live-assertive");
  KOS.ui.toast("Delete failed: the record is gone.", true);
  await tick(80);
  assert(ass.textContent.indexOf("Delete failed") === 0, "an error did not reach the assertive region");
  assert(pol.textContent.indexOf("Delete failed") !== 0, "an error also went to the polite region");
});

step("the sync chip is a button, not a live region", () => {
  const chip = document.getElementById("sync-status");
  assert(chip, "no sync chip");
  assert(!chip.hasAttribute("aria-live"),
    "the chip is still a live region, so every cycle is announced");
  assert(/aria-label/.test(cloudUiSrc) && /Activate to/.test(cloudUiSrc),
    "the chip's name does not describe what pressing it does");
});

step("the chip announces attention and recovery, and nothing in between", () => {
  /* the policy, read from source: the churn states must not be announced
     and the attention states must be */
  const m = cloudUiSrc.match(/var ATTENTION = \{([^}]*)\}/);
  assert(m, "the chip has no announcement policy");
  const attention = m[1];
  for (const s of ["error", "attention", "signedOut"]) {
    assert(attention.indexOf(s) !== -1, s + " should be announced");
  }
  for (const s of ["syncing", "pending"]) {
    assert(attention.indexOf(s) === -1, s + " must NOT be announced — that is the noise U-21 describes");
  }
  assert(/wasAttention && s\.state === "synced"/.test(cloudUiSrc),
    "recovery from an attention state is not announced");
  assert(/if \(s\.state === prev\) return/.test(cloudUiSrc),
    "the chip re-announces a state it is already in");
});

step("a navigation announces the page and puts focus in it", async () => {
  const pol = document.getElementById("kos-live-polite");
  await tick(400);
  KOS.show("help"); await tick(90);
  assert(document.activeElement === main() || main().contains(document.activeElement),
    "focus was left outside the new page — the next Tab restarts at the brand mark");
  assert(pol.textContent && pol.textContent.length > 1, "the new page was not named");
});

step("a redraw does NOT announce or move focus", async () => {
  KOS.show("help"); await tick(90);
  const pol = document.getElementById("kos-live-polite");
  await tick(400);
  pol.textContent = "";
  const before = document.activeElement;
  const probe = document.getElementById("search");
  probe.focus();
  KOS.rerender(); await tick(90);
  assert(document.activeElement === probe,
    "a cloud redraw stole focus from the user (it was on " +
    (document.activeElement && document.activeElement.id) + ")");
  assert(pol.textContent === "", "a cloud redraw announced a navigation that did not happen");
});

/* ==================== C · NAMES AND SEMANTICS ==================== */
console.log("== C · every control says what it is ==");

step("no focusable control in any view lacks an accessible name", async () => {
  const bad = [];
  for (const v of VIEWS) {
    KOS.show(v, v === "subject" ? "compsci" : undefined);
    await tick(40);
    main().querySelectorAll(FOCUSABLE).forEach(n => {
      if (!reallyFocusable(n)) return;
      if (!accName(n)) bad.push(v + " · " + n.tagName.toLowerCase() + "." + String(n.className).split(/\s+/)[0]);
    });
  }
  KOS.show("ref", { subject: "compsci", ref: "4.1.1.1" });
  await tick(60);
  main().querySelectorAll(FOCUSABLE).forEach(n => {
    if (!reallyFocusable(n)) return;
    if (!accName(n)) bad.push("ref · " + n.tagName.toLowerCase() + "." + String(n.className).split(/\s+/)[0]);
  });
  for (const id of ["topbar", "rail", "subnav"]) {
    document.getElementById(id).querySelectorAll(FOCUSABLE).forEach(n => {
      if (!reallyFocusable(n)) return;
      if (!accName(n)) bad.push("chrome · " + n.tagName.toLowerCase() + "." + String(n.className).split(/\s+/)[0]);
    });
  }
  assert(!bad.length, bad.length + " unnamed control(s): " + [...new Set(bad)].join(" | "));
});

/* The views are only half the app — most FORMS live in a modal, and
   KOS.show never renders one. This step opens the real editors and holds
   them to the same rule; it is how the VN route rows were caught, where
   every route repeated an unnamed checkbox and an unnamed text field. */
step("no control inside a modal form lacks an accessible name", async () => {
  const bad = [];
  function auditOpenModal(label) {
    const ovs = $$(".modal-ov");
    if (!ovs.length) { bad.push(label + ": did not open"); return; }
    const ov = ovs[ovs.length - 1];
    ov.querySelectorAll('input:not([type="hidden"]), select, textarea, button, a[href]').forEach(n => {
      if (!reallyFocusable(n)) return;
      if (!accName(n)) bad.push(label + " · " + n.tagName.toLowerCase() + "." +
        (String(n.className).split(/\s+/)[0] || "-") +
        (n.placeholder ? " [ph:" + n.placeholder.slice(0, 20) + "]" : ""));
    });
    ov.remove();
    document.body.classList.remove("modal-open");
  }

  KOS.ui.confirm({ title: "Sure?", body: "b" }, noop, noop);
  auditOpenModal("confirm");

  KOS.calendar.eventModal(null, KOS.srs.todayISO(), noop);
  await tick(30);
  auditOpenModal("calendar event");

  for (const mod of ["anime", "books", "vn", "game"]) {
    KOS.show(mod); await tick(140);
    const rows = await p(cb => KOS.mediadb.query({ module: mod }, cb));
    const entry = rows[0];
    /* a VN with routes and chapters, so the per-row controls actually render */
    if (mod === "vn") {
      entry.routes = [{ name: "Common", cleared: true }, { name: "True", cleared: false }];
      entry.chapters = [{ name: "Chapter 1", status: "completed", notes: "" }];
      await p(cb => KOS.mediadb.put(entry, cb));
    }
    KOS.mediaEditor(entry, noop);
    await tick(80);
    auditOpenModal(mod + " editor");
  }

  KOS.show("tracker"); await tick(60);
  const logBtn = $$("#main button").find(b => /Log entry|Log exam|Log paper/i.test(b.textContent));
  if (logBtn) { click(logBtn); await tick(60); auditOpenModal("tracker log"); }

  assert(!bad.length, bad.length + " unnamed control(s) in modal forms: " + [...new Set(bad)].join(" | "));
});

step("no ARIA button contains an interactive descendant", async () => {
  const bad = [];
  for (const v of VIEWS) {
    KOS.show(v, v === "subject" ? "compsci" : undefined);
    await tick(40);
    main().querySelectorAll('[role="button"]').forEach(n => {
      const inner = n.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]').length;
      if (inner) bad.push(v + " · ." + String(n.className).split(/\s+/)[0] + " holds " + inner);
    });
  }
  assert(!bad.length,
    "an ARIA button may not contain focusable content — a screen reader flattens it and Tab walks inside: " +
    [...new Set(bad)].join(" | "));
});

step("the vault card is not a button, and its title is", async () => {
  for (const v of ["anime", "books", "vn", "game"]) {
    KOS.show(v); await tick(120);
    const card = main().querySelector(".med-card");
    assert(card, v + ": no card rendered");
    assert(card.getAttribute("role") !== "button", v + ": the card is still an ARIA button");
    assert(!card.hasAttribute("tabindex"), v + ": the card is still a tab stop");
    const title = card.querySelector("button.med-title");
    assert(title, v + ": the title is not a control");
    assert(accName(title), v + ": the title control has no name");
  }
});

step("role=\"button\" honours Space as well as Enter", async () => {
  const bad = [];
  for (const v of VIEWS) {
    KOS.show(v, v === "subject" ? "compsci" : undefined);
    await tick(40);
    main().querySelectorAll('[role="button"]').forEach(n => {
      if (n.tagName === "BUTTON") return;                 /* native: both keys free */
      let fired = 0;
      const probe = () => fired++;
      n.addEventListener("click", probe);
      const ev = new window.KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
      n.dispatchEvent(ev);
      /* either the node handled Space itself, or it prevented the default
         scroll and acted — what it must NOT do is nothing at all */
      if (!ev.defaultPrevented && !fired) bad.push(v + " · ." + String(n.className).split(/\s+/)[0]);
      n.removeEventListener("click", probe);
    });
    /* the probe genuinely activates things — several of these open an
       editor. Clear them, or the next step inherits a dialog that owns
       Escape and body scroll. */
    $$(".modal-ov").forEach(o => o.remove());
    document.body.classList.remove("modal-open");
  }
  assert(!bad.length, "role=button promises Space: " + [...new Set(bad)].join(" | "));
});

step("an absent attribute value produces no attribute", async () => {
  const n = KOS.ui.el("button", { title: null, "aria-current": undefined, text: "x" });
  assert(!n.hasAttribute("title"), 'el() shipped title="' + n.getAttribute("title") + '"');
  assert(!n.hasAttribute("aria-current"), "el() shipped a literal undefined");
  assert(/attrs\[k\] === null \|\| attrs\[k\] === undefined/.test(uiSrc), "the guard is not in el()");
  /* and the consequence, in the rendered app: the section strip and the
     vault menus use `title: … || null` and used to ship title="null" */
  const bad = [];
  for (const v of ["home", "anime", "reminders", "governor"]) {
    KOS.show(v); await tick(60);
    $$('[title="null"], [title="undefined"]').forEach(x =>
      bad.push(v + " · ." + String(x.className).split(/\s+/)[0]));
  }
  assert(!bad.length, 'title="null" is rendered on: ' + [...new Set(bad)].join(" | "));
});

step("decorative ornament is hidden and unfocusable", async () => {
  const petals = document.querySelector(".bg-flora");
  assert(petals && petals.getAttribute("aria-hidden") === "true", "the petals are exposed to the a11y tree");
  assert(!petals.querySelector(FOCUSABLE), "a petal is a tab stop");
  KOS.show("home"); await tick(60);
  const bad = [];
  main().querySelectorAll('[tabindex="0"]').forEach(n => {
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(n.tagName)) return;
    const role = n.getAttribute("role");
    /* a tabbable non-widget is only legitimate as a scrollable region,
       and then it must say which region it is */
    if (!role) bad.push("." + String(n.className).split(/\s+/)[0]);
    else if (!accName(n)) bad.push("." + String(n.className).split(/\s+/)[0] + " (role=" + role + ", unnamed)");
  });
  assert(!bad.length, "non-interactive nodes in the tab order: " + [...new Set(bad)].join(" | "));
});

step("a button never nests inside another button", async () => {
  const bad = [];
  for (const v of VIEWS) {
    KOS.show(v, v === "subject" ? "compsci" : undefined);
    await tick(40);
    main().querySelectorAll("button button").forEach(n =>
      bad.push(v + " · ." + String(n.className).split(/\s+/)[0]));
  }
  assert(!bad.length, "nested buttons (invalid, and browsers disagree what the inner one is): " +
    [...new Set(bad)].join(" | "));
});

/* ==================== D · DIALOGS AND MENUS ==================== */
console.log("== D · the Phase B contract still holds ==");

step("openDialog is still the only route a modal takes into the document", () => {
  /* Phase B's source contract, re-asserted here so Phase F cannot have
     quietly reintroduced a bare appendChild while moving semantics */
  const offenders = [];
  for (const f of fs.readdirSync(path.join(ROOT, "js/modules")).filter(x => x.endsWith(".js"))) {
    const s = src("js/modules/" + f);
    if (/document\.body\.appendChild\(\s*overlay\s*\)/.test(s)) offenders.push(f);
  }
  assert(!offenders.length, "a modal bypasses openDialog: " + offenders.join(", "));
});

step("a dialog is named, modal, trapped and restores focus", async () => {
  KOS.show("home"); await tick(40);
  const trigger = main().querySelector("button") || document.getElementById("brand-home");
  trigger.focus();
  let settled = null;
  window.__kosAutoConfirm = false;
  KOS.ui.confirm({ title: "Discard the draft?", body: "It is not saved." },
    () => { settled = true; }, () => { settled = false; });
  await tick(20);
  const box = document.querySelector(".confirm-modal");
  assert(box, "no dialog opened");
  assert(box.getAttribute("aria-modal") === "true", "not aria-modal");
  assert(box.getAttribute("aria-labelledby") || box.getAttribute("aria-label"), "the dialog has no name");
  assert(document.body.classList.contains("modal-open"), "the page behind is not scroll-locked");
  key("Escape");
  await tick(20);
  assert(!document.querySelector(".confirm-modal"), "Escape did not close the dialog");
  assert(document.activeElement === trigger, "focus did not return to the control that opened it");
});

step("a danger dialog opens on Cancel and refuses Enter", async () => {
  let outcome = "none";
  KOS.ui.confirm({ title: "Delete everything?", danger: true, confirm: "Delete" },
    () => { outcome = "deleted"; }, () => { outcome = "cancelled"; });
  await tick(20);
  const box = document.querySelector(".confirm-modal");
  assert(box.getAttribute("role") === "alertdialog", "a destructive prompt is not an alertdialog");
  assert(document.activeElement && document.activeElement.classList.contains("btn") &&
    !document.activeElement.classList.contains("danger"),
    "the destructive button has focus — two keystrokes would delete");
  key("Enter");
  await tick(20);
  assert(outcome === "none", "Enter confirmed a destructive dialog (" + outcome + ")");
  key("Escape");
  await tick(20);
  assert(outcome === "cancelled", "Escape did not cancel");
  window.__kosAutoConfirm = true;
});

step("a menu is a menu: Escape closes it and focus goes back to its button", async () => {
  KOS.show("anime"); await tick(120);
  const btn = $$(".menu-btn").find(b => /Filters|Actions/.test(b.textContent));
  assert(btn, "no grouped menu on the vault toolbar");
  btn.focus();
  click(btn);
  await tick(20);
  const panel = document.querySelector(".menu-panel");
  assert(panel, "the menu did not open");
  assert(btn.getAttribute("aria-expanded") === "true", "the button does not report it is open");
  assert(!document.body.classList.contains("modal-open"),
    "a menu locked body scroll — that is dialog behaviour, and wrong here");
  assert(panel.getAttribute("role") === "menu" || panel.getAttribute("role") === "group",
    "the panel has no grouping role");
  key("Escape");
  await tick(20);
  assert(!document.querySelector(".menu-panel"), "Escape did not dismiss the menu");
  assert(document.activeElement === btn, "focus did not return to the menu button");
});

step("navigating away destroys an open menu rather than orphaning it", async () => {
  KOS.show("anime"); await tick(120);
  const btn = $$(".menu-btn")[0];
  click(btn); await tick(20);
  assert(document.querySelector(".menu-panel"), "setup: the menu did not open");
  KOS.show("home"); await tick(40);
  assert(!document.querySelector(".menu-panel"),
    "a fixed-position menu survived the view change, still wired to controls that no longer exist");
});

/* ==================== E · SEARCH ==================== */
console.log("== E · one box over everything the user owns ==");

const runSearch = q => new Promise(res => {
  let last = null;
  KOS.search.run(q, (groups, done) => { last = groups; if (done) res(last); });
});

step("search reaches every domain it claims to", async () => {
  const domains = {};
  for (const [q, want] of [["Lantern", "spec-or-media"], ["lantern festival", "reminders"],
    ["Lantern coursework", "assignments"], ["Lantern exam", "calendar"],
    ["mnemonic", "notes"]]) {
    const groups = await runSearch(q);
    groups.forEach(g => { domains[g.id] = (domains[g.id] || 0) + 1; });
  }
  for (const id of ["media", "reminders", "assignments", "calendar", "notes"]) {
    assert(domains[id], "the " + id + " domain returned nothing for a query that matches it");
  }
  /* and the spec is still there, which is what the box used to do */
  const spec = await runSearch("binary");
  assert(spec.some(g => g.id === "spec"), "the specification domain regressed");
});

step("the Collection is searched through the database, not by loading it", () => {
  assert(/mediadb\.query\(\s*\{\s*search:/.test(searchSrc),
    "media search does not go through mediadb's indexed cursor");
  assert(/PER_DOMAIN/.test(searchSrc), "results are not capped per domain");
  assert(KOS.search.PER_DOMAIN <= 10, "the per-domain cap is too loose to keep the listbox small");
});

step("nothing private is searchable", () => {
  for (const secret of ["getKV", "push.log", "token", "session", "audit", "kv"]) {
    assert(searchSrc.indexOf('"' + secret + '"') === -1 || secret === "kv",
      "search reads " + secret);
  }
  assert(!/anilist\.|vndb\.|cloud\.|aimemory|orchestrator/i.test(
    searchSrc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/AniList|VNDB/g, "")),
    "a provider or assistant store is wired into search");
});

step("the box is a combobox and its results are options inside groups", async () => {
  const input = document.getElementById("search");
  assert(input.getAttribute("role") === "combobox", "the search field is not a combobox");
  assert(input.getAttribute("aria-controls") === "search-results", "the field does not own its listbox");
  assert(input.getAttribute("aria-expanded") === "false", "the field claims to be open before anything is typed");
  input.value = "Lantern";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick(150);
  const list = document.getElementById("search-results");
  assert(list.getAttribute("role") === "listbox", "the results are not a listbox");
  assert(input.getAttribute("aria-expanded") === "true", "the field does not report the list is open");
  const groups = list.querySelectorAll('[role="group"]');
  assert(groups.length >= 2, "results are not grouped by domain (" + groups.length + ")");
  groups.forEach(g => assert(g.getAttribute("aria-label"), "a result group has no name"));
  const opts = list.querySelectorAll('[role="option"]');
  assert(opts.length, "no options rendered");
  opts.forEach(o => assert(o.id, "an option has no id, so aria-activedescendant cannot point at it"));
});

step("results are navigable and openable from the keyboard", async () => {
  const input = document.getElementById("search");
  const list = document.getElementById("search-results");
  const opts = [...list.querySelectorAll('[role="option"]')];
  key("ArrowDown", input); await tick();
  assert(input.getAttribute("aria-activedescendant") === opts[0].id,
    "ArrowDown did not move the active option");
  assert(opts[0].getAttribute("aria-selected") === "true", "the active option is not marked selected");
  key("ArrowDown", input); await tick();
  assert(input.getAttribute("aria-activedescendant") === opts[1].id, "ArrowDown did not advance");
  assert(opts[0].getAttribute("aria-selected") === "false", "two options are selected at once");
  key("ArrowUp", input); await tick();
  assert(input.getAttribute("aria-activedescendant") === opts[0].id, "ArrowUp did not go back");
  key("Escape", input); await tick();
  assert(input.getAttribute("aria-expanded") === "false", "Escape did not close the listbox");
});

step("choosing a result reaches the domain it came from", async () => {
  /* a reminder */
  let groups = await runSearch("Lantern festival");
  const rem = groups.find(g => g.id === "reminders");
  rem.items[0].open();
  await tick(60);
  assert(KOS.store.state.ui.view === "reminders", "a reminder result did not open Reminders");

  /* a spec point, which must land on the right topic */
  KOS.show("home"); await tick(30);
  groups = await runSearch("mnemonic");
  const note = groups.find(g => g.id === "notes");
  note.items[0].open();
  await tick(60);
  assert(KOS.store.state.ui.view === "ref", "a note result did not open its topic");
  assert(window.location.hash.indexOf("#/ref/compsci/") === 0,
    "the note opened the wrong topic: " + window.location.hash);

  /* a collection entry, which must land on the owning vault */
  KOS.show("home"); await tick(30);
  groups = await runSearch("Wandering Lantern 1");
  const media = groups.find(g => g.id === "media");
  assert(media, "the Collection returned nothing");
  media.items[0].open();
  await tick(80);
  assert(["anime", "books", "vn", "game"].indexOf(KOS.store.state.ui.view) !== -1,
    "a Collection result did not reach a vault (" + KOS.store.state.ui.view + ")");
  const ov = document.querySelector(".modal-ov");
  if (ov) ov.remove();
});

step("a query with no answer says what was searched", async () => {
  const input = document.getElementById("search");
  input.value = "zzzzqqqqxxxx";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick(150);
  const empty = document.querySelector("#search-results .sr-empty");
  assert(empty, "no zero-result state");
  const txt = empty.textContent.toLowerCase();
  for (const domain of ["collection", "reminders", "assignments", "calendar"]) {
    assert(txt.indexOf(domain) !== -1, "the empty state does not mention " + domain);
  }
  input.value = "";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick(60);
});

/* ---- the E+F seam ----
   Phase E's phone presenter MOVES this same #searchbox into a sheet. It
   used to close by intercepting the result click and the Enter key ahead
   of this controller, which raced it — and Enter lost: closing emptied
   the option list before `choose` could read it, so the sheet closed and
   nothing navigated. The controller announces the decision instead.
   These steps are the ones that would have caught it. */
step("one canonical search controller, two presentations", () => {
  const shell = src("js/modules/mobile-shell.js");
  const hub = src("js/modules/hub.js");
  /* moved, never cloned: the presenter must not build its own input or list */
  assert(/slot\.appendChild\(searchbox\)/.test(shell),
    "the phone sheet does not move the canonical search node into itself");
  assert(!/createElement\(["']input["']\)|el\(\s*["']input["']/.test(shell),
    "the phone shell builds a search input of its own — there must be exactly one");
  assert(/KOS\.hub\.dismissSearch\(\{ preserveQuery: true \}\)/.test(shell),
    "the presenter does not close through the canonical cancel seam");
  assert(/KOS\.hub\.onSearchChosen/.test(shell),
    "the presenter still races the controller instead of being told a result was chosen");
  assert(/dismissSearch: dismissSearch, onSearchChosen: onSearchChosen/.test(hub),
    "the controller does not expose exactly the two presenter seams");
  /* and the sheet must not still describe a specification-only search.
     A comment ABOUT retired copy is not the copy — strip comments first,
     the same rule the stylesheet assertions follow. */
  const shellCode = shell.replace(/\/\*[\s\S]*?\*\//g, "");
  assert(!/Find a topic/.test(shellCode),
    "the phone sheet still describes the box as finding a topic — Phase F made it eight domains");
});

step("dismissSearch retracts async, ARIA and selection state", async () => {
  const input = document.getElementById("search");
  const list = document.getElementById("search-results");
  input.value = "Lantern";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick(200);
  key("ArrowDown", input);
  await tick(20);
  assert(input.getAttribute("aria-activedescendant"), "setup: nothing was highlighted");
  assert(list.querySelectorAll('[role="option"]').length, "setup: no options");

  KOS.hub.dismissSearch({ preserveQuery: true });
  assert(input.getAttribute("aria-expanded") === "false", "the combobox still reports itself open");
  assert(!input.getAttribute("aria-activedescendant"),
    "aria-activedescendant still names an option that no longer exists");
  assert(!list.children.length, "the listbox was hidden rather than emptied");
  assert(input.value === "Lantern", "preserveQuery did not preserve the query");
  const counter = document.getElementById("search-count");
  assert(!counter.textContent, "the announced result count outlived the results");

  /* the sequence guard: an answer already in flight must not repaint */
  KOS.hub.dismissSearch();
  assert(input.value === "", "a plain dismiss should abandon the query");
  await tick(300);
  assert(!list.children.length && input.getAttribute("aria-expanded") === "false",
    "a stale asynchronous answer repainted the panel after it was dismissed");
});

step("the results panel is not trapped under the page", () => {
  /* #topbar carries backdrop-filter, which makes it a STACKING CONTEXT —
     so #search-results' own z-index could never lift it above #cols, and
     the panel rendered visible only in the gaps between the page's cards.
     The topbar has to be a positioned element on the shared scale for the
     panel's z-index to mean anything. Verified in Chrome by hit-testing
     five points down the open panel; asserted here as the rule that keeps
     it true. */
  assert(/#topbar \{[^}]*position: relative[^}]*z-index: var\(--z-topbar\)/.test(cssRules),
    "#topbar is not positioned, so its backdrop-filter traps the search results underneath the page");
  const scale = {};
  (cssRules.match(/--z-[a-z]+:\s*\d+/g) || []).forEach(d => {
    const [k, v] = d.split(":"); scale[k.trim()] = +v;
  });
  assert(scale["--z-topbar"] > scale["--z-stage"],
    "the topbar must sit above the stage it is chrome for");
  assert(scale["--z-topbar"] < scale["--z-menu"] && scale["--z-topbar"] < scale["--z-modal"],
    "the topbar must stay below menus and modals");
});

step("a slow vault answer cannot overwrite a newer keystroke", () => {
  const hubSrc = src("js/modules/hub.js");
  assert(/var mine = \+\+seq/.test(hubSrc) && /if \(mine !== seq\) return/.test(hubSrc),
    "the async search callback does not check that its query is still current");
});

/* ==================== F · TOUCH TARGETS ==================== */
console.log("== F · targets a finger can hit ==");

step("icon-only controls clear the visual floor, and 44 where the pointer is a finger", () => {
  assert(/\.icon-btn, \.mini-btn, \.xbtn, \.med-fav \{[\s\S]{0,200}min-height: max\(var\(--icon-btn-size-sm\), 32px\)/.test(cssRules),
    "the icon controls have no 32px visual floor");
  const coarse = cssRules.match(/@media \(pointer: coarse\) \{[\s\S]*?\n\}/g) || [];
  assert(coarse.some(b => /min-height: 44px/.test(b)),
    "no 44px target under pointer: coarse — which is what WCAG 2.5.5 is actually about");
});

step("calendar chips clear 24px with the spacing the exception requires", () => {
  assert(/\.cal-ev \{[^}]*min-height: 24px/.test(cssRules), "the calendar chip has no 24px floor");
  assert(/\.cal-cell \.cal-ev \+ \.cal-ev \{[^}]*margin-top/.test(cssRules),
    "chips are not spaced, so the 2.5.8 exception does not apply");
  /* and the reason 44 is not used here is recorded where the rule is */
  assert(/44px per chip would show one/.test(css) || /cannot give each chip 44px/.test(css),
    "the decision not to use 44px in a month cell is undocumented");
});

step("the four topic progress checks are a chip, not a 16px box", () => {
  assert(/label\.chk\.ts-chk \{[^}]*min-height: max\(var\(--control-h-sm\), 32px\)/.test(cssRules),
    "the progress checks lost their chip-sized hit area");
});

step("the skip link still reaches the content", () => {
  const skip = document.querySelector('a[href="#main"], .skip-link');
  assert(skip, "the skip link is gone");
  assert(main().getAttribute("tabindex") === "-1", "#main cannot receive focus");
});

/* ============ run ============ */
(async () => {
  let pass = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); pass++; }
    catch (e) { console.log("  FAIL " + name + "\n        " + e.message); process.exitCode = 1; }
  }
  if (errors.length) { console.log("\n  script errors:\n    " + errors.join("\n    ")); process.exitCode = 1; }
  console.log("\n" + (process.exitCode
    ? "SMOKE45 FAILED"
    : "SMOKE45 PASS — Category 7 Phase F accessibility, interaction and routing verified (" + pass + " steps)."));
  process.exit(process.exitCode || 0);
})();
