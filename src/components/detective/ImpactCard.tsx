"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface ImpactCardProps {
  totalCO2: number;
  totalCO2Label: string;
  impactLevel: "low" | "moderate" | "high" | "very_high";
  onNext: () => void;
}

const IMPACT_COLORS = {
  low: "#2D7A1F",
  moderate: "#8B6914",
  high: "#A0401A",
  very_high: "#8B1A1A"
};

const IMPACT_MESSAGES = {
  low: "🌱 Your choices are gentle on the Earth",
  moderate: "🌿 Room to grow greener",
  high: "🌍 A big footprint, but awareness is the first step",
  very_high: "🔥 This one leaves a mark — let's find better paths"
};

const IMPACT_FILLS = {
  low: "20%",
  moderate: "45%",
  high: "70%",
  very_high: "95%"
};

export default function ImpactCard({ totalCO2, totalCO2Label, impactLevel, onNext }: ImpactCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (impactLevel === "low") {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ['#4CAF50', '#8BC34A', '#CDDC39'],
          disableForReducedMotion: true
        });
      }, 500);
    }

    const duration = 1500;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo curve
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedValue(totalCO2 * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    // Auto advance after reading
    const timer = setTimeout(() => {
      onNext();
    }, 4500);

    return () => clearTimeout(timer);
  }, [totalCO2, impactLevel, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden"
      style={{
        background: "rgba(255, 248, 231, 0.95)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${IMPACT_COLORS[impactLevel]}40`,
        boxShadow: `0 8px 32px ${IMPACT_COLORS[impactLevel]}15`
      }}
    >
      <div 
        className="px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wider mb-6"
        style={{
          background: `${IMPACT_COLORS[impactLevel]}15`,
          color: IMPACT_COLORS[impactLevel]
        }}
      >
        Carbon Impact
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="text-[64px] leading-none font-bold tracking-tight" style={{ color: IMPACT_COLORS[impactLevel] }}>
          {animatedValue.toFixed(1)} <span className="text-3xl opacity-60 font-semibold">kg CO₂</span>
        </div>
      </div>

      <div className="w-full h-3 rounded-full mb-6 relative overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: IMPACT_FILLS[impactLevel] }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="absolute left-0 top-0 bottom-0 rounded-full"
          style={{ background: IMPACT_COLORS[impactLevel] }}
        />
      </div>

      <div className="font-semibold text-[16px] mb-2" style={{ color: "#2D5016" }}>
        {IMPACT_MESSAGES[impactLevel]}
      </div>
      
      <div className="text-[14px] italic font-medium" style={{ color: "#6B8F5E" }}>
        {totalCO2Label}
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
