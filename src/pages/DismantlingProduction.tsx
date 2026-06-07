import { useState } from 'react'
import { Factory, Play, Wrench, Package } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import type { BatteryBatch } from '@/types/game'

interface DismantleBatch extends BatteryBatch {
  cityId: string
  stationId: string
}

export default function DismantlingProduction() {
  const cities = useGameStore(s => s.cities)
  const productionLines = useGameStore(s => s.productionLines)
  const assignBatchToDismantling = useGameStore(s => s.assignBatchToDismantling)
  const runDismantling = useGameStore(s => s.runDismantling)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const dismantleBatches: DismantleBatch[] = []
  cities.forEach(city => {
    city.stations.forEach(station => {
      station.batches.forEach(batch => {
        if (batch.grade === 'dismantle' && batch.status === 'graded') {
          dismantleBatches.push({ ...batch, cityId: city.id, stationId: station.id })
        }
      })
    })
  })

  const idleLines = productionLines.filter(l => l.status === 'idle')
  const dismantlingLines = productionLines.filter(l => l.status === 'dismantling')

  function findBatchById(batchId: string): DismantleBatch | undefined {
    for (const city of cities) {
      for (const station of city.stations) {
        const batch = station.batches.find(b => b.id === batchId)
        if (batch) return { ...batch, cityId: city.id, stationId: station.id }
      }
    }
    return undefined
  }

  function handleAssign(batchId: string, lineId: string) {
    assignBatchToDismantling(batchId, lineId)
    setOpenDropdown(null)
  }

  const totalCapacity = productionLines.reduce((s, l) => s + l.capacity, 0)
  const usedCapacity = productionLines.reduce((s, l) => s + l.usedCapacity, 0)
  const queueCount = dismantleBatches.length

  const estimatedNickel = dismantleBatches.reduce((s, b) => s + (b.dismantleYields?.nickel ?? 0) * Math.ceil(b.quantity / 10), 0)
  const estimatedCobalt = dismantleBatches.reduce((s, b) => s + (b.dismantleYields?.cobalt ?? 0) * Math.ceil(b.quantity / 10), 0)
  const estimatedLithium = dismantleBatches.reduce((s, b) => s + (b.dismantleYields?.lithium ?? 0) * Math.ceil(b.quantity / 10), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Wrench className="w-6 h-6 text-neon" />
          拆解排产
        </h1>
        <p className="text-slate-400 font-body mt-1">管理拆解产线，将退役电池批次分配至产线进行拆解回收</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-amber" />
          待拆解批次
        </h2>

        {dismantleBatches.length === 0 ? (
          <div className="card text-center py-8">
            <Package className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-500 font-body">暂无待拆解批次</p>
            <p className="text-slate-600 text-sm font-body mt-1">请先将电池批次送至检测线完成分级</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {dismantleBatches.map(batch => (
              <div key={batch.id} className="card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-amber font-display font-semibold">{batch.cityName}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300 font-body">数量 <span className="font-display text-white">{batch.quantity}</span></span>
                  </div>
                  <span className="text-xs bg-coral/20 text-coral px-2 py-0.5 rounded font-display">需拆解</span>
                </div>

                {batch.dismantleYields && (
                  <div className="flex gap-4 text-sm font-body">
                    <span className="text-ice">镍 +{batch.dismantleYields.nickel * Math.ceil(batch.quantity / 10)}</span>
                    <span className="text-amber">钴 +{batch.dismantleYields.cobalt * Math.ceil(batch.quantity / 10)}</span>
                    <span className="text-neon">锂 +{batch.dismantleYields.lithium * Math.ceil(batch.quantity / 10)}</span>
                  </div>
                )}

                <div className="relative">
                  {idleLines.length > 0 ? (
                    <>
                      <button
                        className="btn-amber text-sm flex items-center gap-1.5"
                        onClick={() => setOpenDropdown(openDropdown === batch.id ? null : batch.id)}
                      >
                        <Factory className="w-4 h-4" />
                        分配拆解
                      </button>
                      {openDropdown === batch.id && (
                        <div className="absolute z-10 mt-2 left-0 w-full min-w-[180px] bg-base-800 border border-base-600 rounded-lg shadow-lg overflow-hidden">
                          {idleLines.map(line => (
                            <button
                              key={line.id}
                              className="w-full text-left px-4 py-2.5 text-sm font-body text-slate-300 hover:bg-neon/10 hover:text-neon transition-colors"
                              onClick={() => handleAssign(batch.id, line.id)}
                            >
                              {line.name}（剩余 {line.capacity - line.usedCapacity}）
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500 text-sm font-body">无空闲产线</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <Factory className="w-5 h-5 text-neon" />
          拆解产线
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {productionLines.map(line => {
            const capacityPct = line.capacity > 0 ? (line.usedCapacity / line.capacity) * 100 : 0
            const assignedBatch = line.assignedBatchId ? findBatchById(line.assignedBatchId) : undefined

            return (
              <div key={line.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-neon/70" />
                    <span className="font-display font-semibold text-white">{line.name}</span>
                  </div>
                  {line.status === 'idle' ? (
                    <span className="text-xs bg-base-700 text-slate-400 px-2 py-0.5 rounded font-display">空闲</span>
                  ) : (
                    <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded font-display animate-glow-pulse">拆解中</span>
                  )}
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-xs font-body text-slate-400 mb-1">
                    <span>产能占用</span>
                    <span className="font-display">
                      {line.usedCapacity}/{line.capacity}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${capacityPct > 80 ? 'bg-coral' : capacityPct > 50 ? 'bg-amber' : 'bg-neon'}`}
                      style={{ width: `${Math.min(100, capacityPct)}%` }}
                    />
                  </div>
                </div>

                {line.status === 'idle' && (
                  <p className="text-slate-500 text-sm font-body mt-2">等待分配批次…</p>
                )}

                {line.status === 'dismantling' && assignedBatch && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm font-body">
                      <span className="text-slate-400">当前批次：</span>
                      <span className="text-amber font-display">{assignedBatch.cityName} · {assignedBatch.quantity}单位</span>
                    </div>
                    {assignedBatch.dismantleYields && (
                      <div className="flex gap-3 text-xs font-body">
                        <span className="text-ice">镍 +{assignedBatch.dismantleYields.nickel * Math.ceil(assignedBatch.quantity / 10)}</span>
                        <span className="text-amber">钴 +{assignedBatch.dismantleYields.cobalt * Math.ceil(assignedBatch.quantity / 10)}</span>
                        <span className="text-neon">锂 +{assignedBatch.dismantleYields.lithium * Math.ceil(assignedBatch.quantity / 10)}</span>
                      </div>
                    )}
                    <button
                      className="btn-primary text-sm flex items-center gap-1.5 mt-1"
                      onClick={() => runDismantling(line.id)}
                    >
                      <Play className="w-4 h-4" />
                      完成拆解
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-ice" />
          拆解概览
        </h2>

        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="stat-label">总拆解产能</p>
              <p className="stat-value text-neon">{totalCapacity}</p>
              <p className="text-xs text-slate-500 font-body mt-0.5">已用 {usedCapacity}（{totalCapacity > 0 ? Math.round(usedCapacity / totalCapacity * 100) : 0}%）</p>
            </div>
            <div>
              <p className="stat-label">待拆解队列</p>
              <p className="stat-value text-amber">{queueCount}</p>
              <p className="text-xs text-slate-500 font-body mt-0.5">批次等待分配</p>
            </div>
            <div>
              <p className="stat-label">预计产出（镍/钴/锂）</p>
              <p className="stat-value text-ice">{estimatedNickel}<span className="text-base-500 mx-1">/</span>{estimatedCobalt}<span className="text-base-500 mx-1">/</span>{estimatedLithium}</p>
            </div>
            <div>
              <p className="stat-label">产线状态</p>
              <p className="stat-value text-white">{dismantlingLines.length}<span className="text-base-500 text-lg mx-1">/</span><span className="text-lg text-slate-400">{productionLines.length}</span></p>
              <p className="text-xs text-slate-500 font-body mt-0.5">工作中 / 总计</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
