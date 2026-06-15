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
  
  // Carbon Memory Book
  memoryBook: {
    stories: Array<{
      id: string;
      date: string;         // ISO date string
      chapterNumber: number;
      decisions: Array<{
        moment: string;     // "breakfast", "commute", etc
        choice: string;     // label
        impactType: "eco"|"moderate"|"high";
        carbonKg: number;
      }>;
      totalCarbonKg: number;
      planetMood: string;
    }>;
    receipts: Array<{
      id: string;
      date: string;
      receiptType: string;
      merchantName: string;
      totalCO2: number;
      impactLevel: string;
      items: Array<{name: string; estimatedCO2: number}>;
    }>;
    totalStoryCO2: number;     // cumulative from all stories
    totalReceiptCO2: number;   // cumulative from all receipts
    totalCO2Saved: number;     // eco choices CO2 saved
    ecoChoicesCount: number;
    highChoicesCount: number;
    streakDays: number;        // consecutive eco days
  };

  // Missions
  activeMissions: Array<{
    id: string;
    title: string;
    description: string;
    emoji: string;
    targetType: "eco_choices"|"receipt_upload"|"story_complete";
    targetCount: number;
    currentCount: number;
    completed: boolean;
    reward: string;
  }>;

  // Achievements
  achievements: Array<{
    id: string;
    title: string;
    emoji: string;
    description: string;
    unlockedAt: string | null;
  }>;
  pendingAchievements: Array<{
    id: string;
    title: string;
    emoji: string;
    description: string;
    unlockedAt: string | null;
  }>;
  
  // Actions
  setCity: (city: string) => void;
  setTransport: (t: UserProfile["transport"]) => void;
  setDiet: (d: UserProfile["diet"]) => void;
  setFlights: (f: UserProfile["flights"]) => void;
  completeOnboarding: () => void;
  advanceChapter: () => void;
  applyDecision: (choice: string, impactType: "eco" | "moderate" | "high", carbonDelta: number) => void;
  resetSession: () => void;

  // Memory Book Actions
  addStoryToMemoryBook: (story: Omit<SessionState["memoryBook"]["stories"][0], "id" | "date">) => void;
  addReceiptToMemoryBook: (receipt: Omit<SessionState["memoryBook"]["receipts"][0], "id" | "date">) => void;
  updateMissionProgress: (targetType: string) => void;
  checkAndUnlockAchievements: () => void;
  clearPendingAchievements: () => void;
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
  memoryBook: {
    stories: [],
    receipts: [],
    totalStoryCO2: 0,
    totalReceiptCO2: 0,
    totalCO2Saved: 0,
    ecoChoicesCount: 0,
    highChoicesCount: 0,
    streakDays: 0,
  },
  activeMissions: [
    {
      id: "mission-1",
      title: "Green Breakfast",
      description: "Choose a plant-based meal",
      emoji: "🥗",
      targetType: "eco_choices" as const,
      targetCount: 1,
      currentCount: 0,
      completed: false,
      reward: "Sprout badge"
    },
    {
      id: "mission-2", 
      title: "Receipt Detective",
      description: "Analyze one receipt",
      emoji: "🔍",
      targetType: "receipt_upload" as const,
      targetCount: 1,
      currentCount: 0,
      completed: false,
      reward: "Detective badge"
    },
    {
      id: "mission-3",
      title: "Story Keeper",
      description: "Complete a full story",
      emoji: "📖",
      targetType: "story_complete" as const,
      targetCount: 1,
      currentCount: 0,
      completed: false,
      reward: "Explorer badge"
    },
  ],
  achievements: [
    { id:"first-green", title:"First Green Choice", 
      emoji:"🌱", description:"Make your first eco decision",
      unlockedAt: null },
    { id:"receipt-detective", title:"Carbon Detective",
      emoji:"🔍", description:"Analyze your first receipt",
      unlockedAt: null },
    { id:"story-complete", title:"Story Keeper",
      emoji:"📖", description:"Complete your first story",
      unlockedAt: null },
    { id:"metro-master", title:"Metro Master",
      emoji:"🚇", description:"Choose public transport 3 times",
      unlockedAt: null },
    { id:"plant-pro", title:"Plant-Based Pro",
      emoji:"🥗", description:"Choose plant-based meals 3 times",
      unlockedAt: null },
    { id:"garden-guardian", title:"Garden Guardian",
      emoji:"🌳", description:"Grow 5 plants in your garden",
      unlockedAt: null },
    { id:"aqi-protector", title:"AQI Protector",
      emoji:"🌍", description:"Make 10 eco choices total",
      unlockedAt: null },
    { id:"sustainability-hero", title:"Sustainability Hero",
      emoji:"♻️", description:"Complete both chapters with all eco choices",
      unlockedAt: null },
  ],
  pendingAchievements: [],
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

  resetSession: () => set((state) => ({ 
    ...defaultState,
    memoryBook: state.memoryBook,
    activeMissions: state.activeMissions,
    achievements: state.achievements
  })),

  addStoryToMemoryBook: (story) => set((state) => {
    const newStory = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      ...story
    };
    const newMemoryBook = {
      ...state.memoryBook,
      stories: [...state.memoryBook.stories, newStory],
      totalStoryCO2: state.memoryBook.totalStoryCO2 + story.totalCarbonKg,
      ecoChoicesCount: state.memoryBook.ecoChoicesCount + 
        story.decisions.filter(d => d.impactType === "eco").length,
      highChoicesCount: state.memoryBook.highChoicesCount + 
        story.decisions.filter(d => d.impactType === "high").length,
    };
    return { memoryBook: newMemoryBook };
  }),

  addReceiptToMemoryBook: (receipt) => set((state) => ({
    memoryBook: {
      ...state.memoryBook,
      receipts: [...state.memoryBook.receipts, {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...receipt
      }],
      totalReceiptCO2: state.memoryBook.totalReceiptCO2 + receipt.totalCO2
    }
  })),

  updateMissionProgress: (targetType) => set((state) => {
    const newMissions = state.activeMissions.map((mission) => {
      if (mission.targetType === targetType && !mission.completed) {
        const newCount = mission.currentCount + 1;
        return {
          ...mission,
          currentCount: newCount,
          completed: newCount >= mission.targetCount
        };
      }
      return mission;
    });
    return { activeMissions: newMissions };
  }),

  checkAndUnlockAchievements: () => set((state) => {
    const now = new Date().toISOString();
    const newlyUnlocked: typeof state.pendingAchievements = [];
    
    const newAchievements = state.achievements.map((ach) => {
      if (ach.unlockedAt) return ach;
      
      let unlock = false;
      switch (ach.id) {
        case "first-green":
          unlock = state.memoryBook.ecoChoicesCount >= 1;
          break;
        case "receipt-detective":
          unlock = state.memoryBook.receipts.length >= 1;
          break;
        case "story-complete":
          unlock = state.memoryBook.stories.length >= 1;
          break;
        case "metro-master":
          const publicChoices = state.memoryBook.stories.flatMap(s => s.decisions).filter(d => d.choice.toLowerCase().includes("metro") || d.choice.toLowerCase().includes("public") || d.choice.toLowerCase().includes("bus"));
          unlock = publicChoices.length >= 3;
          break;
        case "plant-pro":
          const plantChoices = state.memoryBook.stories.flatMap(s => s.decisions).filter(d => d.choice.toLowerCase().includes("plant") || d.choice.toLowerCase().includes("vegan"));
          unlock = plantChoices.length >= 3;
          break;
        case "garden-guardian":
          break;
        case "aqi-protector":
          unlock = state.memoryBook.ecoChoicesCount >= 10;
          break;
        case "sustainability-hero":
          unlock = state.memoryBook.stories.some(s => s.decisions.length > 0 && s.decisions.every(d => d.impactType === "eco"));
          break;
      }
      
      if (unlock) {
        const unlockedAch = { ...ach, unlockedAt: now };
        newlyUnlocked.push(unlockedAch);
        return unlockedAch;
      }
      return ach;
    });
    
    return { 
      achievements: newAchievements,
      pendingAchievements: [...state.pendingAchievements, ...newlyUnlocked]
    };
  }),

  clearPendingAchievements: () => set({ pendingAchievements: [] })
}));
