import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  OnboardingProgress,
  StudentProfileInput,
  TeacherProfileInput,
  Specialty,
} from '@/types/onboarding'
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api'

const QUERY_KEY = ['onboarding']

export function useOnboarding(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      console.log('[useOnboarding] 🔄 Starting API call to onboarding/me')
      try {
        const data = await apiGet<OnboardingProgress>('onboarding/me', {
          auth: true,
        })
        console.log('[useOnboarding] ✅ API call succeeded, data:', data)
        return data
      } catch (error) {
        console.error('[useOnboarding] ❌ API call failed:', error)
        throw error
      }
    },
    refetchOnWindowFocus: true,
    enabled,
    retry: (failureCount, error) => {
      console.log(
        '[useOnboarding] 🔄 Retry attempt:',
        failureCount,
        'error:',
        error
      )
      // Don't retry on timeout errors - they'll just timeout again
      if (error instanceof TypeError && error.message.includes('timeout')) {
        console.log('[useOnboarding] ❌ Timeout error detected - not retrying')
        return false
      }
      // Don't retry on network errors after first attempt
      if (failureCount >= 1) return false
      return true
    },
    // Set a reasonable timeout for the query itself
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    staleTime: 2 * 60 * 1000, // 2 minutes - consider data stale after 2 minutes
  })

  console.log('[useOnboarding] 📊 Query state:', {
    enabled,
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,
    hasData: !!query.data,
  })

  const setProgress = (data: OnboardingProgress) => {
    queryClient.setQueryData<OnboardingProgress>(QUERY_KEY, data)
  }

  const saveStudentMutation = useMutation({
    mutationFn: (payload: StudentProfileInput) =>
      apiPatch<OnboardingProgress>('onboarding/student', payload, {
        auth: true,
      }),
    onSuccess: setProgress,
  })

  const saveTeacherMutation = useMutation({
    mutationFn: (payload: TeacherProfileInput) =>
      apiPatch<OnboardingProgress>('onboarding/teacher', payload, {
        auth: true,
      }),
    onSuccess: setProgress,
  })

  const setRoleMutation = useMutation({
    mutationFn: (intendedRole: 'STUDENT' | 'TEACHER') =>
      apiPatch<OnboardingProgress>(
        'onboarding/role',
        { intendedRole },
        { auth: true }
      ),
    onSuccess: setProgress,
  })

  const completeMutation = useMutation({
    mutationFn: () =>
      apiPost<OnboardingProgress>('onboarding/complete', undefined, {
        auth: true,
      }),
    onSuccess: setProgress,
  })

  const resetMutation = useMutation({
    mutationFn: () =>
      apiPost<OnboardingProgress>('onboarding/reset', undefined, {
        auth: true,
      }),
    onSuccess: setProgress,
  })

  const clearRoleMutation = useMutation({
    mutationFn: () =>
      apiDelete<OnboardingProgress>('onboarding/role', {
        auth: true,
      }),
    onSuccess: setProgress,
  })

  return {
    ...query,
    progress: query.data,
    refetchProgress: query.refetch,
    setRole: setRoleMutation.mutateAsync,
    clearRole: clearRoleMutation.mutateAsync,
    saveStudent: saveStudentMutation.mutateAsync,
    saveTeacher: saveTeacherMutation.mutateAsync,
    completeOnboarding: completeMutation.mutateAsync,
    resetOnboarding: resetMutation.mutateAsync,
    isSaving:
      saveStudentMutation.isPending ||
      saveTeacherMutation.isPending ||
      completeMutation.isPending ||
      setRoleMutation.isPending ||
      resetMutation.isPending ||
      clearRoleMutation.isPending,
  }
}

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: () =>
      apiGet<Specialty[]>('onboarding/specialties', { auth: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
