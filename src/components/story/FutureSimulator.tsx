"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";
import FutureStoryBento from "./FutureStoryBento";

export default function FutureSimulator() {
  const router = useRouter();
  const {
    decisions, totalCarbonDelta, resetSession, storyCompleted,
    futureOutcome, setFutureOutcome, memoryBook,
    addStoryToMemoryBook, completeStory, worldState, profile,
  } = useSessionStore();

  // Check if user has a valid completed story
  const hasCompletedStory = storyCompleted || decisions.length > 0;
  
  // Video loading and synchronization states
  const [userVideoReady, setUserVideoReady] = useState(false);
  const [greenerVideoReady, setGreenerVideoReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [videosActive, setVideosActive] = useState(true);
  const [userVideoFailed, setUserVideoFailed] = useState(false);
  const [greenerVideoFailed, setGreenerVideoFailed] = useState(false);

  // Drag slider refs and state
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const handleLineRef = useRef<HTMLDivElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);
  const [isTransitioningToGarden, setIsTransitioningToGarden] = useState(false);
  const [transitionMsgIdx, setTransitionMsgIdx] = useState(0);

  const transitionMessages = [
    "🌿 Verd is growing your Memory Garden...",
    "🌱 Gathering the seeds from your journey...",
    "🦋 Nature is responding to your choices...",
    "🌳 Growing the world you helped create..."
  ];

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

  // Cache future outcome for back-navigation
  useEffect(() => {
    if (hasCompletedStory && !futureOutcome) {
      setFutureOutcome({ storyState, videoType: baseVideoType });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCompletedStory, storyState, baseVideoType]);

  // Safety loading bypass — also handles video failure
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (!userVideoReady) setUserVideoFailed(true);
      if (!greenerVideoReady) setGreenerVideoFailed(true);
      setUserVideoReady(true);
      setGreenerVideoReady(true);
    }, 8000);
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

  // ── EMPTY STATE: No story completed ──
  if (!hasCompletedStory) {
    return (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center", width: "100%" }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            maxWidth: 480,
            width: "90%",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(184, 212, 168, 0.6)",
            boxShadow: "0 12px 40px rgba(45, 80, 22, 0.12)",
            borderRadius: 32,
            padding: "48px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <VerdOrb size={80} />
          </motion.div>

          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#2D5016",
            margin: "24px 0 8px 0",
            lineHeight: 1.2,
          }}>
            🌎 The Future Has Not Been Written Yet
          </h1>

          <p style={{
            fontSize: 16,
            color: "#4A7C2F",
            fontWeight: 500,
            lineHeight: 1.6,
            margin: "0 0 8px 0",
          }}>
            Every decision shapes tomorrow.
          </p>
          <p style={{
            fontSize: 14,
            color: "#6B8F5E",
            fontWeight: 500,
            fontStyle: "italic",
            lineHeight: 1.5,
            margin: "0 0 28px 0",
          }}>
            Begin your journey and discover the world your choices create.
          </p>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/story")}
            style={{
              padding: "14px 32px",
              background: "#F4A832",
              color: "#2D5016",
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              boxShadow: "0 4px 18px rgba(244,168,50,0.35)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {memoryBook.stories.length > 0 ? "🌱 Play Another Story" : "Start Your Story"}
            <span style={{ fontSize: 18 }}>→</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", width: "100%" }}>


      {/* ── Main Content OR Garden Transition ── */}
      <AnimatePresence mode="wait">
        {isTransitioningToGarden ? (
          <motion.div
            key="garden-transition"
            initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 20px)", scale: 0.95 }}
            animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: "-50%", y: "calc(-50% - 20px)", scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              zIndex: 100,
              width: "90%",
              maxWidth: 380,
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.6)",
              boxShadow: "0 12px 40px rgba(45, 80, 22, 0.15)",
              borderRadius: 32,
              padding: "40px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Subtle floating particles/leaves effect behind content */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 32, pointerEvents: "none", zIndex: -1 }}>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`leaf-${i}`}
                  initial={{ 
                    x: Math.random() * 300, 
                    y: Math.random() * 200 + 100,
                    opacity: 0,
                    rotate: 0,
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{ 
                    y: -50,
                    opacity: [0, 0.6, 0],
                    rotate: Math.random() * 360,
                    x: `calc(${Math.random() * 100}% + ${Math.random() * 40 - 20}px)`
                  }}
                  transition={{ 
                    duration: 2.5 + Math.random() * 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: Math.random() * 2
                  }}
                  style={{
                    position: "absolute",
                    width: 12,
                    height: 12,
                    background: i % 2 === 0 ? "#4CAF50" : "#F4A832",
                    borderRadius: i % 2 === 0 ? "12px 0 12px 0" : "50%",
                    filter: "blur(1px)"
                  }}
                />
              ))}
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <VerdOrb size={80} mood={totalCarbonDelta < 0 ? "eco" : "thinking"} />
            </motion.div>
            
            <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 28 }}>
              <AnimatePresence mode="wait">
                <motion.h1 
                  key={transitionMsgIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#2D5016",
                    textAlign: "center",
                    maxWidth: 500,
                    lineHeight: 1.4,
                    margin: 0,
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
                  }}>
                  {transitionMessages[transitionMsgIdx]}
                </motion.h1>
              </AnimatePresence>
            </div>

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
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #F4A832 0%, #4CAF50 100%)",
                  borderRadius: "3px",
                  boxShadow: "0 0 8px rgba(76,175,80,0.5)",
                }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="future-main-content"
            animate={{ opacity: videosActive ? 1 : 0, y: videosActive ? 0 : 30 }}
            initial={{ opacity: 0, y: 30 }}
            exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              flex: 1,
              justifyContent: "center",
            }}
          >
        <div
          className="future-master-container"
          style={{
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(184, 212, 168, 0.5)",
            borderRadius: 32,
            boxShadow: "0 8px 40px rgba(45, 80, 22, 0.10)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            boxSizing: "border-box",
            flex: 1,
          }}
        >
          {/* ── The Editorial Split ── */}
          <div
            className="future-editorial-split"
            style={{
              display: "grid",
              gridTemplateColumns: "72fr 28fr",
              gap: 12,
              flex: 1,
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* ═══════ LEFT SIDE — 72% — Future Simulator ═══════ */}
            <div className="future-left-column" style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              minHeight: 0,
              justifyContent: "space-between",
            }}>
            {/* Compact Editorial Header (centered relative to Left column) */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              width: "100%",
              marginBottom: 0,
            }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ flexShrink: 0 }}
              >
                <VerdOrb size={56} mood={totalCarbonDelta < 0 ? "eco" : "moderate"} />
              </motion.div>
              <div style={{ textAlign: "left" }}>
                <h1 style={{
                  fontSize: "clamp(22px, 2.8vw, 30px)",
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
              width: "100%",
              maxWidth: "100%",
              margin: "0 auto 0 0",
              display: "flex",
              position: "relative",
              flexShrink: 1,
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
                  aspectRatio: "16 / 9",
                  borderRadius: 22,
                  overflow: "hidden",
                  cursor: "ew-resize",
                  userSelect: "none",
                  touchAction: "none",
                  boxShadow: "inset 0 2px 8px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                    preload="auto"
                    onLoadedData={() => setUserVideoReady(true)}
                    onCanPlayThrough={() => setUserVideoReady(true)}
                    onError={() => { setUserVideoFailed(true); setUserVideoReady(true); }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      pointerEvents: "none"
                    }}
                  />
                  <AnimatePresence>
                    {!userVideoReady && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(135deg, #F0FAF0 0%, #FFF8E7 100%)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 24,
                          zIndex: 10,
                          boxSizing: "border-box"
                        }}
                      >
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          style={{ marginBottom: 12 }}
                        >
                          <VerdOrb size={48} mood="thinking" />
                        </motion.div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2D5016", margin: "0 0 4px 0", textAlign: "center" }}>
                          🌍 Building Your Future Story
                        </h3>
                        <p style={{ fontSize: 12, color: "#4A7C2F", margin: 0, textAlign: "center", fontStyle: "italic", fontWeight: 500 }}>
                          "Verd is stitching your choices into tomorrow."
                        </p>
                        {/* Subtle loader bar */}
                        <div style={{ width: 120, height: 4, background: "rgba(184, 212, 168, 0.3)", borderRadius: 2, marginTop: 12, overflow: "hidden", position: "relative" }}>
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            style={{ width: "100%", height: "100%", background: "#F4A832", borderRadius: 2 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right World: Greener Story (Top Layer - Clipped) */}
                <div
                  ref={clipLayerRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    clipPath: "inset(0 0 0 50%)",
                  }}
                >
                  <video
                    ref={greenerVideoRef}
                    src={greenerVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    onLoadedData={() => setGreenerVideoReady(true)}
                    onCanPlayThrough={() => setGreenerVideoReady(true)}
                    onError={() => { setGreenerVideoFailed(true); setGreenerVideoReady(true); }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      pointerEvents: "none"
                    }}
                  />
                  <AnimatePresence>
                    {!greenerVideoReady && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(135deg, #F0FAF0 0%, #FFF8E7 100%)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 24,
                          zIndex: 10,
                          boxSizing: "border-box"
                        }}
                      >
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          style={{ marginBottom: 12 }}
                        >
                          <VerdOrb size={48} mood="eco" />
                        </motion.div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2D5016", margin: "0 0 4px 0", textAlign: "center" }}>
                          🌍 Building Your Future Story
                        </h3>
                        <p style={{ fontSize: 12, color: "#4A7C2F", margin: 0, textAlign: "center", fontStyle: "italic", fontWeight: 500 }}>
                          "Verd is stitching your choices into tomorrow."
                        </p>
                        {/* Subtle loader bar */}
                        <div style={{ width: 120, height: 4, background: "rgba(184, 212, 168, 0.3)", borderRadius: 2, marginTop: 12, overflow: "hidden", position: "relative" }}>
                          <motion.div
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            style={{ width: "100%", height: "100%", background: "#4CAF50", borderRadius: 2 }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

                {/* Subtitle Overlay (Cinematic Story Caption) */}
                <div style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "calc(100% - 32px)",
                  maxWidth: 580,
                  background: "linear-gradient(180deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 248, 231, 0.18) 100%)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(184, 212, 168, 0.28)",
                  borderRadius: 16,
                  padding: "12px 18px",
                  zIndex: 10,
                  textAlign: "center",
                  boxShadow: "0 8px 32px rgba(45, 80, 22, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.45)",
                  pointerEvents: "none",
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#4A7C2F",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                    textShadow: "0 1px 1px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(255, 255, 255, 0.8)",
                  }}>
                    📖 One Year Later
                  </div>
                  <p style={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "#2D5016",
                    margin: 0,
                    fontWeight: 600,
                    fontStyle: "italic",
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    textShadow: "0 1px 2px #fff, 0 1px 4px #fff, 0 0 8px rgba(255, 255, 255, 0.8)",
                  }}>
                    {sliderPct < 50 
                      ? "In the greener timeline, the air is sweet and the city breathes easy. This is the garden we can grow together when we seed our tomorrow."
                      : storyState === "thriving"
                        ? "The city breathes easy now. Birds returned to streets you walk every morning. Your daily choices saved the garden."
                        : storyState === "stable"
                          ? "The seasons turn in their ancient rhythm. The parks hold their green, but tomorrow is still yours to write."
                          : storyState === "stressed"
                            ? "The city still stands green, but summers arrive earlier now. The future is recoverable — but it's waiting for your next chapter."
                            : "The landscape has changed. Dust settles where grass once grew. But even damaged worlds can heal — every chapter is a chance to rewrite."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Actions Grid */}
            <div
              className="actions-container"
              style={{
                display: "flex",
                gap: 12,
                width: "100%",
                maxWidth: "100%",
                margin: "0 auto 0 0",
              }}
            >
              {/* Primary CTA (70%) */}
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsTransitioningToGarden(true);
                  let msgIdx = 0;
                  const msgInterval = setInterval(() => {
                    msgIdx++;
                    if (msgIdx < transitionMessages.length) {
                      setTransitionMsgIdx(msgIdx);
                    }
                  }, 700);
                  setTimeout(() => {
                    clearInterval(msgInterval);
                    router.push("/story/garden");
                  }, 2200);
                }}
                style={{
                  flex: 1.7,
                  padding: "14px 20px",
                  background: "#F4A832",
                  color: "#2D5016",
                  borderRadius: 16,
                  fontWeight: 800,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  boxShadow: "0 4px 14px rgba(244,168,50,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span>🌱 Let&apos;s Seed The Garden</span>
                <span style={{ fontSize: 16 }}>→</span>
              </motion.button>

              {/* Secondary CTA (30%) */}
              <motion.button
                whileHover={{ scale: 1.015, backgroundColor: "#D7ECD1" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { resetSession(); router.push("/story"); }}
                style={{
                  flex: 0.7,
                  padding: "14px 16px",
                  background: "#E8F5E3",
                  color: "#2D5016",
                  borderRadius: 16,
                  fontWeight: 600,
                  fontSize: 14,
                  border: "1px solid #B8D4A8",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  boxShadow: "0 4px 12px rgba(45,80,22,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span>🌱 Play Another Story</span>
              </motion.button>
            </div>
          </div>

          {/* ═══════ RIGHT SIDE — 28% — Bento Sidebar ═══════ */}
          <div
            className="future-bento-sidebar"
            style={{
              overflowY: "auto",
              overflowX: "hidden",
              minHeight: 0,
              paddingRight: 4,
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
      </div>
    </motion.div>
        )}
      </AnimatePresence>

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

        /* Desktop specific layout */
        @media (min-width: 1025px) {
          .future-page-container {
            height: 100vh !important;
            overflow: hidden !important;
          }
          .future-main-wrapper {
            height: 100% !important;
            box-sizing: border-box !important;
          }
          .future-master-container {
            height: auto !important;
            max-height: calc(100vh - 48px) !important;
            box-sizing: border-box !important;
          }
          .future-editorial-split {
            height: auto !important;
            max-height: 100% !important;
            min-height: 0 !important;
          }
          .future-left-column {
            height: auto !important;
            max-height: 100% !important;
            min-height: 0 !important;
            justify-content: flex-start !important;
            gap: 12px !important;
          }
          .future-bento-sidebar {
            height: auto !important;
            max-height: 100% !important;
            overflow-y: auto !important;
            padding-bottom: 0 !important;
          }
        }

        /* Tablet and below: collapse to single column */
        @media (max-width: 1024px) {
          .future-master-container {
            height: auto !important;
            padding: 16px !important;
            border-radius: 24px !important;
          }
          .future-editorial-split {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
            gap: 20px !important;
          }
          .future-left-column {
            height: auto !important;
            justify-content: flex-start !important;
            gap: 16px !important;
          }
          .future-bento-sidebar {
            max-height: none !important;
            overflow-y: visible !important;
            padding-bottom: 0 !important;
          }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .future-editorial-split {
            padding: 0 !important;
          }
        }

        @media (max-width: 640px) {
          .actions-container {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .actions-container > button {
            flex: 1 1 auto !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}