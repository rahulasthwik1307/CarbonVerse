"use client";

import { motion } from "framer-motion";
import LandingWorld from "@/components/world/LandingWorld";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

export default function StoryPage() {
  return (
    <main style={{ position: "fixed", inset: 0, overflow: "hidden", height: "100vh" }}>
      <LandingWorld />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ position: "absolute", zIndex: 20, inset: 0 }}
      >
        <OnboardingFlow />
      </motion.div>
    </main>
  );
}
