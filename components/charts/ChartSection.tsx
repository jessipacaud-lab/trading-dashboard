'use client'

import { useState, useEffect, useCallback } from 'react'
import { TradingViewWidget } from './TradingViewWidget'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SymbolPicker }  from '@/components/ui/SymbolPicker'
import { TV_SYMBOL_PRESETS, TIMEFRAMES } from '@/lib/constants'
import { loadSymbols, saveSymbols, getMeta } from '@/lib/userPreferences'
import { cn } from '@/lib/utils'

interface ChartSectionProps { className?: string }

export function ChartSection({ className }: ChartSectionProps) {
  const [symbols,       setSymbols]       = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedTF,    setSelectedTF]    = useState(2) // H1 default

  // Load saved symbols on mount (client-only)
  useEffect(() => {
    const saved = loadSymbols('charts')
    setSymbols(saved)
    setSelectedIndex(0)
  }, [])

  const handleSymbolsChange = useCallback((newSymbols: string[]) => {
    setSymbols(newSymbols)
    saveSymbols('charts', newSymbols)
    setSelectedIndex(0)
  }, [])

  // Build chart assets from user-selected symbols
  const chartAssets = symbols
    .map(sym => ({
      symbol: sym,
      label:  getMeta(sym)?.label ?? sym,
      tv:     TV_SYMBOL_PRESETS[sym] ?? null,
    }))
    .filter((a): a is { symbol: string; label: string; tv: string } => !!a.tv)

  const clampedIndex = Math.min(selectedIndex, Math.max(0, chartAssets.length - 1))
  const asset = chartAssets[clampedIndex]
  const tf    = TIMEFRAMES[selectedTF]

  return (
    <section className={cn('bg-surface-800 border border-white/5 rounded-xl overflow-hidden', className)}>
      <SectionHeader
        title="Charts"
        action={
          <div className="flex items-center gap-1 flex-wrap">
            {/* Timeframe tabs */}
            {TIMEFRAMES.map((t, i) => (
              <button key={t.label} onClick={() => setSelectedTF(i)}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded transition-colors',
                  i === selectedTF
                    ? 'text-accent-cyan bg-[#00c8ff12] border border-[#00c8ff33]'
                    : 'text-gray-500 hover:text-gray-300'
                )}>
                {t.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-1" />
            {/* Asset tabs */}
            {chartAssets.map((a, i) => (
              <button key={a.symbol} onClick={() => setSelectedIndex(i)}
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded transition-colors font-mono',
                  i === clampedIndex
                    ? 'text-white bg-surface-700'
                    : 'text-gray-500 hover:text-gray-300'
                )}>
                {a.symbol}
              </button>
            ))}
            <div className="w-px h-4 bg-white/10 mx-0.5" />
            {/* Picker */}
            <SymbolPicker
              section="charts"
              selected={symbols}
              onChange={handleSymbolsChange}
              maxItems={8}
            />
          </div>
        }
      />
      {asset ? (
        <TradingViewWidget symbol={asset.tv} interval={tf.tv} height={400} />
      ) : (
        <div className="flex items-center justify-center h-40 text-[11px] text-gray-600">
          Sélectionnez des symboles pour afficher un graphique.
        </div>
      )}
    </section>
  )
}
