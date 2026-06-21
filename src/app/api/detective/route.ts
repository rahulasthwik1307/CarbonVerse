import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { DetectiveResult, DetectiveItem, DetectiveSuggestion } from "@/types/carbon";

interface SimplifiedResult {
  isValid: boolean;
  invalidReason?: string | null;
  receiptType?: string | null;
  merchantName?: string | null;
  items?: Array<{ name?: string; co2?: number; estimatedCO2?: number; confidence?: string; note?: string }> | null;
  totalCO2?: number | string | null;
  impactLevel?: string | null;
  totalCO2Label?: string | null;
  verdVerdict?: string | null;
  suggestions?: Array<{ action?: string; potentialSaving?: string; difficulty?: string }> | null;
  topInsight?: string | null;
}

const FALLBACK_SUGGESTIONS = {
  food: [
    { action: "Choose plant-based meals", potentialSaving: "2.5 kg CO₂", difficulty: "easy" },
    { action: "Reduce food waste", potentialSaving: "1.2 kg CO₂", difficulty: "easy" }
  ],
  utility: [
    { action: "Turn off unused devices", potentialSaving: "1.8 kg CO₂", difficulty: "easy" },
    { action: "Use natural light during the day", potentialSaving: "0.9 kg CO₂", difficulty: "easy" }
  ],
  shopping: [
    { action: "Buy only what you need", potentialSaving: "3.5 kg CO₂", difficulty: "medium" },
    { action: "Prefer local products", potentialSaving: "2.0 kg CO₂", difficulty: "easy" }
  ],
  fuel: [
    { action: "Use public transit", potentialSaving: "4.5 kg CO₂", difficulty: "medium" },
    { action: "Carpool when possible", potentialSaving: "3.0 kg CO₂", difficulty: "easy" }
  ],
  unknown: [
    { action: "Choose low-impact daily choices", potentialSaving: "1.5 kg CO₂", difficulty: "easy" },
    { action: "Reduce household waste", potentialSaving: "1.0 kg CO₂", difficulty: "easy" }
  ]
};

const FALLBACK_ITEMS = {
  food: [
    { name: "Meal Selection", co2: 3.5 },
    { name: "Packaging & Delivery", co2: 0.8 }
  ],
  utility: [
    { name: "Electricity Consumption", co2: 38.2 },
    { name: "Utility Maintenance Fee", co2: 2.1 }
  ],
  shopping: [
    { name: "Purchased Goods", co2: 12.0 },
    { name: "Store Packaging", co2: 1.5 }
  ],
  fuel: [
    { name: "Fuel Refueling", co2: 26.5 }
  ],
  unknown: [
    { name: "Eco Contributor Item", co2: 4.5 }
  ]
};

const SYSTEM_PROMPT = `You are Verd, an expert carbon footprint analyst.
You analyze receipts and bills to estimate carbon emissions.

When given a receipt image, you MUST:
1. Identify what type of receipt it is: food | utility | shopping | fuel
2. List the key items that contribute to carbon emissions
3. Estimate carbon impact (co2 in kg) for each item
4. Provide a total carbon estimate (totalCO2 in kg)
5. Provide 2-3 specific actionable suggestions
6. Provide a top insight and a warm encouraging verdict (verdVerdict).

RESPOND ONLY WITH VALID JSON in this exact format:
{
  "isValid": true,
  "receiptType": "food | utility | shopping | fuel",
  "merchantName": "string",
  "items": [
    {
      "name": "string",
      "co2": number
    }
  ],
  "totalCO2": number,
  "impactLevel": "low | moderate | high | very_high",
  "verdVerdict": "string",
  "suggestions": [
    {
      "action": "string"
    }
  ],
  "topInsight": "string"
}

If the image is NOT a receipt or bill, set isValid to false.
Never shame the user. Always be warm and encouraging.`;

function cleanAndParseJSON(rawResponse: string) {
  let cleaned = rawResponse.trim();
  
  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  
  // Extract only the JSON block if the LLM output contains extra conversational text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  // Clean trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\}\]])/g, "$1");
  
  return JSON.parse(cleaned);
}

