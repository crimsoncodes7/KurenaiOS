/* KurenaiOS — the painted art behind live content (roadmap 5.13, design turn 34k–34n).

   Every slot draws its picture through here: Home's hero, the subject desks,
   the vault Spotlights, the Focus stage, the Shrine's hall, the Exam Room.
   The picture is decoration: aria-hidden, no alt, never in the focus order,
   and it never carries text. Which picture a slot shows is a PURE READ of
   the date and the state (`pick`), never stored, so two devices agree.

   Per device (`state.ui.art`): `off` turns every slot to its ground, and
   `reduced` (on by default) does the same while the browser asks for Save-Data.
   Off, no picture is fetched at all and no word changes (`:root[data-art="off"]`). */
(function () {
  var KOS = window.KOS = window.KOS || {};
  var DIR = "assets/app/img/";

  function ui() {
    var s = KOS.store && KOS.store.state;
    if (!s) return {};
    s.ui = s.ui || {};
    if (!s.ui.art || typeof s.ui.art !== "object") s.ui.art = {};
    return s.ui.art;
  }
  function saveData() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return !!(c && c.saveData);
  }
  /* is painted art drawn on this device right now? */
  function on() {
    var u = ui();
    if (u.off) return false;
    if (u.reduced !== false && saveData()) return false;
    return true;
  }
  function apply() {
    var root = document.documentElement;
    if (on()) root.removeAttribute("data-art"); else root.setAttribute("data-art", "off");
  }
  function set(key, val) {
    ui()[key] = val;
    KOS.store && KOS.store.save && KOS.store.save();
    apply();
  }

  /* the season from the date alone: Dec–Feb winter, Mar–May spring,
     Jun–Aug summer, Sep–Nov autumn */
  function season(d) {
    var m = (d || new Date()).getMonth();
    return m === 11 || m < 2 ? "winter" : m < 5 ? "spring" : m < 8 ? "summer" : "autumn";
  }

  /* ================= rotation and your own pictures (roadmap 5.14, 34n) =================
     A slot's rule is synced like the theme (`state.artSlots[slot]`):
       {mode: "one" | "rotate" | "shuffle" | "own", pick, by: "time" | "condition",
        period: "day" | "week" | "season" | "tod", conds: {exam, weekend, streak: id}}.
     The picture of the moment is a PURE READ of the date and the state
     (Shuffle picks once per app open), so two devices agree. "own" is an
     uploaded picture, kept per device in the media kv (`art.own.<slot>`)
     and allowed only by its unlock (`upload-<area>` or `upload-all`). */
  var SLOTS = {
    home:   { name: "Home's hero",  area: "upload-home",   aspect: 21 / 9 },
    focus:  { name: "Focus scene",  area: "upload-focus",  aspect: 16 / 9 },
    shrine: { name: "Shrine hall",  area: "upload-shrine", aspect: 21 / 9 },
    banner: { name: "Profile banner", area: "upload-banner", aspect: 21 / 9 }
  };
  var SEASONS = ["winter", "spring", "summer", "autumn"];
  /* every picture a slot can show: the free ones and what you own */
  function pool(slot) {
    var G = KOS.governor, cat = G && G.catalog ? G.catalog() : [];
    function owned(kind) { return cat.filter(function (c) { return c.kind === kind && c.art && G.owns(c.id); }).map(function (c) { return { id: c.art, name: c.name, item: c.id }; }); }
    if (slot === "home") return SEASONS.map(function (x) { return { id: "app.hero.home." + x, name: x.charAt(0).toUpperCase() + x.slice(1) }; });
    if (slot === "focus") return owned("scene");
    if (slot === "shrine") return owned("hall");
    if (slot === "banner") return owned("banner").filter(function (x) { return /^app\.banner\./.test(x.id); });
    return [];
  }
  function cfgAll() {
    var st = KOS.store && KOS.store.state;
    if (!st) return {};
    if (!st.artSlots || typeof st.artSlots !== "object") st.artSlots = {};
    return st.artSlots;
  }
  function cfg(slot) { return cfgAll()[slot] || null; }
  function setCfg(slot, c) { cfgAll()[slot] = c; KOS.store.save(); }
  var own = {}, shuffleSeed = Math.floor(Math.random() * 1e6);
  function loadOwn(cb) {
    var keys = Object.keys(SLOTS), left = keys.length;
    if (!KOS.mediadb || !KOS.mediadb.getKV) { cb && cb(); return; }
    keys.forEach(function (k) {
      KOS.mediadb.getKV("art.own." + k, function (err, v) { if (!err && v && v.src) own[k] = v; if (!--left && cb) cb(); });
    });
  }
  function ownOf(slot) { return own[slot] || null; }
  function setOwn(slot, v, cb) {
    if (v) own[slot] = v; else delete own[slot];
    KOS.mediadb.setKV("art.own." + slot, v || null, function () { cb && cb(); });
  }
  function canUpload(slot) {
    var G = KOS.governor, area = SLOTS[slot] ? SLOTS[slot].area : "upload-" + slot;
    return !!(G && G.owns && (G.owns("upload-all") || G.owns(area)));
  }
  function dayNo(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function tod(d) { var h = d.getHours(); return h >= 6 && h < 12 ? 0 : h < 17 ? 1 : h < 21 ? 2 : 3; }
  /* the conditions that hold now, top first */
  function conditions(now) {
    var out = [];
    try { if (KOS.exams && KOS.exams.season && KOS.exams.season().on) out.push("exam"); } catch (e) { /* the hub may not be loaded */ }
    try {
      var st = KOS.sessions && KOS.sessions.streaks && KOS.sessions.streaks();
      if (st && [7, 14, 30, 100].indexOf(st.all) !== -1) out.push("streak");
    } catch (e) { /* no ledger yet */ }
    var wd = now.getDay();
    if (wd === 0 || wd === 6) out.push("weekend");
    return out;
  }
  /* the rule applied: the picture for a slot now, or undefined to use the default */
  function rotated(slot, now) {
    var c = cfg(slot);
    if (!c) return undefined;
    if (c.mode === "own") return ownOf(slot) && canUpload(slot) ? { own: ownOf(slot) } : undefined;
    var list = pool(slot);
    if (!list.length) return undefined;
    var ids = list.map(function (x) { return x.id; });
    if (c.mode === "one") return ids.indexOf(c.pick) !== -1 ? c.pick : undefined;
    if (c.mode === "shuffle") return ids[shuffleSeed % ids.length];
    if (c.by === "condition") {
      var held = conditions(now).filter(function (k) { return c.conds && c.conds[k] && ids.indexOf(c.conds[k]) !== -1; });
      if (held.length) return c.conds[held[0]];
    }
    var d = now || new Date(), i;
    if (c.period === "season" && slot === "home") return "app.hero.home." + season(d);
    if (c.period === "day") i = dayNo(d);
    else if (c.period === "week") i = Math.floor((dayNo(d) + 3) / 7);
    else if (c.period === "tod") i = tod(d);
    else i = SEASONS.indexOf(season(d));
    return ids[i % ids.length];
  }
  /* the words for "Now: …" */
  function explain(slot, now) {
    now = now || new Date();
    var c = cfg(slot) || {}, r = rotated(slot, now), list = pool(slot);
    var name = r && r.own ? "your own picture" : ((list.filter(function (x) { return x.id === (r || pick(slot, now)); })[0] || {}).name || "the default");
    if (c.mode === "own") return r ? "Now: your own picture." : "Now: the default; your own picture needs its unlock.";
    if (c.mode === "one") return "Now: " + name + ", always.";
    if (c.mode === "shuffle") return "Now: " + name + ", picked when the app opened.";
    if (c.by === "condition") {
      var held = conditions(now).filter(function (k) { return c.conds && c.conds[k]; });
      if (held.length) return "Now: " + name + " (" + ({ exam: "Exam Season", weekend: "the weekend", streak: "a streak milestone" })[held[0]] + ").";
    }
    return "Now: " + name + ", by " + ({ day: "the day", week: "the week", season: "the season", tod: "the time of day" })[c.period || "season"] + ". Read from the clock, so every device agrees.";
  }

  /* the art id each slot shows now, or null for its ground */
  var DESK = { compsci: "cs", cs: "cs", maths: "maths", it: "it", code: "code", ja: "ja", mind: "mind", creatives: "creatives" };
  var SPOT = { anime: "anime", books: "books", vn: "vn", games: "games" };
  function pick(slot, now) {
    var p = String(slot || "").split(":"), kind = p[0], arg = p[1];
    var G = KOS.governor;
    var r = SLOTS[kind] ? rotated(kind, now || new Date()) : undefined;
    if (r && r.own) return null;
    if (r) return r;
    if (kind === "home") return "app.hero.home." + season(now);
    if (kind === "desk") return DESK[arg] ? "app.hero.desk." + DESK[arg] : null;
    if (kind === "page") return "app.hero.page." + arg;
    if (kind === "spot") return SPOT[arg] ? "app.spotlight." + SPOT[arg] : null;
    if (kind === "focus") return "app.focus." + ((G && G.scene && G.scene()) || "library");
    if (kind === "shrine") { var h = G && G.hall && G.hall(); return h ? "app.shrine." + h : null; }
    if (kind === "exam") return arg === "season" ? "app.exam.season" : "app.exam.room";
    if (kind === "empty") return "app.empty." + arg;
    if (kind === "cover") return arg ? "app.cover.exam." + arg : null;
    return null;
  }
  function src(id) { return id ? DIR + id + ".webp" : null; }

  /* Put a slot's picture behind a host's content. The host is positioned
     and isolated by its own stylesheet; the layer sits at the back, its
     opacity and focal point from the slot's tokens (`data-slot`). Returns
     the layer, or null when the slot draws its ground. */
  function layer(host, slot, opts) {
    opts = opts || {};
    var old = host.querySelector(":scope > .k-art");
    if (old) old.remove();
    if (!on()) return null;
    var mine = SLOTS[String(slot)] && rotated(String(slot), new Date());
    var id = opts.id || pick(slot);
    if (!id && !(mine && mine.own)) return null;
    var img;
    if (mine && mine.own && KOS.imageCrop) img = KOS.imageCrop.image(mine.own.src, { alt: "", decoding: "async" }, mine.own.crop);
    else { img = document.createElement("img"); img.src = src(id); }
    img.alt = ""; img.decoding = "async";
    if (!opts.eager) img.loading = "lazy";
    /* a picture that fails leaves the ground: nothing shifts */
    img.onerror = function () { wrap.remove(); };
    var wrap = document.createElement("span");
    wrap.className = "k-art";
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("data-ui", "art.layer");
    wrap.setAttribute("data-slot", String(slot).split(":")[0]);
    wrap.setAttribute("data-art-id", id || "own");
    wrap.appendChild(img);
    host.insertBefore(wrap, host.firstChild);
    KOS.ui && KOS.ui.state && KOS.ui.state(host, "has-art", true);
    return wrap;
  }

  /* an empty state's spot: a keyed 1:1 picture beside (or above) the words */
  function spot(name, cls) {
    if (!on()) return null;
    var img = document.createElement("img");
    img.className = "k-art-spot" + (cls ? " " + cls : "");
    img.src = src("app.empty." + name); img.alt = ""; img.loading = "lazy"; img.decoding = "async";
    img.setAttribute("aria-hidden", "true");
    img.onerror = function () { img.remove(); };
    return img;
  }

  KOS.art = { on: on, apply: apply, set: set, prefs: ui, season: season, pick: pick, src: src, layer: layer, spot: spot, saveData: saveData,
    SLOTS: SLOTS, pool: pool, cfg: cfg, setCfg: setCfg, rotated: rotated, explain: explain, conditions: conditions,
    loadOwn: loadOwn, ownOf: ownOf, setOwn: setOwn, canUpload: canUpload };
})();
