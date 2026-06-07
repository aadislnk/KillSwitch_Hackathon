import axios from "axios"

import { clearStoredSession, persistSession, readStoredSession } from "@/lib/authStorage"
import { http } from "@/services/http"
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordRequest,
  LoginCredentials,
  ResetPasswordRequest,
  SignUpCredentials,
} from "@/types/auth"

const LOCAL_USERS_KEY = "killswitch_local_users"
const LOCAL_RESETS_KEY = "killswitch_local_resets"

type LocalUserRecord = {
  id: string
  name: string
  email: string
  password: string
  company_name?: string
}

type LocalResetRecord = {
  email: string
  token: string
  expiresAt: number
}

function useLocalAuth(): boolean {
  if (import.meta.env.VITE_AUTH_MODE === "local") return true
  if (import.meta.env.VITE_AUTH_MODE === "api") return false
  return import.meta.env.DEV
}

function createToken(user: AuthUser): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Date.now(),
  }
  return btoa(JSON.stringify(payload))
}

function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token)) as {
      sub: string
      email: string
      name: string
      company_name?: string
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      company_name: payload.company_name,
    }
  } catch {
    return null
  }
}

function readLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    return raw ? (JSON.parse(raw) as LocalUserRecord[]) : []
  } catch {
    return []
  }
}

function writeLocalUsers(users: LocalUserRecord[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

function readLocalResets(): LocalResetRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_RESETS_KEY)
    return raw ? (JSON.parse(raw) as LocalResetRecord[]) : []
  } catch {
    return []
  }
}

function writeLocalResets(resets: LocalResetRecord[]): void {
  localStorage.setItem(LOCAL_RESETS_KEY, JSON.stringify(resets))
}

function toSession(user: AuthUser): AuthSession {
  const access_token = createToken(user)
  return {
    access_token,
    refresh_token: access_token,
    token_type: "bearer",
    user,
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data as { detail?: string | { msg?: string }[] } | undefined
    if (typeof detail?.detail === "string") return detail.detail
    if (Array.isArray(detail?.detail) && detail.detail[0]?.msg) return detail.detail[0].msg
    if (error.response?.status === 401) return "Invalid email or password."
    if (error.response?.status === 409) return "An account with this email already exists."
    if (!error.response) return "Unable to reach the authentication service. Try again shortly."
  }
  return fallback
}

async function localRegister(credentials: SignUpCredentials): Promise<AuthSession> {
  const email = credentials.email.trim().toLowerCase()
  const users = readLocalUsers()

  if (users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists.")
  }

  const record: LocalUserRecord = {
    id: crypto.randomUUID(),
    name: credentials.name.trim(),
    email,
    password: credentials.password,
    company_name: credentials.company_name?.trim(),
  }

  writeLocalUsers([...users, record])
  return toSession({
    id: record.id,
    name: record.name,
    email: record.email,
    company_name: record.company_name,
  })
}

async function localLogin(credentials: LoginCredentials): Promise<AuthSession> {
  const email = credentials.email.trim().toLowerCase()
  const user = readLocalUsers().find((entry) => entry.email === email)

  if (!user || user.password !== credentials.password) {
    throw new Error("Invalid email or password.")
  }

  return toSession({
    id: user.id,
    name: user.name,
    email: user.email,
    company_name: user.company_name,
  })
}

async function localForgotPassword(request: ForgotPasswordRequest): Promise<void> {
  const email = request.email.trim().toLowerCase()
  const user = readLocalUsers().find((entry) => entry.email === email)

  if (!user) {
    // Avoid account enumeration in local mode as well.
    return
  }

  const token = crypto.randomUUID().replaceAll("-", "")
  const resets = readLocalResets().filter((entry) => entry.email !== email)
  writeLocalResets([
    ...resets,
    {
      email,
      token,
      expiresAt: Date.now() + 60 * 60 * 1000,
    },
  ])

  console.info("[local auth] Password reset token generated:", { email, token })
}

async function localResetPassword(request: ResetPasswordRequest): Promise<void> {
  const email = request.email.trim().toLowerCase()
  const resets = readLocalResets()
  const match = resets.find(
    (entry) => entry.email === email && entry.token === request.token && entry.expiresAt > Date.now()
  )

  if (!match) {
    throw new Error("This reset link is invalid or has expired.")
  }

  const users = readLocalUsers()
  const index = users.findIndex((entry) => entry.email === email)
  if (index === -1) {
    throw new Error("Unable to locate the account for this reset request.")
  }

  users[index] = { ...users[index], password: request.password }
  writeLocalUsers(users)
  writeLocalResets(resets.filter((entry) => entry.email !== email))
}

async function localGetCurrentUser(token: string): Promise<AuthUser> {
  const parsed = parseToken(token)
  if (!parsed) {
    throw new Error("Session expired.")
  }

  const stored = readLocalUsers().find((entry) => entry.id === parsed.id)
  if (!stored) {
    throw new Error("Session expired.")
  }

  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    company_name: stored.company_name,
  }
}

export const authService = {
  async register(credentials: SignUpCredentials): Promise<AuthSession> {
    if (useLocalAuth()) {
      const session = await localRegister(credentials)
      persistSession(session)
      return session
    }

    try {
      const res = await http.post<AuthSession>("/auth/register", credentials)
      persistSession(res.data)
      return res.data
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to create your account."))
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthSession> {
    if (useLocalAuth()) {
      const session = await localLogin(credentials)
      persistSession(session)
      return session
    }

    try {
      const res = await http.post<AuthSession>("/auth/login", credentials)
      persistSession(res.data)
      return res.data
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to sign in."))
    }
  },

  async logout(): Promise<void> {
    if (!useLocalAuth()) {
      try {
        await http.post("/auth/logout")
      } catch {
        // Always clear client state even if the server session is already gone.
      }
    }

    clearStoredSession()
  },

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    if (useLocalAuth()) {
      await localForgotPassword(request)
      return
    }

    try {
      await http.post("/auth/forgot-password", request)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to send the reset email."))
    }
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    if (useLocalAuth()) {
      await localResetPassword(request)
      return
    }

    try {
      await http.post("/auth/reset-password", request)
    } catch (error) {
      throw new Error(extractErrorMessage(error, "Unable to reset your password."))
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const stored = readStoredSession()
    if (!stored) return null

    if (useLocalAuth()) {
      try {
        return await localGetCurrentUser(stored.access_token)
      } catch {
        clearStoredSession()
        return null
      }
    }

    try {
      const res = await http.get<AuthUser>("/auth/me")
      return res.data
    } catch {
      clearStoredSession()
      return null
    }
  },

  restoreSession(): AuthSession | null {
    const stored = readStoredSession()
    if (!stored?.user) return null

    return {
      access_token: stored.access_token,
      refresh_token: stored.refresh_token,
      user: stored.user,
    }
  },
}
