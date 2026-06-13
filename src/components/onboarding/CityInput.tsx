"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CityInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function CityInput({ value, onChange, onSubmit }: CityInputProps) {
  return (
    <div className="glass-panel" style={{ padding: 24, borderRadius: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#6B8F5E", marginBottom: 12 }}>
        🌍 Where does your story begin?
      </div>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.length > 2) {
            onSubmit();
          }
        }}
        placeholder="Enter your city..."
        style={{
          width: "100%",
          padding: "14px 18px",
          borderRadius: 14,
          border: "2px solid #B8D4A8",
          background: "rgba(255,255,255,0.9)",
          fontSize: 18,
          fontWeight: 500,
          color: "#2D5016",
          outline: "none",
          transition: "all 0.2s ease-in-out",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4CAF50";
          e.target.style.boxShadow = "0 0 0 4px rgba(76,175,80,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#B8D4A8";
          e.target.style.boxShadow = "none";
        }}
      />

      <AnimatePresence>
        {value.length > 2 && (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSubmit}
            style={{
              marginTop: 16,
              width: "100%",
              height: 52,
              borderRadius: 12,
              background: "linear-gradient(135deg, #4A7C2F, #F4A832)",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
            }}
          >
            Let&apos;s begin →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
