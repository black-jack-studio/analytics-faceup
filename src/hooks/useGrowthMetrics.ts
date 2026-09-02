import { useQuery } from '@tanstack/react-query'
import { fetchLeaderboardParticipation, fetchReferralFunnel } from '@/lib/supabase/queries/growth'

export function useReferralFunnel() {
  return useQuery({
    queryKey: ['referral-funnel'],
    queryFn: fetchReferralFunnel,
    staleTime: 5 * 60_000,
  })
}

export function useLeaderboardParticipation() {
  return useQuery({
    queryKey: ['leaderboard-participation'],
    queryFn: fetchLeaderboardParticipation,
    staleTime: 5 * 60_000,
  })
}
