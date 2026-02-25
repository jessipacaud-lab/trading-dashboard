// ═══════════════════════════════════════════════════════════════════════════
//  User Preferences — localStorage-based symbol customization
//  Each section (bias, charts, briefing, news) has its own symbol list
// ═══════════════════════════════════════════════════════════════════════════

import type { AssetType } from './types'

// ── Master symbol catalog ─────────────────────────────────────────────────────
// All symbols available for selection across sections

export interface SymbolMeta {
  symbol:    string
  label:     string
  assetType: AssetType
  cat:       string       // display category
  icon:      string
  hasYahoo:  boolean      // available in market-data API (BiasGrid / Briefing)
  hasTV:     boolean      // available in TradingView (Charts)
}

export const SYMBOL_CATALOG: SymbolMeta[] = [
  // ── Forex ────────────────────────────────────────────────────────────
  { symbol: 'EURUSD', label: 'EUR/USD',   assetType: 'fx',        cat: 'Forex',           icon: '💱', hasYahoo: true,  hasTV: true  },
  { symbol: 'GBPUSD', label: 'GBP/USD',   assetType: 'fx',        cat: 'Forex',           icon: '🇬🇧', hasYahoo: true,  hasTV: true  },
  { symbol: 'USDJPY', label: 'USD/JPY',   assetType: 'fx',        cat: 'Forex',           icon: '🇯🇵', hasYahoo: true,  hasTV: true  },
  { symbol: 'USDCHF', label: 'USD/CHF',   assetType: 'fx',        cat: 'Forex',           icon: '🇨🇭', hasYahoo: true,  hasTV: true  },
  { symbol: 'AUDUSD', label: 'AUD/USD',   assetType: 'fx',        cat: 'Forex',           icon: '🇦🇺', hasYahoo: true,  hasTV: true  },
  { symbol: 'USDCAD', label: 'USD/CAD',   assetType: 'fx',        cat: 'Forex',           icon: '🇨🇦', hasYahoo: true,  hasTV: true  },
  { symbol: 'NZDUSD', label: 'NZD/USD',   assetType: 'fx',        cat: 'Forex',           icon: '🇳🇿', hasYahoo: true,  hasTV: true  },
  { symbol: 'EURGBP', label: 'EUR/GBP',   assetType: 'fx',        cat: 'Forex',           icon: '🇪🇺', hasYahoo: true,  hasTV: true  },
  { symbol: 'EURJPY', label: 'EUR/JPY',   assetType: 'fx',        cat: 'Forex',           icon: '🇯🇵', hasYahoo: true,  hasTV: true  },
  { symbol: 'GBPJPY', label: 'GBP/JPY',   assetType: 'fx',        cat: 'Forex',           icon: '💹', hasYahoo: true,  hasTV: true  },

  // ── Indices ──────────────────────────────────────────────────────────
  { symbol: 'NAS100', label: 'Nasdaq 100', assetType: 'index',     cat: 'Indices',         icon: '📈', hasYahoo: true,  hasTV: true  },
  { symbol: 'US500',  label: 'S&P 500',    assetType: 'index',     cat: 'Indices',         icon: '🇺🇸', hasYahoo: true,  hasTV: true  },
  { symbol: 'US30',   label: 'Dow Jones',  assetType: 'index',     cat: 'Indices',         icon: '🏛️', hasYahoo: true,  hasTV: true  },
  { symbol: 'UK100',  label: 'FTSE 100',   assetType: 'index',     cat: 'Indices',         icon: '🇬🇧', hasYahoo: true,  hasTV: true  },
  { symbol: 'GER40',  label: 'DAX 40',     assetType: 'index',     cat: 'Indices',         icon: '🇩🇪', hasYahoo: true,  hasTV: true  },
  { symbol: 'FRA40',  label: 'CAC 40',     assetType: 'index',     cat: 'Indices',         icon: '🇫🇷', hasYahoo: true,  hasTV: true  },
  { symbol: 'JP225',  label: 'Nikkei 225', assetType: 'index',     cat: 'Indices',         icon: '🇯🇵', hasYahoo: true,  hasTV: true  },

  // ── Commodités ───────────────────────────────────────────────────────
  { symbol: 'XAUUSD', label: 'Gold',       assetType: 'commodity', cat: 'Matières 1ères',  icon: '🥇', hasYahoo: true,  hasTV: true  },
  { symbol: 'XAGUSD', label: 'Silver',     assetType: 'commodity', cat: 'Matières 1ères',  icon: '🥈', hasYahoo: true,  hasTV: true  },
  { symbol: 'USOIL',  label: 'WTI Crude',  assetType: 'commodity', cat: 'Matières 1ères',  icon: '🛢️', hasYahoo: true,  hasTV: true  },
  { symbol: 'UKOIL',  label: 'Brent',      assetType: 'commodity', cat: 'Matières 1ères',  icon: '⛽', hasYahoo: true,  hasTV: true  },
  { symbol: 'NATGAS', label: 'Nat. Gas',   assetType: 'commodity', cat: 'Matières 1ères',  icon: '🔥', hasYahoo: true,  hasTV: true  },

  // ── Crypto ───────────────────────────────────────────────────────────
  { symbol: 'BTCUSD', label: 'Bitcoin',    assetType: 'commodity', cat: 'Crypto',          icon: '₿',  hasYahoo: true,  hasTV: true  },
  { symbol: 'ETHUSD', label: 'Ethereum',   assetType: 'commodity', cat: 'Crypto',          icon: '⟠',  hasYahoo: true,  hasTV: true  },

  // ── Actions Tech ─────────────────────────────────────────────────────
  { symbol: 'NVDA',   label: 'NVIDIA',     assetType: 'stock',     cat: 'Tech',            icon: '🎮', hasYahoo: true,  hasTV: true  },
  { symbol: 'TSLA',   label: 'Tesla',      assetType: 'stock',     cat: 'Tech',            icon: '⚡', hasYahoo: true,  hasTV: true  },
  { symbol: 'AAPL',   label: 'Apple',      assetType: 'stock',     cat: 'Tech',            icon: '🍎', hasYahoo: true,  hasTV: true  },
  { symbol: 'MSFT',   label: 'Microsoft',  assetType: 'stock',     cat: 'Tech',            icon: '🪟', hasYahoo: true,  hasTV: true  },
  { symbol: 'META',   label: 'Meta',       assetType: 'stock',     cat: 'Tech',            icon: '🌐', hasYahoo: true,  hasTV: true  },
  { symbol: 'AMZN',   label: 'Amazon',     assetType: 'stock',     cat: 'Tech',            icon: '📦', hasYahoo: true,  hasTV: true  },
  { symbol: 'GOOGL',  label: 'Alphabet',   assetType: 'stock',     cat: 'Tech',            icon: '🔍', hasYahoo: true,  hasTV: true  },
  { symbol: 'AMD',    label: 'AMD',        assetType: 'stock',     cat: 'Tech',            icon: '💻', hasYahoo: true,  hasTV: true  },
  { symbol: 'MU',     label: 'Micron',     assetType: 'stock',     cat: 'Tech',            icon: '🔧', hasYahoo: true,  hasTV: true  },
  { symbol: 'INTC',   label: 'Intel',      assetType: 'stock',     cat: 'Tech',            icon: '🔬', hasYahoo: true,  hasTV: true  },
  { symbol: 'CRM',    label: 'Salesforce', assetType: 'stock',     cat: 'Tech',            icon: '☁️', hasYahoo: true,  hasTV: true  },
  { symbol: 'ORCL',   label: 'Oracle',     assetType: 'stock',     cat: 'Tech',            icon: '🗄️', hasYahoo: true,  hasTV: true  },
  { symbol: 'NFLX',   label: 'Netflix',    assetType: 'stock',     cat: 'Tech',            icon: '🎬', hasYahoo: true,  hasTV: true  },
  { symbol: 'UBER',   label: 'Uber',       assetType: 'stock',     cat: 'Tech',            icon: '🚗', hasYahoo: true,  hasTV: true  },
  { symbol: 'COIN',   label: 'Coinbase',   assetType: 'stock',     cat: 'Tech',            icon: '🔶', hasYahoo: true,  hasTV: true  },

  // ── Finance ──────────────────────────────────────────────────────────
  { symbol: 'JPM',    label: 'JPMorgan',   assetType: 'stock',     cat: 'Finance',         icon: '🏦', hasYahoo: true,  hasTV: true  },
  { symbol: 'GS',     label: 'Goldman',    assetType: 'stock',     cat: 'Finance',         icon: '💰', hasYahoo: true,  hasTV: true  },
  { symbol: 'BAC',    label: 'Bank of Am.', assetType: 'stock',    cat: 'Finance',         icon: '🏛️', hasYahoo: true,  hasTV: true  },
  { symbol: 'V',      label: 'Visa',       assetType: 'stock',     cat: 'Finance',         icon: '💳', hasYahoo: true,  hasTV: true  },

  // ── Santé ────────────────────────────────────────────────────────────
  { symbol: 'JNJ',    label: 'J&J',        assetType: 'stock',     cat: 'Santé',           icon: '💊', hasYahoo: true,  hasTV: true  },
  { symbol: 'UNH',    label: 'UnitedHealth', assetType: 'stock',   cat: 'Santé',           icon: '🏥', hasYahoo: true,  hasTV: true  },

  // ── Énergie ──────────────────────────────────────────────────────────
  { symbol: 'XOM',    label: 'ExxonMobil', assetType: 'stock',     cat: 'Énergie',         icon: '⛽', hasYahoo: true,  hasTV: true  },
  { symbol: 'CVX',    label: 'Chevron',    assetType: 'stock',     cat: 'Énergie',         icon: '🛢️', hasYahoo: true,  hasTV: true  },
]

