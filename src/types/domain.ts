/** Compliance segmentation: which population a section's data represents. */
export type TrackingSegment = 'all' | 'tracked' | 'anonymous'

export interface OverviewMetrics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  freeUsers: number
  premiumUsers: number
  avgSessionMinutes: number | null
}

export interface AttConsentMetrics {
  accepted: number
  denied: number
  notDetermined: number
}

export interface ButtonClickStat {
  eventName: string
  label: string
  clicks: number
}

export interface FunnelStep {
  step: string
  count: number
  dropOffPct: number | null
}

export interface EconomyFlow {
  currency: 'coins' | 'gems'
  credited: number
  debited: number
  net: number
}

export interface AdImpactMetric {
  adsWatchedBucket: string
  users: number
  retainedD7Pct: number
}

export interface ChurnReasonBreakdown {
  reason: string
  count: number
  pct: number
}

export interface ChurnSummary {
  activeSubscriptions: number
  canceledLast30d: number
  churnRatePct: number
  reasons: ChurnReasonBreakdown[]
}
