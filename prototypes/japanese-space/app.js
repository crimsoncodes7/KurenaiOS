/* The Japanese space vertical slice: desk, lessons, sessions, reviews, kana chart and path.
   State in localStorage (the real space uses state.japanese, plan §8). Throwaway slice code. */
(function () {
  "use strict";
  var JA = window.JA, S = JA.srs, X = JA.ex, el = X.el;
  S.produces = JA.produces;
  var KEY = "ja-slice-v1";
  var main = document.getElementById("main"), live = document.getElementById("live");

  // ---------- state ----------
  function blank() { return { v: 1, facets: {}, lessons: {}, log: [], offset: 0, furigana: "unknown", daily: 40, input: {} }; }
  var st = (function () { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return blank(); } })();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function today() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5) + st.offset; }
  function announce(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }

  // mastery-driven furigana: a kanji's reading is "known" once its R facet is stable enough
  function known(kanji) { var f = st.facets["j:" + kanji + "|R"]; return !!(f && f.s >= 7); }
  function ruby(t) { return X.ruby(t, known, st.furigana); }

  /* Record a result: derive the grade, review the facet, unlock new facets, log it (never self-reported). */
  function record(ex, res) {
    var day = today();
    if (res.skipped) { // not a review: no grade, no log of an answer; the facet waits until tomorrow
      if (st.facets[ex.id]) { st.facets[ex.id] = Object.assign({}, st.facets[ex.id], { due: day + 1 }); save(); }
      return null;
    }
    st.log.push({ day: day, id: ex.id, kind: ex.kind, verdict: res.verdict, ms: res.ms, hints: res.hints, self: !!res.selfMarked });
    if (st.log.length > 2000) st.log.shift();
    if (!st.facets[ex.id]) return null; // practice items (minimal pairs) are logged, not scheduled
    var g = S.gradeOf(res, ex.targetMs);
    st.facets[ex.id] = Object.assign(S.review(st.facets[ex.id], g, day), { isNew: false });
    st.facets = S.unlock(st.facets, S.split(ex.id).item, day);
    save();
    return { grade: g, next: st.facets[ex.id].due - day };
  }

  // ---------- derived figures (never stored) ----------
  function itemsIntroduced(kind) { var seen = {}; Object.keys(st.facets).forEach(function (k) { var it = S.split(k).item; if (!kind || it.split(":")[0] === kind) seen[it] = 1; }); return Object.keys(seen); }
  function stableCount(skill, kind) {
    return Object.keys(st.facets).filter(function (k) { var p = S.split(k), f = st.facets[k]; return p.skill === skill && (!kind || p.item.split(":")[0] === kind) && f.reps && f.s >= S.STABLE; }).length;
  }
  function lessonDone(id) { return !!(st.lessons[id] && st.lessons[id].doneAt != null); }
  function activeDays() { var d = {}; st.log.forEach(function (l) { d[l.day] = 1; }); return Object.keys(d).length; }

  function plan() {
    var day = today(), q = S.queue(st.facets, day);
    var revMin = q.reduce(function (a, k) { return a + S.SECS[S.split(k).skill]; }, 0) / 60;
    var budget = S.newBudget(st.facets, day, { dailyMin: st.daily });
    var next = JA.lessons.filter(function (l) { return !lessonDone(l.id); })[0];
    return { day: day, queue: q, reviewMin: Math.ceil(revMin), next: next, newOk: budget.newItems > 0 || !Object.keys(st.facets).length,
      total: Math.min(st.daily, Math.ceil(revMin) + (next ? next.mins : 0) + 8 + 5) };
  }

  // ---------- router ----------
  var routes = {};
  function go(h) { location.hash = h; }
  window.addEventListener("hashchange", draw);
  function draw() {
    var h = location.hash.replace(/^#\/?/, "") || "desk";
    var parts = h.split("/"), view = routes[parts[0]] || routes.desk;
    document.querySelectorAll(".rail a").forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("href") === "#/" + parts[0]); if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "page"); });
    main.innerHTML = "";
    view(main, parts.slice(1));
    main.focus({ preventScroll: true }); window.scrollTo(0, 0);
  }

  function header(title, sub, actions) {
    return el("header", { class: "ph" }, [el("div", {}, [el("h1", { text: title }), sub ? el("div", { class: "sub", text: sub }) : null]), actions ? el("div", { class: "ph-act" }, actions) : null]);
  }

  // ---------- the desk ----------
  routes.desk = function (m) {
    var p = plan(), sk = S.skills(st.facets);
    m.appendChild(header("Japanese", "Day " + (activeDays() || 1) + " · about " + p.total + " minutes today", [el("a", { class: "btn", href: "#/settings", text: "Settings" })]));
    var blocks = [
      { t: "Reviews", n: p.queue.length ? p.queue.length + " due" : "None due", m: p.reviewMin, go: p.queue.length ? "#/review" : null, why: p.queue.length ? "Due facets, most overdue first, skills interleaved." : "Nothing is due yet — new material first." },
      { t: "New", n: p.next ? p.next.title : "All slice lessons done", m: p.next ? p.next.mins : 0, go: p.next ? "#/lesson/" + p.next.id : null, why: p.next ? (p.newOk ? (p.next.sub || "Stage " + p.next.stage) : "Reviews are heavy today: new material shrinks, input stays.") : "" },
      { t: "Input", n: lessonDone("1.1") ? "In the café (graded passage)" : "Unlocks with lesson 1.1's words", m: 8, go: "#/read", why: "Read and listen. Furigana show only on kanji you have not made stable." },
      { t: "Output", n: "Listening pairs and speaking", m: 5, go: "#/session/output", why: "Minimal pairs (おばさん / おばあさん) and words to say aloud." }
    ];
    var today = el("section", { class: "card today", "aria-labelledby": "t-h" }, [
      el("div", { class: "today-head" }, [el("h2", { id: "t-h", text: "Today" }), el("span", { class: "muted", text: "≈ " + p.total + " of " + st.daily + " min" })]),
      el("div", { class: "blocks" }, blocks.map(function (b) {
        return el(b.go ? "a" : "div", { class: "block" + (b.go ? "" : " off"), href: b.go }, [
          el("div", { class: "b-t" }, [el("b", { text: b.t }), b.m ? el("span", { class: "muted", text: "≈ " + b.m + " min" }) : null]),
          el("div", { class: "b-n", text: b.n }), el("div", { class: "b-why muted", text: b.why })
        ]);
      }))
    ]);
    var left = el("div", { class: "col" }, [today, pathStrip(), lessonsCard()]);
    var right = el("div", { class: "col side" }, [radar(sk), weekCard(), devCard()]);
    m.appendChild(el("div", { class: "desk" }, [left, right]));
  };

  function lessonsCard() {
    return el("section", { class: "card", "aria-labelledby": "l-h" }, [
      el("h2", { id: "l-h", text: "Lessons in this slice" }),
      el("ul", { class: "lessons" }, JA.lessons.map(function (l) {
        var done = lessonDone(l.id);
        return el("li", {}, [el("a", { href: "#/lesson/" + l.id }, [
          el("span", { class: "stage", lang: "ja", "aria-hidden": "true", text: l.stage === 0 ? "仮" : "基" }),
          el("span", { class: "l-t" }, [el("b", { text: l.title }), el("span", { class: "muted" }, [l.stage === 0 ? "Stage 0 · Kana" : "Stage 1 · Foundations", l.sub ? " · " : null, l.sub ? el("span", { lang: "ja", text: l.sub }) : null])]),
          done ? el("span", { class: "chip done", text: "✓ Done" }) : el("span", { class: "chip", text: "≈ " + l.mins + " min" })
        ])]);
      }))
    ]);
  }

  /* R/W/L/S radar: each axis is the share of started facets that are stable; the count is printed beside it. */
  function radar(sk) {
    var names = { R: "Reading", W: "Writing", L: "Listening", S: "Speaking" }, order = ["R", "L", "S", "W"];
    var any = order.some(function (s) { return sk[s].started; });
    var size = 220, c = size / 2, rad = 78;
    var pt = function (i, f) { var a = -Math.PI / 2 + i * Math.PI / 2; return [c + Math.cos(a) * rad * f, c + Math.sin(a) * rad * f]; };
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", "0 0 " + size + " " + size); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", order.map(function (s) { return names[s] + " " + sk[s].stable + " stable of " + sk[s].started; }).join(", "));
    [0.33, 0.66, 1].forEach(function (f) {
      var g = document.createElementNS(ns, "polygon"); g.setAttribute("points", order.map(function (_, i) { return pt(i, f).join(","); }).join(" ")); g.setAttribute("class", "grid"); svg.appendChild(g);
    });
    if (any) {
      var poly = document.createElementNS(ns, "polygon");
      poly.setAttribute("points", order.map(function (s, i) { var f = sk[s].started ? Math.max(0.06, sk[s].stable / sk[s].started) : 0; return pt(i, f).join(","); }).join(" "));
      poly.setAttribute("class", "area"); svg.appendChild(poly);
    }
    order.forEach(function (s, i) { var p2 = pt(i, 1.24), t = document.createElementNS(ns, "text"); t.setAttribute("x", p2[0]); t.setAttribute("y", p2[1] + 4); t.setAttribute("text-anchor", "middle"); t.textContent = s; svg.appendChild(t); });
    return el("section", { class: "card radar", "aria-labelledby": "r-h" }, [
      el("h2", { id: "r-h", text: "Four skills" }),
      any ? svg : el("p", { class: "muted", text: "Each skill fills in as its reviews hold. Nothing to show before your first lesson." }),
      any ? el("dl", { class: "sk-list" }, order.map(function (s) {
        return el("div", {}, [el("dt", {}, [el("span", { class: "sk sk-" + s, text: s }), " " + names[s]]), el("dd", { text: sk[s].started ? sk[s].stable + " stable · " + sk[s].started + " started" : "not started" })]);
      })) : null
    ]);
  }

  /* The media path (plan §10.2): requirements as meters; a date only once there is enough data. */
  function pathStrip() {
    var R = stableCount("R", "w"), L = stableCount("L", "w"), kana = stableCount("R", "k"), kanji = stableCount("R", "j");
    var have = { R: R, L: L, kana: kana, kanji: kanji };
    var days = activeDays();
    var weekly = days >= 14 ? (R / days) * 7 : null;
    var next = JA.milestones.filter(function (ms) { return Object.keys(ms.need).some(function (k) { return have[k] < ms.need[k]; }); })[0];
    return el("section", { class: "card path", "aria-labelledby": "p-h" }, [
      el("div", { class: "today-head" }, [el("h2", { id: "p-h", text: "The media path" }), el("a", { href: "#/path", text: "Full path ›" })]),
      el("ol", { class: "stones" }, JA.milestones.map(function (ms) {
        var parts = Object.keys(ms.need).map(function (k) { return Math.min(1, have[k] / ms.need[k]); });
        var f = parts.reduce(function (a, b) { return a + b; }, 0) / parts.length;
        var state = f >= 1 ? "done" : ms === next ? "next" : "later";
        return el("li", { class: "stone", "data-state": state }, [el("span", { class: "dot", "aria-hidden": "true" }), el("span", { class: "s-t", text: ms.title }), Math.round(f * 100) >= 1 ? el("span", { class: "muted", text: state === "done" ? "✓ reached" : Math.round(f * 100) + "%" }) : null]);
      })),
      el("p", { class: "muted small", text: weekly == null ? "Calibrating: projected dates appear after 14 active days (" + days + " so far). They will be ranges, never a single day." : "About " + weekly.toFixed(0) + " stable words a week." })
    ]);
  }

  function weekCard() {
    var day = today(), wk = st.log.filter(function (l) { return l.day > day - 7; });
    var by = {}; wk.forEach(function (l) { by[l.verdict] = (by[l.verdict] || 0) + 1; });
    var rows = [["Answers this week", wk.length], ["Correct or accepted", (by.correct || 0) + (by.accepted || 0)], ["Self-marked", wk.filter(function (l) { return l.self; }).length]].filter(function (r, i) { return i === 0 || r[1]; });
    return el("section", { class: "card", "aria-labelledby": "w-h" }, [el("h2", { id: "w-h", text: "This week" }),
      wk.length ? el("dl", { class: "facts" }, rows.map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: String(r[1]) })]); })) : el("p", { class: "muted", text: "Your first answers will show here." })]);
  }

  function devCard() {
    return el("section", { class: "card dev", "aria-labelledby": "d-h" }, [
      el("h2", { id: "d-h", text: "Slice tools" }),
      el("p", { class: "muted small", text: "For testing the scheduler: move the clock forward and the reviews come due." }),
      el("div", { class: "row wrap" }, [
        el("button", { class: "btn", type: "button", onclick: function () { st.offset++; save(); draw(); announce("Moved to the next day"); } }, ["Next day →"]),
        el("button", { class: "btn", type: "button", onclick: function () { st.offset += 7; save(); draw(); announce("Moved a week on"); } }, ["+7 days"]),
        el("button", { class: "btn danger", type: "button", onclick: function () { if (confirm("Reset the slice's progress?")) { st = blank(); save(); draw(); } } }, ["Reset"])
      ]),
      el("p", { class: "muted small", text: "Clock offset: " + st.offset + " days." })
    ]);
  }

  // ---------- lessons ----------
  routes.lesson = function (m, args) {
    var l = JA.lessons.filter(function (x) { return x.id === args[0]; })[0] || JA.lessons[0];
    var pages = l.id === "kana" ? kanaPages(l) : lesson11Pages();
    var page = Math.min(+(args[1] || 0), pages.length - 1);
    var rec = st.lessons[l.id] = st.lessons[l.id] || { pages: {} };
    setTimeout(function () { if (location.hash.indexOf("#/lesson/" + l.id) === 0) { rec.pages[page] = rec.pages[page] || Date.now(); save(); } }, 2500); // read after a 2.5 s dwell (invariant 107's rule)
    m.appendChild(header(l.title, (l.stage === 0 ? "Stage 0 · Kana" : "Stage 1 · Foundations · lesson " + l.id) + " · ≈ " + l.mins + " min"));
    var bar = el("nav", { class: "pagebar", "aria-label": "Lesson pages" }, pages.map(function (p, i) {
      return el("a", { href: "#/lesson/" + l.id + "/" + i, "aria-current": i === page ? "page" : null, "data-read": rec.pages[i] ? "1" : null }, [String(i + 1) + " " + p.t]);
    }));
    var body = el("article", { class: "card lesson-page" }, [el("h2", { text: pages[page].t })].concat(pages[page].body()));
    var nav = el("div", { class: "row between" }, [
      page > 0 ? el("a", { class: "btn", href: "#/lesson/" + l.id + "/" + (page - 1), text: "‹ Back" }) : el("span"),
      page < pages.length - 1 ? el("a", { class: "btn primary", href: "#/lesson/" + l.id + "/" + (page + 1), text: "Next ›" })
        : el("a", { class: "btn primary", href: "#/session/learn-" + l.id, text: "Start practice ›" })
    ]);
    m.appendChild(el("div", { class: "lesson" }, [bar, el("div", {}, [body, nav])]));
  };

  function kanaPages(l) {
    var rows = [["あ row", 0], ["か row", 5], ["さ row", 10]];
    return [{ t: "How kana work", body: function () { return [
      el("p", { text: "Each hiragana is one beat (a mora) of sound. Learn them by shape and sound together, never through romaji spelling." }),
      el("ul", {}, [el("li", { text: "Read the mnemonic, hear it, write it once." }), el("li", { text: "Practice asks you to read each one in under 3 seconds, and to write what you hear." }), el("li", { text: "Romaji is a crutch for the first week only." })])
    ]; } }].concat(rows.map(function (r) {
      return { t: r[0], body: function () {
        return [traceBox(JA.kanaSet.slice(r[1], r[1] + 5)), el("div", { class: "kana-grid" }, JA.kanaSet.slice(r[1], r[1] + 5).map(function (p) {
          var it = JA.items["k:" + p[0]];
          return el("figure", { class: "kana-card" }, [el("div", { class: "glyph", lang: "ja", text: p[0] }), el("figcaption", {}, [el("b", { text: p[1] }), X.audioBtn(p[0], "Hear " + p[1]), el("p", { class: "muted", text: it.hint })])]);
        }))];
      } };
    })).concat([{ t: "Quick reference", body: function () { return [el("div", { class: "kana-ref", lang: "ja" }, JA.kanaSet.map(function (p) { return el("span", {}, [p[0], el("small", { text: p[1] })]); }))]; } }]);
  }

  /* Trace each kana once when it is introduced: the model's strokes animate, then you trace over
     the faint guide and get a stroke-by-stroke check. Not scheduled (decision J). */
  function traceBox(row) {
    var host = el("div", { class: "trace" }), picked = row[0][0];
    function drawPad() {
      host.innerHTML = "";
      var res = el("div", { class: "verdict", role: "status" });
      var pad = JA.writePad({ ch: picked, guide: true, label: "Trace " + picked });
      host.appendChild(el("div", { class: "trace-tabs", role: "group", "aria-label": "Kana to trace" }, row.map(function (p) {
        return el("button", { class: "btn", type: "button", lang: "ja", "aria-pressed": String(p[0] === picked), onclick: function () { picked = p[0]; drawPad(); } }, [p[0]]);
      })));
      host.appendChild(el("div", { class: "pad-wrap" }, [pad.node, el("div", { class: "pad-tools" }, [
        el("p", { class: "muted small", text: "Watch the order, then trace over the grey model." }),
        el("button", { class: "btn", type: "button", onclick: function () { pad.animate(); } }, ["▶ Stroke order"]),
        el("button", { class: "btn primary", type: "button", onclick: function () {
          var r = JA.stroke.check(picked, pad.strokes()); pad.mark(r);
          var v = { correct: "✓ Correct", accepted: "✓ Accepted", near: "≈ Nearly", wrong: "✗ Not quite" }[r.verdict];
          res.className = "verdict v-" + r.verdict; res.textContent = v + (r.diagnosis ? " — " + r.diagnosis.explain : r.note ? " — " + r.note : "");
        } }, ["Check"]),
        el("button", { class: "btn", type: "button", onclick: function () { pad.clear(); res.textContent = ""; res.className = "verdict"; } }, ["Clear"]),
        res
      ])]));
      setTimeout(function () { pad.animate(); }, 200);
    }
    drawPad();
    return host;
  }

  function sentenceRow(s) {
    return el("li", { class: "sent" }, [X.audioBtn(s.ja, "Hear the sentence"), el("div", {}, [el("div", { class: "ja" }, [ruby(s.ja)]), el("div", { class: "muted", text: s.en })])]);
  }
  function lesson11Pages() {
    var I = JA.items;
    return [
      { t: "Hook", body: function () { return [
        el("figure", { class: "scene-fig" }, [JA.vnScene(JA.cafeScene, { ruby: ruby, onMine: mine }),
          el("figcaption", { class: "muted small", text: "Click or press Enter for the next line. Watch who says これ, それ and あれ — and what each is near. (The manga panel of this moment arrives with art batch 5.)" })]),
        el("p", { text: "By the end of this lesson you can point at things near you, near someone else, and far from both of you — and ask what they are." })
      ]; } },
      { t: "Core idea", body: function () { return [
        el("table", { class: "kosoa" }, [el("thead", {}, [el("tr", {}, [el("th", { text: "" }), el("th", { lang: "ja", text: "これ" }), el("th", { lang: "ja", text: "それ" }), el("th", { lang: "ja", text: "あれ" }), el("th", { lang: "ja", text: "どれ" })])]),
          el("tbody", {}, [el("tr", {}, [el("th", { text: "Where" }), el("td", { text: "near me" }), el("td", { text: "near you" }), el("td", { text: "far from us both" }), el("td", { text: "which?" })])])]),
        el("p", {}, [el("span", { lang: "ja", text: "X は Y です" }), " — “X is Y”. は (said wa) marks what you are talking about; です ends a polite statement."]),
        el("ul", { class: "sents" }, JA.sentences.slice(0, 3).map(sentenceRow))
      ]; } },
      { t: "Patterns", body: function () { return [
        el("ul", { class: "pat" }, [
          el("li", {}, [el("b", { lang: "ja", text: "これは＿です。" }), " This is ＿."]),
          el("li", {}, [el("b", { lang: "ja", text: "それは＿ですか。" }), " Is that ＿? — か at the end makes a question."]),
          el("li", {}, [el("b", { lang: "ja", text: "これはなんですか。" }), " What is this? — なん before です."]),
          el("li", {}, [el("b", { lang: "ja", text: "これも＿です。" }), " This is ＿ too. — も replaces は."])
        ]),
        el("ul", { class: "sents" }, JA.sentences.slice(3).map(sentenceRow))
      ]; } },
      { t: "Listen & notice", body: function () { return [
        el("p", { text: "Listen for the は said as “wa”, and the held vowel in ケーキ (ke-e-ki: three beats)." }),
        el("ul", { class: "vocab" }, ["w:kore", "w:sore", "w:are", "w:dore", "w:hon", "w:pen", "w:kasa", "w:keeki", "w:neko", "w:nan"].map(function (k) {
          var it = I[k]; return el("li", {}, [X.audioBtn(it.w), el("span", { class: "ja", lang: "ja" }, [it.w === "本" ? ruby("{本|ほん}") : it.w]), el("span", { text: it.en[0] }), it.note ? el("span", { class: "muted", text: it.note }) : null]);
        }))
      ]; } },
      { t: "Pitfalls", body: function () { return [
        el("ul", {}, [
          el("li", {}, ["The particle は is written は but said “wa”. Typing “wa” gives わ — the checker will point it out."]),
          el("li", {}, [el("span", { lang: "ja", text: "それ" }), " is near the LISTENER, not “that” in general. Something far from both of you is ", el("span", { lang: "ja", text: "あれ" }), "."]),
          el("li", {}, ["No “a/the” and no plural: ", el("span", { lang: "ja", text: "ねこです" }), " is “it's a cat” or “they're cats”."]),
          el("li", {}, ["A question needs no “？”: ", el("span", { lang: "ja", text: "ですか。" }), " ends with 。"])
        ])
      ]; } },
      { t: "Quick reference", body: function () { return [
        el("dl", { class: "facts" }, [["これ / それ / あれ / どれ", "this · that (near you) · that over there · which"], ["X は Y です", "X is Y"], ["〜ですか", "question"], ["なん", "what (before です)"], ["も", "too, also (replaces は)"]].map(function (r) { return el("div", {}, [el("dt", { lang: "ja", text: r[0] }), el("dd", { text: r[1] })]); }))
      ]; } }
    ];
  }

  // ---------- sessions ----------
  /* learn-<lesson>: introduce the lesson's items (their first facets) and drill them now.
     output: minimal pairs plus speaking facets that are due or new. */
  routes.session = function (m, args) {
    var kind = args[0] || "output", day = today(), list = [];
    if (kind.indexOf("learn-") === 0) {
      var l = JA.lessons.filter(function (x) { return x.id === kind.slice(6); })[0];
      l.items.forEach(function (it) { st.facets = S.introduce(st.facets, it, day); });
      save();
      list = l.items.reduce(function (a, it) { return a.concat(S.facetsFor(it, st.facets).map(function (s) { return S.key(it, s); })); }, []).filter(function (k) { return st.facets[k]; });
      // recognition first: every item's R before anything asks you to hear, write or say it
      var isR = function (k) { return S.split(k).skill === "R"; };
      list = X.shuffle(list.filter(isR), kind + day).concat(X.shuffle(list.filter(function (k) { return !isR(k); }), kind + day + "b"))
        .map(function (k) { return X.forFacet(k, day); });
      runSession(m, list, l.title, function () { st.lessons[l.id] = Object.assign(st.lessons[l.id] || { pages: {} }, { doneAt: day }); save(); });
      return;
    }
    if (kind === "output") {
      for (var i = 0; i < 4; i++) list.push(X.minimalPair(day + ":" + i));
      Object.keys(st.facets).filter(function (k) { return S.split(k).skill === "S" && st.facets[k].due <= day; }).slice(0, 6).forEach(function (k) { list.push(X.forFacet(k, day)); });
      runSession(m, list, "Listening pairs and speaking");
    }
  };

  routes.media = function (m, args) { JA.media.view(m, args); };

  routes.review = function (m) {
    // saved lines need their clips indexed first (IndexedDB); everything else is synchronous
    if (JA.media && !routes.review._ready) { JA.media.ready.then(function () { routes.review._ready = true; if (/^#\/review/.test(location.hash)) draw(); }); return; }
    var day = today(), q = S.queue(st.facets, day);
    if (!q.length) {
      m.appendChild(header("Reviews", "Nothing is due."));
      m.appendChild(el("div", { class: "card empty" }, [el("p", { text: "Your next reviews come due " + nextDue() + ". Use “Next day” on the desk to test the scheduler." }), el("a", { class: "btn primary", href: "#/desk", text: "Back to the desk" })]));
      return;
    }
    runSession(m, q.map(function (k) { return X.forFacet(k, st.facets[k].reps || 0); }).filter(Boolean), "Reviews");
  };
  function nextDue() {
    var d = Math.min.apply(null, Object.keys(st.facets).map(function (k) { return st.facets[k].due; }).concat([Infinity]));
    if (d === Infinity) return "after your first lesson"; var n = d - today(); return n <= 0 ? "now" : n === 1 ? "tomorrow" : "in " + n + " days";
  }

  function runSession(m, list, title, onDone) {
    var i = 0, results = [];
    var head = header(title, list.length + " items");
    var progress = el("div", { class: "prog", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(list.length) }, [el("span")]);
    var host = el("div", { class: "ex-host" });
    var side = el("aside", { class: "card ex-side", "aria-label": "This session" });
    m.appendChild(head); m.appendChild(progress); m.appendChild(el("div", { class: "session" }, [host, side]));
    function step() {
      progress.setAttribute("aria-valuenow", String(i)); progress.firstChild.style.width = (i / list.length * 100) + "%";
      head.querySelector(".sub").textContent = Math.min(i + 1, list.length) + " of " + list.length;
      drawSide();
      if (i >= list.length) return end();
      X.render(host, list[i], function (res) {
        var r = record(list[i], res); results.push({ ex: list[i], res: res, r: r }); i++; step();
      }, { known: known, furigana: st.furigana });
    }
    function drawSide() {
      side.innerHTML = "";
      side.appendChild(el("h2", { text: "So far" }));
      if (!results.length) { side.appendChild(el("p", { class: "muted", text: "Grades are derived from your answer, time and hints — you never mark yourself, except where no check exists (labelled)." })); return; }
      side.appendChild(el("ol", { class: "so-far" }, results.slice(-8).map(function (x) {
        var g = x.res.skipped ? "skipped · tomorrow" : x.r ? ["", "Again", "Hard", "Good", "Easy"][x.r.grade] : "practice";
        return el("li", { "data-v": x.res.verdict }, [el("span", { class: "mono", text: x.ex.id.replace("|", " · ") }), el("span", { class: "muted", text: g + (x.r ? " · next in " + x.r.next + "d" : "") })]);
      })));
    }
    function end() {
      if (onDone) onDone();
      host.innerHTML = "";
      var ok = results.filter(function (x) { return x.res.verdict === "correct" || x.res.verdict === "accepted"; }).length;
      host.appendChild(el("div", { class: "card done" }, [el("h2", { text: "Session done" }),
        el("p", { text: ok + " of " + results.length + " right first or second time." }),
        el("p", { class: "muted", text: "No rewards in the slice. In the app this pays once per lesson (plan decision G)." }),
        el("a", { class: "btn primary", href: "#/desk", text: "Back to the desk" })]));
      host.querySelector("a").focus();
      announce("Session done: " + ok + " of " + results.length);
    }
    step();
  }

  // ---------- reading (input) ----------
  /* Mine a line (plan §11): kept as a sentence card in the slice's state. */
  function mine(ln) {
    st.mined = st.mined || {};
    var id = "m" + X.hash(ln.ja).toString(36);
    st.mined[id] = { text: X.plain(ln.ja), en: ln.en, src: { kind: "scene", title: JA.cafeScene.title }, at: Date.now() };
    save(); announce("Line mined");
  }

  routes.read = function (m) {
    var P = JA.passage, shown = {};
    m.appendChild(header("Reader", "Graded passage · " + P.title, [el("button", { class: "btn", type: "button", onclick: function (e) {
      var host = document.getElementById("scene-host"); host.hidden = !host.hidden;
      if (!host.hidden && !host.firstChild) host.appendChild(JA.vnScene(JA.cafeScene, { ruby: ruby, onMine: mine }));
      e.currentTarget.textContent = host.hidden ? "Play as a scene" : "Hide the scene";
    } }, ["Play as a scene"])]));
    m.appendChild(el("div", { id: "scene-host", class: "scene-fig", hidden: true }));
    var t0 = Date.now();
    var lines = el("ol", { class: "reader" });
    P.lines.forEach(function (ln, i) {
      var en = el("div", { class: "en muted", hidden: true, text: ln.en });
      lines.appendChild(el("li", {}, [el("span", { class: "who", lang: "ja", text: ln.who }), el("div", { class: "ja-line" }, [ruby(ln.ja), X.audioBtn(ln.ja, "Hear the line")]),
        el("button", { class: "btn ghost mini", type: "button", onclick: function (e) { en.hidden = !en.hidden; if (!shown[i]) { shown[i] = 1; st.log.push({ day: today(), id: "lookup:" + i, kind: "reveal" }); save(); } e.currentTarget.textContent = en.hidden ? "English" : "Hide"; } }, ["English"]), en]));
    });
    var chars = P.lines.reduce(function (a, l) { return a + X.plain(l.ja).length; }, 0);
    var q = P.q[0], qBox = el("div", { class: "card qbox" });
    qBox.appendChild(el("p", { text: q.q }));
    qBox.appendChild(el("div", { class: "opts" }, q.options.map(function (o, i) { return el("button", { class: "btn opt", type: "button", onclick: function (e) {
      var secs = (Date.now() - t0) / 1000, cpm = Math.round(chars / secs * 60);
      e.currentTarget.setAttribute("data-picked", i === q.a ? "correct" : "wrong");
      qBox.appendChild(el("p", { role: "status", text: (i === q.a ? "✓ Correct. " : "✗ It was “" + q.options[q.a] + "”. ") + "Reading speed this time: about " + cpm + " characters a minute." }));
      var day = today(); st.input[day] = st.input[day] || { readChars: 0 }; st.input[day].readChars += chars; save();
    } }, [o]); })));
    m.appendChild(el("div", { class: "read-wrap" }, [el("div", { class: "card" }, [lines]), qBox]));
  };

  // ---------- kana chart ----------
  routes.kana = function (m) {
    m.appendChild(header("Kana", "Each cell shows how your reading (R) and writing (W) of it stands."));
    m.appendChild(el("div", { class: "kana-chart" }, JA.kanaSet.map(function (p) {
      var r = st.facets["k:" + p[0] + "|R"], w = st.facets["k:" + p[0] + "|W"];
      var lvl = function (f) { return !f || !f.reps ? "new" : f.s >= S.STABLE ? "stable" : f.s >= 3 ? "growing" : "fresh"; };
      return el("div", { class: "kc" }, [el("span", { class: "glyph", lang: "ja", text: p[0] }), el("small", { text: p[1] }),
        el("span", { class: "lv" }, [el("span", { "data-lv": lvl(r), title: "Reading: " + lvl(r), text: "R" }), el("span", { "data-lv": lvl(w), title: "Writing: " + lvl(w), text: "W" })])]);
    })));
  };

  routes.path = function (m) {
    m.appendChild(header("The media path", "Requirements and, once calibrated, projected ranges (plan §10.2)."));
    m.appendChild(pathStrip());
  };

  routes.settings = function (m) {
    m.appendChild(header("Settings"));
    var fur = el("div", { class: "row", role: "group", "aria-label": "Furigana" }, ["all", "unknown", "none"].map(function (v) {
      return el("button", { class: "btn", type: "button", "aria-pressed": String(st.furigana === v), onclick: function () { st.furigana = v; save(); draw(); } }, [{ all: "All", unknown: "Unknown only", none: "None" }[v]]);
    }));
    m.appendChild(el("section", { class: "card" }, [el("h2", { text: "Furigana" }), el("p", { class: "muted", text: "Unknown only shows readings on kanji you have not made stable yet." }), fur,
      el("p", {}, ["Preview: ", ruby("これは{本|ほん}です。")])]));
    m.appendChild(el("section", { class: "card" }, [el("h2", { text: "Voice" }), el("p", { class: "muted", text: "The slice uses this browser's Japanese voice; VOICEVOX recordings replace it in the app." }), X.audioBtn("これはほんです。", "Test the voice")]));
  };

  // what media.js needs from the app
  JA.app = { state: function () { return st; }, save: save, today: today, header: header, draw: draw, announce: announce };
  draw();
})();
