import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { useSkillSummary } from '@/hooks/useGameplayMetrics'
import { formatNumber, formatPct } from '@/lib/utils'
import { Brain, Skull, Sparkles } from 'lucide-react'

export function GameplaySection() {
  const skill = useSkillSummary()

  if (skill.error) return <ErrorState error={skill.error} />

  const overallBustRate =
    skill.data && skill.data.byGameType.length > 0
      ? skill.data.byGameType.reduce((sum, g) => sum + g.bustRatePct * g.handsPlayed, 0) /
        Math.max(
          skill.data.byGameType.reduce((sum, g) => sum + g.handsPlayed, 0),
          1,
        )
      : null

  const totalHands = skill.data?.byGameType.reduce((sum, g) => sum + g.handsPlayed, 0) ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Précision stratégie de base"
          value={formatPct(skill.data?.basicStrategyAccuracyPct)}
          hint={skill.data ? `${formatNumber(skill.data.totalDecisions)} décisions analysées` : undefined}
          icon={Brain}
          loading={skill.isLoading}
        />
        <StatCard
          label="Mains jouées (total)"
          value={formatNumber(totalHands)}
          icon={Sparkles}
          loading={skill.isLoading}
        />
        <StatCard
          label="Taux de bust moyen"
          value={formatPct(overallBustRate)}
          icon={Skull}
          loading={skill.isLoading}
        />
      </div>

      <Card>
        <CardHeader title="Performance par mode de jeu" subtitle="Source : Supabase (game_stats)" />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skill.data?.byGameType ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="gameType" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip formatter={(value) => formatPct(Number(value))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="winRatePct" name="Victoires" fill="#B5F3C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bustRatePct" name="Bust" fill="#ff9cb5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="blackjackRatePct" name="Blackjacks" fill="#F8CA5A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
