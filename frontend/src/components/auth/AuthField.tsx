import type { InputHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

type AuthFieldProps = {
  label: string
  error?: string
  hint?: ReactNode
} & InputHTMLAttributes<HTMLInputElement>

export function AuthField({ label, error, hint, className, id, ...props }: AuthFieldProps) {
  const fieldId = id ?? props.name

  return (
    <label htmlFor={fieldId} className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        id={fieldId}
        className={cn(
          "rounded-lg border bg-background/60 px-3 py-2 outline-none transition focus:ring-2 focus:ring-ring/40",
          error && "border-destructive/70 focus:ring-destructive/30",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span id={`${fieldId}-error`} className="text-xs text-destructive">
          {error}
        </span>
      ) : null}
      {!error && hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

export function AuthAlert({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "success" }) {
  const styles =
    tone === "success"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
      : "border-destructive/25 bg-destructive/10 text-destructive-foreground"

  return <div className={cn("rounded-lg border px-3 py-2 text-sm", styles)}>{children}</div>
}

export function AuthLinkRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">{children}</div>
}
