import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const fallbacks = {
  eco: "Every green choice plants a seed for tomorrow. Your world grows a little brighter! 🌱",
  moderate: "A balanced choice today. Small steps lead to big changes over time. 🌿",
  high: "No worries — awareness is the first step to change. Tomorrow is a new opportunity! ☀️"
};

export async function POST(req: Request) {
  try {
    const { decision, impactType, worldState, city, chapter } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ narrative: fallbacks[impactType as keyof typeof fallbacks] || fallbacks.moderate });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Verd, a friendly carbon guide in CarbonVerse.\nRespond in 1-2 warm, encouraging sentences (max 120 tokens).\nNever shame the user. Always be hopeful and positive.\nReference their city when relevant.\nFor eco choices: celebrate with gentle enthusiasm.\nFor high-impact choices: find a silver lining.\nFor moderate: acknowledge and gently suggest better."
        },
        {
          role: "user",
          content: `Chapter: ${chapter}. City: ${city}.\nUser chose: ${decision}. Impact: ${impactType}.\nCurrent world: skyQuality=${worldState.skyQuality}, treeDensity=${worldState.treeDensity}.\nGenerate a short encouraging narrative response.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 120,
    });

    const narrative = completion.choices[0]?.message?.content || fallbacks[impactType as keyof typeof fallbacks] || fallbacks.moderate;

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json({ narrative: fallbacks.moderate });
  }
}
