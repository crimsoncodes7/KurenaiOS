/* Kurenai OS — past-paper bank: AQA 7517 §4.5 Data representation (part B:
   character coding, error checking, analogue/digital, images, sound, MIDI,
   compression, encryption). Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.5.5.1", {
  flashcards: [
    ["What is the ASCII code of the character '0'?", "48 (0110000₂)."],
    ["How do you convert the character '7' to the integer 7?", "Subtract 48 from its character code (55 − 48 = 7), or AND with 00001111, or XOR with 00110000."],
    ["What is the ASCII code of '9'?", "57 — the digits 0–9 occupy 48–57 in sequence."],
    ["Why are the digit characters given consecutive codes?", "So arithmetic on the codes converts between characters and values with one subtraction."],
    ["Convert the string \"42\" to the integer 42 using character codes.", "(CODE('4') − 48) × 10 + (CODE('2') − 48) = 4 × 10 + 2."],
    ["What is the code of 'A' and of 'a'?", "65 and 97 — a difference of 32 (bit 5)."],
    ["How do you convert an upper-case letter to lower-case with a bitwise operation?", "OR with 00100000 (set bit 5)."],
    ["If the ASCII code of 'T' is 84, what is the code of 'U'?", "85 — letters are consecutive."]
  ],
  quiz: [
    { q: "The character '5' has ASCII code:", opts: ["5", "53", "35", "0101"], ans: 1, why: "48 + 5." },
    { q: "CODE('3') − 48 =", opts: ["3", "51", "48", "'3'"], ans: 0, why: "Character to value." },
    { q: "01000001 in ASCII is:", opts: ["'a'", "'A'", "'1'", "65"], ans: 1, why: "65 = 'A'." },
    { q: "ANDing a digit's code with 00001111 gives:", opts: ["the letter", "its numeric value", "48", "zero"], ans: 1, why: "Clears the 0011 upper nibble." },
    { q: "Lower-case letters differ from upper-case in bit:", opts: ["0", "5 (value 32)", "7", "3"], ans: 1, why: "97 − 65 = 32." },
    { q: "If 'S' is 83, 'R' is:", opts: ["82", "84", "81", "51"], ans: 0, why: "Consecutive codes." }
  ],
  exam: [
    { level: "AS", src: "AS 2019 P2 Q3.1", q: "The character `'6'` is stored using its ASCII code. Describe one way a program could obtain the numeric value 6 from this code.", marks: 1,
      ms: ["Subtract 48 (00110000) from the character code / AND the code with 00001111 / XOR the code with 00110000 (1)"] },
    { level: "AS", src: "AS 2025 P2 Q3.1", q: "The ASCII code for `'S'` is 1010011. Write the ASCII code for `'T'`.", marks: 1,
      ms: ["1010100 (1)"] },
    { src: "AQA 2025 P2 Q9", ctx: "A logic circuit takes the 7-bit ASCII code B6…B0 of a character and produces outputs Q1 = 1 when the character is a letter and Q2 = 1 when it is an upper-case letter.",
      parts: [
        { q: "State the ASCII code ranges for upper-case and lower-case letters in denary.", marks: 1, ms: ["65–90 and 97–122 (1)"] },
        { q: "Explain which bit of the code distinguishes an upper-case letter from the corresponding lower-case letter.", marks: 1, ms: ["Bit 5 (value 32): 0 for upper-case, 1 for lower-case (1)"] },
        { q: "State the purpose of outputs Q1 and Q2.", marks: 2, ms: ["Q1 = 1 indicates the character is a letter (1)", "Q2 = 1 indicates the character is an upper-case letter (1)"] }
      ] }
  ]
});

X("compsci:4.5.5.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "ASCII / Unicode — AS Q3 or Q4 every year" },
    { kv: [
      ["Character code (AS 2022, 1 mark)", "A **(unique) number** used to represent a character — \"code\" alone is rejected"],
      ["Why Unicode replaced ASCII (AS 2019, 2022 — 2 marks)", "To support a **larger range of characters** · because of **increased international communication** / files used in multiple countries / need for extra symbols (emoji, maths) · so that **each code is always interpreted as the same character** (no code pages)"],
      ["A limitation of ASCII (AS 2025)", "Assumes English; only 128 (2⁷) characters; no international character sets or emoji"],
      ["Cost of Unicode (2019 A-level)", "Each character needs **more bits** (16 or 32 rather than 7/8), so files are larger and transmission slower"]
    ]}
  ],
  flashcards: [
    ["What is a character code?", "A unique number used to represent a character in a character set."],
    ["How many characters can 7-bit ASCII represent?", "128 (2⁷)."],
    ["Why was Unicode introduced?", "To support a much larger range of characters — international alphabets and symbols — as communication became global, with each code always meaning the same character."],
    ["Give one limitation of ASCII.", "It assumes English / Latin letters; only 128 characters; no Chinese, Arabic, emoji etc."],
    ["Give one disadvantage of Unicode compared with ASCII.", "Each character needs more bits (16 or 32), so text takes more storage and bandwidth."],
    ["What are the first 128 Unicode code points?", "Identical to ASCII — Unicode is backward compatible."],
    ["What is UTF-8?", "A variable-length Unicode encoding using 1–4 bytes per character, with ASCII characters as single bytes."],
    ["What is a character set?", "The complete collection of characters a system can represent, with a code for each."]
  ],
  quiz: [
    { q: "A character code is:", opts: ["a font", "a unique number representing a character", "a keyboard key", "a pixel"], ans: 1, why: "Mark-scheme definition." },
    { q: "ASCII is limited to how many characters?", opts: ["64", "128", "256", "65 536"], ans: 1, why: "7 bits." },
    { q: "Unicode was introduced mainly to:", opts: ["save memory", "support many more characters for international use", "speed up typing", "encrypt text"], ans: 1, why: "Range of characters." },
    { q: "A disadvantage of Unicode:", opts: ["fewer characters", "more bits per character", "not compatible with ASCII", "no emoji"], ans: 1, why: "16/32 bits." },
    { q: "The Unicode code point for 'A' is:", opts: ["different from ASCII", "the same as ASCII (65)", "97", "undefined"], ans: 1, why: "Backward compatible." },
    { q: "'Each code is always interpreted as the same character' is an advantage over:", opts: ["binary", "ASCII code pages / extended ASCII variants", "hexadecimal", "UTF-8"], ans: 1, why: "Extended ASCII differed by country." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P2 Q4", ctx: "A word processor stores each character of a document using a character code.",
      parts: [
        { q: "Explain what is meant by a character code.", marks: 1, ms: ["A (unique) number used to represent a character (1)"] },
        { q: "Explain why Unicode was introduced as an alternative to ASCII.", marks: 2, ms: ["To support a larger range of characters (1)", "Because of increased international communication / documents exchanged between countries / the need for extra symbols such as emoji — so that each code is interpreted the same way everywhere (1)"] }
      ] },
    { level: "AS", src: "AS 2025 P2 Q3.2", q: "State one limitation of the ASCII character set that Unicode overcomes.", marks: 1,
      ms: ["Only 128 characters / assumes English / cannot represent international alphabets or symbols such as emoji (1)"] },
    { src: "AQA 2019 P2 Q9.3", q: "A company changes its telemetry system from 7-bit ASCII to 16-bit Unicode. State one advantage and one disadvantage of this change for data transmission.", marks: 2,
      ms: ["Advantage: a greater range of characters can be transmitted / codes are interpreted consistently across countries (1)", "Disadvantage: each character needs more bits, so the effective data rate is reduced / transmissions take longer (1)"] }
  ]
});

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
    ["Describe how an even parity bit is generated.", "Count the 1s in the data bits; if the count is odd the parity bit is set to 1, otherwise 0, so the total number of 1s is even (equivalently, XOR all the data bits)."],
    ["How does a receiver check even parity?", "Counts the 1s in the received byte: an even total is assumed correct, an odd total means corruption."],
    ["State two limitations of parity bits.", "Errors that change an even number of bits go undetected; errors can be detected but not corrected (their position is unknown)."],
    ["Describe majority voting.", "Each bit (or byte) is sent an odd number of times, at least three; the receiver takes the value received most often as the value sent."],
    ["Give two advantages of majority voting over parity.", "It can correct errors, not just detect them; it can detect multi-bit errors."],
    ["Why might parity be chosen instead of majority voting?", "Much less redundant data (one bit per byte vs three copies), so faster transmission."],
    ["What is a checksum?", "A value calculated from the packet's payload by a function, sent with the data and recalculated on receipt to detect corruption."],
    ["What is a check digit?", "A digit calculated by an algorithm from the other digits of a number and appended to it, e.g. the last digit of an ISBN or barcode."]
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

X("compsci:4.5.6.1", {
  flashcards: [
    ["Why can the same bit pattern represent different things?", "A bit pattern has no inherent meaning — the program or hardware interprets it as an integer, character, colour, sound sample or instruction."],
    ["How is an image represented as bit patterns?", "As a grid of pixels, each stored as a binary colour value."],
    ["How is sound represented as bit patterns?", "As a sequence of samples, each a binary measurement of the amplitude at a point in time."],
    ["What does 01000001 represent?", "Depends on interpretation: 65, the character 'A', a pixel value, or part of an instruction."],
    ["What is the role of metadata in interpreting bit patterns?", "It tells the software how to interpret the data — e.g. an image's width, height and colour depth."],
    ["What is a data type's role with respect to bit patterns?", "It fixes how the pattern is interpreted and which operations are valid."],
    ["How are instructions represented?", "As bit patterns split into an opcode and operand(s) — the processor interprets them."],
    ["Why must a file's format be known before it can be opened?", "Without the format the bit patterns cannot be interpreted correctly."]
  ],
  quiz: [
    { q: "A bit pattern's meaning is determined by:", opts: ["its length only", "how it is interpreted by software/hardware", "its first bit", "nothing"], ans: 1, why: "Context gives meaning." },
    { q: "The byte 01100001 could be:", opts: ["97", "'a'", "a colour value", "all of these"], ans: 3, why: "Interpretation-dependent." },
    { q: "An image file stores:", opts: ["one bit pattern per pixel plus metadata", "text only", "sound samples", "instructions"], ans: 0, why: "Bitmap representation." },
    { q: "A CPU treats a fetched bit pattern as:", opts: ["a character", "an instruction", "a pixel", "a sample"], ans: 1, why: "During the fetch–execute cycle." },
    { q: "Metadata helps by:", opts: ["compressing", "describing how to interpret the data", "encrypting", "sorting"], ans: 1, why: "E.g. dimensions, colour depth." },
    { q: "Which is NOT stored as bit patterns?", opts: ["Sound", "Video", "Text", "None — everything is"], ans: 3, why: "All digital data is binary." }
  ],
  exam: [
    { src: "AQA 2017 P2 Q5", q: "Explain why the bit pattern `01001000` might be interpreted differently by two programs, giving two possible interpretations.", marks: 2,
      ms: ["Bit patterns have no inherent meaning; the program (or hardware) decides how to interpret them according to the data type / file format (1)", "e.g. the integer 72 in one program and the character 'H' in another (accept a colour value, an instruction, a sound sample) (1)"] }
  ]
});

X("compsci:4.5.6.2", {
  flashcards: [
    ["Define analogue data.", "Data that varies continuously, taking any value within a range — e.g. a sound wave's pressure or a voltage from a sensor."],
    ["Define digital data.", "Data represented as discrete values (ultimately binary), taking only a fixed set of levels."],
    ["Give an example of an analogue signal and its digital equivalent.", "A microphone's varying voltage; the sequence of sampled binary values stored in a WAV file."],
    ["Why must analogue signals be converted to digital?", "Computers process only discrete binary values."],
    ["Why are photosensor voltages analogue but pixel values digital?", "The voltage varies continuously with light intensity; the ADC quantises it to a fixed number of levels stored in binary."],
    ["What is lost in analogue → digital conversion?", "Values between the quantisation levels and between sample times — an approximation."],
    ["Is a clock with hands analogue or digital?", "Analogue — continuous movement; a numeric display is digital."],
    ["Give one advantage of digital over analogue data.", "Can be stored, copied and transmitted without degradation and processed by computers."]
  ],
  quiz: [
    { q: "Analogue data:", opts: ["takes discrete values", "varies continuously", "is always sound", "is stored in bits"], ans: 1, why: "Continuous." },
    { q: "Digital data:", opts: ["is continuous", "takes discrete values", "cannot be copied", "is analogue after sampling"], ans: 1, why: "Discrete levels." },
    { q: "A microphone produces:", opts: ["digital samples", "an analogue voltage", "MIDI messages", "pixels"], ans: 1, why: "Continuous electrical signal." },
    { q: "The voltage from a camera's photosensor is analogue because:", opts: ["it is binary", "it varies continuously with light intensity", "it is sampled", "it is compressed"], ans: 1, why: "2024 P2 Q2.3." },
    { q: "A pixel value is digital because:", opts: ["it varies continuously", "it is one of a fixed number of levels stored in binary", "it is a voltage", "it is analogue"], ans: 1, why: "Quantised." },
    { q: "Converting analogue to digital always:", opts: ["is exact", "loses some information", "increases quality", "needs MIDI"], ans: 1, why: "Approximation." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P2 Q5.1", q: "Explain the difference between analogue and digital data.", marks: 2,
      ms: ["Analogue data is continuous — it can take any value within a range (1)", "Digital data is discrete — it can only take one of a fixed set of values, represented in binary (1)"] },
    { src: "AQA 2024 P2 Q2.3", q: "In a digital camera each photosensor produces a voltage that is converted to a pixel value. Explain why the voltage is analogue data but the pixel value is digital data.", marks: 2,
      ms: ["The voltage varies continuously with the intensity of the light falling on the sensor (1)", "The pixel value is one of a fixed number of discrete levels, stored as a binary number, produced by the ADC (1)"] }
  ]
});

X("compsci:4.5.6.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "ADC / DAC — AS every second year" },
    "**Steps an ADC performs** (3 marks): the analogue signal is **sampled at regular/fixed time intervals**; the **amplitude (voltage) is measured** at each sample point; each measurement is **coded into a fixed number of bits** (binary). *Name the component that converts sound to digital on a sound card* → **Analogue to Digital Converter** (full name and initials must match). **DAC** (AS 2025): converts the stored binary samples back into a continuous voltage/analogue signal to drive the speaker.",
    { callout: { t: "warn", body: "\"Digital to Analogue Converter (ADC)\" — a mismatched initialism scores 0. Write the full name and, if you add the initials, make them agree." }}
  ],
  flashcards: [
    ["Describe the steps an ADC performs.", "Samples the analogue signal at regular time intervals; measures the amplitude at each sample point; codes each measurement as a fixed number of bits."],
    ["What does a DAC do?", "Converts a sequence of binary sample values back into a continuous analogue signal (voltage), e.g. to drive a speaker."],
    ["Name the component on a sound card that digitises a microphone signal.", "Analogue to Digital Converter (ADC)."],
    ["Name the component that lets a sound card play a WAV file.", "Digital to Analogue Converter (DAC)."],
    ["What does a sensor + ADC pair do in a control system?", "The sensor produces an analogue signal; the ADC converts it to binary for the processor."],
    ["What happens at each sample point?", "The instantaneous amplitude is measured and quantised to the nearest level."],
    ["Why does a DAC output a stepped waveform?", "It holds each sample value until the next; filtering smooths the steps."],
    ["What determines how faithfully an ADC captures a signal?", "Sample rate (how often) and sample resolution (how many bits)."]
  ],
  quiz: [
    { q: "The first step of analogue-to-digital conversion is:", opts: ["compression", "sampling at regular intervals", "encryption", "playback"], ans: 1, why: "Sample, measure, encode." },
    { q: "A DAC is needed to:", opts: ["record from a microphone", "play digital audio through a speaker", "compress audio", "store MIDI"], ans: 1, why: "Binary → analogue voltage." },
    { q: "Each ADC measurement is stored as:", opts: ["a voltage", "a fixed number of bits", "an analogue value", "a MIDI message"], ans: 1, why: "Sample resolution bits." },
    { q: "'Digital to Analogue Converter (ADC)' as an answer scores:", opts: ["1", "0 — the initials do not match", "half", "1 if underlined"], ans: 1, why: "Mark-scheme R." },
    { q: "A thermometer sensor feeding a computer needs:", opts: ["a DAC", "an ADC", "MIDI", "a modem"], ans: 1, why: "Analogue in." },
    { q: "Measuring the amplitude of the signal at each sample point is called:", opts: ["sampling", "quantisation/measurement", "compression", "normalisation"], ans: 1, why: "Second ADC step." }
  ],
  exam: [
    { level: "AS", src: "AS 2020 P2 Q3.1", q: "Describe the steps an analogue-to-digital converter carries out to convert a sound signal into digital form.", marks: 3,
      ms: ["The analogue signal is sampled at regular / fixed time intervals (1)", "The amplitude (voltage) of the signal is measured at each sample point (1)", "Each measurement is coded / stored as a fixed number of bits (1)"] },
    { level: "AS", src: "AS 2025 P2 Q4.2", q: "Describe the role of a digital-to-analogue converter in playing back a sound file.", marks: 2,
      ms: ["Takes the binary sample values from the file in sequence (1)", "Produces a continuous / analogue voltage from them to drive the loudspeaker (1)"] },
    { src: "AQA 2023 P2 Q1.3", q: "Name the component of a sound card that converts a digital sound file into a signal that can be sent to a loudspeaker.", marks: 1,
      ms: ["Digital to Analogue Converter (DAC) (1)"] }
  ]
});

X("compsci:4.5.6.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Bitmaps — the file-size calculation" },
    "**Minimum file size = width × height × colour depth (bits) ÷ 8** bytes. Then convert to the unit asked (÷ 1024 for KiB, ÷ 1000 for kB). Variants: find the **colour depth** from image size and file size (file bits ÷ pixels); find **how many images fit** on a card (capacity ÷ image size, rounded down); find the **minimum colour depth for n colours** (smallest b with 2ᵇ ≥ n). Then: *why is the real file larger?* — **metadata** (width, height, colour depth, format).",
    { callout: { t: "tip", body: "Show every multiplication on its own line — the schemes award a method mark for *any three of* the steps even when the arithmetic slips." }}
  ],
  flashcards: [
    ["What is a pixel?", "The smallest addressable element of a bitmap image — one colour value."],
    ["Define resolution.", "The number of pixels in the image, usually width × height (or pixels per inch for print)."],
    ["Define colour depth.", "The number of bits used to store the colour of each pixel."],
    ["Formula for the minimum size of a bitmap file?", "width × height × colour depth (bits), ÷ 8 for bytes."],
    ["Size of a 4000 × 3000 image at 24-bit colour?", "4000 × 3000 × 24 / 8 = 36 000 000 bytes ≈ 34.3 MiB."],
    ["Minimum colour depth for 18 colours?", "5 bits (2⁴ = 16 < 18 ≤ 32)."],
    ["Why is the actual file bigger than the calculated minimum?", "Metadata — width, height, colour depth, file format, creation date — is stored too."],
    ["A 200 × 100 image has a 15 000-byte file with no metadata. Colour depth?", "15 000 × 8 / 20 000 = 6 bits."]
  ],
  quiz: [
    { q: "A 50 × 50 image with 4 colours needs at least:", opts: ["2500 bytes", "625 bytes", "10 000 bytes", "1250 bytes"], ans: 1, why: "2 bits per pixel: 2500 × 2 / 8." },
    { q: "16 × 16 pixels at 8-bit colour, minimum size:", opts: ["256 bytes", "2048 bytes", "128 bytes", "16 bytes"], ans: 0, why: "256 × 8 / 8." },
    { q: "Increasing colour depth from 8 to 16 bits:", opts: ["doubles file size", "halves file size", "no change", "quadruples it"], ans: 0, why: "Bits per pixel doubled." },
    { q: "A file is larger than width × height × depth because of:", opts: ["compression", "metadata", "pixels", "resolution"], ans: 1, why: "Header information." },
    { q: "Colour depth for 5 colours must be at least:", opts: ["2", "3", "5", "8"], ans: 1, why: "2² = 4 < 5 ≤ 8." },
    { q: "How many 36 MB images fit on a 4 GB card (decimal units)?", opts: ["111", "100", "1111", "9"], ans: 0, why: "4000 / 36 = 111.1 → 111." }
  ],
  exam: [
    { src: "AQA 2024 P2 Q2", ctx: "A camera produces 4000 × 3000 pixel images with a colour depth of 24 bits, stored uncompressed with no metadata.",
      parts: [
        { q: "Calculate the size of one image in mebibytes, to 2 decimal places. Show your working.", marks: 2, ms: ["4000 × 3000 × 24 / 8 = 36 000 000 bytes (1)", "÷ 1024² = 34.33 MiB (1)"] },
        { q: "The camera's memory card holds 16 GiB. Calculate how many images it can store.", marks: 1, ms: ["16 × 1024 / 34.33 = 477 (rounded down) (1)"] }
      ] },
    { level: "AS", src: "AS 2024 P2 Q3", ctx: "A 640 × 480 bitmap image is stored in a file of 307 200 bytes. The file also contains some additional information.",
      parts: [
        { q: "Ignoring the additional information, calculate the colour depth of the image.", marks: 2, ms: ["307 200 × 8 = 2 457 600 bits ÷ (640 × 480 = 307 200 pixels) (1)", "8 bits (1)"] },
        { q: "State the name given to the additional information and give one example of what it might contain.", marks: 1, ms: ["Metadata — e.g. width, height, colour depth, date created (1)"] }
      ] },
    { level: "AS", src: "AS 2018 P2 Q12", q: "An image is 120 pixels wide and 80 pixels high and uses five colours. Calculate the minimum file size in bytes, showing your working.", marks: 3,
      ms: ["Five colours need 3 bits per pixel (1)", "120 × 80 × 3 = 28 800 bits (1)", "÷ 8 = 3600 bytes (1)"] }
  ]
});

X("compsci:4.5.6.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "How a vector graphic is represented (2018, 3 marks)" },
    "A vector graphic is a **list of objects / shapes** (line, circle, rectangle…), each with **properties** — start/end coordinates, centre and radius, fill colour, line thickness — stored as **values in a drawing list**; the image is **rendered by calculation** when displayed. Give a concrete example: *circle: centre (40, 60), radius 20, fill red*.",
    { callout: { t: "tip", body: "The comparison question (2019 — 6 marks; 2021 — 3 + 2) rewards linking each property to a consequence: *stored as shape descriptions → file size independent of resolution → scales without pixelation*." }}
  ],
  flashcards: [
    ["How is a vector graphic represented?", "As a list of geometric objects (lines, circles, polygons…), each with properties such as coordinates, size, colour and line thickness, stored as values in a drawing list and rendered by calculation."],
    ["Give the properties stored for a circle in a vector image.", "Centre coordinates, radius, fill colour, line colour and thickness."],
    ["Give the properties stored for a line.", "Start and end coordinates, colour, thickness (and style)."],
    ["Why can a vector image be scaled without loss of quality?", "The shapes are recalculated at the new size — nothing is stored as pixels."],
    ["What is a drawing list?", "The list of objects and their properties that make up a vector image."],
    ["What happens when a vector graphic is displayed?", "It is rendered — the shapes are converted to pixels at the display's resolution."],
    ["Name a common vector file format.", "SVG (also PDF paths, fonts)."],
    ["Why is a vector logo file small?", "Only a few shapes with their properties are stored, regardless of the size at which it is shown."]
  ],
  quiz: [
    { q: "A vector graphic stores:", opts: ["a colour per pixel", "shapes and their properties", "samples", "MIDI events"], ans: 1, why: "Object list." },
    { q: "A property NOT typical of a vector object:", opts: ["radius", "fill colour", "pixel grid position", "line thickness"], ans: 2, why: "Vectors have no pixel grid." },
    { q: "Scaling a vector image ×10:", opts: ["pixelates", "stays sharp — recalculated", "loses colour", "increases file size ×100"], ans: 1, why: "Rendered from geometry." },
    { q: "The list of objects in a vector image is the:", opts: ["bitmap", "drawing list", "palette", "sample table"], ans: 1, why: "Term used in the spec." },
    { q: "Vector graphics are rendered:", opts: ["at file creation", "when displayed, at the device's resolution", "never", "by the ADC"], ans: 1, why: "Calculation on display." },
    { q: "Best format for a company logo used at many sizes:", opts: ["bitmap", "vector", "MIDI", "WAV"], ans: 1, why: "Scales cleanly." }
  ],
  exam: [
    { src: "AQA 2018 P2 Q2.1", q: "Describe how a vector graphic is represented, using an example.", marks: 3,
      ms: ["As a list of geometric objects / shapes such as lines, circles and rectangles (1)", "Each object has properties — e.g. coordinates, radius, fill colour, line thickness — stored as values (1)", "e.g. `circle: centre (40, 60), radius 20, fill red`; the image is rendered by calculation when displayed (1)"] }
  ]
});

X("compsci:4.5.6.6", {
  flashcards: [
    ["Why is a vector file often smaller than a bitmap of the same image?", "Only the shapes and their properties are stored — a few values per object — whereas a bitmap stores a value for every pixel."],
    ["Give two advantages of vector graphics.", "Scale without loss of quality; usually smaller files; individual objects can be edited/moved independently."],
    ["Give two advantages of bitmaps.", "Can represent photographs / complex images with continuous colour variation; simpler to render; every pixel can be edited."],
    ["When is a bitmap the only sensible choice?", "Photographs and scanned images — real scenes cannot be described as a small list of shapes."],
    ["What happens when a bitmap is enlarged?", "Pixels are stretched/interpolated — the image becomes blocky (pixelated)."],
    ["When might a vector file be larger than the bitmap?", "A highly detailed image needing thousands of objects, versus a small low-depth bitmap."],
    ["Which format is resolution-independent?", "Vector."],
    ["How does editing differ?", "Vector: change an object's properties. Bitmap: change individual pixels."]
  ],
  quiz: [
    { q: "For a photograph, the better representation is:", opts: ["vector", "bitmap", "MIDI", "either"], ans: 1, why: "Continuous colour variation." },
    { q: "Enlarging a bitmap causes:", opts: ["sharper edges", "pixelation", "smaller file", "no change"], ans: 1, why: "Fixed pixel grid." },
    { q: "A vector file is smaller than a bitmap because:", opts: ["it is compressed", "it stores a few properties per shape rather than every pixel", "it has fewer colours", "it is lossy"], ans: 1, why: "2021 P2 Q1.2." },
    { q: "Moving one shape independently is easy in:", opts: ["bitmap", "vector", "both", "neither"], ans: 1, why: "Objects are separate." },
    { q: "Which is resolution-dependent?", opts: ["vector", "bitmap", "SVG", "font outline"], ans: 1, why: "Pixel grid fixed." },
    { q: "A simple diagram of 20 shapes is best stored as:", opts: ["bitmap", "vector", "WAV", "text"], ans: 1, why: "Tiny file, scalable." }
  ],
  exam: [
    { src: "AQA 2021 P2 Q1", ctx: "A company logo consisting of a few coloured shapes is stored as both a 1200 × 800 24-bit bitmap and as a vector graphic.",
      parts: [
        { q: "Explain why the vector file is much smaller than the bitmap file.", marks: 3, ms: ["The bitmap stores a colour value for every one of the 960 000 pixels (1)", "The vector graphic stores only each shape's type and properties — coordinates, size, colour (1)", "A few shapes need only a few values, so far less data regardless of the image's dimensions (1)"] },
        { q: "State two other advantages of storing the logo as a vector graphic.", marks: 2, ms: ["It can be scaled to any size without loss of quality / pixelation (1)", "Individual shapes can be edited, moved or recoloured independently (1)"] }
      ] },
    { src: "AQA 2019 P2 Q13", q: "Compare bitmap and vector graphics, explaining for what kinds of image each is more suitable.", marks: 6,
      ms: ["Bitmap: grid of pixels each with a colour value; vector: list of shapes with properties (1)", "Bitmap file size depends on resolution and colour depth; vector file size depends on the number of objects (1)", "Bitmaps pixelate when enlarged; vectors scale without loss of quality (1)", "Bitmaps suit photographs / images with continuous tone that cannot be described as shapes (1)", "Vectors suit logos, diagrams, fonts and technical drawings made of distinct shapes (1)", "Vector objects can be edited individually; bitmaps are edited pixel by pixel (1)"] }
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
    ["Define sampling rate.", "The number of samples taken per second (Hz)."],
    ["Define sample resolution.", "The number of bits used to store each sample."],
    ["State Nyquist's theorem.", "To reproduce a signal faithfully the sample rate must be at least twice the highest frequency component in the signal."],
    ["File size for 30 s at 20 000 Hz, 16-bit, mono?", "30 × 20 000 × 16 / 8 = 1 200 000 bytes."],
    ["Duration of a 17.199 MB file at 44 100 Hz, 16-bit mono?", "17 199 000 × 8 / (44 100 × 16) ≈ 195 s."],
    ["What is quantisation error and how is it reduced?", "The rounding of each measured amplitude to the nearest available level; reduce it by increasing the sample resolution."],
    ["What does a stored sample represent?", "The amplitude of the sound wave at the instant it was sampled, as a binary number."],
    ["How does increasing the sample rate affect quality and size?", "Higher frequencies captured, closer approximation — and proportionally larger file."]
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
    ["How does MIDI represent music?", "As a sequence of event messages (instructions) — e.g. note on, note off, pitch, velocity, duration, channel, instrument — rather than as sampled sound."],
    ["Give three items a MIDI message might contain.", "Note on/off, note number (pitch), velocity (loudness), channel, instrument/program, duration, pitch bend."],
    ["Give three advantages of MIDI over sampled sound.", "Much more compact; easy to edit individual notes or change instruments; no quantisation/sampling loss; a score can be generated from the file."],
    ["Give one limitation of MIDI.", "It cannot represent real recorded sounds such as a voice — only instructions for synthesised instruments."],
    ["Why are MIDI files small?", "A note is a few bytes of instruction rather than thousands of samples."],
    ["What is a MIDI channel?", "One of 16 logical streams, each usually assigned to an instrument."],
    ["What is velocity in MIDI?", "How hard the key was pressed — controls loudness/attack."],
    ["How is a MIDI file turned into sound?", "A synthesiser / sound card interprets the messages and generates the audio."]
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
    ["Why is dictionary compression ineffective on a short text?", "Little repetition to exploit, and the dictionary itself takes space."],
    ["Why suit RLE to images and dictionaries to text?", "Images often have adjacent pixels of the same colour; text repeats words spread throughout rather than adjacent identical characters."],
    ["Give one problem with lossy compression of audio.", "The original cannot be recovered — quality is reduced and later editing is limited."]
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
    ["What is encryption?", "Transforming plaintext into ciphertext using a key so that it cannot be understood without the key."],
    ["Encrypt `HELLO` with a Caesar shift of 3.", "KHOOR."],
    ["Why is a Caesar cipher easy to crack?", "Only 25 keys to try, and letter frequencies of the ciphertext match those of the plaintext (frequency analysis)."],
    ["Why is a general substitution cipher harder to crack than Caesar?", "There are 26! possible keys and no pattern — learning one letter's replacement reveals nothing about the others."],
    ["Describe the Vernam cipher.", "Convert plaintext and a random key of equal length to binary; XOR them bit by bit; the result is the ciphertext; XOR with the key again recovers the plaintext."],
    ["Conditions for the Vernam cipher to be perfectly secure?", "The key is truly random, at least as long as the plaintext, used only once, and kept secret."],
    ["What does computationally secure mean?", "The cipher cannot be cracked by any known method in a reasonable (polynomial) amount of time — not that it can never be cracked."],
    ["Symmetric vs asymmetric encryption?", "Symmetric: the same key encrypts and decrypts. Asymmetric: a pair of different but related keys — one encrypts, the other decrypts."],
    ["What is the key exchange problem?", "With symmetric encryption the key must be passed to the receiver securely, without interception."],
    ["What is a weakness shared by every substitution cipher?", "Each plaintext letter always maps to the same ciphertext letter, preserving frequencies and structure."]
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
