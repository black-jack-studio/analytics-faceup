import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { PlayerProfileModal } from '@/components/dashboard/PlayerProfileModal'

interface PlayerProfileContextValue {
  openProfile: (userId: string) => void
}

const PlayerProfileContext = createContext<PlayerProfileContextValue | null>(null)

/** Mounts a single shared player-profile modal, openable from any player row on any page. */
export function PlayerProfileProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const value = useMemo(() => ({ openProfile: setUserId }), [])

  return (
    <PlayerProfileContext.Provider value={value}>
      {children}
      <PlayerProfileModal userId={userId} onClose={() => setUserId(null)} />
    </PlayerProfileContext.Provider>
  )
}

export function usePlayerProfileModal() {
  const ctx = useContext(PlayerProfileContext)
  if (!ctx) throw new Error('usePlayerProfileModal must be used within a PlayerProfileProvider')
  return ctx
}
