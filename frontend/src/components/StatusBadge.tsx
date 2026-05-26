import { cn } from "@/lib/utils"

const toneMap: Record<string, string> = {
  critical: "border-red-400/30 bg-red-500/15 text-red-200",
  high: "border-orange-400/30 bg-orange-500/15 text-orange-100",
  medium: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  low: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  completed: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  connected: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  pending: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  safe_execute: "border-sky-400/30 bg-sky-500/15 text-sky-100",
  alert_only: "border-cyan-400/30 bg-cyan-500/15 text-cyan-100",
  approval_required: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  enabled: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  disabled: "border-zinc-400/30 bg-zinc-500/15 text-zinc-200",
  mock: "border-sky-400/30 bg-sky-500/15 text-sky-100",
  ready: "border-sky-400/30 bg-sky-500/15 text-sky-100",
  error: "border-red-400/30 bg-red-500/15 text-red-200",
}

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
        toneMap[value] ?? "border-sky-400/30 bg-sky-500/15 text-sky-100",
        className
      )}
    >
      {value.replaceAll("_", " ")}
    </span>
  )
}
