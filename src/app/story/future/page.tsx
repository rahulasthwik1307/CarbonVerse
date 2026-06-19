"use client";

import FutureSimulator from "@/components/story/FutureSimulator";
import MemoryBookButton from "@/components/ui/MemoryBookButton";
import { motion } from "framer-motion";


export default function FuturePage() {
  return (
    <main className="future-page-container" style={{
      minHeight: "100vh",
      background: "#FFF8E7",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden",
    }}>
      
      {/* ── SUBTLE BACKGROUND TEXTURE ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(circle, 
          rgba(74,124,47,0.04) 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* ── MAIN CONTENT ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{
          padding: "16px 16px 40px",
          position: "relative", zIndex: 2,
        }}
      >
        <FutureSimulator />
      </motion.div>

      <MemoryBookButton />
    </main>
  );
}
