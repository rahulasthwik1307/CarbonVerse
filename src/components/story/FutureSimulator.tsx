"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import FutureStoryBento from "./FutureStoryBento";

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

  // Hybrid Scoring Models Choice Counts
  const highCount = decisions.filter(d => d.impactType === "high").length;
  const moderateCount = decisions.filter(d => d.impactType === "moderate").length;
  const ecoCount = decisions.filter(d => d.impactType === "eco").length;

  // 1. Video Sourcing Logic based on Final Story Engine
  const greenerVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781851014/Greener_Story_hrakq8.mp4";
  let userVideoUrl = "";
  let baseVideoType = "stable";

  if (highCount >= 4) {
    baseVideoType = "heavy";
    userVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781850923/Carbon_Heavy_yihssc.mp4";
  } else if (highCount >= 2) {
    baseVideoType = "stressed";
    userVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781850863/Under_Stress_wf2cog.mp4";
  } else {
    baseVideoType = "stable";
    userVideoUrl = "https://res.cloudinary.com/dsdy81lwd/video/upload/v1781850732/Stable_Future_qu6yw3.mp4";
  }

  // Determine user's footprint state
  let storyState = "stable";
  if (baseVideoType === "heavy") {
    storyState = "damaged";
  } else if (baseVideoType === "stressed") {
    storyState = "stressed";
  } else {
    if (totalCarbonDelta < 0) {
      storyState = "thriving";
    } else {
      storyState = "stable";
    }
  }

  const bothVideosReady = userVideoReady && greenerVideoReady;

  // 2. Progressive Loading & Illusion Curve Effect
  useEffect(() => {
    if (videosActive) return;

    let startTimestamp = Date.now();
    let intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimestamp;
      
      if (bothVideosReady) {
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

  // Safety loading bypass
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

  // ── Bento Data Computation ──
  const avgDailyCarbon = totalCarbonDelta;
  const yearlyCarbon = avgDailyCarbon * 365;
  const yearlyTonnes = yearlyCarbon / 1000;

  const avgDailyGreen = decisions
    .filter((d) => d.impactType !== "high")
    .reduce((sum, d) => sum + d.carbonDelta, 0);
  const yearlyGreenCarbon = avgDailyGreen * 365;
  const yearlyGreenTonnes = yearlyGreenCarbon / 1000;
  const savedTonnes = yearlyTonnes - yearlyGreenTonnes;

  const treesNeeded = Math.round(Math.abs(yearlyTonnes) * 50);
  const carKm = Math.round(Math.abs(yearlyTonnes) * 4400);
  const homeDays = Math.round(Math.abs(yearlyTonnes) * 30);

  const sortedByCarbon = [...decisions].sort((a, b) => b.carbonDelta - a.carbonDelta);
  const highestImpact = sortedByCarbon.find(d => d.carbonDelta > 0) || sortedByCarbon[0];
  const sortedByEco = [...decisions].sort((a, b) => a.carbonDelta - b.carbonDelta);
  const lowestImpact = sortedByEco[0];

  let verdMessage = "";
  if (yearlyTonnes < 0) {
    verdMessage = "Amazing! Your lifestyle would actually help the planet!";
  } else if (yearlyTonnes <= 1) {
    verdMessage = "You're close to carbon neutral! A few more eco swaps would make a huge difference!";
  } else if (yearlyTonnes <= 3) {
    verdMessage = "Room to grow! Try swapping your top carbon activities for eco alternatives.";
  } else {
    verdMessage = "Big impact, but big opportunity too! Small daily changes add up to tonnes saved.";
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* ── Loading Screen ── */}
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

            <div style={{
              width: "240px",
              height: "6px",
              backgroundColor: "#E8F5E3",
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

      {/* ── Main Content: 72/28 Editorial Split ── */}
      <motion.div
        animate={{ opacity: videosActive ? 1 : 0, y: videosActive ? 0 : 30 }}
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
        }}
      >
        {/* ── The Editorial Split ── */}
        <div
          className="future-editorial-split"
          style={{
            display: "grid",
            gridTemplateColumns: "72fr 28fr",
            gap: 16,
            flex: 1,
            minHeight: "calc(100vh - 120px)",
            padding: "16px 20px 0",
          }}
        >
          {/* ═══════ LEFT SIDE — 72% — Future Simulator ═══════ */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 0,
          }}>
            {/* Compact Editorial Header (left-aligned) */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <VerdOrb size={32} mood={totalCarbonDelta < 0 ? "eco" : "moderate"} />
              </motion.div>
              <div>
                <h1 style={{
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "#2D5016",
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.1,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}>
                  A Tale of Two Futures
                </h1>
                <p style={{
                  fontSize: 13,
                  color: "#6B8F5E",
                  fontStyle: "italic",
                  margin: "2px 0 0 0",
                  fontWeight: 500,
                }}>
                  Drag the gold orb to reveal the greener path.
                </p>
              </div>
            </div>

            {/* Video Comparison Container (Double-Bezel) */}
            <div style={{
              background: "rgba(45,80,22,0.03)",
              padding: "5px",
              borderRadius: 28,
              border: "1px solid rgba(184,212,168,0.4)",
              boxShadow: "0 6px 28px rgba(45,80,22,0.05)",
              flex: 1,
              display: "flex",
              minHeight: 0,
            }}>
              <div
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{
                  position: "relative",
                  width: "100%",
                  flex: 1,
                  borderRadius: 22,
                  overflow: "hidden",
                  cursor: "ew-resize",
                  userSelect: "none",
                  touchAction: "none",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
                  background: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Left World: Your Story (Bottom Layer) */}
                <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                      objectFit: "contain",
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
                    clipPath: "inset(0 0 0 50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                      objectFit: "contain",
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
                  left: 16,
                  top: 16,
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1.5px solid #B8D4A8",
                  borderRadius: 18,
                  padding: "5px 12px",
                  zIndex: 5,
                  pointerEvents: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2D5016",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 2px 10px rgba(45,80,22,0.05)"
                }}>
                  <span>🌍</span> Your Story
                </div>

                <div style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1.5px solid #4CAF50",
                  borderRadius: 18,
                  padding: "5px 12px",
                  zIndex: 5,
                  pointerEvents: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2D7A1F",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  boxShadow: "0 2px 10px rgba(45,80,22,0.05)"
                }}>
                  <span>🌱</span> Greener Story
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT SIDE — 28% — Bento Sidebar ═══════ */}
          <div
            className="future-bento-sidebar"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: 0,
              maxHeight: "calc(100vh - 48px)",
              paddingRight: 4,
              paddingBottom: 16,
              /* Custom scrollbar styling */
            }}
          >
            <FutureStoryBento
              storyState={storyState as "thriving" | "stable" | "stressed" | "damaged"}
              yearlyTonnes={yearlyTonnes}
              yearlyGreenTonnes={yearlyGreenTonnes}
              savedTonnes={savedTonnes}
              highestImpact={highestImpact}
              lowestImpact={lowestImpact}
              treesNeeded={treesNeeded}
              carKm={carKm}
              homeDays={homeDays}
              verdMessage={verdMessage}
              totalCarbonDelta={totalCarbonDelta}
            />
          </div>
        </div>

        {/* ═══════ FULL-WIDTH CINEMATIC CTA ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          style={{
            padding: "24px 20px 32px",
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Cinematic divider line */}
          <div style={{
            width: "100%",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(184,212,168,0.5), rgba(244,168,50,0.3), rgba(184,212,168,0.5), transparent)",
            marginBottom: 24,
          }} />

          {/* Primary CTA */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/story/garden")}
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #2D5016 0%, #4A7C2F 40%, #F4A832 100%)",
              color: "white",
              borderRadius: 20,
              fontWeight: 800,
              fontSize: 18,
              border: "none",
              cursor: "pointer",
              width: "100%",
              fontFamily: "'Plus Jakarta Sans', system-ui",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(74,124,47,0.3)",
              letterSpacing: "-0.01em",
            }}
          >
            {/* Shimmer sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1,
              }}
              style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>
              🌱 Let&apos;s Seed the Garden →
            </span>
          </motion.button>

          {/* Secondary CTA */}
          <motion.button
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => { resetSession(); router.push("/story/chapter"); }}
            style={{
              marginTop: 8,
              padding: "12px",
              background: "transparent",
              color: "#6B8F5E",
              borderRadius: 14,
              fontWeight: 500,
              fontSize: 13,
              border: "1px solid rgba(184,212,168,0.4)",
              cursor: "pointer",
              width: "100%",
              fontFamily: "'Plus Jakarta Sans', system-ui",
            }}
          >
            ↺ Rewind and Choose Differently
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ── Responsive overrides ── */}
      <style>{`
        /* Custom scrollbar for bento sidebar */
        .future-bento-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .future-bento-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .future-bento-sidebar::-webkit-scrollbar-thumb {
          background: rgba(184,212,168,0.4);
          border-radius: 4px;
        }
        .future-bento-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(184,212,168,0.6);
        }

        /* Tablet and below: collapse to single column */
        @media (max-width: 1024px) {
          .future-editorial-split {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            gap: 20px !important;
          }
          .future-bento-sidebar {
            max-height: none !important;
            overflow-y: visible !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .future-editorial-split {
            padding: 12px 12px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}