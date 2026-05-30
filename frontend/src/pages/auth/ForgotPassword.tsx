import { useMemo, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { KeyRound, Loader2, Mail } from "lucide-react"

import { AuthAlert, AuthField } from "@/components/auth/AuthField"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ROUTES } from "@/routes/paths"

export function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAuth()
  const [searchParams] = useSearchParams()

  const token = searchParams.get("token") ?? ""
  const emailFromQuery = searchParams.get("email") ?? ""
  const isResetMode = Boolean(token)

  const [email, setEmail] = useState(emailFromQuery)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const title = useMemo(() => (isResetMode ? "Reset password" : "Forgot password"), [isResetMode])
  const description = useMemo(
    () =>
      isResetMode
        ? "Choose a new password for your KillSwitch account."
        : "Enter your email and we will send a secure reset link.",
    [isResetMode]
  )

  function validateRequest() {
    const nextErrors: { email?: string } = {}
    if (!email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function validateReset() {
    const nextErrors: { email?: string; password?: string; confirmPassword?: string } = {}

    if (!email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!password) {
      nextErrors.password = "Password is required."
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters."
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password."
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match."
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateRequest()) return

    setIsSubmitting(true)
    try {
      await forgotPassword({ email: email.trim() })
      setSuccess("If an account exists for that email, a reset link has been sent.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send the reset email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validateReset()) return

    setIsSubmitting(true)
    try {
      await resetPassword({
        token,
        email: email.trim(),
        password,
      })
      setSuccess("Your password has been updated. You can now sign in with your new credentials.")
      setPassword("")
      setConfirmPassword("")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset your password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={title}
      description={description}
      footer={
        <>
          Remembered your password?{" "}
          <Link to={ROUTES.login} className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {isResetMode ? (
        <form className="space-y-4" onSubmit={handleResetPassword} noValidate>
          {error ? <AuthAlert>{error}</AuthAlert> : null}
          {success ? <AuthAlert tone="success">{success}</AuthAlert> : null}

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
            autoComplete="new-password"
            label="New password"
            value={password}
            error={fieldErrors.password}
            hint="Use at least 8 characters."
            onChange={(event) => setPassword(event.target.value)}
          />

          <AuthField
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            label="Confirm new password"
            value={confirmPassword}
            error={fieldErrors.confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset password
              </>
            )}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={handleRequestReset} noValidate>
          {error ? <AuthAlert>{error}</AuthAlert> : null}
          {success ? <AuthAlert tone="success">{success}</AuthAlert> : null}

          <AuthField
            name="email"
            type="email"
            autoComplete="email"
            label="Email"
            value={email}
            error={fieldErrors.email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send reset link
              </>
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
