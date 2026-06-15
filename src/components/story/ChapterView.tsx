"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import ChoiceCard from "@/components/onboarding/ChoiceCard";
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
  const [showChapterComplete, setShowChapterComplete] = useState(false);

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
      setIsLoadingNarrative(false);
    }
  };

  const handleNext = () => {
    if (currentDecision < chapterMoments.length - 1) { 
      setCurrentDecision(prev => prev + 1);
      setSelectedChoice(null);
      setSelectedImpact(null);
      setNarrative("");
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
        }, 1800);
      } else {
        const { decisions, totalCarbonDelta, worldState, addStoryToMemoryBook, updateMissionProgress, checkAndUnlockAchievements } = useSessionStore.getState();
        
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

        router.push("/story/summary");
      }
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
              background: "rgba(255,255,255,0.7)",
              borderRadius: 20,
              padding: "20px 24px",
              marginBottom: 24,
              boxShadow: "0 4px 16px rgba(45,80,22,0.04)",
              border: "1px solid rgba(184,212,168,0.4)"
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center", 
              gap: 14,
            }}>
              <VerdOrb size={40} mood={selectedImpact} />
              <div style={{
                fontSize: 15, fontWeight: 700, color: "#4A7C2F"
              }}>
                {isLoadingNarrative ? "Verd is thinking..." : 
                 narrative ? "Verd says:" : "Verd says:"}
              </div>
            </div>
            
            {/* Narrative or situation text */}
            <div style={{
              marginLeft: 54,
              marginTop: 12,
              fontSize: 20, 
              color: narrative 
                ? selectedImpact === "eco" ? "#2D7A1F" 
                  : selectedImpact === "moderate" ? "#8B6914" 
                  : "#A0401A" 
                : "#2D5016", 
              lineHeight: 1.6,
              fontWeight: 300,
              fontStyle: "italic",
              minHeight: 48,
            }}>
              {isLoadingNarrative ? <SkeletonLine width="80%" height={20}/> :
               narrative ? (selectedImpact === "eco" ? "🌿 " : "") + `“${narrative}”` :
               `“${currentSituation}”`}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Question text (bold, centered) */}
        <motion.div 
          key={`q-${currentDecision}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          style={{
            fontSize: 24, fontWeight: 800, color: "#2D5016",
            textAlign: "center", marginBottom: 28,
            letterSpacing: "-0.01em"
          }}
        >
          {moment.question}
        </motion.div>

        {/* Decisions (stacked, full width) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

        {/* Premium Progress bar */}
        <div style={{ 
          marginTop: 32, 
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

      {/* Chapter Complete Overlay */}
      <AnimatePresence>
        {showChapterComplete && (
          <motion.div
            initial={{ opacity:0, scale:0.8 }}
            animate={{ opacity:1, scale:1 }}
            exit={{ opacity:0, scale:1.1 }}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              display: "flex", alignItems: "center",
              justifyContent: "center",
              background: "rgba(240,250,240,0.85)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
                style={{ fontSize: 72, marginBottom: 16 }}
              >
                ✨
              </motion.div>
              <div style={{ 
                fontSize: 28, fontWeight: 800, color: "#2D5016" 
              }}>
                Chapter 1 Complete!
              </div>
              <div style={{ 
                fontSize: 16, color: "#4A7C2F", marginTop: 8 
              }}>
                Evening choices await...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
