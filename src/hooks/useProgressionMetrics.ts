import { useQuery } from '@tanstack/react-query'
import {
  fetchBattlePassProgress,
  fetchLevelDistribution,
  fetchRetentionCohorts,
  fetchStreakDistribution,
} from '@/lib/supabase/queries/progression'

export function useRetentionCohorts() {
  return useQuery({
    queryKey: ['retention-cohorts'],
    queryFn: fetchRetentionCohorts,
    staleTime: 5 * 60_000,
  })
}

export function useLevelDistribution() {
  return useQuery({
    queryKey: ['level-distribution'],
    queryFn: fetchLevelDistribution,
    staleTime: 5 * 60_000,
  })
}

export function useStreakDistribution() {
  return useQuery({
    queryKey: ['streak-distribution'],
    queryFn: fetchStreakDistribution,
    staleTime: 5 * 60_000,
  })
}

export function useBattlePassProgress() {
  return useQuery({
    queryKey: ['battle-pass-progress'],
    queryFn: fetchBattlePassProgress,
    staleTime: 5 * 60_000,
  })
}
