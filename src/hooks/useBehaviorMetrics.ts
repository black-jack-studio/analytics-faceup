import { useQuery } from '@tanstack/react-query'
import { POSTHOG_EVENTS, fetchAttConsentMetrics, fetchButtonClickStats, fetchDropOffFunnel } from '@/lib/posthog/queries'
import { isPostHogQueryConfigured } from '@/lib/posthog/queryApi'

export function useAttConsent() {
  return useQuery({
    queryKey: ['att-consent'],
    queryFn: fetchAttConsentMetrics,
    enabled: isPostHogQueryConfigured,
    staleTime: 5 * 60_000,
  })
}

export function useButtonClickStats(limit = 20) {
  return useQuery({
    queryKey: ['button-clicks', limit],
    queryFn: () => fetchButtonClickStats(limit),
    enabled: isPostHogQueryConfigured,
    staleTime: 5 * 60_000,
  })
}

export function useAllInLossFunnel() {
  return useQuery({
    queryKey: ['funnel', POSTHOG_EVENTS.allInLoss],
    queryFn: () => fetchDropOffFunnel(POSTHOG_EVENTS.allInLoss),
    enabled: isPostHogQueryConfigured,
    staleTime: 5 * 60_000,
  })
}

export function useConsecutiveLossFunnel() {
  return useQuery({
    queryKey: ['funnel', POSTHOG_EVENTS.consecutiveLoss],
    queryFn: () => fetchDropOffFunnel(POSTHOG_EVENTS.consecutiveLoss),
    enabled: isPostHogQueryConfigured,
    staleTime: 5 * 60_000,
  })
}
