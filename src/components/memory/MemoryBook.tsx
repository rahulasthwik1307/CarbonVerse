"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import VerdActionCoach from "../coach/VerdActionCoach";

const moodThemes: Record<string, { bg: string; border: string; text: string; emoji: string; title: string; connectorEmoji: string }> = {
  "Thriving": {
    bg: "linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(76, 175, 80, 0.35)",
    text: "#2D7A1F",
    emoji: "🌸",
    title: "Thriving Future",
    connectorEmoji: "🌸"
  },
  "Recovering": {
    bg: "linear-gradient(135deg, rgba(240, 250, 240, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(184, 212, 168, 0.6)",
    text: "#4A7C2F",
    emoji: "🌱",
    title: "Recovering Future",
    connectorEmoji: "🌿"
  },
  "Stable": {
    bg: "linear-gradient(135deg, rgba(245, 248, 242, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(184, 212, 168, 0.45)",
    text: "#4A7C2F",
    emoji: "🌿",
    title: "Stable Future",
    connectorEmoji: "🌱"
  },
  "Under Stress": {
    bg: "linear-gradient(135deg, rgba(254, 243, 199, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(244, 168, 50, 0.35)",
    text: "#B8860B",
    emoji: "⚠️",
    title: "Under Stress Future",
    connectorEmoji: "🍂"
  },
  "Critical Future": {
    bg: "linear-gradient(135deg, rgba(254, 226, 226, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(239, 68, 68, 0.35)",
    text: "#A0401A",
    emoji: "🔥",
    title: "Critical Future",
    connectorEmoji: "🪨"
  }
};

const getMoodTheme = (mood: string) => {
  const normalized = mood ? mood.trim() : "Stable";
  if (moodThemes[normalized]) return moodThemes[normalized];
  if (normalized.includes("Stress")) return moodThemes["Under Stress"];
  if (normalized.includes("Critical")) return moodThemes["Critical Future"];
  if (normalized.includes("Thriv")) return moodThemes["Thriving"];
  if (normalized.includes("Recov")) return moodThemes["Recovering"];
  return moodThemes["Stable"];
};

const getMomentEmoji = (moment: string, choice: string) => {
  const lowerChoice = choice.toLowerCase();
  const lowerMoment = moment.toLowerCase();
  
  if (lowerMoment === "breakfast") {
    if (lowerChoice.includes("plant") || lowerChoice.includes("vegan") || lowerChoice.includes("oat") || lowerChoice.includes("fruit")) return "🥗";
    if (lowerChoice.includes("egg") || lowerChoice.includes("toast")) return "🍳";
    return "🥣";
  }
  if (lowerMoment === "commute") {
    if (lowerChoice.includes("metro") || lowerChoice.includes("train") || lowerChoice.includes("subway")) return "🚇";
    if (lowerChoice.includes("walk") || lowerChoice.includes("foot")) return "🚶";
    if (lowerChoice.includes("cycle") || lowerChoice.includes("bike")) return "🚲";
    if (lowerChoice.includes("carpool") || lowerChoice.includes("cab") || lowerChoice.includes("taxi")) return "🚕";
    return "🚗";
  }
  if (lowerMoment === "lunch") {
    if (lowerChoice.includes("plant") || lowerChoice.includes("veg") || lowerChoice.includes("salad")) return "🥗";
    if (lowerChoice.includes("tiffin") || lowerChoice.includes("home")) return "🍱";
    return "🍲";
  }
  if (lowerMoment === "shopping") {
    if (lowerChoice.includes("kirana") || lowerChoice.includes("local") || lowerChoice.includes("corner")) return "🏪";
    if (lowerChoice.includes("mall") || lowerChoice.includes("supermarket")) return "🛒";
    return "🛍️";
  }
  if (lowerMoment === "dinner") {
    if (lowerChoice.includes("plant") || lowerChoice.includes("veg") || lowerChoice.includes("paneer")) return "🍛";
    if (lowerChoice.includes("meat") || lowerChoice.includes("chicken") || lowerChoice.includes("steak")) return "🥩";
    return "🥘";
  }
  if (lowerMoment === "wind-down") {
    if (lowerChoice.includes("book") || lowerChoice.includes("read")) return "📚";
    if (lowerChoice.includes("meditate") || lowerChoice.includes("yoga")) return "🧘";
    if (lowerChoice.includes("stream") || lowerChoice.includes("tv") || lowerChoice.includes("movie") || lowerChoice.includes("screen")) return "📺";
    return "😴";
  }
  return "✨";
};

const getGardenSnapshot = (decisions: Array<{ impactType: "eco" | "moderate" | "high" }>) => {
  const ecoCount = decisions.filter(d => d.impactType === "eco").length;
  const highCount = decisions.filter(d => d.impactType === "high").length;
  
  if (ecoCount >= 5) return ["🌳", "🌸", "🦋"];
  if (ecoCount >= 3) return ["🌱", "🌱", "🌸"];
  if (highCount >= 4) return ["🍂", "🪨", "🪨"];
  if (highCount >= 2) return ["🌱", "🪨", "🪨"];
  return ["🌿", "🌱", "🌿"];
};

const receiptThemes: Record<string, { bg: string; border: string; text: string; emoji: string; title: string }> = {
  "food": {
    bg: "linear-gradient(135deg, rgba(240, 248, 235, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(184, 212, 168, 0.5)",
    text: "#4A7C2F",
    emoji: "🍲",
    title: "Food Impact"
  },
  "restaurant": {
    bg: "linear-gradient(135deg, rgba(255, 248, 230, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(244, 168, 50, 0.35)",
    text: "#A06000",
    emoji: "🍽️",
    title: "Dining Impact"
  },
  "grocery": {
    bg: "linear-gradient(135deg, rgba(240, 250, 245, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(123, 198, 126, 0.4)",
    text: "#2D7A1F",
    emoji: "🥦",
    title: "Grocery Impact"
  },
  "electricity": {
    bg: "linear-gradient(135deg, rgba(235, 248, 250, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(118, 180, 189, 0.4)",
    text: "#1D5D66",
    emoji: "⚡",
    title: "Electricity Impact"
  },
  "fuel": {
    bg: "linear-gradient(135deg, rgba(255, 240, 230, 0.85) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(244, 130, 50, 0.35)",
    text: "#A0401A",
    emoji: "⛽",
    title: "Fuel Impact"
  },
  "shopping": {
    bg: "linear-gradient(135deg, rgba(242, 240, 250, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%)",
    border: "rgba(180, 168, 212, 0.4)",
    text: "#52447C",
    emoji: "🛍️",
    title: "Shopping Impact"
  }
};

