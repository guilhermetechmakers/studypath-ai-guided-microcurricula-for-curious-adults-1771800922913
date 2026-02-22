import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as notificationsApi from '@/api/notifications'
import * as schedulerApi from '@/api/scheduler'
import type {
  NotificationPreferences,
  WeeklyAvailability,
  Session,
  CreateSessionPayload,
} from '@/types/scheduler'

const KEYS = {
  notificationPreferences: ['scheduler', 'notificationPreferences'] as const,
  availability: ['scheduler', 'availability'] as const,
  sessions: (from?: string, to?: string) =>
    ['scheduler', 'sessions', from, to] as const,
  suggestions: ['scheduler', 'suggestions'] as const,
  history: (days?: number) => ['scheduler', 'history', days] as const,
}

const defaultPreferences: NotificationPreferences = {
  user_id: '',
  push_enabled: true,
  email_enabled: true,
  in_app_enabled: true,
  categories: {
    session_reminder: true,
    milestone: true,
    suggestion: true,
  },
  default_reminder_minutes: 30,
  updated_at: new Date().toISOString(),
}

const defaultAvailability: WeeklyAvailability = {
  availability: {},
  granularity_minutes: 60,
  default_session_minutes: 30,
  preferred_times: { morning: false, afternoon: false, evening: false },
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: KEYS.notificationPreferences,
    queryFn: notificationsApi.getNotificationPreferences,
    retry: false,
    placeholderData: defaultPreferences,
  })

  const updateMutation = useMutation({
    mutationFn: notificationsApi.updateNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(KEYS.notificationPreferences, data)
      toast.success('Notification preferences saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    },
  })

  return {
    preferences: query.data ?? defaultPreferences,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updatePreferences: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}

export function useAvailability() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: KEYS.availability,
    queryFn: schedulerApi.getAvailability,
    retry: false,
    placeholderData: defaultAvailability,
  })

  const updateMutation = useMutation({
    mutationFn: schedulerApi.updateAvailability,
    onSuccess: (data) => {
      queryClient.setQueryData(KEYS.availability, data)
      queryClient.invalidateQueries({ queryKey: ['scheduler', 'suggestions'] })
      toast.success('Availability saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    },
  })

  return {
    availability: query.data ?? defaultAvailability,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateAvailability: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}

export function useSessions(params?: { from?: string; to?: string; limit?: number }) {
  const from = params?.from ?? new Date().toISOString()
  const to = params?.to ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  return useQuery({
    queryKey: KEYS.sessions(from, to),
    queryFn: () =>
      schedulerApi.getSessions({
        from,
        to,
        limit: params?.limit ?? 50,
      }),
    retry: false,
    placeholderData: [],
  })
}

export function useScheduleSuggestions(horizonDays = 14) {
  return useQuery({
    queryKey: [...KEYS.suggestions, horizonDays],
    queryFn: () => schedulerApi.getScheduleSuggestions({ horizon_days: horizonDays }),
    retry: false,
    placeholderData: { suggestions: [], rationale: undefined },
  })
}

export function useCreateSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { sessions: CreateSessionPayload[]; idempotency_key?: string }) =>
      schedulerApi.createSessions(payload),
    onSuccess: (data: Session[]) => {
      queryClient.invalidateQueries({ queryKey: ['scheduler'] })
      toast.success(`Scheduled ${data.length} session${data.length === 1 ? '' : 's'}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create sessions')
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string
      updates: Parameters<typeof schedulerApi.updateSession>[1]
    }) => schedulerApi.updateSession(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler'] })
      toast.success('Session updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    },
  })
}

export function useCancelSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { id: string; reason?: string }) =>
      schedulerApi.cancelSession(params.id, { reason: params.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduler'] })
      toast.success('Session canceled')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Cancel failed')
    },
  })
}

export function useNotificationHistory(days = 30) {
  return useQuery({
    queryKey: KEYS.history(days),
    queryFn: () => notificationsApi.getNotificationHistory({ days }),
    retry: false,
    placeholderData: [],
  })
}

export function useFetchSuggestions() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.fetchQuery({
      queryKey: KEYS.suggestions,
      queryFn: () => schedulerApi.getScheduleSuggestions({ horizon_days: 14 }),
    })
}
