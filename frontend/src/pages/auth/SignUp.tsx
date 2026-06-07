import { useState, type FormEvent } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { Loader2, UserPlus } from "lucide-react"

import { AuthAlert, AuthField } from "@/components/auth/AuthField"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ROUTES } from "@/routes/paths"

type SignUpForm = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type SignUpErrors = Partial<Record<keyof SignUpForm, string>>

export function SignUp() {
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading } = useAuth()

  const [form, setForm] = useState<SignUpForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [fieldErrors, setFieldErrors] = useState<SignUpErrors>({})
  const [error, setError] = useState<string | null>(null)

  if (isAuthenticated) {
    return <Navigate to={ROUTES.dashboard} replace />
  }

  function updateField<K extends keyof SignUpForm>(key: K, value: SignUpForm[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function validate() {
    const nextErrors: SignUpErrors = {}

    if (!form.name.trim()) {
      nextErrors.name = "Name is required."
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters."
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address."
    }

    if (!form.password) {
      nextErrors.password = "Password is required."
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters."
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password."
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match."
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!validate()) return

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate(ROUTES.dashboard, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create your account.")
    }
  }

  return (
    <AuthLayout
      title="Create account"
      description="Register to connect integrations, review findings, and run savings workflows."
      footer={
        <>
          Already have an account?{" "}
          <Link to={ROUTES.login} className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error ? <AuthAlert>{error}</AuthAlert> : null}

        <AuthField
          name="name"
          autoComplete="name"
          label="Full name"
          value={form.name}
          error={fieldErrors.name}
          onChange={(event) => updateField("name", event.target.value)}
        />

        <AuthField
          name="email"
          type="email"
          autoComplete="email"
          label="Work email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(event) => updateField("email", event.target.value)}
        />

        <AuthField
          name="password"
          type="password"
          autoComplete="new-password"
          label="Password"
          value={form.password}
          error={fieldErrors.password}
          hint="Use at least 8 characters."
          onChange={(event) => updateField("password", event.target.value)}
        />

        <AuthField
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          label="Confirm password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={(event) => updateField("confirmPassword", event.target.value)}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Create account
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
