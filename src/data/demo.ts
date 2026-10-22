export type Allocation = { equity: number; debt: number; gold: number; cash: number }
export type RiskProfile = 'Conservative' | 'Moderate' | 'Growth' | 'Aggressive'

export const targetAllocations: Record<RiskProfile, Allocation> = {
  Conservative: { equity: 20, debt: 60, gold: 10, cash: 10 },
  Moderate: { equity: 50, debt: 35, gold: 10, cash: 5 },
  Growth: { equity: 70, debt: 20, gold: 5, cash: 5 },
  Aggressive: { equity: 85, debt: 10, gold: 3, cash: 2 },
}

export const labels: Record<keyof Allocation, string> = {
  equity: 'Equity', debt: 'Debt', gold: 'Gold', cash: 'Cash',
}

export const colors: Record<keyof Allocation, string> = {
  equity: '#0b766e', debt: '#779c51', gold: '#d6a74f', cash: '#a6b8b4',
}

export const productCatalogue = [
  { name: 'Nifty 50 Index Fund', type: 'Indian equity', fee: '0.20%', className: 'equity' },
  { name: 'Short Duration Debt Fund', type: 'High-quality debt', fee: '0.35%', className: 'debt' },
  { name: 'Gold ETF', type: 'Gold', fee: '0.40%', className: 'gold' },
  { name: 'Liquid Reserve', type: 'Cash equivalent', fee: '—', className: 'cash' },
]

export const performanceSeries = [
  { month: 'Nov', value: 103200 }, { month: 'Dec', value: 106800 }, { month: 'Jan', value: 108400 },
  { month: 'Feb', value: 113100 }, { month: 'Mar', value: 111900 }, { month: 'Apr', value: 116800 },
  { month: 'May', value: 121400 }, { month: 'Jun', value: 124800 }, { month: 'Jul', value: 128600 }, { month: 'Aug', value: 132400 },
]

export const assistantReplies: Record<string, string> = {
  equity: 'Your illustrative portfolio holds 50% in equity because the Moderate profile balances a 10-year growth goal with room for market fluctuations. The other 50% is diversified across debt, gold and cash.',
  rebalance: 'Your equity allocation rose above its 50% target after the simulated market movement. Rebalancing brings the portfolio closer to its original risk level; it does not try to predict the market.',
  goal: 'With your current ₹15,000 monthly contribution and a 10-year horizon, the base illustration is below your ₹50 lakh target. Increasing the SIP or extending the deadline may reduce the projected gap.',
  default: 'I can explain your sample allocation, goal projection, risk profile or the simulated rebalance. This is educational information, not investment advice.',
}
