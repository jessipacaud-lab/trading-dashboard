'use client'

import { useEffect, useState, useCallback } from 'react'
import { BiasBadge }      from '@/components/ui/BiasBadge'
import { ConvictionBar }  from '@/components/ui/ConvictionBar'
import { SymbolPicker }   from '@/components/ui/SymbolPicker'
import { computeBias }    from '@/lib/scoringEngine'
import { MOCK_MACRO }     from '@/lib/constants'
import { loadSymbols, saveSymbols, getMeta } from '@/lib/userPreferences'
import type { MacroSnapshot, MarketQuote } from '@/lib/types'
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Mapping Yahoo → MacroSnapshot ─────────────────────────────────────────────

function buildMacroFromSnapshots(
  snapshots: { symbol: string; price: number; change: number; changePct: number; sparkline?: number[] }[]
): MacroSnapshot {
  const find = (sym: string): MarketQuote => {
    const s = snapshots.find(x => x.symbol === sym)
    if (!s) return MOCK_MACRO[sym.toLowerCase() as keyof MacroSnapshot] ?? MOCK_MACRO.dxy
    return {
      symbol:    s.symbol,
      price:     s.price,
      change:    s.change,
      changePct: s.changePct,
      sparkline: s.sparkline ?? [],
    }
  }
  return {
    dxy:    find('DXY'),
    us10y:  find('US10Y'),
    vix:    find('VIX'),
    spx:    find('SPX'),
    nas100: find('NAS100'),
    gold:   find('XAUUSD'),
    btc:    find('BTC'),
  }
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function BiasGrid() {
  const [symbols,    setSymbols]    = useState<string[]>([])
  const [macro,      setMacro]      = useState<MacroSnapshot>(MOCK_MACRO)
  const [loading,    setLoading]    = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isLive,     setIsLive]     = useState(false)
  const [expanded,   setExpanded]   = useState<string | null>(null)

  // Load saved symbols on mount (client-only)
  useEffect(() => {
    const saved = loadSymbols('bias')
    setSymbols(saved)
    setExpanded(saved[0] ?? null)
  }, [])

  const handleSymbolsChange = useCallback((newSymbols: string[]) => {
    setSymbols(newSymbols)
    saveSymbols('bias', newSymbols)
    if (newSymbols.length > 0 && !newSymbols.includes(expanded ?? '')) {
      setExpanded(newSymbols[0])
    }
  }, [expanded])

  const fetchMacro = useCallback(async () => {
    try {
      // Fetch only macro reference symbols (always needed for scoring engine)
      const res  = await fetch('/api/market-data?symbols=DXY,US10Y,VIX,SPX,NAS100,XAUUSD,BTC')
      const json = await res.json() as { snapshots: { symbol: string; price: number; change: number; changePct: number; sparkline?: number[] }[] }
      if (json.snapshots?.length > 0) {
        setMacro(buildMacroFromSnapshots(json.snapshots))
        setIsLive(true)
        setLastUpdate(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
      }
    } catch {
      // fallback sur MOCK_MACRO déjà en place
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMacro()
    const id = setInterval(fetchMacro, 60_000)
    return () => clearInterval(id)
  }, [fetchMacro])

  // Build grid assets from user-selected symbols
  const gridAssets = symbols.map(sym => {
    const meta = getMeta(sym)
    return { symbol: sym, assetType: meta?.assetType ?? 'stock' as const }
  })

  const results = gridAssets.map(a =>
    computeBias({ symbol: a.symbol, assetType: a.assetType, macro })
  )

  const bullishCount = results.filter(r => r.bias === 'bullish').length
  const bearishCount = results.filter(r => r.bias === 'bearish').length
  const pct          = results.length > 0 ? Math.round((bullishCount / results.length) * 100) : 50
  const overallScore = results.reduce((s, r) => s + (r.bias === 'bullish' ? 1 : r.bias === 'bearish' ? -1 : 0), 0)
  const overallBias  = overallScore >= 2 ? 'bullish' : overallScore <= -2 ? 'bearish' : 'range'

  const biasColor = (b: string) =>
    b === 'bullish' ? '#59E6D6' : b === 'bearish' ? '#FF5C7A' : '#FFC24A'

  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-gray-100">Bias Engine</span>
            <span className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full border',
              isLive
                ? 'text-[#59E6D6] bg-[#59E6D614] border-[#59E6D630]'
                : 'text-[#FFC24A] bg-[#FFC24A14] border-[#FFC24A30]'
            )}>
              {isLive ? 'Live' : 'Mock'}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {isLive && lastUpdate ? `Données réelles · MàJ ${lastUpdate}` : 'Données simulées — en attente marché'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SymbolPicker
            section="bias"
            selected={symbols}
            onChange={handleSymbolsChange}
            maxItems={12}
          />
          <button
            onClick={() => { setLoading(true); fetchMacro() }}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40"
            title="Actualiser"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-gray-500', loading && 'animate-spin')} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">

        {/* ── Score global ── */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5"
             style={{ background: '#070A12' }}>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-500">Sentiment global</span>
              <span className="text-[12px] font-semibold" style={{ color: biasColor(overallBias) }}>
                {overallBias === 'bullish' ? '▲ BULLISH' : overallBias === 'bearish' ? '▼ BEARISH' : '↔ RANGE'}
              </span>
            </div>
            <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.1)' }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                   style={{ width: `${pct}%`, background: '#59E6D6' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px]" style={{ color: '#59E6D6' }}>{bullishCount} bull</span>
              <span className="text-[10px] text-gray-600">{pct}% haussier</span>
              <span className="text-[10px]" style={{ color: '#FF5C7A' }}>{bearishCount} bear</span>
            </div>
          </div>
        </div>

        {/* ── Asset list ── */}
        {symbols.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[11px] text-gray-600">Aucun symbole sélectionné.</p>
            <p className="text-[10px] text-gray-700 mt-1">Cliquez sur &ldquo;Personnaliser&rdquo; pour ajouter des actifs.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {results.map(r => (
              <div key={r.symbol}>
                {/* Row cliquable */}
                <button
                  onClick={() => setExpanded(expanded === r.symbol ? null : r.symbol)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors text-left"
                >
                  <span className="text-[12px] font-medium text-gray-300 w-16 flex-shrink-0 font-mono">
                    {r.symbol}
                  </span>
                  <BiasBadge bias={r.bias} size="sm" />
                  <div className="flex-1 mx-2">
                    <ConvictionBar value={r.confidence} max={100} />
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 w-8 text-right flex-shrink-0">
                    {r.confidence}%
                  </span>
                  {expanded === r.symbol
                    ? <ChevronUp   className="w-3 h-3 text-gray-600 flex-shrink-0" strokeWidth={1.75} />
                    : <ChevronDown className="w-3 h-3 text-gray-600 flex-shrink-0" strokeWidth={1.75} />
                  }
                </button>

                {/* Raisons expandées */}
                {expanded === r.symbol && (
                  <div className="mx-3 mb-1 px-3 py-2.5 rounded-lg space-y-1.5 border border-white/[0.06]"
                       style={{ background: '#070A12' }}>
                    {r.reasons.map((reason, i) => (
                      <div key={i} className="flex gap-2 text-[11px]">
                        <span className="flex-shrink-0 mt-0.5" style={{ color: '#7AA7FF' }}>→</span>
                        <span className="text-gray-400 leading-snug">{reason}</span>
                      </div>
                    ))}
                    {/* Macro inputs utilisés */}
                    <div className="pt-1.5 mt-1.5 border-t border-white/[0.06] grid grid-cols-3 gap-2">
                      {[
                        { label: 'DXY',   val: macro.dxy.changePct,   pct: true },
                        { label: 'VIX',   val: macro.vix.price,        pct: false },
                        { label: 'US10Y', val: macro.us10y.price,       pct: false },
                      ].map(({ label, val, pct: isPct }) => (
                        <div key={label} className="text-center">
                          <p className="text-[9px] text-gray-600 uppercase">{label}</p>
                          <p className="text-[11px] font-mono font-medium"
                             style={{ color: isPct ? (val > 0 ? '#59E6D6' : '#FF5C7A') : '#B6C2D1' }}>
                            {isPct ? (val > 0 ? '+' : '') + val.toFixed(2) + '%' : val.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Comment ça marche ── */}
        <div className="text-[10px] text-gray-600 leading-relaxed px-1 pt-1 border-t border-white/5">
          <span style={{ color: '#7AA7FF' }}>Comment ça marche ?</span>
          {' '}Le scoring calcule un score 0–100 pour chaque actif à partir des données macro réelles (DXY, VIX, US10Y, NAS100) selon des règles transparentes.
          Score ≥65 = bullish · ≤35 = bearish · sinon range.
        </div>

      </div>
    </section>
  )
}
