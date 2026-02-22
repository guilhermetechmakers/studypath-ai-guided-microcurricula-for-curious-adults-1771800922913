import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  EmailInputField,
  InlineMessage,
  RateLimitWarning,
} from '@/components/auth'
import { requestPasswordReset, isRateLimitError } from '@/api/auth'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

const NEUTRAL_CONFIRMATION_MESSAGE =
  "If an account exists for that email, you'll receive instructions to reset your password. Check your inbox and spam folders."

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [rateLimitError, setRateLimitError] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setRateLimitError(false)
    try {
      await requestPasswordReset(data.email)
      setSent(true)
    } catch (err) {
      if (isRateLimitError(err)) {
        setRateLimitError(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
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
                Password Reset
              </CardTitle>
              <CardDescription>
                {NEUTRAL_CONFIRMATION_MESSAGE}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InlineMessage variant="neutral" message={NEUTRAL_CONFIRMATION_MESSAGE} />
              <p className="text-xs text-muted-foreground">
                Reset link expires in 1 hour.
              </p>
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <Link to="/help" className="text-accent hover:underline">
                  Contact support
                </Link>
              </p>
              <Button asChild variant="secondary" className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
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
              Password Reset
            </CardTitle>
            <CardDescription>
              Enter the email associated with your StudyPath account and we&apos;ll
              send a link to set a new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {rateLimitError && (
                <RateLimitWarning className="animate-in" />
              )}
              <EmailInputField
                {...register('email')}
                error={errors.email?.message}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-accent hover:underline">
                Back to sign in
              </Link>
            </p>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              Reset link expires in 1 hour. Need help?{' '}
              <Link to="/help" className="text-accent hover:underline">
                Contact support
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
