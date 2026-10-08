/* Kurenai OS — past-paper bank: AQA 7517 §4.5 Data representation (part B:
   character coding, error checking, analogue/digital, images, sound, MIDI,
   compression, encryption). Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.5.5.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Parity, majority voting, checksums, check digits" },
    { table: { head: ["Item", "Points that score"], rows: [
      ["How an even parity bit is generated (2 marks)", "**Count the 1s**; if the count is even set the parity bit to 0, otherwise 1 — so the total is even. Alternative: **XOR** all the bits, the result is the parity bit"],
      ["How the receiver checks (2 marks)", "Count the 1s in the received byte; even → assumed correct; odd → corrupted"],
      ["Limitation of parity (1 mark)", "An **even number of bit errors** goes undetected; errors can be **detected but not corrected** / located"],
      ["Majority voting (2 marks)", "Each bit (or byte) is sent an **odd number of times ≥ 3**; the receiver takes the **value received most often** — never say the receiver *knows* it is correct"],
      ["Majority voting vs parity (2 marks)", "Can **correct** as well as detect; can detect **multiple-bit** errors; advantage + *how* it is achieved"],
      ["Why parity may still be preferred (AS 2023)", "Far **less redundant data** — one extra bit per byte instead of three copies, so faster transmission"],
      ["Checksum (2023, 2 marks)", "Used to check whether the data has been **corrupted/changed in transmission**; calculated by **applying a function to the payload** and compared on receipt"],
      ["Check digit (AS 2020, 2 marks)", "A digit **calculated using an algorithm from the other digits** and appended, e.g. ISBN"]
    ]}}
  ],
  flashcards: [
    ["Describe how an even parity bit is generated.", "Count the 1s in the data bits; if the count is odd the parity bit is set to 1, otherwise 0, so the total number of 1s is even (equivalently, XOR all the data bits).", 11],
    ["How does a receiver check even parity?", "Counts the 1s in the received byte: an even total is assumed correct, an odd total means corruption.", 12],
    ["State two limitations of parity bits.", "Errors that change an even number of bits go undetected; errors can be detected but not corrected (their position is unknown).", 13],
    ["Describe majority voting.", "Each bit (or byte) is sent an odd number of times, at least three; the receiver takes the value received most often as the value sent.", 14],
    ["Give two advantages of majority voting over parity.", "It can correct errors, not just detect them; it can detect multi-bit errors.", 15],
    ["Why might parity be chosen instead of majority voting?", "Much less redundant data (one bit per byte vs three copies), so faster transmission.", 16],
    ["What is a checksum?", "A value calculated from the packet's payload by a function, sent with the data and recalculated on receipt to detect corruption.", 17],
    ["What is a check digit?", "A digit calculated by an algorithm from the other digits of a number and appended to it, e.g. the last digit of an ISBN or barcode.", 18]
  ],
  quiz: [
    { q: "Even parity bit for 1011001:", opts: ["0", "1", "2", "none"], ans: 0, why: "Four 1s already — even." },
    { q: "Odd parity bit for 1010101:", opts: ["0", "1", "4", "none"], ans: 1, why: "Four 1s is an even count; odd parity needs an odd total, so the parity bit is 1." },
    { q: "Received with even parity: 11010110. Conclusion?", opts: ["Correct", "Corrupted — five 1s", "Cannot tell", "Two errors"], ans: 1, why: "Odd count → error." },
    { q: "Two bits flip in a byte protected by even parity. The receiver:", opts: ["detects it", "does not detect it", "corrects it", "requests resend"], ans: 1, why: "Even number of errors preserves parity." },
    { q: "In majority voting each bit is sent:", opts: ["twice", "an odd number of times ≥ 3", "once with a parity bit", "with a checksum"], ans: 1, why: "Odd so there is always a majority." },
    { q: "Majority voting received 1, 0, 1 for a bit. Value taken:", opts: ["0", "1", "error", "undefined"], ans: 1, why: "Majority." },
    { q: "A checksum is calculated from:", opts: ["the header only", "the packet's payload/data", "the IP address", "the parity bits"], ans: 1, why: "Function of the contents." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P2 Q4.3", ctx: "A system uses even parity on 7-bit ASCII codes, adding the parity bit as the most significant bit.",
      parts: [
        { q: "Explain how the parity bit is generated.", marks: 2, ms: ["The number of 1s in the seven data bits is counted (1)", "If the total is odd the parity bit is set to 1, otherwise 0, so that the total number of 1s is even (accept: the data bits are XORed and the result is the parity bit) (1)"] },
        { q: "Write the byte transmitted for the character with ASCII code `1000111`.", marks: 1, ms: ["01000111 (four 1s already, parity bit 0) (1)"] },
        { q: "Explain how the receiver uses the parity bit and state one limitation of the method.", marks: 2, ms: ["Receiver counts the 1s; if even the byte is assumed correct, if odd it has been corrupted (1)", "An even number of bit errors is not detected / the error cannot be corrected or located (1)"] }
      ] },
    { level: "AS", src: "AS 2017 P2 Q2.6", q: "Explain one advantage of majority voting over the use of parity bits, describing how the advantage is achieved.", marks: 2,
      ms: ["Majority voting can correct errors as well as detect them (1)", "because the value received most often is taken as correct and the minority value discarded (1)", "Alternative: it can detect multiple-bit errors, because each bit is checked individually (1 + 1)", "Max 2"] },
    { level: "AS", src: "AS 2023 P2 Q4", ctx: "A sensor sends each byte three times so the receiver can use majority voting.",
      parts: [
        { q: "Explain why the byte is sent an odd number of times.", marks: 1, ms: ["So there is always a majority value — with an even count the copies could split evenly (1)"] },
        { q: "The receiver receives `10110010`, `10110110` and `10110010`. State the byte accepted.", marks: 1, ms: ["10110010 (1)"] },
        { q: "Explain why a designer might prefer parity bits to majority voting.", marks: 2, ms: ["Majority voting triples the amount of data sent (1)", "Parity adds only one bit per byte, so transmission is much faster / uses less bandwidth (1)"] }
      ] },
    { src: "AQA 2023 P2 Q2.2", q: "Each packet sent across a network contains a checksum. Explain what the checksum is used for and outline how its value is determined.", marks: 2,
      ms: ["To check whether the contents of the packet have been corrupted / changed during transmission (1)", "It is calculated by applying a function / hash to the payload of the packet (and recalculated by the receiver for comparison) (1)"] },
    { level: "AS", src: "AS 2020 P2 Q1.4", q: "Explain what a check digit is and how it is generated.", marks: 2,
      ms: ["A digit appended to a number (such as an ISBN) to detect errors in entry or transmission (1)", "Calculated by applying an algorithm to the other digits of the number (1)"] }
  ]
});

X("compsci:4.5.6.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Sampled sound — every Paper 2" },
    { table: { head: ["Item", "Method"], rows: [
      ["File size", "**sample rate × resolution (bits) × seconds × channels ÷ 8** bytes; then to the unit asked (÷ 1024² for MiB)"],
      ["Duration from file size", "bits in file ÷ (rate × resolution) — e.g. 17.199 MB at 44 100 Hz, 16-bit → 195 s"],
      ["Resolution from file size", "bits in file ÷ (rate × seconds)"],
      ["Nyquist", "Sample rate must be **at least twice the highest frequency** in the signal — 14 500 Hz needs ≥ 29 000 Hz; a 15 000 Hz rate reproduces at most 7 500 Hz"],
      ["Sampling rate / resolution definitions", "Rate: number of samples taken per second. Resolution: number of bits used to store each sample"],
      ["Quantisation error", "The measured amplitude is rounded to the nearest level, so the recording is not exact; reduce it by **increasing the sample resolution** (more bits) — not the rate"],
      ["Why a sampled file misrepresents the signal (2025)", "Values between samples are lost; amplitudes are rounded to available levels"]
    ]}}
  ],
  flashcards: [
    ["State Nyquist's theorem.", "To reproduce a signal faithfully the sample rate must be at least twice the highest frequency component in the signal.", 12],
    ["File size for 30 s at 20 000 Hz, 16-bit, mono?", "30 × 20 000 × 16 / 8 = 1 200 000 bytes.", 13],
    ["Duration of a 17.199 MB file at 44 100 Hz, 16-bit mono?", "17 199 000 × 8 / (44 100 × 16) ≈ 195 s.", 14],
    ["What is quantisation error and how is it reduced?", "The rounding of each measured amplitude to the nearest available level; reduce it by increasing the sample resolution.", 15],
    ["What does a stored sample represent?", "The amplitude of the sound wave at the instant it was sampled, as a binary number.", 16],
    ["How does increasing the sample rate affect quality and size?", "Higher frequencies captured, closer approximation — and proportionally larger file.", 17]
  ],
  quiz: [
    { q: "Highest frequency faithfully captured at 30 000 Hz sampling:", opts: ["30 000 Hz", "15 000 Hz", "60 000 Hz", "7 500 Hz"], ans: 1, why: "Half the sample rate." },
    { q: "10 samples in 0.01 s is a sample rate of:", opts: ["100 Hz", "1000 Hz", "10 Hz", "0.001 Hz"], ans: 1, why: "10 / 0.01." },
    { q: "16 amplitude divisions needs a resolution of:", opts: ["16 bits", "4 bits", "8 bits", "2 bits"], ans: 1, why: "2⁴ = 16." },
    { q: "To reduce quantisation error you increase:", opts: ["sample rate", "sample resolution", "duration", "compression"], ans: 1, why: "More levels." },
    { q: "Size of 3 minutes at 48 000 Hz, 16-bit, mono in MiB:", opts: ["16.48", "17.28", "8.24", "34.56"], ans: 0, why: "48 000 × 16 × 180 / 8 / 1024²." },
    { q: "A 1200 Hz tone needs a minimum sample rate of:", opts: ["600 Hz", "1200 Hz", "2400 Hz", "4800 Hz"], ans: 2, why: "Nyquist." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q1", ctx: "A 3-minute mono recording is sampled at 48 000 Hz with a 16-bit sample resolution and stored uncompressed.",
      parts: [
        { q: "Calculate the file size in mebibytes to 2 decimal places, showing your working.", marks: 2, ms: ["48 000 × 16 × 180 / 8 = 17 280 000 bytes (1)", "÷ 1024² = 16.48 MiB (1)"] },
        { q: "The recording contains frequencies up to 15 000 Hz. State the minimum sampling rate that would have been needed to reproduce it faithfully.", marks: 1, ms: ["30 000 Hz (1)"] }
      ] },
    { src: "AQA 2022 P2 Q10.1", q: "An uncompressed mono sound file of 17.199 MB was sampled at 44 100 Hz with 16-bit resolution. Calculate the duration of the recording in seconds.", marks: 3,
      ms: ["17.199 × 1 000 000 × 8 = 137 592 000 bits (1)", "÷ (44 100 × 16) (1)", "= 195 seconds (1)"] },
    { src: "AQA 2018 P2 Q11.3", q: "Explain what is meant by quantisation error in sampled sound, its significance, and how it could be reduced.", marks: 3,
      ms: ["Each measured amplitude is rounded to the nearest of the available levels (1)", "So the original signal cannot be reproduced completely accurately (1)", "Increase the sample resolution — the number of bits per sample (1)"] },
    { src: "AQA 2025 P2 Q2.1", q: "A 50-second recording sampled at 20 000 Hz is stored in a 1.5 MB file. Calculate the sample resolution used.", marks: 2,
      ms: ["1.5 × 1000 × 1000 × 8 = 12 000 000 bits ÷ (50 × 20 000 = 1 000 000 samples) (1)", "12 bits (1)"] },
    { src: "AQA 2017 P2 Q8.2", q: "A signal containing frequencies up to 14 500 Hz is sampled at 20 000 Hz. Explain why this sample rate is too low.", marks: 2,
      ms: ["Nyquist's theorem: the sample rate must be at least twice the highest frequency in the signal (1)", "20 000 is less than 2 × 14 500 = 29 000, so components above 10 000 Hz will not be reproduced faithfully (1)"] }
  ]
});

X("compsci:4.5.6.8", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "MIDI — 2017, 2018, 2021, 2022, 2023, 2024, 2025" },
    "**How MIDI represents music** (2 marks): as a **sequence of event messages / instructions** (NOT \"a sequence of notes\"), each containing data such as **note on/off, pitch, velocity, duration, channel, instrument**. **Advantages over sampled sound** (2–3 marks): **more compact** files; **easy to edit at note level** (change an instrument, transpose the whole score); **no data lost through sampling**; a score can be generated directly; composable algorithmically; can drive an instrument directly. \"Better quality\" scores only with the sampling explanation.",
    { callout: { t: "warn", body: "MIDI cannot store a **voice** or any real recorded sound — it is instructions for a synthesiser. A question that asks why a vocal track must be sampled wants exactly that." }}
  ],
  flashcards: [
    ["How does MIDI represent music?", "As a sequence of event messages (instructions) — e.g. note on, note off, pitch, velocity, duration, channel, instrument — rather than as sampled sound.", 8],
    ["Give three items a MIDI message might contain.", "Note on/off, note number (pitch), velocity (loudness), channel, instrument/program, duration, pitch bend.", 9],
    ["Give three advantages of MIDI over sampled sound.", "Much more compact; easy to edit individual notes or change instruments; no quantisation/sampling loss; a score can be generated from the file.", 10],
    ["Give one limitation of MIDI.", "It cannot represent real recorded sounds such as a voice — only instructions for synthesised instruments.", 11],
    ["Why are MIDI files small?", "A note is a few bytes of instruction rather than thousands of samples.", 12],
    ["What is a MIDI channel?", "One of 16 logical streams, each usually assigned to an instrument.", 13],
    ["What is velocity in MIDI?", "How hard the key was pressed — controls loudness/attack.", 14],
    ["How is a MIDI file turned into sound?", "A synthesiser / sound card interprets the messages and generates the audio.", 15]
  ],
  quiz: [
    { q: "MIDI stores music as:", opts: ["samples", "event messages / instructions", "a bitmap", "a spectrum"], ans: 1, why: "'Sequence of notes' is rejected." },
    { q: "Which cannot be stored in MIDI?", opts: ["Pitch", "A singer's voice", "Instrument", "Note duration"], ans: 1, why: "Real audio needs sampling." },
    { q: "Changing the instrument of an entire MIDI track is:", opts: ["impossible", "easy — edit the program-change message", "requires re-recording", "lossy"], ans: 1, why: "Note-level editing." },
    { q: "MIDI files are smaller because:", opts: ["they are compressed", "each note is a few bytes of instruction, not thousands of samples", "they are mono", "they use 8-bit samples"], ans: 1, why: "2025 P2 Q2.4." },
    { q: "A MIDI 'note on' message includes:", opts: ["a waveform", "the pitch and velocity", "a file size", "a parity bit"], ans: 1, why: "Event data." },
    { q: "'MIDI gives better quality' scores only if you add:", opts: ["file size", "that no data is lost through sampling", "the bit rate", "the channel count"], ans: 1, why: "Mark-scheme condition." }
  ],
  exam: [
    { level: "AS", src: "AS 2024 P2 Q3.6", q: "Describe how MIDI represents a piece of music, and state one advantage of MIDI over sampled sound.", marks: 3,
      ms: ["Music is represented as a sequence of event messages / instructions (1)", "e.g. note on/off, pitch, velocity, duration, channel, instrument (1)", "Advantage: more compact / easy to edit notes and instruments / no data lost through sampling / score can be generated (1)"] },
    { src: "AQA 2022 P2 Q10.2", q: "A composer stores her work as MIDI files rather than sampled sound. Explain three advantages of this choice.", marks: 3,
      ms: ["Files are much more compact — each note is a short message rather than thousands of samples (1)", "Easy to modify at note level — change the instrument, transpose the whole score, correct a wrong note (1)", "No data is lost through sampling; a printed score can be generated directly; the file can drive an instrument (1)", "Max 3"] },
    { src: "AQA 2025 P2 Q2.4", q: "Explain why a MIDI file of a song is much smaller than a sampled recording of the same song, and state one reason a producer might still need a sampled recording.", marks: 3,
      ms: ["A MIDI file stores instructions — a few bytes per note event (1)", "A sampled recording stores tens of thousands of amplitude values per second (1)", "MIDI cannot capture real sounds such as a vocal performance, which must be sampled (1)"] }
  ]
});

X("compsci:4.5.6.9", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Compression — reasons, RLE, dictionary, lossy vs lossless" },
    { table: { head: ["Item", "Points"], rows: [
      ["Why compress (2 marks)", "Less storage space · faster transmission / less bandwidth · more files fit a device / fits a size limit (email attachments)"],
      ["Lossless vs lossy (1–2)", "Lossless: the **original data can be fully recovered** (\"no data is lost\" is NE) · Lossy: **cannot be recovered**, some data discarded — quality may limit later editing"],
      ["RLE (2)", "A **run** is a sequence of consecutive identical values; store **pairs of (value, run length)**, e.g. `7 yellow, 4 blue`; state the bytes before and after — RLE can make a file **bigger** when runs are short"],
      ["Why RLE suits images; dictionaries suit text (2025)", "Adjacent pixels are often the same colour; in text the repetition is of **words / substrings spread throughout**, rarely adjacent identical characters"],
      ["Dictionary compression (2–3)", "A dictionary maps **substrings / words to tokens**; the text is **replaced by the tokens**; the dictionary must be stored/sent too, so small texts gain little"]
    ]}}
  ],
  flashcards: [
    ["Give two reasons files are compressed.", "Less storage space; faster transmission / less bandwidth; more files fit on a device or within a size limit."],
    ["Define lossless compression.", "Compression from which the original data can be fully recovered — it is reversible."],
    ["Define lossy compression.", "Compression that permanently discards some (less important) data, so the original cannot be recovered."],
    ["Describe run-length encoding.", "Consecutive identical values (a run) are stored as a pair: the value and the number of repetitions."],
    ["RLE the row: B B G G G R R R R W.", "(B, 2) (G, 3) (R, 4) (W, 1)."],
    ["Why can RLE increase file size?", "Each run needs two values; if runs are mostly length 1 (varied colours) the counts add more than they save."],
    ["Describe dictionary-based compression.", "Build a dictionary mapping recurring substrings/words to short tokens; replace each occurrence in the text with its token; store the dictionary with the data."],
    ["Why suit RLE to images and dictionaries to text?", "Images often have adjacent pixels of the same colour; text repeats words spread throughout rather than adjacent identical characters.", 18],
    ["Give one problem with lossy compression of audio.", "The original cannot be recovered — quality is reduced and later editing is limited.", 19]
  ],
  quiz: [
    { q: "Lossless compression means:", opts: ["quality is reduced", "the original data can be fully recovered", "no compression happened", "it is faster"], ans: 1, why: "'No data lost' alone is NE." },
    { q: "RLE of `AAAABBA` is:", opts: ["4A 2B 1A", "A4 B2", "7 chars", "A B A"], ans: 0, why: "Runs with counts." },
    { q: "A row of 20 pixels each a different colour, RLE-encoded, takes:", opts: ["fewer bytes", "more bytes — 20 pairs", "the same", "zero"], ans: 1, why: "Run lengths all 1." },
    { q: "Dictionary compression replaces:", opts: ["pixels with colours", "recurring words/substrings with tokens", "samples with MIDI", "bits with bytes"], ans: 1, why: "Token substitution." },
    { q: "A smart-speaker company stores millions of voice clips. Lossy compression is justified because:", opts: ["it is reversible", "it greatly reduces size while keeping enough quality", "it encrypts", "it adds metadata"], ans: 1, why: "AS 2022 P2 Q11." },
    { q: "Which is a reason to compress?", opts: ["Slower transmission", "Fitting an email attachment limit", "Larger files", "Better security"], ans: 1, why: "Size limits." }
  ],
  exam: [
    { src: "AQA 2025 P2 Q10", ctx: "A software company compresses the images and text files it distributes.",
      parts: [
        { q: "State two reasons why data is compressed.", marks: 2, ms: ["Less storage space is required (1)", "Data can be transmitted more quickly / more files fit on a device / a file fits within a size limit (1)"] },
        { q: "Explain why run-length encoding is suitable for images but dictionary-based compression is more suitable for text.", marks: 2, ms: ["In images adjacent pixels are often the same colour, giving long runs (1)", "In text the repetition is of words / substrings spread throughout the document — rarely adjacent identical characters (1)"] }
      ] },
    { src: "AQA 2019 P2 Q3", ctx: "A paragraph of text is compressed using dictionary-based compression.",
      parts: [
        { q: "Explain the difference between lossless and lossy compression.", marks: 1, ms: ["Lossless: the original data can be fully recovered; lossy: it cannot — some data is permanently discarded (1)"] },
        { q: "Describe how dictionary-based compression could be applied to the paragraph.", marks: 2, ms: ["A dictionary is built mapping recurring words / sequences of characters to tokens (1)", "Each occurrence in the text is replaced by its token (1)"] },
        { q: "Explain why this method is only worthwhile for large texts.", marks: 1, ms: ["A small text has little repetition, and the dictionary itself must be stored, so the compressed version may be no smaller (1)"] }
      ] },
    { src: "AQA 2024 P2 Q2.4", ctx: "One row of an 8-bit-colour image is: `R R R B R G G B B B`.",
      parts: [
        { q: "State the number of bytes needed for the row before and after run-length encoding (one byte per count and per colour).", marks: 1, ms: ["Before 10, after 12 (six runs × 2) (1)"] },
        { q: "Explain why run-length encoding has not been effective here.", marks: 1, ms: ["The runs are short / the colours vary a lot, so the counts add more than they save and the file grows (1)"] }
      ] },
    { level: "AS", src: "AS 2023 P2 Q5.4", q: "A studio stores its master recordings using lossy compression. Describe one problem this could cause.", marks: 2,
      ms: ["Data is discarded / lost when the file is stored (1)", "So the original cannot be recovered — the quality is permanently reduced and later editing is limited (1)"] }
  ]
});

X("compsci:4.5.6.10", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Encryption — Caesar, Vernam, and the two-key world" },
    { table: { head: ["Item", "Points"], rows: [
      ["Caesar en/decrypt (1)", "Shift each letter by the key, wrapping A↔Z; the 2020 algorithm bug: shifting back before 'A' gives non-letters — **add 26 / use MOD 26** for codes below 65"],
      ["Why Caesar is easily cracked (2)", "Only **25 possible keys** — brute force; **frequency analysis**: every letter maps to the same letter, so ciphertext letter frequencies match plaintext frequencies; structure (word lengths, double letters) survives"],
      ["Why a general substitution is harder", "Far more keys (26!); knowing one letter's mapping tells you nothing about the others"],
      ["Vernam cipher (3)", "Convert plaintext and key to binary (ASCII / Baudot); **XOR** bit by bit; convert back — the answer must be 21 bits for three characters and must not equal the plaintext"],
      ["Perfect security conditions (2)", "Key **at least as long as** the plaintext; **truly random**; **used only once**; **kept secret** / destroyed after use"],
      ["Computationally secure (1)", "Cannot be cracked by any known method in a **reasonable / polynomial** time — not \"never\""],
      ["Symmetric vs asymmetric (1)", "Symmetric: the **same key** encrypts and decrypts; asymmetric: **different but related** keys — \"one key vs two keys\" is NE"],
      ["Key exchange problem (2)", "How to pass the symmetric key to the receiver **without it being intercepted**"]
    ]}}
  ],
  flashcards: [
    ["Encrypt `HELLO` with a Caesar shift of 3.", "KHOOR.", 12],
    ["Why is a Caesar cipher easy to crack?", "Only 25 keys to try, and letter frequencies of the ciphertext match those of the plaintext (frequency analysis).", 13],
    ["Why is a general substitution cipher harder to crack than Caesar?", "There are 26! possible keys and no pattern — learning one letter's replacement reveals nothing about the others.", 14],
    ["Describe the Vernam cipher.", "Convert plaintext and a random key of equal length to binary; XOR them bit by bit; the result is the ciphertext; XOR with the key again recovers the plaintext.", 15],
    ["Conditions for the Vernam cipher to be perfectly secure?", "The key is truly random, at least as long as the plaintext, used only once, and kept secret.", 16],
    ["What does computationally secure mean?", "The cipher cannot be cracked by any known method in a reasonable (polynomial) amount of time — not that it can never be cracked.", 17],
    ["Symmetric vs asymmetric encryption?", "Symmetric: the same key encrypts and decrypts. Asymmetric: a pair of different but related keys — one encrypts, the other decrypts.", 18],
    ["What is the key exchange problem?", "With symmetric encryption the key must be passed to the receiver securely, without interception.", 19],
    ["What is a weakness shared by every substitution cipher?", "Each plaintext letter always maps to the same ciphertext letter, preserving frequencies and structure.", 20]
  ],
  quiz: [
    { q: "Caesar shift 5 of `CAT` is:", opts: ["HFY", "FDW", "XVO", "CAT"], ans: 0, why: "C→H, A→F, T→Y." },
    { q: "Decrypting a Caesar cipher by shifting back can produce non-letters unless you:", opts: ["use XOR", "wrap with MOD 26 / add 26 below 'A'", "use Unicode", "shift forward"], ans: 1, why: "2020 P2 Q9.4." },
    { q: "Vernam: plaintext 1000101 XOR key 1000100 =", opts: ["0000001", "1000101", "1111111", "0000000"], ans: 0, why: "Bitwise XOR." },
    { q: "Vernam is perfectly secure only if the key is:", opts: ["short and memorable", "random, as long as the message, used once, secret", "a dictionary word", "shared publicly"], ans: 1, why: "All four conditions." },
    { q: "'Symmetric uses one key, asymmetric uses two' is:", opts: ["full marks", "NE — must say same key vs different related keys", "wrong", "half marks"], ans: 1, why: "Mark-scheme NE." },
    { q: "Frequency analysis breaks a Caesar cipher because:", opts: ["keys are long", "each letter always encrypts to the same letter", "XOR is reversible", "it is asymmetric"], ans: 1, why: "Letter frequencies survive." },
    { q: "A computationally secure cipher:", opts: ["can never be cracked", "cannot be cracked in a practical amount of time by known methods", "has no key", "is a one-time pad"], ans: 1, why: "'Never' is rejected." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q3", ctx: "A message is encrypted first with a Caesar cipher and, separately, with a Vernam cipher.",
      parts: [
        { q: "Encrypt the plaintext `SECURITY` with a Caesar cipher using a shift of 4.", marks: 1, ms: ["WIGYVMXC (1)"] },
        { q: "Describe one weakness that the Caesar cipher shares with every substitution cipher.", marks: 1, ms: ["Each plaintext letter is always encrypted to the same ciphertext letter, so ciphertext letter frequencies match plaintext frequencies (frequency analysis) / structural properties survive (1)"] },
        { q: "Explain why a general substitution cipher is harder to crack than a Caesar cipher.", marks: 1, ms: ["There are far more possible keys, and knowing how one letter is encrypted does not reveal how the others are — there is no single shift (1)"] },
        { q: "State two conditions that must be met for the Vernam cipher to be perfectly secure.", marks: 2, ms: ["The key must be at least as long as the plaintext (1)", "The key must be truly random / used only once / kept secret (1)", "Max 2"] }
      ] },
    { level: "AS", src: "AS 2022 P2 Q4.5", q: "Encrypt the plaintext `EGG` using the Vernam cipher with the key `DAB`, using 7-bit ASCII codes (E = 1000101, G = 1000111, D = 1000100, A = 1000001, B = 1000010). Show your working and give the ciphertext in binary.", marks: 3,
      ms: ["EGG = 1000101 1000111 1000111 (1)", "XOR applied bit by bit with 1000100 1000001 1000010 (1)", "0000001 0000110 0000101 (1)"] },
    { src: "AQA 2019 P2 Q14", ctx: "Two companies exchange confidential documents over the internet.",
      parts: [
        { q: "Explain what is meant by a cipher being *computationally secure*.", marks: 1, ms: ["It cannot be cracked by any known method in a reasonable / practical amount of time (1)"] },
        { q: "Describe the key exchange problem that arises if a symmetric cipher is used.", marks: 2, ms: ["The key has to be passed from the sender to the receiver (1)", "Without it being intercepted / securely (1)"] },
        { q: "State the difference between symmetric and asymmetric encryption.", marks: 1, ms: ["Symmetric: the same key is used to encrypt and decrypt; asymmetric: different but related keys are used (1)"] }
      ] },
    { src: "AQA 2020 P2 Q9.4", q: "A Caesar decryption routine subtracts the key from each letter's ASCII code. It works for most letters but produces symbols for some. Explain the problem and how to correct it.", marks: 3,
      ms: ["Letters near the start of the alphabet are shifted to codes below 65 ('A'), giving non-alphabetic characters (1)", "These must wrap around to the end of the alphabet (1)", "Add 26 to any code below 65 / use MOD 26 in the calculation (1)"] },
    { level: "AS", src: "AS 2018 P2 Q4.2", q: "Explain why the Vernam cipher is more secure than the Caesar cipher.", marks: 2,
      ms: ["The Caesar cipher has only 25 keys and preserves letter frequencies, so it can be brute-forced or analysed (1)", "The Vernam cipher uses a random key as long as the message and used once, so every ciphertext is equally likely — there is no pattern to exploit (1)"] }
  ]
});

})(KOS.content.extend);
