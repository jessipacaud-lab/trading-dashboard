import { cn } from '@/lib/utils'
import type { BiasType } from '@/lib/types'

interface BiasBadgeProps {
  bias:      BiasType
  size?:     'sm' | 'md'
  className?: string
}

const styles: Record<BiasType, string> = {
  bullish:  'bg-[#00e5a018] text-[#00e5a0] border border-[#00e5a033]',
  bearish:  'bg-[#ff4d6a18] text-[#ff4d6a] border border-[#ff4d6a33]',
  range:    'bg-[#f59e0b18] text-[#f59e0b] border border-[#f59e0b33]',
  volatile: 'bg-[#a855f718] text-[#a855f7] border border-[#a855f733]',
  neutral:  'bg-white/5     text-gray-500  border border-white/10',
}

const labels: Record<BiasType, string> = {
  bullish:  '▲ BULLISH',
  bearish:  '▼ BEARISH',
  range:    '↔ RANGE',
  volatile: '⚡ VOLATILE',
  neutral:  '— NEUTRE',
}

export function BiasBadge({ bias, size = 'sm', className }: BiasBadgeProps) {
  return (
    <span className={cn(
      'rounded font-medium tracking-wide',
      size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1',
      styles[bias],
      className
    )}>
      {labels[bias]}
    </span>
  )
}
