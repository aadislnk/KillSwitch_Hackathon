import { useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { Loader2, LogIn } from "lucide-react"

import { AuthAlert, AuthField, AuthLinkRow } from "@/components/auth/AuthField"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ROUTES } from "@/routes/paths"

type LocationState = {
  from?: string
}

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading } = useAuth()

  const redirectTo = (location.state as LocationState | null)?.from ?? ROUTES.dashboard

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  function validate() {
    const nextErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!password) {
      nextErrors.password = "Password is required."
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!validate()) return

    try {
      await login({ email: email.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.")
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Access your KillSwitch workspace and savings cockpit."
      footer={
        <>
          New to KillSwitch?{" "}
          <Link to={ROUTES.signUp} className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <AuthAlert>{error}</AuthAlert> : null}

        <AuthField
          name="email"
          type="email"
          autoComplete="email"
          label="Email"
          value={email}
          error={fieldErrors.email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <AuthField
          name="password"
          type="password"
          autoComplete="current-password"
          label="Password"
          value={password}
          error={fieldErrors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <AuthLinkRow>
          <span />
          <Link to={ROUTES.forgotPassword} className="font-medium text-foreground underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </AuthLinkRow>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
