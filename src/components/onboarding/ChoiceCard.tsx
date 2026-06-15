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

  const handleClick = () => {
    setShowRipple(true);
    onClick();
    setTimeout(() => setShowRipple(false), 400);
  };

  const getBadgeStyles = () => {
    if (aqiBadge === "recommended") {
      return {
        bg: "rgba(76,175,80,0.12)",
        border: "1px solid #4CAF50",
        color: "#2D7A1F",
        fontWeight: 600,
      };
    }
    if (aqiBadge === "warning") {
      return {
        bg: "rgba(244,168,50,0.1)",
        border: "1px solid #F4A832",
        color: "#8B6914",
        fontWeight: 400,
      };
    }
    if (aqiBadge === "danger") {
      return {
        bg: "rgba(255,107,107,0.08)",
        border: "1px solid rgba(255,107,107,0.4)",
        color: "#A0401A",
        fontWeight: 400,
      };
    }
    return null;
  };

  const badgeStyles = getBadgeStyles();

  const defaultBorderColor = aqiBadge === "recommended" ? "rgba(76,175,80,0.4)" 
                           : aqiBadge === "danger" ? "rgba(255,107,107,0.3)" 
                           : "#B8D4A8";

  return (
    <motion.div
      onClick={handleClick}
      initial={{ y: 20, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        borderColor: isSelected ? "#4CAF50" : defaultBorderColor,
        backgroundColor: isSelected ? "#F0FAF0" : "#FFFFFF",
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 12px 32px rgba(45,80,22,0.15)",
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
      style={{
        position: "relative",
        borderRadius: 20,
        border: "2px solid",
        padding: "20px 24px",
        boxShadow: "0 4px 16px rgba(45,80,22,0.08)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {showRipple && (
          <motion.div
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              width: "100%",
              aspectRatio: "1/1",
              backgroundColor: "rgba(76,175,80,0.3)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {aqiBadge === "recommended" && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3, background: "#4CAF50", borderRadius: "4px 0 0 4px"
        }} />
      )}
      {aqiBadge === "danger" && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3, background: "rgba(255,107,107,0.5)", borderRadius: "4px 0 0 4px"
        }} />
      )}

      <motion.div 
        animate={isSelected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{ fontSize: 40, marginBottom: 12 }}
      >
        {emoji}
      </motion.div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#2D5016", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 400, color: "#6B8F5E", marginBottom: aqiBadge ? 12 : 0 }}>
        {description}
      </div>
      
      {aqiBadge && aqiLabel && badgeStyles && (
        <div style={{
          background: badgeStyles.bg,
          border: badgeStyles.border,
          color: badgeStyles.color,
          fontSize: 11,
          fontWeight: badgeStyles.fontWeight || 500,
          padding: "4px 10px",
          borderRadius: 12,
          marginTop: "auto"
        }}>
          {aqiLabel}
        </div>
      )}
    </motion.div>
  );
}
