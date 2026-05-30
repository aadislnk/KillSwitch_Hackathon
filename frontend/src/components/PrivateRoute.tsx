import { Navigate, Outlet, useLocation } from "react-router-dom"

import { LoadingPanel } from "@/components/LoadingPanel"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/paths"

export function PrivateRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <LoadingPanel label="Restoring your session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
