import type { RouteObject } from "react-router-dom"

import { PrivateRoute } from "@/components/PrivateRoute"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { ActionsLogPage } from "@/pages/ActionsLogPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { FindingsPage } from "@/pages/FindingsPage"
import { IntegrationsPage } from "@/pages/IntegrationsPage"
import { ApprovalsPage } from "@/pages/ApprovalsPage"
import { LandingPage } from "@/pages/LandingPage"
import { RulesPage } from "@/pages/RulesPage"
import { ForgotPassword } from "@/pages/auth/ForgotPassword"
import { Login } from "@/pages/auth/Login"
import { SignUp } from "@/pages/auth/SignUp"
import { ROUTES } from "@/routes/paths"

export const routes: RouteObject[] = [
  { path: ROUTES.landing, element: <LandingPage /> },
  { path: ROUTES.login, element: <Login /> },
  { path: ROUTES.signUp, element: <SignUp /> },
  { path: ROUTES.forgotPassword, element: <ForgotPassword /> },
  {
    element: <PrivateRoute />,
    children: [
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
    ],
  },
]
