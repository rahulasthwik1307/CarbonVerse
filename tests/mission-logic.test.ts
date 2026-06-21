import { describe, it, expect } from "vitest";

// ─── Mission completion logic mirrored from session-store.ts ──────────────────

function isMissionCompletedByChoice(emoji: string, title: string, choice: string): boolean {
  const normChoice = choice.toLowerCase();
  const normTitle = title.toLowerCase();

  if (emoji === "🚶" || emoji === "🚆" || emoji === "🚇") {
    return (
      normChoice.includes("metro") ||
      normChoice.includes("walk") ||
      normChoice.includes("cycle") ||
      normChoice.includes("transit")
    );
  }

  if (emoji === "🥗" || emoji === "🥦" || emoji === "🍔" || emoji === "🥘") {
    return (
      normChoice.includes("plant") ||
      normChoice.includes("tiffin") ||
      normChoice.includes("canteen") ||
      normChoice.includes("cook at home") ||
      normChoice.includes("vegetarian") ||
      normChoice.includes("dhaba")
    );
  }

  if (emoji === "🛒" || emoji === "🛍️" || emoji === "♻️" || emoji === "🛠️" || emoji === "⏳") {
    return (
      normChoice.includes("kirana") ||
      normChoice.includes("local") ||
      normChoice.includes("market") ||
      normChoice.includes("cook at home")
    );
  }

  if (emoji === "🔌" || emoji === "❄️" || emoji === "☀️" || emoji === "👕" || emoji === "📚") {
    return (
      normChoice.includes("read") ||
      normChoice.includes("meditate") ||
      normChoice.includes("stream")
    );
  }

  if (normTitle.includes("breakfast") && normChoice.includes("breakfast")) return true;
  if (normTitle.includes("transit") && normChoice.includes("metro")) return true;
  if (normTitle.includes("walk") && normChoice.includes("walk")) return true;

  return false;
}

// ─── Mission progress logic ────────────────────────────────────────────────

interface Mission {
  id: string;
  targetType: string;
  currentCount: number;
  targetCount: number;
  completed: boolean;
}

function applyMissionProgress(missions: Mission[], targetType: string): Mission[] {
  return missions.map((mission) => {
    if (mission.targetType === targetType && !mission.completed) {
      const newCount = mission.currentCount + 1;
      const completed = newCount >= mission.targetCount;
      return { ...mission, currentCount: newCount, completed };
    }
    return mission;
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("isMissionCompletedByChoice() — transit missions 🚇", () => {
  const transitMission = { emoji: "🚇", title: "Commute Champion" };

  it("matches 'metro' choice", () => {
    expect(isMissionCompletedByChoice(transitMission.emoji, transitMission.title, "Take the Metro")).toBe(true);
  });

  it("matches 'walk' choice", () => {
    expect(isMissionCompletedByChoice(transitMission.emoji, transitMission.title, "Walk to office")).toBe(true);
  });

  it("matches 'cycle' choice", () => {
    expect(isMissionCompletedByChoice(transitMission.emoji, transitMission.title, "Cycle to work")).toBe(true);
  });

  it("does NOT match car/cab choices", () => {
    expect(isMissionCompletedByChoice(transitMission.emoji, transitMission.title, "Book a cab")).toBe(false);
    expect(isMissionCompletedByChoice(transitMission.emoji, transitMission.title, "Drive to office")).toBe(false);
  });
});

describe("isMissionCompletedByChoice() — food missions 🥗", () => {
  const foodMission = { emoji: "🥗", title: "Green Plate" };

  it("matches 'plant' choice", () => {
    expect(isMissionCompletedByChoice(foodMission.emoji, foodMission.title, "Choose plant-based lunch")).toBe(true);
  });

  it("matches 'tiffin' choice", () => {
    expect(isMissionCompletedByChoice(foodMission.emoji, foodMission.title, "Bring tiffin from home")).toBe(true);
  });

  it("matches 'canteen' choice", () => {
    expect(isMissionCompletedByChoice(foodMission.emoji, foodMission.title, "Eat in canteen")).toBe(true);
  });

  it("matches 'vegetarian' choice", () => {
    expect(isMissionCompletedByChoice(foodMission.emoji, foodMission.title, "Order vegetarian meal")).toBe(true);
  });

  it("does NOT match meat/fast-food choices", () => {
    expect(isMissionCompletedByChoice(foodMission.emoji, foodMission.title, "Order chicken biryani")).toBe(false);
    expect(isMissionCompletedByChoice(foodMission.emoji, foodMission.title, "Burger from Zomato")).toBe(false);
  });
});

describe("isMissionCompletedByChoice() — shopping missions 🛒", () => {
  const shopMission = { emoji: "🛒", title: "Local Buyer" };

  it("matches 'kirana' choice", () => {
    expect(isMissionCompletedByChoice(shopMission.emoji, shopMission.title, "Shop at local kirana")).toBe(true);
  });

  it("matches 'local market' choice", () => {
    expect(isMissionCompletedByChoice(shopMission.emoji, shopMission.title, "Visit local market")).toBe(true);
  });

  it("does NOT match online shopping", () => {
    expect(isMissionCompletedByChoice(shopMission.emoji, shopMission.title, "Order from Amazon")).toBe(false);
  });
});

describe("applyMissionProgress()", () => {
  const baseMissions: Mission[] = [
    { id: "m1", targetType: "receipt_upload", currentCount: 0, targetCount: 1, completed: false },
    { id: "m2", targetType: "eco_choices", currentCount: 0, targetCount: 2, completed: false },
    { id: "m3", targetType: "story_complete", currentCount: 0, targetCount: 1, completed: false },
  ];

  it("increments currentCount for matching targetType", () => {
    const result = applyMissionProgress(baseMissions, "receipt_upload");
    expect(result[0].currentCount).toBe(1);
    expect(result[1].currentCount).toBe(0); // unchanged
  });

  it("marks mission completed when count reaches target", () => {
    const result = applyMissionProgress(baseMissions, "receipt_upload");
    expect(result[0].completed).toBe(true); // targetCount was 1
  });

  it("does NOT complete mission that needs 2 actions on first progress", () => {
    const result = applyMissionProgress(baseMissions, "eco_choices");
    expect(result[1].currentCount).toBe(1);
    expect(result[1].completed).toBe(false);
  });

  it("completes multi-step mission after reaching targetCount", () => {
    const partial = applyMissionProgress(baseMissions, "eco_choices");
    const done = applyMissionProgress(partial, "eco_choices");
    expect(done[1].currentCount).toBe(2);
    expect(done[1].completed).toBe(true);
  });

  it("does NOT update already-completed missions", () => {
    const completed: Mission[] = [
      { id: "m1", targetType: "receipt_upload", currentCount: 1, targetCount: 1, completed: true },
    ];
    const result = applyMissionProgress(completed, "receipt_upload");
    expect(result[0].currentCount).toBe(1); // still 1, not 2
  });

  it("does NOT update missions with different targetType", () => {
    const result = applyMissionProgress(baseMissions, "story_complete");
    expect(result[0].currentCount).toBe(0); // receipt_upload unchanged
    expect(result[1].currentCount).toBe(0); // eco_choices unchanged
    expect(result[2].currentCount).toBe(1); // story_complete incremented
  });
});
