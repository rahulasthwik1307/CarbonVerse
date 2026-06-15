"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useSessionStore } from "@/lib/session-store";

/**
 * WorldFeedback — an overlay that shows Lottie reactions after each choice.
 * Derives lastImpact from the most recent decision in the Zustand store.
 * Renders between LandingWorld (z:0) and the chapter UI (z:20).
 */
export default function WorldFeedback() {
  const decisions = useSessionStore((s) => s.decisions);
  const [lastImpact, setLastImpact] = useState<"eco" | "moderate" | "high" | null>(null);
  const [showButterfly, setShowButterfly] = useState(false);
  const [showLeaves, setShowLeaves] = useState(false);
  const [showWind, setShowWind] = useState(false);
  const [brightnessShift, setBrightnessShift] = useState(0); // positive = brighter, negative = dimmer
  const prevDecisionCount = useRef(decisions.length);

  // Detect new decisions by watching array length
  useEffect(() => {
    if (decisions.length > prevDecisionCount.current) {
      const newest = decisions[decisions.length - 1];
      setLastImpact(newest.impactType);
      prevDecisionCount.current = decisions.length;
    }
  }, [decisions]);

  // Trigger appropriate reactions when lastImpact changes
  useEffect(() => {
    if (!lastImpact) return;

    if (lastImpact === "eco") {
      // Butterfly + leaves + brightness
      setShowButterfly(true);
      setShowLeaves(true);
      setBrightnessShift(1);

      const bTimer = setTimeout(() => setShowButterfly(false), 4000);
      const lTimer = setTimeout(() => setShowLeaves(false), 3500);
      const brTimer = setTimeout(() => setBrightnessShift(0), 3000);

      return () => {
        clearTimeout(bTimer);
        clearTimeout(lTimer);
        clearTimeout(brTimer);
      };
    }

    if (lastImpact === "high") {
      // Wind swirl + dim
      setShowWind(true);
      setBrightnessShift(-1);

      const wTimer = setTimeout(() => setShowWind(false), 2800);
      const brTimer = setTimeout(() => setBrightnessShift(0), 2500);

      return () => {
        clearTimeout(wTimer);
        clearTimeout(brTimer);
      };
    }

    // Moderate — no special reactions
    setLastImpact(null);
  }, [lastImpact]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Brightness/dim overlay */}
      <AnimatePresence>
        {brightnessShift !== 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor:
                brightnessShift > 0
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Butterfly — eco reaction */}
      <AnimatePresence>
        {showButterfly && (
          <motion.div
            initial={{ opacity: 0, x: "40vw", y: "60vh", scale: 0.6 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: ["40vw", "55vw", "65vw", "80vw"],
              y: ["60vh", "45vh", "35vh", "25vh"],
              scale: [0.6, 0.9, 1, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 80,
              height: 80,
            }}
          >
            <DotLottieReact
              src="/lottie/butterfly.json"
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaves — eco reaction */}
      <AnimatePresence>
        {showLeaves && (
          <motion.div
            initial={{ opacity: 0, x: "-5vw", y: "-5vh" }}
            animate={{
              opacity: [0, 0.7, 0.7, 0],
              x: ["-5vw", "15vw", "30vw", "45vw"],
              y: ["-5vh", "20vh", "40vh", "60vh"],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
            style={{
              position: "absolute",
              width: 120,
              height: 120,
            }}
          >
            <DotLottieReact
              src="/lottie/leaves.json"
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wind swirl — high-impact reaction */}
      <AnimatePresence>
        {showWind && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.6, 0.6, 0],
              scale: [0.5, 1, 1.1, 0.8],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 150,
              height: 150,
            }}
          >
            <DotLottieReact
              src="/lottie/wind_swirl.json"
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
