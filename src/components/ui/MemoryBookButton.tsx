"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isMemoryActive = pathname === "/memory";
  const isBadgesActive = pathname === "/achievements";

  // On story pages, use a compact icon-only mode so the nav
  // never overlaps choice cards, sliders, or CTAs.
  const isStoryPage = pathname?.startsWith("/story");

  const handleLogout = async () => {
    await playSound("logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("carbonverse-session-storage");
      sessionStorage.removeItem("carbonverse-session-storage");
      window.location.href = "/";
    }
  };

  // Pill items definition for DRY rendering
  const items = [
    {
      id: "memory",
      emoji: "📖",
      label: "Memory",
      isActive: isMemoryActive,
      onClick: () => {
        if (!isMemoryActive) {
          playSound("click");
          router.push("/memory");
        }
      },
      activeColor: "rgba(76, 175, 80, 0.12)",
      activeBorder: "rgba(76, 175, 80, 0.5)",
      activeTextColor: "#2E7D32",
      activeGlow: "0 0 10px rgba(76, 175, 80, 0.15)",
    },
    {
      id: "badges",
      emoji: "🏆",
      label: "Badges",
      isActive: isBadgesActive,
      onClick: () => {
        if (!isBadgesActive) {
          playSound("click");
          router.push("/achievements");
        }
      },
      activeColor: "rgba(244, 168, 50, 0.12)",
      activeBorder: "rgba(244, 168, 50, 0.5)",
      activeTextColor: "#B26A00",
      activeGlow: "0 0 10px rgba(244, 168, 50, 0.15)",
    },
  ];

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: 0.2 }}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: isStoryPage ? 4 : 8,
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1.5px solid rgba(184, 212, 168, 0.6)",
        borderRadius: 999,
        padding: isStoryPage ? "5px 8px" : "6px 12px",
        boxShadow: "0 4px 20px rgba(45, 80, 22, 0.14)",
        transition: "padding 200ms ease-out",
      }}
    >
      {items.map((item) => (
        <motion.button
          key={item.id}
          whileHover={!item.isActive ? { scale: 1.06 } : {}}
          whileTap={!item.isActive ? { scale: 0.94 } : {}}
          onHoverStart={() => setHoveredItem(item.id)}
          onHoverEnd={() => setHoveredItem(null)}
          onClick={item.onClick}
          style={{
            background: item.isActive ? item.activeColor : "transparent",
            border: item.isActive
              ? `1.5px solid ${item.activeBorder}`
              : "1.5px solid transparent",
            borderRadius: 999,
            padding: isStoryPage ? "6px 8px" : "8px 16px",
            fontSize: 13,
            fontWeight: 700,
            color: item.isActive ? item.activeTextColor : "#4A7C2F",
            display: "flex",
            alignItems: "center",
            gap: 0,
            cursor: item.isActive ? "default" : "pointer",
            boxShadow: item.isActive ? item.activeGlow : "none",
            transition: "all 150ms ease-out",
            outline: "none",
            overflow: "hidden",
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          {/* Emoji — always visible */}
          <span style={{ fontSize: 14, lineHeight: 1 }}>{item.emoji}</span>

          {/* Label — shown on non-story pages always, on story pages only on hover */}
          <AnimatePresence>
            {(!isStoryPage || hoveredItem === item.id) && (
              <motion.span
                key={`label-${item.id}`}
                initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                animate={{ width: "auto", opacity: 1, marginLeft: 6 }}
                exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                style={{ display: "inline-block", overflow: "hidden" }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      ))}

      {/* Separator line */}
      <div
        style={{
          width: 1.5,
          height: 16,
          background: "rgba(184, 212, 168, 0.5)",
          margin: isStoryPage ? "0 2px" : "0 4px",
          flexShrink: 0,
        }}
      />

      {/* Logout button */}
      <motion.button
        whileHover={{
          scale: 1.05,
          background: "rgba(255, 255, 255, 0.95)",
          borderColor: "rgba(184, 212, 168, 0.8)",
          color: "#2D5016",
        }}
        whileTap={{ scale: 0.94 }}
        onHoverStart={() => setHoveredItem("logout")}
        onHoverEnd={() => setHoveredItem(null)}
        onClick={handleLogout}
        style={{
          background: "transparent",
          border: "1.5px solid transparent",
          borderRadius: 999,
          padding: isStoryPage ? "6px 8px" : "8px 14px",
          fontSize: 13,
          fontWeight: 700,
          color: "#6B8F5E",
          display: "flex",
          alignItems: "center",
          gap: 0,
          cursor: "pointer",
          transition: "all 150ms ease-out",
          outline: "none",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>🚪</span>
        <AnimatePresence>
          {(!isStoryPage || hoveredItem === "logout") && (
            <motion.span
              key="label-logout"
              initial={{ width: 0, opacity: 0, marginLeft: 0 }}
              animate={{ width: "auto", opacity: 1, marginLeft: 6 }}
              exit={{ width: 0, opacity: 0, marginLeft: 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              style={{ display: "inline-block", overflow: "hidden" }}
            >
              Logout
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
