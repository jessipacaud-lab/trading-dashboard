import type { Session, SessionInfo, MacroSnapshot } from './types'
import { SESSIONS } from './constants'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── Tailwind merge helper ─────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Number formatting ─────────────────────────────────────────────────────────

export function formatPrice(price: number, decimals = 4): string {
  if (price >= 10000) decimals = 0
  else if (price >= 100) decimals = 2
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function getParisTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
}

export function todayISO(): string {
  return getParisTime().toISOString().slice(0, 10)
}

export function dayOfWeekFR(): string {
  return getParisTime().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function timeHHMM(date: Date): string {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// ── Session logic ─────────────────────────────────────────────────────────────

export function getCurrentSession(parisTime: Date): SessionInfo {
  const total = minutesSinceMidnight(parisTime)

  const inSession = (s: typeof SESSIONS[Session]) => {
    const start = s.startH * 60 + s.startM
    const end   = s.endH   * 60 + s.endM
    return total >= start && total < end
  }

  let current: Session = 'off'
  if      (inSession(SESSIONS.overlap)) current = 'overlap'
  else if (inSession(SESSIONS.london))  current = 'london'
  else if (inSession(SESSIONS.newyork)) current = 'newyork'
  else if (inSession(SESSIONS.asia))    current = 'asia'

  const nextMap: Record<Session, Session> = {
    asia:    'london',
    london:  'overlap',
    overlap: 'newyork',
    newyork: 'off',
    off:     'asia',
  }
  const next      = nextMap[current]
  const nextSess  = SESSIONS[next]
  const nextStart = nextSess.startH * 60 + nextSess.startM
  let minutesToNext = nextStart - total
  if (minutesToNext < 0) minutesToNext += 24 * 60

  return {
    current,
    label:         SESSIONS[current].label,
    color:         SESSIONS[current].color,
    nextSession:   next,
    nextLabel:     nextSess.label,
    minutesToNext,
  }
}

// ── Macro summary text ────────────────────────────────────────────────────────

export function generateMacroSummary(macro: MacroSnapshot): string {
  const riskOff = macro.dxy.changePct > 0.2 && macro.vix.price > 18
  const riskOn  = macro.dxy.changePct < -0.2 && macro.vix.price < 16
  const sentiment = riskOff ? 'Risk-Off' : riskOn ? 'Risk-On' : 'Neutre'
  const dxyDir    = macro.dxy.changePct > 0 ? 'haussier' : 'baissier'
  const yieldDir  = macro.us10y.changePct > 0 ? 'en hausse' : 'en baisse'
  const equityDir = macro.nas100.changePct > 0.3 ? 'bullish' : macro.nas100.changePct < -0.3 ? 'bearish' : 'neutre'

  return `Sentiment global : ${sentiment}. DXY ${dxyDir} (${formatPct(macro.dxy.changePct)}), US10Y ${yieldDir} à ${macro.us10y.price.toFixed(2)}%. VIX à ${macro.vix.price.toFixed(1)} — ${macro.vix.price > 20 ? 'volatilité élevée, prudence sur les indices' : macro.vix.price < 15 ? 'marché complaisant, favorise le risk-on' : 'volatilité modérée'}. NAS100 ${equityDir} (${formatPct(macro.nas100.changePct)}). Gold ${formatPct(macro.gold.changePct)}. BTC ${formatPct(macro.btc.changePct)}.`
}

// ── Countdown helpers ─────────────────────────────────────────────────────────

/** Returns true if today is a weekday (Monday–Friday). */
export function isWeekday(date: Date = new Date()): boolean {
  const day = date.getDay()
  return day >= 1 && day <= 5
}

/** Returns a human-readable countdown string to a target hour (0-23). */
export function countdownToHour(targetHour: number): string {
  const now    = new Date()
  const target = new Date()
  target.setHours(targetHour, 0, 0, 0)
  if (now >= target) return 'Disponible maintenant'
  const diff = target.getTime() - now.getTime()
  const h    = Math.floor(diff / 3600000)
  const m    = Math.floor((diff % 3600000) / 60000)
  const s    = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}min ${String(s).padStart(2,'0')}s`
}

/** Formats a millisecond diff as HHh MMmin SSs. */
function formatDiff(diff: number): string {
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}min ${String(s).padStart(2,'0')}s`
}

/**
 * Returns countdown info toward the next briefing slot (8H or 14H),
 * accounting for weekends (Saturday/Sunday skip to Monday 8H).
 */
export function countdownToNextSlot(): { label: string; countdown: string } {
  const now  = new Date()
  const hour = now.getHours()
  const day  = now.getDay() // 0=Sun, 6=Sat

  // Weekend → next slot is Monday 8H
  if (day === 0 || day === 6) {
    const daysUntilMonday = day === 6 ? 2 : 1
    const monday = new Date(now)
    monday.setDate(monday.getDate() + daysUntilMonday)
    monday.setHours(8, 0, 0, 0)
    return { label: 'Lundi 8H', countdown: formatDiff(monday.getTime() - now.getTime()) }
  }

  // Weekday — check slots
  if (hour < 8)  return { label: '8H',  countdown: countdownToHour(8)  }
  if (hour < 14) return { label: '14H', countdown: countdownToHour(14) }

  // After 14H on weekday — next is next weekday 8H (Friday → Monday)
  const next = new Date(now)
  next.setDate(next.getDate() + (day === 5 ? 3 : 1)) // Friday +3 = Monday
  next.setHours(8, 0, 0, 0)
  const label = day === 5 ? 'Lundi 8H' : 'Demain 8H'
  return { label, countdown: formatDiff(next.getTime() - now.getTime()) }
}

/** @deprecated Use countdownToHour() or countdownToNextSlot() instead. */
export function countdownTo14H(): string {
  return countdownToHour(14)
}

// ── Bias helpers ──────────────────────────────────────────────────────────────

export function biasColor(bias: string): string {
  switch (bias) {
    case 'bullish':  return '#00e5a0'
    case 'bearish':  return '#ff4d6a'
    case 'volatile': return '#a855f7'
    default:         return '#f59e0b'
  }
}

export function biasLabel(bias: string): string {
  switch (bias) {
    case 'bullish':  return '▲ BULLISH'
    case 'bearish':  return '▼ BEARISH'
    case 'volatile': return '⚡ VOLATILE'
    default:         return '↔ RANGE'
  }
}
