import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="font-semibold text-xl text-primary">
            StudyPath
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground">
              Help
            </Link>
            <Link to="/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold">About StudyPath</h1>
        <p className="mt-6 text-muted-foreground leading-relaxed">
          StudyPath converts curiosity into structured, adult-friendly microcurricula. We believe learning should be deep, customizable, and trustworthy—with citations, clear sequencing, and tools that support retention.
        </p>
        <h2 className="mt-12 text-xl font-semibold">Our mission</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          To help lifelong learners, professionals, and educators turn ad-hoc curiosity into actionable study plans—without the superficiality of quick explainers or the heaviness of traditional MOOCs.
        </p>
        <h2 className="mt-12 text-xl font-semibold">Citations policy</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          We extract and surface citations for AI-generated content. Curated curricula may undergo human review. We minimize hallucination through context-limiting and confidence metadata.
        </p>
        <div className="mt-12">
          <Button asChild>
            <Link to="/signup">Start learning</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
