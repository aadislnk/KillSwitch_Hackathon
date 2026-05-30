import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Bot } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/routes/paths"

type AuthLayoutProps = {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-7xl items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-md gap-6">
          <div className="text-center">
            <Link
              to={ROUTES.landing}
              className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-sm text-muted-foreground transition hover:bg-card"
            >
              <Bot className="h-4 w-4 text-emerald-300" />
              KillSwitch
            </Link>
          </div>

          <Card className="bg-card/80">
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
          </Card>

          {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
        </div>
      </div>
    </main>
  )
}
