import { create } from "zustand"

export type ThemeMode = "dark" | "light"

type UIState = {
  theme: ThemeMode
  sidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: "dark",
  sidebarCollapsed: false,
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
}))

