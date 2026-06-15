"use client";

import { motion } from "framer-motion";
import { DetectiveResult } from "@/types/carbon";
import VerdOrb from "@/components/ui/VerdOrb";
import { useRouter } from "next/navigation";

interface DetectiveResultsProps {
  result: DetectiveResult;
  city: string;
  onReset: () => void;
}

const TYPE_BADGES = {
  food: { icon: "🍽️", label: "Food Receipt", color: "#4A7C2F" },
  fuel: { icon: "⛽", label: "Fuel Receipt", color: "#E8A020" },
  electricity: { icon: "⚡", label: "Electricity Bill", color: "#F4A832" },
  transport: { icon: "🚗", label: "Transport Receipt", color: "#4A9B8E" },
  shopping: { icon: "🛍️", label: "Shopping Receipt", color: "#9C6B98" },
  unknown: { icon: "📄", label: "Receipt", color: "#6B8F5E" }
};

const IMPACT_COLORS = {
  low: "#2D7A1F",      // green
  moderate: "#8B6914", // amber
  high: "#A0401A",     // terracotta
  very_high: "#8B1A1A" // deep red
};

const IMPACT_FILLS = {
  low: "20%",
  moderate: "45%",
  high: "70%",
  very_high: "95%"
};

export default function DetectiveResults({ result, city, onReset }: DetectiveResultsProps) {
  const router = useRouter();
  
  const typeBadge = TYPE_BADGES[result.receiptType] || TYPE_BADGES.unknown;
  const impactColor = IMPACT_COLORS[result.impactLevel] || IMPACT_COLORS.moderate;
  const impactFill = IMPACT_FILLS[result.impactLevel] || "45%";

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* SECTION 1 - HEADER */}
      <div className="flex flex-col items-center text-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-1.5 rounded-full text-sm font-semibold"
          style={{
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1px solid ${typeBadge.color}40`,
            color: typeBadge.color,
          }}
        >
          {typeBadge.icon} {typeBadge.label}
        </motion.div>
        
        {result.merchantName && (
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-[22px] font-bold"
            style={{ color: "#2D5016" }}
          >
            {result.merchantName}
          </motion.h2>
        )}
      </div>

      {/* SECTION 2 - TOTAL IMPACT */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
        className="flex flex-col items-center text-center gap-4 py-4"
      >
        <div className="flex flex-col items-center">
          <div className="text-[56px] leading-none font-bold tracking-tight" style={{ color: impactColor }}>
            {result.totalCO2} <span className="text-2xl opacity-75 font-semibold">kg CO₂</span>
          </div>
          <div className="text-[15px] italic mt-1 font-medium" style={{ color: "#6B8F5E" }}>
            {result.totalCO2Label}
          </div>
        </div>

        <div className="w-full max-w-70 h-3 rounded-full mt-2 relative overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: impactFill }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{ background: impactColor }}
          />
        </div>
      </motion.div>

      {/* SECTION 3 - ITEMS BREAKDOWN */}
      {result.items && result.items.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="text-[16px] font-semibold" style={{ color: "#2D5016" }}>What we found</h3>
          <div className="flex flex-col gap-3">
            {result.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (idx * 0.08), ease: "easeOut" }}
                className="flex items-center justify-between p-3 px-4 rounded-2xl relative overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(184,212,168,0.4)",
                  boxShadow: "0 2px 8px rgba(45,80,22,0.05)"
                }}
              >
                <div 
                  className="absolute left-0 top-0 bottom-0 w-0.75"
                  style={{
                    background: item.confidence === "high" ? "#4CAF50" : 
                                item.confidence === "medium" ? "#F4A832" : "#A8BEA9"
                  }}
                />
                <div className="flex flex-col pl-2">
                  <span className="font-semibold" style={{ color: "#2D5016" }}>{item.name}</span>
                  <span className="text-[12px] italic" style={{ color: "#6B8F5E" }}>{item.note}</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="font-bold text-[15px]" style={{ color: impactColor }}>{item.estimatedCO2} kg</span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mt-1" 
                    style={{ 
                      background: item.confidence === "high" ? "rgba(76,175,80,0.15)" : 
                                 item.confidence === "medium" ? "rgba(244,168,50,0.15)" : "rgba(168,190,169,0.2)",
                      color: item.confidence === "high" ? "#2D7A1F" : 
                             item.confidence === "medium" ? "#A06000" : "#5A7C5B"
                    }}>
                    {item.confidence}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4 - TOP INSIGHT */}
      {result.topInsight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 + ((result.items?.length || 0) * 0.08), duration: 0.5 }}
          className="flex items-start gap-4 p-5 rounded-2xl relative overflow-hidden mt-2"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(244,168,50,0.3)",
            boxShadow: "0 4px 16px rgba(244,168,50,0.06)"
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "#F4A832" }} />
          <div className="text-[24px] pl-1">💡</div>
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-[14px]" style={{ color: "#A06000" }}>Did you know?</h4>
            <p className="text-[15px] leading-relaxed font-medium" style={{ color: "#2D5016" }}>
              {result.topInsight}
            </p>
          </div>
        </motion.div>
      )}

      {/* SECTION 5 - VERD'S VERDICT */}
      {result.verdVerdict && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 items-start mt-6 p-4 rounded-2xl"
          style={{
            background: "rgba(240,250,240,0.6)",
            border: "1px solid rgba(76,175,80,0.3)",
          }}
        >
          <div className="shrink-0 pt-1">
            <VerdOrb size={44} mood={result.impactLevel === "high" || result.impactLevel === "very_high" ? "high" : "eco"} />
          </div>
          <p className="text-[15px] italic font-medium pt-2 leading-relaxed" style={{ color: "#2D5016" }}>
            "{result.verdVerdict}"
          </p>
        </motion.div>
      )}

      {/* SECTION 6 - SUGGESTIONS */}
      {result.suggestions && result.suggestions.length > 0 && (
        <div className="flex flex-col gap-3 mt-8">
          <h3 className="text-[16px] font-semibold" style={{ color: "#2D5016" }}>What you can do</h3>
          <div className="grid grid-cols-1 gap-3">
            {result.suggestions.map((sug, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (idx * 0.1) }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(45,80,22,0.12)" }}
                className="flex items-center justify-between p-4 rounded-2xl cursor-default"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(184,212,168,0.5)",
                  boxShadow: "0 2px 8px rgba(45,80,22,0.06)"
                }}
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="font-semibold text-[15px]" style={{ color: "#2D5016" }}>{sug.action}</span>
                  <span className="text-[13px] font-medium" style={{ color: "#4CAF50" }}>Saves {sug.potentialSaving}</span>
                </div>
                <div 
                  className="shrink-0 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: sug.difficulty === "easy" ? "rgba(76,175,80,0.15)" : 
                               sug.difficulty === "medium" ? "rgba(244,168,50,0.15)" : "rgba(244,168,50,0.2)",
                    color: sug.difficulty === "easy" ? "#2D7A1F" : 
                           sug.difficulty === "medium" ? "#A06000" : "#A0401A"
                  }}
                >
                  {sug.difficulty === "easy" ? "✓ Easy" : sug.difficulty === "medium" ? "→ Medium" : "★ Hard"}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7 - ACTIONS */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col gap-4 mt-8 pt-4 border-t border-[rgba(184,212,168,0.4)]"
      >
        <button
          onClick={() => router.push("/story")}
          className="w-full py-4 rounded-2xl font-semibold text-white shadow-lg relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4A7C2F 0%, #F4A832 100%)",
            boxShadow: "0 6px 20px rgba(74,124,47,0.3)",
          }}
        >
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="w-full h-full"
          >
            ✨ Start My Story
          </motion.div>
        </button>

        <div className="text-center text-[12px] font-medium" style={{ color: "#6B8F5E" }}>
          Add this to your carbon story →
        </div>

        <button
          onClick={onReset}
          className="w-full py-3.5 rounded-2xl font-medium"
          style={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(184,212,168,0.6)",
            color: "#4A7C2F"
          }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            🔍 Analyze Another Receipt
          </motion.div>
        </button>
      </motion.div>

    </div>
  );
}
