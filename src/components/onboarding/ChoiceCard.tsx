"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
  const [showParticles, setShowParticles] = useState(false);
  const [showButterfly, setShowButterfly] = useState(false);
  const [showWind, setShowWind] = useState(false);
  const [flashBorder, setFlashBorder] = useState(false);

  const isRecommended = aqiBadge === "recommended";
  const isDanger = aqiBadge === "danger";
  const isWarning = aqiBadge === "warning";
  const isEco = impactType === "eco";
  const isHigh = impactType === "high";
  const isEcoFriendly = isEco || isRecommended;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    
    setShowRipple(true);
    setShowParticles(true);
    setFlashBorder(true);
    
    if (isEcoFriendly) {
      setShowButterfly(true);
    } else if (isHigh) {
      setShowWind(true);
    }

    onClick();
    
    setTimeout(() => setShowRipple(false), 500);
    setTimeout(() => setShowParticles(false), 2000);
    setTimeout(() => setFlashBorder(false), 1000);
    setTimeout(() => setShowButterfly(false), 3000);
    setTimeout(() => setShowWind(false), 2500);
  };

  // --- Pre-selection background tints ---
  const restBg = isEco
    ? "rgba(232,248,232,0.85)"
    : isHigh
      ? "rgba(255,244,225,0.85)"
      : "#FFFFFF";

  const selectedBg = isEco
    ? "rgba(210,242,210,0.95)"
    : isHigh
      ? "rgba(255,236,205,0.9)"
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

  const baseSelectedBorder = isRecommended
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

  const activeBorder = flashBorder 
    ? (isEco ? "#7BC67E" : isHigh ? "#E5A870" : baseSelectedBorder) 
    : baseSelectedBorder;

  // --- Shadows ---
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
  const particles = useMemo(() => {
    if (!showParticles) return [];
    if (isEcoFriendly) {
      // 5-8 Leaf-like particles floating up and outward
      const count = Math.floor(Math.random() * 4) + 5; // 5 to 8
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 20 + Math.random() * 60, // 20% to 80% of card width
        top: 30 + Math.random() * 40, // 30% to 70% of card height
        endX: (Math.random() - 0.5) * 80, // drift sideways by -40px to +40px
        endY: -40 - Math.random() * 60, // drift up by 40px to 100px
        delay: Math.random() * 0.3, // staggered
        color: `rgba(76,175,80,${0.7 + Math.random() * 0.3})`,
        rotation: -60 + Math.random() * 120,
      }));
    }
    if (isHigh) {
      // Amber dots drifting sideways
      return Array.from({ length: 3 }, (_, i) => ({
        id: i,
        left: 40 + Math.random() * 20,
        top: 50,
        endX: 60 + Math.random() * 40,
        endY: (Math.random() - 0.5) * 40,
        delay: i * 0.1,
        color: `rgba(210,155,90,${0.25 + Math.random() * 0.25})`,
        rotation: 0,
      }));
    }
    return [];
  }, [showParticles, isEcoFriendly, isHigh]);

  // --- Butterflies ---
  const butterflies = useMemo(() => {
    if (!showButterfly) return [];
    // 3 to 4 butterflies
    const count = Math.floor(Math.random() * 2) + 3;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80, // 10% to 90% of card width
      top: 30 + Math.random() * 50, // 30% to 80% of card height
      endX: (Math.random() - 0.5) * 100, // horizontal drift -50px to +50px
      endY: -80 - Math.random() * 80, // float upwards 80px to 160px
      delay: Math.random() * 0.4,
      scale: 0.9 + Math.random() * 0.3, // 1.8x to 2.2x original size
      duration: 2.0 + Math.random() * 0.8,
    }));
  }, [showButterfly]);

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
        borderColor: isSelected ? activeBorder : restBorder,
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
        borderColor: { duration: 0.4 },
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
        // overflow must be visible so particles/butterfly can fly out of the card
        overflow: "visible",
      }}
    >
      {/* Ripple mask container */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", overflow: "hidden", pointerEvents: "none" }}>
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
      </div>

      {/* Butterflies — eco reaction */}
      <AnimatePresence>
        {showButterfly && butterflies.map((b) => (
          <motion.div
            key={`butterfly-${b.id}`}
            initial={{ opacity: 0, x: 0, y: 10, scale: 0.4 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: b.endX,
              y: b.endY,
              scale: b.scale,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: b.duration, delay: b.delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: `${b.top}%`,
              left: `${b.left}%`,
              width: 80,
              height: 80,
              marginLeft: -40,
              marginTop: -40,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <DotLottieReact
              src="/lottie/butterfly.json"
              loop
              autoplay
              renderConfig={{ autoResize: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Wind swirl — high impact reaction */}
      <AnimatePresence>
        {showWind && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: "-50%", y: "-50%" }}
            animate={{
              opacity: [0, 0.9, 0.9, 0],
              scale: [0.8, 1.2, 1.1],
              x: "-50%",
              y: "-50%",
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 300,
              height: 300,
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <DotLottieReact
              src="/lottie/wind_swirl.json"
              loop
              autoplay
              renderConfig={{ autoResize: false }}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection particles */}
      <AnimatePresence>
        {showParticles && particles.map((p) => (
          <motion.div
            key={`particle-${p.id}`}
            initial={{
              opacity: 0,
              x: 0,
              y: 0,
              scale: 0.4,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              x: p.endX,
              y: p.endY,
              scale: [0.4, 1, 0.7],
              rotate: p.rotation,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2 + Math.random() * 0.8,
              delay: p.delay,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: isEcoFriendly ? 15 : 5,
              height: isEcoFriendly ? 20 : 5,
              marginLeft: isEcoFriendly ? -7.5 : -2.5,
              marginTop: isEcoFriendly ? -10 : -2.5,
              borderRadius: isEcoFriendly ? "50% 0 50% 50%" : "50%",
              backgroundColor: p.color,
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        ))}
      </AnimatePresence>

      {/* 🌿 Verd Recommends pill */}
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
            position: "relative",
            zIndex: 1,
          }}
        >
          🌿 Verd Recommends
        </div>
      )}

      {/* Emoji */}
      <motion.div
        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        style={{ fontSize: 26, marginBottom: 3, lineHeight: 1, position: "relative", zIndex: 1 }}
      >
        {emoji}
      </motion.div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "#2D5016", marginBottom: 1, position: "relative", zIndex: 1 }}>
        {label}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 12,
        fontWeight: 400,
        color: "#6B8F5E",
        lineHeight: 1.35,
        marginBottom: (aqiBadge && !isRecommended && badgeStyles) ? 4 : 0,
        position: "relative",
        zIndex: 1,
      }}>
        {description}
      </div>

      {/* Warning/Danger badge */}
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
          position: "relative",
          zIndex: 1,
        }}>
          {aqiLabel}
        </div>
      )}
    </motion.div>
  );
}
