import type { PlanProfile } from '../types/plan'

export type LocalAssistantAction = { type: 'confirm_rebalance' } | null
export type LocalAssistantResponse = { reply: string; action?: LocalAssistantAction }

const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const assetClasses = ['equity', 'debt', 'commodity'] as const

/**
 * Deterministic portfolio assistant that runs in the browser.
 * It reads only the profile already loaded into the app and makes no network
 * requests, calls no model provider, and does not fetch live market data.
 */
export function generateLocalAssistantReply(
  message: string,
  profile: PlanProfile,
): LocalAssistantResponse {
  const question = message.trim().toLowerCase()
  const portfolioPresent = Boolean(profile.targetAllocation)
  const rebalanceIntent = isRebalanceRequest(question)

  if (rebalanceIntent) {
    if (!profile.hasSimulatedMarket) {
      return {
        reply: 'There is no simulated allocation drift to rebalance yet. Use the Portfolio page to simulate market movement first. This demo never places real trades.',
        action: null,
      }
    }
    return {
      reply: 'Your current simulated allocation differs from the saved target. I can reset the browser’s simulated allocation to that target. This is a local demo action only; it does not buy or sell instruments or sync a trade to a broker.',
      action: { type: 'confirm_rebalance' },
    }
  }

  if (containsAny(question, ['candidate', 'investment option', 'instrument', 'mutual fund', 'fund', 'what can i invest'])) {
    return { reply: explainCandidates(profile) }
  }
  if (containsAny(question, ['contribution', 'monthly', 'one-time', 'one time', 'sip', 'split', 'how much'])) {
    return { reply: explainContributions(profile) }
  }
  if (containsAny(question, ['projection', 'future value', 'growth', 'return assumption', 'expected return'])) {
    return { reply: explainProjection(profile) }
  }
  if (containsAny(question, ['rebalance', 'drift'])) {
    return { reply: explainRebalancing(profile) }
  }
  if (containsAny(question, ['risk', 'allocation', 'portfolio', 'mix', 'weight', 'equity', 'debt', 'commodity'])) {
    return { reply: explainAllocation(profile) }
  }

  return {
    reply: [
      'I’m running in local portfolio mode. I don’t use Gemini, another model provider, or live market data for these answers.',
      `Your saved risk profile is ${profile.riskProfile || 'not available'} and your goal horizon is ${profile.years || 'not available'} years.`,
      portfolioPresent
        ? `Your target allocation is ${formatAllocation(profile.targetAllocation)}.`
        : 'A saved target allocation is not available in this browser yet.',
      'Ask me about your allocation, risk profile, monthly or one-time contribution, saved investment candidates, return-assumption projection, or rebalance simulation.',
    ].join('\n\n'),
  }
}

function explainAllocation(profile: PlanProfile): string {
  const parts = [
    `Your saved risk profile is ${profile.riskProfile || 'not available'}, with ${profile.riskTolerance || 'not available'} risk tolerance and a ${profile.years}-year ${profile.goalType.replaceAll('_', ' ')} goal.`,
    `Target allocation: ${formatAllocation(profile.targetAllocation)}.`,
    `Current simulated allocation in this browser: ${formatAllocation(profile.actualAllocation)}.`,
  ]
  if (Number.isFinite(profile.riskCapPercent)) {
    parts.push(`Your plan caps combined equity and commodity exposure at ${profile.riskCapPercent}%.`)
  }
  if (profile.recommendationExplanation) parts.push(profile.recommendationExplanation)
  parts.push('I’m explaining the portfolio already stored in this app, not recommending a trade. The figures are educational and are not investment advice.')
  return parts.join('\n\n')
}

function explainContributions(profile: PlanProfile): string {
  const investmentType = profile.investmentType
  if (investmentType !== 'monthly' && investmentType !== 'one_time') {
    return 'Your contribution mode is not set. Complete the plan setup to see a contribution breakdown.'
  }

  const amount = investmentType === 'monthly' ? profile.sip : profile.initial
  const label = investmentType === 'monthly' ? 'monthly contribution' : 'one-time investment'
  const parts = [
    `Your saved ${label} is ${formatRupees(amount)} over a ${profile.years}-year horizon.`,
    `The target split is ${formatAllocation(profile.targetAllocation)}.`,
  ]
  const classAmounts = profile.investmentOptions?.class_amounts
  if (classAmounts) {
    const field = investmentType === 'monthly' ? 'monthly_contribution_inr' : 'one_time_investment_inr'
    const details = assetClasses
      .map((assetClass) => {
        const value = classAmounts[assetClass]?.[field]
        return Number.isFinite(value) ? `${title(assetClass)} ${formatRupees(value)}` : null
      })
      .filter((value): value is string => Boolean(value))
    if (details.length) parts.push(`Saved class amounts: ${details.join(', ')}.`)
  }
  return parts.join('\n\n')
}

