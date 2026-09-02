import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { useAllInLossFunnel, useAttConsent, useButtonClickStats, useConsecutiveLossFunnel } from '@/hooks/useBehaviorMetrics'
import { isPostHogQueryConfigured } from '@/lib/posthog/queryApi'
import { formatNumber, formatPct } from '@/lib/utils'
import type { FunnelStep } from '@/types/domain'

const CONSENT_COLORS = ['#16a34a', '#dc2626', '#94a3b8']

function FunnelCard({ title, steps, isLoading, error }: { title: string; steps?: FunnelStep[]; isLoading: boolean; error: unknown }) {
  return (
    <Card>
      <CardHeader title={title} subtitle="Source : PostHog (HogQL)" />
      {error ? (
        <ErrorState error={error} />
      ) : (
        <div className="flex flex-col gap-3">
          {(isLoading ? Array.from({ length: 3 }) : steps ?? []).map((step, index) => {
            const s = step as FunnelStep | undefined
            return (
              <div key={s?.step ?? index} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="text-sm text-white/70">{s?.step ?? '...'}</span>
                <div className="flex items-center gap-3">
                  {s?.dropOffPct != null && (
                    <span className="text-xs font-medium text-rose-600">-{formatPct(s.dropOffPct)}</span>
                  )}
                  <span className="text-sm font-semibold text-white">
                    {s ? formatNumber(s.count) : '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export function BehaviorSection() {
  const attConsent = useAttConsent()
  const buttonClicks = useButtonClickStats()
  const allInFunnel = useAllInLossFunnel()
  const consecutiveLossFunnel = useConsecutiveLossFunnel()

  if (!isPostHogQueryConfigured) {
    return (
      <EmptyState
        title="PostHog non configuré"
        message="Renseignez VITE_POSTHOG_HOST, VITE_POSTHOG_PROJECT_ID et VITE_POSTHOG_PERSONAL_API_KEY dans .env.local pour activer le tracking comportemental."
      />
    )
  }

  const consentData = attConsent.data
    ? [
        { name: 'Accepté', value: attConsent.data.accepted },
        { name: 'Refusé', value: attConsent.data.denied },
        { name: 'Non déterminé', value: attConsent.data.notDetermined },
      ]
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Consentement ATT" subtitle="Événement : att_consent_response" />
          {attConsent.error ? (
            <ErrorState error={attConsent.error} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={consentData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {consentData.map((entry, index) => (
                      <Cell key={entry.name} fill={CONSENT_COLORS[index % CONSENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatNumber(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Boutons les plus cliqués" subtitle="Autocapture PostHog, 30 derniers jours" />
          {buttonClicks.error ? (
            <ErrorState error={buttonClicks.error} />
          ) : (
            <div className="h-64 overflow-y-auto overflow-x-hidden pr-1">
              <div style={{ height: Math.max((buttonClicks.data?.length ?? 0) * 32, 256) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buttonClicks.data ?? []} layout="vertical" margin={{ left: 24, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 11 }} interval={0} />
                    <Tooltip formatter={(value) => formatNumber(Number(value))} />
                    <Bar dataKey="clicks" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelCard
          title="Fuite après un All-in perdu"
          steps={allInFunnel.data}
          isLoading={allInFunnel.isLoading}
          error={allInFunnel.error}
        />
        <FunnelCard
          title="Fuite après défaites consécutives"
          steps={consecutiveLossFunnel.data}
          isLoading={consecutiveLossFunnel.isLoading}
          error={consecutiveLossFunnel.error}
        />
      </div>
    </div>
  )
}
