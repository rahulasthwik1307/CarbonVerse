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

  // Styling logic for Left Panel (Current Rate)
  let currentBg = "rgba(76,175,80,0.08)";
  let currentBorder = "2px solid rgba(76,175,80,0.08)";
  let currentColor = "#2D7A1F";

  if (yearlyTonnes > 2) {
    currentBg = "rgba(255,107,107,0.08)";
    currentBorder = "2px solid rgba(255,107,107,0.08)";
    currentColor = "#A0401A";
  } else if (yearlyTonnes > 0) {
    currentBg = "rgba(255,200,50,0.08)";
    currentBorder = "2px solid rgba(255,200,50,0.08)";
    currentColor = "#8B6914";
  }

  // Progress meter (vs India average 1.9)
  const indiaAvg = 1.9;
  const maxScale = 5.0; // max value for the bar
  const userPosPct = Math.min(100, Math.max(0, (yearlyTonnes / maxScale) * 100));
  const avgPosPct = (indiaAvg / maxScale) * 100;
  const isBelowAvg = yearlyTonnes < indiaAvg;

  // Verd's Message
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
      maxWidth: 680,
      width: "100%",
      margin: "0 auto",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: 24,
      padding: 28,
      border: "1px solid rgba(184,212,168,0.5)",
      boxShadow: "0 8px 32px rgba(45,80,22,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2D5016", margin: "0 0 4px 0" }}>
          🌍 Your Earth in 1 Year
        </h2>
        <p style={{ fontSize: 13, color: "#6B8F5E", margin: 0 }}>
          If you repeat today&apos;s habits every day...
        </p>
      </div>

      {/* Two Scenarios */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
      }}>
        {/* LEFT: Current Rate */}
        <div style={{
          background: currentBg,
          border: currentBorder,
          borderRadius: 16,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#2D5016" }}>📊 Your Story</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: currentColor }}>
            {yearlyTonnes.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 600 }}>tonnes CO₂/year</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#2D5016" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🚗</span> Like driving {carKm.toLocaleString()} km
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🌳</span> Needs {treesNeeded} trees to absorb
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🏠</span> Powers a home for {homeDays} days
            </div>
          </div>
        </div>

        {/* RIGHT: Greener Path */}
        <div style={{
          background: "rgba(76,175,80,0.1)",
          border: "2px solid rgba(76,175,80,0.4)",
          borderRadius: 16,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#2D5016" }}>🌱 Greener Story</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#2D7A1F" }}>
            {yearlyGreenTonnes.toFixed(1)} <span style={{ fontSize: 14, fontWeight: 600 }}>tonnes CO₂/year</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#2D5016" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🚗</span> Like driving {greenCarKm.toLocaleString()} km
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🌳</span> Needs {greenTreesNeeded} trees to absorb
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🏠</span> Powers a home for {greenHomeDays} days
            </div>
          </div>
          
          {savedTonnes > 0 && (
            <div style={{
              background: "#4CAF50",
              color: "white",
              borderRadius: 12,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 700,
              textAlign: "center",
              marginTop: 4,
            }}>
              You&apos;d save {savedTonnes.toFixed(1)} tonnes CO₂!
            </div>
          )}
        </div>
      </div>

      {/* Progress Meter */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 13, color: "#2D5016", fontWeight: 600, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span>Your Habits vs Average</span>
        </div>
        <div style={{ position: "relative", width: "100%", height: 12, background: "rgba(184,212,168,0.3)", borderRadius: 6 }}>
          {/* India Avg Marker */}
          <div style={{
            position: "absolute",
            left: `${avgPosPct}%`,
            top: -4,
            bottom: -4,
            width: 2,
            background: "#6B8F5E",
            zIndex: 1,
          }}>
            <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "#6B8F5E", whiteSpace: "nowrap" }}>
              India avg
            </div>
          </div>
          
          {/* User Marker */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${userPosPct}%` }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            style={{
              position: "absolute",
              top: -6,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: isBelowAvg ? "#4CAF50" : "#F4A832",
              border: "3px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          />
        </div>
      </div>

      {/* Verd's Message */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: "rgba(255,255,255,0.7)",
        borderRadius: 16,
        padding: "16px 20px",
        border: "1px solid rgba(184,212,168,0.3)",
      }}>
        <VerdOrb size={36} mood={yearlyTonnes < 0 ? "eco" : yearlyTonnes > 2 ? "high" : "moderate"} />
        <div style={{ fontSize: 13, color: "#2D5016", fontWeight: 500, lineHeight: 1.4, flex: 1 }}>
          {verdMessage}
        </div>
      </div>

      {/* Bottom Note */}
      <div style={{ fontSize: 10, color: "#A8BEA9", fontStyle: "italic", textAlign: "center" }}>
        *Estimates based on average Indian lifestyle data. Actual emissions vary by location and habits.
      </div>
    </div>
  );
}
