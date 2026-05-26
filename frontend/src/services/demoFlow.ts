import { demoScenarioAction, mockFindings } from "@/services/mockData"
import type { ActionLog, Approval, Finding, SpendPoint } from "@/types/api"

export function generateDemoFinding(): Finding {
  return {
    ...mockFindings[3],
    id: `finding-live-${Date.now()}`,
    explanation:
      "Live analysis found overlapping Amplitude and Mixpanel usage across the Growth squad. The recommendation is to alert owners first, then consolidate renewal decisions during procurement review.",
  }
}

export function simulateDemoAction(): ActionLog {
  return {
    ...demoScenarioAction,
    id: `action-live-${Date.now()}`,
    executed_at: new Date().toISOString(),
  }
}

export function generateDemoApproval(findingId: string): Approval {
  return {
    id: `approval-live-${Date.now()}`,
    finding_id: findingId,
    action_id: `action-review-${Date.now()}`,
    status: "pending",
    risk_level: "low",
    recommended_action: "Approve owner notification for duplicate analytics consolidation review.",
  }
}

export function updateSavingsTrend(points: SpendPoint[], savingsDelta: number): SpendPoint[] {
  return points.map((point, index) =>
    index === points.length - 1
      ? { ...point, waste: Math.max(0, point.waste - savingsDelta), savings: point.savings + savingsDelta }
      : point
  )
}
