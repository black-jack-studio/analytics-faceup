import { useQuery } from '@tanstack/react-query'
import { fetchSkillSummary } from '@/lib/supabase/queries/gameplay'

export function useSkillSummary() {
  return useQuery({
    queryKey: ['skill-summary'],
    queryFn: fetchSkillSummary,
    staleTime: 5 * 60_000,
  })
}
