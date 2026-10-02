/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.3.5.1
   (bubble sort), 4.3.5.2 (merge sort) and 4.3.6.1 (Dijkstra's shortest
   path) at full A-level depth, with every program in C#. Each topic
   REPLACES the entry cs-algorithms.js or cs-algorithms-2.js carried and
   keeps its labs. Every way AQA has examined them (7516/1 and 7517/1, June
   2017–2025) is worked in the mark scheme's own format — bubble-sort
   passes, the two efficiency improvements, O(n²) and O(n log n), the
   insertion-style traces on AS papers, tractability, and the 2018
   seven-mark Dijkstra trace with what D and P mean. Every C# listing and
   trace was compiled and run under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function cells(x, y, vals, o) {
  o = o || {};
  var it = [], w = o.w || 34, h = o.h || 26;
  vals.forEach(function (v, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0, ok = o.ok && o.ok.indexOf(i) >= 0;
    var col = hl ? "accent2" : (ok ? "good" : (o.col || "accent"));
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + h], [x + i * w, y + h]], fill: col, alpha: hl ? 0.34 : 0.14, c: col, w: 1.2 });
    it.push(txt(x + i * w + w / 2, y + h / 2, String(v), { b: true, size: 11, c: "text" }));
  });
  return it;
}
function node(x, y, label, col, r) {
  return [{ circle: [x, y, r || 17], fill: col || "accent", alpha: 0.18, c: col || "accent", w: 1.6 }, txt(x, y, label, { b: true, size: 11.5, c: "text" })];
}
function link(x1, y1, x2, y2, o) {
  o = o || {};
  var r = 17, dx = x2 - x1, dy = y2 - y1, d = Math.sqrt(dx * dx + dy * dy);
  var it = [{ line: [[x1 + dx * r / d, y1 + dy * r / d], [x2 - dx * r / d, y2 - dy * r / d]], c: o.c || "text2", w: o.c ? 2.6 : 1.5 }];
  if (o.w != null) {
    var nx = -dy / d, ny = dx / d, off = o.off || 11;
    it.push(txt((x1 + x2) / 2 + nx * off, (y1 + y2) / 2 + ny * off, String(o.w), { b: true, size: 11, c: o.c || "text2" }));
  }
  return it;
}

/* =====================================================================
   4.3.5.1  Bubble sort
   ===================================================================== */
