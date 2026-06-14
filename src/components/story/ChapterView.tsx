"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import ChoiceCard from "@/components/onboarding/ChoiceCard";
import { useAirQuality } from "@/hooks/useAirQuality";

const CHAPTER_1_MOMENTS = [
  {
    situation: "Tuesday morning. You're hungry before work.",
    question: "What do you have for breakfast?",
    decisions: [
      { id:"plant-breakfast", emoji:"🥗", label:"Plant-based meal",
        description:"Oats, fruits, green smoothie",
        impactType:"eco" as const, carbonDelta:-8 },
      { id:"local-dhaba", emoji:"🍳", label:"Local dhaba",
        description:"Dosa or idli nearby",
        impactType:"moderate" as const, carbonDelta:-2 },
      { id:"delivery-burger", emoji:"🍔", label:"Delivery burger",
        description:"Beef burger by delivery bike",
        impactType:"high" as const, carbonDelta:15 },
    ]
  },
  {
    situation: "Time to head to work.",
    question: "How do you commute today?",
    decisions: [
      { id:"walk-cycle", emoji:"🚶", label:"Walk or cycle",
        description:"Zero emissions, stays fit",
        impactType:"eco" as const, carbonDelta:-12 },
      { id:"metro", emoji:"🚇", label:"Take the metro",
        description:"Public transport",
        impactType:"moderate" as const, carbonDelta:-3 },
      { id:"cab", emoji:"🚗", label:"Book a cab",
        description:"Private car ride",
        impactType:"high" as const, carbonDelta:10 },
    ]
  },
  {
    situation: "Lunchtime. You have 30 minutes.",
    question: "What do you eat for lunch?",
    decisions: [
      { id:"home-tiffin", emoji:"🥘", label:"Home-cooked tiffin",
        description:"Brought from home, zero packaging",
        impactType:"eco" as const, carbonDelta:-6 },
      { id:"canteen", emoji:"🍱", label:"Office canteen",
        description:"Local vegetarian meal",
        impactType:"moderate" as const, carbonDelta:-1 },
      { id:"delivery-app", emoji:"📱", label:"Food delivery app",
        description:"Single-use plastic packaging",
        impactType:"high" as const, carbonDelta:8 },
    ]
  },
];

function SkeletonLine({ width, height }: { width: string; height: number }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", height, width, borderRadius: 4, background: "rgba(74, 124, 47, 0.1)" }}>
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
        style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)" }}
      />
    </div>
  );
}

