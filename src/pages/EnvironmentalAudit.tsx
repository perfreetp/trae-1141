import { useGameStore } from '@/store/gameStore'
import { ShieldCheck, Leaf, AlertTriangle, Flame, Droplets } from 'lucide-react'

const BREAKDOWN_ITEMS = [
  { key: 'recycling' as const, label: '回收', color: 'bg-neon', icon: Leaf },
  { key: 'cascade' as const, label: '梯次利用', color: 'bg-ice', icon: Droplets },
  { key: 'dismantling' as const, label: '拆解', color: 'bg-amber', icon: Flame },
  { key: 'transport' as const, label: '运输', color: 'bg-coral', icon: AlertTriangle },
]

function ComplianceBadge({ score }: { score: number }) {
  const cls =
    score >= 70
      ? 'bg-neon/20 text-neon border-neon/40'
      : score >= 40
        ? 'bg-amber/20 text-amber border-amber/40'
        : 'bg-coral/20 text-coral border-coral/40'
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-display font-bold ${cls}`}>
      <ShieldCheck className="w-4 h-4" />
      {score}分
    </span>
  )
}

function CircularProgress({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const r = 54
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct)

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1A3547" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#00FF88" strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.4))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl text-neon glow-text">
          {value}
        </span>
        <span className="text-[10px] text-slate-400 font-body">/ {max}</span>
      </div>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  const map = {
    low: 'bg-amber/20 text-amber border-amber/40',
    medium: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    high: 'bg-coral/20 text-coral border-coral/40',
  }
  const label = { low: '低', medium: '中', high: '高' }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-display font-bold border ${map[severity]}`}>
      {label[severity]}
    </span>
  )
}

export default function EnvironmentalAudit() {
  const { carbonMetrics, events, reputation, resolveEvent, finance } = useGameStore()
  const { totalReduction, targetReduction, breakdown, complianceScore, pollutionIncidents } = carbonMetrics

  const unresolvedPollutionEvents = events.filter(
    e => e.type === 'pollution_warning' && !e.resolved
  )

  const totalBreakdown = breakdown.recycling + breakdown.cascade + breakdown.dismantling + breakdown.transport

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-neon" />
          环保审计
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">
          碳排放追踪与合规管理 · 监控减排进度，处理环境事件
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-5">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Leaf className="w-4 h-4 text-neon" />
            碳排放追踪
          </h3>

          <div className="flex items-center justify-center py-2">
            <CircularProgress value={totalReduction} max={targetReduction} />
          </div>

          <div className="space-y-3">
            {BREAKDOWN_ITEMS.map(item => {
              const val = breakdown[item.key]
              const pct = totalBreakdown > 0 ? (val / totalReduction) * 100 : 0
              const Icon = item.icon
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-body">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </span>
                    <span className="font-display font-bold text-white">{val}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${item.color}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-base-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-body">合规评分</span>
            </div>
            <ComplianceBadge score={complianceScore} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${pollutionIncidents > 0 ? 'text-coral' : 'text-slate-400'}`} />
              <span className="text-xs text-slate-400 font-body">污染事件</span>
            </div>
            <span className={`font-display font-bold text-sm ${
              pollutionIncidents > 0 ? 'text-coral' : 'text-neon'
            }`}>
              {pollutionIncidents}{pollutionIncidents > 0 ? ' ⚠' : ''}
            </span>
          </div>
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber" />
              环境事件
            </h3>
            <span className="text-xs text-slate-500 font-body">
              {unresolvedPollutionEvents.length} 件待处理
            </span>
          </div>

          {unresolvedPollutionEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ShieldCheck className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm font-body">暂无待处理环境事件</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {unresolvedPollutionEvents.map(ev => (
                <div
                  key={ev.id}
                  className="bg-base-700 border border-base-500 rounded-lg p-4 space-y-3 animate-slide-in-up"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-sm text-white">{ev.title}</span>
                        <SeverityBadge severity={ev.severity} />
                      </div>
                      <p className="text-xs text-slate-400 font-body leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => resolveEvent(ev.id, 'pay')}
                      className="btn-amber text-xs px-3 py-1.5"
                    >
                      缴纳罚款 ~¥30,000
                    </button>
                    <button
                      onClick={() => resolveEvent(ev.id, 'fix')}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      整改处理 ~¥20,000
                    </button>
                    <button
                      onClick={() => resolveEvent(ev.id, 'accept')}
                      className="btn-danger text-xs px-3 py-1.5"
                    >
                      接受影响
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neon/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-neon" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-body">环境声誉评分</p>
            <p className="font-display font-bold text-lg text-white">
              {reputation.environmentalScore}
              <span className="text-slate-500 text-sm font-body ml-1">/ 100</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ComplianceBadge score={reputation.environmentalScore} />
          <span className={`font-display font-bold text-xl ${
            reputation.environmentalScore >= 70 ? 'text-neon' :
            reputation.environmentalScore >= 40 ? 'text-amber' : 'text-coral'
          }`}>
            {reputation.environmentalScore >= 70 ? 'A' :
             reputation.environmentalScore >= 40 ? 'C' : 'D'}
          </span>
        </div>
      </div>
    </div>
  )
}
