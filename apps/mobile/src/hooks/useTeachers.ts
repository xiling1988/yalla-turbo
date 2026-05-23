// hooks/useTeachers.ts
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import {
  type TeacherApiResponse,
  type TeacherProfile,
  mapTeacherApiToProfile,
} from '@/types/teachers'

type Params = { city?: string; style?: string }

export function useTeachers(params: Params = {}) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: async (): Promise<TeacherProfile[]> => {
      const usp = new URLSearchParams(params as Record<string, string>)
      const path = `teachers?${usp.toString()}`
      const teachers = await apiGet<TeacherApiResponse[]>(path, { auth: true })
      
      // Map API response to ExploreScreen format and filter out invalid teachers
      return teachers.map(mapTeacherApiToProfile).filter((t): t is TeacherProfile => t !== null)
    },
    staleTime: 60_000, // 1 min: quick revisit feels instant
    refetchOnWindowFocus: true, // auto-refresh when app regains focus
  })
}
