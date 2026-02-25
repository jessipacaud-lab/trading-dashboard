'use client'

import { useState, useEffect, useCallback } from 'react'
import { ExternalLink, RefreshCw, Newspaper } from 'lucide-react'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { SymbolPicker }  from '@/components/ui/SymbolPicker'
import { getMeta, loadSymbols, saveSymbols } from '@/lib/userPreferences'
import { cn } from '@/lib/utils'
import type { NewsItem } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const diff = Date.now() - date.getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1)   return 'à l\'instant'
    if (m < 60)  return `il y a ${m}min`
    const h = Math.floor(m / 60)
    if (h < 24)  return `il y a ${h}h`
    const d = Math.floor(h / 24)
    return `il y a ${d}j`
  } catch {
    return ''
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NewsWidget() {
  const [symbols,    setSymbols]   = useState<string[]>([])
  const [symbol,     setSymbol]    = useState('')
  const [news,       setNews]      = useState<NewsItem[]>([])
  const [loading,    setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Load saved symbols on mount (client-only)
  useEffect(() => {
    const saved = loadSymbols('news')
    setSymbols(saved)
    setSymbol(saved[0] ?? '')
  }, [])

  const handleSymbolsChange = useCallback((newSymbols: string[]) => {
    setSymbols(newSymbols)
    saveSymbols('news', newSymbols)
    if (newSymbols.length > 0 && !newSymbols.includes(symbol)) {
      setSymbol(newSymbols[0])
      setNews([])
    }
  }, [symbol])

  const loadNews = useCallback(async (sym: string, force = false) => {
    if (!sym) return
    if (force) setRefreshing(true)
    else setLoading(true)
    try {
      const res  = await fetch(`/api/news?symbol=${sym}`)
      const data = await res.json() as { items: NewsItem[] }
      setNews(data.items ?? [])
    } catch {
      setNews([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (symbol) loadNews(symbol)
  }, [symbol, loadNews])

  const handleTabClick = (sym: string) => {
    if (sym === symbol) return
    setSymbol(sym)
    setNews([])
  }

  const currentMeta = getMeta(symbol)

  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden flex flex-col">
      <SectionHeader
        title="Actualités Macro"
        subtitle={currentMeta ? `${currentMeta.icon} ${currentMeta.label}` : symbol}
        action={
          <div className="flex items-center gap-2">
            <SymbolPicker
              section="news"
              selected={symbols}
              onChange={handleSymbolsChange}
              maxItems={15}
            />
            <button
              onClick={() => loadNews(symbol, true)}
              disabled={refreshing}
              className="p-1 text-gray-600 hover:text-gray-400 transition-colors disabled:opacity-50"
              title="Rafraîchir"
            >
              <RefreshCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
            </button>
          </div>
        }
      />

      {/* Tabs — paires cliquables */}
      {symbols.length > 0 ? (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
          {symbols.map(sym => (
            <button
              key={sym}
              onClick={() => handleTabClick(sym)}
              className={cn(
                'flex-shrink-0 text-[9px] font-mono font-semibold px-2 py-1 rounded transition-all',
                symbol === sym
                  ? 'bg-[#00c8ff15] text-accent-cyan border border-[#00c8ff33]'
                  : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
              )}
            >
              {sym}
            </button>
          ))}
        </div>
      ) : (
        <div className="px-3 py-2 border-b border-white/5">
          <p className="text-[10px] text-gray-600">Aucun symbole — cliquez &ldquo;Personnaliser&rdquo;</p>
        </div>
      )}

      {/* News list */}
      <div className="flex-1 divide-y divide-white/5 overflow-y-auto max-h-72">
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-4 py-3 space-y-1.5 border-b border-white/5">
                <div className="h-3 bg-surface-700 rounded animate-pulse w-4/5" />
                <div className="h-2.5 bg-surface-700 rounded animate-pulse w-2/5" />
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Newspaper className="w-5 h-5 text-gray-700" />
            <p className="text-[10px] text-gray-600">
              {symbol ? `Aucune actualité disponible pour ${symbol}` : 'Sélectionnez des symboles'}
            </p>
          </div>
        ) : (
          news.map((item, i) => (
            <NewsRow key={i} item={item} />
          ))
        )}
      </div>
    </section>
  )
}

// ── NewsRow ───────────────────────────────────────────────────────────────────

function NewsRow({ item }: { item: NewsItem }) {
  const ago = timeAgo(item.pubDate)

  return (
    <a
      href={item.link !== '#' ? item.link : undefined}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors group',
        item.link !== '#'
          ? 'hover:bg-surface-700 cursor-pointer'
          : 'cursor-default'
      )}
    >
      {/* Bullet */}
      <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-accent-cyan mt-1.5 flex-shrink-0 transition-colors" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-300 leading-snug group-hover:text-white transition-colors line-clamp-2">
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-gray-600 font-medium">{item.source}</span>
          {ago && (
            <>
              <span className="text-[8px] text-gray-700">·</span>
              <span className="text-[9px] text-gray-600">{ago}</span>
            </>
          )}
        </div>
      </div>

      {/* External link icon */}
      {item.link !== '#' && (
        <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-accent-cyan flex-shrink-0 mt-0.5 transition-colors" />
      )}
    </a>
  )
}
