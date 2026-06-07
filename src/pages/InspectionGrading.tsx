import { useState } from 'react'
import { ClipboardCheck, Play, CheckCircle, ArrowRight } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

export default function InspectionGrading() {
  const cities = useGameStore(s => s.cities)
  const inspectionLines = useGameStore(s => s.inspectionLines)
  const assignBatchToInspection = useGameStore(s => s.assignBatchToInspection)
  const runInspection = useGameStore(s => s.runInspection)

  const [assigningBatchId, setAssigningBatchId] = useState<string | null>(null)

  const pendingBatches = cities.flatMap(city =>
    city.stations.flatMap(station =>
      station.batches
        .filter(b => b.status === 'pending')
        .map(b => ({ ...b, cityName: b.cityName || city.name }))
    )
  )

  const inspectingBatches = cities.flatMap(city =>
    city.stations.flatMap(station =>
      station.batches
        .filter(b => b.status === 'inspecting')
        .map(b => ({ ...b, cityName: b.cityName || city.name }))
    )
  )

  const gradedBatches = cities.flatMap(city =>
    city.stations.flatMap(station =>
      station.batches
        .filter(b => b.status === 'graded')
        .map(b => ({ ...b, cityName: b.cityName || city.name }))
    )
  )

  const idleLines = inspectionLines.filter(l => l.status === 'idle')

  function handleAssign(batchId: string, lineId: string) {
    assignBatchToInspection(batchId, lineId)
    setAssigningBatchId(null)
  }

  function getBatchForLine(lineId: string) {
    const line = inspectionLines.find(l => l.id === lineId)
    if (!line?.assignedBatchId) return null
    return inspectingBatches.find(b => b.id === line.assignedBatchId) ?? null
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title flex items-center gap-3">
          <ClipboardCheck className="w-7 h-7 text-neon" />
          检测分级
        </h1>
        <p className="text-slate-400 font-body mt-1">
          安排检测线对回收电池批次进行性能检测与梯次/拆解分级
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Pending Batches */}
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-neon" />
            待检测批次
            <span className="ml-auto font-display text-neon font-bold">{pendingBatches.length}</span>
          </h2>

          {pendingBatches.length === 0 && (
            <div className="card text-center text-slate-500 font-body py-8">
              暂无待检测批次
            </div>
          )}

          <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {pendingBatches.map(batch => (
              <div key={batch.id} className="card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-body">{batch.cityName}</span>
                  <span className="font-display font-bold text-white">
                    {batch.quantity}
                    <span className="text-slate-500 text-xs ml-0.5">组</span>
                  </span>
                </div>

                {assigningBatchId === batch.id ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-body">选择检测线：</p>
                    {idleLines.length === 0 ? (
                      <p className="text-xs text-coral font-body">无可用检测线</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {idleLines.map(line => (
                          <button
                            key={line.id}
                            className="btn-primary text-xs !px-3 !py-1"
                            onClick={() => handleAssign(batch.id, line.id)}
                          >
                            {line.name}
                            <span className="text-neon/60 ml-1">
                              ({line.capacity - line.usedCapacity})
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn-secondary text-xs !px-3 !py-1"
                      onClick={() => setAssigningBatchId(null)}
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    onClick={() => setAssigningBatchId(batch.id)}
                  >
                    <Play className="w-3.5 h-3.5" />
                    分配检测
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Inspection Lines */}
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-amber" />
            检测线状态
            <span className="ml-auto font-display text-amber font-bold">{inspectionLines.length}</span>
          </h2>

          <div className="space-y-3">
            {inspectionLines.map(line => {
              const assignedBatch = getBatchForLine(line.id)
              const isIdle = line.status === 'idle'

              return (
                <div key={line.id} className="card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-white text-lg">{line.name}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-display font-semibold ${
                        isIdle
                          ? 'bg-neon/15 text-neon border border-neon/30'
                          : 'bg-amber/15 text-amber border border-amber/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isIdle ? 'bg-neon animate-glow-pulse' : 'bg-amber animate-pulse'
                        }`}
                      />
                      {isIdle ? '空闲' : '检测中'}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-body text-slate-400 mb-1">
                      <span>容量</span>
                      <span className="font-display font-semibold text-white">
                        {line.usedCapacity}
                        <span className="text-slate-500">/{line.capacity}</span>
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${
                          isIdle ? 'bg-neon/50' : 'bg-amber/60'
                        }`}
                        style={{ width: `${Math.min(100, (line.usedCapacity / line.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {isIdle && (
                    <div className="text-center text-slate-500 text-sm font-body py-2">
                      等待分配批次…
                    </div>
                  )}

                  {!isIdle && assignedBatch && (
                    <div className="space-y-3">
                      <div className="bg-base-700/50 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-body">
                          <span className="text-slate-400">批次来源</span>
                          <span className="text-white">{assignedBatch.cityName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-body">
                          <span className="text-slate-400">数量</span>
                          <span className="font-display font-semibold text-amber">
                            {assignedBatch.quantity} 组
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-amber w-full text-sm flex items-center justify-center gap-2"
                        onClick={() => runInspection(line.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                        完成检测
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Graded Batches */}
        <div className="space-y-3">
          <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-neon" />
            已分级批次
            <span className="ml-auto font-display text-neon font-bold">{gradedBatches.length}</span>
          </h2>

          {gradedBatches.length === 0 && (
            <div className="card text-center text-slate-500 font-body py-8">
              暂无已分级批次
            </div>
          )}

          <div className="space-y-3 max-h-[calc(100vh-240px)] overflow-y-auto pr-1">
            {gradedBatches.map(batch => {
              const isCascade = batch.grade === 'cascade'

              return (
                <div key={batch.id} className="card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-body">{batch.cityName}</span>
                    <span className="font-display font-bold text-white">
                      {batch.quantity}
                      <span className="text-slate-500 text-xs ml-0.5">组</span>
                    </span>
                  </div>

                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-display font-semibold ${
                      isCascade
                        ? 'bg-neon/15 text-neon border border-neon/30'
                        : 'bg-amber/15 text-amber border border-amber/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${isCascade ? 'bg-neon' : 'bg-amber'}`}
                    />
                    {isCascade ? '绿色梯次利用' : '橙色需拆解'}
                  </div>

                  {isCascade && batch.cascadeYield != null && batch.cascadeYield > 0 && (
                    <div className="bg-neon/5 border border-neon/10 rounded-lg p-2.5">
                      <p className="text-xs text-slate-400 font-body mb-1">梯次电池产出</p>
                      <p className="font-display font-bold text-neon text-lg">
                        +{batch.cascadeYield}
                        <span className="text-xs text-neon/60 ml-1">组</span>
                      </p>
                    </div>
                  )}

                  {!isCascade && batch.dismantleYields && (
                    <div className="bg-amber/5 border border-amber/10 rounded-lg p-2.5 space-y-1.5">
                      <p className="text-xs text-slate-400 font-body">拆解材料产出</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <p className="font-display font-bold text-ice text-sm">
                            +{batch.dismantleYields.nickel}
                          </p>
                          <p className="text-[10px] text-slate-500 font-body">镍</p>
                        </div>
                        <div className="text-center">
                          <p className="font-display font-bold text-ice text-sm">
                            +{batch.dismantleYields.cobalt}
                          </p>
                          <p className="text-[10px] text-slate-500 font-body">钴</p>
                        </div>
                        <div className="text-center">
                          <p className="font-display font-bold text-ice text-sm">
                            +{batch.dismantleYields.lithium}
                          </p>
                          <p className="text-[10px] text-slate-500 font-body">锂</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
