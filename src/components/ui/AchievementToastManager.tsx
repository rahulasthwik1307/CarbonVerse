"use client";

import { useEffect, useState } from "react";
import { useSessionStore } from "@/lib/session-store";
import AchievementToast from "./AchievementToast";

export default function AchievementToastManager() {
  const { pendingAchievements, clearPendingAchievements, pendingMissions, clearPendingMissions } = useSessionStore();
  const [currentToast, setCurrentToast] = useState<{ id: string; title: string; emoji: string; description: string; type?: "achievement" | "mission" } | null>(null);

  useEffect(() => {
    if (pendingAchievements.length > 0 && !currentToast) {
      const first = pendingAchievements[0];
      const timer = setTimeout(() => {
        setCurrentToast({ ...first, type: "achievement" });
        clearPendingAchievements();
      }, 0);
      return () => clearTimeout(timer);
    } else if (pendingMissions && pendingMissions.length > 0 && !currentToast) {
      const first = pendingMissions[0];
      const timer = setTimeout(() => {
        setCurrentToast({ ...first, type: "mission" });
        clearPendingMissions();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [pendingAchievements, pendingMissions, currentToast, clearPendingAchievements, clearPendingMissions]);

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
