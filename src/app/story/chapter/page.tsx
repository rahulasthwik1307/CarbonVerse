"use client";
import ChapterView from "@/components/story/ChapterView";
import LandingWorld from "@/components/world/LandingWorld";
import WorldFeedback from "@/components/world/WorldFeedback";

export default function ChapterPage() {
  return (
    <main style={{ position:"fixed", inset:0, overflow:"hidden" }}>
      <LandingWorld />
      <WorldFeedback />
      <div style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        overflowY: "auto",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "20px 16px 40px",
        // Hide scrollbar visually but allow scroll
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        <ChapterView />
      </div>
    </main>
  );
}
