import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

const proposedTrades = [
  ['Reduce equity', '–₹11,000', 'Brings equity closer to your 50% target'],
  ['Add to debt', '+₹5,000', 'Supports the stabilising side of your plan'],
  ['Add to gold', '+₹3,000', 'Restores diversification'],
  ['Add to cash', '+₹2,000', 'Rebuilds your liquid reserve'],
]

export function RebalancePage() {
  const { profile, applyPortfolioRebalance } = useApp()
  const navigate = useNavigate()
  const [isApplied, setIsApplied] = useState(false)
  const applySimulation = async () => { await applyPortfolioRebalance(); setIsApplied(true) }

  return <>
    <Topbar eyebrow="REBALANCE PREVIEW" title={isApplied ? 'Your plan is back in balance.' : 'Bring your plan back to balance.'} />
    <section className="rebalance-wrap">
      {isApplied ? <div className="card success-state"><div>✓</div><h2>Simulation complete</h2><p>Your sample allocation is again aligned with its {profile.riskProfile} target. In a real service, you would review and confirm any order before execution.</p><Button onClick={() => navigate('/portfolio')}>Return to portfolio →</Button></div> : <><div className="card rebalance-summary"><span className="warning-mark">!</span><div><p className="eyebrow">DRIFT DETECTED</p><h2>Equity moved above its target</h2><p>After the simulated market movement, your equity allocation reached 61%, which is 11 percentage points above your 50% target.</p></div><div className="rebalance-amount"><span>Amount to rebalance</span><strong>{formatINR(16159)}</strong></div></div><div className="card trade-card"><div className="card-title"><div><p className="eyebrow">ILLUSTRATIVE PROPOSAL</p><h3>Use cash flows first, then trade only what is needed</h3></div><span className="status">Simulation only</span></div>{proposedTrades.map(([title, amount, description]) => <div className="trade" key={title}><i>{amount.startsWith('–') ? '−' : '+'}</i><div><strong>{title}</strong><small>{description}</small></div><b>{amount}</b></div>)}<div className="trade-actions"><span>Nothing is executed in this educational prototype.</span><Button onClick={() => void applySimulation()}>Apply simulation →</Button></div></div></>}
    </section>
  </>
}
