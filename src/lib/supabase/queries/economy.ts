import { supabase } from '@/lib/supabase/client'
import type { AdImpactMetric, EconomyFlow } from '@/types/domain'

const WINDOW_DAYS = 30

/**
 * Gems have a real ledger (`gem_transactions.amount`, signed). Coins don't — faceup-server
 * only keeps a running `users.coins` balance, no per-event history — so "coins flow" here is
 * the current total in circulation (sum of balances), not a 30-day credit/debit split like
 * gems. Update this once/if a coins ledger table exists.
 */
export async function fetchEconomyFlows(): Promise<EconomyFlow[]> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: gemRows, error: gemError }, { data: coinRows, error: coinError }] = await Promise.all([
    supabase.from('gem_transactions').select('amount').gte('created_at', since),
    supabase.from('users').select('coins'),
  ])

  if (gemError) throw gemError
  if (coinError) throw coinError

  let gemsCredited = 0
  let gemsDebited = 0
  for (const row of gemRows ?? []) {
    if (row.amount >= 0) gemsCredited += row.amount
    else gemsDebited += Math.abs(row.amount)
  }

  const coinsInCirculation = (coinRows ?? []).reduce((sum, row) => sum + (row.coins ?? 0), 0)

  return [
    { currency: 'gems', credited: gemsCredited, debited: gemsDebited, net: gemsCredited - gemsDebited },
    { currency: 'coins', credited: coinsInCirculation, debited: 0, net: coinsInCirculation },
  ]
}

/**
 * No `ad_views` table exists in faceup-server's schema — ad-watch events live in PostHog, not
 * Supabase. This Supabase-only proxy buckets users by their all-in lose streak instead
 * (`users.all_in_lose_streak`) against D7 retention, until a real ad ledger exists.
 * For the real "ads watched vs retention" metric, see the PostHog-backed equivalent — track
 * an `ad_watched` event there and query it the same way as fetchDropOffFunnel does.
 */
export async function fetchAdImpactOnRetention(): Promise<AdImpactMetric[]> {
  const { data: users, error } = await supabase
    .from('users')
    .select('created_at, last_active_at, all_in_lose_streak')

  if (error) throw error

  const buckets: Record<string, { users: number; retained: number }> = {
    '0': { users: 0, retained: 0 },
    '1-2': { users: 0, retained: 0 },
    '3-5': { users: 0, retained: 0 },
    '6+': { users: 0, retained: 0 },
  }

  for (const row of users ?? []) {
    const streak = row.all_in_lose_streak ?? 0
    const bucket = streak === 0 ? '0' : streak <= 2 ? '1-2' : streak <= 5 ? '3-5' : '6+'
    const createdAt = row.created_at ? new Date(row.created_at).getTime() : null
    const lastActive = row.last_active_at ? new Date(row.last_active_at).getTime() : createdAt
    const retainedD7 = createdAt != null && lastActive != null && lastActive - createdAt >= 7 * 24 * 60 * 60 * 1000

    buckets[bucket].users += 1
    if (retainedD7) buckets[bucket].retained += 1
  }

  return Object.entries(buckets).map(([adsWatchedBucket, { users: bucketUsers, retained }]) => ({
    adsWatchedBucket,
    users: bucketUsers,
    retainedD7Pct: bucketUsers > 0 ? (retained / bucketUsers) * 100 : 0,
  }))
}
