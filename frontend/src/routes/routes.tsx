import type { RouteObject } from "react-router-dom"

import { DashboardLayout } from "@/layouts/DashboardLayout"
import { ActionsLogPage } from "@/pages/ActionsLogPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { FindingsPage } from "@/pages/FindingsPage"
import { IntegrationsPage } from "@/pages/IntegrationsPage"
import { ApprovalsPage } from "@/pages/ApprovalsPage"
import { LandingPage } from "@/pages/LandingPage"
import { RulesPage } from "@/pages/RulesPage"
import { ROUTES } from "@/routes/paths"

export const routes: RouteObject[] = [
  { path: ROUTES.landing, element: <LandingPage /> },
  {
    element: <DashboardLayout />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },
      { path: ROUTES.integrations, element: <IntegrationsPage /> },
      { path: ROUTES.findings, element: <FindingsPage /> },
      { path: ROUTES.rules, element: <RulesPage /> },
      { path: ROUTES.actionsLog, element: <ActionsLogPage /> },
      { path: ROUTES.approvals, element: <ApprovalsPage /> },
    ],
  },
]
