import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrackingSegmentProvider } from '@/context/TrackingSegmentContext'
import { BehaviorPage } from '@/pages/BehaviorPage'
import { EconomyPage } from '@/pages/EconomyPage'
import { GameplayPage } from '@/pages/GameplayPage'
import { GrowthPage } from '@/pages/GrowthPage'
import { LiveOpsPage } from '@/pages/LiveOpsPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { RetentionPage } from '@/pages/RetentionPage'
import { TrustSafetyPage } from '@/pages/TrustSafetyPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TrackingSegmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/behavior" element={<BehaviorPage />} />
            <Route path="/economy" element={<EconomyPage />} />
            <Route path="/gameplay" element={<GameplayPage />} />
            <Route path="/retention" element={<RetentionPage />} />
            <Route path="/growth" element={<GrowthPage />} />
            <Route path="/trust-safety" element={<TrustSafetyPage />} />
            <Route path="/live-ops" element={<LiveOpsPage />} />
          </Routes>
        </BrowserRouter>
      </TrackingSegmentProvider>
    </QueryClientProvider>
  )
}
