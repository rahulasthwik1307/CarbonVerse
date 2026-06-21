"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "./VerdOrb";

/**
 * HydrationGuard prevents rendering children until Zustand's
 * persist middleware has finished rehydrating from localStorage.
 * Shows a premium storybook-style loading state during hydration.
 */
export default function HydrationGuard({ children }: { children: ReactNode }) {
  const hasHydrated = useSessionStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "#FFF8E7",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Floating Verd */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <VerdOrb size={72} />
        </motion.div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            marginTop: 24,
            fontSize: 18,
            fontWeight: 700,
            color: "#2D5016",
            letterSpacing: "-0.01em",
          }}
        >
          Opening your storybook...
        </motion.p>

        {/* Shimmer bar */}
        <div
          style={{
            width: 160,
            height: 4,
            background: "#E8F5E3",
            borderRadius: 2,
            marginTop: 16,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, #F4A832, transparent)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
