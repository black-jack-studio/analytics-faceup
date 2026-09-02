import { TrustSafetySection } from '@/components/dashboard/TrustSafetySection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function TrustSafetyPage() {
  return (
    <DashboardLayout title="Trust & Safety" description="Signalements et blocages entre joueurs">
      <TrustSafetySection />
    </DashboardLayout>
  )
}