function runRecoveryParser(rawResponse: string): SimplifiedResult {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[Recovery Parser] JSON.parse failed. Executing fallback regex extraction.");
  }
  const items: Array<{ name: string; co2: number }> = [];
  const suggestions: Array<{ action: string }> = [];
  let receiptType: "food" | "utility" | "shopping" | "fuel" = "food";
  let merchantName = "Merchant";
  const isValid = true;
  
  const rawLower = rawResponse.toLowerCase();
  
  // Determine receiptType based on keywords
  if (rawLower.includes("electricity") || rawLower.includes("utility") || rawLower.includes("power") || rawLower.includes("energy chg") || rawLower.includes("fixed chg") || rawLower.includes("surcharges") || rawLower.includes("bill")) {
    receiptType = "utility";
  } else if (rawLower.includes("fuel") || rawLower.includes("petrol") || rawLower.includes("diesel") || rawLower.includes("gasoline") || rawLower.includes("speed") || rawLower.includes("pump")) {
    receiptType = "fuel";
  } else if (rawLower.includes("shopping") || rawLower.includes("store") || rawLower.includes("clothing") || rawLower.includes("shirt") || rawLower.includes("shoe") || rawLower.includes("retail") || rawLower.includes("groceries") || rawLower.includes("grocery")) {
    receiptType = "shopping";
  } else if (rawLower.includes("food") || rawLower.includes("restaurant") || rawLower.includes("dining") || rawLower.includes("meal") || rawLower.includes("chicken") || rawLower.includes("biryani") || rawLower.includes("veg") || rawLower.includes("paneer")) {
    receiptType = "food";
  }

  // Extract Merchant Name
  const merchantMatch = rawResponse.match(/(?:merchantName|merchant|store|provider)\s*["']?[:=]\s*["']?([^"\n,]+)/i);
  if (merchantMatch) {
    merchantName = merchantMatch[1].trim();
  }

  const lines = rawResponse.split("\n");
  const getCO2FromLine = (line: string, defaultCO2: number): number => {
    const co2Match = line.match(/(?:co2|carbon|emissions?|impact)?\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:kg\s*(?:co2)?)?/i);
    if (co2Match) {
      return parseFloat(co2Match[1]);
    }
    const fallbackMatch = line.match(/(\d+(?:\.\d+)?)/);
    if (fallbackMatch) {
      return parseFloat(fallbackMatch[1]);
    }
    return defaultCO2;
  };

  // Keyword extraction for items: ENERGY CHG, FIXED CHG, SURCHARGES
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/energy\s*chg/i.test(trimmed)) {
      items.push({ name: "Energy Charge", co2: getCO2FromLine(trimmed, 15.0) });
      continue;
    }
    if (/fixed\s*chg/i.test(trimmed)) {
      items.push({ name: "Fixed Charge", co2: getCO2FromLine(trimmed, 2.5) });
      continue;
    }
    if (/surcharges/i.test(trimmed)) {
      items.push({ name: "Surcharges", co2: getCO2FromLine(trimmed, 1.2) });
      continue;
    }
  }

  // Section-based extraction for FOOD ITEMS, RESTAURANT ITEMS, SHOPPING ITEMS, FUEL ITEMS
  let currentSection: "food" | "utility" | "shopping" | "fuel" | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/suggestion|action|recommendation|verdict|insight/i.test(trimmed)) {
      currentSection = null;
      continue;
    }
    if (/food\s*items|restaurant\s*items/i.test(trimmed)) {
      currentSection = "food";
      continue;
    } else if (/shopping\s*items/i.test(trimmed)) {
      currentSection = "shopping";
      continue;
    } else if (/fuel\s*items/i.test(trimmed)) {
      currentSection = "fuel";
      continue;
    } else if (/utility\s*items|electricity\s*items/i.test(trimmed)) {
      currentSection = "utility";
      continue;
    }
    
    if (currentSection && /^[-\*\+•\d+\.]\s*(.+)/.test(trimmed)) {
      const content = trimmed.replace(/^[-\*\+•\d+\.]\s*/, "");
      const parts = content.split(/[:=-]/);
      const name = parts[0].trim();
      const co2Val = parts[1] ? parseFloat(parts[1]) : 1.5;
      if (name && name.length > 2 && name.length < 50) {
        items.push({ name, co2: isNaN(co2Val) ? 1.5 : co2Val });
      }
    }
  }

  // General list item fallback parser if no items added yet
  if (items.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      const listMatch = trimmed.match(/^[-\*\+•\d+\.]\s*([^:=]+)(?:[:=]|\s-\s)\s*(\d+(?:\.\d+)?)/);
      if (listMatch) {
        const name = listMatch[1].replace(/["']/g, "").trim();
        const co2 = parseFloat(listMatch[2]);
        if (!/list|items|suggestions|summary/i.test(name) && name.length > 2 && name.length < 50) {
          items.push({ name, co2 });
        }
      }
    }
  }

  // Extract suggestions
  let inSuggestionsSection = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/suggestion|action|recommendation/i.test(trimmed)) {
      inSuggestionsSection = true;
      continue;
    }
    if (inSuggestionsSection && /^[-\*\+•\d+\.]\s*(.+)/.test(trimmed)) {
      const actionText = trimmed.replace(/^[-\*\+•\d+\.]\s*/, "").replace(/["']/g, "").trim();
      if (actionText.length > 5 && actionText.length < 100 && !/list|summary|insight/i.test(actionText)) {
        suggestions.push({ action: actionText });
      }
    }
  }

  const totalCO2 = items.reduce((sum, item) => sum + item.co2, 0);

  let topInsight = "Every small action helps reduce carbon emissions!";
  const insightMatch = rawResponse.match(/(?:insight|did you know|fact)\s*[:=]\s*["']?([^"\n]+)/i);
  if (insightMatch) {
    topInsight = insightMatch[1].trim();
  }

  let verdVerdict = "Great job tracking your carbon footprint! Let's work together to make it even lower. 🌿";
  const verdictMatch = rawResponse.match(/(?:verdVerdict|verdict|opinion)\s*[:=]\s*["']?([^"\n\.]+)/i);
  if (verdictMatch) {
    verdVerdict = verdictMatch[1].trim() + ". 🌿";
  }

  return {
    isValid,
    receiptType,
    merchantName,
    items,
    totalCO2,
    impactLevel: totalCO2 < 5 ? "low" : totalCO2 < 15 ? "moderate" : totalCO2 < 40 ? "high" : "very_high",
    verdVerdict,
    suggestions,
    topInsight
  };
}

