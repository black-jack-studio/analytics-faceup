import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { useLiveOpsSummary } from '@/hooks/useLiveOpsMetrics'
import { formatNumber, formatPct } from '@/lib/utils'
import { Gamepad2, Percent, Table2 } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  waiting: '#8CCBFF',
  betting: '#F8CA5A',
  in_progress: '#B5F3C7',
  closed: '#6b7280',
}

export function LiveOpsSection() {
  const liveOps = useLiveOpsSummary()

  if (liveOps.error) return <ErrorState error={liveOps.error} />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Parties en cours"
          value={formatNumber(liveOps.data?.activeGamesInProgress)}
          hint="Solo (active_games)"
          icon={Gamepad2}
          loading={liveOps.isLoading}
        />
        <StatCard
          label="Tables entre amis (total)"
          value={formatNumber(liveOps.data?.tablesByStatus.reduce((sum, s) => sum + s.count, 0))}
          icon={Table2}
          loading={liveOps.isLoading}
        />
        <StatCard
          label="Taux d'acceptation des invitations"
          value={formatPct(liveOps.data?.inviteAcceptancePct)}
          icon={Percent}
          loading={liveOps.isLoading}
        />
      </div>

      <Card>
        <CardHeader title="Tables entre amis par statut" subtitle="Source : Supabase (game_tables)" />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={liveOps.data?.tablesByStatus ?? []}
                dataKey="count"
                nameKey="status"
                outerRadius={90}
                label
              >
                {(liveOps.data?.tablesByStatus ?? []).map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#8CCBFF'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
