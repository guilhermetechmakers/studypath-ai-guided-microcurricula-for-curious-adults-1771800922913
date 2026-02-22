import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Curriculum } from '@/types/curriculum'

const schema = z.object({
  prompt: z.string().min(10, 'Enter at least 10 characters'),
})

type FormData = z.infer<typeof schema>

const mockGeneratedCurriculum: Curriculum = {
  id: 'gen-1',
  title: 'History of Troy',
  description: 'From myth to archaeology',
  chapters: [
    {
      id: 'c1',
      title: 'Mythological foundations',
      order: 0,
      lessons: [
        { id: 'l1', title: 'Homer and the Iliad', content: '...', estimatedMinutes: 15 },
        { id: 'l2', title: 'The Trojan War in myth', content: '...', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'c2',
      title: 'Archaeological discovery',
      order: 1,
      lessons: [
        { id: 'l3', title: 'Heinrich Schliemann', content: '...', estimatedMinutes: 18 },
        { id: 'l4', title: 'Troy today', content: '...', estimatedMinutes: 12 },
      ],
    },
  ],
  totalEstimatedMinutes: 65,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function CreateCurriculumPage() {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [depth, setDepth] = useState([5])
  const [sessionMinutes, setSessionMinutes] = useState(30)
  const [generated, setGenerated] = useState<Curriculum | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90))
    }, 300)
    try {
      await new Promise((r) => setTimeout(r, 2000))
      clearInterval(interval)
      setProgress(100)
      setGenerated({ ...mockGeneratedCurriculum, title: data.prompt.slice(0, 50) })
      toast.success('Curriculum generated!')
    } catch {
      toast.error('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Create curriculum</h1>
        <p className="text-muted-foreground mt-1">Turn your curiosity into a structured study plan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What do you want to learn?</CardTitle>
          <CardDescription>
            Enter a prompt. We&apos;ll generate chapters, lessons, and time estimates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Your prompt</Label>
              <Textarea
                id="prompt"
                placeholder="e.g., I want to learn more about the history of Troy"
                rows={4}
                {...register('prompt')}
                className={cn(errors.prompt && 'border-destructive')}
              />
              {errors.prompt && (
                <p className="text-sm text-destructive">{errors.prompt.message}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <Button type="submit" disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSettings(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Generating your curriculum...</p>
            <Progress value={progress} />
          </CardContent>
        </Card>
      )}

      {generated && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>{generated.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {generated.chapters.map((ch) => (
                <div key={ch.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{ch.title}</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {ch.lessons.map((l) => (
                      <li key={l.id}>• {l.title} ({l.estimatedMinutes} min)</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate(`/dashboard/curricula/${generated.id}`)}>
                Save & adopt
              </Button>
              <Button variant="secondary" onClick={() => setGenerated(null)}>
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generation settings</DialogTitle>
            <DialogDescription>
              Configure session length, depth, and focus
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label>Session length (minutes)</Label>
              <Input
                type="number"
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(Number(e.target.value))}
                min={10}
                max={120}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Depth: {depth[0]}/10</Label>
              <Slider
                value={depth}
                onValueChange={setDepth}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
