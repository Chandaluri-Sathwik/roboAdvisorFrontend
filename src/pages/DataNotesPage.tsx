import { Link } from 'react-router-dom'
import { Topbar } from '../components/Topbar'

const notes = [
  {
    title: 'Historical changes',
    points: [
      'The 1-year figure is an annualized change between the latest observation and an observation from about a year earlier. It is shown only when the available dates span at least 0.95 years, and it describes the past, not a forecast.',
      'For stocks, this uses observed prices and excludes dividends; corporate actions may not be reflected. It is not a total-return figure.',
      'Mutual-fund NAV changes are not personalized recommendations. Check the scheme name, category, plan and option with the fund provider. NAV changes do not include investor tax or any applicable exit load.',
    ],
  },
  {
    title: 'Risk figures',
    points: [
      'Volatility is estimated from 12 consecutive monthly returns across 13 month-end observations and annualized. It describes historical variation, not future risk.',
      'Maximum drawdown is the largest observed decline from a prior month-end high in that same period. It does not measure every possible loss.',
      'Risk figures are shown only when all 13 monthly observations are present and consecutive.',
    ],
  },
  {
    title: 'Candidate ordering and freshness',
    points: [
      'Only catalog records marked verified and investable are shown as candidates. They are educational comparisons, not buy orders or suitability recommendations.',
      'Where a usable historical change is available, candidates are ordered by how close it is to your return assumption within each asset class. This is not a likelihood estimate or suitability ranking.',
      'A price or NAV is labeled fresh when its latest stored observation is no more than 45 days old. Older or missing observations may be hidden or marked unavailable.',
    ],
  },
  {
    title: 'Other market references',
    points: [
      'Commodity-linked candidate schemes currently include Indian gold- and silver-linked mutual-fund NAVs. These are scheme observations, not MCX spot or futures prices; check each scheme’s details and current availability with its provider.',
      'RBI government-security yields are indicative references only. They do not identify a purchasable security and are not guaranteed returns or bond total returns.',
      'Commodity reference-price changes do not include futures roll yield, collateral returns, fees or INR currency effects. These references are not investable Indian portfolio holdings.',
      'All historical figures can differ materially from future results. They should not be used alone to make investment decisions.',
    ],
  },
]

export function DataNotesPage() {
  return <>
    <Topbar eyebrow="MARKET DATA NOTES" title="How to read these figures" />
    <section className="data-notes-page">
      <p className="data-notes-intro">The investment options show historical market observations for context. These notes explain how to interpret the figures and their limits.</p>
      <div className="data-notes-grid">
        {notes.map(({ title, points }) => <article className="card data-notes-card" key={title}>
          <h2>{title}</h2>
          <ul>{points.map((point) => <li key={point}>{point}</li>)}</ul>
        </article>)}
      </div>
      <Link className="data-notes-back" to="/recommendation">← Back to recommendations</Link>
    </section>
  </>
}
