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
          content: "You are Verd, a tiny friendly carbon guide.\nRULES: One sentence only. Max 12 words.\nWarm and encouraging. Emoji at end.\nMatch the meal/commute/lunch context given.\nNEVER truncate or shorten any city name.\nNever mention city name directly."
        },
        {
          role: "user",
          content: `Context: ${chapter}.\nChoice: ${decision}. Impact: ${impactType}.\nAQI today: ${aqi}.\nRespond: one sentence, max 12 words, emoji.`
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
