"use client";

import MemoryGarden from "@/components/story/MemoryGarden";
import LandingWorld from "@/components/world/LandingWorld";
import MemoryBookButton from "@/components/ui/MemoryBookButton";

export default function GardenPage() {
  return (
    <main style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
      <LandingWorld />
      <div 
        style={{
          position: "absolute", 
          inset: 0, 
          zIndex: 20,
          scrollbarWidth: "none",
          padding: "24px 16px"
        }} 
        className="garden-scroll-container"
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
          
          /* Handle vertical height constraints: */
          @media (min-height: 820px) {
            .garden-scroll-container {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              overflow-y: hidden !important;
            }
          }
          @media (max-height: 819px) {
            .garden-scroll-container {
              display: block !important;
              overflow-y: auto !important;
              /* Generous bottom padding when scrollable so the border never clips */
              padding-bottom: 48px !important;
            }
          }
        `}</style>
        <MemoryGarden />
      </div>
      <MemoryBookButton />
    </main>
  );
}
