'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CalendarEventRow } from './CalendarEvent'
import { CALENDAR_CURRENCIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { CalendarEvent, Importance } from '@/lib/types'

const IMPORTANCE_LABELS: Record<Importance, { label: string; cls: string }> = {
  high:   { label: 'HIGH', cls: 'bg-[#ff4d6a18] text-accent-red border-[#ff4d6a33]'   },
  medium: { label: 'MED',  cls: 'bg-[#f59e0b18] text-accent-amber border-[#f59e0b33]' },
  low:    { label: 'LOW',  cls: 'bg-white/5 text-gray-500 border-white/5'              },
}

interface CalendarResponse {
  events:     CalendarEvent[]
  source:     'live' | 'mock'
  updated_at: string
  fromCache?: boolean
}

export function EconomicCalendar({ watchlistSymbols = [] }: { watchlistSymbols?: string[] }) {
  const [events,   setEvents]   = useState<CalendarEvent[]>([])
  const [source,   setSource]   = useState<'live' | 'mock'>('mock')
  const [loading,  setLoading]  = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])
  const [selectedImportance, setSelectedImportance] = useState<Importance[]>([])

  const loadCalendar = useCallback(async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)
    try {
      const url = force ? '/api/calendar?refresh=1' : '/api/calendar'
      const res  = await fetch(url)
      const data = await res.json() as CalendarResponse
      setEvents(data.events ?? [])
      setSource(data.source ?? 'mock')
    } catch {
      // garde les events existants
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadCalendar()
    // Auto-refresh toutes les 15 min
    const interval = setInterval(() => loadCalendar(), 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadCalendar])

  const now     = new Date()
  const nowHHMM = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  const filtered = events.filter(e => {
    if (selectedCurrencies.length && !selectedCurrencies.includes(e.currency))   return false
    if (selectedImportance.length && !selectedImportance.includes(e.importance)) return false
    return true
  })

  const nextEvent = filtered.find(e => e.time > nowHHMM)

  const toggleCurrency  = (c: string) =>
    setSelectedCurrencies(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleImportance = (i: Importance) =>
    setSelectedImportance(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])

  // Badge source
  const sourceBadge = (
    <div className="flex items-center gap-2">
      {/* LIVE / MOCK badge */}
      <span className={cn(
        'flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full',
        source === 'live'
          ? 'text-accent-green bg-[#00e5a015]'
          : 'text-gray-500 bg-white/5'
      )}>
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          source === 'live' ? 'bg-accent-green animate-pulse' : 'bg-gray-600'
        )} />
        {source === 'live' ? 'LIVE' : 'MOCK'}
      </span>

      {/* Refresh button */}
      <button
        onClick={() => loadCalendar(true)}
        disabled={refreshing}
        className="p-1 text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50"
        title="Rafraîchir"
      >
        <RefreshCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
      </button>

      {/* Importance filters */}
      <div className="flex items-center gap-1">
        {(Object.entries(IMPORTANCE_LABELS) as [Importance, typeof IMPORTANCE_LABELS[Importance]][]).map(([key, val]) => (
          <button key={key} onClick={() => toggleImportance(key)}
            className={cn(
              'text-[9px] px-1.5 py-0.5 rounded border transition-colors',
              selectedImportance.includes(key) ? val.cls : 'bg-transparent text-gray-600 border-white/5 hover:text-gray-400',
            )}>
            {val.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden">
      <SectionHeader
        title="Calendrier Économique"
        subtitle={new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={sourceBadge}
      />

      {/* Currency filters */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-white/5 flex-wrap">
        {CALENDAR_CURRENCIES.map(c => (
          <button key={c} onClick={() => toggleCurrency(c)}
            className={cn(
              'text-[9px] px-2 py-0.5 rounded transition-colors font-medium',
              selectedCurrencies.includes(c)
                ? 'bg-surface-700 text-white'
                : 'text-gray-600 hover:text-gray-400'
            )}>
            {c}
          </button>
        ))}
        {(selectedCurrencies.length > 0 || selectedImportance.length > 0) && (
          <button onClick={() => { setSelectedCurrencies([]); setSelectedImportance([]) }}
            className="text-[9px] px-2 py-0.5 rounded text-gray-600 hover:text-gray-400 ml-auto">
            Reset
          </button>
        )}
      </div>

      {/* Events list */}
      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <div className="w-10 h-3 bg-surface-700 rounded animate-pulse" />
                <div className="w-8  h-3 bg-surface-700 rounded animate-pulse" />
                <div className="flex-1 h-3 bg-surface-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[10px] text-gray-600 text-center py-8">
            {events.length === 0
              ? 'Aucun événement économique aujourd\'hui'
              : 'Aucun événement pour les filtres sélectionnés'}
          </p>
        ) : (
          filtered.map(event => (
            <CalendarEventRow
              key={event.id}
              event={event}
              isNext={event === nextEvent}
              isPast={event.time < nowHHMM}
              watchlistSymbols={watchlistSymbols}
            />
          ))
        )}
      </div>
    </section>
  )
}
