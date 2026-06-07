import { useGameStore } from '@/store/gameStore'
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react'

export default function RecyclingPricing() {
  const cities = useGameStore(s => s.cities)
  const finance = useGameStore(s => s.finance)
  const setSubsidyPrice = useGameStore(s => s.setSubsidyPrice)

  const unlockedCities = cities.filter(c => c.unlocked && c.stations.length > 0)

  const totalPredictedVolume = unlockedCities.reduce(
    (acc, city) => acc + city.stations.reduce((s, st) => s + st.predictedVolume, 0),
    0
  )

  const totalCost = unlockedCities.reduce(
    (acc, city) => acc + city.stations.reduce((s, st) => s + st.subsidyPrice * st.predictedVolume, 0),
    0
  )

  const overBudget = totalCost > finance.cash

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-neon" />
          回收定价
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">
          调整各站点补贴价格，影响回收量与成本 — 价格越高，回收量越大，但成本也越高
        </p>
      </div>

      {unlockedCities.length === 0 && (
        <div className="card text-center py-12">
          <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-body">暂无已解锁的城市站点</p>
          <p className="text-slate-500 text-sm font-body mt-1">请先在「城市拓展」中解锁城市</p>
        </div>
      )}

      <div className="grid gap-4">
        {unlockedCities.map(city => (
          <div key={city.id} className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">{city.name}</h3>
              <span className="text-xs text-slate-500 font-body">
                {city.stations.length} 个站点 · {city.region}
              </span>
            </div>

            <div className="space-y-5">
              {city.stations.map((station, idx) => {
                const cost = station.subsidyPrice * station.predictedVolume
                const maxVolume = 500
                const volumePct = Math.min(100, (station.predictedVolume / maxVolume) * 100)

                return (
                  <div
                    key={station.id}
                    className="bg-base-900/60 rounded-lg p-4 border border-base-700/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 font-body">
                        站点 {idx + 1}
                        <span className="ml-2 text-xs text-ice">Lv.{station.level}</span>
                      </span>
                      <span className="font-display font-bold text-neon text-lg">
                        ¥{station.subsidyPrice}
                        <span className="text-xs text-slate-500 ml-1">/单位</span>
                      </span>
                    </div>

                    <input
                      type="range"
                      min={100}
                      max={500}
                      step={10}
                      value={station.subsidyPrice}
                      onChange={e => setSubsidyPrice(station.id, Number(e.target.value))}
                      className="w-full"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500 font-body">
                      <span>¥100</span>
                      <span>¥500</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="stat-label flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          预计回收量
                        </span>
                        <span className="stat-value text-ice">{station.predictedVolume}</span>
                        <span className="text-xs text-slate-500"> 单位</span>
                      </div>
                      <div className="space-y-1">
                        <span className="stat-label flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          预计成本
                        </span>
                        <span className="stat-value text-amber">
                          ¥{cost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="progress-bar">
                        <div
                          className="progress-bar-fill bg-ice"
                          style={{ width: `${volumePct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>0</span>
                        <span>{maxVolume}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {unlockedCities.length > 0 && (
        <div className={`card ${overBudget ? 'border-coral/50' : 'border-neon/20'}`}>
          <h3 className="font-display font-bold text-lg text-white mb-4">汇总概览</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-base-900/60 rounded-lg p-3 border border-base-700/50">
              <span className="stat-label flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                总预计回收量
              </span>
              <div className="mt-1">
                <span className="stat-value text-ice">{totalPredictedVolume}</span>
                <span className="text-xs text-slate-500 ml-1">单位</span>
              </div>
            </div>
            <div className="bg-base-900/60 rounded-lg p-3 border border-base-700/50">
              <span className="stat-label flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                总回收成本
              </span>
              <div className="mt-1">
                <span className={`stat-value ${overBudget ? 'text-coral' : 'text-amber'}`}>
                  ¥{totalCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-base-900/60 rounded-lg p-3 border border-base-700/50 flex items-center justify-between">
            <span className="stat-label">可用现金</span>
            <span className={`font-display font-bold ${finance.cash < 50000 ? 'text-coral' : 'text-neon'}`}>
              ¥{finance.cash.toLocaleString()}
            </span>
          </div>

          {overBudget && (
            <div className="mt-3 flex items-center gap-2 bg-coral/10 border border-coral/30 rounded-lg px-4 py-3">
              <AlertTriangle className="w-5 h-5 text-coral shrink-0" />
              <div>
                <p className="text-coral text-sm font-display font-bold">预算超支警告</p>
                <p className="text-coral/70 text-xs font-body">
                  总回收成本 ¥{totalCost.toLocaleString()} 超出现金 ¥{finance.cash.toLocaleString()}，
                  超出 ¥{(totalCost - finance.cash).toLocaleString()}，请降低补贴价格或减少站点
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
