import { useTrackingSegment } from '@/context/TrackingSegmentContext'
import { cn } from '@/lib/utils'
import type { TrackingSegment } from '@/types/domain'

const OPTIONS: { value: TrackingSegment; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'tracked', label: 'Trackés' },
  { value: 'anonymous', label: 'Anonymes' },
]

export function SegmentToggle() {
  const { segment, setSegment } = useTrackingSegment()

  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-[#111214] p-0.5">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setSegment(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            segment === option.value ? 'bg-[#B79CFF] text-black' : 'text-white/50 hover:text-white',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
