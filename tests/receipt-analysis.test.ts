import { describe, it, expect } from "vitest";

// ─── Receipt CO2 analysis helpers ────────────────────────────────────────────
// Mirrors logic from src/app/api/detective/route.ts for pure-function testing

interface ReceiptItem {
  name: string;
  estimatedCO2: number;
  confidence: "high" | "medium" | "low";
}

type ImpactLevel = "low" | "moderate" | "high" | "very_high";

function classifyImpactLevel(totalCO2Kg: number): ImpactLevel {
  if (totalCO2Kg <= 1) return "low";
  if (totalCO2Kg <= 5) return "moderate";
  if (totalCO2Kg <= 15) return "high";
  return "very_high";
}

function sumItemCO2(items: ReceiptItem[]): number {
  return items.reduce((acc, item) => acc + item.estimatedCO2, 0);
}

function formatCO2Label(kg: number): string {
  if (kg < 0.01) return "< 0.01 kg CO₂";
  if (kg < 1) return `${kg.toFixed(2)} kg CO₂`;
  return `${kg.toFixed(1)} kg CO₂`;
}

// Receipt type categorisation helper
type ReceiptType =
  | "food"
  | "fuel"
  | "electricity"
  | "transport"
  | "shopping"
  | "grocery"
  | "utility"
  | "other"
  | "unknown";

function categoriseReceiptText(text: string): ReceiptType {
  const t = text.toLowerCase();
  if (t.includes("petrol") || t.includes("diesel") || t.includes("fuel")) return "fuel";
  if (t.includes("electricity") || t.includes("kwh") || t.includes("units")) return "electricity";
  if (t.includes("metro") || t.includes("bus") || t.includes("ticket")) return "transport";
  if (t.includes("grocery") || t.includes("vegetables") || t.includes("kirana")) return "grocery";
  if (t.includes("restaurant") || t.includes("food") || t.includes("cafe")) return "food";
  if (t.includes("shirt") || t.includes("mall") || t.includes("clothes")) return "shopping";
  return "other";
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("classifyImpactLevel()", () => {
  it("returns 'low' for <= 1 kg CO2", () => {
    expect(classifyImpactLevel(0)).toBe("low");
    expect(classifyImpactLevel(0.5)).toBe("low");
    expect(classifyImpactLevel(1)).toBe("low");
  });

  it("returns 'moderate' for 1–5 kg CO2", () => {
    expect(classifyImpactLevel(1.1)).toBe("moderate");
    expect(classifyImpactLevel(3)).toBe("moderate");
    expect(classifyImpactLevel(5)).toBe("moderate");
  });

  it("returns 'high' for 5–15 kg CO2", () => {
    expect(classifyImpactLevel(5.1)).toBe("high");
    expect(classifyImpactLevel(10)).toBe("high");
    expect(classifyImpactLevel(15)).toBe("high");
  });

  it("returns 'very_high' for > 15 kg CO2", () => {
    expect(classifyImpactLevel(15.1)).toBe("very_high");
    expect(classifyImpactLevel(50)).toBe("very_high");
    expect(classifyImpactLevel(100)).toBe("very_high");
  });
});

describe("sumItemCO2()", () => {
  it("returns 0 for empty items array", () => {
    expect(sumItemCO2([])).toBe(0);
  });

  it("sums all item CO2 values", () => {
    const items: ReceiptItem[] = [
      { name: "Chicken Biryani", estimatedCO2: 3.5, confidence: "high" },
      { name: "Cola", estimatedCO2: 0.2, confidence: "medium" },
      { name: "Naan", estimatedCO2: 0.3, confidence: "high" },
    ];
    expect(sumItemCO2(items)).toBeCloseTo(4.0);
  });

  it("handles single item correctly", () => {
    const items: ReceiptItem[] = [{ name: "Coffee", estimatedCO2: 0.08, confidence: "medium" }];
    expect(sumItemCO2(items)).toBeCloseTo(0.08);
  });
});

describe("formatCO2Label()", () => {
  it("shows '< 0.01 kg CO₂' for negligible emissions", () => {
    expect(formatCO2Label(0)).toBe("< 0.01 kg CO₂");
    expect(formatCO2Label(0.005)).toBe("< 0.01 kg CO₂");
  });

  it("shows 2 decimal places for sub-1 kg values", () => {
    expect(formatCO2Label(0.5)).toBe("0.50 kg CO₂");
    expect(formatCO2Label(0.123)).toBe("0.12 kg CO₂");
  });

  it("shows 1 decimal place for >= 1 kg values", () => {
    expect(formatCO2Label(1.0)).toBe("1.0 kg CO₂");
    expect(formatCO2Label(3.456)).toBe("3.5 kg CO₂");
    expect(formatCO2Label(15)).toBe("15.0 kg CO₂");
  });
});

describe("categoriseReceiptText()", () => {
  it("identifies fuel receipts", () => {
    expect(categoriseReceiptText("BPCL Petrol Pump - 5L Petrol")).toBe("fuel");
    expect(categoriseReceiptText("Diesel refill at pump")).toBe("fuel");
  });

  it("identifies electricity bills", () => {
    expect(categoriseReceiptText("TPDDL Electricity Bill - 230 Units")).toBe("electricity");
    expect(categoriseReceiptText("Power bill: 450 kWh consumed")).toBe("electricity");
  });

  it("identifies transit receipts", () => {
    expect(categoriseReceiptText("Delhi Metro - Day Pass Ticket")).toBe("transport");
    expect(categoriseReceiptText("DTC Bus ticket purchase")).toBe("transport");
  });

  it("identifies grocery receipts", () => {
    expect(categoriseReceiptText("Fresh Vegetables - Kirana Store")).toBe("grocery");
  });

  it("identifies food/restaurant receipts", () => {
    expect(categoriseReceiptText("Domino's Restaurant - Pizza")).toBe("food");
    expect(categoriseReceiptText("Coffee Day food court bill")).toBe("food");
  });

  it("identifies shopping receipts", () => {
    expect(categoriseReceiptText("Westside Mall - Clothes & Shirt")).toBe("shopping");
  });

  it("returns 'other' for unrecognized receipts", () => {
    expect(categoriseReceiptText("Invoice #12345")).toBe("other");
  });
});
