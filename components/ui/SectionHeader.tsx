import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title:     string
  subtitle?: string
  action?:   React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-b border-white/5', className)}>
      <div>
        <h2 className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">{title}</h2>
        {subtitle && <p className="text-[9px] text-gray-700 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
