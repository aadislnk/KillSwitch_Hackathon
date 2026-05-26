import { create } from "zustand"

import { api } from "@/services/api"
import {
  generateDemoApproval,
  generateDemoFinding,
  simulateDemoAction,
  updateSavingsTrend,
} from "@/services/demoFlow"
import {
  demoCompany,
  mockActions,
  mockApprovals,
  mockFindings,
  mockIntegrations,
  mockRules,
  mockSpendTrend,
} from "@/services/mockData"
import type {
  ActionLog,
  Approval,
  DashboardStats,
  DemoCompany,
  Finding,
  Integration,
  LoadState,
  Rule,
  SpendPoint,
} from "@/types/api"

type AppState = {
  findings: Finding[]
  rules: Rule[]
  actions: ActionLog[]
  approvals: Approval[]
  integrations: Integration[]
  spendTrend: SpendPoint[]
  company: DemoCompany
  loadState: LoadState
  error: string | null
  usingFallback: boolean
  fetchAll: () => Promise<void>
  refreshFindings: () => Promise<void>
  refreshRules: () => Promise<void>
  refreshActions: () => Promise<void>
  refreshApprovals: () => Promise<void>
  approveRequest: (id: string) => Promise<void>
  rejectRequest: (id: string) => Promise<void>
  toggleRule: (id: string) => void
  triggerDemoScenario: () => void
  simulateActionProgress: () => void
}

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0) || 0

export function deriveDashboardStats(
  findings: Finding[],
  actions: ActionLog[],
  approvals: Approval[]
): DashboardStats {
  return {
    totalSavings: findings.reduce((sum, item) => sum + toNumber(item.estimated_savings), 0),
    wasteDetected: findings.filter((item) => item.status !== "resolved").length,
    actionsExecuted: actions.filter((item) => item.status === "completed").length,
    pendingApprovals: approvals.filter((item) => item.status === "pending").length,
  }
}

export const selectDashboardStats = (state: AppState): DashboardStats => ({
  totalSavings: state.findings.reduce((sum, item) => sum + toNumber(item.estimated_savings), 0),
  wasteDetected: state.findings.filter((item) => item.status !== "resolved").length,
  actionsExecuted: state.actions.filter((item) => item.status === "completed").length,
  pendingApprovals: state.approvals.filter((item) => item.status === "pending").length,
})

export const useAppStore = create<AppState>((set, get) => ({
  findings: mockFindings,
  rules: mockRules,
  actions: mockActions,
  approvals: mockApprovals,
  integrations: mockIntegrations,
  spendTrend: mockSpendTrend,
  company: demoCompany,
  loadState: "idle",
  error: null,
  usingFallback: true,

  fetchAll: async () => {
    if (get().loadState === "loading") {
      console.warn("[KillSwitch] Ignored duplicate fetchAll while data is already loading.")
      return
    }

    set({ loadState: "loading", error: null })
    try {
      const [findings, rules, actions, approvals, integrations] = await Promise.all([
        api.findings(),
        api.rules(),
        api.actions(),
        api.approvals(),
        api.integrations(),
      ])

      set({
        findings: findings.length ? findings : mockFindings,
        rules: rules.length ? rules : mockRules,
        actions: actions.length ? actions : mockActions,
        approvals: approvals.length ? approvals : mockApprovals,
        integrations: integrations.length ? integrations : mockIntegrations,
        spendTrend: mockSpendTrend,
        loadState: "ready",
        usingFallback:
          !findings.length || !rules.length || !actions.length || !approvals.length || !integrations.length,
      })
    } catch (error) {
      console.warn("[KillSwitch] API unavailable; using demo fallback data.", error)
      set({
        findings: mockFindings,
        rules: mockRules,
        actions: mockActions,
        approvals: mockApprovals,
        integrations: mockIntegrations,
        spendTrend: mockSpendTrend,
        loadState: "error",
        usingFallback: true,
        error: error instanceof Error ? error.message : "API unavailable",
      })
    }
  },

  refreshFindings: async () => {
    const findings = await api.findings()
    set({ findings: findings.length ? findings : mockFindings, usingFallback: !findings.length })
  },

  refreshRules: async () => {
    const rules = await api.rules()
    set({ rules: rules.length ? rules : mockRules, usingFallback: !rules.length })
  },

  refreshActions: async () => {
    const actions = await api.actions()
    set({ actions: actions.length ? actions : mockActions, usingFallback: !actions.length })
  },

  refreshApprovals: async () => {
    const approvals = await api.approvals()
    set({ approvals: approvals.length ? approvals : mockApprovals, usingFallback: !approvals.length })
  },

  approveRequest: async (id: string) => {
    try {
      await api.approve(id)
    } finally {
      set({ approvals: get().approvals.map((item) => (item.id === id ? { ...item, status: "approved" } : item)) })
    }
  },

  rejectRequest: async (id: string) => {
    try {
      await api.reject(id)
    } finally {
      set({ approvals: get().approvals.map((item) => (item.id === id ? { ...item, status: "rejected" } : item)) })
    }
  },

  toggleRule: (id: string) => {
    set({ rules: get().rules.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule)) })
  },

  triggerDemoScenario: () => {
    const finding = generateDemoFinding()
    const approval = generateDemoApproval(finding.id)
    set({
      findings: [finding, ...get().findings],
      approvals: [approval, ...get().approvals],
      loadState: "ready",
      usingFallback: true,
    })
  },

  simulateActionProgress: () => {
    const action = simulateDemoAction()
    set({
      actions: [action, ...get().actions],
      approvals: get().approvals.map((approval) =>
        approval.id === "approval-analytics-consolidation" ? { ...approval, status: "approved" } : approval
      ),
      spendTrend: updateSavingsTrend(get().spendTrend, Number(action.savings ?? 0)),
    })
  },
}))
