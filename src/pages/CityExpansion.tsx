import { useGameStore } from '@/store/gameStore'
import { MapPin, Lock, Unlock, Building2, ArrowUp, AlertTriangle, Truck } from 'lucide-react'

const BUILD_STATION_COST = 50000

export default function CityExpansion() {
  const cities = useGameStore(s => s.cities)
  const finance = useGameStore(s => s.finance)
  const unlockCity = useGameStore(s => s.unlockCity)
  const buildStation = useGameStore(s => s.buildStation)
  const upgradeStation = useGameStore(s => s.upgradeStation)

  const unlockedCities = cities.filter(c => c.unlocked)
  const totalStations = unlockedCities.reduce((acc, c) => acc + c.stations.length, 0)
  const totalTransportCapacity = unlockedCities.reduce((acc, c) => acc + c.transportCapacity, 0)

  return (
    <div className="min-h-screen bg-base-900 p-4 md:p-6 lg:p-8 animate-fade-in">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="section-title glow-text">城市拓展</h1>
          <p className="text-slate-400 font-body text-sm mt-1">
            拓展回收网络版图，建设更多回收站点，扩大业务覆盖范围
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center">
              <Unlock className="w-5 h-5 text-neon" />
            </div>
            <div>
              <div className="stat-value text-neon">{unlockedCities.length}<span className="text-base text-slate-400">/{cities.length}</span></div>
              <div className="stat-label">已拓展城市</div>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ice/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-ice" />
            </div>
            <div>
              <div className="stat-value text-ice">{totalStations}</div>
              <div className="stat-label">回收站点总数</div>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-amber" />
            </div>
            <div>
              <div className="stat-value text-amber">{totalTransportCapacity}</div>
              <div className="stat-label">总运输能力</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map(city => (
            <CityCard
              key={city.id}
              city={city}
              cash={finance.cash}
              onUnlock={() => unlockCity(city.id)}
              onBuildStation={() => buildStation(city.id)}
              onUpgradeStation={(stationId) => upgradeStation(city.id, stationId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CityCard({ city, cash, onUnlock, onBuildStation, onUpgradeStation }: {
  city: ReturnType<typeof useGameStore.getState>['cities'][number]
  cash: number
  onUnlock: () => void
  onBuildStation: () => void
  onUpgradeStation: (stationId: string) => void
}) {
  if (!city.unlocked) {
    return (
      <div className="card opacity-70 border-base-600 hover:opacity-90 hover:border-slate-500">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <h3 className="font-display font-semibold text-slate-400 text-lg">{city.name}</h3>
          </div>
          <span className="text-xs text-slate-500 font-body bg-base-700 px-2 py-0.5 rounded">
            {city.region}
          </span>
        </div>
        <div className="space-y-2 mb-4 text-sm font-body">
          <div className="flex justify-between text-slate-500">
            <span>人口</span>
            <span>{city.population}万</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>EV渗透率</span>
            <span>{(city.evPenetration * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="border-t border-base-600 pt-3 space-y-2">
          <div className="flex justify-between items-center text-sm font-body">
            <span className="text-slate-400">拓展费用</span>
            <span className="text-amber font-display font-semibold">¥{city.unlockCost.toLocaleString()}</span>
          </div>
          <button
            onClick={onUnlock}
            disabled={cash < city.unlockCost}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MapPin className="w-4 h-4" />
            拓展城市
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card border-neon/20 hover:border-neon/40 shadow-neon/10 shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Unlock className="w-4 h-4 text-neon" />
          <h3 className="font-display font-semibold text-neon text-lg">{city.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {city.transportDisrupted && (
            <span className="flex items-center gap-1 text-xs text-coral bg-coral/10 px-2 py-0.5 rounded font-body">
              <AlertTriangle className="w-3 h-3" />
              运输中断
            </span>
          )}
          <span className="text-xs text-slate-400 font-body bg-base-700 px-2 py-0.5 rounded">
            {city.region}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm font-body">
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-neon/60" />
          <span>人口 {city.population}万</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-neon/60 text-xs">⚡</span>
          <span>EV {(city.evPenetration * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-ice/60" />
          <span>站点 {city.stations.length}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Truck className="w-3.5 h-3.5 text-amber/60" />
          <span>运力 {city.transportCapacity}</span>
        </div>
      </div>

      {city.stations.length > 0 && (
        <div className="space-y-2 mb-3">
          {city.stations.map(station => (
            <div
              key={station.id}
              className="flex items-center justify-between bg-base-700/50 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm font-body">
                <Building2 className="w-3.5 h-3.5 text-ice" />
                <span className="text-slate-300">Lv.{station.level}</span>
                <span className="text-xs text-slate-500">
                  预估{station.predictedVolume}吨/季
                </span>
              </div>
              <button
                onClick={() => onUpgradeStation(station.id)}
                disabled={cash < station.upgradeCost}
                className="btn-primary text-xs px-3 py-1 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-3 h-3" />
                升级 ¥{station.upgradeCost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onBuildStation}
        disabled={cash < BUILD_STATION_COST}
        className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Building2 className="w-4 h-4" />
        建设新站点 ¥{BUILD_STATION_COST.toLocaleString()}
      </button>
    </div>
  )
}
