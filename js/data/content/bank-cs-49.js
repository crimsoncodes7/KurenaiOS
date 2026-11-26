/* Kurenai OS — past-paper bank: AQA 7517 §4.9 Communication and networking.
   Modelled on AS/A-level Paper 2, June 2016–2025. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.9.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Serial vs parallel, synchronous vs asynchronous" },
    { table: { head: ["Item", "Points"], rows: [
      ["Serial vs parallel (2021, AS 2025)", "Serial: **one bit at a time** down a **single wire**; parallel: **multiple bits simultaneously**, each on a **separate wire** — both halves of the contrast are needed for the mark"],
      ["Advantages of serial (AS 2017, 2020 — 4 marks: advantage + how)", "**Cheaper** — fewer wires / simpler hardware · no **crosstalk** — only one line, bits cannot interfere · no **data skew** — bits cannot arrive out of step because only one is sent at a time · usable over **longer distances** — skew and crosstalk worsen with distance"],
      ["Why parallel inside the computer (2024)", "Short fixed distances and high volume — many bits at once; peripherals are far away and movable, so serial"],
      ["Start bit / stop bit (2022)", "Start bit **starts the receiver's clock ticking / synchronises it with the transmitter's**; stop bit **gives the receiver time to process the data and lets the next start bit be recognised** — \"marks the end\" is rejected"],
      ["Synchronous vs asynchronous (2019, 2023, 2024)", "Synchronous: transmitter and receiver **continuously synchronised by a common clock** / timing information sent alongside the data. Asynchronous: **no shared clock**; the receiver's clock is synchronised **by the start bit** for the duration of each transmission"]
    ]}}
  ],
  flashcards: [
    ["Define serial transmission.", "Bits are sent one after another along a single wire / channel.", 10],
    ["State three advantages of serial over parallel transmission.", "Cheaper (fewer wires, simpler hardware); no crosstalk between wires; no data skew, so usable over longer distances and at higher clock rates.", 12],
    ["What is data skew?", "In parallel transmission, bits sent simultaneously arrive at slightly different times because the wires differ, worsening with distance.", 13],
    ["What is crosstalk?", "Interference between adjacent parallel wires, corrupting the signals.", 14],
    ["What is synchronous transmission?", "Transmitter and receiver are continuously synchronised by a common clock signal, with timing information sent alongside the data.", 16],
    ["What is asynchronous transmission?", "No shared clock; each byte is framed by a start bit, which synchronises the receiver's clock for that transmission, and a stop bit.", 17],
    ["What is the purpose of the stop bit?", "To give the receiver time to process the received data and to allow the next start bit to be recognised.", 19]
  ],
  quiz: [
    { q: "Serial transmission sends:", opts: ["8 bits at once on 8 wires", "one bit at a time on one wire", "whole bytes at once in parallel", "one byte at a time on one wire"], ans: 1, why: "Serial transmission sends one bit after another along a single wire or channel." },
    { q: "Crosstalk is:", opts: ["interference between signals on wires next to each other", "the delay before a signal reaches the receiver", "bits on parallel wires arriving at different times", "the receiver's clock drifting from the sender's"], ans: 0, why: "Signals on neighbouring wires interfere." },
    { q: "The stop bit:", opts: ["marks the end of the whole transmission of the message", "lets the receiver process the byte and spot the next start bit", "carries the parity bit the receiver uses to check for errors", "resets the shared clock so sender and receiver stay in step"], ans: 1, why: "'Marks the end' is rejected." },
    { q: "In asynchronous transmission, the gap between two bytes:", opts: ["can vary; each byte is framed by start and stop bits", "must be exactly one clock pulse in every case", "is fixed by a clock signal on a separate wire", "is filled with parity bits until the next byte"], ans: 0, why: "No shared clock; framing does the synchronising." },
    { q: "Asynchronous transmission suits a keyboard because:", opts: ["keys are pressed at irregular times", "it sends many bits at the same time", "it needs a clock wire to the computer", "each byte must arrive at a fixed rate"], ans: 0, why: "Data arrives in bursts." },
    { q: "Parallel transmission is still used:", opts: ["over very short distances, such as inside a chip", "for long cables running between two buildings", "for wireless links between nearby devices", "wherever data skew must be avoided"], ans: 0, why: "Skew is negligible over millimetres." }
  ],
  exam: [
    { level: "AS", src: "AQA 2020 · P2 Q10.4", q: "Describe two advantages of serial transmission over parallel transmission, explaining how each advantage arises.", marks: 4,
      ms: ["Cheaper (1) — fewer wires / less complex hardware needed (1)", "No crosstalk (1) — there is only one transmission line so bits cannot interfere (1)", "No data skew (1) — only one bit is transmitted at a time so bits arrive in order (1)", "Usable over longer distances (1) — because skew and crosstalk do not occur (1)", "Max 4 — two advantages with explanations"] },
    { src: "AQA 2022 · P2 Q02", ctx: "A sensor sends readings to a controller using asynchronous serial transmission with one start bit, seven data bits, a parity bit and one stop bit.",
      parts: [
        { q: "Describe how parallel transmission differs from the serial transmission used here.", marks: 2, ms: ["Multiple bits are transmitted simultaneously (1)", "Each bit on a different wire / line (1)"] },
        { q: "State one advantage of using serial rather than parallel transmission for this link.", marks: 1, ms: ["Cheaper wiring / no crosstalk / no data skew / usable over a longer distance (1)"] },
        { q: "State the purpose of the start bit.", marks: 1, ms: ["To start the receiver's clock ticking / synchronise the receiver's clock with the transmitter's (1)"] },
        { q: "State the purpose of the stop bit.", marks: 1, ms: ["To give the receiver time to process the data / to allow the next start bit to be recognised (1)"] }
      ] },
    { src: "AQA 2024 · P2 Q03.2", q: "Explain what is meant by synchronous transmission.", marks: 1,
      ms: ["Transmitter and receiver are continuously synchronised by a common clock / timing information is transmitted alongside the data (1)"] },
    { src: "AQA 2019 · P2 Q09.1", q: "Explain the difference between asynchronous and synchronous serial transmission.", marks: 2,
      ms: ["Asynchronous: no common clock; the receiver's clock is synchronised to the transmitter's by a start bit at the start of each transmission (1)", "Synchronous: transmitter and receiver are continuously synchronised by a common clock / timing signal sent with the data (1)"] }
  ]
});

X("compsci:4.9.1.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Bit rate, baud rate, bandwidth, latency" },
    { kv: [
      ["Bit rate", "The number of **bits transmitted per second**"],
      ["Baud rate", "The number of **signal changes per second** on the medium"],
      ["Bit rate vs baud rate (AS 2024, 2025; A-level 2017, 2021)", "Bit rate can **exceed** baud rate when **more than one bit is encoded in each signal change**: 8 voltage levels → 3 bits per symbol; bit rate = baud × bits per symbol (500 baud × 3 = 1500 bps)"],
      ["Bandwidth", "The **range of frequencies** a medium can carry; **directly proportional** to the maximum bit rate — \"bandwidth constrains bit rate\" is NE"],
      ["Latency", "The **delay between an action being initiated and its effect being noticed** / time for data to reach the receiver — \"delay in transmission\" is NE"]
    ]},
    { callout: { t: "warn", body: "The 2022 false statement: *latency is the rate at which signals on a line can change* — that is the **baud rate**." }}
  ],
  flashcards: [
    ["Define baud rate.", "The number of signal changes (symbols) per second on the medium.", 10],
    ["How can bit rate exceed baud rate?", "By encoding more than one bit in each signal change — e.g. four voltage levels carry 2 bits per change, so bit rate = 2 × baud.", 11],
    ["A link uses 8 voltage levels at 500 baud. Bit rate?", "3 bits per symbol × 500 = 1500 bits per second.", 12],
    ["Define bandwidth.", "The range of frequencies that a medium can transmit — directly proportional to the maximum bit rate.", 13],
    ["Define latency.", "The delay between an action being initiated and its effect being observed — the time taken for data to travel to the receiver.", 14],
    ["Relationship between bandwidth and bit rate?", "Directly proportional: greater bandwidth allows a higher bit rate.", 15],
    ["Which is measured in Hz: bit rate or bandwidth?", "Bandwidth (a range of frequencies); bit rate is in bits per second.", 16]
  ],
  quiz: [
    { q: "How many signal levels are needed to carry 3 bits per signal change?", opts: ["8", "3", "6", "9"], ans: 0, why: "Each signal level carries a bit pattern, and 3 bits give 2³ = 8 patterns, so 8 levels are needed." },
    { q: "1200 baud with 4 levels gives a bit rate of:", opts: ["1200", "2400", "4800", "300"], ans: 1, why: "2 bits per symbol." },
    { q: "Latency matters most for:", opts: ["a live video call", "a large download overnight", "a backup of photos to the cloud", "an email with an attachment"], ans: 0, why: "Delay is noticed in real-time use." },
    { q: "Bandwidth is:", opts: ["the number of bits the medium sends per second", "the range of frequencies a medium can carry", "the number of wires in the cable", "the maximum length a cable run can have"], ans: 1, why: "Bandwidth is the range of frequencies a medium can carry, which sets how much data per second." },
    { q: "'Latency is the rate at which a signal can change' is:", opts: ["true — that is the definition of latency", "false — that is baud rate", "true, but only for serial links", "false — that is the bit rate"], ans: 1, why: "2022 false statement." },
    { q: "Bit rate equals baud rate when each signal change carries:", opts: ["one bit", "two bits", "four bits", "no bits"], ans: 0, why: "Bit rate = baud rate × bits per signal change." }
  ],
  exam: [
    { level: "AS", src: "AQA 2024 · P2 Q11.1", q: "Explain the difference between baud rate and bit rate, and describe how the bit rate of a link can be higher than its baud rate.", marks: 2,
      ms: ["Baud rate is the number of signal changes per second; bit rate is the number of bits transmitted per second (1)", "Bit rate exceeds baud rate when more than one bit is encoded in each signal change (e.g. using several voltage levels) (1)"] },
    { src: "AQA 2017 · P2 Q03", ctx: "A communication link uses eight distinct voltage levels and operates at 500 baud.",
      parts: [
        { q: "State how many bits are represented by each signal change.", marks: 1, ms: ["3 (1)"] },
        { q: "Calculate the bit rate of the link.", marks: 1, ms: ["1500 bits per second (1)"] },
        { q: "State the relationship between bandwidth and bit rate.", marks: 1, ms: ["They are directly proportional — the greater the bandwidth, the higher the bit rate (1)"] }
      ] },
    { level: "AS", src: "AQA 2017 · P2 Q08.2", q: "Define the terms *bit rate* and *latency*.", marks: 2,
      ms: ["Bit rate: the number of bits that can be transmitted in one second (1)", "Latency: the delay between an action being instigated and its effect being noticed / the time for transmitted data to arrive (1)"] }
  ]
});

X("compsci:4.9.2.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Physical vs logical topology; star and bus" },
    { kv: [
      ["Physical topology", "The **physical layout / arrangement of the cabling and connections** between devices — a list of names (bus, star) is NE"],
      ["Logical topology", "**How data / packets flow** around the network / the architecture of the communication mechanism"],
      ["Physical star (AS 2018, 2023)", "Every device has its **own cable to a central switch (or hub)**; the switch **reads the destination address** and **forwards the frame only to the intended device**; a cable failure affects one device; more cable and a switch needed"],
      ["Logical bus (AS 2020)", "All devices share **one communication channel / medium**; a frame is **broadcast to every device** and only the addressed one processes it; devices must **check the medium is idle** and **collisions** can occur"],
      ["Physical star behaving as a logical bus (AS 2022, 2025)", "A **hub** at the centre repeats every frame to every port, so the star-wired network **behaves as a bus** — every device receives every frame"]
    ]}
  ],
  flashcards: [
    ["Define physical topology.", "The physical layout / arrangement of the cabling and connections between the devices on a network.", 8],
    ["Define logical topology.", "How data flows around the network — the architecture of the communication mechanism, independent of the cabling.", 9],
    ["Describe a physical star topology.", "Each device has its own cable to a central switch; the switch forwards each frame only to the port of the destination device.", 10],
    ["Describe a logical bus topology.", "All devices share one communication channel; every frame is broadcast to all devices and only the addressed device processes it; collisions can occur.", 11],
    ["How can a physical star operate as a logical bus?", "If the central device is a hub rather than a switch, it repeats every frame to every port, so all devices see all traffic as on a bus.", 12],
    ["Give two advantages of a physical star.", "A cable fault affects only one device; a switch sends traffic only where needed, so fewer collisions and better security.", 13],
    ["Give one disadvantage of a physical star.", "More cabling and a central switch are needed; the switch is a single point of failure.", 14],
    ["What is a hub?", "A device that repeats incoming frames to every port — no addressing.", 15]
  ],
  quiz: [
    { q: "Physical topology describes:", opts: ["how the devices are cabled together", "how the data flows between devices", "which protocol each device uses", "how fast each link can send data"], ans: 0, why: "The physical layout of the cables." },
    { q: "In a physical star, a switch forwards a frame to:", opts: ["every device connected to it", "only the destination device", "the router, which passes it on", "no one until the line is idle"], ans: 1, why: "Address-based forwarding." },
    { q: "A star wired network with a hub in the centre behaves logically as a:", opts: ["ring", "bus", "mesh", "tree"], ans: 1, why: "Hub broadcasts everything." },
    { q: "Listing 'bus, star, ring' as the definition of physical topology scores:", opts: ["1", "0", "2", "3"], ans: 1, why: "NE — must describe layout." },
    { q: "A disadvantage of a physical star is:", opts: ["if the central switch fails, the whole network fails", "a break in one cable stops every other device", "all the devices must share one single cable", "only one device can send data at any time"], ans: 0, why: "The switch is a single point of failure." },
    { q: "A cable break in a physical star affects:", opts: ["the whole network, as on a bus", "only the device on that cable", "the server and every client", "nothing — the cable is shared"], ans: 1, why: "Dedicated cables." }
  ],
  exam: [
    { level: "AS", src: "AQA 2018 · P2 Q08", ctx: "A small office network is wired as a physical star with a switch at the centre.",
      parts: [
        { q: "Explain the difference between a physical and a logical topology.", marks: 2, ms: ["Physical: the layout / arrangement of the cabling and connections between the devices (1)", "Logical: how the data / packets flow around the network (1)"] },
        { q: "Describe how a physical star topology operates.", marks: 2, ms: ["Each device is connected by its own cable to a central switch (1)", "The switch reads the destination address of each frame and forwards it only to the intended device (1)"] }
      ] },
    { level: "AS", src: "AQA 2025 · P2 Q13.3", q: "Explain how a network with a physical star topology can operate as a logical bus.", marks: 2,
      ms: ["If the central device is a hub (rather than a switch) it repeats every frame to every port (1)", "So every device receives every frame, as it would on a shared bus, and only the addressed device processes it (1)"] },
    { level: "AS", src: "AQA 2020 · P2 Q10.1", q: "Describe how a network with a logical bus topology operates.", marks: 3,
      ms: ["All devices share a single communication channel / medium (1)", "A frame is broadcast to every device but only the device with the matching address processes it (1)", "A device must check the channel is free before transmitting; collisions can occur if two transmit at once (1)"] }
  ]
});

X("compsci:4.9.2.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Client–server vs peer-to-peer — 2 to 6 marks, most papers" },
    { table: { head: ["Peer-to-peer", "Client–server"], rows: [
      ["Each computer has **equal status** — can act as both client and server", "One or more computers are **servers**; the others are **clients**"],
      ["Resources stored on and shared from **any** computer", "Resources stored on the **server**; clients **request** them"],
      ["**No centralised** security / administration — each user manages their own machine", "**Centralised** management of security — log in to access the server"],
      ["No reliance on a central server; the same resource can be shared from several machines", "Resources unavailable if the server is off; the server must always be on"],
      ["Ordinary hardware and software", "Server hardware/software can be **optimised** for providing services"]
    ]}},
    { callout: { t: "tip", h: "Which suits whom?", body: "**Peer-to-peer** for a home / student house / small trusting group: few devices, users trust each other, no confidential data, no server cost, no expertise needed; and for **large file-sharing** networks where the load is spread across peers. **Client–server** for a school / bank: many users, some untrustworthy, confidential data, complex access rights, centralised backup and control of Internet/printing." }}
  ],
  flashcards: [
    ["Describe client–server networking.", "One or more computers act as servers holding resources; the other computers are clients that request services / resources from the servers, with centralised security and administration.", 8],
    ["Describe peer-to-peer networking.", "Every computer has equal status and can act as both client and server; resources are stored on and shared from any machine; there is no central server or centralised security.", 9],
    ["Give one disadvantage of client–server.", "Resources are unavailable if the server fails; a server and expertise to configure it cost money.", 12],
    ["Give one disadvantage of peer-to-peer.", "No central security or backup; each machine must be on for its resources to be available; management is harder as the network grows.", 13],
    ["Why does peer-to-peer suit a large file-sharing network?", "The load is spread across many peers rather than one server; the same file can be shared from many machines.", 14],
    ["Which model can optimise hardware for providing services?", "Client–server — the server can have fast disks, more RAM, etc.", 15]
  ],
  quiz: [
    { oi: 5, q: "Centralised security management is a feature of:", opts: ["peer-to-peer", "client–server", "bus topology", "wireless"], ans: 1, why: "Log in to the server." },
    { oi: 6, q: "A bank chooses client–server because:", opts: ["it is always cheaper to set up and run than peer-to-peer", "confidential data needs central control and access rights", "servers are optional, so it can grow without buying one", "peers would be faster for many users at once"], ans: 1, why: "AS 2018 P2 Q8.3." },
    { oi: 7, q: "A weakness of client–server:", opts: ["there is no central backup of the shared data", "resources unavailable if the server is down", "there is no way to control user access", "every computer has equal status on it"], ans: 1, why: "Single point of dependence." },
    { oi: 8, q: "'Cheaper' as a reason for peer-to-peer scores only if you add:", opts: ["a price for each computer", "that no server needs to be bought", "the topology of the network", "the protocol the computers use to talk"], ans: 1, why: "R. cheaper without explanation." },
    { oi: 9, q: "Resources in a peer-to-peer network are stored:", opts: ["on one central server", "on any of the computers", "in a cloud storage service", "on the router's own disk"], ans: 1, why: "With no central server, resources are stored on whichever computers hold them." }
  ],
  exam: [
    { src: "AQA 2022 · P2 Q08", ctx: "A family with four laptops and a printer sets up a home network.",
      parts: [
        { q: "Describe three differences between peer-to-peer and client–server networking.", marks: 3, ms: ["Peer-to-peer: each computer has equal status / can act as client and server; client–server: some computers are designated servers (1)", "Peer-to-peer: resources stored on and shared from any computer; client–server: resources stored on the server and accessed by clients (1)", "Peer-to-peer: no centralised security management; client–server: centralised security — users log in to the server (1)", "Peer-to-peer: no reliance on a central server; client–server: resources unavailable if the server is off / server hardware can be optimised (1)", "Max 3"] },
        { q: "Explain why peer-to-peer networking is more suitable for this family's network.", marks: 3, ms: ["Small number of devices / users (1)", "Users trust each other and no confidential data needs complex security (1)", "Avoids the cost of a server and the expertise needed to set one up; each user chooses what to share (1)"] }
      ] },
    { src: "AQA 2025 · P2 Q05", q: "Explain why a school would use client–server rather than peer-to-peer networking.", marks: 3,
      ms: ["Large number of users and devices to manage (1)", "Not all users can be trusted and confidential data (e.g. student records) will be stored (1)", "Complex management of access rights is needed — different groups need different privileges; centralised control of security, printing and Internet access (1)"] },
    { level: "AS", src: "AQA 2023 · P2 Q13.2", q: "Describe how a client–server network operates.", marks: 2,
      ms: ["Resources / services are stored on and provided by the server (1)", "Clients send requests to the server, which responds by providing the resource (1)"] }
  ]
});

X("compsci:4.9.2.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Wireless — SSID, WPA2, MAC filtering, CSMA/CA" },
    { table: { head: ["Item", "Points"], rows: [
      ["SSID", "The **name / identifier** of a wireless network (2 marks with: *hiding its broadcast means only users who know the name can try to connect* — it will not appear in the list of available networks)"],
      ["WPA2", "**Encrypts** the data transmitted, so an unauthorised device that intercepts it cannot read it"],
      ["MAC address white list", "A MAC address is **unique to each network interface card**; the access point checks the connecting device's MAC address against the list and **only listed devices may connect** — poor for a coffee shop: open access wanted, list maintenance is time-consuming and needs technical staff, customers have several devices"],
      ["Hardware to join a wireless network", "A wireless network interface card / adapter (and an access point)"],
      ["CSMA/CA with RTS/CTS (6 marks — 2018, 2021, AS 2019)", "1 Transmitter **listens / checks for traffic** on the channel · 2 if busy it **waits** (a random time) · 3 when idle it sends a **Request To Send** · 4 the access point replies with **Clear To Send** · 5 if no CTS arrives the device waits and re-sends the RTS · 6 on CTS it **transmits the data** · 7 the receiver sends an **ACK** · 8 if no ACK, the data is re-sent"]
    ]}}
  ],
  flashcards: [
    ["How does disabling SSID broadcast improve security?", "The network name does not appear in the list of available networks, so only users who already know the SSID can attempt to connect.", 11],
    ["What is the role of WPA2?", "It encrypts data transmitted over the wireless network so that intercepted transmissions cannot be read by unauthorised devices.", 12],
    ["How does a MAC address white list work?", "Each network interface card has a unique MAC address; the access point only allows devices whose MAC address is on the approved list to connect.", 13],
    ["Why is MAC filtering unsuitable for a coffee shop?", "Customers should be able to connect freely; maintaining the list is time-consuming and needs technical knowledge; customers may have several devices.", 14],
    ["Describe CSMA/CA with RTS/CTS.", "Listen until the channel is idle; send Request To Send; the access point replies Clear To Send; transmit; the receiver sends an ACK. No CTS or ACK: wait a random time and retry.", 15],
    ["Why is collision avoidance used in wireless rather than collision detection?", "A wireless device cannot transmit and listen at the same time, and the hidden-node problem means it may not hear another station's transmission.", 16],
    ["What is the hidden node problem and how does RTS/CTS help?", "Two stations out of range of each other can both reach the access point and collide; the CTS from the access point is heard by all, reserving the channel.", 18],
    ["What does an ACK do in CSMA/CA?", "Confirms the data arrived intact; its absence triggers retransmission.", 19]
  ],
  quiz: [
    { q: "Wi-Fi uses CSMA/CA rather than collision detection because:", opts: ["a wireless device cannot detect collisions while it sends", "Wi-Fi devices have no MAC addresses to check", "wired networks do not need any access rules", "radio signals never collide with each other"], ans: 0, why: "It avoids collisions it could not detect." },
    { q: "WPA2 provides:", opts: ["a name for the wireless network", "encryption of transmitted data", "filtering of devices by MAC address", "a firewall that blocks open ports"], ans: 1, why: "Encryption protocol." },
    { q: "A MAC address is unique to:", opts: ["each user who logs on", "each network interface card", "each website on the Internet", "each router on a network"], ans: 1, why: "Hardware address." },
    { q: "In CSMA/CA the first step before transmitting is:", opts: ["send the data and wait for an ACK", "check whether the channel is idle", "send an ACK to the access point", "encrypt the frame with WPA2"], ans: 1, why: "CSMA/CA first checks that the channel is idle (carrier sense) before it transmits, to avoid collisions." },
    { q: "RTS/CTS helps with the 'hidden node' problem by:", opts: ["telling every device the channel is booked", "making each device's signal stronger", "giving each device its own frequency", "sending each frame twice to be safe"], ans: 0, why: "Nodes that hear the CTS hold back." },
    { q: "If the channel is busy in CSMA/CA, a device:", opts: ["waits a random time, then checks again", "sends at once and hopes for the best", "stops sending for good", "sends a jam signal to every device"], ans: 0, why: "Random back-off." },
    { q: "Hiding the SSID stops:", opts: ["every attack on the wireless network", "the network appearing in the list of available networks", "encryption of the data that is sent across the network", "anyone spoofing the MAC address of an allowed device"], ans: 1, why: "Obscurity, not encryption." }
  ],
  exam: [
    { src: "AQA 2021 · P2 Q11.5", q: "A laptop on a wireless network needs to send data to the access point. Describe how CSMA/CA with Request To Send / Clear To Send is used during the transmission.", marks: 6,
      ms: ["The laptop checks / listens for traffic on the channel (1)", "If another transmission is in progress it continues to wait (1)", "When the channel is idle it sends a Request To Send (RTS) to the access point (1)", "The access point responds with a Clear To Send (CTS); if no CTS is received the laptop waits a random time and re-sends the RTS (1)", "On receiving the CTS the laptop transmits its data (1)", "The access point sends an acknowledgement (ACK) when all the data is received; if no ACK arrives the data is re-sent (1)"] },
    { level: "AS", src: "AQA 2023 · P2 Q12", ctx: "A coffee shop offers free wireless Internet access to customers.",
      parts: [
        { q: "State what an SSID is and explain how disabling its broadcast would affect customers.", marks: 2, ms: ["The name / identifier of the wireless network (1)", "The network would not appear in the list of available networks, so customers could only connect if told the name (1)"] },
        { q: "Explain the role of WPA2 on the network.", marks: 2, ms: ["Encrypts the data transmitted across the wireless network (1)", "So that an unauthorised device that intercepts the transmissions cannot read them (1)"] },
        { q: "Explain why MAC address filtering would be unsuitable for the coffee shop.", marks: 2, ms: ["The shop wants any customer to be able to connect / open access in a public space (1)", "Every customer device would have to be added manually — time-consuming, needs technical staff, and customers with several devices would be inconvenienced (1)"] }
      ] },
    { level: "AS", src: "AQA 2017 · P2 Q08.4", q: "Explain how a MAC address white list improves the security of a wireless network.", marks: 2,
      ms: ["A MAC address is unique to each network interface card / device (1)", "The access point only allows devices whose MAC address is on the authorised list to connect; others are refused (1)"] },
    { src: "AQA 2018 · P2 Q13.1", q: "Describe two measures that could be used to improve the security of a wireless access point, explaining how each is effective.", marks: 2,
      ms: ["Use WPA2 — encrypts transmissions so intercepted data cannot be read without the key (1)", "Disable SSID broadcast — the network is harder to discover / must be known to connect; or a MAC address white list — only devices with a listed address can connect (1)"] }
  ]
});

X("compsci:4.9.3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Internet structure — DNS, routers, packets, domains" },
    { kv: [
      ["DNS (2022, 3 marks)", "Purpose: **translates fully qualified domain names into IP addresses** (URLs is rejected). How: DNS servers hold a **database / table of FQDNs and IP addresses**; it is a **distributed, hierarchical** system — if one server cannot resolve a name the query is **passed to another**"],
      ["Router in packet switching (2023)", "Determines **which outgoing link / next router** to send the packet along using the **best / shortest / cheapest path**; **updates its routing table** for congestion or failure; changes the **MAC address** for the next hop; drops packets whose time-to-live has expired"],
      ["Gateway vs router (2023)", "A gateway **connects two networks that use different protocols**, performing protocol conversion; a router connects networks of the same protocol"],
      ["Packet fields (2023)", "Besides source/destination IP and payload: **port numbers, sequence number, time to live, checksum, packet size, protocol identifier**"],
      ["Domain names (2024)", "**Hierarchical**: top-level domain (uk, com), second-level (co, ac), the organisation's domain, then subdomains; the URL's protocol (http) and file path are not part of the domain name"],
      ["Internet registries (2024)", "Register domain names to organisations, keeping them **unique** and entering the mappings into the DNS"],
      ["Routing across the internet (2020 essay)", "Routers are organised **hierarchically** (local → national → international → down again); **each router chooses the next hop** — the path is not fixed at the start"]
    ]}
  ],
  flashcards: [
    ["Describe how DNS works.", "DNS servers hold tables of domain names and IP addresses; a server that cannot resolve a name passes the query to another, higher one; the IP address is returned to the client.", 12],
    ["What is the role of a router in packet switching?", "Reads the destination IP address, chooses the best next hop from its routing table, forwards the packet, and updates routes to reflect congestion or failures.", 14],
    ["What is a gateway?", "A device connecting two networks that use different protocols, converting between them.", 15],
    ["Name four fields in a packet besides the payload and IP addresses.", "Source/destination port numbers, sequence number, time to live (hop limit), checksum.", 17],
    ["How are domain names organised?", "Hierarchically: top-level domain (e.g. uk), second-level (co), the organisation's domain (aqa), then subdomains, read right to left.", 18],
    ["What service do internet registries provide?", "They register domain names to organisations, ensuring each is unique, and enter the mappings into the DNS.", 19],
    ["What is a URL?", "Uniform Resource Locator — protocol, domain name (or IP) and path identifying a resource, e.g. http://www.example.org/index.html.", 20]
  ],
  quiz: [
    { oi: 5, q: "If a local DNS server cannot resolve a name it:", opts: ["returns an error straight to the client", "passes the query to another DNS server", "guesses the nearest matching address", "uses NAT to find the address"], ans: 1, why: "Distributed hierarchy." },
    { oi: 6, q: "A router decides:", opts: ["the entire path to the destination", "the next hop for each packet", "the packet's contents", "the domain name"], ans: 1, why: "A router reads each packet's destination and chooses the next hop, one step at a time." },
    { oi: 8, q: "In `https://shop.example.co.uk/basket`, the top-level domain is:", opts: ["shop", "example", "co", "uk"], ans: 3, why: "The top-level domain is the last part of the domain name, which here is uk." },
    { oi: 10, q: "Internet registries ensure that:", opts: ["packets arrive in the same order that they were sent", "domain names are unique and registered to owners", "routers forward packets by the shortest route", "every wireless network is encrypted with WPA2"], ans: 1, why: "Registries make sure each domain name is unique and is recorded against its registered owner." }
  ],
  exam: [
    { src: "AQA 2022 · P2 Q08.3", q: "Explain the purpose of the Domain Name System and describe how it works.", marks: 3,
      ms: ["Translates fully qualified domain names into IP addresses (1)", "DNS servers store a database / table of domain names and their IP addresses; the system is distributed and hierarchical (1)", "If a DNS server cannot resolve a lookup the query is passed to another DNS server (1)"] },
    { src: "AQA 2023 · P2 Q02", ctx: "A packet travelling across the internet contains a source IP address, a destination IP address, a checksum and the payload.",
      parts: [
        { q: "State two other fields typically found in a packet.", marks: 2, ms: ["Port number(s) / sequence number (1)", "Time to live / packet size / protocol identifier (1)"] },
        { q: "Describe the role of a router in packet switching.", marks: 2, ms: ["Determines which outgoing link / next router to send the packet to, using the most efficient path (1)", "Updates its routing table to reflect congestion or failures / changes the MAC address for the next hop / discards packets whose time to live has expired (1)"] }
      ] },
    { src: "AQA 2024 · P2 Q07", ctx: "The URL `http://pastpapers.aqa.org.uk/computing/2024.pdf` is entered into a browser.",
      parts: [
        { q: "State the protocol and the domain name in the URL.", marks: 1, ms: ["Protocol HTTP; domain name pastpapers.aqa.org.uk (accept aqa.org.uk) (1)"] },
        { q: "Describe how domain names are organised.", marks: 2, ms: ["Hierarchically (1)", "e.g. `uk` is the top-level domain, `org` a second-level domain, `aqa` the organisation's domain and `pastpapers` a subdomain (1)"] },
        { q: "Describe the service provided by internet registries and explain why it is needed.", marks: 2, ms: ["They register domain names to organisations / store who owns each domain (1)", "To ensure domain names are unique / to enter the name-to-IP mappings into the DNS (1)"] }
      ] },
    { src: "AQA 2023 · P2 Q11.2", q: "Explain how a gateway differs from a router.", marks: 1,
      ms: ["A gateway connects networks that use different protocols, performing protocol conversion; a router connects networks using the same protocol (1)"] }
  ]
});

X("compsci:4.9.3.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Firewalls, digital signatures, certificates, viruses" },
    { kv: [
      ["Firewall (2020 — 4 marks)", "Blocks/allows traffic on specific **ports** (protocols) · from specific **IP addresses** · certain **packet types** · **stateful inspection**: keeps information about current connections and passes only packets belonging to them · acts as a **proxy** so outside computers cannot reach LAN devices directly · rules specify conditions · examines **packet headers** (packet filtering)"],
      ["Digital signature — sending (2019, 2023)", "Calculate a **hash / message digest** of the message → encrypt the digest with the **sender's private key** = the **digital signature** → append it → encrypt message + signature with the **receiver's public key**"],
      ["Digital signature — receiving", "Decrypt with the **receiver's private key** → **re-hash** the message → decrypt the signature with the **sender's public key** → if the two digests **match**, the sender is authenticated and the message unaltered"],
      ["Digital certificate", "Issued by a certificate authority to confirm that a public key belongs to a named organisation"],
      ["Reducing the virus threat (2024 — 4 marks)", "Monitoring: firewall, spam/web filters, checksums/signatures on downloads · Protection: automatic OS/app updates, sandbox/VM, least-privilege access rights, disable macros, restrict unverified software, offline backups, disable removable media · Code quality: prevent buffer overflow, security testing, code review, trusted libraries. Naming a method without describing its use scores nothing"]
    ]}
  ],
  flashcards: [
    ["Describe four ways a firewall protects a LAN.", "Blocks or allows traffic by port or protocol; blocks given IP addresses; blocks certain packet types; stateful inspection admits only packets from current connections; acting as a proxy, it hides LAN devices.", 10],
    ["What is stateful inspection?", "The firewall keeps information about current connections and only lets through packets that are part of one.", 11],
    ["Describe how a digital signature is created and attached.", "A hash (digest) of the message is calculated and encrypted with the sender's private key to form the signature; it is appended, and message plus signature are encrypted with the receiver's public key.", 13],
    ["Describe how a digital signature is verified.", "The receiver decrypts with their private key, re-hashes the message, decrypts the signature with the sender's public key, and compares the two digests — a match authenticates the sender and confirms integrity.", 14],
    ["What is a digital certificate?", "A document issued by a certificate authority confirming that a public key belongs to a particular organisation.", 15],
    ["Give two 'protection' measures against viruses.", "Keep the OS and applications automatically updated; run untrusted programs in a sandbox / virtual machine; set access rights to limit damage; keep offline backups; disable macros and removable media.", 16],
    ["Give two 'monitoring' measures against viruses.", "Firewall blocking high-risk sources; spam filters blocking suspicious emails or attachments; web filters; checksums or digital signatures to verify downloaded files.", 17],
    ["What is a worm and how does it differ from a virus?", "A worm is self-replicating over the network without attaching to a host file; a virus attaches to a program and spreads when it runs.", 18],
    ["What is a Trojan?", "Malware disguised as legitimate software that the user installs willingly.", 19]
  ],
  quiz: [
    { q: "Blocking all traffic on port 23 is an example of a firewall:", opts: ["application-level proxy", "port/protocol filtering", "stateful inspection", "MAC address filter"], ans: 1, why: "Port-based rule." },
    { q: "A valid digital signature shows that a message:", opts: ["came from the sender and was not changed", "was encrypted so nobody else can read it", "passed through a firewall without harm", "was sent over a secure Wi-Fi network"], ans: 0, why: "Authentication and integrity." },
    { q: "The receiver verifies the signature using:", opts: ["the sender's public key", "the receiver's private key", "the sender's private key", "no key"], ans: 0, why: "Decrypts the digest." },
    { q: "A digital certificate confirms:", opts: ["a downloaded file has not been compressed", "a public key belongs to a named organisation", "a password is strong enough to be accepted", "a port on the server is open for traffic"], ans: 1, why: "A certificate, issued by a certificate authority, ties a public key to a named organisation so it can be trusted." },
    { q: "Which is a 'code quality' defence against viruses?", opts: ["Taking regular backups of the code", "Preventing buffer overflow in code", "Filtering spam email before it arrives", "Using a network firewall"], ans: 1, why: "2024 mark scheme." },
    { q: "'Use a firewall' as an answer to 'describe measures against viruses' scores:", opts: ["1 — it names a measure", "0 — the use must be described", "2 — it is a valid measure", "half — it needs to name a product"], ans: 1, why: "Naming a tool earns nothing; the answer must describe how it works, such as filtering traffic by rules." },
    { q: "Stateful inspection allows packets that:", opts: ["come from any address on the Internet", "belong to an existing connection", "are larger than a set size", "are encrypted with a trusted key"], ans: 1, why: "Connection tracking." }
  ],
  exam: [
    { src: "AQA 2020 · P2 Q05.3", q: "Describe four ways in which a firewall could protect the computers on a LAN.", marks: 4,
      ms: ["Block or allow traffic on specific ports / specific protocols (1)", "Block or allow traffic from specific IP addresses (1)", "Block certain types of packet, e.g. pings (1)", "Stateful inspection — maintains information about current connections and only allows packets relevant to them (1)", "Act as a proxy so that computers on the Internet cannot access LAN devices directly (1)", "Identify unusual behaviour from a host, e.g. sending unusually large amounts of data (1)", "Max 4"] },
    { src: "AQA 2023 · P2 Q11.5", q: "Company A sends a confidential contract to Company B by email, using asymmetric encryption and a digital signature so that B can be sure the contract came from A and has not been altered. Describe the process at both the sending and receiving ends, identifying which key is used at each stage.", marks: 6,
      ms: ["A calculates a hash / message digest of the contract (1)", "A encrypts the digest with A's private key — this is the digital signature — and appends it to the message (1)", "A encrypts the message and signature with B's public key and sends them (1)", "B decrypts the message and signature with B's private key (1)", "B recalculates the hash of the message and decrypts the signature with A's public key to obtain the original digest (1)", "If the two digests match, B knows the message came from A and has not been altered (1)", "Level of response: 5–6 comprehensive with at least three keys correct; 3–4 significant parts with two keys; 1–2 a few points"] },
    { src: "AQA 2024 · P2 Q01", q: "Describe four measures an organisation could take to reduce the threat posed by viruses.", marks: 4,
      ms: ["Enable automatic updates of the operating system and applications so code vulnerabilities are patched (1)", "Run programs / open files in a sandbox or virtual machine so a virus cannot affect the real system (1)", "Configure a firewall to block packets from high-risk sources / use spam filters to block suspicious attachments (1)", "Set access rights so users and programs cannot modify important files; disable macros; restrict execution of unverified software (1)", "Keep backups offline so data can be recovered after an infection (1)", "Verify downloaded files with digital signatures / checksums; review and test code for vulnerabilities such as buffer overflow (1)", "Max 4 — a method must be described, not just named"] }
  ]
});

X("compsci:4.9.4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The four layers — what each does" },
    { table: { head: ["Layer", "Role", "Exam phrasing"], rows: [
      ["Application", "Selects the application protocol (HTTP, FTP, SMTP…)", "Named protocols and their purposes (see 4.9.4.2)"],
      ["Transport (TCP)", "Establishes an **end-to-end connection**; **splits data into segments** and numbers them; adds **port numbers** so the data reaches the right application; **error detection / retransmission**; **flow control**", "2019: *uses the port number to determine which server software should deal with the request*; 2023 (3 marks): three of the above"],
      ["Network (IP)", "Adds **source and destination IP addresses**; **routes** each packet to the next hop; header checksum; splits into datagrams", "2019: *adds IP addresses / performs routing*"],
      ["Link", "Adds **MAC addresses** for the next hop; physical transmission on the local network", "MAC addresses change hop by hop; IP addresses do not"]
    ]}},
    { callout: { t: "def", h: "Protocol (AS 2016, 2019, 2022)", body: "A **set of rules** governing **communication** between devices — format, order and meaning of messages." }}
  ],
  flashcards: [
    ["Define a protocol.", "A set of rules governing communication between devices — the format, order and meaning of the messages exchanged.", 10],
    ["What does the transport layer do?", "Establishes an end-to-end connection, splits data into numbered segments, adds port numbers to identify the application, detects errors and requests retransmission, controls flow.", 12],
    ["What does the network layer do?", "Adds source and destination IP addresses to packets and routes them across networks to the next hop.", 13],
    ["What does the link layer do?", "Adds the MAC addresses of the sender and the next hop and transmits the frame on the physical local network.", 14],
    ["Which addresses change at each hop and which stay the same?", "MAC addresses change at every router; IP addresses stay the same end to end.", 15],
    ["How does the transport layer use port numbers?", "It attaches source and destination port numbers so the receiving computer passes the data to the correct application (e.g. port 80 → web server).", 16],
    ["What is a socket?", "The combination of an IP address and a port number identifying one end of a connection, e.g. 192.168.1.5:80.", 17],
    ["What is encapsulation in the stack?", "Each layer adds its own header around the data from the layer above as it passes down the stack; headers are removed in reverse on receipt.", 18]
  ],
  quiz: [
    { oi: 5, q: "IP addresses are added by the:", opts: ["transport layer", "network layer", "link layer", "application layer"], ans: 1, why: "IP addresses are added by the network layer, in the IP header, so packets can be routed." },
    { oi: 6, q: "MAC addresses:", opts: ["stay the same end to end", "change at each hop", "are added by TCP", "are the same as IP addresses"], ans: 1, why: "Link-layer, local." },
    { oi: 7, q: "Splitting data into numbered segments is done by:", opts: ["IP", "TCP", "HTTP", "Ethernet"], ans: 1, why: "Transport layer." },
    { oi: 8, q: "A protocol is best defined as:", opts: ["a standard for the cables used", "a set of rules for communication", "an IP address for each device", "a device that routes packets"], ans: 1, why: "A protocol is an agreed set of rules for how devices communicate, so they understand each other." }
  ],
  exam: [
    { src: "AQA 2023 · P2 Q11.1", q: "Describe the role of the transport layer when an email is sent from a client to a mail server.", marks: 3,
      ms: ["Establishes an end-to-end connection between the client and the server (1)", "Splits the message into segments and adds sequence numbers so it can be reassembled in order (1)", "Adds port numbers so the data is passed to the correct application on the server / performs error detection and requests retransmission of corrupted segments / flow control (1)"] },
    { src: "AQA 2019 · P2 Q02.2", q: "Explain how the transport layer uses port numbers when a request arrives at a server running both a web server and an email server.", marks: 1,
      ms: ["It uses the destination port number to determine which server software / application should deal with the request (e.g. 80 → web server, 25 → mail server) (1)"] },
    { src: "AQA 2019 · P2 Q02.3", q: "State two functions of the network layer.", marks: 2,
      ms: ["Adds source and destination IP addresses to packets (1)", "Performs routing — selects the next hop for each packet / creates a header checksum / splits data into datagrams (1)"] },
    { level: "AS", src: "AQA 2022 · P2 Q10.2", q: "Define the term *protocol*.", marks: 1,
      ms: ["A set of rules governing communication between devices (1)"] }
  ]
});

X("compsci:4.9.4.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Application-layer protocols — name and purpose" },
    { kv: [
      ["HTTP / HTTPS", "Requesting and transferring web pages; HTTPS adds encryption (TLS)"],
      ["FTP", "Transferring files between client and server (upload/download)"],
      ["SMTP", "**Sending** email from a client to a server and between mail servers"],
      ["POP3", "**Retrieving** email — downloads messages to the client (usually removing them from the server)"],
      ["IMAP", "**Managing** email on the server — messages stay on the server and are synchronised across devices"],
      ["SSH", "Secure remote login — an **encrypted** connection to execute commands on a remote server; can also tunnel other protocols"],
      ["Well-known port (2023)", "A port number **reserved / assigned by IANA** for a specific service (80 HTTP, 443 HTTPS, 25 SMTP, 110 POP3, 143 IMAP, 21 FTP, 22 SSH); needed because the **client initiates** the communication and must know which port to contact"]
    ]},
    { callout: { t: "warn", body: "For \"name two application-layer protocols\" do **not** give TCP or IP — they are transport/network protocols and score nothing. POP3 and IMAP both retrieve mail, so their *purposes* must differ (download vs manage on server) to earn both marks." }}
  ],
  flashcards: [
    ["What is IMAP for?", "Managing email that remains on the server, so it can be read and synchronised from several devices.", 12],
    ["What is SSH for?", "Secure (encrypted) remote login to execute commands on another computer; can also tunnel other protocols.", 14],
    ["What is a well-known port and why is it needed?", "A port number reserved for a specific service (80 for HTTP, 25 for SMTP…); because the client initiates the communication it must know in advance which port the server listens on.", 16],
    ["Give the well-known ports for HTTP, HTTPS, FTP, SMTP, SSH.", "80, 443, 21, 25, 22.", 17],
    ["Which protocol would a technician use to administer a remote server securely?", "SSH.", 18],
    ["Which mail protocol suits reading email on several devices?", "IMAP — messages stay on the server.", 19]
  ],
  quiz: [
    { q: "Email is sent between mail servers using:", opts: ["POP3", "IMAP", "SMTP", "FTP"], ans: 2, why: "Sending protocol." },
    { q: "A user reads the same mailbox on a phone and a laptop. Best protocol:", opts: ["POP3", "IMAP", "SMTP", "SSH"], ans: 1, why: "Server-side management." },
    { q: "Port 443 is used by:", opts: ["HTTP", "HTTPS", "FTPS", "SMTP"], ans: 1, why: "Well-known port." },
    { q: "Naming TCP as an application-layer protocol scores:", opts: ["1", "0", "2", "half"], ans: 1, why: "TCP belongs to the transport layer, not the application layer, so naming it as application-layer is wrong." },
    { q: "A well-known port is assigned by:", opts: ["the user", "IANA", "the router", "DHCP"], ans: 1, why: "Reserved numbers." },
    { q: "FTP is used to:", opts: ["transfer files between a client and a server", "send email between two mail servers", "look up the IP address for a domain name", "log in to a remote server securely"], ans: 0, why: "File Transfer Protocol." }
  ],
  exam: [
    { src: "AQA 2023 · P2 Q11", ctx: "A company runs its own email server, which staff access from the office and from home.",
      parts: [
        { q: "Name two application-layer protocols the email system would use and state the purpose of each.", marks: 4, ms: ["SMTP (1) — to send / transmit email to another mail server or from the client (1)", "POP3 or IMAP (1) — so clients can retrieve (POP3) / manage on the server (IMAP) their email (1)", "Accept HTTP/HTTPS for web-mail access; reject TCP / IP"] },
        { q: "Explain what is meant by a well-known port and why the mail server uses one.", marks: 2, ms: ["A port number reserved for a specific purpose / assigned by IANA (e.g. 25 for SMTP) (1)", "The client initiates the communication, so the port must be the same and known in advance for all clients (1)"] }
      ] },
    { src: "AQA 2019 · P2 Q02.1", q: "A server hosts a company's email and is administered remotely by technicians. Name two application-layer protocols that would be used and explain what each is used for.", marks: 4,
      ms: ["SMTP (1) — sending / transmitting email (1)", "POP3 / IMAP (1) — clients retrieving / managing email on the server (1)", "SSH (1) — a secure connection for technicians to execute commands on the server remotely (1)", "HTTPS (1) — web-based access to email or control panels (1)", "Max 4: two protocols with purposes"] }
  ]
});

X("compsci:4.9.4.3", {
  flashcards: [
    ["How long is an IPv4 address and how is it written?", "32 bits, written as four denary numbers 0–255 separated by dots, e.g. 192.168.1.20.", 8],
    ["What are the two parts of an IP address?", "The network identifier (which network) and the host identifier (which device on that network).", 9],
    ["Why does the network part matter for routing?", "Routers use the network ID to decide where to forward a packet; only the final network uses the host ID.", 11],
    ["How is the boundary between network and host parts defined?", "By the subnet mask (or the /n prefix length).", 12],
    ["Which addresses in a subnet cannot be given to hosts?", "The all-zeros host address (the network address) and the all-ones host address (broadcast).", 13],
    ["How many hosts can a /20 network hold, and why?", "4 094: 12 host bits give 2¹² = 4 096 addresses, less the network and broadcast addresses.", 100],
    ["What is the network address of 172.16.45.200/20?", "172.16.32.0: the top four bits of 45 (0010 1101) are 0010 = 32, and every host bit is 0.", 101]
  ],
  quiz: [
    { q: "An IPv4 address has:", opts: ["16 bits", "32 bits", "64 bits", "128 bits"], ans: 1, why: "An IPv4 address is four 8-bit octets, which makes 32 bits." },
    { q: "The host ID part of an IP address identifies:", opts: ["one device on its network", "the network the device is on", "the router at the network edge", "the subnet mask in use"], ans: 0, why: "Network ID + host ID." },
    { q: "192.168.1.0/24 — which of these is NOT assignable to a host?", opts: ["192.168.1.1", "192.168.1.254", "192.168.1.255", "192.168.1.100"], ans: 2, why: "Broadcast address." },
    { q: "IPv6 addresses are:", opts: ["32-bit", "64-bit", "128-bit", "256-bit"], ans: 2, why: "Eight 16-bit groups." },
    { q: "Two hosts on the same subnet share the same:", opts: ["host ID", "network ID", "MAC address", "port"], ans: 1, why: "Same network part." },
    { q: "Routers on the Internet forward packets using the:", opts: ["host ID", "network ID", "MAC address", "SSID"], ans: 1, why: "Destination network." },
    { qk: "100", q: "A /27 network can hold how many hosts?", opts: ["32", "27", "30", "5"], ans: 2, why: "32 − 27 = 5 host bits: 2⁵ = 32 addresses, less the network and broadcast addresses, is 30." },
    { qk: "101", q: "A host is 192.168.64.10/20. Which address is on the same network?", opts: ["192.168.80.5", "192.168.63.1", "192.168.96.2", "192.168.75.3"], ans: 3, why: "A /20 here covers third octets 64–79, so only 75 shares the network ID 192.168.64.0." }
  ],
  exam: [
    { src: "AQA 2021 · P2 Q11.1", ctx: "A network 192.168.192.0/20 is connected to a second network 192.168.64.0/20 by Router 1. Port A of the router is on the first network and port B on the second; computer C is on the second network.",
      parts: [
        { q: "Give a suitable IP address for port A, for port B and for computer C.", marks: 3, ms: ["Port A: 192.168.x.y with x in 192–207 and y 0–255, not the network or broadcast address (1)", "Port B: 192.168.x.y with x in 64–79, not 192.168.64.0 or 192.168.79.255 (1)", "Computer C: another valid address in the 192.168.64.0/20 range, different from port B (1)"] },
        { q: "State the network and host parts of the address you gave for computer C.", marks: 1, ms: ["First 20 bits (192.168.64–79 prefix) are the network ID; the remaining 12 bits identify the host (1)"] }
      ] }
  ]
});

X("compsci:4.9.4.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Subnet masks — 2018, 2020, 2021" },
    "**/27 in binary**: 11111111.11111111.11111111.11100000 (255.255.255.224). **Hosts on a /27**: 2⁵ − 2 = **30** (network and broadcast addresses excluded). **/20**: 255.255.240.0. **Same subnet test** (2020 essay): AND the mask with each IP address → the **network IDs**; if they are **equal** the packet goes **directly**, if **different** it goes **via the router / gateway**.",
    { callout: { t: "tip", body: "Write the mask in binary, count the 1s for the prefix length, and the 0s for the host bits. Hosts = 2^(host bits) − 2. To find the network ID, copy the IP's bits where the mask is 1 and write 0 where it is 0." }}
  ],
  flashcards: [
    ["What is a subnet mask?", "A 32-bit pattern of leading 1s and trailing 0s that marks which bits of an IP address form the network ID (1s) and which the host ID (0s).", 8],
    ["Write 255.255.240.0 as a prefix length.", "/20.", 10],
    ["How many hosts can a /24 subnet hold?", "254.", 12],
    ["How does a host decide whether a destination is on its own subnet?", "It ANDs the mask with its own address and with the destination address; if the two network IDs are equal the destination is local, otherwise the packet is sent to the default gateway.", 13],
    ["Find the network ID of 172.16.35.9/20.", "172.16.32.0 (35 = 00100011; keeping the top 4 bits gives 00100000 = 32).", 14],
    ["Why subtract 2 when counting hosts?", "The all-zeros host part is the network address and all-ones is the broadcast address.", 15]
  ],
  quiz: [
    { q: "/27 in dotted decimal is:", opts: ["255.255.255.0", "255.255.255.224", "255.255.255.240", "255.255.224.0"], ans: 1, why: "27 ones → last octet 11100000 = 224." },
    { q: "Usable hosts on a /27:", opts: ["32", "30", "27", "62"], ans: 1, why: "A /27 leaves 5 host bits: 2⁵ = 32 addresses, minus the network and broadcast addresses, gives 30." },
    { q: "255.255.240.0 is:", opts: ["/20", "/24", "/16", "/28"], ans: 0, why: "255.255.240.0 has 8 + 8 + 4 = 20 leading ones, so it is /20." },
    { q: "Two addresses with different network IDs communicate via:", opts: ["the switch on their LAN", "the router / gateway", "a hub joining them", "a DNS server"], ans: 1, why: "Different subnets." },
    { q: "The network ID is found by:", opts: ["ORing the mask and address", "ANDing the mask and address", "XORing them", "adding them"], ans: 1, why: "ANDing the address with the subnet mask keeps the network bits and zeroes the host bits, leaving the network ID." },
    { q: "192.168.10.77/26 is on the network:", opts: ["192.168.10.0", "192.168.10.64", "192.168.10.77", "192.168.10.128"], ans: 1, why: "77 = 01001101; top 2 host-octet bits 01 → 64." }
  ],
  exam: [
    { src: "AQA 2018 · P2 Q05", ctx: "A network uses the subnet mask /27.",
      parts: [
        { q: "Write the subnet mask in binary.", marks: 1, ms: ["11111111.11111111.11111111.11100000 (1)"] },
        { q: "State the maximum number of hosts that can be connected to the subnet.", marks: 1, ms: ["30 (2⁵ − 2) (1)"] },
        { q: "Computer A has address 10.0.0.40 and computer B 10.0.0.70, both with mask /27. Explain how computer A determines whether it can send a packet directly to B.", marks: 3, ms: ["A ANDs the subnet mask with its own IP address and with B's address to obtain the two network IDs (1)", "10.0.0.40 → network 10.0.0.32; 10.0.0.70 → network 10.0.0.64 (1)", "The network IDs differ, so B is on another subnet and the packet must be sent via the router / gateway (1)"] }
      ] },
    { src: "AQA 2021 · P2 Q11.2", q: "Identify the subnet mask that corresponds to a /20 network from: 255.255.255.0, 255.255.224.0, 255.255.240.0, 255.240.0.0.", marks: 1,
      ms: ["255.255.240.0 (1)"] }
  ]
});

