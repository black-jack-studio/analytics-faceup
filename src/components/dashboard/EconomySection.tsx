import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/EmptyState'
import { StatCard } from '@/components/ui/StatCard'
import { UserAvatar } from '@/components/ui/UserAvatar'
import {
  useAdImpact,
  useChurnSummary,
  useConversionCohorts,
  useEconomyFlows,
  useGemSpendByItemType,
  useQuitAfterAllIn,
  useWhales,
} from '@/hooks/useEconomyMetrics'
import { formatNumber, formatPct } from '@/lib/utils'
import { Coins, Crown, Gem, TrendingDown, Tv } from 'lucide-react'

export function EconomySection() {
  const flows = useEconomyFlows()
  const adImpact = useAdImpact()
  const churn = useChurnSummary()
  const quitAfterAllIn = useQuitAfterAllIn()
  const gemSpend = useGemSpendByItemType()
  const whales = useWhales()
  const conversion = useConversionCohorts()

  const coins = flows.data?.find((f) => f.currency === 'coins')
  const gems = flows.data?.find((f) => f.currency === 'gems')

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Coins en circulation (stock total)"
          value={coins ? formatNumber(coins.net) : '—'}
          hint="Pas de ledger coins — somme des soldes users.coins"
          icon={Coins}
          loading={flows.isLoading}
        />
        <StatCard
          label="Gems en circulation (net, 30j)"
          value={gems ? formatNumber(gems.net) : '—'}
          hint={gems ? `+${formatNumber(gems.credited)} / -${formatNumber(gems.debited)}` : undefined}
          icon={Gem}
          loading={flows.isLoading}
        />
        <StatCard
          label="Taux de churn (30j)"
          value={formatPct(churn.data?.churnRatePct)}
          hint={churn.data ? `${formatNumber(churn.data.canceledLast30d)} résiliations` : undefined}
          icon={TrendingDown}
          loading={churn.isLoading}
        />
        <StatCard
          label="Inactifs après une all-in streak"
          value={formatPct(quitAfterAllIn.data?.quitRatePct)}
          hint={
            quitAfterAllIn.data
              ? `${formatNumber(quitAfterAllIn.data.usersInactiveSinceStreak)} / ${formatNumber(quitAfterAllIn.data.usersOnAllInStreak)} joueurs`
              : undefined
          }
          icon={Tv}
          loading={quitAfterAllIn.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="All-in lose streak vs. rétention D7"
            subtitle="Proxy Supabase (pas de ledger pubs — voir funnel PostHog pour les vraies pubs vues)"
          />
          {adImpact.error ? (
            <ErrorState error={adImpact.error} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adImpact.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="adsWatchedBucket" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(value) => formatPct(Number(value))} />
                  <Bar dataKey="retainedD7Pct" name="Rétention D7" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Raisons de résiliation" subtitle="Source : Supabase (users.subscription_cancel_reason)" />
          {churn.error ? (
            <ErrorState error={churn.error} />
          ) : (
            <div className="flex flex-col gap-2">
              {(churn.data?.reasons ?? []).map((r) => (
                <div key={r.reason} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{r.reason}</span>
                  <span className="font-medium text-white">
                    {formatNumber(r.count)} ({formatPct(r.pct)})
                  </span>
                </div>
              ))}
              {churn.data && churn.data.reasons.length === 0 && (
                <p className="text-sm text-white/40">Aucune résiliation sur la période.</p>
              )}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Achats gemmes par type d'objet" subtitle="Source : Supabase (gem_purchases)" />
          {gemSpend.error ? (
            <ErrorState error={gemSpend.error} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gemSpend.data ?? []} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="itemType" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                  <Bar dataKey="gemsSpent" name="Gems dépensées" fill="#B79CFF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Conversion Premium par cohorte d'inscription" subtitle="Source : Supabase (users) — part premium actuelle par semaine d'inscription" />
          {conversion.error ? (
            <ErrorState error={conversion.error} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversion.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="cohortLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(value) => formatPct(Number(value))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="conversionPct" name="% Premium" stroke="#F8CA5A" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Top dépensiers (whales)" subtitle="Source : Supabase (gem_purchases) — top 10 par gems dépensées" />
        {whales.error ? (
          <ErrorState error={whales.error} />
        ) : (
          <div className="flex flex-col gap-1">
            {(whales.data ?? []).map((w, index) => (
              <div key={w.userId} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
                <span className="w-5 text-xs font-medium text-white/40">#{index + 1}</span>
                <UserAvatar selectedAvatarId={w.selectedAvatarId} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{w.username}</p>
                  <p className="text-xs text-white/40">{formatNumber(w.purchaseCount)} achats</p>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-[#F8CA5A]">
                  <Crown className="h-3.5 w-3.5" />
                  {formatNumber(w.totalGemsSpent)} gems
                </div>
              </div>
            ))}
            {whales.data && whales.data.length === 0 && (
              <p className="text-sm text-white/40">Aucun achat gemmes enregistré.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
