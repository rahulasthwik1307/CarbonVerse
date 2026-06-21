"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useSessionStore } from "@/lib/session-store";

interface MissionOpportunityCardProps {
  mission: {
    id: string;
    title: string;
    emoji: string;
    description: string;
    targetType: "eco_choices" | "receipt_upload" | "story_complete";
  };
  onAccept: () => void;
  onSkip: () => void;
}

export default function MissionOpportunityCard({ mission, onAccept, onSkip }: MissionOpportunityCardProps) {
  const { acceptDetectiveMission } = useSessionStore();
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = () => {
    acceptDetectiveMission(mission);
    setIsAccepted(true);
    
    // Show brief checkmark before advancing
    setTimeout(() => {
      onAccept();
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-md p-8 rounded-3xl flex flex-col items-center relative overflow-hidden"
      style={{
        background: "rgba(255, 248, 231, 0.95)",
        backdropFilter: "blur(12px)",
        border: "2px solid rgba(123, 198, 126, 0.4)",
        boxShadow: "0 8px 32px rgba(45, 80, 22, 0.08)"
      }}
    >
      <div 
        className="px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider mb-6"
        style={{
          background: "rgba(123, 198, 126, 0.15)",
          color: "#2D7A1F"
        }}
      >
        Suggested Mission
      </div>

      <div className="w-20 h-20 rounded-full flex items-center justify-center text-[40px] mb-4 shadow-sm bg-white border border-[rgba(184,212,168,0.5)]">
        {mission.emoji}
      </div>

      <h3 className="text-[22px] font-bold text-center mb-2" style={{ color: "#2D5016" }}>
        {mission.title}
      </h3>
      
      <p className="text-[15px] text-center font-medium leading-relaxed mb-8" style={{ color: "#4A7C2F" }}>
        {mission.description}
      </p>

      {isAccepted ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-13 rounded-2xl flex items-center justify-center gap-2 font-semibold text-white shadow-lg"
          style={{ background: "#4CAF50" }}
        >
          ✓ Mission Accepted
        </motion.div>
      ) : (
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleAccept}
            className="w-full h-13 rounded-2xl font-semibold text-white shadow-lg relative overflow-hidden transition-transform active:scale-95"
            style={{
              background: "linear-gradient(135deg, #4A7C2F 0%, #7BC67E 100%)",
              boxShadow: "0 6px 20px rgba(74,124,47,0.3)",
            }}
          >
            🌱 Accept Mission
          </button>
          
          <button
            onClick={onSkip}
            className="w-full h-12 rounded-2xl font-medium transition-transform active:scale-95"
            style={{ 
              background: "transparent",
              color: "#6B8F5E",
            }}
          >
            Skip for now →
          </button>
        </div>
      )}
    </motion.div>
  );
}
