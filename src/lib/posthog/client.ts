import posthog from 'posthog-js'

let initialized = false

/** Initializes posthog-js for client-side event capture (autocapture, pageviews). */
export function initPostHog() {
  if (initialized) return
  const key = import.meta.env.VITE_POSTHOG_KEY
  const host = import.meta.env.VITE_POSTHOG_HOST

  if (!key || !host) {
    // eslint-disable-next-line no-console
    console.warn('[posthog] VITE_POSTHOG_KEY / VITE_POSTHOG_HOST missing — capture disabled.')
    return
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    autocapture: true,
    person_profiles: 'identified_only',
  })
  initialized = true
}

export { posthog }
