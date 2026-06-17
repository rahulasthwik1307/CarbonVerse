"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";

const WorldScene = ({ 
  skyQuality, treeDensity, birdCount, trafficLevel, size 
}: { 
  skyQuality: number, treeDensity: number, birdCount: number, trafficLevel: number, size: "small" | "medium" 
}) => {
  const width = size === "small" ? 280 : 320;
  const height = size === "small" ? 180 : 200;

  // SCENARIO MAPPING
  let skyColor1 = "";
  let skyColor2 = "";
  let sunColor = "";
  let sunR = 14;
  let sunOpacity = 1;
  let showSmogLayer = false;

  if (skyQuality > 75) {
    // Thriving
    skyColor1 = "#87CEEB";
    skyColor2 = "#B8E0F7";
    sunColor = "#FFD700";
    sunR = 18;
  } else if (skyQuality > 50) {
    // Stable
    skyColor1 = "#B8D4C8";
    skyColor2 = "#D4E8C2";
    sunColor = "#FFC840";
    sunR = 14;
  } else if (skyQuality > 25) {
    // Under Pressure
    skyColor1 = "#D4B896";
    skyColor2 = "#E8C878";
    sunColor = "#FFB347";
    sunR = 12;
    showSmogLayer = true;
  } else {
    // Under Stress
    skyColor1 = "#C87850";
    skyColor2 = "#D4845A";
    sunColor = "#FF6B35";
    sunR = 10;
    sunOpacity = 0.5;
    showSmogLayer = true;
  }

  const numTrees = Math.max(0, Math.floor(treeDensity / 15));
  const numBirds = birdCount > 40 ? Math.floor(birdCount / 20) : 0;

  const smogOpacity = skyQuality <= 25 ? 0.6 : 0.3;
  const smogColor = "rgba(180, 120, 60, 1)";

  return (
    <motion.div 
      style={{ width, height, position: "relative", borderRadius: 16, overflow: "hidden", background: skyColor1 }}
      animate={{ background: skyColor1 }}
      transition={{ duration: 0.8 }}
    >
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`skyGrad-${size}-${skyQuality}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyColor1} style={{ transition: "stop-color 0.8s" }} />
            <stop offset="100%" stopColor={skyColor2} style={{ transition: "stop-color 0.8s" }} />
          </linearGradient>
        </defs>
        
        {/* Sky Background */}
        <motion.rect 
          width={width} height={height} 
          fill={`url(#skyGrad-${size}-${skyQuality})`} 
          initial={false}
          animate={{ fill: `url(#skyGrad-${size}-${skyQuality})` }}
          transition={{ duration: 0.8 }}
        />

        {/* Sun */}
        <motion.circle 
          cx={width * 0.2} cy={height * 0.3} 
          initial={false}
          animate={{ r: sunR, fill: sunColor, opacity: sunOpacity }}
          transition={{ duration: 0.8 }}
        />

        {/* Smog Layer */}
        {showSmogLayer && (
          <motion.rect
            x={0} y={0} width={width} height={height * 0.5}
            fill={smogColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: smogOpacity }}
            transition={{ duration: 0.8 }}
            style={{ filter: "blur(8px)" }}
          />
        )}

        {/* Animated Birds */}
        {Array.from({ length: numBirds }).map((_, i) => (
          <g key={`bird-${i}`} transform={`translate(${width * 0.3 + i * 30}, ${height * 0.2 + (i % 2) * 10}) scale(0.6)`}>
            <animateTransform attributeName="transform" type="translate" values="0 0; 15 0; 0 0" dur={`${4 + i}s`} repeatCount="indefinite" additive="sum"/>
            <path d="M 0 5 Q 5 0 10 5 Q 15 0 20 5 Q 15 8 10 3 Q 5 8 0 5 Z" fill="#4A5568" />
          </g>
        ))}

        {/* Hills (Fixed Green) */}
        <path d={`M 0 ${height * 0.55} Q ${width * 0.2} ${height * 0.4} ${width * 0.5} ${height * 0.55} T ${width} ${height * 0.55} L ${width} ${height} L 0 ${height} Z`} fill="#A3D977" />
        <path d={`M 0 ${height * 0.65} Q ${width * 0.3} ${height * 0.45} ${width} ${height * 0.65} L ${width} ${height} L 0 ${height} Z`} fill="#82C059" />
        <path d={`M 0 ${height * 0.75} Q ${width * 0.4} ${height * 0.6} ${width} ${height * 0.8} L ${width} ${height} L 0 ${height} Z`} fill="#6AAB45" />

        {/* Trees */}
        {Array.from({ length: 7 }).map((_, i) => {
          const isAlive = i < numTrees;
          const isStressed = skyQuality < 50 && isAlive;
          const treeColor = isStressed ? "#786542" : "#4A7C2F";
          const treeColor2 = isStressed ? "#604E30" : "#3D6626";
          const tx = (width * 0.1) + (i * (width * 0.8 / 7));
          const ty = height * 0.75 + (i % 2 === 0 ? -10 : 5);
          const treeScale = isAlive ? (isStressed ? 0.8 : 1.2) : 0.6; // Stumps are small

          return (
            <motion.g 
              key={`tree-${i}`} 
              initial={false}
              animate={{ x: tx, y: ty, scale: treeScale }}
              transition={{ duration: 0.6 }}
            >
              <rect x="-2" y="0" width="4" height={15} fill="#5D4037" />
              {isAlive && (
                <>
                  <path d="M -10 5 L 0 -15 L 10 5 Z" fill={treeColor} style={{ transition: "fill 0.8s" }} />
                  <path d="M -12 15 L 0 -5 L 12 15 Z" fill={treeColor2} style={{ transition: "fill 0.8s" }} />
                  {skyQuality > 75 && (
                    <>
                      <circle cx="-6" cy="14" r="1.5" fill="#FFB6C1" />
                      <circle cx="8" cy="12" r="1.5" fill="#FFD700" />
                    </>
                  )}
                </>
              )}
            </motion.g>
          );
        })}

        {/* Road */}
        <path d={`M 0 ${height * 0.9} L ${width} ${height * 0.9}`} stroke="#4A5568" strokeWidth="20" />
        <path d={`M 0 ${height * 0.9} L ${width} ${height * 0.9}`} stroke="#CBD5E0" strokeWidth="2" strokeDasharray="10 10" />

        {/* Traffic & Smog Particles */}
        {Array.from({ length: trafficLevel > 0 ? Math.max(1, Math.floor(trafficLevel / 10)) : 0 }).map((_, i) => {
          const isHeavy = trafficLevel > 60;
          const isModerate = trafficLevel > 30 && trafficLevel <= 60;
          const vehColor = isHeavy ? "#D44040" : isModerate ? "#FF8C00" : "#00CED1";
          const vehRadius = isHeavy ? 5 : isModerate ? 4 : 3;
          const vx = (width * 0.1) + (i * (width * 0.8 / Math.max(1, Math.floor(trafficLevel / 10))));
          const vy = height * 0.9 + (i % 2 === 0 ? -4 : 4);

          return (
            <g key={`veh-${i}`}>
              <motion.circle 
                cx={vx} cy={vy} 
                initial={false}
                animate={{ r: vehRadius, fill: vehColor }}
                transition={{ duration: 0.8 }}
              />
              {isHeavy && (
                <circle cx={vx - 4} cy={vy - 8} r="3" fill="#333" opacity="0.4">
                  <animate attributeName="cy" values={`${vy - 8}; ${vy - 20}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4; 0" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

      </svg>
    </motion.div>
  );
};

export default function FutureSimulator() {
  const router = useRouter();
  const { profile, worldState, decisions, totalCarbonDelta, resetSession } = useSessionStore();
  const [narrative, setNarrative] = useState("");
  const [typedIntro, setTypedIntro] = useState("");
  const [showSecondary, setShowSecondary] = useState(false);
  
  const introText = "Here's what your choices created...";
  
  // Hardcoded highly-contrast greener world
  const greenerWorld = {
    skyQuality: Math.min(100, 90),
    treeDensity: Math.min(100, 95),
    birdCount: Math.min(100, 90),
    trafficLevel: Math.max(0, 5),
    greenCoverage: Math.min(100, 95),
  };

  // Find biggest impact decisions
  const sortedByCarbon = [...decisions].sort((a,b) => b.carbonDelta - a.carbonDelta);
  const highestImpact = sortedByCarbon.find(d => d.carbonDelta > 0) || sortedByCarbon[0];
  
  const sortedByEco = [...decisions].sort((a,b) => a.carbonDelta - b.carbonDelta);
  const lowestImpact = sortedByEco[0];

  const greenerCarbonDelta = totalCarbonDelta - (decisions.filter(d=>d.impactType!=="eco").length * 10);
  const carbonSaved = Math.max(1, totalCarbonDelta - greenerCarbonDelta);

  // Left panel styling
  let leftBorder = "2px solid rgba(76,175,80,0.4)";
  let leftBg = "rgba(240,250,240,0.7)";
  let leftHeaderColor = "#2D5016";
  let leftWarning = false;

  if (worldState.skyQuality < 50) {
    leftBorder = "2px solid rgba(255,107,107,0.4)";
    leftBg = "rgba(255,240,240,0.7)";
    leftHeaderColor = "#A0401A";
    leftWarning = true;
  } else if (worldState.skyQuality <= 75) {
    leftBorder = "2px solid rgba(244,168,50,0.4)";
    leftBg = "rgba(255,248,230,0.7)";
    leftHeaderColor = "#8B6914";
  }

  // Emotional outcome data
  let outcomeText = "";
  let outcomeBg = "";
  let outcomeEmoji = "";

  if (totalCarbonDelta < -20) {
    outcomeText = "🌟 Exceptional! Your choices helped the planet breathe easier today.";
    outcomeBg = "linear-gradient(135deg, rgba(74, 124, 47, 0.2) 0%, rgba(168, 216, 120, 0.3) 100%)";
    outcomeEmoji = "🌟";
  } else if (totalCarbonDelta <= -5) {
    outcomeText = "✨ Good progress! Small changes, big impact over time.";
    outcomeBg = "rgba(168, 216, 120, 0.2)";
    outcomeEmoji = "✨";
  } else if (totalCarbonDelta <= 10) {
    outcomeText = "🌿 A balanced day. Every eco choice counts.";
    outcomeBg = "rgba(184, 212, 168, 0.2)";
    outcomeEmoji = "🌿";
  } else {
    outcomeText = "⚠️ High impact day. But knowing is growing.";
    outcomeBg = "rgba(244, 168, 50, 0.15)";
    outcomeEmoji = "⚠️";
  }

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedIntro(introText.substring(0, i + 1));
      i++;
      if (i >= introText.length) {
        clearInterval(interval);
        setTimeout(() => setShowSecondary(true), 600);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNarrative = async () => {
      try {
        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "summary",
            impactType: totalCarbonDelta < 0 ? "eco" : "high",
            worldState,
            city: profile.city || "your city",
            chapter: "future simulator summary",
            aqi: 75
          })
        });
        const data = await res.json();
        setNarrative(data.narrative);
      } catch (e) {
        setNarrative("Every action shapes tomorrow. What will you do next? 🌱");
      }
    };
    fetchNarrative();
  }, [totalCarbonDelta, worldState, profile.city]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", paddingBottom: 64, display: "flex", flexDirection: "column", gap: 32 }}>
      
      {/* TOP SECTION: Verd Intro */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginTop: 24 }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <VerdOrb size={52} mood={totalCarbonDelta < 0 ? "eco" : "high"} />
        </motion.div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: 48 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2D5016", textAlign: "center" }}>
            {typedIntro}
          </div>
          <AnimatePresence>
            {showSecondary && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 16, color: "#4A7C2F", fontStyle: "italic", marginTop: 4, textAlign: "center" }}
              >
                And here's what could have been...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* MIDDLE SECTION: Split comparison */}
      <AnimatePresence>
        {showSecondary && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ display: "flex", flexWrap: "wrap", gap: 16, width: "100%", justifyContent: "center" }}
          >
            
            {/* LEFT PANEL */}
            <div style={{ flex: "1 1 300px", background: leftBg, borderRadius: 24, padding: 20, border: leftBorder, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <h3 style={{ color: leftHeaderColor, fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 16 }}>
                🌍 Your Story {leftWarning && "⚠️"}
              </h3>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <WorldScene {...worldState} size="small" />
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: leftHeaderColor }}>
                  <span>Carbon Delta:</span>
                  <span>
                    {totalCarbonDelta <= 0 
                      ? `Saved ${Math.abs(totalCarbonDelta)} kg CO₂` 
                      : `+${totalCarbonDelta} kg CO₂`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: leftHeaderColor }}>
                  <span>Sky Quality:</span>
                  <span>{worldState.skyQuality}/100</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: leftHeaderColor }}>
                  <span>Trees:</span>
                  <span>{worldState.treeDensity}/100</span>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ flex: "1 1 300px", background: "rgba(240,255,240,0.85)", borderRadius: 24, padding: 20, border: "2px solid #4CAF50", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", position: "relative", overflow: "hidden" }}>
              <h3 style={{ color: "#2D7A1F", fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 4 }}>🌱 Greener Story</h3>
              <p style={{ color: "#6B8F5E", fontSize: 13, fontStyle: "italic", textAlign: "center", marginBottom: 16 }}>What could have been...</p>
              
              {/* Green Sparkles */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 4 }}
              >
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4CAF50" }} />
                <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#8BC34A", marginTop: 4 }} />
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4CAF50" }} />
              </motion.div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <WorldScene {...greenerWorld} size="small" />
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, color: "#2D7A1F" }}>
                  <span>Carbon Delta:</span>
                  <span>{carbonSaved} kg CO₂ less!</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#4CAF50" }}>
                  <span>Sky Quality:</span>
                  <span>{greenerWorld.skyQuality}/100</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#4CAF50" }}>
                  <span>Trees:</span>
                  <span>{greenerWorld.treeDensity}/100</span>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* EMOTIONAL OUTCOME */}
      <AnimatePresence>
        {showSecondary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            style={{
              background: outcomeBg,
              backdropFilter: "blur(12px)",
              padding: "24px",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              gap: 16,
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 8px 32px rgba(45,80,22,0.1)"
            }}
          >
            <div style={{ fontSize: 64 }}>{outcomeEmoji}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#2D5016", lineHeight: 1.4 }}>
              {outcomeText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM SECTION: Insights */}
      <AnimatePresence>
        {showSecondary && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <motion.h3 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              style={{ color: "#2D5016", fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 8 }}
            >
              Key Insights
            </motion.h3>
            
            {highestImpact && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", padding: 16, borderRadius: 16, borderLeft: "4px solid #A0401A" }}>
                <div style={{ fontSize: 13, color: "#6B8F5E", marginBottom: 4 }}>Your biggest impact:</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#A0401A" }}>
                  {highestImpact.choice} ({highestImpact.carbonDelta <= 0 ? `Saved ${Math.abs(highestImpact.carbonDelta)} kg CO₂` : `+${highestImpact.carbonDelta} kg CO₂`})
                </div>
              </motion.div>
            )}

            {lowestImpact && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", padding: 16, borderRadius: 16, borderLeft: "4px solid #4CAF50" }}>
                <div style={{ fontSize: 13, color: "#6B8F5E", marginBottom: 4 }}>Your best choice:</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#2D7A1F" }}>
                  {lowestImpact.choice} ({lowestImpact.carbonDelta <= 0 ? `Saved ${Math.abs(lowestImpact.carbonDelta)} kg CO₂` : `+${lowestImpact.carbonDelta} kg CO₂`})
                </div>
              </motion.div>
            )}

            {highestImpact && highestImpact.impactType !== "eco" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }}
                style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", padding: 16, borderRadius: 16, borderLeft: "4px solid #F4A832" }}>
                <div style={{ fontSize: 13, color: "#6B8F5E", marginBottom: 4 }}>Did you know?</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#8B6914" }}>
                  If you had chosen eco for {highestImpact.choice}, you'd save ~{highestImpact.carbonDelta + 5} kg CO₂!
                </div>
              </motion.div>
            )}

            {/* Verd's final message */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
              style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "center", background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", padding: 20, borderRadius: 20, border: "1px solid #B8D4A8" }}>
              <VerdOrb size={48} mood={totalCarbonDelta < 0 ? "eco" : "moderate"} />
              <div style={{ flex: 1, fontSize: 15, color: "#2D5016", fontStyle: "italic", fontWeight: 500 }}>
                {narrative || "Reflecting on your journey..."}
              </div>
            </motion.div>

            {/* Bottom Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
              style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
              
              <div style={{ color: "#6B8F5E", fontStyle: "italic", fontSize: 14, marginBottom: 4 }}>
                Your garden awaits, {profile.city || "your city"}!
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/story/garden")}
                style={{ 
                  padding: "18px", 
                  background: "linear-gradient(135deg, #4A7C2F 0%, #F4A832 100%)", 
                  color: "white", 
                  borderRadius: 16, 
                  fontWeight: 700, 
                  fontSize: 18, 
                  border: "none", 
                  cursor: "pointer", 
                  boxShadow: "0 6px 20px rgba(74,124,47,0.3)",
                  width: "100%",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
                  }}
                />
                <span style={{ position: "relative", zIndex: 1 }}>🌱 Plant My Garden →</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { resetSession(); router.push("/story/chapter"); }}
                style={{ 
                  padding: "14px", 
                  background: "rgba(255,255,255,0.5)", 
                  backdropFilter: "blur(8px)",
                  color: "#2D5016", 
                  borderRadius: 14, 
                  fontWeight: 600, 
                  fontSize: 14, 
                  border: "1px solid #B8D4A8", 
                  cursor: "pointer",
                  width: "100%"
                }}
              >
                ↺ Try Different Choices
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
