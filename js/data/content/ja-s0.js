/* Kurenai OS — data/content/ja-s0.js
   Stage 0 (仮 Kana): sixteen lessons, AUTHORED and original (docs/japanese-plan.md §3, design 28e).
   Every lesson has the design's six pages in order — Hook, Core idea, Listen & notice, Practice,
   Pitfalls, Quick reference — as KOS_CONTENT["ja:<ref>"] = { pages: [{ t, blocks }] }; the blocks
   are drawn by jatopic.js. Mnemonics are short pictures to hang a shape on, written for KurenaiOS.
   Readings are given in romaji only in Stage 0 (decision H). */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  var MNEMO = {
    /* hiragana */
    "あ": "An acrobat swinging round a pole: a.", "い": "Two eels side by side: ee — i.", "う": "A head bowed under a little hat, saying ooh: u.",
    "え": "A bird with a crest asking eh?: e.", "お": "A golfer with a hole in one — oh!: o.",
    "か": "A karate chop with a puff of breath: ka!", "き": "A key with two teeth: ki.", "く": "A beak opening for cuckoo: ku.",
    "け": "A keg leaning on a post: ke.", "こ": "Two short strokes, a co-pilot pair: ko.",
    "さ": "Like き with one bar fewer — a saw: sa.", "し": "A fish hook: she fishes — shi.", "す": "A swing seat on a looped rope: su.",
    "せ": "A mouth with one tooth saying say: se.", "そ": "A zigzag of sewing thread: so.",
    "た": "A t and an a side by side: ta.", "ち": "A cheerleader leaning back: chi.", "つ": "A tsunami wave curling over: tsu.",
    "て": "A tail-coat on a hook: te.", "と": "A toe with a thorn in it: to.",
    "な": "A knot tied on a cross: na.", "に": "A knee beside a stick: ni.", "ぬ": "Noodles caught by chopsticks: nu.",
    "ね": "A cat curled up, tail out — neko: ne.", "の": "A no-entry swirl: no.",
    "は": "A laughing face, ha!, beside a post: ha.", "ひ": "A wide smile, hee hee: hi.", "ふ": "Mount Fuji with drops around it: fu.",
    "へ": "A small hill you climb over: he.", "ほ": "A house with a chimney, ho ho: ho.",
    "ま": "Mama with her arms out: ma.", "み": "A 21 written in a hurry — me: mi.", "む": "A cow's tail swishing, moo: mu.",
    "め": "An eye with a loop beside it: me.", "も": "A hook with more bait on it: mo.",
    "や": "A yak's two horns: ya.", "ゆ": "A unique fish swimming: yu.", "よ": "A yo-yo on its string: yo.",
    "ら": "A rabbit with one ear up: ra.", "り": "Two reeds by the river: ri.", "る": "A road with a loop at the end of the route: ru.",
    "れ": "A ray gliding with its tail: re.", "ろ": "る without its loop — a plain road: ro.",
    "わ": "A wasp folding its wing: wa.", "を": "Someone tripping — whoa!: o, only ever the particle.", "ん": "An n scribbled in a hurry: n.",
    /* katakana */
    "ア": "An axe on its side: a.", "イ": "An easel leaning: i.", "ウ": "う with a roof: u.", "エ": "An elevator shaft: e.", "オ": "An opera singer with arms out: o.",
    "カ": "か without its dot — a sharp ka.", "キ": "A key with two teeth, straightened: ki.", "ク": "A cook's hat bent over: ku.", "ケ": "A ke-g tipped up: ke.", "コ": "A corner, open to the left: ko.",
    "サ": "A signpost with two legs: sa.", "シ": "Three drops slanting UP — she smiles: shi.", "ス": "A swing seat, angular: su.", "セ": "せ in straight lines: se.", "ソ": "Two strokes slanting DOWN — sew: so.",
    "タ": "ク with an extra stroke — ta-da: ta.", "チ": "A cheerleader with a pole: chi.", "ツ": "Three drops falling DOWN — tsu.", "テ": "A telegraph pole: te.", "ト": "A totem with one arm: to.",
    "ナ": "A knife across a stick: na.", "ニ": "Two lines, ni (two): ni.", "ヌ": "A noose-like X: nu.", "ネ": "A net on a pole: ne.", "ノ": "One slash — no!: no.",
    "ハ": "Two strokes like a laugh, ha: ha.", "ヒ": "A heel with a hook: hi.", "フ": "A fu-ll hook: fu.", "ヘ": "The same hill as へ: he.", "ホ": "A cross with legs — a holy cross: ho.",
    "マ": "A mama's apron: ma.", "ミ": "Three lines, me-me-me: mi.", "ム": "A moo-se's head: mu.", "メ": "A cross mark, me!: me.", "モ": "More lines on a post: mo.",
    "ヤ": "A yak's single horn: ya.", "ユ": "A U-bend pipe: yu.", "ヨ": "A yo-yo sideways: yo.",
    "ラ": "A ram's head: ra.", "リ": "Two reeds, as り: ri.", "ル": "Two roots: ru.", "レ": "A leg kicking up: re.", "ロ": "A box, a road sign: ro.",
    "ワ": "A wa-ve breaking: wa.", "ヲ": "ヨ with a slash: o, as を.", "ン": "One drop and a rising stroke — n."
  };

  function lesson(ref, o) {
    // the cards are the lesson's own kana items (js/data/ja.js), so the page and the practice never disagree
    var ks = window.KOS_JA.LESSONS[ref].items.filter(function (k) { return k.indexOf("k:") === 0; }).map(function (k) { return k.slice(2); });
    var pages = [
      { t: "Hook", blocks: [{ p: o.hook }].concat(o.hookLines.map(function (l) { return { line: l }; })) },
      { t: "Core idea", blocks: [{ p: o.core }].concat([{ kana: ks, mnemo: MNEMO }]).concat(o.coreMore || []) },
      { t: "Listen & notice", blocks: [{ p: o.listen }].concat(o.listenLines.map(function (l) { return { line: l }; })).concat(o.pairs ? o.pairs.map(function (p) { return { pair: p }; }) : []) },
      { t: "Practice", blocks: [{ p: "Read each new kana, write it in the square, then hear the difference. The grade comes from your answers; nothing to tick." }, { go: ks.length + " kana · about 8 minutes" }] },
      { t: "Pitfalls", blocks: o.pitfalls.map(function (p) { return { callout: { t: p[0], body: p[1] } }; }) },
      { t: "Quick reference", blocks: [{ table: { head: o.refHead || ["Kana", "Sound", "Remember"], rows: o.refRows || ks.map(function (k) { return [k, (window.KOS_JA.ITEMS["k:" + k] || {}).r || "", (MNEMO[k] || "").replace(/:.*$/, "")]; }) } }] }
    ];
    C["ja:" + ref] = { pages: pages };
  }
  var A = "akari", Y = "yota", N = "narrator";

  /* ---------------- hiragana ---------------- */
  lesson("H1", {
    hook: "Every Japanese sentence you will read is built from about fifty sounds. These ten come first: the five vowels, and the five sounds that start with k.",
    hookLines: [{ who: A, ja: "あい", en: "love" }, { who: A, ja: "あおい", en: "blue" }, { who: Y, ja: "かき", en: "persimmon" }],
    core: "Hiragana are a sound alphabet: one kana is one beat. The vowels are short and pure — a as in father, i as in machine, u with relaxed lips, e as in bed, o as in more without the r. Add k in front and you have the か row.",
        listen: "Every kana takes the same time — one beat. Listen for the evenness: a-o-i is three beats, ka-ki is two.",
    listenLines: [{ who: N, ja: "あ い う え お" }, { who: N, ja: "か き く け こ" }, { who: A, ja: "いえ", en: "house" }, { who: Y, ja: "ここ", en: "here" }],
    pitfalls: [["き and さ", "き has two crossbars; さ has one. Count them before you answer."], ["う is short", "Japanese u is quick and the lips stay relaxed — not the long English oo."], ["Stroke order matters", "Write each kana in the order the animation shows. The check names any stroke out of turn."]]
  });
  lesson("H2", {
    hook: "Ten more sounds: the s row and the t row. Two of them are spelled differently in romaji — shi and chi — because that is how they sound.",
    hookLines: [{ who: A, ja: "すし", en: "sushi" }, { who: Y, ja: "あした", en: "tomorrow" }],
    core: "The さ row is sa shi su se so, and the た row is ta chi tsu te to. し, ち and つ break the pattern on purpose: Japanese has no si, ti or tu sound.",
        listen: "Hear tsu: the t and s run together in one beat. It is never two beats.",
    listenLines: [{ who: N, ja: "さ し す せ そ" }, { who: N, ja: "た ち つ て と" }, { who: A, ja: "つくえ", en: "desk" }, { who: Y, ja: "そと", en: "outside" }],
    pitfalls: [["さ and ち", "Mirror images of each other: さ opens left at the bottom, ち opens right."], ["そ in one stroke", "そ is written in one continuous stroke; some fonts show it as two."], ["つ is one beat", "Don't add a vowel after the t: tsu, not tusu."]]
  });
  lesson("H3", {
    hook: "The n row and the h row. は has a secret: as a particle it is said wa.",
    hookLines: [{ who: A, ja: "ねこ", en: "cat" }, { who: Y, ja: "はな", en: "flower" }],
    core: "The な row is na ni nu ne no; the は row is ha hi fu he ho. ふ is said with the lips, softly — between f and h.",
        listen: "Listen to ふ: a soft breath through the lips, not a hard English f.",
    listenLines: [{ who: N, ja: "な に ぬ ね の" }, { who: N, ja: "は ひ ふ へ ほ" }, { who: A, ja: "ふね", en: "boat" }, { who: Y, ja: "ほし", en: "star" }],
    pitfalls: [["ぬ, め and ね", "ぬ and め are twins, but ぬ ends in a loop. ね ends in a loop too, with a straight left stroke."], ["は and ほ", "ほ has an extra crossbar on top."], ["は as a particle", "When は marks the topic it is said wa. You will meet it in Stage 1."]]
  });
  lesson("H4", {
    hook: "The m, y and r rows. The Japanese r is a light tap of the tongue — between an English r, l and d.",
    hookLines: [{ who: A, ja: "やま", en: "mountain" }, { who: Y, ja: "さくら", en: "cherry blossom" }],
    core: "The ま row is ma mi mu me mo; the や row is ya yu yo (only three); the ら row is ra ri ru re ro.",
        listen: "Hear the tap in ら: the tongue touches once, quickly, behind the teeth.",
    listenLines: [{ who: N, ja: "ま み む め も" }, { who: N, ja: "や ゆ よ" }, { who: N, ja: "ら り る れ ろ" }, { who: A, ja: "よる", en: "night" }],
    pitfalls: [["る and ろ", "る ends with a loop; ろ does not."], ["め and ぬ", "The same pair as before: ぬ has the loop."], ["The や row has three", "There is no yi or ye in modern Japanese."]]
  });
  lesson("H5", {
    hook: "The last three hiragana: わ, を and ん. With them you have all forty-six.",
    hookLines: [{ who: A, ja: "わたし", en: "I, me" }, { who: Y, ja: "ほん", en: "book" }],
    core: "わ is wa. を sounds exactly like お and is only ever the particle that marks an object. ん is the only kana with no vowel: a full beat of n.",
        listen: "ん is a whole beat. ほん is two beats: ho-n.",
    listenLines: [{ who: N, ja: "わ を ん" }, { who: A, ja: "ほん", en: "book" }, { who: Y, ja: "みかん", en: "mandarin" }],
    pitfalls: [["を is said o", "Written を, said o. Typing wo gives を."], ["ん counts", "ほん is two beats, みかん three. Give ん its full time."], ["わ, れ and ね", "わ ends in a curve; れ in a kick; ね in a loop."]]
  });
  lesson("H6", {
    hook: "Two small marks change a sound: ゛ (two dots) makes it voiced, and ゜ (a circle) turns h into p.",
    hookLines: [{ who: A, ja: "かぎ", en: "key" }, { who: Y, ja: "ぶた", en: "pig" }],
    core: "゛ turns k into g, s into z, t into d and h into b. ゜ turns h into p. じ and ぢ both sound ji; ず and づ both sound zu — じ and ず are the usual spellings.",
        listen: "Voicing is the hum of the throat. Put a hand on your throat: か is quiet, が buzzes.",
    listenLines: [{ who: N, ja: "か が" }, { who: N, ja: "は ば ぱ" }],
    pairs: [["かき", "かぎ"], ["てんき", "でんき"], ["ふた", "ぶた"]],
    pitfalls: [["The marks change the word", "かき is a persimmon; かぎ is a key. Listen for the buzz."], ["じ and ぢ", "Same sound. Write じ unless a word is built from ち."], ["Two dots, not three", "゛ is two short dots at the top right."]]
  });
  lesson("H7", {
    hook: "A small ゃ, ゅ or ょ after an i-sound kana squeezes two kana into one beat: き + ゃ = kya.",
    hookLines: [{ who: A, ja: "きょう", en: "today" }, { who: Y, ja: "しゃしん", en: "photo" }],
    core: "Combined sounds use a full-size i-row kana and a SMALL ゃ, ゅ or ょ. The pair is one beat. しゃ is sha, ちゃ is cha, じゃ is ja.",
    coreMore: [{ table: { head: ["", "ゃ", "ゅ", "ょ"], rows: [["き", "きゃ kya", "きゅ kyu", "きょ kyo"], ["し", "しゃ sha", "しゅ shu", "しょ sho"], ["ち", "ちゃ cha", "ちゅ chu", "ちょ cho"], ["に", "にゃ nya", "にゅ nyu", "にょ nyo"], ["ひ", "ひゃ hya", "ひゅ hyu", "ひょ hyo"], ["み", "みゃ mya", "みゅ myu", "みょ myo"], ["り", "りゃ rya", "りゅ ryu", "りょ ryo"]] } }],
    listen: "Size changes the sound: きや is two beats (ki-ya); きゃ is one (kya).",
    listenLines: [{ who: N, ja: "きゃ きゅ きょ" }, { who: N, ja: "しゃ しゅ しょ" }],
    pairs: [["きや", "きゃ"], ["びよういん", "びょういん"]],
    pitfalls: [["Size is meaning", "びょういん is hospital; びよういん is a hair salon."], ["One beat", "Don't sound the i: kya, not ki-ya."], ["Only after the i row", "ゃゅょ follow き し ち に ひ み り and their voiced forms."]],
    refHead: ["Pattern", "Sound", "Beats"], refRows: [["き + ゃ", "kya", "1"], ["し + ゅ", "shu", "1"], ["ち + ょ", "cho", "1"], ["じ + ゃ", "ja", "1"]]
  });
  lesson("H8", {
    hook: "Two kinds of length change words: a small っ (a held pause) and a long vowel (a held sound). They are the hardest part of hearing Japanese — and checked by ear here.",
    hookLines: [{ who: A, ja: "きって", en: "stamp" }, { who: Y, ja: "おばあさん", en: "grandmother" }],
    core: "A small っ is a silent beat before the next consonant: きって is ki-(pause)-te, three beats. A long vowel holds a sound for an extra beat: おばあさん is o-ba-a-sa-n, five beats. Long o is usually written う (こうこう) and long e is usually い (せんせい).",
        listen: "Count the beats. Each pair below differs only in length — which one do you hear?",
    listenLines: [{ who: N, ja: "きて きって" }, { who: N, ja: "おばさん おばあさん" }],
    pairs: [["きて", "きって"], ["かこ", "かっこ"], ["おばさん", "おばあさん"], ["ここ", "こうこう"]],
    pitfalls: [["Length changes the word", "おばさん (aunt) is four beats; おばあさん (grandmother) is five."], ["っ is silent", "Don't say tsu: っ is a held stop, one beat of silence."], ["Speech checks don't mark length", "Recognisers 'fix' a dropped っ, so length is trained here, by ear and in dictation."]],
    refHead: ["Spelling", "Example", "Beats"], refRows: [["small っ", "きって kitte", "3"], ["long a", "おばあさん obaasan", "5"], ["long o (う)", "こうこう kookoo", "4"], ["long e (い)", "せんせい sensee", "4"]]
  });

  /* ---------------- katakana ---------------- */
  var KH = "Katakana spell the same sounds as hiragana, in sharper shapes. They are used for words from other languages, names, and emphasis — the menus, game titles and sound effects you will see everywhere.";
  lesson("K1", { hook: KH, hookLines: [{ who: Y, ja: "ケーキ", en: "cake" }, { who: A, ja: "アイス", en: "ice cream" }],
    core: "The ア row and the カ row. Each katakana sounds exactly like its hiragana twin.",
    listen: "Same sounds as あ to こ — only the shapes are new.", listenLines: [{ who: N, ja: "ア イ ウ エ オ" }, { who: N, ja: "カ キ ク ケ コ" }],
    pitfalls: [["ア and マ", "ア's second stroke runs down; マ ends with a small tick."], ["ク and ケ", "ケ has a crossbar that pokes out."], ["カ is か", "Almost the same shape, without the dot."]] });
  lesson("K2", { hook: "The サ and タ rows — and the most famous look-alikes in Japanese: シ and ツ.", hookLines: [{ who: Y, ja: "テスト", en: "test" }, { who: A, ja: "シーツ", en: "sheet" }],
    core: "サ shi ス セ ソ and タ チ ツ テ ト. シ (shi) and ツ (tsu) differ only in the direction of the last stroke.",
    listen: "シーツ uses both: shi-i-tsu.", listenLines: [{ who: N, ja: "サ シ ス セ ソ" }, { who: N, ja: "タ チ ツ テ ト" }],
    pitfalls: [["シ and ツ", "シ's drops are stacked on the left and its last stroke rises from the bottom. ツ's are across the top and it falls from the top."], ["ソ and ン", "ソ's long stroke falls from the top; ン's rises from the bottom."], ["チ and テ", "チ has a slanting top; テ has two flat bars."]] });
  lesson("K3", { hook: "The ナ and ハ rows: some of the simplest katakana of all.", hookLines: [{ who: A, ja: "ノート", en: "notebook" }, { who: Y, ja: "ハート", en: "heart" }],
    core: "ナ ニ ヌ ネ ノ and ハ ヒ フ ヘ ホ. ヘ is the same shape as へ.",
    listen: "ー after a kana holds it: ノート is no-o-to, three beats.", listenLines: [{ who: N, ja: "ナ ニ ヌ ネ ノ" }, { who: N, ja: "ハ ヒ フ ヘ ホ" }],
    pitfalls: [["ヌ and ス", "ヌ has an extra short stroke across its tail."], ["ニ is two strokes", "Like the number 2 in kanji (二)."], ["ヘ is へ", "One shape in both scripts."]] });
  lesson("K4", { hook: "The マ, ヤ and ラ rows.", hookLines: [{ who: Y, ja: "ラーメン", en: "ramen" }, { who: A, ja: "メモ", en: "memo" }],
    core: "マ ミ ム メ モ, ヤ ユ ヨ, ラ リ ル レ ロ.",
    listen: "ラーメン: ra-a-me-n, four beats.", listenLines: [{ who: N, ja: "マ ミ ム メ モ" }, { who: N, ja: "ラ リ ル レ ロ" }],
    pitfalls: [["ロ is not 口", "ロ is the katakana ro; 口 is the kanji for mouth (slightly larger). Context tells them apart."], ["ユ and コ", "ユ's bottom stroke runs past the side."], ["リ is り", "Nearly the same in both scripts."]] });
  lesson("K5", { hook: "ワ, ヲ and ン complete the katakana.", hookLines: [{ who: A, ja: "ワイン", en: "wine" }, { who: Y, ja: "パン", en: "bread" }],
    core: "ワ wa, ヲ o (rare), ン n.", listen: "パン is two beats: pa-n.", listenLines: [{ who: N, ja: "ワ ヲ ン" }],
    pitfalls: [["ン and ソ", "ン's last stroke rises; ソ's falls."], ["ヲ is rare", "You will almost always see を instead."], ["ワ and ウ", "ウ has a dot on top."]] });
  lesson("K6", { hook: "゛ and ゜ work in katakana exactly as in hiragana.", hookLines: [{ who: Y, ja: "ゲーム", en: "game" }, { who: A, ja: "ピアノ", en: "piano" }],
    core: "ガ ザ ダ バ パ rows: the same rule — two dots voice the sound, the circle turns h into p.",
    listen: "Hear the buzz again.", listenLines: [{ who: N, ja: "カ ガ" }, { who: N, ja: "ハ バ パ" }], pairs: [["ゲート", "ケート"]],
    pitfalls: [["Same marks", "Nothing new to learn about ゛ and ゜ — only new shapes under them."], ["ヴ for v", "Some loanwords use ヴ (vu); most write バ instead."], ["Check the dots", "ガ and カ differ only by the dots."]] });
  lesson("K7", { hook: "Combined sounds in katakana: キャ, シュ, チョ…", hookLines: [{ who: A, ja: "チョコ", en: "chocolate" }, { who: Y, ja: "ジャム", en: "jam" }],
    core: "A small ャ, ュ or ョ after an i-row katakana, one beat — as in hiragana.",
    coreMore: [{ table: { head: ["", "ャ", "ュ", "ョ"], rows: [["キ", "キャ kya", "キュ kyu", "キョ kyo"], ["シ", "シャ sha", "シュ shu", "ショ sho"], ["チ", "チャ cha", "チュ chu", "チョ cho"], ["ジ", "ジャ ja", "ジュ ju", "ジョ jo"]] } }],
    listen: "One beat each.", listenLines: [{ who: N, ja: "キャ キュ キョ" }, { who: N, ja: "シャ シュ ショ" }],
    pitfalls: [["Size is meaning", "As in hiragana, the small kana makes one beat."], ["Common in menus", "シャツ (shirt), ジュース (juice), チャンス (chance)."], ["Read the size", "キヤ and キャ are different."]],
    refHead: ["Pattern", "Sound", "Beats"], refRows: [["キ + ャ", "kya", "1"], ["シ + ュ", "shu", "1"], ["チ + ョ", "cho", "1"]] });
  lesson("K8", { hook: "ー holds a vowel, and small vowels make sounds Japanese borrowed: ティ, ファ, ウェ.", hookLines: [{ who: Y, ja: "パーティー", en: "party" }, { who: A, ja: "カフェ", en: "café" }],
    core: "ー after a katakana holds its vowel for a beat (ケーキ, three beats). A small ァ ィ ゥ ェ ォ after a kana builds a new sound: ティ ti, ファ fa, ウェ we.",
    listen: "ケーキ is three beats; ケキ would be two.", listenLines: [{ who: N, ja: "ケーキ" }, { who: N, ja: "カフェ" }], pairs: [["ケキ", "ケーキ"]],
    pitfalls: [["ー follows the line", "Written across in horizontal text, down in vertical text."], ["ー is a beat", "Count it: コーヒー is ko-o-hi-i, four beats."], ["Small ッ too", "ッ works as っ does: ベッド (bed), three beats."]],
    refHead: ["Spelling", "Sound", "Example"], refRows: [["ー", "a held vowel", "ケーキ keeki"], ["ティ", "ti", "パーティー"], ["ファ", "fa", "ファン"], ["ッ", "a held pause", "ベッド"]] });
})();
