import { useEffect } from "react"
import { Cloud, GitBranch, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react"

import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/services/api"
import { useAppStore } from "@/store/appStore"
import type { Integration } from "@/types/api"

const iconMap = {
  github: GitBranch,
  slack: MessageSquare,
  aws: Cloud,
}

export function IntegrationsPage() {
  const fetchAll = useAppStore((s) => s.fetchAll)
  const integrations = useAppStore((s) => s.integrations)

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrations"
        subtitle="Connect SaaS and cloud sources, then sync normalized spend records into KillSwitch."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      <Card className="bg-card/80">
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <IntegrationSignal label="Normalized records" value="1,284" />
          <IntegrationSignal label="Last full sync" value="11 minutes ago" />
          <IntegrationSignal label="Sync health" value="Healthy" />
        </CardContent>
      </Card>
    </div>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const Icon = iconMap[integration.provider as keyof typeof iconMap] ?? Cloud
  const sync = async () => {
    if (integration.provider === "aws") {
      await api.awsMockData()
    }
  }

  return (
    <Card className="bg-card/80 transition-colors hover:border-emerald-400/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background/45 text-emerald-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="capitalize">{integration.provider} integration</CardTitle>
              <CardDescription>{lastSyncLabel(integration.last_sync)}</CardDescription>
            </div>
          </div>
          <StatusBadge value={integration.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-background/35 p-3 text-sm text-muted-foreground">
          {integration.provider === "github"
            ? "Seat activity and inactive member sync."
            : integration.provider === "slack"
              ? "Webhook alerts and action summaries."
              : "Mock EC2 spend and utilization data."}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" variant="secondary">
            Connect
          </Button>
          <Button className="flex-1" variant="outline" onClick={() => void sync()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function lastSyncLabel(value?: string | null) {
  if (!value) return "Not synced yet"
  return `Last synced ${new Date(value).toLocaleString()}`
}

function IntegrationSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background/35 p-3">
      <ShieldCheck className="h-4 w-4 text-emerald-300" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  )
}
