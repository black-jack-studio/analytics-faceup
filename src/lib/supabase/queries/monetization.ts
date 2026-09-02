import { supabase } from '@/lib/supabase/client'
import type { ConversionCohort, GemSpendByItemType, WhaleUser } from '@/types/domain'

const MS_DAY = 24 * 60 * 60 * 1000
const COHORT_WEEKS = 8

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/** Gem purchases grouped by item type — what sells, aggregated client-side (see gameplay.ts note). */
export async function fetchGemSpendByItemType(): Promise<GemSpendByItemType[]> {
  const { data, error } = await supabase.from('gem_purchases').select('item_type, gem_cost')
  if (error) throw error

  const byType = new Map<string, { purchases: number; gemsSpent: number }>()
  for (const row of data ?? []) {
    const bucket = byType.get(row.item_type) ?? { purchases: 0, gemsSpent: 0 }
    bucket.purchases += 1
    bucket.gemsSpent += row.gem_cost
    byType.set(row.item_type, bucket)
  }

  return [...byType.entries()]
    .map(([itemType, b]) => ({ itemType, purchases: b.purchases, gemsSpent: b.gemsSpent }))
    .sort((a, b) => b.gemsSpent - a.gemsSpent)
}

/** Top spenders by total gems spent on gem_purchases — "whales" for targeted retention/offers. */
export async function fetchWhales(limit = 10): Promise<WhaleUser[]> {
  const { data: purchases, error } = await supabase.from('gem_purchases').select('user_id, gem_cost')
  if (error) throw error

  const spendByUser = new Map<string, { total: number; count: number }>()
  for (const row of purchases ?? []) {
    const bucket = spendByUser.get(row.user_id) ?? { total: 0, count: 0 }
    bucket.total += row.gem_cost
    bucket.count += 1
    spendByUser.set(row.user_id, bucket)
  }

  const topUserIds = [...spendByUser.entries()]
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, limit)
    .map(([userId]) => userId)

  if (topUserIds.length === 0) return []

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, username, selected_avatar_id')
    .in('id', topUserIds)

  if (usersError) throw usersError

  const userById = new Map((users ?? []).map((u) => [u.id, u]))

  return topUserIds
    .map((userId) => {
      const user = userById.get(userId)
      const spend = spendByUser.get(userId)!
      return {
        userId,
        username: user?.username ?? 'Utilisateur supprimé',
        selectedAvatarId: user?.selected_avatar_id ?? null,
        totalGemsSpent: spend.total,
        purchaseCount: spend.count,
      }
    })
    .sort((a, b) => b.totalGemsSpent - a.totalGemsSpent)
}

/**
 * Weekly signup cohorts vs. current premium share. Shows what fraction of each cohort holds
 * premium *today* — not a true "converted within 30 days of signup" funnel, since membership
 * history isn't tracked, only current membership_type.
 */
export async function fetchConversionCohorts(): Promise<ConversionCohort[]> {
  const since = new Date(Date.now() - COHORT_WEEKS * 7 * MS_DAY)

  const { data, error } = await supabase
    .from('users')
    .select('created_at, membership_type')
    .gte('created_at', since.toISOString())

  if (error) throw error

  const cohorts = new Map<string, { signups: number; premium: number }>()
  for (const row of data ?? []) {
    if (!row.created_at) continue
    const label = startOfWeek(new Date(row.created_at)).toISOString().slice(0, 10)
    const bucket = cohorts.get(label) ?? { signups: 0, premium: 0 }
    bucket.signups += 1
    if (row.membership_type === 'premium') bucket.premium += 1
    cohorts.set(label, bucket)
  }

  return [...cohorts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohortLabel, b]) => ({
      cohortLabel,
      signupCount: b.signups,
      premiumCount: b.premium,
      conversionPct: b.signups > 0 ? (b.premium / b.signups) * 100 : 0,
    }))
}
