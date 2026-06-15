"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import VerdOrb from "@/components/ui/VerdOrb";
import LandingWorld from "@/components/world/LandingWorld";
import { useSessionStore } from "@/lib/session-store";
import MemoryBookButton from "@/components/ui/MemoryBookButton";

export default function SummaryPage() {
  const router = useRouter();
  const { profile, worldState, decisions, resetSession, currentChapter, advanceChapter } = useSessionStore();

  const handlePlayAgain = () => {
    resetSession();
    router.push("/");
  };

  const totalCarbon = decisions.reduce((sum, d) => sum + d.carbonDelta, 0);
  const isPositive = totalCarbon < 0;

  const chapter1Decisions = decisions.filter(d => d.chapter === 1);
  const chapter2Decisions = decisions.filter(d => d.chapter === 2);

  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    const fetchActionPlan = async () => {
      setLoadingPlan(true);
      try {
        const highImpactDecisions = decisions
          .filter(d => d.impactType === "high")
          .map(d => d.choice);
        
        const ecoDecisions = decisions
          .filter(d => d.impactType === "eco")
          .map(d => d.choice);

        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "action_plan",
            impactType: totalCarbon < 0 ? "eco" : "high",
            worldState,
            city: profile.city || "your city",
            chapter: `High impact choices: ${highImpactDecisions.join(", ") || "none"}. 
                      Eco choices: ${ecoDecisions.join(", ") || "none"}.
                      Generate exactly 4 specific action items for tomorrow.
                      Format: Return ONLY a JSON array of 4 strings.
                      Each string starts with an emoji.
                      Example: ["🚶 Walk to the nearby shop","🥗 Try a vegetarian lunch"]`,
            aqi: 75,
          })
        });
        
        const data = await res.json();
        
        try {
          const parsed = JSON.parse(data.narrative);
          if (Array.isArray(parsed)) {
            setActionPlan(parsed.slice(0, 4));
          } else {
            throw new Error("not array");
          }
        } catch {
          const plan = [];
          if (highImpactDecisions.some(d => d.toLowerCase().includes("cab") || d.toLowerCase().includes("car"))) {
            plan.push("🚇 Try public transport tomorrow");
          }
          if (highImpactDecisions.some(d => d.toLowerCase().includes("burger") || d.toLowerCase().includes("meat"))) {
            plan.push("🥗 Try one vegetarian meal");
          }
          if (highImpactDecisions.some(d => d.toLowerCase().includes("delivery") || d.toLowerCase().includes("mall"))) {
            plan.push("🛒 Buy from a local shop");
          }
          if (highImpactDecisions.some(d => d.toLowerCase().includes("game") || d.toLowerCase().includes("stream"))) {
            plan.push("💡 Switch off unused devices tonight");
          }
          const generalTips = [
            "🌱 Carry a reusable water bottle",
            "🚶 Walk for trips under 1km",
            "🥗 Try a plant-based breakfast",
            "♻️ Sort your recyclables today",
          ];
          while (plan.length < 4) { plan.push(generalTips[plan.length]); }
          setActionPlan(plan);
        }
      } catch {
        setActionPlan([
          "🚶 Walk or cycle for short trips",
          "🥗 Try one plant-based meal",
          "🛒 Shop locally when possible",
          "💡 Switch off unused appliances",
        ]);
      } finally {
        setLoadingPlan(false);
      }
    };
    
    fetchActionPlan();
  }, [decisions, totalCarbon, worldState, profile.city]);

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
            Your Journey Complete! 🎉
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
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#6B8F5E", marginBottom: 12 }}>Chapter 1 Decisions:</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {chapter1Decisions.map((d, i) => (
                <div key={`c1-${i}`} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: "#F0FAF0",
                  borderRadius: 12, border: "1px solid #B8D4A8"
                }}>
                  <span style={{ color: "#2D5016", fontWeight: 500, fontSize: 14 }}>{d.choice}</span>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, padding: "3px 6px", borderRadius: 6,
                    background: d.impactType === "eco" ? "#A8D878" : d.impactType === "moderate" ? "#FFD580" : "rgba(255,107,107,0.15)",
                    color: d.impactType === "eco" ? "#2D5016" : d.impactType === "moderate" ? "#5A4000" : "#A0401A",
                    border: d.impactType === "high" ? "1px solid rgba(255,107,107,0.3)" : "none"
                  }}>
                    {d.impactType.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#6B8F5E", marginBottom: 12 }}>Chapter 2 Decisions:</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {chapter2Decisions.map((d, i) => (
                <div key={`c2-${i}`} style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", background: "#F0FAF0",
                  borderRadius: 12, border: "1px solid #B8D4A8"
                }}>
                  <span style={{ color: "#2D5016", fontWeight: 500, fontSize: 14 }}>{d.choice}</span>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, padding: "3px 6px", borderRadius: 6,
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

          <div style={{
            marginTop: 24, width: "100%", padding: 20,
            background: "rgba(255,248,230,0.8)",
            borderRadius: 16,
            border: "2px solid rgba(244,168,50,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <VerdOrb size={32} />
              <div style={{ fontSize: 15, fontWeight: 700, color: "#2D5016" }}>Verd's Plan for Tomorrow 🌟</div>
            </div>

            {loadingPlan ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ position: "relative", overflow: "hidden", height: 24, width: "100%", borderRadius: 4, background: "rgba(244,168,50,0.1)" }}>
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                      style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {actionPlan.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 0",
                      borderBottom: i < actionPlan.length - 1 ? "1px solid rgba(184,212,168,0.3)" : "none",
                    }}
                  >
                    <div
                      onClick={(e) => {
                        const target = e.currentTarget;
                        target.style.background = "#4A7C2F";
                        target.innerHTML = `<span style="color:white;font-size:12px;line-height:20px;text-align:center;display:block;">✓</span>`;
                      }}
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        border: "2px solid #B8D4A8", background: "white",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    />
                    <div style={{ fontSize: 14, color: "#2D5016", fontWeight: 500 }}>{item}</div>
                  </motion.div>
                ))}
              </div>
            )}
            
            <div style={{ fontSize: 12, color: "#6B8F5E", fontStyle: "italic", marginTop: 16 }}>
              Complete these tomorrow to grow your garden! 🌱
            </div>
          </div>

          <div style={{ marginTop: 32, width: "100%", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
            <div style={{
              fontSize: 14, color: "#6B8F5E", textAlign: "center",
              lineHeight: 1.6, fontStyle: "italic", marginBottom: 4
            }}>
              Two chapters done! Your choices are shaping your world. 🌍
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/story/future")}
              style={{
                padding: "12px 24px",
                background: "rgba(74,124,47,0.1)",
                color: "#2D5016",
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 15,
                border: "2px solid #B8D4A8",
                cursor: "pointer",
                width: "100%",
                marginTop: 8,
              }}
            >
              See Your Future →
            </motion.button>

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
          </div>
        </motion.div>
      </div>
      <MemoryBookButton />
    </main>
  );
}
