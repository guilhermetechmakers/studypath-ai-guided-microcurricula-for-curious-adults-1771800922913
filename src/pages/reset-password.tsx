import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PasswordInputField,
  PasswordStrengthMeter,
  InlineMessage,
  RateLimitWarning,
} from '@/components/auth'
import {
  validatePasswordResetToken,
  confirmPasswordReset,
  isRateLimitError,
} from '@/api/auth'
import { useAuth } from '@/contexts/auth-context'
import { meetsPasswordPolicy, PASSWORD_MIN_LENGTH } from '@/lib/password-strength'
import { toast } from 'sonner'

const schema = z
  .object({
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .refine(meetsPasswordPolicy, 'Password is too weak. Add letters, numbers, or special characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const token = searchParams.get('token') ?? ''

  const [isValidating, setIsValidating] = useState(!!token)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [rateLimitError, setRateLimitError] = useState(false)

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setIsValidating(false)
      return
    }
    validatePasswordResetToken(token)
      .then((res) => {
        setTokenValid(res.valid)
      })
      .catch(() => {
        // On network/API error, assume valid and show form; confirm will validate
        setTokenValid(true)
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [token])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const newPassword = watch('newPassword', '')

  const onSubmit = async (data: FormData) => {
    if (!token) return
    setIsSubmitting(true)
    setGlobalError(null)
    setRateLimitError(false)
    try {
      const res = await confirmPasswordReset(token, data.newPassword)
      if (res.autoLogin && res.session?.token) {
        localStorage.setItem('auth_token', res.session.token)
        setUser(
          res.user ?? { id: '1', email: 'user@example.com', name: 'User' }
        )
        toast.success('Your password has been reset. You are now signed in.')
        navigate('/dashboard')
      } else {
        toast.success('Password updated — please sign in.')
        navigate('/login')
      }
    } catch (err) {
      if (isRateLimitError(err)) {
        setRateLimitError(true)
      } else {
        setGlobalError(
          'Something went wrong. Please try again or request a new reset link.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md animate-in-up">
          <Link
            to="/"
            className="block text-center font-semibold text-xl text-primary mb-8"
          >
            StudyPath
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm font-semibold text-muted-foreground">
                Invalid Reset Link
              </CardTitle>
              <CardDescription>
                This password reset link is invalid or missing. Please request a
                new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/forgot-password">Request new reset link</Link>
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-accent hover:underline">
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="text-sm text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md animate-in-up">
          <Link
            to="/"
            className="block text-center font-semibold text-xl text-primary mb-8"
          >
            StudyPath
          </Link>
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm font-semibold text-muted-foreground">
                Link Expired or Invalid
              </CardTitle>
              <CardDescription>
                This password reset link has expired or has already been used.
                Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InlineMessage
                variant="error"
                message="This link is no longer valid. Request a new password reset to continue."
              />
              <Button asChild className="w-full">
                <Link to="/forgot-password">Request new reset link</Link>
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-accent hover:underline">
                  Back to sign in
                </Link>
              </p>
              <p className="text-xs text-muted-foreground text-center">
                If you did not request this, secure your account by changing your
                password and{' '}
                <Link to="/help" className="text-accent hover:underline">
                  contacting support
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-in-up">
        <Link
          to="/"
          className="block text-center font-semibold text-xl text-primary mb-8"
        >
          StudyPath
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="uppercase tracking-wider text-sm font-semibold text-muted-foreground">
              Set a New Password
            </CardTitle>
            <CardDescription>
              Create a strong password to secure your StudyPath account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {rateLimitError && <RateLimitWarning className="animate-in" />}
              {globalError && (
                <InlineMessage variant="error" message={globalError} />
              )}
              <PasswordInputField
                label="New password"
                {...register('newPassword')}
                error={errors.newPassword?.message}
              />
              <PasswordStrengthMeter password={newPassword} />
              <PasswordInputField
                label="Confirm password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting password...
                  </>
                ) : (
                  'Set New Password'
                )}
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/login">Cancel</Link>
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Reset link expires in 1 hour.
            </p>
            <p className="mt-1 text-xs text-muted-foreground text-center">
              If you did not request this, secure your account by changing your
              password and{' '}
              <Link to="/help" className="text-accent hover:underline">
                contacting support
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
