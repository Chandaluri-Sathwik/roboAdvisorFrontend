import type { Allocation, RiskProfile } from '../data/demo'
import type { PlanProfile, ProjectionScenario } from '../types/plan'
import { apiRequest } from './apiClient'

type UserResponse = { id: string; email: string; display_name: string }
type GoalResponse = { id: string }
type RiskResponse = { risk_profile: RiskProfile }
type PortfolioResponse = { id: string; current_value: number; target_allocation: Allocation; actual_allocation: Allocation }

export type RemotePlanIds = Pick<PlanProfile, 'userId' | 'goalId' | 'portfolioId' | 'riskProfile' | 'targetAllocation' | 'actualAllocation' | 'portfolioValue'>
export type RemotePortfolioState = Pick<PlanProfile, 'actualAllocation' | 'portfolioValue'>

export async function syncPlan(profile: PlanProfile): Promise<RemotePlanIds> {
  const userId = await ensureDemoUser(profile)
  await apiRequest(`/users/${userId}/profile`, { method: 'PUT', body: JSON.stringify({}) })

  const risk = await apiRequest<RiskResponse>(`/users/${userId}/risk-assessments`, {
    method: 'POST',
    body: JSON.stringify({
      willingness_score: profile.willingness,
      capacity_score: profile.capacity,
      horizon_score: profile.horizon,
    }),
  })

  const goalPayload = {
    name: profile.goalType === 'other' ? profile.customGoalName : goalLabel(profile.goalType),
    goal_type: profile.goalType,
    target_amount: profile.goal,
    horizon_years: profile.years,
    initial_investment: profile.initial,
    monthly_contribution: profile.sip,
  }
  const goal = profile.goalId
    ? await apiRequest<GoalResponse>(`/goals/${profile.goalId}`, { method: 'PATCH', body: JSON.stringify(goalPayload) })
    : await apiRequest<GoalResponse>(`/users/${userId}/goals`, { method: 'POST', body: JSON.stringify(goalPayload) })

  const portfolio = await apiRequest<PortfolioResponse>('/portfolios/recommend', {
    method: 'POST',
    body: JSON.stringify({ goal_id: goal.id, risk_profile: risk.risk_profile }),
  })

  return {
    userId,
    goalId: goal.id,
    portfolioId: portfolio.id,
    riskProfile: risk.risk_profile,
    targetAllocation: portfolio.target_allocation,
    actualAllocation: portfolio.actual_allocation,
    portfolioValue: portfolio.current_value,
  }
}

function goalLabel(goalType: string): string {
  const labels: Record<string, string> = {
    wealth_creation: 'Wealth creation',
    home: 'Buy a home',
    education: 'Education',
    retirement: 'Retirement',
  }
  return labels[goalType] || 'Investment goal'
}

export async function simulateMarket(portfolioId: string): Promise<RemotePortfolioState> {
  const portfolio = await apiRequest<PortfolioResponse>(`/portfolios/${portfolioId}/simulate-market`, {
    method: 'POST',
    body: JSON.stringify({ changes: { equity: 0.22, debt: -0.03, gold: 0.04, cash: 0 } }),
  })
  return { actualAllocation: portfolio.actual_allocation, portfolioValue: portfolio.current_value }
}

export async function applyRebalance(portfolioId: string): Promise<RemotePortfolioState> {
  const portfolio = await apiRequest<PortfolioResponse>(`/portfolios/${portfolioId}/rebalance/apply`, { method: 'POST' })
  return { actualAllocation: portfolio.actual_allocation, portfolioValue: portfolio.current_value }
}

export async function getProjections(profile: PlanProfile): Promise<ProjectionScenario[]> {
  return apiRequest<ProjectionScenario[]>('/projections', {
    method: 'POST',
    body: JSON.stringify({
      initial_investment: profile.initial,
      monthly_contribution: profile.sip,
      years: profile.years,
      target_amount: profile.goal,
    }),
  })
}

async function ensureDemoUser(profile: PlanProfile): Promise<string> {
  if (profile.userId) {
    try {
      const user = await apiRequest<UserResponse>(`/users/${profile.userId}`)
      return user.id
    } catch {
      // A recreated development database does not know the persisted browser ID.
    }
  }

  const randomId = crypto.randomUUID()
  const user = await apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify({ email: `demo-${randomId}@finguide.local`, display_name: profile.name || 'Demo investor' }),
  })
  return user.id
}

