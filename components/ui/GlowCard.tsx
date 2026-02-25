import { cn } from '@/lib/utils'
import type { GlowVariant } from '@/lib/types'

interface GlowCardProps {
  children:  React.ReactNode
  className?: string
  variant?:  GlowVariant
  hover?:    boolean
}

const variantStyles: Record<GlowVariant, string> = {
  cyan:   'shadow-glow-cyan border-[#00c8ff33]',
  green:  'shadow-glow-green border-[#00e5a033]',
  red:    'shadow-glow-red border-[#ff4d6a33]',
  purple: 'shadow-glow-purple border-[#a855f733]',
  amber:  'shadow-glow-amber border-[#f59e0b33]',
  none:   'border-white/5',
}

export function GlowCard({ children, className, variant = 'none', hover = true }: GlowCardProps) {
  return (
    <div className={cn(
      'bg-surface-800 border rounded-xl overflow-hidden',
      variantStyles[variant],
      hover && 'transition-all duration-200 hover:border-[#00c8ff33] hover:shadow-glow-cyan',
      className
    )}>
      {children}
    </div>
  )
}
