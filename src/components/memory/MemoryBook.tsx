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
  const { memoryBook, activeMissions, achievements, totalCarbonDelta, deleteReceipt } = useSessionStore();
  const [activeTab, setActiveTab] = useState<Tab>("stories");
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);
  const [deletingReceiptId, setDeletingReceiptId] = useState<string | null>(null);
  const [expandedStoryImpact, setExpandedStoryImpact] = useState(false);
  const [expandedReceiptImpact, setExpandedReceiptImpact] = useState(false);

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

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 8 }}>
        <VerdOrb size={48} mood="eco" />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2D5016", marginTop: 12 }}>Carbon Memory Book 📖</h1>
        <p style={{ color: "#4A7C2F", fontSize: 15 }}>Your complete sustainability journey</p>
      </motion.div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, padding: 4, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", borderRadius: 20 }}>
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
              background: activeTab === tab ? "#4A7C2F" : "transparent",
              color: activeTab === tab ? "white" : "#6B8F5E",
              position: "relative",
              transition: "all 0.2s"
            }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{ position: "absolute", inset: 0, borderRadius: 16, background: "#4A7C2F", zIndex: -1 }}
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
          <motion.div key="totals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* SECTION 1: HERO CARD (Total Impact + Planet Mood) */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)", 
              borderRadius: 28, 
              padding: 32, 
              textAlign: "center", 
              border: "1px solid rgba(184,212,168,0.5)", 
              boxShadow: "0 12px 40px rgba(45,80,22,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24
            }}>
              {/* Total Impact */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.15em" }}>Total Impact</span>
                <span style={{ fontSize: 48, fontWeight: 800, color: (memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) <= 0 ? "#2D7A1F" : "#A0401A", marginTop: 6, letterSpacing: "-0.02em" }}>
                  {(memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) <= 0 
                    ? `Saved ${Math.abs(Math.round((memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) * 10) / 10)} kg CO₂` 
                    : `${Math.round((memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) * 10) / 10} kg CO₂`}
                </span>
              </div>
              
              {/* Planet Mood */}
              {(() => {
                const planetMood = useSessionStore.getState().worldState.planetMood;
                const getMoodTheme = (mood: string) => {
                  switch (mood) {
                    case "Thriving": return { emoji: "🌸", color: "#2D7A1F", bg: "rgba(240, 250, 240, 0.95)", border: "1px solid rgba(76, 175, 80, 0.3)" };
                    case "Recovering": return { emoji: "🌱", color: "#F4A832", bg: "rgba(255, 248, 230, 0.95)", border: "1px solid rgba(244, 168, 50, 0.3)" };
                    case "Under Stress": return { emoji: "⚠️", color: "#FF6B6B", bg: "rgba(255, 107, 107, 0.05)", border: "1px solid rgba(255, 107, 107, 0.2)" };
                    default: return { emoji: "🌿", color: "#4A7C2F", bg: "rgba(240, 250, 240, 0.8)", border: "1px solid rgba(184, 212, 168, 0.5)" };
                  }
                };
                const moodTheme = getMoodTheme(planetMood);
                return (
                  <div style={{ background: moodTheme.bg, borderRadius: 20, padding: "16px 24px", border: moodTheme.border, boxShadow: "0 6px 20px rgba(45, 80, 22, 0.04)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%", maxWidth: 360 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.05em" }}>🌎 Planet Mood</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: moodTheme.color, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span>{moodTheme.emoji}</span>
                      <span>{planetMood}</span>
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* SECTION 2: CARBON BREAKDOWN (Side by side cards) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Story Choices Card */}
              <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 20, border: "1px solid rgba(184,212,168,0.5)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, boxShadow: "0 4px 16px rgba(45,80,22,0.04)" }}>
                <span style={{ fontSize: 32 }}>📖</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase" }}>Story Choices</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: memoryBook.totalStoryCO2 <= 0 ? "#2D7A1F" : "#A0401A" }}>
                  {memoryBook.totalStoryCO2 <= 0 ? `Saved ${Math.abs(Math.round(memoryBook.totalStoryCO2 * 10) / 10)}` : `+${Math.round(memoryBook.totalStoryCO2 * 10) / 10}`} <span style={{ fontSize: 16 }}>kg</span>
                </span>
              </div>
              {/* Receipt Analysis Card */}
              <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: 20, padding: 20, border: "1px solid rgba(184,212,168,0.5)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, boxShadow: "0 4px 16px rgba(45,80,22,0.04)" }}>
                <span style={{ fontSize: 32 }}>🧾</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase" }}>Receipt Analysis</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: memoryBook.totalReceiptCO2 <= 0 ? "#2D7A1F" : "#A0401A" }}>
                  {memoryBook.totalReceiptCO2 <= 0 ? `Saved ${Math.abs(Math.round(memoryBook.totalReceiptCO2 * 10) / 10)}` : `+${Math.round(memoryBook.totalReceiptCO2 * 10) / 10}`} <span style={{ fontSize: 16 }}>kg</span>
                </span>
              </div>
            </div>

            {/* SECTION 3: BIGGEST CONTRIBUTOR CARD */}
            {(() => {
              const sorted = Object.entries(cats).sort((a, b) => b[1].value - a[1].value);
              const highestCat = sorted[0];
              if (!highestCat || highestCat[1].value === 0) return null;
              
              const emojis: Record<string, string> = { transport: "🚗", food: "🍔", shopping: "🛍️", electricity: "⚡" };

              return (
                <div style={{ background: "rgba(255, 248, 230, 0.75)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "20px 24px", border: "1px solid rgba(244, 168, 50, 0.35)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, boxShadow: "0 8px 24px rgba(45, 80, 22, 0.05)" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#8B6914", display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <span>{emojis[highestCat[0]] || "📊"}</span> Biggest Impact
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#2D5016", marginTop: 2, textTransform: "capitalize" }}>
                    {highestCat[0]}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#6B8F5E" }}>
                    {highestCat[1].pct}% of footprint
                  </span>
                </div>
              );
            })()}

            {/* SECTION 4: VERD INSIGHT CARD */}
            {(() => {
              const sorted = Object.entries(cats).sort((a, b) => b[1].value - a[1].value);
              const highestId = sorted[0]?.[0];
              if (!highestId || cats[highestId as keyof typeof cats].value === 0) return null;
              
              const suggestions: Record<string, string> = {
                transport: "Taking public transport reduces emissions by up to 80%. Try taking the metro or bus for your next commute.",
                food: "Meat production has a high carbon footprint. Try swapping one meal a day for a plant-based alternative.",
                shopping: "Fast fashion and heavy shipping add up. Consider buying from local stores or choosing second-hand items.",
                electricity: "Power generation can be carbon-heavy. Make sure to switch off unnecessary lights and unplug devices."
              };

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  style={{ background: "#FFF", borderRadius: 24, padding: 24, display: "flex", gap: 20, alignItems: "center", boxShadow: "0 8px 32px rgba(45, 80, 22, 0.05)" }}
                >
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ flexShrink: 0 }}>
                    <VerdOrb size={64} mood="eco" />
                  </motion.div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, color: "#4A7C2F", fontSize: 16, fontWeight: 700 }}>Verd's Insight</h3>
                      <span style={{ background: "rgba(74, 124, 47, 0.1)", padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700, color: "#4A7C2F" }}>AI COACH</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#4A7C2F", lineHeight: 1.6 }}>
                      Most of your impact came from <strong style={{textTransform: "capitalize"}}>{highestId}</strong>. {suggestions[highestId]}
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Active & Completed Missions */}
            <div>
              <h2 style={{ margin: "0 0 16px 0", color: "#2D5016", fontSize: 20, fontWeight: 700 }}>🎯 Active Missions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                <AnimatePresence>
                  {activeMissions.filter(m => !m.completed).map((mission) => (
                    <motion.div 
                      key={mission.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0 }}
                      style={{ background: "#FFF", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(45, 80, 22, 0.04)", display: "flex", gap: 16, alignItems: "center" }}
                    >
                      <div style={{ fontSize: 32 }}>{mission.emoji}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: "0 0 4px 0", color: "#2D5016", fontSize: 16, fontWeight: 700 }}>{mission.title}</h4>
                        <p style={{ margin: 0, color: "rgba(45, 80, 22, 0.6)", fontSize: 14 }}>{mission.description}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                        <div style={{ background: "rgba(244, 168, 50, 0.1)", color: "#F4A832", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          🌱 Active
                        </div>
                        <div style={{ fontSize: 12, color: "#4A7C2F", fontWeight: 600 }}>{mission.reward}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {activeMissions.filter(m => !m.completed).length === 0 && (
                  <div style={{ textAlign: "center", padding: 20, color: "#6B8F5E", fontStyle: "italic", fontSize: 14, background: "rgba(255,255,255,0.4)", borderRadius: 16 }}>
                    No active missions right now. Add some from the Coach! 💡
                  </div>
                )}
              </div>

              {activeMissions.filter(m => m.completed).length > 0 && (
                <>
                  <h3 style={{ margin: "24px 0 16px 0", color: "#2D5016", fontSize: 18, fontWeight: 700 }}>✓ Completed Missions</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    <AnimatePresence>
                      {activeMissions.filter(m => m.completed).map((mission) => (
                        <motion.div 
                          key={mission.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 0.8, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, height: 0 }}
                          style={{ background: "#FFF", borderRadius: 20, padding: 20, boxShadow: "0 4px 16px rgba(45, 80, 22, 0.02)", display: "flex", gap: 16, alignItems: "center" }}
                        >
                          <div style={{ fontSize: 32, opacity: 0.6 }}>{mission.emoji}</div>
                          <div style={{ flex: 1, opacity: 0.8 }}>
                            <h4 style={{ margin: "0 0 4px 0", color: "#2D5016", fontSize: 16, fontWeight: 700, textDecoration: "line-through" }}>{mission.title}</h4>
                            <p style={{ margin: 0, color: "rgba(45, 80, 22, 0.6)", fontSize: 14 }}>{mission.description}</p>
                            {mission.completedAt && (
                              <span style={{ fontSize: 11, color: "#6B8F5E", display: "block", marginTop: 4 }}>
                                Completed on: {formatDate(mission.completedAt)}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                            <div style={{ background: "rgba(74, 124, 47, 0.1)", color: "#4A7C2F", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                              ✓ Completed
                            </div>
                            <div style={{ fontSize: 12, color: "#6B8F5E", fontWeight: 600 }}>{mission.reward}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Carbon Timeline */}
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2D5016", marginBottom: 20 }}>Carbon Timeline ⏳</div>
              {memoryBook.timelineEvents?.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#6B8F5E", fontStyle: "italic", fontSize: 14 }}>
                  Your journey starts here. Make choices to see events!
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", paddingLeft: 16 }}>
                  <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "rgba(184,212,168,0.5)" }} />
                  {[...(memoryBook.timelineEvents || [])].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((evt, idx) => {
                    const isEco = evt.carbonDelta && evt.carbonDelta < 0;
                    const isHigh = evt.carbonDelta && evt.carbonDelta > 0;
                    const color = evt.type === "achievement_earned" ? "#F4A832" : isEco ? "#4CAF50" : isHigh ? "#A0401A" : "#4A7C2F";
                    const dotColor = evt.type === "achievement_earned" ? "#F4A832" : "#4A7C2F";
                    
                    return (
                      <motion.div key={evt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.8)", padding: 12, borderRadius: 12 }}>
                        <div style={{ position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)", width: 10, height: 10, borderRadius: 5, background: dotColor, border: "2px solid #FFF8E7" }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#2D5016" }}>{evt.title}</div>
                          <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600 }}>{formatDate(evt.date)}</div>
                        </div>
                        {evt.carbonDelta !== undefined && evt.carbonDelta !== 0 && (
                          <div style={{ fontSize: 15, fontWeight: 800, color }}>
                            {evt.carbonDelta < 0 
                              ? `Saved ${Math.abs(Math.round(evt.carbonDelta * 10) / 10)} kg` 
                              : `+${Math.round(evt.carbonDelta * 10) / 10} kg`}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
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
    </div>
  );
}
