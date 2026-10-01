/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.5.6.1–
   4.5.6.6 (bit patterns as data, analogue and digital, analogue/digital
   conversion, bitmapped graphics, vector graphics, vector vs bitmap) at
   full A-level depth. Each topic REPLACES the short entry the older file
   carried; every way AQA has examined it (7516/2 June 2016–2025, 7517/2
   June 2017–2025) is explained, worked and answered in the mark scheme's
   own format. Every file size was checked by program.
   Past-paper banks stay in bank-cs-45a.js / bank-cs-45b.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */
/* a labelled box */
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 },
    { text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" }];
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}
function arrow(x1, y1, x2, y2, label) {
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: "accent2", w: 2 }];
  if (label) it.push({ text: [(x1 + x2) / 2, (y1 + y2) / 2 - 10], t: label, size: 10.5, c: "accent2" });
  return it;
}
/* a sampled and quantised waveform: samples at t = 0..n, levels 0..L */
function adcFig(cap) {
  var it = [], f = function (x) { return 8 + 6 * Math.sin(x * 0.62) + 1.5 * Math.sin(x * 1.7); };
  it.push({ fn: "8+6*sin(x*0.62)+1.5*sin(x*1.7)", from: 0, to: 10, c: "accent", w: 2.2 });
  for (var t = 0; t <= 10; t++) {
    var v = f(t), q = Math.round(v);
    it.push({ line: [[t, 0], [t, v]], c: "muted", w: 1, dash: true });
    it.push({ pt: [t, q], r: 3.4, c: "accent2" });
    if (t < 10) it.push({ line: [[t, q], [t + 1, q]], c: "accent2", w: 1.6 });
  }
  return { x: [0, 10.6], y: [0, 16.5], w: 520, h: 250, axes: { x: "time (sample points)", y: "amplitude level", xt: [0, 2, 4, 6, 8, 10], yt: [0, 4, 8, 12, 15] },
    items: it, cap: cap };
}
/* a tiny bitmap: rows of colour indexes; pal = colour tokens */
function bitmapFig(rows, pal, cap, o) {
  o = o || {};
  var px = o.px || 22, it = [], x0 = 16, y0 = 16;
  rows.forEach(function (r, y) {
    r.split("").forEach(function (ch, x) {
      var c = pal[ch];
      it.push({ poly: [[x0 + x * px, y0 + y * px], [x0 + (x + 1) * px, y0 + y * px], [x0 + (x + 1) * px, y0 + (y + 1) * px], [x0 + x * px, y0 + (y + 1) * px]], fill: c, alpha: c === "muted" ? 0.08 : 0.75, c: "line", w: 0.6 });
    });
  });
  var W = x0 * 2 + rows[0].length * px;
  (o.notes || []).forEach(function (t, i) { it.push({ text: [W + 8, y0 + 14 + i * 20], t: t, pos: "e", size: 12, c: "text2", off: 0 }); });
  return { w: W + (o.notes ? 250 : 0), h: y0 * 2 + rows.length * px, items: it, cap: cap };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** a correct point \"talked out\" by a wrong one alongside it.",
  "Calculations: the final answer earns all the marks; when it is wrong, listed method steps earn some — so always show them."
] } };

/* =====================================================================
   4.5.6.1  Bit patterns, images, sound and other data
   ===================================================================== */
