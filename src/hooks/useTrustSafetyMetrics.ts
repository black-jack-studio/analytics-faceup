import { useQuery } from '@tanstack/react-query'
import { fetchTrustSafetySummary } from '@/lib/supabase/queries/trustsafety'

export function useTrustSafetySummary() {
  return useQuery({
    queryKey: ['trust-safety-summary'],
    queryFn: fetchTrustSafetySummary,
    staleTime: 5 * 60_000,
  })
}
