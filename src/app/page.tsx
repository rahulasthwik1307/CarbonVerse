"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import LandingWorld from "@/components/world/LandingWorld";
import VerdOrb from "@/components/ui/VerdOrb";

/* ─── Typewriter ─── */
function TypewriterText({
  text,
  startDelay = 1000,
  charDelay = 35,
  onComplete,
}: {
  text: string;
  startDelay?: number;
  charDelay?: number;
  onComplete?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(timeout);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onComplete?.();
      return;
    }
    const timeout = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, charDelay);
    return () => clearTimeout(timeout);
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
        textShadow: "0 0 12px rgba(255,255,255,0.8), 0 1px 3px rgba(255,255,255,1)",
      }}
    >
      {displayed}
      {started && displayed.length < text.length && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            backgroundColor: "#6B8F5E",
            marginLeft: 2,
            animation: "cv-verd-pulse 0.8s ease-in-out infinite",
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </p>
  );
}

/* ─── Shimmer button inner ─── */
function ShimmerEffect({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
            borderRadius: "inherit",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─── Cursor Glow ─── */
function CursorGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 75);
      mouseY.set(e.clientY - 75);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{
        position: "fixed",
        width: 150,
        height: 150,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(244,168,50,0.06) 0%, rgba(123,198,126,0.04) 45%, transparent 70%)",
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
  const [shimmerActive, setShimmerActive] = useState(false);

  const handleTypewriterComplete = useCallback(() => {
    setTypewriterDone(true);
  }, []);

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
            delay: 0.3,
            duration: 0.6,
            ease: [0.23, 1, 0.32, 1],
          }}
          className="flex items-center gap-3 mb-6"
          style={{ pointerEvents: "auto" }}
        >
          <VerdOrb size={56} />
          <span
            className="text-sm font-medium px-4 py-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid #B8D4A8",
              color: "#4A7C2F",
            }}
          >
            Meet Verd, your Carbon Guide 🌱
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
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

        {/* Subtitle — typewriter */}
        <div className="mt-4 max-w-lg">
          <TypewriterText
            text="Every choice you make today shapes tomorrow's world."
            startDelay={1000}
            charDelay={35}
            onComplete={handleTypewriterComplete}
          />
        </div>

        {/* Verd's intro message */}
        <AnimatePresence>
          {typewriterDone && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="mt-6 max-w-md glass-panel p-5 rounded-2xl text-sm leading-relaxed font-medium"
              style={{ color: "#2D5016" }}
            >
              &ldquo;Hi! I&apos;m Verd 🌿 I won&apos;t judge your choices — I&apos;ll
              just show you how today&apos;s decisions shape tomorrow&apos;s
              world.&rdquo;
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-5 mt-10"
          style={{ pointerEvents: "auto" }}
        >
          {/* Primary CTA */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 1.8,
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/story")}
            onHoverStart={() => setShimmerActive(true)}
            onHoverEnd={() => setShimmerActive(false)}
            className="relative overflow-hidden px-8 py-4 rounded-2xl font-semibold text-lg text-white cursor-pointer outline-none border-none"
            style={{
              background:
                "linear-gradient(135deg, #4A7C2F 0%, #F4A832 100%)",
              boxShadow: "0 4px 20px rgba(74,124,47,0.35)",
            }}
          >
            <ShimmerEffect active={shimmerActive} />
            <span className="relative z-10">✨ Begin My Story</span>
          </motion.button>

          {/* Secondary CTA */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 2.0,
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
            }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/story")}
            className="px-8 py-4 rounded-2xl font-medium text-lg cursor-pointer outline-none"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "2px solid #B8D4A8",
              color: "#2D5016",
              boxShadow: "0 2px 12px rgba(45,80,22,0.1)",
            }}
          >
            👀 See Demo
          </motion.button>
        </div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: 2.8, duration: 0.6 }}
          className="mt-8 text-sm font-medium tracking-wide"
          style={{ color: "#2D5016" }}
        >
          No sign-in required · Your story, your choices
        </motion.p>
        </div>
      </div>

      {/* Cursor glow trail */}
      <CursorGlow />
    </main>
  );
}
