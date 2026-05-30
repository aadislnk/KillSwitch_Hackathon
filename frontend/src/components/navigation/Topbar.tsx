import { LogOut, Moon, PanelLeft, Sun } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { ROUTES } from "@/routes/paths"
import { useUIStore } from "@/store/uiStore"

export function Topbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  async function handleLogout() {
    await logout()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background/60 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.landing}>Landing</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <div className="hidden md:block">
          <div className="text-sm font-medium">KillSwitch</div>
          <div className="text-xs text-muted-foreground">
            AI-powered SaaS Cost Autopilot
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="hidden items-center gap-2 rounded-lg border bg-card/70 px-3 py-1.5 text-sm md:flex">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-medium">{user.name}</span>
          </div>
        ) : null}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  )
}
