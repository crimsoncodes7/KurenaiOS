/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.7.3.7
   and 4.7.4 (factors affecting processor performance, input and output
   devices, secondary storage devices) at full A-level depth. Each topic
   REPLACES the short entry the older file carried; every way AQA has
   examined it (7516/2 June 2016–2025, 7517/2 June 2017–2025) is explained,
   worked and answered in the mark scheme's own format. ADC/DAC and the
   analogue/digital distinction are 4.5.6.2–4.5.6.3; the ethics halves of
   the essays are 4.8.1; TCP/IP is 4.9.3. Past-paper banks stay in
   bank-cs-47.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers (pixel coordinates) ---- */
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push({ text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" });
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: 2, dash: o.dash }];
  if (label) it.push({ text: [(x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0)], t: label, size: 10.5, c: o.c || "accent2" });
  return it;
}
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\".",
  "Hardware \"principles of operation\" are levels-of-response: **sequence** the steps (the description must make sense read as a whole). \"Faster\", \"cheaper\", \"more efficient\" with no reason are NE. — say what is faster and why."
] } };

/* =====================================================================
   4.7.3.7  Factors affecting processor performance
   ===================================================================== */
C["compsci:4.7.3.7"] = {
  notes: [
    { h: "Factors affecting processor performance — the whole topic on one page" },
    "Spec 4.7.3.7: explain the effect on processor performance of **multiple cores, cache memory, clock speed, word length, address bus width, data bus width**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Three factors, each with how it improves performance", "State and explain", "6", "AS 2016 Q05.6"],
      ["One fast core vs four slower cores", "Explain", "2", "AS 2018 Q06.3"],
      ["Larger cache and longer word length", "Explain", "2", "AS 2024 Q07.4"],
      ["What cache is, what it is for, why more helps", "Describe", "4", "A-level 2021 Q14.3"],
      ["Wider data bus", "Explain", "1", "AS 2022 Q08.4, A-level 2019 Q12.2"],
      ["Features of a scenario favouring a faster clock", "Describe", "2", "AS 2023 Q10"],
      ["Improve a slow database server (essay)", "Explain", "12", "A-level 2018 Q04 (and 2023 Q04.1 — see 4.7.3.2)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The six factors** — each with its mechanism and its limit.", "**Cache memory in depth**.", "**Cores vs clock**.", "**In exam questions**, including the 12-mark essay.", "**Exam toolkit**."] },

    { page: "The six factors" },
    { table: { head: ["Factor", "Mechanism (why it helps)", "Limit / catch"], rows: [
      ["Clock speed ↑", "more clock cycles per second → **more instructions executed per second** (each instruction completes sooner)", "more heat and power; memory may not keep up; 2.8 GHz = 2.8 × 10⁹ cycles/s"],
      ["Multiple cores", "each core is a separate processing unit → **several instructions / processes executed simultaneously**", "only if the software can be split into **parallel** tasks; sequential code uses one core; coordination overhead"],
      ["Cache size ↑", "cache is faster than main memory → **more data / instructions found in cache (cache hits)**, fewer slow main-memory fetches", "bigger caches are slower to search and expensive; gains shrink"],
      ["Word length ↑", "the processor **processes more bits in one operation** — larger numbers and more data per instruction", "software must be written / compiled to use it"],
      ["Data bus width ↑", "**more bits transferred at once** between memory and processor → fewer transfers", "matched to word length to help fully"],
      ["Address bus width ↑", "**more memory locations addressable** → more RAM can be fitted → less use of virtual memory (paging to disk)", "only helps if more RAM is actually installed"]
    ] } },
    { callout: { t: "miscon", h: "\"A faster clock means a faster computer\"", body: "Performance depends on **instructions per cycle × cycles per second**, and on memory. A 3.2 GHz single core beats a 2.8 GHz quad core only for **sequential** work; for parallel work the four cores win. Always tie the factor to the task." } },
    { callout: { t: "miscon", h: "Side by side: address bus vs data bus width", body: "**Address** bus width → how MUCH memory (2ⁿ locations) — helps performance only indirectly, by allowing more RAM. **Data** bus width → how many bits PER TRANSFER — helps every memory access directly." } },

    { page: "Cache memory in depth" },
    { fig: { w: 660, h: 200, items: (function () {
      var it = [];
      [["Registers", 120, "accent", "< 1 ns · bytes"], ["L1 cache", 180, "accent", "~1 ns · KB"], ["L2 / L3 cache", 250, "accent2", "~5–20 ns · MB"], ["Main memory (RAM)", 330, "good", "~60–100 ns · GB"], ["SSD / HDD", 420, "muted", "µs–ms · TB"]].forEach(function (r, i) {
        var w = r[1], x = 350 - w / 2, y = 10 + i * 36;
        it = it.concat(boxAt(x, y, w, 30, r[0], r[2]));
        it.push(txt(x + w + 8, y + 15, r[3], { pos: "e", off: 0 }));
      });
      it.push({ line: [[24, 184], [24, 16]], arrow: true, c: "muted", w: 1.6 }, txt(32, 22, "faster,", { pos: "e", off: 0, size: 10.5 }), txt(32, 36, "dearer per byte", { pos: "e", off: 0, size: 10.5 }), txt(32, 178, "bigger, cheaper", { pos: "e", off: 0, size: 10.5 }));
      return it;
    })(), cap: "The memory hierarchy (typical orders of magnitude). Cache sits between the registers and main memory." } },
    { kv: [
      ["What it is", "a small amount of **very fast memory** on (or very close to) the processor"],
      ["What it holds", "copies of the **most frequently / recently used** instructions and data, and **pre-fetched** instructions near the one executing (locality)"],
      ["Cache hit", "the item needed is in the cache — fetched quickly"],
      ["Cache miss", "it is not — fetched from slower main memory (and copied into the cache)"],
      ["Why more helps", "more items fit → **higher probability of a hit** → fewer slow main-memory fetches"]
    ] },
    { callout: { t: "tip", h: "Why locality works", body: "Programs loop (the same instructions again and again — temporal locality) and step through arrays (neighbouring addresses — spatial locality). So recently used and nearby items are likely to be needed next: the cache bets on that." } },

    { page: "Cores vs clock" },
    { table: { head: ["", "1 core at 3.2 GHz", "4 cores at 2.8 GHz"], rows: [
      ["Sequential task (one thread)", "**faster** — each instruction finishes sooner", "uses one core at 2.8 GHz"],
      ["Parallel task (many threads / processes)", "one instruction stream at a time", "**faster** — up to four streams at once (ideal 4 × 2.8 = 11.2 G cycles/s)"],
      ["Multitasking", "time-sliced", "processes really run simultaneously"]
    ] } },
    { callout: { t: "tip", h: "Synoptic: Amdahl's intuition", body: "If only half a task can run in parallel, even infinite cores at best halve its time. The sequential part sets the floor — why clock speed still matters (4.13 design, 4.12 functional languages make parallelism easier: no shared state)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Three other factors (6 marks)", src: "AS June 2016 · P2 Q05.6 · 6 marks",
      q: "Changing circuit design and increasing the number of cores can improve processor performance. State three other factors that can improve processor performance. For each factor, explain how it will improve performance.",
      steps: [
        { h: "Factor", m: "Increase the data bus width;", mk: "1 mark" },
        { h: "How", m: "more bits can be transferred between main memory and the processor at one time, so fewer read / write operations are needed;", mk: "1 mark" },
        { h: "Factor", m: "Increase the clock speed;", mk: "1 mark" },
        { h: "How", m: "more instructions can be executed per second // each instruction is executed sooner;", mk: "1 mark" },
        { h: "Factor", m: "Increase the amount of cache memory;", mk: "1 mark" },
        { h: "How", m: "cache is faster than main memory, so the more that can be held in cache the less often main memory must be accessed;", mk: "1 mark", n: "Also: word length (more bits processed in one go); faster type of cache; more general-purpose registers (intermediate results kept in the processor); address bus width (more RAM, less virtual memory). NE. \"program will execute faster\". R. a \"how\" that does not fit its factor." }
      ], result: "Factor + mechanism, three times" } },
    { worked: { tag: "exam", title: "One fast core vs four slower", src: "AS June 2018 · P2 Q06.3 · 2 marks",
      q: "Ella's processor has four cores at 2.8 GHz; Josephine's has one core at 3.2 GHz. Explain why Josephine's computer might complete a particular task more quickly than Ella's.",
      steps: [
        { h: "AO2", m: "A 3.2 GHz processor may execute (sequential) instructions more quickly than a 2.8 GHz one;", mk: "1 mark" },
        { h: "AO1", m: "where parallel processing is not possible / the task is sequential, this lets the 3.2 GHz processor finish sooner (the extra cores are idle);", mk: "1 mark" }
      ], result: "Sequential task → clock wins" } },
    { worked: { tag: "exam", title: "Larger cache, greater word length", src: "AS June 2024 · P2 Q07.4 · 2 marks",
      q: "Computers A and B both run at 2.8 GHz, but A is much faster. A has a larger cache and greater word length. Explain why each is a possible factor.",
      steps: [
        { h: "Larger cache", m: "Increases the probability that data / instructions will be found in the cache (cache hit), and cache is faster than main memory // fewer accesses to slower memory;", mk: "1 mark" },
        { h: "Word length", m: "More bits can be processed simultaneously in the execution of a single instruction // transferred simultaneously within the processor;", mk: "1 mark" }
      ], result: "More hits; more bits per operation" } },
    { worked: { tag: "exam", title: "Cache memory (4 marks)", src: "A-level June 2021 · P2 Q14.3 · 4 marks",
      q: "One method to improve processor performance is to increase the amount of cache memory. Describe what cache memory is, what it is used for, and how increasing the amount can improve performance.",
      steps: [
        { h: "What", m: "Memory that can be accessed very quickly, located on / close to the processor;", mk: "1 mark" },
        { h: "Used for", m: "To store the most frequently / recently used or pre-fetched instructions and data;", mk: "1 mark" },
        { h: "Why more helps", m: "More instructions / data can be stored in the cache;", mk: "1 mark" },
        { h: "Why more helps", m: "which increases the probability of a cache hit — fewer fetches from (slower) main memory are needed;", mk: "1 mark", n: "\"Cache is accessed more quickly than main memory\" scores here only if not already used for \"what it is\"." }
      ], result: "Fast memory; frequent items; more hits" } },
    { worked: { tag: "exam", title: "Why a faster clock suits the smartwatch", src: "AS June 2023 · P2 Q10 · 2 marks",
      q: "A smartwatch processor executes all software and controls all hardware. Many sensors each take many readings per second, sent to the processor for averaging; apps play music and display images; performance worsens when loading a large image while playing music. Describe two features of the situation that suggest increasing the clock speed would improve performance.",
      steps: [
        { m: "The processor must keep pace with a wide range of sensors, each frequently collecting data — and all sensor data goes through (and needs computation by) the processor;", mk: "1 mark" },
        { m: "The processor must multitask between processing sensor data and running applications such as music and image loading (both large files) at the same time;", mk: "1 mark", n: "NE. \"faster processing\". Use the scenario's facts." }
      ], result: "Heavy sensor load + multitasking" } },
    { worked: { tag: "exam", title: "Speed up the bank's database server (12-mark essay)", src: "A-level June 2018 · P2 Q04 · 12 marks",
      q: "Bank clients query a database server holding data on hard disk drives; the delay before results arrive is unacceptably long. Explain how performance might be improved, considering: the server's hardware; the design of the network; the database and the software on the server.",
      steps: [
        { h: "1 · Hardware", m: "A processor with more cores runs several queries simultaneously; more cache means more hits and fewer slow memory fetches; a faster clock executes more instructions per second; more RAM keeps more of the database in memory (less paging); SSDs instead of HDDs remove seek and rotational delay; a wider / faster data bus moves more bits per transfer.", mk: "area 1" },
        { h: "2 · Network", m: "Replace copper with fibre-optic cable (higher bandwidth); replace Wi-Fi with wired links; faster network cards; split the network into subnets / use a star topology so traffic is not shared; a more efficient protocol.", mk: "area 2" },
        { h: "3 · Database and software", m: "Index commonly searched fields; use more efficient algorithms (binary not linear search); finer concurrency control instead of whole-table locks; compile rather than interpret the software; review the design for redundancy (or denormalise for speed); archive old data; distribute data across servers; run other jobs overnight.", mk: "area 3" },
        { m: "For each measure, say HOW it helps: \"more cores\" is one point; \"more cores, which can execute several queries' instructions simultaneously\" is two.", mk: "10–12: all three areas, two in good depth", n: "7–9: two areas good · 4–6: one good or two limited, ≥4 points · 1–3: a few points. \"Faster\" alone is not an expansion." }
      ], result: "Three areas, each improvement explained" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State and explain (factor)", "Name the factor + its mechanism (\"so more instructions per second\")."],
      ["Explain why X beats Y (cores vs clock)", "Tie to whether the task can run in parallel."],
      ["Describe (cache)", "What, what for, why more helps (probability of a hit)."],
      ["Describe features of the scenario", "Quote the scenario's facts, not generic speed."],
      ["12-mark explain", "Every area; every measure + how it improves performance."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Clever Cats Can Watch Dogs Arrive\"", body: "**C**lock speed, **C**ores, **C**ache, **W**ord length, **D**ata bus width, **A**ddress bus width — each with \"so that…\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Faster processor\" (NE.).", "More cores always faster — only for parallel work.", "Address bus width making transfers faster (it allows more memory).", "Defining cache only as \"fast memory\" without what it stores."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.1.1 bus widths; 4.7.3.2 the F-E cycle (the 2023 essay); 4.7.4.2 SSD vs HDD; 4.9 network bandwidth; 4.10 indexing and concurrency; 4.6.3.1 compiled vs interpreted speed; 4.12 functional programming and parallelism; 4.11 distributing data across servers." } }
  ],
  flashcards: [
    ["Effect of a higher clock speed?", "More instructions executed per second."],
    ["Effect of more cores?", "Several instructions/processes executed simultaneously — if the task can be parallelised."],
    ["What is cache memory?", "Small, very fast memory on/near the processor holding frequently/recently used instructions and data."],
    ["Why does more cache help?", "Higher probability of a cache hit — fewer slow main-memory fetches."],
    ["Effect of a longer word length?", "More bits processed in one operation."],
    ["Effect of a wider data bus?", "More bits transferred at once — fewer transfers."],
    ["Effect of a wider address bus?", "More memory addressable, so more RAM can be fitted (less virtual memory)."],
    ["When does a fast single core beat a slower multi-core?", "For sequential tasks that cannot be split."],
    ["Cache hit vs miss?", "Item found in cache vs must be fetched from main memory."],
    ["Name three areas to improve a slow database server.", "Server hardware, the network, the database/software design."]
  ],
  quiz: [
    { q: "More cores help most when", opts: ["the task can be split into parallel parts", "the task is strictly sequential", "the clock is slow", "cache is small"], ans: 0, why: "Parallelism." },
    { q: "Increasing cache improves performance because", opts: ["cache hits become more likely", "the clock speeds up", "the address bus widens", "RAM is removed"], ans: 0, why: "Fewer main-memory fetches." },
    { q: "A wider address bus directly allows", opts: ["more memory locations", "faster transfers", "more cores", "a higher clock"], ans: 0, why: "2ⁿ locations." },
    { q: "\"Faster processor\" as an improvement scores", opts: ["NE.", "1 mark", "2 marks", "full marks"], ans: 0, why: "Name the factor." },
    { q: "Word length is", opts: ["the number of bits processed in one operation", "the clock period", "the cache size", "the bus voltage"], ans: 0, why: "Definition." }
  ]
};

/* =====================================================================
   4.7.4.1  Input and output devices
   ===================================================================== */
C["compsci:4.7.4.1"] = {
  notes: [
    { h: "Input and output devices — the whole topic on one page" },
    "Spec 4.7.4.1: know the main characteristics, purposes and suitability of the **barcode reader, digital camera, laser printer and RFID**, and understand their principles of operation.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Laser printer principles of operation", "Describe", "6", "AS 2017 Q10, A-level 2021 Q07.2"],
      ["How data is read from an RFID tag", "Describe", "3", "AS 2024 Q09.1"],
      ["Digital camera after the light is focused", "Describe", "3", "AS 2025 Q11.1"],
      ["Barcode vs RFID vs camera for a scenario", "Evaluate / Explain", "2–6", "AS 2016 Q08.1, A-level 2020 Q08.1–08.2"],
      ["RFID characteristics; passive vs active", "State / Explain", "2–3", "AS 2023 Q14, AS 2024 Q09.2"],
      ["RFID reads → SQL updates", "Describe", "6", "A-level 2020 Q08.3"],
      ["Laser printer with Wi-Fi for an office", "Explain", "3", "A-level 2021 Q07.1"],
      ["RFID + barcode hardware and the ethics (essay)", "Describe and discuss", "12", "A-level 2022 Q06"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Barcode readers**.", "**RFID**.", "**Digital cameras**.", "**Laser printers**.", "**Choosing a device**.", "**Exam toolkit**."] },

    { page: "Barcode readers" },
    { steps: [
      "A **light source / laser** illuminates the barcode.",
      "A **moving mirror / prism** sweeps the beam across the code (or the user moves the reader / code).",
      "**Black bars reflect less light, white spaces more.**",
      "A **light sensor (photodiode / CCD)** measures the reflected light, giving a varying signal.",
      "The pattern of bar widths is decoded into a number (with a **check digit** validated, 4.5.5.3) and sent to the computer."
    ] },
    { ul: [
      "**2D codes** (QR) store data in a grid and are read by a **camera** that images the whole code.",
      "Characteristics: very **cheap** to print; needs **line of sight** and must face the reader; easily damaged / obscured; human-readable digits usually printed underneath as a backup."
    ] },

    { page: "RFID" },
    { fig: { w: 560, h: 150, items: (function () {
      var it = [];
      it = it.concat(boxAt(20, 40, 140, 70, "RFID reader", "accent", "antenna + transceiver"));
      it = it.concat(boxAt(400, 40, 140, 70, "RFID tag", "accent2", "antenna + chip (memory)"));
      it = it.concat(arrow(165, 60, 395, 60, "1 · reader emits radio waves", { dy: -2 }));
      it.push(txt(280, 86, "2 · induced current powers the tag", { size: 10.5 }));
      it = it.concat(arrow(395, 105, 165, 105, "3 · tag transmits its stored data by radio", { dy: 26 }));
      return it;
    })(), cap: "Reading a passive RFID tag: no battery, no line of sight, a few centimetres to metres." } },
    { steps: [
      "The **RFID reader emits radio waves** (an electromagnetic field).",
      "The tag's **antenna** picks them up; they **induce a current** that powers a **passive** tag (an active tag is triggered and uses its own battery).",
      "The tag's chip holds data in its **memory** (an ID; possibly more).",
      "The tag **transmits the data back by radio** to the reader, which converts it to binary data for the computer."
    ] },
    { table: { head: ["", "Passive tag", "Active tag"], rows: [
      ["Power", "induced by the reader — **no battery**", "own **battery**"],
      ["Range", "a few cm (to a few m)", "tens of metres +"],
      ["Size / cost", "small, **cheap**", "larger, dearer"],
      ["Lifetime", "indefinite", "limited by the battery"],
      ["Uses", "ID cards, passports, contactless payment, stock items", "vehicle tolls, tracking containers / livestock"]
    ] } },
    { callout: { t: "miscon", h: "\"RFID stores more data, so it is better\"", body: "For stock control **R.** \"RFID tags can store more data\" (not relevant — the barcode holds the same ID). RFID's real advantages: **no line of sight, many tags read at once, read at a distance, at speed, without unpacking, harder to damage**." } },

    { page: "Digital cameras" },
    { steps: [
      "Light passes through the lens and is focused on a grid (**array**) of light-sensitive cells — a **CCD** or **CMOS** sensor — one cell per pixel.",
      "Each cell (**photosensor**) converts the light falling on it into an **electrical charge / analogue voltage**, proportional to its brightness.",
      "**Red, green and blue filters** over the cells (a Bayer pattern) measure each colour component.",
      "An **ADC** converts each voltage into a **binary** value (4.5.6.3) — its bit depth sets the colour depth.",
      "The values form a bitmap, usually **compressed** (JPEG) and stored with **metadata** on flash memory / an SSD."
    ] },
    { callout: { t: "tip", h: "Synoptic: 4.5.6.2 and 4.5.6.4", body: "A-level 2024 Q02.3: the sensor voltages are **analogue** (continuously variable); the stored pixel data is **digital** (a fixed number of bits). Resolution = the number of cells; colour depth = bits per pixel from the ADC." } },

    { page: "Laser printers" },
    { fig: { w: 640, h: 130, items: (function () {
      var it = [], st = [["Bitmap", "page in memory"], ["Charge drum", "drum charged"], ["Laser", "discharges image"], ["Toner", "sticks to image"], ["Transfer", "paper over drum"], ["Fuse", "heat + pressure"]];
      st.forEach(function (s, i) {
        it = it.concat(boxAt(10 + i * 104, 40, 98, 58, s[0], i < 3 ? "accent" : "accent2", s[1]));
        if (i < 5) it = it.concat(arrow(108 + i * 104, 69, 114 + i * 104, 69));
      });
      return it;
    })(), cap: "Six stages of a laser printer, in order." } },
    { steps: [
      "The printer builds a **bitmap of the page** in its memory from the data received.",
      "A **photosensitive drum** is given an electrostatic **charge** (say negative).",
      "A **laser beam**, directed by a **rotating mirror** and switched on and off (modulated), sweeps across the drum; where it strikes, the charge is **neutralised / reversed** — drawing the image.",
      "**Toner**, given a charge, **sticks to the drum** only where the laser struck (or only where it did not, depending on polarity).",
      "**Paper**, charged by a **transfer roller**, passes over the drum and the toner transfers to it.",
      "**Heated rollers fuse** (melt) the toner onto the paper. Colour printers repeat this with **four** toners (cyan, magenta, yellow, black)."
    ] },
    { callout: { t: "warn", h: "Two order traps", body: "The laser is directed at the **drum**, never the paper (**R.** laser at paper). Fusing happens once the toner is **on the paper**, not on the drum." } },
    { table: { head: ["Laser printer: suits…", "because…"], rows: [
      ["an office printing many pages", "**high speed** (pages per minute); **low cost per page** (toner cheaper than ink)"],
      ["infrequent use", "toner **does not dry out** like ink"],
      ["text and graphics", "**high resolution**; many paper-tray options"],
      ["sharing (with Wi-Fi)", "many devices print directly without cabling; remote management; Wi-Fi speed and range are enough for a small office"]
    ] } },

    { page: "Choosing a device" },
    { table: { head: ["", "Barcode", "RFID", "Camera (recognition)"], rows: [
      ["Line of sight needed", "yes", "**no**", "yes"],
      ["Read many at once", "no", "**yes**", "possibly"],
      ["Read while moving fast", "poor", "**good**", "blur, occlusion"],
      ["Cost per item", "**tiny**", "higher (cents)", "no tag — but heavy storage/processing"],
      ["Damage", "scratched / obscured → unreadable", "**durable**", "nothing to damage"],
      ["Reliability", "high if visible", "dead spots, interference", "face recognition unreliable"]
    ] } },
    { worked: { tag: "exam", title: "Marathon checkpoints: evaluate three devices (6 marks)", src: "AS June 2016 · P2 Q08.1 · 6 marks",
      q: "Barcode readers, digital cameras and RFID readers could each capture data automatically as runners pass checkpoints. The organisers chose RFID. Evaluate the suitability of all three devices and explain why RFID is the most appropriate choice.",
      steps: [
        { h: "Camera", m: "No tag that can be lost, but other runners may block the line of sight; thousands of photos need a lot of storage; face recognition is unreliable (and costumed runners).", mk: "indicative" },
        { h: "Barcode", m: "Barcodes are very cheap and light, but can be obscured by clothing, are hard to scan on a moving, curved runner, may be missed when many pass together, and runners might have to slow down.", mk: "indicative" },
        { h: "RFID", m: "RFID is read without line of sight, quickly, as runners pass at speed without stopping, and many tags at once; tags can be reused next year (though dead spots are possible).", mk: "indicative" },
        { h: "Conclusion", m: "RFID is most suitable because it needs no line of sight, reads many fast-moving runners at once, and runners never have to stop.", mk: "5–6 marks", n: "5–6 needs all three devices compared and a reasoned conclusion with 2 (5 marks) or 3 (6 marks) reasons. Each advantage must be relative to another device." }
      ], result: "Compare all three; conclude with ≥3 reasons" } },
    { worked: { tag: "exam", title: "How an RFID tag is read", src: "AS June 2024 · P2 Q09.1 · 3 marks",
      q: "RFID tags can be read by an RFID reader. Describe how data is read from an RFID tag.",
      steps: [
        { m: "The RFID reader emits radio waves;", mk: "1 mark" },
        { m: "the waves induce enough power in the tag's antenna to power it (or trigger an active tag);", mk: "1 mark" },
        { m: "the tag emits radio waves to transmit the data stored on its chip back to the reader;", mk: "1 mark", n: "Max 3. Say \"radio waves\" somewhere." }
      ], result: "Emit, power, transmit back" } },
    { worked: { tag: "exam", title: "Passive tags in passports", src: "AS June 2024 · P2 Q09.2 · 2 marks",
      q: "A passive tag must be within a few centimetres of a reader; an active tag has its own power source and a greater range. Explain why passive tags are more appropriate for passports.",
      steps: [
        { m: "Passive tags can only be read close to the reader, so it is harder to intercept / steal personal data from the passport;", mk: "1 mark" },
        { m: "no battery to replace or charge — an active tag's battery may not last as long as the passport is valid (and passive tags are smaller and cheaper on a national scale);", mk: "1 mark" }
      ], result: "Security; no battery" } },
    { worked: { tag: "exam", title: "RFID for a secure room", src: "AS June 2023 · P2 Q14 · 3 marks",
      q: "A company replaced a keypad lock on a secure server room with an RFID reader, and staff ID cards with ones containing RFID tags. State three characteristics of RFID and explain why each makes it suitable.",
      steps: [
        { m: "RFID tags are small and light — easy to integrate into staff ID cards;", mk: "1 mark" },
        { m: "they can be read quickly — suitable for access in an emergency;", mk: "1 mark" },
        { m: "the tag stores data, so access credentials can be stored — no code to remember, and different staff can have different access levels;", mk: "1 mark", n: "Also: cheap; durable; no power source; contactless. 1 mark only for two reasons with no scenario link." }
      ], result: "Characteristic + scenario reason" } },
    { worked: { tag: "exam", title: "Digital camera principles", src: "AS June 2025 · P2 Q11.1 · 3 marks",
      q: "Light is focused on an array of light-sensitive cells arranged in rows and columns. Describe the principles of operation of a digital camera after this.",
      steps: [
        { m: "Each cell / photosensor outputs an analogue voltage proportional to the amount of light falling on it (photons → charge);", mk: "1 mark" },
        { m: "an ADC converts the voltages to binary;", mk: "1 mark" },
        { m: "red, green and blue filters measure the colour components (sensor electronics are CCD or CMOS);", mk: "1 mark" }
      ], result: "Voltage → ADC → colour filters" } },
    { worked: { tag: "exam", title: "Laser printer (6 marks)", src: "A-level June 2021 · P2 Q07.2 · 6 marks",
      q: "Describe the principles of operation of a laser printer.",
      steps: [
        { m: "A bitmap of the page is built in the printer's memory, and a negative charge is applied to the photosensitive drum." },
        { m: "A laser beam, directed by a mirror, strikes the drum; where it strikes, the charge is neutralised." },
        { m: "Negatively charged toner sticks to the drum where the laser struck." },
        { m: "Paper passes over the drum; a positively charged transfer roller pulls the toner onto it." },
        { m: "A heater fuses the toner onto the paper; colour uses four toners / drums.", mk: "5–6 marks", n: "5–6: almost all the indicative content; 3–4: key parts with gaps; 1–2: limited. R. laser directed at paper. (AS 2017 Q10 is the same 6-mark question.)" }
      ], result: "Charge, laser, toner, transfer, fuse" } },
    { worked: { tag: "exam", title: "Laser + Wi-Fi for a small office", src: "A-level June 2021 · P2 Q07.1 · 3 marks",
      q: "Explain why a laser printer with a built-in wireless network adapter is likely to be a suitable choice of printer for a small office.",
      steps: [
        { h: "Laser (max 2)", m: "Low cost per printed page (toner cheaper per page than ink) // prints many pages per minute;", mk: "1 mark" },
        { h: "Laser", m: "toner does not dry out // high-resolution output // many paper-handling options;", mk: "1 mark" },
        { h: "Wi-Fi (max 2)", m: "Easy to share between many devices, which can print directly over Wi-Fi with no cabling to install;", mk: "1 mark" }
      ], result: "Cheap, fast pages; easy sharing" } },
    { worked: { tag: "exam", title: "RFID or barcodes in the warehouse", src: "A-level June 2020 · P2 Q08.1–08.2 · 4 marks",
      q: "Products on pallets could be labelled with barcodes or RFID tags storing a ProductID and an ItemID. (a) Why might the warehouse owners prefer RFID? (b) Why might manufacturers or supermarkets prefer barcodes?",
      steps: [
        { h: "(a) AO2", m: "A lot of individual products must be scanned simultaneously when a lorry arrives / leaves;", mk: "1 mark" },
        { h: "(a) AO1", m: "RFID tags can be read without removing products from the pallet // at a distance // automatically, with no-one scanning;", mk: "1 mark", n: "R. \"RFID tags store more data\" — not relevant." },
        { h: "(b) AO1", m: "Barcodes are cheaper than RFID tags (and less electronic waste);", mk: "1 mark" },
        { h: "(b) AO2", m: "the higher cost of tags would be added to prices // barcodes can be scanned by the existing checkout equipment;", mk: "1 mark" }
      ], result: "Bulk reading vs cost" } },
    { worked: { tag: "exam", title: "RFID reads update the stock table (6 marks)", src: "A-level June 2020 · P2 Q08.3 · 6 marks",
      q: "Describe how an RFID reader would read the ProductID and ItemID values from tags as pallets are delivered, and explain how this data could update the stock table, referring to the types of SQL statement used (no code needed).",
      steps: [
        { h: "Read (AO1)", m: "The RFID reader at the entrance transmits a signal;", mk: "1 mark" },
        { m: "the signal energises / induces a current in each RFID tag;", mk: "1 mark" },
        { m: "each tag transmits its data back by radio;", mk: "1 mark" },
        { h: "Update (AO2)", m: "The signals are processed into a form suitable for querying; a SELECT query checks whether a record for that ProductID already exists (an empty result means a new product);", mk: "1 mark" },
        { m: "if it exists, an UPDATE statement increases QuantityInStock by the number of items delivered;", mk: "1 mark" },
        { m: "if not, an INSERT statement creates a new record — some details must be entered manually, as they are not on the tag;", mk: "1 mark" }
      ], result: "Read by radio; SELECT, then UPDATE or INSERT" } },
    { worked: { tag: "exam", title: "Checkout hardware and the ethics (12-mark essay)", src: "A-level June 2022 · P2 Q06 · 12 marks",
      q: "At the checkout a customer's identity is read from a loyalty or payment card using RFID, and a barcode reader identifies the products. Describe the principles of operation of this hardware and discuss the ethical and legal issues that might arise from capturing and processing this data.",
      steps: [
        { h: "Area 1 · RFID", m: "The card's tag has an antenna, circuitry and memory holding the customer data. The reader at the till emits an electromagnetic field; this induces a current that powers the passive tag, which transmits its data by radio over a very short range; the reader converts it back to binary data.", mk: "area 1" },
        { h: "Area 2 · Barcode", m: "A laser / light source illuminates the barcode; a moving mirror sweeps it across (or the item is moved); black bars reflect less light than white; a photodiode / CCD measures the reflection and the pattern is decoded.", mk: "area 2" },
        { h: "Area 3 · Ethics and law", m: "Profiling can reveal sensitive facts (pregnancy, children) customers never disclosed; data may be sold to other companies; customers may not understand or have consented to this use. The Data Protection Act / GDPR requires a lawful basis, purpose limitation, security and rights of access; data must not be kept longer than needed. Benefits (offers, stock planning) must be balanced against privacy.", mk: "area 3", n: "See 4.8.1 for the ethical and legal framework." },
        { m: "Structure as three sections and link them: the hardware is what makes collection automatic and invisible — which is exactly why the ethical issues arise.", mk: "10–12: all three areas, two in good depth" }
      ], result: "Two devices explained + ethics/law discussed" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the principles of operation", "The steps IN ORDER, each a mechanism (charge → laser → toner → transfer → fuse)."],
      ["Evaluate (devices for a scenario)", "Each device's pros and cons RELATIVE to the others, tied to the scenario; a reasoned conclusion."],
      ["Explain why (passive / RFID / barcode)", "Characteristic + why it matters in this scenario."],
      ["12-mark", "Every area; hardware sequenced; ethics with examples and law."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "Laser printer: \"Big Cats Like Their Toys Fluffy\"", body: "**B**itmap, **C**harge the drum, **L**aser discharges, **T**oner sticks, **T**ransfer to paper, **F**use. RFID: \"**E**mit, **I**nduce, **T**ransmit\". Camera: \"**L**ight → **V**oltage → **A**DC → **B**inary\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Laser shone at the paper (R.).", "Fusing toner while it is still on the drum.", "\"RFID stores more data\" as the warehouse advantage (R.).", "Advantages that are not compared with another device.", "\"Radio waves\" never mentioned in an RFID description."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.3 ADC in cameras; 4.5.6.4 pixels and colour depth; 4.5.5.3 barcode check digits; 4.10.2 SQL SELECT / UPDATE / INSERT; 4.8.1 privacy, GDPR and data ethics; 4.9.1.2 Wi-Fi; 4.7.1.1 I/O controllers connect these devices." } }
  ],
  flashcards: [
    ["How does a barcode reader work?", "Light shone on the code; dark bars reflect less than light ones; a sensor measures reflection; pattern decoded."],
    ["How is a passive RFID tag read?", "Reader emits radio waves; they induce power in the tag; the tag transmits its data back by radio."],
    ["Passive vs active RFID?", "No battery, short range, cheap vs own battery, long range, dearer."],
    ["Two advantages of RFID over barcodes?", "No line of sight; many read at once; at a distance; durable."],
    ["Two advantages of barcodes over RFID?", "Much cheaper; readable by existing scanners; human-readable backup."],
    ["Digital camera principle?", "Sensor cells (CCD/CMOS) give voltages proportional to light; RGB filters; ADC converts to binary."],
    ["Laser printer stages?", "Bitmap; charge drum; laser discharges image; toner sticks; transfer to paper; fuse with heat."],
    ["Where is the laser directed?", "At the photosensitive drum (via a rotating mirror)."],
    ["Why is a laser printer good for an office?", "Fast, low cost per page, toner doesn't dry out."],
    ["Why passive tags in passports?", "Short range makes interception harder; no battery to expire."]
  ],
  quiz: [
    { q: "A passive RFID tag is powered by", opts: ["radio waves from the reader", "its own battery", "light", "the mains"], ans: 0, why: "Induced current." },
    { q: "In a laser printer the laser discharges", opts: ["the drum", "the paper", "the toner cartridge", "the fuser"], ans: 0, why: "R. laser at paper." },
    { q: "A barcode reader detects", opts: ["differences in reflected light", "radio signals", "magnetic fields", "pressure"], ans: 0, why: "Black reflects less." },
    { q: "A camera's ADC converts", opts: ["sensor voltages to binary", "binary to light", "colour to greyscale", "JPEG to bitmap"], ans: 0, why: "4.5.6.3." },
    { q: "Best for reading 120 boxes on a pallet at once:", opts: ["RFID", "barcode", "camera", "keyboard"], ans: 0, why: "Simultaneous, no line of sight." }
  ]
};

/* =====================================================================
   4.7.4.2  Secondary storage devices
   ===================================================================== */
C["compsci:4.7.4.2"] = {
  notes: [
    { h: "Secondary storage devices — the whole topic on one page" },
    "Spec 4.7.4.2: explain the **need for secondary storage**; know the characteristics, purposes, suitability and principles of operation of the **hard disk, optical disk and solid-state disk (SSD)**; compare their **capacity and speed of access** and judge their suitability for applications. (SSD = NAND flash memory + a controller; floating-gate transistors trap charge; a block of pages must be erased before it can be rewritten.)",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why computers have secondary storage", "Explain", "2", "A-level 2022 Q13.2"],
      ["SSD principles of operation; components", "Describe / State", "2–4", "AS 2016 Q08.3, 2025 Q11.2, A-level 2022 Q13.3"],
      ["Optical disk principles (6)", "Describe", "6", "A-level 2018 Q06.1, 2025 Q03.1"],
      ["Why both HDD and SSD; why not only SSD", "State / Explain", "2", "AS 2016 Q08.2, 2019 Q08.1"],
      ["SSD vs optical / HDD for a scenario", "Explain", "1–4", "AS 2019 Q08.2, 2020 Q08.2, A-level 2018 Q06.2, 2024 Q05.2, 2025 Q03.2"],
      ["HDD storage + TCP/IP (essay); SSD + ethics (essay)", "Describe / Discuss", "12", "A-level 2024 Q05.1, AS 2024 Q10"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Why secondary storage**.", "**Hard disk drives**.", "**Optical disks**.", "**Solid-state drives**.", "**Comparing the three**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Why secondary storage" },
    { ul: [
      "**Non-volatile**: it keeps data and programs **when the computer is turned off** — the contents of RAM are lost.",
      "**Capacity**: data sets and files too large to fit in RAM (and an architecture supports only so much main memory).",
      "**Transfer**: moving data and programs between computers (a USB drive).",
      "Programs are loaded **from** it into main memory to run (4.7.2.1)."
    ] },
    { callout: { t: "warn", h: "NE. answers (A-level 2022 Q13.2)", body: "\"Secondary storage is non-volatile\" and \"to store more / large files\" are **NE.** — say *to store data while the computer is off, because RAM loses its contents*; *for data sets that would not fit in RAM*. And **R.** \"main memory\" alone for RAM there." } },

    { page: "Hard disk drives" },
    { fig: { w: 560, h: 220, items: (function () {
      var it = [], cx = 140, cy = 110;
      [90, 70, 50].forEach(function (r) { it.push({ circle: [cx, cy, r], c: "accent", w: 1.4 }); });
      it.push({ circle: [cx, cy, 14], c: "muted", w: 1.4, fill: "muted" });
      for (var a = 0; a < 360; a += 45) { var t = a * Math.PI / 180; it.push({ line: [[cx + 14 * Math.cos(t), cy + 14 * Math.sin(t)], [cx + 90 * Math.cos(t), cy + 90 * Math.sin(t)]], c: "muted", w: 1 }); }
      it.push({ poly: [[cx + 52, cy - 64], [cx + 74, cy - 64], [cx + 74, cy - 44], [cx + 52, cy - 44]], fill: "accent2", alpha: 0.5, c: "accent2", w: 1.4 });
      it.push({ line: [[330, 40], [cx + 62, cy - 54]], c: "accent2", w: 3 }, { circle: [330, 40, 6], c: "accent2", w: 2, fill: "accent2" });
      it.push({ text: [400, 30], t: "actuator arm moves", b: true, size: 11, c: "accent2", pos: "e", off: 0 }, { text: [400, 46], t: "the head in / out (seek)", size: 10.5, c: "muted", pos: "e", off: 0 });
      it.push({ text: [300, 110], t: "tracks: concentric rings", size: 11, c: "accent", pos: "e", off: 0 });
      it.push({ text: [300, 130], t: "sectors: blocks of a track (shaded)", size: 11, c: "accent2", pos: "e", off: 0 });
      it.push({ text: [300, 150], t: "platter spins (5 400–15 000 rpm)", size: 11, c: "muted", pos: "e", off: 0 });
      it.push({ text: [300, 170], t: "access time = seek + rotational delay", size: 11, c: "muted", pos: "e", off: 0 });
      return it;
    })(), cap: "A platter seen from above. To read a sector, the head seeks to its track, then waits for the sector to rotate beneath it." } },
    { steps: [
      "Each **platter** is coated in a **magnetisable** material (iron / cobalt based); a drive may stack several platters (a sealed unit).",
      "Each surface is divided into concentric **tracks**, each track into **sectors / blocks**.",
      "A bit is a tiny region **magnetised in one direction (1) or the other (0)**.",
      "The disk **spins** at high speed; the **read/write head** on an actuator arm moves **in and out** to the correct track.",
      "The drive **waits until the right sector passes under the head**; the head senses (or sets) the magnetic field — a whole block at a time, buffered.",
      "The OS keeps a **file allocation table** of used and free blocks; files fragment across blocks (defragmentation, 4.6.1.3); RAID mirroring / striping protects against failure."
    ] },

    { page: "Optical disks" },
    { fig: { w: 560, h: 170, items: (function () {
      var it = [], prof = [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0], x0 = 30, w = 30, yL = 60, yP = 80;
      var pts = [];
      prof.forEach(function (p, i) { var y = p ? yP : yL; pts.push([x0 + i * w, y], [x0 + (i + 1) * w, y]); });
      it.push({ poly: pts, close: false, c: "accent", w: 2.4 });
      it.push({ text: [x0 + 15, 48], t: "land", size: 10.5, c: "muted" }, { text: [x0 + 105, 96], t: "pit", size: 10.5, c: "muted" });
      var bits = [];
      for (var i = 0; i < prof.length; i++) { var b = i > 0 && prof[i] !== prof[i - 1] ? "1" : "0"; bits.push(b); it.push({ text: [x0 + i * w + w / 2, 125], t: i === 0 ? "·" : b, b: b === "1", size: 12, c: b === "1" ? "accent2" : "muted" }); }
      it.push({ text: [x0, 150], t: "a transition (land ↔ pit edge) = 1; no change = 0", size: 11, c: "text2", pos: "e", off: 0 });
      it = it.concat(arrow(250, 14, 255, 56, "laser", { c: "accent2", dx: 20, dy: 6 }));
      return it;
    })(), cap: "A cross-section of the spiral track. Lands reflect the laser to the sensor; a pit–land edge scatters it — the change in reflection marks a 1." } },
    { steps: [
      "Data is stored on **one long spiral track** from the centre outwards.",
      "The track is a sequence of **pits** and **lands** (pressed into a ROM; burnt as dark dye spots on a recordable disk).",
      "A **low-power laser** is focused onto a spot on the track.",
      "Light reflected back falls on a **light sensor / photodiode**: a land (or continued pit) reflects; a **transition** between pit and land scatters the light.",
      "A **transition represents 1**, no transition **0**.",
      "The disk spins at **constant linear velocity** (variable angular speed — faster near the centre) so the track passes the head at a steady rate; the head moves in / out to reach a point on the track."
    ] },
    { table: { head: ["Format", "Typical capacity", "Laser"], rows: [["CD", "700 MB", "infrared, 780 nm"], ["DVD", "4.7 GB (single layer)", "red, 650 nm"], ["Blu-ray", "25–100 GB", "blue-violet, 405 nm — smaller pits"]] } },
    { callout: { t: "miscon", h: "\"Pit = 0, land = 1\"", body: "Strictly it is the **transition** that encodes 1 — but the mark scheme also accepts land = 1, pit = 0 (or reflection = 1). **R.** \"the disk spins at constant speed\" — say constant LINEAR velocity / variable angular speed." } },

    { page: "Solid-state drives" },
    { fig: { w: 560, h: 170, items: (function () {
      var it = [];
      it = it.concat(boxAt(20, 50, 110, 70, "Controller", "accent2", "wear levelling"));
      it.push({ text: [75, 140], t: "SATA / NVMe interface", size: 10.5, c: "muted" });
      for (var b = 0; b < 3; b++) {
        var bx = 170 + b * 128;
        it.push({ poly: [[bx, 24], [bx + 116, 24], [bx + 116, 146], [bx, 146]], c: "accent", w: 1.6 });
        it.push({ text: [bx + 58, 14], t: "block " + b, b: true, size: 11, c: "accent" });
        for (var p = 0; p < 4; p++) it = it.concat(boxAt(bx + 8, 32 + p * 28, 100, 22, "page", b === 1 && p === 2 ? "danger" : "good"));
      }
      it.push({ text: [362, 160], t: "to change one page, the whole block is copied, erased and rewritten", size: 10.5, c: "danger" });
      return it;
    })(), cap: "NAND flash is read and written in pages but erased only in whole blocks — the controller hides this." } },
    { steps: [
      "Data is stored **electronically** — there are **no moving parts**.",
      "Each bit is held in a **floating-gate transistor**: electrons **trapped between oxide layers** stay there without power (non-volatile).",
      "The **presence or absence of trapped charge** represents 0 or 1.",
      "The memory is **NAND flash**, organised into **pages** grouped into **blocks**.",
      "A whole page is written at once; a block must be **erased before it can be rewritten** — individual values cannot be overwritten.",
      "A **controller** manages the organisation, reading and writing (mapping logical to physical pages, **wear levelling** because each block survives only a limited number of erase cycles)."
    ] },
    { callout: { t: "miscon", h: "\"SSDs store positive and negative charges\"", body: "**R.** — a cell either holds **trapped electrons** or does not. And it is not RAM: it keeps its data without power. Components of an SSD (AS 2016): **NAND flash memory** (A. floating-gate transistors) and a **controller** (A. a SATA interface)." } },

    { page: "Comparing the three" },
    { table: { head: ["", "HDD (magnetic)", "SSD (flash)", "Optical (CD/DVD/BD)"], rows: [
      ["Typical capacity", "1–24 TB", "0.25–8 TB", "0.7–100 GB"],
      ["Access time", "~5–10 ms (seek + rotation)", "~0.1 ms — **no moving parts**", "~100 ms"],
      ["Transfer rate", "~150–250 MB/s", "~500–7000 MB/s", "~1–50 MB/s"],
      ["Cost per GB", "**lowest**", "higher", "low per disk, but small"],
      ["Durability", "damaged by knocks (head crash); magnetic fields", "**shock-resistant**; limited write cycles", "scratches; light/heat"],
      ["Power / heat / noise", "more; audible", "**least**; silent", "drive needed; noisy"],
      ["Portability", "external drives", "USB sticks, phones", "disks, but needs a drive"],
      ["Suits", "bulk, cheap capacity: archives, file servers, backups", "OS and apps (fast boot), laptops, phones, wearables", "distributing films / games / software; read-only archives"]
    ] } },
    { callout: { t: "tip", h: "Why computers have both HDD and SSD", body: "The **SSD** holds the OS and frequently used software for **fast access**; the **HDD** gives **large capacity cheaply** for everything else. Max 1 if you list differences without saying the benefit of having both (AS 2019)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Why desktops have secondary storage", src: "A-level June 2022 · P2 Q13.2 · 2 marks",
      q: "Explain why desktop computers usually have secondary storage devices.",
      steps: [
        { m: "To store data / programs whilst the computer is turned off;", mk: "1 mark" },
        { m: "as the contents of RAM are lost when the computer is turned off // to store data sets / files that could not fit in RAM // to transfer data between computers;", mk: "1 mark", n: "NE. \"non-volatile\", \"store data not in use\", \"store more\". R. \"main memory\" for RAM." }
      ], result: "Persist when off; RAM is volatile" } },
    { worked: { tag: "exam", title: "SSD principles (4 marks)", src: "A-level June 2022 · P2 Q13.3 · 4 marks",
      q: "A computer is fitted with a solid-state disk (SSD). Describe the principles of operation of an SSD.",
      steps: [
        { m: "Data is stored electronically with no moving parts, in floating-gate transistors — electrons trapped between oxide layers, kept without power;" },
        { m: "the presence or absence of trapped charge represents 0 or 1; the memory is NAND flash;" },
        { m: "data is organised into pages within blocks; a whole page is written and a block must be erased before it can be overwritten;" },
        { m: "a controller manages the organisation of the data and the reading and writing.", mk: "3–4 marks", n: "3–4: well structured, most points, no errors. 1–2: some points or errors. R. positive and negative charges. (AS 2025 Q11.2 asks the same for 3 marks, point-marked.)" }
      ], result: "Floating gates, charge = bit, pages/blocks, controller" } },
    { worked: { tag: "exam", title: "Two SSD components", src: "AS June 2016 · P2 Q08.3 · 2 marks",
      q: "State two hardware components of a solid-state drive.",
      steps: [{ m: "NAND (flash) memory (A. floating-gate transistors);", mk: "1 mark" }, { m: "Controller (or a SATA interface);", mk: "1 mark", n: "NE. \"memory\" / \"logic gates\"." }], result: "NAND flash; controller" } },
    { worked: { tag: "exam", title: "Why an HDD as well as an SSD", src: "AS June 2016 · P2 Q08.2 · 2 marks",
      q: "State two reasons why the computer has a magnetic hard disk and a solid-state drive instead of using only solid-state storage.",
      steps: [{ m: "Hard disk drives are cheaper per unit of storage;", mk: "1 mark" }, { m: "hard disk drives have a higher capacity;", mk: "1 mark" }], result: "Cheaper per GB; bigger" } },
    { worked: { tag: "exam", title: "Why both types", src: "AS June 2019 · P2 Q08.1 · 2 marks",
      q: "Explain why computers often have both a hard disk and an SSD rather than just one.",
      steps: [
        { m: "Magnetic disks are useful where large capacity is needed without the cost of very large SSDs;", mk: "1 mark" },
        { m: "SSDs have faster access / lower latency, useful for loading frequently used software;", mk: "1 mark", n: "R. \"faster\" by itself. Max 1 for differences without the benefit of both." }
      ], result: "Capacity + speed where each matters" } },
    { worked: { tag: "exam", title: "Why SSD access beats optical", src: "AS June 2019 · P2 Q08.2 · 2 marks",
      q: "Explain why it is faster to access data from solid-state storage than from an optical disk.",
      steps: [{ m: "There are no moving parts — no need for a read head to move to the correct position or the disk to spin;", mk: "1 mark" }, { m: "it is purely electronic, so latency is minimal;", mk: "1 mark" }], result: "No mechanical delay" } },
    { worked: { tag: "exam", title: "SSD for a life-blogging pendant", src: "AS June 2020 · P2 Q08.2 · 4 marks",
      q: "A life-blogging device worn around the neck records signs, audio and video, storing data on an SSD as well as uploading it. Explain two reasons why an SSD is a better choice than a magnetic hard disk.",
      steps: [
        { h: "Reason 1", m: "SSDs have lower power drain;", mk: "1 mark" },
        { h: "Expansion", m: "important because the device runs on a battery;", mk: "1 mark" },
        { h: "Reason 2", m: "SSDs are less likely to be damaged if dropped (no moving parts);", mk: "1 mark" },
        { h: "Expansion", m: "important because the device is worn and carried around;", mk: "1 mark", n: "Also: faster access (more data per second); silent; lighter and smaller; less heat — each with its scenario link. Max 2 advantages, max 2 expansions." }
      ], result: "Power + robustness, each linked" } },
    { worked: { tag: "exam", title: "USB flash vs CD-R for transfer", src: "A-level June 2018 · P2 Q06.2 · 1 mark",
      q: "USB flash drives are a more popular choice than CD-Rs for transferring files such as images and documents between computers. Explain why.",
      steps: [{ m: "No separate drive is required (the drive and medium are integrated) // flash drives can be reused // faster read/write // higher capacity // not damaged by scratches;", mk: "1 mark", n: "R. \"bigger\" (physical size). NE. \"more robust\" / \"more portable\" without a reason. R. cost without a reason." }], result: "Integrated, rewritable" } },
    { worked: { tag: "exam", title: "File server: SSD advantage and disadvantage", src: "A-level June 2024 · P2 Q05.2 · 2 marks",
      q: "A company is choosing between a file server with magnetic hard disks or with SSDs of the same total capacity. State one advantage and one disadvantage of the SSD server.",
      steps: [{ h: "Advantage", m: "Faster access times / transfer rate // lower power consumption // less heat // less susceptible to impact damage;", mk: "1 mark", n: "NE. \"faster\". R. quieter, portable." }, { h: "Disadvantage", m: "Higher cost per megabyte // higher error rate over time — blocks wear out;", mk: "1 mark", n: "R. lower capacity (the capacities are equal here)." }], result: "Faster; dearer per MB" } },
    { worked: { tag: "exam", title: "Optical disk principles (6 marks)", src: "A-level June 2025 · P2 Q03.1 · 6 marks",
      q: "Describe the principles of operation of an optical disk, covering how data is represented on a disk and how it would be read.",
      steps: [
        { h: "Representation", m: "Data is stored on a single spiral track as a sequence of pits and lands (dye / no dye on a recordable disk)." },
        { h: "Representation", m: "A land reflects light whereas a pit–land transition scatters it; a transition represents 1 and a continuation 0." },
        { h: "Reading", m: "A low-power laser beam is shone at the disk and focused on a spot on the track; reflected light falls on a light sensor / photodiode." },
        { h: "Reading", m: "The disk spins at constant linear velocity (variable angular speed) and the head moves in / out to reach a point on the track.", mk: "5–6 marks", n: "5–6: both mechanism and representation in detail; 3–4: at least three points, logically organised; 1–2: a few points. R. constant speed. (A-level 2018 Q06.1: the same 6-mark question.)" }
      ], result: "Spiral of pits/lands; laser + sensor; CLV" } },
    { worked: { tag: "exam", title: "Why no optical drive now", src: "A-level June 2025 · P2 Q03.2 · 2 marks",
      q: "State two reasons why most modern computers do not have an optical disk drive.",
      steps: [{ m: "Software, video and music can be downloaded / streamed over the Internet, and backups made to the cloud;", mk: "1 mark" }, { m: "Other devices (SSDs, USB drives) have higher capacity, faster access, are more compact and less easily damaged than scratchable disks;", mk: "1 mark", n: "Also: drives are bulky; less content released on disk; some disks write only once." }], result: "Online delivery; better alternatives" } },
    { worked: { tag: "exam", title: "HDD storage and the TCP/IP stack (12-mark essay)", src: "A-level June 2024 · P2 Q05.1 · 12 marks",
      q: "A file server stores files on magnetic hard disks. Describe how a file's data is stored on and read from the disk, and how each layer of the TCP/IP stack in the file server would be used to put the file onto the network.",
      steps: [
        { h: "Area 1 · Disk", m: "Platters are coated in a magnetisable material; a region magnetised one way is 0, the other 1. Each surface is divided into tracks and sectors / blocks. The disk spins at high speed; the read/write head moves radially to the track and waits for the sector to pass beneath it, sensing the field and converting it to 0s and 1s; a whole block is read into a buffer. A file allocation table records free and used blocks; RAID may mirror or stripe data.", mk: "area 1" },
        { h: "Area 2 · Application", m: "The application layer (e.g. FTP / HTTP / SMB server) responds to the request, formatting the file data for the protocol.", mk: "area 2" },
        { h: "Area 2 · Transport", m: "TCP splits the data into segments, numbers them for reassembly, adds the source and destination port numbers, and manages acknowledgements and retransmission.", mk: "area 2" },
        { h: "Area 2 · Network / Internet", m: "IP wraps each segment in a packet with the source and destination IP addresses, for routing.", mk: "area 2" },
        { h: "Area 2 · Link", m: "The link layer adds the MAC addresses of this hop in a frame and the network card puts the bits onto the medium.", mk: "area 2", n: "TCP/IP in depth: 4.9.3.1." },
        { m: "Cover both areas in sequence and in depth.", mk: "10–12: both areas good" }
      ], result: "Magnetic storage + four layers down" } },
    { worked: { tag: "exam", title: "SSDs for a tracker company — the storage half (12-mark essay)", src: "AS June 2024 · P2 Q10 · 12 marks",
      q: "A company will sell hundreds of millions of luggage trackers that relay encrypted locations via nearby smartphones, keeping all location data permanently on SSD servers. Discuss the moral, ethical, legal and cultural issues raised and explain the properties of SSDs the company should consider.",
      steps: [
        { h: "Issues (4.8.1)", m: "Moral: criminals could slip trackers into victims' bags to stalk them. Ethical: privacy is eroded as movements are logged permanently. Legal: data crosses borders with different laws; GDPR rights; the Computer Misuse Act protects the data. Cultural: some groups distrust tracking; rural areas with few phones are poorly served.", mk: "area 1" },
        { h: "SSD for", m: "Higher read/write speeds (no moving parts) keep up with millions of location writes; less prone to failure from knocks; lower power and cooling costs; smaller, so less data-centre space.", mk: "area 2" },
        { h: "SSD against", m: "More expensive per bit for the enormous permanent archive; a limited number of write cycles before blocks wear out — a write-heavy workload shortens drive life.", mk: "area 2" },
        { h: "Judgement", m: "SSDs suit the hot, frequently written recent data; cheaper HDDs (or tape) may suit the permanent archive.", mk: "9–12: wide range, developed, with examples", n: "5–8: some SSD properties and at least two of the four aspects; 1–4: little reasoning." }
      ], result: "Issues + SSD trade-offs + a judgement" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain the need", "Non-volatile store for when power is off; capacity beyond RAM; transfer."],
      ["Describe principles of operation", "Representation + mechanism, in sequence (levels of response)."],
      ["Explain why X suits a scenario", "Property + why it matters HERE (battery, carried, millions of writes)."],
      ["State advantage / disadvantage", "A specific property: access time, power, cost per MB, write endurance."],
      ["Compare / judge", "Capacity, access speed, cost, durability → a recommendation."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Magnets, Mirrors, Memory\"", body: "HDD = **magnets** (tracks, sectors, seek + spin). Optical = **mirrors** (laser, pits, lands, reflection). SSD = **memory** cells (floating gates, pages, blocks, controller). Pick by **C**apacity, **A**ccess, **C**ost, **D**urability (\"CACD\")." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Faster\" or \"more robust\" with no reason (NE.).", "SSD storing positive and negative charges (R.).", "Optical disk at constant speed (R.) — constant linear velocity.", "\"Non-volatile\" alone for the need for secondary storage (NE.).", "Listing differences when the BENEFIT of having both is asked."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.2.1 programs load from secondary storage into main memory; 4.6.1.3 defragmentation; 4.6.1.4 the OS allocates disk space to files; 4.7.3.7 SSDs in performance essays; 4.9.3.1 TCP/IP (the 2024 essay); 4.8.1 the ethics halves; 4.11 Big Data distributed across many drives." } }
  ],
  flashcards: [
    ["Why is secondary storage needed?", "To keep data/programs when the power is off (RAM is volatile); capacity beyond RAM; transfer."],
    ["How does an HDD store a bit?", "A region of magnetisable coating magnetised one way or the other."],
    ["HDD access time is…", "seek time (head to the track) + rotational delay (sector under the head)."],
    ["How is data stored on an optical disk?", "Pits and lands on a spiral track; a transition = 1."],
    ["How is an optical disk read?", "Low-power laser focused on the track; reflected light measured by a photodiode."],
    ["Optical disk speed?", "Constant linear velocity (variable angular speed)."],
    ["How does an SSD store a bit?", "Trapped (or absent) electrons in a floating-gate transistor."],
    ["SSD write rule?", "Pages written whole; a block must be erased before rewriting."],
    ["Role of the SSD controller?", "Manages data organisation and reading/writing (mapping, wear levelling)."],
    ["Two SSD advantages over HDD?", "Faster access; lower power; shock-resistant; silent; smaller."],
    ["Two HDD advantages over SSD?", "Cheaper per GB; higher capacities; no write-cycle wear."],
    ["Why have both an SSD and an HDD?", "SSD for fast access to the OS/apps; HDD for cheap bulk capacity."]
  ],
  quiz: [
    { q: "An SSD stores bits as", opts: ["trapped charge in floating-gate transistors", "magnetised regions", "pits and lands", "capacitors needing refresh"], ans: 0, why: "NAND flash." },
    { q: "Optical disks represent 1 as", opts: ["a transition between pit and land", "a pit", "a magnetic spot", "trapped charge"], ans: 0, why: "Edge = 1 (land = 1 also accepted)." },
    { q: "The cheapest per GB is usually", opts: ["HDD", "SSD", "RAM", "cache"], ans: 0, why: "Magnetic." },
    { q: "HDD access delay comes from", opts: ["seek and rotation", "erasing blocks", "laser focusing", "wear levelling"], ans: 0, why: "Moving parts." },
    { q: "Best for a battery-powered wearable:", opts: ["SSD", "HDD", "Blu-ray", "tape"], ans: 0, why: "Low power, shock-proof." },
    { q: "\"SSDs are faster\" alone scores", opts: ["NE.", "1 mark", "2 marks", "R."], ans: 0, why: "Say faster ACCESS and why." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
