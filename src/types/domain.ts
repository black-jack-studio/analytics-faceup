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

// --- Gameplay & skill ---

export interface GameTypeStats {
  gameType: string
  handsPlayed: number
  winRatePct: number
  bustRatePct: number
  blackjackRatePct: number
}

export interface SkillSummary {
  basicStrategyAccuracyPct: number | null
  totalDecisions: number
  byGameType: GameTypeStats[]
}

// --- Progression & retention ---

export interface RetentionCohort {
  cohortLabel: string
  signupCount: number
  retainedD1Pct: number
  retainedD7Pct: number
  retainedD30Pct: number
}

export interface LevelBucket {
  levelRange: string
  users: number
}

export interface StreakBucket {
  streakRange: string
  users: number
}

export interface BattlePassProgress {
  seasonName: string | null
  progressBuckets: { range: string; users: number }[]
}

// --- Monetization detail ---

export interface GemSpendByItemType {
  itemType: string
  purchases: number
  gemsSpent: number
}

export interface WhaleUser {
  userId: string
  username: string
  selectedAvatarId: string | null
  totalGemsSpent: number
  purchaseCount: number
}

export interface ConversionCohort {
  cohortLabel: string
  signupCount: number
  premiumCount: number
  conversionPct: number
}

// --- Growth & virality ---

export interface ReferralFunnel {
  usersWithReferrals: number
  totalReferredUsers: number
  referredUsersConvertedPremiumPct: number
}

export interface LeaderboardParticipation {
  name: string
  participants: number
  participationPct: number
}

// --- Trust & safety ---

export interface ReportReasonBreakdown {
  reason: string
  count: number
}

export interface TrustSafetySummary {
  reportsLast30d: number
  blocksLast30d: number
  topReasons: ReportReasonBreakdown[]
}

// --- Live ops ---

export interface TableStatusBreakdown {
  status: string
  count: number
}

export interface LiveOpsSummary {
  activeGamesInProgress: number
  tablesByStatus: TableStatusBreakdown[]
  inviteAcceptancePct: number | null
}
