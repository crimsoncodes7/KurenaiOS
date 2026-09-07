/* Kurenai OS — deep content: OCR IT AAQ Unit F204 Data and the Internet of Everything (IoE) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

/* ─────────────────────────────────────────────────────────────
   Topic Area 1 — IoE ecosystem
   ───────────────────────────────────────────────────────────── */

C["it:F204.1.1"] = {
  notes: [
    "F204 is an **NEA unit** — you are given a client scenario and you *propose* an IoE solution. This first leaf gives you the vocabulary the whole proposal is written in: what the **Internet of Everything** actually is, the **five sectors** the spec names, and *how* the IoE is used in each. Scenario tasks nearly always sit in one of these five sectors, so being able to say \"this is a **city/neighbourhood** IoE solution and here is what that sector typically does\" is the fastest way into P1 (summarise the user requirements).",
    { callout: { t: "def", h: "Internet of Everything (IoE)", body: "The networked connection of **people, data, process and things** — bringing them together so that connections become more relevant and valuable, turning information into actions that create new capabilities and richer experiences. It is broader than the **Internet of Things**: IoT is only the *things* (connected devices); IoE adds the **people** who use it, the **data** the devices generate, and the **process** that delivers the right information to the right person at the right time." }},
    { callout: { t: "miscon", h: "IoE is not just a rebrand of IoT", body: "A very common lost mark. **IoT = connected devices exchanging data.** **IoE = IoT + people + data + process.** If your answer only describes sensors talking to each other, you have described IoT and you will not be credited for IoE. Always bring in a *person* who receives something useful and a *process* that decided to send it." }},

    { page: "The five sectors" },
    { h: "Health" },
    "The IoE in health links wearables, implants and clinical devices to analytics platforms so that clinicians (and patients) can act on live physiological data instead of waiting for an appointment.",
    { callout: { t: "info", h: "Health — how the IoE is used", body: [
      { kv: [
        ["Disability aids", "Connected prosthetics, smart wheelchairs, eye-tracking and voice-controlled environmental controls that let a user operate their home or communicate independently."],
        ["Health analytics", "Aggregating readings from thousands of patients to spot trends, predict deterioration and plan services (e.g. flagging a rising infection rate in one postcode)."],
        ["Medical devices", "Connected insulin pumps, pacemakers, ventilators and infusion pumps that report their own readings and can be adjusted remotely."],
        ["Sensors", "Wearable heart-rate, blood-oxygen, glucose and temperature sensors streaming continuous readings rather than a single clinic snapshot."],
        ["Social safety wearables", "Fall detectors, panic pendants and location trackers for vulnerable or elderly people that automatically alert a carer or emergency service."],
        ["Weather safety", "Linking weather data to health warnings — heat-stroke, cold-weather or air-quality alerts pushed to at-risk patients (asthma, cardiac, elderly)."]
      ] }
    ] } },
    { h: "Home" },
    { callout: { t: "info", h: "Home — how the IoE is used", body: [
      { kv: [
        ["Energy generation / monitoring / reduction", "Smart meters, solar inverters and battery systems report generation and consumption so the household (and supplier) can shift usage to cheap or self-generated power."],
        ["Living aids", "Assistive technology in the home — automatic medication dispensers, voice assistants, smart lighting for people with mobility or sight difficulties."],
        ["Security / surveillance", "Doorbell cameras, motion sensors, smart locks and alarms that notify the occupier's phone and can be armed remotely."],
        ["Home automation systems", "Heating, lighting, blinds and appliances scheduled or triggered by occupancy, time or geofence — usually through one hub (e.g. a smart speaker)."]
      ] }
    ] } },
    { h: "City / neighbourhood" },
    { callout: { t: "info", h: "City / neighbourhood — how the IoE is used", body: [
      { kv: [
        ["Environmental control", "Air-quality, noise and river-level sensors feeding council dashboards that trigger interventions (road closures, pollution alerts)."],
        ["Intelligent cities", "Integrating many feeds — transport, energy, waste, safety — into one platform so the city is managed on live data rather than schedules."],
        ["Public services", "Bin sensors that request collection only when full, smart street lighting that dims when nobody is present, connected public toilets/benches/Wi-Fi."],
        ["Traffic management", "Inductive loops, ANPR and camera data re-timing signals, managing variable speed limits and routing around incidents."],
        ["Transport", "Real-time bus/train tracking, contactless ticketing, connected bike/scooter hire and parking-bay occupancy sensors."]
      ] }
    ] } },
    { h: "Industry" },
    { callout: { t: "info", h: "Industry — how the IoE is used", body: [
      { kv: [
        ["Emergency services", "Connected body-worn cameras, vehicle telematics and incident data giving control rooms live situational awareness and the nearest available unit."],
        ["New developments", "Digital twins, robotics and automated warehousing built on continuous machine data."],
        ["Production refinement / new techniques", "Machine sensors feeding analytics that tune line speed, reduce waste and enable predictive maintenance before a breakdown."],
        ["Remote working", "Connected tooling, remote diagnostics and AR headsets that let an expert guide an on-site engineer without travelling."],
        ["Safety", "Gas, heat and proximity sensors, lone-worker devices and machine interlocks that stop equipment when a person is detected in a danger zone."],
        ["Workforce aids", "Exoskeletons, wearables monitoring fatigue or posture, and hands-free pick-by-voice systems in logistics."]
      ] }
    ] } },
    { h: "The environment" },
    { callout: { t: "info", h: "The environment — how the IoE is used", body: [
      { kv: [
        ["Environmental monitoring", "Distributed sensors measuring air, water, soil and noise continuously and at far greater coverage than manual sampling."],
        ["Flood detection network", "River-level, rainfall and ground-saturation sensors feeding models that issue automated flood warnings to residents."],
        ["Illegal deforestation monitoring", "Acoustic sensors hidden in the canopy that recognise chainsaw or lorry noise and alert rangers, backed by satellite imagery."],
        ["Landslide detection systems", "Tilt, moisture and ground-movement sensors on unstable slopes that warn before a slip occurs."],
        ["Pollution monitoring", "Roadside and industrial-outfall sensors that detect breaches and trigger enforcement or public alerts."],
        ["Wildlife tracking", "GPS collars and tags reporting migration, population and poaching risk without repeated human capture."]
      ] }
    ] } },

    { page: "Applying this to your NEA" },
    { callout: { t: "tip", h: "Reading the scenario for its sector", body: "Before writing anything, decide **which of the five sectors** the client sits in and say so in your proposal. It instantly gives you: the typical devices, the typical users, the typical legal pressure points (health = special-category data; home = privacy in a dwelling; environment = long battery life outdoors), and a stock of comparable systems to reference. A proposal that names the sector reads as informed; one that starts with \"I will use sensors\" does not." }},
    { callout: { t: "warn", h: "Sectors overlap — say so, don't panic", body: "A smart care-home is **health *and* home**; a flood-warning network for a town is **environment *and* city**. Overlap is not an error. State the primary sector, note the secondary one, and use both sets of typical uses. What loses marks is picking one and ignoring an obvious requirement that belongs to the other." }},
    { callout: { t: "memorise", h: "The five sectors", body: "**H**ealth · **H**ome · **C**ity/neighbourhood · **I**ndustry · **E**nvironment. One-word handle for each: *care*, *dwelling*, *place*, *work*, *planet*. And the definition every answer needs: IoE = **people + data + process + things**." }}
  ],
  flashcards: [
    ["Define the Internet of Everything.", "The networked connection of people, data, process and things, so that connections become more relevant and valuable — turning information into actions that create new capabilities and richer experiences."],
    ["How does the IoE differ from the IoT?", "IoT is only the connected *things* (devices exchanging data). IoE adds the *people* who use it, the *data* generated, and the *process* that delivers the right information to the right person at the right time."],
    ["Name the five sectors that use the IoE.", "Health; Home; City/neighbourhood; Industry; The environment."],
    ["Give three uses of the IoE in the health sector.", "Any three of: disability aids, health analytics, connected medical devices, wearable sensors, social safety wearables (fall detectors/panic pendants), weather-safety alerts."],
    ["Give three uses of the IoE in the home sector.", "Energy generation/monitoring/reduction (smart meters, solar), living aids, security/surveillance (cameras, smart locks), and home automation systems."],
    ["Give three uses of the IoE in a city or neighbourhood.", "Environmental control, intelligent cities, public services (smart bins/lighting), traffic management, and transport (live tracking, ticketing, parking sensors)."],
    ["Give three industrial uses of the IoE.", "Emergency services, new developments (digital twins/robotics), production refinement, remote working, safety systems, and workforce aids (exoskeletons, wearables)."],
    ["Give three environmental uses of the IoE.", "Environmental monitoring, flood detection networks, illegal deforestation monitoring, landslide detection, pollution monitoring, and wildlife tracking."],
    ["What is a social safety wearable?", "A worn device — fall detector, panic pendant, location tracker — that automatically alerts a carer or emergency service when a vulnerable person is at risk."],
    ["How is the IoE used to detect illegal deforestation?", "Acoustic sensors hidden in the forest canopy recognise chainsaw or vehicle noise and alert rangers in near-real time, supported by satellite imagery."],
    ["Why should an NEA proposal name its sector explicitly?", "It anchors the typical devices, users, comparable systems and legal pressure points for that context, showing informed decisions rather than generic ones."]
  ],
  quiz: [
    {
      q: "Which statement best distinguishes the IoE from the IoT?",
      opts: [
        "The IoE uses only wireless connections",
        "The IoE adds people, data and process to the connected things",
        "The IoE contains no sensors",
        "The IoE only applies to homes"
      ],
      ans: 1,
      why: "IoT is the connected things alone; IoE is the four pillars — people, data, process and things — working together."
    },
    {
      q: "A council installs river-level and rainfall sensors that automatically warn residents of rising water. Which sector does this best fit?",
      opts: ["Home", "The environment", "Industry", "Health"],
      ans: 1,
      why: "A flood detection network is one of the spec's named environmental uses of the IoE."
    },
    {
      q: "Smart bins that request emptying only when full are an example of which city/neighbourhood use?",
      opts: ["Traffic management", "Public services", "Transport", "Environmental control"],
      ans: 1,
      why: "Waste collection is a public service; the sensor makes the service demand-driven rather than scheduled."
    },
    {
      q: "A factory fits machines with vibration sensors so maintenance happens before failure. This is an example of…",
      opts: ["Workforce aids", "Remote working", "Production refinement", "Emergency services"],
      ans: 2,
      why: "Analytics on machine data to reduce waste and enable predictive maintenance is production refinement."
    },
    {
      q: "Which of these is a *health* sector use of the IoE rather than a home one?",
      opts: ["Smart thermostats", "A connected insulin pump", "A video doorbell", "A solar inverter"],
      ans: 1,
      why: "A connected insulin pump is a medical device reporting and receiving clinical data."
    },
    {
      q: "A student writes: 'The IoE is when devices send data to each other over the internet.' Why is this capped?",
      opts: [
        "It is the definition of the IoT — people, data and process are missing",
        "Devices cannot send data",
        "It mentions the internet",
        "It is too long"
      ],
      ans: 0,
      why: "Device-to-device data exchange alone is IoT; the IoE definition must include people, data and process."
    }
  ],
  exam: [
    {
      q: "Explain what is meant by the Internet of Everything (IoE) and how it differs from the Internet of Things.",
      marks: 4,
      ms: [
        "IoE is the networked connection of people, data, process and things (1).",
        "The connections turn information into actions/decisions that create new capabilities or value (1).",
        "IoT refers only to the connected devices/things exchanging data (1).",
        "IoE therefore includes the people who use the system and the process that decides what information is delivered, when and to whom (1)."
      ]
    },
    {
      q: "A charity supports elderly people living alone. Describe two ways the IoE could be used in the health sector to support them.",
      marks: 4,
      ms: [
        "Social safety wearables — a fall detector or panic pendant (1) automatically alerts a carer or emergency service when a fall or inactivity is detected (1).",
        "Wearable sensors / health analytics — continuous heart-rate, temperature or activity monitoring (1) lets a clinician spot deterioration and intervene before a hospital admission (1).",
        "(Accept living aids/medication reminders, weather-safety alerts for at-risk patients, connected medical devices.)"
      ]
    },
    {
      q: "NEA practice (P1). A town council wants to reduce congestion and improve air quality in its centre. Summarise the user requirements for an IoE solution, identifying the sector(s) involved and how the IoE is typically used in them.",
      marks: 9,
      ms: [
        "Identifies the primary sector as city/neighbourhood, with the environment as a secondary sector (1–2).",
        "Traffic management — signal re-timing, ANPR/loop counts, variable speed limits to smooth flow (1–2).",
        "Transport — live public-transport tracking and parking-bay occupancy to encourage modal shift away from cars (1–2).",
        "Environmental control / pollution monitoring — air-quality sensors triggering alerts or restrictions when limits are breached (1–2).",
        "Public services — demand-based street lighting or waste collection reducing vehicle movements in the centre (1).",
        "Requirements are drawn from the scenario and attributed to named user groups (residents, drivers, council officers, businesses) rather than listed generically (1–2)."
      ]
    }
  ]
};

