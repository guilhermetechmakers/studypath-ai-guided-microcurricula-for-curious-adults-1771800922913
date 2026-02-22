import { Link } from 'react-router-dom'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  onRetry?: () => void
}

export function ErrorPage({ onRetry }: ErrorPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        We encountered an error. Please try again or return home.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        <a href="mailto:support@studypath.app" className="text-accent hover:underline">
          Report an issue
        </a>
      </p>
    </div>
  )
}