X("compsci:4.9.4.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "IPv4 vs IPv6 — 2021, 2024, 2025 essay" },
    "Why IPv6: **IPv4 is running out of unique addresses** (2³² ≈ 4.3 billion) while IPv6 (2¹²⁸) provides **enough for every device to have a unique, routable address** — which **eliminates the need for NAT** and gives true end-to-end connectivity; also simpler routing, automatic configuration without DHCP, better multicast and traffic prioritisation, larger packets, and devices can keep their address when they move.",
    { callout: { t: "warn", body: "\"IPv6 has more addresses\" is NE for the NAT question — say **every device can have its own public address, so private addresses and translation are no longer needed**." }}
  ],
  flashcards: [
    ["Why is IPv6 replacing IPv4?", "IPv4's 32-bit space (about 4.3 billion addresses) is exhausted; IPv6's 128-bit space provides enough addresses for every device.", 11],
    ["Why does IPv6 remove the need for NAT?", "Every device can have its own unique public / routable address, so private addresses no longer need translating.", 12],
    ["Give three other advantages of IPv6.", "Simpler and more efficient routing; automatic configuration without DHCP; better multicasting and traffic prioritisation; larger packets; devices keep their address when they move.", 13],
    ["How is an IPv6 address written?", "Eight groups of four hexadecimal digits separated by colons, with runs of zeros compressed to ::.", 14],
    ["Why did IPv4 exhaustion not stop the Internet growing?", "NAT lets many devices on private networks share one public address; DHCP reuses addresses from a pool.", 15],
    ["What is dual stack?", "Running IPv4 and IPv6 simultaneously on a device during the transition.", 16],
    ["What size is an IPv6 address in bits and in hex digits?", "128 bits; 32 hex digits.", 17],
    ["Is IPv6 backward compatible with IPv4?", "No — transition mechanisms (dual stack, tunnelling, translation) are needed.", 18]
  ],
  quiz: [
    { q: "The main reason for IPv6 is:", opts: ["it is faster than IPv4 routing", "IPv4 addresses are running out", "it adds encryption to every packet", "it makes each packet smaller"], ans: 1, why: "Address exhaustion." },
    { q: "IPv4 addresses ran out mainly because:", opts: ["far more devices now connect to the Internet", "each IPv4 address expires after a few years", "every router uses up a thousand addresses", "private addresses cannot be used twice"], ans: 0, why: "About 4.3 billion addresses for many more devices." },
    { q: "Number of IPv6 addresses:", opts: ["2³²", "2⁶⁴", "2¹²⁸", "2²⁵⁶"], ans: 2, why: "An IPv6 address has 128 bits, so there are 2¹²⁸ addresses." },
    { q: "In IPv6 notation, '::' means:", opts: ["one run of all-zero groups is left out", "the address is a private one", "the next part is written in denary", "the address includes a port number"], ans: 0, why: "Zero compression, used once per address." },
    { q: "Which is an IPv6 advantage besides address space?", opts: ["Every device must use a DHCP server to join", "Devices keep their address when moving networks", "Packets are smaller than those in IPv4", "No routing is needed at all between separate networks"], ans: 1, why: "Mobility support." },
    { q: "'IPv6 has more addresses' as the reason NAT is not needed is:", opts: ["full marks — it gives the reason", "NE — must say every device gets a unique public address", "wrong — NAT is still needed on an IPv6 network", "half marks — it needs an example of an IPv6 address"], ans: 1, why: "Not enough: it must say that every device can have its own unique public address, so address sharing is not needed." }
  ],
  exam: [
    { src: "AQA 2021 · P2 Q11.3", q: "Explain why IPv6 has been introduced to replace IPv4.", marks: 1,
      ms: ["There are not enough unique addresses in IPv4 / IPv4 addresses are running out (1)"] },
    { src: "AQA 2024 · P2 Q07.7", q: "Explain why network address translation would no longer be needed if every network used IPv6.", marks: 1,
      ms: ["There are enough IPv6 addresses for every device in the world to have its own unique public / routable address (1)"] },
    { src: "AQA 2025 · P2 Q08", q: "Discuss how the exhaustion of IPv4 addresses has been managed, with reference to private addresses and NAT, DHCP, and the introduction of IPv6.", marks: 12,
      ms: ["IPv4: 32-bit addresses give about 4.3 billion — far fewer than the number of connected devices, so unique public addresses ran out (1–2)", "Private / non-routable address ranges (10.x, 172.16–31.x, 192.168.x) can be reused on every LAN because they are never routed on the Internet (1–2)", "NAT: the router replaces the private source address with its own public address and records the mapping (with a generated port number) in a translation table, using it to forward replies back — many devices share one public address (1–3)", "DHCP: automates allocation of addresses from a pool with leases, so addresses are reused efficiently and configuration needs no expert (1–2)", "IPv6: 128-bit addresses give enough for every device to have a unique routable address, removing the need for NAT and giving end-to-end connectivity; simpler routing, auto-configuration, better multicast; transition via dual stack (1–3)", "Level 4 (10–12): all areas with good understanding and a reasoned line; Level 3 (7–9): two areas well plus some of the third; Level 2 (4–6); Level 1 (1–3)"] }
  ]
});

