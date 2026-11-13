/* tools/lib/view-surfaces.js — every view, with the args that select a
   different page, and a recorder of what a view READS from the state
   document while it draws (W2: js/core/redraw.js declares each view's
   reads, and smoke139 holds the declaration to the recording).

     const SURF = require("./lib/view-surfaces");
     for (const [view, arg] of SURF) …
     await SURF.reads(app, view, arg)    → the top-level state keys read
                                           during the view's own render  */
"use strict";

const SURFACES = [
  ["home"],
  ["subject", "compsci"], ["subject", "maths"], ["subject", "it"], ["subject", "code"], ["subject", "ja"], ["subject", "mind"], ["subject", "creatives"],
  ["ref", { subject: "compsci", ref: "4.2.3.1" }], ["ref", { subject: "maths", ref: "5.7" }], ["ref", { subject: "it", ref: "F200.1.1" }],
  ["review"], ["due"], ["cardstats"], ["personaldeck"], ["assignments"], ["tracker"],
  ["exams"], ["exams", "readiness"], ["exams", "plan"], ["exams", "practice"], ["pacing"], ["pacing", { tab: "braid" }],
  ["code", { page: "map" }], ["code", { page: "skills" }], ["code", { page: "retrieval" }],
  ["japanese", { page: "path" }], ["japanese", { page: "kana" }], ["japanese", { page: "reviews" }], ["japanese", { page: "skills" }],
  ["mind", { page: "path" }], ["mind", { page: "journal" }], ["mind", { page: "positions" }],
  ["creatives", { page: "tracks" }], ["creatives", { page: "log" }], ["creatives", { page: "portfolio" }],
  ["focus"], ["reminders"], ["routines"], ["routines", "routines"], ["routines", "history"], ["routines", "settings"], ["calendar"],
  ["money"], ["money", "transactions"], ["money", "budgets"], ["money", "recurring"], ["money", "pots"], ["money", "month"],
  ["goals"], ["goals", "week"],
  ["matrix"], ["anime"], ["seasonal"], ["books"], ["mangaka"], ["vn"], ["game"], ["shrine"], ["wishlist"],
  ["mediasync"], ["aniprofile"], ["vndbprofile"],
  ["governor"], ["governor", "shop"], ["governor", "edit"], ["achievements"],
  ["assistant"], ["notifications"], ["data"], ["storage"], ["files"], ["pen"], ["connections"], ["help"],
  ["sims"], ["worked"], ["trace"], ["oop"], ["reports"]
];

/* The keys of KOS.store.state read between the start and the end of the
   view's own render function (the synchronous part: where a page reads the
   state it draws). The shell's own reads — the rail's counters, the HUD —
   happen outside it and are not the view's. */
async function reads(app, view, arg) {
  const { KOS } = app;
  const S = KOS.store.state;
  const seen = new Set();
  let on = false;
  const vals = {};
  const keys = Object.keys(S);
  keys.forEach((k) => {
    vals[k] = S[k];
    Object.defineProperty(S, k, { configurable: true, enumerable: true,
      get() { if (on) seen.add(k); return vals[k]; }, set(v) { vals[k] = v; } });
  });
  const real = KOS.views[view];
  KOS.views[view] = function () { on = true; try { return real.apply(this, arguments); } finally { on = false; } };
  if (real.reads) KOS.views[view].reads = real.reads;
  try { KOS.show(view, arg); } finally {
    KOS.views[view] = real;
    keys.forEach((k) => { Object.defineProperty(S, k, { configurable: true, enumerable: true, writable: true, value: vals[k] }); });
  }
  await app.settle();
  seen.delete("ui");
  return [...seen].sort();
}

module.exports = SURFACES;
module.exports.reads = reads;