C["compsci:4.5.6.1"] = {
  notes: [
    { h: "Bit patterns, images, sound and other data — the whole topic on one page" },
    "Spec 4.5.6.1: describe how **bit patterns** may represent other forms of data, including **graphics and sound**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What does each stored bit pattern represent (a sample, a pixel)?", "Describe", "1", "AS 2025 Q04.1"],
      ["Name the extra information stored with an image", "State", "1", "AS 2024 Q03.3"],
      ["Why the file is larger than the calculated size", "Explain", "1", "AS 2016 Q06.2"],
      ["The same bit pattern as several kinds of data", "Explain", "1–2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**One bit pattern, many meanings**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "One bit pattern, many meanings" },
    "Everything a computer stores is a **bit pattern**. What the pattern **means** depends entirely on how the program **interprets** it — the bits themselves carry no type.",
    { table: { head: ["Interpreted as", "01000001 means"], rows: [
      ["unsigned integer", "65"], ["two's complement integer", "+65"], ["ASCII character", "'A'"], ["a pixel in an 8-bit greyscale image", "a dark grey (65 of 255)"],
      ["one sound sample (8-bit)", "an amplitude level of 65 of 256"], ["part of a machine code instruction", "an opcode or operand (4.7.3.3)"]
    ] } },
    { kv: [
      ["Image", "a grid of **pixels**; each pixel's bit pattern is its **colour** (the number of bits is the colour depth)"],
      ["Sound", "a series of **samples**; each sample's bit pattern is the **amplitude** of the wave at that instant"],
      ["Metadata", "extra data stored with the content — width, height, colour depth, date, sample rate — so the bit patterns can be interpreted"]
    ] },
    { callout: { t: "miscon", h: "\"The computer knows it is a picture\"", body: "It does not: a file's **metadata** and the program reading it decide the interpretation. Open an image in a text editor and the same bits appear as (mostly unprintable) characters." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "What does each sample's bit pattern represent?", src: "AS June 2025 · P2 Q04.1 · 1 mark",
      q: "Each time a sample of an analogue sound is taken a bit pattern is stored. Describe what each bit pattern represents.",
      steps: [{ m: "A measurement of the amplitude of the (analogue) sound wave at a point in time.", mk: "1 mark", n: "A. height for amplitude. NE. \"a measurement of the sound wave\" — name the amplitude." }], result: "The amplitude at that instant" } },
    { worked: { tag: "exam", title: "The name for the additional information", src: "AS June 2024 · P2 Q03.3 · 1 mark",
      q: "When a bitmap image is stored in a file, additional information is stored as well as the colours of the pixels, e.g. the date of creation, image width and height. State the name given to this additional information.",
      steps: [{ m: "**Metadata**", mk: "1 mark" }], result: "Metadata" } },
    { worked: { tag: "exam", title: "Why the real file is bigger", src: "AS June 2016 · P2 Q06.2 · 1 mark",
      q: "Explain why the actual file size for a bitmap image will be larger than the minimum file size calculated from its pixels and colour depth.",
      steps: [{ m: "Because metadata (e.g. width and height in pixels, colour depth) will also be stored in the file.", mk: "1 mark" }], result: "Metadata is stored too" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe what a bit pattern represents", "Name the quantity: the amplitude (sound) or colour (pixel)."],
      ["State (additional data)", "\"Metadata\"."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Bits don't know what they are\"", body: "The interpretation comes from the program and the metadata." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"A measurement of the sound\" (NE.) — say amplitude.", "Forgetting metadata when explaining real file sizes."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.2 and 4.5.5 number and character representations; 4.5.6.4 pixels; 4.5.6.7 samples; 4.7.2 the stored program concept — instructions are bit patterns too." } }
  ],
  flashcards: [
    ["What decides what a bit pattern means?", "How the program interprets it (and the metadata)."],
    ["What does each sample's bit pattern represent?", "The amplitude of the wave at that instant."],
    ["What does each pixel's bit pattern represent?", "Its colour."],
    ["What is metadata?", "Data about the data — e.g. width, height, colour depth, sample rate."],
    ["01000001 as ASCII?", "'A'."],
    ["Why is an image file bigger than width × height × depth?", "Metadata is stored as well."],
    ["Is a bit pattern typed?", "No — the bits carry no type."],
    ["Name two kinds of data held as bit patterns.", "e.g. numbers, characters, images, sound, instructions."]
  ],
  quiz: [
    { q: "The extra data stored with an image is", opts: ["metadata", "a checksum", "a header bit", "a palette only"], ans: 0, why: "Data about the data." },
    { q: "A sound sample's bit pattern is", opts: ["an amplitude", "a frequency", "a pitch name", "a time"], ans: 0, why: "Measured height of the wave." },
    { q: "01000001 interpreted as an unsigned integer is", opts: ["65", "'A'", "−65", "41"], ans: 0, why: "64 + 1." },
    { q: "The same bits can represent different data because", opts: ["meaning depends on interpretation", "bits are typed", "the CPU guesses", "they cannot"], ans: 0, why: "No inherent type." }
  ]
};

/* =====================================================================
   4.5.6.2  Analogue and digital
   ===================================================================== */
C["compsci:4.5.6.2"] = {
  notes: [
    { h: "Analogue and digital — the whole topic on one page" },
    "Spec 4.5.6.2: understand the difference between **analogue and digital** data and analogue and digital **signals**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["The difference between analogue and digital data", "Describe", "2", "AS 2018 Q03.1, AS 2022 Q05.1"],
      ["Why sensor voltages are analogue and pixel data digital", "Explain", "2", "A-level 2024 Q02.3"],
      ["Analogue vs digital signals", "Describe / Compare", "1–2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Continuous and discrete**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Continuous and discrete" },
    { table: { head: ["", "Analogue", "Digital"], rows: [
      ["Data", "**continuous** — can take **any value in a range**; between any two values there is another", "**discrete** — a finite set of values with **gaps/jumps** between them; stored as binary (1s and 0s)"],
      ["Signal", "a continuously varying voltage/wave whose level carries the information", "a signal switching between a fixed number of levels (two: high/low) representing bits"],
      ["Examples", "sound pressure, light intensity, a microphone's voltage, temperature", "a sampled sound file, pixel colour values, a USB bit stream"],
      ["Noise", "any noise adds to the value and cannot be removed", "small noise is ignored — the receiver only decides high or low"]
    ] } },
    { fig: { x: [0, 10], y: [-1.6, 1.6], w: 520, h: 200, axes: { x: "time", y: "level", xt: [], yt: [] },
      items: [
        { fn: "sin(x*1.1)", from: 0, to: 10, c: "accent", w: 2.4 },
        { line: [[0, -1.2], [1.4, -1.2]], c: "accent3", w: 2.4 }, { line: [[1.4, -1.2], [1.4, 1.2]], c: "accent3", w: 2.4 }, { line: [[1.4, 1.2], [3.5, 1.2]], c: "accent3", w: 2.4 }, { line: [[3.5, 1.2], [3.5, -1.2]], c: "accent3", w: 2.4 },
        { line: [[3.5, -1.2], [5, -1.2]], c: "accent3", w: 2.4 }, { line: [[5, -1.2], [5, 1.2]], c: "accent3", w: 2.4 }, { line: [[5, 1.2], [5.7, 1.2]], c: "accent3", w: 2.4 }, { line: [[5.7, 1.2], [5.7, -1.2]], c: "accent3", w: 2.4 },
        { line: [[5.7, -1.2], [8, -1.2]], c: "accent3", w: 2.4 }, { line: [[8, -1.2], [8, 1.2]], c: "accent3", w: 2.4 }, { line: [[8, 1.2], [10, 1.2]], c: "accent3", w: 2.4 },
        { text: [4.25, 0.35], t: "analogue", c: "accent", b: true, size: 12 }, { text: [9, 1.45], t: "digital", c: "accent3", b: true, size: 12 }
      ], cap: "An analogue signal varies continuously; a digital signal jumps between two discrete levels." } },
    { callout: { t: "miscon", h: "\"Digital means binary\" / \"analogue means a wave\"", body: "Digital means **discrete** (a finite set of values); binary is the usual coding of it. Analogue means **continuous** — a varying voltage is analogue whatever its shape. For the second mark AQA wants *discrete* (or *gaps between values*), not just \"binary\" (NE. in A-level 2024)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Analogue vs digital data", src: "AS June 2022 · P2 Q05.1 · 2 marks",
      q: "Describe the difference between analogue and digital data.",
      steps: [
        { m: "Analogue data is continuous — it can take any value in a given range;", mk: "1 mark" },
        { m: "digital data has discrete values (with gaps/jumps between them) and can be stored as binary;", mk: "1 mark" }
      ], result: "Continuous vs discrete" } },
    { worked: { tag: "exam", title: "Sensor voltages vs pixel data", src: "A-level June 2024 · P2 Q02.3 · 2 marks",
      q: "When a digital camera takes a photograph, an array of photosensors produces analogue voltages representing the amount of light on each; an ADC converts them into digital values used as the pixel data. Explain why the voltages are considered to be analogue and why the pixel data is considered to be digital.",
      steps: [
        { m: "The voltages are continuously variable — they can take any value (reflecting the light);", mk: "1 mark", n: "NE. \"real world quantity\"." },
        { m: "the pixel data is discrete — each colour is stored in a fixed number of bits, so there is a finite set of values with gaps between them;", mk: "1 mark", n: "NE. \"the pixel data is binary\"; NE. \"not continuous\"." }
      ], result: "Continuous voltages; discrete, fixed-bit pixel values" } },
    { worked: { tag: "variation", title: "Why digital signals survive noise", q: "Explain why a digital signal can travel further through noisy cable than an analogue one without losing information.",
      steps: [{ m: "Noise shifts the voltage slightly. An analogue receiver cannot tell noise from signal, so the error is kept. A digital receiver only decides whether each level is high or low, so small noise is rejected and the bits can even be regenerated by repeaters." }], result: "Discrete levels tolerate noise" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the difference", "Two points: analogue continuous / any value; digital discrete / finite values (binary)."],
      ["Explain why … analogue / digital", "Apply the property to the given data: continuously variable voltages; fixed-bit pixel values."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Analogue Any value, Digital Discrete\"", body: "A–A, D–D." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Digital is binary\" alone (NE.).", "\"Analogue is a real world quantity\" (NE.).", "Calling a sampled sound file analogue."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.1.7 measurement (ℝ, continuous) vs counting (ℕ, discrete); 4.5.6.3 ADC/DAC; 4.9.1.1 serial transmission of digital signals." } }
  ],
  flashcards: [
    ["Analogue data?", "Continuous — any value in a range."],
    ["Digital data?", "Discrete — a finite set of values, stored as binary."],
    ["Is a microphone's output analogue or digital?", "Analogue."],
    ["Is pixel data analogue or digital?", "Digital."],
    ["Why are photosensor voltages analogue?", "They are continuously variable."],
    ["Why is pixel data digital?", "Each value is stored in a fixed number of bits — discrete values."],
    ["Advantage of digital signals?", "Small noise is rejected; signals can be regenerated."],
    ["Is \"digital means binary\" enough?", "No — say discrete."]
  ],
  quiz: [
    { q: "Analogue data is", opts: ["continuous", "discrete", "binary", "compressed"], ans: 0, why: "Any value." },
    { q: "A key feature of digital data is", opts: ["discrete values", "infinite precision", "continuity", "it is always sound"], ans: 0, why: "Gaps between values." },
    { q: "The voltage from a photosensor is", opts: ["analogue", "digital", "binary", "metadata"], ans: 0, why: "Continuously variable." },
    { q: "Digital signals tolerate noise because", opts: ["only high/low must be distinguished", "they are louder", "they are analogue", "they are compressed"], ans: 0, why: "Discrete levels." }
  ]
};

/* =====================================================================
   4.5.6.3  Analogue/digital conversion
   ===================================================================== */
C["compsci:4.5.6.3"] = {
  notes: [
    { h: "Analogue/digital conversion — the whole topic on one page" },
    "Spec 4.5.6.3: describe the principles of operation of an **analogue to digital converter (ADC)** and a **digital to analogue converter (DAC)**; know that analogue signals from a sensor can be digitised by sampling the signal at regular intervals.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Describe the steps an ADC performs", "Describe / Explain the principles", "2–3", "AS 2017 Q03.2, AS 2020 Q03.1, AS 2022 Q05.2, A-level 2020 Q01.2, 2025 Q02.2"],
      ["Name the component (ADC / DAC)", "State", "1", "AS 2024 Q03.1, A-level 2023 Q01.3"],
      ["The role of a DAC and why it is needed", "Explain", "2", "AS 2025 Q04.2"],
      ["How a digital camera captures an image", "Describe", "3–6", "AS 2018 Q07.2, AS 2025 Q11.1, AS 2023 Q11"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The ADC, step by step**.", "**The DAC**.", "**Capturing an image**.", "**Exam toolkit**."] },
    { diagram: "adc-sampling" },

    { page: "The ADC, step by step" },
    { callout: { t: "memorise", h: "ADC: sample → quantise → encode", body: [
      "1. **Sample**: the analogue signal (voltage) is sampled — its amplitude is measured — at **fixed/regular time intervals** (the sample rate).",
      "2. **Quantise**: each measured amplitude is **approximated to the nearest of a fixed set of levels** (an integer value).",
      "3. **Encode**: each quantised value is **coded in binary** using a fixed number of bits (the sample resolution) and stored."
    ] } },
    { fig: adcFig("An ADC at work: the wave (pink) is measured at regular sample points (dashed), each measurement is rounded to the nearest level (gold), and each level is stored in binary. The gold staircase is what playback rebuilds.") },
    { callout: { t: "warn", h: "Wording the mark scheme insists on", body: "Say the **signal** (or voltage) is sampled, not the \"sound wave\" or \"sound\" (R.); say **binary value**, not \"digital value\" (R.) for the encoding step; say **at regular intervals** for the sampling step." } },
    { worked: { tag: "exam", title: "The steps an ADC goes through", src: "AS June 2017 · P2 Q03.2 · 3 marks",
      q: "A song is recorded using a microphone plugged into the sound card of a computer. The sound card contains an analogue to digital converter (ADC). Describe the steps the ADC goes through in this process.",
      steps: [
        { m: "The ADC takes samples of the analogue electrical signal at regular intervals;", mk: "1 mark" },
        { m: "the samples are quantised — the amplitude of each sample is measured and approximated to an integer value;", mk: "1 mark" },
        { m: "each sample is encoded as a binary value (and stored);", mk: "1 mark" }
      ], result: "Sample, quantise, encode in binary" } },
    { worked: { tag: "exam", title: "The principles of an ADC (2 marks for all three points)", src: "A-level June 2025 · P2 Q02.2 · 2 marks",
      q: "Describe the principles of operation of an analogue to digital converter (ADC).",
      steps: [
        { m: "The analogue signal is sampled at fixed/regular time intervals; the amplitude/voltage at each sample point is measured; the measurement is coded into a fixed number of bits (quantised to the nearest representable value).", mk: "2 marks", n: "2 marks for all three points; 1 mark for one or two. R. references to graphs." }
      ], result: "Sample regularly, measure amplitude, code in fixed bits" } },
    { worked: { tag: "exam", title: "Name the component", src: "AS June 2024 · P2 Q03.1 · 1 mark",
      q: "State the name of the component on a sound card that transforms the continuous signal received from a microphone to a form that can be stored by a computer.",
      steps: [{ m: "**Analogue to digital converter (ADC)**", mk: "1 mark" }], result: "ADC" } },

    { page: "The DAC" },
    { callout: { t: "def", h: "Digital to analogue converter (DAC)", body: "A **DAC** transforms **digital data into an analogue signal** (voltage/wave): each binary sample becomes a voltage level, held until the next sample, and the steps are smoothed. It is needed because **speakers and headphones can only be driven by an analogue signal**." } },
    { worked: { tag: "exam", title: "The role of a DAC", src: "AS June 2025 · P2 Q04.2 · 2 marks",
      q: "A sound file is being played on a laptop computer, which contains a digital to analogue converter (DAC). Explain the role of the DAC and why it is necessary.",
      steps: [
        { h: "Role", m: "The DAC transforms the digital data into an analogue (audio) signal / voltage;", mk: "1 mark" },
        { h: "Why", m: "the laptop's speakers/headphones can only play back an analogue signal;", mk: "1 mark" }
      ], result: "Digital → analogue for the speakers" } },
    { worked: { tag: "exam", title: "Name the playback component", src: "A-level June 2023 · P2 Q01.3 · 1 mark",
      q: "Binary sound data is used to generate an electrical waveform for playback. A hardware component on a sound card carries out this process. State its name.",
      steps: [{ m: "**Digital to analogue converter** (DAC)", mk: "1 mark", n: "NE. \"digital to analogue\". R. a full name that does not match the initialism (e.g. \"digital to analogue converter (ADC)\")." }], result: "DAC" } },

    { page: "Capturing an image" },
    { fig: { w: 540, h: 130, items: [].concat(
      boxAt(10, 40, 80, 50, "lens", "muted", "focuses light"), arrow(90, 65, 120, 65),
      boxAt(120, 40, 110, 50, "sensor array", "accent", "CCD / CMOS cells"), arrow(230, 65, 260, 65, "voltages"),
      boxAt(260, 40, 80, 50, "RGB filters", "accent3", "per colour"), arrow(340, 65, 370, 65),
      boxAt(370, 40, 70, 50, "ADC", "accent2", "→ binary"), arrow(440, 65, 470, 65),
      boxAt(470, 40, 64, 50, "pixels", "accent", "array")
    ), cap: "A digital camera: light → photosensors (an analogue voltage each) → colour filters → ADC → a 2-D array of pixel values." } },
    { worked: { tag: "exam", title: "The principles of a digital camera", src: "AS June 2025 · P2 Q11.1 · 3 marks",
      q: "A photographer uses a digital camera. The shutter opens and light is focused on an array of light-sensitive cells arranged in rows and columns. Describe the principles of operation of a digital camera after the light has been focused on the cells.",
      steps: [
        { m: "Each cell/photosensor outputs an analogue voltage determined by (proportional to) the amount of light falling on it;", mk: "1 mark" },
        { m: "an analogue to digital converter converts each voltage to binary;", mk: "1 mark" },
        { m: "red, green and blue filters are used to measure the colour components of the light (the sensor array is a CCD or CMOS chip);", mk: "1 mark", n: "Max 3 — any three of the four points." }
      ], result: "Voltage per cell → ADC → binary; RGB filters" } },
    { worked: { tag: "exam", title: "Capture, then compress with RLE (6 marks)", src: "AS June 2018 · P2 Q07.2 · 6 marks",
      q: "Cameras in a driverless taxi take still images every second; the images are compressed using run-length encoding and stored on a flash memory card. Describe how a digital image could be captured by a digital camera and compressed using run-length encoding.",
      steps: [
        { h: "Capture", m: "Light is focused by the lens onto an array of sensors (CCD); each sensor produces an electrical signal; the signal represents a pixel;", mk: "3 marks" },
        { m: "an ADC converts the light-intensity measurement into binary; a colour filter generates separate red, green and blue values; the pixels are recorded as an array;", mk: "1 mark" },
        { h: "RLE", m: "the image is analysed to find runs of consecutive pixels of the same colour;", mk: "1 mark" },
        { m: "each run is stored as a pair: the colour and the count (run length);", mk: "1 mark", n: "Levels of response: 5–6 marks need five points covering BOTH capture and RLE." }
      ], result: "Lens → sensors → ADC → pixels; runs stored as (colour, count)" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the steps (ADC)", "Three points: sampled at regular intervals; amplitude measured and quantised; encoded in binary."],
      ["Explain the role of a DAC", "Digital → analogue signal + speakers need analogue."],
      ["Describe a digital camera", "Voltage per photosensor; ADC to binary; RGB filters; CCD/CMOS."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Some Quiet Engineers\"", body: "**S**ample → **Q**uantise → **E**ncode." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"The sound wave is sampled\" (R.) — the electrical signal is.", "\"Converted to a digital value\" (R.) — say binary.", "Muddling ADC (recording) and DAC (playback)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.7 sample rate and resolution set the ADC's behaviour; 4.7.4.1 input devices (microphone, camera) and output devices (speakers); 4.5.4.5 quantisation is a rounding error." } }
  ],
  flashcards: [
    ["Three steps of an ADC?", "Sample at regular intervals; quantise the amplitude; encode in binary."],
    ["What does a DAC do?", "Converts digital data into an analogue signal."],
    ["Why is a DAC needed for playback?", "Speakers/headphones need an analogue signal."],
    ["Component that digitises a microphone signal?", "ADC."],
    ["What does a photosensor output?", "An analogue voltage proportional to the light falling on it."],
    ["Two sensor technologies in cameras?", "CCD and CMOS."],
    ["How is colour captured?", "Red, green and blue filters over the sensors."],
    ["What is quantisation?", "Rounding each measured amplitude to the nearest available level."]
  ],
  quiz: [
    { q: "The ADC step that rounds a measurement to a level is", opts: ["quantisation", "sampling", "encoding", "smoothing"], ans: 0, why: "Approximate to integer levels." },
    { q: "A DAC is used when", opts: ["playing sound through speakers", "recording from a microphone", "compressing a file", "taking a photo"], ans: 0, why: "Digital → analogue." },
    { q: "Samples are taken", opts: ["at regular time intervals", "whenever the sound is loud", "once per note", "randomly"], ans: 0, why: "The sample rate." },
    { q: "In a camera, the ADC converts", opts: ["sensor voltages to binary", "binary to light", "colours to sound", "pixels to vectors"], ans: 0, why: "Analogue → digital." }
  ]
};

/* =====================================================================
   4.5.6.4  Bitmapped graphics
   ===================================================================== */
C["compsci:4.5.6.4"] = {
  notes: [
    { h: "Bitmapped graphics — the whole topic on one page" },
    "Spec 4.5.6.4: explain how **bitmaps** are represented; explain the terms **resolution** and **colour depth**; calculate storage requirements for bitmapped images (size = **width × height × colour depth**, excluding metadata); be aware that bitmap files may store **metadata**.",
    "The file-size calculation is asked on almost every paper, forwards and backwards:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Minimum file size from width, height, colours", "Calculate, show working", "2–3", "AS 2016 Q06.1, AS 2018 Q12.1, A-level 2018 Q02.2, A-level 2024 Q02.1"],
      ["Bits needed for a number of colours", "Shade / How many", "1", "AS 2016 Q06.3, AS 2018 Q12.2"],
      ["Maximum number of colours from a file size", "Calculate", "2–3", "AS 2024 Q03.2, A-level 2021 Q01.1"],
      ["Spot a student's error (colours vs colour depth)", "Explain", "2", "AS 2020 Q04"],
      ["Describe the calculation", "Describe", "1", "AS 2023 Q05.1"],
      ["How many images fit on a card", "How many", "1", "A-level 2024 Q02.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Pixels, resolution and colour depth**.", "**File size: forwards**.", "**File size: backwards**.", "**Exam toolkit**."] },

    { page: "Pixels, resolution and colour depth" },
    { kv: [
      ["Bitmap", "an image stored as a **2-D grid of pixels**, each stored as a binary value giving its colour"],
      ["Pixel", "**picture element** — the smallest addressable dot of colour in the image"],
      ["Resolution", "the **number of pixels** in the image — width × height (e.g. 4000 × 3000); for a display, pixels per inch (dots per inch)"],
      ["Colour depth", "the **number of bits used to represent the colour of each pixel**; n bits give 2ⁿ colours"],
      ["Metadata", "data stored with the image: width, height, colour depth, date, camera settings"]
    ] },
    { fig: bitmapFig(["..YYYY..", ".YYYYYY.", "YYBYYBYY", "YYYYYYYY", "YBYYYYBY", "YYBBBBYY", ".YYYYYY.", "..YYYY.."], { ".": "muted", Y: "accent2", B: "text" },
      "An 8 × 8 bitmap with 3 colours: 2 bits per pixel (2² = 4 ≥ 3), so 8 × 8 × 2 = 128 bits = 16 bytes before metadata.",
      { notes: ["resolution 8 × 8 = 64 pixels", "colours 3 → colour depth 2 bits", "size 64 × 2 = 128 bits", "= 16 bytes (+ metadata)"] }) },
    { table: { head: ["Colours", "Colour depth (bits)", "Reason"], rows: [
      ["2", "1", "2¹ = 2"], ["4", "2", "2² = 4"], ["5", "3", "4 < 5 ≤ 8"], ["18", "5", "16 < 18 ≤ 32"], ["256", "8", "2⁸"], ["16 777 216", "24", "2²⁴ — \"true colour\" (8 bits each of R, G, B)"]
    ] } },
    { callout: { t: "miscon", h: "Number of colours ≠ colour depth", body: "Multiplying by the **number of colours** instead of the **colour depth** is the commonest bitmap error AQA tests (AS 2020 Q04). 4 colours need **2** bits, not 4." } },

    { page: "File size: forwards" },
    { callout: { t: "formula", h: "Minimum size of a bitmap (bits)", body: [
      "**size = width (pixels) × height (pixels) × colour depth (bits)**",
      "Then ÷ 8 for bytes; ÷ 1000 for kB, ÷ 1000² for MB (or ÷ 1024 … for KiB, MiB). Metadata is excluded unless stated."
    ] } },
    { worked: { tag: "exam", title: "A 16 × 16 sprite", src: "AS June 2016 · P2 Q06.1, Q06.3 · 4 marks",
      q: "A 16 × 16 bitmap image used as a character in a computer game uses four colours. (a) What is the minimum file size in bytes when it is represented as a bitmap? (b) If the number of colours were increased by two, what is the minimum number of extra bits needed for each pixel?",
      steps: [
        { h: "(a) pixels", m: "16 × 16 = 256 pixels", mk: "1 mark" },
        { m: "4 colours → colour depth 2 bits: 256 × 2 = 512 bits", mk: "1 mark" },
        { m: "512 ÷ 8 = **64 bytes**", mk: "1 mark" },
        { h: "(b)", m: "6 colours need 3 bits (4 < 6 ≤ 8): **1** extra bit", mk: "1 mark" }
      ], result: "(a) 64 bytes (b) 1" } },
    { worked: { tag: "exam", title: "Five colours, 8 × 10 pixels", src: "AS June 2018 · P2 Q12.1–12.2 · 4 marks",
      q: "A bitmap image of 8 × 10 pixels consists of white, red, blue, black and yellow pixels only. (a) Calculate the minimum file size (excluding metadata) in bytes, showing working. (b) Shade the minimum colour depth, in bits, for an image with 18 colours.",
      steps: [
        { h: "(a)", m: "number of pixels 8 × 10 = **80**", mk: "1 mark" },
        { m: "5 colours → 3 bits: 80 × 3 = **240** bits", mk: "1 mark" },
        { m: "240 ÷ 8 = **30 bytes**", mk: "1 mark", n: "Follow-through errors are allowed." },
        { h: "(b)", m: "16 < 18 ≤ 32 → **5** bits", mk: "1 mark" }
      ], result: "(a) 30 bytes (b) 5" } },
    { worked: { tag: "exam", title: "A 50 × 50 bitmap in four colours", src: "A-level June 2018 · P2 Q02.2 · 2 marks",
      q: "A bitmap graphic is 50 × 50 pixels and uses four colours: white, black, yellow and blue. Calculate the minimum storage space required, excluding metadata, in bytes. Show your working.",
      steps: [{ m: "50 × 50 × 2 ÷ 8", mk: "1 mark", n: "1 mark for 2500 or ×2 in the working." }, { m: "= **625 bytes**", mk: "1 mark" }], result: "625 bytes" } },
    { worked: { tag: "exam", title: "A camera image in megabytes; how many fit", src: "A-level June 2024 · P2 Q02.1–02.2 · 3 marks",
      q: "A digital camera takes photographs 4000 pixels wide by 3000 pixels tall that can contain up to 16 777 216 different colours. (a) Calculate the size of one image in megabytes. (b) How many images could be stored on a 256 gigabyte memory card? Round down to the nearest whole number.",
      steps: [
        { h: "(a)", m: "16 777 216 = 2²⁴ → 24 bits = 3 bytes per pixel: 4000 × 3000 × 3 = 36 000 000 bytes", mk: "1 mark" },
        { m: "÷ 1000 ÷ 1000 = **36 MB**", mk: "1 mark" },
        { h: "(b)", m: "256 000 MB ÷ 36 = 7111.1 → **7111**", mk: "1 mark", n: "Round DOWN — a partial image does not fit." }
      ], result: "(a) 36 MB (b) 7111" } },
    { worked: { tag: "exam", title: "Describe the calculation", src: "AS June 2023 · P2 Q05.1 · 1 mark",
      q: "Describe how to calculate the minimum storage requirements, excluding metadata, of a bitmapped image.",
      steps: [{ m: "Multiply the width by the height (the number of pixels) by the colour depth (the number of bits used to represent each pixel).", mk: "1 mark" }], result: "width × height × colour depth" } },
    { worked: { tag: "exam", title: "Find the student's mistake", src: "AS June 2020 · P2 Q04 · 2 marks",
      q: "A bitmapped image is 10 pixels wide by 16 pixels high with 4 possible colours for each pixel. A student calculates 80 bytes using (width × height × number of colours) ÷ bits in a byte. Explain what the student has done wrong and state the correct minimum file size in bytes.",
      steps: [
        { m: "The student has used the number of colours (4) instead of the colour depth — the number of bits per pixel (2);", mk: "1 mark" },
        { m: "correct size 10 × 16 × 2 ÷ 8 = **40 bytes**;", mk: "1 mark" }
      ], result: "Colours used instead of colour depth; 40 bytes" } },

    { page: "File size: backwards" },
    { steps: [
      { h: "1.", m: "Convert the file size to **bits** (× 1000s, × 8)." },
      { h: "2.", m: "Divide by the number of pixels → the **colour depth**." },
      { h: "3.", m: "Number of colours = **2^(colour depth)**." }
    ] },
    { worked: { tag: "exam", title: "Maximum colours from 845 bytes", src: "AS June 2024 · P2 Q03.2 · 2 marks",
      q: "A bitmap image is 52 pixels high and 26 pixels wide and requires 845 bytes. Calculate the maximum number of colours that could be used. Show all your working.",
      steps: [
        { m: "845 × 8 = 6760 bits; 52 × 26 = 1352 pixels; 6760 ÷ 1352 = **5 bits** per pixel", mk: "1 mark" },
        { m: "2⁵ = **32 colours**", mk: "1 mark" }
      ], result: "32" } },
    { worked: { tag: "exam", title: "Maximum colours from 400 kB", src: "A-level June 2021 · P2 Q01.1 · 3 marks",
      q: "A bitmap image is 1000 pixels wide by 800 pixels high and takes up 400 kB of storage space, excluding metadata. Calculate the maximum number of different colours that could appear in the image, showing your working.",
      steps: [
        { m: "400 × 1000 × 8 = 3 200 000 bits", mk: "1 mark" },
        { m: "÷ (1000 × 800 = 800 000 pixels) = colour depth **4** bits", mk: "1 mark" },
        { m: "2⁴ = **16** colours", mk: "1 mark" }
      ], result: "16" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Calculate (size)", "pixels; × colour depth (bits, not colours); ÷ 8; the unit asked for — each a method mark."],
      ["Calculate (colours)", "bits ÷ pixels = depth; 2^depth."],
      ["Describe the calculation", "width × height × colour depth."],
      ["Explain the error", "Name the wrong quantity and give the right size."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"W × H × D, then ÷ 8\"", body: "Width × Height × Depth gives bits; ÷ 8 gives bytes." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Multiplying by the number of colours.", "Rounding the colour depth down (5 colours in 2 bits).", "Forgetting ÷ 8, or using 1024 when MB (not MiB) is asked.", "Rounding the number of images up."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.3.1 2ⁿ and log₂; 4.5.3.2 units; 4.5.6.9 RLE compresses bitmaps; 4.5.6.6 bitmap vs vector." } }
  ],
  flashcards: [
    ["Define colour depth.", "The number of bits used to represent the colour of each pixel."],
    ["Define resolution (image).", "The number of pixels: width × height."],
    ["What is a pixel?", "A picture element — the smallest addressable dot of colour."],
    ["Bitmap size formula?", "width × height × colour depth (bits)."],
    ["Colour depth for 5 colours?", "3 bits."],
    ["Colour depth for 18 colours?", "5 bits."],
    ["16 777 216 colours = ? bits", "24."],
    ["50 × 50, 4 colours, in bytes?", "625."],
    ["Max colours: 1000 × 800, 400 kB?", "16."],
    ["What extra data does a bitmap file hold?", "Metadata (width, height, colour depth …)."]
  ],
  quiz: [
    { q: "A 10 × 16 image in 4 colours needs", opts: ["40 bytes", "80 bytes", "160 bytes", "20 bytes"], ans: 0, why: "160 px × 2 bits ÷ 8." },
    { q: "The colour depth for 256 colours is", opts: ["8 bits", "256 bits", "16 bits", "1 byte per colour"], ans: 0, why: "2⁸." },
    { q: "Doubling the colour depth of an image", opts: ["doubles its file size", "squares the colours count only", "halves the resolution", "changes nothing"], ans: 0, why: "Size ∝ depth." },
    { q: "845 bytes for 52 × 26 pixels means a depth of", opts: ["5 bits", "6 bits", "4 bits", "8 bits"], ans: 0, why: "6760 ÷ 1352." }
  ]
};

/* =====================================================================
   4.5.6.5  Vector graphics
   ===================================================================== */
C["compsci:4.5.6.5"] = {
  notes: [
    { h: "Vector graphics — the whole topic on one page" },
    "Spec 4.5.6.5: explain how **vector graphics** represent images using **lists of objects**; give examples of typical **properties** of objects; use vector graphic primitives to create a simple vector graphic.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Describe how a vector graphic is represented, applied to a shape", "Describe", "3", "A-level 2018 Q02.1"],
      ["Why a vector version takes far less space than the bitmap", "Explain", "3", "A-level 2021 Q01.2"],
      ["Write the properties of an object", "Write / Give", "1–3", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Objects and properties**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Objects and properties" },
    { callout: { t: "def", h: "Vector graphic", body: "An image represented as a **list of objects** (geometric shapes — lines, rectangles, circles, polygons, curves, text), each described by its **properties** (attributes). To display it, the computer **calculates** the pixels from the properties at whatever size is needed." } },
    { table: { head: ["Object", "Typical properties"], rows: [
      ["rectangle", "x and y of a corner, width, height, fill colour, outline (line) colour, outline width"],
      ["circle", "centre x and y, radius, fill colour, line colour, line width"],
      ["line", "start x and y, end x and y, line colour, line width"],
      ["polygon", "list of vertex coordinates, fill colour, line colour"],
      ["text", "x and y, string, font, size, colour"]
    ] } },
    { fig: { w: 540, h: 200, items: [
      { poly: [[30, 40], [210, 40], [210, 140], [30, 140]], fill: "text", alpha: 0.85, c: "accent", w: 3 },
      { circle: [300, 90, 50], fill: "accent2", alpha: 0.6, c: "accent", w: 2 },
      { text: [440, 40], t: "rectangle", b: true, c: "accent", size: 12 },
      { text: [440, 60], t: "x = 30, y = 40", c: "text2", size: 11.5 }, { text: [440, 78], t: "width 180, height 100", c: "text2", size: 11.5 }, { text: [440, 96], t: "fill black, line pink, 3 px", c: "text2", size: 11.5 },
      { text: [440, 124], t: "circle", b: true, c: "accent2", size: 12 },
      { text: [440, 142], t: "centre (300, 90), radius 50", c: "text2", size: 11.5 }, { text: [440, 160], t: "fill gold, line pink, 2 px", c: "text2", size: 11.5 }
    ], cap: "The whole picture is two short lists of numbers — the properties — whatever size it is drawn at." } },
    { code: { lang: "xml", src: "<svg width=\"540\" height=\"200\">\n  <rect x=\"30\" y=\"40\" width=\"180\" height=\"100\" fill=\"black\" stroke=\"deeppink\" stroke-width=\"3\"/>\n  <circle cx=\"300\" cy=\"90\" r=\"50\" fill=\"gold\" stroke=\"deeppink\" stroke-width=\"2\"/>\n</svg>", cap: "The same image as SVG, a real vector format: every primitive is one line of properties." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Describe a vector graphic, applied to a rectangle", src: "A-level June 2018 · P2 Q02.1 · 3 marks",
      q: "An image of four objects is represented digitally as a vector graphic. Describe how a vector graphic is represented, including an explanation of how the black rectangle in the image would be represented.",
      steps: [
        { h: "AO1 knowledge", m: "The image is represented as / composed of objects;", mk: "1 mark" },
        { m: "the properties of each object are stored;", mk: "1 mark", n: "A. attributes. NE. formulae." },
        { h: "AO1 understanding", m: "e.g. the black rectangle's fill colour (black), its width and height, and the x and y coordinates of its top-left corner;", mk: "1 mark", n: "R. vague properties — \"position\", \"colour\", \"coordinates\" without saying of what." }
      ], result: "Objects with stored properties, e.g. x, y, width, height, fill" } },
    { worked: { tag: "exam", title: "Why the vector file is so much smaller", src: "A-level June 2021 · P2 Q01.2 · 3 marks",
      q: "A 1000 × 800 pixel image takes 400 kB as a bitmap but only 2 kB as a vector graphic. Explain why the vector representation takes up significantly less storage space.",
      steps: [
        { m: "A bitmap stores the colour of every pixel — here 800 000 pixels;", mk: "1 mark" },
        { m: "a vector graphic stores only the properties of the objects the image is composed of;", mk: "1 mark" },
        { m: "the image is composed of relatively few objects, and it takes only a small amount of memory to store each object's properties — one object can be equivalent to many pixels;", mk: "1 mark", n: "R. \"equations\" or \"instructions\" for objects." }
      ], result: "Few objects' properties vs every pixel's colour" } },
    { worked: { tag: "variation", title: "Write a vector description", q: "Write a list of vector primitives, with properties, for a red circle of radius 20 centred at (50, 50) with a 2-pixel blue outline, and a black line from (0, 100) to (100, 100).",
      steps: [{ m: "circle: centre (50, 50), radius 20, fill red, line colour blue, line width 2" }, { m: "line: start (0, 100), end (100, 100), line colour black, line width 1" }], result: "Two objects with their properties" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe (vector)", "Objects; their properties are stored; a specific property of the given shape."],
      ["Explain (size)", "Bitmap: a colour per pixel. Vector: properties of a few objects."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Objects + Properties = Picture\"", body: "A vector image is a list of objects and their properties." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Stored as equations / formulae\" (NE./R.).", "Vague properties (\"position\") — say x and y of a named point.", "\"Vector graphics are made of lines\" — all primitives count."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.6 vector vs bitmap; 4.5.6.4 bitmaps; 4.1 OOP — a vector object is an object with attributes (and a Draw method)." } }
  ],
  flashcards: [
    ["How is a vector graphic represented?", "As a list of objects, each with stored properties."],
    ["Three properties of a rectangle?", "e.g. x/y of a corner, width, height, fill colour, line colour, line width."],
    ["Properties of a circle?", "Centre x/y, radius, fill colour, line colour, line width."],
    ["Why are vector files often small?", "They store properties of a few objects, not every pixel."],
    ["Is \"stored as equations\" acceptable?", "No."],
    ["A real vector format?", "SVG."],
    ["What happens when a vector image is displayed?", "The pixels are calculated from the properties."],
    ["Is a vector image resolution independent?", "Yes."]
  ],
  quiz: [
    { q: "A vector graphic stores", opts: ["objects and their properties", "the colour of every pixel", "samples", "runs of pixels"], ans: 0, why: "Definition." },
    { q: "A property of a circle is", opts: ["radius", "colour depth", "resolution", "sample rate"], ans: 0, why: "Object attribute." },
    { q: "Vector files are often smaller because", opts: ["few objects replace many pixels", "they are compressed", "they have no colour", "they use 1 bit"], ans: 0, why: "Properties not pixels." },
    { q: "Which is NOT a vector property?", opts: ["colour depth", "line width", "fill colour", "x coordinate"], ans: 0, why: "A bitmap term." }
  ]
};

/* =====================================================================
   4.5.6.6  Vector graphics versus bitmapped graphics
   ===================================================================== */
C["compsci:4.5.6.6"] = {
  notes: [
    { h: "Vector graphics versus bitmapped graphics — the whole topic on one page" },
    "Spec 4.5.6.6: compare the vector graphics approach with the bitmapped graphics approach and understand the advantages and disadvantages of each; be aware of appropriate uses of each approach.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Discuss vector vs bitmap, with an appropriate example of each", "Discuss", "6", "A-level 2019 Q13"],
      ["Two advantages of vectors besides file size", "State", "2", "A-level 2021 Q01.3"],
      ["Choose a format for a scenario", "Explain / Justify", "2", "variation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Side by side**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Side by side" },
    { table: { head: ["", "Vector graphic", "Bitmap"], rows: [
      ["Stores", "objects and their properties", "the colour of every pixel"],
      ["Scaling", "**scaled without loss of quality** — resolution independent", "**pixelates** when enlarged"],
      ["Editing", "**individual objects** can be edited, moved, copied independently; deleting one leaves no hole", "edits change pixels; deleting an area leaves a gap"],
      ["File size", "usually **smaller** for simple images", "grows with resolution × colour depth"],
      ["Realistic images", "cannot represent complex textures or continuous tone well", "**represents photographs, scans, complex textures** naturally"],
      ["Capture", "drawn or generated", "captured directly by cameras and scanners"],
      ["Appropriate for", "logos, charts, maps, plans, diagrams, fonts, clip art", "photographs, scanned images, sprites, artwork with texture"]
    ] } },
    { fig: { w: 540, h: 170, items: [
      { circle: [90, 85, 60], fill: "accent2", alpha: 0.7, c: "accent", w: 2 }, { text: [90, 160], t: "vector, ×8: still smooth", c: "accent", b: true, size: 12 },
      { text: [340, 160], t: "bitmap, ×8: blocky (pixelated)", c: "accent2", b: true, size: 12 }
    ].concat((function () {
      var it = [], r = 7, cx = 340, cy = 85, s = 16;
      for (var y = -r; y <= r; y++) for (var x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) it.push({ poly: [[cx + x * 8 - 4, cy + y * 8 - 4], [cx + x * 8 + 4, cy + y * 8 - 4], [cx + x * 8 + 4, cy + y * 8 + 4], [cx + x * 8 - 4, cy + y * 8 + 4]], fill: "accent2", alpha: 0.7, c: "line", w: 0.3 });
      }
      return it;
    })()), cap: "Enlarged, a vector circle is recalculated from its radius; a bitmap circle only has its original pixels to enlarge." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Discuss vector vs bitmap, with examples", src: "A-level June 2019 · P2 Q13 · 6 marks",
      q: "Discuss the advantages and disadvantages of representing an image as a vector graphic instead of as a bitmap. In your answer, include an example for which it would be most appropriate to use a vector graphic and an example for which it would be most appropriate to use a bitmap.",
      steps: [
        { h: "Vector advantages (MAX 3)", m: "Individual objects can be edited independently; the image can be scaled without loss of quality (resolution independent);", mk: "2 marks" },
        { m: "vector images typically take up less storage space / transmit more quickly;", mk: "1 mark" },
        { h: "Bitmap advantages (MAX 3)", m: "Bitmaps can represent complex textures and continuous variation in colour/tone, and images not composed of regular shapes — photographs and scans are naturally bitmaps because of how they are captured;", mk: "1 mark" },
        { h: "Examples (MAX 2)", m: "Vector: a logo, chart, map or plan;", mk: "1 mark" },
        { m: "Bitmap: a photograph or scanned image;", mk: "1 mark", n: "Max 5 without valid examples. The same point made both ways (vectors scale / bitmaps pixelate) earns one mark only." }
      ], result: "Vectors: scalable, editable, small. Bitmaps: photographic detail." } },
    { worked: { tag: "exam", title: "Two other advantages of vectors", src: "A-level June 2021 · P2 Q01.3 · 2 marks",
      q: "One advantage of vector graphics compared to bitmap graphics is that fewer bytes are used to represent an image. State two other advantages of vector graphics compared with bitmap graphics.",
      steps: [
        { m: "Individual objects can be manipulated/edited/copied independently;", mk: "1 mark" },
        { m: "the image can be enlarged/scaled without loss of quality (becoming pixelated) — resolution independent;", mk: "1 mark", n: "R. faster transmission (a consequence of fewer bytes, which the question already gave). NE. \"easy to edit\" / \"easy to scale\"." }
      ], result: "Independent editing; lossless scaling" } },
    { worked: { tag: "variation", title: "Choose the format", q: "A company needs (a) its logo for business cards and a 6-metre banner; (b) staff photos for its website. Recommend a representation for each with a reason.",
      steps: [{ m: "(a) **Vector** — one file scales from a card to a banner without loss of quality, and the logo is made of regular shapes." }, { m: "(b) **Bitmap** — photographs are captured as pixels and contain continuous tones a vector cannot represent." }], result: "Vector logo; bitmap photos" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Discuss", "Advantages of each (as advantages or the other's disadvantages, but not double-counted) + an appropriate example of each."],
      ["State two advantages", "Two distinct points — not the one in the question."],
      ["Compare", "\"Vector images can be scaled without loss of quality, whereas bitmaps pixelate\" — one linked statement."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Vectors Scale, Bitmaps Show texture\"", body: "Logos and diagrams → vector; photos and scans → bitmap." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Counting \"vectors scale\" and \"bitmaps pixelate\" as two marks.", "\"Easy to edit\" (NE.) — say individual objects can be edited independently.", "Forgetting the examples (max 5)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.4 bitmap sizes; 4.5.6.5 vector objects; 4.5.6.9 compression (bitmaps are often compressed, lossy for photos)." } }
  ],
  flashcards: [
    ["Main advantage of vector over bitmap?", "Scales without loss of quality (resolution independent)."],
    ["Second advantage of vector?", "Individual objects can be edited independently."],
    ["Main advantage of bitmap?", "Represents photographs and complex textures."],
    ["Example suited to vector?", "A logo, chart, map or plan."],
    ["Example suited to bitmap?", "A photograph or scanned image."],
    ["What happens when a bitmap is enlarged?", "It pixelates."],
    ["Are vector files always smaller?", "Usually for simple images; a complex image can be bigger as vectors."],
    ["Why are photos bitmaps?", "They are captured as pixels by sensors."]
  ],
  quiz: [
    { q: "Best format for a company logo used at many sizes", opts: ["vector", "bitmap", "MIDI", "RLE"], ans: 0, why: "Lossless scaling." },
    { q: "Best format for a holiday photograph", opts: ["bitmap", "vector", "SVG", "text"], ans: 0, why: "Continuous tones." },
    { q: "Enlarging a bitmap causes", opts: ["pixelation", "recalculation", "smaller files", "nothing"], ans: 0, why: "Only original pixels." },
    { q: "Deleting an object in a vector image", opts: ["leaves no hole", "leaves a blank area", "corrupts it", "changes the colour depth"], ans: 0, why: "Objects are separate." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
