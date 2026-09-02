import { GrowthSection } from '@/components/dashboard/GrowthSection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function GrowthPage() {
  return (
    <DashboardLayout title="Croissance & Parrainage" description="Funnel de parrainage et participation aux classements">
      <GrowthSection />
    </DashboardLayout>
  )
}
