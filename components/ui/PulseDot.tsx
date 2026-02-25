import { cn } from '@/lib/utils'

interface PulseDotProps {
  label?:    string
  color?:    string
  className?: string
}

export function PulseDot({ label, color = '#00e5a0', className }: PulseDotProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: color,
          animation: 'pulse-dot 1.5s ease-in-out infinite',
          boxShadow: `0 0 4px ${color}`,
        }}
      />
      {label && (
        <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color }}>
          {label}
        </span>
      )}
    </div>
  )
}
