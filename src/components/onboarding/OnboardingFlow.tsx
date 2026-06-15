"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import CityInput from "./CityInput";
import VerdOrb from "../ui/VerdOrb";

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [localCity, setLocalCity] = useState("");
  
  const { setCity, completeOnboarding } = useSessionStore();

  const handleCitySubmit = () => {
    if (localCity.trim().length < 2) return;
    setCity(localCity.trim());
    setStep(1);
    completeOnboarding();
    setTimeout(() => {
      router.push("/story/chapter");
    }, 800);
  };

  const getMessage = () => {
    if (step === 0) return "Hi! I'm Verd 🌿 Which city is your home?\nI'll personalize your carbon story!";
    return `Perfect! Let's begin your story in ${localCity.trim()}! ✨`;
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      zIndex: 30,
    }}>
      <motion.div
        layout
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: 32,
          borderRadius: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px rgba(45, 80, 22, 0.1)",
        }}
      >
        {/* Top: Verd + Message */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: step === 0 ? 32 : 0, width: "100%" }}>
          <motion.div animate={step === 1 ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4, repeat: step === 1 ? 1 : 0 }}>
            <VerdOrb size={48} />
          </motion.div>
          <div style={{ flex: 1, position: "relative", minHeight: 48, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#2D5016",
                  position: "absolute",
                  width: "100%",
                  whiteSpace: "pre-line"
                }}
              >
                &ldquo;{getMessage()}&rdquo;
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Middle: Content */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ width: "100%" }}>
              <CityInput value={localCity} onChange={setLocalCity} onSubmit={handleCitySubmit} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
