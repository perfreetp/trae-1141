import { useGameStore } from '@/store/gameStore'
import {
  Zap, DollarSign, Leaf, Truck, AlertTriangle, Award,
  Calendar, ChevronRight, Package, Clock, CheckCircle2,
  XCircle, AlertCircle, TrendingUp, ArrowRight, Battery, Factory, Trophy
} from 'lucide-react'

function LandingScreen() {
  const startGame = useGameStore(s => s.startGame)

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-neon/10 rounded-full blur-[80px] scale-150" />
        <div className="relative flex items-center justify-center w-32 h-32 rounded-full border-2 border-neon/40 bg-base-800/80 shadow-neon-strong animate-glow-pulse">
          <Battery className="w-16 h-16 text-neon" />
        </div>
      </div>

      <h1 className="font-display font-bold text-6xl md:text-7xl text-white tracking-wider mb-3 animate-slide-in-up">
        绿能回生
      </h1>
      <p className="font-body text-lg text-neon/80 tracking-widest mb-2 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
        Battery Reborn
      </p>
      <p className="font-body text-sm text-slate-400 mb-12 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
        新能源电池回收再制造策略游戏
      </p>

      <div className="grid grid-cols-3 gap-4 mb-12 max-w-md w-full animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
        {[
          { icon: Leaf, label: '回收', desc: '电池回收利用' },
          { icon: Factory, label: '制造', desc: '拆解再制造' },
          { icon: TrendingUp, label: '经营', desc: '策略与决策' },
        ].map((item, i) => (
          <div key={i} className="card text-center py-4 group">
            <item.icon className="w-6 h-6 text-neon/60 mx-auto mb-2 group-hover:text-neon transition-colors" />
            <p className="font-display font-semibold text-white text-sm">{item.label}</p>
            <p className="text-[10px] text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={startGame}
        className="btn-primary text-lg px-10 py-3 flex items-center gap-3 animate-slide-in-up group"
        style={{ animationDelay: '0.4s' }}
      >
        <Zap className="w-5 h-5" />
        开始经营
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-[10px] text-slate-600 mt-6 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
        管理 12 个季度的电池回收企业，追求利润与环境双赢
      </p>
    </div>
  )
}

function StatCards() {
  const { finance, carbonMetrics, reputation, inventory, quarter, maxQuarters } = useGameStore()

  const inventoryRisk = (() => {
    const risks: string[] = []
    if (inventory.nickel < inventory.nickelSafety) risks.push('镍')
    if (inventory.cobalt < inventory.cobaltSafety) risks.push('钴')
    if (inventory.lithium < inventory.lithiumSafety) risks.push('锂')
    return risks.length === 0 ? null : risks
  })()

  const levelColor: Record<string, string> = {
    S: 'text-neon border-neon/60 bg-neon/10 shadow-neon',
    A: 'text-ice border-ice/60 bg-ice/10 shadow-ice',
    B: 'text-amber border-amber/60 bg-amber/10 shadow-amber',
    C: 'text-coral border-coral/60 bg-coral/10 shadow-coral',
    D: 'text-red-400 border-red-400/60 bg-red-400/10',
  }

  const cards = [
    {
      icon: DollarSign,
      label: '现金流',
      value: `¥${(finance.cash / 10000).toFixed(1)}万`,
      color: finance.cash < 50000 ? 'text-coral' : 'text-neon',
      borderColor: finance.cash < 50000 ? 'border-coral/30' : 'border-neon/30',
      delay: '0s',
    },
    {
      icon: Leaf,
      label: '碳减排',
      value: `${carbonMetrics.totalReduction}t`,
      color: 'text-neon',
      borderColor: 'border-neon/30',
      delay: '0.05s',
    },
    {
      icon: Truck,
      label: '交付率',
      value: `${reputation.deliveryRate}%`,
      color: reputation.deliveryRate >= 80 ? 'text-neon' : reputation.deliveryRate >= 50 ? 'text-amber' : 'text-coral',
      borderColor: reputation.deliveryRate >= 80 ? 'border-neon/30' : reputation.deliveryRate >= 50 ? 'border-amber/30' : 'border-coral/30',
      delay: '0.1s',
    },
    {
      icon: AlertTriangle,
      label: '库存风险',
      value: inventoryRisk ? inventoryRisk.join('/') + '不足' : '安全',
      color: inventoryRisk ? 'text-coral' : 'text-neon',
      borderColor: inventoryRisk ? 'border-coral/30' : 'border-neon/30',
      delay: '0.15s',
    },
    {
      icon: Award,
      label: '声誉等级',
      value: reputation.level,
      color: '',
      extra: levelColor[reputation.level] || '',
      isBadge: true,
      delay: '0.2s',
    },
    {
      icon: Calendar,
      label: '季度进度',
      value: `Q${quarter}/${maxQuarters}`,
      color: 'text-ice',
      borderColor: 'border-ice/30',
      delay: '0.25s',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`card ${card.borderColor || ''} animate-slide-in-up`}
          style={{ animationDelay: card.delay }}
        >
          <div className="flex items-center gap-2 mb-2">
            <card.icon className="w-4 h-4 text-slate-500" />
            <span className="stat-label">{card.label}</span>
          </div>
          {card.isBadge ? (
            <span className={`inline-block font-display font-bold text-3xl px-3 py-0.5 rounded border ${card.extra}`}>
              {card.value}
            </span>
          ) : (
            <p className={`stat-value ${card.color} animate-count-up`}>{card.value}</p>
          )}
        </div>
      ))}
    </div>
  )
}

