import { describe, it, expect } from "vitest";

// ─── Helpers extracted from session-store.ts ────────────────────────────────

const clamp = (val: number) => Math.max(0, Math.min(100, val));

type ImpactType = "eco" | "moderate" | "high";

interface WorldState {
  skyQuality: number;
  treeDensity: number;
  trafficLevel: number;
  birdCount: number;
  greenCoverage: number;
}

function applyImpactToWorld(world: WorldState, impactType: ImpactType): WorldState {
  let { skyQuality, treeDensity, trafficLevel, birdCount, greenCoverage } = world;

  if (impactType === "eco") {
    skyQuality += 8;
    treeDensity += 6;
    trafficLevel -= 5;
    birdCount += 10;
  } else if (impactType === "moderate") {
    skyQuality -= 2;
    trafficLevel += 3;
  } else if (impactType === "high") {
    skyQuality -= 10;
    treeDensity -= 3;
    trafficLevel += 8;
    birdCount -= 8;
  }

  return {
    skyQuality: clamp(skyQuality),
    treeDensity: clamp(treeDensity),
    trafficLevel: clamp(trafficLevel),
    birdCount: clamp(birdCount),
    greenCoverage: clamp(greenCoverage),
  };
}

type PlanetMood = "Thriving" | "Stable" | "Recovering" | "Under Stress";

function computePlanetMood(
  world: WorldState,
  decisions: Array<{ impactType: ImpactType }>
): PlanetMood {
  const { skyQuality, treeDensity, greenCoverage } = world;

  if (skyQuality < 30 || treeDensity < 25) return "Under Stress";
  if (skyQuality > 80 && greenCoverage > 75) return "Thriving";

  const lastTwo = decisions.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every((d) => d.impactType === "eco")) {
    return "Recovering";
  }
  return "Stable";
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("clamp()", () => {
  it("keeps values within [0, 100]", () => {
    expect(clamp(50)).toBe(50);
    expect(clamp(-5)).toBe(0);
    expect(clamp(110)).toBe(100);
    expect(clamp(0)).toBe(0);
    expect(clamp(100)).toBe(100);
  });
});

describe("applyImpactToWorld()", () => {
  const baseWorld: WorldState = {
    skyQuality: 65,
    treeDensity: 60,
    trafficLevel: 40,
    birdCount: 50,
    greenCoverage: 55,
  };

  it("eco choice improves sky, trees, birds; reduces traffic", () => {
    const result = applyImpactToWorld(baseWorld, "eco");
    expect(result.skyQuality).toBe(73);   // 65 + 8
    expect(result.treeDensity).toBe(66);  // 60 + 6
    expect(result.trafficLevel).toBe(35); // 40 - 5
    expect(result.birdCount).toBe(60);    // 50 + 10
    expect(result.greenCoverage).toBe(55); // unchanged
  });

  it("moderate choice slightly lowers sky and raises traffic", () => {
    const result = applyImpactToWorld(baseWorld, "moderate");
    expect(result.skyQuality).toBe(63);   // 65 - 2
    expect(result.trafficLevel).toBe(43); // 40 + 3
    expect(result.treeDensity).toBe(60);  // unchanged
    expect(result.birdCount).toBe(50);    // unchanged
  });

  it("high-impact choice degrades sky, trees, birds; spikes traffic", () => {
    const result = applyImpactToWorld(baseWorld, "high");
    expect(result.skyQuality).toBe(55);   // 65 - 10
    expect(result.treeDensity).toBe(57);  // 60 - 3
    expect(result.trafficLevel).toBe(48); // 40 + 8
    expect(result.birdCount).toBe(42);    // 50 - 8
  });

  it("clamps values — eco cannot push beyond 100", () => {
    const almostMaxWorld: WorldState = {
      skyQuality: 96,
      treeDensity: 96,
      trafficLevel: 5,
      birdCount: 94,
      greenCoverage: 55,
    };
    const result = applyImpactToWorld(almostMaxWorld, "eco");
    expect(result.skyQuality).toBe(100);
    expect(result.treeDensity).toBe(100);
    expect(result.trafficLevel).toBe(0);
    expect(result.birdCount).toBe(100);
  });

  it("clamps values — high cannot push below 0", () => {
    const lowWorld: WorldState = {
      skyQuality: 5,
      treeDensity: 2,
      trafficLevel: 95,
      birdCount: 4,
      greenCoverage: 10,
    };
    const result = applyImpactToWorld(lowWorld, "high");
    expect(result.skyQuality).toBe(0);
    expect(result.treeDensity).toBe(0);
    expect(result.trafficLevel).toBe(100);
    expect(result.birdCount).toBe(0);
  });
});

describe("computePlanetMood()", () => {
  const stableWorld: WorldState = {
    skyQuality: 65,
    treeDensity: 60,
    trafficLevel: 40,
    birdCount: 50,
    greenCoverage: 55,
  };

  it("returns 'Stable' for average conditions", () => {
    const mood = computePlanetMood(stableWorld, [{ impactType: "moderate" }]);
    expect(mood).toBe("Stable");
  });

  it("returns 'Under Stress' when skyQuality < 30", () => {
    const stressedWorld = { ...stableWorld, skyQuality: 25 };
    const mood = computePlanetMood(stressedWorld, []);
    expect(mood).toBe("Under Stress");
  });

  it("returns 'Under Stress' when treeDensity < 25", () => {
    const stressedWorld = { ...stableWorld, treeDensity: 20 };
    const mood = computePlanetMood(stressedWorld, []);
    expect(mood).toBe("Under Stress");
  });

  it("returns 'Thriving' when sky > 80 and greenCoverage > 75", () => {
    const thrivingWorld = { ...stableWorld, skyQuality: 85, greenCoverage: 80 };
    const mood = computePlanetMood(thrivingWorld, []);
    expect(mood).toBe("Thriving");
  });

  it("returns 'Recovering' when last 2 decisions are eco", () => {
    const decisions: Array<{ impactType: ImpactType }> = [
      { impactType: "high" },
      { impactType: "eco" },
      { impactType: "eco" },
    ];
    const mood = computePlanetMood(stableWorld, decisions);
    expect(mood).toBe("Recovering");
  });

  it("does NOT recover with only 1 eco decision at end", () => {
    const decisions: Array<{ impactType: ImpactType }> = [
      { impactType: "high" },
      { impactType: "eco" },
    ];
    // last two are high + eco — not both eco
    const mood = computePlanetMood(stableWorld, decisions);
    expect(mood).toBe("Stable");
  });
});