C["it:F204.1.2"] = {
  notes: [
    "The **four pillars** are the backbone of the whole unit and of criteria **P2** (*explain the entities for the four pillars*) and **M2** (*explain how the entities will interact*). For each pillar you must know its **role**, the **entities** it contains, how the four **work together** to make a workable system, and how **one pillar affects another**. Almost every other leaf in F204 is a detail of one pillar — collection devices and outputs are *Things*, processing location is *Process*, HCIs are where *People* meet the system.",
    { callout: { t: "def", h: "The four pillars", body: "**People** · **Data** · **Process** · **Things**. The IoE only exists where all four are present: *things* collect, *data* is what they collect, *process* decides what happens to it and when, and *people* act on the result. Remove any one pillar and you no longer have an IoE solution." }},

    { page: "The four pillars in detail" },
    { h: "People — the users" },
    "The pillar the other three exist to serve. The spec's entity here is **users**, but in a proposal you should name *which* users: primary users who interact daily, secondary users who receive outputs, and technical staff who maintain the system. People both **supply** data (deliberately through inputs, incidentally through behaviour) and **consume** it through the HCI.",
    { callout: { t: "info", h: "People — entities and role", body: [
      { kv: [
        ["Entities", "Users — end users, clients, stakeholders, operators, maintainers, and the wider public affected by the system."],
        ["Role", "Set the requirements the system exists to meet; interact with it through the HCI; make (or approve) the decisions the data supports; and are themselves a source of data."],
        ["In your NEA", "Name the actual people in the scenario. \"The warehouse supervisor\" and \"the night-shift picker\" are entities; \"users\" alone is not enough for P2."]
      ] }
    ] } },
    { h: "Data — raw data, analysis, decisions, results" },
    { callout: { t: "info", h: "Data — entities and role", body: [
      { kv: [
        ["Raw data", "Unprocessed readings as captured — a temperature value, a GPS fix, a door-open event. Meaningless on its own."],
        ["Analysis", "Processing that finds meaning in the raw data — averaging, comparing to a threshold, spotting a trend or an anomaly."],
        ["Decisions", "The conclusion drawn from the analysis — \"this is above the safe limit\", \"this machine will fail within a week\"."],
        ["Results", "The output delivered from the decision — an alert, a dashboard figure, an actuator command, a report."],
        ["Role", "Data is the raw material of the whole system; it is the pillar that turns *measurement* into *information* that a person or process can act on."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Raw data → analysis → decision → result is a chain", body: "These four are not four separate boxes to list — they are the **journey one reading takes**. Show it in your proposal with a real value from your scenario: *raw* 31 °C → *analysis* compared to the 28 °C threshold and to the last hour's trend → *decision* the cold room is failing → *result* an alert on the manager's phone and the backup chiller switched on. That single sentence answers a large part of P2." }},
    { h: "Process — delivering information, time of processing, methods of processing" },
    { callout: { t: "info", h: "Process — entities and role", body: [
      { kv: [
        ["Delivering information", "How and to whom the result is sent — push notification, dashboard, email digest, actuator command, siren."],
        ["Time of processing", "*When* it happens — in real time as data arrives, near-real-time, or in scheduled batches overnight. Driven by how quickly the decision must be made."],
        ["Methods of processing", "*How* it is done — rules and thresholds, statistical analysis, aggregation, or machine-learning models; and where (device / edge / fog / cloud — see 2.3)."],
        ["Role", "Process is the pillar that ensures the **right information reaches the right person at the right time in a usable form**. Without it you have data nobody uses."]
      ] }
    ] } },
    { h: "Things — collection devices and output devices" },
    { callout: { t: "info", h: "Things — entities and role", body: [
      { kv: [
        ["Collection devices", "Sensors, cameras, RFID/NFC readers, meters, wearables, GPS units, and manual-entry terminals — everything that puts data *into* the system (see 2.1)."],
        ["Output devices", "Screens, speakers, actuators, indicator lights, valves and motors — everything the system uses to act on or communicate the result (see 4.1)."],
        ["Role", "Things are the system's senses and hands: they are the physical boundary between the digital system and the real world."]
      ] }
    ] } },

    { page: "How the pillars interact" },
    "M2 asks you to **explain how the entities will interact** — a loop, not a list. The standard loop is:",
    { steps: [
      { h: "1 · Things → Data", m: "A collection device senses a real-world condition and produces raw data.", n: "Affected by: the choice of sensor and its accuracy, and how often it samples (2.1, 2.2)." },
      { h: "2 · Data → Process", m: "Raw data is transmitted to wherever it will be processed and stored.", n: "Affected by: the connectivity method, data size and transmission frequency (3.2, 3.3)." },
      { h: "3 · Process → Data", m: "Analysis is applied, a decision is reached, and a result is produced.", n: "Affected by: where processing happens and how urgent the decision is (2.3)." },
      { h: "4 · Process → People", m: "The result is delivered to the person who needs it, in a format they can use.", n: "Affected by: the HCI design, output device and information format (4.1–4.3)." },
      { h: "5 · People → Process / Things", m: "The person acts — confirming, overriding, or triggering an actuator — and that action becomes new data.", n: "This is what closes the loop and makes it an IoE rather than a one-way telemetry feed." }
    ] },
    { callout: { t: "info", h: "How one pillar affects another (the exam's favourite question)", body: [
      { kv: [
        ["Things → Data", "A cheap or badly placed sensor produces low-quality raw data; every later analysis inherits that error. Sampling frequency sets how much data exists at all."],
        ["Data → Process", "The *volume* and *speed* of the data dictate where processing must happen — a high-rate stream cannot all be sent to the cloud, so edge processing becomes necessary."],
        ["Process → People", "The timing and method of processing decide whether a person gets a warning in time to act. Batch processing overnight is useless for a fall detector."],
        ["People → Things", "User requirements determine which things are chosen in the first place — an accessibility need may force a haptic output; a remote site forces solar power."],
        ["People → Data", "Users generate data by behaving; they also determine what may lawfully be collected (consent, privacy) — a legal constraint on the Data pillar (5.3)."],
        ["Things → Process", "A battery-powered device with limited power cannot process heavily on-device, pushing analysis to the edge or cloud (2.2, 2.3)."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "The pillars are not four separate systems", body: "Students often write four paragraphs that never mention each other and lose M2 entirely. The mark is for **interaction** — every pillar you describe should be joined to the next by a \"which then…\" or \"which means…\". A flowchart is explicitly allowed by the assessment guidance for P2; use one, then explain it in prose." }},
    { callout: { t: "memorise", h: "Pillars and their entities", body: "**People** → users. **Data** → raw data, analysis, decisions, results. **Process** → delivering information, time of processing, methods of processing. **Things** → collection devices, output devices. Loop: *Things sense → Data flows → Process decides → People act → and the action feeds back in.*" }}
  ],
  flashcards: [
    ["Name the four pillars of the IoE.", "People, Data, Process and Things."],
    ["What entity belongs to the People pillar?", "Users — end users, clients, stakeholders, operators and maintainers, plus anyone affected by the system."],
    ["List the four entities of the Data pillar.", "Raw data, analysis, decisions and results."],
    ["List the three entities of the Process pillar.", "Delivering information, time of processing, and methods of processing."],
    ["List the two entities of the Things pillar.", "Collection devices and output devices."],
    ["What is the role of the Process pillar?", "To ensure the right information reaches the right person at the right time and in a usable form — deciding how, when and by what method data is processed and delivered."],
    ["What is the role of the Things pillar?", "To act as the system's senses and hands — the physical boundary that collects data from the real world and acts on or communicates results."],
    ["Describe the journey of one reading through the Data pillar.", "Raw data is captured → analysis finds meaning in it → a decision is drawn from the analysis → a result is delivered (alert, dashboard value, actuator command)."],
    ["Give an example of the Things pillar affecting the Process pillar.", "A battery-powered sensor has too little power to process data on-device, so analysis must be pushed to the edge or cloud."],
    ["Give an example of the People pillar affecting the Things pillar.", "A user's accessibility requirement (e.g. a blind user) forces the choice of audio or haptic output devices rather than a screen."],
    ["Give an example of the Data pillar affecting the Process pillar.", "A very high-rate data stream cannot all be transmitted to the cloud, so processing must happen at the edge to reduce volume and latency."],
    ["Why is it wrong to describe the four pillars as four separate systems?", "The IoE only works because they interact in a loop — things sense, data flows, process decides, people act, and that action feeds back as new data."]
  ],
  quiz: [
    {
      q: "Which entity belongs to the Process pillar?",
      opts: ["Raw data", "Time of processing", "Output devices", "Users"],
      ans: 1,
      why: "Process contains delivering information, time of processing and methods of processing."
    },
    {
      q: "A sensor records 31 °C. This value, before anything is done with it, is…",
      opts: ["A decision", "A result", "Raw data", "Analysis"],
      ans: 2,
      why: "An unprocessed captured reading is raw data; meaning only appears once analysis is applied."
    },
    {
      q: "An engineer chooses overnight batch processing for a fall-detection wearable. Which pillar interaction has been handled badly?",
      opts: [
        "Things → Data",
        "Process → People — the result arrives too late for the person to act",
        "People → Data",
        "Data → Things"
      ],
      ans: 1,
      why: "Time of processing must match the urgency of the decision; a fall alert delivered hours later is worthless."
    },
    {
      q: "Which pillar contains both collection devices and output devices?",
      opts: ["Process", "Data", "People", "Things"],
      ans: 3,
      why: "Things is the physical pillar — everything that senses the world or acts on it."
    },
    {
      q: "A remote sensor is solar-powered and can only run simple code. This is an example of…",
      opts: [
        "Data affecting People",
        "Things affecting Process",
        "People affecting Data",
        "Process affecting Things"
      ],
      ans: 1,
      why: "The device's power and capability limits (Things) force processing to move to the edge or cloud (Process)."
    },
    {
      q: "Why do the four pillars form a loop rather than a line?",
      opts: [
        "Because data is always deleted",
        "Because the action a person takes becomes new data entering the system",
        "Because sensors cannot output",
        "Because processing happens twice"
      ],
      ans: 1,
      why: "People acting on results generates new data and new device states, which re-enters the system — closing the loop."
    }
  ],
  exam: [
    {
      q: "State the four pillars of the IoE and give one entity contained in each.",
      marks: 4,
      ms: [
        "People — users (1).",
        "Data — raw data / analysis / decisions / results (1).",
        "Process — delivering information / time of processing / methods of processing (1).",
        "Things — collection devices / output devices (1)."
      ]
    },
    {
      q: "Explain the role of the Process pillar in an IoE solution.",
      marks: 4,
      ms: [
        "Decides the methods by which data is processed — thresholds, aggregation, statistical or machine-learning analysis (1).",
        "Decides the time of processing — real-time, near-real-time or batch — matched to how urgently the decision is needed (1).",
        "Delivers the resulting information to the right person or device in a usable form (1).",
        "Without it, data would be collected but never turned into an action, so the system would produce no value (1)."
      ]
    },
    {
      q: "NEA practice (P2/M2). For a smart cold-storage warehouse, explain the entities of the four pillars and how they interact.",
      marks: 12,
      ms: [
        "Things — temperature/humidity sensors and door sensors as collection devices; alarm sounder, dashboard screen and chiller actuator as output devices (1–2).",
        "Data — raw temperature readings; analysis comparing them to the 4 °C threshold and to trend; decision that the room is failing; result as an alert and a logged incident (1–2).",
        "Process — method: threshold rule plus rolling average at the edge gateway; time: continuous real-time, with a nightly batch report; delivery: push alert to the duty manager and a wall dashboard (1–2).",
        "People — duty manager, maintenance engineer, food-safety officer and the IT maintainer, each named with what they receive and do (1–2).",
        "Interaction: things sense → data transmitted to the gateway → process analyses and decides → result delivered to the manager → manager acts (or the actuator acts automatically) → the action is logged as new data (1–3).",
        "One pillar affecting another explained with a concrete link — e.g. high sampling rate (Things) increases data volume, forcing edge processing (Process); or the food-safety officer's legal reporting need (People) determines how long data is retained (Data) (1–3)."
      ]
    }
  ]
};


/* ─────────────────────────────────────────────────────────────
   Topic Area 2 — Data collection, processing and storage
   ───────────────────────────────────────────────────────────── */

C["it:F204.2.1"] = {
  notes: [
    "This leaf is the *input* half of the **Things** pillar and feeds criterion **P5** (*describe how data will be collected*). The spec names three collection routes — **sensors**, **auto process** and **manual process** — and asks for the **types of device** used and, crucially, **how devices are selected in different contexts**. Selection is where the marks are: naming a sensor is a statement, justifying it against the context is an explanation.",
    { callout: { t: "def", h: "The three collection routes", body: "**Sensors** — hardware that converts a physical quantity into an electrical signal. **Auto process** — data captured automatically by a system as a by-product of something else happening (a card tap, a log entry, an API pull). **Manual process** — a human deliberately enters data (a form, a keypad, a survey, a barcode scanned by a worker)." }},

    { page: "Sensors" },
    { callout: { t: "info", h: "Common IoE sensor types and what they measure", body: [
      { kv: [
        ["Temperature / humidity", "Ambient or contact heat and moisture — cold chain, greenhouses, HVAC, patient monitoring."],
        ["Motion / PIR", "Presence or movement of a warm body — security, occupancy-based lighting, fall detection."],
        ["Proximity / ultrasonic / infrared", "Distance to an object — parking bays, bin fill level, machine guarding, robot navigation."],
        ["Light (LDR / lux)", "Ambient brightness — street lighting, greenhouse supplementary lighting, screen dimming."],
        ["Pressure / load / strain", "Force or weight — occupancy of a seat or bed, tank level, structural monitoring."],
        ["Accelerometer / gyroscope", "Acceleration and orientation — fall detection, vibration for predictive maintenance, vehicle telematics."],
        ["GPS / GNSS", "Geographic position — asset tracking, fleet management, wildlife tags."],
        ["Air quality / gas (CO, CO₂, NOₓ, VOC)", "Concentration of specific gases — pollution monitoring, industrial safety, ventilation control."],
        ["Water level / flow / moisture", "Depth, flow rate or soil saturation — flood detection, irrigation, leak detection."],
        ["Current / energy meter", "Electrical draw — smart metering, appliance-level energy monitoring, machine-state inference."],
        ["Biometric / physiological", "Heart rate, SpO₂, glucose, ECG — wearables and medical devices."],
        ["Camera / image", "Visual scene — ANPR, footfall counting, quality inspection, deforestation watch."]
      ] }
    ] } },
    { h: "Auto process" },
    "Automatic capture is data the system gets **without anyone intending to create it**: a contactless payment writes a transaction; a phone connecting to a Wi-Fi access point writes a presence record; an application writes a log line; a scheduled API call pulls a weather forecast in. It is cheap and continuous, but it is *incidental* — the data was collected for another purpose, which raises the legal and ethical questions in 5.3 (purpose limitation, consent).",
    { h: "Manual process" },
    "Deliberate human entry: web and paper forms, keypads, handheld barcode/QR scanners operated by a worker, survey apps, engineer's inspection checklists. It captures things no sensor can measure — opinion, judgement, category, context (\"why the machine was stopped\") — but it is slow, costly, and the **most error-prone** source in the whole system, so it needs validation and verification.",
    { table: { head: ["Route", "Strengths", "Weaknesses", "Typical context"], rows: [
      ["Sensors", "Continuous, objective, no labour cost, works where people can't go.", "Hardware and power cost; drift/calibration; only measures what it is built to measure.", "Any continuous physical quantity — temperature, movement, air quality."],
      ["Auto process", "Free by-product of existing activity; very high volume; no user effort.", "Data was collected for another purpose (legal risk); may not match the question you're asking.", "Transactions, logs, network events, API feeds."],
      ["Manual process", "Captures judgement, category and context that no sensor can.", "Slow, expensive, inconsistent, and the largest source of human error.", "Inspections, surveys, exception reasons, patient-reported symptoms."]
    ] } },

    { page: "Selecting devices for a context" },
    { callout: { t: "tip", h: "The selection checklist — use it as your P5 structure", body: [
      { ul: [
        "**What must be measured?** The physical quantity dictates the sensor type — this is the first and easiest justification.",
        "**How accurate / what resolution?** A cold chain needs ±0.5 °C; a comfort thermostat does not. Over-specifying wastes money and power.",
        "**How often?** Sampling frequency drives power draw and data volume (2.2, 3.3).",
        "**Where is it installed?** Outdoors, wet, dusty, hot, vibrating, or in a public place → ingress protection, ruggedisation, vandal resistance.",
        "**How is it powered?** Mains available or battery/solar only (2.2) — this often eliminates half the options.",
        "**What can it talk to?** Range and available network at the site decide the connectivity method (3.2).",
        "**Who installs and maintains it?** Battery changes on a river bank at scale are a real cost.",
        "**Cost and scale.** Ten sensors versus ten thousand changes the economics completely.",
        "**Legal / ethical.** A camera in a workplace or a wearable on a person carries obligations a temperature probe does not (5.3)."
      ] }
    ] } },
    { callout: { t: "info", h: "Worked selection examples", body: [
      { kv: [
        ["Flood warning on a rural stream", "Ultrasonic water-level sensor + rainfall gauge. Chosen because: non-contact (survives debris), low power for solar, low data volume so LPWAN range beats Wi-Fi, and it must survive being outdoors unattended for years."],
        ["Cold-store compliance", "Wired PT100 temperature probes with high accuracy. Chosen because: mains power is available, food-safety law demands accuracy and an audit trail, and reliability matters more than installation cost."],
        ["Elderly fall detection", "Wearable accelerometer + gyroscope, with a manual panic button. Chosen because: it must travel with the person, the manual button captures the cases the algorithm misses, and it must be light and comfortable enough to be worn."],
        ["Retail footfall", "Overhead infrared/ToF counters rather than cameras. Chosen because: they give the same count without capturing identifiable images, which avoids a large slice of data-protection risk."]
      ] }
    ] } },
    { callout: { t: "warn", h: "P5 is 'describe how data will be collected' — not 'list sensors'", body: "For each data item in your solution, say **what** is collected, **which device** collects it, **by which route** (sensor / auto / manual), **how often**, and **why that device suits this context**. A table with those five columns is an efficient, high-scoring answer and the assessment guidance explicitly allows technical documentation to support it." }},
    { callout: { t: "memorise", h: "Collection", body: "Three routes: **sensor** (physical quantity), **auto process** (by-product of activity), **manual process** (human entry). Selection drivers: **quantity · accuracy · frequency · environment · power · connectivity · maintenance · cost · legal**." }}
  ],
  flashcards: [
    ["Name the three data collection routes in the F204 spec.", "Sensors, auto process (automatic capture as a by-product of activity), and manual process (deliberate human entry)."],
    ["What is a sensor?", "Hardware that converts a physical quantity — temperature, movement, light, pressure, gas concentration — into an electrical signal the system can read."],
    ["Give two examples of auto-process data collection.", "A contactless card tap writing a transaction record; a device connecting to Wi-Fi writing a presence log; an application log line; a scheduled API pull."],
    ["Why is manual data collection still needed in an IoE solution?", "It captures judgement, category and context that no sensor can measure — inspection outcomes, reasons for a stoppage, patient-reported symptoms."],
    ["What is the main weakness of manual data collection?", "It is slow, expensive and the most error-prone source in the system, so it needs validation and verification."],
    ["Which sensor would you use for fall detection and why?", "An accelerometer (with a gyroscope) — it detects the sudden acceleration and change of orientation characteristic of a fall, and is small enough to be worn."],
    ["Name three sensors used for environmental monitoring.", "Air-quality/gas sensors (CO, CO₂, NOₓ), water level/flow sensors, and soil-moisture sensors; temperature and humidity are also common."],
    ["List five factors that drive the choice of a collection device.", "The quantity to be measured, required accuracy, sampling frequency, installation environment, available power, connectivity, maintenance access, cost at scale, and legal/ethical constraints."],
    ["Why might infrared footfall counters be chosen over cameras in a shop?", "They give the same count without capturing identifiable images, greatly reducing data-protection risk and cost."],
    ["Why does sampling frequency matter when selecting a device?", "It directly drives power consumption and data volume, which in turn constrain the power source, connectivity method and processing location."],
    ["What five things should a P5 answer state about each data item?", "What is collected, which device collects it, by which route, how often, and why that device suits the context."]
  ],
  quiz: [
    {
      q: "A supermarket loyalty card records purchases whenever it is scanned at the till. Which collection route is this?",
      opts: ["Sensor", "Auto process", "Manual process", "None of these"],
      ans: 1,
      why: "The data is captured automatically as a by-product of the transaction — nobody entered it for the purpose of analysis."
    },
    {
      q: "Which sensor best suits monitoring the fill level of public waste bins?",
      opts: ["Accelerometer", "Ultrasonic proximity sensor", "Humidity sensor", "Current sensor"],
      ans: 1,
      why: "An ultrasonic sensor in the lid measures the distance to the rubbish surface, giving fill level without contact."
    },
    {
      q: "A remote river sensor must run unattended for years on solar power. Which selection factor most restricts the choice?",
      opts: ["Screen size", "Power consumption and sampling frequency", "Keyboard layout", "The colour of the housing"],
      ans: 1,
      why: "With only harvested power available, the device's draw and how often it samples/transmits dominate the design."
    },
    {
      q: "Why is manual data entry described as the most error-prone collection route?",
      opts: [
        "Because keyboards are unreliable",
        "Because humans mistype, misjudge and record inconsistently, so validation and verification are needed",
        "Because it cannot be stored",
        "Because it is always slower than the network"
      ],
      ans: 1,
      why: "Human entry introduces typos, inconsistent categorisation and omissions, so it must be validated and verified."
    },
    {
      q: "Which is the strongest justification for choosing a particular sensor in an NEA proposal?",
      opts: [
        "It is the cheapest available",
        "It measures the required quantity to the accuracy the context demands, within the power and connectivity available",
        "It was used in the textbook",
        "It has the most features"
      ],
      ans: 1,
      why: "Selection must be justified against the context: quantity, accuracy, power, environment and connectivity — not price alone."
    },
    {
      q: "A quality inspector records why a production line was stopped. Which route is most appropriate and why?",
      opts: [
        "Sensor — it measures the reason",
        "Auto process — the machine knows the reason",
        "Manual process — the reason is a human judgement no sensor can measure",
        "None — the data cannot be collected"
      ],
      ans: 2,
      why: "Sensors can detect the stoppage; only a person can supply the reason, which is a judgement/category."
    }
  ],
  exam: [
    {
      q: "Describe the difference between automatic and manual data collection, giving one example of each.",
      marks: 4,
      ms: [
        "Automatic collection captures data as a by-product of activity without deliberate human input (1) — e.g. a card tap recording a transaction, or a device connecting to Wi-Fi (1).",
        "Manual collection requires a person to deliberately enter or capture the data (1) — e.g. an inspector completing a checklist or a worker scanning a barcode (1)."
      ]
    },
    {
      q: "Explain two factors that would influence the choice of data collection devices for sensors placed in a remote forest.",
      marks: 4,
      ms: [
        "Power — no mains supply, so devices must be low-power and use solar or long-life batteries (1); this limits sampling and transmission frequency (1).",
        "Environment/durability — the devices must survive rain, temperature extremes and wildlife, so ruggedised, sealed housings are needed (1) because maintenance visits are costly and infrequent (1).",
        "(Accept connectivity — no Wi-Fi/cellular coverage, so long-range low-bandwidth links are required; or data size/frequency constraints.)"
      ]
    },
    {
      q: "NEA practice (P5). A hospital wants to monitor its medicine fridges and the condition of patients on a ward. Describe how data will be collected, justifying the devices chosen.",
      marks: 9,
      ms: [
        "Fridge temperature — wired digital temperature probes sampling every 1–5 minutes; chosen for accuracy and because mains power is available (1–2).",
        "Fridge door state — magnetic reed/contact sensor recording door-open events automatically, explaining excursions in the temperature trace (1–2).",
        "Patient vitals — wearable heart-rate/SpO₂ and temperature sensors streaming continuously; chosen because they travel with the patient and give trend rather than snapshot data (1–2).",
        "Manual collection — nurse observations, pain scores and reasons for alarms entered on a ward tablet, because these are judgements no sensor can capture (1–2).",
        "Auto collection — medication administration logged automatically when a barcode is scanned at the bedside (1).",
        "Justification links each device to the context: accuracy required, power availability, patient comfort/wearability, infection-control (wipe-clean sealed devices), and legal duty over special-category health data (1–3)."
      ]
    }
  ]
};

C["it:F204.2.2"] = {
  notes: [
    "Power is what makes IoE design *hard*, and it is criterion **P7** (*describe how the data collection devices will be powered*) and **M6** (*explain the benefits and limitations of the way they are powered*). The spec is explicit about the boundary: you need **how power is consumed based on frequency of collection and of communication**, **how devices can be powered**, and **how power sources are selected in different contexts** — but **not** the physics of generation and **not** power calculations.",
    { callout: { t: "warn", h: "The spec's boundary — don't waste time", body: "*Does not include:* the physics of how power is generated, and calculations of power consumption. So you never need to explain the photovoltaic effect or work out milliamp-hours. You **do** need to reason about *relative* consumption — \"sampling every second instead of every hour will drain the battery far faster\" — and justify a choice." }},

    { page: "What consumes the power" },
    { h: "Frequency of data collection" },
    "Every time a device wakes, powers its sensor, takes a reading and processes it, it draws current. Sampling **more often** therefore means proportionally more energy — and it also produces more data to store and send. Between samples a well-designed device **sleeps**, drawing almost nothing; the sleep periods, not the readings, are what make years of battery life possible.",
    { h: "Frequency of communication" },
    "Transmitting is normally the **most expensive single thing** an IoE device does — the radio needs far more current than the sensor, and it must stay awake to negotiate a connection and wait for an acknowledgement. Consequently the standard design pattern is to **sample often but transmit rarely**: buffer readings on the device and send them in batches, or only send when a threshold is crossed (an *exception report*).",
    { callout: { t: "tip", h: "The two frequencies are separate design decisions", body: "A soil-moisture probe might **sample every 15 minutes** (so the trend is not missed) but **transmit once a day** (because nobody acts on it sooner). Separating the two is one of the clearest ways to show M6-level understanding: you keep the data quality while cutting the dominant energy cost." }},
    { callout: { t: "info", h: "Other things that drive consumption", body: [
      { kv: [
        ["Transmission range and method", "A long-range cellular link costs far more energy per message than a short Bluetooth Low Energy hop to a nearby gateway."],
        ["Data size", "Bigger payloads mean a longer transmission window and more radio-on time (3.3)."],
        ["On-device processing", "Analysing on the device costs processor energy but can *save* far more by reducing what must be transmitted (2.3)."],
        ["Output devices", "Screens, speakers and especially actuators (motors, valves, locks) draw much more than sensors."],
        ["Environment", "Cold reduces battery capacity; heat shortens battery life; shade or short winter days cut solar yield."]
      ] }
    ] } },

    { page: "How devices can be powered" },
    { callout: { t: "info", h: "The five power sources", body: [
      { kv: [
        ["Solar", "Photovoltaic panel, normally charging a battery so the device runs at night. **Benefits:** free ongoing energy, no cabling, ideal for remote outdoor sites, low running cost. **Limitations:** needs light — poor in winter, shade, indoors or under a canopy; panel adds size, cost and something to be soiled, stolen or vandalised; still needs a battery."],
        ["Motion (kinetic / vibration harvesting)", "Converts movement or vibration into electricity. **Benefits:** maintenance-free where movement is constant — machinery, vehicles, a worn device, a rotating shaft; works in the dark. **Limitations:** tiny output, so only suits very low-power devices with infrequent transmission; useless where there is no reliable motion."],
        ["Radio Frequency (RF) energy harvesting", "Captures ambient or deliberately transmitted radio energy. **Benefits:** enables battery-free devices (passive RFID/NFC tags are the everyday example); nothing to replace. **Limitations:** extremely small amounts of energy and very short range; typically only supports a device that wakes to answer a reader, not one that measures continuously."],
        ["Battery", "Primary (non-rechargeable, e.g. lithium thionyl chloride) or rechargeable. **Benefits:** simple, cheap, portable, works anywhere, no cabling, allows the device to be placed exactly where the data is. **Limitations:** finite — must be replaced or recharged, which is a recurring labour cost and an environmental/e-waste issue; capacity falls in cold weather; the whole design must be built around conserving it."],
        ["Wired power source", "Mains or Power over Ethernet. **Benefits:** effectively unlimited energy, so high sampling rates, continuous transmission, on-device processing, screens and actuators are all possible; no maintenance visits for power. **Limitations:** the device must be near a supply; installation/cabling cost and disruption; fails in a power cut unless backed up; restricts where the device can be placed and makes it immovable."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "\"Solar-powered\" does not mean \"battery-free\"", body: "Almost every solar IoE device also contains a rechargeable battery — the panel charges it in daylight and the device runs off the battery overnight and through bad weather. Writing \"solar so no battery needed\" is wrong. Likewise, harvesting (motion/RF) usually charges a small capacitor or cell rather than powering the device directly." }},

    { page: "Selecting a power source" },
    { table: { head: ["Context", "Sensible choice", "Why"], rows: [
      ["Mains-served building (cold store, factory, office)", "Wired", "Unlimited energy allows accuracy, high sample rates and actuators; no maintenance visits."],
      ["Remote outdoor site (river, field, forest)", "Solar + rechargeable battery", "No cabling possible; daylight is available; battery covers night and dull days."],
      ["Under a canopy / indoors with no mains", "Long-life primary battery", "No usable light for solar; low duty cycle makes multi-year battery life realistic."],
      ["Worn or carried device", "Rechargeable battery (possibly motion-assisted)", "Must be light and portable; the user can charge it nightly."],
      ["Rotating or vibrating machinery", "Motion harvesting", "Constant vibration is free energy in a place where changing batteries means stopping the machine."],
      ["Asset tags read at a gate or till", "RF harvesting (passive tag)", "The tag only needs energy at the instant it is read; battery-free means zero maintenance across thousands of tags."],
      ["Safety-critical alarm", "Wired with battery backup", "Needs continuous operation and must survive a mains failure."]
    ] } },
    { callout: { t: "tip", h: "How to write M6", body: "M6 wants **benefits and limitations of the way *your* devices will be powered**. Structure it per device group: *\"The river-level sensors are solar with a lithium backup. Benefit: no cabling to a site with no supply, and no scheduled battery replacement, which matters because the nearest access road is 2 km away. Limitation: in December there may be under 8 hours of weak daylight, so the sample rate drops to hourly and the battery must hold five days of autonomy.\"* Concrete, contextual, two-sided." }},
    { callout: { t: "memorise", h: "Power", body: "**Consumption drivers:** frequency of collection · frequency of communication (usually the biggest) · range · data size · on-device processing · outputs. **Sources:** **S**olar · **M**otion · **R**F harvesting · **B**attery · **W**ired. Pattern to quote: *sample often, transmit rarely, sleep in between.*" }}
  ],
  flashcards: [
    ["Name the five ways an IoE data collection device can be powered.", "Solar, motion (kinetic) harvesting, RF energy harvesting, battery, and a wired power source."],
    ["Which activity usually consumes the most power on an IoE device?", "Communication — the radio draws far more current than the sensor and must stay awake to connect and receive an acknowledgement."],
    ["How does frequency of data collection affect power consumption?", "Each sample wakes the device and powers the sensor, so sampling more often consumes proportionally more energy and produces more data to store and send."],
    ["Why do IoE devices sample often but transmit rarely?", "Sampling is cheap and preserves data quality; transmitting is the dominant energy cost, so readings are buffered and sent in batches or only when a threshold is crossed."],
    ["Give one benefit and one limitation of solar power for an IoE device.", "Benefit: free ongoing energy with no cabling, ideal for remote outdoor sites. Limitation: needs light — poor in winter, shade or indoors — and still requires a battery for darkness."],
    ["Give one benefit and one limitation of a wired power source.", "Benefit: effectively unlimited energy allowing high sample rates, continuous transmission and actuators. Limitation: the device must be near a supply, cabling costs money, and it fails in a power cut without backup."],
    ["When is motion energy harvesting appropriate?", "Where movement or vibration is constant — machinery, vehicles or a worn device — and the device's power need is very small."],
    ["What is RF energy harvesting typically used for?", "Battery-free passive devices such as RFID/NFC tags that wake only when energised by a nearby reader."],
    ["Why is 'solar means no battery is needed' wrong?", "Solar devices almost always include a rechargeable battery that the panel charges by day so the device keeps running at night and in poor weather."],
    ["Give one limitation of battery power beyond running out.", "Replacement is a recurring labour cost, capacity falls in cold weather, and disposal creates an environmental/e-waste issue."],
    ["Which power source suits a safety-critical alarm and why?", "Wired with battery backup — it needs continuous operation and must still work through a mains failure."],
    ["What two things does the F204 spec say you do NOT need about power?", "The physics of how power is generated, and calculations of power consumption."]
  ],
  quiz: [
    {
      q: "Which change would most reduce the power consumption of a battery-powered sensor node?",
      opts: [
        "Using a larger enclosure",
        "Buffering readings and transmitting once an hour instead of every minute",
        "Adding a second sensor",
        "Painting the device white"
      ],
      ans: 1,
      why: "Transmission dominates energy use, so cutting the number of transmissions saves far more than any other single change."
    },
    {
      q: "A sensor is fitted inside a windowless plant room with no mains socket nearby. Which power source is most appropriate?",
      opts: ["Solar", "A long-life primary battery", "RF harvesting", "Wired PoE from the socket"],
      ans: 1,
      why: "There is no light for solar and no supply for wired; a low duty-cycle device can run for years on a primary lithium cell."
    },
    {
      q: "What is the main limitation of RF energy harvesting?",
      opts: [
        "It cannot work indoors",
        "It delivers only very small amounts of energy over a short range",
        "It requires direct sunlight",
        "It needs a mains supply"
      ],
      ans: 1,
      why: "Harvested RF energy is tiny and short-range, suiting passive tags that wake briefly rather than continuous measurement."
    },
    {
      q: "A vibration sensor is bolted to a pump that runs continuously inside a sealed housing. Which power source removes the need for maintenance visits?",
      opts: ["Battery", "Motion harvesting", "Solar", "Manual charging"],
      ans: 1,
      why: "Constant vibration is free energy exactly where opening the housing to change a battery would mean stopping the pump."
    },
    {
      q: "Why does transmission range affect power consumption?",
      opts: [
        "Longer range needs more transmit power and a longer radio-on time per message",
        "Longer range needs a bigger battery casing",
        "Range has no effect on power",
        "Longer range reduces the data size"
      ],
      ans: 0,
      why: "Reaching further requires more radio energy per message, so a long cellular link costs far more than a short BLE hop to a gateway."
    },
    {
      q: "Which statement would earn a Merit-level mark for M6?",
      opts: [
        "The sensors are solar-powered.",
        "Solar is better than battery.",
        "Solar avoids cabling to a site 2 km from the nearest road, but December daylight is weak, so the sample rate drops to hourly and the battery must hold five days of autonomy.",
        "Batteries run out eventually."
      ],
      ans: 2,
      why: "M6 needs benefits *and* limitations tied to the specific context and consequences for the design."
    }
  ],
  exam: [
    {
      q: "Explain how the frequency of data collection and the frequency of communication affect the power consumption of an IoE device.",
      marks: 4,
      ms: [
        "Each collection wakes the device and powers the sensor, so more frequent sampling uses proportionally more energy (1) and creates more data to store/transmit (1).",
        "Communication is the largest single drain because the radio needs high current and must stay awake to connect and receive acknowledgement (1).",
        "Therefore devices commonly sample frequently but buffer and transmit in batches or on exception, sleeping in between to conserve power (1)."
      ]
    },
    {
      q: "Describe two benefits and two limitations of powering remote environmental sensors using solar energy.",
      marks: 4,
      ms: [
        "Benefit: no cabling is required, so devices can be placed where no mains supply exists (1).",
        "Benefit: ongoing energy is free and needs no scheduled battery-replacement visits, reducing running cost (1).",
        "Limitation: output depends on light, so performance falls in winter, shade or under a canopy (1).",
        "Limitation: a rechargeable battery is still required for darkness, and the panel adds cost, size and vulnerability to soiling, theft or vandalism (1)."
      ]
    },
    {
      q: "NEA practice (P7/M6). A landslide-warning system uses tilt and soil-moisture sensors on a remote hillside, plus a mains-powered gateway in a nearby maintenance hut. Describe how the devices will be powered and explain the benefits and limitations of your choices.",
      marks: 9,
      ms: [
        "Hillside sensors: solar panel charging a rechargeable battery, sized for several days of autonomy (1–2).",
        "Justified because there is no mains supply on the slope and access for battery replacement is difficult and hazardous (1–2).",
        "Gateway: wired mains with a UPS/battery backup, because it must transmit continuously and must survive a power cut during the very storm that could trigger a slide (1–2).",
        "Benefit: solar gives indefinite operation with no scheduled maintenance visits; wired gateway gives unlimited energy for continuous cellular uplink (1–2).",
        "Limitation: solar yield falls in winter and under tree cover, so sampling/transmission frequency must be reduced or the panel oversized (1–2).",
        "Limitation: batteries lose capacity in cold weather and eventually need replacement, creating cost and e-waste; panels can be soiled, shaded, stolen or vandalised (1–2).",
        "Design response linking power to behaviour — e.g. sample every 10 minutes but transmit twice daily, switching to immediate exception reporting when movement exceeds a threshold (1–2)."
      ]
    }
  ]
};

C["it:F204.2.3"] = {
  notes: [
    "Where processing happens is one of the most heavily assessed decisions in F204 — it is criterion **M5** (*explain how and where data will be processed using appropriate technical documentation*). The spec gives four locations that form a **continuum from the device outwards**: **device → edge → fog → cloud**, with the cloud further split into **SaaS / PaaS / IaaS** and **public / private / hybrid**. For each you need *where*, *why there*, its *benefits and limitations*, and *how the location is selected in different contexts*.",
    { callout: { t: "def", h: "The processing continuum", body: "The further from the device you process, the **more computing power and storage** you have — and the **more latency, bandwidth cost and dependence on the network** you take on. Every choice on this continuum is that trade-off." }},

    { page: "The four locations" },
    { callout: { t: "info", h: "Device · Edge · Fog · Cloud", body: [
      { kv: [
        ["Device (on-board)", "Processing on the sensor/microcontroller itself. Typically simple: convert the raw signal to a value, compare to a threshold, discard duplicates, decide whether to transmit at all. **Why here:** instant response with no network at all, minimum data sent, best privacy (raw data never leaves). **Limits:** tiny processing power, memory and energy budget."],
        ["Edge", "Processing on a nearby gateway, controller or local hub serving a handful of devices — in the same room, machine or vehicle. **Why here:** near-instant (millisecond) response for local control, aggregates and filters before anything leaves site, keeps working if the internet drops. **Limits:** hardware must be bought, powered, secured and maintained locally; capacity is still modest."],
        ["Fog", "An intermediate layer between edge and cloud — local servers or fog nodes serving a whole site, factory, campus or city district. **Why here:** enough power for real analytics and short-term storage, still local so latency is low and bandwidth to the cloud is reduced; can coordinate across many edge nodes. **Limits:** a genuine local data centre to buy, house, secure and run; more complex architecture."],
        ["Cloud", "Processing on remote data-centre infrastructure reached over the internet. **Why here:** effectively unlimited compute and storage, machine learning across the whole estate, long-term history, access from anywhere, no hardware to own. **Limits:** highest latency, continuous bandwidth cost, useless if connectivity fails, data leaves your premises (legal/privacy/sovereignty), ongoing subscription cost and supplier lock-in."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Fog vs edge — the distinction students get wrong", body: "Both are \"local\", so say what separates them: **edge** is *at or beside the device* and serves that device or machine (a gateway in the cabinet); **fog** is a *layer serving many edge nodes across a site or area* (a server room for the whole plant, a node for a city district). Edge = one machine's brain; fog = the site's brain." }},
    { table: { head: ["", "Device", "Edge", "Fog", "Cloud"], rows: [
      ["Latency", "Lowest", "Very low", "Low", "Highest"],
      ["Processing power", "Very small", "Modest", "Substantial", "Effectively unlimited"],
      ["Bandwidth used", "None", "Very low", "Low", "High and continuous"],
      ["Works offline?", "Yes", "Yes", "Yes (on site)", "No"],
      ["Data leaves site?", "No", "No", "No", "Yes"],
      ["Cost model", "Hardware only", "Local hardware", "Local infrastructure", "Ongoing subscription"],
      ["Best for", "Threshold checks, filtering", "Real-time local control", "Site-wide analytics, buffering", "History, ML, multi-site dashboards"]
    ] } },

    { page: "Cloud service and deployment models" },
    { callout: { t: "def", h: "The three service models", body: "**SaaS — Software as a Service:** you use finished software over the internet (an IoT dashboard, Microsoft 365). *You manage nothing but your data and settings.* **PaaS — Platform as a Service:** you get a ready platform (runtime, database, IoT hub) and deploy your own application onto it. *You manage your code and data.* **IaaS — Infrastructure as a Service:** you rent raw virtual machines, storage and networking. *You manage the OS, software and everything above it.*" }},
    { callout: { t: "info", h: "Choosing between them", body: [
      { kv: [
        ["SaaS", "Fastest to deploy, lowest skill requirement, predictable cost. But least flexible — you take the features you are given and can be locked in."],
        ["PaaS", "Good middle ground for a custom IoE application: you write the logic, the provider runs the servers, scaling and patching. Less control over the underlying stack."],
        ["IaaS", "Maximum control and portability — useful for unusual requirements or strict configuration control. But you carry the burden of patching, securing and scaling it yourself."]
      ] }
    ] } },
    { callout: { t: "def", h: "The three deployment models", body: "**Public cloud:** shared infrastructure run by a provider for many customers — cheapest, most scalable, least control. **Private cloud:** infrastructure dedicated to one organisation (on-premises or hosted) — most control and easiest to satisfy strict regulation, but expensive. **Hybrid cloud:** a deliberate mix — sensitive or regulated data kept in the private side, bulk or bursty workloads pushed to the public side." }},
    { callout: { t: "tip", h: "Hybrid is usually the honest answer for health, finance and government scenarios", body: "If your scenario involves patient data, children, or anything with a legal retention/sovereignty requirement, a hybrid design — identifiable data in a private cloud or on-site, anonymised/aggregated analytics in the public cloud — is both realistic and directly links M5 to your legal and ethical section (5.3)." }},

    { page: "Selecting a processing location" },
    { callout: { t: "info", h: "The decision questions", body: [
      { kv: [
        ["How fast must the decision be?", "Milliseconds and safety-critical → device or edge. Minutes or hours → fog or cloud."],
        ["How much data is there?", "High-rate streams (vibration, video) must be filtered at the edge; sending it all is unaffordable."],
        ["Is the connection reliable?", "If the site loses connectivity, anything safety- or service-critical must still work locally."],
        ["How sensitive is the data?", "Processing locally and sending only aggregates is a genuine privacy control (data minimisation)."],
        ["How much history and cross-site analysis is needed?", "Trends, ML models and multi-site dashboards need the cloud."],
        ["What can be afforded and maintained?", "Local hardware is capital cost plus staff; cloud is ongoing operating cost with no hardware."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "It is not either/or — real designs use several layers", body: "The strongest M5 answers describe a **split**: threshold checks on the device, real-time control at the edge, buffering and site analytics in the fog, and long-term history and machine learning in the cloud. Saying \"everything goes to the cloud\" both loses marks and would fail the scenario the moment the broadband dropped." }},
    { callout: { t: "warn", h: "M5 requires technical documentation", body: "The criterion says *using appropriate technical documentation* — so support your explanation with a **data flow diagram** showing which processing happens at each layer (see 6.5). Prose alone is unlikely to reach Merit." }},
    { callout: { t: "memorise", h: "Processing", body: "**Device → Edge → Fog → Cloud**: power and storage rise, latency, bandwidth cost and dependence rise too. Cloud service models: **SaaS** (use software) · **PaaS** (deploy your app) · **IaaS** (rent infrastructure). Deployment: **public** (cheap, shared) · **private** (control, regulated) · **hybrid** (split by sensitivity)." }}
  ],
  flashcards: [
    ["Name the four locations where IoE data can be processed.", "On the device, at the edge, in the fog layer, and in the cloud."],
    ["What is edge processing?", "Processing on a nearby gateway or controller serving one device, machine or room — giving near-instant local response and filtering data before it leaves site."],
    ["How does fog processing differ from edge processing?", "Edge is at or beside the device serving that device; fog is an intermediate layer of local servers serving many edge nodes across a whole site, campus or district."],
    ["Give two benefits of cloud processing.", "Effectively unlimited compute and storage for machine learning and long-term history, plus access from anywhere with no hardware to own or maintain."],
    ["Give two limitations of cloud processing.", "Highest latency and continuous bandwidth cost; it stops working if connectivity fails, and data leaves the premises raising privacy/sovereignty and lock-in issues."],
    ["Why process on the device itself?", "Instant response with no network, minimum data transmitted, and best privacy because raw data never leaves the device."],
    ["Define SaaS, PaaS and IaaS.", "SaaS — you use finished software over the internet. PaaS — you deploy your own application onto a provider's ready platform. IaaS — you rent raw virtual machines, storage and networking and manage everything above them."],
    ["What is a hybrid cloud and when is it chosen?", "A deliberate mix of private and public cloud — sensitive or regulated data stays private while bulk or bursty analytics run in the public cloud. Common in health, finance and government scenarios."],
    ["Which processing location should be used for a safety-critical, millisecond decision?", "The device or the edge — so the response does not depend on the network and cannot be delayed by internet latency."],
    ["Why must a high-rate video or vibration stream be processed at the edge?", "Transmitting all of it would be unaffordable in bandwidth and power; the edge filters it down to events or summaries before anything is sent."],
    ["What is the trade-off along the device→cloud continuum?", "Moving outwards gains processing power and storage but adds latency, bandwidth cost and dependence on the network."],
    ["What does criterion M5 require beyond a written explanation?", "Appropriate technical documentation — e.g. a data flow diagram showing which processing happens at each layer."]
  ],
  quiz: [
    {
      q: "A robot arm must stop within milliseconds if a person is detected in its cell. Where should that decision be processed?",
      opts: ["Public cloud", "Device or edge", "Fog only", "A SaaS dashboard"],
      ans: 1,
      why: "Safety-critical millisecond decisions cannot depend on network latency, so they are made on the device or at the edge."
    },
    {
      q: "Which cloud service model means the customer manages the operating system and everything above it?",
      opts: ["SaaS", "PaaS", "IaaS", "Hybrid"],
      ans: 2,
      why: "IaaS rents raw infrastructure; the customer patches and manages the OS, middleware and applications."
    },
    {
      q: "A factory installs local servers that aggregate data from twenty machine gateways before sending summaries onward. This layer is best described as…",
      opts: ["Device processing", "Edge processing", "Fog processing", "SaaS"],
      ans: 2,
      why: "A local layer serving many edge nodes across a site is the fog layer."
    },
    {
      q: "Which is a genuine limitation of cloud processing for a remote flood sensor network?",
      opts: [
        "The cloud has too little storage",
        "If the network link fails during the storm, no processing or alerting happens",
        "The cloud cannot run analytics",
        "The cloud is always slower than the device at storage"
      ],
      ans: 1,
      why: "Cloud processing depends entirely on connectivity — precisely what a storm may break — so local fallback is needed."
    },
    {
      q: "A hospital keeps identifiable patient data on private infrastructure but runs anonymised trend analysis on public cloud services. This is…",
      opts: ["Public cloud", "Private cloud", "Hybrid cloud", "Edge computing"],
      ans: 2,
      why: "Splitting workloads by sensitivity between private and public infrastructure is a hybrid cloud deployment."
    },
    {
      q: "Which statement about the processing continuum is correct?",
      opts: [
        "Moving processing to the cloud always reduces latency",
        "Moving processing outwards increases available power but also latency and bandwidth cost",
        "Device processing has the most storage",
        "Fog processing requires no local hardware"
      ],
      ans: 1,
      why: "The continuum trades computing power and storage against latency, bandwidth cost and network dependence."
    }
  ],
  exam: [
    {
      q: "Describe the difference between edge processing and cloud processing, giving one benefit of each.",
      marks: 4,
      ms: [
        "Edge processing happens on a local gateway or controller near the devices (1); benefit — very low latency and it keeps working if the internet connection fails (1).",
        "Cloud processing happens on remote data-centre infrastructure over the internet (1); benefit — effectively unlimited compute and storage for long-term history and machine learning, accessible from anywhere (1)."
      ]
    },
    {
      q: "Explain the difference between SaaS, PaaS and IaaS.",
      marks: 3,
      ms: [
        "SaaS — the customer uses finished software delivered over the internet and manages only their data/settings (1).",
        "PaaS — the provider supplies a ready platform (runtime, database, IoT hub) onto which the customer deploys their own application (1).",
        "IaaS — the customer rents virtual machines, storage and networking and manages the operating system and everything above it (1)."
      ]
    },
    {
      q: "NEA practice (M5). A city deploys air-quality sensors on lamp posts across a district. Explain how and where the collected data will be processed, justifying the locations chosen.",
      marks: 9,
      ms: [
        "Device — raw sensor signals converted to concentration values, obviously invalid readings discarded and readings compared to a threshold so only meaningful data is sent (1–2).",
        "Edge — a gateway per street/cabinet aggregates several sensors, averages and buffers readings, and can trigger a local sign or alert if a limit is breached even with no internet (1–2).",
        "Fog — a district node combines many gateways to spot area-wide pollution episodes and hold short-term history for the council's operational dashboard (1–2).",
        "Cloud — long-term storage, year-on-year trend analysis, machine-learning prediction and public open-data publication (1–2).",
        "Justification references latency (local alerts must not wait on the internet), bandwidth/power (filtering at device/edge cuts transmission), resilience (the district keeps working if the WAN drops) and cost (no capital data centre for the historical archive) (1–3).",
        "Cloud model justified — e.g. PaaS on a public cloud because the data is non-personal environmental data, so a private cloud's cost is not warranted (1).",
        "Supported by appropriate technical documentation such as a data flow diagram showing processing at each layer (1)."
      ]
    }
  ]
};

C["it:F204.2.4"] = {
  notes: [
    "Storage answers criterion **P6** (*describe the devices and locations where data will be stored*). The spec splits it into **devices** — server, mobile, system — and **locations** — remote/cloud and on-site/on-device — and asks how storage locations are **selected in different contexts**. Do not confuse this with 2.3: *processing* is where the thinking happens, *storage* is where the data rests. They are usually, but not always, in the same place.",

    { page: "Storage devices" },
    { callout: { t: "info", h: "The three device types", body: [
      { kv: [
        ["Server", "A dedicated machine (on-site or in a data centre) built to hold and serve data to many clients — large capacity, RAID redundancy, backup regimes, proper access control. **Use for:** the authoritative store of the solution's data, historical archives, anything multiple users query."],
        ["Mobile", "Storage on a phone, tablet or other portable device — the operator's app, a field engineer's tablet, a patient's phone acting as the wearable's hub. **Use for:** data the user needs to hand, offline working, and buffering while out of coverage. **Risk:** the device is easily lost or stolen, so encryption and remote wipe matter."],
        ["System", "Storage built into the IoE device or its embedded system — the sensor's own flash memory or the gateway's local disk. **Use for:** buffering readings between transmissions, holding configuration and firmware, keeping a short local history so nothing is lost if the network drops. **Limit:** very small capacity, so it is a queue, not an archive."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Buffering is the point of system storage", body: "The single most valuable thing to say about on-device storage is that it makes the solution **resilient**: readings are written to the device's own flash and only deleted once the server acknowledges receipt, so a network outage delays the data instead of destroying it. That one sentence is worth more than a list of capacities." }},

    { page: "Storage locations" },
    { table: { head: ["", "Remote / cloud", "On-site / on-device"], rows: [
      ["Capacity", "Effectively unlimited, expands on demand.", "Fixed — you buy what you install."],
      ["Cost model", "Ongoing subscription, priced by volume and retrieval.", "Capital cost up front, then power, space and staff."],
      ["Access", "From anywhere with internet; easy multi-site and remote working.", "Fast on the local network; remote access must be built and secured."],
      ["Resilience", "Provider handles replication, redundancy and geographic backup.", "You are responsible for RAID, backups and disaster recovery."],
      ["Availability", "Depends entirely on the internet connection.", "Works with no internet at all."],
      ["Control & compliance", "Data is held by a third party; sovereignty, retention and processor agreements must be checked.", "Full physical and legal control; simplest for strict regulation."],
      ["Security", "Provider's expert security, but a large shared target and credentials are exposed to the internet.", "Physically controlled, but only as good as your own staff and budget."],
      ["Scaling", "Trivial — add capacity in minutes.", "Requires procurement and installation."]
    ] } },
    { callout: { t: "info", h: "Choosing a storage location", body: [
      { kv: [
        ["Volume and growth", "Rapidly growing sensor history is far cheaper and easier in the cloud than repeatedly buying disks."],
        ["Who needs access", "Multi-site or remote stakeholders → cloud. One control room → on-site is enough."],
        ["Connectivity", "Poor or intermittent links make cloud-only storage dangerous; keep a local copy."],
        ["Sensitivity and law", "Special-category data (health, biometrics) or a sovereignty requirement pushes towards on-site or a private/hybrid cloud."],
        ["Retention", "Long statutory retention favours cheap cloud archive tiers; short-lived operational data can live locally."],
        ["Budget shape", "Capital budget available → on-site; prefer operating expenditure with no hardware → cloud."],
        ["Recovery needs", "Cloud gives geographic redundancy cheaply — a fire or flood on site destroys on-site storage and its backup if both are in the same building."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "\"Cloud\" is not the same as \"backed up\"", body: "Cloud providers replicate for *availability*, but if your application deletes or corrupts a record, that deletion replicates too. A backup is a separate, restorable copy — usually in a different account, region or medium. Saying \"data is in the cloud so it is safe\" will not earn a mark; saying \"the cloud store is replicated across regions, with a separate nightly backup retained for 30 days\" will." }},
    { callout: { t: "tip", h: "The realistic answer is layered", body: "Most good IoE designs store data in **three places at once**: a short buffer in the device's system storage, an operational copy on-site or at the edge (recent weeks, fast to query, works offline), and the long-term archive in the cloud. Describe the layers and say *what lives in each and for how long* — that is exactly what P6 asks for." }},
    { callout: { t: "memorise", h: "Storage", body: "**Devices:** server (authoritative, large, redundant) · mobile (portable, offline, loss risk) · system (on-device buffer, small). **Locations:** remote/cloud (unlimited, anywhere, needs internet, third-party control) · on-site/on-device (fast, offline, full control, fixed capacity, you own the backups). Selection: **volume · access · connectivity · sensitivity/law · retention · budget · recovery.**" }}
  ],
  flashcards: [
    ["Name the three storage device types in the F204 spec.", "Server, mobile, and system (storage built into the IoE device or its embedded system)."],
    ["Name the two storage locations in the F204 spec.", "Remote/cloud, and on-site/on-device."],
    ["What is system storage used for in an IoE device?", "Buffering readings between transmissions, holding configuration and firmware, and keeping a short local history so data is not lost if the network drops."],
    ["Why does on-device buffering make a solution more resilient?", "Readings are held in the device's own flash and only deleted once the server acknowledges receipt, so a network outage delays data rather than destroying it."],
    ["Give two benefits of cloud storage.", "Effectively unlimited capacity that scales on demand, access from anywhere, and provider-managed replication and geographic redundancy with no hardware to buy."],
    ["Give two limitations of cloud storage.", "It depends entirely on the internet connection, and data is held by a third party — raising sovereignty, retention and processor-agreement issues, plus ongoing subscription cost."],
    ["Give two benefits of on-site storage.", "It works with no internet connection and gives full physical and legal control, which is simplest for strictly regulated data."],
    ["Give two limitations of on-site storage.", "Fixed capacity that needs procurement to expand, and you carry full responsibility for RAID, backups and disaster recovery."],
    ["Why is mobile storage a security concern?", "Phones and tablets are easily lost or stolen, so any data held on them needs encryption and remote-wipe capability."],
    ["Why is 'the data is in the cloud so it is backed up' wrong?", "Cloud replication protects availability, but an accidental deletion or corruption replicates too — a backup is a separate, restorable copy, ideally in another account or region."],
    ["Describe a typical three-layer IoE storage design.", "A short buffer in the device's system storage, an operational copy on-site/at the edge for recent data and offline working, and the long-term archive in the cloud."],
    ["Which factor most strongly pushes health data towards on-site or private cloud storage?", "Its sensitivity as special-category personal data, plus retention and data-sovereignty obligations requiring demonstrable control."]
  ],
  quiz: [
    {
      q: "A sensor writes readings to its own flash memory and deletes them only once the server confirms receipt. This is an example of…",
      opts: ["Cloud archiving", "System storage used as a buffer", "Mobile storage", "Fog processing"],
      ans: 1,
      why: "On-device (system) storage buffers data so a network outage delays rather than destroys readings."
    },
    {
      q: "Which is the strongest reason to choose on-site storage over cloud storage?",
      opts: [
        "It always costs less",
        "The site has unreliable internet and the data must remain available during outages",
        "It never needs backing up",
        "It has unlimited capacity"
      ],
      ans: 1,
      why: "Cloud storage depends on connectivity; where the link is unreliable, an on-site copy keeps the system usable."
    },
    {
      q: "Which storage device type is the authoritative store queried by many users?",
      opts: ["Mobile", "System", "Server", "Sensor"],
      ans: 2,
      why: "A server is built to hold large volumes with redundancy and to serve many clients under proper access control."
    },
    {
      q: "A field engineer's tablet holds inspection records while out of coverage. What is the main risk?",
      opts: [
        "Tablets cannot store data",
        "The device may be lost or stolen, so the data needs encryption and remote wipe",
        "It uses too much bandwidth",
        "Mobile storage cannot be synchronised"
      ],
      ans: 1,
      why: "Portable devices are easily lost or stolen, so data on them must be encrypted and remotely wipeable."
    },
    {
      q: "Which factor would most push an IoE solution towards cloud storage?",
      opts: [
        "A legal requirement that data never leaves the country's borders",
        "Rapidly growing sensor history that must be accessible to stakeholders across several sites",
        "A total lack of internet connectivity",
        "A one-off capital budget with no ongoing funding"
      ],
      ans: 1,
      why: "Large, growing volumes needed by geographically spread users are exactly what cloud storage is good at."
    },
    {
      q: "What distinguishes replication from backup?",
      opts: [
        "They are the same thing",
        "Replication copies data for availability and copies mistakes too; a backup is a separate restorable copy from an earlier point in time",
        "Backups only exist on tape",
        "Replication is only possible on-site"
      ],
      ans: 1,
      why: "Replication protects against hardware or site failure but propagates deletions; backups allow recovery to a previous state."
    }
  ],
  exam: [
    {
      q: "Describe two locations where data from an IoE solution can be stored, giving one advantage of each.",
      marks: 4,
      ms: [
        "Remote/cloud storage — held on a provider's data-centre infrastructure and reached over the internet (1); advantage: effectively unlimited, scalable capacity accessible from anywhere with provider-managed redundancy (1).",
        "On-site/on-device storage — held on local servers or in the device's own memory (1); advantage: fast local access that continues to work with no internet connection, and full control over the data (1)."
      ]
    },
    {
      q: "Explain why an IoE device might store data locally even when a cloud service is available.",
      marks: 3,
      ms: [
        "To buffer readings when the network connection is unavailable or intermittent so no data is lost (1).",
        "Readings can be held until the server acknowledges receipt, giving resilience against outages (1).",
        "Local storage also allows the device or edge system to keep operating and making decisions independently of the cloud (1)."
      ]
    },
    {
      q: "NEA practice (P6). A care provider monitors residents with wearable sensors across four care homes. Describe the devices and locations where the data will be stored, and justify your choices.",
      marks: 9,
      ms: [
        "System storage on the wearable — a short rolling buffer so readings survive a lost connection between the wearable and the room hub (1–2).",
        "Mobile storage — the carer's handset/tablet holds current alerts and shift notes for offline working, encrypted with remote wipe because the device could be lost (1–2).",
        "Server on-site at each home — the operational store for recent data, so alerting continues during an internet outage and the local team gets fast access (1–2).",
        "Remote/cloud — the long-term archive across all four homes for trend analysis, regulatory reporting and management dashboards (1–2).",
        "Justification: connectivity resilience (care alerts must not depend on broadband), volume/growth (continuous vitals across four sites), multi-site access for managers, and cost of scaling (1–2).",
        "Legal justification: vitals are special-category health data, so a private or UK-region cloud with a processor agreement, encryption at rest, access control and a defined retention period is required (1–2).",
        "Backup distinguished from replication — a separate restorable backup retained for a stated period, held apart from the live copy (1)."
      ]
    }
  ]
};

/* ─────────────────────────────────────────────────────────────
   Topic Area 3 — Connectivity and data transmission
   ───────────────────────────────────────────────────────────── */

C["it:F204.3.1"] = {
  notes: [
    "A short leaf, but one that carries the vocabulary the rest of Topic Area 3 depends on. The spec names **three types of connection** inside an IoE system — **Person to Person (P2P)**, **Person to Device (P2D)** and **Device to Device (D2D)** — and asks *how people and devices are connected to each other* and *what types of connection are established within the IoE*. These are the **People ↔ Things** relationships of the four pillars, made concrete.",
    { callout: { t: "def", h: "The three connection types", body: "**P2P — Person to Person:** two or more people communicating, with technology carrying the message (a video call, messaging, a shared dashboard discussion). **P2D — Person to Device:** a person interacting with a device — reading its output or giving it an instruction. **D2D — Device to Device:** machines exchanging data with each other with no human in the loop." }},

    { page: "The three types in detail" },
    { callout: { t: "info", h: "What each looks like in an IoE solution", body: [
      { kv: [
        ["P2P — Person to Person", "The system connects *people* with each other about the data. Examples: a fall alert opening a voice call between resident and carer; an engineer video-calling a remote expert with the machine's readings on screen; a control room messaging a field crew; collaborative dashboards and shared reports. **Role:** decisions that need human judgement, escalation and coordination."],
        ["P2D — Person to Device", "A person and a machine interacting in either direction. **Person → device:** setting a thermostat, acknowledging an alarm, overriding an automated action, scanning a barcode, entering an inspection result. **Device → person:** a push notification, a dashboard, a warning light, a spoken alert. **Role:** this is where the HCI lives (Topic Area 4) — it is the boundary between the system and its users."],
        ["D2D — Device to Device", "Machines talking to machines. Examples: a temperature sensor reporting to a gateway; a gateway forwarding to a cloud platform; a controller commanding an actuator to open a valve; a traffic sensor updating a signal controller. **Role:** the automated backbone — it is what allows the system to react in milliseconds and to run without staff watching it."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Every IoE solution uses all three", body: "A strong proposal maps its connections explicitly: *sensor → gateway → cloud* is **D2D**; *cloud → duty manager's phone, and the manager acknowledging the alert* is **P2D**; *the manager calling the on-call engineer to attend* is **P2P**. Naming which is which shows you understand that the IoE is not only machines — and it directly supports P2/M2 on the four pillars." }},
    { callout: { t: "miscon", h: "P2P here does not mean 'peer-to-peer'", body: "In networking, \"P2P\" usually means *peer-to-peer* file sharing. In the F204 spec it means **Person to Person**. Use the full words in your writing to avoid ambiguity, and never define it as a peer-to-peer network architecture." }},
    { table: { head: ["Type", "Who/what is at each end", "Human involved?", "Typical technology"], rows: [
      ["P2P", "Person ↔ person", "Both ends", "Voice/video call, messaging, email, shared dashboard, alerts routed between staff."],
      ["P2D", "Person ↔ device", "One end", "App, web dashboard, touchscreen, voice assistant, keypad, notification, indicator, haptic feedback."],
      ["D2D", "Device ↔ device", "Neither", "Sensor-to-gateway radio (BLE/Zigbee/Wi-Fi), gateway-to-cloud (cellular/fibre), controller-to-actuator."]
    ] } },

    { page: "Applying it" },
    { callout: { t: "info", h: "Worked example — smart home heating", body: [
      { ul: [
        "**D2D:** room thermostats and window sensors report to the hub; the hub commands the boiler's actuator.",
        "**P2D:** the occupier sets a schedule in the app, receives a \"window open while heating\" notification, and overrides the temperature with a voice command.",
        "**P2P:** the occupier shares access with a family member and messages them to ask if they are home early; the installer video-calls the occupier to diagnose a fault."
      ] }
    ] } },
    { callout: { t: "warn", h: "The point of naming the type is choosing the technology", body: "The connection type constrains the **connectivity method** (3.2) and the **transmission considerations** (3.3). D2D links inside a building can be tiny, low-power radio hops; P2D usually needs the user's own phone and therefore Wi-Fi or mobile data; P2P needs enough bandwidth for voice or video. Say what each connection *needs*, then justify the method in 3.2 — that chain is what D3 rewards." }},
    { callout: { t: "memorise", h: "Connection types", body: "**P2P** = Person to Person (humans, via the system) · **P2D** = Person to Device (the HCI boundary, both directions) · **D2D** = Device to Device (the automated backbone). Every real solution uses all three." }}
  ],
  flashcards: [
    ["What do P2P, P2D and D2D stand for in the IoE?", "Person to Person, Person to Device, and Device to Device."],
    ["Give an example of a D2D connection.", "A temperature sensor reporting to a gateway, a gateway forwarding data to a cloud platform, or a controller commanding an actuator to open a valve."],
    ["Give an example of a P2D connection in both directions.", "Person → device: setting a thermostat or acknowledging an alarm. Device → person: a push notification, dashboard reading or spoken alert."],
    ["Give an example of a P2P connection within an IoE solution.", "A fall alert opening a voice call between a resident and a carer, or an engineer video-calling a remote expert while viewing machine readings."],
    ["What is the role of D2D connections?", "They form the automated backbone — allowing the system to sense, react in milliseconds and operate without a person watching it."],
    ["Why is P2D the most important connection type for HCI design?", "It is the boundary between the system and its users, so output devices, information formats and HCI principles all apply to it."],
    ["Why must P2P not be read as 'peer-to-peer' in F204?", "In this specification P2P means Person to Person; peer-to-peer is an unrelated network architecture, so the full words should be used."],
    ["How does the connection type influence technology choice?", "D2D links can be short-range low-power radio; P2D usually needs the user's phone via Wi-Fi or mobile data; P2P needs enough bandwidth for voice or video."],
    ["In a smart heating system, which connection is the hub commanding the boiler?", "Device to Device (D2D) — no person is involved in that exchange."]
  ],
  quiz: [
    {
      q: "A wearable sends heart-rate readings to a room hub, which forwards them to the cloud. What connection type is this?",
      opts: ["P2P", "P2D", "D2D", "None of these"],
      ans: 2,
      why: "Both ends are machines with no human in the loop — Device to Device."
    },
    {
      q: "A carer receives an alert on their phone and taps to acknowledge it. This is…",
      opts: ["D2D only", "Person to Device", "Person to Person", "RF harvesting"],
      ans: 1,
      why: "A person interacting with the system — receiving output and giving an instruction — is Person to Device."
    },
    {
      q: "In the F204 specification, P2P means…",
      opts: ["Peer to peer file sharing", "Person to Person", "Port to Port", "Protocol to Protocol"],
      ans: 1,
      why: "F204 uses P2P for Person to Person communication carried by the system."
    },
    {
      q: "Which connection type allows an IoE system to respond automatically in milliseconds?",
      opts: ["P2P", "P2D", "D2D", "All equally"],
      ans: 2,
      why: "Device-to-device links need no human decision, so responses are limited only by the network and processing."
    },
    {
      q: "Why does identifying the connection type matter when designing a solution?",
      opts: [
        "It determines the colour of the interface",
        "It constrains the connectivity method and the bandwidth, range and power the link needs",
        "It decides how much the device costs to make",
        "It has no practical effect"
      ],
      ans: 1,
      why: "Each type has different bandwidth, range and power demands, which drives the connectivity method chosen in 3.2."
    }
  ],
  exam: [
    {
      q: "Describe the three types of connectivity found in an IoE system.",
      marks: 3,
      ms: [
        "Person to Person (P2P) — people communicating with each other through the system, e.g. a voice call or message triggered by an alert (1).",
        "Person to Device (P2D) — a person interacting with a device, either giving it an instruction or receiving its output (1).",
        "Device to Device (D2D) — devices exchanging data with each other automatically, with no human involved (1)."
      ]
    },
    {
      q: "For a smart traffic-management system, give one example of each connectivity type.",
      marks: 3,
      ms: [
        "D2D — a road loop or camera reporting counts to a signal controller, which adjusts the light timings (1).",
        "P2D — a control-room operator viewing the dashboard and manually overriding a junction, or a driver receiving a variable-message-sign warning (1).",
        "P2P — the control room contacting the police or a maintenance crew about an incident detected by the system (1)."
      ]
    },
    {
      q: "Explain why an IoE solution needs all three types of connectivity rather than device-to-device connections alone.",
      marks: 6,
      ms: [
        "D2D alone provides automation and speed but no way for people to be informed or to intervene (1–2).",
        "P2D is required so users receive results in a usable form and can instruct, override or acknowledge the system (1–2).",
        "P2P is required for decisions needing human judgement, escalation and coordination between staff (1–2).",
        "Without P2D and P2P the system would only be IoT — the People and Process pillars would be missing, so data would not become action (1–2)."
      ]
    }
  ]
};

C["it:F204.3.2"] = {
  notes: [
    "This is the leaf behind criterion **P10** (*describe the connectivity methods that will be used to transmit the data*) and, with 3.3, **D3** (*justify the connectivity methods chosen, taking transmission considerations into account*). You need each named method's characteristics well enough to **select and justify** it — range, speed, power and typical use.",

    { page: "Wireless methods" },
    { callout: { t: "info", h: "The seven wireless methods", body: [
      { kv: [
        ["Bluetooth (incl. BLE)", "Short range (roughly 10 m typical; BLE up to ~100 m in the open), moderate speed, **very low power** in its Low Energy form. Pairs one device to one hub. **Use for:** wearables to a phone, headphones, sensors to a nearby gateway, personal-area networking. **Limits:** short range, limited number of connections, not suited to whole-site coverage."],
        ["GPS (GNSS)", "**Receive-only positioning**, not a data network. A GPS chip works out where the device is; another method must then *transmit* that position. Global outdoor coverage, no subscription. **Use for:** asset and fleet tracking, wildlife tags, geofencing. **Limits:** needs a clear sky view — poor indoors, in tunnels and among tall buildings; the receiver draws significant power."],
        ["Mobile (3G / 4G / 5G)", "Wide-area coverage wherever there is a mast; 4G gives good speed, 5G adds very high bandwidth and low latency; 3G is legacy and being switched off. **Use for:** anything remote or moving with no local network — vehicles, roadside cabinets, rural sensors. **Limits:** subscription/data cost per device, higher power draw, and no coverage means no service."],
        ["NFC — Near-Field Communication", "**A few centimetres**, very low data rate, can power a passive tag with no battery. **Use for:** contactless payment, access cards, tap-to-pair, product/asset tags. **Limits:** effectively touch range — it is an identification and pairing technology, not a data link."],
        ["Wi-Fi", "Building-scale range (tens of metres), **high bandwidth**, uses existing infrastructure. **Use for:** cameras, screens, tablets, gateways — anything needing bandwidth inside a building with mains power. **Limits:** relatively high power draw (poor for battery sensors), congestion, and range limited by walls."],
        ["Zigbee", "Short-to-medium range, **low power**, low data rate, forms a **mesh** in which devices relay for each other so coverage extends and a failed node is routed around. Supports very many devices. **Use for:** dense building sensor/control networks — lighting, heating, smart home and building automation. **Limits:** low bandwidth, needs a coordinator/hub, shares the congested 2.4 GHz band."],
        ["Z-Wave", "Also a **low-power mesh** for home/building automation, but on a lower sub-GHz frequency, so it **penetrates walls better and avoids Wi-Fi congestion**, with strong interoperability between certified products. **Use for:** smart locks, sensors and lighting in homes. **Limits:** fewer devices per network than Zigbee, lower data rate, proprietary certification."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "GPS is not a way of sending data", body: "A frequent and costly error. GPS **receives** satellite signals so the device can calculate its own position; it cannot transmit anything. A tracker always needs **GPS + a transmitting method** (usually mobile, or a low-power WAN). Write \"GPS for positioning, 4G to transmit\" and the mark is safe." }},
    { callout: { t: "tip", h: "Zigbee vs Z-Wave — how to tell them apart in one line", body: "Both are low-power meshes for building automation. **Zigbee:** 2.4 GHz, huge device counts, open and widely used in industry — but shares the crowded Wi-Fi band. **Z-Wave:** sub-GHz, better wall penetration and no Wi-Fi interference, tightly certified for interoperability — but fewer nodes and lower data rates." }},

    { page: "Wired methods" },
    { callout: { t: "info", h: "The two wired methods", body: [
      { kv: [
        ["Fibre optic", "Light through glass. **Very high bandwidth over very long distances**, immune to electromagnetic interference, hard to tap without detection, and does not suffer the distance limits of copper. **Use for:** site backbones, gateway-to-data-centre links, anywhere with heavy machinery generating interference or a long run. **Limits:** highest installation cost, fragile to sharp bends, needs specialist termination, and carries no power to the device."],
        ["Copper (twisted pair / Ethernet, coaxial)", "Electrical signals through metal. **Cheap, familiar, easy to terminate**, and can carry **power as well as data** (Power over Ethernet), which is a genuine design advantage for cameras and access points. **Use for:** in-building device connections, PoE cameras and gateways. **Limits:** distance-limited (about 100 m for Ethernet), susceptible to electromagnetic interference and crosstalk, lower maximum bandwidth than fibre, and easier to tap."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Wired is not the 'old' option — it is the reliable one", body: "Where a device is fixed, mains-powered and matters (a safety alarm, a compliance-critical fridge probe, a camera), **wired is usually the better engineering answer**: no interference, no battery, no radio congestion, higher security, and PoE gives power and data in one cable. Justifying a wired choice with those reasons scores; defaulting to Wi-Fi for everything does not." }},

    { page: "Selecting and justifying a method" },
    { table: { head: ["Method", "Range", "Data rate", "Power", "Best for"], rows: [
      ["Bluetooth / BLE", "~10–100 m", "Low–medium", "Very low (BLE)", "Wearables and sensors to a nearby phone or gateway."],
      ["GPS", "Global (receive only)", "n/a", "Medium–high", "Working out position — always paired with a transmitting method."],
      ["Mobile 3G/4G/5G", "Kilometres (mast)", "Medium–very high", "High", "Remote, mobile or roadside devices with no local network."],
      ["NFC", "Centimetres", "Very low", "Very low / none (passive)", "Tap-to-identify, payment, access, pairing."],
      ["Wi-Fi", "Tens of metres", "High", "High", "Bandwidth-hungry mains-powered devices inside buildings."],
      ["Zigbee", "10–100 m, mesh", "Low", "Very low", "Dense battery-powered building sensor networks."],
      ["Z-Wave", "~30–100 m, mesh", "Low", "Very low", "Home automation needing wall penetration and interoperability."],
      ["Fibre", "Kilometres", "Very high", "Mains", "Backbones, long runs, high interference environments."],
      ["Copper/Ethernet", "~100 m", "High", "Mains (or PoE)", "Fixed in-building devices; PoE for cameras and access points."]
    ] } },
    { callout: { t: "warn", h: "D3 wants justification, not description", body: "P10 is *describe*; D3 is *justify … taking transmission considerations into account*. So for each link say: the **data size** it carries, the **range** it must cover, the **rate** needed, **how often** it transmits (3.3), what **power** is available, and **why the alternatives were rejected**. \"Zigbee was chosen over Wi-Fi because the 200 sensors are battery-powered and send only a few bytes hourly, so Wi-Fi's power draw would mean monthly battery changes\" — that is a D3 sentence." }},
    { callout: { t: "memorise", h: "Connectivity", body: "Wireless: **B**luetooth · **G**PS (position only!) · **M**obile 3G/4G/5G · **N**FC · **W**i-Fi · **Z**igbee · **Z**-Wave. Wired: **fibre** (fast, far, interference-proof, costly) · **copper** (cheap, ~100 m, can carry power via PoE). Choose on **range · rate · data size · frequency · power · interference · cost · security.**" }}
  ],
  flashcards: [
    ["List the seven wireless connectivity methods named in F204.", "Bluetooth, GPS, mobile (3G/4G/5G), NFC, Wi-Fi, Zigbee and Z-Wave."],
    ["List the two wired connectivity methods named in F204.", "Fibre optic and copper (twisted pair/Ethernet)."],
    ["Why can GPS never be the only connectivity method on a tracker?", "GPS only receives satellite signals so the device can calculate its own position — it cannot transmit, so another method such as mobile is needed to send the location."],
    ["Give the key characteristics of Bluetooth Low Energy.", "Short range (about 10 m, up to ~100 m in the open), low data rate and very low power — ideal for wearables and sensors connecting to a nearby hub."],
    ["When would mobile (4G/5G) be the right connectivity choice?", "When devices are remote, moving or roadside with no local network — vehicles, rural sensors, cabinets — accepting subscription cost and higher power draw."],
    ["What is NFC used for and what is its range?", "Identification, payment, access control and tap-to-pair, at a range of only a few centimetres; it can also power a passive tag."],
    ["What is the main disadvantage of Wi-Fi for battery-powered sensors?", "Its relatively high power draw drains batteries quickly; it also suffers congestion and limited range through walls."],
    ["What is a mesh network and which two F204 methods use one?", "Devices relay data for each other, extending coverage and routing around failed nodes — used by Zigbee and Z-Wave."],
    ["How does Z-Wave differ from Zigbee?", "Z-Wave uses a sub-GHz frequency giving better wall penetration and no Wi-Fi interference with strong certified interoperability, but supports fewer devices at lower data rates than Zigbee's 2.4 GHz mesh."],
    ["Give two advantages of fibre over copper.", "Far higher bandwidth over much longer distances, and immunity to electromagnetic interference; it is also harder to tap undetected."],
    ["Give two advantages of copper over fibre.", "It is much cheaper and easier to install and terminate, and it can carry power as well as data through Power over Ethernet."],
    ["What must a D3 justification of connectivity include?", "The data size, range, rate and frequency of each link, the power available, and why the alternative methods were rejected."]
  ],
  quiz: [
    {
      q: "A wildlife collar must report an animal's position from open countryside. Which combination is correct?",
      opts: ["GPS only", "NFC and Bluetooth", "GPS for position plus mobile or a low-power WAN to transmit", "Wi-Fi only"],
      ans: 2,
      why: "GPS only receives satellite signals to calculate position; a separate transmitting method is always required."
    },
    {
      q: "Two hundred battery-powered sensors are spread through a large office building. Which method best suits them?",
      opts: ["Wi-Fi", "Zigbee", "Fibre", "NFC"],
      ans: 1,
      why: "Zigbee's low-power mesh supports very many battery devices sending small amounts of data across a building."
    },
    {
      q: "Which method has a range of only a few centimetres?",
      opts: ["Bluetooth", "Z-Wave", "NFC", "Zigbee"],
      ans: 2,
      why: "NFC works at touch range, which is why it suits payment, access cards and pairing."
    },
    {
      q: "A factory needs a 400 m backbone link between two buildings past heavy electrical machinery. Which is most suitable?",
      opts: ["Copper Ethernet", "Fibre optic", "Wi-Fi", "Bluetooth"],
      ans: 1,
      why: "Fibre exceeds copper's ~100 m limit and is immune to the electromagnetic interference the machinery produces."
    },
    {
      q: "Which is the strongest reason to connect a fixed CCTV camera using Power over Ethernet?",
      opts: [
        "It is wireless",
        "One copper cable supplies both data and power, giving reliable high bandwidth with no battery",
        "It has unlimited range",
        "It cannot be tapped"
      ],
      ans: 1,
      why: "PoE delivers power and data in a single cable — reliable bandwidth for video with no battery maintenance."
    },
    {
      q: "Why might Z-Wave be preferred over Zigbee in a house with many Wi-Fi devices?",
      opts: [
        "Z-Wave has a higher data rate",
        "Z-Wave uses sub-GHz frequencies, so it avoids 2.4 GHz congestion and penetrates walls better",
        "Z-Wave requires no hub",
        "Z-Wave supports more devices"
      ],
      ans: 1,
      why: "Zigbee shares the crowded 2.4 GHz band with Wi-Fi; Z-Wave's lower frequency avoids that and passes through walls more easily."
    }
  ],
  exam: [
    {
      q: "Describe two wireless connectivity methods suitable for a smart home, giving one reason for each.",
      marks: 4,
      ms: [
        "Wi-Fi — building-scale range with high bandwidth (1), suitable for mains-powered devices such as cameras and displays that send large amounts of data (1).",
        "Zigbee or Z-Wave — low-power mesh networking (1), suitable for many battery-powered sensors and switches because devices relay for each other and batteries last years (1).",
        "(Accept Bluetooth/BLE for wearables or short hops to a hub with justification.)"
      ]
    },
    {
      q: "Explain two advantages of using fibre optic cable rather than copper for a long site backbone.",
      marks: 4,
      ms: [
        "Fibre supports far higher bandwidth over much greater distances (1), whereas copper Ethernet is limited to about 100 m before signal degradation (1).",
        "Fibre is immune to electromagnetic interference from machinery (1), so data integrity is maintained in industrial environments where copper would suffer errors (1).",
        "(Accept improved security — fibre is harder to tap without detection.)"
      ]
    },
    {
      q: "NEA practice (P10/D3). A haulage firm wants to track 60 lorries and monitor the temperature of refrigerated trailers. Describe and justify the connectivity methods you would use.",
      marks: 12,
      ms: [
        "In-trailer sensors to the vehicle gateway: Bluetooth Low Energy or Zigbee — very low power for battery sensors, short range is sufficient inside a trailer, and small payloads suit a low data rate (1–3).",
        "Position: GPS receiver in the cab unit to calculate location, explicitly noting GPS cannot transmit (1–2).",
        "Vehicle gateway to the depot/cloud: mobile 4G (falling back to 3G/roaming) — the only method with coverage while the vehicle is moving anywhere in the country (1–3).",
        "At the depot: Wi-Fi or wired Ethernet for bulk upload of buffered data when the vehicle returns, avoiding cellular data cost for large files (1–2).",
        "Depot backbone: fibre between buildings or to the server room for bandwidth and interference immunity; copper/PoE for fixed cameras and access points (1–2).",
        "Justification uses transmission considerations: small, frequent temperature readings versus large infrequent log uploads; range required for each hop; the power budget of battery sensors versus vehicle-powered gateway (1–3).",
        "Alternatives rejected with reasons — e.g. Wi-Fi is unavailable on the road; NFC's range is far too short; sending every reading over 4G would raise data costs unnecessarily, so readings are buffered and sent in batches (1–3)."
      ]
    }
  ]
};

C["it:F204.3.3"] = {
  notes: [
    "The four **transmission considerations** — **data size**, **transmission range**, **transmission rate** and **frequency of transmission** — are the reasoning tools that turn a list of connectivity methods into a *justified* choice. They are named directly in criterion **D3**. The spec is explicit that you do **not** need to calculate exact figures and rates; you need to reason about them.",
    { callout: { t: "warn", h: "The spec's boundary", body: "*Does not include:* calculating exact figures and rates. So no bandwidth arithmetic is required. What *is* required is comparative reasoning — \"a 4 MB image is thousands of times larger than a 4-byte temperature reading, so it cannot be sent every minute over a low-power link\"." }},

    { page: "The four considerations" },
    { h: "Data size" },
    "How much data each message carries. The range is enormous: a temperature reading is a handful of bytes; a GPS fix is tens of bytes; a photograph is megabytes; live video is megabytes per *second*. Data size decides whether a low-bandwidth technology is viable at all, and it drives storage and cloud costs downstream.",
    { callout: { t: "info", h: "Typical relative sizes", body: [
      { kv: [
        ["Sensor reading (temperature, humidity, state)", "A few bytes — trivially small; thousands fit in one message."],
        ["GPS fix with timestamp", "Tens of bytes — still very small."],
        ["Log or event record", "Hundreds of bytes."],
        ["Still image", "Hundreds of kilobytes to a few megabytes."],
        ["Audio clip", "Kilobytes per second."],
        ["Video stream", "Megabytes per second, continuously — by far the most demanding."]
      ] }
    ] } },
    { h: "Transmission range" },
    "The distance the data must travel on each hop, and what is in the way. Walls, floors, metal cabinets, machinery, trees and weather all cut effective range far below the manufacturer's open-field figure. Range is why designs are usually **multi-hop**: a very short low-power link from device to a nearby gateway, then a long-range link from the gateway onward. That pattern lets each hop use the cheapest, lowest-power technology that can do its job.",
    { h: "Transmission rate" },
    "How fast data can move — the bandwidth of the link — and how quickly it must arrive (**latency**). A link must be fast enough to clear the data being produced; if it is not, a backlog builds and the buffer eventually overflows. High rate and low latency generally cost more power and more money.",
    { h: "Frequency of transmission" },
    "How often messages are sent. This is the consideration students most often forget, yet it is the one that most affects **power** (2.2), **data cost** and **network congestion**. It should be set by *how quickly someone must know*, not by how often the sensor can read.",
    { callout: { t: "tip", h: "Three transmission patterns worth naming", body: [
      { kv: [
        ["Continuous / streaming", "Data sent as it is produced. Needed for video and safety-critical control. Highest power, bandwidth and cost."],
        ["Scheduled / batched", "Readings buffered on the device and sent every hour or day. Far cheaper and lower power; acceptable when the data informs a trend rather than an urgent action."],
        ["Exception / event-driven", "Nothing is sent while readings are normal; a message goes immediately when a threshold is crossed. Gives urgent alerts at near-zero routine cost — often the best of both, and a strong point to make in D3."]
      ] }
    ] } },

    { page: "How they interact" },
    { callout: { t: "info", h: "The trade-offs to quote", body: [
      { kv: [
        ["Size × frequency = load", "Small data sent constantly can outweigh large data sent rarely. Always consider the two together, not separately."],
        ["Range vs power", "Longer range needs more transmit energy per message, so a long-range link forces lower transmission frequency on a battery device."],
        ["Range vs rate", "Technologies that reach far usually carry less per second; those with high rates are short-range. You rarely get both cheaply."],
        ["Rate vs latency", "A link can have high throughput but poor latency (a satellite link) — for control decisions latency matters more than raw speed."],
        ["Load vs cost", "Cellular data, cloud ingestion and cloud storage are all charged by volume, so reducing size and frequency reduces running cost permanently."],
        ["Everything vs reliability", "Congested or marginal links drop messages; buffering plus acknowledgement and retry must be designed in, which itself costs power."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Reduce the load at the source — the strongest design point", body: "The best answer to a transmission constraint is usually **to send less**: process on the device or edge (2.3) and transmit a summary or an exception rather than the raw stream. A camera that transmits \"person detected at 14:03\" instead of 24-hour video reduces the load by many orders of magnitude — and improves privacy at the same time. Linking transmission, processing and privacy in one sentence is exactly the synthesis Distinction rewards." }},
    { callout: { t: "miscon", h: "Faster and more often is not better", body: "Students routinely propose transmitting every reading in real time \"so the data is up to date\". Unless someone acts on it within that interval, it is wasted power, wasted bandwidth and wasted money, and on a battery device it can be the difference between a five-year life and a three-month one. Match the frequency to the **decision**, not to the sensor." }},
    { callout: { t: "memorise", h: "Transmission considerations", body: "**Size** (bytes per message) · **Range** (distance and obstacles per hop) · **Rate** (bandwidth and latency) · **Frequency** (how often). Patterns: **continuous · scheduled/batched · exception-driven.** Golden rule: *let the decision set the frequency, and send a summary rather than the stream.*" }}
  ],
  flashcards: [
    ["Name the four transmission considerations in F204.", "Data size, transmission range, transmission rate, and frequency of transmission."],
    ["Why does data size matter when choosing a connectivity method?", "It decides whether a low-bandwidth technology is viable at all — a few-byte reading suits a low-power link, but megabyte images or video need high bandwidth."],
    ["Why is the manufacturer's stated range usually optimistic?", "Walls, floors, metal, machinery, trees and weather all attenuate the signal, so effective range is far below the open-field figure."],
    ["Why are IoE networks usually multi-hop?", "A short low-power link carries data from the device to a nearby gateway, and a long-range link carries it onward — so each hop uses the cheapest, lowest-power technology that can do its job."],
    ["What happens if the transmission rate is too low for the data being produced?", "A backlog builds up, the device's buffer eventually overflows, and readings are lost or delayed."],
    ["Which transmission consideration has the biggest effect on battery life?", "Frequency of transmission — the radio is the largest power draw, so each extra message costs significant energy."],
    ["Describe exception-based transmission.", "Nothing is sent while readings are normal; a message is sent immediately when a threshold is crossed — giving urgent alerts at near-zero routine cost."],
    ["Why must data size and frequency be considered together?", "Small data sent constantly can create a greater load than large data sent rarely — it is the product that determines the demand on the link."],
    ["How does transmission range affect power consumption?", "Reaching further requires more transmit energy per message, so a long-range link forces a lower transmission frequency on a battery-powered device."],
    ["What is the most effective way to overcome a transmission constraint?", "Send less — process at the device or edge and transmit a summary or exception rather than the raw stream, which also improves privacy."],
    ["Why is 'transmit everything in real time' usually a poor design?", "Unless someone acts within that interval, it wastes power, bandwidth and money, and can shorten a battery device's life from years to months."],
    ["What does the F204 spec say you do NOT need for transmission considerations?", "Calculating exact figures and rates — the requirement is comparative reasoning, not arithmetic."]
  ],
  quiz: [
    {
      q: "A battery sensor reports a 4-byte temperature reading. Which transmission pattern best preserves battery life while still allowing urgent response?",
      opts: [
        "Stream continuously",
        "Batch hourly, plus immediate transmission when a threshold is crossed",
        "Transmit every second",
        "Never transmit"
      ],
      ans: 1,
      why: "Batching keeps routine cost near zero, while exception reporting guarantees an urgent alert reaches someone in time."
    },
    {
      q: "Which data type places by far the greatest demand on a transmission link?",
      opts: ["A temperature reading", "A GPS fix", "Continuous video", "A door-open event"],
      ans: 2,
      why: "Video is megabytes per second continuously — orders of magnitude larger than event or sensor data."
    },
    {
      q: "Why is 'a 100 m range' from a datasheet unreliable for planning a factory installation?",
      opts: [
        "Datasheets are always wrong",
        "Machinery, metal and walls attenuate the signal so effective range is much shorter",
        "Range does not affect factories",
        "Factories use only wired links"
      ],
      ans: 1,
      why: "Quoted figures assume open space; obstructions and interference cut real-world range substantially."
    },
    {
      q: "A design sends every raw camera frame to the cloud for analysis. Which improvement addresses transmission, cost and privacy at once?",
      opts: [
        "Increase the frame rate",
        "Analyse at the edge and transmit only detection events",
        "Use a longer cable",
        "Store nothing"
      ],
      ans: 1,
      why: "Edge analysis cuts the data sent by orders of magnitude, reduces bandwidth and cloud cost, and avoids transmitting identifiable images."
    },
    {
      q: "Which pair of considerations most directly determines the load on a network link?",
      opts: [
        "Data size and frequency of transmission",
        "Range and colour",
        "Latency and storage device",
        "Range and battery chemistry"
      ],
      ans: 0,
      why: "Load is the product of how big each message is and how often it is sent."
    },
    {
      q: "For an automated emergency shutdown, which matters more — throughput or latency?",
      opts: ["Throughput", "Latency", "Neither", "Data size"],
      ans: 1,
      why: "The message is tiny, so throughput is irrelevant; what matters is that it arrives within milliseconds."
    }
  ],
  exam: [
    {
      q: "Describe the four transmission considerations that affect the choice of connectivity method.",
      marks: 4,
      ms: [
        "Data size — how much data each message carries, from a few bytes for a reading to megabytes for images or video (1).",
        "Transmission range — the distance each hop must cover and the obstacles in the way, which reduce effective range (1).",
        "Transmission rate — the bandwidth available and the latency, which must be sufficient to clear the data produced (1).",
        "Frequency of transmission — how often data is sent, which drives power consumption, data cost and network congestion (1)."
      ]
    },
    {
      q: "Explain why the frequency of transmission is often the most important consideration for a battery-powered sensor.",
      marks: 4,
      ms: [
        "The radio is the largest single consumer of power on the device (1).",
        "Each transmission requires the radio to wake, connect and await acknowledgement, costing far more energy than taking a reading (1).",
        "Reducing frequency by buffering and batching therefore extends battery life dramatically (1).",
        "Frequency should be set by how quickly someone must act on the data, not by how often the sensor can sample (1)."
      ]
    },
    {
      q: "NEA practice (D3). A nature reserve wants camera traps and water-quality sensors across a 5 km² site with no mains power or broadband. Justify your connectivity choices, taking the transmission considerations into account.",
      marks: 12,
      ms: [
        "Water-quality sensors produce very small readings, so a low-power long-range link (e.g. LPWAN/Zigbee mesh to a gateway) is appropriate — small size and low frequency suit low bandwidth (1–3).",
        "Frequency set by the decision: hourly batched readings with immediate exception transmission if a pollution threshold is breached (1–2).",
        "Camera traps produce images of megabytes — far too large for the low-power link, so images are processed at the device to detect motion/species and only thumbnails or event records are transmitted routinely (1–3).",
        "Range: the 5 km² site and tree cover mean real range is well below datasheet figures, so a multi-hop design with gateways on high ground/mesh relaying is used (1–2).",
        "Backhaul: one solar-powered gateway with a 4G uplink, chosen because there is no broadband and only one device then needs a subscription (1–2).",
        "Rate/latency justified — pollution alerts must arrive within minutes, whereas image review is not time-critical, so full images upload only when a maintenance visit connects locally (1–2).",
        "Alternatives rejected with reasons: Wi-Fi has neither the range nor the power budget; per-camera 4G would multiply cost and power; NFC and Bluetooth are far too short-range (1–3)."
      ]
    }
  ]
};

/* ─────────────────────────────────────────────────────────────
   Topic Area 4 — Human computer interfaces (HCIs)
   ───────────────────────────────────────────────────────────── */

C["it:F204.4.1"] = {
  notes: [
    "The *output* half of the **Things** pillar: the devices through which an IoE solution acts on the world or speaks to a person. The spec names three — **screens**, **speakers** and **actuators** — and asks *what they can output* and *how the selection is based on the needs of a context*. Together with 4.2 and 4.3 this feeds **P8** (HCI principles to meet user needs) and **P9** (annotated wireframes).",
    { callout: { t: "def", h: "Output device", body: "Any *thing* through which the system delivers a result — either to a **person** (screen, speaker, indicator, haptic buzzer) or to the **physical world** (actuator). The first two are the Person-to-Device boundary; the actuator is what makes an IoE system *act* rather than merely report." }},

    { page: "The three output devices" },
    { h: "Screens" },
    { callout: { t: "info", h: "Screens — what and when", body: [
      { kv: [
        ["What they output", "Text, numbers, charts, maps, live video, status colours and icons — anything visual and, crucially, anything that must be *compared* or *examined*."],
        ["Forms", "Phone/tablet app, desktop dashboard, wall-mounted display in a control room or corridor, small embedded LCD/e-ink on the device itself, in-vehicle display, variable-message sign."],
        ["Choose when", "The user needs detail, history, several values at once, or must make a judgement; the environment is quiet or noisy (visual works in both); the information is not urgent enough to demand interruption; a record needs to stay on screen."],
        ["Avoid when", "The user's eyes are busy (driving, operating machinery), they are not looking at the device, the environment is dark/bright/wet, or the user has a visual impairment and no alternative is offered."]
      ] }
    ] } },
    { h: "Speakers" },
    { callout: { t: "info", h: "Speakers — what and when", body: [
      { kv: [
        ["What they output", "Alarms, tones and beeps, spoken messages (text-to-speech), voice-assistant responses, and confirmation sounds."],
        ["Forms", "Sounder/siren, buzzer, smart speaker, phone speaker, public-address system, in-vehicle audio."],
        ["Choose when", "The message is **urgent and must interrupt** — an alarm cannot be ignored the way a screen can; the user's eyes or hands are busy; the user is not looking at a device; the user has a visual impairment; the audience is a whole room or site."],
        ["Avoid when", "The environment is loud (a factory floor), silence is required (a library, a ward at night), the user has a hearing impairment, or the information is detailed — audio is linear and cannot be scanned or compared."]
      ] }
    ] } },
    { h: "Actuators" },
    { callout: { t: "def", h: "Actuator", body: "A device that converts an electrical signal into **physical movement or a physical change** — a motor, servo, solenoid, relay, valve, pump, lock, heater or light. It is the exact opposite of a sensor: a sensor turns a physical quantity into data; an actuator turns data into a physical effect." }},
    { callout: { t: "info", h: "Actuators — what and when", body: [
      { kv: [
        ["What they output", "Movement and physical state change — opening a valve, unlocking a door, starting a pump, closing a barrier, switching a heater, adjusting a blind, stopping a machine."],
        ["Choose when", "The response must happen **without waiting for a person** — safety shutdowns, automatic climate control, irrigation, access control; or where a person could not act fast enough or is not present."],
        ["Design care", "Automatic physical action is the highest-consequence output in the system. It needs fail-safe behaviour (what happens on power or network loss), a manual override, and clear feedback to a person that it happened — usually via a screen or speaker as well."]
      ] }
    ] } },

    { page: "Selecting output for a context" },
    { table: { head: ["Context need", "Best output", "Why"], rows: [
      ["Detail, comparison, history", "Screen", "Only a visual display can hold several values at once and be examined at the user's pace."],
      ["Urgent, must not be missed", "Speaker (plus a visual indicator)", "Sound interrupts and reaches people who are not looking at anything."],
      ["User's eyes and hands are busy", "Speaker or haptic", "Vision is already occupied; audio and vibration reach the user without demanding a glance."],
      ["Loud environment", "Screen, beacon light, haptic", "Audio is unreliable where ambient noise is high — and hearing protection is often worn."],
      ["Silent environment", "Screen or haptic", "A ward at night or a library cannot tolerate audible alerts."],
      ["A physical response is required", "Actuator", "Only an actuator can change the world; a message merely asks a person to."],
      ["Accessibility", "Two or more channels together", "Visual + audible + haptic ensures no user is excluded by a single impairment."]
    ] } },
    { callout: { t: "tip", h: "Redundant output is the mark-winning point", body: "Critical information should almost always use **more than one output device**: a fire alarm sounds *and* flashes *and* shows on the panel. That covers noise, deafness, blindness, distraction and device failure at once. Saying \"the alert is audible, visual and haptic so it reaches every user in every condition\" ties output selection directly to accessibility in 4.3." }},
    { callout: { t: "miscon", h: "An actuator is not an output 'display'", body: "Students sometimes list an actuator as a way of showing information. It does not inform anyone — it *does* something. If a valve closes and nobody is told, the People pillar has been skipped: pair every automatic action with an informing output so a person knows the system acted and why." }},
    { callout: { t: "memorise", h: "Output devices", body: "**Screens** — detail, comparison, history; ignorable; useless when eyes are busy. **Speakers** — urgency and interruption; reach the unlooking and the visually impaired; fail in noise or required silence. **Actuators** — physical action without a person; need fail-safe, override and feedback. Critical alerts: **use more than one.**" }}
  ],
  flashcards: [
    ["Name the three output devices in the F204 spec.", "Screens, speakers and actuators."],
    ["What is an actuator?", "A device that converts an electrical signal into physical movement or change — a motor, valve, relay, lock, pump or heater. It is the opposite of a sensor."],
    ["When is a screen the best output choice?", "When the user needs detail, history or several values at once, or must make a judgement — visual output can be examined and compared at the user's own pace."],
    ["When is a speaker the best output choice?", "When the message is urgent and must interrupt, when the user's eyes are busy or they are not looking at a device, or when the user has a visual impairment."],
    ["Give two situations where audio output is a poor choice.", "A loud factory floor where alarms cannot be heard, and a hospital ward at night or a library where silence is required; also for users with hearing impairment."],
    ["Why is a screen described as 'ignorable'?", "It only communicates if the user happens to be looking at it, so it is unsuitable on its own for urgent alerts."],
    ["Give three examples of actuators in an IoE solution.", "A valve opening irrigation, a solenoid unlocking a door, a relay switching a heater, a motor closing a barrier, or an interlock stopping a machine."],
    ["Why must automatic actuator action be paired with an informing output?", "An actuator changes the world but tells nobody; a screen or speaker must inform a person that the system acted and why, or the People pillar is skipped."],
    ["What three safety features should an automatic actuator design include?", "Defined fail-safe behaviour on power or network loss, a manual override, and clear feedback to a person that the action occurred."],
    ["Why should critical alerts use more than one output device?", "Redundant audible, visual and haptic output covers noise, silence, hearing or sight impairment, distraction and single-device failure."],
    ["Which output device suits a user wearing hearing protection on a factory floor?", "A visual output such as a beacon light or screen, or a haptic buzzer on a wearable."]
  ],
  quiz: [
    {
      q: "A system must stop a machine immediately when a guard is opened. Which output device performs this?",
      opts: ["Screen", "Speaker", "Actuator", "Sensor"],
      ans: 2,
      why: "Only an actuator (an interlock/relay) can produce the physical action of stopping the machine."
    },
    {
      q: "Why is a screen a poor sole output for an urgent gas-leak warning?",
      opts: [
        "Screens cannot show colour",
        "It only works if the user happens to be looking at it",
        "Screens are too expensive",
        "Screens cannot display text"
      ],
      ans: 1,
      why: "Visual output is ignorable; an urgent alert needs a channel that interrupts, such as an audible alarm."
    },
    {
      q: "Which output is most appropriate in a hospital ward at night?",
      opts: [
        "A loud siren",
        "A screen at the nurses' station plus a haptic alert on the nurse's device",
        "A public-address announcement",
        "No output at all"
      ],
      ans: 1,
      why: "Patients must not be disturbed, so silent visual and haptic channels reach staff without waking the ward."
    },
    {
      q: "A control-room operator needs to compare readings from twenty sensors over the last week. Which output suits this best?",
      opts: ["Speaker", "Screen", "Actuator", "Buzzer"],
      ans: 1,
      why: "Only a visual display can present many values and their history together for comparison at the user's pace."
    },
    {
      q: "Which statement about actuators is correct?",
      opts: [
        "They display information to users",
        "They convert data into a physical change, and should have a fail-safe state and manual override",
        "They collect data from the environment",
        "They are a type of screen"
      ],
      ans: 1,
      why: "Actuators act physically; because the consequences are high they need fail-safe behaviour and an override."
    },
    {
      q: "What is the strongest reason for making a critical alert audible, visual and haptic?",
      opts: [
        "It looks more professional",
        "It reaches users regardless of noise, silence, impairment or where they are looking",
        "It uses less power",
        "It reduces the data size"
      ],
      ans: 1,
      why: "Redundant channels ensure no user or environment condition can cause the alert to be missed."
    }
  ],
  exam: [
    {
      q: "Describe the purpose of an actuator in an IoE solution and give two examples.",
      marks: 4,
      ms: [
        "An actuator converts an electrical signal from the system into physical movement or a physical change (1).",
        "It allows the system to act on the world automatically without waiting for a person (1).",
        "Example: a solenoid valve opening irrigation, or a relay switching a heater (1).",
        "Example: a motorised barrier closing, a door lock releasing, or an interlock stopping a machine (1)."
      ]
    },
    {
      q: "Explain why an alert on a noisy factory floor should not rely on a speaker alone.",
      marks: 4,
      ms: [
        "Ambient machinery noise may mask the alarm so workers do not hear it (1).",
        "Hearing protection is commonly worn, further reducing audibility (1).",
        "Workers with a hearing impairment would be excluded entirely (1).",
        "A visual beacon or screen and/or a haptic alert on a wearable should be used alongside it so the warning reaches everyone (1)."
      ]
    },
    {
      q: "NEA practice (P8, output element). A smart greenhouse monitors temperature, humidity and soil moisture. Describe the output devices you would use and justify each choice against the needs of the users.",
      marks: 9,
      ms: [
        "Actuators — vents, heaters, irrigation valves and shade blinds operating automatically so conditions are corrected without waiting for a person to be present (1–2).",
        "Screen — a dashboard app and a wall display in the potting shed showing current values, 7-day trends and which actuators are active, because the grower must compare and judge, not just react (1–2).",
        "Speaker — an audible alarm for critical failures such as heater failure overnight, because it must interrupt and cannot be missed (1–2).",
        "Redundancy — critical alerts also pushed to the grower's phone with vibration, so they are received away from the site (1–2).",
        "Justification against context: the greenhouse is often unattended (so automation is essential), is humid and dirty (so a sealed display or a phone is preferable to an open panel), and may be noisy with fans running (so audible alerts are supported by a beacon) (1–3).",
        "Fail-safe and feedback stated — vents default open and irrigation defaults closed on power loss, with every automatic action logged and shown on the dashboard (1–2)."
      ]
    }
  ]
};

C["it:F204.4.2"] = {
  notes: [
    "The spec separates the **device** (4.1) from the **format** of the information it carries. The three formats are **visual**, **audio** and **movement**, and the requirement is to know the *range* of formats and *how the choice of format is based on the needs of a context*. Format is the more interesting decision of the two: the same screen can present a number, a colour, a chart or an icon, and those are not equivalent.",

    { page: "The three formats" },
    { h: "Visual" },
    { callout: { t: "info", h: "Visual sub-formats and what each is good for", body: [
      { kv: [
        ["Numeric readout", "An exact value — needed where precision matters (4.2 °C, 38 mg/m³). Slow to interpret at a glance."],
        ["Text / message", "Explanation, instruction and context — \"Fridge 3 above 8 °C for 20 minutes; check door seal.\" Unambiguous but must be read."],
        ["Colour / status", "Instant state at a glance — green/amber/red. Fastest possible visual comprehension, but carries no detail and must never be the *only* cue (colour blindness)."],
        ["Icon / symbol", "Language-independent and quickly recognised; must be conventional or labelled or it is a guess."],
        ["Chart / graph", "Trend and comparison over time — the only way to show that something is *getting worse* rather than merely being high."],
        ["Map / floor plan", "Spatial information — where the fault, vehicle or person is. Far faster than a list of coordinates."],
        ["Image / video", "Verification — letting a human confirm what a sensor thinks it detected."]
      ] }
    ] } },
    { h: "Audio" },
    { callout: { t: "info", h: "Audio sub-formats", body: [
      { kv: [
        ["Tone / beep", "Simple confirmation or a single state — a successful scan, a warning. Instantly understood, carries almost no information."],
        ["Alarm pattern", "Urgency encoded in the sound — different patterns for different conditions (evacuate vs fault). Requires users to have been trained on the meanings."],
        ["Spoken message / text-to-speech", "Full detail without any screen — essential for visually impaired users, hands-busy and eyes-busy contexts, and voice assistants."],
        ["Ambient / earcon", "Quiet, non-intrusive background indication of an ongoing state."]
      ] }
    ] } },
    { h: "Movement" },
    { callout: { t: "info", h: "Movement sub-formats", body: [
      { kv: [
        ["Haptic / vibration", "A private, silent alert felt only by the wearer — ideal in noise, in silence, and for deaf-blind users. Vibration patterns can encode different meanings."],
        ["Physical actuation as information", "Movement that itself communicates: a barrier lowering, a flag or gauge needle, a robot pausing, a valve visibly closing."],
        ["Animation and motion on screen", "Movement used visually — a pulsing marker drawing the eye to the one thing that changed, or a progress indicator showing the system is working."]
      ] }
    ] } },
    { table: { head: ["Format", "Reaches the user when…", "Fails when…", "Carries detail?"], rows: [
      ["Visual", "They are looking, in adequate light, and can see.", "Eyes are busy, they are elsewhere, or sight is impaired.", "Yes — the most detail of the three."],
      ["Audio", "They are within earshot, anywhere in the room, eyes busy.", "It is noisy, silence is required, or hearing is impaired.", "Some — spoken audio can, tones cannot."],
      ["Movement", "The device is worn or in contact; the environment is noisy or silent.", "The device is not being worn or is set down.", "Very little — it signals, it does not explain."]
    ] } },

    { page: "Choosing a format for the context" },
    { callout: { t: "info", h: "The questions that decide format", body: [
      { kv: [
        ["Is it urgent?", "Urgent → audio and/or haptic, because they interrupt. Reference → visual, because it can be studied."],
        ["Does the user need precision or a glance?", "Precision → numeric or chart. Glance → colour or icon."],
        ["Is it a state, a trend, or a place?", "State → colour. Trend → chart. Place → map. Choosing the wrong one hides the very thing the user needs."],
        ["What are the user's hands and eyes doing?", "Driving, operating machinery or treating a patient rules out reading anything."],
        ["What is the environment like?", "Noisy → visual/haptic. Silent → visual/haptic. Bright sun or darkness → audio/haptic. Wet or gloved → no touchscreen."],
        ["What are the user's accessibility needs?", "Sight, hearing, colour vision, dexterity, literacy and language all change the answer (4.3)."],
        ["Is it private?", "A haptic buzz or a phone screen keeps a message private; a spoken alert or public display does not."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Pair a glanceable format with a detailed one", body: "The best designs use two formats in layers: **colour or sound to say \"look here now\"**, then **text, a number or a chart to say \"here is exactly what is wrong\"**. A red tile that expands into a labelled trend chart is a stronger design decision than either alone — and it is easy to show on a wireframe for P9." }},
    { callout: { t: "miscon", h: "Colour alone is an accessibility failure", body: "Around one in twelve men has some colour-vision deficiency, so a red-versus-green indicator with no other difference is unreadable to them. Always add a second cue — an icon, a word, a position or a pattern. Examiners specifically look for this in P8 answers." }},
    { callout: { t: "memorise", h: "Information formats", body: "**Visual** (numeric · text · colour · icon · chart · map · image) — most detail, only if looking. **Audio** (tone · alarm pattern · speech · ambient) — interrupts, works eyes-free, fails in noise or required silence. **Movement** (haptic · physical actuation · on-screen motion) — private and silent, signals but does not explain. *Layer a glanceable format over a detailed one.*" }}
  ],
  flashcards: [
    ["Name the three information output formats in F204.", "Visual, audio and movement."],
    ["Give four visual sub-formats and what each is best for.", "Numeric (precision), text (explanation), colour (instant state), icon (language-independent recognition), chart (trend), map (location), image/video (verification)."],
    ["Which format is best for showing that a value is getting worse rather than just being high?", "A visual chart or graph — only a trend display shows change over time."],
    ["Why is spoken audio essential in some contexts?", "It delivers full detail with no screen, so it serves visually impaired users and any context where the user's eyes and hands are busy."],
    ["What is haptic output and when is it ideal?", "Vibration felt by the wearer — ideal where noise would mask audio, where silence is required, for private alerts, and for deaf-blind users."],
    ["Give an example of movement itself carrying information.", "A barrier lowering, a valve visibly closing, a gauge needle moving, or a robot pausing — the physical action tells the observer the system acted."],
    ["Why must colour never be the only indicator of state?", "About one in twelve men has a colour-vision deficiency, so a red/green indicator with no other cue is unreadable; add an icon, word, position or pattern."],
    ["Which formats work when a user's eyes are busy?", "Audio and movement (haptic) — both reach the user without requiring a glance."],
    ["Which format carries the least detail and why does that matter?", "Movement — it signals that something needs attention but cannot explain what, so it must be paired with a detailed format."],
    ["Describe the layered approach to choosing formats.", "Use a glanceable format (colour or sound) to say 'look here now', then a detailed format (text, number or chart) to explain exactly what is wrong."],
    ["Which format should be chosen for spatial information such as where a fault is?", "A visual map or floor plan — far faster to interpret than a list of coordinates or a text description."]
  ],
  quiz: [
    {
      q: "A courier is driving and must be told of a re-route. Which format is most appropriate?",
      opts: ["A detailed on-screen table", "Spoken audio instruction", "A colour-only indicator", "A printed report"],
      ans: 1,
      why: "The driver's eyes and hands are busy, so spoken audio delivers the detail without requiring a glance."
    },
    {
      q: "Which visual format best shows that a machine's vibration has been rising for three days?",
      opts: ["A red status light", "A numeric readout", "A line chart", "An icon"],
      ans: 2,
      why: "Only a chart displays the trend over time; a single value or colour shows the present state alone."
    },
    {
      q: "A dashboard shows faults using red and green dots only. What is the accessibility problem?",
      opts: [
        "Dots are too small to draw",
        "Users with colour-vision deficiency cannot distinguish the states",
        "Red and green are expensive to render",
        "There is no problem"
      ],
      ans: 1,
      why: "Colour must never be the sole cue; an icon, label, shape or position is needed as a second indicator."
    },
    {
      q: "Which format best suits a silent alert for a nurse on a night shift?",
      opts: ["Loud alarm", "Haptic vibration on a worn device", "Public address", "Flashing corridor beacon"],
      ans: 1,
      why: "Vibration alerts the nurse privately without disturbing sleeping patients."
    },
    {
      q: "Which combination best follows the layered approach?",
      opts: [
        "A colour tile alone",
        "A vibration alone",
        "A vibration and colour alert that opens a labelled trend chart with the exact value",
        "A long text log with no highlighting"
      ],
      ans: 2,
      why: "A glanceable cue directs attention, and a detailed format then explains precisely what is wrong."
    },
    {
      q: "Why is audio a poor primary format on a factory floor?",
      opts: [
        "Audio cannot carry detail",
        "Machinery noise and hearing protection mean it may not be heard",
        "Speakers are illegal in factories",
        "Audio uses too much bandwidth"
      ],
      ans: 1,
      why: "High ambient noise and worn hearing protection make audible alerts unreliable there."
    }
  ],
  exam: [
    {
      q: "Describe the three information formats an IoE solution can use to output information.",
      marks: 3,
      ms: [
        "Visual — numbers, text, colour, icons, charts, maps or images shown on a screen or indicator (1).",
        "Audio — tones, alarm patterns or spoken messages delivered through a speaker (1).",
        "Movement — haptic vibration, on-screen motion, or physical actuation that itself communicates a change of state (1)."
      ]
    },
    {
      q: "Explain why an IoE solution for a construction site would use more than one information format.",
      marks: 4,
      ms: [
        "The site is very noisy and workers wear hearing protection, so audio alone may not be heard (1).",
        "Workers' eyes and hands are frequently busy, so a screen alone may not be seen (1).",
        "A haptic alert on a wearable reaches the worker regardless of noise or where they are looking (1).",
        "Combining visual, audio and haptic ensures the message reaches every worker, including those with a sensory impairment (1)."
      ]
    },
    {
      q: "NEA practice (P8, format element). A city air-quality system informs residents, schools and council officers. Explain which information formats you would use for each audience and justify your choices.",
      marks: 9,
      ms: [
        "Residents — a colour-coded map in an app plus a plain-language text summary, because they need a glanceable answer to 'is it safe near me today?' rather than raw figures (1–2).",
        "Residents with respiratory conditions — a push notification with haptic alert when a threshold is crossed, because urgency requires an interrupting format (1–2).",
        "Schools — a simple traffic-light display with icon and word labels in reception, glanceable by staff and not dependent on colour alone (1–2).",
        "Council officers — numeric readouts and time-series charts, because they must judge trends, compare monitoring sites and evidence decisions (1–2).",
        "Accessibility — text alternatives and screen-reader-compatible labels, spoken summaries for visually impaired residents, and no colour-only indicators (1–2).",
        "Justification links format to context: urgency (audio/haptic), precision (numeric), trend (chart), location (map) and glanceability (colour + icon) (1–3)."
      ]
    }
  ]
};

C["it:F204.4.3"] = {
  notes: [
    "The eleven **HCI features** are the checklist behind criterion **P8** (*describe how you will include HCI principles to meet user needs*) and the annotation vocabulary for **P9** (*produce annotated wireframes*). The spec asks how to **simplify the way stakeholders work with the solution**, how to make it **accessible to all users**, how to choose the **most user-friendly colour and layout**, and how features **enhance user-friendliness**.",
    { callout: { t: "def", h: "Human Computer Interface (HCI)", body: "The point at which a person and the system meet — every screen, control, sound, light and physical input through which a user gives instructions and receives results. Good HCI design makes the *system's* complexity invisible: the user thinks about their job, not about the interface." }},

    { page: "The eleven HCI features" },
    { callout: { t: "info", h: "Features 1–6", body: [
      { kv: [
        ["Purpose", "The interface exists for a defined job, and every element on it must serve that job. State who the screen is for and what they must achieve in one sentence; anything that does not support it is clutter. A resident's app answers \"is it safe today?\"; an engineer's console answers \"what is failing and where?\" — the same data, two different interfaces."],
        ["Navigation", "How the user moves between screens and finds things. Should be **shallow, consistent and predictable**: a persistent menu in the same place, a clear indication of where you are, an obvious way back, and important actions reachable in as few steps as possible. Never let a user reach a dead end."],
        ["Accessibility", "The interface must be usable by people with visual, hearing, motor and cognitive differences: sufficient contrast, resizable text, alternative text, screen-reader labels, captions/transcripts for audio, large touch targets, full keyboard operation, no reliance on colour alone, and no time-limited actions the user cannot extend."],
        ["Colour", "Used deliberately and sparingly: a consistent meaning (red = fault everywhere in the system), sufficient **contrast** against the background, never as the only cue, and appropriate to the environment — a high-brightness scheme for outdoor screens, a dark scheme for a night-time control room or a ward."],
        ["Layout", "Where things sit. Group related items, put the most important information where the eye lands first, keep consistent positions across screens, leave white space so the eye can rest, align controls, and size elements for the device and the user's hands (gloves, one-handed use, wall display read from 3 m)."],
        ["Learnability", "How quickly a *new* user becomes competent. Achieved with familiar conventions, clear labels rather than jargon or bare icons, sensible defaults, in-context help, and forgiving design (undo, confirmation before destructive actions). Ask: could an untrained agency worker use this on their first shift?"]
      ] }
    ] } },
    { callout: { t: "info", h: "Features 7–11", body: [
      { kv: [
        ["Memorability", "How easily a returning user remembers how it works after a gap. Achieved through **consistency** — same layout, same icons, same words, same place — so nothing has to be relearned. Critical for interfaces used occasionally, e.g. an alarm panel touched twice a year."],
        ["Messages", "What the system says: prompts, confirmations, warnings and especially **errors**. A good message says what happened, why, and what to do next, in plain language — \"Sensor 4 has not reported for 20 minutes. Check its power, then press Retest.\" Not \"Error 0x5B\". Confirm destructive actions and acknowledge successful ones."],
        ["User perceptions", "How the interface makes users *feel* and whether they trust it. Perceived speed (progress indicators, immediate feedback on every tap), professionalism and consistency of style, honesty about uncertainty, and respecting the user's expectations. A system users distrust gets ignored — and an ignored alert is a failed system."],
        ["Audio", "Sound as part of the interface: confirmation tones, distinct alarm patterns, and spoken output for eyes-free or visually impaired use. Must be adjustable and mutable, must not be the only channel, and must be distinguishable from other alarms in the environment."],
        ["Haptic", "Touch feedback: a vibration confirming a press on a gloved touchscreen, a distinct pattern for a critical alert, or physical detents on a control. Provides private, silent notification and confirms input where the user cannot look at the screen."]
      ] }
    ] } },

    { page: "Meeting user needs" },
    { callout: { t: "tip", h: "How to structure P8 so it actually scores", body: "The assessment guidance says students must consider the needs of **at least one user**. So: (1) name a real user from the scenario and state their needs and constraints — *\"Ellie, a warehouse operative, wears gloves, works in a cold store at −20 °C, and is dyslexic\"*; (2) take the HCI features one at a time; (3) for each, say **what you will do** and **why it meets that user's need** — *\"Layout: touch targets at least 15 mm because she wears thick gloves; Colour: high contrast because the store is dim and her screen is behind a cover; Messages: short plain-language sentences with an icon, because dense text is a barrier.\"* Feature → decision → user need, every time." }},
    { callout: { t: "info", h: "Accessibility checklist for 'accessible to all users'", body: [
      { ul: [
        "**Sight:** strong contrast, resizable text, screen-reader labels and alt text, no colour-only meaning, audio alternative.",
        "**Hearing:** every sound duplicated visually or haptically; captions or transcripts for any spoken content.",
        "**Motor:** large touch targets, generous spacing, full keyboard/switch operation, no fine dragging, no short time-outs.",
        "**Cognitive/literacy:** plain language, short sentences, familiar icons *with* labels, consistent layout, one task per screen, undo.",
        "**Situational:** gloves, bright sun, darkness, noise, one-handed use, poor connectivity — design for the environment, not just the person."
      ] }
    ] } },
    { callout: { t: "tip", h: "P9 — annotating a wireframe", body: "A wireframe is a **labelled sketch of layout and function**, not artwork — boxes, labels and callout lines are perfect. The marks are in the **annotations**, so annotate against the HCI features by name: *\"Status tile top-left (Layout: first place the eye lands). Colour + icon + word (Colour/Accessibility: not colour alone). 15 mm targets (Accessibility: glove use). Same nav bar on every screen (Navigation/Memorability).\"* Produce a set — at least a home/dashboard, a detail view and an alert/confirmation screen — and show every state a user will meet, including the empty and error states." }},
    { callout: { t: "miscon", h: "Learnability and memorability are not the same", body: "**Learnability** = how fast a *brand new* user gets going (clear labels, conventions, defaults, help). **Memorability** = how well a *returning* user remembers after a gap (consistency, unchanging layout, recognisable icons). A system can be easy to learn but hard to remember if the layout keeps changing. Define both distinctly — it is a common exam discriminator." }},
    { callout: { t: "memorise", h: "The eleven HCI features", body: "**Purpose · Navigation · Accessibility · Colour · Layout · Learnability · Memorability · Messages · User perceptions · Audio · Haptic.** Method for every answer: *name the user → name the feature → state the design decision → state the need it meets.*" }}
  ],
  flashcards: [
    ["List the eleven HCI features named in F204.", "Purpose, navigation, accessibility, colour, layout, learnability, memorability, messages, user perceptions, audio and haptic."],
    ["What does the HCI feature 'purpose' require?", "That the interface has a defined job and every element on it serves that job — anything not supporting it is clutter."],
    ["What makes navigation user-friendly?", "Shallow, consistent and predictable movement between screens: a menu always in the same place, a clear indication of where you are, an obvious way back, and key actions within few steps."],
    ["Distinguish learnability from memorability.", "Learnability is how quickly a brand-new user becomes competent; memorability is how well a returning user remembers the interface after a gap — achieved mainly through consistency."],
    ["Give three ways of making an interface accessible to users with a visual impairment.", "Strong contrast and resizable text; screen-reader labels and alternative text; an audio or spoken alternative; and never using colour as the only cue."],
    ["Give three ways of making an interface accessible to users with limited dexterity.", "Large touch targets with generous spacing, full keyboard or switch operation, no fine dragging, and no short time-outs on actions."],
    ["What makes a good error message?", "It states what happened, why, and what to do next, in plain language — e.g. 'Sensor 4 has not reported for 20 minutes. Check its power, then press Retest.'"],
    ["What is meant by 'user perceptions' as an HCI feature?", "How the interface makes users feel and whether they trust it — perceived speed, immediate feedback, consistency and honesty; a distrusted system gets ignored, and an ignored alert is a failed system."],
    ["Give two rules for using colour in an IoE interface.", "Use it consistently so a colour always means the same thing, with sufficient contrast; never rely on colour alone, and suit the scheme to the environment (bright outdoors, dark for night use)."],
    ["What should the layout put where the eye lands first?", "The most important information for that screen's purpose — with related items grouped, consistent positions across screens and enough white space."],
    ["Why include haptic feedback in an IoE interface?", "It confirms input when the user cannot look at the screen or is wearing gloves, and gives a private, silent alert in noisy or quiet environments."],
    ["What does the assessment guidance require for P8?", "That the design considers the needs of at least one named user — so each HCI decision should be tied to that user's needs and constraints."],
    ["What earns the marks on an annotated wireframe (P9)?", "The annotations — labelling each layout decision against a named HCI feature and the user need it meets, across a set of screens including alert and error states."]
  ],
  quiz: [
    {
      q: "An alarm panel is used roughly twice a year. Which HCI feature matters most?",
      opts: ["Learnability", "Memorability", "Haptic", "Audio"],
      ans: 1,
      why: "Returning users after a long gap depend on consistency and recognisability — that is memorability."
    },
    {
      q: "Which error message best follows good HCI practice?",
      opts: [
        "Error 0x5B",
        "Something went wrong.",
        "Sensor 4 has not reported for 20 minutes. Check its power, then press Retest.",
        "Fatal exception in module 7"
      ],
      ans: 2,
      why: "It says what happened, why it matters and what the user should do next, in plain language."
    },
    {
      q: "A dashboard shows machine status using only red and green fills. Which HCI feature has been breached?",
      opts: ["Purpose", "Accessibility", "Memorability", "Audio"],
      ans: 1,
      why: "Colour-only meaning excludes users with colour-vision deficiency; a second cue such as an icon or label is required."
    },
    {
      q: "A warehouse worker wears thick gloves in a cold store. Which two design decisions best meet their needs?",
      opts: [
        "Small icons and hover tooltips",
        "Large touch targets with haptic confirmation of each press",
        "A colour-only status ring",
        "A long scrolling text log"
      ],
      ans: 1,
      why: "Gloves demand big targets, and haptic feedback confirms the press when touch sensitivity is reduced."
    },
    {
      q: "Which is the best definition of the HCI feature 'purpose'?",
      opts: [
        "The interface must look attractive",
        "Every element on the interface must serve the defined job of that screen and its user",
        "The system must have a login page",
        "The interface must use as many features as possible"
      ],
      ans: 1,
      why: "Purpose focuses each screen on one defined job, treating anything that does not support it as clutter."
    },
    {
      q: "Why does 'user perceptions' matter in a safety system?",
      opts: [
        "Because appearance affects the price",
        "Because a system users do not trust gets ignored, and an ignored alert is a failed system",
        "Because perceptions determine the data size",
        "It does not matter in safety systems"
      ],
      ans: 1,
      why: "Trust determines whether alerts are acted on; false alarms and inconsistent behaviour erode it."
    }
  ],
  exam: [
    {
      q: "Describe three HCI features that would make a dashboard easier for a new user to operate.",
      marks: 6,
      ms: [
        "Learnability — familiar conventions, clear labels rather than bare icons and sensible defaults (1) so a new user can complete a task without training (1).",
        "Navigation — a consistent menu in the same place with a clear indication of the current screen and an obvious way back (1) so the user cannot get lost or reach a dead end (1).",
        "Messages — plain-language prompts and errors that state what happened and what to do next (1) so mistakes can be corrected without expert help (1).",
        "(Accept purpose, layout, colour, memorability, accessibility with equivalent development.)"
      ]
    },
    {
      q: "Explain how you would ensure an IoE interface is accessible to all users.",
      marks: 6,
      ms: [
        "Visual — sufficient contrast, resizable text, screen-reader labels/alt text and no reliance on colour alone (1–2).",
        "Hearing — every audible alert duplicated visually or haptically, with captions or transcripts for spoken content (1–2).",
        "Motor — large, well-spaced touch targets, full keyboard or switch operation and no short time-outs (1–2).",
        "Cognitive/literacy — plain language, one task per screen, icons with labels, consistent layout and an undo option (1–2).",
        "Situational — designed for the real environment: gloves, bright sun, darkness, noise or one-handed use (1)."
      ]
    },
    {
      q: "NEA practice (P8/P9). A recycling centre's IoE system is used by site operatives (outdoors, gloved, high noise) and by an office manager. Describe how you will include HCI principles to meet their needs, and explain what your wireframes would show.",
      marks: 12,
      ms: [
        "Users identified with their needs and constraints — operatives outdoors in gloves and ear defenders; manager at a desk needing reports (1–2).",
        "Purpose — two distinct interfaces: a rugged one-task operative view and a detailed management dashboard, rather than one screen serving both badly (1–2).",
        "Layout — most important status top-left, large well-spaced targets sized for gloves, consistent positions on every screen (1–2).",
        "Colour and accessibility — high-contrast scheme readable in sunlight, status shown by colour plus icon plus word, adjustable text size (1–2).",
        "Audio and haptic — audible alerts unusable under ear defenders, so haptic vibration on a worn device plus a flashing beacon is used instead (1–2).",
        "Messages — plain-language instructions and errors that say what to do next, with confirmation of destructive actions (1–2).",
        "Learnability and memorability — familiar icons with labels, sensible defaults, and unchanging layout so seasonal or agency staff need no retraining (1–2).",
        "Wireframes described: a set covering dashboard, detail view, alert and error/empty states, annotated against named HCI features and the user need each decision meets (1–3)."
      ]
    }
  ]
};

/* ─────────────────────────────────────────────────────────────
   Topic Area 5 — Securing IoE devices
   ───────────────────────────────────────────────────────────── */

C["it:F204.5.1"] = {
  notes: [
    "Device security carries criteria **P3** (*identify security issues for the devices*, at least two) and **M3** (*explain the mitigations that will be put in place*). Read the spec boundary carefully before you revise: you need **what** each threat and each mitigation *is* and **when it applies** — you do **not** need to explain **how** each one works internally.",
    { callout: { t: "warn", h: "The spec's boundary", body: "*Does not include:* how each threat to devices works, and how each mitigation method for devices works. So you are not asked for the mechanics of a rootkit's kernel hooks or the mathematics of public-key cryptography. You **are** asked to recognise a threat from a scenario and pair it with a sensible mitigation — which is exactly what P3 and M3 assess." }},
    { callout: { t: "info", h: "Why IoE devices are especially vulnerable", body: [
      { ul: [
        "They are **physically accessible** — on a lamp post, in a field, on a wall — so an attacker can touch the hardware.",
        "They are **numerous and long-lived**, often installed for a decade and rarely updated.",
        "They have **small processors** with little room for heavy security software.",
        "They frequently ship with **default credentials** that nobody changes.",
        "They are **trusted by the systems behind them**, so one compromised device becomes a foothold into the whole network."
      ] }
    ] } },

    { page: "Threats to devices" },
    { callout: { t: "info", h: "The six named threats", body: [
      { kv: [
        ["Brute force", "Repeatedly trying credentials until one works. **Applies when:** devices keep default or weak passwords and expose a login (web interface, SSH, cloud account). The single most common way IoE devices are taken over."],
        ["Playback (replay) attack", "Capturing a legitimate transmission and re-sending it later to make the system act again. **Applies when:** a command or authentication message can be reused — e.g. re-sending a captured \"unlock\" signal to a door, or a captured sensor reading to hide a real one."],
        ["Rootkit", "Malicious software that embeds itself deep in the device's firmware or operating system and hides its presence, giving an attacker persistent privileged control. **Applies when:** firmware can be modified or unsigned updates accepted; it survives reboots and is very hard to detect."],
        ["Side channel", "Deducing secret information from **physical characteristics** of the device rather than by breaking its software — timing, power consumption, electromagnetic emissions, sound or heat. **Applies when:** an attacker has physical access or proximity to a device holding keys."],
        ["Spoofing", "Pretending to be something trusted — a fake device claiming to be a legitimate sensor, a fake gateway, a forged identity or address — so the system accepts data or commands from the attacker. **Applies when:** devices are not strongly authenticated before being trusted."],
        ["Zero day", "An attack exploiting a vulnerability the vendor does not yet know about, so no patch exists. **Applies when:** any device or software is running — by definition it cannot be prevented by patching, only limited by defence in depth, monitoring and rapid response."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Spoofing vs playback — the discriminator", body: "**Spoofing** = pretending to *be* something you are not (identity). **Playback** = re-sending a genuine message that really was sent by the legitimate device (message reuse). A fake sensor injecting invented readings is spoofing; recording last night's real \"door unlocked\" message and replaying it at 3 a.m. is a playback attack." }},

    { page: "Mitigation methods for devices" },
    { callout: { t: "info", h: "The seven named mitigations", body: [
      { kv: [
        ["Deep packet inspection (DPI)", "Examining the *contents* of traffic, not just its source and destination, so malicious or abnormal payloads can be identified and blocked. **Use when:** a gateway can inspect device traffic and you want to catch attacks hidden in apparently legitimate connections."],
        ["Firewall", "Controls which traffic may pass in or out, by source, destination, port and protocol. **Use when:** always — it is the baseline boundary control. On IoE, restrict devices to talking *only* to their gateway/platform and nothing else."],
        ["Intrusion Detection System (IDS)", "Monitors traffic and behaviour for signs of attack and **alerts** administrators. **Use when:** you need visibility and evidence; it detects but does not stop."],
        ["Intrusion Protection System (IPS)", "As an IDS, but it **automatically blocks** the detected activity. **Use when:** the response must be immediate; the cost is that a false positive can block legitimate traffic."],
        ["Public key / private key", "Asymmetric key pairs used to authenticate devices and encrypt data — a device proves its identity with a private key nobody else holds. **Use when:** you must be sure a message really came from your device (directly counters spoofing) and must not be readable in transit."],
        ["Root of trust", "A secure, tamper-resistant hardware component holding keys and verifying that firmware is genuine and unmodified before the device boots (secure boot). **Use when:** you need to be confident a device has not had its firmware replaced — the primary defence against rootkits."],
        ["Physical tampering protection", "Sealed and locked enclosures, tamper-evident seals, tamper switches that wipe keys or raise an alarm when a case is opened, potting/epoxy over components, and siting devices out of reach. **Use when:** devices are in public or unattended locations — which for IoE is most of the time."]
      ] }
    ] } },
    { table: { head: ["Threat", "Primary mitigations", "Reasoning to quote"], rows: [
      ["Brute force", "Firewall, IPS, strong unique credentials, lockout/rate limiting", "Restrict who can reach the login at all, and stop repeated attempts automatically."],
      ["Playback attack", "Public/private key with timestamps or nonces, DPI, IDS", "Signed, time-limited messages mean a re-sent copy is rejected as stale."],
      ["Rootkit", "Root of trust / secure boot, signed firmware updates, IDS", "Verify firmware integrity before boot so modified code will not run."],
      ["Side channel", "Physical tampering protection, restricted physical access, root of trust", "Deny the proximity the attack depends on and keep keys in tamper-resistant hardware."],
      ["Spoofing", "Public/private key authentication, firewall, DPI", "Only devices that can prove identity cryptographically are trusted."],
      ["Zero day", "Defence in depth — firewall, IDS/IPS, segmentation, rapid patching", "It cannot be pre-patched, so limit exposure, detect early and contain the blast radius."]
    ] } },
    { callout: { t: "tip", h: "How to write P3 and M3", body: "**P3** asks you to *identify* at least two security issues **for the devices in your solution** — so name the threat *and* say what in your design exposes you to it: \"the roadside cabinets are publicly accessible and ship with a default web password, so brute force and physical tampering are real risks\". **M3** then *explains the mitigation*: what you will do, and why it addresses that specific issue. Threat → why it applies here → mitigation → why it works. Two or three pairs done properly beat six listed superficially." }},
    { callout: { t: "miscon", h: "IDS ≠ IPS", body: "An **IDS detects and alerts**; an **IPS detects and blocks**. Getting this the wrong way round is a guaranteed lost mark. The trade-off is worth a sentence: an IPS responds instantly but a false positive can cut off a legitimate device; an IDS never breaks anything but needs someone to read the alerts." }},
    { callout: { t: "memorise", h: "Device security", body: "**Threats:** Brute force · Playback · Rootkit · Side channel · Spoofing · Zero day. **Mitigations:** DPI · Firewall · IDS (detect) · IPS (block) · Public/private key · Root of trust · Physical tampering protection. Pair them: *brute force → firewall/IPS; playback → keys + timestamps; rootkit → root of trust; side channel → physical protection; spoofing → key authentication; zero day → defence in depth.*" }}
  ],
  flashcards: [
    ["List the six threats to IoE devices named in the spec.", "Brute force, playback (replay) attack, rootkit, side channel, spoofing, and zero day."],
    ["List the seven device mitigation methods named in the spec.", "Deep packet inspection, firewall, intrusion detection system, intrusion protection system, public key/private key, root of trust, and physical tampering protection."],
    ["What is a brute force attack?", "Repeatedly trying credentials until one works — the most common way IoE devices are compromised, especially where default passwords remain."],
    ["What is a playback (replay) attack?", "Capturing a legitimate transmission and re-sending it later so the system acts on it again — for example replaying a captured 'unlock' command."],
    ["What is a rootkit?", "Malicious software embedded deep in firmware or the operating system that hides itself and gives an attacker persistent privileged control, surviving reboots."],
    ["What is a side-channel attack?", "Deducing secret information from a device's physical characteristics — timing, power consumption, electromagnetic emissions, sound or heat — rather than by breaking its software."],
    ["What is spoofing?", "Pretending to be something trusted — a fake sensor, gateway or identity — so the system accepts the attacker's data or commands."],
    ["What is a zero-day attack?", "An attack exploiting a vulnerability the vendor does not yet know about, so no patch exists; it can only be limited by defence in depth, monitoring and rapid response."],
    ["What is the difference between an IDS and an IPS?", "An IDS detects suspicious activity and alerts administrators; an IPS detects and automatically blocks it — faster, but a false positive can cut off legitimate traffic."],
    ["What is deep packet inspection?", "Examining the contents of network traffic rather than just its source and destination, so malicious payloads hidden in apparently legitimate connections can be identified and blocked."],
    ["What is a root of trust?", "A tamper-resistant hardware component that stores keys and verifies firmware is genuine and unmodified before the device boots — the main defence against rootkits."],
    ["Give three forms of physical tampering protection.", "Sealed or locked enclosures, tamper-evident seals, tamper switches that wipe keys or raise an alarm when opened, potting components in epoxy, and siting devices out of reach."],
    ["Which mitigation most directly counters spoofing and why?", "Public/private key authentication — a genuine device proves its identity with a private key that an impersonator does not hold."],
    ["Why are IoE devices especially vulnerable?", "They are physically accessible, numerous, long-lived and rarely updated, have small processors with little room for security software, often keep default credentials, and are trusted by the systems behind them."],
    ["What does the F204 spec say you do NOT need about device security?", "How each threat works and how each mitigation method works internally — only what they are and when they apply."]
  ],
  quiz: [
    {
      q: "An attacker records the radio signal that unlocks a smart lock and re-transmits it that night. This is…",
      opts: ["Spoofing", "A playback attack", "A rootkit", "A side-channel attack"],
      ans: 1,
      why: "Re-sending a genuine captured message so the system acts again is a playback (replay) attack."
    },
    {
      q: "Which mitigation blocks malicious activity automatically rather than only alerting?",
      opts: ["IDS", "IPS", "Deep packet inspection alone", "Root of trust"],
      ans: 1,
      why: "An intrusion protection system takes action to block; an IDS only detects and alerts."
    },
    {
      q: "Roadside cabinets are installed on public streets. Which mitigation is most essential?",
      opts: ["Physical tampering protection", "Deep packet inspection", "A larger battery", "A brighter screen"],
      ans: 0,
      why: "Publicly accessible hardware needs sealed, locked, tamper-evident enclosures and tamper switches."
    },
    {
      q: "Which threat cannot be prevented by patching, by definition?",
      opts: ["Brute force", "Rootkit", "Zero day", "Spoofing"],
      ans: 2,
      why: "A zero day exploits a vulnerability the vendor does not yet know about, so no patch exists."
    },
    {
      q: "A fake device joins the network claiming to be a legitimate sensor and injects false readings. Which mitigation addresses this most directly?",
      opts: ["A bigger firewall rule set", "Public/private key device authentication", "Physical tampering protection", "A UPS"],
      ans: 1,
      why: "Cryptographic authentication means only devices holding the genuine private key are trusted."
    },
    {
      q: "Measuring a device's power consumption to work out the key it is processing is an example of…",
      opts: ["Brute force", "A side-channel attack", "A playback attack", "Deep packet inspection"],
      ans: 1,
      why: "Side-channel attacks infer secrets from physical characteristics such as power, timing or emissions."
    }
  ],
  exam: [
    {
      q: "Identify three threats to IoE devices and, for each, state one appropriate mitigation.",
      marks: 6,
      ms: [
        "Brute force (1) — mitigated by a firewall restricting access to the login and an IPS with rate limiting/lockout (1).",
        "Rootkit (1) — mitigated by a root of trust performing secure boot so unsigned, modified firmware will not run (1).",
        "Spoofing (1) — mitigated by public/private key authentication so only genuine devices are trusted (1).",
        "(Accept playback → signed, timestamped messages; side channel → physical tampering protection; zero day → defence in depth with IDS/IPS.)"
      ]
    },
    {
      q: "Explain the difference between an intrusion detection system and an intrusion protection system, including one advantage of each.",
      marks: 4,
      ms: [
        "An IDS monitors traffic and behaviour for signs of attack and alerts administrators, but does not stop it (1); advantage — it never blocks legitimate traffic and provides evidence for investigation (1).",
        "An IPS performs the same detection but automatically blocks the activity (1); advantage — the response is immediate with no need to wait for a human, limiting damage (1)."
      ]
    },
    {
      q: "NEA practice (P3/M3). A council installs solar-powered air-quality sensors on lamp posts, connected to a cloud platform. Identify the security issues for these devices and explain the mitigations you would put in place.",
      marks: 12,
      ms: [
        "Physical accessibility — the units are on public streets and can be reached, opened or removed, exposing side-channel attacks and hardware tampering (1–2).",
        "Mitigation: sealed, locked enclosures at height, tamper-evident seals and a tamper switch that alerts the platform and wipes stored keys when opened (1–2).",
        "Default/weak credentials on the management interface make brute force likely (1–2).",
        "Mitigation: unique per-device credentials, a firewall permitting connections only to the platform's address, and an IPS applying rate limiting and lockout (1–2).",
        "Firmware modification/rootkit risk given a long service life and remote update capability (1–2).",
        "Mitigation: a root of trust performing secure boot with cryptographically signed firmware updates so modified code cannot run (1–2).",
        "Spoofing — a fake sensor could inject false readings that distort published air-quality data (1–2).",
        "Mitigation: public/private key device authentication so only devices holding a genuine private key are accepted, with DPI at the gateway for anomalous payloads (1–2).",
        "Zero-day exposure acknowledged, mitigated by defence in depth — network segmentation, monitoring with an IDS, and a defined patch/response process rather than prevention (1–2)."
      ]
    }
  ]
};

C["it:F204.5.2"] = {
  notes: [
    "Where 5.1 protects the **device**, this leaf protects the **data while it is moving** — and it is criterion **D1** (*identify threats to data in transit in the solution and explain mitigation methods*), a Distinction criterion, so it deserves care. The spec names two threats — **Man-In-The-Middle (MITM)** and **interception** — and two mitigations — **encryption** and **cryptography** — plus the requirement to explain **how device protection aids the security of data in transit**.",
    { callout: { t: "warn", h: "The spec's boundary", body: "*Does not include:* how each threat to data in transit works, and how the mitigation works. You do not need block ciphers or key-exchange mathematics. You need to recognise the threat in a scenario, propose a mitigation, and explain the link — including the link back to device security." }},

    { page: "Threats to data in transit" },
    { callout: { t: "info", h: "The two named threats", body: [
      { kv: [
        ["Interception (eavesdropping)", "An attacker **listens** to data as it crosses the link and reads it. The data still arrives normally, so nothing looks wrong — this is a **passive** attack and it may never be detected. **Applies when:** data crosses a wireless link an attacker can receive, a shared or public network, or any unencrypted connection. Consequence: loss of confidentiality — personal data, credentials, business information, and location."],
        ["Man-In-The-Middle (MITM)", "An attacker positions themselves **between** two parties, relaying the conversation while each believes it is talking directly to the other. Because the attacker sits in the path they can not only read but also **alter, delete, delay or inject** messages. **Applies when:** endpoints do not verify each other's identity — a rogue Wi-Fi access point or a fake gateway is the classic route. Consequence: loss of confidentiality *and* integrity — false readings accepted, real alerts suppressed, commands forged."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Interception vs MITM — the discriminator", body: "**Interception is passive** — the attacker copies the data but the conversation is unchanged. **MITM is active** — the attacker is in the middle and can change what each side receives. MITM is strictly the more serious: interception costs you confidentiality; MITM costs you the ability to trust anything the system tells you." }},
    { callout: { t: "info", h: "Why data in transit is a real risk in IoE specifically", body: [
      { ul: [
        "Most links are **wireless**, and radio can be received by anyone in range without touching anything.",
        "Devices are often in **public or uncontrolled locations**, so an attacker can sit near them undisturbed.",
        "Data frequently crosses the **public internet** on its way to the cloud.",
        "Constrained devices historically used **plain, unencrypted protocols** to save power and processing.",
        "A single intercepted or forged reading can trigger a **physical** action through an actuator."
      ] }
    ] } },

    { page: "Mitigations for data in transit" },
    { callout: { t: "def", h: "Cryptography and encryption", body: "**Cryptography** is the broad discipline of securing information mathematically — it provides **confidentiality** (encryption), **integrity** (hashes and message authentication codes), **authentication** (digital signatures and certificates) and **non-repudiation**. **Encryption** is the specific part that scrambles data with a key so that anyone intercepting it obtains only ciphertext they cannot read." }},
    { callout: { t: "info", h: "How each addresses the threats", body: [
      { kv: [
        ["Encryption vs interception", "The attacker still captures the traffic but obtains unreadable ciphertext, so confidentiality is preserved. This is why encryption *in transit* (TLS/HTTPS, encrypted MQTT, WPA on Wi-Fi) is the baseline control for every IoE link."],
        ["Cryptography vs MITM", "Encryption alone does not stop a MITM — if the attacker negotiated the session, they hold the key. What defeats MITM is the wider cryptographic toolkit: **certificates and mutual authentication** so each end proves who it is, **digital signatures and MACs** so any alteration is detected, and **timestamps/nonces** so a captured message cannot be replayed."],
        ["Defence in depth", "Combine them: authenticate both ends, encrypt the channel, sign each message, and reject stale or out-of-sequence messages. Add network segmentation and a VPN or private APN so device traffic never traverses the open internet in the first place."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "\"We use encryption, so MITM is impossible\"", body: "A classic Distinction-level trap. Encryption protects the *contents*; it does not by itself prove *who you are talking to*. If a device will accept any certificate — or has none — an attacker can terminate the encrypted session, read everything, and open a second encrypted session onward. The defence against MITM is **authentication** (certificates, mutual TLS, pinned keys), with encryption alongside it." }},

    { page: "How device protection aids data in transit" },
    "This is a specific spec requirement and an easy set of marks, because it joins 5.1 and 5.2 together:",
    { callout: { t: "info", h: "The links to make", body: [
      { kv: [
        ["Keys live on the device", "Encryption in transit is only as strong as the private key protecting it. A **root of trust** or secure element keeps that key in tamper-resistant hardware, so a stolen device does not hand the attacker the ability to decrypt or impersonate."],
        ["Physical tampering protection", "Prevents an attacker opening a device to extract keys, attach a probe, or splice into the cable — all of which would compromise the link regardless of how strong the encryption is."],
        ["Secure boot and signed firmware", "A device running a rootkit can be made to send data in the clear, to a different destination, or to accept forged commands. Verified firmware means the device keeps honouring the secure protocol you designed."],
        ["Strong device authentication", "Public/private key identity stops a spoofed device joining as a legitimate endpoint — which is exactly how many MITM positions are established."],
        ["Firewall and network restriction", "Limiting a device to talking only to its gateway or platform removes the attacker's opportunity to insert themselves as an alternative destination."]
      ] }
    ] } },
    { callout: { t: "tip", h: "How to write D1", body: "D1 says *identify threats to data in transit **in the solution*** — so anchor it in **your** links. Walk the data path from 3.2: \"sensor → gateway over Zigbee\", \"gateway → cloud over 4G/internet\". For each hop, name the exposure (who could be in range or in the path), name the threat (interception or MITM), then explain the mitigation and *why it works for that hop* — and finish by explaining how your device protections from P3/M3 underpin it. A small table with a row per hop is an efficient way to show completeness." }},
    { callout: { t: "memorise", h: "Data in transit", body: "**Threats:** *Interception* — passive listening, loses confidentiality, may be undetected. *MITM* — active relay, can read **and alter**, loses integrity too. **Mitigations:** *Encryption* (unreadable ciphertext — beats interception) · *Cryptography* more broadly (certificates + mutual authentication + signatures + timestamps — beats MITM and replay). **Device protection helps** because keys, firmware integrity and identity all live on the device." }}
  ],
  flashcards: [
    ["Name the two threats to data in transit in the F204 spec.", "Man-In-The-Middle (MITM) and interception."],
    ["What is interception and why is it hard to detect?", "An attacker passively listens to data crossing the link and reads it; the data still arrives normally so nothing appears wrong."],
    ["What is a Man-In-The-Middle attack?", "An attacker positions themselves between two parties, relaying the conversation while each believes it is talking directly to the other — able to read, alter, delete, delay or inject messages."],
    ["What is the key difference between interception and MITM?", "Interception is passive and costs confidentiality; MITM is active and also costs integrity, because the attacker can change what each side receives."],
    ["Define cryptography and encryption.", "Cryptography is the discipline of securing information mathematically — confidentiality, integrity, authentication and non-repudiation. Encryption is the part that scrambles data with a key so interceptors obtain unreadable ciphertext."],
    ["Why does encryption alone not stop a MITM attack?", "Encryption protects contents, not identity — if the attacker negotiated the session they hold the key, so authentication with certificates or mutual TLS is required as well."],
    ["Which cryptographic tools defeat a MITM attack?", "Certificates and mutual authentication so each end proves its identity, digital signatures or MACs so alteration is detected, and timestamps/nonces so captured messages cannot be replayed."],
    ["Why is data in transit especially at risk in IoE systems?", "Most links are wireless and can be received by anyone in range, devices sit in public places, data crosses the public internet, and constrained devices historically used unencrypted protocols."],
    ["How does a root of trust help protect data in transit?", "It keeps the device's private key in tamper-resistant hardware, so a stolen device does not give an attacker the ability to decrypt traffic or impersonate the device."],
    ["How does secure boot help protect data in transit?", "A device running modified firmware could be made to send data unencrypted, to a different destination, or to accept forged commands; verified firmware keeps the secure protocol intact."],
    ["How does restricting a device with a firewall help protect data in transit?", "Limiting it to talking only to its gateway or platform removes the attacker's chance to insert themselves as an alternative destination."],
    ["What should a D1 answer be anchored in?", "The actual links in your own solution — each hop of the data path, its exposure, the threat that applies, and the mitigation with the reason it works for that hop."]
  ],
  quiz: [
    {
      q: "An attacker sets up a rogue Wi-Fi access point that relays traffic between a sensor gateway and the cloud, altering readings on the way. This is…",
      opts: ["Interception", "A Man-In-The-Middle attack", "A side-channel attack", "Brute force"],
      ans: 1,
      why: "Sitting in the path and altering messages while both ends believe they are talking directly is a MITM attack."
    },
    {
      q: "Which statement about interception is correct?",
      opts: [
        "It always alters the data",
        "It is passive, so the data arrives normally and the attack may never be detected",
        "It requires physical access to the device",
        "It is prevented by a larger battery"
      ],
      ans: 1,
      why: "Interception is passive eavesdropping; the conversation is unchanged, which is why it can go unnoticed."
    },
    {
      q: "Why is 'we encrypt the data, so a MITM attack cannot happen' wrong?",
      opts: [
        "Encryption is never used in IoE",
        "Encryption protects contents but not identity — without authentication an attacker can terminate and re-establish the encrypted session",
        "MITM attacks only affect wired links",
        "Encryption makes MITM more likely"
      ],
      ans: 1,
      why: "Defeating MITM requires authentication (certificates, mutual TLS, pinned keys) alongside encryption."
    },
    {
      q: "Which mitigation most directly prevents a captured message being re-sent later?",
      opts: [
        "A bigger firewall",
        "Timestamps or nonces with signed messages",
        "Physical tampering protection",
        "Deep packet inspection alone"
      ],
      ans: 1,
      why: "Time-limited, signed messages mean a replayed copy is rejected as stale or already used."
    },
    {
      q: "How does device tampering protection help secure data in transit?",
      opts: [
        "It encrypts the network",
        "It stops an attacker extracting the private keys or splicing into the link, which would compromise the channel regardless of encryption strength",
        "It increases bandwidth",
        "It has no effect on transit security"
      ],
      ans: 1,
      why: "Keys and the physical link live on the device; protecting the hardware protects the channel that depends on them."
    },
    {
      q: "Which loss results specifically from a MITM attack but not from passive interception?",
      opts: ["Loss of confidentiality", "Loss of integrity", "Loss of battery life", "Loss of bandwidth"],
      ans: 1,
      why: "Only an active in-path attacker can alter or inject messages, destroying the integrity of the data."
    }
  ],
  exam: [
    {
      q: "Describe the difference between interception and a Man-In-The-Middle attack.",
      marks: 4,
      ms: [
        "Interception is a passive attack in which the attacker listens to and reads data crossing the link (1); the data still arrives normally so the attack may go undetected, and confidentiality is lost (1).",
        "A MITM attack places the attacker between the two parties, relaying the conversation while each believes it is talking directly to the other (1); because they are in the path they can also alter, delete, delay or inject messages, so integrity is lost as well (1)."
      ]
    },
    {
      q: "Explain how device protection measures help to secure data in transit.",
      marks: 4,
      ms: [
        "Encryption depends on private keys stored on the device, so a root of trust or secure element keeps them in tamper-resistant hardware where they cannot be extracted (1).",
        "Physical tampering protection stops an attacker opening a device to remove keys or splice into the link (1).",
        "Secure boot with signed firmware ensures the device has not been altered to send data unencrypted or to a different destination (1).",
        "Strong device authentication and firewalling prevent a spoofed device or rogue destination establishing a Man-In-The-Middle position (1)."
      ]
    },
    {
      q: "NEA practice (D1). A pharmacy chain links refrigerated medicine cabinets in 30 branches to a central cloud platform over Wi-Fi and the internet. Identify the threats to data in transit and explain the mitigation methods you would apply.",
      marks: 12,
      ms: [
        "Data path identified hop by hop — cabinet sensor to branch gateway over Wi-Fi, gateway to cloud over the internet (1–2).",
        "Interception on the branch Wi-Fi — a shared or poorly secured network in a public retail space can be received by anyone in range, exposing temperature records and credentials (1–2).",
        "Mitigation: WPA3 on a segregated network for devices only, plus TLS encryption end to end so captured traffic is unreadable ciphertext (1–2).",
        "MITM via a rogue access point or fake gateway — an attacker could suppress an excursion alert or inject false 'in range' readings, causing spoiled stock to be dispensed (1–2).",
        "Mitigation: mutual authentication with certificates or pinned keys so each end proves its identity, so an attacker cannot insert themselves as a trusted endpoint (1–2).",
        "Mitigation: each message signed and timestamped, so alteration is detected and a replayed 'temperature normal' message is rejected as stale (1–2).",
        "Network-level mitigation: a VPN or private APN and segmentation so device traffic does not traverse the open internet or the branch's general network (1–2).",
        "Link to device protection: keys held in a secure element with tamper switches, secure boot with signed firmware, and firewall rules limiting each cabinet to the platform address only (1–2).",
        "Consequence-aware judgement — medicines are safety-critical and the records are regulatory evidence, so integrity mitigations matter as much as confidentiality ones (1–2)."
      ]
    }
  ]
};

C["it:F204.5.3"] = {
  notes: [
    "Criteria **P4** (*describe the legal and ethical issues that need to be considered*) and **M4** (*explain how they will be addressed*). The assessment guidance is specific: **students must reference the laws listed in Unit F200 in relation to the scenario** — so this leaf is F200's legal content applied to an IoE design. The spec's four headings are **data ownership**, **privacy**, **stalking** and **data access**.",
    { callout: { t: "warn", h: "Reference the law, and reference the scenario", body: "Two failures cost most of the marks here. The first is writing about the four headings with no law named. The second is naming laws generically — \"the DPA protects data\" — without saying what *this* solution must therefore do. Every point should read: **issue → law/principle → what the solution does about it.**" }},

    { page: "The legislation to reference (from F200)" },
    { callout: { t: "info", h: "The five laws plus the regulator", body: [
      { kv: [
        ["UK GDPR & Data Protection Act (DPA) 2018", "The main framework for personal data. Requires a **lawful basis** (usually consent or legitimate interests), and compliance with the principles: lawfulness/fairness/transparency, **purpose limitation**, **data minimisation**, accuracy, **storage limitation**, integrity & confidentiality (security), and accountability. Gives individuals rights — access, rectification, erasure, restriction, portability and objection. **Special category data** (health, biometrics) needs extra protection and a stronger condition."],
        ["Computer Misuse Act (CMA) 1990", "Makes unauthorised access to computer material, unauthorised access with intent to commit further offences, and unauthorised modification/impairment criminal offences. **Relevance to IoE:** attacking or hijacking devices is a criminal act — and your security design (5.1/5.2) is what makes the boundary of 'authorised' clear and enforceable."],
        ["Freedom of Information Act (FOIA) 2000", "Gives the public a right to request recorded information held by **public authorities**. **Relevance:** if your client is a council, school, NHS trust or police force, the data your solution collects may be disclosable, so it must be recorded, retained and retrievable accordingly — and personal data within it redacted."],
        ["Privacy and Electronic Communications Regulations (PECR)", "Sits alongside UK GDPR and covers electronic marketing, cookies and similar technologies, and the security/confidentiality of communications services. **Relevance:** any app, dashboard or website in your solution that sets cookies or sends marketing messages must obtain proper consent."],
        ["Information Commissioner's Office (ICO)", "The UK regulator. Registers data controllers, publishes codes of practice, investigates complaints and issues enforcement notices and fines. **Relevance:** name it as the body the client answers to, and cite the requirement to report a qualifying personal-data breach to the ICO **within 72 hours**."]
      ] }
    ] } },

    { page: "The four considerations" },
    { h: "Data ownership" },
    { callout: { t: "info", h: "Data ownership — the issue and the response", body: [
      { kv: [
        ["The issue", "Who owns the data an IoE device generates — the person it is about, the person who bought the device, the organisation operating the service, or the manufacturer whose cloud it lands in? Contracts often quietly assign it to the vendor. It matters because ownership decides who may sell it, share it, analyse it, keep it, or take it elsewhere."],
        ["Related risks", "Vendor lock-in (the client cannot get their own data out if they change supplier); onward sale to third parties; data being kept after the relationship ends; and disagreement over who is liable when data is lost or wrong."],
        ["Purpose", "Establishing ownership up front means the client knows what they may do with the data and the data subject knows who is accountable."],
        ["How to address it", "State ownership explicitly in the proposal and the contract; distinguish the **controller** (decides why and how — usually the client) from the **processor** (acts on instructions — the cloud provider), with a written processor agreement; guarantee export in an open format; and define what happens to the data at the end of the contract."]
      ] }
    ] } },
    { h: "Privacy" },
    { callout: { t: "info", h: "Privacy — the issue and the response", body: [
      { kv: [
        ["The issue", "IoE devices collect data continuously, in homes, workplaces and public space, often about people who never chose to interact with them. Even non-obvious data is revealing: energy use shows when a house is empty, occupancy sensors show who works late, a fitness tracker shows illness."],
        ["Related risks", "Function creep (data collected for safety later used for performance management); inference of special-category facts from mundane data; bystanders captured by cameras and microphones; and consent that is not genuinely free where the subject is an employee or a care recipient."],
        ["Purpose", "To respect individuals' reasonable expectation of privacy and satisfy the UK GDPR principles."],
        ["How to address it", "**Privacy by design**: collect the minimum (data minimisation); prefer anonymised or aggregated data and process at the edge so raw personal data never leaves site; set and enforce a retention period (storage limitation); state the purpose and do not re-use it for another (purpose limitation); obtain informed, freely given consent and make withdrawal easy; provide clear signage and privacy notices; and complete a **Data Protection Impact Assessment** for high-risk processing such as monitoring people or public space."]
      ] }
    ] } },
    { h: "Stalking" },
    { callout: { t: "info", h: "Stalking — the issue and the response", body: [
      { kv: [
        ["The issue", "The spec names this separately because IoE location and monitoring technology is genuinely used to **track and control people**. Trackers, connected cars, family-locator apps, smart-home cameras, door sensors and wearables can all be used by an abusive partner, a controlling family member or an employer to monitor someone's movements — often using accounts the victim does not control."],
        ["Related risks", "The person monitored may not know; the abuser may be the account holder or installer; a shared account may survive a relationship ending; and \"safety\" features can be repurposed for coercive control."],
        ["Purpose", "To ensure a system built to protect people cannot become a tool for harming them."],
        ["How to address it", "Make monitoring **visible to the person monitored** — persistent indicators, notifications when tracking is enabled, and a log they can see; require the subject's own consent, not just the account holder's; give each individual their own account and the ability to see, revoke and remove device access; provide an easy way to check what is connected and to remove a device or user; avoid covert or silent tracking modes entirely; and design account recovery so an abuser cannot simply take back control."]
      ] }
    ] } },
    { h: "Data access" },
    { callout: { t: "info", h: "Data access — the issue and the response", body: [
      { kv: [
        ["The issue", "Two meanings, and a good answer covers both. (1) **Who inside the system may see what** — staff, third parties, the provider. (2) **The data subject's legal right of access** — the right to obtain a copy of their personal data, normally within one month and free of charge, along with rectification, erasure, restriction, portability and objection."],
        ["Related risks", "Over-broad internal access (every member of staff able to read every record); shared logins that destroy accountability; no audit trail; third-party access with no agreement; and no practical way to answer a subject access request."],
        ["Purpose", "Access must be controlled, justified, logged — and, where the law grants a right, provided."],
        ["How to address it", "**Role-based access control** on the principle of least privilege; individual named accounts with strong authentication and MFA for administrators; full audit logging of who viewed or changed what; documented third-party processor agreements; a defined process and owner for subject access, rectification and erasure requests; and — where the client is a public authority — a process for FOIA requests with personal data redacted."]
      ] }
    ] } },

    { page: "Writing P4 and M4" },
    { callout: { t: "tip", h: "A structure that scores", body: "Take each of the four headings in turn, and for each write three things: **(1) the issue as it arises in *this* scenario** (\"the wearables record location inside residents' rooms\"); **(2) the law or principle engaged** (\"health and location data is special-category personal data under UK GDPR, so a stronger lawful basis and a DPIA are required\"); **(3) exactly what the solution does\"** (\"consent captured per resident with a capacity check, data minimised to room-level rather than precise coordinates, 90-day retention, role-based access with an audit log\"). P4 is (1)+(2); M4 is (3)." }},
    { callout: { t: "miscon", h: "Ethical is not the same as legal", body: "Something can be perfectly lawful and still wrong. Monitoring a care resident's every movement may be lawful with consent, but is it proportionate, and can a person with dementia genuinely consent? Employers may lawfully monitor productivity, but should they? A full-mark answer says where the **ethical** duty goes beyond the legal minimum — proportionality, transparency, dignity, fairness of automated decisions, digital exclusion, and the environmental cost of thousands of short-lived devices." }},
    { callout: { t: "memorise", h: "Legal and ethical", body: "**Four headings:** data ownership · privacy · stalking · data access. **Five laws + regulator:** UK GDPR/DPA 2018 · CMA 1990 · FOIA 2000 · PECR · ICO (72-hour breach reporting). **Key principles:** lawful basis · purpose limitation · data minimisation · storage limitation · security · accountability · individual rights. **Method:** issue → law → what the solution does." }}
  ],
  flashcards: [
    ["Name the four legal and ethical considerations in F204.", "Data ownership, privacy, stalking, and data access."],
    ["Which laws must an F204 proposal reference?", "The laws listed in Unit F200 — UK GDPR and the Data Protection Act 2018, the Computer Misuse Act 1990, the Freedom of Information Act 2000, and PECR — plus the role of the ICO."],
    ["Why does data ownership matter in an IoE solution?", "It decides who may sell, share, analyse, retain or move the data, and who is accountable if it is lost or wrong — vendor contracts often quietly assign ownership to the manufacturer."],
    ["How is data ownership addressed in a proposal?", "State ownership explicitly in the contract, distinguish controller from processor with a written processor agreement, guarantee export in an open format, and define what happens to data at the end of the contract."],
    ["What is 'function creep' and why is it a privacy issue?", "Data collected for one purpose is later used for another — e.g. safety monitoring reused for performance management — breaching the purpose-limitation principle."],
    ["List four UK GDPR principles that constrain an IoE design.", "Purpose limitation, data minimisation, storage limitation (retention), and integrity/confidentiality (security); also lawfulness/fairness/transparency, accuracy and accountability."],
    ["What is privacy by design in an IoE context?", "Building privacy in from the start — collecting the minimum data, preferring anonymised or aggregated values, processing at the edge, setting retention limits, clear notices and consent, and completing a DPIA for high-risk processing."],
    ["Why does the spec list stalking as a separate consideration?", "Because IoE location and monitoring technology is genuinely used to track and control people — trackers, connected cars, cameras and wearables can be misused by an abusive partner, family member or employer."],
    ["Give three design features that reduce the risk of an IoE system enabling stalking.", "Make monitoring visible to the person monitored with persistent indicators and logs; require the subject's own consent and give them their own account; allow them to see, revoke and remove device access; and avoid covert tracking modes."],
    ["What are the two meanings of 'data access' in F204?", "Who within the system is permitted to see what data, and the data subject's legal right to obtain a copy of their personal data (plus rectification, erasure, restriction, portability and objection)."],
    ["How should internal data access be controlled?", "Role-based access control on least privilege, individual named accounts with strong authentication and MFA for admins, full audit logging, and documented third-party processor agreements."],
    ["What is the ICO and one duty it enforces?", "The UK's data protection regulator — it registers controllers, issues codes of practice and enforcement notices and fines; qualifying personal data breaches must be reported to it within 72 hours."],
    ["When does the Computer Misuse Act 1990 apply to an IoE solution?", "Unauthorised access to, or modification/impairment of, the devices or data is a criminal offence — so attacking or hijacking an IoE device is a crime, and the security design defines the boundary of authorisation."],
    ["When is the Freedom of Information Act relevant to an IoE proposal?", "When the client is a public authority — the recorded information the solution holds may be requestable by the public, so it must be retrievable and personal data redacted."],
    ["Give an example of something lawful but ethically questionable in an IoE solution.", "Continuously monitoring a care resident's movements with consent obtained from a person who may lack capacity — lawful on paper, but questionable on proportionality and dignity."]
  ],
  quiz: [
    {
      q: "Data collected for safety monitoring is later used to assess staff productivity. Which principle has been breached?",
      opts: ["Data minimisation", "Purpose limitation", "Accuracy", "Storage limitation"],
      ans: 1,
      why: "Using personal data for a new, incompatible purpose breaches purpose limitation — this is function creep."
    },
    {
      q: "A council is the client for an IoE monitoring project. Which additional law is most likely to apply?",
      opts: ["PECR only", "The Freedom of Information Act 2000", "The Computer Misuse Act only", "None — councils are exempt"],
      ans: 1,
      why: "Public authorities must respond to requests for recorded information, so the data must be retrievable with personal data redacted."
    },
    {
      q: "Which design feature most reduces the risk that a family-tracking feature is used for stalking?",
      opts: [
        "A silent tracking mode",
        "Persistent visible indicators, notifications to the person tracked and their own account to revoke access",
        "Storing more location history",
        "Sharing the account password"
      ],
      ans: 1,
      why: "Visibility and individual control prevent covert monitoring and let the subject withdraw consent."
    },
    {
      q: "Within what time must a qualifying personal data breach be reported to the ICO?",
      opts: ["24 hours", "72 hours", "One month", "One year"],
      ans: 1,
      why: "UK GDPR requires notification to the ICO within 72 hours of becoming aware of a qualifying breach."
    },
    {
      q: "Which measure best addresses the 'data access' consideration inside an organisation?",
      opts: [
        "One shared administrator login for convenience",
        "Role-based access control with least privilege, named accounts and audit logging",
        "Giving all staff read access to everything",
        "Disabling all logging to save storage"
      ],
      ans: 1,
      why: "Least-privilege roles, individual accountability and audit trails control and evidence who saw what."
    },
    {
      q: "Which statement best captures the difference between legal and ethical considerations?",
      opts: [
        "They are the same thing",
        "Something can be lawful yet still disproportionate, undignified or unfair — ethics goes beyond the legal minimum",
        "Ethics only applies to public bodies",
        "Legal issues only matter after deployment"
      ],
      ans: 1,
      why: "Legal compliance is a floor; proportionality, transparency, dignity and fairness are ethical duties beyond it."
    }
  ],
  exam: [
    {
      q: "Describe two legal issues that must be considered when developing an IoE solution that monitors people.",
      marks: 4,
      ms: [
        "Privacy/data protection under UK GDPR and the DPA 2018 (1) — a lawful basis is needed, only the minimum data may be collected, and it must be kept only as long as necessary and kept secure (1).",
        "Data access rights (1) — individuals may request a copy of their personal data and its rectification or erasure, so the organisation must have a process to respond within the statutory period (1).",
        "(Accept data ownership/controller–processor duties, CMA 1990 on unauthorised access, FOIA for public authorities, PECR for cookies and marketing.)"
      ]
    },
    {
      q: "Explain why 'stalking' is identified as a consideration for IoE solutions, and describe two design measures that reduce the risk.",
      marks: 5,
      ms: [
        "IoE location and monitoring technology can be used to track and control an individual — by an abusive partner, family member or employer — often through an account the subject does not control (1–2).",
        "Measure: monitoring is made visible to the person monitored, with persistent indicators and notifications when tracking is enabled (1).",
        "Measure: the subject has their own account and can see, revoke and remove device access, with no covert or silent tracking mode available (1).",
        "Measure: consent is obtained from the person monitored, not only the account holder, and account recovery is designed so control cannot simply be seized back (1)."
      ]
    },
    {
      q: "NEA practice (P4/M4). A care home proposes wearables that track residents' location and vital signs. Describe the legal and ethical issues and explain how they will be addressed.",
      marks: 12,
      ms: [
        "Privacy — continuous location and health monitoring inside a person's home is highly intrusive; health data is special-category data under UK GDPR requiring a stronger condition (1–2).",
        "Addressed by: data minimisation to room-level location rather than precise coordinates, edge processing so raw data stays on site, a defined retention period, and a Data Protection Impact Assessment before deployment (1–2).",
        "Consent and capacity — a resident with dementia may not be able to give freely given, informed consent, so capacity assessment and best-interests procedures with family involvement are required (1–2).",
        "Data ownership — ownership stated in the contract, the home as controller and the platform provider as processor under a written agreement, with guaranteed data export and deletion at contract end (1–2).",
        "Data access — role-based access so care staff see only their residents, named accounts with MFA for administrators, full audit logging, and a documented process for subject access, rectification and erasure requests (1–2).",
        "Stalking/misuse — family members' access is limited and visible to the resident, no covert mode exists, and access can be revoked; monitoring is not used for staff surveillance (1–2).",
        "Security duty — encryption in transit and at rest, device protections, and ICO breach notification within 72 hours (1–2).",
        "Ethical judgement beyond the law — proportionality (is continuous tracking necessary or would fall detection alone suffice?), dignity, transparency with residents and families, and avoiding over-reliance on technology in place of staff contact (1–3)."
      ]
    }
  ]
};

/* ─────────────────────────────────────────────────────────────
   Topic Area 6 — Documentation and audience communication
   ───────────────────────────────────────────────────────────── */

C["it:F204.6.1"] = {
  notes: [
    "Criterion **P11** — *present your solution to the client*. The assessment guidance is precise: students **must use one of the methods of presentation listed in Topic Area 6**, and the evidence can be the written presentation or a **video recording**. The spec's four elements are **presentation**, **website/multimedia**, **video** and **delivery of the pitch**.",
    { callout: { t: "tip", h: "This criterion is about the client, not the technology", body: "You are pitching to a **client**, who is typically not technical, is paying, and cares about outcomes: what problem does this solve, what will it cost me, what do I get, what are the risks? A brilliant technical design presented as a wall of jargon fails P11. Translate every technical decision into a client benefit." }},

    { page: "The four presentation methods" },
    { callout: { t: "info", h: "Choosing a format", body: [
      { kv: [
        ["Presentation (slides)", "The default for a live pitch. **Strengths:** structures the argument, supports live questions, easy to tailor as you speak. **Weaknesses:** dies if overloaded with text; useless without the presenter. **Good practice:** one idea per slide, large readable type, images and diagrams rather than paragraphs, consistent design, a visible structure, and no reading aloud from the slide."],
        ["Website / multimedia", "An interactive artefact the client can explore in their own time. **Strengths:** navigable, holds much more detail, can embed a clickable wireframe prototype, and stays available after the meeting. **Weaknesses:** the client may not read it; needs navigation design of its own; no presenter to steer the narrative."],
        ["Video", "A recorded pitch or demonstration. **Strengths:** consistent every time, can be watched by stakeholders who missed the meeting, ideal for *showing* an interface or a device working; explicitly accepted as evidence for P11. **Weaknesses:** no live Q&A, harder to edit after feedback, and needs a script and decent audio to be watchable."],
        ["Delivery of the pitch", "Not a format but *how you perform it*: pace, clear audible speech, eye contact, body language, timing, handling questions and knowing the content well enough not to read it. This is what separates a pass from a confident pass."]
      ] }
    ] } },

    { page: "Features of a good pitch" },
    { callout: { t: "info", h: "Structure a client pitch like this", body: [
      { kv: [
        ["1 · Open with their problem", "Show you have listened: restate the client's situation and requirements in their words. This buys attention for everything that follows."],
        ["2 · The proposed solution in one sentence", "Before any detail, say what you are proposing and what it will achieve. Detail without a headline leaves the client guessing."],
        ["3 · How it works", "Walk the data path — what is collected, how it is transmitted, where it is processed and stored, what the user sees. Use a diagram (6.5), not a list of components."],
        ["4 · What the user experiences", "Show the wireframes/prototype. Clients understand screens far more readily than architecture."],
        ["5 · Benefits, tied to stakeholders", "Cost reduction, income generation, environmental protection, safety, compliance — mapped to the people who gain (6.4)."],
        ["6 · Security, legal and ethical assurance", "Briefly, in client language: \"your residents' data stays in the UK, only care staff can see it, and it is deleted after 90 days.\""],
        ["7 · Risks, limitations and the additional idea", "Honesty builds credibility. Include the additional idea (D2) here so feedback can focus on it (M7)."],
        ["8 · Next steps and a request for feedback", "Close by asking specific questions rather than \"any thoughts?\" — this is what makes M7 and D4 possible."]
      ] }
    ] } },
    { callout: { t: "info", h: "Delivery — what actually earns credit", body: [
      { ul: [
        "**Know your audience** — no unexplained acronyms; define IoE, edge, actuator the first time you use them.",
        "**Pace and clarity** — speak slower than feels natural; pause between sections.",
        "**Do not read the slides** — the slide is the visual aid, you are the presentation.",
        "**Signpost** — \"there are three parts to this: what we collect, how it reaches you, and what you see.\"",
        "**Time it** — rehearse; running over is the most common avoidable failure.",
        "**Handle questions properly** — listen fully, answer directly, and say \"I'll confirm that and come back to you\" rather than inventing an answer.",
        "**Prepare for the sceptical question** — cost, privacy, what happens when it breaks, and what happens when the internet goes down."
      ] }
    ] } },
    { callout: { t: "miscon", h: "A pitch is not a written report read aloud", body: "The proposal document (6.3) is comprehensive; the pitch is **selective**. Choose the points that matter to the decision, and leave the detail in the document you hand over. Slides crammed with the whole proposal are the single most common way students lose delivery marks." }},
    { callout: { t: "warn", h: "Evidence requirements", body: "Whatever you choose, the evidence must exist: the slide deck or website itself, **plus** either a written record of the presentation or a video recording of you delivering it. Record it — a video also gives you something concrete to reflect on for P12 and D4, and protects you if the live session goes wrong." }},
    { callout: { t: "memorise", h: "Presenting solutions", body: "**Methods:** presentation · website/multimedia · video · (plus) delivery of the pitch. **Structure:** their problem → your solution in one line → how it works (diagram) → what the user sees (wireframes) → benefits by stakeholder → security/legal assurance → risks + additional idea → next steps and specific feedback questions." }}
  ],
  flashcards: [
    ["Name the four elements of presenting solutions in F204.", "Presentation, website/multimedia, video, and delivery of the pitch."],
    ["What evidence is acceptable for criterion P11?", "The presentation itself plus either a written record of the presentation or a video recording of it being delivered."],
    ["Give two strengths and one weakness of a slide presentation for a client pitch.", "Strengths: it structures the argument and supports live questions, and can be tailored as you speak. Weakness: it fails if overloaded with text and is useless without the presenter."],
    ["When is a website or multimedia the best pitch format?", "When the client needs to explore detail in their own time, when an interactive wireframe prototype should be clickable, and when the material must remain available after the meeting."],
    ["Give one strength and one weakness of a video pitch.", "Strength: it is consistent every time, can be watched by absent stakeholders, and is ideal for showing an interface or device working. Weakness: there is no live question-and-answer."],
    ["What is meant by 'delivery of the pitch'?", "How the pitch is performed — pace, clear audible speech, eye contact, body language, timing, handling questions, and knowing the content well enough not to read it."],
    ["How should a client pitch open?", "By restating the client's problem and requirements in their own words, showing you have listened, before any technical detail."],
    ["Why should a pitch state the solution in one sentence early on?", "Detail without a headline leaves the client guessing what is being proposed; the summary gives every later point somewhere to attach."],
    ["Why show wireframes during a client pitch?", "Clients understand screens far more readily than architecture — seeing what users will experience makes the proposal concrete."],
    ["Why should a pitch include risks and limitations?", "Honesty builds credibility with the client, and raising the additional idea and open questions is what makes useful feedback (M7) and adaptation (D4) possible."],
    ["Why is 'any thoughts?' a poor way to close a pitch?", "It produces vague responses; asking specific questions about named aspects — especially the additional idea — generates feedback you can actually analyse."],
    ["What is the most common avoidable failure in pitch delivery?", "Overrunning the time, usually caused by unrehearsed delivery and slides crammed with the whole written proposal."]
  ],
  quiz: [
    {
      q: "Which is acceptable evidence for P11?",
      opts: [
        "A note saying the presentation happened",
        "The presentation plus a video recording of it being delivered",
        "The client's email address",
        "A list of slide titles"
      ],
      ans: 1,
      why: "The guidance accepts the written presentation or a video recording of the delivery as evidence."
    },
    {
      q: "A client pitch should begin with…",
      opts: [
        "A list of the sensors chosen",
        "A restatement of the client's problem and requirements",
        "The network diagram",
        "The cost of the cloud subscription"
      ],
      ans: 1,
      why: "Opening with the client's own problem shows you listened and earns attention for the solution that follows."
    },
    {
      q: "Which pitch format best suits a client who wants to explore the proposal in their own time?",
      opts: ["A live slide presentation", "A website or multimedia artefact", "A verbal summary", "A single diagram"],
      ans: 1,
      why: "A website is navigable, holds more detail and remains available after the meeting."
    },
    {
      q: "Why is reading directly from slides poor delivery?",
      opts: [
        "It uses too much electricity",
        "The slide is a visual aid — the presenter should add explanation, not duplicate the text",
        "Slides cannot contain text",
        "Clients cannot read"
      ],
      ans: 1,
      why: "Duplicating the slide adds nothing; the presenter's role is to interpret and explain."
    },
    {
      q: "Why should a pitch translate technical decisions into client benefits?",
      opts: [
        "Because technical terms are banned",
        "Because the client is usually non-technical and judges the proposal on outcomes, cost and risk",
        "Because it shortens the pitch",
        "Because diagrams are not allowed"
      ],
      ans: 1,
      why: "The client decides on outcomes and value, so each technical choice must be expressed as what it does for them."
    }
  ],
  exam: [
    {
      q: "Describe three features of an effective pitch to a client for a proposed IoE solution.",
      marks: 6,
      ms: [
        "Opens by restating the client's problem and requirements (1) so the client can see their needs have been understood (1).",
        "Explains how the solution works using diagrams and wireframes rather than technical lists (1) so a non-technical client can follow the data path and see what users will experience (1).",
        "Presents benefits mapped to stakeholders and addresses security, legal and ethical assurance in plain language (1), then closes with risks, the additional idea and specific questions to gather useful feedback (1)."
      ]
    },
    {
      q: "Compare presenting a proposal as a live slide presentation with presenting it as a recorded video.",
      marks: 6,
      ms: [
        "Slides allow live question-and-answer and can be adapted as the presenter reads the room (1–2).",
        "Slides depend on the presenter being present and can fail if overloaded with text (1).",
        "A video is consistent every time and can be watched by stakeholders who could not attend, and is well suited to demonstrating an interface or device working (1–2).",
        "A video offers no live interaction, is harder to amend after feedback, and requires a script and good audio quality to be watchable (1–2)."
      ]
    },
    {
      q: "NEA practice (P11). Outline the content and structure of a pitch presenting an IoE flood-warning solution to a town council, and explain how you would deliver it effectively.",
      marks: 9,
      ms: [
        "Opens with the council's problem — repeated flooding, late warnings, cost of damage — in their own terms (1–2).",
        "States the proposed solution in one sentence with the outcome it delivers (earlier warnings to residents) (1).",
        "Explains how it works using a data flow diagram: river/rainfall sensors → gateway → processing → alerts (1–2).",
        "Shows annotated wireframes of the resident alert and the officer dashboard so the council sees the user experience (1–2).",
        "Presents benefits by stakeholder — residents (safety), council (reduced damage cost and reputational risk), environment — per 6.4 (1–2).",
        "Addresses security, legal and ethical points briefly in plain language, including FOIA and data protection given a public authority client (1–2).",
        "Closes with limitations, the additional idea and specific feedback questions to enable M7/D4 (1–2).",
        "Delivery: rehearsed and timed, jargon defined on first use, signposted sections, no reading from slides, prepared answers on cost, false alarms and what happens if the network fails, and the session recorded as evidence (1–3)."
      ]
    }
  ]
};

C["it:F204.6.2"] = {
  notes: [
    "Feedback is criterion **M7** (*gather feedback on the additional idea*) and, once analysed, **D4** (*analyse feedback to identify improvements that could be made to the additional idea*). The assessment guidance is unusually specific: **teachers must give feedback**, the **feedback must focus on the additional idea**, and D4's suggested improvements **must be based on the feedback received**. The spec's structure is **sources** (stakeholders, developers) and **formats** (written, verbal).",
    { callout: { t: "warn", h: "Read the chain carefully", body: "**P12** = *identify improvements that can be made in the future* — your own ideas. **M7** = *gather feedback* on the additional idea. **D4** = *analyse that feedback* to identify improvements to the additional idea. D4 must be traceable to feedback someone actually gave you; inventing improvements and calling them feedback fails it." }},

    { page: "Sources of feedback" },
    { callout: { t: "info", h: "The two named sources", body: [
      { kv: [
        ["Stakeholders", "The client, end users, managers, and anyone affected by the solution. **They tell you:** whether it solves the real problem, whether it fits how they actually work, what they would not use, what worries them (cost, privacy, disruption), and what they would want instead. **Strength:** they are the authority on the requirement. **Limitation:** they cannot judge technical feasibility, and may ask for things that are impossible or contradictory."],
        ["Developers", "Technical peers — other students on the course, a teacher, an IT professional. **They tell you:** whether the design is feasible, whether components will actually work together, where it will fail under load, what has been missed (security, power, connectivity), and what would be simpler. **Strength:** expert judgement on how it would be built. **Limitation:** they do not own the requirement, so they may optimise something the client does not care about."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Use both, and say why", body: "The two sources answer different questions: stakeholders answer **\"is this the right thing?\"**, developers answer **\"is this thing right?\"**. A design that satisfies only one is either unbuildable or unwanted. Explicitly stating that division in your write-up shows you understand *why* the spec names both." }},

    { page: "Formats and gathering methods" },
    { callout: { t: "info", h: "Written vs verbal", body: [
      { kv: [
        ["Written", "Questionnaires, feedback forms, comment sheets, email, chat, annotated documents. **Strengths:** already recorded so nothing is lost or misremembered; easy to compare across respondents; respondents can be anonymous and therefore more candid; can be answered in their own time. **Limitations:** you cannot ask follow-up questions; response rates are low; short answers may lack the reason behind them."],
        ["Verbal", "Interviews, a Q&A after the pitch, informal discussion, a focus group, a phone call. **Strengths:** rich and detailed; you can probe with \"why?\" until you reach the real reason; tone and hesitation reveal doubts a form would not; usually a higher response rate. **Limitations:** must be recorded accurately or it is lost; the interviewer can lead the answer; people are less candid face to face; slower and harder to compare."]
      ] }
    ] } },
    { callout: { t: "info", h: "How to record verbal feedback (the bit students skip)", body: [
      { ul: [
        "Take **contemporaneous notes** in a prepared table — one row per point, with who said it and about which feature.",
        "Better still, **record the session** (with permission) and transcribe the key points afterwards.",
        "**Read the points back** at the end of the conversation to confirm you captured them correctly.",
        "Note the **strength of feeling**, not just the content — \"strongly opposed\" is different from \"mildly unsure\".",
        "Keep the raw evidence — notes, forms, recordings — as it is the proof your D4 improvements came from real feedback."
      ] }
    ] } },
    { callout: { t: "tip", h: "Ask better questions", body: "Feedback quality is set by the question. Avoid closed and leading questions (\"You like the dashboard, don't you?\"). Ask **specific, open** questions about the additional idea: *\"What would stop you using this feature every day?\"*, *\"Which part of this would you drop if the budget was cut?\"*, *\"What would need to be true for you to trust the automatic shutdown?\"* Ask about the **feature**, not about *you*." }},

    { page: "Analysing feedback" },
    { callout: { t: "info", h: "A method for D4", body: [
      { kv: [
        ["1 · Collate", "Bring every point into one table: source, format, date, the feature it concerns, and the point itself."],
        ["2 · Categorise", "Group into themes — usability, cost, privacy, feasibility, missing functionality. Themes reveal what several people independently noticed."],
        ["3 · Weigh", "How many raised it? How strongly? Does it come from the stakeholder who owns the requirement or from a developer judging feasibility? A single expert's feasibility objection can outweigh three vague preferences."],
        ["4 · Resolve conflicts", "Feedback frequently contradicts. State the conflict and justify which side you follow, and why — this is exactly the analysis D4 rewards."],
        ["5 · Convert into improvements", "Each accepted point becomes a specific, actionable change to the additional idea. Vague (\"improve the interface\") is not an improvement; specific (\"add a confirm step before automatic shutdown, because two users said they would disable the feature otherwise\") is."],
        ["6 · Justify rejections", "Say what you will *not* change and why — out of scope, unaffordable, conflicts with a legal requirement, or contradicted by stronger feedback. Rejecting with a reason is analysis; ignoring is not."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "Analysing is not listing", body: "\"Three people said the dashboard was confusing\" is a **summary**. Analysis explains *what that means and what follows*: which part was confusing, why (too many values on one screen), what the pattern across respondents was, which change addresses it, and what you traded off to make that change. D4 says *analyse … to identify improvements* — the improvements must visibly come out of the analysis." }},
    { callout: { t: "memorise", h: "Feedback", body: "**Sources:** stakeholders (*is this the right thing?*) · developers (*is this thing right?*). **Formats:** written (recorded, comparable, anonymous — no follow-up) · verbal (rich, probing, higher response — must be recorded). **Analyse:** collate → categorise → weigh → resolve conflicts → convert to specific improvements → justify rejections. Focus it all on **the additional idea**." }}
  ],
  flashcards: [
    ["Name the two sources of feedback in the F204 spec.", "Stakeholders and developers."],
    ["Name the two formats feedback can be received in.", "Written and verbal."],
    ["What question do stakeholders answer, and what question do developers answer?", "Stakeholders answer 'is this the right thing?' — whether it solves the real problem. Developers answer 'is this thing right?' — whether the design is feasible and technically sound."],
    ["Give two strengths of written feedback.", "It is already recorded so nothing is misremembered, it is easy to compare across respondents, and anonymity can make respondents more candid."],
    ["Give two limitations of written feedback.", "You cannot ask follow-up questions to reach the underlying reason, and response rates are typically low."],
    ["Give two strengths of verbal feedback.", "It is rich and detailed and lets you probe with 'why?' until you find the real reason; tone and hesitation also reveal doubts a form would hide."],
    ["Give two limitations of verbal feedback.", "It must be recorded accurately or it is lost, and the interviewer can unintentionally lead the answer; people are also less candid face to face."],
    ["How should verbal feedback be recorded?", "Contemporaneous notes in a prepared table (who, which feature, the point), ideally with a recording made with permission, and points read back to confirm accuracy."],
    ["What must the feedback for M7 focus on?", "The additional idea for the solution — the assessment guidance is explicit that feedback focuses on the additional idea."],
    ["What must D4 improvements be based on?", "The feedback actually received — improvements must be traceable to real feedback, not invented."],
    ["List the six steps for analysing feedback.", "Collate into one table, categorise into themes, weigh by frequency/strength/source, resolve conflicts with justification, convert accepted points into specific improvements, and justify what you reject."],
    ["Why is 'three people said the dashboard was confusing' not analysis?", "It is a summary — analysis explains which part, why, the pattern across respondents, the specific change that follows, and the trade-off accepted."],
    ["Give an example of a good open feedback question.", "'What would stop you using this feature every day?' or 'Which part would you drop if the budget was cut?' — specific, open, and about the feature rather than about you."],
    ["Why should rejected feedback be documented?", "Explaining why a point is not being acted on — out of scope, unaffordable, or contradicted by stronger feedback — is itself analysis; silently ignoring it is not."]
  ],
  quiz: [
    {
      q: "Which source is best placed to judge whether a proposed feature is technically feasible?",
      opts: ["Stakeholders", "Developers", "The general public", "Nobody"],
      ans: 1,
      why: "Developers judge feasibility and how it would be built; stakeholders judge whether it meets the real requirement."
    },
    {
      q: "What is the main advantage of verbal over written feedback?",
      opts: [
        "It is automatically recorded",
        "You can probe with follow-up questions to reach the reason behind an answer",
        "It is anonymous",
        "It is easier to compare across many respondents"
      ],
      ans: 1,
      why: "Verbal feedback allows probing; written feedback cannot be followed up in the moment."
    },
    {
      q: "Two stakeholders want opposite changes. What should a D4 answer do?",
      opts: [
        "Ignore both",
        "State the conflict and justify which side is followed and why",
        "Implement both regardless",
        "Ask a third person and use their answer without explanation"
      ],
      ans: 1,
      why: "Resolving and justifying conflicting feedback is exactly the analysis the criterion rewards."
    },
    {
      q: "Which improvement statement is specific enough to credit?",
      opts: [
        "Make the interface better",
        "Add a confirm step before automatic shutdown, because two users said they would disable the feature otherwise",
        "Improve the system",
        "Listen to feedback more"
      ],
      ans: 1,
      why: "It names the change, the feature and the feedback that drove it — traceable and actionable."
    },
    {
      q: "Why is 'You like the dashboard, don't you?' a poor feedback question?",
      opts: [
        "It is too long",
        "It is leading and closed, so it produces agreement rather than information",
        "It uses the word dashboard",
        "It should be asked in writing"
      ],
      ans: 1,
      why: "Leading closed questions invite agreement; open specific questions produce usable evidence."
    },
    {
      q: "Feedback for criterion M7 must focus on…",
      opts: ["The whole unit", "The additional idea for the solution", "The teacher's marking", "The presentation software used"],
      ans: 1,
      why: "The assessment guidance states feedback must focus on the additional idea."
    }
  ],
  exam: [
    {
      q: "Describe the two sources of feedback for an IoE solution and explain what each is best able to judge.",
      marks: 4,
      ms: [
        "Stakeholders — the client, users and those affected (1); best placed to judge whether the solution meets the real requirement, fits how they work and addresses their concerns about cost, privacy or disruption (1).",
        "Developers — technical peers, teachers or IT professionals (1); best placed to judge technical feasibility, whether components will work together, and what has been missed such as security, power or connectivity (1)."
      ]
    },
    {
      q: "Compare written and verbal feedback formats, giving one advantage and one disadvantage of each.",
      marks: 4,
      ms: [
        "Written — advantage: already recorded and easy to compare across respondents, and anonymity encourages candour (1); disadvantage: no opportunity to ask follow-up questions and response rates are often low (1).",
        "Verbal — advantage: rich and detailed, and follow-up questions can uncover the reason behind an opinion (1); disadvantage: it must be accurately recorded or lost, and the interviewer may lead the answer (1)."
      ]
    },
    {
      q: "NEA practice (M7/D4). Explain how you would gather and analyse feedback on the additional idea in your IoE solution.",
      marks: 9,
      ms: [
        "Gathering from stakeholders — a structured Q&A after the pitch plus a short written form, using specific open questions about the additional idea (1–2).",
        "Gathering from developers — a technical review with peers or the teacher focused on feasibility, cost and what has been missed (1–2).",
        "Both formats used deliberately: verbal for probing reasons, written for comparable, recorded responses (1–2).",
        "Recording: a prepared table capturing source, format, date, feature and point, with permission-based recording and points read back for accuracy (1–2).",
        "Analysis: collate, categorise into themes (usability, cost, privacy, feasibility), then weigh by how many raised it, how strongly, and whether the source owns the requirement or the feasibility judgement (1–3).",
        "Conflicting feedback is stated explicitly and resolved with justification rather than averaged or ignored (1–2).",
        "Each accepted point converted into a specific, actionable improvement to the additional idea, traceable to the feedback that prompted it; rejected points justified with reasons (1–3)."
      ]
    }
  ]
};

C["it:F204.6.3"] = {
  notes: [
    "This leaf is the **specification for your whole NEA deliverable**: the features of an effective business proposal to a client. Its nine features map almost one-to-one onto the assessment criteria, so treating it as a contents page is the single most efficient revision decision in the unit. Read it as a checklist you must be able to tick before you submit.",
    { callout: { t: "tip", h: "The proposal is a business document, not a technical report", body: "It is written **for the client**: it explains what they get, what it costs them in change and risk, and why each decision was made. Technical detail belongs in it — but always with the reason and the benefit attached. Structure, headings, consistent terminology and a summary at the front all matter, because a client reads selectively." }},

    { page: "The nine features" },
    { callout: { t: "info", h: "Features 1–5", body: [
      { kv: [
        ["User requirements", "What the users actually need the system to do, drawn from the scenario and expressed as specific, checkable statements. **Criterion:** P1 (*summarise the user requirements*) — and the guidance says select the relevant information from the scenario, **not** repeat the whole scenario. Number them so later sections can reference them."],
        ["Stakeholder considerations", "Who is affected, what each stands to gain or lose, and what each needs from the solution — including people who are not users (neighbours, regulators, the environment). **Criterion:** M1, with the benefits themselves in 6.4."],
        ["Purpose", "What the solution exists to achieve, in one clear statement, and how it will be judged successful. Everything else in the proposal should be traceable to it."],
        ["Security issues", "The threats to the devices and to data in transit in *this* solution, and the mitigations. **Criteria:** P3, M3 and D1 — see 5.1 and 5.2. At least two device security issues are required."],
        ["Legal and ethical considerations", "The issues raised by this solution, referenced to the laws listed in F200 and to the scenario, and how they are addressed. **Criteria:** P4 and M4 — see 5.3."]
      ] }
    ] } },
    { callout: { t: "info", h: "Features 6–9", body: [
      { kv: [
        ["Data to be collected", "Every data item, its collection route and device, its frequency, and why that device suits the context. **Criterion:** P5 — see 2.1. This is also where your data-protection minimisation argument becomes concrete."],
        ["Connectivity and data transmission", "The method for every link, with the transmission considerations that justify it. **Criteria:** P10 and D3 — see 3.2 and 3.3."],
        ["Processing required", "What analysis is performed, where (device/edge/fog/cloud), when (real time or batch), and where data is stored. **Criteria:** M5 and P6 — see 2.3 and 2.4, supported by technical documentation."],
        ["Outputs", "What the system produces — for users (screens, audio, haptic) and for the world (actuators) — in what format, plus the HCI design and wireframes. **Criteria:** P8 and P9 — see 4.1–4.3."]
      ] }
    ] } },

    { page: "Turning the features into a document" },
    { callout: { t: "info", h: "A workable contents structure", body: [
      { kv: [
        ["1. Executive summary", "The problem, the proposed solution and the headline benefits, in half a page — written last, read first."],
        ["2. The client's situation and user requirements", "Numbered requirements drawn from the scenario (P1)."],
        ["3. Stakeholders and benefits", "Who benefits and how (M1, 6.4)."],
        ["4. Purpose and scope", "What it will and will not do."],
        ["5. Solution overview", "The four pillars and their interaction, with a diagram (P2/M2)."],
        ["6. Data collection", "Items, devices, routes, frequency, power (P5, P7/M6)."],
        ["7. Connectivity and transmission", "Every link justified against the transmission considerations (P10/D3)."],
        ["8. Processing and storage", "Locations, methods, timing, with a data flow diagram (M5, P6)."],
        ["9. Outputs and HCI", "Output devices, formats, HCI principles and annotated wireframes (P8/P9)."],
        ["10. Security", "Device threats and mitigations, data in transit (P3/M3/D1)."],
        ["11. Legal and ethical", "Issues, laws, and how each is addressed (P4/M4)."],
        ["12. The additional idea", "Its functionality and how it extends the solution (D2)."],
        ["13. Future developments and improvements", "Additional functions and improvements identified (P12/D5, with D4 after feedback)."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Cross-reference relentlessly", body: "The strongest proposals read as one argument rather than thirteen disconnected sections. Number your user requirements **R1, R2, R3…** and then reference them: \"the ultrasonic sensor (R2: warn before the water reaches the road)\", \"90-day retention (R7 and UK GDPR storage limitation)\". Traceability from requirement → design decision → benefit is what separates a document that reads as a genuine proposal from one that reads as a set of homework tasks." }},
    { callout: { t: "warn", h: "P1 — select, do not repeat", body: "The assessment guidance is explicit: students must **select the relevant information from the scenario**, not repeat the whole scenario. Copying the brief back is the most common way to lose P1. Convert it: each requirement should be a short statement of something the system must do or achieve, attributable to a user or the client." }},
    { callout: { t: "miscon", h: "The proposal is not the pitch", body: "The **proposal** (this leaf) is the comprehensive document. The **pitch** (6.1) is a selective presentation of it. Do not write one and hope it does both jobs: the proposal must be complete because it is your evidence, and the pitch must be selective because that is what makes it effective." }},
    { callout: { t: "memorise", h: "The nine proposal features", body: "**User requirements · Stakeholder considerations · Purpose · Security issues · Legal and ethical considerations · Data to be collected · Connectivity and data transmission · Processing required · Outputs.** Use them as your contents page; cross-reference every design decision back to a numbered requirement." }}
  ],
  flashcards: [
    ["List the nine features of an effective IoE solution proposal.", "User requirements, stakeholder considerations, purpose, security issues, legal and ethical considerations, data to be collected, connectivity and data transmission, processing required, and outputs."],
    ["What does the assessment guidance say about P1 (user requirements)?", "Students must select the relevant information from the scenario — not repeat the whole scenario back."],
    ["Why should user requirements be numbered?", "So that every later design decision can be cross-referenced to the requirement it satisfies, making the proposal traceable and coherent."],
    ["Which criteria does the 'security issues' feature of the proposal cover?", "P3 (identify at least two device security issues), M3 (explain the mitigations) and D1 (threats to data in transit and their mitigation)."],
    ["Which criteria does the 'outputs' feature cover?", "P8 (HCI principles to meet user needs) and P9 (annotated wireframes), drawing on output devices and information formats."],
    ["Which criteria does the 'processing required' feature cover?", "M5 (explain how and where data will be processed, with technical documentation) and P6 (devices and locations where data is stored)."],
    ["What should the 'purpose' section of a proposal state?", "What the solution exists to achieve, in one clear statement, and how success will be judged — everything else should trace back to it."],
    ["Why is an executive summary written last but read first?", "The client reads selectively, so the problem, solution and headline benefits must be available in half a page; it can only be written once the detail is settled."],
    ["What is the difference between the proposal and the pitch?", "The proposal is the comprehensive written document and the evidence; the pitch is a selective presentation of the points that matter to the client's decision."],
    ["Give an example of cross-referencing in a proposal.", "'The ultrasonic level sensor (R2: warn before water reaches the road)' or '90-day retention (R7 and the UK GDPR storage-limitation principle)'."],
    ["Which two proposal features cover the people affected by the solution?", "User requirements (what users need it to do) and stakeholder considerations (who is affected and what each gains or loses, including non-users)."]
  ],
  quiz: [
    {
      q: "Which is the correct approach for P1?",
      opts: [
        "Copy the scenario into the proposal",
        "Select the relevant information from the scenario and express it as specific, numbered requirements",
        "List the sensors you will use",
        "Summarise the assessment criteria"
      ],
      ans: 1,
      why: "The guidance requires selection of relevant information, converted into checkable requirement statements."
    },
    {
      q: "Which proposal feature covers where data is analysed and stored?",
      opts: ["Outputs", "Processing required", "User requirements", "Purpose"],
      ans: 1,
      why: "Processing required covers what analysis happens, where (device/edge/fog/cloud), when, and where data is stored."
    },
    {
      q: "Why should the proposal cross-reference design decisions to numbered requirements?",
      opts: [
        "To make it longer",
        "So the document reads as one traceable argument showing each decision meets a stated need",
        "Because numbering is required by law",
        "To avoid using diagrams"
      ],
      ans: 1,
      why: "Traceability from requirement to design to benefit is what distinguishes a genuine proposal from disconnected tasks."
    },
    {
      q: "Which proposal feature includes annotated wireframes?",
      opts: ["Outputs", "Security issues", "Connectivity", "Purpose"],
      ans: 0,
      why: "Outputs covers output devices, information formats, HCI principles and the wireframes for P9."
    },
    {
      q: "How many device security issues must be identified for P3?",
      opts: ["One", "At least two", "Exactly five", "None"],
      ans: 1,
      why: "The assessment guidance requires students to identify at least two security issues."
    }
  ],
  exam: [
    {
      q: "State five features of an effective business proposal for an IoE solution.",
      marks: 5,
      ms: [
        "User requirements (1).",
        "Stakeholder considerations (1).",
        "Purpose (1).",
        "Security issues (1).",
        "Legal and ethical considerations (1).",
        "(Also accept: data to be collected; connectivity and data transmission; processing required; outputs.)"
      ]
    },
    {
      q: "Explain why a proposal should state the purpose of the solution and number its user requirements.",
      marks: 4,
      ms: [
        "The purpose states in one clear statement what the solution exists to achieve and how success will be judged (1), so every design decision can be traced back to it (1).",
        "Numbering user requirements allows each later design decision to be cross-referenced to the requirement it satisfies (1), demonstrating that the solution genuinely meets the client's needs rather than being a list of technology (1)."
      ]
    },
    {
      q: "NEA practice (P1). A veterinary practice wants to monitor kennel temperature, water levels and animal activity overnight when no staff are present. Summarise the user requirements for an IoE solution.",
      marks: 9,
      ms: [
        "Requirements expressed as numbered, specific and checkable statements rather than restating the scenario (1–2).",
        "R: kennel temperature monitored continuously overnight with an alert if it leaves a defined safe range (1–2).",
        "R: water levels monitored per kennel with an alert when a bowl is empty (1–2).",
        "R: animal activity monitored to identify distress or inactivity, without continuous video of the animals if a less intrusive measure suffices (1–2).",
        "R: alerts reach the on-call vet away from the premises within minutes, on a device they will have with them (1–2).",
        "R: overnight records retained and retrievable as evidence of animal welfare for inspection (1).",
        "R: the system must continue to alert if the practice's broadband fails (1).",
        "Requirements attributed to named users — on-call vet, nurse, practice manager — rather than to 'users' generally (1–2)."
      ]
    }
  ]
};

C["it:F204.6.4"] = {
  notes: [
    "Criterion **M1** — *describe the stakeholder considerations for the solution*. The spec splits it neatly: **who could benefit** (organisation, individual, society, the environment) and **what the benefits are** (cost reduction, income generation, environmental protection). The boundary is explicit: **specific cost-reduction figures for a project are not required**, so you argue the *type* and *mechanism* of the benefit, not a spreadsheet.",
    { callout: { t: "warn", h: "The spec's boundary", body: "*Does not include:* specific cost reduction details for a project. So do not invent \"£47,000 saved per year\" — you cannot evidence it and no mark depends on it. Explain **how** the saving arises: fewer wasted journeys, less spoiled stock, fewer breakdowns, lower energy use." }},

    { page: "Who could benefit" },
    { callout: { t: "info", h: "The four beneficiary groups", body: [
      { kv: [
        ["Organisation", "The client itself — the business, council, trust or charity commissioning the solution. Gains: lower operating cost, better decisions from real data, regulatory compliance and evidence, less downtime, reduced risk and insurance exposure, competitive advantage, and a better reputation."],
        ["Individual", "Employees and end users, and the people the service is delivered to. Gains: safety, convenience, time saved, less unpleasant or repetitive work, greater independence (assistive technology), better health outcomes, lower personal bills, and improved job satisfaction. Note that individuals may also **lose** — surveillance, deskilling, job displacement — and a good answer says so."],
        ["Society", "The wider public and the community. Gains: safer streets, cleaner air, better public services for the same tax, faster emergency response, more equitable access to services, and knowledge or open data others can build on."],
        ["Environment", "The natural world. Gains: reduced energy consumption and emissions, less waste and fewer wasted journeys, earlier detection of pollution or flooding, protection of habitats and wildlife. Note the **counter-cost**: manufacturing thousands of devices, powering them, and disposing of them creates e-waste and emissions of its own."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Stakeholders are not all users, and not all winners", body: "Two moves lift M1 above a list. First, include stakeholders who are **affected but do not use the system** — neighbours near a monitored site, regulators, contractors, the manufacturer, and people captured incidentally by sensors. Second, be honest that some stakeholders **bear a cost**: staff who feel monitored, residents who lose privacy, workers whose role is automated. Naming the trade-off and how you mitigate it is a stronger answer than claiming universal benefit." }},

    { page: "What the benefits are" },
    { callout: { t: "info", h: "The three named benefit types", body: [
      { kv: [
        ["Cost reduction", "Money not spent. Mechanisms: **predictive maintenance** (repair before failure costs a full breakdown), **fewer wasted journeys** (only empty bins are collected; engineers attend only real faults), **reduced waste** (less spoiled stock, less over-watering, less energy), **lower labour cost** (automatic readings replace manual rounds), **avoided penalties** (compliance evidenced), and **lower insurance/claims** through better safety."],
        ["Income generation", "Money earned. Mechanisms: **new services** sold on top of the data (a monitoring subscription), **better availability** (less downtime means more output sold), **new customers** attracted by a better or greener service, **data products** where the data is lawfully valuable to others, and **efficiency releasing capacity** that can be sold."],
        ["Environmental protection", "Harm avoided. Mechanisms: **reduced energy use** through demand-based control, **reduced emissions** from fewer vehicle movements, **less waste** of water, chemicals, materials or food, **earlier detection** of pollution, leaks, flooding or illegal activity, and **habitat/wildlife protection** through monitoring."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Benefits chain to the beneficiary", body: "Write the mechanism, not the label. \"Cost reduction\" alone is worth little; **\"vibration monitoring detects bearing wear weeks before failure, so the pump is repaired in planned downtime instead of a three-day unplanned outage — a cost reduction for the organisation and less disruption for residents\"** connects a design decision, a mechanism, a benefit type and a beneficiary in one sentence. That is what M1 rewards." }},
    { table: { head: ["Beneficiary", "Typical benefit", "Example mechanism"], rows: [
      ["Organisation", "Cost reduction, income generation", "Predictive maintenance; a new monitoring subscription sold to customers."],
      ["Individual", "Safety, convenience, independence", "A fall alert reaching a carer in minutes; a resident staying at home longer."],
      ["Society", "Better public services, safety", "Air-quality data driving school-run restrictions; faster emergency response."],
      ["Environment", "Environmental protection", "Demand-based street lighting cutting energy; early pollution detection."]
    ] } },
    { callout: { t: "miscon", h: "Don't confuse a feature with a benefit", body: "\"The system has 200 sensors and a cloud dashboard\" is a **feature**. \"The manager can see every fridge from home, so a failure at 2 a.m. is fixed before £4,000 of stock spoils\" is a **benefit** — it names who gains and what changes for them. M1 asks for stakeholder *considerations*; features without beneficiaries do not answer it." }},
    { callout: { t: "memorise", h: "Stakeholder considerations", body: "**Who benefits:** organisation · individual · society · environment. **What benefits:** cost reduction · income generation · environmental protection. **Rule:** name the mechanism and the beneficiary, not the label — and acknowledge who bears a cost. No invented figures required." }}
  ],
  flashcards: [
    ["Who are the four groups that could benefit from an IoE solution?", "The organisation, the individual, society, and the environment."],
    ["Name the three benefit types in the F204 spec.", "Cost reduction, income generation, and environmental protection."],
    ["Give three mechanisms by which an IoE solution reduces cost.", "Predictive maintenance avoiding full breakdowns, fewer wasted journeys (only servicing what needs it), reduced waste of stock/energy/water, lower labour cost from automatic readings, and avoided compliance penalties."],
    ["Give three mechanisms by which an IoE solution generates income.", "Selling a new monitoring service or subscription, increased output from reduced downtime, attracting new customers with a better or greener service, and lawfully valuable data products."],
    ["Give three mechanisms by which an IoE solution protects the environment.", "Demand-based control reducing energy use, fewer vehicle movements reducing emissions, less waste of water/chemicals/food, and earlier detection of pollution, leaks or flooding."],
    ["What does the F204 spec say you do NOT need for stakeholder benefits?", "Specific cost reduction details or figures for a project — the mechanism and type of benefit are what matter."],
    ["Why should a stakeholder analysis include non-users?", "People affected without using the system — neighbours, regulators, contractors, and those captured incidentally by sensors — still bear consequences that must be considered."],
    ["Give an example of a stakeholder bearing a cost rather than a benefit.", "Staff who feel monitored and lose autonomy, residents who lose privacy, or workers whose role is displaced by automation."],
    ["What is the environmental counter-cost of an IoE deployment?", "Manufacturing, powering and eventually disposing of thousands of devices creates emissions and e-waste that offset some of the environmental gain."],
    ["What is the difference between a feature and a benefit?", "A feature is what the system has ('200 sensors and a dashboard'); a benefit names who gains and what changes for them ('the manager fixes a 2 a.m. failure before stock spoils')."],
    ["Give an example of a benefit statement that links mechanism, benefit type and beneficiary.", "'Vibration monitoring detects bearing wear weeks early, so the pump is repaired in planned downtime instead of a three-day outage — cost reduction for the organisation and less disruption for residents.'"]
  ],
  quiz: [
    {
      q: "Smart bins that are collected only when full deliver which combination of benefits?",
      opts: [
        "Income generation only",
        "Cost reduction for the council and environmental protection through fewer vehicle emissions",
        "Environmental protection only",
        "No benefits"
      ],
      ans: 1,
      why: "Fewer wasted collection journeys cut both operating cost and emissions."
    },
    {
      q: "Which is a benefit rather than a feature?",
      opts: [
        "The system uses Zigbee sensors",
        "The dashboard has twelve charts",
        "Residents receive a flood warning two hours earlier, so they can move belongings upstairs",
        "The data is stored in the cloud"
      ],
      ans: 2,
      why: "It names who gains and what changes for them; the others describe what the system has."
    },
    {
      q: "A firm sells a monitoring subscription built on its IoE data. This is an example of…",
      opts: ["Cost reduction", "Income generation", "Environmental protection", "A security mitigation"],
      ans: 1,
      why: "Creating a new service to sell on top of the data generates income rather than saving cost."
    },
    {
      q: "Which stakeholder group covers cleaner air and faster emergency response for a whole town?",
      opts: ["Organisation", "Individual", "Society", "Environment"],
      ans: 2,
      why: "Benefits to the wider public and community fall under society."
    },
    {
      q: "Why should a stakeholder analysis mention who bears a cost?",
      opts: [
        "To reduce the word count",
        "Because claiming universal benefit is unrealistic; identifying trade-offs and mitigations is stronger analysis",
        "Because the spec bans benefits",
        "To avoid discussing the environment"
      ],
      ans: 1,
      why: "Acknowledging losers — surveillance, lost privacy, displaced roles — and mitigating them shows genuine consideration."
    },
    {
      q: "According to the specification, what is NOT required when describing benefits?",
      opts: [
        "The type of benefit",
        "Who benefits",
        "Specific cost-reduction figures for the project",
        "The mechanism producing the benefit"
      ],
      ans: 2,
      why: "The spec explicitly excludes specific cost reduction details for a project."
    }
  ],
  exam: [
    {
      q: "Identify the four groups who could benefit from an IoE solution and give one benefit for each.",
      marks: 4,
      ms: [
        "Organisation — lower operating cost, better decisions from real data, or evidenced compliance (1).",
        "Individual — improved safety, convenience, independence or health outcomes (1).",
        "Society — safer streets, cleaner air, better public services or faster emergency response (1).",
        "Environment — reduced energy use and emissions, less waste, or earlier detection of pollution or flooding (1)."
      ]
    },
    {
      q: "Explain how an IoE solution in a manufacturing plant could deliver both cost reduction and environmental protection.",
      marks: 4,
      ms: [
        "Cost reduction — machine sensors detect wear early so maintenance is planned rather than a costly unplanned breakdown (1), and production waste falls because settings are corrected as soon as quality drifts (1).",
        "Environmental protection — energy use is reduced by running machines and ventilation only as needed (1), and less scrap material and fewer wasted engineer journeys reduce resource use and emissions (1)."
      ]
    },
    {
      q: "NEA practice (M1). A university proposes an IoE system to monitor lecture-theatre occupancy, heating and air quality. Describe the stakeholder considerations for this solution.",
      marks: 9,
      ms: [
        "Organisation (the university) — cost reduction from heating and lighting only occupied rooms, better timetabling decisions from real occupancy data, and evidence for its net-zero reporting (1–2).",
        "Individuals (students and lecturers) — more comfortable, better-ventilated rooms, fewer cancelled sessions from equipment failure, and rooms that can be found when free (1–2).",
        "Individuals (estates staff) — fewer manual checks and clearer prioritisation of maintenance, though possible concern about performance monitoring (1–2).",
        "Society — a public institution demonstrating lower emissions, plus research/open data that others can learn from (1–2).",
        "Environment — reduced energy consumption and emissions from demand-based heating and ventilation (1–2).",
        "Non-user stakeholders identified — cleaners, contractors, visitors and neighbours — with their concerns considered (1).",
        "Trade-offs acknowledged honestly: occupancy sensing could feel like surveillance of staff and students, mitigated by counting anonymously rather than identifying individuals (1–2).",
        "Environmental counter-cost acknowledged — manufacturing, powering and disposing of hundreds of devices — with mitigation such as long-life devices and a recycling plan (1)."
      ]
    }
  ]
};

C["it:F204.6.5"] = {
  notes: [
    "The technical documentation leaf: **program flowcharts**, **data flow diagrams** and **wireframes**. The spec asks how to create diagrams showing **data flow**, **system processing** and **device interactions**. These diagrams are not decoration — they are explicitly required evidence for **P9** (annotated wireframes), are allowed for **P2** (a flow chart for the four pillars), and are demanded by **M5** (*explain how and where data will be processed **using appropriate technical documentation***).",
    { callout: { t: "tip", h: "Which diagram answers which question", body: "**Flowchart** → *what does the system decide and in what order?* **Data flow diagram** → *what data moves between which parts, and where does it rest?* **Wireframe** → *what will the user see and do?* Choosing the right one for the point you are making is itself a mark-worthy decision — and using all three shows you understand they answer different questions." }},

    { page: "Program flowcharts" },
    { callout: { t: "info", h: "The standard symbols", body: [
      { kv: [
        ["Terminator (rounded rectangle / stadium)", "Start and End of the process."],
        ["Process (rectangle)", "An action or step — \"read sensor\", \"calculate 5-minute average\", \"send alert\"."],
        ["Decision (diamond)", "A question with labelled branches — normally Yes/No or True/False. Every branch must be labelled."],
        ["Input/Output (parallelogram)", "Data entering or leaving — \"read temperature\", \"display value\"."],
        ["Flow line (arrow)", "The order of execution. Arrows must have direction and must not be ambiguous."],
        ["Connector (small circle)", "Joins parts of a diagram split across space or pages."]
      ] }
    ] } },
    { callout: { t: "info", h: "Rules that avoid lost marks", body: [
      { ul: [
        "**One Start, and every path reaches an End** (or loops back deliberately) — no dangling arrows.",
        "**Diamonds have exactly one input and labelled outputs.** An unlabelled branch is an error, not a shortcut.",
        "**One action per process box.** \"Read sensor, average it and alert the manager\" is three boxes.",
        "**Loops go back to a specific box**, not vaguely upward — show clearly what repeats.",
        "**Use the right symbol.** Putting a decision in a rectangle is the most common symbol mistake.",
        "**Keep the level consistent.** Do not mix a whole subsystem in one box with single instructions in the next."
      ] }
    ] } },
    { callout: { t: "info", h: "A typical IoE flowchart (describe it in words if you cannot draw it)", body: [
      { ol: [
        "Start.",
        "Read sensor value (input).",
        "Is the value valid? — No → log error, return to read. Yes → continue.",
        "Store the reading in the local buffer (process).",
        "Is the value beyond the alert threshold? — Yes → transmit alert immediately (output), then continue. No → continue.",
        "Is it time for the scheduled batch transmission? — Yes → transmit buffered readings and clear the buffer. No → continue.",
        "Sleep for the sampling interval, then loop back to read the sensor."
      ] }
    ] } },

    { page: "Data flow diagrams" },
    { callout: { t: "def", h: "Data flow diagram (DFD)", body: "A diagram showing **how data moves through a system**: where it comes from, what transforms it, where it is stored, and where it goes. It shows *flows*, not the order of decisions — a DFD has no loops or conditions." }},
    { callout: { t: "info", h: "The four DFD elements", body: [
      { kv: [
        ["External entity (square/box)", "A source or destination **outside** the system — a user, a client organisation, an external service, or in an IoE context often the sensor/device itself and the person receiving alerts."],
        ["Process (circle or rounded box)", "Something that **transforms** data — \"validate reading\", \"calculate average\", \"compare to threshold\", \"generate alert\". Named with a verb."],
        ["Data store (open-ended rectangle or two parallel lines)", "Where data **rests** — the device buffer, the edge database, the cloud archive."],
        ["Data flow (labelled arrow)", "The data itself moving between the above, **labelled with what the data is** — \"raw temperature\", \"validated reading\", \"alert message\". An unlabelled arrow earns nothing."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Levelling — start at Level 0", body: "A **context diagram (Level 0)** shows the whole system as one process with its external entities and the main flows in and out — perfect for the overview in a pitch. A **Level 1 DFD** breaks that single process into the main processes with their data stores — perfect for M5, because you can place each process at device, edge, fog or cloud. Draw the context diagram first; it forces you to define the system boundary." }},
    { callout: { t: "miscon", h: "A DFD is not a flowchart", body: "This is the classic error. A flowchart shows **control** — order, decisions, loops. A DFD shows **data** — what moves where and what it is called. There are no diamonds in a DFD, and no decision branches; if you have drawn a decision, you have drawn a flowchart." }},

    { page: "Wireframes and device interaction diagrams" },
    { callout: { t: "def", h: "Wireframe", body: "A **low-fidelity, labelled layout sketch** of a screen — boxes, placeholder text and labels showing what goes where and what each control does. Deliberately not styled: no colours, images or final fonts, so attention stays on structure and function." }},
    { callout: { t: "info", h: "What a good wireframe set contains (P9)", body: [
      { ul: [
        "**Several screens**, not one — at minimum the main dashboard, a detail view, and an alert/confirmation screen.",
        "**Every state a user will meet** — including the loading, empty and error states, which students almost always omit.",
        "**Navigation shown consistently** across screens, so the reviewer can see how a user moves between them.",
        "**Annotations against named HCI features** — \"Layout: status tile top-left because it is the first place the eye lands\"; \"Accessibility: 15 mm targets for gloved use\"; \"Colour: status shown by colour, icon and word, not colour alone\".",
        "**Notes on interaction** — what happens when the user taps this, what confirmation is shown, what the error message says.",
        "**Device and orientation stated** — a phone in one hand is a different design from a wall display read at 3 m."
      ] }
    ] } },
    { callout: { t: "tip", h: "Showing device interactions", body: "For the third requirement — diagrams showing **device interactions** — a simple labelled **system/network diagram** works well: each device as a box, each link as a labelled arrow carrying the connectivity method and the data it carries (\"BLE — temperature reading every 5 min\"), with gateways, the cloud and the users' devices shown. It answers 3.1–3.3 and M2 in one picture, and it is the diagram a client understands fastest." }},
    { callout: { t: "warn", h: "Diagrams must be referenced in the text", body: "A diagram dropped into an appendix with no reference earns little. Number every figure, refer to it in the prose (\"as Figure 3 shows, validation happens at the edge gateway before transmission\"), and make sure the diagram and the text agree. Contradictions between a diagram and the writing are noticed and cost marks in both." }},
    { callout: { t: "memorise", h: "Technical documentation", body: "**Flowchart** (control): terminator · process · decision · input/output · flow line — one Start, labelled branches, one action per box. **DFD** (data): external entity · process · data store · labelled data flow — no decisions, level 0 then level 1. **Wireframe** (interface): low-fidelity labelled layout, several screens including error and empty states, annotated against HCI features. Plus a **system/network diagram** for device interactions." }}
  ],
  flashcards: [
    ["Name the three types of technical documentation in F204 topic 6.5.", "Program flowcharts, data flow diagrams and wireframes."],
    ["Which question does each diagram type answer?", "Flowchart — what does the system decide and in what order? DFD — what data moves between which parts and where does it rest? Wireframe — what will the user see and do?"],
    ["List the main flowchart symbols and their meanings.", "Terminator (rounded, Start/End), process (rectangle, an action), decision (diamond, a labelled question), input/output (parallelogram), flow line (directional arrow), and connector (small circle)."],
    ["Give three rules for drawing a correct flowchart.", "One Start with every path reaching an End; every decision branch labelled; one action per process box; loops returning to a specific box; correct symbol for each element."],
    ["Name the four elements of a data flow diagram.", "External entity, process, data store, and labelled data flow."],
    ["What is the key difference between a flowchart and a DFD?", "A flowchart shows control — order, decisions and loops. A DFD shows data — what moves where and what it is called; it contains no decisions or diamonds."],
    ["What is a Level 0 (context) data flow diagram?", "The whole system shown as one process with its external entities and the main data flows in and out — it defines the system boundary."],
    ["What is a Level 1 data flow diagram used for?", "Breaking the single context process into the main processes and data stores — ideal for M5 because each process can be placed at device, edge, fog or cloud."],
    ["What is a wireframe?", "A low-fidelity labelled layout sketch of a screen — boxes, placeholder text and labels showing what goes where and what each control does, deliberately unstyled."],
    ["What should a good wireframe set include beyond the main screen?", "A detail view and an alert/confirmation screen, plus the loading, empty and error states, consistent navigation, and interaction notes."],
    ["What earns the marks on an annotated wireframe?", "Annotations tying each layout decision to a named HCI feature and the user need it meets, plus notes on what happens on interaction."],
    ["Which diagram best shows device interactions?", "A labelled system/network diagram — each device as a box and each link as an arrow carrying the connectivity method and the data it moves."],
    ["Why must diagrams be referenced in the text?", "An unreferenced diagram earns little; figures should be numbered, referred to in the prose, and must agree with what the writing says."],
    ["Which criteria require technical documentation in F204?", "M5 explicitly requires appropriate technical documentation for processing; P9 requires annotated wireframes; and P2 may use a flow chart for the four pillars."]
  ],
  quiz: [
    {
      q: "Which symbol represents a decision in a program flowchart?",
      opts: ["Rectangle", "Diamond", "Parallelogram", "Rounded rectangle"],
      ans: 1,
      why: "A diamond holds a question with labelled branches; a rectangle is a process and a parallelogram is input/output."
    },
    {
      q: "A student's data flow diagram contains diamonds with Yes/No branches. What is wrong?",
      opts: [
        "Nothing — DFDs use diamonds",
        "DFDs show data movement, not decisions; they have no decision symbols",
        "The diamonds should be circles",
        "DFDs cannot contain arrows"
      ],
      ans: 1,
      why: "Decisions and control flow belong in a flowchart; a DFD shows external entities, processes, data stores and labelled flows."
    },
    {
      q: "Which is a correctly labelled data flow?",
      opts: ["An unlabelled arrow", "'Data'", "'Validated temperature reading'", "A dotted line with no ends"],
      ans: 2,
      why: "A data flow must be labelled with what the data actually is; 'data' or no label earns nothing."
    },
    {
      q: "What should a Level 0 context diagram show?",
      opts: [
        "Every process in detail",
        "The whole system as one process with its external entities and main data flows",
        "The screen layout",
        "The order of decisions"
      ],
      ans: 1,
      why: "The context diagram defines the system boundary — one process, its external entities and the flows across the boundary."
    },
    {
      q: "Which wireframe state do students most often omit?",
      opts: ["The main dashboard", "The error and empty states", "The logo", "The title bar"],
      ans: 1,
      why: "Loading, empty and error states are part of the real user experience and are routinely missing from wireframe sets."
    },
    {
      q: "Why is a labelled system/network diagram useful for M2 and P10?",
      opts: [
        "It shows the colour scheme",
        "It shows each device, each link's connectivity method and the data it carries, so interactions and transmission choices are visible at once",
        "It replaces the written proposal",
        "It removes the need for wireframes"
      ],
      ans: 1,
      why: "One picture can show device interactions, connectivity methods and the data on each link."
    }
  ],
  exam: [
    {
      q: "Describe the difference between a program flowchart and a data flow diagram.",
      marks: 4,
      ms: [
        "A flowchart shows control — the order in which steps are carried out, including decisions and loops (1), using symbols such as terminators, processes, decisions and input/output (1).",
        "A data flow diagram shows how data moves through the system — external entities, processes that transform data, data stores and labelled data flows (1); it contains no decisions or loops (1)."
      ]
    },
    {
      q: "Explain what should be included in a set of annotated wireframes for an IoE solution.",
      marks: 6,
      ms: [
        "Several screens rather than one — a main dashboard, a detail view and an alert or confirmation screen (1–2).",
        "Every state a user will encounter, including loading, empty and error states (1).",
        "Consistent navigation shown across screens so movement between them is clear (1).",
        "Annotations tying each layout decision to a named HCI feature and the user need it meets (1–2).",
        "Notes on interaction — what happens on tap, what confirmation appears, what an error message says — and the device and orientation assumed (1–2)."
      ]
    },
    {
      q: "NEA practice (M5 support). Describe the technical documentation you would produce to explain how and where data is processed in an IoE cold-chain monitoring solution, and what each diagram would show.",
      marks: 9,
      ms: [
        "A Level 0 context diagram defining the system boundary — sensors and users as external entities, with the main flows in and out (1–2).",
        "A Level 1 data flow diagram showing processes (validate reading, average, compare to threshold, generate alert, archive) with data stores at device buffer, edge database and cloud archive, each labelled with which layer it runs on (1–3).",
        "Every data flow labelled with the actual data — raw reading, validated reading, alert message, daily summary (1).",
        "A program flowchart for the device logic: read, validate, buffer, threshold check with labelled branches, scheduled batch transmission, sleep and loop (1–2).",
        "A labelled system/network diagram showing each device, the connectivity method on each link and the data it carries, evidencing device interactions (1–2).",
        "Annotated wireframes for the manager dashboard and alert screen, including error and empty states (1–2).",
        "All figures numbered and referenced in the prose, with the diagrams and the written explanation consistent with each other (1–2)."
      ]
    }
  ]
};

})(window.KOS_CONTENT);
