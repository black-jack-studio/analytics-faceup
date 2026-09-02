import { supabase } from '@/lib/supabase/client'
import type { TrustSafetySummary } from '@/types/domain'

const WINDOW_DAYS = 30

export async function fetchTrustSafetySummary(): Promise<TrustSafetySummary> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: reports, count: reportsCount, error: reportsError },
    { count: blocksCount, error: blocksError },
  ] = await Promise.all([
    supabase.from('user_reports').select('reason', { count: 'exact' }).gte('created_at', since),
    supabase.from('blocked_users').select('*', { count: 'exact', head: true }).gte('created_at', since),
  ])

  const error = reportsError ?? blocksError
  if (error) throw error

  const reasonCounts = new Map<string, number>()
  for (const row of reports ?? []) {
    reasonCounts.set(row.reason, (reasonCounts.get(row.reason) ?? 0) + 1)
  }

  const topReasons = [...reasonCounts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    reportsLast30d: reportsCount ?? 0,
    blocksLast30d: blocksCount ?? 0,
    topReasons,
  }
}
