import type { AuthSession, AuthUser } from "@/types/auth"

const ACCESS_TOKEN_KEY = "killswitch_access_token"
const REFRESH_TOKEN_KEY = "killswitch_refresh_token"
const USER_KEY = "killswitch_user"

export function readStoredSession(): Pick<AuthSession, "access_token" | "refresh_token" | "user"> | null {
  const access_token = localStorage.getItem(ACCESS_TOKEN_KEY)
  const userRaw = localStorage.getItem(USER_KEY)

  if (!access_token || !userRaw) {
    return null
  }

  try {
    const user = JSON.parse(userRaw) as AuthUser
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined
    return { access_token, refresh_token, user }
  } catch {
    clearStoredSession()
    return null
  }
}

export function persistSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))

  if (session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export function clearStoredSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}
