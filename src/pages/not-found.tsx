import { Link } from 'react-router-dom'
import { Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Go home
          </Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/dashboard/search">
            <Search className="h-4 w-4 mr-2" />
            Search curricula
          </Link>
        </Button>
      </div>
    </div>
  )
}
