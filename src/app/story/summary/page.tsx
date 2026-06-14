"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import VerdOrb from "@/components/ui/VerdOrb";
import { useSessionStore } from "@/lib/session-store";

export default function SummaryPage() {
  const router = useRouter();
  const { worldState, decisions, resetSession } = useSessionStore();
  const chapter1Decisions = decisions.filter((d) => d.chapter === 1);

  const handlePlayAgain = () => {
    resetSession();
    router.push("/");
  };

  return (
    <main style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "#FFF8E7",
      padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          borderRadius: 28,
          padding: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1px solid rgba(184, 212, 168, 0.6)",
          boxShadow: "0 8px 32px rgba(45, 80, 22, 0.08)",
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <VerdOrb size={64} />
        </motion.div>
        
        <h1 style={{ marginTop: 24, color: "#2D5016", fontSize: 28, fontWeight: 800, textAlign: "center" }}>
          Chapter 1 Complete! 🎉
        </h1>

        <div style={{ 
          marginTop: 16, 
          padding: "8px 16px", 
          borderRadius: 20, 
          background: "rgba(74, 124, 47, 0.1)",
          color: "#4A7C2F",
          fontWeight: 600,
          fontSize: 14
        }}>
          Planet Mood: {worldState.planetMood}
        </div>

        <div style={{ marginTop: 32, width: "100%" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#6B8F5E", marginBottom: 16 }}>Your Decisions:</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {chapter1Decisions.map((d, i) => (
              <div key={i} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "12px 16px",
                background: "#F0FAF0",
                borderRadius: 12,
                border: "1px solid #B8D4A8"
              }}>
                <span style={{ color: "#2D5016", fontWeight: 500 }}>{d.choice}</span>
                <span style={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  padding: "4px 8px", 
                  borderRadius: 8,
                  background: d.impactType === "eco" ? "#A8D878" : d.impactType === "moderate" ? "#FFD580" : "#FF6B6B",
                  color: d.impactType === "high" ? "#fff" : "#2D5016"
                }}>
                  {d.impactType.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 40, width: "100%", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAgain}
            style={{
              padding: "16px 32px",
              background: "linear-gradient(135deg, #4A7C2F 0%, #2D5016 100%)",
              color: "white",
              borderRadius: 16,
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(45, 80, 22, 0.2)",
              width: "100%",
            }}
          >
            Play Again
          </motion.button>
          <span style={{ color: "#6B8F5E", fontSize: 14, fontWeight: 500 }}>
            Chapter 2 coming soon...
          </span>
        </div>
      </motion.div>
    </main>
  );
}
