import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Sparkles, Target, FileCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function LandingPage() {
  const [demoPrompt, setDemoPrompt] = useState('')

  return (
    <div className="min-h-screen bg-background">
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-accent/5" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="font-semibold text-xl text-primary">
            StudyPath
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Help
            </Link>
            <Link to="/login">
              <Button variant="secondary">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-in-up">
            Turn curiosity into
            <span className="block bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              structured learning
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in-up" style={{ animationDelay: '0.1s' }}>
            Enter a prompt. Get a citation-backed microcurriculum. Study at your pace with AI-guided lessons, quizzes, and exports.
          </p>

          {/* Interactive demo input */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto animate-in-up" style={{ animationDelay: '0.2s' }}>
            <Input
              placeholder="e.g., I want to learn the history of Troy"
              value={demoPrompt}
              onChange={(e) => setDemoPrompt(e.target.value)}
              className="h-12 text-base"
            />
            <Button size="lg" className="h-12 shrink-0" asChild>
              <Link to="/signup">
                Try demo
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature highlights - Bento-style grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="sm:col-span-2 lg:col-span-1 hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <Sparkles className="h-10 w-10 text-accent mb-4" />
              <h3 className="font-semibold text-lg">Prompt to curriculum</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                One prompt generates chapters, lessons, time estimates, and citations. No more ad-hoc searching.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <BookOpen className="h-10 w-10 text-secondary mb-4" />
              <h3 className="font-semibold text-lg">Deep study mode</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Inline Q&A, go-deeper sections, micro-quizzes. Professional, minimal UI for focus.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <Target className="h-10 w-10 text-accent mb-4" />
              <h3 className="font-semibold text-lg">Your pace</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Configure session length, depth, and focus. Spaced review scheduler keeps you on track.
              </p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <FileCheck className="h-10 w-10 text-secondary mb-4" />
              <h3 className="font-semibold text-lg">Export & cite</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Export to PDF, Markdown, or CSV. Citations included. Import outlines to create curricula.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">Ready to learn?</h2>
          <p className="mt-2 text-muted-foreground">Create your first curriculum in seconds.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">
                Start free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-muted-foreground">© StudyPath. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
