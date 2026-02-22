import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Monitor, Smartphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter'
import { PasswordInputField } from '@/components/auth/password-input-field'
import {
  useUserProfile,
  useChangePassword,
  useSessions,
  useRevokeSession,
} from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(12, 'At least 12 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export function AccountSecurityPanel() {
  const { profile, isLoading: profileLoading } = useUserProfile()
  const { data: sessions, isLoading: sessionsLoading } = useSessions()
  const changePassword = useChangePassword()
  const revokeSession = useRevokeSession()
  const [showResendMessage, setShowResendMessage] = useState(false)

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await changePassword.mutateAsync({
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
    })
    form.reset()
  })

  const handleResendVerification = () => {
    setShowResendMessage(true)
    setTimeout(() => setShowResendMessage(false), 5000)
  }

  if (profileLoading || !profile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-semibold">Account & Security</h1>
        <p className="text-muted-foreground mt-1">
          Manage your password, email, and sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
          <CardDescription>
            Verify your email to secure your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{profile.email}</p>
              {profile.emailVerified ? (
                <p className="text-sm text-secondary">Verified</p>
              ) : (
                <p className="text-sm text-muted-foreground">Not verified</p>
              )}
            </div>
            {!profile.emailVerified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResendVerification}
              >
                {showResendMessage ? 'Check your email' : 'Resend verification'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Use a strong password with at least 12 characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <PasswordInputField
                id="oldPassword"
                label="Current password"
                {...form.register('oldPassword')}
                placeholder="Enter current password"
                className="mt-2"
                autoComplete="current-password"
                error={form.formState.errors.oldPassword?.message}
              />
            </div>
            <div>
              <PasswordInputField
                id="newPassword"
                label="New password"
                {...form.register('newPassword')}
                placeholder="Enter new password"
                className="mt-2"
                autoComplete="new-password"
                error={form.formState.errors.newPassword?.message}
              />
              <PasswordStrengthMeter
                password={form.watch('newPassword')}
                className="mt-2"
              />
            </div>
            <div>
              <PasswordInputField
                id="confirmPassword"
                label="Confirm new password"
                {...form.register('confirmPassword')}
                placeholder="Confirm new password"
                className="mt-2"
                autoComplete="new-password"
                error={form.formState.errors.confirmPassword?.message}
              />
            </div>
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>
            Manage devices where you are signed in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : sessions && sessions.length > 0 ? (
            <ul className="space-y-4">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {s.device?.toLowerCase().includes('mobile') ? (
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{s.device || 'Unknown device'}</p>
                      {s.lastActive && (
                        <p className="text-sm text-muted-foreground">
                          Last active: {new Date(s.lastActive).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {!s.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession.mutate(s.id)}
                      disabled={revokeSession.isPending}
                    >
                      Revoke
                    </Button>
                  )}
                  {s.current && (
                    <span className="text-xs px-2 py-1 rounded bg-accent/10 text-accent">
                      Current
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-4">
              No other active sessions
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
