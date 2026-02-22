import { useState } from 'react'
import { Search as SearchIcon, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

const mockResults = [
  { id: '1', title: 'History of Troy', lessons: 4, minutes: 65, tags: ['history', 'archaeology'] },
  { id: '2', title: 'Introduction to Ancient Greece', lessons: 8, minutes: 120, tags: ['history'] },
  { id: '3', title: 'Roman Empire Foundations', lessons: 10, minutes: 150, tags: ['history', 'politics'] },
]

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Search & browse</h1>
        <p className="text-muted-foreground mt-1">Discover curricula to adopt</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search curricula..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockResults.map((c) => (
          <Card key={c.id} className="hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription>
                {c.lessons} lessons · ~{c.minutes} min
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap mb-4">
                {c.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link to={`/dashboard/curricula/${c.id}`}>View</Link>
                </Button>
                <Button variant="secondary" size="sm">Adopt</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
