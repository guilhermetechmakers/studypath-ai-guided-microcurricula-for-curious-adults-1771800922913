import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { AdvancedOptions } from '@/types/curriculum'

const IMAGE_STYLES = [
  { id: 'map', label: 'Maps' },
  { id: 'diagram', label: 'Diagrams' },
  { id: 'photo', label: 'Photos' },
  { id: 'schematic', label: 'Schematic' },
] as const

interface AdvancedOptionsPanelProps {
  options?: AdvancedOptions | null
  onChange: (opts: Partial<AdvancedOptions>) => void
  className?: string
}

export function AdvancedOptionsPanel({
  options,
  onChange,
  className,
}: AdvancedOptionsPanelProps) {
  const opts: AdvancedOptions = options ?? {}
  const imageStyle = opts.image_style ?? ['map', 'diagram', 'photo']
  const toggleImageStyle = (id: (typeof IMAGE_STYLES)[number]['id']) => {
    const next = imageStyle.includes(id)
      ? imageStyle.filter((s) => s !== id)
      : [...imageStyle, id]
    onChange({ image_style: next })
  }

  return (
    <Collapsible defaultOpen={false} className={cn(className)}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent/5">
        Advanced options
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-4 space-y-4 rounded-lg border bg-muted/20 p-4">
          <div>
            <Label>Citation style</Label>
            <Select
              value={opts.citation_style ?? 'apa'}
              onValueChange={(v) => onChange({ citation_style: v as AdvancedOptions['citation_style'] })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apa">APA</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
                <SelectItem value="links_only">Links only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Image style</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {IMAGE_STYLES.map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={imageStyle.includes(opt.id)}
                    onCheckedChange={() => toggleImageStyle(opt.id)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Image license preference</Label>
            <Select
              value={opts.image_license ?? 'open-license'}
              onValueChange={(v) =>
                onChange({ image_license: v as AdvancedOptions['image_license'] })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open-license">Open license</SelectItem>
                <SelectItem value="stock-licensed">Stock licensed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Language / register</Label>
            <Select
              value={opts.language_register ?? 'plain'}
              onValueChange={(v) =>
                onChange({ language_register: v as AdvancedOptions['language_register'] })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="include-assessments">Include assessments (micro-checks/quiz)</Label>
            <Switch
              id="include-assessments"
              checked={opts.include_assessments ?? true}
              onCheckedChange={(v) => onChange({ include_assessments: v })}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
