import { Link } from 'react-router-dom'
import { PlusCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const mockCurricula = [
  { id: '1', title: 'History of Troy', lessons: 4, minutes: 65, progress: 35 },
  { id: '2', title: 'Introduction to Ancient Greece', lessons: 8, minutes: 120, progress: 0 },
]

export function CurriculaListPage() {
  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My curricula</h1>
          <p className="text-muted-foreground mt-1">Your saved study plans</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create new
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockCurricula.map((c) => (
          <Card key={c.id} className="hover:shadow-card-hover transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {c.title}
              </CardTitle>
              <CardDescription>
                {c.lessons} lessons · ~{c.minutes} min
              </CardDescription>
            </CardHeader>
            <CardContent>
              {c.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <Button size="sm" asChild>
                <Link to={`/dashboard/curricula/${c.id}`}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