X("compsci:4.9.4.6", {
  flashcards: [
    ["What is a private (non-routable) IP address?", "An address from a reserved range (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) that is used only inside a LAN and is never forwarded by Internet routers.", 11],
    ["What is a public (routable) IP address?", "A globally unique address that routers on the Internet will forward packets to.", 12],
    ["Why can two different LANs both use 192.168.2.3?", "Private addresses are never routed on the Internet; NAT translates them to the router's public address when packets leave.", 13],
    ["Name the three private IPv4 ranges.", "10.0.0.0–10.255.255.255; 172.16.0.0–172.31.255.255; 192.168.0.0–192.168.255.255.", 14],
    ["Can a computer on the Internet send a packet directly to 192.168.0.5?", "No — the address is non-routable; it can only be reached via the LAN's public address with port forwarding.", 15],
    ["What must a router do for a private-addressed device to use the Internet?", "Network address translation — replace the private source address with its public address.", 16],
    ["Give one benefit of private addressing beyond conserving addresses.", "Security — devices are not directly reachable from the Internet.", 17],
    ["Which address does a web server see when a home device visits it?", "The home router's public IP address.", 18],
    ["Is 172.15.0.1 private or public, and why?", "Public: 172.16.0.0/12 covers second octets 16 to 31 only.", 100],
    ["Does a private address protect a device from attack?", "Partly: no one outside can start a connection to it directly, but it is not secret or encrypted, so a firewall is still needed.", 101]
  ],
  quiz: [
    { q: "Private addresses are used:", opts: ["inside a LAN, behind a router", "on the public Internet backbone", "only by servers on the Internet", "only for IPv6 devices on a LAN"], ans: 0, why: "They are not routed on the Internet." },
    { q: "Which could a home router's DHCP give a laptop?", opts: ["192.168.0.23", "8.8.8.8", "172.32.1.5", "11.0.0.4"], ans: 0, why: "The others are public addresses." },
    { q: "A private address must be unique:", opts: ["only within its own LAN", "across the whole Internet", "across every LAN in a country", "only on the day it is issued"], ans: 0, why: "Other LANs reuse the same ranges." },
    { q: "Which range is NOT private?", opts: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "172.32.0.0/16"], ans: 3, why: "Private IPv4 ranges include 172.16.0.0 to 172.31.255.255 only, so 172.32.x.x is a public range." },
    { q: "A web server on the Internet sees requests from a home LAN coming from:", opts: ["each device's private address", "the router's public address", "the ISP's DNS", "the MAC address"], ans: 1, why: "NAT replaces the private source address with the router's public address, so the server only sees that." },
    { q: "A benefit of private addressing:", opts: ["routing is faster with shorter addresses", "devices are not directly reachable from the Internet", "no DHCP server is needed to give out addresses", "the addresses are longer, so there are more of them"], ans: 1, why: "Security by design." },
    { qk: "100", q: "Which address is private?", opts: ["172.15.8.1", "192.169.0.4", "172.30.8.1", "11.0.0.1"], ans: 2, why: "172.16.0.0/12 runs from 172.16 to 172.31, so 172.30 is inside it; 172.15, 192.169 and 11 are all public." },
    { qk: "101", q: "Thirty school computers visit one website, and its log shows a single address because", opts: ["the router's NAT gives them one public address", "the website merges visits from the same school", "DHCP gave all thirty the same private address", "the browsers hide each computer's own address"], ans: 0, why: "Each private source address is replaced by the router's one public address as packets leave the LAN." }
  ],
  exam: [
    { src: "AQA 2020 · P2 Q05.2", q: "A computer on one home network has IP address 192.168.2.3, and a computer on a different home network has the same IP address. Explain why this does not cause a problem when both computers use the Internet.", marks: 2,
      ms: ["192.168.2.3 is a private / non-routable address that is never used on the Internet itself (1)", "Network address translation is performed by each router, replacing the private address with the router's public address as packets pass onto the Internet (1)"] },
    { src: "AQA 2017 · P2 Q09.1", q: "A router connects a LAN using the private range 192.168.0.0/24 to the Internet. State a suitable IP address for the router's LAN port and explain why the address 192.168.0.255 could not be used.", marks: 2,
      ms: ["192.168.0.x where x is 1–254, e.g. 192.168.0.1 (1)", "192.168.0.255 is the broadcast address of the subnet (and .0 is the network address), so neither can be assigned to a device (1)"] }
  ]
});