function EventPanel() {
  const events = useGameStore(s => s.events)
  const resolveEvent = useGameStore(s => s.resolveEvent)

  const severityStyle: Record<string, { border: string; icon: typeof AlertCircle; color: string }> = {
    high: { border: 'border-coral/40', icon: XCircle, color: 'text-coral' },
    medium: { border: 'border-amber/40', icon: AlertCircle, color: 'text-amber' },
    low: { border: 'border-ice/40', icon: AlertCircle, color: 'text-ice' },
  }

  if (events.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon" />
          本季事件
        </h3>
        <p className="text-slate-500 text-sm font-body">当前季度暂无事件</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="section-title mb-3 flex items-center gap-2">
        <Zap className="w-5 h-5 text-neon" />
        本季事件
      </h3>
      <div className="space-y-2">
        {events.map(event => {
          const style = severityStyle[event.severity] || severityStyle.low
          const SevIcon = style.icon
          return (
            <div
              key={event.id}
              className={`rounded-lg border ${style.border} bg-base-700/50 p-3 animate-slide-in-right ${event.resolved ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-2">
                <SevIcon className={`w-4 h-4 mt-0.5 shrink-0 ${style.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-white text-sm">{event.title}</span>
                    {event.resolved && (
                      <span className="text-[10px] text-neon/60 border border-neon/30 rounded px-1.5 py-0.5">已处理</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-body">{event.description}</p>
                  {!event.resolved && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => resolveEvent(event.id, 'pay')}
                        className="text-[10px] btn-danger py-1 px-2"
                      >
                        罚款处理
                      </button>
                      <button
                        onClick={() => resolveEvent(event.id, 'fix')}
                        className="text-[10px] btn-primary py-1 px-2"
                      >
                        投资修复
                      </button>
                      <button
                        onClick={() => resolveEvent(event.id, 'accept')}
                        className="text-[10px] btn-secondary py-1 px-2"
                      >
                        接受影响
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrdersSummary() {
  const orders = useGameStore(s => s.orders)

  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    pending: { label: '待处理', color: 'text-slate-400', icon: Clock },
    producing: { label: '生产中', color: 'text-ice', icon: Package },
    completed: { label: '已完成', color: 'text-neon', icon: CheckCircle2 },
    overdue: { label: '已逾期', color: 'text-coral', icon: XCircle },
    delivering: { label: '运输中', color: 'text-amber', icon: Truck },
  }

  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="card">
      <h3 className="section-title mb-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-neon" />
        订单概览
      </h3>

      <div className="flex gap-4 mb-4">
        {Object.entries(statusConfig).map(([status, cfg]) => {
          const count = counts[status] || 0
          if (count === 0) return null
          return (
            <div key={status} className="flex items-center gap-1.5">
              <cfg.icon className={`w-3.5 h-3.5 ${cfg.color}`} />
              <span className={`text-xs font-display font-semibold ${cfg.color}`}>{count}</span>
              <span className="text-[10px] text-slate-500">{cfg.label}</span>
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        {recentOrders.map(order => {
          const cfg = statusConfig[order.status] || statusConfig.pending
          const StatusIcon = cfg.icon
          return (
            <div key={order.id} className="flex items-center gap-3 bg-base-700/40 rounded-lg px-3 py-2">
              <StatusIcon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-body text-white truncate">{order.clientName}</span>
                  <span className="text-[10px] text-slate-500">{order.materialName} ×{order.quantity}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-display text-neon">¥{order.price.toLocaleString()}</span>
                <p className="text-[10px] text-slate-500">截止 Q{order.deadline}</p>
              </div>
              {order.urgency >= 3 && (
                <AlertTriangle className="w-3.5 h-3.5 text-coral shrink-0" />
              )}
            </div>
          )
        })}
        {orders.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">暂无订单</p>
        )}
      </div>
    </div>
  )
}

function PhaseActions() {
  const { phase, quarter, maxQuarters, gameOver, advancePhase, nextQuarter } = useGameStore()

  if (gameOver) {
    return (
      <div className="card border-neon/40 text-center py-6 animate-glow-pulse">
        <Trophy className="w-10 h-10 text-neon mx-auto mb-3" />
        <h3 className="font-display font-bold text-2xl text-white mb-1">经营结束</h3>
        <p className="text-sm text-slate-400 font-body">12个季度的经营已完成，请查看评分页面获取最终成绩</p>
      </div>
    )
  }

  const phaseLabels: Record<string, { label: string; color: string }> = {
    event: { label: '事件阶段', color: 'text-amber' },
    decision: { label: '决策阶段', color: 'text-ice' },
    settle: { label: '结算阶段', color: 'text-amber' },
    scoring: { label: '评分阶段', color: 'text-neon' },
  }

  const currentPhase = phaseLabels[phase] || phaseLabels.decision

  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${phase === 'decision' ? 'bg-neon animate-glow-pulse' : phase === 'scoring' ? 'bg-amber' : 'bg-ice'} `} />
          <span className={`font-display font-semibold text-sm ${currentPhase.color}`}>{currentPhase.label}</span>
        </div>
        <span className="text-xs text-slate-500 font-body">
          第 {quarter} / {maxQuarters} 季度
        </span>
      </div>
      <div className="flex items-center gap-3">
        {phase === 'decision' && (
          <button onClick={advancePhase} className="btn-primary flex items-center gap-2 text-sm">
            进入结算
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {phase === 'event' && (
          <button onClick={advancePhase} className="btn-amber flex items-center gap-2 text-sm">
            处理事件并继续
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        {phase === 'scoring' && (
          <button onClick={nextQuarter} className="btn-primary flex items-center gap-2 text-sm">
            下一季度
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {phase === 'settle' && (
          <span className="text-xs text-amber font-body animate-pulse">正在结算中...</span>
        )}
      </div>
    </div>
  )
}

function InventoryBar() {
  const { inventory } = useGameStore()

  const items = [
    { name: '镍', current: inventory.nickel, safety: inventory.nickelSafety, price: inventory.marketPrices.nickel },
    { name: '钴', current: inventory.cobalt, safety: inventory.cobaltSafety, price: inventory.marketPrices.cobalt },
    { name: '锂', current: inventory.lithium, safety: inventory.lithiumSafety, price: inventory.marketPrices.lithium },
  ]

  return (
    <div className="card">
      <h3 className="section-title mb-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-neon" />
        库存概况
      </h3>
      <div className="space-y-3">
        {items.map(item => {
          const ratio = item.safety > 0 ? item.current / item.safety : 1
          const isLow = item.current < item.safety
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-body text-slate-300">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-display font-bold ${isLow ? 'text-coral' : 'text-neon'}`}>
                    {item.current}
                  </span>
                  <span className="text-[10px] text-slate-500">/ 安全线 {item.safety}</span>
                  <span className="text-[10px] text-ice">¥{item.price}/单位</span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-bar-fill ${isLow ? 'bg-coral' : ratio < 1.5 ? 'bg-amber' : 'bg-neon'}`}
                  style={{ width: `${Math.min(100, ratio * 50)}%` }}
                />
              </div>
            </div>
          )
        })}
        <div className="flex items-center justify-between pt-2 border-t border-base-600">
          <span className="text-xs font-body text-slate-300">梯次电池包</span>
          <span className="text-xs font-display font-bold text-ice">{inventory.cascadeBattery}</span>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const started = useGameStore(s => s.started)

  if (!started) {
    return <LandingScreen />
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">经营总览</h2>
          <p className="text-xs text-slate-500 font-body">实时监控核心指标与运营状况</p>
        </div>
      </div>

      <PhaseActions />

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EventPanel />
        <InventoryBar />
      </div>

      <OrdersSummary />
    </div>
  )
}
