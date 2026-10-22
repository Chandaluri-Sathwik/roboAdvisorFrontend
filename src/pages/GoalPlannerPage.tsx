import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { formatINR } from '../lib/finance'
import { getProjections } from '../services/planService'
import { useApp } from '../store/AppContext'
import type { ProjectionScenario } from '../types/plan'

const scenarios = [['Cautious', .06], ['Base', .09], ['Optimistic', .12]] as const

export function GoalPlannerPage() {
  const { profile, setProfile, savePlan, syncStatus } = useApp()
  const [projections, setProjections] = useState<ProjectionScenario[]>([])
  const projection = projections.find((scenario) => scenario.annual_return === .09)
  const progress = projection && profile.goal ? Math.min(100, projection.future_value / profile.goal * 100) : 0
  const updateYears = (years: number) => setProfile({ years, horizon: Math.min(100, years * 8) })

  useEffect(() => {
    if (!profile.goal || !profile.years) return
    void getProjections(profile).then(setProjections).catch(() => setProjections([]))
  }, [profile.initial, profile.sip, profile.years, profile.goal])

  return <>
    <Topbar eyebrow="YOUR GOAL" title="Shape the future you want." action={<Button variant="secondary" onClick={() => void savePlan()}>{syncStatus === 'syncing' ? 'Saving…' : 'Save changes'}</Button>} />
    <section className="planner-grid">
      <div className="card planner-form"><p className="eyebrow">WEALTH CREATION</p><h2>Adjust your plan</h2><p>See how small changes can shape your illustrated outcome.</p><label>Target amount <output>{formatINR(profile.goal)}</output><input type="range" min="1000000" max="10000000" step="100000" value={profile.goal} onChange={(event) => setProfile({ goal: Number(event.target.value) })} /></label><label>Time horizon <output>{profile.years} years</output><input type="range" min="1" max="25" value={profile.years} onChange={(event) => updateYears(Number(event.target.value))} /></label><label>Monthly contribution <output>{formatINR(profile.sip)}</output><input type="range" min="1000" max="50000" step="500" value={profile.sip} onChange={(event) => setProfile({ sip: Number(event.target.value) })} /></label><div className="initial-input"><span>Starting amount</span><input type="number" value={profile.initial} onChange={(event) => setProfile({ initial: Number(event.target.value) })} /></div></div>
      <div className="planner-output"><div className="card projection-card"><p className="eyebrow">BASE ILLUSTRATION · 9% ANNUAL RETURN</p><h2>{formatINR(projection?.future_value ?? 0, true)}</h2><p>Projected value in {profile.years} years</p><div className="projection-graphic"><i style={{ width: `${progress}%` }} /><b style={{ left: `${Math.min(progress, 94)}%` }} /></div><div className="projection-labels"><span>Today<br /><strong>{formatINR(profile.initial, true)}</strong></span><span>Target<br /><strong>{formatINR(profile.goal, true)}</strong></span></div></div><div className="scenario-grid">{scenarios.map(([name, returnRate]) => { const scenario = projections.find((item) => item.annual_return === returnRate); return <div className="card scenario" key={name}><span>{name}</span><strong>{formatINR(scenario?.future_value ?? 0, true)}</strong><small>{returnRate * 100}% illustrative return</small></div> })}</div><div className="disclaimer">Projections are calculated by the API using regular end-of-month contributions and hypothetical returns. Actual returns vary and are not guaranteed.</div></div>
    </section>
  </>
}