X("compsci:4.9.4.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "DHCP — 2018, 2020, 2024" },
    "**Purpose**: to **automate the configuration of hosts** joining a TCP/IP network — allocating **IP address, subnet mask, default gateway** (and DNS server). **Why**: reduces the need for expert knowledge and time; **makes efficient use of a limited pool of addresses** (reuse); avoids errors such as **duplicate addresses**. **The exchange** (2 marks, in order): 1 host **broadcasts a discover** request · 2 DHCP server(s) **offer** a configuration · 3 host **requests / accepts** one offer · 4 server **acknowledges** the allocation (a lease). **Why not for a server** (2024): its address might **change**, so port forwarding / DNS entries would break — give it a **static / reserved** address.",
  ],
  flashcards: [
    ["What is the purpose of DHCP?", "To automate the configuration of hosts connecting to a TCP/IP network by allocating an IP address, subnet mask, default gateway and DNS server.", 11],
    ["Give two reasons DHCP is used.", "No expert knowledge or time needed to configure each host; efficient use of a limited pool of addresses through reuse; avoids errors such as duplicate addresses or wrong subnet masks.", 12],
    ["Describe the DHCP exchange.", "The host broadcasts a discover message; DHCP servers offer a configuration; the host requests (accepts) one; the server acknowledges the allocation with a lease.", 13],
    ["What is a DHCP lease?", "The period for which an allocated address is valid; the host must renew it or the address returns to the pool.", 14],
    ["Why should a web server not use DHCP?", "Its IP address might change, so port forwarding rules and DNS entries would no longer reach it — it needs a static (or reserved) address.", 15],
    ["What information besides the IP address does DHCP provide?", "Subnet mask, default gateway address, DNS server address, lease time.", 17],
    ["How does DHCP help a café with many visiting devices?", "Addresses are handed out on demand and reclaimed when leases expire, so a small pool serves many transient users.", 18]
  ],
  quiz: [
    { q: "Without DHCP, each device would need:", opts: ["its address set up by hand", "a new MAC address each day", "its own DNS server to run", "a separate router of its own"], ans: 0, why: "Static configuration." },
    { q: "The DHCP Offer message contains:", opts: ["an address the server proposes to lend", "the host's request for a fixed address", "the acknowledgement that ends the exchange", "the MAC address of the DNS server"], ans: 0, why: "Discover, Offer, Request, Acknowledge." },
    { q: "The correct order is:", opts: ["offer, discover, request, ack", "discover, offer, request, ack", "request, offer, ack, discover", "ack, discover, offer, request"], ans: 1, why: "DHCP runs discover, offer, request, acknowledge: the client asks, the server offers, the client accepts and the server confirms." },
    { q: "A benefit of DHCP:", opts: ["a faster connection to the Internet", "efficient reuse of a limited pool of addresses", "encryption of the traffic sent between devices", "no router is needed on the network"], ans: 1, why: "Address management." },
    { q: "On a home network the DHCP server usually runs on:", opts: ["the router", "each laptop", "the ISP's web server", "a DNS server online"], ans: 0, why: "The router hands out the addresses." },
    { q: "When a lease expires and is not renewed the address:", opts: ["is lost for good", "returns to the pool", "becomes public", "is blocked for a day"], ans: 1, why: "When a lease runs out unrenewed the DHCP server takes the address back and can reuse it for another device." }
  ],
  exam: [
    { src: "AQA 2018 · P2 Q05.3", q: "Explain the purpose of DHCP, why it is used, and describe the messages exchanged when a host joins the network.", marks: 4,
      ms: ["Purpose: to automate the configuration of hosts connecting to a network — allocating IP address, subnet mask and default gateway (1)", "Why: reduces the need for expert knowledge / time to configure hosts; makes efficient use of a limited pool of addresses; avoids errors such as duplicate addresses (1)", "The host broadcasts a request to discover a DHCP server; the server(s) offer a configuration (1)", "The host accepts an offer (echoing it back); the server confirms the allocation (1)"] },
    { src: "AQA 2024 · P2 Q07.5", q: "Explain why a web server on a LAN should not obtain its IP address from a DHCP server.", marks: 1,
      ms: ["Its IP address might change, so port forwarding (or DNS) would no longer direct traffic to it — it needs a fixed / static address (1)"] },
    { src: "AQA 2020 · P2 Q05.1", q: "State one advantage of using DHCP to allocate IP addresses on a network.", marks: 1,
      ms: ["No expert knowledge needed to configure hosts / less time to configure / efficient use of a limited pool of addresses / avoids duplicate addresses (1)"] }
  ]
});

