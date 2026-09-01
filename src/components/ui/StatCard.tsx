import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  icon?: LucideIcon
  hint?: string
  trend?: { value: string; positive: boolean }
  loading?: boolean
}

export function StatCard({ label, value, icon: Icon, hint, trend, loading }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-white/50">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-white/40" />}
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">
        {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-white/10" /> : value}
      </p>
      {(hint || trend) && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          {trend && (
            <span className={cn('font-medium', trend.positive ? 'text-[#B5F3C7]' : 'text-[#ff9cb5]')}>
              {trend.value}
            </span>
          )}
          {hint && <span className="text-white/40">{hint}</span>}
        </div>
      )}
    </Card>
  )
}
