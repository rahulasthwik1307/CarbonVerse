import { create } from "zustand";

interface UserProfile {
  city: string;
  transport: "walk" | "cycle" | "public" | "car" | "bike" | "";
  diet: "plants" | "mixed" | "meat" | "";
  flights: "none" | "recent" | "";
}

interface SessionState {
  profile: UserProfile;
  currentChapter: number;
  worldState: {
    skyQuality: number;    // 0-100, starts 65
    treeDensity: number;   // 0-100, starts 60  
    trafficLevel: number;  // 0-100, starts 40
    birdCount: number;     // 0-100, starts 50
    greenCoverage: number; // 0-100, starts 55
    planetMood: "Thriving" | "Stable" | "Recovering" | "Under Stress";
  };
  totalCarbonDelta: number;
  decisions: Array<{
    chapter: number;
    choice: string;
    impactType: "eco" | "moderate" | "high";
    carbonDelta: number;
  }>;
  isOnboarded: boolean;
  
  // Actions
  setCity: (city: string) => void;
  setTransport: (t: UserProfile["transport"]) => void;
  setDiet: (d: UserProfile["diet"]) => void;
  setFlights: (f: UserProfile["flights"]) => void;
  completeOnboarding: () => void;
  advanceChapter: () => void;
  applyDecision: (choice: string, impactType: "eco" | "moderate" | "high", carbonDelta: number) => void;
  resetSession: () => void;
}

const defaultState = {
  profile: {
    city: "",
    transport: "" as const,
    diet: "" as const,
    flights: "" as const,
  },
  currentChapter: 1,
  worldState: {
    skyQuality: 65,
    treeDensity: 60,
    trafficLevel: 40,
    birdCount: 50,
    greenCoverage: 55,
    planetMood: "Stable" as const,
  },
  totalCarbonDelta: 0,
  decisions: [],
  isOnboarded: false,
};

const clamp = (val: number) => Math.max(0, Math.min(100, val));

export const useSessionStore = create<SessionState>((set) => ({
  ...defaultState,

  setCity: (city) => set((state) => ({ profile: { ...state.profile, city } })),
  setTransport: (transport) => set((state) => ({ profile: { ...state.profile, transport } })),
  setDiet: (diet) => set((state) => ({ profile: { ...state.profile, diet } })),
  setFlights: (flights) => set((state) => ({ profile: { ...state.profile, flights } })),
  
  completeOnboarding: () => set({ isOnboarded: true }),
  
  advanceChapter: () => set((state) => ({ currentChapter: state.currentChapter + 1 })),

  applyDecision: (choice, impactType, carbonDelta) => set((state) => {
    let { skyQuality, treeDensity, trafficLevel, birdCount, greenCoverage } = state.worldState;

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

    skyQuality = clamp(skyQuality);
    treeDensity = clamp(treeDensity);
    trafficLevel = clamp(trafficLevel);
    birdCount = clamp(birdCount);
    greenCoverage = clamp(greenCoverage);

    const newDecision = { chapter: state.currentChapter, choice, impactType, carbonDelta };
    const newDecisions = [...state.decisions, newDecision];

    let newMood: "Thriving" | "Stable" | "Recovering" | "Under Stress" = "Stable";
    
    if (skyQuality < 30 || treeDensity < 25) {
      newMood = "Under Stress";
    } else if (skyQuality > 80 && greenCoverage > 75) {
      newMood = "Thriving";
    } else {
      const lastTwo = newDecisions.slice(-2);
      if (lastTwo.length === 2 && lastTwo.every((d) => d.impactType === "eco")) {
        newMood = "Recovering";
      } else {
        newMood = "Stable";
      }
    }

    return {
      decisions: newDecisions,
      totalCarbonDelta: state.totalCarbonDelta + carbonDelta,
      worldState: {
        skyQuality,
        treeDensity,
        trafficLevel,
        birdCount,
        greenCoverage,
        planetMood: newMood,
      }
    };
  }),

  resetSession: () => set(defaultState),
}));
