import { cn, formatPrice, formatPct } from '@/lib/utils'
import { ASSET_TYPE_COLORS } from '@/lib/constants'
import { BiasBadge } from '@/components/ui/BiasBadge'
import { Sparkline } from '@/components/ui/Sparkline'
import type { MarketQuote, AssetType, BiasType } from '@/lib/types'

interface MarketCardProps {
  quote:     MarketQuote
  assetType: AssetType
  bias?:     BiasType
  active?:   boolean
  className?: string
}

export function MarketCard({ quote, assetType, bias, active, className }: MarketCardProps) {
  const pos   = quote.changePct >= 0
  const color = pos ? '#00e5a0' : '#ff4d6a'
  const typeColor = ASSET_TYPE_COLORS[assetType]

  return (
    <div className={cn(
      'bg-surface-800 border rounded-xl p-3 cursor-pointer transition-all duration-200',
      active
        ? 'border-[#00c8ff44] shadow-glow-cyan'
        : 'border-white/5 hover:border-[#00c8ff33] hover:shadow-glow-cyan',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-3 rounded-full flex-shrink-0" style={{ background: typeColor }} />
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">{quote.symbol}</span>
        </div>
        {bias && <BiasBadge bias={bias} size="sm" />}
      </div>

      {/* Price */}
      <p className="text-lg font-bold text-white tracking-tight mb-1">
        {formatPrice(quote.price)}
      </p>

      {/* Change + Sparkline */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color }}>
          {formatPct(quote.changePct)}
        </span>
        <Sparkline data={quote.sparkline} color={color} width={48} height={20} />
      </div>
    </div>
  )
}
