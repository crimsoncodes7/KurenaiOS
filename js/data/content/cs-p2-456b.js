/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.5.6.7–
   4.5.6.10 (digital representation of sound, MIDI, data compression,
   encryption) at full A-level depth. Each topic REPLACES the short entry
   the older file carried; every way AQA has examined it (7516/2 June
   2016–2025, 7517/2 June 2017–2025) is explained, worked and answered in
   the mark scheme's own format. Every file size, run length and cipher
   was checked by program. Asymmetric encryption and digital signatures
   are Internet security (4.9.3.2). Past-paper banks stay in
   bank-cs-45a.js / bank-cs-45b.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */
function cell(x, y, w, h, t, col, o) {
  o = o || {};
  return [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || null, alpha: o.alpha != null ? o.alpha : (col ? 0.22 : 0), c: "line", w: 1.2 },
    { text: [x + w / 2, y + h / 2], t: t, b: !!o.b, size: o.size || 13, c: o.c || "text" }];
}
function row(x, y, w, h, vals, col, o) {
  var it = [];
  vals.forEach(function (v, i) { it = it.concat(cell(x + i * w, y, w, h, String(v), col, o)); });
  return it;
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\" — a right point cancelled by a wrong one beside it.",
  "Calculations: full marks for the right answer; method marks (listed steps) when it is wrong — show every multiplication and division."
] } };

/* =====================================================================
   4.5.6.7  Digital representation of sound
   ===================================================================== */
