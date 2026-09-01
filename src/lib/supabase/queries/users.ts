import { supabase } from '@/lib/supabase/client'
import type { TrackingSegment } from '@/types/domain'

const ACTIVE_WINDOW_DAYS = 30

/**
 * Compliance segmentation filter. `users.privacy_settings->>dataCollection` is the closest
 * first-party proxy we have for "did this user consent to behavioral tracking" — adjust if
 * the app adds a dedicated ATT/consent column.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withSegment(query: any, segment: TrackingSegment): any {
  if (segment === 'tracked') return query.eq('privacy_settings->>dataCollection', 'true')
  if (segment === 'anonymous') return query.eq('privacy_settings->>dataCollection', 'false')
  return query
}

export interface UserCounts {
  total: number
  active: number
  inactive: number
  free: number
  premium: number
}

export async function fetchUserCounts(segment: TrackingSegment = 'all'): Promise<UserCounts> {
  const activeSince = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const base = () => withSegment(supabase.from('users').select('*', { count: 'exact', head: true }), segment)

  const [
    { count: total, error: totalError },
    { count: active, error: activeError },
    { count: premium, error: premiumError },
  ] = await Promise.all([
    base(),
    base().gte('last_active_at', activeSince),
    base().eq('membership_type', 'premium'),
  ])

  const error = totalError ?? activeError ?? premiumError
  if (error) throw error

  const totalCount = total ?? 0
  const activeCount = active ?? 0
  const premiumCount = premium ?? 0

  return {
    total: totalCount,
    active: activeCount,
    inactive: Math.max(totalCount - activeCount, 0),
    free: Math.max(totalCount - premiumCount, 0),
    premium: premiumCount,
  }
}

export interface RecentUser {
  id: string
  username: string
  selectedAvatarId: string | null
  membershipType: string | null
  coins: number
  gems: number
  createdAt: string | null
  lastActiveAt: string | null
}

export async function fetchRecentUsers(limit = 8): Promise<RecentUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, selected_avatar_id, membership_type, coins, gems, created_at, last_active_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    selectedAvatarId: row.selected_avatar_id,
    membershipType: row.membership_type,
    coins: row.coins ?? 0,
    gems: row.gems ?? 0,
    createdAt: row.created_at,
    lastActiveAt: row.last_active_at,
  }))
}
