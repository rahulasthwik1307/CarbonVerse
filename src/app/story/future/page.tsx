"use client";
 
import FutureSimulator from "@/components/story/FutureSimulator";
import FutureEarth from "@/components/story/FutureEarth";
import MemoryBookButton from "@/components/ui/MemoryBookButton";
 
export default function FuturePage() {
  return (
    <main style={{ 
      position: "fixed", 
      inset: 0, 
      overflow: "hidden", 
      background: "#FFF8E7", 
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" 
    }}>
      <div style={{
        position: "absolute", 
        inset: 0, 
        zIndex: 20,
        overflowY: "auto", 
        scrollbarWidth: "none",
        padding: "32px 24px"
      }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FutureSimulator />
        </div>
      </div>
      <MemoryBookButton />
    </main>
  );
}
