/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.2.6.1
   (hash tables), 4.2.7.1 (dictionaries) and 4.2.8.1 (vectors) at full
   A-level depth, with every program in C#. Each topic REPLACES the entry
   cs-datastructures.js carried and keeps its labs. Every way AQA has
   examined them (7517/1, June 2017–2025) is worked in the mark scheme's own
   format — adding to a hash table, why it beats a sorted list, why it slows
   as it fills, hashing a card number, why a hash table suits a dictionary,
   the 2017 enemy-can-see-the-hero dot products and the 2020 magnitudes,
   dot product and scalar multiples. Every C# listing (linear probing, the
   anagram collision, word counting, dot products and angles) was compiled
   and run under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push(txt(x + w / 2, y + (sub ? h / 2 - 8 : h / 2), label, { b: true, size: 12, c: "text" }));
  if (sub) it.push(txt(x + w / 2, y + h / 2 + 9, sub, { size: 10.5 }));
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.8, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function cells(x, y, vals, o) {
  o = o || {};
  var it = [], w = o.w || 44, h = o.h || 30;
  vals.forEach(function (v, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0, empty = v === "" || v == null;
    var col = hl ? "accent2" : (empty ? "line" : (o.col || "accent"));
    it.push({ poly: [[x + i * w, y], [x + (i + 1) * w, y], [x + (i + 1) * w, y + h], [x + i * w, y + h]], fill: col, alpha: empty ? 0.05 : (hl ? 0.32 : 0.14), c: empty ? "line" : col, w: 1.3 });
    if (!empty) it.push(txt(x + i * w + w / 2, y + h / 2, String(v), { b: true, size: 11.5, c: "text" }));
    it.push(txt(x + i * w + w / 2, y + h + 11, "[" + i + "]", { size: 10 }));
  });
  return it;
}

/* =====================================================================
   4.2.6.1  Hash tables
   ===================================================================== */
