"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChoiceCardProps {
  emoji: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  aqiBadge?: "recommended" | "warning" | "danger" | null;
  aqiLabel?: string;
  impactType?: "eco" | "moderate" | "high";
}

export default function ChoiceCard({ emoji, label, description, isSelected, onClick, aqiBadge, aqiLabel, impactType }: ChoiceCardProps) {
  const [showRipple, setShowRipple] = useState(false);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setShowRipple(true);
    setShowParticles(true);
    onClick();
    setTimeout(() => setShowRipple(false), 500);
    setTimeout(() => setShowParticles(false), 1200);
  };

  const isRecommended = aqiBadge === "recommended";
  const isDanger = aqiBadge === "danger";
  const isWarning = aqiBadge === "warning";
  const isEco = impactType === "eco";
  const isHigh = impactType === "high";

  // --- Pre-selection background tints (communicate impact at a glance) ---
  const restBg = isEco
    ? "rgba(232,248,232,0.85)"       // richer mint
    : isHigh
      ? "rgba(255,244,225,0.85)"     // richer warm cream
      : "#FFFFFF";

  const selectedBg = isEco
    ? "rgba(210,242,210,0.95)"       // saturated mint
    : isHigh
      ? "rgba(255,236,205,0.9)"      // saturated warm
      : "rgba(240,250,240,0.85)";

  // --- Border colors ---
  const restBorder = isRecommended
    ? "rgba(76,175,80,0.55)"
    : isDanger
      ? "rgba(210,155,90,0.45)"
      : isWarning
        ? "rgba(200,160,80,0.4)"
        : isEco
          ? "rgba(76,175,80,0.4)"
          : isHigh
            ? "rgba(210,155,90,0.35)"
            : "rgba(184,212,168,0.45)";

  const selectedBorder = isRecommended
    ? "#4CAF50"
    : isDanger
      ? "#C87A50"
      : isWarning
        ? "#C8A040"
        : isEco
          ? "#4CAF50"
          : isHigh
            ? "#C8945A"
            : "#4CAF50";

  // --- Shadows (ambient for eco/high even at rest) ---
  const restShadow = isRecommended
    ? "0 2px 14px rgba(76,175,80,0.12)"
    : isEco
      ? "0 2px 12px rgba(76,175,80,0.1)"
      : isHigh
        ? "0 2px 10px rgba(210,155,90,0.08)"
        : "0 2px 8px rgba(45,80,22,0.04)";

  const hoverShadow = isRecommended
    ? "0 5px 18px rgba(76,175,80,0.14)"
    : "0 5px 16px rgba(45,80,22,0.08)";

  const selectedShadow = isRecommended
    ? "0 4px 20px rgba(76,175,80,0.18)"
    : isHigh
      ? "0 4px 16px rgba(210,145,100,0.12)"
      : "0 4px 16px rgba(45,80,22,0.08)";

  // --- Ripple color ---
  const rippleColor = isHigh
    ? "rgba(210,145,100,0.2)"
    : "rgba(76,175,80,0.18)";

  // --- Selection particles ---
  const [showParticles, setShowParticles] = useState(false);
  const particles = useMemo(() => {
    if (isEco) {
      // Leaf-like particles floating up
      return Array.from({ length: 4 }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * 40,  // % from left
        delay: i * 0.12,
        color: `rgba(76,175,80,${0.3 + Math.random() * 0.3})`,
      }));
    }
    if (isHigh) {
      // Amber dots drifting sideways
      return Array.from({ length: 3 }, (_, i) => ({
        id: i,
        x: 30 + Math.random() * 40,
        delay: i * 0.1,
        color: `rgba(210,155,90,${0.25 + Math.random() * 0.25})`,
      }));
    }
    return [];
  }, [isEco, isHigh]);

  // --- Warning/danger badge styles ---
  const getBadgeStyles = () => {
    if (isWarning) {
      return {
        bg: "rgba(200,160,80,0.1)",
        border: "1px solid rgba(200,160,80,0.25)",
        color: "#8B6914",
      };
    }
    if (isDanger) {
      return {
        bg: "rgba(210,145,100,0.08)",
        border: "1px solid rgba(210,145,100,0.25)",
        color: "#8B4A2A",
      };
    }
    return null;
  };

  const badgeStyles = getBadgeStyles();

  return (
    <motion.div
      onClick={handleClick}
      initial={{ y: 12, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        borderColor: isSelected ? selectedBorder : restBorder,
        backgroundColor: isSelected ? selectedBg : restBg,
        boxShadow: isSelected ? selectedShadow : restShadow,
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
        borderRadius: 18,
        border: (isRecommended || isEco) ? "1.5px solid" : "1px solid",
        padding: "10px 14px",
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

      {/* Selection particles */}
      <AnimatePresence>
        {showParticles && particles.map((p) => (
          <motion.div
            key={`particle-${p.id}`}
            initial={{
              opacity: 0.8,
              x: `${p.x}%`,
              y: "50%",
              scale: 0.6,
            }}
            animate={{
              opacity: 0,
              y: isEco ? "-40%" : "50%",
              x: isEco ? `${p.x}%` : `${p.x + (p.id % 2 === 0 ? 20 : -20)}%`,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              delay: p.delay,
              ease: [0.23, 1, 0.32, 1],
            }}
            style={{
              position: "absolute",
              width: isEco ? 6 : 5,
              height: isEco ? 8 : 5,
              borderRadius: isEco ? "50% 0 50% 50%" : "50%",
              backgroundColor: p.color,
              pointerEvents: "none",
              transform: isEco ? "rotate(45deg)" : undefined,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 🌿 Verd Recommends pill — centered capsule */}
      {isRecommended && (
        <div
          style={{
            background: "rgba(76,175,80,0.1)",
            color: "#2D7A1F",
            padding: "2px 12px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 600,
            marginBottom: 6,
            border: "1px solid rgba(76,175,80,0.2)",
            letterSpacing: "0.01em",
          }}
        >
          🌿 Verd Recommends
        </div>
      )}

      {/* Emoji — centered, bounce only on select */}
      <motion.div
        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{ fontSize: 26, marginBottom: 3, lineHeight: 1 }}
      >
        {emoji}
      </motion.div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#2D5016", marginBottom: 1 }}>
        {label}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12,
        fontWeight: 400,
        color: "#6B8F5E",
        lineHeight: 1.35,
        marginBottom: (aqiBadge && !isRecommended && badgeStyles) ? 4 : 0,
      }}>
        {description}
      </div>

      {/* Warning/Danger badge — centered */}
      {!isRecommended && aqiBadge && aqiLabel && badgeStyles && (
        <div style={{
          background: badgeStyles.bg,
          border: badgeStyles.border,
          color: badgeStyles.color,
          fontSize: 10,
          fontWeight: 500,
          padding: "2px 9px",
          borderRadius: 999,
          marginTop: 2,
        }}>
          {aqiLabel}
        </div>
      )}
    </motion.div>
  );
}

