import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TrackingSegmentProvider } from '@/context/TrackingSegmentContext'
import { initPostHog } from '@/lib/posthog/client'
import { BehaviorPage } from '@/pages/BehaviorPage'
import { EconomyPage } from '@/pages/EconomyPage'
import { OverviewPage } from '@/pages/OverviewPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  useEffect(() => {
    initPostHog()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <TrackingSegmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/behavior" element={<BehaviorPage />} />
            <Route path="/economy" element={<EconomyPage />} />
          </Routes>
        </BrowserRouter>
      </TrackingSegmentProvider>
    </QueryClientProvider>
  )
}
