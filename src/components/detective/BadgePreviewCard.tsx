"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface BadgePreviewCardProps {
  missionTitle: string;
  onNext: () => void;
}

export default function BadgePreviewCard({ missionTitle, onNext }: BadgePreviewCardProps) {
  useEffect(() => {
    // Auto advance after short preview
    const timer = setTimeout(() => {
      onNext();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-md p-8 rounded-3xl flex flex-col items-center relative overflow-hidden text-center"
      style={{
        background: "rgba(255, 248, 231, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(244, 168, 50, 0.4)",
        boxShadow: "0 8px 32px rgba(244, 168, 50, 0.1)"
      }}
    >
      <h4 className="text-[14px] font-bold uppercase tracking-wider mb-8" style={{ color: "#A06000" }}>
        Opportunity Unlocked
      </h4>

      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: "#F4A832" }}
        />
        <div 
          className="relative w-24 h-24 rounded-full flex items-center justify-center text-[48px] bg-white border-2"
          style={{ 
            borderColor: "rgba(244,168,50,0.5)",
            filter: "grayscale(100%) opacity(70%)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.05)"
          }}
        >
          🏆
        </div>
      </div>

      <p className="text-[16px] font-medium leading-relaxed" style={{ color: "#2D5016" }}>
        Completing this mission brings you closer to a new <span className="font-bold" style={{ color: "#8B6914" }}>Memory Book Badge</span>!
      </p>

      <button
        onClick={onNext}
        className="mt-8 px-6 py-2 rounded-full font-semibold transition-transform active:scale-95"
        style={{ 
          background: "transparent",
          color: "#8B6914",
          border: "1px solid rgba(244,168,50,0.3)"
        }}
      >
        Continue to Results →
      </button>
    </motion.div>
  );
}
