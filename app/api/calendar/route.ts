import { NextResponse } from 'next/server'
import { MOCK_CALENDAR_EVENTS } from '@/lib/constants'
import type { CalendarEvent, Importance } from '@/lib/types'

// ── In-memory cache ───────────────────────────────────────────────────────────

const g = globalThis as typeof globalThis & {
  _calCache?: { events: CalendarEvent[]; source: 'live' | 'mock'; ts: number }
}

const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

// ── TradingView countries → devise mapping ────────────────────────────────────

// TradingView event country codes utilisés dans le calendrier
const COUNTRIES = 'US,EU,GB,JP,CA,CH,AU,NZ'

function impactToImportance(impact: number): Importance {
  if (impact >= 3) return 'high'
  if (impact >= 2) return 'medium'
  return 'low'
}

// Mapping pays → devise ISO
const COUNTRY_CURRENCY: Record<string, string> = {
  US: 'USD', EU: 'EUR', GB: 'GBP', JP: 'JPY',
  CA: 'CAD', CH: 'CHF', AU: 'AUD', NZ: 'NZD',
  CN: 'CNY', DE: 'EUR', FR: 'EUR', IT: 'EUR',
}

// Symboles impactés par devise
const CURRENCY_SYMBOLS: Record<string, string[]> = {
  USD: ['EURUSD', 'XAUUSD', 'NAS100', 'US500', 'TSLA', 'NVDA', 'AMD', 'MU', 'AAPL', 'META', 'AMZN', 'MSFT', 'GOOGL'],
  EUR: ['EURUSD'],
  GBP: ['GBPUSD'],
  JPY: ['USDJPY'],
  CAD: ['USDCAD'],
  CHF: ['USDCHF'],
  AUD: ['AUDUSD'],
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

async function fetchLiveCalendar(): Promise<CalendarEvent[]> {
  const today = todayISO()

  // TradingView public Economic Calendar endpoint (no auth required)
  const url = `https://economic-calendar.tradingview.com/events?from=${today}T00:00:00.000Z&to=${today}T23:59:59.000Z&countries=${COUNTRIES}`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept':     'application/json, text/plain, */*',
      'Referer':    'https://www.tradingview.com/',
    },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = await res.json()

  // TradingView retourne { result: [...] } ou directement un tableau
  const rawEvents: Record<string, unknown>[] = Array.isArray(data) ? data : (data.result ?? [])

  return rawEvents
    .filter(e => typeof e === 'object' && e !== null)
    .map((e, idx) => {
      const country  = String(e.country   ?? '')
      const currency = COUNTRY_CURRENCY[country] ?? country
      const impact   = Number(e.importance ?? e.impact ?? 1)
      const time     = e.date
        ? new Date(String(e.date)).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' })
        : '--:--'

      return {
        id:             String(e.id ?? idx),
        time,
        currency,
        importance:     impactToImportance(impact),
        title:          String(e.title ?? e.event_name ?? 'Événement'),
        forecast:       e.forecast  != null ? String(e.forecast)  : null,
        previous:       e.previous  != null ? String(e.previous)  : null,
        actual:         e.actual    != null ? String(e.actual)    : null,
        impactsSymbols: CURRENCY_SYMBOLS[currency] ?? [],
      } satisfies CalendarEvent
    })
    .sort((a, b) => a.time.localeCompare(b.time))
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET() {
  // Serve from cache if fresh
  if (g._calCache && Date.now() - g._calCache.ts < CACHE_TTL_MS) {
    return NextResponse.json({
      events:     g._calCache.events,
      source:     g._calCache.source,
      updated_at: new Date(g._calCache.ts).toISOString(),
      fromCache:  true,
    })
  }

  // Try live fetch
  let events: CalendarEvent[]
  let source: 'live' | 'mock'

  try {
    events = await fetchLiveCalendar()
    source = 'live'

    // Si le résultat est vide (week-end, jour férié), fallback mock
    if (events.length === 0) {
      events = MOCK_CALENDAR_EVENTS as CalendarEvent[]
      source = 'mock'
    }
  } catch {
    // Fallback gracieux sur le mock
    events = MOCK_CALENDAR_EVENTS as CalendarEvent[]
    source = 'mock'
  }

  // Store in cache
  g._calCache = { events, source, ts: Date.now() }

  return NextResponse.json({
    events,
    source,
    updated_at: new Date().toISOString(),
    fromCache:  false,
  })
}
