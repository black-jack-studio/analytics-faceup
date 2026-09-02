import { Coins, Flame, Gem, Star, Users, X } from 'lucide-react'
import { ErrorState } from '@/components/ui/EmptyState'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { usePlayerProfileData } from '@/hooks/usePlayerProfile'
import { formatNumber, formatPct } from '@/lib/utils'

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Coins; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-white/40" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-wide text-white/40">{label}</p>
      </div>
    </div>
  )
}

export function PlayerProfileModal({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const profile = usePlayerProfileData(userId)

  if (!userId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#111214] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-sm font-semibold text-white">Profil joueur</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {profile.error ? (
          <ErrorState error={profile.error} />
        ) : profile.isLoading || !profile.data ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
              <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <UserAvatar selectedAvatarId={profile.data.selectedAvatarId} size={56} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white">{profile.data.username}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {profile.data.membershipType === 'premium' && (
                    <span className="rounded-full bg-[#B79CFF]/10 px-2 py-0.5 text-[10px] font-semibold text-[#B79CFF]">
                      PREMIUM
                    </span>
                  )}
                  {profile.data.level != null && (
                    <span className="text-xs text-white/50">Niveau {profile.data.level}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <MiniStat icon={Coins} label="Coins" value={formatNumber(profile.data.coins)} />
              <MiniStat icon={Gem} label="Gems" value={formatNumber(profile.data.gems)} />
              <MiniStat icon={Flame} label="Streak" value={`${formatNumber(profile.data.currentDayStreak)} j`} />
              <MiniStat icon={Star} label="XP saison" value={formatNumber(profile.data.seasonXp)} />
              <MiniStat icon={Users} label="Parrainages" value={formatNumber(profile.data.referralCount)} />
              <MiniStat
                icon={Star}
                label="Précision stratégie"
                value={formatPct(profile.data.basicStrategyAccuracyPct)}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-white/40">
              <span>Inscrit le {formatDate(profile.data.createdAt)}</span>
              <span>Actif le {formatDate(profile.data.lastActiveAt)}</span>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
                Stats par jeu · {formatNumber(profile.data.totalHandsPlayed)} mains ·{' '}
                {formatPct(profile.data.overallWinRatePct)} de victoires
              </p>
              {profile.data.byGameType.length === 0 ? (
                <p className="text-sm text-white/40">Aucune partie enregistrée.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {profile.data.byGameType.map((g) => (
                    <div
                      key={g.gameType}
                      className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-white">{g.gameType}</span>
                      <div className="flex items-center gap-3 text-xs text-white/50">
                        <span>{formatNumber(g.handsPlayed)} mains</span>
                        <span className="font-semibold text-[#B5F3C7]">{formatPct(g.winRatePct)} gagnées</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
