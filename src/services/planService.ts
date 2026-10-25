import { normalizeAllocation, type Allocation, type LegacyAllocation, type RiskProfile } from '../data/demo'
import type { FundClassAnalysis, InvestmentOptions, MarketDataContext, PlanProfile, ProjectionScenario } from '../types/plan'
import { ApiError, apiRequest } from './apiClient'

type UserResponse = { id: string; email: string; display_name: string }
type GoalResponse = { id: string }
type RiskResponse = { risk_tolerance: 'low' | 'moderate' | 'high'; risk_profile: RiskProfile; constraints: { max_volatile_exposure_percent: number } }
type PortfolioResponse = {
  id: string
  current_value: number
  target_allocation: Allocation | LegacyAllocation
  actual_allocation: Allocation | LegacyAllocation
  risk_profile: RiskProfile
  has_simulated_market: boolean
  recommendation_version: string
  recommendation_explanation: string
  market_data_context?: MarketDataContext | null
  investment_options?: InvestmentOptions | null
  projection?: ProjectionScenario | null
}
type SavedPlanResponse = {
  user: UserResponse
  risk_assessment: {
    risk_tolerance?: 'low' | 'moderate' | 'high'
    risk_profile: RiskProfile
    constraints?: { max_volatile_exposure_percent: number }
  } | null
  goal: {
    id: string
    name: string
    goal_type: string
    horizon_years: number
    investment_type?: 'one_time' | 'monthly'
    initial_investment: number
    monthly_contribution: number
    expected_return_percent?: number
  } | null
  portfolio: Omit<PortfolioResponse, 'risk_profile'> & { risk_profile: RiskProfile; has_simulated_market: boolean } | null
}

export type RemotePlanIds = Pick<PlanProfile, 'userId' | 'goalId' | 'portfolioId' | 'riskProfile' | 'riskCapPercent' | 'targetAllocation' | 'actualAllocation' | 'portfolioValue' | 'hasSimulatedMarket' | 'recommendationVersion' | 'recommendationExplanation' | 'marketDataContext' | 'investmentOptions' | 'projection'>
export type RemotePortfolioState = Pick<PlanProfile, 'actualAllocation' | 'portfolioValue'>

