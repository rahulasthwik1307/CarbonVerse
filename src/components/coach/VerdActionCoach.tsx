"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";

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
    { title: "Take public transit to work", saving: "8kg CO₂", difficulty: "Medium", reason: "Reduces personal footprint significantly.", emoji: "🚆", category: "Transport" },
    { title: "Combine errands into one trip", saving: "3kg CO₂", difficulty: "Easy", reason: "Avoids multiple cold-engine starts.", emoji: "🚗", category: "Transport" },
    { title: "Carpool with a colleague", saving: "6kg CO₂", difficulty: "Medium", reason: "Halves your commuting emissions.", emoji: "🤝", category: "Transport" },
  ],
  Food: [
    { title: "Choose a plant-based breakfast", saving: "3kg CO₂", difficulty: "Easy", reason: "Food contributes highly to your footprint.", emoji: "🥗", category: "Food" },
    { title: "Have a meatless dinner", saving: "5kg CO₂", difficulty: "Medium", reason: "Beef and lamb have the highest emissions.", emoji: "🥦", category: "Food" },
    { title: "Buy local produce", saving: "2kg CO₂", difficulty: "Easy", reason: "Reduces transportation emissions for food.", emoji: "🛒", category: "Food" },
    { title: "Only buy what you will eat", saving: "4kg CO₂", difficulty: "Medium", reason: "Food waste in landfills produces methane.", emoji: "🗑️", category: "Food" },
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
        pillBg: "rgba(45, 130, 115, 0.1)",
        pillText: "#2D8273"
      };
    case "Food":
      return {
        bg: "#F0FAF0",
        border: "#B8D4A8",
        text: "#4A7C2F",
        pillBg: "rgba(74, 124, 47, 0.1)",
        pillText: "#4A7C2F"
      };
    case "Shopping":
      return {
        bg: "#FFF7E6",
        border: "#FCD7A1",
        text: "#9E5F13",
        pillBg: "rgba(244, 168, 50, 0.15)",
        pillText: "#9E5F13"
      };
    case "Electricity":
      return {
        bg: "#FFFBEA",
        border: "#FFE299",
        text: "#A87900",
        pillBg: "rgba(244, 168, 50, 0.15)",
        pillText: "#A87900"
      };
    default:
      return {
        bg: "#FFFFFF",
        border: "#B8D4A8",
        text: "#2D5016",
        pillBg: "rgba(74, 124, 47, 0.1)",
        pillText: "#2D5016"
      };
  }
};

