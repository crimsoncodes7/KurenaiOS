/* Kurenai OS — modules/assistantpage.js
   The Assistant's own page (frames 13a, 13c–13f): conversations, projects,
   the workspace settings and the activity log, loaded on first use
   (page-assistant, 1F) with the tools it shows ("ai"). The drawer, the
   controller, KOS.assistant.ask and the character stay at boot in
   js/modules/assistant.js. */
(function () {
  "use strict";
  var el = KOS.ui.el, K = KOS.assistant._k;
  var EMBLEM = K.EMBLEM, titleWords = K.titleWords, toolDisplayName = K.toolDisplayName, tierLabel = K.tierLabel, providerName = K.providerName, workspaceCfg = K.workspaceCfg, saveWorkspace = K.saveWorkspace, conversationKey = K.conversationKey, projectFor = K.projectFor, assignProject = K.assignProject, togglePin = K.togglePin, S = K.S, notify = K.notify, stopAudio = K.stopAudio, playStateCue = K.playStateCue, mascotNode = K.mascotNode, canPersist = K.canPersist, newConversation = K.newConversation, openConversation = K.openConversation, clampText = K.clampText, assistantRichText = K.assistantRichText, buildThreadArea = K.buildThreadArea, ask = K.ask, loadAudit = K.loadAudit;

  /* ================= the dedicated page (frames 13a, 13c–13f) =========
     A second sidebar beside the page: New chat and search, the six pages
     in two groups with kanji tiles that follow the main rail, projects,
     recent chats with times, and the routing pinned at the foot. The page
     takes the whole stage (KOS.shell.bleed). */
  var PAGE_TABS = [
    ["Chat", "assistant", { tab: "chat" }, "chat"],
    ["History", "assistant", { tab: "history" }, "history"],
    ["Settings", "assistant", { tab: "settings" }, "settings"],
    ["Memory", "assistant", { tab: "memory" }, "memory"],
    ["Scheduled", "assistant", { tab: "scheduled" }, "scheduled"],
    ["Permissions", "assistant", { tab: "permissions" }, "permissions"],
    ["Activity", "assistant", { tab: "activity" }, "activity"]
  ];
  var TAB_KANJI = { chat: "話", history: "歴", settings: "設", memory: "憶", scheduled: "時", permissions: "許", activity: "録" };
  /* the tool areas of js/core/aitools.js, marked like the main rail */
  var AREA_KANJI = { app: "灯", archive: "蔵", collection: "蒐", governor: "守", memory: "憶",
    planner: "整", search: "索", study: "学", sync: "同" };

  function relTime(ts) {
    if (!ts) return "";
    var t = typeof ts === "number" ? ts : Date.parse(ts);
    if (!t) return "";
    var diff = Date.now() - t;
    if (diff < 90e3) return "now";
    if (diff < 36e5) return Math.round(diff / 6e4) + "m";
    if (diff < 864e5) return Math.round(diff / 36e5) + "h";
    if (diff < 864e5 * 6) return new Date(t).toLocaleDateString("en-GB", { weekday: "short" });
    return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  /* the routing as configured, read without creating it (KOS.ai.routing) */
  function routingNow() {
    return (KOS.ai && KOS.ai.routing) ? KOS.ai.routing() : {};
  }

  function createProject(name) {
    name = clampText(String(name || "").trim(), 48);
    if (!name) return null;
    var ws = workspaceCfg(true);
    var project = { id: "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 5), name: name, createdAt: Date.now() };
    ws.projects.push(project);
    ws.projectFilter = project.id;
    assignProject(project.id);
    saveWorkspace();
    return project;
  }

  function removeProject(project) {
    KOS.ui.confirm({ title: "Delete this project?", danger: true, confirm: "Delete project",
      body: "“" + project.name + "” is removed. Its conversations stay in History." }, function () {
      var ws = workspaceCfg(true);
      ws.projects = ws.projects.filter(function (p) { return p.id !== project.id; });
      Object.keys(ws.conversationProjects).forEach(function (key) {
        if (ws.conversationProjects[key] === project.id) delete ws.conversationProjects[key];
      });
      if (ws.projectFilter === project.id) ws.projectFilter = "";
      saveWorkspace();
      var view = (KOS.store.state.ui || {}).view;
      if (view === "assistant") KOS.show("assistant", { tab: "chat" });
    });
  }

  function projectPicker() {
    var ws = workspaceCfg();
    var selected = projectFor();
    var select = el("select", { class: "k-asst-chip-select", "data-ui": "asst.project-picker", "aria-label": "Conversation project", title: "Organise this conversation in a project" }, [
      el("option", { value: "", text: "Project · none" })
    ].concat(ws.projects.map(function (p) {
      var option = el("option", { value: p.id, text: p.name });
      if (p.id === selected) option.selected = true;
      return option;
    })));
    select.addEventListener("change", function () { assignProject(select.value); notify(); });
    return select;
  }

  function assistantTabs(active) {
    var ws = workspaceCfg();
    var nav = el("aside", { class: "k-asst-nav", "data-ui": "asst.nav", "aria-label": "Assistant navigation and conversations" });
    if (ws.sidebarCollapsed) KOS.ui.state(nav, "is-collapsed", true);
    var collapse = el("button", { class: "k-iconbtn k-asst-collapse", "data-ui": "asst.nav-collapse", type: "button",
      text: ws.sidebarCollapsed ? "›" : "‹", "aria-label": ws.sidebarCollapsed ? "Expand assistant sidebar" : "Collapse assistant sidebar",
      title: ws.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar", onclick: function () {
        var w = workspaceCfg(true);
        w.sidebarCollapsed = !w.sidebarCollapsed; saveWorkspace();
        KOS.show("assistant", { tab: active });
      } });
    nav.appendChild(el("div", { class: "k-asst-brand" }, [
      el("img", { class: "k-asst-emblem", src: EMBLEM, alt: "" }),
      el("div", { class: "k-asst-brand-txt" }, [
        el("div", { class: "k-asst-bloom-k", text: "Whispering Bloom" }),
        el("h1", { id: "asst-page-title", class: "k-asst-brand-name", tabindex: "-1", text: "Kurenai Assistant" })
      ])
    ]));

    /* New chat, and a filter over the conversations listed below */
    var filter = el("input", { class: "k-input k-asst-filter", type: "search", placeholder: "Filter chats…",
      "aria-label": "Filter conversations", hidden: "" });
    var searchBtn = el("button", { class: "k-iconbtn k-asst-search", type: "button", text: "⌕", "aria-label": "Filter conversations",
      "aria-pressed": "false", title: "Filter conversations", onclick: function () {
        var on = filter.hidden;
        filter.hidden = !on;
        searchBtn.setAttribute("aria-pressed", String(on));
        if (on) filter.focus(); else { filter.value = ""; applyFilter(); }
      } });
    nav.appendChild(el("div", { class: "k-asst-nav-acts" }, [
      el("button", { class: "k-asst-new", type: "button", "aria-label": "New conversation", title: "New conversation",
        onclick: function () { newConversation(); KOS.show("assistant", { tab: "chat" }); } }, [
        el("span", { "aria-hidden": "true", text: "＋" }), el("span", { class: "k-asst-new-l", text: " New chat" })
      ]),
      searchBtn,
      collapse
    ]));
    nav.appendChild(filter);

    var tablist = el("div", { class: "k-asst-tabs", role: "tablist", "aria-orientation": "vertical", "aria-label": "Kurenai Assistant pages" });
    [["Conversation", PAGE_TABS.slice(0, 2)], ["Control", PAGE_TABS.slice(2)]].forEach(function (group) {
      tablist.appendChild(el("div", { class: "k-asst-nav-label", role: "presentation", text: group[0] }));
      group[1].forEach(function (tab) {
        var selected = tab[3] === active;
        var btn = el("button", { class: "k-asst-tab", "data-ui": "ui.tab", type: "button", "data-tab": tab[3],
          role: "tab", "aria-selected": selected ? "true" : "false", "aria-controls": "asst-page-panel",
          tabindex: selected ? "0" : "-1", "aria-label": tab[0], title: tab[0],
          onclick: function () { KOS.show(tab[1], tab[2]); } }, [
          el("span", { class: "k-asst-tab-tile", lang: "ja", "aria-hidden": "true", text: TAB_KANJI[tab[3]] || "·" }),
          el("span", { class: "k-asst-tab-l", text: tab[0] }),
          tab[3] === "activity" && S.pending ? el("span", { class: "k-asst-tab-dot", title: "An action is waiting for your approval" }) : null
        ].filter(Boolean));
        if (selected) KOS.ui.state(btn, "active", true);
        tablist.appendChild(btn);
      });
    });
    nav.appendChild(tablist);

    /* projects */
    var projectList = el("div", { class: "k-asst-list" });
    var addProject = el("button", { class: "k-asst-add", "data-ui": "asst.nav-add", type: "button", text: "＋", "aria-label": "Create project", title: "Create project" });
    addProject.addEventListener("click", function () {
      if (projectList.querySelector("[data-ui~='asst.project-new']")) return;
      var input = el("input", { class: "k-input k-asst-filter", "data-ui": "asst.project-new", type: "text", maxlength: "48", placeholder: "Project name", "aria-label": "Project name" });
      function commit() {
        if (!createProject(input.value)) return;
        KOS.show("assistant", { tab: active });
      }
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") commit(); else if (e.key === "Escape") input.remove(); });
      input.addEventListener("blur", function () { if (!input.value.trim()) input.remove(); });
      projectList.insertBefore(input, projectList.firstChild); input.focus();
    });
    nav.appendChild(el("div", { class: "k-asst-nav-sec" }, [
      el("div", { class: "k-asst-nav-label" }, [el("span", { text: "Projects" }), addProject]), projectList
    ]));
    var projectCounts = {};
    Object.keys(ws.conversationProjects).forEach(function (key) {
      var id = ws.conversationProjects[key]; projectCounts[id] = (projectCounts[id] || 0) + 1;
    });
    ws.projects.forEach(function (project, pi) {
      var current = ws.projectFilter === project.id;
      projectList.appendChild(el("div", { class: "k-asst-proj", "data-state": current ? "active" : null }, [
        el("button", { class: "k-asst-proj-open", "data-ui": "asst.project-open", type: "button", "aria-pressed": current ? "true" : "false",
          title: current ? "Show every chat" : "Show this project's chats", onclick: function () {
            var w = workspaceCfg(true);
            w.projectFilter = current ? "" : project.id; saveWorkspace(); KOS.show("assistant", { tab: active });
          } }, [el("span", { class: "k-asst-proj-dot", "data-hue": String(pi % 7), "aria-hidden": "true" }),
          el("span", { class: "k-asst-proj-name", text: project.name }),
          projectCounts[project.id] ? el("small", { class: "k-asst-count", text: String(projectCounts[project.id]) }) : null].filter(Boolean)),
        el("button", { class: "k-asst-x", type: "button", text: "×", "aria-label": "Delete project " + project.name,
          onclick: function () { removeProject(project); } })
      ]));
    });
    if (!ws.projects.length) projectList.appendChild(el("p", { class: "k-asst-nav-empty", text: "Group chats by subject or goal." }));

    /* recent chats */
    var recents = el("div", { class: "k-asst-list" }, [el("p", { class: "k-asst-nav-empty", text: canPersist() ? "Loading…" : "Sign in to keep recent chats." })]);
    nav.appendChild(el("div", { class: "k-asst-nav-sec k-asst-recents" }, [
      el("div", { class: "k-asst-nav-label" }, [el("span", { text: ws.projectFilter ? "Project chats" : "Recent" })]), recents
    ]));
    function recentRow(o) {
      return el("div", { class: "k-asst-recent", "data-state": o.current ? "current" : null, "data-title": o.title.toLowerCase() }, [
        el("button", { class: "k-asst-recent-open", type: "button", title: o.title, onclick: o.open }, [
          o.pinned ? el("span", { class: "k-asst-recent-pin", "aria-hidden": "true", text: "◆" }) : null,
          el("span", { class: "k-asst-recent-t", text: o.title }),
          o.meta ? el("span", { class: "k-asst-recent-m", text: o.meta }) : null
        ].filter(Boolean)),
        el("button", { class: "k-asst-x", type: "button", text: o.pinned ? "◆" : "◇",
          "aria-label": o.pinLabel, "aria-pressed": o.pinned ? "true" : "false", title: o.pinned ? "Unpin" : "Pin",
          onclick: o.pin })
      ]);
    }
    function applyFilter() {
      var q = filter.value.trim().toLowerCase();
      recents.querySelectorAll("[data-title]").forEach(function (r) { r.hidden = !!q && r.getAttribute("data-title").indexOf(q) === -1; });
    }
    filter.addEventListener("input", applyFilter);
    if (canPersist()) KOS.ai.convo.list(function (err, rows) {
      if (!recents.isConnected) return;
      recents.innerHTML = "";
      if (err) { recents.appendChild(el("p", { class: "k-asst-nav-empty", text: "History unavailable." })); return; }
      if (ws.projectFilter) rows = rows.filter(function (c) { return projectFor(c.id) === ws.projectFilter; });
      rows.sort(function (a, b) {
        var ap = ws.pins.indexOf(a.id) >= 0, bp = ws.pins.indexOf(b.id) >= 0;
        return ap === bp ? 0 : ap ? -1 : 1;
      });
      rows.slice(0, 8).forEach(function (c) {
        var pinned = ws.pins.indexOf(c.id) >= 0;
        recents.appendChild(recentRow({ title: c.title, current: c.id === S.conversationId, pinned: pinned,
          meta: relTime(c.updatedAt),
          open: function () { openConversation(c.id, function (e) { if (!e) KOS.show("assistant", { tab: "chat" }); }); },
          pinLabel: (pinned ? "Unpin " : "Pin ") + c.title,
          pin: function () { togglePin(c.id); KOS.show("assistant", { tab: active }); } }));
      });
      if (!rows.length) recents.appendChild(el("p", { class: "k-asst-nav-empty", text: ws.projectFilter ? "No chats in this project yet." : "No conversations yet." }));
      applyFilter();
    });
    else {
      recents.innerHTML = "";
      var localPinned = ws.pins.indexOf(S.localId) >= 0;
      recents.appendChild(recentRow({ title: S.conversationTitle || "Current conversation", current: true, pinned: localPinned,
        meta: projectFor(S.localId) ? "this device" : "",
        open: function () { KOS.show("assistant", { tab: "chat" }); },
        pinLabel: localPinned ? "Unpin current conversation" : "Pin current conversation",
        pin: function () { togglePin(S.localId); KOS.show("assistant", { tab: active }); } }));
      recents.appendChild(el("p", { class: "k-asst-nav-empty", text: "Sign in to keep more chats across sessions." }));
    }

    /* the routing, pinned at the foot: which model answers what */
    var routing = routingNow(), seen = {}, foot = el("div", { class: "k-asst-models", "aria-label": "Model routing" });
    Object.keys(routing).forEach(function (cat) {
      var r = routing[cat];
      if (!r || seen[r.provider]) return;
      seen[r.provider] = true;
      foot.appendChild(el("div", { class: "k-asst-model", "data-provider": r.provider }, [
        el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }),
        el("span", { text: providerName(r.provider) + (r.provider === "ollama" ? " · local" : "") }),
        el("span", { class: "k-asst-model-id", text: r.model ? clampText(r.model, 18) : "no model set" })
      ]));
    });
    if (foot.children.length) nav.appendChild(foot);

    nav.addEventListener("keydown", function (e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].indexOf(e.key) < 0) return;
      var tabs = Array.prototype.slice.call(nav.querySelectorAll("[data-ui~='ui.tab']"));
      var current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      e.preventDefault();
      var next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1
        : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? (current - 1 + tabs.length) % tabs.length
        : (current + 1) % tabs.length;
      tabs[next].focus();
    });
    return nav;
  }

  /* one intro for the control pages: kicker, heading, one line */
  function sectionIntro(body, kicker, title, copy) {
    body.appendChild(el("header", { class: "k-asst-head" }, [
      el("div", { class: "k-kicker", text: kicker }),
      el("h2", { class: "k-asst-head-h", text: title }),
      copy ? el("p", { class: "k-asst-head-p", text: copy }) : null
    ].filter(Boolean)));
  }
  function card(title, meta, kids, extra) {
    return el("section", { class: "k-card k-asst-block", "aria-label": title }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: title }),
        meta ? el("span", { class: "k-card-meta", text: meta }) : null,
        extra ? el("span", { class: "k-asst-block-end" }, [extra]) : null
      ].filter(Boolean))
    ].concat(kids));
  }

  function pageChat(body) {
    var ws = workspaceCfg();
    var currentPinned = ws.pins.indexOf(conversationKey()) >= 0;
    var route = routingNow().complex;
    var conversation = el("div", { class: "k-asst-chatcol", "data-ui": "asst.chat-main" }, [
      el("div", { class: "k-asst-toolbar" }, [
        el("h2", { class: "k-asst-title", text: S.conversationTitle || "A fresh thread" }),
        projectPicker(),
        el("span", { class: "k-asst-toolbar-end" }, [
          el("button", { class: "k-asst-chip-btn k-asst-pin", type: "button", text: currentPinned ? "◆ Pinned" : "◇ Pin",
            "aria-label": currentPinned ? "Unpin current conversation" : "Pin current conversation", title: currentPinned ? "Unpin conversation" : "Pin conversation",
            "aria-pressed": currentPinned ? "true" : "false",
            onclick: function () { togglePin(); KOS.show("assistant", { tab: "chat" }); } }),
          route ? el("span", { class: "k-chip", "data-tone": "muted", title: "Each kind of request is routed to its own model (Settings)",
            text: providerName(route.provider) + " · auto" }) : null,
          el("button", { class: "k-iconbtn k-iconbtn--sm", type: "button", text: "＋", "aria-label": "New conversation", title: "New conversation", onclick: function () {
            newConversation(); KOS.show("assistant", { tab: "chat" });
          } })
        ].filter(Boolean))
      ]),
      buildThreadArea(false)
    ]);
    /* Hide (34d, per device): the thread takes the full width */
    var hidden = !!(KOS.store.state.ui && KOS.store.state.ui.kurenaiHidden);
    function setHidden(v) { var st = KOS.store.state; st.ui = st.ui || {}; st.ui.kurenaiHidden = v; KOS.store.save(); KOS.show("assistant", { tab: "chat" }); }
    if (hidden) {
      conversation.querySelector(".k-asst-toolbar-end").appendChild(el("button", { class: "k-asst-chip-btn", "data-ui": "asst.show-kurenai", type: "button",
        text: "◐ Show Kurenai", onclick: function () { setHidden(false); } }));
      KOS.ui.state(body, "kurenai-hidden", true);
      body.appendChild(conversation);
      return;
    }
    var presence = el("aside", { class: "k-asst-presence", "data-ui": "asst.presence", "aria-label": "Kurenai status" }, [
      el("div", { class: "k-asst-presence-head" }, [
        el("span", { class: "k-asst-live-dot", "aria-hidden": "true" }),
        el("b", { text: "Kurenai is with you" }),
        el("button", { class: "k-asst-chip-btn", "data-ui": "asst.hide-kurenai", type: "button", text: "Hide",
          "aria-label": "Hide Kurenai", onclick: function () { setHidden(true); } }),
        el("button", { class: "k-asst-chip-btn", type: "button", text: ws.characterAudio.enabled ? "♪ Voice on" : "Voice off",
          "aria-pressed": ws.characterAudio.enabled ? "true" : "false", onclick: function () {
            var w = workspaceCfg(true);
            w.characterAudio.enabled = !w.characterAudio.enabled; saveWorkspace();
            if (w.characterAudio.enabled) playStateCue("idle", true); else stopAudio();
            KOS.show("assistant", { tab: "chat" });
          } })
      ]),
      el("div", { class: "k-asst-stage" }, [mascotNode("large")]),
      el("div", { class: "k-asst-note" }, [el("p", { text: "Hover, or tap her flower, tablet or portrait." }),
        el("p", { class: "k-asst-muted", text: canPersist() ? "Cloud history is on for this session." : "Signed out · this conversation stays on this device." })])
    ]);
    body.appendChild(conversation);
    body.appendChild(presence);
  }

  function pageHistory(body) {
    sectionIntro(body, "Conversation", "History", "Return to an earlier thread; the drawer and this page share it.");
    if (!canPersist()) {
      body.appendChild(KOS.ui.emptyState({ mark: "歴", title: "History is kept after cloud sign-in",
        body: "The current conversation still works on this device; it is simply not added to the cloud archive.",
        action: el("button", { class: "k-btn", type: "button", text: "Open Account & Cloud Sync", onclick: function () { KOS.show("mediasync"); } }) }));
      return;
    }
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.history" });
    body.appendChild(list);
    function render() {
      list.innerHTML = "";
      list.appendChild(el("p", { class: "k-asst-muted", text: "Loading…" }));
      KOS.ai.convo.list(function (err, rows) {
        list.innerHTML = "";
        if (err) { list.appendChild(el("p", { class: "k-asst-error-line", text: "Couldn't load history: " + err.message })); return; }
        if (!rows.length) { list.appendChild(el("p", { class: "k-asst-muted", text: "No conversations yet — start one in Chat." })); return; }
        rows.forEach(function (c) {
          var titleSpan = el("b", { class: "k-asst-line-t", text: c.title });
          list.appendChild(el("div", { class: "k-asst-line", "data-ui": "asst.history-row", "data-state": c.id === S.conversationId ? "current" : null }, [
            el("span", { class: "k-asst-line-mark", lang: "ja", "aria-hidden": "true", text: "話" }),
            el("div", { class: "k-asst-line-txt" }, [
              titleSpan,
              el("span", { class: "k-asst-line-m", text: c.updatedAt ? new Date(c.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "" })
            ]),
            el("button", { class: "k-link", type: "button", text: "Open", onclick: function () {
              openConversation(c.id, function (err2) { if (!err2) KOS.show("assistant", { tab: "chat" }); });
            } }),
            el("button", { class: "k-link", type: "button", text: "Rename", "aria-label": "Rename conversation", onclick: function () {
              var input = el("input", { type: "text", class: "k-input", value: c.title, "aria-label": "New title" });
              var row = el("div", { class: "k-asst-inline-edit", "data-ui": "asst.history-rename" }, [input,
                el("button", { class: "k-btn k-btn--sm", type: "button", text: "Save", onclick: function () {
                  KOS.ai.convo.rename(c.id, input.value, function (err2) {
                    if (err2) { KOS.ui.toast(err2.message, true); return; }
                    if (c.id === S.conversationId) S.conversationTitle = input.value;
                    render();
                  });
                } })]);
              titleSpan.replaceWith(row);
              input.focus();
            } }),
            el("button", { class: "k-link k-asst-danger", type: "button", text: "Delete", "aria-label": "Delete conversation", onclick: function () {
              KOS.ui.confirm({ title: "Delete this conversation?", danger: true, confirm: "Delete",
                body: "“" + c.title + "” and its messages are removed from history. Actions it ran are NOT undone (see Activity)." },
                function () {
                  KOS.ai.convo.remove(c.id, function (err2) {
                    if (err2) { KOS.ui.toast(err2.message, true); return; }
                    var ws = workspaceCfg(true);
                    delete ws.conversationProjects[c.id];
                    ws.pins = ws.pins.filter(function (id) { return id !== c.id; });
                    saveWorkspace();
                    if (c.id === S.conversationId) newConversation();
                    render();
                  });
                });
            } })
          ]));
        });
      });
    }
    render();
  }

  function pageSettings(body) {
    var CATS = [
      ["tutor", "Explanations & tutoring"],
      ["crud", "Simple data requests"],
      ["generation", "Flashcard / quiz generation"],
      ["complex", "Multi-step requests"]
    ];
    /* the legend under the table says which is local and which is billed */
    var PROVIDERS = [["ollama", "Ollama"], ["gemini", "Gemini"], ["deepseek", "DeepSeek"]];
    var cfg = KOS.ai.config();
    sectionIntro(body, "Control room", "Settings", "Which model answers each kind of request. Safety tiers and approvals do not change with the provider.");

    /* model control: routing by task type */
    var health = el("div", { class: "k-asst-health", role: "status" });
    /* one button, two states: a second press clears the readout (review A) */
    var checkBtn = el("button", { class: "k-btn k-btn--sm", type: "button", text: "Check availability & usage", "aria-expanded": "false", onclick: function () {
      if (checkBtn.getAttribute("aria-expanded") === "true") {
        health.innerHTML = "";
        checkBtn.setAttribute("aria-expanded", "false");
        checkBtn.textContent = "Check availability & usage";
        return;
      }
      checkBtn.setAttribute("aria-expanded", "true");
      checkBtn.textContent = "Hide availability";
      health.innerHTML = "";
      health.appendChild(el("p", { class: "k-asst-muted", text: "Checking…" }));
      var out = [];
      var todo = 3;
      ["ollama", "gemini", "deepseek"].forEach(function (p) {
        KOS.ai.health(p, function (e, h) {
          out.push(h || { provider: p, available: false, reason: "no answer" });
          if (--todo === 0) {
            health.innerHTML = "";
            out.forEach(function (h2) {
              /* the models the key can call: how many, and any routed
                 model the provider no longer offers (the 3.5 Flash lesson) */
              var routed = CATS.map(function (c) { return cfg.routing[c[0]]; })
                .filter(function (r) { return r && r.provider === h2.provider && r.model; })
                .map(function (r) { return r.model; });
              var missing = h2.models ? routed.filter(function (m, i) { return routed.indexOf(m) === i && h2.models.indexOf(m) === -1; }) : [];
              health.appendChild(el("p", { class: "k-asst-health-line", "data-ok": h2.available && !missing.length ? "" : null }, [
                el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }),
                el("b", { text: providerName(h2.provider) + " " }),
                h2.available
                  ? "available" + (h2.used != null ? " · " + h2.used + "/" + (h2.cap || "?") + " requests today" : "") +
                    (h2.models ? " · " + h2.models.length + " models" : "") +
                    (missing.length ? " · not offered any more: " + missing.join(", ") : "")
                  : "unavailable · " + (h2.reason || "unknown")
              ]));
              /* the model fields suggest what the provider really offers */
              if (h2.models) {
                var dl = document.getElementById("asst-models-" + h2.provider) || el("datalist", { id: "asst-models-" + h2.provider });
                dl.innerHTML = "";
                h2.models.forEach(function (m) { dl.appendChild(el("option", { value: m })); });
                if (!dl.parentNode) health.appendChild(dl);
              }
            });
          }
        });
      });
    } });
    var grid = el("div", { class: "k-asst-routes", role: "table", "aria-label": "Routing by task type" }, [
      el("div", { class: "k-asst-routes-head", role: "row" }, ["Task", "Primary provider", "Model", "Fallback"].map(function (h) {
        return el("span", { role: "columnheader", text: h });
      }))
    ]);
    CATS.forEach(function (cat) {
      var route = cfg.routing[cat[0]];
      var provSel = el("select", { class: "k-input", "aria-label": cat[1] + " provider" }, PROVIDERS.map(function (p) {
        var o = el("option", { value: p[0], text: p[1] });
        if (route.provider === p[0]) o.selected = true;
        return o;
      }));
      var modelIn = el("input", { type: "text", class: "k-input", value: route.model || "",
        placeholder: "model id (e.g. " + KOS.ai.DEFAULT_MODEL.gemini + ")", "aria-label": cat[1] + " model id",
        list: "asst-models-" + route.provider });
      function save() {
        if (!KOS.ai.setRouting(cat[0], provSel.value, modelIn.value)) KOS.ui.toast("That routing isn't valid.", true);
      }
      provSel.addEventListener("change", save);
      /* persist on every keystroke (input), not just blur (change): a typed
         model that never blurs — because the user switches tab or submits —
         would otherwise be discarded when KOS.show destroys this input,
         leaving the model empty at request time. `change` is kept as a
         belt-and-braces final save. */
      modelIn.addEventListener("input", save);
      modelIn.addEventListener("change", save);
      var fb = cfg.fallback[cat[0]];
      var fbSel = el("select", { class: "k-input", "aria-label": cat[1] + " fallback" }, [
        el("option", { value: "", text: "No fallback" })
      ].concat(PROVIDERS.map(function (p) {
        var o = el("option", { value: p[0], text: "Fall back to " + providerName(p[0]) });
        if (fb && fb.provider === p[0]) o.selected = true;
        return o;
      })));
      fbSel.addEventListener("change", function () {
        var v = fbSel.value;
        if (!v) { KOS.ai.setFallback(cat[0], null); return; }
        var model = KOS.ai.DEFAULT_MODEL[v] || (cfg.routing.crud.model || "");
        KOS.ai.setFallback(cat[0], { provider: v, model: model });
        KOS.ui.toast("Fallback enabled for " + cat[1] + " — switches are always labelled, never silent.");
      });
      grid.appendChild(el("div", { class: "k-asst-route", "data-ui": "asst.route-row", role: "row" }, [
        el("span", { class: "k-asst-route-k", role: "rowheader" }, [el("b", { text: cat[1] }), el("span", { class: "k-asst-id", text: cat[0] + " requests" })]),
        el("span", { role: "cell" }, [provSel]),
        el("span", { role: "cell" }, [modelIn]),
        el("span", { role: "cell" }, [fbSel])
      ]));
    });
    body.appendChild(card("Model control", "routing by task type", [
      grid,
      el("div", { class: "k-asst-legend" }, [
        el("span", { "data-provider": "ollama" }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), el("b", { text: "Ollama" }), " local, free"]),
        el("span", { "data-provider": "gemini" }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), el("b", { text: "Gemini" }), " online, billable"]),
        el("span", { "data-provider": "deepseek" }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), el("b", { text: "DeepSeek" }), " online, billable"])
      ]),
      el("p", { class: "k-asst-muted", text: "Online providers use your cloud account and daily cap. API keys live only on the server and are never shown here." }),
      health
    ], checkBtn));

    /* the local connection and the voice, side by side */
    var ollamaIn = el("input", { type: "text", class: "k-input k-asst-mono", value: cfg.ollama.url, "aria-label": "Ollama endpoint" });
    /* same reasoning as the model input — persist on input so a typed
       endpoint survives tab navigation */
    ollamaIn.addEventListener("input", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    ollamaIn.addEventListener("change", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    var local = card("Local connection", null, [
      el("label", { class: "k-field", "data-ui": "asst.route-row" }, [el("span", { class: "k-field-label", text: "Ollama endpoint URL" }), ollamaIn]),
      el("p", { class: "k-asst-muted", text: "Start Ollama with OLLAMA_ORIGINS allowing this app's origin." })
    ]);

    var ws = workspaceCfg();
    var voiceToggle = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Play short state and interaction lines" });
    voiceToggle.checked = ws.characterAudio.enabled;
    var volume = el("input", { type: "range", class: "k-asst-range", min: "0", max: "100", step: "1", value: String(Math.round(ws.characterAudio.volume * 100)),
      "aria-label": "Kurenai voice volume" });
    voiceToggle.addEventListener("change", function () {
      var w = workspaceCfg(true);
      w.characterAudio.enabled = voiceToggle.checked; saveWorkspace();
      if (w.characterAudio.enabled) playStateCue("idle", true); else stopAudio();
    });
    volume.addEventListener("input", function () {
      var w = workspaceCfg(true);
      w.characterAudio.volume = Math.max(0, Math.min(1, Number(volume.value) / 100));
      if (K.audio()) K.audio().volume = w.characterAudio.volume;
      saveWorkspace();
    });
    var voice = card("Kurenai voice", null, [
      el("label", { class: "k-asst-switch-row", "data-ui": "asst.voice-row" }, [voiceToggle, el("span", { text: "Play short state and interaction lines" })]),
      el("div", { class: "k-asst-volume" }, [
        el("span", { class: "k-asst-muted", text: "Volume" }), volume,
        el("button", { class: "k-btn k-btn--sm", type: "button", text: "▶ Preview", onclick: function () { playStateCue("working", true); } })
      ]),
      /* the free tier asks for the credit; the rest lives in Help (review A) */
      el("p", { class: "k-asst-muted" }, [
        document.createTextNode("Voice by "),
        el("a", { class: "k-link", href: "https://elevenlabs.io", target: "_blank", rel: "noopener noreferrer", text: "ElevenLabs" })
      ])
    ]);
    body.appendChild(el("div", { class: "k-asst-pair" }, [local, voice]));
  }

  function pageMemory(body) {
    sectionIntro(body, "User-controlled context", "Memory", "What Kurenai keeps between conversations. You can edit or forget any of it.");
    if (!KOS.ai.memory.available().persist) {
      body.appendChild(KOS.ui.emptyState({ mark: "憶", title: "Memory needs a cloud sign-in",
        body: "Archive → Account & Cloud Sync. Every memory is one you asked for or approved; secrets and keys are always refused." }));
      return;
    }
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.memory" });
    var addIn = el("textarea", { class: "k-asst-input", rows: "1", placeholder: "Add a note for Kurenai to remember…", "aria-label": "New memory" });
    body.appendChild(el("div", { class: "k-asst-composer", "data-ui": "asst.memory-add" }, [addIn,
      el("button", { class: "k-btn k-btn--primary", type: "button", text: "＋ New memory", onclick: function () {
        KOS.ai.memory.add(addIn.value, "user", function (err) {
          if (err) { KOS.ui.toast(err.message, true); return; }
          addIn.value = "";
          render();
        });
      } })]));
    body.appendChild(list);
    function render() {
      list.innerHTML = "";
      KOS.ai.memory.list(function (err, rows) {
        if (err) { list.appendChild(el("p", { class: "k-asst-error-line", text: err.message })); return; }
        if (!rows.length) { list.appendChild(el("p", { class: "k-asst-muted", text: "No memories yet. Every memory is one you asked for or approved." })); return; }
        rows.forEach(function (m) {
          var content = el("div", { class: "k-asst-line-t", text: m.content });
          list.appendChild(el("div", { class: "k-asst-line", "data-ui": "asst.memory-row" }, [
            el("span", { class: "k-asst-line-mark", "aria-hidden": "true", text: "◇" }),
            el("div", { class: "k-asst-line-txt" }, [
              content,
              el("span", { class: "k-asst-line-m", text: (m.origin === "user" ? "you asked" : "you approved") +
                (m.updatedAt ? " · " + new Date(m.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "") })
            ]),
            el("button", { class: "k-link", type: "button", text: "Edit", "aria-label": "Edit memory", onclick: function () {
              var ta = el("textarea", { class: "k-input", rows: "2" }); ta.value = m.content;
              var save = el("button", { class: "k-btn k-btn--sm", type: "button", text: "Save", onclick: function () {
                KOS.ai.memory.update(m.id, ta.value, function (err2) {
                  if (err2) { KOS.ui.toast(err2.message, true); return; }
                  render();
                });
              } });
              content.replaceWith(el("div", { class: "k-asst-inline-edit", "data-ui": "asst.memory-edit" }, [ta, save]));
              ta.focus();
            } }),
            el("button", { class: "k-link k-asst-danger", type: "button", text: "Forget", "aria-label": "Delete memory", onclick: function () {
              KOS.ui.confirm({ title: "Forget this?", danger: true, confirm: "Forget",
                body: "“" + clampText(m.content, 120) + "” is removed permanently." },
                function () { KOS.ai.memory.remove(m.id, function () { render(); }); });
            } })
          ]));
        });
      });
    }
    render();
  }

  /* Scheduled prompts (core/aischedule.js): a message Kurenai sends for
     the user at a time — sent while the app is open, or on the first open
     later that day — answered read-only into its own conversation and the
     notification centre. `focusId` is the schedule a notification opened. */
  var DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
  function daysText(days) {
    var d = (days || []).slice().sort().join(",");
    if (d === "0,1,2,3,4,5,6") return "every day";
    if (d === "1,2,3,4,5") return "weekdays";
    if (d === "0,6") return "weekends";
    return DAY_ORDER.filter(function (x) { return days.indexOf(x) !== -1; }).map(function (x) { return DAY_ABBR[x]; }).join(" ");
  }
  function whenText(ts) {
    if (!ts) return "not scheduled";
    var d = new Date(ts), now = new Date();
    var day = KOS.ai.schedule.today(d) === KOS.ai.schedule.today(now) ? "today"
      : KOS.ai.schedule.today(d) === KOS.ai.schedule.today(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)) ? "tomorrow"
      : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return day + " at " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  function dayPicker(initial) {
    var on = (initial || [0, 1, 2, 3, 4, 5, 6]).slice();
    var wrap = el("div", { class: "k-asst-days", role: "group", "aria-label": "Days" });
    DAY_ORDER.forEach(function (d) {
      var b = el("button", { type: "button", class: "k-asst-day", "data-ui": "asst.schedule-day", "aria-pressed": String(on.indexOf(d) !== -1),
        "aria-label": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d], text: DAY_ABBR[d].charAt(0) });
      b.addEventListener("click", function () {
        var i = on.indexOf(d);
        if (i === -1) on.push(d); else on.splice(i, 1);
        b.setAttribute("aria-pressed", String(i === -1));
      });
      wrap.appendChild(b);
    });
    wrap.value = function () { return on.slice(); };
    return wrap;
  }
  function pageScheduled(body, focusId) {
    var SCH = KOS.ai.schedule;
    sectionIntro(body, "Kurenai, on a timer", "Scheduled", "Messages Kurenai sends for you at a time; the reply arrives as a notification.");
    var nameIn = el("input", { type: "text", class: "k-input", maxlength: "60", placeholder: "Name (optional) — e.g. Morning plan", "aria-label": "Schedule name" });
    var promptIn = el("textarea", { class: "k-asst-input", rows: "2", placeholder: "What should Kurenai answer? e.g. Tell me the plan for today", "aria-label": "Scheduled message" });
    var timeIn = el("input", { type: "time", class: "k-input k-asst-time", "aria-label": "Time" });
    timeIn.value = "07:00";
    var days = dayPicker();
    body.appendChild(el("section", { class: "k-card k-asst-block k-asst-sched-add", "data-ui": "asst.schedule-add", "aria-label": "New scheduled message" }, [
      nameIn, promptIn,
      el("div", { class: "k-asst-sched-when" }, [
        el("label", { class: "k-asst-sched-at" }, [el("span", { class: "k-asst-muted", text: "At" }), timeIn]),
        days,
        el("button", { class: "k-btn k-btn--primary", type: "button", "data-ui": "asst.schedule-create", text: "＋ Schedule", onclick: function () {
          var r = SCH.add({ name: nameIn.value, prompt: promptIn.value, time: timeIn.value, days: days.value() });
          if (!r.ok) { KOS.ui.toast(r.error, true); return; }
          KOS.ui.toast("Scheduled — next " + whenText(SCH.nextAt(r.schedule)) + ".");
          nameIn.value = ""; promptIn.value = "";
          render();
        } })
      ]),
      el("p", { class: "k-asst-muted", text: "Sent while KurenaiOS is open, or the first time you open it later that day. Kurenai only reads when it runs — it never changes anything unattended." })
    ]));
    /* the device alert is what makes "notified when it responds" reach a
       phone in a pocket — offer it here, from a click (a user gesture) */
    var N = KOS.notify && KOS.notify.native;
    if (N && N.supported() && !N.enabled()) {
      body.appendChild(el("p", { class: "k-asst-sched-alert", "data-ui": "asst.schedule-alerts" }, [
        el("span", { class: "k-asst-muted", text: "Device alerts are off, so a reply only shows in the bell." }),
        el("button", { class: "k-btn k-btn--sm", type: "button", text: "Alert me on this device", onclick: function () {
          N.request(function (ok) { KOS.ui.toast(ok ? "Alerts on for this device." : "The browser didn't allow alerts.", !ok); render(); });
        } })
      ]));
    }
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.schedules" });
    body.appendChild(list);
    var off = SCH.onChange(function () { if (!list.isConnected) { off(); return; } render(); });
    function render() {
      list.innerHTML = "";
      var rows = SCH.list(), live = SCH.running();
      if (!rows.length) {
        list.appendChild(el("p", { class: "k-asst-muted", text: "Nothing scheduled yet." }));
        return;
      }
      rows.sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; }).forEach(function (sc) {
        var isLive = live && live.id === sc.id && !live.syncing;
        var toggle = el("input", { type: "checkbox", "aria-label": "Send " + (sc.name || "this message") + " on schedule" });
        toggle.checked = !!sc.enabled;
        toggle.addEventListener("change", function () { SCH.update(sc.id, { enabled: toggle.checked }); });
        var last = sc.last;
        var result = null;
        if (last) {
          var open = focusId === sc.id;
          result = el("details", { class: "k-asst-sched-last", "data-ui": "asst.schedule-last", open: open ? "" : null }, [
            el("summary", { text: (last.ok ? "Last reply · " : "Last attempt failed · ") + whenText(last.at) }),
            last.ok ? assistantRichText(last.text) : el("p", { class: "k-asst-error-line", text: last.text }),
            last.conversationId ? el("button", { class: "k-link", type: "button", text: "Open the conversation →", onclick: function () {
              KOS.assistant.openConversation(last.conversationId, function (err) { if (!err) KOS.show("assistant", { tab: "chat" }); });
            } }) : null
          ].filter(Boolean));
          if (open && last.ok && KOS.notify) KOS.notify.markRead("asst:" + sc.id + ":" + last.date);
        }
        list.appendChild(el("div", { class: "k-asst-line k-asst-sched", "data-ui": "asst.schedule-row", "data-state": focusId === sc.id ? "focus" : null }, [
          el("span", { class: "k-asst-line-mark k-mono", "aria-hidden": "true", text: sc.time }),
          el("div", { class: "k-asst-line-txt" }, [
            sc.name ? el("b", { text: sc.name }) : null,
            el("div", { class: "k-asst-line-t", text: sc.prompt }),
            el("span", { class: "k-asst-line-m", text: sc.time + " · " + daysText(sc.days) + " · " +
              (isLive ? "sending now…" : sc.enabled ? "next " + whenText(SCH.nextAt(sc)) : "paused") }),
            result
          ].filter(Boolean)),
          el("label", { class: "k-asst-sched-on" }, [toggle, el("span", { text: "On" })]),
          el("button", { class: "k-link", type: "button", text: isLive ? "Sending…" : "Run now", disabled: live ? "" : null,
            "aria-label": "Run " + (sc.name || "this message") + " now", onclick: function () {
              SCH.run(sc.id, function (err) { if (err) KOS.ui.toast(err.message, true); });
              render();
            } }),
          el("button", { class: "k-link k-asst-danger", type: "button", text: "Delete", "aria-label": "Delete " + (sc.name || "this scheduled message"), onclick: function () {
            KOS.ui.confirm({ title: "Delete this schedule?", danger: true, confirm: "Delete",
              body: "“" + clampText(sc.name || sc.prompt, 120) + "” stops being sent. Past replies stay in History." },
              function () { SCH.remove(sc.id); });
          } })
        ]));
      });
    }
    render();
    if (focusId) window.requestAnimationFrame(function () {
      var row = list.querySelector("[data-state~='focus']");
      if (row && row.scrollIntoView) row.scrollIntoView({ block: "center" });
    });
  }

  var TIER_TONE = { read: "teal", reversible: "amber", consequential: "crimson", undo: "muted" };
  function tierChip(tier) {
    return el("span", { class: "k-chip", "data-tone": TIER_TONE[tier] || "teal", text: tierLabel(tier) });
  }

  /* Permissions (frame 13e): grouped by area as in aitools.js, one open;
     each group counts its tiers and its changed rows. A consequential row
     can be blocked but never loosened — it always asks. */
  function pagePermissions(body) {
    sectionIntro(body, "Autonomy controls", "Permissions", "Decide what Kurenai may read or do automatically. Consequential actions always keep their approval floor.");
    var tools = KOS.ai.tools.list();
    var perTool = function () { return (KOS.ai.config().permissions || { perTool: {} }).perTool || {}; };
    var cats = {};
    tools.forEach(function (t) { (cats[t.category] = cats[t.category] || []).push(t); });
    var areas = Object.keys(cats).sort();
    var filterIn = el("input", { class: "k-input k-asst-filter", type: "search", placeholder: "⌕ Filter tools or tier", "aria-label": "Filter tools or tier" });
    var reset = el("button", { class: "k-btn k-btn--sm", type: "button", text: "Reset to defaults", onclick: function () {
      var changed = Object.keys(perTool()).filter(function (n) { return perTool()[n]; });
      if (!changed.length) { KOS.ui.toast("Every tool is already on its default."); return; }
      KOS.ui.confirm({ title: "Reset every permission?", confirm: "Reset " + changed.length,
        body: changed.length + " tool" + (changed.length === 1 ? " goes" : "s go") + " back to its default. Consequential actions keep asking either way." }, function () {
        changed.forEach(function (n) { KOS.ai.orchestrator.setPermission(n, null); });
        KOS.show("assistant", { tab: "permissions" });
      });
    } });
    body.appendChild(el("div", { class: "k-asst-permbar" }, [
      tierChip("read"), tierChip("reversible"), tierChip("consequential"),
      el("span", { class: "k-asst-muted", text: tools.length + " tools in " + areas.length + " areas" }),
      el("span", { class: "k-asst-permbar-end" }, [filterIn, reset])
    ]));
    var groups = el("div", { class: "k-asst-perm-groups" });
    areas.forEach(function (cat, catIndex) {
      var rows = el("div", { class: "k-asst-perm-rows" });
      var tiers = { read: 0, reversible: 0, consequential: 0 }, changed = 0;
      cats[cat].forEach(function (t) {
        tiers[t.tier] = (tiers[t.tier] || 0) + 1;
        var userMode = perTool()[t.name] || "";
        if (userMode) changed++;
        var opts = [];
        if (t.tier !== "consequential") opts.push(["", "Default · " + (t.tier === "read" ? "runs freely" : "runs, undoable")], ["ask", "Ask first"]);
        else opts.push(["", "Always asks (fixed)"]);
        opts.push(["never", "Blocked"]);
        var sel = el("select", { class: "k-input", "aria-label": "Permission for " + t.name }, opts.map(function (o) {
          var opt = el("option", { value: o[0], text: o[1] });
          if (userMode === o[0]) opt.selected = true;
          return opt;
        }));
        sel.addEventListener("change", function () {
          var r = KOS.ai.orchestrator.setPermission(t.name, sel.value === "" ? null : sel.value);
          if (!r.ok) { KOS.ui.toast(r.msg, true); sel.value = ""; }
        });
        rows.appendChild(el("div", { class: "k-asst-perm", "data-ui": "asst.perm-row", "data-name": (toolDisplayName(t.name) + " " + t.name).toLowerCase(),
          "data-tier": (t.tier + " " + tierLabel(t.tier)).toLowerCase() }, [
          el("div", { class: "k-asst-perm-txt" }, [
            el("div", { class: "k-asst-perm-t", text: toolDisplayName(t.name) }),
            el("div", { class: "k-asst-perm-d", text: t.desc || "KurenaiOS assistant action" }),
            el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: t.name })
          ]),
          tierChip(t.tier),
          sel
        ]));
      });
      var counts = el("span", { class: "k-asst-tiers", "aria-label": "By tier" });
      ["read", "reversible", "consequential"].forEach(function (tier) {
        if (tiers[tier]) counts.appendChild(el("span", { "data-tone": TIER_TONE[tier], title: tierLabel(tier) }, [
          el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), String(tiers[tier])
        ]));
      });
      var details = el("details", { class: "k-asst-perm-group", "data-ui": "asst.perm-group" }, [
        el("summary", {}, [
          el("span", { class: "k-asst-perm-tile", lang: "ja", "aria-hidden": "true", text: AREA_KANJI[cat] || "·" }),
          el("span", { class: "k-asst-perm-area", text: titleWords(cat) }),
          el("span", { class: "k-asst-muted", text: cats[cat].length + " tool" + (cats[cat].length === 1 ? "" : "s") }),
          counts,
          changed ? el("span", { class: "k-chip", "data-tone": "bloom", text: changed + " changed" }) : null,
          el("span", { class: "k-asst-chev", "aria-hidden": "true" })
        ].filter(Boolean)),
        rows
      ]);
      if (catIndex === 0) details.open = true;
      groups.appendChild(details);
    });
    body.appendChild(groups);
    filterIn.addEventListener("input", function () {
      var q = filterIn.value.trim().toLowerCase();
      groups.querySelectorAll("[data-ui~='asst.perm-group']").forEach(function (g) {
        var hits = 0;
        g.querySelectorAll("[data-ui~='asst.perm-row']").forEach(function (r) {
          var sel = r.querySelector("select"), opt = sel && sel.options[sel.selectedIndex];
          var hay = ((r.getAttribute("data-name") || "") + " " + (r.getAttribute("data-tier") || "") + " " +
            (sel ? sel.value : "") + " " + (opt ? opt.textContent : "")).toLowerCase();
          var on = !q || hay.indexOf(q) !== -1;
          r.hidden = !on; if (on) hits++;
        });
        g.hidden = !!q && !hits;
        if (q && hits) g.open = true;
      });
    });
  }


  /* Activity (frame 13f): the record, read-only. Each row is when, what
     happened, the action and its target, its tier and the outcome; the
     raw tool id and status stay beside it for diagnosis. */
  /* the orchestrator's audit statuses (aiorchestrator.js auditStatus) */
  var AUDIT_PHASE = { proposed: "Proposed", awaiting_confirmation: "Proposed", confirmed: "Approved",
    executed: "Ran", rejected: "Declined", cancelled: "Cancelled", failed: "Failed" };
  var AUDIT_OUTCOME = { proposed: ["Started", "muted"], awaiting_confirmation: ["Waiting", "amber"],
    confirmed: ["Running", "teal"], executed: ["Done", "green"], rejected: ["Declined", "muted"],
    cancelled: ["Cancelled", "muted"], failed: ["Failed", "red"] };
  var AUDIT_FILTERS = [["all", "All"], ["waiting", "Waiting"], ["ran", "Ran"], ["declined", "Declined"], ["failed", "Failed"]];
  function auditBucket(status) {
    return status === "awaiting_confirmation" ? "waiting" : status === "executed" || status === "confirmed" ? "ran"
      : status === "rejected" || status === "cancelled" ? "declined" : status === "failed" ? "failed" : "other";
  }
  function pageActivity(body) {
    sectionIntro(body, "Immutable record", "Activity", "Every proposed or executed action and its real outcome. Deliberately read-only, so the record stays honest.");
    var areaOf = {};
    KOS.ai.tools.list().forEach(function (t) { areaOf[t.name] = t.category; });
    var status = "all", area = "all", rows = [];
    var bar = el("div", { class: "k-asst-permbar" });
    var count = el("span", { class: "k-asst-permbar-end k-asst-muted", role: "status" });
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.audit" });
    body.appendChild(bar);
    body.appendChild(list);
    function seg(items, cur, pick, label) {
      return KOS.ui.tabs(items.map(function (it) {
        return { label: it[1], active: it[0] === cur, onSelect: function () { pick(it[0]); } };
      }), { variant: "card", label: label });
    }
    function paintBar() {
      bar.innerHTML = "";
      var waiting = rows.filter(function (r) { return auditBucket(r.status || "proposed") === "waiting"; }).length;
      bar.appendChild(seg(AUDIT_FILTERS.map(function (f) { return f[0] === "waiting" && waiting ? [f[0], f[1] + " · " + waiting] : f; }),
        status, function (v) { status = v; paintBar(); draw(); }, "Filter by outcome"));
      var areas = Object.keys(rows.reduce(function (a, r) { if (areaOf[r.tool]) a[areaOf[r.tool]] = 1; return a; }, {})).sort();
      if (areas.length > 1) bar.appendChild(seg([["all", "All areas"]].concat(areas.map(function (a) { return [a, titleWords(a)]; })),
        area, function (v) { area = v; paintBar(); draw(); }, "Filter by area"));
      bar.appendChild(count);
    }
    function draw() {
      list.innerHTML = "";
      var shown = rows.filter(function (r) {
        return (status === "all" || auditBucket(r.status || "proposed") === status) && (area === "all" || areaOf[r.tool] === area);
      });
      count.textContent = rows.length ? (shown.length === rows.length ? rows.length + " action" + (rows.length === 1 ? "" : "s") : shown.length + " of " + rows.length) : "";
      if (!shown.length) { list.appendChild(el("p", { class: "k-asst-muted", text: rows.length ? "Nothing matches these filters." : "No assistant actions yet." })); return; }
      shown.forEach(function (r) {
        var st = r.status || "proposed", out = r.tier === "undo" ? ["Undone", "muted"] : AUDIT_OUTCOME[st] || [titleWords(st), "muted"];
        var when = r.created_at ? new Date(r.created_at) : null;
        var detail = [r.target, r.result_summary ? clampText(r.result_summary, 120) : null].filter(Boolean).join(" · ");
        list.appendChild(el("div", { class: "k-asst-audit", "data-ui": "asst.audit-row", "data-status": st }, [
          el("time", { class: "k-asst-audit-when", datetime: r.created_at || null,
            text: when ? (when.toDateString() === new Date().toDateString() ? when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })) : "" }),
          el("span", { class: "k-asst-audit-phase", text: AUDIT_PHASE[st] || titleWords(st) }),
          el("div", { class: "k-asst-audit-txt" }, [
            el("div", { class: "k-asst-audit-t", text: toolDisplayName(r.tool) }),
            detail ? el("div", { class: "k-asst-audit-d", text: detail }) : null,
            r.error_summary ? el("div", { class: "k-asst-error-line", text: clampText(r.error_summary, 120) }) : null,
            el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: r.tool + " · " + st })
          ].filter(Boolean)),
          tierChip(r.tier || "read"),
          el("span", { class: "k-asst-outcome", "data-tone": out[1] }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), out[0]])
        ]));
      });
    }
    list.appendChild(el("p", { class: "k-asst-muted", text: "Loading…" }));
    loadAudit(function (err, got, source) {
      list.innerHTML = "";
      if (err) { list.appendChild(el("p", { class: "k-asst-error-line", text: "Couldn't load the action history: " + err.message })); return; }
      rows = got || [];
      if (source === "queued") body.insertBefore(el("p", { class: "k-asst-muted", text: "Signed out · showing actions queued on this device; they upload on sign-in." }), bar);
      paintBar();
      draw();
    });
  }

  KOS.views.assistant = function (main, arg) {
    KOS.shell.tree("none");
    KOS.shell.bleed(true);
    var tab = (arg && arg.tab) || "chat";
    if (!PAGE_TABS.some(function (t) { return t[3] === tab; })) tab = "chat";
    var tabs = assistantTabs(tab);
    var body = el("section", { id: "asst-page-panel", class: "k-asst-page", "data-ui": "asst.page", "data-tab": tab,
      role: "tabpanel", "aria-label": "Assistant " + tab });
    /* frame 15l: on a phone the page is one chat under one header — back,
       the title over its model, "+" and ⋯ — and ⋯ lends the navigation
       column, the project and the pin to one sheet (the same nodes) */
    var route = routingNow().complex;
    var pageName = (PAGE_TABS.filter(function (t) { return t[3] === tab; })[0] || PAGE_TABS[0])[0];
    var more = el("button", { class: "k-iconbtn", "data-ui": "asst.phone-more", type: "button", text: "⋯",
      "aria-label": "Assistant pages and conversations", "aria-haspopup": "dialog", "aria-expanded": "false",
      onclick: function () {
        if (!KOS.mobileShell || !KOS.mobileShell.moveToSheet) return;
        KOS.mobileShell.moveToSheet({ nodes: [tabs, body.querySelector(".k-asst-chip-select"), body.querySelector(".k-asst-pin")],
          trigger: more, eyebrow: "Kurenai", title: "Assistant", slot: "asst-nav", tall: true });
      } });
    var phead = el("div", { class: "k-asst-phead", "data-ui": "asst.phone-head" }, [
      el("button", { class: "k-iconbtn", type: "button", text: "‹", "aria-label": "Back",
        onclick: function () { if (window.history.length > 1) window.history.back(); else KOS.show("home"); } }),
      el("div", { class: "k-asst-phead-t" }, [
        el("b", { text: tab === "chat" ? (S.conversationTitle || "A fresh thread") : pageName }),
        route ? el("span", { text: providerName(route.provider) + " · auto" }) : null
      ].filter(Boolean)),
      el("button", { class: "k-iconbtn", type: "button", text: "＋", "aria-label": "New conversation",
        onclick: function () { newConversation(); KOS.show("assistant", { tab: "chat" }); } }),
      more
    ]);
    var shell = el("div", { class: "k-asst", "data-ui": "asst.shell" }, [phead, tabs, body]);
    if (workspaceCfg().sidebarCollapsed) KOS.ui.state(shell, "is-side-collapsed", true);
    main.appendChild(shell);
    if (tab === "chat") pageChat(body);
    else if (tab === "history") pageHistory(body);
    else if (tab === "settings") pageSettings(body);
    else if (tab === "memory") pageMemory(body);
    else if (tab === "scheduled") pageScheduled(body, arg && arg.run);
    else if (tab === "permissions") pagePermissions(body);
    else if (tab === "activity") pageActivity(body);
    var heading = document.getElementById("asst-page-title");
    window.requestAnimationFrame(function () { if (heading && heading.isConnected) heading.focus({ preventScroll: true }); });
  };

})();
