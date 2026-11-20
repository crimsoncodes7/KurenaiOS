/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.3.4.1
   (linear search), 4.3.4.2 (binary search) and 4.3.4.3 (binary tree
   search) at full A-level depth, with every program in C#. Each topic
   REPLACES the entry cs-algorithms.js or cs-algorithms-2.js carried and
   keeps its labs. Every way AQA has examined them (7516/1 and 7517/1, June
   2017–2025) is worked in the mark scheme's own format — AS 2022's
   five-mark binary-search trace, every O(n) / O(log n) explanation, the
   advantage of a linear search, and the binary-tree search with its gaps.
   Every C# listing and trace was compiled and run under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function cells(x, y, vals, o) {
  o = o || {};
  var it = [], w = o.w || 30, h = o.h || 26;
  vals.forEach(function (v, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0, dim = o.dim && o.dim.indexOf(i) >= 0;
    var col = hl ? "accent2" : (dim ? "line" : (o.col || "accent"));
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + h], [x + i * w, y + h]], fill: col, alpha: dim ? 0.04 : (hl ? 0.34 : 0.13), c: col, w: 1.2 });
    it.push(txt(x + i * w + w / 2, y + h / 2, String(v), { b: !dim, size: 10.5, c: dim ? "muted" : "text" }));
    if (o.idx) it.push(txt(x + i * w + w / 2, y - 9, String(i), { size: 9.5 }));
  });
  return it;
}
function node(x, y, label, col, r) {
  return [{ circle: [x, y, r || 16], fill: col || "accent", alpha: 0.18, c: col || "accent", w: 1.6 }, txt(x, y, label, { b: true, size: 11, c: "text" })];
}
function link(x1, y1, x2, y2, col) {
  var r = 16, dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy);
  return { line: [[x1 + dx * r / d, y1 + dy * r / d], [x2 - dx * r / d, y2 - dy * r / d]], c: col || "text2", w: col ? 2.2 : 1.5 };
}
var LIST = [2, 8, 12, 18, 25, 29, 36, 42, 49, 51, 57, 61, 68, 71, 79, 83, 84, 91, 97];

/* =====================================================================
   4.3.4.1  Linear search
   ===================================================================== */
