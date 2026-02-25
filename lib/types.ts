// ═══════════════════════════════════════════════════════════════════════════
//  Types — Apex Trading Desk
// ═══════════════════════════════════════════════════════════════════════════

export type AssetType    = 'stock' | 'index' | 'fx' | 'commodity'
export type BiasType     = 'bullish' | 'bearish' | 'range' | 'volatile' | 'neutral'
export type Importance   = 'high' | 'medium' | 'low'
export type Session      = 'asia' | 'london' | 'newyork' | 'overlap' | 'off'
export type BriefingState = 'waiting' | 'loading' | 'error' | 'ready'
export type GlowVariant  = 'cyan' | 'green' | 'red' | 'purple' | 'amber' | 'none'

// ── Market Data ───────────────────────────────────────────────────────────────

export interface MarketQuote {
  symbol:    string
  price:     number
  change:    number
  changePct: number
  sparkline: number[]
}

export interface MacroSnapshot {
  dxy:    MarketQuote
  us10y:  MarketQuote
  vix:    MarketQuote
  spx:    MarketQuote
  nas100: MarketQuote
  gold:   MarketQuote
  btc:    MarketQuote
}

// ── AI Briefing ───────────────────────────────────────────────────────────────

export interface AssetBriefing {
  symbol:       string
  bias:         BiasType
  conviction:   number
  analysis:     string
  support:      string
  resistance:   string
  key_level?:   string
  catalysts:    string[]
  setup:        string
  price?:       number
  data_source?: string
}

export interface DailyBriefing {
  generated_at:  string
  macro_summary: string
  assets:        AssetBriefing[]
  fromCache?:    boolean
  isDemo?:       boolean
}

// ── Economic Calendar ─────────────────────────────────────────────────────────

export interface CalendarEvent {
  id:             string
  time:           string
  currency:       string
  importance:     Importance
  title:          string
  forecast:       string | null
  previous:       string | null
  actual:         string | null
  impactsSymbols: string[]
}

// ── News ──────────────────────────────────────────────────────────────────────

export interface NewsItem {
  title:   string
  link:    string
  pubDate: string  // ISO string ou date string brute RSS
  source:  string
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export interface ChecklistItemType {
  id:         string
  user_id:    string
  label:      string
  sort_order: number
  is_active:  boolean
  created_at: string
}

export interface ChecklistCompletion {
  id:             string
  user_id:        string
  item_id:        string
  completed_date: string
  completed_at:   string
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface SessionInfo {
  current:       Session
  label:         string
  color:         string
  nextSession:   Session
  nextLabel:     string
  minutesToNext: number
}

