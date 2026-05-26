import { Loader2 } from "lucide-react"

export function LoadingPanel({ label = "Loading workspace data" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card/70 px-3 py-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}