const getReceiptTheme = (type: string) => {
  const normalized = type ? type.toLowerCase().trim() : "food";
  if (receiptThemes[normalized]) return receiptThemes[normalized];
  if (normalized.includes("rest") || normalized.includes("dine") || normalized.includes("dining")) return receiptThemes["restaurant"];
  if (normalized.includes("groc")) return receiptThemes["grocery"];
  if (normalized.includes("elec") || normalized.includes("util") || normalized.includes("power")) return receiptThemes["electricity"];
  if (normalized.includes("fuel") || normalized.includes("gas") || normalized.includes("travel") || normalized.includes("trans")) return receiptThemes["fuel"];
  if (normalized.includes("shop") || normalized.includes("retail") || normalized.includes("buy")) return receiptThemes["shopping"];
  return receiptThemes["food"];
};

const getItemEmoji = (name: string) => {
  const norm = name.toLowerCase();
  if (norm.includes("paneer") || norm.includes("cheese") || norm.includes("butter")) return "🧀";
  if (norm.includes("biryani") || norm.includes("rice") || norm.includes("pulao")) return "🍛";
  if (norm.includes("noodle") || norm.includes("chow")) return "🍜";
  if (norm.includes("milk") || norm.includes("dairy")) return "🥛";
  if (norm.includes("vegetable") || norm.includes("veg") || norm.includes("salad") || norm.includes("spinach") || norm.includes("paneer salad")) return "🥗";
  if (norm.includes("petrol") || norm.includes("fuel") || norm.includes("gas") || norm.includes("diesel")) return "⛽";
  if (norm.includes("electric") || norm.includes("bill") || norm.includes("power")) return "⚡";
  if (norm.includes("apple") || norm.includes("fruit") || norm.includes("banana")) return "🍎";
  if (norm.includes("water") || norm.includes("soda") || norm.includes("drink")) return "🥤";
  if (norm.includes("bread") || norm.includes("naan") || norm.includes("roti")) return "🍞";
  if (norm.includes("hotel") || norm.includes("stay") || norm.includes("room")) return "🏨";
  return "📦";
};

