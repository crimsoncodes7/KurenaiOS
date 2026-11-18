/* Kurenai OS — modules/moneyimp.js
   Money for imported statements (design turn 39, quality programme W4;
   the engine is core/money.js and core/moneyimport.js, invariant 5a).

     · the import, in three steps — File (the format named back, columns
       matched by hand only when it cannot read them, 39a), Preview (each
       row as it will be stored: the merchant, its category and where that
       came from, the bank's Type, the balance, the bank's own words behind
       ▾, skipped duplicates, recurring payments it pays; a category set by
       hand offers a rule under the row, 39b–39c), Done (39h);
     · Transactions › Imports: each file with Undo and Replace (39d);
     · Money settings › Rules: your rules and the app's merchant table (39c);
     · a merchant's page (39f);
     · the Overview's Balance, Runway, By merchant and By week (39e);
     · an entry opened as a sheet on the phone and the iPad (39g, MG-25).

   Drawn with money.js's own parts (KOS.moneyUI.parts). Every write goes
   through KOS.money; a render writes nothing; amounts are KOS.ui.amount,
   masked by Hide amounts. ZERO Governor traffic. */
(function () {
  "use strict";
  var M = KOS.money, U = KOS.ui, el = U.el;
  function P() { return KOS.moneyUI.parts; }

  /* ---------------- small parts ---------------- */
  var TYPE_WORDS = { DEB: "Card payment", DD: "Direct Debit", SO: "Standing order", FPI: "Faster payment in", FPO: "Faster payment out",
    BGC: "Bank giro credit", CR: "Credit", BP: "Bill payment", ATM: "Cash machine", CHG: "Charge", DEP: "Deposit", INT: "Interest",
    DEBIT: "Debit", CREDIT: "Credit", POS: "Card payment", CPT: "Cash machine", TFR: "Transfer", XFER: "Transfer" };
  function typeChip(type) {
    var t = String(type || "").trim().toUpperCase().slice(0, 8);
    if (!t) return null;
    return el("span", { class: "k-mn-type", "data-ui": "money.bank-type", title: TYPE_WORDS[t] || null, text: t });
  }
  var KIND_OF = { csv: "CSV", kurenai: "CSV", ofx: "OFX", qif: "QIF", "santander-txt": "TXT" };
  var FORMAT_LIST = "Santander midata CSV · Online Banking CSV and TXT · QIF · OFX";
  function fileKind(format) { return el("span", { class: "k-mn-fkind", "aria-hidden": "true", text: KIND_OF[format] || "CSV" }); }
  function signedOf(t) { return t.kind === "out" || (t.kind === "transfer" && t.dir === "in") ? -t.minor : t.minor; }
  function narrow() { return !!(window.matchMedia && window.matchMedia("(max-width: 860px)").matches); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }
  function catSource(t) {
    var rule = t.payee ? M.payeeRule(t.payee) : null;
    if (rule && rule.cat === t.cat) return "your rule";
    return null;
  }

  /* ================= 39a–39c, 39h · the import ================= */
  /* opts.replaces: the import this file replaces (Imports › Replace…);
     opts.file: a file dropped on the empty Transactions page */
  function importDialog(opts) {
    opts = opts || {};
    var p = P();
    var S = { step: 0, parsed: null, mapping: null, byHand: false, dateFmt: "dmy", sign: "signed", pv: null, take: {}, filter: "all",
      raw: {}, learn: null, result: null, file: "", size: 0, replaces: opts.replaces || null, all: false, busy: false };
    var body = el("div", { class: "k-mn-import" });
    var foot = el("div", { class: "k-dialog-foot" });
    var ov = p.dialogBox("Import a statement", "入", [body], null, { hook: "money.import-dialog", cls: "k-mn-import-dialog k-msheet--full" });
    ov.querySelector(".k-dialog").appendChild(foot);
    function steps() {
      return el("ol", { class: "k-mn-isteps", "aria-label": "Import steps" }, ["File", "Preview", "Done"].map(function (t, i) {
        return el("li", { class: "k-mn-istep", "data-state": i < S.step ? "done" : i === S.step ? "on" : null, "aria-current": i === S.step ? "step" : null }, [
          el("span", { class: "k-mn-istep-n", text: i < S.step ? "✓" : String(i + 1) }), t]);
      }));
    }
    function mappingFor() {
      var m3 = Object.assign({}, S.mapping);
      if (S.sign === "signed") { delete m3.in; delete m3.out; } else delete m3.amount;
      return m3;
    }
    function needs() {
      if (!S.parsed || S.parsed.format === "kurenai") return [];
      var m = mappingFor(), n = [];
      if (m.date == null) n.push("date");
      if (m.amount == null && m.out == null && m.in == null) n.push("amount");
      return n;
    }
    function draw() {
      body.textContent = ""; foot.textContent = "";
      body.appendChild(steps());
      if (S.step === 0) drawFile();
      else if (S.step === 1) drawPreview();
      else drawDone();
    }

    /* ---- step 1: the file ---- */
    function drawFile() {
      if (!S.parsed) {
        var fileIn = el("input", { type: "file", accept: ".csv,.txt,.qif,.ofx,.qfx,text/csv,text/plain", class: "k-mn-file", "aria-label": "Choose a statement file" });
        var drop = el("div", { class: "k-mn-drop", "data-ui": "money.drop" }, [
          el("span", { class: "k-mn-drop-mark", lang: "ja", "aria-hidden": "true", text: "入" }),
          el("p", { text: "Drop a statement here, or" }),
          p.btn("Choose a file", "k-btn--primary", function () { fileIn.click(); }, "money.choose-file"), fileIn]);
        fileIn.addEventListener("change", function () { if (fileIn.files[0]) read(fileIn.files[0]); });
        drop.addEventListener("dragover", function (e) { e.preventDefault(); U.state(drop, "over", true); });
        drop.addEventListener("dragleave", function () { U.state(drop, "over", false); });
        drop.addEventListener("drop", function (e) { e.preventDefault(); U.state(drop, "over", false); if (e.dataTransfer.files[0]) read(e.dataTransfer.files[0]); });
        body.appendChild(drop);
        body.appendChild(el("p", { class: "k-muted k-mn-small", text: "Reads " + FORMAT_LIST + ", and this app's own export. Read on this device only." }));
        foot.appendChild(el("span"));
        foot.appendChild(p.btn("Cancel", "", function () { ov.close(); }));
        return;
      }
      var sk = S.parsed.skipped || { before: 0, after: 0 }, rows = S.parsed.rows.length, need = needs();
      body.appendChild(el("div", { class: "k-mn-filecard", "data-ui": "money.import-file" }, [fileKind(S.parsed.format),
        el("div", { class: "k-mn-grow k-mn-fname" }, [el("b", { class: "k-ellipsis", text: S.file || "statement" }),
          el("span", { class: "k-muted k-mn-small", text: plural(rows, "row") + (S.size ? " · " + KOS.ui.bytes(S.size) : "") })]),
        p.btn("Change file", "k-btn--sm", function () { S.parsed = null; S.byHand = false; draw(); }, "money.import-change")]));
      var said = [plural(rows, "row")];
      if (sk.before) said.unshift(plural(sk.before, "line") + " above the header skipped");
      if (sk.after) said.push(plural(sk.after, "line") + " after the last entry left out");
      if (S.parsed.issues.length) said.push(plural(S.parsed.issues.length, "row") + " that cannot be read");
      if (S.parsed.format === "kurenai") {
        body.appendChild(el("div", { class: "k-mn-format", "data-ui": "money.import-format" }, [el("span", { class: "k-mn-iok", "aria-hidden": "true", text: "✓" }),
          el("div", {}, [el("b", { text: "KurenaiOS export" }), el("span", { class: "k-muted k-mn-small", text: said.join(" · ") })])]));
        body.appendChild(el("p", { class: "k-muted k-mn-small", text: "Every column is read as it was written: the type, the category and the pot by name, a split's lines as one entry." }));
      } else if (!need.length && !S.byHand) {
        body.appendChild(el("div", { class: "k-mn-format", "data-ui": "money.import-format" }, [el("span", { class: "k-mn-iok", "aria-hidden": "true", text: "✓" }),
          el("div", {}, [el("b", { text: S.parsed.label }), el("span", { class: "k-muted k-mn-small", text: said.join(" · ") })])]));
        var READ = [["date", "Date"], ["payee", "Description"], ["amount", "Amount"], ["out", "Money out"], ["in", "Money in"], ["type", "Type"], ["balance", "Balance"], ["note", "Note"]];
        var first = S.parsed.rows[0] || [], m = mappingFor();
        body.appendChild(el("div", { class: "k-mn-readcols", "data-ui": "money.import-read" }, READ.filter(function (x) { return m[x[0]] != null; }).map(function (x) {
          return el("div", { class: "k-mn-rc" }, [el("span", { class: "k-kicker", text: x[1] }), el("span", { class: "k-mono k-ellipsis", text: first[m[x[0]]] || "—" }), el("span", { class: "k-mn-iok k-mn-iok--sm", "aria-hidden": "true", text: "✓" })]);
        })));
        body.appendChild(el("p", { class: "k-muted k-mn-small" }, ["Read by itself. ",
          el("button", { type: "button", class: "k-link", "data-ui": "money.import-byhand", text: "Match columns by hand", onclick: function () { S.byHand = true; draw(); } })]));
      } else {
        if (need.length) {
          body.appendChild(el("div", { class: "k-mn-format k-mn-format--ask", "data-ui": "money.import-format", role: "status" }, [
            el("div", {}, [el("b", { text: "Couldn't name this format." }),
              el("span", { class: "k-muted k-mn-small", text: "Choose which column is the " + (need.indexOf("date") !== -1 ? "date" : "") + (need.length === 2 ? " and which the " : "") + (need.indexOf("amount") !== -1 ? "amount" : "") + "." })])]));
        }
        body.appendChild(mapCard());
      }
      foot.appendChild(el("span", { class: "k-muted k-mn-small", text: "Nothing is saved until Import" }));
      foot.appendChild(el("span", { class: "k-mn-spacer" }));
      foot.appendChild(p.btn("Cancel", "", function () { ov.close(); }));
      foot.appendChild(p.btn("Preview " + plural(rows, "row") + " →", "k-btn--primary", function () { preview(); }, "money.import-preview",
        need.length || !rows ? { disabled: "" } : {}));
    }
    function mapCard() {
      var opts2 = [["", "Not used"], ["date", "Date"], ["payee", "Description"], ["amount", "Amount"], ["out", "Money out"], ["in", "Money in"], ["note", "Note"],
        ["type", "Type (DEB, DD, FPI…)"], ["balance", "Balance"], ["fitid", "The bank's id"]];
      var first = S.parsed.rows[0] || [];
      var rows = S.parsed.header.map(function (h, i) {
        var cur = "";
        Object.keys(S.mapping).forEach(function (k) { if (S.mapping[k] === i) cur = k; });
        var sel = p.select(opts2, cur, { "aria-label": "Column " + h, class: "k-input k-mn-mapsel" });
        sel.addEventListener("change", function () {
          Object.keys(S.mapping).forEach(function (k) { if (S.mapping[k] === i) delete S.mapping[k]; });
          if (sel.value) S.mapping[sel.value] = i;
          if (sel.value === "out" || sel.value === "in") S.sign = "columns";
          if (sel.value === "amount") S.sign = "signed";
          draw();
        });
        return el("div", { class: "k-mn-map" }, [el("span", { class: "k-mn-mh" }, [el("b", { class: "k-ellipsis", text: h || "Column " + (i + 1) }),
          el("span", { class: "k-mono k-muted k-ellipsis", text: first[i] || "—" })]), el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }), sel]);
      });
      var dateSeg = p.seg([["dmy", "DD/MM/YYYY"], ["mdy", "MM/DD/YYYY"], ["iso", "YYYY-MM-DD"]], S.dateFmt, function (v) { S.dateFmt = v; draw(); }, "Dates are written", "k-seg--fill");
      var m = mappingFor();
      return p.card([el("div", {}, rows), p.field("Dates are written", dateSeg),
        m.amount != null && m.type == null ? el("p", { class: "k-muted k-mn-small", text: "No Type column, so each row's kind comes from its sign." }) : null], "k-mn-mapcard", "money.import-map");
    }
    function read(f) {
      S.file = f.name; S.size = f.size || 0;
      var rd = new FileReader();
      rd.onload = function () {
        /* the bytes, not the browser's guess at them: a bank's text export
           is Windows-1252, and its £ would arrive as a broken character */
        S.parsed = M.csv.parse(M.csv.decode(rd.result), f.name);
        if (!S.parsed.rows.length && !S.parsed.issues.length) { fail("That file has no rows."); return; }
        S.mapping = M.csv.guess(S.parsed.header);
        S.sign = S.mapping.amount == null && (S.mapping.out != null || S.mapping.in != null) ? "columns" : "signed";
        S.dateFmt = S.parsed.dateFormat || "dmy";
        S.byHand = false;
        draw();
      };
      rd.onerror = function () { fail("The browser could not open it."); };
      rd.readAsArrayBuffer(f);
    }
    function fail(msg) {
      body.textContent = ""; body.appendChild(steps());
      body.appendChild(el("div", { class: "k-mn-fail", role: "alert" }, [el("span", { class: "k-mn-fail-mark", "aria-hidden": "true", text: "✕" }),
        el("div", {}, [el("b", { text: "This file could not be read" }), el("p", { text: msg + " Nothing was imported." })])]));
      foot.textContent = "";
      foot.appendChild(el("span"));
      foot.appendChild(p.btn("Choose another file", "k-btn--primary", function () { S.parsed = null; S.step = 0; draw(); }));
      if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce("This file could not be read.", "assertive");
    }

    /* ---- step 2: the preview ---- */
    function preview() {
      M.csv.preview(S.parsed, mappingFor(), { dateFormat: S.dateFmt === "iso" ? "dmy" : S.dateFmt }, function (err, out) {
        if (err) { fail(err.message + "."); return; }
        S.pv = out; S.step = 1; S.take = {}; S.learn = null; S.filter = "all";
        if (!S.replaces && out.overlaps && out.overlaps.length === 1 && opts.replaces === out.overlaps[0].id) S.replaces = out.overlaps[0].id;
        p.announce(plural(out.rows.length, "row") + " read. " + out.duplicates + " already here, " + out.errors.length + " cannot be read.");
        draw();
      });
    }
    function balCol() {
      var m = mappingFor();
      return m.balance != null ? m.balance : null;
    }
    function balanceOf(r) {
      var c = balCol(), src = S.parsed.rows[S.parsed.lines ? S.parsed.lines.indexOf(r.line) : -1];
      if (c == null || !src) return null;
      return M.csv && KOS.moneyImport ? KOS.moneyImport.amount(src[c]) : null;
    }
    function counts() {
      var rows = S.pv.rows, n = { neu: 0, here: 0, bill: 0, cat: 0 };
      rows.forEach(function (r) {
        if (r.duplicate && !S.take[r.line]) n.here++;
        else { n.neu++; if (r.match && r.match.state === "open") n.bill++; if (r.catFrom === "default") n.cat++; }
      });
      return n;
    }
    function drawPreview() {
      var pv = S.pv, n = counts(), p2 = P();
      if (S.replaces) {
        var was = M.imports().filter(function (r) { return r.id === S.replaces; })[0];
        if (was) body.appendChild(el("div", { class: "k-mn-note", "data-ui": "money.import-replacing" }, [el("span", { class: "k-mn-grow", text: "Replaces " + was.file + " · its entries go once these are in" }),
          p2.btn("Keep both", "k-btn--sm k-btn--quiet", function () { S.replaces = null; draw(); }, "money.import-keepboth")]));
      } else if (pv.overlaps && pv.overlaps.length) {
        var o = pv.overlaps[0];
        body.appendChild(el("div", { class: "k-mn-note", "data-ui": "money.import-overlap" }, [
          el("span", { class: "k-mn-grow", text: "Covers the same days as " + o.file + (o.from ? " (" + p2.shortDate(o.from) + " – " + p2.shortDate(o.to) + ")" : "") }),
          p2.btn("Replace it", "k-btn--sm", function () { S.replaces = o.id; draw(); }, "money.import-replace-offer")]));
      }
      var row = el("div", { class: "k-mn-counts", "data-ui": "money.import-counts" }, [
        countBtn(n.neu, "new", null), countBtn(n.here, "already here", "muted"),
        n.bill ? countBtn(n.bill, n.bill === 1 ? "pays a recurring bill" : "pay recurring bills", "teal") : null,
        n.cat ? countBtn(n.cat, "to categorise", "amber") : null, el("span", { class: "k-mn-spacer" }),
        p2.seg([["all", "All"], ["cat", "To categorise"], ["here", "Already here"]], S.filter, function (v) { S.filter = v; draw(); }, "Show", "")].filter(Boolean));
      body.appendChild(row);
      var list = el("div", { class: "k-mn-plist", "data-ui": "money.import-list", role: "list" });
      pv.errors.forEach(function (e) {
        list.appendChild(el("div", { class: "k-mn-prow", "data-state": "bad", role: "listitem" }, [el("span", { class: "k-mono k-muted", text: "row " + e.line }),
          el("span", { class: "k-mn-bad", text: e.reason + ". It will be left out." })]));
      });
      var shown = pv.rows.filter(function (r) {
        if (S.filter === "cat") return r.catFrom === "default" && !(r.duplicate && !S.take[r.line]);
        if (S.filter === "here") return r.duplicate;
        return true;
      });
      var cap = S.all ? shown.length : Math.min(shown.length, 150);
      shown.slice(0, cap).forEach(function (r) { list.appendChild(prow(r)); });
      if (cap < shown.length) list.appendChild(el("div", { class: "k-mn-more" }, [p2.btn("Show all " + shown.length, "k-btn--sm k-btn--quiet", function () { S.all = true; draw(); }, "money.import-all")]));
      if (!shown.length && !pv.errors.length) list.appendChild(el("p", { class: "k-muted k-mn-small", text: S.filter === "cat" ? "Every row has a category." : "Nothing here." }));
      body.appendChild(el("div", { class: "k-mn-phd", "aria-hidden": "true" }, ["Date", "Merchant", "Category", "Amount"].concat(balCol() != null ? ["Balance"] : []).map(function (t) { return el("span", { text: t }); })));
      U.state(body, "balance", balCol() != null);
      body.appendChild(list);
      var take = pv.rows.filter(function (r) { return !r.duplicate || S.take[r.line]; }).length;
      foot.appendChild(p2.btn("‹ Back", "", function () { S.step = 0; draw(); }, "money.import-back"));
      var rec = pv.reconcile;
      if (rec && rec.ok === true) foot.appendChild(el("span", { class: "k-muted k-mn-small k-mn-recon", "data-ui": "money.import-recon" }, ["The bank's balances add up",
        rec.closing ? " · ends at " : "", rec.closing ? p2.amt(rec.closing.minor, { size: "12-5" }) : null].filter(Boolean)));
      else if (rec && rec.ok === false) foot.appendChild(el("span", { class: "k-mn-bad k-mn-small k-mn-recon", role: "status", "data-ui": "money.import-recon",
        text: "The balance does not follow at row" + (rec.breaks.length === 1 ? " " : "s ") + rec.breaks.slice(0, 6).join(", ") }));
      else if (rec && rec.closing) foot.appendChild(el("span", { class: "k-muted k-mn-small k-mn-recon" }, ["Closing balance ", p2.amt(rec.closing.minor, { size: "12-5" })]));
      foot.appendChild(el("span", { class: "k-mn-spacer" }));
      foot.appendChild(p2.btn("Import " + plural(take, "entry", "entries"), "k-btn--primary", doImport, "money.import-go", take && !S.busy ? {} : { disabled: "" }));
    }
    function countBtn(n, label, tone) {
      return el("span", { class: "k-mn-icount", "data-tone": tone || null }, [el("b", { class: "k-mono", text: String(n) }), el("span", { text: label })]);
    }
    function prow(r) {
      var p2 = P(), here = r.duplicate && !S.take[r.line];
      var signed = r.kind === "in" || r.kind === "refund" ? r.minor : -r.minor;
      var bal = balanceOf(r);
      var catCtl = here ? el("span") : catControl(r);
      var merch = el("span", { class: "k-mn-pm" }, [
        el("b", { class: "k-ellipsis", title: r.bank && r.bank.text ? r.bank.text : null, text: r.payee || "(no payee)" }),
        r.bank ? typeChip(r.bank.type) : null,
        r.match && r.match.state === "open" ? el("button", { type: "button", class: "k-chip k-mn-chipbtn", "data-tone": "teal", "data-ui": "money.import-match", "aria-pressed": "true",
          title: "Counted as this recurring payment. Press to keep it a separate entry.", text: "↻ " + r.match.name + " · " + p2.shortDate(r.match.date),
          onclick: function () { delete r.match; draw(); } }) : null,
        r.duplicate ? el("button", { type: "button", class: "k-chip k-mn-chipbtn", "data-tone": "muted", "data-ui": "money.import-dup", "aria-pressed": S.take[r.line] ? "true" : "false",
          title: r.dupOf === "rule" ? "Already confirmed as " + (r.match && r.match.name) : "Matches an entry you have",
          text: S.take[r.line] ? "Import anyway" : r.dupOf === "rule" ? "Already confirmed · skipped" : "Already here · skipped",
          onclick: function () { S.take[r.line] = !S.take[r.line]; draw(); } }) : null,
        r.bank && r.bank.text ? el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-mn-rawbtn", "data-ui": "money.import-raw", "aria-expanded": S.raw[r.line] ? "true" : "false",
          "aria-label": "The bank's text", text: S.raw[r.line] ? "▴" : "▾", onclick: function () { S.raw[r.line] = !S.raw[r.line]; draw(); } }) : null
      ].filter(Boolean));
      var kids = [el("span", { class: "k-mono k-muted k-mn-pdate", text: p2.shortDate(r.date) }), merch, catCtl,
        el("span", { class: "k-mn-pamt" }, [p2.amt(signed, { size: "13", plus: true, tone: signed > 0 ? "in" : null })])];
      if (balCol() != null) kids.push(el("span", { class: "k-mn-pbal k-mono k-muted" }, bal != null ? [p2.amt(bal, { size: "12-5", tone: "muted" })] : []));
      var row = el("div", { class: "k-mn-prow", "data-ui": "money.import-row", role: "listitem", "data-state": here ? "here" : null }, kids);
      if (S.raw[r.line] && r.bank && r.bank.text) row.appendChild(el("p", { class: "k-mn-raw k-mono", text: r.bank.text }));
      if (S.learn && S.learn.line === r.line) row.appendChild(learnChip(r));
      return row;
    }
    function catControl(r) {
      if (r.kind === "transfer") return el("span", { class: "k-muted k-mn-small", text: "Transfer" });
      if (r.splits) return el("span", { class: "k-muted k-mn-small", text: "Split" });
      var kind = r.kind === "in" ? "in" : "out", p2 = P();
      var opts2 = M.categories({ kind: kind }).map(function (c) { return [c.id, c.name]; });
      if (r.catName) opts2.unshift(["", r.catName + " (new)"]);
      var sel = p2.select(opts2, r.cat || "", { "aria-label": "Category for " + (r.payee || "this row"), class: "k-input k-pill-select k-mn-pcat",
        "data-ui": "money.import-cat", "data-state": r.catFrom === "default" ? "choose" : null });
      sel.addEventListener("change", function () {
        r.cat = sel.value; r.catFrom = "you"; delete r.catName;
        S.learn = r.payee && r.bank ? { line: r.line, payee: r.payee, cat: r.cat, kind: r.kind } : null;
        draw();
      });
      var src = { learned: "your rule", table: "merchant table" }[r.catFrom];
      return el("span", { class: "k-mn-pc" }, [sel, src ? el("span", { class: "k-mn-src", text: src }) : null].filter(Boolean));
    }
    function learnChip(r) {
      var p2 = P(), c = p2.cat(S.learn.cat);
      return el("div", { class: "k-mn-learn", "data-ui": "money.import-learn", role: "group", "aria-label": "Make a rule" }, [
        el("span", { class: "k-mn-grow" }, ["Always put ", el("b", { text: r.payee }), " in ", el("b", { text: c.name }), "?"]),
        p2.btn("Always", "k-btn--sm k-btn--primary", function () {
          M.learnPayee(S.learn.payee, S.learn.cat);
          var key = M.payeeKey(S.learn.payee), n = 0;
          S.pv.rows.forEach(function (x) {
            if (x.line !== S.learn.line && M.payeeKey(x.payee) === key && x.kind === S.learn.kind && x.catFrom !== "you") { x.cat = S.learn.cat; x.catFrom = "learned"; n++; }
          });
          p2.announce("Rule saved: " + r.payee + " goes to " + c.name + (n ? "; " + plural(n, "more row") + " in this file" : ""));
          S.learn = null; draw();
        }, "money.import-learn-yes"),
        p2.btn("Just this one", "k-btn--sm k-btn--quiet", function () { S.learn = null; draw(); }, "money.import-learn-no")]);
    }
    function doImport() {
      var p2 = P();
      if (S.busy) return;
      S.busy = true;
      var take = S.pv.rows.map(function (r) { return Object.assign({}, r, { duplicate: r.duplicate && !S.take[r.line] }); });
      var rec = S.pv.reconcile, closing = rec && rec.closing ? Object.assign({}, rec.closing, typeof rec.ok === "boolean" ? { ok: rec.ok } : {}) : null;
      M.csv.import(take, { file: S.file, format: S.parsed.format, closing: closing, replaces: S.replaces }, function (err, out) {
        S.busy = false;
        if (err) { fail(err.message + "."); return; }
        var leftOther = take.filter(function (r) { return !r.duplicate && r.catFrom === "default" && !(r.match && r.match.state === "open"); }).length;
        S.result = { added: out.added, here: take.filter(function (r) { return r.duplicate; }).length, bad: S.pv.errors.length, batch: out.batch,
          linked: out.linked, created: out.created, suggest: out.suggest || [], other: leftOther, replaced: !!S.replaces };
        S.step = 2; p2.announce("Imported " + plural(out.added, "entry", "entries") + "."); draw(); KOS.rerender();
      });
    }

    /* ---- step 3: done ---- */
    function drawDone() {
      var r = S.result, p2 = P();
      var rec = S.pv && S.pv.reconcile;
      body.appendChild(el("div", { class: "k-mn-done", "data-ui": "money.import-done" }, [el("span", { class: "k-mn-iok k-mn-iok--lg", "aria-hidden": "true", text: "✓" }),
        el("h3", { class: "k-mn-result-h", text: r.added ? "Imported " + plural(r.added, "entry", "entries") : "Nothing was imported" }),
        el("p", { class: "k-muted k-mn-small", text: [S.file, S.pv && S.pv.from ? p2.shortDate(S.pv.from) + " – " + p2.shortDate(S.pv.to) : null,
          rec && rec.ok === true ? "the balances add up" : null, r.replaced ? "the earlier import replaced" : null].filter(Boolean).join(" · ") })]));
      body.appendChild(el("div", { class: "k-mn-counts" }, [
        r.here ? countBtn(r.here, "skipped · already here", "muted") : null,
        r.linked ? countBtn(r.linked, r.linked === 1 ? "recurring bill counted" : "recurring bills counted", "teal") : null,
        r.other ? countBtn(r.other, "to categorise", "amber") : null,
        r.bad ? countBtn(r.bad, "could not be read", "danger") : null].filter(Boolean)));
      if (r.created && (r.created.cats || r.created.pots)) body.appendChild(el("p", { class: "k-muted k-mn-small", text: "Made " +
        [r.created.cats ? plural(r.created.cats, "category", "categories") : null, r.created.pots ? plural(r.created.pots, "pot") : null].filter(Boolean).join(" and ") + " the file named." }));
      if (r.suggest.length) {
        body.appendChild(p2.card([p2.head("Looks like regular payments", "Direct Debits and standing orders with no recurring rule")].concat(r.suggest.slice(0, 5).map(function (s) {
          return el("div", { class: "k-card-row" }, [typeChip(s.type), el("span", { class: "k-mn-grow k-ellipsis", text: s.name }), p2.amt(-s.minor, { size: "13" }),
            p2.btn("Make it recurring", "k-btn--sm", function () {
              p2.ruleEditor(null, { name: s.name, kind: "out", cat: s.cat || "bills", minor: s.minor, start: s.date, every: { n: 1, unit: "month" } });
            }, "money.import-suggest")]);
        })), "k-mn-suggest", "money.import-suggestions"));
      }
      foot.appendChild(p2.btn("Undo import", "k-btn--quiet", function () {
        M.undoBatch(r.batch, function (e, n2) { ov.close(); p2.announce("Import undone · " + plural(n2 || 0, "entry", "entries") + " removed"); KOS.rerender(); });
      }, "money.import-undo"));
      foot.appendChild(el("span", { class: "k-mn-spacer" }));
      foot.appendChild(r.other
        ? p2.btn("Categorise " + r.other + " →", "k-btn--primary", function () { ov.close(); seeBatch(r.batch, "other"); }, "money.import-categorise")
        : p2.btn("See them in Transactions", "k-btn--primary", function () { ov.close(); seeBatch(r.batch, ""); }, "money.import-see"));
    }
    if (opts.file) read(opts.file);
    draw();
    return ov;
  }
  /* Transactions narrowed to one import (and one category) */
  function seeBatch(batch, catId) {
    var p = P();
    p.visit.tx = { search: "", cat: catId || "", range: "all", tag: "", kind: "", source: batch, mode: "entries" };
    if (KOS.router && location.hash === "#/money/transactions") KOS.rerender(); else p.go("transactions");
  }

  /* ================= 39d · Transactions › Imports ================= */
  function importsView(host, side) {
    var p = P(), list = M.imports();
    var holder = p.card([p.head("Imports", list.length ? plural(list.length, "file") : null, null)], "k-mn-imports", "money.imports");
    host.appendChild(holder);
    if (!list.length) {
      holder.appendChild(U.emptyState({ compact: true, mark: "入", title: "No statement imported yet",
        action: p.btn("Import a statement", "k-btn--primary k-btn--sm", function () { importDialog(); }, "money.imports-first") }));
    } else {
      var rows = el("div", { class: "k-mn-batches", role: "list" });
      holder.appendChild(rows);
      M.importCounts(function (err, left) {
        left = left || {};
        var total = 0;
        list.forEach(function (b) {
          var n = left[b.id] || 0;
          total += n;
          var range = b.from ? p.shortDate(b.from) + " – " + p.shortDate(b.to) : null;
          var when = new Date(b.at), whenS = isNaN(when) ? "" : when.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][when.getMonth()];
          var undo = function () {
            U.confirm({ title: "Undo this import?", danger: true, confirm: "Undo import", mark: "入",
              body: b.file + ": " + plural(n, "entry", "entries") + " leave every total, and any recurring payment it counted is due again." }, function () {
              M.undoBatch(b.id, function (e, m) {
                if (e) { U.toast(e.message, true); return; }
                p.announce("Import undone · " + plural(m || 0, "entry", "entries") + " removed");
                if (p.visit.tx.source === b.id) p.visit.tx.source = "";
                KOS.rerender();
              });
            });
          };
          var replace = function () { importDialog({ replaces: b.id }); };
          var acts = narrow()
            ? U.menu({ label: "⋯", className: "k-btn--sm k-mn-more-btn", items: [
              { label: "Replace…", onSelect: replace }, { label: "See its entries", onSelect: function () { seeBatch(b.id, ""); } }, { label: "Undo…", onSelect: undo }] })
            : el("div", { class: "k-mn-actions" }, [p.btn("See entries", "k-btn--sm k-btn--quiet", function () { seeBatch(b.id, ""); }, "money.batch-see"),
              p.btn("Replace…", "k-btn--sm", replace, "money.batch-replace"), p.btn("Undo…", "k-btn--sm", undo, "money.batch-undo")]);
          if (acts.setAttribute && narrow()) acts.setAttribute("aria-label", "Actions for " + (b.file || "this import"));
          rows.appendChild(el("div", { class: "k-mn-batch", role: "listitem", "data-ui": "money.batch" }, [fileKind(b.format),
            el("div", { class: "k-mn-grow k-mn-fname" }, [el("b", { class: "k-ellipsis", text: b.file || "statement" }),
              el("span", { class: "k-muted k-mn-small", text: [range, plural(b.n, "row") + (n !== b.n ? " · " + n + " left" : ""), whenS].filter(Boolean).join(" · ") })]), acts]));
        });
        holder.querySelector(".k-card-meta").textContent = plural(list.length, "file") + " · " + plural(total, "entry", "entries");
      });
    }
    side.appendChild(p.card([p.head("Undo or replace"),
      el("p", { class: "k-muted k-mn-small", text: "Undo removes every entry of that file. Replace reads a newer file over the same days; its entries go only once the new ones are in." }),
      p.btn("Import a statement", "k-btn--sm", function () { importDialog(); }, "money.imports-new")], "", "money.imports-help"));
  }

  /* the empty Transactions page (39h): no entry anywhere yet */
  function emptyTransactions(host) {
    var p = P();
    /* the card takes the whole width: no side panel beside an empty page */
    if (host.parentNode) U.state(host.parentNode, "empty", true);
    var fileIn = el("input", { type: "file", accept: ".csv,.txt,.qif,.ofx,.qfx,text/csv,text/plain", class: "k-mn-file", "aria-label": "Choose a statement file" });
    fileIn.addEventListener("change", function () { if (fileIn.files[0]) importDialog({ file: fileIn.files[0] }); });
    var drop = el("div", { class: "k-mn-drop k-mn-drop--page", "data-ui": "money.empty-drop" }, [el("b", { text: "Drop a statement here" }), el("span", { class: "k-muted", text: "or" }),
      p.btn("Choose a file", "k-btn--primary", function () { fileIn.click(); }, "money.empty-choose"), fileIn]);
    drop.addEventListener("dragover", function (e) { e.preventDefault(); U.state(drop, "over", true); });
    drop.addEventListener("dragleave", function () { U.state(drop, "over", false); });
    drop.addEventListener("drop", function (e) { e.preventDefault(); U.state(drop, "over", false); if (e.dataTransfer.files[0]) importDialog({ file: e.dataTransfer.files[0] }); });
    host.appendChild(p.card([el("div", { class: "k-mn-empty" }, [
      el("img", { class: "k-mn-first-art", src: "assets/app/img/app.empty.money.webp", alt: "", loading: "lazy", "aria-hidden": "true" }),
      el("div", { class: "k-mn-empty-b" }, [p.kicker("円 · Nothing here yet"), el("h2", { class: "k-mn-first-title", text: "Bring in a statement" }),
        el("p", { class: "k-muted k-mn-small", text: FORMAT_LIST }), drop,
        el("div", { class: "k-mn-actions" }, [p.btn("Add an entry by hand", "k-btn--sm", function () { p.entryEditor(null); }, "money.empty-add")])])])], "k-mn-emptycard", "money.tx-empty"));
  }

  /* ================= 39c · Money settings › Rules ================= */
  function settings(page) {
    var p = P();
    var mine = M.payees();
    var counts = {};
    var mineCard = p.card([p.head("Your rules", mine.length ? plural(mine.length, "rule") + " · checked first" : null, ["＋ New rule", function () { ruleDialog(null); }])], "k-mn-rules", "money.rules");
    var list = el("div", { class: "k-mn-rulelist", role: "list" });
    mineCard.appendChild(list);
    function drawMine() {
      list.textContent = "";
      if (!mine.length) {
        list.appendChild(el("p", { class: "k-muted k-mn-small", text: "When you set an imported entry's category, you can make it a rule here: the next statement then files that merchant by itself." }));
        return;
      }
      mine.forEach(function (r) {
        var c = p.cat(r.cat);
        list.appendChild(el("div", { class: "k-mn-rulerow", role: "listitem", "data-ui": "money.rule-row" }, [
          el("button", { type: "button", class: "k-link k-mn-strong k-ellipsis", text: r.name, onclick: function () { openMerchant(r.name); } }),
          el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }),
          el("span", { class: "k-mn-catchip" }, [p.dot(c.tone), el("span", { class: "k-ellipsis", text: c.name })]),
          el("span", { class: "k-muted k-mn-small k-mn-rulen", text: counts[r.key] != null ? plural(counts[r.key], "entry", "entries") : "" }),
          p.btn("Edit", "k-btn--sm", function () { ruleDialog(r); }, "money.rule-edit"),
          p.btn("Delete", "k-btn--sm k-btn--quiet", function () {
            M.forgetPayee(r.name); p.announce("Rule deleted · " + r.name); KOS.rerender();
          }, "money.rule-delete")]));
      });
    }
    drawMine();
    M.range("0000-01-01", "9999-12-31", function (err, rows) {
      (rows || []).forEach(function (t) { var k = M.payeeKey(t.payee); if (k) counts[k] = (counts[k] || 0) + 1; });
      drawMine();
    });
    /* the merchant table, read-only, searchable */
    var table = (window.KOS_MONEY_MERCHANTS || []).reduce(function (acc, row) {
      if (!acc.seen[row[1]]) { acc.seen[row[1]] = true; acc.list.push({ name: row[1], cat: row[2] }); }
      return acc;
    }, { seen: {}, list: [] }).list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    var q = p.input("search", "", { placeholder: "Search the table", "aria-label": "Search the merchant table", class: "k-input k-mn-search", "data-ui": "money.table-search" });
    var tlist = el("div", { class: "k-mn-rulelist k-mn-tablegrid", role: "list", "data-ui": "money.table-list" });
    function drawTable() {
      tlist.textContent = "";
      var s = q.value.trim().toLowerCase();
      var hits = table.filter(function (x) { return !s || x.name.toLowerCase().indexOf(s) !== -1; });
      hits.slice(0, 48).forEach(function (x) {
        var c = x.cat ? p.cat(x.cat) : null;
        tlist.appendChild(el("div", { class: "k-mn-rulerow k-mn-rulerow--ro", role: "listitem" }, [el("b", { class: "k-ellipsis", text: x.name }),
          el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }),
          c ? el("span", { class: "k-mn-catchip" }, [p.dot(c.tone), el("span", { class: "k-ellipsis", text: c.name })]) : el("span", { class: "k-muted k-mn-small", text: "Other" })]));
      });
      if (hits.length > 48) tlist.appendChild(el("p", { class: "k-muted k-mn-small k-mn-tablemore", text: (hits.length - 48) + " more · search to find one" }));
      if (!hits.length) tlist.appendChild(el("p", { class: "k-muted k-mn-small", text: "Not in the table." }));
    }
    q.addEventListener("input", U.debounce(drawTable, 200));
    drawTable();
    var tableCard = p.card([el("div", { class: "k-mn-tablehead" }, [p.head("The app's merchant table", "read-only · " + table.length + " UK merchants · a rule of yours wins"), q]), tlist],
      "k-mn-table", "money.table");
    page.appendChild(el("div", { class: "k-mn-stack" }, [mineCard, tableCard]));
  }
  function ruleDialog(r) {
    var p = P();
    var name = p.input("text", r ? r.name : "", { maxlength: "80", placeholder: "Heron Foods", "aria-label": "Merchant" });
    var all = M.categories().map(function (c) { return [c.id, c.name + (c.kind === "in" ? " (income)" : "")]; });
    var catSel = p.select(all, r ? r.cat : "food", { "aria-label": "Category" });
    var err = el("p", { class: "k-field-error", role: "alert", hidden: "" });
    var ov = p.dialogBox(r ? "Edit rule" : "New rule", "則", [p.field("Merchant", name, "As it shows on your entries"), p.field("Always file it in", catSel), err],
      [el("span"), p.btn("Cancel", "", function () { ov.close(); }), p.btn(r ? "Save" : "Add rule", "k-btn--primary", function () {
        var n = name.value.trim();
        if (!n) { err.hidden = false; err.textContent = "Name the merchant."; name.focus(); return; }
        if (r && M.payeeKey(n) !== r.key) M.forgetPayee(r.name);
        M.learnPayee(n, catSel.value);
        ov.close(); p.announce("Rule saved · " + n); KOS.rerender();
      }, "money.rule-save")], { hook: "money.rule-dialog", focus: name });
  }

  /* ================= 39f · a merchant's page ================= */
  function openMerchant(name) { var k = M.payeeKey(name); if (k) KOS.show("money", "merchant:" + k); }
  function merchantPage(main, key) {
    var p = P(), now = p.today();
    var page = el("div", { class: "k-mn", "data-ui": "money.page money.merchant", "data-view": "merchant" });
    var sub = el("div", { class: "k-mn-chips" });
    main.appendChild(U.pageHeader({ kicker: "円 · Money", title: " ", className: "k-mn-head",
      actions: [p.btn("‹ Transactions", "", function () { p.go("transactions"); }, "money.merchant-back")] }));
    var titleEl = main.querySelector(".k-pagehead h1");
    main.appendChild(page);
    var from = new Date(); from.setMonth(from.getMonth() - 5, 1);
    var fromS = from.getFullYear() + "-" + (from.getMonth() < 9 ? "0" : "") + (from.getMonth() + 1) + "-01";
    M.range("0000-01-01", "9999-12-31", function (err, rows) {
      var mine = (rows || []).filter(function (t) { return M.payeeKey(t.payee) === key && t.kind !== "transfer"; })
        .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      if (!mine.length) {
        if (titleEl) titleEl.textContent = "Merchant";
        page.appendChild(U.emptyState({ mark: "円", title: "No entries for this merchant", action: p.btn("Transactions", "", function () { p.go("transactions"); }) }));
        return;
      }
      var name = mine[0].payee;
      if (titleEl) titleEl.textContent = name;
      var spend = function (t) { return t.kind === "in" ? -t.minor : t.kind === "refund" ? -t.minor : t.minor; };
      var key0 = M.periodKey(now), r0 = M.periodRange(key0);
      var month = mine.filter(function (t) { return t.date >= r0.from && t.date <= r0.to; });
      var six = mine.filter(function (t) { return t.date >= fromS; });
      var income = mine.every(function (t) { return t.kind === "in"; });
      var sum = function (xs) { return xs.reduce(function (n, t) { return n + spend(t); }, 0); };
      var c = p.cat(mine[0].cat), rule = M.payeeRule(name);
      /* the months: each period's total, the six most recent */
      var months = [], k = key0;
      for (var i = 0; i < 6; i++) { months.unshift(k); k = M.shiftKey(k, -1); }
      var per = months.map(function (mk) { var rr = M.periodRange(mk); return sum(mine.filter(function (t) { return t.date >= rr.from && t.date <= rr.to; })); });
      var top = Math.max.apply(null, per.map(Math.abs).concat([1]));
      var sign = income ? -1 : 1;
      var stats = el("div", { class: "k-mn-mstats", "data-ui": "money.merchant-stats" }, [
        stat("This month", p.amt(sign * sum(month), { size: "18" })),
        stat("Six months", p.amt(sign * sum(six), { size: "18" })),
        stat("Average", p.amt(Math.round(sign * sum(mine) / mine.length), { size: "18" })),
        stat(income ? "Payments" : "Visits", el("b", { class: "k-mono k-mn-statn", text: String(mine.length) }))]);
      var bars = el("div", { class: "k-mn-weeks", "data-ui": "money.merchant-months", role: "img",
        "aria-label": (income ? "Received" : "Spent") + " each month" }, months.map(function (mk, j) {
        return el("div", { class: "k-mn-wk", "data-state": j === months.length - 1 ? "now" : null }, [
          el("span", { class: "k-mn-wkv" }, per[j] ? [p.amt(Math.abs(per[j]), { size: "11-5", whole: true, tone: "muted" })] : []),
          el("span", { class: "k-mn-wkbar", style: "--h: " + Math.max(4, Math.round(100 * Math.abs(per[j]) / top)) + "%" }),
          el("span", { class: "k-mn-wkl", text: p.monthName(mk).slice(0, 3) })]);
      }));
      var txs = el("div", { class: "k-mn-tx", role: "list" }, mine.slice(0, 40).map(function (t) {
        return el("button", { type: "button", class: "k-mn-txrow k-mn-txrow--plain", role: "listitem", "data-ui": "money.merchant-row",
          onclick: function () { openEntry(t); } }, [el("span", { class: "k-mono k-muted k-mn-small", text: p.dayLabel(t.date) }),
          el("span", { class: "k-mn-txpayee" }, [el("span", { class: "k-ellipsis k-mn-strong", text: t.payee }), t.bank ? typeChip(t.bank.type) : null].filter(Boolean)),
          el("span", { class: "k-mn-txamt" }, [p.amt(signedOf(t), { plus: true, tone: t.kind === "in" || t.kind === "refund" ? "in" : null })])]);
      }));
      var catSel = p.select(M.categories({ kind: income ? "in" : "out" }).map(function (x) { return [x.id, x.name]; }), (rule && rule.cat) || mine[0].cat,
        { "aria-label": "Category for " + name, class: "k-input k-pill-select", "data-ui": "money.merchant-cat" });
      catSel.addEventListener("change", function () { M.learnPayee(name, catSel.value); p.announce("Rule saved · " + name + " goes to " + p.cat(catSel.value).name); KOS.rerender(); });
      var texts = [];
      mine.forEach(function (t) { if (t.bank && t.bank.text && texts.indexOf(t.bank.text) === -1) texts.push(t.bank.text); });
      sub.appendChild(el("span", { class: "k-mn-catchip" }, [p.dot(c.tone), el("span", { text: c.name })]));
      if (rule) sub.appendChild(el("span", { class: "k-mn-src", text: "your rule" }));
      if (month.length) sub.appendChild(el("span", { class: "k-muted k-mn-small", text: plural(month.length, income ? "payment" : "visit") + " this month" }));
      page.appendChild(sub);
      page.appendChild(el("div", { class: "k-mn-cols k-mn-cols--sm" }, [
        el("div", { class: "k-mn-stack" }, [p.card([stats, bars], "", "money.merchant-summary"),
          p.card([p.head("Entries", String(mine.length) + (mine.length > 40 ? " · the newest 40" : "")), txs], "k-mn-txcard", "money.merchant-entries")]),
        el("div", { class: "k-mn-side" }, [
          p.card([p.head("Category and rule"), p.field("Always file in", catSel),
            rule ? el("div", { class: "k-mn-actions" }, [el("span", { class: "k-muted k-mn-small k-mn-grow", text: "Your rule · the next statement files it here" }),
              p.btn("Delete rule", "k-btn--sm k-btn--quiet", function () { M.forgetPayee(name); p.announce("Rule deleted"); KOS.rerender(); }, "money.merchant-unrule")])
              : el("p", { class: "k-muted k-mn-small", text: "Choosing a category here makes it a rule for the next statement. Entries you have keep theirs." })], "", "money.merchant-rule"),
          texts.length ? p.card([p.head("Bank text seen", String(texts.length))].concat(texts.slice(0, 6).map(function (x) { return el("p", { class: "k-mn-raw k-mono", text: x }); })), "", "money.merchant-texts") : null
        ].filter(Boolean))]));
    });
    function stat(label, fig) { return el("div", { class: "k-mn-stat" }, [el("span", { class: "k-muted k-mn-small", text: label }), fig]); }
  }

  /* ================= 39e · the Overview's new cards ================= */
  /* Balance (the newest import with the bank's closing balance), Runway
     (Student Finance: an income rule in Grants still to come, a known
     balance and two weeks of spend), By merchant and By week — each only
     with its evidence (invariant 76) */
  function overviewCards(mainStack, side, s, now) {
    var p = P();
    var withBal = M.imports().filter(function (r) { return r.closing; }).sort(function (a, b) { return a.closing.date < b.closing.date ? 1 : -1; })[0];
    var from = p.addDays(now, -55);
    M.range(from < s.from ? from : s.from, now, function (err, rows) {
      rows = rows || [];
      var out = function (t) { return t.kind === "out" ? t.minor : t.kind === "refund" ? -t.minor : 0; };
      /* By merchant: this period, the top ten */
      var m = {}, visits = {};
      rows.forEach(function (t) {
        if (t.date < s.from || t.date > s.to || !t.payee || !out(t)) return;
        var k = M.payeeKey(t.payee);
        if (!m[k]) m[k] = { name: t.payee, minor: 0, n: 0, tone: p.cat(t.cat).tone };
        m[k].minor += out(t); m[k].n++;
      });
      var top = Object.keys(m).map(function (k) { return m[k]; }).filter(function (x) { return x.minor > 0; }).sort(function (a, b) { return b.minor - a.minor; }).slice(0, 10);
      if (top.length >= 2) {
        var max = top[0].minor;
        mainStack.appendChild(p.card([p.head("By merchant", "top " + top.length + " · " + p.monthName(s.key))].concat(top.map(function (x) {
          return el("button", { type: "button", class: "k-mn-bar", "data-ui": "money.merchant-bar", onclick: function () { openMerchant(x.name); },
            "aria-label": x.name + (M.isHidden() ? "" : ", " + p.money(x.minor)) + ", " + plural(x.n, "visit") }, [
            el("span", { class: "k-mn-bl" }, [p.dot(x.tone), el("span", { class: "k-ellipsis", text: x.name }), x.n > 1 ? el("span", { class: "k-muted k-mn-small", text: String(x.n) }) : null].filter(Boolean)),
            el("span", { class: "k-mn-btrack", "aria-hidden": "true" }, [el("i", { "data-cat-tone": x.tone, style: "--p: " + Math.max(2, Math.round(100 * x.minor / max)) + "%" })]),
            el("span", { class: "k-mn-bv" }, [p.amt(x.minor, { size: "12-5" })])]);
        })), "k-mn-bymerchant", "money.by-merchant"));
      }
      /* By week: the last five weeks from Monday, spend only; two weeks with entries at least */
      var weeks = [], d = new Date(now.slice(0, 4), +now.slice(5, 7) - 1, +now.slice(8, 10));
      var mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      for (var i = 4; i >= 0; i--) {
        var a = new Date(mon); a.setDate(mon.getDate() - 7 * i);
        var b = new Date(a); b.setDate(a.getDate() + 6);
        weeks.push({ from: iso(a), to: iso(b), minor: 0, n: 0, now: i === 0 });
      }
      rows.forEach(function (t) { weeks.forEach(function (w) { if (t.date >= w.from && t.date <= w.to && out(t)) { w.minor += out(t); w.n++; } }); });
      if (weeks.filter(function (w) { return w.n; }).length >= 2) {
        var wmax = Math.max.apply(null, weeks.map(function (w) { return w.minor; }).concat([1]));
        side.insertBefore(p.card([p.head("By week", "spent"), el("div", { class: "k-mn-weeks", role: "img", "aria-label": "Spent each week" }, weeks.map(function (w) {
          return el("div", { class: "k-mn-wk", "data-state": w.now ? "now" : null }, [el("span", { class: "k-mn-wkv" }, w.minor ? [p.amt(w.minor, { size: "11-5", whole: true, tone: "muted" })] : []),
            el("span", { class: "k-mn-wkbar", style: "--h: " + Math.max(4, Math.round(100 * w.minor / wmax)) + "%" }),
            el("span", { class: "k-mn-wkl", text: p.shortDate(w.from) })]);
        }))], "", "money.by-week"), side.firstChild);
      }
      /* Balance and Runway */
      if (withBal) {
        var since = rows.filter(function (t) { return t.date > withBal.closing.date && t.kind !== "transfer"; });
        var moved = since.reduce(function (n, t) { return n + (t.kind === "in" || t.kind === "refund" ? t.minor : -t.minor); }, 0);
        var nowBal = withBal.closing.minor + moved;
        var balCard = p.card([p.head("Balance", "as of " + p.shortDate(withBal.closing.date) + " · " + (withBal.file || "import")),
          el("div", { class: "k-mn-selhead" }, [p.amt(withBal.closing.minor, { size: "20" }),
            withBal.closing.ok === true ? p.chip("✓ The bank's balances add up", "teal") : null].filter(Boolean)),
          since.length ? el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-soft", text: "With " + plural(since.length, "entry", "entries") + " since" }), p.amt(nowBal, { size: "13" })]) : null
        ].filter(Boolean), "", "money.balance");
        var cards = [balCard];
        var grant = M.rules().filter(function (r) { return r.kind === "in" && r.cat === "grants"; })
          .map(function (r) { return { r: r, next: M.occurrences(r, p.addDays(now, 1), p.addDays(now, 400))[0] }; })
          .filter(function (x) { return x.next; }).sort(function (a, b) { return a.next < b.next ? -1 : 1; })[0];
        var spent = rows.filter(function (t) { return t.date > p.addDays(now, -56) && t.date <= now; });
        var spentDays = {}; spent.forEach(function (t) { if (out(t) > 0) spentDays[t.date] = true; });
        var firstDay = Object.keys(spentDays).sort()[0];
        var spanDays = firstDay ? Math.max(14, Math.min(56, p.between(firstDay, now) + 1)) : 0;
        if (grant && firstDay && p.between(firstDay, now) >= 13 && nowBal > 0) {
          var weekly = Math.round(spent.reduce(function (n, t) { return n + out(t); }, 0) * 7 / spanDays);
          if (weekly > 0) {
            var lastsDays = Math.floor(nowBal / weekly * 7), lasts = p.addDays(now, lastsDays), short = lasts < grant.next;
            cards.unshift(p.card([p.head("Runway", grant.r.name),
              el("b", { class: "k-mn-rfig", text: short ? "lasts until " + p.shortDate(lasts) : "lasts past " + p.shortDate(grant.next) }),
              el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-soft", text: "Next instalment" }), el("span", { class: "k-mono", text: p.shortDate(grant.next) })]),
              el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-soft", text: "Money left" }), p.amt(nowBal, { size: "13" })]),
              el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-soft", text: "A week's spend · " + Math.round(spanDays / 7) + " wk" }), p.amt(weekly, { size: "13" })]),
              short ? p.chip("◷ " + plural(p.between(lasts, grant.next), "day") + " short", "amber") : null].filter(Boolean), "", "money.runway"));
          }
        }
        cards.reverse().forEach(function (cd) { side.insertBefore(cd, side.firstChild); });
      }
    });
    function iso(dt) { return dt.getFullYear() + "-" + (dt.getMonth() < 9 ? "0" : "") + (dt.getMonth() + 1) + "-" + (dt.getDate() < 10 ? "0" : "") + dt.getDate(); }
  }

  /* ================= 39g · an entry as a sheet (MG-25) ================= */
  /* above 860 a row fills the side panel; at 860 and below it opens here:
     a bottom sheet on the phone, a side sheet on the iPad */
  function openEntry(t) {
    var p = P();
    var ov = p.dialogBox("Entry", "円", [p.entryDetail(t)], null, { hook: "money.entry-sheet", cls: "k-mn-sheet", sub: p.dayLabel(t.date) });
    var close = function (fn) { return function () { ov.close(); fn(); }; };
    if (t.src !== "wishlist") {
      var f = el("div", { class: "k-dialog-foot" }, [
        t.src !== "rule" ? p.btn("Duplicate", "", close(function () { p.entryEditor(Object.assign({}, t, { syncId: null, date: p.today() }), { duplicate: true }); }), "money.sheet-dup") : null,
        p.btn("Delete…", "k-mn-del", close(function () { p.deleteEntry(t); }), "money.sheet-delete"),
        p.btn("Edit", "k-btn--primary", close(function () { p.entryEditor(t); }), "money.sheet-edit")].filter(Boolean));
      ov.querySelector(".k-dialog").appendChild(f);
    }
    return ov;
  }
  /* the parts an entry's detail adds for an imported row: the bank's Type,
     its own words, where the category came from, the rule switch and the
     merchant's page */
  function entryExtras(t) {
    var p = P(), kids = [];
    if (t.bank && t.bank.text) kids.push(el("p", { class: "k-mn-raw k-mono", "data-ui": "money.sel-bank", text: t.bank.text }));
    if (t.payee && t.kind !== "transfer" && t.src !== "wishlist" && !(t.splits && t.splits.length > 1)) {
      var rule = M.payeeRule(t.payee), on = !!(rule && rule.cat === t.cat);
      var sw = el("input", { type: "checkbox", class: "k-switch", "data-ui": "money.sel-rule", "aria-label": "Always file " + t.payee + " like this" });
      sw.checked = on;
      sw.addEventListener("change", function () {
        if (sw.checked) { M.learnPayee(t.payee, t.cat); p.announce("Rule saved · " + t.payee + " goes to " + p.cat(t.cat).name); }
        else { M.forgetPayee(t.payee); p.announce("Rule deleted · " + t.payee); }
      });
      if (t.src === "csv" || rule) kids.push(el("label", { class: "k-mn-switchrow" }, [el("span", { class: "k-mn-grow", text: "Always file " + t.payee + " like this" }), sw]));
      kids.push(el("button", { type: "button", class: "k-link k-mn-small", "data-ui": "money.sel-merchant", text: t.payee + " →", onclick: function () { openMerchant(t.payee); } }));
    }
    return kids;
  }

  KOS.moneyImp = { importDialog: importDialog, importsView: importsView, emptyTransactions: emptyTransactions, settings: settings,
    merchantPage: merchantPage, overviewCards: overviewCards, openEntry: openEntry, openMerchant: openMerchant, entryExtras: entryExtras,
    typeChip: typeChip, catSource: catSource, narrow: narrow };
})();
