"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import { useRouter } from "next/navigation";

// Dynamically play custom synthesized sound effects using Tone.js
const playSound = async (type: "click" | "unlock" | "close") => {
  if (typeof window === "undefined") return;
  try {
    const Tone = await import("tone");
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.2, release: 0.5 }
    }).toDestination();

    if (type === "click") {
      synth.triggerAttackRelease("E5", "8n");
    } else if (type === "unlock") {
      const now = Tone.now();
      synth.triggerAttackRelease("G5", "8n", now);
      synth.triggerAttackRelease("B5", "8n", now + 0.08);
      synth.triggerAttackRelease("E6", "4n", now + 0.16);
    } else if (type === "close") {
      synth.triggerAttackRelease("C5", "8n");
    }
  } catch (err) {
    console.warn("Tone.js playback failed:", err);
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (e) {
    return "";
  }
};

interface BadgeDetail {
  category: "food" | "transport" | "shopping" | "story" | "special";
  categoryLabel: string;
  themeColor: string;
  impact: string;
  colorName: string;
}

const getBadgeDetail = (id: string): BadgeDetail => {
  switch (id) {
    case "plant-pro":
      return {
        category: "food",
        categoryLabel: "Food Choice",
        themeColor: "#4CAF50",
        impact: "Reduced dietary emissions by opting for plant-based choices.",
        colorName: "green"
      };
    case "metro-master":
      return {
        category: "transport",
        categoryLabel: "Transport Choice",
        themeColor: "#2196F3",
        impact: "Lowered transit carbon footprints with public/active transport.",
        colorName: "blue"
      };
    case "receipt-detective":
      return {
        category: "shopping",
        categoryLabel: "Shopping Choice",
        themeColor: "#FFC107",
        impact: "Uncovered real-world purchase impacts through receipt scans.",
        colorName: "amber"
      };
    case "first-green":
      return {
        category: "story",
        categoryLabel: "Story Progress",
        themeColor: "#9C27B0",
        impact: "Made the very first eco choice in your timeline journey.",
        colorName: "purple"
      };
    case "story-complete":
      return {
        category: "story",
        categoryLabel: "Story Progress",
        themeColor: "#9C27B0",
        impact: "Completed a full narrative run, writing new future timelines.",
        colorName: "purple"
      };
    case "garden-guardian":
      return {
        category: "special",
        categoryLabel: "Special Trophy",
        themeColor: "#F4A832",
        impact: "Cultivated a thriving botanical garden with 5+ eco choices.",
        colorName: "gold"
      };
    case "aqi-protector":
      return {
        category: "special",
        categoryLabel: "Special Trophy",
        themeColor: "#F4A832",
        impact: "Secured fresh atmospheric AQI levels with 10+ eco choices.",
        colorName: "gold"
      };
    case "sustainability-hero":
      return {
        category: "special",
        categoryLabel: "Special Trophy",
        themeColor: "#F4A832",
        impact: "Flashed a perfect green run with all eco choices in a story.",
        colorName: "gold"
      };
    default:
      return {
        category: "story",
        categoryLabel: "Story",
        themeColor: "#6B8F5E",
        impact: "Milestone unlocked in the CarbonVerse story.",
        colorName: "purple"
      };
  }
};

