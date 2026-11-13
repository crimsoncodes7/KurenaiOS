/* Kurenai OS — js/core/profilepics.js · KOS.profilePics
   Your own profile picture and banner, kept in the FILE STORE
   (quality programme W1, RC5; DI-10/LA-9).

   They used to ride the synced state document as data URLs (about 440 KB
   of a 1.35 MB document). Now each is ONE record in `kurenai-os-files`
   (KOS.attach, invariant 150) with `origin` "profile:avatar" or
   "profile:banner": its metadata syncs and its binary goes to your
   private bucket like every file (invariant 36; profile pictures go up
   even where automatic upload is off on this device, because the state
   used to carry them everywhere). The state keeps only the reference and
   the crop:

     governor.avatar.file   the avatar's fileId   (avatar.img: null)
     governor.bannerFile    the banner's fileId   (bannerImg: null)

   They are NOT library files: the Files page, search, Storage's lists and
   the Assistant's files_list leave `profile:` records out (KOS.files),
   and adding the same picture to a topic never links onto one (nor one
   onto a library file).

   READING (every renderer goes through here):
     src(which[, g])  → the picture's URL now, or null — an inline source
                        still in state (an older device's upload, not moved
                        yet) wins; else the cached object URL of the file;
                        else null, and the file is read in the background
                        and the page redrawn softly when it lands.
     has(which[, g])  → a picture is SET (shown yet or not)
     load(which)      → Promise<url|null>
   A reference whose file has not arrived on this device (pulled state,
   metadata or binary still to come) reads null: the painted default is
   drawn, and the reference is never touched by a read.

   WRITING: write(which, dataUrl) → Promise<fileId> (a new upload), and
   release(fileId) removes a record nothing references any more — unless
   something else links to it (an older version could link a topic onto the
   same bytes): then it only stops being a profile record. sweep() releases
   profile records no state references once they are a week old (the loser
   of two uploads made at once on two devices); the sync engine runs it
   after a good cycle.

   THE MOVE of pictures already in state is the repair
   "profile-pictures-to-files" (automatic, KOS.repairs, invariant 1a): a
   dry run from the data, a verified checkpoint, the file written and read
   back byte for byte BEFORE the inline source leaves the state, nothing
   changed on any failure. It keeps no receipt (`repeat`): a device still on
   an older version that uploads a new picture puts a data URL back, and
   that one is moved too (the newer picture wins; the superseded record is
   released). The file id is derived from the picture's content, so two
   devices moving the same picture make one record.

   WHEN IT RUNS: only once this page load holds the account's copy, or
   knows there is none to wait for (KOS.cloudsync.settled) — never at
   start-up before the first pull. Run then, its `img: null` met a newer
   picture uploaded on an older-version device as this device's own edit
   and won the merge: the newer picture was gone from every device. The
   sync engine starts it after the first good cycle and after any cycle
   that brought a document in, and its merge lets a data URL new in the
   cloud copy take the slot (cloudsync keepNewerPictures).              */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var ORIGIN = { avatar: "profile:avatar", banner: "profile:banner" };
  var NAME = { avatar: "Profile picture", banner: "Profile banner" };
  var RETRY = 60000;
  var cache = {};   /* fileId → {url} | {pending} | {failedAt} — memory only */

  function G() { return (KOS.store && KOS.store.state && KOS.store.state.governor) || {}; }
  function isData(v) { return typeof v === "string" && /^data:/.test(v); }
  function isProfile(origin) { return typeof origin === "string" && /^profile:/.test(origin); }
  function inline(which, g) {
    g = g || G();
    var v = which === "avatar" ? g.avatar && g.avatar.img : g.bannerImg;
    return typeof v === "string" && v ? v : null;
  }
  function ref(which, g) {
    g = g || G();
    var v = which === "avatar" ? g.avatar && g.avatar.file : g.bannerFile;
    return typeof v === "string" && v ? v : null;
  }
  function has(which, g) { return !!(inline(which, g) || ref(which, g)); }
  function src(which, g) {
    var l = inline(which, g);
    if (l) return l;
    var id = ref(which, g);
    if (!id) return null;
    var c = cache[id];
    if (c && c.url) return c.url;
    loadId(id);
    return null;
  }
  function load(which) {
    var l = inline(which);
    if (l) return Promise.resolve(l);
    var id = ref(which);
    return id ? loadId(id) : Promise.resolve(null);
  }

  /* ---------------- the file store ---------------- */
  function A() { return KOS.attach && KOS.attach.available() ? KOS.attach : null; }
  function available() { return !!A(); }
  function getRec(id) {
    return new Promise(function (res) {
      if (!A()) { res(null); return; }
      A().getByFileId(id, function (e, r) { res(e ? null : r || null); });
    });
  }
  function readBlob(id) {
    return getRec(id).then(function (rec) {
      if (!rec) return null;            /* not here yet: the default, the reference kept */
      if (rec.blob) return rec.blob;
      /* the record arrived and the picture did not (or space was freed):
         fetch it from your bucket once, when signed in */
      var cs = KOS.cloudsync;
      if (!cs || !cs.downloadFile) return null;
      return new Promise(function (res) {
        cs.downloadFile(id, function (err) {
          if (err) { res(null); return; }
          getRec(id).then(function (r) { res((r && r.blob) || null); });
        });
      });
    });
  }
  function objectUrl(blob) {
    try { return window.URL.createObjectURL(blob); } catch (e) { return null; }
  }
  function loadId(id) {
    var c = cache[id];
    if (c && c.url) return Promise.resolve(c.url);
    if (c && c.pending) return c.pending;
    if (c && c.failedAt && Date.now() - c.failedAt < RETRY) return Promise.resolve(null);
    var p = readBlob(id).then(function (blob) {
      var url = blob ? objectUrl(blob) : null;
      cache[id] = url ? { url: url } : { failedAt: Date.now() };
      if (url) landed();
      return url;
    }, function () { cache[id] = { failedAt: Date.now() }; return null; });
    cache[id] = { pending: p };
    return p;
  }
  /* a picture arrived: the HUD and the page take it, softly */
  var landTimer = null;
  function landed() {
    if (landTimer) return;
    landTimer = setTimeout(function () {
      landTimer = null;
      try { window.dispatchEvent(new window.CustomEvent("kos-profile-pic")); } catch (e) { /* old engine */ }
      if (KOS.refreshHUD) KOS.refreshHUD();
      if (KOS.rerender) KOS.rerender({ background: "soft", changed: ["governor"] });
    }, 0);
  }
  /* a file arrived from the cloud: a reference that found nothing tries again */
  function onFiles() {
    ["avatar", "banner"].forEach(function (w) {
      var id = ref(w), c = id && cache[id];
      if (c && c.failedAt) { delete cache[id]; loadId(id); }
    });
  }
  try { window.addEventListener("kos-files", onFiles); } catch (e) { /* no window events */ }

  /* ---------------- bytes ---------------- */
  function decode(dataUrl) {
    var m = /^data:([^,]*?),([\s\S]*)$/.exec(String(dataUrl || ""));
    if (!m) return null;
    var meta = m[1] || "", body = m[2], bytes;
    var mime = (meta.split(";")[0] || "application/octet-stream").trim() || "application/octet-stream";
    if (/;base64$/i.test(meta)) {
      var bin;
      try { bin = window.atob(body.replace(/\s+/g, "")); } catch (e) { return null; }
      bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    } else {
      var text;
      try { text = decodeURIComponent(body); } catch (e) { text = body; }
      bytes = new window.TextEncoder().encode(text);
    }
    return { mime: mime, bytes: bytes };
  }
  function sameBytes(blob, bytes) {
    if (!blob || typeof blob.arrayBuffer !== "function") return Promise.resolve(false);
    return blob.arrayBuffer().then(function (buf) {
      var b = new Uint8Array(buf);
      if (b.length !== bytes.length) return false;
      for (var i = 0; i < b.length; i++) if (b[i] !== bytes[i]) return false;
      return true;
    }, function () { return false; });
  }
  function ext(mime) { return mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime === "image/gif" ? "gif" : mime === "image/svg+xml" ? "svg" : "jpg"; }
  /* the file id for a picture's content: two devices moving one picture
     make one record. It is the hash of the picture's BYTES, not of the data
     URL's text: one picture can be spelt as more than one data URL. */
  function contentId(which, dataUrl) {
    var d = decode(dataUrl), subtle = window.crypto && window.crypto.subtle;
    if (!d || !d.bytes.length) return Promise.reject(new Error("The " + which + " picture could not be decoded."));
    function named(hex) { return "profile-" + which + "-" + String(hex).slice(0, 32); }
    if (subtle) return Promise.resolve(subtle.digest("SHA-256", d.bytes)).then(function (buf) {
      var b = new Uint8Array(buf), hex = "";
      for (var i = 0; i < b.length; i++) hex += (b[i] < 16 ? "0" : "") + b[i].toString(16);
      return named(hex);
    });
    /* no WebCrypto (an http:// page that is not localhost): the app's own SHA-256 */
    if (KOS.codeZip && KOS.codeZip.sha256Bytes) return Promise.resolve(named(KOS.codeZip.sha256Bytes(d.bytes)));
    return Promise.reject(new Error("no hash"));
  }

  /* writeVerified(which, dataUrl, {fileId}) → Promise<{fileId, created}>
     the record is written (or an identical one found) and READ BACK with
     the same bytes, or the promise rejects and nothing new is left behind */
  function writeVerified(which, dataUrl, opts) {
    opts = opts || {};
    var d = decode(dataUrl);
    if (!d || !d.bytes.length) return Promise.reject(new Error("The " + which + " picture could not be decoded."));
    if (!A()) return Promise.reject(new Error("The file store is not available."));
    var fid = opts.fileId || null;
    return (fid ? getRec(fid) : Promise.resolve(null)).then(function (have) {
      if (have && !have.blob) {
        /* another device moved this picture and its record is here before
           its binary: this device holds the same bytes (the id is their
           hash), so they fill the record. Refusing it failed the move on
           every start, each time after a full checkpoint. */
        return new Promise(function (res, rej) {
          A().setBlob(fid, new window.Blob([d.bytes], { type: d.mime }), function (e) { e ? rej(e) : res(); });
        }).then(function () { return getRec(fid); }).then(function (back) {
          return sameBytes(back && back.blob, d.bytes);
        }).then(function (same) {
          if (!same) throw new Error("The " + which + " picture did not read back the same, so it was not moved.");
          return { fileId: fid, created: false };
        });
      }
      if (have) {
        /* a record already there with this id (an earlier, interrupted
           move, or another device's): reused only when it is the same picture */
        return sameBytes(have.blob, d.bytes).then(function (same) {
          if (!same) throw new Error("A different file already has the id " + fid + ".");
          return { fileId: fid, created: false };
        });
      }
      var blob = new window.Blob([d.bytes], { type: d.mime });
      return new Promise(function (res, rej) {
        A().add("_", "_", blob, function (err, id) {
          if (err) { rej(err); return; }
          A().get(id, function (e2, rec) {
            if (e2 || !rec) { rej(e2 || new Error("The new record could not be read.")); return; }
            res({ fileId: rec.fileId, created: true, id: rec.id });
          });
        }, { origin: ORIGIN[which], kind: "photo", fresh: true, fileId: fid || undefined,
             name: NAME[which] + "." + ext(d.mime) });
      }).then(function (made) {
        return getRec(made.fileId).then(function (back) {
          return sameBytes(back && back.blob, d.bytes).then(function (same) {
            if (same) return made;
            return removeRec(made.fileId).then(function () {
              throw new Error("The " + which + " picture did not read back the same, so it was not moved.");
            });
          });
        });
      });
    }).then(function (out) {
      /* this device shows it at once */
      return getRec(out.fileId).then(function (rec) {
        var url = rec && rec.blob ? objectUrl(rec.blob) : null;
        if (url) cache[out.fileId] = { url: url };
        return out;
      });
    });
  }
  function removeRec(fid) {
    return getRec(fid).then(function (rec) {
      if (!rec || !A()) return;
      return new Promise(function (res) { A().remove(rec.id, function () { res(); }); });
    });
  }
  /* a record nothing references any more (a replaced or removed picture) */
  function release(fid) {
    if (!fid || ref("avatar") === fid || ref("banner") === fid) return Promise.resolve(false);
    var c = cache[fid];
    if (c && c.url) { try { window.URL.revokeObjectURL(c.url); } catch (e) { /* fine */ } }
    delete cache[fid];
    return getRec(fid).then(function (rec) {
      if (!rec || !isProfile(rec.origin)) return false;   /* never a library file */
      /* something else links to it: it stays, as an ordinary file */
      var links = A() && A().linksOf ? A().linksOf(rec) : [];
      if (links.length) {
        return new Promise(function (res) { A().updateFile(fid, function (r) { r.origin = null; }, function () { res(false); }); });
      }
      return removeRec(fid).then(function () { return true; });
    });
  }
  /* profile records no state references any more, a week after they were
     made: the picture that lost when two devices uploaded at once is never
     released by either (each released only what IT replaced). The week
     covers a device whose state naming the record has not synced yet.
     → Promise<number released> */
  var GRACE = 7 * 24 * 60 * 60 * 1000;
  function sweep() {
    if (!A()) return Promise.resolve(0);
    return new Promise(function (res) {
      A().listMeta(function (e, items) { res(e ? [] : items || []); });
    }).then(function (items) {
      var now = Date.now();
      return items.filter(function (m) {
        return isProfile(m.origin) && m.fileId && m.fileId !== ref("avatar") && m.fileId !== ref("banner") &&
          m.added && now - m.added > GRACE;
      }).reduce(function (p, m) {
        return p.then(function (n) { return release(m.fileId).then(function (r) { return n + (r ? 1 : 0); }, function () { return n; }); });
      }, Promise.resolve(0));
    });
  }

  /* a NEW upload: into the file store, then the reference; the picture it
     replaces is released. On any failure the picture is kept inline in the
     state as before (the repair moves it at the next start), so an upload
     is never lost. → Promise<{fileId|null, inline}> */
  function write(which, dataUrl) {
    function setInline(g, v) {
      if (which === "avatar") g.avatar.img = v; else g.bannerImg = v;
    }
    /* at once: the new picture is shown (and kept) inline, as before, so
       every surface draws it without waiting and nothing is lost if the
       page closes mid-write */
    setInline(G(), dataUrl);
    if (KOS.store.save) KOS.store.save();
    if (!isData(dataUrl) || !available()) return Promise.resolve({ fileId: null, inline: true });
    return writeVerified(which, dataUrl).then(function (out) {
      /* the LIVE governor, read again: a cloud pull or another tab's write
         may have replaced the object while the file was being written, and
         a reference set on the old one was never saved */
      var g = G();
      /* superseded by a newer upload meanwhile: that one owns the slot */
      if (inline(which, g) !== dataUrl) return release(out.fileId).then(function () { return { fileId: null, inline: true }; });
      var old = ref(which, g);
      if (which === "avatar") g.avatar.file = out.fileId; else g.bannerFile = out.fileId;
      setInline(g, null);
      if (KOS.store.save) KOS.store.save();
      return (old && old !== out.fileId ? release(old) : Promise.resolve(false)).then(function () { return { fileId: out.fileId, inline: false }; });
    }, function () {
      /* the file store refused it: it stays inline; the repair moves it at the next start */
      return { fileId: null, inline: true };
    });
  }

  /* ---------------- the move (repair) ---------------- */
  var REPAIR = "profile-pictures-to-files";
  function due() { return ["avatar", "banner"].filter(function (w) { return isData(inline(w)); }); }
  function plan() {
    var whiches = due(), g = G();
    var items = whiches.map(function (w) { var v = inline(w, g); return { which: w, chars: v.length, replaces: ref(w, g) }; });
    return Promise.resolve({
      needed: items.length > 0,
      summary: { pictures: items.length, chars: items.reduce(function (n, x) { return n + x.chars; }, 0) },
      items: items,
      apply: function () { return move(whiches); }
    });
  }
  function move(whiches) {
    var g = G(), seen = {}, made = [];
    whiches.forEach(function (w) { seen[w] = inline(w, g); });
    function undoMade() {
      return made.reduce(function (p, fid) { return p.then(function () { return removeRec(fid); }); }, Promise.resolve());
    }
    return whiches.reduce(function (p, w) {
      return p.then(function (acc) {
        return contentId(w, seen[w]).then(function (fid) {
          return writeVerified(w, seen[w], { fileId: fid });
        }).then(function (out) {
          if (out.created) made.push(out.fileId);
          acc[w] = out.fileId;
          return acc;
        });
      });
    }, Promise.resolve({})).then(function (ids) {
      /* the state is changed only now, and only if the pictures are still
         the ones that were written */
      var gg = G();
      var moved = whiches.every(function (w) { return inline(w, gg) === seen[w]; });
      if (!moved) return undoMade().then(function () { throw new Error("The pictures changed while they were being moved; nothing was changed."); });
      var released = [];
      whiches.forEach(function (w) {
        var old = ref(w, gg);
        if (w === "avatar") { gg.avatar.file = ids[w]; gg.avatar.img = null; }
        else { gg.bannerFile = ids[w]; gg.bannerImg = null; }
        if (old && old !== ids[w]) released.push(old);
      });
      if (KOS.store.save) KOS.store.save();
      return released.reduce(function (p, fid) { return p.then(function () { return release(fid); }); }, Promise.resolve())
        .then(function () { return { moved: whiches.slice(), files: ids }; });
    }, function (e) {
      return undoMade().then(function () { throw e; });
    });
  }
  if (KOS.repairs) KOS.repairs.register(REPAIR, {
    title: "Move your profile picture and banner into the file store",
    consent: false, repeat: true, plan: plan,
    ready: function () {
      return due().length > 0 && (!KOS.cloudsync || !KOS.cloudsync.settled || KOS.cloudsync.settled());
    }
  });

  KOS.profilePics = {
    src: src, has: has, load: load, ref: ref, inline: inline,
    write: write, release: release, sweep: sweep, available: available, isProfile: isProfile,
    REPAIR: REPAIR, plan: plan,
    _decode: decode, _cache: cache, _contentId: contentId
  };
})();
