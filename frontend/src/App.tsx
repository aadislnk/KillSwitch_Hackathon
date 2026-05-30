import { AppRouter } from "@/routes/AppRouter"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { AuthProvider } from "@/context/AuthContext"

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  )
}
