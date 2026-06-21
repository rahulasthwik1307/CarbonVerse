"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DetectiveResult } from "@/types/carbon";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";

interface DetectiveResultsProps {
  result: DetectiveResult;
  onReset: () => void;
}

const TYPE_BADGES = {
  food: { icon: "🍽️", label: "Food Receipt", color: "#4A7C2F" },
  fuel: { icon: "⛽", label: "Fuel Receipt", color: "#E8A020" },
  electricity: { icon: "⚡", label: "Electricity Bill", color: "#F4A832" },
  transport: { icon: "🚗", label: "Transport Receipt", color: "#4A9B8E" },
  shopping: { icon: "🛍️", label: "Shopping Receipt", color: "#9C6B98" },
  grocery: { icon: "🛒", label: "Grocery Receipt", color: "#7BC67E" },
  utility: { icon: "🚰", label: "Utility Bill", color: "#4A7C2F" },
  other: { icon: "🧾", label: "Receipt", color: "#6B8F5E" },
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

const getBadgeNameForMission = (missionTitle: string) => {
  const title = missionTitle.toLowerCase();
  if (title.includes("breakfast") || title.includes("food") || title.includes("plate") || title.includes("ingredients")) {
    return "Green Plate Explorer";
  }
  if (title.includes("commute") || title.includes("transport") || title.includes("champion")) {
    return "Metro Master";
  }
  if (title.includes("local") || title.includes("shop") || title.includes("buyer")) {
    return "Garden Guardian";
  }
  if (title.includes("receipt") || title.includes("detective")) {
    return "Carbon Detective";
  }
  return "Eco Pioneer";
};

const getContributorEmoji = (receiptType: string) => {
  switch (receiptType) {
    case "food": return "🍛";
    case "fuel": return "⛽";
    case "electricity": return "⚡";
    case "transport": return "🚗";
    case "shopping": return "🛍️";
    case "grocery": return "🛒";
    case "utility": return "🚰";
    default: return "📦";
  }
};

export default function DetectiveResults({ result, onReset }: DetectiveResultsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"findings" | "impact" | "actions">("findings");
  const [showAllItems, setShowAllItems] = useState(false);

  const typeBadge = TYPE_BADGES[result.receiptType] || TYPE_BADGES.unknown;
  const impactColor = IMPACT_COLORS[result.impactLevel] || IMPACT_COLORS.moderate;
  const impactFill = IMPACT_FILLS[result.impactLevel] || "45%";

  const { activeMissions, acceptDetectiveMission } = useSessionStore();
  
  const hasMission = !!result.suggestedMission;
  const isMissionActive = hasMission && activeMissions.some(m => m.id === result.suggestedMission!.id);
  
  const [missionState, setMissionState] = useState<"available" | "accepted">(
    isMissionActive ? "accepted" : "available"
  );

  const handleAcceptMission = () => {
    if (result.suggestedMission) {
      acceptDetectiveMission(result.suggestedMission);
      setMissionState("accepted");
    }
  };

  // Findings computation
  const sortedItems = [...(result.items || [])].sort((a, b) => b.estimatedCO2 - a.estimatedCO2);
  const topItems = sortedItems.slice(0, 3);
  const remainingItems = sortedItems.slice(3);
  const biggestContributor = sortedItems[0] || null;

  return (
    <div className="w-full flex flex-col">
      {/* Sticky Summary Strip */}
      <div className="w-full pb-3 mb-4 border-b border-[rgba(184,212,168,0.35)] flex flex-wrap items-center justify-between gap-2 text-[12px] md:text-[13px] font-bold">
        {/* Receipt Type */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 border border-[rgba(184,212,168,0.25)]" style={{ color: "#2D5016" }}>
          <span>{typeBadge.icon}</span>
          <span>{typeBadge.label}</span>
        </div>
        
        {/* Total CO2 */}
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/40 border border-[rgba(184,212,168,0.25)]" style={{ color: impactColor }}>
          <span>{result.totalCO2} kg CO₂</span>
        </div>

        {/* Impact Level */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border" 
          style={{ 
            borderColor: `${impactColor}25`, 
            background: `${impactColor}08`,
            color: impactColor 
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: impactColor }} />
          <span className="capitalize">{result.impactLevel.replace("_", " ")} Impact</span>
        </div>

        {/* Mission Status */}
        {hasMission && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all duration-300"
            style={{
              borderColor: missionState === "accepted" ? "rgba(76,175,80,0.3)" : "rgba(244,168,50,0.3)",
              background: missionState === "accepted" ? "rgba(76,175,80,0.08)" : "rgba(244,168,50,0.08)",
              color: missionState === "accepted" ? "#2D7A1F" : "#A06000"
            }}
          >
            {missionState === "accepted" && <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />}
            <span>{missionState === "accepted" ? "🌱 Mission Active" : "🌱 Mission Available"}</span>
          </div>
        )}
      </div>

      {/* Tab Controller */}
      <div className="w-full bg-[rgba(184,212,168,0.12)] p-1 rounded-2xl flex items-center justify-between mb-4 relative border border-[rgba(184,212,168,0.2)]">
        {(["findings", "impact", "actions"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 text-center text-[13px] md:text-[14px] font-bold capitalize duration-200 cursor-pointer relative z-10 rounded-xl transition-transform active:scale-[0.97]"
              style={{
                color: isActive ? "#FFF8E7" : "#4A7C2F"
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl z-[-1]"
                  style={{
                    background: "#2D5016",
                    boxShadow: "0 2px 8px rgba(45,80,22,0.12)"
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="min-h-70 flex flex-col justify-start py-1">
        <AnimatePresence mode="wait">
          {/* FINDINGS TAB */}
          {activeTab === "findings" && (
            <motion.div
              key="findings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-0.5 mb-1">
                {result.merchantName && (
                  <h2 className="text-[20px] font-bold tracking-tight" style={{ color: "#2D5016" }}>
                    {result.merchantName}
                  </h2>
                )}
                <span className="text-[12px] font-medium" style={{ color: "#6B8F5E" }}>
                  Receipt Case Analysis
                </span>
              </div>

              {sortedItems.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {topItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 px-4 rounded-xl relative overflow-hidden bg-white/60 border border-[rgba(184,212,168,0.25)] shadow-sm hover:-translate-y-px transition-all duration-200"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1"
                        style={{
                          background: item.confidence === "high" ? "#4CAF50" : 
                                      item.confidence === "medium" ? "#F4A832" : "#A8BEA9"
                        }}
                      />
                      <div className="flex flex-col pl-1.5">
                        <span className="font-semibold text-[13px] md:text-[14px]" style={{ color: "#2D5016" }}>{item.name}</span>
                        {item.note && <span className="text-[11px] italic" style={{ color: "#6B8F5E" }}>{item.note}</span>}
                      </div>
                      <div className="flex flex-col items-end text-right shrink-0 ml-2">
                        <span className="font-bold text-[13px] md:text-[14px]" style={{ color: impactColor }}>{item.estimatedCO2} kg</span>
                        <span className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mt-1"
                          style={{
                            background: item.confidence === "high" ? "rgba(76,175,80,0.12)" : 
                                       item.confidence === "medium" ? "rgba(244,168,50,0.12)" : "rgba(168,190,169,0.15)",
                            color: item.confidence === "high" ? "#2D7A1F" : 
                                   item.confidence === "medium" ? "#A06000" : "#5A7C5B"
                          }}
                        >
                          {item.confidence}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Expandable items if > 3 */}
                  {remainingItems.length > 0 && (
                    <>
                      <button
                        onClick={() => setShowAllItems(!showAllItems)}
                        className="w-full py-2.5 mt-1 rounded-xl font-bold text-[12px] border border-dashed transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                        style={{
                          borderColor: "rgba(74,124,47,0.3)",
                          color: "#4A7C2F",
                          background: "rgba(255,255,255,0.35)"
                        }}
                      >
                        {showAllItems ? "Collapse Receipt Analysis ⬆️" : `View Full Receipt Analysis (${remainingItems.length} more) ⬇️`}
                      </button>

                      <AnimatePresence>
                        {showAllItems && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-2.5 mt-1"
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            {remainingItems.map((item, idx) => (
                              <div
                                key={idx + 3}
                                className="flex items-center justify-between p-3 px-4 rounded-xl relative overflow-hidden bg-white/60 border border-[rgba(184,212,168,0.25)] shadow-sm"
                              >
                                <div 
                                  className="absolute left-0 top-0 bottom-0 w-1"
                                  style={{
                                    background: item.confidence === "high" ? "#4CAF50" : 
                                                item.confidence === "medium" ? "#F4A832" : "#A8BEA9"
                                  }}
                                />
                                <div className="flex flex-col pl-1.5">
                                  <span className="font-semibold text-[13px] md:text-[14px]" style={{ color: "#2D5016" }}>{item.name}</span>
                                  {item.note && <span className="text-[11px] italic" style={{ color: "#6B8F5E" }}>{item.note}</span>}
                                </div>
                                <div className="flex flex-col items-end text-right shrink-0 ml-2">
                                  <span className="font-bold text-[13px] md:text-[14px]" style={{ color: impactColor }}>{item.estimatedCO2} kg</span>
                                  <span className="text-[8px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mt-1"
                                    style={{
                                      background: item.confidence === "high" ? "rgba(76,175,80,0.12)" : 
                                                 item.confidence === "medium" ? "rgba(244,168,50,0.12)" : "rgba(168,190,169,0.15)",
                                      color: item.confidence === "high" ? "#2D7A1F" : 
                                             item.confidence === "medium" ? "#A06000" : "#5A7C5B"
                                    }}
                                  >
                                    {item.confidence}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-[14px] italic" style={{ color: "#6B8F5E" }}>
                  No items found in this receipt.
                </div>
              )}
            </motion.div>
          )}

          {/* IMPACT TAB */}
          {activeTab === "impact" && (
            <motion.div
              key="impact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col gap-4 text-center"
            >
              {/* Large Carbon Metric */}
              <div className="py-1">
                <div className="text-[48px] md:text-[52px] leading-none font-extrabold tracking-tight" style={{ color: impactColor }}>
                  {result.totalCO2} <span className="text-xl md:text-2xl opacity-75 font-semibold">kg CO₂</span>
                </div>
                <div className="text-[13px] font-bold mt-1 capitalize" style={{ color: impactColor }}>
                  {result.impactLevel.replace("_", " ")} Impact
                </div>
                <div className="text-[12.5px] italic font-semibold mt-1" style={{ color: "#6B8F5E" }}>
                  {result.totalCO2Label}
                </div>
                
                {/* Horizontal Progress Bar */}
                <div className="w-full max-w-xs mx-auto h-2 rounded-full mt-3 relative overflow-hidden bg-black/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: impactFill }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute left-0 top-0 bottom-0 rounded-full"
                    style={{ background: impactColor }}
                  />
                </div>
              </div>

              {/* Cards layout */}
              <div className="flex flex-col gap-2.5 text-left mt-2">
                {/* Biggest Contributor Card */}
                {biggestContributor && (
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-[rgba(184,212,168,0.25)] shadow-sm hover:-translate-y-px transition-all duration-200">
                    <span className="text-[24px] w-10 h-10 rounded-full bg-white border border-[rgba(184,212,168,0.3)] flex items-center justify-center shrink-0">
                      {getContributorEmoji(result.receiptType)}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B8F5E]">Biggest Contributor</span>
                      <span className="font-bold text-[13px] md:text-[14px]" style={{ color: "#2D5016" }}>{biggestContributor.name}</span>
                      <span className="text-[12px] font-bold mt-0.5" style={{ color: impactColor }}>{biggestContributor.estimatedCO2} kg CO₂</span>
                    </div>
                  </div>
                )}

                {/* Did You Know Card */}
                {result.topInsight && (
                  <div className="flex gap-3 p-3.5 rounded-2xl bg-white/70 border border-[rgba(244,168,50,0.25)] shadow-sm">
                    <span className="text-lg pt-0.5">💡</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A06000]">Did You Know?</span>
                      <p className="text-[13px] leading-relaxed font-semibold" style={{ color: "#2D5016" }}>
                        {result.topInsight}
                      </p>
                    </div>
                  </div>
                )}

                {/* Verd Insight Card */}
                {result.verdVerdict && (
                  <div className="flex gap-3 p-3.5 rounded-2xl bg-[rgba(240,250,240,0.4)] border border-[rgba(76,175,80,0.25)] shadow-sm">
                    <div className="shrink-0 pt-0.5">
                      <VerdOrb size={34} mood={result.impactLevel === "high" || result.impactLevel === "very_high" ? "high" : "eco"} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A7C2F]">Verd&apos;s Insight</span>
                      <p className="text-[13px] italic font-semibold leading-relaxed" style={{ color: "#2D5016" }}>
                        &ldquo;{result.verdVerdict}&rdquo;
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ACTIONS TAB */}
          {activeTab === "actions" && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex flex-col gap-4"
            >
              {/* Mission Card */}
              {hasMission && result.suggestedMission && (
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/60 border border-[rgba(123,198,126,0.3)] shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D7A1F]">🌱 Recommended Mission</span>
                    {missionState === "accepted" && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4CAF50]/15 text-[#2D7A1F] border border-[#4CAF50]/30 animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl w-10 h-10 rounded-full bg-white border border-[rgba(184,212,168,0.35)] flex items-center justify-center shrink-0">
                      {result.suggestedMission.emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] md:text-[14px]" style={{ color: "#2D5016" }}>{result.suggestedMission.title}</span>
                      <span className="text-[11.5px] font-semibold leading-normal mt-0.5" style={{ color: "#4A7C2F" }}>
                        {result.suggestedMission.description}
                      </span>
                    </div>
                  </div>
                  
                  {missionState === "available" ? (
                    <button
                      onClick={handleAcceptMission}
                      className="w-full mt-1 py-2 rounded-xl font-bold text-white text-[12px] cursor-pointer transition-transform active:scale-[0.97]"
                      style={{
                        background: "linear-gradient(135deg, #4A7C2F 0%, #7BC67E 100%)",
                        boxShadow: "0 3px 12px rgba(74,124,47,0.18)"
                      }}
                    >
                      Accept Mission
                    </button>
                  ) : (
                    <div className="w-full mt-1 py-2 rounded-xl font-bold text-[#2D7A1F] text-[12px] text-center bg-[#4CAF50]/8 border border-[#4CAF50]/20">
                      ✓ Mission Accepted
                    </div>
                  )}
                </div>
              )}

              {/* Badge Card */}
              {hasMission && result.suggestedMission && (
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/60 border border-[rgba(244,168,50,0.25)] shadow-sm">
                  <span className="text-[24px] w-10 h-10 rounded-full bg-white border border-[rgba(244,168,50,0.25)] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                    {missionState === "available" && <span className="absolute inset-0 rounded-full bg-[#F4A832]/5 animate-ping" />}
                    🏅
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A06000]">Potential Badge</span>
                    <span className="font-bold text-[13px] md:text-[14px]" style={{ color: "#2D5016" }}>
                      {getBadgeNameForMission(result.suggestedMission.title)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#8B6914] mt-0.5">
                      Unlock after completing mission
                    </span>
                  </div>
                </div>
              )}

              {/* Suggested Actions List */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A7C2F] px-1">💡 Suggested Actions</span>
                  <div className="flex flex-col gap-2">
                    {result.suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[rgba(184,212,168,0.25)] shadow-sm"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[13px]" style={{ color: "#2D5016" }}>{sug.action}</span>
                          <span className="text-[11px] font-bold text-[#4CAF50]">Saves {sug.potentialSaving}</span>
                        </div>
                        <span 
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-2"
                          style={{
                            background: sug.difficulty === "easy" ? "rgba(76,175,80,0.12)" : 
                                       sug.difficulty === "medium" ? "rgba(244,168,50,0.12)" : "rgba(244,168,50,0.2)",
                            color: sug.difficulty === "easy" ? "#2D7A1F" : 
                                   sug.difficulty === "medium" ? "#A06000" : "#A0401A"
                          }}
                        >
                          {sug.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Compact Actions */}
      <div className="flex flex-col gap-2.5 mt-5 pt-4 border-t border-[rgba(184,212,168,0.3)]">
        <div className="flex gap-3">
          {/* Start My Story */}
          <button
            onClick={() => router.push("/story")}
            className="flex-1 py-3 rounded-2xl font-bold text-white text-[13px] md:text-[14px] cursor-pointer transition-transform active:scale-[0.97]"
            style={{
              background: "linear-gradient(135deg, #4A7C2F 0%, #F4A832 100%)",
              boxShadow: "0 4px 12px rgba(74,124,47,0.18)"
            }}
          >
            ✨ Start My Story
          </button>

          {/* Memory Book */}
          <button
            onClick={() => router.push("/memory")}
            className="flex-1 py-3 rounded-2xl font-bold text-[13px] md:text-[14px] cursor-pointer border border-[#B8D4A8] transition-transform active:scale-[0.97]"
            style={{
              background: "rgba(240, 250, 240, 0.6)",
              color: "#2D5016",
            }}
          >
            📖 Memory Book
          </button>
        </div>

        {/* Analyze Another */}
        <button
          onClick={onReset}
          className="w-full py-3 rounded-2xl font-bold text-[13px] md:text-[14px] cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.97]"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(184, 212, 168, 0.5)",
            color: "#2D5016",
            boxShadow: "0 4px 12px rgba(45,80,22,0.08)"
          }}
        >
          🔍 Analyze Another Receipt
        </button>
      </div>
    </div>
  );
}
