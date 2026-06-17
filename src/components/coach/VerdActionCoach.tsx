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
};

const ACTION_BANKS: Record<string, Omit<Action, "id">[]> = {
  Transport: [
    { title: "Walk short trips under 1km", saving: "5kg CO₂", difficulty: "Easy", reason: "Transport is your biggest source.", emoji: "🚶" },
    { title: "Take public transit to work", saving: "8kg CO₂", difficulty: "Medium", reason: "Reduces personal footprint significantly.", emoji: "🚆" },
    { title: "Combine errands into one trip", saving: "3kg CO₂", difficulty: "Easy", reason: "Avoids multiple cold-engine starts.", emoji: "🚗" },
    { title: "Carpool with a colleague", saving: "6kg CO₂", difficulty: "Medium", reason: "Halves your commuting emissions.", emoji: "🤝" },
  ],
  Food: [
    { title: "Choose a plant-based breakfast", saving: "3kg CO₂", difficulty: "Easy", reason: "Food contributes highly to your footprint.", emoji: "🥗" },
    { title: "Have a meatless dinner", saving: "5kg CO₂", difficulty: "Medium", reason: "Beef and lamb have the highest emissions.", emoji: "🥦" },
    { title: "Buy local produce", saving: "2kg CO₂", difficulty: "Easy", reason: "Reduces transportation emissions for food.", emoji: "🛒" },
    { title: "Only buy what you will eat", saving: "4kg CO₂", difficulty: "Medium", reason: "Food waste in landfills produces methane.", emoji: "🗑️" },
  ],
  Shopping: [
    { title: "Wait 24h before buying", saving: "10kg CO₂", difficulty: "Medium", reason: "Shopping emissions are increasing.", emoji: "⏳" },
    { title: "Buy second-hand or refurbished", saving: "15kg CO₂", difficulty: "Hard", reason: "Manufacturing is the largest footprint.", emoji: "♻️" },
    { title: "Repair instead of replacing", saving: "5kg CO₂", difficulty: "Medium", reason: "Extends product life and saves waste.", emoji: "🛠️" },
    { title: "Bring a reusable bag", saving: "0.5kg CO₂", difficulty: "Easy", reason: "Reduces single-use plastics.", emoji: "🛍️" },
  ],
  Electricity: [
    { title: "Turn off AC when leaving", saving: "2kg CO₂", difficulty: "Easy", reason: "Cooling is highly energy intensive.", emoji: "❄️" },
    { title: "Unplug unused devices", saving: "1kg CO₂", difficulty: "Easy", reason: "Phantom power adds up over time.", emoji: "🔌" },
    { title: "Use natural light in the day", saving: "1kg CO₂", difficulty: "Easy", reason: "Simple but effective energy saving.", emoji: "☀️" },
    { title: "Wash clothes in cold water", saving: "3kg CO₂", difficulty: "Medium", reason: "Heating water uses significant energy.", emoji: "👕" },
  ],
};

const VERD_SAYS: Record<string, string> = {
  Transport: "Your transport choices matter most right now. One metro ride could make a bigger difference than you think.",
  Food: "Food is your biggest footprint area. Swapping just one meal to plant-based tomorrow will be a huge win.",
  Shopping: "Retail therapy is adding up! Try to find joy in what you already own tomorrow.",
  Electricity: "Your energy usage is a bit high. See if you can go 'low-tech' for a few hours tomorrow evening.",
};

