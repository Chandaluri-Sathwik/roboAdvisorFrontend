import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AllocationDonut, AllocationLegend } from '../components/Allocation'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return <div className="card metric"><p className="eyebrow">{label}</p><h3>{value}</h3><span>{sub}</span></div>
}

export function DashboardPage() {
  const { profile, resetDemo, savePlan, syncError, syncStatus } = useApp()
  const navigate = useNavigate()
  const portfolioRefreshAttempted = useRef(false)

  useEffect(() => {
    if (!profile.goalId || !profile.investmentType || portfolioRefreshAttempted.current
      || syncStatus === 'restoring' || syncStatus === 'syncing') return
    if (Array.isArray(profile.investmentOptions?.illustrative_portfolios)) return
    portfolioRefreshAttempted.current = true
    void savePlan()
  }, [profile.goalId, profile.investmentOptions, profile.investmentType, savePlan, syncStatus])

  const resetForNextPerson = () => {
    const confirmed = window.confirm(
      'Start a blank demo on this browser? This clears the browser copy. The saved MongoDB demo record is retained and is not deleted.',
    )
    if (!confirmed) return
    resetDemo()
    navigate('/onboarding')
  }

  return <>
    <Topbar eyebrow={`DEMO PLAN OVERVIEW · ${profile.name.toUpperCase()}`} title="Illustrative plan summary" action={<Button variant="secondary" onClick={resetForNextPerson}>Start a new demo</Button>} />
    {syncStatus === 'syncing' && <p className="sync-note" role="status">Refreshing your saved plan to generate portfolio examples…</p>}
    {syncStatus === 'offline' && syncError && <p className="form-error" role="alert">{syncError}</p>}
    <section className="dashboard-grid">
      <div className="dashboard-primary">
        <div className="metric-grid"><Metric label="INVESTMENT HORIZON" value={`${profile.years} years`} sub={profile.goalType.replaceAll('_', ' ')} /><Metric label="EXPECTED RETURN ASSUMPTION" value={`${profile.expectedReturnPercent}%`} sub="Scenario input, not a promise" /><Metric label="TOTAL CONTRIBUTIONS" value={formatINR(profile.projection?.total_contributions ?? 0, true)} sub="Over the selected horizon" /></div>
        <div className="card goal-card"><div>
          <p className="eyebrow">{profile.goalType.replaceAll('_', ' ').toUpperCase() || 'YOUR PLAN'}</p><h3>{profile.riskProfile} risk profile</h3><p>Your plan uses a {profile.investmentType === 'one_time' ? 'one-time investment' : 'monthly contribution'} of {formatINR(profile.investmentType === 'one_time' ? profile.initial : profile.sip)}. <button onClick={() => navigate(`/goals/${profile.goalId ?? 'demo'}`)}>Adjust plan assumptions →</button></p></div><div className="goal-mark">{profile.years}<br /><small>years</small></div></div>
      </div>
      <aside className="dashboard-side">
        <div className="card allocation-card-full">
          <div className="card-title"><div><p className="eyebrow">CONTRIBUTION BREAKDOWN</p><h3>Where your money goes</h3></div></div>
          <div className="allocation-visual compact">
            <AllocationDonut allocation={profile.targetAllocation} size={128} />
            <AllocationLegend
              allocation={profile.targetAllocation}
              contributionAmount={profile.investmentType === 'one_time' ? profile.initial : profile.sip}
              contributionLabel={profile.investmentType === 'one_time' ? 'one-time' : '/ month'}
            />
          </div>
        </div>
        <div className="card next-card"><p className="eyebrow">CONTRIBUTION PLAN</p><h3>{profile.investmentType === 'one_time' ? 'One-time investment' : 'Monthly contribution'}</h3><p><strong>{formatINR(profile.investmentType === 'one_time' ? profile.initial : profile.sip)}</strong> is the input for this educational plan.</p><button onClick={() => navigate(`/goals/${profile.goalId ?? 'demo'}`)}>View contribution plan →</button></div>
      </aside>
    </section>
  </>
}
