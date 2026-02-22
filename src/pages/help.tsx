import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const faqs = [
  { q: 'How do I create a curriculum?', a: 'Go to Create Curriculum, enter a prompt (e.g., "I want to learn about X"), and tap Generate. You can adjust settings like session length and depth.' },
  { q: 'Can I edit generated content?', a: 'Yes. In the Curriculum Editor you can edit titles, reorder lessons, and request AI rewrites for any section.' },
  { q: 'How does the scheduler work?', a: 'Set your weekly availability. The scheduler maps your curricula to open slots and uses spaced repetition for reviews.' },
]

export function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="font-semibold text-xl text-primary">
            StudyPath
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link to="/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-3xl font-bold">Help & support</h1>
        <p className="mt-2 text-muted-foreground">
          Search our knowledge base or contact us
        </p>

        <div className="relative mt-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Frequently asked questions</h2>
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{faq.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Can&apos;t find what you need? Send us a message.
            </p>
            <Button>Contact support</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
