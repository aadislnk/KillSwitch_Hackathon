import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

export function EmptyState({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <Card className="border-dashed bg-card/60">
      <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 text-center">
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
        <div>
          <div className="font-medium">{title}</div>
          <div className="mt-1 max-w-md text-sm text-muted-foreground">{body}</div>
        </div>
      </CardContent>
    </Card>
  )
}
