"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import FutureEarth from "./FutureEarth";

export default function FutureSimulator() {
  const router = useRouter();
  const { decisions, totalCarbonDelta, resetSession } = useSessionStore();
  
  // Video loading and synchronization states
  const [userVideoReady, setUserVideoReady] = useState(false);
  const [greenerVideoReady, setGreenerVideoReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videosActive, setVideosActive] = useState(false);

  // Drag slider refs and state
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const handleLineRef = useRef<HTMLDivElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);

  // Video refs
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const greenerVideoRef = useRef<HTMLVideoElement>(null);

  // 1. Video Sourcing Logic based on totalCarbonDelta
  const greenerVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781851014/Greener_Story_hrakq8.mp4";
  let userVideoUrl = "";
  if (totalCarbonDelta > 35) {
    userVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781850923/Carbon_Heavy_yihssc.mp4";
  } else if (totalCarbonDelta > 15) {
    userVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781850863/Under_Stress_wf2cog.mp4";
  } else {
    userVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781850732/Stable_Future_qu6yw3.mp4";
  }

  // Determine user's footprint state (for outcome text below)
  let storyState = "stable";
  if (totalCarbonDelta < 0) {
    storyState = "thriving";
  } else if (totalCarbonDelta <= 15) {
    storyState = "stable";
  } else if (totalCarbonDelta <= 35) {
    storyState = "stressed";
  } else {
    storyState = "damaged";
  }

  const bothVideosReady = userVideoReady && greenerVideoReady;

  // 2. Progressive Loading & Illusion Curve Effect
  useEffect(() => {
    if (videosActive) return;

    let startTimestamp = Date.now();
    let intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      
      if (bothVideosReady) {
        // Accelerate to 100% quickly when ready
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalId);
            setTimeout(() => {
              setVideosActive(true);
            }, 300);
            return 100;
          }
          return Math.min(100, prev + 4);
        });
      } else {
        // Not ready, follow the illusion curve:
        // 0-60% in 600ms (fast)
        // 60-85% in 800ms (medium)
        // 85-95% in 1200ms (slow)
        // Hold at 95% until loaded
        let targetProgress = 0;
        if (elapsed <= 600) {
          targetProgress = (elapsed / 600) * 60;
        } else if (elapsed <= 1400) {
          const t = (elapsed - 600) / 800;
          targetProgress = 60 + t * 25;
        } else if (elapsed <= 2600) {
          const t = (elapsed - 1400) / 1200;
          targetProgress = 85 + t * 10;
        } else {
          targetProgress = 95;
        }
        setLoadingProgress(targetProgress);
      }
    }, 16);

    return () => clearInterval(intervalId);
  }, [bothVideosReady, videosActive]);

  // Safety loading bypass (defensive engineering)
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setUserVideoReady(true);
      setGreenerVideoReady(true);
    }, 6000);
    return () => clearTimeout(safetyTimeout);
  }, []);

  // 3. Video Synchronization Logic
  useEffect(() => {
    const userVid = userVideoRef.current;
    const greenVid = greenerVideoRef.current;
    if (!userVid || !greenVid) return;

    // Direct synchronization on video timeupdate
    const handleTimeUpdate = () => {
      const diff = Math.abs(userVid.currentTime - greenVid.currentTime);
      if (diff > 0.15) {
        greenVid.currentTime = userVid.currentTime;
      }
    };

    const handlePlay = () => {
      if (greenVid.paused) {
        greenVid.play().catch(() => {});
      }
    };

    const handlePause = () => {
      if (!greenVid.paused) {
        greenVid.pause();
      }
    };

    userVid.addEventListener("timeupdate", handleTimeUpdate);
    userVid.addEventListener("play", handlePlay);
    userVid.addEventListener("pause", handlePause);

    // Periodic synchronization check just in case
    const interval = setInterval(() => {
      if (userVid.paused) return;
      const diff = Math.abs(userVid.currentTime - greenVid.currentTime);
      if (diff > 0.15) {
        greenVid.currentTime = userVid.currentTime;
      }
    }, 1000);

    return () => {
      userVid.removeEventListener("timeupdate", handleTimeUpdate);
      userVid.removeEventListener("play", handlePlay);
      userVid.removeEventListener("pause", handlePause);
      clearInterval(interval);
    };
  }, [videosActive]);

  // Force play both videos when they become active
  useEffect(() => {
    if (videosActive) {
      userVideoRef.current?.play().catch(() => {});
      greenerVideoRef.current?.play().catch(() => {});
    }
  }, [videosActive]);

  // 4. Handle Dragging / Pointer events for Slider
  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Direct DOM manipulation for buttery smooth 60/120fps performance
    if (handleRef.current) {
      handleRef.current.style.left = `${pct}%`;
    }
    if (handleLineRef.current) {
      handleLineRef.current.style.left = `${pct}%`;
    }
    if (clipLayerRef.current) {
      clipLayerRef.current.style.clipPath = `inset(0 0 0 ${pct}%)`;
    }
    setSliderPct(pct);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSliderPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
  };

  // Outcome text based on choices
  let outcomeTitle = "";
  let outcomeDesc = "";
  let outcomeTheme = { bg: "#F0FAF0", border: "#B8D4A8", text: "#2D5016" }; // Eco Default

  if (storyState === "thriving") {
    outcomeTitle = "A Thriving Chapter Written";
    outcomeDesc = `Your choices today saved ${Math.abs(totalCarbonDelta)} kg of CO₂. The path you are writing leads to clean air, vibrant forests, and a flourishing planet.`;
  } else if (storyState === "stable") {
    outcomeTitle = "A Balanced Ecosystem";
    outcomeDesc = `A steady day, but your choices have left a trace. Small adjustments in your routine could shift the planet toward a greener path.`;
    outcomeTheme = { bg: "rgba(255,248,230,0.85)", border: "rgba(244,168,50,0.35)", text: "#8B6914" };
  } else if (storyState === "stressed") {
    outcomeTitle = "Under Visible Strain";
    outcomeDesc = `Today's choices left a heavy footprint (+${totalCarbonDelta} kg CO₂). It is a reminder that each step we take shapes the weather, the trees, and the air our loved ones breathe.`;
    outcomeTheme = { bg: "rgba(255,225,180,0.85)", border: "rgba(244,168,50,0.35)", text: "#A05A1A" };
  } else {
    outcomeTitle = "A Damaged Landscape";
    outcomeDesc = `With a very high carbon footprint (+${totalCarbonDelta} kg CO₂), the visual story tells it all: bare branches, dry brown soil, and a hazy sky under heavy pressure. Small daily changes could help this world heal.`;
    outcomeTheme = { bg: "rgba(255,240,240,0.85)", border: "rgba(255,107,107,0.35)", text: "#A0401A" };
  }

  // Find biggest impact decisions for narrative details
  const sortedByCarbon = [...decisions].sort((a, b) => b.carbonDelta - a.carbonDelta);
  const highestImpact = sortedByCarbon.find(d => d.carbonDelta > 0) || sortedByCarbon[0];
  
  const sortedByEco = [...decisions].sort((a, b) => a.carbonDelta - b.carbonDelta);
  const lowestImpact = sortedByEco[0];

  return (
    <div style={{ position: "relative", minHeight: "85vh" }}>
      <AnimatePresence mode="wait">
        {!videosActive && (
          <motion.div
            key="loading-screen"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFF8E7",
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <VerdOrb size={80} mood={totalCarbonDelta < 0 ? "eco" : "thinking"} />
            </motion.div>
            
            <h1 style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#2D5016",
              textAlign: "center",
              maxWidth: 500,
              lineHeight: 1.4,
              marginTop: 28,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}>
              🌱 Verd is revealing your future...
            </h1>

            {/* Progress Bar Container */}
            <div style={{
              width: "240px",
              height: "6px",
              backgroundColor: "#E8F5E3", // Soft mint background
              borderRadius: "3px",
              marginTop: "20px",
              overflow: "hidden",
              position: "relative"
            }}>
              <motion.div
                style={{
                  height: "100%",
                  width: `${loadingProgress}%`,
                  background: "linear-gradient(90deg, #F4A832 0%, #FFD166 50%, #F4A832 100%)",
                  borderRadius: "3px",
                  boxShadow: "0 0 8px rgba(244,168,50,0.5)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: videosActive ? 1 : 0, y: videosActive ? 0 : 30 }}
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}
      >
        {/* Page Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
            <VerdOrb size={44} mood={totalCarbonDelta < 0 ? "eco" : "moderate"} />
          </motion.div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#2D5016",
            textAlign: "center",
            letterSpacing: "-0.02em",
            margin: 0
          }}>
            A Tale of Two Futures
          </h1>
          <p style={{
            fontSize: 15,
            color: "#6B8F5E",
            textAlign: "center",
            fontStyle: "italic",
            margin: 0,
            fontWeight: 500
          }}>
            Drag the gold seed orb to rewrite the story of tomorrow.
          </p>
        </div>

        {/* Slider Hero Window Container (Double-Bezel) */}
        <div style={{
          background: "rgba(45,80,22,0.03)",
          padding: "8px",
          borderRadius: 32,
          border: "1px solid rgba(184,212,168,0.4)",
          boxShadow: "0 8px 32px rgba(45,80,22,0.05)",
          width: "100%",
          maxWidth: 900,
          margin: "0 auto",
        }}>
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{
              position: "relative",
              height: "clamp(260px, 45vw, 460px)",
              borderRadius: 24,
              overflow: "hidden",
              cursor: "ew-resize",
              userSelect: "none",
              touchAction: "none",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)"
            }}
          >
            {/* Left World: Your Story (Bottom Layer) */}
            <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
              <video
                ref={userVideoRef}
                src={userVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onCanPlay={() => setUserVideoReady(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none"
                }}
              />
            </div>

            {/* Right World: Greener Story (Top Layer - Clipped) */}
            <div
              ref={clipLayerRef}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                clipPath: "inset(0 0 0 50%)"
              }}
            >
              <video
                ref={greenerVideoRef}
                src={greenerVideoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onCanPlay={() => setGreenerVideoReady(true)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none"
                }}
              />
            </div>

            {/* Vertical Divider Line */}
            <div
              ref={handleLineRef}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: "50%",
                width: 2,
                background: "rgba(244,168,50,0.6)",
                boxShadow: "0 0 12px rgba(244,168,50,0.4)",
                zIndex: 3,
                pointerEvents: "none"
              }}
            />

            {/* Slider Thumb Handle */}
            <motion.div
              ref={handleRef}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "3px solid #F4A832",
                backgroundColor: "#FFFFFF",
                boxShadow: isDragging 
                  ? "0 0 24px rgba(244,168,50,0.85), 0 4px 16px rgba(45,80,22,0.22)" 
                  : "0 0 12px rgba(244,168,50,0.4), 0 2px 8px rgba(45,80,22,0.12)",
                zIndex: 4,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "box-shadow 0.2s ease"
              }}
              animate={{ 
                scale: isDragging ? 1.15 : 1,
                x: "-50%",
                y: "-50%"
              }}
              transition={{ duration: 0.15 }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F4A832"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="8 5 1 12 8 19" />
                <polyline points="16 5 23 12 16 19" />
              </svg>
            </motion.div>

            {/* Labels */}
            <div style={{
              position: "absolute",
              left: 20,
              top: 20,
              background: "rgba(255, 255, 255, 0.9)",
              border: "1.5px solid #B8D4A8",
              borderRadius: 20,
              padding: "6px 14px",
              zIndex: 5,
              pointerEvents: "none",
              fontSize: 12,
              fontWeight: 700,
              color: "#2D5016",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 10px rgba(45,80,22,0.05)"
            }}>
              <span>🌍</span> Your Story
            </div>

            <div style={{
              position: "absolute",
              right: 20,
              top: 20,
              background: "rgba(255, 255, 255, 0.9)",
              border: "1.5px solid #4CAF50",
              borderRadius: 20,
              padding: "6px 14px",
              zIndex: 5,
              pointerEvents: "none",
              fontSize: 12,
              fontWeight: 700,
              color: "#2D7A1F",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 10px rgba(45,80,22,0.05)"
            }}>
              <span>🌱</span> Greener Story
            </div>
          </div>
        </div>

        {/* Editorial Storybook Sections */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 36,
          maxWidth: 720,
          margin: "0 auto",
          width: "100%"
        }}>
          {/* Journal outcome narrative */}
          <div style={{
            background: outcomeTheme.bg,
            border: `1px solid ${outcomeTheme.border}`,
            borderRadius: 24,
            padding: "28px",
            boxShadow: "0 4px 20px rgba(45,80,22,0.04)"
          }}>
            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: outcomeTheme.text,
              margin: "0 0 10px 0",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}>
              {outcomeTitle}
            </h3>
            <p style={{
              fontSize: 15,
              lineHeight: 1.65,
              color: "#2D5016",
              margin: 0,
              fontWeight: 450
            }}>
              {outcomeDesc}
            </p>
          </div>

          {/* Personalised dialogue or Key Insights */}
          <div style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(12px)",
            borderRadius: 24,
            border: "1px solid rgba(184,212,168,0.5)",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: 16
          }}>
            <h4 style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#2D5016",
              margin: "0 0 4px 0",
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}>
              📖 Storybook Insights
            </h4>

            {highestImpact && (
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ fontSize: 24 }}>🧭</div>
                <div>
                  <div style={{ fontSize: 13, color: "#6B8F5E", fontWeight: 600 }}>Your heaviest footstep:</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#A0401A", marginTop: 2 }}>
                    {highestImpact.choice} (+{highestImpact.carbonDelta} kg CO₂)
                  </div>
                </div>
              </div>
            )}

            {lowestImpact && (
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 4 }}>
                <div style={{ fontSize: 24 }}>🍃</div>
                <div>
                  <div style={{ fontSize: 13, color: "#6B8F5E", fontWeight: 600 }}>Your kindest choice:</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2D7A1F", marginTop: 2 }}>
                    {lowestImpact.choice} ({lowestImpact.carbonDelta <= 0 ? `Saved ${Math.abs(lowestImpact.carbonDelta)} kg CO₂` : `+${lowestImpact.carbonDelta} kg CO₂`})
                  </div>
                </div>
              </div>
            )}

            {highestImpact && highestImpact.impactType !== "eco" && (
              <div style={{
                marginTop: 8,
                padding: "12px 16px",
                background: "rgba(244,168,50,0.1)",
                borderRadius: 16,
                borderLeft: "4px solid #F4A832",
                fontSize: 14,
                color: "#8B6914",
                fontWeight: 500,
                lineHeight: 1.5
              }}>
                💡 If you had chosen an eco swap for <strong>{highestImpact.choice}</strong>, you would have saved {highestImpact.carbonDelta + 5} kg of CO₂. Small shifts rewrite our chapters.
              </div>
            )}
          </div>

          {/* Dynamic comparative dashboard */}
          <FutureEarth />

          {/* Navigation buttons at bottom */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, alignItems: "center" }}>
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/story/garden")}
              style={{
                padding: "18px",
                background: "linear-gradient(135deg, #4A7C2F 0%, #F4A832 100%)",
                color: "white",
                borderRadius: 16,
                fontWeight: 700,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(74,124,47,0.25)",
                width: "100%",
                position: "relative",
                overflow: "hidden"
              }}
            >
              🌱 Let's Seed the Garden →
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { resetSession(); router.push("/story/chapter"); }}
              style={{
                padding: "14px",
                background: "rgba(255,255,255,0.6)",
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
              ↺ Rewind and Choose Differently
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}