function explainProjection(profile: PlanProfile): string {
  const projection = profile.projection ?? calculateLocalProjection(profile)
  if (!projection) {
    return 'The projection is not available yet. Complete and save your plan with a valid contribution mode, amount, horizon, and return assumption.'
  }
  return [
    `The illustrative projection uses a ${projection.expected_return_percent}% annual return assumption over ${projection.years} years.`,
    `Total planned contributions: ${formatRupees(projection.total_contributions)}. Illustrative future value: ${formatRupees(projection.future_value)}, including ${formatRupees(projection.estimated_growth)} of estimated growth.`,
    projection.disclaimer || 'This is an illustration, not a forecast or guarantee.',
  ].join('\n\n')
}

function explainCandidates(profile: PlanProfile): string {
  const options = profile.investmentOptions
  if (!options) {
    return 'There are no saved investment-candidate details in this browser yet. You can still ask about your target allocation and contribution split. Candidate listings require the plan to have been refreshed while the relevant catalogue data was available.'
  }

  const groups = assetClasses.map((assetClass) => {
    const candidates = options.by_asset_class?.[assetClass] ?? []
    const names = candidates.slice(0, 4).map((candidate) => candidate.name || candidate.symbol).filter(Boolean)
    return names.length ? `${title(assetClass)}: ${names.join(', ')}.` : `${title(assetClass)}: no saved verified candidates.`
  })
  return [
    'These are educational candidates recorded with your saved plan, not buy or sell recommendations.',
    ...groups,
    ...(options.limitations?.length ? [`Data limitations: ${options.limitations.slice(0, 3).join(' ')}`] : []),
  ].join('\n\n')
}

function explainRebalancing(profile: PlanProfile): string {
  const parts = [
    `Rebalancing compares your current simulated weights (${formatAllocation(profile.actualAllocation)}) with your target (${formatAllocation(profile.targetAllocation)}).`,
    'In this local demo, confirming a rebalance resets the browser’s simulated weights to the target weights. It does not submit trades or place orders.',
  ]
  if (!profile.hasSimulatedMarket) {
    parts.push('There is no simulated market movement recorded, so no allocation drift is currently available to reset.')
  }
  return parts.join('\n\n')
}

function calculateLocalProjection(profile: PlanProfile) {
  if (profile.investmentType !== 'monthly' && profile.investmentType !== 'one_time') return null
  const years = profile.years
  const expectedReturn = profile.expectedReturnPercent
  if (!Number.isInteger(years) || years < 1 || !Number.isFinite(expectedReturn) || expectedReturn < 0) return null
  const initial = profile.investmentType === 'one_time' ? profile.initial : 0
  const monthly = profile.investmentType === 'monthly' ? profile.sip : 0
  if (initial <= 0 && monthly <= 0) return null

  const months = years * 12
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1
  const growthFactor = Math.pow(1 + monthlyRate, months)
  const initialFutureValue = initial * growthFactor
  const contributionsFutureValue = monthlyRate === 0
    ? monthly * months
    : monthly * ((growthFactor - 1) / monthlyRate)
  const totalContributions = initial + monthly * months
  const futureValue = Math.round((initialFutureValue + contributionsFutureValue + Number.EPSILON) * 100) / 100
  const contributions = Math.round((totalContributions + Number.EPSILON) * 100) / 100
  return {
    years,
    expected_return_percent: expectedReturn,
    future_value: futureValue,
    total_contributions: contributions,
    estimated_growth: Math.round((futureValue - contributions + Number.EPSILON) * 100) / 100,
    disclaimer: 'Illustrative projection using the entered return assumption; not a forecast or guarantee.',
  }
}

function isRebalanceRequest(question: string): boolean {
  if (!question.includes('rebalance') || /\b(what|why|how|meaning|mean|explain|does)\b/.test(question)) return false
  return /\b(now|my|portfolio|apply|confirm|please|go ahead|do it|this|the)\b/.test(question)
}

function containsAny(question: string, terms: string[]): boolean {
  return terms.some((term) => question.includes(term))
}

function formatAllocation(allocation: PlanProfile['targetAllocation']): string {
  return assetClasses.map((assetClass) => `${title(assetClass)} ${Number(allocation?.[assetClass] ?? 0)}%`).join(', ')
}

function formatRupees(value: number): string {
  return Number.isFinite(value) ? rupees.format(value) : 'not available'
}

function title(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}
