import { Component, type ErrorInfo, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("[KillSwitch] React error boundary captured a render failure.", error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4 text-foreground">
        <Card className="w-full max-w-lg bg-card/90">
          <CardHeader>
            <CardTitle>Dashboard render error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The UI hit a recoverable render error. Check the console warning for details.
            </p>
            <pre className="max-h-40 overflow-auto rounded-lg border bg-background/50 p-3 text-xs">
              {this.state.error.message}
            </pre>
            <Button onClick={() => this.setState({ error: null })}>Try again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
