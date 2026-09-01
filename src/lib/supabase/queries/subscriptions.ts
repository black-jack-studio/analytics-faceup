import { supabase } from '@/lib/supabase/client'
import type { ChurnSummary } from '@/types/domain'

const CHURN_WINDOW_DAYS = 30

/**
 * faceup-server has no dedicated `subscriptions` table — plan/cancellation fields live
 * directly on `users` (membership_type, subscription_cancel_at_period_end,
 * subscription_cancel_reason, subscription_expires_at). "Canceled in the last 30 days" is
 * therefore approximated as: cancel flag set AND expiry falls within the window (there is no
 * separate canceled_at timestamp to filter on directly).
 */
export async function fetchChurnSummary(): Promise<ChurnSummary> {
  const since = new Date(Date.now() - CHURN_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: activeSubscriptions, error: activeError },
    { data: canceledRows, count: canceledCount, error: canceledError },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('membership_type', 'premium')
      .eq('subscription_cancel_at_period_end', false),
    supabase
      .from('users')
      .select('subscription_cancel_reason', { count: 'exact' })
      .eq('subscription_cancel_at_period_end', true)
      .gte('subscription_expires_at', since),
  ])

  const error = activeError ?? canceledError
  if (error) throw error

  const active = activeSubscriptions ?? 0
  const canceled = canceledCount ?? 0
  const denominator = active + canceled

  const reasonCounts = new Map<string, number>()
  for (const row of canceledRows ?? []) {
    const reason = row.subscription_cancel_reason?.trim() || 'Non renseignée'
    reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1)
  }

  const reasons = [...reasonCounts.entries()]
    .map(([reason, count]) => ({
      reason,
      count,
      pct: canceled > 0 ? (count / canceled) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    activeSubscriptions: active,
    canceledLast30d: canceled,
    churnRatePct: denominator > 0 ? (canceled / denominator) * 100 : 0,
    reasons,
  }
}
