import type React from "react"

import { cn } from "@/lib/utils"

type Props = {
  title: string
  subtitle?: string
  right?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, right, className }: Props) {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-4", className)}>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

