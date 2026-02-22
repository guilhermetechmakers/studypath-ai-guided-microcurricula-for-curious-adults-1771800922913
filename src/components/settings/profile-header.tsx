import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Check } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useUserProfile } from '@/hooks/use-settings'
import { cn } from '@/lib/utils'

function getInitials(name?: string, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

function getTierLabel(subscriptionId?: string): string {
  if (!subscriptionId || subscriptionId === 'free') return 'Free'
  if (subscriptionId === 'pro') return 'Pro'
  if (subscriptionId === 'team') return 'Team'
  return 'Free'
}

export function ProfileHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { profile, isLoading, uploadAvatar, isUploadingAvatar } = useUserProfile()

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      return
    }
    uploadAvatar(file)
    e.target.value = ''
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
        <div className="h-20 w-20 rounded-full bg-muted" />
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    )
  }

  const tier = getTierLabel(profile.subscriptionId)
  const isPro = tier !== 'Free'

  return (
    <div className="flex flex-col items-center gap-4 p-6 rounded-xl border bg-card shadow-card">
      <div className="relative group">
        <Avatar className="h-20 w-20 rounded-full border-4 border-background shadow-lg">
          <AvatarImage src={profile.avatarUrl} alt={profile.name ?? profile.email} />
          <AvatarFallback className="text-xl font-semibold bg-accent/20 text-accent">
            {getInitials(profile.name, profile.email)}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={handleAvatarClick}
          disabled={isUploadingAvatar}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Change avatar"
        >
          {isUploadingAvatar ? (
            <span className="text-white text-sm">...</span>
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          className="sr-only"
          onChange={handleAvatarChange}
          aria-hidden
        />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">{profile.name || 'User'}</h2>
        {profile.bio && (
          <p className="text-sm text-muted-foreground max-w-[200px] line-clamp-2">
            {profile.bio}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{profile.email}</span>
          {profile.emailVerified && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary"
              title="Verified"
            >
              <Check className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
        <span
          className={cn(
            'inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium',
            isPro
              ? 'bg-accent/10 text-accent'
              : 'bg-muted/30 text-muted-foreground'
          )}
        >
          {tier}
        </span>
      </div>

      {!isPro && (
        <Button asChild size="sm" className="w-full">
          <Link to="/dashboard/checkout">Upgrade to Pro</Link>
        </Button>
      )}
    </div>
  )
}
