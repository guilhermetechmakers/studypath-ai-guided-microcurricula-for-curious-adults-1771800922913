import { forwardRef, useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordInputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  id?: string
}

export const PasswordInputField = forwardRef<HTMLInputElement, PasswordInputFieldProps>(
  ({ label = 'Password', error, id, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            autoComplete={props.autoComplete ?? 'new-password'}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'pr-12',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 min-h-0 min-w-0 p-0 hover:bg-transparent"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
PasswordInputField.displayName = 'PasswordInputField'
