import { runHogQLQuery } from '@/lib/posthog/queryApi'
import type { AttConsentMetrics, ButtonClickStat, FunnelStep } from '@/types/domain'

/**
 * Event/property names assumed by the queries below. Adjust these to match
 * whatever your app actually sends via posthog-js / posthog-react-native —
 * every function in this file reads from this single config object.
 */
export const POSTHOG_EVENTS = {
  attConsent: 'att_consent_response',
  attStatusProp: 'status', // 'authorized' | 'denied' | 'not_determined'
  allInLoss: 'game_all_in_loss',
  consecutiveLoss: 'game_consecutive_loss',
  sessionStart: 'session_start',
  accountDeleted: 'account_deleted',
  appBackgrounded: 'app_backgrounded',
} as const

const LOOKBACK_DAYS = 30

// The dashboard itself briefly sent autocapture/pageview events into this same
// PostHog project (fixed since). Exclude its host from any query that isn't
// already scoped to a game-specific event name, so old polluted rows don't
// leak into the numbers.
const DASHBOARD_HOST = 'analytics-faceup.vercel.app'
const EXCLUDE_DASHBOARD_HOST = `(properties.$host IS NULL OR properties.$host NOT LIKE '%${DASHBOARD_HOST}%')`

/** Average session length in minutes, using PostHog's built-in session model. */
export async function fetchAvgSessionMinutes(): Promise<number | null> {
  const { results } = await runHogQLQuery<[number | null]>(`
    SELECT avg(session.duration) / 60
    FROM events
    WHERE timestamp >= now() - INTERVAL ${LOOKBACK_DAYS} DAY
      AND ${EXCLUDE_DASHBOARD_HOST}
  `)
  return results[0]?.[0] ?? null
}

export async function fetchAttConsentMetrics(): Promise<AttConsentMetrics> {
  const { results } = await runHogQLQuery<[string, number]>(`
    SELECT properties.${POSTHOG_EVENTS.attStatusProp} AS status, count() AS total
    FROM events
    WHERE event = '${POSTHOG_EVENTS.attConsent}'
      AND timestamp >= now() - INTERVAL ${LOOKBACK_DAYS} DAY
    GROUP BY status
  `)

  const byStatus = new Map(results.map(([status, total]) => [status, total]))
  return {
    accepted: byStatus.get('authorized') ?? 0,
    denied: byStatus.get('denied') ?? 0,
    notDetermined: byStatus.get('not_determined') ?? 0,
  }
}

/**
 * Turns a raw PostHog `elements_chain` (a semicolon-separated CSS-selector-like blob,
 * e.g. `a.btn:attr__href="/x"nth-child="2"text="Play Now";div.container:...`) into a short
 * human-readable label. Falls back to plain text as-is when it isn't a chain at all.
 */
function cleanElementLabel(raw: string, maxLen = 50): string {
  if (!raw) return '(sans nom)'
  const looksLikeChain = raw.includes('attr__') || /;[a-zA-Z]/.test(raw)
  if (!looksLikeChain) return raw.length > maxLen ? `${raw.slice(0, maxLen - 1)}…` : raw

  const candidate =
    raw.match(/text="([^"]+)"/)?.[1] ??
    raw.match(/attr__aria-label="([^"]+)"/)?.[1] ??
    raw.match(/attr__id="([^"]+)"/)?.[1] ??
    raw.split(/[:;]/)[0]

  if (!candidate) return '(élément)'
  return candidate.length > maxLen ? `${candidate.slice(0, maxLen - 1)}…` : candidate
}

/** Most/least clicked elements app-wide, from PostHog autocapture. */
export async function fetchButtonClickStats(limit = 20): Promise<ButtonClickStat[]> {
  const { results } = await runHogQLQuery<[string, string, number]>(`
    SELECT event, coalesce(properties.$el_text, elements_chain) AS label, count() AS clicks
    FROM events
    WHERE event = '$autocapture'
      AND timestamp >= now() - INTERVAL ${LOOKBACK_DAYS} DAY
      AND ${EXCLUDE_DASHBOARD_HOST}
    GROUP BY event, label
    ORDER BY clicks DESC
    LIMIT ${limit * 3}
  `)

  const merged = new Map<string, { eventName: string; label: string; clicks: number }>()
  for (const [eventName, rawLabel, clicks] of results) {
    const label = cleanElementLabel(rawLabel)
    const key = `${eventName}::${label}`
    const existing = merged.get(key)
    if (existing) {
      existing.clicks += clicks
    } else {
      merged.set(key, { eventName, label, clicks })
    }
  }

  return [...merged.values()].sort((a, b) => b.clicks - a.clicks).slice(0, limit)
}

/**
 * Drop-off funnel after a given "bad outcome" event (e.g. losing an all-in,
 * N consecutive losses): how many of the users who hit that event went on to
 * start another session vs. never came back vs. deleted their account.
 */
export async function fetchDropOffFunnel(triggerEvent: string): Promise<FunnelStep[]> {
  const { results } = await runHogQLQuery<[string, number]>(`
    WITH triggered AS (
      SELECT person_id, max(timestamp) AS last_trigger_at
      FROM events
      WHERE event = '${triggerEvent}'
        AND timestamp >= now() - INTERVAL ${LOOKBACK_DAYS} DAY
      GROUP BY person_id
    ),
    returned AS (
      SELECT DISTINCT e.person_id
      FROM events e
      JOIN triggered t ON e.person_id = t.person_id
      WHERE e.event = '${POSTHOG_EVENTS.sessionStart}'
        AND e.timestamp > t.last_trigger_at
    ),
    deleted AS (
      SELECT DISTINCT e.person_id
      FROM events e
      JOIN triggered t ON e.person_id = t.person_id
      WHERE e.event = '${POSTHOG_EVENTS.accountDeleted}'
    )
    SELECT 'triggered' AS step, count() FROM triggered
    UNION ALL
    SELECT 'returned' AS step, count() FROM returned
    UNION ALL
    SELECT 'deleted_account' AS step, count() FROM deleted
  `)

  const byStep = new Map(results.map(([step, count]) => [step, count]))
  const triggeredCount = byStep.get('triggered') ?? 0
  const returnedCount = byStep.get('returned') ?? 0
  const deletedCount = byStep.get('deleted_account') ?? 0

  return [
    { step: `Événement: ${triggerEvent}`, count: triggeredCount, dropOffPct: null },
    {
      step: 'A relancé une session',
      count: returnedCount,
      dropOffPct: triggeredCount > 0 ? ((triggeredCount - returnedCount) / triggeredCount) * 100 : null,
    },
    {
      step: 'A supprimé son compte',
      count: deletedCount,
      dropOffPct: triggeredCount > 0 ? (deletedCount / triggeredCount) * 100 : null,
    },
  ]
}
