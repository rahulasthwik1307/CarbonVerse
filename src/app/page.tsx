"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import LandingWorld from "@/components/world/LandingWorld";
import VerdOrb from "@/components/ui/VerdOrb";
import { useSessionStore } from "@/lib/session-store";

/* ─── Typewriter ─── */
function TypewriterText({
  text,
  startDelay = 800,
  charDelay = 22,
  onComplete,
}: {
  text: string;
  startDelay?: number;
  charDelay?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const startTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const charTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startTimeoutRef.current = setTimeout(() => setStarted(true), startDelay);
    return () => {
      if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
    };
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }
    
    let extraDelay = 0;
    if (displayed.length > 0) {
      const lastChar = text[displayed.length - 1];
      if (lastChar === "." || lastChar === "!" || lastChar === "?") {
        extraDelay = 180;
      } else if (lastChar === "," || lastChar === ";" || lastChar === ":") {
        extraDelay = 90;
      }
    }
    
    charTimeoutRef.current = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, charDelay + extraDelay);
    return () => {
      if (charTimeoutRef.current) clearTimeout(charTimeoutRef.current);
    };
  }, [started, displayed, text, charDelay, onComplete]);

  return (
    <p
      style={{
        fontSize: "clamp(16px, 2.2vw, 22px)",
        fontWeight: 600,
        fontStyle: "italic",
        color: "#1A3B11",
        letterSpacing: "0.01em",
        minHeight: 36,
        lineHeight: 1.6,
        textShadow: "0 1px 2px rgba(255,255,255,0.9)",
      }}
    >
      {displayed}
      {started && displayed.length < text.length && (
        <span
          className="cv-verd-cursor"
          style={{
            display: "inline-block",
            width: 2.5,
            height: "1.1em",
            backgroundColor: "#2D5016",
            marginLeft: 1,
            verticalAlign: "text-bottom",
            boxShadow: "0 0 6px rgba(45,80,22,0.4)",
          }}
        />
      )}
    </p>
  );
}

