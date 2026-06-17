"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import VerdOrb from "@/components/ui/VerdOrb";
import LandingWorld from "@/components/world/LandingWorld";
import { useSessionStore } from "@/lib/session-store";
import MemoryBookButton from "@/components/ui/MemoryBookButton";

export default function SummaryPage() {
  const router = useRouter();
  const {
    profile,
    worldState,
    decisions,
    resetSession,
    activeMissions,
  } = useSessionStore();

  const [showDecisions, setShowDecisions] = useState(false);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handlePlayAgain = () => {
    resetSession();
    router.push("/");
  };

  // ── Derived state ──────────────────────────────────────────────
  const totalCarbon = decisions.reduce((sum, d) => sum + d.carbonDelta, 0);
  const isEco = totalCarbon < 0;

  const ecoCount      = decisions.filter(d => d.impactType === "eco").length;
  const highCount     = decisions.filter(d => d.impactType === "high").length;
  const moderateCount = decisions.filter(d => d.impactType === "moderate").length;

  const chapter1Decisions = decisions.filter(d => d.chapter === 1);
  const chapter2Decisions = decisions.filter(d => d.chapter === 2);

  const unlockedMissions = activeMissions?.filter(m => !m.completed) ?? [];

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // ── Derived categories ─────────────────────────────────────────
  const getCategory = (choice: string) => {
    const lower = choice.toLowerCase();
    if (lower.match(/cab|car|drive|bus|train|walk|cycle|flight|metro/i)) return { name: "Transport", emoji: "🚗", color: "#22C55E" };
    if (lower.match(/burger|meat|food|vegan|vegetarian|salad|meal|dhaba|tiffin/i)) return { name: "Food", emoji: "🍔", color: "#F59E0B" };
    if (lower.match(/game|stream|light|ac|heater|electricity|read/i)) return { name: "Electricity", emoji: "⚡", color: "#3B82F6" };
    return { name: "Other", emoji: "🛍️", color: "#9CA3AF" };
  };

  const categoryTotals = new Map<string, { impact: number, emoji: string, color: string }>();
  decisions.forEach(d => {
    const cat = getCategory(d.choice);
    const impact = Math.abs(d.carbonDelta);
    if (!categoryTotals.has(cat.name)) {
      categoryTotals.set(cat.name, { impact: 0, emoji: cat.emoji, color: cat.color });
    }
    categoryTotals.get(cat.name)!.impact += impact;
  });

  const totalAbs = Array.from(categoryTotals.values()).reduce((sum, c) => sum + c.impact, 0) || 1;
  
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  let currentOffset = 0;

  const breakdown = Array.from(categoryTotals.entries()).map(([name, data]) => {
    const pct = Math.round((data.impact / totalAbs) * 100);
    const strokeDasharray = `${(pct / 100) * circ} ${circ}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += (pct / 100) * circ;
    
    return {
      name,
      emoji: data.emoji,
      color: data.color,
      impact: data.impact,
      pct,
      strokeDasharray,
      strokeDashoffset,
    };
  }).sort((a, b) => b.pct - a.pct).filter(b => b.pct > 0);

  const biggestContributor = breakdown.length > 0 ? breakdown[0] : null;

  const getBadgeSubtitle = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.match(/commute|transport|walk|bus|train|metro/)) return "Transport Hero Badge";
    if (lower.match(/green plate|food|vegan|vegetarian|meal/)) return "Eco Food Hero Badge";
    if (lower.match(/local|buy|shop|market/)) return "Community Hero Badge";
    if (lower.match(/power|light|energy|ac|heater/)) return "Energy Hero Badge";
    return "Eco Hero Badge";
  };

  // ── Fetch action plan ──────────────────────────────────────────
  useEffect(() => {
    const fetchActionPlan = async () => {
      setLoadingPlan(true);
      try {
        const highImpact = decisions.filter(d => d.impactType === "high").map(d => d.choice);
        const eco        = decisions.filter(d => d.impactType === "eco").map(d => d.choice);

        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "action_plan",
            impactType: isEco ? "eco" : "high",
            worldState,
            city: profile.city || "your city",
            chapter: `High impact choices: ${highImpact.join(", ") || "none"}.
                      Eco choices: ${eco.join(", ") || "none"}.
                      Generate exactly 4 specific action items for tomorrow.
                      Format: Return ONLY a JSON array of 4 strings.
                      Each string starts with an emoji.
                      Example: ["🚶 Walk to the nearby shop","🥗 Try a vegetarian lunch"]`,
            aqi: 75,
          }),
        });

        const data = await res.json();

        try {
          const parsed = JSON.parse(data.narrative);
          if (Array.isArray(parsed)) {
            setActionPlan(parsed.slice(0, 4));
          } else throw new Error("not array");
        } catch {
          const plan: string[] = [];
          if (highImpact.some(d => /cab|car/i.test(d)))       plan.push("🚇 Try public transport tomorrow");
          if (highImpact.some(d => /burger|meat/i.test(d)))   plan.push("🥗 Try one vegetarian meal");
          if (highImpact.some(d => /delivery|mall/i.test(d))) plan.push("🛒 Buy from a local shop");
          if (highImpact.some(d => /game|stream/i.test(d)))   plan.push("💡 Switch off unused devices");
          const fallback = ["🌱 Carry a reusable water bottle","🚶 Walk for trips under 1km","🥗 Try a plant-based breakfast","♻️ Sort your recyclables today"];
          while (plan.length < 4) plan.push(fallback[plan.length]);
          setActionPlan(plan);
        }
      } catch {
        setActionPlan(["🚶 Walk or cycle for short trips","🥗 Try one plant-based meal","🛒 Shop locally when possible","💡 Switch off unused appliances"]);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchActionPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Colours ────────────────────────────────────────────────────
  const accent       = isEco ? "#7EC86A"                : "#F4A832";
  const accentGlow   = isEco ? "rgba(126,200,106,0.22)" : "rgba(244,168,50,0.22)";
  const accentShadow = isEco ? "rgba(74,200,100,0.14)"  : "rgba(255,140,50,0.14)";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <main style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <LandingWorld />

      <div
        style={{
          position: "absolute", inset: 0, zIndex: 20,
          overflowY: showDecisions ? "auto" : "hidden", overscrollBehavior: "none", scrollbarWidth: "none", msOverflowStyle: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: showDecisions ? "flex-start" : "center",
          padding: showDecisions ? "32px 16px" : "16px",
        }}
      >

        <style>{`
          ::-webkit-scrollbar { display: none; }

          @media (max-width: 640px) {
            .bento-grid {
              grid-template-columns: 1fr !important;
            }
            .story-decisions-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            width: "100%", maxWidth: 900,
            display: "flex", flexDirection: "column", 
            gap: showDecisions ? 12 : 8,
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(184, 212, 168, 0.5)",
            borderRadius: 32,
            padding: showDecisions ? 24 : 16,
            boxShadow: "0 8px 40px rgba(45, 80, 22, 0.10)",
          }}
        >

          {/* ═══════════════════════════════════════════════════════
              CINEMATIC HERO
          ═══════════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                position: "relative",
                background: "rgba(255, 248, 231, 0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(184, 212, 168, 0.6)",
                boxShadow: "0 4px 24px rgba(45, 80, 22, 0.08)",
                borderRadius: 24,
                padding: showDecisions ? "24px 28px" : "16px 20px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: showDecisions ? 20 : 16,
              }}
            >
            {/* Ambient glow blob */}
            <div style={{
              position: "absolute", top: -70, right: -70,
              width: 240, height: 240, borderRadius: "50%",
              background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />

            {/* Verd — celebrating inside the hero */}
            <motion.div
              animate={{ y: [0, -9, 0], rotate: [0, 6, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ flexShrink: 0 }}
            >
              <VerdOrb size={showDecisions ? 70 : 54} />
            </motion.div>

            {/* Headline block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <motion.div
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#F4A832", marginBottom: 5,
                }}>
                  Chapter Complete ✦
                </div>

                <h1 style={{
                  fontSize: 24, fontWeight: 900, lineHeight: 1.2,
                  color: "#2D5016", margin: 0,
                }}>
                  {dayName} Changed Your World
                </h1>

                <p style={{
                  fontSize: 13, color: "#6B8F5E",
                  margin: "7px 0 0", lineHeight: 1.5,
                }}>
                  Your choices wrote today's story —{" "}
                  <span style={{ color: "#2D5016", fontWeight: 700 }}>
                    {decisions.length} decisions
                  </span>{" "}
                  shaped this chapter.
                </p>
              </motion.div>
            </div>

            <div style={{
              flexShrink: 0,
              padding: "7px 14px",
              background: "rgba(74,124,47,0.1)",
              border: "1px solid #B8D4A8",
              borderRadius: 30,
              fontSize: 12, fontWeight: 600,
              color: "#4A7C2F",
              whiteSpace: "nowrap",
            }}>
              🌍 {worldState.planetMood}
            </div>
          </motion.div>


          {/* ═══════════════════════════════════════════════════════
              ASYMMETRIC BENTO GRID
          ═══════════════════════════════════════════════════════ */}
          <div
            className="bento-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 1fr",
              gap: 10,
              alignItems: "stretch",
            }}
          >
            {/* ── IMPACT CARD ────────────── */}
            <motion.div
              className="impact-card"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0 }}
              style={{
                background: isEco ? "rgba(240, 250, 240, 0.95)" : "rgba(255, 248, 231, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 24,
                padding: showDecisions ? "20px 18px" : "14px 16px",
                border: `1.5px solid ${isEco ? "rgba(76,175,80,0.3)" : "rgba(244,168,50,0.35)"}`,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(45, 80, 22, 0.08)",
              }}
            >
              {/* Decorative Animated Car watermark */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: isEco ? 0.2 : 0.15, x: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
                style={{
                  position: "absolute",
                  bottom: -5,
                  right: -10,
                  fontSize: 70,
                  lineHeight: 1,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                🚗
              </motion.div>

              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: isEco ? "rgba(126,200,106,0.75)" : "rgba(255,168,80,0.75)",
                  marginBottom: showDecisions ? 10 : 4, alignSelf: "flex-start"
                }}>
                  TOTAL IMPACT
                </div>

                {/* Donut Chart Container */}
                <div style={{ position: "relative", width: 124, height: 124, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="124" height="124" viewBox="0 0 124 124" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                    {/* Background Ring */}
                    <circle cx="62" cy="62" r="52" fill="none" stroke="rgba(184,212,168,0.2)" strokeWidth="12" />
                    
                    {/* Data Rings */}
                    {breakdown.map((b, i) => (
                      <motion.circle
                        key={i}
                        cx="62" cy="62" r="52"
                        fill="none"
                        stroke={b.color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circ}` }}
                        animate={{ strokeDasharray: b.strokeDasharray }}
                        transition={{ duration: 1.2, delay: 0.4 + i * 0.1, ease: "easeOut" }}
                        style={{ strokeDashoffset: b.strokeDashoffset }}
                      />
                    ))}
                  </svg>

                  {/* Center Text */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
                    <motion.div
                      initial={{ scale: 0.75, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.55, duration: 0.55, ease: "backOut" }}
                      style={{
                        fontSize: 28, fontWeight: 900, lineHeight: 1.1,
                        color: isEco ? "#2D7A1F" : "#A0401A",
                        textShadow: isEco ? "0 0 24px rgba(76,175,80,0.3)" : "0 0 24px rgba(255,107,107,0.2)",
                      }}
                    >
                      {isEco ? `−${Math.abs(totalCarbon)}` : `+${Math.abs(totalCarbon)}`}
                    </motion.div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", marginTop: 2 }}>
                      kg CO₂ today
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributor Stats */}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: showDecisions ? 14 : 10 }}>
                
                {biggestContributor && (
                  <div style={{ 
                    padding: showDecisions ? "10px 14px" : "8px 12px", background: "rgba(255,255,255,0.7)", 
                    borderRadius: 18, border: "1px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    backdropFilter: "blur(8px)",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", marginBottom: 4 }}>
                      🏆 Biggest Contributor
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2D5016", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{biggestContributor.emoji}</span>
                      {biggestContributor.name} <span style={{ opacity: 0.5, fontWeight: 400 }}>•</span> {biggestContributor.pct}%
                    </div>
                  </div>
                )}

                {/* Mini Cards Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: showDecisions ? 6 : 4 }}>
                  {breakdown.map((b, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      style={{
                        background: "rgba(255,255,255,0.6)",
                        borderRadius: 14, padding: showDecisions ? "8px 12px" : "6px 10px",
                        border: "1px solid rgba(255,255,255,0.4)",
                        display: "flex", alignItems: "center", gap: 10,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                      }}
                    >
                      {/* Circular Progress Ring */}
                      <div style={{ position: "relative", width: 28, height: 28, flexShrink: 0 }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="3" />
                          <motion.circle
                            cx="14" cy="14" r="11" fill="none"
                            stroke={b.color} strokeWidth="3" strokeLinecap="round"
                            initial={{ strokeDasharray: `0 69` }}
                            animate={{ strokeDasharray: `${(b.pct / 100) * 69} 69` }}
                            transition={{ duration: 1, delay: 0.8 }}
                          />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                          {b.emoji}
                        </div>
                      </div>
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#2D5016" }}>{b.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: b.color }}>{b.pct}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${b.pct}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                            style={{ height: "100%", background: b.color, borderRadius: 999 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── RIGHT COLUMN ──────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: showDecisions ? 10 : 8, height: "100%" }}>
              {/* ── STORY SNAPSHOT ──────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
                style={{
                  background: "rgba(240, 250, 240, 0.85)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: 20,
                  padding: showDecisions ? "16px 18px" : "12px 14px",
                  border: "1px solid rgba(184,212,168,0.5)",
                  flexShrink: 0,
                }}
              >
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.11em",
                textTransform: "uppercase", color: "#6B8F5E", marginBottom: showDecisions ? 8 : 4,
              }}>
                📖 Story Snapshot
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                {ecoCount > 0 && (
                  <div style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(126,200,106,0.14)",
                    border: "1px solid rgba(126,200,106,0.38)",
                    fontSize: 12, fontWeight: 700, color: "#2D5016",
                  }}>
                    🌱 Eco ×{ecoCount}
                  </div>
                )}
                {highCount > 0 && (
                  <div style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(255,107,107,0.10)",
                    border: "1px solid rgba(255,107,107,0.28)",
                    fontSize: 12, fontWeight: 700, color: "#A0401A",
                  }}>
                    ⚠️ High ×{highCount}
                  </div>
                )}
                {moderateCount > 0 && (
                  <div style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(255,213,128,0.18)",
                    border: "1px solid rgba(244,168,50,0.36)",
                    fontSize: 12, fontWeight: 700, color: "#5A4000",
                  }}>
                    🟡 Moderate ×{moderateCount}
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowDecisions(v => !v)}
                style={{
                  marginTop: showDecisions ? 8 : 4, fontSize: 12, color: "#4A7C2F",
                  fontWeight: 700, background: "none", border: "none",
                  cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                {showDecisions ? "▲ Hide decisions" : "▼ View decisions"}
              </button>

              <AnimatePresence>
                {showDecisions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="story-decisions-grid" style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {chapter1Decisions.length > 0 && (
                        <div style={{
                          background: "rgba(255, 255, 255, 0.5)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          borderRadius: 14,
                          padding: "10px 12px",
                          border: "1px solid rgba(184,212,168,0.5)",
                          display: "flex",
                          flexDirection: "column",
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", marginBottom: 6 }}>
                            Morning 🌅
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {chapter1Decisions.map((d, i) => (
                              <div key={`m-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 13, fontWeight: 500, color: "#2D5016", lineHeight: 1.2 }}>
                                <span style={{ fontSize: 13, marginTop: 1 }}>{d.impactType === 'eco' ? '🌱' : d.impactType === 'high' ? '⚠️' : '🟡'}</span>
                                <span>{d.choice}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {chapter2Decisions.length > 0 && (
                        <div style={{
                          background: "rgba(255, 255, 255, 0.5)",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          borderRadius: 14,
                          padding: "10px 12px",
                          border: "1px solid rgba(184,212,168,0.5)",
                          display: "flex",
                          flexDirection: "column",
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", marginBottom: 6 }}>
                            Evening 🌙
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {chapter2Decisions.map((d, i) => (
                              <div key={`e-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 13, fontWeight: 500, color: "#2D5016", lineHeight: 1.2 }}>
                                <span style={{ fontSize: 13, marginTop: 1 }}>{d.impactType === 'eco' ? '🌱' : d.impactType === 'high' ? '⚠️' : '🟡'}</span>
                                <span>{d.choice}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>


              {/* ── MISSIONS UNLOCKED ───────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.16 }}
                style={{
                  background: "rgba(240, 250, 240, 0.85)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  borderRadius: 24,
                  padding: showDecisions ? "16px 18px" : "12px 14px",
                  border: "1px solid rgba(184,212,168,0.5)",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: showDecisions ? 12 : 8,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.11em",
                  textTransform: "uppercase", color: "#6B8F5E",
                }}>
                  🎯 Missions
                </div>
                {unlockedMissions.length > 3 && (
                  <button
                    onClick={() => setShowAllMissions(v => !v)}
                    style={{
                      fontSize: 11, fontWeight: 700, color: "#4A7C2F",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}
                  >
                    {showAllMissions ? "Show less" : `View all (${unlockedMissions.length}) →`}
                  </button>
                )}
              </div>

              {unlockedMissions.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#6B8F5E" }}>
                  Keep playing to unlock missions 🌱
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: showDecisions ? 12 : 8 }}>
                  {(showAllMissions ? unlockedMissions : unlockedMissions.slice(0, 3)).map(mission => (
                    <div key={mission.id} style={{
                      display: "flex", alignItems: "flex-start", gap: showDecisions ? 14 : 12,
                      padding: showDecisions ? "14px 16px" : "10px 14px", borderRadius: 16,
                      background: "rgba(74,124,47,0.05)",
                      border: "1px dashed rgba(74,124,47,0.22)",
                    }}>
                      <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{mission.emoji}</span>
                      <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{
                          fontSize: 13, fontWeight: 700, color: "#2D5016",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {mission.title}
                        </div>
                        <div style={{
                          fontSize: 11, fontWeight: 600, color: "#4A7C2F",
                          display: "flex", alignItems: "center", gap: 4
                        }}>
                          🏅 {getBadgeSubtitle(mission.title)}
                        </div>
                        <div style={{
                          fontSize: 11, color: "#6B8F5E",
                          lineHeight: 1.4,
                        }}>
                          {mission.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════
              VERD TOMORROW TEASER — full width compact strip
          ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.24 }}
            style={{
              background: "rgba(255, 248, 231, 0.9)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: 24,
              padding: showDecisions ? "13px 20px" : "10px 18px",
              border: "1px solid rgba(244, 168, 50, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <motion.div
                animate={{ rotate: [0, 12, -12, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                <VerdOrb size={34} />
              </motion.div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2D5016" }}>
                  Verd prepared {loadingPlan ? "..." : actionPlan.length} actions for tomorrow 🌟
                </div>
                <div style={{ fontSize: 11, color: "#6B8F5E" }}>
                  Your personalised eco-plan is ready
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push("/story/future")}
              style={{
                padding: "8px 18px",
                background: "#F4A832",
                color: "white", borderRadius: 16, fontWeight: 700,
                fontSize: 13, border: "none", cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 10px rgba(244,168,50,0.38)",
              }}
            >
              See Plan →
            </motion.button>
          </motion.div>


          {/* ═══════════════════════════════════════════════════════
              CTA BUTTONS
          ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.5 }}
            style={{ display: "flex", gap: 10 }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/story/future")}
              style={{
                flex: 1, padding: showDecisions ? "13px 20px" : "11px 16px",
                background: "linear-gradient(135deg, #4A7C2F, #2D5016)",
                color: "white", borderRadius: 16,
                fontWeight: 700, fontSize: 15, border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(45,80,22,0.30)",
              }}
            >
              See Your Future 🌍
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePlayAgain}
              style={{
                padding: showDecisions ? "13px 22px" : "11px 18px",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                color: "#2D5016", borderRadius: 16,
                fontWeight: 600, fontSize: 15,
                border: "1.5px solid #B8D4A8",
                cursor: "pointer",
              }}
            >
              Play Again ↺
            </motion.button>
          </motion.div>

        </motion.div>
      </div>

      <MemoryBookButton />
    </main>
  );
}
