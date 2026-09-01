import { getAvatarById } from '@/lib/avatars'
import { cn } from '@/lib/utils'

export function UserAvatar({
  selectedAvatarId,
  size = 32,
  className,
}: {
  selectedAvatarId?: string | null
  size?: number
  className?: string
}) {
  const avatar = getAvatarById(selectedAvatarId)
  return (
    <img
      src={avatar.image}
      alt={avatar.name}
      width={size}
      height={size}
      className={cn('shrink-0 rounded-full bg-white/5 object-cover ring-1 ring-white/10', className)}
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}
