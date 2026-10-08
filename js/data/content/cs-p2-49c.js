/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.9.4.3–
   4.9.4.11 (IP address structure, subnet masking, IPv4 and IPv6, public
   and private addresses, DHCP, NAT, port forwarding, the client-server
   model with WebSockets, CRUD, REST, JSON and XML, thin and thick clients)
   at full A-level depth. Each topic REPLACES the short entry the older
   file carried; every way AQA has examined it (7517/2 June 2017–2025) is
   explained, worked and answered in the mark scheme's own format. Every
   address, mask and host count was checked with Python's ipaddress
   module. Past-paper banks stay in bank-cs-49.js. */
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
  "Addressing answers must say WHICH address: private / public, source / destination, the router's / the computer's — \"NE. references to a public IP address\" without saying whose."
] } };

/* a home LAN behind a NAT router — reused */
function natFig(cap) {
  var it = [];
  it = it.concat(boxAt(20, 20, 130, 40, "PC", "accent", "192.168.0.4"));
  it = it.concat(boxAt(20, 75, 130, 40, "Web server", "accent", "192.168.0.2"));
  it = it.concat(boxAt(20, 130, 130, 40, "Laptop", "accent", "192.168.0.3"));
  it = it.concat(boxAt(230, 60, 140, 70, "Router", "accent2", "NAT · DHCP · switch"));
  it.push(txt(300, 145, "public IP 186.7.2.31", { b: true, c: "accent2", size: 11 }));
  [40, 95, 150].forEach(function (y) { it.push({ line: [[150, y], [230, 95]], c: "line", w: 1.4 }); });
  it = it.concat(boxAt(450, 60, 140, 70, "Internet", "good", "only public IPs routed"));
  it = it.concat(arrow(370, 95, 450, 95, null, { both: true }));
  it.push(txt(85, 186, "private (non-routable) addresses", { size: 10.5 }));
  return { fig: { w: 610, h: 200, items: it, cap: cap } };
}

/* =====================================================================
   4.9.4.3  IP address structure
   ===================================================================== */