X("compsci:4.9.4.8", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "NAT — how an outgoing request and its reply are handled (2024, 4 marks)" },
    { ol: [
      "**Outgoing**: the router replaces the packet's **private source IP address** with its own **public address**",
      "It replaces the **source port number** with a port number **it generates**",
      "It records the mapping (generated port → original private IP and port) in its **NAT translation table**",
      "**Reply**: the router recognises the reply by its **destination port number** and **looks it up** in the table",
      "It replaces the destination address (its public address) with the **original private IP address** (and the original port) and forwards the packet to that computer"
    ]},
    { callout: { t: "tip", body: "Name the **table** — \"the router remembers the mapping\" without a structure is NE. And distinguish NAT (outgoing, dynamic) from **port forwarding** (incoming, fixed rule)." }}
  ],
  flashcards: [
    ["What is network address translation?", "The process by which a router replaces the private IP addresses of LAN devices with its own public address on outgoing packets, and reverses the change on replies.", 11],
    ["What is the NAT translation table?", "The router's record mapping each generated port number to the private IP address and port of the device that made the request.", 13],
    ["How does the router direct a reply to the right device?", "It looks up the reply's destination port number in the translation table and rewrites the destination IP and port to the original private values.", 14],
    ["Why is NAT needed?", "Private addresses are not routable on the Internet, and one public address can be shared by many devices.", 15],
    ["Give one security benefit of NAT.", "Devices on the LAN are not directly addressable from the Internet.", 16],
    ["Give one disadvantage of NAT.", "Breaks true end-to-end connectivity; incoming connections need port forwarding; some protocols need special handling.", 17],
    ["Why are port numbers essential to NAT?", "They distinguish the many simultaneous connections that share the single public address.", 18]
  ],
  quiz: [
    { q: "A drawback of NAT is that:", opts: ["outside devices cannot start a connection in", "every device needs its own public address", "packets cannot leave the private network", "the router must be replaced to use it"], ans: 0, why: "Hence port forwarding." },
    { q: "NAT also helps security because:", opts: ["hosts inside the LAN are hidden from the Internet", "it encrypts every packet the router forwards", "it blocks every reply that comes from servers", "it checks every packet for viruses"], ans: 0, why: "Only the router's public address is seen." },
    { q: "'The router remembers which device sent it' scores:", opts: ["1 — it says what the router does", "0 — must name the translation table / mapping", "2 — it explains how each reply is routed back", "half — it needs to name the device"], ans: 1, why: "NE per mark scheme." },
    { q: "NAT allows:", opts: ["only one device for each public address", "many devices to share one public address", "no device on the LAN to reach the Internet", "faster routing of packets between networks"], ans: 1, why: "Address conservation." },
    { q: "Incoming connections to a LAN server require:", opts: ["NAT on its own", "port forwarding", "a DHCP server", "a DNS lookup"], ans: 1, why: "NAT hides LAN devices, so an incoming connection needs a port forwarding rule to reach a server inside." },
    { q: "The source port is replaced by:", opts: ["port 80, the web's port", "a port the router generates", "the destination's port number", "port 0, meaning any port"], ans: 1, why: "Unique key in the table." }
  ],
  exam: [
    { src: "AQA 2024 · P2 Q07.6", q: "A student's computer with IP address 192.168.0.4 sends an FTP request to a server on the Internet through a router whose public address is 186.7.2.31. Describe how network address translation is carried out when the request is sent and when the reply is received.", marks: 4,
      ms: ["When the request is sent the router replaces the source IP address 192.168.0.4 with its public address 186.7.2.31 (1)", "It replaces the source port number with a port number it generates (1)", "It adds the mapping (generated port → 192.168.0.4 and original port) to its NAT translation table (1)", "When the reply arrives the router looks up its destination port number in the table and replaces the destination address with 192.168.0.4 (and the original port), forwarding it to the student's computer (1)"] },
    { src: "AQA 2018 · P2 Q05.4", q: "Explain why a router performs network address translation for a LAN that uses private IP addresses.", marks: 2,
      ms: ["Private addresses are non-routable — packets with a private source address cannot be replied to across the Internet (1)", "NAT substitutes the router's public address so that replies return to the router, which forwards them to the right device; many devices share one public address (1)"] }
  ]
});

