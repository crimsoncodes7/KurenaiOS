/* Kurenai OS — modules/shrine.js
   祠 The Shrine (Build 3a) — the hall of fame, carried over from the old
   manga tracker but module-agnostic from day one: it works off ANY vault
   entry's favourite flag, whichever module it belongs to. Only Anime has
   real data this phase; Books/VN/Games entries will simply appear here the
   moment their modules land, no changes needed.                            */
(function () {
  "use strict";
  var el = KOS.ui.el;

  KOS.views.shrine = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: "祠" }), " The Shrine"]),
      el("p", { class: "sub", text: "Everything you've marked ♥, ranked by score — across every module of the Collection Matrix." })
    ]));

    if (!KOS.mediadb.available()) {
      main.appendChild(el("p", { class: "fc-empty", text: "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide." }));
      return;
    }

    KOS.mediadb.query({ favourite: true, sort: "score" }, function (err, favs) {
      if (err) { main.appendChild(el("p", { class: "fc-empty", text: "Could not read the vault: " + err.message })); return; }
      if (!favs.length) {
        main.appendChild(el("div", { class: "med-empty" }, [
          el("p", { class: "fc-empty", text: "The Shrine is empty. Tap the ♥ on any entry — anime, books, visual novels or games — and it takes its place here." }),
          el("div", { class: "lab-controls", style: "justify-content:center" }, [
            el("button", { class: "btn primary", text: "映 Open the Anime vault", onclick: function () { KOS.show("anime"); } })
          ])
        ]));
        return;
      }

      /* card border style (3j): a purchased Shrine cosmetic sets one class
         on the hall — the default look is the absence of it */
      var style = KOS.governor.shrineStyle && KOS.governor.shrineStyle();
      var hall = el("div", { class: "shrine-hall" + (style ? " " + style : "") });
      favs.forEach(function (e, i) {
        var mod = KOS.media.module(e.module);
        var card = el("div", { class: "shrine-card" + (i < 3 ? " top" : ""), role: "button", tabindex: "0",
          onclick: function () { KOS.mediaEditor(e, function () { KOS.show("shrine", undefined, { _nav: true }); }); },
          onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); KOS.mediaEditor(e, function () { KOS.show("shrine", undefined, { _nav: true }); }); } }
        }, [
          el("span", { class: "shrine-rank", text: String(i + 1) }),
          el("div", { class: "med-cover" }, [
            e.coverUrl
              ? el("img", { src: e.coverUrl, alt: "", loading: "lazy", decoding: "async" })
              : el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod.kanji })
          ]),
          el("div", { class: "shrine-body" }, [
            el("div", { class: "med-title", title: e.title, text: e.title }),
            el("div", { class: "med-meta" }, [
              el("span", { class: "med-chip", style: "--chip:" + (mod.accent || "#ef4965"), text: mod.label }),
              e.score ? el("span", { class: "med-score", text: "★ " + e.score }) : el("span", { class: "sub", text: "unrated" })
            ])
          ])
        ]);
        hall.appendChild(card);
      });
      main.appendChild(hall);
      main.appendChild(el("p", { class: "sub", style: "margin-top:10px", text: favs.length + (favs.length === 1 ? " enshrined title." : " enshrined titles.") }));
    });
  };
})();
