import { useQuery } from '@tanstack/react-query'
import { fetchPlayerProfile } from '@/lib/supabase/queries/users'

export function usePlayerProfileData(userId: string | null) {
  return useQuery({
    queryKey: ['player-profile', userId],
    queryFn: () => fetchPlayerProfile(userId as string),
    enabled: !!userId,
    staleTime: 60_000,
  })
}
