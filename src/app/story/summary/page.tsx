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
          overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        <style>{`
          ::-webkit-scrollbar { display: none; }

          @media (max-width: 640px) {
            .bento-grid {
              grid-template-columns: 1fr !important;
            }
            .impact-card {
              grid-row: span 1 !important;
            }
          }
        `}</style>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            width: "calc(100% - 48px)", maxWidth: 900,
            display: "flex", flexDirection: "column", gap: 10,
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(184, 212, 168, 0.5)",
            borderRadius: 32,
            padding: 24,
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
                padding: "24px 28px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: 20,
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
              <VerdOrb size={70} />
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
              gridTemplateRows: "auto auto",
              gap: 10,
            }}
          >
            {/* ── IMPACT CARD (tall, spans 2 rows) ────────────── */}
            <motion.div
              className="impact-card"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0 }}
              style={{
                gridRow: "span 2",
                background: isEco ? "rgba(240, 250, 240, 0.95)" : "rgba(255, 248, 231, 0.95)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: 24,
                padding: "26px 22px",
                border: `1.5px solid ${isEco ? "rgba(76,175,80,0.3)" : "rgba(244,168,50,0.35)"}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(45, 80, 22, 0.08)",
              }}
            >
              {/* Premium Watermark to fill dead space */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -15, x: "-50%", y: "-50%" }}
                animate={{ opacity: isEco ? 0.15 : 0.08, scale: 1, rotate: -5, x: "-50%", y: "-50%" }}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: "52%", left: "50%",
                  fontSize: 160,
                  lineHeight: 1,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                {isEco ? "🍃" : "🚗"}
              </motion.div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: isEco ? "rgba(126,200,106,0.75)" : "rgba(255,168,80,0.75)",
                  marginBottom: 14,
                }}>
                  Carbon Impact
                </div>

                {/* GAME STAT — big bold number */}
                <motion.div
                  initial={{ scale: 0.75, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.55, ease: "backOut" }}
                  style={{
                    fontSize: 58, fontWeight: 900, lineHeight: 1,
                    color: isEco ? "#2D7A1F" : "#A0401A",
                    textShadow: isEco ? "0 0 32px rgba(76,175,80,0.25)" : "0 0 32px rgba(255,107,107,0.2)",
                    marginBottom: 2,
                  }}
                >
                  {isEco ? `−${Math.abs(totalCarbon)}` : `+${Math.abs(totalCarbon)}`}
                </motion.div>

                <div style={{
                  fontSize: 15, fontWeight: 600,
                  color: isEco ? "#4A7C2F" : "#A0401A", marginBottom: 14,
                }}>
                  kg CO₂ today
                </div>
              </div>

              {/* 3 Insight Rows */}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
                {/* Row 1: Average comparison bar */}
                <div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: 12, color: "#6B8F5E", fontWeight: 600, marginBottom: 5,
                  }}>
                    <span>vs. avg Indian (8 kg/day)</span>
                  </div>
                  <div style={{
                    height: 6, borderRadius: 999,
                    background: "rgba(184,212,168,0.3)", overflow: "hidden",
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((Math.abs(totalCarbon) / 8) * 100, 100)}%` }}
                      transition={{ duration: 1, ease: [0.23,1,0.32,1] }}
                      style={{
                        height: "100%", borderRadius: 999,
                        background: isEco ? "#4CAF50" : "#FF6B6B",
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: Equivalent insight */}
                <div style={{ fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
                  {isEco 
                    ? `= 🌳 ${(Math.abs(totalCarbon)/21).toFixed(1)} trees absorbing CO₂ today` 
                    : `= 🚗 ${(Math.abs(totalCarbon)/0.21).toFixed(0)} km driven today`}
                </div>

                {/* Row 3: Mood sentence */}
                <div style={{ fontSize: 13, color: "#6B8F5E" }}>
                  {isEco
                    ? "Below average — you're rewriting the story. 🌱"
                    : "Above average — but awareness is the first step. ☀️"}
                </div>
              </div>
            </motion.div>


            {/* ── STORY SNAPSHOT ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
              style={{
                background: "rgba(240, 250, 240, 0.85)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderRadius: 24,
                padding: "18px 16px",
                border: "1px solid rgba(184,212,168,0.5)",
              }}
            >
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.11em",
                textTransform: "uppercase", color: "#6B8F5E", marginBottom: 12,
              }}>
                📖 Story Snapshot
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ecoCount > 0 && (
                  <div style={{
                    padding: "5px 10px", borderRadius: 20,
                    background: "rgba(126,200,106,0.14)",
                    border: "1px solid rgba(126,200,106,0.38)",
                    fontSize: 12, fontWeight: 700, color: "#2D5016",
                  }}>
                    🌱 Eco ×{ecoCount}
                  </div>
                )}
                {highCount > 0 && (
                  <div style={{
                    padding: "5px 10px", borderRadius: 20,
                    background: "rgba(255,107,107,0.10)",
                    border: "1px solid rgba(255,107,107,0.28)",
                    fontSize: 12, fontWeight: 700, color: "#A0401A",
                  }}>
                    ⚠️ High ×{highCount}
                  </div>
                )}
                {moderateCount > 0 && (
                  <div style={{
                    padding: "5px 10px", borderRadius: 20,
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
                  marginTop: 12, fontSize: 11, color: "#4A7C2F",
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
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                      {[...chapter1Decisions, ...chapter2Decisions].map((d, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", padding: "6px 9px",
                          background: "#F0FAF0", borderRadius: 10,
                          border: "1px solid #B8D4A8",
                        }}>
                          <span style={{
                            color: "#2D5016", fontSize: 11, fontWeight: 500,
                            flex: 1, marginRight: 8, lineHeight: 1.4,
                          }}>
                            {d.choice}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5,
                            background: d.impactType === "eco" ? "#A8D878" : d.impactType === "moderate" ? "#FFD580" : "rgba(255,107,107,0.15)",
                            color: d.impactType === "eco" ? "#2D5016" : d.impactType === "moderate" ? "#5A4000" : "#A0401A",
                            whiteSpace: "nowrap",
                          }}>
                            {d.impactType.toUpperCase()}
                          </span>
                        </div>
                      ))}
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
                padding: "18px 16px",
                border: "1px solid rgba(184,212,168,0.5)",
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.11em",
                  textTransform: "uppercase", color: "#6B8F5E",
                }}>
                  🎯 Missions Unlocked
                </div>
                {unlockedMissions.length > 3 && (
                  <button
                    onClick={() => setShowAllMissions(v => !v)}
                    style={{
                      fontSize: 10, fontWeight: 700, color: "#4A7C2F",
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}
                  >
                    {showAllMissions ? "Show less" : `View all (${unlockedMissions.length}) →`}
                  </button>
                )}
              </div>

              {unlockedMissions.length === 0 ? (
                <div style={{ fontSize: 12, color: "#6B8F5E" }}>
                  Keep playing to unlock missions 🌱
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {(showAllMissions ? unlockedMissions : unlockedMissions.slice(0, 3)).map(mission => (
                    <div key={mission.id} style={{
                      display: "flex", alignItems: "center", gap: 9,
                      padding: "7px 10px", borderRadius: 12,
                      background: "rgba(74,124,47,0.05)",
                      border: "1px dashed rgba(74,124,47,0.22)",
                    }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{mission.emoji}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: 12, fontWeight: 600, color: "#2D5016",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {mission.title}
                        </div>
                        <div style={{
                          fontSize: 10, color: "#6B8F5E",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
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
              padding: "13px 20px",
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
                flex: 1, padding: "13px 20px",
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
                padding: "13px 22px",
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
