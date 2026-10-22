import type { Allocation, RiskProfile } from '../data/demo'

export type PlanProfile = {
  name: string
  income: number
  expenses: number
  emergencyFund: number
  goal: number
  years: number
  initial: number
  sip: number
  willingness: number
  capacity: number
  horizon: number
  riskProfile: RiskProfile
  targetAllocation: Allocation
  actualAllocation: Allocation
  portfolioValue: number
  hasSimulatedMarket: boolean
  userId?: string
  goalId?: string
  portfolioId?: string
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline'

export type ProjectionScenario = {
  annual_return: number
  future_value: number
  total_contributions: number
  shortfall: number
}
