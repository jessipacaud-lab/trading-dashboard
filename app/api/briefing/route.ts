import { NextRequest, NextResponse } from 'next/server'
import { BRIEFING_ASSETS } from '@/lib/constants'
import { fetchAllSnapshots, YAHOO_MAP } from '@/lib/market-data'
import type { AssetSnapshot } from '@/lib/market-data'

// Allow up to 180s for this route (Vercel/Next.js App Router)
export const maxDuration = 180

// ── In-memory cache ───────────────────────────────────────────────────────────

const briefingCache = new Map<string, Record<string, unknown>>()

// ── Fetch live market data (direct import, no HTTP round-trip) ────────────────

async function fetchMarketData(symbols?: string[]): Promise<AssetSnapshot[]> {
  try {
    return await fetchAllSnapshots(symbols)
  } catch {
    return []
  }
}

// ── Format one asset snapshot for the prompt ──────────────────────────────────

function formatAssetForPrompt(snap: AssetSnapshot): string {
  const dir = snap.changePct >= 0 ? '▲' : '▼'

  // ── D1 : 3 dernières bougies (structure de fond)
  const d1Lines = snap.barsD1.slice(-3).map(b =>
    `${b.date} O:${b.open} H:${b.high} L:${b.low} C:${b.close}`
  ).join(' | ')

  // ── H1 : 8 dernières bougies (contexte intraday récent)
  const h1Lines = snap.barsH1.slice(-8).map(b =>
    `${b.date.slice(11, 16)} O:${b.open} H:${b.high} L:${b.low} C:${b.close}`
  ).join(' | ')

  // ── H1 trend label
  const trendLabel = snap.h1Trend === 'up'   ? '↑ HAUSSIER'
                   : snap.h1Trend === 'down' ? '↓ BAISSIER'
                   : snap.h1Trend === 'flat' ? '→ LATERAL'
                   : '?'

  return [
    `### ${snap.symbol}`,
    `Prix: ${snap.price} (${dir}${Math.abs(snap.changePct)}%) | Open: ${snap.open} | PrevClose: ${snap.prevClose}`,
    `Range 52S: ${snap.low52w} – ${snap.high52w}`,
    ``,
    `[TENDANCE D1 — structure de fond]`,
    `  EMA20=${snap.ema20 ?? '?'} | EMA50=${snap.ema50 ?? '?'} | RSI14=${snap.rsi14 ?? '?'} | ATR14=${snap.atr14 ?? '?'}`,
    `  D1 (3 bougies): ${d1Lines}`,
    ``,
    `[INTRADAY H1 — momentum du jour]`,
    `  Tendance H1: ${trendLabel} | EMA9=${snap.h1Ema9 ?? '?'} | EMA21=${snap.h1Ema21 ?? '?'} | RSI14=${snap.h1Rsi14 ?? '?'} | ATR14=${snap.h1Atr14 ?? '?'}`,
    `  H1 (8 bougies récentes): ${h1Lines || 'indisponible'}`,
  ].join('\n')
}

// ── Build prompt ──────────────────────────────────────────────────────────────

function buildPrompt(
  snapshots:      AssetSnapshot[],
  customAssets?:  string[],
  slot?:          '8h' | '14h',
  morningContext?: string,
): string {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  const assets = customAssets ?? BRIEFING_ASSETS.map(a => a.symbol)

  // Build market data section — only for symbols we have data for
  const snapshotMap = new Map(snapshots.map(s => [s.symbol, s]))
  const hasData     = snapshots.length > 0

  const marketDataSection = hasData
    ? `\n## DONNÉES DE MARCHÉ EN TEMPS RÉEL (Yahoo Finance, ${time} heure Paris)\n` +
      assets
        .map(sym => snapshotMap.has(sym) ? formatAssetForPrompt(snapshotMap.get(sym)!) : `### ${sym}\n- Données indisponibles`)
        .join('\n')
    : ''

  const dataInstruction = hasData
    ? `Données réelles Yahoo Finance ci-dessous (D1 + H1 authentiques). Utilise EXCLUSIVEMENT ces chiffres.
MÉTHODE D'ANALYSE :
1. D1 (EMA20/50, RSI14) → tendance de fond et structure macro
2. H1 (EMA9/21, RSI14, 8 bougies) → momentum intraday, biais du jour, zones d'entrée précises
3. Croise D1 + H1 : si D1 bullish ET H1 uptrend → forte conviction. Si D1 bullish mais H1 downtrend → attendre pullback H1.
4. Support/résistance : base-toi sur les H/L des bougies H1 et D1 fournies, pas sur des niveaux génériques.
5. RSI H1 > 70 → surachat, prudence long. RSI H1 < 30 → survente, opportunité long.`
    : `Pas de données temps réel. Utilise ta connaissance des niveaux actuels du marché.`

  // Slot-specific instructions
  let slotInstruction = ''
  if (slot === '8h') {
    slotInstruction = `\n## CONTEXTE DU BRIEFING\nBRIEFING PRÉ-MARCHÉ 8H — Analyse initiale de la journée avant l'ouverture des sessions London et New York. Fournis une analyse prospective complète : structure du marché, niveaux clés, biais directionnel et setup du jour.`
  } else if (slot === '14h') {
    const morningCtx = morningContext
      ? `\n## ANALYSE DU BRIEFING DU MATIN (8H)\n${morningContext}\n\n`
      : ''
    slotInstruction = `\n## CONTEXTE DU BRIEFING\nMISE À JOUR MI-SESSION 14H — Les marchés européens sont ouverts depuis plusieurs heures. New York ouvre dans les prochaines minutes.${morningCtx}Compare l'évolution depuis ce matin : note ce qui a changé (prix, structure, momentum, annonces économiques éventuelles). Si la thèse du matin est toujours valide, confirme-la. Si les conditions ont évolué, adapte l'analyse, le biais et les niveaux en conséquence. Mentionne explicitement dans "analysis" si la vue du matin est maintenue ou modifiée.`
  }

  return `Analyste trading senior (forex, tech, indices). ${today}, ${time} Paris.
${slotInstruction}
${dataInstruction}
${marketDataSection}

Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour. Génère les ${assets.length} actifs dans cet ordre : ${assets.join(', ')}.

Format JSON strict (aucun texte hors JSON) :
{"generated_at":"${time}","data_source":"${hasData ? 'live' : 'estimate'}","macro_summary":"3 phrases sur contexte macro : sentiment risk-on/off, DXY, VIX, corrélations clés","assets":[{"symbol":"EURUSD","bias":"bullish|bearish|range|volatile","conviction":7,"price":${hasData ? (snapshots.find(s=>s.symbol==='EURUSD')?.price ?? 0) : 0},"analysis":"1 phrase D1 (tendance fond) + 1 phrase H1 (momentum intraday + RSI H1 + position vs EMA9/21)","support":"niveau H1/D1 précis issu des données","resistance":"niveau H1/D1 précis issu des données","key_level":"niveau critique H1 ou D1 (OB/FVG/Pivot/EMA)","catalysts":["catalyseur1"],"setup":"Entrée précise basée H1 : direction, zone entrée, TP1, SL (en pips ou points selon actif)"}]}`
}

