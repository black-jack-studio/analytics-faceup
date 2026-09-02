import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { useTrustSafetySummary } from '@/hooks/useTrustSafetyMetrics'
import { formatNumber } from '@/lib/utils'
import { Flag, ShieldOff } from 'lucide-react'

export function TrustSafetySection() {
  const summary = useTrustSafetySummary()

  if (summary.error) return <ErrorState error={summary.error} />

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Signalements (30j)"
          value={formatNumber(summary.data?.reportsLast30d)}
          icon={Flag}
          loading={summary.isLoading}
        />
        <StatCard
          label="Blocages (30j)"
          value={formatNumber(summary.data?.blocksLast30d)}
          icon={ShieldOff}
          loading={summary.isLoading}
        />
      </div>

      <Card>
        <CardHeader title="Principales raisons de signalement" subtitle="Source : Supabase (user_reports), 30 derniers jours" />
        <div className="flex flex-col gap-2">
          {(summary.data?.topReasons ?? []).map((r) => (
            <div key={r.reason} className="flex items-center justify-between text-sm">
              <span className="text-white/60">{r.reason}</span>
              <span className="font-medium text-white">{formatNumber(r.count)}</span>
            </div>
          ))}
          {summary.data && summary.data.topReasons.length === 0 && (
            <p className="text-sm text-white/40">Aucun signalement sur la période.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
