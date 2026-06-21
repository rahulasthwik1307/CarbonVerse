import { describe, it, expect } from "vitest";

// ─── Achievement unlock logic mirrored from session-store.ts ──────────────────

interface Achievement {
  id: string;
  title: string;
  unlockedAt: string | null;
}

interface StoryDecision {
  moment?: string;
  choice: string;
  impactType: "eco" | "moderate" | "high";
  carbonKg: number;
}

interface StoryEntry {
  decisions: StoryDecision[];
  totalCarbonKg: number;
}

interface MemoryBook {
  stories: StoryEntry[];
  receipts: Array<{ id: string }>;
  ecoChoicesCount: number;
}

function computeAchievementUnlocks(
  achievements: Achievement[],
  memoryBook: MemoryBook
): Achievement[] {
  const now = "2024-01-01T00:00:00.000Z";

  return achievements.map((ach) => {
    if (ach.unlockedAt) return ach;

    let unlock = false;
    switch (ach.id) {
      case "first-green":
        unlock = memoryBook.ecoChoicesCount >= 1;
        break;
      case "receipt-detective":
        unlock = memoryBook.receipts.length >= 1;
        break;
      case "story-complete":
        unlock = memoryBook.stories.length >= 1;
        break;
      case "metro-master": {
        const publicChoices = memoryBook.stories
          .flatMap((s) => s.decisions)
          .filter(
            (d) =>
              d.choice.toLowerCase().includes("metro") ||
              d.choice.toLowerCase().includes("walk")
          );
        unlock = publicChoices.length >= 3;
        break;
      }
      case "plant-pro": {
        const plantChoices = memoryBook.stories
          .flatMap((s) => s.decisions)
          .filter(
            (d) =>
              d.impactType === "eco" &&
              (d.choice.toLowerCase().includes("plant") ||
                d.choice.toLowerCase().includes("tiffin") ||
                d.choice.toLowerCase().includes("canteen"))
          );
        unlock = plantChoices.length >= 3;
        break;
      }
      case "garden-guardian":
        unlock = memoryBook.ecoChoicesCount >= 5;
        break;
      case "aqi-protector":
        unlock = memoryBook.ecoChoicesCount >= 10;
        break;
      case "sustainability-hero": {
        if (memoryBook.stories.length >= 1) {
          const recentStory = memoryBook.stories[memoryBook.stories.length - 1];
          unlock =
            recentStory.decisions.length > 0 &&
            recentStory.decisions.every((d) => d.impactType === "eco");
        }
        break;
      }
    }

    return unlock ? { ...ach, unlockedAt: now } : ach;
  });
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first-green", title: "First Green Choice", unlockedAt: null },
  { id: "receipt-detective", title: "Carbon Detective", unlockedAt: null },
  { id: "story-complete", title: "Story Keeper", unlockedAt: null },
  { id: "metro-master", title: "Metro Master", unlockedAt: null },
  { id: "plant-pro", title: "Plant-Based Pro", unlockedAt: null },
  { id: "garden-guardian", title: "Garden Guardian", unlockedAt: null },
  { id: "aqi-protector", title: "AQI Protector", unlockedAt: null },
  { id: "sustainability-hero", title: "Sustainability Hero", unlockedAt: null },
];

const emptyMemory: MemoryBook = {
  stories: [],
  receipts: [],
  ecoChoicesCount: 0,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Achievement: first-green", () => {
  it("locks when ecoChoicesCount is 0", () => {
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, emptyMemory);
    expect(result.find((a) => a.id === "first-green")!.unlockedAt).toBeNull();
  });

  it("unlocks when ecoChoicesCount >= 1", () => {
    const memory = { ...emptyMemory, ecoChoicesCount: 1 };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "first-green")!.unlockedAt).not.toBeNull();
  });
});

describe("Achievement: receipt-detective", () => {
  it("locks when no receipts", () => {
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, emptyMemory);
    expect(result.find((a) => a.id === "receipt-detective")!.unlockedAt).toBeNull();
  });

  it("unlocks after 1 receipt is added", () => {
    const memory = { ...emptyMemory, receipts: [{ id: "r1" }] };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "receipt-detective")!.unlockedAt).not.toBeNull();
  });
});

