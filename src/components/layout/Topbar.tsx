import { SegmentToggle } from '@/components/ui/SegmentToggle'

export function Topbar({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-black px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
      <SegmentToggle />
    </header>
  )
}
