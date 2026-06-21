"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "@/lib/session-store";

/**
 * WorldFeedback — an overlay that shows ambient reactions after each choice.
 * Interaction-specific animations (leaves, butterfly, wind) now happen on the ChoiceCard itself.
 */
export default function WorldFeedback() {
  const decisions = useSessionStore((s) => s.decisions);
  const [lastImpact, setLastImpact] = useState<"eco" | "moderate" | "high" | null>(null);
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

    const timer = setTimeout(() => {
      if (lastImpact === "eco") {
        setBrightnessShift(1);
        const brTimer = setTimeout(() => setBrightnessShift(0), 3000);
        return () => clearTimeout(brTimer);
      }

      if (lastImpact === "high") {
        setBrightnessShift(-1);
        const brTimer = setTimeout(() => setBrightnessShift(0), 2500);
        return () => clearTimeout(brTimer);
      }

      // Moderate — no special reactions
      setLastImpact(null);
    }, 0);

    return () => clearTimeout(timer);
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
    </div>
  );
}
