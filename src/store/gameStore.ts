import { create } from 'zustand'
import type {
  GameState, City, RecyclingStation, BatteryBatch, Order,
  GameEvent, Finance, CarbonMetrics, Reputation, InspectionLine,
  ProductionLine, MaterialInventory, QuarterHistory, Notification,
  PurchaseOrder
} from '@/types/game'

const CITIES_DATA: Omit<City, 'stations'>[] = [
  { id: 'shanghai', name: '上海', region: '华东', unlocked: true, unlockCost: 0, x: 82, y: 52, population: 2489, evPenetration: 0.42, baseRecyclingRate: 120, transportCapacity: 100, transportCost: 8, transportDisrupted: false },
  { id: 'beijing', name: '北京', region: '华北', unlocked: true, unlockCost: 0, x: 68, y: 28, population: 2189, evPenetration: 0.38, baseRecyclingRate: 100, transportCapacity: 90, transportCost: 10, transportDisrupted: false },
  { id: 'shenzhen', name: '深圳', region: '华南', unlocked: false, unlockCost: 80000, x: 74, y: 78, population: 1768, evPenetration: 0.45, baseRecyclingRate: 130, transportCapacity: 110, transportCost: 12, transportDisrupted: false },
  { id: 'guangzhou', name: '广州', region: '华南', unlocked: false, unlockCost: 75000, x: 72, y: 74, population: 1881, evPenetration: 0.35, baseRecyclingRate: 95, transportCapacity: 95, transportCost: 11, transportDisrupted: false },
  { id: 'chengdu', name: '成都', region: '西南', unlocked: false, unlockCost: 60000, x: 42, y: 58, population: 2119, evPenetration: 0.28, baseRecyclingRate: 70, transportCapacity: 70, transportCost: 15, transportDisrupted: false },
  { id: 'wuhan', name: '武汉', region: '华中', unlocked: false, unlockCost: 55000, x: 60, y: 56, population: 1365, evPenetration: 0.30, baseRecyclingRate: 75, transportCapacity: 80, transportCost: 10, transportDisrupted: false },
  { id: 'hangzhou', name: '杭州', region: '华东', unlocked: false, unlockCost: 65000, x: 80, y: 56, population: 1237, evPenetration: 0.40, baseRecyclingRate: 90, transportCapacity: 85, transportCost: 9, transportDisrupted: false },
  { id: 'hefei', name: '合肥', region: '华东', unlocked: false, unlockCost: 45000, x: 72, y: 50, population: 947, evPenetration: 0.32, baseRecyclingRate: 65, transportCapacity: 65, transportCost: 8, transportDisrupted: false },
  { id: 'chongqing', name: '重庆', region: '西南', unlocked: false, unlockCost: 50000, x: 38, y: 60, population: 3212, evPenetration: 0.25, baseRecyclingRate: 60, transportCapacity: 60, transportCost: 18, transportDisrupted: false },
  { id: 'changsha', name: '长沙', region: '华中', unlocked: false, unlockCost: 40000, x: 58, y: 64, population: 1042, evPenetration: 0.27, baseRecyclingRate: 55, transportCapacity: 55, transportCost: 12, transportDisrupted: false },
]

const CLIENT_NAMES = ['国轩储能', '宁德能源', '比亚迪储能', '华为数字能源', '远景储能', '阳光电源', '亿纬锂能', '中创新航', '蜂巢能源', '欣旺达']
const CLIENT_TYPES: Order['clientType'][] = ['储能厂', '电动车厂', '材料商', '电网公司']

const MATERIAL_TO_INVENTORY_KEY: Record<string, 'nickel' | 'cobalt' | 'lithium' | 'cascadeBattery'> = {
  nickel: 'nickel',
  cobalt: 'cobalt',
  lithium: 'lithium',
  cascade_battery: 'cascadeBattery',
}

function makeId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function createStation(cityId: string, level: number): RecyclingStation {
  return {
    id: makeId(),
    cityId,
    level,
    subsidyPrice: 200,
    predictedVolume: 0,
    actualVolume: 0,
    batches: [],
    buildCost: 50000 * level,
    upgradeCost: 30000 * level,
  }
}

function createInspectionLines(): InspectionLine[] {
  return [
    { id: 'il-1', name: '检测线A', capacity: 100, usedCapacity: 0, status: 'idle' },
    { id: 'il-2', name: '检测线B', capacity: 80, usedCapacity: 0, status: 'idle' },
  ]
}

function createProductionLines(): ProductionLine[] {
  return [
    { id: 'pl-1', name: '拆解线1', capacity: 60, usedCapacity: 0, status: 'idle', progress: 0 },
    { id: 'pl-2', name: '拆解线2', capacity: 40, usedCapacity: 0, status: 'idle', progress: 0 },
  ]
}

