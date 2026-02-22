import { useState, useCallback, useRef, Fragment, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAvailability } from '@/hooks/use-scheduler'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import type { WeeklyAvailability } from '@/types/scheduler'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 6) // 6:00 - 19:00

/** Convert availability blob to block matrix. dayOfWeek 1=Mon..7=Sun for display. */
function availabilityToMatrix(av: WeeklyAvailability): boolean[][] {
  const matrix: boolean[][] = Array(7)
    .fill(null)
    .map(() => Array(14).fill(false))

  for (let d = 0; d < 7; d++) {
    const dayKey = (d + 1) % 7 // 0=Sun in our grid, 1=Mon..6=Sat
    const ranges = av.availability[dayKey] ?? []
    for (const r of ranges) {
      const [sh] = r.start.split(':').map(Number)
      const [eh, em] = r.end.split(':').map(Number)
      const startIdx = Math.max(0, sh - 6)
      const endIdx = Math.min(14, eh - 6 + (em > 0 ? 1 : 0))
      for (let h = startIdx; h < endIdx; h++) {
        if (h >= 0 && h < 14) matrix[d][h] = true
      }
    }
  }
  return matrix
}

/** Convert block matrix back to availability ranges. */
function matrixToAvailability(matrix: boolean[][]): WeeklyAvailability['availability'] {
  const result: WeeklyAvailability['availability'] = {}
  for (let d = 0; d < 7; d++) {
    const dayKey = (d + 1) % 7
    const row = matrix[d] ?? []
    const ranges: { start: string; end: string }[] = []
    let start: number | null = null
    for (let h = 0; h < 14; h++) {
      if (row[h]) {
        if (start === null) start = h + 6
      } else {
        if (start !== null) {
          ranges.push({
            start: `${String(start).padStart(2, '0')}:00`,
            end: `${String(h + 6).padStart(2, '0')}:00`,
          })
          start = null
        }
      }
    }
    if (start !== null) {
      ranges.push({
        start: `${String(start).padStart(2, '0')}:00`,
        end: '20:00',
      })
    }
    if (ranges.length > 0) result[dayKey] = ranges
  }
  return result
}

export function WeeklyAvailabilityMatrix() {
  const { availability, isLoading, updateAvailability, isUpdating } = useAvailability()
  const [matrix, setMatrix] = useState<boolean[][]>(() =>
    availabilityToMatrix(availability)
  )
  const [hasLocalChanges, setHasLocalChanges] = useState(false)

  useEffect(() => {
    if (!hasLocalChanges) {
      setMatrix(availabilityToMatrix(availability))
    }
  }, [availability.availability, availability.granularity_minutes])
  const isDragging = useRef(false)
  const dragValue = useRef<boolean | null>(null)

  const debouncedSave = useDebouncedCallback(() => {
    if (!hasLocalChanges) return
    const newAv: WeeklyAvailability['availability'] = matrixToAvailability(matrix)
    updateAvailability({ availability: newAv })
    setHasLocalChanges(false)
  }, 500)

  const toggleBlock = useCallback(
    (day: number, hour: number, value?: boolean) => {
      setMatrix((prev) => {
        const next = prev.map((row) => [...row])
        const v = value ?? !next[day]?.[hour]
        if (next[day]) next[day][hour] = v
        return next
      })
      setHasLocalChanges(true)
      debouncedSave()
    },
    [debouncedSave]
  )

  const handlePointerDown = useCallback(
    (day: number, hour: number) => {
      isDragging.current = true
      dragValue.current = !matrix[day]?.[hour]
      toggleBlock(day, hour, dragValue.current)
    },
    [matrix, toggleBlock]
  )

  const handlePointerEnter = useCallback(
    (day: number, hour: number) => {
      if (isDragging.current && dragValue.current !== null) {
        toggleBlock(day, hour, dragValue.current)
      }
    },
    [toggleBlock]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
    dragValue.current = null
  }, [])

  const handleSave = useCallback(() => {
    debouncedSave()
    const newAv = matrixToAvailability(matrix)
    updateAvailability({ availability: newAv })
    setHasLocalChanges(false)
  }, [matrix, updateAvailability])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-wide">
          Weekly availability
        </CardTitle>
        <CardDescription>
          Tap or drag to set when you&apos;re available for study. Available blocks are highlighted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="overflow-x-auto"
          onPointerLeave={handlePointerUp}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="inline-block min-w-0">
            <div className="grid grid-cols-8 gap-px bg-border rounded-lg p-1">
              <div className="w-10" />
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-medium text-muted-foreground py-1"
                >
                  {d}
                </div>
              ))}
              {HOURS.map((hour) => (
                <Fragment key={hour}>
                  <div
                    key={`label-${hour}`}
                    className="text-xs text-muted-foreground py-1 pr-2 text-right"
                  >
                    {hour}:00
                  </div>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <button
                      key={`${day}-${hour}`}
                      type="button"
                      role="checkbox"
                      aria-checked={matrix[day]?.[hour - 6]}
                      aria-label={`${DAYS[day]} ${hour}:00 - ${hour + 1}:00 ${matrix[day]?.[hour - 6] ? 'available' : 'unavailable'}`}
                      className={cn(
                        'w-8 h-8 min-w-[32px] rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        matrix[day]?.[hour - 6]
                          ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                          : 'bg-muted/30 hover:bg-muted/50'
                      )}
                      onPointerDown={() => handlePointerDown(day, hour - 6)}
                      onPointerEnter={() => handlePointerEnter(day, hour - 6)}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        {hasLocalChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            {isUpdating ? 'Saving...' : 'Save changes'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
