"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import VerdOrb from "@/components/ui/VerdOrb";

interface VerdInsightCardProps {
  verdVerdict: string;
  topInsight: string;
  impactLevel: "low" | "moderate" | "high" | "very_high";
  onNext: () => void;
}

export default function VerdInsightCard({ verdVerdict, topInsight, impactLevel, onNext }: VerdInsightCardProps) {
  useEffect(() => {
    // Auto advance after reading time
    const timer = setTimeout(() => {
      onNext();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onNext]);

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
        border: "1px solid rgba(184, 212, 168, 0.6)",
        boxShadow: "0 8px 32px rgba(45, 80, 22, 0.08)"
      }}
    >
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        className="mb-6"
      >
        <VerdOrb size={80} mood={impactLevel === "high" || impactLevel === "very_high" ? "high" : "eco"} />
      </motion.div>

      <div className="w-full relative bg-white p-5 rounded-2xl rounded-tl-sm border border-[rgba(184,212,168,0.4)] shadow-sm">
        {/* Speech bubble tail */}
        <div className="absolute -top-3 left-8 w-4 h-4 bg-white border-l border-t border-[rgba(184,212,168,0.4)] rotate-45" />
        
        <p className="text-[16px] font-medium leading-relaxed mb-4" style={{ color: "#2D5016" }}>
          "{verdVerdict}"
        </p>

        {topInsight && (
          <div className="pt-4 mt-4 border-t border-[rgba(184,212,168,0.3)]">
            <h4 className="text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: "#F4A832" }}>
              Verd's Insight
            </h4>
            <p className="text-[14px] italic font-medium" style={{ color: "#4A7C2F" }}>
              {topInsight}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="mt-8 px-6 py-2 rounded-full font-semibold transition-transform active:scale-95"
        style={{ 
          background: "transparent",
          color: "#4A7C2F",
          border: "1px solid rgba(74,124,47,0.3)"
        }}
      >
        Continue →
      </button>
    </motion.div>
  );
}