export default function VerdActionCoach() {
  const { memoryBook, coach, activeMissions, achievements, setCoachRecommendations, acceptCoachPlan } = useSessionStore();
  const [topCategory, setTopCategory] = useState("Transport");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = (manual = false) => {
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
  };

  useEffect(() => {
    if (coach.recommendations.length === 0) {
      generatePlan(false);
    }
  }, []);

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

  const handleAcceptSingle = (id: string) => {
    acceptCoachPlan([id]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Premium Verd Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(184, 212, 168, 0.6)",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 8px 32px rgba(45, 80, 22, 0.05)",
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ flexShrink: 0 }}
        >
          <VerdOrb size={72} mood={showEmptyState ? "eco" : "thinking"} />
        </motion.div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 6px 0", color: "#F4A832", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            Verd's Daily Guidance
          </h3>
          <p style={{ margin: 0, color: "#2D5016", fontSize: 16, lineHeight: 1.5, fontWeight: 600 }}>
            "{getVerdGuidance()}"
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {showEmptyState ? (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: "rgba(255, 255, 255, 0.85)",
              borderRadius: 24,
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid rgba(184, 212, 168, 0.6)",
              boxShadow: "0 12px 40px rgba(45, 80, 22, 0.05)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20
            }}
          >
            <div style={{ position: "relative", width: 100, height: 100 }}>
              <motion.div
                animate={{ 
                  y: [-10, -30, -10],
                  x: [-10, 10, -10],
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: 0, left: 10, fontSize: 24 }}
              >
                🍃
              </motion.div>
              <motion.div
                animate={{ 
                  y: [-5, -25, -5],
                  x: [10, -10, 10],
                  opacity: [0, 0.8, 0],
                  scale: [0.6, 1, 0.6]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                style={{ position: "absolute", top: 10, right: 10, fontSize: 20 }}
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ 
                  y: [-15, -35, -15],
                  x: [-5, 5, -5],
                  opacity: [0, 0.9, 0],
                  scale: [0.7, 1.1, 0.7]
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                style={{ position: "absolute", top: 20, left: "40%", fontSize: 18 }}
              >
                🌱
              </motion.div>
              
              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ fontSize: 64, filter: "drop-shadow(0 4px 12px rgba(76, 175, 80, 0.2))" }}
              >
                🏆
              </motion.div>
            </div>

            <h2 style={{ margin: 0, color: "#2D5016", fontSize: 22, fontWeight: 800 }}>🌱 All Missions Completed</h2>
            <p style={{ margin: 0, color: "#4A7C2F", fontSize: 15, lineHeight: 1.6, maxWidth: 420 }}>
              You've completed every active mission.
              Verd will prepare new recommendations after your next story or receipt analysis.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {/* Active Missions (Things you can do right now) */}
            {activeUnfinishedMissions.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ margin: 0, color: "#2D5016", fontSize: 20, fontWeight: 700 }}>🎯 Active Missions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activeUnfinishedMissions.map((mission) => (
                    <motion.div
                      layout
                      key={mission.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      style={{
                        background: "#FFF",
                        border: "1px solid #B8D4A8",
                        borderRadius: 20,
                        padding: 18,
                        boxShadow: "0 4px 16px rgba(45, 80, 22, 0.03)",
                        display: "flex",
                        gap: 16,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: "50%", 
                        background: "rgba(74, 124, 47, 0.08)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: 24,
                        flexShrink: 0
                      }}>
                        {mission.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 4px 0", color: "#2D5016", fontSize: 16, fontWeight: 700 }}>
                          {mission.title}
                        </h4>
                        <p style={{ margin: 0, color: "#6B8F5E", fontSize: 13, fontWeight: 500 }}>
                          {mission.description}
                        </p>
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        fontWeight: 700, 
                        color: "#8B6914", 
                        background: "rgba(244, 168, 50, 0.15)", 
                        padding: "4px 8px", 
                        borderRadius: 999 
                      }}>
                        {mission.reward}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations (Available Quests) */}
            {visibleRecommendations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <h2 style={{ margin: 0, color: "#2D5016", fontSize: 20, fontWeight: 700 }}>✨ Recommended Quests</h2>
                
                {isGenerating ? (
                  [1, 2].map(i => (
                    <div 
                      key={i}
                      style={{ 
                        height: 160, 
                        background: "#E8F5E3", 
                        borderRadius: 20,
                        animation: "pulse 1.5s infinite" 
                      }}
                    />
                  ))
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {visibleRecommendations.map((action) => {
                      const isAccepted = isActionAccepted(action.id);
                      const theme = getCategoryStyles(action.category);
                      
                      return (
                        <motion.div
                          layout
                          key={action.id}
                          initial={{ opacity: 0, scale: 0.98, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          style={{
                            background: theme.bg,
                            border: `2px solid ${theme.border}`,
                            borderRadius: 24,
                            padding: 20,
                            boxShadow: "0 6px 20px rgba(45, 80, 22, 0.03)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                            <div style={{ 
                              width: 56, 
                              height: 56, 
                              borderRadius: "50%", 
                              background: "#FFF", 
                              border: `1px solid ${theme.border}`,
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center", 
                              fontSize: 30,
                              flexShrink: 0
                            }}>
                              {action.emoji}
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ margin: "0 0 6px 0", color: "#2D5016", fontSize: 17, fontWeight: 800 }}>
                                {action.title}
                              </h4>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: theme.text, background: theme.pillBg, padding: "4px 10px", borderRadius: 999 }}>
                                  Save ~{action.saving}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: action.difficulty === "Easy" ? "#4A7C2F" : action.difficulty === "Medium" ? "#F4A832" : "#D95D39", background: "rgba(0,0,0,0.04)", padding: "4px 10px", borderRadius: 999 }}>
                                  {action.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ background: "rgba(255, 255, 255, 0.5)", padding: "12px 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.3)" }}>
                            <strong style={{ color: "#F4A832", fontSize: 11, display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Why Verd recommends it:</strong>
                            <span style={{ color: "#2D5016", fontSize: 14, fontWeight: 500 }}>{action.reason}</span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                            <motion.button
                              disabled={isAccepted}
                              onClick={() => handleAcceptSingle(action.id)}
                              whileTap={{ scale: isAccepted ? 1 : 0.97 }}
                              style={{
                                padding: "10px 20px",
                                borderRadius: 14,
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: isAccepted ? "default" : "pointer",
                                background: isAccepted ? "#E8F5E9" : "#F4A832",
                                color: isAccepted ? "#2D5016" : "#FFF",
                                border: "none",
                                boxShadow: isAccepted ? "none" : "0 4px 14px rgba(244, 168, 50, 0.25)",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                transition: "all 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
                              }}
                            >
                              {isAccepted ? "✓ Added To Journey" : "Accept Mission"}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Refresh Button */}
      {(!activeUnfinishedMissions.length) && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button 
            onClick={() => generatePlan(true)} 
            disabled={isGenerating}
            style={{ 
              background: "transparent", 
              border: "none", 
              color: "#6B8F5E", 
              fontSize: 14,
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