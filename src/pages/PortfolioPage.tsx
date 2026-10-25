import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AllocationDonut } from '../components/Allocation'
import { Button } from '../components/Button'
import { IllustrativePortfolios } from '../components/IllustrativePortfolios'
import { Topbar } from '../components/Topbar'
import { colors, labels, type Allocation } from '../data/demo'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

export function PortfolioPage() {
  const { profile, simulateMarketMove, syncError, savePlan, syncStatus } = useApp()
  const navigate = useNavigate()
  const targetAllocation = profile.targetAllocation
  const portfolioOptions = profile.investmentOptions?.illustrative_portfolios ?? []
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(portfolioOptions[0]?.id ?? '')
  const selectedPortfolio = portfolioOptions.find((portfolio) => portfolio.id === selectedPortfolioId)
    ?? portfolioOptions[0]
  const investmentType = profile.investmentType === 'one_time' ? 'one_time' : 'monthly'
  const investmentAmount = investmentType === 'one_time' ? profile.initial : profile.sip

  useEffect(() => {
    if (portfolioOptions.length && !portfolioOptions.some((portfolio) => portfolio.id === selectedPortfolioId)) {
      setSelectedPortfolioId(portfolioOptions[0].id)
    }
  }, [portfolioOptions, selectedPortfolioId])

  return <>
    <Topbar eyebrow="PORTFOLIO MANAGEMENT" title="Your illustrative portfolio" action={<Button variant="secondary" onClick={() => navigate('/recommendation')}>Review investment options</Button>} />
    {syncError && <p className="form-error" role="alert">{syncError}</p>}
    <section className="portfolio-grid portfolio-management-grid">
      <div className="card holdings-card">
        <div className="card-title">
          <div><p className="eyebrow">PORTFOLIO HOLDINGS PLAN</p><h2>{selectedPortfolio?.name ?? 'No portfolio examples yet'}</h2></div>
          {portfolioOptions.length > 1 && <label className="portfolio-selector">Choose example
            <select value={selectedPortfolio?.id ?? ''} onChange={(event) => setSelectedPortfolioId(event.target.value)}>
              {portfolioOptions.map((portfolio) => <option value={portfolio.id} key={portfolio.id}>{portfolio.name}</option>)}
            </select>
          </label>}
        </div>
        <p className="holdings-intro">
          {selectedPortfolio
            ? `This ${profile.riskProfile.toLowerCase()}-risk example follows your target mix and divides your ${investmentType === 'one_time' ? 'one-time investment' : 'monthly contribution'} of ${formatINR(investmentAmount)} among verified candidates. It is illustrative only; nothing is purchased or scheduled.`
            : 'Save or refresh your plan to generate portfolio examples from currently verified candidates.'}
        </p>
        {selectedPortfolio ? <div className="holdings-list">
          {selectedPortfolio.holdings.map((holding) => {
            const amount = investmentType === 'one_time'
              ? holding.one_time_investment_inr
              : holding.monthly_contribution_inr
            return <article className="holding-row" key={holding.id}>
              <i style={{ background: colors[holding.asset_class] }} />
              <div className="holding-main">
                <strong>{holding.name}</strong>
                <small>{labels[holding.asset_class]} · {holding.instrument_type === 'stock' ? `NSE · ${holding.symbol}` : `Mutual fund · ${holding.symbol}`}</small>
                {holding.latest_observation && <small>
                  Latest observation: {formatINR(holding.latest_observation.value)} · {new Date(holding.latest_observation.date).toLocaleDateString()} · {holding.latest_observation.source}
                </small>}
                {holding.historical_return_1y_percent != null && <small>Observed one-year change: {holding.historical_return_1y_percent}% · {holding.return_metric_note}</small>}
                {holding.historical_risk_metrics && <small>
                  Historical annualized volatility {holding.historical_risk_metrics.annualized_volatility_percent}% · maximum month-end drawdown {holding.historical_risk_metrics.maximum_drawdown_percent}%.
                </small>}
              </div>
              <div className="holding-amount"><strong>{formatINR(amount)}</strong><small>{investmentType === 'one_time' ? 'one-time allocation' : 'per month'}</small></div>
              <b className="holding-weight">{holding.allocation_percent}%</b>
            </article>
          })}
        </div> : <Button disabled={syncStatus === 'syncing'} onClick={() => void savePlan()}>
          {syncStatus === 'syncing' ? 'Generating examples…' : 'Generate portfolio examples'}
        </Button>}
        <p className="holdings-disclaimer">Market prices and NAVs are observations, not a record of units owned. This educational plan is not a live brokerage portfolio or personalized investment advice.</p>
      </div>

      <aside className="portfolio-side">
        <div className="card allocation-compare">
          <div className="card-title"><div><p className="eyebrow">ALLOCATION HEALTH</p><h2>{profile.hasSimulatedMarket ? 'Hypothetical drift' : 'Target mix'}</h2></div><span className={`status ${profile.hasSimulatedMarket ? 'warning' : ''}`}>{profile.hasSimulatedMarket ? 'Simulated' : 'On target'}</span></div>
          <div className="compare-content"><div><p>Target mix</p><AllocationDonut allocation={targetAllocation} size={125} /></div><div className="comparison-arrow">→</div><div><p>{profile.hasSimulatedMarket ? 'Simulated mix' : 'Starting mix'}</p><AllocationDonut allocation={profile.actualAllocation} size={125} /></div></div>
          <AllocationTable target={targetAllocation} actual={profile.actualAllocation} />
          <p className="simulation-note">The mix is a model, not measured account holdings.</p>
          {!profile.hasSimulatedMarket
            ? <Button variant="secondary" onClick={() => void simulateMarketMove()}>Run hypothetical market simulation</Button>
            : <Button onClick={() => navigate('/portfolio/rebalance')}>Review simulated rebalance →</Button>}
        </div>
      </aside>
      <div className="portfolio-examples-card card">
        <p className="eyebrow">COMPARE OPTIONS</p>
        <h2>Other illustrative combinations</h2>
        {portfolioOptions.filter((portfolio) => portfolio.id !== selectedPortfolio?.id).length
          ? <IllustrativePortfolios
            portfolios={portfolioOptions.filter((portfolio) => portfolio.id !== selectedPortfolio?.id)}
            investmentType={investmentType}
          />
          : <p>No alternative combinations are available for this plan yet.</p>}
      </div>
    </section>
  </>
}

function AllocationTable({ target, actual }: { target: Record<'equity' | 'debt' | 'commodity', number>; actual: Record<'equity' | 'debt' | 'commodity', number> }) {
  return <div className="allocation-table">
    <div className="allocation-table-heading"><span>Asset class</span><strong>Target</strong><b>Current</b><small>Status</small></div>
    {(Object.keys(target) as Array<keyof typeof target>).map((asset) => {
      const targetValue = Number(target[asset] ?? 0)
      const actualValue = Number(actual[asset] ?? 0)
      const drift = Math.round((actualValue - targetValue) * 100) / 100
      return <div key={asset}><span><i style={{ background: colors[asset] }} />{labels[asset]}</span><strong>{targetValue}%</strong><b className={drift ? 'drift' : ''}>{actualValue}%</b><small>{drift ? `${drift > 0 ? '+' : ''}${drift.toFixed(2)}% drift` : 'On target'}</small></div>
    })}
  </div>
}
