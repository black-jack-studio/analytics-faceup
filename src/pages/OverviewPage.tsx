import { OverviewSection } from '@/components/dashboard/OverviewSection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function OverviewPage() {
  return (
    <DashboardLayout title="Vue d'ensemble" description="Utilisateurs, activation et monétisation en un coup d'œil">
      <OverviewSection />
    </DashboardLayout>
  )
}
