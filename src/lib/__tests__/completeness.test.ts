import { describe, it, expect } from "vitest";
import { calculateCompleteness, checkIsStale, RequirementItem } from "../completeness";

describe("Deterministic Scoring Engine", () => {
  it("returns 100% when all mandatory requirements are met and confirmed", () => {
    const items: RequirementItem[] = [
      { id: "1", title: "Tax Status", type: "mandatory", status: "met", user_decision: "confirmed" },
      { id: "2", title: "Audit Report", type: "mandatory", status: "met", user_decision: "confirmed" },
      { id: "3", title: "Website Link", type: "recommendation", status: "missing", user_decision: "pending" },
    ];
    expect(calculateCompleteness(items)).toBe(100);
  });

  it("excludes unconfirmed or rejected mandatory items from the score", () => {
    const items: RequirementItem[] = [
      { id: "1", title: "Tax", type: "mandatory", status: "met", user_decision: "confirmed" },
      { id: "2", title: "Audit", type: "mandatory", status: "met", user_decision: "rejected" },
    ];
    expect(calculateCompleteness(items)).toBe(50);
  });
});

describe("Stale Assessment Detection", () => {
  it("detects when document state has deviated", () => {
    expect(checkIsStale("Original", "Edited")).toBe(true);
  });
});