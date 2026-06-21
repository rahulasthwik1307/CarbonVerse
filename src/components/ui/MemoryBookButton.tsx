"use client";

import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

// Dynamically play custom sound effects using Tone.js
const playSound = async (type: "click" | "logout") => {
  if (typeof window === "undefined") return;
  try {
    const Tone = await import("tone");
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
    const synth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.2, release: 0.4 }
    }).toDestination();

    if (type === "click") {
      synth.triggerAttackRelease("G5", "8n");
    } else if (type === "logout") {
      const now = Tone.now();
      synth.triggerAttackRelease("E5", "8n", now);
      synth.triggerAttackRelease("C5", "4n", now + 0.1);
    }
  } catch (err) {
    console.warn("Tone.js playback failed:", err);
  }
};

export default function MemoryBookButton() {
  const router = useRouter();
  const pathname = usePathname();

  const isMemoryActive = pathname === "/memory";
  const isBadgesActive = pathname === "/achievements";

  const handleLogout = async () => {
    await playSound("logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("carbonverse-session-storage");
      sessionStorage.removeItem("carbonverse-session-storage");
      window.location.href = "/";
    }
  };

  return (
    <motion.div
      initial={{ y: 100, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1.5px solid rgba(184, 212, 168, 0.6)",
        borderRadius: 999,
        padding: "6px 12px",
        boxShadow: "0 10px 30px rgba(45, 80, 22, 0.12)",
      }}
    >
      {/* Memory button */}
      <motion.button
        whileHover={!isMemoryActive ? { scale: 1.05, background: "rgba(255, 255, 255, 0.95)", borderColor: "rgba(184, 212, 168, 0.8)" } : {}}
        whileTap={!isMemoryActive ? { scale: 0.96 } : {}}
        onClick={() => {
          if (!isMemoryActive) {
            playSound("click");
            router.push("/memory");
          }
        }}
        style={{
          background: isMemoryActive ? "rgba(76, 175, 80, 0.12)" : "transparent",
          border: isMemoryActive ? "1.5px solid rgba(76, 175, 80, 0.5)" : "1.5px solid transparent",
          borderRadius: 999,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: isMemoryActive ? "#2E7D32" : "#4A7C2F",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: isMemoryActive ? "default" : "pointer",
          boxShadow: isMemoryActive ? "0 0 10px rgba(76, 175, 80, 0.15)" : "none",
          transition: "all 150ms ease-out",
          outline: "none"
        }}
      >
        <span>📖</span> Memory
      </motion.button>

      {/* Badges button */}
      <motion.button
        whileHover={!isBadgesActive ? { scale: 1.05, background: "rgba(255, 255, 255, 0.95)", borderColor: "rgba(184, 212, 168, 0.8)" } : {}}
        whileTap={!isBadgesActive ? { scale: 0.96 } : {}}
        onClick={() => {
          if (!isBadgesActive) {
            playSound("click");
            router.push("/achievements");
          }
        }}
        style={{
          background: isBadgesActive ? "rgba(244, 168, 50, 0.12)" : "transparent",
          border: isBadgesActive ? "1.5px solid rgba(244, 168, 50, 0.5)" : "1.5px solid transparent",
          borderRadius: 999,
          padding: "8px 16px",
          fontSize: 13,
          fontWeight: 700,
          color: isBadgesActive ? "#B26A00" : "#4A7C2F",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: isBadgesActive ? "default" : "pointer",
          boxShadow: isBadgesActive ? "0 0 10px rgba(244, 168, 50, 0.15)" : "none",
          transition: "all 150ms ease-out",
          outline: "none"
        }}
      >
        <span>🏆</span> Badges
      </motion.button>

      {/* Separator line */}
      <div style={{
        width: 1.5,
        height: 18,
        background: "rgba(184, 212, 168, 0.5)",
        margin: "0 4px"
      }} />

      {/* Logout button */}
      <motion.button
        whileHover={{ scale: 1.05, background: "rgba(255, 255, 255, 0.95)", borderColor: "rgba(184, 212, 168, 0.8)", color: "#2D5016" }}
        whileTap={{ scale: 0.96 }}
        onClick={handleLogout}
        style={{
          background: "transparent",
          border: "1.5px solid transparent",
          borderRadius: 999,
          padding: "8px 14px",
          fontSize: 13,
          fontWeight: 700,
          color: "#6B8F5E",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          transition: "all 150ms ease-out",
          outline: "none"
        }}
      >
        <span>🚪</span> Logout
      </motion.button>
    </motion.div>
  );
}
