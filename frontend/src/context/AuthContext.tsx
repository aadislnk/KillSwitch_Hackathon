import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react"

import { authService } from "@/services/authService"
import { clearStoredSession, persistSession } from "@/lib/authStorage"
import type {
  AuthUser,
  ForgotPasswordRequest,
  LoginCredentials,
  ResetPasswordRequest,
  SignUpCredentials,
} from "@/types/auth"

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated"

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  status: AuthStatus
  isInitializing: boolean
}

type AuthAction =
  | { type: "INIT_START" }
  | { type: "INIT_SUCCESS"; user: AuthUser | null; accessToken: string | null }
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; user: AuthUser; accessToken: string }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  isInitializing: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "INIT_START":
      return { ...state, isInitializing: true }
    case "INIT_SUCCESS":
      return {
        user: action.user,
        accessToken: action.accessToken,
        status: action.user ? "authenticated" : "unauthenticated",
        isInitializing: false,
      }
    case "LOGIN_START":
      return { ...state, status: "loading" }
    case "LOGIN_SUCCESS":
      return {
        user: action.user,
        accessToken: action.accessToken,
        status: "authenticated",
        isInitializing: false,
      }
    case "LOGIN_FAILURE":
      return { ...state, status: "unauthenticated", isInitializing: false }
    case "LOGOUT":
      return {
        user: null,
        accessToken: null,
        status: "unauthenticated",
        isInitializing: false,
      }
    default:
      return state
  }
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  status: AuthStatus
  isInitializing: boolean
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: SignUpCredentials) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (request: ForgotPasswordRequest) => Promise<void>
  resetPassword: (request: ResetPasswordRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      dispatch({ type: "INIT_START" })

      const restored = authService.restoreSession()
      if (!restored) {
        if (!cancelled) {
          dispatch({ type: "INIT_SUCCESS", user: null, accessToken: null })
        }
        return
      }

      try {
        const user = await authService.getCurrentUser()
        if (cancelled) return

        if (user) {
          persistSession({ ...restored, user })
          dispatch({
            type: "INIT_SUCCESS",
            user,
            accessToken: restored.access_token,
          })
        } else {
          dispatch({ type: "INIT_SUCCESS", user: null, accessToken: null })
        }
      } catch {
        if (!cancelled) {
          clearStoredSession()
          dispatch({ type: "INIT_SUCCESS", user: null, accessToken: null })
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const session = await authService.login(credentials)
      dispatch({
        type: "LOGIN_SUCCESS",
        user: session.user,
        accessToken: session.access_token,
      })
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw error
    }
  }, [])

  const register = useCallback(async (credentials: SignUpCredentials) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const session = await authService.register(credentials)
      dispatch({
        type: "LOGIN_SUCCESS",
        user: session.user,
        accessToken: session.access_token,
      })
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" })
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    dispatch({ type: "LOGOUT" })
  }, [])

  const forgotPassword = useCallback(async (request: ForgotPasswordRequest) => {
    await authService.forgotPassword(request)
  }, [])

  const resetPassword = useCallback(async (request: ResetPasswordRequest) => {
    await authService.resetPassword(request)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      accessToken: state.accessToken,
      status: state.status,
      isInitializing: state.isInitializing,
      isAuthenticated: state.status === "authenticated" && Boolean(state.user),
      isLoading: state.status === "loading",
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
    }),
    [state, login, register, logout, forgotPassword, resetPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
