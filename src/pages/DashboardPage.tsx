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
  const { profile, resetDemo, syncStatus, syncError } = useApp()
  const navigate = useNavigate()
  const portfolioValue = profile.portfolioValue
  const resetForNextPerson = () => {
    resetDemo()
    navigate('/onboarding')
  }

  return <>
    <Topbar eyebrow={`GOOD MORNING, ${profile.name.toUpperCase()}`} title="Your plan is taking shape." action={<Button variant="secondary" onClick={resetForNextPerson}>Start for a new person</Button>} />
    {syncStatus !== 'idle' && <p className={`sync-notice ${syncStatus}`}>{syncStatus === 'synced' ? '✓ Saved to the API and PostgreSQL.' : syncStatus === 'syncing' ? 'Saving your plan…' : syncError}</p>}
    <section className="dashboard-grid">
      <div className="dashboard-primary">
        <div className="hero-metric card"><div><p className="eyebrow">TOTAL PORTFOLIO VALUE</p><h2>{formatINR(portfolioValue)}</h2><span className="positive">Current simulated value <small>from your portfolio API</small></span></div><div className="chart-bars">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ height: `${35 + index * 7}%` }} />)}</div></div>
        <div className="metric-grid"><Metric label="YOUR WEALTH GOAL" value={formatINR(profile.goal, true)} sub={`${profile.years} years remaining`} /><Metric label="MONTHLY CONTRIBUTION" value={formatINR(profile.sip)} sub="Next SIP: 1 September" /><Metric label="GOAL PROGRESS" value="24%" sub="You’re building momentum" /></div>
        <div className="card goal-card"><div>
          <p className="eyebrow">WEALTH CREATION</p><h3>{formatINR(profile.portfolioValue)} <span>of {formatINR(profile.goal)}</span></h3><div className="wide-progress"><i /></div><p>Your projection is calculated by the backend when you save this goal. <button onClick={() => navigate('/goals/demo')}>Explore scenarios →</button></p></div><div className="goal-mark">{profile.years}<br /><small>years</small></div></div>
      </div>
      <aside className="dashboard-side">
        <div className={`card alert-card ${profile.hasSimulatedMarket ? 'attention' : ''}`}><span>{profile.hasSimulatedMarket ? '!' : '✓'}</span><div><p className="eyebrow">{profile.hasSimulatedMarket ? 'ACTION TO REVIEW' : 'YOUR PLAN IS ON TRACK'}</p><h3>{profile.hasSimulatedMarket ? 'Your portfolio has drifted' : 'Everything is balanced'}</h3><p>{profile.hasSimulatedMarket ? 'Equity is above your target after the market simulation.' : 'Your current allocation remains close to its target mix.'}</p>{profile.hasSimulatedMarket && <button onClick={() => navigate('/portfolio/rebalance')}>Review rebalance →</button>}</div></div>
        <div className="card allocation-card-full"><div className="card-title"><div><p className="eyebrow">CURRENT ALLOCATION</p><h3>Staying diversified</h3></div><button onClick={() => navigate('/portfolio')}>Details →</button></div><div className="allocation-visual compact"><AllocationDonut allocation={profile.actualAllocation} size={128} /><AllocationLegend allocation={profile.actualAllocation} /></div></div>
        <div className="card next-card"><p className="eyebrow">UP NEXT</p><h3>Monthly contribution</h3><p><strong>{formatINR(profile.sip)}</strong> will be allocated on 1 Sep.</p><button onClick={() => navigate('/goals/demo')}>View contribution plan →</button></div>
      </aside>
    </section>
  </>
}
