import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/session-store";

type Action = {
  id: string;
  title: string;
  saving: string;
  difficulty: string;
  reason: string;
  emoji: string;
  category: "Transport" | "Food" | "Shopping" | "Electricity";
};

const ACTION_BANKS: Record<string, Omit<Action, "id">[]> = {
  Transport: [
    { title: "Walk short trips under 1km", saving: "5kg CO₂", difficulty: "Easy", reason: "Transport is your biggest source.", emoji: "🚶", category: "Transport" },
    { title: "Take public transit to work", saving: "8kg CO₂", difficulty: "Medium", reason: "Reduces transport emissions.", emoji: "🚆", category: "Transport" },
    { title: "Combine errands into one trip", saving: "3kg CO₂", difficulty: "Easy", reason: "Avoids multiple cold-engine starts.", emoji: "🚗", category: "Transport" },
    { title: "Carpool with a colleague", saving: "6kg CO₂", difficulty: "Medium", reason: "Halves your commuting emissions.", emoji: "🤝", category: "Transport" },
  ],
  Food: [
    { title: "Choose a plant-based breakfast", saving: "3kg CO₂", difficulty: "Easy", reason: "Food contributes highly to footprint.", emoji: "🥗", category: "Food" },
    { title: "Have a meatless dinner", saving: "5kg CO₂", difficulty: "Medium", reason: "Beef and lamb have highest emissions.", emoji: "🥦", category: "Food" },
    { title: "Buy local produce", saving: "2kg CO₂", difficulty: "Easy", reason: "Reduces food transit emissions.", emoji: "🛒", category: "Food" },
    { title: "Only buy what you will eat", saving: "4kg CO₂", difficulty: "Medium", reason: "Food waste produces methane.", emoji: "🗑️", category: "Food" },
  ],
  Shopping: [
    { title: "Wait 24h before buying", saving: "10kg CO₂", difficulty: "Medium", reason: "Shopping emissions are increasing.", emoji: "⏳", category: "Shopping" },
    { title: "Buy second-hand or refurbished", saving: "15kg CO₂", difficulty: "Hard", reason: "Manufacturing is the largest footprint.", emoji: "♻️", category: "Shopping" },
    { title: "Repair instead of replacing", saving: "5kg CO₂", difficulty: "Medium", reason: "Extends product life and saves waste.", emoji: "🛠️", category: "Shopping" },
    { title: "Bring a reusable bag", saving: "0.5kg CO₂", difficulty: "Easy", reason: "Reduces single-use plastics.", emoji: "🛍️", category: "Shopping" },
  ],
  Electricity: [
    { title: "Turn off AC when leaving", saving: "2kg CO₂", difficulty: "Easy", reason: "Cooling is highly energy intensive.", emoji: "❄️", category: "Electricity" },
    { title: "Unplug unused devices", saving: "1kg CO₂", difficulty: "Easy", reason: "Phantom power adds up over time.", emoji: "🔌", category: "Electricity" },
    { title: "Use natural light in the day", saving: "1kg CO₂", difficulty: "Easy", reason: "Simple but effective energy saving.", emoji: "☀️", category: "Electricity" },
    { title: "Wash clothes in cold water", saving: "3kg CO₂", difficulty: "Medium", reason: "Heating water uses significant energy.", emoji: "👕", category: "Electricity" },
  ],
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "Transport":
      return {
        bg: "#E6F4F1",
        border: "#B8E0D7",
        text: "#2D8273",
        pillBg: "rgba(45, 130, 115, 0.08)",
        pillText: "#2D8273"
      };
    case "Food":
      return {
        bg: "#F0FAF0",
        border: "#B8D4A8",
        text: "#4A7C2F",
        pillBg: "rgba(74, 124, 47, 0.08)",
        pillText: "#4A7C2F"
      };
    case "Shopping":
      return {
        bg: "#FFF7E6",
        border: "#FCD7A1",
        text: "#9E5F13",
        pillBg: "rgba(244, 168, 50, 0.1)",
        pillText: "#9E5F13"
      };
    case "Electricity":
      return {
        bg: "#FFFBEA",
        border: "#FFE299",
        text: "#A87900",
        pillBg: "rgba(244, 168, 50, 0.1)",
        pillText: "#A87900"
      };
    default:
      return {
        bg: "#FFFFFF",
        border: "#B8D4A8",
        text: "#2D5016",
        pillBg: "rgba(74, 124, 47, 0.08)",
        pillText: "#2D5016"
      };
  }
};

