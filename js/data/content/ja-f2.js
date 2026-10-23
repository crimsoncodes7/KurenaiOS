/* Kurenai OS — data/content/ja-f2.js
   Stage 1, unit F2 (Days and times): six lessons, AUTHORED and original (docs/japanese-plan.md
   §4.2), on the same eight pages as F1 — Hook, Core idea, Patterns, Listen & notice, Pitfalls,
   Culture & usage, Practise, Quick reference — with a media moment on each Hook, at least eight
   voiced examples, a graded passage and a shadowing set (smoke82). Speakers: akari, yota, makoto,
   narrator. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};
  var J = window.KOS_JA;
  var A = "akari", Y = "yota", M = "makoto", N = "narrator";
  function L(who, ja, en) { return { who: who, ja: ja, en: en }; }
  function F(who, ja, en, face, other) { var l = L(who, ja, en); l.face = face; if (other) l.other = other; return l; }
  function pt(f, en, eg, egEn) { return { pattern: { f: f, en: en, eg: eg, egEn: egEn } }; }
  function tip(t, body) { return { callout: { t: t, body: body } }; }

  /* the Quick reference is built from the lesson's own items, so it can never disagree with them */
  function quickRef(ref) {
    var l = J.LESSONS[ref], words = [], gram = [], kanji = [];
    l.items.forEach(function (k) {
      var it = J.ITEMS[k]; if (!it) return;
      if (it.kind === "word") words.push([it.ruby, it.r, it.en.slice(0, 2).join(", ")]);
      if (it.kind === "kanji") kanji.push([it.w, it.r + " (in " + J.ITEMS[it.in].w + ")", it.en.join(", ")]);
      if (it.kind === "grammar") gram.push([it.w, it.en, it.note]);
    });
    var out = [{ table: { head: ["Word", "Reading", "Meaning"], rows: words } }];
    if (kanji.length) out.push({ table: { head: ["Kanji", "Read here as", "Meaning"], rows: kanji } });
    out.push({ table: { head: ["Pattern", "Means", "Remember"], rows: gram } });
    return out;
  }
  function lesson(ref, o) {
    C["ja:" + ref] = { pages: [
      { t: "Hook", blocks: [o.media].concat(o.hook) },
      { t: "Core idea", blocks: o.core },
      { t: "Patterns", blocks: o.patterns },
      { t: "Listen & notice", blocks: [{ p: o.listen }].concat(o.lines.map(function (x) { return { line: x }; })).concat(o.listenMore || []) },
      { t: "Pitfalls", blocks: o.pitfalls.map(function (x) { return tip(x[0], x[1]); }) },
      { t: "Culture & usage", blocks: o.culture.map(function (x) { return tip(x[0], x[1]); }) },
      { t: "Practise", blocks: [{ passage: o.passage }, { shadow: o.shadow }, { go: o.go }] },
      { t: "Quick reference", blocks: quickRef(ref) }
    ] };
  }

  /* ================= 2.1 ================= */
  lesson("2.1", {
    media: { panel: {
      img: "ja.panel.clock.1", w: 1800, h: 1344,
      alt: "Manga panel in the classroom: Yōta bursts in through the door, out of breath, pointing up at the wall clock; Akari, at her desk, turns to him with one finger raised, amused.",
      bubbles: [
        { who: Y, ja: "{今|いま}、\n{何時|なんじ}\nですか！？", en: "What time is it now!?", x: 85, y: 16, rx: 10, ry: 14, tail: [77, 27], size: 2.7 },
        { who: A, ja: "{八時|はちじ}\n{五十五分|ごじゅうごふん}\nです。", en: "It's 8:55.", x: 14, y: 18, rx: 10, ry: 15, tail: [24, 30], size: 2.7 }
      ] } },
    hook: [{ p: "Five minutes to class. Tap a balloon to hear it — manga reads right to left." }],
    core: [
      { p: "The hour is the number plus 時 (じ); the minutes are the number plus 分 (ふん or ぷん)." },
      { table: { head: ["", "o'clock", "minutes"], rows: [["1", "いちじ", "いっぷん"], ["2", "にじ", "にふん"], ["3", "さんじ", "さんぷん"], ["4", "よじ", "よんぷん"], ["5", "ごじ", "ごふん"],
        ["6", "ろくじ", "ろっぷん"], ["7", "しちじ", "ななふん"], ["8", "はちじ", "はっぷん"], ["9", "くじ", "きゅうふん"], ["10", "じゅうじ", "じゅっぷん"]] } },
      { p: "半 (はん) is half past: {三時半|さんじはん}, 3:30." },
      { p: "{午前|ごぜん} (a.m.) and {午後|ごご} (p.m.) go in front: {午後|ごご}{二時|にじ}, 2 p.m." }
    ],
    patterns: [
      pt("{今|いま}　Ｈ{時|じ}です。", "It's H o'clock now.", "{今|いま}{三時|さんじ}です。", "It's three o'clock now."),
      pt("Ｈ{時|じ}　Ｍ{分|ふん}です。", "It's H:MM.", "{四時|よじ}{十分|じゅっぷん}です。", "It's ten past four."),
      pt("Ｈ{時半|じはん}です。", "It's half past H.", "{七時半|しちじはん}です。", "It's half past seven."),
      pt("{今|いま}　{何時|なんじ}ですか。", "What time is it now?", "すみません、{今|いま}{何時|なんじ}ですか。", "Excuse me, what time is it?")
    ],
    listen: "Listen for 時 and then 分: the hour always comes first. Notice よじ, しちじ and くじ.",
    lines: [
      L(Y, "{今|いま}{何時|なんじ}ですか。", "What time is it now?"),
      L(A, "{九時|くじ}です。", "It's nine."),
      L(N, "{四時|よじ}{十五分|じゅうごふん}", "4:15"),
      L(N, "{七時|しちじ}{四十分|よんじゅっぷん}", "7:40"),
      L(N, "{午前|ごぜん}{十一時半|じゅういちじはん}", "11:30 a.m."),
      L(A, "ちょうど{二時|にじ}です。", "It's exactly two."),
      L(Y, "{午後|ごご}{六時|ろくじ}ですか。", "Six in the evening?")
    ],
    pitfalls: [
      ["4, 7 and 9 o'clock", "Hours use よじ, しちじ and くじ — not よんじ, ななじ or きゅうじ."],
      ["ふん or ぷん", "1, 3, 4, 6, 8 and 10 minutes take ぷん (いっぷん, さんぷん, よんぷん, ろっぷん, はっぷん, じゅっぷん); 2, 5, 7 and 9 take ふん."],
      ["午後 goes first", "“2 p.m.” is 午後二時. Putting 午後 after the time is a common slip."],
      ["半 is only “half past”", "There is no “quarter past”: say 十五分 (fifteen minutes)."]
    ],
    culture: [
      ["The 24-hour clock", "Timetables, TV listings and shop hours often use the 24-hour clock: 18時 is 6 p.m. In speech, 午後六時 is more usual."],
      ["Five minutes early", "Arriving a few minutes before a meeting or class is the norm; on time is almost late."]
    ],
    passage: { title: "Late again", lines: [
      L(Y, "あかりさん、{今|いま}{何時|なんじ}ですか。", "Akari, what time is it now?"), L(A, "{八時|はちじ}{五十五分|ごじゅうごふん}です。", "It's 8:55."),
      L(Y, "じゅぎょうは{九時|くじ}ですか。", "Class is at nine?"), L(A, "はい、{九時|くじ}です。", "Yes, nine."), L(Y, "あと{五分|ごふん}！", "Five minutes left!")
    ], q: { q: "What time does Akari say it is?", options: ["9:00", "8:55", "8:05", "5:55"], a: 1, why: "{八時|はちじ}{五十五分|ごじゅうごふん}です — it's 8:55." } },
    shadow: [L(A, "{今|いま}{三時|さんじ}です。", "It's three o'clock now."), L(Y, "{今|いま}{何時|なんじ}ですか。", "What time is it now?"), L(A, "{七時半|しちじはん}です。", "It's half past seven.")],
    go: "words, six kanji and three patterns · about 15 minutes"
  });

  /* ================= 2.2 ================= */
  lesson("2.2", {
    media: { scene: { title: "Monday again", bg: "ja.bg.classroom", left: Y, right: A, alt: "A classroom before the first lesson.", lines: [
      F(Y, "{今日|きょう}は{何曜日|なんようび}ですか。", "What day is it today?", "thinking"),
      L(A, "{月曜日|げつようび}です。", "Monday."),
      F(Y, "{日曜日|にちようび}じゃないですか！？", "It's not Sunday!?", "surprised"),
      F(A, "{日曜日|にちようび}はきのうでした。", "Sunday was yesterday.", "happy"),
      F(Y, "…{月曜日|げつようび}ですか。", "…So it's Monday.", "troubled")
    ] } },
    hook: [{ p: "Seven days, one pattern: every day ends in 曜日. Press the text box to move through the scene." }],
    core: [
      { p: "Each day is named after something in the sky or the earth, plus 曜日 (ようび):" },
      { table: { head: ["Day", "Reading", "Named after"], rows: [["{月曜日|げつようび}", "げつようび", "the moon"], ["{火曜日|かようび}", "かようび", "fire"], ["{水曜日|すいようび}", "すいようび", "water"],
        ["{木曜日|もくようび}", "もくようび", "wood"], ["{金曜日|きんようび}", "きんようび", "gold"], ["{土曜日|どようび}", "どようび", "earth"], ["{日曜日|にちようび}", "にちようび", "the sun"]] } },
      { p: "{今日|きょう} is today, あした tomorrow, きのう yesterday." },
      { p: "でした is the past of です: きのうは{日曜日|にちようび}でした — yesterday was Sunday." }
    ],
    patterns: [
      pt("{今日|きょう}は　〜{曜日|ようび}です。", "Today is (a day).", "{今日|きょう}は{月曜日|げつようび}です。", "Today is Monday."),
      pt("〜は　{何曜日|なんようび}ですか。", "What day is …?", "あしたは{何曜日|なんようび}ですか。", "What day is tomorrow?"),
      pt("きのうは　〜でした。", "Yesterday was ….", "きのうは{日曜日|にちようび}でした。", "Yesterday was Sunday.")
    ],
    listen: "Listen to the end of each sentence: です is now, でした is the past.",
    lines: [
      L(A, "{今日|きょう}は{水曜日|すいようび}です。", "Today is Wednesday."),
      L(Y, "あしたは{木曜日|もくようび}ですか。", "Is tomorrow Thursday?"),
      L(A, "はい、そうです。", "Yes, it is."),
      L(Y, "きのうは{火曜日|かようび}でした。", "Yesterday was Tuesday."),
      L(N, "{金曜日|きんようび}、{土曜日|どようび}、{日曜日|にちようび}", "Friday, Saturday, Sunday"),
      L(A, "きのうは{何曜日|なんようび}でしたか。", "What day was it yesterday?"),
      L(Y, "{月曜日|げつようび}じゃなかったです。", "It wasn't Monday.")
    ],
    pitfalls: [
      ["曜日 at the end", "Every day keeps 曜日. 月 alone is the moon, or a month."],
      ["でした for the past", "“Yesterday was Sunday” needs でした: きのうは日曜日です mixes past and present."],
      ["The past negative", "じゃないです becomes じゃなかったです: きのうは火曜日じゃなかったです."],
      ["Dropping 曜", "In quick speech and on calendars, 月曜 (without 日) is common. Write the whole word for now."]
    ],
    culture: [
      ["Calendars", "Japanese calendars and schedules often mark the day with a single kanji in brackets: 5日 (月) is the 5th, a Monday."],
      ["The school week", "Many schools run Monday to Friday; some still have classes on Saturday mornings."]
    ],
    passage: { title: "What day?", lines: [
      L(Y, "{今日|きょう}は{金曜日|きんようび}ですか。", "Is today Friday?"), L(A, "いいえ、{木曜日|もくようび}です。", "No, it's Thursday."),
      L(Y, "きのうは{水曜日|すいようび}でしたか。", "Was yesterday Wednesday?"), L(A, "はい、そうです。あしたは{金曜日|きんようび}です。", "Yes. Tomorrow is Friday."), L(Y, "よかった！", "Phew!")
    ], q: { q: "What day is it today?", options: ["Friday", "Wednesday", "Thursday", "Saturday"], a: 2, why: "いいえ、{木曜日|もくようび}です — no, it's Thursday." } },
    shadow: [L(A, "{今日|きょう}は{月曜日|げつようび}です。", "Today is Monday."), L(Y, "あしたは{何曜日|なんようび}ですか。", "What day is tomorrow?"), L(A, "きのうは{日曜日|にちようび}でした。", "Yesterday was Sunday.")],
    go: "the seven days, five kanji and でした · about 15 minutes"
  });

  /* ================= 2.3 ================= */
  lesson("2.3", {
    media: { scene: { title: "Opening hours", bg: "ja.bg.cafe", left: Y, right: M, alt: "The café; Makoto behind the counter.", lines: [
      L(Y, "すみません、カフェは{何時|なんじ}からですか。", "Excuse me, what time does the café open?"),
      F(M, "{午前|ごぜん}{八時|はちじ}からです。", "From 8 a.m.", "happy"),
      L(Y, "{何時|なんじ}までですか。", "Until what time?"),
      L(M, "{午後|ごご}{六時|ろくじ}までです。", "Until 6 p.m."),
      F(Y, "{日曜日|にちようび}も？", "Sundays too?", "thinking"),
      F(M, "いいえ、{日曜日|にちようび}は{休|やす}みです。", "No, we're closed on Sundays.", "troubled", { yota: "troubled" })
    ] } },
    hook: [{ p: "Two small words frame any span of time. Press the text box to move through the scene." }],
    core: [
      { p: "から follows where something starts; まで follows where it ends." },
      { p: "{九時|くじ}から{五時|ごじ}まで — from nine to five." },
      { p: "They work for days too: {月曜日|げつようび}から{金曜日|きんようび}まで — Monday to Friday." },
      { p: "Either one can stand alone: カフェは{八時|はちじ}からです — the café opens at eight." },
      { p: "{休|やす}み is a day off, a break, or a shop that is closed." }
    ],
    patterns: [
      pt("Ａから　Ｂまでです。", "It's from A to B.", "{九時|くじ}から{五時|ごじ}までです。", "It's from nine to five."),
      pt("Ｘは　Ｔからです。", "X starts at T.", "じゅぎょうは{九時|くじ}からです。", "Class starts at nine."),
      pt("Ｘは　{休|やす}みです。", "X is a day off / closed.", "{日曜日|にちようび}は{休|やす}みです。", "Sunday is a day off.")
    ],
    listen: "Listen for から and まで at the end of each time: they say which end it is.",
    lines: [
      L(A, "じゅぎょうは{八時半|はちじはん}からです。", "Class starts at 8:30."),
      L(Y, "{昼休|ひるやす}みは{何時|なんじ}からですか。", "When does lunch break start?"),
      L(A, "{十二時|じゅうにじ}から{一時|いちじ}までです。", "From twelve to one."),
      L(M, "カフェは{毎日|まいにち}{午後|ごご}{六時|ろくじ}までです。", "The café is open until 6 p.m. every day."),
      L(Y, "{学校|がっこう}は{月曜日|げつようび}から{金曜日|きんようび}までです。", "School is Monday to Friday."),
      L(A, "{土曜日|どようび}は{休|やす}みです。", "Saturday is a day off."),
      L(Y, "あしたも{休|やす}みですか。", "Is tomorrow a day off too?")
    ],
    pitfalls: [
      ["から marks the START", "{五時|ごじ}から is “from five”. “Until five” is {五時|ごじ}まで."],
      ["Nothing between the time and から", "{九時|くじ}から, not {九時|くじ}はから: the particle goes straight on."],
      ["まで is inclusive", "{金曜日|きんようび}まで includes Friday."],
      ["から also means “because”", "After a sentence, から means “because” — you'll meet it later. After a time or a day, it is “from”."]
    ],
    culture: [
      ["定休日", "Shops show their regular closing day on the door: a day like 月曜日 marked as the day off. Many cafés close one weekday rather than Sunday."],
      ["Lunch break", "School lunch break is often under an hour: students eat in the classroom, then rush out to clubs or the yard."]
    ],
    passage: { title: "The café's hours", lines: [
      L(M, "いらっしゃいませ。", "Welcome."), L(Y, "カフェは{何時|なんじ}までですか。", "Until what time is the café open?"),
      L(M, "{午後|ごご}{六時|ろくじ}までです。", "Until 6 p.m."), L(Y, "{日曜日|にちようび}は{休|やす}みですか。", "Are you closed on Sunday?"), L(M, "はい、{日曜日|にちようび}は{休|やす}みです。", "Yes, Sunday is our day off.")
    ], q: { q: "When does the café close?", options: ["8 a.m.", "6 p.m.", "6 a.m.", "8 p.m."], a: 1, why: "{午後|ごご}{六時|ろくじ}までです — until 6 p.m." } },
    shadow: [L(A, "{九時|くじ}から{五時|ごじ}までです。", "From nine to five."), L(Y, "カフェは{何時|なんじ}からですか。", "When does the café open?"), L(M, "{日曜日|にちようび}は{休|やす}みです。", "We're closed on Sundays.")],
    go: "から, まで, four kanji and three patterns · about 15 minutes"
  });

  /* ================= 2.4 ================= */
  lesson("2.4", {
    media: { scene: { title: "When's your birthday?", bg: "ja.bg.classroom", left: Y, right: A, alt: "A classroom after school.", lines: [
      L(A, "ようたさん、たんじょうびはいつですか。", "Yōta, when is your birthday?"),
      F(Y, "{七月|しちがつ}{二十日|はつか}です！", "The 20th of July!", "happy"),
      F(A, "{二十日|はつか}…{今日|きょう}は{七月|しちがつ}{十九日|じゅうくにち}です。", "The 20th… today is the 19th of July.", "thinking"),
      F(Y, "はい、あしたです！", "Yes — it's tomorrow!", "happy", { akari: "surprised" })
    ] } },
    hook: [{ p: "Months are easy; the first ten days are not. Press the text box to move through the scene." }],
    core: [
      { p: "A month is its number plus 月 (がつ): {一月|いちがつ} is January, {十二月|じゅうにがつ} December. Watch {四月|しがつ}, {七月|しちがつ} and {九月|くがつ}." },
      { p: "Days of the month 1 to 10 have their own words:" },
      { table: { head: ["Date", "Reading", "Date", "Reading"], rows: [["1日", "ついたち", "6日", "むいか"], ["2日", "ふつか", "7日", "なのか"], ["3日", "みっか", "8日", "ようか"], ["4日", "よっか", "9日", "ここのか"], ["5日", "いつか", "10日", "とおか"]] } },
      { p: "After that, the number plus 日 (にち): {十一日|じゅういちにち}, {十九日|じゅうくにち} — except {十四日|じゅうよっか}, {二十日|はつか} and {二十四日|にじゅうよっか}." },
      { p: "The month comes first, then the day: {七月|しちがつ}{二十日|はつか}, the 20th of July." }
    ],
    patterns: [
      pt("Ｍ{月|がつ}　Ｄ{日|にち}です。", "It's the D of M.", "{九月|くがつ}{一日|ついたち}です。", "It's the 1st of September."),
      pt("{何月|なんがつ}{何日|なんにち}ですか。", "What's the date?", "{今日|きょう}は{何月|なんがつ}{何日|なんにち}ですか。", "What's the date today?"),
      pt("Ｘは　いつですか。", "When is X?", "たんじょうびはいつですか。", "When is your birthday?")
    ],
    listen: "Listen for the day word: ついたち, ふつか and はつか sound nothing like their numbers.",
    lines: [
      L(A, "たんじょうびはいつですか。", "When is your birthday?"),
      L(Y, "{七月|しちがつ}{二十日|はつか}です。", "The 20th of July."),
      L(Y, "あかりさんは？", "And you, Akari?"),
      L(A, "{三月|さんがつ}{三日|みっか}です。", "The 3rd of March."),
      L(N, "{四月|しがつ}{八日|ようか}", "the 8th of April"),
      L(N, "{九月|くがつ}{十日|とおか}", "the 10th of September"),
      L(A, "{今日|きょう}は{何月|なんがつ}{何日|なんにち}ですか。", "What's the date today?")
    ],
    pitfalls: [
      ["一日: two readings", "As a date, 一日 is ついたち. As a length of time, it is いちにち (one day)."],
      ["Month first", "Japanese goes from big to small: year, month, day. 七月二十日, never 二十日七月."],
      ["四月, 七月, 九月", "しがつ, しちがつ, くがつ — not よんがつ, なながつ or きゅうがつ."],
      ["いつ needs no particle", "たんじょうびはいつですか — いつ stands on its own, with no に."]
    ],
    culture: [
      ["Golden Week", "29 April to 5 May holds several public holidays in a row: Japan's longest break besides New Year."],
      ["Writing dates", "Dates are written big to small: 2026年10月23日. Forms may also ask for the Japanese era year (令和)."]
    ],
    passage: { title: "Birthdays", lines: [
      L(A, "ようたさんのたんじょうびはいつですか。", "When is Yōta's birthday?"), L(Y, "{七月|しちがつ}{二十日|はつか}です。", "The 20th of July."),
      L(Y, "あかりさんのたんじょうびは？", "And yours, Akari?"), L(A, "{三月|さんがつ}{三日|みっか}です。", "The 3rd of March."), L(Y, "ひなまつりですね！", "That's the Doll Festival!")
    ], q: { q: "When is Akari's birthday?", options: ["the 3rd of March", "the 20th of July", "the 30th of March", "the 2nd of July"], a: 0, why: "{三月|さんがつ}{三日|みっか}です — the 3rd of March." } },
    shadow: [L(A, "たんじょうびはいつですか。", "When is your birthday?"), L(Y, "{七月|しちがつ}{二十日|はつか}です。", "The 20th of July."), L(A, "{今日|きょう}は{九月|くがつ}{一日|ついたち}です。", "Today is the 1st of September.")],
    go: "the dates, the kanji 何 and three patterns · about 15 minutes"
  });

  /* ================= 2.5 ================= */
  lesson("2.5", {
    media: { scene: { title: "The 3:15 to Tokyo", bg: "ja.bg.station", left: Y, right: A, alt: "A station platform in the afternoon.", lines: [
      L(Y, "つぎのでんしゃは{何時|なんじ}ですか。", "What time is the next train?"),
      L(A, "{三時十五分|さんじじゅうごふん}です。", "3:15."),
      F(Y, "{東京|とうきょう}{行|ゆ}きは{何番線|なんばんせん}ですか。", "Which platform for Tokyo?", "thinking"),
      L(A, "{二番線|にばんせん}です。", "Platform 2."),
      F(Y, "{今|いま}、{三時十四分|さんじじゅうよんぷん}…！", "It's 3:14 now…!", "surprised", { akari: "surprised" })
    ] } },
    hook: [{ p: "Times, platforms and where a train is going. Press the text box to move through the scene." }],
    core: [
      { p: "つぎ is “next”. It joins its noun with の: つぎのでんしゃ, the next train." },
      { p: "A train is named by where it goes, plus {行|ゆ}き: {東京|とうきょう}{行|ゆ}き, the train for Tokyo." },
      { p: "Platforms are numbered with {番線|ばんせん}: {二番線|にばんせん}, platform 2. {何番線|なんばんせん} asks which." },
      { p: "ごろ after a time makes it approximate: {三時|さんじ}ごろ, about three." }
    ],
    patterns: [
      pt("つぎの　Ｘは　{何時|なんじ}ですか。", "What time is the next X?", "つぎのバスは{何時|なんじ}ですか。", "What time is the next bus?"),
      pt("Ｐ{行|ゆ}きは　{何番線|なんばんせん}ですか。", "Which platform for P?", "{東京|とうきょう}{行|ゆ}きは{何番線|なんばんせん}ですか。", "Which platform for Tokyo?"),
      pt("Ｔごろです。", "About T.", "{三時|さんじ}ごろです。", "About three.")
    ],
    listen: "Listen for the number before 番線 and the place before 行き.",
    lines: [
      L(Y, "つぎのでんしゃは{何時|なんじ}ですか。", "What time is the next train?"),
      L(A, "{四時|よじ}ごろです。", "About four."),
      L(N, "{東京|とうきょう}{行|ゆ}きは{一番線|いちばんせん}です。", "The Tokyo train is on platform 1."),
      L(Y, "バスは{何時|なんじ}ですか。", "What time is the bus?"),
      L(A, "{五時半|ごじはん}です。", "5:30."),
      L(N, "つぎは{東京|とうきょう}です。", "The next stop is Tokyo."),
      L(Y, "{何番線|なんばんせん}ですか。", "Which platform?")
    ],
    pitfalls: [
      ["つぎの, with の", "つぎでんしゃ is missing its の: つぎのでんしゃ."],
      ["行き reads ゆき", "On signs and in announcements 東京行き is とうきょうゆき; you will also hear いき."],
      ["ごろ is for times", "ごろ makes a time vague. For an amount (“about 500 yen”) Japanese uses ぐらい — later."],
      ["ごろ before です", "{三時|さんじ}ごろです — ごろ comes straight after the time."]
    ],
    culture: [
      ["Trains on time", "Japanese trains run to the minute: a delay of five minutes earns an apology over the speakers and a delay certificate for latecomers."],
      ["Announcements", "Platform announcements follow a set order: the platform, the train's destination, then 'please stand behind the yellow line'."]
    ],
    passage: { title: "Catching the train", lines: [
      L(Y, "つぎの{東京|とうきょう}{行|ゆ}きは{何時|なんじ}ですか。", "What time is the next train for Tokyo?"), L(A, "{三時十五分|さんじじゅうごふん}です。", "3:15."),
      L(Y, "{何番線|なんばんせん}ですか。", "Which platform?"), L(A, "{二番線|にばんせん}です。", "Platform 2."), L(Y, "{今|いま}{三時十四分|さんじじゅうよんぷん}です！", "It's 3:14 now!")
    ], q: { q: "Which platform does the Tokyo train leave from?", options: ["1", "2", "3", "15"], a: 1, why: "{二番線|にばんせん}です — platform 2." } },
    shadow: [L(Y, "つぎのでんしゃは{何時|なんじ}ですか。", "What time is the next train?"), L(A, "{三時|さんじ}ごろです。", "About three."), L(Y, "{東京|とうきょう}{行|ゆ}きは{何番線|なんばんせん}ですか。", "Which platform for Tokyo?")],
    go: "words, four kanji and three patterns · about 15 minutes"
  });

  /* ================= 2.6 ================= */
  lesson("2.6", {
    media: { panel: {
      img: "ja.panel.phone.1", w: 1800, h: 1344,
      alt: "Manga panel split down the middle: on the right, Akari at home holds a phone to her ear; on the left, Yōta answers his phone outside the station, surprised.",
      bubbles: [
        { who: A, ja: "もしもし、\nようたさん\nですか。", en: "Hello, is that Yōta?", x: 86, y: 16, rx: 10, ry: 14, tail: [78, 28], size: 2.7 },
        { who: Y, ja: "はい、\nようたです！", en: "Yes, it's Yōta!", x: 14, y: 16, rx: 9, ry: 13, tail: [24, 28], size: 2.7 }
      ] } },
    hook: [{ p: "Every call opens the same way. Tap a balloon to hear it — manga reads right to left." }],
    core: [
      { p: "もしもし opens a call — and checks the line is still there." },
      { p: "A phone number is read digit by digit, and each dash is read の:" },
      { p: "090-1234-5678 → ゼロきゅうゼロの、いちにさんよんの、ごろくななはち." },
      { p: "{電話番号|でんわばんごう}は{何番|なんばん}ですか asks for someone's number." },
      { p: "じゃあ、また closes a call between friends: “see you, then”." }
    ],
    patterns: [
      pt("もしもし、Ｘです。", "Hello, it's X.", "もしもし、あかりです。", "Hello, it's Akari."),
      pt("{電話番号|でんわばんごう}は　{何番|なんばん}ですか。", "What's your phone number?", "けいたいの{番号|ばんごう}は{何番|なんばん}ですか。", "What's your mobile number?"),
      pt("じゃあ、また　〜。", "See you (day), then.", "じゃあ、また{金曜日|きんようび}。", "See you Friday, then.")
    ],
    listen: "Listen for the の between the groups of digits: it is the dash.",
    lines: [
      L(A, "もしもし、ようたさんですか。", "Hello, is that Yōta?"),
      L(Y, "はい、ようたです。", "Yes, it's Yōta."),
      L(A, "{電話番号|でんわばんごう}は{何番|なんばん}ですか。", "What's your phone number?"),
      L(Y, "ゼロはちゼロの、さんよんごろくの、ななはちきゅうゼロです。", "It's 080-3456-7890."),
      L(N, "ゼロさんの、いちにさんよんの、ごろくななはち", "03-1234-5678"),
      L(A, "じゃあ、また{金曜日|きんようび}。", "See you Friday, then."),
      L(Y, "じゃあ、また！", "See you!")
    ],
    pitfalls: [
      ["もしもし is for the phone", "Face to face, もしもし sounds odd: use すみません to get attention."],
      ["Digits, not numbers", "090 is ゼロきゅうゼロ, not きゅうじゅう: a phone number is read one digit at a time."],
      ["2 and 5 stretch", "In phone numbers people often say にい and ごお, so every digit takes two beats."],
      ["じゃあ、また is casual", "To a teacher or a customer, end with しつれいします instead — later."]
    ],
    culture: [
      ["Mobile numbers", "Mobile numbers start 090, 080 or 070; 03 is Tokyo, 06 is Osaka."],
      ["LINE", "Most people swap LINE contacts rather than numbers; the number is for shops, forms and emergencies."]
    ],
    passage: { title: "Swapping numbers", lines: [
      L(A, "ようたさん、{電話番号|でんわばんごう}は{何番|なんばん}ですか。", "Yōta, what's your phone number?"),
      L(Y, "ゼロきゅうゼロの、いちにさんよんの、ごろくななはちです。", "It's 090-1234-5678."),
      L(A, "ゼロきゅうゼロの、いちにさんよんの…", "090-1234…"), L(Y, "ごろくななはちです。", "…5678."), L(A, "ありがとうございます。じゃあ、また！", "Thank you. See you!")
    ], q: { q: "What is Yōta's number?", options: ["090-1234-5678", "080-1234-5678", "090-4321-8765", "080-3456-7890"], a: 0, why: "ゼロきゅうゼロの、いちにさんよんの、ごろくななはち — 090-1234-5678." } },
    shadow: [L(A, "もしもし、あかりです。", "Hello, it's Akari."), L(Y, "{電話番号|でんわばんごう}は{何番|なんばん}ですか。", "What's your phone number?"), L(A, "じゃあ、また{金曜日|きんようび}。", "See you Friday, then.")],
    go: "words, three kanji and two patterns · about 15 minutes"
  });
})();