C["compsci:4.3.4.1"] = {
  notes: [
    { h: "Linear search — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.4.1)", body: "Know, trace and analyse the complexity of the **linear search** — check each item in turn from the start until the target is found or the list ends. Time complexity **O(n)**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Time complexity of linear search and why", "State and explain", "2", "A-level 2020 Q03.6"],
      ["Why linear search is O(n)", "Explain", "1", "A-level 2025 Q01.4"],
      ["Advantage of linear over binary search", "State", "1", "A-level 2025 Q01.6"],
      ["Write a linear search in a program", "Write", "Section D", "many Skeleton tasks (find an item by name/ID)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The algorithm**.", "**Complexity**.", "**Linear vs binary**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The algorithm" },
    { fig: { w: 640, h: 108, items: [].concat(
      cells(140, 22, [42, 7, 19, 84, 3, 61, 25], { w: 52, hl: [3], dim: [4, 5, 6], idx: true }),
      [txt(320, 70, "find 84: compare 42, 7, 19, 84 → found at index 3 after 4 comparisons", { size: 10.5, c: "text2" }),
        txt(320, 90, "unsorted is fine — every item is checked in turn until a match or the end", { size: 10.5, c: "text2" })]
    ), cap: "A linear search starts at index 0 and moves one place at a time; the greyed items are never examined because the target was found first." } },
    { code: { lang: "csharp", src: "static int LinearSearch(int[] items, int target)\n{\n    for (int i = 0; i < items.Length; i++)\n    {\n        if (items[i] == target) return i;   // found: stop at once\n    }\n    return -1;                              // reached the end: not present\n}\n\nint[] list = { 2, 8, 12, 18, 25, 29, 36, 42, 49, 51, 57, 61, 68, 71, 79, 83, 84, 91, 97 };\nConsole.WriteLine(LinearSearch(list, 84));   // 16 — after 17 comparisons", cap: "Checked by running. A WHILE loop with a Found flag is the pseudo-code equivalent." } },
    { code: { lang: "pseudo", src: "Found ← False\ni ← 0\nWHILE i < LEN(Items) AND Found = False\n  IF Items[i] = Target THEN\n    Found ← True\n  ELSE\n    i ← i + 1\n  ENDIF\nENDWHILE", cap: "AQA-style pseudo-code: the loop stops as soon as the item is found." } },

    { page: "Complexity" },
    { table: { head: ["Case", "Comparisons for n items", "When"], rows: [
      ["Best", "1 — O(1)", "the target is the first item"],
      ["Average", "about n / 2 — O(n)", "the target is equally likely anywhere"],
      ["Worst", "n — O(n)", "the target is last or absent"]
    ] } },
    { callout: { t: "info", h: "Why O(n)", body: "there is a loop that repeats up to n times, so as the list grows the (maximum) number of comparisons grows at the SAME RATE — double the list, double the worst-case work." } },

    { page: "Linear vs binary" },
    { table: { head: [" ", "Linear search", "Binary search"], rows: [
      ["Data must be", "any order — UNSORTED is fine", "SORTED"],
      ["Worst case", "n comparisons — O(n)", "⌊log₂ n⌋ + 1 comparisons — O(log n)"],
      ["1 000 000 items", "up to 1 000 000", "at most 20"],
      ["Access needed", "sequential — works on linked lists and files", "direct access by index"],
      ["Best for", "small or unsorted lists; one-off searches", "large sorted lists searched often"]
    ] } },
    { worked: { tag: "variation", title: "Sort first or not?", q: "A list of 10 000 unsorted records will be searched (a) once, (b) 5000 times. Should the program sort it and use binary search?",
      steps: [
        { m: "(a) Once: a linear search costs at most 10 000 comparisons; sorting alone costs about n log₂ n ≈ 133 000 — don't sort.", mk: "1" },
        { m: "(b) 5000 searches: linear ≈ 5000 × 5000 (average) = 25 000 000; sort once ≈ 133 000 then binary ≈ 5000 × 14 = 70 000 — sort.", mk: "1" }
      ], result: "Once: linear. Many times: sort + binary" } },
    { diagram: "linear-search" },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Complexity of linear search", src: "A-level June 2020 · P1 Q03.6 · 2 marks",
      q: "The time complexities O(1), O(nᵏ), O(kⁿ), O(n), O(log n) and O(n log n) are listed, where n is the size of the input and k is a constant. State which is the time complexity of the linear search algorithm and explain why it has that time complexity.",
      steps: [
        { h: "AO1 knowledge", m: "O(n);", mk: "1" },
        { h: "AO1 understanding", m: "As the size of the list increases, the time taken increases at the same rate // there is a loop that repeats n times;", mk: "1" }
      ], result: "O(n) — time grows in proportion to n" , "try": [{"lab":"linear-search"}]} },
    { worked: { tag: "exam", title: "Why O(n)?", src: "A-level June 2025 · P1 Q01.4 · 1 mark",
      q: "Explain why the linear search algorithm has time complexity of O(n).",
      steps: [{ m: "As the list increases in size, the maximum number of comparisons increases at the same rate;", mk: "1", n: "A. in the worst case n comparisons will be needed. NE. \"n comparisons are needed\" — it must be the WORST case/maximum." }],
      result: "Max comparisons grow at the same rate as n" } },
    { worked: { tag: "exam", title: "An advantage of linear search", src: "A-level June 2025 · P1 Q01.6 · 1 mark",
      q: "State one advantage of a linear search compared to a binary search.",
      steps: [{ m: "It can be used on unsorted lists;", mk: "1", n: "Also true: simpler to code; works on structures without direct access (linked lists)." }],
      result: "Works on unsorted data" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Algorithm**: check each item in turn; stop when found or at the end.",
      "**O(n)**: maximum comparisons grow at the SAME RATE as the list — say \"maximum\"/\"worst case\".",
      "**Advantage over binary**: no need to sort; also works on linked lists.",
      "**Trace**: one row per comparison; the index and the item compared."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Linear search needs a sorted list.\" — that is binary search; linear works on any order.",
      "\"O(n) means n comparisons every time.\" — it is the growth of the WORST case; a lucky search takes one.",
      "Off-by-one: the last index is LEN − 1; < LEN, not ≤ LEN."
    ] } },
    { callout: { t: "mnemonic", h: "\"Line up and check every one\"", body: "Linear = one at a time down the line → work grows in a straight **line** with n: O(n)." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.3.4.2 binary search; 4.4.4.1–4.4.4.3 Big-O and comparing algorithms; 4.2.1.4 linked lists (sequential access only); 4.2.6.1 hash tables avoid searching altogether." } }
  ],
  flashcards: [
    ["Why is linear search O(n)?", "The maximum number of comparisons grows at the same rate as the list size.", 2],
    ["Worst case for linear search?", "n comparisons — the target is last or absent.", 4],
    ["Linear search returns for a missing item?", "A rogue value such as −1 (or Found = False).", 6],
    ["Average comparisons for n items?", "About n/2.", 7]
  ],
  quiz: [
    { q: "Linear search of 1000 unsorted items, worst case", opts: ["1000 comparisons", "10 comparisons", "500 comparisons", "1 comparison"], ans: 0, why: "With unsorted items the worst case is that the item is last or absent, so every one of the 1000 is checked." },
    { q: "Which needs the data sorted?", opts: ["binary search", "linear search", "both", "neither"], ans: 0, why: "Linear works on any order." },
    { q: "Doubling the list size makes the worst-case linear search", opts: ["about twice as long", "one step longer", "four times as long", "the same"], ans: 0, why: "Linear search is O(n), so doubling the list doubles the worst-case time." },
    { q: "'n comparisons are needed' as an O(n) explanation is", opts: ["NE — it must be the worst case/maximum", "full marks — any count of comparisons is fine", "wrong — a linear search is O(log n)", "R — it must state the best case instead"], ans: 0, why: "A-level 2025 Q01.4." }
  ],
  sims: ["linear-search"]
};

/* =====================================================================
   4.3.4.2  Binary search
   ===================================================================== */
