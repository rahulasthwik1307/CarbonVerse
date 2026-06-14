"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import VerdOrb from "@/components/ui/VerdOrb";
import LandingWorld from "@/components/world/LandingWorld";
import { useSessionStore } from "@/lib/session-store";

export default function SummaryPage() {
  const router = useRouter();
  const { worldState, decisions, resetSession } = useSessionStore();
  const chapter1Decisions = decisions.filter((d) => d.chapter === 1);

  const handlePlayAgain = () => {
    resetSession();
    router.push("/");
  };

  const totalCarbon = decisions.reduce((sum, d) => sum + d.carbonDelta, 0);
  const isPositive = totalCarbon < 0;

  return (
    <main style={{
      position: "fixed", inset: 0, overflow: "hidden"
    }}>
      <LandingWorld />
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        overflowY: "auto", scrollbarWidth: "none",
        msOverflowStyle: "none",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "24px 16px",
      }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            width: "100%",
            maxWidth: 480,
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
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

          <div style={{
            margin: "20px 0", padding: "16px 20px",
            background: isPositive ? "rgba(76,175,80,0.1)" 
                                   : "rgba(255,107,107,0.08)",
            borderRadius: 16,
            border: `1px solid ${isPositive ? "#B8D4A8" : "rgba(255,107,107,0.3)"}`,
            width: "100%",
            textAlign: "center"
          }}>
            <div style={{fontSize:13, color:"#6B8F5E", marginBottom:8}}>
              Today's carbon impact
            </div>
            <div style={{
              fontSize: 24, fontWeight: 800,
              color: isPositive ? "#2D7A1F" : "#A0401A"
            }}>
              {isPositive ? "▼" : "▲"} {Math.abs(totalCarbon)} kg CO₂
            </div>
            <div style={{fontSize:12, color:"#6B8F5E", marginTop:4}}>
              {isPositive 
                ? "Below average — great work! 🌱" 
                : "Above average — but awareness is the first step ☀️"}
            </div>
          </div>

          <div style={{ marginTop: 12, width: "100%" }}>
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
                    background: d.impactType === "eco" ? "#A8D878" : d.impactType === "moderate" ? "#FFD580" : "rgba(255,107,107,0.15)",
                    color: d.impactType === "eco" ? "#2D5016" : d.impactType === "moderate" ? "#5A4000" : "#A0401A",
                    border: d.impactType === "high" ? "1px solid rgba(255,107,107,0.3)" : "none"
                  }}>
                    {d.impactType.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32, width: "100%", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <div style={{
              fontSize: 14, color: "#6B8F5E", textAlign: "center",
              lineHeight: 1.6, fontStyle: "italic", marginBottom: 4
            }}>
              {worldState.planetMood === "Thriving" 
                ? "Your choices are making a real difference! 🌍" 
                : worldState.planetMood === "Recovering"
                ? "Things are improving — one choice at a time. 🌿"
                : "Every journey starts with a single step. 🌱"}
            </div>

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
      </div>
    </main>
  );
}
