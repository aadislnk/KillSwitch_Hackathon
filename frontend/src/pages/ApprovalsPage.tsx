import { useEffect } from "react"
import { Check, ShieldAlert, X } from "lucide-react"

import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { StatusBadge } from "@/components/StatusBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/store/appStore"

export function ApprovalsPage() {
  const fetchAll = useAppStore((s) => s.fetchAll)
  const approve = useAppStore((s) => s.approveRequest)
  const reject = useAppStore((s) => s.rejectRequest)
  const approvals = useAppStore((s) => s.approvals)
  const pending = approvals.filter((approval) => approval.status === "pending")

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" subtitle="Human review queue for higher-risk or policy-gated automation." />

      {pending.length === 0 ? (
        <EmptyState title="Approval queue is clear" body="New approval requests appear here when rules require human review." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {pending.map((approval) => (
            <Card key={approval.id} className="bg-card/80">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background/45 text-amber-300">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>Approval request</CardTitle>
                      <div className="mt-2 flex gap-2">
                        <StatusBadge value={approval.status} />
                        <StatusBadge value={approval.risk_level ?? "medium"} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-background/35 p-3">
                  <div className="text-xs text-muted-foreground">Recommended action</div>
                  <div className="mt-1 text-sm">{approval.recommended_action ?? "Review the linked finding before execution."}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ApprovalField label="Finding" value={approval.finding_id} />
                  <ApprovalField label="Action" value={approval.action_id ?? "pending action"} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => void reject(approval.id)}>
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => void approve(approval.id)}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ApprovalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-background/35 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-sm font-medium">{value}</div>
    </div>
  )
}
