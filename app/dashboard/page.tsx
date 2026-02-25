import { MarketOverview }   from '@/components/market/MarketOverview'
import { MacroContext }      from '@/components/market/MacroContext'
import { AIDailyBriefing }  from '@/components/bias/AIDailyBriefing'
import { ChartSection }      from '@/components/charts/ChartSection'
import { BiasGrid }          from '@/components/bias/BiasGrid'
import { EconomicCalendar } from '@/components/calendar/EconomicCalendar'
import { NewsWidget }        from '@/components/calendar/NewsWidget'
import { PreMarketChecklist } from '@/components/checklist/PreMarketChecklist'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">

      {/* ── Row 1 : Market Overview ──────────────────────────────────── */}
      <MarketOverview />

      {/* ── Layout 2 colonnes : flux principal + checklist sticky ─────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Colonne principale ──────────────────────────────────────── */}
        <div className="space-y-6 min-w-0">

          <MacroContext />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EconomicCalendar />
            <NewsWidget />
          </div>

          <AIDailyBriefing />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <div className="xl:col-span-3">
              <ChartSection />
            </div>
            <div className="xl:col-span-2">
              <BiasGrid />
            </div>
          </div>

        </div>

        {/* ── Colonne droite : Checklist sticky ───────────────────────── */}
        <div className="sticky top-6">
          <PreMarketChecklist />
        </div>

      </div>

    </div>
  )
}
