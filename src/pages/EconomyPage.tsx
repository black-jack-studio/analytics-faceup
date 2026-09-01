import { EconomySection } from '@/components/dashboard/EconomySection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function EconomyPage() {
  return (
    <DashboardLayout title="Économie & Monétisation" description="Coins, gems, publicités et churn des abonnements">
      <EconomySection />
    </DashboardLayout>
  )
}
