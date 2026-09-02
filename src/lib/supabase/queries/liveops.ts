import { supabase } from '@/lib/supabase/client'
import type { LiveOpsSummary } from '@/types/domain'

export async function fetchLiveOpsSummary(): Promise<LiveOpsSummary> {
  const [
    { count: activeGamesInProgress, error: activeError },
    { data: tables, error: tablesError },
    { data: invites, error: invitesError },
  ] = await Promise.all([
    supabase.from('active_games').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('game_tables').select('status'),
    supabase.from('table_invites').select('status'),
  ])

  const error = activeError ?? tablesError ?? invitesError
  if (error) throw error

  const statusCounts = new Map<string, number>()
  for (const row of tables ?? []) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1)
  }

  const inviteCounts = new Map<string, number>()
  for (const row of invites ?? []) {
    inviteCounts.set(row.status, (inviteCounts.get(row.status) ?? 0) + 1)
  }
  const accepted = inviteCounts.get('accepted') ?? 0
  const declined = inviteCounts.get('declined') ?? 0
  const expired = inviteCounts.get('expired') ?? 0
  const decided = accepted + declined + expired

  return {
    activeGamesInProgress: activeGamesInProgress ?? 0,
    tablesByStatus: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
    inviteAcceptancePct: decided > 0 ? (accepted / decided) * 100 : null,
  }
}
