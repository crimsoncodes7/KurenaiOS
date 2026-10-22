/* Kurenai OS — core/codegit.js · KOS.codeGit
   GitHub for Code (docs/code-plan.md §10, v1: a fine-grained token).

   Your work goes to YOUR private repository, which you create: the app
   never creates or deletes one. It writes only the paths it owns —

     exercises/unit-NN/<task>/Program.cs + README.md   a task's first pass
     capstones/<id>/Program.cs + WRITEUP.md            a submitted capstone
     .kurenai/reports/<project>/<date>-<sha>.json      an imported Rider report
     README.md                                         generated progress

   — and every push is ONE commit built with the Git Data API (a tree on
   the current head, a commit, a fast-forward of the branch; never force).

   What lives where (invariants 7, 31, 35):
     state.code.github = {repo, branch, mode}   synced: the link and the mode
     media kv "github.token"                    this device only; never in
                                                 the state document, a backup
                                                 or a log
     media kv "code.github.outbox"              this device's queued files
     media kv "code.github.status"              the last push or error
   Recording is local first: a push failing never blocks progress, and
   GitHub moves no XP, gold or HP.

   v2 (roadmap 5.7, docs/github-app-plan.md): connected through YOUR
   installation of the KurenaiOS GitHub App (`via: "app"`, synced), the
   device holds no token at all. The `github-token` Edge Function mints a one-hour token for the one
   linked repository, Contents write only, kept in memory here until five
   minutes before it expires. A fine-grained token stays the fallback.

   Modes: "off" (nothing is queued), "checkpoint" (queued; pushed when you
   press Push), "auto" (pushed about half a minute after something passes).
   Every push passes a path allowlist, size caps (1 MB a file, 5 MB a push)
   and a secret scan; a hit blocks the push and says why.               */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var API = "https://api.github.com";
  var TOKEN = "github.token", OUTBOX = "code.github.outbox", STATUS = "code.github.status";
  var MODES = ["off", "checkpoint", "auto"];
  var FILE_MAX = 1024 * 1024, PUSH_MAX = 5 * 1024 * 1024;
  var ALLOW = /^(README\.md|exercises\/unit-[0-9a-z]+\/[A-Za-z0-9._-]+\/(Program\.cs|README\.md)|capstones\/[A-Za-z0-9._-]+\/(Program\.cs|WRITEUP\.md)|\.kurenai\/reports\/[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+\.json|\.kurenai\/manifest\.json)$/;
  var SECRETS = [
    [/gh[pousr]_[A-Za-z0-9]{30,}/, "a GitHub token"],
    [/github_pat_[A-Za-z0-9_]{40,}/, "a GitHub token"],
    [/sk-ant-[A-Za-z0-9_-]{20,}/, "an Anthropic key"],
    [/\bsk-[A-Za-z0-9]{32,}/, "an OpenAI key"],
    [/\bAKIA[0-9A-Z]{16}\b/, "an AWS key"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
    [/(password|pwd)\s*=\s*[^;"'\s]{4,}/i, "a password in a connection string"]
  ];

  function store() { return KOS.store; }
  function cfg() {
    var c = store().state.code;
    var g = c && c.github && typeof c.github === "object" ? c.github : {};
    return { repo: typeof g.repo === "string" ? g.repo : "", branch: typeof g.branch === "string" && g.branch ? g.branch : "main",
      mode: MODES.indexOf(g.mode) >= 0 ? g.mode : "off", publicOk: !!g.publicOk, via: g.via === "app" ? "app" : "token" };
  }
  function setCfg(patch) {
    var c = KOS.code.state();
    c.github = Object.assign(cfg(), patch || {});
    store().save();
  }
  function kv(key) { return new Promise(function (res) { KOS.mediadb.getKV(key, function (e, v) { res(e ? null : v); }); }); }
  function setKv(key, v) { return new Promise(function (res) { KOS.mediadb.setKV(key, v, function () { res(); }); }); }
  function delKv(key) { return new Promise(function (res) { KOS.mediadb.delKV(key, function () { res(); }); }); }
  var listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function changed() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }

  /* ---------------- the API ---------------- */
  function gh(token, method, path, body) {
    return fetch(API + path, {
      method: method,
      headers: { "Accept": "application/vnd.github+json", "Authorization": "Bearer " + token, "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
        return { status: r.status, ok: r.ok, json: j };
      });
    });
  }
  function why(r) {
    if (!r) return "GitHub could not be reached.";
    if (r.status === 401) return "The token was refused. It may have expired; make a new one.";
    if (r.status === 403) return "The token cannot do that. It needs Contents: read and write on this repository.";
    if (r.status === 404) return "The repository was not found, or the token cannot see it.";
    return "GitHub answered " + r.status + (r.json && r.json.message ? ": " + r.json.message : "") + ".";
  }
  function validRepo(s) { return /^[A-Za-z0-9-]{1,39}\/[A-Za-z0-9._-]{1,100}$/.test(String(s || "")); }

  /* connect: check the repository before anything is saved */
  function connect(repo, token, branch) {
    repo = String(repo || "").trim().replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
    token = String(token || "").trim();
    if (!validRepo(repo)) return Promise.resolve({ ok: false, why: "Write the repository as owner/name." });
    if (!token) return Promise.resolve({ ok: false, why: "Paste the token." });
    return gh(token, "GET", "/repos/" + repo).then(function (r) {
      if (!r.ok) return { ok: false, why: why(r) };
      var p = r.json.permissions || {};
      if (p.push === false) return { ok: false, why: "The token can read this repository but not write to it. Give it Contents: read and write." };
      return setKv(TOKEN, token).then(function () {
        setCfg({ repo: r.json.full_name || repo, branch: branch || r.json.default_branch || "main", mode: cfg().mode === "off" ? "checkpoint" : cfg().mode });
        changed();
        return { ok: true, repo: r.json.full_name || repo, private: !!r.json.private, branch: r.json.default_branch || "main" };
      });
    }, function () { return { ok: false, why: "GitHub could not be reached. Check the connection." }; });
  }
  function disconnect() {
    return delKv(TOKEN).then(function () { changed(); });
  }
  function hasToken() { return kv(TOKEN).then(function (t) { return !!t; }); }

  /* ---------------- v2: the GitHub App ---------------- */
  var appToken = null;   // {token, exp} — memory only, never kv, a backup or a log
  var edgeApi = null, nav = function (url) { window.location.assign(url); };
  function appSlug() { return (window.KOS_ENV && window.KOS_ENV.GITHUB_APP_SLUG) || ""; }
  function signedIn() { return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn()); }
  function edge(body) {
    if (edgeApi) return edgeApi(body);
    return KOS.cloud.client().functions.invoke("github-token", { body: body }).then(function (res) {
      if (!res.error) return res.data;
      var ctx = res.error.context;
      return (ctx && typeof ctx.json === "function" ? ctx.json().catch(function () { return null; }) : Promise.resolve(null)).then(function (p) {
        throw new Error((p && p.error) || "The GitHub App could not be reached.");
      });
    });
  }
  /* why the App cannot be used here, or null */
  function appBlocked() {
    if (!appSlug()) return "unconfigured";
    if (!signedIn()) return "signed-out";
    return null;
  }
  /* to GitHub's install page. With "Request user authorization (OAuth)
     during installation" GitHub returns to the Callback URL with ?code
     (and maybe installation_id) but NO state, so the nonce here only says
     this device started a connect; the ownership proof is the function's
     (the installation must be in the user's own installations). */
  function connectApp() {
    var why = appBlocked();
    if (why) return Promise.resolve({ ok: false, why: why === "signed-out" ? "Sign in to cloud sync first." : "The GitHub App isn't set up for this app yet." });
    var nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { sessionStorage.setItem("kos.gh.state", nonce); } catch (e) { /* the state check then fails safe */ }
    nav("https://github.com/apps/" + encodeURIComponent(appSlug()) + "/installations/new?state=" + nonce);
    return Promise.resolve({ ok: true, leaving: true });
  }
  /* the return trip: link the installation, once signed in */
  function completeApp(params) {
    var inst = params.get("installation_id"), code = params.get("code"), state = params.get("state");
    var want = null;
    try { want = sessionStorage.getItem("kos.gh.state"); sessionStorage.removeItem("kos.gh.state"); } catch (e) { want = null; }
    if (!code) return Promise.resolve({ ok: false, why: "GitHub did not send the sign-in back. Connect again." });
    /* a connect this device did not start, or a state that is not ours */
    if (!want || (state && state !== want)) return Promise.resolve({ ok: false, why: "That GitHub return did not come from this app. Connect again." });
    return edge({ action: "link", installation_id: inst ? Number(inst) : null, code: code }).then(function (r) {
      appToken = null;
      setCfg({ repo: r.repo, branch: r.branch || "main", via: "app", mode: cfg().mode === "off" ? "checkpoint" : cfg().mode });
      changed();
      return { ok: true, repo: r.repo, account: r.account };
    }, function (e) { return { ok: false, why: e.message }; });
  }
  function disconnectApp() {
    appToken = null;
    return (signedIn() ? edge({ action: "unlink" }).catch(function () {}) : Promise.resolve()).then(function () {
      setCfg({ via: "token", repo: "" });
      changed();
    });
  }
  /* the token a push uses: the App's when connected through it (fetched
     when missing or within five minutes of expiry), else this device's */
  function tokenFor() {
    if (cfg().via !== "app") return kv(TOKEN);
    if (appToken && appToken.exp - Date.now() > 5 * 60 * 1000) return Promise.resolve(appToken.token);
    if (!signedIn()) return Promise.resolve(null);
    return edge({ action: "token" }).then(function (r) {
      appToken = { token: r.token, exp: Date.parse(r.expires_at) || Date.now() + 3600 * 1000 };
      return appToken.token;
    }, function () { return null; });
  }

  /* ---------------- what gets queued ---------------- */
  function slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "item"; }
  function unitDir(ref) {
    var u = KOS.code.lesson(ref), x = u ? String(u.unit).toLowerCase() : "x";
    return "unit-" + (/^u\d$/.test(x) ? "0" + x.slice(1) : x.replace(/^u/, ""));
  }
  function queue(files, label) {
    if (cfg().mode === "off" || !cfg().repo) return Promise.resolve(false);
    return kv(OUTBOX).then(function (box) {
      box = Array.isArray(box) ? box : [];
      files.forEach(function (f) {
        box = box.filter(function (x) { return x.path !== f.path; });
        box.push({ path: f.path, content: String(f.content), label: label, at: Date.now() });
      });
      return setKv(OUTBOX, box.slice(-200));
    }).then(function () { changed(); schedule(); return true; });
  }
  function queueTask(t, files) {
    if (!t) return Promise.resolve(false);
    var src = (files || []).map(function (f) { return f.src; }).join("\n\n");
    var s = KOS.code.taskState(t.id), L = KOS.code.lesson(t.lesson);
    var dir = "exercises/" + unitDir(t.lesson) + "/" + slug(t.id);
    var readme = "# " + t.title + "\n\nLesson " + t.lesson + (L ? " · " + L.title : "") + " · " + (t.tier || "core") + "\n\n" +
      "- First passed: " + new Date(s.passAt || Date.now()).toISOString().slice(0, 10) + "\n" +
      "- Tries: " + s.tries + " · hints opened: " + s.hints + (s.seen ? " · answer seen first" : "") + "\n";
    return queue([{ path: dir + "/Program.cs", content: src }, { path: dir + "/README.md", content: readme }], "task " + t.id);
  }
  function queueCapstone(id) {
    var v = KOS.code.capView(id); if (!v) return Promise.resolve(false);
    var src = KOS.code.draft("cap:" + id) || v.spec.starter || "";
    var rec = KOS.code.state().capstones[id] || {};
    var wu = rec.writeup && rec.writeup.text ? rec.writeup.text : "";
    var dir = "capstones/" + slug(id + "-" + v.spec.title);
    return queue([{ path: dir + "/Program.cs", content: src }, { path: dir + "/WRITEUP.md", content: "# " + v.spec.title + "\n\n" + wu + "\n" }], "capstone " + id);
  }
  function queueReport(projectId, sha, text) {
    var d = new Date().toISOString().slice(0, 10);
    return queue([{ path: ".kurenai/reports/" + slug(projectId) + "/" + d + "-" + String(sha || "").slice(0, 8) + ".json", content: text }], "report " + projectId);
  }
  /* the generated progress page: counts only, no personal data */
  function readme() {
    var st = KOS.code.stats(), ks = KOS.code.katas ? KOS.code.katas().length : 0;
    return "# Kurenai Programming\n\nGenerated by KurenaiOS (Code). Do not edit: the app rewrites this file.\n\n" +
      "| | |\n|---|---|\n" +
      "| Lessons completed | " + st.done + " of " + st.lessons + " |\n" +
      "| Tasks passed | " + st.tasksPassed + " |\n" +
      "| Skills proven | " + st.skillsProven + " |\n" +
      "| Capstones | " + st.capstones + " of " + st.capstonesTotal + " |\n" +
      "| Katas run | " + ks + " |\n\n" +
      "Updated " + new Date().toISOString().slice(0, 10) + ".\n";
  }

  /* ---------------- the push guard ---------------- */
  function guard(files) {
    var total = 0;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      if (!ALLOW.test(f.path)) return f.path + " is not a path the app writes.";
      var n = new Blob([f.content]).size;
      if (n > FILE_MAX) return f.path + " is over 1 MB.";
      total += n;
      for (var j = 0; j < SECRETS.length; j++) if (SECRETS[j][0].test(f.content)) return f.path + " looks like it holds " + SECRETS[j][1] + ". Remove it, then push.";
    }
    if (total > PUSH_MAX) return "This push is over 5 MB.";
    return null;
  }

  /* ---------------- the push: one commit ---------------- */
  var pushing = null;
  function push(message) {
    if (pushing) return pushing;
    var c = cfg();
    pushing = Promise.all([tokenFor(), kv(OUTBOX)]).then(function (a) {
      var token = a[0], box = Array.isArray(a[1]) ? a[1] : [];
      if (!c.repo || !token) return finish({ ok: false, why: c.via === "app"
        ? (signedIn() ? "The GitHub App did not give a token. Check it is still installed." : "Sign in to cloud sync to push through the GitHub App.")
        : "GitHub is not connected on this device." });
      var files = box.map(function (x) { return { path: x.path, content: x.content }; });
      files.push({ path: "README.md", content: readme() });
      var bad = guard(files);
      if (bad) return finish({ ok: false, why: bad, blocked: true });
      var labels = box.map(function (x) { return x.label; }).filter(function (x, i, arr) { return x && arr.indexOf(x) === i; });
      var msg = message || (labels.length ? "Practice " + new Date().toISOString().slice(0, 10) + ": " + labels.slice(0, 6).join(", ") + (labels.length > 6 ? " and " + (labels.length - 6) + " more" : "") : "Update progress");
      var R = "/repos/" + c.repo;
      function attempt(n) {
        return gh(token, "GET", R + "/git/ref/heads/" + encodeURIComponent(c.branch)).then(function (ref) {
          if (ref.status === 404 || ref.status === 409) {
            /* an empty repository has no branch: the first commit goes
               through the contents API, then the batch builds on it */
            return gh(token, "PUT", R + "/contents/README.md", { message: "Start Kurenai Programming", content: b64(readme()) })
              .then(function (r) { if (!r.ok) throw r; return n < 2 ? attempt(n + 1) : Promise.reject(r); });
          }
          if (!ref.ok) throw ref;
          var head = ref.json.object.sha;
          return gh(token, "GET", R + "/git/commits/" + head).then(function (cm) {
            if (!cm.ok) throw cm;
            return gh(token, "POST", R + "/git/trees", { base_tree: cm.json.tree.sha,
              tree: files.map(function (f) { return { path: f.path, mode: "100644", type: "blob", content: f.content }; }) });
          }).then(function (tr) {
            if (!tr.ok) throw tr;
            return gh(token, "POST", R + "/git/commits", { message: msg, tree: tr.json.sha, parents: [head] });
          }).then(function (nc) {
            if (!nc.ok) throw nc;
            return gh(token, "PATCH", R + "/git/refs/heads/" + encodeURIComponent(c.branch), { sha: nc.json.sha, force: false }).then(function (up) {
              /* the head moved (a push from Rider): rebuild on the new head */
              if (up.status === 422 && n < 2) return attempt(n + 1);
              if (!up.ok) throw up;
              return nc.json.sha;
            });
          });
        });
      }
      return attempt(0).then(function (sha) {
        /* drop what was pushed; anything queued meanwhile stays */
        return kv(OUTBOX).then(function (now) {
          now = Array.isArray(now) ? now : [];
          var sent = {}; box.forEach(function (x) { sent[x.path + "@" + x.at] = 1; });
          return setKv(OUTBOX, now.filter(function (x) { return !sent[x.path + "@" + x.at]; }));
        }).then(function () { return finish({ ok: true, sha: sha, files: files.length, message: msg }); });
      }, function (r) { return finish({ ok: false, why: r && r.status ? why(r) : "GitHub could not be reached. It will try again." }); });
    });
    return pushing;
    function finish(res) {
      pushing = null;
      res.at = Date.now();
      return setKv(STATUS, res).then(function () { changed(); return res; });
    }
  }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }

  /* automatic mode: one push about half a minute after the last queued
     item, and on start-up when this device has something waiting */
  var timer = null;
  function schedule() {
    if (cfg().mode !== "auto") return;
    clearTimeout(timer);
    timer = setTimeout(function () { if (typeof navigator === "undefined" || navigator.onLine !== false) push(); }, 30000);
  }
  function status() {
    return Promise.all([kv(STATUS), kv(OUTBOX), kv(TOKEN)]).then(function (a) {
      var box = Array.isArray(a[1]) ? a[1] : [];
      var c = cfg();
      return { last: a[0] || null, waiting: box.length, connected: !!(c.repo && (c.via === "app" || a[2])), cfg: c, app: appBlocked() };
    });
  }
  function boot() {
    /* back from GitHub's install page: take the query off the address at
       once, then link when the cloud session is ready (it restores async) */
    if (typeof location !== "undefined" && /[?&]code=/.test(location.search)) {
      var params = new URLSearchParams(location.search);
      try { history.replaceState(null, "", location.pathname + (location.hash || "")); } catch (e) { /* file:// */ }
      var tries = 0;
      (function wait() {
        if (!signedIn() && tries++ < 20) { setTimeout(wait, 1000); return; }
        completeApp(params).then(function (r) {
          KOS.ui.toast(r.ok ? "GitHub connected: " + r.repo + "." : r.why, !r.ok);
          if (r.ok && KOS.show) KOS.show("code", { page: "settings" });
        });
      })();
    }
    if (!KOS.mediadb || cfg().mode !== "auto") return;
    kv(OUTBOX).then(function (box) { if (Array.isArray(box) && box.length) schedule(); });
  }

  KOS.codeGit = {
    MODES: MODES, cfg: cfg, setMode: function (m) { if (MODES.indexOf(m) >= 0) { setCfg({ mode: m }); changed(); } },
    setPublicOk: function (v) { setCfg({ publicOk: !!v }); },
    connect: connect, disconnect: disconnect, hasToken: hasToken, status: status, onChange: onChange,
    connectApp: connectApp, completeApp: completeApp, disconnectApp: disconnectApp, appBlocked: appBlocked, tokenFor: tokenFor,
    queueTask: queueTask, queueCapstone: queueCapstone, queueReport: queueReport, push: push, guard: guard, readme: readme, boot: boot,
    _schedule: schedule,
    /* test seam: the github-token function (body → Promise of data) */
    _setEdge: function (fn) { edgeApi = fn || null; appToken = null; },
    _setNav: function (fn) { nav = fn || function (url) { window.location.assign(url); }; }
  };
})();
