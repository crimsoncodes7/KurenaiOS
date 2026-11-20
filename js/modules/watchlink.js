/* Kurenai OS — modules/watchlink.js
   Where you watch, read or play a title (1C, collection#1 and #2,
   decision D1): your own link on the record (`watchUrl`, `watchLabel`,
   normalised in mediadb, kept by every pull and merge and never pushed,
   invariant 13), and the title's own pages on AniList, MyAnimeList, VNDB
   and Steam from its ids. Each shows as the SERVICE'S ICON, not its name
   (the name is the link's accessible name and tooltip):
     - a bundled icon for the common services (assets/icons/services/,
       generated from the CC0 Simple Icons set by tools/gen_service_icons.mjs);
     - a monogram for any other site (its letter on a hue from its name);
     - or your own icon for a site, chosen in the editor: rasterised to a
       64 px PNG on the device and kept in media kv (`serviceIcons`), so no
       picture of yours is ever drawn as markup.
   No icon is ever fetched from the site itself (no favicons: CORS, offline).

   Used by medview: the card's hover row and the list row (the watch link),
   the editor's action row (the watch link and the provider pages) and its
   field (in the Shelf/ownership section, or Your layer), and the Spotlight. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;
  var DIR = "assets/icons/services/";

  /* slug|name|hosts — slug "-" has no bundled icon (a monogram). The first
     host that matches wins, so a narrower one comes before its parent. */
  var SERVICES = [
    "crunchyroll|Crunchyroll|crunchyroll.com", "netflix|Netflix|netflix.com", "youtube|YouTube|youtube.com youtu.be",
    "bilibili|Bilibili|bilibili.com bilibili.tv", "appletv|Apple TV|tv.apple.com", "plex|Plex|plex.tv", "twitch|Twitch|twitch.tv",
    "max|Max|max.com", "paramountplus|Paramount+|paramountplus.com", "channel4|Channel 4|channel4.com", "itvx|ITVX|itv.com itvx.com",
    "-|Prime Video|primevideo.com", "-|Disney+|disneyplus.com", "-|HIDIVE|hidive.com", "-|BBC iPlayer|bbc.co.uk",
    "rakutenkobo|Kobo|kobo.com", "webtoon|Webtoon|webtoons.com", "googleplay|Google Play|play.google.com", "goodreads|Goodreads|goodreads.com",
    "audible|Audible|audible.com audible.co.uk", "wattpad|Wattpad|wattpad.com", "tapas|Tapas|tapas.io", "pixiv|pixiv|pixiv.net",
    "mangaupdates|MangaUpdates|mangaupdates.com", "-|Kindle|read.amazon.com read.amazon.co.uk", "-|Amazon|amazon.com amazon.co.uk",
    "-|MangaDex|mangadex.org", "-|VIZ|viz.com", "-|BookWalker|bookwalker.jp", "-|J-Novel Club|j-novel.club",
    "steam|Steam|steampowered.com steamcommunity.com", "gogdotcom|GOG|gog.com", "epicgames|Epic Games|epicgames.com",
    "itchdotio|itch.io|itch.io", "playstation|PlayStation|playstation.com", "humblebundle|Humble|humblebundle.com",
    "battledotnet|Battle.net|battle.net", "-|Nintendo|nintendo.com nintendo.co.uk", "-|Xbox|xbox.com", "-|DLsite|dlsite.com",
    "anilist|AniList|anilist.co", "myanimelist|MyAnimeList|myanimelist.net", "kitsu|Kitsu|kitsu.app kitsu.io", "-|VNDB|vndb.org"
  ].map(function (row) { var p = row.split("|"); return { slug: p[0] === "-" ? null : p[0], name: p[1], hosts: p[2].split(" ") }; });
  var VERB = { anime: "Watch", books: "Read", vn: "Play", game: "Play" };

  function host(url) {
    try { var u = new URL(url); return /^https?:$/.test(u.protocol) ? u.hostname.toLowerCase().replace(/^www\./, "") : null; } catch (e) { return null; }
  }
  /* what a pasted address is: "crunchyroll.com/…" gains https:// */
  function clean(v) {
    var s = String(v == null ? "" : v).trim();
    if (s && !/^[a-z][a-z0-9+.-]*:/i.test(s) && /^[^\s/]+\.[^\s/]+/.test(s)) s = "https://" + s;
    return KOS.mediadb.normalise({ watchUrl: s }).watchUrl;
  }
  function service(url) {
    var h = host(url);
    if (!h) return null;
    for (var i = 0; i < SERVICES.length; i++) {
      var s = SERVICES[i];
      if (s.hosts.some(function (x) { return h === x || h.slice(-x.length - 1) === "." + x; })) return { slug: s.slug, name: s.name, host: h };
    }
    /* any other site: its own name, from the address */
    var parts = h.split(".").filter(function (p) { return !/^(m|app|play|store|read|watch|web)$/.test(p); });
    var core = parts.length > 2 && /^(co|com|org|net|ac)$/.test(parts[parts.length - 2]) ? parts[parts.length - 3] : parts[Math.max(0, parts.length - 2)];
    return { slug: null, name: core ? core.charAt(0).toUpperCase() + core.slice(1) : h, host: h };
  }

  /* your own icons, per site: loaded once from media kv */
  var custom = null, waiting = [];
  function customs(cb) {
    if (custom) { cb(custom); return; }
    waiting.push(cb);
    if (waiting.length > 1) return;
    KOS.mediadb.getKV("serviceIcons", function (err, v) {
      custom = !err && v && typeof v === "object" ? v : {};
      waiting.splice(0).forEach(function (f) { f(custom); });
    });
  }
  function hue(s) { var x = 0; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) % 360; return x; }
  function glyph(svc) {
    var dom = custom && custom[svc.host] ? el("img", { class: "k-svc-img", src: custom[svc.host], alt: "", decoding: "async" })
      : svc.slug ? el("img", { class: "k-svc-img", src: DIR + svc.slug + ".svg", alt: "", decoding: "async" })
      : el("span", { class: "k-svc-mono", text: (svc.name || "?").charAt(0).toUpperCase() });
    if (!dom.src) dom.style.setProperty("--svc-hue", String(hue(svc.name || svc.host || "")));
    return dom;
  }
  /* the icon, swapped for your own once media kv answers */
  function icon(svc) {
    var box = el("span", { class: "k-svc-ic", "data-ui": "svc.icon", "aria-hidden": "true" }, [glyph(svc)]);
    if (!custom) customs(function (c) { if (c[svc.host]) { box.innerHTML = ""; box.appendChild(glyph(svc)); } });
    return box;
  }
  function verb(e) { return VERB[e && e.module] || "Open"; }
  function label(e, svc) { return (e.watchLabel || (svc && svc.name) || "the link"); }

  /* one link out: an icon in a real link, its name for a screen reader */
  function anchor(href, svc, name, hook, size) {
    var a = el("a", { class: "k-svc-link", href: href, target: "_blank", rel: "noopener noreferrer", "data-ui": hook,
      "data-size": size || "md", title: name, "aria-label": name + " (opens in a new tab)" }, [icon(svc)]);
    a.addEventListener("click", function (ev) { ev.stopPropagation(); });
    return a;
  }
  /* your watch link, or null */
  function link(e, opts) {
    if (!e || !e.watchUrl) return null;
    var svc = service(e.watchUrl);
    if (!svc) return null;
    return anchor(e.watchUrl, svc, verb(e) + " on " + label(e, svc), "vault.watch", opts && opts.size);
  }
  /* the title's own pages, from its ids */
  function providers(e) {
    var x = (e && e.externalIds) || {}, kind = e && e.module === "anime" ? "anime" : "manga", out = [];
    if (x.anilistId) out.push(["https://anilist.co/" + kind + "/" + x.anilistId, "AniList"]);
    if (x.malId) out.push(["https://myanimelist.net/" + kind + "/" + x.malId, "MyAnimeList"]);
    if (x.vndbId) out.push(["https://vndb.org/" + (/^v/.test(String(x.vndbId)) ? x.vndbId : "v" + x.vndbId), "VNDB"]);
    if (x.steamAppId) out.push(["https://store.steampowered.com/app/" + x.steamAppId, "Steam"]);
    return out.map(function (p) { return anchor(p[0], service(p[0]), "Open on " + p[1], "vault.provider-link"); });
  }
  /* the editor's action row: the watch link, then the title's pages */
  function row(e) {
    var all = [link(e)].concat(providers(e)).filter(Boolean);
    return all.length ? el("div", { class: "k-cluster k-svc-row", "data-ui": "vault.links", role: "group", "aria-label": "Links" }, all) : null;
  }

  /* a picture of yours, made a 64 px PNG on the device */
  function rasterise(file, cb) {
    if (!file || !/^image\//.test(file.type || "") || file.size > 4 * 1024 * 1024) { cb(new Error("Choose a picture under 4 MB.")); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      try {
        var c = document.createElement("canvas"); c.width = c.height = 64;
        var g = c.getContext("2d"), k = Math.min(64 / img.naturalWidth, 64 / img.naturalHeight) || 1;
        var w = img.naturalWidth * k, h = img.naturalHeight * k;
        g.drawImage(img, (64 - w) / 2, (64 - h) / 2, w, h);
        URL.revokeObjectURL(url);
        cb(null, c.toDataURL("image/png"));
      } catch (e) { URL.revokeObjectURL(url); cb(e); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(new Error("That picture could not be read.")); };
    img.src = url;
  }
  function setCustom(h, png, cb) {
    customs(function (c) {
      var next = Object.assign({}, c);
      if (png) next[h] = png; else delete next[h];
      KOS.mediadb.setKV("serviceIcons", next, function (err) { if (!err) custom = next; cb && cb(err); });
    });
  }

  /* the editor's field: the address, what it shows as, and your own icon.
     Writes into the draft (editDraft's copy), so Cancel keeps nothing. */
  function field(e) {
    var v = verb(e).toLowerCase();
    var input = el("input", { type: "url", class: "k-input", "data-ui": "vault.watch-url", inputmode: "url", autocomplete: "off", spellcheck: "false",
      placeholder: "https://…", value: e.watchUrl || "", "aria-label": "Where I " + v + " it: its web address" });
    var name = el("input", { type: "text", class: "k-input", "data-ui": "vault.watch-label", maxlength: "60", value: e.watchLabel || "", "aria-label": "Shown as" });
    var preview = el("span", { class: "k-svc-preview", "data-ui": "vault.watch-preview" });
    var note = el("span", { class: "k-field-hint", "data-ui": "vault.watch-note" });
    var pick = el("input", { type: "file", accept: "image/*", hidden: "", "data-ui": "vault.watch-icon-file" });
    var mine = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "vault.watch-icon", onclick: function () { pick.click(); } });
    var drop = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "vault.watch-icon-clear", text: "Use the default icon", hidden: "" });
    function paint() {
      var raw = input.value.trim(), url = raw ? clean(raw) : null, svc = url ? service(url) : null;
      e.watchUrl = url; e.watchLabel = url && name.value.trim() ? name.value.trim().slice(0, 60) : null;
      preview.innerHTML = "";
      if (svc) preview.appendChild(icon(svc));
      name.placeholder = svc ? svc.name : "The site's name";
      note.textContent = raw && !url ? "That isn't a web address (it starts https://)." : svc ? "Shows as " + label(e, svc) + "'s icon." : "";
      KOS.ui.state(note, "bad", !!(raw && !url));
      mine.hidden = !svc; mine.textContent = svc && custom && custom[svc.host] ? "Change your icon for " + svc.host : "Your own icon for " + (svc ? svc.host : "this site");
      drop.hidden = !(svc && custom && custom[svc.host]);
    }
    pick.addEventListener("change", function () {
      var url = clean(input.value), svc = url && service(url), f = pick.files && pick.files[0];
      pick.value = "";
      if (!svc || !f) return;
      rasterise(f, function (err, png) {
        if (err) { KOS.ui.toast(err.message, true); return; }
        setCustom(svc.host, png, function (err2) { if (err2) KOS.ui.toast("The icon could not be kept.", true); else { KOS.ui.toast("Icon kept for " + svc.host + "."); paint(); } });
      });
    });
    drop.addEventListener("click", function () {
      var url = clean(input.value), svc = url && service(url);
      if (svc) setCustom(svc.host, null, function () { KOS.ui.toast("Back to the default icon for " + svc.host + "."); paint(); });
    });
    input.addEventListener("input", paint);
    name.addEventListener("input", paint);
    customs(paint);
    return el("div", { class: "k-field k-medit-wide k-svc-field", "data-ui": "ui.field vault.span-2 vault.watch-field" }, [
      el("span", { class: "k-field-label", "data-ui": "part.label", "aria-hidden": "true", text: "Where I " + v + " it" }),
      el("div", { class: "k-svc-in" }, [preview, input]),
      el("div", { class: "k-svc-more" }, [el("label", { class: "k-svc-as" }, [el("span", { class: "k-muted", text: "Shown as" }), name]), mine, drop, pick]),
      note
    ]);
  }

  KOS.watchLink = { SERVICES: SERVICES, service: service, clean: clean, icon: icon, link: link, providers: providers, row: row, field: field, rasterise: rasterise };
})();
