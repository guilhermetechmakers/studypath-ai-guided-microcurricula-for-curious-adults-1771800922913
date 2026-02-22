import { Link } from 'react-router-dom'
import { PlusCircle, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

const mockActiveCurriculum = {
  id: '1',
  title: 'History of Troy',
  progress: 35,
  currentLesson: 'The Trojan War in Homer',
  totalLessons: 12,
  estimatedMinutesLeft: 180,
}

const mockRecommended = [
  { id: '1', title: 'Introduction to Ancient Greece', lessons: 8, minutes: 120 },
  { id: '2', title: 'Roman Empire Foundations', lessons: 10, minutes: 150 },
]

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your study hub</p>
      </div>

      {/* Active study card */}
      <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active study</CardTitle>
            <CardDescription>{mockActiveCurriculum.title}</CardDescription>
          </div>
          <Button asChild>
            <Link to={`/dashboard/curricula/${mockActiveCurriculum.id}/lesson/1`}>
              Continue
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span>{mockActiveCurriculum.progress}%</span>
            </div>
            <Progress value={mockActiveCurriculum.progress} />
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {mockActiveCurriculum.currentLesson}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              ~{mockActiveCurriculum.estimatedMinutesLeft} min left
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick create */}
      <Link to="/dashboard/create">
        <Card className="hover:shadow-card-hover transition-all duration-300 cursor-pointer">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <PlusCircle className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">Create new curriculum</h3>
              <p className="text-sm text-muted-foreground">
                Enter a prompt and generate a structured study plan
              </p>
            </div>
            <Button variant="secondary" className="ml-auto">Create</Button>
          </CardContent>
        </Card>
      </Link>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lessons completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-semibold">24</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Curricula in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">1</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hours studied</CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">8.5</span>
          </CardContent>
        </Card>
      </div>

      {/* Recommended */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recommended for you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {mockRecommended.map((c) => (
            <Card key={c.id} className="hover:shadow-card-hover transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.title}</CardTitle>
                <CardDescription>
                  {c.lessons} lessons · ~{c.minutes} min
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="sm" asChild>
                  <Link to={`/dashboard/curricula/${c.id}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}
