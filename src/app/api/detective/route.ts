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
1. Identify what type of receipt it is (food/fuel/electricity/transport/shopping/other)
2. List the key items that contribute to carbon emissions
3. Estimate carbon impact for each item
4. Give a total carbon estimate
5. Provide 2-3 specific actionable suggestions

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "receiptType": "food|fuel|electricity|transport|shopping|unknown",
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
  "topInsight": "the single most surprising fact about this receipt"
}

If the image is NOT a receipt or bill (e.g. a selfie, random photo, 
screenshot of something unrelated), set isValid to false and 
invalidReason to a friendly explanation.

If it IS a receipt but has zero carbon impact items, still set 
isValid true but items array will be empty with totalCO2 of 0.

IMPORTANT: Carbon estimates should be realistic and educational.
Never shame the user. Always be warm and encouraging.

IMPORTANT: In the 'note' field for each item,
if you can identify a quantity (liters of fuel,
kWh of electricity, kg of food), include it.
Format: 'X liters', 'X kWh', 'X kg'
This helps calculate precise emissions.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, city } = body;

    // Validate input
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json(
        { error: "No image provided", isValid: false },
        { status: 400 }
      );
    }

    // Check image size (base64 string length)
    // 5MB base64 ≈ 6.7M chars
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
      // Return mock data if no API key
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
            difficulty: "easy" },
          { action: "Skip the bottled drink, carry a water bottle",
            potentialSaving: "0.3 kg CO₂",
            difficulty: "easy" }
        ],
        topInsight: "Switching to vegetarian protein once a week saves ~100 kg CO₂ per year!"
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
    
    // Parse JSON safely
    let result;
    try {
      // Strip markdown code blocks if present
      const cleaned = rawResponse
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, return fallback
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

    // Use any for DetectiveItem to avoid declaring an interface inline
    if (result.receiptType === "fuel" && result.items) {
      // Look for fuel quantities in items
      const totalLiters = result.items.reduce((sum: number, item: any) => {
        // Groq should include liters in the note field
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
        } catch {
          // Keep Groq's estimate
        }
      }
    }

    if (result.receiptType === "electricity" && result.items) {
      // Look for kWh in items
      const totalKwh = result.items.reduce((sum: number, item: any) => {
        const kwhMatch = item.note?.match(/(\d+(?:\.\d+)?)\s*kWh/i);
        if (kwhMatch) return sum + parseFloat(kwhMatch[1]);
        return sum;
      }, 0);
      
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
        } catch {
          // Keep Groq's estimate  
        }
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