/* ─── Cursor Glow ─── */
function CursorGlow({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  return (
    <motion.div
      style={{
        position: "fixed",
        width: 180,
        height: 180,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(244,168,50,0.14) 0%, rgba(123,198,126,0.10) 45%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 50,
        x: springX,
        y: springY,
      }}
    />
  );
}

/* ═══════════════════════════════════════
   Main Landing Page
   ═══════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<"primary" | "secondary" | null>(null);
  const [idleMode, setIdleMode] = useState(false);
  const [wipeOrigin, setWipeOrigin] = useState("50% 50%");
  
  const { worldState, memoryBook } = useSessionStore();
  const planetMood = worldState?.planetMood;
  const showNav = memoryBook.stories.length > 0 || memoryBook.receipts.length > 0;

  // Shared mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const titleParallaxX = useMotionValue(0);
  const pillParallaxY = useMotionValue(0);
  
  // Magnetic button values
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const primaryMagneticX = useMotionValue(0);
  const primaryMagneticY = useMotionValue(0);
  const springMagX = useSpring(primaryMagneticX, { stiffness: 150, damping: 18 });
  const springMagY = useSpring(primaryMagneticY, { stiffness: 150, damping: 18 });

  const lastMouseMoveTime = useRef<number>(0);

  useEffect(() => {
    lastMouseMoveTime.current = Date.now();
    const handleMove = (e: MouseEvent) => {
      // Glow coords (-90 to center 180px circle)
      mouseX.set(e.clientX - 90);
      mouseY.set(e.clientY - 90);

      const mouseX_normalized = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY_normalized = (e.clientY / window.innerHeight - 0.5) * 2;
      titleParallaxX.set(mouseX_normalized * 4);
      pillParallaxY.set(mouseY_normalized * -2);
      
      lastMouseMoveTime.current = Date.now();
      setIdleMode(false); // Reset idle immediately on move

      if (primaryButtonRef.current) {
        const rect = primaryButtonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        if (dist < 80) {
          primaryMagneticX.set(Math.max(-6, Math.min(6, (e.clientX - centerX) * 0.15)));
          primaryMagneticY.set(Math.max(-6, Math.min(6, (e.clientY - centerY) * 0.15)));
        } else {
          primaryMagneticX.set(0);
          primaryMagneticY.set(0);
        }
      }
    };
    
    window.addEventListener("mousemove", handleMove);
    
    const idleCheck = setInterval(() => {
      if (Date.now() - lastMouseMoveTime.current > 4000) {
        setIdleMode(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      clearInterval(idleCheck);
    };
  }, [mouseX, mouseY, titleParallaxX, pillParallaxY, primaryMagneticX, primaryMagneticY]);

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterDone(true);
  }, []);
  
  const getGlowColor = () => {
    if (planetMood === "Thriving") return "rgba(74, 175, 80, 0.4)";
    if (planetMood === "Under Stress") return "rgba(244, 168, 50, 0.4)";
    if (planetMood === "Recovering") return "rgba(168, 213, 120, 0.4)";
    return "rgba(244, 168, 50, 0.4)"; // default fallback matching original orange-green
  };

  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        height: "100vh",
      }}
    >
      {/* Background world */}
      <LandingWorld />

      {/* Top right navigation */}
      {showNav && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            top: 24, right: 24,
            zIndex: 50,
            display: "flex",
            gap: 12
          }}
        >
          <button
            onClick={() => router.push("/memory")}
            className="px-4 py-2 rounded-xl font-semibold cursor-pointer shadow-sm transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(184,212,168,0.6)",
              color: "#2D5016",
            }}
          >
            📖 Memory
          </button>
          <button
            onClick={() => router.push("/badges")}
            className="px-4 py-2 rounded-xl font-semibold cursor-pointer shadow-sm transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(184,212,168,0.6)",
              color: "#2D5016",
            }}
          >
            🏆 Badges
          </button>
        </motion.div>
      )}

      {/* Foreground content */}
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "150px",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column", 
          alignItems: "center",
          textAlign: "center",
          maxWidth: 600,
          padding: "0 24px",
          gap: 0,
        }}>
        {/* Verd + greeting row */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.1,
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="flex items-center gap-3 mt-4 mb-6"
          style={{ pointerEvents: "auto" }}
        >
          <VerdOrb size={56} />
          <motion.span
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: idleMode ? [1, 0.92, 1] : 1, x: 0 }}
            transition={{
              x: { delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] },
              opacity: idleMode 
                ? { duration: 4, ease: "easeInOut", repeat: Infinity, delay: 3 }
                : { delay: 0.3, duration: 0.5, ease: [0.23, 1, 0.32, 1] }
            }}
            className="text-sm font-medium px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid #B8D4A8",
              color: "#4A7C2F",
              y: pillParallaxY,
            }}
          >
            Meet Verd, your Carbon Guide 🌱
          </motion.span>
        </motion.div>

        {/* Main title */}
        <motion.div
          animate={{ scale: [1, 1.008, 1] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          style={{ display: "inline-block", x: titleParallaxX }}
        >
          <motion.h1
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 180,
              damping: 22,
            }}
            viewport={{ once: true }}
            style={{
              fontSize: "clamp(52px, 9vw, 96px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              background:
                "linear-gradient(135deg, #2D5016 0%, #4A7C2F 40%, #F4A832 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 2px 8px rgba(45,80,22,0.15))",
            }}
          >
            CarbonVerse
          </motion.h1>
        </motion.div>

        {/* Subtitle — typewriter */}
        <motion.div 
          className="mt-4 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          <TypewriterText
            text="Every choice you make today shapes tomorrow's world."
            startDelay={800}
            charDelay={22}
            onComplete={handleTypewriterComplete}
          />
        </motion.div>

        {/* Verd's intro message */}
        <AnimatePresence>
          {typewriterDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="mt-6 max-w-md glass-panel p-5 rounded-2xl text-sm leading-relaxed font-medium"
              style={{ color: "#2D5016" }}
            >
              &ldquo;Ready to begin? I&apos;ll be right here 🌿&rdquo;
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-5 mt-10"
          style={{ pointerEvents: "auto" }}
        >
          {/* Primary CTA */}
          <motion.div
            style={{
              position: "relative",
              x: springMagX,
              y: springMagY,
              zIndex: hoveredButton === "primary" ? 10 : 1,
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: hoveredButton === "secondary" ? 0.65 : 1,
              scale: hoveredButton === "secondary" ? 0.98 : (idleMode ? [1, 1.015, 1] : 1)
            }}
            transition={{
              delay: 1.95,
              duration: hoveredButton === "secondary" ? 0.25 : 0.5,
              ease: hoveredButton === "secondary" ? undefined : [0.23, 1, 0.32, 1],
              ...(idleMode && hoveredButton !== "secondary" && {
                 scale: { duration: 2.5, ease: "easeInOut", repeat: Infinity }
              })
            }}
          >
            {/* Soft Glow Behind */}
            <motion.div
              style={{
                position: "absolute",
                inset: "-12px",
                borderRadius: "1rem",
                zIndex: 0,
                filter: "blur(16px)",
                opacity: 0.6,
              }}
              animate={{
                background: [
                  `linear-gradient(135deg, #4A7C2F 0%, ${getGlowColor()} 100%)`,
                  `linear-gradient(135deg, #2D5016 0%, ${getGlowColor()} 100%)`,
                  `linear-gradient(135deg, #4A7C2F 0%, ${getGlowColor()} 100%)`,
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.button
              ref={primaryButtonRef}
              onHoverStart={() => setHoveredButton("primary")}
              onHoverEnd={() => setHoveredButton(null)}
              whileTap={{ y: 2, boxShadow: "0 1px 4px rgba(74,124,47,0.25)" }}
              onClick={() => router.push("/story")}
              className="relative px-7 py-3.5 rounded-2xl font-semibold text-base text-white cursor-pointer border-none"
              style={{
                background: "linear-gradient(135deg, #4A7C2F 0%, #F4A832 100%)",
                boxShadow: "0 6px 20px rgba(74,124,47,0.35)",
                zIndex: 1,
                minWidth: "230px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Mask container: fixed size, clips overflow */}
              <span
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  height: "1.4em",
                  overflow: "hidden",
                  textAlign: "center",
                }}
              >
                <motion.span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    textAlign: "center",
                    display: "block",
                  }}
                  animate={{ y: hoveredButton === "primary" ? "-100%" : 0 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                  ✨ Begin My Story
                </motion.span>
                <motion.span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    textAlign: "center",
                    display: "block",
                  }}
                  initial={{ y: "100%" }}
                  animate={{ y: hoveredButton === "primary" ? 0 : "100%" }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                  → Let&apos;s go
                </motion.span>
              </span>
            </motion.button>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            style={{ position: "relative" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: hoveredButton === "primary" ? 0.65 : 1,
              scale: hoveredButton === "primary" ? 0.98 : 1
            }}
            transition={{
              delay: 2.03,
              duration: hoveredButton === "primary" ? 0.25 : 0.5,
              ease: hoveredButton === "primary" ? undefined : [0.23, 1, 0.32, 1],
            }}
          >
            {/* Border Drawing */}
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "1rem", 
                border: "2px solid #4A7C2F",
                zIndex: 1,
                pointerEvents: "none",
              }}
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: hoveredButton === "secondary" ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onHoverStart={(e) => {
                const target = e.target as HTMLElement;
                const button = target.closest('button');
                if (button) {
                  const rect = button.getBoundingClientRect();
                  setWipeOrigin(`${e.clientX - rect.left}px ${e.clientY - rect.top}px`);
                }
                setHoveredButton("secondary");
              }}
              onHoverEnd={() => setHoveredButton(null)}
              onClick={() => router.push("/detective")}
              className="px-7 py-3.5 rounded-2xl font-medium text-base cursor-pointer relative overflow-hidden block"
              style={{
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "2px solid #B8D4A8",
                color: "#2D5016",
                boxShadow: "0 2px 12px rgba(45,80,22,0.1)",
                zIndex: 2,
              }}
            >
              {/* Wipe background */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "inherit",
                  background: "rgba(74, 124, 47, 0.12)",
                  transformOrigin: wipeOrigin,
                  zIndex: 0,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: hoveredButton === "secondary" ? 3 : 0,
                  opacity: hoveredButton === "secondary" ? 1 : 0
                }}
                transition={{ duration: 0.4 }}
              />
              <span style={{ position: "relative", zIndex: 1 }}>🔍 Analyze Receipt</span>
            </motion.button>
          </motion.div>
        </div>


        </div>
      </div>

      {/* Cursor glow trail */}
      <CursorGlow mouseX={mouseX} mouseY={mouseY} />
    </main>
  );
}