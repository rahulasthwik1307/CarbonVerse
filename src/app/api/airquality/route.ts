import { NextResponse } from "next/server";

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "Hyderabad": { lat: 17.3850, lon: 78.4867 },
  "Mumbai": { lat: 19.0760, lon: 72.8777 },
  "Delhi": { lat: 28.6139, lon: 77.2090 },
  "Bengaluru": { lat: 12.9716, lon: 77.5946 },
  "Chennai": { lat: 13.0827, lon: 80.2707 },
  "Kolkata": { lat: 22.5726, lon: 88.3639 },
  "Pune": { lat: 18.5204, lon: 73.8567 },
  "Ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "Jaipur": { lat: 26.9124, lon: 75.7873 },
  "Lucknow": { lat: 26.8467, lon: 80.9462 },
  "Kochi": { lat: 9.9312, lon: 76.2673 },
  "Chandigarh": { lat: 30.7333, lon: 76.7794 },
  "Surat": { lat: 21.1702, lon: 72.8311 },
  "Kanpur": { lat: 26.4499, lon: 80.3319 },
  "Nagpur": { lat: 21.1458, lon: 79.0882 },
  "Indore": { lat: 22.7196, lon: 75.8577 },
  "Thane": { lat: 19.2183, lon: 72.9781 },
  "Bhopal": { lat: 23.2599, lon: 77.4126 },
  "Visakhapatnam": { lat: 17.6868, lon: 83.2185 },
  "Patna": { lat: 25.5941, lon: 85.1376 },
  "Vadodara": { lat: 22.3072, lon: 73.1812 },
  "Ghaziabad": { lat: 28.6692, lon: 77.4538 }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || "Hyderabad";

    const coords = CITY_COORDS[city] || CITY_COORDS["Hyderabad"];
    const { lat, lon } = coords;

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,us_aqi`;
    const response = await fetch(url);
    const data = await response.json();

    const aqi = data?.current?.us_aqi || 75;

    let aqiLevel = "Moderate";
    let aqiColor = "#F4A832";
    let verdMessage = "Air quality is moderate — a good day to cycle! 🚲";

    if (aqi <= 50) {
      aqiLevel = "Good";
      aqiColor = "#4CAF50";
      verdMessage = "The air in your city is clean today! 🌿";
    } else if (aqi <= 100) {
      aqiLevel = "Moderate";
      aqiColor = "#F4A832";
      verdMessage = "Air quality is moderate — a good day to cycle! 🚲";
    } else if (aqi <= 150) {
      aqiLevel = "Unhealthy";
      aqiColor = "#FF8C00";
      verdMessage = "Air is a bit hazy today. Public transport helps! 🚇";
    } else {
      aqiLevel = "Hazardous";
      aqiColor = "#FF6B6B";
      verdMessage = "High pollution today — your eco choices matter! 🌱";
    }

    return NextResponse.json({
      aqi,
      aqiLevel,
      aqiColor,
      verdMessage
    });
  } catch {
    return NextResponse.json({
      aqi: 75,
      aqiLevel: "Moderate",
      aqiColor: "#F4A832",
      verdMessage: "Air quality is moderate — a good day to cycle! 🚲"
    });
  }
}
