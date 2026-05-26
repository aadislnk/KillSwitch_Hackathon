import { useEffect, useState } from "react"
import { Plus, ShieldCheck, X } from "lucide-react"

import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/store/appStore"
import type { Rule } from "@/types/api"

export function RulesPage() {
  const fetchAll = useAppStore((s) => s.fetchAll)
  const rules = useAppStore((s) => s.rules)
  const toggleRule = useAppStore((s) => s.toggleRule)
  const [modalOpen, setModalOpen] = useState(false)
  const [draftRules, setDraftRules] = useState<Rule[]>([])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const visibleRules = [...draftRules, ...rules]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rules"
        subtitle="Guardrails that decide whether findings alert, queue approval, or run safe executors."
        right={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New rule
          </Button>
        }
      />

      {visibleRules.length === 0 ? (
        <EmptyState title="No rules configured" body="Create your first automation guardrail to route findings into approvals or alerts." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleRules.map((rule) => (
            <Card key={rule.id} className="bg-card/80">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background/45 text-emerald-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="capitalize">{rule.action.replaceAll("_", " ")}</CardTitle>
                      <div className="mt-2 flex gap-2">
                        <StatusBadge value={rule.approval_required ? "pending" : "connected"} />
                        <StatusBadge value={rule.enabled ? "enabled" : "disabled"} />
                      </div>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                      className="h-4 w-4 accent-emerald-500"
                    />
                    Enabled
                  </label>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <RuleField label="Condition" value={rule.condition_type} />
                <RuleField label="Threshold" value={String(rule.threshold)} />
                <RuleField label="Mode" value={rule.approval_required ? "approval_required" : "auto_execute"} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modalOpen ? (
        <CreateRuleModal
          onClose={() => setModalOpen(false)}
          onCreate={(rule) => {
            setDraftRules((items) => [rule, ...items])
            setModalOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

function RuleField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/35 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  )
}

function CreateRuleModal({ onClose, onCreate }: { onClose: () => void; onCreate: (rule: Rule) => void }) {
  const [condition, setCondition] = useState("estimated_savings")
  const [threshold, setThreshold] = useState("100")
  const [action, setAction] = useState("slack_alert")
  const [approvalRequired, setApprovalRequired] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-lg border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Create rule</div>
            <div className="mt-1 text-sm text-muted-foreground">Draft locally, then persist when backend auth is ready.</div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 grid gap-3">
          <RuleInput label="Condition" value={condition} onChange={setCondition} />
          <RuleInput label="Threshold" value={threshold} onChange={setThreshold} />
          <RuleInput label="Action" value={action} onChange={setAction} />
          <label className="flex items-center justify-between rounded-lg border bg-background/35 px-3 py-2 text-sm">
            Approval required
            <input type="checkbox" checked={approvalRequired} onChange={(event) => setApprovalRequired(event.target.checked)} className="h-4 w-4 accent-emerald-500" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() =>
              onCreate({
                id: `draft-${Date.now()}`,
                condition_type: condition,
                threshold,
                action,
                approval_required: approvalRequired,
                enabled: true,
              })
            }
          >
            Create draft
          </Button>
        </div>
      </div>
    </div>
  )
}

function RuleInput(props: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{props.label}</span>
      <input
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="rounded-lg border bg-background/60 px-3 py-2 outline-none focus:ring-2 focus:ring-ring/40"
      />
    </label>
  )
}
