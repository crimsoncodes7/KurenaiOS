# Unresolved Questions & External Dependencies

**Auditor:** Gemini 4 Argon (`gemini-4-argon`)  
**Date:** 2026-11-07  
**Build:** `894a407 sw kos-redraw-1`  
**Purpose:** Outstanding architectural decisions, real-device questions, and user preferences requiring resolution before final remediation.

---

## 1. Questions Requiring User Preference & Product Direction

1. **Multi-User Data Retention Policy on Sign-Out (`GEM-001`):**
   - *Current State:* Signing out revokes the Supabase token but leaves all local IndexedDB and localStorage data completely intact. A subsequent sign-in by a different user merges the previous user's data into the new account.
   - *Question for User:* When a user signs out of Supabase in KurenaiOS, should the application:
     - (Option A) Automatically wipe local state and reset to a clean guest state?
     - (Option B) Prompt the user: *"Keep your personal data on this device, or wipe it completely?"*
     - (Option C) Scope all local storage by account ID (`kos_state_<userId>`), maintaining separate local profiles on the same machine?

2. **Unfinished Review Session Policy (ST-04, JM-08):**
   - *Current State:* Closing or navigating away from a flashcard or Japanese session mid-deck logs zero XP, gold, or streak progress.
   - *Question for User:* If a student answers 25 of 30 cards and navigates away:
     - Should the app log a partial session immediately upon teardown, paying pro-rata XP and granting streak credit?
     - Or should it hold the in-progress session in memory/local storage so the student can resume where they left off?

3. **Santander Bank Import Expectations (MG-01 through MG-10):**
   - *Current State:* Money CSV import fails on UK Santander statements due to preamble lines, non-standard headers, and unquoted commas.
   - *Question for User:* Is Santander the primary UK bank statement format you need supported? Would you prefer a dedicated "Santander (UK)" parser preset, or a flexible column-mapping preflight UI that lets you match date, payee, and amount columns visually?

4. **Seals Cosmetic Purpose (SC-04):**
   - *Current State:* Gold Shop seals are advertised as "the topbar mark", but the topbar mark element was removed during the Graphite UI redesign.
   - *Question for User:* Where would you like equipped seals to appear?
     - Beside the Kurenai bloom logo in the topbar?
     - As a stamp mark on share cards and export summaries?
     - As the default avatar disk when no custom photo is equipped?

---

## 2. Questions Requiring Real Hardware Verification

1. **iOS Viewport Auto-Zoom (`AX-01`):**
   - *Observation:* Form inputs using font sizes below 16px (such as `.k-input` at 13.5px) trigger involuntary screen zooming in WebKit on real iPhones.
   - *Requirement:* Needs physical iPhone verification on Safari Mobile to ensure the font-size fix (`min(16px, ...)` or setting font-size 16px inside `@media (max-width: 700px)`) resolves the auto-zoom without distorting desktop input styling.

2. **Apple Pencil Scribble and Palm Rejection (`IN-01`):**
   - *Observation:* The headless harness cannot simulate Apple Pencil digitizer events, pressure levels, or palm rejection touch canceling.
   - *Requirement:* Live iPad testing with Apple Pencil on iPadOS 18 to verify ink stroke latency, pressure curves, and palm rejection across Topic Notes and Exam Question pads.

3. **Virtual Keyboard Resize vs. Overlay (`SY-08`, `SH-20`):**
   - *Observation:* On iOS Safari, the virtual keyboard shifts `window.visualViewport` while `window.innerHeight` can remain unchanged.
   - *Requirement:* Real iPhone/iPad testing of bottom sheets (`.k-dialog`) and sticky footer actions (`.k-dialog-foot`) when typing in text fields to confirm inputs don't hide behind the on-screen keyboard.

---

## 3. Ambiguities in System Contracts (For Claude & Engineering Team)

1. **`KOS.rerender()` vs. Targeted Component Patching:**
   - The stopgap `kos-redraw-1` relies on deferring background redraws. However, when the deferral timer expires, it still executes an unconditional full-page remount (`main.innerHTML = ''`). Does KurenaiOS intend to adopt a virtual DOM diffing approach, or a lightweight reactive pub-sub system where views declare data dependencies (e.g. `KOS.views.money.subscribes = ['money']`)?

2. **Offline Web Worker Packaging:**
   - When the service worker is active, module workers (e.g. `cs-wasm-worker.js`) occasionally fail to load from cache if relative asset URLs aren't fully resolved. Should worker scripts be converted to blob URLs generated from pre-cached response bodies?

3. **Time Boundary Standardization (04:00 vs 00:00):**
   - Home streaks, daily reviews, and routine day intervals roll over at 04:00 AM (`R().routineDay()`). However, Calendar recurrence, pacing weeks, and Money monthly budgets roll over strictly at 00:00 midnight UTC/local. Should this dual rollover boundary be documented as an invariant, or should study analytics explicitly state their 04:00 boundary?
