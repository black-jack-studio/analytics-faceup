import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import {
  useBattlePassProgress,
  useLevelDistribution,
  useRetentionCohorts,
  useStreakDistribution,
} from '@/hooks/useProgressionMetrics'
import { formatPct } from '@/lib/utils'

export function RetentionSection() {
  const cohorts = useRetentionCohorts()
  const levels = useLevelDistribution()
  const streaks = useStreakDistribution()
  const battlePass = useBattlePassProgress()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="Rétention par cohorte d'inscription"
          subtitle="Source : Supabase (users) — proxy last_active_at, pas un vrai retour au jour N"
        />
        {cohorts.error ? (
          <ErrorState error={cohorts.error} />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohorts.data ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="cohortLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(value) => formatPct(Number(value))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="retainedD1Pct" name="D1" stroke="#8CCBFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="retainedD7Pct" name="D7" stroke="#B79CFF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="retainedD30Pct" name="D30" stroke="#F8CA5A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Distribution des niveaux" subtitle="Source : Supabase (users.level)" />
          {levels.error ? (
            <ErrorState error={levels.error} />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levels.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="levelRange" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8CCBFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Streaks quotidiens actifs" subtitle="Source : Supabase (users.current_day_streak)" />
          {streaks.error ? (
            <ErrorState error={streaks.error} />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={streaks.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="streakRange" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#B5F3C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Progression Battle Pass"
            subtitle={battlePass.data?.seasonName ? `Saison : ${battlePass.data.seasonName}` : 'Source : Supabase (seasons, users)'}
          />
          {battlePass.error ? (
            <ErrorState error={battlePass.error} />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={battlePass.data?.progressBuckets ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#F8CA5A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
