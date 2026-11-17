/* Kurenai OS — data/money-merchants.js
   AUTHORED: the UK merchants a student's statement names (quality programme
   W4, MG-08). A row is [match, name, category]:
     match     lower-case words as the BANK writes them, found at a word
               boundary anywhere in the bank's line; the longest match wins
     name      the merchant as its brand writes it
     category  one of Money's default category ids, or null (the import
               then leaves the entry in Other)
   A learned payee rule (state.money.payees) always beats this table. No
   match may be one common English word on its own ("three", "next",
   "game", "sky", "apple"): it would claim somebody else's shop. */
(function (root) {
  "use strict";
  var M = [
    /* food: supermarkets and corner shops */
    ["tesco", "Tesco", "food"], ["sainsburys", "Sainsbury's", "food"], ["sainsbury's", "Sainsbury's", "food"], ["asda", "Asda", "food"],
    ["aldi", "Aldi", "food"], ["lidl", "Lidl", "food"], ["morrisons", "Morrisons", "food"], ["wm morrison", "Morrisons", "food"],
    ["co-op", "Co-op", "food"], ["co op", "Co-op", "food"], ["coop group", "Co-op", "food"], ["iceland", "Iceland", "food"],
    ["heron foods", "Heron Foods", "food"], ["b&m", "B&M", "food"], ["b & m", "B&M", "food"], ["home bargains", "Home Bargains", "food"],
    ["waitrose", "Waitrose", "food"], ["marks&spencer", "M&S", "food"], ["marks & spencer", "M&S", "food"], ["m&s simply food", "M&S", "food"],
    ["farmfoods", "Farmfoods", "food"], ["spar", "Spar", "food"], ["nisa", "Nisa", "food"], ["one stop", "One Stop", "food"],
    ["poundland", "Poundland", "food"], ["ocado", "Ocado", "food"],
    /* food: eating out and delivery */
    ["greggs", "Greggs", "food"], ["mcdonalds", "McDonald's", "food"], ["mcdonald's", "McDonald's", "food"], ["kfc", "KFC", "food"],
    ["burger king", "Burger King", "food"], ["subway", "Subway", "food"], ["nandos", "Nando's", "food"], ["nando's", "Nando's", "food"],
    ["costa", "Costa", "food"], ["starbucks", "Starbucks", "food"], ["pret a manger", "Pret", "food"], ["caffe nero", "Caffè Nero", "food"],
    ["dominos", "Domino's", "food"], ["domino's", "Domino's", "food"], ["pizza hut", "Pizza Hut", "food"], ["papa johns", "Papa Johns", "food"],
    ["just eat", "Just Eat", "food"], ["just-eat", "Just Eat", "food"], ["deliveroo", "Deliveroo", "food"], ["uber eats", "Uber Eats", "food"],
    ["ubereats", "Uber Eats", "food"], ["wagamama", "Wagamama", "food"], ["five guys", "Five Guys", "food"], ["tim hortons", "Tim Hortons", "food"],
    ["krispy kreme", "Krispy Kreme", "food"], ["itsu", "Itsu", "food"], ["yo sushi", "YO! Sushi", "food"], ["german doner kebab", "German Doner Kebab", "food"],
    /* transport */
    ["stagecoach", "Stagecoach", "transport"], ["first bus", "First Bus", "transport"], ["firstbus", "First Bus", "transport"],
    ["first south yorks", "First Bus", "transport"], ["arriva", "Arriva", "transport"], ["northern trains", "Northern", "transport"],
    ["northern rail", "Northern", "transport"], ["lner", "LNER", "transport"], ["trainline", "Trainline", "transport"],
    ["transpennine", "TransPennine Express", "transport"], ["east midlands railway", "East Midlands Railway", "transport"],
    ["crosscountry", "CrossCountry", "transport"], ["avanti", "Avanti West Coast", "transport"], ["tfl travel", "TfL", "transport"],
    ["tfl.gov", "TfL", "transport"], ["national express", "National Express", "transport"], ["megabus", "Megabus", "transport"],
    ["flixbus", "FlixBus", "transport"], ["uber", "Uber", "transport"], ["bolt.eu", "Bolt", "transport"], ["railcard", "Railcard", "transport"],
    ["travel south yorkshire", "Travel South Yorkshire", "transport"], ["supertram", "Supertram", "transport"], ["shell", "Shell", "transport"],
    ["esso", "Esso", "transport"], ["dvla", "DVLA", "transport"], ["dvsa", "DVSA", "transport"],
    /* bills and phone */
    ["vodafone", "Vodafone", "bills"], ["ee limited", "EE", "bills"], ["ee ltd", "EE", "bills"], ["ee & t-mobile", "EE", "bills"], ["ee topup", "EE", "bills"],
    ["o2", "O2", "bills"], ["three mobile", "Three", "bills"], ["3 mobile", "Three", "bills"], ["h3g", "Three", "bills"], ["hutchison 3g", "Three", "bills"],
    ["giffgaff", "giffgaff", "bills"], ["voxi", "VOXI", "bills"], ["tesco mobile", "Tesco Mobile", "bills"], ["id mobile", "iD Mobile", "bills"],
    ["smarty", "SMARTY", "bills"], ["lebara", "Lebara", "bills"], ["sky uk", "Sky", "bills"], ["sky digital", "Sky", "bills"], ["sky mobile", "Sky Mobile", "bills"],
    ["virgin media", "Virgin Media", "bills"], ["bt group", "BT", "bills"], ["bt consumer", "BT", "bills"], ["british telecom", "BT", "bills"],
    ["tv licensing", "TV Licensing", "bills"], ["tv licence", "TV Licensing", "bills"], ["octopus energy", "Octopus Energy", "bills"],
    ["british gas", "British Gas", "bills"], ["yorkshire water", "Yorkshire Water", "bills"],
    /* subscriptions */
    ["google one", "Google One", "subscriptions"], ["google play", "Google Play", "subscriptions"], ["google youtube", "YouTube Premium", "subscriptions"],
    ["youtube premium", "YouTube Premium", "subscriptions"], ["youtubepremium", "YouTube Premium", "subscriptions"], ["google storage", "Google One", "subscriptions"],
    ["spotify", "Spotify", "subscriptions"], ["apple.com/bill", "Apple", "subscriptions"], ["apple.com bill", "Apple", "subscriptions"],
    ["apple com bill", "Apple", "subscriptions"], ["icloud", "iCloud", "subscriptions"], ["netflix", "Netflix", "subscriptions"],
    ["disney plus", "Disney+", "subscriptions"], ["disneyplus", "Disney+", "subscriptions"], ["amazon prime", "Amazon Prime", "subscriptions"],
    ["prime video", "Prime Video", "subscriptions"], ["crunchyroll", "Crunchyroll", "subscriptions"], ["nintendo", "Nintendo", "subscriptions"],
    ["playstation", "PlayStation", "subscriptions"], ["xbox", "Xbox", "subscriptions"], ["microsoft", "Microsoft", "subscriptions"],
    ["adobe", "Adobe", "subscriptions"], ["openai", "ChatGPT", "subscriptions"], ["chatgpt", "ChatGPT", "subscriptions"],
    ["anthropic", "Claude", "subscriptions"], ["claude.ai", "Claude", "subscriptions"], ["github", "GitHub", "subscriptions"],
    ["jetbrains", "JetBrains", "subscriptions"], ["discord", "Discord", "subscriptions"], ["twitch", "Twitch", "subscriptions"],
    ["audible", "Audible", "subscriptions"], ["duolingo", "Duolingo", "subscriptions"], ["notion", "Notion", "subscriptions"],
    ["todoist", "Todoist", "subscriptions"], ["elevenlabs", "ElevenLabs", "subscriptions"], ["cloudflare", "Cloudflare", "subscriptions"],
    ["supabase", "Supabase", "subscriptions"], ["patreon", "Patreon", "subscriptions"], ["wanikani", "WaniKani", "subscriptions"],
    /* the Collection: games, books, anime */
    ["steam games", "Steam", "collection"], ["steampowered", "Steam", "collection"], ["steam purchase", "Steam", "collection"],
    ["valve", "Steam", "collection"], ["waterstones", "Waterstones", "collection"], ["game retail", "GAME", "collection"],
    ["game stores", "GAME", "collection"], ["cex ltd", "CeX", "collection"], ["cex", "CeX", "collection"], ["hmv", "HMV", "collection"],
    ["forbidden planet", "Forbidden Planet", "collection"], ["travelling man", "Travelling Man", "collection"], ["kinokuniya", "Kinokuniya", "collection"],
    ["bookwalker", "BookWalker", "collection"], ["world of books", "World of Books", "collection"], ["wob.com", "World of Books", "collection"],
    ["blackwells", "Blackwell's", "collection"], ["humble bundle", "Humble Bundle", "collection"], ["gog.com", "GOG", "collection"],
    ["epic games", "Epic Games", "collection"], ["dlsite", "DLsite", "collection"], ["mangagamer", "MangaGamer", "collection"],
    ["jast usa", "JAST USA", "collection"], ["anime limited", "Anime Limited", "collection"], ["zavvi", "Zavvi", "collection"],
    /* shopping with no one category */
    ["amazon", "Amazon", "other"], ["amzn", "Amazon", "other"], ["amznmktplace", "Amazon", "other"], ["ebay", "eBay", "other"],
    ["vinted", "Vinted", "other"], ["whsmith", "WHSmith", "other"], ["wh smith", "WHSmith", "other"], ["argos", "Argos", "other"],
    ["currys", "Currys", "other"], ["ikea", "IKEA", "other"], ["wilko", "Wilko", "other"], ["the range", "The Range", "other"],
    ["temu", "Temu", "other"], ["aliexpress", "AliExpress", "other"], ["etsy", "Etsy", "other"], ["ryman", "Ryman", "education"],
    /* clothing */
    ["primark", "Primark", "clothing"], ["h&m", "H&M", "clothing"], ["h & m", "H&M", "clothing"], ["zara", "Zara", "clothing"],
    ["jd sports", "JD Sports", "clothing"], ["sports direct", "Sports Direct", "clothing"], ["sportsdirect", "Sports Direct", "clothing"],
    ["asos", "ASOS", "clothing"], ["next retail", "Next", "clothing"], ["next plc", "Next", "clothing"], ["next directory", "Next", "clothing"],
    ["uniqlo", "Uniqlo", "clothing"], ["new look", "New Look", "clothing"], ["tk maxx", "TK Maxx", "clothing"], ["tkmaxx", "TK Maxx", "clothing"],
    ["shein", "SHEIN", "clothing"], ["schuh", "Schuh", "clothing"], ["footasylum", "Footasylum", "clothing"], ["matalan", "Matalan", "clothing"],
    /* health */
    ["boots", "Boots", "health"], ["superdrug", "Superdrug", "health"], ["specsavers", "Specsavers", "health"], ["lloyds pharmacy", "LloydsPharmacy", "health"],
    ["well pharmacy", "Well Pharmacy", "health"], ["holland & barrett", "Holland & Barrett", "health"], ["holland and barrett", "Holland & Barrett", "health"],
    ["puregym", "PureGym", "health"], ["pure gym", "PureGym", "health"], ["the gym group", "The Gym Group", "health"], ["nhs", "NHS", "health"],
    /* education and exams */
    ["ucas", "UCAS", "education"], ["aqa", "AQA", "education"], ["ocr exam", "OCR", "education"], ["pearson", "Pearson", "education"],
    ["the student room", "The Student Room", "education"], ["student loans company", "Student Loans Company", "education"],
    ["physics & maths tutor", "Physics & Maths Tutor", "education"], ["save my exams", "Save My Exams", "education"], ["seneca", "Seneca", "education"],
    ["cgp books", "CGP", "education"], ["udemy", "Udemy", "education"], ["coursera", "Coursera", "education"],
    /* social */
    ["odeon", "Odeon", "social"], ["vue cinema", "Vue", "social"], ["vue entertainment", "Vue", "social"], ["cineworld", "Cineworld", "social"],
    ["showcase cinema", "Showcase", "social"], ["wetherspoon", "Wetherspoon", "social"], ["jd wetherspoon", "Wetherspoon", "social"],
    ["ticketmaster", "Ticketmaster", "social"], ["eventbrite", "Eventbrite", "social"], ["hollywood bowl", "Hollywood Bowl", "social"],
    ["tenpin", "Tenpin", "social"], ["flip out", "Flip Out", "social"],
    /* money in */
    ["student finance", "Student Finance", "grants"], ["slc", "Student Finance", "grants"], ["sfe", "Student Finance", "grants"],
    ["bursary", "Bursary", "grants"], ["16-19 bursary", "Bursary", "grants"], ["hmrc", "HMRC", "other-in"], ["dwp", "DWP", "other-in"]
  ];
  if (typeof module === "object" && module.exports) module.exports = M;
  if (root) root.KOS_MONEY_MERCHANTS = M;
})(typeof window !== "undefined" ? window : null);
