import type { ActionLog, Approval, DemoCompany, Finding, Integration, Rule, SpendPoint } from "@/types/api"

const now = Date.now()

export const demoCompany: DemoCompany = {
  name: "Northstar BioSystems",
  industry: "Enterprise life sciences",
  employees: 642,
  monthlySaasSpend: 89420,
  monthlyCloudSpend: 47180,
  inactiveSeats: 38,
  idleResources: 11,
  projectedMonthlySavings: 18470,
}

export const mockFindings: Finding[] = [
  {
    id: "finding-loom-abandoned",
    finding_type: "zombie_subscription",
    severity: "high",
    confidence: 0.91,
    estimated_savings: 300,
    recommended_action: "Route to marketing owner, then downgrade Loom Business if no team needs it.",
    explanation:
      "This Loom Business workspace has shown zero activity for 47 days while costing $300/month. Based on historical usage patterns, the workspace is likely abandoned after the enablement team moved recordings into Notion.",
    reason: "No usage for 47 days while monthly cost remains above the zombie subscription threshold.",
    status: "open",
    provider: "loom",
  },
  {
    id: "finding-github-unused-seats",
    finding_type: "unused_seats",
    severity: "critical",
    confidence: 0.94,
    estimated_savings: 2160,
    recommended_action: "Request engineering approval to reclaim 18 inactive GitHub Enterprise seats.",
    explanation:
      "Eighteen GitHub Enterprise seats have usage scores below 10 and no commit, pull request, or issue activity in 35-82 days. The accounts map to contractors whose Okta status is inactive, so reclaiming them is low-risk after approval.",
    risk_summary: "Medium operational risk because developer access changes should remain approval-gated.",
    status: "open",
    provider: "github",
  },
  {
    id: "finding-idle-staging-ec2",
    finding_type: "idle_resource",
    severity: "high",
    confidence: 0.87,
    estimated_savings: 1240,
    recommended_action: "Schedule nightly shutdown for staging EC2 and resize two oversized workers.",
    explanation:
      "The staging analytics EC2 cluster averaged 4.8% CPU for the last 21 days while costing $1,240/month. Traffic is limited to weekday QA windows, making a schedule-based shutdown safer than termination.",
    risk_summary: "Low production risk; staging availability should be confirmed with QA before applying schedules.",
    status: "open",
    provider: "aws",
  },
  {
    id: "finding-duplicate-analytics",
    finding_type: "duplicate_tool",
    severity: "medium",
    confidence: 0.72,
    estimated_savings: 1880,
    recommended_action: "Consolidate Amplitude and Mixpanel event analytics ownership into a single renewal path.",
    explanation:
      "Product analytics events are being sent to both Amplitude and Mixpanel for the same growth funnels. Mixpanel has 11 active viewers versus 74 in Amplitude, suggesting the renewal can be reduced or retired.",
    status: "open",
    provider: "saas",
  },
  {
    id: "finding-datadog-spike",
    finding_type: "cost_spike",
    severity: "medium",
    confidence: 0.79,
    estimated_savings: 620,
    recommended_action: "Review Datadog log retention and noisy staging services before the next billing cycle.",
    explanation:
      "Datadog log ingest increased 42% month-over-month after staging debug logs were enabled. The spike appears isolated to non-production services and can likely be reduced without observability loss.",
    status: "open",
    provider: "datadog",
  },
]

export const mockRules: Rule[] = [
  {
    id: "rule-critical-approval",
    condition_type: "estimated_savings",
    threshold: 1000,
    action: "slack_alert",
    approval_required: true,
    enabled: true,
  },
  {
    id: "rule-github-seat-review",
    condition_type: "finding_type",
    threshold: "unused_seats",
    action: "github_remove_seat",
    approval_required: true,
    enabled: true,
  },
  {
    id: "rule-idle-cloud",
    condition_type: "provider",
    threshold: "aws",
    action: "mock_cloud_action",
    approval_required: true,
    enabled: true,
  },
  {
    id: "rule-low-risk-alert",
    condition_type: "confidence",
    threshold: 0.85,
    action: "slack_alert",
    approval_required: false,
    enabled: true,
  },
]

export const mockActions: ActionLog[] = [
  {
    id: "action-slack-briefing",
    action_type: "slack_alert",
    status: "completed",
    executed_at: new Date(now - 1000 * 60 * 18).toISOString(),
    savings: 300,
    execution_mode: "alert_only",
    execution_log: "Posted Loom zombie subscription summary to #finops-automation.",
    rollback_status: "not_required",
  },
  {
    id: "action-github-approval",
    action_type: "github_remove_seat",
    status: "pending",
    executed_at: new Date(now - 1000 * 60 * 42).toISOString(),
    savings: 2160,
    execution_mode: "approval_required",
    execution_log: "Queued engineering approval for 18 inactive GitHub Enterprise seats.",
    rollback_status: "available",
  },
  {
    id: "action-ec2-schedule",
    action_type: "mock_cloud_action",
    status: "completed",
    executed_at: new Date(now - 1000 * 60 * 72).toISOString(),
    savings: 1240,
    execution_mode: "safe_execute",
    execution_log: "Simulated staging EC2 shutdown schedule. No real infrastructure was changed.",
    rollback_status: "not_required",
  },
]

export const mockApprovals: Approval[] = [
  {
    id: "approval-github-seats",
    finding_id: "finding-github-unused-seats",
    action_id: "action-github-approval",
    status: "pending",
    risk_level: "medium",
    recommended_action: "Approve reclaiming 18 GitHub seats after engineering manager review.",
  },
  {
    id: "approval-analytics-consolidation",
    finding_id: "finding-duplicate-analytics",
    action_id: "action-analytics-review",
    status: "pending",
    risk_level: "low",
    recommended_action: "Approve Slack owner notification for duplicate analytics renewal review.",
  },
]

export const mockIntegrations: Integration[] = [
  {
    id: "github",
    provider: "github",
    status: "connected",
    last_sync: new Date(now - 1000 * 60 * 11).toISOString(),
    metadata: { org: "northstar-biosystems", seats: 214, inactive_seats: 18 },
  },
  {
    id: "slack",
    provider: "slack",
    status: "connected",
    last_sync: new Date(now - 1000 * 60 * 6).toISOString(),
    metadata: { channel: "#finops-automation" },
  },
  {
    id: "aws",
    provider: "aws",
    status: "mock",
    last_sync: new Date(now - 1000 * 60 * 23).toISOString(),
    metadata: { accounts: 3, idle_resources: 11 },
  },
]

export const mockSpendTrend: SpendPoint[] = [
  { month: "Jan", spend: 119800, waste: 21400, savings: 3200 },
  { month: "Feb", spend: 124600, waste: 23700, savings: 6100 },
  { month: "Mar", spend: 131900, waste: 26800, savings: 8200 },
  { month: "Apr", spend: 137200, waste: 29100, savings: 11900 },
  { month: "May", spend: 134400, waste: 24600, savings: 14800 },
  { month: "Jun", spend: 126600, waste: 18470, savings: 18470 },
]

export const demoScenarioAction: ActionLog = {
  id: "action-demo-live",
  action_type: "slack_alert",
  status: "completed",
  executed_at: new Date().toISOString(),
  savings: 1880,
  execution_mode: "alert_only",
  execution_log: "Live demo: notified product operations to consolidate duplicate analytics tools.",
  rollback_status: "not_required",
}
