import { supabase } from '@/lib/supabase/client'
import type { LeaderboardParticipation, ReferralFunnel } from '@/types/domain'

function currentWeekStart(): string {
  const d = new Date()
  const day = d.getUTCDay()
  const diff = (day + 6) % 7
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function fetchReferralFunnel(): Promise<ReferralFunnel> {
  const [
    { count: usersWithReferrals, error: referrersError },
    { data: referredUsers, count: totalReferredUsers, error: referredError },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).gt('referral_count', 0),
    supabase.from('users').select('membership_type', { count: 'exact' }).not('referred_by', 'is', null),
  ])

  const error = referrersError ?? referredError
  if (error) throw error

  const referredCount = totalReferredUsers ?? 0
  const referredPremium = (referredUsers ?? []).filter((u) => u.membership_type === 'premium').length

  return {
    usersWithReferrals: usersWithReferrals ?? 0,
    totalReferredUsers: referredCount,
    referredUsersConvertedPremiumPct: referredCount > 0 ? (referredPremium / referredCount) * 100 : 0,
  }
}

export async function fetchLeaderboardParticipation(): Promise<LeaderboardParticipation[]> {
  const weekStart = currentWeekStart()

  const [
    { count: totalUsers, error: totalError },
    { count: streakParticipants, error: streakError },
    { count: xpParticipants, error: xpError },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase
      .from('classic_streak_leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('week_start_date', weekStart),
    supabase
      .from('weekly_xp_leaderboard')
      .select('*', { count: 'exact', head: true })
      .eq('week_start_date', weekStart),
  ])

  const error = totalError ?? streakError ?? xpError
  if (error) throw error

  const total = totalUsers || 1

  return [
    {
      name: 'Streak Classic (semaine)',
      participants: streakParticipants ?? 0,
      participationPct: ((streakParticipants ?? 0) / total) * 100,
    },
    {
      name: 'XP hebdomadaire',
      participants: xpParticipants ?? 0,
      participationPct: ((xpParticipants ?? 0) / total) * 100,
    },
  ]
}
