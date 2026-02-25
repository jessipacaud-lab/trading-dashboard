import { cn } from '@/lib/utils'

interface ConvictionBarProps {
  value:      number   // 0–10 (briefing) or 0–100 (scoring)
  max?:       number   // default 10
  className?: string
  showLabel?: boolean
}

export function ConvictionBar({ value, max = 10, className, showLabel = false }: ConvictionBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const barColor =
    pct >= 65 ? '#00e5a0' :
    pct >= 35 ? '#f59e0b' :
    '#ff4d6a'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1 bg-surface-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
      {showLabel && (
        <span className="text-[9px] font-semibold flex-shrink-0" style={{ color: barColor }}>
          {value}/{max}
        </span>
      )}
    </div>
  )
}