const DoubleBezelCard = ({ children, style = {}, onClick, whileHover }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; whileHover?: import("framer-motion").VariantLabels | import("framer-motion").TargetAndTransition }) => {
  return (
    <motion.div
      whileHover={whileHover}
      onClick={onClick}
      style={{
        background: "rgba(240, 250, 240, 0.4)",
        border: "1px solid rgba(184, 212, 168, 0.4)",
        borderRadius: 24,
        padding: 6,
        cursor: onClick ? "pointer" : "default",
        ...style
      }}
    >
      <div style={{
        background: "white",
        border: "1px solid rgba(184, 212, 168, 0.7)",
        borderRadius: 18,
        padding: 16,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {children}
      </div>
    </motion.div>
  );
};

type Tab = "stories" | "receipts" | "totals" | "coach";

export default function MemoryBook() {
  const router = useRouter();
  const { memoryBook, activeMissions, achievements, totalCarbonDelta, deleteReceipt, worldState } = useSessionStore();
  const [activeTab, setActiveTab] = useState<Tab>("stories");
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);
  const [deletingReceiptId, setDeletingReceiptId] = useState<string | null>(null);
  const [expandedStoryImpact, setExpandedStoryImpact] = useState(false);
  const [expandedReceiptImpact, setExpandedReceiptImpact] = useState(false);
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);
  const [showAllTimeline, setShowAllTimeline] = useState(false);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  };

  const calculateCategories = () => {
    let transport = 0, food = 0, shopping = 0, electricity = 0;
    memoryBook.stories.forEach(s => {
      s.decisions.forEach(d => {
        const amt = Math.abs(d.carbonKg);
        if (d.moment === "commute") transport += amt;
        if (["breakfast", "lunch", "dinner"].includes(d.moment)) food += amt;
        if (d.moment === "shopping") shopping += amt;
        if (d.moment === "wind-down") electricity += amt;
      });
    });
    
    memoryBook.receipts.forEach(r => {
      const amt = r.totalCO2;
      if (r.receiptType === "fuel" || r.receiptType === "transport") transport += amt;
      else if (r.receiptType === "food" || r.receiptType === "grocery") food += amt;
      else if (r.receiptType === "shopping" || r.receiptType === "retail") shopping += amt;
      else if (r.receiptType === "electricity") electricity += amt;
    });

    const total = transport + food + shopping + electricity || 1;
    return {
      transport: { value: transport, pct: Math.round((transport/total)*100) },
      food: { value: food, pct: Math.round((food/total)*100) },
      shopping: { value: shopping, pct: Math.round((shopping/total)*100) },
      electricity: { value: electricity, pct: Math.round((electricity/total)*100) }
    };
  };

  const cats = calculateCategories();

  const getStoryImpact = () => {
    let impact = 0;
    const breakdown: Record<string, number> = {
      breakfast: 0, commute: 0, lunch: 0, shopping: 0, dinner: 0, "wind-down": 0
    };
    memoryBook.stories.forEach(s => {
      impact += s.totalCarbonKg;
      s.decisions.forEach(d => {
        breakdown[d.moment] = (breakdown[d.moment] || 0) + d.carbonKg;
      });
    });
    return { impact, breakdown };
  };
  const storyData = getStoryImpact();

  const getBestChoice = () => {
    let best: { choice: string; carbonKg: number; moment: string } | null = null;
    memoryBook.stories.forEach(s => {
      s.decisions.forEach(d => {
        if (d.impactType === "eco" && (!best || d.carbonKg < best.carbonKg)) {
          best = { choice: d.choice, carbonKg: d.carbonKg, moment: d.moment };
        }
      });
    });
    return best;
  };
  const bestChoice = getBestChoice() as { choice: string; carbonKg: number; moment: string } | null;

  const getBiggestImpactArea = () => {
    const sorted = Object.entries(cats).sort((a, b) => b[1].value - a[1].value);
    const highest = sorted[0];
    if (highest && highest[1].value > 0) {
      return { name: highest[0], pct: highest[1].pct, value: highest[1].value };
    }
    return null;
  };
  const biggestImpact = getBiggestImpactArea();

  const getLatestAchievement = () => {
    const unlocked = achievements
      .filter(a => a.unlockedAt)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime());
    return unlocked[0] || null;
  };
  const latestAchievement = getLatestAchievement();

  const getActiveMission = () => {
    const active = activeMissions.filter(m => !m.completed);
    return active[0] || null;
  };
  const activeMission = getActiveMission();

  const getVerdReflection = () => {
    if (memoryBook.stories.length === 0 && memoryBook.receipts.length === 0) {
      return "Welcome to CarbonVerse! Your sustainability story is ready to be written. Complete a story chapter or analyze a receipt to see your first reflections here.";
    }

    const biggest = biggestImpact;
    const streak = memoryBook.streakDays || 0;
    const totalSaved = Math.abs(memoryBook.totalCO2Saved || 0);

    if (biggest) {
      if (biggest.name === "transport") {
        return `Your transport footprint is your largest impact area at ${biggest.pct}%. Swapping to public transit or walking more will make a huge difference.`;
      }
      if (biggest.name === "food") {
        return `Food choices are currently contributing ${biggest.pct}% to your impact. Swapping some meals for plant-based dishes will help heal the soil.`;
      }
      if (biggest.name === "shopping") {
        return `Shopping and consumer items account for ${biggest.pct}% of your carbon footprints. Choosing local markets and second-hand items will lower this impact.`;
      }
      if (biggest.name === "electricity") {
        return `Home electricity accounts for ${biggest.pct}% of your footprint. Small shifts like switching off lights and unplugging devices will build up fast.`;
      }
    }

    if (streak >= 3) {
      return `You are on a ${streak}-day eco streak! Consistency is becoming a habit. Your planet's atmosphere is recovering beautifully.`;
    }

    if (totalSaved > 20) {
      return `Incredible! You have saved a total of ${totalSaved.toFixed(1)} kg of CO₂. Every small action you take is helping rewrite our planet's future.`;
    }

    return "You've made several eco-friendly choices recently. Let's keep exploring new ways to reduce our carbon footprints together!";
  };
  const verdReflection = getVerdReflection();



  const renderJourneyHighlights = () => {
    return (
      <div className="grid grid-cols-2 gap-3" style={{ height: "100%" }}>
        {/* Best Choice */}
        <div style={{
          background: "rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(184, 212, 168, 0.4)",
          borderRadius: 16,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", display: "flex", alignItems: "center", gap: 4 }}>
            <span>🌟</span> Best Choice
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 4 }}>
            {bestChoice ? bestChoice.choice : "None yet"}
          </div>
          <div style={{ fontSize: 11, color: "#4A7C2F" }}>
            {bestChoice ? `${Math.abs(bestChoice.carbonKg)} kg saved` : "Start a run!"}
          </div>
        </div>

        {/* Biggest Impact Area */}
        <div style={{
          background: "rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(184, 212, 168, 0.4)",
          borderRadius: 16,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", display: "flex", alignItems: "center", gap: 4 }}>
            <span>🌍</span> Main Impact
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D5016", textTransform: "capitalize", marginTop: 4 }}>
            {biggestImpact ? biggestImpact.name : "None"}
          </div>
          <div style={{ fontSize: 11, color: "#4A7C2F" }}>
            {biggestImpact ? `${biggestImpact.pct}% of total` : "No data yet"}
          </div>
        </div>

        {/* Latest Achievement */}
        <div style={{
          background: "rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(184, 212, 168, 0.4)",
          borderRadius: 16,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", display: "flex", alignItems: "center", gap: 4 }}>
            <span>🏆</span> Latest Badge
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 4 }}>
            {latestAchievement ? `${latestAchievement.emoji} ${latestAchievement.title}` : "None yet"}
          </div>
          <div style={{ fontSize: 11, color: "#4A7C2F" }}>
            {latestAchievement ? "Unlocked!" : "Keep acting!"}
          </div>
        </div>

        {/* Current Active Mission */}
        <div style={{
          background: "rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(184, 212, 168, 0.4)",
          borderRadius: 16,
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", display: "flex", alignItems: "center", gap: 4 }}>
            <span>🎯</span> Active Mission
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 4 }}>
            {activeMission ? `${activeMission.emoji} ${activeMission.title}` : "All completed!"}
          </div>
          <div style={{ fontSize: 11, color: "#4A7C2F" }}>
            {activeMission ? activeMission.reward : "Visit Coach!"}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveMissions = () => {
    const activeList = activeMissions.filter(m => !m.completed);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#2D5016", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <span>🎯</span> Active Missions
        </h3>
        
        {activeList.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "16px 8px",
            color: "#6B8F5E",
            fontStyle: "italic",
            fontSize: 13,
            background: "rgba(255,255,255,0.4)",
            borderRadius: 16,
            border: "1px dashed rgba(184,212,168,0.4)"
          }}>
            All clear! Visit the Coach to add more. 💡
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeList.slice(0, 3).map((mission) => (
              <motion.div
                key={mission.id}
                whileHover={{ scale: 1.01 }}
                style={{
                  background: "#FFF",
                  border: "1px solid rgba(184,212,168,0.5)",
                  borderRadius: 16,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(45,80,22,0.02)"
                }}
              >
                <div style={{ fontSize: 24, flexShrink: 0 }}>{mission.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <h4 style={{ margin: 0, color: "#2D5016", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {mission.title}
                    </h4>
                    <span style={{ 
                      fontSize: 9, 
                      fontWeight: 700, 
                      color: "#F4A832", 
                      background: "rgba(244,168,50,0.1)", 
                      padding: "2px 6px", 
                      borderRadius: 6,
                      flexShrink: 0
                    }}>
                      ACTIVE
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0 0", color: "#6B8F5E", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {mission.description}
                  </p>
                  {mission.targetCount > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(74,124,47,0.1)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ 
                          height: "100%", 
                          width: `${(mission.currentCount / mission.targetCount) * 100}%`, 
                          background: "#4A7C2F" 
                        }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#4A7C2F" }}>
                        {mission.currentCount}/{mission.targetCount}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, color: "#4A7C2F", fontWeight: 700, background: "rgba(74,124,47,0.06)", padding: "4px 8px", borderRadius: 8, flexShrink: 0 }}>
                  🎁 {mission.reward}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTimelineEvent = (evt: { id: string; date: string; type: string; title: string; carbonDelta?: number }, isCompact: boolean = false) => {
    const isEco = evt.carbonDelta && evt.carbonDelta < 0;
    const isHigh = evt.carbonDelta && evt.carbonDelta > 0;
    const color = evt.type === "achievement_earned" ? "#F4A832" : isEco ? "#4CAF50" : isHigh ? "#A0401A" : "#4A7C2F";
    const dotColor = evt.type === "achievement_earned" ? "#F4A832" : "#4A7C2F";
    const icon = evt.type === "achievement_earned" ? "🏆" : isEco ? "✓" : isHigh ? "⚠" : "•";

    return (
      <div 
        key={evt.id} 
        style={{ 
          position: "relative", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          background: "rgba(255,255,255,0.85)", 
          padding: "8px 12px", 
          borderRadius: 12,
          border: "1px solid rgba(184,212,168,0.3)",
          boxShadow: "0 2px 6px rgba(45,80,22,0.01)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div style={{ 
            width: 20, 
            height: 20, 
            borderRadius: 10, 
            background: dotColor + "20", 
            color: dotColor, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            fontSize: 11,
            fontWeight: 800,
            flexShrink: 0
          }}>
            {icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontSize: 12, 
              fontWeight: 700, 
              color: "#2D5016",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {evt.title}
            </div>
            <div style={{ fontSize: 10, color: "#6B8F5E", fontWeight: 600 }}>{formatDate(evt.date)}</div>
          </div>
        </div>
        {evt.carbonDelta !== undefined && evt.carbonDelta !== 0 && (
          <div style={{ fontSize: 13, fontWeight: 800, color, flexShrink: 0, marginLeft: 8 }}>
            {evt.carbonDelta < 0 
              ? `Saved ${Math.abs(Math.round(evt.carbonDelta * 10) / 10)} kg` 
              : `+${Math.round(evt.carbonDelta * 10) / 10} kg`}
          </div>
        )}
      </div>
    );
  };

  const renderRecentMoments = () => {
    const sortedEvents = [...(memoryBook.timelineEvents || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentEvents = sortedEvents.slice(0, 3);
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h3 style={{ margin: 0, color: "#2D5016", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span>⏳</span> Recent Moments
          </h3>
          {sortedEvents.length > 3 && (
            <button
              onClick={() => setShowAllTimeline(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "#4A7C2F",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                padding: "2px 6px",
                borderRadius: 8,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              View Full Timeline →
            </button>
          )}
        </div>
        
        {recentEvents.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "16px 8px",
            color: "#6B8F5E",
            fontStyle: "italic",
            fontSize: 13,
            background: "rgba(255,255,255,0.4)",
            borderRadius: 16,
            border: "1px dashed rgba(184,212,168,0.4)"
          }}>
            Your timeline is empty. Make choices to see events!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentEvents.map(evt => renderTimelineEvent(evt, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      style={{
        maxWidth: 920,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        background: "rgba(255, 255, 255, 0.88)",
        border: "1px solid rgba(184, 212, 168, 0.6)",
        borderRadius: 32,
        boxShadow: "0 20px 50px rgba(45, 80, 22, 0.12)",
        backdropFilter: "blur(16px)",
        position: "relative",
        zIndex: 10
      }}
      className="w-full p-5 md:p-8"
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(184, 212, 168, 0.3)", paddingBottom: 16 }}>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ flexShrink: 0 }}
        >
          <VerdOrb size={64} mood="eco" />
        </motion.div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2D5016", margin: 0, letterSpacing: "-0.01em" }}>
            Carbon Memory Book 📖
          </h1>
          <p style={{ color: "#4A7C2F", fontSize: 14, margin: 0, fontWeight: 500 }}>
            Your complete sustainability journey
          </p>
        </div>
      </div>

      {/* TABS */}
      <div style={{ 
        display: "flex", 
        gap: 6, 
        padding: 4, 
        background: "rgba(74, 124, 47, 0.05)", 
        border: "1px solid rgba(184, 212, 168, 0.3)", 
        borderRadius: 20,
        marginBottom: 4
      }}>
        {(["stories", "receipts", "totals", "coach"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 16,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: "transparent",
              color: activeTab === tab ? "white" : "#6B8F5E",
              position: "relative",
              transition: "all 0.2s"
            }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{ 
                  position: "absolute", 
                  inset: 0, 
                  borderRadius: 16, 
                  background: "#4A7C2F", 
                  zIndex: -1,
                  boxShadow: "0 4px 12px rgba(74,124,47,0.15)"
                }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              {tab === "stories" ? "📖 Stories" : tab === "receipts" ? "🧾 Receipts" : tab === "totals" ? "📊 Totals" : "💡 Coach"}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === "stories" && (
          <motion.div key="stories" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {memoryBook.stories.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <VerdOrb size={40} />
                <p style={{ color: "#4A7C2F", marginTop: 16, marginBottom: 24 }}>No stories yet. Begin your first story!</p>
                <button
                  onClick={() => router.push("/story")}
                  style={{ background: "#4A7C2F", color: "white", padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Start Story
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                {[...memoryBook.stories].reverse().map((story, i, arr) => {
                  const isExpanded = expandedStoryId === story.id;
                  const theme = getMoodTheme(story.planetMood);
                  
                  // Emojis for preview strip
                  const previewEmojis = story.decisions.slice(0, 3).map(d => getMomentEmoji(d.moment, d.choice));
                  
                  // Garden memory emojis
                  const gardenEmojis = getGardenSnapshot(story.decisions);
                  
                  // Carbon Impact pill elements
                  const isEco = story.totalCarbonKg <= 0;
                  const impactLabel = isEco 
                    ? `Saved ${Math.abs(story.totalCarbonKg)} kg CO₂` 
                    : `+${story.totalCarbonKg} kg CO₂`;
                  const impactEmoji = isEco ? "🌿" : "🔥";
                  const impactBg = isEco ? "rgba(76, 175, 80, 0.12)" : "rgba(244, 168, 50, 0.12)";
                  const impactColor = isEco ? "#2D7A1F" : "#A0401A";
                  const impactBorder = isEco ? "rgba(76, 175, 80, 0.25)" : "rgba(244, 168, 50, 0.25)";
                  
                  return (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.12, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      style={{ display: "flex", gap: 16 }}
                    >
                      {/* Softer progression connector */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                        <div style={{ 
                          width: 2, 
                          flex: "0 0 16px", 
                          background: i === 0 ? "transparent" : "rgba(184, 212, 168, 0.5)" 
                        }} />
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "white",
                          border: `1.5px solid ${theme.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          boxShadow: "0 2px 8px rgba(45,80,22,0.06)",
                          zIndex: 2
                        }}>
                          {theme.connectorEmoji}
                        </div>
                        <div style={{ 
                          width: 2, 
                          flex: 1, 
                          background: i === arr.length - 1 ? "transparent" : "rgba(184, 212, 168, 0.5)" 
                        }} />
                      </div>
                      
                      {/* Story Card */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#6B8F5E", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>{formatDate(story.date)}</span>
                          <span style={{ fontSize: 11, color: "rgba(45,80,22,0.4)" }}>Carbon Story #{arr.length - i}</span>
                        </div>
                        
                        <motion.div
                          layout
                          whileHover={{ scale: 1.015, translateY: -2, boxShadow: "0 8px 24px rgba(45,80,22,0.06)" }}
                          onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                          style={{ 
                            background: theme.bg, 
                            backdropFilter: "blur(12px)", 
                            borderRadius: 20, 
                            padding: "20px 24px", 
                            cursor: "pointer", 
                            border: `1.5px solid ${theme.border}`,
                            transition: "box-shadow 0.3s ease, border-color 0.3s ease"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                            {/* Left Side: Title and Garden Memory */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 18, fontWeight: 800, color: "#2D5016", letterSpacing: "-0.01em" }}>
                                  {theme.emoji} {theme.title}
                                </span>
                              </div>
                              
                              {/* Garden Memory Snapshot & Story Preview Emojis */}
                              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                {/* Garden Snapshot */}
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: 4, 
                                  background: "rgba(255, 255, 255, 0.6)",
                                  border: "1px solid rgba(184, 212, 168, 0.3)",
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontSize: 11
                                }}>
                                  <span style={{ color: "#6B8F5E", fontWeight: 700, fontSize: 9, marginRight: 2 }}>GARDEN:</span>
                                  {gardenEmojis.map((e, ei) => <span key={ei}>{e}</span>)}
                                </div>
                                
                                {/* Memory strip preview */}
                                <div style={{ 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: 4, 
                                  background: "rgba(255, 255, 255, 0.6)",
                                  border: "1px solid rgba(184, 212, 168, 0.3)",
                                  padding: "2px 8px",
                                  borderRadius: 8,
                                  fontSize: 11
                                }}>
                                  <span style={{ color: "#6B8F5E", fontWeight: 700, fontSize: 9, marginRight: 2 }}>JOURNEY:</span>
                                  {previewEmojis.map((e, ei) => <span key={ei}>{e}</span>)}
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Side: Carbon pill and Toggle action */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {/* Carbon impact pill */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 12px",
                                borderRadius: 999,
                                background: impactBg,
                                color: impactColor,
                                border: `1.5px solid ${impactBorder}`,
                                fontSize: 12,
                                fontWeight: 800,
                                boxShadow: "0 2px 6px rgba(45,80,22,0.02)"
                              }}>
                                <span>{impactEmoji}</span>
                                <span>{impactLabel}</span>
                              </div>
                              
                              <div style={{ fontSize: 11, color: "#4A7C2F", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(184,212,168,0.4)", padding: "6px 12px", borderRadius: 12 }}>
                                <span>{isExpanded ? "📖 Close Memory" : "📖 Revisit Memory"}</span>
                                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} style={{ display: "inline-block" }}>▼</motion.span>
                              </div>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: "hidden", marginTop: 16 }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16, borderTop: "1px solid rgba(184,212,168,0.3)" }}>
                                  {(() => {
                                    const morning = story.decisions.filter(d => ["breakfast", "commute", "lunch"].includes(d.moment));
                                    const evening = story.decisions.filter(d => ["shopping", "dinner", "wind-down"].includes(d.moment));
                                    
                                    const renderDecisions = (title: string, decs: typeof story.decisions) => {
                                      if (decs.length === 0) return null;
                                      return (
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                          <div style={{ 
                                            fontSize: 12, 
                                            fontWeight: 700, 
                                            color: "#4A7C2F", 
                                            borderBottom: "1px dashed rgba(184, 212, 168, 0.4)",
                                            paddingBottom: 4,
                                            marginTop: 6
                                          }}>
                                            {title}
                                          </div>
                                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                            {decs.map((d, di) => {
                                              const emoji = getMomentEmoji(d.moment, d.choice);
                                              
                                              let impactBg = "rgba(74, 124, 47, 0.1)";
                                              let impactColor = "#4A7C2F";
                                              let impactLabel = "ECO";
                                              
                                              if (d.impactType === "moderate") {
                                                impactBg = "rgba(244, 168, 50, 0.12)";
                                                impactColor = "#A06000";
                                                impactLabel = "MODERATE";
                                              } else if (d.impactType === "high") {
                                                impactBg = "rgba(160, 64, 26, 0.1)";
                                                impactColor = "#A0401A";
                                                impactLabel = "HIGH";
                                              }
                                              
                                              return (
                                                <motion.div 
                                                  initial={{ opacity: 0, x: -10 }} 
                                                  animate={{ opacity: 1, x: 0 }} 
                                                  transition={{ delay: di * 0.05 }} 
                                                  key={di} 
                                                  style={{ 
                                                    display: "flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "space-between",
                                                    gap: 12, 
                                                    fontSize: 13,
                                                    background: "rgba(255, 255, 255, 0.5)",
                                                    padding: "8px 12px",
                                                    borderRadius: 12,
                                                    border: "1px solid rgba(184, 212, 168, 0.2)"
                                                  }}
                                                >
                                                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                                    <span style={{ fontSize: 16 }}>{emoji}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", width: 68, textTransform: "capitalize" }}>{d.moment}</span>
                                                    <span style={{ color: "#2D5016", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                      {d.choice}
                                                    </span>
                                                  </div>
                                                  <span style={{ 
                                                    fontSize: 9, 
                                                    fontWeight: 800, 
                                                    padding: "2px 8px", 
                                                    borderRadius: 999, 
                                                    background: impactBg, 
                                                    color: impactColor,
                                                    flexShrink: 0
                                                  }}>
                                                    {impactLabel}
                                                  </span>
                                                </motion.div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      );
                                    };
                                    
                                    return (
                                      <>
                                        {renderDecisions("🌅 Chapter 1 — Morning Recount", morning)}
                                        {renderDecisions("🌙 Chapter 2 — Evening Recount", evening)}
                                      </>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    </motion.div>
                  );
                })}
                {memoryBook.stories.length === 1 && (
                  <div style={{ marginTop: 24, paddingLeft: 20, fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
                    Play again to add more chapters to your timeline! 🌱
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "receipts" && (
          <motion.div key="receipts" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {/* Redesigned Analyze Receipt Button (Glassmorphic Action Card) */}
            <div style={{ marginBottom: 20 }}>
              <motion.div
                whileHover={{ scale: 1.015, translateY: -2, boxShadow: "0 8px 24px rgba(74, 124, 47, 0.08)" }}
                whileTap={{ scale: 0.985 }}
                onClick={() => router.push("/detective")}
                style={{
                  background: "rgba(255, 255, 255, 0.65)",
                  backdropFilter: "blur(12px)",
                  border: "1.5px solid rgba(184, 212, 168, 0.5)",
                  borderRadius: 20,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  boxShadow: "0 4px 12px rgba(45, 80, 22, 0.03)",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "rgba(74, 124, 47, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#4A7C2F",
                    border: "1px solid rgba(184, 212, 168, 0.4)"
                  }}>
                    🔍
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#2D5016" }}>
                      Start a New Carbon Investigation
                    </span>
                    <span style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 500 }}>
                      Analyze a receipt with Verd to reveal item-level emissions insights.
                    </span>
                  </div>
                </div>
                <div style={{
                  background: "#4A7C2F",
                  color: "white",
                  padding: "6px 14px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  boxShadow: "0 2px 6px rgba(74, 124, 47, 0.15)"
                }}>
                  Upload
                </div>
              </motion.div>
            </div>

            {memoryBook.receipts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ color: "#4A7C2F", marginBottom: 8 }}>No receipts analyzed yet.</p>
                <p style={{ color: "#6B8F5E", fontSize: 13, fontStyle: "italic" }}>Upload your first receipt to start tracking.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <AnimatePresence mode="popLayout">
                  {[...memoryBook.receipts].reverse().map((r) => {
                    const isExpanded = expandedReceiptId === r.id;
                    const theme = getReceiptTheme(r.receiptType);
                    
                    // Preview chips (max 3 items)
                    const previewItems = r.items.slice(0, 3);
                    
                    // Programmatic Verd insight
                    const sortedItems = [...r.items].sort((a, b) => b.estimatedCO2 - a.estimatedCO2);
                    const maxItem = sortedItems[0];
                    let verdInsight = "Plant-based or lower carbon choices kept this footprint minimal.";
                    if (maxItem && maxItem.estimatedCO2 > 2) {
                      verdInsight = `${maxItem.name} contributed most of this receipt's impact.`;
                    } else if (r.receiptType === "electricity") {
                      verdInsight = "Home electricity usage accounts for a steady baseline footprint.";
                    } else if (r.receiptType === "fuel") {
                      verdInsight = "Fuel emissions build up quickly. Consider active travel offsets.";
                    }
                    
                    // Carbon Impact Capsule based on r.totalCO2
                    let impactLabel = "Low Impact";
                    let impactEmoji = "🌿";
                    let impactBg = "rgba(76, 175, 80, 0.12)";
                    let impactColor = "#2D7A1F";
                    let impactBorder = "rgba(76, 175, 80, 0.25)";
                    
                    if (r.totalCO2 > 15) {
                      impactLabel = "High Impact";
                      impactEmoji = "🔥";
                      impactBg = "rgba(217, 93, 57, 0.12)";
                      impactColor = "#D95D39";
                      impactBorder = "rgba(217, 93, 57, 0.25)";
                    } else if (r.totalCO2 > 3) {
                      impactLabel = "Moderate Impact";
                      impactEmoji = "🌍";
                      impactBg = "rgba(244, 168, 50, 0.12)";
                      impactColor = "#A06000";
                      impactBorder = "rgba(244, 168, 50, 0.25)";
                    }
                    
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.92, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        onClick={() => setExpandedReceiptId(isExpanded ? null : r.id)}
                        key={r.id}
                        whileHover={{ scale: 1.012, translateY: -1, boxShadow: "0 6px 18px rgba(45,80,22,0.04)" }}
                        style={{ 
                          background: theme.bg, 
                          backdropFilter: "blur(12px)", 
                          borderRadius: 20, 
                          padding: "14px 18px", 
                          cursor: "pointer", 
                          border: `1.5px solid ${theme.border}`, 
                          position: "relative", 
                          overflow: "hidden",
                          transition: "box-shadow 0.3s ease, border-color 0.3s ease"
                        }}
                      >
                        {deletingReceiptId === r.id && (
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.96)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 12, textAlign: "center" }}>
                            <p style={{ margin: 0, color: "#2D5016", fontSize: 13, fontWeight: 700 }}>
                              Delete this receipt?<br/>
                              <span style={{ fontSize: 11, color: "rgba(45, 80, 22, 0.6)", fontWeight: 500 }}>This will also remove its carbon impact from your totals and timeline.</span>
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={(e) => { e.stopPropagation(); setDeletingReceiptId(null); }} style={{ padding: "6px 12px", fontSize: 12, borderRadius: 10, border: "none", background: "#E8F0E3", color: "#4A7C2F", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteReceipt(r.id); setDeletingReceiptId(null); }} style={{ padding: "6px 12px", fontSize: 12, borderRadius: 10, border: "none", background: "#D95D39", color: "#FFF", cursor: "pointer", fontWeight: 700 }}>Delete</button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {/* Top row: Category, Merchant, Date & Delete */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                              <div style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: "rgba(255, 255, 255, 0.6)",
                                border: `1px solid ${theme.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                flexShrink: 0
                              }}>
                                {theme.emoji}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 10, fontWeight: 750, color: theme.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                  {theme.title}
                                </div>
                                <div style={{ fontWeight: 700, color: "#2D5016", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {r.merchantName}
                                </div>
                              </div>
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                              <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 500 }}>
                                {formatDate(r.date).split(" • ")[0]}
                              </div>
                              
                              {/* Delete Pill Button - smaller and softer */}
                              {!deletingReceiptId && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingReceiptId(r.id); }} 
                                  style={{ 
                                    width: 24,
                                    height: 24,
                                    borderRadius: 8,
                                    border: "1px solid rgba(217, 93, 57, 0.2)", 
                                    background: "rgba(217, 93, 57, 0.04)", 
                                    color: "#D95D39", 
                                    cursor: "pointer", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    fontSize: 12,
                                    zIndex: 5,
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(217, 93, 57, 0.12)"; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(217, 93, 57, 0.04)"; }}
                                  title="Delete Receipt"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Middle row: Preview Chips & Verd Insight */}
                          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 2 }}>
                            {/* Top 3 items preview chips */}
                            {previewItems.map((item, ii) => (
                              <div key={ii} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: 4, 
                                background: "rgba(255, 255, 255, 0.55)",
                                border: "1px solid rgba(184, 212, 168, 0.25)",
                                padding: "2px 8px",
                                borderRadius: 6,
                                fontSize: 10,
                                fontWeight: 550,
                                color: "#4A7C2F"
                              }}>
                                <span>{getItemEmoji(item.name)}</span>
                                <span>{item.name}</span>
                              </div>
                            ))}
                            
                            {/* Verd dynamic insight */}
                            <div style={{
                              fontSize: 11,
                              color: "#6B8F5E",
                              fontWeight: 500,
                              fontStyle: "italic",
                              flex: "1 1 auto",
                              minWidth: 150,
                              display: "flex",
                              alignItems: "center",
                              gap: 4
                            }}>
                              <span>💡</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
                                {verdInsight}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Row: Impact Badge & Trigger button */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed rgba(184,212,168,0.25)", paddingTop: 8, marginTop: 2 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {/* Impact Badge */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                borderRadius: 999,
                                background: impactBg,
                                color: impactColor,
                                border: `1.5px solid ${impactBorder}`,
                                fontSize: 10,
                                fontWeight: 800,
                              }}>
                                <span>{impactEmoji}</span>
                                <span>{impactLabel}</span>
                              </div>
                              
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#2D5016" }}>
                                {r.totalCO2 <= 0 ? `Saved ${Math.abs(r.totalCO2)} kg` : `+${r.totalCO2} kg CO₂`}
                              </span>
                            </div>

                            <div style={{ fontSize: 11, color: "#4A7C2F", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.75)", border: "1px solid rgba(184,212,168,0.35)", padding: "4px 10px", borderRadius: 10 }}>
                              <span>{isExpanded ? "🔍 Hide Analysis" : "🔍 Open Analysis"}</span>
                              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} style={{ display: "inline-block" }}>▼</motion.span>
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              style={{ overflow: "hidden", marginTop: 12 }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12, borderTop: "1px solid rgba(184,212,168,0.25)" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                  Carbon Breakdown
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {r.items.map((item, ii) => {
                                    const emoji = getItemEmoji(item.name);
                                    
                                    let itemImpactBg = "rgba(76, 175, 80, 0.1)";
                                    let itemImpactColor = "#2D7A1F";
                                    let itemImpactLabel = "Low";
                                    
                                    if (item.estimatedCO2 > 5) {
                                      itemImpactBg = "rgba(217, 93, 57, 0.1)";
                                      itemImpactColor = "#D95D39";
                                      itemImpactLabel = "High";
                                    } else if (item.estimatedCO2 > 1.5) {
                                      itemImpactBg = "rgba(244, 168, 50, 0.1)";
                                      itemImpactColor = "#A06000";
                                      itemImpactLabel = "Moderate";
                                    }
                                    
                                    return (
                                      <motion.div 
                                        initial={{ opacity: 0, x: -10 }} 
                                        animate={{ opacity: 1, x: 0 }} 
                                        transition={{ delay: ii * 0.05 }} 
                                        key={ii} 
                                        style={{ 
                                          display: "flex", 
                                          alignItems: "center", 
                                          justifyContent: "space-between",
                                          gap: 12, 
                                          fontSize: 13,
                                          background: "rgba(255, 255, 255, 0.5)",
                                          padding: "8px 12px",
                                          borderRadius: 12,
                                          border: "1px solid rgba(184, 212, 168, 0.15)"
                                        }}
                                      >
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                          <span style={{ fontSize: 15 }}>{emoji}</span>
                                          <span style={{ color: "#2D5016", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {item.name}
                                          </span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                                          <span style={{ 
                                            fontSize: 9, 
                                            fontWeight: 800, 
                                            padding: "2px 6px", 
                                            borderRadius: 999, 
                                            background: itemImpactBg, 
                                            color: itemImpactColor,
                                          }}>
                                            {itemImpactLabel}
                                          </span>
                                          <span style={{ fontWeight: 700, color: "#2D5016" }}>
                                            {item.estimatedCO2 <= 0 ? `Saved ${Math.abs(item.estimatedCO2)} kg` : `+${item.estimatedCO2} kg`}
                                          </span>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>

                                {/* Verd's detailed analysis highlighted panel */}
                                {(() => {
                                  let analysisText = "Excellent selection of low carbon choices! Swapping these items for local organic variants helps heal the atmosphere further.";
                                  if (maxItem && maxItem.estimatedCO2 > 5) {
                                    analysisText = `Most emissions came from ${maxItem.name}. Swapping this to a plant-based alternative next time could save up to ${Math.round(maxItem.estimatedCO2 * 0.5 * 10) / 10} kg CO₂.`;
                                  } else if (maxItem && maxItem.estimatedCO2 > 2) {
                                    analysisText = `${maxItem.name} contributed moderately to this run. Opting for seasonal local variants can lower this baseline footprint.`;
                                  }
                                  
                                  return (
                                    <div style={{
                                      background: "rgba(255, 248, 230, 0.6)",
                                      border: "1px dashed rgba(244, 168, 50, 0.4)",
                                      borderRadius: 14,
                                      padding: "10px 14px",
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 10,
                                      marginTop: 4
                                    }}>
                                      <span style={{ fontSize: 16, marginTop: 1 }}>🌱</span>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: "#A06000", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                          Verd&apos;s Analysis
                                        </span>
                                        <span style={{ fontSize: 11, color: "#4A3212", fontWeight: 550, lineHeight: 1.45 }}>
                                          {analysisText}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "totals" && (
          <motion.div key="totals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* SECTION 1: BENTO HERO DASHBOARD */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Impact Card */}
              <DoubleBezelCard
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(45,80,22,0.06)" }}
                style={{ background: "rgba(255, 248, 230, 0.4)" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>Journey Impact</span>
                  <span style={{ 
                    fontSize: 22, 
                    fontWeight: 800, 
                    color: (memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) <= 0 ? "#2D7A1F" : "#A0401A"
                  }}>
                    {(memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) <= 0 
                      ? `Saved ${Math.abs(Math.round((memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) * 10) / 10)} kg` 
                      : `+${Math.round((memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) * 10) / 10} kg`}
                  </span>
                  <span style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 500 }}>Net CO₂ footprint</span>
                </div>
              </DoubleBezelCard>

              {/* Planet Mood Card */}
              {(() => {
                const getMoodTheme = (mood: string) => {
                  switch (mood) {
                    case "Thriving": return { emoji: "🌸", color: "#2D7A1F", bg: "rgba(240, 250, 240, 0.4)" };
                    case "Recovering": return { emoji: "🌱", color: "#F4A832", bg: "rgba(255, 248, 230, 0.4)" };
                    case "Under Stress": return { emoji: "⚠️", color: "#FF6B6B", bg: "rgba(255, 107, 107, 0.05)" };
                    default: return { emoji: "🌿", color: "#4A7C2F", bg: "rgba(240, 250, 240, 0.2)" };
                  }
                };
                const moodTheme = getMoodTheme(worldState?.planetMood || "Stable");
                return (
                  <DoubleBezelCard
                    whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(45,80,22,0.06)" }}
                    style={{ background: moodTheme.bg }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>Planet Mood</span>
                      <span style={{ fontSize: 22, fontWeight: 800, color: moodTheme.color, display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{moodTheme.emoji}</span>
                        <span>{worldState?.planetMood || "Stable"}</span>
                      </span>
                      <span style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 500 }}>Current global state</span>
                    </div>
                  </DoubleBezelCard>
                );
              })()}

              {/* Story Choices Card */}
              <DoubleBezelCard
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(45,80,22,0.06)" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>Story Choices</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: memoryBook.totalStoryCO2 <= 0 ? "#2D7A1F" : "#A0401A" }}>
                    {memoryBook.totalStoryCO2 <= 0 ? `Saved ${Math.abs(Math.round(memoryBook.totalStoryCO2 * 10) / 10)}` : `+${Math.round(memoryBook.totalStoryCO2 * 10) / 10}`} <span style={{ fontSize: 13, fontWeight: 550, color: "#6B8F5E" }}>kg</span>
                  </span>
                  <span style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 500 }}>{memoryBook.stories.length} runs completed</span>
                </div>
              </DoubleBezelCard>

              {/* Receipt Analysis Card */}
              <DoubleBezelCard
                whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(45,80,22,0.06)" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.08em" }}>Receipts</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: memoryBook.totalReceiptCO2 <= 0 ? "#2D7A1F" : "#A0401A" }}>
                    {memoryBook.totalReceiptCO2 <= 0 ? `Saved ${Math.abs(Math.round(memoryBook.totalReceiptCO2 * 10) / 10)}` : `+${Math.round(memoryBook.totalReceiptCO2 * 10) / 10}`} <span style={{ fontSize: 13, fontWeight: 550, color: "#6B8F5E" }}>kg</span>
                  </span>
                  <span style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 500 }}>{memoryBook.receipts.length} analyzed</span>
                </div>
              </DoubleBezelCard>
            </div>

            {/* SECTIONS 2 & 3: JOURNEY HIGHLIGHTS & VERD'S REFLECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Verd's Reflection */}
              <DoubleBezelCard>
                <div style={{ display: "flex", gap: 14, alignItems: "center", height: "100%" }}>
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    style={{ flexShrink: 0 }}
                  >
                    <VerdOrb size={48} mood="eco" />
                  </motion.div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <h3 style={{ margin: 0, color: "#4A7C2F", fontSize: 13, fontWeight: 700 }}>Verd&apos;s Reflection</h3>
                      <span style={{ background: "rgba(74, 124, 47, 0.1)", padding: "2px 8px", borderRadius: 8, fontSize: 8, fontWeight: 700, color: "#4A7C2F", letterSpacing: "0.05em" }}>ECO COACH</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#2D5016", lineHeight: 1.5, fontWeight: 500, fontStyle: "italic" }}>
                      &ldquo;{verdReflection}&rdquo;
                    </div>
                  </div>
                </div>
              </DoubleBezelCard>

              {/* Journey Highlights */}
              {renderJourneyHighlights()}
            </div>

            {/* SECTION 4: ACHIEVEMENT GARDEN */}
            <div style={{
              background: "rgba(255,255,255,0.7)", 
              backdropFilter: "blur(12px)", 
              borderRadius: 24, 
              padding: 16, 
              border: "1px solid rgba(184,212,168,0.5)",
              boxShadow: "0 4px 24px rgba(45,80,22,0.04)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, color: "#2D5016", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🏆</span> Achievement Garden
                </h3>
                <span style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 700 }}>
                  {achievements.filter(a => a.unlockedAt).length} / {achievements.length} Unlocked
                </span>
              </div>
              
              <div style={{ position: "relative" }}>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                  {achievements.map((ach) => {
                    const isUnlocked = !!ach.unlockedAt;
                    return (
                      <div
                        key={ach.id}
                        onMouseEnter={() => setHoveredBadgeId(ach.id)}
                        onMouseLeave={() => setHoveredBadgeId(null)}
                        style={{ position: "relative" }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.08, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            aspectRatio: "1/1",
                            borderRadius: 16,
                            background: isUnlocked 
                              ? "linear-gradient(135deg, #FFF 0%, #F0FAF0 100%)" 
                              : "rgba(240, 240, 240, 0.4)",
                            border: isUnlocked 
                              ? "2px solid #F4A832" 
                              : "2px dashed #B8D4A8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 22,
                            cursor: "pointer",
                            filter: isUnlocked ? "none" : "grayscale(100%) opacity(40%)",
                            boxShadow: isUnlocked ? "0 4px 12px rgba(244,168,50,0.12)" : "none",
                            position: "relative"
                          }}
                        >
                          <span>{ach.emoji}</span>
                          {!isUnlocked && (
                            <div style={{
                              position: "absolute",
                              bottom: -2,
                              right: -2,
                              fontSize: 9,
                              background: "#FFF",
                              borderRadius: "50%",
                              width: 12,
                              height: 12,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: "1px solid #B8D4A8"
                            }}>
                              🔒
                            </div>
                          )}
                        </motion.div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Badge Tooltip */}
                <AnimatePresence>
                  {hoveredBadgeId && (() => {
                    const ach = achievements.find(a => a.id === hoveredBadgeId);
                    if (!ach) return null;
                    const isUnlocked = !!ach.unlockedAt;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "100%",
                          marginTop: 10,
                          background: "#FFF8E7",
                          border: "1px solid #B8D4A8",
                          borderRadius: 12,
                          padding: "10px 14px",
                          zIndex: 30,
                          boxShadow: "0 8px 24px rgba(45,80,22,0.08)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, color: "#2D5016", fontSize: 12 }}>{ach.title}</span>
                          <span style={{ 
                            fontSize: 9, 
                            fontWeight: 700, 
                            color: isUnlocked ? "#2D7A1F" : "#A0401A",
                            background: isUnlocked ? "rgba(76,175,80,0.1)" : "rgba(160,64,26,0.1)",
                            padding: "2px 6px",
                            borderRadius: 6
                          }}>
                            {isUnlocked ? "UNLOCKED" : "LOCKED"}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: "#4A7C2F", fontSize: 11 }}>{ach.description}</p>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>

            {/* SECTIONS 5 & 6: ACTIVE MISSIONS & RECENT TIMELINE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Active Missions */}
              {renderActiveMissions()}

              {/* Recent Moments */}
              {renderRecentMoments()}
            </div>

            {/* Full Timeline Modal */}
            <AnimatePresence>
              {showAllTimeline && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(45, 80, 22, 0.4)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 50,
                  padding: 16
                }}>
                  {/* Backdrop */}
                  <div 
                    onClick={() => setShowAllTimeline(false)} 
                    style={{ position: "absolute", inset: 0 }} 
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.23, ease: [0.23, 1, 0.32, 1] }}
                    style={{
                      background: "#FFF8E7",
                      border: "1px solid #B8D4A8",
                      borderRadius: 24,
                      padding: 20,
                      width: "100%",
                      maxWidth: 440,
                      maxHeight: "75vh",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      zIndex: 51,
                      boxShadow: "0 20px 40px rgba(45,80,22,0.15)"
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid rgba(184,212,168,0.3)", paddingBottom: 10 }}>
                      <h3 style={{ margin: 0, color: "#2D5016", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        <span>⏳</span> Carbon Timeline Logs
                      </h3>
                      <button
                        onClick={() => setShowAllTimeline(false)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          border: "none",
                          background: "rgba(74, 124, 47, 0.1)",
                          color: "#4A7C2F",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: 14,
                          fontWeight: 700
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Scrollable Content */}
                    <div style={{ 
                      flex: 1, 
                      overflowY: "auto", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: 8, 
                      paddingRight: 2,
                      scrollbarWidth: "none"
                    }}>
                      <style>{`
                        .timeline-scroll::-webkit-scrollbar { display: none; }
                      `}</style>
                      <div className="timeline-scroll" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {[...(memoryBook.timelineEvents || [])]
                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(evt => renderTimelineEvent(evt, false))
                        }
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Coach Tab */}
        {activeTab === "coach" && (
          <motion.div
            key="coach"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VerdActionCoach />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}