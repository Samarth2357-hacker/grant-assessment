export interface RequirementItem {
  id: string;
  title: string;
  type: "mandatory" | "recommendation";
  status: "met" | "missing" | "weak";
  user_decision?: "confirmed" | "rejected" | "pending";
}

export function calculateCompleteness(requirements: RequirementItem[]): number {
  const mandatory = requirements.filter((r) => r.type === "mandatory");
  if (mandatory.length === 0) return 100;

  const confirmedMet = mandatory.filter(
    (r) => r.status === "met" && r.user_decision === "confirmed"
  );

  return Math.round((confirmedMet.length / mandatory.length) * 100);
}

export function checkIsStale(originalHash: string, currentHash: string): boolean {
  return originalHash !== currentHash;
}