X("compsci:4.9.4.9", {
  flashcards: [
    ["What is port forwarding?", "A router rule that forwards traffic arriving on a particular port of its public address to a specified device (private IP and port) on the LAN.", 12],
    ["Why is port forwarding needed for a LAN web server?", "Outside computers can only address the router's public IP; the router must forward traffic on port 80/443 to the web server's private address.", 13],
    ["What address do outside users use to reach the server?", "The router's public IP address (e.g. 186.7.2.31).", 14],
    ["What does the router maintain to implement forwarding?", "A port-mapping table / rules mapping external ports to internal IP addresses and ports.", 15],
    ["Give a security consideration of port forwarding.", "It exposes the internal server to the Internet, so it must be patched and protected by the firewall.", 18],
    ["How can two web servers on port 80 behind one router both be reached?", "Forward a different external port to each, e.g. 80 to one and 8080 to the other's port 80.", 100],
    ["What does the router do to the reply from a port-forwarded server?", "Rewrites its source back to the router's public address and port, so the visitor recognises it.", 101]
  ],
  quiz: [
    { q: "Port forwarding directs incoming traffic on a given port to:", opts: ["every device on the whole LAN", "a specified device on the LAN", "the ISP's own servers", "a DNS server to resolve"], ans: 1, why: "Port forwarding sends traffic arriving at the router on a chosen port to one named device on the LAN." },
    { q: "Port forwarding is needed because NAT on its own:", opts: ["has no table entry for a connection started outside", "blocks every packet that tries to leave the LAN", "changes the server's private address each day", "only works for devices that have static IPs"], ans: 0, why: "Its mappings are made by outgoing traffic." },
    { q: "The forwarding rule for a web server targets port:", opts: ["25", "80", "22", "110"], ans: 1, why: "Web servers normally listen for HTTP on port 80, so the rule forwards port 80 (HTTPS uses 443)." },
    { q: "If the server's address changes, port forwarding:", opts: ["still works", "breaks", "speeds up", "reverses"], ans: 1, why: "Rule points at old IP." },
    { q: "Which service at home most often needs port forwarding?", opts: ["a game server the owner hosts", "a browser visiting a website", "an email app reading new mail", "a phone app checking the weather"], ans: 0, why: "Outsiders must connect in to it." },
    { q: "After a rule forwards port 22, someone outside can:", opts: ["reach the SSH server on that one LAN host", "see every device on the LAN at once", "change the router's own settings", "read all the traffic on the LAN"], ans: 0, why: "Only the named port reaches the named host." },
    { qk: "100", q: "A packet reaches the router on a port with no forwarding rule, and no device on the LAN started the connection. The router", opts: ["sends it to every device on the LAN", "drops it", "forwards it to the DHCP server", "returns it to the DNS server"], ans: 1, why: "With no rule and no NAT entry there is nowhere to send it, so it is dropped." },
    { qk: "101", q: "Visitors reach a port-forwarded web server by connecting to", opts: ["the server's private address on port 80", "the server's MAC address on port 80", "the router's public address on the forwarded port", "the router's private address on port 80"], ans: 2, why: "Only the public address is routable; the rule on that port sends the traffic on to the server." }
  ],
  exam: [
    { src: "AQA 2024 · P2 Q07.4", q: "A school hosts its website on a server with the private IP address 192.168.0.2 behind a router with public address 186.7.2.31. Explain how computers on the Internet can access the website.", marks: 3,
      ms: ["Computers on the Internet use the router's public IP address 186.7.2.31 (1)", "The router performs port forwarding, using a port-mapping table / rules (1)", "Traffic arriving on the HTTP port (80 / 443) is forwarded to the web server's address 192.168.0.2 (1)"] },
    { src: "AQA 2018 · P2 Q05.4", q: "A company's web server has a non-routable IP address. Explain what the company's router must do so that customers can reach the web server.", marks: 2,
      ms: ["Identify traffic arriving from outside on the HTTP(S) port — 80 / 443 (1)", "Forward it to the private IP address of the web server (port forwarding) (1)"] }
  ]
});

