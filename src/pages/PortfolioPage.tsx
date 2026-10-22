import { useNavigate } from 'react-router-dom'
import { AllocationDonut } from '../components/Allocation'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { colors, labels, type Allocation } from '../data/demo'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

export function PortfolioPage() {
  const { profile, simulateMarketMove } = useApp()
  const navigate = useNavigate()
  const targetAllocation = profile.targetAllocation

  return <>
    <Topbar eyebrow="PORTFOLIO MANAGEMENT" title="A plan that stays aligned." action={!profile.hasSimulatedMarket ? <Button onClick={() => void simulateMarketMove()}>Simulate market movement</Button> : <Button onClick={() => navigate('/portfolio/rebalance')}>Review rebalance →</Button>} />
    <section className="portfolio-grid">
      <div className="card allocation-compare">
        <div className="card-title"><div><p className="eyebrow">ALLOCATION HEALTH</p><h2>{profile.hasSimulatedMarket ? 'A little off course' : 'Right where it should be'}</h2></div><span className={`status ${profile.hasSimulatedMarket ? 'warning' : ''}`}>{profile.hasSimulatedMarket ? 'Needs review' : 'On target'}</span></div>
        <div className="compare-content"><div><p>Target mix</p><AllocationDonut allocation={targetAllocation} size={148} /></div><div className="comparison-arrow">→</div><div><p>Current mix</p><AllocationDonut allocation={profile.actualAllocation} size={148} /></div></div>
        <AllocationTable target={targetAllocation} actual={profile.actualAllocation} />
      </div>
      <div className="card activity-card"><p className="eyebrow">RECENT ACTIVITY</p><Activity date="1 Sep" icon="₹" title="Monthly contribution added" description={`${formatINR(profile.sip)} spread across your target allocation`} amount={`+${formatINR(profile.sip)}`} /><Activity date="22 Aug" icon="↗" title="Portfolio value updated" description="Illustrative daily market movement" amount="+₹2,140" positive /></div>
    </section>
  </>
}

function AllocationTable({ target, actual }: { target: Allocation; actual: Allocation }) {
  return <div className="allocation-table">
    {(Object.keys(target) as (keyof Allocation)[]).map((asset) => {
      const drift = actual[asset] - target[asset]
      return <div key={asset}><span><i style={{ background: colors[asset] }} />{labels[asset]}</span><strong>{target[asset]}%</strong><b className={drift ? 'drift' : ''}>{actual[asset]}%</b><small>{drift ? `${drift > 0 ? '+' : ''}${drift}% drift` : 'On target'}</small></div>
    })}
  </div>
}

function Activity({ date, icon, title, description, amount, positive = false }: { date: string; icon: string; title: string; description: string; amount: string; positive?: boolean }) {
  return <div className="activity"><span>{date}</span><i>{icon}</i><div><strong>{title}</strong><small>{description}</small></div><b className={positive ? 'positive' : ''}>{amount}</b></div>
}
