import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import { useGameStore } from '@/store/gameStore'
import {
  LayoutDashboard, MapPin, DollarSign, ClipboardCheck,
  Factory, Beaker, Truck, ShieldCheck, Trophy, Zap
} from 'lucide-react'
import Dashboard from '@/pages/Dashboard'
import CityExpansion from '@/pages/CityExpansion'
import RecyclingPricing from '@/pages/RecyclingPricing'
import InspectionGrading from '@/pages/InspectionGrading'
import DismantlingProduction from '@/pages/DismantlingProduction'
import MaterialAllocation from '@/pages/MaterialAllocation'
import CustomerDelivery from '@/pages/CustomerDelivery'
import EnvironmentalAudit from '@/pages/EnvironmentalAudit'
import QuarterlyScoring from '@/pages/QuarterlyScoring'

const NAV_ITEMS = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/city', label: '城市拓展', icon: MapPin },
  { path: '/pricing', label: '回收定价', icon: DollarSign },
  { path: '/inspection', label: '检测分级', icon: ClipboardCheck },
  { path: '/dismantling', label: '拆解排产', icon: Factory },
  { path: '/materials', label: '材料配比', icon: Beaker },
  { path: '/delivery', label: '客户交付', icon: Truck },
  { path: '/audit', label: '环保审计', icon: ShieldCheck },
  { path: '/scoring', label: '季度评分', icon: Trophy },
]

function Sidebar() {
  const { started, quarter, finance, reputation } = useGameStore()

  return (
    <aside className="w-56 min-h-screen bg-base-800 border-r border-base-600 flex flex-col shrink-0">
      <div className="p-4 border-b border-base-600">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-neon" />
          <div>
            <h1 className="font-display font-bold text-lg text-neon glow-text leading-tight">绿能回生</h1>
            <p className="text-[10px] text-slate-500 font-body">Battery Reborn Strategy</p>
          </div>
        </div>
      </div>

      {started && (
        <div className="px-4 py-3 border-b border-base-600 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">季度</span>
            <span className="text-ice font-display font-bold">Q{quarter}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">现金</span>
            <span className={`font-display font-bold ${finance.cash < 50000 ? 'text-coral' : 'text-neon'}`}>
              ¥{(finance.cash / 10000).toFixed(1)}万
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">声誉</span>
            <span className={`font-display font-bold ${
              reputation.level === 'S' ? 'text-neon' :
              reputation.level === 'A' ? 'text-ice' :
              reputation.level === 'B' ? 'text-amber' : 'text-coral'
            }`}>{reputation.level}</span>
          </div>
        </div>
      )}

      <nav className="flex-1 py-2">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-all duration-200 ${
                isActive
                  ? 'bg-neon/10 text-neon border-r-2 border-neon'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-base-700'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-base-600">
        <p className="text-[10px] text-slate-600 text-center">v1.0 · 新能源电池回收策略</p>
      </div>
    </aside>
  )
}

function TopBar() {
  const { started, notifications, markNotificationRead } = useGameStore()
  const unread = notifications.filter(n => !n.read).length

  if (!started) return null

  return (
    <header className="h-12 bg-base-800 border-b border-base-600 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400 font-body">
          决策阶段 · 请完成各模块操作后进入结算
        </span>
      </div>
      <div className="relative group">
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-coral text-white text-[10px] rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
        <div className="flex items-center gap-2 text-slate-400 hover:text-white cursor-pointer">
          <span className="text-xs">通知 ({unread})</span>
        </div>
        {unread > 0 && (
          <div className="hidden group-hover:block absolute right-0 top-8 w-72 max-h-60 overflow-y-auto bg-base-800 border border-base-600 rounded-lg shadow-lg z-50">
            {notifications.filter(n => !n.read).map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`px-3 py-2 border-b border-base-700 cursor-pointer hover:bg-base-700 text-xs ${
                  n.type === 'danger' ? 'text-coral' :
                  n.type === 'warning' ? 'text-amber' :
                  n.type === 'success' ? 'text-neon' : 'text-ice'
                }`}
              >
                {n.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-base-900">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/city" element={<CityExpansion />} />
              <Route path="/pricing" element={<RecyclingPricing />} />
              <Route path="/inspection" element={<InspectionGrading />} />
              <Route path="/dismantling" element={<DismantlingProduction />} />
              <Route path="/materials" element={<MaterialAllocation />} />
              <Route path="/delivery" element={<CustomerDelivery />} />
              <Route path="/audit" element={<EnvironmentalAudit />} />
              <Route path="/scoring" element={<QuarterlyScoring />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