const getBadgeStyles = (id: string, isUnlocked: boolean) => {
  if (!isUnlocked) {
    return {
      bg: "rgba(240, 240, 240, 0.4)",
      border: "1.5px dashed rgba(184, 212, 168, 0.4)",
      glow: "none",
      textColor: "#A8BEA9",
      iconFilter: "grayscale(100%) opacity(0.25)"
    };
  }

  const detail = getBadgeDetail(id);
  switch (detail.category) {
    case "food":
      return {
        bg: "rgba(232, 245, 233, 0.85)", // Soft green
        border: "1.5px solid rgba(76, 175, 80, 0.4)",
        glow: "0 4px 15px rgba(76, 175, 80, 0.15)",
        textColor: "#2E7D32",
        iconFilter: "none"
      };
    case "transport":
      return {
        bg: "rgba(227, 242, 253, 0.85)", // Soft blue
        border: "1.5px solid rgba(33, 150, 243, 0.4)",
        glow: "0 4px 15px rgba(33, 150, 243, 0.15)",
        textColor: "#1565C0",
        iconFilter: "none"
      };
    case "shopping":
      return {
        bg: "rgba(255, 248, 225, 0.85)", // Soft amber
        border: "1.5px solid rgba(255, 193, 7, 0.4)",
        glow: "0 4px 15px rgba(255, 193, 7, 0.15)",
        textColor: "#E65100",
        iconFilter: "none"
      };
    case "story":
      return {
        bg: "rgba(243, 229, 245, 0.85)", // Soft purple
        border: "1.5px solid rgba(156, 39, 176, 0.4)",
        glow: "0 4px 15px rgba(156, 39, 176, 0.15)",
        textColor: "#6A1B9A",
        iconFilter: "none"
      };
    case "special":
    default:
      return {
        bg: "rgba(255, 243, 224, 0.9)", // Gold
        border: "2px solid rgba(244, 168, 50, 0.5)",
        glow: "0 6px 20px rgba(244, 168, 50, 0.25)",
        textColor: "#B26A00",
        iconFilter: "none"
      };
  }
};

