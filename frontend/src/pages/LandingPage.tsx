import { Link } from "react-router-dom"
import type { ReactNode } from "react"
import { ArrowRight, Bot, Cable, CheckCircle2, ShieldCheck } from "lucide-react"

import { StatusBadge } from "@/components/StatusBadge"
import { SpendTrendChart } from "@/components/charts/SpendTrendChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { demoCompany, mockFindings, mockIntegrations, mockSpendTrend } from "@/services/mockData"
import { ROUTES } from "@/routes/paths"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export function LandingPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-sm text-muted-foreground">
              <Bot className="h-4 w-4 text-emerald-300" />
              AI-powered SaaS Cost Autopilot
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              KillSwitch finds SaaS waste and routes safe savings actions.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Enterprise teams connect SaaS and cloud spend, detect abandoned subscriptions, and run approval-gated savings workflows from one dark-mode FinOps cockpit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={ROUTES.dashboard}>
                  Open live dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={ROUTES.findings}>View findings</Link>
              </Button>
            </div>
          </div>

          <Card className="bg-card/80">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{demoCompany.name}</CardTitle>
                  <CardDescription>
                    {demoCompany.employees} employees · {demoCompany.industry}
                  </CardDescription>
                </div>
                <StatusBadge value="connected" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <LandingMetric label="Monthly SaaS" value={money.format(demoCompany.monthlySaasSpend)} />
                <LandingMetric label="Cloud spend" value={money.format(demoCompany.monthlyCloudSpend)} />
                <LandingMetric label="Savings found" value={money.format(demoCompany.projectedMonthlySavings)} />
              </div>
              <SpendTrendChart data={mockSpendTrend} mode="line" />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3">
        <StoryCard icon={<Cable />} title="Connect" body="Pull usage and cost signals from GitHub, Slack, and AWS mock connectors." />
        <StoryCard icon={<Bot />} title="Detect" body="Run heuristics first, then enrich only high-signal findings with AI explanations." />
        <StoryCard icon={<ShieldCheck />} title="Control" body="Route actions through alerts, approvals, and sandbox-safe executors." />
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 pb-14 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Live savings showcase</CardTitle>
            <CardDescription>Realistic findings ready for a hackathon walkthrough.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockFindings.slice(0, 3).map((finding) => (
              <div key={finding.id} className="rounded-lg border bg-background/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="truncate text-sm font-medium capitalize">{finding.finding_type.replaceAll("_", " ")}</div>
                  <div className="text-sm font-semibold text-emerald-300">{money.format(Number(finding.estimated_savings))}</div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{finding.explanation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card/80">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Demo-ready sources for SaaS seats, notifications, and cloud waste.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {mockIntegrations.map((integration) => (
              <div key={integration.id} className="rounded-lg border bg-background/35 p-4">
                <div className="flex items-center gap-2 text-sm font-medium capitalize">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {integration.provider}
                </div>
                <div className="mt-3">
                  <StatusBadge value={integration.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

function LandingMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/35 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}

function StoryCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border bg-background/45 text-emerald-300 [&_svg]:h-5 [&_svg]:w-5">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">{body}</CardContent>
    </Card>
  )
}
