import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { useLeaderboardParticipation, useReferralFunnel } from '@/hooks/useGrowthMetrics'
import { formatNumber, formatPct } from '@/lib/utils'
import { Trophy, UserPlus, Users2 } from 'lucide-react'

export function GrowthSection() {
  const referrals = useReferralFunnel()
  const leaderboards = useLeaderboardParticipation()

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Parraineurs actifs"
          value={formatNumber(referrals.data?.usersWithReferrals)}
          hint="Utilisateurs avec au moins 1 filleul"
          icon={UserPlus}
          loading={referrals.isLoading}
        />
        <StatCard
          label="Utilisateurs parrainés"
          value={formatNumber(referrals.data?.totalReferredUsers)}
          icon={Users2}
          loading={referrals.isLoading}
        />
        <StatCard
          label="Conversion Premium des filleuls"
          value={formatPct(referrals.data?.referredUsersConvertedPremiumPct)}
          icon={Trophy}
          loading={referrals.isLoading}
        />
      </div>

      <Card>
        <CardHeader
          title="Participation aux classements"
          subtitle="Source : Supabase (classic_streak_leaderboard, weekly_xp_leaderboard) — semaine en cours"
        />
        {leaderboards.error ? (
          <ErrorState error={leaderboards.error} />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderboards.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(value) => formatPct(Number(value))} />
                <Bar dataKey="participationPct" name="% des utilisateurs" fill="#8CCBFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  )
}
