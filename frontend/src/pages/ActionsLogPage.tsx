import { useEffect } from "react"
import { Activity, Cloud, GitBranch, Mail, MessageSquare, RefreshCw } from "lucide-react"

import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAppStore } from "@/store/appStore"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export function ActionsLogPage() {
  const fetchAll = useAppStore((s) => s.fetchAll)
  const actions = useAppStore((s) => s.actions)

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actions Log"
        subtitle="Timeline of alerts, approval gates, and sandbox-safe executor activity."
        right={
          <Button variant="outline" onClick={() => void fetchAll()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {actions.length === 0 ? (
        <EmptyState title="No actions logged" body="Actions appear here after findings are routed through rules and executors." />
      ) : (
        <div className="relative space-y-4 before:absolute before:left-5 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
          {actions.map((action) => (
            <Card key={action.id} className="ml-10 bg-card/80">
              <CardContent className="p-4">
                <div className="absolute -left-[34px] mt-1 flex h-9 w-9 items-center justify-center rounded-full border bg-background text-sky-300">
                  <ActionIcon type={action.action_type} />
                </div>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 font-medium capitalize">
                      {action.action_type.replaceAll("_", " ")}
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-100">
                        {money.format(Number(action.savings ?? 0))}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{action.execution_log ?? "No log message."}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge value={action.status} />
                    {action.execution_mode ? <StatusBadge value={action.execution_mode} /> : null}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <TimelineField label="Savings" value={money.format(Number(action.savings ?? 0))} />
                  <TimelineField label="Timestamp" value={action.executed_at ? new Date(action.executed_at).toLocaleString() : "Pending"} />
                  <TimelineField label="Rollback" value={action.rollback_status ?? "not_required"} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TimelineField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/35 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  )
}

function ActionIcon({ type }: { type: string }) {
  if (type.includes("slack")) return <MessageSquare className="h-4 w-4" />
  if (type.includes("github")) return <GitBranch className="h-4 w-4" />
  if (type.includes("cloud")) return <Cloud className="h-4 w-4" />
  if (type.includes("email")) return <Mail className="h-4 w-4" />
  return <Activity className="h-4 w-4" />
}
