# 🧪 CarbonVerse Verification and Testing Protocols

Welcome to the CarbonVerse testing suite. This document outlines the manual verification procedures, automated checks, and edge-case validation protocols for the AI-driven narrative and Carbon Detective experience.

---

## 📂 Core User Flows

### 1. Onboarding and Profile Selection
* **Objective:** Ensure user preferences (City, Baseline transit mode, Diet type, Flight frequency) are captured cleanly, stored locally, and correctly trigger the first narrative branching.
* **Verification Steps:**
  1. Open the application. Select a city (e.g., *Hyderabad* or *Mumbai*).
  2. Select commute baseline, dietary choices, and flight history.
  3. Click **Begin Story** and verify the session store instantiates correctly without hydration mismatch.
  4. Inspect the LocalStorage key `carbon-verse-session` to confirm JSON structure is populated.

### 2. Narrative Branching & Chapter Experience
* **Objective:** Verify that decisions taken in Chapter 1 impact Chapter 2's narrative state and total carbon delta calculations.
* **Verification Steps:**
  1. Complete Chapter 1 (Breakfast, Commute, Lunch).
  2. Confirm that picking high-emission choices (e.g., *Book a Cab* or *Delivery Burger*) increases the daily carbon counter.
  3. Advance to Chapter 2. Verify that the AI narrative references past context (e.g., *"After that delivery, the air feels a bit heavy"* or *"Your morning walk kept the air cleaner"*).
  4. Ensure Chapter Complete transition triggers smoothly and redirects to the **Summary Page**.

### 3. Carbon Detective (Receipt Analysis)
* **Objective:** Confirm receipt scanning extracts items, categories, estimates CO₂ footprint, issues suggestions, recommends targeted missions, and handles duplicates.
* **Verification Steps:**
  1. Go to the **Carbon Detective** page.
  2. Upload a receipt image (or simulate upload).
  3. Confirm the checkmark animation sequence runs sequentially (Reading receipt → Identifying merchant → Detecting items → Estimating footprint → Report building).
  4. Verify the **Findings**, **Impact**, and **Actions** tabs render with appropriate stats.
  5. Upload the *same* receipt again. Confirm the **Duplicate Warning** modal appears with options to *Cancel* or *Analyze Again*.

### 4. Memory Book, History, and Coach
* **Objective:** Validate cumulative statistics, timeline event logs, achievement unlocks, and coaching actions.
* **Verification Steps:**
  1. Navigate to the **Memory Book** (`/memory`).
  2. Verify that completed stories and scanned receipts show up inside the timeline.
  3. Switch between tabs using keyboard or click. Ensure ARIA labels and active focus states update.
  4. Verify that deleting a receipt from the timeline updates the cumulative carbon total synchronously.
  5. Go to the **Coach** tab and click **Request AI Action Plan**. Validate that actionable steps are generated based on actual carbon history.

---

## 🤖 AI Flow and Recovery Testing

To ensure robustness against network issues, API latency, or invalid LLM formats, the following fail-safes are validated:

### 1. JSON Parse Native Fallback (Recovery Parser)
* If the LLM returns text instead of strict JSON, the API runs `runRecoveryParser()` which uses optimized regular expressions to extract:
  * Receipt type keywords (e.g., `utility`, `fuel`, `shopping`, `food`).
  * Item descriptions and numerical values.
  * Verdicts and suggestions.
* **Verification:** Simulated raw text responses matching unstructured text outputs are tested to ensure they map back to valid `DetectiveResult` JSON structure without throwing 500 errors.

### 2. Offline / API Key Absence Fallback
* When `GROQ_API_KEY` is not present:
  * The narrative endpoint redirects to static, context-appropriate fallbacks (e.g., *"A green choice that makes the world brighter!"*).
  * The Carbon Detective API returns a pre-parsed mock receipt result so that first-time reviewers can experience the full flow seamlessly.

---

## 🧾 Receipt Analysis Calculations

The emissions engine implements baseline calculations tailored to the Indian context:
1. **Fuel (Petrol/Diesel):**
   * *Formula:* Liters consumed × Emission factor.
   * *API Route:* Resolves fuel volume via the Climatiq API.
   * *Verification:* 10 Liters of petrol returns ~23.1 kg CO₂ equivalent.
2. **Electricity (Utility Bill):**
   * *Formula:* kWh consumed × Grid intensity factor (India average: ~0.82 kg/kWh).
   * *Verification:* 100 kWh returns ~82.0 kg CO₂.
3. **Food (Meal items):**
   * *Multipliers:* Low/Vegan (~0.5 kg), Moderate/Vegetarian (~1.5 kg), High/Meat (~3.5 kg).

---

## ⚠️ Edge Case Scenarios

| Scenario | Expected Behavior | Verification Status |
| :--- | :--- | :---: |
| **Large File Upload** | Receipts > 5MB are rejected at the client; API enforces a 7MB raw base64 payload limit. | **Verified** |
| **Non-Receipt Images** | If the AI flags an image as invalid, the app goes to the Error screen prompting to try again. | **Verified** |
| **First-Time User Safety** | If a user opens the summary page with zero active missions, starter missions are auto-generated. | **Verified** |
| **Hydration Safe client checks** | Client-only render logic is delayed with `setTimeout(..., 0)` to prevent Next.js rendering mismatches. | **Verified** |
| **Audio Context Init** | Audio contexts are lazy-loaded on click to comply with browser safety rules (no autoplay blocks). | **Verified** |

---

## 📱 Accessibility & Responsive Testing

### 1. Screen Sizes Tested
* **Mobile (320px - 480px):** Single-column stacked Bento items, full-screen overlay drawers, readable text, touch targets at least 44px.
* **Tablet (768px - 1024px):** Double-bezel grid structure adapting columns dynamically.
* **Desktop (1024px+):** Centered premium container layout with comfortable reading contrast.

### 2. Keyboard & Assistive Tech
* Run tab-navigation through the onboarding flow, choice selection, and tabs.
* **Focus Indicator:** Global visible focus ring (`outline: 2.5px solid #D4AF37`) ensures the current item is distinguishable without a mouse.
* **ARIA Roles:** Screen readers correctly announce role `tablist`, role `tab` (and `aria-selected` status), and role `tabpanel` contents.
