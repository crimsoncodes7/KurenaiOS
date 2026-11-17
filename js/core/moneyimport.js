/* Kurenai OS — core/moneyimport.js
   Reading a bank's export (quality programme W4: MG-02, MG-03, MG-04, MG-06,
   MG-08, MG-24). Pure — no DOM, no store, no clock — so Node runs it
   unchanged (tools/smoke149.test.js). KOS.money owns everything that is
   stored; this file only turns a file's text into a table and a bank's
   words into a merchant.

   read(text, name) sniffs the format from the TEXT and gives one shape for
   all of them:
     { format, label, delimiter, header, rows, lines, skipped, issues,
       rejoined, closing, dateFormat }
   - CSV: the delimiter is sniffed over the first lines, the header row is
     FOUND (a bank puts an account preamble above it), lines after the last
     dated row are a trailer, trailing empty columns go, and an unquoted
     thousands separator that split an amount in two is put back together
     (a row that still does not fit the header is an ISSUE, never a row).
   - OFX/QFX, QIF and Santander's text export become the same table under a
     header of their own, so one preview and one mapping serve them all.
   - The app's own export is recognised by its exact header ("kurenai"). */
(function (root) {
  "use strict";

  var KURENAI_HEADER = ["Date", "Type", "Amount", "Category", "Payee", "Note", "Tags", "Pot", "Pot direction", "Entry"];
  var LABELS = { csv: "CSV", kurenai: "KurenaiOS export", ofx: "OFX (Microsoft Money)", qif: "QIF (Quicken)", "santander-txt": "Santander text" };

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoOf(y, m, d) {
    if (m < 1 || m > 12 || d < 1 || d > new Date(y, m, 0).getDate()) return null;
    return y + "-" + pad(m) + "-" + pad(d);
  }

  /* ---------------- bytes to text ---------------- */
  var CP1252 = [0x20AC, 0x81, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0x8D, 0x017D, 0x8F,
    0x90, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x9D, 0x017E, 0x0178];
  /* strict UTF-8, or null when the bytes are not UTF-8 */
  function utf8(b) {
    var out = "", i = 0, n = b.length, c, cp, need, min;
    while (i < n) {
      c = b[i++];
      if (c < 0x80) { out += String.fromCharCode(c); continue; }
      if (c >= 0xC2 && c <= 0xDF) { need = 1; cp = c & 0x1F; min = 0x80; }
      else if (c >= 0xE0 && c <= 0xEF) { need = 2; cp = c & 0x0F; min = 0x800; }
      else if (c >= 0xF0 && c <= 0xF4) { need = 3; cp = c & 0x07; min = 0x10000; }
      else return null;
      if (i + need > n) return null;
      while (need--) { c = b[i++]; if ((c & 0xC0) !== 0x80) return null; cp = (cp << 6) | (c & 0x3F); }
      if (cp < min || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) return null;
      if (cp > 0xFFFF) { cp -= 0x10000; out += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF)); }
      else out += String.fromCharCode(cp);
    }
    return out;
  }
  /* UTF-8 when the bytes are UTF-8, else Windows-1252 (what a UK bank's
     text export is: £ as 0xA3, a non-breaking space as 0xA0) */
  function decode(bytes) {
    if (typeof bytes === "string") return bytes.replace(/^﻿/, "");
    var b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
    var s = utf8(b);
    if (s == null) {
      s = "";
      for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i] >= 0x80 && b[i] <= 0x9F ? CP1252[b[i] - 0x80] : b[i]);
    }
    return s.replace(/^﻿/, "");
  }

  /* ---------------- amounts and dates ---------------- */
  /* "£1,234.56", "-£3.45", "+£1,234.56", "12,5", "3.45 " -> signed minor units */
  function amount(v) {
    if (typeof v === "number") return isFinite(v) ? Math.round(v * 100) : null;
    var s = String(v == null ? "" : v).replace(/[^\d.,\-−]/g, "").replace("−", "-");
    if (/,\d{1,2}$/.test(s) && s.indexOf(".") === -1) s = s.replace(",", ".");
    s = s.replace(/,/g, "");
    if (!s || s === "-" || isNaN(Number(s))) return null;
    return Math.round(Number(s) * 100);
  }
  /* "dmy" (the UK default) or "mdy"; ISO and an OFX stamp are always read */
  function parseDate(s, fmt) {
    s = String(s || "").trim();
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return isoOf(+m[1], +m[2], +m[3]);
    m = s.match(/^(\d{4})(\d{2})(\d{2})(?:\d{6}|\[|$|\.)/);
    if (m) return isoOf(+m[1], +m[2], +m[3]);
    m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-'](\d{2,4})/);
    if (!m) return null;
    var y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return fmt === "mdy" ? isoOf(y, +m[1], +m[2]) : isoOf(y, +m[2], +m[1]);
  }
  function detectDates(rows, col) {
    if (col == null || !rows.length) return "dmy";
    var dmy = false, mdy = false, isoN = 0;
    rows.forEach(function (r) {
      var c = String(r[col] || "").trim();
      if (/^\d{4}-\d{1,2}-\d{1,2}/.test(c)) { isoN++; return; }
      var m = c.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-]/);
      if (m && +m[1] > 12) dmy = true;
      if (m && +m[2] > 12) mdy = true;
    });
    return isoN === rows.length ? "iso" : mdy && !dmy ? "mdy" : "dmy";
  }
  function looksAmount(c) {
    c = String(c == null ? "" : c).trim();
    return /\d/.test(c) && /^[-+−]?\s?[£$€�]?\s?[\d,]*\.?\d+\s?$/.test(c);
  }

  /* ---------------- which way a bank's Type points ---------------- */
  var OUT_TYPES = { deb: 1, dd: 1, so: 1, fpo: 1, bp: 1, cpt: 1, atm: 1, chg: 1, chq: 1, pos: 1, payment: 1, debit: 1, directdebit: 1, repeatpmt: 1,
    fee: 1, srvchg: 1, cash: 1, out: 1, check: 1 };
  var IN_TYPES = { fpi: 1, bgc: 1, cr: 1, credit: 1, dep: 1, "int": 1, div: 1, directdep: 1, "in": 1, deposit: 1 };
  function direction(type) {
    var t = String(type == null ? "" : type).trim().toLowerCase();
    return OUT_TYPES[t] ? "out" : IN_TYPES[t] ? "in" : null;
  }

  /* ---------------- the header ---------------- */
  var GUESS = [
    ["date", /^(date|transaction date|posted|posting date|completed date|started date|value date|booking date)$/],
    ["amount", /^(amount|value|transaction amount|debit\/credit|amount in gbp)$/],
    ["out", /^(paid out|money out|debit|debit amount|withdrawals?|out|spent)$/],
    ["in", /^(paid in|money in|credit|credit amount|deposits?|in|received)$/],
    ["payee", /^(description|payee|merchant|merchant\/description|transaction description|name|counter ?party|details|reference|narrative)$/],
    ["note", /^(notes?|memo)$/],
    ["fitid", /^(fitid|transaction id|transaction reference)$/],   // never a bare "id": exports number their rows
    ["balance", /^(balance|running balance|account balance)$/],
    ["type", /^(type|transaction type)$/],
    ["category", /^category$/],
    ["tags", /^tags$/],
    ["potdir", /^pot direction$/],
    ["pot", /^pot$/],
    ["entry", /^entry$/]
  ];
  function normHead(h) {
    return String(h == null ? "" : h).trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*(\((£|gbp|eur|usd|\$|€)\)|£)$/, "").trim();
  }
  function guess(header) {
    var m = {};
    (header || []).forEach(function (h, i) {
      var n = normHead(h);
      for (var k = 0; k < GUESS.length; k++) {
        if (m[GUESS[k][0]] == null && GUESS[k][1].test(n)) { m[GUESS[k][0]] = i; return; }
      }
    });
    return m;
  }
  function hasMoney(m) { return m.date != null && (m.amount != null || m.out != null || m.in != null); }

  /* ---------------- CSV ---------------- */
  function sniffDelimiter(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); }).slice(0, 10);
    var best = ",", bestScore = -1;
    [",", ";", "\t"].forEach(function (d) {
      var counts = lines.map(function (l) {
        var n = 0, q = false;
        for (var i = 0; i < l.length; i++) { if (l[i] === '"') q = !q; else if (!q && l[i] === d) n++; }
        return n;
      });
      var tally = {}, top = 0, topN = 0;
      counts.forEach(function (c) { if (c > 0) { tally[c] = (tally[c] || 0) + 1; if (tally[c] > topN || (tally[c] === topN && c > top)) { topN = tally[c]; top = c; } } });
      var score = topN * 1000 + top;
      if (topN && score > bestScore) { bestScore = score; best = d; }
    });
    return best;
  }
  /* every non-empty record, with the file line it starts on */
  function splitCSV(text, delim) {
    var rows = [], row = [], field = "", q = false, line = 1, start = 1;
    function end() {
      row.push(field); field = "";
      if (row.some(function (x) { return x.trim(); })) rows.push({ cells: row, line: start });
      row = [];
    }
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else { if (ch === "\n") line++; field += ch; }
      } else if (ch === '"') q = true;
      else if (ch === delim) { row.push(field); field = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        end(); line++; start = line;
      } else field += ch;
    }
    end();
    return rows;
  }
  /* MG-06: "£1,234.56" written without quotes arrives as "£1" and "234.56".
     Joined back only when that makes the row fit its header exactly. */
  var HEAD_PART = /^[-+−]?\s?[£$€�]?\s?\d{1,3}$/, MID_PART = /^\d{3}$/, LAST_PART = /^\d{3}(\.\d{1,2})?$/;
  function rejoin(cells, want) {
    var surplus = cells.length - want;
    if (surplus <= 0) return null;
    var c = cells.map(function (x) { return x.trim(); }), cands = [];
    for (var i = 0; i < c.length - 1; i++) {
      if (!HEAD_PART.test(c[i])) continue;
      var j = i + 1;
      while (j < c.length - 1 && MID_PART.test(c[j]) && LAST_PART.test(c[j + 1])) j++;
      if (!LAST_PART.test(c[j])) continue;
      cands.push({ at: i, len: j - i, signed: /[-+−£$€�]/.test(c[i]) });
      i = j;
    }
    var total = cands.reduce(function (n, x) { return n + x.len; }, 0);
    if (total < surplus) return null;
    if (total > surplus) {
      /* more candidates than needed: those written as money first, then the right-most */
      var order = cands.slice().sort(function (a, b) { return (b.signed - a.signed) || (b.at - a.at); }), pick = [], sum = 0;
      for (var k = 0; k < order.length && sum < surplus; k++) { pick.push(order[k]); sum += order[k].len; }
      var unsure = order.length > pick.length && order[pick.length].signed === pick[pick.length - 1].signed;
      if (sum !== surplus || unsure) return null;
      cands = pick;
    }
    var out = cells.slice();
    cands.sort(function (a, b) { return b.at - a.at; }).forEach(function (x) {
      out.splice(x.at, x.len + 1, out.slice(x.at, x.at + x.len + 1).map(function (s) { return s.trim(); }).join(","));
    });
    return out.length === want ? out : null;
  }
  function blank(format) {
    return { format: format, label: LABELS[format], delimiter: null, header: [], rows: [], lines: [],
      skipped: { before: 0, after: 0, text: [] }, issues: [], rejoined: [], closing: null, dateFormat: "dmy" };
  }
  function noteSkipped(out, text) { if (out.skipped.text.length < 6) out.skipped.text.push(String(text).slice(0, 120)); }

  function readCSV(text) {
    var out = blank("csv"), delim = sniffDelimiter(text), recs = splitCSV(text, delim);
    out.delimiter = delim;
    if (!recs.length) return out;
    /* the header: the first row that names a date and an amount; else the
       row above the first one that HOLDS a date and an amount; else row 0 */
    var hi = -1, i;
    for (i = 0; i < Math.min(20, recs.length) && hi < 0; i++) if (hasMoney(guess(recs[i].cells))) hi = i;
    for (i = 1; i < Math.min(20, recs.length) && hi < 0; i++) {
      var c = recs[i].cells;
      if (c.some(function (x) { return parseDate(x) != null; }) && c.some(function (x) { return parseDate(x) == null && looksAmount(x); })) hi = i - 1;
    }
    if (hi < 0) hi = 0;
    for (i = 0; i < hi; i++) { out.skipped.before++; noteSkipped(out, recs[i].cells.join(delim)); }
    var header = recs[hi].cells.map(function (h) { return String(h).trim(); });
    var body = recs.slice(hi + 1);
    /* trailing columns empty in the header and in every row */
    while (header.length > 1 && header[header.length - 1] === "") {
      var col = header.length - 1;
      if (body.some(function (r) { return r.cells.length > col && String(r.cells[col]).trim() !== ""; })) break;
      header.pop();
      body.forEach(function (r) { if (r.cells.length > col) r.cells.splice(col); });
    }
    var map = guess(header), want = header.length;
    /* a trailer: what follows the last dated row and holds no date at all
       in the date column ("Arranged overdraft limit"). A row whose date is
       only unreadable (31/02/2026) is still a row, and is reported. */
    if (map.date != null) {
      var last = -1;
      body.forEach(function (r, k) { if (/\d{1,4}[\/.\-]\d{1,2}[\/.\-]\d{1,4}|^\s*\d{8}/.test(String(r.cells[map.date] || ""))) last = k; });
      if (last >= 0) body.splice(last + 1).forEach(function (r) { out.skipped.after++; noteSkipped(out, r.cells.join(delim)); });
    }
    body.forEach(function (r) {
      var cells = r.cells;
      if (cells.length > want) {
        var joined = rejoin(cells, want);
        if (!joined) {
          out.issues.push({ line: r.line, cells: cells.length, expected: want, text: cells.join(delim).slice(0, 160) });
          return;
        }
        cells = joined; out.rejoined.push(r.line);
      }
      while (cells.length < want) cells.push("");
      out.rows.push(cells); out.lines.push(r.line);
    });
    out.header = header;
    out.dateFormat = detectDates(out.rows, map.date);
    var low = header.map(function (h) { return h.toLowerCase(); }).join(","), own = KURENAI_HEADER.join(",").toLowerCase();
    if (low === own || low === own.split(",").slice(0, 8).join(",") || low === own.split(",").slice(0, 7).join(",")) out.format = "kurenai";
    out.label = LABELS[out.format];
    return out;
  }

  /* ---------------- OFX / QFX ---------------- */
  function entities(s) {
    return String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  }
  function ofxTag(block, tag) {
    var m = block.match(new RegExp("<" + tag + ">([^<\\r\\n]*)", "i"));
    return m ? entities(m[1]).trim() : "";
  }
  function lineAt(text, index) { var n = 1; for (var i = 0; i < index; i++) if (text.charCodeAt(i) === 10) n++; return n; }
  function readOFX(text) {
    var out = blank("ofx"), re = /<STMTTRN>/gi, m, starts = [];
    out.header = ["Date", "Type", "Amount", "FITID", "Name", "Memo"];
    out.dateFormat = "iso";
    while ((m = re.exec(text))) starts.push(m.index);
    starts.forEach(function (at, i) {
      var end = i + 1 < starts.length ? starts[i + 1] : text.length;
      var block = text.slice(at, end), stop = block.search(/<\/STMTTRN>|<\/BANKTRANLIST>/i);
      if (stop > 0) block = block.slice(0, stop);
      var date = parseDate(ofxTag(block, "DTPOSTED") || ofxTag(block, "DTUSER"));
      out.rows.push([date || "", ofxTag(block, "TRNTYPE"), ofxTag(block, "TRNAMT"), ofxTag(block, "FITID"), ofxTag(block, "NAME") || ofxTag(block, "PAYEE"), ofxTag(block, "MEMO")]);
      out.lines.push(lineAt(text, at));
    });
    var bal = text.match(/<LEDGERBAL>([\s\S]*?)(<\/LEDGERBAL>|<AVAILBAL>|<\/STMTRS>|$)/i);
    if (bal) {
      var minor = amount(ofxTag(bal[1], "BALAMT")), on = parseDate(ofxTag(bal[1], "DTASOF"));
      if (minor != null && on) out.closing = { minor: minor, date: on };
    }
    return out;
  }

  /* ---------------- QIF ---------------- */
  function readQIF(text) {
    var out = blank("qif"), rec = null, on = true, startLine = 0;
    out.header = ["Date", "Amount", "Payee", "Memo", "Number", "Category"];
    function flush() {
      if (!rec) return;
      if (!on) out.skipped.after++;
      else if (rec.D || rec.T) { out.rows.push([rec.D || "", rec.T || "", rec.P || "", rec.M || "", rec.N || "", rec.L || ""]); out.lines.push(startLine); }
      rec = null;
    }
    text.split(/\r?\n/).forEach(function (raw, i) {
      var l = raw.trim();
      if (!l) return;
      if (l[0] === "!") { flush(); on = /^!type:(bank|cash|ccard|oth a|oth l)/i.test(l) || !/^!type:/i.test(l); return; }
      if (l === "^") { flush(); return; }
      if (!rec) { rec = {}; startLine = i + 1; }
      var k = l[0].toUpperCase(), v = l.slice(1).trim();
      if (k === "U") k = "T";
      if (k === "D") v = v.replace(/'\s*(\d{2})$/, "/20$1").replace(/'\s*(\d{4})$/, "/$1").replace(/\s+/g, "");
      if (rec[k] == null) rec[k] = v;
    });
    flush();
    out.dateFormat = detectDates(out.rows, 0);
    return out;
  }

  /* ---------------- Santander's text export ---------------- */
  function readSantander(text) {
    var out = blank("santander-txt"), rec = null, startLine = 0;
    out.header = ["Date", "Description", "Amount", "Balance"];
    function money(v) { return String(v || "").replace(/[ �\s]+/g, " ").replace(/\s*GBP\s*$/i, "").trim(); }
    function flush() {
      if (rec && rec.date) { out.rows.push([rec.date, rec.description || "", money(rec.amount), money(rec.balance)]); out.lines.push(startLine); }
      rec = null;
    }
    text.split(/\r?\n/).forEach(function (raw, i) {
      var l = raw.replace(/[ �]/g, " ").trim();
      if (!l) { flush(); return; }
      var m = l.match(/^(date|description|amount|balance)\s*:\s?(.*)$/i);
      if (!m) { if (!rec) { out.skipped.before++; noteSkipped(out, l); } return; }
      var k = m[1].toLowerCase();
      if (k === "date") { flush(); rec = { date: m[2].trim() }; startLine = i + 1; }
      else if (rec && rec[k] == null) rec[k] = m[2].trim();
    });
    flush();
    out.dateFormat = detectDates(out.rows, 0);
    return out;
  }

  function read(text, fileName) {
    text = String(text == null ? "" : text).replace(/^﻿/, "");
    var out;
    try {
      if (/<OFX>/i.test(text) || /^\s*OFXHEADER/i.test(text)) out = readOFX(text);
      else if (/^\s*!Type:/i.test(text) || /^\s*!Account/i.test(text)) out = readQIF(text);
      else if (/^\s*Date:\s*\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}\s*$/im.test(text) && /^\s*Amount:/im.test(text) && /^\s*Description:/im.test(text)) out = readSantander(text);
      else out = readCSV(text);
    } catch (e) { out = blank("csv"); }
    out.fileName = String(fileName || "").slice(0, 120);
    return out;
  }

  /* ---------------- the bank's words to a merchant (MG-08) ---------------- */
  var LEAD = [
    /^card payment to /i, /^direct debit payment to /i, /^standing order via faster payment to /i, /^bill payment via faster payment to /i,
    /^faster payments receipt ref\.?\s?\S*\s+from /i, /^faster payments receipt from /i, /^bank giro credit ref /i, /^cash withdrawal at /i,
    /^credit from /i, /^payment to /i, /^transfer to /i, /^transfer from /i
  ];
  var TAIL = [
    /,\s*rate\s+[\d.]+\/[a-z]{3}\s+on\s+\d{2}-\d{2}-\d{4}\s*$/i, /,?\s*on\s+\d{2}-\d{2}-\d{4}\s*$/i, /,\s*[\d.,]+\s?[a-z]{3}\s*$/i,
    /,?\s*mandate no\.?\s*\S+\s*$/i, /\s+reference\s+.*$/i, /\s+ref\.?\s+.*$/i
  ];
  var merchants = null, merchantIndex = null;
  function setMerchants(list) { merchants = Array.isArray(list) ? list : null; merchantIndex = null; }
  function words(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9&+']+/g, " ").replace(/\s+/g, " ").trim(); }
  function index() {
    if (merchantIndex) return merchantIndex;
    var list = merchants || (root && root.KOS_MONEY_MERCHANTS) || [];
    merchantIndex = list.map(function (r) { return { key: " " + words(r[0]) + " ", name: r[1], cat: r[2] || null }; })
      .filter(function (r) { return r.key.trim(); }).sort(function (a, b) { return b.key.length - a.key.length; });
    return merchantIndex;
  }
  function clean(text) {
    var s = String(text == null ? "" : text).replace(/[ �]/g, " ").replace(/\s+/g, " ").trim(), i, again = true;
    LEAD.forEach(function (re) { s = s.replace(re, ""); });
    s = s.replace(/\(via [a-z ]+\)/ig, " ");
    while (again) {
      again = false;
      for (i = 0; i < TAIL.length; i++) if (TAIL[i].test(s)) { s = s.replace(TAIL[i], ""); again = true; }
    }
    s = s.replace(/^[a-z0-9]{2,8}\s?\*\s?/i, "").replace(/\*/g, " ");   // "SQ *", "PAYPAL *", "GOOGLE *"
    s = s.replace(/\s+(stores?\s+)?\d{3,}\s*$/i, "").replace(/[,\s]+$/, "").replace(/\s+/g, " ").trim();
    return s;
  }
  function titleCase(s) {
    return s.split(" ").map(function (w) {
      /* an initialism (SLC, TFL, H&M, KFC) has no vowel; "TEA" is a word */
      if (/^[A-Z&]{2,4}$/.test(w) && !/[AEIOUY]/.test(w) && !/^(LTD|PLC)$/.test(w)) return w;
      return w.toLowerCase().replace(/(^|[-'&.])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
    }).join(" ").replace(/\s(Ltd|Plc|Limited)\.?$/, "").trim();
  }
  function merchant(text, type) {
    var raw = String(text == null ? "" : text).trim();
    if (!raw) return { name: "", cat: null, known: false };
    var cleaned = clean(raw);
    /* the table is asked about the whole line first: "GOOGLE *Google One"
       names its merchant before the processor prefix is taken off */
    var hay = [" " + words(raw.replace(/\*/g, " ")) + " ", " " + words(cleaned) + " "], ix = index();
    for (var i = 0; i < ix.length; i++) {
      if (hay[0].indexOf(ix[i].key) !== -1 || hay[1].indexOf(ix[i].key) !== -1) return { name: ix[i].name, cat: ix[i].cat, known: true };
    }
    return { name: titleCase(cleaned || raw).slice(0, 80), cat: null, known: false };
  }

  /* ---------------- do the bank's balances add up? ---------------- */
  /* items in FILE order: {signed (out negative), bal, date} */
  function balanceCheck(items) {
    var rows = (items || []).map(function (x, i) { return { i: i, signed: x.signed, bal: x.bal, date: x.date }; })
      .filter(function (x) { return x.bal != null && x.signed != null; });
    if (rows.length < 2) return null;
    function breaksOf(newestFirst) {
      var b = [];
      for (var k = 0; k < rows.length - 1; k++) {
        var newer = newestFirst ? rows[k] : rows[k + 1], older = newestFirst ? rows[k + 1] : rows[k];
        if (older.bal + newer.signed !== newer.bal) b.push(newer.i);
      }
      return b;
    }
    var nf = breaksOf(true), of = breaksOf(false);
    var newestFirst = nf.length !== of.length ? nf.length < of.length : rows[0].date >= rows[rows.length - 1].date;
    var breaks = newestFirst ? nf : of, top = newestFirst ? rows[0] : rows[rows.length - 1];
    return { ok: !breaks.length, order: newestFirst ? "newest-first" : "oldest-first", closing: { minor: top.bal, date: top.date }, breaks: breaks };
  }

  var api = { decode: decode, read: read, guess: guess, amount: amount, parseDate: parseDate, direction: direction,
    merchant: merchant, clean: clean, words: words, setMerchants: setMerchants, balanceCheck: balanceCheck,
    KURENAI_HEADER: KURENAI_HEADER, LABELS: LABELS };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) { root.KOS = root.KOS || {}; root.KOS.moneyImport = api; }
})(typeof window !== "undefined" ? window : null);
