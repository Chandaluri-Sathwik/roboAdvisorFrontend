import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { formatINR } from '../lib/finance'
import { labels, type Allocation } from '../data/demo'
import { useApp } from '../store/AppContext'

export function RebalancePage() {
  const { profile, applyPortfolioRebalance, syncError } = useApp()
  const navigate = useNavigate()
  const [isApplied, setIsApplied] = useState(false)
  const trades = (Object.keys(profile.targetAllocation) as (keyof Allocation)[])
    .map((asset) => {
      const targetValue = Number(profile.targetAllocation[asset] ?? 0)
      const actualValue = Number(profile.actualAllocation[asset] ?? 0)
      return {
        asset,
        value: ((targetValue - actualValue) * profile.portfolioValue) / 100,
      }
    })
    .filter((trade) => Math.abs(trade.value) >= 0.01)
  const rebalanceAmount = trades
    .filter((trade) => trade.value > 0)
    .reduce((total, trade) => total + trade.value, 0)
  const applySimulation = async () => {
    if (await applyPortfolioRebalance()) setIsApplied(true)
  }

  return <>
    <Topbar eyebrow="REBALANCE PREVIEW" title={isApplied ? 'Your plan is back in balance.' : 'Bring your plan back to balance.'} />
    <section className="rebalance-wrap">
      {isApplied ? <div className="card success-state"><div>✓</div><h2>Simulation complete</h2><p>Your portfolio's simulated allocation now matches its {profile.riskProfile} target. No real trades were placed.</p><Button onClick={() => navigate('/portfolio')}>Return to portfolio →</Button></div>
        : !profile.hasSimulatedMarket ? <div className="card success-state"><h2>No simulated drift to rebalance</h2><p>Run an illustrative market movement first. This prototype does not place trades.</p><Button onClick={() => navigate('/portfolio')}>Go to portfolio →</Button></div>
          : <>
            {syncError && <p className="form-error" role="alert">{syncError}</p>}
            <div className="card rebalance-summary"><span className="warning-mark">!</span><div><p className="eyebrow">SIMULATED DRIFT</p><h2>Review your allocation</h2><p>This preview compares your current simulated weights with the target mix. Amounts are illustrative, not orders.</p></div><div className="rebalance-amount"><span>Illustrative amount to rebalance</span><strong>{formatINR(rebalanceAmount)}</strong></div></div>
            <div className="card trade-card"><div className="card-title"><div><p className="eyebrow">ILLUSTRATIVE PREVIEW</p><h3>Allocation changes to return to target</h3></div><span className="status">Simulation only</span></div>
              {trades.length ? trades.map(({ asset, value }) => <div className="trade" key={asset}><i>{value < 0 ? '−' : '+'}</i><div><strong>{value < 0 ? 'Reduce' : 'Increase'} {labels[asset]}</strong><small>Move toward the {Number(profile.targetAllocation[asset] ?? 0)}% target weight</small></div><b>{value < 0 ? '−' : '+'}{formatINR(Math.abs(value))}</b></div>)
                : <p>Your simulated allocation is already at its target.</p>}
              <div className="trade-actions"><span>No real assets are bought or sold.</span><Button onClick={() => void applySimulation()}>Apply rebalance simulation →</Button></div>
            </div>
          </>}
    </section>
  </>
}