C["compsci:4.5.6.7"] = {
  notes: [
    { h: "Digital representation of sound — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.6.7)", body: ["Describe the digital representation of sound in terms of **sample resolution** and **sampling rate** and the **Nyquist theorem**.", "Calculate sound sample sizes in bytes (size = **sampling rate × resolution × seconds**)."] } },
    { callout: { t: "info", h: "Key idea", body: "Sound is asked on every AS paper and most A-level papers — 41 sub-questions in the packs:" } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Define sampling rate / sample resolution", "What is meant by", "1 each", "AS 2023 Q05.2–05.3"],
      ["File size from rate, resolution, duration", "Calculate, show working", "2–3", "AS 2017 Q03.1, AS 2019 Q04.2, A-level 2017 Q08.1, 2020 Q01.1"],
      ["Duration / rate / resolution from a file size", "Calculate", "2–3", "AS 2020 Q03.2, AS 2024 Q03.4, A-level 2022 Q10.1, 2025 Q02.1"],
      ["More levels from more bits", "How many more", "1", "AS 2019 Q04.1"],
      ["State Nyquist's theorem / apply it", "State / What is the minimum", "1–2", "AS 2020 Q03.3, AS 2025 Q04.3, A-level 2017 Q08.2, 2018 Q11.4, 2023 Q01.2"],
      ["Read resolution and rate off a sampling graph", "What … has been used", "1 each", "A-level 2018 Q11.1–11.2"],
      ["Why more bits improve quality; reduce the A–B difference", "Explain", "1–2", "AS 2024 Q03.5, A-level 2018 Q11.3"],
      ["Why a recording may not match the original", "Explain", "2", "A-level 2025 Q02.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Sampling rate and sample resolution**.", "**File size: forwards**.", "**File size: backwards**.", "**Nyquist's theorem**.", "**Quality**.", "**Exam toolkit**."] },
    { diagram: "adc-sampling" },

    { page: "Sampling rate and sample resolution" },
    { kv: [
      ["Sampling rate", "the **number of samples taken per second** (Hz); 1 Hz = one sample every second"],
      ["Sample resolution", "the **number of bits used to represent (store) each sample**; n bits give 2ⁿ amplitude levels"],
      ["Sample", "a measurement of the **amplitude** of the signal at a point in time"]
    ] },
    { fig: { x: [0, 0.0105], y: [0, 16], w: 520, h: 250, axes: { x: "time (s)", y: "level", xt: [{ v: 0, label: "0" }, { v: 0.005, label: "0.005" }, { v: 0.01, label: "0.01" }], yt: [0, 4, 8, 12, 15] },
      items: (function () {
        var it = [{ fn: "7.5+6*sin(x*700)", from: 0, to: 0.0105, c: "accent", w: 2.2 }];
        for (var k = 0; k <= 10; k++) { var t = k * 0.001, v = 7.5 + 6 * Math.sin(t * 700), q = Math.round(v); it.push({ line: [[t, 0], [t, v]], c: "muted", dash: true, w: 1 }, { pt: [t, q], r: 3.2, c: "accent2" }); }
        it.push({ text: [0.0074, 15], t: "16 levels → 4-bit resolution", c: "accent2", b: true, size: 11.5 }, { text: [0.0074, 13.6], t: "10 samples in 0.01 s → 1000 Hz", c: "accent2", b: true, size: 11.5 });
        return it;
      })(), cap: "The A-level 2018 set-up: amplitude rounded to one of 16 levels (4 bits), 10 samples in 0.01 s (1000 Hz)." } },
    { worked: { tag: "exam", title: "Define sampling rate and sample resolution", src: "AS June 2023 · P2 Q05.2–05.3 · 2 marks",
      q: "(a) What is meant by the term sampling rate? (b) What is meant by the term sample resolution?",
      steps: [{ h: "(a)", m: "The number of samples taken/measured in a second (a given period of time);", mk: "1 mark" }, { h: "(b)", m: "The number of bits used to represent/store each sample;", mk: "1 mark" }], result: "Samples per second; bits per sample" } },
    { worked: { tag: "exam", title: "Read the resolution and rate off the graph", src: "A-level June 2018 · P2 Q11.1–11.2 · 2 marks",
      q: "An analogue waveform's amplitude is measured using a scale with 16 divisions on the Y axis; the closest division is recorded. The graph covers 0.01 s, during which 10 samples are recorded. (a) What sample resolution has been used? (b) What sample rate has been used?",
      steps: [{ h: "(a)", m: "16 = 2⁴ levels → **4 bits** (a nibble)", mk: "1 mark", n: "NE. \"4\" without units." }, { h: "(b)", m: "10 ÷ 0.01 = **1000 Hz**", mk: "1 mark" }], result: "4 bits; 1000 Hz" } },

    { page: "File size: forwards" },
    { callout: { t: "formula", h: "Sound file size (bits)", body: [
      "**size = sampling rate (Hz) × sample resolution (bits) × duration (s)** (× channels if stereo)",
      "÷ 8 → bytes; ÷ 1000 → kB, ÷ 1000² → MB (÷ 1024 for KiB, MiB)."
    ] } },
    { worked: { tag: "exam", title: "A 3-minute song in MB", src: "AS June 2017 · P2 Q03.1 · 3 marks",
      q: "A song lasts 3 minutes. The sample resolution is 16 bits and a sample rate of 44 kHz has been used (1 Hz = one sample per second). Calculate the minimum storage space, in megabytes (MB), to store the song uncompressed. Show your working.",
      steps: [
        { m: "Length 180 s, resolution 16 bits, rate 44 000 Hz identified;", mk: "1 mark" },
        { m: "180 × 16 × 44 000 = 126 720 000 bits (= 1 584 000 bytes ÷ … )", mk: "1 mark" },
        { m: "÷ 8 ÷ 1 000 000 = **15.84 MB**", mk: "1 mark" }
      ], result: "15.84 MB" } },
    { worked: { tag: "exam", title: "3 minutes 20 seconds at 44.1 kHz", src: "AS June 2019 · P2 Q04.2 · 3 marks",
      q: "A sound lasts 3 minutes and 20 seconds. It is sampled at 44.1 kHz with a 16-bit sample resolution. Calculate the minimum storage space, in MB, to store it. Show your working.",
      steps: [
        { m: "200 s, 16 bits, 44 100 Hz identified;", mk: "1 mark" },
        { m: "200 × 16 × 44 100 = 141 120 000 bits = 17 640 000 bytes;", mk: "1 mark" },
        { m: "**17.64 MB**", mk: "1 mark" }
      ], result: "17.64 MB" } },
    { worked: { tag: "exam", title: "30 seconds in kilobytes", src: "A-level June 2017 · P2 Q08.1 · 2 marks",
      q: "Sound is sampled using a 16-bit sample resolution and a sample rate of 20 000 Hz. Calculate the storage space required for 30 seconds of recorded sound, in kilobytes. Show your working.",
      steps: [{ m: "30 × 16 × 20 000 ÷ 8 ÷ 1000", mk: "1 mark" }, { m: "= **1200 kB**", mk: "1 mark", n: "A. 1171.875 (KiB) this time." }], result: "1200 kB" } },
    { worked: { tag: "exam", title: "1 minute 40 seconds in bytes", src: "A-level June 2020 · P2 Q01.1 · 2 marks",
      q: "A sound was sampled for 1 minute and 40 seconds at 8000 Hz with a 16-bit sample resolution. Calculate the minimum storage space, in bytes. Show your working.",
      steps: [{ m: "100 × 16 × 8000 ÷ 8", mk: "1 mark" }, { m: "= **1 600 000 bytes**", mk: "1 mark", n: "A. 1600 kB or 1.6 MB for 1 mark; NE. 1600 without units." }], result: "1 600 000 bytes" } },

    { page: "File size: backwards" },
    { steps: [
      { h: "1.", m: "Convert the file size to **bits** (× 1000 per prefix step, × 8)." },
      { h: "2.", m: "Divide by the two quantities you know." },
      { h: "3.", m: "Give the unit: seconds, Hz or bits." }
    ] },
    { worked: { tag: "exam", title: "Find the sample rate", src: "AS June 2020 · P2 Q03.2 · 2 marks",
      q: "A sound takes up 34.56 MB of storage space, lasts 360 seconds and was recorded with a sample resolution of 16 bits. Calculate the sample rate in samples per second (Hertz), showing working.",
      steps: [{ m: "34.56 × 1000 × 1000 × 8 = 276 480 000 bits; ÷ 16 ÷ 360", mk: "1 mark" }, { m: "= **48 000 Hz**", mk: "1 mark", n: "NE. \"48\". A. 48 kHz." }], result: "48 000 Hz" } },
    { worked: { tag: "exam", title: "Find the duration", src: "AS June 2024 · P2 Q03.4 · 3 marks",
      q: "A sound is recorded with a sample rate of 96 000 Hz and a sample resolution of 24 bits. The file size is 12 096 kilobytes. Calculate the duration of the recording, showing all your working.",
      steps: [
        { m: "12 096 × 1000 × 8 = 96 768 000 bits", mk: "1 mark" },
        { m: "÷ (96 000 × 24 = 2 304 000)", mk: "1 mark" },
        { m: "= **42 seconds**", mk: "1 mark", n: "2 marks for 42 without a unit." }
      ], result: "42 s" } },
    { worked: { tag: "exam", title: "Duration from 17.199 MB", src: "A-level June 2022 · P2 Q10.1 · 3 marks",
      q: "A recording uses a sampling rate of 44 100 Hz and 16-bit resolution; the file is 17.199 megabytes. Calculate the duration in seconds, showing your working.",
      steps: [
        { m: "17.199 × 1 000 000 × 8 = 137 592 000 bits", mk: "1 mark" },
        { m: "÷ 44 100 ÷ 16", mk: "1 mark" },
        { m: "= **195 seconds**", mk: "1 mark", n: "A. 3 minutes 15 seconds." }
      ], result: "195 s" } },
    { worked: { tag: "exam", title: "Find the sample resolution", src: "A-level June 2025 · P2 Q02.1 · 2 marks",
      q: "A sound file of 1.5 megabytes has a duration of 50 seconds and was recorded at 20 000 samples per second. Calculate the sample resolution used.",
      steps: [{ m: "1.5 × 1000 × 1000 × 8 = 50 × 20 000 × resolution", mk: "1 mark" }, { m: "12 000 000 ÷ 1 000 000 = **12 bits**", mk: "1 mark" }], result: "12 bits" } },
    { worked: { tag: "exam", title: "More levels from two more bits", src: "AS June 2019 · P2 Q04.1 · 1 mark",
      q: "Sampling with an 8-bit sample resolution approximates each sample to one of 256 levels. If the resolution is increased to 10 bits, how many more levels are available?",
      steps: [{ m: "2¹⁰ − 2⁸ = 1024 − 256 = **768**", mk: "1 mark" }], result: "768" } },

    { page: "Nyquist's theorem" },
    { callout: { t: "def", h: "Nyquist's theorem", body: "To reproduce a signal accurately, you must sample at a rate that is **at least double the highest frequency** (component) in the original signal. Sampling more slowly loses the higher frequencies (they are aliased)." } },
    { fig: { x: [0, 10], y: [-1.4, 1.4], w: 520, h: 210, axes: { x: "time", y: "", xt: [], yt: [] },
      items: (function () {
        var it = [{ fn: "sin(x*5.03)", from: 0, to: 10, c: "accent", w: 1.8 }, { fn: "sin(x*0.6)", from: 0, to: 10, c: "accent2", w: 2.4, dash: "6 4" }];
        for (var k = 0; k <= 8; k++) { var t = k * 1.25; it.push({ pt: [t, Math.sin(t * 5.03)], r: 4, c: "accent2" }); }
        it.push({ text: [7.2, 1.25], t: "samples too sparse → a false slow wave", c: "accent2", b: true, size: 11.5 });
        return it;
      })(), cap: "Sampled below twice its frequency, a fast wave (pink) is mistaken for a slow one (dashed gold): the high frequency is lost." } },
    { worked: { tag: "exam", title: "State Nyquist's theorem", src: "AS June 2020 · P2 Q03.3 · 2 marks",
      q: "State Nyquist's theorem.",
      steps: [{ m: "You must sample at a rate that is at least double;", mk: "1 mark" }, { m: "the highest frequency (component) in the original sound;", mk: "1 mark" }], result: "At least twice the highest frequency" } },
    { worked: { tag: "exam", title: "Why 20 000 Hz is not enough", src: "A-level June 2017 · P2 Q08.2 · 2 marks",
      q: "The highest frequency component in the sound being sampled is 14 500 Hz. The sample rate of 20 000 Hz is not high enough to enable a faithful reproduction. Explain why, justifying your response.",
      steps: [
        { m: "By Nyquist's theorem the sample rate must be at least twice the highest frequency in the signal;", mk: "1 mark" },
        { m: "20 000 is less than double 14 500 — it would need at least 29 000 Hz (components over 10 000 Hz are not reproduced faithfully);", mk: "1 mark" }
      ], result: "Needs ≥ 29 000 Hz" } },
    { worked: { tag: "exam", title: "Minimum rate for 1200 Hz", src: "A-level June 2018 · P2 Q11.4 · 1 mark",
      q: "The highest frequency present in a signal's waveform is 1200 Hz. What is the minimum sample rate that preserves all of the frequencies?",
      steps: [{ m: "2 × 1200 = **2400 Hz**", mk: "1 mark" }], result: "2400 Hz" } },
    { worked: { tag: "exam", title: "Minimum rate for 15 000 Hz", src: "A-level June 2023 · P2 Q01.2 · 1 mark",
      q: "The highest frequency component in a sound is 15 000 Hz. What is the minimum sampling rate that ensures all the frequencies are preserved?",
      steps: [{ m: "**30 000 Hz**", mk: "1 mark" }], result: "30 000 Hz" } },
    { worked: { tag: "exam", title: "Nyquist backwards", src: "AS June 2025 · P2 Q04.3 · 1 mark",
      q: "A particular analogue sound must be sampled at a rate of at least 2200 Hz to be accurately represented. State the highest frequency present in the sound.",
      steps: [{ m: "2200 ÷ 2 = **1100 Hz**", mk: "1 mark" }], result: "1100 Hz" } },

    { page: "Quality" },
    { table: { head: ["Increase …", "Effect", "Cost"], rows: [
      ["sampling rate", "more samples per second — higher frequencies captured (Nyquist), better time detail", "file size grows proportionally"],
      ["sample resolution", "more amplitude levels — **reduced quantisation error**, more accurate samples, greater dynamic range", "file size grows proportionally"]
    ] } },
    { worked: { tag: "exam", title: "Why 24 bits beats 16 bits", src: "AS June 2024 · P2 Q03.5 · 1 mark",
      q: "A sample resolution of 16 bits is commonly used in audio recordings. Explain why increasing it from 16 bits to 24 bits can improve the quality of an audio recording.",
      steps: [{ m: "There is reduced quantisation error — each sample can be represented more accurately (2²⁴ instead of 2¹⁶ levels).", mk: "1 mark", n: "NE. \"improved sound quality\". R. references to more samples / sample rate." }], result: "Smaller quantisation error" } },
    { worked: { tag: "exam", title: "The gap between A and B", src: "A-level June 2018 · P2 Q11.3 · 2 marks",
      q: "Point A is the waveform's true amplitude at a sample point and B the value recorded (the nearest of 16 divisions). Explain the impact of the difference between A and B and how it could be reduced by redesigning the sampling system.",
      steps: [
        { h: "Impact", m: "It will not be possible to reproduce the original signal completely accurately;", mk: "1 mark", n: "NE. \"error\" without its effect." },
        { h: "Reduce it", m: "increase the sample resolution — use more bits for each sample;", mk: "1 mark", n: "TO. mentioning the sample rate as well." }
      ], result: "Inaccurate reproduction; more bits per sample" } },
    { worked: { tag: "exam", title: "Why a recording may not match the original", src: "A-level June 2025 · P2 Q02.3 · 2 marks",
      q: "Explain one reason why a digital sound file recorded using sampling may not accurately represent the original analogue signal produced by the microphone.",
      steps: [
        { m: "The sample resolution is too low — not enough bits to represent each sample;", mk: "1 mark" },
        { m: "so each amplitude is rounded when converted to binary (quantisation error) — the recorded amplitude differs from the actual one;", mk: "1 mark", n: "Alternatives: sampling rate below Nyquist (amplitudes between samples interpolated); or lossy compression removed frequency components. Marks come from ONE alternative." }
      ], result: "e.g. too few bits → quantisation error" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is meant by (rate/resolution)", "Samples per second; bits per sample."],
      ["Calculate", "rate × resolution × seconds, then the unit conversion — every step written."],
      ["State Nyquist", "\"at least double\" + \"the highest frequency in the original\"."],
      ["Explain (quality)", "Name the cause and its effect: resolution → quantisation error; rate → Nyquist."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Rate × Res × Seconds\"", body: "And Nyquist: \"twice the top\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Confusing rate (per second) with resolution (bits per sample).", "Minutes not converted to seconds.", "Using 1024 for MB.", "Halving instead of doubling for Nyquist."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.3 the ADC that samples; 4.5.6.8 MIDI avoids sampling; 4.5.6.9 lossy compression of audio; 4.5.3.2 units; 4.5.4.5 quantisation is rounding error." } }
  ],
  flashcards: [
    ["Sampling rate?", "Number of samples taken per second (Hz)."],
    ["Sample resolution?", "Number of bits used to store each sample."],
    ["Sound file size?", "rate × resolution × duration (bits)."],
    ["Minimum rate for 15 kHz?", "30 000 Hz.", 4],
    ["3 min, 16-bit, 44 kHz in MB?", "15.84 MB.", 5],
    ["Why does more resolution help?", "Less quantisation error — samples stored more accurately.", 6],
    ["Effect of too low a sample rate?", "High frequencies are lost / not reproduced.", 7],
    ["8 → 10 bits: extra levels?", "768.", 8],
    ["What is quantisation error?", "The difference between the true amplitude and the stored level.", 9]
  ],
  quiz: [
    { q: "30 s at 20 000 Hz, 16-bit, in kB is", opts: ["1200", "9600", "600", "1171"], ans: 0, why: "30 × 16 × 20 000 ÷ 8000." },
    { q: "Nyquist: highest frequency 8 kHz needs at least", opts: ["16 kHz", "8 kHz", "4 kHz", "44.1 kHz"], ans: 0, why: "Double." },
    { q: "Raising sample resolution reduces", opts: ["quantisation error", "file size", "the sample rate", "the number of samples"], ans: 0, why: "More levels." },
    { q: "12 096 kB at 96 kHz, 24-bit lasts", opts: ["42 s", "4.2 s", "420 s", "5 s"], ans: 0, why: "96 768 000 ÷ 2 304 000." }
  ]
};

/* =====================================================================
   4.5.6.8  Musical Instrument Digital Interface (MIDI)
   ===================================================================== */
C["compsci:4.5.6.8"] = {
  notes: [
    { h: "MIDI — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.6.8)", body: ["Describe the purpose of **MIDI** and the use of **event messages** in MIDI.", "Describe the **advantages of using MIDI files** for representing music."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How MIDI represents music", "Describe / Explain", "2", "AS 2024 Q03.6, A-level 2021 Q12"],
      ["Advantages of MIDI over sampled sound", "State / Describe", "1–3", "AS 2018 Q03.2, AS 2023 Q05.5, AS 2024 Q03.7, A-level 2022 Q10.2"],
      ["Representation AND advantages", "Explain", "4", "A-level 2017 Q08.3"],
      ["Why a MIDI file needs less storage", "Explain", "2", "A-level 2025 Q02.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Event messages**.", "**MIDI vs sampled sound**.", "**Exam toolkit**."] },

    { page: "Event messages" },
    { callout: { t: "def", h: "MIDI", body: "**Musical Instrument Digital Interface**: a standard that lets musical devices and computers communicate. Music is represented **not as samples of the sound** but as a **sequence of event messages** (instructions) describing what the musician did — which note started or stopped, how hard, on which instrument. A synthesiser plays them back using stored sounds." } },
    { fig: { w: 540, h: 170, items: [].concat(
      [{ text: [90, 18], t: "status byte", b: true, c: "accent2", size: 12 }], row(20, 30, 17.5, 34, "1001".split(""), "accent2", { b: true }), row(90, 30, 17.5, 34, "0000".split(""), "accent2"),
      [{ text: [90, 80], t: "command 1001: note on", c: "accent2", size: 11 }, { text: [90, 96], t: "channel 0000: channel 1", c: "accent2", size: 11 }],
      [{ text: [270, 18], t: "data byte 1", b: true, c: "accent", size: 12 }], row(200, 30, 17.5, 34, "00111100".split(""), "accent"), [{ text: [270, 80], t: "note number 60 (middle C)", c: "accent", size: 11 }],
      [{ text: [430, 18], t: "data byte 2", b: true, c: "accent3", size: 12 }], row(360, 30, 17.5, 34, "01100100".split(""), "accent3"), [{ text: [430, 80], t: "velocity 100", c: "accent3", size: 11 }],
      [{ text: [270, 132], t: "a status byte starts with 1, data bytes with 0; 16 channels (4 bits); 31 250 bits per second", c: "text2", size: 11.5 }]
    ), cap: "One MIDI message, three bytes: \"note on, channel 1, middle C, velocity 100\". A later \"note off\" message ends the note." } },
    { kv: [
      ["Data a message may carry", "channel; note on / note off; pitch (note number); velocity / volume; duration; instrument (program change); key pressure (aftertouch); pedal effects; pitch bend; timbre; note envelope"],
      ["Message format", "usually 2 or 3 bytes; the first is a **status byte** (MSB 1: a 4-bit command + a 4-bit channel), the rest **data bytes** (MSB 0)"],
      ["Playback", "the combination of event messages in a specified order; the sound of each note comes from a library (sound bank) in the synthesiser"]
    ] },
    { worked: { tag: "exam", title: "How MIDI represents music", src: "AS June 2024 · P2 Q03.6 · 2 marks",
      q: "MIDI does not use sampling to represent music. Describe how music is represented using MIDI.",
      steps: [
        { m: "Music is represented as a sequence of MIDI event messages (instructions), played back in a specified order;", mk: "1 mark", n: "R. \"a sequence of notes\" (NE. at AS) — say messages/events." },
        { m: "each message contains data such as note on/off, pitch (note number), velocity, the instrument or the channel;", mk: "1 mark" }
      ], result: "A sequence of event messages" } },

    { page: "MIDI vs sampled sound" },
    { table: { head: ["", "MIDI", "Sampled sound"], rows: [
      ["Stores", "event messages — what was played", "samples of the sound wave — what was heard"],
      ["File size", "**much smaller** (a few bytes per note)", "large (rate × resolution × duration)"],
      ["Editing", "**easy to edit individual notes**, change tempo, transpose a whole score, change instruments", "editing individual notes is very hard"],
      ["Quality", "no sampling error or background noise; depends on the synthesiser's sounds", "captures the real performance, voice and room"],
      ["Can represent", "notes from instruments", "**any sound** — speech, singing, sound effects"],
      ["Other uses", "a score can be generated directly; files can control instruments; algorithmic composition", "—"]
    ] } },
    { worked: { tag: "exam", title: "Two advantages of MIDI", src: "AS June 2023 · P2 Q05.5 · 2 marks",
      q: "An alternative to using sampled sound is MIDI. State two advantages of using MIDI instead of sampled sound.",
      steps: [
        { m: "More compact representation (smaller files);", mk: "1 mark", n: "NE. \"requires less space\" — say it is a more compact representation." },
        { m: "easy to modify/edit individual notes, or change instruments or the octave of the entire score;", mk: "1 mark", n: "Others: simple to compose algorithmically; a score can be generated directly; no data lost through sampling; can directly control a device." }
      ], result: "Compact; easy to edit" } },
    { worked: { tag: "exam", title: "Represent, then advantages (4 marks)", src: "A-level June 2017 · P2 Q08.3 · 4 marks",
      q: "MIDI is a system that enables musical devices to communicate and to represent music on a computer. Explain how MIDI represents music and the advantages of using MIDI instead of sampled sound.",
      steps: [
        { h: "Representation (AO1 knowledge, MAX 2)", m: "Music is represented as a sequence of MIDI event messages;", mk: "1 mark" },
        { m: "e.g. a message holds note on/off, pitch, velocity and channel; messages are 2–3 bytes, the first a status byte;", mk: "1 mark" },
        { h: "Advantages (AO1 understanding, MAX 2)", m: "more compact representation;", mk: "1 mark" },
        { m: "easy to edit notes / change instruments; no data lost through sampling;", mk: "1 mark" }
      ], result: "Event messages; compact and editable" } },
    { worked: { tag: "exam", title: "Why MIDI files are smaller", src: "A-level June 2025 · P2 Q02.4 · 2 marks",
      q: "One advantage of representing music using MIDI instead of as sampled sound is that the file requires less storage space. Explain why.",
      steps: [
        { m: "MIDI stores information about the events (notes) the music is composed of, not the sound wave;", mk: "1 mark" },
        { m: "a piece has far fewer events than the number of samples needed to record it — a note may last a second, when thousands of samples are taken every second (and the detailed sound of each note is stored once, in libraries);", mk: "1 mark" }
      ], result: "Few events vs thousands of samples per second" } },
    { worked: { tag: "exam", title: "Advantages, described (3 marks)", src: "A-level June 2022 · P2 Q10.2 · 3 marks",
      q: "Describe the advantages of using MIDI to represent music instead of using sampled sound.",
      steps: [
        { m: "More compact representation;", mk: "1 mark" },
        { m: "easy to modify/edit at note level — change the octave of an entire score or change instruments;", mk: "1 mark" },
        { m: "no data is lost through sampling (no sampling error or background noise) // a musical score can be generated directly from the file;", mk: "1 mark" }
      ], result: "Compact; editable; no sampling loss" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe how MIDI represents music", "Event messages (not notes) + an example of message data."],
      ["State advantages", "Compact; easy to edit; change instruments; algorithmic composition; score generation; no sampling loss."],
      ["Explain why smaller", "Events vs samples — far fewer events."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"MIDI records the musician, not the sound\"", body: "What was played (events), not what was heard (samples)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"A sequence of notes\" (R./NE.) — messages or events.", "\"Requires less space\" (NE.) — \"more compact representation\".", "Claiming MIDI can record a voice."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.7 sampled sound for comparison; 4.9.1.1 MIDI is a serial protocol (31 250 bit/s); 4.5.3.1 bytes and bit fields." } }
  ],
  flashcards: [
    ["What does MIDI stand for?", "Musical Instrument Digital Interface."],
    ["Data in a MIDI message?", "e.g. note on/off, pitch, velocity, channel, instrument.", 2],
    ["Status byte vs data byte?", "Status byte MSB 1 (command + channel); data bytes MSB 0.", 3],
    ["Two advantages of MIDI?", "More compact; easy to edit notes/instruments.", 4],
    ["What can sampled sound do that MIDI cannot?", "Represent any sound, e.g. speech or a voice.", 6],
    ["How many MIDI channels?", "16.", 7]
  ],
  quiz: [
    { q: "MIDI represents music as", opts: ["event messages", "samples", "a waveform", "pixels"], ans: 0, why: "Definition." },
    { q: "An advantage of MIDI is", opts: ["easy to change instruments", "it records speech", "it uses sampling", "it is analogue"], ans: 0, why: "Messages name the instrument." },
    { q: "A MIDI status byte begins with", opts: ["1", "0", "the note", "the velocity"], ans: 0, why: "MSB 1." },
    { q: "MIDI cannot represent", opts: ["a recorded voice", "a piano part", "a change of tempo", "a note's velocity"], ans: 0, why: "No samples." }
  ]
};

/* =====================================================================
   4.5.6.9  Data compression
   ===================================================================== */
C["compsci:4.5.6.9"] = {
  notes: [
    { h: "Data compression — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.6.9)", body: ["Know why images and sound files are often **compressed** and that other files, such as text files, can also be compressed.", "Understand the difference between **lossless** and **lossy** compression and explain the advantages and disadvantages of each.", "Explain the principles behind **run length encoding (RLE)** and **dictionary-based** methods."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Why compress? (one / two reasons)", "State / Explain", "1–2", "AS 2020 Q09.1, AS 2025 Q05.1, A-level 2025 Q10.1"],
      ["Lossless vs lossy: key difference / an advantage", "Explain / Describe", "1–2", "AS 2017 Q03.3, AS 2020 Q09.2, A-level 2019 Q03.1"],
      ["A problem caused by lossy compression", "Describe", "2", "AS 2023 Q05.4"],
      ["Describe RLE for an image / a row", "Describe", "2", "AS 2016 Q06.4, A-level 2018 Q02.3"],
      ["Write the RLE of some data", "State", "1", "AS 2025 Q05.2"],
      ["Memory before and after RLE; comment on its effectiveness", "Calculate / Comment", "1 + 1", "A-level 2024 Q02.4–02.5"],
      ["Why RLE failed on a photograph", "Explain", "2", "A-level 2018 Q02.4"],
      ["Describe dictionary-based compression", "Explain", "2–3", "AS 2020 Q09.3, A-level 2019 Q03.2"],
      ["Why dictionary methods are poor for short text", "Explain", "1", "A-level 2019 Q03.3"],
      ["RLE for images, dictionary for text — why", "Explain", "2", "A-level 2025 Q10.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Why compress; lossless vs lossy**.", "**Run length encoding**.", "**Dictionary-based compression**.", "**Choosing a method**.", "**Exam toolkit**."] },

    { page: "Why compress; lossless vs lossy" },
    { callout: { t: "memorise", h: "Reasons to compress", body: "**Less storage space** (more files fit on a device); **faster transmission** / less bandwidth (cheaper on a metered connection); to fit **size limits** (e.g. email attachments)." } },
    { table: { head: ["", "Lossless", "Lossy"], rows: [
      ["What happens", "no data is lost: only redundancy is removed", "**data is permanently removed** — less important detail (sounds outside hearing, fine colour detail)"],
      ["Reversible?", "**yes** — the original can be **reproduced exactly**", "**no** — the original cannot be recovered"],
      ["Compression", "smaller reduction", "much greater reduction"],
      ["Methods", "RLE, dictionary-based (LZW, ZIP), PNG, FLAC", "JPEG, MP3, AAC, video codecs"],
      ["Use when", "text, program code, data, master recordings, anything that must be exact or edited later", "photos, music and video for streaming or sharing where some quality loss is acceptable"]
    ] } },
    { worked: { tag: "exam", title: "Why lossless for the band's song?", src: "AS June 2017 · P2 Q03.3 · 2 marks",
      q: "A band have been advised to save their song using lossless compression. Explain why it might be appropriate to use lossless compression rather than lossy compression.",
      steps: [
        { h: "AO1 knowledge", m: "No data (only redundant data) is lost during lossless compression — lossy compression loses data;", mk: "1 mark" },
        { h: "AO1 understanding", m: "so the song can be reproduced identically to the recorded original, with no loss of quality — a lossy copy may limit later editing;", mk: "1 mark", n: "NE. \"music will be of higher quality\"." }
      ], result: "Exact reproduction; editing preserved" } },
    { worked: { tag: "exam", title: "The key difference", src: "A-level June 2019 · P2 Q03.1 · 1 mark",
      q: "Dictionary-based compression is an example of a lossless method. Explain the key difference between lossless and lossy compression methods.",
      steps: [{ m: "The original data can be fully recovered after lossless compression (it can be reversed), whereas lossy compression cannot be reversed — data is permanently removed.", mk: "1 mark", n: "NE. \"no data is lost\" / \"no loss of quality\" on their own." }], result: "Lossless is reversible; lossy is not" } },
    { worked: { tag: "exam", title: "A problem caused by lossy compression", src: "AS June 2023 · P2 Q05.4 · 2 marks",
      q: "A sampled sound could be compressed using lossy compression. Describe a problem that may occur if lossy compression is used and how the compression method has caused this.",
      steps: [
        { h: "How (AO1 knowledge)", m: "Data is discarded when the sound is stored in a lossy format;", mk: "1 mark" },
        { h: "Problem (AO1 understanding)", m: "so the reproduced sound will not be as good as the original sampled sound, and the quality may limit later editing;", mk: "1 mark" }
      ], result: "Discarded data → lower quality" } },
    { worked: { tag: "exam", title: "Two reasons to compress", src: "A-level June 2025 · P2 Q10.1 · 2 marks",
      q: "State two reasons why data is often compressed.",
      steps: [{ m: "Less storage space is required (more files fit on a device);", mk: "1 mark", n: "NE. \"less space\" — say storage." }, { m: "data can be transmitted more quickly / with less bandwidth;", mk: "1 mark" }], result: "Storage; transmission time" } },

    { page: "Run length encoding" },
    { callout: { t: "def", h: "Run length encoding (RLE)", body: "A **lossless** method that replaces each **run** — a sequence of consecutive identical values (e.g. pixels of the same colour) — by a **pair: the run length (count) and the value**." } },
    { fig: { w: 540, h: 140, items: [].concat(
      row(20, 20, 26, 34, "BBGGGRRRRW".split(""), "accent", { b: true }),
      [{ line: [[150, 64], [150, 84]], arrow: true, c: "accent2", w: 2 }],
      row(20, 90, 50, 34, ["B 2", "G 3", "R 4", "W 1"], "accent2", { b: true }),
      [{ text: [380, 37], t: "10 characters", c: "text2", size: 12 }, { text: [380, 107], t: "4 pairs = 8 values", c: "accent2", b: true, size: 12 }]
    ), cap: "AS June 2025: BBGGGRRRRW → (B, 2) (G, 3) (R, 4) (W, 1). Only runs longer than 2 actually save space." } },
    { worked: { tag: "exam", title: "State the RLE", src: "AS June 2025 · P2 Q05.2 · 1 mark",
      q: "Run length encoding (RLE) can be used to compress data. State the RLE for the data BBGGGRRRRW.",
      steps: [{ m: "**(B, 2) (G, 3) (R, 4) (W, 1)**", mk: "1 mark", n: "A. the count and value either way round if consistent; I. brackets and commas (B2 G3 R4 W1)." }], result: "B2 G3 R4 W1" } },
    { worked: { tag: "exam", title: "Describe RLE for an image", src: "AS June 2016 · P2 Q06.4 · 2 marks",
      q: "Image files are often compressed so they take up less storage space. Describe how run length encoding (RLE) could be used to compress a bitmap image.",
      steps: [
        { m: "Store the colour of a pixel and a count;", mk: "1 mark" },
        { m: "the count is the number of consecutive pixels of that colour (the length of the run) before a pixel of a different colour;", mk: "1 mark" }
      ], result: "(colour, count) per run" } },
    { worked: { tag: "exam", title: "RLE on a row of pixels", src: "A-level June 2018 · P2 Q02.3 · 2 marks",
      q: "A row of pixels from a 4-colour bitmap is 7 yellow, 4 blue, then 9 yellow. Describe how this row could be represented in compressed form by run length encoding.",
      steps: [
        { m: "A run is a sequence of consecutive pixels of the same colour — count the pixels in each run;", mk: "1 mark" },
        { m: "store pairs of values, each a run length and the colour: 7 Yellow, 4 Blue, 9 Yellow;", mk: "1 mark" }
      ], result: "7Y 4B 9Y" } },
    { worked: { tag: "exam", title: "Before and after RLE — and why it got bigger", src: "A-level June 2024 · P2 Q02.4–02.5 · 2 marks",
      q: "A 20-pixel row of an image, one byte per pixel colour, is: 24, 24, 24, 253, 254, 255, 76, 76, 76, 80, 82, 0, 0, 9, 223, 223, 224, 220, 76, 76. RLE stores each run length in one byte and each colour in one byte (the first four pixels encode as 3, 24, 1, 253). (a) Calculate the memory in bytes before and after RLE. (b) Comment on the effectiveness of RLE for this row and explain why.",
      steps: [
        { h: "(a) Count the runs", m: "3×24, 1×253, 1×254, 1×255, 3×76, 1×80, 1×82, 2×0, 1×9, 2×223, 1×224, 1×220, 2×76 → 13 runs" },
        { m: "Before **20** bytes; after 13 × 2 = **26** bytes", mk: "1 mark", n: "Both values needed." },
        { h: "(b)", m: "RLE was not effective — the memory needed increased — because the runs are very short (most have length 1; the colours vary a lot).", mk: "1 mark" }
      ], result: "20 → 26 bytes: RLE made it bigger" } },
    { worked: { tag: "exam", title: "Why RLE could not shrink the woodland photo", src: "A-level June 2018 · P2 Q02.4 · 2 marks",
      q: "A simple 4-colour image compresses by 80% with RLE, but a photograph of a woodland scene compresses to about its original size with the same technique. Explain why.",
      steps: [
        { m: "The photograph contains many more different colours, so its runs are much shorter;", mk: "1 mark" },
        { m: "for short runs, the extra run-length data cancels out (or outweighs) the saving on pixel colour data;", mk: "1 mark" }
      ], result: "Short runs: the counts cost as much as they save" } },

    { page: "Dictionary-based compression" },
    { callout: { t: "def", h: "Dictionary-based compression", body: "A **lossless** method that builds a **dictionary (table)** mapping repeated **sequences of characters / words** to short **tokens** (index numbers), then **replaces each occurrence** in the data with its token. The dictionary is stored or sent with the compressed data (or rebuilt, as in LZW)." } },
    { fig: { w: 540, h: 170, items: [].concat(
      [{ text: [120, 16], t: "dictionary", b: true, c: "accent2", size: 12 }],
      cell(30, 26, 40, 26, "0", "accent2", { b: true }), cell(70, 26, 140, 26, "commenting", null),
      cell(30, 52, 40, 26, "1", "accent2", { b: true }), cell(70, 52, 140, 26, "effort", null),
      cell(30, 78, 40, 26, "2", "accent2", { b: true }), cell(70, 78, 140, 26, "time", null),
      cell(30, 104, 40, 26, "3", "accent2", { b: true }), cell(70, 104, 140, 26, "code", null),
      [{ text: [380, 40], t: "\"Effort put into commenting could", c: "text2", size: 11.5 }, { text: [380, 58], t: "make the code easier to maintain\"", c: "text2", size: 11.5 },
        { line: [[380, 70], [380, 92]], arrow: true, c: "accent2", w: 2 },
        { text: [380, 108], t: "\"1 put into 0 could make the 3", c: "accent2", b: true, size: 11.5 }, { text: [380, 126], t: "easier to maintain\"", c: "accent2", b: true, size: 11.5 }]
    ), cap: "A-level June 2019: repeated words become tokens; the text stores tokens, the dictionary stores each word once." } },
    { worked: { tag: "exam", title: "Compress the paragraph with a dictionary", src: "A-level June 2019 · P2 Q03.2 · 2 marks",
      q: "A paragraph of text (in which words such as \"time\", \"effort\", \"commenting\" and \"code\" repeat) is to be compressed using a dictionary-based method. Explain how it could be compressed.",
      steps: [
        { m: "A dictionary is built that maps sequences of characters / words in the text onto tokens (numbers);", mk: "1 mark" },
        { m: "each occurrence of those words in the text is then replaced by the corresponding token from the dictionary;", mk: "1 mark", n: "TO. storing words with their frequencies/positions." }
      ], result: "Build word→token dictionary; replace words by tokens" } },
    { worked: { tag: "exam", title: "Why not for small text?", src: "A-level June 2019 · P2 Q03.3 · 1 mark",
      q: "After compression the text is to be transmitted across a network. Explain why dictionary-based compression is not very effective for compressing small amounts of text for transmission.",
      steps: [{ m: "Small pieces of text have little repetition, so the compressed text is similar in size — and the dictionary itself must also be transmitted.", mk: "1 mark" }], result: "Little repetition; the dictionary must be sent" } },
    { worked: { tag: "exam", title: "Explain dictionary-based compression (3 marks)", src: "AS June 2020 · P2 Q09.3 · 3 marks",
      q: "Explain how data can be compressed using dictionary-based compression.",
      steps: [
        { m: "Variable-length strings of symbols / substrings of the original data are represented by single tokens;", mk: "1 mark" },
        { m: "a table / dictionary is formed using the tokens as the keys (indexes);", mk: "1 mark" },
        { m: "the strings of symbols are the entries — the data stores tokens, which are looked up to decompress;", mk: "1 mark", n: "Alternative (LZ77): a sliding window of previous data; length–distance pairs pointing back to an earlier copy." }
      ], result: "Tokens replace repeated strings via a dictionary" } },

    { page: "Choosing a method" },
    { worked: { tag: "exam", title: "RLE for images, dictionary for text", src: "A-level June 2025 · P2 Q10.2 · 2 marks",
      q: "Two methods of compressing data are RLE and dictionary-based methods. Explain why RLE is more suitable for compressing images and dictionary-based methods are more suitable for compressing text.",
      steps: [
        { h: "RLE for images", m: "In many images adjacent pixels are likely to be the same colour, giving long runs;", mk: "1 mark", n: "NE. \"adjacent values are likely to be the same\" — say pixels/colours." },
        { h: "Dictionary for text", m: "repetition in text is of words / groups of characters spread throughout it — rarely identical adjacent characters, so RLE finds few runs;", mk: "1 mark" }
      ], result: "Images have runs; text repeats words" } },
    { table: { head: ["Data", "Best approach", "Why"], rows: [
      ["Cartoon, logo, screenshot (bitmap)", "RLE / PNG (lossless)", "long runs of identical pixels"],
      ["Photograph", "JPEG (lossy)", "few runs; fine detail can be discarded"],
      ["Text, code, data", "dictionary-based (ZIP) (lossless)", "repeated words; must be exact"],
      ["Music for streaming", "MP3/AAC (lossy)", "inaudible detail removed for huge savings"],
      ["Master recording", "FLAC (lossless)", "must be reproduced exactly for editing"]
    ] } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain lossless vs lossy", "Reversible / original recovered vs irreversible / data removed — and the consequence."],
      ["Describe RLE", "Runs of the same value; stored as (count, value) pairs; an example from the data."],
      ["Explain dictionary-based", "Dictionary maps repeated strings to tokens; tokens replace the strings."],
      ["Calculate (before/after)", "Count the runs; × bytes per pair."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"RLE = Runs; Dictionary = Duplicates\"", body: "RLE needs runs of identical neighbours; dictionary methods need repeated sequences anywhere." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"No data is lost\" alone (NE.) — say the original can be fully recovered.", "Describing RLE without saying the count is of consecutive values.", "Forgetting the dictionary itself takes space.", "Calling dictionary compression lossy."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.4 bitmap sizes; 4.5.6.7 sound sizes; 4.2 hash tables / dictionaries as data structures; 4.8 lossy compression of personal recordings (AS 2022 Q11 essay)." } }
  ],
  flashcards: [
    ["Two reasons to compress?", "Less storage; faster transmission."],
    ["Lossless compression?", "Removes redundancy only — the original can be reproduced exactly."],
    ["Lossy compression?", "Permanently removes data — cannot be reversed; greater reduction."],
    ["RLE?", "Replaces runs of identical values with (count, value) pairs."],
    ["RLE of BBGGGRRRRW?", "B2 G3 R4 W1."],
    ["When does RLE make files bigger?", "When runs are short (e.g. photographs)."],
    ["Dictionary-based compression?", "Repeated strings mapped to tokens in a dictionary; tokens replace them."],
    ["Why is dictionary compression poor for short text?", "Little repetition; the dictionary must also be stored/sent."],
    ["Why RLE suits images?", "Adjacent pixels are often the same colour."],
    ["Example of lossy formats?", "JPEG, MP3."]
  ],
  quiz: [
    { q: "Which method is lossy?", opts: ["JPEG", "RLE", "dictionary-based", "ZIP"], ans: 0, why: "Discards detail." },
    { q: "AAAABBBCCD in RLE is", opts: ["A4 B3 C2 D1", "4A3B", "ABCD", "A4B3C2"], ans: 0, why: "Every run, including the last." },
    { q: "RLE works worst on", opts: ["a photograph", "a cartoon", "a black-and-white diagram", "a screenshot"], ans: 0, why: "Short runs." },
    { q: "Lossless compression is required for", opts: ["a program's source code", "a streamed song", "a web photo", "a video call"], ans: 0, why: "Must be exact." },
    { q: "A dictionary method replaces repeated words with", opts: ["tokens", "runs", "pixels", "hashes only"], ans: 0, why: "Index into the dictionary." }
  ]
};

/* =====================================================================
   4.5.6.10  Encryption
   ===================================================================== */
C["compsci:4.5.6.10"] = {
  notes: [
    { h: "Encryption — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.5.6.10)", body: ["Understand what is meant by **encryption** and be able to define it.", "Be familiar with the terms **cipher, plaintext, ciphertext**.", "Describe how the **Caesar cipher** and the **Vernam cipher** (one-time pad) work and compare them.", "Explain why the Vernam cipher is **perfectly secure**.", "Understand that ciphers other than Vernam are **computationally secure** but crackable."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is encryption?", "Define / What is", "1", "AS 2018 Q04.1"],
      ["Caesar: encrypt or decrypt a word", "Encrypt / Decrypt / What is the plaintext", "1", "A-level 2017 Q02.1, 2023 Q03.1, AS 2024 Q04.1"],
      ["Why Caesar ciphers are easily cracked", "Explain two reasons / State one weakness", "1–2", "AS 2024 Q04.2, A-level 2023 Q03.2–03.3"],
      ["Vernam: encrypt / decrypt with XOR", "Show your working", "3", "AS 2018 Q04.3, AS 2022 Q04.5, A-level 2019 Q14.1"],
      ["Conditions for perfect security; why perfectly secure", "State / Explain", "1–2", "A-level 2017 Q02.2, 2023 Q03.4, AS 2020 Q07.3"],
      ["Why Vernam is better than Caesar", "Explain", "2", "AS 2018 Q04.2"],
      ["Computational security; the key exchange problem", "Explain", "1–2", "A-level 2019 Q14.2–14.3"],
      ["Symmetric vs asymmetric", "Explain", "1", "A-level 2017 Q02.3"],
      ["Caesar / Vernam in assembly language; fix a Caesar algorithm", "Write / Explain", "3–4", "AS 2020 Q07.1, A-level 2018 Q12.1, 2020 Q09.3–09.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Vocabulary**.", "**The Caesar cipher**.", "**The Vernam cipher**.", "**Security**.", "**Ciphers in code**.", "**Exam toolkit**."] },

    { page: "Vocabulary" },
    { kv: [
      ["Encryption", "**using an algorithm (cipher) and a key to convert a message (plaintext) into a form that is not understandable** without the key (ciphertext)"],
      ["Decryption", "the reverse: converting ciphertext back into plaintext using the key"],
      ["Cipher", "the algorithm used to encrypt and decrypt"],
      ["Plaintext / ciphertext", "the original readable message / the encrypted, unreadable message"],
      ["Key", "the value that controls the cipher (a shift, a one-time pad)"],
      ["Symmetric", "the **same key** encrypts and decrypts (Caesar, Vernam)"],
      ["Asymmetric", "**different but related keys** (public and private) encrypt and decrypt — see 4.9.3.2"]
    ] },
    { worked: { tag: "exam", title: "What is encryption?", src: "AS June 2018 · P2 Q04.1 · 1 mark",
      q: "What is encryption?",
      steps: [{ m: "Using an algorithm to convert a message into a form that is not understandable without the key to decrypt it (into ciphertext).", mk: "1 mark", n: "NE. \"scrambling\" or \"coding\". R. answers that do not make clear encryption is a process." }], result: "Algorithm + key → unreadable ciphertext" } },
    { worked: { tag: "exam", title: "Symmetric vs asymmetric", src: "A-level June 2017 · P2 Q02.3 · 1 mark",
      q: "Both the Caesar and Vernam ciphers are symmetric ciphers, whereas public and private key encryption is an asymmetric system. Explain the difference between a symmetric and an asymmetric cipher system.",
      steps: [{ m: "In a symmetric system the same key is used to encrypt and decrypt; in an asymmetric system different (but related) keys are used for encryption and decryption.", mk: "1 mark", n: "NE. \"symmetric uses one key, asymmetric uses two\"." }], result: "Same key vs different related keys" } },

    { page: "The Caesar cipher" },
    { callout: { t: "def", h: "Caesar cipher", body: "A **substitution cipher** in which each letter is replaced by the letter a **fixed number of places (the key / shift)** further along the alphabet, **wrapping round** from Z to A. Decrypt by shifting back. Character codes: encrypted = (code + key) MOD 26 (with A = 0)." } },
    { fig: { w: 540, h: 120, items: (function () {
      var it = [], A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (var i = 0; i < 26; i++) {
        var x = 12 + i * 20.2;
        it = it.concat(cell(x, 18, 19, 26, A[i], null, { size: 12 }), cell(x, 70, 19, 26, A[(i + 4) % 26], "accent2", { size: 12, b: true }));
        if (i % 3 === 0) it.push({ line: [[x + 9.5, 46], [x + 9.5, 68]], arrow: true, c: "muted", w: 1 });
      }
      it.push({ text: [470, 108], t: "shift 4 (W → A wraps)", c: "accent2", b: true, size: 11.5 });
      return it;
    })(), cap: "A Caesar cipher with key 4: every letter moves four places on, wrapping round the end of the alphabet." } },
    { worked: { tag: "exam", title: "Encrypt SECURITY with key 4", src: "A-level June 2023 · P2 Q03.1 · 1 mark",
      q: "Encrypt the plaintext SECURITY using the Caesar cipher with a key of 4.",
      steps: [{ m: "S→W, E→I, C→G, U→Y, R→V, I→M, T→X, Y→C (wraps)" }, { m: "**WIGYVMXC**", mk: "1 mark" }], result: "WIGYVMXC" } },
    { worked: { tag: "exam", title: "Decrypt with shift 4", src: "AS June 2024 · P2 Q04.1 · 1 mark",
      q: "A message is encrypted using a Caesar cipher with a shift value of four (A in plaintext becomes E). The ciphertext is WSSDI. What is the plaintext?",
      steps: [{ m: "Shift each letter back 4: W→S, S→O, S→O, D→Z (wraps), I→E" }, { m: "**SOOZE**", mk: "1 mark" }], result: "SOOZE" } },
    { worked: { tag: "exam", title: "Decrypt with the wheel's setting", src: "A-level June 2017 · P2 Q02.1 · 1 mark",
      q: "With the cipher wheel settings shown, the plaintext COMPUTER encrypts to IUSVAZKX. Decrypt the ciphertext QGOZRKT using the same settings.",
      steps: [{ h: "Find the key", m: "C → I is a shift of 6" }, { m: "shift back 6: **KAITLEN**", mk: "1 mark" }], result: "KAITLEN" } },
    { worked: { tag: "exam", title: "Why Caesar ciphers are easily cracked", src: "AS June 2024 · P2 Q04.2 · 2 marks",
      q: "Explain two reasons why Caesar ciphers are vulnerable to being cracked.",
      steps: [
        { m: "There are very few possible keys (25), so every key can be tried (brute force);", mk: "1 mark" },
        { m: "each letter is always encrypted to the same letter, so letters keep their frequencies — frequency analysis reveals the mapping (and if one mapping is known, all the rest follow);", mk: "1 mark", n: "Also: the ciphertext keeps the plaintext's structure (word lengths, common short words)." }
      ], result: "Few keys; frequency analysis" } },
    { worked: { tag: "exam", title: "A weakness of all substitution ciphers; why a random one is harder", src: "A-level June 2023 · P2 Q03.2–03.3 · 2 marks",
      q: "The Caesar cipher is a substitution cipher. A different substitution cipher maps each letter to a randomly chosen letter (A→C, B→D, C→J …). (a) State one weakness both ciphers share. (b) State one reason why the random substitution is harder to crack than the Caesar cipher.",
      steps: [
        { h: "(a)", m: "Each letter is always encrypted to the same letter, so the ciphertext has the same letter frequencies as the plaintext — frequency analysis works;", mk: "1 mark", n: "R. \"susceptible to brute force\" — not true of the random substitution (26! keys)." },
        { h: "(b)", m: "There are far more possible keys // knowing how one letter is encrypted does not reveal the others (there is no pattern to the replacements);", mk: "1 mark", n: "R. \"each letter has a random key\"." }
      ], result: "Frequency analysis; more keys / no pattern" } },

    { page: "The Vernam cipher" },
    { callout: { t: "def", h: "Vernam cipher (one-time pad)", body: "Each bit of the plaintext is **XORed** with the corresponding bit of a **key that is at least as long as the message, truly random, used only once and kept secret**. Decryption XORs the ciphertext with the same key: (P XOR K) XOR K = P." } },
    { fig: { w: 540, h: 160, items: [].concat(
      [{ text: [60, 30], t: "plaintext S", b: true, c: "text", size: 12 }], row(120, 14, 26, 32, "1010011".split(""), null),
      [{ text: [60, 74], t: "key H", b: true, c: "accent2", size: 12 }], row(120, 58, 26, 32, "1001000".split(""), "accent2"),
      [{ text: [60, 118], t: "XOR → cipher", b: true, c: "accent", size: 12 }], row(120, 102, 26, 32, "0011011".split(""), "accent", { b: true }),
      [{ text: [440, 56], t: "1 where the bits differ,", c: "text2", size: 11.5 }, { text: [440, 74], t: "0 where they match", c: "text2", size: 11.5 }]
    ), cap: "AS June 2018: 'S' XOR 'H' = 0011011. XOR the ciphertext with the same key and 'S' comes back." } },
    { worked: { tag: "exam", title: "Encrypt SON with key HOG", src: "AS June 2018 · P2 Q04.3 · 3 marks",
      q: "The bit pattern 1010011 1001111 1001110 represents 'SON' in 7-bit ASCII. 'A' is 1000001 and other letters follow in sequence ('H' is 1001000). What bit pattern results from encrypting 'SON' using a Vernam cipher with the key 'HOG'? Show your working.",
      steps: [
        { m: "HOG = **1001000 1001111 1000111**", mk: "1 mark" },
        { m: "XOR each bit: 1010011 ⊕ 1001000, 1001111 ⊕ 1001111, 1001110 ⊕ 1000111", mk: "1 mark" },
        { m: "= **0011011 0000000 0001001** (21 bits)", mk: "1 mark", n: "R. a result equal to HOG or SON. Note the middle character: O XOR O = 0000000 — reusing a letter of the key in the same place leaks it, one reason keys must be random." }
      ], result: "0011011 0000000 0001001" } },
    { worked: { tag: "exam", title: "Encrypt DAB with key EGG", src: "AS June 2022 · P2 Q04.5 · 3 marks",
      q: "'A' is 1000001 in 7-bit ASCII and other characters follow in sequence ('D' is 1000100); 'DAB' is 1000100 1000001 1000010. What bit pattern results from encrypting 'DAB' using a Vernam cipher with the key 'EGG'? Show your working.",
      steps: [
        { m: "EGG = **1000101 1000111 1000111**", mk: "1 mark" },
        { m: "a 21-bit answer that is not DAB or EGG;", mk: "1 mark" },
        { m: "XOR: **0000001 0000110 0000101**", mk: "1 mark" }
      ], result: "0000001 0000110 0000101" } },
    { worked: { tag: "exam", title: "Decrypt BVP with key TIN (Baudot-Murray)", src: "A-level June 2019 · P2 Q14.1 · 3 marks",
      q: "The ciphertext \"BVP\" was encrypted using the Vernam cipher and the key \"TIN\", using 5-bit Baudot-Murray codes (B 10011, V 01111, P 01101, T 00001, I 01100, N 00110, D 10010, O 00011, G 01011). Decrypt the ciphertext, showing your working.",
      steps: [
        { m: "Ciphertext 10011 01111 01101; key 00001 01100 00110;", mk: "1 mark" },
        { m: "XOR: 10010 00011 01011;", mk: "1 mark" },
        { m: "→ **D O G**", mk: "1 mark" }
      ], result: "DOG" } },

    { page: "Security" },
    { callout: { t: "memorise", h: "Conditions for the Vernam cipher to be perfectly secure (MAX 2)", body: [
      "The key must be (at least) **as long as** the plaintext;",
      "the key must **not be reused** — used only once (then destroyed);",
      "the key must be **truly random**;",
      "the key must be **kept secret** — known only to the sender and receiver."
    ] } },
    { kv: [
      ["Perfect security", "**nothing can be learnt about the plaintext from the ciphertext** — every plaintext of that length is equally likely, so frequency or statistical analysis gives no clues; it cannot be cracked even with unlimited time"],
      ["Computational security", "the cipher **cannot be cracked in a reasonable (practical / polynomial) amount of time** with known methods — given enough time and ciphertext it could be broken, but not usefully (e.g. AES, RSA)"],
      ["Key exchange problem", "with a symmetric cipher, how to get the key **to the receiver** without it being **intercepted** — solved in practice by asymmetric (public key) cryptography (4.9.3.2)"]
    ] },
    { worked: { tag: "exam", title: "Two conditions for perfect security", src: "A-level June 2023 · P2 Q03.4 · 2 marks",
      q: "The Vernam cipher, unlike the Caesar cipher, can be perfectly secure. State two conditions that must be met for the Vernam cipher to offer perfect security.",
      steps: [{ m: "The key must be at least as long as the plaintext;", mk: "1 mark" }, { m: "the key must be truly random (or: used only once; kept secret);", mk: "1 mark", n: "NE. \"one-time pad\" alone." }], result: "As long as the message; truly random (single use, secret)" } },
    { worked: { tag: "exam", title: "Why Vernam is perfectly secure", src: "AS June 2020 · P2 Q07.3 · 1 mark",
      q: "Explain why, under the correct conditions, the Vernam cipher is perfectly secure.",
      steps: [{ m: "Frequency / statistical analysis of the ciphertext cannot provide any clues to the plaintext — nothing can be learnt about the plaintext from the ciphertext.", mk: "1 mark" }], result: "The ciphertext reveals nothing" } },
    { worked: { tag: "exam", title: "Why Vernam is better than Caesar", src: "AS June 2018 · P2 Q04.2 · 2 marks",
      q: "A sensitive message could be encrypted using either the Vernam cipher or the Caesar cipher. Explain why the Vernam cipher is a better choice.",
      steps: [
        { m: "The Vernam cipher (if implemented correctly) is unbreakable, whereas the Caesar cipher can easily be cracked;", mk: "1 mark" },
        { m: "frequency analysis of Vernam ciphertext reveals nothing, because the same plaintext letter is not always encrypted to the same ciphertext letter (and there are far more possible keys);", mk: "1 mark" }
      ], result: "Unbreakable; no patterns for frequency analysis" } },
    { worked: { tag: "exam", title: "Computational security; key exchange", src: "A-level June 2019 · P2 Q14.2–14.3 · 3 marks",
      q: "(a) Explain what it means for a cipher to be described as being computationally secure. (b) Explain what the key exchange problem is, in relation to a symmetric cipher.",
      steps: [
        { h: "(a)", m: "The cipher cannot be cracked by any known method in a reasonable / practical amount of time (though in theory it could be);", mk: "1 mark", n: "R. \"can never be cracked\". NE. \"takes a long time\"." },
        { h: "(b)", m: "How to pass the key from the sender to the receiver;", mk: "1 mark" },
        { m: "without it being intercepted (securely);", mk: "1 mark" }
      ], result: "Uncrackable in practical time; getting the key to the receiver safely" } },

    { page: "Ciphers in code" },
    { h: "Caesar in assembly language" },
    { code: { lang: "text", src: "        LDR R0, 100      ; character code 0–25\n        LDR R1, 101      ; key 0–25\n        ADD R2, R0, R1   ; shift\n        CMP R2, #26\n        BLT store        ; still a letter?\n        SUB R2, R2, #26  ; wrap past Z back to A\nstore:  STR R2, 102\n        HALT", cap: "AS June 2020 Q07.1 (mark scheme Example 1): load both operands, add, wrap by subtracting 26, store." } },
    { worked: { tag: "exam", title: "Caesar encryption in assembly", src: "AS June 2020 · P2 Q07.1 · 4 marks",
      q: "Write an assembly language program to encrypt a single character using the Caesar cipher. Characters are coded 0–25 (A–Z). Memory location 100 holds the character code (0–25), location 101 an integer key (0–25); store the encrypted character's code in location 102.",
      steps: [
        { m: "`LDR R0, 100`, `LDR R1, 101` and `STR R2, 102` used correctly;", mk: "1 mark" },
        { m: "`ADD R2, R0, R1`;", mk: "1 mark" },
        { m: "`SUB R2, R2, #26`;", mk: "1 mark" },
        { m: "`CMP R2, #26` with `BLT store` and the label `store:` on the STR (or `CMP R2, #25` / `BGT adjust` on the SUB);", mk: "1 mark", n: "Max 3 if any errors. Synoptic: 4.7.3.5 the AQA instruction set." }
      ], result: "Add, compare with 26, subtract 26 if needed, store" } },
    { worked: { tag: "exam", title: "Vernam in assembly", src: "A-level June 2020 · P2 Q09.3 · 3 marks",
      q: "The Vernam cipher encrypts a plaintext character by performing a logical operation between it and part of the key. Write an assembly language program (AQA instruction set) to do this: the plaintext character code is in memory location 101, the key part in 102, and the ciphertext is to be stored in 103.",
      steps: [
        { m: "`LDR R1, 101` and `LDR R2, 102` — load both values into registers;", mk: "1 mark" },
        { m: "`EOR R3, R1, R2` — exclusive OR them;", mk: "1 mark" },
        { m: "`STR R3, 103` — store the result;", mk: "1 mark" }
      ], result: "LDR, LDR, EOR, STR" } },
    { worked: { tag: "exam", title: "The registers in a Caesar program", src: "A-level June 2018 · P2 Q12.1 · 2 marks",
      q: "An incomplete assembly program implements: IF characterCode ≥ 65 AND ≤ 90 THEN encryptedCode ← characterCode + keyValue, subtracting 26 if it exceeds 90; ELSE encryptedCode ← characterCode. It begins CMP R1, #65 / BLT doNotEncrypt / CMP R1, #90 / BGT doNotEncrypt / ADD R3, R1, R2. Explain the purpose of registers R1, R2 and R3.",
      steps: [{ m: "R1: the plaintext letter (characterCode); R2: the key (the shift, keyValue); R3: the ciphertext letter (encryptedCode).", mk: "2 marks", n: "1 mark for one or two correct; 2 for all three." }], result: "R1 plaintext, R2 key, R3 ciphertext" } },
    { worked: { tag: "exam", title: "Fix the Caesar decryption", src: "A-level June 2020 · P2 Q09.4 · 3 marks",
      q: "A message was encrypted with the Caesar cipher, key 5 (capital letters only, ASCII 65–90). This pseudocode is supposed to decrypt one capital letter but does not work properly: asciicode ← CHAR_TO_INT(c); asciicode ← asciicode − 5; plaintext ← INT_TO_CHAR(asciicode). Explain the problem and how it could be rectified.",
      steps: [
        { h: "Problem", m: "Letters A–E are shifted back before 'A' (below ASCII 65) and become non-alphabetic characters;", mk: "1 mark", n: "R. \"some values will not be valid ASCII codes\"." },
        { h: "Fix", m: "they must wrap round to the end of the alphabet — use an IF to check whether the code is below 65;", mk: "1 mark" },
        { m: "and add 26 to any code below 65 (or use MOD 26 in the calculation);", mk: "1 mark" }
      ], result: "Wrap codes below 65 by adding 26" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Define encryption", "Algorithm + key → a form not understandable without the key."],
      ["Encrypt / Decrypt (Caesar)", "The ciphertext/plaintext only — remember to wrap round."],
      ["Show your working (Vernam)", "Key in binary; XOR shown; a result of the right length."],
      ["State conditions", "As long as the message; random; used once; secret."],
      ["Compare Caesar and Vernam", "Linked statements: few keys vs as many as messages; frequency analysis works vs reveals nothing."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "Perfect security keys: \"LORS\"", body: "**L**ong (as the message), **O**nce only, **R**andom, **S**ecret." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Forgetting to wrap round (Y + 4 = C).", "\"Computationally secure means it can never be cracked\" (R.).", "\"Symmetric uses one key, asymmetric two\" (NE.) — say same vs different related keys.", "XOR mistakes: 1 XOR 1 = 0."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.4.1 XOR gates; 4.7.3.5 EOR in assembly; 4.9.3.2 asymmetric encryption, digital signatures and certificates; 4.4 computational complexity — \"intractable\" problems underpin computational security; 4.8 law enforcement and encryption (AS 2019 Q11)." } }
  ],
  flashcards: [
    ["Define encryption.", "Using an algorithm and key to convert plaintext into ciphertext that cannot be understood without the key."],
    ["Caesar cipher?", "Each letter shifted a fixed number of places, wrapping round."],
    ["SECURITY with Caesar key 4?", "WIGYVMXC."],
    ["Why is Caesar easily cracked?", "Only 25 keys; frequency analysis."],
    ["Vernam cipher operation?", "XOR each bit of plaintext with the key."],
    ["What is perfect security?", "Nothing about the plaintext can be learnt from the ciphertext.", 6],
    ["Computational security?", "Cannot be cracked in a practical amount of time.", 7],
    ["Assembly instruction for Vernam?", "EOR.", 10]
  ],
  quiz: [
    { q: "HELLO with Caesar key 3 is", opts: ["KHOOR", "EBIIL", "HELLO", "LIPPS"], ans: 0, why: "Shift +3." },
    { q: "Vernam encryption uses", opts: ["XOR", "AND", "addition mod 10", "a shift"], ans: 0, why: "Bitwise XOR with the pad." },
    { q: "Which is NOT a condition for perfect security?", opts: ["the key is shorter than the message", "the key is random", "the key is used once", "the key is secret"], ans: 0, why: "At least as long." },
    { q: "A cipher uncrackable in practical time is", opts: ["computationally secure", "perfectly secure", "symmetric", "a substitution cipher"], ans: 0, why: "Definition." },
    { q: "Why does frequency analysis break Caesar?", opts: ["each letter always maps to the same letter", "the key is random", "it uses XOR", "it is asymmetric"], ans: 0, why: "Frequencies preserved." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
