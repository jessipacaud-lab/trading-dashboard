import { SectionHeader } from '@/components/ui/SectionHeader'
import { MarketCard } from './MarketCard'
import { MOCK_MACRO } from '@/lib/constants'

const OVERVIEW_ITEMS = [
  { quote: MOCK_MACRO.nas100, assetType: 'index'     as const, bias: 'bullish'  as const },
  { quote: MOCK_MACRO.spx,   assetType: 'index'     as const, bias: 'range'    as const },
  { quote: MOCK_MACRO.gold,  assetType: 'commodity' as const, bias: 'range'    as const },
  { quote: MOCK_MACRO.btc,   assetType: 'stock'     as const, bias: 'bullish'  as const },
  { quote: MOCK_MACRO.dxy,   assetType: 'fx'        as const                            },
  { quote: MOCK_MACRO.vix,   assetType: 'index'     as const                            },
]

export function MarketOverview() {
  return (
    <section className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden">
      <SectionHeader
        title="Market Overview"
        subtitle="Données temps réel — mock data V1"
        action={
          <span className="text-[9px] text-gray-700">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        }
      />
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {OVERVIEW_ITEMS.map(item => (
          <MarketCard
            key={item.quote.symbol}
            quote={item.quote}
            assetType={item.assetType}
            bias={item.bias}
          />
        ))}
      </div>
    </section>
  )
}
