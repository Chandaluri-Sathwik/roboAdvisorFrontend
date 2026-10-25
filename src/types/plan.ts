import type { Allocation, RiskProfile, RiskTolerance } from '../data/demo'

export type PlanProfile = {
  name: string
  goalType: string
  customGoalName: string
  years: number
  initial: number
  sip: number
  investmentType: '' | 'one_time' | 'monthly'
  expectedReturnPercent: number
  riskTolerance: '' | RiskTolerance
  riskProfile: RiskProfile
  riskCapPercent: number | null
  targetAllocation: Allocation
  actualAllocation: Allocation
  portfolioValue: number
  hasSimulatedMarket: boolean
  recommendationVersion: string
  recommendationExplanation: string
  marketDataContext: MarketDataContext | null
  investmentOptions: InvestmentOptions | null
  projection: ProjectionScenario | null
  demoKey: string
  userId?: string
  goalId?: string
  portfolioId?: string
}

export type MarketDataContext = {
  method: string
  status: string
  generated_at?: string
}

export type InvestmentOptions = {
  status: string
  generated_at: string
  classes_without_verified_candidates: Array<keyof Allocation>
  allocation: Allocation
  baseline_allocation: Allocation
  illustrative_portfolios: IllustrativePortfolio[]
  class_amounts: Record<keyof Allocation, {
    allocation_percent: number
    one_time_investment_inr: number
    monthly_contribution_inr: number
  }>
  by_asset_class: Record<keyof Allocation, Array<{
    id: string
    symbol: string
    name: string
    asset_class: keyof Allocation
    instrument_type: string
    currency: string
    exchange: string | null
    scheme_code: string | null
    verification_source: string
    verified_at: string | null
    latest_observation: {
      value: number
      date: string
      source: string
      currency: string
    } | null
    market_data_status: string
    historical_return_1y_percent: number | null
    historical_return_comparison: {
      expected_return_percent: number
      gap_percent_points: number
      relation: 'near_assumption_historically' | 'below_assumption_historically' | 'above_assumption_historically'
    } | null
    historical_risk_metrics: {
      annualized_return_percent: number
      annualized_volatility_percent: number
      maximum_drawdown_percent: number
      monthly_return_observation_count: number
      start_date: string
      end_date: string
    } | null
    return_metric_note: string
  }>>
  return_analysis: {
    expected_annual_return_percent: number
    allocation_optimization: {
      status: 'historical_target_met_within_risk_cap' | 'historical_target_not_met_within_risk_cap' | 'optimization_withheld_insufficient_class_history' | 'optimization_unavailable'
      estimated_return_percent: number | null
      target_gap_percent_points: number | null
      missing_classes: Array<keyof Allocation>
      max_volatile_exposure_percent: number
    }
    historical_class_estimates: Record<keyof Allocation, {
      annualized_observed_change_percent: number | null
      usable_candidate_count: number
    }>
    historical_portfolio_return_proxy_percent: number | null
    gap_from_historical_proxy_percent_points: number | null
    status: string
    missing_allocated_classes: Array<keyof Allocation>
    note: string
  }
  government_security_yield_references: Array<{
    symbol: string
    maturity: string | null
    yield_percent: number
    date: string
    source: string
    currency: string
    status: string
    warning: string
  }>
  limitations: string[]
}

export type IllustrativePortfolio = {
  id: string
  name: string
  selection_method: string
  holdings: Array<{
    id: string
    name: string
    symbol: string
    asset_class: keyof Allocation
    instrument_type: string
    allocation_percent: number
    one_time_investment_inr: number
    monthly_contribution_inr: number
    latest_observation?: {
      value: number
      date: string
      source: string
      currency: string
    } | null
    historical_return_1y_percent?: number | null
    historical_return_comparison?: {
      expected_return_percent: number
      gap_percent_points: number
      relation: 'near_assumption_historically' | 'below_assumption_historically' | 'above_assumption_historically'
    } | null
    historical_risk_metrics?: {
      annualized_return_percent: number
      annualized_volatility_percent: number
      maximum_drawdown_percent: number
      monthly_return_observation_count: number
      start_date: string
      end_date: string
    } | null
    return_metric_note?: string
  }>
}

export type SyncStatus = 'idle' | 'restoring' | 'syncing' | 'synced' | 'offline'

export type ProjectionScenario = {
  investment_type: 'one_time' | 'monthly'
  years: number
  expected_return_percent: number
  contribution_timing: string
  future_value: number
  total_contributions: number
  estimated_growth: number
  disclaimer: string
}

export type FundClassAnalysis = {
  generated_at: string
  requested_years: number
  status: 'research_only'
  fund_coverage: Record<string, {
    configured_fund_count: number
    usable_series_count: number
    target_fund_count: number
    configured_status: string
    data_status: string
  }>
  proxies: Array<{
    asset_class_proxy: string
    scheme_code: string
    scheme_name: string
    status: string
    metrics: {
      annualized_nav_change_percent: number
      monthly_return_observation_count: number
      start_date: string
      end_date: string
    } | null
  }>
  methodology: {
    return: string
    fund_proxy_policy: string
  }
}
