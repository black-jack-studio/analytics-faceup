import { useQuery } from '@tanstack/react-query'
import { fetchLiveOpsSummary } from '@/lib/supabase/queries/liveops'

export function useLiveOpsSummary() {
  return useQuery({
    queryKey: ['live-ops-summary'],
    queryFn: fetchLiveOpsSummary,
    staleTime: 30_000,
  })
}
