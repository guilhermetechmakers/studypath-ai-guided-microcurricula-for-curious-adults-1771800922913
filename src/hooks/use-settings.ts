import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import * as settingsApi from '@/api/settings'
import type { UserProfile, ExportJob, ImportJob } from '@/types/settings'

const SETTINGS_KEYS = {
  profile: ['settings', 'profile'] as const,
  preferences: ['settings', 'preferences'] as const,
  sessions: ['settings', 'sessions'] as const,
  oauth: ['settings', 'oauth'] as const,
  subscription: ['settings', 'subscription'] as const,
  invoices: ['settings', 'invoices'] as const,
  nextSessions: ['settings', 'nextSessions'] as const,
  analytics: (range?: string) => ['settings', 'analytics', range] as const,
  export: (id: string) => ['settings', 'export', id] as const,
  import: (id: string) => ['settings', 'import', id] as const,
}

export function useUserProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const fallbackProfile: UserProfile | undefined = user
    ? {
        id: user.id,
        email: user.email,
        emailVerified: false,
        name: user.name ?? undefined,
        avatarUrl: user.avatarUrl,
        createdAt: new Date().toISOString(),
      }
    : undefined

  const query = useQuery({
    queryKey: SETTINGS_KEYS.profile,
    queryFn: settingsApi.getUserProfile,
    retry: false,
    placeholderData: fallbackProfile,
  })

  const profile = query.data ?? (query.isError ? fallbackProfile : undefined)

  const { setUser } = useAuth()

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEYS.profile, data)
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatarUrl,
      })
      toast.success('Profile updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    },
  })

  const avatarMutation = useMutation({
    mutationFn: settingsApi.uploadAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEYS.profile, (prev: UserProfile) =>
        prev ? { ...prev, avatarUrl: data.avatarUrl } : prev
      )
      const current = queryClient.getQueryData<UserProfile>(SETTINGS_KEYS.profile)
      if (current) {
        setUser({
          id: current.id,
          email: current.email,
          name: current.name,
          avatarUrl: data.avatarUrl,
        })
      }
      toast.success('Avatar updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    },
  })

  return {
    profile,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    uploadAvatar: avatarMutation.mutateAsync,
    isUploadingAvatar: avatarMutation.isPending,
  }
}

export function useUserPreferences() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: SETTINGS_KEYS.preferences,
    queryFn: settingsApi.getUserPreferences,
    retry: false,
    placeholderData: {
      sessionLengthMinutes: 25 as const,
      learningDepth: 'detailed' as const,
      citationStyle: 'apa' as const,
      studyCadence: 'daily' as const,
      priorKnowledgeLevel: 3,
      spacedReviewEnabled: true,
    },
  })

  const updateMutation = useMutation({
    mutationFn: settingsApi.updateUserPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEYS.preferences, data)
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.nextSessions })
      toast.success('Preferences saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    },
  })

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}

export function useNextSessions() {
  return useQuery({
    queryKey: SETTINGS_KEYS.nextSessions,
    queryFn: settingsApi.getNextSessions,
    retry: false,
    placeholderData: [],
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => toast.success('Password updated'),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Password change failed'),
  })
}

export function useSessions() {
  return useQuery({
    queryKey: SETTINGS_KEYS.sessions,
    queryFn: settingsApi.getSessions,
    retry: false,
    placeholderData: [],
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.sessions })
      toast.success('Session revoked')
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Revoke failed'),
  })
}

export function useOAuthConnections() {
  return useQuery({
    queryKey: SETTINGS_KEYS.oauth,
    queryFn: settingsApi.getOAuthConnections,
    retry: false,
    placeholderData: [],
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: SETTINGS_KEYS.subscription,
    queryFn: settingsApi.getSubscription,
    retry: false,
    placeholderData: {
      id: 'free',
      planId: 'free' as const,
      status: 'active' as const,
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: SETTINGS_KEYS.invoices,
    queryFn: settingsApi.getInvoices,
    retry: false,
    placeholderData: [],
  })
}

export function useUserAnalytics(range?: '7d' | '30d' | '90d') {
  return useQuery({
    queryKey: SETTINGS_KEYS.analytics(range),
    queryFn: () => settingsApi.getUserAnalytics({ range }),
    retry: false,
    placeholderData: {
      lessonsCompleted: 0,
      minutesStudied: 0,
      streakDays: 0,
      milestonesReached: 0,
      byPeriod: {},
    },
  })
}

export function useCreateExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.createExport,
    onSuccess: (data: ExportJob) => {
      queryClient.setQueryData(SETTINGS_KEYS.export(data.id), data)
      toast.success('Export started. You will be notified when ready.')
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Export failed'),
  })
}

export function useExportJob(id: string | undefined) {
  return useQuery({
    queryKey: SETTINGS_KEYS.export(id ?? ''),
    queryFn: () => settingsApi.getExport(id!),
    enabled: !!id,
  })
}

export function useCreateImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: settingsApi.createImport,
    onSuccess: (data: ImportJob) => {
      queryClient.setQueryData(SETTINGS_KEYS.import(data.id), data)
      toast.success('Import started')
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Import failed'),
  })
}

export function useImportJob(id: string | undefined) {
  return useQuery({
    queryKey: SETTINGS_KEYS.import(id ?? ''),
    queryFn: () => settingsApi.getImport(id!),
    enabled: !!id,
  })
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: settingsApi.deleteAccount,
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Deletion failed'),
  })
}