export default function VerdActionCoach() {
  const { memoryBook, coach, activeMissions, achievements, setCoachRecommendations, acceptCoachPlan } = useSessionStore();
  const [topCategory, setTopCategory] = useState("Transport");
  const [isGenerating, setIsGenerating] = useState(false);


  const generatePlan = useCallback((manual = false) => {
    setIsGenerating(true);
    if (manual) {
      setCoachRecommendations([]);
    }

    setTimeout(() => {
      const breakdown: Record<string, number> = {
        Transport: 0, Food: 0, Shopping: 0, Electricity: 0,
      };

      memoryBook.stories.forEach(s => {
        s.decisions.forEach(d => {
          if (d.moment === "Commute") breakdown.Transport += d.carbonKg;
          if (d.moment === "Breakfast" || d.moment === "Lunch" || d.moment === "Dinner") breakdown.Food += d.carbonKg;
          if (d.moment === "Shopping") breakdown.Shopping += d.carbonKg;
          if (d.moment === "Wind Down") breakdown.Electricity += d.carbonKg;
        });
      });

      memoryBook.receipts.forEach(r => {
        const cat = r.receiptType === "grocery" || r.receiptType === "food" ? "Food" : 
                    r.receiptType === "transport" || r.receiptType === "fuel" ? "Transport" : 
                    r.receiptType === "shopping" || r.receiptType === "retail" ? "Shopping" : "Electricity";
        if (breakdown[cat] !== undefined) breakdown[cat] += r.totalCO2;
      });
      
      const sortedCats = Object.entries(breakdown).sort((a,b) => b[1] - a[1]);
      
      const isBadgeCompleted = (badgeId: string) => {
        return achievements.some(a => a.id === badgeId && a.unlockedAt !== null);
      };

      const availableCats = sortedCats.filter(([cat]) => {
        if (cat === "Transport" && isBadgeCompleted("metro-master")) return false;
        if (cat === "Food" && isBadgeCompleted("plant-pro")) return false;
        if (cat === "Shopping" && isBadgeCompleted("garden-guardian")) return false;
        return true;
      });

      const highest = availableCats[0]?.[0] || "Electricity";
      setTopCategory(highest);

      const bank = ACTION_BANKS[highest] || ACTION_BANKS.Transport;
      const filteredBank = bank.filter(action => 
        !activeMissions.some(m => m.title === action.title)
      );

      const finalBank = filteredBank.length > 0 ? filteredBank : bank;

      const shuffled = [...finalBank].sort(() => Math.random() - 0.5);
      const generated = shuffled.slice(0, 3).map((a, i) => ({
        ...a as Action,
        id: `coach-${Date.now()}-${i}`
      }));
      
      setCoachRecommendations(generated);
      setIsGenerating(false);
    }, 800);
  }, [memoryBook.stories, memoryBook.receipts, achievements, activeMissions, setCoachRecommendations]);

  useEffect(() => {
    if (coach.recommendations.length === 0) {
      const timer = setTimeout(() => {
        generatePlan(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [coach.recommendations.length, generatePlan]);

  // Filter recommendations: remove completed ones (that are in timeline events)
  const visibleRecommendations = coach.recommendations.filter(action => {
    const isCompleted = memoryBook.timelineEvents.some(e => e.title.includes(`Completed Mission: ${action.title}`));
    return !isCompleted;
  });

  // Check if a recommendation is accepted (is in activeMissions)
  const isActionAccepted = (actionId: string) => activeMissions.some(m => m.id === actionId);

  // Unfinished active missions (things the user can still do)
  const activeUnfinishedMissions = activeMissions.filter(m => !m.completed);

  // Recommendations that can still be accepted
  const pendingRecommendations = visibleRecommendations.filter(r => !isActionAccepted(r.id));

  // Empty state is shown when there are no active unfinished missions AND no pending recommendations to accept
  const showEmptyState = activeUnfinishedMissions.length === 0 && pendingRecommendations.length === 0;

  const getVerdGuidance = () => {
    if (showEmptyState) {
      return "All missions completed! Your planet is breathing a little easier today.";
    }
    if (topCategory === "Transport") {
      return "Your transport choices are creating the biggest impact.";
    }
    if (topCategory === "Food") {
      return "Food choices are driving most of your footprint right now.";
    }
    if (topCategory === "Shopping") {
      return "Shopping choices are driving most of your footprint right now.";
    }
    return "Electricity choices are driving most of your footprint right now.";
  };

  const getQuestMeta = (quest: { title: string; emoji: string; saving?: string; reward?: string }) => {
    let category: "Transport" | "Food" | "Shopping" | "Electricity" = "Transport";
    let difficulty = "Easy";
    let saving = quest.saving || "CO₂";
    
    for (const cat of Object.keys(ACTION_BANKS)) {
      const found = ACTION_BANKS[cat].find(a => a.title.toLowerCase() === quest.title.toLowerCase());
      if (found) {
        category = cat as "Transport" | "Food" | "Shopping" | "Electricity";
        difficulty = found.difficulty;
        saving = found.saving;
        break;
      }
    }

    if (quest.emoji === "🥗" || quest.emoji === "🥦" || quest.emoji === "🍔") {
      category = "Food";
    } else if (quest.emoji === "🛒" || quest.emoji === "🛍️" || quest.emoji === "♻️") {
      category = "Shopping";
    } else if (quest.emoji === "🔌" || quest.emoji === "❄️" || quest.emoji === "☀️") {
      category = "Electricity";
    }
    
    if (quest.reward && quest.reward.startsWith("Save ")) {
      saving = quest.reward.replace("Save ", "");
    }

    return { category, difficulty, saving };
  };

  const handleAcceptSingle = (id: string) => {
    acceptCoachPlan([id]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 24 }}>
      {/* Premium Compact Verd Hero Card (No Orb icon per Part 1) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(184, 212, 168, 0.6)",
          borderRadius: 20,
          padding: "16px 20px",
          boxShadow: "0 8px 32px rgba(45, 80, 22, 0.04)",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: 90,
          justifyContent: "center",
        }}
      >
        <h3 style={{ margin: 0, color: "#F4A832", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, display: "flex", alignItems: "center", gap: 6 }}>
          🌱 Verd&apos;s Daily Guidance
        </h3>
        <p style={{ margin: 0, color: "#2D5016", fontSize: 14, lineHeight: 1.4, fontWeight: 600, fontStyle: "italic" }}>
          &ldquo;{getVerdGuidance()}&rdquo;
        </p>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showEmptyState ? (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: 20,
              padding: "36px 20px",
              textAlign: "center",
              border: "1px solid rgba(184, 212, 168, 0.6)",
              boxShadow: "0 8px 32px rgba(45, 80, 22, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16
            }}
          >
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <motion.div
                animate={{ y: [-5, -20, -5], x: [-8, 8, -8], opacity: [0, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: 0, left: 10, fontSize: 20 }}
              >
                🍃
              </motion.div>
              <motion.div
                animate={{ y: [-3, -15, -3], x: [8, -8, 8], opacity: [0, 0.8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ position: "absolute", top: 10, right: 10, fontSize: 18 }}
              >
                ✨
              </motion.div>
              
              <motion.div
                animate={{ scale: [1, 1.06, 1], rotate: [0, 4, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 52, filter: "drop-shadow(0 4px 10px rgba(76, 175, 80, 0.15))" }}
              >
                🏆
              </motion.div>
            </div>

            <h2 style={{ margin: 0, color: "#2D5016", fontSize: 20, fontWeight: 800 }}>🌱 All Missions Completed</h2>
            <p style={{ margin: 0, color: "#4A7C2F", fontSize: 14, lineHeight: 1.5, maxWidth: 360 }}>
              You&apos;ve completed every active quest.
              Verd will prepare new recommendations after your next story or receipt analysis.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="quests-container"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(184, 212, 168, 0.5)",
              borderRadius: 24,
              padding: 20,
              boxShadow: "0 8px 32px rgba(45, 80, 22, 0.04)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Header section with counts */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 4, borderBottom: "1px solid rgba(184, 212, 168, 0.3)" }}>
              <h2 style={{ margin: 0, color: "#2D5016", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                🌱 Verd&apos;s Quests
              </h2>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#4A7C2F", background: "rgba(74, 124, 47, 0.08)", padding: "2px 8px", borderRadius: 6 }}>
                  {activeUnfinishedMissions.length} Active
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#F4A832", background: "rgba(244, 168, 50, 0.1)", padding: "2px 8px", borderRadius: 6 }}>
                  {pendingRecommendations.length} Suggested
                </span>
              </div>
            </div>

            {/* Combined Quest Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {/* 1. Active Quests */}
                {activeUnfinishedMissions.map((quest) => {
                  const meta = getQuestMeta(quest);
                  const theme = getCategoryStyles(meta.category);
                  
                  return (
                    <motion.div
                      layout
                      key={quest.id}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ 
                        scale: 0.95, 
                        opacity: 0, 
                        filter: "brightness(1.1) drop-shadow(0 0 8px rgba(76, 175, 80, 0.4))"
                      }}
                      whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(45, 80, 22, 0.04)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{
                        background: theme.bg,
                        border: `1.5px solid ${theme.border}`,
                        borderRadius: 16,
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        position: "relative",
                        minHeight: 105,
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Quest Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", paddingRight: 80 }}>
                          <span style={{ fontSize: 22, lineHeight: 1 }}>{quest.emoji}</span>
                          <h4 style={{ margin: 0, color: "#2D5016", fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                            {quest.title}
                          </h4>
                        </div>
                        {/* Status Stamp */}
                        <div style={{ position: "absolute", top: 16, right: 16 }}>
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 800, 
                            color: "#2E7D32", 
                            background: "#E8F5E9", 
                            padding: "3px 8px", 
                            borderRadius: 6,
                            border: "1px solid rgba(46, 125, 50, 0.15)"
                          }}>
                            Active
                          </span>
                        </div>
                      </div>

                      {/* Quest Sub-details */}
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, background: theme.pillBg, padding: "2px 6px", borderRadius: 4 }}>
                          Save ~{meta.saving}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: meta.difficulty === "Easy" ? "#4A7C2F" : meta.difficulty === "Medium" ? "#F4A832" : "#D95D39", background: "rgba(0,0,0,0.03)", padding: "2px 6px", borderRadius: 4 }}>
                          {meta.difficulty}
                        </span>
                      </div>

                      {/* Explanation Sentence (No Why Verd Recommends header, 1 line max) */}
                      <p style={{ margin: 0, color: "#6B8F5E", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {quest.description}
                      </p>
                    </motion.div>
                  );
                })}

                {/* 2. Suggested Quests */}
                {pendingRecommendations.map((quest) => {
                  const meta = getQuestMeta(quest);
                  const theme = getCategoryStyles(meta.category);
                  const isAccepted = isActionAccepted(quest.id);

                  return (
                    <motion.div
                      layout
                      key={quest.id}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      whileHover={{ y: -2, boxShadow: "0 6px 16px rgba(45, 80, 22, 0.04)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{
                        background: theme.bg,
                        border: `1.5px solid ${theme.border}`,
                        borderRadius: 16,
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        position: "relative",
                        minHeight: 105,
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Quest Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", paddingRight: 90 }}>
                          <span style={{ fontSize: 22, lineHeight: 1 }}>{quest.emoji}</span>
                          <h4 style={{ margin: 0, color: "#2D5016", fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                            {quest.title}
                          </h4>
                        </div>
                        {/* Compact Action Area (Top Right) */}
                        <div style={{ position: "absolute", top: 14, right: 16 }}>
                          <motion.button
                            disabled={isAccepted}
                            onClick={() => handleAcceptSingle(quest.id)}
                            whileTap={{ scale: isAccepted ? 1 : 0.95 }}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 800,
                              cursor: isAccepted ? "default" : "pointer",
                              background: isAccepted ? "#E8F5E9" : "#F4A832",
                              color: isAccepted ? "#2D5016" : "#FFF",
                              border: "none",
                              boxShadow: isAccepted ? "none" : "0 2px 6px rgba(244, 168, 50, 0.2)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {isAccepted ? "✓ Added" : "Accept"}
                          </motion.button>
                        </div>
                      </div>

                      {/* Quest Sub-details */}
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, background: theme.pillBg, padding: "2px 6px", borderRadius: 4 }}>
                          Save ~{meta.saving}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: meta.difficulty === "Easy" ? "#4A7C2F" : meta.difficulty === "Medium" ? "#F4A832" : "#D95D39", background: "rgba(0,0,0,0.03)", padding: "2px 6px", borderRadius: 4 }}>
                          {meta.difficulty}
                        </span>
                      </div>

                      {/* Explanation Sentence (No Why Verd Recommends header, 1 line max) */}
                      <p style={{ margin: 0, color: "#6B8F5E", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {quest.reason}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Refresh Button */}
      {(!activeUnfinishedMissions.length) && (
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <button 
            onClick={() => generatePlan(true)} 
            disabled={isGenerating}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "#6B8F5E", 
              fontSize: 13,
              fontWeight: 600, 
              cursor: isGenerating ? "not-allowed" : "pointer", 
              textDecoration: "underline",
              opacity: isGenerating ? 0.5 : 1
            }}
          >
            Generate Different Ideas
          </button>
        </div>
      )}
    </div>
  );
}