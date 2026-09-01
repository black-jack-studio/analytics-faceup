import { BehaviorSection } from '@/components/dashboard/BehaviorSection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function BehaviorPage() {
  return (
    <DashboardLayout
      title="Comportement & Funnels"
      description="Consentement ATT, zones chaudes et fuite après un mauvais évènement de jeu"
    >
      <BehaviorSection />
    </DashboardLayout>
  )
}
