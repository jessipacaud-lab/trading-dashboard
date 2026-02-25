import type { AssetType, BiasType, MacroSnapshot } from './types'
import { formatPct } from './utils'

// Types locaux au scoring engine
interface ScoringInput  { symbol: string; assetType: AssetType; macro: MacroSnapshot }
interface ScoringResult { symbol: string; bias: BiasType; confidence: number; reasons: string[]; focusDuJour: string }

// ═══════════════════════════════════════════════════════════════════════════
//  Scoring Engine V1 — Règles transparentes, aucune boîte noire
//  Score 0–100 : ≥65 = bullish, ≤35 = bearish, sinon range/volatile
// ═══════════════════════════════════════════════════════════════════════════

export function computeBias(input: ScoringInput): ScoringResult {
  const { symbol, assetType, macro } = input
  const reasons: string[] = []
  let score = 50  // point neutre

  // ── Indicateurs macro ──────────────────────────────────────────────────

  const dxyUp    = macro.dxy.changePct   >  0.2
  const dxyDown  = macro.dxy.changePct   < -0.2
  const vixHigh  = macro.vix.price       >  20
  const vixLow   = macro.vix.price       <  15
  const vixSpike = macro.vix.changePct   >  5
  const yieldUp  = macro.us10y.changePct >  0.5
  const yieldDown= macro.us10y.changePct < -0.5
  const riskOff  = dxyUp && vixHigh && yieldUp
  const riskOn   = dxyDown && vixLow && !yieldUp

  // ── Règle 1 : Régime Risk-off ──────────────────────────────────────────

  if (riskOff) {
    if (assetType === 'index') {
      score -= 20
      reasons.push(`Risk-off confirmé : DXY ${formatPct(macro.dxy.changePct)}, VIX ${macro.vix.price.toFixed(1)}, US10Y ↑ — indices sous pression`)
    }
    if (assetType === 'stock') {
      score -= 15
      reasons.push(`Environnement risk-off défavorable aux actions cycliques et tech`)
    }
    if (symbol === 'XAUUSD') {
      score += 8
      reasons.push(`Risk-off → demande refuge sur l'or (corrélation historique positive)`)
    }
    if (assetType === 'fx' && (symbol.startsWith('EUR') || symbol.startsWith('GBP'))) {
      score -= 15
      reasons.push(`Risk-off + DXY fort → pression sur EUR/USD et GBP/USD`)
    }
  }

  // ── Règle 2 : Régime Risk-on ───────────────────────────────────────────

  if (riskOn) {
    if (assetType === 'index') {
      score += 15
      reasons.push(`Risk-on : DXY faible, VIX bas — contexte favorable aux indices`)
    }
    if (assetType === 'stock') {
      score += 12
      reasons.push(`Appétit pour le risque élevé → rotation vers les actions tech et growth`)
    }
  }

  // ── Règle 3 : Direction DXY ────────────────────────────────────────────

  if (dxyUp && reasons.length < 3) {
    if (symbol === 'EURUSD') { score -= 12; reasons.push(`DXY haussier (${formatPct(macro.dxy.changePct)}) → pression directe sur EUR/USD`) }
    if (symbol === 'XAUUSD') { score -= 8;  reasons.push(`DXY fort → corrélation négative avec l'or (libellé en USD)`) }
  }
  if (dxyDown && reasons.length < 3) {
    if (symbol === 'EURUSD') { score += 12; reasons.push(`DXY baissier (${formatPct(macro.dxy.changePct)}) → support pour EUR/USD`) }
    if (symbol === 'XAUUSD') { score += 10; reasons.push(`DXY faible → corrélation positive, or favorisé`) }
  }

  // ── Règle 4 : Régime VIX ──────────────────────────────────────────────

  if (vixHigh && reasons.length < 3) {
    if (assetType === 'index' || assetType === 'stock') {
      score -= 8
      reasons.push(`VIX élevé (${macro.vix.price.toFixed(1)}) → volatilité accrue, couvertures actives`)
    }
  }
  if (vixLow && reasons.length < 3) {
    if (assetType === 'index') {
      score += 8
      reasons.push(`VIX faible (${macro.vix.price.toFixed(1)}) → marché complaisant, tendance haussière favorisée`)
    }
  }
  if (vixSpike && reasons.length < 3) {
    reasons.push(`Spike VIX (+${formatPct(macro.vix.changePct)}) → attention aux mouvements brusques intraday`)
  }

  // ── Règle 5 : NAS100 momentum pour les actions tech ───────────────────

  if (assetType === 'stock' && reasons.length < 3) {
    if (macro.nas100.changePct > 0.5) {
      score += 10
      reasons.push(`NAS100 en hausse (${formatPct(macro.nas100.changePct)}) → momentum sectoriel favorable tech`)
    } else if (macro.nas100.changePct < -0.5) {
      score -= 10
      reasons.push(`NAS100 en baisse (${formatPct(macro.nas100.changePct)}) → pression sur les actions tech`)
    }
  }

  // ── Règle 6 : Taux US10Y ──────────────────────────────────────────────

  if (yieldUp && reasons.length < 3) {
    if (assetType === 'index' || assetType === 'stock') {
      score -= 7
      reasons.push(`US10Y en hausse (${macro.us10y.price.toFixed(2)}%) → valorisations compressées, pression sur les multiples`)
    }
    if (symbol === 'XAUUSD') {
      score -= 5
      reasons.push(`Yields en hausse → coût d'opportunité de l'or augmente`)
    }
  }
  if (yieldDown && reasons.length < 3) {
    if (assetType === 'index') {
      score += 7
      reasons.push(`US10Y en baisse → conditions financières plus accommodantes`)
    }
    if (symbol === 'XAUUSD') {
      score += 7
      reasons.push(`Yields en baisse → or attractif vs obligations`)
    }
  }

  // ── Règle 7 : Gold momentum pour XAUUSD ──────────────────────────────

  if (symbol === 'XAUUSD' && reasons.length < 3) {
    if (macro.gold.changePct > 0.3) {
      score += 5
      reasons.push(`Momentum or intraday positif (${formatPct(macro.gold.changePct)}) — structure haussière`)
    }
  }

  // ── Fallback reason ────────────────────────────────────────────────────

  if (reasons.length === 0) {
    reasons.push(`Contexte macro neutre — DXY ${formatPct(macro.dxy.changePct)}, VIX ${macro.vix.price.toFixed(1)}`)
  }

  // ── Dériver le biais ───────────────────────────────────────────────────

  const bias: BiasType =
    score >= 65  ? 'bullish'  :
    score <= 35  ? 'bearish'  :
    vixSpike     ? 'volatile' : 'range'

  const confidence = Math.min(100, Math.max(30, Math.abs(score - 50) * 2.5 + 30))

  return {
    symbol,
    bias,
    confidence:  Math.round(confidence),
    reasons:     reasons.slice(0, 3),
    focusDuJour: buildFocus(symbol, bias, macro),
  }
}

