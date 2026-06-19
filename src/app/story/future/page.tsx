"use client";
 
import FutureSimulator from "@/components/story/FutureSimulator";
import MemoryBookButton from "@/components/ui/MemoryBookButton";
import { motion } from "framer-motion";
 
export default function FuturePage() {
  return (
    <main style={{ 
      minHeight: "100vh", 
      background: "#FFF8E7", 
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden"
    }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{
          padding: "32px 20px 48px",
        }}
      >
        
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FutureSimulator />
        </div>
      </motion.div>
      <MemoryBookButton />
    </main>
  );
}


