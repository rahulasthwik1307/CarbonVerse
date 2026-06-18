"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import VerdOrb from "@/components/ui/VerdOrb";
import FutureEarth from "./FutureEarth";

// Ghibli Hills SVG Paths
const HillsSVG = ({ isGreener, storyState }: { isGreener: boolean; storyState: string }) => {
  // Distant to Near Hill Colors
  let colors = ["#A8D878", "#9ECB6E", "#8CBD5F", "#7CAF50", "#6AA042", "#5C8E35"]; // Thriving / Greener lush greens

  if (!isGreener) {
    if (storyState === "damaged") {
      // Arid dark brown dead earth hills for damaged future
      colors = ["#B59B75", "#A88E68", "#9B815C", "#8E7450", "#816744", "#745A38"];
    } else if (storyState === "stressed") {
      // Hazy dry yellowish-greens
      colors = ["#CBB08E", "#BEA381", "#A6A371", "#8F935B", "#778345", "#627334"];
    } else if (storyState === "stable") {
      // Stable soft greens
      colors = ["#CDE6B0", "#BBD89F", "#A0C88E", "#88B87E", "#70A86D", "#5C9059"];
    }
  }

  return (
    <svg
      viewBox="0 0 1400 600"
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <path d="M0 314L156 341L311 320L467 284L622 376L778 360L933 265L1089 325L1244 280L1400 317L1400 601L1244 601L1089 601L933 601L778 601L622 601L467 601L311 601L156 601L0 601Z" fill={colors[0]} />
      <path d="M0 383L156 339L311 304L467 387L622 341L778 379L933 331L1089 357L1244 403L1400 418L1400 601L1244 601L1089 601L933 601L778 601L622 601L467 601L311 601L156 601L0 601Z" fill={colors[1]} />
      <path d="M0 381L156 392L311 451L467 455L622 450L778 358L933 419L1089 373L1244 401L1400 372L1400 601L1244 601L1089 601L933 601L778 601L622 601L467 601L311 601L156 601L0 601Z" fill={colors[2]} />
      <path d="M0 447L156 462L311 484L467 474L622 418L778 421L933 437L1089 486L1244 443L1400 473L1400 601L1244 601L1089 601L933 601L778 601L622 601L467 601L311 601L156 601L0 601Z" fill={colors[3]} />
      <path d="M0 466L156 494L311 518L467 496L622 473L778 501L933 500L1089 510L1244 479L1400 478L1400 601L1244 601L1089 601L933 601L778 601L622 601L467 601L311 601L156 601L0 601Z" fill={colors[4]} />
      <path d="M0 552L156 558L311 565L467 560L622 529L778 550L933 524L1089 531L1244 514L1400 523L1400 601L1244 601L1089 601L933 601L778 601L622 601L467 601L311 601L156 601L0 601Z" fill={colors[5]} />
    </svg>
  );
};

