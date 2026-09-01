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

/** Average session length in minutes, using PostHog's built-in session model. */
export async function fetchAvgSessionMinutes(): Promise<number | null> {
  const { results } = await runHogQLQuery<[number | null]>(`
    SELECT avg(session.duration) / 60
    FROM events
    WHERE timestamp >= now() - INTERVAL ${LOOKBACK_DAYS} DAY
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

/** Most/least clicked elements app-wide, from PostHog autocapture. */
export async function fetchButtonClickStats(limit = 20): Promise<ButtonClickStat[]> {
  const { results } = await runHogQLQuery<[string, string, number]>(`
    SELECT event, coalesce(properties.$el_text, elements_chain) AS label, count() AS clicks
    FROM events
    WHERE event = '$autocapture'
      AND timestamp >= now() - INTERVAL ${LOOKBACK_DAYS} DAY
    GROUP BY event, label
    ORDER BY clicks DESC
    LIMIT ${limit}
  `)

  return results.map(([eventName, label, clicks]) => ({ eventName, label, clicks }))
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