function generateEvents(quarter: number, orders: Order[]): GameEvent[] {
  const events: GameEvent[] = []
  const eventTemplates = [
    {
      type: 'price_fluctuation' as const,
      title: '锂价暴涨',
      description: '全球锂矿供应紧张，锂价上涨30%，采购成本增加',
      impact: { lithiumPrice: 1.3 },
      severity: 'high' as const,
    },
    {
      type: 'price_fluctuation' as const,
      title: '钴价回落',
      description: '刚果钴矿产量恢复，钴价下跌15%',
      impact: { cobaltPrice: 0.85 },
      severity: 'low' as const,
    },
    {
      type: 'pollution_warning' as const,
      title: '拆解废水泄漏',
      description: '拆解产线发生废水泄漏，面临环保处罚风险',
      impact: { complianceScore: -15, pollutionIncidents: 1 },
      severity: 'high' as const,
    },
    {
      type: 'transport_disruption' as const,
      title: '暴雨影响运输',
      description: '华南地区暴雨导致公路运输受限，运费上涨20%，运力下降30%',
      impact: { transportCost: 1.2, transportCapacity: 0.7 },
      severity: 'medium' as const,
    },
    {
      type: 'price_fluctuation' as const,
      title: '镍价波动',
      description: '印尼镍矿出口政策变化，镍价上涨12%',
      impact: { nickelPrice: 1.12 },
      severity: 'medium' as const,
    },
    {
      type: 'pollution_warning' as const,
      title: '粉尘超标警告',
      description: '检测线粉尘排放接近超标限值，需加强防护',
      impact: { complianceScore: -8, pollutionIncidents: 0.5 },
      severity: 'low' as const,
    },
    {
      type: 'transport_disruption' as const,
      title: '铁路检修',
      description: '华中铁路线路检修，运费上涨15%，运力下降20%',
      impact: { transportCost: 1.15, transportCapacity: 0.8 },
      severity: 'low' as const,
    },
  ]

  const count = 1 + Math.floor(Math.random() * 2)
  const shuffled = [...eventTemplates].sort(() => Math.random() - 0.5)
  for (let i = 0; i < count && i < shuffled.length; i++) {
    const t = shuffled[i]
    events.push({
      id: makeId(),
      type: t.type,
      title: t.title,
      description: t.description,
      impact: { ...t.impact },
      resolved: false,
      severity: t.severity,
      quarter,
    })
  }

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'producing')
  if (activeOrders.length > 0 && Math.random() < 0.4) {
    const targetOrder = activeOrders[Math.floor(Math.random() * activeOrders.length)]
    events.push({
      id: makeId(),
      type: 'customer_urgency',
      title: '客户紧急催单',
      description: `${targetOrder.clientName}要求提前交付${targetOrder.materialName}订单，否则将加收违约金`,
      impact: { urgency: 2, penaltyMultiplier: 1.5 },
      resolved: false,
      severity: 'medium',
      quarter,
      targetOrderId: targetOrder.id,
      targetClientName: targetOrder.clientName,
    })
  }

  return events
}

function generateOrders(quarter: number, existingOrders: Order[]): Order[] {
  const newOrders: Order[] = []
  const count = 2 + Math.floor(Math.random() * 3)
  const materials: { key: Order['material']; name: string; priceRange: [number, number] }[] = [
    { key: 'nickel', name: '镍', priceRange: [120, 180] },
    { key: 'cobalt', name: '钴', priceRange: [200, 320] },
    { key: 'lithium', name: '锂', priceRange: [300, 500] },
    { key: 'cascade_battery', name: '梯次电池包', priceRange: [400, 650] },
  ]

  for (let i = 0; i < count; i++) {
    const mat = materials[Math.floor(Math.random() * materials.length)]
    const qty = 10 + Math.floor(Math.random() * 40)
    const price = mat.priceRange[0] + Math.floor(Math.random() * (mat.priceRange[1] - mat.priceRange[0]))
    const clientName = CLIENT_NAMES[Math.floor(Math.random() * CLIENT_NAMES.length)]
    const clientType = CLIENT_TYPES[Math.floor(Math.random() * CLIENT_TYPES.length)]
    newOrders.push({
      id: makeId(),
      clientName,
      clientType,
      material: mat.key,
      materialName: mat.name,
      quantity: qty,
      remainingQuantity: qty,
      deadline: quarter + 1 + Math.floor(Math.random() * 2),
      price: price * qty,
      penalty: Math.floor(price * qty * 0.2),
      status: 'pending',
      urgency: Math.floor(Math.random() * 3) + 1,
      allocatedQuantity: 0,
      transportCost: Math.floor(qty * (5 + Math.random() * 10)),
    })
  }
  return [...existingOrders.filter(o => o.status !== 'completed' && o.status !== 'overdue'), ...newOrders]
}

function computePredictedVolume(station: RecyclingStation, city: City): number {
  const baseFactor = city.baseRecyclingRate * city.evPenetration
  const priceFactor = station.subsidyPrice / 200
  const levelFactor = station.level * 0.8 + 0.2
  return Math.floor(baseFactor * priceFactor * levelFactor * (0.9 + Math.random() * 0.2))
}

