import { useQuery } from '@tanstack/react-query'
import { fetchAvgSessionMinutes } from '@/lib/posthog/queries'
import { isPostHogQueryConfigured } from '@/lib/posthog/queryApi'
import { fetchRecentUsers, fetchUserCounts } from '@/lib/supabase/queries/users'
import type { TrackingSegment } from '@/types/domain'

export function useOverviewMetrics(segment: TrackingSegment) {
  return useQuery({
    queryKey: ['overview-metrics', segment],
    queryFn: () => fetchUserCounts(segment),
    staleTime: 60_000,
  })
}

export function useAvgSessionMinutes() {
  return useQuery({
    queryKey: ['avg-session-minutes'],
    queryFn: fetchAvgSessionMinutes,
    enabled: isPostHogQueryConfigured,
    staleTime: 5 * 60_000,
  })
}

export function useRecentUsers(limit = 8) {
  return useQuery({
    queryKey: ['recent-users', limit],
    queryFn: () => fetchRecentUsers(limit),
    staleTime: 60_000,
  })
}
