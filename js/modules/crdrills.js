/* Kurenai OS — modules/crdrills.js (KOS.crDrills)
   Graphic design's interactive drills (design 31o–31p, adapted to the app): no external app,
   no files. Each drill is a short BATCH of rounds made in the app, then one summary.
     kerning     space a word by eye; the font's own spacing is the reference, shown on Check
     pairing     a heading and a body face for a brief; the pairings that work and why
     hierarchy   fix a flat flyer's sizes and weights against five rules
     palette     background, text and accent with a live WCAG contrast check
     grid        put four blocks back on a 12-column grid
     measure     a paragraph's line length and leading into the comfortable range
   Pages: #/creatives/drills (the six) and #/creatives/drills/<type>[@<lesson>.<study>]. Opened
   from a study (the "@" part) the finished batch is saved as that study's work and goes to its
   check; otherwise "Save to Practice Log" is offered. A finished batch pays 6 XP once a day per
   drill type (KOS.creatives.logDrill, invariant 154). Every value reaches the page as a custom
   property; the stylesheet derives the colour, size or position from it.                    */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "creatives";
  function CR() { return KOS.creatives; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  /* a small deterministic generator, seeded by the drill and the day, so a batch is the same all day */
  function rng(seed) { var x = 2166136261; String(seed).split("").forEach(function (c) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); }); return function () { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 100000) / 100000; }; }
  function today() { return KOS.srs.todayISO(); }
  function pick(arr, n, r) { var a = arr.slice(), out = []; while (a.length && out.length < n) out.push(a.splice(Math.floor(r() * a.length), 1)[0]); return out; }

  var TYPES = [
    { id: "kerning", t: "Kerning by eye", what: "Even out the spaces between letters.", rounds: 3 },
    { id: "pairing", t: "Font pairing", what: "A heading and a body face for a brief.", rounds: 3 },
    { id: "hierarchy", t: "Hierarchy", what: "Make the important thing read first.", rounds: 2 },
    { id: "palette", t: "Palette and contrast", what: "Three colours that pass the contrast check.", rounds: 2 },
    { id: "grid", t: "Snap to the grid", what: "Put four blocks back on 12 columns.", rounds: 2 },
    { id: "measure", t: "Measure and leading", what: "A paragraph that is comfortable to read.", rounds: 1 }
  ];
  function type(id) { return TYPES.filter(function (x) { return x.id === id; })[0] || null; }

  /* ================= the page ================= */
  function page(main, id) {
    var bits = String(id || "").split("@"), tid = bits[0], ctx = bits[1] ? { lesson: bits[1].split(".").slice(0, 2).join("."), study: bits[1].split(".")[2] } : null;
    if (ctx && !CR().study(ctx.lesson, ctx.study)) ctx = null;
    var T = type(tid);
    if (!T) return index(main);
    var host = el("div", { class: "k-crd", "data-ui": "cr.drill", "data-drill": T.id });
    main.appendChild(host);
    run(host, T, ctx);
  }
  function index(main) {
    main.appendChild(el("div", { class: "k-crd-index", "data-ui": "cr.drills" }, TYPES.map(function (T) {
      var paid = !!CR().peek().paid["drill:" + T.id + ":" + today()];
      return el("button", { type: "button", class: "k-card k-crd-tile", "data-ui": "cr.drill-tile", onclick: function () { KOS.show("creatives", { page: "drills", id: T.id }); } }, [
        el("span", { class: "k-card-title", text: T.t }),
        el("span", { class: "k-muted", text: T.what }),
        el("span", { class: "k-crd-tile-foot" }, [el("span", { class: "k-mono k-muted", text: T.rounds + (T.rounds === 1 ? " round" : " rounds") }), paid ? el("span", { class: "k-cr-done", "data-tone": "done", text: "✓ today" }) : null].filter(Boolean))
      ]);
    })));
  }

  /* one batch: rounds of a drill, a running record, then the summary */
  function run(host, T, ctx) {
    var r = rng(T.id + "|" + today()), results = [], round = 0;
    var head = el("div", { class: "k-crd-head" });
    var stage = el("div", { class: "k-crd-stage" });
    host.appendChild(head); host.appendChild(stage);
    function paintHead() {
      head.innerHTML = "";
      head.appendChild(el("span", { class: "k-mono k-muted", text: round < T.rounds ? "Round " + (round + 1) + " of " + T.rounds : "Finished" }));
      if (ctx) head.appendChild(el("span", { class: "k-chip k-cr-chip", text: ctx.lesson + "·" + ctx.study }));
    }
    function next(res) {
      if (res) results.push(res);
      if (res) round++;
      paintHead();
      stage.innerHTML = "";
      if (round >= T.rounds) return finish();
      DRILLS[T.id](stage, r, round, next);
    }
    function finish() {
      var first = CR().logDrill(T.id, { lesson: ctx ? ctx.lesson : null, reps: results.length });
      var pay = first && KOS.governor && KOS.governor.lastAward ? KOS.governor.lastAward() : null;
      var good = results.filter(function (x) { return x.good; }).length;
      var text = T.t + " · " + today() + "\n\n" + results.map(function (x, i) { return (i + 1) + ". " + x.line; }).join("\n");
      var save = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.drill-save",
        text: ctx ? "Save and check" : "Save to Practice Log", onclick: function () {
          save.disabled = true;
          CR().addWork({ kind: "text", title: T.t + " · " + results.length + (results.length === 1 ? " round" : " rounds"), lesson: ctx ? ctx.lesson : null, study: ctx ? ctx.study : null, track: "design" }, { text: text }, function (wid) {
            KOS.show("creatives", ctx ? { page: "check", id: wid } : { page: "log", id: wid });
          });
        } });
      stage.appendChild(el("section", { class: "k-card k-crd-summary", "data-ui": "cr.drill-summary" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: good + " of " + results.length + " within range" }),
          el("span", { class: "k-card-meta", text: pay && pay.xp ? "+" + pay.xp + " XP" : "No reward · once a day per drill" })]),
        el("ol", { class: "k-crd-results" }, results.map(function (x) { return el("li", { "data-state": x.good ? "good" : null }, [el("span", { "aria-hidden": "true", text: x.good ? "✓" : "·" }), el("span", { text: x.line })]); })),
        el("div", { class: "k-cr-daily-go" }, [save,
          el("button", { type: "button", class: "k-btn", text: "Another batch", onclick: function () { results = []; round = 0; r = rng(T.id + "|" + today() + "|" + Date.now()); next(); } })])
      ]));
      announce(T.t + " finished: " + good + " of " + results.length + " within range.");
    }
    next();
  }
  /* the two buttons every round ends with: Check (shows the reference and the verdict), then Next */
  function roundFoot(onCheck, done) {
    var out = el("div", { class: "k-crd-verdict", "aria-live": "polite" });
    var checked = null;
    var btn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.drill-check", text: "Check" });
    btn.onclick = function () {
      if (checked) { done(checked); return; }
      checked = onCheck(out);
      btn.textContent = "Next ›";
      btn.setAttribute("data-ui", "cr.drill-next");
    };
    return { node: el("div", { class: "k-crd-foot" }, [out, btn]), out: out };
  }
  function verdict(out, good, title, lines) {
    out.innerHTML = "";
    out.appendChild(el("b", { "data-state": good ? "good" : "off", text: (good ? "✓ " : "") + title }));
    (lines || []).forEach(function (l) { out.appendChild(el("span", { class: "k-muted", text: l })); });
  }

  var DRILLS = {};

  /* ---------------- kerning: the type's own spacing is the reference ---------------- */
  var WORDS = ["AVATAR", "WAVY", "TOKYO", "LAYOUT", "FLY AWAY", "VOYAGE", "TRAVEL", "KAWAII"];
  DRILLS.kerning = function (stage, r, i, next) {
    var word = pick(WORDS, 3, rng("kw|" + today()))[i] || WORDS[i];
    var letters = word.split(""), off = letters.map(function (_, j) { return j < letters.length - 1 && letters[j] !== " " && letters[j + 1] !== " " ? (r() < 0.5 ? -1 : 1) * (60 + 10 * Math.floor(r() * 9)) : 0; });
    var line = el("div", { class: "k-crd-word", "aria-label": word, role: "img" });
    var ghost = el("div", { class: "k-crd-word k-crd-ghost", "aria-hidden": "true" }, letters.map(function (c) { return el("span", { class: "k-crd-l", text: c === " " ? " " : c }); }));
    function paint() {
      line.innerHTML = "";
      letters.forEach(function (c, j) { line.appendChild(el("span", { class: "k-crd-l", style: "--ls: " + (off[j] / 1000), text: c === " " ? " " : c })); });
    }
    var gaps = el("div", { class: "k-crd-gaps", role: "group", "aria-label": "Letter gaps" });
    letters.forEach(function (c, j) {
      if (j === letters.length - 1 || c === " " || letters[j + 1] === " ") return;
      var val = el("span", { class: "k-mono k-muted", text: "" });
      function show() { val.textContent = (off[j] > 0 ? "+" : "") + off[j]; }
      function step(d) { off[j] = Math.max(-200, Math.min(200, off[j] + d)); paint(); show(); }
      gaps.appendChild(el("div", { class: "k-crd-gap" }, [
        el("b", { text: c + letters[j + 1] }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Tighten " + c + letters[j + 1], text: "−", onclick: function () { step(-10); } }),
        val,
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Loosen " + c + letters[j + 1], text: "+", onclick: function () { step(10); } })
      ]));
      show();
    });
    paint();
    var foot = roundFoot(function (out) {
      var moved = off.filter(function (_, j) { return j < letters.length - 1 && letters[j] !== " " && letters[j + 1] !== " "; });
      var err = Math.round(moved.reduce(function (a, v) { return a + Math.abs(v); }, 0) / Math.max(1, moved.length));
      KOS.ui.state(stage, "reference", true);
      var good = err <= 25;
      verdict(out, good, good ? "Even spacing" : "Still uneven", ["Off by " + err + "/1000 em on average from the typeface's own spacing (the outline).", good ? "" : "Look at the widest and tightest gaps first."].filter(Boolean));
      return { good: good, line: word + ": off by " + err + "/1000 em" };
    }, next);
    stage.appendChild(el("section", { class: "k-card k-crd-board" }, [
      el("p", { class: "k-muted", text: "Make the spaces between the letters look even. Squint: it's the area between letters, not the distance." }),
      el("div", { class: "k-crd-wordwrap" }, [ghost, line]), gaps, foot.node]));
  };

  /* ---------------- pairing ---------------- */
  var FACES = { read: "Newsreader (serif)", ui: "Onest (sans)", kanji: "Shippori Mincho (display serif)", hand: "Klee One (handwritten)", mono: "JetBrains Mono (mono)" };
  var BRIEFS = [
    { t: "A ghost-story light novel cover", h: "The House on Kurayami Hill", b: "Every room was quiet. Then the piano upstairs began to play.", good: [["kanji", "read"], ["kanji", "ui"], ["read", "read"]],
      why: "A high-contrast serif carries the old, uneasy mood; a calm serif or plain sans keeps the blurb easy to read." },
    { t: "A café menu", h: "Morning Menu", b: "Matcha latte · Melon bread · Toast with honey butter", good: [["hand", "ui"], ["read", "ui"], ["ui", "ui"]],
      why: "A friendly heading (handwritten or warm serif) sets the tone; a clean sans keeps prices and items quick to scan." },
    { t: "A study app's settings screen", h: "Notifications", b: "Remind me 10 minutes before each study block.", good: [["ui", "ui"], ["ui", "read"]],
      why: "Interfaces want one sturdy sans for both, with weight doing the work; personality fonts fight small sizes." },
    { t: "A school festival poster", h: "Bunkasai 2027", b: "Saturday 14 June · Main hall · Live bands, food stalls, the haunted classroom.", good: [["kanji", "ui"], ["hand", "ui"], ["ui", "read"]],
      why: "One loud face for the title, one quiet face for the details: two loud faces shout over each other." },
    { t: "A programming blog", h: "Why my loop never ended", b: "I forgot to change i. Here's the fix, and how to spot it next time.", good: [["ui", "read"], ["mono", "ui"], ["read", "read"]],
      why: "A mono heading can hint at code, but long text in mono is tiring; a reading serif or sans carries the body." }
  ];
  DRILLS.pairing = function (stage, r, i, next) {
    var B = pick(BRIEFS, 3, rng("pb|" + today()))[i];
    var choice = { h: "ui", b: "ui" };
    var prev = el("div", { class: "k-crd-preview", "data-ui": "cr.pair-preview" });
    function paint() {
      prev.innerHTML = "";
      prev.appendChild(el("h3", { class: "k-crd-face", "data-face": choice.h, text: B.h }));
      prev.appendChild(el("p", { class: "k-crd-face", "data-face": choice.b, "data-role": "body", text: B.b }));
    }
    function picker(role, label, opts) {
      return el("div", { class: "k-crd-pick", role: "radiogroup", "aria-label": label }, [el("span", { class: "k-kicker", text: label })].concat(opts.map(function (f) {
        var b = el("button", { type: "button", class: "k-crd-opt", "data-face": f, role: "radio", "aria-checked": String(choice[role] === f), text: FACES[f], onclick: function () {
          choice[role] = f; [].forEach.call(b.parentNode.querySelectorAll("[role=radio]"), function (x) { x.setAttribute("aria-checked", String(x === b)); }); paint();
        } });
        return b;
      })));
    }
    paint();
    var foot = roundFoot(function (out) {
      var good = B.good.some(function (p) { return p[0] === choice.h && p[1] === choice.b; });
      var clash = choice.h !== "ui" && choice.h !== "read" && choice.b !== "ui" && choice.b !== "read";
      verdict(out, good, good ? "A pairing that works" : clash ? "Two loud faces" : "It can work, but…", [B.why, "Pairings that work: " + B.good.map(function (p) { return FACES[p[0]].split(" (")[0] + " + " + FACES[p[1]].split(" (")[0]; }).join(" · ")]);
      return { good: good, line: B.t + ": " + FACES[choice.h].split(" (")[0] + " + " + FACES[choice.b].split(" (")[0] };
    }, next);
    stage.appendChild(el("section", { class: "k-card k-crd-board" }, [
      el("p", {}, [el("b", { text: "Brief: " }), B.t]),
      el("div", { class: "k-crd-two" }, [el("div", { class: "k-crd-col" }, [picker("h", "Heading", ["kanji", "read", "ui", "hand", "mono"]), picker("b", "Body", ["read", "ui", "hand", "mono"])]), prev]),
      foot.node]));
  };

  /* ---------------- hierarchy ---------------- */
  var FLYERS = [
    [["title", "Art Club Open Day"], ["sub", "Draw with us for an afternoon"], ["when", "Wednesday 3:30 pm"], ["where", "Room B12"], ["more", "Pencils and paper provided. No experience needed. Bring a friend."]],
    [["title", "Lost: one grey cat"], ["sub", "Answers to Mochi"], ["when", "Missing since Sunday"], ["where", "Near the station"], ["more", "Very friendly, small white patch on his chest. Please call if you see him."]],
    [["title", "Late Night Library"], ["sub", "Revision with snacks"], ["when", "Every Thursday until 9 pm"], ["where", "Second floor"], ["more", "Quiet zones, group tables and free tea. Bring your own headphones."]]
  ];
  DRILLS.hierarchy = function (stage, r, i, next) {
    var F = pick(FLYERS, 2, rng("hf|" + today()))[i];
    var set = {}; F.forEach(function (e) { set[e[0]] = { size: 3, bold: false }; });
    var flyer = el("div", { class: "k-crd-flyer", "data-ui": "cr.flyer" });
    function paint() {
      flyer.innerHTML = "";
      F.forEach(function (e) { flyer.appendChild(el("div", { class: "k-crd-fl", "data-size": String(set[e[0]].size), "data-bold": set[e[0]].bold ? "" : null, text: e[1] })); });
    }
    var controls = el("div", { class: "k-crd-ctrls" }, F.map(function (e) {
      var s = set[e[0]], lbl = el("span", { class: "k-mono", text: "" });
      function show() { lbl.textContent = ["", "XS", "S", "M", "L", "XL"][s.size]; }
      var bold = el("button", { type: "button", class: "k-crd-opt", "aria-pressed": "false", text: "Bold", onclick: function () { s.bold = !s.bold; bold.setAttribute("aria-pressed", String(s.bold)); paint(); } });
      show();
      return el("div", { class: "k-crd-ctrl" }, [el("span", { class: "k-crd-ctrl-t", text: e[1] }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Smaller: " + e[1], text: "−", onclick: function () { s.size = Math.max(1, s.size - 1); show(); paint(); } }), lbl,
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Larger: " + e[1], text: "+", onclick: function () { s.size = Math.min(5, s.size + 1); show(); paint(); } }), bold]);
    }));
    paint();
    var foot = roundFoot(function (out) {
      var sizes = F.map(function (e) { return set[e[0]].size; }), t = set.title.size;
      var rules = [
        ["The title is the largest thing", F.every(function (e) { return e[0] === "title" || set[e[0]].size < t; })],
        ["When and where beat the details", set.when.size > set.more.size && set.where.size > set.more.size],
        ["Three sizes or fewer", Object.keys(sizes.reduce(function (a, v) { a[v] = 1; return a; }, {})).length <= 3],
        ["Bold on two things at most", F.filter(function (e) { return set[e[0]].bold; }).length <= 2],
        ["The details stay readable (not the smallest step)", set.more.size >= 2]
      ];
      var good = rules.every(function (x) { return x[1]; });
      out.innerHTML = "";
      out.appendChild(el("b", { "data-state": good ? "good" : "off", text: good ? "✓ It reads in order" : rules.filter(function (x) { return !x[1]; }).length + " to fix" }));
      out.appendChild(el("ul", { class: "k-crd-rules" }, rules.map(function (x) { return el("li", { "data-state": x[1] ? "good" : null }, [x[1] ? "✓ " : "· ", x[0]]); })));
      return { good: good, line: F[0][1] + ": " + rules.filter(function (x) { return x[1]; }).length + " of 5 rules" };
    }, next);
    stage.appendChild(el("section", { class: "k-card k-crd-board" }, [
      el("p", { class: "k-muted", text: "Everything is the same size. Make the eye go title, then when and where, then the rest." }),
      el("div", { class: "k-crd-two" }, [controls, flyer]), foot.node]));
  };

  /* ---------------- palette: WCAG contrast from oklch ---------------- */
  function lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function oklchToRgb(L, C, H) {
    var a = C * Math.cos(H * Math.PI / 180), b = C * Math.sin(H * Math.PI / 180);
    var l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3), m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3), s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    var rgb = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
    return rgb.map(function (v) { v = Math.max(0, Math.min(1, v)); return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055; });
  }
  function luminance(rgb) { return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]); }
  function contrast(x, y) { var a = luminance(oklchToRgb(x.l, x.c, x.h)), b = luminance(oklchToRgb(y.l, y.c, y.h)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
  var PAL_BRIEFS = ["A calm study app", "A night-time festival poster", "A spring café menu", "A horror game's title screen"];
  DRILLS.palette = function (stage, r, i, next) {
    var brief = pick(PAL_BRIEFS, 2, rng("pp|" + today()))[i];
    var sw = { bg: { l: 0.55, c: 0.03, h: Math.round(r() * 360) }, fg: { l: 0.62, c: 0.03, h: Math.round(r() * 360) }, ac: { l: 0.6, c: 0.14, h: Math.round(r() * 360) } };
    var card = el("div", { class: "k-crd-pal", "data-ui": "cr.palette-preview" }, [el("b", { text: brief }), el("p", { text: "This line is your text colour on your background." }), el("span", { class: "k-crd-pal-ac", text: "Accent button" })]);
    var live = el("div", { class: "k-crd-pal-live", "aria-live": "polite" });
    var row = el("div", { class: "k-crd-two k-crd-palrow" });
    function paint() {
      ["bg", "fg", "ac"].forEach(function (k) { row.style.setProperty("--" + k + "-l", sw[k].l); row.style.setProperty("--" + k + "-c", sw[k].c); row.style.setProperty("--" + k + "-h", sw[k].h); });
      var t = contrast(sw.fg, sw.bg), a = contrast(sw.ac, sw.bg);
      live.innerHTML = "";
      live.appendChild(el("span", { "data-state": t >= 4.5 ? "good" : null, text: "Text " + t.toFixed(1) + " : 1" + (t >= 4.5 ? " ✓" : " (needs 4.5)") }));
      live.appendChild(el("span", { "data-state": a >= 3 ? "good" : null, text: "Accent " + a.toFixed(1) + " : 1" + (a >= 3 ? " ✓" : " (needs 3)") }));
      return { t: t, a: a };
    }
    function slider(k, prop, label, min, max, stepv) {
      var inp = el("input", { type: "range", class: "k-crd-range", min: String(min), max: String(max), step: String(stepv), "aria-label": label });
      inp.value = String(sw[k][prop]);
      inp.oninput = function () { sw[k][prop] = +inp.value; paint(); };
      return el("label", { class: "k-crd-slider" }, [el("span", { text: label.split(" · ")[1] }), inp]);
    }
    var ctrls = el("div", { class: "k-crd-col" }, [["bg", "Background"], ["fg", "Text"], ["ac", "Accent"]].map(function (x) {
      return el("div", { class: "k-crd-swrow" }, [el("span", { class: "k-crd-sw", "data-sw": x[0], "aria-hidden": "true" }), el("b", { text: x[1] }),
        slider(x[0], "l", x[1] + " · Lightness", 0.1, 0.98, 0.01), slider(x[0], "h", x[1] + " · Hue", 0, 359, 1)]);
    }));
    row.appendChild(ctrls); row.appendChild(el("div", { class: "k-crd-col" }, [card, live]));
    paint();
    var foot = roundFoot(function (out) {
      var c = paint(), good = c.t >= 4.5 && c.a >= 3;
      verdict(out, good, good ? "Passes the contrast check" : "Not enough contrast yet", ["Text needs 4.5 : 1 against the background, and a button 3 : 1 (WCAG AA)."]);
      return { good: good, line: brief + ": text " + c.t.toFixed(1) + ", accent " + c.a.toFixed(1) };
    }, next);
    stage.appendChild(el("section", { class: "k-card k-crd-board" }, [el("p", { class: "k-muted", text: "Build three colours for the brief. The check is live." }), row, foot.node]));
  };

  /* ---------------- grid ---------------- */
  var BLOCKS = [["Title", 0], ["Picture", 1], ["Text", 2], ["Button", 3]];
  DRILLS.grid = function (stage, r, i, next) {
    var pos = BLOCKS.map(function (b, j) { var w = 3 + Math.floor(r() * 6); var x = Math.round((r() * (12 - w)) * 4) / 4; if (x === Math.round(x)) x += 0.25 + 0.5 * Math.floor(r() * 2); return { x: Math.min(12 - w, x), w: w - (j % 2 ? 0.25 : 0) }; });
    var sel = 0;
    var board = el("div", { class: "k-crd-grid", "data-ui": "cr.grid-board" });
    function paint() {
      board.innerHTML = "";
      for (var c = 0; c < 12; c++) board.appendChild(el("span", { class: "k-crd-col12", style: "--x: " + c, "aria-hidden": "true" }));
      pos.forEach(function (p, j) {
        board.appendChild(el("button", { type: "button", class: "k-crd-block", style: "--x: " + p.x + "; --w: " + p.w + "; --y: " + j,
          "aria-pressed": String(j === sel), "data-state": p.x === Math.round(p.x) && p.w === Math.round(p.w) ? "on" : null, text: BLOCKS[j][0],
          onclick: function () { sel = j; paint(); } }));
      });
    }
    function mv(dx, dw) { var p = pos[sel]; p.w = Math.max(1, Math.min(12, p.w + dw)); p.x = Math.max(0, Math.min(12 - p.w, p.x + dx)); paint(); }
    var ctrls = el("div", { class: "k-crd-gridctl", role: "group", "aria-label": "Move the selected block" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", text: "‹ Left", onclick: function () { mv(-0.25, 0); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm", text: "Right ›", onclick: function () { mv(0.25, 0); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm", text: "Narrower", onclick: function () { mv(0, -0.25); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm", text: "Wider", onclick: function () { mv(0, 0.25); } })
    ]);
    paint();
    var foot = roundFoot(function (out) {
      var on = pos.filter(function (p) { return p.x === Math.round(p.x) && p.w === Math.round(p.w); }).length;
      var lefts = {}; pos.forEach(function (p) { lefts[p.x] = 1; });
      var good = on === pos.length;
      verdict(out, good, good ? "Every block is on the grid" : on + " of " + pos.length + " on the grid", [Object.keys(lefts).length <= 2 ? "Shared left edges: the layout looks deliberate." : "Try lining more blocks up on the same left edge."]);
      return { good: good, line: "Grid " + (i + 1) + ": " + on + " of " + pos.length + " blocks on the grid" };
    }, next);
    stage.appendChild(el("section", { class: "k-card k-crd-board" }, [el("p", { class: "k-muted", text: "Pick a block, then move and resize it until both edges sit on column lines." }), board, ctrls, foot.node]));
  };

  /* ---------------- measure and leading ---------------- */
  var PARA = "The train was late again, so Haruka stood at the edge of the platform and watched the leaves blow along the tracks. She checked her phone twice. Ten minutes. A man beside her ate a rice ball very slowly, as if he had all the time in the world, and she found herself wishing she did too. When the train finally came round the bend, the whole platform stepped forward at once.";
  DRILLS.measure = function (stage, r, i, next) {
    var v = { w: 105, lh: 1.05 };
    var para = el("p", { class: "k-crd-para", text: PARA });
    var read = el("span", { class: "k-mono k-muted" });
    function paint() { para.style.setProperty("--mw", v.w); para.style.setProperty("--lh", v.lh); read.textContent = "≈ " + v.w + " characters a line · leading " + v.lh.toFixed(2); }
    function slider(k, label, min, max, st) {
      var inp = el("input", { type: "range", class: "k-crd-range", min: String(min), max: String(max), step: String(st), "aria-label": label });
      inp.value = String(v[k]); inp.oninput = function () { v[k] = +inp.value; paint(); };
      return el("label", { class: "k-crd-slider" }, [el("span", { text: label }), inp]);
    }
    paint();
    var foot = roundFoot(function (out) {
      var good = v.w >= 45 && v.w <= 75 && v.lh >= 1.35 && v.lh <= 1.7;
      verdict(out, good, good ? "Comfortable to read" : "Not quite", ["Body text reads best at about 45–75 characters a line, with leading around 1.4–1.6."]);
      return { good: good, line: v.w + " characters, leading " + v.lh.toFixed(2) };
    }, next);
    stage.appendChild(el("section", { class: "k-card k-crd-board" }, [
      el("div", { class: "k-crd-two" }, [slider("w", "Line length", 25, 120, 1), slider("lh", "Leading", 1, 2.2, 0.05)]), read,
      el("div", { class: "k-crd-parabox" }, [para]), foot.node]));
  };

  KOS.crDrills = { TYPES: TYPES, page: page, type: type, contrast: contrast, oklchToRgb: oklchToRgb };
})();
