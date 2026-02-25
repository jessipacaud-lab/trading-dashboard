import { cn } from '@/lib/utils'
import type { CalendarEvent as CalendarEventType } from '@/lib/types'

interface CalendarEventProps {
  event:     CalendarEventType
  isNext?:   boolean
  isPast?:   boolean
  watchlistSymbols?: string[]
}

const importanceColor = {
  high:   { bar: 'bg-accent-red',   text: 'text-accent-red'  },
  medium: { bar: 'bg-accent-amber', text: 'text-accent-amber' },
  low:    { bar: 'bg-white/20',     text: 'text-gray-600'    },
}

export function CalendarEventRow({ event, isNext, isPast, watchlistSymbols = [] }: CalendarEventProps) {
  const ic     = importanceColor[event.importance]
  const impact = watchlistSymbols.some(s => event.impactsSymbols.includes(s))

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2.5 relative transition-colors',
      isNext && 'bg-[#00c8ff08]',
      isPast && 'opacity-50',
      impact && !isPast && 'bg-[#f59e0b04]',
    )}>
      {/* Active indicator */}
      {isNext && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-cyan" />}

      {/* Time */}
      <div className={cn('w-12 text-[10px] flex-shrink-0', isNext ? 'text-accent-cyan font-semibold' : 'text-gray-500')}>
        {event.time}
      </div>

      {/* Importance bar */}
      <div className={cn('w-1 h-8 rounded-full flex-shrink-0', ic.bar)} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('text-[11px] truncate', isNext ? 'text-white font-medium' : 'text-gray-400')}>
            {event.title}
          </p>
          {isNext && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#ff4d6a18] text-accent-red border border-[#ff4d6a33] uppercase flex-shrink-0">
              Prochain
            </span>
          )}
          {impact && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#f59e0b18] text-accent-amber border border-[#f59e0b33] flex-shrink-0">
              ⚡ Watchlist
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[9px] mt-0.5">
          <span className={cn('font-medium', ic.text)}>{event.currency}</span>
          {event.previous && <span className="text-gray-600">Préc: <span className="text-gray-400">{event.previous}</span></span>}
          {event.forecast  && <span className="text-gray-600">Prev: <span className="text-accent-cyan">{event.forecast}</span></span>}
          {event.actual    && <span className="text-gray-600">Réel: <span className={
            event.actual > (event.forecast ?? '') ? 'text-accent-green' : 'text-accent-red'
          }>{event.actual}</span></span>}
        </div>
      </div>
    </div>
  )
}
