import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Carbon emission factors per category
const CARBON_FACTORS = {
  food_meat: { factor: 27, unit: "kg CO₂ per kg", label: "Meat/Poultry" },
  food_dairy: { factor: 13.5, unit: "kg CO₂ per kg", label: "Dairy" },
  food_vegetables: { factor: 2, unit: "kg CO₂ per kg", label: "Vegetables" },
  food_packaged: { factor: 3.5, unit: "kg CO₂ per item", label: "Packaged Food" },
  food_delivery: { factor: 2.5, unit: "kg CO₂ per delivery", label: "Food Delivery" },
  fuel_petrol: { factor: 2.31, unit: "kg CO₂ per liter", label: "Petrol" },
  fuel_diesel: { factor: 2.68, unit: "kg CO₂ per liter", label: "Diesel" },
  electricity: { factor: 0.82, unit: "kg CO₂ per kWh", label: "Electricity (India avg)" },
  transport_cab: { factor: 0.21, unit: "kg CO₂ per km", label: "Cab/Taxi" },
  transport_flight: { factor: 0.255, unit: "kg CO₂ per km", label: "Flight" },
  shopping_clothing: { factor: 10, unit: "kg CO₂ per item", label: "Clothing" },
  shopping_electronics: { factor: 70, unit: "kg CO₂ per item", label: "Electronics" },
};