function computeReputationLevel(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

function computeInventoryRisk(inv: MaterialInventory): number {
  const nRisk = inv.nickel < inv.nickelSafety ? (inv.nickelSafety - inv.nickel) / inv.nickelSafety : 0
  const cRisk = inv.cobalt < inv.cobaltSafety ? (inv.cobaltSafety - inv.cobalt) / inv.cobaltSafety : 0
  const lRisk = inv.lithium < inv.lithiumSafety ? (inv.lithiumSafety - inv.lithium) / inv.lithiumSafety : 0
  return Math.min(100, Math.floor((nRisk + cRisk + lRisk) / 3 * 100))
}

function computeDeliveryRate(orders: Order[]): number {
  const total = orders.length
  if (total === 0) return 100
  const completed = orders.filter(o => o.status === 'completed').length
  return Math.floor((completed / total) * 100)
}

function getInitialState(): GameState {
  const cities: City[] = CITIES_DATA.map(c => ({
    ...c,
    stations: c.unlocked ? [createStation(c.id, 1)] : [],
  }))

  cities.forEach(city => {
    city.stations.forEach(station => {
      station.predictedVolume = computePredictedVolume(station, city)
    })
  })

  return {
    quarter: 1,
    maxQuarters: 12,
    phase: 'decision',
    currentStep: 0,
    started: false,
    gameOver: false,
    cities,
    orders: generateOrders(1, []),
    events: [],
    finance: {
      cash: 500000,
      revenue: 0,
      cost: 0,
      profit: 0,
      cashFlow: [500000],
      totalRevenue: 0,
      totalCost: 0,
    },
    reputation: {
      level: 'B',
      score: 60,
      deliveryRate: 100,
      customerSatisfaction: 70,
      environmentalScore: 65,
    },
    inventory: {
      nickel: 50,
      cobalt: 30,
      lithium: 20,
      cascadeBattery: 0,
      nickelSafety: 20,
      cobaltSafety: 15,
      lithiumSafety: 10,
      marketPrices: { nickel: 150, cobalt: 280, lithium: 400 },
      purchaseOrders: [],
    },
    productionLines: createProductionLines(),
    inspectionLines: createInspectionLines(),
    carbonMetrics: {
      totalReduction: 0,
      quarterlyReduction: 0,
      targetReduction: 500,
      pollutionIncidents: 0,
      complianceScore: 80,
      breakdown: { recycling: 0, cascade: 0, dismantling: 0, transport: 0 },
    },
    history: [],
    notifications: [],
  }
}

interface GameActions {
  startGame: () => void
  unlockCity: (cityId: string) => void
  buildStation: (cityId: string) => void
  upgradeStation: (cityId: string, stationId: string) => void
  setSubsidyPrice: (stationId: string, price: number) => void
  assignBatchToInspection: (batchId: string, lineId: string) => void
  runInspection: (lineId: string) => void
  assignBatchToDismantling: (batchId: string, lineId: string) => void
  runDismantling: (lineId: string) => void
  allocateMaterialToOrder: (orderId: string, material: string, quantity: number) => void
  deliverOrder: (orderId: string) => void
  setOrderTransport: (orderId: string, method: 'road' | 'rail' | 'express') => void
  purchaseMaterial: (material: 'nickel' | 'cobalt' | 'lithium', quantity: number) => void
  resolveEvent: (eventId: string, resolution: string) => void
  advancePhase: () => void
  settleQuarter: () => void
  nextQuarter: () => void
  addNotification: (type: Notification['type'], message: string) => void
  markNotificationRead: (id: string) => void
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),

  startGame: () => {
    const state = get()
    const events = generateEvents(1, state.orders)
    set({ started: true, phase: 'decision', events, notifications: [] })
    get().addNotification('info', '欢迎经营绿能回生！第1季度开始，请做出你的经营决策。')
  },

  unlockCity: (cityId: string) => {
    const state = get()
    const city = state.cities.find(c => c.id === cityId)
    if (!city || city.unlocked) return
    if (state.finance.cash < city.unlockCost) {
      get().addNotification('danger', '现金不足，无法拓展该城市！')
      return
    }
    const station = createStation(cityId, 1)
    station.predictedVolume = computePredictedVolume(station, { ...city, stations: [station] })
    set({
      cities: state.cities.map(c =>
        c.id === cityId
          ? { ...c, unlocked: true, stations: [station] }
          : c
      ),
      finance: {
        ...state.finance,
        cash: state.finance.cash - city.unlockCost,
        cost: state.finance.cost + city.unlockCost,
      },
    })
    get().addNotification('success', `成功拓展至${city.name}！已建立回收站点。`)
  },

  buildStation: (cityId: string) => {
    const state = get()
    const city = state.cities.find(c => c.id === cityId)
    if (!city || !city.unlocked) return
    const buildCost = 50000
    if (state.finance.cash < buildCost) {
      get().addNotification('danger', '现金不足，无法建设新站点！')
      return
    }
    const station = createStation(cityId, 1)
    station.predictedVolume = computePredictedVolume(station, city)
    set({
      cities: state.cities.map(c =>
        c.id === cityId
          ? { ...c, stations: [...c.stations, station] }
          : c
      ),
      finance: {
        ...state.finance,
        cash: state.finance.cash - buildCost,
        cost: state.finance.cost + buildCost,
      },
    })
    get().addNotification('success', `${city.name}新回收站点已建成！`)
  },

  upgradeStation: (cityId: string, stationId: string) => {
    const state = get()
    const city = state.cities.find(c => c.id === cityId)
    if (!city) return
    const station = city.stations.find(s => s.id === stationId)
    if (!station) return
    const upgradeCost = station.upgradeCost
    if (state.finance.cash < upgradeCost) {
      get().addNotification('danger', '现金不足，无法升级站点！')
      return
    }
    const newLevel = station.level + 1
    const newStation: RecyclingStation = {
      ...station,
      level: newLevel,
      upgradeCost: 30000 * newLevel,
      predictedVolume: computePredictedVolume({ ...station, level: newLevel }, city),
    }
    set({
      cities: state.cities.map(c =>
        c.id === cityId
          ? { ...c, stations: c.stations.map(s => s.id === stationId ? newStation : s) }
          : c
      ),
      finance: {
        ...state.finance,
        cash: state.finance.cash - upgradeCost,
        cost: state.finance.cost + upgradeCost,
      },
    })
    get().addNotification('success', `${city.name}站点升级至Lv.${newLevel}！`)
  },

  setSubsidyPrice: (stationId: string, price: number) => {
    const state = get()
    const newCities = state.cities.map(city => ({
      ...city,
      stations: city.stations.map(station => {
        if (station.id !== stationId) return station
        const newStation = { ...station, subsidyPrice: price }
        newStation.predictedVolume = computePredictedVolume(newStation, city)
        return newStation
      }),
    }))
    set({ cities: newCities })
  },

  assignBatchToInspection: (batchId: string, lineId: string) => {
    const state = get()
    const line = state.inspectionLines.find(l => l.id === lineId)
    if (!line || line.status !== 'idle') {
      get().addNotification('warning', '该检测线正在工作中！')
      return
    }
    let targetBatch: BatteryBatch | undefined
    let targetCityId: string | undefined
    let targetStationId: string | undefined
    for (const city of state.cities) {
      for (const station of city.stations) {
        const batch = station.batches.find(b => b.id === batchId)
        if (batch) {
          targetBatch = batch
          targetCityId = city.id
          targetStationId = station.id
          break
        }
      }
      if (targetBatch) break
    }
    if (!targetBatch || targetBatch.status !== 'pending') return
    if (targetBatch.quantity > line.capacity - line.usedCapacity) {
      get().addNotification('warning', '检测线容量不足！')
      return
    }
    set({
      inspectionLines: state.inspectionLines.map(l =>
        l.id === lineId
          ? { ...l, status: 'inspecting' as const, usedCapacity: l.usedCapacity + targetBatch!.quantity, assignedBatchId: batchId }
          : l
      ),
      cities: state.cities.map(c => {
        if (c.id !== targetCityId) return c
        return {
          ...c,
          stations: c.stations.map(s => {
            if (s.id !== targetStationId) return s
            return {
              ...s,
              batches: s.batches.map(b =>
                b.id === batchId ? { ...b, status: 'inspecting' as const, inspectionLineId: lineId } : b
              ),
            }
          }),
        }
      }),
    })
  },

  runInspection: (lineId: string) => {
    const state = get()
    const line = state.inspectionLines.find(l => l.id === lineId)
    if (!line || line.status !== 'inspecting' || !line.assignedBatchId) return

    let targetCityId: string | undefined
    let targetStationId: string | undefined
    for (const city of state.cities) {
      for (const station of city.stations) {
        const batch = station.batches.find(b => b.id === line.assignedBatchId)
        if (batch) {
          targetCityId = city.id
          targetStationId = station.id
          break
        }
      }
      if (targetCityId) break
    }
    if (!targetCityId || !targetStationId) return

    const isCascade = Math.random() < 0.4
    const grade = isCascade ? 'cascade' as const : 'dismantle' as const

    const cascadeYield = isCascade ? Math.floor(Math.random() * 20 + 10) : 0
    const dismantleYields = !isCascade ? {
      nickel: Math.floor(Math.random() * 15 + 5),
      cobalt: Math.floor(Math.random() * 10 + 3),
      lithium: Math.floor(Math.random() * 8 + 2),
    } : { nickel: 0, cobalt: 0, lithium: 0 }

    set({
      inspectionLines: state.inspectionLines.map(l =>
        l.id === lineId
          ? { ...l, status: 'idle' as const, usedCapacity: 0, assignedBatchId: undefined }
          : l
      ),
      cities: state.cities.map(c => {
        if (c.id !== targetCityId) return c
        return {
          ...c,
          stations: c.stations.map(s => {
            if (s.id !== targetStationId) return s
            return {
              ...s,
              batches: s.batches.map(b =>
                b.id === line.assignedBatchId
                  ? { ...b, status: 'graded' as const, grade, cascadeYield, dismantleYields }
                  : b
              ),
            }
          }),
        }
      }),
    })
    get().addNotification('info', `检测完成：批次分级为${isCascade ? '梯次利用' : '需拆解回收'}！`)
  },

  assignBatchToDismantling: (batchId: string, lineId: string) => {
    const state = get()
    const line = state.productionLines.find(l => l.id === lineId)
    if (!line || line.status !== 'idle') {
      get().addNotification('warning', '该拆解线正在工作中！')
      return
    }
    let targetBatch: BatteryBatch | undefined
    let targetCityId: string | undefined
    let targetStationId: string | undefined
    for (const city of state.cities) {
      for (const station of city.stations) {
        const batch = station.batches.find(b => b.id === batchId)
        if (batch) {
          targetBatch = batch
          targetCityId = city.id
          targetStationId = station.id
          break
        }
      }
      if (targetBatch) break
    }
    if (!targetBatch || targetBatch.grade !== 'dismantle' || targetBatch.status !== 'graded') return
    if (targetBatch.quantity > line.capacity - line.usedCapacity) {
      get().addNotification('warning', '拆解线容量不足！')
      return
    }
    set({
      productionLines: state.productionLines.map(l =>
        l.id === lineId
          ? { ...l, status: 'dismantling' as const, usedCapacity: l.usedCapacity + targetBatch!.quantity, assignedBatchId: batchId, progress: 0 }
          : l
      ),
      cities: state.cities.map(c => {
        if (c.id !== targetCityId) return c
        return {
          ...c,
          stations: c.stations.map(s => {
            if (s.id !== targetStationId) return s
            return {
              ...s,
              batches: s.batches.map(b =>
                b.id === batchId ? { ...b, status: 'dismantling' as const } : b
              ),
            }
          }),
        }
      }),
    })
  },

  runDismantling: (lineId: string) => {
    const state = get()
    const line = state.productionLines.find(l => l.id === lineId)
    if (!line || line.status !== 'dismantling' || !line.assignedBatchId) return

    let targetBatch: BatteryBatch | undefined
    let targetCityId: string | undefined
    let targetStationId: string | undefined
    for (const city of state.cities) {
      for (const station of city.stations) {
        const batch = station.batches.find(b => b.id === line.assignedBatchId)
        if (batch) {
          targetBatch = batch
          targetCityId = city.id
          targetStationId = station.id
          break
        }
      }
      if (targetBatch) break
    }
    if (!targetBatch || !targetBatch.dismantleYields) return

    const dy = targetBatch.dismantleYields
    const batchQty = targetBatch.quantity
    const nickelGained = dy.nickel * Math.ceil(batchQty / 10)
    const cobaltGained = dy.cobalt * Math.ceil(batchQty / 10)
    const lithiumGained = dy.lithium * Math.ceil(batchQty / 10)
    const carbonFromDismantling = Math.floor(batchQty * 1.5)

    set({
      productionLines: state.productionLines.map(l =>
        l.id === lineId
          ? { ...l, status: 'idle' as const, usedCapacity: 0, assignedBatchId: undefined, progress: 0 }
          : l
      ),
      inventory: {
        ...state.inventory,
        nickel: state.inventory.nickel + nickelGained,
        cobalt: state.inventory.cobalt + cobaltGained,
        lithium: state.inventory.lithium + lithiumGained,
      },
      carbonMetrics: {
        ...state.carbonMetrics,
        quarterlyReduction: state.carbonMetrics.quarterlyReduction + carbonFromDismantling,
        totalReduction: state.carbonMetrics.totalReduction + carbonFromDismantling,
        breakdown: {
          ...state.carbonMetrics.breakdown,
          dismantling: state.carbonMetrics.breakdown.dismantling + carbonFromDismantling,
        },
      },
      cities: state.cities.map(c => {
        if (c.id !== targetCityId) return c
        return {
          ...c,
          stations: c.stations.map(s => {
            if (s.id !== targetStationId) return s
            return { ...s, batches: s.batches.filter(b => b.id !== line.assignedBatchId) }
          }),
        }
      }),
    })
    get().addNotification('success', `拆解完成！获得镍+${nickelGained} 钴+${cobaltGained} 锂+${lithiumGained}`)
  },

  allocateMaterialToOrder: (orderId: string, material: string, quantity: number) => {
    const state = get()
    const order = state.orders.find(o => o.id === orderId)
    if (!order) return

    const matKey = MATERIAL_TO_INVENTORY_KEY[material]
    if (!matKey) return
    const available = state.inventory[matKey]
    if (available < quantity) {
      get().addNotification('warning', `库存不足！当前${matKey === 'cascadeBattery' ? '梯次电池' : material}仅剩${available}`)
      return
    }

    set({
      inventory: {
        ...state.inventory,
        [matKey]: (state.inventory[matKey] as number) - quantity,
      },
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, allocatedQuantity: o.allocatedQuantity + quantity, status: 'producing' as const }
          : o
      ),
    })
    get().addNotification('info', `已为订单分配${quantity}单位${order.materialName}`)
  },

  deliverOrder: (orderId: string) => {
    const state = get()
    const order = state.orders.find(o => o.id === orderId)
    if (!order || (order.status !== 'producing' && order.status !== 'pending')) return
    if (order.allocatedQuantity < order.remainingQuantity) {
      get().addNotification('warning', '分配量不足，无法交付！')
      return
    }
    const transportCost = order.transportCost
    const carbonFromDelivery = Math.floor(order.quantity * 0.8)
    const carbonFromTransport = Math.floor(order.quantity * 0.2)

    set({
      orders: state.orders.map(o =>
        o.id === orderId ? { ...o, status: 'completed' as const } : o
      ),
      finance: {
        ...state.finance,
        cash: state.finance.cash + order.price - transportCost,
        revenue: state.finance.revenue + order.price,
        cost: state.finance.cost + transportCost,
        totalRevenue: state.finance.totalRevenue + order.price,
        totalCost: state.finance.totalCost + transportCost,
      },
      carbonMetrics: {
        ...state.carbonMetrics,
        quarterlyReduction: state.carbonMetrics.quarterlyReduction + carbonFromDelivery + carbonFromTransport,
        totalReduction: state.carbonMetrics.totalReduction + carbonFromDelivery + carbonFromTransport,
        breakdown: {
          ...state.carbonMetrics.breakdown,
          transport: state.carbonMetrics.breakdown.transport + carbonFromTransport,
          recycling: state.carbonMetrics.breakdown.recycling + carbonFromDelivery,
        },
      },
    })
    get().addNotification('success', `订单交付成功！收入¥${order.price.toLocaleString()}`)
  },

  setOrderTransport: (orderId: string, method: 'road' | 'rail' | 'express') => {
    const state = get()
    const multipliers = { road: 1, rail: 0.7, express: 1.8 }
    const order = state.orders.find(o => o.id === orderId)
    if (!order) return

    let baseCost = Math.floor(order.quantity * 5 * multipliers[method])

    const transportEvents = state.events.filter(e => e.type === 'transport_disruption' && !e.resolved)
    if (transportEvents.length > 0) {
      const costMultiplier = transportEvents.reduce((acc, e) => acc * (e.impact.transportCost || 1), 1)
      baseCost = Math.floor(baseCost * costMultiplier)
    }

    set({
      orders: state.orders.map(o =>
        o.id === orderId
          ? { ...o, transportMethod: method, transportCost: baseCost }
          : o
      ),
    })
  },

  purchaseMaterial: (material: 'nickel' | 'cobalt' | 'lithium', quantity: number) => {
    const state = get()
    const price = state.inventory.marketPrices[material]
    const totalCost = price * quantity
    if (state.finance.cash < totalCost) {
      get().addNotification('danger', '现金不足，无法采购！')
      return
    }
    set({
      inventory: {
        ...state.inventory,
        purchaseOrders: [
          ...state.inventory.purchaseOrders,
          { id: makeId(), material, quantity, price, deliveryQuarter: state.quarter + 1 },
        ],
      },
      finance: {
        ...state.finance,
        cash: state.finance.cash - totalCost,
        cost: state.finance.cost + totalCost,
      },
    })
    get().addNotification('info', `采购${quantity}单位${material}，花费¥${totalCost.toLocaleString()}，下季度到货`)
  },

  resolveEvent: (eventId: string, resolution: string) => {
    const state = get()
    const event = state.events.find(e => e.id === eventId)
    if (!event || event.resolved) return

    let newFinance = { ...state.finance }
    let newCarbon = { ...state.carbonMetrics }
    let newInventory = { ...state.inventory }
    let newReputation = { ...state.reputation }
    let newOrders = [...state.orders]
    let newCities = state.cities.map(c => ({ ...c }))

    if (event.type === 'transport_disruption') {
      if (resolution === 'accept') {
        const costMult = event.impact.transportCost || 1
        const capMult = event.impact.transportCapacity || 1
        newCities = newCities.map(c => ({
          ...c,
          transportCost: Math.floor(c.transportCost * costMult),
          transportCapacity: Math.floor(c.transportCapacity * capMult),
          transportDisrupted: true,
        }))
        newOrders = newOrders.map(o => {
          if (o.status === 'pending' || o.status === 'producing') {
            return { ...o, transportCost: Math.floor(o.transportCost * costMult) }
          }
          return o
        })
      } else if (resolution === 'pay') {
        const cost = 15000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
        newReputation = { ...newReputation, score: Math.max(0, newReputation.score - 2) }
      } else if (resolution === 'fix') {
        const cost = 25000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
        newReputation = { ...newReputation, score: Math.min(100, newReputation.score + 3) }
      }
    } else if (event.type === 'customer_urgency') {
      if (resolution === 'accept') {
        const targetId = event.targetOrderId
        if (targetId) {
          newOrders = newOrders.map(o => {
            if (o.id === targetId) {
              return {
                ...o,
                urgency: Math.min(5, o.urgency + 2),
                penalty: Math.floor(o.penalty * 1.5),
                deadline: Math.max(state.quarter, o.deadline - 1),
              }
            }
            return o
          })
        }
      } else if (resolution === 'pay') {
        const cost = 20000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
      } else if (resolution === 'fix') {
        const cost = 30000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
        newReputation = { ...newReputation, score: Math.min(100, newReputation.score + 2) }
      }
    } else if (event.type === 'pollution_warning') {
      if (resolution === 'pay') {
        const fine = 30000
        newFinance = { ...newFinance, cash: newFinance.cash - fine, cost: newFinance.cost + fine }
        newReputation = { ...newReputation, score: Math.max(0, newReputation.score - 3) }
      } else if (resolution === 'fix') {
        const cost = 20000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
        newCarbon = { ...newCarbon, complianceScore: Math.min(100, newCarbon.complianceScore + 5) }
        newReputation = { ...newReputation, score: Math.min(100, newReputation.score + 2) }
      } else if (resolution === 'accept') {
        if (event.impact.complianceScore) {
          newCarbon = { ...newCarbon, complianceScore: Math.max(0, newCarbon.complianceScore + event.impact.complianceScore) }
        }
        if (event.impact.pollutionIncidents) {
          newCarbon = { ...newCarbon, pollutionIncidents: newCarbon.pollutionIncidents + (event.impact.pollutionIncidents || 1) }
        }
      }
    } else if (event.type === 'price_fluctuation') {
      if (resolution === 'accept') {
        if (event.impact.lithiumPrice) {
          newInventory = {
            ...newInventory,
            marketPrices: {
              ...newInventory.marketPrices,
              lithium: Math.floor(newInventory.marketPrices.lithium * event.impact.lithiumPrice),
            },
          }
        }
        if (event.impact.cobaltPrice) {
          newInventory = {
            ...newInventory,
            marketPrices: {
              ...newInventory.marketPrices,
              cobalt: Math.floor(newInventory.marketPrices.cobalt * event.impact.cobaltPrice),
            },
          }
        }
        if (event.impact.nickelPrice) {
          newInventory = {
            ...newInventory,
            marketPrices: {
              ...newInventory.marketPrices,
              nickel: Math.floor(newInventory.marketPrices.nickel * event.impact.nickelPrice),
            },
          }
        }
      } else if (resolution === 'pay') {
        const cost = 15000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
      } else if (resolution === 'fix') {
        const cost = 10000
        newFinance = { ...newFinance, cash: newFinance.cash - cost, cost: newFinance.cost + cost }
      }
    }

    set({
      events: state.events.map(e => e.id === eventId ? { ...e, resolved: true, resolution } : e),
      finance: newFinance,
      carbonMetrics: newCarbon,
      inventory: newInventory,
      reputation: newReputation,
      orders: newOrders,
      cities: newCities,
    })
  },

  advancePhase: () => {
    const state = get()
    const phases: GameState['phase'][] = ['event', 'decision', 'settle', 'scoring']
    const currentIdx = phases.indexOf(state.phase)
    if (currentIdx < phases.length - 1) {
      const nextPhase = phases[currentIdx + 1]
      set({ phase: nextPhase })
      if (nextPhase === 'settle') {
        get().settleQuarter()
      }
    }
  },

  settleQuarter: () => {
    const state = get()

    let quarterlyCarbonFromDismantling = state.carbonMetrics.breakdown.dismantling
    let quarterlyCarbonFromTransport = state.carbonMetrics.breakdown.transport
    let quarterlyCarbonFromRecycling = state.carbonMetrics.breakdown.recycling
    let quarterlyCarbonFromCascade = 0
    let totalQuarterlyReduction = state.carbonMetrics.quarterlyReduction

    const recyclingCost = state.cities.reduce((acc, city) => {
      return acc + city.stations.reduce((sAcc, station) => sAcc + (station.subsidyPrice * station.predictedVolume), 0)
    }, 0)

    const operationalCost = 15000 + state.cities.filter(c => c.unlocked).length * 5000

    let newCash = state.finance.cash - recyclingCost - operationalCost
    let newCost = state.finance.cost + recyclingCost + operationalCost
    let newTotalCost = state.finance.totalCost + recyclingCost + operationalCost

    const newCities = state.cities.map(city => {
      const newCity = { ...city, stations: city.stations.map(s => ({ ...s, batches: [...s.batches] })) }
      newCity.stations.forEach(station => {
        const actualVol = station.predictedVolume + Math.floor((Math.random() - 0.5) * 20)
        station.actualVolume = actualVol
        const numBatches = Math.max(1, Math.floor(actualVol / 25))
        for (let i = 0; i < numBatches; i++) {
          const batch: BatteryBatch = {
            id: makeId(),
            stationId: station.id,
            cityName: city.name,
            quantity: Math.floor(actualVol / numBatches),
            status: 'pending',
          }
          station.batches.push(batch)
        }
      })
      return newCity
    })

    let cascadeBatteryGained = 0
    newCities.forEach(city => {
      city.stations.forEach(station => {
        station.batches = station.batches.filter(batch => {
          if (batch.status === 'graded' && batch.grade === 'cascade') {
            cascadeBatteryGained += (batch.cascadeYield || 0)
            quarterlyCarbonFromCascade += (batch.cascadeYield || 0) * 2
            return false
          }
          return true
        })
      })
    })

    totalQuarterlyReduction += quarterlyCarbonFromCascade

    let newOrders = state.orders.map(o => {
      if (o.status === 'pending' || o.status === 'producing') {
        if (o.deadline <= state.quarter) {
          return { ...o, status: 'overdue' as const }
        }
      }
      return o
    })

    const overdueOrders = newOrders.filter(o => o.status === 'overdue')
    let totalPenalty = 0
    if (overdueOrders.length > 0) {
      totalPenalty = overdueOrders.reduce((acc, o) => acc + o.penalty, 0)
      newCash -= totalPenalty
      newCost += totalPenalty
      newTotalCost += totalPenalty
    }

    const deliveryRate = computeDeliveryRate(newOrders)
    const newInventory = { ...state.inventory, cascadeBattery: state.inventory.cascadeBattery + cascadeBatteryGained }
    const invRisk = computeInventoryRisk(newInventory)
    const financialScore = Math.min(100, Math.max(0, 50 + Math.floor((state.finance.revenue - newCost) / 10000)))
    const customerScore = Math.min(100, deliveryRate)
    const envScore = Math.min(100, Math.max(0, state.carbonMetrics.complianceScore - state.carbonMetrics.pollutionIncidents * 10))
    const opScore = Math.min(100, 100 - invRisk)
    const totalScore = Math.floor(financialScore * 0.3 + customerScore * 0.25 + envScore * 0.25 + opScore * 0.2)

    const newProfit = state.finance.revenue - newCost

    const historyEntry: QuarterHistory = {
      quarter: state.quarter,
      cash: newCash,
      revenue: state.finance.revenue,
      cost: newCost,
      profit: newProfit,
      carbonReduction: totalQuarterlyReduction,
      deliveryRate,
      reputationScore: totalScore,
      complianceScore: state.carbonMetrics.complianceScore,
      inventoryRisk: invRisk,
      financialScore,
      operationScore: opScore,
      environmentalScore: envScore,
      customerScore,
    }

    set({
      cities: newCities,
      orders: newOrders,
      inventory: newInventory,
      finance: {
        ...state.finance,
        cash: newCash,
        cost: newCost,
        profit: newProfit,
        totalCost: newTotalCost,
        cashFlow: [...state.finance.cashFlow, newCash],
      },
      reputation: {
        level: computeReputationLevel(totalScore),
        score: totalScore,
        deliveryRate,
        customerSatisfaction: customerScore,
        environmentalScore: envScore,
      },
      carbonMetrics: {
        ...state.carbonMetrics,
        totalReduction: state.carbonMetrics.totalReduction + quarterlyCarbonFromCascade,
        quarterlyReduction: 0,
        breakdown: { recycling: 0, cascade: 0, dismantling: 0, transport: 0 },
      },
      history: [...state.history, historyEntry],
      phase: 'scoring',
    })
  },

  nextQuarter: () => {
    const state = get()
    if (state.quarter >= state.maxQuarters) {
      set({ gameOver: true })
      return
    }

    const newQuarter = state.quarter + 1
    const pendingOrders = state.orders.filter(o => o.status === 'pending' || o.status === 'producing')
    const arrivingOrders = state.inventory.purchaseOrders.filter(po => po.deliveryQuarter <= newQuarter)
    let inventoryBonus = { nickel: 0, cobalt: 0, lithium: 0 }
    arrivingOrders.forEach(po => {
      inventoryBonus[po.material] += po.quantity
    })

    const newEvents = generateEvents(newQuarter, pendingOrders)
    const newOrders = generateOrders(newQuarter, pendingOrders)

    const restoredCities = state.cities.map(c => ({
      ...c,
      transportDisrupted: false,
      transportCost: CITIES_DATA.find(cd => cd.id === c.id)?.transportCost ?? c.transportCost,
      transportCapacity: CITIES_DATA.find(cd => cd.id === c.id)?.transportCapacity ?? c.transportCapacity,
    }))

    set({
      quarter: newQuarter,
      phase: 'decision',
      currentStep: 0,
      events: newEvents,
      orders: newOrders,
      cities: restoredCities,
      finance: {
        ...state.finance,
        revenue: 0,
        cost: 0,
        profit: 0,
      },
      inventory: {
        ...state.inventory,
        nickel: state.inventory.nickel + inventoryBonus.nickel,
        cobalt: state.inventory.cobalt + inventoryBonus.cobalt,
        lithium: state.inventory.lithium + inventoryBonus.lithium,
        purchaseOrders: state.inventory.purchaseOrders.filter(po => po.deliveryQuarter > newQuarter),
        marketPrices: {
          nickel: Math.floor(state.inventory.marketPrices.nickel * (0.9 + Math.random() * 0.2)),
          cobalt: Math.floor(state.inventory.marketPrices.cobalt * (0.9 + Math.random() * 0.2)),
          lithium: Math.floor(state.inventory.marketPrices.lithium * (0.85 + Math.random() * 0.3)),
        },
      },
      inspectionLines: state.inspectionLines.map(l => ({
        ...l,
        status: 'idle' as const,
        usedCapacity: 0,
        assignedBatchId: undefined,
      })),
      productionLines: state.productionLines.map(l => ({
        ...l,
        status: 'idle' as const,
        usedCapacity: 0,
        assignedBatchId: undefined,
        progress: 0,
      })),
    })
    get().addNotification('info', `第${newQuarter}季度开始！请做出你的经营决策。`)
  },

  addNotification: (type: Notification['type'], message: string) => {
    const state = get()
    const notification: Notification = {
      id: makeId(),
      type,
      message,
      timestamp: Date.now(),
      read: false,
    }
    set({ notifications: [notification, ...state.notifications].slice(0, 20) })
  },

  markNotificationRead: (id: string) => {
    set({
      notifications: get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    })
  },
}))
