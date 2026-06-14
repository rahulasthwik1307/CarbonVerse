"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import CityInput from "./CityInput";
import ChoiceCard from "./ChoiceCard";
import VerdOrb from "../ui/VerdOrb";

const TRANSPORT_CHOICES = [
  { emoji:"🚶", label:"Walk or Cycle", description:"Zero emissions. Pure freedom.", value:"walk" as const },
  { emoji:"🚇", label:"Public Transport", description:"Metro, bus, or train.", value:"public" as const },
  { emoji:"🚗", label:"Car", description:"Private vehicle.", value:"car" as const },
  { emoji:"🛵", label:"Two-Wheeler", description:"Bike or scooter.", value:"bike" as const },
];

const DIET_CHOICES = [
  { emoji:"🥗", label:"Mostly Plants", description:"Vegetarian or vegan diet.", value:"plants" as const },
  { emoji:"🍗", label:"Mix of Everything", description:"Balanced meals.", value:"mixed" as const },
  { emoji:"🥩", label:"Lots of Meat", description:"Meat-heavy meals.", value:"meat" as const },
];

const FLIGHT_CHOICES = [
  { emoji:"✈️", label:"Yes, Recently", description:"One or more flights this year.", value:"recent" as const },
  { emoji:"🏠", label:"Stayed Local", description:"No flights recently.", value:"none" as const },
];

const MESSAGES = [
  "Hi! I'm Verd 🌿 Tell me — which city is your home?",
  "How do you usually get around? 🚗",
  "What's on your plate? 🥗",
  "Have you flown anywhere recently? ✈️",
  "Perfect! Let your story begin... ✨"
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [localCity, setLocalCity] = useState("");
  
  const { profile, setCity, setTransport, setDiet, setFlights, completeOnboarding } = useSessionStore();

  const handleCitySubmit = () => {
    if (localCity.trim().length < 2) return;
    setCity(localCity.trim());
    setStep(1);
  };

  const handleSelect = (type: "transport" | "diet" | "flights", value: string) => {
    if (type === "transport") setTransport(value as any);
    if (type === "diet") setDiet(value as any);
    if (type === "flights") setFlights(value as any);
    
    // Optimistic UI wait 400ms for selection animation
    setTimeout(() => {
      setStep((prev) => (prev + 1) as any);
    }, 400);
  };

  useEffect(() => {
    if (step === 4) {
      completeOnboarding();
      const timer = setTimeout(() => {
        router.push("/story/chapter");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, completeOnboarding, router]);

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
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, width: "100%" }}>
          <motion.div animate={step === 4 ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4, repeat: step === 4 ? 2 : 0 }}>
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
                  width: "100%"
                }}
              >
                &ldquo;{MESSAGES[step]}&rdquo;
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Middle: Content */}
        <div style={{ width: "100%", position: "relative", minHeight: 200 }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CityInput value={localCity} onChange={setLocalCity} onSubmit={handleCitySubmit} />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
              >
                {TRANSPORT_CHOICES.map((c) => (
                  <ChoiceCard key={c.value} {...c} isSelected={profile.transport === c.value} onClick={() => handleSelect("transport", c.value)} />
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {DIET_CHOICES.map((c) => (
                  <ChoiceCard key={c.value} {...c} isSelected={profile.diet === c.value} onClick={() => handleSelect("diet", c.value)} />
                ))}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
              >
                {FLIGHT_CHOICES.map((c) => (
                  <ChoiceCard key={c.value} {...c} isSelected={profile.flights === c.value} onClick={() => handleSelect("flights", c.value)} />
                ))}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 16 }}
              >
                <div style={{ fontSize: 64 }}>✨</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#2D5016", textAlign: "center" }}>Your story begins now...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: Progress Dots */}
        {step < 4 && (
          <div style={{ display: "flex", gap: 8, marginTop: 32 }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                layout
                animate={{
                  backgroundColor: i === step ? "#4CAF50" : "#B8D4A8",
                  scale: i === step ? 1.2 : 1
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