export default function VerdActionCoach() {
  const { memoryBook, coach, activeMissions, setCoachRecommendations, acceptCoachPlan } = useSessionStore();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [topCategory, setTopCategory] = useState("Transport");
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = (manual = false) => {
    setIsGenerating(true);
    if (manual) {
      setCoachRecommendations([]);
      setSelectedIds(new Set());
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
        else breakdown[cat] = r.totalCO2;
      });
      
      const sortedCats = Object.entries(breakdown).sort((a,b) => b[1] - a[1]);
      const highest = sortedCats[0]?.[0] || "Transport";
      setTopCategory(highest);

      const bank = ACTION_BANKS[highest] || ACTION_BANKS.Transport;
      const shuffled = [...bank].sort(() => Math.random() - 0.5);
      const generated = shuffled.slice(0, 3).map((a, i) => ({
        ...a,
        id: `coach-${Date.now()}-${i}`
      }));
      
      setCoachRecommendations(generated);
      setIsGenerating(false);
    }, 800);
  };

  useEffect(() => {
    if (coach.recommendations.length === 0 && !coach.isCompleted) {
      generatePlan(false);
    }
  }, []);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleAddMissions = () => {
    if (selectedIds.size === 0) return;
    acceptCoachPlan(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const currentMessage = coach.isCompleted 
    ? "Great job planning ahead. I'll have more ideas ready for you after your next story."
    : (VERD_SAYS[topCategory] || VERD_SAYS.Transport);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Verd Says Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          padding: "8px 0"
        }}
      >
        <motion.div 
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ flexShrink: 0 }}
        >
          <VerdOrb size={64} mood={coach.isCompleted ? "eco" : "thinking"} />
        </motion.div>
        
        {/* Speech Bubble */}
        <div style={{
          flex: 1,
          background: "#FFF",
          borderRadius: 20,
          padding: "20px 24px",
          boxShadow: "0 8px 32px rgba(45, 80, 22, 0.05)",
          border: "1px solid rgba(184,212,168,0.4)",
          position: "relative"
        }}>
          {/* Arrow pointing to the left */}
          <div style={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%) rotate(45deg)",
            width: 16,
            height: 16,
            background: "#FFF",
            borderLeft: "1px solid rgba(184,212,168,0.4)",
            borderBottom: "1px solid rgba(184,212,168,0.4)"
          }} />
          
          <h3 style={{ margin: "0 0 6px 0", color: "#F4A832", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
            💡 Verd Says
          </h3>
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentMessage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ margin: 0, color: "#2D5016", fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}
            >
              “{currentMessage}”
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {coach.isCompleted ? (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))",
              borderRadius: 24,
              padding: "40px 24px",
              textAlign: "center",
              border: "2px solid #B8D4A8",
              boxShadow: "0 12px 40px rgba(45,80,22,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16
            }}
          >
            <div style={{ fontSize: 48 }}>🌱</div>
            <h2 style={{ margin: 0, color: "#2D5016", fontSize: 22, fontWeight: 800 }}>All Actions Planned</h2>
            <p style={{ margin: 0, color: "#4A7C2F", fontSize: 15, lineHeight: 1.6, maxWidth: 360 }}>
              You've selected all of Verd's recommendations for your next story.
            </p>
          </motion.div>
        ) : (
          <motion.div key="recommendations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
              <h2 style={{ margin: 0, color: "#2D5016", fontSize: 24, fontWeight: 700 }}>🌱 Tomorrow's Plan</h2>
            </div>
            
            {isGenerating ? (
              [1,2,3].map(i => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1, repeatType: "mirror" }}
                  style={{ height: 140, background: "#E8F0E3", borderRadius: 20 }}
                />
              ))
            ) : (
              <AnimatePresence mode="popLayout">
                {coach.recommendations.map((action) => {
                  const isSelected = selectedIds.has(action.id);
                  return (
                    <motion.div
                      layout
                      onClick={() => toggleSelection(action.id)}
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0, overflow: "hidden" }}
                      transition={{ duration: 0.4 }}
                      style={{
                        background: isSelected ? "rgba(74, 124, 47, 0.03)" : "#FFF",
                        border: isSelected ? "2px solid #4A7C2F" : "2px solid #B8D4A8",
                        borderRadius: 20,
                        padding: 20,
                        boxShadow: isSelected 
                          ? "0 8px 24px rgba(74, 124, 47, 0.12)" 
                          : "0 4px 16px rgba(45, 80, 22, 0.04)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s cubic-bezier(0.23, 1, 0.32, 1)"
                      }}
                    >
                      <div style={{ position: "absolute", top: 20, right: 20, width: 24, height: 24, borderRadius: 12, border: isSelected ? "none" : "2px solid rgba(184,212,168,0.8)", background: isSelected ? "#4A7C2F" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {isSelected && <span style={{ color: "#FFF", fontSize: 14, fontWeight: 800 }}>✓</span>}
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", paddingRight: 32 }}>
                        <div style={{ fontSize: 32 }}>{action.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 8px 0", color: "#2D5016", fontSize: 18, fontWeight: 700 }}>
                            {action.title}
                          </h4>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#4A7C2F", background: "rgba(74, 124, 47, 0.1)", padding: "4px 8px", borderRadius: 8 }}>
                              Save ~{action.saving}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: action.difficulty === "Easy" ? "#4A7C2F" : action.difficulty === "Medium" ? "#F4A832" : "#D95D39", background: "rgba(0,0,0,0.05)", padding: "4px 8px", borderRadius: 8 }}>
                              {action.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ background: isSelected ? "rgba(255,255,255,0.5)" : "#FFF8E7", padding: "12px 16px", borderRadius: 12 }}>
                        <strong style={{ color: "#F4A832", fontSize: 12, display: "block", marginBottom: 4 }}>Why Verd recommends it:</strong>
                        <span style={{ color: "#2D5016", fontSize: 14 }}>{action.reason}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <AnimatePresence>
        {selectedIds.size > 0 && !coach.isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: "sticky", bottom: 24, zIndex: 10 }}
          >
            <button
              onClick={handleAddMissions}
              style={{
                width: "100%",
                padding: "16px",
                background: "#4A7C2F",
                color: "#FFF",
                border: "none",
                borderRadius: 16,
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(74, 124, 47, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8
              }}
            >
              <span style={{ fontSize: 20 }}>+</span> Add {selectedIds.size} Mission{selectedIds.size > 1 ? "s" : ""}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {(!activeMissions.some(m => !m.completed)) && (
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
