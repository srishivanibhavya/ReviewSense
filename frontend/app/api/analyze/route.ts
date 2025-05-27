// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  const body = await req.json();
  const { summary, text, score, numerator, denominator } = body;

  const prompt = `
You are a product review analysis expert. Analyze the following review and decide if it is helpful to future buyers.

Review Summary: "${summary}"
Review Text: "${text}"
Star Rating: ${score} stars
Helpfulness Votes: ${numerator}
Total Votes: ${denominator}

Respond in this format:
Prediction: [✅ or ❌] [Short reason]
Confidence: [Confidence %]
`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const response = chat.choices[0].message.content || "";

    const predictionMatch = response.match(/Prediction:\s*(.+)/i);
    const confidenceMatch = response.match(/Confidence:\s*(.+)/i);

    return NextResponse.json({
      prediction: predictionMatch?.[1]?.trim() || "❌ Not helpful review",
      confidence: confidenceMatch?.[1]?.trim() || "50%",
    });
  } catch (e) {
    console.error("OpenAI error:", e);
    return NextResponse.json({ error: "Failed to analyze review" }, { status: 500 });
  }
}
