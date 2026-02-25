import { MOCK_MACRO } from '@/lib/constants'
import { formatPct, generateMacroSummary } from '@/lib/utils'

interface TickerItemProps {
  label:  string
  value:  string
  pct:    number
  extra?: string
}

function TickerItem({ label, value, pct, extra }: TickerItemProps) {
  const pos = pct >= 0
  const color = pos ? '#00e5a0' : '#ff4d6a'
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-surface-900 rounded-lg border border-white/5">
      <div>
        <p className="text-[9px] text-gray-600 uppercase tracking-wider">{label}</p>
        <p className="text-[13px] font-bold text-white">{value}</p>
      </div>
      <div className="ml-auto text-right">
        <p className="text-[11px] font-semibold" style={{ color }}>{formatPct(pct)}</p>
        {extra && <p className="text-[9px] text-gray-600">{extra}</p>}
      </div>
    </div>
  )
}

export function MacroContext() {
  const macro   = MOCK_MACRO
  const summary = generateMacroSummary(macro)

  const riskOff = macro.dxy.changePct > 0.2 && macro.vix.price > 18
  const riskOn  = macro.dxy.changePct < -0.2 && macro.vix.price < 16
  const sentiment = riskOff ? 'Risk-Off 🔴' : riskOn ? 'Risk-On 🟢' : 'Neutre ⚪'
  const sentColor = riskOff ? '#ff4d6a' : riskOn ? '#00e5a0' : '#f59e0b'

  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h2 className="text-[10px] uppercase tracking-widest text-gray-600 font-medium">Contexte Macro Global</h2>
        <span className="text-[10px] font-semibold" style={{ color: sentColor }}>{sentiment}</span>
      </div>

      <div className="p-4">
        {/* Ticker row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
          <TickerItem label="DXY"    value={macro.dxy.price.toFixed(2)}   pct={macro.dxy.changePct}    />
          <TickerItem label="US10Y"  value={`${macro.us10y.price.toFixed(2)}%`} pct={macro.us10y.changePct} extra="Taux 10 ans" />
          <TickerItem label="VIX"    value={macro.vix.price.toFixed(1)}   pct={macro.vix.changePct}    extra="Volatilité" />
          <TickerItem label="SPX"    value={macro.spx.price.toLocaleString()} pct={macro.spx.changePct} />
          <TickerItem label="NAS100" value={macro.nas100.price.toLocaleString()} pct={macro.nas100.changePct} />
          <TickerItem label="GOLD"   value={`$${macro.gold.price.toLocaleString()}`} pct={macro.gold.changePct} />
          <TickerItem label="BTC"    value={`$${macro.btc.price.toLocaleString()}`}  pct={macro.btc.changePct}  />
        </div>

        {/* Summary */}
        <div className="bg-surface-900 rounded-lg p-3 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#a855f7,#00c8ff)' }}>
              <span className="text-[8px] text-white">AI</span>
            </div>
            <span className="text-[9px] text-gray-600 uppercase tracking-wider">Résumé automatique</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">{summary}</p>
        </div>
      </div>
    </section>
  )
}
