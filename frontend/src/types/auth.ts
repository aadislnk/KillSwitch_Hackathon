export type AuthUser = {
  id: string
  name: string
  email: string
  company_name?: string
  role?: string
}

export type AuthTokens = {
  access_token: string
  refresh_token?: string
  token_type?: string
}

export type AuthSession = AuthTokens & {
  user: AuthUser
}

export type LoginCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = {
  name: string
  email: string
  password: string
  company_name?: string
}

export type ForgotPasswordRequest = {
  email: string
}

export type ResetPasswordRequest = {
  token: string
  email: string
  password: string
}

export type AuthError = {
  message: string
  field?: string
}
