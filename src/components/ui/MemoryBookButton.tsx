"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function MemoryBookButton() {
  const router = useRouter();

  return (
    <motion.button
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => router.push("/memory")}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 50,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "2px solid #B8D4A8",
        borderRadius: 999,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        color: "#2D5016",
        display: "flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(45,80,22,0.15)"
      }}
    >
      📖 Memory Book
    </motion.button>
  );
}
