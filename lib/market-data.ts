// yahoo-finance2 v3: must use `new` and call chart() instead of historical()
// We use a dynamic require to get the class properly in CJS context
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YFClass = require('yahoo-finance2').default as new (opts?: Record<string, unknown>) => {
  quote(ticker: string, opts?: Record<string, unknown>, mods?: Record<string, unknown>): Promise<Record<string, unknown>>
  chart(ticker: string, opts: Record<string, unknown>, mods?: Record<string, unknown>): Promise<Record<string, unknown>>
}

const yf = new YFClass({ suppressNotices: ['yahooSurvey', 'ripHistorical'] })

// ── Ticker mapping ────────────────────────────────────────────────────────────

export const YAHOO_MAP: Record<string, string> = {
  // ── Forex ────────────────────────────────────────────────────────────
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
  USDJPY: 'JPY=X',
  USDCHF: 'CHF=X',
  AUDUSD: 'AUDUSD=X',
  USDCAD: 'CAD=X',
  NZDUSD: 'NZDUSD=X',
  EURGBP: 'EURGBP=X',
  EURJPY: 'EURJPY=X',
  GBPJPY: 'GBPJPY=X',

  // ── Indices ──────────────────────────────────────────────────────────
  NAS100: '^NDX',
  US500:  '^GSPC',
  US30:   '^DJI',
  UK100:  '^FTSE',
  GER40:  '^GDAXI',
  FRA40:  '^FCHI',
  JP225:  '^N225',

  // ── Commodités ───────────────────────────────────────────────────────
  XAUUSD: 'GC=F',
  XAGUSD: 'SI=F',
  USOIL:  'CL=F',
  UKOIL:  'BZ=F',
  NATGAS: 'NG=F',

  // ── Crypto ───────────────────────────────────────────────────────────
  BTCUSD: 'BTC-USD',
  ETHUSD: 'ETH-USD',

  // ── Actions Tech ─────────────────────────────────────────────────────
  NVDA:   'NVDA',
  TSLA:   'TSLA',
  AAPL:   'AAPL',
  MSFT:   'MSFT',
  META:   'META',
  AMZN:   'AMZN',
  GOOGL:  'GOOGL',
  AMD:    'AMD',
  MU:     'MU',
  INTC:   'INTC',
  CRM:    'CRM',
  ORCL:   'ORCL',
  NFLX:   'NFLX',
  UBER:   'UBER',
  COIN:   'COIN',

  // ── Finance ──────────────────────────────────────────────────────────
  JPM:    'JPM',
  GS:     'GS',
  BAC:    'BAC',
  V:      'V',

  // ── Santé ────────────────────────────────────────────────────────────
  JNJ:    'JNJ',
  UNH:    'UNH',

  // ── Énergie ──────────────────────────────────────────────────────────
  XOM:    'XOM',
  CVX:    'CVX',
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OHLCVBar {
  date:   string
  open:   number
  high:   number
  low:    number
  close:  number
  volume: number
}

export interface AssetSnapshot {
  symbol:      string
  ticker:      string
  price:       number
  open:        number
  prevClose:   number
  high52w:     number
  low52w:      number
  changePct:   number
  barsD1:      OHLCVBar[]
  barsH1:      OHLCVBar[]   // vraies barres H1 (48 dernières)
  // Indicateurs D1 (tendance de fond)
  ema20:       number | null
  ema50:       number | null
  rsi14:       number | null
  atr14:       number | null
  // Indicateurs H1 (intraday)
  h1Ema9:      number | null
  h1Ema21:     number | null
  h1Rsi14:     number | null
  h1Atr14:     number | null
  h1Trend:     'up' | 'down' | 'flat' | null  // EMA9 vs EMA21
}

// ── Calculs techniques ────────────────────────────────────────────────────────

function calcEMA(closes: number[], period: number): number | null {
  if (closes.length < period) return null
  const k = 2 / (period + 1)
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k)
  }
  return Math.round(ema * 10000) / 10000
}

function calcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains  += diff
    else          losses -= diff
  }
  let avgGain = gains / period
  let avgLoss = losses / period
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period
  }
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10
}

function calcATR(bars: OHLCVBar[], period = 14): number | null {
  if (bars.length < period + 1) return null
  const trs: number[] = []
  for (let i = 1; i < bars.length; i++) {
    const hl  = bars[i].high - bars[i].low
    const hpc = Math.abs(bars[i].high  - bars[i - 1].close)
    const lpc = Math.abs(bars[i].low   - bars[i - 1].close)
    trs.push(Math.max(hl, hpc, lpc))
  }
  const atr = trs.slice(-period).reduce((a, b) => a + b, 0) / period
  return Math.round(atr * 10000) / 10000
}

// ── Parse chart() response into OHLCVBar[] ────────────────────────────────────
// yahoo-finance2 v3 chart() returns { meta, quotes: [{date,open,high,low,close,volume}], events }

interface ChartQuote {
  date:   Date | string
  open?:  number
  high?:  number
  low?:   number
  close:  number
  volume?: number
}

function parseChartBars(chartResult: Record<string, unknown>): OHLCVBar[] {
  const quotes = (chartResult.quotes as ChartQuote[]) ?? []
  return quotes
    .filter(q => q.close != null && q.close > 0)
    .map(q => {
      const d = q.date instanceof Date ? q.date : new Date(q.date)
      return {
        date:   d.toISOString().slice(0, 10),
        open:   Math.round(((q.open  ?? q.close)) * 10000) / 10000,
        high:   Math.round(((q.high  ?? q.close)) * 10000) / 10000,
        low:    Math.round(((q.low   ?? q.close)) * 10000) / 10000,
        close:  Math.round(q.close                * 10000) / 10000,
        volume: q.volume ?? 0,
      }
    })
}

