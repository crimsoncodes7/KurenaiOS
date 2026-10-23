/* Kurenai OS — data/ja-s1.js
   Stage 1 (基 Foundations), released one unit at a time (docs/japanese-plan.md §3.1). AUTHORED:
   every gloss, note and sentence here is written for KurenaiOS (no dictionary data is embedded;
   the reader's lookup is a later release). This release: unit F1, First conversations.

   Items it adds to KOS_JA.ITEMS (§4.1):
     w:<written form>  a word      { w, r (kana), ruby (markup), en: [glosses], forms?, note? }
     j:<kanji>         a kanji     { w, r (the reading asked), in (the word it is read in), en }
     g:<slug>          a grammar point { w (the pattern), en, note,
                         says:      [{ ja (markup), kana, en }] — heard, read and written back
                         particles: [{ before, after, en, target, options, accept?, wrong? }]
                         builds:    [{ en, chunks, natural, last?, lastWhy?, before? }] }
   A lesson: { id, unit, title, can, items, produce } — `produce` is its production set (the words
   that later get a Writing facet, invariant 113). */
(function () {
  "use strict";
  var J = window.KOS_JA, I = J.ITEMS;

  function word(w, r, en, o) {
    o = o || {};
    I["w:" + w] = { key: "w:" + w, kind: "word", w: w, r: r, ruby: o.ruby || w, en: en, forms: o.forms || null, note: o.note || null };
    return "w:" + w;
  }
  function kanji(ch, r, inWord, en, note) {
    I["j:" + ch] = { key: "j:" + ch, kind: "kanji", w: ch, r: r, in: inWord, en: en, note: note || null };
    return "j:" + ch;
  }
  function gram(slug, w, en, o) {
    o = o || {};
    I["g:" + slug] = { key: "g:" + slug, kind: "grammar", w: w, en: en, note: o.note || null,
      says: o.says || [], particles: o.particles || [], builds: o.builds || [] };
    return "g:" + slug;
  }
  function s(ja, kana, en) { return { ja: ja, kana: kana, en: en }; }
  function chunks(list) { return list.map(function (t, i) { return { id: String.fromCharCode(97 + i), t: t }; }); }
  function build(en, parts, o) {
    o = o || {};
    var c = chunks(parts), ids = c.map(function (x) { return x.id; });
    return { en: en, chunks: c, natural: ids, last: ids[ids.length - 1], lastWhy: o.lastWhy || null, before: o.before || [] };
  }

  /* ================= 1.1 This, that and that over there ================= */
  var L11 = [
    word("これ", "これ", ["this", "this one"], { note: "near me, the speaker" }),
    word("それ", "それ", ["that", "that one"], { note: "near you, the listener" }),
    word("あれ", "あれ", ["that over there", "that", "that one over there"], { note: "far from both of us" }),
    word("どれ", "どれ", ["which", "which one"], { note: "the question word of the set" }),
    word("本", "ほん", ["book"], { ruby: "{本|ほん}" }),
    word("ペン", "ぺん", ["pen"]),
    word("かさ", "かさ", ["umbrella"], { note: "often written 傘" }),
    word("ケーキ", "けーき", ["cake"]),
    word("ねこ", "ねこ", ["cat"], { note: "often written 猫" }),
    word("なん", "なん", ["what"], { forms: [{ w: "なん", r: "なん" }, { w: "何", r: "なん" }, { w: "なに", r: "なに" }], note: "なん before です; written 何 later" }),
    kanji("本", "ほん", "w:本", ["book", "origin"], "A tree 木 with a line marking its root: the origin — and a book."),
    gram("wa-desu", "〜は 〜です", "X is Y", {
      note: "は marks the topic; です ends a polite statement.",
      says: [s("これは{本|ほん}です。", "これはほんです", "This is a book."), s("それはペンです。", "それはぺんです", "That (near you) is a pen."), s("あれはねこです。", "あれはねこです", "That over there is a cat.")],
      particles: [
        { before: "これ", after: "{本|ほん}です。", en: "This is a book.", target: "は", options: ["は", "が", "を", "の"],
          accept: { "が": "Also grammatical: が puts the weight on “this one” — an answer to “which is the book?”." },
          wrong: { "を": "を marks what a verb acts on; です has no object.", "の": "これの本 is not Japanese: この本 is “this book”." } },
        { before: "あれ", after: "ねこです。", en: "That over there is a cat.", target: "は", options: ["は", "を", "か", "の"],
          wrong: { "を": "を marks what a verb acts on.", "か": "か goes at the end of a sentence." } }
      ],
      builds: [build("This is a book.", ["これは", "{本|ほん}", "です"], { before: [["a", "b", "The topic (これは) comes before what you say about it."]] }),
        build("That over there is a cat.", ["あれは", "ねこ", "です"], { before: [["a", "b", "The topic (あれは) comes before what you say about it."]] })]
    }),
    gram("kosoa", "これ・それ・あれ", "this / that / that over there", {
      note: "Chosen by where the thing is: near me, near you, or far from us both.",
      says: [s("これはケーキです。", "これはけーきです", "This is cake."), s("それはかさです。", "それはかさです", "That (near you) is an umbrella."), s("あれは{本|ほん}です。", "あれはほんです", "That over there is a book.")],
      builds: [build("That (near you) is an umbrella.", ["それは", "かさ", "です"], { before: [["a", "b", "The topic (それは) comes first."]] })]
    }),
    gram("ka", "〜ですか", "a question", {
      note: "か at the very end makes a question. Written Japanese needs no question mark.",
      says: [s("これはなんですか。", "これはなんですか", "What is this?"), s("それはケーキですか。", "それはけーきですか", "Is that (near you) cake?"), s("ペンはどれですか。", "ぺんはどれですか", "Which one is the pen?")],
      particles: [{ before: "これはなんです", after: "。", en: "What is this?", target: "か", options: ["か", "は", "の", "も"], wrong: { "は": "は marks a topic; the question marker is か.", "の": "の links nouns; it doesn't make a question here." } }],
      builds: [build("What is that (near you)?", ["それは", "なん", "です", "か"], { lastWhy: "か goes at the very end: it turns the whole sentence into a question.", before: [["a", "b", "The topic (それは) comes first."], ["c", "d", "か follows です."]] })]
    })
  ];

  /* ================= 1.2 Nice to meet you ================= */
  var L12 = [
    word("わたし", "わたし", ["I", "me"], { note: "often written 私" }),
    word("はじめまして", "はじめまして", ["nice to meet you", "how do you do"], { note: "said only the first time you meet" }),
    word("よろしくおねがいします", "よろしくおねがいします", ["pleased to meet you", "nice to meet you", "please treat me well", "i look forward to working with you"]),
    word("さん", "さん", ["mr", "ms", "mrs", "miss"], { note: "after someone else's name — never your own" }),
    word("名前", "なまえ", ["name"], { ruby: "{名前|なまえ}" }),
    word("学生", "がくせい", ["student"], { ruby: "{学生|がくせい}" }),
    word("先生", "せんせい", ["teacher"], { ruby: "{先生|せんせい}" }),
    word("高校生", "こうこうせい", ["high school student", "high-school student"], { ruby: "{高校生|こうこうせい}" }),
    word("日本", "にほん", ["japan"], { ruby: "{日|に}{本|ほん}" }),
    word("日本人", "にほんじん", ["japanese person", "japanese"], { ruby: "{日|に}{本|ほん}{人|じん}" }),
    word("イギリス", "いぎりす", ["britain", "the uk", "uk", "england"]),
    word("ともだち", "ともだち", ["friend"], { note: "often written 友達" }),
    kanji("日", "に", "w:日本", ["day", "sun"], "The sun: a box with a line across. In 日本, “the sun's origin” — Japan."),
    kanji("人", "じん", "w:日本人", ["person"], "A person walking: two legs. After a country it reads じん."),
    gram("no", "〜の〜", "X's Y / Y of X", {
      note: "の links two nouns: the first one tells you which, whose or what kind.",
      says: [s("わたしの{名前|なまえ}はあかりです。", "わたしのなまえはあかりです", "My name is Akari."), s("{日本|にほん}の{本|ほん}です。", "にほんのほんです", "It's a Japanese book."), s("{先生|せんせい}のペンです。", "せんせいのぺんです", "It's the teacher's pen.")],
      particles: [{ before: "わたし", after: "{名前|なまえ}はあかりです。", en: "My name is Akari.", target: "の", options: ["の", "は", "を", "か"],
        wrong: { "は": "わたしは名前は… is two topics; “my name” is わたしの名前.", "を": "を marks what a verb acts on." } }],
      builds: [build("It's the teacher's pen.", ["{先生|せんせい}の", "ペン", "です"], { before: [["a", "b", "The owner (先生の) comes before the thing."]] })]
    }),
    gram("intro", "わたしは〜です", "introducing yourself", {
      note: "わたしは can drop once it's clear who you mean. さん goes after other people's names, never yours.",
      says: [s("わたしは{学生|がくせい}です。", "わたしはがくせいです", "I'm a student."), s("ようたさんは{高校生|こうこうせい}です。", "ようたさんはこうこうせいです", "Yōta is a high school student."), s("わたしはイギリス{人|じん}です。", "わたしはいぎりすじんです", "I'm British.")],
      particles: [{ before: "わたし", after: "{学生|がくせい}です。", en: "I'm a student.", target: "は", options: ["は", "の", "を", "か"],
        wrong: { "の": "わたしの学生 would be “my student”.", "を": "を marks what a verb acts on." } }],
      builds: [build("I'm British.", ["わたしは", "イギリス{人|じん}", "です"], { before: [["a", "b", "The topic (わたしは) comes first."]] })]
    }),
    gram("greet", "はじめまして・よろしく", "meeting someone", {
      note: "Set phrases, said as they are: はじめまして first, your name, then よろしくおねがいします.",
      says: [s("はじめまして。", "はじめまして", "Nice to meet you."), s("はじめまして、ようたです。", "はじめましてようたです", "Nice to meet you, I'm Yōta."), s("よろしくおねがいします。", "よろしくおねがいします", "Nice to meet you — I look forward to knowing you.")],
      builds: [build("Nice to meet you, I'm Akari. Pleased to know you.", ["はじめまして、", "あかりです。", "よろしくおねがいします"], { lastWhy: "よろしくおねがいします closes the introduction.", before: [["a", "b", "はじめまして comes first."]] })]
    })
  ];

  /* ================= 1.3 Yes, no and too ================= */
  var L13 = [
    word("はい", "はい", ["yes"]),
    word("いいえ", "いいえ", ["no"]),
    word("そう", "そう", ["so", "that way", "like that"], { note: "in そうです, “that's right”" }),
    word("ちがいます", "ちがいます", ["that's wrong", "it's different", "no, that's not right"]),
    word("コーヒー", "こーひー", ["coffee"]),
    word("お茶", "おちゃ", ["tea", "green tea"], { ruby: "お{茶|ちゃ}" }),
    word("水", "みず", ["water"], { ruby: "{水|みず}" }),
    word("パン", "ぱん", ["bread"]),
    word("いぬ", "いぬ", ["dog"], { note: "often written 犬" }),
    kanji("水", "みず", "w:水", ["water"], "Water running down the middle, splashing out to each side."),
    gram("ja-nai", "〜じゃないです", "is not", {
      note: "じゃないです is the polite “is not”. ではありません says the same, more formally.",
      says: [s("これはコーヒーじゃないです。", "これはこーひーじゃないです", "This isn't coffee."), s("ようたさんは{先生|せんせい}じゃないです。", "ようたさんはせんせいじゃないです", "Yōta isn't a teacher."), s("それは{水|みず}じゃないです。", "それはみずじゃないです", "That isn't water.")],
      builds: [build("This isn't coffee.", ["これは", "コーヒー", "じゃないです"], { lastWhy: "じゃないです takes the place of です at the end.", before: [["a", "b", "The topic (これは) comes first."]] })]
    }),
    gram("mo", "〜も", "also, too", {
      note: "も takes the place of は (or が, or を): “this TOO”. Never は and も together.",
      says: [s("これもパンです。", "これもぱんです", "This is bread too."), s("わたしも{学生|がくせい}です。", "わたしもがくせいです", "I'm a student too."), s("あれもいぬですか。", "あれもいぬですか", "Is that over there a dog too?")],
      particles: [{ before: "これ", after: "パンです。", en: "This is bread too.", target: "も", options: ["は", "も", "を", "の"], accept: {},
        wrong: { "は": "Grammatical, but the English says “too”: that is も.", "を": "を marks what a verb acts on." } },
        { before: "わたし", after: "{学生|がくせい}です。", en: "I'm a student too.", target: "も", options: ["も", "は", "か", "の"],
          wrong: { "は": "That says “I am a student” — the “too” is も.", "の": "わたしの学生 would be “my student”." } }],
      builds: [build("I'm a student too.", ["わたしも", "{学生|がくせい}", "です"], { before: [["a", "b", "The topic (わたしも) comes first."]] })]
    }),
    gram("sou", "はい、そうです・いいえ、ちがいます", "yes, that's right / no, that's wrong", {
      note: "Answer a です-question with はい、そうです or いいえ、ちがいます — or repeat the noun with じゃないです.",
      says: [s("はい、そうです。", "はいそうです", "Yes, that's right."), s("いいえ、ちがいます。", "いいえちがいます", "No, that's not right."), s("いいえ、お{茶|ちゃ}じゃないです。", "いいえおちゃじゃないです", "No, it isn't tea.")],
      builds: [build("No, it isn't water.", ["いいえ、", "{水|みず}", "じゃないです"], { before: [["a", "b", "いいえ comes first."]] })]
    })
  ];

  /* ================= 1.4 Numbers ================= */
  var NUM = [["一", "いち", 1, "one"], ["二", "に", 2, "two"], ["三", "さん", 3, "three"], ["四", "よん", 4, "four"], ["五", "ご", 5, "five"],
    ["六", "ろく", 6, "six"], ["七", "なな", 7, "seven"], ["八", "はち", 8, "eight"], ["九", "きゅう", 9, "nine"], ["十", "じゅう", 10, "ten"],
    ["百", "ひゃく", 100, "hundred", "a hundred", "one hundred"]];
  var ALT = { "四": ["し"], "七": ["しち"], "九": ["く"] };
  var L14 = [];
  NUM.forEach(function (n) {
    var forms = [{ w: n[0], r: n[1] }, { w: n[1], r: n[1] }].concat((ALT[n[0]] || []).map(function (a) { return { w: a, r: a }; }));
    L14.push(word(n[0], n[1], n.slice(3).concat([String(n[2])]), { ruby: "{" + n[0] + "|" + n[1] + "}", forms: forms, note: ALT[n[0]] ? "also " + ALT[n[0]].join(", ") : null }));
  });
  NUM.forEach(function (n) { L14.push(kanji(n[0], n[1], "w:" + n[0], [n[3]])); });
  L14.push(word("ゼロ", "ぜろ", ["zero", "0"], { note: "also れい" }));
  L14.push(word("なんさい", "なんさい", ["how old", "what age"], { note: "also おいくつ, more politely" }));
  L14.push(gram("tens", "十一〜九十九", "11 to 99", {
    note: "Build them like sums: じゅう + いち is 11, に + じゅう is 20, に + じゅう + ご is 25.",
    says: [s("{十一|じゅういち}", "じゅういち", "eleven"), s("{二十|にじゅう}", "にじゅう", "twenty"), s("{四十五|よんじゅうご}", "よんじゅうご", "forty-five"), s("{九十九|きゅうじゅうきゅう}", "きゅうじゅうきゅう", "ninety-nine")]
  }));
  L14.push(gram("age", "〜さいです", "being N years old", {
    note: "Age is the number plus さい. 1, 8 and 10 change their sound: いっさい, はっさい, じゅっさい.",
    says: [s("ようたさんは{十六|じゅうろく}さいです。", "ようたさんはじゅうろくさいです", "Yōta is 16."), s("わたしは{十七|じゅうなな}さいです。", "わたしはじゅうななさいです", "I'm 17."), s("なんさいですか。", "なんさいですか", "How old are you?")],
    builds: [build("Yōta is 16.", ["ようたさんは", "{十六|じゅうろく}さい", "です"], { before: [["a", "b", "The topic (ようたさんは) comes first."]] })]
  }));

  /* ================= 1.5 Where is it? ================= */
  var L15 = [
    word("ここ", "ここ", ["here", "this place"]),
    word("そこ", "そこ", ["there", "that place"], { note: "near you" }),
    word("あそこ", "あそこ", ["over there", "that place over there"]),
    word("どこ", "どこ", ["where", "which place"]),
    word("駅", "えき", ["station", "train station"], { ruby: "{駅|えき}" }),
    word("トイレ", "といれ", ["toilet", "bathroom", "restroom"]),
    word("出口", "でぐち", ["exit", "way out"], { ruby: "{出|で}{口|ぐち}" }),
    word("入口", "いりぐち", ["entrance", "way in"], { ruby: "{入|いり}{口|ぐち}" }),
    word("ホーム", "ほーむ", ["platform", "station platform"]),
    word("きっぷ", "きっぷ", ["ticket"], { note: "often written 切符" }),
    word("すみません", "すみません", ["excuse me", "sorry"]),
    word("ありがとうございます", "ありがとうございます", ["thank you", "thank you very much"]),
    kanji("口", "ぐち", "w:出口", ["mouth", "opening"], "An open mouth: a square. In 出口 it is the opening you go out of."),
    kanji("出", "で", "w:出口", ["go out", "exit"], "A plant pushing up out of the ground, twice over: going out."),
    kanji("入", "いり", "w:入口", ["enter", "go in"], "A person ducking in through a low doorway."),
    gram("koko", "ここ・そこ・あそこ・どこ", "here / there / over there / where", {
      note: "The これ set for places: ここ near me, そこ near you, あそこ far from both, どこ where?",
      says: [s("ここは{駅|えき}です。", "ここはえきです", "This (place) is the station."), s("トイレはあそこです。", "といれはあそこです", "The toilet is over there."), s("{出口|でぐち}はそこです。", "でぐちはそこです", "The exit is there (near you).")],
      builds: [build("The toilet is over there.", ["トイレは", "あそこ", "です"], { before: [["a", "b", "The topic (トイレは) comes first."]] })]
    }),
    gram("doko", "〜はどこですか", "where is X?", {
      note: "Put the thing you want as the topic, then どこですか. Start with すみません to a stranger.",
      says: [s("トイレはどこですか。", "といれはどこですか", "Where is the toilet?"), s("すみません、{出口|でぐち}はどこですか。", "すみませんでぐちはどこですか", "Excuse me, where is the exit?"), s("ホームはどこですか。", "ほーむはどこですか", "Where is the platform?")],
      particles: [{ before: "トイレ", after: "どこですか。", en: "Where is the toilet?", target: "は", options: ["は", "の", "を", "も"],
        wrong: { "の": "トイレのどこ is “where in the toilet”.", "を": "を marks what a verb acts on." } }],
      builds: [build("Excuse me, where is the exit?", ["すみません、", "{出口|でぐち}は", "どこですか"], { before: [["a", "b", "すみません comes first, to get attention."]] })]
    })
  ];

  /* ================= 1.6 At the café ================= */
  var L16 = [
    word("ください", "ください", ["please give me", "please"], { note: "after the thing you want, with を" }),
    word("いくら", "いくら", ["how much"]),
    word("円", "えん", ["yen"], { ruby: "{円|えん}" }),
    word("紅茶", "こうちゃ", ["black tea", "tea"], { ruby: "{紅茶|こうちゃ}" }),
    word("ジュース", "じゅーす", ["juice"]),
    word("サンドイッチ", "さんどいっち", ["sandwich"]),
    word("メニュー", "めにゅー", ["menu"]),
    word("いらっしゃいませ", "いらっしゃいませ", ["welcome", "come in"], { note: "what staff say when you walk in; you don't answer it" }),
    word("どうぞ", "どうぞ", ["here you are", "please", "go ahead"]),
    word("千", "せん", ["thousand", "a thousand", "1000"], { ruby: "{千|せん}" }),
    kanji("円", "えん", "w:円", ["yen", "circle"], "A round coin seen from the front: yen."),
    kanji("千", "せん", "w:千", ["thousand"], "十 with a stroke on top: ten, lifted to a thousand."),
    gram("kudasai", "〜をください", "X, please", {
      note: "を marks the thing you want; ください asks for it. Said on its own it is perfectly polite.",
      says: [s("コーヒーをください。", "こーひーをください", "Coffee, please."), s("ジュースをください。", "じゅーすをください", "Juice, please."), s("メニューをください。", "めにゅーをください", "The menu, please.")],
      particles: [{ before: "コーヒー", after: "ください。", en: "Coffee, please.", target: "を", options: ["を", "は", "の", "も"],
        accept: { "も": "Grammatical: “coffee too, please”." }, wrong: { "は": "は would make coffee the topic; the thing you ask for takes を.", "の": "の links two nouns." } }],
      builds: [build("A sandwich, please.", ["サンドイッチ", "を", "ください"], { lastWhy: "ください closes the request.", before: [["a", "b", "The thing comes before を."]] })]
    }),
    gram("ikura", "いくらですか・〜円です", "how much is it? / it's N yen", {
      note: "いくら is “how much”; the answer is the number plus 円.",
      says: [s("これはいくらですか。", "これはいくらですか", "How much is this?"), s("ケーキはいくらですか。", "けーきはいくらですか", "How much is the cake?"), s("{四百|よんひゃく}{円|えん}です。", "よんひゃくえんです", "It's 400 yen.")],
      builds: [build("How much is the juice?", ["ジュースは", "いくら", "ですか"], { before: [["a", "b", "The topic (ジュースは) comes first."]] })]
    }),
    gram("hyaku", "三百・六百・八百・三千", "hundreds and thousands", {
      note: "Some hundreds and thousands change their sound: さんびゃく, ろっぴゃく, はっぴゃく, さんぜん, はっせん.",
      says: [s("{三百|さんびゃく}{円|えん}です。", "さんびゃくえんです", "It's 300 yen."), s("{六百|ろっぴゃく}{円|えん}です。", "ろっぴゃくえんです", "It's 600 yen."), s("{八百|はっぴゃく}{円|えん}です。", "はっぴゃくえんです", "It's 800 yen."), s("{三千|さんぜん}{円|えん}です。", "さんぜんえんです", "It's 3,000 yen.")]
    })
  ];

  /* ================= the unit ================= */
  function lesson(id, title, can, items, produce) {
    J.LESSONS[id] = { id: id, unit: "F1", title: title, can: can, items: items, produce: produce };
    return id;
  }
  var F1 = [
    lesson("1.1", "This, that and that over there", "Point at things and name them: これ・それ・あれ with は and です, and ask what something is.",
      L11, ["w:これ", "w:それ", "w:あれ", "w:本", "w:ケーキ", "w:なん"]),
    lesson("1.2", "Nice to meet you", "Introduce yourself and ask someone's name; join nouns with の.",
      L12, ["w:わたし", "w:はじめまして", "w:よろしくおねがいします", "w:名前", "w:学生", "w:日本人"]),
    lesson("1.3", "Yes, no and too", "Answer yes or no, say what something isn't, and add “too” with も.",
      L13, ["w:はい", "w:いいえ", "w:コーヒー", "w:お茶", "w:水"]),
    lesson("1.4", "Numbers to 100 and ages", "Count to 99, read 一 to 十 and 百, and say how old you are.",
      L14, ["w:一", "w:二", "w:三", "w:四", "w:五", "w:十"]),
    lesson("1.5", "Where is it?", "Ask where something is at a station and understand ここ・そこ・あそこ.",
      L15, ["w:ここ", "w:どこ", "w:駅", "w:トイレ", "w:すみません", "w:ありがとうございます"]),
    lesson("1.6", "At the café", "Order with をください, ask the price and understand it in yen.",
      L16, ["w:ください", "w:いくら", "w:円", "w:ジュース"])
  ];
  var s1 = J.STAGES.filter(function (st) { return st.id === "s1"; })[0];
  s1.units.push({ id: "F1", name: "First conversations", lessons: F1, checkpoint: "cp-F1",
    can: { R: "Read a café menu's prices and a station's signs.", L: "Follow a self-introduction and a price said aloud.", W: "Write an introduction and an order.", S: "Introduce yourself and order (when speaking is on)." } });
  J.CHECKPOINTS["cp-F1"] = { id: "cp-F1", unit: "F1", title: "First conversations checkpoint", skills: ["R", "W", "L"] };

  J.spine();
})();
