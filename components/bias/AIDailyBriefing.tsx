'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { SymbolPicker } from '@/components/ui/SymbolPicker'
import { BiasCard } from './BiasCard'
import { countdownToNextSlot, isWeekday } from '@/lib/utils'
import { loadSymbols, saveSymbols } from '@/lib/userPreferences'
import type { DailyBriefing, BriefingState } from '@/lib/types'
import { RefreshCw, Brain, Clock, AlertTriangle, Settings } from 'lucide-react'
import Link from 'next/link'

// ── Waiting state UI ──────────────────────────────────────────────────────────

type WaitingReason = 'no-key' | 'weekend' | 'before-8h'

function BriefingWaiting({ reason }: { reason: WaitingReason }) {
  const [info, setInfo] = useState(countdownToNextSlot())

  useEffect(() => {
    const id = setInterval(() => setInfo(countdownToNextSlot()), 1000)
    return () => clearInterval(id)
  }, [])

  if (reason === 'no-key') {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-700 border border-white/5">
          <Settings className="w-6 h-6 text-gray-600" />
        </div>
        <div className="text-center">
          <p className="text-[11px] text-gray-400 font-medium mb-2">
            Clé API Anthropic non configurée
          </p>
          <p className="text-[10px] text-gray-600 mb-3 max-w-xs">
            Le briefing se génère automatiquement à 8H et 14H une fois la clé configurée.
          </p>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-accent-cyan bg-[#00c8ff12] border border-[#00c8ff33] hover:bg-[#00c8ff20] transition-colors"
          >
            <Settings className="w-3 h-3" />
            Configurer dans Paramètres →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-surface-700 border border-white/5">
        <Clock className="w-6 h-6 text-gray-600" />
      </div>
      <div className="text-center">
        <p className="text-[11px] text-gray-400 font-medium mb-1">
          {reason === 'weekend'
            ? 'Briefing disponible en semaine uniquement'
            : <span>Prochain briefing — <span className="text-accent-cyan">{info.label}</span></span>
          }
        </p>
        <p className="text-2xl font-bold text-white tracking-tight">{info.countdown}</p>
        <p className="text-[9px] text-gray-600 mt-1">
          Génération automatique · lundi–vendredi · 8H et 14H
        </p>
      </div>
    </div>
  )
}

// ── Error state UI ────────────────────────────────────────────────────────────

function BriefingError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ff4d6a18] border border-[#ff4d6a33]">
        <AlertTriangle className="w-5 h-5 text-accent-red" />
      </div>
      <div className="text-center">
        <p className="text-[11px] text-accent-red font-medium mb-1">Erreur de génération</p>
        <p className="text-[10px] text-gray-600 max-w-sm">{message}</p>
      </div>
      <button onClick={onRetry}
        className="text-[10px] px-3 py-1.5 rounded-lg bg-[#ff4d6a18] text-accent-red border border-[#ff4d6a33] hover:bg-[#ff4d6a28] transition-colors">
        Réessayer
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AIDailyBriefing() {
  const [state, setState]           = useState<BriefingState>('waiting')
  const [briefing, setBriefing]     = useState<DailyBriefing | null>(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [activeSlot, setActiveSlot] = useState<'8h' | '14h' | null>(null)
  const [symbols, setSymbols]       = useState<string[]>([])
  const [waitReason, setWaitReason] = useState<WaitingReason>('before-8h')

  // Prevent concurrent generations
  const generatingRef = useRef(false)

  // ── Load saved symbols on mount (client-only) ──────────────────────────────
  useEffect(() => {
    setSymbols(loadSymbols('briefing'))
  }, [])

  const handleSymbolsChange = useCallback((newSymbols: string[]) => {
    setSymbols(newSymbols)
    saveSymbols('briefing', newSymbols)
    // Invalidate displayed briefing (stale for old assets)
    setBriefing(null)
    setState('waiting')
    setActiveSlot(null)
  }, [])

  // ── Core generate function ─────────────────────────────────────────────────
  const generate = useCallback(async (
    key:         string,
    slot:        '8h' | '14h',
    assetList:   string[],
    morningCtx?: string,
  ) => {
    if (generatingRef.current) return
    generatingRef.current = true

    setState('loading')
    setLoading(true)
    try {
      const res = await fetch('/api/briefing', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          apiKey:         key,
          forceRefresh:   false,
          assets:         assetList,
          slot,
          morningContext: morningCtx,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? `Erreur HTTP ${res.status}`)
      }
      const data = await res.json() as DailyBriefing

      // Cache locally
      const cacheKey = `briefing_${slot}_${new Date().toDateString()}_${assetList.join(',')}`
      localStorage.setItem(cacheKey, JSON.stringify(data))

      setBriefing(data)
      setActiveSlot(slot)
      setState('ready')
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Erreur inconnue')
      setState('error')
    } finally {
      setLoading(false)
      generatingRef.current = false
    }
  }, [])

  // ── Decision function: check what should happen right now ──────────────────
  const checkAndTrigger = useCallback((currentSymbols: string[]) => {
    const key = localStorage.getItem('anthropic_key') ?? ''

    // No key → show settings prompt
    if (!key || !key.startsWith('sk-')) {
      setState('waiting')
      setWaitReason('no-key')
      return
    }

    // Weekend → no generation
    if (!isWeekday()) {
      setState('waiting')
      setWaitReason('weekend')
      return
    }

    const now         = new Date()
    const hour        = now.getHours()
    const dateStr     = now.toDateString()
    const assetSuffix = currentSymbols.join(',')

    const cache14h = localStorage.getItem(`briefing_14h_${dateStr}_${assetSuffix}`)
    const cache8h  = localStorage.getItem(`briefing_8h_${dateStr}_${assetSuffix}`)

    // Already generating — skip
    if (generatingRef.current) return

    if (hour >= 14) {
      // 14H slot — try cache first
      if (cache14h) {
        try {
          const data = JSON.parse(cache14h) as DailyBriefing
          setBriefing({ ...data, fromCache: true })
          setActiveSlot('14h')
          setState('ready')
          return
        } catch { /* ignore */ }
      }
      // Generate 14H — pass 8H context if available
      let morningCtx: string | undefined
      if (cache8h) {
        try { morningCtx = (JSON.parse(cache8h) as DailyBriefing).macro_summary } catch { /* ignore */ }
      }
      generate(key, '14h', currentSymbols, morningCtx)

    } else if (hour >= 8) {
      // 8H slot — try cache first
      if (cache8h) {
        try {
          const data = JSON.parse(cache8h) as DailyBriefing
          setBriefing({ ...data, fromCache: true })
          setActiveSlot('8h')
          setState('ready')
          return
        } catch { /* ignore */ }
      }
      // Generate 8H
      generate(key, '8h', currentSymbols)

    } else {
      // Before 8H — just wait
      setState('waiting')
      setWaitReason('before-8h')
    }
  }, [generate])

  // ── On mount: restore cache or trigger generation ──────────────────────────
  useEffect(() => {
    const currentAssets = loadSymbols('briefing')
    setSymbols(currentAssets)
    checkAndTrigger(currentAssets)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Interval: poll every 60s to catch slot transitions ────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      // If 8H briefing is shown and it's now 14H → upgrade to 14H slot
      if (state === 'ready' && activeSlot === '8h') {
        if (new Date().getHours() >= 14) {
          const currentAssets = loadSymbols('briefing')
          checkAndTrigger(currentAssets)
        }
        return
      }
      // Don't interrupt an active load
      if (state === 'loading') return

      const currentAssets = loadSymbols('briefing')
      checkAndTrigger(currentAssets)
    }, 60000)
    return () => clearInterval(id)
  }, [state, activeSlot, checkAndTrigger])

  // ── Status badge ──────────────────────────────────────────────────────────
  const statusBadge = () => {
    if (state === 'ready' && briefing) {
      const slotLabel = activeSlot === '8h' ? '8H' : '14H'
      if (briefing.fromCache) return { label: `✓ Cache · ${slotLabel} · ${briefing.generated_at}`, cls: 'bg-[#f59e0b12] text-[#f59e0b] border-[#f59e0b33]' }
      return                         { label: `✓ ${slotLabel} · ${briefing.generated_at}`,          cls: 'bg-[#00e5a012] text-[#00e5a0] border-[#00e5a033]' }
    }
    if (state === 'loading') return { label: 'Analyse en cours…', cls: 'bg-[#a855f712] text-[#a855f7] border-[#a855f733]' }
    if (state === 'error')   return { label: 'Erreur',             cls: 'bg-[#ff4d6a12] text-[#ff4d6a] border-[#ff4d6a33]' }
    if (waitReason === 'no-key') return { label: '⚙ Clé manquante', cls: 'bg-surface-700 text-gray-500 border-white/5' }
    if (waitReason === 'weekend') return { label: '🗓 Weekend',      cls: 'bg-surface-700 text-gray-500 border-white/5' }
    return { label: 'En attente', cls: 'bg-surface-700 text-gray-600 border-white/5' }
  }

  const badge = statusBadge()

  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#a855f7,#00c8ff)' }}>
            <Brain className="w-3 h-3 text-white" />
          </div>
          <div>
            <h2 className="text-[11px] text-white font-semibold tracking-wide">AI Daily Briefing</h2>
            <p className="text-[9px] text-gray-600">Automatique · 8H &amp; 14H · lun–ven · {symbols.length} actifs</p>
          </div>
          <span className={`ml-2 text-[9px] px-2 py-0.5 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Controls — Symbol picker only */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <SymbolPicker
            section="briefing"
            selected={symbols}
            onChange={handleSymbolsChange}
            maxItems={20}
            label="Actifs"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {state === 'waiting' && <BriefingWaiting reason={waitReason} />}

        {state === 'loading' && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-600">
              <RefreshCw className="w-3 h-3 animate-spin text-[#a855f7]" />
              <span className="ai-typing">
                Claude analyse les marchés {activeSlot === '14h' ? '(mise à jour 14H)' : '(pré-marché 8H)'}
              </span>
            </div>
          </div>
        )}

        {state === 'error' && (
          <BriefingError
            message={errorMsg}
            onRetry={() => {
              const key           = localStorage.getItem('anthropic_key') ?? ''
              const currentAssets = loadSymbols('briefing')
              const slot          = activeSlot ?? (new Date().getHours() >= 14 ? '14h' : '8h')
              let morningCtx: string | undefined
              if (slot === '14h') {
                const cache8h = localStorage.getItem(`briefing_8h_${new Date().toDateString()}_${currentAssets.join(',')}`)
                if (cache8h) {
                  try { morningCtx = (JSON.parse(cache8h) as DailyBriefing).macro_summary } catch { /* ignore */ }
                }
              }
              generate(key, slot, currentAssets, morningCtx)
            }}
          />
        )}

        {state === 'ready' && briefing && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-4">
              {briefing.assets.map(a => <BiasCard key={a.symbol} asset={a} />)}
            </div>
            {/* Macro summary */}
            <div className="bg-surface-900 border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                     style={{ background: 'linear-gradient(135deg,#a855f7,#00c8ff)' }}>
                  <span className="text-[7px] text-white font-bold">AI</span>
                </div>
                <span className="text-[10px] text-white font-medium uppercase tracking-wider">
                  Contexte Macro Global
                  {activeSlot === '14h' && (
                    <span className="ml-2 text-[9px] text-accent-cyan normal-case font-normal">· mise à jour 14H</span>
                  )}
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">{briefing.macro_summary}</p>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
