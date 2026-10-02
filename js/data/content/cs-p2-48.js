/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.8.1
   (individual/moral, social/ethical, legal and cultural issues and
   opportunities) at full A-level depth. It REPLACES the short entry the
   older file carried; every AQA levels-of-response question on the topic
   (7516/2 June 2017–2025, 7517/2 June 2017–2025) is planned and answered
   against its indicative content. Questions whose ethics half shares a
   paper with hardware are worked where the hardware lives (4.7.4.1
   checkout, 4.7.4.2 trackers) and Big Data is 4.11.1. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push({ text: [x + w / 2, y + (sub ? h / 2 - 7 : h / 2)], t: label, b: true, size: 12, c: "text" });
  if (sub) it.push({ text: [x + w / 2, y + h / 2 + 10], t: sub, size: 10.5, c: "muted" });
  return it;
}

var MS_KEY = { callout: { t: "tip", h: "How AQA marks these essays", body: [
  "They are **levels of response** (9 or 12 marks, sometimes 6): the examiner places the whole answer in a band, then a mark within it.",
  "Top band needs: a **line of reasoning** (coherent, structured), **range** across the named aspects (moral, ethical, legal, cultural), and points **expanded** with consequences or real-world examples.",
  "Typical cut-offs: 7–9 ≈ seven substantiated points across at least three aspects; 4–6 ≈ four points across two aspects. Vague points with no context — \"invasion of privacy\", \"must comply with laws\", \"faces must be blurred\" — are **NE.**"
] } };

