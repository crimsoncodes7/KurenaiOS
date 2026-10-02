/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.9.3–
   4.9.4.2 (the Internet and how it works, Internet security, the TCP/IP
   stack, standard application-layer protocols) at full A-level depth.
   Each topic REPLACES the short entry the older file carried; every way
   AQA has examined it (7517/2 June 2017–2025; the AS papers examine these
   only through protocols) is explained, worked and answered in the mark
   scheme's own format. Wi-Fi security is 4.9.2.3; IP addressing, NAT and
   DHCP are 4.9.4.3–4.9.4.9. Past-paper banks stay in bank-cs-49.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push({ text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" });
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 2, dash: o.dash }];
  if (label) it.push({ text: [(x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0)], t: label, size: 10.5, c: o.c || "accent2" });
  return it;
}
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\".",
  "Networking answers lose marks for the wrong address type or the wrong key: MAC vs IP, FQDN vs URL, **whose** public or private key. \"R. more than one key referenced\" for a step that uses one key."
] } };

/* =====================================================================
   4.9.3.1  The Internet and how it works
   ===================================================================== */
C["compsci:4.9.3.1"] = {
  notes: [
    { h: "The Internet and how it works — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.3.1)", body: ["The **structure of the Internet**.", "The role of **packet switching** and **routers**.", "The main **components of a packet**.", "Define **router** and **gateway** and where and why they are used.", "How **routing** is achieved.", "**URL**.", "**Fully qualified domain name (FQDN)**, **domain name** and **IP address**.", "How domain names are organised.", "The **Domain Name System (DNS)**.", "The service provided by **Internet registries**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Name packet fields", "Name", "2", "A-level 2023 Q02.1"],
      ["Role of a router in packet switching; a gateway", "Describe", "1–2", "A-level 2023 Q02.3, 2023 Q11.2"],
      ["Protocol and domain name in a URL; how domains are organised", "State / Describe", "1–2", "A-level 2024 Q07.1–07.2"],
      ["Internet registries", "Explain", "2", "A-level 2024 Q07.3"],
      ["DNS: purpose and how it works", "Describe", "3", "A-level 2022 Q08.3"],
      ["Subnet test, routing across the Internet, checksum (essay)", "Explain", "12", "A-level 2020 Q05.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Structure and packet switching**.", "**Routers and gateways**.", "**Names and addresses**: URL, FQDN, DNS, registries.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Structure and packet switching" },
    { fig: { w: 600, h: 200, items: (function () {
      var it = [];
      it = it.concat(boxAt(10, 70, 100, 50, "Home LAN", "accent", "router + NAT"));
      it = it.concat(boxAt(150, 70, 100, 50, "ISP", "accent2", "regional routers"));
      it = it.concat(boxAt(290, 70, 120, 50, "Backbone", "good", "high-speed links"));
      it = it.concat(boxAt(450, 20, 130, 50, "ISP (Belgium)", "accent2"));
      it = it.concat(boxAt(450, 130, 130, 50, "Server LAN", "accent"));
      it = it.concat(arrow(110, 95, 150, 95, null, { both: true }), arrow(250, 95, 290, 95, null, { both: true }), arrow(410, 85, 450, 50, null, { both: true }), arrow(515, 70, 515, 130, null, { both: true }));
      it.push(txt(300, 150, "a mesh of routers: many possible paths", { size: 10.5 }), txt(300, 166, "each packet may take a different one", { size: 10.5 }));
      return it;
    })(), cap: "The Internet is a network of networks: LANs connect through ISPs to backbones; routers join them hierarchically." } },
    { kv: [
      ["The Internet", "a **network of interconnected networks**, joined by routers, using the TCP/IP protocols"],
      ["Packet switching", "data is split into **packets**; each is sent **independently**, may take a **different route**, and they are **reassembled** in order at the destination"],
      ["Why", "links are shared efficiently (no dedicated circuit); a failed router is routed round; many conversations interleave"]
    ] },
    { table: { head: ["Packet part", "Contents"], rows: [
      ["Header", "**source and destination IP addresses**, **sequence number** (to reassemble), **time to live** (hop limit), protocol, packet length, port numbers (in the transport header), IP version, flags"],
      ["Payload", "the data being carried"],
      ["Trailer", "a **checksum / CRC** to detect corruption"]
    ] } },
    { callout: { t: "tip", h: "How the checksum works", body: "The sender calculates a value from the packet's contents (e.g. sum of bytes, or a CRC) and stores it in the packet. The receiver recalculates it from what arrived; if they differ, the packet was changed in transit and is discarded / re-requested (4.5.5.3)." } },

    { page: "Routers and gateways" },
    { kv: [
      ["Router", "a device that **connects two (or more) networks** and forwards packets between them, choosing the **next hop** for each packet"],
      ["Gateway", "connects networks that use **different protocols** — beyond a router, it performs **protocol conversion**"]
    ] },
    { steps: [
      "A router receives a packet and reads its **destination IP address**.",
      "It looks the network up in its **routing table** and chooses the **outgoing link / next router** — the most efficient (shortest, cheapest, least congested) path known.",
      "It **rewrites the link-layer (MAC) addresses** for the next hop — the IP addresses stay the same.",
      "It decrements the **TTL**, discarding the packet if it reaches 0 (stops endless loops).",
      "Routers **exchange routing information** and update their tables to reflect congestion or failures.",
      "Routers are organised **hierarchically**: a packet climbs to national / international routers, crosses, and descends to the destination network. Each router chooses only the **next** hop — the full path is not decided at the start."
    ] },
    { callout: { t: "miscon", h: "\"The router sends the packet to its destination\"", body: "**R.** — a router forwards it one **hop**, to the next router. And it changes the **MAC** addresses, not the IP addresses (**R.** \"modifies the IP addresses\" — except where NAT applies, 4.9.4.8)." } },

    { page: "Names and addresses" },
    { code: { lang: "text", src: "http://www.loveapug.org.uk/pictures/cutepugs.html\n└┬─┘   └┬┘ └──────┬───────┘└──────────┬──────────┘\nprotocol host   domain name            path to the resource\n       └──────── FQDN ────────┘", cap: "A URL broken into its parts (A-level 2024 Q07.1: protocol HTTP, domain name loveapug.org.uk)." } },
    { kv: [
      ["URL", "**Uniform Resource Locator** — the full address of a **resource** on the Internet: protocol + FQDN + path"],
      ["Domain name", "the name that identifies an organisation's area of the Internet, e.g. `loveapug.org.uk`"],
      ["FQDN", "**fully qualified domain name** — the domain name **including the host**, specifying exactly one computer: `www.loveapug.org.uk`"],
      ["IP address", "the numeric address of a network interface, used for routing (`186.7.2.31`)"]
    ] },
    { h: "How domain names are organised" },
    { ul: [
      "**Hierarchically**, read right to left: the **root** (.) → **top-level domain** (`uk`, `com`, `org`, `fr`) → **second-level domain** (`org.uk`, `co.uk`, `ac.uk`) → the organisation's domain (`loveapug`) → **subdomains** and hosts (`www`, `pastpapers.aqa.org.uk`)."
    ] },
    { h: "DNS" },
    { steps: [
      "**Purpose**: to **translate (resolve) FQDNs / domain names into IP addresses**, because routing uses IP addresses but people use names.",
      "The browser asks the configured DNS server (often the ISP's) for the IP address of the FQDN.",
      "DNS servers hold a **database / table** of domain names and IP addresses. It is a **distributed** database: each server knows only some mappings.",
      "The servers are organised in a **hierarchy** (root → TLD servers → authoritative servers). If a server cannot resolve a name, the query is **passed to another** DNS server further up / along.",
      "The answer comes back to the client (and is **cached** for its time-to-live); servers can return one of several IPs to spread load."
    ] },
    { kv: [["Internet registries", "organisations that **register domain names** to people / organisations and record who owns them — so names are **unique**, not used by two organisations, and are entered into the DNS. Regional Internet registries likewise allocate blocks of **IP addresses**."]] },
    { callout: { t: "miscon", h: "DNS translates URLs", body: "**R. / DPT** — DNS translates **FQDNs / domain names**, never whole URLs. The path (`/pictures/cutepugs.html`) is handled by the web server." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two more packet fields", src: "A-level June 2023 · P2 Q02.1 · 2 marks",
      q: "A packet's fields include destination address, source address, payload and checksum. Name two fields typically included in a packet which are not shown.",
      steps: [{ m: "Sequence number (packet number);", mk: "1 mark" }, { m: "Time to live (maximum hop count) // port number // packet length // protocol // IP version;", mk: "1 mark", n: "Only the first two responses are marked." }], result: "Sequence number; TTL" } },
    { worked: { tag: "exam", title: "A router's role in packet switching", src: "A-level June 2023 · P2 Q02.3 · 2 marks",
      q: "Packets are transmitted using packet switching. Describe the role of a router in packet switching.",
      steps: [
        { m: "It connects two networks together;", mk: "1 mark", n: "Must be stated explicitly. NE. \"connects a network to the Internet\"." },
        { m: "it determines which outgoing link / next router to send each packet to, using the most efficient path, updating its routes for congestion or failure;", mk: "1 mark", n: "Also: changes the MAC addresses for the next hop; removes packets whose TTL expires. R. sends to the final destination; R. modifies IP addresses." }
      ], result: "Joins networks; picks the next hop" } },
    { worked: { tag: "exam", title: "What a gateway adds", src: "A-level June 2023 · P2 Q11.2 · 1 mark",
      q: "Email data crossing the Internet passes through routers and one gateway. Describe the additional functionality of a gateway, beyond that of a router.",
      steps: [{ m: "Protocol conversion — it connects networks that use different protocols;", mk: "1 mark" }], result: "Protocol conversion" } },
    { worked: { tag: "exam", title: "Protocol and domain name", src: "A-level June 2024 · P2 Q07.1 · 1 mark",
      q: "State the protocol and domain name used in http://www.loveapug.org.uk/pictures/cutepugs.html.",
      steps: [{ m: "Protocol: **HTTP**; domain name: **loveapug.org.uk**;", mk: "1 mark", n: "Both needed. R. HTTPS. NE. www.loveapug.org.uk (that is the FQDN)." }], result: "HTTP; loveapug.org.uk" } },
    { worked: { tag: "exam", title: "How domain names are organised", src: "A-level June 2024 · P2 Q07.2 · 2 marks",
      q: "Describe how domain names are organised.",
      steps: [{ m: "Hierarchically;", mk: "1 mark", n: "NE. \"split into parts\". TO. the hierarchy of DNS servers." }, { m: "e.g. a top-level domain such as uk or com, a second-level domain such as co.uk or ac.uk, with subdomains such as pastpapers.aqa.org.uk;", mk: "1 mark", n: "Do not use parts of the URL that are not the domain (protocol, file)." }], result: "A hierarchy of levels" } },
    { worked: { tag: "exam", title: "Internet registries", src: "A-level June 2024 · P2 Q07.3 · 2 marks",
      q: "Explain the service provided by Internet registries and why they are needed.",
      steps: [{ m: "They register domain names to people / organisations // store domain names and who owns them;", mk: "1 mark" }, { m: "to ensure domain names are unique and not used by more than one organisation // to enter the name-to-IP mappings into DNS;", mk: "1 mark", n: "NE. \"otherwise domain names could not be used\"." }], result: "Register; guarantee uniqueness" } },
    { worked: { tag: "exam", title: "DNS", src: "A-level June 2022 · P2 Q08.3 · 3 marks",
      q: "When a person loads a webpage it is likely that the Domain Name Server (DNS) system will be used. Describe the main purpose of the DNS system and how it works.",
      steps: [
        { h: "Purpose", m: "Translates fully qualified domain names into IP addresses;", mk: "1 mark", n: "R. URLs." },
        { h: "How", m: "DNS servers store a database of FQDNs and corresponding IP addresses — a distributed database in which individual mappings are known only to some servers;", mk: "1 mark" },
        { h: "How", m: "the servers are organised into a hierarchy, and if one cannot resolve a lookup the query is passed to another;", mk: "1 mark", n: "Also: load distribution by returning one IP from a list. R. describing how domain names (not servers) are organised." }
      ], result: "Names → IPs, distributed hierarchy" } },
    { worked: { tag: "exam", title: "Subnet test, routing and checksum (12-mark essay)", src: "A-level June 2020 · P2 Q05.4 · 12 marks",
      q: "Computer A (192.168.2.3, on a LAN in the UK) sends a packet to email server Computer B (public IP 141.134.27.8, in Belgium); a checksum detects errors. Explain how Computer A uses a subnet mask to decide whether to send directly across the LAN or via the Internet; how the packet is routed across the Internet; and how the checksum shows whether the packet changed.",
      steps: [
        { h: "1 · Subnet test", m: "Computer A ANDs the subnet mask (say 255.255.255.0) with its own address → network ID 192.168.2.0, and with B's address → 141.134.27.0. The network IDs differ, so B is not on A's subnet and the packet goes to the router / default gateway; had they matched, A would send it directly across the LAN.", mk: "area 1" },
        { h: "2 · Routing", m: "Routers are organised hierarchically: the packet passes up from A's router to the ISP and national routers, crosses internationally, then down Belgium's hierarchy. At each hop the router reads the destination IP and chooses the next hop from its routing table — the route is not fixed at the start, and packets of one message may take different routes.", mk: "area 2" },
        { h: "3 · Checksum", m: "Before sending, A computes a checksum from the packet's contents with an agreed algorithm and adds it to the packet. B recomputes it from the data received; if the two values match the packet is (very probably) unchanged; if not, it was corrupted and is discarded or re-requested.", mk: "area 3" },
        { m: "Write the three areas in order, each in sequence.", mk: "10–12: all three areas, two in good depth" }
      ], result: "AND and compare; hop by hop; recompute and compare" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Name packet fields", "Sequence number, TTL, port, length, protocol — not the ones shown."],
      ["Describe the role of a router", "Connects networks + chooses the next hop (and updates routes / rewrites MACs)."],
      ["Describe how domains are organised", "\"Hierarchically\" + labelled examples (TLD, second-level, subdomain)."],
      ["Describe DNS", "FQDN → IP + distributed hierarchy that passes on unresolved queries."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "URL = \"Please Find Page\"", body: "**P**rotocol, **F**QDN, **P**ath. Packet header \"**S**ome **D**ucks **S**wim **T**ogether\": **S**ource, **D**estination, **S**equence, **T**TL. Router = next **hop**; gateway = **translate**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["DNS translates URLs (R.).", "Routers send packets straight to the destination (R.).", "Routers change IP addresses (R.).", "Including www or the path in \"the domain name\"."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.1 the network layer does the routing; 4.9.4.4 subnet masks (the AND); 4.5.5.3 checksums; 4.9.4.8 NAT at the edge router; 4.2.2 graphs and 4.3.6 Dijkstra's shortest path model routing." } }
  ],
  flashcards: [
    ["What is the Internet?", "A network of interconnected networks using TCP/IP."],
    ["Packet switching?", "Data split into packets sent independently, possibly by different routes, reassembled at the destination."],
    ["Packet header fields?", "Source/destination IP, sequence number, TTL, protocol, length (ports in the transport header)."],
    ["Router?", "Connects networks and forwards each packet to the next hop using its routing table."],
    ["Gateway?", "Connects networks with different protocols — performs protocol conversion."],
    ["URL?", "Full address of a resource: protocol + FQDN + path."],
    ["FQDN?", "Domain name including the host, e.g. www.aqa.org.uk."],
    ["How are domain names organised?", "Hierarchically: root → TLD → second-level → organisation → subdomain/host."],
    ["Purpose of DNS?", "To resolve FQDNs/domain names into IP addresses."],
    ["Internet registries?", "Register domain names to owners, ensuring uniqueness, and feed DNS."],
    ["Does a router change IP or MAC addresses?", "MAC addresses (for the next hop)."]
  ],
  quiz: [
    { q: "DNS translates", opts: ["domain names into IP addresses", "URLs into MAC addresses", "IP into MAC addresses", "ports into sockets"], ans: 0, why: "R. URLs." },
    { q: "A gateway, unlike a router,", opts: ["converts between protocols", "uses IP addresses", "forwards packets", "has ports"], ans: 0, why: "Protocol conversion." },
    { q: "The domain name in http://www.aqa.org.uk/x.html is", opts: ["aqa.org.uk", "www.aqa.org.uk", "http://www.aqa.org.uk", "x.html"], ans: 0, why: "www.… is the FQDN." },
    { q: "TTL in a packet", opts: ["limits the number of hops", "is the sequence number", "is the checksum", "is the port"], ans: 0, why: "Stops loops." }
  ]
};

/* =====================================================================
   4.9.3.2  Internet security
   ===================================================================== */
C["compsci:4.9.3.2"] = {
  notes: [
    { h: "Internet security — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.3.2)", body: ["How a **firewall** works (packet filtering, proxy server, stateful inspection)", "**Symmetric** and **asymmetric** (public/private key) encryption and **key exchange**.", "How **digital certificates** and **digital signatures** are obtained and used.", "**Worms, trojans and viruses** and the vulnerabilities they exploit.", "How improved **code quality, monitoring and protection** address them."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Four ways a firewall protects a LAN", "Explain", "4", "A-level 2020 Q05.3"],
      ["Decrypt and verify a signed message", "Explain", "4", "A-level 2019 Q14.4"],
      ["Encrypt + sign, then decrypt + verify", "Describe", "6", "A-level 2023 Q11.5"],
      ["Four measures against viruses (besides anti-virus and training)", "Describe", "4", "A-level 2024 Q01"],
      ["Wi-Fi security measures", "—", "—", "see 4.9.2.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Firewalls**.", "**Encryption and key exchange**.", "**Digital signatures and certificates**.", "**Malware and defences**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Firewalls" },
    { table: { head: ["Technique", "How it works", "Protects by"], rows: [
      ["**Packet filtering** (static)", "examines each packet's **header** — source/destination IP, port, protocol — against **rules**", "blocking / allowing specific **IP addresses**, **ports** (so protocols) and packet types (e.g. pings)"],
      ["**Stateful inspection**", "keeps a table of **current connections**; examines packets in context", "only allowing packets that belong to an established, legitimate conversation"],
      ["**Proxy server**", "sits between LAN and Internet; requests go **via** it and it fetches on the client's behalf", "hiding internal addresses; no direct access from the Internet to LAN devices; can check content and cache"]
    ] } },
    { callout: { t: "warn", h: "MAC addresses and \"websites\"", body: "A firewall at the Internet edge filters **IP addresses** (A. domain names as BOD) — **R.** MAC addresses, which do not cross routers. \"Block certain websites\" alone is **NE.**; \"just the name packet filtering\" is NE. — describe the rule." } },

    { page: "Encryption and key exchange" },
    { table: { head: ["", "Symmetric", "Asymmetric (public key)"], rows: [
      ["Keys", "**one shared key** encrypts and decrypts", "a **key pair**: a **public** key (shared openly) and a **private** key (kept secret); what one encrypts, only the other decrypts"],
      ["Confidentiality", "encrypt with the shared key", "encrypt with the **recipient's public key** — only the recipient's private key decrypts"],
      ["Speed", "**fast**", "slow (heavy maths)"],
      ["Problem", "**key exchange** — how to share the key without it being intercepted", "solves key exchange — public keys can be published"],
      ["Examples", "AES; Vernam (4.5.6.10)", "RSA, elliptic-curve"]
    ] } },
    { callout: { t: "def", h: "Key exchange in practice (hybrid)", body: "HTTPS uses asymmetric encryption **only to agree a symmetric session key** (the client encrypts a random key with the server's public key, or both use Diffie-Hellman), then switches to fast symmetric encryption for the data." } },

    { page: "Digital signatures and certificates" },
    { fig: { w: 620, h: 200, items: (function () {
      var it = [];
      it.push(txt(150, 12, "Sender A", { b: true, c: "accent", size: 12 }), txt(470, 12, "Receiver B", { b: true, c: "accent2", size: 12 }));
      it = it.concat(boxAt(20, 26, 260, 34, "hash(message) = digest", "accent"));
      it = it.concat(boxAt(20, 70, 260, 34, "encrypt digest with A's PRIVATE key", "accent", "= digital signature"));
      it = it.concat(boxAt(20, 124, 260, 34, "encrypt message + signature", "accent", "with B's PUBLIC key"));
      it = it.concat(arrow(280, 141, 340, 141, "send"));
      it = it.concat(boxAt(340, 26, 260, 34, "decrypt with B's PRIVATE key", "accent2", "→ message + signature"));
      it = it.concat(boxAt(340, 70, 260, 34, "decrypt signature with A's PUBLIC key", "accent2", "→ received digest"));
      it = it.concat(boxAt(340, 124, 260, 34, "re-hash the message", "accent2", "→ recalculated digest"));
      it.push(txt(470, 182, "digests equal ⇒ sent by A and unaltered", { b: true, c: "good", size: 11 }));
      return it;
    })(), cap: "Sign with the SENDER's private key; encrypt with the RECIPIENT's public key. Each step uses exactly one key." } },
    { kv: [
      ["Digital signature", "a **hash (message digest)** of the message **encrypted with the sender's private key** — proves the **sender's identity** (authentication) and that the message was **not altered** (integrity)"],
      ["Digital certificate", "issued by a trusted **Certificate Authority (CA)**: binds an organisation's **identity to its public key**, signed with the CA's private key — so you can trust a public key really is theirs (HTTPS)"],
      ["Obtaining one", "the organisation proves its identity to a CA and submits its public key; the CA signs a certificate containing the key, owner, CA, expiry and serial number"]
    ] },
    { callout: { t: "miscon", h: "Side by side: who signs, who encrypts", body: "**Secrecy**: encrypt with the **receiver's public** key → only they can read it. **Signature**: encrypt the digest with the **sender's private** key → anyone can verify with the sender's public key, only the sender could have made it. Mixing these up loses every mark." } },

    { page: "Malware and defences" },
    { table: { head: ["Malware", "Behaviour", "Spreads by / exploits"], rows: [
      ["**Virus**", "attaches itself to a host file or program; runs when the host runs; replicates into other files", "needs a **user action** — opening infected attachments, downloads, macros, shared media"],
      ["**Worm**", "a **standalone** program that **self-replicates across networks** without user action", "**software vulnerabilities** (e.g. buffer overflow) in network services; unpatched systems"],
      ["**Trojan**", "**disguised as legitimate software**; does not self-replicate; opens a backdoor, steals data", "**social engineering** — the user is tricked into installing it"]
    ] } },
    { table: { head: ["Category", "Measures (describe how each helps)"], rows: [
      ["**Code quality**", "prevent **buffer overflows** (bounds-check input); security testing; independent **code review**; static-analysis tools; use up-to-date, well-tested libraries from trusted sources"],
      ["**Monitoring**", "firewalls block high-risk sources and unsolicited packets; **spam / attachment filters** (block executables); web filters; proxy checks downloads; verify downloads with **digital certificates / signatures / checksums**"],
      ["**Protection**", "**automatic OS / application updates** patch vulnerabilities; run untrusted code in a **sandbox / virtual machine**; least-privilege **access rights**; disable macros and removable media; strong passwords; **offline backups** to recover; Harvard architecture prevents data executing as code"]
    ] } },
    { callout: { t: "warn", h: "Naming is not describing", body: "A-level 2024: \"Naming methods eg 'backup', 'firewall' without describing how they would be used is not enough.\" Write: \"keep backups **offline** so data can be **restored** if a virus corrupts it\"." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Four ways a firewall protects a LAN", src: "A-level June 2020 · P2 Q05.3 · 4 marks",
      q: "Router A3 also acts as a firewall to protect the computers on the UK LAN. Explain four different ways that a firewall can protect computers on a LAN.",
      steps: [
        { m: "Block / allow traffic on specific ports — so only permitted protocols / services get through;", mk: "1 mark" },
        { m: "Block / allow traffic from specific IP addresses (e.g. known malicious sources);", mk: "1 mark", n: "R. MAC addresses. NE. \"block certain websites\"." },
        { m: "Stateful inspection: maintain information about current connections and only allow packets relevant to them;", mk: "1 mark", n: "NE. just the name." },
        { m: "Act as a proxy server — all traffic goes via the firewall, so computers on the Internet cannot directly access LAN devices;", mk: "1 mark", n: "Also: block packet types (pings); flag unusual behaviour (a host sending unusually large amounts of data)." }
      ], result: "Ports, IPs, state, proxy" } },
    { worked: { tag: "exam", title: "Decrypt and verify", src: "A-level June 2019 · P2 Q14.4 · 4 marks",
      q: "A message from computer A to computer B is encrypted using asymmetric encryption, with a digital signature. Explain how B will decrypt the message and verify that it was sent by A, referring to the specific keys used.",
      steps: [
        { m: "B's private key is used to decrypt the message (and signature);", mk: "1 mark", n: "R. more than one key named for this step." },
        { m: "the message is rehashed — a new digest is calculated from it;", mk: "1 mark" },
        { m: "A's public key is used to decrypt the digital signature, giving the received digest;", mk: "1 mark" },
        { m: "if the received and recalculated digests match, B knows A sent the message;", mk: "1 mark", n: "NE. \"knows it was not tampered with\" as the authentication point." }
      ], result: "B private, rehash, A public, compare" } },
    { worked: { tag: "exam", title: "Sign, encrypt, decrypt, verify (6 marks)", src: "A-level June 2023 · P2 Q11.5 · 6 marks",
      q: "A confidential email from Computer A to Computer B will be encrypted using asymmetric encryption with a digital signature. Describe how A will encrypt the message and create the signature, and how B will decrypt it and verify it was sent by A, referring to the specific keys.",
      steps: [
        { h: "Transmission", m: "A calculates a message digest (hash) from the message contents, and encrypts the digest with A's private key — this is the digital signature, which is appended to the message.", mk: "indicative" },
        { h: "Transmission", m: "The message (and signature) are encrypted using B's public key.", mk: "indicative" },
        { h: "Reception", m: "B decrypts the message and signature with B's private key; recalculates the digest from the message; decrypts the signature with A's public key to get the received digest.", mk: "indicative" },
        { h: "Reception", m: "If the two digests match, B knows A sent the message.", mk: "5–6 marks", n: "5–6: both halves, at least three keys correctly identified; 3–4: much of it, two keys; 1–2: a few points. R. more than one key for a one-key step." }
      ], result: "A private signs; B public encrypts; reverse to check" } },
    { worked: { tag: "exam", title: "Four more measures against viruses", src: "A-level June 2024 · P2 Q01 · 4 marks",
      q: "Anti-virus software and user training are measures that can be used to reduce the threat posed by viruses. Describe four other measures.",
      steps: [
        { m: "Enable automatic updates of the OS and applications, so code vulnerabilities are patched;", mk: "1 mark", n: "R. automatic update of anti-virus software." },
        { m: "Use spam / attachment filters to block emails from suspicious sources and attachments of executable types;", mk: "1 mark" },
        { m: "Run untrusted programs or open files in a sandbox / virtual machine so they cannot affect the real system;", mk: "1 mark" },
        { m: "Keep backups offline, so data can be recovered if a virus corrupts it;", mk: "1 mark", n: "Also: firewall rules; verifying digital signatures/certificates; least-privilege access rights; disabling macros or USB media; strong passwords; code review and buffer-overflow checks. Naming without describing is NE." }
      ], result: "Four described measures" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain ways a firewall protects", "Each: what is blocked/allowed and on what basis (port, IP, connection state, proxy)."],
      ["Explain / describe signatures", "Every step with exactly one key named: whose, public or private."],
      ["Describe measures", "Measure + how it reduces the threat."],
      ["Discuss malware", "Behaviour + the vulnerability exploited + the defence."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Sign with your Secret, Seal with their Public\"", body: "Signature = **sender's private** key; confidentiality = **receiver's public** key. Malware: **V**irus needs a **V**ictim to run it; **W**orm **W**anders alone; **T**rojan **T**ricks you." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Wrong key or two keys for one step.", "MAC addresses in firewall rules (R.).", "\"Backup\" / \"firewall\" named but not described (NE.).", "Calling a trojan self-replicating."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.10 symmetric ciphers (Caesar, Vernam); 4.9.4.2 HTTPS and SSH use these keys; 4.9.2.3 WPA2; 4.7.1.1 Harvard architecture stops data executing; 4.13 secure coding and testing; 4.8.1 the Computer Misuse Act." } }
  ],
  flashcards: [
    ["Packet filtering?", "The firewall checks packet headers (IP, port, protocol) against rules to block or allow."],
    ["Stateful inspection?", "Tracks current connections; only allows packets belonging to them."],
    ["Proxy server?", "Makes requests on clients' behalf so external computers never reach LAN devices directly."],
    ["Symmetric encryption?", "One shared key encrypts and decrypts; fast; key exchange problem."],
    ["Asymmetric encryption?", "Public/private key pair; encrypt with the recipient's public key, decrypt with their private key."],
    ["Digital signature?", "A hash of the message encrypted with the sender's private key."],
    ["How is a signature verified?", "Decrypt it with the sender's public key; re-hash the message; compare digests."],
    ["Digital certificate?", "A CA-signed binding of an owner's identity to their public key."],
    ["Virus vs worm vs trojan?", "Virus attaches to files and needs running; worm self-replicates over networks; trojan disguised as legit software."],
    ["Code-quality defence against worms?", "Prevent buffer overflows; review and test code; patched libraries."]
  ],
  quiz: [
    { q: "A digital signature is created with", opts: ["the sender's private key", "the sender's public key", "the receiver's public key", "a shared symmetric key"], ans: 0, why: "Only the sender could." },
    { q: "To keep a message secret for B, encrypt with", opts: ["B's public key", "B's private key", "A's private key", "A's public key"], ans: 0, why: "Only B decrypts." },
    { q: "Malware that spreads across networks on its own is a", opts: ["worm", "virus", "trojan", "cookie"], ans: 0, why: "Self-replicating, standalone." },
    { q: "A firewall at the network edge filters by", opts: ["IP addresses and ports", "MAC addresses", "SSIDs", "file names only"], ans: 0, why: "R. MAC." }
  ]
};

/* =====================================================================
   4.9.4.1  TCP/IP
   ===================================================================== */
C["compsci:4.9.4.1"] = {
  notes: [
    { h: "TCP/IP — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.1)", body: ["Describe the role of the four layers of the **TCP/IP stack** (application, transport, network, link)", "The role of **sockets**.", "The role of **MAC addresses**.", "What **well-known ports** and **client ports** are used for and how they differ."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How the transport layer picks the application", "Explain", "1", "A-level 2019 Q02.2"],
      ["One function of the network layer", "Describe", "1", "A-level 2019 Q02.3"],
      ["Role of the transport layer sending an email", "Describe", "3", "A-level 2023 Q11.1"],
      ["Well-known port: what and why", "Explain", "2", "A-level 2023 Q11.4"],
      ["Each layer putting a file onto the network (essay)", "Describe", "12", "A-level 2024 Q05.1 — with 4.7.4.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The four layers**.", "**Ports, sockets and MAC addresses**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The four layers" },
    { fig: { w: 640, h: 244, items: (function () {
      var it = [];
      [["Application", "HTTP, SMTP, FTP, SSH, DNS", "data", "accent"], ["Transport", "TCP / UDP: segments, ports", "TCP hdr | data", "accent2"], ["Network (Internet)", "IP: packets, IP addresses, routing", "IP hdr | TCP hdr | data", "good"], ["Link", "Ethernet / Wi-Fi: frames, MAC addresses", "MAC hdr | IP | TCP | data | trailer", "muted"]].forEach(function (l, i) {
        var y = 14 + i * 56;
        it = it.concat(boxAt(10, y, 210, 46, l[0], l[3], l[1]));
        it = it.concat(boxAt(250 + i * 18, y + 8, 370 - i * 18, 30, l[2], l[3]));
      });
      it.push({ line: [[235, 20], [235, 220]], arrow: true, c: "accent2", w: 1.8 }, txt(242, 232, "sending: each layer adds its header (encapsulation); receiving: removes it", { pos: "e", off: 0, size: 10.5 }));
      return it;
    })(), cap: "The TCP/IP stack and encapsulation: going down, each layer wraps the data from the layer above in its own header." } },
    { table: { head: ["Layer", "Role", "Unit", "Addresses"], rows: [
      ["**Application**", "provides **services to applications**; the protocol for the job (HTTP, SMTP, POP3, FTP, SSH) formats the data", "message / data", "—"],
      ["**Transport**", "**splits data into segments** (and reassembles them in order); adds **port numbers** to identify the application; **TCP** sets up an **end-to-end connection**, **acknowledges** segments, **retransmits** lost / corrupted ones (checksums), and does **flow and congestion control**", "segment", "port numbers"],
      ["**Network** (Internet)", "**encapsulates segments in packets/datagrams** with **source and destination IP addresses**; **routes** each packet — selects the next hop; checksum on the header", "packet / datagram", "IP addresses"],
      ["**Link**", "moves frames across **one physical link**: adds **source and destination MAC addresses** for this hop; the network card puts the bits on the medium (cable, radio)", "frame", "MAC addresses"]
    ] } },
    { callout: { t: "miscon", h: "TCP vs UDP — side by side", body: "**TCP**: connection-oriented, reliable (ACKs, retransmission, ordering) — web, email, files. **UDP**: connectionless, no guarantees, lower latency — video calls, games, DNS. Both live in the transport layer and both use ports." } },

    { page: "Ports, sockets and MAC addresses" },
    { kv: [
      ["Port", "a number (0–65 535) identifying which **application / process** on a host the data is for"],
      ["Well-known port", "a **reserved** port number (0–1023) assigned by **IANA** to a standard service, so a client knows where to find it: HTTP 80, HTTPS 443, SMTP 25, POP3 110, FTP 20/21, SSH 22, DNS 53"],
      ["Client (ephemeral) port", "a **temporary** high-numbered port chosen by the client's OS for one connection, so replies return to the right program"],
      ["Socket", "the **combination of an IP address and a port number** (`192.168.0.4:51234`) — one endpoint of a connection; a connection is identified by its two sockets"],
      ["MAC address", "a 48-bit **physical address** assigned to a network interface card by its manufacturer; used by the **link layer** to deliver frames within one network / hop"]
    ] },
    { callout: { t: "def", h: "Why servers use well-known ports", body: "Communication is **initiated by the client**, which must know where to send its first request. A mail client sends to port 25 because every SMTP server listens there; the server replies to the client's ephemeral port, which it learns from the request." } },
    { callout: { t: "miscon", h: "Side by side: MAC vs IP", body: "**MAC**: fixed to the hardware, **local** — changes at every hop as routers re-frame the packet. **IP**: logical, **end to end** — stays the same across the Internet (except where NAT rewrites it, 4.9.4.8)." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Which application gets it?", src: "A-level June 2019 · P2 Q02.2 · 1 mark",
      q: "Explain how the transport layer of the TCP/IP stack determines which application-layer software on the server should deal with a received request.",
      steps: [{ m: "It uses the port number in the request — e.g. port 25 → the SMTP email server software;", mk: "1 mark" }], result: "Port number" } },
    { worked: { tag: "exam", title: "One network-layer function", src: "A-level June 2019 · P2 Q02.3 · 1 mark",
      q: "Describe one function of the network layer of the TCP/IP stack.",
      steps: [{ m: "Adds the source and destination IP addresses to the datagrams // performs routing — selects the next host / hop for each datagram;", mk: "1 mark", n: "Also: header checksum; encapsulating data into datagrams. R. MAC address. NE. \"adds IP address\"; NE. \"determines where to send data\"." }], result: "IP addressing / routing" } },
    { worked: { tag: "exam", title: "The transport layer sending an email", src: "A-level June 2023 · P2 Q11.1 · 3 marks",
      q: "Describe the role that will be played by the transport layer of the TCP/IP stack in the transmission of an email from Computer A to an email server.",
      steps: [
        { m: "Establishes an end-to-end connection between the computer and the email server;", mk: "1 mark", n: "NE. virtual path / circuit." },
        { m: "Splits the data into segments, adding header information including segment (sequence) numbers so they can be reassembled in order;", mk: "1 mark" },
        { m: "Adds the port number so the data is passed to the email server application; performs error detection and requests corrupted segments are resent // acknowledgements, flow control;", mk: "1 mark" }
      ], result: "Connect, segment, port, reliability" } },
    { worked: { tag: "exam", title: "Well-known ports", src: "A-level June 2023 · P2 Q11.4 · 2 marks",
      q: "The email servers involved use well-known ports. Explain what a well-known port is and why an email server must use one.",
      steps: [{ h: "What", m: "A reserved port number with a specific purpose, assigned by IANA;", mk: "1 mark" }, { h: "Why", m: "communication is initiated by the sender / client, so the port number must be the same for all initial email communications — the client must know where to connect;", mk: "1 mark" }], result: "Reserved number; client starts the conversation" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe the role of a layer", "Its job + the header/address it adds (transport: segments, ports, reliability; network: IP, routing; link: MAC, frames)."],
      ["Explain (port selection)", "Port number identifies the application."],
      ["Explain well-known vs client ports", "Reserved and fixed (server) vs temporary and per connection (client)."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"All Turtles Never Leap\"", body: "**A**pplication, **T**ransport, **N**etwork, **L**ink — top to bottom. Addresses: transport → **ports**, network → **IP**, link → **MAC**. Socket = **IP + port**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["MAC addresses in the network layer (R.).", "\"Adds IP address\" without source/destination (NE.).", "Calling a socket just a port.", "Sending packets \"directly to the destination\" at the link layer."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.3.1 routing and packet fields; 4.9.4.2 application protocols and their ports; 4.9.4.8 NAT rewrites IP and port; 4.9.2.3 MAC allow lists; 4.7.4.2 the 2024 file-server essay; 4.1.2 layering is abstraction." } }
  ],
  flashcards: [
    ["Four TCP/IP layers?", "Application, transport, network (Internet), link."],
    ["Role of the transport layer?", "Segments data, adds ports, end-to-end connection, ACKs/retransmission, ordering, flow control."],
    ["Role of the network layer?", "Adds source/destination IP addresses to packets and routes them hop by hop."],
    ["Role of the link layer?", "Moves frames across one physical link using MAC addresses."],
    ["What is a socket?", "An IP address + port number — one endpoint of a connection."],
    ["Well-known port?", "A reserved port (0–1023) assigned by IANA to a standard service."],
    ["Client port?", "A temporary port chosen by the client OS for one connection."],
    ["Why do servers use well-known ports?", "Clients initiate contact and must know where to send the first request."],
    ["MAC address?", "A 48-bit hardware address of a NIC, used by the link layer within one network."],
    ["Ports for HTTP, HTTPS, SMTP, POP3, SSH?", "80, 443, 25, 110, 22."]
  ],
  quiz: [
    { q: "Which layer adds port numbers?", opts: ["transport", "network", "link", "application"], ans: 0, why: "Segments carry ports." },
    { q: "Routing happens in the", opts: ["network layer", "link layer", "transport layer", "application layer"], ans: 0, why: "IP." },
    { q: "A socket is", opts: ["an IP address plus a port", "a MAC address", "a cable", "a port alone"], ans: 0, why: "Endpoint." },
    { q: "The well-known port for HTTPS is", opts: ["443", "80", "25", "22"], ans: 0, why: "IANA." }
  ]
};

/* =====================================================================
   4.9.4.2  Standard application layer protocols
   ===================================================================== */
C["compsci:4.9.4.2"] = {
  notes: [
    { h: "Standard application layer protocols — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.2)", body: ["Be familiar with **FTP, HTTP, HTTPS, POP3, SMTP, SSH**.", "FTP client and server with **anonymous and non-anonymous** access.", "**SSH** for remote management, and using an SSH client to make a TCP connection to a remote port and send application-level commands (HTTP **GET**, SMTP commands, POP3)", "The roles of an **email server**, a **web server** and a **web browser**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Two protocols an email + remote-managed server needs", "State and explain", "4", "A-level 2019 Q02.1"],
      ["Two protocols with different purposes for an email", "State", "4", "A-level 2023 Q11.3"],
      ["Protocol in a URL", "State", "1", "A-level 2024 Q07.1 — see 4.9.3.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The six protocols**.", "**Email, web and remote management in action**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The six protocols" },
    { table: { head: ["Protocol", "Port", "Purpose"], rows: [
      ["**HTTP** — Hypertext Transfer Protocol", "80", "a browser requests web pages and resources from a web server (GET, POST …); plain text"],
      ["**HTTPS** — HTTP Secure", "443", "HTTP inside an **encrypted (TLS)** connection, with the server authenticated by its **digital certificate** (4.9.3.2)"],
      ["**FTP** — File Transfer Protocol", "21 (control), 20 (data)", "transfers files between an FTP **client** and an FTP **server** — upload, download, list, delete"],
      ["**SMTP** — Simple Mail Transfer Protocol", "25 (587)", "**sends** email: client → its mail server, and **server → server**"],
      ["**POP3** — Post Office Protocol v3", "110", "**retrieves** email from the mail server to a client (typically downloading and deleting); **IMAP** (143) keeps mail on the server and synchronises it"],
      ["**SSH** — Secure Shell", "22", "**encrypted remote login and command execution** for managing a remote computer; can also tunnel other protocols"]
    ] } },
    { kv: [
      ["Anonymous FTP", "anyone can log in (user name `anonymous`) — used to distribute public files; usually read-only"],
      ["Non-anonymous FTP", "requires a user name and password — access to that user's own files, with upload rights"],
      ["Email server", "stores each user's mailbox; **receives** mail via SMTP from other servers, **forwards** outgoing mail via SMTP (looking up the recipient domain's mail server in DNS), and lets clients **retrieve** mail via POP3 / IMAP"],
      ["Web server", "stores web pages and resources and **serves them in text form** (HTML, CSS, JavaScript as text) in response to HTTP requests"],
      ["Web browser", "**requests** pages and their resources (images, scripts, style sheets) from web servers and **renders** them — laying out the HTML, applying CSS, running the JavaScript"]
    ] },

    { page: "Email, web and remote management in action" },
    { fig: { w: 640, h: 150, items: (function () {
      var it = [];
      it = it.concat(boxAt(10, 50, 125, 46, "Sender's client", "accent"));
      it = it.concat(boxAt(175, 50, 125, 46, "Sender's server", "accent2", "mail server"));
      it = it.concat(boxAt(340, 50, 125, 46, "Recipient's server", "accent2", "mail server"));
      it = it.concat(boxAt(505, 50, 125, 46, "Recipient's client", "accent"));
      it = it.concat(arrow(135, 73, 175, 73, "SMTP", { dy: -16 }), arrow(300, 73, 340, 73, "SMTP", { dy: -16 }), arrow(505, 73, 465, 73, "POP3 / IMAP", { c: "good", dy: -16 }));
      it.push(txt(320, 120, "DNS (MX record) tells the sender's server where the recipient's domain receives mail", { size: 10.5 }));
      return it;
    })(), cap: "Email: SMTP pushes the message to the recipient's server; POP3 or IMAP pulls it to the reader's client." } },
    { code: { lang: "text", src: "$ ssh admin@mail.example.com          # encrypted login, then run commands remotely\n$ ssh -p 22 admin@host 'df -h'        # execute one command on the remote computer\n\n# connecting to a remote port and speaking the application protocol by hand:\nGET /index.html HTTP/1.1               (HTTP, port 80)\nHost: www.example.com\n\nHELO client.example.com                (SMTP, port 25)\nMAIL FROM:<a@example.com>\nRCPT TO:<b@example.org>\nDATA\n\nUSER b                                 (POP3, port 110)\nPASS ********\nLIST\nRETR 1", cap: "Application protocols are text commands. An SSH (or telnet-style) client can open a TCP connection to a remote port and issue them directly." } },
    { callout: { t: "miscon", h: "Side by side: SMTP vs POP3/IMAP", body: "**SMTP sends / pushes** (client → server, server → server). **POP3 / IMAP retrieve / pull** (server → client). \"POP3 receives emails as they are sent\" is **TO.** — retrieval happens later, when the user collects mail." } },
    { callout: { t: "miscon", h: "SSH vs telnet", body: "Both give remote command lines; **SSH encrypts** the session (including the password), telnet sends everything in plain text. For \"secure remote management\" only SSH (or RDP) earns the mark." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Protocols for an email server managed remotely", src: "A-level June 2019 · P2 Q02.1 · 4 marks",
      q: "A server's primary role will be to act as an email server; it will also let technicians log in remotely to manage it. State the names of two application-layer protocols the server must implement and explain what each will be used for.",
      steps: [
        { h: "Protocol 1", m: "SMTP (Simple Mail Transfer Protocol);", mk: "1 mark" },
        { h: "Use", m: "to send / receive emails to and from other email servers and clients;", mk: "1 mark" },
        { h: "Protocol 2", m: "SSH (Secure Shell);", mk: "1 mark" },
        { h: "Use", m: "so technicians can execute commands on the server over a secure, encrypted connection for remote management;", mk: "1 mark", n: "Also: POP3/IMAP (clients retrieve mail); HTTP/HTTPS (webmail, control panels). NE. \"to log in remotely\". R. TCP, IP (not application layer)." }
      ], result: "SMTP; SSH" } },
    { worked: { tag: "exam", title: "Two email protocols, different purposes", src: "A-level June 2023 · P2 Q11.3 · 4 marks",
      q: "State the name and purpose of two application-layer protocols that will be used to transfer an email from Computer A to Computer B. Each must have a different purpose.",
      steps: [
        { m: "SMTP;", mk: "1 mark" },
        { m: "to send / transmit the email (to and between email servers);", mk: "1 mark" },
        { m: "POP3 (or IMAP);", mk: "1 mark" },
        { m: "so the recipient's client can retrieve the email from the server;", mk: "1 mark", n: "R. POP3 for sending. POP3 and IMAP may both be named but their purposes must differ to score both." }
      ], result: "SMTP sends; POP3 retrieves" } },

    { worked: { tag: "variation", title: "Anonymous vs non-anonymous FTP", q: "A university publishes lecture recordings for anyone to download, and staff upload their own files to the same server. Explain how FTP access should be configured for each group.",
      steps: [
        { m: "The public use anonymous FTP — log in as \"anonymous\" with no account — with read-only access to the public folder;", mk: "1 mark" },
        { m: "Staff use non-anonymous FTP — their own username and password — with permission to upload and manage files in their own areas;", mk: "1 mark" },
        { m: "Plain FTP sends passwords unencrypted, so staff logins should use a secure variant (SFTP over SSH / FTPS);", mk: "1 mark" }
      ], result: "Anonymous read-only; authenticated upload" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State a protocol and its use", "Full name or initialism + its specific job (send / retrieve / transfer files / secure remote commands)."],
      ["Explain the role of a server / browser", "Email: store, receive, forward, let clients retrieve. Web: serve pages as text. Browser: request and render."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"SMTP = Send Mail To People; POP = Pick it uP\"", body: "Ports: \"**F**TP **21**, **S**SH **22**, **S**MTP **25**, **H**TTP **80**, **P**OP3 **110**, HTTP**S** **443**\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["TCP or IP given as application-layer protocols (R.).", "POP3 for sending (R.).", "Telnet for SECURE management.", "\"Log in remotely\" without commands/security (NE.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.1 ports and sockets; 4.9.3.2 HTTPS certificates and SSH keys; 4.9.3.1 DNS for mail routing; 4.9.4.10 REST runs over HTTP methods; 4.9.4.9 port forwarding to a web server." } }
  ],
  flashcards: [
    ["HTTP?", "Hypertext Transfer Protocol — browser requests web pages from a web server (port 80)."],
    ["HTTPS?", "HTTP over an encrypted TLS connection with certificate authentication (port 443)."],
    ["FTP?", "File Transfer Protocol — transfer files between client and server (ports 20/21)."],
    ["Anonymous vs non-anonymous FTP?", "Public login (often read-only) vs username + password access."],
    ["SMTP?", "Sends email client→server and server→server (port 25)."],
    ["POP3?", "Retrieves email from the server to the client (port 110)."],
    ["SSH?", "Encrypted remote login and command execution (port 22)."],
    ["Role of a web server?", "Stores and serves web pages/resources in text form in response to HTTP requests."],
    ["Role of a web browser?", "Requests pages and resources and renders them."],
    ["Role of an email server?", "Stores mailboxes; receives and forwards mail via SMTP; clients retrieve via POP3/IMAP."]
  ],
  quiz: [
    { q: "Which protocol retrieves email to a client?", opts: ["POP3", "SMTP", "FTP", "SSH"], ans: 0, why: "Pull." },
    { q: "Secure remote command execution uses", opts: ["SSH", "telnet", "HTTP", "FTP"], ans: 0, why: "Encrypted." },
    { q: "Which is NOT an application-layer protocol?", opts: ["TCP", "SMTP", "HTTP", "FTP"], ans: 0, why: "Transport layer." },
    { q: "HTTPS differs from HTTP by", opts: ["encrypting the connection and authenticating the server", "using UDP", "using port 80", "sending binary only"], ans: 0, why: "TLS." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
