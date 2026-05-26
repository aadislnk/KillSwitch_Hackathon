import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { SpendPoint } from "@/types/api"

type Props = {
  data: SpendPoint[]
  mode?: "area" | "line"
}

export function SpendTrendChart({ data, mode = "area" }: Props) {
  const tooltipStyle = {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--foreground))",
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {mode === "area" ? (
          <AreaChart data={data} margin={{ top: 10, right: 18, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <Tooltip cursor={{ opacity: 0.08 }} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="spend" stroke="#22c55e" fill="url(#spendFill)" strokeWidth={2} />
            <Area type="monotone" dataKey="waste" stroke="#f59e0b" fill="transparent" strokeWidth={2} />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 10, right: 18, left: -4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.14} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <Tooltip cursor={{ opacity: 0.08 }} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="savings" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="waste" stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
