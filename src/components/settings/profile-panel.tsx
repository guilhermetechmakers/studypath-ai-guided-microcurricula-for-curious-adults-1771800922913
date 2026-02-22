import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useUserProfile } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Max 100 characters'),
  bio: z.string().max(500, 'Max 500 characters').optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfilePanel() {
  const { profile, isLoading, updateProfile, isUpdating } = useUserProfile()
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name ?? '',
      bio: profile?.bio ?? '',
    },
    values: profile
      ? { name: profile.name ?? '', bio: profile.bio ?? '' }
      : undefined,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await updateProfile({ name: values.name, bio: values.bio })
    setIsEditing(false)
  })

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
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Your display name and bio are visible on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Your name"
                className="mt-2"
                disabled={!isEditing}
                aria-invalid={!!form.formState.errors.name}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...form.register('bio')}
                placeholder="A short bio about yourself"
                className="mt-2 min-h-[88px]"
                disabled={!isEditing}
                maxLength={500}
                aria-invalid={!!form.formState.errors.bio}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {form.watch('bio')?.length ?? 0}/500
              </p>
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      form.reset()
                      setIsEditing(false)
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
