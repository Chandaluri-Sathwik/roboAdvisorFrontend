import type { Allocation, RiskProfile } from '../data/demo'
import { targetAllocations } from '../data/demo'

export const formatINR = (amount: number, compact = false) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0, notation: compact ? 'compact' : 'standard',
}).format(amount)

export const projectedValue = (initial: number, monthly: number, years: number, annualReturn = 0.09) => {
  const rate = annualReturn / 12
  const months = years * 12
  return initial * (1 + rate) ** months + monthly * (((1 + rate) ** months - 1) / rate)
}

export const profileFor = (willingness: number, capacity: number, horizon: number): RiskProfile => {
  const score = willingness * .4 + capacity * .4 + horizon * .2
  if (score < 36) return 'Conservative'
  if (score < 61) return 'Moderate'
  if (score < 78) return 'Growth'
  return 'Aggressive'
}

export const getAllocation = (profile: RiskProfile): Allocation => targetAllocations[profile]
