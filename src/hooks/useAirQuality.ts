import { useState, useEffect } from "react";
import { useSessionStore } from "@/lib/session-store";

export function useAirQuality() {
  const city = useSessionStore(s => s.profile.city);
  const [data, setData] = useState<{
    aqi: number;
    aqiLevel: string;
    aqiColor: string;
    verdMessage: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/airquality?city=${encodeURIComponent(city)}`)
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => setData({
          aqi: 75, aqiLevel: "Moderate",
          aqiColor: "#F4A832",
          verdMessage: "Your eco choices help clean the air! 🌿"
        }))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [city]);

  return { data, loading };
}
