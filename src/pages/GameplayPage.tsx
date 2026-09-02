import { GameplaySection } from '@/components/dashboard/GameplaySection'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export function GameplayPage() {
  return (
    <DashboardLayout title="Gameplay & Compétence" description="Précision de jeu, taux de victoire/bust par mode">
      <GameplaySection />
    </DashboardLayout>
  )
}
