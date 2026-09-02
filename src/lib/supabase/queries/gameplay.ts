import { supabase } from '@/lib/supabase/client'
import type { GameTypeStats, SkillSummary } from '@/types/domain'

/**
 * Aggregates faceup-server's `game_stats` (one row per user per game_type, running lifetime
 * totals) client-side. Fine at current scale — if this table grows large, replace with a
 * Postgres view/RPC that does the SUM/GROUP BY server-side instead.
 */
export async function fetchSkillSummary(): Promise<SkillSummary> {
  const { data, error } = await supabase
    .from('game_stats')
    .select('game_type, hands_played, hands_won, busts, blackjacks, correct_decisions, total_decisions')

  if (error) throw error

  const rows = data ?? []

  let totalCorrect = 0
  let totalDecisions = 0
  const byType = new Map<string, { handsPlayed: number; won: number; busts: number; blackjacks: number }>()

  for (const row of rows) {
    totalCorrect += row.correct_decisions ?? 0
    totalDecisions += row.total_decisions ?? 0

    const bucket = byType.get(row.game_type) ?? { handsPlayed: 0, won: 0, busts: 0, blackjacks: 0 }
    bucket.handsPlayed += row.hands_played ?? 0
    bucket.won += row.hands_won ?? 0
    bucket.busts += row.busts ?? 0
    bucket.blackjacks += row.blackjacks ?? 0
    byType.set(row.game_type, bucket)
  }

  const byGameType: GameTypeStats[] = [...byType.entries()].map(([gameType, s]) => ({
    gameType,
    handsPlayed: s.handsPlayed,
    winRatePct: s.handsPlayed > 0 ? (s.won / s.handsPlayed) * 100 : 0,
    bustRatePct: s.handsPlayed > 0 ? (s.busts / s.handsPlayed) * 100 : 0,
    blackjackRatePct: s.handsPlayed > 0 ? (s.blackjacks / s.handsPlayed) * 100 : 0,
  }))

  return {
    basicStrategyAccuracyPct: totalDecisions > 0 ? (totalCorrect / totalDecisions) * 100 : null,
    totalDecisions,
    byGameType,
  }
}