function probeFig() {
  var it = cells(40, 60, [33, "", "", 25, 14, 47, "", "", 19, "", ""], { w: 50, hl: [5] });
  it.push(txt(20, 18, "h(k) = k MOD 11 · insert 25, 14, 33, 19, 47 · linear probing", { b: true, size: 11, c: "text", pos: "e" }));
  it = it.concat(arrow(215, 50, 255, 50, null, { c: "danger" }), arrow(265, 50, 305, 50, null, { c: "danger" }));
  it.push(txt(215, 38, "47 MOD 11 = 3: taken", { size: 10.5, c: "danger", pos: "e" }));
  it.push(txt(330, 118, "→ 4 taken → 5 free: 47 stored at [5] after 3 probes", { size: 10.5, c: "accent2" }));
  it.push(txt(330, 136, "14 MOD 11 = 3 collided with 25 too → stored at [4]", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 150, items: it, cap: "Collisions resolved by linear probing (rehash to the next free slot). The cluster at 3–5 makes later searches that hash into it slower." } };
}
C["compsci:4.2.6.1"] = {
  notes: [
    { h: "Hash tables — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.6.1)", body: ["Be familiar with the concept of a **hash table** (a mapping from keys to values) and its uses.", "**Apply simple hashing algorithms**.", "Know what a **collision** is (two keys hash to the same value) and how collisions are handled by **rehashing**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Steps to add a record to a hash table", "Describe", "4–5", "A-level 2021 Q04, 2025 Q01.2"],
      ["Add a card (given a key field) to a hash table", "Describe", "3", "A-level 2022 Q07.3"],
      ["Why a hash table beats a sorted list for finding", "Explain", "1", "A-level 2025 Q01.1"],
      ["Why finding slows as the table fills", "Explain", "1", "A-level 2025 Q01.3"],
      ["Why a hash table suits a dictionary", "Explain", "1", "A-level 2022 Q07.4 (4.2.7.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**How hashing works**.", "**Collisions and rehashing**.", "**A hash table in C#**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "How hashing works" },
    { callout: { t: "def", h: "Hash table", body: "An array in which each record's position is **calculated from its key** by a **hash function** — so a record can be stored and found by going (almost) straight to its slot, without searching. Average look-up is O(1)." } },
    { steps: [
      "Take the record's **key** (a unique field — card number, username).",
      "Apply the **hash function** to the key → an index (the home address) within the table.",
      "Store the record at that index — or find it there later.",
      "If that slot is already in use, a **collision** has happened: rehash to find another slot."
    ] },
    { table: { head: ["Hashing algorithm", "Example (table size 11)", "Note"], rows: [
      ["Modulo (division)", "47 MOD 11 = 3", "a PRIME table size spreads keys better"],
      ["Sum of character codes MOD size", "CAT: 67 + 65 + 84 = 216; 216 MOD 11 = 7", "anagrams collide: ACT also gives 7"],
      ["Folding", "split 123456 into 12+34+56 = 102; 102 MOD 11 = 3", "uses every digit"],
      ["Mid-square", "square the key, take the middle digits", "—"]
    ] } },
    { kv: [
      ["A good hash function", "fast to compute; spreads keys evenly over the table (few collisions); always gives the same index for the same key"],
      ["Load factor", "items ÷ slots — keep it below about 0.7; past that collisions multiply, so the table is resized and every item rehashed"],
      ["Uses", "database indexes, dictionaries (4.2.7.1), caches, symbol tables in compilers, password lookup, de-duplication"]
    ] },

    { page: "Collisions and rehashing" },
    probeFig(),
    { table: { head: ["Method", "How", "Trade-off"], rows: [
      ["Linear probing (open addressing)", "try the next slot, then the next (wrapping round) until one is free", "simple; causes CLUSTERS, so searches lengthen"],
      ["Rehash with a skip / second hash", "add a fixed step (or a second hash of the key) each time", "breaks up clusters"],
      ["Chaining", "each slot holds a linked list of every record that hashed there", "never full; a long chain is a linear search"]
    ] } },
    { callout: { t: "warn", h: "Searching after probing", body: "To FIND 47, hash to 3 and keep probing until you meet 47 (found) or an EMPTY slot (not there). Deleting a record must leave a \"deleted\" marker, or a later search would stop early at the gap." } },

    { page: "A hash table in C#" },
    { code: { lang: "csharp", src: "class HashTable\n{\n    private readonly int?[] slots;                 // null = empty slot\n    public HashTable(int size) { slots = new int?[size]; }\n    private int Hash(int key) => key % slots.Length;\n\n    public int Insert(int key)\n    {\n        int i = Hash(key), tries = 0;\n        while (slots[i] != null)                   // collision → linear probe\n        {\n            i = (i + 1) % slots.Length;\n            if (++tries == slots.Length) throw new InvalidOperationException(\"table full\");\n        }\n        slots[i] = key;\n        return i;\n    }\n\n    public int Find(int key)\n    {\n        int i = Hash(key);\n        for (int tries = 0; tries < slots.Length && slots[i] != null; tries++)\n        {\n            if (slots[i] == key) return i;\n            i = (i + 1) % slots.Length;\n        }\n        return -1;                                 // reached an empty slot: absent\n    }\n}\n// insert 25, 14, 33, 19, 47 → slots 3, 4, 0, 8, 5 · Find(47) = 5 after 3 probes · Find(36) = −1 after 4", cap: "Checked by running. C#'s own Dictionary<K,V> and HashSet<T> are hash tables." } },
    { worked: { tag: "variation", title: "Hash the strings", q: "With h(key) = (sum of ASCII codes) MOD 11, hash CAT, ACT and DOG into an empty table of 11 slots using linear probing. (C = 67, A = 65, T = 84, D = 68, O = 79, G = 71.)",
      steps: [
        { m: "CAT: 67 + 65 + 84 = 216; 216 MOD 11 = 7 → slot 7.", mk: "1" },
        { m: "ACT: the same sum, 216 → 7 — a collision; probe → slot 8.", mk: "1" , "fig": {"w":528,"h":100,"items":[{"poly":[[10,40],[56,40],[56,74],[10,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[33,88],"t":"0","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[56,40],[102,40],[102,74],[56,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[79,88],"t":"1","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[102,40],[148,40],[148,74],[102,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[125,88],"t":"2","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[148,40],[194,40],[194,74],[148,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[171,88],"t":"3","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[194,40],[240,40],[240,74],[194,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[217,88],"t":"4","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[240,40],[286,40],[286,74],[240,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[263,88],"t":"5","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[286,40],[332,40],[332,74],[286,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[309,88],"t":"6","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[332,40],[378,40],[378,74],[332,74]],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[355,57],"t":"CAT","size":11.5,"c":"text","b":true,"pos":"c"},{"text":[355,88],"t":"7","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[378,40],[424,40],[424,74],[378,74]],"fill":"accent2","alpha":0.18,"c":"accent2","w":1.6},{"text":[401,57],"t":"ACT","size":11.5,"c":"text","b":true,"pos":"c"},{"text":[401,88],"t":"8","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[424,40],[470,40],[470,74],[424,74]],"fill":"accent","alpha":0.18,"c":"accent","w":1.6},{"text":[447,57],"t":"DOG","size":11.5,"c":"text","b":true,"pos":"c"},{"text":[447,88],"t":"9","size":10.5,"c":"muted","b":false,"pos":"c"},{"poly":[[470,40],[516,40],[516,74],[470,74]],"fill":"muted","alpha":0.04,"c":"muted","w":1.6},{"text":[493,88],"t":"10","size":10.5,"c":"muted","b":false,"pos":"c"},{"line":[[362,34],[394,34]],"c":"accent2","w":1.6,"arrow":true},{"text":[378,18],"t":"probe","size":10.5,"c":"accent2","b":false,"pos":"c"}],"cap":"ACT hashes to 7 too, so linear probing places it in slot 8."}},
        { m: "DOG: 68 + 79 + 71 = 218; 218 MOD 11 = 9 → slot 9 (free).", mk: "1", n: "A sum of codes ignores order, so every anagram collides — a weakness of this hash function." }
      ], result: "CAT 7 · ACT 8 · DOG 9" , "try": [{"grid":{"cols":["Key","Sum of codes","h(key)","Slot"],"rows":[["BAT","215","6","6"],["TAB","215","6","7"],["COT","230","10","10"],["CAB","198","0","0"]],"given":[[0,0],[1,0],[2,0],[3,0]],"cap":"Into a fresh 11-slot table, in this order, with the same h and linear probing (B = 66, O = 79)."}}]} },
    { diagram: "hash-table" },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Add a record to a hash table", src: "A-level June 2021 · P1 Q04 · 5 marks",
      q: "Describe the steps involved in adding a record to a hash table.",
      steps: [
        { m: "A hash algorithm is applied;", mk: "1" },
        { m: "…to the key value;", mk: "1", n: "NE. to the data/item." },
        { m: "The result is the location in the table where the record should be stored;", mk: "1" },
        { m: "If the location is not empty;", mk: "1" },
        { m: "…then use the next free location (or another feasible collision-resolution method);", mk: "1" }
      ], result: "Hash the KEY → location → collision? → next free" , "try": [{"lab":"hash-table"}]} },
    { worked: { tag: "exam", title: "Why faster than a sorted list", src: "A-level June 2025 · P1 Q01.1 · 1 mark",
      q: "Two data structures that can be used to store a collection of data records are a hash table and a sorted list. Explain why a record in a hash table can normally be found more quickly than a record in a sorted list.",
      steps: [{ m: "The hashing algorithm determines the memory location/index to use // there is no need to search through the records to find the required one;", mk: "1", n: "A sorted list still needs a binary search: O(log n) comparisons vs about O(1)." }],
      result: "Computed location — no search" } },
    { worked: { tag: "exam", title: "Adding a new record, four steps", src: "A-level June 2025 · P1 Q01.2 · 4 marks",
      q: "Describe the steps involved in adding a new record to a hash table.",
      steps: [
        { m: "Apply the hashing algorithm/function;", mk: "1" },
        { m: "…to the (unique/primary) key;", mk: "1", n: "NE. data." },
        { m: "Insert the data at the index (address) obtained;", mk: "1" },
        { m: "If there is already data there, use a suitable method for collision handling;", mk: "1", n: "A. by example, e.g. store in the next free slot." }
      ], result: "Hash key → index → store → handle collision" } },
    { worked: { tag: "exam", title: "Why it slows as it fills", src: "A-level June 2025 · P1 Q01.3 · 1 mark",
      q: "Explain why the time taken to find a specific record in a hash table can increase when lots of records are stored in the table.",
      steps: [{ m: "More collisions occur, meaning direct access will not happen as frequently // more items are not stored at the index calculated by the hash function;", mk: "1", n: "NE. \"more collisions occur\" alone — say what that does to the search. A. a linear search is needed through records with the same hash." }],
      result: "More collisions → fewer direct hits" } },
    { worked: { tag: "exam", title: "Add a card to a hash table", src: "A-level June 2022 · P1 Q07.3 · 3 marks",
      q: "A card game stores its cards in a list; each card has a unique CardNumber. A hash table could have been used instead of a list. Describe how a card would be added to a hash table.",
      steps: [
        { h: "AO2", m: "A hash algorithm/function is applied to CardNumber;", mk: "1", n: "NE. \"primary key\" — name the field." },
        { h: "AO1", m: "The result indicates the location the card should be stored in;", mk: "1" },
        { m: "If there is already a card in that location, a method is needed to deal with the collision (e.g. next free slot);", mk: "1" }
      ], result: "Hash CardNumber → slot → resolve collision" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Add**: hash the KEY (name it) → index → empty? store : collision → rehash (next free / skip / chain).",
      "**Find**: hash → compare → probe until found or an empty slot.",
      "**Speed**: O(1) on average because the location is computed; collisions push it towards O(n).",
      "**Arithmetic**: show the MOD working; wrap past the last index to 0."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"Hash the data.\" — NE every time: you hash the KEY field.", "\"A collision overwrites the old record.\" — never; the new record is rehashed to another slot.", "\"Hash tables are always O(1).\" — only on average; with many collisions a search degrades towards O(n)."] } },
    { callout: { t: "mnemonic", h: "\"Hash the key, go to the slot, probe if it's taken\"", body: "**Key** (never \"the data\") → **hash function** → **index** → store. Slot taken? That's a **collision**: rehash to the next free slot, skip on, or chain." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.7.1 dictionaries are usually hash tables; 4.1.1.3 MOD; 4.3.4.1/4.3.4.2 linear and binary search for comparison; 4.4.4.3 O(1) vs O(log n); 4.5.6.10 cryptographic hashes for passwords and signatures; 4.10.2 database indexes." } }
  ],
  flashcards: [
    ["What is a hash table?", "An array in which a record's position is calculated from its key by a hash function."],
    ["What is a hash function?", "An algorithm mapping a key to an index in the table."],
    ["What is a collision in a hash table?", "Two different keys hashing to the same index."],
    ["What is rehashing?", "Finding another slot after a collision, e.g. the next free slot."],
    ["What problem does linear probing cause?", "Clustering — runs of filled slots make searches longer."],
    ["How does chaining handle collisions?", "Each slot holds a list of all records that hashed to it."],
    ["Why are hash tables fast?", "The location is calculated, so no search is needed (average O(1))."],
    ["Why do hash tables slow down when nearly full?", "More collisions, so fewer records are at their calculated index."],
    ["What is 47 MOD 11?", "3.", 9]
  ],
  quiz: [
    { q: "With h(k) = k MOD 11 and slot 3 occupied, linear probing tries next", opts: ["slot 4", "slot 2", "slot 0", "slot 3 again"], ans: 0, why: "Linear probing moves to the next slot, here slot 4, when the one it hashed to is taken." },
    { q: "An answer that hashes 'the data' rather than the key gets", opts: ["NE — it must be the key", "full marks — either one is accepted", "a bonus mark for the extra detail", "1 of 2 — half credit for the idea"], ans: 0, why: "Both 2021 and 2025 schemes." },
    { q: "Searching for an absent key with linear probing stops at", opts: ["an empty slot", "the end of the array", "the home slot", "slot 0"], ans: 0, why: "Nothing beyond a gap." },
    { q: "Which makes collisions more likely?", opts: ["a high load factor", "a prime table size", "an even spread of keys", "a larger table"], ans: 0, why: "A fuller table (higher load factor) has fewer free slots, so keys are more likely to collide." }
  ],
  sims: ["hash-table"]
};

/* =====================================================================
   4.2.7.1  Dictionaries
   ===================================================================== */
C["compsci:4.2.7.1"] = {
  notes: [
    { h: "Dictionaries — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.7.1)", body: "Be familiar with the concept of a **dictionary** — a collection of **key–value pairs** in which a value is **accessed via its key** — and simple applications such as **information retrieval**, with experience of using a dictionary in a programming language." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why a hash table suits a dictionary", "Explain", "1", "A-level 2022 Q07.4"],
      ["Build or amend a dictionary in a program", "Write", "Section D", "A-level 2018 CreateTileDictionary"],
      ["Represent a vector as a dictionary", "—", "—", "4.2.8.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Key–value pairs**.", "**Dictionaries in C#**.", "**Information retrieval**.", "**Inside a dictionary**: how it is implemented and what each choice costs.", "**Dictionaries in programs**: lookup tables, grouping and the mistakes to avoid.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Key–value pairs" },
    { fig: { w: 640, h: 150, items: [].concat(
      boxAt(30, 20, 120, 32, "'grass'", "accent"), boxAt(30, 60, 120, 32, "'green'", "accent"), boxAt(30, 100, 120, 32, "'grows'", "accent"),
      boxAt(270, 20, 70, 32, "1", "good"), boxAt(270, 60, 70, 32, "2", "good"), boxAt(270, 100, 70, 32, "1", "good"),
      arrow(150, 36, 270, 36, null, { c: "text2" }), arrow(150, 76, 270, 76, null, { c: "text2" }), arrow(150, 116, 270, 116, null, { c: "text2" }),
      [txt(90, 10, "keys (unique)", { size: 10.5, c: "text2" }), txt(305, 10, "values", { size: 10.5, c: "text2" }),
        txt(390, 50, "'The green, green grass grows'", { size: 10.5, c: "text2", pos: "e" }), txt(390, 70, "→ {'grass': 1, 'green': 2,", { size: 10.5, c: "text2", pos: "e" }), txt(390, 88, "    'grows': 1, 'the': 1}", { size: 10.5, c: "text2", pos: "e" })]
    ), cap: "The specification's own example: each distinct word (the key) maps to how often it appears (the value), ignoring letter case." } },
    { kv: [
      ["Key", "unique within the dictionary; used to look the value up"],
      ["Value", "the data associated with the key — may repeat, may be any type (even a list or another dictionary)"],
      ["Operations", "add a pair · look up the value for a key · change a value · remove a pair · test whether a key exists"],
      ["Implemented as", "a hash table (fast, unordered) or a balanced tree (sorted keys)"]
    ] },

    { page: "Dictionaries in C#" },
    { code: { lang: "csharp", src: "var stock = new Dictionary<string, int> { [\"apples\"] = 12 };\nstock[\"pears\"] = 4;                         // add a pair\nstock[\"apples\"] += 3;                       // change a value: 15\n\nConsole.WriteLine(stock.ContainsKey(\"plums\"));          // False\nif (stock.TryGetValue(\"pears\", out int p)) Console.WriteLine(p);   // 4\nstock.Remove(\"pears\");\n\n// stock[\"plums\"] throws KeyNotFoundException — test or use TryGetValue first\nforeach (var kv in stock) Console.WriteLine(kv.Key + \": \" + kv.Value);", cap: "Checked by running. SortedDictionary keeps keys in order; Dictionary does not promise any order." } },
    { diagram: "dictionary" },

    { page: "Information retrieval" },
    { code: { lang: "csharp", src: "var counts = new SortedDictionary<string, int>();\nstring doc = \"The green, green grass grows\";\nforeach (string w in doc.ToLower().Split(new[] { ' ', ',' }, StringSplitOptions.RemoveEmptyEntries))\n    counts[w] = counts.TryGetValue(w, out int c) ? c + 1 : 1;    // new word → 1, seen → +1\n\nConsole.WriteLine(\"{\" + string.Join(\", \", counts.Select(kv => \"'\" + kv.Key + \"': \" + kv.Value)) + \"}\");\n// {'grass': 1, 'green': 2, 'grows': 1, 'the': 1}", cap: "Checked: exactly the specification's dictionary. A search engine builds the same kind of table for every document." } },
    { worked: { tag: "variation", title: "Which documents mention a word?", q: "Doc 1 = \"green grass\", doc 2 = \"red grass\", doc 3 = \"green tea\". Build an index dictionary that maps each word to the documents containing it, and use it to answer \"green AND grass\".",
      steps: [
        { m: "Key = word, value = a set of document numbers: green → {1, 3}, grass → {1, 2}, red → {2}, tea → {3}.", mk: "1" },
        { m: "Look up both keys — two direct accesses, no scan of the documents.", mk: "1" },
        { m: "Intersect the sets: {1, 3} ∩ {1, 2} = {1}.", mk: "1" }
      ], result: "Document 1" , "try": [{"predict":{"code":"var index = new Dictionary<string, List<int>>();\nstring[] docs = { \"green grass\", \"red grass\", \"green tea\" };\nfor (int d = 0; d < docs.Length; d++)\n{\n    foreach (string w in docs[d].Split(' '))\n    {\n        if (!index.ContainsKey(w)) index[w] = new List<int>();\n        index[w].Add(d + 1);\n    }\n}\n\nforeach (int n in index[\"green\"])\n{\n    if (index[\"tea\"].Contains(n)) Console.WriteLine(n);\n}\nConsole.WriteLine(index.Count);","cap":"The index built in C#, then \"green AND tea\". What is printed?"}}]} },

    { page: "Inside a dictionary" },
    { callout: { t: "info", h: "An abstract data type, not a structure in memory", body: ["A dictionary says WHAT you can do: add a pair, look a key up, change or remove a pair, test whether a key exists.", "It does not say HOW the pairs are stored. That choice decides how fast each operation is, and whether the keys come out in order."] } },
    { fig: { w: 640, h: 214, items: [].concat(
      boxAt(20, 44, 110, 28, "'apples'", "accent"), boxAt(20, 104, 110, 28, "'pears'", "accent"), boxAt(20, 164, 110, 28, "'plums'", "accent"),
      boxAt(360, 20, 160, 28, null, "line"), boxAt(360, 50, 160, 28, null, "line"), boxAt(360, 80, 160, 28, "'apples' : 15", "good"),
      boxAt(360, 110, 160, 28, null, "line"), boxAt(360, 140, 160, 28, "'pears' : 4", "good"), boxAt(360, 170, 160, 28, null, "line"),
      boxAt(550, 80, 84, 28, "'plums' : 7", "accent2"),
      arrow(130, 58, 356, 92, null, { c: "text2" }), arrow(130, 118, 356, 152, null, { c: "text2" }), arrow(130, 178, 356, 98, null, { c: "accent2" }),
      [txt(196, 54, "hash → 2", { size: 10.5, c: "text2" }), txt(196, 114, "hash → 4", { size: 10.5, c: "text2" }), txt(214, 176, "hash → 2", { size: 10.5, c: "accent2" })],
      arrow(520, 94, 550, 94, null, { c: "accent2" }),
      [txt(75, 24, "keys", { size: 10.5, c: "text2" }), txt(440, 10, "slots of the hash table", { size: 10.5, c: "text2" }),
        txt(366, 34, "0", { size: 10, pos: "e" }), txt(366, 64, "1", { size: 10, pos: "e" }), txt(366, 94, "2", { size: 10, pos: "e" }),
        txt(366, 124, "3", { size: 10, pos: "e" }), txt(366, 154, "4", { size: 10, pos: "e" }), txt(366, 184, "5", { size: 10, pos: "e" }),
        txt(592, 124, "collision:", { size: 10, c: "accent2" }), txt(592, 138, "chained on", { size: 10, c: "accent2" })]
    ), cap: "A dictionary built on a hash table. The key is hashed to a slot index and the WHOLE pair is stored there. 'plums' hashes to the same slot as 'apples', so it is chained on; a lookup hashes the key, goes to that slot and compares the stored keys until one matches." } },
    { callout: { t: "key", h: "Why the slot stores the key as well as the value", body: ["Two keys can hash to the same slot.", "Only by comparing the stored key with the one asked for can the dictionary tell 'apples' : 15 from 'plums' : 7."] } },
    { h: "Four ways to store the pairs" },
    { table: { head: ["Stored as", "Look up a key", "Add a pair", "Keys in order?"], rows: [
      ["Unsorted list of pairs", "O(n): linear search", "O(n): must first check the key is new", "No"],
      ["Sorted array of pairs", "O(log n): binary search", "O(n): later pairs shift up", "Yes"],
      ["Hash table", "O(1) on average", "O(1) on average", "No"],
      ["Balanced binary search tree", "O(log n)", "O(log n)", "Yes, by in-order traversal"]
    ] } },
    { callout: { t: "tip", h: "Matching the implementation to the job", body: ["Lookups by key only, as fast as possible: a hash table (C#'s Dictionary).", "Keys needed in order too, for a sorted report or the first key after a given one: a balanced tree (C#'s SortedDictionary)."] } },
    { worked: { tag: "variation", title: "Trace a run of dictionary operations", q: "An empty dictionary d is changed by: d[\"cat\"] ← 3; d[\"dog\"] ← 5; d[\"cat\"] ← d[\"cat\"] + 1; remove \"dog\"; d[\"eel\"] ← 2. State the final contents, the number of pairs, and the value of d[\"cat\"].",
      steps: [
        { m: "After the first two: {cat: 3, dog: 5};", mk: "1" },
        { m: "Assigning to an existing key REPLACES its value, so cat becomes 4 and no second 'cat' pair is made;", mk: "1", n: "The most common slip is to write {cat: 3, dog: 5, cat: 4}: a key can appear only once." },
        { m: "Removing \"dog\" deletes the whole pair, then eel is added: {cat: 4, eel: 2}, two pairs, d[\"cat\"] = 4.", mk: "1" }
      ], result: "{cat: 4, eel: 2}; 2 pairs; 4" } },
    { worked: { tag: "variation", title: "An array or a dictionary?", q: "A school has 300 pupils, each with a four-digit candidate number from 1000 to 9999. A program must find a pupil's record from the candidate number. Compare storing the records in an array indexed by candidate number with storing them in a dictionary keyed by candidate number.",
      steps: [
        { m: "An array indexed by candidate number needs 9 000 elements for 300 pupils, so about 97% of them are unused: wasted memory;", mk: "1" },
        { m: "though its lookup is a direct index, O(1), with no hashing;", mk: "1" },
        { m: "A dictionary holds only the 300 pairs that exist, still with direct access by key through hashing;", mk: "1" },
        { m: "so the dictionary suits sparse keys, and it would also accept keys that are not numbers, such as a pupil's username.", mk: "1" }
      ], result: "Dictionary: the same direct access without 8 700 empty slots" } },

    { page: "Dictionaries in programs" },
    { kv: [
      ["Counting", "key = an item, value = how many times it is seen (the word count)"],
      ["Grouping", "key = a category, value = a list of the items in it (the search index)"],
      ["Lookup table", "key = a code, value = what it stands for: letter → Morse, numeral → value, product code → price"],
      ["Memoisation", "key = a function's argument, value = its result, so a repeated call is a lookup instead of a recomputation"]
    ] },
    { worked: { tag: "variation", title: "Roman numerals with a lookup table", q: "A program stores the value of each Roman numeral in a dictionary and adds them up, subtracting a numeral that comes before a larger one. Work out the value of XLIV.",
      steps: [
        { m: "Look up each numeral: X = 10, L = 50, I = 1, V = 5;", mk: "1" },
        { m: "X is before the larger L, so it is subtracted: −10 + 50 = 40;", mk: "1" },
        { m: "I is before the larger V: −1 + 5 = 4, so the total is 40 + 4 = 44.", mk: "1" }
      ], result: "44", "try": [{"predict":{"code":"var value = new Dictionary<char, int> { ['I'] = 1, ['V'] = 5, ['X'] = 10, ['L'] = 50, ['C'] = 100 };\nforeach (string s in new string[] { \"XLIV\", \"CXIX\" })\n{\n    int total = 0;\n    for (int i = 0; i < s.Length; i++)\n    {\n        int v = value[s[i]];\n        if (i + 1 < s.Length && value[s[i + 1]] > v) total -= v;\n        else total += v;\n    }\n    Console.WriteLine(s + \" = \" + total);\n}","expect":"XLIV = 44\nCXIX = 119","cap":"The same rule in C#, for XLIV and CXIX. What is printed?"}}]} },
    { callout: { t: "warn", h: "Common mistakes", body: ["Reading a key before checking it exists: C#'s d[key] throws KeyNotFoundException. Test with ContainsKey or use TryGetValue.", "Adding pairs to a dictionary while looping over it with foreach: C# throws InvalidOperationException. Collect the new pairs first, then add them after the loop.", "Expecting the pairs to come out in the order they went in. Use a sorted dictionary when order matters.", "Calling a dictionary 'indexed by position'. It is accessed by KEY; there is no first or second pair."] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Why a hash table suits a dictionary", src: "A-level June 2022 · P1 Q07.4 · 1 mark",
      q: "A hash table can be used to implement a dictionary data structure. Explain why a hash table is a suitable choice.",
      steps: [{ m: "It allows direct (faster) access to the value being looked up // there is no need to search through the list to find a value (assuming a good hash function);", mk: "1" }],
      result: "Direct access by key" } },
    { worked: { tag: "variation", title: "Tile values as a dictionary", q: "A word game scores letters: A, E, I = 1; J, X = 4 (changed from 8); Z = 5. Write C# that builds the dictionary and scores \"JAZZ\".",
      steps: [
        { m: "var tileValues = new Dictionary<char, int> { ['A'] = 1, ['E'] = 1, ['I'] = 1, ['J'] = 4, ['X'] = 4, ['Z'] = 5 };", mk: "build" },
        { m: "int score = 0; foreach (char ch in \"JAZZ\") score += tileValues[ch];", mk: "look up" },
        { m: "4 + 1 + 5 + 5 = 15. Changing J and X is one edit each to the dictionary — no other code changes.", mk: "result" }
      ], result: "15" , "try": [{"predict":{"code":"var tileValues = new Dictionary<char, int> { ['A'] = 1, ['E'] = 1, ['I'] = 1, ['J'] = 4, ['X'] = 4, ['Z'] = 5 };\nforeach (string word in new string[] { \"AXE\", \"ZIP\" })\n{\n    int score = 0;\n    foreach (char ch in word)\n    {\n        if (tileValues.ContainsKey(ch)) score += tileValues[ch];\n    }\n    Console.WriteLine(word + \" \" + score);\n}","expect":"AXE 6\nZIP 6","cap":"Two more words. P is not in the dictionary: what does ContainsKey do for it?"}}]} },

    { page: "Exam toolkit" },
    { steps: [
      "**Dictionary** = key → value; keys unique; look up BY KEY.",
      "**Hash table** implementation → direct access, no search.",
      "**Information retrieval**: word → frequency, or word → documents.",
      "**C#**: Dictionary<K,V>, TryGetValue to avoid KeyNotFoundException.",
      "**Implementation**: hash table O(1) average, unordered; balanced tree O(log n), keys in order; the slot stores the key too."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"A dictionary keeps items in the order they were added.\" — not guaranteed by a hash table; use a sorted dictionary when order matters.", "\"Keys can repeat if the values differ.\" — every key is unique: assigning to an existing key replaces its value, and C#'s Add throws an ArgumentException."] } },
    { callout: { t: "mnemonic", h: "\"One key opens one value\"", body: "Each unique **key** unlocks exactly one **value**. Implemented as a hash table, the key leads straight to it — **direct access**, no search." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.6.1 hash tables; 4.2.8.1 a vector as a dictionary (index ↦ value); 4.12.1.1 a function as a mapping; 4.11 big data and search indexes; 4.10 primary keys in databases." } }
  ],
  flashcards: [
    ["Why implement a dictionary with a hash table?", "Direct access to a value from its key — no search.", 2],
    ["Dictionary for 'The green, green grass grows'?", "{'grass': 1, 'green': 2, 'grows': 1, 'the': 1}", 3],
    ["C# lookup that cannot throw for a missing key?", "TryGetValue(key, out value).", 4],
    ["How are dictionaries used in information retrieval?", "Word frequencies; word → list of documents containing it.", 5],
    ["How does a dictionary differ from an array?", "Array: integer position. Dictionary: any key type.", 6],
    ["Missing key with dict[key] in C#?", "KeyNotFoundException.", 7]
  ],
  quiz: [
    { q: "In a dictionary the value is accessed by", opts: ["its key", "its position", "a hash of the value", "a search of every pair"], ans: 0, why: "A dictionary stores key-value pairs, and you get the value by supplying its key." },
    { q: "A hash table suits a dictionary because", opts: ["it gives direct access by key", "it keeps keys sorted", "it uses less memory than an array", "it allows duplicate keys"], ans: 0, why: "A-level 2022 Q07.4." },
    { q: "Counting 'a b a' gives", opts: ["{a: 2, b: 1}", "{a: 1, b: 1}", "{2: a, 1: b}", "{a: 1, b: 2}"], ans: 0, why: "The word is the key and its count is the value, so 'a b a' gives a: 2 and b: 1." },
    { q: "Dictionary keys must be", opts: ["unique", "integers", "sorted", "strings"], ans: 0, why: "One value per key." }
  ],
  sims: ["dictionary"]
};

/* =====================================================================
   4.2.8.1  Vectors
   ===================================================================== */
function vectorFig() {
  var ox = 220, oy = 130, s = 22, it = [];
  var P = function (x, y) { return [ox + x * s, oy - y * s]; };
  it.push({ line: [[ox - 120, oy], [ox + 200, oy]], c: "line", w: 1 });
  it.push({ line: [[ox, oy + 80], [ox, oy - 120]], c: "line", w: 1 });
  var a = P(4, 3), b = P(4, 0), na = P(-4, -3), a2 = P(2, 1.5);
  it = it.concat(arrow(ox, oy, a[0], a[1], null, { c: "accent2" }), arrow(ox, oy, b[0], b[1], null, { c: "accent" }), arrow(ox, oy, na[0], na[1], null, { c: "danger", dash: "5 4" }));
  it.push(txt(a[0] + 8, a[1] - 4, "a = [4, 3], |a| = 5", { size: 10.5, c: "accent2", pos: "e" }));
  it.push(txt(b[0] + 8, b[1] + 14, "b = [4, 0], |b| = 4", { size: 10.5, c: "accent", pos: "e" }));
  it.push(txt(na[0] - 6, na[1] + 6, "−a = [−4, −3]", { size: 10.5, c: "danger", pos: "w" }));
  it.push(txt(ox + 36, oy - 10, "θ", { b: true, size: 12, c: "text" }));
  it.push(txt(430, 40, "a · b = 4×4 + 3×0 = 16", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(430, 60, "cos θ = 16 ÷ (5 × 4) = 0.8", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(430, 80, "θ = 36.87°", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(430, 100, "angle(−a, b) = 180 − 36.87 = 143.13°", { size: 10.5, c: "danger", pos: "e" }));
  return { fig: { w: 640, h: 220, items: it, cap: "A-level 2020's vectors drawn as arrows from the origin. Multiplying by −1 keeps the length but reverses the direction." } };
}
C["compsci:4.2.8.1"] = {
  notes: [
    { h: "Vectors — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.2.8.1)", body: ["Be familiar with the concept of a **vector** and its notations — a list [2.0, 3.14159, −1.0, 2.718281828].", "A **4-vector over ℝ** written **ℝ⁴**.", "The **function** interpretation 0 ↦ 2.0, 1 ↦ 3.14159, …", "All entries from the **same field**.", "**Dictionary, list and 1-D array** representations.", "Visualising as an **arrow**.", "**Addition** (translation) and **scalar–vector multiplication** (scaling)", "**Convex combination** αu + βv (α, β ≥ 0, α + β = 1)", "The **dot product** and its applications (the angle between vectors)."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Dot product", "Calculate", "1–2", "A-level 2017 Q05.1, 2020 Q01.2"],
      ["Vector addition", "Perform", "1", "A-level 2017 Q05.2"],
      ["Apply a dot-product algorithm (can the enemy see?)", "Complete the table", "3", "A-level 2017 Q05.3"],
      ["Magnitude", "What is", "1", "A-level 2020 Q01.1"],
      ["Effect of a scalar multiple on angle and magnitude", "Describe", "2 + 2", "A-level 2020 Q01.3–4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Notation and representations**.", "**Arrows, addition and scaling**.", "**Convex combinations**.", "**The dot product**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Notation and representations" },
    { kv: [
      ["List notation", "[2.0, 3.14159, −1.0, 2.718281828]"],
      ["Space", "four real entries → a 4-vector over ℝ, a member of ℝ⁴. Every entry comes from the same field (all reals)"],
      ["Function interpretation", "a vector is a function f : S → ℝ with S = {0, 1, 2, 3}: 0 ↦ 2.0, 1 ↦ 3.14159, 2 ↦ −1.0, 3 ↦ 2.718281828 (↦ \"maps to\")"],
      ["Dictionary representation", "{0: 2.0, 1: 3.14159, 2: −1.0, 3: 2.718281828} — natural for the function view"],
      ["List / 1-D array", "double[] v = { 2.0, 3.14159, -1.0, 2.718281828 }; — index i holds entry i"]
    ] },
    { code: { lang: "csharp", src: "double[] v = { 2.0, 3.14159, -1.0, 2.718281828 };                 // 1-D array\nvar vl = new List<double> { 2.0, 3.0 };                              // list: a 2-vector\nvar vd = new Dictionary<int, double> { [0] = 2.0, [1] = 3.14159,\n                                       [2] = -1.0, [3] = 2.718281828 };   // dictionary: index ↦ value\nConsole.WriteLine(vd[2]);                                             // -1", cap: "Three representations of the same ℝ⁴ vector. Checked by running." } },

    { page: "Arrows, addition and scaling" },
    vectorFig(),
    { table: { head: ["Operation", "Rule", "Geometric effect", "Example"], rows: [
      ["Addition u + v", "add component by component", "translation — follow u then v", "[5, 2] + [3, 1] = [8, 3]"],
      ["Subtraction v − u", "subtract component by component", "the vector FROM u's head TO v's head", "[8, 3] − [2, 7] = [6, −4]"],
      ["Scalar multiple k·u", "multiply every component by k", "scaling: length × |k|; k < 0 reverses direction", "2·[4, 3] = [8, 6]"],
      ["Magnitude |u|", "√(u₁² + u₂² + …)", "the arrow's length", "|[4, 3]| = √(16 + 9) = 5"]
    ] } },
    { diagram: "cs-vector" },

    { page: "Convex combinations" },
    { callout: { t: "def", h: "Convex combination", body: "An expression **αu + βv** where **α, β ≥ 0** and **α + β = 1**. Every convex combination of two vectors is a point on the **straight line segment** between them: α = 1 gives u, β = 1 gives v, α = β = 0.5 the midpoint." } },
    { worked: { tag: "variation", title: "A point along the segment", q: "u = [2, 0], v = [0, 4]. Find 0.25u + 0.75v and say whether 0.5u + 0.7v is a convex combination.",
      steps: [
        { m: "0.25 × [2, 0] = [0.5, 0]; 0.75 × [0, 4] = [0, 3].", mk: "1" },
        { m: "Sum: [0.5, 3] — three-quarters of the way from u to v.", mk: "1", n: "Checked in C#." },
        { m: "0.5 + 0.7 = 1.2 ≠ 1, so 0.5u + 0.7v is NOT a convex combination (it lies off the segment).", mk: "1" , "fig": {"x":[-0.6,3],"y":[-0.5,4.5],"aspect":"equal","w":360,"h":320,"items":[{"line":[[0,0],[2,0]],"arrow":true,"c":"muted","label":"u","lpos":0.6,"loff":12},{"line":[[0,0],[0,4]],"arrow":true,"c":"muted","label":"v","lpos":0.6,"loff":12},{"line":[[2,0],[0,4]],"c":"accent","w":2.2},{"pt":[0.5,3],"label":"0.25u + 0.75v","pos":"ne","c":"good"},{"pt":[1,2.8],"open":true,"label":"0.5u + 0.7v","pos":"se","c":"danger"}],"cap":"Convex combinations lie on the segment from u to v; [1, 2.8] does not."}}
      ], result: "[0.5, 3]; no" } },

    { page: "The dot product" },
    { callout: { t: "def", h: "Dot (scalar) product", body: "u · v = u₁v₁ + u₂v₂ + … + uₙvₙ — a single NUMBER. Also u · v = |u| |v| cos θ, where θ is the angle between them, so **cos θ = (u · v) ÷ (|u| |v|)**." } },
    { table: { head: ["Sign of u · v", "Angle θ", "Meaning (2017's game)"], rows: [
      ["> 0", "acute (< 90°)", "v points broadly the same way as u — the enemy CAN see the hero"],
      ["= 0", "90°", "perpendicular"],
      ["< 0", "obtuse (> 90°)", "v points broadly backwards — behind the enemy"]
    ] } },
    { code: { lang: "csharp", src: "double Dot(double[] x, double[] y) => x.Zip(y, (p, q) => p * q).Sum();\ndouble Mag(double[] x) => Math.Sqrt(Dot(x, x));\n\ndouble[] a = { 4, 3 }, b = { 4, 0 };\ndouble theta = Math.Acos(Dot(a, b) / (Mag(a) * Mag(b))) * 180 / Math.PI;\nConsole.WriteLine($\"{Dot(a, b)} {Mag(a)} {Mag(b)} {theta:F2}\");   // 16 5 4 36.87", cap: "Checked: −a gives 143.13°, and |2a| = 10." } },
    { kv: [
      ["Applications", "the angle between two directions; whether something is in front of or behind you (field of view in games); projection of one vector onto another; lighting (the angle of a surface to a light); similarity of documents (word-count vectors)"]
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Dot product of u and v", src: "A-level June 2017 · P1 Q05.1 · 1 mark",
      q: "In a 2-D game, the enemy looks in the direction u = [1, 1]; the vector from the enemy to the hero is v = [3, −5]. Calculate the dot product of u and v.",
      steps: [{ m: "1 × 3 + 1 × (−5) = −2;", mk: "1", n: "Negative — the hero is currently BEHIND the enemy's line of sight." }],
      result: "−2" , "fig": {"x":[-1,4],"y":[-6,2],"aspect":"equal","w":300,"h":360,"items":[{"line":[[0,0],[1,1]],"arrow":true,"c":"accent","label":"u","loff":10},{"line":[[0,0],[3,-5]],"arrow":true,"c":"accent2","label":"v","loff":12}],"cap":"u = [1, 1] and v = [3, −5]: more than 90° apart, so u · v is negative."}} },
    { worked: { tag: "exam", title: "Move the hero", src: "A-level June 2017 · P1 Q05.2 · 1 mark",
      q: "The hero's current position is the vector [5, 2] and its movement is [3, 1]. The game computes new position = current position vector + movement vector. Perform vector addition to calculate the new position of the hero.",
      steps: [{ m: "[8, 3];", mk: "1", n: "I. missing or different brackets." }],
      result: "[8, 3]" } },
    { worked: { tag: "exam", title: "Can the enemy see the hero now?", src: "A-level June 2017 · P1 Q05.3 · 3 marks",
      q: "The algorithm: u ← [1, 1]; v ← [position of hero] − [position of enemy]; IF u.v > 0 THEN EnemyCanSee ← True ELSE EnemyCanSee ← False. The enemy is at [2, 7] and the hero has moved to [8, 3]. Complete a table of v, u.v and EnemyCanSee.",
      steps: [
        { m: "v = [8, 3] − [2, 7] = [6, −4];", mk: "1" },
        { m: "u.v = 1 × 6 + 1 × (−4) = 2;", mk: "1" },
        { m: "EnemyCanSee = True (2 > 0);", mk: "1", n: "A. follow-through from a wrong answer to 05.2. Checked in C#." }
      ], result: "[6, −4] · 2 · True" , "fig": {"x":[0,10],"y":[0,9],"aspect":"equal","w":420,"h":380,"items":[{"line":[[2,7],[3.4,8.4]],"arrow":true,"c":"accent","label":"u","loff":10},{"line":[[2,7],[8,3]],"arrow":true,"c":"accent2","label":"v","loff":12},{"pt":[2,7],"label":"enemy [2, 7]","pos":"sw"},{"pt":[8,3],"label":"hero [8, 3]","pos":"s","c":"accent2"}],"cap":"The enemy looks along u; v points from the enemy to the hero."}, "try": [{"grid":{"cols":["Hero at","v x","v y","u.v","EnemyCanSee"],"rows":[["[0, 4]","-2","-3","-5","False"],["[5, 6]","3","-1","2","True"],["[4, 5]","2","-2","0","False"]],"given":[[0,0],[1,0],[2,0]],"cap":"The enemy stays at [2, 7] looking along u = [1, 1]. Complete a row for each place the hero might be."}}]} },
    { worked: { tag: "exam", title: "Magnitude of b", src: "A-level June 2020 · P1 Q01.1 · 1 mark",
      q: "Vectors a = [4, 3] and b = [4, 0]. The magnitude of a vector, represented as an arrow, is the length of the arrow; the magnitude of a is 5 because √(4² + 3²) = 5. What is the magnitude of vector b?",
      steps: [{ m: "4 // √(4² + 0²);", mk: "1" }], result: "4" , "fig": {"x":[-0.6,5],"y":[-0.6,3.8],"aspect":"equal","w":400,"h":300,"items":[{"line":[[0,0],[4,3]],"arrow":true,"c":"accent","label":"a = [4, 3]","lpos":0.65,"loff":14},{"line":[[0,0],[4,0]],"arrow":true,"c":"accent2","label":"b = [4, 0]","lpos":0.5,"loff":-14},{"arc":[0,0,44,0,36.87],"label":"θ"}],"cap":"θ is the angle between a and b."}} },
    { worked: { tag: "exam", title: "Dot product with working", src: "A-level June 2020 · P1 Q01.2 · 2 marks",
      q: "Calculate the dot product of vectors a = [4, 3] and b = [4, 0]. You should show your working.",
      steps: [
        { m: "Multiply corresponding components: 4 × 4 = 16 and 3 × 0 = 0;", mk: "1" },
        { m: "Add the products: 16 + 0 = 16;", mk: "1", n: "2 marks for 16; if wrong, max 1 for working." }
      ], result: "16" , "try": [{"lab":"cs-vector"}]} },
    { worked: { tag: "exam", title: "Multiply by 2", src: "A-level June 2020 · P1 Q01.3 · 2 marks",
      q: "Describe what will happen to the angle θ (between a = [4, 3] and b = [4, 0]) and the magnitude of vector a when vector a is multiplied by the scalar 2.",
      steps: [{ m: "The angle will stay the same // the direction will not change;", mk: "1" }, { m: "The magnitude will be doubled — it becomes 10;", mk: "1" }],
      result: "Same angle; magnitude 10" } },
    { worked: { tag: "exam", title: "Multiply by −1", src: "A-level June 2020 · P1 Q01.4 · 2 marks",
      q: "The angle between two vectors cannot exceed 180° (a measured angle over 180° is subtracted from 360°). Describe what will happen to the angle θ and the magnitude of vector a when vector a is multiplied by the scalar −1.",
      steps: [{ m: "The angle will be 180 − θ // 143.13°;", mk: "1", n: "A. the direction of a will be the opposite of its current direction." , "fig": {"x":[-4.8,5],"y":[-3.6,3.6],"aspect":"equal","w":440,"h":330,"items":[{"line":[[0,0],[4,3]],"arrow":true,"c":"muted","dash":true,"label":"a","lpos":0.7,"loff":12},{"line":[[0,0],[-4,-3]],"arrow":true,"c":"accent","label":"−a","lpos":0.7,"loff":12},{"line":[[0,0],[4,0]],"arrow":true,"c":"accent2","label":"b","lpos":0.8,"loff":12},{"arc":[0,0,36,216.87,360],"label":"143.13°","loff":26}],"cap":"−a points the opposite way: the angle to b becomes 180° − 36.87° = 143.13°; the length is still 5."}}, { m: "The magnitude will stay the same;", mk: "1" }],
      result: "180° − θ = 143.13°; same magnitude" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Dot product**: multiply matching components, ADD — the answer is a number, not a vector. Show both stages.",
      "**Sign test**: > 0 same general direction (in view); < 0 behind; 0 perpendicular.",
      "**Addition** translates; **scalar multiplication** scales (negative k flips the direction, |k| scales the length).",
      "**v from A to B** = B − A (head minus tail).",
      "**Convex combination**: α, β ≥ 0 AND α + β = 1."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: ["\"The dot product is a vector.\" — it is a single number (a scalar).", "\"Multiplying by −1 changes the length.\" — the magnitude stays the same; only the direction reverses.", "\"v from A to B is A − B.\" — it is B − A: head minus tail."] } },
    { callout: { t: "mnemonic", h: "\"Multiply pairs, then add\"", body: "Dot product: **multiply matching components, then add** — the answer is a **number**. Positive → same general direction; zero → perpendicular; negative → pointing away." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.1.2 a 1-D array represents a vector; 4.2.7.1 a vector as a dictionary; 4.12.1.1 the function interpretation (a mapping S → ℝ); 4.5.6.5 vector graphics; maths: the scalar product and cos θ." } }
  ],
  flashcards: [
    ["What does the notation ℝ⁴ mean for a vector?", "A 4-vector whose entries are all real numbers."],
    ["How is [2.0, 3.1] read as a function?", "0 ↦ 2.0, 1 ↦ 3.1 — a function from {0, 1} to ℝ."],
    ["Three representations of a vector in code?", "List, 1-D array, dictionary (index ↦ value)."],
    ["What does vector addition achieve geometrically?", "Translation."],
    ["What does scalar–vector multiplication achieve geometrically?", "Scaling (a negative scalar also reverses direction)."],
    ["Dot product of [a1, a2] and [b1, b2]?", "a1b1 + a2b2.", 6],
    ["Angle from the dot product?", "cos θ = (u · v) ÷ (|u| |v|).", 7],
    ["What is the magnitude of the vector [4, 3]?", "5.", 8],
    ["What is the dot product [1, 1] · [3, −5]?", "−2.", 9],
    ["Effect of × −1 on the angle with b?", "θ becomes 180° − θ; magnitude unchanged.", 10]
  ],
  quiz: [
    { q: "[4, 3] · [4, 0] =", opts: ["16", "[16, 0]", "28", "4"], ans: 0, why: "The dot product multiplies matching items and adds: 4 × 4 + 3 × 0 = 16." },
    { q: "u · v > 0 means the angle between them is", opts: ["less than 90°", "exactly 90°", "more than 90°", "180°"], ans: 0, why: "u · v = |u||v| cos θ, so a positive dot product means cos θ > 0 and the angle is below 90°." },
    { q: "Which is a convex combination of u and v?", opts: ["0.3u + 0.7v", "0.5u + 0.7v", "−0.2u + 1.2v", "u + v"], ans: 0, why: "Non-negative and sums to 1." },
    { q: "Multiplying a vector by 3 changes", opts: ["its magnitude only", "its direction only", "both", "neither"], ans: 0, why: "Positive scalar: same direction." },
    { q: "The vector from the enemy at [2, 7] to the hero at [8, 3] is", opts: ["[6, −4]", "[−6, 4]", "[10, 10]", "[4, −6]"], ans: 0, why: "The vector from A to B is B − A, so hero − enemy = [8 − 2, 3 − 7] = [6, −4]." }
  ],
  sims: ["cs-vector"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
