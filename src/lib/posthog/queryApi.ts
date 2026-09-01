/**
 * Thin wrapper around PostHog's Query API (HogQL).
 *
 * SECURITY: a personal API key can read/write across the whole PostHog
 * project. Calling the API directly from the browser (as this scaffold does
 * for simplicity) ships that key in the client bundle — fine for a local
 * prototype behind auth you control, unacceptable for a public deployment.
 * Before shipping, replace `postHogFetch` with a call to your own backend
 * route (e.g. `/api/posthog-query`) that holds the key server-side and
 * forwards the HogQL string. Nothing else in this file needs to change.
 */

// The Query API lives on the app host (e.g. eu.posthog.com), not the ingestion-only host
// used for capture (eu.i.posthog.com, VITE_POSTHOG_HOST) — they're different subdomains on
// PostHog Cloud. Falls back to deriving it from VITE_POSTHOG_HOST if VITE_POSTHOG_API_HOST
// isn't set, by stripping the capture subdomain's leading "i.".
const explicitApiHost = import.meta.env.VITE_POSTHOG_API_HOST
const captureHost = import.meta.env.VITE_POSTHOG_HOST
const host = explicitApiHost || captureHost?.replace('://eu.i.', '://eu.').replace('://us.i.', '://us.')
const projectId = import.meta.env.VITE_POSTHOG_PROJECT_ID
const personalApiKey = import.meta.env.VITE_POSTHOG_PERSONAL_API_KEY

export const isPostHogQueryConfigured = Boolean(host && projectId && personalApiKey)

export interface HogQLResult<Row extends unknown[] = unknown[]> {
  columns: string[]
  results: Row[]
}

export async function runHogQLQuery<Row extends unknown[] = unknown[]>(
  hogql: string,
): Promise<HogQLResult<Row>> {
  if (!isPostHogQueryConfigured) {
    throw new Error(
      'PostHog query API not configured. Set VITE_POSTHOG_HOST (or VITE_POSTHOG_API_HOST), ' +
        'VITE_POSTHOG_PROJECT_ID, VITE_POSTHOG_PERSONAL_API_KEY in .env.local.',
    )
  }

  const response = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${personalApiKey}`,
    },
    body: JSON.stringify({
      query: { kind: 'HogQLQuery', query: hogql },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`PostHog query failed (${response.status}): ${body}`)
  }

  const json = await response.json()
  return { columns: json.columns ?? [], results: json.results ?? [] }
}
