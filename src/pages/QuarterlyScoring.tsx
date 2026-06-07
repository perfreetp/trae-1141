import { Trophy, TrendingUp, ArrowRight, Medal } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

function computeLevel(score: number): string {
  if (score >= 90) return 'S'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

const LEVEL_STYLES: Record<string, { color: string; shadow: string; textShadow: string; gradient: string }> = {
  S: {
    color: 'text-amber-light',
    shadow: '0 0 60px rgba(245,158,11,0.6), 0 0 120px rgba(245,158,11,0.3)',
    textShadow: '0 0 30px rgba(245,158,11,0.9), 0 0 60px rgba(245,158,11,0.5)',
    gradient: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
  },
  A: {
    color: 'text-neon',
    shadow: '0 0 60px rgba(0,255,136,0.6), 0 0 120px rgba(0,255,136,0.3)',
    textShadow: '0 0 30px rgba(0,255,136,0.9), 0 0 60px rgba(0,255,136,0.5)',
    gradient: 'radial-gradient(circle, rgba(0,255,136,0.25) 0%, transparent 70%)',
  },
  B: {
    color: 'text-ice',
    shadow: '0 0 60px rgba(56,189,248,0.6), 0 0 120px rgba(56,189,248,0.3)',
    textShadow: '0 0 30px rgba(56,189,248,0.9), 0 0 60px rgba(56,189,248,0.5)',
    gradient: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
  },
  C: {
    color: 'text-amber',
    shadow: '0 0 40px rgba(245,158,11,0.4), 0 0 80px rgba(245,158,11,0.2)',
    textShadow: '0 0 20px rgba(245,158,11,0.7), 0 0 40px rgba(245,158,11,0.3)',
    gradient: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
  },
  D: {
    color: 'text-coral',
    shadow: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)',
    textShadow: '0 0 20px rgba(239,68,68,0.8), 0 0 40px rgba(239,68,68,0.4)',
    gradient: 'radial-gradient(circle, rgba(239,68,68,0.25) 0%, transparent 70%)',
  },
}

const DIMENSIONS = [
  { key: 'financialScore' as const, label: '财务', bar: 'bg-neon', text: 'text-neon' },
  { key: 'customerScore' as const, label: '客户满意度', bar: 'bg-ice', text: 'text-ice' },
  { key: 'environmentalScore' as const, label: '环保', bar: 'bg-amber', text: 'text-amber' },
  { key: 'operationScore' as const, label: '运营效率', bar: 'bg-purple-500', text: 'text-purple-400' },
]