const SYSTEM_PROMPT = `You are Verd, an expert carbon footprint analyst.
You analyze receipts and bills to estimate carbon emissions.

When given a receipt image, you MUST:
1. Identify what type of receipt it is: food | fuel | electricity | transport | shopping | grocery | utility | other
2. List the key items that contribute to carbon emissions
3. Estimate carbon impact for each item
4. Give a total carbon estimate
5. Provide 2-3 specific actionable suggestions
6. If the receipt is electricity/utility, extract structured electricityData
7. Identify ONE relevant "suggestedMission" the user can take

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "receiptType": "food|fuel|electricity|transport|shopping|grocery|utility|other|unknown",
  "isValid": true|false,
  "invalidReason": "reason if not valid, else null",
  "merchantName": "store/merchant name or null",
  "items": [
    {
      "name": "item name",
      "category": "category from list",
      "estimatedCO2": number in kg,
      "confidence": "high|medium|low",
      "note": "brief explanation"
    }
  ],
  "totalCO2": number in kg,
  "totalCO2Label": "equivalent description (e.g. driving 45km)",
  "impactLevel": "low|moderate|high|very_high",
  "verdVerdict": "one warm encouraging sentence about their choices",
  "suggestions": [
    {
      "action": "specific action they can take",
      "potentialSaving": "X kg CO₂ saved",
      "difficulty": "easy|medium|hard"
    }
  ],
  "topInsight": "the single most surprising fact about this receipt",
  "electricityData": {
    "kwhConsumed": number | null,
    "provider": "string | null",
    "billPeriodDays": number | null
  },
  "suggestedMission": {
    "id": "unique string like 'mission-energy-1'",
    "title": "short title e.g. Energy Saver",
    "emoji": "emoji that fits",
    "description": "short one-sentence mission description",
    "targetType": "eco_choices"
  }
}

If the image is NOT a receipt or bill, set isValid to false and invalidReason to a friendly explanation.

IMPORTANT FOR ELECTRICITY/UTILITY BILLS:
Do NOT skip the electricityData field. Look for any values indicating 'Units Consumed' or 'kWh' and put that number in kwhConsumed.

SUGGESTED MISSION LOGIC:
- If food/grocery (high impact): Plant-Based Explorer 🥗 or Zero-Waste Shopper 🛍️
- If fuel/transport: Metro Master 🚇
- If electricity/utility: Energy Saver ⚡
- If shopping: Local Shopper 🛒

Never shame the user. Always be warm and encouraging.
Include quantities in item notes like 'X liters' or 'X kg'.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, city } = body;

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "No image provided", isValid: false },
        { status: 400 }
      );
    }

    if (imageBase64.length > 7_000_000) {
      return NextResponse.json(
        { error: "Image too large. Please use an image under 5MB.", isValid: false },
        { status: 400 }
      );
    }

    const validMimeTypes = ["image/jpeg","image/jpg","image/png","image/webp"];
    const safeMimeType = validMimeTypes.includes(mimeType) 
      ? mimeType : "image/jpeg";

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        isValid: true,
        receiptType: "food",
        merchantName: "Demo Restaurant",
        items: [
          { name: "Chicken Biryani", category: "food_meat",
            estimatedCO2: 3.2, confidence: "medium",
            note: "Poultry has moderate carbon footprint" },
          { name: "Soft Drink", category: "food_packaged",
            estimatedCO2: 0.3, confidence: "low",
            note: "Packaging adds to emissions" }
        ],
        totalCO2: 3.5,
        totalCO2Label: "like driving 16km in a car",
        impactLevel: "moderate",
        verdVerdict: "A balanced meal choice! Try plant-based options occasionally to reduce impact. 🌿",
        suggestions: [
          { action: "Choose vegetarian biryani instead",
            potentialSaving: "2.1 kg CO₂",
            difficulty: "easy" }
        ],
        topInsight: "Switching to vegetarian protein once a week saves ~100 kg CO₂ per year!",
        suggestedMission: {
          id: "demo-mission", title: "Plant-Based Explorer", emoji: "🥗", description: "Try one plant-based meal this week", targetType: "eco_choices"
        }
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const cityContext = city 
      ? `The user is from ${city}, India.` 
      : "The user is from India.";

    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${SYSTEM_PROMPT}\n\n${cityContext}\nAnalyze this receipt and respond ONLY with valid JSON:`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${safeMimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ]
    });

    const rawResponse = completion.choices[0]?.message?.content || "";
    
    let result;
    try {
      const cleaned = rawResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch {
      // Very lenient fallback if partial JSON found
      const matchCO2 = rawResponse.match(/"totalCO2"\s*:\s*(\d+(?:\.\d+)?)/);
      if (matchCO2) {
        result = {
          isValid: true,
          receiptType: "unknown",
          merchantName: "Receipt",
          items: [],
          totalCO2: parseFloat(matchCO2[1]),
          totalCO2Label: "Estimated from partial read",
          impactLevel: "moderate",
          verdVerdict: "I couldn't read all the details, but I found the total!",
          suggestions: [],
          topInsight: "Clearer photos help me find more insights."
        };
      } else {
        return NextResponse.json({
          isValid: false,
          invalidReason: "Could not read the receipt clearly. Please try a clearer photo.",
          receiptType: "unknown",
          items: [],
          totalCO2: 0,
          totalCO2Label: "",
          impactLevel: "low",
          verdVerdict: "Try uploading a clearer photo of your receipt! 🌿",
          suggestions: [],
          topInsight: ""
        });
      }
    }

    if (result.receiptType === "fuel" && result.items) {
      const totalLiters = result.items.reduce((sum: number, item: any) => {
        const literMatch = item.note?.match(/(\d+(?:\.\d+)?)\s*(?:liters?|litres?|L)/i);
        if (literMatch) return sum + parseFloat(literMatch[1]);
        return sum;
      }, 0);
      
      if (totalLiters > 0) {
        try {
          const emissionsRes = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/carbon`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                activityId: "fuel_type_diesel-fuel_use_na",
                value: totalLiters,
                unit: "l"
              })
            }
          );
          const emissionsData = await emissionsRes.json();
          if (emissionsData.co2kg) {
            result.totalCO2 = emissionsData.co2kg;
            result.totalCO2Label = 
              `${totalLiters}L fuel = ${emissionsData.co2kg.toFixed(1)} kg CO₂`;
          }
        } catch { }
      }
    }

    if ((result.receiptType === "electricity" || result.receiptType === "utility") && (result.items || result.electricityData)) {
      let totalKwh = 0;
      
      // Prefer structured electricityData
      if (result.electricityData && result.electricityData.kwhConsumed) {
        totalKwh = result.electricityData.kwhConsumed;
      } else if (result.items) {
        // Fallback to searching notes
        totalKwh = result.items.reduce((sum: number, item: any) => {
          const kwhMatch = item.note?.match(/(\d+(?:\.\d+)?)\s*kWh/i);
          if (kwhMatch) return sum + parseFloat(kwhMatch[1]);
          return sum;
        }, 0);
      }
      
      if (totalKwh > 0) {
        try {
          const emissionsRes = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/carbon`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                activityId: "electricity-supply_grid-source_residual_mix",
                value: totalKwh,
                unit: "kWh"
              })
            }
          );
          const emissionsData = await emissionsRes.json();
          if (emissionsData.co2kg) {
            result.totalCO2 = emissionsData.co2kg;
            result.totalCO2Label = 
              `${totalKwh} kWh = ${emissionsData.co2kg.toFixed(1)} kg CO₂ (India grid)`;
          }
        } catch { }
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Detective API error:", error);
    return NextResponse.json(
      { 
        isValid: false,
        invalidReason: "Something went wrong. Please try again.",
        items: [], totalCO2: 0, impactLevel: "low",
        verdVerdict: "Let's try that again! 🌱",
        suggestions: [], topInsight: ""
      },
      { status: 500 }
    );
  }
}
