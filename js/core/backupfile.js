/* Kurenai OS — js/core/backupfile.js
   The backup FILE, written and read in pieces (quality programme W1,
   DI-09's second half).

   The full backup used to be one JSON.stringify of everything, every
   stored file inside it as base64: with a few hundred megabytes of files
   that is a string of several hundred megabytes, built twice over, and an
   iPad's Safari reloads the page rather than finish it — silently. Reading
   it back made the same string again.

   THE LAYOUT. Still one JSON document (an older copy of the app reads it
   whole), laid out in lines:

     {"kos_backup_version":2,"kos_layout":"lines", …every other part…,"attachments":[
     {…one file, its content as base64…}
     ,{…the next…}
     ]}

   JSON.stringify writes no newline of its own, so every newline in the
   file is one of these. The first line is everything but the files; each
   further line is ONE file.

   WRITING (`write`): the first line from `KOS.store.snapshotFull` with the
   files left out; then each file in turn (`KOS.attach.exportEach`), its
   content read in 3 MB slices and turned into base64 slice by slice, the
   pieces gathered into a Blob — so no more than one slice is a string at a
   time, and the browser may keep the Blob on disk. A part that could not
   be read is NAMED (`missing`, in the file and in the result), never a
   reason to write no backup at all; a file the browser can no longer read
   rides by its record and is marked `unreadable`, as before.

   READING (`head`, `read`): the first line alone answers "what is in this
   backup" for the confirm; the restore takes the first line, then one file
   line at a time (`KOS.attach.importBegin`/`importOne`). A file in the old
   one-document layout is read whole, as it always was.

   Nothing here touches the Governor, the network or the cloud. */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var PREFIX = '{"kos_backup_version":2,"kos_layout":"lines"';
  var SLICE = 3 * 1024 * 1024;        // bytes read from a file at a time (a multiple of 3)
  var SUB = 30000;                     // bytes turned into base64 at a time (a multiple of 3)
  var READ = 4 * 1024 * 1024;          // bytes of the backup read at a time on restore
  var FOLD = 16 * 1024 * 1024;         // characters gathered before they are folded into a Blob

  function readBuf(blob, cb) {
    if (blob && typeof blob.arrayBuffer === "function") {
      blob.arrayBuffer().then(function (b) { cb(null, b); }, function (e) { cb(e || new Error("Could not read")); });
      return;
    }
    var r = new FileReader();
    r.onload = function () { cb(null, r.result); };
    r.onerror = function () { cb(r.error || new Error("Could not read")); };
    r.readAsArrayBuffer(blob);
  }
  function readText(blob, cb) {
    var r = new FileReader();
    r.onload = function () { cb(null, String(r.result || "")); };
    r.onerror = function () { cb(r.error || new Error("Could not read file")); };
    r.readAsText(blob);
  }
  function b64(bytes) {
    var out = "";
    for (var i = 0; i < bytes.length; i += SUB) {
      out += btoa(String.fromCharCode.apply(null, bytes.subarray(i, Math.min(bytes.length, i + SUB))));
    }
    return out;
  }
  function decoder() {
    var TD = window.TextDecoder || (typeof TextDecoder !== "undefined" ? TextDecoder : null);
    return TD ? new TD("utf-8") : null;
  }

  /* ---------------- writing ---------------- */
  /* a Blob built from pieces, folding them into a Blob now and then so
     strings are let go as it grows */
  function sink() {
    var parts = [], held = 0;
    return {
      add: function (x) {
        parts.push(x);
        held += typeof x === "string" ? x.length : 0;
        if (held > FOLD) { parts = [new Blob(parts)]; held = 0; }
      },
      blob: function (type) { return new Blob(parts, { type: type || "application/json" }); }
    };
  }
  /* one file's content as base64, slice by slice, into its own sink: a file
     that cannot be read part-way leaves the backup as it was */
  function encode(blob, cb) {
    var own = sink(), at = 0, size = blob.size || 0;
    own.add('"data:' + ((blob.type || "application/octet-stream").replace(/"/g, "")) + ";base64,");
    (function next() {
      if (at >= size) { own.add('"'); cb(null, own.blob("text/plain")); return; }
      readBuf(blob.slice(at, Math.min(size, at + SLICE)), function (err, buf) {
        if (err) { cb(err); return; }
        at += SLICE;
        try { own.add(b64(new Uint8Array(buf))); } catch (e) { cb(e); return; }
        next();
      });
    })();
  }
  function write(cb) {
    if (!KOS.store || !KOS.store.snapshotFull) { cb(new Error("The store is not loaded.")); return; }
    KOS.store.snapshotFull(function (err, snap) {
      if (err) { cb(err); return; }
      var head = { kos_backup_version: 2, kos_layout: "lines" };
      Object.keys(snap).forEach(function (k) { if (k !== "kos_backup_version" && k !== "attachments") head[k] = snap[k]; });
      var missing = (snap.missing || []).slice(), out = sink(), n = 0, unreadable = [];
      var first = JSON.stringify(head);
      out.add(first.slice(0, -1) + ',"attachments":[\n');
      head = snap = first = null;
      function finish(e) {
        if (e) missing.push({ part: "attachments", reason: e.message || String(e) });
        out.add("]}\n");
        cb(null, { blob: out.blob(), files: n, missing: missing, unreadable: unreadable });
      }
      if (!(KOS.attach && KOS.attach.available && KOS.attach.available() && KOS.attach.exportEach)) { finish(null); return; }
      KOS.attach.exportEach(function (meta, blob, next) {
        var lead = (n ? "," : "") + JSON.stringify(meta).slice(0, -1) + ',"blobBase64":';
        n++;
        if (!blob) { out.add(lead + "null}\n"); next(); return; }
        encode(blob, function (e, content) {
          if (e) {
            unreadable.push(meta.name || "a file");
            out.add(lead + 'null,"unreadable":true}\n');
          } else {
            out.add(lead); out.add(content); out.add("}\n");
          }
          next();
        });
      }, finish);
    }, { files: false, partial: true });
  }

  /* ---------------- reading ---------------- */
  function isLines(file, cb) {
    readText(file.slice(0, PREFIX.length), function (err, t) { cb(!err && t === PREFIX); });
  }
  /* every line of the file in turn: onLine(text, next), then done(err) */
  function lines(file, onLine, done) {
    var dec = decoder(), at = 0, size = file.size || 0, rest = "";
    if (!dec) {
      readText(file, function (err, t) {
        if (err) { done(err); return; }
        var ls = t.split("\n"), i = 0;
        (function step() { if (i >= ls.length) { done(null); return; } onLine(ls[i++], step); })();
      });
      return;
    }
    (function chunk() {
      if (at >= size) {
        rest += dec.decode();
        var tail = rest; rest = "";
        if (tail) onLine(tail, function () { done(null); }); else done(null);
        return;
      }
      readBuf(file.slice(at, Math.min(size, at + READ)), function (err, buf) {
        if (err) { done(err); return; }
        at += READ;
        rest += dec.decode(new Uint8Array(buf), { stream: true });
        var ls = rest.split("\n");
        rest = ls.pop();
        var i = 0;
        (function step() { if (i >= ls.length) { chunk(); return; } onLine(ls[i++], step); })();
      });
    })();
  }
  /* what the backup holds, without its files: cb(err, backup, streamed) */
  function head(file, cb) {
    isLines(file, function (yes) {
      if (!yes) {
        readText(file, function (err, t) {
          if (err) { cb(err); return; }
          var parsed;
          try { parsed = JSON.parse(t); } catch (e) { cb(e); return; }
          cb(null, parsed, false);
        });
        return;
      }
      var got = false;
      lines(file, function (line, next) {
        if (got) { next(); return; }
        got = true;
        var parsed;
        try { parsed = JSON.parse(line + "]}"); } catch (e) { cb(new Error("The backup's first line does not read: " + e.message)); return; }
        cb(null, parsed, true);
      }, function (err) { if (!got) cb(err || new Error("The backup is empty")); });
    });
  }
  /* the whole backup for a restore: cb(err, backup, eachFile|null), where
     eachFile(onItem(item, next), done(err, bad)) hands over one file at a
     time; `bad` names the lines that did not read */
  function read(file, cb) {
    head(file, function (err, backup, streamed) {
      if (err) { cb(err); return; }
      if (!streamed) { cb(null, backup, null); return; }
      cb(null, backup, function eachFile(onItem, done) {
        var lineNo = 0, bad = [];
        lines(file, function (line, next) {
          lineNo++;
          if (lineNo === 1) { next(); return; }
          var t = line.charAt(0) === "," ? line.slice(1) : line;
          if (!t || t === "]}") { next(); return; }
          var item;
          try { item = JSON.parse(t); } catch (e) { bad.push("line " + lineNo); next(); return; }
          onItem(item, next);
        }, function (e2) { done(e2 || null, bad); });
      });
    });
  }

  KOS.backupFile = { write: write, head: head, read: read, PREFIX: PREFIX, _sizes: { SLICE: SLICE, READ: READ, FOLD: FOLD } };
})();
