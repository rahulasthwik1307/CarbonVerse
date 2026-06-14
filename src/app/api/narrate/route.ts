import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const fallbacks = {
  eco: "A green choice that makes the world brighter! 🌱",
  moderate: "A balanced step forward — keep going! 🌿",
  high: "Awareness is the first step to change! ☀️"
};

export async function POST(req: Request) {
  try {
    const { decision, impactType, worldState, city, chapter, aqi } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ narrative: fallbacks[impactType as keyof typeof fallbacks] || fallbacks.moderate });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are Verd, a tiny magical carbon guide.\nRespond in EXACTLY ONE sentence. Maximum 15 words.\nNever use the user's city name — say 'your city' instead.\nBe warm, brief, emoji at end.\nEco choices: celebrate. High choices: find silver lining. \nModerate: gently encourage better."
        },
        {
          role: "user",
          content: `AQI today: ${aqi}. User chose: ${decision}. Impact: ${impactType}. \nOne sentence, max 15 words, with emoji.`
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
