/* Kurenai OS — deep content: Bits, bytes and units of information (AQA 7517, spec 4.5.3.1, 4.5.3.2).
   2 specification points taught as one topic. This file REPLACES the separate
   entries the points used to have (their specification wording is joined on the
   one spec leaf, 4.5.3.1); the repeated overview, toolkit and past-paper pages are
   folded into one each, the practice is de-duplicated, and every flashcard keeps
   the SM-2 key it had as a separate leaf (the third element). */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

C["compsci:4.5.3.1"] = {
  notes: [
    {"h":"Bits, bytes and units of information — the whole topic on one page"},
    {"callout":{"t":"info","h":"What the specification asks (4.5.3.1, 4.5.3.2)","body":["Know that the **bit is the fundamental unit of information**.","A **byte is a group of 8 bits**.","Know that **2ⁿ different values can be represented with n bits**.","Know the names, symbols and corresponding powers of 2 for the **binary prefixes** kibi (Ki, 2¹⁰), mebi (Mi, 2²⁰), gibi (Gi, 2³⁰), tebi (Ti, 2⁴⁰)","And the names, symbols and powers of 10 for the **decimal prefixes** kilo (k, 10³), mega (M, 10⁶), giga (G, 10⁹), tera (T, 10¹²)."]}},
    {"table":{"head":["Question shape","Command word","Marks","Seen in"],"rows":[["How many values can n bits / bytes represent?","How many","1","AS 2020 Q01.2 (two bytes), AS 2023 Q02.2 (10 bits), AS 2025 Q02.1 (one byte)"],["Addressable memory from an address bus width","What is the maximum","1–2","A-level 2019 Q12.1, AS 2022 Q08.5, A-level 2024 Q03.5"],["Locations addressable by an operand","How many","1","A-level 2020 Q09.1"],["Bits needed for n colours / values (log₂)","Calculate","inside image questions","A-level 2021 Q01.1, 2024 Q02.1"],["Which prefix represents 10⁶ (or 2²⁰)?","Shade","1","AS 2023 Q03.1"],["Order quantities in mixed units","Place in order","2","AS 2018 Q02.1"],["Convert between binary prefixes","How many","1","A-level 2020 Q03.2 (4 GiB → KiB)"],["Express a calculated size in MB / MiB / kB","Calculate","inside sound/image questions","AS 2017 Q03.1, A-level 2023 Q01.1, 2024 Q02.1"],["Memory in GiB from bus width","Calculate","2","A-level 2024 Q03.5"]]}},
    {"h":"How these notes are organised"},
    {"ol":["**Bits, nibbles, bytes and 2ⁿ**.","**Decimal and binary prefixes**.","**Converting and ordering**.","**In exam questions**.","**Exam toolkit**.","**Past-paper patterns**."]},
    {"page":"Bits, nibbles, bytes and 2ⁿ"},
    {"kv":[["Bit","a **b**inary dig**it**, 0 or 1 — the **fundamental unit of information**"],["Nibble","4 bits — one hexadecimal digit"],["Byte","**8 bits**"],["Word","the number of bits the processor handles as a unit (e.g. 32 or 64) — see 4.7.3.7"]]},
    {"callout":{"t":"formula","h":"n bits give 2ⁿ different values","body":["Each extra bit **doubles** the number of patterns: 1 bit → 2, 2 bits → 4, 3 bits → 8 … n bits → **2ⁿ**.","Unsigned, those values are 0 to **2ⁿ − 1** (the count includes 0).","Working backwards: to represent k different values you need **⌈log₂ k⌉** bits."]}},
    {"fig":{"w":520,"h":150,"items":[{"poly":[[18,30],[72,30],[72,66],[18,66]],"fill":"accent","alpha":0.12,"c":"line","w":1.2},{"text":[45,48],"t":"000","b":true,"c":"text"},{"text":[45,84],"t":"0","c":"muted","size":12},{"poly":[[80,30],[134,30],[134,66],[80,66]],"fill":"accent","alpha":0.16,"c":"line","w":1.2},{"text":[107,48],"t":"001","b":true,"c":"text"},{"text":[107,84],"t":"1","c":"muted","size":12},{"poly":[[142,30],[196,30],[196,66],[142,66]],"fill":"accent","alpha":0.2,"c":"line","w":1.2},{"text":[169,48],"t":"010","b":true,"c":"text"},{"text":[169,84],"t":"2","c":"muted","size":12},{"poly":[[204,30],[258,30],[258,66],[204,66]],"fill":"accent","alpha":0.24,"c":"line","w":1.2},{"text":[231,48],"t":"011","b":true,"c":"text"},{"text":[231,84],"t":"3","c":"muted","size":12},{"poly":[[266,30],[320,30],[320,66],[266,66]],"fill":"accent","alpha":0.28,"c":"line","w":1.2},{"text":[293,48],"t":"100","b":true,"c":"text"},{"text":[293,84],"t":"4","c":"muted","size":12},{"poly":[[328,30],[382,30],[382,66],[328,66]],"fill":"accent","alpha":0.32,"c":"line","w":1.2},{"text":[355,48],"t":"101","b":true,"c":"text"},{"text":[355,84],"t":"5","c":"muted","size":12},{"poly":[[390,30],[444,30],[444,66],[390,66]],"fill":"accent","alpha":0.36,"c":"line","w":1.2},{"text":[417,48],"t":"110","b":true,"c":"text"},{"text":[417,84],"t":"6","c":"muted","size":12},{"poly":[[452,30],[506,30],[506,66],[452,66]],"fill":"accent","alpha":0.4,"c":"line","w":1.2},{"text":[479,48],"t":"111","b":true,"c":"text"},{"text":[479,84],"t":"7","c":"muted","size":12},{"text":[260,120],"t":"3 bits → 2³ = 8 patterns, values 0 to 7","b":true,"c":"accent2","size":13}],"cap":"Every bit pattern of length 3: eight of them, so the largest unsigned value is 2³ − 1 = 7."}},
    {"table":{"head":["n","2ⁿ","where you meet it"],"rows":[["8","256","one byte; 8-bit colour; ASCII extended"],["10","1024","1 KiB"],["16","65 536","two bytes; 16-bit sound"],["24","16 777 216","24-bit \"true colour\""],["32","4 294 967 296","32-bit addresses (4 GiB)"]]}},
    {"callout":{"t":"miscon","h":"\"8 bits can represent 255 values\"","body":"8 bits represent **256** different values; the **largest** unsigned value is 255 because the values start at 0. Keep \"how many values\" (2ⁿ) and \"highest value\" (2ⁿ − 1) apart."}},
    {"page":"Decimal and binary prefixes"},
    {"table":{"head":["Decimal prefix","Symbol","Power","Value","Binary prefix","Symbol","Power","Value"],"rows":[["kilo","k","10³","1 000","kibi","Ki","2¹⁰","1 024"],["mega","M","10⁶","1 000 000","mebi","Mi","2²⁰","1 048 576"],["giga","G","10⁹","10⁹","gibi","Gi","2³⁰","1 073 741 824"],["tera","T","10¹²","10¹²","tebi","Ti","2⁴⁰","≈ 1.0995 × 10¹²"]]}},
    {"callout":{"t":"memorise","h":"Which is which","body":["**Decimal (SI) prefixes** — kilo, mega, giga, tera — are powers of **10**: 1 kB = 1000 bytes.","**Binary (IEC) prefixes** — kibi, mebi, gibi, tebi (\"bi\" for binary) — are powers of **2**: 1 KiB = 1024 bytes.","The gap grows: a gibibyte is 7.4% bigger than a gigabyte; a tebibyte is 10% bigger than a terabyte."]}},
    {"fig":{"x":[0,5],"y":[0,1.15],"w":480,"h":220,"axes":{"x":"","y":"ratio","xt":[{"v":1,"label":"kilo/kibi"},{"v":2,"label":"mega/mebi"},{"v":3,"label":"giga/gibi"},{"v":4,"label":"tera/tebi"}],"yt":[{"v":1,"label":"1"}]},"items":[{"line":[[1,0],[1,0.9766]],"c":"accent","w":14},{"line":[[2,0],[2,0.9537]],"c":"accent","w":14},{"line":[[3,0],[3,0.9313]],"c":"accent","w":14},{"line":[[4,0],[4,0.9095]],"c":"accent","w":14},{"text":[1,1.05],"t":"0.977","size":11.5,"c":"accent2"},{"text":[2,1.05],"t":"0.954","size":11.5,"c":"accent2"},{"text":[3,1.05],"t":"0.931","size":11.5,"c":"accent2"},{"text":[4,1.05],"t":"0.909","size":11.5,"c":"accent2"}],"cap":"Decimal unit ÷ binary unit: the decimal prefix falls further behind at each step (10³ⁿ / 2¹⁰ⁿ)."}},
    {"callout":{"t":"miscon","h":"\"1 kilobyte = 1024 bytes\"","body":"At AQA, **1 kilobyte = 1000 bytes**; 1024 bytes is a **kibibyte**. A question that says *megabytes* wants ÷ 1000 ÷ 1000; *mebibytes* wants ÷ 1024 ÷ 1024. Using the wrong one costs the final mark."}},
    {"page":"Converting and ordering"},
    {"steps":[{"h":"Bits → bytes","m":"÷ 8"},{"h":"Bytes → kB → MB → GB","m":"÷ 1000 each step"},{"h":"Bytes → KiB → MiB → GiB","m":"÷ 1024 each step (or ÷ 2¹⁰)"},{"h":"Within binary prefixes","m":"each step is ×1024: GiB → MiB → KiB"}]},
    {"worked":{"tag":"exam","title":"Which prefix is 10⁶?","src":"AS June 2023 · P2 Q03.1 · 1 mark","q":"Shade in one lozenge to indicate which of the following prefixes represents 10⁶: A kibi; B mebi; C gibi; D kilo; E mega; F giga.","steps":[{"m":"**E (mega)** — decimal prefix, 10⁶","mk":"1 mark","n":"mebi is 2²⁰."}],"result":"E"}},
    {"worked":{"tag":"exam","title":"Put five quantities in order","src":"AS June 2018 · P2 Q02.1 · 2 marks","q":"Place the quantities 3 kilobytes, 2 mebibytes, 2 bytes, 2 megabytes and 20 bits in order, 1 for the smallest and 5 for the largest.","steps":[{"h":"Common unit: bytes","m":"20 bits = 2.5 bytes; 2 bytes; 3 kB = 3000 bytes; 2 MB = 2 000 000 bytes; 2 MiB = 2 097 152 bytes"},{"h":"Order","m":"1: 2 bytes; 2: 20 bits; 3: 3 kilobytes","mk":"1 mark","n":"1 mark for bits, bytes and kilobytes in the correct positions."},{"m":"4: 2 megabytes; 5: 2 mebibytes","mk":"1 mark","n":"The mebibyte is larger — the trap of the question."}],"result":"2 B, 20 bits, 3 kB, 2 MB, 2 MiB"}},
    {"worked":{"tag":"exam","title":"Gibibytes to kibibytes","src":"A-level June 2020 · P2 Q03.2 · 1 mark","q":"The computer has 4 gibibytes of memory installed. How many kibibytes is this equivalent to?","steps":[{"h":"GiB → MiB → KiB: × 1024 × 1024","m":"4 × 1024 × 1024 = **4 194 304 KiB** (= 4 × 2²⁰ = 2²²)","mk":"1 mark"}],"result":"4 194 304 KiB"}},
    {"worked":{"tag":"exam","title":"A recording in mebibytes","src":"A-level June 2023 · P2 Q01.1 · 2 marks","q":"A sound is sampled at 48 000 samples per second for 3 minutes using a 16-bit sample resolution. Calculate the size of the digital recording in mebibytes, rounded to 2 decimal places. Show your working.","steps":[{"h":"Bits","m":"48 000 × 16 × 180 = 138 240 000 bits"},{"h":"Bytes, then MiB","m":"÷ 8 = 17 280 000 bytes; $\\;$ ÷ 1024 ÷ 1024 = 16.479…"},{"m":"**16.48 MiB**","mk":"2 marks","n":"1 mark only for 16 or 16.5 or a truncated 16.47 — the rounding instruction is part of the answer."}],"result":"16.48 MiB"}},
    {"worked":{"tag":"variation","title":"The same file in MB and MiB","q":"A file is 5 000 000 000 bytes. Express its size in GB and in GiB.","steps":[{"m":"GB: ÷ 10⁹ = **5 GB**"},{"m":"GiB: ÷ 2³⁰ = 5 × 10⁹ ÷ 1 073 741 824 = **4.66 GiB**","n":"Why a \"500 GB\" drive shows as about 465 GiB in an operating system that uses binary units."}],"result":"5 GB = 4.66 GiB"}},
    {"page":"In exam questions"},
    {"worked":{"tag":"exam","title":"Values in two bytes","src":"AS June 2020 · P2 Q01.2 · 1 mark","q":"How many different values can be represented using two bytes?","steps":[{"h":"Two bytes = 16 bits","m":"2¹⁶ = **65 536**","mk":"1 mark","n":"Mark scheme: 2¹⁶ // 65 536 — either form."}],"result":"65 536"}},
    {"worked":{"tag":"exam","title":"Memory addressable by a 32-bit address bus","src":"A-level June 2019 · P2 Q12.1 · 1 mark","q":"A computer system uses a 32-bit address bus and a 32-bit data bus. Each addressed memory location can store one byte of data. What is the maximum amount of memory, in bytes, that could be accessed?","steps":[{"h":"The address bus width sets the number of addresses","m":"2³² addresses × 1 byte = **4 294 967 296 bytes** (2³²)","mk":"1 mark","n":"The data bus width is a distractor — it sets how much is moved per transfer, not how many locations exist."}],"result":"2³² = 4 294 967 296 bytes"}},
    {"worked":{"tag":"exam","title":"Doubling the addressable memory","src":"AS June 2022 · P2 Q08.5 · 2 marks","q":"Identify the bus that would need to be changed and state the change needed so that the maximum amount of memory addressable by the processor would be doubled.","steps":[{"m":"The **address bus**;","mk":"1 mark"},{"m":"its width increased by **one** line/bit (2ⁿ⁺¹ = 2 × 2ⁿ);","mk":"1 mark","n":"\"Make it bigger\" is not enough — doubling needs exactly one more bit."}],"result":"Address bus, +1 line"}},
    {"worked":{"tag":"exam","title":"Addressable memory in gibibytes","src":"A-level June 2024 · P2 Q03.5 · 2 marks","q":"The computer's address bus uses 36 wires/lines and each main memory location can hold a 16-bit data value. In gibibytes, express the maximum amount of main memory that could be installed, assuming the CPU could access all of the memory using the address bus. Show your working.","steps":[{"h":"Locations × bytes per location","m":"2³⁶ locations × 16 bits ÷ 8 = 2³⁶ × 2 bytes = 2³⁷ bytes"},{"h":"To GiB (÷ 2³⁰)","m":"2³⁷ ÷ 2³⁰ = 2⁷ = **128 GiB**","mk":"2 marks","n":"1 method mark for two of: 2³⁶ used; ×16; ÷8; ÷1024; ÷1024 again."}],"result":"128 GiB"}},
    {"worked":{"tag":"variation","title":"Bits needed for a number of values","q":"How many bits are needed to give every one of 1000 students a unique ID, and to store 5 colours?","steps":[{"m":"2⁹ = 512 < 1000 ≤ 1024 = 2¹⁰ → **10 bits**"},{"m":"2² = 4 < 5 ≤ 8 = 2³ → **3 bits**","n":"Always round **up** to the next whole bit."}],"result":"10 bits; 3 bits"}},
    {"page":"Exam toolkit"},
    {"table":{"head":["Command word","What earns the mark"],"rows":[["How many values","2ⁿ (a power of 2 or its value)."],["Maximum memory","2^(address lines) × bytes per location, in the unit asked."],["Calculate bits needed","⌈log₂ k⌉ — round up."],["Shade (prefix)","Decimal names for powers of 10, \"-bi\" names for powers of 2."],["Place in order","Convert everything to one unit (bytes) first."],["Calculate … in X","Use X's base (1000 or 1024) and the rounding asked for."]]}},
    {"callout":{"t":"tip","h":"Reading an AQA mark scheme","body":["Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the marks however many points you make.","**A.** accept · **R.** reject · **NE.** not enough (true, but too vague for the mark) · **I.** ignore · **BOD** benefit of the doubt · **//** separates alternative wordings of the same point.","A lozenge question is rejected outright if more lozenges are shaded than asked for."]}},
    {"callout":{"t":"warn","h":"Specific errors","body":["256 vs 255 (count vs highest value).","Using the data bus width for addressable memory.","Rounding bits down (5 colours in 2 bits).","Treating kB as 1024 bytes.","Forgetting ÷ 8 (bits → bytes).","Rounding when the question gives a precision (2 d.p.)."]}},
    {"callout":{"t":"mnemonic","h":"\"Each bit doubles\"","body":"1 → 2 → 4 → 8 → 16 … patterns: 2ⁿ."}},
    {"callout":{"t":"mnemonic","h":"\"bi means binary\"","body":"Ki**bi**, Me**bi**, Gi**bi**, Te**bi** → 2¹⁰, 2²⁰, 2³⁰, 2⁴⁰. No \"bi\" → powers of 10."}},
    {"callout":{"t":"tip","h":"Synoptic links","body":"4.7.1.1 address bus width; 4.5.6.4 colour depth = ⌈log₂ colours⌉; 4.5.6.7 sample resolution; 4.7.3.3 opcode bits limit the instruction set to 2ⁿ instructions. 4.5.6.4 and 4.5.6.7 file-size calculations; 4.7.1.1 address bus → memory size; 4.9.1.1 bit rate (bits per second — decimal prefixes: 1 Mbps = 10⁶ bits per second)."}},
    {"page":"Past-paper patterns"},
    {"h":"Units — the calculation questions"},
    "Units rarely appear alone; they carry the **file-size calculations** in the sound and image questions (3 marks: the multiplication, the ÷8 to bytes, the conversion to the unit asked). The dedicated items are: *which prefix is a power of ten* (kilo, mega, giga — 10³, 10⁶, 10⁹) versus *binary prefixes* (kibi 2¹⁰, mebi 2²⁰, gibi 2³⁰, tebi 2⁴⁰); *order quantities by size*; *convert GiB to KiB* (× 2²⁰).",
    {"callout":{"t":"warn","body":"A question that says **mebibytes** expects ÷ 1 048 576 (2²⁰), not ÷ 1 000 000. The mark schemes accept the answer *to at least 4 significant figures*, so keep the exact value until the end."}}
  ],
  flashcards: [
    ["Fundamental unit of information?","The bit.","compsci:4.5.3.1:0"],
    ["Bits in a byte?","8.","compsci:4.5.3.1:1"],
    ["Values representable with n bits?","2ⁿ.","compsci:4.5.3.1:2"],
    ["Largest unsigned value in n bits?","2ⁿ − 1.","compsci:4.5.3.1:3"],
    ["Bits needed for k values?","⌈log₂ k⌉.","compsci:4.5.3.1:5"],
    ["What limits addressable memory?","The width of the address bus.","compsci:4.5.3.1:6"],
    ["What is a nibble?","4 bits — one hexadecimal digit.","compsci:4.5.3.1:11"],
    ["How many distinct values can 10 bits represent?","2¹⁰ = 1024.","compsci:4.5.3.1:13"],
    ["How many bits are needed to represent 18 different values?","5 — 2⁴ = 16 is too few, 2⁵ = 32 suffices.","compsci:4.5.3.1:15"],
    ["Why is the byte the standard unit rather than the bit?","Memory is addressed byte by byte; a byte holds one character in ASCII.","compsci:4.5.3.1:16"],
    ["1 kilobyte (AQA)?","1000 bytes (10³).","compsci:4.5.3.2:0"],
    ["1 kibibyte?","1024 bytes (2¹⁰).","compsci:4.5.3.2:1"],
    ["Which is larger, 2 MB or 2 MiB?","2 MiB (2 097 152 bytes).","compsci:4.5.3.2:4"],
    ["4 GiB in KiB?","4 194 304.","compsci:4.5.3.2:5"],
    ["Bits → bytes?","Divide by 8.","compsci:4.5.3.2:8"],
    ["List the binary prefixes and their powers.","kibi 2¹⁰, mebi 2²⁰, gibi 2³⁰, tebi 2⁴⁰.","compsci:4.5.3.2:11"],
    ["List the decimal prefixes.","kilo 10³, mega 10⁶, giga 10⁹, tera 10¹².","compsci:4.5.3.2:12"],
    ["Why were binary prefixes introduced?","To remove the ambiguity of 'kilobyte' meaning 1000 or 1024 bytes.","compsci:4.5.3.2:14"],
    ["Convert 3 MiB to bytes.","3 × 2²⁰ = 3 145 728 bytes.","compsci:4.5.3.2:15"],
    ["Order: 2 GiB, 2500 MiB, 2 × 10⁹ bytes.","2 × 10⁹ B (1.86 GiB) < 2 GiB (2048 MiB) < 2500 MiB.","compsci:4.5.3.2:16"]
  ],
  quiz: [
    {"q":"Bits needed for 300 different codes","opts":["9","8","10","300"],"ans":0,"why":"256 < 300 ≤ 512."},
    {"q":"A 32-bit address bus with byte locations addresses","opts":["2³² bytes","32 bytes","2³² bits","4 MB"],"ans":0,"why":"2^lines."},
    {"q":"Number of values representable in 3 bytes:","opts":["24","2²⁴","768","3 × 256"],"ans":1,"why":"24 bits → 2²⁴ ≈ 16.7 million."},
    {"q":"Adding one bit to a field does what to the number of values?","opts":["adds 1","doubles it","adds 8","squares it"],"ans":1,"why":"2ⁿ⁺¹ = 2 × 2ⁿ."},
    {"q":"Which prefix represents 2³⁰?","opts":["gibi","giga","mebi","tera"],"ans":0,"why":"Binary prefix."},
    {"q":"1 MB in bytes (AQA) is","opts":["1 000 000","1 048 576","1024","8 000 000"],"ans":0,"why":"Decimal."},
    {"q":"Largest of these:","opts":["2 MiB","2 MB","2000 kB","16 000 000 bits"],"ans":0,"why":"2 097 152 bytes."},
    {"q":"5 GiB in KiB:","opts":["5 × 2¹⁰","5 × 2²⁰","5 × 2³⁰","5 × 10⁶"],"ans":1,"why":"GiB → KiB is two steps of 2¹⁰."}
  ],
  exam: [
    {"level":"AS","src":"AS 2023 P2 Q2.2","q":"A field is 10 bits wide. State the number of different values it can represent.","marks":1,"ms":["1024 (2¹⁰) (1)"]},
    {"level":"AS","src":"AS 2018 P2 Q12.2","q":"An image uses 18 different colours. State the minimum number of bits needed to represent one pixel, and justify your answer.","marks":2,"ms":["5 bits (1)","4 bits give only 16 values; 5 bits give 32, enough for 18 (1)"]}
  ]
};

/* the exam-tagged worked cards above are this topic's past-paper practice */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
