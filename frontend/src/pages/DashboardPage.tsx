import { useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import { Activity, AlertTriangle, Building2, CheckCircle2, CircleDollarSign, Clock, Play, RefreshCw, Sparkles } from "lucide-react"

import { PageHeader } from "@/components/PageHeader"
import { LoadingPanel } from "@/components/LoadingPanel"
import { Skeleton } from "@/components/Skeleton"
import { StatusBadge } from "@/components/StatusBadge"
import { SpendTrendChart } from "@/components/charts/SpendTrendChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deriveDashboardStats, useAppStore } from "@/store/appStore"

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export function DashboardPage() {
  const fetchAll = useAppStore((s) => s.fetchAll)
  const findings = useAppStore((s) => s.findings)
  const actions = useAppStore((s) => s.actions)
  const approvals = useAppStore((s) => s.approvals)
  const spendTrend = useAppStore((s) => s.spendTrend)
  const loadState = useAppStore((s) => s.loadState)
  const usingFallback = useAppStore((s) => s.usingFallback)
  const company = useAppStore((s) => s.company)
  const triggerDemoScenario = useAppStore((s) => s.triggerDemoScenario)
  const simulateActionProgress = useAppStore((s) => s.simulateActionProgress)
  // Avoid returning a fresh object from a Zustand selector; memoized derived
  // stats keep React's external-store snapshot stable and stop render loops.
  const stats = useMemo(
    () => deriveDashboardStats(findings, actions, approvals),
    [actions, approvals, findings]
  )

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Live SaaS waste posture, automation health, and approval pressure."
        right={
          <Button variant="outline" onClick={() => void fetchAll()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {loadState === "loading" ? <LoadingPanel /> : null}
      {usingFallback ? (
        <div className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Showing resilient mock data while the API is unavailable or empty.
        </div>
      ) : null}

      <Card className="bg-card/80">
        <CardContent className="grid gap-4 p-4 md:grid-cols-[1.2fr_0.8fr_auto] md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-background/45 text-emerald-300">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{company.name}</div>
              <div className="text-sm text-muted-foreground">
                {company.employees} employees · {company.inactiveSeats} inactive seats · {company.idleResources} idle cloud resources
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Projected monthly savings: <span className="font-semibold text-emerald-300">{currency.format(company.projectedMonthlySavings)}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={triggerDemoScenario}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate scenario
            </Button>
            <Button onClick={simulateActionProgress}>
              <Play className="mr-2 h-4 w-4" />
              Simulate action
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<CircleDollarSign />} title="Total savings" value={currency.format(stats.totalSavings)} hint="Detected monthly opportunity" />
        <MetricCard icon={<AlertTriangle />} title="Waste detected" value={String(stats.wasteDetected)} hint="Open findings" />
        <MetricCard icon={<CheckCircle2 />} title="Actions executed" value={String(stats.actionsExecuted)} hint="Completed automation logs" />
        <MetricCard icon={<Clock />} title="Pending approvals" value={String(stats.pendingApprovals)} hint="Awaiting review" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Spend overview</CardTitle>
            <CardDescription>Spend, waste, and savings trend from synced SaaS and cloud records.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadState === "loading" ? <Skeleton className="h-[220px]" /> : <SpendTrendChart data={spendTrend} />}
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Recent findings</CardTitle>
            <CardDescription>Highest-signal recommendations from the AI findings engine.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {findings.slice(0, 4).map((finding) => (
              <div key={finding.id} className="rounded-lg border bg-background/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-medium capitalize">{finding.finding_type.replaceAll("_", " ")}</div>
                  <StatusBadge value={String(finding.severity)} />
                </div>
                <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{finding.explanation ?? finding.recommended_action}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Recent actions</CardTitle>
          <CardDescription>Auditable automation activity across alert, approval, and safe execution modes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {actions.slice(0, 6).map((action) => (
            <div key={action.id} className="rounded-lg border bg-background/35 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate text-sm font-medium">
                  <Activity className="h-4 w-4 text-sky-300" />
                  <span className="truncate capitalize">{action.action_type.replaceAll("_", " ")}</span>
                </div>
                <StatusBadge value={action.status} />
              </div>
              <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">{action.execution_log ?? "No execution log available."}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard(props: { icon: ReactNode; title: string; value: string; hint: string }) {
  return (
    <Card className="bg-card/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{props.title}</CardTitle>
          <div className="text-emerald-300 [&_svg]:h-4 [&_svg]:w-4">{props.icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{props.value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{props.hint}</div>
      </CardContent>
    </Card>
  )
}