function buildFocus(symbol: string, bias: BiasType, macro: MacroSnapshot): string {
  const bullFocus: Record<string, string> = {
    EURUSD: 'Watch résistance 1.0880 — cassure confirme prolongation vers 1.0950',
    XAUUSD: 'Zone 2320–2340 clé en résistance — breakout = run vers 2380',
    NAS100: 'Support 21200 à tenir — momentum long si >21400 en M15',
    US500:  'Breakout du range 5080–5100 déclencherait accélération vers 5150',
  }
  const bearFocus: Record<string, string> = {
    EURUSD: 'Support 1.0780 sous surveillance — cassure = target 1.0720',
    XAUUSD: 'Break <2290 validerait range baissier vers 2260–2250',
    NAS100: 'Échec <21200 = short vers 20950 — SL serré au-dessus 21300',
    US500:  'Résistance 5080 tient — short sur rejet vers 4980',
  }
  if (bias === 'bullish' && bullFocus[symbol]) return bullFocus[symbol]
  if (bias === 'bearish' && bearFocus[symbol]) return bearFocus[symbol]
  if (bias === 'volatile') return `Volatilité élevée aujourd'hui — attendre la clôture d'une bougie H1 avant positionnement`
  return `Range en cours — identifier les extrêmes pour un setup de breakout ou fade`
}

// ── Batch compute pour la watchlist entière ───────────────────────────────────

export function computeAllBiases(
  watchlist: { symbol: string; asset_type: string }[],
  macro: MacroSnapshot
): ScoringResult[] {
  return watchlist.map(item => computeBias({
    symbol:    item.symbol,
    assetType: item.asset_type as import('./types').AssetType,
    macro,
  }))
}
