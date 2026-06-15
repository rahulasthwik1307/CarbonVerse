"use client";

import MemoryGarden from "@/components/story/MemoryGarden";
import LandingWorld from "@/components/world/LandingWorld";
import MemoryBookButton from "@/components/ui/MemoryBookButton";

export default function GardenPage() {
  return (
    <main style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <LandingWorld />
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        overflowY: "auto", scrollbarWidth: "none",
        padding: "24px 16px 64px"
      }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        <MemoryGarden />
      </div>
      <MemoryBookButton />
    </main>
  );
}