// ── Claude call ───────────────────────────────────────────────────────────────

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  let res: Response
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'x-api-key':         apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-5',
        max_tokens: 5000,
        messages:   [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(120000),
    })
  } catch (e) {
    // Network-level error (DNS, timeout, SSL, etc.)
    const detail = e instanceof Error ? e.message : String(e)
    throw new Error(`Impossible de joindre l'API Anthropic : ${detail}. Vérifiez votre connexion internet.`)
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    let msg = `Erreur HTTP ${res.status}`
    try {
      const parsed = JSON.parse(body) as { error?: { message?: string; type?: string } }
      if (res.status === 401) msg = `Clé API invalide ou expirée. Vérifiez votre clé Anthropic (sk-ant-…) dans le champ en haut du briefing.`
      else if (res.status === 403) msg = `Accès refusé. Votre clé n'a pas accès au modèle demandé.`
      else if (res.status === 429) msg = `Quota API dépassé. Réessayez dans quelques minutes.`
      else if (parsed.error?.message) msg = parsed.error.message
    } catch { /* ignore parse error */ }
    throw new Error(msg)
  }

  const result = await res.json()
  return (result.content?.[0]?.text ?? '') as string
}

// ── Parse JSON robustly ───────────────────────────────────────────────────────

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse JSON invalide de Claude.')
    return JSON.parse(match[0])
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { forceRefresh } = body

  // Briefing slot: '8h' | '14h' (defaults to '14h' for backward compat)
  const slot: '8h' | '14h' = body.slot === '8h' ? '8h' : '14h'

  // Morning context (8H macro_summary) for the 14H update
  const morningContext: string | undefined =
    typeof body.morningContext === 'string' && body.morningContext.trim().length > 0
      ? body.morningContext.trim()
      : undefined

  // Use key from request body, fallback to env var
  const apiKey: string = (body.apiKey ?? '').trim() || (process.env.ANTHROPIC_API_KEY ?? '').trim()

  // Optional custom asset list from client preferences
  let customAssets: string[] | undefined
  if (Array.isArray(body.assets) && body.assets.length > 0) {
    // Filter to only symbols we have Yahoo mapping for (security: no arbitrary symbols)
    customAssets = (body.assets as string[])
      .map((s: string) => s.trim().toUpperCase())
      .filter((s: string) => s in YAHOO_MAP)
      .slice(0, 20) // cap at 20 to avoid excessively long prompts
    if (customAssets.length === 0) customAssets = undefined
  }

  if (!apiKey || !apiKey.startsWith('sk-')) {
    return NextResponse.json({
      error: 'Clé API Anthropic manquante ou invalide. Entrez votre clé sk-ant-… dans le champ en haut, ou ajoutez ANTHROPIC_API_KEY dans .env.local'
    }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  // Cache key depends on date, slot and asset selection
  const assetSuffix = customAssets ? `_${customAssets.join(',')}` : ''
  const cacheKey    = `${today}_${slot}${assetSuffix}`

  // Serve from cache if available
  if (!forceRefresh && briefingCache.has(cacheKey)) {
    return NextResponse.json({ ...briefingCache.get(cacheKey), fromCache: true })
  }

  // 1. Fetch real market data for the requested assets
  const snapshots = await fetchMarketData(customAssets)

  // 2. Build prompt with real data injected (slot-aware)
  const prompt = buildPrompt(snapshots, customAssets, slot, morningContext)

  // 3. Call Claude
  let rawText: string
  try {
    rawText = await callClaude(apiKey, prompt)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Erreur inconnue'
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  // 4. Parse response
  let briefing: Record<string, unknown>
  try {
    briefing = parseJSON(rawText)
  } catch {
    return NextResponse.json({ error: 'Réponse JSON invalide de Claude. Réessayez.' }, { status: 500 })
  }

  if (!briefing.generated_at) {
    briefing.generated_at = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  // Embed slot in the response for client-side tracking
  briefing.slot = slot

  // 5. Cache & return
  briefingCache.set(cacheKey, briefing)
  return NextResponse.json(briefing)
}
