'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Plus, Check, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SYMBOL_CATALOG,
  getCatalogBySection,
  getMeta,
  type SectionKey,
  type SymbolMeta,
} from '@/lib/userPreferences'

// ── Category colors ───────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  'Forex':          '#7AA7FF',
  'Indices':        '#59E6D6',
  'Matières 1ères': '#FFC24A',
  'Crypto':         '#a855f7',
  'Tech':           '#00c8ff',
  'Finance':        '#59E6D6',
  'Santé':          '#00e5a0',
  'Énergie':        '#f59e0b',
}

const getCatColor = (cat: string) => CAT_COLORS[cat] ?? '#9AA6B2'

// ── SymbolChip ────────────────────────────────────────────────────────────────

function SymbolChip({
  symbol,
  onRemove,
}: {
  symbol: string
  onRemove: () => void
}) {
  const meta = getMeta(symbol)
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border"
          style={{ borderColor: 'rgba(148,163,184,0.2)', color: '#B6C2D1', background: 'rgba(148,163,184,0.06)' }}>
      {meta?.icon} {symbol}
      <button onClick={onRemove}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
              aria-label={`Retirer ${symbol}`}>
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  )
}

// ── SymbolRow ────────────────────────────────────────────────────────────────

function SymbolRow({
  meta,
  selected,
  onToggle,
}: {
  meta: SymbolMeta
  selected: boolean
  onToggle: () => void
}) {
  const catColor = getCatColor(meta.cat)
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
        selected
          ? 'bg-[#7AA7FF14] border border-[#7AA7FF30]'
          : 'hover:bg-white/[0.03] border border-transparent'
      )}
    >
      <span className="text-sm w-5 text-center flex-shrink-0">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-mono font-semibold text-gray-200">{meta.symbol}</span>
          <span className="text-[10px] text-gray-500">{meta.label}</span>
        </div>
        <span className="text-[9px] font-medium uppercase tracking-wide"
              style={{ color: catColor }}>
          {meta.cat}
        </span>
      </div>
      <div className={cn(
        'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all',
        selected
          ? 'border-[#7AA7FF] bg-[#7AA7FF]'
          : 'border-white/20'
      )}>
        {selected && <Check className="w-2.5 h-2.5 text-[#070A12]" strokeWidth={2.5} />}
      </div>
    </button>
  )
}

// ── Main SymbolPicker ─────────────────────────────────────────────────────────

interface SymbolPickerProps {
  section:   SectionKey
  selected:  string[]
  onChange:  (symbols: string[]) => void
  maxItems?: number
  label?:    string
}

export function SymbolPicker({
  section,
  selected,
  onChange,
  maxItems = 10,
  label    = 'Personnaliser',
}: SymbolPickerProps) {
  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const [cat,    setCat]    = useState<string>('all')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const catalog   = getCatalogBySection(section)
  const cats      = ['all', ...Array.from(new Set(catalog.map(s => s.cat)))]

  const filtered = catalog.filter(s => {
    const matchCat    = cat === 'all' || s.cat === cat
    const matchSearch = !search ||
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.label.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const toggle = (symbol: string) => {
    if (selected.includes(symbol)) {
      onChange(selected.filter(s => s !== symbol))
    } else if (selected.length < maxItems) {
      onChange([...selected, symbol])
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border',
          open
            ? 'text-[#7AA7FF] bg-[#7AA7FF14] border-[#7AA7FF40]'
            : 'text-gray-500 hover:text-gray-300 border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
        )}
        title="Personnaliser les symboles"
      >
        <Settings2 className="w-3 h-3" strokeWidth={1.75} />
        {label}
      </button>

      {/* Modal */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border shadow-2xl"
             style={{
               background:   '#0B1220',
               borderColor:  'rgba(148,163,184,0.14)',
               boxShadow:    '0 0 0 1px rgba(148,163,184,0.08), 0 24px 48px rgba(0,0,0,0.6)',
             }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b"
               style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
            <div>
              <p className="text-[12px] font-semibold text-gray-100">Sélection de symboles</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {selected.length}/{maxItems} sélectionnés
              </p>
            </div>
            <button onClick={() => setOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="px-4 py-2.5 border-b flex flex-wrap gap-1.5"
                 style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
              {selected.map(sym => (
                <SymbolChip key={sym} symbol={sym} onRemove={() => toggle(sym)} />
              ))}
            </div>
          )}

          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Chercher un symbole…"
                className="w-full pl-8 pr-3 py-1.5 text-[11px] rounded-lg border text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#7AA7FF66]"
                style={{
                  background:  'rgba(148,163,184,0.04)',
                  borderColor: 'rgba(148,163,184,0.12)',
                }}
                autoFocus
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-0.5 px-4 pb-2 overflow-x-auto scrollbar-hide">
            {cats.map(c => (
              <button key={c}
                      onClick={() => setCat(c)}
                      className={cn(
                        'flex-shrink-0 text-[9px] font-medium px-2 py-0.5 rounded-full transition-all capitalize',
                        cat === c
                          ? 'text-[#7AA7FF] bg-[#7AA7FF14] border border-[#7AA7FF30]'
                          : 'text-gray-600 hover:text-gray-400 border border-transparent'
                      )}>
                {c === 'all' ? 'Tous' : c}
              </button>
            ))}
          </div>

          {/* Symbol list */}
          <div className="px-2 pb-2 space-y-0.5 overflow-y-auto max-h-60 scrollbar-hide">
            {filtered.length === 0 ? (
              <p className="text-center text-[10px] text-gray-600 py-6">Aucun résultat</p>
            ) : (
              filtered.map(meta => (
                <SymbolRow
                  key={meta.symbol}
                  meta={meta}
                  selected={selected.includes(meta.symbol)}
                  onToggle={() => toggle(meta.symbol)}
                />
              ))
            )}
          </div>

          {/* Footer hint */}
          {selected.length >= maxItems && (
            <div className="px-4 pb-3">
              <p className="text-[9px] text-[#FFC24A] flex items-center gap-1">
                <span>⚠</span>
                Limite de {maxItems} symboles atteinte. Retirez-en un pour en ajouter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
