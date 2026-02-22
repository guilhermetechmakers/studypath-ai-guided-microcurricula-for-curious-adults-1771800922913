import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adoptCurriculumToLibrary, saveCurriculumToLibrary } from '@/api'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

const QUERY_KEY = ['search', 'curricula'] as const

export function useAdoptCurriculum() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (curriculumId: string) => {
      if (!user?.id) throw new Error('Authentication required')
      return adoptCurriculumToLibrary(user.id, curriculumId, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Curriculum adopted into My Library')
    },
    onError: (err: Error) => {
      if (err.message?.includes('Authentication')) {
        toast.error('Please log in to adopt curricula')
      } else {
        toast.error(err.message ?? 'Failed to adopt curriculum')
      }
    },
  })
}

export function useSaveCurriculum() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (curriculumId: string) => {
      if (!user?.id) throw new Error('Authentication required')
      return saveCurriculumToLibrary(user.id, curriculumId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Curriculum saved')
    },
    onError: (err: Error) => {
      if (err.message?.includes('Authentication')) {
        toast.error('Please log in to save curricula')
      } else {
        toast.error(err.message ?? 'Failed to save curriculum')
      }
    },
  })
}