C["compsci:4.9.4.3"] = {
  notes: [
    { h: "IP address structure — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.3)", body: "Know that an IP address is split into a **network identifier** part and a **host identifier** part." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Suitable IP addresses for router ports / hosts in a diagram", "State", "2–3", "A-level 2017 Q09.1, 2021 Q11.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Network ID and host ID**.", "**Choosing valid addresses**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Network ID and host ID" },
    { fig: { w: 600, h: 120, items: (function () {
      var it = [];
      it = it.concat(boxAt(20, 30, 360, 40, "192.168.2", "accent", null), boxAt(380, 30, 200, 40, "3", "accent2", null));
      it.push(txt(200, 18, "network ID (24 bits) — same for every host on the network", { size: 10.5, c: "accent" }), txt(480, 18, "host ID (8 bits)", { size: 10.5, c: "accent2" }));
      it.push(txt(300, 95, "11000000.10101000.00000010 | 00000011", { size: 12, c: "text", b: true }));
      return it;
    })(), cap: "An IPv4 address is 32 bits: the left part identifies the network, the right part the host on it. The subnet mask says where the split falls (4.9.4.4)." } },
    { kv: [
      ["IPv4 address", "32 bits written as four decimal octets (dotted decimal), each 0–255"],
      ["Network identifier", "the leftmost bits — **shared by every device on the same network / subnet**; routers route on it"],
      ["Host identifier", "the remaining bits — **unique to each device** on that network"],
      ["Reserved host values", "host ID **all 0s** = the network's own address; **all 1s** = the broadcast address — neither can be given to a device"]
    ] },
    { callout: { t: "miscon", h: "The split is not fixed at the dots", body: "It falls wherever the subnet mask says — after 24 bits (/24), 20 bits (/20), 27 bits (/27)… A /20 network ID ends half-way through the third octet." } },

    { page: "Choosing valid addresses" },
    { steps: [
      "Find the network's network ID and its prefix length (bits of network ID).",
      "Every host on it must have the **same network-ID bits**.",
      "Choose host bits that are **not all 0s and not all 1s**.",
      "For a /24 network 192.168.0.0: any 192.168.0.**x** with x from 1 to 254.",
      "For a /20 network 192.168.192.0: the third octet's top 4 bits are fixed (1100), so the third octet runs **192–207** and the fourth 0–255 — excluding 192.168.192.0 (network) and 192.168.207.255 (broadcast)."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Addresses for two router ports", src: "A-level June 2017 · P2 Q09.1 · 2 marks",
      q: "A LAN uses IPv4. The 'Router and Firewall' port A is on network 192.168.0.0 and the 'Router 2' port B is on network 192.168.2.0 (each a /24 network). State suitable IP addresses for each port.",
      steps: [{ m: "A: 192.168.0.x where x is not 0 or 255 (e.g. 192.168.0.1);", mk: "1 mark" }, { m: "B: 192.168.2.x where x is not 0 or 255 (e.g. 192.168.2.1);", mk: "1 mark" }], result: "Same network ID; valid host ID" } },
    { worked: { tag: "exam", title: "Addresses on /20 subnets", src: "A-level June 2021 · P2 Q11.1 · 3 marks",
      q: "A network uses IPv4 with 20 bits for the network ID and 12 for the host ID. Router 1's port A is on subnet 192.168.192.0; Router 1's port B and computer C are on subnet 192.168.64.0. State suitable IP addresses for A, B and C.",
      steps: [
        { m: "A: 192.168.x.y with x in 192–207, y in 0–255 (e.g. 192.168.192.1);", mk: "1 mark", n: "R. 192.168.192.0 and 192.168.207.255." },
        { m: "B: 192.168.x.y with x in 64–79 (e.g. 192.168.64.1);", mk: "1 mark", n: "R. 192.168.64.0 and 192.168.79.255." },
        { m: "C: another address with x in 64–79, different from B (e.g. 192.168.64.20);", mk: "1 mark", n: "R. the same answer as B." }
      ], result: "Third octet 192–207 / 64–79" } },

    { worked: { tag: "variation", title: "Valid host or not?", q: "Network 192.168.64.0/20. For each, say whether it can be given to a device: (a) 192.168.70.9 (b) 192.168.79.255 (c) 192.168.80.1 (d) 192.168.64.0.",
      steps: [
        { m: "(a) yes — third octet 70 is in 64–79 and the host bits are neither all 0s nor all 1s", mk: "1 mark" },
        { m: "(b) no — 192.168.79.255 has every host bit 1: the broadcast address", mk: "1 mark" },
        { m: "(c) no — third octet 80 = 0101 0000: its top four bits differ, so it is on another network", mk: "1 mark" },
        { m: "(d) no — every host bit 0: the network address", mk: "1 mark" }
      ], result: "Only (a)" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State a suitable IP address", "Same network-ID bits as its network; host bits not all 0s / all 1s; different from other devices."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Street then House\"", body: "The network ID is the **street** (everyone on it shares it); the host ID is the **house number** (unique on the street). House 0 is the street's name, the last house number is the megaphone (broadcast)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Host ID 0 or 255 (in a /24) — the network or broadcast address.", "Giving two devices the same address.", "Assuming the split is always at a dot."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.4 subnet masks find the network ID; 4.5.2 binary and denary; 4.9.3.1 routers route on network IDs; 4.9.4.6 private ranges such as 192.168.0.0." } }
  ],
  flashcards: [
    ["Network address of 192.168.200.5/20?", "192.168.192.0."],
    ["Broadcast address of 192.168.64.0/20?", "192.168.79.255."],
    ["What do hosts on one network share?", "The network ID.", 3],
    ["Which host IDs cannot be assigned?", "All 0s (network address) and all 1s (broadcast address).", 4],
    ["How many bits in an IPv4 address?", "32.", 5],
    ["In a /20 network 192.168.64.0, the third octet ranges over…", "64–79.", 6],
    ["Valid host for 192.168.0.0/24?", "192.168.0.1 to 192.168.0.254.", 7]
  ],
  quiz: [
    { q: "Which can be a host on 192.168.2.0/24?", opts: ["192.168.2.17", "192.168.2.0", "192.168.2.255", "192.168.3.1"], ans: 0, why: "Valid host ID." },
    { q: "The network ID is", opts: ["shared by all hosts on the network", "unique to each host", "always the last octet", "the MAC address"], ans: 0, why: "Definition." },
    { q: "/20 means", opts: ["20 bits of network ID", "20 hosts", "20 subnets", "20 octets"], ans: 0, why: "Prefix length." },
    { q: "Host ID all 1s is the", opts: ["broadcast address", "network address", "gateway", "DNS server"], ans: 0, why: "Reserved." }
  ]
};

/* =====================================================================
   4.9.4.4  Subnet masking
   ===================================================================== */
C["compsci:4.9.4.4"] = {
  notes: [
    { h: "Subnet masking — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.4)", body: "Know that networks can be divided into **subnets** and how a **subnet mask** is used to identify the **network identifier** part of an IP address." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Write the mask in binary", "Write", "1", "A-level 2018 Q05.1"],
      ["Maximum devices on a subnet", "What is", "1", "A-level 2018 Q05.2"],
      ["Which mask is assigned", "Shade", "1", "A-level 2021 Q11.2"],
      ["Using the mask to decide LAN or router", "Explain (essay part)", "—", "A-level 2020 Q05.4 — worked in 4.9.3.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The mask and the AND**.", "**Counting hosts**.", "**Same subnet or not?**", "**In exam questions**.", "**Exam toolkit**."] },
    { diagram: "subnet-lab" },

    { page: "The mask and the AND" },
    { kv: [
      ["Subnet", "a logical sub-division of a network; devices on one subnet communicate directly, others via a router"],
      ["Subnet mask", "a 32-bit pattern of **1s for every network-ID bit followed by 0s for every host-ID bit** (e.g. /27 = 27 ones, 5 zeros = 255.255.255.224)"],
      ["Finding the network ID", "**bitwise AND** the IP address with the mask: host bits become 0, network bits survive"]
    ] },
    { table: { head: ["", "Binary", "Dotted decimal"], rows: [
      ["IP address", "11000000.10101000.00000010.00000011", "192.168.2.3"],
      ["Mask (/24)", "11111111.11111111.11111111.00000000", "255.255.255.0"],
      ["AND → network ID", "11000000.10101000.00000010.00000000", "**192.168.2.0**"]
    ] } },
    { table: { head: ["Prefix", "Mask", "Last octet / third octet in binary"], rows: [
      ["/24", "255.255.255.0", "…11111111.00000000"],
      ["/20", "255.255.240.0", "…11110000.00000000"],
      ["/27", "255.255.255.224", "…11111111.11100000"]
    ] } },
    { callout: { t: "miscon", h: "255.255.15.0 is not a mask", body: "A mask's 1s must be **contiguous from the left**. 15 = 00001111 puts 0s before 1s, so 255.255.15.0 is invalid — a /20 mask is 255.255.**240**.0 (A-level 2021 Q11.2)." } },

    { page: "Counting hosts" },
    { callout: { t: "formula", h: "Hosts per subnet", body: "With $h$ host bits: $2^h$ addresses, of which **$2^h − 2$** can be given to devices (all-0s network and all-1s broadcast are reserved). /27 → $h = 5$ → $2^5 − 2 = 30$. /24 → 254. /20 → 4094." } },

    { page: "Same subnet or not?" },
    { steps: [
      "AND the **sender's** IP with the mask → its network ID.",
      "AND the **destination's** IP with the same mask → its network ID.",
      "**Equal** → same subnet: send the frame directly across the LAN (using the destination's MAC address).",
      "**Different** → send it to the **default gateway (router)** to be routed."
    ] },
    { table: { head: ["", "Computer A", "Computer B"], rows: [
      ["IP", "192.168.2.3", "141.134.27.8"],
      ["AND 255.255.255.0", "192.168.2.0", "141.134.27.0"],
      ["Verdict", "different network IDs → via the router", ""]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "The /27 mask in binary", src: "A-level June 2018 · P2 Q05.1 · 1 mark",
      q: "A company LAN is divided into subnets: 27 bits are allocated to the network / subnet identifier. In binary, write out the subnet mask programmed into the devices.",
      steps: [{ m: "**11111111 11111111 11111111 11100000** (27 ones, 5 zeros = 255.255.255.224)", mk: "1 mark" }], result: "27 ones, 5 zeros" } },
    { worked: { tag: "exam", title: "How many devices on subnet Z?", src: "A-level June 2018 · P2 Q05.2 · 1 mark",
      q: "Subnet Z consists of all devices directly connected to Switch B, with the 27-bit network ID. What is the maximum number of devices that could be connected to subnet Z at the same time?",
      steps: [{ m: "5 host bits → $2^5 − 2$ = **30**", mk: "1 mark", n: "A. 32, 2⁵, 31 or 2⁵ − 1 this time only." }], result: "30" } },
    { worked: { tag: "exam", title: "Which mask?", src: "A-level June 2021 · P2 Q11.2 · 1 mark",
      q: "20 bits are allocated to network IDs and 12 to host IDs. Which subnet mask has been assigned? A 255.255.0.0 · B 255.255.15.0 · C 255.255.240.0 · D 255.255.255.0.",
      steps: [{ m: "**C** 255.255.240.0 — 8 + 8 + 4 ones: 240 = 11110000;", mk: "1 mark" }], result: "C" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Write the mask in binary", "n ones then 32 − n zeros, all 32 bits."],
      ["How many devices", "2^(host bits) − 2."],
      ["Explain (same network?)", "AND each IP with the mask; compare network IDs; direct if equal, router if not."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Mask AND Match\"", body: "AND with the mask, then match the network IDs. Mask octets you must know: 128, 192, 224, 240, 248, 252, 254, 255 (1–8 leading ones)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Using OR instead of AND.", "Forgetting −2 for hosts.", "Non-contiguous masks (255.255.15.0).", "Writing fewer than 32 bits."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.4.1 / 4.7.3.5 bitwise AND as masking; 4.9.4.3 network and host IDs; 4.9.3.1 routers and the default gateway; 4.5.2 binary conversion." } }
  ],
  flashcards: [
    ["Mask written as a prefix: 255.255.255.0?", "/24."],
    ["How is the network ID found?", "Bitwise AND of the IP address and the subnet mask.", 2],
    ["/27 mask?", "255.255.255.224.", 3],
    ["/20 mask?", "255.255.240.0.", 4],
    ["Hosts in a /27?", "2⁵ − 2 = 30.", 5],
    ["How does a host decide to use the router?", "If its network ID differs from the destination's.", 7]
  ],
  quiz: [
    { q: "192.168.2.3 AND 255.255.255.0 =", opts: ["192.168.2.0", "192.168.2.3", "0.0.0.3", "255.255.255.3"], ans: 0, why: "Host bits zeroed." },
    { q: "Hosts on a /24 subnet:", opts: ["254", "256", "255", "24"], ans: 0, why: "2⁸ − 2." },
    { q: "Which is a valid mask?", opts: ["255.255.240.0", "255.255.15.0", "255.0.255.0", "0.255.255.255"], ans: 0, why: "Contiguous ones." },
    { q: "Different network IDs mean the packet goes", opts: ["to the default gateway", "directly to the host", "nowhere", "to the DNS server"], ans: 0, why: "Needs routing." }
  ]
};

/* =====================================================================
   4.9.4.5  IP standards
   ===================================================================== */
C["compsci:4.9.4.5"] = {
  notes: [
    { h: "IP standards: IPv4 and IPv6 — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.5)", body: "Know that there are two standards of IP address, **v4** and **v6**, and why **v6** was introduced." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["One reason IPv6 replaced IPv4", "State", "1", "A-level 2021 Q11.3"],
      ["Why IPv6 makes NAT unnecessary", "Explain", "1", "A-level 2024 Q07.7"],
      ["IPv4 shortage, public/private, NAT, DHCP (essay)", "Explain", "12", "A-level 2025 Q08"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The two standards**.", "**In exam questions**, including the 12-mark essay.", "**Exam toolkit**."] },

    { page: "The two standards" },
    { table: { head: ["", "IPv4", "IPv6"], rows: [
      ["Length", "**32 bits** (4 bytes)", "**128 bits** (16 bytes)"],
      ["Addresses", "$2^{32}$ ≈ 4.3 billion", "$2^{128}$ ≈ 3.4 × 10³⁸"],
      ["Notation", "dotted decimal: 192.168.0.4", "8 groups of 4 hex digits: 2001:0db8:0000:0000:0000:ff00:0042:8329 (zeros compressible: 2001:db8::ff00:42:8329)"],
      ["NAT", "needed — not enough public addresses", "unnecessary — every device can have a public address"],
      ["Configuration", "DHCP", "can self-configure (SLAAC) without DHCP"]
    ] } },
    { callout: { t: "def", h: "Why IPv6 was introduced", body: "IPv4's 32 bits allow only about 4.3 billion addresses — **not enough for every device** (phones, IoT, servers) to have a unique public address; the supply has run out. IPv6's 128 bits give enough for every device in the world, ending the need for NAT and restoring **end-to-end connectivity**; it also simplifies routing, improves multicasting, allows bigger packets, auto-configuration and roaming with one address." } },
    { callout: { t: "miscon", h: "\"More addresses\" vs \"enough addresses\"", body: "For A-level 2024 Q07.7, **NE.** \"there are more IPv6 addresses\" — say there are **enough for every device to have a unique public (routable) address**, so translation is not needed." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Why IPv6", src: "A-level June 2021 · P2 Q11.3 · 1 mark",
      q: "The devices on a network use IPv4. State one reason why IPv6 has been introduced to replace IPv4.",
      steps: [{ m: "There are not enough unique addresses in IPv4 — they are running out;", mk: "1 mark", n: "Also: eliminates NAT / end-to-end connectivity; simpler routing; multicasting; auto-configuration without DHCP; bigger packets; roaming; traffic prioritisation." }], result: "IPv4 addresses ran out" } },
    { worked: { tag: "exam", title: "Why IPv6 ends NAT", src: "A-level June 2024 · P2 Q07.7 · 1 mark",
      q: "The replacement of IPv4 with IPv6 would mean that NAT is no longer necessary. Explain why.",
      steps: [{ m: "There are enough IPv6 addresses for every device in the world to have a unique public / routable address;", mk: "1 mark", n: "NE. \"there are more IPv6 addresses\"." }], result: "Every device can be public" } },
    { worked: { tag: "exam", title: "IPv4 shortage and its remedies (12-mark essay)", src: "A-level June 2025 · P2 Q08 · 12 marks",
      q: "IPv4 does not provide enough unique addresses for every connected device; IPv6 is the long-term fix and public/private addresses, NAT and DHCP help in the short term. Explain: why IPv4 has too few addresses and how IPv6 overcomes this; public vs private addresses; how NAT works and helps; how DHCP works and helps.",
      steps: [
        { h: "1 · IPv4 vs IPv6", m: "IPv4 addresses are 32 bits, giving at most 2³² ≈ 4.3 billion addresses — fewer than the number of connected devices. IPv6 uses 128 bits (16 bytes, four times as many), giving 2¹²⁸ addresses — enough for every device.", mk: "area 1" },
        { h: "2 · Public / private", m: "A public address is globally unique and routable on the Internet; a private address (e.g. 192.168.x.x, 10.x.x.x) is unique only within its LAN and is not routed on the Internet — so the same private ranges are reused in millions of LANs.", mk: "area 2" },
        { h: "3 · NAT", m: "The router holds one public address. When a LAN device sends out, the router replaces the private source IP (and port) with its public IP and a port it generates, recording the mapping in a translation table; replies to that port are looked up and forwarded to the private address. So a whole LAN shares one public address.", mk: "area 3" },
        { h: "4 · DHCP", m: "A joining host broadcasts a discover; a DHCP server offers an IP address (with mask, gateway, DNS) from a pool; the host requests it; the server acknowledges. Addresses are leased and returned to the pool when not needed — so a limited set of addresses is reused efficiently.", mk: "area 4" },
        { m: "Link each mechanism back to the shortage.", mk: "10–12: all four areas, three in good depth" }
      ], result: "32 vs 128 bits; reuse; share; lease" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State why IPv6", "Not enough IPv4 addresses (or another listed benefit)."],
      ["Explain (no NAT)", "Enough addresses for every device to be unique/public."],
      ["Quantify", "32 vs 128 bits; 2³² vs 2¹²⁸."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"4 is Few, 6 is Plenty\"", body: "IPv**4** = **4** bytes; IPv**6** = **16** bytes. 2³² ≈ 4 billion < people on Earth; 2¹²⁸ ≈ every grain of sand, many times over." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"More addresses\" without \"enough for every device\" (NE.).", "IPv6 = 64 bits (it is 128).", "Thinking IPv6 changes MAC addresses."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.1 powers of 2; 4.5.2 hexadecimal (IPv6 notation); 4.9.4.6–4.9.4.8 private addresses, DHCP, NAT — the IPv4 stop-gaps." } }
  ],
  flashcards: [
    ["What problem do private addresses, NAT and DHCP ease for IPv4?", "The shortage of unique public addresses."],
    ["Name two IPv6 benefits besides more addresses.", "No NAT (end-to-end), simpler routing, auto-configuration, multicast, bigger packets."],
    ["How many bytes in an IPv6 address?", "16."],
    ["IPv4 length?", "32 bits — about 4.3 billion addresses.", 6],
    ["IPv6 length?", "128 bits — 2¹²⁸ addresses.", 7],
    ["Why was IPv6 introduced?", "IPv4 does not have enough unique addresses for every device.", 8],
  ],
  quiz: [
    { q: "IPv6 addresses are written in", opts: ["hexadecimal groups separated by colons", "dotted decimal", "binary only", "MAC format"], ans: 0, why: "See the notes." },
    { q: "IPv6 addresses are written in", opts: ["hexadecimal groups separated by colons", "dotted decimal", "binary only", "MAC format"], ans: 0, why: "See the notes." },
    { q: "IPv6 addresses are", opts: ["128 bits", "32 bits", "64 bits", "48 bits"], ans: 0, why: "16 bytes." },
    { q: "IPv6 makes NAT unnecessary because", opts: ["every device can have a unique public address", "it is faster", "it uses MAC addresses", "it encrypts"], ans: 0, why: "Enough addresses." },
    { q: "2³² is about", opts: ["4.3 billion", "65 thousand", "4.3 million", "340 undecillion"], ans: 0, why: "4 294 967 296." }
  ]
};

/* =====================================================================
   4.9.4.6  Public and private IP addresses
   ===================================================================== */
C["compsci:4.9.4.6"] = {
  notes: [
    { h: "Public and private IP addresses — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.6)", body: "Distinguish between **routable** and **non-routable** IP addresses." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How many computers share one IP address yet communicate", "Explain", "2", "A-level 2020 Q05.2"],
      ["Public vs private (essay area)", "Explain", "—", "A-level 2025 Q08 — worked in 4.9.4.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Routable and non-routable**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Routable and non-routable" },
    natFig("A home LAN: devices hold private addresses; only the router's public address is seen on the Internet."),
    { table: { head: ["", "Public (routable)", "Private (non-routable)"], rows: [
      ["Uniqueness", "**globally unique**", "unique only **within its own LAN / private network**"],
      ["Routing", "routers on the Internet **forward** packets to it", "Internet routers **will not route** packets addressed to it"],
      ["Assigned by", "ISPs / Internet registries", "the network's own administrator or DHCP server"],
      ["Ranges", "everything else", "**10.0.0.0/8**, **172.16.0.0/12**, **192.168.0.0/16**"],
      ["Reached from outside", "directly", "only through **NAT / port forwarding** at the router"]
    ] } },
    { callout: { t: "def", h: "Why private ranges exist", body: "Because private addresses are never routed on the Internet, **every LAN can reuse the same ranges** — millions of homes use 192.168.0.x at once — saving scarce IPv4 public addresses. They also hide internal devices from direct outside access." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Many computers, one address", src: "A-level June 2020 · P2 Q05.2 · 2 marks",
      q: "Computer A has the IP address 192.168.2.3. Many other computers connected to the Internet have the same IP address. Explain how two or more computers connected to the Internet can have the same IP address and still communicate with each other.",
      steps: [
        { m: "192.168.2.3 is a private / non-routable IP address — unique only within its own LAN;", mk: "1 mark", n: "NE. \"they are on different networks\"." },
        { m: "NAT is performed: as data passes onto the Internet the private address is replaced by the public IP address of the router / gateway;", mk: "1 mark" }
      ], result: "Private + NAT" } },

    { worked: { tag: "variation", title: "Public or private?", q: "Classify: (a) 10.4.2.1 (b) 172.20.0.5 (c) 172.32.0.5 (d) 192.168.0.2 (e) 141.134.27.8.",
      steps: [
        { m: "(a) private — 10.0.0.0/8", mk: "1 mark" },
        { m: "(b) private — 172.16.0.0/12 covers 172.16–172.31", mk: "1 mark" },
        { m: "(c) public — 172.32 is just outside the /12 range", mk: "1 mark" },
        { m: "(d) private — 192.168.0.0/16; (e) public", mk: "1 mark" }
      ], result: "a, b, d private" } },
    { worked: { tag: "variation", title: "Why reuse private ranges?", q: "Explain why millions of home networks can all use addresses in 192.168.0.0/16 at the same time, and one benefit of doing so.",
      steps: [
        { m: "Private addresses are only unique within their own LAN and are never routed on the Internet, so the same addresses can be reused in every LAN without clashing;", mk: "1 mark" },
        { m: "each LAN reaches the Internet through its router's single public address (NAT), saving scarce public IPv4 addresses;", mk: "1 mark" }
      ], result: "Non-routable → reusable" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Distinguish public / private", "Globally unique and routed vs locally unique and not routed."],
      ["Explain (shared address)", "Private address + NAT swaps it for the router's public address."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"10, 172.16, 192.168 stay at home\"", body: "The three private ranges never leave the LAN; everything else is public." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Different networks\" without private/non-routable (NE.).", "Thinking private addresses are secret or encrypted."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.8 NAT; 4.9.4.9 port forwarding; 4.9.4.5 why IPv4 needed this; 4.9.3.2 hiding internal hosts helps security." } }
  ],
  flashcards: [
    ["Who assigns public addresses?", "ISPs / Internet registries."],
    ["How can a device with a private address be reached from outside?", "Through the router via NAT / port forwarding."],
    ["Is 172.20.0.5 public or private?", "Private (172.16.0.0/12)."],
    ["Three private ranges?", "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.", 8],
    ["Why can many LANs use 192.168.0.4?", "It is private (non-routable); NAT swaps it for a public address at the router.", 9],
    ["Why do private ranges exist?", "To reuse addresses and save scarce public IPv4 addresses.", 10]
  ],
  quiz: [
    { q: "172.32.0.5 is", opts: ["public", "private", "a MAC address", "a broadcast address"], ans: 0, why: "See the notes." },
    { q: "172.32.0.5 is", opts: ["public", "private", "a MAC address", "a broadcast address"], ans: 0, why: "See the notes." },
    { q: "Which is private?", opts: ["192.168.1.10", "8.8.8.8", "141.134.27.8", "186.7.2.31"], ans: 0, why: "192.168/16." },
    { q: "Internet routers will", opts: ["not route private addresses", "route private addresses", "encrypt private addresses", "convert them to MAC"], ans: 0, why: "Non-routable." },
    { q: "Many homes can share 192.168.0.4 because", opts: ["it is private and NAT translates it", "IPv6 is used", "DNS resolves it", "it is a MAC address"], ans: 0, why: "2020 Q05.2." }
  ]
};

/* =====================================================================
   4.9.4.7  DHCP
   ===================================================================== */
C["compsci:4.9.4.7"] = {
  notes: [
    { h: "DHCP — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.7)", body: "Understand the purpose and function of the **Dynamic Host Configuration Protocol (DHCP)** system." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Purpose, why used, the exchange", "Explain", "4", "A-level 2018 Q05.3"],
      ["One advantage of DHCP", "State", "1", "A-level 2020 Q05.1"],
      ["Why not DHCP for a web server", "Explain", "1", "A-level 2024 Q07.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What DHCP does**.", "**The four messages**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What DHCP does" },
    { kv: [
      ["Purpose", "to **automate the configuration** of hosts joining a TCP/IP network — allocating each an **IP address**, **subnet mask**, **default gateway** (and DNS server)"],
      ["Why", "no expert knowledge or time needed to configure each host; **avoids errors** such as duplicate IP addresses or wrong masks; **reuses a limited pool** of IP addresses efficiently"],
      ["Lease", "an address is lent for a period; when it expires (or the device leaves) it returns to the pool for another device"]
    ] },
    { callout: { t: "warn", h: "\"Avoids errors\" alone is NE.", body: "Give the example: *two hosts being given the same IP address*, or *an incorrect subnet mask typed in*." } },

    { page: "The four messages" },
    { fig: { w: 600, h: 200, items: (function () {
      var it = [];
      it = it.concat(boxAt(30, 10, 130, 30, "New host", "accent"), boxAt(430, 10, 140, 30, "DHCP server", "accent2"));
      it.push({ line: [[95, 40], [95, 190]], c: "line", w: 1, dash: "3 4" }, { line: [[500, 40], [500, 190]], c: "line", w: 1, dash: "3 4" });
      it = it.concat(arrow(95, 60, 500, 75, "1 · DISCOVER (broadcast: any DHCP server?)"));
      it = it.concat(arrow(500, 100, 95, 115, "2 · OFFER (here is 192.168.0.7, mask, gateway)", { c: "good" }));
      it = it.concat(arrow(95, 135, 500, 150, "3 · REQUEST (I accept that offer)"));
      it = it.concat(arrow(500, 170, 95, 185, "4 · ACKNOWLEDGE (it's yours for the lease)", { c: "good" }));
      return it;
    })(), cap: "DORA: Discover, Offer, Request, Acknowledge." } },
    { steps: ["**Discover**: the host broadcasts a request to find a DHCP server.", "**Offer**: DHCP server(s) offer a configuration (IP address, mask, gateway).", "**Request**: the host accepts one offer, echoing it back to that server.", "**Acknowledge**: the server confirms the configuration has been allocated to the host."] },
    { callout: { t: "miscon", h: "Servers should not use dynamic addresses", body: "A web server reached through port forwarding needs a **fixed** address: if DHCP gave it a new one, the router would forward traffic to the wrong place. Fix: a **static** IP, or a DHCP **reservation** for its MAC address." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "DHCP when joining subnet Z", src: "A-level June 2018 · P2 Q05.3 · 4 marks",
      q: "When a device wishes to join subnet Z it communicates with the DHCP server. Explain the purpose of the DHCP system, why it is used, and what will happen during this communication.",
      steps: [
        { h: "Purpose", m: "To automate the configuration of hosts connecting to the network — allocating an IP address, subnet mask and default gateway;", mk: "1 mark" },
        { h: "Why", m: "It reduces the need for expert knowledge // makes efficient use of a limited pool of IP addresses // avoids errors such as duplicate IP addresses;", mk: "1 mark", n: "NE. \"avoiding errors\" without an example." },
        { h: "Communication", m: "The host sends a request to discover a DHCP server; the server offers a configuration;", mk: "1 mark" },
        { h: "Communication", m: "the host accepts the offer (echoing it back); the server confirms the configuration has been allocated;", mk: "1 mark", n: "Any two points in the correct order earn 2. NE. \"server gives IP address to host\"." }
      ], result: "Automatic config; DORA" } },
    { worked: { tag: "exam", title: "One advantage of DHCP", src: "A-level June 2020 · P2 Q05.1 · 1 mark",
      q: "The computers on subnet 192.168.2.0 have been configured using the DHCP system. State one advantage of using DHCP.",
      steps: [{ m: "No need to assign IP addresses manually — reduces the time and expertise needed to configure hosts // makes efficient reuse of a limited pool of addresses;", mk: "1 mark" }], result: "Automatic configuration" } },
    { worked: { tag: "exam", title: "Not for the web server", src: "A-level June 2024 · P2 Q07.5 · 1 mark",
      q: "Explain why it might be undesirable to allow the network settings of the web server to be configured by a DHCP server.",
      steps: [{ m: "The web server's IP address might be changed by the DHCP server — and then the router's port forwarding would no longer send requests to it;", mk: "1 mark", n: "A. the DHCP server would need configuring to give it a fixed address. NE. \"settings\" for IP address." }], result: "Its address must not change" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain the purpose", "Automatic configuration: IP, mask, gateway."],
      ["Explain why used", "Saves expertise/time; avoids duplicate addresses; reuses a limited pool."],
      ["Explain what happens", "Discover, offer, request, acknowledge — in order."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"DORA the DHCP Explorer\"", body: "**D**iscover, **O**ffer, **R**equest, **A**cknowledge." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"The server gives an IP address\" as the whole exchange (NE.).", "\"Avoids errors\" without an example (NE.).", "Using DHCP for servers that are port-forwarded to."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.9 port forwarding needs fixed addresses; 4.9.4.5 address shortage; 4.9.4.4 the mask DHCP supplies; 4.9.2.1 a broadcast reaches every host on the subnet." } }
  ],
  flashcards: [
    ["Does DHCP need expert knowledge on each host?", "No — that is one of its benefits.", 1],
    ["How does a new host find a DHCP server?", "It broadcasts a DISCOVER message.", 2],
    ["Why use DHCP?", "No manual configuration; avoids duplicate addresses; reuses a limited pool.", 7],
    ["DHCP exchange?", "Discover, Offer, Request, Acknowledge.", 8],
  ],
  quiz: [
    { q: "Why avoid DHCP for a server reached by port forwarding?", opts: ["its IP address could change", "DHCP is too slow", "servers cannot use IP", "DHCP encrypts traffic"], ans: 0, why: "See the notes." },
    { q: "Why avoid DHCP for a server reached by port forwarding?", opts: ["its IP address could change", "DHCP is too slow", "servers cannot use IP", "DHCP encrypts traffic"], ans: 0, why: "See the notes." },
    { q: "The first DHCP message is", opts: ["Discover (broadcast)", "Offer", "Request", "Acknowledge"], ans: 0, why: "DORA." },
    { q: "DHCP supplies", opts: ["IP address, mask, default gateway", "MAC address", "domain name", "port numbers"], ans: 0, why: "Configuration." },
    { q: "A web server behind port forwarding should have", opts: ["a fixed IP address", "a DHCP-changing address", "no IP address", "a public MAC"], ans: 0, why: "2024 Q07.5." }
  ]
};

/* =====================================================================
   4.9.4.8  Network Address Translation (NAT)
   ===================================================================== */
C["compsci:4.9.4.8"] = {
  notes: [
    { h: "Network Address Translation — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.8)", body: "Explain the basic concept of **NAT** and why it is used." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["NAT for an outgoing request and its reply", "Describe", "4", "A-level 2024 Q07.6"],
      ["Same private address on many networks", "Explain", "2", "A-level 2020 Q05.2 — see 4.9.4.6"],
      ["NAT in the IPv4 essay", "Explain", "—", "A-level 2025 Q08 — see 4.9.4.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**How NAT works**.", "**Why it is used**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "How NAT works" },
    natFig("NAT at the home router: outgoing packets leave with 186.7.2.31; replies are mapped back to the right private host."),
    { table: { head: ["Step", "Source socket", "Destination socket"], rows: [
      ["PC sends", "192.168.0.4 : 51234", "FTP server : 21"],
      ["Router rewrites + records 192.168.0.4:51234 ↔ 186.7.2.31:40001", "**186.7.2.31 : 40001**", "FTP server : 21"],
      ["Reply arrives", "FTP server : 21", "186.7.2.31 : 40001"],
      ["Router looks up 40001, rewrites", "FTP server : 21", "**192.168.0.4 : 51234**"]
    ] } },
    { steps: [
      "**Outgoing**: the router replaces the packet's **private source IP** (192.168.0.4) with **its own public IP** (186.7.2.31), and the source port with a **port it generates**.",
      "It records the mapping (its port ↔ the private IP and original port, i.e. socket) in its **NAT translation table**.",
      "**Incoming reply**: the router recognises the reply by its **destination port**, looks it up in the table…",
      "…and replaces the destination (public IP, port) with the private IP and original port, forwarding it to the computer that made the request.",
      "Unsolicited packets with no table entry are dropped (unless port forwarding says otherwise)."
    ] },

    { page: "Why it is used" },
    { ul: [
      "**Conserves IPv4 addresses**: a whole LAN of private-addressed devices shares **one public address** (4.9.4.5).",
      "**Security**: internal addresses are hidden; outside hosts cannot start connections to LAN devices directly.",
      "**Flexibility**: the LAN can be renumbered or change ISP without affecting the outside world."
    ] },
    { callout: { t: "miscon", h: "\"NAT changes the IP address\" — whose?", body: "Say exactly: the **source** IP of the **computer** (192.168.0.4, private) becomes the **router's** public IP (186.7.2.31) going out; the **destination** is changed back coming in. **NE.** \"references to a public IP address\" without saying whose. Using \"NAT\" instead of \"the router\" as the actor caps the answer at 2." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "NAT for an FTP download", src: "A-level June 2024 · P2 Q07.6 · 4 marks",
      q: "The student's computer (192.168.0.4) downloads a file from an FTP server on the Internet. The router's public IP is 186.7.2.31. Describe how NAT will be used, handling both the outgoing request and the returned data.",
      steps: [
        { h: "Outgoing", m: "The router replaces the computer's (private) source IP address 192.168.0.4 with its own public IP 186.7.2.31;", mk: "1 mark" },
        { h: "Outgoing", m: "it replaces the source port number with a port number it generates, and adds the mapping (its port → the computer's IP and port) to its NAT translation table;", mk: "1 mark" },
        { h: "Reply", m: "When the reply arrives from the FTP server, its destination port number is looked up in the NAT table;", mk: "1 mark" },
        { h: "Reply", m: "the router replaces 186.7.2.31 (and the port) with 192.168.0.4 and the original port, forwarding the data to the student's computer;", mk: "1 mark", n: "Max 2 if \"NAT\" is used instead of \"the router\"." }
      ], result: "Rewrite + table out; look up + rewrite back" } },

    { worked: { tag: "variation", title: "Two PCs, one public address", q: "PC1 (192.168.0.4:51000) and PC2 (192.168.0.5:51000) both request the same web server (port 443) at the same moment through a router with public IP 186.7.2.31. Show the NAT table and explain how each reply reaches the right PC.",
      steps: [
        { m: "The router gives each outgoing connection its own public port: 186.7.2.31:40001 ↔ 192.168.0.4:51000 and 186.7.2.31:40002 ↔ 192.168.0.5:51000;", mk: "1 mark" },
        { m: "both packets leave with source 186.7.2.31 but different source ports;", mk: "1 mark" },
        { m: "replies arrive addressed to port 40001 or 40002; the router looks each up and rewrites the destination to PC1's or PC2's socket;", mk: "1 mark", n: "The client ports may be identical — the router's generated ports keep the conversations apart." }
      ], result: "Distinct router ports" } },
    { worked: { tag: "variation", title: "NAT as a security benefit", q: "Explain how NAT also helps protect devices on a home LAN.",
      steps: [{ m: "Devices' private addresses are hidden behind the router's public address;", mk: "1 mark" }, { m: "unsolicited incoming packets have no entry in the translation table, so they are dropped — outsiders cannot start a connection to a LAN device;", mk: "1 mark" }], result: "Hidden, unreachable unless asked" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe NAT (out and back)", "Whose IP replaced by whose; port generated; table entry; lookup by destination port; rewrite back."],
      ["Explain why used", "Many private hosts share one public IPv4 address (plus hiding hosts)."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Swap, Store, Spot, Swap back\"", body: "**Swap** the source address/port, **store** the mapping, **spot** the reply's port, **swap back**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Not saying whose address replaces whose.", "Forgetting the port number and the translation table.", "\"NAT does it\" — the router does (max 2)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.9 port forwarding is NAT for incoming connections; 4.9.4.1 sockets (IP + port); 4.9.4.6 private addresses; 4.9.4.5 IPv6 removes the need." } }
  ],
  flashcards: [
    ["What is stored in the NAT table?", "The router port mapped to the private IP and port (socket)."],
    ["Do two LAN PCs using the same client port clash under NAT?", "No — the router gives each connection a different public port."],
    ["Does IPv6 need NAT?", "No — every device can have a public address."],
    ["What does NAT do going out?", "Replaces the private source IP (and port) with the router's public IP and a generated port, recording the mapping.", 6],
    ["Where is NAT performed?", "At the router / gateway between the LAN and the Internet.", 9],
    ["What happens to unsolicited incoming packets?", "Dropped unless a port-forwarding rule exists.", 10]
  ],
  quiz: [
    { q: "NAT is performed by", opts: ["the router at the network edge", "each PC", "the DNS server", "the web server"], ans: 0, why: "See the notes." },
    { q: "NAT is performed by", opts: ["the router at the network edge", "each PC", "the DNS server", "the web server"], ans: 0, why: "See the notes." },
    { q: "Going out, NAT replaces the", opts: ["private source IP with the router's public IP", "destination MAC", "DNS name", "payload"], ans: 0, why: "Source rewrite." },
    { q: "NAT finds the right host for a reply using", opts: ["the destination port in its table", "the MAC address", "DHCP", "the TTL"], ans: 0, why: "Translation table." },
    { q: "A main reason for NAT is", opts: ["saving public IPv4 addresses", "faster routing", "encrypting packets", "assigning masks"], ans: 0, why: "Shortage." }
  ]
};

/* =====================================================================
   4.9.4.9  Port forwarding
   ===================================================================== */
C["compsci:4.9.4.9"] = {
  notes: [
    { h: "Port forwarding — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.9)", body: "Explain the basic concept of **port forwarding** and why it is used." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How the router was configured so a web server is reachable", "Explain", "2–3", "A-level 2018 Q05.4, 2024 Q07.4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The concept**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The concept" },
    { kv: [
      ["Problem", "a server on a LAN has a **private, non-routable** address; NAT drops unsolicited incoming connections, so outside computers cannot reach it"],
      ["Port forwarding", "a **rule** configured in the router: traffic arriving at the router's **public IP** on a given **port** (e.g. 80 / 443 for HTTP(S)) is **forwarded** to a specific **private IP** (and port) on the LAN"],
      ["Why", "to make a server inside a NAT'd LAN — web, game, FTP — **reachable from the Internet** while everything else stays hidden"]
    ] },
    { fig: { w: 600, h: 140, items: (function () {
      var it = [];
      it = it.concat(boxAt(10, 45, 130, 50, "Visitor", "good", "anywhere online"));
      it = it.concat(boxAt(230, 30, 150, 80, "Router 186.7.2.31", "accent2", "rule: :80 → 192.168.0.2:80"));
      it = it.concat(boxAt(460, 45, 130, 50, "Web server", "accent", "192.168.0.2"));
      it = it.concat(arrow(140, 70, 230, 70, "to 186.7.2.31:80"), arrow(380, 70, 460, 70, "forwarded"));
      return it;
    })(), cap: "Visitors connect to the router's public address; the forwarding rule sends port-80 traffic to the private web server." } },
    { callout: { t: "tip", h: "Side by side: NAT vs port forwarding", body: "**NAT** maps **outgoing** connections automatically, creating table entries as LAN hosts start conversations. **Port forwarding** is a **fixed, configured** entry for **incoming** connections that no LAN host started." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Configuring the External Router", src: "A-level June 2018 · P2 Q05.4 · 2 marks",
      q: "The web server (192.168.16.12) must be accessible from outside the company's network, but has a non-routable address. The External Router supports NAT and port forwarding. Explain how it will have been configured.",
      steps: [{ m: "Traffic arriving (from outside) on the HTTP(S) port — 80 / 443 —;", mk: "1 mark" }, { m: "must be forwarded by the External Router to the web server's IP address, 192.168.16.12;", mk: "1 mark" }], result: "Port 80 → 192.168.16.12" } },
    { worked: { tag: "exam", title: "Reaching the student's web server", src: "A-level June 2024 · P2 Q07.4 · 3 marks",
      q: "Explain how a computer outside the LAN can access the student's web server (192.168.0.2) despite its non-routable IP address. The router's public IP is 186.7.2.31.",
      steps: [
        { m: "Computers outside the LAN use the router's public IP address, 186.7.2.31;", mk: "1 mark", n: "NE. no reference to an IP address." },
        { m: "the router performs port forwarding — it identifies traffic arriving on the HTTP port (80 / 8080, A. 443);", mk: "1 mark" },
        { m: "and forwards it (using its port mapping table) to the web server's IP address, 192.168.0.2;", mk: "1 mark", n: "NE. the non-routable address without saying it is the web server's." }
      ], result: "Public IP + port rule → server" } },

    { worked: { tag: "variation", title: "Hosting a game server", q: "A student runs a game server on 192.168.0.9 listening on port 25565, behind a router with public IP 186.7.2.31. Describe the port-forwarding rule needed, and what friends must type to connect.",
      steps: [
        { m: "Rule: traffic arriving at the router on port 25565 is forwarded to 192.168.0.9 port 25565;", mk: "1 mark" },
        { m: "friends connect to the router's public address, 186.7.2.31:25565;", mk: "1 mark" },
        { m: "the game server should have a fixed IP (static or a DHCP reservation) so the rule keeps working;", mk: "1 mark" }
      ], result: ":25565 → 192.168.0.9" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [["Explain how (configured / accessed)", "Router's public IP; traffic on the service's port; forwarded to the server's private IP."]] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Knock on 80, the router points you to the server\"", body: "Public IP + port → private IP. Port forwarding is the **doorman** for one door." } },
    { callout: { t: "warn", h: "Specific errors", body: ["No mention of the port number.", "Forgetting the outside world uses the ROUTER's public address.", "Letting DHCP change the server's address (4.9.4.7)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.4.8 NAT; 4.9.4.1 well-known ports; 4.9.4.7 static addresses for servers; 4.9.3.2 firewalls also filter by port." } }
  ],
  flashcards: [
    ["Port-forwarding rule for HTTPS to 192.168.0.2?", "Traffic on port 443 at the public IP → 192.168.0.2:443."],
    ["Why give a forwarded server a fixed IP?", "So the rule keeps pointing at it (DHCP could change it)."],
    ["Does a port-forwarded server use a public IP?", "No — visitors use the router's public IP."],
    ["What happens to incoming traffic with no rule?", "It is dropped by the router."],
    ["Why use port forwarding?", "To make a server with a private address reachable from the Internet.", 9],
    ["Which port would a web server's rule use?", "80 (HTTP) or 443 (HTTPS).", 10],
    ["NAT vs port forwarding?", "NAT handles outgoing connections automatically; port forwarding is a fixed rule for incoming ones.", 11]
  ],
  quiz: [
    { q: "Port forwarding is configured on", opts: ["the router", "the client browser", "the DNS server", "the switch's MAC table"], ans: 0, why: "See the notes." },
    { q: "Port forwarding is configured on", opts: ["the router", "the client browser", "the DNS server", "the switch's MAC table"], ans: 0, why: "See the notes." },
    { q: "Port forwarding lets", opts: ["outside computers reach a server with a private IP", "a host get an IP automatically", "DNS resolve names", "Wi-Fi hide its SSID"], ans: 0, why: "Incoming rule." },
    { q: "Outside visitors connect to", opts: ["the router's public IP", "the server's private IP", "the MAC address", "the DHCP server"], ans: 0, why: "Only public is routable." },
    { q: "A forwarding rule matches on", opts: ["the destination port", "the TTL", "the SSID", "the MAC address"], ans: 0, why: "Port → host." }
  ]
};

/* =====================================================================
   4.9.4.10  Client server model
   ===================================================================== */
C["compsci:4.9.4.10"] = {
  notes: [
    { h: "The client-server model, WebSockets, CRUD and REST — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.10)", body: ["Be familiar with the **client server model**.", "The **WebSocket** protocol, why and where it is used.", "The principles of **Web CRUD** applications and **REST** (GET → SELECT, POST → INSERT, DELETE → DELETE, PUT → UPDATE)", "Compare **JSON** with **XML**."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which statement about CRUD / REST is false", "Shade", "1", "A-level 2020 Q04.1"],
      ["Identify XML vs JSON; reasons JSON is better", "Shade / State", "1–2", "A-level 2020 Q04.2–04.3, 2023 Q05.6"],
      ["What URLs are used for in REST", "Describe", "1", "A-level 2023 Q05.4"],
      ["REST ↔ SQL mapping", "Shade", "1", "A-level 2023 Q05.5"],
      ["True statement about WebSocket", "Shade", "1", "A-level 2024 Q07.8"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Request and response**.", "**WebSockets**.", "**CRUD and REST**.", "**JSON and XML**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Request and response" },
    { kv: [
      ["Client server model", "the **client sends a request message** to the server; the **server responds** with a response message. The client always initiates."],
      ["Example", "a browser sends `GET /film/4301 HTTP/1.1`; the web server replies `200 OK` with the data"]
    ] },

    { page: "WebSockets" },
    { kv: [
      ["What", "a protocol (with an API) that establishes a **full-duplex**, **persistent** connection between a **web browser and a server over TCP**"],
      ["Why", "**both** parties can send data **at any time** without the client repeatedly asking (polling) — low latency, less overhead than opening an HTTP request per message"],
      ["Where", "live chat, multiplayer browser games, live sports scores and stock tickers, collaborative editing, notifications"]
    ] },
    { callout: { t: "miscon", h: "WebSocket myths (A-level 2024 Q07.8)", body: "It does **not** require XML, does **not** sign every message, messages can originate from **either** side, and it runs at the **application** layer over TCP — not the network layer. The true statement: it establishes a **full-duplex communication channel**." } },

    { page: "CRUD and REST" },
    { table: { head: ["CRUD", "HTTP method (REST)", "SQL"], rows: [
      ["**C**reate", "**POST**", "**INSERT**"],
      ["**R**etrieve", "**GET**", "**SELECT**"],
      ["**U**pdate", "**PUT**", "**UPDATE**"],
      ["**D**elete", "**DELETE**", "**DELETE**"]
    ] } },
    { ul: [
      "**REST** (Representational State Transfer) connects a **database to the browser** using **HTTP request methods**.",
      "The **REST API is created and run on the server**; JavaScript in the browser (referenced from `index.html`) **calls the API** through HTTP.",
      "**Each resource is identified by a URL**: `GET /api/films/4301` retrieves one film; `DELETE /api/bookings/77` removes a booking — the server runs the matching SQL.",
      "Data travels as **JSON** (or XML)."
    ] },
    { code: { lang: "javascript", src: "// browser JavaScript calling a REST API on the server\nconst res = await fetch(\"/api/films?certificate=U\");   // GET → SELECT … WHERE Certificate = 'U'\nconst films = await res.json();                         // JSON parsed straight into objects\nawait fetch(\"/api/bookings\", { method: \"POST\",         // POST → INSERT INTO Booking …\n  body: JSON.stringify({ showingId: 12, seats: [4, 5] }) });", cap: "The browser runs the JavaScript; the server runs the API and the SQL." } },

    { page: "JSON and XML" },
    { code: { lang: "json", src: "{\"Films\":[\n  { \"FilmID\": 4301, \"FilmName\": \"Alien Doomsday\", \"Duration\": 106, \"Certificate\": \"12A\" },\n  { \"FilmID\": 2098, \"FilmName\": \"Tom's Amazing Adventure\", \"Duration\": 84, \"Certificate\": \"U\" }\n]}", cap: "JSON: name/value pairs, arrays in [ ], objects in { }." } },
    { code: { lang: "xml", src: "<Films>\n  <Film><FilmID>4301</FilmID><FilmName>Alien Doomsday</FilmName>\n        <Duration>106</Duration><Certificate>12A</Certificate></Film>\n</Films>", cap: "XML: every value wrapped in an opening and a closing tag." } },
    { table: { head: ["JSON compared with XML", "Why"], rows: [
      ["easier for **humans to read**", "less markup"],
      ["**more compact**", "no closing tags → smaller, faster to transmit"],
      ["**easier to create**", "simple syntax"],
      ["**quicker for computers to parse**", "maps directly onto JavaScript objects; native arrays"],
      ["XML's strengths", "schemas and validation, attributes, namespaces, mixed text content"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Which CRUD/REST statement is false?", src: "A-level June 2020 · P2 Q04.1 · 1 mark",
      q: "Which is false? A CRUD is an acronym for Create, Retrieve, Update, Delete. B REST allows JavaScript to communicate with the server using HTTP. C The database is connected to the web browser using REST. D The REST API will be created and run on the client computer.",
      steps: [{ m: "**D** — the REST API is created and run on the **server**;", mk: "1 mark" }], result: "D" } },
    { worked: { tag: "exam", title: "XML or JSON; why JSON", src: "A-level June 2020 · P2 Q04.2–04.3 · 3 marks",
      q: "Two property records are encoded two ways; Representation 2 uses tags like <PropertyID>8026</PropertyID>. (a) Which encoding is Representation 2? (b) State two reasons why JSON could be argued to be better than XML.",
      steps: [
        { m: "(a) **B** XML;", mk: "1 mark" },
        { m: "(b) More compact — smaller files, faster transmission;", mk: "1 mark" },
        { m: "quicker / easier to parse // structure understood directly in JavaScript // native support for arrays // easier for humans to read;", mk: "1 mark", n: "A-level 2023 Q05.6 (film data) has the same two-mark answer." }
      ], result: "XML; compact, quick to parse" } },
    { worked: { tag: "exam", title: "URLs in a RESTful application", src: "A-level June 2023 · P2 Q05.4 · 1 mark",
      q: "A cinema booking website uses CRUD and REST. Describe what Uniform Resource Locators (URLs) are used for in a RESTful application.",
      steps: [{ m: "Each resource is represented by a URL // entering a URL causes the server to retrieve the relevant data // URLs are sent between client and server using HTTP;", mk: "1 mark" }], result: "A URL per resource" } },
    { worked: { tag: "exam", title: "REST to SQL", src: "A-level June 2023 · P2 Q05.5 · 1 mark",
      q: "Which row correctly shows how REST maps CRUD to SQL? A GET→FETCH, POST→CREATE, DELETE→DELETE, PUT→UPDATE · B GET→SELECT, POST→INSERT, DELETE→DELETE, PUT→UPDATE · C GET→SELECT, POST→INSERT, DELETE→DELETE, PUT→CREATE · D GET→SELECT, POST→UPDATE, DELETE→DELETE, PUT→INSERT · E GET→UPDATE, POST→SELECT, DELETE→DELETE, PUT→CREATE",
      steps: [{ m: "**B**;", mk: "1 mark" }], result: "B" } },
    { worked: { tag: "exam", title: "Why JSON for film data", src: "A-level June 2023 · P2 Q05.6 · 2 marks",
      q: "JSON is used to encode datasets passed between the server and the booking application. State two reasons why JSON might have been chosen instead of XML.",
      steps: [{ m: "More compact — smaller, so faster to transmit;", mk: "1 mark" }, { m: "quicker to parse / understood directly by JavaScript // easier for humans to read;", mk: "1 mark" }], result: "Compact; quick to parse" } },
    { worked: { tag: "exam", title: "The true WebSocket statement", src: "A-level June 2024 · P2 Q07.8 · 1 mark",
      q: "Which statement about the WebSocket protocol is true? A all messages use XML · B all messages have a digital signature · C messages can only originate from the web server · D the protocol establishes a full-duplex communication channel · E it operates at the network layer.",
      steps: [{ m: "**D**;", mk: "1 mark" }], result: "D" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State reasons (JSON)", "Compact; quick to parse; easier to read/create; native arrays."],
      ["Describe (URLs in REST)", "Each resource has a URL; requesting it makes the server retrieve the data."],
      ["Shade (mapping / truths)", "GET-SELECT, POST-INSERT, PUT-UPDATE, DELETE-DELETE; API on the server; WebSocket full duplex."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Get Selected, Post Inserted, Put Updated, Delete Deleted\"", body: "And JSON vs XML: JSON is \"**L**ean, **L**egible, **L**oads fast\". WebSocket = a **phone call** (both talk any time); HTTP = **letters** (ask, then wait)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["REST API on the client (it runs on the server).", "PUT → INSERT or POST → UPDATE.", "WebSocket at the network layer or one-way."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.10.2 SQL SELECT/INSERT/UPDATE/DELETE; 4.9.4.2 HTTP; 4.9.4.1 WebSocket over TCP; 4.9.2.2 client-server networking; 4.2 records and arrays — JSON's structures." } }
  ],
  flashcards: [
    ["Why use WebSockets?", "Either side can send at any time — low latency, no polling (chat, games, live data).", 2],
    ["Where does the REST API run?", "On the server; browser JavaScript calls it over HTTP.", 5],
    ["Four advantages of JSON over XML?", "Easier to read, more compact, easier to create, quicker to parse.", 6],
    ["What do URLs identify in REST?", "Resources.", 7]
  ],
  quiz: [
    { q: "POST maps to SQL", opts: ["INSERT", "SELECT", "UPDATE", "DELETE"], ans: 0, why: "Create." },
    { q: "A WebSocket is", opts: ["full-duplex", "one-way from server", "network layer", "XML only"], ans: 0, why: "2024 Q07.8." },
    { q: "The REST API runs on", opts: ["the server", "the client", "the DNS server", "the router"], ans: 0, why: "2020 Q04.1." },
    { q: "Compared with XML, JSON is", opts: ["more compact", "more verbose", "slower to parse", "tag-based"], ans: 0, why: "No closing tags." }
  ]
};

/* =====================================================================
   4.9.4.11  Thin- versus thick-client computing
   ===================================================================== */
C["compsci:4.9.4.11"] = {
  notes: [
    { h: "Thin- versus thick-client computing — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.9.4.11)", body: "Compare and contrast **thin-client** computing with **thick-client** computing." } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What thin-client computing is + why chosen", "Describe and explain", "3", "A-level 2021 Q02"],
      ["Compare hardware requirements", "Compare", "3", "A-level 2022 Q11"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The two models**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The two models" },
    { kv: [
      ["Thin client", "a low-specification terminal: **processing is carried out / applications are executed on a server**; the client mainly handles input and display"],
      ["Thick (fat) client", "a full computer that **processes and stores data locally**, using a server only for some resources"]
    ] },
    { table: { head: ["", "Thin client", "Thick client"], rows: [
      ["Client hardware", "**slower processor, less RAM, little or no secondary storage**", "fast processor, plenty of RAM, local storage"],
      ["Server hardware", "**many cores / processors, lots of RAM, many drives**", "more modest"],
      ["Network", "needs **high bandwidth**, always connected (fibre, gigabit switches)", "less dependent; can work offline"],
      ["Software", "installed and updated **once, on the server**", "installed / updated on every client"],
      ["Security", "users cannot install unauthorised software; fewer settings to change; data stays on the server", "each machine is a target; data spread out"],
      ["Cost", "cheaper clients, less power, longer life (MTBF), cheaper licensing per active user", "dearer clients"],
      ["Risk", "server or network failure stops everyone", "each machine independent"]
    ] } },
    { callout: { t: "warn", h: "\"More / less powerful\" is NE.", body: "Name the hardware: **slower clock speed**, **less RAM**, **no hard disk** in the client; **many cores**, **lots of RAM**, **many drives** in the server; **higher-bandwidth** network." } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Thin-client: what and why", src: "A-level June 2021 · P2 Q02 · 3 marks",
      q: "Describe what thin-client computing is and explain two reasons why a thin-client system might be chosen in preference to a thick-client system.",
      steps: [
        { h: "What", m: "Processing is carried out / applications are executed on a (application) server;", mk: "1 mark", n: "NE. \"resources are stored on the server\"." },
        { h: "Why", m: "Clients can have a lower hardware specification, so are cheaper to buy;", mk: "1 mark", n: "NE. \"cheaper\" alone." },
        { h: "Why", m: "Software is installed and updated only on the server // users cannot install unauthorised software // clients use less power and need less maintenance;", mk: "1 mark" }
      ], result: "Server does the processing; cheap, managed clients" } },
    { worked: { tag: "exam", title: "Compare hardware requirements", src: "A-level June 2022 · P2 Q11 · 3 marks",
      q: "Compare the hardware requirements of thin-client and thick-client computing systems.",
      steps: [
        { h: "Network", m: "A thin-client system needs a higher-bandwidth network connection (e.g. fibre, gigabit switches);", mk: "1 mark" },
        { h: "Client", m: "Thin clients need a slower processor, less RAM and little or no secondary storage;", mk: "1 mark" },
        { h: "Server", m: "The thin-client server needs multiple processors / many cores, a lot of RAM and many storage drives;", mk: "1 mark", n: "Max 1 network, max 2 client, max 2 server. A. points made from the thick-client side. NE. more/less powerful, cheaper/dearer." }
      ], result: "Network, client, server" } },

    { worked: { tag: "variation", title: "Thin clients for a school lab", q: "A school will replace 30 lab PCs. Discuss whether thin clients are a good choice.",
      steps: [
        { m: "For: cheap low-spec clients with long lives and low power; software installed and updated once on the server; students cannot install unauthorised software;", mk: "1 mark" },
        { m: "Against: the server needs many cores, lots of RAM and storage, and the network needs high bandwidth — a server or network failure stops all 30;", mk: "1 mark" },
        { m: "Judgement: suits a managed lab running the same applications; less suited to heavy local work (video editing) unless the server is very powerful;", mk: "1 mark" }
      ], result: "Usually yes, if the server and network are strong" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe thin-client", "Processing / applications run on the server."],
      ["Explain why chosen", "Cheaper, low-spec clients; central software; security; power; maintenance; licensing."],
      ["Compare hardware", "Specific components: CPU speed, RAM, storage; server cores/RAM/drives; bandwidth."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Thin client, fat server, fast wire\"", body: "A thin client moves the weight to the **server** and the **network**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Powerful\" / \"cheaper\" without the component (NE.).", "Saying thin clients store the software (R.).", "Forgetting the network requirement."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.9.2.2 client-server networks; 4.7.3.7 processor and memory factors; 4.9.1.2 bandwidth; 4.6.1.4 central OS and software management." } }
  ],
  flashcards: [
    ["Why can thin clients be more secure?", "Users cannot install software; data stays on the server."],
    ["A disadvantage of thin clients?", "Server or network failure stops every client."],
    ["Thin-client computing?", "Applications run and processing happens on a server; clients mainly display and input.", 4],
    ["Thick-client computing?", "Clients process and store data locally.", 5],
    ["Thin client hardware?", "Slower processor, less RAM, little/no storage.", 6],
    ["Thin-client server hardware?", "Many cores, lots of RAM, many drives.", 7],
    ["Thin-client network need?", "High bandwidth, always available.", 8],
    ["Two reasons to choose thin clients?", "Cheaper clients; software installed/updated once on the server; more secure; less power.", 9]
  ],
  quiz: [
    { q: "Thin-client software is updated", opts: ["once, on the server", "on every client", "never", "by each user"], ans: 0, why: "Installed once on the server, not on every client." },
    { q: "In thin-client computing, applications run on", opts: ["the server", "each client", "the router", "the DNS server"], ans: 0, why: "Definition." },
    { q: "A thin-client system especially needs", opts: ["a high-bandwidth network", "large client hard disks", "fast client CPUs", "no server"], ans: 0, why: "Everything crosses the network." },
    { q: "\"The server must be more powerful\" scores", opts: ["NE.", "1 mark", "2 marks", "full marks"], ans: 0, why: "Name cores/RAM/drives." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
