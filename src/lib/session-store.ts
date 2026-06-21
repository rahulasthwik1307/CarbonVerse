import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UserProfile {
  city: string;
  transport: "walk" | "cycle" | "public" | "car" | "bike" | "";
  diet: "plants" | "mixed" | "meat" | "";
  flights: "none" | "recent" | "";
}

interface CompletedStoryData {
  decisions: Array<{
    chapter: number;
    choice: string;
    impactType: "eco" | "moderate" | "high";
    carbonDelta: number;
  }>;
  worldState: {
    skyQuality: number;
    treeDensity: number;
    trafficLevel: number;
    birdCount: number;
    greenCoverage: number;
    planetMood: "Thriving" | "Stable" | "Recovering" | "Under Stress";
  };
  totalCarbonDelta: number;
  profile: UserProfile;
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

  // Completed story snapshot for persistence across refresh/navigation
  storyCompleted: boolean;
  completedStoryData: CompletedStoryData | null;

  // Cached outcomes so back-navigation doesn't regenerate
  futureOutcome: { storyState: string; videoType: string } | null;
  gardenOutcome: { narrative: string; outcome: string } | null;

  // Hydration tracking
  _hasHydrated: boolean;
  
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
    timelineEvents: Array<{
      id: string;
      date: string;
      type: "story_completed" | "receipt_added" | "receipt_deleted" | "achievement_earned";
      title: string;
      carbonDelta?: number;
    }>;
  };

  // Coach
  coach: {
    recommendations: Array<{
      id: string;
      title: string;
      saving: string;
      difficulty: string;
      reason: string;
      emoji: string;
      category: "Transport" | "Food" | "Shopping" | "Electricity";
    }>;
    isCompleted: boolean;
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
    completedAt?: string;
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
  pendingMissions: Array<{
    id: string;
    title: string;
    emoji: string;
    description: string;
  }>;
  verdContext: {
    lastReceiptType: string | null;
    lastReceiptCO2: number | null;
    totalReceiptsAnalyzed: number;
    suggestedActions: string[];
  };
  
  // Actions
  setCity: (city: string) => void;
  setTransport: (t: UserProfile["transport"]) => void;
  setDiet: (d: UserProfile["diet"]) => void;
  setFlights: (f: UserProfile["flights"]) => void;
  completeOnboarding: () => void;
  advanceChapter: () => void;
  applyDecision: (choice: string, impactType: "eco" | "moderate" | "high", carbonDelta: number) => void;
  resetSession: () => void;

  // Story lifecycle actions
  completeStory: () => void;
  setFutureOutcome: (outcome: { storyState: string; videoType: string }) => void;
  setGardenOutcome: (outcome: { narrative: string; outcome: string }) => void;
  setHasHydrated: (v: boolean) => void;

  // Memory Book Actions
  addStoryToMemoryBook: (story: Omit<SessionState["memoryBook"]["stories"][0], "id" | "date">) => void;
  addReceiptToMemoryBook: (receipt: Omit<SessionState["memoryBook"]["receipts"][0], "id" | "date">) => void;
  updateMissionProgress: (targetType: string) => void;
  checkAndUnlockAchievements: () => void;
  clearPendingAchievements: () => void;
  clearPendingMissions: () => void;
  generateNewMissions: () => void;
  deleteReceipt: (id: string) => void;
  setCoachRecommendations: (actions: SessionState["coach"]["recommendations"]) => void;
  acceptCoachPlan: (actionIds: string[]) => void;
  updateVerdContext: (patch: Partial<SessionState["verdContext"]>) => void;
  acceptDetectiveMission: (mission: { id: string; title: string; emoji: string; description: string; targetType: string }) => void;
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
  storyCompleted: false,
  completedStoryData: null,
  futureOutcome: null,
  gardenOutcome: null,
  _hasHydrated: false,
  memoryBook: {
    stories: [],
    receipts: [],
    totalStoryCO2: 0,
    totalReceiptCO2: 0,
    totalCO2Saved: 0,
    ecoChoicesCount: 0,
    highChoicesCount: 0,
    streakDays: 0,
    timelineEvents: [],
  },
  coach: {
    recommendations: [],
    isCompleted: false,
  },
  verdContext: {
    lastReceiptType: null,
    lastReceiptCO2: null,
    totalReceiptsAnalyzed: 0,
    suggestedActions: [],
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
  pendingMissions: [],
};

const clamp = (val: number) => Math.max(0, Math.min(100, val));

const isMissionCompletedByChoice = (emoji: string, title: string, choice: string): boolean => {
  const normChoice = choice.toLowerCase();
  const normTitle = title.toLowerCase();

  // If emoji is transit/walk
  if (emoji === "🚶" || emoji === "🚆" || emoji === "🚇") {
    return normChoice.includes("metro") || normChoice.includes("walk") || normChoice.includes("cycle") || normChoice.includes("transit");
  }

  // If emoji is food/diet
  if (emoji === "🥗" || emoji === "🥦" || emoji === "🍔" || emoji === "🥘") {
    return normChoice.includes("plant") || normChoice.includes("tiffin") || normChoice.includes("canteen") || normChoice.includes("cook at home") || normChoice.includes("vegetarian") || normChoice.includes("dhaba");
  }

  // If shopping/local
  if (emoji === "🛒" || emoji === "🛍️" || emoji === "♻️" || emoji === "🛠️" || emoji === "⏳") {
    return normChoice.includes("kirana") || normChoice.includes("local") || normChoice.includes("market") || normChoice.includes("cook at home");
  }

  // If electricity/home/energy
  if (emoji === "🔌" || emoji === "❄️" || emoji === "☀️" || emoji === "👕" || emoji === "📚") {
    return normChoice.includes("read") || normChoice.includes("meditate") || normChoice.includes("stream");
  }

  // Fallback keyword matching
  if (normTitle.includes("breakfast") && normChoice.includes("breakfast")) return true;
  if (normTitle.includes("transit") && normChoice.includes("metro")) return true;
  if (normTitle.includes("walk") && normChoice.includes("walk")) return true;
  
  return false;
};

const getUnlockedAchievementsState = (state: any) => {
  const now = new Date().toISOString();
  const newlyUnlocked: any[] = [];
  
  const newAchievements = state.achievements.map((ach: any) => {
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
      case "metro-master": {
        const publicChoices = state.memoryBook.stories.flatMap((s: any) => s.decisions)
          .filter((d: any) => d.choice.toLowerCase().includes("metro") || d.choice.toLowerCase().includes("walk"));
        unlock = publicChoices.length >= 3;
        break;
      }
      case "plant-pro": {
        const plantChoices = state.memoryBook.stories.flatMap((s: any) => s.decisions)
          .filter((d: any) => d.impactType === "eco" && (d.choice.toLowerCase().includes("plant") || d.choice.toLowerCase().includes("tiffin") || d.choice.toLowerCase().includes("canteen")));
        unlock = plantChoices.length >= 3;
        break;
      }
      case "garden-guardian":
        unlock = state.memoryBook.ecoChoicesCount >= 5;
        break;
      case "aqi-protector":
        unlock = state.memoryBook.ecoChoicesCount >= 10;
        break;
      case "sustainability-hero": {
        if (state.memoryBook.stories.length >= 1) {
          const recentStory = state.memoryBook.stories[state.memoryBook.stories.length - 1];
          unlock = recentStory.decisions.length > 0 && recentStory.decisions.every((d: any) => d.impactType === "eco");
        }
        break;
      }
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
    newlyUnlocked
  };
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
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

    // Demo Mode Mission Completion logic
    const nowStr = new Date().toISOString();
    const newlyCompletedMissions: typeof state.activeMissions = [];

    const newMissions = state.activeMissions.map((mission) => {
      if (!mission.completed && isMissionCompletedByChoice(mission.emoji, mission.title, choice)) {
        const completedMission = {
          ...mission,
          completed: true,
          completedAt: nowStr
        };
        newlyCompletedMissions.push(completedMission);
        return completedMission;
      }
      return mission;
    });

    const missionTimelineEvents = newlyCompletedMissions.map(m => ({
      id: crypto.randomUUID(),
      date: nowStr,
      type: "achievement_earned" as const,
      title: `Completed Mission: ${m.title}`,
      carbonDelta: 0
    }));

    const activeMissionsRemaining = newMissions.filter(m => !m.completed);

    const tempState = {
      ...state,
      decisions: newDecisions,
      totalCarbonDelta: state.totalCarbonDelta + carbonDelta,
      worldState: {
        skyQuality,
        treeDensity,
        trafficLevel,
        birdCount,
        greenCoverage,
        planetMood: newMood,
      },
      activeMissions: activeMissionsRemaining,
      memoryBook: {
        ...state.memoryBook,
        timelineEvents: [
          ...state.memoryBook.timelineEvents,
          ...missionTimelineEvents
        ]
      }
    };

    const achResult = getUnlockedAchievementsState(tempState);
    const now = new Date().toISOString();
    const finalTimelineEvents = [
      ...tempState.memoryBook.timelineEvents,
      ...achResult.newlyUnlocked.map(ach => ({
        id: crypto.randomUUID(),
        date: now,
        type: "achievement_earned" as const,
        title: `Earned ${ach.title} Badge`,
        carbonDelta: 0
      }))
    ];

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
      },
      activeMissions: activeMissionsRemaining,
      achievements: achResult.achievements,
      pendingAchievements: [...state.pendingAchievements, ...achResult.newlyUnlocked],
      pendingMissions: [
        ...state.pendingMissions,
        ...newlyCompletedMissions.map(m => ({
          id: m.id,
          title: m.title,
          emoji: m.emoji,
          description: m.description
        }))
      ],
      memoryBook: {
        ...state.memoryBook,
        timelineEvents: finalTimelineEvents
      }
    };
  }),

  resetSession: () => set((state) => ({ 
    ...defaultState,
    _hasHydrated: true, // keep hydrated after reset
    isOnboarded: state.isOnboarded, // keep onboarding status
    profile: state.profile, // keep user profile
    memoryBook: state.memoryBook,
    activeMissions: state.activeMissions,
    achievements: state.achievements,
    coach: state.coach,
    verdContext: state.verdContext,
    // Clear story-specific cached data
    storyCompleted: false,
    completedStoryData: null,
    futureOutcome: null,
    gardenOutcome: null,
  })),

  completeStory: () => set((state) => ({
    storyCompleted: true,
    completedStoryData: {
      decisions: state.decisions,
      worldState: state.worldState,
      totalCarbonDelta: state.totalCarbonDelta,
      profile: state.profile,
    },
  })),

  setFutureOutcome: (outcome) => set({ futureOutcome: outcome }),
  setGardenOutcome: (outcome) => set({ gardenOutcome: outcome }),
  setHasHydrated: (v) => set({ _hasHydrated: v }),

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
      timelineEvents: [
        ...state.memoryBook.timelineEvents,
        {
          id: crypto.randomUUID(),
          date: newStory.date,
          type: "story_completed" as const,
          title: `Story Run #${state.memoryBook.stories.length + 1} Completed`,
          carbonDelta: story.totalCarbonKg
        }
      ]
    };
    return { memoryBook: newMemoryBook };
  }),

  addReceiptToMemoryBook: (receipt) => set((state) => ({
    totalCarbonDelta: state.totalCarbonDelta + receipt.totalCO2,
    memoryBook: {
      ...state.memoryBook,
      receipts: [...state.memoryBook.receipts, {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...receipt
      }],
      totalReceiptCO2: state.memoryBook.totalReceiptCO2 + receipt.totalCO2,
      timelineEvents: [
        ...state.memoryBook.timelineEvents,
        {
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          type: "receipt_added" as const,
          title: `Added ${receipt.merchantName} Receipt`,
          carbonDelta: receipt.totalCO2
        }
      ]
    }
  })),

  updateMissionProgress: (targetType) => set((state) => {
    const nowStr = new Date().toISOString();
    const newlyCompletedMissions: typeof state.activeMissions = [];

    const newMissions = state.activeMissions.map((mission) => {
      if (mission.targetType === targetType && !mission.completed) {
        const newCount = mission.currentCount + 1;
        const completed = newCount >= mission.targetCount;
        const completedMission = {
          ...mission,
          currentCount: newCount,
          completed,
          completedAt: completed ? nowStr : undefined
        };
        if (completed) {
          newlyCompletedMissions.push(completedMission);
        }
        return completedMission;
      }
      return mission;
    });

    const missionTimelineEvents = newlyCompletedMissions.map(m => ({
      id: crypto.randomUUID(),
      date: nowStr,
      type: "achievement_earned" as const,
      title: `Completed Mission: ${m.title}`,
      carbonDelta: 0
    }));

    const activeMissionsRemaining = newMissions.filter(m => !m.completed);

    const tempState = {
      ...state,
      activeMissions: activeMissionsRemaining,
      memoryBook: {
        ...state.memoryBook,
        timelineEvents: [
          ...state.memoryBook.timelineEvents,
          ...missionTimelineEvents
        ]
      }
    };

    const achResult = getUnlockedAchievementsState(tempState);
    const now = new Date().toISOString();
    const finalTimelineEvents = [
      ...tempState.memoryBook.timelineEvents,
      ...achResult.newlyUnlocked.map(ach => ({
        id: crypto.randomUUID(),
        date: now,
        type: "achievement_earned" as const,
        title: `Earned ${ach.title} Badge`,
        carbonDelta: 0
      }))
    ];

    return {
      activeMissions: activeMissionsRemaining,
      achievements: achResult.achievements,
      pendingAchievements: [...state.pendingAchievements, ...achResult.newlyUnlocked],
      pendingMissions: [
        ...state.pendingMissions,
        ...newlyCompletedMissions.map(m => ({
          id: m.id,
          title: m.title,
          emoji: m.emoji,
          description: m.description
        }))
      ],
      memoryBook: {
        ...state.memoryBook,
        timelineEvents: finalTimelineEvents
      }
    };
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
        case "metro-master": {
          const publicChoices = state.memoryBook.stories.flatMap(s => s.decisions)
            .filter(d => d.choice.toLowerCase().includes("metro") || d.choice.toLowerCase().includes("walk"));
          unlock = publicChoices.length >= 3;
          break;
        }
        case "plant-pro": {
          const plantChoices = state.memoryBook.stories.flatMap(s => s.decisions)
            .filter(d => d.impactType === "eco" && (d.choice.toLowerCase().includes("plant") || d.choice.toLowerCase().includes("tiffin") || d.choice.toLowerCase().includes("canteen")));
          unlock = plantChoices.length >= 3;
          break;
        }
        case "garden-guardian":
          unlock = state.memoryBook.ecoChoicesCount >= 5;
          break;
        case "aqi-protector":
          unlock = state.memoryBook.ecoChoicesCount >= 10;
          break;
        case "sustainability-hero": {
          if (state.memoryBook.stories.length >= 1) {
            const recentStory = state.memoryBook.stories[state.memoryBook.stories.length - 1];
            unlock = recentStory.decisions.length > 0 && recentStory.decisions.every(d => d.impactType === "eco");
          }
          break;
        }
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
      pendingAchievements: [...state.pendingAchievements, ...newlyUnlocked],
      memoryBook: {
        ...state.memoryBook,
        timelineEvents: [
          ...state.memoryBook.timelineEvents,
          ...newlyUnlocked.map(ach => ({
            id: crypto.randomUUID(),
            date: now,
            type: "achievement_earned" as const,
            title: `Earned ${ach.title} Badge`,
            carbonDelta: 0
          }))
        ]
      }
    };
  }),

  clearPendingAchievements: () => set({ pendingAchievements: [] }),
  clearPendingMissions: () => set({ pendingMissions: [] }),

  deleteReceipt: (id) => set((state) => {
    const receipt = state.memoryBook.receipts.find(r => r.id === id);
    if (!receipt) return state;

    const newReceipts = state.memoryBook.receipts.filter(r => r.id !== id);
    return {
      totalCarbonDelta: state.totalCarbonDelta - receipt.totalCO2,
      memoryBook: {
        ...state.memoryBook,
        receipts: newReceipts,
        totalReceiptCO2: state.memoryBook.totalReceiptCO2 - receipt.totalCO2,
        timelineEvents: [
          ...state.memoryBook.timelineEvents,
          {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            type: "receipt_deleted" as const,
            title: `Deleted ${receipt.merchantName} Receipt`,
            carbonDelta: -receipt.totalCO2
          }
        ]
      }
    };
  }),

  generateNewMissions: () => set((state) => {
    const isBadgeCompleted = (badgeId: string) => {
      return state.achievements.some(a => a.id === badgeId && a.unlockedAt !== null);
    };

    const decisions = state.memoryBook.stories.flatMap(s => s.decisions);
    
    const highTransport = decisions.filter(d => 
      d.moment === "commute" && d.impactType === "high"
    ).length;
    
    const highFood = decisions.filter(d =>
      ["breakfast","lunch","dinner"].includes(d.moment || "") 
      && d.impactType === "high"
    ).length;
    
    const highShopping = decisions.filter(d =>
      d.moment === "shopping" && d.impactType === "high"
    ).length;

    const newMissions = [];
    
    if (highTransport > 0 && !isBadgeCompleted("metro-master") && !state.activeMissions.some(m => m.emoji === "🚇")) {
      newMissions.push({
        id: `mission-transport-${Date.now()}`,
        title: "Commute Champion",
        description: "Choose public transit or walk in next story",
        emoji: "🚇",
        targetType: "eco_choices" as const,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        reward: "Metro Master badge",
      });
    }
    
    if (highFood > 0 && !isBadgeCompleted("plant-pro") && !state.activeMissions.some(m => m.emoji === "🥗")) {
      newMissions.push({
        id: `mission-food-${Date.now()}`,
        title: "Green Plate",
        description: "Choose a plant-based or local meal",
        emoji: "🥗",
        targetType: "eco_choices" as const,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        reward: "Plant-Based Pro badge",
      });
    }
    
    if (highShopping > 0 && !isBadgeCompleted("garden-guardian") && !state.activeMissions.some(m => m.emoji === "🛒")) {
      newMissions.push({
        id: `mission-shop-${Date.now()}`,
        title: "Local Buyer",
        description: "Choose local kirana store in next story",
        emoji: "🛒",
        targetType: "eco_choices" as const,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        reward: "Garden Guardian badge",
      });
    }
    
    if (state.memoryBook.receipts.length === 0 && !isBadgeCompleted("receipt-detective") && !state.activeMissions.some(m => m.emoji === "🔍")) {
      newMissions.push({
        id: `mission-receipt-${Date.now()}`,
        title: "Receipt Detective",
        description: "Analyze your first real receipt",
        emoji: "🔍",
        targetType: "receipt_upload" as const,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        reward: "Carbon Detective badge",
      });
    }

    const activeMissionsRemaining = state.activeMissions.filter(m => !m.completed);
    
    return {
      activeMissions: [
        ...activeMissionsRemaining,
        ...newMissions.slice(0, 3),
      ]
    };
  }),

  setCoachRecommendations: (actions) => set(() => ({
    coach: { recommendations: actions, isCompleted: false }
  })),

  acceptCoachPlan: (actionIds) => set((state) => {
    const isBadgeCompleted = (badgeId: string) => {
      return state.achievements.some(a => a.id === badgeId && a.unlockedAt !== null);
    };

    const acceptedActions = state.coach.recommendations.filter(r => actionIds.includes(r.id));
    
    const newMissions = acceptedActions
      .filter(act => {
        // Prevent duplicate missions in activeMissions
        if (state.activeMissions.some(m => m.id === act.id || m.title === act.title)) return false;
        
        // Prevent adding if related badge is already completed
        if (act.category === "Transport" && isBadgeCompleted("metro-master")) return false;
        if (act.category === "Food" && isBadgeCompleted("plant-pro")) return false;
        if (act.category === "Shopping" && isBadgeCompleted("garden-guardian")) return false;
        
        return true;
      })
      .map((act) => ({
        id: act.id,
        title: act.title,
        description: act.reason,
        emoji: act.emoji,
        targetType: "eco_choices" as const,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        reward: `Save ${act.saving}`,
      }));

    return { 
      activeMissions: [...state.activeMissions.filter(m => !m.completed), ...newMissions],
      coach: {
        ...state.coach,
        isCompleted: false
      }
    };
  }),

  updateVerdContext: (patch) => set((state) => ({
    verdContext: { ...state.verdContext, ...patch }
  })),

  acceptDetectiveMission: (mission) => set((state) => {
    const newMission = {
      ...mission,
      targetType: mission.targetType as any,
      targetCount: 1,
      currentCount: 0,
      completed: false,
      reward: "Detective Badge"
    };
    
    const nowStr = new Date().toISOString();
    return {
      activeMissions: [...state.activeMissions, newMission],
      memoryBook: {
        ...state.memoryBook,
        timelineEvents: [
          ...state.memoryBook.timelineEvents,
          {
            id: crypto.randomUUID(),
            date: nowStr,
            type: "story_completed", // using this for simple green styling
            title: `🌱 Accepted ${mission.title} Mission`,
            carbonDelta: 0
          }
        ]
      }
    };
  }),
    }),
    {
      name: "carbonverse-session-storage",
      partialize: (state) => ({
        memoryBook: state.memoryBook,
        achievements: state.achievements,
        activeMissions: state.activeMissions,
        coach: state.coach,
        // Persist story completion state so refresh/new-tab works
        profile: state.profile,
        isOnboarded: state.isOnboarded,
        storyCompleted: state.storyCompleted,
        completedStoryData: state.completedStoryData,
        futureOutcome: state.futureOutcome,
        gardenOutcome: state.gardenOutcome,
        // Persist in-progress story state
        decisions: state.decisions,
        worldState: state.worldState,
        totalCarbonDelta: state.totalCarbonDelta,
        currentChapter: state.currentChapter,
        verdContext: state.verdContext,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);