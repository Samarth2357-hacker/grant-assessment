import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { z } from "zod";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Relaxed Zod schema to handle slight LLM hallucinations gracefully
const AnalysisSchema = z.object({
  requirements: z.array(
    z.object({
      id: z.coerce.string(), // Forces numbers to become strings
      title: z.string().default("Requirement"),
      type: z.enum(["mandatory", "recommendation"]).default("mandatory"),
      status: z.enum(["met", "missing", "weak"]).default("missing"),
      evidence_citation: z.string().nullable().default(null),
      clarification_question: z.string().nullable().default(null),
      unsupported_claim: z.boolean().default(false),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const { guidelineText, draftText } = await request.json();

    if (!guidelineText || !draftText) {
      return NextResponse.json({ error: "Missing documents" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are a strict JSON API. Extract requirements from the guideline and map the draft against them.
          You MUST return valid JSON matching this exact structure:
          {
            "requirements": [
              {
                "id": "1",
                "title": "Short title",
                "type": "mandatory" or "recommendation",
                "status": "met", "missing", or "weak",
                "evidence_citation": "Quote from text",
                "clarification_question": "Question here",
                "unsupported_claim": false
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Guideline:\n${guidelineText}\n\nDraft Application:\n${draftText}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const rawData = JSON.parse(response.choices[0].message.content || "{}");
    const validatedData = AnalysisSchema.parse(rawData);
    
    return NextResponse.json(validatedData);

  } catch (error) {
    console.error("[System Error] Analysis failed:", error);
    return NextResponse.json({ error: "Analysis failed to process" }, { status: 500 });
  }
}