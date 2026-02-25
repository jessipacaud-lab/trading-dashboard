import { NextResponse } from 'next/server'
import { fetchAllSnapshots, YAHOO_MAP } from '@/lib/market-data'

// Re-export types so other routes can import them from here
export type { OHLCVBar, AssetSnapshot } from '@/lib/market-data'

// ── Route ─────────────────────────────────────────────────────────────────────
// GET /api/market-data
// GET /api/market-data?symbols=EURUSD,XAUUSD,NAS100

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const symParam = searchParams.get('symbols')

    let symbols: string[] | undefined
    if (symParam) {
      // Filter to only known symbols to prevent arbitrary requests
      const requested = symParam.split(',').map(s => s.trim().toUpperCase())
      symbols = requested.filter(s => s in YAHOO_MAP)
      if (symbols.length === 0) symbols = undefined
    }

    const snapshots = await fetchAllSnapshots(symbols)
    return NextResponse.json({ snapshots, fromCache: false, fetched: snapshots.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg, snapshots: [] }, { status: 500 })
  }
}