describe("Achievement: story-complete", () => {
  it("unlocks after completing 1 story", () => {
    const memory: MemoryBook = {
      ...emptyMemory,
      stories: [{ decisions: [{ choice: "Metro", impactType: "eco", carbonKg: 0.1 }], totalCarbonKg: 0.1 }],
    };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "story-complete")!.unlockedAt).not.toBeNull();
  });
});

describe("Achievement: metro-master", () => {
  it("requires 3 metro/walk choices to unlock", () => {
    const decisions: StoryDecision[] = [
      { choice: "Take the Metro", impactType: "eco", carbonKg: 0.05 },
      { choice: "Walk to office", impactType: "eco", carbonKg: 0.0 },
      { choice: "Metro to meeting", impactType: "eco", carbonKg: 0.05 },
    ];
    const memory: MemoryBook = {
      ...emptyMemory,
      stories: [{ decisions, totalCarbonKg: 0.1 }],
    };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "metro-master")!.unlockedAt).not.toBeNull();
  });

  it("does NOT unlock with only 2 metro choices", () => {
    const decisions: StoryDecision[] = [
      { choice: "Take the Metro", impactType: "eco", carbonKg: 0.05 },
      { choice: "Walk to office", impactType: "eco", carbonKg: 0.0 },
    ];
    const memory: MemoryBook = {
      ...emptyMemory,
      stories: [{ decisions, totalCarbonKg: 0.05 }],
    };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "metro-master")!.unlockedAt).toBeNull();
  });
});

describe("Achievement: garden-guardian", () => {
  it("unlocks at 5 eco choices", () => {
    const memory = { ...emptyMemory, ecoChoicesCount: 5 };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "garden-guardian")!.unlockedAt).not.toBeNull();
  });

  it("does NOT unlock at 4 eco choices", () => {
    const memory = { ...emptyMemory, ecoChoicesCount: 4 };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "garden-guardian")!.unlockedAt).toBeNull();
  });
});

describe("Achievement: sustainability-hero", () => {
  it("unlocks when ALL decisions in the latest story are eco", () => {
    const allEcoDecisions: StoryDecision[] = [
      { choice: "Plant-based lunch", impactType: "eco", carbonKg: 0.1 },
      { choice: "Take the Metro", impactType: "eco", carbonKg: 0.05 },
      { choice: "Read a book", impactType: "eco", carbonKg: 0.0 },
    ];
    const memory: MemoryBook = {
      ...emptyMemory,
      stories: [{ decisions: allEcoDecisions, totalCarbonKg: 0.15 }],
    };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "sustainability-hero")!.unlockedAt).not.toBeNull();
  });

  it("does NOT unlock when any decision is not eco", () => {
    const mixedDecisions: StoryDecision[] = [
      { choice: "Plant-based lunch", impactType: "eco", carbonKg: 0.1 },
      { choice: "Drive to work", impactType: "high", carbonKg: 2.5 },
    ];
    const memory: MemoryBook = {
      ...emptyMemory,
      stories: [{ decisions: mixedDecisions, totalCarbonKg: 2.6 }],
    };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "sustainability-hero")!.unlockedAt).toBeNull();
  });

  it("does NOT unlock when story has 0 decisions", () => {
    const memory: MemoryBook = {
      ...emptyMemory,
      stories: [{ decisions: [], totalCarbonKg: 0 }],
    };
    const result = computeAchievementUnlocks(ALL_ACHIEVEMENTS, memory);
    expect(result.find((a) => a.id === "sustainability-hero")!.unlockedAt).toBeNull();
  });

  it("does NOT re-unlock an already-unlocked achievement", () => {
    const alreadyUnlocked: Achievement[] = [
      { id: "sustainability-hero", title: "Sustainability Hero", unlockedAt: "2024-01-01T00:00:00.000Z" },
    ];
    const memory: MemoryBook = {
      ...emptyMemory,
      ecoChoicesCount: 20,
      stories: [{ decisions: [], totalCarbonKg: 0 }],
    };
    const result = computeAchievementUnlocks(alreadyUnlocked, memory);
    // timestamp should be unchanged (not reset/overwritten)
    expect(result[0].unlockedAt).toBe("2024-01-01T00:00:00.000Z");
  });
});
