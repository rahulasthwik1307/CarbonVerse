"use client";
import CarbonDetective from "@/components/detective/CarbonDetective";
import LandingWorld from "@/components/world/LandingWorld";
import { motion } from "framer-motion";

export default function DetectivePage() {
  return (
    <main style={{ position:"fixed", inset:0, overflow:"hidden" }}>
      <LandingWorld />
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        overflowY: "auto", scrollbarWidth: "none",
        padding: "80px 16px 80px",
      }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>
        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5, ease:[0.23,1,0.32,1] }}
        >
          <CarbonDetective />
        </motion.div>
      </div>
    </main>
  );
}
