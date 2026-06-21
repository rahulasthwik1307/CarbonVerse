"use client";

import MemoryGarden from "@/components/story/MemoryGarden";
import LandingWorld from "@/components/world/LandingWorld";
import MemoryBookButton from "@/components/ui/MemoryBookButton";
import HydrationGuard from "@/components/ui/HydrationGuard";

export default function GardenPage() {
  return (
    <HydrationGuard>
      <main style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
        <LandingWorld />
        <div 
          style={{
            position: "absolute", 
            inset: 0, 
            zIndex: 20,
            scrollbarWidth: "none",
            padding: "32px 16px 48px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            overflowY: "auto"
          }} 
          className="garden-scroll-container"
        >
          <style>{`
            div::-webkit-scrollbar { display: none; }
            
            /* Desktop and laptop viewports: */
            @media (min-width: 1024px) {
              .garden-scroll-container {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: flex-start !important;
                overflow-y: auto !important;
              }
            }
            /* Smaller responsive layouts: */
            @media (max-width: 1023px) {
              .garden-scroll-container {
                display: block !important;
                overflow-y: auto !important;
                padding-top: 32px !important;
                padding-bottom: 48px !important;
              }
            }
          `}</style>
          <MemoryGarden />
        </div>
        <MemoryBookButton />
      </main>
    </HydrationGuard>
  );
}