C["compsci:4.8.1"] = {
  notes: [
    { h: "Moral, ethical, legal and cultural issues — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.8.1)", body: ["Show awareness of current individual (moral), social (ethical), legal and cultural **opportunities and risks** of computing. Understand that digital technology has transformed the capacity to **monitor behaviour**, **amass and analyse personal information**, and **distribute, publish and disseminate** it.", "That computer scientists therefore hold **power and responsibility** for their algorithms and code.", "That **software embeds moral and cultural values**.", "That **scale** lets one engineer do great good or great harm.", "And the **challenges facing legislators** in the digital age."] } },
    { callout: { t: "info", h: "Key idea", body: "Every AS paper has a 9- or 12-mark essay on this; the A-level has 3- to 12-mark questions:" } },
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Discuss the ethical, legal, cultural issues of a new service or product", "9–12", "AS 2017 Q09 (Street View indoors), 2018 Q07.1 (driverless taxis), 2020 Q08.1 (care-home life-blogging), 2022 Q11 (smart speakers), 2023 Q11 (AI clothes app), 2025 Q12 (image platform)"],
      ["Discuss both sides of a dilemma", "9", "AS 2019 Q11 (unlocking a suspect's phone)"],
      ["Technology + issues + lessons (A-level essay)", "12", "A-level 2017 Q07 (Wi-Fi data collected by mapping cars)"],
      ["How an algorithm works + its issues", "6", "A-level 2020 Q10 (news feeds), 2024 Q09 (AI diagnosis)"],
      ["Challenges for legislators", "3", "A-level 2018 Q08, 2025 Q04"],
      ["Ethics half of a hardware essay", "12", "AS 2024 Q10 (4.7.4.2), A-level 2022 Q06 (4.7.4.1), 2021 Q09 (4.11.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The four lenses** — moral, ethical, legal, cultural.", "**What computing changed** — monitoring, amassing, disseminating; power, values, scale.", "**The law** — the UK Acts to name, and why law struggles.", "**Writing the essay** — a method that hits the top band.", "**Worked essays: AS**.", "**Worked essays: A-level**.", "**Exam toolkit**."] },

    { page: "The four lenses" },
    { table: { head: ["Lens", "Asks", "Example question to raise"], rows: [
      ["**Moral** (individual)", "is it right **for this person** — the developer, the user — by their own conscience?", "Should I, the programmer, build a car that chooses whom to hit?"],
      ["**Ethical** (social)", "is it right **for society** — fairness, privacy, harm, consent, trust?", "Does a smart speaker in every home erode privacy for everyone?"],
      ["**Legal**", "what does **the law** require or forbid — and which country's?", "Does storing recordings comply with the Data Protection Act / UK GDPR?"],
      ["**Cultural**", "how do different **groups, communities and countries** see it — beliefs, customs, languages, generations?", "Do some religions forbid photographing people inside places of worship?"]
    ] } },
    { callout: { t: "miscon", h: "Moral vs ethical — side by side", body: "AQA uses **moral = individual** beliefs and **ethical = society's** standards. \"I wouldn't feel right writing tracking code\" is moral; \"tracking erodes everyone's privacy\" is ethical. Many points fit both — the mark scheme marks such points with # and credits them under either heading, but label each one." } },
    { callout: { t: "tip", h: "Opportunities, not only risks", body: "The spec says opportunities **and** risks. A balanced answer earns the top band: voice control helps disabled users; AI diagnosis reaches countries with few doctors; trackers reunite lost luggage and could protect vulnerable people." } },

    { page: "What computing changed" },
    { fig: { w: 600, h: 150, items: (function () {
      var it = [];
      [["Monitor", "cameras, location, clicks, voice"], ["Amass & analyse", "profiles, prediction, AI"], ["Disseminate", "publish, share, sell"]].forEach(function (b, i) {
        it = it.concat(boxAt(20 + i * 196, 30, 176, 60, b[0], ["accent", "accent2", "good"][i], b[1]));
        if (i < 2) it.push({ line: [[196 + i * 196, 60], [216 + i * 196, 60]], arrow: true, c: "accent2", w: 2 });
      });
      it.push({ text: [300, 120], t: "each step is cheap, automatic, invisible to the subject — and scales to billions", size: 11, c: "muted" });
      return it;
    })(), cap: "The spec's three transformations: what was once costly and rare is now automatic, so its risks multiply." } },
    { kv: [
      ["Power and responsibility", "engineers decide what a system collects, keeps and does; users rarely see the code, so the responsibility sits with those who write and deploy it (A-level 2017: a few developers added Wi-Fi payload capture)"],
      ["Software embeds values", "every design choice encodes a judgement — what a news feed ranks first, what a self-driving car prioritises, which accents a voice model was trained on"],
      ["Algorithmic bias", "a model trained on unrepresentative data performs worse for under-represented groups (e.g. diagnosis trained mostly on one population)"],
      ["Scale", "one line of code ships to billions: a privacy bug or biased model harms millions at once — and a good idea helps millions at once"],
      ["Informed consent", "users must understand what is collected and why, in clear terms — buried terms and conditions are not real consent"]
    ] },

    { page: "The law" },
    { table: { head: ["UK law (name it)", "What it covers", "Typical link"], rows: [
      ["**Data Protection Act 2018 / UK GDPR**", "personal data: lawful basis and consent, purpose limitation, data minimisation, accuracy, storage limitation, security; rights of access, correction, erasure", "recordings, location trails, health data, CCTV"],
      ["**Computer Misuse Act 1990**", "unauthorised access; access with intent to commit further offences; unauthorised modification (malware); making tools for these", "hacking a tracker or a phone; spreading a virus"],
      ["**Copyright, Designs and Patents Act 1988**", "who owns creative work — images, text, software", "images uploaded to a platform; news stories re-published"],
      ["**Regulation of Investigatory Powers Act 2000**", "lawful interception and surveillance", "intercepting Wi-Fi traffic; police access to data"],
      ["**Communications Act 2003**", "misuse of networks and communication services", "intercepting or abusing a network"],
      ["**Freedom of Information Act 2000**", "public access to information held by public bodies", "government use of algorithms"]
    ] } },
    { callout: { t: "warn", h: "\"Must comply with laws\" is NE.", body: "Name the law **and** the provision that bites, in context: \"under UK GDPR the company needs informed consent before recording speech in a home, and must not keep recordings longer than needed.\" AQA awards up to two points for naming relevant Acts." } },
    { h: "Why law struggles in the digital age" },
    { table: { head: ["Writing laws", "Enforcing laws"], rows: [
      ["technology evolves faster than legislation; new crimes appear; uses no one anticipated", "the Internet is **global** but laws are **national** — offenders act from other jurisdictions"],
      ["legislators may lack technical expertise", "some attacks are carried out **by states**"],
      ["wealthy tech companies **lobby** for their interests", "encryption, proxies, VPNs, botnets and peer-to-peer systems hide culprits; digital evidence is hard to gather"],
      ["balancing **privacy** against **protection of society**; freedom of speech against state secrets", "the volume of users and data makes monitoring impossible; enforcement lacks resources"]
    ] } },

    { page: "Writing the essay" },
    { callout: { t: "formula", h: "Method: a 9–12-mark issues essay", body: [
      "1. **Plan (2 min)**: four headings — Moral, Ethical, Legal, Cultural (plus any technical area the question names). Jot 2–3 points under each **from the scenario's facts**.",
      "2. **Each paragraph = P-E-C**: **P**oint (labelled with its lens) → **E**xpansion (why it matters, for whom) → **C**ontext/consequence (an example from the scenario or the real world).",
      "3. **Balance**: give opportunities as well as risks; say who benefits and who bears the cost.",
      "4. **Name law precisely** (Act + provision).",
      "5. **Close with a judgement or safeguard**: consent, transparency, data minimisation, human oversight, security.",
      "6. Cover **every** aspect the question names — missing one caps the band."
    ] } },
    { table: { head: ["Weak (NE.)", "Strong"], rows: [
      ["It's an invasion of privacy.", "**Ethical:** filming inside museums captures members of the public who did not expect to be photographed indoors — unlike the street, they may not be able to avoid it, so Google should seek permission or blur them."],
      ["They must follow the law.", "**Legal:** the life-blogging data is health data — special-category personal data under UK GDPR — so it needs explicit consent and strong security; residents who lack capacity cannot simply be fitted with it secretly."],
      ["Some cultures won't like it.", "**Cultural:** some faiths object to images of people, or of the inside of places of worship, so publishing interior views of religious buildings could cause offence."]
    ] } },

    { page: "Worked essays: AS" },
    { worked: { tag: "exam", title: "Street View goes indoors", src: "AS June 2017 · P2 Q09 · 9 marks",
      q: "Google have extended Street View to cover the inside of buildings such as museums and sports stadiums. Discuss a range of ethical, legal and cultural issues that Google may have needed to deal with when extending the service.",
      steps: [
        { h: "Ethical", m: "Members of the public caught in images must be identified and asked for permission; they may be less happy being photographed inside a building than on a street. Some areas (toilets, offices, laboratories) are inappropriate to film. Online access might reduce paying visitors to museums, and discourage people from visiting public buildings at all.", mk: "indicative" },
        { h: "Ethical", m: "Adverts captured in the images could give unfair product placement; images might show material harmful to children; how often should the images be updated?", mk: "indicative" },
        { h: "Legal", m: "Filming inside a private building needs the owner's permission; filming people on private land without consent may be unlawful; data protection law applies to identifiable people; copyrighted exhibits may be captured; detailed interiors could help criminals or terrorists plan; Street View is worldwide, so many legal systems apply.", mk: "indicative" },
        { h: "Cultural", m: "Images of some people or exhibits may offend some cultures; photographing inside religious buildings may be inappropriate; some beliefs forbid photographing people; the tradition of family and school visits could change; cultural sensitivity must be balanced against freedom of expression.", mk: "7–9 marks", n: "7–9: ethical, legal AND cultural, two or three developed points each. NE. without context: \"blur faces\", \"comply with laws\", \"invasion of privacy\". R. private homes; live monitoring." }
      ], result: "Three aspects, each with scenario-specific points" } },
    { worked: { tag: "exam", title: "Driverless taxis", src: "AS June 2018 · P2 Q07.1 · 9 marks",
      q: "A company's programmers develop software to control a fleet of driverless taxis in a large city. Discuss a range of moral, ethical, legal and cultural issues the programmers may need to consider while developing the service and that may arise while the public use it.",
      steps: [
        { h: "Moral", m: "Programmers may share responsibility if an accident occurs. They must code decisions for a crisis — if a crash is unavoidable, what does the car choose to hit? They must keep the cars protected from hackers who might take control with passengers on board. They may be increasing car use, with environmental impact.", mk: "indicative" },
        { h: "Ethical", m: "Taxi drivers lose their livelihoods, and other firms will follow. Customers may not realise the car is driverless until they get in. If a passenger is taken ill, a driverless taxi cannot help.", mk: "indicative" },
        { h: "Legal", m: "Who is liable after a crash — the manufacturer, the programmers, the operator? Insurance; road-traffic law written for human drivers; the journey and location data collected about passengers falls under data protection law.", mk: "indicative" },
        { h: "Cultural", m: "Older people or some communities may distrust automation; driving norms differ between cities and countries, so behaviour must adapt; the loss of the taxi driver as a local figure.", mk: "7–9 marks", n: "7–9: at least three aspects, about seven substantiated points, linked to the programmers' decisions." }
      ], result: "Responsibility, jobs, liability, trust" } },
    { worked: { tag: "exam", title: "Unlocking a suspect's phone", src: "AS June 2019 · P2 Q11 · 9 marks",
      q: "Law enforcement officers have asked a phone manufacturer to bypass access restrictions on a phone they believe contains evidence of crime; manufacturers frequently refuse. Discuss a range of ethical and legal issues raised by the manufacturer agreeing or refusing.",
      steps: [
        { h: "Ethical — agree", m: "Evidence could help victims and prevent further crime; officers could contact other potential victims or run operations against other criminals.", mk: "indicative" },
        { h: "Ethical — refuse", m: "A breach of the privacy and trust between manufacturer and customer; a slippery slope — if granted here, where does it stop, and will foreign governments demand the same? Officers might see private, culturally sensitive material, or misuse the data.", mk: "indicative" },
        { h: "Legal — agree", m: "A judge may have authorised access, and refusing may itself be unlawful; data could solve or prevent crimes, including terrorism.", mk: "indicative" },
        { h: "Legal — refuse", m: "Creating a bypass creates a vulnerability that hostile hackers could exploit for every user; human-rights protections of privacy; police might not keep the data secure, or might alter it; who has the authority to grant access?", mk: "indicative" },
        { h: "Expansion", m: "e.g. \"a breach of privacy may be outweighed by lives saved\" — weigh the two sides explicitly.", mk: "7–9 marks", n: "7–9: at least four arguments with expansions, covering BOTH ethical and legal." }
      ], result: "Both sides, both lenses" } },
    { worked: { tag: "exam", title: "Life-blogging in a care home", src: "AS June 2020 · P2 Q08.1 · 9 marks",
      q: "A care home is considering replacing button-pressed PERS alarms with life-blogging devices that record vital signs, audio and video to a server viewable on a website, and is considering not telling residents because it may confuse them. Discuss the moral, ethical, legal and cultural issues the managers should consider.",
      steps: [
        { h: "Moral / ethical", m: "Collecting data about people without them knowing what it is for is unethical — it could be used for things they would not agree to; residents cannot agree to wear a device whose capabilities they don't understand. Recording far more than vital signs invades privacy; staff might watch streams for other reasons. Who controls the data — can a resident stop recording?", mk: "indicative" },
        { h: "Legal", m: "Health data is special-category personal data under data protection law: it needs consent (or another lawful basis), security, a retention limit; who can see it, and can next of kin? Who is liable if a device fails and someone dies? What if the camera records an illegal act? Visitors are filmed too — must they be told? In which country is the server?", mk: "indicative" },
        { h: "Cultural", m: "Some people, from some cultures, object to being filmed, particularly without knowing; residents may not want staff of the opposite gender viewing them in certain situations.", mk: "indicative" },
        { h: "Balance", m: "The system could save lives when a resident cannot press a button, and protect staff against false abuse allegations — so it may be justified with informed consent, limited recording and strict access.", mk: "7–9 marks", n: "7–9: a wide range consistently explained or exemplified." }
      ], result: "Consent is the crux" } },
    { worked: { tag: "exam", title: "Smart speakers and lossy audio", src: "AS June 2022 · P2 Q11 · 12 marks",
      q: "An international company's smart speaker is always listening; it stores users' audio recordings, compressed with lossy compression and sent over the Internet to its headquarters, to improve voice recognition. Discuss the ethical, legal and cultural issues raised and justify why the company might use lossy compression.",
      steps: [
        { h: "Lossy (4.5.6.9)", m: "The scale is huge — millions of users — so lossy compression greatly reduces each file's size for transmission and storage; it keeps enough quality for speech analysis by discarding sound the analysis does not need.", mk: "indicative" },
        { h: "Ethical", m: "The goal is justifiable — voice control helps people who cannot use other input. But recordings may capture illegal activity (a duty to report?), staff may misuse or be exposed to disturbing recordings, privacy in the home erodes, and the data may drift to other purposes; informed consent in clear terms is needed.", mk: "indicative" },
        { h: "Legal", m: "GDPR / Data Protection Act govern storing and transferring data across borders; the company must secure the data; privacy laws differ by country — and a global firm could exploit weaker jurisdictions.", mk: "indicative" },
        { h: "Cultural", m: "Recording everyone helps accents and languages with little training data; but customs about privacy and religion differ by country; the benefit to disabled users must be weighed against compromised privacy.", mk: "10–12 marks", n: "10–12: all four aspects (lossy, ethical, legal, cultural), clear justification of lossy, expanded with real-world implications." }
      ], result: "All four aspects + a justified lossy choice" } },
    { worked: { tag: "exam", title: "AI clothes app", src: "AS June 2023 · P2 Q11 · 9 marks",
      q: "An app lets a user photograph themself; AI recommends clothes from its interpretation of how they look and generates images of them wearing the clothes, which can be shared on social media. Describe how a digital camera captures the photo and discuss the moral, ethical, legal and cultural issues the developers may have considered.",
      steps: [
        { h: "Camera (AO1)", m: "Light is focused by the lens onto an array of sensors (CCD); each produces an electrical signal for one pixel; colour filters give red, green and blue values; an ADC converts the light intensities to binary; the pixels are stored as an array (4.7.4.1).", mk: "indicative" },
        { h: "Moral / ethical", m: "The AI's judgement of how someone looks may embed narrow beauty standards and harm self-esteem; biased training data may serve some body types or skin tones badly; generated images could be edited or misused (deepfakes).", mk: "indicative" },
        { h: "Legal", m: "Photos are personal (biometric) data — consent, security and deletion rights under UK GDPR; who owns the generated images and their copyright; under-age users.", mk: "indicative" },
        { h: "Cultural", m: "Recommendations must respect modesty norms and religious dress; fashion differs between cultures and ages.", mk: "7–9 marks", n: "7–9: very good capture explanation + a wide, explained range of issues." }
      ], result: "Camera + issues" } },
    { worked: { tag: "exam", title: "Free image platform takes ownership", src: "AS June 2025 · P2 Q12 · 9 marks",
      q: "A UK company's online image editor is free to non-subscribers, who agree to transfer ownership of uploaded images to the company, which intends to sell them to third parties; subscribers keep ownership. Discuss the moral, ethical, legal and cultural issues raised.",
      steps: [
        { h: "Moral / ethical", m: "People appearing in an uploaded image have no say when someone else uploads it, and their privacy may be infringed; the company gains personal information from image content and metadata; selling images without crediting their creators is arguably unethical; illegal images raise a duty to report.", mk: "indicative" },
        { h: "Legal", m: "Is a transfer of copyright buried in terms valid, and do users understand it (informed consent)? People in photos are data subjects under UK GDPR; the buyers' uses may be unlawful; selling abroad changes the law that applies.", mk: "indicative" },
        { h: "Cultural", m: "Images of people or sacred places reused commercially may offend; poorer users who cannot pay effectively trade their rights for the service — a two-tier culture.", mk: "7–9 marks", n: "7–9: balanced, nuanced range with real-world implications." }
      ], result: "Ownership, consent, privacy, fairness" } },

    { page: "Worked essays: A-level" },
    { worked: { tag: "exam", title: "Mapping cars collected Wi-Fi data (12-mark essay)", src: "A-level June 2017 · P2 Q07 · 12 marks",
      q: "Between 2008 and 2010 a company's mapping cars, fitted with cameras and Wi-Fi equipment, collected information being transmitted on personal Wi-Fi networks; a few developers had added this to the data-collection software. Discuss how this was possible, how network owners could have prevented it, the legal and ethical issues, and the lessons the company might have learnt.",
      steps: [
        { h: "1 · How", m: "Wi-Fi signals travel outside the property with limited control over range; any receiver in range can read the packets, with no need to tap a cable; unencrypted protocols sent the payload in plain text.", mk: "area 1" },
        { h: "2 · Prevent", m: "Use an encrypting protocol (WPA2) so intercepted data is unreadable; disable SSID broadcast; reduce transmitter power; use cables. (R. MAC filtering — the cars were not connecting, only listening.)", mk: "area 2" },
        { h: "3 · Legal / ethical", m: "Is Wi-Fi a broadcast or a private communication? Was it legal to intercept — Data Protection Act (personal, possibly sensitive data like bank details), Computer Misuse Act, RIPA, Communications Act? Is collecting without consent or purpose ethical? Was it deliberate? What should be done with the data — delete it, or keep it to contact and apologise? Liability, and different laws in different countries.", mk: "area 3" },
        { h: "4 · Lessons", m: "Train developers in legal and ethical issues; review guidelines; independent code review and logged changes; collect only data with a clear purpose; remove the capture equipment.", mk: "10–12: all four areas, three excellent", n: "\"Further testing\" is NE. unless it says how testing would expose the extra functionality." }
      ], result: "How · prevent · issues · lessons" } },
    { worked: { tag: "exam", title: "Algorithms choose the news", src: "A-level June 2020 · P2 Q10 · 6 marks",
      q: "A social media service uses algorithms to select current-affairs stories written by others, showing different stories to different members. Discuss how algorithms might decide which stories to show, and the moral, ethical and legal considerations for its developers and operators.",
      steps: [
        { h: "How", m: "Match stories to interests members state; analyse what they have read, liked and searched for; what their friends read; popularity; what similar profiles read; keyword similarity with past reading.", mk: "1 mark per point" },
        { h: "Legal", m: "Who owns the copyright in each story — may it be reproduced? Is the company liable for inaccurate content? Laws on content differ between countries; age-appropriateness; members must be told how their data is used.", mk: "1 mark per point" },
        { h: "Ethical / moral", m: "Tailoring creates filter bubbles that shape views; governments may try to control what is shown; paid promotion; fake news and propaganda — a duty to check reliability and provide balance; should members be told their news is tailored, and be able to opt out?", mk: "6 marks", n: "Max 4 if all points are from one area." }
      ], result: "Mechanism + issues" } },
    { worked: { tag: "exam", title: "AI diagnosis", src: "A-level June 2024 · P2 Q09 · 6 marks",
      q: "Algorithms based on artificial intelligence can diagnose some medical conditions from X-ray images. Discuss some of the moral, ethical and legal issues that might arise.",
      steps: [
        { m: "Accuracy and responsibility: who is responsible for a wrong diagnosis — the designers, programmers or operators? An AI cannot itself be held responsible; a human doctor feels a moral responsibility that an AI does not.", mk: "indicative" },
        { m: "Trust and consent: should patients be told, and offered a human diagnosis or a human double-check (removing some benefit)? Will a doctor dare overrule the system? Could reliance de-skill staff or miss rare conditions?", mk: "indicative" },
        { m: "Data: medical data is confidential — GDPR, security, consent to use patients' data for training; unrepresentative training data creates algorithmic bias against under-represented groups.", mk: "indicative" },
        { m: "Society: diagnosis possible in poorer countries with few doctors — but costly systems may widen inequality; more diagnoses increase demand on hospitals; old cases could be re-examined (with consent?).", mk: "5–6 marks", n: "1–2 if the answer only covers accuracy and responsibility; 3–4 goes beyond them or develops them; 5–6 a developed range." }
      ], result: "Responsibility, consent, bias, access" } },
    { worked: { tag: "exam", title: "Challenges for legislators", src: "A-level June 2018 · P2 Q08 · 3 marks",
      q: "Explain some of the challenges that face legislators in the digital age.",
      steps: [
        { m: "Technology evolves quickly, so laws cannot keep up and new types of crime become possible;", mk: "1 mark" },
        { m: "the Internet is global but laws are national — a crime can be committed in one country from outside its jurisdiction;", mk: "1 mark" },
        { m: "encryption, proxies and VPNs make culprits hard to identify and evidence hard to gather;", mk: "1 mark", n: "Also: data can be combined in new ways; state actors; differing attitudes to copyright and privacy; freedom of speech vs privacy; lobbying; resources. NE. \"hard to catch criminals\"; naming Acts alone." }
      ], result: "Pace, jurisdiction, anonymity" } },
    { worked: { tag: "exam", title: "Why computer laws are hard", src: "A-level June 2025 · P2 Q04 · 3 marks",
      q: "It is difficult to write and enforce laws relating to the use of computers. Explain why.",
      steps: [
        { h: "Writing", m: "Legislators may lack technical expertise — and technology is used for purposes no one anticipated;", mk: "1 mark" },
        { h: "Writing", m: "it is difficult to balance individuals' privacy against the protection of society;", mk: "1 mark" },
        { h: "Enforcing", m: "the large volume of users and data makes effective monitoring impossible, and enforcement resources may not exist;", mk: "1 mark", n: "Also: lobbying by tech companies; global vs national laws; state crime; hidden culprits. NE. \"users expect privacy\"." }
      ], result: "One explained challenge per mark" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Discuss (9–12)", "Every named aspect, labelled; P-E-C paragraphs from the scenario; balance; a judgement."],
      ["Discuss both sides", "Arguments for AND against, in each lens asked."],
      ["Explain challenges", "One explained challenge per mark — writing laws vs enforcing them."],
      ["Describe how (algorithm/hardware) + discuss", "Do the technical part properly — it is its own area."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"MELC\" and \"PEC\"", body: "**M**oral (me), **E**thical (us), **L**egal (the law), **C**ultural (them). Each paragraph: **P**oint, **E**xpansion, **C**ontext. Safeguards to close on: \"**C**onsent, **T**ransparency, **M**inimise, **S**ecure, **O**versee\" — \"Can The Machine Stay Ours?\"" } },
    { callout: { t: "warn", h: "Specific errors", body: ["Generic points not tied to the scenario (NE.).", "\"Must comply with the law\" without naming law or provision.", "Leaving out an aspect the question names (caps the band).", "Only risks — no opportunities or balance.", "A list of bullet fragments: the top band needs a line of reasoning."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.9 lossy compression (smart speakers); 4.7.4.1 camera, RFID and barcodes; 4.7.4.2 SSDs for trackers; 4.9.2.3 Wi-Fi security; 4.9.3.2 encryption and the bypass dilemma; 4.10 personal data in databases; 4.11 Big Data and profiling; 4.13 professional responsibility in development." } }
  ],
  flashcards: [
    ["Moral vs ethical (AQA)?", "Moral = individual beliefs; ethical = society's standards."],
    ["Legal issue?", "What the law requires or forbids — and which country's law."],
    ["Cultural issue?", "How different groups, communities, faiths or countries see it."],
    ["Three capacities computing transformed?", "Monitor behaviour; amass and analyse personal information; distribute and disseminate it."],
    ["Why do software engineers carry responsibility?", "Their algorithms and code decide what systems collect and do, at enormous scale."],
    ["What does \"software embeds values\" mean?", "Design choices encode judgements (ranking, priorities, training data)."],
    ["Name four UK Acts relevant to computing.", "Data Protection Act 2018/UK GDPR, Computer Misuse Act 1990, Copyright Designs and Patents Act 1988, RIPA 2000 (also Communications Act 2003)."],
    ["Three CMA offences?", "Unauthorised access; with intent to commit further offences; unauthorised modification."],
    ["GDPR principles to cite?", "Lawful basis/consent, purpose limitation, minimisation, accuracy, storage limitation, security; rights of access and erasure."],
    ["Two challenges in WRITING computer laws?", "Technology outpaces law; legislators lack expertise; lobbying; privacy vs protection."],
    ["Two challenges in ENFORCING them?", "Global Internet vs national laws; anonymity (encryption, VPNs); state actors; volume and resources."],
    ["What earns the top band in an issues essay?", "A line of reasoning, all named aspects, expanded points with examples."]
  ],
  quiz: [
    { q: "\"Developers may be putting taxi drivers out of work\" is best labelled", opts: ["ethical (society)", "legal", "cultural", "technical"], ans: 0, why: "A harm to society." },
    { q: "Hacking into a lost-luggage tracker breaches", opts: ["the Computer Misuse Act", "the Copyright Act", "Freedom of Information", "no UK law"], ans: 0, why: "Unauthorised access." },
    { q: "\"It must comply with the law\" with no context is", opts: ["NE.", "a full point", "two points", "R."], ans: 0, why: "Name the law and why." },
    { q: "Which is a challenge in ENFORCING computer law?", opts: ["the Internet is global but laws are national", "legislators lack expertise", "lobbying", "technology changes fast"], ans: 0, why: "Jurisdiction." },
    { q: "Algorithmic bias usually comes from", opts: ["unrepresentative training data", "slow processors", "lossy compression", "IPv4"], ans: 0, why: "Biased data in, biased results out." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