X("compsci:4.9.4.10", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Client–server, REST, CRUD, JSON, WebSocket — 2020, 2023, 2024" },
    { kv: [
      ["Client–server model", "The client sends a **request** to the server; the server **processes it and sends a response**; an API defines the requests available"],
      ["REST", "Each **resource is represented by a URL**; the client sends **HTTP requests** to those URLs and the server carries out the **CRUD** operation and returns data (usually JSON)"],
      ["REST verbs ↔ CRUD ↔ SQL (2023)", "**GET → Retrieve → SELECT**; **POST → Create → INSERT**; **PUT → Update → UPDATE**; **DELETE → Delete → DELETE**"],
      ["Why JSON rather than XML (2020, 2023 — 2 marks)", "**More compact** (smaller, faster to transmit); **quicker / easier to parse**; structure **understood directly by JavaScript**; native **arrays**; easier for humans to read"],
      ["WebSocket (2024)", "Establishes a **persistent, full-duplex** connection between client and server over one TCP connection, so either side can send at any time with low latency — unlike HTTP's request/response"]
    ]}
  ],
  flashcards: [
    ["Describe the client–server model of a web application.", "The client sends a request to the server; the server processes it (e.g. queries a database) and returns a response; the operations available are defined by an API.", 8],
    ["What is an API?", "An application programming interface — the set of requests / subroutines a service exposes for other software to use.", 9],
    ["What is REST?", "A style of API in which each resource is identified by a URL and clients use HTTP requests to it; the server performs CRUD operations on a database and returns data, typically as JSON.", 10],
    ["Map the REST verbs to CRUD and SQL.", "GET–Retrieve–SELECT; POST–Create–INSERT; PUT–Update–UPDATE; DELETE–Delete–DELETE.", 11],
    ["Give three reasons for using JSON rather than XML.", "More compact so faster to transmit; quicker and easier to parse; understood natively by JavaScript; supports arrays; easier for humans to read.", 12],
    ["What is the WebSocket protocol?", "A protocol that keeps a persistent, full-duplex connection open between client and server over a single TCP connection, so either can send data at any time with low latency.", 13],
    ["When would WebSocket be preferred to HTTP?", "Real-time applications — chat, live prices, multiplayer games — where the server must push data without the client polling.", 14],
    ["What is CRUD?", "The four database operations: Create, Retrieve (Read), Update, Delete.", 15]
  ],
  quiz: [
    { oi: 4, q: "A REST GET request corresponds to SQL:", opts: ["INSERT", "SELECT", "UPDATE", "DELETE"], ans: 1, why: "A GET request only retrieves data, like SELECT, which reads rows without changing them." },
    { oi: 5, q: "A REST POST request corresponds to CRUD:", opts: ["Create", "Retrieve", "Update", "Delete"], ans: 0, why: "Create → INSERT." },
    { oi: 7, q: "In REST each resource is identified by:", opts: ["a port", "a URL", "a MAC address", "a cookie"], ans: 1, why: "URL per resource." },
    { oi: 9, q: "Which is XML rather than JSON?", opts: ["{\"name\": \"Kai\"}", "<name>Kai</name>", "[1, 2, 3]", "{\"a\": [1]}"], ans: 1, why: "XML wraps data in opening and closing tags; JSON uses braces, keys and values." }
  ],
  exam: [
    { src: "AQA 2023 · P2 Q05", ctx: "A web application lets users view and edit their profiles. The client-side JavaScript communicates with the server using a RESTful API that returns JSON.",
      parts: [
        { q: "Explain how URLs are used in a RESTful application.", marks: 1, ms: ["Each resource (e.g. a user's profile) is represented by a URL; the client sends HTTP requests to that URL and the server carries out the corresponding database operation (1)"] },
        { q: "State the CRUD operation and the SQL command that correspond to the HTTP methods GET, POST, PUT and DELETE.", marks: 1, ms: ["GET–Retrieve–SELECT, POST–Create–INSERT, PUT–Update–UPDATE, DELETE–Delete–DELETE (1)"] },
        { q: "Explain two reasons why the developers chose JSON rather than XML for the data returned by the API.", marks: 2, ms: ["JSON is more compact, so responses are smaller and faster to transmit (1)", "JSON is quicker / easier to parse and its structure is understood directly by JavaScript / supports arrays natively / is easier for humans to read (1)"] }
      ] },
    { src: "AQA 2024 · P2 Q07.8", q: "A stock-trading website shows live prices that update without the page being refreshed. Explain why the WebSocket protocol is more suitable than HTTP for this feature.", marks: 2,
      ms: ["WebSocket establishes a persistent, full-duplex connection between client and server over one TCP connection (1)", "So the server can push new prices as soon as they change, with low latency, instead of the client repeatedly sending HTTP requests (1)"] }
  ]
});

