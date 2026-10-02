# Agent Usage Documentation

## Tools Used
- **Generative AI:** ChatGPT (GPT-4o / Gemini) acted as a pair-programmer for architectural planning and boilerplate generation.
- **Inference Engine:** Groq API (`gpt-oss-20b`) via the OpenAI SDK for production data extraction.

## Representative Prompts
To ensure deterministic output, I restricted the LLM's prompt to strict extraction rather than decision-making:
> "You are a strict JSON API. Extract requirements from the guideline and map the draft against them. You MUST return valid JSON matching this exact structure..."

## Delegated Work
- **AI Task:** Extracting unstructured text from the Guidelines into distinct JSON objects.
- **AI Task:** Semantic matching of the Draft text to the extracted Guideline items to find citations and formulate clarification questions.
- **Human Task (Code):** The mathematical calculation of the completion score. The AI was explicitly forbidden from calculating the score to prevent hallucinations.
- **Human Task (Code):** Implementing Zod schema coercion to handle the AI's type mismatches.

## Important Agent Mistakes & Corrections
1. **Mistake:** Initially, the LLM attempted to calculate the completion percentage itself, which resulted in hallucinatory math.
2. **Correction:** I stripped mathematical responsibilities from the AI. I built a custom JavaScript function (`lib/completeness.ts`) to calculate the score deterministically based only on items marked `type: "mandatory"`.
3. **Mistake:** The open-weights model occasionally returned numeric IDs (e.g., `1` instead of `"1"`) breaking the strict JSON schema.
4. **Correction:** I implemented `z.coerce.string()` and default fallback values in the Zod validation layer, creating a fault-tolerant boundary that fixes minor LLM formatting errors before they reach the frontend.