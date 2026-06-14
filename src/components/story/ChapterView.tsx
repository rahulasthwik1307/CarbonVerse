"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import ChoiceCard from "@/components/onboarding/ChoiceCard";

const CHAPTER_1 = {
  id: 1,
  title: "Chapter 1",
  subtitle: "Tuesday Morning",
  situation: "You wake up hungry before work. What do you have for breakfast?",
  decisions: [
    {
      id: "plant-breakfast",
      emoji: "🥗",
      label: "Plant-based meal",
      description: "Oats, fruits, and green smoothie",
      impactType: "eco" as const,
      carbonDelta: -8,
    },
    {
      id: "local-meal",
      emoji: "🍳",
      label: "Local restaurant",
      description: "Dosa or idli from nearby dhaba",
      impactType: "moderate" as const,
      carbonDelta: -2,
    },
    {
      id: "beef-delivery",
      emoji: "🍔",
      label: "Delivery burger",
      description: "Beef burger delivered by bike",
      impactType: "high" as const,
      carbonDelta: 15,
    },
  ],
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

export default function ChapterView() {
  const router = useRouter();
  const { profile, worldState, applyDecision } = useSessionStore();
  
  const [currentDecision, setCurrentDecision] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [narrative, setNarrative] = useState("");
  const [isLoadingNarrative, setIsLoadingNarrative] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [worldReacting, setWorldReacting] = useState(false);

  const handleSelect = async (choiceId: string, impactType: "eco" | "moderate" | "high", carbonDelta: number) => {
    if (selectedChoice) return;
    
    setSelectedChoice(choiceId);
    applyDecision(choiceId, impactType, carbonDelta);
    
    setWorldReacting(true);
    setTimeout(() => setWorldReacting(false), 400);

    setIsLoadingNarrative(true);
    
    try {
      const res = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: choiceId,
          impactType,
          worldState,
          city: profile.city || "your city",
          chapter: CHAPTER_1.id,
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
    // For now we just have 1 decision in the mock, but simulating up to 3 
    // to match progress bar requirement and user prompt "After last decision in chapter..."
    if (currentDecision < 2) { 
      setCurrentDecision(prev => prev + 1);
      setSelectedChoice(null);
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
        {/* Top: Chapter badge */}
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
            {CHAPTER_1.title} · {CHAPTER_1.subtitle}
          </div>
        </div>

        {/* Verd + Narrative Section */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24, minHeight: 80 }}>
          <VerdOrb size={44} />
          <div style={{ flex: 1, color: "#2D5016", fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>
            <AnimatePresence mode="wait">
              {isLoadingNarrative ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}
                >
                  <SkeletonLine width="90%" height={16} />
                  <SkeletonLine width="70%" height={16} />
                  <SkeletonLine width="40%" height={10} />
                </motion.div>
              ) : narrative ? (
                <motion.div
                  key="narrative"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  &ldquo;{narrative}&rdquo;
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* Situation text */}
        <motion.div layout style={{ fontSize: 18, fontWeight: 500, color: "#2D5016", textAlign: "center", margin: "20px 0" }}>
          {CHAPTER_1.situation}
        </motion.div>

        {/* Decisions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            {CHAPTER_1.decisions.map((d, index) => {
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
                    onClick={() => handleSelect(d.id, d.impactType, d.carbonDelta)}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <AnimatePresence>
          {selectedChoice && !isLoadingNarrative && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", justifyContent: "center", marginTop: 24 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #4A7C2F 0%, #2D5016 100%)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(45, 80, 22, 0.2)",
                }}
              >
                Next →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div style={{ marginTop: 32, height: 4, width: "100%", background: "rgba(74, 124, 47, 0.1)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${((currentDecision + (selectedChoice ? 1 : 0)) / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ height: "100%", background: "#4A7C2F", borderRadius: 2 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