// ── Build snapshot ────────────────────────────────────────────────────────────

export async function buildSnapshot(symbol: string): Promise<AssetSnapshot> {
  const ticker  = YAHOO_MAP[symbol]
  if (!ticker) throw new Error(`No ticker for ${symbol}`)

  // D1: 3 months for indicators
  const period1D1 = new Date(Date.now() - 92 * 24 * 60 * 60 * 1000)
  // H1: last 7 days (Yahoo allows up to 60d for 1h interval)
  const period1H1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Fetch quote + D1 chart + H1 chart in parallel
  const [quoteRaw, chartD1Raw, chartH1Raw] = await Promise.all([
    yf.quote(ticker, {}, { validateResult: false }),
    yf.chart(ticker, { period1: period1D1.toISOString().slice(0, 10), interval: '1d'  }, { validateResult: false }),
    yf.chart(ticker, { period1: period1H1.toISOString().slice(0, 10), interval: '1h'  }, { validateResult: false })
      .catch(() => ({ quotes: [] } as Record<string, unknown>)), // fallback if H1 unavailable
  ])

  const barsD1All  = parseChartBars(chartD1Raw)
  const barsD1     = barsD1All.slice(-60)
  const last10D1   = barsD1.slice(-10)
  const closesD1   = barsD1.map(b => b.close)

  // Real H1 bars — last 48 candles (2 trading days)
  const barsH1All  = parseChartBars(chartH1Raw)
  const barsH1     = barsH1All.slice(-48)
  const closesH1   = barsH1.map(b => b.close)

  // H1 trend from EMA9 vs EMA21
  const h1Ema9  = calcEMA(closesH1, 9)
  const h1Ema21 = calcEMA(closesH1, 21)
  let h1Trend: 'up' | 'down' | 'flat' | null = null
  if (h1Ema9 !== null && h1Ema21 !== null) {
    const diff = (h1Ema9 - h1Ema21) / h1Ema21
    if (diff > 0.0005)       h1Trend = 'up'
    else if (diff < -0.0005) h1Trend = 'down'
    else                     h1Trend = 'flat'
  }

  const q         = quoteRaw
  const chartMeta = (chartD1Raw.meta as Record<string, unknown>) ?? {}
  const price     = (q.regularMarketPrice          as number)
                 ?? (chartMeta.regularMarketPrice   as number)
                 ?? closesD1[closesD1.length - 1] ?? 0
  const prevClose = (q.regularMarketPreviousClose  as number)
                 ?? (chartMeta.chartPreviousClose   as number)
                 ?? closesD1[closesD1.length - 2] ?? 0
  const open      = (q.regularMarketOpen           as number)
                 ?? last10D1[last10D1.length - 1]?.open ?? 0
  const high52w   = (q.fiftyTwoWeekHigh            as number)
                 ?? (chartMeta.fiftyTwoWeekHigh     as number)
                 ?? (closesD1.length ? Math.max(...closesD1) : 0)
  const low52w    = (q.fiftyTwoWeekLow             as number)
                 ?? (chartMeta.fiftyTwoWeekLow      as number)
                 ?? (closesD1.length ? Math.min(...closesD1) : 0)
  const changePct = prevClose > 0 ? Math.round(((price - prevClose) / prevClose) * 10000) / 100 : 0

  return {
    symbol,
    ticker,
    price:     Math.round(price     * 10000) / 10000,
    open:      Math.round(open      * 10000) / 10000,
    prevClose: Math.round(prevClose * 10000) / 10000,
    high52w:   Math.round(high52w   * 100)   / 100,
    low52w:    Math.round(low52w    * 100)   / 100,
    changePct,
    barsD1:    last10D1,
    barsH1,
    // D1 indicators (tendance de fond)
    ema20:     calcEMA(closesD1, 20),
    ema50:     calcEMA(closesD1, 50),
    rsi14:     calcRSI(closesD1),
    atr14:     calcATR(barsD1),
    // H1 indicators (intraday)
    h1Ema9,
    h1Ema21,
    h1Rsi14:   calcRSI(closesH1),
    h1Atr14:   calcATR(barsH1),
    h1Trend,
  }
}

// ── Cache + staggered fetch ───────────────────────────────────────────────────

const g = globalThis as typeof globalThis & {
  _mdCache?: Map<string, { snapshot: AssetSnapshot; ts: number }>
}

const CACHE_TTL = 10 * 60 * 1000 // 10 min

function getCache(): Map<string, { snapshot: AssetSnapshot; ts: number }> {
  if (!g._mdCache) g._mdCache = new Map()
  return g._mdCache
}

async function fetchStaggered(symbols: string[]): Promise<AssetSnapshot[]> {
  const cache     = getCache()
  const snapshots: AssetSnapshot[] = []
  for (const sym of symbols) {
    const cached = cache.get(sym)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      snapshots.push(cached.snapshot)
      continue
    }
    try {
      const snap = await buildSnapshot(sym)
      cache.set(sym, { snapshot: snap, ts: Date.now() })
      snapshots.push(snap)
    } catch {
      // skip failed symbols silently
    }
    await new Promise(r => setTimeout(r, 250))
  }
  return snapshots
}

// Fetch a specific list of symbols (or all known if none provided)
export async function fetchAllSnapshots(symbols?: string[]): Promise<AssetSnapshot[]> {
  const toFetch = symbols ?? Object.keys(YAHOO_MAP)
  return fetchStaggered(toFetch)
}