// ── Per-section defaults ──────────────────────────────────────────────────────

export const DEFAULTS = {
  bias:     ['EURUSD', 'XAUUSD', 'NAS100', 'US500', 'NVDA', 'TSLA'],
  charts:   ['NAS100', 'US500', 'EURUSD', 'XAUUSD', 'NVDA', 'TSLA'],
  briefing: ['EURUSD', 'XAUUSD', 'TSLA', 'NVDA', 'AMD', 'MU', 'NAS100', 'US500', 'AAPL', 'META', 'AMZN', 'MSFT', 'GOOGL'],
  news:     ['EURUSD', 'XAUUSD', 'NAS100', 'NVDA', 'TSLA', 'META', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'AMD', 'US500', 'BTCUSD'],
} as const

export type SectionKey = keyof typeof DEFAULTS

const STORAGE_KEYS: Record<SectionKey, string> = {
  bias:     'pref_bias_symbols',
  charts:   'pref_charts_symbols',
  briefing: 'pref_briefing_symbols',
  news:     'pref_news_symbols',
}

// ── Load / Save ───────────────────────────────────────────────────────────────

export function loadSymbols(section: SectionKey): string[] {
  if (typeof window === 'undefined') return [...DEFAULTS[section]]
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[section])
    if (!raw) return [...DEFAULTS[section]]
    const parsed = JSON.parse(raw) as string[]
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {}
  return [...DEFAULTS[section]]
}

export function saveSymbols(section: SectionKey, symbols: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS[section], JSON.stringify(symbols))
}

// ── Lookup helpers ────────────────────────────────────────────────────────────

export function getMeta(symbol: string): SymbolMeta | undefined {
  return SYMBOL_CATALOG.find(s => s.symbol === symbol)
}

export function getCatalogBySection(section: SectionKey): SymbolMeta[] {
  if (section === 'charts') {
    return SYMBOL_CATALOG.filter(s => s.hasTV)
  }
  return SYMBOL_CATALOG.filter(s => s.hasYahoo)
}
