/* Kurenai OS — core/bookapi.js
   External book lookup (Build 3i): title search and ISBN lookup for the
   Books module, keyless, straight from the browser.

   Two providers, both implemented — the ORDER is a live finding:
   - Open Library is PRIMARY. Verified live 2026-07-04:
     GET https://openlibrary.org/search.json?q=…  answers with
     `access-control-allow-origin: *` (file:// works), and the same
     endpoint takes `q=isbn:9781974700523` for barcode lookups — one
     endpoint, one result shape, no redirect-chasing (the dedicated
     /isbn/{n}.json endpoint 302s to /books/…json and returns author KEYS
     not names, which would cost a second request per result).
     Covers come from https://covers.openlibrary.org/b/id/{cover_i}-M.jpg.
   - Google Books is the FALLBACK. Verified live 2026-07-04: CORS is fine
     (access-control-allow-origin echoes Origin null) BUT keyless requests
     die with HTTP 429 — the shared anonymous consumer project
     (624717413613) now carries quota_limit_value 0 per day, i.e. Google
     has switched off keyless Books API traffic, not throttled it. The
     client still tries it when Open Library returns nothing or errors,
     so it contributes again the moment Google re-opens the tap (or a
     given network is exempt), and its 429 is treated as "provider
     unavailable", never surfaced as "you're offline".

   Both providers are read-only lookups — nothing here ever writes
   anywhere, and no key/token exists to store.                            */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var OL_SEARCH = "https://openlibrary.org/search.json";
  var OL_FIELDS = "title,author_name,isbn,cover_i,first_publish_year,number_of_pages_median,key";
  var GB_SEARCH = "https://www.googleapis.com/books/v1/volumes";
  var LIMIT = 10;
  var TIMEOUT = 15000;

  /* ---------------- ISBN utilities (pure) ---------------- */
  /* strip hyphens/spaces, accept ISBN-10 or ISBN-13, upper-case any X */
  function cleanIsbn(s) {
    return String(s || "").replace(/[\s-]/g, "").toUpperCase();
  }
  function isIsbn10(s) { return /^\d{9}[\dX]$/.test(s); }
  function isIsbn13(s) { return /^97[89]\d{10}$/.test(s); }
  function isValidIsbn(s) {
    s = cleanIsbn(s);
    return isIsbn10(s) || isIsbn13(s);
  }
  /* ISBN-10 → ISBN-13 (prefix 978, recompute the check digit) so the
     vault always stores one canonical form */
  function toIsbn13(s) {
    s = cleanIsbn(s);
    if (isIsbn13(s)) return s;
    if (!isIsbn10(s)) return null;
    var core = "978" + s.slice(0, 9);
    var sum = 0;
    for (var i = 0; i < 12; i++) sum += (i % 2 ? 3 : 1) * parseInt(core[i], 10);
    return core + String((10 - sum % 10) % 10);
  }
  /* pick the best ISBN-13 out of Open Library's mixed pile (it lists every
     edition's ISBNs, 10s and 13s, all languages) — first 978/979, else
     convert the first ISBN-10 */
  function pickIsbn13(list) {
    if (!Array.isArray(list)) return null;
    for (var i = 0; i < list.length; i++) {
      var c = cleanIsbn(list[i]);
      if (isIsbn13(c)) return c;
    }
    for (var j = 0; j < list.length; j++) {
      var t = toIsbn13(list[j]);
      if (t) return t;
    }
    return null;
  }

  /* ---------------- transport ---------------- */
  function getJSON(url, cb) {
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = ctl && setTimeout(function () { ctl.abort(); }, TIMEOUT);
    fetch(url, { method: "GET", signal: ctl ? ctl.signal : undefined })
      .then(function (res) {
        if (t) clearTimeout(t);
        if (!res.ok) {
          cb({ kind: res.status === 429 || res.status === 403 ? "quota" : "http",
               status: res.status, message: "HTTP " + res.status });
          return;
        }
        res.json().then(function (body) { cb(null, body); },
          function () { cb({ kind: "http", message: "Unreadable response." }); });
      })
      .catch(function (e) {
        if (t) clearTimeout(t);
        cb({ kind: "network", message: (e && e.name === "AbortError")
          ? "Lookup timed out." : "Could not reach the book database — you look offline." });
      });
  }

  /* ---------------- result mapping ----------------
     One shape from both providers:
     { title, author, isbn13, coverUrl, year, pages, source } */
  function fromOpenLibrary(doc) {
    return {
      title: doc.title || "Untitled",
      author: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : "",
      isbn13: pickIsbn13(doc.isbn),
      coverUrl: doc.cover_i ? "https://covers.openlibrary.org/b/id/" + doc.cover_i + "-M.jpg" : null,
      year: doc.first_publish_year || null,
      pages: doc.number_of_pages_median || null,
      source: "openlibrary"
    };
  }
  function fromGoogleBooks(item) {
    var v = (item && item.volumeInfo) || {};
    var isbn13 = null, isbn10 = null;
    (v.industryIdentifiers || []).forEach(function (id) {
      if (id.type === "ISBN_13") isbn13 = cleanIsbn(id.identifier);
      if (id.type === "ISBN_10") isbn10 = cleanIsbn(id.identifier);
    });
    var img = v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail);
    return {
      title: v.title || "Untitled",
      author: Array.isArray(v.authors) ? v.authors.join(", ") : "",
      isbn13: isbn13 || (isbn10 ? toIsbn13(isbn10) : null),
      /* Google serves these covers over http:// by default — upgrade */
      coverUrl: img ? img.replace(/^http:\/\//, "https://") : null,
      year: v.publishedDate ? parseInt(String(v.publishedDate).slice(0, 4), 10) || null : null,
      pages: v.pageCount || null,
      source: "googlebooks"
    };
  }

  /* ---------------- providers ---------------- */
  function searchOpenLibrary(q, cb) {
    var url = OL_SEARCH + "?q=" + encodeURIComponent(q) +
      "&fields=" + encodeURIComponent(OL_FIELDS) + "&limit=" + LIMIT;
    getJSON(url, function (err, body) {
      if (err) { cb(err, []); return; }
      cb(null, ((body && body.docs) || []).map(fromOpenLibrary));
    });
  }
  function searchGoogleBooks(q, cb) {
    var url = GB_SEARCH + "?q=" + encodeURIComponent(q) + "&maxResults=" + LIMIT;
    getJSON(url, function (err, body) {
      if (err) { cb(err, []); return; }
      cb(null, ((body && body.items) || []).map(fromGoogleBooks));
    });
  }

  /* ---------------- the public lookups ----------------
     search(term)  — free-text title/author search
     byIsbn(isbn)  — barcode / typed-ISBN lookup (accepts 10 or 13)
     Both: Open Library first; Google Books only when OL errors or returns
     nothing. cb(err, results, meta) — meta.provider says who answered and
     meta.note carries a one-line explanation when the fallback fired.
     err is only ever set when BOTH providers failed.                      */
  function twoStep(olQuery, gbQuery, cb) {
    searchOpenLibrary(olQuery, function (olErr, olResults) {
      if (!olErr && olResults.length) {
        cb(null, olResults, { provider: "openlibrary", note: null });
        return;
      }
      searchGoogleBooks(gbQuery, function (gbErr, gbResults) {
        if (!gbErr && gbResults.length) {
          cb(null, gbResults, { provider: "googlebooks",
            note: olErr ? "Open Library was unreachable — Google Books answered instead." : null });
          return;
        }
        if (!olErr && !gbErr) { cb(null, [], { provider: "openlibrary", note: null }); return; }
        if (olErr && gbErr) {
          cb({ kind: olErr.kind === "network" && gbErr.kind === "network" ? "network" : "http",
            message: olErr.kind === "network" && gbErr.kind === "network"
              ? "Neither book database is reachable — you look offline."
              : "Both lookups failed (Open Library: " + olErr.message + " · Google Books: " + gbErr.message + ")." }, []);
          return;
        }
        /* one errored, the other answered empty → honest empty result */
        cb(null, [], { provider: olErr ? "googlebooks" : "openlibrary",
          note: olErr ? "Open Library was unreachable; Google Books found nothing." : null });
      });
    });
  }
  function search(term, cb) {
    term = String(term || "").trim();
    if (term.length < 2) { cb(null, [], { provider: null, note: null }); return; }
    twoStep(term, term, cb);
  }
  function byIsbn(isbn, cb) {
    var c = cleanIsbn(isbn);
    if (!isValidIsbn(c)) {
      cb({ kind: "input", message: "That doesn't look like an ISBN — 10 or 13 digits (hyphens are fine)." }, []);
      return;
    }
    var c13 = toIsbn13(c) || c;
    twoStep("isbn:" + c13, "isbn:" + c13, function (err, results, meta) {
      /* a scanned barcode should land its own ISBN on the entry even when
         the provider's record doesn't list it back */
      (results || []).forEach(function (r) { if (!r.isbn13) r.isbn13 = c13; });
      cb(err, results, meta);
    });
  }

  KOS.bookapi = {
    search: search,
    byIsbn: byIsbn,
    cleanIsbn: cleanIsbn,
    isValidIsbn: isValidIsbn,
    toIsbn13: toIsbn13,
    pickIsbn13: pickIsbn13,
    _fromOpenLibrary: fromOpenLibrary,
    _fromGoogleBooks: fromGoogleBooks,
    _searchOpenLibrary: searchOpenLibrary,
    _searchGoogleBooks: searchGoogleBooks
  };
})();
