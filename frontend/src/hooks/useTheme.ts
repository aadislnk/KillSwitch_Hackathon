import { useEffect } from "react"

import { useUIStore } from "@/store/uiStore"

/**
 * Keeps the document `dark` class in sync with app theme state.
 * This is intentionally simple; later we can persist to localStorage
 * and/or derive from user/org preferences.
 */
export function useTheme() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else root.classList.remove("dark")
  }, [theme])

  return theme
}

