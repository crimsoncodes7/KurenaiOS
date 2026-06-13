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

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  /* inline markup: `code`, **bold**, →  */
  function inline(s) {
    return esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
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

  function renderBlocks(blocks) {
    var html = "";
    (blocks || []).forEach(function (b) {
      if (typeof b === "string") { html += "<p>" + inline(b) + "</p>"; return; }
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
      if (b.steps) {
        html += '<div class="n-steps">' + COPY_BTN + b.steps.map(function (s, i) {
          if (typeof s === "string") return '<div class="step revealed"><div class="sh">Step ' + (i + 1) + '</div><div class="sn">' + inline(s) + "</div></div>";
          return '<div class="step revealed"><div class="sh">Step ' + (i + 1) +
            (s.h ? " — " + inline(s.h) : "") + '</div><div class="sm">' + esc(s.m) + "</div>" +
            (s.n ? '<div class="sn">' + inline(s.n) + "</div>" : "") + "</div>";
        }).join("") + "</div>"; return;
      }
    });
    return html;
  }

  /* Trigger KaTeX for a rendered block */
  function typeset(container) {
    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
        throwOnError: false
      });
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
    var box = cp.closest(".n-code,.n-call,.n-tablewrap,.n-kv,.n-steps");
    if (!box) return;
    /* clone, drop the copy button, then read the visible text so the "Copy"
       label is excluded — works for tables/lists, not just <code>. */
    var clone = box.cloneNode(true);
    var b = clone.querySelector(".n-copy"); if (b) b.remove();
    var text = (clone.innerText || clone.textContent || "").trim();
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

  KOS.content = {
    get: function (sid, ref) { return window.KOS_CONTENT[sid + ":" + ref] || null; },
    has: function (sid, ref) { return !!window.KOS_CONTENT[sid + ":" + ref]; },
    renderBlocks: renderBlocks,
    typeset: typeset,
    inline: inline,
    highlight: highlightCode,
    coverage: function (sid, leaves) {
      var n = 0;
      leaves.forEach(function (l) { if (KOS.content.has(sid, l.ref)) n++; });
      return n;
    }
  };
})();
