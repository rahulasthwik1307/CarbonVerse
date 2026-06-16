"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import ChoiceCard from "@/components/onboarding/ChoiceCard";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useAirQuality } from "@/hooks/useAirQuality";

const CHAPTER_1_MOMENTS = [
  {
    situation: "Tuesday morning in your city. You're getting ready for work.",
    question: "How do you start your morning meal?",
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
    situation: "Lunchtime. 30 minutes to eat.",
    question: "What do you pick for lunch?",
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

const CHAPTER_2_MOMENTS = [
  {
    situation: "Evening. You need a few things from the market.",
    question: "How do you shop?",
    decisions: [
      { id:"local-market", emoji:"🛒", 
        label:"Local kirana store",
        description:"Walk to the corner shop",
        impactType:"eco" as const, carbonDelta:-5 },
      { id:"online-order", emoji:"📦",
        label:"Order online",
        description:"Home delivery with packaging",
        impactType:"moderate" as const, carbonDelta:3 },
      { id:"mall-trip", emoji:"🏬",
        label:"Drive to the mall",
        description:"Car trip, air-conditioned mall",
        impactType:"high" as const, carbonDelta:12 },
    ]
  },
  {
    situation: "After shopping. Dinner time.",
    question: "What do you cook for dinner?",
    decisions: [
      { id:"home-cook", emoji:"🥘",
        label:"Cook at home",
        description:"Fresh vegetables, minimal waste",
        impactType:"eco" as const, carbonDelta:-7 },
      { id:"order-veggie", emoji:"🥗",
        label:"Order vegetarian",
        description:"Local restaurant delivery",
        impactType:"moderate" as const, carbonDelta:2 },
      { id:"order-meat", emoji:"🥩",
        label:"Order meat dish",
        description:"High-carbon protein delivery",
        impactType:"high" as const, carbonDelta:14 },
    ]
  },
  {
    situation: "Before bed. Time to relax.",
    question: "How do you wind down?",
    decisions: [
      { id:"read-book", emoji:"📚",
        label:"Read or meditate",
        description:"Zero energy, maximum calm",
        impactType:"eco" as const, carbonDelta:-2 },
      { id:"stream-show", emoji:"📺",
        label:"Stream a show",
        description:"Moderate energy consumption",
        impactType:"moderate" as const, carbonDelta:1 },
      { id:"game-all-night", emoji:"🎮",
        label:"Game all night",
        description:"High electricity usage",
        impactType:"high" as const, carbonDelta:6 },
    ]
  },
];

const CHAPTERS: Record<number, typeof CHAPTER_1_MOMENTS> = {
  1: CHAPTER_1_MOMENTS,
  2: CHAPTER_2_MOMENTS,
};

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

const getAqiBadge = (
  impactType: "eco"|"moderate"|"high",
  aqi: number
) => {
  if (aqi > 100) {
    if (impactType === "eco") 
      return { badge: "recommended" as const, label: "✓ Best for your city today" }
    if (impactType === "high") 
      return { badge: "danger" as const, label: "⚠ Adds to today's pollution" }
    if (impactType === "moderate")
      return { badge: "warning" as const, label: "Moderate impact today" }
  }
  if (aqi > 50) {
    if (impactType === "eco")
      return { badge: "recommended" as const, label: "✓ Good choice for today" }
    if (impactType === "high")
      return { badge: "warning" as const, label: "Higher impact today" }
  }
  return { badge: null, label: "" }
}

const getCommuteCO2 = async (choiceId: string): Promise<number> => {
  // Activity IDs and distances for Indian commute
  const commuteConfig: Record<string, {
    activityId: string, value: number, unit: string
  }> = {
    "walk-cycle": {
      activityId: "passenger_vehicle-vehicle_type_bicycle-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na",
      value: 5, unit: "km"
    },
    "metro": {
      activityId: "passenger_vehicle-vehicle_type_subway-fuel_source_electricity-engine_size_na-vehicle_age_na-vehicle_weight_na", 
      value: 8, unit: "passenger_km"
    },
    "cab": {
      activityId: "passenger_vehicle-vehicle_type_taxi-fuel_source_petrol-engine_size_na-vehicle_age_na-vehicle_weight_na",
      value: 8, unit: "passenger_km"
    },
  };
  
  const config = commuteConfig[choiceId];
  if (!config) return 0;
  
  // Zero emissions for walking/cycling
  if (choiceId === "walk-cycle") return -12;
  
  try {
    const res = await fetch("/api/carbon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    });
    const data = await res.json();
    
    // Return as negative for metro (saves vs car baseline)
    // positive for cab
    if (choiceId === "metro") return -(data.co2kg || 3);
    if (choiceId === "cab") return data.co2kg || 10;
    return data.co2kg || 0;
  } catch {
    // Fallback values
    return choiceId === "cab" ? 10 : -3;
  }
};

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    setDisplayedText("");
    const chars = Array.from(text);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(chars.slice(0, i + 1).join(""));
      i++;
      if (i >= chars.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayedText}</span>;
}

export default function ChapterView() {
  const router = useRouter();
  const { profile, worldState, applyDecision } = useSessionStore();
  const ecoChoicesCount = useSessionStore(s => s.decisions.filter(d => d.impactType === "eco").length);
  const isEcoChapter = ecoChoicesCount >= 2;
  
  const [currentDecision, setCurrentDecision] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<"eco" | "moderate" | "high" | null>(null);
  const [narrative, setNarrative] = useState("");
  const [thinkingPhase, setThinkingPhase] = useState<"idle"|"thinking"|"speaking">("idle");
  const [worldReacting, setWorldReacting] = useState(false);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [branchContext, setBranchContext] = useState<string[]>([]);
  const [verdPulseKey, setVerdPulseKey] = useState(0);

  const { data: aqiData } = useAirQuality();

  const chapter = useSessionStore(s => s.currentChapter);
  const advanceChapter = useSessionStore(s => s.advanceChapter);
  const chapterMoments = CHAPTERS[chapter] || CHAPTER_1_MOMENTS;

  const moment = chapterMoments[currentDecision];
  const currentSituation = moment.situation;

  // Stable shuffle for options
  const [shuffledDecisions, setShuffledDecisions] = useState(moment.decisions);

  useEffect(() => {
    setShuffledDecisions([...moment.decisions].sort(() => Math.random() - 0.5));
  }, [moment]);

  const handleSelect = async (choiceId: string, label: string, impactType: "eco" | "moderate" | "high", carbonDelta: number) => {
    if (selectedChoice) return;
    
    setSelectedChoice(choiceId);
    setSelectedImpact(impactType);
    setBranchContext(prev => [...prev, choiceId]);

    // For commute choices, get real emissions.dev value
    let finalCarbonDelta = carbonDelta; // default hardcoded
    if (currentDecision === 1 && chapter === 1) {
      // This is the commute choice — use real API
      const realCO2 = await getCommuteCO2(choiceId);
      finalCarbonDelta = realCO2;
    }

    applyDecision(label, impactType, finalCarbonDelta);
    
    setWorldReacting(true);
    setTimeout(() => setWorldReacting(false), 400);

    // Pulse Verd once when an eco option is selected
    if (impactType === "eco") {
      setVerdPulseKey(prev => prev + 1);
    }

    setThinkingPhase("thinking");
    
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: label,
          impactType,
          worldState,
          city: profile.city || "your city",
          chapter: currentSituation,
          aqi: aqiData?.aqi || 75,
        })
      });
      const data = await res.json();
      setNarrative(data.narrative);
    } catch (e) {
      console.error(e);
      setNarrative("Every choice matters. Let's see what happens next! 🌱");
    } finally {
      setThinkingPhase("speaking");
    }
  };

  const handleNext = () => {
    if (currentDecision < chapterMoments.length - 1) { 
      setCurrentDecision(prev => prev + 1);
      setSelectedChoice(null);
      setSelectedImpact(null);
      setNarrative("");
      setThinkingPhase("idle");
    } else {
      if (chapter === 1) {
        setShowChapterComplete(true);
        setTimeout(() => {
          advanceChapter();
          setShowChapterComplete(false);
          setCurrentDecision(0);
          setSelectedChoice(null);
          setSelectedImpact(null);
          setNarrative("");
          setThinkingPhase("idle");
        }, 1800);
      } else {
        const { decisions, totalCarbonDelta, worldState, addStoryToMemoryBook, updateMissionProgress, checkAndUnlockAchievements, generateNewMissions } = useSessionStore.getState();
        
        addStoryToMemoryBook({
          chapterNumber: chapter,
          decisions: decisions.map((d, i) => ({
            moment: ["breakfast","commute","lunch",
                     "shopping","dinner","wind-down"][i] || "activity",
            choice: d.choice,
            impactType: d.impactType,
            carbonKg: d.carbonDelta,
          })),
          totalCarbonKg: totalCarbonDelta,
          planetMood: worldState.planetMood,
        });

        updateMissionProgress("story_complete");
        checkAndUnlockAchievements();
        generateNewMissions();

        router.push("/story/summary");
      }
    }
  };

  const verdMood = thinkingPhase === "thinking" ? "thinking" : selectedImpact;

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <AnimatePresence mode="popLayout">
        {!showChapterComplete && (
          <motion.div
            layout
            key="chapter-panel"
            className="glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{
              width: "100%",
              padding: "24px 28px",
              borderRadius: 28,
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 32px rgba(45, 80, 22, 0.1)",
            }}
          >
        {/* Top row: Chapter badge (centered) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{
            background: "rgba(74, 124, 47, 0.1)",
            color: "#4A7C2F",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            border: "1px solid rgba(74, 124, 47, 0.2)"
          }}>
            Chapter {chapter} · {chapter === 1 ? "Tuesday" : "Evening"}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentDecision}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{
              background: "rgba(255,255,255,0.65)",
              borderRadius: 16,
              padding: "14px 18px",
              marginBottom: 14,
              boxShadow: "0 2px 10px rgba(45,80,22,0.03)",
              border: "1px solid rgba(184,212,168,0.35)"
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center", 
              gap: 14,
            }}>
              <motion.div
                key={verdPulseKey}
                animate={{ scale: thinkingPhase === "speaking" ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <VerdOrb size={34} mood={verdMood} />
              </motion.div>
              <div style={{
                fontSize: 13, fontWeight: 700, color: "#4A7C2F", display: "flex", flexDirection: "column"
              }}>
                {thinkingPhase === "thinking" ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: "#6B8F5E", fontStyle: "italic" }}>
                    Verd is thinking...
                  </motion.div>
                ) : narrative ? "Verd says:" : "Verd says:"}
              </div>
            </div>
            
            {/* Narrative or situation text */}
            <div style={{
              marginLeft: 48,
              marginTop: 6,
              fontSize: 14, 
              color: narrative 
                ? selectedImpact === "eco" ? "#2D7A1F" 
                  : selectedImpact === "moderate" ? "#8B6914" 
                  : "#A0401A" 
                : "#2D5016", 
              lineHeight: 1.5,
              fontWeight: 300,
              fontStyle: "italic",
              minHeight: 28,
            }}>
              {thinkingPhase === "thinking" ? (
                <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.8)", borderRadius: 16, border: "1px solid rgba(184,212,168,0.5)", width: "fit-content", position: "relative" }}>
                  <div style={{ position: "absolute", left: -6, top: 10, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "6px solid rgba(184,212,168,0.5)" }} />
                  <div style={{ position: "absolute", left: -5, top: 10, width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderRight: "6px solid rgba(255,255,255,0.8)" }} />
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4A7C2F" }}
                    />
                  ))}
                </div>
              ) :
               narrative ? (
                 <motion.div
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.3 }}
                 >
                   <TypewriterText text={(selectedImpact === "eco" ? "🌿 " : selectedImpact === "high" ? "☀️ " : "") + `“${narrative}”`} />
                 </motion.div>
               ) :
               `“${currentSituation}”`}
            </div>

            {/* Branching Line */}
            {(thinkingPhase === "idle") && (() => {
              const getBranchingLine = (momentIndex: number, context: string[]) => {
                if (momentIndex === 0) return "";
                
                const hadCab = context.includes("cab");
                const hadBurger = context.includes("delivery-burger");
                const hadEco = context.some(c => 
                  ["walk-cycle","plant-breakfast","home-tiffin"].includes(c));
                
                if (momentIndex === 1) {
                  if (hadBurger) return "After that delivery, the air feels a bit heavy. 🌫️";
                  if (hadEco) return "Your plant-based start is already helping! 🌿";
                }
                if (momentIndex === 2) {
                  if (hadCab) return "The cab ride added to today's footprint. 🚕";
                  if (context.includes("walk-cycle")) return "Your morning walk kept the air cleaner! 🚶";
                }
                if (momentIndex >= 3) {
                  const previousHighCount = context.filter(c => 
                    ["cab","delivery-burger","delivery-app",
                     "mall-trip","order-meat","game-all-night"].includes(c)
                  ).length;
                  if (previousHighCount >= 2) return "Traffic is heavier than usual today. 🌫️";
                  if (previousHighCount === 0) return "Your choices are keeping things green! 🌱";
                }
                return "";
              };

              const globalMomentIndex = (chapter - 1) * 3 + currentDecision;
              const branchingLine = getBranchingLine(globalMomentIndex, branchContext);

              if (!branchingLine) return null;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    marginLeft: 48,
                    fontSize: 13,
                    color: branchContext.some(c => 
                      ["cab","delivery-burger"].includes(c))
                      ? "#8B6914" 
                      : "#2D7A1F",
                    fontStyle: "italic",
                    marginTop: 8,
                    fontWeight: 500,
                  }}
                >
                  {branchingLine}
                </motion.div>
              );
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Question text (bold, centered) */}
        <motion.div 
          key={`q-${currentDecision}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          style={{
            fontSize: 19, fontWeight: 700, color: "#2D5016",
            textAlign: "center", marginBottom: 14,
            letterSpacing: "-0.01em"
          }}
        >
          {moment.question}
        </motion.div>

        {/* Decisions (stacked, full width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shuffledDecisions.map((d, index) => {
            const isSelected = selectedChoice === d.id;
            const isDimmed = selectedChoice !== null && !isSelected;
            
            const { badge, label } = getAqiBadge(d.impactType, aqiData?.aqi || 50);

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
                  aqiBadge={badge}
                  aqiLabel={label}
                  impactType={d.impactType}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Next Button inside the panel */}
        <AnimatePresence>
          {selectedChoice && thinkingPhase !== "thinking" && (
            <motion.button
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }}
              whileHover={{ scale:1.03 }}
              whileTap={{ scale:0.97 }}
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "12px 0",
                marginTop: 14,
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

        {/* Premium Progress bar */}
        <div style={{ 
          marginTop: 20, 
          height: 8, 
          width: "100%", 
          background: "rgba(74, 124, 47, 0.08)", 
          borderRadius: 999, 
          overflow: "hidden",
          position: "relative",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)"
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentDecision + 1) / chapterMoments.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ 
              height: "100%", 
              background: "linear-gradient(90deg, #7BC67E 0%, #4CAF50 100%)", 
              borderRadius: 999,
              position: "relative",
              overflow: "hidden"
            }}
          >
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
        )}
      </AnimatePresence>

      {/* Chapter Complete Overlay */}
      <AnimatePresence>
        {showChapterComplete && (
          <motion.div
            key="chapter-transition"
            initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 20px)", scale: 0.95 }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: "calc(-50% - 20px)", scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              zIndex: 100,
              width: "90%",
              maxWidth: 380,
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 12px 40px rgba(45, 80, 22, 0.15)",
              borderRadius: 32,
              padding: "40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              overflow: "hidden", // clip leaves and butterflies
            }}
          >
            {/* Particles container */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
              {/* 3-5 leaves */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`leaf-${i}`}
                  initial={{ x: -20, y: 150, rotate: 0, opacity: 0, scale: 0.5 }}
                  animate={{ x: 380, y: -40, rotate: 360, opacity: [0, 1, 1, 0], scale: 1 }}
                  transition={{ duration: 1.2 + i * 0.2, delay: i * 0.1, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    width: 14, height: 18,
                    borderRadius: "50% 0 50% 50%",
                    backgroundColor: `rgba(76,175,80,${0.4 + i * 0.1})`,
                    left: 20 + i * 40,
                  }}
                />
              ))}

              {/* Butterflies if eco */}
              {isEcoChapter && [...Array(2)].map((_, i) => (
                <motion.div
                  key={`tb-${i}`}
                  initial={{ opacity: 0, x: i === 0 ? -40 : 380, y: 150, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], x: i === 0 ? 300 : -20, y: -50, scale: 0.8 }}
                  transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: 60, height: 60,
                  }}
                >
                  <DotLottieReact src="/lottie/butterfly.json" loop autoplay renderConfig={{ autoResize: false }} style={{ width: "100%", height: "100%" }} />
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
              >
                <VerdOrb size={56} mood="eco" />
              </motion.div>
              
              <div style={{ fontSize: 24, fontWeight: 800, color: "#2D5016", marginTop: 16 }}>
                ✨ Chapter {chapter} Complete
              </div>

              <div style={{ fontSize: 14, color: "#4A7C2F", fontWeight: 500, marginTop: 8 }}>
                {isEcoChapter ? "You made some great green choices!" : "Every small step counts towards tomorrow."}
              </div>

              <div style={{ fontSize: 13, color: "#6B8F5E", marginTop: 24, fontStyle: "italic" }}>
                Evening begins...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