function binFig() {
  var it = [], rows = [[0, 18, 9], [0, 8, 4], [5, 8, 6], [7, 8, 7]];
  rows.forEach(function (r, k) {
    var y = 22 + k * 40, dim = [];
    for (var i = 0; i < LIST.length; i++) if (i < r[0] || i > r[1]) dim.push(i);
    it = it.concat(cells(20, y, LIST, { w: 29, hl: [r[2]], dim: dim, idx: k === 0 }));
    it.push(txt(580, y + 13, "Z=" + r[2] + " → " + LIST[r[2]], { size: 10.5, c: "accent2", pos: "e" }));
  });
  it.push(txt(320, 192, "after Z = 7 (42 > 38): Y = 6 < X = 7 → loop ends, P = −1 — 38 is not in the list", { size: 10.5, c: "danger" }));
  return { fig: { w: 660, h: 205, items: it, cap: "AS 2022's search for 38. Each comparison discards half of what is left: 19 → 9 → 4 → 2 → none. Greyed items are out of range." } };
}
C["compsci:4.3.4.2"] = {
  notes: [
    { h: "Binary search — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.4.2)", body: "Know, trace and analyse the time complexity of the **binary search** — on a **sorted** list, compare the target with the **middle** item and discard the half that cannot contain it, repeating until it is found or the range is empty. Time complexity **O(log n)**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Hand-trace a binary search", "Complete the table", "5", "AS 2022 Q01"],
      ["Time complexity and why", "State and explain", "1–2", "A-level 2020 Q03.7, 2023 Q03.3–4, 2025 Q01.5"],
      ["Compare with linear search", "State / explain", "1", "A-level 2025 Q01.6 (4.3.4.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The algorithm**.", "**Tracing it**.", "**Why O(log n)**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The algorithm" },
    { code: { lang: "pseudo", src: "SUBROUTINE A(S, X, Y)          ← AS 2022: search for S between indices X and Y\n  P ← -1\n  WHILE P = -1 AND X <= Y\n    Z ← (X + Y) DIV 2          ← the middle index\n    IF List[Z] = S THEN\n      P ← Z                    ← found\n    ELSE\n      IF List[Z] < S THEN\n        X ← Z + 1              ← target is in the upper half\n      ELSE\n        Y ← Z – 1              ← target is in the lower half\n      ENDIF\n    ENDIF\n  ENDWHILE\n  RETURN P\nENDSUBROUTINE", cap: "Returns the index, or −1 if S is absent." } },
    { code: { lang: "csharp", src: "static int BinarySearch(int[] list, int s)\n{\n    int x = 0, y = list.Length - 1;\n    while (x <= y)\n    {\n        int z = (x + y) / 2;                 // integer division = DIV\n        if (list[z] == s) return z;\n        if (list[z] < s) x = z + 1; else y = z - 1;\n    }\n    return -1;\n}\n\n// recursive version\nstatic int BinRec(int[] a, int t, int lo, int hi)\n{\n    if (lo > hi) return -1;                  // base case: empty range\n    int m = (lo + hi) / 2;\n    if (a[m] == t) return m;                 // base case: found\n    return a[m] < t ? BinRec(a, t, m + 1, hi) : BinRec(a, t, lo, m - 1);\n}", cap: "Checked: searching AS 2022's list for 84 gives 16 after 3 comparisons (51, 79, 84); for 38 gives −1 after 4." } },

    { page: "Tracing it" },
    binFig(),
    { table: { head: ["S", "X", "Y", "P", "Z", "List[Z]"], rows: [
      ["38", "0", "18", "−1", "", ""], ["", "", "", "", "9", "51"], ["", "", "8", "", "4", "25"], ["", "5", "", "", "6", "36"], ["", "7", "", "", "7", "42"], ["", "", "6", "", "", ""], ["Result: −1", "", "", "", "", ""]
    ] } },
    { worked: { tag: "variation", title: "Search for 84", q: "Using the same list and A(84, 0, 18), give each Z and List[Z] and the result.",
      steps: [
        { m: "Z = (0 + 18) DIV 2 = 9 → 51 < 84 → X = 10.", mk: "1" },
        { m: "Z = (10 + 18) DIV 2 = 14 → 79 < 84 → X = 15.", mk: "1" },
        { m: "Z = (15 + 18) DIV 2 = 16 → 84 = 84 → P = 16; loop ends.", mk: "1" , "fig": {"w":600,"h":86,"items":[{"poly":[[6,30],[37,30],[37,60],[6,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[21.5,45],"t":"2","size":11,"c":"text","b":true,"pos":"c"},{"text":[21.5,74],"t":"0","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[37,30],[68,30],[68,60],[37,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[52.5,45],"t":"8","size":11,"c":"text","b":true,"pos":"c"},{"text":[52.5,74],"t":"1","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[68,30],[99,30],[99,60],[68,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[83.5,45],"t":"12","size":11,"c":"text","b":true,"pos":"c"},{"text":[83.5,74],"t":"2","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[99,30],[130,30],[130,60],[99,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[114.5,45],"t":"18","size":11,"c":"text","b":true,"pos":"c"},{"text":[114.5,74],"t":"3","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[130,30],[161,30],[161,60],[130,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[145.5,45],"t":"25","size":11,"c":"text","b":true,"pos":"c"},{"text":[145.5,74],"t":"4","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[161,30],[192,30],[192,60],[161,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[176.5,45],"t":"29","size":11,"c":"text","b":true,"pos":"c"},{"text":[176.5,74],"t":"5","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[192,30],[223,30],[223,60],[192,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[207.5,45],"t":"36","size":11,"c":"text","b":true,"pos":"c"},{"text":[207.5,74],"t":"6","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[223,30],[254,30],[254,60],[223,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[238.5,45],"t":"42","size":11,"c":"text","b":true,"pos":"c"},{"text":[238.5,74],"t":"7","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[254,30],[285,30],[285,60],[254,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[269.5,45],"t":"49","size":11,"c":"text","b":true,"pos":"c"},{"text":[269.5,74],"t":"8","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[285,30],[316,30],[316,60],[285,60]],"fill":"accent2","alpha":0.22,"c":"accent2","w":1.6},{"text":[300.5,45],"t":"51","size":11,"c":"text","b":true,"pos":"c"},{"text":[300.5,74],"t":"9","size":10,"c":"muted","b":false,"pos":"c"},{"text":[300.5,16],"t":"Z1","size":10.5,"c":"accent2","b":true,"pos":"c"},{"poly":[[316,30],[347,30],[347,60],[316,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[331.5,45],"t":"57","size":11,"c":"text","b":true,"pos":"c"},{"text":[331.5,74],"t":"10","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[347,30],[378,30],[378,60],[347,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[362.5,45],"t":"61","size":11,"c":"text","b":true,"pos":"c"},{"text":[362.5,74],"t":"11","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[378,30],[409,30],[409,60],[378,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[393.5,45],"t":"68","size":11,"c":"text","b":true,"pos":"c"},{"text":[393.5,74],"t":"12","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[409,30],[440,30],[440,60],[409,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[424.5,45],"t":"71","size":11,"c":"text","b":true,"pos":"c"},{"text":[424.5,74],"t":"13","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[440,30],[471,30],[471,60],[440,60]],"fill":"accent2","alpha":0.22,"c":"accent2","w":1.6},{"text":[455.5,45],"t":"79","size":11,"c":"text","b":true,"pos":"c"},{"text":[455.5,74],"t":"14","size":10,"c":"muted","b":false,"pos":"c"},{"text":[455.5,16],"t":"Z2","size":10.5,"c":"accent2","b":true,"pos":"c"},{"poly":[[471,30],[502,30],[502,60],[471,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[486.5,45],"t":"83","size":11,"c":"text","b":true,"pos":"c"},{"text":[486.5,74],"t":"15","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[502,30],[533,30],[533,60],[502,60]],"fill":"good","alpha":0.22,"c":"good","w":1.6},{"text":[517.5,45],"t":"84","size":11,"c":"text","b":true,"pos":"c"},{"text":[517.5,74],"t":"16","size":10,"c":"muted","b":false,"pos":"c"},{"text":[517.5,16],"t":"Z3","size":10.5,"c":"good","b":true,"pos":"c"},{"poly":[[533,30],[564,30],[564,60],[533,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[548.5,45],"t":"91","size":11,"c":"text","b":true,"pos":"c"},{"text":[548.5,74],"t":"17","size":10,"c":"muted","b":false,"pos":"c"},{"poly":[[564,30],[595,30],[595,60],[564,60]],"fill":"muted","alpha":0.05,"c":"muted","w":1.6},{"text":[579.5,45],"t":"97","size":11,"c":"text","b":true,"pos":"c"},{"text":[579.5,74],"t":"18","size":10,"c":"muted","b":false,"pos":"c"}],"cap":"Z takes 9, 14, then 16, where 84 is found."}}
      ], result: "Found at 16 after 3 comparisons" } },
    { diagram: "binary-search" },

    { page: "Why O(log n)" },
    { table: { head: ["n items", "Maximum comparisons ⌊log₂ n⌋ + 1"], rows: [
      ["1", "1"], ["19 (AS 2022)", "5"], ["1 000", "10"], ["1 000 000", "20"], ["1 000 000 000", "30"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "Each comparison **halves** the part of the list still to be searched, so doubling the list adds only **one** comparison: the number of comparisons grows with log₂ n — it increases, but by smaller and smaller amounts." } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Binary search works on any list.\" — the list must be SORTED (and allow direct access by index).",
      "\"Halving means it's O(n/2).\" — n/2 is still O(n); repeated halving is O(log n).",
      "Updating X ← Z or Y ← Z (without ± 1) can loop for ever on a two-item range."
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Hand-trace A(38, 0, 18)", src: "AS June 2022 · P1 Q01 · 5 marks",
      q: "List = [2, 8, 12, 18, 25, 29, 36, 42, 49, 51, 57, 61, 68, 71, 79, 83, 84, 91, 97] (indices 0–18). SUBROUTINE A(S, X, Y): P ← −1; WHILE P = −1 AND X <= Y: Z ← (X + Y) DIV 2; IF List[Z] = S THEN P ← Z ELSE IF List[Z] < S THEN X ← Z + 1 ELSE Y ← Z − 1; ENDWHILE; RETURN P. Complete a table with columns S, X, Y, P, Z, List[Z] for Result ← A(38, 0, 18); the first row is S 38, X 0, Y 18, P −1.",
      steps: [
        { m: "Z = 9, List[Z] = 51 → Y = 8;", mk: "1" },
        { m: "Z = 4, List[Z] = 25 → X = 5;", mk: "1" },
        { m: "Z = 6, List[Z] = 36 → X = 7;", mk: "1" },
        { m: "Z = 7, List[Z] = 42 → Y = 6 (loop ends: X > Y);", mk: "1" },
        { m: "Result: −1;", mk: "1", n: "One mark per correct set of values in sequence; A. values sharing a row. Max 4 if any errors." }
      ], result: "Z 9, 4, 6, 7 → −1" , "try": [{"trace":{"code":"P ← −1\nWHILE P = −1 AND X <= Y\n  Z ← (X + Y) DIV 2\n  IF List[Z] = S THEN\n    P ← Z\n  ELSE IF List[Z] < S THEN\n    X ← Z + 1\n  ELSE\n    Y ← Z − 1\n  ENDIF\nENDWHILE\nRETURN P","lang":"pseudo","cols":["S","X","Y","P","Z","List[Z]"],"rows":[["68","0","18","-1","",""],["68","10","18","-1","9","51"],["68","10","13","-1","14","79"],["68","12","13","-1","11","61"],["68","12","13","12","12","68"]],"given":[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,0],[2,0],[3,0],[4,0]],"cap":"Now A(68, 0, 18) on the same list. One row per pass of the loop, every cell filled with the values at the end of the pass."}},{"lab":"binary-search"}]} },
    { worked: { tag: "exam", title: "Complexity of binary search", src: "A-level June 2020 · P1 Q03.7 · 2 marks",
      q: "From O(1), O(nᵏ), O(kⁿ), O(n), O(log n) and O(n log n), state which is the time complexity of the binary search algorithm and explain why it has that time complexity.",
      steps: [
        { h: "AO1 knowledge", m: "O(log n);", mk: "1" },
        { h: "AO1 understanding", m: "Each comparison halves the size of the list that has to be searched // the time increases as the list grows but by smaller and smaller amounts // if the list doubles, the number of comparisons only increases by 1;", mk: "1" }
      ], result: "O(log n) — halves each time" } },
    { worked: { tag: "exam", title: "State the Big-O", src: "A-level June 2023 · P1 Q03.3 · 1 mark",
      q: "There are similarities in how the binary tree search and the binary search algorithms work. State the big-O time complexity of the binary search algorithm.",
      steps: [{ m: "O(log₂ n);", mk: "1", n: "I. missing brackets, O or 2." }], result: "O(log n)" } },
    { worked: { tag: "exam", title: "Explain the Big-O", src: "A-level June 2023 · P1 Q03.4 · 1 mark",
      q: "Explain why the binary search algorithm has the time complexity O(log n).",
      steps: [{ m: "Every comparison halves the size of the list (A. tree) still to look at;", mk: "1" }], result: "Halving" } },
    { worked: { tag: "exam", title: "Why O(log n), 2025", src: "A-level June 2025 · P1 Q01.5 · 1 mark",
      q: "Explain why the binary search algorithm has time complexity of O(log n).",
      steps: [{ m: "As the list increases in size the maximum number of comparisons increases at a decreasing rate // each comparison halves the number of items still to be considered;", mk: "1" }],
      result: "Max comparisons grow at a decreasing rate" , "try": [{"grid":{"cols":["n","Linear search (max)","Binary search (max)"],"rows":[["8","8","4"],["16","16","5"],["1024","1024","11"],["1000000","1000000","20"]],"given":[[0,0],[1,0],[2,0],[3,0]],"cap":"The most comparisons each search can need on a sorted list of n items. (Binary: ⌊log₂ n⌋ + 1.)"}}]} },

    { page: "Exam toolkit" },
    { steps: [
      "**Precondition**: SORTED data with direct access.",
      "**Trace**: Z = (X + Y) DIV 2 — integer division; then X ← Z + 1 or Y ← Z − 1; stop when found or X > Y.",
      "**O(log n)**: each comparison halves what is left; doubling n adds ONE comparison.",
      "Write a row in the trace only when a value changes; finish with the Result."
    ] },
    { callout: { t: "mnemonic", h: "\"Halve and halve again\"", body: "**Mid** → compare → **discard half** → repeat. 1 000 000 items need at most **20** looks, because 2²⁰ ≈ 1 000 000." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.3.4.1 linear search; 4.3.4.3 binary tree search (the same halving); 4.1.1.3 DIV; 4.1.1.16 the recursive version; 4.4.4.2 logarithms and 4.4.4.3 O(log n); 4.3.5 sorting first." } }
  ],
  flashcards: [
    ["Middle index in AQA's binary search?", "Z ← (X + Y) DIV 2.", 1],
    ["Target bigger than List[Z]?", "X ← Z + 1 — search the upper half.", 2],
    ["Target smaller than List[Z]?", "Y ← Z − 1 — search the lower half.", 3],
    ["When does it stop without finding?", "When X > Y (the range is empty).", 4],
    ["Why is binary search O(log n)?", "Each comparison halves the remaining list; doubling n adds one comparison.", 6],
    ["Max comparisons for 1 000 000 items?", "20.", 7],
  ],
  quiz: [
    { q: "First Z for A(38, 0, 18)?", opts: ["9", "8", "10", "18"], ans: 0, why: "Z is (0 + 18) DIV 2 = 9, the middle of positions 0 to 18." },
    { q: "Max comparisons for 1000 sorted items?", opts: ["10", "500", "1000", "100"], ans: 0, why: "⌊log₂ 1000⌋ + 1 = 10." },
    { q: "Binary search cannot be used on", opts: ["an unsorted list", "a sorted array", "a list of strings in order", "a sorted list of 2 items"], ans: 0, why: "Halving relies on order." },
    { q: "Doubling the list size makes the worst-case binary search", opts: ["one comparison longer", "twice as long to finish", "four times as long", "no different in length"], ans: 0, why: "Binary search halves the list each time, so doubling the size adds just one more comparison." }
  ],
  sims: ["binary-search"]
};

/* =====================================================================
   4.3.4.3  Binary tree search
   ===================================================================== */
function bstFig() {
  var it = [];
  var P = { 6: [170, 28], 3: [100, 88], 9: [240, 88], 1: [60, 148], 4: [140, 148] };
  it.push(link(170, 28, 100, 88, "accent2"), link(170, 28, 240, 88), link(100, 88, 60, 148), link(100, 88, 140, 148, "accent2"));
  Object.keys(P).forEach(function (k) { it = it.concat(node(P[k][0], P[k][1], k, k === "6" || k === "3" || k === "4" ? "accent2" : "accent")); });
  it.push(txt(170, 180, "balanced: height 2 — ≤ 3 comparisons", { size: 10.5, c: "good" }));
  var chain = [1, 3, 4, 6, 9];
  chain.forEach(function (v, i) { var x = 360 + i * 52, y = 28 + i * 34; if (i) it.push(link(360 + (i - 1) * 52, 28 + (i - 1) * 34, x, y)); it = it.concat(node(x, y, String(v), "danger")); });
  it.push(txt(500, 196, "same values inserted in order: a chain — 5 comparisons", { size: 10.5, c: "danger" }));
  return { fig: { w: 640, h: 210, items: it, cap: "Searching for 4 follows ONE path from the root (highlighted). The cost is the height of the tree: O(log n) when balanced, O(n) when it degenerates into a chain." } };
}
C["compsci:4.3.4.3"] = {
  notes: [
    { h: "Binary tree search — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.4.3)", body: ["Be able to **trace and analyse the time complexity of the binary tree search** algorithm — start at the root.", "If the target equals the node, found.", "If smaller go **left**, if larger go **right**.", "If there is no child that way, it is absent. Time complexity **O(log n)** for a balanced tree."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Fill the gaps in a binary tree search", "Complete the table", "4", "A-level 2023 Q03.2"],
      ["Trace a recursive tree search", "Complete the table", "3", "A-level 2017 Q04.3 (worked in 4.1.1.16)"],
      ["Its time complexity and why", "State / explain", "1–2", "A-level 2022 Q01 (given), 2023 Q03.3–4 (by analogy)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The algorithm**.", "**Complexity and shape**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The algorithm" },
    bstFig(),
    { code: { lang: "csharp", src: "// iterative, on an array of records (A-level 2023)\nvar tree = new (int Data, int Left, int Right)[]\n{\n    (6, 1, 4), (3, 2, 3), (1, -1, -1), (4, -1, -1), (9, -1, -1)\n};\nbool BTS(int k)\n{\n    int current = 0;                                    // the root\n    while (current > -1)\n    {\n        if (tree[current].Data == k) return true;\n        else if (tree[current].Data < k) current = tree[current].Right;\n        else current = tree[current].Left;\n    }\n    return false;\n}\n\n// recursive, on linked nodes: class Node { public int Value; public Node Left, Right; }\nbool Search(Node n, int k) =>\n    n != null && (n.Value == k || Search(k < n.Value ? n.Left : n.Right, k));", cap: "Checked: BTS(4) True, BTS(5) False, BTS(9) True." } },
    { worked: { tag: "variation", title: "Trace BTS(5)", q: "Trace BTS(5) on the tree above, giving Current and the comparison at each step.",
      steps: [
        { m: "Current 0: Data 6; 6 < 5? no → go left: Current ← Tree[0].Left = 1.", mk: "1" },
        { m: "Current 1: Data 3; 3 < 5 → go right: Current ← Tree[1].Right = 3.", mk: "1" },
        { m: "Current 3: Data 4; 4 < 5 → go right: Current ← Tree[3].Right = −1; loop ends → RETURN False.", mk: "1" }
      ], result: "6 → 3 → 4 → −1: False" , "try": [{"predict":{"code":"int[] data  = { 6, 3, 1, 4, 9 };\nint[] left  = { 1, 2, -1, -1, -1 };\nint[] right = { 4, 3, -1, -1, -1 };\n\nbool BTS(int k)\n{\n    int current = 0;\n    while (current > -1)\n    {\n        Console.Write(data[current] + \" \");\n        if (data[current] == k) return true;\n        else if (data[current] < k) current = right[current];\n        else current = left[current];\n    }\n    return false;\n}\n\nforeach (int k in new int[] { 1, 9, 7 }) Console.WriteLine(BTS(k));","expect":"6 3 1 True\n6 9 True\n6 9 False","cap":"BTS in C#, printing each Data it compares, for 1, 9 and 7."}}]} },

    { page: "Complexity and shape" },
    { table: { head: ["Tree shape", "Height for n nodes", "Search cost"], rows: [
      ["Balanced (full)", "about log₂ n", "O(log n) — each comparison discards about half the remaining tree"],
      ["Degenerate (a chain, from sorted insertions)", "n − 1", "O(n) — no better than a linear search"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "AQA's answer for the binary tree search is **O(log n)** — the same halving argument as binary search, assuming a reasonably balanced tree." } },
    { diagram: "tl-tree" },

    { page: "How insertion order shapes the tree" },
    { callout: { t: "info", h: "The shape is made by the order", body: "A binary search tree has no fixed shape: the ORDER the values were inserted decides it, and the search costs one comparison per level it passes through. So the same values can give a search of 3 comparisons or of 7." } },
    { fig: {"w": 360, "h": 196, "items": [{"line": [[164.8, 37.4], [115.2, 74.6]], "c": "text2", "w": 1.6}, {"line": [[195.2, 37.4], [244.8, 74.6]], "c": "accent2", "w": 2.6}, {"line": [[89.5, 101.8], [70.5, 130.2]], "c": "text2", "w": 1.6}, {"line": [[110.5, 101.8], [129.5, 130.2]], "c": "text2", "w": 1.6}, {"line": [[249.5, 101.8], [230.5, 130.2]], "c": "accent2", "w": 2.6}, {"line": [[270.5, 101.8], [289.5, 130.2]], "c": "text2", "w": 1.6}, {"circle": [180, 26, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [180, 26], "t": "50", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [100, 86, 19], "fill": "accent", "alpha": 0.15, "c": "accent", "w": 1.6}, {"text": [100, 86], "t": "30", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [260, 86, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [260, 86], "t": "70", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [60, 146, 19], "fill": "accent", "alpha": 0.15, "c": "accent", "w": 1.6}, {"text": [60, 146], "t": "20", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [140, 146, 19], "fill": "accent", "alpha": 0.15, "c": "accent", "w": 1.6}, {"text": [140, 146], "t": "40", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [220, 146, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [220, 146], "t": "60", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [300, 146, 19], "fill": "accent", "alpha": 0.15, "c": "accent", "w": 1.6}, {"text": [300, 146], "t": "80", "size": 11, "c": "text", "b": true, "pos": "c"}, {"line": [[232, 162], [246, 178]], "c": "accent2", "w": 2.0, "dash": true}, {"text": [262, 178], "t": "no right child: 65 is absent", "size": 10, "c": "text2", "pos": "e"}], "cap": "Inserted as 50, 30, 70, 20, 40, 60, 80: seven nodes in three levels. Searching for 65 compares with 50, 70 and 60, then finds no right child of 60: three comparisons."} },
    { fig: {"w": 360, "h": 186, "items": [{"line": [[76.6, 35.2], [123.4, 60.8]], "c": "accent2", "w": 2.6}, {"line": [[156.6, 79.2], [203.4, 104.8]], "c": "accent2", "w": 2.6}, {"line": [[236.6, 123.2], [283.4, 148.8]], "c": "accent2", "w": 2.6}, {"circle": [60, 26, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [60, 26], "t": "10", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [140, 70, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [140, 70], "t": "20", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [220, 114, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [220, 114], "t": "30", "size": 11, "c": "text", "b": true, "pos": "c"}, {"circle": [300, 158, 19], "fill": "accent2", "alpha": 0.3, "c": "accent2", "w": 1.6}, {"text": [300, 158], "t": "40", "size": 11, "c": "text", "b": true, "pos": "c"}], "cap": "Inserted as 10, 20, 30, 40: every new value is the largest so far, so each becomes the right child of the last. Searching for 40 compares with all four: a linear search."} },
    { table: { head: ["Nodes n", "Fewest levels (balanced)", "Most comparisons, balanced", "Most comparisons, a chain"], rows: [
      ["7", "3", "3", "7"],
      ["15", "4", "4", "15"],
      ["1 023", "10", "10", "1 023"],
      ["1 000 000", "20", "20", "1 000 000"]
    ] } },
    { callout: { t: "formula", h: "Levels of a balanced tree", body: "A tree with L full levels holds 2ᴸ − 1 nodes, so n nodes need at least L = ⌈log₂(n + 1)⌉ levels, and a search of a balanced tree makes at most L comparisons." } },
    { worked: { tag: "variation", title: "The most comparisons a search can need", q: "A balanced binary search tree holds 1 000 values. State the largest number of comparisons a search can need, and the number if the same values had been inserted in ascending order. Explain the difference.",
      steps: [
        { m: "Balanced: 10 levels hold up to 1 023 nodes (and 9 levels only 511), so at most 10 comparisons;", mk: "1" },
        { m: "In ascending order every value becomes the right child of the one before: a chain of 1 000 nodes, so up to 1 000 comparisons;", mk: "1" },
        { m: "Each comparison moves down one level, so the cost is the tree's HEIGHT: halving the remaining values in a balanced tree, removing just one in a chain.", mk: "1" }
      ], result: "10 balanced; 1 000 as a chain" } },
    { worked: { tag: "variation", title: "A binary search tree or binary search on a sorted array?", q: "A program stores the usernames of a club whose members join and leave every day, and searches them often. Explain one advantage and one disadvantage of storing them in a binary search tree rather than a sorted array searched by binary search.",
      steps: [
        { m: "Advantage: a new member is linked in as a new leaf without moving any other item (O(log n) when balanced);", mk: "1", n: "In a sorted array every later item must shift up one place to make room: O(n)." },
        { m: "so frequent joining and leaving stays cheap;", mk: "1" },
        { m: "Disadvantage: each node stores two pointers as well as its data, so it uses more memory;", mk: "1", n: "Or: the tree can become unbalanced, and searches then degrade towards O(n) — a sorted array's binary search is always O(log n)." },
        { m: "and the search follows pointers instead of jumping straight to a middle index.", mk: "1" }
      ], result: "Cheap inserts and deletes; more memory and a risk of becoming unbalanced" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Fill the gaps in BTS", src: "A-level June 2023 · P1 Q03.2 · 4 marks",
      q: "A binary tree is stored as an array of records Tree with fields Data, Left and Right: [0] (6, 1, 4), [1] (3, 2, 3), [2] (1, −1, −1), [3] (4, −1, −1), [4] (9, −1, −1). SUBROUTINE BTS(k): Current ← __1__; WHILE Current > __2__: IF Tree[Current].Data = k THEN RETURN __3__; ELSEIF Tree[Current].Data < k THEN __4__; ELSE __5__; ENDIF; ENDWHILE; RETURN __6__. State what each label should be replaced by.",
      steps: [
        { m: "Row 1: 0;", mk: "1", n: "The root's index." },
        { m: "Row 2: −1;", mk: "1" },
        { m: "Rows 3 and 6: True and False;", mk: "1" },
        { m: "Rows 4 and 5: Current ← Tree[Current].Right and Current ← Tree[Current].Left;", mk: "1", n: "Data < k means k is bigger, so go RIGHT. Accept any reasonable pseudo-code." }
      ], result: "0 · −1 · True · Right · Left · False" , "fig": {"w":360,"h":176,"items":[{"line":[[163.40128390431988,38.864004974152095],[116.59871609568012,75.1359950258479]],"c":"text2","w":1.6},{"line":[[196.59871609568012,38.864004974152095],[243.40128390431988,75.1359950258479]],"c":"text2","w":1.6},{"line":[[86.81719852501458,104.34667382898192],[63.18280147498542,133.65332617101808]],"c":"text2","w":1.6},{"line":[[113.18280147498542,104.34667382898192],[136.8171985250146,133.65332617101808]],"c":"text2","w":1.6},{"circle":[180,26,21],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[180,26],"t":"0: 6","size":10.5,"c":"text","b":true,"pos":"c"},{"circle":[100,88,21],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[100,88],"t":"1: 3","size":10.5,"c":"text","b":true,"pos":"c"},{"circle":[260,88,21],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[260,88],"t":"4: 9","size":10.5,"c":"text","b":true,"pos":"c"},{"circle":[50,150,21],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[50,150],"t":"2: 1","size":10.5,"c":"text","b":true,"pos":"c"},{"circle":[150,150,21],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[150,150],"t":"3: 4","size":10.5,"c":"text","b":true,"pos":"c"}],"cap":"Tree as index: Data. Left children to the left, right to the right."}} },
    { worked: { tag: "variation", title: "Complexity of the tree search", q: "State the time complexity of the binary tree search and explain it. When would it be worse?",
      steps: [
        { m: "O(log n);", mk: "1" },
        { m: "Each comparison moves one level down and discards (about) half of the remaining tree;", mk: "1" },
        { m: "Worse when the tree is unbalanced: inserting already-sorted data makes a chain, and the search becomes O(n).", mk: "1" }
      ], result: "O(log n); O(n) if degenerate" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Equal** → found · **smaller** → left · **bigger** → right · **no child** → not found.",
      "Read the pointer test carefully: \"Data < k\" means go RIGHT.",
      "**O(log n)** for a balanced tree; the cost is the HEIGHT.",
      "**Insertion order decides the shape**: sorted input makes a chain; at most ⌈log₂(n + 1)⌉ comparisons when balanced.",
      "Recursive versions have two base cases: found, or no child in the required direction (2017 Q04.2)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"A binary tree search checks every node.\" — it follows ONE path from root to leaf.",
      "\"Any binary tree can be searched like this.\" — only a binary SEARCH tree (left < node < right).",
      "Swapping the directions: if the node's value is LESS than the target, the target is to the RIGHT."
    ] } },
    { callout: { t: "mnemonic", h: "\"Less left, more right\"", body: "Smaller targets go **left**, bigger go **right**; fall off the tree and it isn't there." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.5.1 binary search trees; 4.3.4.2 binary search (same halving); 4.1.1.16 the recursive TreeSearch (2017 Q04); 4.3.2.1 in-order traversal; 4.4.4.3 O(log n) vs O(n)." } }
  ],
  flashcards: [
    ["What makes a binary search tree degenerate into a chain?", "Inserting values in sorted order.", 3],
    ["In BTS, 'Data < k' means go…?", "Right.", 4],
    ["Why is binary tree search on a balanced tree O(log n)?", "Each comparison discards about half of the remaining tree.", 7]
  ],
  quiz: [
    { q: "In BTS on 6(3(1, 4), 9), searching for 9 visits", opts: ["6, 9", "6, 3, 4", "6, 3, 1", "every node"], ans: 0, why: "9 is larger than the root 6, so the search goes right and finds 9 after visiting 6 then 9." },
    { q: "Binary tree search on a chain of n nodes is", opts: ["O(n)", "O(log n)", "O(1)", "O(n²)"], ans: 0, why: "On a chain every node has one child, so the tree's height is n − 1 and a search visits up to n nodes, O(n)." },
    { q: "BTS row 4 (Data < k) should be", opts: ["Current ← Tree[Current].Right", "Current ← Tree[Current].Left", "RETURN True", "Current ← 0"], ans: 0, why: "Target is bigger." },
    { q: "BTS(5) on the 2023 tree returns", opts: ["False", "True", "−1", "4"], ans: 0, why: "Falls off right of 4." }
  ],
  sims: ["tl-tree"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
