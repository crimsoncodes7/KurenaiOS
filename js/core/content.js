/* Kurenai OS — core/content.js
   The deep-content registry and rich block renderer. Content files in
   js/data/content/ register entries keyed "subject:ref" with this schema:

   KOS_CONTENT["compsci:4.2.3.1"] = {
     notes: [ blocks ],            // see renderBlocks below
     flashcards: [ [q, a], ... ],
     quiz: [ {q, opts:[..], ans:i, why}, ... ],
     exam: [ {q, marks, ms:[mark points]}, ... ],
     sims: [ "simId", ... ],       // simulations registered in KOS.sims
     gens: [ "genId", ... ]        // worked-example generators
   }

   Block types:
   "plain string"                          paragraph
   {p:"text"}                              paragraph (the editable form — a
                                           block may also carry an `id`,
                                           which the renderer ignores and the
                                           cloud merge keys on)
   {md:"# full markdown…"}                 a Markdown document fragment
                                           (headings, lists, fences, tables,
                                           quotes, links) — see markdown()
   {h:"Sub-heading"}
   {ul:[..]} {ol:[..]}                     lists (items can embed `code` spans with backticks)
   {kv:[["Term","Definition"],..]}         definition pairs
   {table:{head:[..], rows:[[..],..]}}
   {code:{lang:"csharp", src:"...", cap:"caption"}}
   {callout:{t:"def|tip|warn|miscon|mnemonic|memorise|formula", h:"", body:[blocks]}}
   {steps:[{h,m,n},..]}                    inline worked walkthrough
   {diagram:"sim-id"}                      "Open interactive diagram →" link to a sim
*/
(function () {
  "use strict";
  window.KOS_CONTENT = window.KOS_CONTENT || {};
  window.KOS = window.KOS || {};

  var CALLOUT_META = {
        info:     { icon: "ℹ",  label: "Information" },
    def:      { icon: "❝",  label: "Definition — exact wording" },
    tip:      { icon: "◆",  label: "Tip" },
    warn:     { icon: "⚠",  label: "Watch out" },
    miscon:   { icon: "✕",  label: "Misconception to avoid" },
    mnemonic: { icon: "♪",  label: "Mnemonic" },
    memorise: { icon: "★",  label: "Must-memorise — NOT given to you" },
    formula:  { icon: "ƒ",  label: "Formula" }
  };

  /* shared copy affordance — injected into every content box; the delegated
     handler below copies the box's text minus this button. */
  var COPY_BTN = '<button class="n-copy" type="button" aria-label="Copy to clipboard">Copy</button>';

  var esc = KOS.ui.esc;   // the canonical escaper (core/ui.js)
  /* inline markup: `code`, **bold**, *italic*, →
     Italic is matched conservatively so it can't capture arithmetic like
     "6*3" or "p * q": the opening * must sit on a word boundary and hug a
     non-space, the closing * must hug a non-space — a lone/spaced * never pairs. */
  /* Maths is lifted out first: `$a*b$` and `$$x_1$$` are KaTeX's to render
     (typeset() runs on the finished DOM), and the emphasis rules below
     must never see them. Links take a protocol allowlist — the editor lets
     the user type anything. */
  function safeHref(raw) {
    var href = String(raw || "").trim();
    if (!href || /[\u0000-\u001f\u007f]/.test(href)) return null;
    if (href.charAt(0) === "#" || href.charAt(0) === "/" || href.indexOf("./") === 0) return href;
    try {
      var u = new URL(href, window.location.href);
      return /^(https?:|mailto:)$/.test(u.protocol) ? u.href : null;
    } catch (e) { return null; }
  }
  function inline(s) {
    var math = [];
    var src = String(s == null ? "" : s).replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, function (m) {
      math.push(m);
      return "\u0003" + (math.length - 1) + "\u0004";
    });
    var out = esc(src)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<![A-Za-z0-9)*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![A-Za-z0-9(*])/g, "<em>$1</em>")
      .replace(/~~([^~]+)~~/g, "<s>$1</s>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, h) {
        /* esc() ran already, so undo it on the href before validating */
        var href = safeHref(h.replace(/&amp;/g, "&").replace(/&quot;/g, '"'));
        return href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + t + "</a>" : m;
      });
    return out.replace(/\u0003(\d+)\u0004/g, function (_, i) { return esc(math[+i]); });
  }

  /* ---------------- Markdown ----------------
     A small block-level Markdown for the {md} block and the editor: ATX
     headings, fenced code (through highlightCode), block quotes, bullet
     and numbered lists, pipe tables, rules and paragraphs, with inline()
     for everything inside. Raw HTML stays visible text. Returns HTML. */
  function markdown(src) {
    var lines = String(src == null ? "" : src).replace(/\r\n?/g, "\n").split("\n");
    var html = "", at = 0;
    function isBlockStart(i) {
      var l = lines[i] || "";
      if (!l.trim()) return true;
      return /^\s{0,3}(```+|~~~+)/.test(l) || /^\s{0,3}#{1,6}\s+/.test(l) || /^\s{0,3}>/.test(l) ||
        /^\s{0,3}([-+*]|\d+[.)])\s+/.test(l) || /^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(l) ||
        (i + 1 < lines.length && l.indexOf("|") >= 0 && isDivider(lines[i + 1]));
    }
    function cells(l) {
      var t = l.trim().replace(/^\|/, "").replace(/\|$/, "");
      return t.split("|").map(function (c) { return c.trim(); });
    }
    function isDivider(l) {
      var c = cells(l || "");
      return c.length > 0 && c.every(function (x) { return /^:?-{3,}:?$/.test(x); });
    }
    while (at < lines.length) {
      var line = lines[at], t = line.trim(), m;
      if (!t) { at++; continue; }
      m = line.match(/^\s{0,3}(```+|~~~+)\s*([^\s]*)\s*$/);
      if (m) {
        var fence = m[1], code = [];
        at++;
        while (at < lines.length && !(new RegExp("^\\s{0,3}" + fence.charAt(0) + "{" + fence.length + ",}\\s*$").test(lines[at]))) { code.push(lines[at]); at++; }
        if (at < lines.length) at++;
        html += '<figure class="n-code">' + '<button class="n-copy" type="button" aria-label="Copy code to clipboard">Copy</button>' +
          (m[2] ? '<span class="n-lang">' + esc(m[2]) + "</span>" : "") +
          "<pre><code>" + highlightCode(code.join("\n"), m[2]) + "</code></pre></figure>";
        continue;
      }
      if (t.indexOf("$$") === 0 && t.length === 2) {
        /* a display-maths block on its own lines — hand it to KaTeX whole */
        var tex = [];
        at++;
        while (at < lines.length && lines[at].trim() !== "$$") { tex.push(lines[at]); at++; }
        if (at < lines.length) at++;
        html += '<p class="n-math">$$' + esc(tex.join("\n")) + "$$</p>";
        continue;
      }
      m = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (m) {
        var lvl = Math.min(6, m[1].length + 2);
        html += "<h" + lvl + ' class="n-h n-h' + m[1].length + '">' + inline(m[2]) + "</h" + lvl + ">";
        at++; continue;
      }
      if (/^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) { html += "<hr>"; at++; continue; }
      if (at + 1 < lines.length && line.indexOf("|") >= 0 && isDivider(lines[at + 1])) {
        var head = cells(line);
        html += '<div class="n-tablewrap">' + COPY_BTN + '<table class="n-table"><thead><tr>' +
          head.map(function (h) { return "<th>" + inline(h) + "</th>"; }).join("") + "</tr></thead><tbody>";
        at += 2;
        while (at < lines.length && lines[at].trim() && lines[at].indexOf("|") >= 0) {
          var row = cells(lines[at]);
          while (row.length < head.length) row.push("");
          html += "<tr>" + row.slice(0, head.length).map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>";
          at++;
        }
        html += "</tbody></table></div>";
        continue;
      }
      if (/^\s{0,3}>/.test(line)) {
        var q = [];
        while (at < lines.length && /^\s{0,3}>/.test(lines[at])) { q.push(lines[at].replace(/^\s{0,3}>\s?/, "")); at++; }
        html += '<blockquote class="n-quote">' + markdown(q.join("\n")) + "</blockquote>";
        continue;
      }
      m = line.match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
      if (m) {
        var ordered = /^\d/.test(m[1]);
        html += ordered ? "<ol>" : "<ul>";
        while (at < lines.length) {
          m = lines[at].match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
          if (!m || /^\d/.test(m[1]) !== ordered) break;
          var item = m[2], task = item.match(/^\[([ xX])\]\s+(.*)$/);
          html += task
            ? '<li class="n-task' + (task[1] !== " " ? " done" : "") + '"><span class="n-tick" aria-hidden="true">' + (task[1] !== " " ? "☑" : "☐") + "</span> " + inline(task[2]) + "</li>"
            : "<li>" + inline(item) + "</li>";
          at++;
        }
        html += ordered ? "</ol>" : "</ul>";
        continue;
      }
      var para = [line];
      at++;
      while (at < lines.length && !isBlockStart(at)) { para.push(lines[at]); at++; }
      html += "<p>" + para.map(function (l, i) {
        return inline(l.replace(/\s+$/, "")) + (i < para.length - 1 ? (/\s{2}$/.test(l) ? "<br>" : " ") : "");
      }).join("") + "</p>";
    }
    return html;
  }

  function highlightCode(src, lang) {
    var s = esc(src);
    /* protect strings & comments with placeholders FIRST, so later keyword
       spans (which contain quotes themselves) can't be re-matched. */
    var vault = [];
    function stash(cls, text) {
      vault.push('<span class="' + cls + '">' + text + "</span>");
      return "\u0001" + (vault.length - 1) + "\u0002";
    }
    if (lang === "csharp" || lang === "cs") {
      s = s.replace(/(\/\/[^\n]*)/g, function (m) { return stash("c", m); })
           .replace(/(&quot;[^&]*?&quot;|"[^"]*")/g, function (m) { return stash("s", m); })
           .replace(/\b(public|private|protected|class|abstract|virtual|override|static|void|new|return|if|else|while|for|foreach|in|null|true|false|using|namespace|get|set|this|base|try|catch|throw|out)\b/g, '<span class="k">$1</span>')
           .replace(/\b(int|string|bool|double|float|char|var|object|decimal|long)\b/g, '<span class="t">$1</span>');
    } else if (lang === "sql") {
      s = s.replace(/(--[^\n]*)/g, function (m) { return stash("c", m); })
           .replace(/('[^']*')/g, function (m) { return stash("s", m); })
           .replace(/\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|INSERT INTO|VALUES|UPDATE|SET|DELETE|CREATE TABLE|PRIMARY KEY|FOREIGN KEY|REFERENCES|JOIN|INNER JOIN|ON|AND|OR|NOT|NULL|IS|LIKE|ASC|DESC|AS|DISTINCT|INTEGER|VARCHAR|DECIMAL)\b/g, '<span class="k">$&</span>');
    } else if (lang === "pseudo") {
      s = s.replace(/(#[^\n]*)/g, function (m) { return stash("c", m); })
           .replace(/\b(IF|THEN|ELSE|ENDIF|WHILE|ENDWHILE|REPEAT|UNTIL|FOR|TO|ENDFOR|FUNCTION|ENDFUNCTION|PROCEDURE|ENDPROCEDURE|RETURN|OUTPUT|INPUT|MOD|DIV|AND|OR|NOT|TRUE|FALSE|NULL)\b/g, '<span class="k">$1</span>');
    }
    return s.replace(/\u0001(\d+)\u0002/g, function (_, i) { return vault[+i]; });
  }

  /* Split a notes block array into named pages at every {page:"Title"} marker.
     Blocks before the first marker become an "Overview" page. With no markers,
     returns a single page so legacy entries render unchanged. */
  function splitPages(blocks) {
    var pages = [], cur = { title: "Overview", blocks: [] }, started = false;
    (blocks || []).forEach(function (b) {
      if (b && b.page) {
        if (cur.blocks.length || started) pages.push(cur);
        cur = { title: b.page, blocks: [] }; started = true;
      } else { cur.blocks.push(b); }
    });
    pages.push(cur);
    return pages;
  }

  /* a block carrying an `id` (an edited topic) is wrapped so the editor
     can point at it; the wrapper is display:contents and changes no layout */
  function renderBlocks(blocks) {
    var total = "";
    (blocks || []).forEach(function (b) {
      var html = renderOne(b);
      if (b && typeof b === "object" && b.id != null && html) {
        total += '<div class="n-blk" data-bid="' + esc(String(b.id)) + '">' + html + "</div>";
      } else total += html;
    });
    return total;
  }
  function renderOne(b) {
    var html = "";
    (function () {
      if (typeof b === "string") { html += "<p>" + inline(b) + "</p>"; return; }
      if (!b || typeof b !== "object") return;
      if (b.page) { return; } /* page divider — handled by splitPages, not rendered */
      if (b.p != null) { html += "<p>" + inline(b.p) + "</p>"; return; }
      if (b.md != null) { html += '<div class="n-md">' + markdown(b.md) + "</div>"; return; }
      if (b.h) { html += '<h4 class="n-h">' + inline(b.h) + "</h4>"; return; }
      if (b.ul) { html += "<ul>" + b.ul.map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") + "</ul>"; return; }
      if (b.ol) { html += "<ol>" + b.ol.map(function (i) { return "<li>" + inline(i) + "</li>"; }).join("") + "</ol>"; return; }
      if (b.kv) {
        html += '<dl class="n-kv">' + COPY_BTN + b.kv.map(function (p) {
          return "<dt>" + inline(p[0]) + "</dt><dd>" + inline(p[1]) + "</dd>";
        }).join("") + "</dl>"; return;
      }
      if (b.table) {
        html += '<div class="n-tablewrap">' + COPY_BTN + '<table class="n-table"><thead><tr>' +
          b.table.head.map(function (h) { return "<th>" + inline(h) + "</th>"; }).join("") +
          "</tr></thead><tbody>" +
          b.table.rows.map(function (r) {
            return "<tr>" + r.map(function (c) { return "<td>" + inline(c) + "</td>"; }).join("") + "</tr>";
          }).join("") + "</tbody></table></div>"; return;
      }
      if (b.code) {
        html += '<figure class="n-code">' +
          '<button class="n-copy" type="button" aria-label="Copy code to clipboard">Copy</button>' +
          (b.code.lang ? '<span class="n-lang">' + esc(b.code.lang) + "</span>" : "") +
          '<pre><code>' + highlightCode(b.code.src, b.code.lang) + "</code></pre>" +
          (b.code.cap ? "<figcaption>" + inline(b.code.cap) + "</figcaption>" : "") +
          "</figure>"; return;
      }
      if (b.callout) {
        var m = CALLOUT_META[b.callout.t] || CALLOUT_META.tip;
        html += '<aside class="n-call n-call-' + b.callout.t + '">' + COPY_BTN +
          '<div class="n-call-h"><span class="n-call-i">' + m.icon + "</span>" +
          inline(b.callout.h || m.label) + "</div>" +
          '<div class="n-call-b">' + renderBlocks(
            typeof b.callout.body === "string" ? [b.callout.body] : b.callout.body) + "</div></aside>"; return;
      }
      if (b.diagram) {
        var sim = window.KOS.sims && KOS.sims.get(b.diagram);
        html += '<button class="n-diagram" data-sim="' + esc(b.diagram) + '">' +
          '<span class="nd-i">⬡</span><span><b>Open interactive diagram →</b>' +
          (sim ? '<span class="nd-t">' + esc(sim.title) + "</span>" : "") +
          "</span></button>"; return;
      }
      if (b.worked) {
        var w = b.worked;
        var tag = w.tag || "example";
        var tagLabel = { example: "Worked example", exam: "Exam-style", variation: "Variation", check: "Check" }[tag] || "Worked example";
        html += '<figure class="n-worked n-worked-' + esc(tag) + '">' + COPY_BTN +
          '<figcaption class="nw-head"><span class="nw-tag">' + esc(tagLabel) + "</span>" +
          (w.title ? '<span class="nw-title">' + inline(w.title) + "</span>" : "") + "</figcaption>" +
          '<ol class="nw-steps">' + (w.steps || []).map(function (s) {
            if (typeof s === "string") return '<li class="nw-step"><span class="nw-num"></span><div class="nw-body"><div class="nw-m">' + inline(s) + "</div></div></li>";
            return '<li class="nw-step"><span class="nw-num"></span><div class="nw-body">' +
              (s.h ? '<div class="nw-sh">' + inline(s.h) + "</div>" : "") +
              (s.m != null ? '<div class="nw-m">' + inline(s.m) + "</div>" : "") +
              (s.n ? '<div class="nw-n">' + inline(s.n) + "</div>" : "") + "</div></li>";
          }).join("") + "</ol>" +
          (w.result ? '<div class="nw-result"><span class="nw-rlabel">Answer</span><span class="nw-rval">' + inline(w.result) + "</span></div>" : "") +
          "</figure>"; return;
      }
      if (b.svg) {
        html += '<figure class="n-fig">' + (b.svg.src || "") +
          (b.svg.cap ? "<figcaption>" + inline(b.svg.cap) + "</figcaption>" : "") + "</figure>"; return;
      }
      if (b.steps) {
        html += '<div class="n-steps">' + COPY_BTN + b.steps.map(function (s, i) {
          if (typeof s === "string") return '<div class="step revealed"><div class="sh">Step ' + (i + 1) + '</div><div class="sn">' + inline(s) + "</div></div>";
          return '<div class="step revealed"><div class="sh">Step ' + (i + 1) +
            (s.h ? " — " + inline(s.h) : "") + '</div>' +
            (s.m != null ? '<div class="sm">' + esc(s.m) + "</div>" : "") +
            (s.n ? '<div class="sn">' + inline(s.n) + "</div>" : "") + "</div>";
        }).join("") + "</div>"; return;
      }
    })();
    return html;
  }

  /* Trigger KaTeX for a rendered block. KaTeX loads with `defer`, so on the very
     first boot render (main.js runs before deferred scripts finish) it may not be
     ready yet — in that case retry once the window finishes loading. */
  function typeset(container) {
    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
        /* KaTeX's default ignore list lacks <svg> — walking into inline SVG
           diagrams re-parented their <text> nodes and exploded the figure */
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option", "svg"],
        throwOnError: false
      });
    } else if (document.readyState !== "complete") {
      window.addEventListener("load", function () {
        if (window.renderMathInElement) typeset(container);
      }, { once: true });
    }
  }

  /* {diagram} buttons are emitted as HTML strings, so handle clicks by
     delegation — sims may not be registered yet at render time. */
  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest(".n-diagram") : null;
    if (btn && window.KOS.sims) KOS.sims.open(btn.dataset.sim);
  });

  /* copy-to-clipboard on rendered code blocks (delegated) */
  document.addEventListener("click", function (e) {
    var cp = e.target && e.target.closest ? e.target.closest(".n-copy") : null;
    if (!cp) return;
    var box = cp.closest(".n-code,.n-call,.n-tablewrap,.n-kv,.n-steps,.n-worked");
    if (!box) return;
    /* read the LIVE element's innerText (a detached clone has no layout, so
       its innerText collapses to one line — the old bug). Hide the button
       during the read so the "Copy" label is excluded; tables keep their
       tab/newline structure, lists keep line breaks. */
    var text;
    var codeEl = box.classList.contains("n-code") ? box.querySelector("code") : null;
    if (codeEl) {
      text = codeEl.textContent.trim();
    } else {
      cp.style.display = "none";
      text = (box.innerText || box.textContent || "").trim();
      cp.style.display = "";
    }
    function done() {
      cp.classList.add("copied");
      cp.textContent = "Copied";
      setTimeout(function () { cp.classList.remove("copied"); cp.textContent = "Copy"; }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove(); done();
      } catch (err) { KOS.ui && KOS.ui.toast("Copy failed — select the code manually.", true); }
    }
  });

  /* Expansion files (js/data/content/bank-*.js) add to an entry rather than
     replace it: practice arrays concatenate, notes pages append, sims/gens
     union. The past-paper bank lives in its own files so the authored base
     stays readable and a bank file can be regenerated on its own. */
  function extend(key, patch) {
    var e = window.KOS_CONTENT[key] = window.KOS_CONTENT[key] || {};
    ["flashcards", "quiz", "exam"].forEach(function (k) {
      if (patch[k] && patch[k].length) e[k] = (e[k] || []).concat(patch[k]);
    });
    if (patch.notes && patch.notes.length) e.notes = (e.notes || []).concat(patch.notes);
    ["sims", "gens"].forEach(function (k) {
      if (!patch[k]) return;
      e[k] = e[k] || [];
      patch[k].forEach(function (id) { if (e[k].indexOf(id) < 0) e[k].push(id); });
    });
    return e;
  }

  KOS.content = {
    get: function (sid, ref) { return window.KOS_CONTENT[sid + ":" + ref] || null; },
    extend: extend,
    has: function (sid, ref) { return !!window.KOS_CONTENT[sid + ":" + ref]; },
    renderBlocks: renderBlocks,
    splitPages: splitPages,
    typeset: typeset,
    inline: inline,
    markdown: markdown,
    CALLOUT_META: CALLOUT_META,
    highlight: highlightCode,
    coverage: function (sid, leaves) {
      var n = 0;
      leaves.forEach(function (l) { if (KOS.content.has(sid, l.ref)) n++; });
      return n;
    }
  };
})();
