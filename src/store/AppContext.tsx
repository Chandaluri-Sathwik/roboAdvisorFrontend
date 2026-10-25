import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { normalizeAllocation } from '../data/demo'
import { applyRebalance, loadSavedPlan, simulateMarket, syncPlan as saveRemotePlan } from '../services/planService'
import type { PlanProfile, SyncStatus } from '../types/plan'

type AppContextValue = {
  profile: PlanProfile
  syncStatus: SyncStatus
  syncError: string | null
  setProfile: (update: Partial<PlanProfile>) => void
  savePlan: (profileToSave?: PlanProfile) => Promise<boolean>
  restorePlan: () => Promise<boolean>
  simulateMarketMove: () => Promise<boolean>
  applyPortfolioRebalance: () => Promise<boolean>
  resetDemo: () => void
}

const storageKey = 'finguide-demo-profile'
const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PlanProfile>(readStoredProfile)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const shouldClearStorage = useRef(false)
  const profileRevision = useRef(0)
  const skipRestoreForUser = useRef<string | null>(null)

  useEffect(() => {
    if (shouldClearStorage.current) {
      localStorage.removeItem(storageKey)
      shouldClearStorage.current = false
      return
    }
    localStorage.setItem(storageKey, JSON.stringify(profile))
  }, [profile])

  const restorePlan = useCallback(async () => {
    const userId = profile.userId
    if (!userId) return false
    const revision = ++profileRevision.current
    setSyncStatus('restoring')
    setSyncError(null)
    try {
      const savedPlan = await loadSavedPlan(userId)
      if (revision !== profileRevision.current) return false
      setProfileState((current) => ({ ...current, ...savedPlan }))
      setSyncStatus('synced')
      return true
    } catch (error) {
      if (revision !== profileRevision.current) return false
      setSyncStatus('offline')
      setSyncError(error instanceof Error
        ? `The saved plan could not be loaded: ${error.message}`
        : 'The saved plan could not be loaded.')
      return false
    }
  }, [profile.userId])

  useEffect(() => {
    if (!profile.userId) return
    if (skipRestoreForUser.current === profile.userId) {
      skipRestoreForUser.current = null
      return
    }
    void restorePlan()
  }, [profile.userId, restorePlan])

  const setProfile = (update: Partial<PlanProfile>) => {
    profileRevision.current++
    if (syncStatus === 'restoring') setSyncStatus('idle')
    setProfileState((current) => ({ ...current, ...update }))
  }

  const savePlan = async (profileToSave = profile) => {
    profileRevision.current++
    setSyncStatus('syncing')
    setSyncError(null)
    let skipRestoreForNewUser = !profileToSave.userId
    try {
      const remotePlan = await saveRemotePlan(profileToSave, (userId, goalId) => {
        if (skipRestoreForNewUser) {
          skipRestoreForUser.current = userId
          skipRestoreForNewUser = false
        }
        setProfileState((current) => ({
          ...current,
          userId,
          ...(goalId ? { goalId } : {}),
        }))
      })
      setProfileState((current) => ({ ...current, ...remotePlan }))
      setSyncStatus('synced')
      return true
    } catch (error) {
      setSyncStatus('offline')
      setSyncError(error instanceof Error
        ? `Your plan could not be saved to the API: ${error.message}`
        : 'Your plan could not be saved to the API.')
      return false
    }
  }

  const simulateMarketMove = async () => {
    if (!profile.portfolioId) { setSyncStatus('offline'); setSyncError('Save an onboarding plan before simulating the market.'); return false }
    profileRevision.current++
    setSyncStatus('syncing')
    setSyncError(null)
    try {
      const remotePortfolio = await simulateMarket(profile.portfolioId)
      setProfileState((current) => ({ ...current, ...remotePortfolio, hasSimulatedMarket: true }))
      setSyncStatus('synced')
      setSyncError(null)
      return true
    } catch (error) {
      setSyncStatus('offline')
      setSyncError(error instanceof Error ? error.message : 'The market simulation could not be saved.')
      return false
    }
  }

  const applyPortfolioRebalance = async () => {
    if (!profile.portfolioId) { setSyncStatus('offline'); setSyncError('Save an onboarding plan before rebalancing.'); return false }
    profileRevision.current++
    setSyncStatus('syncing')
    setSyncError(null)
    try {
      const remotePortfolio = await applyRebalance(profile.portfolioId)
      setProfileState((current) => ({ ...current, ...remotePortfolio, hasSimulatedMarket: false }))
      setSyncStatus('synced')
      setSyncError(null)
      return true
    } catch (error) {
      setSyncStatus('offline')
      setSyncError(error instanceof Error ? error.message : 'The rebalance simulation could not be saved.')
      return false
    }
  }

  const value = useMemo(() => ({
    profile,
    syncStatus,
    syncError,
    setProfile,
    savePlan,
    restorePlan,
    simulateMarketMove,
    applyPortfolioRebalance,
    resetDemo: () => {
      profileRevision.current++
      skipRestoreForUser.current = null
      shouldClearStorage.current = true
      setProfileState(createInitialProfile())
      setSyncStatus('idle')
      setSyncError(null)
    },
  }), [profile, syncStatus, syncError, restorePlan])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function readStoredProfile(): PlanProfile {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}') as Partial<PlanProfile>
    const initialProfile = createInitialProfile()
    const oldInvestmentType = stored.investmentType
    const investmentType: PlanProfile['investmentType'] = oldInvestmentType === 'one_time' || oldInvestmentType === 'monthly'
      ? oldInvestmentType
      : Number(stored.initial) > 0 ? 'one_time' : Number(stored.sip) > 0 ? 'monthly' : ''
    const riskTolerance: PlanProfile['riskTolerance'] = stored.riskTolerance
      ?? ((stored.riskProfile as string) === 'Conservative' ? 'low' : (stored.riskProfile as string) === 'Aggressive' || (stored.riskProfile as string) === 'Growth' ? 'high' : 'moderate')
    const profile: PlanProfile = {
      ...initialProfile,
      ...stored,
      investmentType,
      initial: investmentType === 'one_time' ? Number(stored.initial ?? 0) : 0,
      sip: investmentType === 'monthly' ? Number(stored.sip ?? 0) : 0,
      expectedReturnPercent: Number(stored.expectedReturnPercent ?? 9),
      riskTolerance,
      riskProfile: riskTolerance === 'low' ? 'Conservative' : riskTolerance === 'high' ? 'Aggressive' : 'Moderate',
      targetAllocation: normalizeAllocation(stored.targetAllocation ?? initialProfile.targetAllocation),
      actualAllocation: normalizeAllocation(stored.actualAllocation ?? initialProfile.actualAllocation),
    }
    if (!stored.demoKey) profile.demoKey = crypto.randomUUID()
    return profile
  } catch {
    return createInitialProfile()
  }
}

function createInitialProfile(): PlanProfile {
  return {
    name: 'Demo user', goalType: 'education', customGoalName: 'Education goal', years: 10,
    initial: 0, sip: 15000, investmentType: 'monthly', expectedReturnPercent: 9,
    riskTolerance: 'moderate', riskProfile: 'Moderate',
    riskCapPercent: null,
    targetAllocation: { equity: 40, debt: 50, commodity: 10 },
    actualAllocation: { equity: 40, debt: 50, commodity: 10 }, portfolioValue: 0,
    recommendationVersion: 'demo-default', recommendationExplanation: 'Rule-based educational allocation.',
    marketDataContext: null,
    investmentOptions: null,
    projection: null,
    hasSimulatedMarket: false,
    demoKey: crypto.randomUUID(),
  }
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
