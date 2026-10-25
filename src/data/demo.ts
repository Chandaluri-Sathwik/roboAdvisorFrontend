export type Allocation = { equity: number; debt: number; commodity: number }
export type LegacyAllocation = Partial<Allocation> & { gold?: number; cash?: number }
export type RiskProfile = 'Conservative' | 'Moderate' | 'Aggressive'
export type RiskTolerance = 'low' | 'moderate' | 'high'

export const targetAllocations: Record<RiskProfile, Allocation> = {
  Conservative: { equity: 20, debt: 70, commodity: 10 },
  Moderate: { equity: 40, debt: 50, commodity: 10 },
  Aggressive: { equity: 70, debt: 20, commodity: 10 },
}

export function normalizeAllocation(allocation: LegacyAllocation): Allocation {
  return {
    equity: Number(allocation.equity ?? 0),
    debt: Number(allocation.debt ?? 0) + Number(allocation.cash ?? 0),
    commodity: Number(allocation.commodity ?? allocation.gold ?? 0),
  }
}

export const labels: Record<keyof Allocation, string> = {
  equity: 'Equity', debt: 'Debt', commodity: 'Commodity',
}

export const colors: Record<keyof Allocation, string> = {
  equity: '#0b766e', debt: '#779c51', commodity: '#d6a74f',
}
