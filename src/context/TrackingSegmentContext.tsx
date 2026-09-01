import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { TrackingSegment } from '@/types/domain'

interface TrackingSegmentContextValue {
  segment: TrackingSegment
  setSegment: (segment: TrackingSegment) => void
}

const TrackingSegmentContext = createContext<TrackingSegmentContextValue | null>(null)

/**
 * Global compliance filter: which population Supabase-backed sections should
 * report on. "tracked" = users who gave tracking consent (comparable to
 * PostHog data), "anonymous" = consent-denied users, visible only through
 * first-party Supabase data. Behavioral (PostHog) sections are implicitly
 * "tracked" only — PostHog never sees anonymous users by definition.
 */
export function TrackingSegmentProvider({ children }: { children: ReactNode }) {
  const [segment, setSegment] = useState<TrackingSegment>('all')
  const value = useMemo(() => ({ segment, setSegment }), [segment])
  return <TrackingSegmentContext.Provider value={value}>{children}</TrackingSegmentContext.Provider>
}

export function useTrackingSegment() {
  const ctx = useContext(TrackingSegmentContext)
  if (!ctx) throw new Error('useTrackingSegment must be used within a TrackingSegmentProvider')
  return ctx
}
