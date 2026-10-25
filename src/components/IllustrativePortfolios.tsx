import { colors, labels } from '../data/demo'
import { formatINR } from '../lib/finance'
import type { IllustrativePortfolio } from '../types/plan'

export function IllustrativePortfolios({
  portfolios,
  investmentType,
}: {
  portfolios: IllustrativePortfolio[]
  investmentType: 'one_time' | 'monthly'
}) {
  if (!portfolios.length) {
    return <p>Portfolio examples are unavailable because one or more allocated classes have no verified candidates.</p>
  }

  return <div className="illustrative-portfolios">
    <p>Each example keeps your risk-based class mix and splits each class equally across up to two listed candidates. These examples are not ranked, personalized product suitability assessments, or buy instructions.</p>
    <div className="portfolio-option-grid">
      {portfolios.map((portfolio) => <article className="card portfolio-option" key={portfolio.id}>
        <p className="eyebrow">SAME RISK-BASED MIX</p>
        <h3>{portfolio.name}</h3>
        <ul>
          {portfolio.holdings.map((holding) => {
            const amount = investmentType === 'one_time'
              ? holding.one_time_investment_inr
              : holding.monthly_contribution_inr
            return <li key={`${portfolio.id}-${holding.id}`}>
              <i style={{ background: colors[holding.asset_class] }} />
              <span>
                <strong>{holding.name}</strong>
                <small>{labels[holding.asset_class]} · {holding.allocation_percent}% · {formatINR(amount)} {investmentType === 'one_time' ? 'one-time' : 'monthly'}</small>
                {holding.historical_risk_metrics && <small>
                  Volatility {holding.historical_risk_metrics.annualized_volatility_percent}% · month-end drawdown {holding.historical_risk_metrics.maximum_drawdown_percent}%.
                </small>}
              </span>
            </li>
          })}
        </ul>
      </article>)}
    </div>
  </div>
}