export default function AchievementsView() {
  const router = useRouter();
  const { memoryBook, achievements } = useSessionStore();
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hydration fallback showing skeleton loader matching premium container constraints
  if (!isClient) {
    return (
      <div style={{
        maxWidth: 880,
        width: "100%",
        margin: "24px auto",
        padding: "6px",
        borderRadius: 40,
        background: "rgba(45, 80, 22, 0.05)",
        border: "1px solid rgba(45, 80, 22, 0.08)",
      }}>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton-pulse {
            background: linear-gradient(90deg, #E8F5E3 25%, #fcfcf7 50%, #E8F5E3 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
        `}</style>
        <div style={{
          width: "100%",
          background: "rgba(255, 248, 231, 0.9)",
          borderRadius: 34,
          border: "1px solid rgba(184, 212, 168, 0.6)",
          padding: "36px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          minHeight: 520
        }}>
          <div className="skeleton-pulse" style={{ width: "100%", height: 80, borderRadius: 16 }} />
          <div className="skeleton-pulse" style={{ width: "100%", height: 100, borderRadius: 20 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="skeleton-pulse" style={{ aspectRatio: "1", borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const progressPct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Most valuable unlocked badge priority list
  const getMostValuableUnlocked = () => {
    const unlocked = achievements.filter(a => a.unlockedAt);
    if (unlocked.length === 0) return null;
    const priority = [
      "sustainability-hero",
      "aqi-protector",
      "garden-guardian",
      "plant-pro",
      "metro-master",
      "receipt-detective",
      "story-complete",
      "first-green"
    ];
    for (const id of priority) {
      const match = unlocked.find(a => a.id === id);
      if (match) return match;
    }
    return unlocked[0];
  };

  const mostValuableUnlocked = getMostValuableUnlocked();
  // Default to Garden Guardian if nothing unlocked yet
  const showcaseBadge = mostValuableUnlocked || achievements.find(a => a.id === "garden-guardian") || achievements[0];
  const isShowcaseUnlocked = !!showcaseBadge.unlockedAt;
  const showcaseStyles = getBadgeStyles(showcaseBadge.id, isShowcaseUnlocked);

  // Completed Journey Highlights calculations
  const allDecisions = memoryBook?.stories?.flatMap(s => s.decisions.map(d => ({ ...d, date: s.date }))) || [];
  
  const transportChoices = allDecisions.filter(d => 
    d.impactType === "eco" && 
    (d.choice.toLowerCase().includes("metro") || d.choice.toLowerCase().includes("walk") || d.choice.toLowerCase().includes("cycle") || d.choice.toLowerCase().includes("transit") || d.choice.toLowerCase().includes("bus"))
  );
  const bestTransport = transportChoices.sort((a, b) => a.carbonKg - b.carbonKg)[0];

  const foodChoices = allDecisions.filter(d => 
    d.impactType === "eco" && 
    (d.choice.toLowerCase().includes("plant") || d.choice.toLowerCase().includes("vegetarian") || d.choice.toLowerCase().includes("canteen") || d.choice.toLowerCase().includes("tiffin") || d.choice.toLowerCase().includes("salad"))
  );
  const bestFood = foodChoices.sort((a, b) => a.carbonKg - b.carbonKg)[0];

  const shoppingChoices = allDecisions.filter(d => 
    d.impactType === "eco" && 
    (d.choice.toLowerCase().includes("kirana") || d.choice.toLowerCase().includes("local") || d.choice.toLowerCase().includes("market") || d.choice.toLowerCase().includes("recycle"))
  );
  const bestShopping = shoppingChoices.sort((a, b) => a.carbonKg - b.carbonKg)[0];

  const completedStories = memoryBook?.stories?.length || 0;

  // SVG Progress Ring geometry
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (progressPct / 100) * ringCircumference;

  return (
    <div style={{
      maxWidth: 880,
      width: "100%",
      margin: "12px auto 40px",
      padding: "6px",
      borderRadius: 40,
      background: "rgba(45, 80, 22, 0.05)",
      border: "1px solid rgba(45, 80, 22, 0.08)",
      boxShadow: "0 24px 70px rgba(45, 80, 22, 0.12)",
    }}>
      <div style={{
        width: "100%",
        background: "rgba(255, 248, 231, 0.92)", // Warm cream glassmorphism
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRadius: 34,
        border: "1px solid rgba(184, 212, 168, 0.6)",
        padding: "32px",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.7)",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        color: "#2D5016",
        position: "relative",
      }}>
        {/* BACK ACTION */}
        <button
          onClick={() => {
            playSound("click");
            router.back();
          }}
          style={{
            background: "rgba(255, 255, 255, 0.6)",
            border: "1px solid rgba(184, 212, 168, 0.4)",
            color: "#2D5016",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "fit-content",
            padding: "8px 16px",
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(45,80,22,0.04)",
            transition: "transform 150ms ease-out",
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span>←</span> Back to Story
        </button>

        {/* HEADER SECTION */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          borderBottom: "1.5px solid rgba(184, 212, 168, 0.3)",
          paddingBottom: 20,
          flexDirection: "row"
        }}>
          {/* Large Floating Verd character */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ flexShrink: 0 }}
          >
            <VerdOrb size={72} mood="eco" />
          </motion.div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h1 style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#2D5016",
              margin: 0,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              Trophy Room
            </h1>
            <p style={{ color: "#6B8F5E", fontSize: 15, margin: 0, fontWeight: 600 }}>
              Celebrate your sustainable choices and future achievements
            </p>
          </div>
        </div>

        {/* ACHIEVEMENT PROGRESS HERO */}
        <div style={{
          padding: 6,
          background: "rgba(244, 168, 50, 0.05)",
          border: "1.5px solid rgba(244, 168, 50, 0.15)",
          borderRadius: 24,
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.8)",
            border: "1px solid rgba(184, 212, 168, 0.3)",
            borderRadius: 18,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#B26A00",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: "rgba(244, 168, 50, 0.12)",
                padding: "4px 10px",
                borderRadius: 999,
                width: "fit-content"
              }}>
                🏆 Progress Ring
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: "4px 0 0 0", letterSpacing: "-0.01em" }}>
                Badge Completion
              </h2>
              <p style={{ fontSize: 13, color: "#6B8F5E", margin: 0, fontWeight: 500 }}>
                {unlockedCount} of {totalCount} collectible badges earned
              </p>
            </div>

            {/* Glowing dynamic progress ring */}
            <motion.div
              animate={{
                boxShadow: ["0 0 10px rgba(244,168,50,0.1)", "0 0 20px rgba(244,168,50,0.25)", "0 0 10px rgba(244,168,50,0.1)"]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.95)",
                border: "1.5px solid rgba(244, 168, 50, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative"
              }}
            >
              <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="30" cy="30" r={ringRadius} fill="none" stroke="rgba(184, 212, 168, 0.15)" strokeWidth="5.5" />
                <motion.circle
                  cx="30"
                  cy="30"
                  r={ringRadius}
                  fill="none"
                  stroke="#F4A832"
                  strokeWidth="5.5"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <span style={{
                position: "absolute",
                fontSize: 13,
                fontWeight: 800,
                color: "#2D5016"
              }}>
                {Math.round(progressPct)}%
              </span>
            </motion.div>
          </div>
        </div>

        {/* BADGE COLLECTION GALLERY */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2D5016", margin: "0 0 14px 0", letterSpacing: "-0.01em" }}>
            Collectible Gallery 🏅
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 16
          }}>
            {achievements.map((ach, idx) => {
              const isUnlocked = !!ach.unlockedAt;
              const styles = getBadgeStyles(ach.id, isUnlocked);
              const detail = getBadgeDetail(ach.id);

              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                  }}
                  whileHover={{ 
                    scale: 1.03,
                    y: -4,
                    boxShadow: isUnlocked ? styles.glow : "0 4px 12px rgba(45,80,22,0.04)"
                  }}
                  transition={{ 
                    delay: idx * 0.04, 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 18 
                  }}
                  onClick={() => {
                    playSound("click");
                    setSelectedBadgeId(ach.id);
                  }}
                  style={{
                    background: styles.bg,
                    border: styles.border,
                    borderRadius: 20,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    aspectRatio: "1.05",
                    position: "relative",
                    boxShadow: isUnlocked ? "0 2px 8px rgba(45,80,22,0.04)" : "none",
                    overflow: "hidden"
                  }}
                >
                  {/* Category mini label */}
                  <span style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: 8,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: isUnlocked ? styles.textColor : "#A8BEA9"
                  }}>
                    {detail.categoryLabel}
                  </span>

                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <div style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: 10,
                      opacity: 0.4
                    }}>
                      🔒
                    </div>
                  )}

                  {/* Badge Emoji */}
                  <motion.div
                    animate={isUnlocked ? { y: [0, -3, 0] } : {}}
                    transition={{
                      duration: 3 + (idx % 3) * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      fontSize: 38,
                      filter: styles.iconFilter,
                      lineHeight: 1,
                      marginBottom: 8
                    }}
                  >
                    {ach.emoji}
                  </motion.div>

                  {/* Badge Title */}
                  <div style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isUnlocked ? "#2D5016" : "#A8BEA9",
                    lineHeight: 1.2
                  }}>
                    {ach.title}
                  </div>

                  {/* Unlocked Date / Target Info */}
                  <div style={{
                    fontSize: 9,
                    color: isUnlocked ? "#6B8F5E" : "#B8C9B9",
                    marginTop: 4,
                    fontWeight: 500
                  }}>
                    {isUnlocked && ach.unlockedAt ? formatDate(ach.unlockedAt) : "Keep playing to unlock"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* SPECIAL TROPHY SHOWCASE */}
        <div style={{
          padding: 6,
          background: "rgba(244, 168, 50, 0.08)",
          border: "2px solid rgba(244, 168, 50, 0.3)",
          borderRadius: 28,
        }}>
          <div style={{
            background: isShowcaseUnlocked ? showcaseStyles.bg : "rgba(255, 255, 255, 0.9)",
            border: isShowcaseUnlocked ? showcaseStyles.border : "1px solid rgba(184, 212, 168, 0.4)",
            borderRadius: 22,
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            flexDirection: "row",
            position: "relative",
            boxShadow: isShowcaseUnlocked ? showcaseStyles.glow : "none",
            flexWrap: "wrap"
          }}>
            {/* Sparkle background indicator */}
            {isShowcaseUnlocked && (
              <div style={{
                position: "absolute",
                right: 20,
                top: 15,
                fontSize: 24,
                opacity: 0.15,
                pointerEvents: "none"
              }}>
                ✨
              </div>
            )}

            {/* Giant Badge Icon */}
            <motion.div
              animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: "white",
                border: isShowcaseUnlocked ? showcaseStyles.border : "1.5px dashed rgba(184, 212, 168, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 44,
                boxShadow: "0 6px 16px rgba(45,80,22,0.06)",
                flexShrink: 0
              }}
            >
              <span style={{ filter: isShowcaseUnlocked ? "none" : "grayscale(100%) opacity(0.3)" }}>
                {showcaseBadge.emoji}
              </span>
            </motion.div>

            {/* Info details */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{
                fontSize: 9,
                fontWeight: 800,
                color: isShowcaseUnlocked ? showcaseStyles.textColor : "#6B8F5E",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                background: isShowcaseUnlocked ? "rgba(255,255,255,0.6)" : "rgba(184, 212, 168, 0.2)",
                padding: "3px 8px",
                borderRadius: 999,
                width: "fit-content"
              }}>
                {isShowcaseUnlocked ? "🏆 Showcase Trophy" : "🌟 Next Trophy Target"}
              </span>

              <h4 style={{ fontSize: 18, fontWeight: 800, color: "#2D5016", margin: "6px 0 2px 0" }}>
                {showcaseBadge.title}
              </h4>
              <p style={{ fontSize: 13, color: "#6B8F5E", margin: "0 0 10px 0", fontWeight: 500 }}>
                {showcaseBadge.description}
              </p>

              {/* Showcase stats row */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <div style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(184, 212, 168, 0.3)",
                  padding: "4px 10px",
                  borderRadius: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2D5016"
                }}>
                  🌱 Saved {Math.abs(memoryBook.totalCO2Saved || 0).toFixed(1)} kg CO₂
                </div>
                {isShowcaseUnlocked && showcaseBadge.unlockedAt && (
                  <div style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(184, 212, 168, 0.3)",
                    padding: "4px 10px",
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#2D5016"
                  }}>
                    Unlocked {formatDate(showcaseBadge.unlockedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* JOURNEY HIGHLIGHTS BENTO GRID */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2D5016", margin: "0 0 12px 0", letterSpacing: "-0.01em" }}>
            Journey Highlights 📖
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            width: "100%"
          }}>
            {/* Best Transport Choice */}
            <div style={{
              background: "rgba(227, 242, 253, 0.7)", // Soft blue tint
              border: "1px solid rgba(33, 150, 243, 0.25)",
              borderRadius: 18,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#1565C0", display: "flex", alignItems: "center", gap: 4 }}>
                🚇 Transport Choice
              </span>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 2 }}>
                {bestTransport ? bestTransport.choice : "Awaiting choice"}
              </div>
              <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600 }}>
                {bestTransport ? `Saved ${Math.abs(bestTransport.carbonKg)} kg CO₂` : "Explore transport choices"}
              </div>
            </div>

            {/* Best Food Choice */}
            <div style={{
              background: "rgba(232, 245, 233, 0.7)", // Soft green tint
              border: "1px solid rgba(76, 175, 80, 0.25)",
              borderRadius: 18,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#2E7D32", display: "flex", alignItems: "center", gap: 4 }}>
                🥗 Food Choice
              </span>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 2 }}>
                {bestFood ? bestFood.choice : "Awaiting choice"}
              </div>
              <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600 }}>
                {bestFood ? `Saved ${Math.abs(bestFood.carbonKg)} kg CO₂` : "Try plant-based meals"}
              </div>
            </div>

            {/* Best Shopping Choice */}
            <div style={{
              background: "rgba(255, 248, 225, 0.7)", // Soft amber tint
              border: "1px solid rgba(255, 193, 7, 0.25)",
              borderRadius: 18,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#E65100", display: "flex", alignItems: "center", gap: 4 }}>
                🛒 Shopping Choice
              </span>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 2 }}>
                {bestShopping ? bestShopping.choice : "Awaiting choice"}
              </div>
              <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600 }}>
                {bestShopping ? `Saved ${Math.abs(bestShopping.carbonKg)} kg CO₂` : "Log kirana / local markets"}
              </div>
            </div>

            {/* Story Run Explorer */}
            <div style={{
              background: "rgba(243, 229, 245, 0.7)", // Soft purple tint
              border: "1px solid rgba(156, 39, 176, 0.25)",
              borderRadius: 18,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#6A1B9A", display: "flex", alignItems: "center", gap: 4 }}>
                📖 Story Explorer
              </span>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#2D5016", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: 2 }}>
                {completedStories > 0 ? `${completedStories} Runs Completed` : "Ready to write future"}
              </div>
              <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600 }}>
                {completedStories > 0 ? "Timeline events preserved" : "Complete your first run"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM MODAL */}
      <AnimatePresence>
        {selectedBadgeId && (() => {
          const badge = achievements.find(a => a.id === selectedBadgeId);
          if (!badge) return null;
          const isUnlocked = !!badge.unlockedAt;
          const styles = getBadgeStyles(badge.id, isUnlocked);
          const detail = getBadgeDetail(badge.id);

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(45, 80, 22, 0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16
              }}
              onClick={() => {
                setSelectedBadgeId(null);
                playSound("close");
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{
                  maxWidth: 420,
                  width: "100%",
                  borderRadius: 32,
                  background: "rgba(255, 255, 255, 0.2)", // Double bezel outer
                  padding: 6,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
                }}
                onClick={(e) => e.stopPropagation()} // Prevent close on click inside
              >
                <div style={{
                  background: "#FFF8E7", // Warm cream Ghibli background
                  border: "1.5px solid rgba(184, 212, 168, 0.6)",
                  borderRadius: 28,
                  padding: "24px 32px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 16,
                  color: "#2D5016",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)"
                }}>
                  {/* Badge Icon circle */}
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: isUnlocked ? styles.bg : "rgba(184, 212, 168, 0.15)",
                    border: isUnlocked ? styles.border : "1.5px dashed rgba(184, 212, 168, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                    boxShadow: isUnlocked ? styles.glow : "none"
                  }}>
                    <span style={{ filter: isUnlocked ? "none" : "grayscale(100%) opacity(0.3)" }}>
                      {badge.emoji}
                    </span>
                  </div>

                  {/* Tag/Category */}
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    background: isUnlocked ? styles.bg : "rgba(184, 212, 168, 0.2)",
                    color: isUnlocked ? styles.textColor : "#6B8F5E",
                    padding: "4px 10px",
                    borderRadius: 999
                  }}>
                    {detail.categoryLabel}
                  </span>

                  {/* Title & Description */}
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
                      {badge.title}
                    </h3>
                    <p style={{ fontSize: 14, color: "#6B8F5E", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                      {badge.description}
                    </p>
                  </div>

                  {/* Impact / Date Details */}
                  <div style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(184, 212, 168, 0.3)",
                    borderRadius: 16,
                    padding: 12,
                    fontSize: 12,
                    color: "#4A7C2F",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    textAlign: "left"
                  }}>
                    <div>
                      <strong style={{ color: "#2D5016" }}>How to Earn:</strong> {badge.description}
                    </div>
                    <div>
                      <strong style={{ color: "#2D5016" }}>Impact Created:</strong> {detail.impact}
                    </div>
                    {isUnlocked && badge.unlockedAt && (
                      <div style={{ borderTop: "1px solid rgba(184, 212, 168, 0.2)", paddingTop: 6, marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ color: "#2D5016" }}>Unlocked On:</strong>
                        <span>{formatDate(badge.unlockedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Close Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedBadgeId(null);
                      playSound("close");
                    }}
                    style={{
                      background: "#4A7C2F",
                      color: "#FFF8E7",
                      border: "none",
                      borderRadius: 16,
                      padding: "10px 24px",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      width: "100%",
                      boxShadow: "0 4px 12px rgba(74, 124, 47, 0.2)"
                    }}
                  >
                    Close Gallery Frame
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}