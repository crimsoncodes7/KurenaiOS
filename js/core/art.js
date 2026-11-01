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

  /* the art id each slot shows now, or null for its ground */
  var DESK = { compsci: "cs", cs: "cs", maths: "maths", it: "it", code: "code", ja: "ja", mind: "mind", creatives: "creatives" };
  var SPOT = { anime: "anime", books: "books", vn: "vn", games: "games" };
  function pick(slot, now) {
    var p = String(slot || "").split(":"), kind = p[0], arg = p[1];
    var G = KOS.governor;
    if (kind === "home") return "app.hero.home." + season(now);
    if (kind === "desk") return DESK[arg] ? "app.hero.desk." + DESK[arg] : null;
    if (kind === "page") return "app.hero.page." + arg;
    if (kind === "spot") return SPOT[arg] ? "app.spotlight." + SPOT[arg] : null;
    if (kind === "focus") return "app.focus." + ((G && G.scene && G.scene()) || "library");
    if (kind === "shrine") { var h = G && G.hall && G.hall(); return h ? "app.shrine." + h : null; }
    if (kind === "exam") return arg === "season" ? "app.exam.season" : "app.exam.room";
    if (kind === "empty") return "app.empty." + arg;
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
    var id = opts.id || pick(slot);
    if (!id) return null;
    var img = document.createElement("img");
    img.src = src(id); img.alt = ""; img.decoding = "async";
    if (!opts.eager) img.loading = "lazy";
    /* a picture that fails leaves the ground: nothing shifts */
    img.onerror = function () { wrap.remove(); };
    var wrap = document.createElement("span");
    wrap.className = "k-art";
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("data-ui", "art.layer");
    wrap.setAttribute("data-slot", String(slot).split(":")[0]);
    wrap.setAttribute("data-art-id", id);
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

  KOS.art = { on: on, apply: apply, set: set, prefs: ui, season: season, pick: pick, src: src, layer: layer, spot: spot, saveData: saveData };
})();
