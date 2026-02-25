import { NextRequest, NextResponse } from 'next/server'
import type { NewsItem } from '@/lib/types'

// ── Yahoo Finance ticker mapping ──────────────────────────────────────────────

const YAHOO_TICKER: Record<string, string> = {
  // Forex
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
  // Indices
  NAS100: '%5ENDX',
  US500:  '%5EGSPC',
  US30:   '%5EDJI',
  UK100:  '%5EFTSE',
  GER40:  '%5EGDAXI',
  FRA40:  '%5EFCHI',
  JP225:  '%5EN225',
  // Commodités
  XAUUSD: 'GC=F',
  XAGUSD: 'SI=F',
  USOIL:  'CL=F',
  UKOIL:  'BZ=F',
  NATGAS: 'NG=F',
  // Crypto
  BTCUSD: 'BTC-USD',
  ETHUSD: 'ETH-USD',
  // Actions Tech
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
  // Finance
  JPM:    'JPM',
  GS:     'GS',
  BAC:    'BAC',
  V:      'V',
  // Santé
  JNJ:    'JNJ',
  UNH:    'UNH',
  // Énergie
  XOM:    'XOM',
  CVX:    'CVX',
}

// ── In-memory cache ───────────────────────────────────────────────────────────

const g = globalThis as typeof globalThis & {
  _newsCache?: Map<string, { items: NewsItem[]; ts: number }>
}
if (!g._newsCache) g._newsCache = new Map()

const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

// ── XML parser (sans dépendance externe) ──────────────────────────────────────

function parseRSS(xml: string): NewsItem[] {
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

  return itemMatches.slice(0, 6).map(item => {
    const title =
      item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ??
      ''

    const link =
      item.match(/<link>([\s\S]*?)<\/link>/)?.[1] ??
      item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ??
      '#'

    const pubDate =
      item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? ''

    const source =
      item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ??
      item.match(/<publisher>([\s\S]*?)<\/publisher>/)?.[1] ??
      'Yahoo Finance'

    return {
      title:   title.trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
      link:    link.trim(),
      pubDate: pubDate.trim(),
      source:  source.trim(),
    }
  }).filter(item => item.title.length > 0)
}

// ── Mock news fallback ────────────────────────────────────────────────────────

function getMockNews(symbol: string): NewsItem[] {
  const now   = new Date()
  const h1ago = new Date(now.getTime() - 3600000).toUTCString()
  const h3ago = new Date(now.getTime() - 10800000).toUTCString()
  const h6ago = new Date(now.getTime() - 21600000).toUTCString()

  const mocks: Record<string, NewsItem[]> = {
    EURUSD: [
      { title: 'EUR/USD : L\'euro consolide avant les données CPI américaines', link: '#', pubDate: h1ago, source: 'ForexLive' },
      { title: 'Fed : Hawkish tone maintenu, pression sur les devises majeures', link: '#', pubDate: h3ago, source: 'Reuters' },
      { title: 'BCE : Les minutes suggèrent une pause dans les hausses de taux', link: '#', pubDate: h6ago, source: 'Bloomberg' },
      { title: 'Zone Euro : PMI Services au-dessus des attentes à 52.4', link: '#', pubDate: h6ago, source: 'MarketWatch' },
    ],
    XAUUSD: [
      { title: 'Or : Résistance clé des 2340$ testée dans les échanges asiatiques', link: '#', pubDate: h1ago, source: 'Kitco' },
      { title: 'Gold : Les banques centrales maintiennent leurs achats record', link: '#', pubDate: h3ago, source: 'Reuters' },
      { title: 'XAUUSD : Corrélation inverse avec le DXY reste forte', link: '#', pubDate: h6ago, source: 'ForexFactory' },
      { title: 'Métaux précieux : WGC rapport T1 — demande en hausse de 3%', link: '#', pubDate: h6ago, source: 'World Gold Council' },
    ],
    NVDA: [
      { title: 'NVIDIA : Demande GPU H200 dépasse l\'offre selon les analystes', link: '#', pubDate: h1ago, source: 'Bloomberg' },
      { title: 'NVDA : Price target relevé à $950 par Morgan Stanley', link: '#', pubDate: h3ago, source: 'CNBC' },
      { title: 'Intelligence Artificielle : NVIDIA consolide sa position dominante dans les datacenters', link: '#', pubDate: h6ago, source: 'WSJ' },
      { title: 'NVDA : Partenariat stratégique annoncé avec un major cloud provider', link: '#', pubDate: h6ago, source: 'TechCrunch' },
    ],
    NAS100: [
      { title: 'Nasdaq 100 : Les Magnificent 7 portent l\'indice vers de nouveaux sommets', link: '#', pubDate: h1ago, source: 'Bloomberg' },
      { title: 'Tech sector : Rotation vers les valeurs IA et semi-conducteurs', link: '#', pubDate: h3ago, source: 'Reuters' },
      { title: 'NAS100 : Support 21200 tenu, momentum haussier intact', link: '#', pubDate: h6ago, source: 'TradingView' },
      { title: 'Fed : Scenario "higher for longer" pèse sur les valorisations growth', link: '#', pubDate: h6ago, source: 'FT' },
    ],
    TSLA: [
      { title: 'Tesla : Livraisons Q1 sous les attentes, -8% en prémarket', link: '#', pubDate: h1ago, source: 'Reuters' },
      { title: 'TSLA : Musk annonce focus sur l\'autonomie et les robots', link: '#', pubDate: h3ago, source: 'Bloomberg' },
      { title: 'Tesla : Compétition EV chinoise (BYD) gagne des parts de marché', link: '#', pubDate: h6ago, source: 'WSJ' },
    ],
  }

  return mocks[symbol] ?? [
    { title: `${symbol} : Marché en observation avant les données économiques clés`, link: '#', pubDate: h1ago, source: 'Markets' },
    { title: `${symbol} : Volumes modérés, consolidation en cours`, link: '#', pubDate: h3ago, source: 'Bloomberg' },
    { title: `${symbol} : Niveaux techniques importants à surveiller cette semaine`, link: '#', pubDate: h6ago, source: 'TradingView' },
  ]
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = (searchParams.get('symbol') ?? '').toUpperCase()

  if (!symbol) {
    return NextResponse.json({ error: 'symbol requis' }, { status: 400 })
  }

  // Cache check
  const cached = g._newsCache!.get(symbol)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ items: cached.items, fromCache: true })
  }

  const ticker = YAHOO_TICKER[symbol]

  if (!ticker) {
    // Symbol non mappé → mock
    const items = getMockNews(symbol)
    g._newsCache!.set(symbol, { items, ts: Date.now() })
    return NextResponse.json({ items, source: 'mock' })
  }

  // Fetch RSS Yahoo Finance
  let items: NewsItem[]
  try {
    const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${ticker}&lang=fr-FR&region=FR`
    const res = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TradingBot/1.0)',
        'Accept':     'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(6000),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    items = parseRSS(xml)

    if (items.length === 0) {
      items = getMockNews(symbol)
    }
  } catch {
    items = getMockNews(symbol)
  }

  g._newsCache!.set(symbol, { items, ts: Date.now() })
  return NextResponse.json({ items, source: items === getMockNews(symbol) ? 'mock' : 'live' })
}
