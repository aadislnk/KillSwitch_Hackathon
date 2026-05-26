import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"
import { useUIStore } from "@/store/uiStore"
import { NAV_ITEMS } from "@/components/navigation/navItems"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)

  return (
    <aside
      className={cn(
        "border-r bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500/90 to-cyan-400/90 shadow-sm" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold">KillSwitch</div>
              <div className="text-xs text-muted-foreground">
                Cost Autopilot
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      <nav className="p-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                      collapsed && "justify-center px-2"
                    )
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

