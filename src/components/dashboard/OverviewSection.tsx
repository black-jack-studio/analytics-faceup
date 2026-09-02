import { Clock, CreditCard, Users, UserCheck } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { usePlayerProfileModal } from '@/context/PlayerProfileContext'
import { useTrackingSegment } from '@/context/TrackingSegmentContext'
import { useAvgSessionMinutes, useOverviewMetrics, useRecentUsers } from '@/hooks/useOverviewMetrics'
import { formatNumber } from '@/lib/utils'
import type { RecentUser } from '@/lib/supabase/queries/users'

const PIE_COLORS = ['#4f46e5', '#c7d2fe']

export function OverviewSection() {
  const { segment } = useTrackingSegment()
  const { data, isLoading, error } = useOverviewMetrics(segment)
  const { data: avgSessionMinutes, isLoading: sessionLoading } = useAvgSessionMinutes()
  const recentUsers = useRecentUsers()
  const { openProfile } = usePlayerProfileModal()

  if (error) return <ErrorState error={error} />

  const planData = data
    ? [
        { name: 'Gratuit', value: data.free },
        { name: 'Premium', value: data.premium },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Utilisateurs inscrits"
          value={formatNumber(data?.total)}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          label="Actifs (30j)"
          value={formatNumber(data?.active)}
          hint={data ? `${formatNumber(data.inactive)} inactifs` : undefined}
          icon={UserCheck}
          loading={isLoading}
        />
        <StatCard
          label="Utilisateurs premium"
          value={formatNumber(data?.premium)}
          hint={data ? `${formatNumber(data.free)} gratuits` : undefined}
          icon={CreditCard}
          loading={isLoading}
        />
        <StatCard
          label="Durée moyenne de session"
          value={avgSessionMinutes != null ? `${avgSessionMinutes.toFixed(1)} min` : '—'}
          hint="Source : PostHog"
          icon={Clock}
          loading={sessionLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Répartition Gratuit vs Premium" subtitle="Source : Supabase (users)" />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {planData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Derniers utilisateurs inscrits" subtitle="Source : Supabase (users)" />
          {recentUsers.error ? (
            <ErrorState error={recentUsers.error} />
          ) : (
            <div className="flex flex-col gap-1">
              {(recentUsers.isLoading
                ? Array.from({ length: 5 }, () => undefined)
                : recentUsers.data ?? []
              ).map((user: RecentUser | undefined, index) => {
                const u = user
                return (
                  <button
                    type="button"
                    key={u?.id ?? index}
                    onClick={() => u && openProfile(u.id)}
                    disabled={!u}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-white/5 disabled:cursor-default"
                  >
                    <UserAvatar selectedAvatarId={u?.selectedAvatarId} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {u?.username ?? '...'}
                      </p>
                      <p className="text-xs text-white/40">
                        {u ? `${formatNumber(u.coins)} coins · ${formatNumber(u.gems)} gems` : ''}
                      </p>
                    </div>
                    {u?.membershipType === 'premium' && (
                      <span className="rounded-full bg-[#B79CFF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#B79CFF]">
                        PREMIUM
                      </span>
                    )}
                  </button>
                )
              })}
              {recentUsers.data && recentUsers.data.length === 0 && (
                <p className="text-sm text-white/40">Aucun utilisateur.</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
