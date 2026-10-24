import type { Allocation, RiskProfile } from '../data/demo'

export type PlanProfile = {
  name: string
  goal: number
  goalType: string
  customGoalName: string
  years: number
  initial: number
  sip: number
  investmentType: '' | 'one_time' | 'monthly' | 'both'
  willingness: number
  expectedReturnRange: '' | '4_6' | '7_10' | '11_15' | 'over_15'
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
