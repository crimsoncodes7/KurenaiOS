/* Kurenai OS — js/data/exams/aqa-7517-2-49.js
   AQA 7517 Paper 2, the exhaustive Companion: 4.8 Consequences of uses of
   computing and 4.9 Fundamentals of communication and networking.
   AUTHORED, original (see aqa-7517-2-45.js for the shape and the rules).
   Every subnet, address range and bit rate was checked by program.      */
(function () {
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var D = X.deep = X.deep || {};
  var P = D["aqa-7517-2"] = D["aqa-7517-2"] || { leaves: {} };
  var L = P.leaves;

  /* ================= 4.8 Consequences of uses of computing ================= */
  L["4.8.1"] = {
    archetypes: [{
      id: "cs.law",
      rules: ["Name the challenge AND why it is hard: technology changes faster than law is made; the Internet crosses jurisdictions; anonymity hides offenders; evidence is easily destroyed.",
        "Use the UK Acts by name where they fit: Data Protection Act 2018 / UK GDPR, Computer Misuse Act 1990, Copyright, Designs and Patents Act 1988, Investigatory Powers Act 2016.",
        "Balance: privacy against security, innovation against protection."],
      traps: [],
      variations: [
        { v: "A", t: "Why computing law is hard to write", m: 3, q: "Explain three challenges facing legislators trying to regulate new digital technologies.",
          steps: [["Technology changes faster than laws can be drafted and passed, so laws are out of date when they arrive.", "MP1", ""], ["Services operate across countries, so one country's law may not reach the provider or the data.", "MP2", ""], ["Legislators may not understand the technology well enough to foresee how it will be used or misused.", "MP3", ""]] },
        { v: "B", t: "Why it is hard to enforce", m: 3, q: "Explain why laws about online crime are difficult to enforce.",
          steps: [["Offenders can be anonymous or hide behind proxies, VPNs or stolen identities.", "MP1", ""], ["They may be in another jurisdiction with no extradition or different laws.", "MP2", ""], ["Digital evidence can be deleted or encrypted quickly, and police need specialist skills to gather it.", "MP3", ""]] },
        { v: "C", t: "Name the Act", m: 2, q: "A company stores customers' purchase histories and an employee reads a colleague's email account without permission. Name the Act that applies to each.",
          steps: [["Storing personal data: the Data Protection Act 2018 (UK GDPR).", "MP1", ""], ["Unauthorised access to an account: the Computer Misuse Act 1990.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the UK Act that makes unauthorised access to computer material an offence.", ["Computer Misuse Act 1990 (1)"]],
      [1, 1, "Give one right an individual has under the Data Protection Act / UK GDPR.", ["To see/access their data / have it corrected / erased / object (1)"]],
      [2, 2, "Explain why a law passed in the UK may not stop a website hosted abroad.", ["The site is in another jurisdiction (1)", "UK courts/police have no power there unless there is cooperation (1)"]],
      [2, 2, "Explain one ethical issue raised when an app collects location data.", ["Privacy: people tracked without understanding it (1)", "Data may be sold/shared or used for purposes they did not agree to (1)"]],
      [3, 3, "Discuss whether governments should be able to read encrypted messages to prevent crime.", ["For: helps catch terrorists/criminals (1)", "Against: weakens security for everyone / privacy / misuse (1)", "Judgement weighing the two (1)"]],
      [3, 3, "An AI system decides loan applications. Explain three issues legislators might need to address.", ["Bias/discrimination in the training data (1)", "Transparency/explaining decisions (1)", "Accountability when it is wrong / data protection (1)"]]
    ]
  };

  /* ================= 4.9.1 Communication ================= */
  L["4.9.1.1"] = {
    archetypes: [
      { id: "cs.serial-parallel",
        rules: ["Serial: one bit after another down one wire. Parallel: several bits at the same time, one bit per wire.",
          "Parallel suffers skew (bits arriving at different times) and crosstalk over distance, so serial wins over long distances.",
          "Parallel suits very short, fast links such as the processor's data bus."],
        traps: [{ sitting: "2022-06", q: "Q02.1", text: "Most got \"several wires\"; the second mark needs ONE BIT PER WIRE, AT THE SAME TIME. \"Data sent together\" was too vague." }],
        variations: [
          { v: "A", t: "How parallel transmission works", m: 2, q: "Describe how data is sent by parallel transmission.",
            steps: [["Several wires are used, one for each bit.", "MP1", ""], ["The bits of a byte/word are sent simultaneously, one bit on each wire.", "MP2", "The mark most answers miss"]] },
          { v: "B", t: "Why serial over distance", m: 2, q: "Explain why serial transmission is used over long distances.",
            steps: [["Parallel bits can arrive at different times (skew), so data is corrupted over distance.", "MP1", ""], ["Serial needs fewer wires, so the cable is cheaper, and has no skew or crosstalk.", "MP2", ""]] },
          { v: "C", t: "Why the data bus is parallel", m: 3, q: "Explain why a computer connects peripherals by serial links but its internal data bus is parallel.",
            steps: [["The data bus is very short, so skew is negligible.", "MP1", ""], ["Moving a whole word at once gives the high transfer rate the processor needs.", "MP2", ""], ["Peripherals are further away, where serial avoids skew and needs a simpler, cheaper cable.", "MP3", ""]] }
        ] },
      { id: "cs.sync-async",
        rules: ["Synchronous: the sender's and receiver's clocks are kept in step (or a clock signal travels with the data).",
          "Asynchronous: no shared clock; each character is framed by a start bit and stop bit(s).",
          "Start bit: wakes the receiver and synchronises the RECEIVER'S clock with the SENDER'S. Stop bit: gives time to process the byte and lets the next start bit be recognised."],
        traps: [{ sitting: "2022-06", q: "Q02.4", to: "Q02.5", text: "\"Shows where the transmission starts / ends\" scored nothing. The start bit synchronises the receiver's clock with the sender's (name both); the stop bit lets the next start bit be seen / gives time to process the byte." },
          { sitting: "2023-06", q: "Q10.2", text: "Synchronous transmission was poorly known: the clocks are KEPT synchronised, or a clock signal is sent with the data." }],
        variations: [
          { v: "A", t: "The start bit", m: 1, q: "Explain the purpose of the start bit in asynchronous transmission.",
            steps: [["It tells the receiver a character is coming and synchronises the receiver's clock with the sender's for that character.", "MP1", ""]] },
          { v: "B", t: "The stop bit", m: 1, q: "Explain the purpose of the stop bit.",
            steps: [["It gives the receiver time to process the received byte, and returns the line to idle so the next start bit can be recognised.", "MP1", ""]] },
          { v: "C", t: "Synchronous transmission", m: 2, q: "Explain how synchronous transmission differs from asynchronous.",
            steps: [["Synchronous: sender and receiver clocks are kept in step continuously (a clock signal sent alongside or embedded).", "MP1", ""], ["So data is sent as a continuous stream without start and stop bits on each character.", "MP2", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Give one advantage of serial transmission over parallel.", ["Fewer wires/cheaper / no skew over distance (1)"], { arch: "cs.serial-parallel" }],
      [1, 1, "Name the bit that begins each character in asynchronous transmission.", ["Start bit (1)"], { arch: "cs.sync-async" }],
      [2, 2, "Explain what skew is in parallel transmission.", ["Bits sent at the same time arrive at different times (1)", "Because wires differ slightly, worse over distance (1)"], { arch: "cs.serial-parallel" }],
      [2, 3, "The ASCII code 1001101 is sent asynchronously with an even parity bit as MSB, a start bit 0 and a stop bit 1. Write the frame in order of transmission (start bit first, data as written).", ["Start bit 0 at the start (1)", "Parity 0 then 1001101 (1)", "Stop bit 1 at the end: 0 01001101 1 (1)"], { arch: "cs.sync-async" }],
      [3, 2, "Explain why asynchronous transmission is less efficient than synchronous for large files.", ["Every character carries extra start/stop bits (1)", "e.g. 10 bits sent for 8 data bits: 20% overhead (1)"], { arch: "cs.sync-async" }],
      [3, 2, "Explain why USB uses serial transmission even though it is fast.", ["High clock rates make skew in parallel cables a problem (1)", "Serial cables are thin and cheap and can run at very high bit rates (1)"], { arch: "cs.serial-parallel" }]
    ]
  };

  L["4.9.1.2"] = {
    archetypes: [{
      id: "cs.bit-rate",
      rules: ["Baud rate: signal changes (symbols) per second. Bit rate: bits per second.",
        "Bit rate = baud rate × bits per symbol; $2^n$ voltage levels carry $n$ bits per symbol.",
        "Bit rate is directly proportional to bandwidth. Latency is the delay before data arrives; it is not the same as bandwidth."],
      traps: [],
      variations: [
        { v: "A", t: "Bits per symbol from levels", m: 1, q: "A signal uses 8 voltage levels. How many bits does each signal change carry?",
          steps: [["$2^3 = 8$, so 3 bits.", "MP1", ""]] },
        { v: "B", t: "Bit rate from baud rate", m: 1, q: "A link uses 16 voltage levels at 1200 baud. Calculate its bit rate.",
          steps: [["4 bits per symbol × 1200 = 4800 bits per second.", "MP1", ""]] },
        { v: "C", t: "Bandwidth, bit rate and latency", m: 2, q: "Explain the relationship between bandwidth and bit rate, and what latency is.",
          steps: [["Bit rate is directly proportional to bandwidth: a higher bandwidth allows a higher bit rate.", "MP1", ""], ["Latency is the time delay between data being sent and starting to arrive; it does not depend on bandwidth.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Define baud rate.", ["The number of signal changes per second (1)"]],
      [1, 1, "When is bit rate equal to baud rate?", ["When each signal change carries one bit / two levels (1)"]],
      [2, 2, "A link sends 4 bits per symbol at 2500 baud. Calculate the bit rate and the number of voltage levels.", ["10,000 bps (1)", "16 levels (1)"]],
      [2, 2, "Explain why doubling the bandwidth of a link can double its bit rate.", ["Bit rate is directly proportional to bandwidth (1)", "More frequencies / faster signal changes can be carried (1)"]],
      [3, 2, "Explain why a satellite link can have a high bit rate but feel slow for gaming.", ["High bandwidth gives a high bit rate (1)", "But the long distance gives high latency, so each response is delayed (1)"]],
      [3, 2, "A link needs 9,000 bps at 3,000 baud. How many voltage levels are needed?", ["3 bits per symbol (1)", "8 levels (1)"]]
    ]
  };

  /* ================= 4.9.2 Networking ================= */
  L["4.9.2.1"] = {
    archetypes: [{
      id: "cs.topology",
      rules: ["Physical topology: how the devices are actually connected. Logical topology: how data flows between them.",
        "Star: each device has its own cable to a central switch. Bus: one shared backbone with terminators.",
        "A network can be physically a star but logically a bus (e.g. a hub broadcasting to all)."],
      traps: [],
      variations: [
        { v: "A", t: "Physical against logical", m: 2, q: "Explain the difference between a physical and a logical topology.",
          steps: [["Physical: the layout of the cables and devices — how they are wired.", "MP1", ""], ["Logical: how data actually travels between devices, whatever the wiring.", "MP2", ""]] },
        { v: "B", t: "Name the physical topology", m: 1, q: "In an office every computer has its own cable to one switch. Name the physical topology.",
          steps: [["Star.", "MP1", ""]] },
        { v: "C", t: "Star against bus", m: 2, q: "Give two advantages of a star topology over a bus.",
          steps: [["A cable failure affects only one device.", "MP1", ""], ["Better performance: a switch sends data only to its destination, so fewer collisions; easy to add devices.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the device at the centre of a star network.", ["Switch (or hub) (1)"]],
      [1, 1, "What is at each end of the backbone in a bus network?", ["A terminator (1)"]],
      [2, 2, "Give one disadvantage of a star topology and one of a bus.", ["Star: more cable / the switch is a single point of failure (1)", "Bus: a backbone failure stops the network / collisions slow it (1)"]],
      [2, 2, "Explain how a network can be a physical star but a logical bus.", ["Wired to a central hub (star) (1)", "The hub sends every frame to all devices, so data flows as on a bus (1)"]],
      [3, 2, "Explain why switched star networks perform better under heavy load than bus networks.", ["Switch sends frames only to the destination port (1)", "So devices do not share one medium / fewer collisions (1)"]],
      [3, 2, "A school adds 30 computers to a classroom. Explain why a star topology makes this easier.", ["Each just needs a cable to a switch port (1)", "No need to break the existing network / others unaffected (1)"]]
    ]
  };

  L["4.9.2.2"] = {
    archetypes: [{
      id: "cs.client-server",
      rules: ["Client–server: a central server provides services (files, logins, backup) that clients request.",
        "Peer-to-peer: each computer has equal status and shares its own resources directly.",
        "Answer from the CONTEXT: number of users, need for central security and backup, trust, cost of a server.",
        "Misconceptions: not all traffic passes through the server; one server failing does not stop the network itself."],
      traps: [{ sitting: "2022-06", q: "Q08.1", text: "Two misconceptions cost marks: that all traffic passes through the server, and that if the server fails the network fails. Neither is true." },
        { sitting: "2022-06", q: "Q08.2", text: "Use the context: few devices, people who trust each other and choose what to share. \"Cheaper\" needs its reason (no server to buy or manage)." }],
      variations: [
        { v: "A", t: "Compare the two models", m: 3, q: "Compare client–server and peer-to-peer networking.",
          steps: [["Client–server: a central server holds resources and provides services that clients request.", "MP1", ""], ["Peer-to-peer: all computers have equal status and share resources with each other directly.", "MP2", ""], ["Client–server centralises security, management and backup; peer-to-peer has no server to buy, but each user manages their own.", "MP3", ""]] },
        { v: "B", t: "Why peer-to-peer suits a home", m: 3, q: "Explain why peer-to-peer suits a family of four sharing files and a printer at home.",
          steps: [["Only a few devices, so central management is not needed.", "MP1", ""], ["The family trust each other and can choose what each shares.", "MP2", ""], ["No server to buy, configure or maintain, so cheaper and simpler.", "MP3", ""]] },
        { v: "C", t: "Why client–server suits a school", m: 3, q: "Explain why client–server suits a school with 1,200 students.",
          steps: [["Central user accounts and permissions keep work secure.", "MP1", ""], ["Files stored centrally are backed up in one place and students can log in at any computer.", "MP2", ""], ["Software and updates are managed centrally by technicians.", "MP3", ""]] }
      ]
    }],
    practice: [
      [1, 1, "In which model does each computer have equal status?", ["Peer-to-peer (1)"]],
      [1, 1, "Give one service a server provides.", ["File storage / authentication / printing / email / web (1)"]],
      [2, 2, "Give one disadvantage of peer-to-peer for a business.", ["No central backup/security (1)", "Each user must manage their own shares; hard to control (1)"]],
      [2, 2, "Explain why a client–server network's files are easier to back up.", ["Files are stored centrally on the server (1)", "So one backup covers everyone (1)"]],
      [3, 3, "A design studio of six people shares large video files. Recommend a model with reasons.", ["e.g. client–server with a file server / NAS (1)", "Central storage and backup of valuable work (1)", "Or peer-to-peer if cost matters; justified either way (1)"]],
      [3, 2, "Explain how BitTorrent-style peer-to-peer speeds up downloading a popular file.", ["Pieces are downloaded from many peers at once (1)", "Each downloader also uploads pieces, so capacity grows with demand (1)"]]
    ]
  };

  L["4.9.2.3"] = {
    archetypes: [
      { id: "cs.csma",
        rules: ["CSMA/CA: listen before transmitting; if busy, wait a random backoff time.",
          "With RTS/CTS: send a Request To Send; the access point replies Clear To Send, which also tells other stations to wait.",
          "After the data, the receiver sends an acknowledgement; no ACK means resend after backoff."],
        traps: [],
        variations: [
          { v: "A", t: "CSMA/CA with RTS/CTS", m: 6, q: "Describe how a wireless device sends data using CSMA/CA with RTS/CTS.",
            steps: [["The device listens to check whether the channel is idle.", "MP1", ""], ["If it is busy, it waits a random period (backoff) and checks again.", "MP2", ""], ["When idle, it sends a Request To Send to the access point.", "MP3", ""], ["The access point replies Clear To Send when free; other devices hearing it hold off.", "MP4", ""], ["The device transmits its data.", "MP5", ""], ["The access point sends an acknowledgement; if none arrives, the device waits and resends.", "MP6", ""]] },
          { v: "B", t: "Why RTS/CTS", m: 2, q: "Explain the hidden node problem that RTS/CTS solves.",
            steps: [["Two devices may both reach the access point but not hear each other, so both think the channel is free.", "MP1", ""], ["The CTS from the access point is heard by both, so the other waits, avoiding a collision.", "MP2", ""]] },
          { v: "C", t: "Why wait a random time", m: 1, q: "Explain why the backoff period is random.",
            steps: [["So two waiting devices are unlikely to try again at exactly the same moment and collide again.", "MP1", ""]] }
        ] },
      { id: "cs.wifi-security",
        rules: ["Measures: strong encryption (WPA2/WPA3) with a strong key; disable SSID broadcast; MAC address allow list; change default admin passwords.",
          "Say what each STOPS: encryption makes intercepted data unreadable; an allow list stops unknown devices connecting."],
        traps: [],
        variations: [
          { v: "A", t: "Secure an access point", m: 2, q: "Describe two measures to protect a wireless network from unauthorised use.",
            steps: [["Use WPA2/WPA3 encryption with a strong passphrase, so data captured cannot be read.", "MP1", ""], ["A MAC address allow list, so only known devices may connect (or hide the SSID).", "MP2", ""]] },
          { v: "B", t: "Limits of a MAC allow list", m: 2, q: "Explain why a MAC address allow list alone is not enough.",
            steps: [["MAC addresses are sent unencrypted and can be seen by an eavesdropper.", "MP1", ""], ["An attacker can spoof an allowed MAC address.", "MP2", ""]] },
          { v: "C", t: "What the SSID is", m: 1, q: "State what an SSID is.",
            steps: [["The name that identifies a wireless network.", "MP1", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "What does CTS stand for?", ["Clear To Send (1)"], { arch: "cs.csma" }],
      [1, 1, "Name one wireless encryption standard.", ["WPA2 / WPA3 (1)"], { arch: "cs.wifi-security" }],
      [2, 2, "Explain why wireless networks use collision avoidance rather than detection.", ["A device cannot listen while it transmits on the same channel (1)", "So it avoids collisions before sending instead (1)"], { arch: "cs.csma" }],
      [2, 2, "Explain why hiding the SSID gives only limited protection.", ["The SSID is still sent by connected devices and can be captured (1)", "It only stops casual users seeing the network (1)"], { arch: "cs.wifi-security" }],
      [3, 3, "Describe what a device does if it receives no acknowledgement after sending a frame.", ["Assumes a collision/loss (1)", "Waits a random backoff (1)", "Then listens and resends (1)"], { arch: "cs.csma" }],
      [3, 2, "A café offers free Wi-Fi. Explain one risk to customers and one measure the café can take.", ["Risk: others may intercept unencrypted traffic / fake hotspot (1)", "Measure: WPA2/3 with a password / client isolation (1)"], { arch: "cs.wifi-security" }]
    ]
  };

  /* ================= 4.9.3 The Internet ================= */
  L["4.9.3.1"] = {
    archetypes: [
      { id: "cs.dns",
        rules: ["A URL: protocol, fully qualified domain name, path (e.g. https / www.example.co.uk / page).",
          "DNS turns a fully qualified domain name into an IP ADDRESS — say \"IP\".",
          "Domain names form a hierarchy (root, top-level, second-level…); DNS servers hold a distributed database and forward names they do not know.",
          "Internet registries allocate IP addresses and domain names so each is unique."],
        traps: [{ sitting: "2022-06", q: "Q08.3", text: "\"Addresses\" without \"IP\" scored nothing. Better answers: the FQDN is looked up and its IP address returned; DNS servers form a hierarchy holding a distributed database; an unknown name is passed on." }],
        variations: [
          { v: "A", t: "How DNS works", m: 3, q: "Describe the purpose and operation of the Domain Name System.",
            steps: [["It translates a fully qualified domain name into the IP address of the server.", "MP1", ""], ["The request goes to a DNS server, which returns the IP address if it holds it.", "MP2", ""], ["If not, it is passed to other DNS servers up the hierarchy until one can resolve it; the answer is cached.", "MP3", ""]] },
          { v: "B", t: "Parts of a URL", m: 1, q: "In `https://shop.example.org/basket`, identify the protocol and the domain name.",
            steps: [["Protocol: https; domain name: shop.example.org.", "MP1", ""]] },
          { v: "C", t: "Internet registries", m: 2, q: "Explain the service provided by Internet registries.",
            steps: [["They allocate IP addresses and domain names.", "MP1", ""], ["So that each is globally unique, and they keep a record of who holds them.", "MP2", ""]] }
        ] },
      { id: "cs.routers",
        rules: ["Packet switching: data is split into packets, each routed independently, possibly by different routes, and reassembled.",
          "A router forwards each packet HOP BY HOP, choosing the next hop from its routing table.",
          "A gateway joins networks that use different protocols, translating between them."],
        traps: [{ sitting: "2023-06", q: "Q02.3", text: "\"Sends it to its destination\" was too thin. Routing is hop by hop: each router decides the next hop for the packet." },
          { sitting: "2023-06", q: "Q11.2", text: "Few knew the difference: a gateway translates between protocols when the networks use different ones." }],
        variations: [
          { v: "A", t: "A router's role", m: 2, q: "Explain the role of a router in packet switching.",
            steps: [["It receives a packet and reads its destination IP address.", "MP1", ""], ["It uses its routing table to forward it to the next router (hop) on the best available route.", "MP2", ""]] },
          { v: "B", t: "Gateway against router", m: 1, q: "Explain how a gateway differs from a router.",
            steps: [["A gateway connects networks using different protocols and translates between them; a router connects networks using the same protocol.", "MP1", ""]] },
          { v: "C", t: "Packet switching", m: 3, q: "Describe how packet switching sends a large file across the Internet.",
            steps: [["The file is split into packets, each with a header (source and destination addresses, sequence number).", "MP1", ""], ["Packets travel independently, possibly by different routes, chosen router by router.", "MP2", ""], ["At the destination they are reordered by sequence number and missing ones requested again.", "MP3", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "What does DNS translate a domain name into?", ["An IP address (1)"], { arch: "cs.dns" }],
      [1, 1, "Name the device that forwards packets between networks.", ["Router (1)"], { arch: "cs.routers" }],
      [2, 2, "Explain why packets may arrive out of order.", ["They are routed independently (1)", "By different routes with different delays (1)"], { arch: "cs.routers" }],
      [2, 2, "Explain how domain names are organised.", ["In a hierarchy (1)", "e.g. root → top-level (.uk) → second-level (.co.uk) → organisation (1)"], { arch: "cs.dns" }],
      [3, 3, "Explain why DNS servers cache the results of recent look-ups.", ["Most look-ups are repeated / popular sites (1)", "Answer returned without contacting other servers (1)", "Faster and less traffic (1)"], { arch: "cs.dns" }],
      [3, 2, "Explain one advantage of packet switching over sending all data along one reserved path.", ["Lines are shared, so used efficiently (1)", "Packets can route around a failed or congested link (1)"], { arch: "cs.routers" }]
    ]
  };

  L["4.9.3.2"] = {
    archetypes: [
      { id: "cs.firewall",
        rules: ["A firewall checks traffic against rules: packet filtering (IP addresses, ports, protocol), stateful inspection, a proxy server.",
          "Malware: a virus attaches to a program and needs it to run; a worm spreads by itself; a trojan pretends to be useful.",
          "Defences: patch the OS and software, antivirus, educate users, least privilege, back up."],
        traps: [],
        variations: [
          { v: "A", t: "How a firewall protects a LAN", m: 4, q: "Describe four ways a firewall can protect a local area network.",
            steps: [["Packet filtering: blocks packets from or to specified IP addresses.", "MP1", ""], ["Blocks packets for specified port numbers / protocols.", "MP2", ""], ["Stateful inspection: only allows incoming packets that belong to a connection started inside.", "MP3", ""], ["A proxy server hides internal addresses and can filter content and cache pages.", "MP4", ""]] },
          { v: "B", t: "Reduce the threat of viruses", m: 4, q: "Describe four measures to reduce the threat of viruses to a company's computers.",
            steps: [["Up-to-date antivirus software scanning files and email.", "MP1", ""], ["Install security patches for the OS and applications promptly.", "MP2", ""], ["Train staff not to open unknown attachments or links.", "MP3", ""], ["Limit user privileges so malware cannot change system files; keep backups.", "MP4", ""]] },
          { v: "C", t: "Worms, viruses and trojans", m: 3, q: "Explain the difference between a virus, a worm and a trojan.",
            steps: [["Virus: attaches itself to a host file and spreads when that file runs.", "MP1", ""], ["Worm: a standalone program that replicates and spreads across networks by itself.", "MP2", ""], ["Trojan: disguised as legitimate software to trick the user into installing it.", "MP3", ""]] }
        ] },
      { id: "cs.asymmetric",
        rules: ["Symmetric: one shared key for both directions — the key must somehow be exchanged securely.",
          "Asymmetric: EACH party has a public and a private key. Encrypt with the receiver's public key; only their private key decrypts.",
          "Digital signature: hash the message; encrypt the digest with the SENDER'S private key. The receiver decrypts it with the sender's public key and compares it with a digest they RECOMPUTE from the message.",
          "Digital certificate: a CA's signed statement binding a public key to its owner."],
        traps: [{ sitting: "2023-06", q: "Q11.5", text: "Traps: forgetting each party has its own key pair; using the wrong key at a step; \"compare the digest with the message\" — compare the decrypted digest with a RECOMPUTED digest of the message." }],
        variations: [
          { v: "A", t: "Send a message signed and secret", m: 6, q: "Alice sends Bob a confidential message and signs it. Describe how asymmetric encryption and a digital signature are used, and how Bob checks it.",
            steps: [["Alice hashes the message to make a digest.", "MP1", ""], ["She encrypts the digest with HER private key: this is the signature.", "MP2", ""], ["She encrypts the message (and signature) with BOB'S public key and sends it.", "MP3", ""], ["Bob decrypts with his private key.", "MP4", ""], ["He decrypts the signature with Alice's public key to get her digest.", "MP5", ""], ["He hashes the message himself and compares: equal means it is from Alice and unchanged.", "MP6", ""]] },
          { v: "B", t: "The key exchange problem", m: 2, q: "Explain the key exchange problem with symmetric encryption and how asymmetric encryption avoids it.",
            steps: [["Both parties need the same secret key, which must be sent to the other — and could be intercepted.", "MP1", ""], ["With asymmetric encryption only public keys are shared; the private key never leaves its owner.", "MP2", ""]] },
          { v: "C", t: "Digital certificates", m: 2, q: "Explain the purpose of a digital certificate.",
            steps: [["It is issued and signed by a trusted certificate authority.", "MP1", ""], ["It confirms that a public key belongs to the named organisation/person, so you are not tricked into using an impostor's key.", "MP2", ""]] },
          { v: "D", t: "Computationally secure", m: 1, q: "Explain what is meant by a cipher being computationally secure.",
            steps: [["It could be broken in theory, but not in a reasonable time with the computing power available.", "MP1", ""]] }
        ] }
    ],
    practice: [
      [1, 1, "Which key does a sender use to encrypt a message so only the receiver can read it?", ["The receiver's public key (1)"], { arch: "cs.asymmetric" }],
      [1, 1, "Name the type of malware that spreads without needing a host file.", ["Worm (1)"], { arch: "cs.firewall" }],
      [2, 2, "Explain why a hash is signed rather than the whole message.", ["The digest is short, so signing is faster (1)", "Any change to the message changes the digest, so integrity is still checked (1)"], { arch: "cs.asymmetric" }],
      [2, 2, "Explain how a firewall uses port numbers to block traffic.", ["Each service uses a port (e.g. 23 for Telnet) (1)", "Rules drop packets addressed to ports that should be closed (1)"], { arch: "cs.firewall" }],
      [3, 3, "Explain why HTTPS uses asymmetric encryption to start a session but symmetric encryption for the data.", ["Asymmetric solves key exchange: used to agree a session key (1)", "Symmetric is much faster for large amounts of data (1)", "So the combination is both secure and efficient (1)"], { arch: "cs.asymmetric" }],
      [3, 2, "Explain why keeping software patched protects against worms.", ["Worms exploit known vulnerabilities to spread (1)", "Patches fix those vulnerabilities, closing the route (1)"], { arch: "cs.firewall" }]
    ]
  };

  /* ================= 4.9.4 TCP/IP and addressing ================= */
  var PORT_TRAP = { sitting: "2023-06", q: "Q11.4", text: "The second mark: the client starts the connection, so the server's port must be fixed and known in advance — that is what makes it well-known." };
  L["4.9.4.1"] = {
    archetypes: [{
      id: "cs.tcpip",
      rules: ["Four layers, top down: application, transport, network (Internet), link.",
        "Transport: splits data into numbered packets, adds source and destination PORT numbers, sets up the end-to-end connection, checks and resends.",
        "Network: adds source and destination IP addresses; routing. Link: MAC addresses, the physical network.",
        "A socket is an IP address plus a port."],
      traps: [{ sitting: "2023-06", q: "Q02.1", text: "Most named only one packet field. Others: source and destination IP addresses, sequence number, time to live, checksum, payload." },
        { sitting: "2023-06", q: "Q11.1", text: "Most said only \"splits into packets\". Add port numbers, the end-to-end connection, and sequencing. A common error was describing the network layer instead." },
        PORT_TRAP],
      variations: [
        { v: "A", t: "The transport layer", m: 3, q: "Describe the role of the transport layer when an email is sent.",
          steps: [["It establishes an end-to-end connection with the receiving computer.", "MP1", ""], ["It splits the data into packets and numbers them in sequence.", "MP2", ""], ["It adds the source and destination port numbers (and checks for and resends lost packets).", "MP3", ""]] },
        { v: "B", t: "Fields of a packet", m: 2, q: "A packet header holds a sequence number. Name two other fields it typically contains.",
          steps: [["Source and destination IP addresses.", "MP1", ""], ["Time to live / checksum / protocol / packet length.", "MP2", ""]] },
        { v: "C", t: "Well-known ports", m: 2, q: "Explain what a well-known port is and why one is needed.",
          steps: [["A port number from 0–1023 reserved for a standard service, e.g. 443 for HTTPS.", "MP1", ""], ["The client starts the connection, so it must know in advance which port the server listens on.", "MP2", ""]] },
        { v: "D", t: "The network layer", m: 1, q: "State one function of the network layer.",
          steps: [["It adds the source and destination IP addresses / routes packets between networks.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the top layer of the TCP/IP stack.", ["Application layer (1)"]],
      [1, 1, "What two items make up a socket?", ["An IP address and a port number (1)"]],
      [2, 2, "Explain why the transport layer numbers packets.", ["Packets may arrive out of order (1)", "So they can be reassembled in order / missing ones detected (1)"]],
      [2, 2, "Describe what the link layer does.", ["Moves frames across the physical network (1)", "Adds MAC addresses of the next hardware hop (1)"]],
      [3, 3, "Describe the path of a web request down the TCP/IP stack on the client.", ["Application layer forms the HTTP request (1)", "Transport adds ports/sequence and sets up the connection (1)", "Network adds IP addresses; link adds MAC addresses and sends (1)"]],
      [3, 2, "Explain why a client uses a random high-numbered port for its side of a connection.", ["The client's port only needs to be unique on that computer for the session (1)", "So many connections (tabs) can run at once to the same server port (1)"]]
    ]
  };

  L["4.9.4.2"] = {
    archetypes: [{
      id: "cs.app-protocols", title: "Application layer protocols and their ports",
      match: "application layer|mail|remote login|well-known|protocols",
      rules: ["HTTP (80) web pages; HTTPS (443) secure web; FTP (20/21) file transfer; SSH (22) secure remote login; SMTP (25) send email; POP3 (110) download email; IMAP stays in sync.",
        "Give the protocol AND what it is for in the question's context."],
      traps: [PORT_TRAP],
      variations: [
        { v: "A", t: "Protocols for email", m: 2, q: "Name the protocols used to send an email and to download it to a client, and say what each does.",
          steps: [["SMTP: sends email from the client to the mail server and between mail servers.", "MP1", ""], ["POP3 (or IMAP): retrieves email from the server to the client.", "MP2", ""]] },
        { v: "B", t: "Remote login", m: 2, q: "A technician logs in to a remote server and issues commands. Name a suitable protocol and why.",
          steps: [["SSH.", "MP1", ""], ["It encrypts the session, so passwords and commands cannot be read in transit.", "MP2", ""]] },
        { v: "C", t: "Match ports to protocols", m: 2, q: "Give the well-known ports for HTTP, HTTPS, FTP control and SSH.",
          steps: [["HTTP 80, HTTPS 443.", "MP1", ""], ["FTP 21, SSH 22.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Name the protocol used to transfer web pages securely.", ["HTTPS (1)"]],
      [1, 1, "Which protocol is used to transfer files between computers?", ["FTP (1)"]],
      [2, 2, "Explain why IMAP may suit a person who reads email on a phone and a laptop.", ["Mail stays on the server (1)", "So both devices see the same, synchronised mailbox (1)"]],
      [2, 2, "Explain why Telnet should not be used for remote administration over the Internet.", ["It sends data, including passwords, unencrypted (1)", "SSH should be used instead (1)"]],
      [3, 2, "A web server is also a mail server. Explain how one IP address handles both.", ["Each service listens on its own port (1)", "The transport layer delivers each packet to the right service by port number (1)"]],
      [3, 2, "Explain the role of SMTP when an email travels from a sender to a recipient at another company.", ["The client sends to its mail server by SMTP (1)", "That server relays it to the recipient's mail server by SMTP (1)"]]
    ]
  };

  L["4.9.4.3"] = {
    archetypes: [{
      id: "cs.ip-structure", title: "IP addresses: network and host parts",
      match: "suitable ip|router ports|ip address",
      rules: ["An IP address has a network identifier part and a host identifier part.",
        "Devices on the same subnet share the network part; each needs a unique host part.",
        "The all-0 host part is the network address and the all-1 host part the broadcast address — neither can be given to a device."],
      traps: [],
      variations: [
        { v: "A", t: "The two parts", m: 2, q: "Explain the structure of an IP address.",
          steps: [["It is split into a network identifier and a host identifier.", "MP1", ""], ["The network part identifies the network/subnet; the host part identifies a device on it.", "MP2", ""]] },
        { v: "B", t: "Choose valid addresses", m: 2, q: "A subnet is 192.168.1.192/28. Which of 192.168.1.192, 192.168.1.205, 192.168.1.207 and 192.168.1.210 can be given to a computer on it? Explain.",
          steps: [["192.168.1.205: in range .192 to .207 and not the network or broadcast address.", "MP1", ""], [".192 is the network address, .207 the broadcast, and .210 is in a different subnet.", "MP2", ""]] },
        { v: "C", t: "Address a router's two ports", m: 2, q: "A router joins 10.0.4.0/22 and 172.20.45.128/26. Suggest an IP address for each of its ports.",
          steps: [["One port in 10.0.4.0/22, e.g. 10.0.4.1 (range .4.1 to .7.254).", "MP1", ""], ["One in 172.20.45.128/26, e.g. 172.20.45.129 (range .129 to .190).", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "In 192.168.5.20/24, which part is the network identifier?", ["192.168.5 (1)"]],
      [1, 1, "What is the broadcast address of 192.168.5.0/24?", ["192.168.5.255 (1)"]],
      [2, 2, "Explain why two devices on the same subnet cannot share a host identifier.", ["Packets are delivered by address (1)", "Duplicates mean the network cannot tell which device should receive them (1)"]],
      [2, 2, "Give the first and last usable host addresses in 172.20.45.128/26.", ["172.20.45.129 (1)", "172.20.45.190 (1)"]],
      [3, 2, "Explain why each port of a router has a different IP address.", ["Each port is on a different network/subnet (1)", "Its address must be in that network's range to be its gateway (1)"]],
      [3, 2, "Is 192.168.1.200 on the same /28 subnet as 192.168.1.210? Explain.", ["No (1)", "/28 gives blocks of 16: .192–.207 and .208–.223 (1)"]]
    ]
  };

  L["4.9.4.4"] = {
    archetypes: [{
      id: "cs.ip-subnet",
      rules: ["/n means the first n bits of the mask are 1: /27 = 255.255.255.224.",
        "AND an address with the mask to get its network address; two hosts are on the same subnet if those match.",
        "Hosts on a subnet: $2^{h} - 2$, where h is the number of host bits."],
      traps: [],
      variations: [
        { v: "A", t: "Write a mask in binary", m: 1, q: "Write the subnet mask for a /27 network in binary and dotted decimal.",
          steps: [["11111111.11111111.11111111.11100000 = 255.255.255.224.", "MP1", ""]] },
        { v: "B", t: "Hosts on a subnet", m: 1, q: "How many hosts can a /27 subnet hold?",
          steps: [["5 host bits: $2^5 - 2 = 30$.", "MP1", "Minus the network and broadcast addresses"]] },
        { v: "C", t: "Network address by AND", m: 2, q: "A host is 192.168.10.77/27. Find its network address and broadcast address.",
          steps: [["77 = 01001101; AND with 224 (11100000) = 01000000 = 64: network 192.168.10.64.", "MP1", ""], ["Broadcast: host bits all 1 → 192.168.10.95.", "MP2", ""]] },
        { v: "D", t: "Same subnet?", m: 2, q: "Are 10.0.5.20 and 10.0.6.200 on the same /22 subnet? Show your method.",
          steps: [["/22 mask is 255.255.252.0: AND the third octets with 252: 5 → 4 and 6 → 4.", "MP1", ""], ["Both give 10.0.4.0, so yes, the same subnet.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Write the /20 subnet mask in dotted decimal.", ["255.255.240.0 (1)"]],
      [1, 1, "How many host bits does a /24 network have?", ["8 (1)"]],
      [2, 2, "Find the network address of 172.20.45.130/26.", ["130 AND 192 = 128 (1)", "172.20.45.128 (1)"]],
      [2, 1, "How many usable host addresses does a /26 subnet have?", ["62 (1)"]],
      [3, 2, "A company needs subnets of at least 50 hosts each. What prefix length should it use, and how many hosts does each hold?", ["/26 (1)", "62 hosts (1)"]],
      [3, 2, "Explain why subnetting a large network can improve performance and security.", ["Broadcast traffic stays within each subnet (1)", "Traffic between subnets passes a router where rules can be applied (1)"]]
    ]
  };

  L["4.9.4.5"] = {
    archetypes: [{
      id: "cs.ipv6", title: "IPv4 and IPv6",
      match: "ipv6",
      rules: ["IPv4: 32-bit addresses, about 4.3 billion; nearly all allocated. IPv6: 128-bit, written as eight groups of four hex digits.",
        "IPv6 gives every device a public address, so NAT is no longer needed for address shortage."],
      traps: [],
      variations: [
        { v: "A", t: "Why IPv6 replaces IPv4", m: 1, q: "Explain why IPv6 is replacing IPv4.",
          steps: [["IPv4's 32-bit addresses (about 4.3 billion) have run out as devices multiply; IPv6's 128 bits give vastly more.", "MP1", ""]] },
        { v: "B", t: "Why IPv6 removes the need for NAT", m: 1, q: "Explain why widespread IPv6 removes the main reason for using NAT.",
          steps: [["There are enough addresses for every device to have its own public address, so private addresses need not share one.", "MP1", ""]] },
        { v: "C", t: "Compare the formats", m: 2, q: "Compare the format of IPv4 and IPv6 addresses.",
          steps: [["IPv4: 32 bits, four denary numbers 0–255 separated by dots.", "MP1", ""], ["IPv6: 128 bits, eight groups of four hexadecimal digits separated by colons (leading zeros can be dropped).", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "How many bits are in an IPv6 address?", ["128 (1)"]],
      [1, 1, "How many bits are in an IPv4 address?", ["32 (1)"]],
      [2, 2, "How many times more IPv6 addresses are there than IPv4 addresses? Give your answer as a power of 2 and explain.", ["$2^{96}$ (1)", "$2^{128} \\div 2^{32}$ (1)"]],
      [2, 1, "Why is IPv6 written in hexadecimal?", ["It is far shorter to write 128 bits in hex than in denary or binary (1)"]],
      [3, 2, "Explain why IPv4 and IPv6 must both be supported during the changeover.", ["Not every device/network supports IPv6 yet (1)", "Dual stack / translation lets both communicate (1)"]],
      [3, 2, "Explain one disadvantage of every device having a public IPv6 address.", ["Devices are directly reachable from the Internet (1)", "So they rely on firewalls rather than NAT to hide them (1)"]]
    ]
  };

  L["4.9.4.6"] = {
    archetypes: [{
      id: "cs.private-ip", title: "Public and private (non-routable) addresses",
      match: "non-routable|private|duplicate",
      rules: ["Private (non-routable) ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Routers on the Internet do not forward them.",
        "The same private addresses are reused in many networks; NAT lets them share public addresses."],
      traps: [],
      variations: [
        { v: "A", t: "Public against private", m: 2, q: "Explain the difference between public and private IP addresses.",
          steps: [["Public addresses are globally unique and routable on the Internet.", "MP1", ""], ["Private addresses are only used inside a local network, are not routed on the Internet, and can be reused by other networks.", "MP2", ""]] },
        { v: "B", t: "Why private addresses can repeat", m: 2, q: "Explain how two homes can both use 192.168.1.10 without a conflict.",
          steps: [["Private addresses are never sent onto the Internet.", "MP1", ""], ["Each home's router uses NAT to replace them with its own unique public address.", "MP2", ""]] },
        { v: "C", t: "Spot the private address", m: 1, q: "Which of these is private: 8.8.8.8, 172.18.0.5, 151.101.1.1?",
          steps: [["172.18.0.5 (in 172.16.0.0/12).", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Give one private IP address range.", ["10.0.0.0/8 or 172.16.0.0/12 or 192.168.0.0/16 (1)"]],
      [1, 1, "Is 192.168.0.1 public or private?", ["Private (1)"]],
      [2, 2, "Explain why private addresses helped delay IPv4 running out.", ["Many devices share one public address (1)", "Private ranges are reused in every network (1)"]],
      [2, 2, "Explain why a web server with a private address cannot be reached directly from the Internet.", ["Routers on the Internet drop/do not route private addresses (1)", "It needs NAT/port forwarding or a public address (1)"]],
      [3, 2, "Explain a security benefit of devices using private addresses.", ["They cannot be addressed directly from outside (1)", "Incoming connections are blocked unless forwarded (1)"]],
      [3, 2, "Two companies using 10.0.0.0/8 merge networks. Explain the problem.", ["Duplicate addresses in both networks (1)", "Devices must be renumbered / NAT used between them (1)"]]
    ]
  };

  L["4.9.4.7"] = {
    archetypes: [{
      id: "cs.dhcp", title: "DHCP",
      match: "dhcp",
      rules: ["DHCP gives a device an IP address (and subnet mask, gateway, DNS server) automatically from a pool, for a lease period.",
        "The four messages: Discover (broadcast), Offer, Request, Acknowledge.",
        "Servers keep static addresses so their address never changes."],
      traps: [],
      variations: [
        { v: "A", t: "How DHCP works", m: 4, q: "Describe the purpose and operation of DHCP.",
          steps: [["Purpose: allocate IP configuration to devices automatically when they join a network.", "MP1", ""], ["The device broadcasts a DHCP Discover message.", "MP2", ""], ["A DHCP server replies with an Offer of an address from its pool (with mask, gateway, DNS).", "MP3", ""], ["The device Requests it and the server Acknowledges, leasing it for a set time.", "MP4", ""]] },
        { v: "B", t: "An advantage of DHCP", m: 1, q: "Give one advantage of DHCP for a network manager.",
          steps: [["No manual configuration of each device / no duplicate addresses / addresses reused when devices leave.", "MP1", ""]] },
        { v: "C", t: "Why a server keeps a static address", m: 1, q: "Explain why a web server should not get its address by DHCP.",
          steps: [["Its address might change when the lease ends, so DNS records and port forwarding rules would point to the wrong place.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "What does DHCP stand for?", ["Dynamic Host Configuration Protocol (1)"]],
      [1, 1, "Name the first message a new device sends in DHCP.", ["DHCP Discover (1)"]],
      [2, 2, "Why is the DHCP Discover message a broadcast?", ["The device has no IP address yet (1)", "and does not know the DHCP server's address (1)"]],
      [2, 2, "Give two items of configuration besides the IP address that DHCP supplies.", ["Subnet mask (1)", "Default gateway / DNS server (1)"]],
      [3, 2, "Explain why DHCP leases addresses for a limited time.", ["Devices leave without releasing their address (1)", "Expired leases return addresses to the pool for reuse (1)"]],
      [3, 2, "A café's network has a pool of 50 addresses. Explain what happens when the 51st customer connects.", ["No address can be offered (1)", "They cannot connect until a lease expires / is released (1)"]]
    ]
  };

  L["4.9.4.8"] = {
    archetypes: [{
      id: "cs.dhcp-nat",
      rules: ["NAT: the router replaces a private source address (and port) with its public address and a port, recording the pair in a translation table.",
        "Replies to that public port are looked up and sent to the right private address and port.",
        "Many private devices share one public address."],
      traps: [],
      variations: [
        { v: "A", t: "An outgoing request and its reply", m: 4, q: "A laptop at 192.168.1.20 requests a file from a server on the Internet. Describe how NAT handles the request and the reply.",
          steps: [["The router replaces the private source address and port with its public address and a new port.", "MP1", ""], ["It records the mapping in its NAT table.", "MP2", ""], ["The reply arrives at the router's public address and that port.", "MP3", ""], ["The router looks up the table and forwards it to 192.168.1.20 and its original port.", "MP4", ""]] },
        { v: "B", t: "Duplicate private addresses", m: 2, q: "Explain how NAT allows many networks to use the same private addresses.",
          steps: [["Private addresses are translated to the router's public address before leaving the network.", "MP1", ""], ["So only unique public addresses appear on the Internet; the private ones never meet.", "MP2", ""]] },
        { v: "C", t: "Why NAT conserves addresses", m: 1, q: "Explain how NAT reduces the number of public IPv4 addresses needed.",
          steps: [["A whole network of devices shares one public address, distinguished by port numbers.", "MP1", ""]] }
      ]
    }],
    practice: [
      [1, 1, "What does NAT stand for?", ["Network Address Translation (1)"]],
      [1, 1, "Which device usually performs NAT in a home?", ["The router (1)"]],
      [2, 2, "Explain why the router records port numbers as well as addresses in its NAT table.", ["Several devices share one public address (1)", "The port tells the router which device a reply is for (1)"]],
      [2, 2, "Give one disadvantage of NAT.", ["Devices cannot be reached from outside without extra setup (1)", "Breaks some peer-to-peer/end-to-end protocols (1)"]],
      [3, 3, "Two computers in a house both browse the same website. Explain how the router keeps their replies apart.", ["Each outgoing connection gets a different public port (1)", "Mapping stored in the NAT table (1)", "Replies forwarded by matching the port to the right computer (1)"]],
      [3, 2, "Explain why NAT gives some protection against attacks.", ["Unsolicited incoming packets have no table entry (1)", "So they are dropped / internal addresses hidden (1)"]]
    ]
  };

  L["4.9.4.9"] = {
    archetypes: [{
      id: "cs.port-forwarding", title: "Port forwarding to a server on a private network",
      match: "forwarding|from outside|non-routable web server",
      rules: ["Port forwarding: a rule on the router sends traffic arriving on a public port to a fixed private address and port.",
        "Needed because a server with a private address cannot be reached from the Internet; the server needs a static address."],
      traps: [],
      variations: [
        { v: "A", t: "Reach a server on a private network", m: 3, q: "A games server at 192.168.1.50 listens on port 25565. Describe how a player on the Internet can reach it.",
          steps: [["The player connects to the router's public IP address on port 25565.", "MP1", ""], ["A port forwarding rule on the router matches that port.", "MP2", ""], ["The router forwards the traffic to 192.168.1.50:25565 (and replies go back through NAT).", "MP3", ""]] },
        { v: "B", t: "Why the server needs a fixed address", m: 1, q: "Explain why the server in a port forwarding rule needs a static private address.",
          steps: [["The rule names one address; if DHCP gave the server a new one, traffic would be forwarded to the wrong device.", "MP1", ""]] },
        { v: "C", t: "NAT and port forwarding together", m: 2, q: "Explain how port forwarding differs from the translation done for outgoing traffic.",
          steps: [["Outgoing NAT creates a mapping when an inside device starts a connection.", "MP1", ""], ["Port forwarding is a permanent rule so OUTSIDE devices can start connections to an inside server.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "What does a port forwarding rule map a public port to?", ["A private IP address and port (1)"]],
      [1, 1, "Why can a web server on 192.168.0.10 not be reached directly from the Internet?", ["It has a private/non-routable address (1)"]],
      [2, 2, "A home web server listens on port 80. Write the port forwarding rule needed, and say what an outside user types.", ["Public port 80 → 192.168.x.y:80 (1)", "The router's public IP (or a domain pointing to it) (1)"]],
      [2, 2, "Give one security risk of port forwarding.", ["Opens a route through the firewall to an inside device (1)", "A vulnerable server can be attacked from the Internet (1)"]],
      [3, 2, "Two web servers inside a network both use port 80. Explain how they can both be reached.", ["Forward different public ports (e.g. 80 and 8080) (1)", "Each to a different private address on port 80 (1)"]],
      [3, 2, "Explain why a dynamic public IP address causes problems for a home server, and one solution.", ["The public address can change, so users cannot find it (1)", "Dynamic DNS updates a domain name to the current address (1)"]]
    ]
  };

  L["4.9.4.10"] = {
    archetypes: [{
      id: "cs.rest",
      rules: ["REST: a client uses HTTP methods on resources named by URLs; the server runs the database query and returns the result.",
        "HTTP → CRUD → SQL: GET → Read → SELECT; POST → Create → INSERT; PUT → Update → UPDATE; DELETE → Delete → DELETE.",
        "JSON over XML: more compact, easier to read and quicker to parse; maps directly to objects.",
        "WebSocket: a persistent full-duplex connection over one TCP connection."],
      traps: [{ sitting: "2023-06", q: "Q05.4", to: "Q05.5", text: "A weak area. The URL causes a query to run on the server. Learn the mapping: GET→SELECT, POST→INSERT, PUT→UPDATE, DELETE→DELETE." }],
      variations: [
        { v: "A", t: "Map HTTP to CRUD and SQL", m: 2, q: "Give the HTTP method and SQL command for (i) adding a new review, (ii) changing a review's rating.",
          steps: [["(i) POST, INSERT.", "MP1", ""], ["(ii) PUT, UPDATE.", "MP2", ""]] },
        { v: "B", t: "What the URL does", m: 1, q: "In a RESTful application, what happens when a browser requests `https://api.example.com/films/42`?",
          steps: [["The server maps the URL to a resource and runs a query (e.g. SELECT the film with id 42), returning the result, often as JSON.", "MP1", ""]] },
        { v: "C", t: "Why JSON", m: 2, q: "Give two reasons why JSON is often chosen over XML for a web API.",
          steps: [["More compact, so less data to send.", "MP1", ""], ["Easier for people to read and quicker for programs to parse; maps directly onto objects.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "Which HTTP method is used to read a resource?", ["GET (1)"]],
      [1, 1, "Which SQL command matches the CRUD operation Create?", ["INSERT (1)"]],
      [2, 2, "Write a JSON object for a book with title \"Dune\" and year 1965.", ["Braces with key–value pairs (1)", "{\"title\": \"Dune\", \"year\": 1965} (1)"]],
      [2, 2, "Explain why a chat app uses WebSocket instead of repeated HTTP requests.", ["A persistent full-duplex connection stays open (1)", "The server can push messages immediately without polling (1)"]],
      [3, 3, "Describe what happens when a phone app deletes a saved address through a REST API.", ["App sends an HTTP DELETE to the address's URL (1)", "Server runs a DELETE query on the database (1)", "Returns a status/response to the app (1)"]],
      [3, 2, "Give one advantage of XML over JSON.", ["Can be validated against a schema / supports comments/namespaces (1)", "Explained: e.g. checks structure strictly for data exchange (1)"]]
    ]
  };

  L["4.9.4.11"] = {
    archetypes: [{
      id: "cs.thin-client",
      rules: ["Thin client: a low-specification machine; processing and storage are on the SERVER, which needs plenty of RAM, cores and storage.",
        "Thick client: does its own processing and storage; needs a powerful client.",
        "Say WHICH machine needs WHAT (RAM, processor cores, storage), not \"a powerful server\"."],
      traps: [{ sitting: "2022-06", q: "Q11", text: "Only about a third scored. \"Powerful server\" or \"cheap computer\" are not A-level answers: name RAM, cores and storage, and say which machine has them." }],
      variations: [
        { v: "A", t: "Hardware for each", m: 3, q: "Compare the hardware needed for thin-client and thick-client computing.",
          steps: [["Thin-client terminals need little: a modest processor, little RAM, little or no local storage, but a good network connection.", "MP1", ""], ["The thin-client server needs a powerful processor (many cores), a lot of RAM and large storage, as it does all the processing.", "MP2", ""], ["Thick clients need their own capable processor, RAM and storage; the server can be simpler.", "MP3", ""]] },
        { v: "B", t: "Advantages of thin clients", m: 2, q: "Give two advantages of thin-client computing for a school.",
          steps: [["Cheap terminals that are easy to replace.", "MP1", ""], ["Central management: software installed and updated once on the server; data secure and backed up centrally.", "MP2", ""]] },
        { v: "C", t: "Disadvantages", m: 2, q: "Give two disadvantages of thin-client computing.",
          steps: [["If the server or network fails, no one can work.", "MP1", ""], ["Heavy network traffic; performance falls when many users are busy at once.", "MP2", ""]] }
      ]
    }],
    practice: [
      [1, 1, "In thin-client computing, where is the processing done?", ["On the server (1)"]],
      [1, 1, "Give one example of a thick client.", ["A standard PC/laptop running its own software (1)"]],
      [2, 2, "Explain why a thin-client network depends on its network more than a thick-client one.", ["Every action needs communication with the server (1)", "Slow or broken network stops all work (1)"]],
      [2, 2, "Explain why a video editing studio would use thick clients.", ["Editing needs heavy local processing/graphics (1)", "Sending video to a server would need huge bandwidth (1)"]],
      [3, 3, "A call centre with 200 agents uses web-based software. Recommend thin or thick clients, with three reasons.", ["Thin clients (1)", "Low-cost, easily managed terminals; software updated centrally (1)", "Light processing per agent, so the server copes; data secure centrally (1)"]],
      [3, 2, "Explain why cloud services such as browser-based office suites are a form of thin-client computing.", ["Processing and storage are on remote servers (1)", "The local device mainly displays the interface (1)"]]
    ]
  };
})();
