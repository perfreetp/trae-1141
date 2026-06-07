export interface City {
  id: string
  name: string
  region: string
  unlocked: boolean
  unlockCost: number
  x: number
  y: number
  population: number
  evPenetration: number
  baseRecyclingRate: number
  stations: RecyclingStation[]
  transportCapacity: number
  transportCost: number
  transportDisrupted: boolean
}

export interface RecyclingStation {
  id: string
  cityId: string
  level: number
  subsidyPrice: number
  predictedVolume: number
  actualVolume: number
  batches: BatteryBatch[]
  buildCost: number
  upgradeCost: number
}

export interface BatteryBatch {
  id: string
  stationId: string
  cityName: string
  quantity: number
  status: 'pending' | 'inspecting' | 'graded' | 'dismantling'
  grade?: 'cascade' | 'dismantle'
  inspectionLineId?: string
  cascadeYield?: number
  dismantleYields?: { nickel: number; cobalt: number; lithium: number }
}

export interface MaterialInventory {
  nickel: number
  cobalt: number
  lithium: number
  cascadeBattery: number
  nickelSafety: number
  cobaltSafety: number
  lithiumSafety: number
  marketPrices: { nickel: number; cobalt: number; lithium: number }
  purchaseOrders: PurchaseOrder[]
}

export interface PurchaseOrder {
  id: string
  material: 'nickel' | 'cobalt' | 'lithium'
  quantity: number
  price: number
  deliveryQuarter: number
}

export interface Order {
  id: string
  clientName: string
  clientType: '储能厂' | '电动车厂' | '材料商' | '电网公司'
  material: 'nickel' | 'cobalt' | 'lithium' | 'cascade_battery'
  materialName: string
  quantity: number
  remainingQuantity: number
  deadline: number
  price: number
  penalty: number
  status: 'pending' | 'producing' | 'delivering' | 'completed' | 'overdue'
  urgency: number
  allocatedQuantity: number
  transportMethod?: 'road' | 'rail' | 'express'
  transportCost: number
}

export interface GameEvent {
  id: string
  type: 'price_fluctuation' | 'pollution_warning' | 'transport_disruption' | 'customer_urgency'
  title: string
  description: string
  impact: Record<string, number>
  resolved: boolean
  resolution?: string
  severity: 'low' | 'medium' | 'high'
  quarter: number
  targetOrderId?: string
  targetClientName?: string
}

export interface Finance {
  cash: number
  revenue: number
  cost: number
  profit: number
  cashFlow: number[]
  totalRevenue: number
  totalCost: number
}

export interface CarbonMetrics {
  totalReduction: number
  quarterlyReduction: number
  targetReduction: number
  pollutionIncidents: number
  complianceScore: number
  breakdown: {
    recycling: number
    cascade: number
    dismantling: number
    transport: number
  }
}

export interface Reputation {
  level: 'S' | 'A' | 'B' | 'C' | 'D'
  score: number
  deliveryRate: number
  customerSatisfaction: number
  environmentalScore: number
}

export interface InspectionLine {
  id: string
  name: string
  capacity: number
  usedCapacity: number
  assignedBatchId?: string
  status: 'idle' | 'inspecting'
}

export interface ProductionLine {
  id: string
  name: string
  capacity: number
  usedCapacity: number
  assignedBatchId?: string
  status: 'idle' | 'dismantling'
  progress: number
}

export interface QuarterHistory {
  quarter: number
  cash: number
  revenue: number
  cost: number
  profit: number
  carbonReduction: number
  deliveryRate: number
  reputationScore: number
  complianceScore: number
  inventoryRisk: number
  financialScore: number
  operationScore: number
  environmentalScore: number
  customerScore: number
}

export interface GameState {
  quarter: number
  maxQuarters: number
  phase: 'event' | 'decision' | 'settle' | 'scoring'
  currentStep: number
  started: boolean
  gameOver: boolean
  cities: City[]
  orders: Order[]
  events: GameEvent[]
  finance: Finance
  reputation: Reputation
  inventory: MaterialInventory
  productionLines: ProductionLine[]
  inspectionLines: InspectionLine[]
  carbonMetrics: CarbonMetrics
  history: QuarterHistory[]
  notifications: Notification[]
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'danger' | 'success'
  message: string
  timestamp: number
  read: boolean
}
