"use client";

import LandingWorld from "@/components/world/LandingWorld";
import AchievementsView from "@/components/achievements/AchievementsView";
import MemoryBookButton from "@/components/ui/MemoryBookButton";

export default function AchievementsPage() {
  return (
    <main style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <LandingWorld />
      <div style={{
        position: "absolute", inset: 0, zIndex: 20,
        overflowY: "auto", scrollbarWidth: "none",
        padding: "24px 16px 80px"
      }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>
        <AchievementsView />
      </div>
      <MemoryBookButton />
    </main>
  );
}
