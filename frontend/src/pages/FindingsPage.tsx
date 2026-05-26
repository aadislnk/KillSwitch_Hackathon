import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Filter, RefreshCw, Search, Sparkles } from "lucide-react"

import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/store/appStore"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export function FindingsPage() {
  const fetchAll = useAppStore((s) => s.fetchAll)
  const findings = useAppStore((s) => s.findings)
  const triggerDemoScenario = useAppStore((s) => s.triggerDemoScenario)
  const [severity, setSeverity] = useState("all")
  const [provider, setProvider] = useState("all")
  const [status, setStatus] = useState("all")

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const filtered = useMemo(
    () =>
      findings.filter((finding) => {
        const matchesSeverity = severity === "all" || finding.severity === severity
        const matchesProvider = provider === "all" || finding.provider === provider
        const matchesStatus = status === "all" || (finding.status ?? "open") === status
        return matchesSeverity && matchesProvider && matchesStatus
      }),
    [findings, provider, severity, status]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Findings"
        subtitle="AI-enriched savings opportunities from heuristic detection."
        right={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => void fetchAll()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={triggerDemoScenario}>
              <Sparkles className="mr-2 h-4 w-4" />
              Demo finding
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <FilterSelect icon={<Filter className="h-4 w-4" />} value={severity} onChange={setSeverity} options={["all", "low", "medium", "high", "critical"]} />
        <FilterSelect icon={<Search className="h-4 w-4" />} value={provider} onChange={setProvider} options={["all", "github", "aws", "slack", "loom", "saas", "datadog"]} />
        <FilterSelect icon={<Filter className="h-4 w-4" />} value={status} onChange={setStatus} options={["all", "open", "resolved", "dismissed"]} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No findings match these filters" body="Try a broader severity, provider, or status filter." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((finding) => (
            <Card key={finding.id} className="bg-card/80 transition-colors hover:border-sky-400/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="capitalize">{finding.finding_type.replaceAll("_", " ")}</CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge value={String(finding.severity)} />
                      <StatusBadge value={finding.status ?? "open"} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-emerald-300">{money.format(Number(finding.estimated_savings))}</div>
                    <div className="text-xs text-muted-foreground">estimated savings</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail label="Confidence" value={`${Math.round(Number(finding.confidence) * 100)}%`} />
                  <Detail label="Provider" value={finding.provider ?? "unknown"} />
                </div>
                <div>
                  <div className="text-sm font-medium">Recommended action</div>
                  <p className="mt-1 text-sm text-muted-foreground">{finding.recommended_action}</p>
                </div>
                <div>
                  <div className="text-sm font-medium">AI explanation</div>
                  <p className="mt-1 text-sm text-muted-foreground">{finding.explanation ?? finding.reason ?? "No explanation available."}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterSelect(props: { icon: ReactNode; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border bg-card/80 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{props.icon}</span>
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="w-full bg-transparent capitalize outline-none"
      >
        {props.options.map((option) => (
          <option key={option} value={option} className="bg-background">
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/35 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium capitalize">{value}</div>
    </div>
  )
}
