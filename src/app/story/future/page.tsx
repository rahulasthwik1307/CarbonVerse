"use client";

import FutureSimulator from "@/components/story/FutureSimulator"; // Refresh
import FutureEarth from "@/components/story/FutureEarth";

import LandingWorld from "@/components/world/LandingWorld";
import MemoryBookButton from "@/components/ui/MemoryBookButton";

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
        <div style={{marginTop: 32}}>
          <FutureEarth />
        </div>
      </div>
      <MemoryBookButton />
    </main>
  );
}
