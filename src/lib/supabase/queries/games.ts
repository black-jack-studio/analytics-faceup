import { supabase } from '@/lib/supabase/client'

const INACTIVITY_DAYS = 7

export interface QuitAfterAllInStat {
  usersOnAllInStreak: number
  usersInactiveSinceStreak: number
  quitRatePct: number
}

/**
 * faceup-server has no per-hand session history table — `game_all_in_loss` /
 * `game_consecutive_loss` funnels with real step-by-step drop-off live entirely in PostHog
 * (see src/lib/posthog/queries.ts:fetchDropOffFunnel). This is the closest Supabase-only
 * proxy: of users currently sitting on an active all-in lose streak
 * (`users.all_in_lose_streak >= 1`), how many have been inactive for 7+ days — i.e. they
 * haven't come back to try to recover it.
 */
export async function fetchQuitAfterAllInLoss(): Promise<QuitAfterAllInStat> {
  const inactivityCutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { count: usersOnAllInStreak, error: streakError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('all_in_lose_streak', 1)

  if (streakError) throw streakError

  const { count: usersInactiveSinceStreak, error: inactiveError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('all_in_lose_streak', 1)
    .lt('last_active_at', inactivityCutoff)

  if (inactiveError) throw inactiveError

  const streakCount = usersOnAllInStreak ?? 0
  const inactiveCount = usersInactiveSinceStreak ?? 0

  return {
    usersOnAllInStreak: streakCount,
    usersInactiveSinceStreak: inactiveCount,
    quitRatePct: streakCount > 0 ? (inactiveCount / streakCount) * 100 : 0,
  }
}
