import { NextResponse } from "next/server";



// Fallback values when API fails (kg CO2)
const FALLBACK_CARBON: Record<string, number> = {
  "walk-cycle": -12,
  "metro": -3,
  "cab": 10,
  "plant-breakfast": -8,
  "local-dhaba": -2,
  "delivery-burger": 15,
  "home-tiffin": -6,
  "canteen": -1,
  "delivery-app": 8,
  "local-market": -5,
  "online-order": 3,
  "mall-trip": 12,
  "home-cook": -7,
  "order-veggie": 2,
  "order-meat": 14,
  "read-book": -2,
  "stream-show": 1,
  "game-all-night": 6,
};

export async function POST(req: Request) {
  try {
    const { activityId, value, unit } = await req.json();
    
    const apiKey = process.env.EMISSIONS_DEV_API_KEY;
    
    if (!apiKey) {
      // Return fallback
      const fallback = FALLBACK_CARBON[activityId] || 0;
      return NextResponse.json({ 
        co2kg: fallback, 
        source: "fallback" 
      });
    }

    const response = await fetch(
      "https://api.emissions.dev/v1/carbon",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emission_factor: {
            activity_id: activityId,
          },
          parameters: {
            value: value || 1,
            unit: unit || "km",
          }
        }),
      }
    );

    if (!response.ok) {
      const fallback = FALLBACK_CARBON[activityId] || 0;
      return NextResponse.json({ 
        co2kg: fallback,
        source: "fallback"
      });
    }

    const data = await response.json();
    const co2kg = data.co2e || FALLBACK_CARBON[activityId] || 0;
    
    return NextResponse.json({ 
      co2kg: Math.round(co2kg * 100) / 100,
      source: "api"
    });

  } catch (error) {
    console.error("Carbon API error:", error);
    return NextResponse.json({ 
      co2kg: 0,
      source: "error"
    });
  }
}
