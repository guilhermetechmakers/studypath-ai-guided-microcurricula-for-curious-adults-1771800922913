import { Link } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  Star,
  Users,
  ChevronDown,
  Bookmark,
  Check,
  Share2,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CurriculumDetailResponse, CurriculumDepth } from '@/types/search'

const DEPTH_VARIANTS: Record<CurriculumDepth, 'intro' | 'intermediate' | 'deep'> = {
  intro: 'intro',
  intermediate: 'intermediate',
  deep: 'deep',
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export interface CurriculumPreviewDrawerProps {
  curriculumId: string | null
  curriculum: CurriculumDetailResponse | null
  isLoading: boolean
  isSaved?: boolean
  isAdopted?: boolean
  isSaving?: boolean
  isAdopting?: boolean
  onClose: () => void
  onSave?: (id: string) => void
  onAdopt?: (id: string) => void
  open: boolean
}

export function CurriculumPreviewDrawer({
  curriculumId,
  curriculum,
  isLoading,
  isSaved = false,
  isAdopted = false,
  isSaving = false,
  isAdopting = false,
  onClose,
  onSave,
  onAdopt,
  open,
}: CurriculumPreviewDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 w-full sm:max-w-xl"
        showClose={true}
      >
        {isLoading ? (
          <div className="flex flex-col h-full p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-1/2 mb-6" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : curriculum && curriculumId ? (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
              <SheetTitle className="text-xl pr-8">{curriculum.title}</SheetTitle>
              {curriculum.description && (
                <SheetDescription className="text-left">
                  {curriculum.description}
                </SheetDescription>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {curriculum.topics.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
                <Badge variant={DEPTH_VARIANTS[curriculum.depth]}>
                  {curriculum.depth}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(curriculum.timeEstimateMinutes)} total
                </span>
                {curriculum.ratingAvg != null && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {curriculum.ratingAvg.toFixed(1)}
                  </span>
                )}
                {curriculum.adoptionCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {curriculum.adoptionCount} adopted
                  </span>
                )}
                {curriculum.authorName && (
                  <span>{curriculum.authorName}</span>
                )}
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 hover:bg-accent/5">
                    <span className="font-medium">Lessons ({curriculum.lessons.length})</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="mt-2 space-y-2">
                      {curriculum.lessons
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((lesson, i) => (
                          <li
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                          >
                            <span className="flex items-center gap-2">
                              <span className="text-muted-foreground w-6">
                                {i + 1}.
                              </span>
                              {lesson.title}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {formatTime(lesson.timeEstimateMinutes)}
                            </span>
                          </li>
                        ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>

                {curriculum.sampleLessonBody && (
                  <div>
                    <h4 className="font-medium mb-2">Sample content</h4>
                    <div className="prose prose-sm prose-custom max-w-none text-muted-foreground line-clamp-6">
                      {curriculum.sampleLessonBody.replace(/<[^>]*>/g, ' ').trim()}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-border shrink-0 flex flex-wrap gap-2">
              <Button
                size="sm"
                asChild
                className="min-w-[44px]"
              >
                <Link to={`/dashboard/curricula/${curriculumId}`}>
                  <BookOpen className="h-4 w-4 mr-1.5" />
                  Open
                </Link>
              </Button>
              {onAdopt && (
                <Button
                  size="sm"
                  onClick={() => onAdopt(curriculumId)}
                  disabled={isAdopted || isAdopting}
                  className="min-w-[44px]"
                >
                  {isAdopted ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Adopted
                    </>
                  ) : (
                    'Adopt into My Library'
                  )}
                </Button>
              )}
              {onSave && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onSave(curriculumId)}
                  disabled={isSaving}
                  className="min-w-[44px]"
                >
                  <Bookmark
                    className={cn('h-4 w-4 mr-1.5', isSaved && 'fill-current')}
                  />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              )}
              <Button size="sm" variant="ghost" className="min-w-[44px]">
                <Share2 className="h-4 w-4 mr-1.5" />
                Share
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Select a curriculum to preview
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
