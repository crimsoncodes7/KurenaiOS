/* The lookup layer on top of any tokeniser (plan §6): adjacent short units are joined when the
   join is a dictionary headword — the last unit in its dictionary form, so 乗り|遅れ → 乗り遅れる and
   日本|語 → 日本語. The parts stay too: coverage counts a known compound, lookup offers both. */
module.exports.wrap = function (tok, headwords, maxSpan) {
  maxSpan = maxSpan || 5;
  return function (text) {
    var t = tok(text), out = t.slice();
    for (var i = 0; i < t.length; i++) {
      var head = "";
      for (var j = i + 1; j < Math.min(t.length, i + maxSpan); j++) {
        head += t[j - 1].s;
        var last = t[j], forms = [last.s].concat(last.c || []);
        for (var k = 0; k < forms.length; k++) {
          var w = head + forms[k];
          if (forms[k] && headwords.has(w)) { out.push({ s: w, pos: "merged", c: [w] }); break; }
        }
      }
    }
    return out;
  };
};
