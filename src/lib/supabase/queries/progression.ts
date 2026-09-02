import { supabase } from '@/lib/supabase/client'
import type { BattlePassProgress, LevelBucket, RetentionCohort, StreakBucket } from '@/types/domain'

const COHORT_WEEKS = 6
const MS_DAY = 24 * 60 * 60 * 1000

function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // Monday-start week
  d.setUTCDate(d.getUTCDate() - diff)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * Weekly signup cohorts (last 6 weeks) vs. D1/D7/D30 retention, computed client-side from
 * `users.created_at` / `last_active_at`. "Retained" means last_active_at falls at least N days
 * after signup — a simple last-seen proxy, not a true return-visit-on-day-N metric (would need
 * a session/event log to do that properly, e.g. via PostHog).
 */
export async function fetchRetentionCohorts(): Promise<RetentionCohort[]> {
  const since = new Date(Date.now() - COHORT_WEEKS * 7 * MS_DAY)

  const { data, error } = await supabase
    .from('users')
    .select('created_at, last_active_at')
    .gte('created_at', since.toISOString())

  if (error) throw error

  const cohorts = new Map<string, { signups: number; d1: number; d7: number; d30: number }>()

  for (const row of data ?? []) {
    if (!row.created_at) continue
    const createdAt = new Date(row.created_at)
    const weekStart = startOfWeek(createdAt)
    const label = weekStart.toISOString().slice(0, 10)
    const bucket = cohorts.get(label) ?? { signups: 0, d1: 0, d7: 0, d30: 0 }
    bucket.signups += 1

    const lastActive = row.last_active_at ? new Date(row.last_active_at) : createdAt
    const ageMs = lastActive.getTime() - createdAt.getTime()
    if (ageMs >= 1 * MS_DAY) bucket.d1 += 1
    if (ageMs >= 7 * MS_DAY) bucket.d7 += 1
    if (ageMs >= 30 * MS_DAY) bucket.d30 += 1

    cohorts.set(label, bucket)
  }

  return [...cohorts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cohortLabel, b]) => ({
      cohortLabel,
      signupCount: b.signups,
      retainedD1Pct: b.signups > 0 ? (b.d1 / b.signups) * 100 : 0,
      retainedD7Pct: b.signups > 0 ? (b.d7 / b.signups) * 100 : 0,
      retainedD30Pct: b.signups > 0 ? (b.d30 / b.signups) * 100 : 0,
    }))
}

export async function fetchLevelDistribution(): Promise<LevelBucket[]> {
  const { data, error } = await supabase.from('users').select('level')
  if (error) throw error

  const buckets: Record<string, number> = { '0-4': 0, '5-9': 0, '10-19': 0, '20-49': 0, '50+': 0 }
  for (const row of data ?? []) {
    const level = row.level ?? 0
    const key = level < 5 ? '0-4' : level < 10 ? '5-9' : level < 20 ? '10-19' : level < 50 ? '20-49' : '50+'
    buckets[key] += 1
  }

  return Object.entries(buckets).map(([levelRange, users]) => ({ levelRange, users }))
}

export async function fetchStreakDistribution(): Promise<StreakBucket[]> {
  const { data, error } = await supabase.from('users').select('current_day_streak')
  if (error) throw error

  const buckets: Record<string, number> = { '0': 0, '1-2': 0, '3-6': 0, '7-13': 0, '14+': 0 }
  for (const row of data ?? []) {
    const streak = row.current_day_streak ?? 0
    const key = streak === 0 ? '0' : streak <= 2 ? '1-2' : streak <= 6 ? '3-6' : streak <= 13 ? '7-13' : '14+'
    buckets[key] += 1
  }

  return Object.entries(buckets).map(([streakRange, users]) => ({ streakRange, users }))
}

/** Distribution of season XP progress (% of the current season's max XP) across users. */
export async function fetchBattlePassProgress(): Promise<BattlePassProgress> {
  const { data: season, error: seasonError } = await supabase
    .from('seasons')
    .select('name, max_xp')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (seasonError) throw seasonError

  const maxXp = season?.max_xp ?? 500

  const { data: users, error: usersError } = await supabase.from('users').select('season_xp')
  if (usersError) throw usersError

  const buckets: Record<string, number> = { '0-25%': 0, '25-50%': 0, '50-75%': 0, '75-99%': 0, '100%': 0 }
  for (const row of users ?? []) {
    const pct = maxXp > 0 ? ((row.season_xp ?? 0) / maxXp) * 100 : 0
    const key = pct >= 100 ? '100%' : pct >= 75 ? '75-99%' : pct >= 50 ? '50-75%' : pct >= 25 ? '25-50%' : '0-25%'
    buckets[key] += 1
  }

  return {
    seasonName: season?.name ?? null,
    progressBuckets: Object.entries(buckets).map(([range, users]) => ({ range, users })),
  }
}
