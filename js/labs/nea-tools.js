/* Kurenai OS — labs/nea-tools.js
   Two working tools for the AQA 7517 NEA (the programming project), registered
   as labs so they mount inline on their topic's Simulate tab:
     nea-objectives (NEA.1) — reads a numbered list of objectives and flags any
                              that are not measurable, not single-purpose, or
                              too vague to test, the way 4.14.3.1 demands
     nea-marks      (NEA.3) — a self-assessment against the 4.14.3 level
                              descriptors: pick a level and where in it for
                              each section, audit Table 1 techniques and
                              Table 2 coding style, and read the estimate /75
   Neither is in the Gold Shop, so neither is gated (invariant 2 gates only
   labs that are sold). Drafts are per device, in state.ui (never synced).
   Loaded after sims.js so KOS.sims.register exists. */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function ui() { return KOS.store.state.ui; }
  function save() { try { KOS.store.save(); } catch (e) { /* storage may be unavailable */ } }
  function controls(children) { return el("div", { class: "k-lab-controls", "data-ui": "lab.controls" }, children); }
  function note(kind, text) { return el("div", { class: "k-callout", "data-ui": "content.callout", "data-kind": kind, text: text }); }

  /* ======================= 1. OBJECTIVE CHECKER ======================= */
  var VAGUE = ["easy", "easily", "user-friendly", "user friendly", "intuitive", "fast", "quick", "quickly", "good", "nice", "simple",
    "readable", "attractive", "efficient", "efficiently", "appropriate", "smooth", "fun", "engaging", "modern", "clean", "perplexity",
    "better", "best", "well", "properly", "effective", "robust", "secure", "seamless", "pleasant"];
  var ACTION = /\b(store|save|load|display|show|calculate|compute|validate|reject|accept|sort|search|find|generate|allow|let|enable|record|update|delete|remove|add|create|edit|export|import|print|send|encrypt|hash|log ?in|register|plot|draw|move|spawn|award|deduct|increase|decrease|list|filter|rank|schedule|match|compare|predict|recommend|play|pause|end|display)\w*\b/i;
  var SAMPLE = [
    "1. Users must find it easy to work through the system",
    "2. The system should be readable to all users",
    "3. Secure logging in procedure",
    "4. Show confirmation message when changes are made to data",
    "5. A user must be able to register with a username of 4–20 characters and a password of at least 8 characters, which is stored as a salted SHA-256 hash",
    "6. The quiz must generate 10 questions per round, choosing topics the user has answered incorrectly most often first",
    "7. The system must store each attempt (user, question, answer, correct?, date/time) in the Attempts table",
    "8. A leaderboard of the top 10 scores must be shown and updated after every round"
  ].join("\n");

  function judge(line) {
    var t = line.replace(/^\s*(\d+(\.\d+)*[.)]?|[a-z][.)]|[ivx]+[.)]|[-•*])\s*/i, "").trim();
    var low = " " + t.toLowerCase() + " ";
    var issues = [], good = [];
    var words = t.split(/\s+/).filter(Boolean).length;
    var vague = VAGUE.filter(function (w) { return low.indexOf(" " + w + " ") >= 0 || low.indexOf(" " + w + ",") >= 0 || low.indexOf(" " + w + ".") >= 0; });
    if (vague.length) issues.push("vague wording (" + vague.join(", ") + ") — say what can be measured instead");
    if (words < 6) issues.push("too short to be unambiguous — what exactly happens, to which data?");
    if (!ACTION.test(t)) issues.push("no testable action — start from what the system must DO (store, calculate, display, validate…)");
    var hasMeasure = /\d/.test(t) || /\b(each|every|all|only|at least|at most|no more than|within|before|after|until|unless|table|field|file|list|queue|stack|graph|tree)\b/i.test(t);
    if (!hasMeasure) issues.push("nothing to check it against — add a quantity, rule, range or named data item");
    else good.push("has something a test can check");
    if ((t.match(/\band\b/gi) || []).length >= 2 || /;/.test(t)) issues.push("may not be single-purpose — consider splitting into sub-objectives (5.1, 5.2…)");
    if (/\b(should|could|might)\b/i.test(t) && !/\bmust\b/i.test(t)) good.push("tip: 'must' reads as a firm requirement");
    var verdict = !issues.length ? "good" : (issues.length === 1 && hasMeasure && !vague.length) ? "check" : "rewrite";
    return { text: t, verdict: verdict, issues: issues, good: good };
  }

  KOS.sims.register({
    id: "nea-objectives", title: "NEA objective checker", subject: "compsci", ref: "NEA.1",
    desc: "Paste your numbered objectives. Each is checked against what AQA's Analysis descriptor asks for — measurable, appropriate (single purpose, unambiguous) and covering the functionality — and flagged good, check or rewrite, with the reason.",
    mount: function (panel) {
      panel.appendChild(el("p", { class: "k-lab-sub", "data-ui": "part.sub",
        text: "One objective per line. The sample mixes AQA's own weak examples (1–4, from the guidance's Project A) with strong ones (5–8). The checker is a first pass for wording only — it cannot tell whether your list covers all the functionality; that is your analysis." }));
      var box = el("textarea", { class: "k-input k-lab-note", "data-ui": "ui.note-area", "aria-label": "Objectives, one per line" });
      box.value = ui().neaObjectives || SAMPLE;
      box.rows = 10;
      panel.appendChild(box);
      panel.appendChild(controls([
        el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", type: "button", text: "Check objectives", onclick: run }),
        el("button", { class: "k-btn k-lab-alt", type: "button", text: "Load the sample", onclick: function () { box.value = SAMPLE; run(); } })
      ]));
      var out = el("div", { class: "k-lab-out", "aria-live": "polite" });
      panel.appendChild(out);
      function run() {
        ui().neaObjectives = box.value; save();
        out.innerHTML = "";
        var lines = box.value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
        if (!lines.length) { out.appendChild(note("tip", "Write at least one objective.")); return; }
        var res = lines.map(judge), n = { good: 0, check: 0, rewrite: 0 };
        var rows = res.map(function (r, i) {
          n[r.verdict]++;
          var label = { good: "✔ good", check: "~ check", rewrite: "✘ rewrite" }[r.verdict];
          return "<tr><td>" + (i + 1) + "</td><td>" + KOS.ui.esc(r.text) + "</td><td data-verdict='" + r.verdict + "'><b>" + label + "</b></td><td>" +
            KOS.ui.esc(r.issues.concat(r.good).join(" · ") || "—") + "</td></tr>";
        }).join("");
        out.appendChild(el("div", { html: "<table class='k-n-table' data-ui='content.table'><thead><tr><th>#</th><th>Objective</th><th>Verdict</th><th>Why</th></tr></thead><tbody>" + rows + "</tbody></table>" }));
        out.appendChild(el("div", { class: "k-lab-sub", "data-ui": "part.sub",
          text: n.good + " good · " + n.check + " to check · " + n.rewrite + " to rewrite. Level 3 Analysis needs requirements \"fully documented in a set of measurable and appropriate specific objectives, covering all required functionality\"." }));
      }
      run();
    }
  });

  /* ======================= 2. MARK ESTIMATOR ======================= */
  var SECTIONS = [
    { id: "analysis", name: "Analysis", max: 9, levels: [[1, 3], [4, 6], [7, 9]], desc: [
      "Partly scoped analysis; some objectives, not all measurable or appropriate; some dialogue with users; problem partly modelled.",
      "Well scoped with minor omissions; most requirements in mainly measurable objectives; requirements mainly from dialogue; problem modelled well enough to use.",
      "Fully or nearly fully scoped, understandable by a third party; ALL functionality in measurable, appropriate objectives; requirements from dialogue with users; problem well modelled."] },
    { id: "design", name: "Documented design", max: 12, levels: [[1, 3], [4, 6], [7, 9], [10, 12]], desc: [
      "Inadequate — you would have to read the code to see how it is structured.",
      "Partially articulated — describes how SOME aspects are structured.",
      "Adequately articulated — describes how MOST key aspects are structured.",
      "Fully or nearly fully articulated — describes how ALL or almost all key aspects are structured."] },
    { id: "complete", name: "Completeness of solution", max: 15, levels: [[1, 5], [6, 10], [11, 15]], desc: [
      "Tackles some aspects of the problem.",
      "Achieves many of the requirements but not all; the top of the band includes some of the most important ones.",
      "Meets almost all of the requirements (ignoring any beyond A-level demands)."] },
    { id: "techniques", name: "Techniques used", max: 27, levels: [[1, 9], [10, 18], [19, 27]], desc: [
      "Group C skill (1-D arrays, simple types, single table, linear search, simple calculations).",
      "Group B skill (2–3 linked tables, multi-dimensional arrays, dictionaries, records, files, simple OOP, bubble sort, binary search, simple algorithms).",
      "Group A skill (several interlinked tables, cross-table parameterised SQL, hash tables/stacks/queues/graphs/trees, recursion, merge sort, complex OOP, complex user-defined algorithms)."] },
    { id: "testing", name: "Testing", max: 8, levels: [[1, 2], [3, 4], [5, 6], [7, 8]], desc: [
      "A small number of tests showing some parts work; evidence may be unclear.",
      "Moderately extensive testing, explained, but not showing all requirements achieved or that it is robust.",
      "Extensive testing, but the samples do not make clear that ALL core requirements were achieved.",
      "Carefully selected representative samples showing thorough testing, robustness and that the requirements were achieved."] },
    { id: "evaluation", name: "Evaluation", max: 4, levels: [[1, 1], [2, 2], [3, 3], [4, 4]], desc: [
      "Some outcomes assessed superficially; no useful independent feedback.",
      "Outcome discussed but not all requirements addressed; no useful independent feedback.",
      "Full consideration against all requirements; improvements discussed but limited; independent feedback obtained but not really discussed.",
      "Full consideration against ALL requirements; improvements in detail; independent feedback obtained, evaluated and discussed meaningfully."] }
  ];
  var TECH = {
    A: ["Complex data model in a database (several interlinked tables)", "Cross-table parameterised SQL / aggregate SQL", "Hash tables, stacks, queues, graphs or trees (your own)", "Graph or tree traversal", "Recursive algorithms",
      "Merge sort or similarly efficient sort", "Complex OOP model: inheritance, composition, polymorphism, interfaces", "Complex user-defined algorithm (optimisation, scheduling, pattern matching, AI)",
      "Files organised for direct access", "Complex client–server model / parameterised web API with JSON parsing", "Complex scientific / mathematical model"],
    B: ["Simple database (2–3 linked tables)", "Single-table or non-parameterised SQL", "Multi-dimensional arrays", "Dictionaries", "Records / structs", "Text files read and written",
      "Simple OOP model", "Bubble sort / binary search", "Simple user-defined algorithms (statistical calculations)", "Simple web API call with JSON/XML parsing"],
    C: ["Single-dimensional arrays", "Appropriate simple data types", "Single-table database", "Linear search", "Simple calculations (e.g. average)"]
  };
  var STYLE = {
    excellent: ["Subroutines with appropriate interfaces", "Loosely coupled modules (interact only through their interfaces)", "Cohesive modules (each does one thing)",
      "Related subroutines grouped into modules / classes", "Defensive programming", "Good exception handling"],
    good: ["Well-designed user interface", "Modularised code", "Good use of local variables", "Minimal global variables", "Managed casting of types", "Use of constants",
      "Appropriate indentation", "Self-documenting code", "Consistent style", "File paths parameterised"],
    basic: ["Meaningful identifier names", "Annotation used effectively where required"]
  };
  function bandMark(range, pos) {
    var lo = range[0], hi = range[1], w = hi - lo;
    if (!w) return lo;
    return pos === "low" ? lo : pos === "high" ? hi : Math.round((lo + hi) / 2);
  }
  function suggestTechniques(st) {
    var has = function (g) { return TECH[g].some(function (_, i) { return st.tech[g + i]; }); };
    var level = has("A") ? 3 : has("B") ? 2 : has("C") ? 1 : 0;
    var ex = STYLE.excellent.filter(function (_, i) { return st.style["excellent" + i]; }).length;
    var gd = STYLE.good.filter(function (_, i) { return st.style["good" + i]; }).length;
    var pos = "mid";
    if (level === 3) pos = ex >= 5 ? "high" : ex >= 3 ? "mid" : "low";
    else if (level === 2) pos = ex >= 4 ? "high" : ex >= 1 ? "mid" : "low";
    else if (level === 1) pos = gd >= 8 ? "high" : gd >= 4 ? "mid" : "low";
    return { level: level, pos: pos, ex: ex, gd: gd };
  }

  KOS.sims.register({
    id: "nea-marks", title: "NEA mark estimator", subject: "compsci", ref: "NEA.3",
    desc: "Self-assess against AQA's level descriptors (spec 4.14.3): choose the level that best fits each section and where you sit in it; tick the Table 1 techniques and Table 2 coding-style features your code really shows; read an estimate out of 75 and what the next level up needs.",
    mount: function (panel) {
      var st = ui().neaEstimate || {};
      st.lv = st.lv || {}; st.pos = st.pos || {}; st.tech = st.tech || {}; st.style = st.style || {};
      if (st.standard === undefined) st.standard = true;
      ui().neaEstimate = st;
      panel.appendChild(el("p", { class: "k-lab-sub", "data-ui": "part.sub",
        text: "Best fit, not a checklist: AQA marks the OVERALL quality of each section, then places you low, middle or high in the level. Techniques are credited only when the code demonstrates them working — planned but unfinished does not count." }));
      var std = el("input", { type: "checkbox" }); std.checked = !!st.standard;
      std.addEventListener("change", function () { st.standard = std.checked; save(); paint(); });
      panel.appendChild(controls([el("label", { class: "k-check" }, [std, "The project is of A-level standard (otherwise every section except the technical solution drops two levels)"])]));
      var body = el("div", { class: "k-lab-out" });
      panel.appendChild(body);

      function select(opts, value, on, label) {
        var s = el("select", { class: "k-input", "aria-label": label });
        opts.forEach(function (o) { var op = el("option", { value: String(o[0]), text: o[1] }); s.appendChild(op); });
        s.value = String(value);
        s.addEventListener("change", function () { on(s.value); });
        return s;
      }
      function checklist(title, items, key, store) {
        var wrap = el("fieldset", { class: "k-lab-fieldset" }, [el("legend", { text: title })]);
        items.forEach(function (t, i) {
          var c = el("input", { type: "checkbox" }); c.checked = !!store[key + i];
          c.addEventListener("change", function () { store[key + i] = c.checked; save(); paint(); });
          wrap.appendChild(el("label", { class: "k-check" }, [c, t]));
        });
        return wrap;
      }
      function paint() {
        body.innerHTML = "";
        var sug = suggestTechniques(st);
        var total = 0, rows = [];
        SECTIONS.forEach(function (sec) {
          var auto = sec.id === "techniques" && st.lv.techniques === undefined;
          var lv = auto ? sug.level : +(st.lv[sec.id] || 0);
          var pos = auto ? sug.pos : (st.pos[sec.id] || "mid");
          var eff = lv;
          /* spec 4.14.4: not A-level standard → two levels down (two marks in
             Evaluation, whose levels are one mark each), except the technical solution */
          if (!st.standard && sec.id !== "techniques" && sec.id !== "complete" && lv > 0) eff = Math.max(1, lv - 2);
          var mark = eff ? bandMark(sec.levels[eff - 1], pos) : 0;
          total += mark;
          var lvOpts = [[0, "Not yet"]].concat(sec.levels.map(function (r, i) { return [i + 1, "L" + (i + 1) + " · " + (r[0] === r[1] ? r[0] : r[0] + "–" + r[1])]; }));
          var lvSel = select(lvOpts, lv, function (v) { st.lv[sec.id] = +v; save(); paint(); }, sec.name + " level");
          var posSel = select([["low", "low"], ["mid", "middle"], ["high", "high"]], pos, function (v) { st.pos[sec.id] = v; if (sec.id === "techniques" && st.lv.techniques === undefined) st.lv.techniques = sug.level; save(); paint(); }, sec.name + " position");
          var next = lv < sec.levels.length ? "Next level: " + sec.desc[lv] : "Top level.";
          rows.push(el("div", { class: "k-lab-row", "data-ui": "lab.nea-section" }, [
            el("div", {}, [el("b", { text: sec.name + " · /" + sec.max }), " ", el("span", { class: "k-mono", text: "→ " + mark })]),
            controls([lvSel, posSel]),
            el("p", { class: "k-lab-sub", "data-ui": "part.sub", text: (lv ? "This level: " + sec.desc[lv - 1] + " " : "") + next +
              (auto ? " (Suggested from your technique and style audit below.)" : "") +
              (eff !== lv ? " Not A-level standard: marked as level " + eff + "." : "") })
          ]));
        });
        body.appendChild(el("div", { class: "k-lab-total", "data-ui": "lab.nea-total" }, [
          el("b", { class: "k-mono", text: "Estimate: " + total + " / 75" }),
          el("span", { class: "k-lab-sub", text: "  (" + Math.round(total / 75 * 100) + "%) — Analysis 9 · Design 12 · Technical solution 42 · Testing 8 · Evaluation 4" })
        ]));
        rows.forEach(function (r) { body.appendChild(r); });
        body.appendChild(el("h4", { text: "Techniques audit (Table 1) — tick only what your code demonstrates" }));
        body.appendChild(checklist("Group A", TECH.A, "A", st.tech));
        body.appendChild(checklist("Group B", TECH.B, "B", st.tech));
        body.appendChild(checklist("Group C", TECH.C, "C", st.tech));
        body.appendChild(el("h4", { text: "Coding style (Table 2) — cumulative: excellent assumes good and basic" }));
        body.appendChild(checklist("Excellent", STYLE.excellent, "excellent", st.style));
        body.appendChild(checklist("Good", STYLE.good, "good", st.style));
        body.appendChild(checklist("Basic", STYLE.basic, "basic", st.style));
        body.appendChild(note("tip", "Audit says: techniques at Group " + (["—", "C", "B", "A"][sug.level]) + " level, " + sug.ex + "/6 excellent and " + sug.gd + "/10 good style features → suggested " +
          (sug.level ? "level " + sug.level + ", " + sug.pos + " in the level" : "no level yet") + ". This is a guide to the descriptors, not a prediction of your teacher's or AQA's mark."));
        body.appendChild(el("div", {}, [el("button", { class: "k-btn k-lab-alt", type: "button", text: "Use the audit's suggestion for Techniques", onclick: function () { delete st.lv.techniques; delete st.pos.techniques; save(); paint(); } })]));
      }
      paint();
    }
  });
})();
