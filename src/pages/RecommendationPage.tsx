import { Link, useNavigate } from 'react-router-dom'
import { AllocationDonut, AllocationLegend } from '../components/Allocation'
import { Button } from '../components/Button'
import { IllustrativePortfolios } from '../components/IllustrativePortfolios'
import { Topbar } from '../components/Topbar'
import { colors, labels, type Allocation } from '../data/demo'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

const assetClasses = Object.keys(colors) as (keyof Allocation)[]

export function RecommendationPage() {
  const { profile, savePlan, syncStatus, syncError } = useApp()
  const navigate = useNavigate()
  const allocation = profile.targetAllocation
  const options = profile.investmentOptions

  return <>
    <Topbar eyebrow="EDUCATIONAL PLAN" title="Your investment plan" action={<Button variant="secondary" onClick={() => navigate(`/goals/${profile.goalId ?? 'demo'}`)}>Edit plan</Button>} />
    {syncStatus === 'offline' && syncError && <p className="form-error" role="alert">{syncError}</p>}

    <section className="recommendation-page">
      <div className="recommendation-overview">
        <div className="card plan-summary">
          <div className="recommendation-card-heading">
            <div>
              <p className="eyebrow">YOUR {profile.riskProfile.toUpperCase()} MIX</p>
              <h2>{profile.years}-year {profile.goalType.replaceAll('_', ' ')} plan</h2>
            </div>
            <span className="plan-horizon">{profile.years} years</span>
          </div>
          <p>{profile.recommendationExplanation || 'Your allocation reflects your risk tolerance, goal and time horizon.'}</p>
          <div className="allocation-visual">
            <AllocationDonut allocation={allocation} />
            <AllocationLegend allocation={allocation} />
          </div>
          <Button disabled={syncStatus === 'syncing'} onClick={() => void savePlan()}>
            {syncStatus === 'syncing' ? 'Refreshing options…' : 'Refresh plan & options'}
          </Button>
        </div>

        <div className="card contribution-card">
          <p className="eyebrow">PLAN DETAILS</p>
          <div><span>{profile.investmentType === 'one_time' ? 'One-time amount' : 'Monthly contribution'}</span><strong>{formatINR(profile.investmentType === 'one_time' ? profile.initial : profile.sip)}</strong></div>
          <div><span>Expected annual return assumption</span><strong>{profile.expectedReturnPercent}%</strong></div>
          <div><span>Investment horizon</span><strong>{profile.years} years</strong></div>
          <hr />
          <p>Illustrative class amounts are comparisons across options; they are not split among every listed candidate.</p>
        </div>
      </div>

      <div className="card product-card recommendation-candidates">
        <div className="recommendation-section-heading">
          <div><p className="eyebrow">INVESTMENT CANDIDATES</p><h2>Explore options by asset class</h2></div>
        </div>
        <p>
          {profile.investmentType === 'monthly'
            ? 'Monthly plans show mutual-fund candidates only. Confirm each scheme’s current SIP availability and minimum with the provider.'
            : 'One-time plans show all currently verified investable candidates.'}
        </p>
        <div className="candidate-class-grid">
          {assetClasses.map((assetClass) => {
            const amount = options?.class_amounts[assetClass]
            const candidates = options?.by_asset_class[assetClass] ?? []
            const classContribution = profile.investmentType === 'one_time'
              ? amount?.one_time_investment_inr
              : amount?.monthly_contribution_inr
            return <section className="candidate-class-card" key={assetClass}>
              <div className="example-class-heading">
                <strong>{labels[assetClass]} · {allocation[assetClass]}%</strong>
                <span>{profile.investmentType === 'one_time' ? 'One-time' : 'Monthly'} class amount {formatINR(classContribution ?? 0)}</span>
              </div>
              {candidates.length ? candidates.map((candidate) => (
                <div className="product-row" key={candidate.id}>
                  <i style={{ background: colors[assetClass] }} />
                  <span>
                    <strong>{candidate.name}</strong>
                    <small>{candidate.instrument_type === 'stock' ? `${candidate.exchange ?? 'Equity'} · ${candidate.symbol}` : 'Mutual fund'}</small>
                    {candidate.latest_observation && <small>
                      {formatINR(candidate.latest_observation.value)} on {new Date(candidate.latest_observation.date).toLocaleDateString()}
                    </small>}
                    {candidate.historical_return_1y_percent != null && <small>1-year observed change: {candidate.historical_return_1y_percent}%</small>}
                    {candidate.historical_risk_metrics && <small>
                      Volatility {candidate.historical_risk_metrics.annualized_volatility_percent}% · Max drawdown {candidate.historical_risk_metrics.maximum_drawdown_percent}%
                    </small>}
                  </span>
                </div>
              )) : <p className="candidate-empty">No verified candidate is currently listed for this class.</p>}
              {assetClass === 'debt' && options?.government_security_yield_references.length ? <div className="candidate-references">
                <strong>Government-security yield references</strong>
                {options.government_security_yield_references.map((reference) => <div className="product-row" key={`${reference.symbol}-${reference.date}`}>
                  <i style={{ background: colors.debt }} />
                  <span><strong>{reference.maturity ?? reference.symbol}</strong><small>{reference.yield_percent}% indicative yield · {new Date(reference.date).toLocaleDateString()} · {reference.source}</small><small>{reference.warning}</small></span>
                </div>)}
              </div> : null}
            </section>
          })}
        </div>
        <Link className="data-notes-link" to="/data-notes">Detailed market data notes →</Link>
      </div>

      <div className="card portfolio-examples-card recommendation-portfolios">
        <div className="recommendation-section-heading">
          <div><p className="eyebrow">PORTFOLIO EXAMPLES</p><h2>Ways to combine these options</h2></div>
        </div>
        <IllustrativePortfolios
          portfolios={options?.illustrative_portfolios ?? []}
          investmentType={profile.investmentType === 'one_time' ? 'one_time' : 'monthly'}
        />
      </div>
    </section>

    <div className="sticky-cta">
      <span>For education only · Historical results are not forecasts or guarantees.</span>
      <Button onClick={() => navigate('/dashboard')}>Go to dashboard →</Button>
    </div>
  </>
}
