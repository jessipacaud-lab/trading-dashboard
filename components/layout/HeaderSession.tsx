'use client'

import { useEffect, useState } from 'react'
import { getParisTime, getCurrentSession, dayOfWeekFR, countdownTo14H } from '@/lib/utils'
import { MOCK_MACRO } from '@/lib/constants'
import { PulseDot } from '@/components/ui/PulseDot'
import type { SessionInfo } from '@/lib/types'
import { Bell, RefreshCw } from 'lucide-react'

function Clock({ label, tz, highlight }: { label: string; tz: string; highlight?: boolean }) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      setTime(new Date().toLocaleTimeString('fr-FR', { timeZone: tz, hour12: false }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tz])

  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-gray-600 uppercase tracking-widest">{label}</span>
      <span className={`text-[11px] font-semibold ${highlight ? 'text-accent-cyan' : 'text-gray-400'}`}>
        {time}
      </span>
    </div>
  )
}

function MacroTicker({ label, value, pct }: { label: string; value: string; pct: number }) {
  const pos = pct >= 0
  return (
    <div className="hidden lg:flex items-center gap-1.5">
      <span className="text-[9px] text-gray-600">{label}</span>
      <span className={`text-[10px] font-semibold ${pos ? 'text-accent-green' : 'text-accent-red'}`}>{value}</span>
      <span className={`text-[9px] ${pos ? 'text-accent-green' : 'text-accent-red'}`}>{pos ? '▲' : '▼'}</span>
    </div>
  )
}

export function HeaderSession() {
  const [session, setSession]     = useState<SessionInfo | null>(null)
  const [dayLabel, setDayLabel]   = useState('')
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    const tick = () => {
      const paris = getParisTime()
      setSession(getCurrentSession(paris))
      setDayLabel(dayOfWeekFR())
      setCountdown(countdownTo14H())
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="h-14 flex-shrink-0 bg-surface-800/90 backdrop-blur border-b border-white/5 flex items-center px-4 gap-3 relative z-20 overflow-hidden">

      {/* Live indicator */}
      <PulseDot label="Live" color="#00e5a0" />

      <div className="h-4 w-px bg-white/10" />

      {/* Session label */}
      {session && (
        <div className="hidden md:flex items-center gap-2">
          <span
            className="text-[9px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border"
            style={{
              background: session.color + '18',
              color:      session.color,
              borderColor:session.color + '44',
            }}
          >
            {session.label}
          </span>
          <span className="text-[9px] text-gray-600">
            → {session.nextLabel} dans {session.minutesToNext}min
          </span>
        </div>
      )}

      <div className="h-4 w-px bg-white/10 hidden md:block" />

      {/* Clocks */}
      <div className="flex items-center gap-4">
        <Clock label="Paris"    tz="Europe/Paris"     highlight />
        <Clock label="London"   tz="Europe/London"                />
        <Clock label="New York" tz="America/New_York"             />
        <Clock label="Tokyo"    tz="Asia/Tokyo"                   />
      </div>

      <div className="h-4 w-px bg-white/10 hidden lg:block" />

      {/* Day label */}
      <span className="hidden lg:block text-[10px] text-gray-600 capitalize">{dayLabel}</span>

      <div className="flex-1" />

      {/* Macro tickers */}
      <MacroTicker label="VIX"   value={MOCK_MACRO.vix.price.toFixed(1)}   pct={MOCK_MACRO.vix.changePct}    />
      <MacroTicker label="DXY"   value={MOCK_MACRO.dxy.price.toFixed(2)}   pct={MOCK_MACRO.dxy.changePct}    />
      <MacroTicker label="BTC"   value={MOCK_MACRO.btc.price.toLocaleString()} pct={MOCK_MACRO.btc.changePct} />

      <div className="h-4 w-px bg-white/10 hidden lg:block" />

      {/* Briefing countdown */}
      <div className="hidden md:flex items-center gap-1.5 text-[10px]">
        <RefreshCw className="w-3 h-3 text-gray-600" />
        <span className="text-gray-600">Briefing IA dans</span>
        <span className="text-accent-cyan font-semibold">{countdown}</span>
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
        <Bell className="w-4 h-4 text-gray-500" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-red" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white cursor-pointer"
           style={{ background: 'linear-gradient(135deg,#a855f7,#00c8ff)' }}>
        JP
      </div>

      {/* Animated gradient line */}
      <div className="header-line absolute bottom-0 left-0 right-0" />
    </header>
  )
}
