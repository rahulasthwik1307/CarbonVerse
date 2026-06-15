"use client";

import FutureSimulator from "@/components/story/FutureSimulator"; // Refresh

import LandingWorld from "@/components/world/LandingWorld";

export default function FuturePage() {
  return (
    <main style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <LandingWorld />
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        overflowY: "auto", scrollbarWidth: "none",
        padding: "24px 16px"
      }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        <FutureSimulator />
      </div>
    </main>
  );
}
