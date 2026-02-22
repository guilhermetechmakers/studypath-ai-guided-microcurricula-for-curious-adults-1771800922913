import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Download, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInputField } from '@/components/auth/password-input-field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUserProfile, useDeleteAccount } from '@/hooks/use-settings'
import { useAuth } from '@/contexts/auth-context'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'

const deleteSchema = z.object({
  confirmName: z.string().min(1, 'Enter your account name'),
  password: z.string().min(1, 'Password is required'),
})

type DeleteFormValues = z.infer<typeof deleteSchema>

export function PrivacyPanel() {
  const { profile, isLoading } = useUserProfile()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const deleteAccount = useDeleteAccount()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const form = useForm<DeleteFormValues>({
    resolver: zodResolver(deleteSchema),
    defaultValues: {
      confirmName: '',
      password: '',
    },
  })

  const accountName = profile?.name || profile?.email || ''

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.confirmName !== accountName) {
      form.setError('confirmName', {
        message: 'Name does not match your account',
      })
      return
    }
    await deleteAccount.mutateAsync({
      confirmName: values.confirmName,
      password: values.password,
    })
    setShowDeleteModal(false)
    logout()
    navigate('/')
  })

  const handleDownloadData = () => {
    // Would trigger full data export
    window.open('/api/account/export', '_blank')
  }

  if (isLoading || !profile) {
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
        <h1 className="text-2xl font-semibold">Privacy & Data</h1>
        <p className="text-muted-foreground mt-1">
          Download your data or delete your account
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download your data
          </CardTitle>
          <CardDescription>
            Export all your curricula, notes, and progress in a single archive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={handleDownloadData}>
            Request data download
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data retention</CardTitle>
          <CardDescription>
            We retain your data while your account is active. After deletion,
            your data is soft-deleted for 30 days, then permanently removed.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent showClose className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account. Type your account name
              ({accountName}) and enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="confirmName">Type your account name to confirm</Label>
              <Input
                id="confirmName"
                {...form.register('confirmName')}
                placeholder={accountName}
                className="mt-2"
                aria-invalid={!!form.formState.errors.confirmName}
              />
              {form.formState.errors.confirmName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.confirmName.message}
                </p>
              )}
            </div>
            <div>
              <PasswordInputField
                id="delete-password"
                label="Password"
                {...form.register('password')}
                placeholder="Enter your password"
                error={form.formState.errors.password?.message}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending ? 'Deleting...' : 'Delete permanently'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
