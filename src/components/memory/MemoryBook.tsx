"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import VerdActionCoach from "../coach/VerdActionCoach";

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

  const DoubleBezelCard = ({ children, style = {}, onClick, whileHover }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; whileHover?: any }) => {
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

  const renderTimelineEvent = (evt: any, isCompact: boolean = false) => {
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
        maxWidth: 680,
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
              <div style={{ position: "relative", paddingLeft: 20 }}>
                {/* Vertical line */}
                <div style={{ position: "absolute", left: 6, top: 20, bottom: 0, width: 2, background: "rgba(74,124,47,0.3)" }} />
                
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {[...memoryBook.stories].reverse().map((story, i) => {
                    const isExpanded = expandedStoryId === story.id;
                    return (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        style={{ position: "relative" }}
                      >
                        {/* Dot */}
                        <div style={{ position: "absolute", left: -20, top: 24, width: 12, height: 12, borderRadius: 6, background: "#4A7C2F", border: "2px solid #FFF8E7", zIndex: 2 }} />
                        
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", marginBottom: 8, paddingLeft: 4 }}>
                          {formatDate(story.date)}
                        </div>
                        
                        <motion.div
                          layout
                          whileHover={{ scale: 1.01 }}
                          onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 20, cursor: "pointer", border: "1px solid rgba(184,212,168,0.5)" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, background: "#4A7C2F", color: "white", padding: "4px 8px", borderRadius: 8 }}>
                                Carbon Story #{memoryBook.stories.length - i}
                              </span>
                              <span style={{ fontSize: 13, background: "rgba(74, 124, 47, 0.1)", color: "#4A7C2F", padding: "4px 8px", borderRadius: 12 }}>{story.planetMood}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                {isExpanded ? "Hide Details" : "View Details"}
                                <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} style={{ display: "inline-block" }}>▼</motion.span>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: 18, color: story.totalCarbonKg <= 0 ? "#2D7A1F" : "#A0401A" }}>
                                {story.totalCarbonKg <= 0 
                                  ? `Saved ${Math.abs(story.totalCarbonKg)} kg CO₂` 
                                  : `+${story.totalCarbonKg} kg CO₂`}
                              </span>
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
                                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                          <div style={{ fontSize: 12, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase" }}>{title}</div>
                                          {decs.map((d, di) => {
                                            const emoji = d.moment === "breakfast" ? "🌅" : d.moment === "commute" ? "🌆" : d.moment === "lunch" ? "🌞" : d.moment === "shopping" ? "🌇" : d.moment === "dinner" ? "🌙" : d.moment === "wind-down" ? "😴" : "✨";
                                            return (
                                              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: di * 0.05 }} key={di} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                                                <span>{emoji}</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: "#6B8F5E", width: 64, textTransform: "capitalize" }}>{d.moment}</span>
                                                <span style={{ flex: 1, color: "#2D5016", fontWeight: 500 }}>{d.choice}</span>
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: d.impactType === "eco" ? "rgba(74,124,47,0.1)" : d.impactType === "moderate" ? "rgba(244,168,50,0.15)" : "rgba(160,64,26,0.1)", color: d.impactType === "eco" ? "#4A7C2F" : d.impactType === "moderate" ? "#A06000" : "#A0401A" }}>
                                                  {d.impactType.toUpperCase()}
                                                </span>
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                      );
                                    };
                                    
                                    return (
                                      <>
                                        {renderDecisions("Chapter 1 — Morning", morning)}
                                        {renderDecisions("Chapter 2 — Evening", evening)}
                                      </>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
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
            <div style={{ marginBottom: 24, textAlign: "center" }}>
              <button
                onClick={() => router.push("/detective")}
                style={{ background: "linear-gradient(135deg, #4A7C2F 0%, #7BC67E 100%)", color: "white", padding: "12px 24px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 16, boxShadow: "0 4px 12px rgba(74,124,47,0.25)", width: "100%" }}
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  🧾 Analyze New Receipt
                </motion.div>
              </button>
            </div>
            {memoryBook.receipts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <p style={{ color: "#4A7C2F", marginBottom: 8 }}>No receipts analyzed yet.</p>
                <p style={{ color: "#6B8F5E", fontSize: 13, fontStyle: "italic" }}>Upload your first receipt to start tracking.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <AnimatePresence mode="popLayout">
                  {[...memoryBook.receipts].reverse().map((r, i) => {
                    const isExpanded = expandedReceiptId === r.id;
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, height: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setExpandedReceiptId(isExpanded ? null : r.id)}
                        key={r.id}
                        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 20, cursor: "pointer", border: "1px solid rgba(184,212,168,0.5)", position: "relative", overflow: "hidden" }}
                      >
                        {deletingReceiptId === r.id && (
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.95)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 20, textAlign: "center" }}>
                            <p style={{ margin: 0, color: "#2D5016", fontSize: 14, fontWeight: 600 }}>
                              Delete this receipt?<br/>
                              <span style={{ fontSize: 12, color: "rgba(45, 80, 22, 0.6)", fontWeight: 500 }}>This will also remove its carbon impact from your totals and timeline.</span>
                            </p>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button onClick={(e) => { e.stopPropagation(); setDeletingReceiptId(null); }} style={{ padding: "8px 16px", fontSize: 14, borderRadius: 12, border: "none", background: "#E8F0E3", color: "#4A7C2F", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
                              <button onClick={(e) => { e.stopPropagation(); deleteReceipt(r.id); setDeletingReceiptId(null); }} style={{ padding: "8px 16px", fontSize: 14, borderRadius: 12, border: "none", background: "#D95D39", color: "#FFF", cursor: "pointer", fontWeight: 700 }}>Delete</button>
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {/* TOP ROW: Merchant & Delete */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                              <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "#6B8F5E", marginBottom: 2 }}>
                                {r.receiptType} Receipt
                              </div>
                              <div style={{ fontWeight: 700, color: "#2D5016", fontSize: 16 }}>{r.merchantName}</div>
                              <div style={{ fontSize: 12, color: "#8B6914", marginTop: 2 }}>{formatDate(r.date)}</div>
                            </div>
                            
                            {/* Delete Pill Button */}
                            {!deletingReceiptId && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); setDeletingReceiptId(r.id); }} 
                                style={{ 
                                  padding: "6px 12px", 
                                  fontSize: 12, 
                                  borderRadius: 999, 
                                  border: "1px solid rgba(217, 93, 57, 0.3)", 
                                  background: "rgba(217, 93, 57, 0.05)", 
                                  color: "#D95D39", 
                                  cursor: "pointer", 
                                  fontWeight: 700, 
                                  display: "flex", 
                                  alignItems: "center", 
                                  gap: 4, 
                                  zIndex: 5,
                                  transition: "all 0.2s"
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(217, 93, 57, 0.15)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(217, 93, 57, 0.05)"; }}
                              >
                                🗑 Delete Receipt
                              </button>
                            )}
                          </div>

                          {/* MIDDLE ROW: Carbon Value and Details button */}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px dashed rgba(184,212,168,0.3)", paddingTop: 10 }}>
                            <div style={{ fontSize: 12, color: "#6B8F5E", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                              {isExpanded ? "Hide Details" : "View Details"}
                              <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} style={{ display: "inline-block" }}>▼</motion.span>
                            </div>
                            
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: 20, fontWeight: 800, color: r.totalCO2 > 20 ? "#A0401A" : "#4A7C2F" }}>
                                {r.totalCO2 <= 0 ? `Saved ${Math.abs(r.totalCO2)} kg CO₂` : `+${r.totalCO2} kg CO₂`}
                              </span>
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
                              <div style={{ paddingTop: 12, borderTop: "1px solid rgba(184,212,168,0.3)" }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#6B8F5E", marginBottom: 8 }}>Detected Items:</div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                  {r.items.map((item, ii) => (
                                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ii * 0.05 }} key={ii} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#2D5016" }}>
                                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%", fontWeight: 500 }}>
                                        {item.name}
                                      </span>
                                      <span style={{ fontWeight: 700, color: item.estimatedCO2 > 5 ? "#A0401A" : "#4A7C2F" }}>
                                        {item.estimatedCO2 <= 0 ? `Saved ${Math.abs(item.estimatedCO2)} kg` : `+${item.estimatedCO2} kg`}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
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
                      <h3 style={{ margin: 0, color: "#4A7C2F", fontSize: 13, fontWeight: 700 }}>Verd's Reflection</h3>
                      <span style={{ background: "rgba(74, 124, 47, 0.1)", padding: "2px 8px", borderRadius: 8, fontSize: 8, fontWeight: 700, color: "#4A7C2F", letterSpacing: "0.05em" }}>ECO COACH</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#2D5016", lineHeight: 1.5, fontWeight: 500, fontStyle: "italic" }}>
                      "{verdReflection}"
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
