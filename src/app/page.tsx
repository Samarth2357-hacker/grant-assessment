"use client";

import { useState } from "react";
import { calculateCompleteness, checkIsStale, RequirementItem } from "@/lib/completeness";

export default function Home() {
  const [guideline, setGuideline] = useState("");
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<RequirementItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isStale, setIsStale] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setIsStale(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guidelineText: guideline, draftText: draft }),
      });
      
      if (!res.ok) throw new Error("Analysis failed. Check your API key or network.");
      
      const data = await res.json();
      const mappedResults = data.requirements.map((r: any) => ({ ...r, user_decision: "pending" }));
      setResults(mappedResults);
    } catch (err) {
      setError("Failed to analyze documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserDecision = (id: string, decision: "confirmed" | "rejected") => {
    setResults(prev => 
      prev ? prev.map(r => r.id === id ? { ...r, user_decision: decision } : r) : null
    );
  };

  return (
    <main className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">Grant Application Assistant</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-sm text-blue-800">
        <strong>Advisory Only:</strong> This completeness review provides automated structural checks and does not constitute an authoritative legal or funding eligibility determination.
      </div>

      {isStale && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 text-yellow-800">
          ⚠ Documents have been edited. The assessment below is stale. Please re-run the analysis.
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block font-semibold mb-2">Guideline Document</label>
          <textarea 
            className="w-full h-64 p-3 border rounded-md"
            value={guideline}
            onChange={(e) => { setGuideline(e.target.value); if(results) setIsStale(checkIsStale("stale", "changed")); }}
            placeholder="Paste grant requirements here..."
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Draft Application</label>
          <textarea 
            className="w-full h-64 p-3 border rounded-md"
            value={draft}
            onChange={(e) => { setDraft(e.target.value); if(results) setIsStale(checkIsStale("stale", "changed")); }}
            placeholder="Paste application draft here..."
          />
        </div>
      </div>

      <button 
        onClick={handleAnalyze}
        disabled={loading || !guideline || !draft}
        className="bg-gray-900 text-white px-6 py-2 rounded-md disabled:bg-gray-400 mb-8 font-semibold"
      >
        {loading ? "Analyzing via AI..." : "Run Completeness Check"}
      </button>

      {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}

      {results && (
        <div className="border-t pt-8">
          <div className="flex justify-between items-center mb-6 bg-gray-100 p-4 rounded-lg">
            <h2 className="text-2xl font-bold">Review Dashboard</h2>
            <div className="text-2xl font-bold text-blue-700">
              Score: {calculateCompleteness(results)}%
            </div>
          </div>

          <div className="space-y-4">
            {results.map((req) => (
              <div key={req.id} className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{req.title}</h3>
                  <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${req.type === 'mandatory' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'}`}>
                    {req.type}
                  </span>
                </div>
                
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <p className="text-sm"><strong>AI Status:</strong> <span className="uppercase">{req.status}</span></p>
                  {req.unsupported_claim && <p className="text-sm text-red-600 font-bold">⚠ Unsupported Claim Detected</p>}
                </div>
                
                {req.evidence_citation && (
                  <div className="mt-3 bg-gray-50 p-2 border-l-2 border-gray-300">
                    <p className="text-sm italic">"{req.evidence_citation}"</p>
                  </div>
                )}

                {req.clarification_question && (
                  <p className="text-sm text-blue-700 mt-2 font-medium">Q: {req.clarification_question}</p>
                )}
                
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => handleUserDecision(req.id, "confirmed")}
                    className={`px-4 py-2 border rounded font-semibold text-sm transition ${req.user_decision === 'confirmed' ? 'bg-green-100 border-green-500 text-green-800' : 'hover:bg-gray-50'}`}
                  >
                    {req.user_decision === 'confirmed' ? "✓ Confirmed" : "Confirm Mapping"}
                  </button>
                  <button 
                    onClick={() => handleUserDecision(req.id, "rejected")}
                    className={`px-4 py-2 border rounded font-semibold text-sm transition ${req.user_decision === 'rejected' ? 'bg-red-100 border-red-500 text-red-800' : 'hover:bg-gray-50'}`}
                  >
                    {req.user_decision === 'rejected' ? "✕ Rejected" : "Reject Mapping"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}