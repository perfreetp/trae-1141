import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Beaker, ShoppingCart, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const MATERIAL_META: Record<string, { name: string; safetyKey: string; color: string }> = {
  nickel: { name: '镍', safetyKey: 'nickelSafety', color: 'bg-neon' },
  cobalt: { name: '钴', safetyKey: 'cobaltSafety', color: 'bg-ice' },
  lithium: { name: '锂', safetyKey: 'lithiumSafety', color: 'bg-amber' },
}

const MAX_CAPACITY = 200

export default function MaterialAllocation() {
  const inventory = useGameStore((s) => s.inventory)
  const finance = useGameStore((s) => s.finance)
  const quarter = useGameStore((s) => s.quarter)
  const purchaseMaterial = useGameStore((s) => s.purchaseMaterial)

  const [quantities, setQuantities] = useState<Record<string, number>>({
    nickel: 0,
    cobalt: 0,
    lithium: 0,
  })

  const handleQuantityChange = (material: string, value: string) => {
    const num = Math.max(0, Math.min(MAX_CAPACITY, parseInt(value) || 0))
    setQuantities((prev) => ({ ...prev, [material]: num }))
  }

  const handlePurchase = (material: 'nickel' | 'cobalt' | 'lithium') => {
    const qty = quantities[material]
    if (qty <= 0) return
    purchaseMaterial(material, qty)
    setQuantities((prev) => ({ ...prev, [material]: 0 }))
  }

  const getTrendIcon = (material: 'nickel' | 'cobalt' | 'lithium') => {
    const baseline: Record<string, number> = { nickel: 150, cobalt: 280, lithium: 400 }
    const current = inventory.marketPrices[material]
    if (current > baseline[material] * 1.05) return <TrendingUp className="w-4 h-4 text-coral" />
    if (current < baseline[material] * 0.95) return <TrendingDown className="w-4 h-4 text-neon" />
    return <span className="text-slate-500 text-xs font-display">—</span>
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="mb-2">
        <h1 className="section-title flex items-center gap-2">
          <Beaker className="w-6 h-6 text-neon" />
          材料配比
        </h1>
        <p className="text-slate-400 text-sm font-body mt-1">
          管理镍 / 钴 / 锂库存，监控安全水位，及时采购补充
        </p>
      </div>

      <section>
        <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest mb-3">
          库存面板
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['nickel', 'cobalt', 'lithium'] as const).map((key) => {
            const meta = MATERIAL_META[key]
            const current = inventory[key]
            const safety = inventory[meta.safetyKey] as number
            const isBelowSafety = current < safety
            const fillPct = Math.min(100, (current / MAX_CAPACITY) * 100)
            const safetyPct = Math.min(100, (safety / MAX_CAPACITY) * 100)

            return (
              <div
                key={key}
                className={`card ${isBelowSafety ? 'border-coral/50' : 'border-neon/20'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-slate-300 text-sm">{meta.name}</span>
                  {isBelowSafety && (
                    <AlertTriangle className="w-4 h-4 text-coral animate-glow-pulse" />
                  )}
                </div>
                <div
                  className={`font-display font-bold text-2xl tracking-tight ${
                    isBelowSafety ? 'text-coral' : 'text-neon'
                  }`}
                >
                  {current}
                  <span className="text-slate-500 text-sm font-normal ml-1">/ {MAX_CAPACITY}</span>
                </div>
                <div className="progress-bar mt-3 relative">
                  <div
                    className={`progress-bar-fill ${isBelowSafety ? 'bg-coral' : meta.color}`}
                    style={{ width: `${fillPct}%` }}
                  />
                  <div
                    className="absolute top-0 h-full w-0.5 bg-amber"
                    style={{ left: `${safetyPct}%` }}
                    title={`安全线: ${safety}`}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs text-slate-500 font-body">0</span>
                  <span className="text-xs text-amber font-display">安全 {safety}</span>
                  <span className="text-xs text-slate-500 font-body">{MAX_CAPACITY}</span>
                </div>
                {isBelowSafety && (
                  <p className="text-xs text-coral font-body mt-2">
                    ⚠ 库存低于安全线，请尽快采购
                  </p>
                )}
              </div>
            )
          })}

          <div className="card border-neon/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-slate-300 text-sm">梯次电池</span>
            </div>
            <div className="font-display font-bold text-2xl tracking-tight text-ice">
              {inventory.cascadeBattery}
              <span className="text-slate-500 text-sm font-normal ml-1">/ {MAX_CAPACITY}</span>
            </div>
            <div className="progress-bar mt-3">
              <div
                className="progress-bar-fill bg-ice"
                style={{
                  width: `${Math.min(100, (inventory.cascadeBattery / MAX_CAPACITY) * 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-500 font-body">0</span>
              <span className="text-xs text-slate-500 font-body">{MAX_CAPACITY}</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest mb-3">
          市场价格
        </h2>
        <div className="card">
          <div className="grid grid-cols-3 gap-4">
            {(['nickel', 'cobalt', 'lithium'] as const).map((key) => {
              const meta = MATERIAL_META[key]
              const price = inventory.marketPrices[key]
              return (
                <div key={key} className="text-center">
                  <span className="text-xs text-slate-500 font-body block mb-1">{meta.name}</span>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-display font-bold text-lg text-white">
                      ¥{price}
                    </span>
                    {getTrendIcon(key)}
                  </div>
                  <span className="text-[10px] text-slate-600 font-body">/ 单位</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-amber" />
          紧急采购
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['nickel', 'cobalt', 'lithium'] as const).map((key) => {
            const meta = MATERIAL_META[key]
            const unitPrice = inventory.marketPrices[key]
            const qty = quantities[key]
            const totalCost = unitPrice * qty
            const canAfford = finance.cash >= totalCost && qty > 0

            return (
              <div key={key} className="card">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-slate-300 text-sm">{meta.name}</span>
                  <span className="text-xs text-slate-500 font-display">
                    单价 ¥{unitPrice}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min={0}
                    max={MAX_CAPACITY}
                    value={qty || ''}
                    onChange={(e) => handleQuantityChange(key, e.target.value)}
                    placeholder="0"
                    className="w-full bg-base-700 border border-base-500 rounded-lg px-3 py-2
                      font-display text-white text-center
                      focus:border-neon/50 focus:outline-none focus:ring-1 focus:ring-neon/30
                      placeholder:text-slate-600"
                  />
                  <button
                    onClick={() => handlePurchase(key)}
                    disabled={!canAfford}
                    className={`btn-amber whitespace-nowrap ${!canAfford ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    采购
                  </button>
                </div>
                {qty > 0 && (
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-slate-500 font-body">预计费用</span>
                    <span
                      className={`font-display font-semibold ${
                        finance.cash < totalCost ? 'text-coral' : 'text-amber'
                      }`}
                    >
                      ¥{totalCost.toLocaleString()}
                    </span>
                  </div>
                )}
                {qty > 0 && finance.cash < totalCost && (
                  <p className="text-xs text-coral font-body mt-1">现金不足</p>
                )}
                <p className="text-[10px] text-slate-600 font-body mt-2">
                  预计下季度（Q{quarter + 1}）到货
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-display font-semibold text-slate-300 uppercase tracking-widest mb-3">
          在途采购
        </h2>
        {inventory.purchaseOrders.length === 0 ? (
          <div className="card text-center py-6">
            <p className="text-slate-500 font-body text-sm">暂无在途采购订单</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inventory.purchaseOrders.map((po) => {
              const meta = MATERIAL_META[po.material]
              return (
                <div key={po.id} className="card flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-amber" />
                    </div>
                    <div>
                      <span className="font-body text-white text-sm">{meta?.name ?? po.material}</span>
                      <span className="text-slate-500 text-xs font-body ml-2">
                        ×{po.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-semibold text-amber text-sm">
                      ¥{(po.price * po.quantity).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-slate-500 font-body">
                      预计 Q{po.deliveryQuarter} 到货
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
