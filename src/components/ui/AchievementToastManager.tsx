"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/lib/session-store";
import AchievementToast from "./AchievementToast";

export default function AchievementToastManager() {
  const { pendingAchievements, clearPendingAchievements } = useSessionStore();
  const [currentToast, setCurrentToast] = useState<{ id: string; title: string; emoji: string; description: string } | null>(null);

  useEffect(() => {
    if (pendingAchievements.length > 0 && !currentToast) {
      setCurrentToast(pendingAchievements[0]);
      clearPendingAchievements();
    }
  }, [pendingAchievements, currentToast, clearPendingAchievements]);

  return (
    <>
      {currentToast && (
        <AchievementToast
          key={currentToast.id}
          achievement={currentToast}
          onClose={() => setCurrentToast(null)}
        />
      )}
    </>
  );
}
