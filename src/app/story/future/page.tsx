"use client";

import FutureSimulator from "@/components/story/FutureSimulator";
import MemoryBookButton from "@/components/ui/MemoryBookButton";
import LandingWorld from "@/components/world/LandingWorld";
import { motion } from "framer-motion";

export default function FuturePage() {
  return (
    <main className="future-page-container" style={{ position: "fixed", inset: 0, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <LandingWorld />
      
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        overflowY: "auto", scrollbarWidth: "none",
        display: "flex", flexDirection: "column"
      }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>

        {/* ── MAIN CONTENT ── */}
        <motion.div
          className="future-main-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{
            padding: "24px 16px",
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: "1800px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <FutureSimulator />
        </motion.div>
      </div>

      <MemoryBookButton />
    </main>
  );
}
