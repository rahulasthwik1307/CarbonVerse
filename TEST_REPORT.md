# CarbonVerse — TEST_REPORT.md

## Summary

| Metric | Value |
|--------|-------|
| **Test Framework** | Vitest v4.1.9 |
| **Test Files** | 5 |
| **Total Tests** | 71 |
| **Passing** | 71 ✅ |
| **Failing** | 0 |
| **Duration** | ~970ms |

---

## Test Files

### 1. `tests/carbon-logic.test.ts` — 12 tests

Core carbon impact and world-state calculation logic.

| Test | Coverage |
|------|----------|
| `clamp()` boundary enforcement | Values below 0 → 0, above 100 → 100 |
| `applyImpactToWorld()` — eco choice | +sky, +trees, +birds, −traffic |
| `applyImpactToWorld()` — moderate choice | −sky, +traffic |
| `applyImpactToWorld()` — high-impact choice | −sky, −trees, −birds, +traffic |
| Clamp ceiling (eco choice near max) | Values don't exceed 100 |
| Clamp floor (high choice near min) | Values don't drop below 0 |
| `computePlanetMood()` — Stable | Average world conditions |
| `computePlanetMood()` — Under Stress (low sky) | skyQuality < 30 |
| `computePlanetMood()` — Under Stress (low trees) | treeDensity < 25 |
| `computePlanetMood()` — Thriving | sky > 80 AND greenCoverage > 75 |
| `computePlanetMood()` — Recovering | Last 2 decisions both eco |
| `computePlanetMood()` — NOT recovering on single eco | Edge case validation |

---

### 2. `tests/session-store.test.ts` — 11 tests

Story session management and duplicate-detection logic.

| Test | Coverage |
|------|----------|
| Session ID: false on empty list | No false positives |
| Session ID: false when ID is null | Null guard |
| Session ID: false when ID is undefined | Undefined guard |
| Session ID: detects exact match | True positive |
| Session ID: different ID = no duplicate | True negative |
| Time-based: same carbon within 15s window | Duplicate detected |
| Time-based: same carbon after 15s | Not a duplicate |
| Time-based: different carbon within 15s | Not a duplicate |
| Time-based: empty list | No crash |
| Session ID format validation | Matches UUID v4 regex |
| Uniqueness: 100 generated IDs are all unique | No collisions |

---

### 3. `tests/mission-logic.test.ts` — 18 tests

Mission completion via story choices and progress tracking.

| Test | Coverage |
|------|----------|
| Transit 🚇: metro choice completes mission | Keyword match |
| Transit 🚇: walk choice completes mission | Keyword match |
| Transit 🚇: cycle choice completes mission | Keyword match |
| Transit 🚇: cab/drive does NOT complete mission | Negative case |
| Food 🥗: plant-based choice completes mission | Keyword match |
| Food 🥗: tiffin choice completes mission | Keyword match |
| Food 🥗: canteen choice completes mission | Keyword match |
| Food 🥗: vegetarian choice completes mission | Keyword match |
| Food 🥗: meat/fast-food does NOT complete mission | Negative case |
| Shopping 🛒: kirana choice completes mission | Keyword match |
| Shopping 🛒: local market completes mission | Keyword match |
| Shopping 🛒: online order does NOT complete | Negative case |
| Progress: increments matching targetType | Counter logic |
| Progress: marks completed at targetCount | Completion logic |
| Progress: multi-step not completed on first | Partial progress |
| Progress: multi-step completed after N steps | Full completion |
| Progress: already-completed ignored | Idempotency |
| Progress: wrong targetType not updated | Isolation |

---

### 4. `tests/achievements.test.ts` — 13 tests

All 8 achievement unlock conditions.

| Achievement | Tests |
|-------------|-------|
| `first-green` | locks at 0 eco choices; unlocks at 1 |
| `receipt-detective` | locks with no receipts; unlocks after 1 |
| `story-complete` | unlocks after completing 1 story |
| `metro-master` | requires 3 metro/walk choices; 2 is not enough |
| `garden-guardian` | unlocks at 5 eco choices; 4 is not enough |
| `sustainability-hero` | unlocks when ALL decisions are eco; mixed = locked; 0 decisions = locked |
| Already-unlocked | timestamp not overwritten on re-check |

---

### 5. `tests/receipt-analysis.test.ts` — 17 tests

Receipt CO2 analysis utility functions.

| Test | Coverage |
|------|----------|
| `classifyImpactLevel()` — low (≤1 kg) | Boundary: 0, 0.5, 1.0 |
| `classifyImpactLevel()` — moderate (1–5 kg) | Boundary: 1.1, 3, 5 |
| `classifyImpactLevel()` — high (5–15 kg) | Boundary: 5.1, 10, 15 |
| `classifyImpactLevel()` — very_high (>15 kg) | Boundary: 15.1, 50, 100 |
| `sumItemCO2()` — empty array | Returns 0 |
| `sumItemCO2()` — multiple items | Correct sum |
| `sumItemCO2()` — single item | Edge case |
| `formatCO2Label()` — negligible | "< 0.01 kg CO₂" |
| `formatCO2Label()` — sub-1 kg | 2 decimal places |
| `formatCO2Label()` — ≥1 kg | 1 decimal place |
| `categoriseReceiptText()` — fuel | petrol, diesel keywords |
| `categoriseReceiptText()` — electricity | kWh, units keywords |
| `categoriseReceiptText()` — transport | metro, bus, ticket |
| `categoriseReceiptText()` — grocery | kirana, vegetables |
| `categoriseReceiptText()` — food | restaurant, food keywords |
| `categoriseReceiptText()` — shopping | mall, clothes, shirt |
| `categoriseReceiptText()` — other | unrecognized input |

---

## Edge Cases Tested

- **Clamping** — world state values bounded at [0, 100]
- **Duplicate story prevention** — both session-ID and time+carbon fallback
- **Session ID uniqueness** — 100 generated IDs, all unique
- **Already-unlocked achievements** — timestamps not reset
- **Multi-step missions** — not prematurely completed
- **Already-completed missions** — idempotent (not double-counted)
- **Sustainability Hero with 0 decisions** — correctly locked
- **Null/undefined guards** — no crash on missing session IDs

---

## How to Run

```bash
# Single run (CI mode)
npm run test:run

# Watch mode (development)
npm run test
```

---

*Generated after full test pass: 71/71 tests passing in ~970ms.*
