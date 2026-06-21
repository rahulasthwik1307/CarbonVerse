"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import { useRouter } from "next/navigation";

export default function AchievementsView() {
  const router = useRouter();
  const { activeMissions, achievements } = useSessionStore();
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;

  return (
    <div style={{ maxWidth: 680, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Back button */}
      <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#2D5016", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, width: "fit-content" }}>
        ← Back
      </button>

      {/* HEADER */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <VerdOrb size={48} mood="eco" />
        </motion.div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#2D5016", margin: "0 0 4px 0" }}>Achievements & Missions 🏆</h1>
          <p style={{ fontSize: 14, color: "#6B8F5E", margin: 0, fontWeight: 500 }}>{unlockedCount}/{totalCount} badges earned</p>
        </div>
      </div>

      {/* SECTION 1 — ACTIVE MISSIONS */}
      <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 24, padding: 20, boxShadow: "0 8px 32px rgba(45,80,22,0.08)", border: "1px solid rgba(184,212,168,0.5)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#2D5016", marginBottom: 16, marginTop: 0 }}>Active Missions 🎯</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {activeMissions.map((mission, i) => {
            const isComplete = mission.completed;
            const progress = Math.min(100, (mission.currentCount / mission.targetCount) * 100);

            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={isComplete ? { scale: 1.02 } : {}}
                style={{
                  display: "flex", gap: 16, alignItems: "center", padding: 16,
                  background: isComplete ? "rgba(76,175,80,0.05)" : "white",
                  borderRadius: 16, border: "1px solid #B8D4A8",
                  position: "relative", overflow: "hidden"
                }}
              >
                {/* Flashing effect on complete */}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{ position: "absolute", inset: 0, background: "#4CAF50", zIndex: 0 }}
                  />
                )}

                {/* Left */}
                <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: isComplete ? "#4CAF50" : "rgba(74,124,47,0.1)", zIndex: 1, flexShrink: 0 }}>
                  {mission.emoji}
                </div>

                {/* Center */}
                <div style={{ flex: 1, zIndex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#2D5016" }}>{mission.title}</div>
                  <div style={{ fontSize: 12, color: "#6B8F5E", marginBottom: 8 }}>{mission.description}</div>
                  
                  {!isComplete && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(184,212,168,0.3)", borderRadius: 2, overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1 }} style={{ height: "100%", background: "#4CAF50", borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#6B8F5E", fontWeight: 600, minWidth: 32 }}>{mission.currentCount}/{mission.targetCount}</div>
                    </div>
                  )}
                </div>

                {/* Right */}
                <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  {isComplete ? (
                    <>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#E8F5E9", color: "#4CAF50", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>✓</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#8B6914", background: "rgba(244,168,50,0.15)", padding: "2px 6px", borderRadius: 4 }}>Reward: {mission.reward}</div>
                    </>
                  ) : (
                    <div style={{ width: 40, height: 40, position: "relative" }}>
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(184,212,168,0.3)" strokeWidth="4" />
                        <motion.circle
                          cx="20" cy="20" r="16" fill="none" stroke="#4CAF50" strokeWidth="4"
                          strokeDasharray="100.53"
                          strokeDashoffset={100.53 - (100.53 * progress) / 100}
                          strokeLinecap="round"
                          transform="rotate(-90 20 20)"
                          initial={{ strokeDashoffset: 100.53 }}
                          animate={{ strokeDashoffset: 100.53 - (100.53 * progress) / 100 }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2 — ALL ACHIEVEMENTS */}
      <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: 24, padding: 20, boxShadow: "0 8px 32px rgba(45,80,22,0.08)", border: "1px solid rgba(184,212,168,0.5)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#2D5016", marginBottom: 16, marginTop: 0 }}>Achievement Badges 🏅</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {achievements.map((ach, i) => {
            const isUnlocked = !!ach.unlockedAt;

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 15 }}
                onClick={() => setSelectedBadge(selectedBadge === ach.id ? null : ach.id)}
                style={{
                  width: "100%", aspectRatio: "1",
                  background: isUnlocked ? "rgba(255,248,230,0.8)" : "rgba(255,255,255,0.4)",
                  border: isUnlocked ? "2px solid rgba(244,168,50,0.4)" : "1px solid rgba(184,212,168,0.3)",
                  borderRadius: 16, padding: 12,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8,
                  cursor: "pointer", position: "relative"
                }}
              >
                {!isUnlocked && (
                  <div style={{ position: "absolute", top: 8, right: 8, fontSize: 14 }}>🔒</div>
                )}
                <motion.div
                  animate={isUnlocked ? { scale: [1, 1.1, 1] } : {}}
                  transition={isUnlocked ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                  style={{
                    fontSize: 44,
                    filter: isUnlocked ? "none" : "grayscale(100%) opacity(0.3)",
                    lineHeight: 1
                  }}
                >
                  {ach.emoji}
                </motion.div>
                <div style={{
                  fontSize: 12, fontWeight: isUnlocked ? 700 : 600,
                  color: isUnlocked ? "#2D5016" : "#A8BEA9",
                  lineHeight: 1.2
                }}>
                  {ach.title}
                </div>
                
                {/* Tooltip inline relative to badge for simplicity */}
                <AnimatePresence>
                  {selectedBadge === ach.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      style={{
                        position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                        marginTop: 8, zIndex: 30, background: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(8px)", border: "1px solid rgba(184,212,168,0.6)",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.1)", borderRadius: 12, padding: 12,
                        width: 180, textAlign: "center", pointerEvents: "none"
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#2D5016", fontWeight: 600, marginBottom: 4 }}>{ach.description}</div>
                      <div style={{ fontSize: 10, color: isUnlocked ? "#4CAF50" : "#8B6914", fontWeight: 700 }}>
                        {isUnlocked && ach.unlockedAt ? `Earned on ${new Date(ach.unlockedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}` : "Keep playing to unlock!"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}