function passFig() {
  var rows = [[3, 5, 8, 1, 6, 4, [0, 1], "3 > 5? no"], [3, 5, 8, 1, 6, 4, [1, 2], "5 > 8? no"], [3, 5, 8, 1, 6, 4, [2, 3], "8 > 1? swap"], [3, 5, 1, 8, 6, 4, [3, 4], "8 > 6? swap"], [3, 5, 1, 6, 8, 4, [4, 5], "8 > 4? swap"], [3, 5, 1, 6, 4, 8, [], "end of pass 1: 8 is in place"]];
  var it = [];
  rows.forEach(function (r, k) {
    var y = 10 + k * 32;
    it = it.concat(cells(150, y, r.slice(0, 6), { hl: r[6], ok: k === 5 ? [5] : null }));
    it.push(txt(370, y + 13, r[7], { size: 10.5, c: /swap/.test(r[7]) ? "danger" : (k === 5 ? "good" : "text2"), pos: "e" }));
    it.push(txt(140, y + 13, k < 5 ? "compare " + r[6][0] + "–" + r[6][1] : "", { size: 10, pos: "w" }));
  });
  return { fig: { w: 640, h: 205, items: it, cap: "Pass 1 of a bubble sort on A-level 2021's list: adjacent pairs are compared left to right and swapped when out of order, so the largest value bubbles to the end." } };
}
C["compsci:4.3.5.1"] = {
  notes: [
    { h: "Bubble sort — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.5.1)", body: "Know, trace and analyse the time complexity of the **bubble sort** — repeatedly pass through the list comparing **adjacent** items and swapping them if they are in the wrong order. Included as an example of a particularly **inefficient** sort: time complexity **O(n²)**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Show the list after each of three passes", "Complete the table", "3", "A-level 2021 Q01"],
      ["Two changes giving fewer comparisons", "Describe", "4", "A-level 2019 Q01.1"],
      ["Time complexity and why", "State / explain", "1 + 2", "A-level 2017 Q03.3–4"],
      ["Passes guaranteed to sort n items", "After how many passes", "1", "A-level 2025 Q01.8"],
      ["Hand-trace an AS sorting algorithm", "Complete the table", "4–5", "AS 2019 Q02, AS 2023 Q02"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The algorithm**.", "**Making it faster**.", "**Complexity**.", "**Other sorting traces on AS papers**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The algorithm" },
    passFig(),
    { code: { lang: "pseudo", src: "PROCEDURE BubbleSort(L)                ← A-level 2019 Figure 1\n  N ← LEN(L) – 2\n  Count1 ← 0\n  WHILE Count1 < LEN(L) – 1            ← n − 1 passes\n    FOR Count2 ← 0 TO N                ← compare each adjacent pair\n      IF L[Count2] > L[Count2 + 1] THEN\n        Temp ← L[Count2]\n        L[Count2] ← L[Count2 + 1]\n        L[Count2 + 1] ← Temp             ← swap via Temp\n      ENDIF\n    ENDFOR\n    Count1 ← Count1 + 1\n  ENDWHILE\nENDPROCEDURE", cap: "The basic version: always n − 1 passes of n − 1 comparisons." } },
    { table: { head: ["", "[0]", "[1]", "[2]", "[3]", "[4]", "[5]"], rows: [
      ["start", "3", "5", "8", "1", "6", "4"], ["after pass 1", "3", "5", "1", "6", "4", "8"], ["after pass 2", "3", "1", "5", "4", "6", "8"], ["after pass 3", "1", "3", "4", "5", "6", "8"]
    ] } },

    { page: "Making it faster" },
    { code: { lang: "csharp", src: "static int BubbleSort(int[] a)\n{\n    int comparisons = 0;\n    bool swapped = true;\n    int pass = 0;\n    while (swapped && pass < a.Length - 1)          // 1) stop early: a pass with no swaps means sorted\n    {\n        swapped = false;\n        for (int i = 0; i < a.Length - 1 - pass; i++)   // 2) skip the end: the last `pass` items are already in place\n        {\n            comparisons++;\n            if (a[i] > a[i + 1])\n            {\n                (a[i], a[i + 1]) = (a[i + 1], a[i]);   // tuple swap — no Temp needed in C#\n                swapped = true;\n            }\n        }\n        pass++;\n    }\n    return comparisons;\n}\n// 3 5 8 1 6 4: basic version 25 comparisons, improved 14; an already sorted list: 5", cap: "Checked by running: the two improvements cut 25 comparisons to 14, and a sorted list needs one pass." } },
    { table: { head: ["Improvement", "How", "Saves"], rows: [
      ["Swap flag", "set a flag False at the start of each pass, True on any swap; stop the outer loop when a pass makes no swaps", "all the passes after the list is already sorted — best case becomes O(n)"],
      ["Shrinking inner loop", "after each pass subtract 1 from the inner loop's upper limit (subtract Count1 from N)", "the comparisons with the end of the list, which is already sorted"]
    ] } },

    { page: "Complexity" },
    { kv: [
      ["Comparisons (basic)", "(n − 1) passes × (n − 1) comparisons ≈ n² → O(n²)"],
      ["Why O(n²)", "each pass examines up to n items, and there are up to n passes"],
      ["Best case (with the flag)", "already sorted: one pass of n − 1 comparisons → O(n)"],
      ["Passes guaranteed", "n − 1: every pass puts at least one more item in its final place — 99 for 100 items"],
      ["Memory", "in place: only a Temp variable — O(1) extra space"],
      ["Tractable?", "yes — polynomial time (n²) is tractable, just slow for large n"]
    ] },
    { diagram: "sort-viz" },

    { page: "Other sorting traces on AS papers" },
    { callout: { t: "info", h: "Key idea", body: "AS papers trace unfamiliar sorting algorithms (these two are insertion sorts — each item is moved left into its place). The skill is the same: one column per variable, one row per change." } },
    { code: { lang: "csharp", src: "int[] n = { 45, 19, 62, 12 };                 // AS 2023 Q02\nfor (int x = 1; x <= 3; x++)\n{\n    int y = x - 1, value = n[x];\n    while (y > -1 && value < n[y])            // shift larger items right\n    {\n        n[y + 1] = n[y];\n        y--;\n    }\n    n[y + 1] = value;                          // drop the value into the gap\n}\n// after X = 1: 19 45 62 12 · X = 2: 19 45 62 12 · X = 3: 12 19 45 62", cap: "Checked by running. AS 2019's version compares with < MyValue the other way round, so it sorts into DESCENDING order: 85 43 17." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Three bubble-sort passes", src: "A-level June 2021 · P1 Q01 · 3 marks",
      q: "The list 3, 5, 8, 1, 6, 4 is to be sorted into ascending order with a bubble sort. Complete a table showing the values at the end of each of the first three passes.",
      steps: [
        { m: "First pass: 3 5 1 6 4 8;", mk: "1" },
        { m: "Second pass: 3 1 5 4 6 8;", mk: "1" },
        { m: "Third pass: 1 3 4 5 6 8;", mk: "1", n: "An alternative (bubbling the smallest to the FRONT, right to left) was also accepted: 1 3 5 8 4 6 after pass 1. Checked by running." }
      ], result: "358164 → 351648 → 315468 → 134568" } },
    { worked: { tag: "exam", title: "Two improvements", src: "A-level June 2019 · P1 Q01.1 · 4 marks",
      q: "PROCEDURE BubbleSort(L): N ← LEN(L) − 2; Count1 ← 0; WHILE Count1 < LEN(L) − 1: FOR Count2 ← 0 TO N: IF L[Count2] > L[Count2 + 1] THEN swap them via Temp; ENDFOR; Count1 ← Count1 + 1; ENDWHILE. Describe two changes that could be made to this bubble sort algorithm that would be likely to result in fewer comparisons being made when sorting the list L. The algorithm should still be a bubble sort.",
      steps: [
        { h: "Change 1", m: "Have a flag variable set to True if a swap is made and reset to False at the start of each pass (or True = in order, set False on a swap);", mk: "1" },
        { m: "Change the outer loop so that it stops repeating if no swaps were made in a pass;", mk: "1" },
        { h: "Change 2", m: "After the inner loop, subtract 1 from N // alter the inner FOR loop's upper limit;", mk: "1" },
        { m: "…by subtracting Count1 from N (the last Count1 items are already in place);", mk: "1" }
      ], result: "Swap flag + shrinking inner loop" } },
    { worked: { tag: "exam", title: "Complexity of bubble sort", src: "A-level June 2017 · P1 Q03.3 · 1 mark",
      q: "State the time complexity for the bubble sort algorithm in terms of n, where n is the number of items in the list to be sorted.",
      steps: [{ m: "O(n²);", mk: "1", n: "A. n^2, On2." }], result: "O(n²)" } },
    { worked: { tag: "exam", title: "Why O(n²)", src: "A-level June 2017 · P1 Q03.4 · 2 marks",
      q: "Explain why the bubble sort algorithm has the time complexity O(n²).",
      steps: [{ m: "In each pass through the list n items will be examined;", mk: "1" }, { m: "There will be (at most) n passes through the list;", mk: "1", n: "n × n = n²." }],
      result: "n items per pass × n passes" } },
    { worked: { tag: "exam", title: "Passes for 100 items", src: "A-level June 2025 · P1 Q01.8 · 1 mark",
      q: "After how many passes is bubble sort guaranteed to have sorted any list of 100 items?",
      steps: [{ m: "99;", mk: "1", n: "Each pass fixes at least one more item at the end; when 99 are placed, the last must be too." }], result: "99" } },
    { worked: { tag: "exam", title: "Trace the descending sort", src: "AS June 2019 · P1 Q02.1 · 4 marks",
      q: "Numbers[0] ← 43; Numbers[1] ← 17; Numbers[2] ← 85; FOR x ← 1 TO 2: MyValue ← Numbers[x]; y ← x − 1; WHILE (y > −1) AND (Numbers[y] < MyValue): Numbers[y + 1] ← Numbers[y]; y ← y − 1; ENDWHILE; Numbers[y + 1] ← MyValue; ENDFOR. Complete a trace table with columns x, MyValue, y, y > −1?, Numbers[y] < MyValue?, Numbers[0]–[2].",
      steps: [
        { m: "x: 1 then 2, with MyValue 17 then 85;", mk: "1" },
        { m: "y column: 0, 1, 0, −1;", mk: "1" },
        { m: "Booleans: x = 1 → True, False (43 < 17 is false); x = 2 → True, True; True, True; then y > −1 False;", mk: "1" },
        { m: "Final Numbers: 85, 43, 17;", mk: "1", n: "Checked by running." }
      ], result: "85 43 17" } },
    { worked: { tag: "exam", title: "What rearrangement?", src: "AS June 2019 · P1 Q02.2 · 1 mark",
      q: "What type of rearrangement does the algorithm above perform?",
      steps: [{ m: "Sorts from largest to smallest (descending order);", mk: "1", n: "NE. \"sort\" on its own. A. bubble sort." }], result: "Descending sort" } },
    { worked: { tag: "exam", title: "Trace the ascending sort", src: "AS June 2023 · P1 Q02 · 5 marks",
      q: "Numbers = [45, 19, 62, 12]. FOR X ← 1 TO 3: Y ← X − 1; N ← Numbers[X]; WHILE Y > −1 AND N < Numbers[Y]: Numbers[Y + 1] ← Numbers[Y]; Y ← Y − 1; ENDWHILE; Numbers[Y + 1] ← N; ENDFOR. Complete a table with columns X, Y, N, Numbers[0]–[3].",
      steps: [
        { m: "X = 1: Y 0, N 19; Numbers[1] ← 45; Y −1; Numbers[0] ← 19 → 19 45 62 12;", mk: "1" },
        { m: "X = 2: Y 1, N 62; 62 < 45 is false, so Numbers[2] ← 62 (no change);", mk: "1" },
        { m: "X = 3: Y 2, N 12; Numbers[3] ← 62, Y 1;", mk: "1" },
        { m: "Numbers[2] ← 45, Y 0; Numbers[1] ← 19, Y −1;", mk: "1" },
        { m: "Numbers[0] ← 12 → 12 19 45 62;", mk: "1", n: "One mark per area; values may sit on different rows if the order in the column is right. Max 4 if any errors." }
      ], result: "12 19 45 62" } },

    { page: "Exam toolkit" },
    { steps: [
      "**One pass**: compare each adjacent pair left to right, swap if out of order — the largest reaches the end.",
      "**State the list after each PASS**, not after each swap, when asked for passes.",
      "**Improvements**: a swapped flag to stop early; shrink the inner loop by one each pass.",
      "**O(n²)**: up to n items per pass × up to n passes. n − 1 passes guarantee a sorted list."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"A pass ends after one swap.\" — a pass is the WHOLE sweep through the list.",
      "\"Bubble sort needs n passes.\" — n − 1 at most: 99 for 100 items.",
      "\"Fewer comparisons means a different algorithm.\" — the flag and the shrinking loop keep it a bubble sort (2019 asked for exactly that)."
    ] } },
    { callout: { t: "mnemonic", h: "\"Big bubbles rise to the top\"", body: "Each pass carries the largest remaining value to the END, like a bubble rising — so after pass k the last k items are fixed." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.3.5.2 merge sort (O(n log n)); 4.4.4.3 O(n²) and 4.4.4.5 tractable problems; 4.1.1.2 nested iteration; 4.3.4.2 binary search needs sorted data." } }
  ],
  flashcards: [
    ["Bubble sort?", "Repeated passes comparing adjacent items and swapping them when out of order."],
    ["Time complexity?", "O(n²)."],
    ["Why O(n²)?", "Up to n items examined per pass and up to n passes."],
    ["Passes guaranteed to sort 100 items?", "99 (n − 1)."],
    ["Improvement 1?", "A swapped flag: stop when a pass makes no swaps."],
    ["Improvement 2?", "Reduce the inner loop's upper limit by 1 each pass."],
    ["3 5 8 1 6 4 after one pass?", "3 5 1 6 4 8."],
    ["Best case with the flag?", "O(n) — an already sorted list needs one pass."],
    ["Extra memory needed?", "O(1) — it sorts in place (one Temp)."],
    ["Is bubble sort tractable?", "Yes — polynomial time."]
  ],
  quiz: [
    { q: "After pass 2 of a bubble sort on 3 5 8 1 6 4 the list is", opts: ["3 1 5 4 6 8", "1 3 4 5 6 8", "3 5 1 6 4 8", "1 3 5 8 4 6"], ans: 0, why: "A-level 2021 Q01." },
    { q: "The bubble sort's time complexity is", opts: ["O(n²)", "O(n log n)", "O(log n)", "O(2ⁿ)"], ans: 0, why: "Nested loops." },
    { q: "A swapped flag lets the sort", opts: ["stop when a pass makes no swaps", "skip every other item", "sort in descending order", "use less memory"], ans: 0, why: "Early exit." },
    { q: "How many comparisons does the basic version make on 6 items?", opts: ["25", "15", "36", "6"], ans: 0, why: "5 passes × 5 comparisons." }
  ],
  sims: ["sort-viz"]
};

/* =====================================================================
   4.3.5.2  Merge sort
   ===================================================================== */
function mergeFig() {
  var rows = [
    ["split", [[38, 27, 43, 3, 9, 82, 10]]],
    ["", [[38, 27, 43], [3, 9, 82, 10]]],
    ["", [[38], [27, 43], [3, 9], [82, 10]]],
    ["", [[38], [27], [43], [3], [9], [82], [10]]],
    ["merge", [[38], [27, 43], [3, 9], [10, 82]]],
    ["", [[27, 38, 43], [3, 9, 10, 82]]],
    ["", [[3, 9, 10, 27, 38, 43, 82]]]
  ];
  var it = [];
  rows.forEach(function (r, k) {
    var y = 8 + k * 36, groups = r[1], w = 30, gap = 16;
    var total = groups.reduce(function (s, g) { return s + g.length * w; }, 0) + gap * (groups.length - 1);
    var x = 340 - total / 2;
    groups.forEach(function (g) { it = it.concat(cells(x, y, g, { w: w, h: 24, col: k < 4 ? "accent" : "good" })); x += g.length * w + gap; });
    if (r[0]) it.push(txt(20, y + 12, r[0], { b: true, size: 11, c: k < 4 ? "accent" : "good", pos: "e" }));
  });
  it.push(txt(590, 116, "log₂ n levels", { size: 10.5, c: "text2" }));
  it.push(txt(590, 134, "× n per level", { size: 10.5, c: "text2" }));
  it.push(txt(590, 152, "= O(n log n)", { b: true, size: 10.5, c: "accent2" }));
  return { fig: { w: 640, h: 262, items: it, cap: "Merge sort on 38 27 43 3 9 82 10: split until every sublist has one item, then merge pairs of sorted sublists back together. Checked by running the C# below." } };
}
C["compsci:4.3.5.2"] = {
  notes: [
    { h: "Merge sort — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.5.2)", body: "Be able to **trace and analyse the time complexity of the merge sort** — an example of the **divide and conquer** approach. Split the list in half repeatedly until each sublist has one item (which is sorted), then **merge** sorted sublists in pairs until one sorted list remains. Time complexity **O(n log n)**." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which algorithm is O(n log n)", "Which", "1", "A-level 2017 Q03.1"],
      ["Big-O of bubble, linear, merge", "State", "3", "A-level 2022 Q01"],
      ["Why bubble and merge sort are tractable", "Explain", "1", "A-level 2025 Q01.7"],
      ["Trace a merge sort / a merge", "Show / complete", "2–4", "specification; variations below"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Divide and conquer**.", "**The merge step**.", "**Merge sort in C#**.", "**Complexity and comparison**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Divide and conquer" },
    mergeFig(),
    { steps: [
      "**Divide**: split the list into two halves (left half gets ⌊n/2⌋ items).",
      "**Conquer**: sort each half the same way — recursively — until a sublist has 0 or 1 item (the base case: already sorted).",
      "**Combine**: merge the two sorted halves into one sorted list.",
      "The merging, not the splitting, is where items are compared and placed."
    ] },

    { page: "The merge step" },
    { worked: { tag: "variation", title: "Merge two sorted lists", q: "Merge [27, 38, 43] and [3, 9, 10, 82], showing each comparison.",
      steps: [
        { m: "Compare the FRONT of each: 27 vs 3 → take 3. 27 vs 9 → 9. 27 vs 10 → 10.", mk: "1" },
        { m: "27 vs 82 → 27. 38 vs 82 → 38. 43 vs 82 → 43.", mk: "1" },
        { m: "The left list is empty — copy the rest of the right list: 82. Result 3 9 10 27 38 43 82 after 6 comparisons.", mk: "1", n: "Merging lists of sizes a and b takes at most a + b − 1 comparisons." }
      ], result: "3 9 10 27 38 43 82" } },
    { callout: { t: "warn", h: "Stable merging", body: "Taking from the LEFT list when the two fronts are equal (≤ rather than <) keeps equal items in their original order — merge sort is a stable sort." } },

    { page: "Merge sort in C#" },
    { code: { lang: "csharp", src: "static List<int> MergeSort(List<int> a)\n{\n    if (a.Count <= 1) return a;                          // base case: already sorted\n    int mid = a.Count / 2;\n    var left  = MergeSort(a.GetRange(0, mid));            // divide and conquer\n    var right = MergeSort(a.GetRange(mid, a.Count - mid));\n    return Merge(left, right);                            // combine\n}\n\nstatic List<int> Merge(List<int> left, List<int> right)\n{\n    var merged = new List<int>();\n    int i = 0, j = 0;\n    while (i < left.Count && j < right.Count)\n        merged.Add(left[i] <= right[j] ? left[i++] : right[j++]);   // take the smaller front\n    while (i < left.Count)  merged.Add(left[i++]);       // copy whatever is left\n    while (j < right.Count) merged.Add(right[j++]);\n    return merged;\n}\n// MergeSort([38, 27, 43, 3, 9, 82, 10]) → 3 9 10 27 38 43 82", cap: "Checked by running; its merges are exactly the ones in the figure: [27|43], [38|27 43], [3|9], [82|10], [3 9|10 82], then the final merge." } },
    { diagram: "sort-viz" },

    { page: "Complexity and comparison" },
    { kv: [
      ["Levels", "halving n until sublists have one item takes log₂ n levels"],
      ["Work per level", "every level merges all n items once — O(n)"],
      ["Total", "n per level × log₂ n levels = O(n log n) — in EVERY case (best, average, worst)"],
      ["Memory", "needs extra space for the merged lists — O(n), unlike bubble sort's O(1)"]
    ] },
    { table: { head: [" ", "Bubble sort", "Merge sort"], rows: [
      ["Time (worst)", "O(n²)", "O(n log n)"],
      ["Time (best)", "O(n) with a flag", "O(n log n)"],
      ["Extra memory", "O(1) — in place", "O(n) — new lists"],
      ["Approach", "repeated adjacent swaps", "divide and conquer, usually recursive"],
      ["n = 1 000 000", "≈ 10¹² comparisons", "≈ 2 × 10⁷ comparisons"],
      ["Best when", "tiny or nearly sorted lists", "large lists"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Which is O(n log n)?", src: "A-level June 2017 · P1 Q03.1 · 1 mark",
      q: "Linear search, merge sort, binary search and post-order tree traversal are well-known algorithms. Which of them has O(n log n) time complexity?",
      steps: [{ m: "Merge sort;", mk: "1" }], result: "Merge sort" } },
    { worked: { tag: "exam", title: "Complete the Big-O table", src: "A-level June 2022 · P1 Q01 · 3 marks",
      q: "Big-O notation is used to express the time complexity of an algorithm. Binary tree search is O(log n). State the Big-O time complexity of bubble sort, linear search and merge sort.",
      steps: [
        { m: "Bubble sort: O(n²);", mk: "1" },
        { m: "Linear search: O(n);", mk: "1" },
        { m: "Merge sort: O(n log n);", mk: "1", n: "A. O(n × log n). NE. O(log n). I. missing brackets or O." }
      ], result: "O(n²) · O(n) · O(n log n)" } },
    { worked: { tag: "exam", title: "Why both sorts are tractable", src: "A-level June 2025 · P1 Q01.7 · 1 mark",
      q: "If a list of records was unsorted, a bubble sort algorithm or a merge sort algorithm could be used to sort it. Explain why both these sorting algorithms are tractable.",
      steps: [{ m: "Both have polynomial (or better) time complexity // neither has exponential (or worse) time complexity // as the list grows, the increase in time taken is reasonable;", mk: "1", n: "O(n²) and O(n log n) are both bounded by a polynomial." }],
      result: "Polynomial time" } },
    { worked: { tag: "variation", title: "Trace a merge sort", q: "Show the stages of a merge sort on 5, 1, 4, 2, 8, 3.",
      steps: [
        { m: "Split: [5 1 4] [2 8 3] → [5] [1 4] [2] [8 3] → [5] [1] [4] [2] [8] [3].", mk: "1" },
        { m: "Merge: [1 4] and [3 8]; then [1 4 5] and [2 3 8].", mk: "1" },
        { m: "Final merge: 1 2 3 4 5 8.", mk: "1" }
      ], result: "1 2 3 4 5 8" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Divide and conquer**: split to single items, then merge pairs.",
      "**Merge**: compare the fronts, take the smaller, copy the remainder when one list empties.",
      "**O(n log n)**: log n levels × n items per level — in every case.",
      "**Versus bubble**: faster for large n, but needs extra memory."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Splitting sorts the list.\" — splitting only divides; all the sorting happens while MERGING.",
      "\"Merge sort is O(log n).\" — NE: halving gives log n LEVELS, but each level handles all n items.",
      "\"Merge sort is faster in every case.\" — on a tiny or already sorted list a flagged bubble sort can do less work, and merge sort needs extra memory."
    ] } },
    { callout: { t: "mnemonic", h: "\"Split to singles, merge to one\"", body: "Divide until each sublist has **one** item, then merge pairs back to **one** sorted list: log n levels × n work each." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.16 recursion; 4.3.5.1 bubble sort; 4.4.4.2 logarithms and 4.4.4.3 O(n log n); 4.4.4.5 tractable problems; 4.3.4.2 binary search's halving." } }
  ],
  flashcards: [
    ["Merge sort?", "Divide and conquer: split the list into halves until single items, then merge sorted sublists in pairs."],
    ["Time complexity?", "O(n log n) — best, average and worst."],
    ["Why O(n log n)?", "log₂ n levels of splitting, and each level merges n items."],
    ["Base case?", "A sublist of 0 or 1 items — already sorted."],
    ["Merge step?", "Repeatedly take the smaller front item of two sorted lists; copy the remainder."],
    ["Disadvantage vs bubble sort?", "Needs extra memory — O(n)."],
    ["Which of linear search, merge sort, binary search, post-order traversal is O(n log n)?", "Merge sort."],
    ["Why are bubble and merge sort tractable?", "Polynomial (or better) time complexity."],
    ["Max comparisons to merge lists of sizes a and b?", "a + b − 1."]
  ],
  quiz: [
    { q: "Merge sort's time complexity is", opts: ["O(n log n)", "O(n²)", "O(log n)", "O(n)"], ans: 0, why: "Levels × items." },
    { q: "Merging [2, 7] and [3, 5] gives", opts: ["2 3 5 7", "2 7 3 5", "3 5 2 7", "2 3 7 5"], ans: 0, why: "Smaller front each time." },
    { q: "In merge sort, comparisons happen while", opts: ["merging", "splitting", "both equally", "neither"], ans: 0, why: "Splitting just divides." },
    { q: "Merge sort is an example of", opts: ["divide and conquer", "a greedy algorithm", "a brute-force search", "a heuristic"], ans: 0, why: "Spec wording." }
  ],
  sims: ["sort-viz"]
};

/* =====================================================================
   4.3.6.1  Dijkstra's shortest path algorithm
   ===================================================================== */
var WH = { 1: [60, 110], 2: [180, 40], 3: [300, 70], 4: [180, 180], 5: [300, 200], 6: [420, 140] };
function dijkstraFig() {
  var path = { "1-2": 1, "2-3": 1, "3-6": 1 }, D = { 1: 0, 2: 2, 3: 3, 4: 3, 5: 4, 6: 7 }, it = [];
  [[1, 2, 2], [1, 3, 5], [1, 4, 3], [1, 6, 8], [2, 3, 1], [3, 6, 4], [4, 5, 1], [5, 6, 5]].forEach(function (e) {
    var a = WH[e[0]], b = WH[e[1]], on = path[e[0] + "-" + e[1]];
    it = it.concat(link(a[0], a[1], b[0], b[1], { w: e[2], c: on ? "accent2" : null, off: e[0] === 1 && e[1] === 6 ? -11 : 11 }));
  });
  Object.keys(WH).forEach(function (k) {
    it = it.concat(node(WH[k][0], WH[k][1], k, path["1-2"] && (k === "1" || k === "2" || k === "3" || k === "6") ? "accent2" : "accent"));
    it.push(txt(WH[k][0], WH[k][1] + 29, "D=" + D[k], { b: true, size: 10.5, c: "good" }));
  });
  it.push(txt(470, 40, "shortest: 1–2–3–6 = 7", { b: true, size: 11, c: "accent2", pos: "e" }));
  it.push(txt(470, 60, "direct edge 1–6 costs 8", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(470, 80, "1–4–5–6 costs 9", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(470, 100, "P: 1←, 2←1, 3←2, 4←1, 5←4, 6←3", { size: 10.5, c: "text2", pos: "e" }));
  return { fig: { w: 640, h: 235, items: it, cap: "The 2018 warehouse graph after Dijkstra's algorithm from node 1: each node is labelled with its final shortest time D. Following P back from 6 gives the route 6 ← 3 ← 2 ← 1." } };
}
C["compsci:4.3.6.1"] = {
  notes: [
    { h: "Dijkstra's algorithm — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.3.6.1)", body: "Understand and be able to **trace Dijkstra's shortest path algorithm**, and be aware of **applications** of shortest-path algorithms. You will NOT be asked to recall its steps — the pseudo-code is always given — but you must trace it fluently." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Trace the given pseudo-code", "Complete the table", "7", "A-level 2018 Q03.5"],
      ["What the output / array P represent", "What does … represent", "1 + 2", "A-level 2018 Q03.6–7"],
      ["True/false statements about Dijkstra", "Complete", "2", "A-level 2022 Q04.1"],
      ["Purpose of the algorithm", "State", "1", "A-level 2025 Q03.1"],
      ["Heuristics to speed up path-finding", "Explain", "2", "A-level 2017 Q05.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The idea**.", "**The algorithm in C#**.", "**Tracing it**.", "**Applications and limits**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The idea" },
    dijkstraFig(),
    { steps: [
      "Give the start node distance 0 and every other node ∞ (2018 uses 20 as \"infinity\"); no node has a previous node yet.",
      "Repeatedly take the UNVISITED node U with the SMALLEST distance (a priority queue keyed on distance) and mark it visited — its distance is now final.",
      "For each unvisited neighbour V: A = D[U] + weight(U, V). If A < D[V], update D[V] ← A and P[V] ← U (\"relax\" the edge).",
      "Stop when every node is visited (or the target is taken from the queue). D holds shortest distances; follow P backwards for the route."
    ] },
    { callout: { t: "mnemonic", h: "\"Take the nearest, then relax its neighbours\"", body: "Each round: **take** the closest unvisited node (it's now fixed), then **relax** — try to improve every neighbour through it." } },

    { page: "The algorithm in C#" },
    { code: { lang: "csharp", src: "int[,] am = { {0,2,5,3,0,8}, {2,0,1,0,0,0}, {5,1,0,0,0,4},\n              {3,0,0,0,1,0}, {0,0,0,1,0,5}, {8,0,4,0,5,0} };   // the 2018 adjacency matrix\nvar D = Enumerable.Repeat(20, 7).ToArray();    // index 1–6; 20 stands for infinity\nvar P = Enumerable.Repeat(-1, 7).ToArray();\nvar Q = new List<int> { 1, 2, 3, 4, 5, 6 };\nD[1] = 0;\nwhile (Q.Count > 0)\n{\n    int u = Q.OrderBy(v => D[v]).ThenBy(v => v).First();   // next node from the priority queue\n    Q.Remove(u);\n    foreach (int v in Q.ToList())\n    {\n        if (am[u - 1, v - 1] > 0)\n        {\n            int a = D[u] + am[u - 1, v - 1];\n            if (a < D[v]) { D[v] = a; P[v] = u; }          // relax\n        }\n    }\n}\nConsole.WriteLine(D[6]);                                      // 7\nvar path = new List<int>();\nfor (int v = 6; v != -1; v = P[v]) path.Insert(0, v);     // follow P back\nConsole.WriteLine(string.Join(\"-\", path));                   // 1-2-3-6", cap: "Checked by running: the A values come out 2, 5, 3, 8, 3, 7, 4, 9 — exactly the mark scheme's." } },
    { diagram: "dijkstra" },

    { page: "Tracing it" },
    { table: { head: ["U", "Q after removing U", "V", "A = D[U] + AM[U,V]", "Update?", "D[1..6]", "P[1..6]"], rows: [
      ["—", "1,2,3,4,5,6", "", "", "", "0 20 20 20 20 20", "−1 −1 −1 −1 −1 −1"],
      ["1", "2,3,4,5,6", "2", "0 + 2 = 2", "2 < 20 ✓", "0 2 20 20 20 20", "−1 1 −1 −1 −1 −1"],
      ["", "", "3", "0 + 5 = 5", "✓", "0 2 5 20 20 20", "−1 1 1 −1 −1 −1"],
      ["", "", "4", "0 + 3 = 3", "✓", "0 2 5 3 20 20", "−1 1 1 1 −1 −1"],
      ["", "", "6", "0 + 8 = 8", "✓", "0 2 5 3 20 8", "−1 1 1 1 −1 1"],
      ["2", "3,4,5,6", "3", "2 + 1 = 3", "3 < 5 ✓", "0 2 3 3 20 8", "−1 1 2 1 −1 1"],
      ["3", "4,5,6", "6", "3 + 4 = 7", "7 < 8 ✓", "0 2 3 3 20 7", "−1 1 2 1 −1 3"],
      ["4", "5,6", "5", "3 + 1 = 4", "✓", "0 2 3 3 4 7", "−1 1 2 1 4 3"],
      ["5", "6", "6", "4 + 5 = 9", "9 < 7? ✗", "unchanged", "unchanged"],
      ["6", "—", "", "", "", "0 2 3 3 4 7", "−1 1 2 1 4 3"]
    ] } },
    { callout: { t: "warn", h: "Only neighbours still IN Q", body: "\"FOR EACH V IN Q WHERE AM[U, V] > 0\" — a neighbour already removed from Q is never re-examined. That is why U = 2 does not look at node 1, and U = 6 computes nothing." } },

    { page: "Applications and limits" },
    { kv: [
      ["Applications", "satellite navigation and route planning; network routing (link-state protocols such as OSPF choose least-cost paths); delivery and logistics; robot/warehouse path planning (2018's warehouse); flight connections; game AI path-finding"],
      ["Weights", "must be NON-NEGATIVE — a negative edge can make an already-fixed distance wrong"],
      ["Graphs", "works on directed and undirected weighted graphs"],
      ["Heuristics", "for very large maps, A* adds an estimate of the remaining distance (e.g. straight-line distance) to explore promising nodes first — faster, guided by knowledge of the domain"]
    ] },
    { worked: { tag: "variation", title: "Recover the route from P", q: "After the trace, P = [−1, 1, 2, 1, 4, 3] for nodes 1–6. Give the shortest route from 1 to 5 and its cost.",
      steps: [
        { m: "Start at 5: P[5] = 4 → P[4] = 1 → P[1] = −1 (the start).", mk: "1" },
        { m: "Reverse: 1 → 4 → 5.", mk: "1" },
        { m: "Cost D[5] = 4 (3 + 1).", mk: "1" }
      ], result: "1–4–5, cost 4" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Trace Dijkstra on the warehouse", src: "A-level June 2018 · P1 Q03.5 · 7 marks",
      q: "The warehouse graph has edges 1–2 (2), 1–3 (5), 1–4 (3), 1–6 (8), 2–3 (1), 3–6 (4), 4–5 (1), 5–6 (5), stored in adjacency matrix AM. Q is a priority queue ordered on D. Q ← empty; FOR C1 ← 1 TO 6: D[C1] ← 20; P[C1] ← −1; ADD C1 TO Q; ENDFOR; D[1] ← 0; WHILE Q NOT EMPTY: U ← get next node from Q; remove U from Q; FOR EACH V IN Q WHERE AM[U, V] > 0: A ← D[U] + AM[U, V]; IF A < D[V] THEN D[V] ← A; P[V] ← U; ENDIF; ENDFOR; ENDWHILE; OUTPUT D[6]. U is taken in the order 1, 2, 3, 4, 5, 6. Complete a trace table with columns D[1–6], P[1–6], U, Q, V and A.",
      steps: [
        { m: "First value of A is 2;", mk: "1" },
        { m: "Second value of A is 5 and third is 3;", mk: "1" },
        { m: "Fourth and subsequent values of A are 8, 3, 7, 4, 9 — no more after this;", mk: "1" },
        { m: "D[2] set to 2 and then does not change;", mk: "1" },
        { m: "D[3] set to 5, then changes to 3, and does not change again;", mk: "1" },
        { m: "Correct final values for D[1], D[4], D[5], D[6]: 0, 3, 4, 7 (D[6] was 8 before U = 3 improved it);", mk: "1" },
        { m: "Correct final values of P: −1, 1, 2, 1, 4, 3;", mk: "1", n: "I. the output column. Checked by running." }
      ], result: "A: 2,5,3,8,3,7,4,9 · OUTPUT 7" } },
    { worked: { tag: "exam", title: "What the output represents", src: "A-level June 2018 · P1 Q03.6 · 1 mark",
      q: "What does the output from the algorithm (OUTPUT D[6]) represent?",
      steps: [{ m: "The shortest distance/time between locations (nodes) 1 and 6;", mk: "1", n: "NE. distance/time between 1 and 6 — it must be the SHORTEST. R. shortest route/path — the output is a number, not a route." }],
      result: "Shortest time from 1 to 6 (7 minutes)" } },
    { worked: { tag: "exam", title: "The purpose of P", src: "A-level June 2018 · P1 Q03.7 · 2 marks",
      q: "The contents of the array P were changed by the algorithm. What is the purpose of the array P?",
      steps: [
        { m: "To store the previous node/location in the (shortest) path to each node;", mk: "1" },
        { m: "So the path from node 1 to any other node can be recreated;", mk: "1", n: "Alternative: stores the nodes to be traversed and the order to traverse them. Max 1 if it is not clear they form the SHORTEST path." }
      ], result: "Previous node on the shortest path → rebuild the route" } },
    { worked: { tag: "exam", title: "True or false about Dijkstra", src: "A-level June 2022 · P1 Q04.1 · 2 marks",
      q: "For each statement, indicate if it is true or false for Dijkstra's algorithm: (a) calculates the shortest path between a node and other nodes in a graph; (b) can be used to prove that the Halting Problem cannot be solved; (c) can be used with both directed and undirected graphs; (d) can be used with both weighted and unweighted graphs.",
      steps: [
        { m: "(a) True · (b) False · (c) True · (d) False;", mk: "2", n: "1 mark for three rows correct; 2 for all four. AQA's answer to (d) is False: Dijkstra's algorithm is defined on WEIGHTED graphs (an unweighted graph is handled by breadth-first search)." }
      ], result: "T · F · T · F" } },
    { worked: { tag: "exam", title: "The purpose of Dijkstra", src: "A-level June 2025 · P1 Q03.1 · 1 mark",
      q: "State the purpose of Dijkstra's algorithm.",
      steps: [{ m: "To find the shortest (lowest-cost) path between two nodes // from one node to all other nodes in a graph;", mk: "1", n: "A. distance for cost." }],
      result: "Shortest path from a node" } },
    { worked: { tag: "exam", title: "A heuristic technique", src: "A-level June 2017 · P1 Q05.4 · 2 marks",
      q: "A game's enemy finds the shortest path to the hero by looking at every possible path between them; it struggles to compute the path quickly enough, and it has been suggested that a heuristic technique might help. Explain what is meant by a heuristic technique, giving an example of a heuristic technique that might reduce the time taken by the shortest path algorithm.",
      steps: [
        { h: "AO1 knowledge", m: "A heuristic approach employs a method of finding a solution that might not be the best (but is good enough, quickly);", mk: "1" },
        { h: "AO1 understanding", m: "The algorithm might consider visiting fewer cells/coordinates // use knowledge of the domain to cut down the search space // consider visiting certain cells first (e.g. those in the hero's direction);", mk: "1" }
      ], result: "Good-enough answer fast; e.g. explore towards the hero first" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Follow the given pseudo-code exactly** — you are never asked to recall Dijkstra from memory.",
      "Record A EVERY time it is calculated, even when it does not improve D (2018's 9).",
      "Only neighbours still in Q are examined; a removed node's distance is final.",
      "**D** = shortest distances from the start; **P** = previous node on the shortest path → rebuild the route backwards.",
      "Purpose: shortest path from one node to the others in a WEIGHTED graph (non-negative weights)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Dijkstra always takes the cheapest EDGE.\" — it takes the unvisited node with the smallest TOTAL distance from the start.",
      "\"The output is the route.\" — D[6] is a NUMBER (the shortest time); the route comes from P.",
      "\"Once D[V] is set it is final.\" — it can improve (D[3]: 5 → 3) until V itself is removed from Q."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.4.1 weighted graphs and adjacency matrices; 4.2.2.1 priority queues; 4.3.1.1 BFS for unweighted shortest paths; 4.4.4.5 heuristics for intractable problems; 4.9.3 routing in networks." } }
  ],
  flashcards: [
    ["Purpose of Dijkstra's algorithm?", "Find the shortest (lowest-cost) path from one node to the others in a weighted graph."],
    ["Which node is processed next?", "The unvisited node with the smallest distance so far (from a priority queue)."],
    ["Relaxing an edge?", "If D[U] + weight < D[V], set D[V] to it and P[V] ← U."],
    ["What does array D hold at the end?", "The shortest distance from the start to each node."],
    ["What does array P hold?", "The previous node on the shortest path to each node — used to rebuild the route."],
    ["2018 warehouse: D[6]?", "7 — route 1–2–3–6."],
    ["2018 A values in order?", "2, 5, 3, 8, 3, 7, 4, 9."],
    ["Does Dijkstra work with negative weights?", "No."],
    ["Applications?", "Sat-nav route planning, network routing, logistics, game path-finding."],
    ["Heuristic?", "A method that finds a good-enough (not necessarily optimal) solution quickly, e.g. using domain knowledge to prune the search."]
  ],
  quiz: [
    { q: "Dijkstra's algorithm next processes", opts: ["the unvisited node with the smallest distance", "the node with the cheapest edge", "the next node numerically", "the node with most edges"], ans: 0, why: "Priority queue on D." },
    { q: "In the 2018 trace, D[3] ends as", opts: ["3", "5", "1", "4"], ans: 0, why: "Via 2: 2 + 1." },
    { q: "OUTPUT D[6] represents", opts: ["the shortest time from 1 to 6", "the route from 1 to 6", "the number of edges", "the previous node of 6"], ans: 0, why: "R. route." },
    { q: "Which is FALSE for Dijkstra (AQA 2022)?", opts: ["works with weighted and unweighted graphs", "shortest path from a node", "directed and undirected graphs", "uses edge weights"], ans: 0, why: "AQA marks it False." }
  ],
  sims: ["dijkstra"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
