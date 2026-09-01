import { LayoutDashboard, MousePointerClick, Coins, Shield } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', label: "Vue d'ensemble", icon: LayoutDashboard, end: true },
  { to: '/behavior', label: 'Comportement & Funnels', icon: MousePointerClick, end: false },
  { to: '/economy', label: 'Économie & Monétisation', icon: Coins, end: false },
] as const

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-white/10 bg-black px-3 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#B79CFF] to-[#8CCBFF] text-sm font-bold text-black">
          FU
        </div>
        <div>
          <p className="text-sm font-semibold text-white">FaceUp</p>
          <p className="text-[11px] text-white/40">Analytics Dashboard</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-[#B79CFF]/10 text-[#B79CFF]' : 'text-white/60 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-[11px] text-white/40">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        Lecture seule · RGPD
      </div>
    </aside>
  )
}
