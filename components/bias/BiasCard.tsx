import { BiasBadge } from '@/components/ui/BiasBadge'
import { ConvictionBar } from '@/components/ui/ConvictionBar'
import { BRIEFING_ASSETS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { AssetBriefing } from '@/lib/types'

interface BiasCardProps {
  asset:     AssetBriefing
  className?: string
}

export function BiasCard({ asset, className }: BiasCardProps) {
  const meta = BRIEFING_ASSETS.find(a => a.symbol === asset.symbol)
  const cats = (asset.catalysts ?? []).slice(0, 3)

  return (
    <div className={cn(
      'bg-surface-900 border border-white/5 rounded-xl p-3 flex flex-col gap-2.5',
      'transition-all duration-200 hover:border-[#00c8ff33] hover:shadow-glow-cyan cursor-default',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{meta?.icon ?? '📊'}</span>
          <div>
            <p className="text-[11px] text-white font-semibold leading-tight">{meta?.label ?? asset.symbol}</p>
            <p className="text-[9px] text-gray-600">{meta?.cat ?? 'Actif'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {asset.price != null && (
            <span className="text-[9px] font-mono text-gray-500 tabular-nums">
              {asset.price.toLocaleString('en-US', { maximumFractionDigits: 4 })}
            </span>
          )}
          <BiasBadge bias={asset.bias} size="sm" />
        </div>
      </div>

      {/* Conviction */}
      <div>
        <div className="flex justify-between text-[9px] text-gray-600 mb-1">
          <span>Conviction</span>
          <span className="font-semibold" style={{
            color: asset.conviction >= 7 ? '#00e5a0' : asset.conviction >= 4 ? '#f59e0b' : '#ff4d6a'
          }}>{asset.conviction}/10</span>
        </div>
        <ConvictionBar value={asset.conviction} max={10} />
      </div>

      {/* Analysis */}
      <p className="text-[10px] text-gray-400 leading-relaxed">{asset.analysis}</p>

      {/* Levels */}
      <div className="grid grid-cols-2 gap-1.5 text-[9px]">
        <div className="bg-surface-800 rounded-lg px-2 py-1.5">
          <span className="text-gray-600 block">Support</span>
          <span className="text-accent-green font-semibold">{asset.support}</span>
        </div>
        <div className="bg-surface-800 rounded-lg px-2 py-1.5">
          <span className="text-gray-600 block">Résistance</span>
          <span className="text-accent-red font-semibold">{asset.resistance}</span>
        </div>
      </div>

      {/* Key Level */}
      {asset.key_level && (
        <div className="bg-surface-800 rounded-lg px-2 py-1.5 text-[9px]">
          <span className="text-gray-600 block">Zone clé (OB/FVG/Pivot)</span>
          <span className="text-amber-400 font-semibold">{asset.key_level}</span>
        </div>
      )}

      {/* Catalysts */}
      {cats.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cats.map(c => (
            <span key={c} className="text-[8px] px-1.5 py-0.5 rounded-full bg-surface-700 text-gray-500 border border-white/5">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Setup */}
      <div className="border-t border-white/5 pt-2">
        <p className="text-[9px] text-gray-600 mb-0.5">Setup suggéré</p>
        <p className="text-[10px] text-accent-cyan leading-snug">{asset.setup}</p>
      </div>
    </div>
  )
}
