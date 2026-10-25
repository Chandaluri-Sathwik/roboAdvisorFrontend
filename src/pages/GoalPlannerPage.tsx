import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { formatINR } from '../lib/finance'
import { getProjections } from '../services/planService'
import { useApp } from '../store/AppContext'
import type { ProjectionScenario } from '../types/plan'

export function GoalPlannerPage() {
  const { profile, setProfile, savePlan, syncStatus, syncError } = useApp()
  const [projection, setProjection] = useState<ProjectionScenario | null>(profile.projection)
  const [projectionError, setProjectionError] = useState<string | null>(null)
  const [isLoadingProjection, setIsLoadingProjection] = useState(false)
  const contribution = profile.investmentType === 'one_time' ? profile.initial : profile.sip

  useEffect(() => {
    if (!profile.investmentType || contribution <= 0 || profile.years < 1) {
      setProjection(null)
      setProjectionError(null)
      return
    }
    let isCurrent = true
    setIsLoadingProjection(true)
    setProjectionError(null)
    void getProjections(profile)
      .then((result) => { if (isCurrent) setProjection(result) })
      .catch((error: unknown) => {
        if (!isCurrent) return
        setProjection(null)
        setProjectionError(error instanceof Error ? error.message : 'Could not calculate the projection.')
      })
      .finally(() => { if (isCurrent) setIsLoadingProjection(false) })
    return () => { isCurrent = false }
  }, [profile.investmentType, profile.initial, profile.sip, profile.years, profile.expectedReturnPercent])

  const updateContribution = (amount: number) => setProfile(
    profile.investmentType === 'one_time' ? { initial: amount } : { sip: amount },
  )

  return <>
    <Topbar eyebrow="YOUR PLAN" title="Explore your return assumption." action={<Button variant="secondary" onClick={() => void savePlan()}>{syncStatus === 'syncing' ? 'Saving…' : 'Save changes'}</Button>} />
    <section className="planner-grid">
      <div className="card planner-form">
        <p className="eyebrow">{profile.goalType.replaceAll('_', ' ').toUpperCase()}</p>
        <h2>Adjust your plan</h2>
        <p>Choose one contribution mode. The annual return assumption drives the illustration and guides the historical portfolio analysis within your risk cap; it is not a forecast.</p>
        <label>Contribution mode
          <select value={profile.investmentType} onChange={(event) => {
            const investmentType = event.target.value as 'one_time' | 'monthly'
            setProfile({ investmentType })
          }}>
            <option value="one_time">One-time investment</option>
            <option value="monthly">Monthly investment</option>
          </select>
        </label>
        <label>{profile.investmentType === 'one_time' ? 'One-time amount (INR)' : 'Monthly amount (INR)'} <output>{formatINR(contribution)}</output>
          <input type="number" min="0.01" step="0.01" value={contribution} onChange={(event) => updateContribution(Number(event.target.value))} />
        </label>
        <label>Investment horizon (years) <output>{profile.years} years</output>
          <input type="number" min="1" max="100" step="1" value={profile.years} onChange={(event) => setProfile({ years: Number(event.target.value) })} />
        </label>
        <label>Expected annual return assumption (%) <output>{profile.expectedReturnPercent}%</output>
          <input type="number" min="0" max="100" step="0.1" value={profile.expectedReturnPercent} onChange={(event) => setProfile({ expectedReturnPercent: Number(event.target.value) })} />
        </label>
      </div>
      <div className="planner-output">
        {projectionError && <p className="form-error" role="alert">{projectionError}</p>}
        {syncStatus === 'offline' && syncError && <p className="form-error" role="alert">{syncError}</p>}
        <div className="card projection-card">
          <p className="eyebrow">ILLUSTRATIVE VALUE · {profile.expectedReturnPercent}% ASSUMED ANNUAL RETURN</p>
          <h2>{isLoadingProjection ? 'Calculating…' : projection ? formatINR(projection.future_value, true) : '—'}</h2>
          <p>Illustrative value after {profile.years} years</p>
          <div className="projection-labels">
            <span>Total contributions<br /><strong>{projection ? formatINR(projection.total_contributions, true) : '—'}</strong></span>
            <span>Illustrative growth<br /><strong>{projection ? formatINR(projection.estimated_growth, true) : '—'}</strong></span>
          </div>
          <p className="disclaimer">{projection?.disclaimer ?? 'Calculated by the backend using monthly compounding and end-of-month contributions.'}</p>
        </div>
      </div>
    </section>
  </>
}
