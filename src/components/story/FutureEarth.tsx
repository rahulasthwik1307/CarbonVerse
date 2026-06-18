"use client";

import { useSessionStore } from "@/lib/session-store";
import { motion } from "framer-motion";
import VerdOrb from "@/components/ui/VerdOrb";

export default function FutureEarth() {
  const { decisions, totalCarbonDelta } = useSessionStore();

  const totalDecisions = decisions.length;
  if (totalDecisions === 0) return null;

  // Average daily carbon based on current story
  const avgDailyCarbon = totalCarbonDelta;
  const yearlyCarbon = avgDailyCarbon * 365; // kg
  const yearlyTonnes = yearlyCarbon / 1000; // tonnes

  // Greener scenario (excluding high impact)
  const avgDailyGreen = decisions
    .filter((d) => d.impactType !== "high")
    .reduce((sum, d) => sum + d.carbonDelta, 0);
  const yearlyGreenCarbon = avgDailyGreen * 365;
  const yearlyGreenTonnes = yearlyGreenCarbon / 1000;

  // Difference
  const savedTonnes = yearlyTonnes - yearlyGreenTonnes;

  // Real-world equivalents (per tonne CO2)
  const carKm = Math.round(Math.abs(yearlyTonnes) * 4400);
  const treesNeeded = Math.round(Math.abs(yearlyTonnes) * 50);
  const homeDays = Math.round(Math.abs(yearlyTonnes) * 30);
  
  const greenCarKm = Math.round(Math.abs(yearlyGreenTonnes) * 4400);
  const greenTreesNeeded = Math.round(Math.abs(yearlyGreenTonnes) * 50);
  const greenHomeDays = Math.round(Math.abs(yearlyGreenTonnes) * 30);

  // Styling logic for Left Column (Current Rate)
  let currentColor = "#2D7A1F";
  if (yearlyTonnes > 2) {
    currentColor = "#A0401A";
  } else if (yearlyTonnes > 0) {
    currentColor = "#8B6914";
  }

  // Progress meter (vs India average 1.9)
  const indiaAvg = 1.9;
  const maxScale = 5.0; // max value for the bar
  const userPosPct = Math.min(100, Math.max(0, (yearlyTonnes / maxScale) * 100));
  const avgPosPct = (indiaAvg / maxScale) * 100;
  const isBelowAvg = yearlyTonnes < indiaAvg;

  // Verd's Message Wording
  let verdMessage = "";
  if (yearlyTonnes < 0) {
    verdMessage = "Amazing! Your lifestyle would actually help the planet! You're a true eco hero! 🌟";
  } else if (yearlyTonnes <= 1) {
    verdMessage = "You're close to carbon neutral! A few more eco swaps would make a huge difference! 🌿";
  } else if (yearlyTonnes <= 3) {
    verdMessage = "Room to grow! Try swapping your top carbon activities for eco alternatives. 🌱";
  } else {
    verdMessage = "Big impact, but big opportunity too! Small daily changes add up to tonnes saved. ☀️";
  }

  return (
    <div style={{
      background: "rgba(45,80,22,0.02)",
      padding: "8px",
      borderRadius: 28,
      border: "1px solid rgba(184,212,168,0.35)",
      width: "100%"
    }}>
      <div style={{
        background: "#FCFCF7", // Warm parchment paper
        border: "1px solid #B8D4A8",
        borderRadius: 24,
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#2D5016", margin: "0 0 4px 0", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
            📖 Indian Lifestyle Projection
          </h2>
          <p style={{ fontSize: 13, color: "#6B8F5E", fontStyle: "italic", margin: 0 }}>
            If you repeated these daily choices for a year...
          </p>
        </div>

        {/* Two Scenarios (Double Column / Diary open-book layout) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 28,
          position: "relative"
        }}>
          {/* Vertical dashed divider for book page look */}
          <div style={{
            position: "absolute",
            top: 8,
            bottom: 8,
            left: "50%",
            width: 1,
            borderLeft: "1px dashed rgba(184,212,168,0.6)",
            transform: "translateX(-50%)",
            pointerEvents: "none"
          }} />

          {/* LEFT: Current Rate Column */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingRight: 10
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🌍 Today's Choice Path
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: currentColor, lineHeight: 1.1 }}>
              {yearlyTonnes.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 600, color: "#6B8F5E" }}>tonnes CO₂</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#2D5016", marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🚗</span> Like driving {carKm.toLocaleString()} km
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🌳</span> Needs {treesNeeded} trees to absorb
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏠</span> Powers a home for {homeDays} days
              </div>
            </div>
          </div>

          {/* RIGHT: Greener Path Column */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            paddingLeft: 10
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2D7A1F", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🌱 Greener Swapped Path
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#2D7A1F", lineHeight: 1.1 }}>
              {yearlyGreenTonnes.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 600, color: "#6B8F5E" }}>tonnes CO₂</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#2D5016", marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🚗</span> Like driving {greenCarKm.toLocaleString()} km
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🌳</span> Needs {greenTreesNeeded} trees to absorb
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏠</span> Powers a home for {greenHomeDays} days
              </div>
            </div>
            
            {savedTonnes > 0 && (
              <div style={{
                background: "rgba(76,175,80,0.12)",
                color: "#2D7A1F",
                border: "1px solid rgba(76,175,80,0.25)",
                borderRadius: 12,
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 700,
                textAlign: "center",
                marginTop: 6,
              }}>
                ✦ Savings of {savedTonnes.toFixed(1)} tonnes CO₂!
              </div>
            )}
          </div>
        </div>

        {/* Progress Meter */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13, color: "#2D5016", fontWeight: 600, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Yearly Footprint Comparison</span>
          </div>
          <div style={{ position: "relative", width: "100%", height: 8, background: "rgba(184,212,168,0.2)", borderRadius: 4 }}>
            {/* India Avg Marker line */}
            <div style={{
              position: "absolute",
              left: `${avgPosPct}%`,
              top: -6,
              bottom: -6,
              width: 2,
              background: "#6B8F5E",
              zIndex: 1,
            }}>
              <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#6B8F5E", fontWeight: 700, whiteSpace: "nowrap" }}>
                India Avg
              </div>
            </div>
            
            {/* User Marker Dot */}
            <motion.div
              initial={{ left: 0 }}
              animate={{ left: `${userPosPct}%` }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.2 }}
              style={{
                position: "absolute",
                top: -5,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: isBelowAvg ? "#4CAF50" : "#F4A832",
                border: "3px solid #FCFCF7",
                boxShadow: "0 2px 6px rgba(45,80,22,0.15)",
                transform: "translateX(-50%)",
                zIndex: 2,
              }}
            />
          </div>
        </div>

        {/* Verd's Message Quote */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(255,255,255,0.4)",
          borderRadius: 16,
          padding: "12px 18px",
          borderLeft: `3px solid ${yearlyTonnes > 2 ? "#A0401A" : "#F4A832"}`,
        }}>
          <VerdOrb size={32} mood={yearlyTonnes < 0 ? "eco" : yearlyTonnes > 2 ? "high" : "moderate"} />
          <div style={{ fontSize: 13, color: "#2D5016", fontWeight: 500, fontStyle: "italic", lineHeight: 1.4, flex: 1 }}>
            "{verdMessage}"
          </div>
        </div>
      </div>
    </div>
  );
}
