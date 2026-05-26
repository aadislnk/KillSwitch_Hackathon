import { Outlet } from "react-router-dom"

import { Sidebar } from "@/components/navigation/Sidebar"
import { Topbar } from "@/components/navigation/Topbar"
import { useTheme } from "@/hooks/useTheme"

export function DashboardLayout() {
  // Ensure theme class is applied early on mount.
  useTheme()

  return (
    <div className="min-h-dvh bg-background">
      <div className="flex min-h-dvh">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 md:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

