import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { applyRebalance, simulateMarket, syncPlan as saveRemotePlan } from '../services/planService'
import type { PlanProfile, SyncStatus } from '../types/plan'

type AppContextValue = {
  profile: PlanProfile
  syncStatus: SyncStatus
  syncError: string | null
  setProfile: (update: Partial<PlanProfile>) => void
  savePlan: () => Promise<boolean>
  simulateMarketMove: () => Promise<void>
  applyPortfolioRebalance: () => Promise<void>
  resetDemo: () => void
}

const initialProfile: PlanProfile = {
  name: '', income: 0, expenses: 0, emergencyFund: 0, goal: 0, years: 1, initial: 0, sip: 0,
  willingness: 0, capacity: 0, horizon: 0, riskProfile: 'Conservative',
  targetAllocation: { equity: 0, debt: 0, gold: 0, cash: 0 },
  actualAllocation: { equity: 0, debt: 0, gold: 0, cash: 0 }, portfolioValue: 0,
  hasSimulatedMarket: false,
}

const storageKey = 'finguide-demo-profile'
const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<PlanProfile>(readStoredProfile)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncError, setSyncError] = useState<string | null>(null)
  const shouldClearStorage = useRef(false)

  useEffect(() => {
    if (shouldClearStorage.current) {
      localStorage.removeItem(storageKey)
      shouldClearStorage.current = false
      return
    }
    localStorage.setItem(storageKey, JSON.stringify(profile))
  }, [profile])

  const setProfile = (update: Partial<PlanProfile>) => {
    setProfileState((current) => ({ ...current, ...update }))
  }

  const savePlan = async () => {
    setSyncStatus('syncing')
    setSyncError(null)
    try {
      const remotePlan = await saveRemotePlan(profile)
      setProfileState((current) => ({ ...current, ...remotePlan }))
      setSyncStatus('synced')
      return true
    } catch {
      setSyncStatus('offline')
      setSyncError('Your plan is saved in this browser. Start the API and PostgreSQL to persist it to the database.')
      return false
    }
  }

  const simulateMarketMove = async () => {
    if (!profile.portfolioId) { setSyncStatus('offline'); setSyncError('Save an onboarding plan before simulating the market.'); return }
    try {
      const remotePortfolio = await simulateMarket(profile.portfolioId)
      setProfileState((current) => ({ ...current, ...remotePortfolio, hasSimulatedMarket: true }))
      setSyncStatus('synced')
    } catch {
      setSyncStatus('offline')
      setSyncError('Market movement is shown locally because the API is unavailable.')
    }
  }

  const applyPortfolioRebalance = async () => {
    if (!profile.portfolioId) { setSyncStatus('offline'); setSyncError('Save an onboarding plan before rebalancing.'); return }
    try {
      const remotePortfolio = await applyRebalance(profile.portfolioId)
      setProfileState((current) => ({ ...current, ...remotePortfolio, hasSimulatedMarket: false }))
      setSyncStatus('synced')
    } catch {
      setSyncStatus('offline')
      setSyncError('The rebalance is shown locally because the API is unavailable.')
    }
  }

  const value = useMemo(() => ({
    profile,
    syncStatus,
    syncError,
    setProfile,
    savePlan,
    simulateMarketMove,
    applyPortfolioRebalance,
    resetDemo: () => {
      shouldClearStorage.current = true
      setProfileState(initialProfile)
      setSyncStatus('idle')
      setSyncError(null)
    },
  }), [profile, syncStatus, syncError])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function readStoredProfile(): PlanProfile {
  try {
    return { ...initialProfile, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }
  } catch {
    return initialProfile
  }
}

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
