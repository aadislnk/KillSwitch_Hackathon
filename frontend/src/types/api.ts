export type Severity = "low" | "medium" | "high" | "critical"
export type LoadState = "idle" | "loading" | "ready" | "error"

export type Finding = {
  id: string
  finding_type: string
  severity: Severity | string
  confidence: number | string
  estimated_savings: number | string
  recommended_action: string
  explanation?: string | null
  reason?: string | null
  risk_summary?: string | null
  status?: string
  provider?: string
}

export type Rule = {
  id: string
  condition_type: string
  threshold: string | number
  action: string
  approval_required: boolean
  enabled: boolean
}

export type ActionLog = {
  id: string
  action_type: string
  status: string
  executed_at?: string | null
  savings?: number | string | null
  execution_log?: string | null
  execution_result?: string | null
  execution_mode?: string | null
  rollback_status?: string | null
}

export type Approval = {
  id: string
  finding_id: string
  action_id?: string | null
  status: string
  approved_by?: string | null
  approved_at?: string | null
  risk_level?: Severity | string
  recommended_action?: string
}

export type Integration = {
  id: string
  provider: "github" | "slack" | "aws" | string
  status: string
  last_sync?: string | null
  metadata?: Record<string, unknown>
}

export type DashboardStats = {
  totalSavings: number
  wasteDetected: number
  actionsExecuted: number
  pendingApprovals: number
}

export type SpendPoint = {
  month: string
  spend: number
  waste: number
  savings: number
}

export type DemoCompany = {
  name: string
  industry: string
  employees: number
  monthlySaasSpend: number
  monthlyCloudSpend: number
  inactiveSeats: number
  idleResources: number
  projectedMonthlySavings: number
}
