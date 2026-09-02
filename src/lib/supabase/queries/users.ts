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

export interface PlayerGameTypeStats {
  gameType: string
  handsPlayed: number
  handsWon: number
  winRatePct: number
  bustRatePct: number
  blackjackRatePct: number
}

export interface PlayerProfile {
  id: string
  username: string
  selectedAvatarId: string | null
  membershipType: string | null
  level: number | null
  seasonXp: number | null
  currentDayStreak: number | null
  coins: number
  gems: number
  createdAt: string | null
  lastActiveAt: string | null
  referralCount: number | null
  byGameType: PlayerGameTypeStats[]
  totalHandsPlayed: number
  overallWinRatePct: number
  basicStrategyAccuracyPct: number | null
}

/**
 * Same shape of stats the in-game player profile screen shows (level, streak, currencies,
 * per-game-type win rate), assembled from `users` + `game_stats` for a single player — used
 * by the dashboard's "click a player" profile card.
 */
export async function fetchPlayerProfile(userId: string): Promise<PlayerProfile> {
  const [{ data: user, error: userError }, { data: stats, error: statsError }] = await Promise.all([
    supabase
      .from('users')
      .select(
        'id, username, selected_avatar_id, membership_type, level, season_xp, current_day_streak, coins, gems, created_at, last_active_at, referral_count',
      )
      .eq('id', userId)
      .single(),
    supabase
      .from('game_stats')
      .select('game_type, hands_played, hands_won, busts, blackjacks, correct_decisions, total_decisions')
      .eq('user_id', userId),
  ])

  if (userError) throw userError
  if (statsError) throw statsError

  let totalHandsPlayed = 0
  let totalWon = 0
  let totalCorrect = 0
  let totalDecisions = 0

  // faceup-server writes one `game_stats` row per session, not a single running total per
  // game_type — aggregate them here the same way fetchSkillSummary does app-wide.
  const byType = new Map<string, { handsPlayed: number; handsWon: number; busts: number; blackjacks: number }>()

  for (const row of stats ?? []) {
    const handsPlayed = row.hands_played ?? 0
    const handsWon = row.hands_won ?? 0
    totalHandsPlayed += handsPlayed
    totalWon += handsWon
    totalCorrect += row.correct_decisions ?? 0
    totalDecisions += row.total_decisions ?? 0

    const bucket = byType.get(row.game_type) ?? { handsPlayed: 0, handsWon: 0, busts: 0, blackjacks: 0 }
    bucket.handsPlayed += handsPlayed
    bucket.handsWon += handsWon
    bucket.busts += row.busts ?? 0
    bucket.blackjacks += row.blackjacks ?? 0
    byType.set(row.game_type, bucket)
  }

  const byGameType: PlayerGameTypeStats[] = [...byType.entries()].map(([gameType, s]) => ({
    gameType,
    handsPlayed: s.handsPlayed,
    handsWon: s.handsWon,
    winRatePct: s.handsPlayed > 0 ? (s.handsWon / s.handsPlayed) * 100 : 0,
    bustRatePct: s.handsPlayed > 0 ? (s.busts / s.handsPlayed) * 100 : 0,
    blackjackRatePct: s.handsPlayed > 0 ? (s.blackjacks / s.handsPlayed) * 100 : 0,
  }))

  return {
    id: user.id,
    username: user.username,
    selectedAvatarId: user.selected_avatar_id,
    membershipType: user.membership_type,
    level: user.level,
    seasonXp: user.season_xp,
    currentDayStreak: user.current_day_streak,
    coins: user.coins ?? 0,
    gems: user.gems ?? 0,
    createdAt: user.created_at,
    lastActiveAt: user.last_active_at,
    referralCount: user.referral_count,
    byGameType,
    totalHandsPlayed,
    overallWinRatePct: totalHandsPlayed > 0 ? (totalWon / totalHandsPlayed) * 100 : 0,
    basicStrategyAccuracyPct: totalDecisions > 0 ? (totalCorrect / totalDecisions) * 100 : null,
  }
}
