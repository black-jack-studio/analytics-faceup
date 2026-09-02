import { LiveOpsSection } from '@/components/dashboard/LiveOpsSection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function LiveOpsPage() {
  return (
    <DashboardLayout title="Live Ops" description="Parties et tables en direct, invitations entre amis">
      <LiveOpsSection />
    </DashboardLayout>
  )
}
