/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.9.1–
   4.9.2 (serial/parallel and synchronous/asynchronous transmission, baud
   rate, bit rate, bandwidth, latency and protocols, star and bus
   topologies, peer-to-peer and client-server networking, Wi-Fi and
   CSMA/CA) at full A-level depth. Each topic REPLACES the short entry the
   older file carried; every way AQA has examined it (7516/2 June 2016–2025,
   7517/2 June 2017–2025) is explained, worked and answered in the mark
   scheme's own format. Past-paper banks stay in bank-cs-49.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push({ text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" });
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 2, dash: o.dash }];
  if (label) it.push({ text: [(x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0)], t: label, size: 10.5, c: o.c || "accent2" });
  return it;
}
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function node(x, y, label, col) { return [{ circle: [x, y, 14], c: col || "accent", w: 1.6, fill: col || "accent", alpha: 0.18 }, txt(x, y, label, { c: "text", b: true, size: 10.5 })]; }

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\".",
  "Networking definitions are marked on precise words: \"bits\" not \"data\"; \"signal changes per second\" not \"speed\"; \"synchronised by a common clock\" not \"synchronised\"."
] } };

/* =====================================================================
   4.9.1.1  Communication methods
   ===================================================================== */
C["compsci:4.9.1.1"] = {
  notes: [
    { h: "Communication methods — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.1.1)", body: ["Define **serial** and **parallel** transmission and discuss the advantages of serial over parallel.", "Define and compare **synchronous** and **asynchronous** transmission.", "Describe the purpose of **start and stop bits** in asynchronous transmission."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What serial / parallel transmission is; the difference", "State / Describe", "1–2", "AS 2025 Q13.1, A-level 2021 Q03.3, 2022 Q02.1"],
      ["Advantages of serial over parallel (and how)", "Describe / State and explain", "1–4", "AS 2017 Q08.1, 2020 Q10.4, A-level 2017 Q03.4, 2022 Q02.2"],
      ["Synchronous vs asynchronous", "Explain / Describe", "1", "A-level 2019 Q09.1, 2023 Q10.2, 2024 Q03.2"],
      ["Purpose of start and stop bits", "Describe / State", "1–2", "AS 2022 Q10.1, A-level 2022 Q02.4–02.5"],
      ["Serial to peripherals, parallel inside", "Explain", "3", "A-level 2024 Q03.3 — see 4.7.1.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Serial and parallel**.", "**Synchronous and asynchronous**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Serial and parallel" },
    { fig: { w: 600, h: 190, items: (function () {
      var it = [];
      it.push(txt(150, 14, "Serial: one wire, one bit after another", { b: true, c: "accent", size: 11.5 }));
      it = it.concat(boxAt(20, 40, 60, 40, "Tx", "accent"), boxAt(220, 40, 60, 40, "Rx", "accent"));
      it.push({ line: [[80, 60], [220, 60]], c: "accent", w: 2 });
      ["1", "0", "1", "1", "0"].forEach(function (b, i) { it.push(txt(100 + i * 24, 50, b, { c: "text", b: true, size: 12 })); });
      it.push(txt(450, 14, "Parallel: several wires, bits at once", { b: true, c: "accent2", size: 11.5 }));
      it = it.concat(boxAt(320, 30, 60, 140, "Tx", "accent2"), boxAt(520, 30, 60, 140, "Rx", "accent2"));
      ["1", "0", "1", "1", "0", "0", "1", "0"].forEach(function (b, i) {
        var y = 40 + i * 17;
        it.push({ line: [[380, y], [520, y]], c: "accent2", w: 1.4 });
        it.push(txt(i === 5 ? 478 : 450, y - 6, b, { c: i === 5 ? "danger" : "text", b: true, size: 10.5 }));
      });
      it.push(txt(450, 182, "skew: one bit (red) arrives late", { c: "danger", size: 10.5 }));
      return it;
    })(), cap: "Serial sends bits one at a time down one line; parallel sends a whole group at once down several lines — and over distance the bits drift apart (skew)." } },
    { kv: [
      ["Serial", "bits are sent **one after another** along a **single wire / line**"],
      ["Parallel", "**multiple bits** are sent **simultaneously**, each down a **different wire**"]
    ] },
    { table: { head: ["Advantage of serial", "How it is achieved"], rows: [
      ["**cheaper** cabling and hardware", "needs fewer wires / less complex hardware"],
      ["**no crosstalk**", "only one transmission line, so no signal leaks between neighbouring wires"],
      ["**no data skew**", "only one bit at a time, so bits cannot arrive out of step — they arrive in the order sent"],
      ["**longer distances / higher speeds**", "skew and crosstalk get worse with distance and frequency; serial avoids both, so its single line can be clocked much faster"]
    ] } },
    { callout: { t: "miscon", h: "\"Parallel is faster, so it's better\"", body: "Parallel moves more bits per clock **over short distances** (a data bus). Over a cable of any length, skew forces it to slow down to keep bits aligned — so modern links (USB, SATA, PCIe, Ethernet) are **serial**, clocked very fast. **NE.** \"fewer wires\" alone — say what that saves (cost) or avoids (crosstalk)." } },

    { page: "Synchronous and asynchronous" },
    { fig: { w: 600, h: 150, items: (function () {
      var it = [], x0 = 30, w = 46, yH = 40, yL = 80;
      var bits = [["idle", 1], ["start", 0], ["", 1], ["", 0], ["", 0], ["", 1], ["", 0], ["", 1], ["", 1], ["", 0], ["stop", 1], ["idle", 1]];
      var pts = [];
      bits.forEach(function (b, i) { var y = b[1] ? yH : yL; pts.push([x0 + i * w, y], [x0 + (i + 1) * w, y]); });
      it.push({ poly: pts, close: false, c: "accent", w: 2.2 });
      bits.forEach(function (b, i) {
        it.push(txt(x0 + i * w + w / 2, 100, b[0] || String(b[1]), { c: b[0] === "start" ? "accent2" : b[0] === "stop" ? "good" : "text", b: !!b[0] && b[0] !== "idle", size: 10.5 }));
        if (i > 0) it.push({ line: [[x0 + i * w, 30], [x0 + i * w, 90]], c: "line", w: 0.8, dash: "2 4" });
      });
      it.push(txt(300, 130, "the start bit's falling edge starts the receiver's clock; 8 data bits; the stop bit gives time and returns the line to idle", { size: 10.5 }));
      return it;
    })(), cap: "Asynchronous framing: idle high, a start bit (0), the data bits, a stop bit (1)." } },
    { table: { head: ["", "Synchronous", "Asynchronous"], rows: [
      ["Timing", "transmitter and receiver **continuously synchronised by a common clock** (or timing sent alongside / within the data)", "**no common clock**; the receiver's clock is synchronised to the transmitter's **each time a start bit arrives**, for that one character"],
      ["Framing", "a continuous stream of data", "each character framed by a **start bit** and **stop bit(s)**"],
      ["Overhead", "low — no per-character framing bits", "high — e.g. 2 extra bits per 8 data bits (20%)"],
      ["Suits", "high-volume, continuous transfers: the data bus (4.7.1.1), networks", "irregular, low-volume data: keyboards, simple serial links"]
    ] } },
    { kv: [
      ["Start bit", "**starts the receiver's clock** ticking // brings the receiver clock **into phase** with the transmitter clock (wakes the receiver). R. \"indicates the start of transmission\"."],
      ["Stop bit", "gives the receiver **time to process / transfer** the received data and allows the **next start bit to be recognised** (the line returns to idle). R. \"indicates the end of transmission\"."]
    ] },
    { callout: { t: "warn", h: "\"Synchronised\" alone is NE.", body: "Say **by a common clock** (synchronous) or **resynchronised by each start bit** (asynchronous). And **TO.** if you say synchronous transmission is only synchronised while data is sent — it is continuous." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two reasons to prefer serial", src: "AS June 2017 · P2 Q08.1 · 4 marks",
      q: "Parallel transmission sends many bits at the same time whilst serial transmission sends one bit at a time. Describe two reasons why serial transmission might be preferred to parallel transmission.",
      steps: [
        { h: "Reason 1", m: "Parallel communication requires more wires and hardware;", mk: "1 mark" },
        { h: "Expansion", m: "so serial has a lower cost (and is easier to set up and switch);", mk: "1 mark" },
        { h: "Reason 2", m: "Parallel needs the data kept synchronised across the wires — there is a risk of data skew over long distances;", mk: "1 mark" },
        { h: "Expansion", m: "which limits parallel's transmission speed and cable length and causes errors — serial has neither problem;", mk: "1 mark", n: "Also: crosstalk between parallel wires. Only one mark per understanding point even if repeated." }
      ], result: "Cost; skew (or crosstalk)" } },
    { worked: { tag: "exam", title: "Two advantages, each explained", src: "AS June 2020 · P2 Q10.4 · 4 marks",
      q: "State two advantages of serial data transmission over parallel data transmission and explain how these are achieved.",
      steps: [
        { h: "Advantage", m: "Serial does not suffer from crosstalk;", mk: "1 mark" },
        { h: "How", m: "as there is only one transmission line;", mk: "1 mark" },
        { h: "Advantage", m: "Serial does not suffer from data skew;", mk: "1 mark" },
        { h: "How", m: "as only one bit is transmitted at a time;", mk: "1 mark", n: "Also: cheaper (fewer wires / simpler hardware); longer distances." }
      ], result: "No crosstalk; no skew" } },
    { worked: { tag: "exam", title: "Serial over a long distance", src: "A-level June 2017 · P2 Q03.4 · 2 marks",
      q: "A system sends data over a long distance using serial communication. Explain why serial communication is more appropriate in this instance than parallel communication.",
      steps: [
        { m: "Data skew might occur if parallel communication were used — bits sent together may arrive at different times — and the longer the distance the more likely skew is;", mk: "1 mark" },
        { m: "serial avoids crosstalk between wires // its cabling is cheaper, which matters more over a long distance;", mk: "1 mark", n: "NE. \"fewer wires\" without saying it lowers cost. NE. \"data corrupted\" without naming skew / crosstalk." }
      ], result: "Skew grows with distance" } },
    { worked: { tag: "exam", title: "Serial vs parallel operation", src: "A-level June 2021 · P2 Q03.3 · 2 marks",
      q: "Describe the difference between the operation of serial and parallel transmission.",
      steps: [
        { m: "Serial sends one bit at a time, one after another, whereas parallel sends multiple bits simultaneously;", mk: "1 mark", n: "R. bytes, values, packets, data for bits." },
        { m: "Serial uses a single wire / line whereas parallel uses several wires;", mk: "1 mark", n: "Both sides of each point are needed for the mark." }
      ], result: "One bit, one wire vs many at once" } },
    { worked: { tag: "exam", title: "Parallel, then one serial advantage", src: "A-level June 2022 · P2 Q02.1–02.2 · 3 marks",
      q: "(a) Describe how parallel data transmission works. (b) State one advantage of serial data transmission over parallel.",
      steps: [
        { m: "(a) Multiple bits are transmitted simultaneously;", mk: "1 mark" },
        { m: "each bit is sent down a different wire;", mk: "1 mark" },
        { m: "(b) The hardware / wiring for serial is cheaper // no crosstalk // no skew — bits arrive in order // usable over longer distances;", mk: "1 mark", n: "NE. \"cheaper\" without hardware or wiring; NE. \"more reliable\"." }
      ], result: "Many bits, many wires; cheaper wiring" } },
    { worked: { tag: "exam", title: "What is serial transmission?", src: "AS June 2025 · P2 Q13.1 · 1 mark",
      q: "State what is meant by the serial transmission of data.",
      steps: [{ m: "Data is sent along a single wire / path // bits are sent one after another;", mk: "1 mark" }], result: "One wire, one bit at a time" } },
    { worked: { tag: "exam", title: "Start and stop bits", src: "AS June 2022 · P2 Q10.1 · 2 marks",
      q: "Describe the purpose of start and stop bits in asynchronous data transfer.",
      steps: [
        { h: "Start bit", m: "Starts the receiver's clock ticking // synchronises the receiver's clock to the transmitter's;", mk: "1 mark", n: "NE. \"synchronise the two clocks\"." },
        { h: "Stop bit", m: "Allows the next start bit to be recognised // gives the receiver time to process the received data;", mk: "1 mark" }
      ], result: "Sync the clock; time + next start" } },
    { worked: { tag: "exam", title: "Start bit and stop bit (A-level)", src: "A-level June 2022 · P2 Q02.4–02.5 · 2 marks",
      q: "State the purpose of (a) the start bit and (b) the stop bit in asynchronous serial transmission.",
      steps: [
        { m: "(a) To start the receiver's clock // bring the receiver's clock into phase with the transmitter's;", mk: "1 mark", n: "R. \"indicates the start of transmission\"." },
        { m: "(b) Provides time for the receiver to process / transfer the received data // allows the next start bit to be recognised;", mk: "1 mark", n: "R. \"indicates end of transmission\"; R. \"clocks no longer need to be synchronised\"." }
      ], result: "Clock sync; recovery time" } },
    { worked: { tag: "exam", title: "Asynchronous vs synchronous", src: "A-level June 2019 · P2 Q09.1 · 1 mark",
      q: "A data communication system uses asynchronous serial communication. Explain the difference between asynchronous and synchronous communication.",
      steps: [{ m: "Asynchronous: receiver and transmitter are not synchronised by a common clock — the receiver's clock is synchronised to the transmitter's each time a start bit is received; synchronous: they are continuously synchronised by a common clock (or timing information sent alongside the data);", mk: "1 mark", n: "NE. \"receiver and transmitter are synchronised\"." }], result: "Per-character vs continuous sync" } },
    { worked: { tag: "exam", title: "What synchronous transmission is", src: "A-level June 2023 · P2 Q10.2 · 1 mark",
      q: "An alternative data communication system uses synchronous data transmission. Describe what synchronous data transmission is.",
      steps: [{ m: "Receiver and transmitter are (continuously) synchronised by a common clock // timing information is transmitted within / alongside the data;", mk: "1 mark", n: "Same answer for A-level 2024 Q03.2 (the data bus). TO. \"only synchronised when data is transmitted\"." }], result: "Common clock" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe serial / parallel", "Bits one after another on one wire vs several bits at once on several wires."],
      ["State and explain an advantage", "Advantage (cheaper / no skew / no crosstalk / longer distance) + its cause."],
      ["Explain sync vs async", "Common continuous clock vs resync by each start bit."],
      ["State the purpose of start / stop bits", "Start: sync the receiver clock. Stop: processing time + next start detectable."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "Serial wins \"CSS-L\"", body: "**C**heaper, no **S**kew, no cro**S**stalk, **L**onger distances. Start bit = \"**S**et the **S**topwatch\"; stop bit = \"**S**top to **S**ort the data\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Data\" or \"bytes\" for bits (R.).", "\"Fewer wires\" without the consequence (NE.).", "\"Synchronised\" without \"by a common clock\" (NE.).", "Start bit \"marks the start\" (R.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.1.1 the data bus is synchronous parallel; USB is synchronous serial; 4.9.1.2 baud vs bit rate; 4.5.5.3 parity bits are sent within asynchronous frames; 4.9.2.3 Wi-Fi is serial over radio." } }
  ],
  flashcards: [
    ["Serial transmission?", "Bits sent one after another along a single wire."],
    ["Parallel transmission?", "Several bits sent simultaneously, each on its own wire."],
    ["Four advantages of serial?", "Cheaper; no crosstalk; no data skew; longer distances (and higher clock rates)."],
    ["What is data skew?", "Bits sent simultaneously on parallel wires arrive at different times."],
    ["What is crosstalk?", "Interference between signals on neighbouring wires."],
    ["Synchronous transmission?", "Transmitter and receiver continuously synchronised by a common clock."],
    ["Asynchronous transmission?", "No common clock; the receiver resynchronises at each start bit."],
    ["Purpose of the start bit?", "Starts the receiver's clock / brings it into phase with the transmitter's."],
    ["Purpose of the stop bit?", "Gives the receiver time to process the data and lets the next start bit be recognised."],
    ["Why is the internal data bus parallel?", "Short distance, fixed positions, huge volume — many bits at once."]
  ],
  quiz: [
    { q: "Data skew is a problem of", opts: ["parallel transmission", "serial transmission", "asynchronous framing", "Wi-Fi only"], ans: 0, why: "Bits drift apart on separate wires." },
    { q: "The start bit's purpose is to", opts: ["synchronise the receiver's clock", "mark the end of data", "check parity", "carry the address"], ans: 0, why: "R. 'indicates start'." },
    { q: "Synchronous transmission uses", opts: ["a common clock", "start and stop bits per character", "no clock at all", "parallel wires only"], ans: 0, why: "Continuous sync." },
    { q: "Serial is preferred over long distances because", opts: ["no skew or crosstalk", "it sends more bits at once", "it needs more wires", "it has no protocol"], ans: 0, why: "Those worsen with distance." }
  ]
};

/* =====================================================================
   4.9.1.2  Communication basics
   ===================================================================== */
C["compsci:4.9.1.2"] = {
  notes: [
    { h: "Communication basics — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.1.2)", body: ["Define **baud rate, bit rate, bandwidth, latency, protocol**.", "Differentiate between baud rate and bit rate.", "Understand the relationship between bit rate and bandwidth. Bit rate can exceed baud rate if more than one bit is encoded in each signal change.", "Bit rate is **directly proportional** to bandwidth."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Define bit rate / latency / baud rate / bandwidth / protocol", "Define", "1–2", "AS 2016 Q07.5, 2017 Q08.2, 2019 Q09.2–09.4, 2022 Q10.2–10.3"],
      ["Baud vs bit rate; how bit rate exceeds baud", "Describe / Explain", "1–2", "AS 2020 Q10.2, 2024 Q11.1, 2025 Q13.2"],
      ["Bits per signal; bit rate from baud", "How many / What is", "1", "A-level 2017 Q03.1–03.2, 2021 Q03.1"],
      ["Bandwidth vs bit rate graph / relationship", "Shade / Describe", "1", "A-level 2017 Q03.3, 2021 Q03.2, 2023 Q10.4"],
      ["Which statement is false", "Shade", "1", "A-level 2022 Q02.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The five definitions**.", "**Baud vs bit rate** — the arithmetic.", "**Bandwidth and bit rate**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The five definitions" },
    { kv: [
      ["Baud rate", "the **number of signal changes per second** (symbols per second) on the medium"],
      ["Bit rate", "the **number of bits transmitted per second** (bps)"],
      ["Bandwidth", "the **range of frequencies** a medium can transmit (without significant loss of signal strength), in Hz"],
      ["Latency", "the **time delay** between an action being initiated and its effect being noticed — e.g. the time for data to reach its destination"],
      ["Protocol", "a **set of rules** that govern communication between devices (format, timing, error handling)"]
    ] },
    { callout: { t: "miscon", h: "Bandwidth is not \"speed\"", body: "In everyday speech \"bandwidth\" means data rate. At A-level it is a **range of frequencies** — which *determines* the maximum bit rate. And latency is **delay**, not a rate (A-level 2022: \"latency is the rate at which signals change\" is the FALSE statement — that is baud rate)." } },
    { callout: { t: "miscon", h: "Side by side: latency vs bandwidth", body: "A lorry full of hard disks has huge \"bandwidth\" (bits per trip) but awful latency (hours). A ping over fibre has tiny latency. Games need low latency; video streaming needs high bit rate." } },

    { page: "Baud vs bit rate" },
    { callout: { t: "formula", h: "The relationship", body: "With $L$ distinct signal levels, each signal change carries $\\log_2 L$ bits, so **bit rate = baud rate × bits per signal**: $L = 8$ → 3 bits; $L = 4$ → 2 bits; $L = 2$ → 1 bit (bit rate = baud rate)." } },
    { fig: { w: 600, h: 170, items: (function () {
      var it = [], x0 = 40, w = 90, levels = [0, 2, 3, 1, 2, 0], ys = [130, 100, 70, 40];
      var pts = [];
      levels.forEach(function (lv, i) { pts.push([x0 + i * w, ys[lv]], [x0 + (i + 1) * w, ys[lv]]); });
      it.push({ poly: pts, close: false, c: "accent", w: 2.4 });
      ["00", "01", "10", "11"].forEach(function (lab, i) { it.push(txt(26, ys[i], lab, { pos: "w", off: 0, c: "muted" })); });
      levels.forEach(function (lv, i) { it.push(txt(x0 + i * w + w / 2, 155, ["00", "01", "10", "11"][lv], { b: true, c: "accent2", size: 11 })); });
      it.push(txt(330, 14, "4 levels → 2 bits per signal change: 6 symbols carry 12 bits", { size: 11, c: "text2" }));
      return it;
    })(), cap: "Four voltage levels: each symbol encodes two bits, so the bit rate is twice the baud rate." } },
    { table: { head: ["Signal levels", "Bits per symbol", "At 500 baud"], rows: [["2", "1", "500 bps"], ["4", "2", "1 000 bps"], ["8", "3", "**1 500 bps**"], ["16", "4", "2 000 bps"]] } },

    { page: "Bandwidth and bit rate" },
    { fig: { x: [0, 10], y: [0, 10], w: 420, h: 220, axes: { x: "bandwidth", y: "bit rate", xt: [], yt: [] }, items: [
      { fn: "0.9*x", from: 0, to: 10, c: "accent", w: 2.4, label: "directly proportional", at: 6.5 }
    ], cap: "Bit rate is directly proportional to bandwidth: a straight line through the origin." } },
    { ul: [
      "A wider band of frequencies lets the signal change faster and carry more levels distinguishably — so the achievable **bit rate rises in proportion**.",
      "Doubling the bandwidth (ideally) doubles the bit rate.",
      "In the exam graph, pick the **straight line through the origin** — not a curve that levels off, not a line with an intercept."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Define bit rate and latency", src: "AS June 2017 · P2 Q08.2 · 2 marks",
      q: "In the context of networking, define: bit rate; latency.",
      steps: [
        { h: "Bit rate", m: "The number of bits that can be transmitted in one second;", mk: "1 mark", n: "R. unexplained examples." },
        { h: "Latency", m: "The delay between an action being initiated and its effect being noticed // the time taken for transmitted data to arrive;", mk: "1 mark", n: "NE. \"delay in transmission\", \"transmission time\"." }
      ], result: "Bits per second; delay" } },
    { worked: { tag: "exam", title: "Define baud rate and bandwidth", src: "AS June 2019 · P2 Q09.3–09.4 · 2 marks",
      q: "Define (a) baud rate; (b) bandwidth.",
      steps: [
        { m: "(a) The number of signal changes in a second;", mk: "1 mark", n: "A. voltage changes / symbols." },
        { m: "(b) The range of frequencies that can be transmitted across a network connection;", mk: "1 mark" }
      ], result: "Signal changes/s; frequency range" } },
    { worked: { tag: "exam", title: "Define protocol", src: "AS June 2016 · P2 Q07.5 · 2 marks",
      q: "WPA2 is an example of a protocol. Explain what is meant by the term protocol.",
      steps: [{ m: "A set of rules;", mk: "1 mark" }, { m: "that allow two devices to communicate;", mk: "1 mark", n: "AS 2019 Q09.2 and 2022 Q10.2 give 1 mark for \"a set of rules (governing communication)\". R. \"instructions\"." }], result: "Rules for communication" } },
    { worked: { tag: "exam", title: "Define latency", src: "AS June 2022 · P2 Q10.3 · 1 mark",
      q: "Users of a computer network will experience latency. Define the term latency.",
      steps: [{ m: "The delay between an action being initiated and its effect being observable // the time taken for data to get to its destination (and back);", mk: "1 mark" }], result: "Delay" } },
    { worked: { tag: "exam", title: "Bit rate above baud rate", src: "AS June 2020 · P2 Q10.2 · 1 mark",
      q: "Explain how it is possible for the bit rate of a communications channel to be higher than its baud rate.",
      steps: [{ m: "If more than one bit is encoded in each signal change;", mk: "1 mark", n: "AS 2025 Q13.2: \"by sending more than one bit per signal change\"." }], result: "Several bits per symbol" } },
    { worked: { tag: "exam", title: "Baud vs bit rate", src: "AS June 2024 · P2 Q11.1 · 2 marks",
      q: "Describe the difference between baud rate and bit rate.",
      steps: [{ m: "Bit rate is the number of bits transmitted per second;", mk: "1 mark" }, { m: "Baud rate is the number of times a signal can change per second on the medium;", mk: "1 mark" }], result: "Bits/s vs signal changes/s" } },
    { worked: { tag: "exam", title: "Eight voltage levels at 500 baud", src: "A-level June 2017 · P2 Q03.1–03.3 · 3 marks",
      q: "A system uses eight different voltage levels, each encoding a group of bits. (a) How many bits can be in each group? (b) The baud rate is 500 baud — what is the bit rate? (c) Which line shows the correct relationship between bandwidth and bit rate?",
      steps: [
        { m: "(a) $2^3 = 8$ → **3** bits;", mk: "1 mark" },
        { m: "(b) 3 × 500 = **1500** bits per second;", mk: "1 mark", n: "A. (your answer to (a)) × 500." },
        { m: "(c) **B** — the straight line through the origin (directly proportional);", mk: "1 mark" }
      ], result: "3 bits; 1500 bps; proportional" } },
    { worked: { tag: "exam", title: "Four signals, two bits each", src: "A-level June 2021 · P2 Q03.1–03.2 · 2 marks",
      q: "A system can transmit four different signals, each representing two bits. (a) Describe the exact relationship between the bit rate and the baud rate. (b) Describe the relationship between the bit rate and the bandwidth of the medium.",
      steps: [{ m: "(a) The bit rate is **double** the baud rate (2:1);", mk: "1 mark" }, { m: "(b) They are directly proportional — the greater the bandwidth, the higher the bit rate;", mk: "1 mark", n: "NE. \"bandwidth constrains bit rate\"." }], result: "×2; proportional" } },
    { worked: { tag: "exam", title: "Which statement is false?", src: "A-level June 2022 · P2 Q02.3 · 1 mark",
      q: "Which is false? A The bit rate can be higher than the baud rate. B Latency is the rate at which signals on a wire can change. C Bandwidth is the range of frequencies a medium can transmit without significant loss. D The greater the bandwidth the higher the achievable bit rate.",
      steps: [{ m: "**B** — that describes baud rate; latency is a delay;", mk: "1 mark" }], result: "B" } },
    { worked: { tag: "exam", title: "Pick the bandwidth graph", src: "A-level June 2023 · P2 Q10.4 · 1 mark",
      q: "Which line on the graph (A–D) shows the correct relationship between the bandwidth and the bit rate of a communications medium?",
      steps: [{ m: "**Line A** — the straight line through the origin (bit rate directly proportional to bandwidth);", mk: "1 mark" }], result: "The proportional line" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Define", "Exact phrase: bits per second; signal changes per second; range of frequencies; delay; set of rules."],
      ["Calculate bit rate", "bits per symbol = log₂(levels); × baud."],
      ["Describe the relationship", "\"Directly proportional\" — the straight line through the origin."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Baud = Blips, Bit = Bits, Band = Breadth\"", body: "**Baud** counts signal **blips** per second; **bit** rate counts **bits**; **band**width is the **breadth** of frequencies; **l**atency = **l**ag; **p**rotocol = **p**olicy (set of rules)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Bandwidth as \"speed\" or \"amount of data\".", "Latency as a rate (it is a delay).", "Forgetting log₂: 8 levels is 3 bits, not 8.", "\"Instructions\" for protocol (R.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.1–4.5.3 powers of 2 (levels ↔ bits); 4.9.1.1 serial transmission; 4.9.4.1 the TCP/IP protocols; 4.7.3.7 data bus width is the parallel analogue of bit rate." } }
  ],
  flashcards: [
    ["Baud rate?", "Number of signal changes per second."],
    ["Bit rate?", "Number of bits transmitted per second."],
    ["Bandwidth?", "The range of frequencies a medium can transmit."],
    ["Latency?", "The time delay between an action and its effect / data arriving."],
    ["Protocol?", "A set of rules governing communication between devices."],
    ["How can bit rate exceed baud rate?", "By encoding more than one bit per signal change."],
    ["8 signal levels at 500 baud → bit rate?", "3 bits per symbol → 1500 bps."],
    ["Relationship between bandwidth and bit rate?", "Directly proportional."],
    ["4 signals, 2 bits each → bit rate vs baud?", "Bit rate = 2 × baud rate."]
  ],
  quiz: [
    { q: "16 signal levels carry how many bits per symbol?", opts: ["4", "16", "8", "2"], ans: 0, why: "log₂16." },
    { q: "Bit rate vs bandwidth is", opts: ["directly proportional", "inversely proportional", "unrelated", "exponential"], ans: 0, why: "Spec statement." },
    { q: "Latency is", opts: ["a time delay", "signal changes per second", "a frequency range", "a set of rules"], ans: 0, why: "Delay." },
    { q: "Baud rate counts", opts: ["signal changes per second", "bits per second", "packets per second", "frequencies"], ans: 0, why: "Symbols/s." }
  ]
};

/* =====================================================================
   4.9.2.1  Network topology
   ===================================================================== */
C["compsci:4.9.2.1"] = {
  notes: [
    { h: "Network topology — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.2.1)", body: ["Understand **physical star** topology and **logical bus** topology.", "Differentiate between them.", "Explain their operation. A network physically wired as a star can behave logically as a bus by using a **bus protocol** and appropriate **physical switching**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Physical vs logical topology", "Describe / Explain", "2", "AS 2018 Q08.1, A-level 2017 Q09.2"],
      ["Operation of a physical star", "Explain", "2", "AS 2018 Q08.2, 2023 Q13.1"],
      ["Operation of a logical bus", "Explain", "3", "AS 2020 Q10.1"],
      ["How a physical star behaves as a logical bus", "Explain", "2", "AS 2022 Q10.4, 2025 Q13.3"],
      ["Name the topology in a diagram", "State", "1", "A-level 2021 Q11.4"],
      ["Why fewer devices improve performance", "Explain", "2", "AS 2016 Q07.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Physical and logical**.", "**Star and bus in operation**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Physical and logical" },
    { kv: [
      ["Physical topology", "the **layout of the cabling / connections** between the devices — how the network is wired"],
      ["Logical topology", "**how the data flows** around the network — the architecture of its communication mechanism (set by the protocol)"]
    ] },
    { fig: { w: 600, h: 200, items: (function () {
      var it = [];
      it.push(txt(150, 14, "Physical star", { b: true, c: "accent", size: 12 }));
      it = it.concat(boxAt(120, 85, 60, 30, "Switch", "accent2"));
      [[60, 50], [240, 50], [60, 150], [240, 150], [150, 175]].forEach(function (p, i) {
        it.push({ line: [[150, 100], p], c: "accent", w: 1.6 });
        it = it.concat(node(p[0], p[1], "PC" + (i + 1)));
      });
      it.push(txt(450, 14, "Logical bus", { b: true, c: "accent2", size: 12 }));
      it.push({ line: [[330, 110], [570, 110]], c: "accent2", w: 3 });
      [360, 410, 460, 510, 560].forEach(function (x, i) { it.push({ line: [[x, 110], [x, 80]], c: "accent2", w: 1.4 }); it = it.concat(node(x, 66, "PC" + (i + 1), "accent2")); });
      it.push(txt(450, 140, "one shared medium: every node sees every frame,", { size: 10.5 }), txt(450, 156, "only one can transmit at a time", { size: 10.5 }));
      return it;
    })(), cap: "The same five computers: wired as a star (left) but, with a bus protocol, communicating as if on one shared cable (right)." } },
    { callout: { t: "miscon", h: "\"Logical topology = how it is connected\"", body: "**NE.** \"how the devices are connected\" for physical, and **NE.** \"how a network operates\" for logical. Say **layout of the cabling** vs **how the data flows**. Listing \"bus, star\" is NE. too." } },

    { page: "Star and bus in operation" },
    { h: "Physical star" },
    { ul: [
      "Every device is **directly connected to a central node** — a **switch** (or hub).",
      "Every device **sends its data via the central node**.",
      "A **switch** sends each frame **only to the intended recipient** (by MAC address); a **hub** sends every frame to **every** device.",
      "A cable fault isolates only one device; the central switch is a single point of failure."
    ] },
    { h: "Logical bus" },
    { ul: [
      "A node **broadcasts** its data onto the **shared transmission medium** (the bus).",
      "**All** nodes receive / read the data; each **examines** it to see whether it is the intended recipient.",
      "**Only one node can transmit successfully at a time** — a bus access protocol (e.g. CSMA/CD in classic Ethernet) handles collisions."
    ] },
    { h: "A star behaving as a bus" },
    { ul: [
      "The devices use a **bus transmission protocol** (e.g. CSMA/CD).",
      "With appropriate **physical switching**: a hub repeats every frame to all devices (a true shared bus), or a switch creates **temporary buses between two nodes** for each conversation."
    ] },
    { callout: { t: "warn", h: "Server or router as the centre (DPT)", body: "The central node of a star is a **switch** (A. hub). Calling it a server or router is a dependent penalty (AS 2023)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Physical vs logical", src: "AS June 2018 · P2 Q08.1 · 2 marks",
      q: "A network with a physical star topology can have a logical bus topology. Describe the difference between a physical and a logical topology.",
      steps: [
        { h: "Physical", m: "The (physical) layout / arrangement of the cabling / connections between the devices;", mk: "1 mark", n: "NE. \"how the devices are connected\"; NE. \"setup\"." },
        { h: "Logical", m: "How the data / packets flow around the network // the architecture of its communication mechanism;", mk: "1 mark", n: "A. the type of protocol used. NE. \"how a network operates\". (A-level 2017 Q09.2: same marks.)" }
      ], result: "Cabling layout vs data flow" } },
    { worked: { tag: "exam", title: "Physical star in operation", src: "AS June 2023 · P2 Q13.1 · 2 marks",
      q: "Explain the operation of a physical star network topology.",
      steps: [
        { m: "Every device is directly connected to a central switch (A. hub) and sends its data via that switch;", mk: "1 mark" },
        { m: "The switch sends packets of data to the intended recipient only // a hub sends every packet to every device;", mk: "1 mark", n: "DPT. server / router for switch. (AS 2018 Q08.2: same marks.)" }
      ], result: "Central switch forwards" } },
    { worked: { tag: "exam", title: "Logical bus in operation", src: "AS June 2020 · P2 Q10.1 · 3 marks",
      q: "Explain the operation of a logical bus network topology.",
      steps: [
        { m: "A node broadcasts data to the entire network;", mk: "1 mark" },
        { m: "all nodes on the network receive / read the data, and each examines it to check whether it is the intended recipient;", mk: "1 mark" },
        { m: "only one node can transmit successfully at a time — the nodes share one transmission medium;", mk: "1 mark", n: "A detailed CSMA/CD description (not required) can also score: listen, wait while busy, transmit, detect collision, jam, random back-off." }
      ], result: "Broadcast, all read, one at a time" } },
    { worked: { tag: "exam", title: "Star behaving as a bus", src: "AS June 2025 · P2 Q13.3 · 2 marks",
      q: "A network physically wired in a star topology can behave logically as a bus network. Explain how this is possible.",
      steps: [
        { m: "The network uses a bus transmission protocol (e.g. CSMA/CD);", mk: "1 mark" },
        { m: "with appropriate physical switching — the switch creates temporary buses between two nodes (or a hub transmits data to all devices);", mk: "1 mark", n: "AS 2022 Q10.4: identical." }
      ], result: "Bus protocol + switching" } },
    { worked: { tag: "exam", title: "Name the topology", src: "A-level June 2021 · P2 Q11.4 · 1 mark",
      q: "In the network diagram, the devices of subnet 192.168.64.0 are each connected by their own cable to one switch. State the name of the physical topology used in that subnet.",
      steps: [{ m: "**Star**;", mk: "1 mark" }], result: "Star" } },
    { worked: { tag: "exam", title: "Fewer devices, better performance", src: "AS June 2016 · P2 Q07.3 · 2 marks",
      q: "A school has a wireless network with multiple access points. Explain why preventing students from using their own mobile devices on it is likely to improve the performance of the school network.",
      steps: [
        { m: "A network has limited bandwidth, so fewer devices leaves more bandwidth for the others // decreases network traffic;", mk: "1 mark" },
        { m: "fewer devices reduces the likelihood of two devices transmitting simultaneously / transmissions colliding;", mk: "1 mark" }
      ], result: "More bandwidth each; fewer collisions" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the difference (topologies)", "Physical = cabling layout; logical = how data flows."],
      ["Explain the operation (star)", "Every device on a central switch; switch forwards to the recipient only."],
      ["Explain the operation (bus)", "Broadcast; everyone reads and checks; one transmitter at a time."],
      ["Explain how (star as bus)", "Bus protocol + switching."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Physical = Plumbing, Logical = Lorries\"", body: "Physical topology is the pipes (cables); logical is how the traffic actually drives. Star → \"**S**witch in the **S**entre\"; bus → \"**B**roadcast, everyone **B**ins what isn't theirs\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Server or router at the centre of a star (DPT).", "\"How it is connected\" for physical (NE.).", "Forgetting that only one node transmits at a time on a bus."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.2.3 Wi-Fi shares the medium like a bus — so it needs CSMA/CA; 4.9.4.1 MAC addresses let a switch forward; 4.9.2.2 network types; 4.9.4.4 subnets drawn as stars." } }
  ],
  flashcards: [
    ["What does a switch use to forward frames?", "The destination MAC address."],
    ["Physical topology?", "The layout of the cabling/connections."],
    ["Logical topology?", "How data flows around the network."],
    ["Physical star?", "Every device connected to a central switch (or hub), sending data through it."],
    ["Switch vs hub?", "Switch forwards a frame to the recipient only; hub sends it to every device."],
    ["Logical bus?", "Data broadcast on a shared medium; all nodes read it and check the address; one transmitter at a time."],
    ["How can a physical star act as a logical bus?", "A bus protocol (e.g. CSMA/CD) plus switching/hub."],
    ["Why do fewer devices improve performance?", "More bandwidth each and fewer collisions."]
  ],
  quiz: [
    { q: "The centre of a star network is a", opts: ["switch", "server", "router", "modem"], ans: 0, why: "DPT for server/router." },
    { q: "Logical topology describes", opts: ["how data flows", "the cable layout", "the IP scheme", "the number of devices"], ans: 0, why: "Definition." },
    { q: "On a logical bus,", opts: ["only one node transmits at a time", "every node has its own link", "no protocol is needed", "data goes to the recipient only"], ans: 0, why: "Shared medium." },
    { q: "A hub", opts: ["repeats every frame to every device", "forwards by IP address", "routes between networks", "filters by port"], ans: 0, why: "No addressing." }
  ]
};

/* =====================================================================
   4.9.2.2  Types of networking between hosts
   ===================================================================== */
C["compsci:4.9.2.2"] = {
  notes: [
    { h: "Peer-to-peer and client-server — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.2.2)", body: ["Explain **peer-to-peer** and **client-server** networking and describe situations where each might be used. In peer-to-peer each computer has equal status.", "In client-server most computers are clients and one or more are servers — clients request services, servers provide them."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How client-server operates", "Explain", "2", "AS 2023 Q13.2"],
      ["Differences / compare the two", "Explain / Compare", "3–4", "A-level 2017 Q09.3, 2022 Q08.1"],
      ["Why peer-to-peer suits a scenario", "Explain / State", "2–3", "AS 2019 Q09.1, 2024 Q11.2, A-level 2022 Q08.2"],
      ["Why client-server suits a scenario", "Explain", "3–6", "AS 2018 Q08.3 (6, levels), A-level 2025 Q05"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The two models**.", "**Choosing**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The two models" },
    { fig: { w: 600, h: 190, items: (function () {
      var it = [];
      it.push(txt(150, 14, "Client-server", { b: true, c: "accent", size: 12 }));
      it = it.concat(boxAt(110, 80, 80, 40, "Server", "accent2", "files, logins"));
      [[50, 40], [250, 40], [50, 160], [250, 160]].forEach(function (p, i) {
        it = it.concat(arrow(p[0], p[1], 150 + (p[0] < 150 ? -40 : 40), 100 + (p[1] < 100 ? -20 : 20), i === 0 ? "request" : null, { w: 1.4, dx: 30, dy: 2 }));
        it = it.concat(node(p[0], p[1], "C" + (i + 1)));
      });
      it.push(txt(450, 14, "Peer-to-peer", { b: true, c: "accent2", size: 12 }));
      var ps = [[380, 50], [520, 50], [560, 130], [450, 170], [340, 130]];
      ps.forEach(function (a, i) { ps.forEach(function (b, j) { if (j > i) it.push({ line: [a, b], c: "line", w: 1 }); }); });
      ps.forEach(function (p, i) { it = it.concat(node(p[0], p[1], "P" + (i + 1), "accent2")); });
      return it;
    })(), cap: "Client-server: clients request, the server provides. Peer-to-peer: every peer can both request and provide." } },
    { table: { head: ["", "Peer-to-peer", "Client-server"], rows: [
      ["Status", "every computer **equal**; each can act as client and server", "one or more computers **nominated as servers**, the rest are clients"],
      ["Resources", "stored on and shared from **any** computer", "stored on the **server(s)**; clients access them"],
      ["Security", "no central management — each user manages their own", "**centralised** login, access rights, administration"],
      ["Availability", "a resource may be on a peer that is turned off — but it can be shared from several peers (no single point of failure)", "server always on; but if it fails, its services stop"],
      ["Hardware", "general-purpose PCs", "servers optimised for providing services"],
      ["Backup / updates", "each machine separately", "**central** backup and software installation"],
      ["Cost / expertise", "cheap, easy to set up — no server", "server hardware and expert configuration needed"],
      ["Scale", "scales with peers (no central bottleneck) — e.g. BitTorrent", "scales by adding servers"]
    ] } },

    { page: "Choosing" },
    { table: { head: ["Scenario", "Choose", "Because"], rows: [
      ["three students sharing files and games", "peer-to-peer", "few users who trust each other; no confidential data; no cost or expertise for a server"],
      ["a household of laptops and phones", "peer-to-peer", "small number of devices; each user chooses what to share; no server to buy or configure"],
      ["thousands of photographers sharing photos free", "peer-to-peer", "scales without a high-performance server; still works if a peer fails; users control access"],
      ["a bank", "client-server", "confidential customer data needs centralised security, backups and audit; servers always available"],
      ["a school", "client-server", "many users who cannot all be trusted; different access rights for staff and students; files available from any device; central backup and software updates"]
    ] } },
    { callout: { t: "warn", h: "Generic advantages score less", body: "\"Cheaper\" or \"easier to set up\" alone are **R.** — say why: *no server hardware to buy*; *no expertise needed to configure a server*. And link each point to the scenario's needs (the bank's customer data; the school's untrusted students)." } },
    { callout: { t: "miscon", h: "Client-server ≠ \"everything happens on the server\"", body: "**R.** responses suggesting everything is done on the server — clients run their own software and process locally; they request **resources and services**. (Running everything on the server is thin-client computing, 4.9.4.11.)" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "How client-server operates", src: "AS June 2023 · P2 Q13.2 · 2 marks",
      q: "Explain how client-server networking operates.",
      steps: [{ m: "Clients request services from a server;", mk: "1 mark" }, { m: "the server responds to client requests by providing the resources / services (stored on the server);", mk: "1 mark" }], result: "Request → respond" } },
    { worked: { tag: "exam", title: "Explain the differences", src: "A-level June 2017 · P2 Q09.3 · 4 marks",
      q: "Explain the differences between client-server and peer-to-peer networking.",
      steps: [
        { h: "Client-server", m: "Resources are stored on the server, and clients access them — the server provides them in response to client requests;", mk: "1 mark" },
        { h: "Client-server", m: "security and administration are centralised (central login) — but configuration needs greater expertise;", mk: "1 mark" },
        { h: "Peer-to-peer", m: "Resources are stored on each individual computer, and any peer can access resources from any other;", mk: "1 mark" },
        { h: "Peer-to-peer", m: "each computer has equal status and can act as both client and server; there is no dependence on a server, but security management is harder;", mk: "1 mark", n: "Max 2 each side. R. points about how the computers are physically connected." }
      ], result: "Central vs distributed" } },
    { worked: { tag: "exam", title: "Compare how they work", src: "A-level June 2022 · P2 Q08.1 · 3 marks",
      q: "A student is setting up a home network of laptops, desktops and mobile devices. Compare how peer-to-peer networking and client-server networking work.",
      steps: [
        { m: "In peer-to-peer each computer has equal status and can act as client and server, whereas in client-server one or more computers are nominated as servers and the rest are clients;", mk: "1 mark" },
        { m: "Peer-to-peer resources are stored on and shared from any computer, whereas client-server resources are stored on the server(s);", mk: "1 mark" },
        { m: "Peer-to-peer has no centralised security (each user manages it), whereas client-server centralises it — you must log in to access the server;", mk: "1 mark", n: "One mark per comparison row; one side suffices; both sides do not earn two." }
      ], result: "Status, storage, security" } },
    { worked: { tag: "exam", title: "Peer-to-peer for the house", src: "A-level June 2022 · P2 Q08.2 · 3 marks",
      q: "Explain why a peer-to-peer system would be most appropriate to use in the house.",
      steps: [
        { m: "There is a small number of users / devices;", mk: "1 mark", n: "NE. \"small network\"." },
        { m: "the users are likely to trust each other — no confidential data requiring complex security;", mk: "1 mark" },
        { m: "it avoids the cost of buying a server, and no expertise is needed to set up and manage one;", mk: "1 mark", n: "R. \"cheaper\" / \"easier\" without explanation." }
      ], result: "Small, trusted, no server cost" } },
    { worked: { tag: "exam", title: "Peer-to-peer for students", src: "AS June 2019 · P2 Q09.1 · 2 marks",
      q: "Three students sharing a house have set up a peer-to-peer network for sharing files and multi-user games. Explain why it might be a better choice than client-server.",
      steps: [{ m: "A peer-to-peer network does not need a central server — so it is cheaper / easier to set up and maintain;", mk: "1 mark" }, { m: "the students are unlikely to need the extra security or services a client-server network provides;", mk: "1 mark" }], result: "No server; no need for its features" } },
    { worked: { tag: "exam", title: "Peer-to-peer for thousands of photographers", src: "AS June 2024 · P2 Q11.2 · 2 marks",
      q: "A photographer wants a large file-sharing network so thousands of photographers can share photos free. State two reasons to choose peer-to-peer rather than client-server.",
      steps: [{ m: "It provides scalability without the need for a high-performance server;", mk: "1 mark" }, { m: "there is no reliance on a central server — the service remains available if one peer fails // users control who accesses their own photos;", mk: "1 mark" }], result: "Scales; no single point of failure" } },
    { worked: { tag: "exam", title: "Client-server for a school", src: "A-level June 2025 · P2 Q05 · 3 marks",
      q: "Explain why a client-server network would be more suitable for use in a school than a peer-to-peer network.",
      steps: [
        { m: "There are a large number of users / devices, not all of whom can be trusted, and confidential data (e.g. student records) will be stored;", mk: "1 mark" },
        { m: "complex access rights are needed — staff and students need different privileges, and security can be managed centrally;", mk: "1 mark" },
        { m: "files are stored centrally, so they are available from any device at any time and can be backed up centrally;", mk: "1 mark", n: "Also: servers optimised; central software updates. NE. \"easier to back up\"; NE. \"stop users accessing others' files\"." }
      ], result: "Scale, trust, rights, central storage" } },
    { worked: { tag: "exam", title: "Client-server for a bank (6 marks)", src: "AS June 2018 · P2 Q08.3 · 6 marks",
      q: "A new bank is setting up an internal network. With reference to the bank's needs and the properties of the two types of networking, explain why the bank should implement client-server rather than peer-to-peer.",
      steps: [
        { h: "Point + expansion", m: "Servers are accessible at all times, whereas peers may be switched off — so customer data would not always be available to staff who need it.", mk: "indicative" },
        { h: "Point + expansion", m: "Backups are centralised, saving time and avoiding users forgetting to back up — ensuring customers' data is safe.", mk: "indicative" },
        { h: "Point + expansion", m: "Security is centralised: anti-virus, firewalls and encryption are kept up to date and correctly configured — maximum security for customer data.", mk: "indicative" },
        { h: "Point + expansion", m: "Shared services (printers, email) are managed centrally, which is cost-effective and gives better tracking for audit.", mk: "5–6 marks", n: "5–6: three points with two expansions, analysed against the bank's needs; 3–4: two points, one expansion; 1–2: one point." }
      ], result: "Availability, backup, security, audit" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain how (client-server)", "Clients request; server provides resources stored on it."],
      ["Compare / explain differences", "Row-by-row contrast: status, storage, security, dependence."],
      ["Explain why (scenario)", "Each property linked to the scenario's size, trust, data and budget."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"P2P = Pals; C/S = Corporation\"", body: "Few trusting pals, no budget → peer-to-peer. Many users, secrets, rules, audits → client-server. Check **S**ize, **T**rust, **D**ata, **M**oney (\"STDM\")." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Cheaper / easier\" with no reason (R.).", "Describing physical connections instead of roles (R.).", "Saying everything runs on the server (R.).", "\"User\" for \"computer\" when describing equal status (R.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.10 the client-server model, REST and WebSockets; 4.9.4.11 thin vs thick clients; 4.9.3.2 central security (firewalls); 4.10 a database server; 4.8.1 data held centrally raises privacy duties." } }
  ],
  flashcards: [
    ["What is a server?", "A computer that provides services/resources to clients on request."],
    ["Peer-to-peer network?", "Every computer has equal status; each can act as client and server; resources shared from any computer."],
    ["Client-server network?", "Servers provide services/resources; clients request them."],
    ["Two advantages of client-server?", "Centralised security and administration; central storage and backup; always available."],
    ["Two advantages of peer-to-peer?", "No server cost or expertise; no single point of failure; scales with peers."],
    ["When to choose peer-to-peer?", "Few, trusting users with no confidential data and no budget for a server."],
    ["When to choose client-server?", "Many users, confidential data, different access rights (school, bank)."],
    ["A disadvantage of peer-to-peer availability?", "A resource is unavailable if the peer holding it is turned off."]
  ],
  quiz: [
    { q: "In peer-to-peer networking", opts: ["each computer has equal status", "one server holds all files", "logins are central", "clients cannot share"], ans: 0, why: "Definition." },
    { q: "A school should use client-server because", opts: ["it needs central access rights for untrusted users", "it is cheaper", "it needs no server", "peers are faster"], ans: 0, why: "Security and scale." },
    { q: "\"Peer-to-peer is cheaper\" alone scores", opts: ["R. — needs a reason", "1 mark", "2 marks", "full marks"], ans: 0, why: "Say: no server to buy." },
    { q: "BitTorrent-style sharing is", opts: ["peer-to-peer", "client-server", "thin-client", "a logical bus"], ans: 0, why: "Peers share pieces." }
  ]
};

/* =====================================================================
   4.9.2.3  Wireless networking
   ===================================================================== */
C["compsci:4.9.2.3"] = {
  notes: [
    { h: "Wireless networking — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.2.3)", body: ["Explain the **purpose of Wi-Fi** (a wireless LAN based on international standards)", "The components (**wireless network adapter, wireless access point**)", "How wireless networks are **secured** (WPA/WPA2 encryption, SSID broadcast disabled, MAC address allow list)", "The protocol **CSMA/CA** with and without **RTS/CTS**.", "The purpose of the **SSID**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Hardware each device needs", "What", "1", "AS 2016 Q07.1"],
      ["SSID: role / purpose; disabling its broadcast", "Explain", "1–2", "AS 2016 Q07.4, 2017 Q08.3, 2023 Q12.1, 2024 Q11.3–11.4, 2025 Q13.4"],
      ["MAC allow list; WPA2; all three measures", "Explain / Describe / Discuss", "2–3", "AS 2016 Q07.2, 2017 Q08.4, 2019 Q09.5, 2023 Q12.2–12.3, A-level 2018 Q13.1"],
      ["CSMA/CA with RTS/CTS", "Explain", "6–8", "AS 2019 Q09.6 (+ majority voting), A-level 2018 Q13.2, 2021 Q11.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Wi-Fi and its components**.", "**Securing a wireless network**.", "**CSMA/CA and RTS/CTS**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Wi-Fi and its components" },
    { kv: [
      ["Wi-Fi", "a **wireless local area network** based on **international standards** (IEEE 802.11) — it lets devices connect to a network without cables"],
      ["Wireless network adapter", "the hardware (card / dongle / NIC) in each device that sends and receives radio signals"],
      ["Wireless access point (WAP)", "the device that connects wireless devices to the (wired) network and to each other"],
      ["SSID", "**Service Set Identifier** — the (locally unique) **name / identifier** of a wireless network; a device must use the same SSID as the access point to join"]
    ] },

    { page: "Securing a wireless network" },
    { table: { head: ["Measure", "How it works", "What it achieves", "Limit"], rows: [
      ["**WPA2 / WPA3 encryption**", "strong encryption of all transmitted data with a key", "intercepted data cannot be understood by anyone without the key", "a weak passphrase can be cracked"],
      ["**Disable SSID broadcast**", "the access point stops advertising the network name", "the network does not appear in lists — users must know the name to connect", "the SSID still appears in other packets — a packet sniffer finds it"],
      ["**MAC address allow list**", "the access point checks each connecting device's MAC address (unique to its NIC) against a list", "only approved devices can join", "MAC addresses can be spoofed; every device must be added by hand"]
    ] } },
    { callout: { t: "miscon", h: "MAC filtering does not stop eavesdropping", body: "A whitelist controls who can **connect**. Someone just **listening** (the mapping cars of A-level 2017) needs no connection — only **encryption** protects the data in the air. MAC filtering is **R.** as a defence there." } },
    { callout: { t: "warn", h: "IP address for MAC address (DPT/R.)", body: "The allow list holds **MAC** (hardware) addresses — IP addresses are assigned dynamically (DHCP) and say nothing about the device." } },

    { page: "CSMA/CA and RTS/CTS" },
    { fig: { w: 600, h: 230, items: (function () {
      var it = [];
      it = it.concat(boxAt(40, 10, 120, 30, "Laptop (sender)", "accent"), boxAt(240, 10, 120, 30, "Access point", "accent2"), boxAt(440, 10, 120, 30, "Other nodes", "muted"));
      [100, 300, 500].forEach(function (x) { it.push({ line: [[x, 40], [x, 222]], c: "line", w: 1, dash: "3 4" }); });
      it.push(txt(100, 58, "listen: channel idle?", { size: 10.5, c: "text2" }));
      it = it.concat(arrow(100, 80, 300, 95, "RTS (request to send)"));
      it = it.concat(arrow(300, 115, 100, 130, "CTS (clear to send)", { c: "good" }));
      it = it.concat(arrow(300, 118, 500, 133, "CTS heard → stay silent", { c: "danger", dash: "4 4", dy: 30, dx: 20 }));
      it = it.concat(arrow(100, 160, 300, 175, "DATA"));
      it = it.concat(arrow(300, 195, 100, 210, "ACK", { c: "good" }));
      it.push(txt(500, 205, "ACK heard → may transmit", { size: 10.5, c: "good" }));
      return it;
    })(), cap: "CSMA/CA with RTS/CTS: listen first, ask, wait for clearance (which silences everyone else), send, then acknowledgement." } },
    { steps: [
      "The node with data to send **listens** to the channel (carrier sense).",
      "If another transmission is in progress, it **waits** (a random back-off time).",
      "When the channel is idle, it sends a **Request to Send (RTS)** to the access point / receiver.",
      "The receiver replies **Clear to Send (CTS)**. The CTS is heard by **every node in range** of the receiver, which **stay silent** for the time it specifies — solving the **hidden node** problem.",
      "On receiving CTS the node **transmits** its data. (No CTS → wait, then try again.)",
      "The receiver sends an **acknowledgement (ACK)** once all the data has arrived intact; the ACK also tells other nodes they may transmit.",
      "No ACK within a time limit → the sender **waits a (random) period** and retransmits. Collisions **cannot be detected** by a radio transmitter — hence avoidance (CA), not detection (CD)."
    ] },
    { table: { head: ["", "CSMA/CA without RTS/CTS", "with RTS/CTS"], rows: [
      ["Before data", "listen; if idle, wait a random time, then transmit", "listen, then RTS → CTS handshake"],
      ["Hidden nodes", "two nodes out of range of each other can both transmit → collision at the AP", "CTS silences every node that can hear the receiver"],
      ["Overhead", "lower", "extra control frames — used mainly for large frames"]
    ] } },
    { callout: { t: "miscon", h: "Side by side: CSMA/CA vs CSMA/CD", body: "**CD** (wired Ethernet, not required) detects collisions while transmitting, sends a jam signal and backs off. **CA** (Wi-Fi) cannot hear collisions over its own transmission, so it **avoids** them: random back-off, RTS/CTS and ACKs." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Hardware for each device", src: "AS June 2016 · P2 Q07.1 · 1 mark",
      q: "A school has installed a wireless network. What hardware component is needed for each device that is going to be connected to it?",
      steps: [{ m: "A **wireless network adapter** (card / dongle / interface card);", mk: "1 mark", n: "A. NIC." }], result: "Wireless network adapter" } },
    { worked: { tag: "exam", title: "Why the student cannot connect", src: "AS June 2016 · P2 Q07.2 · 3 marks",
      q: "A student has working hardware and knows the correct SSID and WPA2 key, but still cannot connect his own device. Describe a security measure, other than logging in, that is preventing him.",
      steps: [
        { m: "A MAC address white list / filtering;", mk: "1 mark" },
        { m: "the access point checks the MAC address of a device trying to connect against a list of allowed addresses;", mk: "1 mark" },
        { m: "only devices with an allowed MAC address can connect — his device's is not on the list;", mk: "1 mark", n: "DPT wrong type of address (IP)." }
      ], result: "MAC allow list" } },
    { worked: { tag: "exam", title: "Role of the SSID", src: "AS June 2016 · P2 Q07.4 · 2 marks",
      q: "Explain the role of a Service Set Identifier (SSID) in wireless networking.",
      steps: [{ m: "An SSID is a (locally unique) identifier for a wireless network;", mk: "1 mark" }, { m: "a client must use the same SSID as the access point to join the network;", mk: "1 mark" }], result: "Identifies the network" } },
    { worked: { tag: "exam", title: "SSID purpose and hiding it", src: "AS June 2023 · P2 Q12.1 · 2 marks",
      q: "Explain the purpose of a Service Set Identifier (SSID) and how disabling SSID broadcasting can make a network more secure.",
      steps: [{ m: "An SSID is a (locally unique) identifier / name for a wireless network;", mk: "1 mark" }, { m: "disabling its broadcast makes it harder for a client to join unless it already knows the SSID;", mk: "1 mark" }], result: "Name; hidden name" } },
    { worked: { tag: "exam", title: "Disabling SSID broadcast", src: "AS June 2025 · P2 Q13.4 · 2 marks",
      q: "A wireless network has its SSID broadcast disabled. Explain how this offers protection to the network.",
      steps: [
        { m: "The access point stops sending out the network name, so it will not appear in the list of available networks;", mk: "1 mark" },
        { m: "users must know the network name to connect // attackers will not know the name unless they packet sniff;", mk: "1 mark", n: "AS 2017 Q08.3 and 2024 Q11.4: same." }
      ], result: "Invisible unless known" } },
    { worked: { tag: "exam", title: "MAC white list", src: "AS June 2017 · P2 Q08.4 · 2 marks",
      q: "Explain how the use of a MAC (Media Access Control) address white list can increase the security of a wireless network.",
      steps: [{ m: "A MAC address is unique to every NIC / device;", mk: "1 mark", n: "R. first mark if not clear the MAC is unique to the device. R. IP address." }, { m: "a white list only allows authorised MAC addresses to connect — devices not on it cannot join;", mk: "1 mark" }], result: "Only listed hardware joins" } },
    { worked: { tag: "exam", title: "The role of WPA2", src: "AS June 2023 · P2 Q12.2 · 2 marks",
      q: "Explain the role of the security protocol WPA2 in wireless networking.",
      steps: [{ m: "(Strong) encryption of data being transmitted — securing the communications link;", mk: "1 mark" }, { m: "which (significantly) reduces the probability that an unauthorised person can understand data transmitted across the network;", mk: "1 mark", n: "NE. \"stops the data being read\"." }], result: "Encrypts transmissions" } },
    { worked: { tag: "exam", title: "No MAC filtering at the coffee shop", src: "AS June 2023 · P2 Q12.3 · 2 marks",
      q: "MAC address filtering only allows devices on a list to use the network. Describe two reasons why it would be inappropriate for a coffee shop providing Internet access to customers.",
      steps: [{ m: "The coffee shop wants open access for everyone in a public space;", mk: "1 mark" }, { m: "every customer's device would have to be added manually — time-consuming and needing technical knowledge staff may not have // customers with several devices would be frustrated;", mk: "1 mark" }], result: "Open access; impractical upkeep" } },
    { worked: { tag: "exam", title: "Three measures discussed", src: "AS June 2019 · P2 Q09.5 · 3 marks",
      q: "Discuss how encrypting data with WPA/WPA2, disabling SSID broadcasting and MAC address whitelisting could enhance the security of a Wi-Fi network.",
      steps: [
        { m: "WPA/WPA2 encryption significantly reduces the chance of unauthorised devices reading transmitted data;", mk: "1 mark" },
        { m: "with SSID broadcast disabled the network won't show up in a search, so people who don't know the SSID find it harder to join;", mk: "1 mark" },
        { m: "MAC whitelisting means only approved devices can join the network;", mk: "1 mark" }
      ], result: "One effect each" } },
    { worked: { tag: "exam", title: "Two measures for a home access point", src: "A-level June 2018 · P2 Q13.1 · 2 marks",
      q: "Describe two security measures a family should put in place to ensure their wireless access point is secure, and explain how each makes connections more secure.",
      steps: [
        { m: "Use WPA2 — it encrypts transmissions so that if intercepted they cannot be read by someone without the key;", mk: "1 mark", n: "NE. \"use a password\"." },
        { m: "Use a MAC address white list — so only devices with an address on the list can connect (or disable SSID broadcast — the network is harder to discover);", mk: "1 mark", n: "One mark per measure + effect pair; WPA2 and \"encrypt\" count once." }
      ], result: "Measure + effect, twice" } },
    { worked: { tag: "exam", title: "CSMA/CA with RTS/CTS (6 marks)", src: "A-level June 2021 · P2 Q11.5 · 6 marks",
      q: "A laptop connected to a wireless access point has data to send. The connection uses CSMA/CA with RTS/CTS. Explain how the protocol will be used during this transmission.",
      steps: [
        { m: "The laptop listens to the channel for a data signal; while another transmission is in progress it continues to wait (a random period)." },
        { m: "When the channel is idle it sends a Request to Send (RTS) to the access point." },
        { m: "The access point replies with Clear to Send (CTS), which blocks transmissions from all other nodes in range for a specified time." },
        { m: "On receiving CTS the laptop transmits its data; if no CTS arrives it waits and tries again." },
        { m: "The access point sends an acknowledgement (ACK) after receiving all the data; the ACK also tells other nodes they can transmit. If no ACK arrives in time, the laptop waits and retransmits — collisions cannot be detected by the transmitter.", mk: "5–6 marks", n: "5–6: detailed, includes RTS/CTS, no misunderstandings; 3–4: three points logically organised (max here without RTS/CTS); 1–2: a few points. (A-level 2018 Q13.2: identical.)" }
      ], result: "Listen · RTS · CTS · data · ACK" } },
    { worked: { tag: "exam", title: "CSMA/CA + majority voting (8 marks)", src: "AS June 2019 · P2 Q09.6 · 8 marks",
      q: "A wireless network uses CSMA/CA with RTS/CTS and majority voting. Explain the process the transmitting device goes through to transmit data and what the receiving device does when it receives the data.",
      steps: [
        { m: "The transmitting device checks for traffic; if another transmission is in progress it waits;", mk: "1 mark" },
        { m: "if the channel is idle it sends a request to send (RTS);", mk: "1 mark" },
        { m: "the receiver / WAP responds with clear to send (CTS);", mk: "1 mark" },
        { m: "if CTS is not received, the transmitter waits a random time before resending the RTS; when CTS is received it begins transmitting;", mk: "1 mark" },
        { m: "the receiver sends an acknowledgement (ACK) if all the data is received; if no ACK, the data is resent;", mk: "2 marks", n: "Max 6 for CSMA/CA and RTS/CTS." },
        { h: "Majority voting (4.5.5.3)", m: "the transmitter sends each bit an odd number of times greater than 2 (e.g. three times);", mk: "1 mark" },
        { m: "the receiver checks the copies and, if they differ, takes the value it received most often as correct;", mk: "1 mark", n: "R. \"the receiver knows the data is correct\". Max 8." }
      ], result: "Avoid collisions; vote out errors" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain the role / purpose (SSID)", "Identifier of the network + must match to join."],
      ["Explain how (a security measure)", "Mechanism + effect: hidden name; MAC unique per NIC + list check; encryption makes intercepted data unreadable."],
      ["Explain (CSMA/CA)", "Sequence: listen, wait, RTS, CTS (silences others), data, ACK, retransmit; no collision detection."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Listen, Ask, Wait, Talk, Thanks\"", body: "CSMA/CA: **L**isten (carrier sense) → **A**sk (RTS) → **W**ait for CTS → **T**alk (data) → **T**hanks (ACK). Security trio \"**E**ncrypt, **H**ide, **L**ist\": WPA2, SSID off, MAC allow list." } },
    { callout: { t: "warn", h: "Specific errors", body: ["IP address in a MAC allow list (R./DPT).", "\"Use a password\" for WPA2 (NE.).", "MAC filtering as protection against interception (R.).", "Describing collision DETECTION for Wi-Fi.", "Server instead of access point (R.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.2.1 a shared medium needs an access protocol; 4.5.5.3 majority voting; 4.5.6.10 and 4.9.3.2 encryption; 4.9.4.1 MAC addresses; 4.8.1 the Wi-Fi interception case (A-level 2017 Q07)." } }
  ],
  flashcards: [
    ["Purpose of Wi-Fi?", "A wireless LAN based on international standards, letting devices connect without cables."],
    ["Two components for wireless networking?", "Wireless network adapter (in each device) and a wireless access point."],
    ["What is an SSID?", "The locally unique identifier/name of a wireless network."],
    ["Effect of disabling SSID broadcast?", "The network isn't listed; only users who know the name can try to connect."],
    ["How does a MAC allow list work?", "The AP checks each device's unique MAC address against a list; only listed devices connect."],
    ["Role of WPA2?", "Strong encryption so intercepted data can't be understood without the key."],
    ["CSMA/CA steps?", "Listen; wait if busy; RTS; CTS; transmit; ACK; retransmit if no ACK."],
    ["Why RTS/CTS?", "CTS silences all nodes in range of the receiver — solves hidden nodes."],
    ["Why avoidance, not detection, in Wi-Fi?", "A radio transmitter cannot detect collisions while transmitting."],
    ["What does the ACK do?", "Confirms receipt and tells other nodes they may transmit."]
  ],
  quiz: [
    { q: "Which only stops devices CONNECTING, not eavesdropping?", opts: ["MAC allow list", "WPA2 encryption", "both", "neither"], ans: 0, why: "Listening needs no connection." },
    { q: "In CSMA/CA, CTS is sent by", opts: ["the receiver / access point", "the sender", "every node", "the router's DHCP server"], ans: 0, why: "Clear to send." },
    { q: "An SSID is", opts: ["a wireless network's identifier", "a MAC address", "an encryption key", "a port number"], ans: 0, why: "Name." },
    { q: "If no ACK arrives, the sender", opts: ["waits and retransmits", "sends a jam signal", "gives up", "changes SSID"], ans: 0, why: "Avoidance." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
