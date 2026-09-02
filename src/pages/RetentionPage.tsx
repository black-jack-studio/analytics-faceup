import { RetentionSection } from '@/components/dashboard/RetentionSection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function RetentionPage() {
  return (
    <DashboardLayout
      title="Progression & Rétention"
      description="Cohortes de rétention, niveaux, streaks et Battle Pass"
    >
      <RetentionSection />
    </DashboardLayout>
  )
}