export default function ChapterView() {
  const router = useRouter();
  const { profile, worldState, applyDecision } = useSessionStore();
  
  const [currentDecision, setCurrentDecision] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<"eco" | "moderate" | "high" | null>(null);
  const [narrative, setNarrative] = useState("");
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [worldReacting, setWorldReacting] = useState(false);

  const { data: aqiData } = useAirQuality();

  const moment = CHAPTER_1_MOMENTS[currentDecision];

  const handleSelect = async (choiceId: string, label: string, impactType: "eco" | "moderate" | "high", carbonDelta: number) => {
    if (selectedChoice) return;
    
    setSelectedChoice(choiceId);
    setSelectedImpact(impactType);
    applyDecision(label, impactType, carbonDelta);
    
    setWorldReacting(true);
    setTimeout(() => setWorldReacting(false), 400);

    setIsLoadingNarrative(true);
    
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: label,
          impactType,
          worldState,
          city: profile.city || "your city",
          chapter: moment.situation,
          aqi: aqiData?.aqi || 75,
        })
      });
      const data = await res.json();
      setNarrative(data.narrative);
    } catch (e) {
      console.error(e);
      setNarrative("Every choice matters. Let's see what happens next! 🌱");
    } finally {
      setIsLoadingNarrative(false);
    }
  };

  const handleNext = () => {
    if (currentDecision < CHAPTER_1_MOMENTS.length - 1) { 
      setCurrentDecision(prev => prev + 1);
      setSelectedChoice(null);
      setSelectedImpact(null);
      setNarrative("");
    } else {
      router.push("/story/summary");
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <motion.div
        layout
        className="glass-panel"
        style={{
          width: "100%",
          padding: 36,
          borderRadius: 28,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px rgba(45, 80, 22, 0.1)",
        }}
      >
        {aqiData && (
          <motion.div
            initial={{ opacity:0, y:-10 }}
            animate={{ opacity:1, y:0 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 16,
              padding: "6px 14px",
              borderRadius: 20,
              background: `${aqiData.aqiColor}20`,
              border: `1px solid ${aqiData.aqiColor}40`,
              width: "fit-content",
              margin: "0 auto 16px",
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: aqiData.aqiColor,
              boxShadow: `0 0 6px ${aqiData.aqiColor}`,
              animation: "cv-verd-pulse 2s ease-in-out infinite"
            }} />
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: aqiData.aqiColor
            }}>
              Air Quality: {aqiData.aqiLevel} · AQI {aqiData.aqi}
            </span>
          </motion.div>
        )}

        {/* Top row: Chapter badge (centered) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{
            background: "rgba(74, 124, 47, 0.1)",
            color: "#4A7C2F",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            border: "1px solid rgba(74, 124, 47, 0.2)"
          }}>
            Chapter 1 · Tuesday
          </div>
        </div>

        {/* SINGLE situation block */}
        <div style={{
          background: "rgba(74,124,47,0.08)",
          borderRadius: 16,
          padding: "16px 20px",
          marginBottom: 20,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center", 
            gap: 12,
          }}>
            <VerdOrb size={36} mood={selectedImpact} />
            <div style={{
              fontSize: 14, fontWeight: 600, color: "#4A7C2F"
            }}>
              {isLoadingNarrative ? "Verd is thinking..." : 
               narrative ? "Verd says:" : "Verd says:"}
            </div>
          </div>
          
          {/* Narrative or situation text */}
          <div style={{
            marginLeft: 48,
            marginTop: 8,
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 0.6)",
            borderRadius: "0 12px 12px 12px",
            borderLeft: "3px solid #4A7C2F",
            fontSize: 15, 
            color: narrative 
              ? selectedImpact === "eco" ? "#2D7A1F" 
                : selectedImpact === "moderate" ? "#8B6914" 
                : "#A0401A" 
              : "#2D5016", 
            lineHeight: 1.6,
            fontStyle: "italic",
            minHeight: 40,
          }}>
            {isLoadingNarrative ? <SkeletonLine width="80%" height={16}/> :
             narrative ? (selectedImpact === "eco" ? "🌿 " : "") + `“${narrative}”` :
             aqiData ? `“${aqiData.verdMessage}”` :
             `“${moment.situation}”`}
          </div>
        </div>

        {/* Question text (bold, centered) */}
        <div style={{
          fontSize: 17, fontWeight: 600, color: "#2D5016",
          textAlign: "center", marginBottom: 20
        }}>
          {moment.question}
        </div>

        {/* Decisions (stacked, full width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {moment.decisions.map((d, index) => {
            const isSelected = selectedChoice === d.id;
            const isDimmed = selectedChoice !== null && !isSelected;
            
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isDimmed ? 0.4 : 1, y: 0 }}
                transition={{ delay: selectedChoice ? 0 : index * 0.08 }}
                style={{ pointerEvents: selectedChoice ? "none" : "auto" }}
              >
                <ChoiceCard
                  emoji={d.emoji}
                  label={d.label}
                  description={d.description}
                  isSelected={isSelected}
                  onClick={() => handleSelect(d.id, d.label, d.impactType, d.carbonDelta)}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Next Button inside the panel */}
        <AnimatePresence>
          {selectedChoice && !isLoadingNarrative && (
            <motion.button
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }}
              whileHover={{ scale:1.03 }}
              whileTap={{ scale:0.97 }}
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "14px 0",
                marginTop: 20,
                background: "linear-gradient(135deg, #4A7C2F 0%, #2D5016 100%)",
                color: "white",
                borderRadius: 14,
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
              }}
            >
              {currentDecision < 2 ? "Next →" : "See Your Impact ✨"}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div style={{ marginTop: 24, height: 4, width: "100%", background: "rgba(74, 124, 47, 0.1)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${((currentDecision + 1) / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ height: "100%", background: "#4A7C2F", borderRadius: 2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