function CashFlowChart({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const slots = 10
  const step = Math.max(1, Math.floor(data.length / slots))
  const sampled = data.filter((_, i) => i % step === 0 || i === data.length - 1).slice(-slots)

  return (
    <div className="flex items-end gap-1.5 h-20">
      {sampled.map((val, i) => {
        const ratio = (val - min) / range
        const h = Math.max(6, ratio * 64 + 8)
        const isUp = i === 0 || val >= sampled[i - 1]
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-sm transition-all duration-500 ${isUp ? 'bg-neon/50' : 'bg-coral/50'}`}
              style={{ height: h }}
            />
            <span className="text-[9px] text-slate-500 font-display">Q{i + 1}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function QuarterlyScoring() {
  const {
    quarter, maxQuarters, gameOver, phase,
    history, finance, reputation, carbonMetrics,
    advancePhase, nextQuarter,
  } = useGameStore()

  const latest = history.length > 0 ? history[history.length - 1] : null
  const levelKey = reputation.level
  const style = LEVEL_STYLES[levelKey] ?? LEVEL_STYLES.B
  const isGameOver = gameOver || quarter >= maxQuarters

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title flex items-center gap-2">
          <Trophy className="w-6 h-6 text-neon" />
          季度评分
        </h2>
        <p className="text-slate-400 text-sm font-body mt-1">第{quarter}季度经营绩效综合评估</p>
      </div>

      {phase === 'decision' && (
        <div className="card flex flex-col items-center py-12 gap-4">
          <Medal className="w-12 h-12 text-neon/50" />
          <p className="text-slate-300 font-body text-center">当前处于决策阶段，请先完成各模块操作</p>
          <button className="btn-primary flex items-center gap-2" onClick={advancePhase}>
            进入结算 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {phase !== 'decision' && latest && (
        <div className="space-y-4 animate-slide-in-up">
          <div className="card flex flex-col items-center py-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ background: style.gradient }} />

            <div
              className="relative w-32 h-32 rounded-full border-4 flex items-center justify-center animate-glow-pulse"
              style={{
                borderColor: levelKey === 'S' ? 'rgba(245,158,11,0.6)' : levelKey === 'A' ? 'rgba(0,255,136,0.6)' : levelKey === 'B' ? 'rgba(56,189,248,0.6)' : levelKey === 'C' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.5)',
                boxShadow: style.shadow,
              }}
            >
              <span
                className={`font-display font-bold text-5xl ${style.color}`}
                style={{ textShadow: style.textShadow }}
              >
                {levelKey}
              </span>
            </div>

            <div className="mt-5 text-center relative">
              <p className="stat-label mb-1">综合评分</p>
              <p className={`stat-value ${style.color}`} style={{ textShadow: style.textShadow }}>
                {reputation.score}
              </p>
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="text-xs text-slate-500 font-body uppercase tracking-widest">维度评分</h3>
            {DIMENSIONS.map(dim => {
              const val = latest[dim.key] ?? 0
              return (
                <div key={dim.key} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-body ${dim.text}`}>{dim.label}</span>
                    <span className={`font-display font-bold text-lg ${dim.text}`}>{val}</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar-fill ${dim.bar}`} style={{ width: `${val}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: '现金', value: `¥${(finance.cash / 1000).toFixed(0)}K`, cls: 'text-neon' },
              { label: '季度利润', value: `¥${(finance.profit / 1000).toFixed(0)}K`, cls: finance.profit >= 0 ? 'text-neon' : 'text-coral' },
              { label: '碳减排', value: `${carbonMetrics.totalReduction}t`, cls: 'text-amber' },
              { label: '交付率', value: `${reputation.deliveryRate}%`, cls: 'text-ice' },
              { label: '库存风险', value: `${latest.inventoryRisk}%`, cls: latest.inventoryRisk > 50 ? 'text-coral' : latest.inventoryRisk > 20 ? 'text-amber' : 'text-neon' },
            ].map(m => (
              <div key={m.label} className="card text-center py-3">
                <p className="stat-label">{m.label}</p>
                <p className={`font-display font-bold text-lg ${m.cls}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {!isGameOver ? (
            <div className="flex justify-center">
              <button className="btn-primary flex items-center gap-2 text-lg px-8 py-3" onClick={nextQuarter}>
                下一季度 <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="card text-center py-8 space-y-3">
              <Trophy className="w-12 h-12 text-amber mx-auto" />
              <p className="font-display font-bold text-2xl text-amber glow-text">游戏结束</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-body text-slate-400">
                <span>最终评级 <strong className={`text-lg ${style.color}`} style={{ textShadow: style.textShadow }}>{levelKey}</strong></span>
                <span>|</span>
                <span>评分 <strong className="text-white">{reputation.score}</strong></span>
                <span>|</span>
                <span>现金 <strong className="text-neon">¥{finance.cash.toLocaleString()}</strong></span>
                <span>|</span>
                <span>碳减排 <strong className="text-amber">{carbonMetrics.totalReduction}t</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-ice" />
            历史记录
          </h3>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm font-body min-w-[640px]">
              <thead>
                <tr className="text-slate-500 border-b border-base-600 text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-3">季度</th>
                  <th className="text-right py-3 px-3">现金</th>
                  <th className="text-right py-3 px-3">收入</th>
                  <th className="text-right py-3 px-3">成本</th>
                  <th className="text-right py-3 px-3">利润</th>
                  <th className="text-right py-3 px-3">碳减排</th>
                  <th className="text-right py-3 px-3">交付率</th>
                  <th className="text-right py-3 px-3">评分</th>
                  <th className="text-right py-3 px-3">评级</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => {
                  const lvl = computeLevel(h.reputationScore)
                  const lvlStyle = LEVEL_STYLES[lvl] ?? LEVEL_STYLES.B
                  return (
                    <tr key={h.quarter} className="border-b border-base-700/40 hover:bg-base-700/20 transition-colors">
                      <td className="py-2.5 px-3 text-slate-300 font-display font-semibold">Q{h.quarter}</td>
                      <td className="py-2.5 px-3 text-right text-neon font-display">¥{h.cash.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-display">¥{h.revenue.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-coral/80 font-display">¥{h.cost.toLocaleString()}</td>
                      <td className={`py-2.5 px-3 text-right font-display font-semibold ${h.profit >= 0 ? 'text-neon' : 'text-coral'}`}>
                        ¥{h.profit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber font-display">{h.carbonReduction}t</td>
                      <td className="py-2.5 px-3 text-right text-ice font-display">{h.deliveryRate}%</td>
                      <td className="py-2.5 px-3 text-right text-white font-display">{h.reputationScore}</td>
                      <td className={`py-2.5 px-3 text-right font-display font-bold ${lvlStyle.color}`}>{lvl}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {finance.cashFlow.length > 1 && (
        <div className="space-y-3">
          <h3 className="section-title flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-neon" />
            现金流趋势
          </h3>
          <div className="card">
            <CashFlowChart data={finance.cashFlow} />
            <div className="flex justify-between mt-3 text-xs font-body text-slate-500">
              <span>起始 ¥{finance.cashFlow[0].toLocaleString()}</span>
              <span>当前 ¥{finance.cashFlow[finance.cashFlow.length - 1].toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