function mapToFullSchema(simplified: SimplifiedResult): DetectiveResult {
  const receiptType = (simplified.receiptType || "unknown").toLowerCase() as "food" | "fuel" | "electricity" | "transport" | "shopping" | "grocery" | "utility" | "other" | "unknown";
  
  // Process items
  const items: DetectiveItem[] = (simplified.items || []).map((item) => {
    const estimatedCO2 = Number(item.co2 ?? item.estimatedCO2 ?? 0);
    
    let category = "food_packaged";
    if (receiptType === "food") {
      if (item.name?.toLowerCase().includes("chicken") || item.name?.toLowerCase().includes("meat") || item.name?.toLowerCase().includes("mutton")) {
        category = "food_meat";
      } else if (item.name?.toLowerCase().includes("milk") || item.name?.toLowerCase().includes("paneer") || item.name?.toLowerCase().includes("cheese")) {
        category = "food_dairy";
      } else {
        category = "food_vegetables";
      }
    } else if (receiptType === "utility" || receiptType === "electricity") {
      category = "electricity";
    } else if (receiptType === "fuel") {
      category = item.name?.toLowerCase().includes("diesel") ? "fuel_diesel" : "fuel_petrol";
    } else if (receiptType === "shopping") {
      category = item.name?.toLowerCase().includes("electronics") || item.name?.toLowerCase().includes("phone") ? "shopping_electronics" : "shopping_clothing";
    }

    return {
      name: item.name || "Item",
      category,
      estimatedCO2,
      confidence: (item.confidence === "high" || item.confidence === "medium" || item.confidence === "low" ? item.confidence : "high") as "high" | "medium" | "low",
      note: item.note || `Estimated carbon footprint for ${item.name || "item"}`
    };
  });

  // Fallback items if empty
  if (items.length === 0) {
    const fallbackList = FALLBACK_ITEMS[receiptType as keyof typeof FALLBACK_ITEMS] || FALLBACK_ITEMS.unknown;
    fallbackList.forEach(item => {
      items.push({
        name: item.name,
        category: receiptType === "utility" ? "electricity" : receiptType === "fuel" ? "fuel_petrol" : "food_packaged",
        estimatedCO2: item.co2,
        confidence: "medium",
        note: `Estimated from average ${receiptType} consumption`
      });
    });
  }

  // Process suggestions
  const totalCO2Val = Number(simplified.totalCO2 ?? 5);
  const suggestions: DetectiveSuggestion[] = (simplified.suggestions || []).map((sug) => {
    let diff = sug.difficulty || "easy";
    if (diff !== "easy" && diff !== "medium" && diff !== "hard") {
      diff = "easy";
    }
    return {
      action: sug.action || "",
      potentialSaving: sug.potentialSaving || `${(totalCO2Val * 0.2).toFixed(1)} kg CO₂`,
      difficulty: diff as "easy" | "medium" | "hard"
    };
  });

  // Fallback suggestions if empty
  if (suggestions.length === 0) {
    const fallbackList = FALLBACK_SUGGESTIONS[receiptType as keyof typeof FALLBACK_SUGGESTIONS] || FALLBACK_SUGGESTIONS.unknown;
    fallbackList.forEach(sug => {
      suggestions.push({
        action: sug.action,
        potentialSaving: sug.potentialSaving,
        difficulty: sug.difficulty as "easy" | "medium" | "hard"
      });
    });
  }

  // Total CO2
  let totalCO2 = typeof simplified.totalCO2 === "number" ? simplified.totalCO2 : parseFloat((simplified.totalCO2 as string) || "0");
  if (totalCO2 <= 0) {
    totalCO2 = items.reduce((sum: number, item) => sum + item.estimatedCO2, 0);
  }
  totalCO2 = parseFloat(totalCO2.toFixed(1));

  // Impact Level
  let impactLevel: "low" | "moderate" | "high" | "very_high" = "moderate";
  const rawImpact = simplified.impactLevel || "";
  if (rawImpact === "low" || rawImpact === "moderate" || rawImpact === "high" || rawImpact === "very_high") {
    impactLevel = rawImpact;
  } else {
    if (totalCO2 < 5) impactLevel = "low";
    else if (totalCO2 < 15) impactLevel = "moderate";
    else if (totalCO2 < 40) impactLevel = "high";
    else impactLevel = "very_high";
  }

  // Labels and Insights
  let totalCO2Label = simplified.totalCO2Label || "";
  if (!totalCO2Label) {
    if (receiptType === "fuel") {
      const estLiters = (totalCO2 / 2.31).toFixed(1);
      totalCO2Label = `${estLiters}L fuel = ${totalCO2} kg CO₂`;
    } else if (receiptType === "utility") {
      const estKwh = (totalCO2 / 0.82).toFixed(1);
      totalCO2Label = `${estKwh} kWh = ${totalCO2} kg CO₂`;
    } else {
      const kmEquivalent = (totalCO2 / 0.21).toFixed(1);
      totalCO2Label = `equivalent to driving ${kmEquivalent} km in a car`;
    }
  }

  let verdVerdict = simplified.verdVerdict || "";
  if (!verdVerdict) {
    if (receiptType === "food") {
      verdVerdict = "A delicious choice! Try choosing plant-based options next time to save even more carbon. 🥗";
    } else if (receiptType === "utility") {
      verdVerdict = "Being mindful of energy consumption makes a massive difference for our planet! ⚡";
    } else if (receiptType === "shopping") {
      verdVerdict = "Sleek pick! Opting for durable goods and local brands helps reduce overhead emissions. 🛍️";
    } else if (receiptType === "fuel") {
      verdVerdict = "Every liter saved counts. Carpooling or walking can help clean our skies! 🚇";
    } else {
      verdVerdict = "Excellent tracking! Every recorded receipt builds a clearer picture of your impact. 🌿";
    }
  }

  let topInsight = simplified.topInsight || "";
  if (!topInsight) {
    if (receiptType === "food") {
      topInsight = "Switching from red meat to plant-based protein once a week saves ~100 kg CO₂ per year!";
    } else if (receiptType === "utility") {
      topInsight = "A simple 1°C increase in AC settings can save up to 6% of electricity consumption daily!";
    } else if (receiptType === "shopping") {
      topInsight = "Fast fashion accounts for nearly 10% of global carbon emissions, more than flights!";
    } else if (receiptType === "fuel") {
      topInsight = "Standard combustion engines waste nearly 70% of energy as heat. Carpooling doubles efficiency!";
    } else {
      topInsight = "Logging and visualizing emissions is the first step toward reducing personal impact.";
    }
  }

  // Suggested Mission
  let suggestedMission: {
    id: string;
    title: string;
    emoji: string;
    description: string;
    targetType: "eco_choices" | "receipt_upload" | "story_complete";
  } | undefined = undefined;
  if (receiptType === "food") {
    suggestedMission = {
      id: "mission-seed-plate-detective",
      title: "Green Plate",
      emoji: "🥗",
      description: "Choose a plant-based or local meal",
      targetType: "eco_choices"
    };
  } else if (receiptType === "utility") {
    suggestedMission = {
      id: "mission-seed-utility-detective",
      title: "Energy Saver",
      emoji: "⚡",
      description: "Turn off unused devices to save power",
      targetType: "eco_choices"
    };
  } else if (receiptType === "shopping") {
    suggestedMission = {
      id: "mission-seed-shopping-detective",
      title: "Local Buyer",
      emoji: "🛒",
      description: "Choose local kirana store or products",
      targetType: "eco_choices"
    };
  } else if (receiptType === "fuel") {
    suggestedMission = {
      id: "mission-seed-commute-detective",
      title: "Commute Champion",
      emoji: "🚇",
      description: "Choose public transit or walk",
      targetType: "eco_choices"
    };
  } else {
    suggestedMission = {
      id: "mission-seed-receipt-detective",
      title: "Receipt Detective",
      emoji: "🔍",
      description: "Analyze your first real receipt",
      targetType: "receipt_upload"
    };
  }

  // Electricity Data
  let electricityData = undefined;
  if (receiptType === "utility") {
    const kwhConsumed = Math.round(totalCO2 / 0.82);
    electricityData = {
      kwhConsumed: kwhConsumed > 0 ? kwhConsumed : 120,
      provider: "State Grid Provider",
      billPeriodDays: 30
    };
  }

  return {
    isValid: true,
    invalidReason: null,
    receiptType,
    merchantName: simplified.merchantName || "Unknown Merchant",
    items,
    totalCO2,
    totalCO2Label,
    impactLevel,
    verdVerdict,
    suggestions,
    topInsight,
    electricityData,
    suggestedMission
  };
}

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

    const validMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const safeMimeType = validMimeTypes.includes(mimeType) 
      ? mimeType : "image/jpeg";

    if (!process.env.GROQ_API_KEY) {
      // Demo response
      const demoResult = mapToFullSchema({
        isValid: true,
        receiptType: "food",
        merchantName: "Demo Restaurant",
        items: [
          { name: "Chicken Biryani", co2: 3.2 },
          { name: "Soft Drink", co2: 0.3 }
        ],
        totalCO2: 3.5,
        impactLevel: "moderate",
        verdVerdict: "A balanced meal choice! Try plant-based options occasionally to reduce impact. 🌿",
        suggestions: [
          { action: "Choose vegetarian biryani instead" }
        ],
        topInsight: "Switching to vegetarian protein once a week saves ~100 kg CO₂ per year!"
      });
      return NextResponse.json(demoResult);
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

    let simplifiedResult;

    try {
      simplifiedResult = cleanAndParseJSON(rawResponse);
    } catch (parseError) {
      console.error("[JSON Parse Status] Native parse failed. Parsing raw text using Recovery Parser.", parseError);
      simplifiedResult = runRecoveryParser(rawResponse);
    }

    if (!simplifiedResult.isValid) {
      return NextResponse.json({
        isValid: false,
        invalidReason: simplifiedResult.invalidReason || "Could not read the receipt clearly. Please try a clearer photo.",
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

    const finalResult = mapToFullSchema(simplifiedResult);

    // Fuel logic refinement if we have carbon API
    if (finalResult.receiptType === "fuel" && finalResult.items) {
      const totalLiters = finalResult.items.reduce((sum: number, item: DetectiveItem) => {
        const literMatch = item.name?.match(/(\d+(?:\.\d+)?)\s*(?:liters?|litres?|L)/i);
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
            finalResult.totalCO2 = parseFloat(emissionsData.co2kg.toFixed(1));
            finalResult.totalCO2Label = `${totalLiters}L fuel = ${finalResult.totalCO2} kg CO₂`;
          }
        } catch {}
      }
    }

    // Utility/Electricity logic refinement
    if ((finalResult.receiptType === "utility" || finalResult.receiptType === "electricity") && finalResult.electricityData?.kwhConsumed) {
      const totalKwh = finalResult.electricityData.kwhConsumed;
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
            finalResult.totalCO2 = parseFloat(emissionsData.co2kg.toFixed(1));
            finalResult.totalCO2Label = `${totalKwh} kWh = ${finalResult.totalCO2} kg CO₂ (India grid)`;
          }
        } catch {}
      }
    }

    return NextResponse.json(finalResult);

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
