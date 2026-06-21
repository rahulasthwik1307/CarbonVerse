import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ reply: "I'm Verd! (API key missing, I'm offline right now). 🌱" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Build the system prompt using the dynamic context
    const systemPrompt = `You are Verd, a friendly, warm, and highly knowledgeable AI sustainability assistant.
You guide the user in an app called CarbonVerse.
Answer concisely (1-3 short sentences max) and use emojis.

USER CONTEXT:
${context}

When the user asks about their own data (missions, carbon footprint, story), use the CONTEXT provided above.
When they ask general sustainability questions (climate change, AQI, renewables), provide an accurate, helpful answer.
Do not mention that you have access to "context" or "data", just answer naturally.`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
    });

    const reply = completion.choices[0]?.message?.content || "I'm having trouble thinking right now. 🌿";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Groq API error (Assistant):", error);
    return NextResponse.json({ reply: "Looks like my connection to the green network dropped! 🍃" });
  }
}
