"use client";
 
import FutureSimulator from "@/components/story/FutureSimulator";
import MemoryBookButton from "@/components/ui/MemoryBookButton";
import { motion } from "framer-motion";
 
export default function FuturePage() {
  return (
    <main style={{ 
      position: "fixed", 
      inset: 0, 
      overflow: "hidden", 
      background: "#FFF8E7", 
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" 
    }}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        style={{
          position: "absolute", 
          inset: 0, 
          zIndex: 20,
          overflowY: "auto", 
          scrollbarWidth: "none",
          padding: "40px 24px"
        }}
      >
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FutureSimulator />
        </div>
      </motion.div>
      <MemoryBookButton />
    </main>
  );
}