// Main Animated World Layer
const AnimatedWorld = ({ isGreener, storyState, totalCarbonDelta, state, isReady }: { isGreener: boolean; storyState: string; totalCarbonDelta: number; state: any; isReady: boolean }) => {
  const { skyQuality, treeDensity, birdCount, trafficLevel } = state;
  
  // 1. Sky Gradients & Tints based on story state
  let skyGrad = "linear-gradient(180deg, #9CD3F5 0%, #FFF0CA 100%)"; // Clear morning sunrise
  let showSmogOverlay = false;
  let smogColor = "rgba(180, 130, 80, 0)";
  let sunOpacity = 1.0;
  let sunGlowColor = "rgba(255,229,160,0.6)";

  if (!isGreener) {
    if (storyState === "damaged") {
      skyGrad = "linear-gradient(180deg, #B08A68 0%, #E28C5C 100%)"; // Dusty grey-brown to toxic orange sky
      showSmogOverlay = true;
      smogColor = "rgba(112, 80, 48, 0.45)"; // Heavy brown smog overlay
      sunOpacity = 0.45;
      sunGlowColor = "rgba(255,107,53,0.15)";
    } else if (storyState === "stressed") {
      skyGrad = "linear-gradient(180deg, #C8B898 0%, #FAD08C 100%)"; // Heavy yellow-grey dust haze
      showSmogOverlay = true;
      smogColor = "rgba(140, 115, 85, 0.25)"; // Dusty haze overlay
      sunOpacity = 0.7;
      sunGlowColor = "rgba(255,179,71,0.3)";
    } else if (storyState === "stable") {
      skyGrad = "linear-gradient(180deg, #CDE2CF 0%, #FEF2D5 100%)"; // Soft slightly pale cream-green
      sunGlowColor = "rgba(255,213,102,0.45)";
    }
  }

  // 2. Tree Growth Configurations
  // Define tree placements with specific growth stages: sapling, young, mature
  // Edge trees are repositioned to avoid clipping.
  const treeSpecs = [
    { left: "14%", bottom: "18%", stage: "mature", delay: 0.1 },
    { left: "22%", bottom: "15%", stage: "young", delay: 0.3 },
    { left: "32%", bottom: "24%", stage: "mature", delay: 0.2 },
    { left: "42%", bottom: "17%", stage: "sapling", delay: 0.5 },
    { left: "52%", bottom: "26%", stage: "mature", delay: 0.4 },
    { left: "62%", bottom: "16%", stage: "young", delay: 0.7 },
    { left: "72%", bottom: "22%", stage: "mature", delay: 0.6 },
    { left: "80%", bottom: "15%", stage: "sapling", delay: 0.8 },
    { left: "88%", bottom: "20%", stage: "young", delay: 0.5 },
  ];

  // Determine tree counts & growth mixes based on state
  let treesToRender: any[] = [];
  if (isGreener) {
    // Greener Story: Dense, lush, healthy mature trees
    treesToRender = treeSpecs.map(t => ({ ...t, stage: t.stage === "sapling" ? "young" : "mature" }));
  } else {
    if (storyState === "thriving") {
      treesToRender = treeSpecs;
    } else if (storyState === "stable") {
      // 5 trees: mix of young and sapling
      treesToRender = [
        { ...treeSpecs[1], stage: "young" },
        { ...treeSpecs[3], stage: "sapling" },
        { ...treeSpecs[5], stage: "young" },
        { ...treeSpecs[7], stage: "sapling" },
        { ...treeSpecs[8], stage: "young" },
      ];
    } else if (storyState === "stressed") {
      // 2 sapling trees
      treesToRender = [
        { ...treeSpecs[3], stage: "sapling" },
        { ...treeSpecs[7], stage: "sapling" },
      ];
    } else {
      // Damaged: 0 living trees, only stumps
      treesToRender = [];
    }
  }

  // Dead stumps mapping: aligned exactly to tree Specs coordinates for transition consistency
  let stumpsToRender: any[] = [];
  if (!isGreener) {
    if (storyState === "stressed") {
      stumpsToRender = [treeSpecs[0], treeSpecs[2], treeSpecs[4], treeSpecs[6]];
    } else if (storyState === "damaged") {
      stumpsToRender = [treeSpecs[0], treeSpecs[1], treeSpecs[2], treeSpecs[4], treeSpecs[5], treeSpecs[6]];
    }
  }

  // 3. Foliage-Bound Butterflies
  // Positioned directly on leaf canopies to stay integrated with the vegetation
  const butterflySpecs = [
    { left: "15.5%", bottom: "27%", scale: 0.6, delay: 0 },
    { left: "23%", bottom: "23%", scale: 0.55, delay: 1.2 },
    { left: "33.5%", bottom: "33%", scale: 0.6, delay: 0.6 },
    { left: "53.5%", bottom: "35%", scale: 0.65, delay: 0.9 },
    { left: "63%", bottom: "25%", scale: 0.55, delay: 1.5 },
    { left: "73.5%", bottom: "31%", scale: 0.6, delay: 0.3 },
    { left: "89%", bottom: "29%", scale: 0.55, delay: 0.8 },
  ];

  let butterfliesToRender: any[] = [];
  if (isGreener) {
    butterfliesToRender = butterflySpecs;
  } else {
    if (storyState === "thriving") {
      butterfliesToRender = butterflySpecs;
    } else if (storyState === "stable") {
      butterfliesToRender = [butterflySpecs[1], butterflySpecs[4], butterflySpecs[6]];
    }
  }

  // 4. Natural Bird Placements (Fly below clouds/sun, +30% size, different speeds and heights)
  const birdSpecs = [
    { src: "/lottie/bird1.json", size: 60, top: "37%", dir: "ltr", duration: 17, delay: 0 },
    { src: "/lottie/bird2.json", size: 90, top: "43%", dir: "rtl", duration: 23, delay: 3 },
    { src: "/lottie/bird1.json", size: 68, top: "49%", dir: "ltr", duration: 15, delay: 6 },
    { src: "/lottie/bird2.json", size: 85, top: "54%", dir: "rtl", duration: 21, delay: 9 },
    { src: "/lottie/bird1.json", size: 65, top: "39%", dir: "rtl", duration: 19, delay: 1.5 },
    { src: "/lottie/bird2.json", size: 95, top: "46%", dir: "ltr", duration: 25, delay: 4.5 },
    { src: "/lottie/bird1.json", size: 70, top: "56%", dir: "ltr", duration: 16, delay: 7.5 },
  ];

  let birdsToRender: any[] = [];
  if (isGreener) {
    birdsToRender = birdSpecs;
  } else {
    if (storyState === "thriving") {
      birdsToRender = birdSpecs;
    } else if (storyState === "stable") {
      birdsToRender = [birdSpecs[0], birdSpecs[1], birdSpecs[2], birdSpecs[3]];
    } else if (storyState === "stressed") {
      birdsToRender = [birdSpecs[0], birdSpecs[2]];
    }
  }

  return (
    <div style={{
      width: "100%",
      height: "100%",
      position: "relative",
      background: skyGrad,
      overflow: "hidden"
    }}>
      {/* Smog Haze Overlay */}
      {showSmogOverlay && (
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundColor: smogColor,
          zIndex: 1,
          pointerEvents: "none"
        }} />
      )}

      {/* Sun composition - scaled larger (+33%) and moved higher */}
      <div style={{
        position: "absolute",
        top: "16%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isGreener ? 240 : 200,
        height: isGreener ? 240 : 200,
        zIndex: 1,
        pointerEvents: "none",
        opacity: sunOpacity
      }}>
        {/* Soft Ghibli Sun Glow Halo */}
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "180%",
          height: "180%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${sunGlowColor} 0%, transparent 68%)`,
          pointerEvents: "none",
          zIndex: -1
        }} />
        {isReady ? (
          <DotLottieReact src="/lottie/sun.json" loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </div>

      {/* Structured Cloud Zones */}
      {/* LEFT CLOUD GROUP */}
      <motion.div
        animate={{ x: [-35, 15, -35] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "10%",
          left: "4%",
          width: 140,
          height: 50,
          zIndex: 1,
          opacity: isGreener ? 0.85 : 0.45,
          pointerEvents: "none"
        }}
      >
        {isReady ? (
          <DotLottieReact src="/lottie/clouds.json" loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </motion.div>

      {/* CENTER SUN CLOUD GROUP (Flanking clouds framing the sun) */}
      <motion.div
        animate={{ x: [-8, 8, -8], y: [-3, 3, -3] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "13%",
          left: "36%",
          width: 125,
          height: 42,
          zIndex: 1,
          opacity: isGreener ? 0.75 : 0.4,
          pointerEvents: "none"
        }}
      >
        {isReady ? (
          <DotLottieReact src="/lottie/clouds.json" loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </motion.div>

      <motion.div
        animate={{ x: [8, -8, 8], y: [3, -3, 3] }}
        transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: "absolute",
          top: "14%",
          left: "54%",
          width: 125,
          height: 42,
          zIndex: 1,
          opacity: isGreener ? 0.7 : 0.35,
          pointerEvents: "none"
        }}
      >
        {isReady ? (
          <DotLottieReact src="/lottie/clouds.json" loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </motion.div>

      {/* RIGHT CLOUD GROUP */}
      <motion.div
        animate={{ x: [35, -15, 35] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "11%",
          right: "4%",
          width: 140,
          height: 50,
          zIndex: 1,
          opacity: isGreener ? 0.8 : 0.4,
          pointerEvents: "none"
        }}
      >
        {isReady ? (
          <DotLottieReact src="/lottie/clouds.json" loop autoplay style={{ width: "100%", height: "100%" }} />
        ) : (
          <div style={{ width: "100%", height: "100%" }} />
        )}
      </motion.div>

      {/* Ghibli Hills */}
      <HillsSVG isGreener={isGreener} storyState={storyState} />

      {/* Trees - with Ghibli wind sways and custom brightness filter for separation */}
      {treesToRender.map((t, i) => {
        // Controlled variation: 95%, 100%, 105%
        let treeScale = 1.0; 
        let treeOpacity = 1.0;

        if (t.stage === "mature") {
          treeScale = 1.05;
        } else if (t.stage === "sapling") {
          treeScale = 0.95;
          treeOpacity = 0.9;
        }

        return (
          <motion.div
            key={`tree-${i}`}
            initial={{ scale: treeScale * 0.95, opacity: 0 }}
            animate={{
              scale: treeScale,
              opacity: treeOpacity,
              rotate: [0, 2, -2, 0] // Ghibli wind sway
            }}
            transition={{
              scale: { type: "spring", stiffness: 90, damping: 14, delay: t.delay },
              opacity: { duration: 0.4, delay: t.delay },
              rotate: { duration: 5 + (i % 3) * 2, repeat: Infinity, ease: "easeInOut", delay: t.delay }
            }}
            style={{
              position: "absolute",
              left: t.left,
              bottom: t.bottom,
              width: 85,
              height: 85,
              transformOrigin: "bottom center",
              zIndex: 3,
              pointerEvents: "none",
              filter: "brightness(0.82)" // 10-15% darker to stand out from hills
            }}
          >
            {/* Tree canopy and trunk */}
            <div style={{ width: "100%", height: "100%", transform: "translateY(16%)" }}>
              {isReady ? (
                <DotLottieReact src="/lottie/tree.json" loop autoplay style={{ width: "100%", height: "100%" }} />
              ) : (
                <div style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Dead Stumps (Your story only, when dry) */}
      {!isGreener && stumpsToRender.map((t, idx) => (
        <div
          key={`stump-${idx}`}
          style={{
            position: "absolute",
            left: t.left,
            bottom: t.bottom,
            width: 85,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            zIndex: 3,
            pointerEvents: "none",
            transform: "translateY(5%)"
          }}
        >
          <svg width="22" height="18" viewBox="0 0 24 20" fill="#745A38">
            <path d="M2 18h20v2H2zM5 18c0-3.5 2-5 5-5.5V11c0-0.5 0.5-1 1-1s1 0.5 1 1v1.5c3 0.5 5 2 5 5.5H5z" opacity={storyState === "damaged" ? 0.95 : 0.75} />
          </svg>
        </div>
      ))}

      {/* Butterflies - nested strictly near trees */}
      {butterfliesToRender.map((p, i) => (
        <motion.div
          key={`bf-${i}`}
          animate={{
            y: [0, -9, 5, -5, 0],
            x: [0, 5, -3, 6, 0],
            rotate: [0, 4, -4, 6, 0] // Flutter
          }}
          transition={{
            duration: 4.5 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
          style={{
            position: "absolute",
            left: p.left,
            bottom: p.bottom,
            width: 32,
            height: 32,
            zIndex: 4,
            pointerEvents: "none",
            transform: `scale(${p.scale})`
          }}
        >
          {isReady ? (
            <DotLottieReact src="/lottie/butterfly.json" loop autoplay style={{ width: "100%", height: "100%" }} />
          ) : (
            <div style={{ width: "100%", height: "100%" }} />
          )}
        </motion.div>
      ))}

      {/* Birds flying low, never overlapping sun or flying in cloud groups */}
      {birdsToRender.map((b, i) => {
        const isLTR = b.dir === "ltr";
        const getScaleX = () => {
          const isBird2 = b.src.includes("bird2");
          if (isBird2) return isLTR ? "scaleX(-1)" : "scaleX(1)";
          return isLTR ? "scaleX(1)" : "scaleX(-1)";
        };

        return (
          <motion.div
            key={`bird-${i}`}
            animate={{
              x: isLTR ? ["-20vw", "120vw"] : ["120vw", "-20vw"],
              y: [0, (i % 2 === 0 ? -8 : 6), 0]
            }}
            transition={{
              x: { duration: b.duration, repeat: Infinity, ease: "linear", delay: b.delay },
              y: { duration: b.duration / 3.5, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{
              position: "absolute",
              top: b.top,
              width: b.size,
              height: b.size,
              zIndex: 3,
              pointerEvents: "none"
            }}
          >
            <div style={{ width: "100%", height: "100%", transform: getScaleX() }}>
              {isReady ? (
                <DotLottieReact src={b.src} loop autoplay style={{ width: "100%", height: "100%" }} />
              ) : (
                <div style={{ width: "100%", height: "100%" }} />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default function FutureSimulator() {
  const router = useRouter();
  const { profile, worldState, decisions, totalCarbonDelta, resetSession } = useSessionStore();
  const [typedText, setTypedText] = useState("");
  const [introStep, setIntroStep] = useState<"typing" | "pause" | "revealing" | "done">("typing");
  
  // Drag slider refs
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const handleLineRef = useRef<HTMLDivElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);
  const [isBlinking, setIsBlinking] = useState(false);

  const introDialogue = "Let's see the future your choices created...";

  // 1. Calculate the user's emotional story state based on totalCarbonDelta
  let storyState = "thriving";
  if (totalCarbonDelta < 0) {
    storyState = "thriving";
  } else if (totalCarbonDelta <= 15) {
    storyState = "stable";
  } else if (totalCarbonDelta <= 35) {
    storyState = "stressed";
  } else {
    storyState = "damaged";
  }

  // Setup Greener State representing the ideal scenario
  const greenerWorldState = {
    skyQuality: 95,
    treeDensity: 95,
    birdCount: 90,
    trafficLevel: 5,
    greenCoverage: 95,
    planetMood: "Thriving"
  };

  // Find biggest impact decisions
  const sortedByCarbon = [...decisions].sort((a, b) => b.carbonDelta - a.carbonDelta);
  const highestImpact = sortedByCarbon.find(d => d.carbonDelta > 0) || sortedByCarbon[0];
  
  const sortedByEco = [...decisions].sort((a, b) => a.carbonDelta - b.carbonDelta);
  const lowestImpact = sortedByEco[0];

  const greenerCarbonDelta = totalCarbonDelta - (decisions.filter(d => d.impactType !== "eco").length * 10);
  const carbonSaved = Math.max(1, totalCarbonDelta - greenerCarbonDelta);

  // Typewriting effect
  useEffect(() => {
    if (introStep !== "typing") return;
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(introDialogue.substring(0, i + 1));
      i++;
      if (i >= introDialogue.length) {
        clearInterval(interval);
        setIntroStep("pause");
        setTimeout(() => {
          setIntroStep("revealing");
        }, 1500);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [introStep]);

  // Randomized blinking eyes for Verd Seed Handle
  useEffect(() => {
    if (introStep === "typing") return;
    let timeoutId: NodeJS.Timeout;
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 4000;
      timeoutId = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeoutId);
  }, [introStep]);

  // Handle Dragging / Pointer events for Slider
  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Direct DOM manipulation for smooth 60/120fps performance
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

  const isIntroActive = introStep === "typing" || introStep === "pause";

  // Emotional outcome wording based on choices
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

  return (
    <div style={{ position: "relative", minHeight: "85vh" }}>
      <AnimatePresence mode="wait">
        {isIntroActive ? (
          <motion.div
            key="intro-screen"
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "75vh",
              width: "100%",
            }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <VerdOrb size={80} mood={totalCarbonDelta < 0 ? "eco" : "thinking"} />
            </motion.div>
            
            <h1 style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "#2D5016",
              textAlign: "center",
              maxWidth: 500,
              lineHeight: 1.4,
              marginTop: 28,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
            }}>
              {typedText}
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="main-screen"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 36, width: "100%" }}
            onAnimationComplete={() => setIntroStep("done")}
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
                  height: 460,
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
                  <AnimatedWorld isGreener={false} storyState={storyState} totalCarbonDelta={totalCarbonDelta} state={worldState} isReady={introStep === "done"} />
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
                  <AnimatedWorld isGreener={true} storyState="thriving" totalCarbonDelta={-10} state={greenerWorldState} isReady={introStep === "done"} />
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

                {/* Slider Thumb Handle - Premium Circular Comparison Handle */}
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
                  {/* Clean minimal left-right arrow icons */}
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

              {/* Dynamic comparative dashboard refactored as FutureEarth component */}
              <FutureEarth />

              {/* Navigation buttons at bottom */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12, alignItems: "center" }}>
                <button
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
                </button>

                <button
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
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
