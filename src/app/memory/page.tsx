"use client"
import MemoryBook from "@/components/memory/MemoryBook"
import LandingWorld from "@/components/world/LandingWorld"
import MemoryBookButton from "@/components/ui/MemoryBookButton"
import { Suspense } from "react";

export default function MemoryPage() {
  return (
    <main style={{position:"fixed",inset:0,overflow:"hidden"}}>
      <LandingWorld />
      <div style={{
        position:"absolute",inset:0,zIndex:20,
        overflowY:"auto",scrollbarWidth:"none",
        padding:"24px 16px 80px"
      }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>
        <Suspense fallback={<div />}>
          <MemoryBook />
        </Suspense>
      </div>
      <MemoryBookButton />
    </main>
  );
}
