import {
  Activity,
  Bot,
  Cable,
  Gauge,
  ListChecks,
  ShieldCheck,
} from "lucide-react"

import { ROUTES } from "@/routes/paths"
import type { NavItem } from "@/types/navigation"

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: ROUTES.dashboard, icon: Gauge },
  { label: "Integrations", to: ROUTES.integrations, icon: Cable },
  { label: "Findings", to: ROUTES.findings, icon: Bot },
  { label: "Rules", to: ROUTES.rules, icon: ShieldCheck },
  { label: "Actions Log", to: ROUTES.actionsLog, icon: Activity },
  { label: "Approvals", to: ROUTES.approvals, icon: ListChecks },
]
