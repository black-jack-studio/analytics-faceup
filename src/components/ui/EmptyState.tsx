import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card className="flex flex-col items-center gap-2 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-[#F8CA5A]" />
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="max-w-md text-xs text-white/50">{message}</p>
    </Card>
  )
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Erreur inconnue.'
  return (
    <Card className="flex flex-col items-center gap-2 border-rose-500/20 bg-rose-500/5 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-[#ff9cb5]" />
      <p className="text-sm font-medium text-rose-200">Erreur de chargement</p>
      <p className="max-w-md text-xs text-rose-300/80">{message}</p>
    </Card>
  )
}
