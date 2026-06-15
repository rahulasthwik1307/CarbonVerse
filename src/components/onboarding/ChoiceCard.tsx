"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChoiceCardProps {
  emoji: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  aqiBadge?: "recommended" | "warning" | "danger" | null;
  aqiLabel?: string;
}

export default function ChoiceCard({ emoji, label, description, isSelected, onClick, aqiBadge, aqiLabel }: ChoiceCardProps) {
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setShowRipple(true);
    onClick();
    setTimeout(() => setShowRipple(false), 500);
  };

  const isRecommended = aqiBadge === "recommended";
  const isDanger = aqiBadge === "danger";
  const isWarning = aqiBadge === "warning";

  // --- Border colors ---
  const borderColor = isSelected
    ? (isRecommended ? "#4CAF50" : isDanger ? "#D4845A" : isWarning ? "#D4A04A" : "#4CAF50")
    : (isRecommended ? "rgba(76,175,80,0.45)"
      : isDanger ? "rgba(210,132,90,0.35)"
      : isWarning ? "rgba(212,160,74,0.35)"
      : "rgba(184,212,168,0.5)");

  // --- Shadows ---
  const restShadow = isRecommended
    ? "0 2px 12px rgba(76,175,80,0.1)"
    : "0 2px 10px rgba(45,80,22,0.05)";

  const hoverShadow = isRecommended
    ? "0 6px 20px rgba(76,175,80,0.15)"
    : "0 6px 18px rgba(45,80,22,0.1)";

  // --- Background ---
  const bgColor = isSelected
    ? (isDanger ? "rgba(210,132,90,0.04)" : isWarning ? "rgba(212,160,74,0.04)" : "#F0FAF0")
    : "#FFFFFF";

  // --- Ripple color ---
  const rippleColor = isDanger
    ? "rgba(210,132,90,0.25)"
    : isWarning
      ? "rgba(212,160,74,0.25)"
      : "rgba(76,175,80,0.2)";

  // --- Warning/danger badge styles ---
  const getBadgeStyles = () => {
    if (isWarning) {
      return {
        bg: "rgba(212,160,74,0.1)",
        border: "1px solid rgba(212,160,74,0.25)",
        color: "#8B6914",
      };
    }
    if (isDanger) {
      return {
        bg: "rgba(210,132,90,0.08)",
        border: "1px solid rgba(210,132,90,0.25)",
        color: "#8B4A2A",
      };
    }
    return null;
  };

  const badgeStyles = getBadgeStyles();

  return (
    <motion.div
      onClick={handleClick}
      initial={{ y: 16, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        borderColor: borderColor,
        backgroundColor: bgColor,
        boxShadow: isSelected ? hoverShadow : restShadow,
      }}
      whileHover={{
        y: -2,
        scale: 1.01,
        boxShadow: hoverShadow,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 28,
      }}
      style={{
        position: "relative",
        borderRadius: 20,
        border: isRecommended ? "1.5px solid" : "1px solid",
        padding: "12px 16px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* Ripple on click */}
      <AnimatePresence>
        {showRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            style={{
              position: "absolute",
              left: ripplePos.x - 80,
              top: ripplePos.y - 80,
              width: 160,
              height: 160,
              backgroundColor: rippleColor,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Gentle floating for recommended only — translateY only, no opacity */}
      {isRecommended && !isSelected && (
        <motion.div
          animate={{ y: [-1, 1, -1] }}
          transition={{
            repeat: Infinity,
            duration: 3.5,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: 20,
            boxShadow: "0 0 0 0.5px rgba(76,175,80,0.08)",
          }}
        />
      )}

      {/* 🌿 Verd Recommends pill — centered capsule */}
      {isRecommended && (
        <div
          style={{
            background: "rgba(76,175,80,0.1)",
            color: "#2D7A1F",
            padding: "3px 14px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 8,
            border: "1px solid rgba(76,175,80,0.2)",
            letterSpacing: "0.01em",
          }}
        >
          🌿 Verd Recommends
        </div>
      )}

      {/* Emoji — smaller, centered, bounce only on select */}
      <motion.div
        animate={isSelected ? { scale: [1, 1.12, 1] } : {}}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{ fontSize: 28, marginBottom: 4, lineHeight: 1 }}
      >
        {emoji}
      </motion.div>

      {/* Title */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#2D5016", marginBottom: 2 }}>
        {label}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12.5,
        fontWeight: 400,
        color: "#6B8F5E",
        lineHeight: 1.4,
        marginBottom: (aqiBadge && !isRecommended && badgeStyles) ? 6 : 0,
      }}>
        {description}
      </div>

      {/* Warning/Danger badge — centered */}
      {!isRecommended && aqiBadge && aqiLabel && badgeStyles && (
        <div style={{
          background: badgeStyles.bg,
          border: badgeStyles.border,
          color: badgeStyles.color,
          fontSize: 10.5,
          fontWeight: 500,
          padding: "3px 10px",
          borderRadius: 999,
          marginTop: 2,
        }}>
          {aqiLabel}
        </div>
      )}
    </motion.div>
  );
}

