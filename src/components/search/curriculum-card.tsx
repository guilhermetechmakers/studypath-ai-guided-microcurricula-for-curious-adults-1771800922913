import { BookOpen, Star, Users, Eye, Bookmark, Check } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CurriculumSearchResult, CurriculumDepth } from '@/types/search'

const DEPTH_VARIANTS: Record<CurriculumDepth, 'intro' | 'intermediate' | 'deep'> = {
  intro: 'intro',
  intermediate: 'intermediate',
  deep: 'deep',
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`
}

/** Safely render snippet - escape HTML to prevent XSS */
function SafeSnippet({ text }: { text: string }) {
  return <span>{text}</span>
}

export interface CurriculumCardProps {
  curriculum: CurriculumSearchResult
  onPreview: (id: string) => void
  onSave?: (id: string) => void
  onAdopt?: (id: string) => void
  isSaving?: boolean
  isAdopting?: boolean
  className?: string
}

export function CurriculumCard({
  curriculum,
  onPreview,
  onSave,
  onAdopt,
  isSaving = false,
  isAdopting = false,
  className,
}: CurriculumCardProps) {
  const {
    id,
    title,
    description,
    topics,
    authorName,
    depth,
    timeEstimateMinutes,
    ratingAvg,
    adoptionCount,
    highlightSnippet,
    isSaved,
    isAdopted,
  } = curriculum

  const depthVariant = DEPTH_VARIANTS[depth] ?? 'default'

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold line-clamp-2 flex-1">
            {title}
          </h3>
          {(isSaved || isAdopted) && (
            <span
              className="shrink-0 rounded-full bg-secondary/20 p-1"
              aria-label={isAdopted ? 'Adopted' : 'Saved'}
            >
              {isAdopted ? (
                <Check className="h-4 w-4 text-secondary" />
              ) : (
                <Bookmark className="h-4 w-4 text-secondary" />
              )}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {topics.slice(0, 4).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs">
              {t}
            </Badge>
          ))}
          <Badge variant={depthVariant}>{depth}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {formatTime(timeEstimateMinutes)}
          </span>
          {ratingAvg != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              {ratingAvg.toFixed(1)}
            </span>
          )}
          {adoptionCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {adoptionCount} adopted
            </span>
          )}
          {authorName && <span>{authorName}</span>}
        </div>

        {highlightSnippet && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            <SafeSnippet text={highlightSnippet} />
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPreview(id)}
            className="min-w-[44px]"
            aria-label="Preview"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>
          {onAdopt && (
            <Button
              size="sm"
              onClick={() => onAdopt(id)}
              disabled={isAdopted || isAdopting}
              className="min-w-[44px]"
              aria-label={isAdopted ? 'Already adopted' : 'Adopt into My Library'}
            >
              {isAdopted ? (
                <>
                  <Check className="h-4 w-4 mr-1.5" />
                  Adopted
                </>
              ) : (
                'Adopt'
              )}
            </Button>
          )}
          {onSave && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSave(id)}
              disabled={isSaving}
              className="min-w-[44px]"
              aria-label={isSaved ? 'Saved' : 'Save'}
            >
              <Bookmark
                className={cn('h-4 w-4', isSaved && 'fill-current')}
              />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
