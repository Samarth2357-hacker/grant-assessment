# Grant Application Completeness Assistant

## Overview
A full-stack, AI-powered application designed to review draft funding applications against supplied grant guidelines. Built as part of the Aggroso Engineering Assessment (Medium Difficulty).

## Architecture & Tech Stack
- **Frontend Framework:** Next.js (App Router, React, Tailwind CSS)
- **Backend API:** Next.js Route Handlers (`/api/analyze`)
- **LLM Orchestration:** OpenAI Node SDK (Routed to Groq's high-speed inference engine using `gpt-oss-20b` for provider-agnostic, low-latency extraction).
- **Validation:** Zod (Strict schema enforcement with coercion for LLM hallucination mitigation).
- **Testing:** Vitest

## Core Features
- **Structured Extraction:** AI isolates mandatory requirements and recommendations from unstructured guideline text.
- **Semantic Mapping:** Maps draft text to requirements, generating exact citations and identifying unsupported claims.
- **Deterministic Scoring:** The completion percentage is calculated via a strict mathematical function (`lib/completeness.ts`), isolating the LLM from mathematical logic to prevent hallucinations.
- **Human-in-the-Loop:** Reviewers can manually Confirm or Reject the AI's mappings to finalize the score.
- **State Versioning (Stale Check):** Modifying either text document after analysis instantly flags the assessment as stale via a React state hash check.

## Setup Instructions
1. Clone the repository.
2. Run `npm install --legacy-peer-deps`
3. Create a `.env` file in the root directory and add: `GROQ_API_KEY="your_api_key_here"`
4. Start the development server: `npm run dev`
5. Run the test suite: `npm test`

## Scope & Limitations
- **Completed:** AI extraction, deterministic scoring, human-in-the-loop review UI, stale state management, unit testing, schema validation.
- **Excluded (As per instructions):** OCR/PDF processing, external grant database search, basic data persistence (DB), and user authentication.