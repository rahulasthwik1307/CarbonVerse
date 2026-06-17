"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementToastProps {
  achievement: { emoji: string; title: string; description: string; type?: "achievement" | "mission" };
  onClose: () => void;
}

export default function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{
          position: "fixed",
          top: 80,
          right: 16,
          zIndex: 200,
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          border: achievement.type === "mission" ? "2px solid #4CAF50" : "2px solid #F4A832",
          width: 280,
          padding: "16px 20px",
          borderRadius: 20,
          boxShadow: achievement.type === "mission" ? "0 12px 32px rgba(74,124,47,0.15)" : "0 12px 32px rgba(244,168,50,0.15)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflow: "hidden"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            {achievement.emoji}
            {/* Sparkles */}
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1, 0], 
                  x: (Math.random() - 0.5) * 30, 
                  y: (Math.random() - 0.5) * 30,
                  opacity: 0
                }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                style={{ position: "absolute", width: 4, height: 4, borderRadius: 2, background: achievement.type === "mission" ? "#4CAF50" : "#F4A832" }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: achievement.type === "mission" ? "#4CAF50" : "#F4A832", fontWeight: 700, letterSpacing: 0.5 }}>
            {achievement.type === "mission" ? "Mission Completed!" : "Achievement Unlocked!"}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2D5016", marginBottom: 2 }}>
            {achievement.title}
          </div>
          <div style={{ fontSize: 12, color: "#6B8F5E", lineHeight: 1.4 }}>
            {achievement.description}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
