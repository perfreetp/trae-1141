import { useState } from 'react'
import { Truck, Clock, AlertTriangle, CheckCircle, Package } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { cn } from '@/lib/utils'
import type { Order } from '@/types/game'

const TRANSPORT_OPTIONS: { value: Order['transportMethod']; label: string; multiplier: number }[] = [
  { value: 'road', label: '公路', multiplier: 1 },
  { value: 'rail', label: '铁路', multiplier: 0.7 },
  { value: 'express', label: '加急', multiplier: 1.8 },
]

const STATUS_BADGE: Record<Order['status'], { label: string; className: string }> = {
  pending: { label: '待处理', className: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
  producing: { label: '生产中', className: 'bg-ice/20 text-ice border-ice/40' },
  delivering: { label: '配送中', className: 'bg-amber/20 text-amber border-amber/40' },
  completed: { label: '已完成', className: 'bg-neon/20 text-neon border-neon/40' },
  overdue: { label: '已逾期', className: 'bg-coral/20 text-coral border-coral/40' },
}

function getUrgencyColor(urgency: number) {
  if (urgency >= 3) return 'text-coral'
  if (urgency >= 2) return 'text-amber'
  return 'text-neon'
}

function getUrgencyLabel(urgency: number) {
  if (urgency >= 3) return '紧急'
  if (urgency >= 2) return '一般'
  return '宽松'
}

function getClientTypeBadgeClass(type: Order['clientType']) {
  switch (type) {
    case '储能厂': return 'bg-ice/20 text-ice border-ice/30'
    case '电动车厂': return 'bg-neon/20 text-neon border-neon/30'
    case '材料商': return 'bg-amber/20 text-amber border-amber/30'
    case '电网公司': return 'bg-coral/20 text-coral border-coral/30'
  }
}

const MATERIAL_TO_INVENTORY_KEY: Record<Order['material'], 'nickel' | 'cobalt' | 'lithium' | 'cascadeBattery'> = {
  nickel: 'nickel',
  cobalt: 'cobalt',
  lithium: 'lithium',
  cascade_battery: 'cascadeBattery',
}

function OrderCard({ order }: { order: Order }) {
  const { inventory, quarter, allocateMaterialToOrder, deliverOrder, setOrderTransport } = useGameStore()
  const [allocating, setAllocating] = useState(false)
  const [allocQty, setAllocQty] = useState(0)

  const materialKey = MATERIAL_TO_INVENTORY_KEY[order.material]
  const available = inventory[materialKey]
  const maxAllocatable = Math.min(available, order.remainingQuantity - order.allocatedQuantity)
  const canDeliver = order.allocatedQuantity >= order.remainingQuantity

  const handleAllocate = () => {
    if (allocQty <= 0 || allocQty > maxAllocatable) return
    allocateMaterialToOrder(order.id, order.material, allocQty)
    setAllocating(false)
    setAllocQty(0)
  }

  const handleDeliver = () => {
    if (!canDeliver) return
    deliverOrder(order.id)
  }

  const badge = STATUS_BADGE[order.status]
  const progressPct = order.quantity > 0 ? Math.min(100, (order.allocatedQuantity / order.quantity) * 100) : 0
  const deadlineNear = order.deadline - quarter <= 1
  const overdueRisk = order.deadline <= quarter

  return (
    <div className={cn('card', order.status === 'overdue' && 'border-coral/40')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" />
          <span className="font-body font-semibold text-white">{order.clientName}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded border font-body', getClientTypeBadgeClass(order.clientType))}>
            {order.clientType}
          </span>
        </div>
        <span className={cn('text-xs px-2 py-0.5 rounded border font-display font-semibold', badge.className)}>
          {badge.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-slate-400">需求材料</span>
          <span className="text-white font-display">
            {order.materialName} × {order.quantity}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-slate-500">分配进度</span>
            <span className="font-display text-slate-300">
              {order.allocatedQuantity}/{order.quantity}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className={cn(
                'progress-bar-fill',
                progressPct >= 100 ? 'bg-neon' : progressPct > 0 ? 'bg-ice' : 'bg-base-500'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            截止
          </span>
          <span className={cn('font-display font-semibold', overdueRisk ? 'text-coral' : deadlineNear ? 'text-amber' : 'text-slate-300')}>
            Q{order.deadline}
            <span className={cn('text-xs ml-1.5', getUrgencyColor(order.urgency))}>
              {getUrgencyLabel(order.urgency)}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-slate-400">订单价格</span>
          <span className="text-neon font-display font-semibold">¥{order.price.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-sm font-body">
          <span className="text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-coral" />
            违约金
          </span>
          <span className="text-coral font-display font-semibold">¥{order.penalty.toLocaleString()}</span>
        </div>
      </div>

      {order.status !== 'overdue' && order.status !== 'completed' && (
        <>
          <div className="mb-3">
            <div className="text-xs text-slate-400 font-body mb-1.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              运输方式
            </div>
            <div className="flex gap-2">
              {TRANSPORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setOrderTransport(order.id, opt.value!)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded border font-display font-semibold transition-all',
                    order.transportMethod === opt.value
                      ? 'bg-neon/20 text-neon border-neon/40'
                      : 'bg-base-700 text-slate-400 border-base-500 hover:border-base-400'
                  )}
                >
                  {opt.label}({opt.multiplier}x)
                </button>
              ))}
            </div>
          </div>

          {!allocating ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAllocating(true)
                  setAllocQty(maxAllocatable > 0 ? 1 : 0)
                }}
                disabled={maxAllocatable <= 0}
                className={cn(
                  'flex-1 text-sm',
                  maxAllocatable > 0 ? 'btn-secondary' : 'btn-secondary opacity-40 cursor-not-allowed'
                )}
              >
                分配材料
              </button>
              <button
                onClick={handleDeliver}
                disabled={!canDeliver}
                className={cn(
                  'flex-1 text-sm',
                  canDeliver ? 'btn-primary' : 'btn-primary opacity-40 cursor-not-allowed'
                )}
              >
                交付
              </button>
            </div>
          ) : (
            <div className="bg-base-700/50 rounded-lg p-3 border border-base-500 animate-fade-in">
              <div className="text-xs text-slate-400 font-body mb-2">
                可分配库存: <span className="text-ice font-display">{available}</span>
                {' | '}剩余需求: <span className="text-amber font-display">{order.remainingQuantity - order.allocatedQuantity}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min={0}
                  max={maxAllocatable}
                  value={allocQty}
                  onChange={e => setAllocQty(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-display font-bold text-neon text-lg min-w-[3ch] text-right">{allocQty}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAllocate} disabled={allocQty <= 0} className="flex-1 text-sm btn-primary">
                  确认分配
                </button>
                <button onClick={() => { setAllocating(false); setAllocQty(0) }} className="flex-1 text-sm btn-secondary">
                  取消
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function CustomerDelivery() {
  const { orders, finance } = useGameStore()
  const [showCompleted, setShowCompleted] = useState(false)

  const activeOrders = orders.filter(o => o.status !== 'completed')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const overdueCount = orders.filter(o => o.status === 'overdue').length
  const totalRevenue = finance.totalRevenue

  return (
    <div className="min-h-screen bg-base-900 p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">客户交付</h1>
        <p className="text-slate-400 font-body text-sm mt-1">管理客户订单，分配材料并按时交付以获取收益</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card text-center">
          <div className="stat-value text-white">{orders.length}</div>
          <div className="stat-label">总订单</div>
        </div>
        <div className="card text-center">
          <div className="stat-value text-neon">{completedOrders.length}</div>
          <div className="stat-label">已完成</div>
        </div>
        <div className="card text-center">
          <div className="stat-value text-coral">{overdueCount}</div>
          <div className="stat-label">已逾期</div>
        </div>
        <div className="card text-center">
          <div className="stat-value text-neon">¥{totalRevenue.toLocaleString()}</div>
          <div className="stat-label">总收入</div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-ice" />
          <h2 className="font-display font-bold text-lg text-white tracking-wide">待处理订单</h2>
          <span className="text-xs bg-ice/20 text-ice border border-ice/30 px-2 py-0.5 rounded font-display">
            {activeOrders.length}
          </span>
        </div>
        {activeOrders.length === 0 ? (
          <div className="card text-center py-8">
            <CheckCircle className="w-10 h-10 text-neon mx-auto mb-2" />
            <p className="text-slate-400 font-body">暂无待处理订单</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="flex items-center gap-2 mb-4 group"
        >
          <CheckCircle className="w-5 h-5 text-neon" />
          <h2 className="font-display font-bold text-lg text-white tracking-wide">已完成订单</h2>
          <span className="text-xs bg-neon/20 text-neon border border-neon/30 px-2 py-0.5 rounded font-display">
            {completedOrders.length}
          </span>
          <span className="text-slate-500 text-sm font-body ml-1 group-hover:text-slate-300 transition-colors">
            {showCompleted ? '收起 ▲' : '展开 ▼'}
          </span>
        </button>

        {showCompleted && (
          <div className="animate-fade-in">
            {completedOrders.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-slate-400 font-body">暂无已完成订单</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedOrders.map(order => (
                  <div key={order.id} className="card flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-neon" />
                      <span className="font-body text-white text-sm">{order.clientName}</span>
                      <span className="text-xs text-slate-500 font-body">{order.materialName} × {order.quantity}</span>
                    </div>
                    <span className="font-display font-semibold text-neon text-sm">¥{order.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