X("compsci:4.9.4.11", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Thin vs thick client — 2021 (3 marks), 2022 (3 marks)" },
    "**Thin client**: processing is carried out / applications are **executed on the server**; the client only handles input and display. **Why choose it**: clients are cheaper / lower specification; less configuration, easier to add or replace a client; software installed and updated **only on the server**; users cannot install unauthorised software (more secure); clients use less power and fail less often; licensing per active user can be cheaper. **Hardware consequences**: clients need a slower processor, less RAM and little or no secondary storage; the **server** needs multiple processors / cores, lots of RAM and many drives; the **network** needs higher bandwidth.",
    { callout: { t: "warn", body: "\"Thin clients are cheaper\" scores nothing without the reason (lower hardware specification); \"more powerful server\" scores nothing without naming what — cores, RAM, storage." }}
  ],
  flashcards: [
    ["What is thin-client computing?", "Processing is carried out on the server — applications execute there — and the client only handles input and display.", 10],
    ["What is thick-client computing?", "Processing is carried out on the client, which runs the applications locally; the server provides files and services.", 11],
    ["Give three reasons to choose thin clients.", "Clients are cheaper (lower specification); software is installed and updated only on the server; users cannot install unauthorised software; clients need less configuration, use less power and fail less often.", 12],
    ["Give two disadvantages of thin clients.", "Dependence on the server and network — if either fails nothing works; high bandwidth needed; server is expensive.", 14],
    ["Give two advantages of thick clients.", "Work continues if the network is down; less network traffic; better for demanding applications such as video editing.", 15],
    ["Where is application software installed in a thin-client system?", "Only on the server.", 16],
    ["Why does a thin-client network need more bandwidth?", "Every screen update and keystroke travels across the network.", 17]
  ],
  quiz: [
    { q: "Thick-client computing means:", opts: ["each client runs programs and stores data itself", "every program runs on the central server only", "the client has no processor of its own", "the network is not needed for anything"], ans: 0, why: "Processing is local." },
    { q: "'Thin clients are cheaper' scores only with:", opts: ["a price for each thin client", "the reason — lower hardware specification", "a diagram of the network layout", "a brand name for the thin client devices used"], ans: 1, why: "NE without explanation." },
    { q: "A thin-client server needs:", opts: ["less RAM than a normal server", "many cores and lots of RAM", "no storage of its own", "a slower, low-power processor"], ans: 1, why: "It does everyone's processing." },
    { q: "Thin clients improve security because:", opts: ["they encrypt all of the data stored on them", "users cannot install unauthorised software", "they have no screen to show data on", "they use WPA2 for every connection"], ans: 1, why: "Central control." },
    { q: "A disadvantage of thin clients:", opts: ["updates are harder to roll out to every client", "nothing works if the server or network fails", "each client is expensive to buy and replace", "there is no central control of the clients"], ans: 1, why: "Single dependency." },
    { q: "Best for a video-editing studio:", opts: ["thin clients", "thick clients", "no clients", "hubs"], ans: 1, why: "Local processing power." }
  ],
  exam: [
    { src: "AQA 2021 · P2 Q02", q: "A college is replacing its computers with thin clients. Explain what thin-client computing is and give two reasons the college might have chosen it.", marks: 3,
      ms: ["Processing is carried out / applications are executed on the server rather than the client (1)", "Clients can have a lower hardware specification so are cheaper to buy / consume less power / fail less often (1)", "Software is installed and updated only on the server / less configuration of clients / users cannot install unauthorised software so it is more secure / licensing per active user can be cheaper (1)", "Max 2 reasons"] },
    { src: "AQA 2022 · P2 Q11", q: "Describe the hardware requirements of a thin-client system for the clients, the server and the network.", marks: 3,
      ms: ["Clients: slower processor, less RAM, little or no secondary storage (1)", "Server: multiple processors / many cores, a large amount of RAM, many storage drives (1)", "Network: a higher-bandwidth connection, e.g. fibre / gigabit switches (1)"] }
  ]
});

})(KOS.content.extend);
