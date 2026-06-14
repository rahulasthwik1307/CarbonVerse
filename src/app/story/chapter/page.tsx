"use client";

import ChapterView from "@/components/story/ChapterView";
import LandingWorld from "@/components/world/LandingWorld";

export default function ChapterPage() {
  return (
    <main style={{position:"fixed",inset:0,overflow:"hidden"}}>
      <LandingWorld />
      <div style={{
        position:"absolute",inset:0,
        display:"flex",alignItems:"center",
        justifyContent:"center",zIndex:20,
        padding:"24px"
      }}>
        <ChapterView />
      </div>
    </main>
  );
}