export async function syncPlan(
  profile: PlanProfile,
  onPersistedIds?: (userId: string, goalId?: string) => void,
): Promise<RemotePlanIds> {
  const userId = await ensureDemoUser(profile)
  onPersistedIds?.(userId)
  await apiRequest(`/users/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify({ display_name: profile.name }),
  })

  const goalPayload = {
    name: profile.goalType === 'other' ? profile.customGoalName : goalLabel(profile.goalType),
    goal_type: profile.goalType,
    horizon_years: profile.years,
    investment_type: profile.investmentType,
    initial_investment: profile.investmentType === 'one_time' ? profile.initial : 0,
    monthly_contribution: profile.investmentType === 'monthly' ? profile.sip : 0,
    expected_return_percent: profile.expectedReturnPercent,
  }
  let goal: GoalResponse
  if (profile.goalId) {
    try {
      goal = await apiRequest<GoalResponse>(`/goals/${profile.goalId}`, {
        method: 'PATCH',
        body: JSON.stringify(goalPayload),
      })
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error
      goal = await apiRequest<GoalResponse>(`/users/${userId}/goals`, {
        method: 'POST',
        body: JSON.stringify(goalPayload),
      })
    }
  } else {
    goal = await apiRequest<GoalResponse>(`/users/${userId}/goals`, {
      method: 'POST',
      body: JSON.stringify(goalPayload),
    })
  }
  onPersistedIds?.(userId, goal.id)

  const risk = await apiRequest<RiskResponse>(`/users/${userId}/risk-assessments`, {
    method: 'POST',
    body: JSON.stringify({
      risk_tolerance: profile.riskTolerance,
      goal_type: profile.goalType,
      horizon_years: profile.years,
    }),
  })

  const portfolio = await apiRequest<PortfolioResponse>('/portfolios/recommend', {
    method: 'POST',
    body: JSON.stringify({ goal_id: goal.id, risk_profile: risk.risk_profile }),
  })

  return {
    userId,
    goalId: goal.id,
    portfolioId: portfolio.id,
    riskProfile: risk.risk_profile,
    riskCapPercent: risk.constraints.max_volatile_exposure_percent,
    targetAllocation: normalizeAllocation(portfolio.target_allocation),
    actualAllocation: normalizeAllocation(portfolio.actual_allocation),
    portfolioValue: portfolio.current_value,
    hasSimulatedMarket: portfolio.has_simulated_market,
    recommendationVersion: portfolio.recommendation_version,
    recommendationExplanation: portfolio.recommendation_explanation,
    marketDataContext: portfolio.market_data_context ?? null,
    investmentOptions: portfolio.investment_options ?? null,
    projection: portfolio.projection ?? null,
  }
}

export async function loadSavedPlan(userId: string): Promise<Partial<PlanProfile>> {
  const saved = await apiRequest<SavedPlanResponse>(`/users/${userId}/plan`)
  const goal = saved.goal
  const risk = saved.risk_assessment
  const portfolio = saved.portfolio

  return {
    userId: saved.user.id,
    name: saved.user.display_name,
    ...(goal ? {
      goalId: goal.id,
      goalType: goal.goal_type,
      customGoalName: goal.goal_type === 'other' ? goal.name : '',
      years: goal.horizon_years,
      initial: (goal.investment_type ?? (goal.initial_investment > 0 ? 'one_time' : 'monthly')) === 'one_time' ? goal.initial_investment : 0,
      sip: (goal.investment_type ?? (goal.initial_investment > 0 ? 'one_time' : 'monthly')) === 'monthly' ? goal.monthly_contribution : 0,
      investmentType: goal.investment_type ?? (goal.initial_investment > 0 ? 'one_time' : 'monthly'),
      expectedReturnPercent: goal.expected_return_percent ?? 9,
    } : {}),
    ...(risk ? {
      riskTolerance: risk.risk_tolerance ?? (risk.risk_profile === 'Conservative' ? 'low' : risk.risk_profile === 'Aggressive' || (risk.risk_profile as string) === 'Growth' ? 'high' : 'moderate'),
      riskProfile: (risk.risk_profile as string) === 'Growth' ? 'Aggressive' : risk.risk_profile,
      riskCapPercent: risk.constraints?.max_volatile_exposure_percent ?? null,
    } : {}),
    ...(portfolio ? {
      portfolioId: portfolio.id,
      riskProfile: (portfolio.risk_profile as string) === 'Growth' ? 'Aggressive' : portfolio.risk_profile,
      targetAllocation: normalizeAllocation(portfolio.target_allocation),
      actualAllocation: normalizeAllocation(portfolio.actual_allocation),
      portfolioValue: portfolio.current_value,
      hasSimulatedMarket: portfolio.has_simulated_market,
      recommendationVersion: portfolio.recommendation_version,
      recommendationExplanation: portfolio.recommendation_explanation,
      marketDataContext: portfolio.market_data_context ?? null,
      investmentOptions: portfolio.investment_options ?? null,
      projection: portfolio.projection ?? null,
    } : {}),
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
    body: JSON.stringify({ changes: { equity: 0.22, debt: -0.03, commodity: 0.04 } }),
  })
  return { actualAllocation: normalizeAllocation(portfolio.actual_allocation), portfolioValue: portfolio.current_value }
}

export async function applyRebalance(portfolioId: string): Promise<RemotePortfolioState> {
  const portfolio = await apiRequest<PortfolioResponse>(`/portfolios/${portfolioId}/rebalance/apply`, { method: 'POST' })
  return { actualAllocation: normalizeAllocation(portfolio.actual_allocation), portfolioValue: portfolio.current_value }
}

export async function getProjections(profile: PlanProfile): Promise<ProjectionScenario> {
  return apiRequest<ProjectionScenario>('/projections', {
    method: 'POST',
    body: JSON.stringify({
      investment_type: profile.investmentType,
      initial_investment: profile.investmentType === 'one_time' ? profile.initial : 0,
      monthly_contribution: profile.investmentType === 'monthly' ? profile.sip : 0,
      years: profile.years,
      expected_return_percent: profile.expectedReturnPercent,
    }),
  })
}

export async function getFundClassAnalysis(years = 1): Promise<FundClassAnalysis> {
  return apiRequest<FundClassAnalysis>(`/market-data/fund-class-analysis?years=${years}`)
}

async function ensureDemoUser(profile: PlanProfile): Promise<string> {
  if (profile.userId) {
    try {
      const user = await apiRequest<UserResponse>(`/users/${profile.userId}`)
      return user.id
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error
    }
  }

  const user = await apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify({ email: `demo-${profile.demoKey}@finguide.local`, display_name: profile.name || 'Demo investor' }),
  })
  return user.id
}
