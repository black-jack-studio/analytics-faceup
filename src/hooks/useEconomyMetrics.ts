import { useQuery } from '@tanstack/react-query'
import { fetchAdImpactOnRetention, fetchEconomyFlows } from '@/lib/supabase/queries/economy'
import { fetchQuitAfterAllInLoss } from '@/lib/supabase/queries/games'
import {
  fetchConversionCohorts,
  fetchGemSpendByItemType,
  fetchWhales,
} from '@/lib/supabase/queries/monetization'
import { fetchChurnSummary } from '@/lib/supabase/queries/subscriptions'

export function useEconomyFlows() {
  return useQuery({
    queryKey: ['economy-flows'],
    queryFn: fetchEconomyFlows,
    staleTime: 60_000,
  })
}

export function useAdImpact() {
  return useQuery({
    queryKey: ['ad-impact'],
    queryFn: fetchAdImpactOnRetention,
    staleTime: 5 * 60_000,
  })
}

export function useChurnSummary() {
  return useQuery({
    queryKey: ['churn-summary'],
    queryFn: fetchChurnSummary,
    staleTime: 5 * 60_000,
  })
}

export function useQuitAfterAllIn() {
  return useQuery({
    queryKey: ['quit-after-all-in'],
    queryFn: fetchQuitAfterAllInLoss,
    staleTime: 5 * 60_000,
  })
}

export function useGemSpendByItemType() {
  return useQuery({
    queryKey: ['gem-spend-by-item-type'],
    queryFn: fetchGemSpendByItemType,
    staleTime: 5 * 60_000,
  })
}

export function useWhales(limit = 10) {
  return useQuery({
    queryKey: ['whales', limit],
    queryFn: () => fetchWhales(limit),
    staleTime: 5 * 60_000,
  })
}

export function useConversionCohorts() {
  return useQuery({
    queryKey: ['conversion-cohorts'],
    queryFn: fetchConversionCohorts,
    staleTime: 5 * 60_000,
  })
}
